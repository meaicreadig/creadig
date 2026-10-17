import "server-only"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { finanzBasis } from "@/lib/finanz/basis"

/**
 * Zweite Tür hinter der Middleware: Jede Finanz-Seite prüft selbst, dass hier
 * der Inhaber sitzt. Fällt die Middleware je aus (Matcher-Fehler, Framework-
 * Lücke), bleiben die Zahlen trotzdem verschlossen.
 */
export async function finanzOwnerSeite(): Promise<void> {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: false })
  if (z.verdict !== "ok" || z.rolle !== "owner") redirect(`${await finanzBasis()}/login`)
}
