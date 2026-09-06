/*
 * ==========================================================================
 * RECHERCHE — VON EINEM ENTDECKTEN BETRIEB ZU EINEM BEGRUENDETEN URTEIL
 * ==========================================================================
 *
 * Gate 09 sagt, WORAN man einen passenden Betrieb erkennt. Dieses Modul
 * sagt, wie man dorthin kommt: entdecken, belegen, einordnen, aufhoeren.
 *
 * Das Wort „aufhoeren" steht nicht zufaellig dabei. Recherche hat kein
 * natuerliches Ende — man findet immer noch etwas. Ein System ohne
 * Abbruchregel produziert deshalb keine Entscheidungen, sondern
 * Beschaeftigung.
 *
 * ---------------------------------------------------------------------------
 * DREI DINGE, DIE HIER STRIKT GETRENNT BLEIBEN
 *
 *   TATSACHE        was beobachtet wurde, mit Fundstelle
 *   DEUTUNG         was daraus folgen KOENNTE
 *   UNBEKANNT       was niemand nachgesehen hat
 *
 * Die Datenbank speichert die Tatsache. Die Deutung entsteht beim Lesen und
 * wird nie als Tatsache abgelegt. Unbekannt bleibt sichtbar unbekannt.
 *
 * Ohne Quelle zaehlt ein Beleg nicht — das erzwingt schon das Schema
 * (`source_url NOT NULL`), damit es keine Frage der Disziplin ist.
 */
import { classify, EXCLUSIONS, SIGNALS, type Einordnung, type SignalKey } from "@/lib/market"

/* ── Quellen ────────────────────────────────────────────────────────────── */

export type SourceKind =
  | "website"
  | "stellenanzeige"
  | "branchenverzeichnis"
  | "handelsregister"
  | "presse"
  | "ausschreibung"
  | "linkedin-unternehmensseite"
  | "empfehlung"
  | "bestand"

export type SourcePolicy = {
  label: string
  /** Darf ein Programm die Seite selbst abrufen? */
  automatisch: boolean
  /** Wie verlaesslich ist die Quelle fuer eine Tatsache ueber den Betrieb? */
  verlaesslich: "hoch" | "mittel" | "niedrig"
  hinweis: string
}

/*
 * Nicht jede Quelle darf maschinell abgerufen werden, und nicht jede ist
 * gleich verlaesslich. Beides steht hier, damit niemand es im Einzelfall
 * neu entscheiden muss — und damit ein spaeterer Automat (G26) es liest,
 * statt es zu ignorieren.
 */
export const SOURCES: Record<SourceKind, SourcePolicy> = {
  website: {
    label: "Eigene Website des Betriebs",
    automatisch: true,
    verlaesslich: "hoch",
    hinweis: "Der Betrieb sagt es über sich selbst. Für Standorte, Leistungen und Kontaktwege die beste Quelle.",
  },
  stellenanzeige: {
    label: "Öffentliche Stellenanzeige",
    automatisch: false,
    verlaesslich: "hoch",
    hinweis:
      "Die ergiebigste Quelle für Betriebszustände — dort steht, welche Werkzeuge benutzt werden und welche Arbeit von Hand läuft. " +
      "Portale untersagen meist den maschinellen Abruf: von Hand öffnen, Fundstelle festhalten.",
  },
  branchenverzeichnis: {
    label: "Branchen- oder Kammerverzeichnis",
    automatisch: false,
    verlaesslich: "mittel",
    hinweis: "Gut für die Existenz und die Branche, oft veraltet bei Adressen und Größe.",
  },
  handelsregister: {
    label: "Handelsregister / öffentliches Register",
    automatisch: false,
    verlaesslich: "hoch",
    hinweis: "Rechtsform und Sitz belegt. Sagt nichts über den Betriebszustand.",
  },
  presse: {
    label: "Öffentliche Berichterstattung",
    automatisch: true,
    verlaesslich: "mittel",
    hinweis: "Gut für Veränderungen — neuer Standort, Übernahme, Umbau. Datum mitschreiben, veraltet schnell.",
  },
  ausschreibung: {
    label: "Öffentliche Ausschreibung",
    automatisch: true,
    verlaesslich: "hoch",
    hinweis: "Ein belegter Anlass. Ein Anlass ist trotzdem keine Erlaubnis zur Ansprache — siehe G11.",
  },
  "linkedin-unternehmensseite": {
    label: "LinkedIn-Unternehmensseite",
    automatisch: false,
    verlaesslich: "mittel",
    hinweis:
      "UNTERNEHMENSseite, keine Personenprofile. Der maschinelle Abruf verstößt gegen die Nutzungsbedingungen: " +
      "von Hand ansehen, Beobachtung festhalten.",
  },
  empfehlung: {
    label: "Empfehlung oder Netzwerk",
    automatisch: false,
    verlaesslich: "mittel",
    hinweis:
      "Ein Mensch hat es gesagt. Für den ZUGANG die beste Quelle, für Tatsachen über den Betrieb die schwächste — " +
      "was jemand erzählt, ist keine Fundstelle.",
  },
  bestand: {
    label: "Eigener Bestand",
    automatisch: true,
    verlaesslich: "hoch",
    hinweis: "Was creaDIG selbst erlebt hat.",
  },
}

/* ── Zustaende ──────────────────────────────────────────────────────────── */

export const RESEARCH_STATES = [
  "entdeckt",
  "in-recherche",
  "beleg-fehlt",
  "eingeordnet",
  "zurueckgestellt",
  "ausgeschlossen",
  "bereit-fuer-kontakt",
] as const
export type ResearchState = (typeof RESEARCH_STATES)[number]

export const STATE_MEANING: Record<ResearchState, string> = {
  entdeckt: "Gefunden, noch nicht angesehen.",
  "in-recherche": "Belege werden gesammelt.",
  "beleg-fehlt": "Ein zweites Betriebssignal fehlt — ohne das bleibt die Passung unklar.",
  eingeordnet: "Genug Belege für ein Urteil. Was fehlt, ist der Zugang.",
  zurueckgestellt: "Interessant, aber heute nicht bedienbar oder nicht erreichbar.",
  ausgeschlossen: "Belegter harter Ausschluss. Nicht weiterverfolgen.",
  "bereit-fuer-kontakt": "Passung und Zugang stehen. Ab hier ist es Menschenarbeit — G11.",
}

/* ── Beleg ──────────────────────────────────────────────────────────────── */

export type EvidenceKind = "fact" | "signal" | "anlass" | "ausschluss"

export type EvidenceRow = {
  id: string
  kind: EvidenceKind
  /** Signal- oder Ausschlussschluessel; bei fact/anlass leer. */
  ref: string | null
  /** Was BEOBACHTET wurde — nicht, was es bedeutet. */
  claim: string
  sourceUrl: string
  sourceKind: SourceKind
  observedAt: string
  /** Gesetzt, wenn ein neuerer Beleg diesen abgeloest hat. */
  supersededBy: string | null
}

export type ResearchCase = {
  id: string
  organisationId: string
  organisationName: string
  status: ResearchState
  discoveryWhy: string
  discoveryKind: SourceKind
  discoveryUrl: string | null
  access: "empfehlung" | "netzwerk" | "eingehend" | "bestandskunde" | "keiner" | null
  serviceable: boolean | null
  nextAction: string | null
  discoveredAt: string
  researchedAt: string | null
  evidence: EvidenceRow[]
  /*
   * GATE 11 — die Person am Vorgang und die menschliche Entscheidung.
   *
   * `contactDecision` bleibt `null`, solange niemand entschieden hat. Das
   * ist kein fehlender Wert, sondern der ganze Punkt: „bereit fuer Kontakt"
   * ist ein Zustand des Wissens, ansprechen ist eine Entscheidung.
   */
  contactId: string | null
  contactDecision: "vorbereiten" | "zurueckgestellt" | "mehr-information" | "nicht-verfolgen" | null
  contactDecisionAt: string | null
  contactDecisionNote: string | null
}

/* ── Ableitung ──────────────────────────────────────────────────────────── */

/**
 * Die Einordnung aus den Belegen — nie aus einer gespeicherten Spalte.
 *
 * Nur GUELTIGE Belege zaehlen: Was ein neuerer Beleg abgeloest hat, bleibt
 * in der Akte stehen (man muss spaeter erklaeren koennen, warum damals
 * anders entschieden wurde), zaehlt aber nicht mehr mit.
 */
export function einordnung(c: ResearchCase): Einordnung {
  const gueltig = c.evidence.filter((e) => !e.supersededBy)
  const signals: Partial<Record<SignalKey, string>> = {}
  for (const e of gueltig) {
    if (e.kind === "signal" && e.ref && e.ref in SIGNALS) {
      signals[e.ref as SignalKey] = `${e.claim} (${SOURCES[e.sourceKind].label})`
    }
  }
  const exclusions = gueltig
    .filter((e) => e.kind === "ausschluss" && e.ref)
    .map((e) => e.ref as string)

  return classify({
    signals,
    exclusions,
    zugang: c.access,
    bedienbar: c.serviceable,
    kaufkraft: null,
  })
}

/**
 * Wann Schluss ist.
 *
 * Recherche hat kein natuerliches Ende. Ohne diese Funktion sammelt man
 * weiter, weil man immer noch etwas findet — und entscheidet nie.
 */
export function abbruch(c: ResearchCase): { stop: boolean; state: ResearchState; warum: string } {
  const e = einordnung(c)
  const gueltig = c.evidence.filter((x) => !x.supersededBy)

  if (e.passung.urteil === "unpassend" && gueltig.some((x) => x.kind === "ausschluss"))
    return { stop: true, state: "ausgeschlossen", warum: "Belegter harter Ausschluss. Weitersuchen ändert daran nichts." }

  /*
   * BEDIENBARKEIT WIRD VOR ZUGANG GEPRUEFT.
   *
   * Diese Reihenfolge stand zuerst andersherum, und der Probelauf hat es
   * gefunden: Ein Schweizer Betrieb mit bestem Zugang wurde auf „bereit
   * fuer Kontakt" gesetzt, obwohl die Rechnungslage fuer CH ungeklaert ist
   * (G35).
   *
   * Jemanden anzusprechen, dem man anschliessend keine Rechnung stellen
   * kann, ist schlimmer als ihn nicht anzusprechen: Man verbrennt einen
   * echten Kontakt fuer nichts. Ein guter Zugang macht das nicht besser —
   * er macht es teurer.
   */
  if (e.passung.urteil === "passend" && c.serviceable === false)
    return { stop: true, state: "zurueckgestellt", warum: "Passt, aber heute nicht bedienbar — ansprechen hiesse, den Kontakt für nichts zu verbrauchen." }

  if (e.passung.urteil === "passend" && e.zugang.urteil === "unpassend")
    return { stop: true, state: "zurueckgestellt", warum: "Passt, aber kein ehrlicher Weg hin. Warten auf einen gemeinsamen Dritten." }

  if (e.passung.urteil === "passend" && e.zugang.urteil === "passend")
    return { stop: true, state: "bereit-fuer-kontakt", warum: "Passung, Zugang und Bedienbarkeit stehen. Alles Weitere ist Menschenarbeit." }

  if (e.passung.urteil === "passend")
    return { stop: false, state: "eingeordnet", warum: "Passung steht. Jetzt den Zugangsweg klären." }

  const signale = gueltig.filter((x) => x.kind === "signal").length
  if (signale === 1)
    return { stop: false, state: "beleg-fehlt", warum: "Ein Signal belegt. Ein zweites entscheidet — oder es bleibt unklar." }

  return { stop: false, state: "in-recherche", warum: "Noch kein belegtes Betriebssignal." }
}

/* ── Dubletten ──────────────────────────────────────────────────────────── */

/**
 * Namen vergleichbar machen.
 *
 * Dieselbe Faltung wie im CRM-Import (Gate 07) — erst Umlaute, dann
 * ae/oe/ue/ss, damit „Mueller" und „Müller" dieselbe Form ergeben. Dazu
 * fallen Rechtsformen weg: „Meyer GmbH" und „Meyer GmbH & Co. KG" sind oft
 * derselbe Betrieb und sollen wenigstens auffallen.
 */
export function foldName(roh: string): string {
  return roh
    .trim()
    .toLowerCase()
    .replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "s")
    .replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u").replace(/ss/g, "s")
    .replace(/\b(gmbh|ag|kg|ohg|ug|mbh|gbr)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
}

/** Der Wirt einer Adresse, ohne www und ohne Protokoll. */
export function host(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname
      .replace(/^www\./, "")
      .toLowerCase()
  } catch {
    return null
  }
}

export type MatchKind = "exakt" | "wahrscheinlich" | "keiner"

/**
 * Trifft ein entdeckter Betrieb einen bestehenden?
 *
 * Die Netzadresse ist der einzige Beleg, der EXAKT zusammenfuehrt — sie
 * gehoert genau einem Betrieb. Ein gefalteter Name ist ein Hinweis, kein
 * Beweis: „Meyer Bau" gibt es in jeder zweiten Stadt. Deshalb meldet er
 * WAHRSCHEINLICH und laesst einen Menschen entscheiden.
 */
export function matchOrganisation(
  kandidat: { name: string; website?: string | null },
  bestand: { id: string; name: string; website?: string | null }[],
): { kind: MatchKind; organisationId?: string; warum: string } {
  const kHost = host(kandidat.website)
  if (kHost) {
    const treffer = bestand.find((o) => host(o.website) === kHost)
    if (treffer) return { kind: "exakt", organisationId: treffer.id, warum: `gleiche Netzadresse: ${kHost}` }
  }
  const kName = foldName(kandidat.name)
  if (kName.length >= 4) {
    const treffer = bestand.find((o) => foldName(o.name) === kName)
    if (treffer)
      return {
        kind: "wahrscheinlich",
        organisationId: treffer.id,
        warum: `Name deckt sich mit „${treffer.name}“ — von Hand bestätigen, gleiche Namen gibt es oft`,
      }
  }
  return { kind: "keiner", warum: "kein Treffer im Bestand" }
}

/* ── Fremder Text ───────────────────────────────────────────────────────── */

/**
 * Recherchetext ist fremder Text.
 *
 * Er stammt von einer Seite, die creaDIG nicht kontrolliert, und er wird
 * spaeter von einer KI gelesen (G28/G29). Was hier gespeichert wird, muss
 * DATEN bleiben und darf nie zur Anweisung werden.
 *
 * Deshalb: Steuerzeichen raus, Auszeichnung raus, Laenge begrenzt, und die
 * Formen entschaerft, mit denen fremder Text sich als Anweisung ausgibt.
 */
export function sanitizeClaim(roh: string): string {
  const steuerzeichen = new RegExp("[\\u0000-\\u001f\\u007f-\\u009f]", "g")
  return roh
    .replace(steuerzeichen, " ")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/^\s*(system|assistant|user)\s*:/gim, "$1 ")
    .replace(/\b(ignore (all )?previous|disregard (all )?prior|neue anweisung)\b/gi, "[…]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600)
}

/* ── Frische und Widersprueche ──────────────────────────────────────────── */

/**
 * Wie alt ist der juengste gueltige Beleg?
 *
 * Bewusst KEINE Verfallsfrist. Eine Adresse aus dem Handelsregister ist
 * nach zwei Jahren noch richtig, eine Stellenanzeige nach zwei Monaten
 * gegenstandslos. Eine einheitliche Frist waere in beiden Faellen falsch.
 * Sichtbar machen, nicht entscheiden.
 */
export function alterInTagen(c: ResearchCase, jetzt = new Date()): number | null {
  const gueltig = c.evidence.filter((e) => !e.supersededBy)
  if (!gueltig.length) return null
  const juengster = Math.max(...gueltig.map((e) => new Date(e.observedAt).getTime()))
  return Math.floor((jetzt.getTime() - juengster) / 86_400_000)
}

/**
 * Belege zum selben Signal, die einander widersprechen — beide gueltig.
 *
 * Sie werden GEMELDET, nicht aufgeloest. Der neuere Beleg ist nicht
 * automatisch der bessere: Eine Stellenanzeige von gestern schlaegt kein
 * Handelsregister von vorletztem Jahr.
 */
export function widersprueche(c: ResearchCase): { ref: string; belege: EvidenceRow[] }[] {
  const nachRef = new Map<string, EvidenceRow[]>()
  for (const e of c.evidence) {
    if (e.supersededBy || !e.ref) continue
    nachRef.set(e.ref, [...(nachRef.get(e.ref) ?? []), e])
  }
  return [...nachRef.entries()]
    .filter(([, belege]) => belege.length > 1)
    .map(([ref, belege]) => ({ ref, belege }))
}

export { EXCLUSIONS, SIGNALS }
