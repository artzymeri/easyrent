"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      Company.hasMany(models.Staff, { foreignKey: "companyId", as: "staff" });
      Company.hasMany(models.Car, { foreignKey: "companyId", as: "cars" });
      Company.hasMany(models.Customer, { foreignKey: "companyId", as: "customers" });
      Company.hasMany(models.Booking, { foreignKey: "companyId", as: "bookings" });
    }
  }

  Company.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      subdomain: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      logoUrl: {
        type: DataTypes.STRING(500),
        field: "logo_url",
      },
      email: DataTypes.STRING(255),
      phone: DataTypes.STRING(50),
      address: DataTypes.TEXT,
      city: DataTypes.STRING(100),
      country: DataTypes.STRING(100),
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "is_active",
      },
      onboardingCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "onboarding_completed",
      },
    },
    {
      sequelize,
      modelName: "Company",
      tableName: "companies",
      underscored: true,
      timestamps: true,
    }
  );

  return Company;
};
