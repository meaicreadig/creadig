#!/usr/bin/env node
/**
 * Der Vertriebs-Probelauf (Gate 08).
 *
 * Prueft die Regeln, die ein Verkaufssystem still falsch machen: dass aus
 * einem Eingang von selbst ein Geschaeft wird, dass ein Festpreis-Angebot
 * Fragen verlangt, die es nicht braucht, dass Abnahmedaten mitgezaehlt
 * werden, dass ein abgeschlossener Vorgang ewig einen naechsten Schritt
 * fordert.
 *
 * Faehrt den echten Code gegen eine Wegwerf-Datenbank — wie `crm-drill.mjs`.
 */
import pg from "pg"
import { requireSafeTarget } from "./lib/env-guard.mjs"

const ZIEL = process.env.SALES_DRILL_URL || "postgres://localhost/g8"
requireSafeTarget(ZIEL, "Vertriebs-Probelauf")

let fehler = 0
const p = (ok, name, detail = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`) }

const client = new pg.Client({ connectionString: ZIEL })
await client.connect()
const sql = Object.assign(
  async (strings, ...w) => (await client.query(strings.reduce((a, s, i) => a + s + (i < w.length ? `$${i+1}` : ""), ""), w)).rows,
  { query: async (t, ps) => (await client.query(t, ps ?? [])).rows },
)
const z = async (q, ps=[]) => Number((await client.query(q, ps)).rows[0].n)

const { SCHEMA, BACKFILL, seedBestand, applyExclusions } = await import("../lib/neon-client.ts")
const { OFFERS, readinessFor, needsSystemDrivers, OFFER_KINDS } = await import("../lib/offer-readiness.ts")

for (const s of SCHEMA) await sql.query(s)
for (const s of BACKFILL) await sql.query(s)
await seedBestand(sql)
await applyExclusions(sql)

console.log("\n1 · Aus nichts entsteht kein Geschaeft")
p(await z("SELECT count(*) n FROM opportunities") === 0, "R02 Import erzeugt keinen Vorgang")
await client.query(`INSERT INTO leads (id,reference,source,locale,name,business,email,phone,sales_status,handling_status,created_at,updated_at)
  VALUES ('l1','CD-G8-1','termin','de','ABNAHME Anfrager','ABNAHME Neu GmbH','neu@abnahme.test','0','new','neu',now(),now())`)
p(await z("SELECT count(*) n FROM opportunities") === 0, "R01 Anfrage erzeugt keinen Vorgang")
p(await z("SELECT count(*) n FROM opportunities o JOIN contacts c ON c.id=o.contact_id WHERE c.relationship='warm'") === 0,
  "R03 warme Beziehung erzeugt keinen Vorgang")
p(await z("SELECT count(*) n FROM opportunities o JOIN organisations g ON g.id=o.organisation_id WHERE g.lifecycle='kunde'") === 0,
  "R04 Kundenhistorie erzeugt keinen Vorgang", `${await z("SELECT count(*) n FROM organisations WHERE lifecycle='kunde'")} Kunden im Bestand`)

console.log("\n2 · Angebotsreife — Festpreis braucht KEINE Systemtreiber")
for (const art of OFFER_KINDS) {
  const treiber = OFFERS[art].evidence.filter(e => /ablaeufe|rollen-orte|bestand/.test(e.key)).length
  const soll = art === "systemprojekt"
  p(soll ? treiber > 0 : treiber === 0,
    `${OFFERS[art].label}: Systemtreiber ${soll ? "vorhanden" : "NICHT verlangt"}`, `${treiber} Treiberbelege`)
}
p(needsSystemDrivers("website") === false, "R07 Website ohne Treiber reif machbar")
p(needsSystemDrivers("pruefung") === false, "R08 Pruefung ohne Treiber reif machbar")
p(needsSystemDrivers("systemprojekt") === true, "R09/R10 Systemprojekt verlangt Umfangsbelege")

console.log("\n3 · Reife entsteht aus Belegen, nicht aus einer Zahl")
const leer = readinessFor("website", [])
p(!leer.ready && leer.open.length === 3, "Website ohne Belege nicht reif", `${leer.open.length} offene Fragen`)
const halb = readinessFor("website", ["betrieb"])
p(!halb.ready && halb.open.length === 2, "ein Beleg genuegt nicht")
const voll = readinessFor("website", OFFERS.website.evidence.map(e => e.key))
p(voll.ready && voll.open.length === 0, "alle Belege -> reif")
const sys = readinessFor("systemprojekt", ["problem", "ablaeufe"])
p(!sys.ready, "R09 Systemprojekt mit halbem Umfang nicht reif", `${sys.open.length} offen`)
p(!("score" in leer) && !("percent" in leer), "kein Punktwert im Ergebnis")

console.log("\n4 · Der Speicher wirft fremde Belege weg")
await client.query(`INSERT INTO organisations (id,name,lifecycle,created_at,updated_at)
  VALUES ('o1','ABNAHME Neu GmbH','prospect',now(),now()) ON CONFLICT (lower(name)) DO NOTHING`)
await client.query(`INSERT INTO opportunities (id,organisation_id,title,status,created_at,updated_at)
  VALUES ('opp1','o1','ABNAHME Vorgang','new',now(),now())`)
await client.query(`UPDATE opportunities SET offer_kind='website',
  readiness_evidence=ARRAY['betrieb','ablaeufe','erfunden'] WHERE id='opp1'`)
const roh = (await client.query("SELECT readiness_evidence FROM opportunities WHERE id='opp1'")).rows[0].readiness_evidence
const gefiltert = readinessFor("website", roh)
p(gefiltert.open.length === 2, "fremde Schluessel zaehlen nicht zur Reife",
  `gespeichert ${roh.length}, wirksam ${3 - gefiltert.open.length}`)

console.log("\n5 · Abnahmedaten zaehlen nicht mit")
await client.query(`INSERT INTO organisations (id,name,lifecycle,created_at,updated_at)
  VALUES ('o-test','Yilmaz Dachtechnik','unbekannt',now(),now()) ON CONFLICT (lower(name)) DO NOTHING`)
await client.query(`INSERT INTO opportunities (id,organisation_id,title,status,created_at,updated_at)
  SELECT 'opp-test', id, 'Yilmaz Dachtechnik','contacted',now(),now() FROM organisations WHERE name='Yilmaz Dachtechnik'
  ON CONFLICT (id) DO NOTHING`)
await applyExclusions(sql)
const offenAlle = await z("SELECT count(*) n FROM opportunities WHERE status NOT IN ('won','lost')")
const offenEcht = await z("SELECT count(*) n FROM opportunities WHERE status NOT IN ('won','lost') AND excluded_reason IS NULL")
p(offenAlle === 2 && offenEcht === 1, "R26/R27/R28 Abnahmevorgang faellt aus der Zaehlung", `${offenAlle} gesamt, ${offenEcht} operativ`)
p(await z("SELECT count(*) n FROM contacts WHERE name ILIKE '%Hüseyin Yilmaz%' AND excluded_reason IS NULL") === 1,
  "und der echte Dr. Yilmaz bleibt", "Ausschluss trifft exakt")

console.log("\n6 · Naechster Schritt — offen vs. abgeschlossen")
p(await z("SELECT count(*) n FROM opportunities WHERE excluded_reason IS NULL AND status NOT IN ('won','lost') AND next_action IS NULL") === 1,
  "R14 offener Vorgang ohne Schritt ist Schuld")
await client.query("UPDATE opportunities SET status='won' WHERE id='opp1'")
p(await z("SELECT count(*) n FROM opportunities WHERE excluded_reason IS NULL AND status NOT IN ('won','lost') AND next_action IS NULL") === 0,
  "R07/R18 abgeschlossener Vorgang fordert keinen Schritt mehr")
p(await z("SELECT count(*) n FROM opportunities WHERE status='lost'") === 0, "R21 nichts wurde automatisch verloren")

console.log("\n7 · Geld bleibt unbekannt, wenn es unbekannt ist")
p((await client.query("SELECT estimated_value FROM opportunities WHERE id='opp1'")).rows[0].estimated_value === null,
  "R12 kein Wert erfunden — NULL, nicht 0")

await client.end()
console.log(fehler === 0 ? "\nAlle Vertriebsregeln halten.\n" : `\n${fehler} Regel(n) verletzt.\n`)
process.exit(fehler === 0 ? 0 : 1)
