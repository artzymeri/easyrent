"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CarImage extends Model {
    static associate(models) {
      CarImage.belongsTo(models.Car, { foreignKey: "carId", as: "car" });
    }
  }

  CarImage.init(
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
      url: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      isPrimary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_primary",
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "sort_order",
      },
    },
    {
      sequelize,
      modelName: "CarImage",
      tableName: "car_images",
      underscored: true,
      timestamps: true,
      updatedAt: false,
    }
  );

  return CarImage;
};
