# Claude.md – EasyRent Backend API

## Project Overview

This is the **Backend API** for EasyRent — a rental enterprise application. It is a Node.js/Express REST API that serves both the Admin Panel and the Tenant-Facing Frontend.

## Tech Stack

| Layer          | Technology                                    |
| -------------- | --------------------------------------------- |
| Runtime        | **Node.js** (CommonJS)                        |
| Framework      | **Express 5**                                 |
| Database       | **MySQL** via **Sequelize ORM**               |
| Authentication | **JWT** (jsonwebtoken) + **bcrypt**           |
| Validation     | **express-validator**                         |
| Security       | **helmet**, **cors**, **express-rate-limit**  |
| Dev Tooling    | **nodemon**, **sequelize-cli**                |
| Migrations     | **Sequelize CLI** + custom `_migration_meta` tracker |

## Directory Layout

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       ← Sequelize DB config (dev/test/prod)
│   ├── controllers/          ← Route handlers (business logic)
│   ├── middleware/
│   │   ├── auth.js           ← JWT authentication + role authorization
│   │   └── validate.js       ← express-validator error formatter
│   ├── migrations/           ← Sequelize migration files
│   ├── models/               ← Sequelize model definitions
│   ├── routes/               ← Express route modules
│   ├── scripts/
│   │   └── migrate.js        ← Custom migration runner with tracking
│   ├── seeders/              ← Sequelize seed files
│   ├── services/             ← Business logic services
│   ├── utils/
│   │   └── migrationTracker.js ← DB-backed migration audit trail
│   ├── app.js                ← Express app setup (middleware, routes)
│   ├── db.js                 ← Sequelize instance + model registry
│   └── server.js             ← Entry point (connects DB, starts server)
├── .env                      ← Environment variables (DO NOT COMMIT)
├── .env.example              ← Template for .env
├── .sequelizerc              ← Sequelize CLI path config
└── package.json
```

## NPM Scripts

| Script                | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `npm run dev`         | Start server with nodemon (auto-restart on changes)   |
| `npm start`           | Start server for production                           |
| `npm run migrate`     | Run all pending migrations (tracked in `_migration_meta`) |
| `npm run migrate:undo`| Undo the last migration                               |
| `npm run migrate:undo:all` | Undo all migrations                              |
| `npm run migrate:status`   | Show full migration history from tracker          |
| `npm run migrate:drift`    | Detect if applied migration files were modified   |
| `npm run migrate:create <name>` | Generate a new migration file               |
| `npm run seed`        | Run all seeders                                       |
| `npm run seed:undo`   | Undo all seeders                                      |

## Migration Tracking System

The standard `SequelizeMeta` table only records which migrations have been applied. This project adds a **`_migration_meta`** companion table that records:

- **Batch number** — groups all migrations from a single `npm run migrate` invocation
- **Direction** — `up` or `down`
- **SHA-256 checksum** — of the migration file at time of execution
- **Duration** — how long each migration took
- **Environment** — which env it ran in (dev / prod / test)
- **Hostname** — which machine ran it
- **Success/failure** — with error messages on failure

### Drift Detection

Before every `npm run migrate`, the runner compares the current checksum of each previously-applied migration file against the recorded checksum. If a file has been modified after it was applied, you get a warning. This prevents deploying to production with silently-changed migrations.

## Guidelines for AI Assistants

1. **Create migrations for every schema change** — never modify the database by hand or via `sync({ alter: true })`.
2. Use `npm run migrate:create <descriptive-name>` to generate migration stubs.
3. Register new models in `src/db.js` after creating them.
4. Register new route files in `src/app.js`.
5. Always use the `authenticate` and `authorize` middleware from `src/middleware/auth.js` for protected routes.
6. Use `express-validator` + the `validate` middleware for request validation.
7. Hash passwords with `bcrypt` (cost factor 12).
8. Keep business logic in `src/services/`, controllers should be thin.
9. The API serves two frontends: Admin (port 3001) and Tenant (port 3000).
10. Features to expect (not yet implemented): auth system, property CRUD, tenant management, lease management, payment processing, maintenance tickets, reporting endpoints.
