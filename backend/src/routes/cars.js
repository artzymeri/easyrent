const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const db = require("../db");

router.use(authenticate);

function ensureCompanyAccess(req, res, next) {
  if (req.user.type === "admin") return next();
  const companyId = req.params.companyId || req.body.companyId;
  if (String(req.user.companyId) !== String(companyId)) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}

// ── List cars for authenticated user's company (shortcut) ────
router.get("/", async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: "No company context" });
    const cars = await db.Car.findAll({
      where: { companyId: req.user.companyId },
      include: [
        { model: db.CarImage, as: "images", attributes: ["id", "isPrimary", "sortOrder"] },
        { model: db.CarDamage, as: "damages", where: { repaired: false }, required: false },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ rows: cars, count: cars.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

// ── Create car for authenticated user's company (shortcut) ───
router.post("/", async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: "No company context" });
    const { images, ...carFields } = req.body;
    const car = await db.Car.create({
      companyId: req.user.companyId,
      ...carFields,
    });
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        await db.CarImage.create({
          carId: car.id,
          url: typeof images[i] === "string" ? images[i] : images[i].url,
          isPrimary: i === 0,
          sortOrder: i,
        });
      }
    }
    const created = await db.Car.findByPk(car.id, {
      include: [{ model: db.CarImage, as: "images" }],
    });
    res.status(201).json(created);
  } catch (err) {
    console.error("Create car error:", err);
    res.status(500).json({ error: "Failed to create car" });
  }
});

// ── List cars for a company ───────────────────────────────────
router.get("/company/:companyId", ensureCompanyAccess, async (req, res) => {
  try {
    const cars = await db.Car.findAll({
      where: { companyId: req.params.companyId },
      include: [
        { model: db.CarImage, as: "images", attributes: ["id", "isPrimary", "sortOrder"] },
        { model: db.CarDamage, as: "damages", where: { repaired: false }, required: false },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

// ── Get single car ────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const car = await db.Car.findByPk(req.params.id, {
      include: [
        { model: db.CarImage, as: "images" },
        { model: db.CarDamage, as: "damages" },
        { model: db.Company, as: "company", attributes: ["id", "name", "subdomain"] },
      ],
    });
    if (!car) return res.status(404).json({ error: "Car not found" });
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch car" });
  }
});

// ── Create car ────────────────────────────────────────────────
router.post(
  "/company/:companyId",
  ensureCompanyAccess,
  [
    body("make").notEmpty().withMessage("Make required"),
    body("model").notEmpty().withMessage("Model required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { images, ...carFields } = req.body;
      const car = await db.Car.create({
        companyId: req.params.companyId,
        ...carFields,
      });

      // Handle images if provided
      if (images && Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          await db.CarImage.create({
            carId: car.id,
            url: typeof images[i] === "string" ? images[i] : images[i].url,
            isPrimary: i === 0,
            sortOrder: i,
          });
        }
      }

      const created = await db.Car.findByPk(car.id, {
        include: [{ model: db.CarImage, as: "images" }],
      });

      res.status(201).json(created);
    } catch (err) {
      console.error("Create car error:", err);
      res.status(500).json({ error: "Failed to create car" });
    }
  }
);

// ── Update car ────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const car = await db.Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ error: "Car not found" });

    if (req.user.type !== "admin" && String(req.user.companyId) !== String(car.companyId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Separate images from car fields
    const { images, ...carFields } = req.body;
    await car.update(carFields);

    // Handle new images if provided
    if (images && Array.isArray(images)) {
      const maxOrder = await db.CarImage.max("sortOrder", { where: { carId: car.id } }) || -1;
      const hasExisting = await db.CarImage.count({ where: { carId: car.id } });
      for (let i = 0; i < images.length; i++) {
        await db.CarImage.create({
          carId: car.id,
          url: images[i],
          isPrimary: hasExisting === 0 && i === 0,
          sortOrder: maxOrder + 1 + i,
        });
      }
    }

    const updated = await db.Car.findByPk(car.id, {
      include: [{ model: db.CarImage, as: "images" }, { model: db.CarDamage, as: "damages" }],
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update car" });
  }
});

// ── Add damage to car ─────────────────────────────────────────
router.post("/:id/damages", async (req, res) => {
  try {
    const car = await db.Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ error: "Car not found" });

    const damage = await db.CarDamage.create({
      carId: car.id,
      reportedByStaffId: req.user.type === "staff" ? req.user.id : null,
      ...req.body,
    });

    res.status(201).json(damage);
  } catch (err) {
    res.status(500).json({ error: "Failed to add damage" });
  }
});

// ── Add images to car ──────────────────────────────────────────
router.post("/:id/images", async (req, res) => {
  try {
    const car = await db.Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ error: "Car not found" });

    if (req.user.type !== "admin" && String(req.user.companyId) !== String(car.companyId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { images } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "No images provided" });
    }

    // Get current max sort order
    const maxOrder = await db.CarImage.max("sortOrder", { where: { carId: car.id } }) || -1;
    const hasExisting = await db.CarImage.count({ where: { carId: car.id } });

    const created = [];
    for (let i = 0; i < images.length; i++) {
      const img = await db.CarImage.create({
        carId: car.id,
        url: images[i],
        isPrimary: hasExisting === 0 && i === 0,
        sortOrder: maxOrder + 1 + i,
      });
      created.push(img);
    }

    res.status(201).json(created);
  } catch (err) {
    console.error("Add images error:", err);
    res.status(500).json({ error: "Failed to add images" });
  }
});

// ── Delete a car image ────────────────────────────────────────
router.delete("/images/:imageId", async (req, res) => {
  try {
    const image = await db.CarImage.findByPk(req.params.imageId, {
      include: [{ model: db.Car, as: "car", attributes: ["companyId"] }],
    });
    if (!image) return res.status(404).json({ error: "Image not found" });

    if (req.user.type !== "admin" && String(req.user.companyId) !== String(image.car.companyId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const wasPrimary = image.isPrimary;
    const carId = image.carId;
    await image.destroy();

    // If deleted image was primary, make the first remaining image primary
    if (wasPrimary) {
      const next = await db.CarImage.findOne({ where: { carId }, order: [["sortOrder", "ASC"]] });
      if (next) await next.update({ isPrimary: true });
    }

    res.json({ message: "Image deleted" });
  } catch (err) {
    console.error("Delete image error:", err);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

// ── Set primary image ─────────────────────────────────────────
router.put("/images/:imageId/primary", async (req, res) => {
  try {
    const image = await db.CarImage.findByPk(req.params.imageId, {
      include: [{ model: db.Car, as: "car", attributes: ["companyId"] }],
    });
    if (!image) return res.status(404).json({ error: "Image not found" });

    if (req.user.type !== "admin" && String(req.user.companyId) !== String(image.car.companyId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Unset all, then set this one
    await db.CarImage.update({ isPrimary: false }, { where: { carId: image.carId } });
    await image.update({ isPrimary: true });

    res.json({ message: "Primary image updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update primary image" });
  }
});

// ── Delete car ────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const car = await db.Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ error: "Car not found" });

    if (req.user.type !== "admin" && String(req.user.companyId) !== String(car.companyId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    await car.destroy();
    res.json({ message: "Car deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete car" });
  }
});

module.exports = router;
