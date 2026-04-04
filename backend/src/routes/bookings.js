const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { Op } = require("sequelize");
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

// ── List bookings for authenticated user's company (shortcut)
router.get("/", async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: "No company context" });
    const { status, from, to, limit } = req.query;
    const where = { companyId: req.user.companyId };
    if (status) where.status = status;
    if (from || to) {
      where.startDate = {};
      if (from) where.startDate[Op.gte] = new Date(from);
      if (to) where.startDate[Op.lte] = new Date(to);
    }
    const bookings = await db.Booking.findAll({
      where,
      include: [
        { model: db.Car, as: "car", attributes: ["id", "make", "model", "licensePlate", "color"] },
        { model: db.Customer, as: "customer", attributes: ["id", "firstName", "lastName", "phone", "email"] },
        { model: db.Staff, as: "createdBy", attributes: ["id", "firstName", "lastName"] },
      ],
      order: [["startDate", "ASC"]],
      ...(limit ? { limit: parseInt(limit) } : {}),
    });
    res.json({ rows: bookings, count: bookings.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// ── Create booking for authenticated user's company (shortcut)
router.post("/", async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: "No company context" });
    const { carId, customerId, startDate, endDate, dailyRate, discount, pickupLocation, returnLocation, notes, mileageOut } = req.body;
    const conflicting = await db.Booking.findOne({
      where: {
        carId,
        status: { [Op.notIn]: ["completed", "cancelled"] },
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
          { [Op.and]: [{ startDate: { [Op.lte]: startDate } }, { endDate: { [Op.gte]: endDate } }] },
        ],
      },
    });
    if (conflicting) return res.status(409).json({ error: "Car is not available for the selected dates" });
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const subtotal = totalDays * parseFloat(dailyRate);
    const discountAmount = parseFloat(discount || 0);
    const totalAmount = subtotal - discountAmount;
    const booking = await db.Booking.create({
      companyId: req.user.companyId,
      carId, customerId,
      createdByStaffId: req.user.type === "staff" ? req.user.id : null,
      startDate, endDate, dailyRate, totalDays, subtotal,
      discount: discountAmount, totalAmount,
      pickupLocation, returnLocation, notes, mileageOut,
      status: "pending_start",
    });
    await db.Car.update({ status: "rented" }, { where: { id: carId } });
    const created = await db.Booking.findByPk(booking.id, {
      include: [{ model: db.Car, as: "car" }, { model: db.Customer, as: "customer" }],
    });
    res.status(201).json(created);
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// ── List bookings for a company ───────────────────────────────
router.get("/company/:companyId", ensureCompanyAccess, async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const where = { companyId: req.params.companyId };

    if (status) where.status = status;
    if (from || to) {
      where.startDate = {};
      if (from) where.startDate[Op.gte] = new Date(from);
      if (to) where.startDate[Op.lte] = new Date(to);
    }

    const bookings = await db.Booking.findAll({
      where,
      include: [
        { model: db.Car, as: "car", attributes: ["id", "make", "model", "licensePlate", "color"] },
        { model: db.Customer, as: "customer", attributes: ["id", "firstName", "lastName", "phone", "email"] },
        { model: db.Staff, as: "createdBy", attributes: ["id", "firstName", "lastName"] },
      ],
      order: [["startDate", "ASC"]],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// ── Get single booking ───────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const booking = await db.Booking.findByPk(req.params.id, {
      include: [
        { model: db.Car, as: "car", include: [{ model: db.CarImage, as: "images" }] },
        { model: db.Customer, as: "customer" },
        { model: db.Company, as: "company", attributes: ["id", "name", "email", "phone", "address", "city", "country", "currency"] },
        { model: db.Staff, as: "createdBy", attributes: ["id", "firstName", "lastName"] },
        { model: db.CarDamage, as: "damages" },
      ],
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

// ── Create booking ────────────────────────────────────────────
router.post(
  "/company/:companyId",
  ensureCompanyAccess,
  [
    body("carId").notEmpty().withMessage("Car required"),
    body("customerId").notEmpty().withMessage("Customer required"),
    body("startDate").notEmpty().withMessage("Start date required"),
    body("endDate").notEmpty().withMessage("End date required"),
    body("dailyRate").isNumeric().withMessage("Daily rate required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { carId, customerId, startDate, endDate, dailyRate, discount, pickupLocation, returnLocation, notes, mileageOut } = req.body;

      // Check car availability for date range
      const conflicting = await db.Booking.findOne({
        where: {
          carId,
          status: { [Op.notIn]: ["completed", "cancelled"] },
          [Op.or]: [
            { startDate: { [Op.between]: [startDate, endDate] } },
            { endDate: { [Op.between]: [startDate, endDate] } },
            {
              [Op.and]: [
                { startDate: { [Op.lte]: startDate } },
                { endDate: { [Op.gte]: endDate } },
              ],
            },
          ],
        },
      });

      if (conflicting) {
        return res.status(409).json({ error: "Car is not available for the selected dates" });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      const subtotal = totalDays * parseFloat(dailyRate);
      const discountAmount = parseFloat(discount || 0);
      const totalAmount = subtotal - discountAmount;

      const booking = await db.Booking.create({
        companyId: req.params.companyId,
        carId,
        customerId,
        createdByStaffId: req.user.type === "staff" ? req.user.id : null,
        startDate,
        endDate,
        dailyRate,
        totalDays,
        subtotal,
        discount: discountAmount,
        totalAmount,
        pickupLocation,
        returnLocation,
        notes,
        mileageOut,
        status: "pending_start",
      });

      // Update car status
      await db.Car.update({ status: "rented" }, { where: { id: carId } });

      const created = await db.Booking.findByPk(booking.id, {
        include: [
          { model: db.Car, as: "car" },
          { model: db.Customer, as: "customer" },
        ],
      });

      res.status(201).json(created);
    } catch (err) {
      console.error("Create booking error:", err);
      res.status(500).json({ error: "Failed to create booking" });
    }
  }
);

// ── Update booking status ─────────────────────────────────────
router.put("/:id/status", async (req, res) => {
  try {
    const booking = await db.Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const { status, mileageIn, actualReturnDate, extraCharges, amountPaid } = req.body;

    const updateData = { status };

    if (status === "in_progress") {
      // Booking started
    }

    if (status === "completed" || status === "pending_return") {
      if (mileageIn) updateData.mileageIn = mileageIn;
      if (actualReturnDate) updateData.actualReturnDate = actualReturnDate;
      if (extraCharges) {
        updateData.extraCharges = extraCharges;
        updateData.totalAmount = parseFloat(booking.subtotal) - parseFloat(booking.discount) + parseFloat(extraCharges);
      }
    }

    if (amountPaid !== undefined) {
      updateData.amountPaid = amountPaid;
      const total = updateData.totalAmount || parseFloat(booking.totalAmount);
      if (parseFloat(amountPaid) >= total) {
        updateData.paymentStatus = "paid";
      } else if (parseFloat(amountPaid) > 0) {
        updateData.paymentStatus = "partial";
      }
    }

    await booking.update(updateData);

    // If completed, set car back to available
    if (status === "completed") {
      await db.Car.update({ status: "available" }, { where: { id: booking.carId } });
    }

    if (status === "cancelled") {
      await db.Car.update({ status: "available" }, { where: { id: booking.carId } });
    }

    const updated = await db.Booking.findByPk(booking.id, {
      include: [
        { model: db.Car, as: "car" },
        { model: db.Customer, as: "customer" },
      ],
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// ── Delete booking ────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const booking = await db.Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.status === "in_progress") {
      return res.status(400).json({ error: "Cannot delete an active booking" });
    }

    // Release car
    await db.Car.update({ status: "available" }, { where: { id: booking.carId } });
    await booking.destroy();
    res.json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

module.exports = router;
