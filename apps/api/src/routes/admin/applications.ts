/**
 * Admin: Application groups + individual applications.
 * - Groups: batches of applications (one academic year). Only one can be active
 *   at a time; activating one auto-deactivates the rest.
 * - Applications: individual submissions. Photo + certificate live in R2 and
 *   are streamed back through this API (no public URLs).
 */
import { Hono, type Context } from "hono"
import { z } from "zod"

import { buildXlsx, buildZip } from "../../lib/applicationsExport"
import { requireAuth } from "../../lib/middleware"
import type { AppEnv } from "../../types"

const idSchema = z.string().uuid()
const groupIdSchema = z.coerce.number().int().positive()

const listQuerySchema = z.object({
  q: z.string().trim().optional(),
  group_id: z.coerce.number().int().positive().optional(),
  sort: z.enum(["dateNewest", "dateOldest", "nameAsc", "nameDesc"]).default("dateNewest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

const groupCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  academic_year_label: z.string().trim().max(50).optional().default(""),
  declaration_text: z.string().max(5000).optional().default(""),
})

// Auto-fills `academic_year_label` when the create request omits it.
// Sept (month 8) onwards belongs to the new academic year, so applications
// opened in Sept 2026 are for "2026/2027". UTC is fine here — admin won't
// be creating groups exactly at midnight on the boundary.
function currentAcademicYearLabel(now: Date = new Date()): string {
  const m = now.getUTCMonth()
  const y = now.getUTCFullYear()
  const start = m >= 8 ? y : y - 1
  return `${start}/${start + 1}`
}

const groupUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  academic_year_label: z.string().trim().min(1).max(50).optional(),
  declaration_text: z.string().max(5000).optional(),
  is_active: z.boolean().optional(),
})

const exportTypeSchema = z.enum(["xlsx", "zip"])

const app = new Hono<AppEnv>()

app.use("*", requireAuth)

// ---------- Groups ----------

app.get("/groups", async (c) => {
  const db = c.get("db")
  const rows = await db
    .selectFrom("application_groups")
    .leftJoin("applications", "applications.group_id", "application_groups.id")
    .select((eb) => [
      "application_groups.id",
      "application_groups.name",
      "application_groups.declaration_text",
      "application_groups.is_active",
      "application_groups.created_at",
      eb.fn.count<number>("applications.id").as("application_count"),
    ])
    .groupBy("application_groups.id")
    .orderBy("application_groups.created_at", "desc")
    .execute()
  return c.json({
    data: rows.map((r) => ({ ...r, application_count: Number(r.application_count) })),
  })
})

app.post("/groups", async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = groupCreateSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      400,
    )
  }
  const db = c.get("db")
  const now = new Date().toISOString()
  const inserted = await db
    .insertInto("application_groups")
    .values({
      name: parsed.data.name,
      academic_year_label:
        parsed.data.academic_year_label || currentAcademicYearLabel(),
      declaration_text: parsed.data.declaration_text,
      is_active: 0,
      created_at: now,
      updated_at: now,
    })
    .returning("id")
    .executeTakeFirstOrThrow()
  return c.json({ data: { id: inserted.id } }, 201)
})

app.patch("/groups/:id", async (c) => {
  const idParsed = groupIdSchema.safeParse(c.req.param("id"))
  if (!idParsed.success) return c.json({ error: "Invalid id" }, 400)
  const body = await c.req.json().catch(() => null)
  const parsed = groupUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      400,
    )
  }
  const db = c.get("db")
  const now = new Date().toISOString()
  const id = idParsed.data

  const updateValues: Record<string, unknown> = { updated_at: now }
  if (parsed.data.name !== undefined) updateValues.name = parsed.data.name
  if (parsed.data.academic_year_label !== undefined)
    updateValues.academic_year_label = parsed.data.academic_year_label
  if (parsed.data.declaration_text !== undefined)
    updateValues.declaration_text = parsed.data.declaration_text
  if (parsed.data.is_active !== undefined)
    updateValues.is_active = parsed.data.is_active ? 1 : 0

  // Single-active invariant: when activating this group, deactivate every
  // other active group atomically. D1's batch() runs both statements as one
  // transaction so we can never end up with zero or two active groups on a
  // partial failure.
  if (parsed.data.is_active === true) {
    const deactivate = db
      .updateTable("application_groups")
      .set({ is_active: 0, updated_at: now })
      .where("is_active", "=", 1)
      .where("id", "!=", id)
      .compile()
    const activate = db
      .updateTable("application_groups")
      .set(updateValues)
      .where("id", "=", id)
      .compile()
    await c.env.stem_db.batch([
      c.env.stem_db.prepare(deactivate.sql).bind(...deactivate.parameters),
      c.env.stem_db.prepare(activate.sql).bind(...activate.parameters),
    ])
    // Verify the row existed (D1 batch doesn't throw on zero-row updates).
    const exists = await db
      .selectFrom("application_groups")
      .select("id")
      .where("id", "=", id)
      .executeTakeFirst()
    if (!exists) return c.json({ error: "Not found" }, 404)
    return c.json({ data: { id } })
  }

  const result = await db
    .updateTable("application_groups")
    .set(updateValues)
    .where("id", "=", id)
    .execute()
  if (result.length === 0 || Number(result[0]?.numUpdatedRows ?? 0) === 0) {
    return c.json({ error: "Not found" }, 404)
  }
  return c.json({ data: { id } })
})

app.delete("/groups/:id", async (c) => {
  const idParsed = groupIdSchema.safeParse(c.req.param("id"))
  if (!idParsed.success) return c.json({ error: "Invalid id" }, 400)
  const id = idParsed.data
  const db = c.get("db")

  const group = await db
    .selectFrom("application_groups")
    .select("id")
    .where("id", "=", id)
    .executeTakeFirst()
  if (!group) return c.json({ error: "Not found" }, 404)

  const apps = await db
    .selectFrom("applications")
    .select(["photo_key", "certificate_key"])
    .where("group_id", "=", id)
    .execute()

  // Atomic cascade: deleting children + parent in one D1 batch so we never
  // leave a "ghost" group with no applications behind on partial failure.
  const delChildren = db
    .deleteFrom("applications")
    .where("group_id", "=", id)
    .compile()
  const delParent = db
    .deleteFrom("application_groups")
    .where("id", "=", id)
    .compile()
  await c.env.stem_db.batch([
    c.env.stem_db.prepare(delChildren.sql).bind(...delChildren.parameters),
    c.env.stem_db.prepare(delParent.sql).bind(...delParent.parameters),
  ])

  // R2 cleanup is best-effort and outside the DB transaction; log any
  // rejections so orphans are detectable in observability.
  const allKeys = apps.flatMap((a) => [a.photo_key, a.certificate_key])
  const results = await Promise.allSettled(
    allKeys.map((k) => c.env.APP_FILES.delete(k)),
  )
  const failed = results.filter((r) => r.status === "rejected").length
  if (failed > 0) {
    console.error("[applications] R2 orphan(s) after group delete", {
      group_id: id,
      failed,
      total: allKeys.length,
    })
  }

  return c.json({ data: { id, deleted_applications: apps.length } })
})

app.get("/groups/:id/export", async (c) => {
  const idParsed = groupIdSchema.safeParse(c.req.param("id"))
  if (!idParsed.success) return c.json({ error: "Invalid id" }, 400)
  const typeParsed = exportTypeSchema.safeParse(
    new URL(c.req.url).searchParams.get("type"),
  )
  if (!typeParsed.success) return c.json({ error: "Invalid type" }, 400)

  const db = c.get("db")
  const id = idParsed.data
  const group = await db
    .selectFrom("application_groups")
    .select(["id", "name"])
    .where("id", "=", id)
    .executeTakeFirst()
  if (!group) return c.json({ error: "Not found" }, 404)

  const rows = await db
    .selectFrom("applications")
    .selectAll()
    .where("group_id", "=", id)
    .orderBy("created_at", "asc")
    .execute()

  const baseName = group.name.replace(/[\\/:*?"<>|\r\n\t]+/g, "_") || `group-${id}`

  if (typeParsed.data === "xlsx") {
    const xlsx = buildXlsx(rows)
    return new Response(new Uint8Array(xlsx), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${baseName}.xlsx"`,
      },
    })
  }

  const zip = await buildZip({ rows, bucket: c.env.APP_FILES })
  return new Response(new Uint8Array(zip), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${baseName}.zip"`,
    },
  })
})

// ---------- Applications ----------

app.get("/", async (c) => {
  const parsed = listQuerySchema.safeParse(
    Object.fromEntries(new URL(c.req.url).searchParams),
  )
  if (!parsed.success) {
    return c.json(
      { error: "Invalid query", issues: parsed.error.issues },
      400,
    )
  }
  const { q, group_id, sort, page, limit } = parsed.data
  const db = c.get("db")

  let baseQuery = db
    .selectFrom("applications")
    .innerJoin("application_groups", "application_groups.id", "applications.group_id")
  if (q) {
    const like = `%${q}%`
    baseQuery = baseQuery.where((eb) =>
      eb.or([
        eb("applications.name", "like", like),
        eb("applications.national_id", "like", like),
      ]),
    )
  }
  if (group_id) baseQuery = baseQuery.where("applications.group_id", "=", group_id)

  const totalRow = await baseQuery
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow()
  const total = Number(totalRow.count)

  let rowsQuery = baseQuery.select([
    "applications.id",
    "applications.name",
    "applications.national_id",
    "applications.created_at",
    "applications.group_id",
    "application_groups.name as group_name",
  ])
  switch (sort) {
    case "dateNewest":
      rowsQuery = rowsQuery.orderBy("applications.created_at", "desc")
      break
    case "dateOldest":
      rowsQuery = rowsQuery.orderBy("applications.created_at", "asc")
      break
    case "nameAsc":
      rowsQuery = rowsQuery.orderBy("applications.name", "asc")
      break
    case "nameDesc":
      rowsQuery = rowsQuery.orderBy("applications.name", "desc")
      break
  }
  const rows = await rowsQuery
    .limit(limit)
    .offset((page - 1) * limit)
    .execute()

  return c.json({ data: rows, meta: { total, page, limit } })
})

app.get("/:id", async (c) => {
  const parsed = idSchema.safeParse(c.req.param("id"))
  if (!parsed.success) return c.json({ error: "Invalid id" }, 400)
  const db = c.get("db")
  const row = await db
    .selectFrom("applications")
    .innerJoin("application_groups", "application_groups.id", "applications.group_id")
    .select((eb) => [
      "applications.id",
      "applications.group_id",
      "application_groups.name as group_name",
      "applications.name",
      "applications.nationality",
      "applications.religion",
      "applications.residence",
      "applications.home_phone",
      "applications.mobile",
      "applications.birthdate",
      "applications.birthplace",
      "applications.age_october",
      "applications.national_id",
      "applications.id_issuing_authority",
      "applications.id_issue_date",
      "applications.guardian_name",
      "applications.guardian_job",
      "applications.guardian_address",
      "applications.guardian_mobile",
      "applications.certificate",
      "applications.graduation_year",
      "applications.total_grades",
      "applications.first_language",
      "applications.second_language",
      "applications.school",
      "applications.division",
      "applications.educational_district",
      "applications.governorate",
      "applications.photo_key",
      "applications.photo_content_type",
      "applications.photo_size",
      "applications.certificate_key",
      "applications.certificate_size",
      "applications.declaration_accepted_at",
      "applications.created_at",
    ])
    .where("applications.id", "=", parsed.data)
    .executeTakeFirst()
  if (!row) return c.json({ error: "Not found" }, 404)

  return c.json({
    data: {
      ...row,
      photo_url: `/api/admin/applications/${row.id}/files/photo`,
      certificate_url: `/api/admin/applications/${row.id}/files/certificate`,
    },
  })
})

// Streams an applicant's photo or certificate from R2 with a private,
// short-lived cache directive. Auth is already enforced by `requireAuth`
// at the router level.
async function streamPrivateFile(
  c: Context<AppEnv>,
  id: string,
  kind: "photo" | "certificate",
) {
  const db = c.get("db")
  const row = await db
    .selectFrom("applications")
    .select([
      "photo_key",
      "photo_content_type",
      "certificate_key",
    ])
    .where("id", "=", id)
    .executeTakeFirst()
  if (!row) return c.json({ error: "Not found" }, 404)

  const key = kind === "photo" ? row.photo_key : row.certificate_key
  const contentType =
    kind === "photo" ? row.photo_content_type : "application/pdf"
  const obj = await c.env.APP_FILES.get(key)
  if (!obj) return c.json({ error: "Not found" }, 404)
  return new Response(obj.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
    },
  })
}

app.get("/:id/files/photo", async (c) => {
  const parsed = idSchema.safeParse(c.req.param("id"))
  if (!parsed.success) return c.json({ error: "Invalid id" }, 400)
  return streamPrivateFile(c, parsed.data, "photo")
})

app.get("/:id/files/certificate", async (c) => {
  const parsed = idSchema.safeParse(c.req.param("id"))
  if (!parsed.success) return c.json({ error: "Invalid id" }, 400)
  return streamPrivateFile(c, parsed.data, "certificate")
})

app.get("/:id/export", async (c) => {
  const parsed = idSchema.safeParse(c.req.param("id"))
  if (!parsed.success) return c.json({ error: "Invalid id" }, 400)
  const typeParsed = exportTypeSchema.safeParse(
    new URL(c.req.url).searchParams.get("type"),
  )
  if (!typeParsed.success) return c.json({ error: "Invalid type" }, 400)

  const db = c.get("db")
  const row = await db
    .selectFrom("applications")
    .selectAll()
    .where("id", "=", parsed.data)
    .executeTakeFirst()
  if (!row) return c.json({ error: "Not found" }, 404)

  const baseName = row.name.replace(/[\\/:*?"<>|\r\n\t]+/g, "_") || `applicant-${row.id.slice(0, 8)}`

  if (typeParsed.data === "xlsx") {
    const xlsx = buildXlsx([row])
    return new Response(new Uint8Array(xlsx), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${baseName}.xlsx"`,
      },
    })
  }

  const zip = await buildZip({ rows: [row], bucket: c.env.APP_FILES })
  return new Response(new Uint8Array(zip), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${baseName}.zip"`,
    },
  })
})

app.delete("/:id", async (c) => {
  const parsed = idSchema.safeParse(c.req.param("id"))
  if (!parsed.success) return c.json({ error: "Invalid id" }, 400)
  const id = parsed.data
  const db = c.get("db")
  const row = await db
    .selectFrom("applications")
    .select(["photo_key", "certificate_key"])
    .where("id", "=", id)
    .executeTakeFirst()
  if (!row) return c.json({ error: "Not found" }, 404)
  await db.deleteFrom("applications").where("id", "=", id).execute()
  const results = await Promise.allSettled([
    c.env.APP_FILES.delete(row.photo_key),
    c.env.APP_FILES.delete(row.certificate_key),
  ])
  const failed = results.filter((r) => r.status === "rejected").length
  if (failed > 0) {
    console.error("[applications] R2 orphan(s) after delete", {
      id,
      failed,
      total: 2,
    })
  }
  return c.json({ data: { id } })
})

export default app
