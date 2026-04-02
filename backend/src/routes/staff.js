const router = require("express").Router();
const bcrypt = require("bcrypt");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const db = require("../db");

router.use(authenticate);

/**
 * Middleware: ensure the requester belongs to the company they're managing
 * or is a super_admin.
 */
function ensureCompanyAccess(req, res, next) {
  if (req.user.type === "admin") return next(); // super_admin can do anything
  if (req.user.role !== "manager") {
    return res.status(403).json({ error: "Only managers can manage staff" });
  }
  // staff can only manage their own company
  if (String(req.user.companyId) !== String(req.params.companyId)) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}

// ── List staff for a company ──────────────────────────────────
router.get("/company/:companyId", ensureCompanyAccess, async (req, res) => {
  try {
    const staff = await db.Staff.findAll({
      where: { companyId: req.params.companyId },
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

// ── Get single staff ─────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const staff = await db.Staff.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: db.Company, as: "company", attributes: ["id", "name", "subdomain"] }],
    });
    if (!staff) return res.status(404).json({ error: "Staff not found" });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

// ── Create staff (manager action) ─────────────────────────────
router.post(
  "/company/:companyId",
  ensureCompanyAccess,
  [
    body("firstName").notEmpty(),
    body("lastName").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["manager", "regular"]),
  ],
  validate,
  async (req, res) => {
    try {
      const existing = await db.Staff.findOne({ where: { email: req.body.email } });
      if (existing) return res.status(409).json({ error: "Email already in use" });

      const hash = await bcrypt.hash(req.body.password, 12);
      const staff = await db.Staff.create({
        companyId: req.params.companyId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
        role: req.body.role,
        phone: req.body.phone,
      });

      const { password, ...data } = staff.toJSON();
      res.status(201).json(data);
    } catch (err) {
      console.error("Create staff error:", err);
      res.status(500).json({ error: "Failed to create staff" });
    }
  }
);

// ── Update staff ──────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const staff = await db.Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    // access check
    if (req.user.type !== "admin" && String(req.user.companyId) !== String(staff.companyId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { firstName, lastName, phone, role, isActive } = req.body;
    await staff.update({ firstName, lastName, phone, role, isActive });

    const { password, ...data } = staff.toJSON();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to update staff" });
  }
});

// ── Change password ───────────────────────────────────────────
router.put("/:id/password", async (req, res) => {
  try {
    const staff = await db.Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    // Staff can change their own password, managers can change any in company
    if (req.user.type !== "admin") {
      if (String(req.user.id) !== String(staff.id) && req.user.role !== "manager") {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const hash = await bcrypt.hash(req.body.newPassword, 12);
    await staff.update({ password: hash });

    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update password" });
  }
});

// ── Delete staff ──────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const staff = await db.Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    if (req.user.type !== "admin" && String(req.user.companyId) !== String(staff.companyId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    await staff.destroy();
    res.json({ message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete staff" });
  }
});

module.exports = router;
