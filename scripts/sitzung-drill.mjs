#!/usr/bin/env node
/**
 * ADM-02 · H2 · SITZUNGSWIDERRUF-PROBELAUF
 *
 * Faehrt `lib/admin-widerruf.ts` gegen eine WEGWERF-Postgres — dieselben
 * SQL-Zeilen, die in Produktion ueber Neon laufen, ueber einen `pg`-Adapter
 * mit derselben Form (`query(text, params)`).
 *
 * Geprueft wird, was ein Cookie-Loeschen nicht kann: dass eine KOPIE der
 * Sitzung nach dem Abmelden nirgends mehr gilt.
 *
 * Aufruf: SITZUNG_DRILL_URL=postgres://localhost/drill_sitzung npm run sitzung-drill
 */
import pg from "pg"

import { requireSafeTarget } from "./lib/env-guard.mjs"

const ZIEL = process.env.SITZUNG_DRILL_URL || "postgres://localhost/drill_sitzung"
requireSafeTarget(ZIEL, "Sitzungs-Probelauf")

/* Nur Probewerte — kein Produktionsgeheimnis beruehrt diese Datei. */
process.env.ADMIN_PASSWORD = "probe-owner"
process.env.ADMIN_SESSION_SECRET = "probe-geheimnis-nur-fuer-den-probelauf-0123456789"

const S = await import("../lib/admin-session.ts")
const W = await import("../lib/admin-widerruf.ts")
const { SCHEMA } = await import("../lib/neon-client.ts")

let fehler = 0
const p = (ok, name, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

const client = new pg.Client({ connectionString: ZIEL })
await client.connect()
const q = async (text, params) => (await client.query(text, params ?? [])).rows

console.log("\nS1 · Ohne Tabelle (Migration 015 offen) legt nichts lahm")
const a = await S.issueSession("owner")
const ohne = await W.pruefeZugang(a, { aendernd: true, speicher: q })
p(ohne.verdict === "ok", "aendernd trotzdem erlaubt", ohne.verdict)
p(ohne.widerrufUngeprueft === true, "und als ungeprueft markiert")

console.log("\nS2 · Schema aus der Laufzeit-Liste")
for (const stmt of SCHEMA.filter((s) => s.includes("admin_session_revocations"))) await q(stmt)
p((await q(`SELECT to_regclass('admin_session_revocations') AS t`))[0].t !== null, "Tabelle angelegt")

console.log("\nS3 · Abmelden widerruft die Kopie")
const sitzung = await S.issueSession("owner")
const kopie = sitzung
const vorher = await W.pruefeZugang(kopie, { aendernd: false, speicher: q })
p(vorher.verdict === "ok", "vor dem Abmelden gueltig")
await W.widerrufen(q, vorher.sid, vorher.expiresAt, "abmelden")
p((await W.pruefeZugang(kopie, { aendernd: false, speicher: q })).verdict === "revoked", "Kopie beim LESEN abgewiesen")
p((await W.pruefeZugang(kopie, { aendernd: true, speicher: q })).verdict === "revoked", "Kopie beim AENDERN abgewiesen")
await W.widerrufen(q, vorher.sid, vorher.expiresAt, "abmelden")
p(Number((await q(`SELECT count(*) n FROM admin_session_revocations WHERE sid = $1`, [vorher.sid]))[0].n) === 1,
  "doppeltes Abmelden: eine Zeile")
const andere = await S.issueSession("vertrieb")
p((await W.pruefeZugang(andere, { aendernd: true, speicher: q })).verdict === "ok", "eine ANDERE Sitzung bleibt gueltig")

console.log("\nS4 · Neue Anmeldung = neue Sitzungs-ID (keine Fixation)")
const n1 = await W.pruefeZugang(await S.issueSession("owner"), { aendernd: false, speicher: q })
const n2 = await W.pruefeZugang(await S.issueSession("owner"), { aendernd: false, speicher: q })
p(n1.sid !== n2.sid && /^[0-9a-f]{32}$/.test(n1.sid), "zwei Anmeldungen, zwei IDs")

console.log("\nS5 · Ueberall abmelden")
const alt1 = await S.issueSession("owner", Date.now() - 60_000)
const alt2 = await S.issueSession("vertrieb", Date.now() - 30_000)
await W.alleWiderrufen(q)
p((await W.pruefeZugang(alt1, { aendernd: false, speicher: q })).verdict === "revoked", "aeltere Owner-Sitzung widerrufen")
p((await W.pruefeZugang(alt2, { aendernd: false, speicher: q })).verdict === "revoked", "aeltere Vertriebs-Sitzung widerrufen")
await new Promise((r) => setTimeout(r, 20))
const neu = await S.issueSession("owner")
p((await W.pruefeZugang(neu, { aendernd: true, speicher: q })).verdict === "ok", "danach ausgestellte Sitzung gilt")
await W.alleWiderrufen(q)
p(Number((await q(`SELECT count(*) n FROM admin_session_revocations WHERE sid = '*'`))[0].n) === 1, "Stichtag bleibt EINE Zeile")

console.log("\nS6 · Abgelaufene Eintraege werden aufgeraeumt")
await q(`INSERT INTO admin_session_revocations (sid, revoked_at, expires_at, reason)
         VALUES ('0000000000000000000000000000dead', now() - interval '2 days', now() - interval '1 day', 'abmelden')`)
const frisch = await W.pruefeZugang(await S.issueSession("owner"), { aendernd: false, speicher: q })
await W.widerrufen(q, frisch.sid, frisch.expiresAt, "abmelden")
p(Number((await q(`SELECT count(*) n FROM admin_session_revocations WHERE sid = '0000000000000000000000000000dead'`))[0].n) === 0,
  "abgelaufener Eintrag entfernt")
p(Number((await q(`SELECT count(*) n FROM admin_session_revocations WHERE sid = '*'`))[0].n) === 1, "Stichtag nicht entfernt")

console.log("\nS7 · Gestoerter Speicher: lesen ja, aendern nein")
const kaputt = async () => { throw Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" }) }
const gueltig = await S.issueSession("owner")
const lesen = await W.pruefeZugang(gueltig, { aendernd: false, speicher: kaputt })
p(lesen.verdict === "ok" && lesen.widerrufUngeprueft === true, "lesend: ok, ungeprueft markiert")
p((await W.pruefeZugang(gueltig, { aendernd: true, speicher: kaputt })).verdict === "unavailable", "aendernd: abgelehnt")

console.log("\nS8 · Gefaelschte Sitzungs-ID")
const [r, abl, sid, sig] = gueltig.split(".")
p((await W.pruefeZugang(`${r}.${abl}.${"f".repeat(32)}.${sig}`, { aendernd: false, speicher: q })).verdict === "invalid",
  "andere ID unter derselben Signatur: ungueltig")
p((await W.pruefeZugang(`${r}.${abl}.${sid}`, { aendernd: false, speicher: q })).verdict === "invalid",
  "drei Felder (altes Format): ungueltig")

await client.end()
console.log(fehler === 0 ? "\nAlle Pruefungen bestanden — Abmelden widerruft.\n" : `\n${fehler} Pruefung(en) fehlgeschlagen.\n`)
process.exit(fehler === 0 ? 0 : 1)
