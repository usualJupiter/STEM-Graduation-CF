import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.stem-program.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/", destination: "/en", permanent: false },
    ]
  },
}

export default withNextIntl(nextConfig)
