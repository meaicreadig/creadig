import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { FinanzEinstellungen } from "@/components/finanz/einstellungen"
import { FinanzFirma } from "@/components/finanz/firma"
import { berechneLage } from "@/lib/finanz/lage"
import { finanzDb } from "@/lib/finanz/store"
import { ladeFirma } from "@/lib/finanz/auftraege/store"

export const dynamic = "force-dynamic"
export const metadata = { title: "Grundlagen" }

export default async function FinanzGrundlagen() {
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="grundlagen" titel="Grundlagen"><OhneSpeicher /></FinanzShell>

  const { einstellungen } = await berechneLage(db)
  const { firma, ustPflichtig } = await ladeFirma(db)
  return (
    <FinanzShell aktiv="grundlagen" titel="Grundlagen" unterzeile="Einmal einrichten – danach rechnet alles im Hintergrund.">
      <FinanzEinstellungen e={einstellungen} />
      <FinanzFirma firma={firma} ustPflichtig={ustPflichtig} />
    </FinanzShell>
  )
}
