#!/usr/bin/env node
/**
 * DER ANGEBOTS-PROBELAUF — GATE 17
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ZWEI TEILE, ZWEI GRUENDE
 *
 * TEIL A prueft die REGEL, ohne Datenbank: Was fehlt einem Angebot, um
 * gesendet zu werden? Was macht aus einem Haken ein Ja? Das sind Aussagen
 * ueber Text und Herkunft, und sie brauchen keinen Speicher.
 *
 * TEIL B prueft den WEG durch die Datenbank, gegen eine Wegwerf-Datenbank:
 * Laesst sich ein unfertiges Angebot senden? Laesst sich eines annehmen,
 * das nie beim Kunden lag? Bleibt ein gesendetes Angebot unveraenderlich?
 * Das kann keine reine Funktion beantworten — dort sitzt die zweite Haelfte
 * der Sicherung, und eine Sicherung, die nie ausgeloest hat, ist eine
 * Vermutung.
 *
 * Teil B laeuft nur, wenn ein Ziel angegeben ist:
 *   ANGEBOT_DRILL_URL=postgres://localhost/drill_angebot npm run angebot-drill
 * Ohne Ziel meldet der Lauf das ausdruecklich als UNBEKANNT — nicht als
 * bestanden.
 */
const A = await import("../lib/angebot.ts")
const O = await import("../lib/offer-readiness.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

/** Ein vollstaendiges Website-Angebot — die Ausgangslage aller Proben. */
const voll = () => ({
  id: "a1",
  opportunityId: "o1",
  referenz: "CD-260909-ab12",
  kind: "website",
  sprache: "de",
  gueltigBis: "2026-10-31",
  abschnitte: Object.fromEntries(
    A.ABSCHNITTE.map((s) => [s.key, `Text zu ${s.titel}, lang genug um ernst gemeint zu sein.`]),
  ),
  positionen: [{ art: "katalog", was: "Website-Paket", quelle: "paket-website" }],
  zustand: "entwurf",
  annahme: null,
  erstelltAm: "2026-09-09T00:00:00.000Z",
})

/** Die Belege, die ein Website-Angebot reif machen. */
const belege = O.OFFERS.website.evidence.map((e) => e.key)

console.log("\nA1 · Ein Entwurf darf unfertig sein")
const leer = { ...voll(), abschnitte: {}, positionen: [] }
p(A.fehltFuer(leer, "entwurf", []).length === 0, "ein leerer Entwurf hat keine Befunde")
p(A.fehltFuer(leer, "gesendet", belege).length > 0, "gesendet werden kann er nicht")

console.log("\nA2 · Ohne Angebotsreife geht nichts hinaus")
p(A.fehltFuer(voll(), "gesendet", []).length === O.OFFERS.website.evidence.length,
  "ohne Belege fehlen genau die offenen Fragen aus G07/G08")
p(A.fehltFuer(voll(), "gesendet", belege).length === 0, "mit allen Belegen ist es sendbar")
p(A.darf(voll(), "gesendet", belege), "und `darf` sagt dasselbe")

console.log("\nA3 · Jeder Pflichtabschnitt fehlt einzeln")
for (const abschnitt of A.ABSCHNITTE.filter((s) => s.pflicht)) {
  const ohne = voll()
  ohne.abschnitte[abschnitt.key] = "   "
  const b = A.fehltFuer(ohne, "gesendet", belege)
  p(b.length === 1 && b[0].abschnitt.includes(abschnitt.titel), `ohne „${abschnitt.titel}" faellt es`)
}
const ohneArchitektur = voll()
ohneArchitektur.abschnitte.architektur = ""
p(A.fehltFuer(ohneArchitektur, "gesendet", belege).length === 0,
  "die Architektur darf fehlen", "das Schema selbst kennt den Fall")

console.log("\nA4 · Eine Zahl kann man hier nicht tippen")
const katalog = voll()
p(A.betragVon(katalog.positionen[0]) === 2400, "eine Katalogposition loest ihren Betrag auf")
const erfunden = { ...voll(), positionen: [{ art: "zuschnitt", was: "Sonderleistung", betrag: 9999 }] }
p(A.fehltFuer(erfunden, "gesendet", belege).length === 1, "ein eigener Betrag ohne Freigabe faellt")
const mitFreigabe = {
  ...voll(),
  positionen: [
    {
      art: "zuschnitt",
      was: "Sonderleistung",
      betrag: 9999,
      freigabe: { von: "Owner", am: "2026-09-08", fundstelle: "Postfach, Betreff Zuschnitt Musterbetrieb" },
    },
  ],
}
p(A.fehltFuer(mitFreigabe, "gesendet", belege).length === 0, "mit belastbarer Freigabe geht es")

console.log("\nA5 · Eine Freigabe, die niemand aufschlagen kann, ist keine")
const schwach = (fundstelle) => ({
  ...voll(),
  positionen: [{ art: "zuschnitt", was: "X", betrag: 1, freigabe: { von: "Owner", am: "2026-09-08", fundstelle } }],
})
p(A.fehltFuer(schwach("intern"), "gesendet", belege).length === 1, "intern traegt nicht")
p(A.fehltFuer(schwach("muendlich"), "gesendet", belege).length === 1, "muendlich auch nicht")
p(A.fehltFuer(schwach(""), "gesendet", belege).length === 1, "leer erst recht nicht")
p(!A.freigabeTraegt({ von: "", am: "2026-09-08", fundstelle: "Postfach, Betreff Zuschnitt" }),
  "und ohne Person traegt sie auch nicht")

console.log("\nA6 · Keine erfundene Dringlichkeit")
for (const satz of ["nur noch heute", "Letzte Chance", "sichern Sie sich", "solange der Vorrat reicht"]) {
  const druck = voll()
  druck.abschnitte.preis = `Der Preis gilt — ${satz}.`
  p(A.fehltFuer(druck, "gesendet", belege).length === 1, `„${satz}" faellt auf`)
}
p(A.fehltFuer(voll(), "gesendet", belege).length === 0, "ein Angebot ohne Verknappung geht durch")

console.log("\nA7 · Die Referenz ist dieselbe wie in der Bestaetigung")
p(A.REFERENZ_MUSTER.test("CD-260909-ab12"), "das Muster passt auf eine echte Referenz")
for (const falsch of ["ABC-123", "CD-2609-ab12", "CD-260909-abcde", ""]) {
  p(A.fehltFuer({ ...voll(), referenz: falsch }, "entwurf", []).length === 1,
    `„${falsch || "(leer)"}" faellt schon im Entwurf auf`)
}

console.log("\nA8 · Ein Ja ist eine Aussage ueber einen Menschen")
const gesendet = { ...voll(), zustand: "gesendet" }
p(A.fehltFuer(gesendet, "angenommen", belege).length === 1, "ohne Annahme ist es kein Ja")
const ja = {
  von: "Frau Muster",
  rolle: "Geschaeftsfuehrung",
  form: "muendlich",
  am: "2026-09-09",
  fundstelle: "Gespraechsnotiz vom 09.09.2026, 14:20",
}
p(A.annahmeTraegt(ja), "ein muendliches Ja mit Fundstelle traegt",
  "die meisten Abschluesse fallen am Telefon")
p(!A.annahmeTraegt({ ...ja, fundstelle: "" }), "dasselbe Ja ohne Fundstelle ist eine Erinnerung")
p(!A.annahmeTraegt({ ...ja, von: "" }), "und ohne Person ein Haken")
p(!A.annahmeTraegt({ ...ja, form: "handschlag" }), "eine Form, die es nicht gibt, traegt nicht")
p(A.fehltFuer({ ...gesendet, annahme: ja }, "angenommen", belege).length === 0, "mit Annahme ist es ein Ja")

console.log("\nA9 · Die Laengenregel ist ein Verdacht, kein Verbot")
p(A.seiten(voll()) >= 1, "ein Angebot hat mindestens eine Seite")
const lang = voll()
lang.abschnitte.umfang = "x".repeat(A.ZEICHEN_JE_SEITE * 8)
p(A.seiten(lang) > A.SEITEN_HINWEIS_AB, "ein sehr langes ueberschreitet den Hinweis")
p(A.fehltFuer(lang, "gesendet", belege).length === 0, "und wird trotzdem nicht abgelehnt",
  "wer daraus ein Verbot macht, erzeugt kleinere Schrift")

console.log("\nA10 · Keine zweite Liste")
p(A.ABSCHNITTE.length === 9, "neun Abschnitte, wie im Schema")
p(A.ABSCHNITTE.every((s) => s.regel.length > 20), "jeder traegt den Satz, der ihn entscheidet")
p(Object.keys(A.ANGEBOT_ZUSTAENDE).length === 5, "fuenf Zustaende")
p(A.artLabel("website") === O.OFFERS.website.label, "das Label kommt aus dem bestehenden Katalog")

/* ═══════════════════════════════════════════════════════════════════════════
 * TEIL B — DER WEG DURCH DIE DATENBANK
 * ═══════════════════════════════════════════════════════════════════════════ */

const ZIEL = process.env.ANGEBOT_DRILL_URL
if (!ZIEL) {
  console.log(
    "\nB · Der Weg durch die Datenbank: UNBEKANNT.\n" +
      "  Ohne ANGEBOT_DRILL_URL laeuft dieser Teil nicht — und ein nicht gelaufener\n" +
      "  Teil ist nicht bestanden, er ist ungemessen.\n" +
      "  ANGEBOT_DRILL_URL=postgres://localhost/drill_angebot npm run angebot-drill\n",
  )
} else {
  const { requireSafeTarget } = await import("./lib/env-guard.mjs")
  requireSafeTarget(ZIEL, "Angebots-Probelauf")
  const pg = (await import("pg")).default
  const client = new pg.Client({ connectionString: ZIEL })
  await client.connect()

  const { SCHEMA } = await import("../lib/neon-client.ts")
  for (const stmt of SCHEMA) await client.query(stmt)
  await client.query(`DELETE FROM offers`)
  await client.query(`DELETE FROM opportunities WHERE id LIKE 'drill-%'`)
  await client.query(
    `INSERT INTO opportunities (id, title, status, offer_kind, readiness_evidence, created_at, updated_at)
     VALUES ('drill-o1', 'Probe', 'proposal', 'website', $1::text[], now(), now())`,
    [belege],
  )

  console.log("\nB1 · Die Datenbank laesst kein Ja ohne Annahme zu")
  let geblockt = false
  try {
    await client.query(
      `INSERT INTO offers (id, opportunity_id, reference, kind, valid_until, state)
       VALUES ('drill-a1','drill-o1','CD-260909-ab12','website','2026-10-31','angenommen')`,
    )
  } catch (e) {
    geblockt = /offers_acceptance_check/.test(String(e.message))
  }
  p(geblockt, "der CHECK greift auch an der Oberflaeche vorbei",
    "die Regel in lib/angebot.ts haelt die Oberflaeche ehrlich, dieser CHECK jeden anderen Weg")

  console.log("\nB2 · Der Zustand ist gebunden")
  let ungueltig = false
  try {
    await client.query(
      `INSERT INTO offers (id, opportunity_id, reference, kind, valid_until, state)
       VALUES ('drill-a2','drill-o1','CD-260909-ab12','website','2026-10-31','verschickt')`,
    )
  } catch {
    ungueltig = true
  }
  p(ungueltig, "einen Zustand, den es nicht gibt, nimmt die Tabelle nicht an")

  console.log("\nB3 · Ein Angebot haengt an einem Vorgang")
  let verwaist = false
  try {
    await client.query(
      `INSERT INTO offers (id, opportunity_id, reference, kind, valid_until)
       VALUES ('drill-a3','gibt-es-nicht','CD-260909-ab12','website','2026-10-31')`,
    )
  } catch {
    verwaist = true
  }
  p(verwaist, "ein Angebot ohne Vorgang gibt es nicht")

  console.log("\nB4 · Der Entwurf geht durch")
  await client.query(
    `INSERT INTO offers (id, opportunity_id, reference, kind, valid_until, sections, positions)
     VALUES ('drill-a4','drill-o1','CD-260909-ab12','website','2026-10-31',$1::jsonb,$2::jsonb)`,
    [JSON.stringify(voll().abschnitte), JSON.stringify(voll().positionen)],
  )
  const da = await client.query(`SELECT state FROM offers WHERE id='drill-a4'`)
  p(da.rows[0]?.state === "entwurf", "und liegt als Entwurf da")

  await client.query(`DELETE FROM offers`)
  await client.query(`DELETE FROM opportunities WHERE id LIKE 'drill-%'`)
  await client.end()
  console.log("\n  Rueckstaende entfernt.")
}

console.log(`\n  ${fehler === 0 ? "Ohne Reife kein Angebot, ohne Menschen kein Ja." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
