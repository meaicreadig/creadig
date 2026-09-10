"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Check, ChevronDown, Globe } from "lucide-react"
import { locales } from "@/lib/routes"
import type { Locale } from "@/lib/dictionary"
import { cn } from "@/lib/utils"

/**
 * Wie eine Sprache heisst — im ENDONYM, also so, wie sie sich selbst nennt.
 * Wer nur Tuerkisch liest, findet „Türkçe"; „Turkish" haette ihm nichts
 * genutzt. Deshalb steht hier auch kein Flaggen-Symbol: Eine Flagge ist ein
 * Land, keine Sprache — Deutsch wird in vier Laendern gesprochen, und
 * Arabisch in mehr als zwanzig.
 */
export const LOCALE_NAME: Record<Locale, { short: string; full: string }> = {
  de: { short: "DE", full: "Deutsch" },
  tr: { short: "TR", full: "Türkçe" },
  en: { short: "EN", full: "English" },
  ar: { short: "AR", full: "العربية" },
}

/*
 * ===========================================================================
 * DER SPRACHSCHALTER
 * ===========================================================================
 *
 * Vorher standen vier Kuerzel nebeneinander in der Leiste:
 *
 *   DE  TR  EN  AR
 *
 * Vier Schaltflaechen mit 37 x 36 px, dieselbe Groesse und dieselbe Farbe wie
 * die fuenf Menuepunkte daneben — die Sprachwahl bekam damit so viel Gewicht
 * wie „Leistungen", „Produkte", „Arbeiten", „Unternehmen" und „Insights"
 * zusammen. Und „AR" ist eine lateinische Abkuerzung fuer eine Sprache, die
 * nicht lateinisch schreibt: Wer sie sucht, sucht nach العربية.
 *
 * Jetzt: EIN Knopf, der die aktuelle Sprache im Klartext zeigt, und ein Menue
 * mit den vollen Namen. Aus vier Zielen wird eines — die Leiste bekommt ihre
 * Hierarchie zurueck, und die Sprache steht trotzdem ausgeschrieben da.
 *
 * Tastatur: Pfeile bewegen, Enter/Leertaste waehlt, Escape schliesst und gibt
 * den Fokus an den Knopf zurueck, Tab schliesst. Das ist kein Zusatz — ein
 * Menue, das nur mit der Maus geht, schliesst genau die Leute aus, fuer die
 * die Sprachwahl am wichtigsten ist.
 */
export function LanguageMenu({
  locale,
  label,
  onSelect,
  className,
  align = "end",
}: {
  locale: Locale
  /** Beschriftung fuer Screenreader — „Sprache" in der Sprache der Seite. */
  label: string
  onSelect: (next: Locale) => void
  className?: string
  align?: "start" | "end"
}) {
  const [offen, setOffen] = useState(false)
  const [aktiv, setAktiv] = useState(() => locales.indexOf(locale))
  const wurzel = useRef<HTMLDivElement>(null)
  const knopf = useRef<HTMLButtonElement>(null)
  const listeId = useId()

  /* Klick daneben und Fokus daneben schliessen beides. Nur `mousedown` zu
     behandeln liesse das Menue offen stehen, wenn jemand mit Tab herausgeht. */
  useEffect(() => {
    if (!offen) return
    const zu = (e: Event) => {
      if (!wurzel.current?.contains(e.target as Node)) setOffen(false)
    }
    document.addEventListener("mousedown", zu)
    document.addEventListener("focusin", zu)
    return () => {
      document.removeEventListener("mousedown", zu)
      document.removeEventListener("focusin", zu)
    }
  }, [offen])

  /* Beim Oeffnen steht die aktuelle Sprache unter dem Cursor, nicht die erste. */
  useEffect(() => {
    if (offen) setAktiv(locales.indexOf(locale))
  }, [offen, locale])

  const waehle = (code: Locale) => {
    setOffen(false)
    knopf.current?.focus()
    if (code !== locale) onSelect(code)
  }

  const taste = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      setOffen(false)
      knopf.current?.focus()
      return
    }
    if (!offen && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      setOffen(true)
      return
    }
    if (!offen) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setAktiv((i) => (i + 1) % locales.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setAktiv((i) => (i - 1 + locales.length) % locales.length)
    } else if (e.key === "Home") {
      e.preventDefault()
      setAktiv(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setAktiv(locales.length - 1)
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      waehle(locales[aktiv] as Locale)
    }
  }

  return (
    <div ref={wurzel} className={cn("relative", className)} onKeyDown={taste}>
      <button
        ref={knopf}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={offen}
        aria-controls={offen ? listeId : undefined}
        aria-label={`${label}: ${LOCALE_NAME[locale].full}`}
        onClick={() => setOffen((o) => !o)}
        className="text-muted-foreground hover:text-foreground flex h-11 items-center gap-2 px-2.5 text-sm transition-colors duration-[var(--dur-2)]"
      >
        <Globe className="size-[1.05rem] shrink-0" strokeWidth={1.5} aria-hidden="true" />
        {/* Der Name steht ab `sm` ausgeschrieben; darunter traegt ihn das
            aria-label, damit der Knopf schmal bleibt, ohne stumm zu werden. */}
        <span className="hidden sm:inline">{LOCALE_NAME[locale].full}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 transition-transform duration-[var(--dur-2)] motion-reduce:transition-none",
            offen && "rotate-180",
          )}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      {offen && (
        <ul
          id={listeId}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          className={cn(
            "border-line bg-surface absolute top-full z-50 mt-1 min-w-[11rem] border py-1 shadow-lg",
            align === "end" ? "end-0" : "start-0",
          )}
        >
          {locales.map((code, i) => {
            const gewaehlt = code === locale
            return (
              <li key={code} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={gewaehlt}
                  /* `lang` steht am Eintrag, damit ein Screenreader „العربية"
                     arabisch vorliest und nicht deutsch buchstabiert. */
                  lang={code}
                  onClick={() => waehle(code as Locale)}
                  onMouseEnter={() => setAktiv(i)}
                  className={cn(
                    "flex h-11 w-full items-center justify-between gap-4 px-4 text-start text-sm transition-colors duration-[var(--dur-2)]",
                    aktiv === i ? "bg-muted text-foreground" : "text-muted-foreground",
                    gewaehlt && "text-foreground",
                  )}
                >
                  <span>{LOCALE_NAME[code as Locale].full}</span>
                  {gewaehlt && (
                    <Check className="text-gold-text size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
