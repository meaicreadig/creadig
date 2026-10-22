import { KLEINUNTERNEHMER, formatPrice, offers, remediationRange, ustSatz } from "@/lib/offers"

/**
 * DIE FIRMENWAHRHEIT — was creaDIG ist, an EINER Stelle.
 *
 * Bis 22.10.2026 beschrieb sich die Firma in fünfzehn Prompts selbst, jedes
 * Mal etwas anders: drei nannten die Golfstaaten als Markt, einer die Türkei,
 * keiner das BFSG-Angebot, die Umsatzsteuer oder die verbotenen Aussagen. Ein
 * Agent wusste also nur, was in seinem eigenen Prompt stand — und das war
 * oft veraltet.
 *
 * Jetzt lesen alle Agenten diesen Text (`firmenText()`), der Website-Prüfer
 * misst die Seite daran, und der Wissenswächter prüft jeden Entwurf gegen
 * `VERBOTENE_AUSSAGEN`. Ändert sich das Geschäft, ändert sich NUR diese Datei
 * (Preise und Steuer kommen aus `lib/offers.ts`) — und ab dem nächsten Deploy
 * arbeitet jeder Agent mit dem neuen Stand.
 *
 * Bei jeder Änderung `STAND` setzen: Die Agenten sehen daran, dass sich etwas
 * geändert hat.
 */
export const STAND = "2026-10-22"

export const FIRMA = {
  name: "creaDIG Solutions",
  rechtsform: "Einzelunternehmen",
  inhaber: "Muhammed Emin Akyol",
  standort: "ICO InnovationsCentrum Osnabrück, Niedersachsen, Deutschland",
  gruendung: "Marke seit 2017, Einzelunternehmen seit 01.10.2025",
  arbeitsweise: "Emin arbeitet allein, ohne Angestellte und ohne Investor. Ein KI-Team erledigt Routine und bereitet vor; was nach außen geht, entscheidet Emin.",
  positionierung: "System-Haus für digitale Betriebe: Websites, Barrierefreiheit, Systeme, KI-Agenten und Automatisierung",
  sprachen: "Deutsch, Türkisch, Englisch",
  geld: "Web- und Systemprojekte für Betriebe, Vereine und Verbände bringen heute das Geld; fibero ist die große Wette.",
  engpass: "Vertrieb und Zeit, nicht Technik",
} as const

/** Reihenfolge = Priorität. */
export const MAERKTE = {
  prioritaet: ["Deutschland", "Schweiz", "übriges Europa"],
  nische: "Handwerk sowie türkischsprachige Betriebe in Deutschland und Europa (Diaspora)",
  nicht: "Kein Umzug und keine Expansion in die Golfstaaten geplant; Türkei ist kein eigener Zielmarkt.",
} as const

export type Produkt = { name: string; was: string; stand: string }

export const PRODUKTE: Produkt[] = [
  { name: "fibero", was: "SaaS für Glasfaser-Montagefirmen", stand: "fertig; Ziel: erst 10–20 zahlende Firmen" },
  { name: "stammo", was: "digitale Stempelkarte im Apple/Google Wallet für Gastronomie und Handel", stand: "live unter stammo.app, 39/69 € im Monat" },
  { name: "meAI", was: "KI-Betriebssystem für Unternehmen", stand: "intern, nicht öffentlich verfügbar" },
  { name: "CASSAMEA", was: "Gastro-Kasse für die Schweiz", stand: "im Aufbau" },
  { name: "meahv", was: "Hausverwaltung", stand: "im Aufbau" },
]

/** Grundregeln des Inhabers — gelten für jeden Agenten. */
export const GRUNDREGELN = [
  "Alles legal; im Zweifel nicht.",
  "Keine Haftung für Fremde übernehmen.",
  "Kein Angstverkauf (keine Drohkulisse mit Abmahnungen, Fristen oder Strafen).",
  "Keine Kaltakquise und keine Werbe-E-Mails ohne Einwilligung (UWG § 7).",
  "Alles, was nach außen geht, gibt Emin frei.",
  "Zeigen statt behaupten: keine erfundenen Zahlen, Kundenstimmen oder Prozent-Versprechen.",
] as const

/**
 * Was creaDIG nie über sich sagt. Jede Zeile ist früher tatsächlich
 * aufgetaucht oder naheliegend. Wissenswächter und Website-Prüfer lesen sie.
 */
export const VERBOTENE_AUSSAGEN: { muster: RegExp; grund: string }[] = [
  { muster: /\bBAFA[- ]?(zertifiziert|gelistet|autorisiert|anerkannt|berater)/i, grund: "BAFA-Zertifizierung/-Listung existiert nicht" },
  { muster: /\b(iuk|AVPQ|AGD)[- ]?(zertifiziert|mitglied|gepr[uü]ft|qualifiziert)/i, grund: "Zertifizierung/Mitgliedschaft (iuk/AVPQ/AGD) existiert nicht" },
  { muster: /\b(zertifiziert|mitglied)\b[^.\n]{0,40}\b(BAFA|iuk|AVPQ|AGD)\b/i, grund: "Zertifizierung/Mitgliedschaft (BAFA/iuk/AVPQ/AGD) existiert nicht" },
  { muster: /go[- ]?digital/i, grund: "Keine go-digital-Autorisierung — der Begriff steht weder als Status noch als Angebotsname" },
  { muster: /\b(gegr[uü]ndet|seit)\s+(im\s+jahr\s+)?2018\b|\b2018\s+gegr[uü]ndet\b/i, grund: "Falsches Jahr: Marke seit 2017, Einzelunternehmen seit 01.10.2025" },
  {
    muster: /\b(Telekom|Glasfaser\s*NordWest|1\s*&\s*1|Drillisch)\b[^.\n]{0,60}\b(Kunde|Kunden|Referenz|Partner|f[uü]r die wir|Auftraggeber)/i,
    grund: "Telekom/Glasfaser NordWest/1&1/Drillisch dürfen nie als Kunde oder Partner genannt werden",
  },
  {
    muster: /\b(Kunde|Kunden|Referenz|Partner|Auftraggeber)\b[^.\n]{0,60}\b(Telekom|Glasfaser\s*NordWest|1\s*&\s*1|Drillisch)\b/i,
    grund: "Telekom/Glasfaser NordWest/1&1/Drillisch dürfen nie als Kunde oder Partner genannt werden",
  },
  ...(KLEINUNTERNEHMER ? [] : [{ muster: /Kleinunternehmer|§\s*19\s*UStG/i, grund: "creaDIG ist umsatzsteuerpflichtig (19 %), kein Kleinunternehmer" }]),
  { muster: /\b\d{1,3}\s?%\s+(mehr|h[oö]here[rn]?|weniger|schneller|g[uü]nstiger)\s+\w+/i, grund: "Prozent-Wirkungsversprechen ohne belegte Quelle" },
  { muster: /\b(Team|Mannschaft)\s+(von|aus)\s+(\d{2,}|zwanzig|drei[sß]ig|vielen|über)\b/i, grund: "Größenbehauptung zum Team – creaDIG ist ein Einzelunternehmen" },
  { muster: /\b(\d{2,})\s+(Mitarbeiter(innen)?|Angestellte|Experten)\b/i, grund: "Mitarbeiterzahl – creaDIG ist ein Einzelunternehmen" },
]

/** Kurzform der Verbote für Prompts — dieselbe Liste in Sätzen. */
const VERBOTE_TEXT = `Nie behaupten: Zertifizierungen oder Partnerstatus (BAFA, go-digital, iuk, AVPQ, AGD), Telekom/Glasfaser NordWest/1&1/Drillisch als Kunden, ${KLEINUNTERNEHMER ? "" : "Kleinunternehmer-Status, "}ein Team oder Mitarbeiterzahlen, erfundene Zahlen, Prozent-Versprechen oder Kundenstimmen.`

/** Alle öffentlichen Preise in Euro — aus `lib/offers.ts` plus stammo. */
export function bekanntePreiseEur(): number[] {
  const angebote = offers.filter((o) => o.published && o.amount !== null).map((o) => o.amount as number)
  return [...new Set([...angebote, remediationRange.from, remediationRange.to, 39, 69])]
}

function angeboteText(): string {
  const preis = (key: string) => {
    const o = offers.find((x) => x.key === key && x.published && x.amount !== null)
    return o ? formatPrice(o.amount as number, "de") : null
  }
  const teile = [
    preis("website") && `Website-Paket ${preis("website")} Festpreis${preis("website-pilot") ? ` (Pilotplatz je Gewerk ${preis("website-pilot")} gegen schriftliche Referenzfreigabe)` : ""}`,
    preis("audit") && `Barrierefreiheit nach BFSG: Prüfung ${preis("audit")}, Behebung ${formatPrice(remediationRange.from, "de")}–${formatPrice(remediationRange.to, "de")}`,
    preis("betreuung") && `Website-Betreuung ${preis("betreuung")} im Monat`,
    "Systeme, KI-Agenten und Automatisierung nach Analyse",
  ].filter(Boolean)
  return `${teile.join("; ")}. ${ustSatz("de")}`
}

/**
 * Die Firma als Text für Prompts.
 * `kurz`: eine Zeile für Agenten, die nur den Rahmen brauchen.
 * `voll`: alles, was ein Agent wissen muss, bevor er etwas für creaDIG schreibt.
 */
export function firmenText(umfang: "kurz" | "voll" = "voll"): string {
  if (umfang === "kurz")
    return `${FIRMA.name} (${FIRMA.rechtsform}, Inhaber ${FIRMA.inhaber}, ${FIRMA.standort}): ${FIRMA.positionierung}. Eigene Produkte: ${PRODUKTE.map((p) => p.name).join(", ")}. Märkte: ${MAERKTE.prioritaet.join(" > ")}.`
  return [
    `FIRMA (Stand ${STAND}): ${FIRMA.name}, ${FIRMA.rechtsform} von ${FIRMA.inhaber}, ${FIRMA.standort}. ${FIRMA.gruendung}. ${FIRMA.arbeitsweise}`,
    `WAS WIR TUN: ${FIRMA.positionierung}. ${FIRMA.geld}`,
    `ANGEBOTE: ${angeboteText()}`,
    `EIGENE PRODUKTE: ${PRODUKTE.map((p) => `${p.name} (${p.was}; ${p.stand})`).join("; ")}.`,
    `MÄRKTE: ${MAERKTE.prioritaet.join(" > ")}. Nische: ${MAERKTE.nische}. ${MAERKTE.nicht}`,
    `SPRACHEN: ${FIRMA.sprachen}. ENGPASS: ${FIRMA.engpass}.`,
    `REGELN: ${GRUNDREGELN.join(" ")}`,
    `VERBOTEN: ${VERBOTE_TEXT}`,
  ].join("\n")
}

/** Dieselbe Kurzform auf Englisch — für Agenten, die englisch schreiben. */
export function firmenTextEn(): string {
  return `${FIRMA.name} (sole proprietorship of ${FIRMA.inhaber}, ICO InnovationsCentrum Osnabrück, Germany; brand since 2017): systems house for digital businesses — websites, accessibility (BFSG), systems, AI agents and automation. Own products: ${PRODUKTE.map((p) => p.name).join(", ")}. Markets: Germany > Switzerland > rest of Europe. Never claim certifications, partner status, employees or invented figures.`
}
