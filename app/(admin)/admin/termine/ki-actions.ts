"use server"

import { cookies } from "next/headers"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"
import { schreibeTerminmail, type MailEntwurf } from "@/lib/termine/ki-mail"

export async function terminmailEntwerfen(kontaktId: string, art: string, hinweis: string): Promise<MailEntwurf> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/termine")) {
    return { fehler: "Nicht berechtigt." }
  }
  return schreibeTerminmail({ kontaktId, art, hinweis, zweck: "einladung" })
}
