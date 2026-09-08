/**
 * G16 · HERKUNFT — die Erklaerung ist der Schluessel, nicht der Kommentar.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DER BEFUND
 *
 * `docs/ops/utm-playbook.md` sagt seit dem 29.08.2026 klar, warum die
 * Kampagnenherkunft nicht erhoben wird:
 *
 *     „Sobald der Browser Kampagnenparameter speichert und mit dem Lead
 *      versendet, entsteht eine NEUE DATENKATEGORIE im Anfragevorgang. Sie
 *      gehoert in die Erklaerung, bevor sie in den Code gehoert."
 *
 * Das ist richtig, und es war trotzdem nicht gesichert. Der Satz beschrieb
 * einen ZUSTAND des Clients („die Seite sendet sie nicht"), keine REGEL des
 * Servers. Gemessen am 09.09.2026:
 *
 *   · `app/api/lead/route.ts` NIMMT `utmSource…utmContent` entgegen,
 *   · schreibt sie als Block „Kampagne:" in die interne Mail,
 *   · und speichert sie in der Datenbank (`utm_source` … `utm_content`).
 *   · Die Datenschutzerklaerung nennt: Name, Betrieb, E-Mail, Telefon,
 *     Nachricht. Kampagnenherkunft steht dort NICHT.
 *
 * Es fehlte also nur der Absender. Wer heute einen Aufruf mit
 * `utmCampaign` an die Route schickt — ein Formular, ein Skript, ein
 * kuenftiger Client, den jemand „nur mal ausprobiert" —, legt eine
 * Datenkategorie an, die auf der Seite nicht steht.
 *
 * Genau die Bauart, die dieses Haus schon zweimal gefunden hat: ein Feld,
 * das eine Rechtsaussage traegt und von niemandem geprueft wird (G13), und
 * eine Entscheidung, die als Kommentar dasteht statt als Sicherung (G15).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE LOESUNG IST KEIN VERBOT, SONDERN EIN SCHLUESSEL
 *
 * Die Erklaerung selbst entscheidet. `speicherbar()` liest den TEXT der
 * Datenschutzerklaerung und antwortet, ob eine Kategorie darin genannt ist.
 * Steht sie nicht drin, faellt das Feld an der Tuer — es wird nicht
 * gespeichert, nicht gemailt, nicht geloggt.
 *
 * Damit passiert zweierlei:
 *
 *   1 · Heute ist die Herkunft dicht, ohne dass jemand daran denken muss.
 *   2 * Schreibt der Owner den Satz in `lib/dictionary.ts`, geht die
 *       Attribution AN — ohne Code-Aenderung. Die Freigabe ist die
 *       Erklaerung, und das ist die richtige Reihenfolge.
 *
 * Kein Gesetzestext wird hier erfunden. Diese Datei formuliert keine
 * Erklaerung; sie schlaegt in der vorhandenen nach.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · DIE GROESSEN — fuenf, nicht fuenf Parameter
 *
 * Aus dem Playbook, unveraendert: Wer nur die fuenf `utm_*`-Felder speichert
 * und das Attribution nennt, beantwortet nur die unwichtigere Frage. Mit
 * bloss „last touch" gewinnt immer der letzte Klick — und das ist meistens
 * die Marke selbst. Dann sieht jede Kampagne schlecht aus, die am Anfang
 * steht, und genau die wird abgeschaltet.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type HerkunftGroesse = {
  key: string
  beantwortet: string
  /**
   * IST DAS EINE NEUE DATENKATEGORIE?
   *
   * `false` nur da, wo die Angabe ohnehin schon Teil des Vorgangs ist.
   * `source` ist das einzige Beispiel: Welches Formular ausgeloest hat,
   * steht bereits im Vorgang und ist von der Erklaerung gedeckt.
   */
  neueKategorie: boolean
  /**
   * Woran die Erklaerung erkennbar macht, dass sie diese Kategorie nennt.
   * Mehrere Formulierungen sind erlaubt — der Owner schreibt Deutsch, nicht
   * unseren Schluessel.
   */
  erkennbarAn: readonly string[]
}

export const HERKUNFT_GROESSEN: readonly HerkunftGroesse[] = [
  {
    key: "first-touch",
    beantwortet: "Wo hat uns dieser Mensch zum ersten Mal gesehen?",
    neueKategorie: true,
    erkennbarAn: ["kampagne", "herkunft der anfrage", "werbeträger", "werbetraeger"],
  },
  {
    key: "last-touch",
    beantwortet: "Was lag unmittelbar vor der Anfrage?",
    neueKategorie: true,
    erkennbarAn: ["kampagne", "herkunft der anfrage", "werbeträger", "werbetraeger"],
  },
  {
    key: "landing-page",
    beantwortet: "Welche Seite war der Einstieg?",
    neueKategorie: true,
    erkennbarAn: ["einstiegsseite", "aufgerufene seite", "landing"],
  },
  {
    key: "referrer",
    beantwortet: "Wer hat verlinkt?",
    neueKategorie: true,
    erkennbarAn: ["verweisende website", "verweisseite", "referrer"],
  },
  {
    key: "lead-source",
    beantwortet: "Welches Formular hat ausgeloest?",
    /* Steht seit jeher im Vorgang und ist Teil der Anfrage selbst. */
    neueKategorie: false,
    erkennbarAn: [],
  },
]

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DIE FELDER AN DER TUER
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Die Kampagnenfelder, die die Lead-Route entgegennimmt. */
export const KAMPAGNEN_FELDER = [
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmTerm",
  "utmContent",
] as const

export type KampagnenFeld = (typeof KAMPAGNEN_FELDER)[number]

/**
 * Nennt die Erklaerung die Kampagnenherkunft?
 *
 * Gesucht wird die SACHE, nicht ein Stichwort in Klammern: Der Owner wird
 * „die Herkunft Ihrer Anfrage (Kampagne, verweisende Website)" schreiben und
 * nicht `utm_source`. Deshalb mehrere Formulierungen — und deshalb wird der
 * Text normalisiert, bevor gesucht wird.
 *
 * Was diese Funktion NICHT tut: eine Erklaerung formulieren oder beurteilen,
 * ob sie juristisch traegt. Sie stellt eine Tatsachenfrage an einen Text.
 */
export function erklaerungNenntKampagne(erklaerung: string): boolean {
  const worte = HERKUNFT_GROESSEN.filter((g) => g.key === "first-touch").flatMap((g) => g.erkennbarAn)
  return saetze(erklaerung).some(
    (satz) => worte.some((w) => satz.includes(w)) && !verneint(satz),
  )
}

/**
 * EINE VERNEINUNG IST KEINE ERLAUBNIS — und der SATZ ist die Einheit.
 *
 * Der erste Entwurf des Schluessels hat nur nach dem Wort gesucht. Damit
 * haette „wir speichern KEINE Kampagnendaten" die Tuer geoeffnet: eine
 * Erklaerung, die das Gegenteil verspricht, waere zur Freigabe geworden.
 *
 * Der zweite Entwurf sah 50 Zeichen VOR der Fundstelle nach. Zwei Faelle
 * fielen sofort durch, und beide zeigen dasselbe:
 *
 *   · „Eine Auswertung der Kampagne findet NICHT statt." — die Verneinung
 *     steht dahinter. Deutsch stellt sie oft ans Satzende; ein Blick nach
 *     hinten sieht sie nie.
 *   · „Wir setzen keine Werbe-Cookies. Gespeichert wird die Kampagne …" —
 *     die Verneinung steht im VORHERIGEN Satz und ging den Nachbarn nichts
 *     an. Ein Fenster aus Zeichen kennt keine Satzgrenze.
 *
 * Beide verschwinden, wenn die Einheit der Satz ist: Eine Nennung zaehlt,
 * wenn sie in einem Satz steht, der nichts verneint.
 *
 * WO DIESE REGEL IRRT, IRRT SIE ZUR SICHEREN SEITE: „Wir speichern die
 * Kampagne, aber keine IP-Adresse" gilt als verneint und laesst die Tuer zu.
 * Das ist die richtige Richtung — im Zweifel wird weniger gespeichert. Ein
 * Owner, der die Kategorie freigeben will, schreibt ihr einen eigenen Satz;
 * das ist ohnehin die klarere Erklaerung.
 */
function saetze(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .split(/[.!?\n]+|(?:^|\s)[–—-]\s/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function verneint(satz: string): boolean {
  return /\b(kein|keine|keinen|keiner|keinerlei|nicht|ohne|niemals|verzichten)\b/.test(satz)
}

/**
 * Darf die Route Kampagnenfelder ueberhaupt annehmen?
 *
 * Ein einziger Aufruf, und er faellt zur SICHEREN Seite: Fehlt der Text,
 * ist er leer oder laesst er die Kategorie unerwaehnt, ist die Antwort nein.
 * Nachlaessigkeit fuehrt hier nicht dazu, dass mehr gespeichert wird.
 */
export function kampagneSpeicherbar(erklaerung: string | null | undefined): boolean {
  if (!erklaerung || erklaerung.trim().length === 0) return false
  return erklaerungNenntKampagne(erklaerung)
}

/**
 * Was mit den Feldern passiert, wenn die Erklaerung sie nicht deckt.
 *
 * Sie werden GELEERT, nicht abgelehnt. Der Unterschied ist wichtig: Eine
 * Anfrage darf nicht daran scheitern, dass jemand einen Kampagnenparameter
 * angehaengt hat. Der Mensch, der schreibt, hat damit nichts zu tun — er
 * verlöre seine Anfrage fuer eine Regel, die ihn schuetzen soll.
 */
export function durchDieTuer<T extends Record<string, string>>(
  felder: T,
  erlaubt: boolean,
): { felder: T; verworfen: string[] } {
  if (erlaubt) return { felder, verworfen: [] }
  const verworfen = Object.entries(felder)
    .filter(([, v]) => v !== "")
    .map(([k]) => k)
  const leer = Object.fromEntries(Object.keys(felder).map((k) => [k, ""])) as T
  return { felder: leer, verworfen }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DIE ERKLAERUNG SELBST
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Der Text der deutschen Datenschutzerklaerung, als eine Zeichenkette.
 *
 * WARUM DEUTSCH UND NICHT DIE SPRACHE DES BESUCHERS: Weil die Frage nicht
 * lautet „was hat DIESER Besucher gelesen", sondern „was hat das Haus
 * erklaert". Eine Kategorie ist erlaubt, wenn sie in der massgeblichen
 * Fassung steht — und die vier Sprachfassungen sagen dasselbe oder sie sind
 * ein eigener Fehler, den das Paritaets-Gate findet.
 */
export function datenschutzText(
  legal: {
    privacyIntro?: string
    privacyPoints?: readonly { title: string; body: string; bodyStored?: string }[]
  },
): string {
  const teile: string[] = []
  if (legal.privacyIntro) teile.push(legal.privacyIntro)
  for (const punkt of legal.privacyPoints ?? []) {
    teile.push(punkt.title, punkt.body)
    if (punkt.bodyStored) teile.push(punkt.bodyStored)
  }
  return teile.join("\n")
}
