import Image from "next/image"
import { after } from "next/server"

import { legeFreigabeAn } from "@/lib/assistent/store"
import { ladeInvestorKennzahlen, type InvestorKennzahlen } from "@/lib/investor/kennzahlen"
import { INVESTOR_SPRACHEN, istGueltig, ladeInvestorLink, zaehleAufruf, type InvestorSprache } from "@/lib/investor/store"
import { INVESTOR_TEXT, type InvestorText } from "@/lib/investor/text"

export const dynamic = "force-dynamic"

const ZAHL_LOCALE: Record<InvestorSprache, string> = { en: "en-GB", ar: "ar-u-nu-latn", de: "de-DE" }

function eur(cent: number, s: InvestorSprache) {
  return new Intl.NumberFormat(ZAHL_LOCALE[s], { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cent / 100)
}

function monat(schluessel: string, s: InvestorSprache) {
  return new Intl.DateTimeFormat(ZAHL_LOCALE[s], { month: "short" }).format(new Date(`${schluessel}-15T12:00:00Z`))
}

function kontaktMail() {
  return (process.env.LEAD_TO ?? "").split(",")[0]?.trim() || "mail@eminakyol.com"
}

function Ungueltig() {
  const t = INVESTOR_TEXT.en
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-3xl bg-card p-10 text-center">
        <Image src="/brand/creadig-logo.svg" alt="creaDIG Solutions" width={140} height={36} className="h-9 w-auto" />
        <h1 className="text-balance font-sans text-xl font-semibold text-foreground">{t.ungueltigTitel}</h1>
        <p className="text-pretty leading-relaxed text-muted-foreground">{t.ungueltigText}</p>
      </div>
    </main>
  )
}

function Kennzahl({ label, wert, leer }: { label: string; wert: string | null; leer: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-card p-6">
      <span className="text-sm leading-relaxed text-muted-foreground">{label}</span>
      {wert ? (
        <span className="font-sans text-3xl font-semibold tracking-tight text-primary tabular-nums">{wert}</span>
      ) : (
        <span className="font-sans text-lg font-medium text-muted-foreground">{leer}</span>
      )}
    </div>
  )
}

function Verlauf({ k, t, s }: { k: InvestorKennzahlen; t: InvestorText; s: InvestorSprache }) {
  if (!k.monate.length) return null
  const max = Math.max(...k.monate.map((m) => m.einCent), 1)
  return (
    <figure className="flex flex-col gap-4 rounded-3xl bg-card p-6">
      <figcaption className="text-sm text-muted-foreground">{t.verlauf}</figcaption>
      <div className="flex h-40 items-end gap-2" role="list">
        {k.monate.map((m) => (
          <div key={m.schluessel} role="listitem" className="flex flex-1 flex-col items-center gap-2">
            <div
              className="investor-balken w-full rounded-full bg-primary/85"
              style={{ height: `${Math.max(4, Math.round((m.einCent / max) * 128))}px` }}
              title={eur(m.einCent, s)}
            />
            <span className="font-mono text-[11px] text-muted-foreground">{monat(m.schluessel, s)}</span>
            <span className="sr-only">{eur(m.einCent, s)}</span>
          </div>
        ))}
      </div>
    </figure>
  )
}

export default async function InvestorRaum(props: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const { token } = await props.params
  const { lang } = await props.searchParams
  const link = await ladeInvestorLink(token).catch(() => null)
  if (!link || !istGueltig(link)) return <Ungueltig />

  const s: InvestorSprache = INVESTOR_SPRACHEN.includes(lang as InvestorSprache) ? (lang as InvestorSprache) : link.sprache
  const t = INVESTOR_TEXT[s]
  const k = await ladeInvestorKennzahlen()

  after(async () => {
    const { erster } = await zaehleAufruf(token).catch(() => ({ erster: false }))
    if (!erster) return
    /* Erster Aufruf = bester Moment zum Nachfassen: das landet als Aufgabe im Freigabe-Eingang. */
    await legeFreigabeAn({
      art: "aufgabe",
      titel: `${link.name}${link.firma ? ` (${link.firma})` : ""} hat den Investorenraum geöffnet`,
      inhalt: `Der persönliche Link wurde zum ersten Mal aufgerufen. Jetzt innerhalb von 24 Stunden persönlich nachfassen: kurze Nachricht, Gesprächstermin anbieten.\n\nSprache des Links: ${link.sprache.toUpperCase()}`,
      quelle: `investor:${token}:erstaufruf`,
      agent: "golf",
    }).catch(() => null)
  })

  const wachstum = k.wachstumProzent === null ? null : `${k.wachstumProzent > 0 ? "+" : ""}${k.wachstumProzent} %`
  const stand = new Intl.DateTimeFormat(ZAHL_LOCALE[s], { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${k.stand}T12:00:00Z`))
  const betreff = encodeURIComponent(s === "ar" ? "creaDIG · غرفة المستثمرين" : "creaDIG · Investor Room")

  return (
    <div lang={s} dir={t.dir} className={s === "ar" ? "[font-family:var(--font-arabic),var(--font-manrope),sans-serif]" : ""}>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 pt-8">
        <Image src="/brand/creadig-logo.svg" alt="creaDIG Solutions" width={150} height={38} className="h-9 w-auto" priority />
        <nav aria-label="Language" className="flex items-center gap-1 rounded-full bg-card p-1">
          {INVESTOR_SPRACHEN.map((l) => (
            <a
              key={l}
              href={`?lang=${l}`}
              aria-current={l === s ? "true" : undefined}
              className={
                l === s
                  ? "rounded-full bg-primary px-3 py-1 font-mono text-xs uppercase text-primary-foreground"
                  : "rounded-full px-3 py-1 font-mono text-xs uppercase text-muted-foreground hover:text-foreground"
              }
            >
              {l === "ar" ? "عربي" : l}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-16 pt-14 md:gap-28 md:pt-20">
        <section className="investor-auftritt flex flex-col gap-6">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">{t.vertraulich}</p>
          <h1 className="max-w-4xl text-balance font-sans text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
            {t.titel}
          </h1>
          <p className="max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground">{t.lead}</p>
          <p className="text-sm text-muted-foreground">
            {t.fuer} <span className="font-medium text-foreground">{link.name}{link.firma ? ` · ${link.firma}` : ""}</span>
          </p>
        </section>

        <section aria-labelledby="live" className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-2">
              <h2 id="live" className="flex items-center gap-3 font-sans text-2xl font-semibold text-foreground">
                <span className="investor-puls size-2.5 rounded-full bg-primary" aria-hidden="true" />
                {t.liveTitel}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{t.liveHinweis}</p>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {t.stand} {stand}
            </span>
          </div>
          {link.zahlen ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Kennzahl label={t.umsatz} wert={k.umsatz12Cent ? eur(k.umsatz12Cent, s) : null} leer={t.umsatzLeer} />
              <Kennzahl label={t.wachstum} wert={wachstum} leer={t.wachstumLeer} />
              <Kennzahl label={t.pipeline} wert={k.pipelineCent ? eur(k.pipelineCent, s) : null} leer={t.pipelineLeer} />
            </div>
          ) : (
            <p className="rounded-3xl bg-card p-6 leading-relaxed text-muted-foreground">{t.zahlenAus}</p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <Kennzahl label={t.agenten} wert={String(k.agenten)} leer="" />
            <Kennzahl label={t.abteilungen} wert={`${k.abteilungenBesetzt} ${t.von} ${k.abteilungenGesamt}`} leer="" />
          </div>
          {link.zahlen && <Verlauf k={k} t={t} s={s} />}
        </section>

        <section aria-labelledby="thesen" className="flex flex-col gap-6">
          <h2 id="thesen" className="font-sans text-2xl font-semibold text-foreground">{t.thesenTitel}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {t.thesen.map((th) => (
              <article key={th.titel} className="flex flex-col gap-3 rounded-3xl bg-card p-6">
                <h3 className="font-sans text-lg font-semibold text-foreground">{th.titel}</h3>
                <p className="text-pretty leading-relaxed text-muted-foreground">{th.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="maerkte" className="flex flex-col gap-6">
          <h2 id="maerkte" className="font-sans text-2xl font-semibold text-foreground">{t.maerkteTitel}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {t.maerkte.map((m) => (
              <article key={m.region} className="flex flex-col gap-3 rounded-3xl bg-card p-6">
                <span className="font-mono text-xs uppercase tracking-widest text-primary">{m.rolle}</span>
                <h3 className="font-sans text-xl font-semibold text-foreground">{m.region}</h3>
                <p className="text-pretty leading-relaxed text-muted-foreground">{m.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="portfolio" className="flex flex-col gap-6">
          <h2 id="portfolio" className="font-sans text-2xl font-semibold text-foreground">{t.portfolioTitel}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {t.portfolio.map((p) => (
              <article key={p.name} className="flex flex-col gap-3 rounded-3xl bg-card p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-sans text-xl font-semibold text-foreground">{p.name}</h3>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{p.art}</span>
                </div>
                <p className="text-pretty leading-relaxed text-muted-foreground">{p.text}</p>
                <span className="font-mono text-xs text-muted-foreground">{p.markt}</span>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="weg" className="flex flex-col gap-6">
          <h2 id="weg" className="font-sans text-2xl font-semibold text-foreground">{t.wegTitel}</h2>
          <ol className="grid gap-4 md:grid-cols-4">
            {t.weg.map((w) => (
              <li key={w.wann} className="flex flex-col gap-2 rounded-3xl bg-card p-6">
                <span className="font-mono text-sm font-medium text-primary">{w.wann}</span>
                <p className="text-pretty leading-relaxed text-foreground">{w.was}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="angebot" className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-3xl bg-card p-8">
            <h2 id="angebot" className="font-sans text-2xl font-semibold text-foreground">{t.angebotTitel}</h2>
            <p className="text-pretty text-lg leading-relaxed text-foreground">{t.angebot}</p>
            <ul className="flex flex-col gap-3">
              {t.angebotPunkte.map((p) => (
                <li key={p} className="flex items-start gap-3 leading-relaxed text-muted-foreground">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-3xl bg-card p-8">
            <div className="flex flex-col gap-3">
              <h2 className="font-sans text-2xl font-semibold text-foreground">{t.kontaktTitel}</h2>
              <p className="text-pretty leading-relaxed text-muted-foreground">{t.kontaktText}</p>
            </div>
            <a
              href={`mailto:${kontaktMail()}?subject=${betreff}`}
              className="self-start rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t.kontaktKnopf}
            </a>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-10">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t.fuss} · creaDIG Solutions · Muhammed Emin Akyol
        </p>
      </footer>
    </div>
  )
}
