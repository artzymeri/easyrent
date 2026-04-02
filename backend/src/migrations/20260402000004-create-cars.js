"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("cars", {
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
      make: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      color: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      license_plate: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      vin: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      engine: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "e.g. 2.0L Turbo, 3.5L V6",
      },
      fuel_type: {
        type: Sequelize.ENUM("gasoline", "diesel", "electric", "hybrid", "plugin_hybrid", "lpg"),
        allowNull: false,
        defaultValue: "gasoline",
      },
      transmission: {
        type: Sequelize.ENUM("automatic", "manual"),
        allowNull: false,
        defaultValue: "automatic",
      },
      mileage: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        comment: "Current mileage in km",
      },
      seats: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: true,
        defaultValue: 5,
      },
      daily_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "Price per day",
      },
      // Government registration / reservation
      registration_expiry: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "Government registration valid until",
      },
      // Insurance
      insurance_provider: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      insurance_policy_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      insurance_expiry: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      // Maintenance
      last_service_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      next_service_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      next_service_mileage: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: "Mileage at which next service is due",
      },
      status: {
        type: Sequelize.ENUM("available", "rented", "maintenance", "out_of_service"),
        allowNull: false,
        defaultValue: "available",
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("cars");
  },
};
