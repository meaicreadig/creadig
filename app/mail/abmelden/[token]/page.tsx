import type { Metadata } from "next"
import { revalidatePath } from "next/cache"

import { abmeldenPerToken, empfaengerPerToken } from "@/lib/mailing/store"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Abmelden · creaDIG", robots: { index: false, follow: false } }

/* Abmelden erst per Knopf: Link-Scanner in Firmen-Postfächern rufen GETs auf und
   würden sonst Leute abmelden, die nie geklickt haben. Ein-Klick über den
   List-Unsubscribe-Header läuft separat über POST /api/mail/abmelden/[token]. */
export default async function Abmelden({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const e = await empfaengerPerToken(token).catch(() => null)

  async function bestaetigen() {
    "use server"
    await abmeldenPerToken(token)
    revalidatePath(`/mail/abmelden/${token}`)
  }

  const abgemeldet = e?.status === "abgemeldet"

  return (
    <main className="bg-background text-foreground flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="border-line bg-surface flex w-full max-w-md flex-col gap-5 rounded-lg border p-8">
        <p className="font-display text-lg font-extrabold">
          crea<span className="text-gold-text">DIG</span>
        </p>
        {!e ? (
          <>
            <h1 className="font-display text-2xl font-bold text-balance">Link nicht gültig</h1>
            <p className="text-muted-foreground leading-relaxed">
              Dieser Abmeldelink ist unbekannt. Schreiben Sie uns einfach kurz an, wir tragen Sie sofort aus.
            </p>
          </>
        ) : abgemeldet ? (
          <>
            <h1 className="font-display text-2xl font-bold text-balance">Sie sind abgemeldet</h1>
            <p className="text-muted-foreground leading-relaxed">
              {e.email} erhält keine weiteren Nachrichten dieser Art von creaDIG.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-balance">Abmelden?</h1>
            <p className="text-muted-foreground leading-relaxed">
              {e.email} erhält dann keine Kampagnen-Mails mehr von creaDIG. Persönliche Antworten auf Ihre Anfragen sind davon nicht betroffen.
            </p>
            <form action={bestaetigen}>
              <button className="bg-primary text-primary-foreground rounded-md px-5 py-2.5 text-sm font-semibold">Jetzt abmelden</button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
