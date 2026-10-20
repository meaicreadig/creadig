import "server-only"

import { randomUUID } from "node:crypto"
import { generateText } from "ai"

import { assistentDb, legeFreigabeAn } from "@/lib/assistent/store"
import { kundenText, markiereAntwort } from "@/lib/assistent/versand"
export { eingangsAdresse } from "@/lib/assistent/versand"
import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"
import { legeBuchungslinkAn } from "@/lib/termine/store"
import { siteUrl } from "@/lib/termine/mail"

/**
 * Gelir Motoru – das Auge der Verkaufsmaschine.
 * Jede Antwort auf eine Vertriebsmail kommt über Resend herein, wird von der KI
 * eingeordnet und löst selbst die nächsten Schritte aus. Der Inhaber gibt nur frei.
 */

const MODELL = "openai/gpt-5.4-mini"
const WIEDERVORLAGE_TAGE = 60

export const EINGANG_ARTEN = ["interessiert", "spaeter", "nein", "falsche_person", "abwesend", "sonstiges"] as const
export type EingangArt = (typeof EINGANG_ARTEN)[number]

export type Eingang = {
  id: string
  von: string
  betreff: string | null
  text: string
  art: EingangArt | "unzugeordnet"
  zusammenfassung: string | null
  freigabeId: string | null
  entwurfId: string | null
  wiedervorlageAm: string | null
  zeit: string
}

let bereit: Promise<void> | null = null
async function db(): Promise<Abfrage | null> {
  const q = await assistentDb()
  if (!q) return null
  bereit ??= (async () => {
    await q(
      `CREATE TABLE IF NOT EXISTS mail_eingang (
        id text PRIMARY KEY,
        von text NOT NULL,
        betreff text,
        text text NOT NULL DEFAULT '',
        art text NOT NULL DEFAULT 'unzugeordnet',
        zusammenfassung text,
        freigabe_id text,
        entwurf_id text,
        wiedervorlage_am date,
        wiedervorlage_id text,
        created_at timestamptz NOT NULL DEFAULT now()
      )`,
      [],
    )
    await q(`CREATE INDEX IF NOT EXISTS mail_eingang_zeit ON mail_eingang (created_at DESC)`, [])
  })().catch((e) => {
    bereit = null
    throw e
  })
  await bereit
  return q
}

export function eingangAktiv(): boolean {
  return !!process.env.MAIL_EINGANG_DOMAIN?.trim() && !!resendKey()
}

// Reading received mails needs a full-access key; the sending key is restricted.
function resendKey(): string | null {
  return process.env.RESEND_FULL_ACCESS_KEY?.trim() || process.env.RESEND_API_KEY?.trim() || null
}

type Empfangen = { id: string; from: string; to: string[]; subject: string | null; text: string | null; html: string | null; created_at: string }

async function resendGet<T>(pfad: string): Promise<T | null> {
  const key = resendKey()
  if (!key) return null
  const res = await fetch(`https://api.resend.com${pfad}`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" })
  if (!res.ok) return null
  return (await res.json().catch(() => null)) as T | null
}

const adresseAus = (roh: string) => (roh.match(/<([^>]+)>/)?.[1] ?? roh).trim().toLowerCase()

/** Nur die neue Antwort – zitierter Verlauf und Signatur-Trenner fliegen raus. */
export function nurAntwort(text: string): string {
  const zeilen = text.replace(/\r/g, "").split("\n")
  const ende = zeilen.findIndex(
    (z) =>
      /^>/.test(z.trim()) ||
      /^(am|on|le)\s.+(schrieb|wrote|a écrit)/i.test(z.trim()) ||
      /^-{2,}\s*(original|ursprüngliche)/i.test(z.trim()) ||
      /^(von|from):\s/i.test(z.trim()),
  )
  return (ende === -1 ? zeilen : zeilen.slice(0, ende)).join("\n").trim().slice(0, 4000)
}

const htmlZuText = (html: string) =>
  html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>|<\/p>|<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")

type Ursprung = { id: string; empfaenger: string; betreff: string | null; titel: string; inhalt: string }

async function findeUrsprung(q: Abfrage, an: string[], von: string): Promise<Ursprung | null> {
  const direkt = an.map((a) => adresseAus(a).match(/^antwort\+([^@]+)@/)?.[1]).find(Boolean)
  const spalten = `id, empfaenger, betreff, titel, inhalt`
  if (direkt) {
    const r = (await q(`SELECT ${spalten} FROM assistent_freigaben WHERE id = $1 AND art = 'mail'`, [direkt])) as Ursprung[]
    if (r[0]) return r[0]
  }
  const r = (await q(
    `SELECT ${spalten} FROM assistent_freigaben
     WHERE art = 'mail' AND status = 'freigegeben' AND extra ? 'gesendetAt' AND lower(empfaenger) = $1
     ORDER BY (extra->>'gesendetAt')::timestamptz DESC LIMIT 1`,
    [von],
  )) as Ursprung[]
  return r[0] ?? null
}

type Einordnung = { art: EingangArt; zusammenfassung: string; antwort: string }

async function ordneEin(u: Ursprung | null, von: string, betreff: string | null, text: string, mitTermin: boolean): Promise<Einordnung> {
  const fallback: Einordnung = { art: "sonstiges", zusammenfassung: text.slice(0, 160), antwort: "" }
  try {
    const { text: roh } = await generateText({
      model: MODELL,
      prompt: `Du bist der Vertrieb von creaDIG Solutions (Inhaber Emin Akyol, Software für Betriebe: fibero für Glasfaser-Montagefirmen, stammo digitale Treuekarte, Web & Systeme).
Ein Interessent hat auf unsere Mail geantwortet. Ordne die Antwort ein und schreibe den Antwortentwurf.

UNSERE MAIL (Betreff: ${u?.betreff ?? "unbekannt"}):
${u ? kundenText(u.inhalt).slice(0, 1500) : "(keine Zuordnung)"}

ANTWORT von ${von} (Betreff: ${betreff ?? ""}):
${text}

Arten: interessiert (will Gespräch/Infos/Preis), spaeter (grundsätzlich ja, aber jetzt nicht), nein (kein Interesse/abmelden), falsche_person (nennt anderen Ansprechpartner), abwesend (automatische Abwesenheitsnotiz), sonstiges.
Antwortentwurf: Deutsch (oder Sprache des Absenders), Sie-Form, kurz (max 90 Wörter), menschlich, kein Verkaufsdruck, beginnt mit Anrede, endet mit "Viele Grüße\\nEmin Akyol\\ncreaDIG Solutions".${mitTermin ? ` Bei "interessiert": biete einen Termin an und setze genau den Platzhalter {TERMINLINK} in eine eigene Zeile.` : ""} Bei "nein": bedanke dich kurz, bestätige, dass wir nicht mehr schreiben. Bei "falsche_person": bitte höflich um Weiterleitung oder bedanke dich für den Kontakt. Bei "abwesend": leerer Entwurf.
Antworte NUR mit JSON: {"art":"","zusammenfassung":"1 Satz Deutsch, was der Kunde will","antwort":""}`,
    })
    const j = JSON.parse(roh.match(/\{[\s\S]*\}/)?.[0] ?? "{}") as Partial<Einordnung>
    const art = EINGANG_ARTEN.includes(j.art as EingangArt) ? (j.art as EingangArt) : "sonstiges"
    return { art, zusammenfassung: (j.zusammenfassung ?? "").slice(0, 300) || fallback.zusammenfassung, antwort: (j.antwort ?? "").slice(0, 3000) }
  } catch (e) {
    console.error("[eingang] KI-Einordnung fehlgeschlagen:", (e as Error).message)
    return fallback
  }
}

async function kontaktZu(q: Abfrage, mail: string): Promise<{ id: string; org: string | null } | null> {
  const r = (await q(`SELECT id, organisation_id FROM contacts WHERE email_normalised = $1 LIMIT 1`, [mail]).catch(() => [])) as {
    id: string
    organisation_id: string | null
  }[]
  return r[0] ? { id: r[0].id, org: r[0].organisation_id } : null
}

async function notiere(kontakt: { id: string; org: string | null } | null, kind: string, summary: string, data: Record<string, unknown>) {
  const nq = neonAbfrage()
  if (!nq || !kontakt) return
  const ziele: [string, string][] = [["contact", kontakt.id]]
  if (kontakt.org) ziele.push(["organisation", kontakt.org])
  for (const [typ, ziel] of ziele) {
    await nq(
      `INSERT INTO activities (id, subject_type, subject_id, kind, summary, actor, origin, data, created_at)
       VALUES ($1, $2, $3, $4, $5, 'system', 'AI', $6::jsonb, now())`,
      [randomUUID(), typ, ziel, kind, summary.slice(0, 200), JSON.stringify(data)],
    ).catch((e) => console.error("[eingang] Verlauf:", (e as Error).message))
  }
}

async function meldeInhaber(e: { von: string; art: string; zusammenfassung: string; text: string }) {
  const key = resendKey()
  const from = process.env.MAIL_FROM?.trim() || process.env.LEAD_FROM?.trim()
  const an = process.env.LEAD_TO?.trim()
  if (!key || !from || !an) return
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [an],
      reply_to: e.von,
      subject: `Antwort von ${e.von} · ${ART_TEXT[e.art as EingangArt] ?? e.art}`,
      text: `${e.zusammenfassung}\n\nEntwurf liegt zur Freigabe bereit: ${siteUrl()}/admin/assistent#eingang\n\n— Originaltext —\n${e.text}`,
    }),
  }).catch(() => undefined)
}

export const ART_TEXT: Record<EingangArt | "unzugeordnet", string> = {
  interessiert: "Interessiert",
  spaeter: "Später",
  nein: "Kein Interesse",
  falsche_person: "Anderer Ansprechpartner",
  abwesend: "Abwesend",
  sonstiges: "Sonstiges",
  unzugeordnet: "Nicht zugeordnet",
}

/** Verarbeitet eine empfangene Mail genau einmal (Resend-ID = Schlüssel). */
export async function verarbeiteEingang(emailId: string): Promise<boolean> {
  const q = await db()
  if (!q || !/^[a-z0-9-]{8,64}$/i.test(emailId)) return false
  const neu = (await q(`INSERT INTO mail_eingang (id, von) VALUES ($1, '') ON CONFLICT (id) DO NOTHING RETURNING id`, [emailId])) as { id: string }[]
  if (!neu[0]) return false

  try {
    const m = await resendGet<Empfangen>(`/emails/receiving/${emailId}`)
    if (!m) throw new Error("Mail nicht abrufbar")
    const von = adresseAus(m.from)
    const text = nurAntwort(m.text || (m.html ? htmlZuText(m.html) : ""))
    const ursprung = await findeUrsprung(q, m.to ?? [], von)
    const kontakt = await kontaktZu(q, von)

    if (!ursprung) {
      await q(`UPDATE mail_eingang SET von = $2, betreff = $3, text = $4 WHERE id = $1`, [emailId, von, m.subject, text])
      return true
    }

    const e = await ordneEin(ursprung, von, m.subject, text, true)

    if (e.art !== "abwesend") {
      // stoppt die Nachfass-Kette; "nein" bewegt die Chance nicht nach vorn
      await markiereAntwort(ursprung.id, { faden: e.art !== "nein" })
      if (e.art === "nein") await notiere(kontakt, "mail.absage", `Kein Interesse · ${ursprung.betreff ?? ""}`, { quelleId: ursprung.id, eingang: emailId })
    }

    let entwurf = e.antwort.trim()
    if (entwurf.includes("{TERMINLINK}")) {
      const token = await legeBuchungslinkAn({
        contactId: kontakt?.id ?? null,
        organisationId: kontakt?.org ?? null,
        meetingKind: "video",
        topic: ursprung.betreff?.slice(0, 120) ?? null,
        windowFrom: null,
        windowTo: null,
        gueltigTage: 21,
        von: "gelir-motoru",
      }).catch(() => null)
      entwurf = entwurf.replace("{TERMINLINK}", token ? `${siteUrl()}/termin/buchen/${token}` : `${siteUrl()}/termin`)
    }

    let entwurfId: string | null = null
    if (entwurf && e.art !== "abwesend") {
      const betreff = ursprung.betreff ? (ursprung.betreff.startsWith("Re:") ? ursprung.betreff : `Re: ${ursprung.betreff}`) : `Re: ${ursprung.titel}`
      entwurfId = await legeFreigabeAn({
        art: "mail",
        titel: `Antwort an ${von} · ${ART_TEXT[e.art]}`,
        empfaenger: von,
        betreff,
        inhalt: `${entwurf}\n---\nKunde schrieb: ${text.slice(0, 1200)}`,
        quelle: `eingang:${emailId}`,
        agent: "vertrieb",
        extra: { warum: e.zusammenfassung, bezug: ursprung.id },
      })
    }

    const wiedervorlage = e.art === "spaeter" ? new Date(Date.now() + WIEDERVORLAGE_TAGE * 86_400_000).toISOString().slice(0, 10) : null
    await q(
      `UPDATE mail_eingang SET von = $2, betreff = $3, text = $4, art = $5, zusammenfassung = $6, freigabe_id = $7, entwurf_id = $8, wiedervorlage_am = $9
       WHERE id = $1`,
      [emailId, von, m.subject, text, e.art, e.zusammenfassung, ursprung.id, entwurfId, wiedervorlage],
    )
    if (e.art !== "abwesend") await meldeInhaber({ von, art: e.art, zusammenfassung: e.zusammenfassung, text })
    return true
  } catch (err) {
    // Beim nächsten Durchlauf erneut versuchen
    await q(`DELETE FROM mail_eingang WHERE id = $1 AND von = ''`, [emailId]).catch(() => undefined)
    console.error("[eingang]", (err as Error).message)
    return false
  }
}

/** Fallback ohne Webhook: neue Mails bei Resend abholen; außerdem fällige Wiedervorlagen anlegen. */
export async function holeEingang(): Promise<number> {
  const q = await db()
  if (!q || !eingangAktiv()) return 0
  const liste = await resendGet<{ data?: { id: string; created_at: string }[] }>(`/emails/receiving?limit=50`)
  const ids = (liste?.data ?? []).filter((m) => Date.now() - new Date(m.created_at).getTime() < 14 * 86_400_000).map((m) => m.id)
  let n = 0
  if (ids.length) {
    const bekannt = new Set(
      ((await q(`SELECT id FROM mail_eingang WHERE id = ANY($1::text[])`, [ids])) as { id: string }[]).map((r) => r.id),
    )
    for (const id of ids.filter((i) => !bekannt.has(i)).slice(0, 10)) if (await verarbeiteEingang(id)) n++
  }
  await legeWiedervorlagenAn(q)
  return n
}

async function legeWiedervorlagenAn(q: Abfrage) {
  const faellig = (await q(
    `SELECT id, von, betreff, zusammenfassung FROM mail_eingang
     WHERE wiedervorlage_am IS NOT NULL AND wiedervorlage_am <= current_date AND wiedervorlage_id IS NULL LIMIT 10`,
    [],
  )) as { id: string; von: string; betreff: string | null; zusammenfassung: string | null }[]
  for (const f of faellig) {
    const id = await legeFreigabeAn({
      art: "aufgabe",
      titel: `Wiedervorlage: ${f.von} wieder ansprechen`,
      inhalt: `Vor ${WIEDERVORLAGE_TAGE} Tagen hieß es "später".\n${f.zusammenfassung ?? ""}\nBetreff: ${f.betreff ?? ""}`,
      quelle: `wiedervorlage:${f.id}`,
      agent: "vertrieb",
      extra: { warum: "Vereinbarte Wiedervorlage ist fällig." },
    })
    await q(`UPDATE mail_eingang SET wiedervorlage_id = $2 WHERE id = $1`, [f.id, id ?? "doppelt"])
  }
}

export async function ladeEingang(limit = 20): Promise<Eingang[]> {
  const q = await db().catch(() => null)
  if (!q) return []
  const rows = (await q(
    `SELECT id, von, betreff, text, art, zusammenfassung, freigabe_id, entwurf_id, wiedervorlage_am::text AS wv, created_at
     FROM mail_eingang WHERE von <> '' ORDER BY created_at DESC LIMIT $1`,
    [limit],
  ).catch(() => [])) as {
    id: string
    von: string
    betreff: string | null
    text: string
    art: Eingang["art"]
    zusammenfassung: string | null
    freigabe_id: string | null
    entwurf_id: string | null
    wv: string | null
    created_at: string | Date
  }[]
  return rows.map((r) => ({
    id: r.id,
    von: r.von,
    betreff: r.betreff,
    text: r.text,
    art: r.art,
    zusammenfassung: r.zusammenfassung,
    freigabeId: r.freigabe_id,
    entwurfId: r.entwurf_id,
    wiedervorlageAm: r.wv,
    zeit: new Date(r.created_at).toISOString(),
  }))
}

/** Kennzahlen für Truppe, Rat und 3D-Raum Vertrieb. */
export async function eingangKennzahlen(): Promise<{ woche: number; interessiert: number }> {
  const q = await db().catch(() => null)
  if (!q) return { woche: 0, interessiert: 0 }
  const r = (await q(
    `SELECT count(*)::int AS woche, count(*) FILTER (WHERE art = 'interessiert')::int AS interessiert
     FROM mail_eingang WHERE von <> '' AND art <> 'abwesend' AND created_at > now() - interval '7 days'`,
    [],
  ).catch(() => [])) as { woche: number; interessiert: number }[]
  return r[0] ?? { woche: 0, interessiert: 0 }
}
