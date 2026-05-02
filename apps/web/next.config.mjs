import path from "node:path"

import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const isDev = process.env.NODE_ENV !== "production"
const devConnect = isDev ? " http://localhost:8787 ws://localhost:* http://localhost:*" : ""

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.stem-program.com",
  "font-src 'self' data:",
  `connect-src 'self' https://challenges.cloudflare.com https://*.stem-program.com${devConnect}`,
  "frame-src https://challenges.cloudflare.com https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
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

const monorepoRoot = path.join(import.meta.dirname, "..", "..")

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  transpilePackages: ["@workspace/ui"],
  // Monorepo: pin both Turbopack and Next's file-tracing to the workspace root
  // so packages hoisted to the repo root (next, react, etc.) are resolvable.
  // @cloudflare/next-on-pages re-invokes `next build` via vercel CLI, which
  // tries to auto-set outputFileTracingRoot to apps/web — by setting it
  // explicitly here, that override is neutralised. Both keys must match.
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.stem-program.com" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
    ]
  },
  async redirects() {
    return [
      { source: "/", destination: "/en", permanent: true },
    ]
  },
}

export default withNextIntl(nextConfig)
