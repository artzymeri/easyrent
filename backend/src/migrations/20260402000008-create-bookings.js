"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bookings", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      company_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      car_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "cars", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      customer_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "customers", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      created_by_staff_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "staff", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      // Dates
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      actual_return_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      // Status flow: pending_start → in_progress → pending_return → completed / cancelled
      status: {
        type: Sequelize.ENUM(
          "pending_start",
          "in_progress",
          "pending_return",
          "completed",
          "cancelled",
          "overdue"
        ),
        allowNull: false,
        defaultValue: "pending_start",
      },
      // Pricing
      daily_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      total_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      extra_charges: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      amount_paid: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      payment_status: {
        type: Sequelize.ENUM("unpaid", "partial", "paid", "refunded"),
        allowNull: false,
        defaultValue: "unpaid",
      },
      // Mileage tracking
      mileage_out: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      mileage_in: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      // Pickup/return
      pickup_location: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      return_location: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
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

    // Add FK from car_damages to bookings now that bookings exists
    await queryInterface.addConstraint("car_damages", {
      fields: ["booking_id"],
      type: "foreign key",
      name: "car_damages_booking_id_fk",
      references: { table: "bookings", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("car_damages", "car_damages_booking_id_fk");
    await queryInterface.dropTable("bookings");
  },
};
