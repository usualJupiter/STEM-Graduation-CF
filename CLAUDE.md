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

## Apps

- **`apps/web`** — public-facing website (Next.js 16, App Router, RTL Arabic + English). Visitors browse events / capstones / gallery / schedules and submit applications. No auth.
- **`apps/admin`** — internal admin dashboard (Next.js 16). Sign-in via Google OAuth, gated by an allowlist (`allowed_emails` table on the api). Manages everything the public site reads.
- **`apps/api`** — Cloudflare Workers backend (Hono + Better Auth + Kysely on D1 + R2). Serves both apps. Routes split into `src/routes/public/` (consumed by web, no auth) and `src/routes/admin/` (consumed by admin, gated by `requireAuth`).

Shared packages: `@workspace/ui` (shadcn components, Tailwind v4, RTL), `@workspace/eslint-config`, `@workspace/typescript-config`. Validation schemas always live in the apps — `@workspace/ui` pins `zod@^3` while apps use `zod@^4`.

## Adding a public API endpoint

Public endpoints serve unauthenticated traffic from `apps/web` and live under `apps/api/src/routes/public/`.

1. Pick the resource file (or create `routes/public/<resource>.ts` and mount it in `src/index.ts` under the `// Public API` block).
2. Define zod schemas at the top of the file.
3. Validate inputs with `safeParse`, return JSON 400 with `issues` on failure:
   ```ts
   const parsed = querySchema.safeParse(
     Object.fromEntries(new URL(c.req.url).searchParams),
   )
   if (!parsed.success) {
     return c.json({ error: "Invalid query", issues: parsed.error.issues }, 400)
   }
   ```
4. Use `c.get("db")` for Kysely. Use `cdnUrl(cdn, key)` from `lib/cdn.ts` to expose R2-stored media — never return raw R2 keys.
5. Public POSTs that accept user input (e.g. application submission) must verify Turnstile via `lib/turnstile.ts`.

Public response shapes should strip admin-only fields (author info, internal IDs) — see `routes/public/events.ts` vs `routes/admin/events.ts` for the pattern.

## Adding an admin API endpoint

Admin endpoints live under `apps/api/src/routes/admin/<resource>.ts`.

1. Mount `requireAuth` once at the top of the file:
   ```ts
   const app = new Hono<AppEnv>()
   app.use("*", requireAuth)
   ```
   `requireAuth` validates the session **and** re-checks the email against `allowed_emails`. Removing a member takes effect on the next request — no cookie-cache window.
2. Read identity via `c.get("session")!` (non-null after `requireAuth`).
3. Validate bodies the same way as public:
   ```ts
   const body = await c.req.json().catch(() => null)
   const parsed = createSchema.safeParse(body)
   if (!parsed.success) {
     return c.json({ error: "Invalid payload", issues: parsed.error.issues }, 400)
   }
   ```
4. **D1 has no real transactions.** For multi-statement atomicity (cascade delete, single-active invariant, etc.), compile Kysely queries and pass them to `c.env.stem_db.batch()`:
   ```ts
   const a = db.deleteFrom("children").where("parent_id", "=", id).compile()
   const b = db.deleteFrom("parent").where("id", "=", id).compile()
   await c.env.stem_db.batch([
     c.env.stem_db.prepare(a.sql).bind(...a.parameters),
     c.env.stem_db.prepare(b.sql).bind(...b.parameters),
   ])
   ```
5. **R2 cleanup is best-effort and stays outside the DB transaction.** Use `deleteObjects(env, keys)` from `lib/r2.ts` (uses the native R2 binding — one subrequest, regardless of `keys.length`). Log rejections so orphans are detectable.

Mount the route in `src/index.ts` under the `// Admin API` block.

## Calling the api from admin

`apps/admin/lib/api.ts` exports `fetchJson(path, init)` — sends `credentials: "include"` so the auth cookie flows. Use it for everything:

```ts
const res = await fetchJson<{ data: Foo[] }>("/api/admin/foos")
```

For authed downloads (xlsx, zip), use `downloadAuthed(path, fallbackName)` from `apps/admin/lib/download.ts`.

For file uploads, **never PUT to R2 yourself** — go through the shared library:

```ts
import { uploadImage, uploadImages } from "@/lib/upload"

const { key, size } = await uploadImage(file, "events")
// or for batch: const results = await uploadImages(files, "gallery")
```

`uploadImage` validates PNG/JPEG, compresses to WebP (≤1 MB) client-side, requests a presigned PUT URL from `/api/admin/uploads/sign`, PUTs the blob, and returns `{ key, size }`. The `prefix` arg becomes the R2 key prefix and must be one of `"events"`, `"capstones"`, `"gallery"`.

## Forms

Forms use **react-hook-form + zod** with the shadcn `Form` component. Build the schema inside a function so error messages can be translated:

```tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

function buildSchema(t: Translator) {
  return z.object({
    name: z.string().trim().min(1, t("validation.required")),
    email: z.email(t("validation.email")),
  })
}

export default function MyForm() {
  const t = useTranslations("MyForm")
  const schema = useMemo(() => buildSchema(t), [t])
  const form = useForm<z.infer<typeof schema>>({
    // @ts-expect-error zod@4 / @hookform/resolvers@5 generic mismatch (runtime is fine)
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  })
  // ...
}
```

The `@ts-expect-error` is a known generic mismatch between zod 4 and `@hookform/resolvers` 5 — runtime is fine. Match this pattern in new forms.

For dialogs that fetch + write, prevent the dialog from closing mid-submit:

```tsx
<Dialog
  open={open}
  onOpenChange={(o) => {
    if (isSubmitting) return
    onOpenChange(o)
  }}
>
```

For long forms inside dialogs, the `DialogContent` should be a flex column so only the body scrolls:

```tsx
<DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[850px]">
  <DialogHeader className="border-b border-border p-4">…</DialogHeader>
  <form className="flex min-h-0 flex-1 flex-col">
    <div className="flex-1 overflow-y-auto pt-4">…fields…</div>
    <DialogFooter className="border-t bg-muted/50 p-4">…</DialogFooter>
  </form>
</DialogContent>
```

## UI components

Components are centralized in `packages/ui/src/components/`. Add new ones via the shadcn CLI from the repo root:

```bash
bun x shadcn@latest add <component> -c apps/web
```

The `-c apps/web` flag points at `apps/web/components.json`, which is configured to drop new files into `packages/ui/`. Config: `style: "radix-lyra"`, `baseColor: "neutral"`, `iconLibrary: "lucide"`, `rtl: true`. Preserve these when scaffolding.

Import across apps:
```ts
import { Button } from "@workspace/ui/components/button"
import { ChevronRight } from "lucide-react"   // icons direct from lucide
```

Primary action buttons use `bg-secondry-web text-white hover:bg-secondry-web/90` (note: `secondry`, not `secondary` — pre-existing typo, leave it).

## i18n

`next-intl`, two locales (`en`, `ar`), RTL on for `ar`.

- Translation files: `apps/<app>/messages/{en,ar}.json`. Always add a key to **both**.
- Client components: `useTranslations("Namespace")`. Server components: `getTranslations({ locale, namespace })`.
- ICU-style interpolation: `"hello": "Hi {name}"` → `t("hello", { name: "Bob" })`.
- Don't render English literals as fallbacks (e.g. `"Upload failed"`); pull them from translations.

For per-page browser titles in admin, use `buildMetadata("key")` from `apps/admin/lib/metadata.ts`:
```ts
export const generateMetadata = buildMetadata("dashboard")
```
Web pages: write `generateMetadata` directly using `getTranslations`.

## Conventions

- **JSON error shape** everywhere: `{ error: "CODE_OR_MESSAGE", ... }` with optional `issues` (zod) or domain-specific fields. Public endpoints use SCREAMING_SNAKE error codes (e.g. `"DUPLICATE_NATIONAL_ID"`) so clients can render localized messages; admin endpoints can use plain English strings.
- **`requireAuth` is mandatory** for everything under `routes/admin/`. The single exception is `/api/auth/*` (Better Auth's own handler).
- **Logging**: bare `console.error("[scope] thing failed", err)` for actionable failures. No `console.log`. Workers observability is enabled in `wrangler.jsonc` so these land in the CF dashboard.
- **Cookie / session**: cookie prefix is `auth` (not `better-auth`). Cross-origin cookies kick in automatically when `BETTER_AUTH_URL` starts with `https://` (`sameSite: "none"; secure: true`). Use HTTPS in dev or accept that auth won't cross origins in plain dev.
- **Workers subrequest cap** (50 free / 1000 paid): routes that loop over R2 operations must stay under it. Use `bucket.delete(keys[])` for bulk deletes; never `Promise.all` of N single deletes via the S3 SDK.
- **No real transactions in D1** — see admin recipe step 4. Use `db.batch()` for any multi-statement atomicity.
