"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

/**
 * Die Unternavigation des Vertriebsbereichs.
 *
 * ---------------------------------------------------------------------------
 * WARUM „ORGANISATIONEN" HIER NICHT MEHR STEHT
 * Das Kundenregister ist seit dem Abschluss von 1.0 ein eigener Bereich
 * (`/admin/kunden`). Es hier als fuenftes Register stehen zu lassen haette
 * denselben Bestand an zwei Stellen in die Navigation gehaengt — und die
 * haeufigste Frage („mit wem haben wir gearbeitet?") waere weiterhin hinter
 * der selteneren gelegen.
 *
 * ---------------------------------------------------------------------------
 * WARUM NICHT VIER PUNKTE IN DER HAUPTNAVIGATION
 * Übersicht, Anfragen, Pipeline und Beziehungen sind vier Blicke auf
 * denselben Gegenstand — nicht vier Bereiche. Stünden sie links neben
 * Materialstand, wäre der Vertrieb optisch viermal so wichtig wie alles
 * andere, und die Hauptnavigation wäre nach dem nächsten Modul unlesbar.
 *
 * Hier oben stehen sie als das, was sie sind: Register innerhalb einer Akte.
 *
 * ---------------------------------------------------------------------------
 * `aria-current` UND WARUM DIESE DATEI CLIENT IST
 * Ohne `aria-current` ist die Markierung des aktiven Registers nur eine
 * Farbe; ein Vorleseprogramm hört vier gleichwertige Links und erfährt nie,
 * welches offen ist. Dafür braucht es den Pfad, dafür `usePathname` — mehr
 * passiert hier nicht.
 */
const TABS = [
  { href: "/admin/vertrieb", label: "Übersicht" },
  { href: "/admin/vertrieb/anfragen", label: "Anfragen" },
  /* GATE 10 — Recherche steht VOR der Pipeline: Was hier entsteht, wird
     dort erst zur Chance, und die Reihenfolge der Reiter sollte die
     Reihenfolge der Arbeit spiegeln. */
  { href: "/admin/vertrieb/recherche", label: "Recherche" },
  { href: "/admin/vertrieb/pipeline", label: "Pipeline" },
  { href: "/admin/vertrieb/beziehungen", label: "Beziehungen" },
]

export function VertriebNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Vertrieb" className="border-line -mt-2 border-b">
      <ul className="flex flex-wrap gap-x-1">
        {TABS.map((tab) => {
          /* Die Übersicht ist nur bei exakter Übereinstimmung aktiv — sonst
             leuchtet sie auf jedem Unterregister mit. */
          const active =
            tab.href === "/admin/vertrieb"
              ? pathname === "/admin/vertrieb"
              : pathname.startsWith(tab.href)

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`-mb-px block border-b-2 px-3 py-2.5 text-sm transition-colors duration-[var(--dur-1)] ${
                  active
                    ? "border-gold text-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
