# STEM API

Cloudflare Workers backend serving both the public website (`apps/web`) and the admin dashboard (`apps/admin`).

## Stack

| Layer | Technology |
| --- | --- |
| Runtime | Cloudflare Workers |
| Framework | Hono 4 |
| Database | D1 (SQLite at the edge) via Kysely |
| Storage | R2 (public CDN bucket + private applications bucket) |
| Auth | Better Auth (Google OAuth, cookie sessions, allowlist-gated) |
| Bot protection | Cloudflare Turnstile (public submission only) |
| Validation | zod |
| Package manager | bun |

## Run locally

```bash
bun install
cp apps/api/.dev.vars.example apps/api/.dev.vars   # fill in secrets
bun run --filter=api cf-typegen                    # generate Workers types
bun run dev --filter=api
```

Wrangler serves the worker on http://localhost:8787.

## Routes

```
/api/auth/*              Better Auth (sign-in, sign-out, callbacks)
/api/events              ┐
/api/capstones           │ public, consumed by apps/web
/api/gallery             │ — read-only listings
/api/schedules           │
/api/applications        ┘ — POST submission (Turnstile-gated)
/api/admin/*             admin, consumed by apps/admin — gated by requireAuth
```

Source layout follows the same split: `src/routes/public/` and `src/routes/admin/`.

## Access control

`requireAuth` middleware (in `src/lib/middleware.ts`) runs in front of every admin route. It both validates the Better Auth session and re-checks the user's email against the `allowed_emails` table on every request. Removing a member from the allowlist therefore takes effect on the next API call regardless of cookie cache.

## Deploy

```bash
bun run --filter=api deploy   # wrangler deploy --minify
```

Production secrets are set via `wrangler secret put` (not `.dev.vars`). D1 migrations live under `migrations/` and are applied with `wrangler d1 migrations apply stem`.
