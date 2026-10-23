"use client"

import { useActionState } from "react"

import { bescheidAnlegen, type BescheidAntwort } from "@/app/(finanz)/finanz/bescheide/actions"
import { AdminField, AdminInput, AdminSelect } from "@/components/admin/primitives"
import { BESCHEID_ARTEN, STEUERARTEN } from "@/lib/finanz/bescheide-shared"

const SELECT = "border-line bg-background w-full rounded-md border ps-3 pe-9 py-2.5 text-base"

export function BescheidFormular({ heute }: { heute: string }) {
  const [antwort, aktion, laeuft] = useActionState<BescheidAntwort, FormData>(bescheidAnlegen, null)
  return (
    <form action={aktion} className="bg-card grid gap-4 rounded-[2rem] p-7 md:grid-cols-4 md:items-end">
      <AdminField label="Art" htmlFor="b-art">
        <AdminSelect id="b-art" name="art" className={SELECT} defaultValue="vorauszahlung">
          {Object.entries(BESCHEID_ARTEN).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </AdminSelect>
      </AdminField>
      <AdminField label="Steuerart" htmlFor="b-steuerart">
        <AdminSelect id="b-steuerart" name="steuerart" className={SELECT} defaultValue="est">
          {Object.entries(STEUERARTEN).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </AdminSelect>
      </AdminField>
      <AdminField label="Steuerjahr" htmlFor="b-jahr">
        <AdminInput id="b-jahr" name="jahr" type="number" required defaultValue={Number(heute.slice(0, 4))} />
      </AdminField>
      <AdminField label="Datum des Bescheids" htmlFor="b-datum">
        <AdminInput id="b-datum" name="datum" type="date" required defaultValue={heute} />
      </AdminField>
      <AdminField label="Betrag € (je Termin bzw. gesamt)" htmlFor="b-betrag">
        <AdminInput id="b-betrag" name="betrag" inputMode="decimal" placeholder="0,00" />
      </AdminField>
      <AdminField label="Gilt ab (nur Vorauszahlung)" htmlFor="b-ab">
        <AdminInput id="b-ab" name="gueltigAb" type="date" />
      </AdminField>
      <AdminField label="Aktenzeichen" htmlFor="b-az">
        <AdminInput id="b-az" name="aktenzeichen" />
      </AdminField>
      <AdminField label="Wo liegt das Original?" htmlFor="b-ort">
        <AdminInput id="b-ort" name="ablageort" placeholder="Ordner, Link, Steuerberater" />
      </AdminField>
      <AdminField label="Notiz" htmlFor="b-notiz" className="md:col-span-3">
        <AdminInput id="b-notiz" name="notiz" />
      </AdminField>
      <button type="submit" disabled={laeuft} className="bg-gold text-background rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60">
        {laeuft ? "Speichert …" : "Bescheid ablegen"}
      </button>
      {antwort && (
        <p role="status" className={`md:col-span-4 text-sm ${antwort.ok ? "text-gold-text" : "text-destructive"}`}>
          {antwort.ok ? antwort.meldung : antwort.fehler}
        </p>
      )}
    </form>
  )
}
