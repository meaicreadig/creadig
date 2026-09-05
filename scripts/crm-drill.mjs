#!/usr/bin/env node
/**
 * Der CRM-Kern-Probelauf (Gate 07).
 *
 * ---------------------------------------------------------------------------
 * WARUM ES IHN GIBT
 * `scripts/check-bestand.mjs` prueft die QUELLE: eindeutige Schluessel, kein
 * Ausschlussname auf einem Bestandsdatensatz, keine Verkaufschance im
 * Datenmodell. Das ist gut, aber es ist eine Textpruefung. Sie sagt nichts
 * darueber, was passiert, wenn der Import zweimal laeuft, wenn ein Mensch ein
 * Feld korrigiert hat, oder wenn eine Anfrage auf einen bestehenden Kontakt
 * trifft.
 *
 * Genau das sind die Faelle, in denen ein CRM still falsch wird. Sie lassen
 * sich nur an einer echten Datenbank zeigen.
 *
 * ---------------------------------------------------------------------------
 * WIE ER DAS TUT, OHNE EINE ZWEITE WAHRHEIT ZU BAUEN
 * Er fuehrt NICHT nachgebautes SQL aus. Er reicht dem echten
 * `neonClient()`-Pfad einen Adapter, der `query(text, params)` an `pg`
 * weitergibt — dieselbe Schnittstelle, die `neon()` anbietet. Damit laufen
 * SCHEMA, BACKFILL, seedBestand und applyExclusions Zeile fuer Zeile so, wie
 * sie in Produktion laufen.
 *
 * ---------------------------------------------------------------------------
 * WOGEGEN
 * Nur gegen eine WEGWERF-Datenbank. `requireSafeTarget()` aus Gate 01 haelt
 * den Lauf an, wenn das Ziel nach Produktion aussieht. Diese Datei aendert
 * niemals Produktionsdaten.
 */
import pg from "pg"
import { requireSafeTarget } from "./lib/env-guard.mjs"

const ZIEL = process.env.CRM_DRILL_URL || "postgres://localhost/g7"
requireSafeTarget(ZIEL, "CRM-Probelauf")

let fehler = 0
const schritt = (name, ok, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

const client = new pg.Client({ connectionString: ZIEL })
await client.connect()

/* Der Adapter: dieselbe Form, die `neon()` liefert. */
const sql = Object.assign(
  async (strings, ...werte) => {
    const text = strings.reduce((acc, s, i) => acc + s + (i < werte.length ? `$${i + 1}` : ""), "")
    return (await client.query(text, werte)).rows
  },
  { query: async (text, params) => (await client.query(text, params ?? [])).rows },
)

const { SCHEMA, BACKFILL, seedBestand, applyExclusions } = await import("../lib/neon-client.ts")

/** Genau die Reihenfolge aus `neonClient().ready()` — kein Nachbau. */
const seedAlles = async (sql) => {
  for (const stmt of SCHEMA) await sql.query(stmt)
  for (const stmt of BACKFILL) await sql.query(stmt)
  await seedBestand(sql)
  await applyExclusions(sql)
}

console.log("\n1 · Schema und Bestand aufbauen")
await seedAlles(sql)
schritt("Aufbau ohne Fehler", true)

const zahl = async (q, p = []) => Number((await client.query(q, p)).rows[0].n)

console.log("\n2 · Vegitat — eine Organisation, vier Standorte")
const orgs = await zahl("SELECT count(*) n FROM organisations WHERE name ILIKE '%vegitat%'")
const locs = await zahl(
  "SELECT count(*) n FROM locations l JOIN organisations o ON o.id=l.organisation_id WHERE o.name ILIKE '%vegitat%'")
schritt("genau EINE Organisation", orgs === 1, `${orgs} gefunden`)
schritt("genau VIER Standorte", locs === 4, `${locs} gefunden`)
for (const r of (await client.query(
  "SELECT l.label, l.city FROM locations l JOIN organisations o ON o.id=l.organisation_id WHERE o.name ILIKE '%vegitat%' ORDER BY l.label")).rows)
  console.log(`       · ${r.label} — ${r.city}`)

console.log("\n3 · Keine einzige Verkaufschance aus dem Import")
schritt("Vorgaenge = 0", (await zahl("SELECT count(*) n FROM opportunities")) === 0)

console.log("\n4 · Ausschluss trifft genau — und nur — die Testdaten")
const drHueseyin = await zahl(
  "SELECT count(*) n FROM contacts WHERE name ILIKE '%Hüseyin Yilmaz%' AND (excluded_reason IS NULL)")
const dachtechnik = await zahl("SELECT count(*) n FROM organisations WHERE name = 'Yilmaz Dachtechnik'")
schritt("Dr. Hüseyin Yilmaz bleibt aktiv", drHueseyin === 1, `${drHueseyin} aktiv`)
schritt("„Yilmaz Dachtechnik“ steht nicht im Bestand", dachtechnik === 0)

console.log("\n5 · Zweiter Lauf legt nichts doppelt an")
const vorher = await zahl("SELECT count(*) n FROM organisations")
const kVorher = await zahl("SELECT count(*) n FROM contacts")
const sVorher = await zahl("SELECT count(*) n FROM locations")
await seedAlles(sql)
schritt("Organisationen unveraendert", (await zahl("SELECT count(*) n FROM organisations")) === vorher, `${vorher}`)
schritt("Kontakte unveraendert", (await zahl("SELECT count(*) n FROM contacts")) === kVorher, `${kVorher}`)
schritt("Standorte unveraendert", (await zahl("SELECT count(*) n FROM locations")) === sVorher, `${sVorher}`)

console.log("\n6 · Menschliche Korrektur ueberlebt den naechsten Import")
await client.query("UPDATE organisations SET city='ZUERICH-VON-HAND' WHERE name ILIKE '%vegitat%'")
await client.query("UPDATE contacts SET role='VON HAND GESETZT' WHERE name ILIKE '%Ole Bettray%'")
await seedAlles(sql)
const stadt = (await client.query("SELECT city FROM organisations WHERE name ILIKE '%vegitat%'")).rows[0]?.city
const rolle = (await client.query("SELECT role FROM contacts WHERE name ILIKE '%Ole Bettray%'")).rows[0]?.role
schritt("Ort der Organisation bleibt", stadt === "ZUERICH-VON-HAND", String(stadt))
schritt("Rolle des Kontakts bleibt", rolle === "VON HAND GESETZT", String(rolle))

console.log("\n7 · Beziehung erzeugt keine Pipeline")
const warm = await zahl("SELECT count(*) n FROM contacts WHERE relationship='warm'")
const kunden = await zahl("SELECT count(*) n FROM organisations WHERE lifecycle='kunde'")
schritt("warme Kontakte vorhanden", warm >= 1, `${warm}`)
schritt("Kunden-Historie vorhanden", kunden >= 1, `${kunden}`)
schritt("und trotzdem 0 Vorgaenge", (await zahl("SELECT count(*) n FROM opportunities")) === 0)

console.log("\n8 · Eine Anfrage trifft einen bestehenden Kontakt")
const { linkLeadToCrm } = await import("../lib/neon-client.ts")
/*
 * Wichtig fuer das Verstaendnis des Modells: „kunde" ist KEINE Beziehung
 * eines Menschen, sondern der Lebenszyklus einer ORGANISATION
 * (`unbekannt|prospect|kunde|ehemaliger-kunde`). Ein Mensch traegt seine
 * Naehe (`unbekannt|bekannt|warm|eng`). Die Datenbank erzwingt das ueber
 * zwei getrennte Pruefbedingungen — ein Versuch, „kunde" auf einen Kontakt
 * zu schreiben, scheitert. Genau so soll es sein.
 */
await client.query(
  `INSERT INTO contacts (id, name, email, email_normalised, relationship, created_at, updated_at)
   VALUES ('k-abnahme','ABNAHME Bestandsmensch','alt@abnahme.test','alt@abnahme.test','eng',now(),now())
   ON CONFLICT (email_normalised) DO NOTHING`)
const kVor = await zahl("SELECT count(*) n FROM contacts")
await client.query(
  `INSERT INTO leads (id, reference, source, locale, name, business, email, phone,
                      sales_status, handling_status, created_at, updated_at)
   VALUES ('l-abnahme','CD-ABN','termin','de','ABNAHME Bestandsmensch','ABNAHME Betrieb',
           'ALT@Abnahme.test','0171 1','new','neu',now(),now())
   ON CONFLICT (id) DO NOTHING`)
await linkLeadToCrm(sql, { id: "l-abnahme", name: "ABNAHME Bestandsmensch", email: "ALT@Abnahme.test",
  phone: "0171 1", business: "ABNAHME Betrieb", createdAt: new Date().toISOString() })
const kNach = await zahl("SELECT count(*) n FROM contacts")
const bez = (await client.query("SELECT relationship FROM contacts WHERE email_normalised='alt@abnahme.test'")).rows[0]?.relationship
schritt("kein zweiter Mensch trotz anderer Schreibweise", kNach === kVor, `${kVor} -> ${kNach}`)
schritt("Naehe bleibt „eng“ — der Eingang stuft nicht um", bez === "eng", String(bez))
schritt("und weiterhin 0 Vorgaenge", (await zahl("SELECT count(*) n FROM opportunities")) === 0)

console.log("\n9 · Auskunft ueber eine Adresse findet den ganzen Zusammenhang")
const fund = (await client.query(
  `SELECT 'Kontakt   '||c.name AS z FROM contacts c WHERE c.email_normalised='alt@abnahme.test'
   UNION ALL SELECT 'Betrieb   '||o.name FROM organisations o JOIN contacts c2 ON c2.organisation_id=o.id
     WHERE c2.email_normalised='alt@abnahme.test'
   UNION ALL SELECT 'Anfrage   '||l.reference FROM leads l WHERE lower(l.email)='alt@abnahme.test'`)).rows
for (const r of fund) console.log(`       · ${r.z}`)
schritt("mindestens Kontakt, Betrieb und Anfrage auffindbar", fund.length >= 3, `${fund.length} Treffer`)

await client.end()
console.log(fehler === 0
  ? "\nAlle Pruefungen bestanden — der Kundenkern haelt.\n"
  : `\n${fehler} Pruefung(en) fehlgeschlagen.\n`)
process.exit(fehler === 0 ? 0 : 1)
