/**
 * Firmengehirn — wer creaDIG ist, was wir anbieten, wie wir sprechen.
 *
 * Eine Quelle für Mensch und KI: Die Seite /admin/firma zeigt es, und jeder
 * KI-Entwurf (Mails, später Angebote und Posts) bekommt genau diesen Text als
 * Grundlage. Keine erfundenen Zahlen, Kunden oder Versprechen — die KI darf
 * nur nennen, was hier steht.
 */

export type FirmenAbschnitt = { titel: string; punkte: string[] }

export const FIRMA = {
  name: "creaDIG",
  rechtsform: "creaDIG solutions UG (haftungsbeschränkt)",
  inhaber: "Muhammed Emin Akyol",
  sitz: "Deutschland",
  sprachen: ["Deutsch", "Türkisch", "Englisch", "Arabisch"],
  satz: "Wir bauen Unternehmen ein digitales Haus — von der Marke bis zur künstlichen Intelligenz, Ebene für Ebene.",
  abschnitte: [
    {
      titel: "Mission",
      punkte: [
        "Mittelständische und inhabergeführte Betriebe bekommen Systeme, die sonst nur Konzerne haben — verständlich, bezahlbar, in ihrer Sprache.",
        "Wir verkaufen keine Einzelteile, sondern ein Haus, das mitwächst: Jede Ebene trägt die nächste.",
        "Ziel: Von Deutschland aus europäisch, dann international — als Partner, der Technik und Gestaltung aus einer Hand liefert.",
      ],
    },
    {
      titel: "Das Haus mit fünf Ebenen",
      punkte: [
        "01 Identität — Marke, Logo, Gestaltung, Druck: wie der Betrieb erkannt wird.",
        "02 Digital — Website, Shop, Auftritt: wo der Betrieb gefunden wird.",
        "03 Betrieb — Abläufe, Kundenverwaltung, Termine, Rechnungen: wie der Alltag läuft.",
        "04 Automation — was ohne Zutun passiert: Erinnerungen, Folgemails, Berichte.",
        "05 Intelligenz — KI, die Entscheidungen vorbereitet und Zeit zurückgibt.",
      ],
    },
    {
      titel: "Eigene Produkte",
      punkte: [
        "Stammo — digitale Stempelkarte in Apple und Google Wallet, holt Stammgäste zurück.",
        "Fibero — Software für Glasfaser-Montagebetriebe.",
        "meai und Cassamea — eigene Plattformen aus dem Haus creaDIG.",
      ],
    },
    {
      titel: "Für wen",
      punkte: [
        "Inhaber und Geschäftsführer kleiner und mittlerer Betriebe: Gastronomie, Handwerk, Dienstleistung, Handel, Vereine und Stiftungen.",
        "Besonders Betriebe mit mehrsprachiger Kundschaft (Deutsch, Türkisch, Arabisch).",
      ],
    },
    {
      titel: "Wie wir arbeiten",
      punkte: [
        "Erst zuhören, dann ein kurzes Gespräch (20–30 Minuten), dann ein klarer Vorschlag mit festem Umfang.",
        "Wir zeigen nur Kundenarbeiten, die schriftlich freigegeben sind.",
        "Ein Ansprechpartner: Muhammed Emin Akyol.",
      ],
    },
    {
      titel: "Tonfall",
      punkte: [
        "Persönlich, ruhig, respektvoll — Sie-Form, außer der Kontakt duzt.",
        "Kurz: keine Floskeln, kein Marketing-Deutsch, keine Übertreibungen.",
        "Nutzen für den Betrieb zuerst, Technik nur so weit, wie sie verstanden wird.",
        "Immer ein klarer nächster Schritt.",
      ],
    },
  ] satisfies FirmenAbschnitt[],
}

/** Der Kontext, den jede KI-Anfrage bekommt. */
export function firmengehirnText(): string {
  return [
    `Firma: ${FIRMA.rechtsform} (${FIRMA.name}), Inhaber ${FIRMA.inhaber}, ${FIRMA.sitz}.`,
    `Sprachen: ${FIRMA.sprachen.join(", ")}.`,
    `Kernsatz: ${FIRMA.satz}`,
    ...FIRMA.abschnitte.map((a) => `${a.titel}:\n${a.punkte.map((p) => `- ${p}`).join("\n")}`),
  ].join("\n\n")
}
