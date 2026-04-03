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

## Design Theme

The app uses a **blue primary color** inspired by mainstream car rental/sharing platforms (Turo, Getaround, Enterprise). This provides a modern, trustworthy feel suitable for a car rental SaaS.

| Token               | Light Mode                           | Dark Mode                            |
| -------------------- | ------------------------------------ | ------------------------------------ |
| `--primary`          | `oklch(0.546 0.245 262.881)` (blue)  | `oklch(0.623 0.214 262.881)` (blue)  |
| `--destructive`      | `oklch(0.577 0.245 27.325)` (red)    | `oklch(0.704 0.191 22.216)` (red)    |

### Theme guidelines
- **Primary (blue)** — main action buttons, active nav items, links, focus rings, badges
- **Secondary** — subtle backgrounds, secondary actions (lightly tinted blue-gray)
- **Destructive (red)** — delete actions, error states
- **Accent** — hover backgrounds, selected rows (light blue tint)
- Do NOT use pure black (`oklch(0.205 0 0)`) for primary buttons — always use `--primary`
- Sidebar uses the same blue for active items and ring

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
- **Talks to**: The backend REST API at `http://localhost:4344/api`.
- **Port**: Runs on `http://localhost:4345` during development.

## Guidelines for AI Assistants

1. **Always use shadcn/ui** components from `@/components/ui/*` — they are all already installed. Do not install external UI libraries.
2. Use the **App Router** (`app/` directory) with Server Components by default; add `"use client"` only when needed.
3. Keep API calls in dedicated service files under `src/lib/` or `src/services/`.
4. Follow a consistent naming pattern: `kebab-case` for files, `PascalCase` for components.
5. This is a public-facing app — prioritize UX, performance, accessibility, and mobile responsiveness.
6. Features to expect (not yet implemented): property listing/search, rental application flow, tenant dashboard, payment portal, maintenance request submission, lease document viewing, account management.
7. **NEVER use emojis in the UI.** Always use **Lucide React icons** (`lucide-react`) instead of emoji characters. This applies to navigation, buttons, feature cards, labels — everywhere.

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
