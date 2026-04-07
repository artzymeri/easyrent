const router = require("express").Router();
const bcrypt = require("bcrypt");
const { body, param } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");
const db = require("../db");

// All routes require super_admin
router.use(authenticate, authorize("super_admin"));

// ── List all companies ────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const companies = await db.Company.findAll({
      include: [
        { model: db.Staff, as: "staff", attributes: ["id", "firstName", "lastName", "email", "role", "isActive"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(companies);
  } catch (err) {
    console.error("List companies error:", err);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

// ── Get single company ────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const company = await db.Company.findByPk(req.params.id, {
      include: [
        { model: db.Staff, as: "staff", attributes: { exclude: ["password"] } },
        { model: db.Car, as: "cars", include: [{ model: db.CarImage, as: "images" }] },
      ],
    });
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch company" });
  }
});

// ── Create company (onboarding – step 1) ──────────────────────
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Company name required"),
    body("subdomain")
      .notEmpty()
      .matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/)
      .withMessage("Subdomain must be lowercase alphanumeric with optional hyphens"),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, subdomain, email, phone, address, city, country } = req.body;

      // Check subdomain uniqueness
      const existing = await db.Company.findOne({ where: { subdomain } });
      if (existing) {
        return res.status(409).json({ error: "Subdomain already taken" });
      }

      const company = await db.Company.create({
        name,
        subdomain,
        email,
        phone,
        address,
        city,
        country,
      });

      res.status(201).json(company);
    } catch (err) {
      console.error("Create company error:", err);
      res.status(500).json({ error: "Failed to create company" });
    }
  }
);

// ── Update company ────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const company = await db.Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const { name, email, phone, address, city, country, isActive, logoUrl, websiteTemplate, websitePublished } = req.body;
    const updateData = { name, email, phone, address, city, country, isActive };
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (websiteTemplate !== undefined) updateData.websiteTemplate = websiteTemplate;
    if (websitePublished !== undefined) updateData.websitePublished = websitePublished;
    await company.update(updateData);

    res.json(company);
  } catch (err) {
    res.status(500).json({ error: "Failed to update company" });
  }
});

// ── Upload company logo (URL for now) ─────────────────────────
router.put("/:id/logo", async (req, res) => {
  try {
    const company = await db.Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ error: "Company not found" });

    await company.update({ logoUrl: req.body.logoUrl });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: "Failed to update logo" });
  }
});

// ── Add staff to company (onboarding – step 2) ───────────────
router.post(
  "/:id/staff",
  [
    body("firstName").notEmpty().withMessage("First name required"),
    body("lastName").notEmpty().withMessage("Last name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["manager", "regular"]).withMessage("Role must be manager or regular"),
  ],
  validate,
  async (req, res) => {
    try {
      const company = await db.Company.findByPk(req.params.id);
      if (!company) return res.status(404).json({ error: "Company not found" });

      // Check email uniqueness
      const existingStaff = await db.Staff.findOne({ where: { email: req.body.email } });
      if (existingStaff) {
        return res.status(409).json({ error: "Email already in use" });
      }

      const hash = await bcrypt.hash(req.body.password, 12);

      const staff = await db.Staff.create({
        companyId: company.id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
        role: req.body.role,
        phone: req.body.phone,
      });

      const { password, ...staffData } = staff.toJSON();
      res.status(201).json(staffData);
    } catch (err) {
      console.error("Add staff error:", err);
      res.status(500).json({ error: "Failed to add staff" });
    }
  }
);

// ── Complete onboarding ───────────────────────────────────────
router.post("/:id/complete-onboarding", async (req, res) => {
  try {
    const company = await db.Company.findByPk(req.params.id, {
      include: [{ model: db.Staff, as: "staff" }],
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    if (company.staff.length === 0) {
      return res.status(400).json({ error: "At least one staff member is required" });
    }

    await company.update({ onboardingCompleted: true });
    res.json({ message: "Onboarding completed", company });
  } catch (err) {
    res.status(500).json({ error: "Failed to complete onboarding" });
  }
});

// ── Delete company ────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const company = await db.Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ error: "Company not found" });

    await company.destroy();
    res.json({ message: "Company deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete company" });
  }
});

module.exports = router;
