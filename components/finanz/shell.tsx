import Link from "next/link"
import { Archive, CalendarClock, Repeat, Calculator, Car, Compass, FileCheck2, FileText, Package, Receipt, Settings, Target, TrendingUp, Waves } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { Abmelden } from "@/components/finanz/anmeldung"
import { finanzBasis } from "@/lib/finanz/basis"

export type FinanzBereich = "heute" | "angebote" | "rechnungen" | "leistungen" | "geldfluss" | "belege" | "ziele" | "steuern" | "ustva" | "bescheide" | "abos" | "pauschalen" | "investment" | "grundlagen"

type Bereich = { key: FinanzBereich; pfad: string; label: string; Icon: typeof Compass }

const GRUPPEN: { titel: string; bereiche: Bereich[] }[] = [
  { titel: "Cockpit", bereiche: [{ key: "heute", pfad: "", label: "Heute", Icon: Compass }] },
  {
    titel: "Aufträge",
    bereiche: [
      { key: "angebote", pfad: "/angebote", label: "Angebote", Icon: FileText },
      { key: "rechnungen", pfad: "/rechnungen", label: "Rechnungen", Icon: FileCheck2 },
      { key: "abos", pfad: "/abos", label: "Wiederkehrend", Icon: Repeat },
      { key: "leistungen", pfad: "/leistungen", label: "Leistungen", Icon: Package },
    ],
  },
  {
    titel: "Geld",
    bereiche: [
      { key: "geldfluss", pfad: "/geldfluss", label: "Geldfluss", Icon: Waves },
      { key: "belege", pfad: "/belege", label: "Belege", Icon: Receipt },
      { key: "ziele", pfad: "/ziele", label: "Ziele", Icon: Target },
    ],
  },
  {
    titel: "Vermögen",
    bereiche: [{ key: "investment", pfad: "/investment", label: "Investment", Icon: TrendingUp }],
  },
  {
    titel: "Finanzamt",
    bereiche: [
      { key: "steuern", pfad: "/steuern", label: "Steuern", Icon: CalendarClock },
      { key: "ustva", pfad: "/steuern/ustva", label: "USt-Voranmeldung", Icon: Calculator },
      { key: "bescheide", pfad: "/bescheide", label: "Bescheide", Icon: Archive },
      { key: "pauschalen", pfad: "/pauschalen", label: "Pauschalen", Icon: Car },
    ],
  },
]

const MOBIL_KEYS: FinanzBereich[] = ["heute", "rechnungen", "geldfluss", "investment", "steuern"]
const MOBIL: Bereich[] = [
  ...GRUPPEN.flatMap((g) => g.bereiche).filter((b) => MOBIL_KEYS.includes(b.key)),
  { key: "grundlagen", pfad: "/grundlagen", label: "Grundlagen", Icon: Settings },
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
  const ziel = (pfad: string) => `${basis}${pfad}` || "/"

  return (
    <div className="bg-background text-foreground min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="bg-card hidden flex-col gap-8 px-5 py-8 shadow-sm lg:sticky lg:top-4 lg:m-4 lg:flex lg:h-[calc(100dvh-2rem)] lg:overflow-y-auto lg:rounded-3xl">
        <Link href={ziel("")} className="flex flex-col gap-3 rounded-xl px-2" aria-label="creaDIG Finanz – Heute">
          <Logo variant="dark" className="h-6" />
          <span className="text-muted-foreground text-xs font-medium tracking-wide">Finanz</span>
        </Link>

        <nav aria-label="Bereiche" className="flex flex-col gap-5">
          {GRUPPEN.map((g) => (
            <div key={g.titel}>
              <p className="text-muted-foreground px-4 pb-2 text-xs font-medium">{g.titel}</p>
              <ul className="flex flex-col gap-1">
                {g.bereiche.map(({ key, pfad, label, Icon }) => {
                  const an = aktiv === key
                  return (
                    <li key={key}>
                      <Link
                        href={ziel(pfad)}
                        aria-current={an ? "page" : undefined}
                        className={`group flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                          an ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/75 hover:bg-background hover:text-foreground"
                        }`}
                      >
                        <Icon aria-hidden className={`size-4 shrink-0 ${an ? "" : "text-muted-foreground group-hover:text-foreground"}`} />
                        {label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="bg-background mt-auto flex flex-col gap-3 rounded-2xl p-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <span className="text-muted-foreground text-xs font-medium">creaDIG Solutions</span>
            <Link
              href={ziel("/grundlagen")}
              aria-current={aktiv === "grundlagen" ? "page" : undefined}
              title="Grundlagen"
              className="text-muted-foreground hover:text-primary hover:bg-card aria-[current=page]:text-primary inline-flex size-9 items-center justify-center rounded-full transition-colors"
            >
              <Settings aria-hidden className="size-4" />
              <span className="sr-only">Grundlagen</span>
            </Link>
          </div>
          <Abmelden ziel={`${basis}/login`} />
        </div>
      </aside>

      <header className="bg-background/85 sticky top-0 z-20 flex items-center justify-between gap-4 px-5 py-4 backdrop-blur lg:hidden">
        <Link href={ziel("")} className="flex items-center gap-3" aria-label="creaDIG Finanz – Heute">
          <Logo variant="dark" className="h-5" />
          <span className="text-muted-foreground text-xs font-medium">Finanz</span>
        </Link>
        <Abmelden ziel={`${basis}/login`} />
      </header>

      <main className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6 px-5 pt-4 pb-28 sm:px-8 lg:px-10 lg:py-9">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-balance md:text-[1.75rem]">{titel}</h1>
          {unterzeile && <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed text-pretty">{unterzeile}</p>}
        </div>
        {children}
      </main>

      <nav aria-label="Bereiche" className="bg-card fixed inset-x-3 bottom-3 z-20 rounded-full p-1 shadow-lg lg:hidden">
        <ul className="grid grid-cols-5">
          {MOBIL.map(({ key, pfad, label, Icon }) => (
            <li key={key}>
              <Link
                href={ziel(pfad)}
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
