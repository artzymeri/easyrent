"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add secondary driver fields to bookings
    await queryInterface.addColumn("bookings", "secondary_driver_name", {
      type: Sequelize.STRING(200),
      allowNull: true,
    });
    await queryInterface.addColumn("bookings", "secondary_driver_phone", {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn("bookings", "secondary_driver_id_number", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn("bookings", "secondary_driver_license", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    // Create booking_images table for pre-start / post-return images
    await queryInterface.createTable("booking_images", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      booking_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "bookings", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      url: {
        type: Sequelize.TEXT("long"),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("pre_start", "post_return"),
        allowNull: false,
        defaultValue: "pre_start",
      },
      caption: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("booking_images");
    await queryInterface.removeColumn("bookings", "secondary_driver_name");
    await queryInterface.removeColumn("bookings", "secondary_driver_phone");
    await queryInterface.removeColumn("bookings", "secondary_driver_id_number");
    await queryInterface.removeColumn("bookings", "secondary_driver_license");
  },
};
