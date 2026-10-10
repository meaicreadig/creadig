"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RotateCcw } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { useSeenOnce } from "@/lib/use-seen-once"

/*
 * DAS SYSTEMBILD — eine Buehne statt zweier Zeilen.
 *
 * Vorher standen „Heute" und „Mit System" als zwei Haarlinien untereinander;
 * man musste den Unterschied lesen. Jetzt passiert er: Sechs Werkzeuge liegen
 * verstreut, verknotet, mit Bruchstellen an jeder Uebergabe — und ordnen sich
 * beim Hineinscrollen zu EINEM Weg, durch den ein Vorgang laeuft.
 *
 * Es bleibt ein Modell, kein Kundenergebnis (`modelNote` steht am Bild).
 */

const EASE = [0.22, 1, 0.36, 1] as const

type Pt = readonly [number, number]

const CHAOS_WIDE: Pt[] = [
  [12, 22],
  [62, 12],
  [30, 58],
  [86, 38],
  [50, 32],
  [72, 66],
]
const CHAOS_NARROW: Pt[] = [
  [14, 7],
  [50, 21],
  [20, 37],
  [54, 52],
  [16, 69],
  [48, 87],
]

const TANGLES: readonly (readonly [number, number])[] = [
  [0, 4],
  [2, 5],
  [1, 3],
  [0, 2],
]

function systemPoints(narrow: boolean, n: number): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    return narrow ? ([14, 7 + t * 80] as const) : ([8 + t * 84, 46] as const)
  })
}

function clamp(v: number) {
  return Math.min(98, Math.max(2, v))
}

function curve(a: Pt, b: Pt, ordered: boolean, sign: number) {
  if (ordered) {
    const c1x = a[0] + (b[0] - a[0]) / 3
    const c1y = a[1] + (b[1] - a[1]) / 3
    const c2x = a[0] + ((b[0] - a[0]) * 2) / 3
    const c2y = a[1] + ((b[1] - a[1]) * 2) / 3
    return `M ${a[0]} ${a[1]} C ${c1x} ${c1y} ${c2x} ${c2y} ${b[0]} ${b[1]}`
  }
  const c1x = clamp(a[0] + (b[0] - a[0]) * 0.15 + sign * 22)
  const c1y = clamp(a[1] - sign * 30)
  const c2x = clamp(b[0] - (b[0] - a[0]) * 0.15 - sign * 18)
  const c2y = clamp(b[1] + sign * 28)
  return `M ${a[0]} ${a[1]} C ${c1x} ${c1y} ${c2x} ${c2y} ${b[0]} ${b[1]}`
}

function curveMid(a: Pt, b: Pt, sign: number): Pt {
  const c1x = clamp(a[0] + (b[0] - a[0]) * 0.15 + sign * 22)
  const c1y = clamp(a[1] - sign * 30)
  const c2x = clamp(b[0] - (b[0] - a[0]) * 0.15 - sign * 18)
  const c2y = clamp(b[1] + sign * 28)
  return [(a[0] + 3 * c1x + 3 * c2x + b[0]) / 8, (a[1] + 3 * c1y + 3 * c2y + b[1]) / 8]
}

function subscribeNarrow(cb: () => void) {
  const mq = window.matchMedia("(max-width: 767px)")
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

function useNarrow() {
  return useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  )
}

export function Betriebsfluss() {
  const { t, locale } = useLocale()
  const copy = t.home.betriebsfluss
  const reduce = usePrefersReducedMotion()
  const narrow = useNarrow()
  const { ref, seen } = useSeenOnce<HTMLElement>(0.45)
  const [ordered, setOrdered] = useState(false)
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (reduce) {
      setOrdered(true)
      return
    }
    if (!seen) return
    setOrdered(false)
    const id = window.setTimeout(() => setOrdered(true), 1900)
    return () => window.clearTimeout(id)
  }, [seen, reduce, run])

  const rtl = locale === "ar"
  const flip = (p: Pt): Pt => (rtl && !narrow ? [100 - p[0], p[1]] : p)
  const n = copy.stations.length
  const chaos = (narrow ? CHAOS_NARROW : CHAOS_WIDE).map(flip)
  const line = systemPoints(narrow, n).map(flip)
  const pos = ordered ? line : chaos
  const dur = reduce ? 0 : 1.4

  return (
    <section
      ref={ref}
      id="systembild"
      aria-labelledby="systembild-title"
      className="section-seam"
      data-state={ordered ? "verbunden" : "getrennt"}
    >
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="systembild-title" className="type-h2 mt-7 text-balance">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:pb-2">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">{copy.lead}</p>
          </Reveal>
        </div>

        <div className="border-line bg-surface relative mt-14 overflow-hidden rounded-[var(--radius-lg)] border">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(ellipse at center, black 40%, transparent 85%)",
            }}
          />

          <div className="border-line relative z-10 flex flex-col gap-6 border-b p-5 md:flex-row md:items-center md:justify-between md:p-7">
            <div
              role="group"
              aria-label={`${copy.todayLabel} / ${copy.systemLabel}`}
              className="border-line bg-background inline-flex self-start rounded-full border p-1"
            >
              {[
                { on: false, label: copy.todayLabel },
                { on: true, label: copy.systemLabel },
              ].map((opt) => {
                const active = ordered === opt.on
                return (
                  <button
                    key={opt.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setOrdered(opt.on)}
                    className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                      active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="systembild-toggle"
                        className={`absolute inset-0 rounded-full ${opt.on ? "bg-primary" : "bg-destructive"}`}
                        transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                      />
                    )}
                    <span className="relative">{opt.label}</span>
                  </button>
                )
              })}
            </div>

            <dl className="flex items-end gap-8 md:gap-12">
              <Metric value={ordered ? 0 : n - 1} label={copy.metricHandoffs} alarm={!ordered} />
              <Metric value={ordered ? 1 : n} label={copy.metricTools} alarm={!ordered} />
              <button
                type="button"
                onClick={() => setRun((r) => r + 1)}
                className="text-muted-foreground hover:text-foreground mb-1 hidden items-center gap-2 text-sm transition-colors sm:inline-flex"
              >
                <RotateCcw className="size-4" strokeWidth={1.5} aria-hidden="true" />
                {copy.replay}
              </button>
            </dl>
          </div>

          <div className="relative z-10 aspect-[3/4] w-full sm:aspect-[4/3] md:aspect-[21/9]">
            <svg
              aria-hidden="true"
              className="absolute inset-0 size-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {TANGLES.map(([a, b], i) => (
                <motion.path
                  key={`tangle-${a}-${b}`}
                  fill="none"
                  stroke="var(--muted-foreground)"
                  strokeWidth={1}
                  strokeDasharray="3 5"
                  vectorEffect="non-scaling-stroke"
                  initial={false}
                  animate={{
                    d: curve(pos[a], pos[b], ordered, i % 2 ? 1 : -1),
                    opacity: ordered ? 0 : 0.45,
                  }}
                  transition={{ duration: dur, ease: EASE }}
                />
              ))}
              {pos.slice(0, -1).map((p, i) => (
                <motion.path
                  key={`seg-${copy.stations[i]}`}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  initial={false}
                  animate={{
                    d: curve(p, pos[i + 1], ordered, i % 2 ? 1 : -1),
                    stroke: ordered ? "var(--gold)" : "var(--destructive)",
                    strokeWidth: ordered ? 2.5 : 1.25,
                    strokeDasharray: ordered ? "0 0" : "6 6",
                    opacity: ordered ? 1 : 0.8,
                  }}
                  transition={{ duration: dur, ease: EASE, delay: ordered ? i * 0.04 : 0 }}
                />
              ))}
            </svg>

            <AnimatePresence>
              {!ordered &&
                chaos.slice(0, -1).map((p, i) => {
                  const m = curveMid(p, chaos[i + 1], i % 2 ? 1 : -1)
                  return (
                    <motion.span
                      key={`break-${copy.stations[i]}`}
                      aria-hidden="true"
                      className="bg-background border-destructive text-destructive absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono text-xs"
                      style={{ left: `${m[0]}%`, top: `${m[1]}%` }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : 0.2 + i * 0.08 }}
                    >
                      {"×"}
                    </motion.span>
                  )
                })}
            </AnimatePresence>

            {ordered && !reduce && (
              <motion.span
                key={`pulse-${narrow}-${rtl}`}
                aria-hidden="true"
                className="bg-gold absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ boxShadow: "0 0 0 6px color-mix(in oklab, var(--gold) 25%, transparent), 0 0 24px var(--gold)" }}
                initial={{ left: `${line[0][0]}%`, top: `${line[0][1]}%`, opacity: 0 }}
                animate={{
                  left: [`${line[0][0]}%`, `${line[n - 1][0]}%`],
                  top: [`${line[0][1]}%`, `${line[n - 1][1]}%`],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{ duration: 2.6, delay: 1.2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.6, ease: "easeInOut" }}
              />
            )}

            <ol className="absolute inset-0">
              {copy.stations.map((station, i) => (
                <motion.li
                  key={station}
                  className="absolute"
                  initial={false}
                  animate={{ left: `${pos[i][0]}%`, top: `${pos[i][1]}%` }}
                  transition={{ duration: dur, ease: EASE, delay: ordered ? i * 0.05 : 0 }}
                >
                  <motion.span
                    aria-hidden="true"
                    className="absolute block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                    animate={{
                      backgroundColor: ordered ? "var(--gold)" : "var(--background)",
                      borderColor: ordered ? "var(--gold)" : "var(--muted-foreground)",
                    }}
                    transition={{ duration: reduce ? 0 : 0.5 }}
                  />
                  <motion.div
                    className={`absolute flex flex-col gap-1 ${
                      narrow ? "top-0 ms-5 -translate-y-1/2" : "top-5 -translate-x-1/2 items-center text-center"
                    }`}
                    style={narrow && rtl ? { right: 0 } : undefined}
                    animate={{ rotate: ordered || reduce ? 0 : (i % 2 ? 1 : -1) * (2 + (i % 3)) }}
                    transition={{ duration: dur, ease: EASE }}
                  >
                    <span
                      className={`border-line bg-background whitespace-nowrap rounded-[var(--radius-sm)] border px-3 py-1.5 font-display text-sm font-medium shadow-[var(--elevation-1)] md:text-base ${
                        ordered ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {station}
                    </span>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={ordered ? "sys" : "tool"}
                        className={`whitespace-nowrap font-mono text-xs ${ordered ? "text-gold-text" : "text-destructive"}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: reduce ? 0 : 0.25 }}
                      >
                        {ordered ? "creaDIG" : copy.tools[i]}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                </motion.li>
              ))}
            </ol>
          </div>

          <div className="border-line relative z-10 flex flex-col gap-4 border-t p-5 md:flex-row md:items-center md:justify-between md:p-7">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={ordered ? "s" : "t"}
                aria-live="polite"
                className="text-foreground text-lg font-medium text-pretty"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: reduce ? 0 : 0.3 }}
              >
                {ordered ? copy.systemNote : copy.todayNote}
              </motion.p>
            </AnimatePresence>
            <span
              className={`text-gold-text border-gold/50 inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 font-mono text-xs transition-opacity duration-500 md:self-auto ${
                ordered ? "opacity-100" : "opacity-0"
              }`}
            >
              <span aria-hidden="true" className="bg-gold size-[7px] rounded-full" />
              {copy.ownership}
            </span>
          </div>
        </div>

        <p className="text-meta text-muted-foreground mt-6 max-w-xl">{copy.modelNote}</p>
      </div>
    </section>
  )
}

function Metric({ value, label, alarm }: { value: number; label: string; alarm: boolean }) {
  return (
    <div className="flex flex-col">
      <dt className="text-muted-foreground order-2 text-xs md:text-sm">{label}</dt>
      <dd className="order-1 h-12 overflow-hidden md:h-14">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className={`font-display block text-5xl leading-none font-semibold tracking-tight tabular-nums md:text-6xl ${
              alarm ? "text-destructive" : "text-gold-text"
            }`}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </dd>
    </div>
  )
}
