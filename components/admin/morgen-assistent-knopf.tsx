"use client"

import { useTransition } from "react"
import { RefreshCw } from "lucide-react"

import { briefingNeuEinschaetzen } from "@/app/(admin)/admin/briefing-actions"

const TEXT = {
  de: { neu: "Neu einschätzen", laeuft: "Denkt nach …" },
  tr: { neu: "Yeniden değerlendir", laeuft: "Düşünüyor …" },
} as const

export function NeuEinschaetzenKnopf({ sprache }: { sprache: "de" | "tr" }) {
  const [laeuft, starte] = useTransition()
  return (
    <button
      type="button"
      disabled={laeuft}
      onClick={() => starte(async () => void (await briefingNeuEinschaetzen(sprache)))}
      className="text-primary hover:bg-primary/10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
    >
      <RefreshCw className={`size-4 ${laeuft ? "animate-spin" : ""}`} aria-hidden="true" />
      {laeuft ? TEXT[sprache].laeuft : TEXT[sprache].neu}
    </button>
  )
}
