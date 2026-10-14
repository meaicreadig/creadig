"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"

const FEHLER: Record<string, string> = {
  ungueltig: "E-Mail oder Passwort stimmt nicht.",
  "zu-viele": "Zu viele Versuche. Bitte kurz warten.",
  stoerung: "Gerade nicht erreichbar. Bitte gleich noch einmal.",
}

export function FinanzAnmeldung({ ziel, hinweis }: { ziel: string; hinweis?: string }) {
  const [laeuft, setLaeuft] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault()
        const daten = new FormData(e.currentTarget)
        setLaeuft(true)
        setFehler(null)
        try {
          const r = await fetch("/api/admin/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: daten.get("email"), password: daten.get("password") }),
          })
          if (r.ok) {
            window.location.replace(ziel)
            return
          }
          setFehler(r.status === 429 ? "zu-viele" : r.status >= 500 || r.status === 403 ? "stoerung" : "ungueltig")
        } catch {
          setFehler("stoerung")
        }
        setLaeuft(false)
      }}
    >
      {hinweis && <p className="bg-secondary text-foreground rounded-2xl px-4 py-3 text-sm">{hinweis}</p>}
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        E-Mail
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="bg-background focus-visible:ring-ring rounded-2xl px-4 py-3 text-base font-normal focus-visible:ring-2 focus-visible:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Passwort
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="bg-background focus-visible:ring-ring rounded-2xl px-4 py-3 text-base font-normal focus-visible:ring-2 focus-visible:outline-none"
        />
      </label>
      <p aria-live="polite" className="text-destructive min-h-5 text-sm">
        {fehler ? FEHLER[fehler] : ""}
      </p>
      <button
        type="submit"
        disabled={laeuft}
        className="bg-primary text-primary-foreground rounded-full px-5 py-3 font-semibold transition-opacity disabled:opacity-60"
      >
        {laeuft ? "Prüfe …" : "Öffnen"}
      </button>
    </form>
  )
}

export function Abmelden({ ziel }: { ziel: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null)
        window.location.replace(ziel)
      }}
      className="text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-full px-3 py-2 text-sm"
    >
      <LogOut className="size-4" aria-hidden />
      <span className="sr-only md:not-sr-only">Abmelden</span>
    </button>
  )
}
