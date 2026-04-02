require("dotenv").config();

const app = require("./app");
const db = require("./db");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log("✅ Database connection established.");

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 EasyRent API running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ Unable to start server:", err);
    process.exit(1);
  }
})();
