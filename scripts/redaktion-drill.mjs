#!/usr/bin/env node
/**
 * DER REDAKTIONS-PROBELAUF — GATE 15
 *
 * Prueft die Faelle, in denen ein Inhaltssystem still nachlaessig wird: eine
 * Zahl ohne Quelle; eine Fundstelle, die niemand aufschlagen kann; ein
 * Beleg, der mehr traegt, als seine Art tragen darf; ein Kundenname, der
 * durch den Fliesstext entkommt; ein Beitrag, der nirgendwohin fuehrt.
 *
 * Er braucht keine Datenbank und keinen Browser. Alles, was hier geprueft
 * wird, sind Aussagen ueber Text und Herkunft — und die stehen am Datensatz.
 */
const R = await import("../lib/redaktion.ts")
const I = await import("../lib/insights.ts")
const S = await import("../lib/site-data.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

const befund = (extra = {}) => ({
  art: "eigener-befund",
  fundstelle: "docs/barrierefreiheit-befund-eigen.md",
  traegt: "Die Maengel und ihre Nachmessung.",
  ...extra,
})

console.log("\nR1 · Ohne Beleg steht ein Text auf nichts")
p(R.wirdGeprueft("gegenlesen"), "ab dem Gegenlesen prueft das Gate mit")
p(R.wirdGeprueft("veroeffentlicht"), "und erst recht danach")
p(!R.wirdGeprueft("entwurf"), "ein Entwurf darf unfertig sein")
p(!R.istOeffentlich("gegenlesen"), "aber Gegenlesen ist NICHT oeffentlich")
p(!R.istOeffentlich("entwurf"), "und ein Entwurf schon gar nicht")

console.log("\nR2 · Eine Fundstelle, die niemand aufschlagen kann, ist keine")
p(!R.fundstelleTraegt(befund({ fundstelle: "intern" })), "intern traegt nichts")
p(!R.fundstelleTraegt(befund({ fundstelle: "bekannt" })), "bekannt auch nicht")
p(!R.fundstelleTraegt(befund({ fundstelle: "siehe oben" })), "und siehe-oben erst recht nicht")
p(!R.fundstelleTraegt(befund({ fundstelle: "   " })), "Leerzeichen sind keine Quelle")
p(R.fundstelleTraegt(befund()), "ein Pfad in diesem Haus schon")

console.log("\nR3 · Die Art des Belegs begrenzt, was er tragen kann")
p(R.BELEG_ARTEN["eigener-befund"].darfZahlenTragen, "ein eigener Befund traegt Zahlen")
p(R.BELEG_ARTEN["eigene-messung"].darfZahlenTragen, "eine eigene Messung auch")
p(!R.BELEG_ARTEN["eigenes-produkt"].darfZahlenTragen,
  "ein eigenes Produkt NICHT", "es belegt, DASS es laeuft — nicht wie gut")
p(!R.BELEG_ARTEN["kundenbeleg"].darfZahlenTragen, "ein Kundenbeleg NICHT")
p(R.BELEG_ARTEN["kundenbeleg"].brauchtKundenfreigabe, "und er haengt an Gate 13")

console.log("\nR4 · Eine Zahl ohne Quelle ist eine Behauptung mit Ziffern")
p(!R.zahlenGedeckt([]), "kein Beleg deckt keine Zahl")
p(!R.zahlenGedeckt([befund()]), "ein Beleg, der die Zahlen nicht traegt, deckt sie nicht")
p(R.zahlenGedeckt([befund({ traegtZahlen: true })]), "einer, der sie traegt, schon")
p(!R.zahlenGedeckt([{ art: "eigenes-produkt", fundstelle: "fibero", traegt: "Laeuft.", traegtZahlen: true }]),
  "eine Art, die keine Zahlen tragen darf, deckt sie auch nicht, wenn sie es behauptet")

console.log("\nR5 · Was eine Kennzahl ist — und was nur eine Ziffer")
p(R.kennzahlenIm("Die Flaechen standen 4,8 : 1 auseinander.").length === 1, "ein Verhaeltnis ist eine Kennzahl")
p(R.kennzahlenIm("46 % zu schmal").length === 1, "ein Prozentwert auch")
p(R.kennzahlenIm("2 Pixel durchgezogen").length === 1, "eine Zahl mit Einheit auch")
p(R.kennzahlenIm("sieben von acht behoben").length === 0, "ausgeschriebene Zahlen nicht")
p(R.kennzahlenIm("7 von 8 behoben").length === 1, "in Ziffern schon")
p(R.kennzahlenIm("Faktor 4,8").length === 1, "ein Faktor auch")

console.log("\nR6 · Verweise und Daten sind keine Behauptungen")
p(R.kennzahlenIm("nach WCAG 2.4.7 geprueft").length === 0, "eine Norm-Nummer ist kein Messwert")
p(R.kennzahlenIm("WCAG 2.1 AA und ISO 9241").length === 0, "zwei auch nicht")
p(R.kennzahlenIm("am 23. August 2026 geprueft").length === 0, "ein Datum ist keine Kennzahl")
p(R.kennzahlenIm("Stand 2026-09-09").length === 0, "auch nicht in ISO-Schreibweise")
p(R.kennzahlenIm("nach WCAG 2.4.7 lag der Kontrast bei 2,6 : 1").length === 1,
  "aber die Messung DANEBEN wird gefunden", "der Filter blendet nicht den Satz aus, nur den Verweis")

console.log("\nR7 · Ein fremder Name entkommt nicht durch den Fliesstext")
const marken = S.clientWorks.map((w) => w.name)
p(marken.length === 3, "drei Kundenarbeiten im Bestand", marken.join(", "))
p(R.genannteMarken("Fuer maqam haben wir das System gebaut.", marken).length === 1,
  "ein Name im Satz wird gefunden")
p(R.genannteMarken("Wir bauen Systeme fuer Betriebe.", marken).length === 0,
  "ein Text ohne Namen bleibt sauber")
p(R.genannteMarken("maqamat ist ein anderes Wort.", marken).length === 0,
  "und ein Wort, das nur so anfaengt, ist kein Treffer")
p(R.genannteMarken("MAQAM", marken).length === 1, "Grossschreibung schuetzt nicht")

console.log("\nR8 · Ein Beitrag ohne Ziel ist ein Tagebuch")
const ziel = { fuehrtZu: "/leistungen/webdesign", weilLeserFragt: { de: "?", tr: "?", en: "?", ar: "?" } }
p(R.zielIstImHaus(ziel), "eine eigene Adresse fuehrt in den Trichter")
p(!R.zielIstImHaus({ ...ziel, fuehrtZu: "https://fremd.example" }), "eine fremde fuehrt hinaus")
p(!R.zielIstImHaus({ ...ziel, fuehrtZu: "//fremd.example" }), "auch die schemalose Schreibweise")

console.log("\nR9 · Der Weg hat eine Mitte")
p(Object.keys(R.REDAKTIONSWEG).length === 3, "drei Zustaende, nicht zwei")
p(R.REDAKTIONSWEG.gegenlesen.verlangt.length > 20,
  "und der mittlere sagt, was er verlangt", "sonst waere er nur ein Etikett")
p(/Ziel/.test(R.REDAKTIONSWEG.veroeffentlicht.verlangt),
  "veroeffentlichen verlangt zusaetzlich ein Ziel")

console.log("\nR10 · Der reale Bestand — der Zustand, den G15 vorfindet")
p(I.insights.length >= 1, `${I.insights.length} Beitrag/Beitraege im Repo`)
p(I.publishedInsights.length === 1, "genau einer ist oeffentlich", "das ist der duenne Teil, Owner-Punkt")
p(I.emptyInsightCategories.length === 5, "fuenf von sechs Faechern sind leer",
  I.emptyInsightCategories.join(", "))
p(I.insights.every((e) => e.zustand !== undefined), "jeder Beitrag hat einen Zustand")
p(I.insights.filter((e) => R.wirdGeprueft(e.zustand)).every((e) => e.belege.length > 0),
  "jeder geprueft Beitrag steht auf mindestens einem Beleg")
p(I.publishedInsights.every((e) => e.nachfrage !== null), "und jeder oeffentliche fuehrt irgendwohin")

console.log("\nR11 · Die Grenze aus dem Vertrag")
p(!Object.keys(R.BELEG_ARTEN).includes("verteiler"),
  "es gibt keine Belegart, die eine Werbeeinwilligung waere")
p(I.publishedInsights.every((e) => e.nachfrage && e.nachfrage.fuehrtZu.startsWith("/")),
  "jeder Beitrag fuehrt auf eine Seite — nicht in einen Verteiler")

console.log("\nR12 · Ein Beleg gilt fuer einen Beitrag, nicht fuer eine Liste")
const ohne = { zustand: "gegenlesen", belege: [] }
p(!R.zahlenGedeckt(ohne.belege), "die Belege von A decken B nicht")
p(R.zahlenGedeckt([befund({ traegtZahlen: true })]), "waehrend A gedeckt bleibt")

console.log(`\n  ${fehler === 0 ? "Kein Satz ohne Herkunft." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
