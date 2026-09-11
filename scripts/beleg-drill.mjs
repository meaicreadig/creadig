/*
 * ===========================================================================
 * BELEG-PROBELAUF — DIE ANGRIFFE AUF DIE EIGENEN SICHERUNGEN
 * ===========================================================================
 *
 * PROOF OPERATIONS · PHASE P1.
 *
 * Ein Beleg-System wird nicht dadurch gut, dass es Belege verwaltet. Es wird
 * dadurch gut, dass es sich weigert.
 *
 * Dieser Lauf versucht deshalb genau das, was ein spaeterer Lauf, ein
 * eiliger Mensch oder ein hilfsbereites Werkzeug versuchen wird:
 *
 *   eine Fallstudie ohne Freigabe veroeffentlichen,
 *   aus einer Namensfreigabe ein Logo machen,
 *   aus einer Google-Bewertung eine Fallstudie,
 *   eine Verbesserung aus einem einzigen Wert errechnen,
 *   zwei unvergleichbare Messungen vergleichen,
 *   eine Schaetzung als Zahl veroeffentlichen,
 *   ein gesperrtes Bild ausliefern,
 *   einen Vertrag durch eine Umgebungsvariable bestaetigen.
 *
 * Jeder dieser Versuche MUSS scheitern.
 */
import {
  deckung,
  benoetigtFuerFall,
  benoetigtFuerLogo,
  gedeckteScopes,
  messquelleTraegt,
} from "@/lib/proof"
import {
  MIND_ABSTAND_TAGE,
  MIND_FAELLE,
  probeTraegt,
  quelleTraegt,
  vergleiche,
} from "@/lib/messreihe"
import { assets, darfOeffentlich, bildFuerOeffentlich } from "@/lib/asset-sicherheit"
import { alleWahrheiten, bestaetigungVollstaendig, traegtAussage } from "@/lib/owner-wahrheit"
import { belegposten, naechsteSchritte, uebersicht, wirksamsterSchritt } from "@/lib/beleg-betrieb"
import { fiberoKennzahlen, HISTORISCHER_VORHERSTAND_VORHANDEN } from "@/lib/fibero-messung"
import { approvedCaseStudies, genannteClientWorks, caseStudies } from "@/lib/site-data"

let fehler = 0
let geprueft = 0
function pruefe(name, bedingung, detail = "") {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  FEHL  ${name}${detail ? `\n        ${detail}` : ""}`)
  }
}

const kennzahl = (art = "aufwand", quelle = "system-zaehlung") => ({
  key: "probe-kennzahl",
  subjekt: "test",
  art,
  definition: "Testkennzahl",
  einheit: "Minuten",
  quelle,
  ausgenommen: "—",
  verantwortlich: "Test",
  startetAm: "2026-01-01",
})
const probe = (seite, am, wert, faelle = 100, quelle = "system-zaehlung") => ({
  kennzahl: "probe-kennzahl",
  seite,
  am,
  wert,
  faelle,
  quelle,
  von: "Test",
  notiz: null,
})

/* ======================================================================= *
 * 1 · FREIGABE — KEIN KUNDENNAME OHNE SCHRIFTLICHE ZUSTIMMUNG
 * ======================================================================= */

pruefe("ohne Freigabe ist nichts gedeckt", !deckung([], ["name"]).gedeckt)
pruefe(
  "ohne Freigabe nennt der Grund die fehlende Spalte",
  deckung([], ["name", "fallstudie"]).fehlend.length === 2,
)

const mailFreigabe = {
  by: { name: "A. Muster", role: "Geschäftsführung", company: "Musterbetrieb" },
  form: "e-mail",
  at: "2026-09-01",
  scopes: ["name"],
  reference: "Postfach info@creadig.de, Betreff Freigabe",
}
pruefe("Namensfreigabe deckt den Namen", deckung([mailFreigabe], ["name"]).gedeckt)
pruefe(
  "Namensfreigabe deckt KEIN Logo",
  !deckung([mailFreigabe], benoetigtFuerLogo(true)).gedeckt,
  "Wer den Namen nennen darf, darf kein Logo zeigen.",
)
pruefe(
  "Namensfreigabe deckt KEINE Fallstudie",
  !deckung([mailFreigabe], benoetigtFuerFall({ metriken: 0, hatZitat: false })).gedeckt,
)

/* Eine oeffentliche Bewertung traegt ein Zitat — und sonst nichts. */
const bewertung = {
  by: { name: "B. Muster", role: "Inhaber", company: "Musterbetrieb" },
  form: "oeffentlich-veroeffentlicht",
  at: "2026-08-01",
  scopes: ["name", "logo", "fallstudie", "zahl", "zitat"],
  reference: "https://example.com/bewertung",
}
const ausBewertung = gedeckteScopes([bewertung])
pruefe("öffentliche Bewertung deckt das Zitat", ausBewertung.has("zitat"))
pruefe(
  "öffentliche Bewertung deckt NICHT das Logo",
  !ausBewertung.has("logo"),
  "Die freundlichste Quelle darf nicht die weitreichendste Erlaubnis erzeugen.",
)
pruefe("öffentliche Bewertung deckt KEINE Fallstudie", !ausBewertung.has("fallstudie"))

/* Zurueckgezogen wirkt sofort. */
const zurueckgezogen = { ...mailFreigabe, withdrawnAt: "2026-09-10" }
pruefe("zurückgezogene Freigabe deckt nichts", !deckung([zurueckgezogen], ["name"]).gedeckt)

/* Der Bedarf waechst mit dem Inhalt — er laesst sich nicht kleinschreiben. */
pruefe(
  "eine Kennzahl erhöht die Freigabehürde",
  benoetigtFuerFall({ metriken: 1, hatZitat: false }).includes("zahl"),
)
pruefe(
  "ein Zitat erhöht die Freigabehürde",
  benoetigtFuerFall({ metriken: 0, hatZitat: true }).includes("zitat"),
)

/* ======================================================================= *
 * 2 · MESSUNG — KEINE VERBESSERUNG OHNE ZWEI VERGLEICHBARE WERTE
 * ======================================================================= */

pruefe("ohne Proben kein Urteil", vergleiche(kennzahl(), []).urteil === "nicht-vergleichbar")

pruefe(
  "nur ein Ausgangswert ergibt keine Verbesserung",
  vergleiche(kennzahl(), [probe("ausgang", "2026-01-01", 30)]).urteil === "nicht-vergleichbar",
)
pruefe(
  "nur ein Wert danach ergibt keine Verbesserung",
  vergleiche(kennzahl(), [probe("danach", "2026-06-01", 10)]).urteil === "nicht-vergleichbar",
)

/* Der Normalfall, der tragen MUSS. */
{
  const v = vergleiche(kennzahl(), [
    probe("ausgang", "2026-01-01", 30),
    probe("danach", "2026-06-01", 18),
  ])
  pruefe("echte Verbesserung wird erkannt", v.urteil === "verbessert", JSON.stringify(v))
  pruefe("Unterschied in der Einheit", v.unterschied === -12)
  pruefe("Prozent aus der Basis gerechnet", Math.abs(v.prozent - 40) < 1e-9)
  pruefe("öffentlich verwendbar", v.oeffentlichVerwendbar)
}

/* Verschlechterung wird NICHT als Verbesserung gelesen. */
{
  const v = vergleiche(kennzahl(), [
    probe("ausgang", "2026-01-01", 10),
    probe("danach", "2026-06-01", 18),
  ])
  pruefe("Verschlechterung wird benannt", v.urteil === "verschlechtert")
  pruefe("Unterschied ist positiv", v.unterschied === 8)
}

/* Zu kurzer Abstand. */
{
  const v = vergleiche(kennzahl(), [
    probe("ausgang", "2026-01-01", 30),
    probe("danach", "2026-01-15", 10),
  ])
  pruefe(
    `unter ${MIND_ABSTAND_TAGE} Tagen kein Urteil`,
    v.urteil === "nicht-vergleichbar",
    v.grund,
  )
}

/* Zu wenige Faelle. */
{
  const v = vergleiche(kennzahl(), [
    probe("ausgang", "2026-01-01", 30, 5),
    probe("danach", "2026-06-01", 10, 5),
  ])
  pruefe(`unter ${MIND_FAELLE} Fällen kein Urteil`, v.urteil === "nicht-vergleichbar", v.grund)
}

/* Unterschiedliche Quellen. */
{
  const v = vergleiche(kennzahl(), [
    probe("ausgang", "2026-01-01", 30, 100, "system-zaehlung"),
    probe("danach", "2026-06-01", 10, 100, "handaufschrieb"),
  ])
  pruefe("zwei Quellen ergeben keinen Vergleich", v.urteil === "nicht-vergleichbar", v.grund)
}

/* Schaetzungen tragen nichts. */
pruefe("Schätzung ist keine tragende Quelle", !quelleTraegt("schaetzung"))
{
  const v = vergleiche(kennzahl("aufwand", "schaetzung"), [
    probe("ausgang", "2026-01-01", 30, 100, "schaetzung"),
    probe("danach", "2026-06-01", 10, 100, "schaetzung"),
  ])
  pruefe("geschätzte Werte ergeben keinen Vergleich", v.urteil === "nicht-vergleichbar", v.grund)
}

/* Eine Mengenangabe ist keine Verbesserung. */
{
  const v = vergleiche(kennzahl("menge"), [
    probe("ausgang", "2026-01-01", 100),
    probe("danach", "2026-06-01", 60),
  ])
  pruefe("weniger Vorgänge ist keine Verbesserung", v.urteil === "nicht-vergleichbar", v.grund)
  pruefe("und nicht öffentlich verwendbar", !v.oeffentlichVerwendbar)
}

/* Einzelne Proben. */
pruefe("Probe ohne Erheber trägt nicht", !probeTraegt({ ...probe("ausgang", "2026-01-01", 5), von: "" }).traegt)
pruefe("Probe ohne Datum trägt nicht", !probeTraegt({ ...probe("ausgang", "kein-datum", 5) }).traegt)
pruefe(
  "Probe mit zu wenigen Fällen trägt nicht",
  !probeTraegt(probe("ausgang", "2026-01-01", 5, 3)).traegt,
)
pruefe("geschätzte Probe trägt nicht", !probeTraegt(probe("ausgang", "2026-01-01", 5, 100, "schaetzung")).traegt)
pruefe("vollständige Probe trägt", probeTraegt(probe("ausgang", "2026-01-01", 5, 100)).traegt)

/* Eine Kennzahlquelle ohne Substanz. */
pruefe("das Wort intern ist keine Messquelle", !messquelleTraegt("intern"))
pruefe("eine benannte Abfrage ist eine", messquelleTraegt("Abfrage über work_objects, Zeitraum Q3"))

/* ======================================================================= *
 * 3 · MATERIAL — EIN GESPERRTES BILD WIRD NIE ÖFFENTLICH
 * ======================================================================= */

for (const a of assets) {
  if (a.echteDaten === true) {
    pruefe(`${a.subjekt}: echte Daten bleiben gesperrt`, !darfOeffentlich(a.lage), a.lage)
    pruefe(`${a.subjekt}: kein Pfad nach außen`, bildFuerOeffentlich(a.subjekt) === null)
  }
}
pruefe("fibero ist freigegeben", darfOeffentlich(assets.find((a) => a.subjekt === "fibero").lage))
pruefe("meAI ist freigegeben", darfOeffentlich(assets.find((a) => a.subjekt === "meai").lage))
pruefe("CASSAMEA bleibt gesperrt", !darfOeffentlich(assets.find((a) => a.subjekt === "cassamea").lage))
pruefe("meahv bleibt gesperrt", !darfOeffentlich(assets.find((a) => a.subjekt === "meahv").lage))
pruefe(
  "ein unbekanntes Subjekt ist gesperrt, nicht erlaubt",
  bildFuerOeffentlich("gibt-es-nicht") === null,
)
for (const a of assets.filter((x) => !darfOeffentlich(x.lage))) {
  pruefe(`${a.subjekt}: sagt, was fehlt`, Boolean(a.fehlt && a.fehlt.length > 30))
}

/* ======================================================================= *
 * 4 · OWNER-WAHRHEIT — EINE KONFIGURATION IST KEIN VERTRAG
 * ======================================================================= */

for (const w of alleWahrheiten) {
  pruefe(`${w.key}: Bestätigung ist vollständig oder nicht behauptet`, bestaetigungVollstaendig(w).ok)
  if (!traegtAussage(w.stand)) {
    pruefe(`${w.key}: nennt den Weg zur Auflösung`, w.aufloesungDurch.length > 20)
    pruefe(`${w.key}: nennt, was es freigibt`, w.gibtFrei.length > 20)
  }
}
for (const key of ["avv-vercel", "avv-resend", "avv-neon"]) {
  const w = alleWahrheiten.find((x) => x.key === key)
  pruefe(`${key}: nicht automatisch bestätigt`, !traegtAussage(w.stand), w.stand)
}
/* Eine Bestaetigung ohne Fundstelle muss auffallen. */
{
  const gefaelscht = { ...alleWahrheiten[0], stand: "bestaetigt", fundstelle: null }
  pruefe("bestätigt ohne Fundstelle fällt auf", !bestaetigungVollstaendig(gefaelscht).ok)
}
for (const key of ["kapazitaet-projekte", "kapazitaet-betrieb", "vertretung-ausfall"]) {
  const w = alleWahrheiten.find((x) => x.key === key)
  pruefe(`${key}: kein erfundener Vorgabewert`, w.stand === "unbekannt", w.stand)
}

/* ======================================================================= *
 * 5 · fibero — KEIN VORHER, DAS ES NIE GAB
 * ======================================================================= */

pruefe("kein historischer Vorher-Stand behauptet", HISTORISCHER_VORHERSTAND_VORHANDEN === false)
pruefe("Kennzahlen sind definiert", fiberoKennzahlen.length >= 3)
for (const k of fiberoKennzahlen) {
  pruefe(`${k.key}: hat eine Definition`, k.definition.length > 40)
  pruefe(`${k.key}: nennt, was nicht mitzählt`, k.ausgenommen.length > 10)
  pruefe(`${k.key}: hat einen Verantwortlichen`, k.verantwortlich.length > 1)
  pruefe(`${k.key}: das Wort vorher kommt nicht vor`, !/vorher/i.test(k.definition))
}

/* ======================================================================= *
 * 6 · DIE ZUSAMMENSTELLUNG
 * ======================================================================= */

const u = uebersicht([])
pruefe("null freigegebene Kundenfälle", u.kundenfaelleOeffentlich === 0)
pruefe("und die Quelle sagt dasselbe", approvedCaseStudies.length === 0)
pruefe("null genannte Kundenarbeiten", genannteClientWorks.length === 0)
pruefe(
  "kein Kunde wurde automatisch zum Fall",
  belegposten([]).filter((p) => p.key.startsWith("fall-")).length === caseStudies.length,
  "Die Fallliste darf nur aus bewusst angelegten Faellen entstehen.",
)
pruefe("es gibt einen wirksamsten Schritt", wirksamsterSchritt([]) !== null)
pruefe(
  "jeder offene Posten sagt, was fehlt",
  naechsteSchritte([]).every((p) => p.fehlt && p.fehlt.length > 20),
)
pruefe(
  "jeder offene Posten hat einen Adressaten",
  naechsteSchritte([]).every((p) => ["owner", "kunde", "zeit"].includes(p.liegtBei)),
)
/* Was nur abgewartet werden kann, steht nicht oben. */
{
  const reihe = naechsteSchritte([])
  const ersteZeit = reihe.findIndex((p) => p.liegtBei === "zeit")
  pruefe(
    "zeitgebundene Posten stehen unten",
    ersteZeit === -1 || reihe.slice(ersteZeit).every((p) => p.liegtBei === "zeit"),
  )
}

/* P2 · Market Proof ≠ Internal Measured Proof */
{
  const fiberoMessung = belegposten([]).find((p) => p.key === "fibero-messung")
  pruefe(
    "fibero-Messung ist kein Kundenergebnis",
    fiberoMessung?.art === "eigenes-produkt",
    fiberoMessung?.art,
  )
  pruefe(
    "fibero-Messung behauptet keinen Kunden-Outcome",
    Boolean(fiberoMessung?.aussage && /Internal Measured|kein Kunden/i.test(fiberoMessung.aussage)),
  )
  const erster = wirksamsterSchritt([])
  pruefe(
    "ohne öffentlichen Kundenbeleg führt der Freigabe-Pfad",
    Boolean(erster && (erster.art === "kundenprojekt" || erster.art === "kundenergebnis")),
    erster?.key,
  )
  pruefe(
    "der wirksamste Schritt ist nicht die fibero-Messung",
    erster?.key !== "fibero-messung",
    erster?.key,
  )
}

/* ======================================================================= *
 * 7 · DER DURCHLAUF VON ENDE ZU ENDE
 *
 * Mit ERFUNDENEN Daten — kein echter Kunde wird hier aktiviert, keine Zeile
 * geschrieben. Der Lauf beweist nur, dass die Kette traegt, wenn eines Tages
 * eine echte Freigabe eintrifft: Kandidat → Beleg → Freigabe → oeffentlich.
 *
 * Das ist der Unterschied zwischen einem dokumentierten Prozess und einem
 * gebauten. Ein dokumentierter faellt beim ersten echten Fall auf.
 * ======================================================================= */

const MUSTER = { name: "Anke Rehberg", role: "Geschäftsführung", company: "Musterbetrieb Nord GmbH" }

/* --- Stufe 1 · Kandidat ohne alles ------------------------------------- */
{
  const noetig = benoetigtFuerFall({ metriken: 0, hatZitat: false })
  const d = deckung([], noetig)
  pruefe("E2E 1: Kandidat ist nicht veröffentlichbar", !d.gedeckt)
  pruefe("E2E 1: und sagt, was fehlt", d.fehlend.length === noetig.length)
}

/* --- Stufe 2 · Freigabe fuer Name und Fallstudie ----------------------- */
const freigabeFall = {
  by: MUSTER,
  form: "e-mail",
  at: "2026-09-11",
  scopes: ["name", "fallstudie"],
  reference: "Postfach info@creadig.de, Ordner Freigaben",
}
{
  const d = deckung([freigabeFall], benoetigtFuerFall({ metriken: 0, hatZitat: false }))
  pruefe("E2E 2: Fall ohne Kennzahl ist jetzt gedeckt", d.gedeckt, d.grund)
}

/* --- Stufe 3 · eine Kennzahl hebt die Huerde, ohne dass jemand es sagt -- */
{
  const d = deckung([freigabeFall], benoetigtFuerFall({ metriken: 1, hatZitat: false }))
  pruefe(
    "E2E 3: eine Kennzahl macht denselben Fall wieder ungedeckt",
    !d.gedeckt && d.fehlend.includes("zahl"),
    "Der Bedarf faellt aus dem INHALT — er laesst sich nicht kleinschreiben.",
  )
}

/* --- Stufe 4 · Zahl freigegeben, aber ohne Messung nutzlos -------------- */
const freigabeZahl = { ...freigabeFall, scopes: ["name", "fallstudie", "zahl"] }
{
  const d = deckung([freigabeZahl], benoetigtFuerFall({ metriken: 1, hatZitat: false }))
  pruefe("E2E 4: mit Zahl-Freigabe wieder gedeckt", d.gedeckt)
  /* Aber die Zahl selbst braucht trotzdem eine tragende Quelle. */
  pruefe(
    "E2E 4: die Freigabe ersetzt keine Messquelle",
    !messquelleTraegt("intern"),
    "Freigabe und Beleg sind zwei verschiedene Bedingungen.",
  )
}

/* --- Stufe 5 · Zitat bleibt eine eigene Erlaubnis ---------------------- */
{
  const d = deckung([freigabeZahl], benoetigtFuerFall({ metriken: 1, hatZitat: true }))
  pruefe(
    "E2E 5: Fallstudien-Freigabe deckt kein Zitat",
    !d.gedeckt && d.fehlend.includes("zitat"),
  )
}

/* --- Stufe 6 · Widerruf wirkt sofort ----------------------------------- */
{
  const widerrufen = { ...freigabeZahl, withdrawnAt: "2026-10-01" }
  const d = deckung([widerrufen], benoetigtFuerFall({ metriken: 1, hatZitat: false }))
  pruefe("E2E 6: Widerruf nimmt die Deckung zurück", !d.gedeckt)
}

/* --- Stufe 7 · die Messkette, vollstaendig ----------------------------- */
{
  const k = kennzahl()
  const ausgang = probe("ausgang", "2026-09-11", 24, 180)
  pruefe("E2E 7a: Ausgangsprobe trägt", probeTraegt(ausgang).traegt)
  pruefe(
    "E2E 7b: allein ergibt sie keine Wirkung",
    vergleiche(k, [ausgang]).urteil === "nicht-vergleichbar",
  )
  const zuFrueh = probe("danach", "2026-09-25", 18, 180)
  pruefe(
    "E2E 7c: vierzehn Tage später zählt nicht",
    vergleiche(k, [ausgang, zuFrueh]).urteil === "nicht-vergleichbar",
  )
  const danach = probe("danach", "2026-12-01", 18, 180)
  const v = vergleiche(k, [ausgang, danach])
  pruefe("E2E 7d: nach 81 Tagen trägt der Vergleich", v.urteil === "verbessert", v.grund)
  pruefe("E2E 7e: und ist öffentlich verwendbar", v.oeffentlichVerwendbar)
  pruefe("E2E 7f: mit Prozent aus der Basis", Math.abs(v.prozent - 25) < 1e-9)
}

/* --- Stufe 8 · Material: gesperrt bleibt gesperrt, bis es ersetzt wird -- */
{
  const gesperrt = assets.find((a) => a.echteDaten === true)
  pruefe("E2E 8: es gibt einen gesperrten Posten", Boolean(gesperrt))
  pruefe("E2E 8: er nennt den Ersatz, nicht nur den Mangel", /Demo-Instanz/.test(gesperrt.fehlt))
}

console.log(`\nBeleg-Probelauf — ${geprueft} Pruefungen`)
if (fehler > 0) {
  console.error(`FEHL — ${fehler} Sicherung(en) haben nicht gehalten.\n`)
  process.exit(1)
}
console.log("OK — jede Abkuerzung ist an einer Sicherung gescheitert.\n")
