const { Sequelize } = require("sequelize");
const config = require("./config/database");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging || false,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions || {},
  }
);

const db = {
  sequelize,
  Sequelize,
};

// ── Register models ──────────────────────────────────────────
const User = require("./models/User")(sequelize, Sequelize.DataTypes);
const Company = require("./models/Company")(sequelize, Sequelize.DataTypes);
const Staff = require("./models/Staff")(sequelize, Sequelize.DataTypes);
const Car = require("./models/Car")(sequelize, Sequelize.DataTypes);
const CarImage = require("./models/CarImage")(sequelize, Sequelize.DataTypes);
const CarDamage = require("./models/CarDamage")(sequelize, Sequelize.DataTypes);
const Customer = require("./models/Customer")(sequelize, Sequelize.DataTypes);
const Booking = require("./models/Booking")(sequelize, Sequelize.DataTypes);
const BookingImage = require("./models/BookingImage")(sequelize, Sequelize.DataTypes);

db.User = User;
db.Company = Company;
db.Staff = Staff;
db.Car = Car;
db.CarImage = CarImage;
db.CarDamage = CarDamage;
db.Customer = Customer;
db.Booking = Booking;
db.BookingImage = BookingImage;

// Run associations after all models are loaded
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
