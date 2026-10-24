import "server-only"

import { generateText } from "ai"

import { ladeDokument, ladeLeistungen, ladeVerlauf, speichereEntwurf, verlauf } from "@/lib/finanz/auftraege/store"
import type { Position } from "@/lib/finanz/auftraege/rechnen"
import { finanzDb } from "@/lib/finanz/store"
import { firmenText } from "@/lib/firmenwahrheit"

import { json, MODELL } from "./ki"

/**
 * ANGEBOTSAUTOMAT — vom Gespräch zum prüffertigen Angebot.
 *
 * 24.10.2026 neu. Finanz legt für jede Chance in „Angebot"/„Verhandlung" einen
 * Entwurf an — bis hierher mit genau einer Pauschal-Zeile (geschätzter Wert)
 * oder ganz leer. Emin musste das Angebot trotzdem selbst schreiben.
 *
 * Jetzt liest der Automat Titel, Notizen und Verlauf der Chance und füllt den
 * Entwurf: Positionen NUR aus dem Leistungskatalog (fin_leistungen, mit dessen
 * Preisen), Einleitung und Schluss. Was der Katalog nicht hat, kommt als
 * Position mit 0 € und „(Preis prüfen)" – nie ein erfundener Preis. Jeder
 * Entwurf wird genau einmal gefüllt (Verlauf „ki-positionen"); danach gehört er
 * Emin. Festschreiben und Senden bleiben sein Klick in /finanz/vorgang/<id>.
 */

const JE_LAUF = 3

type Vorschlag = {
  titel: string
  einleitung: string
  schluss: string
  positionen: { katalogId?: string; titel?: string; beschreibung?: string; menge: number; optional?: boolean }[]
}

export async function angebotsRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const db = await finanzDb().catch(() => null)
  if (!db) return { ergebnis: "Keine Finanzdatenbank", anzahl: 0 }

  const entwuerfe = (await db(
    `SELECT d.id, d.opportunity_id FROM fin_dokumente d
      WHERE d.art = 'angebot' AND d.status = 'entwurf' AND d.opportunity_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM fin_dokument_verlauf v WHERE v.dokument_id = d.id AND v.aktion = 'ki-positionen')
      ORDER BY d.created_at DESC LIMIT $1`,
    [JE_LAUF],
  )) as { id: string; opportunity_id: string }[]
  if (!entwuerfe.length) return { ergebnis: "Kein offener Angebots-Entwurf zu füllen", anzahl: 0 }

  const katalog = await ladeLeistungen(db, true)
  const katalogText = katalog
    .map((l) => `- ${l.id}: ${l.titel} – ${(l.preisCent / 100).toLocaleString("de-DE")} € je ${l.einheit}${l.beschreibung ? ` (${l.beschreibung.slice(0, 160)})` : ""}`)
    .join("\n")

  let n = 0
  for (const e of entwuerfe) {
    const dok = await ladeDokument(db, e.id)
    if (!dok || dok.status !== "entwurf") continue
    if ((await ladeVerlauf(db, e.id)).some((v) => v.aktion === "ki-positionen")) continue

    const [chance] = (await db(
      `SELECT o.title, o.note, o.estimated_value, o.offer_kind, org.name AS firma
         FROM opportunities o LEFT JOIN organisations org ON org.id = o.organisation_id WHERE o.id = $1`,
      [e.opportunity_id],
    )) as { title: string; note: string | null; estimated_value: number | null; offer_kind: string | null; firma: string | null }[]
    if (!chance) continue
    const chronik = ((await db(
      `SELECT kind, summary, coalesce(detail, '') AS detail, created_at::date::text AS am FROM activities
        WHERE subject_type = 'opportunity' AND subject_id = $1 ORDER BY created_at DESC LIMIT 12`,
      [e.opportunity_id],
    ).catch(() => [])) as { kind: string; summary: string; detail: string; am: string }[])
      .map((a) => `- ${a.am} ${a.summary}${a.detail ? `: ${a.detail.slice(0, 300)}` : ""}`)
      .join("\n")

    const { text } = await generateText({
      model: MODELL,
      prompt: `Du schreibst für creaDIG Solutions ein Angebot (Entwurf, Emin prüft vor dem Versand).
${firmenText("kurz")}

Chance: ${chance.title}${chance.firma ? ` · Kunde: ${chance.firma}` : ""}
Geschätzter Wert laut Vertrieb: ${chance.estimated_value ? `${chance.estimated_value} €` : "unbekannt"}${chance.offer_kind ? ` · Angebotsart: ${chance.offer_kind}` : ""}
Notizen: ${chance.note?.slice(0, 1500) ?? "—"}
Verlauf:
${chronik || "—"}

Leistungskatalog (ID: Titel – Preis):
${katalogText || "—"}

Regeln:
- Positionen bevorzugt aus dem Katalog, über "katalogId". Preise kommen automatisch aus dem Katalog – nenne nie selbst einen Preis.
- Was der Katalog nicht abdeckt, aber im Gespräch vereinbart ist: Position mit "titel" und "beschreibung" ohne katalogId (wird mit 0 € und "Preis prüfen" angelegt).
- Wiederkehrendes (Betreuung) als eigene Position. Sinnvolle Zusatzleistung höchstens einmal als "optional": true.
- "einleitung": 2–3 Sätze per Sie mit Bezug auf das Gespräch. "schluss": 1–2 Sätze (nächster Schritt, Ansprechpartner Emin). Nichts erfinden.
Antworte NUR mit JSON: {"titel":"","einleitung":"","schluss":"","positionen":[{"katalogId":"","titel":"","beschreibung":"","menge":1,"optional":false}]}`,
    })
    const v = json<Vorschlag>(text)
    if (!v?.positionen?.length) continue

    const ust = dok.positionen[0]?.ustSatz ?? 19
    const positionen: Position[] = v.positionen.slice(0, 8).flatMap((p): Position[] => {
      const k = p.katalogId ? katalog.find((l) => l.id === p.katalogId) : undefined
      if (k)
        return [{ titel: k.titel, beschreibung: p.beschreibung?.trim() || k.beschreibung, menge: Math.max(1, Number(p.menge) || 1), einheit: k.einheit, preisCent: k.preisCent, ustSatz: k.ustSatz, optional: Boolean(p.optional), gewaehlt: !p.optional }]
      if (!p.titel?.trim()) return []
      return [{ titel: `${p.titel.trim()} (Preis prüfen)`, beschreibung: p.beschreibung?.trim() ?? "", menge: Math.max(1, Number(p.menge) || 1), einheit: "Pauschal", preisCent: 0, ustSatz: ust, optional: Boolean(p.optional), gewaehlt: !p.optional }]
    })
    if (!positionen.length) continue

    const ok = await speichereEntwurf(db, e.id, {
      sprache: dok.sprache,
      titel: v.titel?.trim() || dok.titel,
      kunde: dok.kunde,
      datum: dok.datum,
      gueltigBis: dok.gueltigBis,
      zahlungszielTage: dok.zahlungszielTage,
      leistungszeitraum: dok.leistungszeitraum,
      einleitung: v.einleitung?.trim() || dok.einleitung,
      schluss: v.schluss?.trim() || dok.schluss,
      rabattProzent: dok.rabattProzent,
      geschaeftsfeld: dok.geschaeftsfeld,
      positionen,
    })
    if (!ok) continue
    await verlauf(db, e.id, "ki-positionen", { vorher: dok.positionen.length, nachher: positionen.length, offenePreise: positionen.filter((p) => p.preisCent === 0).length })
    n++
  }
  return { ergebnis: n ? `${n} Angebots-Entwürfe mit Positionen und Text gefüllt – Prüfen und Senden bleibt dein Klick` : "Entwürfe geprüft, keiner gefüllt", anzahl: n }
}
