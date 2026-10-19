import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { ZieleListe } from "@/components/finanz/ziele"
import { finanzDb } from "@/lib/finanz/store"
import { ladeZiele } from "@/lib/finanz/ziele"
import { finanzOwnerSeite } from "@/lib/finanz/zugang"

export const dynamic = "force-dynamic"
export const metadata = { title: "Ziele" }

export default async function Ziele() {
  await finanzOwnerSeite()
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="ziele" titel="Ziele"><OhneSpeicher /></FinanzShell>
  const ziele = await ladeZiele(db)

  return (
    <FinanzShell
      aktiv="ziele"
      titel="Ziele"
      unterzeile="Für Säulen ohne eigene Buchhaltungs-Historie — der Fortschritt kommt immer aus dem Hauptbuch, nie aus einer eigenen Zahl."
    >
      <ZieleListe ziele={ziele} />
    </FinanzShell>
  )
}
