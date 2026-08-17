"use client"

import { useRef } from "react"
import Image from "next/image"
import { ArrowUpRight, MapPin } from "lucide-react"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { address, addressLines } from "@/lib/site-data"

/**
 * Karten-Suche statt eingebetteter Karte: ein normaler Link lädt kein
 * Drittanbieter-Skript und braucht darum keine Consent-Abfrage.
 */
const MAP_HREF =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(`${address.venue}, ${address.street}, ${address.postalCode} ${address.city}`)

/**
 * Die Bildebene ist höher als ihr Rahmen und wird innerhalb dieses Überstands
 * verschoben — so bleibt beim Parallax nie ein Rand sichtbar.
 * Überstand oben/unten je 10 %, Bewegung ±7 % der Ebene (= ±8,4 % des Rahmens).
 */
const LAYER_OVERHANG = "-top-[10%] h-[120%]"
const SHIFT = ["-7%", "7%"]

/** Ersatzfläche, solange das Foto fehlt — Signatur-Mesh statt kaputtem <img>. */
function PhotoPlaceholder() {
  return (
    <div aria-hidden="true" className="bg-surface triangle-mesh absolute inset-0">
      <div className="flex h-full items-center justify-center">
        <span className="border-gold/40 text-gold flex size-24 items-center justify-center border">
          <MapPin className="size-9" strokeWidth={1.25} />
        </span>
      </div>
    </div>
  )
}

export function LocationParallax({ photoSrc }: { photoSrc: string | null }) {
  const { t } = useLocale()
  const frameRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  // Fortschritt, während der Rahmen durchs Fenster läuft: 0 = tritt unten ein,
  // 1 = verlässt oben. Scroll-gekoppelt und nur auf `transform` gelegt.
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], SHIFT)

  return (
    <section id="standort" aria-labelledby="standort-title" className="border-line border-b">
      <div
        ref={frameRef}
        className="relative h-[clamp(22rem,58vh,30rem)] w-full overflow-hidden md:h-[clamp(28rem,72vh,44rem)]"
      >
        {/* Bildebene: bei `prefers-reduced-motion` steht sie einfach still. */}
        {reduce ? (
          <div className={`absolute inset-x-0 ${LAYER_OVERHANG}`}>
            {photoSrc ? (
              <Image
                src={photoSrc}
                alt={t.location.photoAlt}
                fill
                sizes="100vw"
                quality={85}
                className="object-cover"
              />
            ) : (
              <PhotoPlaceholder />
            )}
          </div>
        ) : (
          <motion.div
            style={{ y, willChange: "transform" }}
            className={`absolute inset-x-0 ${LAYER_OVERHANG}`}
          >
            {photoSrc ? (
              <Image
                src={photoSrc}
                alt={t.location.photoAlt}
                fill
                sizes="100vw"
                quality={85}
                className="object-cover"
              />
            ) : (
              <PhotoPlaceholder />
            )}
          </motion.div>
        )}

        {/* Heller Schleier — hält die Schrift lesbar, ohne die Seite abzudunkeln. */}
        <div
          aria-hidden="true"
          className="from-background via-background/45 absolute inset-0 bg-gradient-to-t to-transparent"
        />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[100rem] px-6 pb-10 md:px-10 md:pb-14 lg:px-16">
            <Reveal className="border-line bg-background/90 max-w-xl border p-7 backdrop-blur-sm md:p-9">
              <span aria-hidden="true" className="bg-gold block h-px w-10" />
              <p className="eyebrow text-gold mt-5">{t.location.eyebrow}</p>

              <h2
                id="standort-title"
                className="type-h3 mt-4 text-balance"
              >
                {address.venue}
              </h2>

              <address className="text-foreground/85 mt-4 text-[0.9375rem] leading-relaxed not-italic">
                {addressLines.slice(1).map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>

              <p className="text-muted-foreground mt-5 text-[0.9375rem] leading-relaxed text-pretty">
                {t.location.note}
              </p>

              <a
                href={MAP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-deep group mt-6 inline-flex items-center gap-2 text-sm font-medium transition-colors"
              >
                {t.location.mapLink}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
