"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  Inbox,
  LayoutDashboard,
  Mail,
  Megaphone,
  Menu,
  MessagesSquare,
  Newspaper,
  PenLine,
  Presentation,
  Send,
  Sparkles,
  Gauge,
  Target,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react"

export type NavItem = { href: string; label: string; hint: string; gruppe: string; icon?: string }

const ICONS: Record<string, LucideIcon> = {
  uebersicht: LayoutDashboard,
  assistent: Sparkles,
  bulletin: Newspaper,
  leistung: Gauge,
  verkaufen: Target,
  messen: Presentation,
  gespraech: MessagesSquare,
  termine: CalendarClock,
  anfragen: Inbox,
  vertrieb: TrendingUp,
  kunden: Building2,
  nachweise: BadgeCheck,
  redaktion: PenLine,
  marketing: Megaphone,
  mailstudio: Mail,
  veroeffentlichungen: Send,
}

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

  const gruppen = items.reduce<[string, NavItem[]][]>((acc, item) => {
    const letzte = acc.at(-1)
    if (letzte && letzte[0] === item.gruppe) letzte[1].push(item)
    else acc.push([item.gruppe, [item]])
    return acc
  }, [])

  return (
    <div>
      <button
        type="button"
        aria-expanded={offen}
        aria-controls="admin-hauptnavigation"
        onClick={() => setOffen((o) => !o)}
        className="bg-background inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium lg:hidden"
      >
        {offen ? <X aria-hidden="true" className="size-4" /> : <Menu aria-hidden="true" className="size-4" />}
        {offen ? schliessen : oeffnen}
      </button>
      <div id="admin-hauptnavigation" className={`${offen ? "mt-3 flex" : "hidden"} flex-col gap-5 lg:mt-0 lg:flex`}>
        {gruppen.map(([gruppe, eintraege]) => (
          <div key={gruppe}>
            <p className="text-muted-foreground px-4 pb-2 text-xs font-medium">{gruppe}</p>
            <ul className="flex flex-col gap-1">
              {eintraege.map((item) => {
                const active = item.href === aktiv
                const Icon = item.icon ? ICONS[item.icon] : undefined
                return (
                  <li key={item.href}>
                    <Link
                      /* Kein Prefetch: Jede Admin-Seite ist dynamisch und fragt die Datenbank —
                         Vorabladen hiess neun DB-Rundläufe je Seitenaufruf, die meisten verworfen (gemessen 17.09.2026). */
                      prefetch={false}
                      href={item.href}
                      title={item.hint}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-[var(--dur-1)] ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/75 hover:bg-background hover:text-foreground"
                      }`}
                    >
                      {Icon && (
                        <Icon
                          aria-hidden="true"
                          className={`size-4 shrink-0 ${active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
                        />
                      )}
                      {item.label}
                      <span className="sr-only"> — {item.hint}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
