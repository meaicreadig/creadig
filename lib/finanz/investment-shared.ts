/** Reine Konstanten/Typen aus `investment.ts`, ohne `server-only` — fürs Formular im Client. */

export const KLASSEN = {
  tagesgeld: "Tagesgeld / Festgeld",
  etf: "ETF / Fonds",
  aktie: "Einzelaktien",
  krypto: "Krypto",
  immobilie: "Immobilie",
  beteiligung: "Beteiligung / Unternehmen",
  sonstig: "Sonstiges",
} as const
export type Klasse = keyof typeof KLASSEN
