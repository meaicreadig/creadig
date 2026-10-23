"use client"

import { useActionState } from "react"

import { anlageAnlegen, type AnlageAntwort } from "@/app/(finanz)/finanz/investment/actions"
import { AdminField, AdminInput, AdminSelect } from "@/components/admin/primitives"
import { KLASSEN } from "@/lib/finanz/investment-shared"

const SELECT = "border-line bg-background w-full rounded-md border ps-3 pe-9 py-2.5 text-base"

export function AnlageFormular({ heute }: { heute: string }) {
  const [antwort, aktion, laeuft] = useActionState<AnlageAntwort, FormData>(anlageAnlegen, null)
  return (
    <form action={aktion} className="grid gap-4 md:grid-cols-4 md:items-end">
      <AdminField label="Name" htmlFor="a-name" className="md:col-span-2">
        <AdminInput id="a-name" name="name" required placeholder="z. B. Tagesgeld Bank X, MSCI World ETF" />
      </AdminField>
      <AdminField label="Klasse" htmlFor="a-klasse">
        <AdminSelect id="a-klasse" name="klasse" className={SELECT} defaultValue="etf">
          {Object.entries(KLASSEN).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </AdminSelect>
      </AdminField>
      <AdminField label="Angelegt am" htmlFor="a-seit">
        <AdminInput id="a-seit" name="seit" type="date" required defaultValue={heute} />
      </AdminField>
      <AdminField label="Eingesetzt € (Einstand)" htmlFor="a-einstand">
        <AdminInput id="a-einstand" name="einstand" inputMode="decimal" required placeholder="0,00" />
      </AdminField>
      <AdminField label="Aktueller Wert € (optional)" htmlFor="a-wert">
        <AdminInput id="a-wert" name="wert" inputMode="decimal" placeholder="= Einstand" />
      </AdminField>
      <AdminField label="Notiz" htmlFor="a-notiz">
        <AdminInput id="a-notiz" name="notiz" />
      </AdminField>
      <button type="submit" disabled={laeuft} className="bg-gold text-background rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60">
        {laeuft ? "Speichert …" : "Anlage hinzufügen"}
      </button>
      {antwort && !antwort.ok && <p role="alert" className="text-destructive text-sm md:col-span-4">{antwort.fehler}</p>}
    </form>
  )
}
