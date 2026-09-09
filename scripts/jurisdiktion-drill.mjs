#!/usr/bin/env node
/**
 * DER JURISDIKTIONS-PROBELAUF — GATE 35
 *
 * Prueft die eine Versuchung eines Internationalisierungs-Moduls: aus einer
 * Luecke eine Entscheidung zu machen — oder, schlimmer, eine Rechtslage zu
 * behaupten, die niemand festgestellt hat.
 */
const J = await import("../lib/jurisdiktion.ts")
const R = await import("../lib/rechnung.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

const klaerung = (extra = {}) => ({
  gilt: "Es gilt deutsches Recht, Gerichtsstand Osnabrueck.",
  festgestelltVon: "Rechtsanwaeltin M.",
  am: "2026-09-01",
  fundstelle: "Schreiben vom 01.09.2026, Aktenzeichen 12/26",
  ...extra,
})

console.log("\nJ1 · Eine Klaerung ist eine Feststellung, keine Meinung")
p(J.klaerungTraegt(klaerung()), "mit Satz, Person, Datum und Fundstelle traegt sie")
p(!J.klaerungTraegt(klaerung({ gilt: null })), "ohne Satz nicht")
p(!J.klaerungTraegt(klaerung({ festgestelltVon: null })), "ohne Feststellenden nicht",
  "eine Meinung ueber Recht ist gefaehrlicher als gar keine")
p(!J.klaerungTraegt(klaerung({ am: null })), "ohne Datum nicht")
p(!J.klaerungTraegt(klaerung({ am: "2026" })), "und eine Jahreszahl ist kein Datum")
p(!J.klaerungTraegt(klaerung({ fundstelle: "intern" })), "und „intern“ ist keine Fundstelle")

console.log("\nJ2 · Ungeklaert heisst nein — aber es heisst nicht „entschieden“")
for (const m of J.MAERKTE) {
  p(!J.darfVerkaufenIn(m).ja, `${m}: nein`)
  p(/Luecke, keine Entscheidung/.test(J.darfVerkaufenIn(m).grund), `${m}: und der Grund sagt, dass es eine Luecke ist`)
}
p(!J.darfVerkaufenIn("US").ja, "ein nicht gefuehrter Markt erst recht nicht")
p(J.geklaerteMaerkte().length === 0, "heute ist kein Markt geklaert")

console.log("\nJ3 · Die Steuerfrage bleibt bei G18")
p(R.steuerlage().art === "offen", "der Steuerstatus ist offen (G18)")
p(J.luecken("DE").some((l) => l.punkt === "steuer"), "und die deutsche Lage uebernimmt das")
p(/G18/.test(J.luecken("DE").find((l) => l.punkt === "steuer").satz), "mit ausdruecklichem Verweis",
  "zwei Fassungen derselben Rechtsfrage waeren in vier Wochen zwei verschiedene")

console.log("\nJ4 · Deutschland ist weiter als die Schweiz — aber nicht fertig")
p(J.luecken("DE").length < J.luecken("CH").length, "DE hat weniger offene Punkte als CH")
p(J.luecken("DE").length > 0, "aber nicht null")
p(J.lageZu("DE").waehrung === "EUR", "DE rechnet in Euro")
p(J.lageZu("CH").waehrung === "CHF", "CH in Franken",
  "ein Preis in der falschen Waehrung ist kein Preis, sondern eine Verhandlung")

console.log("\nJ5 · Vier Punkte, und jeder sagt, warum er zaehlt")
p(J.PUNKTE.length === 4, "vier Punkte je Markt")
for (const m of J.MAERKTE) {
  p(J.luecken(m).every((l) => l.satz.length > 30), `${m}: jede Luecke traegt einen Grund`)
}

console.log("\nJ6 · Das Modul erklaert kein Recht")
p(!("bestimmeSteuer" in J) && !("rechtslage" in J), "es gibt keine Funktion, die Recht feststellt")
p(J.MARKTLAGEN.every((l) => J.PUNKTE.every((pt) => {
  const k = l.klaerungen[pt]
  return k.gilt === null || J.klaerungTraegt(k)
})), "jede vorhandene Klaerung ist belegt",
  "ein Satz ohne Wer und Wann waere erfundene Rechtsauskunft")

console.log("\nJ7 · Der Lagesatz beschreibt, was ist")
p(/halb da/i.test(J.HALB_DA), "die Internationalisierung ist halb da")
p(/Luecke, keine Entscheidung/.test(J.HALB_DA), "und der Satz nennt den Unterschied")
p(/Schweizer Anforderungen/.test(J.HALB_DA), "und den konkreten Bezug")

console.log(`\n  ${fehler === 0 ? "Ungeklaert ist eine Luecke, keine Entscheidung." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
