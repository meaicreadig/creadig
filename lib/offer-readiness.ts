/*
 * ==========================================================================
 * ANGEBOTSREIFE — WANN DARF EINE ZAHL GENANNT WERDEN?
 * ==========================================================================
 *
 * Gate 06 hat in seinem Kanon einen Satz hinterlassen, der als EINE Regel
 * gelesen werden konnte: „angebotsreif heisst: Treiber bekannt, Umfang
 * zuschneidbar." Gate 07 hat den Satz im Dokument korrigiert. Im Code stand
 * bis hierher gar nichts — Angebotsreife war eine Behauptung in zwei
 * Markdown-Dateien und nirgends pruefbar.
 *
 * Das ist die gefaehrlichste Form einer Regel: Sie klingt verbindlich und
 * bindet nichts. Ein Verkaeufer, der die Dokumente nicht kennt, fragt einen
 * Handwerksbetrieb nach fuenf Systemtreibern, bevor er ihm ein
 * Festpreis-Paket anbietet — und der Betrieb legt auf.
 *
 * ---------------------------------------------------------------------------
 * ZWEI LOGIKEN, NICHT EINE
 *
 * FESTPREIS (Website, Pruefung, Betrieb): Der Umfang steht im Angebot. Reif
 * ist, wer weiss, WEM er es anbietet und dass der Fall hineinpasst. Die
 * fuenf Systemtreiber kommen hier NICHT vor — sie waeren nicht nur
 * ueberfluessig, sie waeren eine Huerde vor einem Angebot, das es fertig
 * gibt.
 *
 * SYSTEMPROJEKT: Der Umfang entsteht erst. Reif ist, wer genug weiss, um ihn
 * zu schneiden. Dafuer sind die Treiber da.
 *
 * SPANNE (Behebung): Reif ist, wer die Pruefung gesehen hat. Vorher ist jede
 * Zahl geraten — dieselbe Doktrin wie beim Festpreis fuer Ungesehenes.
 *
 * ---------------------------------------------------------------------------
 * BELEG, NICHT PUNKTZAHL
 *
 * Hier entsteht keine Prozentzahl, kein „4 von 5", keine Ampel. Jeder Punkt
 * ist eine Tatsache, die ein Mensch bestaetigt, weil er sie WEISS — nicht
 * weil ein Formular sie verlangt. Was fehlt, steht als Frage da, nicht als
 * fehlender Punkt.
 *
 * Die Oberflaeche zeigt deshalb nie „3/5", sondern die offenen Fragen im
 * Klartext. Ein Zaehler laedt dazu ein, Haken zu setzen, damit die Zahl
 * steigt; eine offene Frage laedt dazu ein, sie zu beantworten.
 */
/*
 * Die Preise kommen aus derselben Quelle wie die oeffentliche Seite. Eine
 * zweite Liste im Vertrieb waere genau der Fehler, den Gate 05 beseitigt
 * hat: eine Zahl an zwei Stellen, die irgendwann auseinanderlaufen.
 */
import { formatPrice, packages, retainer } from "@/lib/site-data"

const preis = (amount: number | null | undefined): string | null =>
  typeof amount === "number" ? formatPrice(amount, "de") : null

const websitePreis = preis(packages.find((p) => p.key === "website")?.regularAmount)
const pruefungPreis = preis(packages.find((p) => p.key === "audit")?.amount)
const betriebPreis = preis(retainer.amount)

export const OFFER_KINDS = ["website", "pruefung", "behebung", "systemprojekt", "betrieb"] as const
export type OfferKind = (typeof OFFER_KINDS)[number]

/** Wie der Preis zustande kommt — entscheidet, WELCHE Belege noetig sind. */
export type PriceShape = "festpreis" | "spanne" | "nach-zuschnitt" | "wiederkehrend"

export type OfferDefinition = {
  label: string
  priceShape: PriceShape
  /** Was der Kunde oeffentlich liest. `null` = keine Zahl vor dem Zuschnitt. */
  publicPrice: string | null
  /**
   * Die Belege, die vorliegen muessen, bevor eine Zahl genannt wird.
   * Bewusst kurz: Jeder Punkt hier ist eine Frage, die ein Verkaeufer im
   * Gespraech ohnehin stellt.
   */
  evidence: { key: string; label: string; why: string }[]
}

export const OFFERS: Record<OfferKind, OfferDefinition> = {
  website: {
    label: "Website-Paket",
    priceShape: "festpreis",
    publicPrice: websitePreis,
    evidence: [
      {
        key: "betrieb",
        label: "Betrieb und Ansprechpartner stehen fest",
        why: "Ein Festpreis geht an jemanden. Ohne Gegenüber ist es kein Angebot, sondern eine Preisliste.",
      },
      {
        key: "umfang",
        label: "Der Fall passt in den Paketumfang",
        why: "Shop, Buchung, mehrere Standorte oder eine Schnittstelle sprengen das Paket — dann ist es ein Systemprojekt.",
      },
      {
        key: "material",
        label: "Der Betrieb kann Texte, Bilder und Zugänge liefern",
        why: "Die vier Wochen laufen ab Materialeingang. Ohne diese Zusage ist der Zeitrahmen keine Zusage.",
      },
    ],
  },
  pruefung: {
    label: "Barrierefreiheits-Prüfung",
    priceShape: "festpreis",
    publicPrice: pruefungPreis,
    evidence: [
      {
        key: "seite",
        label: "Die zu prüfende Seite ist benannt",
        why: "Der Festpreis gilt für einen Auftritt. Welchen, muss vorher feststehen.",
      },
      {
        key: "betrieb",
        label: "Betrieb und Ansprechpartner stehen fest",
        why: "Der Bericht gehört jemandem.",
      },
    ],
  },
  behebung: {
    label: "Barrierefreiheits-Behebung",
    priceShape: "spanne",
    publicPrice: "2.000–4.000 €",
    evidence: [
      {
        key: "pruefung",
        label: "Ein Prüfbericht liegt vor",
        why: "Ohne Befunde ist jede Zahl geraten. Für Ungesehenes nennt niemand seriös einen Preis.",
      },
      {
        key: "zugang",
        label: "Der Code-Zugang ist geklärt",
        why: "Ob wir selbst ändern dürfen oder über Dritte gehen müssen, bewegt die Spanne am stärksten.",
      },
    ],
  },
  betrieb: {
    label: "Managed Betrieb",
    priceShape: "wiederkehrend",
    publicPrice: betriebPreis,
    evidence: [
      {
        key: "eigenes-system",
        label: "Das System stammt von uns — oder wir haben es angesehen und übernehmen es",
        why: "Voraussetzung aus dem Angebotskanon: Wir stehen nicht für Code gerade, den wir nicht kennen.",
      },
      {
        key: "grenze",
        label: "Der Betrieb kennt die Grenze — zwei Inhaltsänderungen im Monat",
        why: "Was nicht enthalten ist, gehört ins Gespräch und nicht in die erste Rechnung.",
      },
    ],
  },
  systemprojekt: {
    label: "Systemprojekt",
    priceShape: "nach-zuschnitt",
    publicPrice: null,
    /*
     * NUR HIER stehen die fuenf Treiber aus Gate 05/06 — und auch hier nicht
     * als Fragebogen, sondern als das, was ein Zuschnitt braucht.
     */
    evidence: [
      {
        key: "problem",
        label: "Das Problem ist beschrieben — was klemmt, im Betrieb, nicht im System",
        why: "Ein Umfang ohne Problem ist eine Wunschliste.",
      },
      {
        key: "ablaeufe",
        label: "Die betroffenen Abläufe sind benannt",
        why: "Treiber 1: Wie viele Abläufe das System abbilden soll.",
      },
      {
        key: "rollen-orte",
        label: "Rollen und Standorte sind bekannt",
        why: "Treiber 2 und 3. Wer sieht was, und an wie vielen Orten wird gearbeitet.",
      },
      {
        key: "bestand",
        label: "Vorhandene Systeme und Altdaten sind geklärt",
        why: "Treiber 4. Eine Anbindung samt Datenübernahme ist oft der grösste Einzelposten.",
      },
      {
        key: "ergebnis",
        label: "Das gewünschte Ergebnis ist vereinbart",
        why: "Woran der Betrieb merkt, dass es besser ist. Ohne das gibt es keine Abnahme.",
      },
    ],
  },
}

export type Readiness = {
  kind: OfferKind
  definition: OfferDefinition
  /** Belege, die noch fehlen — im Klartext, nicht als Zahl. */
  open: OfferDefinition["evidence"]
  ready: boolean
}

/**
 * Was noch offen ist. `have` sind die bestaetigten Belegschluessel.
 *
 * Kein Zaehler nach aussen: Der Aufrufer bekommt die offenen FRAGEN. Wer
 * daraus doch eine Quote bilden will, muss es selbst tun — und wird es im
 * Code sehen.
 */
export function readinessFor(kind: OfferKind, have: readonly string[]): Readiness {
  const definition = OFFERS[kind]
  const bestaetigt = new Set(have)
  const open = definition.evidence.filter((e) => !bestaetigt.has(e.key))
  return { kind, definition, open, ready: open.length === 0 }
}

/**
 * Braucht diese Angebotsart die Systemtreiber?
 *
 * Existiert, damit die Frage im Code beantwortbar ist statt in einem
 * Dokument — und damit ein Test sie stellen kann.
 */
export function needsSystemDrivers(kind: OfferKind): boolean {
  return kind === "systemprojekt"
}
