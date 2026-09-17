"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { AdminField, AdminInput } from "@/components/admin/primitives"
import type { AdminTexte } from "@/lib/admin-i18n"

/**
 * Anmeldeformular.
 *
 * ---------------------------------------------------------------------------
 * EINE FEHLERMELDUNG FÜR ALLE RATEERGEBNISSE
 * Falsches Passwort, leeres Feld, kaputte Anfrage — der Text ist immer
 * derselbe. Wer unterscheidet, hilft beim Durchprobieren. Eigene Antworten
 * bekommen nur Zustände, die KEIN Rateergebnis sind: ausgeschöpftes
 * Versuchsfenster, nicht eingerichtete Umgebung — und (ADM-02 · A02) alles,
 * was am Netz oder am Server liegt.
 *
 * ---------------------------------------------------------------------------
 * ADM-02 · A02 (17.09.2026) — ENDLICH UND EHRLICH
 * Vorher: kein Zeitlimit (ein hängendes Netz ließ „Wird geprüft …" für immer
 * stehen), Zeitüberschreitung und Netzfehler lasen sich wie ein falsches
 * Passwort, und nach erfolgreicher Anmeldung stand während der Navigation
 * weiter „Wird geprüft …" — obwohl nichts mehr geprüft wurde.
 *
 * Jetzt: 10 s Zeitlimit; offline, Zeitüberschreitung und Serverstörung haben
 * eigene Texte und behalten das eingegebene Passwort; nach dem Erfolg heißt
 * der Zustand „Angemeldet — Übersicht wird geladen …".
 *
 * `router.refresh()` nach dem Erfolg ist nicht optional: Ohne ihn bedient der
 * Client-Cache die Zielseite aus der Zeit vor der Anmeldung.
 */
const ZEITLIMIT_MS = 10_000

type Phase = "bereit" | "pruefen" | "weiter"
type Fehler = "ungueltig" | "zu-viele" | "nicht-eingerichtet" | "zeitueberschreitung" | "offline" | "stoerung"

export function AdminLoginForm({ texte }: { texte: AdminTexte["login"] }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<Fehler | null>(null)
  const [phase, setPhase] = useState<Phase>("bereit")
  const busy = phase !== "bereit"

  return (
    <form
      /*
       * `method="post"` obwohl das Absenden über `fetch` läuft.
       *
       * Solange React nicht geladen ist, kennt der Browser den `onSubmit`
       * nicht und sendet das Formular auf seinem eigenen Weg — und der ist
       * ohne `method` ein GET auf die aktuelle Adresse. Dann steht das
       * Administrationspasswort im Adressfeld: im Verlauf des Browsers, im
       * Referrer der nächsten Anfrage und in jedem Zugriffsprotokoll auf dem
       * Weg dorthin.
       *
       * Nachgemessen am 03.09.2026, als eine Prüfung vor der Hydration
       * absendete:
       *
       *   GET /admin/login?password=… 200
       *
       * Mit `method="post"` steht dasselbe im Rumpf statt in der Adresse.
       * Angemeldet wird man ohne JavaScript weiterhin nicht — aber ein
       * fehlgeschlagener Anmeldeversuch hinterlässt kein Passwort in Logs,
       * die niemand für vertraulich hält.
       */
      method="post"
      className="mt-8 flex flex-col gap-6"
      data-phase={phase}
      onSubmit={async (event) => {
        event.preventDefault()
        if (busy) return
        setError(null)

        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          setError("offline")
          return
        }

        setPhase("pruefen")
        const abbruch = new AbortController()
        const uhr = setTimeout(() => abbruch.abort(), ZEITLIMIT_MS)
        let response: Response | null = null
        let fehler: Fehler | null = null
        try {
          response = await fetch("/api/admin/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
            signal: abbruch.signal,
          })
        } catch (e) {
          fehler = e instanceof DOMException && e.name === "AbortError"
            ? "zeitueberschreitung"
            : navigator.onLine === false ? "offline" : "stoerung"
        } finally {
          clearTimeout(uhr)
        }

        if (response?.ok) {
          setPhase("weiter")
          router.replace("/admin")
          router.refresh()
          return
        }

        if (!fehler && response) {
          if (response.status === 429) fehler = "zu-viele"
          else if (response.status === 404) fehler = "nicht-eingerichtet"
          else if (response.status >= 500 || response.status === 403) fehler = "stoerung"
          else fehler = "ungueltig"
        }

        setPhase("bereit")
        /* Nur ein Rateergebnis leert das Feld — an Netz oder Server hat der Mensch nichts falsch gemacht. */
        if (fehler === "ungueltig") setPassword("")
        setError(fehler ?? "stoerung")
      }}
    >
      <AdminField label={texte.passwort} htmlFor="password">
        <AdminInput
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          autoFocus
          required
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            setError(null)
          }}
          aria-invalid={error ? true : undefined}
        />
      </AdminField>

      {error && (
        <p role="alert" className="border-destructive/40 text-destructive border-s-2 py-1 ps-4 text-sm">
          {texte.fehler[error]}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="cta-outline px-7 py-3.5 text-sm tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
      >
        {phase === "pruefen" ? texte.pruefen : phase === "weiter" ? texte.weiter : texte.anmelden}
      </button>
    </form>
  )
}
