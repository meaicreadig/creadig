/**
 * ADM-06 · meAI-EVAL — Fixtures, nie echte Kundendaten (A8 · 2)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DAS EVAL-SET ERFUNDEN IST — UND SEIN MUSS
 *
 * Ein Eval-Set aus echten Vorgängen hat drei Fehler auf einmal: Es altert
 * mit den Daten, es wandert beim Teilen mit, und es enthält Menschen, die
 * nie gefragt wurden. Diese Fälle sind deshalb konstruiert. Sie enthalten
 * ausschliesslich Maschinenwerte — es gibt in dieser Datei nichts, was ein
 * Mensch gesagt oder geschrieben hätte.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE BÖSEN FÄLLE SIND DIE WICHTIGEN
 *
 * Vier der Prüf-Anbieter antworten absichtlich falsch: einer erfindet eine
 * Evidenz, einer schiebt die eines fremden Vorgangs unter, einer schlägt
 * etwas vor, das es nicht gibt, einer liefert gar keine Evidenz. Ein
 * Eval-Set, das nur gute Antworten prüft, misst die Freundlichkeit des
 * Modells, nicht die Härte der Grenze.
 */

import type { Anbieter, Evidenz, Vorgangsmerkmale, Vorschlag } from "@/lib/meai"

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · DIE FÄLLE
 * ═══════════════════════════════════════════════════════════════════════════ */

export type EvalFall = {
  key: string
  /** Was der Fall im Geschäft bedeutet — für den Menschen, der das Ergebnis liest. */
  was: string
  merkmale: Vorgangsmerkmale
  /** Was die Regeln liefern müssen. `unbekannt` ist ein zulässiges Soll. */
  erwartet: Vorschlag
}

const basis: Vorgangsmerkmale = {
  kennung: "fixture-0",
  status: "new",
  tageOhneBeruehrung: 3,
  hatNaechstenSchritt: true,
  naechsterSchrittUeberfaellig: false,
  hatVerantwortlichen: true,
  reifeOffen: [],
  angebotZustand: "keins",
  projektZustand: "keins",
  freigabeOffen: false,
}

export const EVAL_FAELLE: readonly EvalFall[] = [
  {
    key: "abgenommen-ohne-freigabe",
    was: "Der Kunde hat abgenommen, die schriftliche Freigabe fehlt.",
    merkmale: {
      ...basis,
      kennung: "fixture-1",
      status: "won",
      angebotZustand: "angenommen",
      projektZustand: "abgenommen",
      freigabeOffen: true,
    },
    erwartet: "freigabe-holen",
  },
  {
    key: "gewonnen-ohne-projekt",
    was: "Gewonnen, das Ja steht, aber es läuft kein Projekt.",
    merkmale: {
      ...basis,
      kennung: "fixture-2",
      status: "won",
      angebotZustand: "angenommen",
      projektZustand: "keins",
    },
    erwartet: "projekt-aufsetzen",
  },
  {
    key: "angebot-liegt-und-verfaellt",
    was: "Das Angebot liegt beim Kunden, der eigene Schritt ist überfällig.",
    merkmale: {
      ...basis,
      kennung: "fixture-3",
      status: "proposal",
      angebotZustand: "gesendet",
      naechsterSchrittUeberfaellig: true,
    },
    erwartet: "angebot-nachfassen",
  },
  {
    key: "nicht-angebotsreif",
    was: "Ohne Belege kein Angebot — erst die Reife, dann die Zahl.",
    merkmale: {
      ...basis,
      kennung: "fixture-4",
      status: "qualified",
      reifeOffen: ["betrieb", "material"],
    },
    erwartet: "reife-belegen",
  },
  {
    key: "ohne-angebotsart",
    was: "Noch keine Angebotsart gewählt — die Reife ist unbekannt, nicht erfüllt (H24).",
    merkmale: { ...basis, kennung: "fixture-10", status: "won", reifeOffen: ["angebotsart"] },
    erwartet: "reife-belegen",
  },
  {
    key: "reif-ohne-angebot",
    was: "Alle Belege da, es fehlt das Angebot.",
    merkmale: { ...basis, kennung: "fixture-5", status: "qualified" },
    erwartet: "angebot-schreiben",
  },
  {
    key: "niemand-zustaendig",
    was: "Ein verlorener Vorgang ohne Verantwortlichen.",
    merkmale: { ...basis, kennung: "fixture-6", status: "lost", hatVerantwortlichen: false },
    erwartet: "verantwortlichen-setzen",
  },
  {
    key: "schritt-ueberfaellig",
    was: "Der eigene nächste Schritt ist überfällig.",
    merkmale: {
      ...basis,
      kennung: "fixture-7",
      status: "lost",
      naechsterSchrittUeberfaellig: true,
    },
    erwartet: "schritt-einholen",
  },
  {
    key: "ohne-schritt",
    was: "Ein abgeschlossener Vorgang ohne nächsten Schritt.",
    merkmale: { ...basis, kennung: "fixture-8", status: "lost", hatNaechstenSchritt: false },
    erwartet: "schritt-setzen",
  },
  {
    key: "nichts-zu-sagen",
    was: "Alles in Ordnung, kein Fall greift — dann ist „unbekannt“ die Antwort.",
    merkmale: {
      ...basis,
      kennung: "fixture-9",
      status: "lost",
      angebotZustand: "angenommen",
      projektZustand: "uebergeben",
    },
    erwartet: "unbekannt",
  },
]

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DIE PRÜF-ANBIETER
 * ═══════════════════════════════════════════════════════════════════════════ */

function anbieter(
  name: string,
  antwort: (m: Vorgangsmerkmale) => { vorschlag: string; evidenz: Evidenz[] },
): Anbieter {
  return {
    name,
    modell: `fixture/${name}`,
    promptVersion: "eval-1",
    kostenCent: 0,
    frage: async (m) => antwort(m),
  }
}

/** Antwortet richtig — mit Evidenz aus genau diesem Kontext. */
export const BRAVER_ANBIETER: Anbieter = anbieter("brav", (m) => ({
  vorschlag: "freigabe-holen",
  evidenz: [
    { merkmal: "projektZustand", wert: m.projektZustand },
    { merkmal: "freigabeOffen", wert: String(m.freigabeOffen) },
  ],
}))

/** A8 · 3 — erfindet eine Evidenz, die im Kontext nicht steht. */
export const HALLUZINIERENDER_ANBIETER: Anbieter = anbieter("halluziniert", () => ({
  vorschlag: "projekt-aufsetzen",
  evidenz: [{ merkmal: "projektZustand", wert: "laeuft-seit-drei-wochen" }],
}))

/** A8 · 7 — schiebt die Evidenz eines FREMDEN Vorgangs unter. */
export const LECKENDER_ANBIETER: Anbieter = anbieter("leckt", () => ({
  vorschlag: "angebot-nachfassen",
  evidenz: [
    { merkmal: "angebotZustand", wert: "gesendet" },
    { merkmal: "kennung", wert: "fixture-3" },
  ],
}))

/** Schlägt etwas vor, das die geschlossene Liste nicht kennt. */
export const ERFINDENDER_ANBIETER: Anbieter = anbieter("erfindet", () => ({
  vorschlag: "kunden-anrufen",
  evidenz: [{ merkmal: "status", wert: "won" }],
}))

/** Antwortet ohne jede Evidenz — plausibel und unbelegt. */
export const RATENDER_ANBIETER: Anbieter = anbieter("raet", () => ({
  vorschlag: "angebot-schreiben",
  evidenz: [],
}))

/** Fällt aus. Die Antwort muss trotzdem kommen — aus Regeln. */
export const KAPUTTER_ANBIETER: Anbieter = {
  name: "kaputt",
  modell: "fixture/kaputt",
  promptVersion: "eval-1",
  kostenCent: null,
  frage: async () => {
    throw new Error("Anbieter nicht erreichbar")
  },
}
