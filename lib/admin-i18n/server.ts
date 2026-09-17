import { cookies, headers } from "next/headers"

import { adminTexte, type AdminTexte } from "@/lib/admin-i18n"
import {
  ADMIN_SPRACHE_COOKIE,
  ADMIN_SPRACHE_STANDARD,
  INTL_LOCALE,
  istAdminSprache,
  type AdminSprache,
} from "@/lib/admin-i18n/sprache"

/**
 * Die Sprache dieser Anfrage: gewählt (Cookie) → sonst Browser (nur `tr`
 * wird erkannt, alles andere bleibt Deutsch) → sonst Deutsch.
 */
export async function adminSprache(): Promise<AdminSprache> {
  const gewaehlt = (await cookies()).get(ADMIN_SPRACHE_COOKIE)?.value
  if (istAdminSprache(gewaehlt)) return gewaehlt
  const browser = (await headers()).get("accept-language") ?? ""
  if (/^\s*tr\b/i.test(browser)) return "tr"
  return ADMIN_SPRACHE_STANDARD
}

export async function adminSprachKontext(): Promise<{ sprache: AdminSprache; t: AdminTexte; intl: string }> {
  const sprache = await adminSprache()
  return { sprache, t: adminTexte(sprache), intl: INTL_LOCALE[sprache] }
}
