const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// ── Security & Middleware ─────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// ── Health Check ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",       require("./routes/auth"));
app.use("/api/companies",  require("./routes/companies"));
app.use("/api/staff",      require("./routes/staff"));
app.use("/api/cars",       require("./routes/cars"));
app.use("/api/customers",  require("./routes/customers"));
app.use("/api/bookings",   require("./routes/bookings"));
app.use("/api/settings",   require("./routes/settings"));

// ── Static data endpoints ─────────────────────────────────────
const { carMakes, getModelsForMake } = require("./utils/carData");
app.get("/api/data/car-makes", (req, res) => res.json(carMakes));
app.get("/api/data/car-models/:make", (req, res) => {
  const models = getModelsForMake(req.params.make);
  if (models.length === 0) return res.status(404).json({ error: "Make not found" });
  res.json(models);
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

module.exports = app;
