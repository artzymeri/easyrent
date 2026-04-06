const router = require("express").Router();
const { Op } = require("sequelize");
const db = require("../db");

// ── Public: Get car info + bookings by car ID (no auth) ───────
// Used by QR code scanning — customers can view their bookings
router.get("/car/:carId", async (req, res) => {
  try {
    const car = await db.Car.findByPk(req.params.carId, {
      attributes: ["id", "make", "model", "color", "licensePlate", "year", "companyId"],
      include: [
        {
          model: db.Company,
          as: "company",
          attributes: ["id", "name", "logoUrl", "phone", "email", "currency"],
        },
      ],
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    // Get active and recent bookings for this car
    const bookings = await db.Booking.findAll({
      where: {
        carId: car.id,
        status: { [Op.in]: ["pending_start", "in_progress", "pending_return"] },
      },
      include: [
        {
          model: db.Customer,
          as: "customer",
          attributes: ["id", "firstName", "lastName", "phone", "email"],
        },
      ],
      order: [["startDate", "ASC"]],
    });

    res.json({
      car: {
        id: car.id,
        make: car.make,
        model: car.model,
        color: car.color,
        licensePlate: car.licensePlate,
        year: car.year,
      },
      company: car.company,
      bookings: bookings.map((b) => ({
        id: b.id,
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.status,
        totalAmount: b.totalAmount,
        amountPaid: b.amountPaid,
        notes: b.notes,
        customer: b.customer
          ? {
              id: b.customer.id,
              firstName: b.customer.firstName,
              lastName: b.customer.lastName,
              phone: b.customer.phone,
            }
          : null,
      })),
    });
  } catch (err) {
    console.error("QR car lookup error:", err);
    res.status(500).json({ error: "Failed to load car info" });
  }
});

// ── Public: Get booking details by ID ─────────────────────────
router.get("/booking/:bookingId", async (req, res) => {
  try {
    const booking = await db.Booking.findByPk(req.params.bookingId, {
      include: [
        {
          model: db.Car,
          as: "car",
          attributes: ["id", "make", "model", "color", "licensePlate", "year"],
        },
        {
          model: db.Customer,
          as: "customer",
          attributes: ["id", "firstName", "lastName", "phone", "email"],
        },
        {
          model: db.Company,
          as: "company",
          attributes: ["id", "name", "logoUrl", "phone", "email", "currency"],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({
      id: booking.id,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      dailyRate: booking.dailyRate,
      totalDays: booking.totalDays,
      subtotal: booking.subtotal,
      discount: booking.discount,
      extraCharges: booking.extraCharges,
      totalAmount: booking.totalAmount,
      amountPaid: booking.amountPaid,
      paymentStatus: booking.paymentStatus,
      pickupLocation: booking.pickupLocation,
      returnLocation: booking.returnLocation,
      notes: booking.notes,
      car: booking.car,
      customer: booking.customer,
      company: booking.company,
    });
  } catch (err) {
    console.error("QR booking lookup error:", err);
    res.status(500).json({ error: "Failed to load booking" });
  }
});

// ── Public: Customer updates their booking notes ──────────────
router.put("/booking/:bookingId/notes", async (req, res) => {
  try {
    const booking = await db.Booking.findByPk(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Only allow notes update on active bookings
    if (!["pending_start", "in_progress", "pending_return"].includes(booking.status)) {
      return res.status(400).json({ error: "Cannot update a completed or cancelled booking" });
    }

    const { notes } = req.body;
    await booking.update({ notes: notes || "" });

    res.json({ success: true, notes: booking.notes });
  } catch (err) {
    console.error("QR booking notes update error:", err);
    res.status(500).json({ error: "Failed to update notes" });
  }
});

module.exports = router;
