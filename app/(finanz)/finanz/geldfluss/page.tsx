import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { LiquiditaetsBand } from "@/components/finanz/liquiditaet"
import { BuchungErfassen, BuchungsListe } from "@/components/finanz/buchungen"
import { BankImportKarte } from "@/components/finanz/bank-import"
import { berechneLage } from "@/lib/finanz/lage"
import { finanzDb } from "@/lib/finanz/store"
import { ladeOffeneBankUmsaetze } from "@/lib/finanz/bank-abgleich"

export const dynamic = "force-dynamic"
export const metadata = { title: "Geldfluss" }

export default async function FinanzGeldfluss() {
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="geldfluss" titel="Geldfluss"><OhneSpeicher /></FinanzShell>

  const [{ heute, buchungen, topf, bewegungen, wochen }, offeneUmsaetze] = await Promise.all([berechneLage(db), ladeOffeneBankUmsaetze(db)])
  return (
    <FinanzShell aktiv="geldfluss" titel="Geldfluss" unterzeile="Was kommt, was geht – und wie dein Konto in 13 Wochen aussieht.">
      <LiquiditaetsBand wochen={wochen} topfCent={topf.gesamtCent} bewegungen={bewegungen} />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <BuchungErfassen heute={heute} />
        </div>
        <div className="lg:col-span-3">
          <BuchungsListe buchungen={buchungen} heute={heute} />
        </div>
      </div>
      <BankImportKarte offeneUmsaetze={offeneUmsaetze} />
    </FinanzShell>
  )
}
