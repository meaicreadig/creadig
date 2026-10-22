import "server-only"

import { assistentDb, ergaenzeExtra, type FreigabeExtra } from "@/lib/assistent/store"
import { legeAuftragAn } from "@/lib/koordination/koordinator"
import { abteilungVonAgent } from "@/lib/zentrale/abteilungen"

import { pruefeText } from "./regeln"

export { pruefeText, VERBOTENE_BEHAUPTUNGEN } from "./regeln"

/**
 * Abteilung Qualität — Bilgi Bekçisi (Wissenswächter).
 * Liest jeden offenen Entwurf, der nach außen gehen soll, gegen das, was über
 * creaDIG wahr ist: keine Zertifizierungen, Einzelunternehmen, Gründungsdaten,
 * Telekom & Co. nie als Kunden, nur öffentliche Preise. Ein Treffer wird am
 * Entwurf vermerkt (du siehst ihn vor der Freigabe) und geht als Auftrag an die
 * Abteilung, die den Entwurf geschrieben hat. Gelöscht oder geändert wird nichts.
 */

type Offen = { id: string; titel: string; inhalt: string; betreff: string | null; agent: string | null; wissen: string | null }

export async function wissensRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const q = await assistentDb()
  if (!q) return { ergebnis: "Keine Datenbank", anzahl: 0 }
  const rows = (await q(
    `SELECT id, titel, inhalt, betreff, agent, extra->>'wissen' AS wissen
       FROM assistent_freigaben
      WHERE status = 'offen' AND art IN ('mail','linkedin','kapital')
      ORDER BY created_at DESC LIMIT 100`,
    [],
  )) as Offen[]

  let geprueft = 0
  let treffer = 0
  for (const f of rows) {
    geprueft++
    const gruende = pruefeText(`${f.titel}\n${f.betreff ?? ""}\n${f.inhalt}`)
    const vermerk = gruende.join(" · ")
    if (!gruende.length || vermerk === f.wissen) continue
    treffer++
    await ergaenzeExtra(f.id, { wissen: vermerk } as unknown as FreigabeExtra)
    const abt = abteilungVonAgent(f.agent)
    await legeAuftragAn({
      von: "qualitaet",
      an: abt?.id ?? "geschaeftsfuehrung",
      titel: `Falsche Aussage im Entwurf: ${f.titel}`.slice(0, 160),
      inhalt: [
        `Der Wissenswächter hat im offenen Entwurf „${f.titel}“ (${f.agent ?? "unbekannt"}) gefunden:`,
        ...gruende.map((g) => `- ${g}`),
        "",
        "Bitte die Vorlage bzw. Regel des Agenten so ändern, dass diese Aussage nicht mehr entsteht. Den Entwurf selbst entscheidet Emin.",
      ].join("\n"),
      quelle: `wissen:${f.id}`,
    })
  }
  return {
    ergebnis: treffer ? `${geprueft} Entwürfe geprüft · ${treffer} mit falscher Aussage markiert` : `${geprueft} Entwürfe geprüft · alle sauber`,
    anzahl: treffer,
  }
}
