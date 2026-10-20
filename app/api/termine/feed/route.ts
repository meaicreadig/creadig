import { equal, sign } from "@/lib/hmac"
import { icsEreignis, icsKalender } from "@/lib/termine/mail"
import { GESPRAECHSARTEN, termineFuerFeed } from "@/lib/termine/store"
import { messeKey, naechsteTermine, type Messe } from "@/lib/messen"
import { messenFuerKalender } from "@/lib/messen-radar"

export const dynamic = "force-dynamic"

function icsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n")
}

/** Ganztägiges Ereignis; ohne bestätigtes Datum am 1. des üblichen Monats mit Hinweis. */
function messeEreignis(m: Messe): string {
  const t = naechsteTermine(new Date(), [m])[0]
  const von = t.bestaetigt && t.termin ? t.termin.von : `${t.jahr}-${String(t.monat).padStart(2, "0")}-01`
  const bisInkl = t.bestaetigt && t.termin ? t.termin.bis : von
  const ende = new Date(`${bisInkl}T00:00:00Z`)
  ende.setUTCDate(ende.getUTCDate() + 1)
  const d = (iso: string) => iso.replaceAll("-", "")
  return [
    "BEGIN:VEVENT",
    `UID:messe-${messeKey(m.name)}-${t.jahr}@creadig.de`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${d(von)}`,
    `DTEND;VALUE=DATE:${d(ende.toISOString().slice(0, 10))}`,
    `SUMMARY:${icsText(`Messe: ${m.name}${t.bestaetigt ? "" : " (Datum prüfen)"}`)}`,
    `LOCATION:${icsText(`${m.ort}, ${m.land}`)}`,
    `DESCRIPTION:${icsText(`${m.nutzen}\n${m.url}`)}`,
    `URL:${m.url}`,
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
  ].join("\r\n")
}

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
  const messen = await messenFuerKalender().catch(() => [])
  for (const m of messen) ereignisse.push(messeEreignis(m))

  return new Response(icsKalender(ereignisse), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  })
}
