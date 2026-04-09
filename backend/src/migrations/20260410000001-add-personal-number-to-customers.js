"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("customers", "personal_number", {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: "id_number",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("customers", "personal_number");
  },
};
