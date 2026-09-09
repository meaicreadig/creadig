#!/usr/bin/env node
/**
 * DER EREIGNIS-PROBELAUF — GATE 26
 *
 * Prueft die vier Stellen, an denen eine Automationsschicht gefaehrlich
 * wird: sie entscheidet · sie wiederholt sich · sie laesst sich nicht
 * abschalten · sie laeuft ewig weiter.
 */
const E = await import("../lib/ereignis.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

const erster = E.AUSLOESER[0]
const lauf = (extra = {}) =>
  E.darfLaufen({ ausloeser: erster.key, ereignis: erster.auf, gegenstand: "vorgang-1", ...extra })

console.log("\nE1 · Wiederholung ja, Verantwortung nein")
p(E.NIEMALS_AUTOMATISCH.length >= 10, `${E.NIEMALS_AUTOMATISCH.length} Handlungen nie automatisch`)
p(E.NIEMALS_AUTOMATISCH.every((n) => /^G\d+$/.test(n.gate)), "jede nennt ihr Gate",
  "eine Verbotsliste ohne Herkunft ist eine Meinung")
for (const verboten of [
  "einen Menschen ansprechen",
  "ein Angebot senden",
  "eine Lieferung abnehmen",
  "eine Rechnung stellen",
  "eine Freigabe erzeugen",
  "einen Reifegrad setzen",
]) {
  p(!E.ausloeserErlaubt(`Automatisch ${verboten}`).ja, `„${verboten}“ ist verboten`)
}
p(E.ausloeserErlaubt("In die Chronik schreiben, was geschehen ist").ja, "notieren ist erlaubt")

console.log("\nE2 · Kein Ausloeser uebertritt die Grenze")
p(E.AUSLOESER.every((a) => E.ausloeserErlaubt(a.was).ja), "alle drei bestehen die Pruefung")
p(E.AUSLOESER.every((a) => E.WIRKUNGEN.includes(a.wirkung)), "jede Wirkung ist eine der vier")
p(E.AUSLOESER.every((a) => E.istEreignis(a.auf)), "jedes Ereignis gibt es wirklich")
p(E.WIRKUNGEN.length === 4, "vier Wirkungen, alle Wiederholung",
  "wer eine fuenfte braucht, braucht einen Menschen")

console.log("\nE3 · Idempotenz ist abgeleitet, nicht gewuerfelt")
const s = E.idempotenzSchluessel("a", "offer.sent", "x")
p(s === E.idempotenzSchluessel("a", "offer.sent", "x"), "derselbe Vorgang, derselbe Schluessel")
p(s !== E.idempotenzSchluessel("a", "offer.sent", "y"), "ein anderer Gegenstand, ein anderer")
p(s !== E.idempotenzSchluessel("b", "offer.sent", "x"), "ein anderer Ausloeser ebenso")
p(s !== E.idempotenzSchluessel("a", "offer.accepted", "x"), "und ein anderes Ereignis auch")

console.log("\nE4 · Zweimal geschieht nichts zweimal")
const erst = lauf()
p(erst.erlaubt, "beim ersten Mal laeuft es")
p(erst.schluessel !== null, "und es gibt einen Schluessel")
const nochmal = lauf({ protokoll: [erst.schluessel] })
p(!nochmal.erlaubt, "beim zweiten Mal nicht mehr")
p(/Schon geschehen/.test(nochmal.grund), "und der Grund sagt, warum",
  "genau der Fehler, den man erst im Postfach des Kunden bemerkt")

console.log("\nE5 · Der Mensch schlaegt die Maschine")
const aus = lauf({ abgeschaltet: [erster.key] })
p(!aus.erlaubt, "abgeschaltet laeuft nicht")
p(/Menschen abgeschaltet/.test(aus.grund), "und sagt, dass ein Mensch es war")
p(aus.schluessel === null, "und es entsteht kein Schluessel",
  "wer abschaltet, will nicht, dass es einmal noch geschieht")
p(E.AUSLOESER.every((a) => a.abschaltbar === true), "jeder Ausloeser ist abschaltbar")

console.log("\nE6 · Nichts laeuft ewig")
p(!lauf({ versuche: erster.versucheMax }).erlaubt, `nach ${erster.versucheMax} Versuchen ist Schluss`)
p(/Dauerzustand/.test(lauf({ versuche: erster.versucheMax }).grund), "und der Grund nennt es beim Namen")
p(lauf({ versuche: erster.versucheMax - 1 }).erlaubt, "davor laeuft es noch")
p(E.AUSLOESER.every((a) => a.versucheMax >= 1 && a.versucheMax <= 5), "jede Grenze ist sinnvoll")

console.log("\nE7 · Nichts laeuft am falschen Ereignis")
p(!E.darfLaufen({ ausloeser: erster.key, ereignis: "offer.sent", gegenstand: "x" }).erlaubt,
  "ein Ausloeser haengt an genau einem Ereignis")
p(!E.darfLaufen({ ausloeser: erster.key, ereignis: "gibt.esnicht", gegenstand: "x" }).erlaubt,
  "ein unbekanntes Ereignis loest nichts aus")
p(!E.darfLaufen({ ausloeser: "erfunden", ereignis: erster.auf, gegenstand: "x" }).erlaubt,
  "ein unbekannter Ausloeser auch nicht")

console.log("\nE8 · Kein zweites Vokabular")
p(E.EREIGNISSE.length === 18, `${E.EREIGNISSE.length} Ereignisse — die des Speichers`)
p(E.EREIGNISSE.includes("offer.accepted"), "darunter das Ja aus G17")
p(E.EREIGNISSE.includes("project.handover"), "die Uebergabe aus G19")
p(E.EREIGNISSE.every((x) => /^[a-z]+\.[a-z]+$/.test(x)), "alle in der Schreibweise des Speichers")

console.log(`\n  ${fehler === 0 ? "Wiederholung automatisieren, nicht Verantwortung." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
