const router = require("express").Router();
const { Op, fn, col } = require("sequelize");
const db = require("../db");
const { getIO } = require("../socket");

// ── Get company by subdomain (public) ─────────────────────────
router.get("/:subdomain", async (req, res) => {
  try {
    const company = await db.Company.findOne({
      where: { subdomain: req.params.subdomain, isActive: true, websitePublished: true },
      attributes: ["id", "name", "subdomain", "logoUrl", "slogan", "email", "phone", "address", "city", "country", "currency", "websiteTemplate", "heroSlideSource", "websiteNavLinks", "websitePrimaryColor", "websiteHeroTitle", "websiteHeroSubtitle"],
    });
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  } catch (err) {
    console.error("Public company fetch error:", err);
    res.status(500).json({ error: "Failed to fetch company" });
  }
});

// ── Get available cars for a company (public) ─────────────────
router.get("/:subdomain/cars", async (req, res) => {
  try {
    const company = await db.Company.findOne({
      where: { subdomain: req.params.subdomain, isActive: true, websitePublished: true },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const cars = await db.Car.findAll({
      where: { companyId: company.id, status: { [Op.ne]: "maintenance" } },
      include: [{ model: db.CarImage, as: "images", attributes: ["id", "url", "isPrimary", "sortOrder"] }],
      attributes: ["id", "make", "model", "year", "color", "fuelType", "transmission", "seats", "dailyRate", "mileage"],
      order: [["make", "ASC"], ["model", "ASC"]],
    });
    res.json({ rows: cars, currency: company.currency });
  } catch (err) {
    console.error("Public cars fetch error:", err);
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

// ── Get booked dates for a car (public) ───────────────────────
router.get("/:subdomain/cars/:carId/booked-dates", async (req, res) => {
  try {
    const company = await db.Company.findOne({
      where: { subdomain: req.params.subdomain, isActive: true, websitePublished: true },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const car = await db.Car.findOne({
      where: { id: req.params.carId, companyId: company.id },
    });
    if (!car) return res.status(404).json({ error: "Car not found" });

    // Get all bookings except cancelled (completed bookings still occupy dates)
    const bookings = await db.Booking.findAll({
      where: {
        carId: car.id,
        status: { [Op.ne]: "cancelled" },
      },
      attributes: ["startDate", "endDate"],
    });

    // Get all pending booking requests too
    const requests = await db.BookingRequest.findAll({
      where: {
        carId: car.id,
        status: "pending",
      },
      attributes: ["startDate", "endDate"],
    });

    // Combine into booked date ranges (normalize to date-only for client calendar)
    const toDateOnly = (d) => {
      const dt = new Date(d);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    };
    const bookedRanges = [
      ...bookings.map((b) => ({ start: toDateOnly(b.startDate), end: toDateOnly(b.endDate) })),
      ...requests.map((r) => ({ start: toDateOnly(r.startDate), end: toDateOnly(r.endDate) })),
    ];

    res.json({ bookedRanges, dailyRate: car.dailyRate });
  } catch (err) {
    console.error("Public booked dates fetch error:", err);
    res.status(500).json({ error: "Failed to fetch booked dates" });
  }
});

// ── Submit a booking request (public) ─────────────────────────
router.post("/:subdomain/booking-requests", async (req, res) => {
  try {
    const company = await db.Company.findOne({
      where: { subdomain: req.params.subdomain, isActive: true, websitePublished: true },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const { carId, startDate, endDate, firstName, lastName, email, phone } = req.body;

    if (!carId || !startDate || !endDate || !firstName || !lastName || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const car = await db.Car.findOne({
      where: { id: carId, companyId: company.id },
    });
    if (!car) return res.status(404).json({ error: "Car not found" });

    // Normalize to date-only for overlap comparison (strip time component)
    const startDateOnly = startDate.substring(0, 10);
    const endDateOnly = endDate.substring(0, 10);

    // Check for conflicting bookings using the correct overlap formula:
    // Two ranges [A.start, A.end] and [B.start, B.end] overlap iff A.start <= B.end AND A.end >= B.start
    const conflicting = await db.Booking.findOne({
      where: {
        carId,
        status: { [Op.ne]: "cancelled" },
        [Op.and]: [
          db.sequelize.where(fn("DATE", col("start_date")), { [Op.lte]: endDateOnly }),
          db.sequelize.where(fn("DATE", col("end_date")), { [Op.gte]: startDateOnly }),
        ],
      },
    });
    if (conflicting) {
      return res.status(409).json({ error: "Car is not available for the selected dates" });
    }

    // Check for conflicting pending requests
    const conflictingRequest = await db.BookingRequest.findOne({
      where: {
        carId,
        status: "pending",
        [Op.and]: [
          db.sequelize.where(fn("DATE", col("start_date")), { [Op.lte]: endDateOnly }),
          db.sequelize.where(fn("DATE", col("end_date")), { [Op.gte]: startDateOnly }),
        ],
      },
    });
    if (conflictingRequest) {
      return res.status(409).json({ error: "These dates are already requested by someone else" });
    }

    const start = new Date(startDateOnly);
    const end = new Date(endDateOnly);
    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const dailyRate = parseFloat(car.dailyRate);
    const totalAmount = totalDays * dailyRate;

    const request = await db.BookingRequest.create({
      companyId: company.id,
      carId,
      startDate,
      endDate,
      totalDays,
      dailyRate,
      totalAmount,
      requesterFirstName: firstName,
      requesterLastName: lastName,
      requesterEmail: email || null,
      requesterPhone: phone,
      status: "pending",
    });

    // Notify staff in real-time
    const io = getIO();
    if (io) {
      io.to(`company-${company.id}`).emit("booking-request-change", { type: "new", id: request.id });
    }

    res.status(201).json({ message: "Booking request submitted", id: request.id });
  } catch (err) {
    console.error("Public booking request error:", err);
    res.status(500).json({ error: "Failed to submit booking request" });
  }
});

// ── Get website slides (public) ───────────────────────────────
router.get("/:subdomain/slides", async (req, res) => {
  try {
    const company = await db.Company.findOne({
      where: { subdomain: req.params.subdomain, isActive: true, websitePublished: true },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const slides = await db.WebsiteSlide.findAll({
      where: { companyId: company.id, isActive: true },
      order: [["sortOrder", "ASC"]],
      attributes: ["id", "title", "subtitle", "imageUrl", "buttonText", "buttonLink", "sortOrder"],
    });

    // If no custom slides and source includes cars, generate from car images
    if (slides.length === 0 || company.heroSlideSource === "cars" || company.heroSlideSource === "both") {
      const carSlides = [];
      if (company.heroSlideSource === "cars" || (company.heroSlideSource === "both") || slides.length === 0) {
        const cars = await db.Car.findAll({
          where: { companyId: company.id, status: { [Op.ne]: "maintenance" } },
          include: [{ model: db.CarImage, as: "images", attributes: ["url", "isPrimary"], limit: 1, order: [["isPrimary", "DESC"]] }],
          attributes: ["id", "make", "model", "dailyRate"],
          limit: 10,
        });
        for (const car of cars) {
          const img = car.images?.[0];
          if (img) {
            carSlides.push({
              id: `car-${car.id}`,
              title: `${car.make} ${car.model}`,
              subtitle: `Starting from ${car.dailyRate}/day`,
              imageUrl: img.url,
              buttonText: "Book Now",
              buttonLink: "#cars",
            });
          }
        }
      }
      if (company.heroSlideSource === "cars") return res.json(carSlides);
      if (company.heroSlideSource === "both") return res.json([...slides, ...carSlides]);
      if (slides.length === 0) return res.json(carSlides);
    }

    res.json(slides);
  } catch (err) {
    console.error("Public slides fetch error:", err);
    res.status(500).json({ error: "Failed to fetch slides" });
  }
});

// ── Get website page (public) ─────────────────────────────────
router.get("/:subdomain/pages/:slug", async (req, res) => {
  try {
    const company = await db.Company.findOne({
      where: { subdomain: req.params.subdomain, isActive: true, websitePublished: true },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const page = await db.WebsitePage.findOne({
      where: { companyId: company.id, slug: req.params.slug, isPublished: true },
    });
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  } catch (err) {
    console.error("Public page fetch error:", err);
    res.status(500).json({ error: "Failed to fetch page" });
  }
});

// ── Get blog posts (public) ───────────────────────────────────
router.get("/:subdomain/blog", async (req, res) => {
  try {
    const company = await db.Company.findOne({
      where: { subdomain: req.params.subdomain, isActive: true, websitePublished: true },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const posts = await db.BlogPost.findAll({
      where: { companyId: company.id, isPublished: true },
      attributes: ["id", "title", "slug", "excerpt", "coverImageUrl", "authorName", "publishedAt"],
      order: [["publishedAt", "DESC"]],
    });
    res.json(posts);
  } catch (err) {
    console.error("Public blog fetch error:", err);
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

// ── Get single blog post (public) ─────────────────────────────
router.get("/:subdomain/blog/:slug", async (req, res) => {
  try {
    const company = await db.Company.findOne({
      where: { subdomain: req.params.subdomain, isActive: true, websitePublished: true },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const post = await db.BlogPost.findOne({
      where: { companyId: company.id, slug: req.params.slug, isPublished: true },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error("Public blog post fetch error:", err);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

module.exports = router;
