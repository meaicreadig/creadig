import { Sparkles } from "lucide-react"

import type { Aufbereitung } from "@/lib/gespraech-ki"

export function AufbereitungBlock({
  a,
  texte,
  kompakt = false,
}: {
  a: Aufbereitung
  texte: { kiEyebrow: string; kiPunkte: string; kiNaechster: string }
  kompakt?: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-gold-text inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase">
        <Sparkles aria-hidden="true" className="size-3" />
        {texte.kiEyebrow}
      </p>
      <p className="font-display text-base font-semibold text-balance">{a.titel}</p>
      <p className="text-sm leading-relaxed text-pretty">{a.zusammenfassung}</p>
      {!kompakt && a.punkte.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-muted-foreground text-xs font-medium">{texte.kiPunkte}</p>
          <ul className="flex flex-col gap-1.5">
            {a.punkte.map((p) => (
              <li key={p} className="flex gap-2 text-sm leading-relaxed">
                <span aria-hidden="true" className="bg-gold mt-2 size-1.5 shrink-0 rounded-full" />
                <span className="text-pretty">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!kompakt && a.naechsterSchritt && (
        <div className="bg-secondary rounded-2xl px-4 py-3">
          <p className="text-muted-foreground text-xs font-medium">{texte.kiNaechster}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-pretty">{a.naechsterSchritt}</p>
        </div>
      )}
    </div>
  )
}
