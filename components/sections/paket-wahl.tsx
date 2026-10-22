"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, animate, motion } from "framer-motion"
import { ArrowUpRight, Check } from "lucide-react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { useLocale } from "@/components/locale-provider"
import { formatPrice, packages } from "@/lib/site-data"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

/*
 * Die Pakete als Auswahl statt als Kartenraster: oben die Einstiege mit ihrem
 * Preis (damit der Vergleich auf einen Blick bleibt), darunter das gewaehlte
 * Paket in voller Breite. Ein Paket, das man waehlt, liest sich wie eine
 * Entscheidung — drei Karten nebeneinander lesen sich wie eine Preisliste.
 */
export function PaketWahl() {
  const { t, locale } = useLocale()
  const reduce = usePrefersReducedMotion()
  const start = Math.max(0, packages.findIndex((p) => p.recommended))
  const [gewaehlt, setGewaehlt] = useState(start)
  const pkg = packages[gewaehlt]
  const copy = t.packages.items[pkg.key]

  function onKey(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    e.preventDefault()
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + packages.length) % packages.length
    setGewaehlt(next)
    document.getElementById(`paket-tab-${packages[next].key}`)?.focus()
  }

  return (
    <div className="mt-16">
      {packages.length > 1 && (
        <div
          role="tablist"
          aria-label={t.packages.title}
          className="border-line grid gap-px border-b sm:flex"
        >
          {packages.map((p, i) => {
            const aktiv = i === gewaehlt
            return (
              <button
                key={p.key}
                id={`paket-tab-${p.key}`}
                type="button"
                role="tab"
                aria-selected={aktiv}
                aria-controls="paket-panel"
                tabIndex={aktiv ? 0 : -1}
                onClick={() => setGewaehlt(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn(
                  "relative flex flex-1 flex-col items-start gap-1.5 px-5 py-5 text-start transition-colors duration-[var(--dur-2)] md:px-7",
                  aktiv ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="eyebrow">{t.packages.entryKind[p.key]}</span>
                <span className="text-subhead text-lg">{t.packages.items[p.key].name}</span>
                <span className={cn("text-sm", aktiv ? "text-gold-text" : "")}>
                  {formatPrice(p.amount, locale)} {p.period ? t.packages.monthly : t.packages.once}
                </span>
                {p.recommended && (
                  <span className="border-gold text-gold-text eyebrow absolute top-4 end-4 border px-2 py-0.5">
                    {t.packages.recommended}
                  </span>
                )}
                {aktiv && (
                  <motion.span
                    layoutId="paket-indikator"
                    aria-hidden="true"
                    className="bg-gold absolute inset-x-0 -bottom-px h-0.5 shadow-[0_0_14px_var(--gold)]"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      <div
        id="paket-panel"
        role={packages.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={packages.length > 1 ? `paket-tab-${pkg.key}` : undefined}
        className="bg-surface-raised relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pkg.key}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-12 p-8 md:p-12 lg:grid-cols-12"
          >
            <div className="flex flex-col lg:col-span-6">
              <p className="eyebrow text-gold-text">{t.packages.entryKind[pkg.key]}</p>
              <h3 className="type-h2 mt-4 text-balance">{copy.name}</h3>

              <div className="mt-8 flex items-baseline gap-3">
                <Zaehler wert={pkg.amount} reduce={reduce} />
                <span className="eyebrow text-muted-foreground">
                  {pkg.period ? t.packages.monthly : t.packages.once}
                </span>
              </div>

              {pkg.duration && (
                <p className="type-small text-muted-foreground mt-4">
                  <span className="eyebrow text-gold-text">{t.packages.durationLabel}: </span>
                  {pkg.duration[locale]}
                </p>
              )}

              {pkg.pilotAmount !== undefined && (
                <div className="border-gold/40 bg-gold/[0.06] mt-6 flex flex-col gap-2 rounded-lg border p-4">
                  <p className="text-meta text-gold-text">
                    {t.packages.pilotLabel}: {formatPrice(pkg.pilotAmount, locale)}
                  </p>
                  <p className="type-small text-muted-foreground text-pretty">{t.packages.referenceNote}</p>
                </div>
              )}

              <div className="border-line mt-8 border-t pt-6">
                <p className="eyebrow text-muted-foreground">{t.packages.forWhom}</p>
                <p className="type-body text-foreground/85 mt-3 text-pretty">{copy.who}</p>
                <p className="type-body text-gold-text mt-4 flex gap-2 text-pretty">
                  <span aria-hidden="true">→</span>
                  <span>{copy.outcome}</span>
                </p>
              </div>

              <Link
                href={pkg.ctaHref ?? `/termin?paket=${pkg.key}`}
                className="cta-outline mt-10 inline-flex items-center justify-between gap-6 self-start px-6 py-4 text-sm tracking-wide"
              >
                {copy.cta}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </Link>
            </div>

            <div className="lg:col-span-6">
              <ul className="flex flex-col">
                {copy.includes.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={reduce ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduce ? 0 : 0.15 + i * 0.06, duration: 0.4 }}
                    className="border-line flex gap-4 border-b py-4 first:pt-0"
                  >
                    <span className="border-gold/50 bg-gold/10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border">
                      <Check className="text-gold-text size-3" strokeWidth={2} />
                    </span>
                    <span className="type-small text-foreground/85 text-pretty">{item}</span>
                  </motion.li>
                ))}
              </ul>
              <p className="text-muted-foreground text-meta mt-6">{copy.note}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* Der Preis zaehlt hoch, wenn ein Paket gewaehlt wird — er steht am Ende exakt. */
function Zaehler({ wert, reduce }: { wert: number; reduce: boolean }) {
  const { locale } = useLocale()
  const [anzeige, setAnzeige] = useState(reduce ? wert : Math.round(wert * 0.6))

  useEffect(() => {
    if (reduce) {
      setAnzeige(wert)
      return
    }
    const controls = animate(Math.round(wert * 0.6), wert, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setAnzeige(Math.round(v)),
    })
    return () => controls.stop()
  }, [wert, reduce])

  return (
    <span className="type-stat tabular-nums">
      {/* aria-label ist auf einem rollenlosen <span> verboten (axe) — der Endwert steht deshalb als Text für Screenreader. */}
      <span className="sr-only">{formatPrice(wert, locale)}</span>
      <span aria-hidden="true">{formatPrice(anzeige, locale)}</span>
    </span>
  )
}
