"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      Company.hasMany(models.Staff, { foreignKey: "companyId", as: "staff" });
      Company.hasMany(models.Car, { foreignKey: "companyId", as: "cars" });
      Company.hasMany(models.Customer, { foreignKey: "companyId", as: "customers" });
      Company.hasMany(models.Booking, { foreignKey: "companyId", as: "bookings" });
      Company.hasMany(models.DeliveryPoint, { foreignKey: "companyId", as: "deliveryPoints" });
      Company.hasMany(models.BookingRequest, { foreignKey: "companyId", as: "bookingRequests" });
      Company.hasMany(models.WebsiteSlide, { foreignKey: "companyId", as: "websiteSlides" });
      Company.hasMany(models.WebsitePage, { foreignKey: "companyId", as: "websitePages" });
      Company.hasMany(models.BlogPost, { foreignKey: "companyId", as: "blogPosts" });
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
        type: DataTypes.TEXT("long"),
        field: "logo_url",
      },
      slogan: {
        type: DataTypes.STRING(500),
      },
      signature: {
        type: DataTypes.TEXT("long"),
      },
      stampUrl: {
        type: DataTypes.TEXT("long"),
        field: "stamp_url",
      },
      businessNumber: {
        type: DataTypes.STRING(100),
        field: "business_number",
      },
      businessFaxNumber: {
        type: DataTypes.STRING(100),
        field: "business_fax_number",
      },
      companyIdNumber: {
        type: DataTypes.STRING(100),
        field: "company_id_number",
      },
      email: DataTypes.STRING(255),
      phone: DataTypes.STRING(50),
      address: DataTypes.TEXT,
      city: DataTypes.STRING(100),
      country: DataTypes.STRING(100),
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "EUR",
      },
      websiteTemplate: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "classic",
        field: "website_template",
      },
      websitePublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "website_published",
      },
      heroSlideSource: {
        type: DataTypes.STRING(20),
        defaultValue: "custom",
        field: "hero_slide_source",
      },
      websiteNavLinks: {
        type: DataTypes.TEXT,
        field: "website_nav_links",
        get() {
          const raw = this.getDataValue("websiteNavLinks");
          if (!raw) return ["home", "cars", "about", "contact", "blog"];
          try { return JSON.parse(raw); } catch { return ["home", "cars", "about", "contact", "blog"]; }
        },
        set(val) {
          this.setDataValue("websiteNavLinks", val ? JSON.stringify(val) : null);
        },
      },
      websitePrimaryColor: {
        type: DataTypes.STRING(7),
        field: "website_primary_color",
      },
      websiteHeroTitle: {
        type: DataTypes.STRING(500),
        field: "website_hero_title",
      },
      websiteHeroSubtitle: {
        type: DataTypes.STRING(1000),
        field: "website_hero_subtitle",
      },
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
