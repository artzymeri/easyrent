const router = require("express").Router();
const { Op } = require("sequelize");
const { authenticate } = require("../middleware/auth");
const db = require("../db");
const { getIO } = require("../socket");

router.use(authenticate);

// ── List booking requests for authenticated user's company ────
router.get("/", async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: "No company context" });

    const { status } = req.query;
    const where = { companyId: req.user.companyId };
    if (status) where.status = status;

    const requests = await db.BookingRequest.findAll({
      where,
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: ["id", "make", "model", "licensePlate", "color", "dailyRate"],
          include: [{ model: db.CarImage, as: "images", attributes: ["id", "url", "isPrimary", "sortOrder"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ rows: requests, count: requests.length });
  } catch (err) {
    console.error("List booking requests error:", err);
    res.status(500).json({ error: "Failed to fetch booking requests" });
  }
});

// ── Confirm a booking request (creates real booking + customer) ─
router.post("/:id/confirm", async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: "No company context" });

    const request = await db.BookingRequest.findByPk(req.params.id, {
      include: [{ model: db.Car, as: "car" }],
    });

    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.companyId !== req.user.companyId) return res.status(403).json({ error: "Access denied" });
    if (request.status !== "pending") return res.status(400).json({ error: "Request is no longer pending" });

    // Check for conflicting bookings (in case something changed)
    const conflicting = await db.Booking.findOne({
      where: {
        carId: request.carId,
        status: { [Op.notIn]: ["completed", "cancelled"] },
        [Op.or]: [
          { startDate: { [Op.between]: [request.startDate, request.endDate] } },
          { endDate: { [Op.between]: [request.startDate, request.endDate] } },
          { [Op.and]: [{ startDate: { [Op.lte]: request.startDate } }, { endDate: { [Op.gte]: request.endDate } }] },
        ],
      },
    });
    if (conflicting) {
      return res.status(409).json({ error: "Car is no longer available for the selected dates" });
    }

    // Find or create customer
    let customer = await db.Customer.findOne({
      where: {
        companyId: request.companyId,
        phone: request.requesterPhone,
      },
    });

    if (!customer) {
      customer = await db.Customer.create({
        companyId: request.companyId,
        firstName: request.requesterFirstName,
        lastName: request.requesterLastName,
        email: request.requesterEmail || null,
        phone: request.requesterPhone,
      });
    }

    // Create the actual booking
    const totalDays = request.totalDays;
    const subtotal = totalDays * parseFloat(request.dailyRate);
    const totalAmount = subtotal;

    const booking = await db.Booking.create({
      companyId: request.companyId,
      carId: request.carId,
      customerId: customer.id,
      createdByStaffId: req.user.type === "staff" ? req.user.id : null,
      startDate: request.startDate,
      endDate: request.endDate,
      dailyRate: request.dailyRate,
      totalDays,
      subtotal,
      discount: 0,
      totalAmount,
      status: "pending_start",
      notes: `Created from booking request #${request.id}`,
    });

    // Update car status
    await db.Car.update({ status: "rented" }, { where: { id: request.carId } });

    // Mark request as confirmed
    await request.update({ status: "confirmed" });

    // Reject any other pending requests that overlap with the confirmed dates
    await db.BookingRequest.update(
      { status: "rejected" },
      {
        where: {
          id: { [Op.ne]: request.id },
          carId: request.carId,
          status: "pending",
          [Op.or]: [
            { startDate: { [Op.between]: [request.startDate, request.endDate] } },
            { endDate: { [Op.between]: [request.startDate, request.endDate] } },
            { [Op.and]: [{ startDate: { [Op.lte]: request.startDate } }, { endDate: { [Op.gte]: request.endDate } }] },
          ],
        },
      }
    );

    const created = await db.Booking.findByPk(booking.id, {
      include: [
        { model: db.Car, as: "car" },
        { model: db.Customer, as: "customer" },
      ],
    });

    // Notify staff in real-time
    const io = getIO();
    if (io) {
      io.to(`company-${request.companyId}`).emit("booking-request-change", { type: "confirmed", id: request.id });
    }

    res.json({ message: "Booking confirmed", booking: created });
  } catch (err) {
    console.error("Confirm booking request error:", err);
    res.status(500).json({ error: "Failed to confirm booking request" });
  }
});

// ── Reject a booking request ──────────────────────────────────
router.post("/:id/reject", async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: "No company context" });

    const request = await db.BookingRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.companyId !== req.user.companyId) return res.status(403).json({ error: "Access denied" });
    if (request.status !== "pending") return res.status(400).json({ error: "Request is no longer pending" });

    await request.update({ status: "rejected" });

    const io = getIO();
    if (io) {
      io.to(`company-${request.companyId}`).emit("booking-request-change", { type: "rejected", id: request.id });
    }

    res.json({ message: "Booking request rejected" });
  } catch (err) {
    console.error("Reject booking request error:", err);
    res.status(500).json({ error: "Failed to reject booking request" });
  }
});

// ── Delete a booking request ──────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: "No company context" });

    const request = await db.BookingRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.companyId !== req.user.companyId) return res.status(403).json({ error: "Access denied" });

    const companyId = request.companyId;
    await request.destroy();

    const io = getIO();
    if (io) {
      io.to(`company-${companyId}`).emit("booking-request-change", { type: "deleted", id: request.id });
    }

    res.json({ message: "Booking request deleted" });
  } catch (err) {
    console.error("Delete booking request error:", err);
    res.status(500).json({ error: "Failed to delete booking request" });
  }
});

module.exports = router;
