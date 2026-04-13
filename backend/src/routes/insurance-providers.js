const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const db = require("../db");

// All routes require authentication
router.use(authenticate);

/**
 * Normalize a name for storage:
 *  - trim
 *  - lowercase
 *  - collapse whitespace → single dash
 */
function normalizeName(raw) {
  return raw.trim().toLowerCase().replace(/\s+/g, "-");
}

// ── List insurance providers for the user's company ───────────
router.get("/", async (req, res) => {
  try {
    const providers = await db.InsuranceProvider.findAll({
      where: { companyId: req.user.companyId },
      order: [["name", "ASC"]],
    });
    res.json(providers);
  } catch (err) {
    console.error("List insurance providers error:", err);
    res.status(500).json({ error: "Failed to fetch insurance providers" });
  }
});

// ── Create an insurance provider (manager only) ───────────────
router.post(
  "/",
  [body("name").trim().notEmpty().withMessage("Name is required")],
  validate,
  async (req, res) => {
    try {
      if (req.user.role !== "manager") {
        return res
          .status(403)
          .json({ error: "Only managers can create insurance providers" });
      }

      const name = normalizeName(req.body.name);

      // Prevent duplicates within the same company
      const existing = await db.InsuranceProvider.findOne({
        where: { companyId: req.user.companyId, name },
      });
      if (existing) {
        return res
          .status(409)
          .json({ error: "Insurance provider already exists" });
      }

      const provider = await db.InsuranceProvider.create({
        companyId: req.user.companyId,
        name,
      });

      res.status(201).json(provider);
    } catch (err) {
      console.error("Create insurance provider error:", err);
      res.status(500).json({ error: "Failed to create insurance provider" });
    }
  }
);

// ── Update an insurance provider (manager only) ───────────────
router.put(
  "/:id",
  [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),
    body("isActive").optional().isBoolean(),
  ],
  validate,
  async (req, res) => {
    try {
      if (req.user.role !== "manager") {
        return res
          .status(403)
          .json({ error: "Only managers can update insurance providers" });
      }

      const provider = await db.InsuranceProvider.findOne({
        where: { id: req.params.id, companyId: req.user.companyId },
      });

      if (!provider)
        return res
          .status(404)
          .json({ error: "Insurance provider not found" });

      const updates = {};
      if (req.body.name !== undefined) updates.name = normalizeName(req.body.name);
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

      await provider.update(updates);
      res.json(provider);
    } catch (err) {
      console.error("Update insurance provider error:", err);
      res.status(500).json({ error: "Failed to update insurance provider" });
    }
  }
);

// ── Delete an insurance provider (manager only) ───────────────
router.delete("/:id", async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res
        .status(403)
        .json({ error: "Only managers can delete insurance providers" });
    }

    const provider = await db.InsuranceProvider.findOne({
      where: { id: req.params.id, companyId: req.user.companyId },
    });

    if (!provider)
      return res
        .status(404)
        .json({ error: "Insurance provider not found" });

    await provider.destroy();
    res.json({ message: "Insurance provider deleted" });
  } catch (err) {
    console.error("Delete insurance provider error:", err);
    res.status(500).json({ error: "Failed to delete insurance provider" });
  }
});

module.exports = router;
