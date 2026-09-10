"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/**
 * WENN SIE VERANTWORTUNG ABGEBEN — GATE 02 · WEB-0007.
 *
 * ---------------------------------------------------------------------------
 * DER BEFUND
 * „Lieferfaehigkeit: weder Personen, Rollen noch Kapazitaetsmodell sichtbar."
 * Gemessen in Gate 00: `/unternehmen` traegt 858 Woerter und keine
 * Rollenstruktur.
 *
 * `WorkModel` direkt darueber hat inzwischen die erste Haelfte beantwortet:
 * WER fuehrt, wer dazukommt. Die zweite Haelfte fehlte — und sie ist die,
 * nach der ein Betrieb fragt, bevor er ueber Geld spricht: Was passiert
 * eigentlich, wenn wir Verantwortung abgeben?
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS KEINE „WARUM WIR"-SEKTION IST
 * Weil hier nichts behauptet wird, das nicht schon anderswo auf dieser
 * Website steht und dort ausfuehrlich belegt ist. Jede der sechs Antworten
 * traegt den Verweis auf ihre Fundstelle — das ist der Unterschied zwischen
 * einer Zusage und einer Aufzaehlung von Adjektiven:
 *
 *   Wer fuehrt              → Arbeitsmodell, eine Sektion hoeher
 *   Wie der Umfang steht    → `/leistungen` (Angebot mit Umfang und Preis)
 *   Wie geprueft wird       → `/barrierefreiheit` (die eigene Pruefung)
 *   Was Ihnen gehoert       → `/betrieb` (Code, Inhalte, Zugaenge, Domain)
 *   Wer sonst daran sitzt   → Arbeitsmodell
 *   Was nicht zugesagt ist  → `/betrieb` (kein 24/7, kein Stundenversprechen)
 *
 * Sechs Verweise auf sechs bestehende Belege. Keine Ikone, kein Haken, kein
 * „Zuverlaessigkeit".
 *
 * ---------------------------------------------------------------------------
 * DIE LETZTE ZEILE IST DIE WICHTIGSTE
 * `limit` nennt die drei Luecken, die ein groesserer Kunde ohnehin findet:
 * keine Mitarbeiterzahl, keine Kapazitaetsgrenze, keine Vertretungsregel. Sie
 * stehen hier, weil eine Grenze, die der Anbieter selbst ausspricht, kalkulierbar
 * ist — und eine, die der Kunde entdeckt, ein Vertrauensbruch.
 *
 * Sie ist bewusst nicht kleiner gesetzt als der Rest.
 */
/*
 * GATE 03 · EIGENE SCHULD AUS GATE 02.
 *
 * Diese Liste hatte sechs Eintraege. Zwei davon — „Wer fuehrt" und „Wer sonst
 * daran sitzt" — beantworteten genau das, was `WorkModel` unmittelbar
 * DARUEBER auf derselben Seite ausfuehrlich beantwortet: gefuehrt vom
 * Gruender, kleines Kernteam, Spezialisten nach Bedarf. Beide verwiesen sogar
 * per Anker zurueck auf die Sektion, die zwei Bildschirmhoehen hoeher steht.
 *
 * Das war in Gate 02 gut gemeint (die sechs Fragen als geschlossene Liste)
 * und ist als Redaktion falsch: Der Leser liest denselben Gedanken zweimal
 * und haelt beim zweiten Mal nicht die Antwort fuer wiederholt, sondern die
 * Seite fuer aufgeblasen.
 *
 * Geblieben sind die vier Antworten, die es NUR hier gibt. Wer fuehrt und wer
 * dazukommt, sagt der Vorspann in einem Satz und zeigt nach oben — dorthin,
 * wo es steht.
 */
const ITEMS = [
  { key: "umfang", href: "/leistungen#pakete" },
  { key: "pruefung", href: "/barrierefreiheit" },
  { key: "uebergabe", href: "/betrieb" },
  { key: "grenze", href: "/betrieb" },
] as const

export function DeliveryResponsibility() {
  const { t } = useLocale()
  const copy = t.lieferung

  return (
    <section id="lieferung" aria-labelledby="lieferung-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="lieferung-title" className="type-h2 mt-7 text-balance">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">{copy.lead}</p>
          </Reveal>
        </div>

        {/*
          Zwei Spalten, keine Kacheln: Sechs gleich grosse Kaesten waeren
          wieder das Raster, in dem jede Aussage gleich viel wiegt. Als Liste
          mit Haarlinie liest sich jede Zeile als Antwort auf eine Frage.
        */}
        <ul className="border-line mt-16 grid border-t md:grid-cols-2">
          {ITEMS.map(({ key, href }, i) => {
            const item = copy.items[key]
            return (
              <Reveal
                key={key}
                as="li"
                delay={0.05 * i}
                className="border-line group border-b py-8 md:odd:border-e md:odd:pe-10 md:even:ps-10"
              >
                <p className="eyebrow text-gold-text">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="type-h4 mt-4">{item.name}</h3>
                <p className="type-small text-muted-foreground mt-4 max-w-md text-pretty">
                  {item.what}
                </p>
                <Link
                  href={href}
                  className="text-gold-text hover:text-foreground mt-5 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
                >
                  {item.cta}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </Link>
              </Reveal>
            )
          })}
        </ul>

        {/*
          Die Grenze steht am Ende und in voller Groesse. Klein gesetzt waere
          sie ein Haftungsausschluss; so ist sie eine Angabe, mit der ein
          Kaeufer rechnen kann.
        */}
        <Reveal delay={0.2}>
          <p className="type-body text-foreground/85 border-gold/45 mt-12 max-w-3xl border-s-2 ps-6 text-pretty">
            {copy.limit}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
