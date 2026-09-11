/*
 * ===========================================================================
 * BELEG-BETRIEB — WAS KANN DIESES HAUS HEUTE BEWEISEN?
 * ===========================================================================
 *
 * PROOF OPERATIONS · PHASE P1, 11.09.2026.
 *
 * ---------------------------------------------------------------------------
 * WAS DIESES MODUL IST — UND VOR ALLEM, WAS ES NICHT IST
 *
 * Es ist KEINE zweite Beleg-Datenbank.
 *
 * Das Haus fuehrt die Wahrheit bereits an fuenf Stellen, und jede davon ist
 * an ihrem Platz richtig:
 *
 *   lib/proof.ts          Freigaben mit Person, Form, Datum, Umfang, Fundstelle
 *   lib/site-data.ts      Kundenarbeiten und Fallstudien mit ihren Freigaben
 *   lib/produkt-beleg.ts  Produktwahrheit mit Quelle und Pruefdatum
 *   lib/fibero-beleg.ts   das Belegregister zum eigenen Betriebsfall
 *   lib/vertretung.ts     wer welchen Schritt uebernehmen kann
 *
 * Wer davon eine Kopie anlegt, hat ab dem naechsten Dienstag zwei Wahrheiten.
 * Genau diesen Fehler hat Gate 13 behoben, als vier Stellen dieselbe
 * Rechtsfrage verschieden beantworteten.
 *
 * Dieses Modul LIEST diese fuenf und beantwortet die eine Frage, die keine
 * von ihnen allein beantworten kann:
 *
 *   Was fehlt, damit der naechste Beleg oeffentlich werden darf —
 *   und welcher davon waere am meisten wert?
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE REIHENFOLGE DAS EIGENTLICHE ERGEBNIS IST
 *
 * Eine Liste offener Punkte hat dieses Haus schon: `/admin/material`. Sie ist
 * richtig und sie ist lang. Was sie nicht sagt, ist, WELCHER Punkt als
 * naechster dran ist.
 *
 * Der Rang hier faellt aus zwei Fragen, nicht aus einem Bauchgefuehl:
 *
 *   NAEHE     Wie viele Schritte fehlen noch bis oeffentlich?
 *   WIRKUNG   Was aendert sich kommerziell, wenn er faellt?
 *
 * Ein Beleg, dem nur die Unterschrift fehlt, steht ueber einem, fuer den erst
 * gemessen werden muss — auch wenn der zweite spaeter mehr wert waere. Das
 * ist keine Bequemlichkeit: Der erste ist in einer Woche da, der zweite in
 * einem Quartal, und ein Haus ohne oeffentlichen Kundenbeleg braucht den
 * ersten zuerst.
 */
import { caseStudies, clientWorks, productWorks, fallFreigabe, namensFreigabe } from "@/lib/site-data"
import { PROOF_KINDS, type ProofKind } from "@/lib/proof"
import { produktBelege } from "@/lib/produkt-beleg"
import { assets, darfOeffentlich, type Asset } from "@/lib/asset-sicherheit"
import { fiberoAussagen, fiberoHatMessung } from "@/lib/fibero-beleg"
import { fiberoKennzahlen, HISTORISCHER_VORHERSTAND_VORHANDEN } from "@/lib/fibero-messung"
import { alleWahrheiten, traegtAussage, type Wahrheit } from "@/lib/owner-wahrheit"
import type { Probe } from "@/lib/messreihe"

/* ── Die Arten von Beleg ────────────────────────────────────────────────── */

/**
 * `lib/proof.ts` kennt drei Arten aus der Sicht der FREIGABE: eigenes
 * Produkt, Kundenprojekt, Kundenergebnis. Das ist die Frage „wer muss
 * zustimmen?".
 *
 * Der Betrieb stellt eine zweite Frage — „was fuer ein Beweis ist das
 * ueberhaupt?" —, und darauf gibt es zwei weitere Antworten, die in keiner
 * der drei Kategorien aufgehen: eine nachpruefbare METHODE (das
 * Barrierefreiheits-Raster) und eine LIEFERFAEHIGKEIT (Vertretung,
 * Kapazitaet). Beide brauchen keine Kundenfreigabe und sind trotzdem kein
 * Produkt.
 *
 * Fuenf Arten, nicht zwanzig. Die drei aus `proof.ts` behalten ihre Namen,
 * damit niemand zwei Vokabulare pflegen muss.
 */
export type Belegart = ProofKind | "methode" | "lieferfaehigkeit"

export const BELEGART_LABEL: Record<Belegart, string> = {
  "eigenes-produkt": PROOF_KINDS["eigenes-produkt"].label,
  kundenprojekt: PROOF_KINDS.kundenprojekt.label,
  kundenergebnis: PROOF_KINDS.kundenergebnis.label,
  methode: "Nachprüfbare Methode",
  lieferfaehigkeit: "Lieferfähigkeit",
}

/* ── Der Stand eines Belegs ─────────────────────────────────────────────── */

/**
 * Abgeleitet, nie gespeichert — dieselbe Regel wie bei der Freigabelage in
 * Gate 13. Ein gespeicherter Stand ist ab der ersten Regelaenderung still
 * falsch.
 */
export type Belegstand =
  /** Es gibt einen Kandidaten, aber noch keinen Beleg. */
  | "kandidat"
  /** Der Beleg liegt vor; die Freigabe fehlt. */
  | "freigabe-noetig"
  /** Der Beleg braucht eine Messung, die noch laeuft oder fehlt. */
  | "messung-noetig"
  /** Ein Bild oder eine Aufnahme ist gesperrt. */
  | "material-noetig"
  /** Nur der Owner kann eine Tatsache bestaetigen. */
  | "owner-wahrheit-noetig"
  /** Alles da — oeffentlich sichtbar. */
  | "oeffentlich"

export const STAND_LABEL: Record<Belegstand, string> = {
  kandidat: "Kandidat",
  "freigabe-noetig": "Freigabe fehlt",
  "messung-noetig": "Messung fehlt",
  "material-noetig": "Material fehlt",
  "owner-wahrheit-noetig": "Owner-Bestätigung fehlt",
  oeffentlich: "Öffentlich",
}

export type Belegposten = {
  key: string
  art: Belegart
  /** Worüber der Beleg spricht. */
  subjekt: string
  stand: Belegstand
  /** Was er behauptet — oder behaupten würde. */
  aussage: string
  /** Was konkret fehlt. Ein Satz, den ein Mensch ausführen kann. */
  fehlt: string | null
  /** Wer ihn auflösen kann. */
  liegtBei: "owner" | "kunde" | "zeit" | "niemand"
  /** Was er freigeben würde, kommerziell. */
  wirkung: string
  /** Näher an öffentlich = kleinere Zahl. 0 = ist es schon. */
  schritte: number
  /**
   * Startet dieser Schritt eine Wartezeit, die erst danach ablaufen kann?
   *
   * Die erste Messprobe ist der Fall, für den es dieses Feld gibt: Sie
   * braucht selbst zehn Minuten, aber danach müssen 28 Tage vergehen, bevor
   * ein Vergleich überhaupt etwas sagen darf. Jeder Tag, an dem sie NICHT
   * erhoben wird, verschiebt den ersten echten Wirkungsbeleg um einen Tag.
   *
   * Ohne dieses Feld sortierte die reine Schrittzahl sie ans Ende — hinter
   * Dinge, die jederzeit nachholbar sind.
   */
  startetUhr?: boolean
}

/* ── Die Zusammenstellung ───────────────────────────────────────────────── */

/**
 * Kundenfälle. KEIN automatischer Import aus dem Kundenbestand.
 *
 * Gelesen werden ausschliesslich die drei Eintraege, die jemand bewusst in
 * `caseStudies` angelegt hat. Die Organisationen im CRM bleiben aussen vor —
 * ein Kunde ist kein Fall, und aus neunzehn Kunden neunzehn Kandidaten zu
 * machen waere genau die Mengenlogik, die spaeter jemanden dazu bringt,
 * einen davon ohne Freigabe zu veroeffentlichen.
 */
function kundenfaelle(): Belegposten[] {
  return caseStudies.map((c) => {
    const deckung = fallFreigabe(c)
    const hatMetriken = c.metrics.length > 0
    return {
      key: `fall-${c.slug}`,
      art: hatMetriken ? ("kundenergebnis" as const) : ("kundenprojekt" as const),
      subjekt: c.client,
      stand: deckung.gedeckt ? ("oeffentlich" as const) : ("freigabe-noetig" as const),
      aussage: hatMetriken
        ? "Was sich bei diesem Kunden messbar geändert hat."
        : "Was creaDIG für diesen Kunden gebaut hat.",
      fehlt: deckung.gedeckt ? null : deckung.grund,
      liegtBei: deckung.gedeckt ? ("niemand" as const) : ("kunde" as const),
      wirkung:
        "Der erste öffentliche Kundenbeleg überhaupt. Er löst den Blocker, der für Mittelstand und größer heute der einzige harte ist.",
      schritte: deckung.gedeckt ? 0 : 1,
    }
  })
}

/** Kundenarbeiten ohne Fallstudie — dieselbe Freigabefrage, kleinere Aussage. */
function kundenarbeiten(): Belegposten[] {
  return clientWorks
    .filter((w) => !caseStudies.some((c) => c.slug === w.slug))
    .map((w) => {
      const deckung = namensFreigabe(w)
      return {
        key: `arbeit-${w.slug}`,
        art: "kundenprojekt" as const,
        subjekt: w.name,
        stand: deckung.gedeckt ? ("oeffentlich" as const) : ("freigabe-noetig" as const),
        aussage: "Dass creaDIG für diesen Kunden gearbeitet hat.",
        fehlt: deckung.gedeckt ? null : deckung.grund,
        liegtBei: deckung.gedeckt ? ("niemand" as const) : ("kunde" as const),
        wirkung: "Ein Name auf /arbeiten — weniger als ein Fall, mehr als nichts.",
        schritte: deckung.gedeckt ? 0 : 1,
      }
    })
}

/** Produkte: der Beleg haengt am Material, nicht an einer Freigabe. */
function produkte(): Belegposten[] {
  return produktBelege.map((b) => {
    const asset: Asset | undefined = assets.find((a) => a.subjekt === b.slug)
    const zeigbar = asset ? darfOeffentlich(asset.lage) : false
    const produkt = productWorks.find((p) => p.slug === b.slug)
    return {
      key: `produkt-${b.slug}`,
      art: "eigenes-produkt" as const,
      subjekt: produkt?.name ?? b.slug,
      stand: zeigbar ? ("oeffentlich" as const) : ("material-noetig" as const),
      aussage: "Dass dieses System existiert und wie seine Oberfläche aussieht.",
      fehlt: zeigbar ? null : (asset?.fehlt ?? "Keine geprüfte Aufnahme vorhanden."),
      liegtBei: zeigbar ? ("niemand" as const) : ("owner" as const),
      wirkung: zeigbar
        ? "Sichtbarer Beleg auf der Produktseite."
        : "Zwei von vier Produkten hätten endlich eine zeigbare Oberfläche.",
      schritte: zeigbar ? 0 : 1,
    }
  })
}

/**
 * fibero als Betriebsfall. Er ist oeffentlich — aber nur als Struktur.
 *
 * Der zweite Posten ist die Messung, und sie ist der einzige Punkt im ganzen
 * Haus, der bei NIEMANDEM liegt: Er braucht Zeit. Deshalb `liegtBei: "zeit"`.
 * Ihn als Owner-Aufgabe zu fuehren waere doppelt falsch — der Owner kann ihn
 * nicht schneller machen, und er wuerde jede Woche als Versaeumnis erscheinen.
 */
function fibero(proben: readonly Probe[]): Belegposten[] {
  const eigene = proben.filter((p) => fiberoKennzahlen.some((k) => k.key === p.kennzahl))
  const ausgang = eigene.filter((p) => p.seite === "ausgang").length
  const posten: Belegposten[] = [
    {
      key: "fibero-struktur",
      art: "eigenes-produkt",
      subjekt: "fibero",
      stand: "oeffentlich",
      aussage: `Struktureller Betriebsbeleg: ${fiberoAussagen.length} Aussagen mit Fundstelle im Schema.`,
      fehlt: null,
      liegtBei: "niemand",
      wirkung: "Belegt Systemverständnis. Belegt keine Wirkung.",
      schritte: 0,
    },
    {
      key: "fibero-messung",
      /*
       * P2 · 11.09.2026: Das ist INTERNAL MEASURED PROOF am eigenen Produkt —
       * niemals kundenergebnis / Market Proof. Eine eigene Messreihe beweist
       * keinen Kunden-Outcome und darf den Freigabe-Pfad nicht verdrängen,
       * solange noch kein öffentlicher Kundenbeleg existiert.
       */
      art: "eigenes-produkt",
      subjekt: "fibero",
      stand: "messung-noetig",
      aussage:
        "Dass sich ein eigener fibero-Vorgang messbar verändert hat (Internal Measured Proof — kein Kunden-Market-Proof).",
      fehlt:
        ausgang === 0
          ? `Kein Ausgangsstand erhoben. ${fiberoKennzahlen.length} Kennzahlen sind definiert und warten auf die erste Probe.`
          : `Ausgangsstand liegt für ${ausgang} von ${fiberoKennzahlen.length} Kennzahlen vor. Ein Wert danach braucht mindestens 28 Tage Abstand.`,
      liegtBei: ausgang === 0 ? "owner" : "zeit",
      startetUhr: ausgang === 0,
      wirkung:
        "Die erste belegte Wirkungszahl am eigenen Betrieb — Grundlage für den Aufwandsrechner. Beweist keinen Kunden-Outcome.",
      schritte: ausgang === 0 ? 2 : 1,
    },
  ]
  return posten
}

/** Owner-Wahrheiten als Belegposten — dieselbe Liste, andere Sicht. */
function ownerWahrheiten(): Belegposten[] {
  return alleWahrheiten.map((w: Wahrheit) => ({
    key: w.key,
    art: w.key.startsWith("avv-") ? ("methode" as const) : ("lieferfaehigkeit" as const),
    subjekt: w.frage,
    stand: traegtAussage(w.stand) ? ("oeffentlich" as const) : ("owner-wahrheit-noetig" as const),
    aussage: w.frage,
    fehlt: traegtAussage(w.stand) ? null : w.aufloesungDurch,
    liegtBei: traegtAussage(w.stand) ? ("niemand" as const) : ("owner" as const),
    wirkung: w.gibtFrei,
    schritte: traegtAussage(w.stand) ? 0 : 1,
  }))
}

/** Die eigene Barrierefreiheits-Prüfung — der einzige Methodenbeleg, der heute trägt. */
function methode(): Belegposten[] {
  return [
    {
      key: "methode-barrierefreiheit",
      art: "methode",
      subjekt: "Barrierefreiheits-Raster",
      stand: "oeffentlich",
      aussage:
        "Ein Prüfraster mit zwölf Punkten, ein automatisierter Lauf über 132 Durchläufe und der vollständige Befund — an der eigenen Seite offengelegt.",
      fehlt: null,
      liegtBei: "niemand",
      wirkung: "Belegt die Methode, die verkauft wird. Belegt keinen Kundenerfolg.",
      schritte: 0,
    },
  ]
}

/**
 * Alle Posten. `proben` kommt aus der Datenbank; ohne Verbindung ist die
 * Liste leer, und der fibero-Posten sagt dann korrekt, dass nichts erhoben
 * ist — nicht, dass etwas kaputt sei.
 */
export function belegposten(proben: readonly Probe[] = []): Belegposten[] {
  return [
    ...kundenfaelle(),
    ...kundenarbeiten(),
    ...produkte(),
    ...fibero(proben),
    ...methode(),
    ...ownerWahrheiten(),
  ]
}

/* ── Die Reihenfolge ────────────────────────────────────────────────────── */

/**
 * Wie schwer eine Wirkung wiegt. Absichtlich grob: Drei Stufen, die sich
 * begruenden lassen, statt einer Punktzahl, die Genauigkeit vortaeuscht.
 */
const WIRKUNGSRANG: Record<Belegart, number> = {
  kundenergebnis: 0,
  kundenprojekt: 1,
  lieferfaehigkeit: 2,
  "eigenes-produkt": 3,
  methode: 4,
}

/**
 * Die offenen Posten, der dringendste zuerst.
 *
 * Sortiert nach NAEHE vor WIRKUNG. Der Grund steht oben im Kopf: Was in einer
 * Woche da sein kann, schlaegt was in einem Quartal mehr wert waere — solange
 * das Haus ueberhaupt keinen oeffentlichen Kundenbeleg hat.
 *
 * Zeitgebundene Posten rutschen ans Ende: Sie sind nicht erledigbar, nur
 * abwartbar, und oben wuerden sie jede Woche wie ein Versaeumnis aussehen.
 *
 * P2 · FIRST MARKET PROOF: Solange kein öffentlicher Kundenbeleg existiert,
 * geht der Kundenfreigabe-Pfad (Market Proof) vor einer Uhr-startenden
 * Eigenmessung (Internal Measured Proof). Die Messprobe bleibt parallel und
 * zeitkritisch — sie wird nur nicht mehr als Market Proof missverstanden.
 */
export function naechsteSchritte(proben: readonly Probe[] = []): Belegposten[] {
  const alle = belegposten(proben)
  const hatOeffentlichenKundenbeleg = alle.some(
    (p) =>
      (p.key.startsWith("fall-") || p.key.startsWith("arbeit-")) && p.stand === "oeffentlich",
  )
  const istMarketPfad = (p: Belegposten) =>
    (p.art === "kundenprojekt" || p.art === "kundenergebnis") && p.stand === "freigabe-noetig"

  return alle
    .filter((p) => p.stand !== "oeffentlich")
    .sort((a, b) => {
      /* Was nur abgewartet werden kann, steht nicht oben. */
      if ((a.liegtBei === "zeit") !== (b.liegtBei === "zeit")) return a.liegtBei === "zeit" ? 1 : -1
      if (!hatOeffentlichenKundenbeleg) {
        const aMarket = istMarketPfad(a)
        const bMarket = istMarketPfad(b)
        if (aMarket !== bMarket) return aMarket ? -1 : 1
      }
      /*
       * Uhr-Start (fibero-Probe) vor sonstigen Owner-Schritten gleicher Nähe —
       * parallel zum Market-Pfad, zeitkritisch, aber nicht als Market Proof.
       */
      if (Boolean(a.startetUhr) !== Boolean(b.startetUhr)) return a.startetUhr ? -1 : 1
      const na = a.startetUhr ? 1 : a.schritte
      const nb = b.startetUhr ? 1 : b.schritte
      if (na !== nb) return na - nb
      return WIRKUNGSRANG[a.art] - WIRKUNGSRANG[b.art]
    })
}

/**
 * DIE EINE FRAGE, DIE DAS COCKPIT BEANTWORTEN MUSS.
 *
 * „Was ist heute die wirksamste nächste Handlung?" — genau eine Antwort,
 * nicht die fuenf besten. Wer fuenf bekommt, faengt mit keiner an.
 */
export function wirksamsterSchritt(proben: readonly Probe[] = []): Belegposten | null {
  return naechsteSchritte(proben)[0] ?? null
}

/** Die Zahlen für die Kopfzeile — gezählt, nicht geschätzt. */
export function uebersicht(proben: readonly Probe[] = []) {
  const alle = belegposten(proben)
  return {
    oeffentlich: alle.filter((p) => p.stand === "oeffentlich").length,
    kundenfaelleOeffentlich: alle.filter(
      (p) => p.key.startsWith("fall-") && p.stand === "oeffentlich",
    ).length,
    wartetAufFreigabe: alle.filter((p) => p.stand === "freigabe-noetig").length,
    wartetAufMaterial: alle.filter((p) => p.stand === "material-noetig").length,
    wartetAufOwner: alle.filter((p) => p.stand === "owner-wahrheit-noetig").length,
    wartetAufMessung: alle.filter((p) => p.stand === "messung-noetig").length,
    kennzahlenDefiniert: fiberoKennzahlen.length,
    probenErhoben: proben.length,
    /* Zwei Tatsachen, die sich nicht aus Zählen ergeben. */
    historischerVorherstand: HISTORISCHER_VORHERSTAND_VORHANDEN,
    fiberoGemessen: fiberoHatMessung,
  }
}
