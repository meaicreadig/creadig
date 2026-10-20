/**
 * Organigramm der KI-Firma creaDIG: 5 Bereiche, 15 Abteilungen.
 * Grundlage: Porters Wertkette (Primär- + Unterstützungsaktivitäten) und das
 * übliche C-Level-Organigramm (CEO/CCO/CTO/COO/CFO).
 *
 * Einzige Quelle für Menü-Gruppierung und die spätere 3D-Insel:
 * Bereich = Stadtviertel, Abteilung = Gebäude, `knoten` = Flächen aus netz-karte,
 * `agenten` = KI-Mitarbeiter aus lib/assistent/truppe.ts.
 * Unbesetzte Abteilungen werden ehrlich als "nicht besetzt" gezeigt.
 */

export type BereichId = "leitung" | "markt" | "technik" | "betrieb" | "verwaltung"

export type Besetzung = "aktiv" | "teilweise" | "leer"

export type Abteilung = {
  id: string
  bereich: BereichId
  name: { de: string; tr: string }
  aufgabe: { de: string; tr: string }
  /** Flächen aus lib/zentrale/netz-karte.ts, die zu dieser Abteilung gehören. */
  knoten: string[]
  /** KI-Mitarbeiter (Agent-IDs der Truppe). */
  agenten: string[]
  besetzung: Besetzung
}

export const BEREICHE: { id: BereichId; name: { de: string; tr: string } }[] = [
  { id: "leitung", name: { de: "Geschäftsleitung", tr: "Genel Müdürlük" } },
  { id: "markt", name: { de: "Markt & Kunden", tr: "Ticari Bölüm" } },
  { id: "technik", name: { de: "Produkt & Technik", tr: "Ürün ve Teknoloji" } },
  { id: "betrieb", name: { de: "Betrieb", tr: "Operasyon" } },
  { id: "verwaltung", name: { de: "Finanzen & Verwaltung", tr: "Finans ve İdari İşler" } },
]

export const ABTEILUNGEN: Abteilung[] = [
  {
    id: "geschaeftsfuehrung",
    bereich: "leitung",
    name: { de: "Geschäftsführung", tr: "Yönetim" },
    aufgabe: { de: "Strategie, Beirat, Tagesbriefing", tr: "Strateji, yönetim kurulu, günlük brifing" },
    knoten: ["uebersicht", "assistent"],
    agenten: ["rat", "lage"],
    besetzung: "aktiv",
  },
  {
    id: "geschaeftsentwicklung",
    bereich: "leitung",
    name: { de: "Geschäftsentwicklung", tr: "İş Geliştirme" },
    aufgabe: { de: "Partner, Kapital, neue Märkte", tr: "Ortaklık, sermaye, yeni pazarlar" },
    knoten: [],
    agenten: ["kapital"],
    besetzung: "teilweise",
  },
  {
    id: "kommunikation",
    bereich: "leitung",
    name: { de: "Unternehmenskommunikation", tr: "Kurumsal İletişim" },
    aufgabe: { de: "Presse, Firmenseite, Marke", tr: "Basın, şirket sayfası, marka" },
    knoten: [],
    agenten: [],
    besetzung: "teilweise",
  },
  {
    id: "marketing",
    bereich: "markt",
    name: { de: "Marketing", tr: "Pazarlama" },
    aufgabe: { de: "Inhalte, SEO, Kampagnen, Messen, Analyse", tr: "İçerik, SEO, kampanya, fuar, analiz" },
    knoten: ["marketing", "mailstudio", "messen"],
    agenten: ["redaktion", "messen"],
    besetzung: "teilweise",
  },
  {
    id: "vertrieb",
    bereich: "markt",
    name: { de: "Vertrieb", tr: "Satış" },
    aufgabe: { de: "Kunden finden, Angebot, Nachfassen, Gespräch", tr: "Müşteri bulma, teklif, takip, görüşme" },
    knoten: ["verkaufen", "vertrieb", "gespraech", "termine", "kunden"],
    agenten: ["jaeger", "vertrieb", "motor"],
    besetzung: "aktiv",
  },
  {
    id: "kundenservice",
    bereich: "markt",
    name: { de: "Kundenservice", tr: "Müşteri Hizmetleri" },
    aufgabe: { de: "Anfragen, Support, Verlängerung", tr: "Talep, destek, yenileme" },
    knoten: [],
    agenten: [],
    besetzung: "leer",
  },
  {
    id: "produktmanagement",
    bereich: "technik",
    name: { de: "Produktmanagement", tr: "Ürün Yönetimi" },
    aufgabe: { de: "stammo, fibero, cassamea – Fahrplan und MRR", tr: "stammo, fibero, cassamea – yol haritası ve MRR" },
    knoten: [],
    agenten: [],
    besetzung: "leer",
  },
  {
    id: "entwicklung",
    bereich: "technik",
    name: { de: "Entwicklung", tr: "Yazılım Geliştirme" },
    aufgabe: { de: "Releases, Fehler, Deployments", tr: "Sürüm, hata, yayına alma" },
    knoten: [],
    agenten: [],
    besetzung: "leer",
  },
  {
    id: "it",
    bereich: "technik",
    name: { de: "IT & Sicherheit", tr: "Bilgi Teknolojileri ve Güvenlik" },
    aufgabe: { de: "Systemzustand, Verbindungen, Backups, Alarme", tr: "Sistem durumu, bağlantı, yedek, alarm" },
    knoten: ["system"],
    agenten: [],
    besetzung: "aktiv",
  },
  {
    id: "projekte",
    bereich: "betrieb",
    name: { de: "Projektmanagement", tr: "Proje Yönetimi" },
    aufgabe: { de: "Gewonnene Aufträge liefern", tr: "Kazanılan işi teslim etme" },
    knoten: [],
    agenten: [],
    besetzung: "leer",
  },
  {
    id: "einkauf",
    bereich: "betrieb",
    name: { de: "Einkauf", tr: "Satın Alma" },
    aufgabe: { de: "Lieferanten, Abos, KI-Kosten", tr: "Tedarikçi, abonelik, yapay zekâ maliyeti" },
    knoten: [],
    agenten: [],
    besetzung: "leer",
  },
  {
    id: "qualitaet",
    bereich: "betrieb",
    name: { de: "Qualitätsmanagement", tr: "Kalite Yönetimi" },
    aufgabe: { de: "Prüfungen, Kundenfreigaben, Nachweise", tr: "Kontrol, müşteri onayı, kanıt" },
    knoten: [],
    agenten: [],
    besetzung: "teilweise",
  },
  {
    id: "finanzen",
    bereich: "verwaltung",
    name: { de: "Finanzen", tr: "Finans" },
    aufgabe: { de: "Buchhaltung, Steuern, Liquidität", tr: "Muhasebe, vergi, nakit" },
    knoten: ["finanz"],
    agenten: ["finanz"],
    besetzung: "teilweise",
  },
  {
    id: "recht",
    bereich: "verwaltung",
    name: { de: "Recht & Compliance", tr: "Hukuk ve Uyum" },
    aufgabe: { de: "DSGVO, Verträge, Rechtstexte", tr: "KVKK/DSGVO, sözleşme, yasal metin" },
    knoten: [],
    agenten: [],
    besetzung: "leer",
  },
  {
    id: "personal",
    bereich: "verwaltung",
    name: { de: "Personal (KI-Team)", tr: "İnsan Kaynakları (Yapay Zekâ Ekibi)" },
    aufgabe: { de: "KI-Mitarbeiter: Aufgaben, Leistung, Kosten", tr: "Yapay zekâ çalışanları: görev, performans, maliyet" },
    knoten: [],
    agenten: [],
    besetzung: "teilweise",
  },
]

/** Welche Abteilung eine Fläche oder ein Agent gehört – für Warteschlange und Insel. */
export function abteilungVonAgent(agent: string | null | undefined): Abteilung | null {
  if (!agent) return null
  return ABTEILUNGEN.find((a) => a.agenten.includes(agent)) ?? null
}

export function abteilungVonKnoten(knoten: string): Abteilung | null {
  return ABTEILUNGEN.find((a) => a.knoten.includes(knoten)) ?? null
}
