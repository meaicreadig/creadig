import { equal } from "@/lib/hmac"
import { kalenderIcs, kalenderSchluessel } from "@/lib/ausfuehrung/lieferung-hat"

export const dynamic = "force-dynamic"

/** Abonnierbarer Lieferplan (Apple/Google): alle Projektaufgaben mit Frist. Signierter Schlüssel wie beim Termine-Feed. */
export async function GET(request: Request) {
  const soll = await kalenderSchluessel()
  const key = new URL(request.url).searchParams.get("key") ?? ""
  if (!soll || !equal(key, soll)) return new Response("Not found", { status: 404 })
  return new Response(await kalenderIcs(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  })
}
