"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Menu, MoonStar, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useLocale } from "@/components/locale-provider"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
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
import { navLinks } from "@/lib/site-data"
import { WHATSAPP_LINK } from "@/lib/dictionary"
import { cn } from "@/lib/utils"

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
      <div className="mx-auto flex h-[4.5rem] max-w-[88rem] items-center justify-between gap-6 px-6 lg:px-10">
        <a
          href="#top"
          className="text-display text-2xl tracking-tight text-foreground"
          aria-label="creaDIG — zur Startseite"
        >
          crea<span className="text-gold">DIG</span>
        </a>

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="group relative py-1 text-[0.8125rem] tracking-wide text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              {t.nav[link.labelKey]}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
            </a>
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
              className="h-9 rounded-none border-0 bg-transparent px-2 text-[0.6875rem] tracking-[0.14em] text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground"
            >
              DE
            </ToggleGroupItem>
            <ToggleGroupItem
              value="tr"
              aria-label="Türkçe"
              className="h-9 rounded-none border-0 bg-transparent px-2 text-[0.6875rem] tracking-[0.14em] text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground"
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
            {theme === "light" ? <MoonStar /> : <Sun />}
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-transparent hover:text-gold"
          >
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp — creaDIG schreiben"
            >
              <WhatsAppIcon className="size-4" />
            </a>
          </Button>

          <a
            href="#kontakt"
            className="group relative ml-1.5 hidden items-center overflow-hidden bg-foreground px-6 py-3 text-[0.75rem] tracking-[0.1em] text-background uppercase sm:inline-flex"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-y-full bg-gradient-to-br from-gold-soft to-gold transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
            />
            <span className="relative z-10 transition-colors duration-500 group-hover:text-[#0a0a0b]">
              {t.nav.cta}
            </span>
          </a>

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
                <SheetTitle className="text-display text-left text-2xl font-normal">
                  crea<span className="text-gold">DIG</span>
                </SheetTitle>
              </SheetHeader>

              <nav aria-label="Mobile Navigation" className="flex flex-col px-6 pt-6">
                {navLinks.map((link, index) => (
                  <SheetClose asChild key={link.id}>
                    <motion.a
                      href={`#${link.id}`}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 * index + 0.1, duration: 0.5 }}
                      className="text-display border-b border-line py-5 text-3xl text-foreground"
                    >
                      {t.nav[link.labelKey]}
                    </motion.a>
                  </SheetClose>
                ))}
              </nav>

              <div className="flex flex-col gap-3 px-6 pt-10">
                <SheetClose asChild>
                  <a
                    href="#kontakt"
                    className="flex items-center justify-center bg-foreground px-6 py-4 text-sm tracking-wide text-background"
                  >
                    {t.nav.cta}
                  </a>
                </SheetClose>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-line-strong px-6 py-4 text-sm tracking-wide text-foreground"
                >
                  <WhatsAppIcon className="size-4" /> WhatsApp
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
                    className="rounded-none border-0 bg-transparent px-3 text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase hover:bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground"
                  >
                    Deutsch
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="tr"
                    className="rounded-none border-0 bg-transparent px-3 text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase hover:bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground"
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
