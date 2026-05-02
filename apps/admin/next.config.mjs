import path from "node:path"

import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const isDev = process.env.NODE_ENV !== "production"
const devConnect = isDev
  ? " http://localhost:8787 ws://localhost:* http://localhost:*"
  : ""

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.stem-program.com https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  `connect-src 'self' https://*.stem-program.com${devConnect}`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  transpilePackages: ["@workspace/ui"],
  // Monorepo: tell Turbopack the workspace root so it can resolve
  // hoisted packages when invoked from sub-builders like @cloudflare/next-on-pages.
  turbopack: {
    root: path.join(import.meta.dirname, "..", ".."),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.stem-program.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default withNextIntl(nextConfig)
