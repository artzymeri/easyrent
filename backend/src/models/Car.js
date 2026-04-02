"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Car extends Model {
    static associate(models) {
      Car.belongsTo(models.Company, { foreignKey: "companyId", as: "company" });
      Car.hasMany(models.CarImage, { foreignKey: "carId", as: "images" });
      Car.hasMany(models.CarDamage, { foreignKey: "carId", as: "damages" });
      Car.hasMany(models.Booking, { foreignKey: "carId", as: "bookings" });
    }
  }

  Car.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      companyId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "company_id",
      },
      make: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      model: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      year: DataTypes.INTEGER,
      productionYear: {
        type: DataTypes.INTEGER,
        field: "production_year",
      },
      color: DataTypes.STRING(50),
      licensePlate: {
        type: DataTypes.STRING(50),
        field: "license_plate",
      },
      vin: DataTypes.STRING(50),
      engine: DataTypes.STRING(100),
      fuelType: {
        type: DataTypes.ENUM("gasoline", "diesel", "electric", "hybrid", "plugin_hybrid", "lpg"),
        defaultValue: "gasoline",
        field: "fuel_type",
      },
      transmission: {
        type: DataTypes.ENUM("automatic", "manual"),
        defaultValue: "automatic",
      },
      mileage: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
      },
      seats: {
        type: DataTypes.TINYINT.UNSIGNED,
        defaultValue: 5,
      },
      dailyRate: {
        type: DataTypes.DECIMAL(10, 2),
        field: "daily_rate",
      },
      registrationExpiry: {
        type: DataTypes.DATEONLY,
        field: "registration_expiry",
      },
      insuranceProvider: {
        type: DataTypes.STRING(255),
        field: "insurance_provider",
      },
      insurancePolicyNumber: {
        type: DataTypes.STRING(100),
        field: "insurance_policy_number",
      },
      insuranceExpiry: {
        type: DataTypes.DATEONLY,
        field: "insurance_expiry",
      },
      lastServiceDate: {
        type: DataTypes.DATEONLY,
        field: "last_service_date",
      },
      nextServiceDate: {
        type: DataTypes.DATEONLY,
        field: "next_service_date",
      },
      nextServiceMileage: {
        type: DataTypes.INTEGER.UNSIGNED,
        field: "next_service_mileage",
      },
      status: {
        type: DataTypes.ENUM("available", "rented", "maintenance", "out_of_service"),
        defaultValue: "available",
      },
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Car",
      tableName: "cars",
      underscored: true,
      timestamps: true,
    }
  );

  return Car;
};
