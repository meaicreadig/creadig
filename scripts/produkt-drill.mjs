#!/usr/bin/env node
/**
 * DER PRODUKT-PROBELAUF — GATE 24
 *
 * Prueft die Faelle, in denen ein Portfolio still unwahr wird: ein
 * Reifegrad ohne Herkunft, einer der nicht altert, einer der den Daten
 * widerspricht, und ein Produkt, das betrieben wird, ohne dass jemand
 * dafuer antwortet.
 *
 * Braucht keine Datenbank: Alles hier sind Aussagen ueber Angaben.
 */
const P = await import("../lib/produkt.ts")
const S = await import("../lib/site-data.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

const stand = (extra = {}) => ({
  stufe: "pilot",
  bestaetigtVon: "Owner",
  bestaetigtAm: "2026-09-01",
  woran: "laeuft seit Maerz im Glasfaser-Alltag, zwei Monteure, taeglich",
  ...extra,
})
const weg = (extra = {}) => ({ art: "postfach", an: "info@creadig.de, Betreff X", fuer: "beides", ...extra })
const werk = (extra = {}) => ({ slug: "x", name: "X", live: false, ...extra })

console.log("\nP1 · Ein Stand ohne Herkunft ist eine Erinnerung")
p(P.standTraegt(stand()), "mit Stufe, Person, Datum und Woran traegt er")
p(!P.standTraegt(null), "gar keiner traegt nicht")
p(!P.standTraegt(stand({ bestaetigtVon: "" })), "ohne Person nicht")
p(!P.standTraegt(stand({ bestaetigtVon: "   " })), "auch nicht mit Leerzeichen")
p(!P.standTraegt(stand({ bestaetigtAm: "" })), "ohne Datum nicht")
p(!P.standTraegt(stand({ bestaetigtAm: "September" })), "und ein Wort ist kein Datum")
p(!P.standTraegt(stand({ woran: "reif" })), "„reif“ ist kein Woran",
  "gesucht ist ein beobachtbarer Umstand, keine Bewertung")
p(!P.standTraegt(stand({ stufe: "fertig" })), "eine Stufe, die es nicht gibt, traegt nicht")

console.log("\nP2 · Ein Stand altert")
const heute = new Date("2026-09-09T00:00:00Z")
p(!P.veraltet(stand({ bestaetigtAm: "2026-09-01" }), heute), "acht Tage alt: frisch")
p(!P.veraltet(stand({ bestaetigtAm: "2026-04-01" }), heute), "fuenf Monate: haelt noch")
p(P.veraltet(stand({ bestaetigtAm: "2026-01-01" }), heute), `aelter als ${P.STAND_HAELT_MONATE} Monate: veraltet`)
p(P.veraltet(stand({ bestaetigtAm: "2025-06-01" }), heute), "und ein Jahr erst recht")
p(!P.veraltet(null, heute), "ein fehlender Stand ist nicht „veraltet“",
  "er ist etwas anderes, und die Luecke sagt es auch anders")
p(!P.veraltet(stand({ woran: "x" }), heute), "und ein Stand, der gar nicht traegt, altert nicht")

console.log("\nP3 · Jede Stufe sagt auch, was sie NICHT heisst")
for (const [key, r] of Object.entries(P.REIFEGRADE)) {
  p(r.heisstNicht.trim().length > 15, `„${r.label}“ sagt, was sie nicht behauptet`, key)
}
p(P.REIFEGRADE.live.heisstNicht.includes("fertig"), "„live“ heisst ausdruecklich nicht „fertig“")

console.log("\nP4 · Der Widerspruch — die Pruefung, ohne die das Register gefaehrlich waere")
const eintrag = (s) => ({ slug: "x", eigentuemer: "Owner", stand: s, rueckmeldung: weg() })
p(P.widerspruch(werk({ live: false }), eintrag(stand({ stufe: "live" }))) !== null,
  "„live“ bei live=false ist ein Widerspruch")
p(P.widerspruch(werk({ live: true, href: "https://x.example" }), eintrag(stand({ stufe: "in-development" }))) !== null,
  "„in Entwicklung“ bei oeffentlicher Adresse ebenso")
p(P.widerspruch(werk({ live: true, href: "https://x.example" }), eintrag(stand({ stufe: "pilot" }))) === null,
  "ein Pilot darf oeffentlich erreichbar sein", "die Regel ist nur in eine Richtung streng")
p(P.widerspruch(werk({ live: false }), eintrag(null)) === null, "ohne Stand kein Widerspruch")
p(P.widerspruch(werk({ live: false }), eintrag(stand({ woran: "x", stufe: "live" }))) === null,
  "und ein Stand, der nicht traegt, erzeugt keinen",
  "sonst meldete das Gate zweimal dasselbe")

console.log("\nP5 · Ein Rueckmeldeweg ist eine Adresse, kein Wunsch")
p(P.wegTraegt(weg()), "Postfach mit Adresse traegt")
p(!P.wegTraegt(null), "keiner traegt nicht")
p(!P.wegTraegt(weg({ an: "" })), "ohne Adresse nicht")
p(!P.wegTraegt(weg({ an: "ja" })), "und zwei Zeichen sind keine Adresse")
p(!P.wegTraegt(weg({ art: "telepathie" })), "eine Art, die es nicht gibt, traegt nicht")

console.log("\nP6 · Stoerung und Wunsch sind nicht dasselbe")
p(["stoerung", "wunsch", "beides"].includes(weg().fuer), "der Weg sagt, wofuer er ist")
p(P.PORTFOLIO.every((e) => e.rueckmeldung && ["stoerung", "wunsch", "beides"].includes(e.rueckmeldung.fuer)),
  "und jeder Eintrag im Bestand sagt es auch")

console.log("\nP7 · Der reale Bestand — der Zustand, den G24 vorfindet")
p(P.PORTFOLIO.length === S.productWorks.length, `${P.PORTFOLIO.length} Produkte, so viele wie in productWorks`)
p(P.ohneEintrag().length === 0, "kein Produkt ohne Eintrag")
p(P.PORTFOLIO.every((e) => e.eigentuemer.trim().length > 0), "jedes hat einen Eigentuemer")
p(P.PORTFOLIO.every((e) => P.wegTraegt(e.rueckmeldung)), "jedes hat einen Rueckmeldeweg")
p(P.PORTFOLIO.every((e) => e.stand === null), "und keines einen bestaetigten Stand",
  "das ist der Owner-Punkt aus G24, keine Panne")
p(new Set(P.PORTFOLIO.map((e) => e.eigentuemer)).size === 1,
  "alle vier gehoeren derselben Person",
  "der Ist-Zustand des Hauses — und der Ausgangspunkt fuer G33")

console.log("\nP8 · Die Luecken sagen, was fehlt, und nicht wie viel Prozent")
const l = P.portfolioLuecken()
p(l.length === 4, "vier Luecken: je ein fehlender Stand")
p(l.every((x) => x.feld === "Stand"), "und sonst nichts")
p(l.every((x) => x.satz.length > 40), "jede als Satz, nicht als Zahl",
  "eine Quote laedt dazu ein, Haken zu setzen; eine offene Frage dazu, sie zu beantworten")

console.log("\nP9 · Der Reifegrad wird nur an EINER Stelle gefuehrt")
const welten = Object.values(S.productWorlds)
p(welten.every((w) => w.maturity === null), "in productWorlds steht kein Wert mehr",
  "das Feld bleibt, aber leer — zwei Fassungen laufen sonst auseinander")
p(welten.length === P.PORTFOLIO.length, "und es gibt genauso viele Welten wie Eintraege")

console.log(`\n  ${fehler === 0 ? "Kein Etikett ohne Beleg, kein Produkt ohne Antwort." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
