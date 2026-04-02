/**
 * ─────────────────────────────────────────────────────────────
 * EasyRent – Robust Migration Tracker
 * ─────────────────────────────────────────────────────────────
 *
 * This module wraps Sequelize CLI migrations with a **database-backed
 * tracking layer** stored in the `_migration_meta` table.
 *
 * What it records for every migration run:
 *   • migration filename
 *   • direction (up / down)
 *   • batch number (groups all migrations of a single `npm run migrate`)
 *   • checksum (SHA-256 of the migration file contents)
 *   • duration in milliseconds
 *   • environment (development / production / test)
 *   • hostname of the machine that ran it
 *   • success / failure status + optional error message
 *
 * WHY?
 *   After weeks of coding you push to production – you need to know
 *   exactly which migrations have been applied, in which order, and
 *   whether the file has been modified since it was last run.
 *   This table gives you a full audit trail.
 *
 * The standard SequelizeMeta table (used by sequelize-cli) is still
 * the source of truth for "which migrations are pending". This tracker
 * is a *companion* that adds observability on top.
 * ─────────────────────────────────────────────────────────────
 */

const { Sequelize } = require("sequelize");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const os = require("os");
const config = require("../config/database");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// Standalone sequelize instance so the tracker can work independently
let _sequelize;
function getSequelize() {
  if (!_sequelize) {
    _sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: false,
      }
    );
  }
  return _sequelize;
}

// ── ensure tracking table exists ──────────────────────────────
async function ensureMetaTable() {
  const sequelize = getSequelize();
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`_migration_meta\` (
      \`id\`             INT          AUTO_INCREMENT PRIMARY KEY,
      \`migration\`      VARCHAR(255) NOT NULL,
      \`batch\`          INT          NOT NULL,
      \`direction\`      ENUM('up','down') NOT NULL DEFAULT 'up',
      \`checksum\`       CHAR(64)     NOT NULL,
      \`duration_ms\`    INT          NULL,
      \`environment\`    VARCHAR(50)  NOT NULL,
      \`hostname\`       VARCHAR(255) NOT NULL,
      \`success\`        TINYINT(1)   NOT NULL DEFAULT 1,
      \`error_message\`  TEXT         NULL,
      \`executed_at\`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

// ── helpers ───────────────────────────────────────────────────
function checksumFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function currentBatch() {
  const sequelize = getSequelize();
  const [[row]] = await sequelize.query(
    "SELECT COALESCE(MAX(`batch`), 0) AS max_batch FROM `_migration_meta` WHERE `direction` = 'up'"
  );
  return row.max_batch;
}

async function nextBatch() {
  return (await currentBatch()) + 1;
}

// ── record a migration run ───────────────────────────────────
async function record({ migration, batch, direction, checksum, durationMs, success, errorMessage }) {
  const sequelize = getSequelize();
  await sequelize.query(
    `INSERT INTO \`_migration_meta\`
       (\`migration\`, \`batch\`, \`direction\`, \`checksum\`, \`duration_ms\`, \`environment\`, \`hostname\`, \`success\`, \`error_message\`)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    {
      replacements: [
        migration,
        batch,
        direction,
        checksum,
        durationMs,
        env,
        os.hostname(),
        success ? 1 : 0,
        errorMessage || null,
      ],
    }
  );
}

// ── detect tampered migration files ──────────────────────────
async function detectDrift(migrationsDir) {
  const sequelize = getSequelize();
  const [rows] = await sequelize.query(
    `SELECT \`migration\`, \`checksum\`
       FROM \`_migration_meta\`
      WHERE \`direction\` = 'up' AND \`success\` = 1
      ORDER BY \`id\` ASC`
  );

  const warnings = [];
  for (const row of rows) {
    const filePath = path.join(migrationsDir, row.migration);
    if (!fs.existsSync(filePath)) {
      warnings.push(`⚠  MISSING file: ${row.migration} (was applied but file no longer exists)`);
      continue;
    }
    const currentChecksum = checksumFile(filePath);
    if (currentChecksum !== row.checksum) {
      warnings.push(
        `⚠  MODIFIED: ${row.migration}\n` +
        `      recorded checksum: ${row.checksum}\n` +
        `      current  checksum: ${currentChecksum}`
      );
    }
  }
  return warnings;
}

// ── pretty status report ─────────────────────────────────────
async function status() {
  const sequelize = getSequelize();
  const [rows] = await sequelize.query(
    `SELECT \`migration\`, \`batch\`, \`direction\`, \`environment\`, \`hostname\`,
            \`success\`, \`error_message\`, \`duration_ms\`, \`executed_at\`
       FROM \`_migration_meta\`
      ORDER BY \`id\` ASC`
  );
  return rows;
}

async function close() {
  if (_sequelize) {
    await _sequelize.close();
    _sequelize = null;
  }
}

module.exports = {
  ensureMetaTable,
  checksumFile,
  currentBatch,
  nextBatch,
  record,
  detectDrift,
  status,
  close,
  getSequelize,
};
