"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("companies", "slogan", {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: "logo_url",
    });
    await queryInterface.addColumn("companies", "signature", {
      type: Sequelize.TEXT("long"),
      allowNull: true,
      after: "slogan",
    });
    await queryInterface.addColumn("companies", "stamp_url", {
      type: Sequelize.TEXT("long"),
      allowNull: true,
      after: "signature",
    });
    await queryInterface.addColumn("companies", "business_number", {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: "stamp_url",
    });
    await queryInterface.addColumn("companies", "business_fax_number", {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: "business_number",
    });
    await queryInterface.addColumn("companies", "company_id_number", {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: "business_fax_number",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("companies", "slogan");
    await queryInterface.removeColumn("companies", "signature");
    await queryInterface.removeColumn("companies", "stamp_url");
    await queryInterface.removeColumn("companies", "business_number");
    await queryInterface.removeColumn("companies", "business_fax_number");
    await queryInterface.removeColumn("companies", "company_id_number");
  },
};
