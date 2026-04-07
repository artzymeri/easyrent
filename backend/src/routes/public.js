const router = require("express").Router();
const db = require("../db");

// ── Get company by subdomain (public) ─────────────────────────
router.get("/:subdomain", async (req, res) => {
  try {
    const company = await db.Company.findOne({
      where: { subdomain: req.params.subdomain, isActive: true, websitePublished: true },
      attributes: ["id", "name", "subdomain", "logoUrl", "email", "phone", "address", "city", "country", "currency", "websiteTemplate"],
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

module.exports = router;
