const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { Op, fn, col, literal } = require("sequelize");
const db = require("../db");

router.use(authenticate);

// ── Dashboard data ────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    if (!req.user.companyId)
      return res.status(400).json({ error: "No company context" });

    const companyId = req.user.companyId;
    const now = new Date();
    const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    // ── Fetch all active / relevant bookings ──────────────────
    const allBookings = await db.Booking.findAll({
      where: { companyId },
      include: [
        { model: db.Car, as: "car", attributes: ["id", "make", "model", "licensePlate", "color"] },
        { model: db.Customer, as: "customer", attributes: ["id", "firstName", "lastName", "phone", "email"] },
      ],
      order: [["startDate", "ASC"]],
    });

    // ── Booking alerts ────────────────────────────────────────
    // Ending within 6 hours (in_progress + endDate between now and +6h)
    const endingSoon = allBookings.filter((b) => {
      if (b.status !== "in_progress") return false;
      const end = new Date(b.endDate);
      return end > now && end <= sixHoursFromNow;
    });

    // Overdue (in_progress + endDate < now)
    const overdue = allBookings.filter((b) => {
      if (b.status !== "in_progress") return false;
      return new Date(b.endDate) < now;
    });

    // ── Fleet stats ───────────────────────────────────────────
    const allCars = await db.Car.findAll({
      where: { companyId },
      attributes: [
        "id", "make", "model", "licensePlate", "status",
        "registrationExpiry", "insuranceExpiry",
        "nextServiceDate", "repairParts", "qrCode",
      ],
    });

    const fleetStats = {
      total: allCars.length,
      available: allCars.filter((c) => c.status === "available").length,
      rented: allCars.filter((c) => c.status === "rented").length,
      maintenance: allCars.filter((c) => c.status === "maintenance").length,
      outOfService: allCars.filter((c) => c.status === "out_of_service").length,
      needsRepair: allCars.filter((c) => c.status === "needs_repair").length,
    };

    // ── Car alerts: registration / insurance expiry, service ──
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const registrationExpiring = allCars.filter((c) => {
      if (!c.registrationExpiry) return false;
      const d = new Date(c.registrationExpiry);
      return d > now && d <= thirtyDaysFromNow;
    });

    const registrationExpired = allCars.filter((c) => {
      if (!c.registrationExpiry) return false;
      return new Date(c.registrationExpiry) <= now;
    });

    const insuranceExpiring = allCars.filter((c) => {
      if (!c.insuranceExpiry) return false;
      const d = new Date(c.insuranceExpiry);
      return d > now && d <= thirtyDaysFromNow;
    });

    const insuranceExpired = allCars.filter((c) => {
      if (!c.insuranceExpiry) return false;
      return new Date(c.insuranceExpiry) <= now;
    });

    const serviceDue = allCars.filter((c) => {
      if (!c.nextServiceDate) return false;
      const d = new Date(c.nextServiceDate);
      return d <= thirtyDaysFromNow;
    });

    const carsNeedingRepair = allCars.filter(
      (c) => c.status === "needs_repair"
    );

    // ── Booking stats ─────────────────────────────────────────
    const bookingStats = {
      total: allBookings.length,
      pendingStart: allBookings.filter((b) => b.status === "pending_start").length,
      inProgress: allBookings.filter((b) => b.status === "in_progress").length,
      completed: allBookings.filter((b) => b.status === "completed").length,
      cancelled: allBookings.filter((b) => b.status === "cancelled").length,
    };

    // ── Revenue — monthly (last 6 months) ─────────────────────
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const completedBookings = allBookings.filter(
      (b) =>
        b.status === "completed" &&
        new Date(b.endDate) >= sixMonthsAgo
    );

    // Build monthly revenue map
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-11
      const monthTotal = completedBookings
        .filter((b) => {
          const ed = new Date(b.endDate);
          return ed.getFullYear() === year && ed.getMonth() === month;
        })
        .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);

      monthlyRevenue.push({
        year,
        month: month + 1,
        revenue: Math.round(monthTotal * 100) / 100,
      });
    }

    // ── Total revenue (all time) ──────────────────────────────
    const totalRevenue = allBookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);

    const thisMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0;

    // ── Customers total ───────────────────────────────────────
    const customerCount = await db.Customer.count({ where: { companyId } });

    // ── Recent bookings (latest 5) ────────────────────────────
    const recentBookings = allBookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    res.json({
      bookingAlerts: {
        endingSoon: endingSoon.map(serializeBooking),
        overdue: overdue.map(serializeBooking),
      },
      carAlerts: {
        registrationExpiring: registrationExpiring.map(serializeCar),
        registrationExpired: registrationExpired.map(serializeCar),
        insuranceExpiring: insuranceExpiring.map(serializeCar),
        insuranceExpired: insuranceExpired.map(serializeCar),
        serviceDue: serviceDue.map(serializeCar),
        needsRepair: carsNeedingRepair.map(serializeCar),
      },
      fleetStats,
      bookingStats,
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        thisMonth: thisMonthRevenue,
        monthly: monthlyRevenue,
      },
      customerCount,
      recentBookings: recentBookings.map(serializeBooking),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

function serializeBooking(b) {
  return {
    id: b.id,
    startDate: b.startDate,
    endDate: b.endDate,
    status: b.status,
    totalAmount: b.totalAmount,
    customer: b.customer
      ? { id: b.customer.id, firstName: b.customer.firstName, lastName: b.customer.lastName, phone: b.customer.phone }
      : null,
    car: b.car
      ? { id: b.car.id, make: b.car.make, model: b.car.model, licensePlate: b.car.licensePlate }
      : null,
  };
}

function serializeCar(c) {
  return {
    id: c.id,
    make: c.make,
    model: c.model,
    licensePlate: c.licensePlate,
    status: c.status,
    registrationExpiry: c.registrationExpiry,
    insuranceExpiry: c.insuranceExpiry,
    nextServiceDate: c.nextServiceDate,
    repairParts: c.repairParts,
  };
}

module.exports = router;
