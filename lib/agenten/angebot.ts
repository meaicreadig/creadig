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
 * Jetzt liest der Automat Titel, Notizen, Verlauf der Chance UND die
 * Gesprächsnotizen der Person bzw. Firma und füllt den Entwurf: Positionen NUR
 * aus dem Leistungskatalog (fin_leistungen, mit dessen Preisen), Einleitung und
 * Schluss. Was der Katalog nicht hat, kommt als Position mit 0 € und „(Preis
 * prüfen)" – nie ein erfundener Preis. Jeder Entwurf wird genau einmal gefüllt
 * (Verlauf „ki-positionen"); danach gehört er Emin.
 *
 * Katman 4: Gefüllt heißt versandfertig – lib/ausfuehrung/angebot-hat.ts legt
 * die Ein-Klick-Karte „Angebot senden" an. Gesendet wird nur auf Emins Klick.
 */

const JE_LAUF = 3

type Db = NonNullable<Awaited<ReturnType<typeof finanzDb>>>
type Katalog = Awaited<ReturnType<typeof ladeLeistungen>>

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
  /* Katman 6: Geld-Hattı – Anzahlung, Schlussrechnung, Nachfrage. Läuft auch, wenn kein Entwurf zu füllen ist. */
  const { geldRunde } = await import("@/lib/ausfuehrung/geld-hat")
  const g = await geldRunde().catch((e) => {
    console.error("[angebot] geld", e instanceof Error ? e.message : e)
    return { anzahlung: 0, schluss: 0, nachfrage: 0 }
  })
  const geld = [g.anzahlung && `${g.anzahlung} Anzahlung`, g.schluss && `${g.schluss} Schlussrechnung`, g.nachfrage && `${g.nachfrage} Nachfrage`].filter(Boolean).join(", ")
  const geldN = g.anzahlung + g.schluss + g.nachfrage
  if (!entwuerfe.length) return { ergebnis: geld ? `Geld-Karten: ${geld}` : "Kein offener Angebots-Entwurf zu füllen", anzahl: geldN }

  const katalog = await ladeLeistungen(db, true)
  const { legeAngebotsKarte } = await import("@/lib/ausfuehrung/angebot-hat")
  let n = 0
  const { wartetAufGespraech } = await import("@/lib/ausfuehrung/vorbehalt")
  for (const e of entwuerfe) {
    if (await wartetAufGespraech(db, e.opportunity_id)) continue
    if (!(await fuelleAngebot(db, e.id, e.opportunity_id, katalog))) continue
    n++
    await legeAngebotsKarte(db, e.id).catch((err) => console.error("[angebot] karte", err instanceof Error ? err.message : err))
  }
  const basis = n ? `${n} Angebote gefüllt und als Ein-Klick-Karte „Angebot senden“ vorgelegt` : "Entwürfe geprüft, keiner gefüllt"
  return { ergebnis: geld ? `${basis} · Geld-Karten: ${geld}` : basis, anzahl: n + geldN }
}

/** Einen Angebots-Entwurf genau einmal füllen. `false`, wenn nichts zu tun war oder die KI nichts Brauchbares lieferte. */
export async function fuelleAngebot(db: Db, dokId: string, oppId: string, katalogIn?: Katalog): Promise<boolean> {
  const dok = await ladeDokument(db, dokId)
  if (!dok || dok.status !== "entwurf") return false
  if ((await ladeVerlauf(db, dokId)).some((v) => v.aktion === "ki-positionen")) return false
  const katalog = katalogIn ?? (await ladeLeistungen(db, true))
  const katalogText = katalog
    .map((l) => `- ${l.id}: ${l.titel} – ${(l.preisCent / 100).toLocaleString("de-DE")} € je ${l.einheit}${l.beschreibung ? ` (${l.beschreibung.slice(0, 160)})` : ""}`)
    .join("\n")

  const [chance] = (await db(
    `SELECT o.title, o.note, o.estimated_value, o.offer_kind, o.contact_id, o.organisation_id, org.name AS firma
       FROM opportunities o LEFT JOIN organisations org ON org.id = o.organisation_id WHERE o.id = $1`,
    [oppId],
  )) as { title: string; note: string | null; estimated_value: number | null; offer_kind: string | null; contact_id: string | null; organisation_id: string | null; firma: string | null }[]
  if (!chance) return false
  /* Verlauf der Chance + Gespräche mit der Person oder anderen Kontakten derselben Firma. */
  const chronik = ((await db(
    `SELECT kind, summary, coalesce(detail, '') AS detail, created_at::date::text AS am FROM activities
      WHERE (subject_type = 'opportunity' AND subject_id = $1)
         OR (kind LIKE 'gespraech%' AND subject_type = 'contact'
             AND (subject_id = $2 OR subject_id IN (SELECT id FROM contacts WHERE organisation_id = $3)))
      ORDER BY created_at DESC LIMIT 14`,
    [oppId, chance.contact_id, chance.organisation_id],
  ).catch(() => [])) as { kind: string; summary: string; detail: string; am: string }[])
    .map((a) => `- ${a.am} ${a.summary}${a.detail ? `: ${a.detail.slice(0, a.kind.startsWith("gespraech") ? 1500 : 300)}` : ""}`)
    .join("\n")

  const { text } = await generateText({
    model: MODELL,
    prompt: `Du schreibst für creaDIG Solutions ein Angebot (Entwurf, Emin prüft vor dem Versand).
${firmenText("kurz")}

Chance: ${chance.title}${chance.firma ? ` · Kunde: ${chance.firma}` : ""}
Geschätzter Wert laut Vertrieb: ${chance.estimated_value ? `${chance.estimated_value} €` : "unbekannt"}${chance.offer_kind ? ` · Angebotsart: ${chance.offer_kind}` : ""}
Notizen: ${chance.note?.slice(0, 1500) ?? "—"}
Verlauf und Gespräche:
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
  if (!v?.positionen?.length) return false

  const ust = dok.positionen[0]?.ustSatz ?? 19
  const positionen: Position[] = v.positionen.slice(0, 8).flatMap((p): Position[] => {
    const k = p.katalogId ? katalog.find((l) => l.id === p.katalogId) : undefined
    if (k)
      return [{ titel: k.titel, beschreibung: p.beschreibung?.trim() || k.beschreibung, menge: Math.max(1, Number(p.menge) || 1), einheit: k.einheit, preisCent: k.preisCent, ustSatz: k.ustSatz, optional: Boolean(p.optional), gewaehlt: !p.optional }]
    if (!p.titel?.trim()) return []
    return [{ titel: `${p.titel.trim()} (Preis prüfen)`, beschreibung: p.beschreibung?.trim() ?? "", menge: Math.max(1, Number(p.menge) || 1), einheit: "Pauschal", preisCent: 0, ustSatz: ust, optional: Boolean(p.optional), gewaehlt: !p.optional }]
  })
  if (!positionen.length) return false

  const ok = await speichereEntwurf(db, dokId, {
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
  if (!ok) return false
  await verlauf(db, dokId, "ki-positionen", { vorher: dok.positionen.length, nachher: positionen.length, offenePreise: positionen.filter((p) => p.preisCent === 0).length })
  return true
}
