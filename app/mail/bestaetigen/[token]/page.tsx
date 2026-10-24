import type { Metadata } from "next"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

import { bucketKey, bucketKeyIsPseudonymous } from "@/lib/lead-guard"
import { anmeldungPerToken, bestaetige } from "@/lib/mailing/anmeldung"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Anmeldung bestätigen · creaDIG", robots: { index: false, follow: false } }

/* Bestätigen per Knopf, nicht per Aufruf: Link-Scanner in Firmenpostfächern öffnen jeden Link. */
export default async function Bestaetigen({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const a = await anmeldungPerToken(token).catch(() => null)

  async function jetzt() {
    "use server"
    const h = await headers()
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unbekannt"
    await bestaetige(token, bucketKeyIsPseudonymous() ? await bucketKey("doi", ip) : null)
    revalidatePath(`/mail/bestaetigen/${token}`)
  }

  return (
    <main className="bg-background text-foreground flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="border-line bg-surface flex w-full max-w-md flex-col gap-5 rounded-lg border p-8">
        <p className="font-display text-lg font-extrabold">
          crea<span className="text-gold-text">DIG</span>
        </p>
        {!a ? (
          <>
            <h1 className="font-display text-2xl font-bold text-balance">Link nicht gültig</h1>
            <p className="text-muted-foreground leading-relaxed">Dieser Link ist unbekannt oder abgelaufen (30 Tage). Melden Sie sich einfach erneut an.</p>
          </>
        ) : a.bestaetigt ? (
          <>
            <h1 className="font-display text-2xl font-bold text-balance">Danke – Sie sind angemeldet</h1>
            <p className="text-muted-foreground leading-relaxed">
              {a.email} erhält neue Beiträge von creaDIG, höchstens zweimal im Monat. Abmelden geht jederzeit über den Link in jeder Mail.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-balance">Anmeldung bestätigen</h1>
            <p className="text-muted-foreground leading-relaxed">{a.email} soll neue Beiträge von creaDIG per E-Mail erhalten.</p>
            <form action={jetzt}>
              <button type="submit" className="bg-primary text-primary-foreground rounded-md px-5 py-3 font-semibold">
                Ja, bestätigen
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
