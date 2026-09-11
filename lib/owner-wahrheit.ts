/*
 * ===========================================================================
 * OWNER-WAHRHEIT — WAS KEIN CODE HERAUSFINDEN KANN
 * ===========================================================================
 *
 * PROOF OPERATIONS · PHASE P1, 11.09.2026.
 *
 * ---------------------------------------------------------------------------
 * DIE GRENZE, UM DIE ES HIER GEHT
 *
 * Ein Programm kann nachsehen, ob eine Umgebungsvariable gesetzt ist. Es kann
 * NICHT nachsehen, ob ein Vertrag geschlossen wurde.
 *
 * Genau diese Verwechslung hat Phase 1 auf `/datenschutz` gefunden: Der
 * Fliesstext sagte „Mit Vercel besteht ein Vertrag ueber die
 * Auftragsverarbeitung", die Tabelle darunter sagte „Bestaetigung durch den
 * Inhaber offen". Beides stand in derselben ausgelieferten Datei. Niemand
 * hatte gelogen — es hatte nur niemand festgehalten, WER etwas bestaetigen
 * muss und WORAN man erkennt, dass er es getan hat.
 *
 * Dieses Modul haelt drei solcher Wahrheiten:
 *
 *   VERARBEITER   Besteht ein Auftragsverarbeitungsvertrag?
 *   KAPAZITAET    Wie viele Vorhaben gleichzeitig?
 *   VERTRETUNG    Was laeuft weiter, wenn der Owner ausfaellt?
 *
 * Keine davon wird hier beantwortet. Alle drei bekommen einen Zustand, einen
 * Adressaten und den Satz, der sie aufloesen wuerde.
 *
 * ---------------------------------------------------------------------------
 * `unbekannt` IST EIN ERGEBNIS
 *
 * Der teuerste Zustand waere nicht „unbekannt", sondern ein stillschweigendes
 * „vermutlich ja". Deshalb ist `unbekannt` der Anfangszustand, und er ist
 * nicht peinlich: Er ist die einzige Aussage, die ohne Beleg wahr ist.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER NICHT LIEGT
 *
 * Kein Vertragsdokument, keine Vertragsnummer, keine Rechtsbewertung. Wie in
 * `lib/proof.ts` fuer Kundenfreigaben gilt: Die FUNDSTELLE steht hier, das
 * Dokument nicht. Ein Repository wird geklont, gesichert und irgendwann
 * geteilt.
 */

/* ── Der gemeinsame Zustand ─────────────────────────────────────────────── */

export type Wahrheitsstand =
  /** Niemand hat es geprüft. Anfangszustand, und legitim. */
  | "unbekannt"
  /** Geprüft, aber nur der Owner kann es bestätigen. */
  | "owner-bestaetigung-noetig"
  /** Bestätigt, mit Fundstelle und Datum. */
  | "bestaetigt"
  /** Geprüft und ausdrücklich verneint. */
  | "nicht-gegeben"
  /** Braucht eine juristische Bewertung, nicht nur eine Auskunft. */
  | "rechtliche-pruefung-noetig"

export const STAND_LABEL: Record<Wahrheitsstand, string> = {
  unbekannt: "Unbekannt",
  "owner-bestaetigung-noetig": "Bestätigung durch den Inhaber nötig",
  bestaetigt: "Bestätigt",
  "nicht-gegeben": "Nicht gegeben",
  "rechtliche-pruefung-noetig": "Rechtliche Prüfung nötig",
}

/** Nur ein bestätigter Stand darf eine öffentliche Aussage tragen. */
export function traegtAussage(stand: Wahrheitsstand): boolean {
  return stand === "bestaetigt"
}

export type Wahrheit = {
  key: string
  frage: string
  stand: Wahrheitsstand
  /**
   * Woran man erkennt, dass es stimmt — Postfach, Dashboard, Ordner. Bei
   * `bestaetigt` Pflicht; ohne Fundstelle ist eine Bestätigung eine Meinung.
   */
  fundstelle: string | null
  bestaetigtVon: string | null
  bestaetigtAm: string | null
  /** Der Satz, der den Stand auflösen würde. */
  aufloesungDurch: string
  /** Was öffentlich möglich würde, wenn er aufgelöst ist. */
  gibtFrei: string
}

/* ── Verarbeiter ────────────────────────────────────────────────────────── */

/**
 * Die drei Dienste aus `processors` in `lib/site-data.ts`.
 *
 * Der Stand wird hier NICHT aus der Konfiguration abgeleitet. Dass ein
 * `DATABASE_URL` gesetzt ist, beweist, dass eine Datenbank benutzt wird — und
 * sonst nichts. `scripts/check-beleg-betrieb.mjs` prueft ausdruecklich, dass
 * keine dieser Zeilen `bestaetigt` traegt, ohne dass eine Fundstelle dabeisteht.
 */
export const verarbeiter: Wahrheit[] = [
  {
    key: "avv-vercel",
    frage: "Besteht mit Vercel Inc. ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO?",
    stand: "owner-bestaetigung-noetig",
    fundstelle: null,
    bestaetigtVon: null,
    bestaetigtAm: null,
    aufloesungDurch:
      "Im Vercel-Dashboard unter Legal den DPA abschließen und ablegen, dann hier Fundstelle und Datum eintragen.",
    gibtFrei:
      "Auf /datenschutz darf dann stehen, dass der Vertrag besteht — statt der vorgesehenen Grundlage mit offener Kennzeichnung.",
  },
  {
    key: "avv-resend",
    frage: "Besteht mit Resend Inc. ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO?",
    stand: "owner-bestaetigung-noetig",
    fundstelle: null,
    bestaetigtVon: null,
    bestaetigtAm: null,
    aufloesungDurch:
      "Im Resend-Dashboard den DPA abschließen und ablegen, dann hier Fundstelle und Datum eintragen.",
    gibtFrei: "Dieselbe Zeile auf /datenschutz verliert ihre Kennzeichnung.",
  },
  {
    key: "avv-neon",
    frage:
      "Besteht mit Neon, LLC (Databricks, Inc.) ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO?",
    stand: "owner-bestaetigung-noetig",
    fundstelle: null,
    bestaetigtVon: null,
    bestaetigtAm: null,
    aufloesungDurch:
      "Das Databricks-DPA abschließen und ablegen, dann hier Fundstelle und Datum eintragen.",
    gibtFrei: "Dieselbe Zeile auf /datenschutz verliert ihre Kennzeichnung.",
  },
]

/* ── Kapazität ──────────────────────────────────────────────────────────── */

/**
 * KEIN VORGABEWERT.
 *
 * Die naheliegende Versuchung waere „vier Vorhaben gleichzeitig" — eine Zahl,
 * die plausibel klingt und niemanden bindet, bis sie jemand einfordert.
 * `/unternehmen` sagt heute ausdruecklich, dass diese Angabe fehlt. Solange
 * der Owner sie nicht nennt, bleibt das so.
 */
export const kapazitaet: Wahrheit[] = [
  {
    key: "kapazitaet-projekte",
    frage: "Wie viele Projekte kann creaDIG gleichzeitig verantworten?",
    stand: "unbekannt",
    fundstelle: null,
    bestaetigtVon: null,
    bestaetigtAm: null,
    aufloesungDurch:
      "Eine Zahl nennen, die auch im vollen Monat hält, und den Zeitraum dazu, aus dem sie stammt.",
    gibtFrei:
      "/unternehmen könnte die Lücke schließen, die dort heute ausdrücklich benannt ist — und der Mittelstand bekäme eine der vier Antworten, die er vor einem Auftrag erwartet.",
  },
  {
    key: "kapazitaet-betrieb",
    frage: "Wie viele Systeme kann creaDIG gleichzeitig im Betrieb halten?",
    stand: "unbekannt",
    fundstelle: null,
    bestaetigtVon: null,
    bestaetigtAm: null,
    aufloesungDurch: "Eine Zahl nennen und benennen, was sie begrenzt.",
    gibtFrei:
      "Eine Betriebsstufe über der laufenden Betreuung wäre verkaufbar — heute verkauft creaDIG darüber ausdrücklich nichts (offer-canon.md §6).",
  },
]

/* ── Vertretung ─────────────────────────────────────────────────────────── */

/**
 * `lib/vertretung.ts` (Gate 30) modelliert bereits ABLAEUFE, BESETZUNGEN und
 * Ersetzbarkeit — es beantwortet, welcher Schritt owner-gebunden ist. Was dort
 * fehlt, ist die eine oeffentlich verwertbare Aussage: Gibt es einen Menschen,
 * der im Ausfall weitermacht?
 *
 * Deshalb hier nur diese eine Zeile, und kein zweites Rollenmodell daneben.
 */
export const vertretung: Wahrheit[] = [
  {
    key: "vertretung-ausfall",
    frage: "Wer übernimmt, wenn der Verantwortliche kurzfristig ausfällt — und was genau?",
    stand: "unbekannt",
    fundstelle: null,
    bestaetigtVon: null,
    bestaetigtAm: null,
    aufloesungDurch:
      "Eine reale Person oder Funktion benennen, mit Zugang und der Liste dessen, was sie fortführen kann — und dem, was sie nicht kann. Kein Netzwerkkontakt ist eine Vertretung.",
    gibtFrei:
      "/unternehmen könnte die Vertretungsregel nennen, die dort heute als fehlend ausgewiesen ist.",
  },
]

export const alleWahrheiten: Wahrheit[] = [...verarbeiter, ...kapazitaet, ...vertretung]

export function wahrheitZu(key: string): Wahrheit | undefined {
  return alleWahrheiten.find((w) => w.key === key)
}

/** Was heute keine öffentliche Aussage trägt. */
export const offeneWahrheiten = alleWahrheiten.filter((w) => !traegtAussage(w.stand))

/**
 * Die Sicherung: Eine Bestätigung ohne Fundstelle ist keine.
 *
 * Sie steht hier als Funktion und nicht nur als Regel im Text, weil ein
 * Pruefskript sie ausfuehren kann — und weil der naechste, der hier ein
 * `bestaetigt` eintraegt, dann sofort merkt, dass etwas fehlt.
 */
export function bestaetigungVollstaendig(w: Wahrheit): { ok: boolean; grund: string } {
  if (w.stand !== "bestaetigt") return { ok: true, grund: "Nicht bestätigt — nichts zu belegen." }
  if (!w.fundstelle || w.fundstelle.trim().length < 8)
    return { ok: false, grund: "Bestätigt ohne Fundstelle. Wo steht das?" }
  if (!w.bestaetigtVon || !w.bestaetigtAm)
    return { ok: false, grund: "Bestätigt ohne Person oder Datum." }
  return { ok: true, grund: `Bestätigt von ${w.bestaetigtVon} am ${w.bestaetigtAm} (${w.fundstelle}).` }
}
