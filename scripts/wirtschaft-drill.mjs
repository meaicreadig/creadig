#!/usr/bin/env node
/**
 * DER WIRTSCHAFTLICHKEITS-PROBELAUF — GATE 23
 *
 * Prueft die eine Versuchung, der ein Wirtschaftlichkeitsmodul erliegt: aus
 * fehlenden Daten eine Zahl zu machen. Und die zweite: eine Knappheit zu
 * behaupten, die niemand zaehlt.
 */
const W = await import("../lib/wirtschaft.ts")
const S = await import("../lib/site-data.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

const aufwand = (minuten) => [{ projektId: "p1", minuten, wofuer: "Bau", am: "2026-09-01" }]

console.log("\nW1 · Es gibt zwei Wege, nicht drei")
const gerechnet = W.marge(240000, aufwand(1800), 8000)
p(gerechnet.art === "gerechnet", "mit Erloes, Aufwand und Satz wird gerechnet")
p(W.marge(240000, [], 8000).art === "unbekannt", "ohne Aufwand: unbekannt")
p(W.marge(null, aufwand(600), 8000).art === "unbekannt", "ohne Erloes: unbekannt")
p(W.marge(240000, aufwand(600), null).art === "unbekannt", "ohne Stundensatz: unbekannt")
p(W.marge(0, aufwand(600), 8000).art === "unbekannt", "ein Erloes von null ist kein Erloes")
p(!("geschaetzt" in gerechnet) && !("ungefaehr" in gerechnet), "und es gibt keinen dritten Weg",
  "jede Naeherung wird nach zwei Wochen wie eine Zahl gelesen")

console.log("\nW2 · Die Rechnung stimmt, wenn sie stattfindet")
p(gerechnet.art === "gerechnet" && gerechnet.stunden === 30, "1800 Minuten sind 30 Stunden")
p(gerechnet.art === "gerechnet" && gerechnet.kostenCent === 240000, "30 h zu 80 € sind 2.400 €")
p(gerechnet.art === "gerechnet" && gerechnet.margeCent === 0, "bei 2.400 € Erloes bleibt nichts",
  "genau die Frage, die G05 gestellt hat")
const besser = W.marge(390000, aufwand(1800), 8000)
p(besser.art === "gerechnet" && besser.margeCent === 150000, "beim Regelpreis bleiben 1.500 €")
p(besser.art === "gerechnet" && besser.anteil === 38, "das sind 38 %")

console.log("\nW3 · Der Grund sagt, was fehlt — und nennt die Schuld")
const lage = W.marge(240000, [], null)
p(lage.art === "unbekannt" && lage.fehlt.length === 2, "zwei Gruende, nicht einer")
p(lage.art === "unbekannt" && lage.fehlt.some((f) => /G05/.test(f)), "einer nennt die G05-Schuld")
p(lage.art === "unbekannt" && lage.fehlt.some((f) => /geraten/.test(f)),
  "und sagt, was eine Schaetzung waere")

console.log("\nW4 · Die G05-Frage, direkt gestellt")
p(W.traegtDerPreis("website", []).art === "unbekannt", "traegt der Pilotpreis? nicht beantwortbar")
p(W.traegtDieBetreuung([]).art === "unbekannt", "traegt 149 €/Monat? ebenso")
p(S.packages.find((x) => x.key === "website")?.amount === 2400, "der Pilotpreis ist 2.400 €")
p(S.retainer.amount === 149, "und die Betreuung 149 €")

console.log("\nW5 · Null ist keine Antwort auf eine nicht gestellte Frage")
const ohne = W.wiederkehrenderAnteil(null, null)
p(ohne.art === "unbekannt", "ohne abgerechnete Betraege: unbekannt")
p(/Null waere hier eine Aussage/.test(ohne.fehlt), "und der Grund sagt, warum nicht null",
  "null liesse sich als „nichts kehrt wieder“ lesen")
p(W.wiederkehrenderAnteil(0, 0).art === "unbekannt", "auch zwei Nullen sind kein Anteil")
const mit = W.wiederkehrenderAnteil(240000, 60000)
p(mit.art === "gerechnet" && mit.anteil === 20, "2.400 einmalig, 600 wiederkehrend: 20 %")

console.log("\nW6 · Ausgelastet sein braucht eine Zahl")
const last = W.auslastung(3)
p(last.art === "unbekannt", "ohne Kapazitaetsgrenze keine Auslastung")
p(/Gefuehl schaltet nichts ab/.test(last.fehlt), "und der Grund sagt, warum das zaehlt")
p(W.darfVerkaufen(3).ja, "verkauft werden darf trotzdem",
  "ein Verkaufsstopp aus Buchhaltungsgruenden waere schlimmer als die Luecke")
p(/Ungeprueft/.test(W.darfVerkaufen(3).satz), "aber der Vorbehalt steht im Satz")

console.log("\nW7 · Die Knappheit muss gezaehlt werden")
p(W.pilotpreisLage("Dachdecker", null).gilt === null, "ohne erfasste Gewerke: weder ja noch nein")
p(/keine Bedingung/.test(W.pilotpreisLage("Dachdecker", null).grund),
  "und der Grund sagt, was das bedeutet",
  "dann ist der Pilotpreis kein Pilotpreis, sondern der Preis")
p(W.pilotpreisLage("Dachdecker", []).gilt === true, "in einem leeren Bestand gilt er")
p(W.pilotpreisLage("Dachdecker", ["Dachdecker"]).gilt === false, "beim zweiten Dachdecker nicht mehr")
p(W.pilotpreisLage("dachdecker", ["Dachdecker"]).gilt === false, "Grossschreibung schuetzt nicht")
p(W.pilotpreisLage("Elektro", ["Dachdecker"]).gilt === true, "ein anderes Gewerk ist frei")
p(W.pilotpreisLage("", []).gilt === null, "ohne Gewerk keine Aussage",
  "die Bedingung ist ein Gewerk, kein Betrieb")

console.log("\nW8 · Der Bestand — was G23 vorfindet")
p(W.STUNDENSATZ_INTERN_CENT === null, "kein interner Stundensatz",
  "ein geschaetzter waere die zweite Haelfte einer erfundenen Marge")
p(W.KAPAZITAET.projekte === null, "keine Kapazitaetsgrenze")
p(W.KAPAZITAET.betreuungen === null, "auch nicht fuer Betreuungen")

console.log(`\n  ${fehler === 0 ? "Ein sauber begruendetes Unbekannt schlaegt eine gerundete Zahl." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
