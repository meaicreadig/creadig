import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { FristenListe } from "@/components/finanz/fristen"
import { eur, eurRund } from "@/components/finanz/format"
import { berechneLage } from "@/lib/finanz/lage"
import { finanzDb } from "@/lib/finanz/store"

export const dynamic = "force-dynamic"
export const metadata = { title: "Steuern" }

export default async function FinanzSteuern() {
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="steuern" titel="Steuern"><OhneSpeicher /></FinanzShell>

  const { heute, fristen, topf } = await berechneLage(db)
  return (
    <FinanzShell aktiv="steuern" titel="Steuern" unterzeile="Der Steuertopf rechnet live mit. Was dem Finanzamt gehört, ist hier schon beiseitegelegt.">
      <section aria-label="Steuertopf" className="grid gap-5 md:grid-cols-3">
        <div className="finanz-glanz bg-primary text-primary-foreground relative flex flex-col gap-2 overflow-hidden rounded-[2rem] p-7">
          <span className="text-primary-foreground/80 text-sm font-medium">Steuertopf gesamt</span>
          <span className="text-4xl font-semibold tracking-tight tabular-nums">{eurRund(topf.gesamtCent)}</span>
        </div>
        <Karte titel="Umsatzsteuer offen" wert={eurRund(topf.ustOffenCent)} />
        <Karte titel="ESt-Rücklage" wert={eurRund(topf.estRuecklageCent)} fuss={`Gewinn bisher ${eur(topf.gewinnJahrCent)} netto`} />
      </section>
      <FristenListe fristen={fristen} heute={heute} ustOffenCent={topf.ustOffenCent} />
    </FinanzShell>
  )
}

function Karte({ titel, wert, fuss }: { titel: string; wert: string; fuss?: string }) {
  return (
    <div className="bg-card flex flex-col gap-2 rounded-[2rem] p-7">
      <span className="text-muted-foreground text-sm font-medium">{titel}</span>
      <span className="text-3xl font-semibold tracking-tight tabular-nums">{wert}</span>
      {fuss && <span className="text-muted-foreground text-xs">{fuss}</span>}
    </div>
  )
}
