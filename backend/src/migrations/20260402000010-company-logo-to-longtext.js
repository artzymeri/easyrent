"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("companies", "logo_url", {
      type: Sequelize.TEXT("long"),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("companies", "logo_url", {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },
};
