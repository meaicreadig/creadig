import Link from "next/link"

import type { AdminTexte } from "@/lib/admin-i18n"
import { geschaeftsTag } from "@/lib/geschaeftszeit"
import type { Gesundheit, KundenkartenKopf } from "@/lib/kundenkarte"

type Schritt = { text: string; datum: string | null; href: string } | null

const PUNKT: Record<Gesundheit, string> = {
  gruen: "bg-muted-foreground",
  gelb: "bg-gold",
  rot: "bg-destructive",
  unbekannt: "bg-line-strong",
}

export function KundenKopf({
  kopf,
  schritt,
  ersteChanceHref,
  t,
  intl,
}: {
  kopf: KundenkartenKopf
  schritt: Schritt
  ersteChanceHref: string | null
  t: AdminTexte
  intl: string
}) {
  const k = t.kundenkarte
  const euro = new Intl.NumberFormat(intl, { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
  const datum = (iso: string) => new Intl.DateTimeFormat(intl, { day: "2-digit", month: "short", timeZone: "Europe/Berlin" }).format(new Date(iso))
  const ueberfaellig = schritt?.datum ? schritt.datum < geschaeftsTag() : false

  const geld: { label: string; wert: string | null }[] = [
    { label: k.eingenommen, wert: kopf.eingenommenCent === null ? null : euro.format(kopf.eingenommenCent / 100) },
    { label: k.offeneRechnungen, wert: kopf.offeneRechnungen === null ? null : String(kopf.offeneRechnungen) },
    { label: k.offeneAngebote, wert: kopf.offeneAngebote === null ? null : String(kopf.offeneAngebote) },
    { label: k.potenzial, wert: kopf.potenzialEuro === null ? null : euro.format(kopf.potenzialEuro) },
  ]

  const kontaktText =
    kopf.tageOhneKontakt === null
      ? null
      : kopf.tageOhneKontakt === 0
        ? k.heute
        : k.tageHer.replace("{n}", String(kopf.tageOhneKontakt))

  return (
    <section aria-label={k.naechsterSchritt} className="border-line mt-6 flex flex-col overflow-hidden rounded-lg border">
      <div className="bg-card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">{k.naechsterSchritt}</p>
          {schritt ? (
            <Link href={schritt.href} className="text-subhead mt-1 block text-lg leading-snug text-pretty underline-offset-4 hover:underline">
              {schritt.text}
            </Link>
          ) : (
            <p className="text-subhead mt-1 text-lg leading-snug">{k.keinSchritt}</p>
          )}
          {schritt?.datum && (
            <p className={`mt-1 text-sm ${ueberfaellig ? "text-destructive" : "text-muted-foreground"}`}>
              <time dateTime={schritt.datum}>{datum(schritt.datum)}</time>
              {ueberfaellig ? ` · ${k.ueberfaellig}` : ""}
            </p>
          )}
        </div>
        {!schritt && ersteChanceHref && (
          <Link href={ersteChanceHref} className="cta-quiet shrink-0 px-4 py-2 text-sm">
            {k.schrittAnlegen}
          </Link>
        )}
      </div>

      <dl className="border-line grid grid-cols-2 border-t md:grid-cols-5">
        {geld.map((g) => (
          <div key={g.label} className="border-line flex flex-col gap-1 border-r border-b p-4 md:border-b-0">
            <dt className="text-muted-foreground text-xs">{g.label}</dt>
            <dd className={`tabular-nums ${g.wert === null ? "text-muted-foreground text-sm" : "text-subhead text-xl"}`}>
              {g.wert ?? k.nichtGemessen}
            </dd>
          </div>
        ))}
        <div className="col-span-2 flex flex-col gap-1 p-4 md:col-span-1">
          <dt className="text-muted-foreground text-xs">{k.gesundheit}</dt>
          <dd className="text-subhead flex items-center gap-2 text-sm">
            <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${PUNKT[kopf.gesundheit]}`} />
            {k.gesundheitStufe[kopf.gesundheit]}
          </dd>
          {kontaktText && (
            <dd className="text-muted-foreground text-xs">
              {k.letzterKontakt}: {kontaktText}
            </dd>
          )}
        </div>
      </dl>
    </section>
  )
}
