import type { ReactNode } from "react"
import { UngespeichertWache } from "@/components/admin/ungespeichert-wache"
import { AdminLogout } from "@/components/admin/admin-logout"
import { AdminNav, type NavItem } from "@/components/admin/admin-nav"
import { SprachUmschalter } from "@/components/admin/sprach-umschalter"
import { cookies } from "next/headers"
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { darfBetreten } from "@/lib/rollen"

/*
 * Die Ziel-Informationsarchitektur (docs/admin-os/program.md) — nur Bereiche,
 * hinter denen heute eine Fläche mit Quelle liegt. Verbindungen, Berichte und
 * Automationen erscheinen, wenn sie gebaut sind, nicht vorher.
 * Routen bleiben, wo sie sind; die Karte alter Adressen steht im Ledger (A4).
 */
const NAV = [
  { key: "uebersicht", href: "/admin" },
  { key: "anfragen", href: "/admin/vertrieb/anfragen" },
  { key: "kunden", href: "/admin/kunden" },
  { key: "vertrieb", href: "/admin/vertrieb" },
  { key: "nachweise", href: "/admin/beleg" },
  { key: "verbindungen", href: "/admin/verbindungen" },
  { key: "automationen", href: "/admin/automationen" },
  { key: "veroeffentlichungen", href: "/admin/veroeffentlichungen" },
  { key: "system", href: "/admin/material" },
] as const

/**
 * ADM-01 — die Hülle jeder Admin-Seite.
 *
 * Zweisprachig (DE/TR über `adminSprachKontext`), und die Navigation zeigt
 * nur, was die Rolle betreten darf (`darfBetreten`): Ein Menüpunkt, der beim
 * Klick umleitet, ist eine Lüge über den eigenen Zugang. Die Sperre selbst
 * bleibt in Middleware und Actions — das hier ist Sichtbarkeit, keine
 * Autorisierung.
 */
export async function AdminShell({
  title,
  lead,
  meta,
  children,
}: {
  title: string
  lead?: string
  meta?: ReactNode
  children: ReactNode
}) {
  const { sprache, t } = await adminSprachKontext()
  const { rolle } = await verifySession((await cookies()).get(ADMIN_COOKIE)?.value)
  const items: NavItem[] = NAV.filter((n) => darfBetreten(rolle, n.href)).map((n) => ({
    href: n.href,
    label: t.nav[n.key].label,
    hint: t.nav[n.key].hint,
  }))
  const umschalter = (
    <SprachUmschalter
      aktuell={sprache}
      label={t.sprache.umschalterLabel}
      namen={{ de: { kurz: "DE", name: "Deutsch" }, tr: { kurz: "TR", name: "Türkçe" } }}
    />
  )

  return (
    <div className="bg-background text-foreground min-h-dvh">
      {/* ADM-07 · A28 — eine Wache für jedes Formular dieser Oberfläche. */}
      <UngespeichertWache frage={t.shell.ungespeichert} />
      <a
        href="#arbeitsflaeche"
        className="sr-only focus:not-sr-only focus:bg-background focus:text-foreground focus:border-gold focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:border focus:px-5 focus:py-3 focus:text-sm"
      >
        {t.shell.springen}
      </a>

      <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
        <nav
          aria-label={t.shell.navLabel}
          /*
            ADM-06 · H22 — DIE SEITENLEISTE SCROLLT, WENN SIE NICHT PASST.

            Gemessen 17.09.2026 (Kernschleifen-E2E, 1280×720): Mit acht
            Bereichen reichte die Liste bis unter den unteren Rand, und der
            Abmelden-Knopf im `mt-auto`-Block lag ausserhalb des sichtbaren
            Bereichs — `lg:h-dvh` ohne Ueberlauf schneidet ihn ab. Wer sich
            nicht abmelden kann, hat ein Sicherheitsproblem, kein Layoutproblem.

            Der Fehler wächst mit der Navigation: Jeder neue Bereich bringt
            ihn früher. Deshalb scrollt die Leiste jetzt, statt zu schneiden.
          */
          className="border-line bg-surface flex flex-col gap-4 border-b px-4 py-4 sm:px-6 lg:sticky lg:top-0 lg:h-dvh lg:gap-6 lg:overflow-y-auto lg:border-r lg:border-b-0 lg:px-5 lg:py-7"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow text-gold-text">creaDIG</p>
              <p className="text-subhead mt-1 text-base">{t.shell.produkt}</p>
            </div>
            <div className="lg:hidden">{umschalter}</div>
          </div>

          <AdminNav items={items} oeffnen={t.shell.menueOeffnen} schliessen={t.shell.menueSchliessen} />

          <div className="border-line mt-auto hidden flex-col gap-3 border-t pt-5 lg:flex">
            {umschalter}
            <AdminLogout label={t.shell.abmelden} laeuft={t.shell.abmeldenLaeuft} />
          </div>
        </nav>

        <main id="arbeitsflaeche" tabIndex={-1} className="min-w-0 px-4 py-6 outline-none sm:px-6 lg:px-10 lg:py-10">
          <header className="border-line flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b pb-6">
            <div className="min-w-0">
              <h1 className="type-h3">{title}</h1>
              {lead && <p className="type-small text-muted-foreground mt-2 max-w-2xl text-pretty">{lead}</p>}
            </div>
            {meta && <div className="text-meta text-muted-foreground shrink-0">{meta}</div>}
          </header>

          <div className="mt-8">{children}</div>

          <div className="border-line mt-12 border-t pt-6 lg:hidden">
            <AdminLogout label={t.shell.abmelden} laeuft={t.shell.abmeldenLaeuft} />
          </div>
        </main>
      </div>
    </div>
  )
}
