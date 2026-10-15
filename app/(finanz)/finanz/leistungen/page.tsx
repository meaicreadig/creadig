import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/primitives"
import { leistungSpeichern, leistungUmschalten } from "@/app/(finanz)/finanz/auftraege/actions"
import { finanzDb } from "@/lib/finanz/store"
import { GESCHAEFTSFELDER } from "@/lib/finanz/belege"
import { EINHEITEN, formatEuro, UST_SAETZE } from "@/lib/finanz/auftraege/rechnen"
import { ladeLeistungen, type Leistung } from "@/lib/finanz/auftraege/store"

export const dynamic = "force-dynamic"
export const metadata = { title: "Leistungen" }

const FELDER = GESCHAEFTSFELDER.filter((g) => g.key !== "privat")

export default async function Leistungen() {
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="leistungen" titel="Leistungen"><OhneSpeicher /></FinanzShell>
  const liste = await ladeLeistungen(db)

  return (
    <FinanzShell aktiv="leistungen" titel="Leistungen" unterzeile="Dein Katalog mit festen Preisen. Einmal pflegen – jedes Angebot und jede Rechnung greift darauf zu.">
      <section aria-labelledby="l-neu" className="bg-card flex flex-col gap-5 rounded-[2rem] p-6">
        <h2 id="l-neu" className="text-lg font-semibold">Neue Leistung</h2>
        <LeistungsForm />
      </section>

      <section aria-labelledby="l-alle" className="flex flex-col gap-3">
        <h2 id="l-alle" className="sr-only">Katalog</h2>
        {liste.length === 0 && <p className="bg-card text-muted-foreground rounded-3xl p-6 text-sm">Noch keine Leistungen im Katalog.</p>}
        {liste.map((l) => (
          <details key={l.id} className={`bg-card rounded-[2rem] p-5 ${l.aktiv ? "" : "opacity-60"}`}>
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
              <span className="font-medium">
                {l.titel}
                <span className="text-muted-foreground font-normal"> · {FELDER.find((f) => f.key === l.geschaeftsfeld)?.label}</span>
              </span>
              <span className="text-primary font-semibold tabular-nums">
                {formatEuro(l.preisCent)} <span className="text-muted-foreground text-xs font-normal">/ {l.einheit} · {l.ustSatz} %</span>
              </span>
            </summary>
            <div className="mt-5 flex flex-col gap-4">
              <LeistungsForm l={l} />
              <form action={leistungUmschalten}>
                <input type="hidden" name="id" value={l.id} />
                <button className="text-muted-foreground hover:text-primary text-sm">{l.aktiv ? "Deaktivieren (bleibt in alten Dokumenten)" : "Wieder aktivieren"}</button>
              </form>
            </div>
          </details>
        ))}
      </section>
    </FinanzShell>
  )
}

function LeistungsForm({ l }: { l?: Leistung }) {
  const p = l?.id ?? "neu"
  return (
    <form action={leistungSpeichern} className="grid gap-4 md:grid-cols-4 md:items-end">
      {l && <input type="hidden" name="id" value={l.id} />}
      <div className="md:col-span-2">
        <AdminField label="Leistung" htmlFor={`${p}-t`}>
          <AdminInput id={`${p}-t`} name="titel" required defaultValue={l?.titel} placeholder="z. B. Website-Paket Business" />
        </AdminField>
      </div>
      <AdminField label="Preis netto (€)" htmlFor={`${p}-p`}>
        <AdminInput id={`${p}-p`} name="preis" inputMode="decimal" required defaultValue={l ? (l.preisCent / 100).toFixed(2).replace(".", ",") : ""} />
      </AdminField>
      <AdminField label="Einheit" htmlFor={`${p}-e`}>
        <AdminSelect id={`${p}-e`} name="einheit" defaultValue={l?.einheit ?? "Pauschal"}>
          {EINHEITEN.map((e) => <option key={e}>{e}</option>)}
        </AdminSelect>
      </AdminField>
      <div className="md:col-span-2">
        <AdminField label="Beschreibung (erscheint auf dem Dokument)" htmlFor={`${p}-b`}>
          <AdminTextarea id={`${p}-b`} name="beschreibung" rows={2} defaultValue={l?.beschreibung} />
        </AdminField>
      </div>
      <AdminField label="USt" htmlFor={`${p}-u`}>
        <AdminSelect id={`${p}-u`} name="ust_satz" defaultValue={l?.ustSatz ?? 19}>
          {UST_SAETZE.map((s) => <option key={s} value={s}>{s} %</option>)}
        </AdminSelect>
      </AdminField>
      <AdminField label="Geschäftsfeld" htmlFor={`${p}-f`}>
        <AdminSelect id={`${p}-f`} name="geschaeftsfeld" defaultValue={l?.geschaeftsfeld ?? "it"}>
          {FELDER.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
        </AdminSelect>
      </AdminField>
      <button className="bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold md:col-start-4">{l ? "Speichern" : "Hinzufügen"}</button>
    </form>
  )
}
