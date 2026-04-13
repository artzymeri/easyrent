"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("insurance_providers", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      company_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: "Stored lowercase, dashes instead of spaces",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // Migrate existing insurance_provider values from cars into the new table
    // so no data is lost
    const [rows] = await queryInterface.sequelize.query(`
      SELECT DISTINCT c.company_id, c.insurance_provider
      FROM cars c
      WHERE c.insurance_provider IS NOT NULL
        AND c.insurance_provider != ''
    `);

    for (const row of rows) {
      // Normalize: lowercase, replace spaces with dashes
      const normalized = row.insurance_provider
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      // Check if already exists for this company
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM insurance_providers WHERE company_id = ? AND name = ?`,
        { replacements: [row.company_id, normalized] }
      );

      if (existing.length === 0) {
        await queryInterface.sequelize.query(
          `INSERT INTO insurance_providers (company_id, name, is_active, created_at, updated_at)
           VALUES (?, ?, true, NOW(), NOW())`,
          { replacements: [row.company_id, normalized] }
        );
      }
    }

    // Now normalize all existing insurance_provider values in cars table
    const [allCars] = await queryInterface.sequelize.query(`
      SELECT id, insurance_provider
      FROM cars
      WHERE insurance_provider IS NOT NULL
        AND insurance_provider != ''
    `);

    for (const car of allCars) {
      const normalized = car.insurance_provider
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      if (normalized !== car.insurance_provider) {
        await queryInterface.sequelize.query(
          `UPDATE cars SET insurance_provider = ? WHERE id = ?`,
          { replacements: [normalized, car.id] }
        );
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable("insurance_providers");
  },
};
