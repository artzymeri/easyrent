"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("companies", "currency", {
      type: Sequelize.STRING(3),
      allowNull: false,
      defaultValue: "EUR",
      after: "country",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("companies", "currency");
  },
};
