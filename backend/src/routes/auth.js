const router = require("express").Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const db = require("../db");
const { Op } = require("sequelize");
const {
  sendEmail,
  adminPasswordResetEmail,
  staffPasswordResetEmail,
} = require("../services/emailService");

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
        include: [{ model: db.Company, as: "company", attributes: ["id", "name", "subdomain", "logoUrl", "isActive", "currency"] }],
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
          currency: staff.company.currency,
        },
      });
    } catch (err) {
      console.error("Staff login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

// ── Admin Forgot Password ─────────────────────────────────────
router.post(
  "/admin/forgot-password",
  [body("email").isEmail().withMessage("Valid email required")],
  validate,
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await db.User.findOne({ where: { email } });

      // Always return success to prevent email enumeration
      if (!user || !user.isActive) {
        return res.json({ message: "If the email exists, a reset link has been sent." });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await user.update({
        passwordResetToken: token,
        passwordResetExpires: expires,
      });

      const adminUrl = process.env.ADMIN_URL || "http://localhost:4346";
      const resetUrl = `${adminUrl}/reset-password?token=${token}`;

      const emailContent = adminPasswordResetEmail(user.firstName || "Admin", resetUrl);
      await sendEmail({ to: user.email, ...emailContent });

      res.json({ message: "If the email exists, a reset link has been sent." });
    } catch (err) {
      console.error("Admin forgot password error:", err);
      res.status(500).json({ error: "Failed to process request" });
    }
  }
);

// ── Admin Reset Password ──────────────────────────────────────
router.post(
  "/admin/reset-password",
  [
    body("token").notEmpty().withMessage("Token required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  async (req, res) => {
    try {
      const { token, password } = req.body;

      const user = await db.User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { [Op.gt]: new Date() },
        },
      });

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      const hash = await bcrypt.hash(password, 12);
      await user.update({
        password: hash,
        passwordResetToken: null,
        passwordResetExpires: null,
      });

      res.json({ message: "Password has been reset successfully" });
    } catch (err) {
      console.error("Admin reset password error:", err);
      res.status(500).json({ error: "Failed to reset password" });
    }
  }
);

// ── Staff Forgot Password ─────────────────────────────────────
router.post(
  "/staff/forgot-password",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("subdomain").notEmpty().withMessage("Company subdomain required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, subdomain } = req.body;

      const company = await db.Company.findOne({ where: { subdomain } });
      if (!company || !company.isActive) {
        return res.json({ message: "If the email exists, a reset link has been sent." });
      }

      const staff = await db.Staff.findOne({
        where: { email, companyId: company.id },
      });

      if (!staff || !staff.isActive) {
        return res.json({ message: "If the email exists, a reset link has been sent." });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await staff.update({
        passwordResetToken: token,
        passwordResetExpires: expires,
      });

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4345";
      const resetUrl = `${frontendUrl}/reset-password?token=${token}&subdomain=${subdomain}`;

      const emailContent = staffPasswordResetEmail(staff.firstName, resetUrl, company.name);
      await sendEmail({ to: staff.email, ...emailContent });

      res.json({ message: "If the email exists, a reset link has been sent." });
    } catch (err) {
      console.error("Staff forgot password error:", err);
      res.status(500).json({ error: "Failed to process request" });
    }
  }
);

// ── Staff Reset Password ──────────────────────────────────────
router.post(
  "/staff/reset-password",
  [
    body("token").notEmpty().withMessage("Token required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  async (req, res) => {
    try {
      const { token, password } = req.body;

      const staff = await db.Staff.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { [Op.gt]: new Date() },
        },
      });

      if (!staff) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      const hash = await bcrypt.hash(password, 12);
      await staff.update({
        password: hash,
        passwordResetToken: null,
        passwordResetExpires: null,
      });

      res.json({ message: "Password has been reset successfully" });
    } catch (err) {
      console.error("Staff reset password error:", err);
      res.status(500).json({ error: "Failed to reset password" });
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
      include: [{ model: db.Company, as: "company", attributes: ["id", "name", "subdomain", "logoUrl", "currency"] }],
    });
    res.json({ type: "staff", user: staff });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

module.exports = router;
