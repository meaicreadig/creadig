#!/usr/bin/env node
/**
 * ADM-02 · H3 · VERSUCHSFENSTER-PROBELAUF
 *
 * Faehrt `lib/rate-limit.ts` gegen eine WEGWERF-Postgres: zaehlt das Fenster
 * ueber „Instanzen" hinweg (zwei getrennte Aufrufer, ein Speicher), atomar
 * unter Gleichzeitigkeit, ohne Rohadresse, und faellt ohne Tabelle/Geheimnis
 * auf den Arbeitsspeicher zurueck.
 *
 * Aufruf: VERSUCH_DRILL_URL=postgres://localhost/drill_versuch npm run versuch-drill
 */
import pg from "pg"

import { requireSafeTarget } from "./lib/env-guard.mjs"

const ZIEL = process.env.VERSUCH_DRILL_URL || "postgres://localhost/drill_versuch"
requireSafeTarget(ZIEL, "Versuchsfenster-Probelauf")

process.env.LEAD_TOKEN_SECRET = "probe-token-geheimnis-nur-fuer-den-probelauf"

const G = await import("../lib/lead-guard.ts")
const RL = await import("../lib/rate-limit.ts")
const { SCHEMA } = await import("../lib/neon-client.ts")

let fehler = 0
const p = (ok, name, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

const client = new pg.Client({ connectionString: ZIEL })
await client.connect()
const q = async (text, params) => (await client.query(text, params ?? [])).rows

console.log("\nV1 · Ohne Tabelle: Arbeitsspeicher, kein Fehler nach aussen")
const k0 = await G.bucketKey("admin-login", "203.0.113.7")
const r0 = await RL.durableWithinLimit(k0, 10, { speicher: q })
p(r0.erlaubt && r0.quelle === "arbeitsspeicher", "Fallback", r0.quelle)

for (const stmt of SCHEMA.filter((s) => s.includes("rate_limit_windows"))) await q(stmt)

console.log("\nV2 · Ein Fenster in der Datenbank (Zaehlung, Grenze) — getrennte Verbindungen prueft V3")
const key = await G.bucketKey("admin-login", "198.51.100.23")
const now = Date.now()
const ergebnisse = []
for (let i = 0; i < 12; i++) {
  ergebnisse.push(await RL.durableWithinLimit(key, 10, { now, speicher: q }))
}
p(ergebnisse.every((e) => e.quelle === "datenbank"), "alle zaehlen in der Datenbank")
p(ergebnisse.filter((e) => e.erlaubt).length === 10, "genau 10 von 12 erlaubt", String(ergebnisse.filter((e) => e.erlaubt).length))
p(!ergebnisse[10].erlaubt && !ergebnisse[11].erlaubt, "Versuch 11 und 12 abgewiesen")

console.log("\nV3 · 20 getrennte Verbindungen gleichzeitig (= Instanzen): atomar")
const key2 = await G.bucketKey("lead", "198.51.100.99")
const parallel = await Promise.all(Array.from({ length: 20 }, () => {
  const c = new pg.Client({ connectionString: ZIEL })
  return c.connect().then(async () => {
    const r = await RL.durableWithinLimit(key2, 5, { now, speicher: async (t, pa) => (await c.query(t, pa ?? [])).rows })
    await c.end()
    return r
  })
}))
p(parallel.filter((e) => e.erlaubt).length === 5, "20 gleichzeitige Versuche, genau 5 erlaubt", String(parallel.filter((e) => e.erlaubt).length))

console.log("\nV4 · Neues Fenster beginnt neu")
const spaeter = await RL.durableWithinLimit(key, 10, { now: now + RL.RATE_WINDOW_MS, speicher: q })
p(spaeter.erlaubt, "naechstes Fenster erlaubt")

console.log("\nV5 · Keine Rohadresse gespeichert, alte Fenster geraeumt")
const zeilen = await q(`SELECT bucket FROM rate_limit_windows`)
p(zeilen.every((z) => /^[0-9a-f]{64}$/.test(z.bucket)), "nur SHA-256-Hex")
p(!zeilen.some((z) => z.bucket.includes("198.51") || z.bucket.includes("203.0")), "keine Adresse im Klartext")
await q(`INSERT INTO rate_limit_windows (bucket, window_start, hits) VALUES ('alt', now() - interval '3 days', 3)`)
await RL.durableWithinLimit(await G.bucketKey("admin-login", "192.0.2.1"), 10, { now: now + 5 * RL.RATE_WINDOW_MS, speicher: q })
p((await q(`SELECT 1 FROM rate_limit_windows WHERE bucket='alt'`)).length === 0, "Fenster aelter als ein Tag entfernt")

console.log("\nV6 · Ohne Geheimnis bleibt die Adresse im Arbeitsspeicher")
delete process.env.LEAD_TOKEN_SECRET
delete process.env.RESEND_API_KEY
const roh = await G.bucketKey("admin-login", "192.0.2.55")
const vor = (await q(`SELECT count(*)::int n FROM rate_limit_windows`))[0].n
const r6 = await RL.durableWithinLimit(roh, 10, { speicher: q })
p(r6.quelle === "arbeitsspeicher", "Quelle Arbeitsspeicher", r6.quelle)
p((await q(`SELECT count(*)::int n FROM rate_limit_windows`))[0].n === vor, "nichts in die Datenbank geschrieben")

console.log("\nV7 · Gestoerter Speicher sperrt niemanden aus")
const kaputt = async () => { throw new Error("connection refused") }
process.env.LEAD_TOKEN_SECRET = "probe-token-geheimnis-nur-fuer-den-probelauf"
const r7 = await RL.durableWithinLimit(await G.bucketKey("admin-login", "192.0.2.77"), 10, { speicher: kaputt })
p(r7.erlaubt && r7.quelle === "arbeitsspeicher", "Fallback erlaubt")

await client.end()
console.log(fehler === 0 ? "\nAlle Pruefungen bestanden — das Fenster zaehlt ueber Instanzen.\n" : `\n${fehler} Pruefung(en) fehlgeschlagen.\n`)
process.exit(fehler === 0 ? 0 : 1)
