"use client"

import { useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { motion } from "framer-motion"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { trackEvent } from "@/lib/track"
import { cn } from "@/lib/utils"

/** Ausserhalb der Komponente: sonst entsteht der Typ bei jedem Render neu. */
const MotionLink = motion.create(Link)

type MagneticButtonProps = {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: "primary" | "ghost"
  className?: string
  ariaLabel?: string
  target?: string
  /**
   * MP-B · Wo dieser Knopf steht — „hero", „closing", „paket". Optional: Ohne
   * ihn wird trotzdem gemessen, nur ohne die Ortsangabe.
   */
  trackLocation?: string
}

export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  ariaLabel,
  target,
  trackLocation,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null)
  const reduce = usePrefersReducedMotion()
  const pathname = usePathname()
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  /*
   * MP-B Regel D — EIN Ereignis, Eigenschaften statt Namen.
   *
   * Diese Komponente ist der Hauptknopf der Seite; sie steht an dreizehn
   * Stellen. Genau deshalb sitzt die Messung hier und nicht dort: Dreizehn
   * handgesetzte `onClick`-Tracker waeren dreizehn Gelegenheiten, einen zu
   * vergessen oder anders zu benennen — und am Ende haette man dreizehn
   * Ereignisnamen statt eines mit dreizehn Auspraegungen.
   *
   * Der `cta`-Wert kommt aus dem Ziel, nicht aus dem Beschriftungstext: Der
   * Text ist zweisprachig und aendert sich, das Ziel nicht. Damit ist der
   * Wert sprachunabhaengig und enthaelt nie, was jemand geschrieben hat.
   */
  function handleTracked() {
    const cta = href
      ? href.startsWith("/")
        ? href.replace(/[?#].*$/, "").replace(/^\//, "") || "start"
        : href.startsWith("mailto:")
          ? "email"
          : href.includes("wa.me")
            ? "whatsapp"
            : "extern"
      : "aktion"
    trackEvent("cta_click", { cta, location: trackLocation, page: pathname })
    onClick?.()
  }

  function handleMove(event: React.MouseEvent<HTMLElement>) {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const relX = event.clientX - (rect.left + rect.width / 2)
    const relY = event.clientY - (rect.top + rect.height / 2)
    setOffset({ x: relX * 0.16, y: relY * 0.22 })
  }

  /*
   * OHNE FUELLUNG — Owner-Entscheidung 28.08.2026.
   *
   * ---------------------------------------------------------------------------
   * WAS HIER STAND UND WARUM ES GEHT
   * Der Hauptknopf war eine gefuellte Gold-Flaeche mit Verlauf, dazu ein
   * anthrazitfarbener Vorhang, der bei Hover von oben ueber die ganze Flaeche
   * fuhr. Auf einer Seite, deren gesamte Sprache aus Haarlinien besteht, war
   * das die einzige grosse gefuellte Flaeche ueberhaupt — und damit das
   * lauteste Element der Marke. Ein Haus, das „zeigen statt behaupten" als
   * Regel hat, sollte nicht ausgerechnet den Knopf am lautesten stellen.
   *
   * Jetzt traegt die KANTE die Farbe, nicht die Flaeche. Der Knopf ist ein
   * Rahmen, der sich beim Hover verfaerbt — dieselbe Geste, die die Seite
   * ohnehin ueberall benutzt (Karten, Kacheln, Eyebrow-Linie), nur an der
   * Stelle, an der etwas passiert.
   *
   * ---------------------------------------------------------------------------
   * WARUM `--gold-text` UND NICHT `--gold`
   * Weil der Rahmen jetzt die Hauptsache ist. `--gold` erreicht auf dem
   * Papierweiss nur 2,6 : 1 — unter den 3 : 1, die WCAG 1.4.11 fuer die
   * Umrisse von Bedienelementen verlangt (dieselbe Rechnung steht in
   * `globals.css` beim Fokus-Ring). `--gold-text` haelt 5,26 : 1 hell und
   * 7,50 : 1 dunkel. Solange die Fuellung da war, war das egal; jetzt nicht
   * mehr.
   *
   * Die Hierarchie liegt damit in der Rahmenfarbe: Gold fuehrt, neutral
   * folgt. Zwei Umrisse, ein Unterschied — mehr braucht es nicht.
   */
  const base = cn(
    "group relative inline-flex items-center justify-center gap-2.5",
    // Großzügige Fläche, damit die CTAs neben der riesigen Display-Typo bestehen.
    "px-9 py-5 text-base tracking-wide",
    variant === "primary"
      // Die Marke steht in `globals.css` (`cta-outline`) — nicht hier. Sonst
      // liegt dieselbe Rezeptur wieder an mehreren Stellen und laeuft auseinander.
      ? "cta-outline"
      : "border-line-strong text-muted-foreground hover:border-foreground border bg-transparent transition-colors duration-[var(--dur-2)] ease-brand hover:text-foreground",
    className,
  )

  const inner = (
    <span className="flex items-center gap-2.5">{children}</span>
  )

  const motionProps = {
    onClick: handleTracked,
    onMouseMove: handleMove,
    onMouseLeave: () => setOffset({ x: 0, y: 0 }),
    animate: { x: offset.x, y: offset.y },
    transition: { type: "spring" as const, stiffness: 220, damping: 18, mass: 0.4 },
  }

  if (href) {
    // Interne Ziele ueber next/link: „/#kontakt" als hartes <a> haette von
    // /impressum oder /termin aus die ganze Seite neu geladen, statt zu
    // navigieren. Externe Ziele (mailto:, https://, wa.me) bleiben <a>.
    const internal = href.startsWith("/") && target !== "_blank"
    const Tag = internal ? MotionLink : motion.a
    return (
      <Tag
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
        className={base}
        {...motionProps}
      >
        {inner}
      </Tag>
    )
  }

  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      aria-label={ariaLabel}
      className={base}
      {...motionProps}
    >
      {inner}
    </motion.button>
  )
}
