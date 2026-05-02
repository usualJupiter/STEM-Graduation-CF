# STEM Graduation Project

Graduation project for the Computer Science department.

A bilingual (Arabic / English, RTL) admissions and content platform for the STEM Program at Asyut University. Three deployable apps and one shared UI library, all in a single Turborepo monorepo.

## Apps

### `apps/web` — public website

The face of the program. Visitors browse events, capstone projects, the photo gallery, and lecture schedules, and submit their application through a Turnstile-protected form.

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| i18n | next-intl (Arabic / English, RTL) |
| Forms | react-hook-form + zod |
| Bot protection | Cloudflare Turnstile |

### `apps/admin` — internal dashboard

Allowlist-gated admin panel. Manages events, capstones, gallery, schedules, and reviews / exports submitted applications. Sign-in is via Google OAuth, and only emails listed in the `allowed_emails` table can sign in.

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| i18n | next-intl (Arabic / English, RTL) |
| Forms | react-hook-form + zod |
| Auth | Better Auth (Google OAuth, cookie sessions) |
| Image uploads | PNG/JPEG → WebP, compressed client-side to 1 MB |

### `apps/api` — backend on Cloudflare Workers

Hono on Cloudflare Workers serving both Next.js apps. Routes split into `src/routes/public/` (read-only and submission endpoints for the website) and `src/routes/admin/` (CRUD endpoints for the admin dashboard, gated by `requireAuth` middleware that re-checks the allowlist on every request).

| Layer | Technology |
| --- | --- |
| Runtime | Cloudflare Workers |
| Framework | Hono 4 |
| Database | D1 (SQLite at the edge) via Kysely |
| Storage | R2 (public CDN bucket + private applications bucket) |
| Auth | Better Auth (Google OAuth, allowlist-gated) |
| Validation | zod |

### `packages/ui` — shared component library

Shadcn components, single source of truth for both Next.js apps. Tailwind v4, RTL-aware, lucide icons. New components are added via `bun x shadcn@latest add <name> -c apps/web` and land here automatically.

## Run locally

Prerequisites: [bun](https://bun.sh) ≥ 1.3.

Install dependencies:

```bash
bun install
```

Each app needs its own env file (copy the example, then fill in real values):

```bash
cp apps/web/.env.example       apps/web/.env.local
cp apps/admin/.env.example     apps/admin/.env.local
cp apps/api/.dev.vars.example  apps/api/.dev.vars
```

Generate Cloudflare Workers types (one-time, regenerate after touching `wrangler.jsonc` or `.dev.vars`):

```bash
bun run --filter=api cf-typegen
```

Apply D1 migrations (creates the local D1 schema):

```bash
bunx wrangler d1 migrations apply stem --local
```

Run all three apps in dev mode:

```bash
bun run dev
```

| App | URL |
| --- | --- |
| web | http://localhost:3000 |
| admin | http://localhost:3001 |
| api | http://localhost:8787 |

To run a single workspace: `bun run dev --filter=web` (or `admin`, `api`).

Other useful commands:

```bash
bun run typecheck    # tsc --noEmit across the repo
bun run lint         # ESLint
bun run format       # Prettier
```

## Deploy

The api is deployed to Cloudflare Workers:

```bash
bun run --filter=api deploy
```

Production secrets are set via `bunx wrangler secret put <NAME>` (not `.dev.vars`). Production migrations:

```bash
bunx wrangler d1 migrations apply stem --remote
```

`apps/web` and `apps/admin` are standard Next.js apps and can be deployed to any compatible host (Cloudflare Pages, Vercel, etc.). Set `NEXT_PUBLIC_API_URL` to the deployed Worker URL for both.
