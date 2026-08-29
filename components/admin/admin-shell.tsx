import type { ReactNode } from "react"
import Link from "next/link"
import { AdminLogout } from "@/components/admin/admin-logout"

/**
 * MP-G · G.1 — die Hülle des Control Centers.
 *
 * ---------------------------------------------------------------------------
 * EIN MENÜPUNKT, KEIN THEATER
 * MP-G §5 verbietet „zehn Coming-Soon-Menüpunkte", und die Bestandsaufnahme
 * (G.0) hat gezeigt, warum das hier keine theoretische Regel ist: Es gibt
 * keinen Lead-Speicher, keine Kundentabelle, keinen Lesezugriff auf die
 * Messwerte. Ein Menü mit „Sales", „Marketing" und „Kunden" wäre heute ein
 * Menü mit drei leeren Räumen.
 *
 * Also steht hier genau der Punkt, der echte Daten hat. Die Navigation wächst
 * mit den Quellen, nicht mit den Absichten.
 *
 * ---------------------------------------------------------------------------
 * DICHTER ALS DIE WEBSITE, GLEICHE SPRACHE
 * Dieselben Token, dieselbe Kanten-Grammatik, dieselben Schriften — aber
 * engere Abstände und kleinere Typografie. Die öffentliche Seite muss
 * überzeugen; diese hier muss man den ganzen Tag benutzen können.
 */

type NavItem = { href: string; label: string; hint: string }

/**
 * Die Navigation wächst mit den Datenquellen. Nächste Kandidaten und was
 * ihnen fehlt, stehen in `docs/control-center/current-state.md`:
 *   Sales      braucht einen Lead-Speicher (Owner-Entscheidung)
 *   Marketing  braucht Lesezugriff auf die Messwerte
 *   Kunden     braucht ein Kundenmodell
 */
const NAV: NavItem[] = [
  { href: "/admin", label: "Materialstand", hint: "Was fehlt, und wer es liefert" },
]

export function AdminShell({
  title,
  lead,
  meta,
  children,
}: {
  title: string
  lead?: string
  /** Kurze Angabe rechts im Kopf — etwa der Stand der Daten. */
  meta?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <a
        href="#arbeitsflaeche"
        className="sr-only focus:not-sr-only focus:bg-background focus:text-foreground focus:border-gold focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:border focus:px-5 focus:py-3 focus:text-sm"
      >
        Zur Arbeitsfläche springen
      </a>

      <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
        {/* ── Navigation ── */}
        <nav
          aria-label="Control Center"
          className="border-line bg-surface flex flex-col gap-6 border-b px-6 py-5 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0 lg:px-5 lg:py-7"
        >
          <div>
            <p className="eyebrow text-gold-text">creaDIG</p>
            <p className="text-subhead mt-1 text-base">Control Center</p>
          </div>

          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:bg-muted block rounded-sm px-3 py-2.5 transition-colors duration-[var(--dur-1)]"
                >
                  <span className="text-subhead block text-sm">{item.label}</span>
                  <span className="text-muted-foreground mt-0.5 block text-xs">{item.hint}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-line mt-auto hidden border-t pt-5 lg:block">
            <AdminLogout />
          </div>
        </nav>

        {/* ── Arbeitsfläche ── */}
        <main id="arbeitsflaeche" tabIndex={-1} className="min-w-0 px-6 py-8 outline-none lg:px-10 lg:py-10">
          <header className="border-line flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b pb-6">
            <div className="min-w-0">
              <h1 className="type-h3">{title}</h1>
              {lead && (
                <p className="type-small text-muted-foreground mt-2 max-w-2xl text-pretty">{lead}</p>
              )}
            </div>
            {meta && <div className="text-meta text-muted-foreground shrink-0">{meta}</div>}
          </header>

          <div className="mt-8">{children}</div>

          <div className="border-line mt-12 border-t pt-6 lg:hidden">
            <AdminLogout />
          </div>
        </main>
      </div>
    </div>
  )
}
