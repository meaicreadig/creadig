import "server-only"

import { assistentDb } from "@/lib/assistent/store"
import { AGENTEN as ALLE_AGENTEN } from "@/lib/assistent/truppe"
import { legeAuftragAn } from "@/lib/koordination/koordinator"
import { ABTEILUNGEN } from "@/lib/zentrale/abteilungen"

import { kw } from "./ki"

/**
 * PERSONAL — die Personalabteilung des KI-Teams, ohne KI.
 *
 * 23.10.2026: Dass Produktmanagement, Einkauf und International monatelang
 * ohne Mitarbeiter blieben, musste der Owner selbst entdecken. Das ist die
 * Aufgabe dieser Abteilung: Jede Woche prüft sie, welche Abteilung niemanden
 * hat, wer gescheitert ist, wer eine Woche lang nichts geliefert hat und wer
 * gar nicht lief — und legt das als EIN Auftrag der Geschäftsführung vor.
 */

type Stat = { agent: string; laeufe: number; fehler: number; menge: number }

export async function personalRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const q = await assistentDb()
  if (!q) return { ergebnis: "Keine Datenbank", anzahl: 0 }
  const rows = (await q(
    `SELECT agent, count(*)::int AS laeufe, count(*) FILTER (WHERE fehler IS NOT NULL)::int AS fehler, coalesce(sum(anzahl), 0)::int AS menge
       FROM assistent_laeufe WHERE created_at > now() - interval '8 days' GROUP BY agent`,
    [],
  )) as Stat[]
  const stat = new Map(rows.map((r) => [r.agent, r]))
  /* Pausiert = bewusst angehalten (Katman 3), kein Personalproblem. */
  const { pausierteAgenten } = await import("@/lib/ergebnis/steuerung")
  const pausiert = await pausierteAgenten().catch(() => new Set<string>())
  const AGENTEN = ALLE_AGENTEN.filter((a) => !pausiert.has(a.key))

  const leer = ABTEILUNGEN.filter((a) => a.agenten.length === 0).map((a) => a.name.de)
  const nieGelaufen = AGENTEN.filter((a) => !stat.has(a.key)).map((a) => a.name)
  const scheitert = AGENTEN.filter((a) => {
    const s = stat.get(a.key)
    return s && s.fehler > 0 && s.fehler >= s.laeufe / 2
  }).map((a) => a.name)
  const liefertNichts = AGENTEN.filter((a) => {
    const s = stat.get(a.key)
    return a.ki && s && s.laeufe >= 2 && s.menge === 0 && s.fehler === 0
  }).map((a) => a.name)

  const punkte = [
    leer.length ? `Abteilungen ohne KI-Mitarbeiter: ${leer.join(", ")}` : null,
    nieGelaufen.length ? `Seit 8 Tagen nicht gelaufen: ${nieGelaufen.join(", ")}` : null,
    scheitert.length ? `Scheitert in mindestens der Hälfte der Läufe: ${scheitert.join(", ")}` : null,
    liefertNichts.length ? `Läuft, liefert aber seit einer Woche nichts: ${liefertNichts.join(", ")}` : null,
  ].filter(Boolean) as string[]

  const aktiv = AGENTEN.length - nieGelaufen.length
  if (!punkte.length) return { ergebnis: `${aktiv}/${AGENTEN.length} KI-Mitarbeiter aktiv, alle Abteilungen besetzt`, anzahl: 0 }

  const id = await legeAuftragAn({
    von: "personal",
    an: "geschaeftsfuehrung",
    titel: `KI-Team KW ${kw().split("-")[1]}: ${punkte.length} Personalthemen`,
    inhalt: `Wochenprüfung der Personalabteilung:\n\n${punkte.map((p) => `- ${p}`).join("\n")}\n\nBitte je Punkt entscheiden: Aufgabe schärfen, Zuständigkeit verschieben oder als Entwicklungsauftrag an Emin (Code). Lücken im Organigramm haben Vorrang.`,
    quelle: `personal:${kw()}`,
  })
  return { ergebnis: `${aktiv}/${AGENTEN.length} aktiv – ${punkte.length} Themen an die Geschäftsführung`, anzahl: id ? 1 : 0 }
}
