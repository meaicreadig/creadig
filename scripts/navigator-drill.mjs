#!/usr/bin/env node
/**
 * DER NAVIGATOR-PROBELAUF — GATE 29
 *
 * Prueft die drei Arten, auf die eine Empfehlung uebergriffig wird: ohne
 * Beleg, aus einem Unbekannten, und indem sie selbst handelt.
 */
const N = await import("../lib/navigator.ts")
const G = await import("../lib/gedaechtnis.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

const lage = (extra = {}) => ({
  key: "freigaben",
  frage: "Steht etwas?",
  antwort: "Nein, es steht nicht.",
  steht: false,
  belege: [{ woher: "lib/proof.ts (G13)", was: "Freigabe mit Person und Datum" }],
  ...extra,
})
const vorschlag = (extra = {}) => ({
  key: "freigaben",
  art: "beheben",
  handlung: "Je Kundenarbeit eine Freigabe einholen.",
  wer: "owner",
  weil: "Keine hinterlegt.",
  quelle: lage(),
  ...extra,
})

console.log("\nN1 · Kein Vorschlag ohne Beleg")
p(N.vorschlagTraegt(vorschlag()), "mit Handlung, Grund und belegter Quelle traegt er")
p(!N.vorschlagTraegt(vorschlag({ quelle: lage({ belege: [] }) })), "ohne Beleg in der Quelle nicht")
p(!N.vorschlagTraegt(vorschlag({ quelle: null })), "ohne Quelle nicht")
p(!N.vorschlagTraegt(vorschlag({ weil: "" })), "ohne Grund nicht")
p(!N.vorschlagTraegt(vorschlag({ art: "ignorieren" })), "mit unbekannter Art nicht")

console.log("\nN2 · Eine Handlung ist ein Verb, kein Zustand")
p(!N.vorschlagTraegt(vorschlag({ handlung: "Die Freigaben stehen aus." })), "ein Zustand ist keine Handlung",
  "davon wird niemand taetig")
p(!N.vorschlagTraegt(vorschlag({ handlung: "Das fehlt noch." })), "auch kein zweiter")
p(!N.vorschlagTraegt(vorschlag({ handlung: "Machen." })), "und ein Wort ist zu wenig")
p(N.vorschlagTraegt(vorschlag({ handlung: "Freigabe einholen und hinterlegen." })), "ein Satz mit Verb schon")

console.log("\nN3 · Nicht erhoben heisst messen, nicht reparieren")
const unerhoben = [lage({ key: "produktstand", steht: null, antwort: "Nicht erhoben." })]
const v1 = N.vorschlaege(unerhoben)
p(v1.length === 1, "aus einer unerhobenen Lage entsteht ein Vorschlag")
p(v1[0].art === "messen", "und zwar „messen“",
  "wer behebt, was niemand gemessen hat, haelt danach das Ergebnis fuer bestaetigt")
const befund = [lage({ key: "produktstand", steht: false, antwort: "Steht nicht." })]
p(N.vorschlaege(befund)[0].art === "beheben", "aus einem Befund entsteht „beheben“")

console.log("\nN4 · Zu einer stehenden Lage gibt es nichts")
p(N.vorschlaege([lage({ steht: true })]).length === 0, "erledigt erzeugt keinen Vorschlag",
  "sonst fuellt der Blick sich mit Bestaetigung")
p(N.vorschlaege([]).length === 0, "und aus nichts entsteht nichts")
p(N.vorschlaege([lage({ key: "gibt-es-nicht" })]).length === 0,
  "eine Lage ohne hinterlegte Handlung erzeugt keinen",
  "der Navigator erfindet keine Handlung")

console.log("\nN5 · Erst messen, dann beheben")
const gemischt = [
  lage({ key: "produktstand", steht: null }),
  lage({ key: "freigaben", steht: false }),
  lage({ key: "wirtschaftlichkeit", steht: null }),
]
const folge = N.reihenfolge(gemischt)
p(folge.length === 3, "drei Vorschlaege")
p(folge[0].art === "messen" && folge[1].art === "messen", "die beiden Messungen zuerst")
p(folge[2].art === "beheben", "die Reparatur danach",
  "eine Reparatur an ungemessener Stelle macht die Messung fuer immer unmoeglich")
p(N.zuMessen(gemischt).length === 2, "`zuMessen` liefert zwei")
p(N.zuBeheben(gemischt).length === 1, "`zuBeheben` eine")

console.log("\nN6 · Innerhalb der Gruppen wird nicht sortiert")
const a = N.reihenfolge(gemischt).map((v) => v.key)
const b = N.reihenfolge(gemischt).map((v) => v.key)
p(JSON.stringify(a) === JSON.stringify(b), "die Reihenfolge ist stabil")
p(!("dringlichkeit" in (N.reihenfolge(gemischt)[0] ?? {})), "aber es gibt keine Dringlichkeit",
  "eine Rangfolge waere eine Entscheidung, und die gehoert dem Menschen")

console.log("\nN7 · Der Navigator handelt nicht")
p(/Entscheidung gehoert einem Menschen/.test(N.NAVIGATOR_HANDELT_NICHT), "die Regel ist nachlesbar")
p(!("fuehreAus" in N) && !("anwenden" in N) && !("erledige" in N), "es gibt keine ausfuehrende Funktion")
p(typeof N.vorschlaege === "function", "nur Vorschlaege")

console.log("\nN8 · Die echte Lage — was der Navigator heute sagt")
const echt = N.reihenfolge()
p(echt.length > 0, `${echt.length} Vorschlaege aus dem Gedaechtnis`)
p(echt.every((v) => v.quelle.belege.length > 0), "jeder mit Belegen aus G28")
p(echt.every((v) => v.quelle.belege.some((x) => /\(G\d+\)/.test(x.woher))), "jeder nennt sein Gate")
p(N.zuMessen().length === G.nichtErhoben().filter((x) => N.vorschlaege([x]).length > 0).length,
  "die Messungen entsprechen den nicht erhobenen Lagen")
p(echt.filter((v) => v.wer === "owner").length > 0, "und die meisten gehoeren dem Owner",
  "das ist der Zustand, nicht die Schuld des Systems")

console.log(`\n  ${fehler === 0 ? "Vorschlagen ja, entscheiden nein." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
