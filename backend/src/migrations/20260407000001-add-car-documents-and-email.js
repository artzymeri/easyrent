"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Car documents table
    await queryInterface.createTable("car_documents", {
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
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      url: {
        type: Sequelize.TEXT("long"),
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(50),
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

    // Ensure email column exists on customers (it should already, but make sure)
    const customerCols = await queryInterface.describeTable("customers");
    if (!customerCols.email) {
      await queryInterface.addColumn("customers", "email", {
        type: Sequelize.STRING(255),
        allowNull: true,
        after: "last_name",
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable("car_documents");
  },
};
