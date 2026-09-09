/**
 * G25 · PRODUKT-KOMMERZIALISIERUNG — wann wird ein Produkt verkaeuflich?
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DER GATE-VERTRAG
 *
 *     „Wann wird ein Produkt verkaeuflich?
 *      Unabhaengig, weil die KAUFMAENNISCHE UND RECHTLICHE Grenze eine
 *      andere ist als beim Bauen.
 *      Enthaelt die Schleife: wiederkehrendes Kundenproblem → Muster →
 *      Produktkandidat."
 *
 * Zwei Haelften, und beide fehlten — aber sie fehlten aus verschiedenen
 * Gruenden.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * A · DIE SCHWELLE — SECHS BEDINGUNGEN, KEINE PUNKTZAHL
 *
 * „Fertig" ist keine Bedingung, und „gut" auch nicht. Verkaeuflich ist ein
 * Produkt, wenn sechs Fragen beantwortet sind — und jede davon ist
 * anderswo im Haus schon entschieden. Diese Datei rechnet nichts neu, sie
 * SAMMELT ein:
 *
 *   1 Reifegrad     mindestens Pilot, bestaetigt und nicht veraltet (G24)
 *   2 Eigentuemer   jemand antwortet dafuer (G24)
 *   3 Rueckmeldeweg jemand kann eine Stoerung melden (G24)
 *   4 Preisquelle   Katalog oder Owner-Freigabe (G17)
 *   5 Steuerlage    nicht `offen` (G18)
 *   6 Betrieb danach wer es fuehrt, nachdem es verkauft ist
 *
 * DIE ERSTE UND DIE FUENFTE SIND DER GRUND, WARUM DAS GATE EIGENSTAENDIG IST:
 * Ein Produkt kann technisch tadellos laufen und trotzdem nicht verkaeuflich
 * sein, weil niemand es abrechnen kann. Und es kann verkaufsreif AUSSEHEN
 * und ein Pilot sein. Beides sind kaufmaennische Grenzen, keine technischen.
 *
 * DIE SECHSTE STEHT AUF DER OEFFENTLICHEN SEITE. Das Haus sagt: „Wir
 * uebergeben nicht und verschwinden." Ein Produkt zu verkaufen, ohne dass
 * feststeht, wer es danach betreibt, waere ein Bruch dieses Satzes im
 * Moment des Verkaufs.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * B · DIE SCHLEIFE — EIN KANDIDAT KOMMT AUS EINEM MUSTER, NICHT AUS EINER IDEE
 *
 * „Wiederkehrendes Kundenproblem → Muster → Produktkandidat" hat eine
 * Richtung, und sie ist der ganze Punkt. Ein Produkt, das aus einer Idee
 * entsteht, sucht danach seinen Markt; eines, das aus drei unabhaengigen
 * Beobachtungen entsteht, hat ihn schon getroffen.
 *
 * Die Schwelle ist DIESELBE wie in G16 (`MUSTER_AB`) und aus demselben
 * Grund: Ein Fall ist ein Zufall, zwei eine Beobachtung, drei ein Muster.
 * Sie wird hier importiert und nicht wiederholt — zwei Zahlen fuer dieselbe
 * Regel laufen auseinander.
 *
 * Und eine zweite Bedingung, die G09 dieses Haus gelehrt hat: Die
 * Beobachtungen muessen von VERSCHIEDENEN Betrieben kommen. Drei Filialen
 * derselben Franchise sind EINE Beziehung, kein Branchenmuster — das steht
 * so im Hypothesen-Register, und es gilt fuer Produktideen genauso.
 */

import { MUSTER_AB } from "@/lib/verlust"
import { KATALOG, freigabeTraegt, type Betragsfreigabe, type KatalogKey } from "@/lib/angebot"
import { eintragZu, standTraegt, veraltet, wegTraegt, type PortfolioEintrag } from "@/lib/produkt"
import { steuerlage } from "@/lib/rechnung"
import { productWorks } from "@/lib/site-data"

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · DIE SCHWELLE
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Ab welcher Stufe ein Produkt ueberhaupt verkauft werden darf.
 *
 * `pilot`, nicht `live`: Ein Pilot WIRD verkauft — als Pilot, mit uns
 * daneben, und das ist ein ehrliches Angebot. Was nicht geht, ist
 * `in-development` und `private-beta`: Dort gibt es keinen Betrieb, den man
 * zusagen koennte, und eine geschlossene Testphase ist eine Einladung, kein
 * Kaufvertrag.
 */
export const VERKAUFSREIFE_AB: readonly string[] = ["pilot", "live"]

/**
 * Woher der Preis eines Produkts kommt.
 *
 * Dieselbe Trennung wie bei den Angebotspositionen (G17): ein Verweis in
 * den Katalog oder ein Betrag mit Owner-Freigabe. Getippt wird nichts.
 */
export type Preisquelle =
  | { art: "katalog"; quelle: KatalogKey }
  | { art: "zuschnitt"; freigabe: Betragsfreigabe }

export function preisquelleTraegt(p: Preisquelle | null | undefined): boolean {
  if (!p) return false
  if (p.art === "katalog") return typeof KATALOG[p.quelle] === "function" && KATALOG[p.quelle]() !== null
  return freigabeTraegt(p.freigabe)
}

/**
 * Wer das Produkt betreibt, nachdem es verkauft ist.
 *
 * `haus` ist der Normalfall dieses Hauses („wir uebergeben nicht und
 * verschwinden"). `kunde` ist erlaubt und ehrlich — dann steht im Angebot,
 * was das praktisch heisst. Was NICHT erlaubt ist, ist die Luecke.
 */
export const BETRIEB_DANACH = ["haus", "kunde", "gemeinsam"] as const
export type BetriebDanach = (typeof BETRIEB_DANACH)[number]

export type Verkaufslage = {
  slug: string
  preis: Preisquelle | null
  betriebDanach: BetriebDanach | null
}

/**
 * DER BESTAND — heute leer, und das ist die wahre Angabe.
 *
 * Keines der vier Produkte wird verkauft. Es gibt keinen Produktpreis auf
 * der Seite, keine Produkt-Angebotsart in `OFFER_KINDS`, und keinen
 * bestaetigten Reifegrad (G24, 0 von 4). Ein Eintrag hier waere eine
 * Verkaufsabsicht, die niemand geaeussert hat.
 */
export const VERKAUFSLAGEN: readonly Verkaufslage[] = []

export function lageZu(slug: string): Verkaufslage | null {
  return VERKAUFSLAGEN.find((l) => l.slug === slug) ?? null
}

export type Huerde = { bedingung: string; satz: string }

/**
 * Was einem Produkt zum Verkauf fehlt.
 *
 * Kein Zaehler und keine Quote: Was fehlt, steht als Satz da. Eine Quote
 * laedt dazu ein, Haken zu setzen, damit sie steigt — dieselbe Begruendung
 * wie bei der Angebotsreife in G07/G08.
 */
export function huerden(slug: string, heute = new Date()): Huerde[] {
  const h: Huerde[] = []
  const eintrag: PortfolioEintrag | null = eintragZu(slug)
  const lage = lageZu(slug)

  if (!eintrag) {
    h.push({
      bedingung: "Portfolio",
      satz: "Das Produkt steht in keinem Portfolio-Eintrag (G24). Was niemand fuehrt, verkauft niemand.",
    })
    return h
  }

  /* 1 · Reifegrad */
  if (!standTraegt(eintrag.stand)) {
    h.push({
      bedingung: "Reifegrad",
      satz:
        "Kein bestaetigter Reifegrad (G24). Verkaufen heisst zusagen, dass es laeuft — " +
        "und das kann niemand zusagen, der die Stufe nicht bestaetigt hat.",
    })
  } else if (veraltet(eintrag.stand, heute)) {
    h.push({
      bedingung: "Reifegrad",
      satz: `Der Reifegrad ist seit ${eintrag.stand!.bestaetigtAm} nicht nachbestaetigt. Zu alt fuer eine Zusage.`,
    })
  } else if (!VERKAUFSREIFE_AB.includes(eintrag.stand!.stufe)) {
    h.push({
      bedingung: "Reifegrad",
      satz:
        `Stufe „${eintrag.stand!.stufe}" — verkaeuflich ist ab ${VERKAUFSREIFE_AB.join(" / ")}. ` +
        "Eine geschlossene Testphase ist eine Einladung, kein Kaufvertrag.",
    })
  }

  /* 2 · Eigentuemer */
  if (!eintrag.eigentuemer?.trim()) {
    h.push({ bedingung: "Eigentuemer", satz: "Niemand antwortet fuer das Produkt (G24)." })
  }

  /* 3 · Rueckmeldeweg */
  if (!wegTraegt(eintrag.rueckmeldung)) {
    h.push({
      bedingung: "Rueckmeldeweg",
      satz:
        "Kein Weg fuer eine Stoerung (G24). Etwas zu verkaufen, dessen Fehler niemand melden kann, " +
        "verkauft ein Waisenkind.",
    })
  }

  /* 4 · Preisquelle */
  if (!preisquelleTraegt(lage?.preis)) {
    h.push({
      bedingung: "Preis",
      satz:
        "Keine belastbare Preisquelle (G17): Katalog oder Owner-Freigabe mit Fundstelle. " +
        "Getippt wird eine Zahl nicht.",
    })
  }

  /* 5 · Steuerlage */
  const steuer = steuerlage()
  if (steuer.art === "offen") {
    h.push({
      bedingung: "Steuerlage",
      satz:
        "Der Umsatzsteuer-Status ist offen (G18). Was niemand abrechnen kann, kann niemand verkaufen — " +
        "das ist die kaufmaennische Grenze, nicht die technische.",
    })
  }

  /* 6 · Betrieb danach */
  if (!lage?.betriebDanach) {
    h.push({
      bedingung: "Betrieb danach",
      satz:
        "Es steht nicht fest, wer das Produkt nach dem Verkauf betreibt. Das Haus sagt oeffentlich, " +
        "es uebergebe nicht und verschwinde — ohne diese Angabe waere der Satz beim ersten " +
        "Verkauf gebrochen.",
    })
  }

  return h
}

export function verkaeuflich(slug: string, heute = new Date()): boolean {
  return huerden(slug, heute).length === 0
}

/** Die verkaeuflichen Produkte — heute keines, und das Gate sagt warum. */
export function verkaeuflicheProdukte(heute = new Date()): string[] {
  return productWorks.filter((w) => verkaeuflich(w.slug, heute)).map((w) => w.slug)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DIE SCHLEIFE
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Woher eine Beobachtung stammt. Jede Quelle ist eine, die es schon gibt. */
export const BEOBACHTUNG_QUELLEN = ["verlust", "anfrage", "projekt", "gespraech"] as const
export type BeobachtungQuelle = (typeof BEOBACHTUNG_QUELLEN)[number]

export type Beobachtung = {
  quelle: BeobachtungQuelle
  /** Das Problem in den Worten des Betriebs, nicht in unseren. */
  was: string
  /**
   * BEI WEM. Der entscheidende Teil: Drei Beobachtungen bei EINEM Betrieb
   * sind ein Problem, kein Muster. Das Hypothesen-Register sagt es fuer den
   * Markt („drei Filialen derselben Franchise sind EINE Beziehung"), und
   * fuer Produktideen gilt es genauso.
   */
  bei: string
  /** Wo es steht — Vorgang, Notiz, Protokoll. */
  beleg: string
}

export type Produktkandidat = {
  key: string
  /** Das wiederkehrende Problem, in einem Satz. */
  problem: string
  beobachtungen: Beobachtung[]
  /**
   * Was daraus werden koennte — bewusst als Frage formuliert und nicht als
   * Produktname. Ein Name macht aus einer Beobachtung ein Vorhaben, bevor
   * jemand entschieden hat.
   */
  these: string
}

/**
 * DER BESTAND — heute leer.
 *
 * Es gibt kein Muster, weil es die Beobachtungen noch nirgends gesammelt
 * gab. G16 hat die Verlustgruende strukturiert, G10/G11 die Recherche —
 * die Quellen existieren jetzt. Ein erfundener Kandidat waere die Sorte
 * Fassade, die dieses Haus nicht baut.
 */
export const KANDIDATEN: readonly Produktkandidat[] = []

export function beobachtungTraegt(b: Beobachtung): boolean {
  if (!(BEOBACHTUNG_QUELLEN as readonly string[]).includes(b.quelle)) return false
  if ((b.was?.trim().length ?? 0) < 10) return false
  if ((b.bei?.trim().length ?? 0) < 2) return false
  return (b.beleg?.trim().length ?? 0) >= 8
}

/** Wie viele VERSCHIEDENE Betriebe hinter einem Kandidaten stehen. */
export function betriebeHinter(k: Produktkandidat): number {
  return new Set(
    k.beobachtungen.filter(beobachtungTraegt).map((b) => b.bei.trim().toLowerCase()),
  ).size
}

export type Kandidatenlage = {
  kandidat: Produktkandidat
  tragende: number
  betriebe: number
  /** Ab `MUSTER_AB` Beobachtungen bei mindestens zwei Betrieben. */
  muster: boolean
  fehlt: string[]
}

/**
 * Traegt dieser Kandidat ein Muster?
 *
 * Zwei Bedingungen, und die zweite ist die, die man vergisst: genug
 * Beobachtungen UND genug verschiedene Betriebe. Drei Meldungen desselben
 * Kunden sind ein Kundenproblem — und das loest man in seinem Projekt,
 * nicht mit einem Produkt.
 */
export function kandidatenlage(k: Produktkandidat): Kandidatenlage {
  const tragende = k.beobachtungen.filter(beobachtungTraegt).length
  const betriebe = betriebeHinter(k)
  const fehlt: string[] = []

  if (tragende < MUSTER_AB) {
    fehlt.push(
      `${tragende} belegte Beobachtung(en) — ein Muster beginnt bei ${MUSTER_AB}. ` +
        "Ein Fall ist ein Zufall, zwei eine Beobachtung.",
    )
  }
  if (betriebe < 2) {
    fehlt.push(
      `Nur ${betriebe} Betrieb(e) dahinter. Drei Meldungen desselben Kunden sind ein ` +
        "Kundenproblem — das loest man im Projekt, nicht mit einem Produkt.",
    )
  }
  if (!k.problem?.trim() || !k.these?.trim()) {
    fehlt.push("Problem oder These fehlt. Ein Kandidat ohne beides ist ein Name.")
  }

  return { kandidat: k, tragende, betriebe, muster: fehlt.length === 0, fehlt }
}

/** Die Kandidaten, die ein Muster tragen — heute keiner. */
export function muster(): Kandidatenlage[] {
  return KANDIDATEN.map(kandidatenlage).filter((l) => l.muster)
}
