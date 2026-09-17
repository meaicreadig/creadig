"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export type NavItem = { href: string; label: string; hint: string }

/**
 * Die Hauptnavigation.
 *
 * Aktiv ist der LÄNGSTE passende Eintrag: `/admin/vertrieb/anfragen` gehört
 * zu „Anfragen“, nicht zusätzlich zu „Vertrieb“. `/admin` passt nur exakt.
 *
 * Mobil ist die Liste einklappbar (ADM-01): Vorher standen alle Einträge mit
 * Beschreibung untereinander, bevor die Arbeitsfläche überhaupt begann. Nach
 * einem Seitenwechsel schließt sie sich wieder.
 */
export function AdminNav({
  items,
  oeffnen,
  schliessen,
}: {
  items: NavItem[]
  oeffnen: string
  schliessen: string
}) {
  const pathname = usePathname()
  const [offen, setOffen] = useState(false)
  useEffect(() => setOffen(false), [pathname])

  const passt = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`))
  const aktiv = items
    .filter((i) => passt(i.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  return (
    <div>
      <button
        type="button"
        aria-expanded={offen}
        aria-controls="admin-hauptnavigation"
        onClick={() => setOffen((o) => !o)}
        className="border-line inline-flex min-h-11 items-center gap-2 rounded-sm border px-3 text-sm lg:hidden"
      >
        <span aria-hidden="true">{offen ? "✕" : "☰"}</span>
        {offen ? schliessen : oeffnen}
      </button>
      <ul id="admin-hauptnavigation" className={`${offen ? "mt-3 flex" : "hidden"} flex-col gap-1 lg:mt-0 lg:flex`}>
        {items.map((item) => {
          const active = item.href === aktiv
          return (
            <li key={item.href}>
              <Link
                /* Kein Prefetch: Jede Admin-Seite ist dynamisch und fragt die Datenbank —
                   Vorabladen hiess neun DB-Rundläufe je Seitenaufruf, die meisten verworfen (gemessen 17.09.2026). */
                prefetch={false}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-sm px-3 py-2.5 transition-colors duration-[var(--dur-1)] ${
                  active ? "bg-muted" : "hover:bg-muted"
                }`}
              >
                <span className={`text-subhead block text-sm ${active ? "text-gold-text" : ""}`}>{item.label}</span>
                <span className="text-muted-foreground mt-0.5 block text-xs">{item.hint}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
