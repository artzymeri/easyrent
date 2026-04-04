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

// ── List customers for authenticated user's company (shortcut)
router.get("/", async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: "No company context" });
    const customers = await db.Customer.findAll({
      where: { companyId: req.user.companyId },
      order: [["createdAt", "DESC"]],
    });
    res.json({ rows: customers, count: customers.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// ── Create customer for authenticated user's company (shortcut)
router.post("/", async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: "No company context" });

    // Clean optional fields – convert empty strings to null
    const data = { ...req.body };
    const optionalFields = ["email", "idNumber", "driversLicense", "driversLicenseExpiry", "dateOfBirth", "address", "city", "country", "notes"];
    for (const key of optionalFields) {
      if (data[key] === "" || data[key] === undefined) data[key] = null;
    }

    const customer = await db.Customer.create({
      companyId: req.user.companyId,
      ...data,
    });
    res.status(201).json(customer);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Customer with this phone already exists in this company" });
    }
    console.error("Create customer error:", err);
    res.status(500).json({ error: "Failed to create customer" });
  }
});

// ── List customers for a company ──────────────────────────────
router.get("/company/:companyId", ensureCompanyAccess, async (req, res) => {
  try {
    const customers = await db.Customer.findAll({
      where: { companyId: req.params.companyId },
      order: [["createdAt", "DESC"]],
    });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// ── Get single customer ──────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const customer = await db.Customer.findByPk(req.params.id, {
      include: [
        {
          model: db.Booking,
          as: "bookings",
          include: [{ model: db.Car, as: "car", attributes: ["id", "make", "model", "licensePlate"] }],
          order: [["startDate", "DESC"]],
        },
      ],
    });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// ── Create customer ──────────────────────────────────────────
router.post(
  "/company/:companyId",
  ensureCompanyAccess,
  [
    body("firstName").notEmpty().withMessage("First name required"),
    body("lastName").notEmpty().withMessage("Last name required"),
    body("phone").notEmpty().withMessage("Phone required"),
  ],
  validate,
  async (req, res) => {
    try {
      const customer = await db.Customer.create({
        companyId: req.params.companyId,
        ...req.body,
      });
      res.status(201).json(customer);
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ error: "Customer with this phone already exists in this company" });
      }
      console.error("Create customer error:", err);
      res.status(500).json({ error: "Failed to create customer" });
    }
  }
);

// ── Update customer ──────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const customer = await db.Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    if (req.user.type !== "admin" && String(req.user.companyId) !== String(customer.companyId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    await customer.update(req.body);
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: "Failed to update customer" });
  }
});

// ── Delete customer ──────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const customer = await db.Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    await customer.destroy();
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

module.exports = router;
