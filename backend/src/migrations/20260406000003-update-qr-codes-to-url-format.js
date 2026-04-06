"use strict";
const QRCode = require("qrcode");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Regenerate QR codes to use URL format instead of JSON
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4345";

    const [cars] = await queryInterface.sequelize.query("SELECT id FROM cars");

    for (const car of cars) {
      const qrUrl = `${frontendUrl}/qr/${car.id}`;
      const qrBase64 = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
      });
      await queryInterface.sequelize.query(
        "UPDATE cars SET qr_code = ? WHERE id = ?",
        { replacements: [qrBase64, car.id] }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // No-op: revert not needed
  },
};
