import "server-only"

import { randomUUID } from "node:crypto"

import { generateText } from "ai"

import { MODELL, json } from "@/lib/agenten/ki"
import { legeFreigabeAn, quelleBekannt } from "@/lib/assistent/store"
import { dokumentUrl, sendeDokumentMail } from "@/lib/finanz/auftraege/mail"
import { berechne } from "@/lib/finanz/auftraege/rechnen"
import { ladeDokument, schreibeFest, speichereEntwurf, verlauf, vermerkeNachfass } from "@/lib/finanz/auftraege/store"
import { legeEntwurfAusGewinn } from "@/lib/finanz/auftraege/aus-vertrieb"
import { finanzDb } from "@/lib/finanz/store"
import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * TEKLİF HATTI — vom Gespräch zum versendeten Angebot (Katman 4, 24.10.2026).
 *
 * Vorher: Finanz öffnete nur eine Aufgabe „Angebot prüfen“, und der
 * Angebotsautomat sah die Gesprächsnotizen nie (sie hängen am Kontakt).
 * Jetzt, ohne Zwischenschritt für Emin:
 *
 *   Gespräch notiert → KI liest: wurde ein Angebot vereinbart?
 *     → Chance anlegen bzw. auf „Angebot“ setzen → Entwurf in Finanz
 *     → Positionen aus dem Katalog + Text aus dem Gespräch
 *     → Karte „Angebot senden“ (Mail mit Kundenlink + PDF) bei Emin
 *   Emin klickt → festschreiben (Nummer) → Mail an den Kunden.
 *   Kunde nimmt online an → lib/ausfuehrung/lieferung-hat.ts übernimmt.
 *
 * Positionen mit „(Preis prüfen)“ und 0 € blockieren den Versand – ein
 * Angebot mit erfundenem oder fehlendem Preis geht nie raus.
 */

type Db = NonNullable<Awaited<ReturnType<typeof finanzDb>>>
async function chanceVon(db: Db, dokId: string): Promise<string | null> {
  const r = (await db(`SELECT opportunity_id FROM fin_dokumente WHERE id = $1`, [dokId]).catch(() => [])) as { opportunity_id: string | null }[]
  return r[0]?.opportunity_id ?? null
}
const eur = (cent: number) => `${(cent / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`

/** Fertige Karte „Angebot senden“ für einen gefüllten Entwurf. Idempotent je Dokument. */
export async function legeAngebotsKarte(db: Db, dokId: string): Promise<string | null> {
  const quelle = `angebot-senden:${dokId}`
  if (await quelleBekannt(quelle)) return null
  const d = await ladeDokument(db, dokId)
  if (!d || d.art !== "angebot" || d.status !== "entwurf") return null
  const opp0 = await chanceVon(db, d.id)
  if (opp0) {
    const { wartetAufGespraech } = await import("./vorbehalt")
    if (await wartetAufGespraech(db, opp0)) return null
  }
  const summen = berechne(d.positionen.filter((p) => !p.optional || p.gewaehlt), d.rabattProzent, d.steuerModus ?? "normal")
  const offen = d.positionen.filter((p) => p.preisCent === 0)
  const oppId = await chanceVon(db, d.id)
  const zeilen = d.positionen.map((p) => `• ${p.titel}${p.optional ? " (optional)" : ""} – ${p.menge} × ${eur(p.preisCent)}${p.einheit ? ` / ${p.einheit}` : ""}`)
  return legeFreigabeAn({
    art: "mail",
    titel: `Angebot senden: ${d.titel || d.kunde.firma || d.kunde.name}`.slice(0, 160),
    betreff: `Ihr Angebot: ${d.titel}`.slice(0, 160),
    empfaenger: d.kunde.email || null,
    inhalt: [
      `Kunde: ${[d.kunde.firma, d.kunde.name].filter(Boolean).join(" · ") || "—"}`,
      "",
      ...zeilen,
      "",
      `Summe netto: ${eur(summen.nettoCent)} · brutto: ${eur(summen.bruttoCent)}`,
      offen.length ? `\n⚠ ${offen.length} Position(en) ohne Preis – vor dem Senden im Entwurf ergänzen: /finanz/vorgang/${d.id}` : "",
      "",
      `Entwurf ansehen oder ändern: /finanz/vorgang/${d.id}`,
      "Beim Freigeben wird das Angebot festgeschrieben (Nummer) und als Mail mit Kundenlink und PDF verschickt. Der Kunde kann online annehmen; danach startet das Projekt von selbst.",
    ]
      .filter((z) => z !== null)
      .join("\n")
      .trim(),
    quelle,
    agent: "angebot",
    extra: {
      dokumentId: d.id,
      warum: "Aus Gespräch und Leistungskatalog vorbereitet – Positionen und Preise vor dem Senden prüfen.",
      ...(oppId ? { bezug: `opportunity:${oppId}` } : {}),
    },
  })
}

export type AngebotVersand = { ok: true; nummer: string } | { ok: false; grund: string }

/** Emins Klick an der Karte: festschreiben und senden. Nie ohne Freigabe aufgerufen. */
/**
 * Karte mit `extra.dokumentId` freigegeben: Angebot ODER Rechnung festschreiben
 * und versenden (Katman 6: auch Anzahlungs- und Schlussrechnung), bzw. bei
 * `nachfrage` die Nachfrage-Mail zu einem schon versendeten Angebot.
 */
export async function sendeAngebotAusFreigabe(dokId: string, empfaenger: string | null, art: "versand" | "nachfrage" = "versand"): Promise<AngebotVersand> {
  const db = await finanzDb().catch(() => null)
  if (!db) return { ok: false, grund: "Finanzdatenbank nicht erreichbar." }
  const d = await ladeDokument(db, dokId)
  if (!d || (d.art !== "angebot" && d.art !== "rechnung")) return { ok: false, grund: "Dokument nicht gefunden." }
  const name = d.art === "angebot" ? "Angebot" : "Rechnung"
  if (art === "nachfrage") {
    if (d.art !== "angebot" || d.status !== "versendet") return { ok: false, grund: `Angebot ist ${d.status} – keine Nachfrage nötig.` }
    const mail = await sendeDokumentMail(d, "nachfrage")
    if (!mail.ok) return { ok: false, grund: `Nachfrage nicht gesendet: ${mail.grund}` }
    await vermerkeNachfass(db, d.id, null)
    return { ok: true, nummer: d.nummer ?? d.id }
  }
  if (d.status !== "entwurf") return { ok: false, grund: `${name} ist schon ${d.status}.` }
  const offen = d.positionen.filter((p) => p.preisCent === 0)
  if (offen.length) return { ok: false, grund: `${offen.length} Position(en) ohne Preis („${offen[0].titel}“) – bitte erst im Entwurf ergänzen: /finanz/vorgang/${d.id}` }
  /* Emin hat an der Karte eine Adresse eingetragen, die im Entwurf fehlte. */
  const an = empfaenger?.trim()
  if (an && an !== d.kunde.email) {
    await speichereEntwurf(db, d.id, { ...d, kunde: { ...d.kunde, email: an } })
  }
  const fest = await schreibeFest(db, d.id)
  if (!fest.ok) return { ok: false, grund: `${fest.fehler.join(" · ")} – /finanz/vorgang/${d.id}` }
  const mail = await sendeDokumentMail(fest.dok, "versand")
  await verlauf(db, d.id, "versand-aus-freigabe", { mail: mail.ok })
  if (!mail.ok) return { ok: false, grund: `${fest.dok.nummer} festgeschrieben, Mail nicht gesendet: ${mail.grund} Kundenlink: ${fest.dok.token ? dokumentUrl(fest.dok.token) : "—"}` }
  const oppId = d.art === "angebot" ? await chanceVon(db, d.id) : null
  if (oppId) {
    await db(`UPDATE opportunities SET last_contact_at = now(), updated_at = now(), status = CASE WHEN status IN ('new','contacted','qualified','discovery','audit') THEN 'proposal' ELSE status END WHERE id = $1`, [
      oppId,
    ]).catch(() => null)
  }
  return { ok: true, nummer: fest.dok.nummer ?? d.id }
}

type Einschaetzung = { angebot: boolean; titel: string; art: "website" | "pruefung" | "behebung" | "systemprojekt" | "betrieb"; grund: string }

/**
 * Nach jedem notierten Gespräch: Wurde ein Angebot vereinbart? Dann läuft die
 * ganze Kette bis zur Karte. Wirft nie – das Gespräch ist schon gespeichert.
 */
export async function angebotAusGespraech(q: Abfrage, kontaktId: string, gespraechId: string): Promise<string | null> {
  const [g] = (await q(`SELECT summary, coalesce(detail,'') AS detail, data FROM activities WHERE id = $1`, [gespraechId])) as {
    summary: string
    detail: string
    data: { folge?: string | null; abschnitte?: Record<string, string> } | null
  }[]
  if (!g) return null
  const notiz = [g.summary, g.detail, g.data?.folge ? `Nächster Schritt: ${g.data.folge}` : "", ...Object.values(g.data?.abschnitte ?? {})].filter(Boolean).join("\n").slice(0, 4000)
  /* Billiger Vorfilter: ohne eines dieser Wörter keine KI-Kosten. */
  if (!/angebot|preis|kosten|kostenvoranschlag|teklif|fiyat|offer|quote|auftrag|budget/i.test(notiz)) return null

  const { text } = await generateText({
    model: MODELL,
    maxOutputTokens: 400,
    prompt: `Gesprächsnotiz von creaDIG Solutions:
"""${notiz}"""
Wurde im Gespräch vereinbart oder gewünscht, dass creaDIG ein Angebot schickt? Nur "true", wenn das klar aus der Notiz hervorgeht (nicht bei bloßem Interesse).
Antworte NUR mit JSON: {"angebot":true|false,"titel":"kurzer Angebotstitel","art":"website|pruefung|behebung|systemprojekt|betrieb","grund":"1 Satz mit Beleg aus der Notiz"}`,
  })
  const e = json<Einschaetzung>(text)
  if (!e?.angebot) return null

  const [k] = (await q(`SELECT name, organisation_id FROM contacts WHERE id = $1 AND excluded_reason IS NULL`, [kontaktId])) as { name: string; organisation_id: string | null }[]
  if (!k) return null

  /* Offene Chance der Person/Firma nehmen – sonst eine neue anlegen. */
  const offen = (await q(
    `SELECT id, status FROM opportunities
      WHERE status NOT IN ('won','lost') AND excluded_reason IS NULL
        AND (contact_id = $1 OR ($2::text IS NOT NULL AND organisation_id = $2))
      ORDER BY updated_at DESC LIMIT 1`,
    [kontaktId, k.organisation_id],
  )) as { id: string; status: string }[]
  let oppId = offen[0]?.id
  const art = ["website", "pruefung", "behebung", "systemprojekt", "betrieb"].includes(e.art) ? e.art : null
  if (!oppId) {
    oppId = `opp-${randomUUID().slice(0, 8)}`
    await q(
      `INSERT INTO opportunities (id, organisation_id, contact_id, title, status, source, offer_kind, note, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'proposal', 'gespraech', $5, $6, now(), now())`,
      [oppId, k.organisation_id, kontaktId, (e.titel || `Angebot für ${k.name}`).slice(0, 160), art, `Aus Gespräch: ${e.grund}`.slice(0, 1000)],
    )
  } else {
    await q(
      `UPDATE opportunities SET status = CASE WHEN status IN ('new','contacted','qualified','discovery','audit') THEN 'proposal' ELSE status END,
              offer_kind = coalesce(offer_kind, $2), note = concat_ws(E'\\n', nullif(note,''), $3::text), updated_at = now()
        WHERE id = $1`,
      [oppId, art, `Angebot vereinbart (Gespräch): ${e.grund}`.slice(0, 600)],
    )
  }
  await q(
    `INSERT INTO activities (id, subject_type, subject_id, kind, summary, detail, actor, origin, created_at)
     VALUES ($1, 'opportunity', $2, 'angebot.vereinbart', 'Angebot im Gespräch vereinbart', $3, 'angebot', 'AGENT', now())`,
    [randomUUID(), oppId, e.grund.slice(0, 500)],
  ).catch(() => null)

  const db = await finanzDb().catch(() => null)
  if (!db) return null
  const entwurf = await legeEntwurfAusGewinn(db, oppId, null)
  if (!entwurf) return null
  const { fuelleAngebot } = await import("@/lib/agenten/angebot")
  await fuelleAngebot(db, entwurf.id, oppId)
  return legeAngebotsKarte(db, entwurf.id)
}
