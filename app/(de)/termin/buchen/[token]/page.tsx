import type { Metadata } from "next"

import { BuchungsAuswahl } from "@/app/(de)/termin/buchen/[token]/buchungs-auswahl"
import { GESPRAECHSARTEN, holeEinstellungen, pruefeBuchungslink, slotsFuerLink } from "@/lib/termine/store"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Termin wählen",
  robots: { index: false, follow: false },
}

const GRUND: Record<string, string> = {
  unbekannt: "Diesen Buchungslink kennen wir nicht.",
  abgelaufen: "Dieser Buchungslink ist abgelaufen.",
  benutzt: "Mit diesem Link wurde bereits ein Termin gebucht.",
  widerrufen: "Dieser Buchungslink wurde zurückgezogen.",
  speicher: "Die Terminbuchung ist gerade nicht erreichbar.",
}

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const pruefung = await pruefeBuchungslink(token)

  if (!pruefung.ok) {
    return (
      <main className="mx-auto flex min-h-[60dvh] max-w-xl flex-col justify-center gap-4 px-5 py-20">
        <h1 className="font-display text-3xl font-semibold text-balance">Termin wählen</h1>
        <p className="text-muted-foreground leading-relaxed">{GRUND[pruefung.grund]}</p>
        <p className="leading-relaxed">
          Schreiben Sie uns gern an{" "}
          <a className="text-gold-text underline underline-offset-4" href="mailto:kontakt@creadig.de">
            kontakt@creadig.de
          </a>
          .
        </p>
      </main>
    )
  }

  const { link } = pruefung
  const [slots, einstellungen] = await Promise.all([slotsFuerLink(link), holeEinstellungen()])
  const art = GESPRAECHSARTEN[link.meetingKind]

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-16 md:py-24">
      <header className="flex flex-col gap-3">
        <p className="text-gold-text font-mono text-xs tracking-[0.18em] uppercase">creaDIG · Termin</p>
        <h1 className="font-display text-3xl font-semibold text-balance md:text-4xl">{art.label} wählen</h1>
        <p className="text-muted-foreground leading-relaxed text-pretty">
          {art.dauer} Minuten. Alle Zeiten in deutscher Zeit ({einstellungen.timezone.replace("_", " ")}). Sie erhalten sofort eine Bestätigung
          mit Kalenderdatei.
        </p>
      </header>
      <BuchungsAuswahl token={link.token} slots={slots} timezone={einstellungen.timezone} dauer={art.dauer} />
    </main>
  )
}
