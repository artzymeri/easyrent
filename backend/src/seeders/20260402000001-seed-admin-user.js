"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const hash = await bcrypt.hash("easyRENT2026", 12);

    await queryInterface.bulkInsert("users", [
      {
        email: "admin@easyrent.com",
        password: hash,
        role: "super_admin",
        first_name: "Super",
        last_name: "Admin",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", { email: "admin@easyrent.com" });
  },
};
