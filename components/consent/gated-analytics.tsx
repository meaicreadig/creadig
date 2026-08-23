"use client"

import { useEffect, useState } from "react"
import { Analytics } from "@vercel/analytics/next"
import {
  CONSENT_CHANGE_EVENT,
  hasConsent,
  type StoredConsent,
} from "@/lib/consent"

/**
 * GROW-2 — Reichweitenmessung, an die Einwilligung gehängt.
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

  return <Analytics />
}
