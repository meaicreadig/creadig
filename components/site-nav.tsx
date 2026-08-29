"use client"

import { useEffect, useState } from "react"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useLocale } from "@/components/locale-provider"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { MoonIcon } from "@/components/ui/moon-icon"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Logo } from "@/components/brand/logo"
import { mainNavLinks } from "@/lib/site-data"
import { localePath, splitLocale } from "@/lib/routes"
import { WHATSAPP_LINK } from "@/lib/dictionary"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

/**
 * Framer-Motion auf next/link: `motion.a` haette die Seitenlinks als harte
 * <a> gerendert und damit bei jedem Menue-Klick die ganze Seite neu geladen.
 * Ausserhalb der Komponente definiert, damit der Typ nicht bei jedem Render
 * neu entsteht (sonst remountet das Menue).
 */
const MotionLink = motion.create(Link)

/**
 * Ist dieser Menuepunkt der aktuelle Bereich?
 *
 * Nicht nur exakte Gleichheit: /produkte/meai liegt in „Produkte", und die
 * Leiste muss das zeigen — sonst steht der Besucher auf einer Unterseite und
 * die Navigation behauptet, er sei nirgends.
 */
function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * GROW-1 — der Sprachschalter navigiert jetzt, statt einen Zustand zu kippen.
 *
 * Vorher tauschte er nur das Wörterbuch im Browser; die Adresse blieb
 * dieselbe. Ein türkischer Link war damit nicht weiterzugeben. Jetzt führt er
 * auf dieselbe Seite in der anderen Sprache — `/leistungen` <-> `/tr/leistungen` —
 * und die Sprache steht damit dort, wo man sie kopieren kann.
 *
 * Anker und Suchparameter bleiben erhalten: Wer aus `/leistungen#pakete`
 * heraus umschaltet, landet auf `/tr/leistungen#pakete` und nicht oben.
 */
function useLanguageSwitch() {
  const router = useRouter()
  const pathname = usePathname()
  const { path } = splitLocale(pathname)

  return (next: "de" | "tr") => {
    const target = localePath(path, next)
    const hash = typeof window !== "undefined" ? window.location.hash : ""
    const query = typeof window !== "undefined" ? window.location.search : ""
    router.push(`${target}${query}${hash}`)
  }
}

export function SiteNav() {
  const { theme, toggleTheme } = useTheme()
  const { locale, t } = useLocale()
  const switchLanguage = useLanguageSwitch()
  // Der Menuepunkt-Vergleich laeuft auf dem deutschen Basispfad, sonst waere
  // auf /tr/... nie etwas aktiv.
  const { path: pathname } = splitLocale(usePathname())
  const reduceMotion = usePrefersReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Das mobile Menü darf nicht offen bleiben, wenn auf Desktop-Breite gewechselt wird.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)")
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false)
    }
    desktop.addEventListener("change", onChange)
    return () => desktop.removeEventListener("change", onChange)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-[var(--dur-2)] ease-brand",
        scrolled
          ? "border-b border-line bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      {/*
        Raster identisch zu jeder Sektion (max-w-[100rem] · px-6 / md:px-10 /
        lg:px-16). Vorher lag die Leiste auf 88rem/px-10 und lief damit ueber
        einem anderen Raster als der Seiteninhalt — das Logo sass sichtbar
        weiter innen als die Headline darunter.
      */}
      <div className="section-gutter flex h-[4.5rem] items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label="creaDIG — zur Startseite">
          <Logo variant="auto" className="h-[1.3rem] md:h-[1.55rem]" priority />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-8 lg:flex">
          {mainNavLinks.map((link) => {
            const active = isActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                title={t.nav.hints[link.labelKey as keyof typeof t.nav.hints]}
                className={cn(
                  "group relative py-1 text-sm tracking-wide transition-colors duration-[var(--dur-1)] hover:text-foreground",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {t.nav[link.labelKey]}
                {/* Die Gold-Linie zeigt im Ruhezustand, wo man ist — und beim
                    Hover, wo man hinkaeme. Dieselbe Bewegung, zwei Rollen. */}
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-[var(--dur-2)] ease-brand group-hover:w-full",
                    active ? "w-full" : "w-0",
                  )}
                />
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <ToggleGroup
            type="single"
            value={locale}
            onValueChange={(value) => value && switchLanguage(value as "de" | "tr")}
            aria-label={t.nav.language}
            className="hidden divide-x divide-line-strong border-0 sm:flex"
          >
            <ToggleGroupItem
              value="de"
              aria-label="Deutsch"
              className="h-9 rounded-none border-0 bg-transparent eyebrow px-2 text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground"
            >
              DE
            </ToggleGroupItem>
            <ToggleGroupItem
              value="tr"
              aria-label="Türkçe"
              className="h-9 rounded-none border-0 bg-transparent eyebrow px-2 text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground"
            >
              TR
            </ToggleGroupItem>
          </ToggleGroup>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={t.nav.theme}
            className="text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            {theme === "light" ? <MoonIcon className="size-[1.15rem]" /> : <Sun />}
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            // In der Leiste traegt WhatsApp Marken-Gold statt Grau — es ist der
            // schnellste Weg zu uns und darf sich vom Rest der Leiste abheben.
            className="text-gold-text hover:bg-transparent hover:text-foreground"
          >
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp — creaDIG schreiben"
            >
              <WhatsAppIcon className="size-5" />
            </a>
          </Button>

          {/*
            MP10-2.6 — der Kopfzeilen-Knopf fuehrt zum Abschluss, nicht zur
            Kontaktliste. „Projekt starten" hiess bisher: Seite mit vier
            Absichten, darunter ein Formular. Jetzt heisst es, was es sagt.
          */}
          {/*
            Ohne Fuellung — wie `MagneticButton` (28.08.2026). Der Knopf in
            der Kopfzeile MUSS dieselbe Sprache sprechen wie der im Hero;
            ein gefuellter Knopf oben und ein Umriss 200 Pixel darunter
            waeren zwei Marken auf einem Bildschirm.
          */}
          <Link
            href="/termin"
            className="cta-outline eyebrow ml-1.5 hidden items-center px-6 py-3 sm:inline-flex"
          >
            {t.nav.cta}
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t.nav.menu}
                className="text-foreground hover:bg-transparent lg:hidden"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="top"
              className="h-dvh border-0 bg-background p-0 [&>button]:top-7 [&>button]:right-6"
            >
              <SheetHeader className="h-[4.5rem] justify-center px-6 py-0">
                <SheetTitle className="text-left">
                  <Logo variant="auto" className="h-[1.3rem]" />
                  <span className="sr-only">creaDIG</span>
                </SheetTitle>
              </SheetHeader>

              <nav aria-label="Mobile Navigation" className="flex flex-col px-6 pt-6">
                {mainNavLinks.map((link, index) => {
                  const hint = t.nav.hints[link.labelKey as keyof typeof t.nav.hints]
                  const linkClassName =
                    "text-display border-b border-line py-5 text-3xl text-foreground"
                  const linkBody = (
                    <>
                      {t.nav[link.labelKey]}
                      {hint && (
                        <span className="text-muted-foreground type-small mt-1.5 block text-pretty">
                          {hint}
                        </span>
                      )}
                    </>
                  )

                  return (
                    <SheetClose asChild key={link.href}>
                      {reduceMotion ? (
                        <Link
                          href={link.href}
                          aria-current={isActive(pathname, link.href) ? "page" : undefined}
                          className={linkClassName}
                        >
                          {linkBody}
                        </Link>
                      ) : (
                        <MotionLink
                          href={link.href}
                          aria-current={isActive(pathname, link.href) ? "page" : undefined}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.06 * index + 0.1, duration: 0.5 }}
                          className={linkClassName}
                        >
                          {linkBody}
                        </MotionLink>
                      )}
                    </SheetClose>
                  )
                })}
                {/*
                  Hier stand „Zertifizierungen" als Vertrauens-Baustein. Der
                  Anker, auf den er zeigte, gibt es nicht mehr: Alle vier
                  Eintraege waren unbelegt und sind entfernt (V2-5 · §9.9).
                  Ein Menuepunkt auf einen leeren Anker ist ein Versprechen,
                  das beim ersten Klick bricht.
                */}
              </nav>

              <div className="flex flex-col gap-3 px-6 pt-10">
                <SheetClose asChild>
                  <Link
                    href="/termin"
                    className="cta-outline flex items-center justify-center px-6 py-4 text-sm tracking-wide"
                  >
                    {t.nav.cta}
                  </Link>
                </SheetClose>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-line-strong px-6 py-4 text-sm tracking-wide text-foreground"
                >
                  <WhatsAppIcon className="size-5" /> WhatsApp
                </a>
                <Separator className="mt-4" />
                <ToggleGroup
                  type="single"
                  value={locale}
                  onValueChange={(value) => value && switchLanguage(value as "de" | "tr")}
                  aria-label={t.nav.language}
                  className="mt-1 justify-start border-0"
                >
                  <ToggleGroupItem
                    value="de"
                    className="rounded-none border-0 bg-transparent eyebrow px-3 text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground"
                  >
                    Deutsch
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="tr"
                    className="rounded-none border-0 bg-transparent eyebrow px-3 text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground"
                  >
                    Türkçe
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
