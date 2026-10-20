import "server-only"

import { assistentDb, ergaenzeExtra, legeFreigabeAn, type Freigabe } from "./store"

/** Tage bis zum Nachfassen je Stufe (1. und 2. Erinnerung). */
export const NACHFASS_TAGE = [5, 9] as const
const MAX_STUFE = NACHFASS_TAGE.length

const MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function istMail(s: string | null | undefined): s is string {
  return !!s && s.length <= 200 && MAIL_RE.test(s.trim())
}

/** Interne Notizen der Agenten (nach "---") gehen nie an den Kunden. */
export function kundenText(inhalt: string): string {
  return inhalt.split(/\n-{3,}\n/)[0].trim()
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

/** Persönliche Mail: schlichtes HTML wie aus dem Postfach – keine Werbeoptik, besser für die Zustellung. */
function alsHtml(text: string): string {
  const absaetze = text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px">${escape(p).replace(/\n/g, "<br>")}</p>`)
    .join("")
  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#1f2933">${absaetze}</div>`
}

export type VersandErgebnis = { ok: true; id: string } | { ok: false; grund: string }

export async function sendeFreigabeMail(f: Freigabe, an: string, betreff: string, inhalt: string): Promise<VersandErgebnis> {
  const key = process.env.RESEND_API_KEY?.trim()
  const from = process.env.MAIL_FROM?.trim() || process.env.LEAD_FROM?.trim()
  if (!key || !from) return { ok: false, grund: "Mailversand ist nicht eingerichtet." }
  if (!istMail(an)) return { ok: false, grund: "Bitte eine gültige E-Mail-Adresse eintragen." }
  const text = kundenText(inhalt)
  if (!text) return { ok: false, grund: "Der Mailtext ist leer." }
  const antwortAn = process.env.MAIL_REPLY_TO?.trim() || process.env.LEAD_TO?.trim()
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `freigabe-${f.id}` },
      body: JSON.stringify({
        from,
        to: [an.trim()],
        ...(antwortAn ? { reply_to: antwortAn } : {}),
        subject: betreff.slice(0, 200) || f.titel,
        text,
        html: alsHtml(text),
      }),
    })
    const daten = (await res.json().catch(() => ({}))) as { id?: string; message?: string }
    if (!res.ok || !daten.id) return { ok: false, grund: `Versand fehlgeschlagen${daten.message ? `: ${daten.message}` : ` (${res.status})`}`.slice(0, 200) }
    return { ok: true, id: daten.id }
  } catch {
    return { ok: false, grund: "Mailserver nicht erreichbar – bitte später erneut." }
  }
}

function nachfassText(stufe: number, original: string): string {
  const anrede = original.split("\n")[0]?.trim()
  const gruss = /^(hallo|guten tag|sehr geehrte|liebe)/i.test(anrede ?? "") ? anrede : "Guten Tag,"
  const kern =
    stufe === 1
      ? "ich wollte kurz nachfragen, ob meine Nachricht von letzter Woche angekommen ist. Wenn das Thema gerade passt, reichen 15 Minuten am Telefon – ich richte mich nach Ihrem Kalender."
      : "ich melde mich ein letztes Mal zu meiner Nachricht. Wenn es aktuell nicht passt, ist das völlig in Ordnung – eine kurze Rückmeldung hilft mir trotzdem sehr. Ansonsten melde ich mich nicht weiter."
  return `${gruss}\n\n${kern}\n\nViele Grüße\nMuhammed Emin Akyol\ncreaDIG Solutions`
}

type Faellig = { id: string; titel: string; empfaenger: string; betreff: string | null; inhalt: string; stufe: number }

/**
 * Legt für gesendete Mails ohne Antwort eine Nachfass-Mail zur Freigabe an.
 * Kein KI-Aufruf, keine Kosten. Dubletten verhindert die Quelle "nachfass:<id>".
 */
export async function nachfassen(): Promise<number> {
  const q = await assistentDb()
  if (!q) return 0
  const rows = (await q(
    `SELECT id, titel, empfaenger, betreff, inhalt, COALESCE((extra->>'stufe')::int, 0) AS stufe
     FROM assistent_freigaben
     WHERE art = 'mail' AND status = 'freigegeben'
       AND extra ? 'gesendetAt' AND NOT extra ? 'antwortAt' AND NOT extra ? 'nachfassId'
       AND COALESCE((extra->>'stufe')::int, 0) < $1
       AND (extra->>'gesendetAt')::timestamptz < now() - make_interval(days =>
             CASE WHEN COALESCE((extra->>'stufe')::int, 0) = 0 THEN $2::int ELSE $3::int END)
     LIMIT 10`,
    [MAX_STUFE, NACHFASS_TAGE[0], NACHFASS_TAGE[1] - NACHFASS_TAGE[0]],
  )) as Faellig[]
  let neu = 0
  for (const r of rows) {
    const stufe = r.stufe + 1
    const betreff = r.betreff ? (r.betreff.startsWith("Re:") ? r.betreff : `Re: ${r.betreff}`) : `Re: ${r.titel}`
    const id = await legeFreigabeAn({
      art: "mail",
      titel: `${stufe}. Nachfassen: ${r.titel.replace(/^\d\. Nachfassen: /, "")}`,
      empfaenger: r.empfaenger,
      betreff,
      inhalt: nachfassText(stufe, kundenText(r.inhalt)),
      quelle: `nachfass:${r.id}`,
      agent: "vertrieb",
      extra: { stufe, vorgaenger: r.id, warum: `Keine Antwort seit ${stufe === 1 ? NACHFASS_TAGE[0] : NACHFASS_TAGE[1] - NACHFASS_TAGE[0]} Tagen.` },
    })
    if (id) {
      await ergaenzeExtra(r.id, { nachfassId: id })
      neu++
    }
  }
  return neu
}

/** Antwort eingegangen: ganze Kette gilt als beantwortet, kein weiteres Nachfassen. */
export async function markiereAntwort(id: string): Promise<void> {
  const q = await assistentDb()
  if (!q) return
  const jetzt = JSON.stringify({ antwortAt: new Date().toISOString() })
  const kette = `WITH RECURSIVE kette AS (
       SELECT id, extra->>'vorgaenger' AS vor FROM assistent_freigaben WHERE id = $1
       UNION ALL
       SELECT f.id, f.extra->>'vorgaenger' FROM assistent_freigaben f JOIN kette k ON f.id = k.vor)`
  await q(`${kette} UPDATE assistent_freigaben SET extra = extra || $2::jsonb WHERE id IN (SELECT id FROM kette)`, [id, jetzt])
  await q(
    `${kette} UPDATE assistent_freigaben SET status = 'verworfen', erledigt_at = now()
     WHERE status = 'offen' AND extra->>'vorgaenger' IN (SELECT id FROM kette)`,
    [id],
  )
}

export type Ansprache = { gesendet: number; beantwortet: number; quote: number | null; nachfassOffen: number }

/** Erstansprachen der letzten 60 Tage (ohne Nachfass-Mails) und wie viele geantwortet haben. */
export async function ladeAnsprache(): Promise<Ansprache> {
  const leer = { gesendet: 0, beantwortet: 0, quote: null, nachfassOffen: 0 }
  const q = await assistentDb()
  if (!q) return leer
  const [r] = (await q(
    `SELECT
       COUNT(*) FILTER (WHERE extra ? 'gesendetAt' AND NOT extra ? 'vorgaenger' AND (extra->>'gesendetAt')::timestamptz > now() - interval '60 days')::int AS gesendet,
       COUNT(*) FILTER (WHERE extra ? 'antwortAt' AND NOT extra ? 'vorgaenger' AND (extra->>'gesendetAt')::timestamptz > now() - interval '60 days')::int AS beantwortet,
       COUNT(*) FILTER (WHERE status = 'offen' AND extra ? 'vorgaenger')::int AS "nachfassOffen"
     FROM assistent_freigaben WHERE art = 'mail'`,
    [],
  )) as { gesendet: number; beantwortet: number; nachfassOffen: number }[]
  if (!r) return leer
  return { ...r, quote: r.gesendet ? Math.round((r.beantwortet / r.gesendet) * 100) : null }
}
