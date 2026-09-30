import { neonAbfrage } from "@/lib/neon-abfrage"

export type SichtbarkeitGruppe = "google" | "verzeichnis" | "agentur" | "vertrauen"
export type Eintrag = { key: string; name: string; gruppe: SichtbarkeitGruppe; url: string }

/** Einmal eintragen, dann gefunden werden — DACH-B2B, in sinnvoller Reihenfolge. */
export const KATALOG: Eintrag[] = [
  { key: "google-business", name: "Google Unternehmensprofil", gruppe: "google", url: "https://business.google.com" },
  { key: "bing-places", name: "Bing Places", gruppe: "google", url: "https://www.bingplaces.com" },
  { key: "apple-business", name: "Apple Business Connect", gruppe: "google", url: "https://businessconnect.apple.com" },
  { key: "linkedin-page", name: "LinkedIn Unternehmensseite", gruppe: "verzeichnis", url: "https://www.linkedin.com/company/setup/new/" },
  { key: "wlw", name: "wer liefert was", gruppe: "verzeichnis", url: "https://www.wlw.de" },
  { key: "gelbe-seiten", name: "Gelbe Seiten", gruppe: "verzeichnis", url: "https://www.gelbeseiten.de" },
  { key: "das-oertliche", name: "Das Örtliche", gruppe: "verzeichnis", url: "https://www.dasoertliche.de" },
  { key: "11880", name: "11880", gruppe: "verzeichnis", url: "https://www.11880.com" },
  { key: "xing", name: "XING Unternehmensprofil", gruppe: "verzeichnis", url: "https://www.xing.com" },
  { key: "clutch", name: "Clutch", gruppe: "agentur", url: "https://clutch.co" },
  { key: "sortlist", name: "Sortlist", gruppe: "agentur", url: "https://www.sortlist.de" },
  { key: "designrush", name: "DesignRush", gruppe: "agentur", url: "https://www.designrush.com" },
  { key: "goodfirms", name: "GoodFirms", gruppe: "agentur", url: "https://www.goodfirms.co" },
  { key: "provenexpert", name: "ProvenExpert", gruppe: "vertrauen", url: "https://www.provenexpert.com" },
  { key: "ihk", name: "IHK Osnabrück – Emsland", gruppe: "vertrauen", url: "https://www.ihk.de/osnabrueck" },
]

/** `null` = Tabelle fehlt oder Abfrage scheiterte („nicht gemessen“). */
export async function ladeSichtbarkeit(): Promise<Set<string> | null> {
  const q = neonAbfrage()
  if (!q) return null
  try {
    const rows = await q(`SELECT key FROM visibility_listings WHERE eingetragen = true`, [])
    return new Set(rows.map((r) => String(r.key)))
  } catch {
    return null
  }
}
