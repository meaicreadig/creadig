"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { WHATSAPP_LINK, WHATSAPP_NUMBER } from "@/lib/dictionary"

export function StickyWhatsApp() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.6)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Per WhatsApp schreiben — ${WHATSAPP_NUMBER}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="group border-line-strong bg-background/90 hover:border-gold fixed bottom-5 left-5 z-40 flex items-center gap-0 overflow-hidden border px-4 py-3 backdrop-blur-xl transition-colors duration-500 md:bottom-8 md:left-8"
        >
          <WhatsAppIcon className="size-4 shrink-0 text-gold" />
          <span className="max-w-0 overflow-hidden text-[0.75rem] tracking-[0.1em] whitespace-nowrap text-foreground uppercase transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:ml-2.5 group-hover:max-w-[9rem]">
            WhatsApp
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
