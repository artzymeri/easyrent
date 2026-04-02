const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const db = require("../db");

// ── Admin (super_admin) Login ─────────────────────────────────
router.post(
  "/admin/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await db.User.findOne({ where: { email } });

      if (!user || !user.isActive) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, type: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Admin login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

// ── Staff Login ───────────────────────────────────────────────
router.post(
  "/staff/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
    body("subdomain").notEmpty().withMessage("Company subdomain required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password, subdomain } = req.body;

      // Find company by subdomain first
      const company = await db.Company.findOne({ where: { subdomain } });
      if (!company || !company.isActive) {
        return res.status(401).json({ error: "Company not found or inactive" });
      }

      const staff = await db.Staff.findOne({
        where: { email, companyId: company.id },
        include: [{ model: db.Company, as: "company", attributes: ["id", "name", "subdomain", "logoUrl", "isActive"] }],
      });

      if (!staff || !staff.isActive) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!staff.company || !staff.company.isActive) {
        return res.status(401).json({ error: "Company is not active" });
      }

      const valid = await bcrypt.compare(password, staff.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update last login
      await staff.update({ lastLoginAt: new Date() });

      const token = jwt.sign(
        {
          id: staff.id,
          email: staff.email,
          role: staff.role,
          type: "staff",
          companyId: staff.companyId,
          subdomain: staff.company.subdomain,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      res.json({
        token,
        user: {
          id: staff.id,
          email: staff.email,
          firstName: staff.firstName,
          lastName: staff.lastName,
          role: staff.role,
          companyId: staff.companyId,
        },
        company: {
          id: staff.company.id,
          name: staff.company.name,
          subdomain: staff.company.subdomain,
          logoUrl: staff.company.logoUrl,
        },
      });
    } catch (err) {
      console.error("Staff login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

// ── Get current user (works for both admin & staff) ───────────
router.get("/me", require("../middleware/auth").authenticate, async (req, res) => {
  try {
    if (req.user.type === "admin") {
      const user = await db.User.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
      });
      return res.json({ type: "admin", user });
    }

    const staff = await db.Staff.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: db.Company, as: "company", attributes: ["id", "name", "subdomain", "logoUrl"] }],
    });
    res.json({ type: "staff", user: staff });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

module.exports = router;
