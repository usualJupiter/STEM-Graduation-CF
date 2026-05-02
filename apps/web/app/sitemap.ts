import type { MetadataRoute } from "next"

import { routing } from "@/i18n/routing"
import { env } from "@/lib/env"

const SITE_URL = env.NEXT_PUBLIC_SITE_URL

const ROUTES = ["", "/programs", "/events", "/gallery", "/schedules", "/capstones", "/about", "/apply"]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return ROUTES.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
  )
}
