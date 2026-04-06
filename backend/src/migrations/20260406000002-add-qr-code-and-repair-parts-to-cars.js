"use strict";
const QRCode = require("qrcode");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add qr_code column (base64 image)
    await queryInterface.addColumn("cars", "qr_code", {
      type: Sequelize.TEXT("long"),
      allowNull: true,
    });

    // Add repair_parts JSON column for multi-select parts tracking
    await queryInterface.addColumn("cars", "repair_parts", {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null,
    });

    // Update status ENUM to include 'needs_repair'
    // MySQL: need to modify the ENUM
    await queryInterface.changeColumn("cars", "status", {
      type: Sequelize.ENUM("available", "rented", "maintenance", "out_of_service", "needs_repair"),
      defaultValue: "available",
    });

    // Generate QR codes for all existing cars
    const [cars] = await queryInterface.sequelize.query(
      "SELECT c.id, c.company_id, co.subdomain FROM cars c JOIN companies co ON c.company_id = co.id"
    );

    for (const car of cars) {
      const qrData = JSON.stringify({
        type: "easyrent_car",
        carId: car.id,
        companyId: car.company_id,
        subdomain: car.subdomain,
      });
      const qrBase64 = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      await queryInterface.sequelize.query(
        "UPDATE cars SET qr_code = ? WHERE id = ?",
        { replacements: [qrBase64, car.id] }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("cars", "qr_code");
    await queryInterface.removeColumn("cars", "repair_parts");
    await queryInterface.changeColumn("cars", "status", {
      type: Sequelize.ENUM("available", "rented", "maintenance", "out_of_service"),
      defaultValue: "available",
    });
  },
};
