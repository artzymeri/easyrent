"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BookingRequest extends Model {
    static associate(models) {
      BookingRequest.belongsTo(models.Company, { foreignKey: "companyId", as: "company" });
      BookingRequest.belongsTo(models.Car, { foreignKey: "carId", as: "car" });
    }
  }

  BookingRequest.init(
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
      totalDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "total_days",
      },
      dailyRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "daily_rate",
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "total_amount",
      },
      requesterFirstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "requester_first_name",
      },
      requesterLastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "requester_last_name",
      },
      requesterEmail: {
        type: DataTypes.STRING(255),
        field: "requester_email",
      },
      requesterPhone: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "requester_phone",
      },
      status: {
        type: DataTypes.ENUM("pending", "confirmed", "rejected"),
        defaultValue: "pending",
      },
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "BookingRequest",
      tableName: "booking_requests",
      underscored: true,
      timestamps: true,
    }
  );

  return BookingRequest;
};
