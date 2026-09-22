/**
 * ADM-06 · meAI — DER QUALITÄTSVERTRAG, BEVOR ES EINEN ANBIETER GIBT
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIESE DATEI EXISTIERT, OBWOHL KEINE KI ANGESCHLOSSEN IST
 *
 * „KI hat eine Ausgabe geliefert" schliesst nichts ab (A8). Verlangt sind
 * acht Dinge, und sieben davon lassen sich bauen und beweisen, BEVOR jemand
 * einen Anbieter auswählt und Kosten freigibt:
 *
 *   1 Modell- und Promptversion an JEDER Ausgabe
 *   2 Eval-Set aus Fixtures, nie aus echten Kundendaten
 *   3 Halluzination: fehlende Evidenz → „unbekannt", nicht geraten
 *   4 Latenz und Kosten je Aufruf gemessen
 *   5 PII-Grenze: was das Haus verlässt, steht in einer Liste
 *   6 Degraded Mode: die Rangfolge bleibt ohne KI nutzbar
 *   7 Cross-Record-Leakage: die Antwort zu X enthält nichts aus Y
 *   8 Anbieter und Kosten — **Owner-Entscheidung**
 *
 * Punkt 8 wartet. Die anderen sieben warten nicht: Wer sie erst baut,
 * nachdem ein Anbieter dranhängt, baut sie gegen laufende Kosten und
 * echte Kundendaten — und dann wird aus „unbekannt" schnell „ungefähr".
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE TRAGENDE ENTSCHEIDUNG: DAS SYSTEM GLAUBT DER KI NICHT
 *
 * Eine Ausgabe wird nicht angenommen, weil sie plausibel klingt, sondern
 * weil jede ihrer Evidenzen im übergebenen Kontext STEHT. `pruefe()` wirft
 * alles andere weg und setzt die Antwort auf „unbekannt". Damit sind
 * Halluzination (Punkt 3) und Leakage (Punkt 7) dieselbe Prüfung, und beide
 * hängen nicht am Wohlverhalten eines Modells.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * UND DIE ZWEITE: OHNE KI IST DIE ANTWORT NICHT LEER
 *
 * `regelbasiert()` beantwortet dieselbe Frage aus Regeln — mit denselben
 * Evidenzen, in derselben Form. Die Oberfläche sieht keinen Unterschied
 * ausser dem Vermerk, woher die Antwort kam. Ein „Degraded Mode", der in
 * Wahrheit eine leere Seite ist, wäre keiner.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · WAS GEFRAGT WIRD — UND WAS DAS HAUS DAFÜR HERAUSGIBT
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Die Merkmale, die einen Vorgang beschreiben — ausschliesslich
 * Maschinenwerte und Zahlen.
 *
 * ---------------------------------------------------------------------------
 * DAS IST DIE PII-GRENZE (A8 · Punkt 5)
 *
 * Kein Name, keine Adresse, keine Nachricht, kein Freitext. Was hier nicht
 * steht, kann nicht hinausgehen — die Grenze ist der TYP, nicht die
 * Sorgfalt dessen, der den Aufruf schreibt. `pruefePIIGrenze()` prüft sie
 * zusätzlich zur Laufzeit, weil ein Typ nach dem Übersetzen nichts mehr
 * verbietet.
 *
 * `kennung` ist eine undurchsichtige Vorgangskennung. Sie identifiziert
 * einen Datensatz, keinen Menschen, und sie ist nötig, damit eine Antwort
 * einem Vorgang zugeordnet werden kann.
 */
export type Vorgangsmerkmale = {
  kennung: string
  status: string
  /** Tage seit der letzten Berührung; `null` heisst unbekannt, nicht 0. */
  tageOhneBeruehrung: number | null
  hatNaechstenSchritt: boolean
  naechsterSchrittUeberfaellig: boolean
  hatVerantwortlichen: boolean
  /** Wie viele Reifebelege noch fehlen (Schlüssel, keine Sätze). */
  reifeOffen: string[]
  angebotZustand: "keins" | "entwurf" | "gesendet" | "angenommen"
  projektZustand: "keins" | "aufgesetzt" | "laeuft" | "abgenommen" | "uebergeben"
  freigabeOffen: boolean
}

/** Die Felder, die ein Kontext tragen darf. Alles andere ist ein Befund. */
export const ERLAUBTE_MERKMALE = [
  "kennung",
  "status",
  "tageOhneBeruehrung",
  "hatNaechstenSchritt",
  "naechsterSchrittUeberfaellig",
  "hatVerantwortlichen",
  "reifeOffen",
  "angebotZustand",
  "projektZustand",
  "freigabeOffen",
] as const

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · WAS ZURÜCKKOMMT
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Die möglichen Vorschläge — eine geschlossene Liste.
 *
 * Auch hier gilt die Richtung aus G26: Wer verbietet, muss alles aufzählen,
 * woran jemand je denken könnte; wer erlaubt, zählt auf, was das Haus
 * vorgesehen hat. Ein Modell, das etwas anderes vorschlägt, bekommt
 * „unbekannt" — nicht eine Ausnahme.
 */
export const VORSCHLAEGE = [
  "schritt-setzen",
  "schritt-einholen",
  "verantwortlichen-setzen",
  "reife-belegen",
  "angebot-schreiben",
  "angebot-nachfassen",
  "projekt-aufsetzen",
  "freigabe-holen",
  /** Die ehrliche Antwort, wenn die Belege nicht tragen. */
  "unbekannt",
] as const
export type Vorschlag = (typeof VORSCHLAEGE)[number]

/**
 * Eine Evidenz ist ein MERKMAL DES KONTEXTS, nicht ein Satz.
 *
 * Damit ist sie nachprüfbar: `pruefe()` hält jede gegen die übergebenen
 * Merkmale. Ein Satz liesse sich nicht prüfen — und genau darin besteht
 * Halluzination.
 */
export type Evidenz = { merkmal: string; wert: string }

export type MeaiErgebnis = {
  vorschlag: Vorschlag
  evidenz: Evidenz[]
  /** `belegt` nur, wenn jede Evidenz im Kontext steht. Sonst `unbekannt`. */
  vertrauen: "belegt" | "unbekannt"
  /** Woher die Antwort kam. Die Oberfläche sagt es dem Menschen. */
  quelle: "regel" | "modell"
  /** A8 · 1 — an jeder Ausgabe, nicht in einer Konfigurationsdatei. */
  modell: string
  promptVersion: string
  vertragVersion: string
  /** A8 · 4 — je Aufruf gemessen, nicht geschätzt. */
  dauerMs: number
  /** `null` heisst: nicht gemessen. Nie 0 für „kostenlos". */
  kostenCent: number | null
  /** Warum eine Antwort verworfen wurde — Maschinenwert, Anzeige übersetzt. */
  befund: MeaiBefund | null
}

export const MEAI_BEFUNDE = [
  "unbekannter-vorschlag",
  "evidenz-nicht-im-kontext",
  "keine-evidenz",
  "pii-grenze",
  "anbieter-fehler",
  "kein-anbieter",
] as const
export type MeaiBefund = (typeof MEAI_BEFUNDE)[number]

/** Die Version dieses Vertrags. Ändert sich die Form der Antwort, ändert sie sich hier. */
export const MEAI_VERTRAG_VERSION = "1"

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DIE PII-GRENZE (A8 · 5)
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Was ein Kontext ENTHALTEN DARF, bevor er das Haus verlässt.
 *
 * Geprüft wird beides: dass kein unbekanntes Feld dabei ist (jemand hat den
 * Typ erweitert), und dass kein Wert wie ein Mensch aussieht (jemand hat
 * einen Namen in ein erlaubtes Feld geschrieben). Die zweite Prüfung ist die
 * wichtigere — sie fängt den Fall, den ein Typ nicht sieht.
 */
export function pruefePIIGrenze(kontext: Record<string, unknown>): {
  sauber: boolean
  verstoesse: string[]
} {
  const verstoesse: string[] = []
  const erlaubt = new Set<string>(ERLAUBTE_MERKMALE)
  for (const feld of Object.keys(kontext)) {
    if (!erlaubt.has(feld)) verstoesse.push(feld)
  }
  /* Sieht ein Wert wie eine Mailadresse, eine Telefonnummer oder ein Satz aus? */
  const verdacht = /@|\+\d{6,}|\d{3,}\s?\d{3,}|\s\w+\s\w+\s\w+/
  for (const [feld, wert] of Object.entries(kontext)) {
    if (feld === "kennung") continue
    const werte = Array.isArray(wert) ? wert : [wert]
    for (const w of werte) {
      if (typeof w === "string" && verdacht.test(w)) verstoesse.push(`${feld}=${w}`)
    }
  }
  return { sauber: verstoesse.length === 0, verstoesse }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · DIE PRÜFUNG — Halluzination und Leakage sind dieselbe Frage
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Alle Evidenzen, die dieser Kontext hergibt — die einzige gültige Menge. */
export function evidenzenAus(m: Vorgangsmerkmale): Evidenz[] {
  const e: Evidenz[] = [
    { merkmal: "status", wert: m.status },
    { merkmal: "angebotZustand", wert: m.angebotZustand },
    { merkmal: "projektZustand", wert: m.projektZustand },
    { merkmal: "hatNaechstenSchritt", wert: String(m.hatNaechstenSchritt) },
    { merkmal: "naechsterSchrittUeberfaellig", wert: String(m.naechsterSchrittUeberfaellig) },
    { merkmal: "hatVerantwortlichen", wert: String(m.hatVerantwortlichen) },
    { merkmal: "freigabeOffen", wert: String(m.freigabeOffen) },
  ]
  if (m.tageOhneBeruehrung !== null) {
    e.push({ merkmal: "tageOhneBeruehrung", wert: String(m.tageOhneBeruehrung) })
  }
  for (const r of m.reifeOffen) e.push({ merkmal: "reifeOffen", wert: r })
  return e
}

const gleich = (a: Evidenz, b: Evidenz) => a.merkmal === b.merkmal && a.wert === b.wert

/**
 * Hält diese Antwort gegen den Kontext, aus dem sie entstanden ist?
 *
 * Eine Antwort ohne Evidenz ist geraten. Eine Antwort mit Evidenz, die im
 * Kontext nicht vorkommt, ist erfunden — und wenn sie aus einem ANDEREN
 * Vorgang stammt, ist sie ein Datenleck. Aus der Sicht dieser Funktion ist
 * das derselbe Fehler, und deshalb fängt eine Prüfung beide.
 */
export function pruefe(
  antwort: { vorschlag: string; evidenz: Evidenz[] },
  merkmale: Vorgangsmerkmale,
): { vorschlag: Vorschlag; evidenz: Evidenz[]; vertrauen: "belegt" | "unbekannt"; befund: MeaiBefund | null } {
  const abgelehnt = (befund: MeaiBefund) =>
    ({ vorschlag: "unbekannt" as const, evidenz: [], vertrauen: "unbekannt" as const, befund })

  if (!(VORSCHLAEGE as readonly string[]).includes(antwort.vorschlag)) {
    return abgelehnt("unbekannter-vorschlag")
  }
  if (antwort.vorschlag === "unbekannt") {
    return { vorschlag: "unbekannt", evidenz: [], vertrauen: "unbekannt", befund: null }
  }
  if (!antwort.evidenz.length) return abgelehnt("keine-evidenz")

  const erlaubt = evidenzenAus(merkmale)
  for (const e of antwort.evidenz) {
    if (!erlaubt.some((x) => gleich(x, e))) return abgelehnt("evidenz-nicht-im-kontext")
  }
  return { vorschlag: antwort.vorschlag as Vorschlag, evidenz: antwort.evidenz, vertrauen: "belegt", befund: null }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 5 · DEGRADED MODE (A8 · 6) — dieselbe Frage, aus Regeln
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Der nächste Schritt, regelbasiert.
 *
 * Die Reihenfolge ist die Aussage: Was den Betrieb aufhält, steht vor dem,
 * was ihn verbessert. Und wo keine Regel greift, kommt „unbekannt" — nicht
 * der am wenigsten falsche Vorschlag.
 */
export function regelbasiert(m: Vorgangsmerkmale): { vorschlag: Vorschlag; evidenz: Evidenz[] } {
  const ev = (...paare: [string, string][]): Evidenz[] => paare.map(([merkmal, wert]) => ({ merkmal, wert }))

  if (m.projektZustand === "abgenommen" && m.freigabeOffen) {
    return {
      vorschlag: "freigabe-holen",
      evidenz: ev(["projektZustand", "abgenommen"], ["freigabeOffen", "true"]),
    }
  }
  if (m.status === "won" && m.angebotZustand === "angenommen" && m.projektZustand === "keins") {
    return {
      vorschlag: "projekt-aufsetzen",
      evidenz: ev(["status", "won"], ["angebotZustand", "angenommen"], ["projektZustand", "keins"]),
    }
  }
  if (m.angebotZustand === "gesendet" && m.naechsterSchrittUeberfaellig) {
    return {
      vorschlag: "angebot-nachfassen",
      evidenz: ev(["angebotZustand", "gesendet"], ["naechsterSchrittUeberfaellig", "true"]),
    }
  }
  if (m.reifeOffen.length > 0 && m.angebotZustand === "keins") {
    return {
      vorschlag: "reife-belegen",
      evidenz: [
        { merkmal: "angebotZustand", wert: "keins" },
        ...m.reifeOffen.map((r) => ({ merkmal: "reifeOffen", wert: r })),
      ],
    }
  }
  if (m.reifeOffen.length === 0 && m.angebotZustand === "keins" && m.status !== "lost") {
    return {
      vorschlag: "angebot-schreiben",
      evidenz: ev(["angebotZustand", "keins"], ["status", m.status]),
    }
  }
  if (!m.hatVerantwortlichen) {
    return { vorschlag: "verantwortlichen-setzen", evidenz: ev(["hatVerantwortlichen", "false"]) }
  }
  if (m.naechsterSchrittUeberfaellig) {
    return { vorschlag: "schritt-einholen", evidenz: ev(["naechsterSchrittUeberfaellig", "true"]) }
  }
  if (!m.hatNaechstenSchritt) {
    return { vorschlag: "schritt-setzen", evidenz: ev(["hatNaechstenSchritt", "false"]) }
  }
  /*
   * Kein Fall greift — und das ist eine Antwort. „Weitermachen wie bisher"
   * wäre keine; sie klänge nur nach einer.
   */
  return { vorschlag: "unbekannt", evidenz: [] }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 6 · DER AUFRUF
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Anbieter = {
  name: string
  modell: string
  promptVersion: string
  /** Kosten je Aufruf in Cent, falls der Anbieter sie nennt. Sonst `null`. */
  kostenCent: number | null
  frage(kontext: Vorgangsmerkmale): Promise<{ vorschlag: string; evidenz: Evidenz[] }>
}

/**
 * Ein Vorschlag — mit Anbieter, wenn einer eingerichtet ist, sonst aus Regeln.
 *
 * Gemessen wird immer: Dauer je Aufruf, Kosten falls bekannt. Und geprüft
 * wird immer — auch die Antwort des Anbieters, gerade die.
 *
 * Fällt der Anbieter aus, ist die Antwort NICHT leer: Sie kommt dann aus den
 * Regeln und sagt das (`quelle: "regel"`, `befund: "anbieter-fehler"`).
 */
export async function naechsterSchritt(
  merkmale: Vorgangsmerkmale,
  anbieter: Anbieter | null,
): Promise<MeaiErgebnis> {
  const start = Date.now()

  const ausRegeln = (befund: MeaiBefund | null): MeaiErgebnis => {
    const r = regelbasiert(merkmale)
    const geprueft = pruefe(r, merkmale)
    return {
      vorschlag: geprueft.vorschlag,
      evidenz: geprueft.evidenz,
      vertrauen: geprueft.vertrauen,
      quelle: "regel",
      modell: "regelwerk",
      promptVersion: "—",
      vertragVersion: MEAI_VERTRAG_VERSION,
      dauerMs: Date.now() - start,
      kostenCent: 0,
      befund: befund ?? geprueft.befund,
    }
  }

  if (!anbieter) return ausRegeln("kein-anbieter")

  /* Die Grenze gilt VOR dem Aufruf — danach wäre sie eine Feststellung. */
  const grenze = pruefePIIGrenze(merkmale as unknown as Record<string, unknown>)
  if (!grenze.sauber) return ausRegeln("pii-grenze")

  let roh: { vorschlag: string; evidenz: Evidenz[] }
  try {
    roh = await anbieter.frage(merkmale)
  } catch {
    return ausRegeln("anbieter-fehler")
  }

  const geprueft = pruefe(roh, merkmale)
  return {
    vorschlag: geprueft.vorschlag,
    evidenz: geprueft.evidenz,
    vertrauen: geprueft.vertrauen,
    quelle: "modell",
    modell: anbieter.modell,
    promptVersion: anbieter.promptVersion,
    vertragVersion: MEAI_VERTRAG_VERSION,
    dauerMs: Date.now() - start,
    kostenCent: anbieter.kostenCent,
    befund: geprueft.befund,
  }
}
