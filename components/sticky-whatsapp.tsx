"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { WHATSAPP_LINK, WHATSAPP_NUMBER } from "@/lib/dictionary"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

const buttonClassName =
  "group fixed bottom-5 left-5 z-40 flex items-center overflow-hidden rounded-full bg-[#25D366] p-4 text-white elevation-3 transition-all duration-[var(--dur-2)] hover:pr-5 md:bottom-8 md:left-8"

export function StickyWhatsApp() {
  const reduceMotion = usePrefersReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.6)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  if (reduceMotion) {
    return (
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Per WhatsApp schreiben — ${WHATSAPP_NUMBER}`}
        className={buttonClassName}
      >
        <WhatsAppIcon className="size-6 shrink-0" />
        <span className="max-w-0 overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-[var(--dur-2)] ease-brand group-hover:ml-2.5 group-hover:max-w-[9rem]">
          WhatsApp
        </span>
      </a>
    )
  }

  return (
    <AnimatePresence>
      <motion.a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Per WhatsApp schreiben — ${WHATSAPP_NUMBER}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={buttonClassName}
      >
        <WhatsAppIcon className="size-6 shrink-0" />
        <span className="max-w-0 overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-[var(--dur-2)] ease-brand group-hover:ml-2.5 group-hover:max-w-[9rem]">
          WhatsApp
        </span>
      </motion.a>
    </AnimatePresence>
  )
}
