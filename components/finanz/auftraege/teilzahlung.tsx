"use client"

import { useActionState } from "react"

import { teilzahlungErfassen } from "@/app/(finanz)/finanz/auftraege/actions"
import { AdminInput } from "@/components/admin/primitives"

/** Teilzahlung erfassen (Phase 6) — eigenes Client-Formular, damit Überzahlung/Reststand direkt als Rückmeldung sichtbar werden. */
export function TeilzahlungForm({ id, heute }: { id: string; heute: string }) {
  const [ergebnis, aktion, sendetGerade] = useActionState(teilzahlungErfassen, null)
  return (
    <form action={aktion} className="flex flex-col gap-1.5">
      <div className="bg-background flex items-end gap-2 rounded-full p-1.5 ps-4">
        <input type="hidden" name="id" value={id} />
        <label className="text-muted-foreground flex items-center gap-2 text-sm">
          Teilzahlung (€)
          <AdminInput name="betrag" inputMode="decimal" placeholder="z. B. 500,00" required className="w-28" aria-label="Teilzahlungsbetrag" />
        </label>
        <AdminInput name="am" type="date" defaultValue={heute} className="w-40" aria-label="Zahlungsdatum" />
        <button disabled={sendetGerade} className="bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60">
          Erfassen
        </button>
      </div>
      {ergebnis && !ergebnis.ok && <p className="text-destructive text-xs">{ergebnis.fehler.join(" · ")}</p>}
      {ergebnis?.ok && ergebnis.hinweis && <p className="text-primary text-xs font-medium">{ergebnis.hinweis}</p>}
    </form>
  )
}
