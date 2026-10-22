import "server-only"

import type { NextRequest } from "next/server"

/**
 * Darf diese Anfrage einen Cron-Takt auslösen?
 *
 * Nur mit `Authorization: Bearer <CRON_SECRET>` – so schickt Vercel Cron es mit.
 * Früher genügte ohne Secret ein User-Agent `vercel-cron/…`; den kann jeder
 * fälschen und damit KI-Läufe (Kosten) anstoßen. Fehlt das Secret, läuft kein
 * Takt – das ist laut und sichtbar (Sicherheits-Agent, Selbsttest), nicht still.
 */
export function cronErlaubt(request: NextRequest | Request): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    console.error("[cron] CRON_SECRET fehlt – Takt abgelehnt")
    return false
  }
  return request.headers.get("authorization") === `Bearer ${secret}`
}
