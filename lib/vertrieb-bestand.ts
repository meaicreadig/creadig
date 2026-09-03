import { EXCLUSION_OTHER_CONTEXT, EXCLUSION_TESTDATA } from "@/lib/vertrieb"
import type { LifecycleStage, RelationshipLevel } from "@/lib/vertrieb"

/**
 * Der reale creaDIG-Bestand — als Daten, nicht als SQL.
 *
 * ===========================================================================
 * WAS HIER STEHEN DARF
 * Ausschliesslich, was der Eigentümer angegeben hat. Keine Zeile stammt aus
 * einer Suchmaschine.
 *
 * Das ist keine Bequemlichkeit, sondern die Anforderung: Bei „Allrein-ofra",
 * „MAS Küchenoutlet", „IKV Lohne" oder „Bergkamen Bildungsakademie" gibt es
 * mehrere plausible Treffer, und der plausibelste ist nicht der belegte. Eine
 * Adresse, die zu 80 % stimmt, ist schlimmer als ein leeres Feld: Das leere
 * Feld sagt „nachschlagen", die falsche Adresse sagt „erledigt".
 *
 * Bei ARAG, freenet und dem Integrationsrat kommt hinzu, dass die falsche
 * Zuordnung nicht nur ungenau, sondern fachlich unwahr wäre — eine Agentur
 * ist nicht ihr Konzern, ein Shop nicht seine Kette, ein kommunales Gremium
 * keine GmbH. Diese Fälle tragen ihre offene Frage im Feld `note`, damit sie
 * beim nächsten Öffnen des Datensatzes dasteht und nicht in einem Bericht
 * verstaubt.
 *
 * ---------------------------------------------------------------------------
 * WOHER DIE ORTE KOMMEN
 * Wo unten ein Ort steht, stammt er aus der Bezeichnung, die der Eigentümer
 * selbst verwendet hat („ViSec Osnabrück", „Star Imbiss Dinklage"), oder aus
 * einer ausdrücklich mitgeteilten Anschrift (Vegitat, ASA). Nirgends aus
 * einem Suchergebnis.
 *
 * ---------------------------------------------------------------------------
 * WAS „kunde" HIER HEISST
 * Belegte Geschäftsbeziehung — mehr nicht. Ob sie heute aktiv ist, weiss
 * niemand, und es gibt kein Feld, das es behauptet. Genau dafür ist die
 * Stufe so formuliert (`LIFECYCLE_NOTES` in `vertrieb.ts`).
 *
 * ---------------------------------------------------------------------------
 * WAS HIER NICHT STEHT
 * Keine Umsätze, keine Projekte, keine Ansprechpartner ausser dem einen
 * ausdrücklich genannten, keine letzten Kontakte, keine Verkaufschancen.
 * Der Import legt keine einzige Chance an — eine Chance entsteht, wenn ein
 * Mensch sie anlegt.
 */

export type BestandOrganisation = {
  /** Stabil und für immer. Ändert sich der Name, bleibt der Schlüssel. */
  importKey: string
  name: string
  lifecycle: LifecycleStage
  website?: string
  phone?: string
  street?: string
  postalCode?: string
  city?: string
  country?: string
  industry?: string
  /** Offene Frage oder belegter Zusammenhang. Kein Marketingtext. */
  note?: string
  locations?: BestandLocation[]
}

export type BestandLocation = {
  importKey: string
  label: string
  street?: string
  postalCode?: string
  city?: string
  country?: string
}

export type BestandContact = {
  importKey: string
  name: string
  organisationKey: string
  relationship: RelationshipLevel
  role?: string
  note?: string
}

/* ========================================================================== *
 * ORGANISATIONEN
 * ========================================================================== */

const DATENLUECKE = "Datenlücke: Stammdaten liegen nicht belegt vor. Nicht recherchiert, weil die Organisation nicht eindeutig identifiziert ist."

export const BESTAND_ORGANISATIONEN: BestandOrganisation[] = [
  /* ── Vegitat: eine Organisation, vier Standorte ───────────────────────────
     Der Grund, warum es die Standorttabelle überhaupt gibt. Vier Adressen,
     ein Kunde. Vier Organisationen daraus zu machen hiesse, jede Zählung ab
     dem ersten Tag zu vervierfachen. */
  {
    importKey: "bestand:vegitat",
    name: "Vegitat",
    lifecycle: "kunde",
    country: "Schweiz",
    industry: "Gastronomie",
    note: "Mehrere Standorte, eine Organisation. Zürich ist für die bestehende Beziehung besonders relevant.",
    locations: [
      { importKey: "bestand:vegitat:basel-klybeck", label: "Basel Klybeck", street: "Klybeckstrasse 62", postalCode: "4057", city: "Basel", country: "Schweiz" },
      { importKey: "bestand:vegitat:basel-st-johann", label: "Basel St. Johann", street: "Elsässerstrasse 29", postalCode: "4056", city: "Basel", country: "Schweiz" },
      { importKey: "bestand:vegitat:zuerich-langstrasse", label: "Zürich Langstrasse", street: "Langstrasse 192", postalCode: "8005", city: "Zürich", country: "Schweiz" },
      { importKey: "bestand:vegitat:luzern", label: "Luzern Bleicherstrasse", street: "Bleicherstrasse 29", postalCode: "6003", city: "Luzern", country: "Schweiz" },
    ],
  },

  {
    importKey: "bestand:nv-swiss",
    name: "NV Swiss Versicherungs- und Finanzmakler",
    lifecycle: "kunde",
    country: "Schweiz",
    industry: "Versicherungs- und Finanzmakler",
    note: "Belegte creaDIG-Leistung: Marke, Website und Digitalisierung aus einer Hand. Anschrift und Erreichbarkeit liegen nicht belegt vor.",
  },

  /* ── Die einzige weitere ausdrücklich mitgeteilte Anschrift ────────────── */
  {
    importKey: "bestand:asa-pflege",
    name: "ASA Ambulanter Pflegedienst",
    lifecycle: "kunde",
    street: "Meller Landstraße 50",
    postalCode: "49086",
    city: "Osnabrück",
    country: "Deutschland",
    industry: "Ambulante Pflege",
    note: "Anschrift aus Eigentümer-Unterlagen. Weitere Stammdaten bewusst offen.",
  },

  {
    importKey: "bestand:allrein-ofra",
    name: "Allrein-ofra",
    lifecycle: "kunde",
    note: `${DATENLUECKE} Ähnlich klingende Treffer sind ausdrücklich nicht übernommen worden.`,
  },

  {
    importKey: "bestand:visec",
    name: "ViSec Osnabrück",
    lifecycle: "kunde",
    city: "Osnabrück",
    country: "Deutschland",
    note: `Ort aus der Bezeichnung des Eigentümers. ${DATENLUECKE}`,
  },

  {
    importKey: "bestand:star-imbiss-dinklage",
    name: "Star Imbiss Dinklage",
    lifecycle: "kunde",
    city: "Dinklage",
    country: "Deutschland",
    industry: "Gastronomie",
    note: "Ort aus der Bezeichnung des Eigentümers. Anschrift nicht belegt.",
  },

  {
    importKey: "bestand:an-automobile-diepholz",
    name: "A+N Automobile Diepholz",
    lifecycle: "kunde",
    city: "Diepholz",
    country: "Deutschland",
    industry: "Automobilhandel",
    note: "Ort aus der Bezeichnung des Eigentümers. Anschrift nicht belegt.",
  },

  /* ── Drei Fälle, in denen die falsche Zuordnung nicht ungenau, sondern
       unwahr wäre. Die Frage steht im Datensatz, nicht in einem Bericht. ── */
  {
    importKey: "bestand:arag-osnabrueck",
    name: "ARAG Osnabrück",
    lifecycle: "kunde",
    city: "Osnabrück",
    country: "Deutschland",
    note: "Zu klären: War der Kunde eine lokale Agentur oder Vertretung? Die ARAG SE ist hier ausdrücklich NICHT als creaDIG-Kunde hinterlegt — die rechtliche Einheit ist unbelegt.",
  },

  {
    importKey: "bestand:bergkamen-bildungsakademie",
    name: "Bergkamen Bildungsakademie",
    lifecycle: "kunde",
    city: "Bergkamen",
    country: "Deutschland",
    industry: "Bildung",
    note: `Bezeichnung möglicherweise nicht eindeutig — die genaue Firmierung ist offen. ${DATENLUECKE}`,
  },

  {
    importKey: "bestand:big-bielefeld",
    name: "Bündnis Islamischer Gemeinden in Bielefeld e. V.",
    lifecycle: "kunde",
    city: "Bielefeld",
    country: "Deutschland",
    industry: "Eingetragener Verein",
    note: "Kurzform beim Eigentümer: BIG. Anschrift nicht belegt übernommen.",
  },

  {
    importKey: "bestand:integrationsrat-bielefeld",
    name: "Integrationsrat Bielefeld",
    lifecycle: "kunde",
    city: "Bielefeld",
    country: "Deutschland",
    industry: "Kommunales Gremium",
    note: "Kommunale Struktur, keine Gesellschaft. Bewusst nicht als GmbH oder Firma modelliert.",
  },

  {
    importKey: "bestand:ikv-lohne",
    name: "IKV Lohne",
    lifecycle: "kunde",
    city: "Lohne",
    country: "Deutschland",
    note: `Abkürzung nicht aufgelöst — jede Auflösung wäre geraten. ${DATENLUECKE}`,
  },

  {
    importKey: "bestand:kids-catering-basel",
    name: "Kids Catering Basel",
    lifecycle: "kunde",
    city: "Basel",
    country: "Schweiz",
    industry: "Catering",
    note: "Ort aus der Bezeichnung des Eigentümers. Anschrift nicht belegt.",
  },

  {
    importKey: "bestand:bln-bauueberwachung",
    name: "BLN Bauüberwachung GmbH",
    lifecycle: "kunde",
    city: "Beckum",
    country: "Deutschland",
    industry: "Bauüberwachung",
    note: "Ort vom Eigentümer angegeben. Anschrift nicht belegt.",
  },

  /* ── freenet: drei Datensätze, absichtlich nicht zusammengeführt ─────────
       Gleiche Marke ist kein Beleg für gleichen Betreiber. Ohne belegte
       gemeinsame Betreiberorganisation bleiben sie getrennt — die
       Zusammenführung liesse sich später nachholen, die Trennung nach einer
       falschen Verschmelzung nicht. */
  {
    importKey: "bestand:freenet-osnabrueck",
    name: "Freenet Osnabrück",
    lifecycle: "kunde",
    city: "Osnabrück",
    country: "Deutschland",
    industry: "Telekommunikation, Handel",
    note: "Zu klären: Shop, Franchisenehmer, lokaler Betreiber oder andere rechtliche Einheit? Die freenet AG ist NICHT als direkter Kunde hinterlegt. Nicht mit den Shops Bünde und Lübbecke zusammengeführt — gleiche Marke ist kein Beleg für gleichen Betreiber.",
  },
  {
    importKey: "bestand:freenet-shop-buende",
    name: "Freenet Shop Bünde",
    lifecycle: "kunde",
    city: "Bünde",
    country: "Deutschland",
    industry: "Telekommunikation, Handel",
    note: "Eigener Datensatz, solange keine belegte gemeinsame Betreiberorganisation mit den anderen freenet-Standorten vorliegt.",
  },
  {
    importKey: "bestand:freenet-shop-luebbecke",
    name: "Freenet Shop Lübbecke",
    lifecycle: "kunde",
    city: "Lübbecke",
    country: "Deutschland",
    industry: "Telekommunikation, Handel",
    note: "Eigener Datensatz, solange keine belegte gemeinsame Betreiberorganisation mit den anderen freenet-Standorten vorliegt.",
  },

  {
    importKey: "bestand:mas-kuechenoutlet",
    name: "MAS Küchenoutlet",
    lifecycle: "kunde",
    country: "Deutschland",
    industry: "Küchenhandel",
    note: DATENLUECKE,
  },

  {
    importKey: "bestand:digitalhoch5",
    name: "DigitalHoch5",
    lifecycle: "kunde",
    city: "Osnabrück",
    country: "Deutschland",
    note: "Ort vom Eigentümer angegeben. Anschrift nicht belegt.",
  },

  /* ── Keine Kunden. Der Unterschied ist der ganze Punkt der Lifecycle-Achse:
       warm heisst nicht Kunde, und Kontakt heisst nicht Vorgang. ─────────── */
  {
    importKey: "bestand:flanscher",
    name: "FLANSCHER GmbH",
    lifecycle: "prospect",
    country: "Deutschland",
    note: "Kein bisheriger creaDIG-Kunde. Warmer Geschäftskontakt über Ole Bettray. Keine belegte Verkaufschance — und deshalb ist hier keine angelegt.",
  },
  {
    importKey: "bestand:coresection",
    name: "coresection.ch",
    lifecycle: "prospect",
    website: "https://coresection.ch",
    country: "Schweiz",
    note: "Kein bisheriger creaDIG-Kunde. Netzwerk- und Know-how-Kontakt: zeigte eine Lead-Plattform und bot einen Vertriebs- und Setup-Ansatz an. Das ist ein Gesprächsstand, kein Vorgang — bewusst keine Verkaufschance.",
  },

  /* ── Neue Prospects (Owner 03.09.2026) — keine erfundenen Chancen ─────── */
  {
    importKey: "bestand:ullmann-wohnen-betonen",
    name: "Ullmann Wohnen Betonen",
    lifecycle: "prospect",
    street: "Heiligengeiststraße 31-32",
    phone: "0441 92345",
    country: "Deutschland",
    note: "Vom Eigentümer als neuer Lead genannt. Telefon und Straße belegt; PLZ und Ort nicht ausdrücklich mitgeteilt. Keine Verkaufschance angelegt.",
  },
  {
    importKey: "bestand:ferda-igdebeli-sensoy",
    name: "Dr. med. Ferda Igdebeli-Sensoy",
    lifecycle: "prospect",
    country: "Deutschland",
    industry: "Medizin",
    note: "Vom Eigentümer als neuer Lead genannt. Keine Anschrift, keine Erreichbarkeit belegt. Keine Verkaufschance angelegt.",
  },
  {
    importKey: "bestand:hueseyin-yilmaz",
    name: "Dr. Hüseyin Yilmaz",
    lifecycle: "prospect",
    city: "Georgsmarienhütte",
    country: "Deutschland",
    industry: "Medizin",
    note: "Vom Eigentümer als neuer Lead genannt (Herr Dr. Hüseyin Yilmaz). Ort aus der Angabe. Keine Anschrift oder Erreichbarkeit belegt. Keine Verkaufschance angelegt.",
  },
]

/* ========================================================================== *
 * KONTAKTE
 * ========================================================================== */

/**
 * Genau ein Mensch.
 *
 * Für die 19 Bestandskunden ist kein Ansprechpartner mitgeteilt worden, und
 * einen zu recherchieren hiesse, personenbezogene Daten aus fremden Quellen
 * anzureichern, weil sie auffindbar wären. Das ist der Unterschied zwischen
 * „darf man finden" und „darf man speichern".
 */
export const BESTAND_KONTAKTE: BestandContact[] = [
  {
    importKey: "bestand:ole-bettray",
    name: "Ole Bettray",
    organisationKey: "bestand:flanscher",
    relationship: "warm",
    note: "Warm laut Eigentümer. Kein Kunde, keine belegte Verkaufschance. E-Mail und Telefon liegen nicht vor und sind nicht recherchiert.",
  },
  {
    importKey: "bestand:ferda-igdebeli-sensoy-kontakt",
    name: "Dr. med. Ferda Igdebeli-Sensoy",
    organisationKey: "bestand:ferda-igdebeli-sensoy",
    relationship: "unbekannt",
    role: "Ärztin",
    note: "Vom Eigentümer als neuer Lead genannt. Beziehung nicht eingestuft. E-Mail und Telefon liegen nicht vor.",
  },
  {
    importKey: "bestand:hueseyin-yilmaz-kontakt",
    name: "Herr Dr. Hüseyin Yilmaz",
    organisationKey: "bestand:hueseyin-yilmaz",
    relationship: "unbekannt",
    role: "Arzt",
    note: "Vom Eigentümer als neuer Lead genannt. Ort: Georgsmarienhütte. Beziehung nicht eingestuft. E-Mail und Telefon liegen nicht vor.",
  },
]

/* ========================================================================== *
 * AUSSCHLÜSSE
 * ========================================================================== */

/**
 * Was nicht auf die operative Arbeitsfläche gehört — und warum.
 *
 * Namen werden EXAKT verglichen (kleingeschrieben, getrimmt), nie mit
 * Platzhaltern. „Yilmaz" als Muster träfe eines Tages einen echten Kunden,
 * der zufällig so heisst; „yilmaz dachtechnik" trifft genau den Datensatz,
 * der gemeint ist.
 *
 * Die einzige Ausnahme ist die Domain `@beispiel.invalid` — eine für Tests
 * reservierte Endung, die per Norm nie einem Menschen gehören kann.
 */
export const AUSGESCHLOSSENE_NAMEN: { name: string; reason: string }[] = [
  { name: "Runde2 Testbetrieb", reason: EXCLUSION_TESTDATA },
  { name: "Gate4 Runde2", reason: EXCLUSION_TESTDATA },
  { name: "Gate4 Testbetrieb", reason: EXCLUSION_TESTDATA },
  { name: "Yilmaz Dachtechnik", reason: EXCLUSION_TESTDATA },
  { name: "Deniz Yilmaz", reason: EXCLUSION_TESTDATA },
  { name: "V11 Abnahme Betrieb", reason: EXCLUSION_TESTDATA },

  /* Echte Menschen mit echten Anliegen — nur nicht im creaDIG-Vertrieb.
     Sie als „Testdaten" zu führen wäre bequem und unwahr. */
  { name: "Eigentümer Friedhofsweg 66A, Oldenburg", reason: EXCLUSION_OTHER_CONTEXT },
  { name: "Eigentümer/Objektkontakt Konradstr. 29, Oldenburg", reason: EXCLUSION_OTHER_CONTEXT },
  { name: "LEG / Hausverwaltung Aurich", reason: EXCLUSION_OTHER_CONTEXT },
]

/** Für Tests reservierte Endung — RFC 2606. Gehört nie einem Menschen. */
export const AUSGESCHLOSSENE_MAIL_ENDUNG = "@beispiel.invalid"
