import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { FinanzEinstellungen } from "@/components/finanz/einstellungen"
import { FinanzFirma } from "@/components/finanz/firma"
import { NummernkreisWarnung } from "@/components/finanz/nummernkreis-warnung"
import { berechneLage } from "@/lib/finanz/lage"
import { finanzDb } from "@/lib/finanz/store"
import { ladeFirma, pruefeNummernkreis } from "@/lib/finanz/auftraege/store"
import { finanzOwnerSeite } from "@/lib/finanz/zugang"

export const dynamic = "force-dynamic"
export const metadata = { title: "Grundlagen" }

export default async function FinanzGrundlagen() {
  await finanzOwnerSeite()
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="grundlagen" titel="Grundlagen"><OhneSpeicher /></FinanzShell>

  const { einstellungen } = await berechneLage(db)
  const { firma, ustPflichtig } = await ladeFirma(db)
  const luecken = await pruefeNummernkreis(db)
  return (
    <FinanzShell aktiv="grundlagen" titel="Grundlagen" unterzeile="Einmal einrichten – danach rechnet alles im Hintergrund.">
      <NummernkreisWarnung luecken={luecken} />
      <FinanzEinstellungen e={einstellungen} />
      <FinanzFirma firma={firma} ustPflichtig={ustPflichtig} />
    </FinanzShell>
  )
}
