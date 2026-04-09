"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("booking_requests", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      company_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "companies", key: "id" },
        onDelete: "CASCADE",
      },
      car_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "cars", key: "id" },
        onDelete: "CASCADE",
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      total_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      daily_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      requester_first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      requester_last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      requester_email: {
        type: Sequelize.STRING(255),
      },
      requester_phone: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "confirmed", "rejected"),
        defaultValue: "pending",
      },
      notes: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("booking_requests");
  },
};
