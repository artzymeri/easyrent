const router = require("express").Router();
const { body } = require("express-validator");
const { Op } = require("sequelize");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const QRCode = require("qrcode");
const db = require("../db");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

router.use(authenticate);

function ensureCompanyAccess(req, res, next) {
  if (req.user.type === "admin") return next();
  const companyId = req.params.companyId || req.body.companyId;
  if (String(req.user.companyId) !== String(companyId)) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}

// ── AI: Extract car data from registration document images ───
router.post("/scan-document", async (req, res) => {
  try {
    const { image } = req.body; // base64 data URI
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "AI service not configured" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an expert at reading vehicle registration documents (Car Cards / Letërnjoftim i Automjetit) from Kosovo and other European countries.

Extract the following information from the document image and return ONLY a valid JSON object:
{
  "usable": boolean (false if the image is NOT a vehicle registration document or is too blurry to read),
  "licensePlate": string or null (field A - registration number, e.g., "01-175-IM"),
  "make": string or null (field D.1 - vehicle manufacturer/brand, e.g., "Toyota", "BMW", "Mercedes-Benz"),
  "model": string or null (field D.3 - commercial name/model, e.g., "Avensis", "320d", "E-Class"),
  "variant": string or null (field D.2 - type/variant if available, e.g., "T25", "F30"),
  "year": string or null (field S or B - year of manufacture or first registration, just the year like "2008"),
  "vin": string or null (field E - Vehicle Identification Number, 17 characters),
  "engineCapacity": string or null (field P - engine capacity in cc, e.g., "1998"),
  "enginePower": string or null (field P.2 - power in kW, e.g., "93"),
  "fuelType": string or null (field P.3 - fuel type: "benzinë"/"gasoline", "dizel"/"diesel", "elektrik"/"electric", "hibrid"/"hybrid", "lpg"/"gaz"),
  "colorName": string or null (field R - color in original language, e.g., "E HIRTË METALIKE", "E BARDHË"),
  "seats": string or null (field S.1 - number of seats if visible),
  "registrationDate": string or null (field I - date of registration in YYYY-MM-DD format),
  "ownerName": string or null (field C.2 - owner name if visible)
}

Important rules:
- Set "usable" to false if this is NOT a vehicle registration document or if it's too blurry/unclear
- For VIN, be very careful with similar characters: 0/O, 1/I, 5/S, 8/B
- For dates, convert to YYYY-MM-DD format (e.g., "21.04.2022" → "2022-04-21")
- For Kosovo documents, fields are labeled A, B, C, D.1, D.2, D.3, E, I, P, P.2, P.3, R, S, etc.
- Extract the model from field D.3 (Commercial name), not D.2 (Type/Variant)
- Return ONLY the JSON object, no markdown, no explanation`,
              },
              {
                type: "image_url",
                image_url: { url: image },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("OpenRouter API error:", response.status, errBody);
      return res.status(502).json({ error: "AI service request failed" });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response (strip markdown fences if present)
    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch (parseErr) {
      console.error("Failed to parse AI response:", content);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    res.json(parsed);
  } catch (err) {
    console.error("Scan document error:", err);
    res.status(500).json({ error: "Failed to scan document" });
  }
});

// ── Get all available car colors ──────────────────────────────
router.get("/colors", async (req, res) => {
  try {
    const colors = await db.CarColor.findAll({
      order: [["sortOrder", "ASC"]],
    });
    res.json(colors);
  } catch (err) {
    console.error("Fetch car colors error:", err);
    res.status(500).json({ error: "Failed to fetch car colors" });
  }
});

// ── List cars for authenticated user's company (shortcut) ────
router.get("/", async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: "No company context" });
    
    const { search, status, fuelType, transmission, make, color, sortBy = "createdAt", sortOrder = "DESC", page = 1, limit = 50 } = req.query;
    
    // Build where clause
    const where = { companyId: req.user.companyId };
    
    // Search filter
    if (search) {
      where[Op.or] = [
        { make: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
        { licensePlate: { [Op.like]: `%${search}%` } },
        { color: { [Op.like]: `%${search}%` } },
      ];
    }
    
    // Status filter
    if (status) {
      where.status = status;
    }
    
    // Fuel type filter
    if (fuelType) {
      where.fuelType = fuelType;
    }
    
    // Transmission filter
    if (transmission) {
      where.transmission = transmission;
    }
    
    // Make filter
    if (make) {
      where.make = make;
    }
    
    // Color filter - support both colorId and legacy color string
    if (color) {
      // Check if it's a numeric ID or a string
      if (!isNaN(parseInt(color))) {
        where.colorId = parseInt(color);
      } else {
        where.color = color;
      }
    }
    
    // Build order clause
    const validSortFields = ["createdAt", "make", "model", "dailyRate", "mileage", "status"];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder === "ASC" ? "ASC" : "DESC";
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { rows, count } = await db.Car.findAndCountAll({
      where,
      include: [
        { model: db.CarImage, as: "images", attributes: ["id", "isPrimary", "sortOrder"] },
        { model: db.CarDamage, as: "damages", where: { repaired: false }, required: false },
        { model: db.CarDocument, as: "documents", attributes: ["id", "name", "type"] },
        { model: db.CarColor, as: "carColor" },
      ],
      order: [[orderField, orderDir]],
      limit: parseInt(limit),
      offset,
    });
    
    // Get distinct values for filter dropdowns
    const makes = await db.Car.findAll({
      where: { companyId: req.user.companyId },
      attributes: [[db.sequelize.fn("DISTINCT", db.sequelize.col("make")), "make"]],
      raw: true,
    });
    
    // Get all available car colors for filter dropdown
    const carColors = await db.CarColor.findAll({
      order: [["sortOrder", "ASC"]],
      raw: true,
    });
    
    // Also get legacy colors that haven't been migrated yet
    const legacyColors = await db.Car.findAll({
      where: { 
        companyId: req.user.companyId, 
        color: { [Op.not]: null, [Op.ne]: "" },
        colorId: null,
      },
      attributes: [[db.sequelize.fn("DISTINCT", db.sequelize.col("color")), "color"]],
      raw: true,
    });
    
    const fuelTypes = await db.Car.findAll({
      where: { companyId: req.user.companyId, fuelType: { [Op.not]: null, [Op.ne]: "" } },
      attributes: [[db.sequelize.fn("DISTINCT", db.sequelize.col("fuel_type")), "fuelType"]],
      raw: true,
    });
    const transmissions = await db.Car.findAll({
      where: { companyId: req.user.companyId, transmission: { [Op.not]: null, [Op.ne]: "" } },
      attributes: [[db.sequelize.fn("DISTINCT", db.sequelize.col("transmission")), "transmission"]],
      raw: true,
    });
    
    res.json({
      rows,
      count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      filters: {
        makes: makes.map((m) => m.make).filter(Boolean),
        colors: legacyColors.map((c) => c.color).filter(Boolean),
        carColors: carColors, // New structured colors with id, code, nameEn, nameSq, hex
        fuelTypes: fuelTypes.map((f) => f.fuelType).filter(Boolean),
        transmissions: transmissions.map((t) => t.transmission).filter(Boolean),
        statuses: ["available", "rented", "maintenance"],
      },
    });
  } catch (err) {
    console.error("Fetch cars error:", err);
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

// ── Create car for authenticated user's company (shortcut) ───
router.post("/", async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: "No company context" });
    const { images, documents, ...carFields } = req.body;
    const car = await db.Car.create({
      companyId: req.user.companyId,
      ...carFields,
    });
    // Generate QR code
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4345";
    const qrUrl = `${frontendUrl}/qr/${car.id}`;
    const qrBase64 = await QRCode.toDataURL(qrUrl, { width: 300, margin: 2 });
    await car.update({ qrCode: qrBase64 });
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
    if (documents && Array.isArray(documents)) {
      for (let i = 0; i < documents.length; i++) {
        await db.CarDocument.create({
          carId: car.id,
          name: documents[i].name || `Document ${i + 1}`,
          url: documents[i].url,
          type: documents[i].type || null,
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
        { model: db.CarColor, as: "carColor" },
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
        { model: db.CarDocument, as: "documents" },
        { model: db.Company, as: "company", attributes: ["id", "name", "subdomain"] },
        { model: db.CarColor, as: "carColor" },
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
      const { images, documents, ...carFields } = req.body;
      const car = await db.Car.create({
        companyId: req.params.companyId,
        ...carFields,
      });
      // Generate QR code
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4345";
      const qrUrl = `${frontendUrl}/qr/${car.id}`;
      const qrBase64 = await QRCode.toDataURL(qrUrl, { width: 300, margin: 2 });
      await car.update({ qrCode: qrBase64 });

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
      // Handle documents if provided
      if (documents && Array.isArray(documents)) {
        for (let i = 0; i < documents.length; i++) {
          await db.CarDocument.create({
            carId: car.id,
            name: documents[i].name || `Document ${i + 1}`,
            url: documents[i].url,
            type: documents[i].type || null,
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

    // Separate images and documents from car fields
    const { images, documents, ...carFields } = req.body;
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

    // Handle new documents if provided
    if (documents && Array.isArray(documents)) {
      const maxDocOrder = await db.CarDocument.max("sortOrder", { where: { carId: car.id } }) || -1;
      for (let i = 0; i < documents.length; i++) {
        await db.CarDocument.create({
          carId: car.id,
          name: documents[i].name || `Document ${i + 1}`,
          url: documents[i].url,
          type: documents[i].type || null,
          sortOrder: maxDocOrder + 1 + i,
        });
      }
    }

    const updated = await db.Car.findByPk(car.id, {
      include: [{ model: db.CarImage, as: "images" }, { model: db.CarDamage, as: "damages" }, { model: db.CarDocument, as: "documents" }],
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

// ── Reorder car images ────────────────────────────────────────
router.put("/:id/images/reorder", async (req, res) => {
  try {
    const car = await db.Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ error: "Car not found" });

    if (req.user.type !== "admin" && String(req.user.companyId) !== String(car.companyId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { imageIds } = req.body;
    if (!imageIds || !Array.isArray(imageIds)) {
      return res.status(400).json({ error: "imageIds array is required" });
    }

    for (let i = 0; i < imageIds.length; i++) {
      await db.CarImage.update({ sortOrder: i }, { where: { id: imageIds[i], carId: car.id } });
    }

    res.json({ message: "Image order updated" });
  } catch (err) {
    console.error("Reorder images error:", err);
    res.status(500).json({ error: "Failed to reorder images" });
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

// ── Delete a car document ──────────────────────────────────────
router.delete("/documents/:documentId", async (req, res) => {
  try {
    const doc = await db.CarDocument.findByPk(req.params.documentId, {
      include: [{ model: db.Car, as: "car", attributes: ["companyId"] }],
    });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (req.user.type !== "admin" && String(req.user.companyId) !== String(doc.car.companyId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    await doc.destroy();
    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error("Delete document error:", err);
    res.status(500).json({ error: "Failed to delete document" });
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
