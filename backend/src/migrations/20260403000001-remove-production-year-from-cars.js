"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn("cars", "production_year");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("cars", "production_year", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "year",
    });
  },
};
