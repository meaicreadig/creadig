import "server-only"

import { generateText } from "ai"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"
import type { Deal } from "@/lib/verkaufen"

const MODELL = "openai/gpt-5.4-mini"

export type Entwurf = { betreff: string; text: string; erstellt: string }

const ZIEL: Record<Deal["stufe"], string> = {
  new: "Erstkontakt: kurz vorstellen, ein konkretes Problem des Betriebs ansprechen, 20-Minuten-Gespräch vorschlagen.",
  contacted: "Freundlich nachfassen, einen neuen Nutzen nennen, zwei Terminvorschläge machen.",
  qualified: "Bedarfsgespräch vereinbaren, 3 Fragen zur Vorbereitung stellen.",
  discovery: "Gespräch zusammenfassen, verstandene Ziele spiegeln, nächsten Schritt (Analyse/Angebot) mit Datum vorschlagen.",
  audit: "Analyse-Ergebnis ankündigen, Termin zur Vorstellung vorschlagen.",
  proposal: "Zum Angebot nachfassen, offene Fragen anbieten zu klären, Entscheidungstermin erfragen.",
  negotiation: "Verhandlung abschließen: Paketoptionen (Umfang/Preis-Spanne) anbieten, Starttermin vorschlagen, Unterschrift erleichtern.",
}

async function tabelle(q: Abfrage) {
  await q(
    `CREATE TABLE IF NOT EXISTS verkaufen_entwuerfe (
       deal_id text PRIMARY KEY, betreff text NOT NULL, text text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
     )`,
    [],
  )
}

export async function ladeEntwuerfe(): Promise<Record<string, Entwurf>> {
  const q = neonAbfrage()
  if (!q) return {}
  try {
    await tabelle(q)
    const rows = await q(`SELECT deal_id, betreff, text, created_at FROM verkaufen_entwuerfe`, [])
    return Object.fromEntries(
      rows.map((r) => [r.deal_id as string, { betreff: r.betreff as string, text: r.text as string, erstellt: new Date(r.created_at as string).toISOString() }]),
    )
  } catch {
    return {}
  }
}

export async function erstelleEntwurf(deal: Deal): Promise<void> {
  const q = neonAbfrage()
  if (!q) throw new Error("Speicher nicht verfügbar")
  await tabelle(q)
  const { text: roh } = await generateText({
    model: MODELL,
    system:
      "Du schreibst Geschäftsmails für Muhammed Emin Akyol, Inhaber von creaDIG Solutions (System-Haus für digitale Betriebe: Software, Web, Automatisierung). " +
      "Deutsch, Sie-Form, warm und selbstbewusst, konkret, höchstens 140 Wörter, keine Floskeln, keine erfundenen Fakten, Zahlen oder Referenzen. " +
      "Antworte exakt im Format: erste Zeile 'Betreff: …', dann Leerzeile, dann der Mailtext mit Gruß 'Muhammed Emin Akyol · creaDIG Solutions'.",
    prompt: [
      `Ziel der Mail: ${ZIEL[deal.stufe]}`,
      `Firma: ${deal.firma ?? "unbekannt"}`,
      `Ansprechpartner: ${deal.person ?? "unbekannt (neutrale Anrede)"}`,
      `Vorhaben: ${deal.titel}`,
      deal.wert ? `Volumen intern ca. ${deal.wert} € (nicht nennen, außer als Paket-Spanne in der Verhandlung)` : "Noch kein Preis besprochen — keinen Preis nennen.",
      deal.naechsterSchritt ? `Vereinbarter nächster Schritt: ${deal.naechsterSchritt}` : "",
      deal.tageStill ? `Seit ${deal.tageStill} Tagen kein Kontakt.` : "",
    ].filter(Boolean).join("\n"),
  })
  const [kopf, ...rest] = roh.trim().split("\n")
  const betreff = kopf.replace(/^Betreff:\s*/i, "").trim().slice(0, 160) || deal.titel
  const text = rest.join("\n").trim().slice(0, 4000)
  await q(
    `INSERT INTO verkaufen_entwuerfe (deal_id, betreff, text, created_at) VALUES ($1, $2, $3, now())
     ON CONFLICT (deal_id) DO UPDATE SET betreff = EXCLUDED.betreff, text = EXCLUDED.text, created_at = now()`,
    [deal.id, betreff, text],
  )
}
