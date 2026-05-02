# STEM Program

Public-facing website for the STEM Program at Asyut University.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| i18n | next-intl (Arabic / English, RTL) |
| Forms | react-hook-form + zod |
| Bot protection | Cloudflare Turnstile |
| Package manager | bun |

## Run locally

```bash
bun install
bun run dev --filter=web
```

Open http://localhost:3000.
