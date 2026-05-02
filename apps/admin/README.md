# STEM Admin

Internal admin dashboard for the STEM Program at Asyut University.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| i18n | next-intl (Arabic / English, RTL) |
| Forms | react-hook-form + zod |
| Auth | Better Auth (Google OAuth, cookie sessions) |
| Image uploads | PNG/JPEG → WebP, client-side compression to 1 MB |
| Package manager | bun |

## Run locally

```bash
bun install
cp apps/admin/.env.example apps/admin/.env.local   # then set NEXT_PUBLIC_API_URL
bun run dev --filter=admin
```

Open http://localhost:3001 (the api at `apps/api` should be running on `:8787`).

## Access control

Sign-in is gated by an allowlist (`allowed_emails` table on the api). Only emails in the list can sign in via Google. Members can be added/removed from **Settings → Access**; the change takes effect on the next request.
