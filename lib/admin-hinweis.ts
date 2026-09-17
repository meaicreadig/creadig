import { cookies } from "next/headers"

/**
 * ADM-03 — ein Hinweis aus einer Server Action an die Seite, OHNE Umleitung.
 *
 * Warum kein `redirect()` mit Suchparameter: Gemessen 17.09.2026 kam eine
 * Umleitung aus einer Server Action unter /admin/vertrieb oft nicht an. Die
 * Ursache war eine `loading.tsx` (entfernt, Gate check-admin-antwort §5). Der
 * Cookie-Weg bleibt, weil er ohne Umleitung auskommt und die Adresse nicht mit
 * Zustandsparametern belastet, die beim Neuladen stehen blieben.
 *
 * Stattdessen: Die Action setzt einen kurzlebigen Cookie (Art + Datensatz +
 * Zeitpunkt) und lässt die Seite neu rendern (`revalidatePath`). Die Seite
 * liest ihn und zeigt den Hinweis für genau diesen Datensatz, 30 Sekunden lang.
 * Kein personenbezogener Inhalt, nur Maschinenwerte.
 */
const NAME = "cd_admin_hinweis"
const GUELTIG_MS = 30_000

export type HinweisArt = "konflikt" | "nicht-gespeichert"

export async function setzeHinweis(art: HinweisArt, datensatz: string): Promise<void> {
  ;(await cookies()).set(NAME, `${art}|${datensatz}|${Date.now()}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: Math.ceil(GUELTIG_MS / 1000),
  })
}

export async function leseHinweis(datensatz: string): Promise<HinweisArt | null> {
  const wert = (await cookies()).get(NAME)?.value
  if (!wert) return null
  const [art, id, zeit] = wert.split("|")
  if (id !== datensatz || Date.now() - Number(zeit) > GUELTIG_MS) return null
  return art === "konflikt" || art === "nicht-gespeichert" ? art : null
}
