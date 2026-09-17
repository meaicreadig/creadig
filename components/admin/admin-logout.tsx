"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Abmelden. Seit ADM-02 · H2 widerruft der Aufruf die Sitzung serverseitig
 * (wo eine Datenbank eingerichtet ist). Beschriftung kommt aus den
 * Admin-Texten der gewählten Sprache.
 */
export function AdminLogout({ label, laeuft }: { label: string; laeuft: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null)
        router.replace("/admin/login")
        router.refresh()
      }}
      className="cta-quiet inline-flex min-h-11 w-full items-center justify-center px-4 py-2.5 text-sm tracking-wide disabled:opacity-60"
    >
      {busy ? laeuft : label}
    </button>
  )
}
