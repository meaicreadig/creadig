import type { Metadata } from "next"

import { AdminShell } from "@/components/admin/admin-shell"
import { UnavailableNote } from "@/components/admin/primitives"
import { FinanzKompass } from "@/components/admin/finanz/kompass"
import { FinanzAssistent } from "@/components/admin/finanz/assistent"
import { LiquiditaetsBand } from "@/components/admin/finanz/liquiditaet"
import { FristenListe } from "@/components/admin/finanz/fristen"
import { BuchungErfassen, BuchungsListe } from "@/components/admin/finanz/buchungen"
import { FinanzEinstellungen } from "@/components/admin/finanz/einstellungen"
import { berechneLage } from "@/lib/finanz/lage"
import { finanzDb } from "@/lib/finanz/store"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Finanzen", robots: { index: false, follow: false } }

export default async function FinanzSeite() {
  const db = await finanzDb().catch(() => null)
  if (!db) {
    return (
      <AdminShell title="Finanzen">
        <UnavailableNote title="Kein Speicher verbunden">
          Die Finanzabteilung braucht die Neon-Datenbank (LEAD_STORE=neon, DATABASE_URL).
        </UnavailableNote>
      </AdminShell>
    )
  }

  const { heute, einstellungen, buchungen, fristen, stand, topf, frei, bewegungen, wochen, verlauf, reichweite, hinweise } =
    await berechneLage(db)

  return (
    <AdminShell title="Finanzen" lead="Die Finanzabteilung von creaDIG. Vorne steht, was dich voranbringt – der Rest läuft im Hintergrund.">
      <div className="flex flex-col gap-10">
        <FinanzKompass stand={stand} frei={frei} topf={topf} reichweite={reichweite} hinweise={hinweise} verlauf={verlauf} />
        <FinanzAssistent />
        <LiquiditaetsBand wochen={wochen} topfCent={topf.gesamtCent} bewegungen={bewegungen} />
        <FristenListe fristen={fristen} heute={heute} ustOffenCent={topf.ustOffenCent} />
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <BuchungErfassen heute={heute} />
          </div>
          <div className="lg:col-span-3">
            <BuchungsListe buchungen={buchungen} heute={heute} />
          </div>
        </div>
        <FinanzEinstellungen e={einstellungen} />
      </div>
    </AdminShell>
  )
}
