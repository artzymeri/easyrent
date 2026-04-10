"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CarColor extends Model {
    static associate(models) {
      CarColor.hasMany(models.Car, { foreignKey: "colorId", as: "cars" });
    }

    // Get localized name based on language
    getLocalizedName(lang = "en") {
      const field = `name${lang.charAt(0).toUpperCase()}${lang.slice(1)}`;
      return this[field] || this.nameEn;
    }
  }

  CarColor.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      hex: {
        type: DataTypes.STRING(7),
        allowNull: true,
      },
      nameEn: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "name_en",
      },
      nameSq: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "name_sq",
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "sort_order",
      },
    },
    {
      sequelize,
      modelName: "CarColor",
      tableName: "car_colors",
      underscored: true,
    }
  );

  return CarColor;
};
