#!/usr/bin/env node
/**
 * DER VERKAUFS-PROBELAUF — GATE 25
 *
 * Prueft die zwei Stellen, an denen eine Kommerzialisierung still unehrlich
 * wird: eine Schwelle, die man mit gutem Willen ueberspringt, und ein
 * Produktkandidat, der aus einer Idee statt aus einem Muster kommt.
 */
const V = await import("../lib/verkauf.ts")
const L = await import("../lib/verlust.ts")
const P = await import("../lib/produkt.ts")
const R = await import("../lib/rechnung.ts")
const S = await import("../lib/site-data.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

const beob = (extra = {}) => ({
  quelle: "verlust",
  was: "erfasst Auftraege dreimal, auf Zetteln und in zwei Systemen",
  bei: "Betrieb A",
  beleg: "Vorgang CD-260901-0bd1, Notiz vom 01.09.",
  ...extra,
})
const kandidat = (beobachtungen) => ({
  key: "mehrfacherfassung",
  problem: "Auftragsdaten werden mehrfach erfasst",
  these: "Koennte ein Erfassungsweg sein, der die Zettel ersetzt",
  beobachtungen,
})

console.log("\nV1 · Die Schwelle nutzt nichts, wenn sie niemand fragt")
p(typeof V.verkaeuflich === "function", "es gibt eine Schwelle")
p(V.verkaeuflicheProdukte().length === 0, "und heute nimmt sie kein Produkt")
p(S.productWorks.every((w) => V.huerden(w.slug).length > 0), "jedes Produkt hat mindestens eine Huerde")
p(V.VERKAUFSLAGEN.length === 0, "und keines hat eine Verkaufslage",
  "ein Eintrag waere eine Verkaufsabsicht, die niemand geaeussert hat")

console.log("\nV2 · Die sechs Bedingungen, einzeln")
const h = V.huerden("fibero")
const bedingungen = h.map((x) => x.bedingung)
p(bedingungen.includes("Reifegrad"), "ohne bestaetigten Reifegrad keine Zusage")
p(bedingungen.includes("Preis"), "ohne Preisquelle kein Verkauf")
p(bedingungen.includes("Steuerlage"), "ohne geklaerte Steuerlage kein Verkauf",
  "was niemand abrechnen kann, kann niemand verkaufen")
p(bedingungen.includes("Betrieb danach"), "ohne Betrieb danach kein Verkauf")
p(!bedingungen.includes("Eigentuemer"), "der Eigentuemer steht (G24)")
p(!bedingungen.includes("Rueckmeldeweg"), "und der Rueckmeldeweg auch (G24)")
p(h.every((x) => x.satz.length > 40), "jede Huerde als Satz, nicht als Zahl")

console.log("\nV3 · Die Steuerlage ist die kaufmaennische Grenze")
p(R.steuerlage().art === "offen", "der Umsatzsteuer-Status ist heute offen (G18)")
p(bedingungen.includes("Steuerlage"), "und genau das haelt jedes Produkt auf",
  "eine technische Reife hilft dagegen nicht")

console.log("\nV4 · Verkaeuflich ist nicht dasselbe wie fertig")
p(V.VERKAUFSREIFE_AB.includes("pilot"), "ein Pilot darf verkauft werden — als Pilot")
p(V.VERKAUFSREIFE_AB.includes("live"), "live natuerlich auch")
p(!V.VERKAUFSREIFE_AB.includes("private-beta"), "eine geschlossene Testphase nicht",
  "sie ist eine Einladung, kein Kaufvertrag")
p(!V.VERKAUFSREIFE_AB.includes("in-development"), "und in Entwicklung erst recht nicht")
p(P.REIFEGRADE.live.heisstNicht.includes("fertig"), "„live“ heisst weiterhin nicht „fertig“")

console.log("\nV5 · Eine Zahl wird auch hier nicht getippt")
p(V.preisquelleTraegt({ art: "katalog", quelle: "paket-website" }), "ein Katalogverweis traegt")
p(!V.preisquelleTraegt({ art: "katalog", quelle: "gibt-es-nicht" }), "ein erfundener Schluessel nicht")
p(!V.preisquelleTraegt(null), "gar keine Quelle nicht")
p(!V.preisquelleTraegt({ art: "zuschnitt", freigabe: { von: "Owner", am: "2026-09-09", fundstelle: "intern" } }),
  "und eine Freigabe mit „intern“ als Fundstelle traegt nicht")
p(V.preisquelleTraegt({
  art: "zuschnitt",
  freigabe: { von: "Owner", am: "2026-09-09", fundstelle: "Postfach, Betreff Produktpreis fibero" },
}), "eine belastbare Freigabe schon")

console.log("\nV6 · Ein Muster beginnt bei drei — und die Zahl gehoert G16")
p(L.MUSTER_AB === 3, `die Schwelle steht in G16 und ist ${L.MUSTER_AB}`)
const einer = V.kandidatenlage(kandidat([beob()]))
p(!einer.muster, "eine Beobachtung ist kein Muster")
const zwei = V.kandidatenlage(kandidat([beob(), beob({ bei: "Betrieb B" })]))
p(!zwei.muster, "zwei auch nicht")
const drei = V.kandidatenlage(kandidat([beob(), beob({ bei: "Betrieb B" }), beob({ bei: "Betrieb C" })]))
p(drei.muster, "drei bei drei Betrieben schon")

console.log("\nV7 · Drei Meldungen desselben Kunden sind kein Muster")
const einBetrieb = V.kandidatenlage(kandidat([beob(), beob(), beob()]))
p(einBetrieb.tragende === 3, "drei belegte Beobachtungen")
p(einBetrieb.betriebe === 1, "aber nur ein Betrieb dahinter")
p(!einBetrieb.muster, "also kein Muster",
  "das loest man im Projekt, nicht mit einem Produkt")
p(einBetrieb.fehlt.some((f) => /Betrieb/.test(f)), "und der Grund sagt genau das")
const zweiBetriebe = V.kandidatenlage(kandidat([beob(), beob(), beob({ bei: "Betrieb B" })]))
p(zweiBetriebe.muster, "drei Beobachtungen bei zwei Betrieben genuegen")

console.log("\nV8 · Eine Beobachtung ohne Beleg zaehlt nicht")
p(V.beobachtungTraegt(beob()), "mit Quelle, Problem, Betrieb und Beleg traegt sie")
p(!V.beobachtungTraegt(beob({ beleg: "" })), "ohne Beleg nicht")
p(!V.beobachtungTraegt(beob({ beleg: "intern" })), "und „intern“ ist zu kurz, um eine Fundstelle zu sein")
p(!V.beobachtungTraegt(beob({ bei: "" })), "ohne Betrieb nicht")
p(!V.beobachtungTraegt(beob({ quelle: "bauchgefuehl" })), "eine Quelle, die es nicht gibt, traegt nicht")
p(!V.beobachtungTraegt(beob({ was: "kaputt" })), "und ein Wort ist kein Problem")

console.log("\nV9 · Der Bestand — der Zustand, den G25 vorfindet")
p(V.KANDIDATEN.length === 0, "kein Produktkandidat",
  "die Quellen existieren seit G10/G11/G16 — gesammelt wurde noch nicht")
p(V.muster().length === 0, "und damit kein Muster")
p(V.VERKAUFSLAGEN.length === 0, "keine Verkaufslage")

console.log(`\n  ${fehler === 0 ? "Verkaeuflich ist eine kaufmaennische Aussage, keine technische." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
