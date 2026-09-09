#!/usr/bin/env node
/**
 * DER GEDAECHTNIS-PROBELAUF — GATE 28
 *
 * Prueft die drei Arten, auf die ein Betriebsgedaechtnis unwahr wird: eine
 * Auskunft ohne Fundstelle, eine gespeicherte Kopie, und ein „nicht
 * erhoben", das sich als „nein" ausgibt.
 */
const G = await import("../lib/gedaechtnis.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

const auskunft = (extra = {}) => ({
  key: "probe",
  frage: "Steht etwas?",
  antwort: "Ja, es steht.",
  steht: true,
  belege: [{ woher: "lib/probe.ts (GXX)", was: "eine nachschlagbare Angabe" }],
  ...extra,
})

console.log("\nG1 · Eine Auskunft ohne Beleg gibt es nicht")
p(G.auskunftTraegt(auskunft()), "mit Frage, Antwort und Beleg traegt sie")
p(!G.auskunftTraegt(auskunft({ belege: [] })), "ohne Beleg nicht")
p(!G.auskunftTraegt(auskunft({ belege: [{ woher: "", was: "x" }] })), "ohne Fundstelle nicht")
p(!G.auskunftTraegt(auskunft({ belege: [{ woher: "lib/x.ts", was: "" }] })), "ohne Inhalt nicht")
p(!G.auskunftTraegt(auskunft({ belege: [{ woher: "x", was: "y" }] })), "und zwei Zeichen sind keine Fundstelle")
p(!G.auskunftTraegt(auskunft({ antwort: "" })), "ohne Antwort nicht")
p(!G.auskunftTraegt(auskunft({ frage: "  " })), "ohne Frage nicht")

console.log("\nG2 · Jede echte Frage traegt ihre Belege")
p(G.FRAGEN.length >= 10, `${G.FRAGEN.length} Fragen im Register`)
p(G.FRAGEN.every((f) => G.auskunftTraegt(f.beantworte())), "jede beantwortet sich mit Beleg")
p(G.FRAGEN.every((f) => f.beantworte().belege.length >= 1), "und jede mit mindestens einem")
p(G.kontext().length === G.FRAGEN.length, "keine faellt durch die Belegpflicht",
  "eine durchgefallene verschwaende stillschweigend")

console.log("\nG3 · Das Gedaechtnis raet nicht")
p(G.frage("gibt-es-nicht") === null, "eine unbekannte Frage bekommt keine Antwort")
p(G.frage("") === null, "eine leere auch nicht")
p(G.frage("freigaben") !== null, "eine bekannte schon")
p(G.frage("freigaben").belege.length >= 2, "mit mehreren Belegen")

console.log("\nG4 · Nichts ist gespeichert")
const a = JSON.stringify(G.kontext())
const b = JSON.stringify(G.kontext())
p(a === b, "zwei Abrufe ergeben dasselbe")
p(G.kontext() !== G.kontext(), "aber nicht dasselbe Objekt",
  "es wird gerechnet, nicht zurueckgegeben")

console.log("\nG5 · Nicht erhoben ist etwas Drittes")
const alle = G.kontext()
p(alle.some((x) => x.steht === null), "es gibt Auskuenfte mit `null`")
p(alle.some((x) => x.steht === false), "und welche mit `false`")
p(G.nichtErhoben().every((x) => x.steht === null), "`nichtErhoben` liefert nur `null`")
p(G.offen().every((x) => x.steht === false), "`offen` nur `false`")
p(G.nichtErhoben().every((x) => !G.offen().includes(x)), "die beiden ueberschneiden sich nicht",
  "wer sie zusammenwirft, behebt etwas, das nicht kaputt ist")

console.log("\nG6 · Die Auskuenfte stimmen mit den Registern ueberein")
const freigaben = G.frage("freigaben")
p(/Keine|von/.test(freigaben.antwort), "die Freigabe-Auskunft nennt eine Zahl im Satz")
p(freigaben.steht === false, "und heute steht sie nicht", "null von drei freigegeben")
const produkt = G.frage("produktstand")
p(produkt.steht === null, "der Reifegrad ist nicht erhoben, nicht schlecht")
p(/genau eine Person/.test(produkt.antwort), "und der Satz sagt, warum")
const wirtschaft = G.frage("wirtschaftlichkeit")
p(wirtschaft.steht === null, "die G05-Frage ist nicht beantwortbar")
p(/G05/.test(wirtschaft.antwort), "und die Antwort nennt die Schuld beim Namen")

console.log("\nG7 · Es ist ein Gedaechtnis, keine Empfehlung")
p(!("empfehlung" in G) && !("vorschlag" in G), "kein Vorschlag im Modul")
p(G.kontext().every((x) => !/solltest|empfehle|wir raten/i.test(x.antwort)),
  "und keine Auskunft sagt, was zu tun ist",
  "das wohnt in G29, mit eigener Belegpflicht")

console.log("\nG8 · Jede Auskunft nennt ihr Gate")
const mitGate = alle.filter((x) => x.belege.some((b) => /\(G\d+\)/.test(b.woher)))
p(mitGate.length === alle.length, "jede Fundstelle nennt das Gate, aus dem sie stammt",
  "sonst weiss niemand, welche Regel dahintersteht")

console.log(`\n  ${fehler === 0 ? "Keine Auskunft ohne Fundstelle." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
