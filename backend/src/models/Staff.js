"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Staff extends Model {
    static associate(models) {
      Staff.belongsTo(models.Company, { foreignKey: "companyId", as: "company" });
      Staff.hasMany(models.Booking, { foreignKey: "createdByStaffId", as: "createdBookings" });
    }
  }

  Staff.init(
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
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("manager", "regular"),
        allowNull: false,
        defaultValue: "regular",
      },
      phone: DataTypes.STRING(50),
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "is_active",
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        field: "last_login_at",
      },
      passwordResetToken: {
        type: DataTypes.STRING(255),
        field: "password_reset_token",
      },
      passwordResetExpires: {
        type: DataTypes.DATE,
        field: "password_reset_expires",
      },
    },
    {
      sequelize,
      modelName: "Staff",
      tableName: "staff",
      underscored: true,
      timestamps: true,
    }
  );

  return Staff;
};
