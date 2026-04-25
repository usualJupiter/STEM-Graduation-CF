# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Commands

Run from the repo root (Turborepo fans out to workspaces):

- `bun run dev` — run all apps in dev mode (`next dev --turbopack` for `web`/`admin`, `wrangler dev` for `api`)
- `bun run build` / `bun run lint` / `bun run typecheck` / `bun run format`
- Scope to one workspace: `bun run dev --filter=web` (or `admin`, `api`, `@workspace/ui`)
- Deploy API worker: `bun run --filter=api deploy` (runs `wrangler deploy --minify`)
- Regenerate Cloudflare binding types: `bun run --filter=api cf-typegen`

Package manager is **bun** (`packageManager: bun@1.3.13`). There is no test runner configured yet.

## Architecture

Monorepo with `apps/*` + `packages/*` workspaces, orchestrated by Turborepo.

**Apps**
- `apps/web` — public Next.js 16 App Router site (React 19, Turbopack). Uses `react-hook-form` + `zod@4`.
- `apps/admin` — internal Next.js 16 admin app. Same stack as `web`, plus `better-auth` client.
- `apps/api` — Hono app deployed to Cloudflare Workers via Wrangler. Uses `better-auth`, `kysely`, `zod@4`. Entry: `apps/api/src/index.ts`. Worker config: `apps/api/wrangler.jsonc` (bindings for KV/R2/D1 are scaffolded-but-commented — uncomment and run `cf-typegen` when adding them).

**Shared packages** (consumed as `workspace:*`)
- `@workspace/ui` — shadcn/ui component library. Components live in `packages/ui/src/components/` and are added via shadcn CLI (see below). Exports are subpath-style: import from `@workspace/ui/components/<name>`, `@workspace/ui/lib/<name>`, `@workspace/ui/hooks/<name>`. Global styles at `@workspace/ui/globals.css`. Uses Tailwind v4 (`@tailwindcss/postcss`) and `radix-ui`. Note: this package pins `zod@^3` while apps use `zod@^4` — keep validation schemas in the apps, not here.
- `@workspace/eslint-config` — shared flat configs: `base.js`, `next.js`, `react-internal.js`.
- `@workspace/typescript-config` — shared tsconfigs: `base.json`, `nextjs.json`, `react-library.json`.

**shadcn/ui workflow.** Components are centralized in `packages/ui`, not duplicated per app. To add one, run from the repo root:

```bash
bun x shadcn@latest add <component> -c apps/web
```

The `-c apps/web` flag points shadcn at `apps/web/components.json`, which is configured so components land in `packages/ui/src/components/`. The config uses `style: "radix-lyra"`, `baseColor: "neutral"`, `iconLibrary: "lucide"`, and `rtl: true` — preserve these when scaffolding. Then import across apps as `import { Button } from "@workspace/ui/components/button"`.

**Icon library.** `lucide-react` across all workspaces — matches `iconLibrary: "lucide"` in `components.json`. Import icons directly: `import { ChevronRight } from "lucide-react"`.
