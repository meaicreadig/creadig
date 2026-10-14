import type { Metadata } from "next"

import { AdminShell } from "@/components/admin/admin-shell"
import { UnavailableNote } from "@/components/admin/primitives"
import { FinanzKompass } from "@/components/admin/finanz/kompass"
import { LiquiditaetsBand } from "@/components/admin/finanz/liquiditaet"
import { FristenListe } from "@/components/admin/finanz/fristen"
import { BuchungErfassen, BuchungsListe } from "@/components/admin/finanz/buchungen"
import { FinanzEinstellungen } from "@/components/admin/finanz/einstellungen"
import { eur } from "@/components/admin/finanz/format"
import {
  heuteBerlin,
  kompass,
  kontostandHeute,
  kuenftigeBewegungen,
  liquiditaet,
  monate,
  plusTage,
  reichweiteMonate,
  sollFristen,
  steuertopf,
} from "@/lib/finanz/rechnen"
import { finanzDb, ladeAlles, sichereFristen } from "@/lib/finanz/store"

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

  const heute = heuteBerlin()
  const erst = await ladeAlles(db)
  await sichereFristen(db, sollFristen(erst.einstellungen, heute))
  const { einstellungen, buchungen, fristen } = await ladeAlles(db)

  const stand = kontostandHeute(einstellungen, buchungen, heute)
  const topf = steuertopf(einstellungen, buchungen, fristen, heute)
  const frei = stand - topf.gesamtCent
  const bewegungen = kuenftigeBewegungen(buchungen, fristen, heute, plusTage(heute, 91))
  const wochen = liquiditaet(stand, bewegungen, heute)
  const verlauf = monate(buchungen, heute)
  const reichweite = reichweiteMonate(frei, verlauf)
  const hinweise = kompass({ freiCent: frei, topf, wochen, fristen, buchungen, verlauf, reichweite, heute, eur })

  return (
    <AdminShell title="Finanzen" lead="Die Finanzabteilung von creaDIG. Vorne steht, was dich voranbringt – der Rest läuft im Hintergrund.">
      <div className="flex flex-col gap-10">
        <FinanzKompass stand={stand} frei={frei} topf={topf} reichweite={reichweite} hinweise={hinweise} verlauf={verlauf} />
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
