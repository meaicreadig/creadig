/**
 * Produkte, die eine Verkaufsmail sichtbar vorstellt: echtes Bild der Webseite,
 * ein Satz Nutzen, drei Punkte und der Weg zur Seite. Ohne `server-only`,
 * weil dieselbe Mailvorlage auch die Studio-Vorschau im Browser rendert.
 */

export const PRODUKT_IDS = ["fibero", "stammo", "creadig"] as const
export type ProduktId = (typeof PRODUKT_IDS)[number]

export type MailProdukt = {
  id: ProduktId
  name: string
  kennung: string
  nutzen: string
  punkte: string[]
  url: string
  bild: string
  bildAlt: string
}

export const MAIL_PRODUKTE: Record<ProduktId, MailProdukt> = {
  fibero: {
    id: "fibero",
    name: "fibero",
    kennung: "Software für Glasfaser-Montage",
    nutzen: "Aufmaß, Fotos, Hausanschlüsse und Abrechnung an einem Ort – statt Excel, Zettel und WhatsApp.",
    punkte: ["Objekte und Teams im Blick", "Fotodokumentation direkt von der Baustelle", "Abrechnung auf Knopfdruck"],
    url: "https://fibero.app",
    bild: "/brand/mail/produkte/fibero.jpg",
    bildAlt: "Startseite von fibero",
  },
  stammo: {
    id: "stammo",
    name: "stammo",
    kennung: "Digitale Stempelkarte im Wallet",
    nutzen: "Die Stempelkarte liegt im Apple- und Google-Wallet Ihrer Gäste und holt Stammgäste aktiv zurück.",
    punkte: ["Kein App-Download für Gäste", "Erinnerung direkt auf dem Sperrbildschirm", "Sie sehen, wer wiederkommt"],
    url: "https://stammo.app",
    bild: "/brand/mail/produkte/stammo.jpg",
    bildAlt: "Startseite von stammo",
  },
  creadig: {
    id: "creadig",
    name: "creaDIG",
    kennung: "System-Haus für digitale Betriebe",
    nutzen: "Moderne Webseite plus System – Anmeldung, Mitglieder, Termine – aus einer Hand.",
    punkte: ["Webseite, die Anfragen bringt", "Abläufe automatisch statt per Hand", "Ein Ansprechpartner für alles"],
    url: "https://creadig.de",
    bild: "/brand/mail/produkte/creadig.jpg",
    bildAlt: "Startseite von creaDIG",
  },
}

export function istProduktId(wert: unknown): wert is ProduktId {
  return typeof wert === "string" && (PRODUKT_IDS as readonly string[]).includes(wert)
}

/** Erkennt das Produkt aus einem Freigabe-Titel wie „Neukunde fibero: …“ – für ältere Einträge ohne gespeichertes Produkt. */
export function produktAusTitel(titel: string): ProduktId | null {
  const t = titel.toLowerCase()
  if (!t.startsWith("neukunde")) return null
  if (t.includes("fibero")) return "fibero"
  if (t.includes("stammo")) return "stammo"
  if (t.includes("creadig")) return "creadig"
  return null
}
