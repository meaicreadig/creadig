#!/usr/bin/env node
/**
 * DER RECHNUNGS-PROBELAUF — GATE 18
 *
 * Prueft die Saetze, die ein Betrieb sich ueber Geld erzaehlt, wenn niemand
 * widerspricht: „die Rechnung ist raus, also ist sie bezahlt", „da kam noch
 * nichts“ ohne nachzusehen, „das ist doch dieselbe Rechnung, ich aendere sie
 * eben".
 *
 * Zwei Fassungen, zwei Pruefungen: `lib/rechnung.ts` haelt die Oberflaeche
 * ehrlich, die CHECKs im Schema halten jeden anderen Weg an die Tabelle —
 * einen Import, eine Konsole, ein spaeteres Skript. Beide werden hier
 * angegriffen.
 */
import pg from "pg"
import { randomUUID } from "node:crypto"
import { requireSafeTarget } from "./lib/env-guard.mjs"

const ZIEL = process.env.RECHNUNG_DRILL_URL || "postgres://localhost/g18_abnahme"
requireSafeTarget(ZIEL, "Rechnungs-Probelauf")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }
const wirft = async (fn) => { try { await fn(); return false } catch { return true } }

const c = new pg.Client({ connectionString: ZIEL })
await c.connect()
const sql = { query: async (t, ps) => (await c.query(t, ps ?? [])).rows }

const { SCHEMA, BACKFILL } = await import("../lib/neon-client.ts")
const R = await import("../lib/rechnung.ts")
const S = await import("../lib/site-data.ts")

for (const s of SCHEMA) await sql.query(s)
for (const s of BACKFILL) await sql.query(s)

/*
 * Ein Probelauf muss zweimal dasselbe sagen.
 *
 * Beim zweiten Lauf gegen dieselbe Wegwerf-Datenbank stand das Geruest des
 * ersten noch da — und die letzte Pruefung („eine Rechnung erzeugt keine
 * zweite Verkaufschance") zaehlte dann zwei. Ein Werkzeug, dessen Antwort
 * davon abhaengt, wie oft man es schon aufgerufen hat, misst nichts.
 *
 * Er raeumt deshalb zuerst weg, was ein FRUEHERER LAUF VON IHM SELBST
 * hinterlassen hat — und nur das. Reihenfolge von innen nach aussen, damit
 * kein Fremdschluessel im Weg steht.
 */
await c.query("DELETE FROM payments WHERE evidence LIKE 'ABNAHME%'")
await c.query("DELETE FROM invoices WHERE id LIKE 'abnahme-%'")
await c.query("DELETE FROM offers WHERE reference = 'ABN-1'")
await c.query("DELETE FROM opportunities WHERE title LIKE 'ABNAHME%'")
await c.query("DELETE FROM organisations WHERE name = 'ABNAHME Rechnungsbetrieb'")

const POS = [
  { label: "Website-Paket", menge: 1, einzelpreisCent: 390000 },
  { label: "Zusatztag", menge: 3, einzelpreisCent: 95000 },
]
const entwurf = (o = {}) => ({
  id: "abnahme-1", nummer: null, offerId: "o", opportunityId: "v",
  zustand: "entwurf", positionen: POS, zahlungszielTage: 14,
  gestelltAm: null, steuerSnapshot: null, storniertAm: null, ersetztDurch: null,
  zahlungen: [], ...o,
})

/* ══ R1 · Der Steuerstatus sperrt das Stellen, nicht das Arbeiten ══ */
console.log("\nR1 · Offener Steuerstatus")
p(S.imprintDetails.taxStatusPending === true, "Ausgangslage: taxStatusPending steht auf true (G04-Schuld)")
p(!R.steuerlage().entschieden, "die Steuerlage ist damit nicht entschieden")
p(R.steuerlage().art === "offen" && R.steuerlage().hinweis === null,
  "und es wird kein Satz erfunden, der auf der Rechnung stuende")
const s1 = R.stellbarkeit(entwurf())
p(!s1.ok, "eine Rechnung kann nicht gestellt werden")
p(/Ein Drittes gibt es nicht/.test(s1.grund), "mit dem Grund als Satz, nicht als Fehlercode")
p(/Entwürfe bleiben möglich/.test(s1.grund), "und der Entwurf bleibt ausdruecklich erlaubt")

/* ══ R2 · Pflichtangaben ══ */
console.log("\nR2 · Pflichtangaben nach § 14 UStG")
const pflicht = R.pflichtangaben()
p(pflicht.length === 3, `${pflicht.length} Angaben geprueft`)
p(pflicht.every((a) => a.woher.length > 0), "jede sagt, WOHER sie kommt — keine haengt in der Luft")
p(pflicht.some((a) => !a.vorhanden), "mindestens eine fehlt heute", pflicht.filter((a) => !a.vorhanden).map((a) => a.key).join(", "))

/* ══ R3–R6 · Der Zahlungsstand faellt aus den Eingaengen ══ */
console.log("\nR3–R6 · Gestellt ist nicht bezahlt")
const echt = { art: "regelbesteuert", satz: 19, hinweis: "…", entschieden: true }
const gestellt = (zahlungen = []) => entwurf({
  zustand: "gestellt", nummer: "2026-0001", gestelltAm: "2026-09-01",
  steuerSnapshot: echt, zahlungen,
})
const brutto = R.summe(POS, echt).bruttoCent
p(brutto === Math.round((390000 + 3 * 95000) * 1.19), "Brutto korrekt gerechnet", R.euro(brutto))

let l = R.zahlungslage(gestellt())
p(l.stand === "offen", "R3 gestellt ohne Eingang: offen — nicht bezahlt")
p(/niemand nachgesehen/.test(l.grund), "R4 und der Satz sagt: unbekannt ist nicht null", l.grund.slice(0, 52))

l = R.zahlungslage(gestellt([{ id: "z1", betragCent: 100000, wertstellung: "2026-09-05", beleg: "ABNAHME Kontoauszug 12/3" }]))
p(l.stand === "teilweise" && l.offenCent === brutto - 100000, "R5 Teilzahlung bleibt teilweise", `offen ${R.euro(l.offenCent)}`)

l = R.zahlungslage(gestellt([{ id: "z1", betragCent: brutto + 5000, wertstellung: "2026-09-05", beleg: "ABNAHME Kontoauszug 12/4" }]))
p(l.stand === "ueberzahlt", "R6 Ueberzahlung ist ein eigener Zustand")
p(/keine Rundung/.test(l.grund), "und wird nicht als bezahlt verbucht")

l = R.zahlungslage(gestellt([{ id: "z1", betragCent: brutto, wertstellung: "2026-09-05", beleg: "ABNAHME Kontoauszug 12/5" }]))
p(l.stand === "bezahlt", "vollstaendiger Eingang: bezahlt")
p(R.zahlungslage(entwurf()).stand === "offen", "ein Entwurf ist nie faellig")

/* ══ R7 · Cent, keine Kommazahl ══ */
console.log("\nR7 · Geld rechnet in Cent")
const cent = R.summe([{ label: "a", menge: 3, einzelpreisCent: 10 }], { satz: 19 })
p(Number.isInteger(cent.nettoCent) && Number.isInteger(cent.steuerCent) && Number.isInteger(cent.bruttoCent),
  "jede Zwischensumme ist eine ganze Zahl", `${cent.nettoCent}/${cent.steuerCent}/${cent.bruttoCent}`)
p(R.euro(390000) === "3900,00 €", "und die Anzeige rundet nicht falsch", R.euro(390000))

/* ══ R8–R12 · Das Schema haelt auch ohne die Oberflaeche ══ */
console.log("\nR8–R12 · Die CHECKs im Schema")
const org = randomUUID(), opp = randomUUID(), off = randomUUID()
await c.query(`INSERT INTO organisations (id,name,lifecycle,created_at,updated_at)
  VALUES ($1,'ABNAHME Rechnungsbetrieb','kunde',now(),now()) ON CONFLICT (lower(name)) DO NOTHING`, [org])
const orgId = (await sql.query("SELECT id FROM organisations WHERE lower(name)='abnahme rechnungsbetrieb'"))[0].id
await c.query(`INSERT INTO opportunities (id,title,organisation_id,created_at,updated_at)
  VALUES ($1,'ABNAHME Vorgang',$2,now(),now())`, [opp, orgId])
await c.query(`INSERT INTO offers (id,opportunity_id,reference,kind,valid_until,created_at,updated_at)
  VALUES ($1,$2,'ABN-1','website',current_date + 30,now(),now())`, [off, opp])

const neu = async (felder) => {
  const id = `abnahme-${randomUUID()}`
  await c.query(
    `INSERT INTO invoices (id,opportunity_id,offer_id,number,state,issued_at,tax_snapshot)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, opp, off, felder.number ?? null, felder.state ?? "entwurf", felder.issued_at ?? null,
     felder.tax_snapshot ? JSON.stringify(felder.tax_snapshot) : null])
  return id
}

p(await wirft(() => neu({ state: "gestellt" })),
  "R8 „gestellt“ ohne Nummer, Datum und Steuer-Schnappschuss wird abgelehnt")
p(await wirft(() => neu({ state: "entwurf", number: "2026-0009" })),
  "R9 ein Entwurf mit Nummer wird abgelehnt — sonst reisst eine Luecke")

const echteId = await neu({ state: "gestellt", number: "2026-0100", issued_at: "2026-09-01", tax_snapshot: echt })
p(true, "eine vollstaendige gestellte Rechnung wird angenommen")
p(await wirft(() => neu({ state: "gestellt", number: "2026-0100", issued_at: "2026-09-02", tax_snapshot: echt })),
  "R12 dieselbe Nummer ein zweites Mal wird abgelehnt")
await neu({ state: "entwurf" }); await neu({ state: "entwurf" })
p(true, "zwei Entwuerfe ohne Nummer stoeren einander nicht (partieller Index)")

p(await wirft(() => c.query(
  `INSERT INTO payments (id,invoice_id,amount_cent,value_date,evidence) VALUES ($1,$2,0,current_date,'ABNAHME leer')`,
  [randomUUID(), echteId])), "R10 ein Eingang ueber 0 wird abgelehnt")
p(await wirft(() => c.query(
  `INSERT INTO payments (id,invoice_id,amount_cent,value_date,evidence) VALUES ($1,$2,5000,current_date,NULL)`,
  [randomUUID(), echteId])), "R11 ein Eingang ohne Beleg wird abgelehnt — Fundstellenpflicht wie in G11/G13")

/* ══ R13–R14 · Storno statt Aenderung ══ */
console.log("\nR13–R14 · Eine gestellte Rechnung wird nicht geaendert")
p(!R.stellbarkeit(gestellt()).ok, "R13 sie kann nicht noch einmal gestellt werden")
p(/Storno und neue Rechnung/.test(R.stellbarkeit(gestellt()).grund), "und der Grund nennt den richtigen Weg")
p(R.stornierbar(entwurf()).ok === false, "ein Entwurf wird nicht storniert, sondern geaendert oder verworfen")
const st = R.stornierbar(gestellt([{ id: "z", betragCent: 50000, wertstellung: "2026-09-05", beleg: "ABNAHME K 9" }]))
p(st.ok && /Rückzahlung ist ein eigener Vorgang/.test(st.grund),
  "R14 Storno mit Geldeingang warnt — der Storno hebt die Forderung auf, nicht den Eingang")

/* ══ R15 · Der Steuer-Schnappschuss friert ein ══ */
console.log("\nR15 · Was raus ist, rechnet sich nicht neu")
const vorher = { ...S.imprintDetails }
S.imprintDetails.smallBusiness = true
p(R.steuerlage().art === "kleinunternehmer", "mit gesetztem Kleinunternehmer-Status greift § 19")
const alt = gestellt()
p(R.zahlungslage(alt).bruttoCent === brutto,
  "eine bereits gestellte Rechnung bleibt bei ihrem Schnappschuss", R.euro(R.zahlungslage(alt).bruttoCent))
p(R.stellbarkeit(entwurf()).ok, "und ein NEUER Entwurf waere jetzt stellbar — die Sperre ist keine Blockade")
S.imprintDetails.smallBusiness = vorher.smallBusiness

/* ══ R16 · Ueberfaellig wird angezeigt, nicht gemahnt ══ */
console.log("\nR16 · Ueberfaellig ist eine Anzeige")
/* gestellt am 01.09., Ziel 14 Tage -> faellig 15.09.; am 01.10. sind das 16 Tage. */
p(R.faelligAm(gestellt()) === "2026-09-15", "das Faelligkeitsdatum wird gerechnet, nicht eingetragen", R.faelligAm(gestellt()))
const f = R.faelligkeit(gestellt(), new Date("2026-10-01"))
p(f.ueberfaellig && f.tage === 16, "und die Ueberfaelligkeit ebenso", `${f.tage} Tage`)
p(/entscheiden Sie/.test(f.satz), "und die Ansprache bleibt beim Menschen")
p(!R.faelligkeit(gestellt([{ id: "z", betragCent: brutto, wertstellung: "2026-09-05", beleg: "ABNAHME K" }]), new Date("2026-10-01")).ueberfaellig,
  "was eingegangen ist, ist nicht ueberfaellig")
p(R.NIEMALS_AUTOMATISCH.length === 4, "vier Dinge passieren auch dann nicht automatisch")

/* ══ R17–R18 · Was es nicht gibt ══ */
console.log("\nR17–R18 · Was es bewusst nicht gibt")
p(await wirft(() => c.query("DELETE FROM offers WHERE id=$1", [off])),
  "R17 ein Angebot, aus dem eine Rechnung wurde, laesst sich nicht loeschen")
const spalten = (await sql.query(
  `SELECT column_name FROM information_schema.columns
    WHERE table_name='invoices' AND (column_name ILIKE '%paid%' OR column_name ILIKE '%bezahlt%')`))
p(spalten.length === 0, "R18 es gibt keine Spalte `bezahlt` — der Stand faellt aus den Eingaengen")

const chancen = Number((await sql.query("SELECT count(*) n FROM opportunities WHERE title LIKE 'ABNAHME%'"))[0].n)
p(chancen === 1, "und eine Rechnung erzeugt keine zweite Verkaufschance")

console.log(`\n  ${fehler === 0 ? "Eine Rechnung ist keine Zahlung." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
await c.end()
process.exit(fehler === 0 ? 0 : 1)
