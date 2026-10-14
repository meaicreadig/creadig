import Link from "next/link"
import { CalendarClock, Compass, Receipt, Settings2, Waves } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { Abmelden } from "@/components/finanz/anmeldung"
import { finanzBasis } from "@/lib/finanz/basis"

export type FinanzBereich = "heute" | "geldfluss" | "belege" | "steuern" | "grundlagen"

const BEREICHE: { key: FinanzBereich; pfad: string; label: string; Icon: typeof Compass }[] = [
  { key: "heute", pfad: "", label: "Heute", Icon: Compass },
  { key: "geldfluss", pfad: "/geldfluss", label: "Geldfluss", Icon: Waves },
  { key: "belege", pfad: "/belege", label: "Belege", Icon: Receipt },
  { key: "steuern", pfad: "/steuern", label: "Steuern", Icon: CalendarClock },
  { key: "grundlagen", pfad: "/grundlagen", label: "Grundlagen", Icon: Settings2 },
]

export async function FinanzShell({
  aktiv,
  titel,
  unterzeile,
  children,
}: {
  aktiv: FinanzBereich
  titel: string
  unterzeile?: string
  children: React.ReactNode
}) {
  const basis = await finanzBasis()
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-background/85 sticky top-0 z-20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link href={basis || "/"} className="flex items-center gap-3" aria-label="creaDIG Finanz – Heute">
            <Logo variant="dark" className="h-5" />
            <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide">
              Finanz
            </span>
          </Link>
          <nav aria-label="Bereiche" className="hidden md:block">
            <ul className="bg-card flex items-center gap-1 rounded-full p-1 shadow-sm">
              {BEREICHE.map(({ key, pfad, label, Icon }) => (
                <li key={key}>
                  <Link
                    href={`${basis}${pfad}` || "/"}
                    aria-current={aktiv === key ? "page" : undefined}
                    className="text-muted-foreground hover:text-foreground aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Abmelden ziel={`${basis}/login`} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 pt-6 pb-28 md:px-8 md:pt-10 md:pb-16">
        <div className="flex flex-col gap-2">
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-balance md:text-4xl">{titel}</h1>
          {unterzeile && <p className="text-muted-foreground max-w-2xl leading-relaxed text-pretty">{unterzeile}</p>}
        </div>
        {children}
      </main>

      <nav aria-label="Bereiche" className="bg-card fixed inset-x-3 bottom-3 z-20 rounded-full p-1 shadow-lg md:hidden">
        <ul className="grid grid-cols-5">
          {BEREICHE.map(({ key, pfad, label, Icon }) => (
            <li key={key}>
              <Link
                href={`${basis}${pfad}` || "/"}
                aria-current={aktiv === key ? "page" : undefined}
                className="text-muted-foreground aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground flex flex-col items-center gap-0.5 rounded-full py-2 text-xs font-medium"
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export function OhneSpeicher() {
  return (
    <p className="bg-card text-muted-foreground rounded-3xl p-6 leading-relaxed">
      Kein Speicher verbunden. creaDIG Finanz braucht die Neon-Datenbank (LEAD_STORE=neon, DATABASE_URL).
    </p>
  )
}
