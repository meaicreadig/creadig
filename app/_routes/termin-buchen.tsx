import type { Metadata } from "next"

import { BuchungsAuswahl } from "@/app/(de)/termin/buchen/[token]/buchungs-auswahl"
import type { Locale } from "@/lib/dictionary"
import { contact } from "@/lib/site-data"
import { holeEinstellungen, pruefeBuchungslink, slotsFuerLink } from "@/lib/termine/store"
import { TERMIN_TEXTE } from "@/lib/termine/texte"

/**
 * Die Buchungsseite eines Terminlinks — für alle vier Sprachen. Die Sprache
 * der Seite ist die des Links (`booking_links.locale`), damit Seite, Fehler
 * und Mails derselben Buchung nie auseinanderlaufen. Ruft jemand den Link
 * unter dem „falschen" Sprachpräfix auf, gilt trotzdem die Sprache des Links.
 */
export const dynamic = "force-dynamic"

export function terminBuchenMetadata(locale: Locale): Metadata {
  return { title: TERMIN_TEXTE[locale].seiteTitel, robots: { index: false, follow: false } }
}

export async function TerminBuchenRoute({ params, locale }: { params: Promise<{ token: string }>; locale: Locale }) {
  const { token } = await params
  const pruefung = await pruefeBuchungslink(token)
  const sprache = pruefung.ok ? pruefung.link.locale : locale
  const T = TERMIN_TEXTE[sprache]

  if (!pruefung.ok) {
    return (
      <main dir={T.dir} lang={sprache} className="mx-auto flex min-h-[60dvh] max-w-xl flex-col justify-center gap-4 px-5 py-20">
        <h1 className="font-display text-3xl font-semibold text-balance">{T.seiteTitel}</h1>
        <p className="text-muted-foreground leading-relaxed">{T.linkGrund[pruefung.grund]}</p>
        <p className="leading-relaxed">
          {T.schreibenSie}{" "}
          <a className="text-gold-text underline underline-offset-4" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
          .
        </p>
      </main>
    )
  }

  const { link } = pruefung
  const [slots, einstellungen] = await Promise.all([slotsFuerLink(link), holeEinstellungen()])
  const art = T.art[link.meetingKind]
  const dauer = link.durationMin

  return (
    <main dir={T.dir} lang={sprache} className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-16 md:py-24">
      <header className="flex flex-col gap-3">
        <p className="text-gold-text font-mono text-xs tracking-[0.18em] uppercase">{T.eyebrow}</p>
        <h1 className="font-display text-3xl font-semibold text-balance md:text-4xl">{T.ueberschrift(art)}</h1>
        <p className="text-muted-foreground leading-relaxed text-pretty">{T.intro(dauer, einstellungen.timezone.replace("_", " "))}</p>
      </header>
      <BuchungsAuswahl token={link.token} slots={slots} timezone={einstellungen.timezone} dauer={dauer} locale={sprache} />
    </main>
  )
}
