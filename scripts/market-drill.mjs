#!/usr/bin/env node
/**
 * Der Zielbild-Probelauf (Gate 09).
 *
 * Prueft, ob das Zielbild NEIN sagen kann. Ein Modell, das jeden Betrieb
 * durchwinkt, ist keins — und das faellt nur auf, wenn man es an Faellen
 * fuehrt, die es ablehnen SOLL.
 *
 * Die Faelle sind Betriebstypen, keine benannten Firmen: Wir ordnen hier
 * keine realen Unternehmen ohne deren Wissen ein und legen nichts im CRM ab.
 * Was geprueft wird, ist das MODELL.
 */
import { classify, SIGNALS, EXCLUSIONS, HYPOTHESES } from "../lib/market.ts"

let fehler = 0
const p = (ok, name, detail = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`) }
const leer = { signals: {}, exclusions: [], zugang: null, bedienbar: null, kaufkraft: null }
const fall = (o) => classify({ ...leer, ...o })

console.log("\n1 · Das Modell sagt NEIN")
const nurLogo = fall({ exclusions: ["reine-ware"], zugang: "netzwerk" })
p(nurLogo.passung.urteil === "unpassend", "reine Gestaltungsware wird abgelehnt", nurLogo.passung.gruende[0])
p(nurLogo.zugang.urteil === "passend", "und der Zugang bleibt trotzdem gut bewertet — getrennte Achsen")
const glatt = fall({ exclusions: ["kein-betriebsproblem"] })
p(glatt.passung.urteil === "unpassend", "Betrieb ohne Reibung wird abgelehnt")

console.log("\n2 · Ein Signal genuegt nicht — sonst passt jeder")
const eins = fall({ signals: { aussendienst: "Stellenanzeige Monteur" } })
p(eins.passung.urteil === "unklar", "ein Signal -> UNKLAR, nicht passend")
const zwei = fall({ signals: { aussendienst: "Stellenanzeige Monteur", "getrennte-systeme": "zwei Buchungswege" } })
p(zwei.passung.urteil === "passend", "zwei Signale -> passend", `${zwei.passung.gruende.length} Gruende`)

console.log("\n3 · Unbekanntes bleibt unbekannt")
const nichts = fall({})
p(nichts.passung.urteil === "unklar" && nichts.zugang.urteil === "unklar"
  && nichts.bedienbarkeit.urteil === "unklar" && nichts.kaufkraft.urteil === "unklar",
  "ohne Recherche ist alles UNKLAR — nichts wird geraten")
p(!JSON.stringify(nichts).match(/\d+\s*%|score|wahrscheinlich/i), "keine Punktzahl, kein Prozent")

console.log("\n4 · Die vier Achsen trennen wirklich")
const kmL = fall({ signals: { "mehrere-standorte": "vier Filialen im Impressum", aussendienst: "Lieferdienst" }, zugang: "keiner" })
p(kmL.passung.urteil === "passend" && kmL.zugang.urteil === "unpassend",
  "passend UND unerreichbar ist ein gueltiger Zustand", kmL.naechstes)
const freund = fall({ zugang: "netzwerk" })
p(freund.zugang.urteil === "passend" && freund.passung.urteil === "unklar",
  "warmer Kontakt erzeugt KEINE Marktpassung")
const schweiz = fall({ signals: { "mehrere-standorte": "drei Standorte", "getrennte-systeme": "getrennte Shops" },
  exclusions: ["unbedienbare-region"], zugang: "bestandskunde", bedienbar: false })
p(schweiz.passung.urteil === "passend" && schweiz.bedienbarkeit.urteil === "unklar",
  "CH: passend, aber heute nicht bedienbar — nicht verworfen", schweiz.bedienbarkeit.gruende[0])

console.log("\n5 · Zwei aehnliche Betriebe, zwei gleiche Urteile")
const a = fall({ signals: { aussendienst: "Montage", "wiederkehrende-handarbeit": "Nachweise von Hand" }, zugang: "empfehlung" })
const b = fall({ signals: { aussendienst: "Baustelle", "wiederkehrende-handarbeit": "Berichte von Hand" }, zugang: "empfehlung" })
p(a.passung.urteil === b.passung.urteil && a.naechstes === b.naechstes,
  "gleiche Lage -> gleiches Urteil", a.naechstes)

console.log("\n6 · Weiche Ausschluesse sortieren nicht aus")
const weich = fall({ signals: { "koordination-ueber-chat": "WhatsApp als Hauptkontakt", "kein-statusbild": "keine Auftragsverfolgung" },
  exclusions: ["kein-veraenderungswille"] })
p(weich.passung.urteil === "passend", "weicher Ausschluss bleibt Hinweis, nicht Absage")
p(weich.passung.gruende.some((g) => g.startsWith("!")), "und er wird sichtbar gemeldet")

console.log("\n7 · Marktpassung erzeugt nichts weiter")
p(!("opportunity" in zwei) && !("consent" in zwei) && !("werbung" in zwei),
  "keine Chance, keine Werbeeinwilligung — Passung ist nur Passung")

console.log("\n8 · Das Register haelt die Handwerk-Wette offen")
const hw = HYPOTHESES.find((h) => h.key === "handwerk")
p(hw?.status === "ungeprueft", "Handwerk steht als UNGEPRUEFT", hw?.gegenbeleg.slice(0, 58))
const br = HYPOTHESES.find((h) => h.key === "branche")
p(br?.status === "widerlegt", "Branche als Vorhersager: widerlegt")
const tr = HYPOTHESES.find((h) => h.key === "tr-de")
p(tr?.status === "widerlegt", "TR-DE als Segment: widerlegt — bleibt Zugangsvorteil")

console.log("\n9 · Vollstaendigkeit")
p(Object.keys(SIGNALS).length === 9, `${Object.keys(SIGNALS).length} Betriebssignale, je mit Beleg-Quelle`)
p(Object.values(SIGNALS).every((s) => s.evidence.length > 20), "jedes Signal sagt, woran man es sieht")
p(EXCLUSIONS.filter((x) => x.hard).length === 2 && EXCLUSIONS.filter((x) => !x.hard).length === 3,
  "2 harte, 3 weiche Ausschluesse")

console.log(fehler === 0 ? "\nDas Zielbild kann NEIN sagen.\n" : `\n${fehler} Pruefung(en) fehlgeschlagen.\n`)
process.exit(fehler === 0 ? 0 : 1)
