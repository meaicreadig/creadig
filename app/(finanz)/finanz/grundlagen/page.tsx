import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { FinanzEinstellungen } from "@/components/finanz/einstellungen"
import { berechneLage } from "@/lib/finanz/lage"
import { finanzDb } from "@/lib/finanz/store"

export const dynamic = "force-dynamic"
export const metadata = { title: "Grundlagen" }

export default async function FinanzGrundlagen() {
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="grundlagen" titel="Grundlagen"><OhneSpeicher /></FinanzShell>

  const { einstellungen } = await berechneLage(db)
  return (
    <FinanzShell aktiv="grundlagen" titel="Grundlagen" unterzeile="Einmal einrichten – danach rechnet alles im Hintergrund.">
      <FinanzEinstellungen e={einstellungen} />
    </FinanzShell>
  )
}
