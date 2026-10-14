import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { morgenBriefing, type BriefingSprache } from "@/lib/admin/morgen-briefing"
import { GESCHAEFTS_ZEITZONE } from "@/lib/geschaeftszeit"
import { NeuEinschaetzenKnopf } from "@/components/admin/morgen-assistent-knopf"

const TEXT = {
  de: {
    label: "Dein Assistent",
    gruss: (h: number) => (h < 11 ? "Guten Morgen, Emin." : h < 18 ? "Hallo, Emin." : "Guten Abend, Emin."),
    heute: "Das bringt dich heute nach vorne",
    oeffnen: "Öffnen",
    weiter: "Darüber hinaus",
    regel: "Ohne KI aus deiner Liste zusammengestellt.",
    laedt: "Dein Assistent liest gerade alles für heute …",
  },
  tr: {
    label: "Asistanın",
    gruss: (h: number) => (h < 11 ? "Günaydın, Emin." : h < 18 ? "Merhaba, Emin." : "İyi akşamlar, Emin."),
    heute: "Bugün seni ileri taşıyacak olanlar",
    oeffnen: "Aç",
    weiter: "Bunun ötesinde",
    regel: "Yapay zekâ olmadan listenden derlendi.",
    laedt: "Asistanın bugün için her şeyi okuyor …",
  },
} as const

function stunde(): number {
  return Number(new Intl.DateTimeFormat("de-DE", { timeZone: GESCHAEFTS_ZEITZONE, hour: "numeric", hour12: false }).format(new Date()))
}

function Rahmen({ sprache, children }: { sprache: BriefingSprache; children: React.ReactNode }) {
  const t = TEXT[sprache]
  return (
    <section aria-labelledby="assistent-titel" className="bg-card mb-10 flex flex-col gap-8 rounded-[2rem] p-6 md:p-10">
      <header className="flex flex-col gap-3">
        <span className="text-primary inline-flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4" aria-hidden="true" />
          {t.label}
        </span>
        <h2 id="assistent-titel" className="text-foreground text-balance text-3xl font-bold tracking-tight md:text-4xl">
          {t.gruss(stunde())}
        </h2>
      </header>
      {children}
    </section>
  )
}

export function MorgenAssistentLaedt({ sprache }: { sprache: BriefingSprache }) {
  return (
    <Rahmen sprache={sprache}>
      <p className="text-muted-foreground animate-pulse text-base leading-relaxed">{TEXT[sprache].laedt}</p>
    </Rahmen>
  )
}

export async function MorgenAssistent({ sprache }: { sprache: BriefingSprache }) {
  const t = TEXT[sprache]
  const b = await morgenBriefing(sprache)

  return (
    <Rahmen sprache={sprache}>
      <p className="text-muted-foreground -mt-4 max-w-3xl text-pretty text-lg leading-relaxed">{b.lage}</p>

      <div className="flex flex-col gap-4">
        <h3 className="text-muted-foreground text-sm font-semibold">{t.heute}</h3>
        <ol className="grid gap-3 lg:grid-cols-3">
          {b.schritte.map((s, i) => {
            const inhalt = (
              <>
                <span
                  className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="text-foreground text-pretty text-base font-semibold leading-snug">{s.titel}</span>
                  {s.warum ? <span className="text-muted-foreground text-pretty text-sm leading-relaxed">{s.warum}</span> : null}
                  {s.href ? (
                    <span className="text-primary mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold">
                      {t.oeffnen}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  ) : null}
                </span>
              </>
            )
            const klasse = "bg-background flex h-full gap-4 rounded-3xl p-5 transition-colors"
            return (
              <li key={i}>
                {s.href ? (
                  <Link href={s.href} className={`group hover:bg-primary/5 ${klasse}`}>
                    {inhalt}
                  </Link>
                ) : (
                  <div className={klasse}>{inhalt}</div>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <footer className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {b.impuls ? (
          <p className="max-w-2xl text-pretty text-base leading-relaxed">
            <span className="text-primary font-semibold">{t.weiter}: </span>
            <span className="text-foreground">{b.impuls}</span>
          </p>
        ) : (
          <span />
        )}
        <div className="flex shrink-0 flex-col items-start gap-1 md:items-end">
          <NeuEinschaetzenKnopf sprache={sprache} />
          {b.quelle === "regel" ? <span className="text-muted-foreground text-xs">{t.regel}</span> : null}
        </div>
      </footer>
    </Rahmen>
  )
}
