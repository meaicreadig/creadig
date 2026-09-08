#!/usr/bin/env node
/**
 * DER FREIGABE-PROBELAUF — GATE 13
 *
 * Prueft die Faelle, in denen ein Belegsystem still uebergriffig wird: eine
 * Erlaubnis, die mehr deckt als erteilt wurde; ein Widerruf, der erst zum
 * naechsten Redaktionsschluss wirkt; eine Zahl ohne Messung; ein Feld, das
 * eine Rechtsaussage traegt und von niemandem gelesen wird.
 *
 * Er braucht keine Datenbank. Freigaben sind Aussagen ueber Menschen, keine
 * Zeilen in einer Tabelle — sie stehen am Datensatz und werden abgeleitet.
 */
const P = await import("../lib/proof.ts")
const S = await import("../lib/site-data.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

const mail = (scopes, extra = {}) => ({
  by: { name: "Ansprechpartner", role: "Geschäftsführung", company: "Probe GmbH" },
  form: "e-mail",
  at: "2026-09-08",
  scopes,
  reference: "Postfach info@creadig.de, Betreff „Freigabe Referenznennung“",
  ...extra,
})

console.log("\nP1 · Ohne Freigabe erscheint nichts")
p(!P.deckung([], ["name"]).gedeckt, "keine Freigabe deckt keine Nennung")
p(/Keine schriftliche Freigabe/.test(P.deckung([], ["name"]).grund), "und sagt als Satz, was fehlt")
p(!P.deckung([mail([])], ["name"]).gedeckt, "eine Freigabe ohne Umfang ist eine Zustimmung zu nichts")

console.log("\nP2 · Umfaenge sind getrennt, nicht gestuft")
p(P.deckung([mail(["name"])], ["name"]).gedeckt, "Nennung erlaubt: Nennung gedeckt")
p(!P.deckung([mail(["name"])], ["name", "logo"]).gedeckt, "Nennung erlaubt: Logo NICHT gedeckt")
p(!P.deckung([mail(["name"])], ["zitat"]).gedeckt, "Nennung erlaubt: Zitat NICHT gedeckt")
p(!P.deckung([mail(["zitat"])], ["fallstudie"]).gedeckt, "Zitat erlaubt: Fallstudie NICHT gedeckt")
p(P.deckung([mail(["name"]), mail(["logo"])], ["name", "logo"]).gedeckt,
  "zwei Freigaben ergaenzen sich")

console.log("\nP3 · Die Form begrenzt, was sie tragen kann")
const google = {
  by: { name: "Kundin", role: "Inhaberin", company: "Probe GmbH" },
  form: "oeffentlich-veroeffentlicht",
  at: "2026-05-02",
  scopes: ["zitat", "logo", "fallstudie"],
  reference: "https://maps.google.com/…",
}
p(P.deckung([google], ["zitat"]).gedeckt, "selbst veroeffentlichte Bewertung traegt das Zitat")
p(!P.deckung([google], ["logo"]).gedeckt, "aber NICHT das Logo — auch wenn es danebensteht")
p(!P.deckung([google], ["fallstudie"]).gedeckt, "und NICHT die Fallstudie")
p(P.FORM_SCOPES["oeffentlich-veroeffentlicht"].length === 1, "die Tabelle laesst genau einen Umfang zu")

console.log("\nP4 · Ein Widerruf wirkt sofort")
const widerrufen = mail(["name", "logo"], { withdrawnAt: "2026-09-08" })
p(!P.gueltig(widerrufen), "zurueckgezogene Freigabe ist ungueltig")
p(!P.deckung([widerrufen], ["name"]).gedeckt, "und deckt ab sofort nichts mehr")
p(widerrufen.withdrawnAt !== null, "der Eintrag bleibt in der Akte — man muss erklaeren koennen, warum damals")

console.log("\nP5 · Der Bedarf faellt aus dem Inhalt, nicht aus einer Angabe")
p(JSON.stringify(P.benoetigtFuerFall({ metriken: 0, hatZitat: false })) === JSON.stringify(["name", "fallstudie"]),
  "Fall ohne Zahl und ohne Zitat verlangt zwei Umfaenge")
p(P.benoetigtFuerFall({ metriken: 2, hatZitat: false }).includes("zahl"),
  "eine Kennzahl erhoeht die Huerde automatisch")
p(P.benoetigtFuerFall({ metriken: 0, hatZitat: true }).includes("zitat"),
  "ein Zitat ebenso")
p(!P.deckung([mail(["name", "fallstudie"])], P.benoetigtFuerFall({ metriken: 1, hatZitat: true })).gedeckt,
  "wer Zahl und Zitat ergaenzt, ist mit der alten Freigabe nicht mehr gedeckt")
p(P.benoetigtFuerLogo(false).length === 1 && P.benoetigtFuerLogo(true).length === 2,
  "ein Logo verlangt mehr als ein Name")
p(P.benoetigtFuerStimme({ hatFirma: false }).join() === "zitat",
  "eine Stimme ohne Firmennennung verlangt nur das Zitat")
p(P.benoetigtFuerStimme({ hatFirma: true }).includes("name"),
  "mit Firmennennung wird daraus eine Aussage ueber ein Unternehmen")

console.log("\nP6 · Eine Zahl ohne Messung ist keine Zahl")
p(!P.messquelleTraegt("intern"), "„intern“ ist keine Messquelle")
p(!P.messquelleTraegt("Schätzung"), "eine Schaetzung auch nicht")
p(!P.messquelleTraegt("   "), "Leerzeichen erst recht nicht")
p(P.messquelleTraegt("Auftragsdurchlauf Jan–Jun 2026, gemessen im Auftragssystem des Kunden"),
  "was gemessen wurde, wie lange und womit verglichen — das traegt")

console.log("\nP7 · Fehlt das Feld, faellt es zur sicheren Seite")
p(!P.deckung(undefined ?? [], ["name"]).gedeckt, "kein releases-Feld: nichts gedeckt")
p(S.genannteClientWorks.every((w) => S.namensFreigabe(w).gedeckt),
  "in der oeffentlichen Liste steht nur, was gedeckt ist")

console.log("\nP8 · Der reale Bestand — der Zustand, den G13 vorfindet")
const ungedeckt = S.clientWorks.filter((w) => !S.namensFreigabe(w).gedeckt)
p(S.clientWorks.length === 3, `drei Kundenarbeiten im Bestand`, S.clientWorks.map((w) => w.name).join(", "))
p(ungedeckt.length === 3, "keine davon hat eine hinterlegte Freigabe", "das ist der Owner-Punkt, keine Panne")
p(S.genannteClientWorks.length === 0, "also erscheint keine")
p(S.clientLogos.length === 0, "und kein Logo")
p(S.approvedCaseStudies.length === 0, "und keine Fallstudie")
p(S.registryWorks.every((w) => !ungedeckt.some((u) => u.slug === w.slug)),
  "auch das Referenzregister traegt keinen ungedeckten Namen")

console.log("\nP9 · Eigene Produkte brauchen keine Kundenfreigabe")
p(P.PROOF_KINDS["eigenes-produkt"].brauchtKundenfreigabe === false,
  "ein eigenes Produkt haengt an niemandem ausser am Owner")
p(P.PROOF_KINDS["kundenprojekt"].brauchtKundenfreigabe === true, "ein Kundenprojekt schon")
p(P.PROOF_KINDS["kundenergebnis"].brauchtKundenfreigabe === true, "ein Kundenergebnis erst recht")
p(S.registryWorks.length >= 4, "die eigenen Produkte bleiben sichtbar", `${S.registryWorks.length} Eintraege`)

console.log("\nP10 · Eine Freigabe gilt fuer einen Kunden, nicht fuer eine Liste")
const fuerA = mail(["name", "logo"])
const kundeB = { slug: "b", releases: [] }
p(!P.deckung(kundeB.releases, ["name"]).gedeckt, "die Freigabe von A deckt B nicht")
p(P.deckung([fuerA], ["name"]).gedeckt, "waehrend A gedeckt bleibt")

console.log(`\n  ${fehler === 0 ? "Ohne Freigabe erscheint nichts." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
