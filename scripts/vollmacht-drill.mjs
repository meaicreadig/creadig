#!/usr/bin/env node
/**
 * DER VOLLMACHT-PROBELAUF — GATE 30
 *
 * Prueft die vier Arten, auf die eine Vollmacht ihre Grenzen verliert: sie
 * wird groesser als ihr Auftraggeber · sie endet nie · ein Widerruf wirkt
 * zu spaet · es bleibt keine Spur.
 */
const V = await import("../lib/vollmacht.ts")
const E = await import("../lib/ereignis.ts")
const R = await import("../lib/rollen.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

const heute = new Date("2026-09-15T00:00:00Z")
const vollmacht = (extra = {}) => ({
  agent: "notizbot",
  imNamenVon: "owner",
  erteiltVon: "Owner",
  erteiltAm: "2026-09-01",
  gueltigBis: "2026-11-01",
  ereignisse: ["project.handover"],
  wirkungen: ["notieren"],
  ...extra,
})
const tun = (extra = {}) =>
  V.handeln({
    vollmacht: vollmacht(),
    ereignis: "project.handover",
    wirkung: "notieren",
    handlung: "chronik-notieren",
    dazu: "vier Stuecke, Projekt 1",
    an: "projekt-1",
    heute,
    ...extra,
  })

console.log("\nV1 · Eine Vollmacht liegt INNERHALB der Grenze, sie erweitert sie nicht")
const allmacht = vollmacht({ wirkungen: [...E.WIRKUNGEN], ereignisse: [...E.EREIGNISSE] })
for (const n of E.NIEMALS_AUTOMATISCH) {
  const h = V.handeln({
    vollmacht: allmacht,
    ereignis: "offer.accepted",
    wirkung: "notieren",
    handlung: "chronik-notieren",
    dazu: `Automatisch ${n.was}`,
    an: "x",
    heute,
  })
  p(!h.erlaubt, `„${n.was}“ bleibt verboten (${n.gate})`)
}
p(!V.handeln({ vollmacht: allmacht, ereignis: "offer.accepted", wirkung: "notieren", handlung: "chronik-notieren", dazu: "Automatisch eine Freigabe erzeugen", an: "x", heute }).spur,
  "und es entsteht keine Spur fuer etwas Verbotenes")

console.log("\nV2 · Jede Vollmacht endet")
p(V.gueltig(vollmacht(), heute), "eine begrenzte traegt")
p(!V.gueltig(vollmacht({ gueltigBis: "" }), heute), "ohne Ende nicht",
  "sie verlaengerte sich durch Vergessen")
p(!V.gueltig(vollmacht({ gueltigBis: "2027-09-01" }), heute), `laenger als ${V.VOLLMACHT_MAX_TAGE} Tage nicht`)
p(!V.gueltig(vollmacht({ gueltigBis: "2026-08-01" }), heute), "abgelaufen nicht")
p(V.abgelaufen(vollmacht({ gueltigBis: "2026-09-14" }), heute), "und `abgelaufen` sagt es auch")
p(!V.gueltig(vollmacht({ gueltigBis: "2026-08-25", erteiltAm: "2026-09-01" }), heute),
  "ein Ende vor dem Beginn ist kein Ende")

console.log("\nV3 · Der Widerruf wirkt sofort")
p(!V.gueltig(V.widerrufen(vollmacht(), "2026-09-10"), heute), "widerrufen traegt nicht mehr")
p(!tun({ vollmacht: V.widerrufen(vollmacht(), "2026-09-10") }).erlaubt, "und es geschieht nichts mehr",
  "sofort, nicht zum naechsten Lauf")
p(V.widerrufen(vollmacht(), "2026-09-10").erteiltVon === "Owner", "der Eintrag bleibt stehen",
  "man muss erklaeren koennen, warum damals")

console.log("\nV4 · Ohne Spur geschieht nichts")
p(tun().erlaubt, "eine gedeckte Handlung geht durch")
p(tun().spur !== null, "und hinterlaesst eine Spur")
p(V.spurTraegt(tun().spur), "die vollstaendig ist")
p(tun().spur.wegen === "project.handover", "sie nennt das ausloesende Ereignis")
p(tun().spur.imNamenVon === "owner", "und in wessen Namen gehandelt wurde")
p(!tun({ handlung: "kunden-anrufen" }).erlaubt, "eine erfundene Handlung geht nicht durch",
  "unbekannt heisst nein, nicht „nicht verboten“")
p(!tun({ handlung: "" }).erlaubt, "und eine namenlose auch nicht")
p(tun().spur.was === E.HANDLUNGEN.find((h) => h.key === "chronik-notieren").was,
  "die Spur nennt die Handlung woertlich aus dem Katalog",
  "eine Pruefspur, deren Inhalt der Kontrollierte bestimmt, ist keine")
p(!tun({ wirkung: "pruefen", handlung: "chronik-notieren" }).erlaubt,
  "eine Wirkung, die nicht zur Handlung gehoert, geht nicht durch")
p(!tun({ an: "" }).erlaubt, "und ohne Gegenstand auch nicht")

console.log("\nV5 · Die Vollmacht deckt genau, was dasteht")
p(!tun({ ereignis: "offer.sent" }).erlaubt, "ein nicht gedecktes Ereignis nicht")
p(!tun({ wirkung: "pruefen" }).erlaubt, "eine nicht gedeckte Wirkung nicht")
p(!tun({ ereignis: "gibt.esnicht" }).erlaubt, "ein erfundenes Ereignis erst recht nicht")
p(!V.gueltig(vollmacht({ ereignisse: [] }), heute), "auf nichts ist ein Irrtum, keine Vollmacht")
p(!V.gueltig(vollmacht({ wirkungen: [] }), heute), "und darf-nichts braucht keine")

console.log("\nV6 · Ein Agent handelt im Namen eines Menschen")
p(!V.gueltig(vollmacht({ imNamenVon: "erfunden" }), heute), "eine erfundene Rolle traegt nicht")
p(!V.gueltig(vollmacht({ erteiltVon: "" }), heute), "und ohne Auftraggeber auch nicht",
  "eine Vollmacht, die sich selbst erteilt, ist keine")
p(R.ROLLEN_KEYS.includes(vollmacht().imNamenVon), "die Rolle stammt aus G32")

console.log("\nV7 · Die drei Stufen sind getrennt")
p(typeof V.handeln === "function", "G30 handelt")
p(!("vorschlaege" in V), "und schlaegt nicht vor — das ist G29")
p(!("kontext" in V), "und liest nicht — das ist G28",
  "wer die drei zusammenlegt, bekommt Stellvertretung statt Automation")

console.log("\nV8 · Der Bestand — heute handelt niemand")
p(V.AGENTEN.length === 0, "kein Agent beauftragt")
p(/braucht einen Menschen/.test(V.KEINE_AGENTEN), "und der Satz sagt, was einer braeuchte")

console.log(`\n  ${fehler === 0 ? "Eine Vollmacht liegt innerhalb der Grenze — sie verschiebt sie nicht." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
