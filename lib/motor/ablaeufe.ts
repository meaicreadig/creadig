/**
 * Ablaeufe (Playbooks): was nach einem Ereignis von selbst passiert.
 *
 * Jeder Schritt erzeugt einen Vorschlag im Freigabe-Eingang — der Motor
 * sendet nie selbst. Die Stufe "Autopilot" pro Ablauf kommt spaeter.
 * `nachStunden` zaehlt ab dem vorherigen Schritt (beim ersten: ab Ausloeser).
 */

export type EreignisTyp =
  | "gespraech_notiert"
  | "anfrage_eingegangen"
  | "terminlink_erstellt"
  | "termin_gebucht"
  | "termin_abgesagt"
  | "termin_vorbei"
  | "mail_geoeffnet"
  | "mail_geklickt"
  | "antwort_erhalten"
  | "auftrag_erteilt"
  | "kontakt_gesperrt"
  /** Website-Artikel, LinkedIn, Instagram oder von Hand erfasst — siehe lib/inhalte.ts. */
  | "inhalt_veroeffentlicht"

export type Schritt = {
  nachStunden: number
  art: string
  titel: { de: string; tr: string }
}

export type Ablauf = {
  id: string
  name: { de: string; tr: string }
  ausloeser: EreignisTyp
  bedingung?: (daten: Record<string, unknown>) => boolean
  stopptBei: EreignisTyp[]
  schritte: Schritt[]
}

export const ABLAEUFE: Ablauf[] = [
  {
    id: "nach-gespraech",
    name: { de: "Nach dem Gespräch", tr: "Görüşmeden sonra" },
    ausloeser: "gespraech_notiert",
    bedingung: (d) => typeof d.folge === "string" && d.folge.trim().length > 0,
    stopptBei: ["termin_gebucht", "antwort_erhalten", "auftrag_erteilt", "kontakt_gesperrt"],
    schritte: [
      { nachStunden: 0, art: "dankesmail", titel: { de: "Dankesmail mit Terminlink", tr: "Terim linkli teşekkür maili" } },
      { nachStunden: 72, art: "erinnerung", titel: { de: "Kurze Erinnerung", tr: "Kısa hatırlatma" } },
      { nachStunden: 96, art: "beispiel", titel: { de: "Passendes Kundenbeispiel", tr: "Uygun müşteri örneği" } },
      { nachStunden: 168, art: "abschluss", titel: { de: "Freundlicher Abschluss", tr: "Nazik kapanış" } },
    ],
  },
  {
    id: "neue-anfrage",
    name: { de: "Neue Anfrage", tr: "Yeni talep" },
    ausloeser: "anfrage_eingegangen",
    stopptBei: ["gespraech_notiert", "termin_gebucht", "antwort_erhalten", "kontakt_gesperrt"],
    schritte: [
      { nachStunden: 0, art: "erstantwort", titel: { de: "Erstantwort mit Terminlink", tr: "Terim linkli ilk cevap" } },
      { nachStunden: 48, art: "erinnerung", titel: { de: "Nachfassen zur Anfrage", tr: "Talep için takip" } },
    ],
  },
  {
    id: "nach-termin",
    name: { de: "Nach dem Termin", tr: "Randevudan sonra" },
    ausloeser: "termin_vorbei",
    stopptBei: ["auftrag_erteilt", "kontakt_gesperrt"],
    schritte: [
      { nachStunden: 2, art: "zusammenfassung", titel: { de: "Zusammenfassung an den Kunden", tr: "Müşteriye özet" } },
      { nachStunden: 48, art: "angebot", titel: { de: "Angebot vorbereiten", tr: "Teklif hazırla" } },
    ],
  },
]

export function findeAblauf(id: string): Ablauf | undefined {
  return ABLAEUFE.find((a) => a.id === id)
}
