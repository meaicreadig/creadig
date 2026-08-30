"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

/**
 * Die Menüpunkte des Control Centers.
 *
 * Eigene Datei und `"use client"` aus genau einem Grund: `aria-current` muss
 * wissen, wo man ist. Ohne das ist die Markierung des aktiven Punktes nur
 * eine Farbe — für ein Vorleseprogramm bleibt die Liste dann eine Reihe
 * gleichwertiger Links, und der Nutzer erfährt nie, auf welcher Seite er
 * steht. Die Hülle drumherum bleibt serverseitig.
 */
export type NavItem = { href: string; label: string; hint: string }

export function AdminNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        /* `/admin` ist nur dann aktiv, wenn es GENAU `/admin` ist — sonst
           leuchtet „Heute" auf jeder Unterseite mit. */
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`block rounded-sm px-3 py-2.5 transition-colors duration-[var(--dur-1)] ${
                active ? "bg-muted" : "hover:bg-muted"
              }`}
            >
              <span
                className={`text-subhead block text-sm ${active ? "text-gold-text" : ""}`}
              >
                {item.label}
              </span>
              <span className="text-muted-foreground mt-0.5 block text-xs">{item.hint}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
