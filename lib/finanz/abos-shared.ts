/**
 * Reine Konstanten/Typen/Funktionen aus `abos.ts`, ohne `server-only`.
 *
 * `abos.ts` liest aus der Datenbank und darf deshalb nur im Server laufen.
 * Formulare (Client-Komponenten) brauchen aber dieselben Label und denselben
 * Kundenschlüssel wie der Server — ohne eigene, zweite Quelle. Diese Datei
 * ist die gemeinsame, client-sichere Stelle dafür; `abos.ts` reicht sie nur
 * weiter.
 */

export const INTERVALLE = { monat: 1, quartal: 3, jahr: 12 } as const
export type Intervall = keyof typeof INTERVALLE
export const INTERVALL_LABEL: Record<Intervall, string> = { monat: "monatlich", quartal: "vierteljährlich", jahr: "jährlich" }

export function kundenSchluessel(k: { email: string; firma: string; name: string }): string {
  return (k.email.trim() || `${k.firma}|${k.name}`).toLowerCase().trim()
}
