const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const db = require("../db");

// All routes require authentication
router.use(authenticate);

// ── Get company settings ──────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const company = await db.Company.findByPk(req.user.companyId, {
      attributes: ["id", "currency"],
    });
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json({ currency: company.currency });
  } catch (err) {
    console.error("Get settings error:", err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// ── Update company settings ───────────────────────────────────
router.put(
  "/",
  [body("currency").isLength({ min: 3, max: 3 }).withMessage("Invalid currency code")],
  validate,
  async (req, res) => {
    try {
      // Only managers can change settings
      if (req.user.role !== "manager") {
        return res.status(403).json({ error: "Only managers can change settings" });
      }

      const company = await db.Company.findByPk(req.user.companyId);
      if (!company) return res.status(404).json({ error: "Company not found" });

      await company.update({ currency: req.body.currency });
      res.json({ currency: company.currency });
    } catch (err) {
      console.error("Update settings error:", err);
      res.status(500).json({ error: "Failed to update settings" });
    }
  }
);

module.exports = router;
