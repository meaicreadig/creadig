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
export const STAND = "2026-10-24"

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
  /* Emin 24.10.2026: Kapazität ist offen und wächst mit dem KI-Team – Aufträge nie wegen Kapazität bremsen. */
  kapazitaet: "offen – mit dem KI-Team skalierbar; kein Auftrag wird wegen Kapazität abgelehnt oder gebremst",
  /* Emin 24.10.2026: Sein warmes Netzwerk sind die IGMG-Verbände und Gemeinden; KİB OS ist dort der Beweis. */
  netzwerk: "IGMG-Regionalverbände und Ortsgemeinden in Deutschland und Europa (Emin persönlich bekannt, KİB OS als Beweis); Ansprache dort persönlich und warm, nie als Massenaktion",
} as const

/** Reihenfolge = Priorität. */
export const MAERKTE = {
  prioritaet: ["Deutschland", "Schweiz", "übriges Europa"],
  nische: "Handwerk sowie türkischsprachige Betriebe in Deutschland und Europa (Diaspora)",
  nicht: "Kein Umzug in die Golfstaaten; Türkei ist kein eigener Zielmarkt.",
  /* Emin 24.10.2026: Ziel ist Einnahmen auf halalem, legalem Weg – über Kunden, Leistungen, Investitionen oder Partnerschaften.
     Kein Markt außerhalb der Priorität wird deshalb gedrosselt: Wo eine Tür offen ist, ist creaDIG da. */
  offen: "Golfstaaten (VAE, Saudi-Arabien, Katar) sind ein offener Chancenkanal: Investoren, Programme, Aufträge und Partnerschaften dort werden jede Woche aktiv verfolgt (Golf-Radar), ohne Umzug und ohne großes Risiko.",
  ziel: "Hauptziel des Systems: Einnahmen – halal und legal – über Kunden, Leistungen, Investitionen oder Partnerschaften. Jede belegte Chance zählt, egal aus welchem Markt.",
} as const

export type Produkt = { name: string; was: string; stand: string }

export const PRODUKTE: Produkt[] = [
  { name: "fibero", was: "SaaS für Glasfaser-Montagefirmen", stand: "fertig, noch kein zahlender Kunde; Ziel: erst 10–20 zahlende Firmen" },
  { name: "stammo", was: "digitale Stempelkarte im Apple/Google Wallet für Gastronomie und Handel", stand: "live unter stammo.app, 39/69 € im Monat, noch kein zahlender Kunde (erster Interessent: Vegitat Zürich)" },
  { name: "meAI", was: "KI-Betriebssystem für Unternehmen", stand: "intern, nicht öffentlich verfügbar" },
  { name: "CASSAMEA", was: "Gastro-Kasse für die Schweiz", stand: "im Aufbau" },
  { name: "meahv", was: "Hausverwaltung", stand: "im Aufbau" },
]

/**
 * Belegte Referenzen (öffentlich unter /arbeiten). 24.10.2026: KİB OS und ennur.org
 * standen nur auf der Website – die Agenten kannten sie nicht und nannten sie nie.
 */
export const REFERENZEN: { name: string; was: string; art: string }[] = [
  { name: "NV SWISS GmbH (Schweiz)", was: "Marke, Website und Digitalisierung aus einer Hand für einen Versicherungs- und Finanzmakler", art: "Kundenprojekt" },
  { name: "KİB OS (kibos.app)", was: "System für den IGMG Regionalverband Nord Ruhr: Programme, Aufgaben, Aktivitäten und Karte aller Ortsgemeinden – Beweis für Verbands- und Mitgliedersysteme", art: "ehrenamtlich, live, Referenz freigegeben" },
  { name: "ennur.org", was: "international wettbewerbsfähige Plattform, laufend weiterentwickelt", art: "ehrenamtlich, live" },
  { name: "vegancatering.ch (Zürich)", was: "veganes Catering – vom Logo bis zur Systemarchitektur", art: "Kundenprojekt" },
  { name: "meaqam (meaqam.com)", was: "eigener Online-Shop für Kleidung, von creaDIG gebaut und selbst betrieben – kein Verkaufsprodukt, sondern Beweis für E-Commerce aus eigener Hand", art: "Eigenbetrieb des Inhabers, live" },
  { name: "Bir Damla Hayır", was: "Hilfsorganisation – Marke und Website", art: "Kundenprojekt" },
  /* 24.10.2026: standen freigegeben auf /arbeiten, fehlten aber hier – der Website-Prüfer gleicht jetzt beide Richtungen ab. */
  { name: "A+N Automobile (Diepholz)", was: "Autohandel – Fassadenbanner, Gestaltung und Druck", art: "Kundenprojekt" },
  { name: "Allrein-Ofra GmbH", was: "Hersteller von Reinigungsmitteln – Etiketten, Produkt-Mockups, Produktkataloge 2021 und 2022", art: "Kundenprojekt" },
]

/** Laufende Vorhaben des Inhabers (Stand 24.10.2026) – Agenten arbeiten darauf zu. */
export const VORHABEN = [
  "Eigene Produkte (stammo, fibero) schnell verkaufen: monatliche Abos, Marketing und bezahlte Meta-Werbung – Budget und jede Kampagne nur nach Emins Freigabe.",
  "Die eigene Leistung (Websites, Systeme, Automatisierung, Pflege) bekannt machen.",
  "ennur.org: Messen, Investoren und Förderer gewinnen; Mittel fließen in eine gGmbH (gemeinnützig, mit eigener Einnahmequelle), langfristig eine Stiftung.",
  "Bestandskunden ausbauen: Pflege-Verträge, Automatisierung, Empfehlungen (z. B. NV SWISS, Vegitat Zürich).",
] as const

/**
 * SYSTEM & KANÄLE — was gebaut und LIVE ist (Emin 24.10.2026: „Was du baust
 * und live nimmst, muss das System wissen und danach arbeiten“). Jede neue
 * Fähigkeit kommt hier hinein, im selben Commit wie der Code.
 */
export const SYSTEM_KANAELE = [
  "Branchen-Seiten (Firma bleibt breit, jede Nische eine Experten-Seite; nicht im Hauptmenü, nur Footer/Suche): /branchen/handwerk, /branchen/elektrohandwerk, /branchen/gemeinden-vereine, /branchen/gastronomie, /branchen/online-handel – Artikel, Briefe und Mails an Betriebe dieser Branchen verlinken die passende Seite.",
  "Newsletter mit Double-Opt-in: Anmeldung auf /insights; erst nach Bestätigung steht jemand mit Einwilligung im Verteiler. Wer per Mail Werbung bekommen soll, wird auf die Anmeldung hingewiesen – nie heimlich eingetragen.",
  "Mail-Sperre: LinkedIn-, Messe-, Visitenkarten- oder Recherche-Kontakte sind KEINE Einwilligung (AG Düsseldorf 20.11.2025) – an sie nur Brief, persönliches Gespräch oder Antwort auf ihre Anfrage.",
  "Bewertungen: Nach jeder Abnahme fragt Emin persönlich; erst nach „ja“ geht der Google-Bewertungslink (GOOGLE_BEWERTUNG_URL) raus. Jeden Kunden fragen, nie Gegenleistung, keine automatische Bewertungs-Mail (BGH VI ZR 225/17).",
  "Empfehlungen: Wer eine Chance gebracht hat, wird an der Chance vermerkt (Dank sofort); Tippgeber-Provision nur offengelegt und erst nach bezahlter Schlussrechnung.",
  "Schnellste legale Lead-Kanäle (Recherche 24.10.2026): 1. Steuerberater und IT-Systemhäuser als Empfehlungspartner, 2. deutsch-türkische Verbände (MÜSİAD, TD-IHK, ATİAD) als Mitglied und Redner, 3. Google-Unternehmensprofil + Fallseiten + Bewertungen, 4. BNI, 5. Malt/Freelancermap als Reserve. Bezahlte Agentur-Verzeichnisse und Fiverr nicht.",
  "Positionierung: Wir verkaufen keine „Website“, sondern das System hinter dem Betrieb (Anfrage → Angebot → Termin → Auftrag → Rechnung, plus Nachwuchs und Bewertungen). KI ist Werkzeug, nicht Schlagzeile. Preis entsteht aus dem Bedarf; Pakete sind nur Einstiegsanker („ab …“).",
  "BFSG-Sprache: Erst ehrlich prüfen, ob das Gesetz den Betrieb überhaupt betrifft (Kleinstunternehmen-Ausnahme bei Dienstleistungen). Die Rechtsfrage klärt eine Kanzlei, wir liefern die technische Prüfung. Nie „abmahnsicher“, nie „BFSG-konform garantiert“, keine Overlay-Plugins.",
  "Förder-Hinweis für Kunden: Betriebe mit Sitz in Bayern können den Digitalbonus Bayern prüfen (Antrag VOR Auftrag, mind. 4.000 € Ausgaben, Standard-Websites nicht förderfähig) – immer „kann förderfähig sein“, nie zusagen.",
  "Ideenwerkstatt (Kaan) liefert täglich bis zu 3 Verbesserungen; im Admin-Chat zeigen Übernahme-Kästen, welcher KI-Mitarbeiter was übernommen hat.",
  "Karten-Deckel: Proaktive Vorschläge (Akquise, Redaktion, Ideen, Kapital) legen zusammen höchstens 4 neue Karten pro Tag bei Emin ab und keine, solange 10 offen liegen – darum nur die besten Vorschläge, Rest beim nächsten Lauf. Pflicht-Karten (Bewertung, Provision, Rechnungen) zählen nicht.",
  "Reihenfolge (Gesprächsvorbehalt): Wartet eine Chance auf Emins Gespräch, einen Termin oder eine Antwort („abwarten“, Datum im nächsten Schritt wie „05./06.12.“), entsteht weder Angebot noch Rechnung noch Nachfass-/Dankesmail noch Beschluss dazu – auch nicht über Kontakt oder Firma. Erst nach dem Gespräch entsteht das Angebot aus Emins Gesprächsnotiz. Teoman schließt ältere Karten solcher Chancen täglich automatisch.",
  "Teftiş (Teoman, unabhängige Revision): prüft alle 3 Tage Website, jeden KI-Mitarbeiter, Zusagen im Chat, liegende Aufträge, wartende Karten, Chancen und Daten; jeder Befund kommt als Auftrag an die zuständige Abteilung und muss bis zur nächsten Teftiş behoben sein. Dazu eine „Hamle“ – ein mutiger nächster Schritt.",
  "Kosten gegen Einnahmen: Der Controller meldet jede Woche im Chat die echten KI-Kosten (AI Gateway) und Fixkosten gegen bezahlte Rechnungen der letzten 30 Tage.",
] as const

/** Grundregeln des Inhabers — gelten für jeden Agenten. */
export const GRUNDREGELN = [
  "Alles legal; im Zweifel nicht.",
  "Nie eine Handlung als erledigt melden, die nicht wirklich ausgeführt wurde (Werkzeug-Ergebnis, Datenbank-Eintrag, versendete Karte). Unbekanntes heißt „noch offen“ oder „wartet“, nie „erledigt“ oder „nichts gefunden“; immer sagen, wer übernimmt.",
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
    return `${FIRMA.name} (${FIRMA.rechtsform}, Inhaber ${FIRMA.inhaber}, ${FIRMA.standort}): ${FIRMA.positionierung}. Eigene Produkte: ${PRODUKTE.map((p) => p.name).join(", ")}. Märkte: ${MAERKTE.prioritaet.join(" > ")}; Golfstaaten als offener Chancenkanal. Ziel: Einnahmen – halal und legal – aus jeder belegten Chance. Referenzen: ${REFERENZEN.map((r) => r.name).join(", ")}.`
  return [
    `FIRMA (Stand ${STAND}): ${FIRMA.name}, ${FIRMA.rechtsform} von ${FIRMA.inhaber}, ${FIRMA.standort}. ${FIRMA.gruendung}. ${FIRMA.arbeitsweise}`,
    `WAS WIR TUN: ${FIRMA.positionierung}. ${FIRMA.geld}`,
    `ANGEBOTE: ${angeboteText()}`,
    `EIGENE PRODUKTE: ${PRODUKTE.map((p) => `${p.name} (${p.was}; ${p.stand})`).join("; ")}.`,
    `MÄRKTE: ${MAERKTE.prioritaet.join(" > ")}. Nische: ${MAERKTE.nische}. ${MAERKTE.nicht} ${MAERKTE.offen}`,
    `ZIEL: ${MAERKTE.ziel}`,
    `REFERENZEN (belegt, nur diese nennen): ${REFERENZEN.map((r) => `${r.name} – ${r.was} (${r.art})`).join("; ")}.`,
    `VORHABEN: ${VORHABEN.join(" ")}`,
    `SPRACHEN: ${FIRMA.sprachen}. ENGPASS: ${FIRMA.engpass}. KAPAZITÄT: ${FIRMA.kapazitaet}.`,
    `WARMES NETZWERK: ${FIRMA.netzwerk}.`,
    `SYSTEM & KANÄLE (live): ${SYSTEM_KANAELE.join(" ")}`,
    `REGELN: ${GRUNDREGELN.join(" ")}`,
    `VERBOTEN: ${VERBOTE_TEXT}`,
  ].join("\n")
}

/** Dieselbe Kurzform auf Englisch — für Agenten, die englisch schreiben. */
export function firmenTextEn(): string {
  return `${FIRMA.name} (sole proprietorship of ${FIRMA.inhaber}, ICO InnovationsCentrum Osnabrück, Germany; brand since 2017): systems house for digital businesses — websites, accessibility (BFSG), systems, AI agents and automation. Own products: ${PRODUKTE.map((p) => p.name).join(", ")}. Markets: Germany > Switzerland > rest of Europe. Never claim certifications, partner status, employees or invented figures.`
}
