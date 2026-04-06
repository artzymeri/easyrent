"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BookingImage extends Model {
    static associate(models) {
      BookingImage.belongsTo(models.Booking, { foreignKey: "bookingId", as: "booking" });
    }
  }

  BookingImage.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      bookingId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "booking_id",
      },
      url: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("pre_start", "post_return"),
        allowNull: false,
        defaultValue: "pre_start",
      },
      caption: {
        type: DataTypes.STRING(255),
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
      modelName: "BookingImage",
      tableName: "booking_images",
      underscored: true,
      timestamps: true,
      updatedAt: false,
    }
  );

  return BookingImage;
};
