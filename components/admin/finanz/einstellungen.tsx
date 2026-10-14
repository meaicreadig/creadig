import { einstellungenSpeichern } from "@/app/(admin)/admin/finanz/actions"
import { AdminField, AdminInput, AdminSelect } from "@/components/admin/primitives"
import { tag } from "@/components/admin/finanz/format"
import type { Einstellungen } from "@/lib/finanz/rechnen"

export function FinanzEinstellungen({ e }: { e: Einstellungen }) {
  const stand = (e.kontostandCent / 100).toFixed(2).replace(".", ",")
  return (
    <details className="tile bg-surface p-5" open={e.kontostandCent === 0}>
      <summary className="text-subhead cursor-pointer text-base">Grundlagen</summary>
      <p className="type-small text-muted-foreground mt-2 max-w-2xl text-pretty">
        Einmal einrichten, dann rechnet alles im Hintergrund. USt bezahlt bis: {tag(e.ustBezahltBis)}.
      </p>
      <form action={einstellungenSpeichern} className="mt-5 grid gap-4 md:grid-cols-3 md:items-end">
        <AdminField label="Kontostand (€)" htmlFor="e-stand">
          <AdminInput id="e-stand" name="kontostand" inputMode="decimal" required defaultValue={stand} />
        </AdminField>
        <AdminField label="Stand vom" htmlFor="e-am">
          <AdminInput id="e-am" name="kontostand_am" type="date" required defaultValue={e.kontostandAm} />
        </AdminField>
        <AdminField label="ESt-Rücklage (% vom Gewinn)" htmlFor="e-quote">
          <AdminInput id="e-quote" name="est_quote" type="number" min={0} max={60} required defaultValue={e.estQuote} />
        </AdminField>
        <AdminField label="USt-Voranmeldung" htmlFor="e-rhythmus">
          <AdminSelect id="e-rhythmus" name="ust_rhythmus" defaultValue={e.ustRhythmus}>
            <option value="quartal">vierteljährlich</option>
            <option value="monatlich">monatlich</option>
          </AdminSelect>
        </AdminField>
        <label className="flex items-center gap-2 text-sm md:pb-2">
          <input type="checkbox" name="ust_pflichtig" defaultChecked={e.ustPflichtig} className="accent-gold size-4" />
          umsatzsteuerpflichtig (keine Kleinunternehmerregelung)
        </label>
        <button type="submit" className="bg-gold text-background rounded-sm px-4 py-2 text-sm font-medium">
          Speichern
        </button>
      </form>
    </details>
  )
}
