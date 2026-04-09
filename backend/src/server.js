require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const db = require("./db");
const { setIO } = require("./socket");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log("✅ Database connection established.");

    // Create HTTP server and attach Socket.IO
    const server = http.createServer(app);

    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : ["http://localhost:3000", "http://localhost:3001"];

    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) return callback(null, true);
          for (const ao of allowedOrigins) {
            if (ao.includes("*")) {
              const escaped = ao.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace("\\*", "[^.]+");
              const regex = new RegExp(`^${escaped}$`);
              if (regex.test(origin)) return callback(null, true);
            }
          }
          callback(null, false);
        },
        credentials: true,
      },
    });

    // Store IO instance globally so routes can emit events
    setIO(io);

    io.on("connection", (socket) => {
      // Staff joins their company room for targeted events
      socket.on("join-company", (companyId) => {
        if (companyId) {
          socket.join(`company-${companyId}`);
        }
      });

      socket.on("disconnect", () => {});
    });

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 EasyRent API running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ Unable to start server:", err);
    process.exit(1);
  }
})();
