import { Hono } from "hono"

import { requireAuth } from "../../lib/middleware"
import type { AppEnv } from "../../types"

const app = new Hono<AppEnv>()

app.use("*", requireAuth)

app.get("/stats", async (c) => {
  const db = c.get("db")
  const env = c.env

  const now = new Date()
  const monthStart = isoDate(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
  )
  const today = isoDate(now)
  // 6 months back covers Pro plan retention; Free plan caps at 30d server-side.
  const totalStart = isoDate(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, 1)),
  )

  const [totalRow, monthRow, visitors] = await Promise.all([
    db
      .selectFrom("applications")
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("applications")
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .where("created_at", ">=", monthStart)
      .executeTakeFirstOrThrow(),
    fetchVisitorStats(env, { monthStart, today, totalStart }),
  ])

  return c.json({
    data: {
      applications: {
        thisMonth: Number(monthRow.count),
        total: Number(totalRow.count),
      },
      visitors,
    },
  })
})

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

interface VisitorStats {
  thisMonth: number | null
  total: number | null
}

async function fetchVisitorStats(
  env: CloudflareBindings,
  range: { monthStart: string; today: string; totalStart: string },
): Promise<VisitorStats> {
  if (!env.CF_API_TOKEN || !env.CF_ZONE_TAG) {
    console.warn("[dashboard.stats] missing CF_API_TOKEN or CF_ZONE_TAG")
    return { thisMonth: null, total: null }
  }

  const query = `
    query Visitors($zoneTag: String!, $monthStart: Date!, $today: Date!, $totalStart: Date!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          thisMonth: httpRequests1dGroups(
            limit: 31
            filter: { date_geq: $monthStart, date_leq: $today }
          ) { uniq { uniques } }
          total: httpRequests1dGroups(
            limit: 365
            filter: { date_geq: $totalStart, date_leq: $today }
          ) { uniq { uniques } }
        }
      }
    }
  `

  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { zoneTag: env.CF_ZONE_TAG, ...range },
      }),
    })

    const bodyText = await res.text()
    if (!res.ok) {
      console.error("[dashboard.stats] CF http", res.status, bodyText)
      return { thisMonth: null, total: null }
    }

    type DayRow = { uniq: { uniques: number } | null }
    const json = JSON.parse(bodyText) as {
      data?: {
        viewer?: {
          zones?: { thisMonth: DayRow[]; total: DayRow[] }[]
        }
      }
      errors?: { message: string }[]
    }

    if (json.errors?.length) {
      console.error("[dashboard.stats] CF errors", json.errors)
      return { thisMonth: null, total: null }
    }

    const zone = json.data?.viewer?.zones?.[0]
    if (!zone) {
      console.warn("[dashboard.stats] CF returned no zones; check CF_ZONE_TAG and token scope")
      return { thisMonth: null, total: null }
    }

    const sumUniq = (rows: DayRow[]) =>
      rows.reduce((acc, r) => acc + (r.uniq?.uniques ?? 0), 0)

    return {
      thisMonth: sumUniq(zone.thisMonth),
      total: sumUniq(zone.total),
    }
  } catch (err) {
    console.error("[dashboard.stats] CF fetch threw", err)
    return { thisMonth: null, total: null }
  }
}

export default app
