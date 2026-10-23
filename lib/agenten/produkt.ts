import "server-only"

import { generateText } from "ai"

import { bulletinStoff } from "@/lib/bulletin/agent"
import { finanzDb } from "@/lib/finanz/store"
import { ladeAbos } from "@/lib/finanz/abos"
import { firmenText, PRODUKTE } from "@/lib/firmenwahrheit"
import { legeAuftragAn } from "@/lib/koordination/koordinator"

import { berlinTag, json, MODELL, recherchiere, slug } from "./ki"

/**
 * PRODUKTMANAGEMENT — ein Produkt pro Tag, reihum.
 *
 * 23.10.2026: Die Abteilung stand seit dem Organigramm leer („nicht besetzt"),
 * obwohl stammo, fibero und CASSAMEA das Geld der nächsten Jahre sind.
 * Jetzt: Zahlen aus den eigenen Abos (MRR), Markt und Wettbewerb mit Quelle,
 * dazu das Bulletin — daraus höchstens zwei Fahrplan-Schritte, die als
 * Auftrag an Entwicklung, Marketing oder Vertrieb gehen. Nichts geht nach außen.
 */

const AN = ["entwicklung", "marketing", "vertrieb", "international"] as const

type Plan = {
  lage: string
  schritte: { titel: string; warum: string; aufwand: string; an: (typeof AN)[number] }[]
}

const monatlich = { monat: 1, quartal: 1 / 3, jahr: 1 / 12 } as const

/** MRR je Produkt aus fin_abos: ein Abo zählt zum Produkt, wenn sein Titel den Namen trägt. */
async function mrr(name: string): Promise<{ abos: number; mrrEur: number } | null> {
  const db = await finanzDb().catch(() => null)
  if (!db) return null
  const abos = (await ladeAbos(db).catch(() => [])).filter((a) => a.aktiv && a.titel.toLowerCase().includes(name.toLowerCase()))
  const cent = abos.reduce(
    (s, a) => s + a.positionen.filter((p) => !p.optional || p.gewaehlt).reduce((x, p) => x + p.menge * p.preisCent, 0) * monatlich[a.intervall],
    0,
  )
  return { abos: abos.length, mrrEur: Math.round(cent / 100) }
}

export async function produktRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const tag = berlinTag()
  const nr = Math.floor(Date.parse(`${tag}T00:00:00Z`) / 86_400_000) % PRODUKTE.length
  const p = PRODUKTE[nr]

  const [zahlen, markt, bulletin] = await Promise.all([
    mrr(p.name),
    recherchiere(
      `Produkt „${p.name}“ (${p.was}) im deutschsprachigen Raum: Welche Wettbewerber gibt es, was kosten sie, welche Funktionen haben sie neu eingeführt, und welche Gesetze oder Branchenänderungen der letzten 60 Tage betreffen diese Kunden?`,
    ).catch(() => null),
    bulletinStoff().catch(() => "—"),
  ])

  const { text } = await generateText({
    model: MODELL,
    prompt: `Du bist Produktmanager bei creaDIG.
${firmenText("kurz")}

Produkt heute: ${p.name} — ${p.was}. Stand: ${p.stand}.
Eigene Zahlen: ${zahlen ? `${zahlen.abos} aktive Abos, MRR ${zahlen.mrrEur} €` : "keine Abodaten"}.
Markt (Recherche mit Quellen): ${markt ?? "keine belegten Funde"}
Bulletin heute: ${bulletin}

Aufgabe: Lage in 2–3 Sätzen (was Zahlen und Markt sagen), dann höchstens 2 Fahrplan-Schritte für die nächsten 30 Tage, die Umsatz oder Bindung bringen. Jeder Schritt geht an genau eine Abteilung: entwicklung (Funktion bauen/ändern), marketing (Inhalt, Seite, Kampagne), vertrieb (Kundenansprache über bestehende Wege), international (anderes Land). Keine erfundenen Zahlen, keine Kaltakquise. Lieber 0 Schritte als ein schwacher.
Antworte NUR mit JSON: {"lage":"","schritte":[{"titel":"","warum":"mit Bezug auf Zahl oder Quelle","aufwand":"S|M|L","an":"entwicklung"}]}`,
  })
  const plan = json<Plan>(text)
  if (!plan?.lage) throw new Error(`Produktmanagement (${p.name}): kein gültiger Plan`)

  let n = 0
  for (const s of (plan.schritte ?? []).slice(0, 2)) {
    if (!s?.titel || !AN.includes(s.an)) continue
    const id = await legeAuftragAn({
      von: "produktmanagement",
      an: s.an,
      titel: `${p.name} · ${s.titel}`,
      inhalt: `Fahrplan-Schritt aus dem Produktmanagement (${tag}).\n\nWarum: ${s.warum}\nAufwand: ${s.aufwand}\n\nLage ${p.name}: ${plan.lage}${markt ? `\n\nQuellen:\n${markt}` : ""}`,
      quelle: `produkt:${tag}:${slug(p.name)}:${slug(s.titel)}`,
    })
    if (id) n++
  }
  return { ergebnis: `${p.name}: ${plan.lage.slice(0, 160)} – ${n} Fahrplan-Schritte verteilt`, anzahl: n }
}
