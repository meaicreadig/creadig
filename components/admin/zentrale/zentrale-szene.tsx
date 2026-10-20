"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowRight, Box, RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react"

import type { Signal, Zustand } from "@/lib/zentrale/netz"
import { GEHIRN, type Faden, type Knoten, type KnotenId, type Sprache } from "@/lib/zentrale/netz-karte"
import { bodenRing, bogen, ELEV_MAX, ELEV_MIN, ISO_KAMERA, type Kamera, projiziere, quader, alsPunkte } from "@/lib/zentrale/projektion"

export type SzenenKnoten = Knoten & { signal: Signal }

const FARBE: Record<Zustand, string> = {
  ruhig: "var(--muted-foreground)",
  aktiv: "var(--primary)",
  achtung: "var(--gold-deep)",
  stoerung: "var(--destructive)",
}

const TEXT = {
  de: {
    netz: "Das Netz",
    titel: "Alles läuft durch die Zentrale",
    hilfe: "Ziehen dreht · Pinch zoomt · Doppelklick öffnet",
    zustand: { ruhig: "ruhig", aktiv: "aktiv", achtung: "braucht dich", stoerung: "Störung" },
    rein: "Bekommt von",
    raus: "Liefert an",
    oeffnen: "Öffnen",
    links: "Nach links drehen",
    rechts: "Nach rechts drehen",
    naeher: "Näher",
    weiter: "Weiter weg",
    iso: "Isometrische Ansicht",
    gehirn: "Alle Flächen",
  },
  tr: {
    netz: "Ağ",
    titel: "Her şey merkezden geçer",
    hilfe: "Sürükle döndürür · Kıstır yakınlaştırır · Çift tık açar",
    zustand: { ruhig: "sakin", aktiv: "aktif", achtung: "seni bekliyor", stoerung: "arıza" },
    rein: "Besleyen",
    raus: "Beslediği",
    oeffnen: "Aç",
    links: "Sola döndür",
    rechts: "Sağa döndür",
    naeher: "Yakınlaş",
    weiter: "Uzaklaş",
    iso: "İzometrik görünüm",
    gehirn: "Tüm alanlar",
  },
} as const

const VB_B = 1000
const VB_H = 640
const BODEN = { x0: -7.4, x1: 7.4, y0: -6.6, y1: 8 }

export function ZentraleSzene({ knoten, faeden, sprache }: { knoten: SzenenKnoten[]; faeden: Faden[]; sprache: Sprache }) {
  const t = TEXT[sprache]
  const router = useRouter()
  const [kamera, setKamera] = useState<Kamera>(ISO_KAMERA)
  const [drift, setDrift] = useState(0)
  const [auswahl, setAuswahl] = useState<KnotenId>(GEHIRN)
  const [hover, setHover] = useState<KnotenId | null>(null)
  const [ruhe, setRuhe] = useState(false)
  const zug = useRef<{ x: number; y: number; ziehen: boolean; id: number } | null>(null)
  const zuletztBewegt = useRef(0)
  const svgRef = useRef<SVGSVGElement>(null)
  const tween = useRef<number | null>(null)
  const kameraRef = useRef(kamera)
  kameraRef.current = kamera

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setRuhe(mq.matches)
    const f = (e: MediaQueryListEvent) => setRuhe(e.matches)
    mq.addEventListener("change", f)
    return () => mq.removeEventListener("change", f)
  }, [])

  /* Atem der Szene: leichtes Pendeln, solange niemand dreht. */
  useEffect(() => {
    if (ruhe) {
      setDrift(0)
      return
    }
    let raf = 0
    let letzt = 0
    const lauf = (zeit: number) => {
      raf = requestAnimationFrame(lauf)
      if (zeit - letzt < 33) return
      letzt = zeit
      if (zug.current?.ziehen || performance.now() - zuletztBewegt.current < 2500) return
      setDrift(Math.sin(zeit / 5200) * 0.09)
    }
    raf = requestAnimationFrame(lauf)
    return () => cancelAnimationFrame(raf)
  }, [ruhe])

  const animiereZu = useCallback(
    (ziel: Partial<Kamera>) => {
      if (tween.current) cancelAnimationFrame(tween.current)
      zuletztBewegt.current = performance.now()
      if (ruhe) {
        setKamera((k) => ({ ...k, ...ziel }))
        return
      }
      const start = performance.now()
      const von = kameraRef.current
      const nach = { ...von, ...ziel }
      const schritt = (jetzt: number) => {
        const p = Math.min(1, (jetzt - start) / 520)
        const e = 1 - Math.pow(1 - p, 3)
        setKamera({
          yaw: von.yaw + (nach.yaw - von.yaw) * e,
          elev: von.elev + (nach.elev - von.elev) * e,
          zoom: von.zoom + (nach.zoom - von.zoom) * e,
        })
        zuletztBewegt.current = performance.now()
        if (p < 1) tween.current = requestAnimationFrame(schritt)
      }
      tween.current = requestAnimationFrame(schritt)
    },
    [ruhe],
  )

  /* Pinch auf dem Trackpad (ctrl + wheel) zoomt, normales Scrollen bleibt Scrollen. */
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const rad = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      zuletztBewegt.current = performance.now()
      setKamera((k) => ({ ...k, zoom: Math.min(1.9, Math.max(0.6, k.zoom * Math.exp(-e.deltaY * 0.01))) }))
    }
    el.addEventListener("wheel", rad, { passive: false })
    return () => el.removeEventListener("wheel", rad)
  }, [])

  const k: Kamera = { ...kamera, yaw: kamera.yaw + drift }
  const m = 44 * kamera.zoom
  const mitte = projiziere({ x: 0, y: 0.8, z: 0.6 }, k, m)
  const fokus = hover ?? auswahl

  const nachId = useMemo(() => new Map(knoten.map((n) => [n.id, n])), [knoten])
  const gehirn = nachId.get(GEHIRN)!
  const hoehe = (n: SzenenKnoten) => (n.id === GEHIRN ? 2.3 : 0.45 + n.signal.last * 1.5)
  const halb = (n: SzenenKnoten) => (n.id === GEHIRN ? 1.05 : 0.72)

  const boden = alsPunkte([
    projiziere({ x: BODEN.x0, y: BODEN.y0, z: 0 }, k, m),
    projiziere({ x: BODEN.x1, y: BODEN.y0, z: 0 }, k, m),
    projiziere({ x: BODEN.x1, y: BODEN.y1, z: 0 }, k, m),
    projiziere({ x: BODEN.x0, y: BODEN.y1, z: 0 }, k, m),
  ])
  const sockel = alsPunkte([
    projiziere({ x: BODEN.x0, y: BODEN.y0, z: -0.35 }, k, m),
    projiziere({ x: BODEN.x1, y: BODEN.y0, z: -0.35 }, k, m),
    projiziere({ x: BODEN.x1, y: BODEN.y1, z: -0.35 }, k, m),
    projiziere({ x: BODEN.x0, y: BODEN.y1, z: -0.35 }, k, m),
  ])
  const gitter: string[] = []
  for (let x = BODEN.x0 + 1.48; x < BODEN.x1; x += 1.48) {
    const a = projiziere({ x, y: BODEN.y0, z: 0 }, k, m)
    const b = projiziere({ x, y: BODEN.y1, z: 0 }, k, m)
    gitter.push(`M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}`)
  }
  for (let y = BODEN.y0 + 1.46; y < BODEN.y1; y += 1.46) {
    const a = projiziere({ x: BODEN.x0, y, z: 0 }, k, m)
    const b = projiziere({ x: BODEN.x1, y, z: 0 }, k, m)
    gitter.push(`M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}`)
  }

  const speichen = knoten
    .filter((n) => n.id !== GEHIRN)
    .map((n) => ({
      id: n.id,
      d: bogen(n.pos, gehirn.pos, k, m, 0.35, 0.04),
      an: fokus === GEHIRN || fokus === n.id,
      takt: n.signal.zustand === "ruhig" ? 0 : 3.6 - n.signal.last * 1.8,
      farbe: FARBE[n.signal.zustand],
    }))
  const querfaeden = faeden
    .filter((f) => nachId.has(f.von) && nachId.has(f.nach))
    .map((f) => {
      const a = nachId.get(f.von)!
      const b = nachId.get(f.nach)!
      const dist = Math.hypot(a.pos.x - b.pos.x, a.pos.y - b.pos.y)
      return {
        f,
        d: bogen(a.pos, b.pos, k, m, 0.35 + dist * 0.16),
        an: fokus === f.von || fokus === f.nach,
        takt: 2.8 - a.signal.last * 1.2,
      }
    })

  const gebaeude = [...knoten].sort((a, b) => projiziere({ ...a.pos, z: 0 }, k, m).t - projiziere({ ...b.pos, z: 0 }, k, m).t)

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    zug.current = { x: e.clientX, y: e.clientY, ziehen: false, id: e.pointerId }
  }
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const z = zug.current
    if (!z || e.pointerId !== z.id) return
    const dx = e.clientX - z.x
    const dy = e.clientY - z.y
    if (!z.ziehen && Math.hypot(dx, dy) < 5) return
    if (!z.ziehen) {
      z.ziehen = true
      e.currentTarget.setPointerCapture(e.pointerId)
      if (tween.current) cancelAnimationFrame(tween.current)
    }
    z.x = e.clientX
    z.y = e.clientY
    zuletztBewegt.current = performance.now()
    setKamera((c) => ({ ...c, yaw: c.yaw - dx * 0.008, elev: Math.min(ELEV_MAX, Math.max(ELEV_MIN, c.elev + dy * 0.004)) }))
  }
  const onUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const war = zug.current?.ziehen
    if (war && e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    setTimeout(() => (zug.current = null), 0)
  }
  const waehle = (id: KnotenId) => {
    if (zug.current?.ziehen) return
    setAuswahl(id)
  }

  const gewaehlt = nachId.get(auswahl) ?? gehirn
  const rein = faeden.filter((f) => f.nach === gewaehlt.id && nachId.has(f.von))
  const raus = faeden.filter((f) => f.von === gewaehlt.id && nachId.has(f.nach))

  return (
    <section aria-labelledby="zentrale-titel" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">{t.netz}</span>
          <h2 id="zentrale-titel" className="font-sans text-xl font-semibold tracking-tight text-balance">
            {t.titel}
          </h2>
        </div>
        <ul className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" aria-label="Legende">
          {(Object.keys(FARBE) as Zustand[]).map((z) => (
            <li key={z} className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: FARBE[z] }} aria-hidden="true" />
              {t.zustand[z]}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="bg-card relative overflow-hidden rounded-3xl shadow-sm">
          <svg
            ref={svgRef}
            viewBox={`${-VB_B / 2} ${-VB_H / 2} ${VB_B} ${VB_H}`}
            className="zentrale-szene block h-auto w-full cursor-grab touch-none select-none active:cursor-grabbing"
            role="group"
            aria-label={t.titel}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") animiereZu({ yaw: kamera.yaw + Math.PI / 8 })
              if (e.key === "ArrowRight") animiereZu({ yaw: kamera.yaw - Math.PI / 8 })
              if (e.key === "+" || e.key === "=") animiereZu({ zoom: Math.min(1.9, kamera.zoom * 1.2) })
              if (e.key === "-") animiereZu({ zoom: Math.max(0.6, kamera.zoom / 1.2) })
            }}
          >
            <defs>
              <radialGradient id="zentrale-kern" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="var(--card)" />
                <stop offset="38%" stopColor="var(--gold-deep)" />
                <stop offset="100%" stopColor="var(--primary)" />
              </radialGradient>
              <radialGradient id="zentrale-licht" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </radialGradient>
            </defs>

            <g transform={`translate(${-mitte.x} ${-mitte.y})`}>
              <polygon points={sockel} fill="color-mix(in oklab, var(--primary) 10%, var(--background))" />
              <polygon points={boden} fill="var(--background)" stroke="var(--border)" strokeWidth={1} />
              <path d={gitter.join(" ")} stroke="var(--border)" strokeWidth={0.8} fill="none" opacity={0.7} />
              <polygon points={bodenRing(0, 0, 3.6, k, m)} fill="url(#zentrale-licht)" />

              {/* Herzschlag des Gehirns auf dem Boden */}
              {!ruhe &&
                [0, 1, 2].map((i) => (
                  <polygon
                    key={i}
                    points={bodenRing(gehirn.pos.x, gehirn.pos.y, 1.5, k, m, 0.02)}
                    fill="none"
                    stroke="var(--gold-deep)"
                    strokeWidth={1.4}
                    className="zentrale-welle"
                    style={{ animationDelay: `${i * 1.2}s` }}
                  />
                ))}

              {/* Speichen: jede Fläche meldet ans Gehirn */}
              {speichen.map((s) => (
                <g key={`sp-${s.id}`} opacity={s.an ? 1 : 0.35} className="transition-opacity duration-300">
                  <path d={s.d} fill="none" stroke={s.farbe} strokeWidth={s.an ? 1.8 : 1} strokeDasharray="2 5" strokeLinecap="round" />
                  {!ruhe && s.takt > 0 && (
                    <circle r={3} fill={s.farbe}>
                      <animateMotion dur={`${s.takt}s`} repeatCount="indefinite" path={s.d} />
                    </circle>
                  )}
                </g>
              ))}

              {/* Querfäden: echte Datenwege zwischen Flächen */}
              {querfaeden.map(({ f, d, an, takt }) => (
                <g key={`f-${f.von}-${f.nach}`} opacity={an ? 1 : 0.28} className="transition-opacity duration-300">
                  <path d={d} fill="none" stroke="var(--primary)" strokeWidth={an ? 2.2 : 1.2} strokeLinecap="round" />
                  {!ruhe && (
                    <>
                      <circle r={an ? 4 : 3} fill="var(--primary)">
                        <animateMotion dur={`${takt}s`} repeatCount="indefinite" path={d} />
                      </circle>
                      {an && (
                        <circle r={2.5} fill="var(--gold-deep)">
                          <animateMotion dur={`${takt}s`} begin={`${takt / 2}s`} repeatCount="indefinite" path={d} />
                        </circle>
                      )}
                    </>
                  )}
                </g>
              ))}

              {gebaeude.map((n) => {
                const h = hoehe(n)
                const farbe = n.id === GEHIRN ? "var(--primary)" : FARBE[n.signal.zustand]
                const flaechen = quader(n.pos.x, n.pos.y, halb(n), h, k, m)
                const kopf = projiziere({ ...n.pos, z: h }, k, m)
                const schild = projiziere({ ...n.pos, z: h + (n.id === GEHIRN ? 1.55 : 0.55) }, k, m)
                const kern = projiziere({ ...n.pos, z: h + 0.75 }, k, m)
                const aktiv = fokus === n.id
                const gedimmt = fokus !== GEHIRN && !aktiv && !faeden.some((f) => (f.von === fokus && f.nach === n.id) || (f.nach === fokus && f.von === n.id))
                return (
                  <g
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${n.label[sprache]}: ${n.signal.wert} ${n.signal.zeile}`}
                    aria-pressed={auswahl === n.id}
                    className="cursor-pointer outline-none transition-opacity duration-300 focus-visible:[&_.zentrale-rand]:stroke-[var(--gold-deep)]"
                    opacity={gedimmt && n.id !== GEHIRN ? 0.5 : 1}
                    onClick={() => waehle(n.id)}
                    onDoubleClick={() => router.push(n.href)}
                    onMouseEnter={() => setHover(n.id)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(n.id)}
                    onBlur={() => setHover(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") router.push(n.href)
                      if (e.key === " ") {
                        e.preventDefault()
                        setAuswahl(n.id)
                      }
                    }}
                  >
                    <polygon points={bodenRing(n.pos.x + 0.2, n.pos.y + 0.25, halb(n) * 1.25, k, m, 0.01)} fill="var(--foreground)" opacity={0.06} />
                    {flaechen.map((fl, i) => (
                      <polygon
                        key={i}
                        points={fl.punkte}
                        className={fl.oben ? "zentrale-rand" : undefined}
                        fill={
                          fl.oben
                            ? `color-mix(in oklab, ${farbe} ${aktiv ? 26 : 14}%, var(--card))`
                            : `color-mix(in oklab, ${farbe} ${Math.round(28 + (1 - fl.licht) * 42)}%, var(--card))`
                        }
                        stroke={`color-mix(in oklab, ${farbe} ${aktiv ? 70 : 38}%, var(--card))`}
                        strokeWidth={aktiv ? 1.6 : 1}
                        strokeLinejoin="round"
                      />
                    ))}

                    {n.id === GEHIRN ? (
                      <>
                        <line x1={kopf.x} y1={kopf.y} x2={kern.x} y2={kern.y} stroke="var(--gold-deep)" strokeWidth={2} />
                        <circle cx={kern.x} cy={kern.y} r={18 * kamera.zoom} fill="url(#zentrale-kern)" className={ruhe ? undefined : "zentrale-kern"} />
                        <circle cx={kern.x} cy={kern.y} r={26 * kamera.zoom} fill="none" stroke="var(--gold-deep)" strokeWidth={1} opacity={0.5} className={ruhe ? undefined : "zentrale-kern-ring"} />
                      </>
                    ) : (
                      <circle
                        cx={kopf.x}
                        cy={kopf.y - 2}
                        r={4.5}
                        fill={farbe}
                        className={!ruhe && (n.signal.zustand === "achtung" || n.signal.zustand === "stoerung") ? "zentrale-signal" : undefined}
                      />
                    )}

                    <g transform={`translate(${schild.x} ${schild.y})`} className="pointer-events-none">
                      <text textAnchor="middle" y={-16} className="zentrale-schild fill-foreground font-sans text-[13px] font-semibold">
                        {n.label[sprache]}
                      </text>
                      <text textAnchor="middle" y={2} className="zentrale-schild font-mono text-[12px]" fill={n.id === GEHIRN ? "var(--gold-deep)" : farbe}>
                        {n.signal.wert}
                      </text>
                    </g>
                  </g>
                )
              })}
            </g>
          </svg>

          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/85 p-1 shadow-sm backdrop-blur">
            <SzenenKnopf label={t.links} onClick={() => animiereZu({ yaw: kamera.yaw + Math.PI / 2 })}>
              <RotateCcw className="size-4" aria-hidden="true" />
            </SzenenKnopf>
            <SzenenKnopf label={t.rechts} onClick={() => animiereZu({ yaw: kamera.yaw - Math.PI / 2 })}>
              <RotateCw className="size-4" aria-hidden="true" />
            </SzenenKnopf>
            <SzenenKnopf label={t.weiter} onClick={() => animiereZu({ zoom: Math.max(0.6, kamera.zoom / 1.2) })}>
              <ZoomOut className="size-4" aria-hidden="true" />
            </SzenenKnopf>
            <SzenenKnopf label={t.naeher} onClick={() => animiereZu({ zoom: Math.min(1.9, kamera.zoom * 1.2) })}>
              <ZoomIn className="size-4" aria-hidden="true" />
            </SzenenKnopf>
            <SzenenKnopf
              label={t.iso}
              onClick={() => {
                const viertel = Math.PI / 2
                const naechstes = Math.round((kamera.yaw - ISO_KAMERA.yaw) / viertel) * viertel + ISO_KAMERA.yaw
                animiereZu({ yaw: naechstes, elev: ISO_KAMERA.elev, zoom: 1 })
              }}
            >
              <Box className="size-4" aria-hidden="true" />
            </SzenenKnopf>
          </div>
          <p className="text-muted-foreground pointer-events-none absolute bottom-3 left-4 text-xs">{t.hilfe}</p>
        </div>

        <aside aria-live="polite" className="bg-card flex flex-col gap-5 rounded-3xl p-5 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 text-xs font-medium" style={{ color: FARBE[gewaehlt.signal.zustand] }}>
              <span className="size-2 rounded-full" style={{ background: FARBE[gewaehlt.signal.zustand] }} aria-hidden="true" />
              {t.zustand[gewaehlt.signal.zustand]}
            </span>
            <h3 className="font-sans text-lg font-semibold tracking-tight">{gewaehlt.label[sprache]}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{gewaehlt.aufgabe[sprache]}</p>
          </div>

          <div className="flex flex-col">
            <span className="text-primary font-sans text-3xl font-semibold tabular-nums">{gewaehlt.signal.wert}</span>
            <span className="text-muted-foreground text-sm">{gewaehlt.signal.zeile}</span>
          </div>

          {gewaehlt.signal.punkte.length > 0 && (
            <ul className="flex flex-col gap-1.5 text-sm">
              {gewaehlt.signal.punkte.map((p) => (
                <li key={p} className="bg-background rounded-2xl px-3 py-2 leading-relaxed text-pretty">
                  {p}
                </li>
              ))}
            </ul>
          )}

          {gewaehlt.id === GEHIRN ? (
            <FadenListe titel={t.gehirn} eintraege={knoten.filter((n) => n.id !== GEHIRN).map((n) => ({ id: n.id, text: n.label[sprache], farbe: FARBE[n.signal.zustand] }))} onWahl={setAuswahl} />
          ) : (
            <>
              {rein.length > 0 && (
                <FadenListe titel={t.rein} eintraege={rein.map((f) => ({ id: f.von, text: `${nachId.get(f.von)!.label[sprache]} · ${f.was[sprache]}` }))} onWahl={setAuswahl} />
              )}
              {raus.length > 0 && (
                <FadenListe titel={t.raus} eintraege={raus.map((f) => ({ id: f.nach, text: `${nachId.get(f.nach)!.label[sprache]} · ${f.was[sprache]}` }))} onWahl={setAuswahl} />
              )}
            </>
          )}

          {gewaehlt.signal.wege.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {gewaehlt.signal.wege.map((w) => (
                <Link key={w.href} href={w.href} className="bg-background hover:text-primary rounded-full px-3 py-1.5 text-xs font-medium transition-colors">
                  {w.label}
                </Link>
              ))}
            </div>
          )}

          {gewaehlt.id !== GEHIRN && (
            <Link
              href={gewaehlt.href}
              prefetch={false}
              className="bg-primary text-primary-foreground mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            >
              {t.oeffnen}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </aside>
      </div>
    </section>
  )
}

function SzenenKnopf({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="text-muted-foreground hover:text-primary hover:bg-card inline-flex size-8 items-center justify-center rounded-full transition-colors"
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  )
}

function FadenListe({
  titel,
  eintraege,
  onWahl,
}: {
  titel: string
  eintraege: { id: KnotenId; text: string; farbe?: string }[]
  onWahl: (id: KnotenId) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">{titel}</span>
      <ul className="flex flex-col gap-1">
        {eintraege.map((e) => (
          <li key={`${e.id}-${e.text}`}>
            <button
              type="button"
              onClick={() => onWahl(e.id)}
              className="hover:text-primary flex w-full items-center gap-2 rounded-xl px-1 py-1 text-left text-sm transition-colors"
            >
              <span className="size-1.5 shrink-0 rounded-full" style={{ background: e.farbe ?? "var(--primary)" }} aria-hidden="true" />
              <span className="text-pretty">{e.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
