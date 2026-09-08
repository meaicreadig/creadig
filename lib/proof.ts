/*
 * ==========================================================================
 * BELEG & FREIGABE — WER HAT ZUGESTIMMT, WOZU, UND WO STEHT DAS?
 * ==========================================================================
 *
 * Gate 11 hat gelernt: Ein Name ohne Fundstelle ist eine Vermutung, und eine
 * Vermutung darf keinen Menschen erreichen.
 *
 * Gate 13 stellt dieselbe Frage eine Ebene weiter oben:
 *
 *   Eine FREIGABE ohne Fundstelle ist auch nur eine Vermutung —
 *   und diese Vermutung erreicht nicht einen Menschen, sondern die
 *   Oeffentlichkeit.
 *
 * ---------------------------------------------------------------------------
 * DER BEFUND, DER DIESES MODUL AUSGELOEST HAT
 *
 * Bis zum 08.09.2026 beantworteten VIER Stellen dieselbe Rechtsfrage —
 * „hat der Kunde der Nennung zugestimmt?" — auf vier verschiedene Arten:
 *
 *   Work.approvalOnFile?: boolean   optional, faellt still auf `undefined`
 *   CaseStudy.approved: boolean     ein Ja ohne Wer, Wann und Worueber
 *   Review.approved: boolean        dasselbe noch einmal
 *   clientLogos: approved: true     FEST VERDRAHTET fuer alle
 *
 * Die vierte war der Schaden. `clientLogos` entsteht aus `clientWorks` per
 * `.map()` und stempelte jedem Eintrag `approved: true` auf — mit dem
 * Kommentar, in dieser Liste stehe nur, wen der Owner freigegeben habe.
 * In denselben Datensaetzen stand `approvalOnFile: false`.
 *
 * Und das Feld wirkte nicht einmal: `logo-wall.tsx` und `logo-strip.tsx`
 * lesen `{ name, mark, region, color, logoPath }` — `approved` war nie dabei.
 * Ein Feld, das eine Rechtsaussage traegt und von niemandem gelesen wird,
 * ist keine Sicherung. Es ist eine Beruhigung.
 *
 * Ergebnis im Betrieb: Drei Kundennamen standen oeffentlich auf der Logowand,
 * waehrend `/status` im selben Build meldete, die Freigabe fehle.
 *
 * ---------------------------------------------------------------------------
 * DIE ANTWORT: EINE STELLE, UND SIE VERLANGT EINE FUNDSTELLE
 *
 * Ab hier gibt es kein `approved: boolean` mehr, das man setzen kann. Es gibt
 * FREIGABEN — jede mit Person, Form, Datum, Umfang und Fundstelle. Ob etwas
 * gezeigt werden darf, wird daraus ABGELEITET, nie gespeichert.
 *
 * Dieselbe Ueberlegung wie bei der Einordnung in G10: Eine gespeicherte
 * Ableitung ist ab der ersten Regelaenderung still falsch.
 *
 * WAS HIER BEWUSST NICHT STEHT: das Freigabedokument selbst. `reference` sagt,
 * WO es liegt — Postfach, Vertragsordner, oeffentliche Adresse. Ein Repository
 * wird geklont, gesichert und irgendwann geteilt; eine Kundenmail gehoert
 * nicht hinein. Dieselbe Sperre wie beim CRM-Import aus Gate 01.
 */

/* ── Was eine Freigabe abdecken kann ────────────────────────────────────── */

/**
 * Die fuenf Umfaenge aus der Freigabe-Matrix in `docs/ops/proof-kinds.md`.
 *
 * Sie sind ABSICHTLICH getrennt und nicht gestuft. „Sie duerfen uns nennen"
 * ist keine Erlaubnis, ein Zitat zu drucken, und die Erlaubnis fuer ein Zitat
 * deckt keine Zahl. Wer daraus eine Stufenleiter macht, bekommt genau den
 * Fehler, den die Matrix verhindern soll.
 */
export const RELEASE_SCOPES = ["name", "logo", "fallstudie", "zahl", "zitat"] as const
export type ReleaseScope = (typeof RELEASE_SCOPES)[number]

export const SCOPE_LABEL: Record<ReleaseScope, string> = {
  name: "Nennung des Kundennamens",
  logo: "Verwendung des Logos",
  fallstudie: "Veröffentlichung der Fallstudie",
  zahl: "Nennung einer Kennzahl zur Wirkung",
  zitat: "Veröffentlichung eines Zitats im Originalwortlaut",
}

/* ── In welcher Form sie vorliegt ───────────────────────────────────────── */

/**
 * Nur Formen, die man in einem Jahr noch vorzeigen kann.
 *
 * Ein „ja klar" im Telefonat fehlt hier mit Absicht — es ist keine Form,
 * sondern eine Erinnerung. Wer es trotzdem hat, holt es schriftlich nach;
 * das ist eine Mail und zwei Minuten.
 */
export const RELEASE_FORMS = [
  "e-mail",
  "vertrag",
  "unterschrift",
  "schriftliche-nachricht",
  "oeffentlich-veroeffentlicht",
] as const
export type ReleaseForm = (typeof RELEASE_FORMS)[number]

export const FORM_LABEL: Record<ReleaseForm, string> = {
  "e-mail": "E-Mail",
  vertrag: "Vertrag",
  unterschrift: "Unterschrift",
  "schriftliche-nachricht": "Schriftliche Nachricht",
  "oeffentlich-veroeffentlicht": "Vom Kunden selbst öffentlich veröffentlicht",
}

/**
 * WELCHE FORM WELCHEN UMFANG UEBERHAUPT TRAGEN KANN.
 *
 * Der Grund fuer diese Tabelle ist ein einziger Fall, und er kommt sicher:
 * Jemand findet eine gute Google-Bewertung und haelt sie fuer eine Freigabe.
 * Ist sie auch — fuer das ZITAT. Der Mensch hat es selbst oeffentlich
 * geschrieben, die Adresse ist die Fundstelle, das traegt.
 *
 * Er hat damit aber nicht zugestimmt, dass sein Logo auf der Startseite
 * erscheint oder dass eine Fallstudie ueber sein Unternehmen veroeffentlicht
 * wird. Ohne diese Tabelle wuerde die freundlichste Quelle die weitreichendste
 * Erlaubnis erzeugen.
 */
export const FORM_SCOPES: Record<ReleaseForm, readonly ReleaseScope[]> = {
  "e-mail": RELEASE_SCOPES,
  vertrag: RELEASE_SCOPES,
  unterschrift: RELEASE_SCOPES,
  "schriftliche-nachricht": RELEASE_SCOPES,
  "oeffentlich-veroeffentlicht": ["zitat"],
}

/* ── Die Freigabe ───────────────────────────────────────────────────────── */

export type Release = {
  /** Wer sie erteilt hat — ein Mensch, keine Firma allein. */
  by: { name: string; role: string; company: string }
  form: ReleaseForm
  /** Wann, ISO (YYYY-MM-DD). */
  at: string
  /** Wofuer genau. Leer waere eine Zustimmung zu nichts. */
  scopes: ReleaseScope[]
  /**
   * WO die schriftliche Freigabe liegt — Postfach, Ordner, oeffentliche
   * Adresse. Das Dokument selbst gehoert nicht ins Repository.
   */
  reference: string
  /**
   * Zurueckgezogen am. Eine Freigabe ist kuendbar, und wer sie zurueckzieht,
   * erwartet zu Recht, dass es sofort wirkt. Der Eintrag BLEIBT stehen — man
   * muss spaeter erklaeren koennen, warum damals etwas veroeffentlicht wurde.
   */
  withdrawnAt?: string | null
}

/** Eine zurueckgezogene Freigabe deckt nichts mehr — ab sofort, nicht ab Redaktionsschluss. */
export function gueltig(r: Release): boolean {
  return !r.withdrawnAt
}

/**
 * Welche Umfaenge decken diese Freigaben tatsaechlich ab?
 *
 * Nur gueltige zaehlen, und nur, was die FORM tragen kann. Eine Mail, die
 * „alles" sagt, deckt alles; eine oeffentliche Bewertung deckt ein Zitat,
 * auch wenn jemand `scopes: ["logo"]` daneben schreibt.
 */
export function gedeckteScopes(releases: readonly Release[]): Set<ReleaseScope> {
  const out = new Set<ReleaseScope>()
  for (const r of releases) {
    if (!gueltig(r)) continue
    const erlaubt = FORM_SCOPES[r.form]
    for (const s of r.scopes) if (erlaubt.includes(s)) out.add(s)
  }
  return out
}

export type Deckung = {
  gedeckt: boolean
  /** Was fehlt — der Satz, den der Owner braucht, um es zu holen. */
  fehlend: ReleaseScope[]
  grund: string
}

/**
 * Traegt die Freigabelage das, was gezeigt werden soll?
 *
 * Entscheidet NICHT, ob etwas gut ist. Sie sagt, ob es gedeckt ist — und
 * benennt im Fehlfall genau die fehlende Spalte. „Fehlt eine Spalte, fehlt
 * der Beleg. Nicht schwaecher formulieren — weglassen." (proof-kinds.md)
 */
export function deckung(releases: readonly Release[], benoetigt: readonly ReleaseScope[]): Deckung {
  const da = gedeckteScopes(releases)
  const fehlend = benoetigt.filter((s) => !da.has(s))
  if (fehlend.length === 0)
    return {
      gedeckt: true,
      fehlend: [],
      grund: benoetigt.length
        ? `Freigegeben: ${benoetigt.map((s) => SCOPE_LABEL[s]).join(" · ")}`
        : "Nichts zu decken.",
    }
  return {
    gedeckt: false,
    fehlend,
    grund:
      releases.length === 0
        ? `Keine schriftliche Freigabe hinterlegt. Es fehlt: ${fehlend.map((s) => SCOPE_LABEL[s]).join(" · ")}.`
        : `Die vorliegende Freigabe deckt das nicht ab. Es fehlt: ${fehlend.map((s) => SCOPE_LABEL[s]).join(" · ")}.`,
  }
}

/* ── Was ein Inhalt VERLANGT — abgeleitet, nicht erklaert ───────────────── */

/**
 * Der Bedarf faellt aus dem, was gezeigt wird.
 *
 * Das ist die eigentliche Sicherung. Wuerde jemand den Bedarf danebenschreiben,
 * koennte er ihn kleinrechnen: eine Fallstudie mit Kennzahl und Zitat, die
 * `benoetigt: ["name"]` behauptet, waere gedeckt und trotzdem falsch.
 *
 * Deshalb liest jede dieser Funktionen den INHALT und sagt, was er verlangt.
 * Wer eine Kennzahl hinzufuegt, erhoeht damit automatisch die Freigabehuerde
 * — und merkt es beim naechsten Build, nicht beim Anwalt.
 */

/** Ein Kundenname erscheint; ein Logo nur, wenn eines vorliegt. */
export function benoetigtFuerLogo(hatLogo: boolean): ReleaseScope[] {
  return hatLogo ? ["name", "logo"] : ["name"]
}

/** Eine Fallstudie: immer Name und Veroeffentlichung, dazu Zahl und Zitat, wenn vorhanden. */
export function benoetigtFuerFall(input: { metriken: number; hatZitat: boolean }): ReleaseScope[] {
  const s: ReleaseScope[] = ["name", "fallstudie"]
  if (input.metriken > 0) s.push("zahl")
  if (input.hatZitat) s.push("zitat")
  return s
}

/**
 * Eine Stimme: das Zitat immer, der Firmenname nur, wenn er mitgezeigt wird.
 *
 * Der Name der PERSON ist Teil des Zitats — ein anonymes Zitat waere keins.
 * Der FIRMENname ist eine eigene Aussage ueber ein Unternehmen und braucht
 * deshalb `name`.
 */
export function benoetigtFuerStimme(input: { hatFirma: boolean }): ReleaseScope[] {
  return input.hatFirma ? ["zitat", "name"] : ["zitat"]
}

/* ── Die drei Beleg-Arten ───────────────────────────────────────────────── */

/**
 * `docs/ops/proof-kinds.md` in ausfuehrbarer Form — die Spalte „Wer muss
 * freigeben" ist der Teil, der hier zaehlt.
 */
export const PROOF_KINDS = {
  "eigenes-produkt": {
    label: "Eigenes Produkt",
    zeigt: "Was creaDIG gebaut hat und selbst betreibt.",
    freigabe: "Owner allein — kein Dritter ist betroffen.",
    /** Ein eigenes Produkt braucht keine Kundenfreigabe. */
    brauchtKundenfreigabe: false,
    belegtNicht: "Dass ein Kunde damit arbeitet.",
  },
  kundenprojekt: {
    label: "Kundenprojekt",
    zeigt: "Was creaDIG für Dritte gebaut hat.",
    freigabe: "Kunde schriftlich + Owner.",
    brauchtKundenfreigabe: true,
    belegtNicht: "Welche Wirkung es hatte.",
  },
  kundenergebnis: {
    label: "Kundenergebnis",
    zeigt: "Was sich beim Kunden messbar geändert hat.",
    freigabe: "Kunde schriftlich + belegbare Messquelle.",
    brauchtKundenfreigabe: true,
    belegtNicht: "— die höchste Stufe.",
  },
} as const
export type ProofKind = keyof typeof PROOF_KINDS

/**
 * Eine Kennzahl ohne Quelle ist eine Behauptung mit Ziffern.
 *
 * `CaseMetric.source` ist im Typ bereits Pflicht — diese Funktion faengt den
 * Fall ab, den ein Typ nicht faengt: eine Quelle, die nur aus Leerzeichen
 * besteht oder aus einem Wort wie „intern".
 */
export function messquelleTraegt(source: string): boolean {
  const s = source.trim()
  if (s.length < 12) return false
  return !/^(intern|eigene messung|schätzung|schaetzung|ca\.?)$/i.test(s)
}
