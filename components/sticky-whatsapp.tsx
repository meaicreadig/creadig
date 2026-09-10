"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { useLocale } from "@/components/locale-provider"
import { whatsappLink, WHATSAPP_NUMBER } from "@/lib/dictionary"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

/*
 * WO DIESE ABKUERZUNG NICHTS ZU SUCHEN HAT.
 *
 * Der Knopf ist eine Abkuerzung zum Gespraech — fuer jemanden, der gerade
 * liest. Auf den Seiten, die selbst das Gespraech sind, konkurriert er mit
 * dem Weg, auf dem der Besucher schon ist. Und er tut es koerperlich:
 *
 * Gemessen am 09.09.2026 auf 390x844 im Terminassistenten: Der Knopf liegt
 * bei x 20-76 / y 782-838, die Schaltflaeche „Frueher Abend 17-19 Uhr" bei
 * x 24-158 / y 778-844. 52 mal 56 Pixel der Zeitwahl liegen darunter — die
 * linke Haelfte samt Beschriftungsanfang.
 *
 * Die Endungen stehen hier ohne Sprachpraefix; geprueft wird das Ende des
 * Pfades, damit /termin, /en/termin und /ar/termin dasselbe bedeuten.
 */
const EIGENE_WEGE = ["/termin", "/kontakt", "/betriebscheck"]

export function StickyWhatsApp() {
  const { t, locale } = useLocale()
  const reduceMotion = usePrefersReducedMotion()
  const pfad = usePathname() ?? ""
  const href = whatsappLink(locale)
  /* Auch die Vorlesehilfe war deutsch — auf jeder tuerkischen Seite. */
  const label = `${t.contact.whatsappAction} — ${WHATSAPP_NUMBER}`
  const [visible, setVisible] = useState(false)
  const [amFuss, setAmFuss] = useState(false)

  /*
   * Arabisch (RTL): Die Hover-Enthuellung mit max-w-0 + physical ml/pr
   * oeffnete eine gruene Kapsel ohne sichtbaren Text — die Glyphen lagen
   * ausserhalb der overflow-Maske. Deshalb: Label dauerhaft sichtbar,
   * logische Abstaende, kurzes „واتساب". Lateinische Locales behalten
   * die kompakte Icon-Form mit Hover-Erweiterung.
   */
  const isAr = locale === "ar"
  const shortLabel = isAr ? "واتساب" : "WhatsApp"
  const buttonClassName = [
    "group fixed bottom-5 start-5 z-40 flex items-center overflow-hidden rounded-full bg-[#25D366] p-4 text-white elevation-3 transition-all duration-[var(--dur-2)] md:bottom-8 md:start-8",
    isAr ? "gap-2.5 pe-5" : "hover:pe-5",
  ].join(" ")
  const textClassName = isAr
    ? "text-sm font-medium whitespace-nowrap"
    : "max-w-0 overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-[var(--dur-2)] ease-brand group-hover:ms-2.5 group-hover:max-w-[9rem]"

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.6)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /*
   * AM FUSS VERSCHWINDET ER.
   *
   * Der Fussbereich traegt seine Verweise links unten — genau dort, wo der
   * Knopf klebt. Auf 390 Pixeln lag er ueber „Unternehmen"; ein verdeckter
   * Verweis ist kein Verweis. Beobachtet wird der Fussbereich selbst, nicht
   * eine gerechnete Hoehe: Der Fuss waechst mit seinem Inhalt.
   */
  useEffect(() => {
    const fuss = document.querySelector("footer")
    if (!fuss || typeof IntersectionObserver === "undefined") return
    const beobachter = new IntersectionObserver(
      ([eintrag]) => setAmFuss(eintrag.isIntersecting),
      { rootMargin: "0px 0px -8px 0px" },
    )
    beobachter.observe(fuss)
    return () => beobachter.disconnect()
  }, [])

  const eigenerWeg = EIGENE_WEGE.some((ende) => pfad === ende || pfad.endsWith(ende))

  if (!visible || amFuss || eigenerWeg) return null

  const inner = (
    <>
      <WhatsAppIcon className="size-6 shrink-0" />
      <span className={textClassName}>{shortLabel}</span>
    </>
  )

  if (reduceMotion) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={buttonClassName}
      >
        {inner}
      </a>
    )
  }

  return (
    <AnimatePresence>
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={buttonClassName}
      >
        {inner}
      </motion.a>
    </AnimatePresence>
  )
}
