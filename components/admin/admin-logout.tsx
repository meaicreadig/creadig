"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Abmelden. Ein Knopf, ein Aufruf, eine Weiterleitung.
 *
 * `DELETE` und nicht `GET`: Ein Abmelde-Link, den ein Browser vorlädt oder ein
 * Bild-Tag aufruft, meldet den Owner mitten in der Arbeit ab. Das ist keine
 * Theorie — Link-Vorschauen und Prefetch tun genau das.
 */
export function AdminLogout() {
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
      className="cta-quiet w-full px-4 py-2.5 text-sm tracking-wide disabled:opacity-60"
    >
      {busy ? "Wird abgemeldet …" : "Abmelden"}
    </button>
  )
}
