"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.belongsTo(models.Company, { foreignKey: "companyId", as: "company" });
      Customer.hasMany(models.Booking, { foreignKey: "customerId", as: "bookings" });
      Customer.hasMany(models.CustomerDocument, { foreignKey: "customerId", as: "documents" });
    }
  }

  Customer.init(
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
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "first_name",
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "last_name",
      },
      email: DataTypes.STRING(255),
      phone: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      idNumber: {
        type: DataTypes.STRING(100),
        field: "id_number",
      },
      driversLicense: {
        type: DataTypes.STRING(100),
        field: "drivers_license",
      },
      driversLicenseExpiry: {
        type: DataTypes.DATEONLY,
        field: "drivers_license_expiry",
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        field: "date_of_birth",
      },
      address: DataTypes.TEXT,
      city: DataTypes.STRING(100),
      country: DataTypes.STRING(100),
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Customer",
      tableName: "customers",
      underscored: true,
      timestamps: true,
    }
  );

  return Customer;
};
