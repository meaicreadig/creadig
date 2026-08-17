"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
import { navLinks } from "@/lib/site-data"
import { WHATSAPP_LINK } from "@/lib/dictionary"
import { cn } from "@/lib/utils"

/**
 * Framer-Motion auf next/link: `motion.a` haette die Seitenlinks als harte
 * <a> gerendert und damit bei jedem Menue-Klick die ganze Seite neu geladen.
 * Ausserhalb der Komponente definiert, damit der Typ nicht bei jedem Render
 * neu entsteht (sonst remountet das Menue).
 */
const MotionLink = motion.create(Link)

export function SiteNav() {
  const { theme, toggleTheme } = useTheme()
  const { locale, t, setLocale } = useLocale()
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
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
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
      <div className="mx-auto flex h-[4.5rem] max-w-[100rem] items-center justify-between gap-6 px-6 md:px-10 lg:px-16">
        <Link href="/#top" className="shrink-0" aria-label="creaDIG — zur Startseite">
          <Logo variant="auto" className="h-[1.3rem] md:h-[1.55rem]" priority />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={`/#${link.id}`}
              className="group relative py-1 text-sm tracking-wide text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              {t.nav[link.labelKey]}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ToggleGroup
            type="single"
            value={locale}
            onValueChange={(value) => value && setLocale(value as "de" | "tr")}
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

          <Link
            href="/#kontakt"
            className="group relative ml-1.5 hidden items-center overflow-hidden bg-gradient-to-br from-gold-soft to-gold eyebrow px-6 py-3 text-[#201e1b] sm:inline-flex"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-y-full bg-[#201e1b] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
            />
            <span className="relative z-10 transition-colors duration-500 group-hover:text-gold-soft">
              {t.nav.cta}
            </span>
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
                {navLinks.map((link, index) => (
                  <SheetClose asChild key={link.id}>
                    <MotionLink
                      href={`/#${link.id}`}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 * index + 0.1, duration: 0.5 }}
                      className="text-display border-b border-line py-5 text-3xl text-foreground"
                    >
                      {t.nav[link.labelKey]}
                    </MotionLink>
                  </SheetClose>
                ))}
                {/* Vertrauens-Baustein: in der Desktop-Leiste kein Platz, hier schon. */}
                <SheetClose asChild>
                  <MotionLink
                    href="/#zertifizierungen"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * navLinks.length + 0.1, duration: 0.5 }}
                    className="text-display border-b border-line py-5 text-3xl text-foreground"
                  >
                    {t.nav.zertifikate}
                  </MotionLink>
                </SheetClose>
              </nav>

              <div className="flex flex-col gap-3 px-6 pt-10">
                <SheetClose asChild>
                  <Link
                    href="/#kontakt"
                    className="flex items-center justify-center bg-gradient-to-br from-gold-soft to-gold px-6 py-4 text-sm tracking-wide text-[#201e1b]"
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
                  onValueChange={(value) => value && setLocale(value as "de" | "tr")}
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
