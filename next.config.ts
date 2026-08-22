import type { NextConfig } from "next"

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /*
   * TECH-1 — die Serverless-Function schluckte das halbe Repo.
   *
   * Der Datei-Tracer folgt von den Routen aus allem, was er fuer eine
   * Abhaengigkeit haelt, und nimmt im Zweifel den Repo-Root mit: `.git`,
   * das Alt-Projekt unter `_legacy/`, die Mockups, das Archiv-ZIP, die PDFs.
   * Damit lief die Function ueber das Limit — nichts war auslieferbar.
   * `"*"` gilt fuer jede Route, nicht nur eine.
   */
  outputFileTracingExcludes: {
    "*": [
      ".git/**",
      ".next/cache/**",
      "_legacy/**",
      "design-mockup/**",
      ".cursor/**",
      ".claude/**",
      ".video-analysis/**",
      "**/*.pdf",
      "**/*.zip",
    ],
  },
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
