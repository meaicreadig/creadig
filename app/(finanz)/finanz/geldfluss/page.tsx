import { after } from "next/server"

import { ordneAllesAutomatischZu } from "@/lib/finanz/auto"
import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { LiquiditaetsBand } from "@/components/finanz/liquiditaet"
import { BuchungErfassen, BuchungsListe } from "@/components/finanz/buchungen"
import { BankImportKarte } from "@/components/finanz/bank-import"
import { BankAusgabenKarte } from "@/components/finanz/bank-ausgaben"
import { finanzBasis } from "@/lib/finanz/basis"
import { SZENARIEN, type Szenario } from "@/lib/finanz/rechnen"
import { berechneLage } from "@/lib/finanz/lage"
import { finanzDb } from "@/lib/finanz/store"
import { ladeAusgehendeBankUmsaetze, ladeOffeneBankUmsaetze, ladeOffeneRechnungenFuerAbgleich } from "@/lib/finanz/bank-abgleich"
import { finanzOwnerSeite } from "@/lib/finanz/zugang"
import { Reveal } from "@/components/ui/reveal"

export const dynamic = "force-dynamic"
export const metadata = { title: "Geldfluss" }

export default async function FinanzGeldfluss({ searchParams }: { searchParams: Promise<{ szenario?: string }> }) {
  await finanzOwnerSeite()
  const gewaehlt = (await searchParams).szenario
  const aktiv: Szenario = SZENARIEN.includes(gewaehlt as Szenario) ? (gewaehlt as Szenario) : "vorsichtig"
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="geldfluss" titel="Geldfluss"><OhneSpeicher /></FinanzShell>

  await ordneAllesAutomatischZu(db, false).catch(() => null)
  after(() => ordneAllesAutomatischZu(db).catch(() => null))
  const [{ heute, buchungen, topf, szenarien }, offeneUmsaetze, offeneRechnungen, abbuchungen, basis] = await Promise.all([
    berechneLage(db),
    ladeOffeneBankUmsaetze(db),
    ladeOffeneRechnungenFuerAbgleich(db),
    ladeAusgehendeBankUmsaetze(db),
    finanzBasis(),
  ])
  return (
    <FinanzShell aktiv="geldfluss" titel="Geldfluss" unterzeile="Was kommt, was geht – und wie dein Konto in 13 Wochen aussieht.">
      {/* Karten in Lesereihenfolge, 60 ms Abstand. */}
      <Reveal duration={0.35} y={20}>
        <LiquiditaetsBand wochen={szenarien[aktiv].wochen} topfCent={topf.gesamtCent} bewegungen={szenarien[aktiv].bewegungen} szenarien={szenarien} aktiv={aktiv} basis={basis} />
      </Reveal>
      <Reveal delay={0.06} duration={0.35} y={20}>
        <BankImportKarte offeneUmsaetze={offeneUmsaetze} offeneRechnungen={offeneRechnungen} />
      </Reveal>
      <Reveal delay={0.12} duration={0.35} y={20}>
        <BankAusgabenKarte abbuchungen={abbuchungen} />
      </Reveal>
      <Reveal delay={0.18} duration={0.35} y={20}>
        <BuchungErfassen heute={heute} />
      </Reveal>
      <Reveal delay={0.24} duration={0.35} y={20}>
        <BuchungsListe buchungen={buchungen} heute={heute} />
      </Reveal>
    </FinanzShell>
  )
}
