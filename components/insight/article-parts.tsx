"use client"

import { useEffect, useState } from "react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { BELEG_ARTEN } from "@/lib/redaktion"
import type { Insight, Kennzahl } from "@/lib/insights"

/*
 * ===========================================================================
 * DIE BAUSTEINE EINER NOTIZ
 * ===========================================================================
 *
 * Der Owner hat die Artikelseite zurueckgewiesen: „zu schlicht, zu
 * verwirrend, zu anstrengend — wie eingefuegter Berichtstext."
 *
 * Gemessen stimmte das genau. Der Text lief als `max-w-2xl` (672 px) am
 * linken Rand einer 1440-px-Seite herunter, Ueberschrift, Absatz,
 * Ueberschrift, Absatz — und rechts daneben 55 Prozent Leere. Alles, was den
 * Beitrag lesbar gemacht haette, lag ungenutzt in den Daten:
 *
 *   · drei `belege` mit Art, Fundstelle und Aussage — nie gerendert
 *   · `nachfrage` mit der Frage des Lesers und dem Ziel — nie gerendert
 *   · acht Ueberschriften, aus denen sich ein Inhaltsverzeichnis ergibt
 *   · vier Zahlen, die mitten im Fliesstext standen
 *
 * Die Bausteine hier holen genau das nach oben. Keiner von ihnen erfindet
 * etwas: Jede Zahl steht woertlich im Text desselben Beitrags, jeder Beleg
 * kommt aus `entry.belege`, jedes Ziel aus `entry.nachfrage`. Ein Beitrag
 * ohne diese Felder rendert die Bausteine schlicht nicht.
 */

/* ── Der Befund in Zahlen ─────────────────────────────────────────────── */

/**
 * Vier Zahlen, und eine davon als Balken.
 *
 * „sieben von acht" ist eine Aussage; „sieben" allein ist eine Ziffer. Wo
 * `von` gesetzt ist, entsteht deshalb ein Verhaeltnis, das man sieht, statt
 * es zu rechnen. Der Balken ist kein Diagramm um seiner selbst willen — er
 * ist die einzige Stelle, an der aus zwei Zahlen ein Bild wird.
 */
export function ArticleMetrics({ kennzahlen }: { kennzahlen: Kennzahl[] }) {
  const { t, locale } = useLocale()
  return (
    <section aria-label={t.insightsPage.findingsLabel} className="border-line border-y">
      <p className="eyebrow text-gold-text pt-7">{t.insightsPage.findingsLabel}</p>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-8 py-7 md:grid-cols-4">
        {kennzahlen.map((k) => (
          <div key={k.label.de} className="flex flex-col gap-2">
            <dt className="sr-only">{k.label[locale]}</dt>
            <dd className="flex flex-col gap-2">
              <span
                className={`text-display text-4xl leading-none tabular-nums md:text-5xl ${
                  k.betont ? "text-gold-text" : "text-foreground"
                }`}
              >
                {k.wert}
                {k.von !== undefined && (
                  <span className="text-muted-foreground text-lg md:text-xl"> / {k.von}</span>
                )}
              </span>
              {/*
                Der Balken traegt `aria-hidden`: Das Verhaeltnis steht als
                Text daneben, und eine zweite Ansage derselben Zahl macht
                den Screenreader geschwaetzig, nicht genauer.
              */}
              {k.von !== undefined && k.von > 0 && (
                <span aria-hidden="true" className="bg-line-strong h-1 w-full max-w-[7rem]">
                  <span
                    className={`block h-full ${k.betont ? "bg-gold" : "bg-foreground/55"}`}
                    style={{ width: `${Math.round((k.wert / k.von) * 100)}%` }}
                  />
                </span>
              )}
              <span className="type-small text-muted-foreground text-pretty">
                {k.label[locale]}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* ── In diesem Artikel ────────────────────────────────────────────────── */

export type Abschnitt = { id: string; text: string }

/**
 * Das Inhaltsverzeichnis — aus den ECHTEN Ueberschriften des Beitrags.
 *
 * Es wird nicht gepflegt, es wird abgeleitet: Kommt ein Abschnitt dazu, steht
 * er hier, ohne dass jemand daran denkt. Eine von Hand gefuehrte Liste waere
 * beim dritten Text falsch.
 *
 * Ohne Javascript bleibt die Liste eine Liste aus Ankern und funktioniert
 * trotzdem — die Markierung des aktiven Abschnitts ist die Zugabe, nicht die
 * Funktion.
 */
export function ArticleNav({ abschnitte }: { abschnitte: Abschnitt[] }) {
  const { t } = useLocale()
  const [aktiv, setAktiv] = useState<string | null>(null)

  /*
   * WARUM HIER KEIN IntersectionObserver STEHT — ein gemessener Umweg.
   *
   * Zuerst hielt ein `IntersectionObserver` die acht Ueberschriften fest.
   * Gemessen: Er feuerte genau EINMAL, beim Registrieren, und danach nie
   * wieder — die Markierung blieb leer, egal wie weit man scrollte.
   *
   * Die Ursache liegt in `Reveal`: Die Komponente rendert `motion.div`,
   * solange `usePrefersReducedMotion()` noch `false` liefert, und schaltet
   * nach dem ersten Effekt auf ein schlichtes `<div>` um. Das ist ein
   * anderer Elementtyp — React haengt den ganzen Teilbaum ab und baut ihn
   * neu auf. Die <h2>-Knoten, die der Observer festhielt, existierten danach
   * nicht mehr; er beobachtete Leichen.
   *
   * Deshalb fragt der Lauf die Ueberschriften bei JEDEM Durchgang neu ab,
   * statt sie festzuhalten. Das kostet acht `getElementById` pro Bild —
   * gedrosselt auf einen Frame, also nichts, was messbar waere — und ist
   * gegen jeden Neuaufbau des Teilbaums immun.
   */
  useEffect(() => {
    if (abschnitte.length === 0) return
    let angefordert = 0

    const pruefen = () => {
      angefordert = 0
      /* Die Ueberschrift, die zuletzt oberhalb der Lesekante begonnen hat.
         Die Kante liegt unter der festen Leiste, sonst wechselt die Markierung
         schon, waehrend die Ueberschrift noch verdeckt ist. */
      const kante = 140
      let treffer: string | null = null
      for (const a of abschnitte) {
        const el = document.getElementById(a.id)
        if (el && el.getBoundingClientRect().top <= kante) treffer = a.id
      }
      /* Vor der ersten Ueberschrift ist der erste Abschnitt gemeint, nicht
         „keiner" — ein leeres Verzeichnis am Seitenanfang sieht kaputt aus. */
      setAktiv(treffer ?? abschnitte[0]?.id ?? null)
    }

    const beiBewegung = () => {
      if (angefordert) return
      angefordert = requestAnimationFrame(pruefen)
    }

    pruefen()
    window.addEventListener("scroll", beiBewegung, { passive: true })
    window.addEventListener("resize", beiBewegung)
    return () => {
      if (angefordert) cancelAnimationFrame(angefordert)
      window.removeEventListener("scroll", beiBewegung)
      window.removeEventListener("resize", beiBewegung)
    }
  }, [abschnitte])

  if (abschnitte.length < 3) return null

  return (
    <nav aria-label={t.insightsPage.inThisArticle} className="lg:sticky lg:top-28">
      <p className="eyebrow text-muted-foreground">{t.insightsPage.inThisArticle}</p>
      <ol className="border-line mt-5 flex flex-col border-s">
        {abschnitte.map((a) => {
          const ist = aktiv === a.id
          return (
            <li key={a.id}>
              <a
                href={`#${a.id}`}
                aria-current={ist ? "true" : undefined}
                className={`-ms-px block border-s py-2.5 ps-4 text-sm transition-colors duration-[var(--dur-2)] ${
                  ist
                    ? "border-gold text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {a.text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * Dasselbe auf dem Telefon: zusammengeklappt, damit es nicht den halben
 * Bildschirm vor dem ersten Satz kostet. `<details>` statt Javascript — ein
 * Aufklapper, den der Browser selbst bedient, funktioniert auch mit
 * Tastatur und Screenreader, ohne dass wir ihn nachbauen.
 */
export function ArticleNavMobile({ abschnitte }: { abschnitte: Abschnitt[] }) {
  const { t } = useLocale()
  if (abschnitte.length < 3) return null
  return (
    <details className="border-line group border-y lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
        <span className="eyebrow text-gold-text">{t.insightsPage.inThisArticle}</span>
        <span
          aria-hidden="true"
          className="text-muted-foreground text-lg transition-transform duration-[var(--dur-2)] group-open:rotate-45 motion-reduce:transition-none"
        >
          +
        </span>
      </summary>
      <ol className="flex flex-col pb-4">
        {abschnitte.map((a) => (
          <li key={a.id}>
            <a
              href={`#${a.id}`}
              className="text-muted-foreground hover:text-foreground block py-2.5 text-sm transition-colors duration-[var(--dur-2)]"
            >
              {a.text}
            </a>
          </li>
        ))}
      </ol>
    </details>
  )
}

/* ── Worauf das steht ─────────────────────────────────────────────────── */

/**
 * Die Belege — mit Art, Fundstelle und dem, was dort steht.
 *
 * Sie lagen bisher nur in den Daten und im Redaktions-Gate. Auf der Seite
 * stand stattdessen eine handgeschriebene Linkliste. Wer ueber acht eigene
 * Maengel liest, will wissen, WO das nachzulesen ist — genau dafuer ist das
 * Feld gebaut, und ein Beitrag ohne Belege kommt ohnehin nicht bis
 * `veroeffentlicht`.
 */
export function ArticleEvidence({ belege }: { belege: Insight["belege"] }) {
  const { t } = useLocale()
  if (belege.length === 0) return null
  return (
    <section aria-labelledby="belege" className="border-line border-t pt-8">
      <p id="belege" className="eyebrow text-gold-text">
        {t.insightsPage.evidenceLabel}
      </p>
      <ul className="mt-7 grid gap-px sm:grid-cols-3">
        {belege.map((b) => (
          <li key={b.fundstelle} className="bg-muted flex flex-col gap-3 p-6">
            <span className="text-meta text-muted-foreground">{BELEG_ARTEN[b.art].label}</span>
            <span className="type-small text-foreground/85 text-pretty">{b.traegt}</span>
            {/* Die Fundstelle ist ein Pfad oder eine Norm — sie laeuft immer
                von links nach rechts, auch mitten im arabischen Satz. */}
            <bdi dir="ltr" className="text-meta text-gold-text mt-auto break-all">
              {b.fundstelle}
            </bdi>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ── Die Frage danach ─────────────────────────────────────────────────── */

/**
 * Der Schluss.
 *
 * `nachfrage.weilLeserFragt` ist der Satz, den der Leser nach dem letzten
 * Absatz denkt — er steht seit Gate 15 in den Daten und wurde nie gezeigt.
 * Statt eines Verkaufsbanners nach jedem Text steht hier die Frage selbst,
 * und darunter der Ort, an dem sie beantwortet wird.
 */
export function ArticleEnding({ nachfrage }: { nachfrage: NonNullable<Insight["nachfrage"]> }) {
  const { t, locale } = useLocale()
  return (
    <section className="border-gold/45 mt-16 border-t pt-8">
      <p className="eyebrow text-gold-text">{t.insightsPage.readerAsks}</p>
      <p className="type-h4 mt-5 max-w-2xl text-balance">
        {"\u201E"}
        {nachfrage.weilLeserFragt[locale]}
        {"\u201C"}
      </p>
      <Link
        href={nachfrage.fuehrtZu}
        className="text-subhead hover:text-gold-text group mt-6 inline-flex items-baseline gap-3 text-lg transition-colors duration-[var(--dur-2)]"
      >
        {t.insightsPage.sourceService}
        <ArrowUpRight
          className="size-4 shrink-0 transition-transform duration-[var(--dur-2)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none rtl:-scale-x-100"
          strokeWidth={1.5}
        />
      </Link>
    </section>
  )
}

/* ── Der Aufmacher auf der Übersicht ──────────────────────────────────── */

/**
 * Ein Beitrag, gross gesetzt — mit seinen eigenen Zahlen als Titelbild.
 *
 * ---------------------------------------------------------------------------
 * WARUM KEIN BILD
 * Ein Blog-Aufmacher braucht ueblicherweise ein Foto. creaDIG hat keines, das
 * hierher gehoert, und ein Stockbild waere die erste Luege auf einer Seite,
 * die von einem ehrlichen Befund handelt. Also traegt der Beitrag sein
 * eigenes Ergebnis als Bild: die Zahl, um die es geht, gross, mit dem
 * Verhaeltnis darunter.
 *
 * Das funktioniert nur, wenn der Beitrag `kennzahlen` hat. Hat er keine,
 * bleibt der Aufmacher eine reine Textkomposition — und sieht dann nicht
 * kaputt aus, sondern schlicht.
 */
export function InsightFeature({ entry }: { entry: Insight }) {
  const { t, locale } = useLocale()
  const copy = t.insightsPage
  const haupt = entry.kennzahlen?.find((k) => k.betont) ?? entry.kennzahlen?.[0]
  const weitere = entry.kennzahlen?.filter((k) => k !== haupt).slice(0, 2) ?? []

  return (
    <article className="group">
      <Link href={`/insights/${entry.slug}`} className="block focus-visible:outline-offset-4">
        <div className="border-line relative grid gap-x-12 gap-y-8 border-t pt-8 lg:grid-cols-12">
          <span
            aria-hidden="true"
            className="bg-gold absolute start-0 top-0 h-px w-0 transition-all duration-[var(--dur-3)] ease-brand group-hover:w-full motion-reduce:transition-none"
          />
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="eyebrow text-gold-text">{entry.topic[locale]}</span>
              <span aria-hidden="true" className="bg-line-strong h-3 w-px" />
              <time dateTime={entry.date} className="text-meta text-muted-foreground">
                {entry.date}
              </time>
            </div>
            <h3 className="type-h2 mt-6 text-balance">{entry.title[locale]}</h3>
            <p className="type-body text-muted-foreground mt-6 max-w-2xl text-pretty">
              {entry.teaser[locale]}
            </p>
            <span className="text-gold-text group-hover:text-foreground mt-8 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]">
              {copy.readLabel}
              <ArrowUpRight
                className="size-4 transition-transform duration-[var(--dur-2)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none rtl:-scale-x-100"
                strokeWidth={1.5}
              />
            </span>
          </div>

          {haupt && (
            <div className="bg-muted flex flex-col justify-between gap-8 p-8 lg:col-span-5">
              <p className="eyebrow text-muted-foreground">{copy.findingsLabel}</p>
              <p className="flex items-baseline gap-4">
                <span className="text-display text-gold-text text-7xl leading-none tabular-nums md:text-8xl">
                  {haupt.wert}
                </span>
                <span className="type-small text-muted-foreground text-pretty">
                  {haupt.label[locale]}
                </span>
              </p>
              {/*
                Der beschriftende Text steht INNERHALB des <dd>. Als
                Geschwister von <dt> und <dd> war er ungueltig: In einer
                Beschreibungsliste darf ein <div> nur <dt> und <dd> enthalten,
                nichts sonst — axe hat das auf /insights in allen vier Faellen
                gemeldet.
              */}
              <dl className="flex flex-wrap gap-x-10 gap-y-4">
                {weitere.map((k) => (
                  <div key={k.label.de} className="flex flex-col gap-1">
                    <dt className="sr-only">{k.label[locale]}</dt>
                    <dd className="flex flex-col gap-1">
                      <span className="text-subhead text-lg tabular-nums">
                        {k.wert}
                        {k.von !== undefined && (
                          <span className="text-muted-foreground"> / {k.von}</span>
                        )}
                      </span>
                      <span className="text-meta text-muted-foreground">{k.label[locale]}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}
