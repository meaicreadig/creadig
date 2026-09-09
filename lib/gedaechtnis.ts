/**
 * G28 · BETRIEBSGEDAECHTNIS — einheitlicher Kontext, Abruf, Belegpflicht.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS FEHLTE
 *
 * Der Zustand dieses Hauses steht heute an vielen Stellen, und jede davon
 * ist richtig: die Freigaben in `proof.ts`, die Sichtschuld in
 * `auftritt.ts`, die Verlustgruende in `verlust.ts`, das Portfolio in
 * `produkt.ts`, die Rechte in `rollen.ts`, die Wirtschaftlichkeit in
 * `wirtschaft.ts` — siebzehn Gates, siebzehn Register.
 *
 * Was fehlte, war die Frage. Wer wissen wollte „wie steht es um X", musste
 * wissen, WO man das nachsieht. Und `material-status.ts` sammelt zwar
 * Punkte, aber ohne FUNDSTELLE: Es sagt, dass etwas offen ist, nicht,
 * woher es das weiss.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE DREI REGELN
 *
 * 1 · BELEGPFLICHT. Jede Auskunft traegt mindestens einen Beleg — das
 *     Modul, aus dem sie stammt, und was dort steht. Eine Auskunft ohne
 *     Beleg gibt es nicht; sie waere eine Behauptung mit Systemstimme, und
 *     die ist gefaehrlicher als eine mit Menschenstimme, weil ihr niemand
 *     widerspricht.
 *
 * 2 · KEIN ZWEITER SPEICHER. Dieses Modul haelt nichts fest. Es RECHNET
 *     jede Auskunft im Moment der Frage aus den Registern. Ein Gedaechtnis,
 *     das seine eigene Kopie fuehrt, ist die zweite Wahrheit — und es ist
 *     die gefaehrlichste Sorte, weil sie sich richtig anfuehlt: Sie war
 *     einmal richtig.
 *
 * 3 · UNBEKANNT BLEIBT UNBEKANNT. Wo ein Register „nicht erhoben" sagt,
 *     sagt die Auskunft es auch. Das Gedaechtnis rundet nicht, ergaenzt
 *     nicht und schaetzt nicht.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS ES NICHT IST
 *
 * Keine Empfehlung. Dieses Modul beantwortet, WIE ES STEHT — nicht, was zu
 * tun ist. Der Vorschlag wohnt in G29, und er wird dort eine eigene
 * Belegpflicht haben. Ein Gedaechtnis, das mitentscheidet, ist kein
 * Gedaechtnis mehr.
 */

import { clientWorks, genannteClientWorks, productWorks } from "@/lib/site-data"
import { SICHTSCHULD, herrenlos } from "@/lib/auftritt"
import { insights, publishedInsights } from "@/lib/insights"
import { datenschutzText, kampagneSpeicherbar } from "@/lib/herkunft"
import { dictionary } from "@/lib/dictionary"
import { VERLUST_LEHREN } from "@/lib/verlust"
import { PORTFOLIO, standTraegt } from "@/lib/produkt"
import { verkaeuflicheProdukte } from "@/lib/verkauf"
import { FLAECHEN, ROLLEN_KEYS, vergebeneRollen } from "@/lib/rollen"
import { UMFANG, INHALT_JE_MONAT } from "@/lib/betrieb"
import { KAPAZITAET, STUNDENSATZ_INTERN_CENT, traegtDerPreis } from "@/lib/wirtschaft"

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · DIE FORM EINER AUSKUNFT
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Beleg = {
  /** Das Modul oder Dokument, aus dem die Angabe stammt. */
  woher: string
  /** Was dort steht — kurz, nachschlagbar. */
  was: string
}

export type Auskunft = {
  key: string
  frage: string
  /** Die Antwort in einem Satz. Nie eine Zahl allein. */
  antwort: string
  /**
   * `true`  die Lage ist so, wie sie sein soll
   * `false` sie ist es nicht
   * `null`  NICHT ERHOBEN — und das ist etwas Drittes, kein Nein.
   */
  steht: boolean | null
  belege: Beleg[]
}

/** Eine Auskunft ohne Beleg gibt es nicht. */
export function auskunftTraegt(a: Auskunft): boolean {
  if (!a.frage?.trim() || !a.antwort?.trim()) return false
  if (a.belege.length === 0) return false
  return a.belege.every((b) => b.woher?.trim().length > 3 && b.was?.trim().length > 3)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DIE FRAGEN
 *
 * Jede stammt aus einem Gate und wird im Moment der Frage aus dessen
 * Register gerechnet. Nichts hier ist gespeichert.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const FRAGEN: readonly { key: string; frage: string; beantworte: () => Auskunft }[] = [
  {
    key: "freigaben",
    frage: "Wie viele Kundenarbeiten duerfen genannt werden?",
    beantworte: () => ({
      key: "freigaben",
      frage: "Wie viele Kundenarbeiten duerfen genannt werden?",
      antwort:
        genannteClientWorks.length === 0
          ? `Keine. ${clientWorks.length} Kundenarbeiten im Bestand, keine mit hinterlegter Freigabe — ` +
            "sie erscheinen deshalb nirgends."
          : `${genannteClientWorks.length} von ${clientWorks.length}.`,
      steht: genannteClientWorks.length > 0,
      belege: [
        { woher: "lib/proof.ts (G13)", was: "Freigabe mit Person, Form, Datum, Fundstelle" },
        { woher: "lib/site-data.ts", was: `clientWorks: ${clientWorks.length} Eintraege` },
      ],
    }),
  },
  {
    key: "sichtschuld",
    frage: "Hat die Owner-Sichtschuld einen Eigentuemer?",
    beantworte: () => ({
      key: "sichtschuld",
      frage: "Hat die Owner-Sichtschuld einen Eigentuemer?",
      antwort:
        herrenlos().length === 0
          ? `Ja — alle ${SICHTSCHULD.length} Zeilen sind zugeordnet und haben ein Mass.`
          : `${herrenlos().length} Zeile(n) ohne Eigentuemer.`,
      steht: herrenlos().length === 0,
      belege: [{ woher: "lib/auftritt.ts (G14)", was: `SICHTSCHULD: ${SICHTSCHULD.length} Zeilen` }],
    }),
  },
  {
    key: "inhalte",
    frage: "Wie viele Beitraege stehen oeffentlich?",
    beantworte: () => ({
      key: "inhalte",
      frage: "Wie viele Beitraege stehen oeffentlich?",
      antwort:
        `${publishedInsights.length} von ${insights.length}. ` +
        (publishedInsights.length < 3 ? "Das ist der duenne Teil aus G15 — Texte schreibt kein Gate." : ""),
      steht: publishedInsights.length >= 3,
      belege: [
        { woher: "lib/insights.ts (G15)", was: `insights: ${insights.length}, davon veroeffentlicht ${publishedInsights.length}` },
        { woher: "lib/redaktion.ts (G15)", was: "Belegpflicht und Redaktionsweg" },
      ],
    }),
  },
  {
    key: "attribution",
    frage: "Wird die Herkunft einer Anfrage gespeichert?",
    beantworte: () => {
      const erlaubt = kampagneSpeicherbar(datenschutzText(dictionary.de.legal))
      return {
        key: "attribution",
        frage: "Wird die Herkunft einer Anfrage gespeichert?",
        antwort: erlaubt
          ? "Ja — die Datenschutzerklaerung nennt die Kategorie, die Felder gehen durch."
          : "Nein. Die Erklaerung nennt die Kampagnenherkunft nicht, also fallen die Felder an der Tuer.",
        steht: erlaubt,
        belege: [
          { woher: "lib/herkunft.ts (G16)", was: "Die Erklaerung ist der Schluessel" },
          { woher: "lib/dictionary.ts", was: "Datenschutzerklaerung, deutsche Fassung" },
        ],
      }
    },
  },
  {
    key: "verlustwissen",
    frage: "Was lernt das Zielbild aus verlorenen Vorgaengen?",
    beantworte: () => ({
      key: "verlustwissen",
      frage: "Was lernt das Zielbild aus verlorenen Vorgaengen?",
      antwort:
        `${VERLUST_LEHREN.length} Verlustgruende tragen eine Lehre und einen Bezug zum Zielbild. ` +
        "Wie oft welcher vorkam, steht in der Datenbank — nicht hier.",
      steht: VERLUST_LEHREN.length > 0,
      belege: [
        { woher: "lib/verlust.ts (G16)", was: `VERLUST_LEHREN: ${VERLUST_LEHREN.length}` },
        { woher: "lib/market.ts (G09)", was: "Hypothesen-Register, das die Lehren beruehren" },
      ],
    }),
  },
  {
    key: "produktstand",
    frage: "Welchen Reifegrad haben die eigenen Produkte?",
    beantworte: () => {
      const bestaetigt = PORTFOLIO.filter((e) => standTraegt(e.stand)).length
      return {
        key: "produktstand",
        frage: "Welchen Reifegrad haben die eigenen Produkte?",
        antwort:
          bestaetigt === 0
            ? `Nicht erhoben. ${PORTFOLIO.length} Produkte, keines mit bestaetigtem Stand — ` +
              "die Stufe kann man nicht ausrechnen, sie weiss genau eine Person."
            : `${bestaetigt} von ${PORTFOLIO.length} bestaetigt.`,
        /* Nicht `false`: Ein fehlender Stand ist nicht erhoben, nicht schlecht. */
        steht: bestaetigt === 0 ? null : bestaetigt === PORTFOLIO.length,
        belege: [{ woher: "lib/produkt.ts (G24)", was: `PORTFOLIO: ${PORTFOLIO.length} Eintraege` }],
      }
    },
  },
  {
    key: "verkaeuflich",
    frage: "Welche Produkte koennen verkauft werden?",
    beantworte: () => {
      const v = verkaeuflicheProdukte()
      return {
        key: "verkaeuflich",
        frage: "Welche Produkte koennen verkauft werden?",
        antwort:
          v.length === 0
            ? `Keines von ${productWorks.length}. Die Schwelle verlangt sechs Dinge, und zwei davon ` +
              "liegen beim Owner (Reifegrad, Umsatzsteuer-Status)."
            : v.join(", "),
        steht: v.length > 0,
        belege: [
          { woher: "lib/verkauf.ts (G25)", was: "sechs Bedingungen der Verkaufsschwelle" },
          { woher: "lib/rechnung.ts (G18)", was: "Steuerlage" },
        ],
      }
    },
  },
  {
    key: "rollen",
    frage: "Kann ein zweiter Mensch arbeiten, ohne alles zu sehen?",
    beantworte: () => {
      const vergeben = vergebeneRollen().filter((r) => r !== "owner")
      return {
        key: "rollen",
        frage: "Kann ein zweiter Mensch arbeiten, ohne alles zu sehen?",
        antwort:
          vergeben.length > 0
            ? `Ja, und es ist eingerichtet: ${vergeben.join(", ")}.`
            : `Moeglich, aber nicht eingerichtet. ${ROLLEN_KEYS.length} Rollen ueber ${FLAECHEN.length} Flaechen; ` +
              "keine eingeschraenkte Rolle vergeben.",
        steht: vergeben.length > 0,
        belege: [{ woher: "lib/rollen.ts (G32)", was: `${ROLLEN_KEYS.length} Rollen, ${FLAECHEN.length} Flaechen` }],
      }
    },
  },
  {
    key: "betriebszusage",
    frage: "Was gilt fuer die monatliche Betreuung?",
    beantworte: () => ({
      key: "betriebszusage",
      frage: "Was gilt fuer die monatliche Betreuung?",
      antwort:
        `${UMFANG.length} Zusagen, darunter ein Kontingent von ${INHALT_JE_MONAT} Inhaltsaenderungen ` +
        "im Monat und ein Rueckruf am naechsten Werktag.",
      steht: true,
      belege: [
        { woher: "lib/betrieb.ts (G21)", was: `UMFANG: ${UMFANG.length} Zusagen` },
        { woher: "lib/site-data.ts", was: "retainer.includes — die oeffentliche Fassung" },
      ],
    }),
  },
  {
    key: "wirtschaftlichkeit",
    frage: "Traegt der Pilotpreis von 2.400 €?",
    beantworte: () => {
      const lage = traegtDerPreis("website", [])
      return {
        key: "wirtschaftlichkeit",
        frage: "Traegt der Pilotpreis von 2.400 €?",
        antwort:
          lage.art === "gerechnet"
            ? `Marge ${Math.round(lage.margeCent / 100)} € bei ${lage.stunden} Stunden.`
            : `Nicht beantwortbar: ${lage.fehlt.join(" ")}`,
        /* Weder ja noch nein — die Frage ist nicht beantwortbar. */
        steht: lage.art === "gerechnet" ? lage.margeCent > 0 : null,
        belege: [
          { woher: "lib/wirtschaft.ts (G23)", was: "Marge: gerechnet oder unbekannt, kein dritter Weg" },
          {
            woher: "Owner-Punkte",
            was:
              `Stundensatz ${STUNDENSATZ_INTERN_CENT === null ? "nicht hinterlegt" : "hinterlegt"}, ` +
              `Kapazitaet ${KAPAZITAET.projekte === null ? "nicht hinterlegt" : "hinterlegt"}`,
          },
        ],
      }
    },
  },
]

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DER ABRUF
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Eine Frage stellen.
 *
 * `null` bei unbekanntem Schluessel — und ausdruecklich KEINE Naeherung.
 * Ein Gedaechtnis, das auf eine Frage antwortet, die es nicht kennt, hat
 * geraten.
 */
export function frage(key: string): Auskunft | null {
  const eintrag = FRAGEN.find((f) => f.key === key)
  if (!eintrag) return null
  const a = eintrag.beantworte()
  /* Belegpflicht — hier und nicht erst im Gate. */
  return auskunftTraegt(a) ? a : null
}

/** Alles auf einmal. Jede Auskunft frisch gerechnet, keine gespeichert. */
export function kontext(): Auskunft[] {
  return FRAGEN.map((f) => f.beantworte()).filter(auskunftTraegt)
}

/** Was nicht erhoben ist — der ehrlichste Teil des Gedaechtnisses. */
export function nichtErhoben(): Auskunft[] {
  return kontext().filter((a) => a.steht === null)
}

/** Was nicht steht. Nicht dasselbe wie „nicht erhoben". */
export function offen(): Auskunft[] {
  return kontext().filter((a) => a.steht === false)
}
