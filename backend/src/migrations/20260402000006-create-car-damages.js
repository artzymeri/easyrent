"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("car_damages", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      car_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "cars", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reported_by_staff_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "staff", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      booking_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: "FK added after bookings table is created",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      severity: {
        type: Sequelize.ENUM("minor", "moderate", "major"),
        allowNull: false,
        defaultValue: "minor",
      },
      repair_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      repaired: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      repaired_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("car_damages");
  },
};
