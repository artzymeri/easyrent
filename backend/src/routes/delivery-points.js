const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const db = require("../db");

// All routes require authentication
router.use(authenticate);

// ── List delivery points for the user's company ───────────────
router.get("/", async (req, res) => {
  try {
    const points = await db.DeliveryPoint.findAll({
      where: { companyId: req.user.companyId },
      order: [["name", "ASC"]],
    });
    res.json(points);
  } catch (err) {
    console.error("List delivery points error:", err);
    res.status(500).json({ error: "Failed to fetch delivery points" });
  }
});

// ── Create a delivery point (manager only) ────────────────────
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("address").optional({ values: "null" }).trim(),
  ],
  validate,
  async (req, res) => {
    try {
      if (req.user.role !== "manager") {
        return res.status(403).json({ error: "Only managers can create delivery points" });
      }

      const point = await db.DeliveryPoint.create({
        companyId: req.user.companyId,
        name: req.body.name,
        address: req.body.address || null,
      });

      res.status(201).json(point);
    } catch (err) {
      console.error("Create delivery point error:", err);
      res.status(500).json({ error: "Failed to create delivery point" });
    }
  }
);

// ── Update a delivery point (manager only) ────────────────────
router.put(
  "/:id",
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("address").optional({ values: "null" }).trim(),
    body("isActive").optional().isBoolean(),
  ],
  validate,
  async (req, res) => {
    try {
      if (req.user.role !== "manager") {
        return res.status(403).json({ error: "Only managers can update delivery points" });
      }

      const point = await db.DeliveryPoint.findOne({
        where: { id: req.params.id, companyId: req.user.companyId },
      });

      if (!point) return res.status(404).json({ error: "Delivery point not found" });

      const updates = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.address !== undefined) updates.address = req.body.address;
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

      await point.update(updates);
      res.json(point);
    } catch (err) {
      console.error("Update delivery point error:", err);
      res.status(500).json({ error: "Failed to update delivery point" });
    }
  }
);

// ── Delete a delivery point (manager only) ────────────────────
router.delete("/:id", async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Only managers can delete delivery points" });
    }

    const point = await db.DeliveryPoint.findOne({
      where: { id: req.params.id, companyId: req.user.companyId },
    });

    if (!point) return res.status(404).json({ error: "Delivery point not found" });

    await point.destroy();
    res.json({ message: "Delivery point deleted" });
  } catch (err) {
    console.error("Delete delivery point error:", err);
    res.status(500).json({ error: "Failed to delete delivery point" });
  }
});

module.exports = router;
