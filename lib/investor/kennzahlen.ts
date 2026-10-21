import "server-only"

import { heuteBerlin, monate } from "@/lib/finanz/rechnen"
import { finanzDb, ladeAlles } from "@/lib/finanz/store"
import { ladePipelineChancen } from "@/lib/finanz/lage"
import { AGENTEN } from "@/lib/assistent/truppe"
import { ABTEILUNGEN } from "@/lib/zentrale/abteilungen"

export type InvestorKennzahlen = {
  stand: string
  /** null = keine Finanzdaten erreichbar. Es wird nie eine Zahl erfunden. */
  umsatz12Cent: number | null
  monate: { schluessel: string; einCent: number }[]
  wachstumProzent: number | null
  pipelineCent: number | null
  agenten: number
  abteilungenBesetzt: number
  abteilungenGesamt: number
}

export async function ladeInvestorKennzahlen(): Promise<InvestorKennzahlen> {
  const heute = heuteBerlin()
  const basis: InvestorKennzahlen = {
    stand: heute,
    umsatz12Cent: null,
    monate: [],
    wachstumProzent: null,
    pipelineCent: null,
    agenten: AGENTEN.length,
    abteilungenBesetzt: ABTEILUNGEN.filter((a) => a.besetzung !== "leer").length,
    abteilungenGesamt: ABTEILUNGEN.length,
  }
  try {
    const db = await finanzDb()
    if (!db) return basis
    const { buchungen } = await ladeAlles(db)
    const verlauf = monate(buchungen, heute, 12).map((m) => ({ schluessel: m.schluessel, einCent: m.einCent }))
    const umsatz = verlauf.reduce((s, m) => s + m.einCent, 0)
    /* Wachstum nur aus vollen Monaten: die letzten drei gegen die drei davor. */
    const voll = verlauf.slice(0, -1)
    const jetzt = voll.slice(-3).reduce((s, m) => s + m.einCent, 0)
    const davor = voll.slice(-6, -3).reduce((s, m) => s + m.einCent, 0)
    const pipeline = await ladePipelineChancen(db).catch(() => [])
    return {
      ...basis,
      umsatz12Cent: umsatz > 0 ? umsatz : null,
      monate: umsatz > 0 ? verlauf : [],
      wachstumProzent: davor > 0 ? Math.round(((jetzt - davor) / davor) * 100) : null,
      pipelineCent: pipeline.length ? pipeline.reduce((s, c) => s + c.wertCent, 0) : null,
    }
  } catch (e) {
    console.error("[investor] kennzahlen", e instanceof Error ? e.message : e)
    return basis
  }
}
