@AGENTS.md

# Claude.md – EasyRent Admin Panel

## Project Overview

This is the **Admin Panel** for EasyRent — a rental enterprise application. It is the internal-facing dashboard used by company staff (admins, managers, support agents) to manage the entire rental business.

## Tech Stack

| Layer       | Technology                           |
| ----------- | ------------------------------------ |
| Framework   | **Next.js** (App Router, TypeScript) |
| UI Library  | **shadcn/ui** (all components)       |
| Styling     | **Tailwind CSS v4**                  |
| State/Fetch | TBD (likely React Query / Zustand)   |

## Directory Layout

```
admin/
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

- **Consumers**: Internal staff only — admins, property managers, support.
- **Talks to**: The backend REST API at `http://localhost:4344/api`.
- **Port**: Runs on `http://localhost:4346` during development (to avoid collision with the tenant-facing frontend on 4345).

## Guidelines for AI Assistants

1. **Always use shadcn/ui** components from `@/components/ui/*` — they are all already installed. Do not install external UI libraries.
2. Use the **App Router** (`app/` directory) with Server Components by default; add `"use client"` only when needed.
3. Keep API calls in dedicated service files under `src/lib/` or `src/services/`.
4. Follow a consistent naming pattern: `kebab-case` for files, `PascalCase` for components.
5. This panel will eventually need role-based access control — design pages with that in mind.
6. Features to expect (not yet implemented): property management, tenant management, lease/contract management, payment tracking, maintenance requests, reporting/analytics dashboard, user & role management.
7. **NEVER use emojis in the UI.** Always use **Lucide React icons** (`lucide-react`) instead of emoji characters. This applies to navigation, buttons, feature cards, labels — everywhere.
8. **Loading states must always use the `<Spinner>` component** (`@/components/ui/spinner`), never text like "Loading...". Use `<Spinner className="h-8 w-8" />` centered in a flex container. For full-page loading use `h-screen`, for section loading use `h-64`.

## Localization (i18n) — MANDATORY

**Every UI-facing string MUST be localized.** When i18n is added to this project, it must support two languages:

| Code | Language          |
| ---- | ----------------- |
| `en` | English           |
| `sq` | Albanian (Shqip)  |

### Rules

1. **Never hardcode user-visible text.** Always use the localization system's translation function.
2. When adding or changing any UI text, **update both** English and Albanian translation files.
3. Use **dot-notation nested keys** grouped by page/section.
4. For dynamic values use `{param}` interpolation.
5. Reuse shared keys for common UI text (Cancel, Save, Delete, Loading, etc.).
6. Refer to the **frontend** project's i18n implementation (`frontend/src/lib/i18n/`) as the reference pattern.
