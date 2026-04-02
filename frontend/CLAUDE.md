@AGENTS.md

# Claude.md – EasyRent Frontend (Tenant / Public)

## Project Overview

This is the **Tenant-Facing Frontend** for EasyRent — a rental enterprise application. It is the public-facing web app used by prospective and current tenants to browse listings, apply for rentals, manage their lease, make payments, and submit maintenance requests.

## Tech Stack

| Layer       | Technology                           |
| ----------- | ------------------------------------ |
| Framework   | **Next.js** (App Router, TypeScript) |
| UI Library  | **shadcn/ui** (all components)       |
| Styling     | **Tailwind CSS v4**                  |
| State/Fetch | TBD (likely React Query / Zustand)   |

## Directory Layout

```
frontend/
├── src/
│   ├── app/              ← Next.js App Router pages & layouts
│   ├── components/
│   │   └── ui/           ← shadcn/ui components (all installed)
│   ├── hooks/            ← custom React hooks
│   └── lib/              ← utilities (cn, api client, etc.)
├── public/               ← static assets
├── components.json       ← shadcn/ui config
├── tailwind.config.ts
└── tsconfig.json
```

## Role in the System

- **Consumers**: Tenants, prospective renters, general public.
- **Talks to**: The backend REST API at `http://localhost:5000/api`.
- **Port**: Runs on `http://localhost:3000` during development.

## Guidelines for AI Assistants

1. **Always use shadcn/ui** components from `@/components/ui/*` — they are all already installed. Do not install external UI libraries.
2. Use the **App Router** (`app/` directory) with Server Components by default; add `"use client"` only when needed.
3. Keep API calls in dedicated service files under `src/lib/` or `src/services/`.
4. Follow a consistent naming pattern: `kebab-case` for files, `PascalCase` for components.
5. This is a public-facing app — prioritize UX, performance, accessibility, and mobile responsiveness.
6. Features to expect (not yet implemented): property listing/search, rental application flow, tenant dashboard, payment portal, maintenance request submission, lease document viewing, account management.

## Localization (i18n) — MANDATORY

**Every UI-facing string MUST be localized.** This project supports two languages:

| Code | Language          |
| ---- | ----------------- |
| `en` | English           |
| `sq` | Albanian (Shqip)  |

### Rules

1. **Never hardcode user-visible text.** Always use `t("section.key")` from the `useTranslation()` hook (`@/lib/i18n`).
2. When adding or changing any UI text, **update both** translation files:
   - `src/lib/i18n/en.json` — English
   - `src/lib/i18n/sq.json` — Albanian
3. Use **dot-notation nested keys** grouped by page/section (e.g., `customersPage.dialogTitle`, `common.cancel`).
4. For dynamic values use `{param}` interpolation: `t("key", { name: value })`.
5. The language switcher is in **Settings** (`/dashboard/settings`). Locale is persisted in `localStorage` under `easyrent_locale`.
6. Components using `t()` must be client components (`"use client"`).
7. Reuse `common.*` keys for shared UI text (Cancel, Save, Delete, Loading, etc.).
