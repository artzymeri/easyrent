"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // super_admin has no direct relations to company entities
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
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
        type: DataTypes.ENUM("super_admin"),
        allowNull: false,
        defaultValue: "super_admin",
      },
      firstName: {
        type: DataTypes.STRING(100),
        field: "first_name",
      },
      lastName: {
        type: DataTypes.STRING(100),
        field: "last_name",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "is_active",
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
      modelName: "User",
      tableName: "users",
      underscored: true,
      timestamps: true,
    }
  );

  return User;
};
