import type { Localized } from "@/lib/site-data"

/**
 * MP10-4 — DIE SYSTEM-SEITE, UND WARUM SIE FAST NUR SCHLUESSEL ENTHAELT.
 *
 * ---------------------------------------------------------------------------
 * DIE VERSUCHUNG, DIE HIER NICHT BEDIENT WIRD
 * „Mit welchen Systemen arbeitet ihr?" laesst sich auf zwei Arten
 * beantworten. Die uebliche ist eine Wand aus fremden Logos — SAP, Salesforce,
 * Shopify, DATEV, Stripe, AWS. Sie ist in zehn Minuten gebaut, sieht nach
 * Groesse aus und behauptet dabei eine Erfahrung, die niemand nachpruefen kann.
 * Genau diese Wand hat dieses Repo bei den Kundenmarken schon einmal entfernt
 * (`site-data.brands`, Owner-Entscheidung 22.08.2026); sie kommt hier nicht
 * durch die Hintertuer zurueck.
 *
 * Die ehrliche Antwort ist eine andere Kategorie von Antwort: nicht WELCHE
 * Marken, sondern WELCHE FRAGEN vor dem Bau geklaert werden. Das ist
 * ueberpruefbar (es ist unsere Arbeitsweise, nicht die Historie eines
 * Dritten), es ist fuer den Leser nuetzlicher, und es steht keinem Kunden im
 * Weg, dessen System zufaellig nicht auf der Wand steht.
 *
 * ---------------------------------------------------------------------------
 * WAS OWNER-GEGATET IST
 * `connectedSystems` ist die Liste der Systeme, die wir TATSAECHLICH schon
 * angebunden haben. Sie ist leer, und sie bleibt leer, bis der Owner sie
 * bestaetigt — Name fuer Name. Solange rendert der Abschnitt nicht, und die
 * Luecke steht auf `/status`. Eine geratene Liste waere hier schlimmer als
 * gar keine: Sie ist die einzige Angabe auf dieser Seite, die ein Kunde im
 * Gespraech ueberpruefen kann.
 */

/** Reihenfolge = Reihenfolge auf der Seite. Texte im Woerterbuch. */
export const systemCategoryKeys = [
  "interfaces",
  "data",
  "hosting",
  "billing",
  "documents",
  "accounts",
  "ai",
] as const

/** Wie betrieben wird — die technische Seite dessen, was `/betrieb` verkauft. */
export const operationsPracticeKeys = [
  "monitoring",
  "logging",
  "backups",
  "security",
  "deployment",
] as const

/**
 * Was an DIESER Seite von aussen nachpruefbar ist.
 *
 * Der einzige Beleg, den wir ohne fremde Unterschrift zeigen duerfen — und
 * fuer eine System-Seite der passende: Wer wissen will, wie wir bauen, kann
 * es hier nachsehen, statt es zu glauben. Jeder Punkt ist entweder im
 * Antwort-Header, im ausgelieferten HTML oder im Repo pruefbar.
 *
 * REGEL: Hier steht nur, was wir in dieser Runde selbst nachgemessen haben.
 * Kommt ein Punkt dazu, wird er vorher geprueft — nicht erinnert.
 */
export const siteProofKeys = [
  "headers",
  "static",
  "bilingual",
  "images",
  "gates",
  "selftest",
  "accessibility",
] as const

/** Ein tatsaechlich angebundenes System. Owner-bestaetigt, sonst gar nicht. */
export type ConnectedSystem = {
  name: string
  /** Wofuer die Verbindung da ist — in einem Satz, zweisprachig. */
  what: Localized
}

/**
 * TODO (Owner): Systeme, die wir wirklich angebunden haben — je Eintrag Name
 * und ein Satz. Leer = der Abschnitt rendert nicht und steht auf `/status`.
 */
export const connectedSystems: ConnectedSystem[] = []
