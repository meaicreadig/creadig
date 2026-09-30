/**
 * Marketing-Kanal einer Anfrage — von Hand gesetzt im Admin.
 *
 * Getrennt von `source` (wie die Anfrage hereinkam: Formular, Telefon …)
 * und von `utm_*` (automatisch, nur wenn die Datenschutzerklärung es deckt,
 * siehe `lib/herkunft.ts`). Eine interne Einordnung durch den Betreiber,
 * kein vom Besucher erhobenes Datum.
 */
export const KANAELE = [
  "linkedin",
  "google",
  "instagram",
  "empfehlung",
  "verzeichnis",
  "bestandskunde",
  "direkt",
  "sonstiges",
] as const

export type Kanal = (typeof KANAELE)[number]

export function istKanal(wert: unknown): wert is Kanal {
  return typeof wert === "string" && (KANAELE as readonly string[]).includes(wert)
}

export const KANAL_NAME: Record<"de" | "tr", Record<Kanal, string>> = {
  de: {
    linkedin: "LinkedIn",
    google: "Google",
    instagram: "Instagram",
    empfehlung: "Empfehlung",
    verzeichnis: "Verzeichnis / Plattform",
    bestandskunde: "Bestandskunde",
    direkt: "Direkt / kennt uns",
    sonstiges: "Sonstiges",
  },
  tr: {
    linkedin: "LinkedIn",
    google: "Google",
    instagram: "Instagram",
    empfehlung: "Tavsiye",
    verzeichnis: "Rehber / platform",
    bestandskunde: "Mevcut müşteri",
    direkt: "Doğrudan / tanıyor",
    sonstiges: "Diğer",
  },
}

export function kanalName(wert: string, sprache: "de" | "tr"): string {
  return istKanal(wert) ? KANAL_NAME[sprache][wert] : wert
}
