#!/usr/bin/env node
/**
 * DER KETTEN-PROBELAUF — GATE 20 ⬥
 *
 * ---------------------------------------------------------------------------
 * WAS DIESES GATE ANDERS FRAGT
 *
 * G17 prueft das Angebot. G18 prueft die Rechnung. G19 prueft die Lieferung.
 * Jedes davon prueft SICH. Gate 20 fragt, ob sie zusammen eine Kette sind:
 *
 *   Anfrage → Vorgang → Angebot → Ja → Rechnung → Geld
 *                              └→ Projekt → Abnahme → Uebergabe → Beleg-Frage
 *
 * Der Grund, warum das ein eigenes Gate ist, steht in der Sache selbst: Eine
 * Luecke ZWISCHEN zwei Gates liegt in keinem von beiden. Kein
 * Einzel-Probelauf kann sie finden, weil keiner fuer sie zustaendig ist.
 *
 * Und genau so eine war da. Auf der Paketzeile steht seit langem „50 % bei
 * Start, 50 % bei Ihrer Freigabe". G19 hat den Satz in seinem eigenen
 * Kopfkommentar benannt und konnte ihn nicht bauen — G18 gab es noch nicht.
 * G18 hat die Rechnung gebaut und wusste nichts von Projekten. Beide fuer
 * sich richtig, das Versprechen dazwischen wirkungslos.
 *
 * ---------------------------------------------------------------------------
 * WAS DIESER LAUF NICHT IST
 *
 * Er ist KEIN Beweis, dass ein echter Kunde diese Kette durchlaufen hat. Der
 * Gate-Vertrag verlangt „ein Projekt vollstaendig, mit einem echten Kunden";
 * das ist Owner-Wahrheit und steht bis heute aus. Bewiesen wird hier, dass
 * die Kette TRAEGT — an einem vollstaendig durchgespielten Vorgang gegen eine
 * echte Datenbank, mit allen Sperren scharf.
 */
import pg from "pg"
import { randomUUID } from "node:crypto"
import { requireSafeTarget } from "./lib/env-guard.mjs"

const ZIEL = process.env.KETTE_DRILL_URL || "postgres://localhost/drill_kette"
requireSafeTarget(ZIEL, "Ketten-Probelauf")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }
const wirft = async (fn) => { try { await fn(); return false } catch { return true } }

const c = new pg.Client({ connectionString: ZIEL })
await c.connect()
const sql = { query: async (t, ps) => (await c.query(t, ps ?? [])).rows }
const z = async (t, ps) => Number((await sql.query(t, ps))[0].n)

const { SCHEMA, BACKFILL } = await import("../lib/neon-client.ts")
const A = await import("../lib/angebot.ts")
const L = await import("../lib/lieferung.ts")
const R = await import("../lib/rechnung.ts")
const P = await import("../lib/proof.ts")

for (const s of SCHEMA) await sql.query(s)
for (const s of BACKFILL) await sql.query(s)

/* Eigene Spuren zuerst weg — ein Probelauf muss zweimal dasselbe sagen. */
await c.query("DELETE FROM payments WHERE evidence LIKE 'KETTE%'")
await c.query("DELETE FROM invoices WHERE id LIKE 'kette-%'")
await c.query("DELETE FROM projects WHERE id LIKE 'kette-%'")
await c.query("DELETE FROM offers WHERE reference LIKE 'KETTE%'")
await c.query("DELETE FROM opportunities WHERE title LIKE 'KETTE%'")
await c.query("DELETE FROM organisations WHERE name LIKE 'KETTE%'")

const vorher = {
  chancen: await z("SELECT count(*) n FROM opportunities"),
}

/* ══ K1 · Anfrage und Vorgang sind nicht dasselbe ══ */
console.log("\nK1 · Vom Betrieb zum Vorgang")
const orgId = randomUUID()
await c.query(`INSERT INTO organisations (id,name,lifecycle,created_at,updated_at)
  VALUES ($1,'KETTE Beispielbetrieb','prospect',now(),now())`, [orgId])
p(await z("SELECT count(*) n FROM opportunities WHERE organisation_id=$1", [orgId]) === 0,
  "eine Organisation allein erzeugt keine Verkaufschance")

const oppId = randomUUID()
await c.query(`INSERT INTO opportunities (id,title,organisation_id,created_at,updated_at)
  VALUES ($1,'KETTE Website',$2,now(),now())`, [oppId, orgId])
p(true, "ein Mensch legt den Vorgang an — der Weg dorthin bleibt manuell")

/* ══ K2–K3 · Ohne tragendes Ja kein Projekt ══ */
console.log("\nK2–K3 · Das Ja ist das Gelenk")
const ohneJa = { form: "muendlich", von: "", rolle: "", am: "2026-09-01", fundstelle: "" }
p(!A.annahmeTraegt(ohneJa), "K2 ein Ja ohne Person und Fundstelle traegt nicht")
p(!A.annahmeTraegt(null), "und gar kein Ja erst recht nicht")
const echtesJa = {
  form: "e-mail", von: "Ansprechpartner", rolle: "Geschäftsführung",
  am: "2026-09-01", fundstelle: "Postfach info@creadig.de, Betreff „Angebot angenommen“",
}
p(A.annahmeTraegt(echtesJa), "ein Ja mit Person, Form, Datum und Fundstelle traegt")

const offerId = randomUUID()
await c.query(`INSERT INTO offers (id,opportunity_id,reference,kind,valid_until,positions,state,acceptance,created_at,updated_at)
  VALUES ($1,$2,'KETTE-1','website',current_date + 30,$3,'angenommen',$4,now(),now())`,
  [offerId, oppId, JSON.stringify([{ art: "katalog", key: "website" }]), JSON.stringify(echtesJa)])

const projektId = `kette-${randomUUID()}`
p(await wirft(() => c.query(
  `INSERT INTO projects (id,opportunity_id,offer_id,state) VALUES ($1,$2,$3,'aufgesetzt')`,
  [projektId, oppId, randomUUID()])), "K3 ein Projekt ohne existierendes Angebot wird abgelehnt")
await c.query(`INSERT INTO projects (id,opportunity_id,offer_id,state) VALUES ($1,$2,$3,'aufgesetzt')`,
  [projektId, oppId, offerId])
p(true, "mit dem angenommenen Angebot entsteht das Projekt")

/* ══ K4 · Rechnung und Projekt zeigen auf dieselbe Quelle ══ */
console.log("\nK4 · Eine Quelle fuer Umfang und Geld")
const rechnungId = `kette-${randomUUID()}`
await c.query(`INSERT INTO invoices (id,opportunity_id,offer_id,positions,state)
  VALUES ($1,$2,$3,$4,'entwurf')`,
  [rechnungId, oppId, offerId, JSON.stringify([{ label: "Website-Paket", menge: 1, einzelpreisCent: 390000 }])])
const beide = await sql.query(
  `SELECT (SELECT offer_id FROM projects WHERE id=$1) AS projekt,
          (SELECT offer_id FROM invoices WHERE id=$2) AS rechnung`, [projektId, rechnungId])
p(beide[0].projekt === beide[0].rechnung,
  "K4 Projekt und Rechnung haengen am selben Angebot — der Umfang wird nicht zweimal getippt")
p(await wirft(() => c.query("DELETE FROM offers WHERE id=$1", [offerId])),
  "und das Angebot laesst sich nicht mehr loeschen")

/* ══ K5–K8 · Das oeffentliche Zahlungsversprechen ══ */
console.log("\nK5–K8 · „50 % bei Start, 50 % bei Ihrer Freigabe“")
const brutto = R.summe([{ label: "Website-Paket", menge: 1, einzelpreisCent: 390000 }],
  { art: "regelbesteuert", satz: 19, hinweis: "…", entschieden: true }).bruttoCent

const beiStart = R.raten("website", brutto, "aufgesetzt")
p(beiStart !== null && beiStart.length === 2, "K5 der Plan hat zwei Raten")
p(beiStart[0].faellig && !beiStart[1].faellig, "bei „aufgesetzt“ ist nur die Startrate faellig")
p(/verlangt die Abnahme/.test(beiStart[1].warum), "und die zweite sagt, worauf sie wartet")

const beiAbnahme = R.raten("website", brutto, "abgenommen")
p(beiAbnahme.every((r) => r.faellig), "K6 nach der Abnahme sind beide faellig")
p(R.raten("website", brutto, null).every((r) => !r.faellig), "ohne Projekt ist nichts faellig")

const ungerade = R.raten("website", 390001, "abgenommen")
p(ungerade[0].betragCent + ungerade[1].betragCent === 390001,
  "K7 bei ungeradem Betrag traegt die letzte Rate den Rest — kein Cent geht verloren",
  `${ungerade[0].betragCent} + ${ungerade[1].betragCent}`)

p(R.raten("systemprojekt", brutto, "abgenommen") === null,
  "K8 fuer ein Systemprojekt gibt es keinen Plan — der Satz steht nur am Website-Paket")
p(R.raten("betrieb", brutto, "abgenommen") === null, "und fuer den Betrieb auch nicht")

/* ══ K9 · Die Abnahme erzeugt keine Freigabe ══ */
console.log("\nK9 · Abnahme ist keine Freigabe")
const projekt = {
  id: projektId, opportunityId: oppId, offerId, materialEingang: "2026-09-02",
  aenderungen: [], abnahme: echtesJa, uebergabe: {}, zustand: "abgenommen",
  erstelltAm: "2026-09-01",
}
p(L.belegMoment(projekt) === true, "nach der Abnahme ist der Moment fuer die Frage nach der Freigabe")
p(!P.deckung([], ["name"]).gedeckt, "aber die Freigabe selbst entsteht dadurch nicht")
const lieferungQuelle = (await import("node:fs")).readFileSync("lib/lieferung.ts", "utf8")
p(!/from "@\/lib\/proof"/.test(lieferungQuelle),
  "und die Lieferung importiert `lib/proof` nicht — die Barriere aus G19 steht")

/* ══ K10–K11 · Geld und Fortschritt leiten einander nicht ab ══ */
console.log("\nK10–K11 · Zwei Wahrheiten, keine leitet die andere ab")
await c.query(`UPDATE invoices SET state='gestellt', number='KETTE-0001', issued_at=current_date,
  tax_snapshot=$2 WHERE id=$1`,
  [rechnungId, JSON.stringify({ art: "regelbesteuert", satz: 19, hinweis: "…", entschieden: true })])
await c.query(`INSERT INTO payments (id,invoice_id,amount_cent,value_date,evidence)
  VALUES ($1,$2,$3,current_date,'KETTE Kontoauszug 1')`, [randomUUID(), rechnungId, brutto])
const zustandNachZahlung = (await sql.query("SELECT state FROM projects WHERE id=$1", [projektId]))[0].state
p(zustandNachZahlung === "aufgesetzt", "K10 eine vollstaendige Zahlung bewegt das Projekt nicht", zustandNachZahlung)

/*
 * `material_received` muss mitgesetzt werden — `projects_material_check`
 * verlangt es fuer alles ausser „aufgesetzt". Der erste Anlauf dieses Laufs
 * hat es vergessen und ist an dem CHECK gescheitert. Das ist kein Umweg,
 * sondern der Beleg, dass die Sperre aus G19 auch dann greift, wenn jemand
 * die Tabelle direkt beschreibt — hier also ein anderer Probelauf.
 */
await c.query(`UPDATE projects SET state='abgenommen', acceptance=$2, material_received='2026-09-02'
  WHERE id=$1`, [projektId, JSON.stringify(echtesJa)])
const zahlungenNachAbnahme = await z("SELECT count(*) n FROM payments WHERE invoice_id=$1", [rechnungId])
p(zahlungenNachAbnahme === 1, "K11 und eine Abnahme erzeugt keinen Geldeingang")

/* ══ K12 · Was die ganze Kette nicht erzeugt ══ */
console.log("\nK12 · Was ueber die ganze Kette nicht entstanden ist")
p(await z("SELECT count(*) n FROM opportunities") === vorher.chancen + 1,
  "genau EIN Vorgang — der, den ein Mensch angelegt hat")
const consent = await sql.query(
  `SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND (column_name ILIKE '%consent%' OR column_name ILIKE '%einwillig%')`)
p(consent.length === 0, "kein Feld fuer eine Werbeeinwilligung im ganzen Schema")
p(await z("SELECT count(*) n FROM research_cases WHERE contact_decision IS NOT NULL") === 0,
  "keine Kontaktentscheidung von selbst gesetzt")

/* ══ K13 · Der schaerfste Befund der Kette ══ */
console.log("\nK13 · Wo die Kette heute wirklich haengt")
const stell = R.stellbarkeit({ positionen: [{ label: "x", menge: 1, einzelpreisCent: 100 }], zustand: "entwurf" })
p(!stell.ok, "die Rechnung kann NICHT gestellt werden — der Steuerstatus ist offen")
p(L.darfInZustand(projekt, "uebergeben") !== undefined, "die Lieferung laeuft davon unberuehrt weiter")
console.log(
  `\n  Das ist der Betriebszustand heute: creaDIG kann ein Projekt vollstaendig\n` +
  `  liefern und abnehmen lassen — und dafuer keine Rechnung stellen. Die Sperre\n` +
  `  ist richtig; sie steht an der einen Stelle, an der ein Dokument nach\n` +
  `  draussen ginge. Aufgehoben wird sie nicht mit Code, sondern mit dem\n` +
  `  Umsatzsteuer-Status (G04-Owner-Schuld).`)

console.log(`\n  ${fehler === 0 ? "Die Kette traegt — bis zu der Stelle, an der ein Mensch fehlt." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
await c.end()
process.exit(fehler === 0 ? 0 : 1)
