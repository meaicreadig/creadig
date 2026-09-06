/*
 * ==========================================================================
 * KONTAKT & ZUGANG — WELCHER MENSCH, ÜBER WELCHEN BELEGBAREN WEG?
 * ==========================================================================
 *
 * G10 hat den BETRIEB verstanden. G11 fragt nach dem MENSCHEN — und nach
 * dem Weg zu ihm, der einer Prüfung standhält.
 *
 * ---------------------------------------------------------------------------
 * DER SATZ, UM DEN ES GEHT
 *
 *   „bereit für Kontakt" ist ein Zustand des WISSENS.
 *   Ansprechen ist eine ENTSCHEIDUNG.
 *
 * Zwischen beiden darf keine Automatik stehen. Deshalb gibt es
 * `contact_decision`, und deshalb fuellt es sich nicht von selbst — auch
 * dann nicht, wenn alles andere gruen ist. Ein System, das aus „wir wissen
 * genug" von allein „wir schreiben" macht, ist ein Spam-System mit besserer
 * Begruendung.
 *
 * ---------------------------------------------------------------------------
 * VIER ACHSEN, DIE NIE ZU EINER WERDEN
 *
 *   PASSUNG    Hat der Betrieb das Problem?            (G09/G10)
 *   PERSON     Kennen wir einen Menschen — BELEGT?     (hier)
 *   ZUGANG     Gibt es einen ehrlichen Weg?            (G10, hier gelesen)
 *   ANLASS     Gibt es einen belegten Geschaeftsanlass? (G10-Belege)
 *
 * Jede einzeln. „LinkedIn-Profil vorhanden" ist kein Zugang. „Warm" ist
 * keine Passung. Ein Anlass ist keine Erlaubnis.
 */
import type { Einordnung } from "@/lib/market"
import { einordnung, type ResearchCase } from "@/lib/research"

/* ── Woher kennen wir die Person? ───────────────────────────────────────── */

export const CONTACT_SOURCES = [
  "impressum",
  "website",
  "stellenanzeige",
  "handelsregister",
  "presse",
  "ausschreibung",
  "linkedin-unternehmensseite",
  "empfehlung",
  "bestand",
  "eingehend",
] as const
export type ContactSource = (typeof CONTACT_SOURCES)[number]

export const CONTACT_SOURCE_LABEL: Record<ContactSource, string> = {
  impressum: "Impressum",
  website: "Website des Betriebs",
  stellenanzeige: "Stellenanzeige",
  handelsregister: "Handelsregister",
  presse: "Öffentliche Berichterstattung",
  ausschreibung: "Ausschreibung",
  "linkedin-unternehmensseite": "LinkedIn-Unternehmensseite",
  empfehlung: "Empfehlung — ein Mensch hat den Namen genannt",
  bestand: "Eigener Bestand",
  eingehend: "Hat selbst angefragt",
}

/* ── Die Person am Vorgang ──────────────────────────────────────────────── */

export type PersonRef = {
  id: string
  name: string
  role: string | null
  email: string | null
  phone: string | null
  linkedinUrl: string | null
  relationship: "unbekannt" | "bekannt" | "warm" | "eng"
  sourceUrl: string | null
  sourceKind: ContactSource | null
  sourceNote: string | null
}

export const DECISIONS = ["vorbereiten", "zurueckgestellt", "mehr-information", "nicht-verfolgen"] as const
export type Decision = (typeof DECISIONS)[number]

export const DECISION_LABEL: Record<Decision, string> = {
  vorbereiten: "Kontakt vorbereiten",
  zurueckgestellt: "Zurückstellen",
  "mehr-information": "Mehr Information nötig",
  "nicht-verfolgen": "Nicht weiterverfolgen",
}

/* ── Die Lage ───────────────────────────────────────────────────────────── */

export const CONTACT_STATES = [
  "person-unbekannt",
  "person-unbelegt",
  "zugang-offen",
  "entscheidung-offen",
  "vorbereitet",
  "zurueckgestellt",
  "abgeschlossen",
] as const
export type ContactState = (typeof CONTACT_STATES)[number]

export type Achse = { urteil: "ja" | "nein" | "offen"; grund: string }

export type KontaktLage = {
  stand: ContactState
  passung: Achse
  person: Achse
  zugang: Achse
  anlass: Achse
  /** Was ein MENSCH als Nächstes tun sollte — nie, was das System tut. */
  naechstes: string
  /** Ob eine Entscheidung jetzt fällig ist. */
  entscheidungFaellig: boolean
  /** Was auch dann nicht automatisch passiert, wenn alles grün ist. */
  niemalsAutomatisch: string[]
}

const NIEMALS = [
  "Keine Nachricht wird verschickt — Ansprache ist ein eigener Schritt.",
  "Keine Verkaufschance entsteht — die legt ein Mensch im Vertrieb an.",
  "Keine Werbeeinwilligung entsteht — eine Geschäftsbeziehung ist keine.",
  "Kein Profil wird abgerufen — LinkedIn wird verlinkt, nicht ausgelesen.",
]

/**
 * Die Lage eines Kontaktvorgangs.
 *
 * Deterministisch und begruendet. Die Reihenfolge der Pruefung ist selbst
 * eine Aussage: Ohne belegte Person ist der Zugang gleichgueltig, und ohne
 * Zugang ist die Entscheidung keine.
 */
export function kontaktLage(c: ResearchCase, person: PersonRef | null): KontaktLage {
  const fit: Einordnung = einordnung(c)
  const gueltig = c.evidence.filter((e) => !e.supersededBy)
  const anlaesse = gueltig.filter((e) => e.kind === "anlass")

  const passung: Achse = {
    urteil: fit.passung.urteil === "passend" ? "ja" : fit.passung.urteil === "unpassend" ? "nein" : "offen",
    grund: fit.passung.gruende[0] ?? "keine Belege",
  }

  /*
   * Eine Person zaehlt nur MIT Fundstelle.
   *
   * Ohne Quelle ist ein Name eine Vermutung, und eine Vermutung darf keinen
   * Menschen erreichen. Die einzige Ausnahme ist der eigene Bestand: Wer
   * selbst angefragt hat oder seit Jahren Kunde ist, ist belegt genug —
   * dort IST creaDIG die Quelle.
   */
  const belegt =
    person !== null &&
    (Boolean(person.sourceUrl) || person.sourceKind === "bestand" || person.sourceKind === "eingehend" || person.sourceKind === "empfehlung")

  const person_: Achse = !person
    ? { urteil: "offen", grund: "Keine Person bekannt." }
    : belegt
      ? {
          urteil: "ja",
          grund: `${person.name}${person.role ? `, ${person.role}` : ""} — ${
            person.sourceKind ? CONTACT_SOURCE_LABEL[person.sourceKind] : "Quelle"
          }`,
        }
      : { urteil: "offen", grund: `${person.name} ist eingetragen, aber ohne Fundstelle — ein Name ohne Quelle ist eine Vermutung.` }

  const zugang: Achse =
    c.access === null
      ? { urteil: "offen", grund: "Zugangsweg nicht recherchiert." }
      : c.access === "keiner"
        ? { urteil: "nein", grund: "Kein ehrlicher Weg hin. Kaltakquise ist ausgeschlossen." }
        : { urteil: "ja", grund: `Zugang über ${c.access}` }

  const anlass: Achse = anlaesse.length
    ? { urteil: "ja", grund: `${anlaesse[0]!.claim} (${anlaesse[0]!.sourceUrl})` }
    : { urteil: "offen", grund: "Kein belegter Geschäftsanlass. Ohne ihn trägt nur ein bestehender Weg." }

  /* ── Zustand ── */
  let stand: ContactState
  if (c.contactDecision === "vorbereiten") stand = "vorbereitet"
  else if (c.contactDecision === "zurueckgestellt") stand = "zurueckgestellt"
  else if (c.contactDecision === "nicht-verfolgen") stand = "abgeschlossen"
  else if (!person) stand = "person-unbekannt"
  else if (!belegt) stand = "person-unbelegt"
  else if (zugang.urteil !== "ja") stand = "zugang-offen"
  else stand = "entscheidung-offen"

  const entscheidungFaellig = stand === "entscheidung-offen"

  const naechstes =
    stand === "abgeschlossen"
      ? "Nicht weiterverfolgen — entschieden."
      : stand === "zurueckgestellt"
        ? "Zurückgestellt. Wird nicht von selbst wieder aktiv."
        : stand === "vorbereitet"
          ? "Entschieden: Kontakt vorbereiten. Die Ansprache selbst ist ein eigener Schritt."
          : stand === "person-unbekannt"
            ? "Öffentliche Quellen nach einer verantwortlichen Person durchsehen — Impressum, Stellenanzeige, Unternehmensseite. Oder das Netzwerk fragen."
            : stand === "person-unbelegt"
              ? "Fundstelle zur Person nachtragen. Ohne Quelle bleibt der Name eine Vermutung."
              : stand === "zugang-offen"
                ? "Person steht. Jetzt klären, wie man ehrlich an sie herankommt."
                : "Person, Zugang und Passung stehen. Jetzt entscheiden Sie — das System tut es nicht."

  return { stand, passung, person: person_, zugang, anlass, naechstes, entscheidungFaellig, niemalsAutomatisch: NIEMALS }
}

/**
 * Darf dieser Vorgang ueberhaupt in eine Ansprache muenden?
 *
 * Zwei Wege, und nur diese zwei — beide aus dem Kanon von G09:
 *
 *   1. Ein BESTEHENDER Weg: Empfehlung, Netzwerk, Bestandskunde, oder der
 *      Betrieb hat selbst angefragt. Dann ist der Kontakt ohnehin
 *      gerechtfertigt.
 *   2. Ein BELEGTER ANLASS: eine Ausschreibung, eine Stellenanzeige mit
 *      passendem Bedarf — etwas, das der Betrieb selbst oeffentlich gemacht
 *      hat.
 *
 * Ohne eines von beidem waere es kontextlose Ansprache, und die ist
 * ausgeschlossen. Diese Funktion ENTSCHEIDET nicht — sie sagt, ob eine
 * Entscheidung ueberhaupt zulaessig waere.
 */
export function ansprachedeckung(c: ResearchCase, person: PersonRef | null): {
  gedeckt: boolean
  grund: string
} {
  const gueltig = c.evidence.filter((e) => !e.supersededBy)
  const hatAnlass = gueltig.some((e) => e.kind === "anlass")
  const bestehenderWeg = c.access === "empfehlung" || c.access === "netzwerk" || c.access === "bestandskunde" || c.access === "eingehend"

  if (bestehenderWeg)
    return { gedeckt: true, grund: `Bestehender Weg (${c.access}) — der Kontakt braucht keinen zusätzlichen Anlass.` }
  if (hatAnlass && person)
    return { gedeckt: true, grund: "Belegter Geschäftsanlass, den der Betrieb selbst öffentlich gemacht hat." }
  if (hatAnlass && !person)
    return { gedeckt: false, grund: "Anlass belegt, aber keine Person bekannt. Ein Anlass allein erreicht niemanden." }
  return {
    gedeckt: false,
    grund: "Weder bestehender Weg noch belegter Anlass. Eine Ansprache wäre kontextlos — und das ist ausgeschlossen.",
  }
}
