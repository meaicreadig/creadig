"use client"

import { useEffect, useState } from "react"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import {
  CONSENT_CHANGE_EVENT,
  hasConsent,
  type StoredConsent,
} from "@/lib/consent"

/**
 * GROW-2 / TECH-7 — Messung, an die Einwilligung gehängt.
 *
 * ---------------------------------------------------------------------------
 * WARUM ÜBERHAUPT MESSEN
 * Bis hierher gab es keine einzige Zahl über die eigene Seite: nicht, wie
 * viele Menschen sie öffnen, nicht, wie viele bis zum Formular kommen, nicht,
 * ob eine Anfrage aus Osnabrück oder aus dem Nichts kam. Jede Entscheidung
 * über die Seite war damit eine Meinung. Ohne Messung ist auch der erste Euro
 * Werbung nicht bewertbar — man weiß hinterher nur, dass er weg ist.
 *
 * ---------------------------------------------------------------------------
 * WARUM AUSGERECHNET DIESER DIENST
 * Vercel Web Analytics setzt **keine Cookies** und legt keine
 * geräteübergreifende Kennung an; die Seite läuft ohnehin dort. Das ist die
 * datensparsamste Variante, die ohne zweiten Anbieter zu haben ist — und sie
 * hält die Aussage der Datenschutzerklärung („bewusst schlank gebaut") am
 * Leben, statt sie zu widerlegen.
 *
 * ---------------------------------------------------------------------------
 * TROTZDEM GEFRAGT
 * Cookiefrei heißt nicht einwilligungsfrei: Gemessen wird trotzdem, und die
 * Kategorie `statistics` steht seit dem ersten Tag im Banner — bisher mit dem
 * Satz „Wir setzen derzeit keinen Analyse-Dienst ein". Jetzt tun wir es, also
 * sagt der Satz das, und das Skript lädt **erst** nach ausdrücklicher
 * Zustimmung. Kein Vorab-Laden, kein „berechtigtes Interesse".
 *
 * Widerruf wirkt sofort: Fällt die Einwilligung weg, verschwindet die
 * Komponente und mit ihr das Skript. `CONSENT_VERSION` ist hochgezählt, damit
 * jeder noch einmal gefragt wird, der unter der alten Beschreibung
 * zugestimmt hat — die war zum Zeitpunkt der Zustimmung wahr und ist es
 * jetzt nicht mehr.
 *
 * ---------------------------------------------------------------------------
 * TECH-7 — WARUM SPEED INSIGHTS DANEBEN STEHT
 * Web Analytics sagt, WIE VIELE eine Seite geöffnet haben. Es sagt nicht, ob
 * die Seite dabei schnell war. Genau das ist hier die offene Flanke: Diese
 * Seite trägt große Bilder, Parallaxe und framer-motion — Dinge, die im
 * Labor-Test (Lighthouse auf einem Entwicklerrechner) gut aussehen und auf
 * einem Mobilgerät im Netz eines Handwerkers nicht. Speed Insights misst
 * die Web Vitals ECHTER Aufrufe statt eines Laborlaufs, und erst damit ist
 * eine Aussage über die Geschwindigkeit der Seite mehr als eine Vermutung.
 *
 * Es hängt an derselben Kategorie und derselben Einwilligung: Auch
 * Vitals-Messwerte tragen IP und Seitenpfad, also gilt hier nichts anderes
 * als für die Reichweitenmessung. Ohne Zustimmung wird kein Skript geladen.
 */
export function GatedAnalytics() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    setAllowed(hasConsent("statistics"))

    function onChange(event: Event) {
      const detail = (event as CustomEvent<StoredConsent>).detail
      setAllowed(detail?.statistics === true)
    }

    window.addEventListener(CONSENT_CHANGE_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange)
  }, [])

  if (!allowed) return null

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
