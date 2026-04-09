"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CustomerDocument extends Model {
    static associate(models) {
      CustomerDocument.belongsTo(models.Customer, {
        foreignKey: "customerId",
        as: "customer",
      });
    }
  }

  CustomerDocument.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      customerId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "customer_id",
      },
      url: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      documentType: {
        type: DataTypes.ENUM("id_card", "drivers_license", "passport", "other"),
        allowNull: false,
        defaultValue: "other",
        field: "document_type",
      },
    },
    {
      sequelize,
      modelName: "CustomerDocument",
      tableName: "customer_documents",
      underscored: true,
      timestamps: true,
    }
  );

  return CustomerDocument;
};
