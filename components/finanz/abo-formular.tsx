"use client"

import { useActionState } from "react"

import { aboAnlegen, type AboAntwort } from "@/app/(finanz)/finanz/abos/actions"
import { AdminField, AdminInput } from "@/components/admin/primitives"
import { INTERVALL_LABEL } from "@/lib/finanz/abos"

const SELECT = "border-line bg-background w-full rounded-md border px-3 py-2.5 text-base"

export function AboFormular({ kunden, heute }: { kunden: { schluessel: string; label: string }[]; heute: string }) {
  const [antwort, aktion, laeuft] = useActionState<AboAntwort, FormData>(aboAnlegen, null)
  return (
    <form action={aktion} className="grid gap-4 md:grid-cols-4 md:items-end">
      <AdminField label="Kunde" htmlFor="ab-kunde" className="md:col-span-2">
        <select id="ab-kunde" name="kunde" required className={SELECT} defaultValue="">
          <option value="" disabled>Kunde wählen …</option>
          {kunden.map((k) => <option key={k.schluessel} value={k.schluessel}>{k.label}</option>)}
        </select>
      </AdminField>
      <AdminField label="Leistung (Titel)" htmlFor="ab-titel" className="md:col-span-2">
        <AdminInput id="ab-titel" name="titel" required placeholder="z. B. Website-Wartung" />
      </AdminField>
      <AdminField label="Netto € je Zeitraum" htmlFor="ab-netto">
        <AdminInput id="ab-netto" name="netto" inputMode="decimal" required placeholder="0,00" />
      </AdminField>
      <AdminField label="USt-Satz" htmlFor="ab-ust">
        <select id="ab-ust" name="ustSatz" className={SELECT} defaultValue="19">
          <option value="19">19 %</option><option value="7">7 %</option><option value="0">0 %</option>
        </select>
      </AdminField>
      <AdminField label="Intervall" htmlFor="ab-int">
        <select id="ab-int" name="intervall" className={SELECT} defaultValue="monat">
          {Object.entries(INTERVALL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </AdminField>
      <AdminField label="Erster Rechnungstermin" htmlFor="ab-start">
        <AdminInput id="ab-start" name="start" type="date" required defaultValue={heute} />
      </AdminField>
      <AdminField label="Beschreibung (optional)" htmlFor="ab-besch" className="md:col-span-3">
        <AdminInput id="ab-besch" name="beschreibung" />
      </AdminField>
      <input type="hidden" name="geschaeftsfeld" value="digitalprodukte" />
      <button type="submit" disabled={laeuft} className="bg-gold text-background rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60">
        {laeuft ? "Speichert …" : "Abo anlegen"}
      </button>
      {antwort && !antwort.ok && <p role="alert" className="text-destructive text-sm md:col-span-4">{antwort.fehler}</p>}
    </form>
  )
}
