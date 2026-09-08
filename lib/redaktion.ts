/**
 * G15 · REDAKTION — der Weg, auf dem aus einem Beleg ein Beitrag wird.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DER GATE-VERTRAG
 *
 * „G15 · Inhalte & Nachfrage — Heute: Insights duenn, kein Redaktionsweg.
 *  Ziel: ein Inhaltssystem, das aus BELEGEN Nachfrage macht.
 *  Grenze: keine erfundene Werbeeinwilligung, kein Ads-Sturm."
 *
 * Gemessen am 09.09.2026: EIN veroeffentlichter Beitrag, fuenf von sechs
 * Faechern leer. Das ist der „duenne" Teil, und er gehoert dem Owner — Texte
 * schreibt kein Gate.
 *
 * Der ZWEITE Teil gehoert dem System, und der ist der eigentliche Befund:
 * Es gab keinen Weg. Ein Beitrag entstand, indem jemand 190 Zeilen
 * viersprachiges TypeScript an eine Liste haengte und `published: true`
 * schrieb. Kein Zustand dazwischen, keine Frage, woher die Zahlen kommen,
 * keine Verbindung zu dem, was das Haus verkauft.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM BELEGE UND NICHT „QUALITAET"
 *
 * Ein Inhaltssystem kann nicht pruefen, ob ein Text gut ist. Es kann pruefen,
 * ob er STEHT: ob die Zahlen darin eine Quelle haben, ob ein genannter Kunde
 * eine Freigabe hat, ob die Fundstelle es wirklich gibt.
 *
 * Genau dieselbe Bauart wie Gate 13 (`lib/proof.ts`), und aus demselben
 * Grund: Dort konnte ein `approved: true` gesetzt werden, ohne dass jemand
 * sagen musste wer, wann und worueber. Hier konnte ein `published: true`
 * gesetzt werden, ohne dass jemand sagen musste, worauf der Text steht.
 *
 * Die Freigabe-Frage wird deshalb NICHT zweimal beantwortet: Nennt ein
 * Beitrag einen Kunden, gilt dieselbe Freigabe aus Gate 13, geprueft mit
 * derselben Funktion. Eine zweite Wahrheit ueber denselben Kunden waere in
 * vier Wochen eine andere.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE GRENZE AUS DEM VERTRAG — UND WARUM SIE SCHON GELEBT WIRD
 *
 * „Keine erfundene Werbeeinwilligung": Das Haus hat sich gegen ein
 * Newsletter-Feld entschieden (`lib/site-data.ts`, MP-Audit) — „ein
 * Newsletter-Feld verspricht Post". Diese Entscheidung stand bisher als
 * Kommentar. Jetzt steht sie als Regel: Ein Beitrag darf kein Feld tragen,
 * das eine Adresse einsammelt, und keine Fremdschrift, die Reichweite kauft.
 *
 * Ein Kommentar, der eine Entscheidung traegt und von niemandem gelesen
 * wird, ist keine Sicherung — das war die Lehre aus Gate 13.
 */

import type { Localized } from "@/lib/site-data"

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · WORAUF EIN BEITRAG STEHEN DARF
 * ═══════════════════════════════════════════════════════════════════════════ */

export const BELEG_ARTEN = {
  "eigener-befund": {
    label: "Eigener Befund",
    zeigt: "Eine Pruefung am eigenen Objekt, dokumentiert in diesem Haus.",
    /** Die Fundstelle ist ein Pfad im Repo und wird als Datei nachgeschlagen. */
    fundstelleIstDatei: true,
    darfZahlenTragen: true,
    brauchtKundenfreigabe: false,
  },
  "eigene-messung": {
    label: "Eigene Messung",
    zeigt: "Ein Lauf aus diesem Haus — ein Skript, das jeder wiederholen kann.",
    fundstelleIstDatei: true,
    darfZahlenTragen: true,
    brauchtKundenfreigabe: false,
  },
  "eigenes-produkt": {
    label: "Eigenes Produkt",
    zeigt: "Ein System, das dieses Haus gebaut hat und selbst betreibt.",
    fundstelleIstDatei: false,
    /*
     * Ein Produkt belegt, DASS es laeuft — nicht, wie gut. Wer eine Zahl aus
     * dem eigenen Betrieb nennt, braucht die Messung dazu, nicht das Produkt.
     * (Dieselbe Trennung wie `PROOF_KINDS.belegtNicht` in Gate 13.)
     */
    darfZahlenTragen: false,
    brauchtKundenfreigabe: false,
  },
  kundenbeleg: {
    label: "Kundenbeleg",
    zeigt: "Etwas, das bei einem Kunden entstanden ist.",
    fundstelleIstDatei: false,
    darfZahlenTragen: false,
    /** Gate 13 entscheidet — hier wird nur nachgeschlagen, nie neu entschieden. */
    brauchtKundenfreigabe: true,
  },
  "oeffentliche-quelle": {
    label: "Oeffentliche Quelle",
    zeigt: "Eine Norm, ein Gesetz, eine Veroeffentlichung Dritter.",
    fundstelleIstDatei: false,
    darfZahlenTragen: true,
    brauchtKundenfreigabe: false,
  },
} as const

export type BelegArt = keyof typeof BELEG_ARTEN

export type Beleg = {
  art: BelegArt
  /**
   * WO ES STEHT. Bei `eigener-befund` und `eigene-messung` ein Pfad in
   * diesem Haus (`docs/…`, `scripts/…`) — das Gate schlaegt ihn nach.
   * Sonst der Name der Norm oder der Slug des Kundenwerks.
   *
   * Kein Feld fuer „intern" oder „bekannt". Eine Fundstelle, die niemand
   * aufschlagen kann, ist keine.
   */
  fundstelle: string
  /** Was dieser Beleg traegt — in einem Satz, fuer den Gegenleser. */
  traegt: string
  /**
   * Traegt er die ZAHLEN des Beitrags? Nur eine Art, die es darf, darf es
   * behaupten — sonst faellt das Gate.
   */
  traegtZahlen?: boolean
}

/** Eine Fundstelle, die niemand aufschlagen kann, ist keine. */
export function fundstelleTraegt(beleg: Beleg): boolean {
  const s = beleg.fundstelle.trim()
  if (s.length < 6) return false
  return !/^(intern|bekannt|eigene quelle|siehe oben|diverse)$/i.test(s)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DER WEG
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Drei Zustaende, und der mittlere ist der Grund, warum es sie gibt.
 *
 * Vorher gab es `published: boolean` — zwei Zustaende, und zwischen ihnen
 * nichts. Ein Text war damit entweder unsichtbar oder oeffentlich; die
 * Strecke, auf der ein Mensch ihn gegenliest, existierte nicht. Genau
 * dieselbe Luecke wie in Gate 11 zwischen „wir wissen genug" und „wir
 * schreiben": Wo kein Zustand steht, steht auch kein Mensch.
 */
export const REDAKTIONSWEG = {
  entwurf: {
    label: "Entwurf",
    was: "Der Text existiert. Er steht nirgends und ist in keiner Sitemap.",
    verlangt: "nichts — ein Entwurf darf unfertig sein.",
  },
  gegenlesen: {
    label: "Gegenlesen",
    was: "Der Text ist fertig und wartet auf einen zweiten Blick.",
    verlangt:
      "Belege vollstaendig, Fundstellen aufschlagbar, jede genannte Marke gedeckt. " +
      "Ab hier prueft das Gate mit — sichtbar ist der Text weiterhin nicht.",
  },
  veroeffentlicht: {
    label: "Veroeffentlicht",
    was: "Der Text steht auf /insights, in der Sitemap und im Suchindex.",
    verlangt:
      "alles aus dem Gegenlesen, plus ein Ziel: wohin der Leser gehen kann, " +
      "wenn ihn der Text ueberzeugt hat.",
  },
} as const

export type Zustand = keyof typeof REDAKTIONSWEG

/** Ab hier prueft das Gate mit. */
export function wirdGeprueft(z: Zustand): boolean {
  return z === "gegenlesen" || z === "veroeffentlicht"
}

/** Nur das steht oeffentlich. */
export function istOeffentlich(z: Zustand): boolean {
  return z === "veroeffentlicht"
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · ZAHLEN
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Traegt dieser Text Zahlen, die eine Quelle brauchen?
 *
 * ───────────────────────────────────────────────────────────────────────────
 * WARUM NICHT „JEDE ZIFFER"
 *
 * Der erste Entwurf dieser Regel meldete jede Zahl — und damit „WCAG 2.4.7",
 * „23. August 2026" und „Schritt 1". Ein Gate, das eine Norm-Nummer als
 * unbelegte Kennzahl meldet, wird nach dem dritten Beitrag ausgeschaltet,
 * und danach findet es auch die echte nicht mehr.
 *
 * Gesucht ist die BEHAUPTUNG mit Ziffern: ein Prozentwert, eine Anzahl mit
 * Einheit, ein Faktor. Nicht gesucht: Verweise (WCAG, ISO, DIN, §),
 * Datumsangaben und blosse Ordnungszahlen.
 */
export function kennzahlenIm(text: string): string[] {
  const ohneVerweise = text
    .replace(/\b(WCAG|ISO|DIN|EN|BITV|RFC|§)\s*[\d.:—-]+/gi, " ")
    .replace(/\b\d{1,2}\.\s*(Januar|Februar|M(ä|ae)rz|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s*\d{4}/gi, " ")
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ")

  const treffer = new Set<string>()
  const muster = [
    /\b\d+(?:[.,]\d+)?\s*%/g,
    /\b\d+(?:[.,]\d+)?\s*(px|Pixel|ms|Sekunden?|Minuten?|Stunden?|Tage?|Wochen?|Monate?|EUR|€|MB|KB|kg|km)\b/gi,
    /\bFaktor\s*\d+(?:[.,]\d+)?/gi,
    /\b\d+(?:[.,]\d+)?\s*:\s*\d+(?:[.,]\d+)?\b/g,
    /\b\d+\s*(?:von|aus)\s*\d+\b/gi,
  ]
  for (const m of muster) {
    for (const t of ohneVerweise.matchAll(m)) treffer.add(t[0].trim())
  }
  return [...treffer]
}

/** Trägt einer der Belege die Zahlen — und darf seine Art das überhaupt? */
export function zahlenGedeckt(belege: readonly Beleg[]): boolean {
  return belege.some((b) => b.traegtZahlen === true && BELEG_ARTEN[b.art].darfZahlenTragen)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · FREMDE NAMEN
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Welche fremden Marken nennt dieser Text?
 *
 * Gate 13 hat sieben Wege geschlossen, auf denen ein Kundenname ohne
 * Freigabe an die Oeffentlichkeit kam — und das Gate fand danach den achten
 * (ein Datenblock im RSC-Payload). `/insights` ist der neunte: Ein Beitrag
 * ist Fliesstext, und in Fliesstext kann jeder Name stehen, ohne dass eine
 * Liste ihn je gesehen haette.
 *
 * Deshalb wird hier nicht der Datensatz geprueft, sondern der TEXT.
 */
export function genannteMarken(text: string, marken: readonly string[]): string[] {
  const gefunden: string[] = []
  for (const marke of marken) {
    const wort = marke.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    /* Wortgrenze, damit „maqam" nicht in „maqamat" trifft. */
    if (new RegExp(`(^|[^\\p{L}\\p{N}])${wort}([^\\p{L}\\p{N}]|$)`, "iu").test(text)) {
      gefunden.push(marke)
    }
  }
  return gefunden
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 5 · NACHFRAGE
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * WOHIN DER LESER GEHEN KANN.
 *
 * Das ist die Haelfte des Gate-Titels, die man am leichtesten vergisst:
 * „Inhalte UND Nachfrage". Ein Beitrag, der niemanden irgendwohin fuehrt,
 * ist ein Tagebuch — er kostet dieselbe Arbeit und traegt nichts in den
 * Trichter.
 *
 * `fuehrtZu` ist eine Adresse in diesem Haus, und das Gate schlaegt sie
 * nach. `weilLeserFragt` ist der Satz, den der Leser nach dem Text im Kopf
 * hat — er steht hier, damit die Verbindung eine BEGRUENDUNG hat und nicht
 * nur einen Link.
 *
 * Was hier NICHT steht: ein Feld, das eine Adresse einsammelt. Das Haus hat
 * sich gegen den Newsletter entschieden, und die Grenze im Gate-Vertrag
 * heisst „keine erfundene Werbeeinwilligung". Ein Beitrag fuehrt auf eine
 * Seite — nicht in einen Verteiler.
 */
export type Nachfrage = {
  /** Eine Adresse dieses Hauses, ohne Sprachpraefix (z. B. "/leistungen/webdesign"). */
  fuehrtZu: string
  /** Die Frage, die der Leser danach hat. */
  weilLeserFragt: Localized
}

/** Ein Ziel ausserhalb des Hauses waere kein Trichter, sondern ein Ausgang. */
export function zielIstImHaus(n: Nachfrage): boolean {
  return n.fuehrtZu.startsWith("/") && !n.fuehrtZu.startsWith("//")
}
