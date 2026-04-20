"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WebsiteSlide extends Model {
    static associate(models) {
      WebsiteSlide.belongsTo(models.Company, { foreignKey: "companyId", as: "company" });
    }
  }

  WebsiteSlide.init(
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
      title: {
        type: DataTypes.STRING(255),
      },
      subtitle: {
        type: DataTypes.STRING(500),
      },
      imageUrl: {
        type: DataTypes.TEXT("long"),
        field: "image_url",
      },
      buttonText: {
        type: DataTypes.STRING(100),
        field: "button_text",
      },
      buttonLink: {
        type: DataTypes.STRING(500),
        field: "button_link",
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "sort_order",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "is_active",
      },
    },
    {
      sequelize,
      modelName: "WebsiteSlide",
      tableName: "website_slides",
      underscored: true,
      timestamps: true,
    }
  );

  return WebsiteSlide;
};
