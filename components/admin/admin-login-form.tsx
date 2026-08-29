"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Anmeldeformular.
 *
 * ---------------------------------------------------------------------------
 * EINE FEHLERMELDUNG FÜR ALLES
 * Falsches Passwort, leeres Feld, kaputte Anfrage — der Text ist immer
 * derselbe. Wer unterscheidet, hilft beim Durchprobieren. Nur zwei Zustände
 * bekommen eine eigene Antwort, weil sie kein Rateergebnis sind: das
 * ausgeschöpfte Versuchsfenster und die nicht eingerichtete Umgebung.
 *
 * `router.refresh()` nach dem Erfolg ist nicht optional: Ohne ihn bedient der
 * Client-Cache die Zielseite aus der Zeit vor der Anmeldung.
 */
export function AdminLoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="mt-8 flex flex-col gap-6"
      onSubmit={async (event) => {
        event.preventDefault()
        setError(null)
        setBusy(true)

        const response = await fetch("/api/admin/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }).catch(() => null)

        if (response?.ok) {
          router.replace("/admin")
          router.refresh()
          return
        }

        setBusy(false)
        setPassword("")
        if (response?.status === 429) {
          setError("Zu viele Versuche. Bitte später erneut probieren.")
        } else if (response?.status === 503 || response?.status === 404) {
          setError("Nicht eingerichtet.")
        } else {
          setError("Anmeldung nicht möglich.")
        }
      }}
    >
      <label className="flex flex-col gap-2">
        <span className="eyebrow text-muted-foreground">Passwort</span>
        <input
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
          className="border-line-strong text-foreground focus:border-gold w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-base outline-none transition-colors duration-[var(--dur-1)]"
        />
      </label>

      {error && (
        <p role="alert" className="border-destructive/40 text-destructive border-l-2 py-1 pl-4 text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="cta-outline px-7 py-3.5 text-sm tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Wird geprüft …" : "Anmelden"}
      </button>
    </form>
  )
}
