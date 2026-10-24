import "server-only"

import { legeFreigabeAn, quelleBekannt } from "@/lib/assistent/store"
import { heuteBerlin, tageZwischen } from "@/lib/finanz/auftraege/rechnen"
import { ladeDokument, rechnungAusAngebot, type Dokument } from "@/lib/finanz/auftraege/store"
import { finanzDb } from "@/lib/finanz/store"
import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * GELD-HATTI — Katman 6 (24.10.2026).
 *
 * Die Bütünlük-Analyse fand die Kette an der Geldstelle gerissen: Ein
 * angenommenes Angebot erzeugte keine Anzahlungsrechnung, eine abgenommene
 * Lieferung keine Schlussrechnung (`rechnungAusAngebot` hing nur an einem
 * Knopf in /finanz/vorgang), und ein versendetes Angebot bekam nie eine
 * Nachfrage. Jetzt entsteht an jeder Stelle genau EINE Karte bei Emin:
 *
 *   angenommen          → Anzahlungsrechnung (50 %) zum Freigeben
 *   abgenommen/übergeben → Schlussrechnung (zieht Anzahlungen ab)
 *   versendet, 5./12. Tag ohne Antwort → Nachfrage-Mail zum Freigeben
 *
 * Versendet wird nichts ohne Emins Klick (Karte mit `dokumentId`, siehe
 * sendeAngebotAusFreigabe). Rechnungen folgen aus einer Kundenannahme – der
 * Gesprächsvorbehalt gilt dort nicht; Nachfragen respektieren ihn.
 */

const ANZAHLUNG_PROZENT = 50
const NACHFRAGE_TAGE = [5, 12] as const

type Db = Abfrage
const eur = (cent: number) => `${(cent / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
const kunde = (d: Dokument) => d.kunde.firma || d.kunde.name || "Kunde"
async function chanceVon(db: Db, dokId: string): Promise<string | null> {
  const r = (await db(`SELECT opportunity_id FROM fin_dokumente WHERE id = $1`, [dokId]).catch(() => [])) as { opportunity_id: string | null }[]
  return r[0]?.opportunity_id ?? null
}

async function rechnungsKarte(db: Db, angebot: Dokument, rechnungId: string, schluss: boolean): Promise<string | null> {
  const r = await ladeDokument(db, rechnungId)
  if (!r || r.art !== "rechnung" || r.status !== "entwurf") return null
  const opp = await chanceVon(db, angebot.id)
  const was = schluss ? "Schlussrechnung" : `Anzahlungsrechnung ${ANZAHLUNG_PROZENT} %`
  return legeFreigabeAn({
    art: "mail",
    titel: `${was} senden: ${angebot.titel || kunde(angebot)}`.slice(0, 160),
    betreff: `Ihre Rechnung: ${angebot.titel}`.slice(0, 160),
    empfaenger: r.kunde.email || null,
    inhalt: [
      `Kunde: ${kunde(r)}`,
      `Zum Angebot ${angebot.nummer ?? ""}${angebot.titel ? ` – ${angebot.titel}` : ""}`,
      "",
      `Betrag netto: ${eur(r.summen?.nettoCent ?? 0)} · brutto: ${eur(r.summen?.bruttoCent ?? 0)}`,
      r.kunde.email ? null : "\n⚠ Keine Mailadresse beim Kunden – an der Karte eintragen oder im Entwurf ergänzen.",
      "",
      `Entwurf ansehen oder ändern: /finanz/vorgang/${r.id}`,
      "Beim Freigeben wird die Rechnung festgeschrieben (Nummer, Fälligkeit) und mit Kundenlink und PDF verschickt. Danach überwacht Tahsilat die Zahlung.",
    ]
      .filter((z) => z !== null)
      .join("\n"),
    quelle: `${schluss ? "schlussrechnung" : "anzahlung"}:${angebot.id}`,
    agent: "finanz",
    extra: {
      dokumentId: r.id,
      nachAnnahme: true,
      warum: schluss ? "Lieferung abgenommen – jetzt die Schlussrechnung." : "Der Kunde hat angenommen – Anzahlung vor Projektstart.",
      ...(opp ? { bezug: `opportunity:${opp}` } : {}),
    },
  })
}

async function hatRechnung(db: Db, angebotId: string, anzahlung: boolean): Promise<boolean> {
  const r = (await db(
    `SELECT 1 FROM fin_dokumente WHERE angebot_id = $1 AND art = 'rechnung' AND status NOT IN ('verworfen','storniert')
        AND (anzahlung_prozent IS NOT NULL) = $2 LIMIT 1`,
    [angebotId, anzahlung],
  )) as unknown[]
  return r.length > 0
}

/** Nach der Annahme: Anzahlungsrechnung als Entwurf + Karte. Idempotent je Angebot. Wirft nie. */
export async function anzahlungNachAnnahme(db: Db, angebotId: string): Promise<string | null> {
  try {
    if (await quelleBekannt(`anzahlung:${angebotId}`)) return null
    const a = await ladeDokument(db, angebotId)
    if (!a || a.art !== "angebot" || a.status !== "angenommen") return null
    if (await hatRechnung(db, angebotId, true)) return null
    const id = await rechnungAusAngebot(db, angebotId, ANZAHLUNG_PROZENT)
    return id ? rechnungsKarte(db, a, id, false) : null
  } catch (e) {
    console.error("[geld-hat] anzahlung", angebotId, e instanceof Error ? e.message : e)
    return null
  }
}

/** Täglich (Angebots-Agent): fehlende Anzahlungen nachholen, Schlussrechnungen, Nachfragen. */
export async function geldRunde(): Promise<{ anzahlung: number; schluss: number; nachfrage: number }> {
  const z = { anzahlung: 0, schluss: 0, nachfrage: 0 }
  const db = await finanzDb().catch(() => null)
  if (!db) return z

  /* 1 · Angenommen, aber noch keine Anzahlung (z. B. vor dem 24.10. oder mündlich eingetragen). */
  const angenommen = (await db(
    `SELECT id FROM fin_dokumente WHERE art = 'angebot' AND status = 'angenommen' AND beantwortet_at > now() - interval '120 days'`,
    [],
  ).catch(() => [])) as { id: string }[]
  for (const a of angenommen) if (await anzahlungNachAnnahme(db, a.id)) z.anzahlung++

  /* 2 · Abgenommen oder übergeben → Schlussrechnung. Projekte hängen über offers an „offer-fin-<Dokument>“. */
  const fertig = (await db(
    `SELECT substring(p.offer_id from 11) AS angebot_id FROM projects p
      WHERE p.state IN ('abgenommen','uebergeben') AND p.offer_id LIKE 'offer-fin-%'`,
    [],
  ).catch(() => [])) as { angebot_id: string }[]
  for (const p of fertig) {
    if (await quelleBekannt(`schlussrechnung:${p.angebot_id}`)) continue
    const a = await ladeDokument(db, p.angebot_id).catch(() => null)
    if (!a || a.status !== "angenommen" || (await hatRechnung(db, a.id, false))) continue
    const id = await rechnungAusAngebot(db, a.id, null).catch(() => null)
    if (id && (await rechnungsKarte(db, a, id, true))) z.schluss++
  }

  /* 3 · Versendet, keine Antwort: Nachfrage am 5. und 12. Tag – nie nach Ablauf, nie vor Emins Gespräch. */
  const heute = heuteBerlin()
  const versendet = (await db(
    `SELECT id FROM fin_dokumente WHERE art = 'angebot' AND status = 'versendet' AND versendet_at > now() - interval '60 days'`,
    [],
  ).catch(() => [])) as { id: string }[]
  for (const v of versendet) {
    const d = await ladeDokument(db, v.id).catch(() => null)
    if (!d?.versendetAt || (d.gueltigBis && d.gueltigBis < heute)) continue
    const tage = tageZwischen(d.versendetAt.slice(0, 10), heute)
    const stufe = [...NACHFRAGE_TAGE].reverse().find((t) => tage >= t)
    if (!stufe) continue
    /* Schon nach dieser Stufe nachgefragt? Dann wartet die nächste. */
    const opp = await chanceVon(db, d.id)
    if (d.nachgefasstAt && tageZwischen(d.versendetAt.slice(0, 10), d.nachgefasstAt.slice(0, 10)) >= stufe) continue
    const id = await legeFreigabeAn({
      art: "mail",
      titel: `Nachfragen: Angebot ${d.nummer ?? ""} (${kunde(d)})`.slice(0, 160),
      betreff: `Ihr Angebot ${d.nummer ?? ""}`.trim().slice(0, 160),
      empfaenger: d.kunde.email || null,
      inhalt: [
        `Angebot ${d.nummer ?? ""}${d.titel ? ` – ${d.titel}` : ""} ist seit ${tage} Tagen beim Kunden${d.geoeffnetAt ? " (geöffnet)" : " (noch nicht geöffnet)"}.`,
        d.gueltigBis ? `Gültig bis ${new Date(d.gueltigBis).toLocaleDateString("de-DE")}.` : null,
        "",
        "Beim Freigeben geht eine kurze, freundliche Nachfrage mit dem Kundenlink raus. Lieber anrufen? Dann verwerfen und im Chat notieren.",
        `Vorgang: /finanz/vorgang/${d.id}`,
      ]
        .filter((x) => x !== null)
        .join("\n"),
      quelle: `angebot-nachfrage:${d.id}:${stufe}`,
      agent: "angebot",
      extra: {
        dokumentId: d.id,
        dokumentMail: "nachfrage",
        warum: `${tage} Tage ohne Antwort auf das Angebot.`,
        ...(opp ? { bezug: `opportunity:${opp}` } : {}),
      },
    }).catch(() => null)
    if (id) z.nachfrage++
  }
  return z
}
