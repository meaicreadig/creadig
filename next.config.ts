import type { NextConfig } from "next"

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }]
  },
  async redirects() {
    return [
      // Alte statische Seite: Einstiegspunkte sauber weiterleiten,
      // damit bestehende Links und QR-Codes nicht ins Leere laufen.
      { source: "/termin.html", destination: "/termin", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
    ]
  },
}

export default nextConfig
