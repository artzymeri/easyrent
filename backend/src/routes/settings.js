const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const db = require("../db");

// All routes require authentication
router.use(authenticate);

// Fields returned by GET and accepted by PUT (except name & subdomain)
const COMPANY_ATTRIBUTES = [
  "id",
  "name",
  "subdomain",
  "email",
  "phone",
  "address",
  "city",
  "country",
  "currency",
  "logoUrl",
  "slogan",
  "signature",
  "stampUrl",
  "businessNumber",
  "businessFaxNumber",
  "companyIdNumber",
];

// ── Get company settings ──────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const company = await db.Company.findByPk(req.user.companyId, {
      attributes: COMPANY_ATTRIBUTES,
    });
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  } catch (err) {
    console.error("Get settings error:", err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// ── Update company settings ───────────────────────────────────
router.put(
  "/",
  [
    body("currency")
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage("Invalid currency code"),
    body("email").optional({ values: "null" }).isEmail().withMessage("Invalid email"),
    body("phone").optional({ values: "null" }),
    body("address").optional({ values: "null" }),
    body("city").optional({ values: "null" }),
    body("country").optional({ values: "null" }),
    body("slogan").optional({ values: "null" }),
    body("logoUrl").optional({ values: "null" }),
    body("signature").optional({ values: "null" }),
    body("stampUrl").optional({ values: "null" }),
    body("businessNumber").optional({ values: "null" }),
    body("businessFaxNumber").optional({ values: "null" }),
    body("companyIdNumber").optional({ values: "null" }),
  ],
  validate,
  async (req, res) => {
    try {
      // Only managers can change settings
      if (req.user.role !== "manager") {
        return res.status(403).json({ error: "Only managers can change settings" });
      }

      const company = await db.Company.findByPk(req.user.companyId);
      if (!company) return res.status(404).json({ error: "Company not found" });

      // Build update object from allowed fields (exclude name & subdomain)
      const allowedFields = [
        "email",
        "phone",
        "address",
        "city",
        "country",
        "currency",
        "logoUrl",
        "slogan",
        "signature",
        "stampUrl",
        "businessNumber",
        "businessFaxNumber",
        "companyIdNumber",
      ];

      const updates = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      await company.update(updates);

      // Re-fetch with all attributes
      const updated = await db.Company.findByPk(req.user.companyId, {
        attributes: COMPANY_ATTRIBUTES,
      });

      res.json(updated);
    } catch (err) {
      console.error("Update settings error:", err);
      res.status(500).json({ error: "Failed to update settings" });
    }
  }
);

module.exports = router;
