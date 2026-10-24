import Link from "next/link"

import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { finanzBasis } from "@/lib/finanz/basis"
import { FristenListe } from "@/components/finanz/fristen"
import { FinanzEuer } from "@/components/finanz/euer"
import { eur, eurRund } from "@/components/finanz/format"
import { berechneLage } from "@/lib/finanz/lage"
import { finanzDb } from "@/lib/finanz/store"
import { berechneEuer } from "@/lib/finanz/euer"
import { finanzOwnerSeite } from "@/lib/finanz/zugang"
import { finanzamtWartet } from "@/lib/finanz/finanzamt"
import { finanzamtStatus } from "../actions"

export const dynamic = "force-dynamic"
export const metadata = { title: "Steuern" }

export default async function FinanzSteuern({ searchParams }: { searchParams: Promise<{ jahr?: string }> }) {
  await finanzOwnerSeite()
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="steuern" titel="Steuern"><OhneSpeicher /></FinanzShell>

  const { heute, fristen, topf } = await berechneLage(db)
  const diesesJahr = heute.slice(0, 4)
  const jahre = [diesesJahr, String(Number(diesesJahr) - 1), String(Number(diesesJahr) - 2)]
  const gewaehlt = (await searchParams).jahr
  const jahr = gewaehlt && jahre.includes(gewaehlt) ? gewaehlt : diesesJahr
  const [euer, basis, amt] = await Promise.all([berechneEuer(db, jahr), finanzBasis(), finanzamtWartet(db)])

  return (
    <FinanzShell aktiv="steuern" titel="Steuern" unterzeile="Der Steuertopf rechnet live mit. Was dem Finanzamt gehört, ist hier schon beiseitegelegt.">
      <section aria-label="Steuertopf" className="grid gap-5 md:grid-cols-3">
        <div className="bg-card flex flex-col gap-2 rounded-[2rem] p-7 shadow-sm">
          <span className="text-muted-foreground text-sm font-medium">Steuertopf gesamt</span>
          <span className="text-primary text-4xl font-semibold tracking-tight tabular-nums">{eurRund(topf.gesamtCent)}</span>
        </div>
        <Karte titel="Umsatzsteuer offen" wert={eurRund(topf.ustOffenCent)} />
        <Karte titel="ESt-Rücklage" wert={eurRund(topf.estRuecklageCent)} fuss={`Gewinn bisher ${eur(topf.gewinnJahrCent)} netto`} />
      </section>
      <Link href={`${basis}/pauschalen?jahr=${jahr}`} className="bg-card flex items-center justify-between gap-4 rounded-[2rem] p-7">
        <span className="flex flex-col gap-1">
          <span className="font-semibold">Pauschalen &amp; Sonderausgaben</span>
          <span className="text-muted-foreground text-sm">Fahrten, Verpflegung, Homeoffice · Archiv der Tank-/Essensbelege · Spenden</span>
        </span>
        <span className="text-primary text-sm font-medium">Öffnen</span>
      </Link>
      <Link href={`${basis}/steuern/ustva`} className="bg-card flex items-center justify-between gap-4 rounded-[2rem] p-7">
        <span className="flex flex-col gap-1">
          <span className="font-semibold">USt-Voranmeldung</span>
          <span className="text-muted-foreground text-sm">Kz 81 / 86 / 66 / 83 je Frist — Zahllast in die Frist übernehmen</span>
        </span>
        <span className="text-primary text-sm font-medium">Öffnen</span>
      </Link>
      <form action={finanzamtStatus} className="bg-card flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-7">
        <input type="hidden" name="wartet" value={amt.wartet ? "nein" : "ja"} />
        <span className="flex flex-col gap-1">
          <span className="font-semibold">{amt.wartet ? "Finanzamt: Entscheidung steht aus" : "Finanzamt"}</span>
          <span className="text-muted-foreground text-sm">
            {amt.wartet
              ? "ESt- und USt-Fristen ohne Bescheid ruhen und erscheinen nicht als überfällig."
              : "Wartest du noch auf Erfassung oder ersten Bescheid? Dann ruhen die Fristen ohne Betrag."}
          </span>
        </span>
        <button type="submit" className="bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium">
          {amt.wartet ? "Amt hat entschieden" : "Wartet auf Finanzamt"}
        </button>
      </form>
      <FristenListe fristen={fristen} heute={heute} ustOffenCent={topf.ustOffenCent} />
      <FinanzEuer euer={euer} jahre={jahre} jahrAktuell={jahr} />
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
