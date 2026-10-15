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
import { randomUUID } from "node:crypto"
import { oeffneDrillDb } from "./lib/drill-db.mjs"

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }
const wirft = async (fn) => { try { await fn(); return false } catch { return true } }

const { query, close, backend } = await oeffneDrillDb({ envVar: "RECHNUNG_DRILL_URL", zweck: "Rechnungs-Probelauf" })
console.log(`  (Backend: ${backend})`)
const c = { query }
const sql = { query }

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

/*
 * ══ R1 · Der Steuerstatus sperrt das Stellen, nicht das Arbeiten ══
 *
 * Der Inhaber hat die G04-Schuld am 15.10.2026 beglichen: § 19 UStG,
 * `smallBusiness = true`, `taxStatusPending = false` (Finanz-Abschluss,
 * siehe `lib/rechnung.ts`). Dieser Probelauf hatte bis dahin die offene
 * Ausgangslage als IST-Zustand gemessen — das war wahr, bis der Inhaber
 * entschied. Jetzt misst er zuerst den realen, entschiedenen Zustand und
 * simuliert danach testweise den offenen (dieselbe Mutier-und-
 * Wiederherstell-Technik wie in R15), damit die Sperre weiterhin gegen
 * BEIDE Zustaende gemessen bleibt, nicht nur behauptet wird.
 */
console.log("\nR1 · Entschiedener Steuerstatus")
p(S.imprintDetails.taxStatusPending === false, "Ausgangslage: taxStatusPending steht auf false (§ 19, vom Inhaber bestaetigt 15.10.2026)")
p(R.steuerlage().entschieden, "die Steuerlage ist damit entschieden")
p(R.steuerlage().art === "kleinunternehmer" && R.steuerlage().hinweis !== null,
  "und der § 19-Hinweis steht auf der Rechnung")

const r1Vorher = S.imprintDetails.taxStatusPending
S.imprintDetails.taxStatusPending = true
p(!R.steuerlage().entschieden, "simuliert offen: die Steuerlage ist dann nicht entschieden")
p(R.steuerlage().art === "offen" && R.steuerlage().hinweis === null,
  "und es wird kein Satz erfunden, der auf der Rechnung stuende")
const s1 = R.stellbarkeit(entwurf())
p(!s1.ok, "eine Rechnung kann dann nicht gestellt werden")
p(/Ein Drittes gibt es nicht/.test(s1.grund), "mit dem Grund als Satz, nicht als Fehlercode")
p(/Entwürfe bleiben möglich/.test(s1.grund), "und der Entwurf bleibt ausdruecklich erlaubt")
S.imprintDetails.taxStatusPending = r1Vorher

/* ══ R2 · Pflichtangaben ══ */
console.log("\nR2 · Pflichtangaben nach § 14 UStG")
const pflicht = R.pflichtangaben()
p(pflicht.length === 3, `${pflicht.length} Angaben geprueft`)
p(pflicht.every((a) => a.woher.length > 0), "jede sagt, WOHER sie kommt — keine haengt in der Luft")
p(pflicht.every((a) => a.vorhanden), "heute liegen alle drei vor — Rechtsform, § 19-Status und MStV-Verantwortlicher sind entschieden")

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
const vorherLage = R.steuerlage()

/*
 * DIESER ABSCHNITT HAT BIS ZUM G18-LAUF EINEN DEFEKT FESTGESCHRIEBEN.
 *
 * Er setzte `smallBusiness = true` und LIESS `taxStatusPending` auf `true`
 * stehen — und verlangte dann, die Rechnung sei stellbar. Damit hat der
 * Probelauf genau den Zustand als richtig abgenommen, den das Haus selbst
 * ausschliesst: entschieden und gleichzeitig nicht freigegeben. Ein
 * Probelauf, der einen unmoeglichen Zustand gruen faerbt, prueft nichts —
 * er verteidigt den Fehler.
 *
 * Seit dem 15.10.2026 ist `taxStatusPending` real `false` (Finanz-
 * Abschluss). Dieser Block geht testweise zurueck zum unentschiedenen
 * Zustand und wieder vor, damit die Sperre weiterhin gegen jeden
 * Zwischenzustand gemessen bleibt — und stellt am Ende die reale Lage
 * wieder her, statt einen fest verdrahteten "offen"-Zustand zu erwarten.
 */
S.imprintDetails.smallBusiness = true
S.imprintDetails.taxStatusPending = true
p(!R.steuerlage().entschieden, "gesetzter Kleinunternehmer-Status allein entscheidet nichts, solange pending steht")
p(!R.stellbarkeit(entwurf()).ok, "und eine Rechnung bleibt gesperrt — die Freigabe ist kein Schmuck")

S.imprintDetails.taxStatusPending = false
p(R.steuerlage().art === "kleinunternehmer", "mit Freigabe UND gesetztem Status greift § 19")
p(R.steuerlage().widerspruch === null, "und es steht kein Widerspruch im Weg")
const alt = gestellt()
p(R.zahlungslage(alt).bruttoCent === brutto,
  "eine bereits gestellte Rechnung bleibt bei ihrem Schnappschuss", R.euro(R.zahlungslage(alt).bruttoCent))
p(R.stellbarkeit(entwurf()).ok, "und ein NEUER Entwurf waere jetzt stellbar — die Sperre ist keine Blockade")

/* Beides nebeneinander — der Fall, den `imprintDetails` ausdruecklich ausschliesst. */
S.imprintDetails.vatId = "DE000000000"
p(!R.steuerlage().entschieden, "USt-IdNr. UND Kleinunternehmer nebeneinander entscheiden nichts")
p(R.steuerlage().art === "offen" && R.steuerlage().hinweis === null,
  "es wird kein Hinweis erfunden, der auf der Rechnung stuende")
p(R.steuerlage().widerspruch !== null, "der Widerspruch wird benannt, nicht stillschweigend aufgeloest")
p(/eine USt-IdNr\. und der Kleinunternehmer-Status/.test(R.stellbarkeit(entwurf()).grund),
  "und die Sperre sagt WAS zu tun ist, statt „nicht entschieden“ zu melden")

S.imprintDetails.smallBusiness = vorher.smallBusiness
S.imprintDetails.vatId = vorher.vatId
S.imprintDetails.taxStatusPending = vorher.taxStatusPending
p(R.steuerlage().art === vorherLage.art && R.steuerlage().widerspruch === vorherLage.widerspruch,
  "und der Ausgangszustand steht danach wieder", R.steuerlage().art)

/* ══ R16 · Ueberfaellig wird angezeigt, nicht gemahnt ══ */
console.log("\nR16 · Ueberfaellig ist eine Anzeige")
/* gestellt am 01.09., Ziel 14 Tage -> faellig 15.09.; am 01.10. sind das 16 Tage. */
p(R.faelligAm(gestellt()) === "2026-09-15", "das Faelligkeitsdatum wird gerechnet, nicht eingetragen", R.faelligAm(gestellt()))
const f = R.faelligkeit(gestellt(), new Date("2026-10-01"))
p(f.ueberfaellig && f.tage === 16, "und die Ueberfaelligkeit ebenso", `${f.tage} Tage`)
p(/entscheiden Sie/.test(f.satz), "und die Ansprache bleibt beim Menschen")
p(!R.faelligkeit(gestellt([{ id: "z", betragCent: brutto, wertstellung: "2026-09-05", beleg: "ABNAHME K" }]), new Date("2026-10-01")).ueberfaellig,
  "was eingegangen ist, ist nicht ueberfaellig")
p(R.NIEMALS_AUTOMATISCH.length === 5, "fuenf Dinge passieren auch dann nicht automatisch")

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
await close()
process.exit(fehler === 0 ? 0 : 1)
