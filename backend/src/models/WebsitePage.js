"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WebsitePage extends Model {
    static associate(models) {
      WebsitePage.belongsTo(models.Company, { foreignKey: "companyId", as: "company" });
    }
  }

  WebsitePage.init(
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
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT("long"),
      },
      metaDescription: {
        type: DataTypes.STRING(500),
        field: "meta_description",
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "is_published",
      },
      heroImageUrl: {
        type: DataTypes.TEXT("long"),
        field: "hero_image_url",
      },
      extraData: {
        type: DataTypes.TEXT("long"),
        field: "extra_data",
        get() {
          const raw = this.getDataValue("extraData");
          if (!raw) return {};
          try { return JSON.parse(raw); } catch { return {}; }
        },
        set(val) {
          this.setDataValue("extraData", val ? JSON.stringify(val) : null);
        },
      },
    },
    {
      sequelize,
      modelName: "WebsitePage",
      tableName: "website_pages",
      underscored: true,
      timestamps: true,
    }
  );

  return WebsitePage;
};
