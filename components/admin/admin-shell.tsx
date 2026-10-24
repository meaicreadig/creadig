import type { ReactNode } from "react"
import Link from "next/link"
import { Settings, Wallet } from "lucide-react"
import { UngespeichertWache } from "@/components/admin/ungespeichert-wache"
import { Logo } from "@/components/brand/logo"
import { AdminLogout } from "@/components/admin/admin-logout"
import { AdminNav, type NavItem } from "@/components/admin/admin-nav"
import { SprachUmschalter } from "@/components/admin/sprach-umschalter"
import { cookies } from "next/headers"
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { darfBetreten } from "@/lib/rollen"
import { NetzFaden } from "@/components/admin/netz-faden"
import { AssistentDock } from "@/components/admin/assistent-dock"
import { assistentDb } from "@/lib/assistent/store"
import { letzteFaeden } from "@/lib/zentrale/faden-protokoll"
import { KNOTEN, NAV_SCHLUESSEL, type NavSchluessel } from "@/lib/zentrale/netz-karte"

/*
 * Die Ziel-Informationsarchitektur (docs/admin-os/program.md) — nur Bereiche,
 * hinter denen heute eine Fläche mit Quelle liegt. Verbindungen, Berichte und
 * Automationen erscheinen, wenn sie gebaut sind, nicht vorher.
 * Routen bleiben, wo sie sind; die Karte alter Adressen steht im Ledger (A4).
 */
/*
 * Fünf Bereiche statt neun loser Punkte (Gesamtplan, Etappe 1). Keine Route
 * wandert oder verschwindet — nur die Einordnung in der Leiste ändert sich.
 */
/*
 * Schritt 4 (20.10.2026): Das Menü kommt aus der Netz-Karte. Keine Fläche
 * erscheint in der Leiste, die nicht als Knoten am Gehirn hängt.
 */
const NAV = KNOTEN.flatMap((k) =>
  k.nav && (NAV_SCHLUESSEL as readonly string[]).includes(k.id)
    ? [{ key: k.id as NavSchluessel, href: k.href, gruppe: k.nav.gruppe }]
    : [],
)

/*
 * Technik und Hintergrund-Flächen — gemessen 22.10.2026: Website-Prüfer,
 * Automationen, Verbindungen, Nachweise, F&E und Investoren waren nur über
 * direkte Adressen erreichbar. Jetzt stehen sie in einer zugeklappten Gruppe
 * „System“ am Ende der Leiste: auffindbar, ohne die Arbeitsbereiche zu
 * verlängern. Gestörter Betrieb meldet sich weiterhin selbst auf der Übersicht.
 */
const SYSTEM_HREF = "/admin/material"
const SYSTEM_NAV = [
  { key: "webseite", href: "/admin/webseite" },
  { key: "veroeffentlichungen", href: "/admin/veroeffentlichungen" },
  { key: "nachweise", href: "/admin/beleg" },
  { key: "automationen", href: "/admin/automationen" },
  { key: "verbindungen", href: "/admin/verbindungen" },
  { key: "forschung", href: "/admin/forschung" },
  { key: "investoren", href: "/admin/investoren" },
  { key: "system", href: SYSTEM_HREF },
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
  const letzteFaedenStand = await assistentDb()
    .then((q) => letzteFaeden(q))
    .catch(() => ({}) as Record<string, string>)
  const items: NavItem[] = NAV.filter((n) => darfBetreten(rolle, n.href)).map((n) => ({
    href: n.href,
    icon: n.key,
    label: t.nav[n.key].label,
    hint: t.nav[n.key].hint,
    gruppe: t.navGruppen[n.gruppe],
  }))
  for (const s of SYSTEM_NAV) {
    if (darfBetreten(rolle, s.href)) items.push({ href: s.href, icon: s.key, label: t.nav[s.key].label, hint: t.nav[s.key].hint, gruppe: t.navGruppen.system })
  }
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

      <div className="lg:grid lg:min-h-dvh lg:grid-cols-[17rem_1fr]">
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
          className="bg-card flex flex-col gap-4 px-4 py-4 shadow-sm sm:px-6 lg:sticky lg:top-4 lg:m-4 lg:h-[calc(100dvh-2rem)] lg:gap-8 lg:overflow-y-auto lg:rounded-3xl lg:px-5 lg:py-8"
        >
          <div className="flex items-start justify-between gap-3">
            <Link href="/admin" className="flex flex-col gap-3 rounded-xl px-2 outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Logo variant="dark" className="h-6" />
              <span className="text-muted-foreground text-xs font-medium tracking-wide">{t.shell.produkt}</span>
            </Link>
            <div className="lg:hidden">{umschalter}</div>
          </div>

          <AdminNav items={items} oeffnen={t.shell.menueOeffnen} schliessen={t.shell.menueSchliessen} klappGruppe={t.navGruppen.system} />

          {rolle === "owner" && (
            <Link
              href="/finanz"
              prefetch={false}
              className="bg-background hover:text-primary flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors"
            >
              <Wallet aria-hidden="true" className="text-primary size-4" />
              <span className="flex flex-col">
                <span>creaDIG Finanz</span>
                <span className="text-muted-foreground text-xs font-normal">
                  {sprache === "tr" ? "Para, vergi, likidite" : "Geld, Steuern, Liquidität"}
                </span>
              </span>
            </Link>
          )}

          <div className="bg-background mt-auto hidden flex-col gap-3 rounded-2xl p-3 lg:flex">
            <div className="flex items-center justify-between gap-3">
              {umschalter}
              {darfBetreten(rolle, SYSTEM_HREF) && (
                <Link
                  href={SYSTEM_HREF}
                  prefetch={false}
                  title={t.nav.system.label}
                  className="text-muted-foreground hover:text-primary hover:bg-card inline-flex size-9 items-center justify-center rounded-full transition-colors"
                >
                  <Settings aria-hidden="true" className="size-4" />
                  <span className="sr-only">{t.nav.system.label}</span>
                </Link>
              )}
            </div>
            <AdminLogout label={t.shell.abmelden} laeuft={t.shell.abmeldenLaeuft} />
          </div>
        </nav>

        <main id="arbeitsflaeche" tabIndex={-1} className="mx-auto w-full max-w-6xl min-w-0 px-5 py-8 outline-none sm:px-8 lg:px-10 lg:py-12">
          <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div className="flex min-w-0 flex-col gap-2">
              <h1 className="font-sans text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h1>
              {lead && <p className="text-muted-foreground max-w-2xl leading-relaxed text-pretty">{lead}</p>}
            </div>
            {meta && <div className="bg-card text-muted-foreground shrink-0 rounded-full px-4 py-2 text-sm shadow-sm">{meta}</div>}
          </header>

          <NetzFaden sprache={sprache === "tr" ? "tr" : "de"} owner={rolle === "owner"} letzte={letzteFaedenStand} />

          <div className="mt-10">{children}</div>

          <div className="mt-12 lg:hidden">
            <AdminLogout label={t.shell.abmelden} laeuft={t.shell.abmeldenLaeuft} />
          </div>
        </main>
      </div>
      {/* Das Team auf jeder Seite: Fragen an dich + Team-Chat (24.10.2026). */}
      {darfBetreten(rolle, "/admin/assistent") && <AssistentDock />}
    </div>
  )
}
