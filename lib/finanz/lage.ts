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
import { paragraph19Projektion, paragraph19Status } from "@/lib/finanz/paragraph19"
import { ladeFelder } from "@/lib/finanz/felder"
import { offeneBeratungsZieleCent } from "@/lib/finanz/ziele"

type Db = NonNullable<Awaited<ReturnType<typeof finanzDb>>>

/** Ein Rechengang für Seite und Assistent – beide sehen exakt dieselben Zahlen. */
export async function berechneLage(db: Db) {
  const heute = heuteBerlin()
  const erst = await ladeAlles(db)
  /* Nur neu laden, wenn wirklich eine Frist gefehlt hat — sonst reicht der erste Lauf. */
  const vorhanden = new Set(erst.fristen.map((f) => f.id))
  const fehlend = sollFristen(erst.einstellungen, heute).filter((f) => !vorhanden.has(f.id))
  if (fehlend.length) await sichereFristen(db, fehlend)
  const { einstellungen, buchungen, fristen } = fehlend.length ? await ladeAlles(db) : erst

  const stand = kontostandHeute(einstellungen, buchungen, heute)
  const topf = steuertopf(einstellungen, buchungen, fristen, heute)
  const frei = stand - topf.gesamtCent
  const bewegungen = kuenftigeBewegungen(buchungen, fristen, heute, plusTage(heute, 91))
  const wochen = liquiditaet(stand, bewegungen, heute)
  const verlauf = monate(buchungen, heute)
  const reichweite = reichweiteMonate(frei, verlauf)
  const { felder } = await ladeFelder(db, heute.slice(0, 4))
  const hinweise = kompass({ freiCent: frei, topf, wochen, fristen, buchungen, verlauf, reichweite, heute, eur, felder })
  const paragraph19 = einstellungen.ustPflichtig ? null : paragraph19Status(buchungen, heute)
  const paragraph19Vorschau = paragraph19 ? paragraph19Projektion(paragraph19, await offeneBeratungsZieleCent(db, heute)) : null
  if (paragraph19 && paragraph19.ampel !== "ruhig") {
    hinweise.unshift({
      schwere: paragraph19.ampel === "ueberschritten" ? "critical" : paragraph19.ampel === "kritisch" ? "critical" : "attention",
      text:
        paragraph19.ampel === "ueberschritten"
          ? paragraph19.vorjahrUeberschritten
            ? `Vorjahresumsatz ${eur(paragraph19.vorjahrUmsatzCent)} liegt über der § 19-Grenze (25.000 €) — § 19 gilt dieses Jahr eigentlich nicht mehr. Mit dem Steuerberater klären.`
            : `Umsatz im laufenden Jahr hat am ${paragraph19.ueberschrittenAm} die § 19-Grenze (100.000 €) überschritten — ab da ist keine Rechnung mehr ohne USt zulässig.`
          : `§ 19-Umsatzgrenze (laufendes Jahr): ${eur(paragraph19.laufendesJahrUmsatzCent)} von 100.000 € — noch ${eur(paragraph19.abstandLaufendesJahrCent)} Luft.`,
    })
  }

  return { heute, einstellungen, buchungen, fristen, stand, topf, frei, bewegungen, wochen, verlauf, reichweite, hinweise, paragraph19, paragraph19Vorschau }
}

export type Lage = Awaited<ReturnType<typeof berechneLage>>
