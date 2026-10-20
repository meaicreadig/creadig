/** Reine Konstanten/Typen aus `bescheide.ts`, ohne `server-only` — fürs Formular im Client. */

export const BESCHEID_ARTEN = {
  vorauszahlung: "Festsetzung Vorauszahlungen",
  nachzahlung: "Nachzahlung",
  erstattung: "Erstattung",
  sonstig: "Sonstiger Bescheid (nur Ablage)",
} as const
export type BescheidArt = keyof typeof BESCHEID_ARTEN

export const STEUERARTEN = { est: "Einkommensteuer", ust: "Umsatzsteuer", gewerbe: "Gewerbesteuer", sonstig: "Sonstige" } as const
export type Steuerart = keyof typeof STEUERARTEN
