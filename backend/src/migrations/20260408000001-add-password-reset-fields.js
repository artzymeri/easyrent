"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add reset fields to users (admin)
    await queryInterface.addColumn("users", "password_reset_token", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("users", "password_reset_expires", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Add reset fields to staff
    await queryInterface.addColumn("staff", "password_reset_token", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("staff", "password_reset_expires", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "password_reset_token");
    await queryInterface.removeColumn("users", "password_reset_expires");
    await queryInterface.removeColumn("staff", "password_reset_token");
    await queryInterface.removeColumn("staff", "password_reset_expires");
  },
};
