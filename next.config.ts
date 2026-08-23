import type { NextConfig } from "next"

/*
 * SEC-3 — Content-Security-Policy in zwei Stufen.
 *
 * ---------------------------------------------------------------------------
 * WARUM NICHT EINE EINZIGE, SCHARFE POLICY
 * Eine scharfe CSP verlangt hier `unsafe-inline` fuer Skripte (das
 * Theme-Boot-Skript im <head> laeuft, bevor irgendetwas gerendert ist) und
 * fuer Stile (Tailwind und framer-motion setzen Inline-Attribute). Eine CSP,
 * die `unsafe-inline` erlaubt, verhindert genau den Angriff nicht, gegen den
 * sie gedacht ist — sie sieht nur so aus. Der ehrliche Weg ist der aus dem
 * Audit: erst beobachten, dann verschaerfen.
 *
 * ---------------------------------------------------------------------------
 * STUFE 1 — was SOFORT scharf gilt (kann nichts kaputt machen)
 * Kein `default-src`, also keine Ressourcen-Beschraenkung — nur die vier
 * Direktiven, die kein Rendering beeinflussen und trotzdem echte Angriffe
 * ausschliessen:
 *   object-src 'none'      keine Flash-/Plugin-Einbettung
 *   base-uri 'self'        kein untergeschobenes <base>, das alle relativen
 *                          Links auf eine fremde Domain umbiegt
 *   form-action 'self'     kein Formular, das woanders hin absendet — das
 *                          schuetzt genau die neuen Anfrage-Formulare
 *   frame-ancestors 'none' Clickjacking, jetzt auch fuer Browser, die
 *                          X-Frame-Options ignorieren
 *
 * ---------------------------------------------------------------------------
 * STUFE 2 — die vollstaendige Policy, vorerst NUR als Bericht
 * Sie blockiert nichts, meldet aber jeden Verstoss. Damit laesst sich vor dem
 * Livegang sehen, was wirklich geladen wird — statt es zu raten und im
 * Zweifel die Seite zu zerlegen. Umschalten auf `Content-Security-Policy`
 * gehoert auf die Live-Checkliste, nachdem die Berichte einmal sauber waren.
 *
 * TECH-7: Gemeldet wird jetzt an `app/api/csp-report`, nicht mehr nur in die
 * Konsole des Besuchers — die sieht hier niemand. Beide Meldewege stehen
 * drin, weil die Browser sich nicht einig sind: `report-uri` ist veraltet,
 * aber das Einzige, was Safari versteht; `report-to` ist der Nachfolger und
 * braucht zusaetzlich den `Reporting-Endpoints`-Header.
 */
const CSP_REPORT_ENDPOINT = "/api/csp-report"

const CSP_ENFORCED = [
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ")

const CSP_REPORT_ONLY = [
  "default-src 'self'",
  // 'unsafe-inline': Theme-Boot-Skript im <head> + Next.js-Hydration.
  // va.vercel-scripts.com ist die Reichweitenmessung — sie laedt ohnehin
  // erst nach Einwilligung, aber die Policy muss sie kennen.
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  // Tailwind und framer-motion schreiben Inline-Stile.
  "style-src 'self' 'unsafe-inline'",
  // data: fuer die inline eingebetteten SVG-Muster, blob: fuer next/image.
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
  `report-uri ${CSP_REPORT_ENDPOINT}`,
  "report-to csp",
].join("; ")

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  /*
   * SEC-6 — Clickjacking: ohne diesen Header laesst sich die Seite in einen
   * fremden Frame haengen und ueber eine unsichtbare Schicht bedienen. Wir
   * betten uns nirgends selbst ein, also DENY statt SAMEORIGIN.
   */
  { key: "X-Frame-Options", value: "DENY" },
  /*
   * HSTS galt bisher nur fuer die nackte Domain und ohne Preload-Zusage.
   * includeSubDomains zieht alle Subdomains mit, preload macht die Regel
   * schon vor dem ersten Besuch gueltig (Browser-Liste) — damit greift sie
   * auch beim allerersten Aufruf, wo der Downgrade-Angriff sitzt.
   */
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: CSP_ENFORCED },
  { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
  // Ohne diesen Header ist `report-to csp` oben ein Name ohne Adresse.
  { key: "Reporting-Endpoints", value: `csp="${CSP_REPORT_ENDPOINT}"` },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /*
   * TECH-6 — die Werk-Aufnahmen sind gross: fuenf PNGs zwischen 1 und 1,7 MB,
   * und die Werkschau zeigt drei davon gleich auf der Startseite. Ueber
   * `next/image` werden sie in der Groesse ausgeliefert, die das Layout
   * wirklich braucht — hier steht nur, in welchem Format.
   *
   * AVIF vor WebP: bei diesen Aufnahmen (grosse Flaechen, weiche Verlaeufe)
   * liegt AVIF deutlich unter WebP, und jeder Browser, der es nicht kann,
   * bekommt ueber `Accept` automatisch WebP. Der Aufwand liegt einmalig beim
   * Build, nicht bei jedem Besucher.
   */
  images: {
    formats: ["image/avif", "image/webp"],
  },
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
