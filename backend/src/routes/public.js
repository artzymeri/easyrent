const router = require("express").Router();
const { Op } = require("sequelize");
const db = require("../db");
const { getIO } = require("../socket");

// ── Get company by subdomain (public) ─────────────────────────
router.get("/:subdomain", async (req, res) => {
  try {
    const company = await db.Company.findOne({
      where: { subdomain: req.params.subdomain, isActive: true, websitePublished: true },
      attributes: ["id", "name", "subdomain", "logoUrl", "slogan", "email", "phone", "address", "city", "country", "currency", "websiteTemplate"],
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
      where: { companyId: company.id, status: "available" },
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

    // Get all active bookings (not completed/cancelled)
    const bookings = await db.Booking.findAll({
      where: {
        carId: car.id,
        status: { [Op.notIn]: ["completed", "cancelled"] },
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

    // Combine into booked date ranges
    const bookedRanges = [
      ...bookings.map((b) => ({ start: b.startDate, end: b.endDate })),
      ...requests.map((r) => ({ start: r.startDate, end: r.endDate })),
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

    // Check for conflicting bookings
    const conflicting = await db.Booking.findOne({
      where: {
        carId,
        status: { [Op.notIn]: ["completed", "cancelled"] },
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
          { [Op.and]: [{ startDate: { [Op.lte]: startDate } }, { endDate: { [Op.gte]: endDate } }] },
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
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
          { [Op.and]: [{ startDate: { [Op.lte]: startDate } }, { endDate: { [Op.gte]: endDate } }] },
        ],
      },
    });
    if (conflictingRequest) {
      return res.status(409).json({ error: "These dates are already requested by someone else" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
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

module.exports = router;
