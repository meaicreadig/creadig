import { fristAnlegen, fristErledigt } from "@/app/(admin)/admin/finanz/actions"
import { AdminField, AdminInput, Pill, SectionHeader } from "@/components/admin/primitives"
import { eur, tag } from "@/components/admin/finanz/format"
import { stufe, type Frist, type Stufe } from "@/lib/finanz/rechnen"

const STUFE: Record<Stufe, { text: (t: number) => string; schwere: "neutral" | "attention" | "critical" }> = {
  ruhig: { text: (t) => `in ${t} Tagen`, schwere: "neutral" },
  bald: { text: (t) => (t === 0 ? "heute" : `in ${t} Tagen`), schwere: "attention" },
  ueberfaellig: { text: (t) => `${-t} Tage überfällig`, schwere: "critical" },
  eskalation: { text: (t) => `Eskalation · ${-t} Tage`, schwere: "critical" },
}

export function FristenListe({ fristen, heute, ustOffenCent }: { fristen: Frist[]; heute: string; ustOffenCent: number }) {
  const offen = fristen.filter((f) => !f.erledigt)
  const erledigt = fristen.filter((f) => f.erledigt).slice(-4).reverse()

  return (
    <section aria-labelledby="fristen" className="flex flex-col gap-4">
      <SectionHeader id="fristen" title="Finanzamt & Fristen" count={`${offen.length} offen`} />
      <div className="tile bg-surface flex flex-col p-2">
        {offen.length === 0 && <p className="type-small text-muted-foreground p-4">Keine offenen Fristen.</p>}
        <ul className="flex flex-col">
          {offen.map((f) => {
            const s = stufe(f, heute)
            const st = STUFE[s.stufe]
            return (
              <li
                key={f.id}
                className={`border-line flex flex-col gap-3 border-b p-4 last:border-0 md:flex-row md:items-center ${s.stufe === "eskalation" ? "bg-destructive/10" : ""}`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{f.titel}</span>
                    <Pill severity={st.schwere}>{st.text(s.tage)}</Pill>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    fällig {tag(f.faellig)}
                    {f.art === "ust" && ustOffenCent > 0 ? ` · laufend offen ca. ${eur(ustOffenCent)}` : ""}
                    {f.betragCent ? ` · ${eur(f.betragCent)}` : ""}
                  </span>
                </div>
                <form action={fristErledigt} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={f.id} />
                  <label className="sr-only" htmlFor={`betrag-${f.id}`}>
                    Gezahlter Betrag
                  </label>
                  <AdminInput id={`betrag-${f.id}`} name="betrag" inputMode="decimal" placeholder="Betrag €" className="w-28" />
                  <button type="submit" className="border-gold text-gold-text hover:bg-gold/10 rounded-sm border px-3 py-2 text-sm whitespace-nowrap">
                    Erledigt
                  </button>
                </form>
              </li>
            )
          })}
        </ul>
        {erledigt.length > 0 && (
          <p className="text-muted-foreground px-4 pt-1 pb-3 text-xs">
            Zuletzt erledigt: {erledigt.map((f) => f.titel).join(" · ")}
          </p>
        )}
      </div>

      <details className="tile bg-surface group p-4">
        <summary className="text-muted-foreground cursor-pointer text-sm">Eigene Frist hinzufügen</summary>
        <form action={fristAnlegen} className="mt-4 grid gap-3 md:grid-cols-4 md:items-end">
          <AdminField label="Was" htmlFor="frist-titel" className="md:col-span-2">
            <AdminInput id="frist-titel" name="titel" required placeholder="z. B. Gewerbesteuer, Kfz-Steuer" />
          </AdminField>
          <AdminField label="Fällig" htmlFor="frist-faellig">
            <AdminInput id="frist-faellig" name="faellig" type="date" required defaultValue={heute} />
          </AdminField>
          <AdminField label="Betrag (optional)" htmlFor="frist-betrag">
            <AdminInput id="frist-betrag" name="betrag" inputMode="decimal" placeholder="0,00" />
          </AdminField>
          <button type="submit" className="bg-gold text-background rounded-sm px-4 py-2 text-sm font-medium md:col-start-4">
            Frist anlegen
          </button>
        </form>
      </details>
    </section>
  )
}
