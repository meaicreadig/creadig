import { equal, sign } from "@/lib/hmac"
import { icsEreignis, icsKalender } from "@/lib/termine/mail"
import { GESPRAECHSARTEN, termineFuerFeed } from "@/lib/termine/store"

export const dynamic = "force-dynamic"

/** Abonnierbarer Kalender (Apple/Google) — geschützt über einen signierten Schlüssel. */
export async function GET(request: Request) {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim()
  const key = new URL(request.url).searchParams.get("key") ?? ""
  if (!secret || !equal(key, await sign("termine-feed", secret))) return new Response("Not found", { status: 404 })

  const termine = await termineFuerFeed()
  const ereignisse = termine.map((t) => {
    const art = GESPRAECHSARTEN[t.meetingKind as keyof typeof GESPRAECHSARTEN]?.label ?? "Gespräch"
    return icsEreignis(t, {
      titel: `${art}: ${t.guestName}`,
      beschreibung: [t.guestEmail, t.guestNote, t.topic, `Referenz ${t.reference}`].filter(Boolean).join("\n"),
    })
  })
  return new Response(icsKalender(ereignisse), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  })
}
