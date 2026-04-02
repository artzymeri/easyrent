"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CarDamage extends Model {
    static associate(models) {
      CarDamage.belongsTo(models.Car, { foreignKey: "carId", as: "car" });
      CarDamage.belongsTo(models.Staff, { foreignKey: "reportedByStaffId", as: "reportedBy" });
      CarDamage.belongsTo(models.Booking, { foreignKey: "bookingId", as: "booking" });
    }
  }

  CarDamage.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      carId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "car_id",
      },
      reportedByStaffId: {
        type: DataTypes.INTEGER.UNSIGNED,
        field: "reported_by_staff_id",
      },
      bookingId: {
        type: DataTypes.INTEGER.UNSIGNED,
        field: "booking_id",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      severity: {
        type: DataTypes.ENUM("minor", "moderate", "major"),
        defaultValue: "minor",
      },
      repairCost: {
        type: DataTypes.DECIMAL(10, 2),
        field: "repair_cost",
      },
      repaired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      repairedAt: {
        type: DataTypes.DATE,
        field: "repaired_at",
      },
      imageUrl: {
        type: DataTypes.STRING(500),
        field: "image_url",
      },
    },
    {
      sequelize,
      modelName: "CarDamage",
      tableName: "car_damages",
      underscored: true,
      timestamps: true,
    }
  );

  return CarDamage;
};
