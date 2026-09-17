import { de } from "@/lib/admin-i18n/de"
import { tr } from "@/lib/admin-i18n/tr"
import type { AdminSprache } from "@/lib/admin-i18n/sprache"

export * from "@/lib/admin-i18n/sprache"

/**
 * Die Form der Texte — aus DE abgeleitet, Literale zu `string` geweitet.
 * Funktionen behalten ihre Signatur (für Texte mit Einsetzungen).
 */
type Weit<T> = T extends string
  ? string
  : T extends (...args: infer A) => string
    ? (...args: A) => string
    : { [K in keyof T]: Weit<T[K]> }

export type AdminTexte = Weit<typeof de>

const TEXTE: Record<AdminSprache, AdminTexte> = { de, tr }

export function adminTexte(sprache: AdminSprache): AdminTexte {
  return TEXTE[sprache]
}
