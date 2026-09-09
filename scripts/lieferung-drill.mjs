#!/usr/bin/env node
/**
 * DER LIEFERUNGS-PROBELAUF — GATE 19
 *
 * Prueft die Faelle, in denen eine Lieferung still unverbindlich wird: ein
 * Termin ohne Material, eine Aenderung ohne Zustimmung, eine Abnahme ohne
 * Menschen, eine Uebergabe, die weniger enthaelt als die Seite verspricht.
 *
 * Teil B faehrt gegen eine Wegwerf-Datenbank und prueft, was keine reine
 * Funktion beantworten kann: ob ein Projekt ohne angenommenes Angebot
 * entsteht und ob die Tabelle dieselbe Aussage traegt wie der Code.
 *
 *   ANGEBOT_DRILL_URL=postgres://localhost/drill_lieferung npm run lieferung-drill
 */
const L = await import("../lib/lieferung.ts")
const D = await import("../lib/dictionary.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

const ja = (extra = {}) => ({
  von: "Frau Muster",
  rolle: "Geschaeftsfuehrung",
  form: "e-mail",
  am: "2026-10-05",
  fundstelle: "Postfach, Betreff Abnahme Musterbetrieb",
  ...extra,
})

const projekt = (extra = {}) => ({
  id: "p1",
  opportunityId: "o1",
  offerId: "a1",
  materialEingang: null,
  aenderungen: [],
  abnahme: null,
  uebergabe: {},
  zustand: "aufgesetzt",
  erstelltAm: "2026-09-09T00:00:00.000Z",
  ...extra,
})

const vollUebergeben = Object.fromEntries(
  L.UEBERGABE_STUECKE.map((s) => [s.key, { am: "2026-10-06", wie: "an den Kunden uebertragen" }]),
)

console.log("\nL1 · Ohne Material laeuft keine Frist")
p(L.livetermin(null) === null, "kein Materialeingang, kein Termin",
  "„vier Wochen ab Materialeingang“ — nicht ab Unterschrift")
p(L.livetermin("") === null, "leer ebenso")
p(L.livetermin("bald") === null, "und ein Wort ist kein Datum")
p(L.livetermin("2026-09-09") === "2026-10-07", `${L.FRIST_TAGE} Tage ab Materialeingang`)
p(L.livetermin("2026-02-15") === "2026-03-15", "auch ueber einen Monatswechsel")

console.log("\nL2 · Der Termin wird gerechnet, nicht eingetragen")
p(!("livetermin" in L.PROJEKT_ZUSTAENDE), "es gibt kein Feld dafuer")
p(typeof L.livetermin === "function", "sondern eine Funktion",
  "ein eingetragenes Datum waere eine zweite Wahrheit gegen die oeffentliche Zusage")

console.log("\nL3 · Eine Aenderung ohne Ja aendert nichts")
const wunsch = { id: "c1", was: "Zweite Sprache", verlangtVon: "Kunde", wirkung: "beides", tage: 7, zugestimmt: null }
p(!L.wirktBereits(wunsch), "ohne Zustimmung wirkt sie nicht")
p(L.terminMitAenderungen("2026-09-09", [wunsch]) === "2026-10-07", "und verschiebt den Termin nicht")
const beschlossen = { ...wunsch, zugestimmt: ja() }
p(L.wirktBereits(beschlossen), "mit Zustimmung wirkt sie")
p(L.terminMitAenderungen("2026-09-09", [beschlossen]) === "2026-10-14", "und verschiebt ihn um sieben Tage")

console.log("\nL4 · Eine Zustimmung zu einer unbekannten Zahl ist keine")
const unbeziffert = { ...wunsch, tage: null, zugestimmt: ja() }
p(!L.wirktBereits(unbeziffert), "eine zugestimmte Aenderung ohne Tage wirkt nicht")
p(L.fehltFuerZustand(projekt({ materialEingang: "2026-09-09", aenderungen: [unbeziffert] }), "laeuft").length === 1,
  "und sie faellt als Mangel auf")

console.log("\nL5 · Eine Aenderung am Umfang verschiebt nicht automatisch den Termin")
const nurUmfang = { ...wunsch, wirkung: "umfang", zugestimmt: ja() }
p(L.terminMitAenderungen("2026-09-09", [nurUmfang]) === "2026-10-07",
  "wer nur den Umfang aendert, aendert nicht die Zeit",
  "sonst waere jede Umfangsfrage automatisch eine Fristverlaengerung")

console.log("\nL6 · Ohne angenommenes Angebot kein Projekt")
p(L.fehltFuerZustand(projekt({ offerId: "" }), "aufgesetzt").length === 1, "kein Angebot, kein Projekt")
p(L.fehltFuerZustand(projekt(), "aufgesetzt").length === 0, "mit Angebot geht es")

console.log("\nL7 · Eine Lieferung ohne Abnahme ist keine")
const laeuft = projekt({ materialEingang: "2026-09-09", zustand: "laeuft" })
p(L.fehltFuerZustand(laeuft, "abgenommen").length === 1, "ohne Abnahme kein „abgenommen“")
p(L.fehltFuerZustand({ ...laeuft, abnahme: ja() }, "abgenommen").length === 0, "mit belastbarer Abnahme schon")
p(L.fehltFuerZustand({ ...laeuft, abnahme: ja({ fundstelle: "" }) }, "abgenommen").length === 1,
  "ein Ja ohne Fundstelle ist eine Erinnerung")
p(L.fehltFuerZustand({ ...laeuft, abnahme: ja({ von: "" }) }, "abgenommen").length === 1,
  "und ohne Person ein Haken")

console.log("\nL8 · Die Uebergabe enthaelt, was die Seite verspricht")
const abgenommen = { ...laeuft, abnahme: ja(), zustand: "abgenommen" }
p(L.fehltFuerZustand(abgenommen, "uebergeben").length === L.UEBERGABE_STUECKE.length,
  `ohne Uebergabe fehlen alle ${L.UEBERGABE_STUECKE.length} Stuecke`)
for (const stueck of L.UEBERGABE_STUECKE) {
  const ohne = { ...abgenommen, uebergabe: { ...vollUebergeben } }
  delete ohne.uebergabe[stueck.key]
  p(L.fehltFuerZustand(ohne, "uebergeben").length === 1, `ohne ${stueck.label} ist sie unvollstaendig`)
}
p(L.fehltFuerZustand({ ...abgenommen, uebergabe: vollUebergeben }, "uebergeben").length === 0,
  "mit allen vier ist sie vollstaendig")
const ohneWeg = { ...abgenommen, uebergabe: { ...vollUebergeben, domain: { am: "2026-10-06", wie: "ok" } } }
p(L.fehltFuerZustand(ohneWeg, "uebergeben").length === 1,
  "ein Stueck ohne Weg zaehlt nicht", "„ok“ sagt nicht, wie es uebergeben wurde")

console.log("\nL9 · Die vier Stuecke stehen so auf der oeffentlichen Seite")
const faq = JSON.stringify(D.dictionary.de.faq)
for (const stueck of L.UEBERGABE_STUECKE) {
  p(new RegExp(stueck.label, "i").test(faq), `„${stueck.label}“ ist oeffentlich versprochen`)
}
p(L.UEBERGABE_STUECKE.length === 4, "vier Stuecke, wie im Satz")

console.log("\nL10 · Die Beleg-Schleife zurueck nach G13")
p(!L.belegMoment(laeuft), "vor der Abnahme ist nicht der Moment")
p(L.belegMoment(abgenommen), "mit der Abnahme schon",
  "der Kunde hat gerade bestaetigt, dass es funktioniert")
p(/KEINE Freigabe/.test(L.BELEG_FRAGE), "und der Satz sagt ausdruecklich, dass daraus keine Freigabe folgt")
p(!Object.keys(L).includes("erzeugeFreigabe"), "es gibt keine Funktion, die eine Freigabe ableitet")

/* ═══ TEIL B — DIE DATENBANK ═════════════════════════════════════════════ */

const ZIEL = process.env.ANGEBOT_DRILL_URL
if (!ZIEL) {
  console.log(
    "\nB · Der Weg durch die Datenbank: UNBEKANNT.\n" +
      "  Ein nicht gelaufener Teil ist nicht bestanden, er ist ungemessen.\n" +
      "  ANGEBOT_DRILL_URL=postgres://localhost/drill_lieferung npm run lieferung-drill\n",
  )
} else {
  const { requireSafeTarget } = await import("./lib/env-guard.mjs")
  requireSafeTarget(ZIEL, "Lieferungs-Probelauf")
  const pg = (await import("pg")).default
  const client = new pg.Client({ connectionString: ZIEL })
  await client.connect()
  const { SCHEMA } = await import("../lib/neon-client.ts")
  for (const stmt of SCHEMA) await client.query(stmt)
  await client.query(`DELETE FROM projects`)
  await client.query(`DELETE FROM offers`)
  await client.query(`DELETE FROM opportunities WHERE id LIKE 'drill-%'`)
  await client.query(
    `INSERT INTO opportunities (id, title, status, created_at, updated_at)
     VALUES ('drill-o1','Probe','won',now(),now())`)
  await client.query(
    `INSERT INTO offers (id, opportunity_id, reference, kind, valid_until, state)
     VALUES ('drill-gesendet','drill-o1','CD-260909-ab12','website','2026-10-31','gesendet')`)
  await client.query(
    `INSERT INTO offers (id, opportunity_id, reference, kind, valid_until, state, acceptance)
     VALUES ('drill-ja','drill-o1','CD-260909-ab12','website','2026-10-31','angenommen','{"von":"Probe"}'::jsonb)`)

  console.log("\nB1 · Die Tabelle laesst keine Abnahme ohne Menschen zu")
  let geblockt = false
  try {
    await client.query(
      `INSERT INTO projects (id, opportunity_id, offer_id, material_received, state)
       VALUES ('drill-p1','drill-o1','drill-ja','2026-09-09','abgenommen')`)
  } catch (e) {
    geblockt = /projects_acceptance_check/.test(String(e.message))
  }
  p(geblockt, "„abgenommen“ ohne acceptance wird abgewiesen")

  console.log("\nB2 · Und keine laufende Frist ohne Material")
  let ohneMaterial = false
  try {
    await client.query(
      `INSERT INTO projects (id, opportunity_id, offer_id, state)
       VALUES ('drill-p2','drill-o1','drill-ja','laeuft')`)
  } catch (e) {
    ohneMaterial = /projects_material_check/.test(String(e.message))
  }
  p(ohneMaterial, "„laeuft“ ohne material_received wird abgewiesen")

  console.log("\nB3 · Ein Angebot traegt hoechstens ein Projekt")
  await client.query(
    `INSERT INTO projects (id, opportunity_id, offer_id) VALUES ('drill-p3','drill-o1','drill-ja')`)
  let doppelt = false
  try {
    await client.query(
      `INSERT INTO projects (id, opportunity_id, offer_id) VALUES ('drill-p4','drill-o1','drill-ja')`)
  } catch {
    doppelt = true
  }
  p(doppelt, "ein zweites Projekt zum selben Angebot gibt es nicht")

  console.log("\nB4 · Kein go_live in der Tabelle")
  const spalten = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name='projects'`)
  const namen = spalten.rows.map((r) => r.column_name)
  p(!namen.some((n) => /go_live|live_date|termin/.test(n)),
    "der Termin ist nirgends gespeichert", namen.join(", "))

  await client.query(`DELETE FROM projects`)
  await client.query(`DELETE FROM offers`)
  await client.query(`DELETE FROM opportunities WHERE id LIKE 'drill-%'`)
  await client.end()
  console.log("\n  Rueckstaende entfernt.")
}

console.log(`\n  ${fehler === 0 ? "Ohne Material keine Frist, ohne Abnahme keine Lieferung." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
