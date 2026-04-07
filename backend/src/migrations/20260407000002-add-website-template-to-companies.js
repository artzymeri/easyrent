"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("companies", "website_template", {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: "classic",
      after: "currency",
    });
    await queryInterface.addColumn("companies", "website_published", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: "website_template",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("companies", "website_published");
    await queryInterface.removeColumn("companies", "website_template");
  },
};
