"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CarDocument extends Model {
    static associate(models) {
      CarDocument.belongsTo(models.Car, { foreignKey: "carId", as: "car" });
    }
  }

  CarDocument.init(
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
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "sort_order",
      },
    },
    {
      sequelize,
      modelName: "CarDocument",
      tableName: "car_documents",
      underscored: true,
      timestamps: true,
      updatedAt: false,
    }
  );

  return CarDocument;
};
