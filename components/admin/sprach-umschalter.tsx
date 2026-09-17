"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { ADMIN_SPRACHE_COOKIE, ADMIN_SPRACHEN, type AdminSprache } from "@/lib/admin-i18n/sprache"

/**
 * ADM-01 · Sprache umschalten, ohne den Arbeitskontext zu verlieren.
 *
 * Kein Seitenwechsel, kein Neuladen: Das Cookie wird gesetzt und die
 * Server-Komponenten werden neu gerendert (`router.refresh()`). Adresse,
 * Filter in der URL, ausgewählter Datensatz und alles, was in einem
 * Formular steht, bleiben dabei, wo sie sind.
 */
export function SprachUmschalter({
  aktuell,
  label,
  namen,
}: {
  aktuell: AdminSprache
  label: string
  namen: Record<AdminSprache, { kurz: string; name: string }>
}) {
  const router = useRouter()
  const [laeuft, starte] = useTransition()

  return (
    <div role="group" aria-label={label} className="flex items-center gap-1" data-sprache={aktuell} aria-busy={laeuft}>
      {ADMIN_SPRACHEN.map((s) => (
        <button
          key={s}
          type="button"
          lang={s}
          aria-pressed={s === aktuell}
          title={namen[s].name}
          onClick={() => {
            if (s === aktuell) return
            document.cookie = `${ADMIN_SPRACHE_COOKIE}=${s}; path=/; max-age=31536000; samesite=lax`
            document.documentElement.lang = s
            starte(() => router.refresh())
          }}
          className={`min-h-9 min-w-11 rounded-sm px-2.5 text-xs font-medium tracking-wide transition-colors duration-[var(--dur-1)] ${
            s === aktuell ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <span aria-hidden="true">{namen[s].kurz}</span>
          <span className="sr-only">{namen[s].name}</span>
        </button>
      ))}
    </div>
  )
}
