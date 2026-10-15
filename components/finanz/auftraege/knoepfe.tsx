"use client"

import { useState, useTransition } from "react"
import { Check, Copy, Mail, Printer } from "lucide-react"

import { erneutSenden, nachfassen, type Ergebnis } from "@/app/(finanz)/finanz/auftraege/actions"

const KNOPF =
  "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"

export function NachfassKnopf({ id, label, erneut = false }: { id: string; label: string; erneut?: boolean }) {
  const [r, setR] = useState<Ergebnis | null>(null)
  const [laeuft, starte] = useTransition()
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={laeuft || r?.ok}
        className={KNOPF}
        onClick={() => {
          if (!window.confirm(`${label} jetzt per Mail senden?`)) return
          starte(async () => setR(await (erneut ? erneutSenden(id) : nachfassen(id))))
        }}
      >
        {r?.ok ? <Check aria-hidden className="size-4" /> : <Mail aria-hidden className="size-4" />}
        {laeuft ? "Sendet …" : r?.ok ? r.hinweis : label}
      </button>
      {r && !r.ok && <span className="text-destructive text-sm">{r.fehler.join(" ")}</span>}
    </span>
  )
}

export function LinkKopieren({ url }: { url: string }) {
  const [kopiert, setKopiert] = useState(false)
  return (
    <button
      type="button"
      className={KNOPF}
      onClick={async () => {
        await navigator.clipboard.writeText(url)
        setKopiert(true)
        setTimeout(() => setKopiert(false), 2000)
      }}
    >
      {kopiert ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
      {kopiert ? "Kopiert" : "Kundenlink kopieren"}
    </button>
  )
}

export function DruckKnopf({ label = "Drucken / PDF" }: { label?: string }) {
  return (
    <button type="button" className={`${KNOPF} print:hidden`} onClick={() => window.print()}>
      <Printer aria-hidden className="size-4" />
      {label}
    </button>
  )
}
