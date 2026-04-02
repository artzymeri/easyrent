"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.Company, { foreignKey: "companyId", as: "company" });
      Booking.belongsTo(models.Car, { foreignKey: "carId", as: "car" });
      Booking.belongsTo(models.Customer, { foreignKey: "customerId", as: "customer" });
      Booking.belongsTo(models.Staff, { foreignKey: "createdByStaffId", as: "createdBy" });
      Booking.hasMany(models.CarDamage, { foreignKey: "bookingId", as: "damages" });
    }
  }

  Booking.init(
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
      carId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "car_id",
      },
      customerId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "customer_id",
      },
      createdByStaffId: {
        type: DataTypes.INTEGER.UNSIGNED,
        field: "created_by_staff_id",
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "start_date",
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "end_date",
      },
      actualReturnDate: {
        type: DataTypes.DATE,
        field: "actual_return_date",
      },
      status: {
        type: DataTypes.ENUM(
          "pending_start",
          "in_progress",
          "pending_return",
          "completed",
          "cancelled",
          "overdue"
        ),
        defaultValue: "pending_start",
      },
      dailyRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "daily_rate",
      },
      totalDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "total_days",
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      extraCharges: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: "extra_charges",
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "total_amount",
      },
      amountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: "amount_paid",
      },
      paymentStatus: {
        type: DataTypes.ENUM("unpaid", "partial", "paid", "refunded"),
        defaultValue: "unpaid",
        field: "payment_status",
      },
      mileageOut: {
        type: DataTypes.INTEGER.UNSIGNED,
        field: "mileage_out",
      },
      mileageIn: {
        type: DataTypes.INTEGER.UNSIGNED,
        field: "mileage_in",
      },
      pickupLocation: {
        type: DataTypes.STRING(255),
        field: "pickup_location",
      },
      returnLocation: {
        type: DataTypes.STRING(255),
        field: "return_location",
      },
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Booking",
      tableName: "bookings",
      underscored: true,
      timestamps: true,
    }
  );

  return Booking;
};
