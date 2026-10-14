import "server-only"

import { eur } from "@/components/finanz/format"
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
import { ladeAlles, sichereFristen, type finanzDb } from "@/lib/finanz/store"

type Db = NonNullable<Awaited<ReturnType<typeof finanzDb>>>

/** Ein Rechengang für Seite und Assistent – beide sehen exakt dieselben Zahlen. */
export async function berechneLage(db: Db) {
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

  return { heute, einstellungen, buchungen, fristen, stand, topf, frei, bewegungen, wochen, verlauf, reichweite, hinweise }
}

export type Lage = Awaited<ReturnType<typeof berechneLage>>
