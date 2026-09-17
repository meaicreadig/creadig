/**
 * ADM-01 · Admin-Sprache — DE und TR, und nur die Oberfläche.
 *
 * Die Admin-Sprache ist eine Eigenschaft des MENSCHEN, der den Admin bedient.
 * Sie ist NICHT die Kommunikationssprache eines Kunden (Kontakt, Angebot,
 * Mail) und NICHT die Geschäftszeitzone (`lib/geschaeftszeit.ts`). Wer den
 * Admin auf Türkisch stellt, schickt deshalb keinem Kunden etwas auf Türkisch.
 *
 * Gespeichert als Cookie `cd_admin_sprache` (kein Geheimnis, kein Profil): Er
 * gilt auf der Anmeldung schon, bevor es eine Sitzung gibt.
 */
export const ADMIN_SPRACHEN = ["de", "tr"] as const
export type AdminSprache = (typeof ADMIN_SPRACHEN)[number]

export const ADMIN_SPRACHE_COOKIE = "cd_admin_sprache"
export const ADMIN_SPRACHE_STANDARD: AdminSprache = "de"

export function istAdminSprache(wert: unknown): wert is AdminSprache {
  return typeof wert === "string" && (ADMIN_SPRACHEN as readonly string[]).includes(wert)
}

/** BCP-47 für `Intl` und `lang`. */
export const INTL_LOCALE: Record<AdminSprache, string> = { de: "de-DE", tr: "tr-TR" }
