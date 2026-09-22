#!/usr/bin/env node
/**
 * ADM-06 · B12 — DER meAI-QUALITÄTSVERTRAG, PUNKT FÜR PUNKT
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER ABGENOMMEN WIRD
 *
 * A8 zählt acht Pflichten auf. Sieben davon lassen sich beweisen, ohne dass
 * ein Anbieter angeschlossen ist — und genau das geschieht hier, gegen
 * Fixtures, nie gegen echte Kundendaten.
 *
 *   M1  Versionierung: Modell, Prompt und Vertrag an JEDER Ausgabe
 *   M2  Eval-Set aus Fixtures — und es enthaelt nichts Menschliches
 *   M3  Halluzination: erfundene Evidenz → „unbekannt"
 *   M4  Latenz und Kosten je Aufruf
 *   M5  PII-Grenze: was das Haus verlaesst, steht in einer Liste
 *   M6  Degraded Mode: ohne KI bleibt die Antwort brauchbar (A30)
 *   M7  Cross-Record-Leakage: die Antwort zu X enthaelt nichts aus Y
 *   M8  Anbieter und Kosten sind Owner-Entscheidung — hier steht keiner
 *
 * Aufruf: node --import ./scripts/lib/alias-hook.mjs scripts/meai-drill.mjs
 */
import {
  ERLAUBTE_MERKMALE,
  MEAI_BEFUNDE,
  MEAI_VERTRAG_VERSION,
  VORSCHLAEGE,
  evidenzenAus,
  naechsterSchritt,
  pruefe,
  pruefePIIGrenze,
  regelbasiert,
} from "@/lib/meai"
import {
  BRAVER_ANBIETER,
  ERFINDENDER_ANBIETER,
  EVAL_FAELLE,
  HALLUZINIERENDER_ANBIETER,
  KAPUTTER_ANBIETER,
  LECKENDER_ANBIETER,
  RATENDER_ANBIETER,
} from "@/lib/meai-eval"
import { de } from "@/lib/admin-i18n/de"
import { tr } from "@/lib/admin-i18n/tr"

let fehler = 0
const p = (ok, name, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

const fall = (key) => EVAL_FAELLE.find((f) => f.key === key)

/* ═══ M6/A30 · Degraded Mode zuerst ══════════════════════════════════════
 *
 * Bewusst der erste Abschnitt: Wenn die regelbasierte Antwort nicht taugt,
 * ist alles Weitere eine Verschoenerung. A30 muss OHNE KI bestehen.
 */
console.log("\nM6 · Ohne KI ist die Antwort nicht leer (A30)")
for (const f of EVAL_FAELLE) {
  const r = regelbasiert(f.merkmale)
  p(r.vorschlag === f.erwartet, `${f.key} → ${f.erwartet}`, r.vorschlag)
}
{
  const ohne = await naechsterSchritt(fall("gewonnen-ohne-projekt").merkmale, null)
  p(ohne.quelle === "regel", "ohne Anbieter kommt die Antwort aus Regeln")
  p(ohne.vorschlag === "projekt-aufsetzen", "und sie ist dieselbe wie oben")
  p(ohne.vertrauen === "belegt", "sie ist belegt")
  p(ohne.befund === "kein-anbieter", "und sagt, warum sie aus Regeln kommt", String(ohne.befund))
  p(ohne.evidenz.length === 3, "mit ihren Evidenzen", String(ohne.evidenz.length))
}
{
  /* Wo keine Regel greift, ist „unbekannt" die Antwort — nicht die am wenigsten falsche. */
  const leer = regelbasiert(fall("nichts-zu-sagen").merkmale)
  p(leer.vorschlag === "unbekannt" && leer.evidenz.length === 0, "kein Fall greift → unbekannt, ohne Evidenz")
}

/* ═══ M1 · Versionierung ═════════════════════════════════════════════════ */
console.log("\nM1 · Jede Ausgabe traegt ihre Versionen")
{
  const a = await naechsterSchritt(fall("abgenommen-ohne-freigabe").merkmale, BRAVER_ANBIETER)
  p(a.modell === "fixture/brav", "Modell an der Ausgabe", a.modell)
  p(a.promptVersion === "eval-1", "Promptversion an der Ausgabe", a.promptVersion)
  p(a.vertragVersion === MEAI_VERTRAG_VERSION, "Vertragsversion an der Ausgabe", a.vertragVersion)
  const r = await naechsterSchritt(fall("abgenommen-ohne-freigabe").merkmale, null)
  p(r.modell === "regelwerk" && r.vertragVersion === MEAI_VERTRAG_VERSION, "auch die regelbasierte Ausgabe")
}

/* ═══ M4 · Latenz und Kosten ═════════════════════════════════════════════ */
console.log("\nM4 · Latenz und Kosten je Aufruf")
{
  const a = await naechsterSchritt(fall("abgenommen-ohne-freigabe").merkmale, BRAVER_ANBIETER)
  p(typeof a.dauerMs === "number" && a.dauerMs >= 0, "Dauer gemessen", `${a.dauerMs} ms`)
  p(a.kostenCent === 0, "Kosten des Pruefanbieters: 0", String(a.kostenCent))
  const k = await naechsterSchritt(fall("abgenommen-ohne-freigabe").merkmale, KAPUTTER_ANBIETER)
  p(k.kostenCent === 0, "bei Ausfall zaehlt die regelbasierte Antwort — 0 Cent")
  p(KAPUTTER_ANBIETER.kostenCent === null, "ein Anbieter ohne Kostenangabe meldet `null`, nicht 0")
}

/* ═══ M3 · Halluzination ═════════════════════════════════════════════════ */
console.log("\nM3 · Erfundene Evidenz wird nicht geglaubt")
{
  const m = fall("gewonnen-ohne-projekt").merkmale
  const a = await naechsterSchritt(m, HALLUZINIERENDER_ANBIETER)
  p(a.vorschlag === "unbekannt", "der Vorschlag faellt auf „unbekannt“", a.vorschlag)
  p(a.vertrauen === "unbekannt", "und traegt kein Vertrauen")
  p(a.befund === "evidenz-nicht-im-kontext", "mit benanntem Befund", String(a.befund))
  p(a.evidenz.length === 0, "die erfundene Evidenz wird nicht mitgeschleppt")

  const ohneBeleg = await naechsterSchritt(m, RATENDER_ANBIETER)
  p(ohneBeleg.befund === "keine-evidenz", "eine Antwort ohne Evidenz ist geraten", String(ohneBeleg.befund))
  p(ohneBeleg.vorschlag === "unbekannt", "und wird verworfen")

  const erfunden = await naechsterSchritt(m, ERFINDENDER_ANBIETER)
  p(erfunden.befund === "unbekannter-vorschlag", "ein Vorschlag ausserhalb der Liste ebenso", String(erfunden.befund))
}

/* ═══ M7 · Cross-Record-Leakage ══════════════════════════════════════════ */
console.log("\nM7 · Die Antwort zu X enthaelt nichts aus Y")
{
  const x = fall("gewonnen-ohne-projekt").merkmale
  const y = fall("angebot-liegt-und-verfaellt").merkmale
  const a = await naechsterSchritt(x, LECKENDER_ANBIETER)
  p(a.vorschlag === "unbekannt", "die untergeschobene Evidenz wird abgelehnt", a.vorschlag)
  p(a.befund === "evidenz-nicht-im-kontext", "als derselbe Befund wie eine Halluzination", String(a.befund))
  p(
    !JSON.stringify(a).includes(y.kennung),
    "und die fremde Kennung taucht in der Ausgabe nicht auf",
  )
  /* Die Gegenprobe: Gegen den RICHTIGEN Vorgang waere dieselbe Antwort gueltig. */
  const gegenY = pruefe(
    { vorschlag: "angebot-nachfassen", evidenz: [{ merkmal: "angebotZustand", wert: "gesendet" }] },
    y,
  )
  p(gegenY.vertrauen === "belegt", "dieselbe Evidenz traegt bei ihrem eigenen Vorgang")
}

/* ═══ M5 · PII-Grenze ════════════════════════════════════════════════════ */
console.log("\nM5 · Was das Haus verlaesst, steht in einer Liste")
{
  const m = fall("gewonnen-ohne-projekt").merkmale
  p(pruefePIIGrenze(m).sauber, "ein sauberer Kontext geht durch")
  p(
    Object.keys(m).every((k) => ERLAUBTE_MERKMALE.includes(k)),
    "die Merkmale sind genau die erlaubten",
    Object.keys(m).filter((k) => !ERLAUBTE_MERKMALE.includes(k)).join(", "),
  )
  const mitName = { ...m, name: "Frau Beispiel" }
  p(!pruefePIIGrenze(mitName).sauber, "ein zusaetzliches Feld faellt auf")
  const mitMail = { ...m, status: "kontakt@beispiel.de" }
  p(!pruefePIIGrenze(mitMail).sauber, "eine Mailadresse in einem erlaubten Feld faellt auch auf")
  const mitSatz = { ...m, status: "der Kunde hat angerufen" }
  p(!pruefePIIGrenze(mitSatz).sauber, "und ein ganzer Satz ebenso")
  const mitTelefon = { ...m, status: "+4915112345678" }
  p(!pruefePIIGrenze(mitTelefon).sauber, "eine Telefonnummer ebenso")

  /* Und die Wirkung: Ein unsauberer Kontext wird gar nicht erst gefragt. */
  let gefragt = false
  const spion = {
    ...BRAVER_ANBIETER,
    frage: async () => {
      gefragt = true
      return { vorschlag: "unbekannt", evidenz: [] }
    },
  }
  const abgewiesen = await naechsterSchritt({ ...m, name: "Frau Beispiel" }, spion)
  p(!gefragt, "ein unsauberer Kontext erreicht den Anbieter NICHT")
  p(
    abgewiesen.befund === "pii-grenze" && abgewiesen.quelle === "regel",
    "und die Antwort sagt, warum — aus Regeln, Befund pii-grenze",
    `${abgewiesen.quelle}/${abgewiesen.befund}`,
  )
}

/* ═══ M2 · Das Eval-Set ist erfunden ═════════════════════════════════════ */
console.log("\nM2 · Das Eval-Set enthaelt nichts Menschliches")
{
  const roh = JSON.stringify(EVAL_FAELLE.map((f) => f.merkmale))
  p(!/@/.test(roh), "keine Mailadresse")
  p(!/\+\d{6,}/.test(roh), "keine Telefonnummer")
  p(EVAL_FAELLE.every((f) => f.merkmale.kennung.startsWith("fixture-")), "nur Fixture-Kennungen")
  p(EVAL_FAELLE.every((f) => pruefePIIGrenze(f.merkmale).sauber), "jeder Fall haelt die PII-Grenze")
  p(EVAL_FAELLE.length >= 9, `${EVAL_FAELLE.length} Faelle`)
  p(
    new Set(EVAL_FAELLE.map((f) => f.erwartet)).size >= 8,
    "und sie decken fast jeden moeglichen Vorschlag ab",
    String(new Set(EVAL_FAELLE.map((f) => f.erwartet)).size),
  )
}

/* ═══ M8 · Kein Anbieter ist eingerichtet ════════════════════════════════ */
console.log("\nM8 · Anbieter und Kosten bleiben eine Owner-Entscheidung")
{
  p(
    !process.env.MEAI_ANBIETER && !process.env.MEAI_API_KEY,
    "keine Anbieter-Variable in dieser Umgebung",
  )
  const ohne = await naechsterSchritt(fall("nicht-angebotsreif").merkmale, null)
  p(ohne.quelle === "regel" && ohne.vorschlag === "reife-belegen", "und der Admin arbeitet trotzdem")
}

/* ═══ Texte ══════════════════════════════════════════════════════════════ */
console.log("\nTexte · jeder Maschinenwert in DE und TR")
for (const v of VORSCHLAEGE) {
  p(Boolean(de.meai?.vorschlag?.[v]), `DE meai.vorschlag.${v}`)
  p(Boolean(tr.meai?.vorschlag?.[v]), `TR meai.vorschlag.${v}`)
}
for (const m of ERLAUBTE_MERKMALE) {
  if (m === "kennung") continue
  p(Boolean(de.meai?.merkmal?.[m]), `DE meai.merkmal.${m}`)
  p(Boolean(tr.meai?.merkmal?.[m]), `TR meai.merkmal.${m}`)
}
for (const b of MEAI_BEFUNDE) {
  p(Boolean(de.meai?.befund?.[b]), `DE meai.befund.${b}`)
  p(Boolean(tr.meai?.befund?.[b]), `TR meai.befund.${b}`)
}
/*
 * H21 — ein Beleg steht in der Sprache des Menschen, nicht als „true".
 * Stufe und Reife haben eigene Woerterbuecher; alle anderen Werte hier.
 */
{
  const werte = new Set()
  for (const f of EVAL_FAELLE) {
    for (const e of evidenzenAus(f.merkmale)) {
      if (!["status", "reifeOffen", "tageOhneBeruehrung"].includes(e.merkmal)) werte.add(e.wert)
    }
  }
  for (const w of ["true", "false", "keins", "entwurf", "gesendet", "angenommen", "aufgesetzt", "laeuft", "abgenommen", "uebergeben"]) werte.add(w)
  for (const w of werte) {
    p(Boolean(de.meai?.wert?.[w]) && Boolean(tr.meai?.wert?.[w]), `DE/TR meai.wert.${w}`)
  }
}
{
  const e = evidenzenAus(fall("abgenommen-ohne-freigabe").merkmale)
  p(e.length >= 7, `ein Kontext gibt ${e.length} Evidenzen her`)
}

console.log(
  fehler === 0
    ? "\nAlle Pruefungen bestanden — der meAI-Vertrag haelt, auch ohne Anbieter.\n"
    : `\nABGEBROCHEN — ${fehler} Befund(e)\n`,
)
process.exit(fehler ? 1 : 0)
