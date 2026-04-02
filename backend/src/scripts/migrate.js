#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────
 * EasyRent – Safe Migration Runner
 * ─────────────────────────────────────────────────────────────
 *
 * Usage (via npm scripts – see package.json):
 *   npm run migrate              → run all pending UP migrations
 *   npm run migrate:undo         → undo the last migration
 *   npm run migrate:undo:all     → undo all migrations
 *   npm run migrate:status       → show migration tracker status
 *   npm run migrate:drift        → check for modified migration files
 *   npm run migrate:create xxx   → create a new migration stub
 *
 * Every invocation:
 *   1. Ensures the `_migration_meta` tracking table exists.
 *   2. Runs drift detection (warns if a previously-applied file changed).
 *   3. Executes the requested Sequelize CLI command.
 *   4. Records results (batch, checksum, duration, success/fail) in
 *      `_migration_meta`.
 * ─────────────────────────────────────────────────────────────
 */

require("dotenv").config();

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const tracker = require("../utils/migrationTracker");

const MIGRATIONS_DIR = path.resolve(__dirname, "..", "migrations");
const SEQUELIZE_CLI = path.resolve(__dirname, "..", "..", "node_modules", ".bin", "sequelize");

// ── helpers ───────────────────────────────────────────────────
function runCli(args) {
  return execSync(`"${SEQUELIZE_CLI}" ${args}`, {
    stdio: "pipe",
    encoding: "utf8",
    cwd: path.resolve(__dirname, "..", ".."),
  });
}

function pendingFiles() {
  try {
    const output = runCli("db:migrate:status");
    const lines = output.split("\n");
    return lines
      .filter((l) => l.includes("down"))
      .map((l) => l.replace("down", "").trim());
  } catch {
    return [];
  }
}

function appliedFiles() {
  try {
    const output = runCli("db:migrate:status");
    const lines = output.split("\n");
    return lines
      .filter((l) => l.includes("up"))
      .map((l) => l.replace("up", "").trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

// ── commands ─────────────────────────────────────────────────
async function migrateUp() {
  await tracker.ensureMetaTable();

  // drift check
  const warnings = await tracker.detectDrift(MIGRATIONS_DIR);
  if (warnings.length) {
    console.log("\n🔍 Drift Detection Results:");
    warnings.forEach((w) => console.log(`   ${w}`));
    console.log("");
  }

  const pending = pendingFiles();
  if (pending.length === 0) {
    console.log("✅ No pending migrations.");
    return;
  }

  console.log(`\n📦 Running ${pending.length} pending migration(s)...\n`);
  const batch = await tracker.nextBatch();

  for (const file of pending) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const checksum = fs.existsSync(filePath) ? tracker.checksumFile(filePath) : "unknown";
    const start = Date.now();

    try {
      runCli(`db:migrate --to ${file}`);
      const duration = Date.now() - start;
      console.log(`   ✅ ${file}  (${duration}ms)`);
      await tracker.record({
        migration: file,
        batch,
        direction: "up",
        checksum,
        durationMs: duration,
        success: true,
      });
    } catch (err) {
      const duration = Date.now() - start;
      console.error(`   ❌ ${file}  FAILED`);
      console.error(`      ${err.message}`);
      await tracker.record({
        migration: file,
        batch,
        direction: "up",
        checksum,
        durationMs: duration,
        success: false,
        errorMessage: err.message.substring(0, 2000),
      });
      console.error("\n⛔ Migration halted. Fix the error above, then re-run.\n");
      process.exit(1);
    }
  }

  console.log(`\n🎉 Batch #${batch} complete – ${pending.length} migration(s) applied.\n`);
}

async function migrateDown() {
  await tracker.ensureMetaTable();

  const applied = appliedFiles();
  if (applied.length === 0) {
    console.log("✅ Nothing to undo.");
    return;
  }

  const last = applied[applied.length - 1];
  const filePath = path.join(MIGRATIONS_DIR, last);
  const checksum = fs.existsSync(filePath) ? tracker.checksumFile(filePath) : "unknown";
  const batch = await tracker.currentBatch();
  const start = Date.now();

  try {
    console.log(`\n⏪ Undoing: ${last}`);
    runCli("db:migrate:undo");
    const duration = Date.now() - start;
    console.log(`   ✅ Reverted in ${duration}ms\n`);
    await tracker.record({
      migration: last,
      batch,
      direction: "down",
      checksum,
      durationMs: duration,
      success: true,
    });
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`   ❌ Undo FAILED: ${err.message}`);
    await tracker.record({
      migration: last,
      batch,
      direction: "down",
      checksum,
      durationMs: duration,
      success: false,
      errorMessage: err.message.substring(0, 2000),
    });
    process.exit(1);
  }
}

async function migrateUndoAll() {
  await tracker.ensureMetaTable();
  const batch = await tracker.currentBatch();
  const start = Date.now();

  try {
    console.log("\n⏪ Undoing ALL migrations...");
    runCli("db:migrate:undo:all");
    const duration = Date.now() - start;
    console.log(`   ✅ All migrations reverted in ${duration}ms\n`);
    await tracker.record({
      migration: "__ALL__",
      batch,
      direction: "down",
      checksum: "n/a",
      durationMs: duration,
      success: true,
    });
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`   ❌ Undo all FAILED: ${err.message}`);
    await tracker.record({
      migration: "__ALL__",
      batch,
      direction: "down",
      checksum: "n/a",
      durationMs: duration,
      success: false,
      errorMessage: err.message.substring(0, 2000),
    });
    process.exit(1);
  }
}

async function showStatus() {
  await tracker.ensureMetaTable();
  const rows = await tracker.status();

  if (rows.length === 0) {
    console.log("\n📋 No migration history recorded yet.\n");
    return;
  }

  console.log("\n📋 Migration History:\n");
  console.log(
    "  Batch | Direction | Success |  Duration | Environment | Migration"
  );
  console.log("  " + "─".repeat(90));
  for (const r of rows) {
    const ok = r.success ? "   ✅  " : "   ❌  ";
    const dur = r.duration_ms != null ? `${String(r.duration_ms).padStart(6)}ms` : "     n/a";
    console.log(
      `  ${String(r.batch).padStart(5)} | ${r.direction.padEnd(9)} | ${ok} | ${dur} | ${r.environment.padEnd(11)} | ${r.migration}`
    );
    if (r.error_message) {
      console.log(`         └─ Error: ${r.error_message.substring(0, 120)}`);
    }
  }
  console.log("");
}

async function driftCheck() {
  await tracker.ensureMetaTable();
  const warnings = await tracker.detectDrift(MIGRATIONS_DIR);

  if (warnings.length === 0) {
    console.log("\n✅ No drift detected – all applied migrations match their source files.\n");
  } else {
    console.log("\n🔍 Drift Detection Results:\n");
    warnings.forEach((w) => console.log(`   ${w}`));
    console.log(`\n⚠  ${warnings.length} issue(s) found. Review before deploying.\n`);
    process.exit(1);
  }
}

async function createMigration() {
  const name = process.argv[3];
  if (!name) {
    console.error("Usage: npm run migrate:create <migration-name>");
    process.exit(1);
  }
  try {
    const output = runCli(`migration:generate --name ${name}`);
    console.log(output);
  } catch (err) {
    console.error("Failed to create migration:", err.message);
    process.exit(1);
  }
}

// ── main ─────────────────────────────────────────────────────
(async () => {
  const command = process.argv[2] || "up";

  try {
    switch (command) {
      case "up":
        await migrateUp();
        break;
      case "down":
        await migrateDown();
        break;
      case "down:all":
        await migrateUndoAll();
        break;
      case "status":
        await showStatus();
        break;
      case "drift":
        await driftCheck();
        break;
      case "create":
        await createMigration();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.log("Available: up, down, down:all, status, drift, create");
        process.exit(1);
    }
  } catch (err) {
    console.error("Migration runner error:", err);
    process.exit(1);
  } finally {
    await tracker.close();
  }
})();
