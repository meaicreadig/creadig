import "server-only"

import { einzelmailHtml, einzelmailText, type Einzelmail } from "@/lib/mailing/eml"
import { istProduktId, produktAusTitel, type ProduktId } from "@/lib/mailing/produkte"
import { siteUrl } from "@/lib/termine/mail"
import { pruefeEmpfaenger } from "@/lib/recht/compliance"
import { nimmAntwortZurueck, notiereAntwort, notiereGesendeteMail } from "@/lib/kundenfaden"
import { neonAbfrage } from "@/lib/neon-abfrage"

import { findeKontaktMail } from "./kontaktsuche"
import { assistentDb, ergaenzeExtra, legeFreigabeAn, setzeFreigabe, setzeMailKopf, type Freigabe, type FreigabeExtra } from "./store"

/** Tage bis zum Nachfassen je Stufe (1. und 2. Erinnerung). */
export const NACHFASS_TAGE = [5, 9] as const
const MAX_STUFE = NACHFASS_TAGE.length

const MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Offene Erstmails ohne Empfänger: Adresse auf der Firmen-Webseite suchen und eintragen. */
export async function ergaenzeFehlendeAdressen(max = 6): Promise<number> {
  const q = await assistentDb()
  if (!q) return 0
  const rows = (await q(
    `SELECT id, inhalt, betreff, titel FROM assistent_freigaben
     WHERE art = 'mail' AND status = 'offen' AND (empfaenger IS NULL OR empfaenger = '')
       AND NOT extra ? 'adressSuche'
     ORDER BY created_at DESC LIMIT $1`,
    [max],
  ).catch(() => [])) as { id: string; inhalt: string; betreff: string | null; titel: string }[]
  let gefunden = 0
  await Promise.all(
    rows.map(async (r) => {
      const web = r.inhalt.match(/Webseite:\s*(https?:\/\/\S+)/)?.[1]
      const adresse = web ? await findeKontaktMail(web).catch(() => null) : null
      if (adresse) {
        await setzeMailKopf(r.id, adresse, r.betreff || r.titel)
        gefunden++
      }
      await ergaenzeExtra(r.id, { adressSuche: adresse ? "gefunden" : "keine" })
    }),
  )
  /* Jäger-Mails ohne auffindbare Adresse sind keine Entscheidung für den Inhaber – automatisch aussortieren. */
  const ohne = (await q(
    `SELECT id FROM assistent_freigaben
     WHERE art = 'mail' AND status = 'offen' AND agent = 'jaeger'
       AND (empfaenger IS NULL OR empfaenger = '') AND extra->>'adressSuche' = 'keine'
     LIMIT 50`,
    [],
  ).catch(() => [])) as { id: string }[]
  for (const r of ohne) {
    await ergaenzeExtra(r.id, { fehler: "Automatisch aussortiert: keine Kontaktadresse auf der Webseite." })
    await setzeFreigabe(r.id, "verworfen")
  }
  return gefunden
}

/** Antwortadresse je Mail – so erkennt der Eingang, auf welche Mail geantwortet wurde. */
export function eingangsAdresse(freigabeId: string): string | null {
  const domain = process.env.MAIL_EINGANG_DOMAIN?.trim().replace(/^@/, "")
  if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) return null
  return `antwort+${freigabeId}@${domain}`
}

export function istMail(s: string | null | undefined): s is string {
  return !!s && s.length <= 200 && MAIL_RE.test(s.trim())
}

/** Interne Notizen der Agenten (nach "---") gehen nie an den Kunden. */
export function kundenText(inhalt: string): string {
  return inhalt.split(/\n-{3,}\n/)[0].trim()
}

function kontaktAdresse(): string {
  const roh = process.env.MAIL_REPLY_TO?.trim() || process.env.LEAD_TO?.trim() || process.env.MAIL_FROM?.trim() || ""
  return roh.match(/<([^>]+)>/)?.[1]?.trim() || (roh.includes("@") ? roh : "")
}

/** Wandelt den Agenten-Text in die creaDIG-Einzelmail (gleiches Design wie das Mail-Studio). */
export function alsEinzelmail(an: string, betreff: string, inhalt: string, produkt?: ProduktId | null): Einzelmail {
  const basis = siteUrl()
  const zeilen = kundenText(inhalt).split("\n")
  const ersteZeile = zeilen[0]?.trim() ?? ""
  const hatAnrede = /^(hallo|guten tag|sehr geehrte|liebe|moin|servus)/i.test(ersteZeile)
  let rumpf = (hatAnrede ? zeilen.slice(1) : zeilen).join("\n").trim()
  const gruss = rumpf.match(/\n\s*((?:viele|beste|freundliche|herzliche) grüße|mit freundlichen grüßen)[\s\S]*$/i)
  if (gruss?.index != null) rumpf = rumpf.slice(0, gruss.index).trim()
  const ersterSatz = rumpf.replace(/\s+/g, " ").match(/^.{20,160}?[.!?](\s|$)/)?.[0]?.trim() ?? ""
  return {
    an,
    subject: betreff,
    preheader: ersterSatz,
    kennung: "",
    headline: betreff,
    anrede: hatAnrede ? ersteZeile : "Guten Tag,",
    body: rumpf,
    ctaHinweis: "Wählen Sie direkt einen passenden Termin – oder antworten Sie einfach auf diese Mail.",
    ctaText: "Termin wählen",
    ctaUrl: `${basis}/termin`,
    zweitText: "Kontakt",
    zweitUrl: `${basis}/kontakt`,
    gruss: "Viele Grüße",
    telefon: "0176 41965356",
    kontaktMail: kontaktAdresse(),
    ...(produkt ? { produkt } : {}),
  }
}

/** Produkt einer Freigabe: gespeichert vom Jäger, sonst aus dem Titel erkannt (ältere Einträge). */
export function freigabeProdukt(f: Pick<Freigabe, "titel" | "extra">): ProduktId | null {
  return istProduktId(f.extra?.produkt) ? f.extra.produkt : produktAusTitel(f.titel)
}

/** Jede gesendete Mail landet am Kontakt und bewegt die Verkaufschance – Fehler blockieren den Versand nie. */
async function inDenFaden(m: Parameters<typeof notiereGesendeteMail>[1]): Promise<void> {
  const q = neonAbfrage()
  if (!q) return
  await notiereGesendeteMail(q, m).catch((e) => console.error("[kundenfaden] Mail nicht protokolliert:", (e as Error).message))
}

export type VersandErgebnis = { ok: true; id: string } | { ok: false; grund: string }

export async function sendeFreigabeMail(f: Freigabe, an: string, betreff: string, inhalt: string): Promise<VersandErgebnis> {
  const key = process.env.RESEND_API_KEY?.trim()
  const from = process.env.MAIL_FROM?.trim() || process.env.LEAD_FROM?.trim()
  if (!key || !from) return { ok: false, grund: "Mailversand ist nicht eingerichtet." }
  if (!istMail(an)) return { ok: false, grund: "Bitte eine gültige E-Mail-Adresse eintragen." }
  const text = kundenText(inhalt)
  if (!text) return { ok: false, grund: "Der Mailtext ist leer." }
  const recht = await pruefeEmpfaenger(an, { bestaetigt: Boolean(f.extra?.basisBestaetigt) })
  if (!recht.erlaubt) return { ok: false, grund: recht.grund }
  const antwortAn = eingangsAdresse(f.id) || process.env.MAIL_REPLY_TO?.trim() || process.env.LEAD_TO?.trim()
  const mail = alsEinzelmail(an.trim(), betreff.slice(0, 200) || f.titel, inhalt, freigabeProdukt(f))
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `freigabe-${f.id}` },
      body: JSON.stringify({
        from,
        to: [an.trim()],
        ...(antwortAn ? { reply_to: antwortAn } : {}),
        subject: mail.subject,
        text: einzelmailText(mail),
        html: einzelmailHtml(mail, siteUrl()),
      }),
    })
    const daten = (await res.json().catch(() => ({}))) as { id?: string; message?: string }
    if (!res.ok || !daten.id) return { ok: false, grund: `Versand fehlgeschlagen${daten.message ? `: ${daten.message}` : ` (${res.status})`}`.slice(0, 200) }
    await inDenFaden({
      an: an.trim(),
      betreff: mail.subject,
      text,
      quelleId: f.id,
      agent: f.agent,
      firma: f.inhalt.match(/Firma:\s*(.+)/)?.[1]?.trim() ?? null,
      website: f.inhalt.match(/Webseite:\s*(https?:\/\/\S+)/)?.[1] ?? null,
      stufe: Number(f.extra?.stufe ?? 0),
    })
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
  return `${gruss}\n\n${kern}\n\nViele Grüße\nEmin Akyol\ncreaDIG Solutions`
}

type Faellig = { id: string; titel: string; empfaenger: string; betreff: string | null; inhalt: string; stufe: number; bestaetigt: boolean }

/**
 * Legt für gesendete Mails ohne Antwort eine Nachfass-Mail zur Freigabe an.
 * Kein KI-Aufruf, keine Kosten. Dubletten verhindert die Quelle "nachfass:<id>".
 */
export async function nachfassen(): Promise<number> {
  const q = await assistentDb()
  if (!q) return 0
  const rows = (await q(
    `SELECT id, titel, empfaenger, betreff, inhalt, COALESCE((extra->>'stufe')::int, 0) AS stufe,
            (extra ? 'basisBestaetigt') AS bestaetigt
     FROM assistent_freigaben
     WHERE art = 'mail' AND status = 'freigegeben'
       AND extra ? 'gesendetAt' AND NOT extra ? 'antwortAt' AND NOT extra ? 'nachfassId'
       AND NOT extra ? 'kampagneId'
       AND coalesce(agent, '') <> 'forderungen'
       AND COALESCE((extra->>'stufe')::int, 0) < $1
       AND (extra->>'gesendetAt')::timestamptz < now() - make_interval(days =>
             CASE WHEN COALESCE((extra->>'stufe')::int, 0) = 0 THEN $2::int ELSE $3::int END)
     LIMIT 10`,
    [MAX_STUFE, NACHFASS_TAGE[0], NACHFASS_TAGE[1] - NACHFASS_TAGE[0]],
  )) as Faellig[]
  let neu = 0
  for (const r of rows) {
    /* Recht & Compliance: Nachfassen nur mit Rechtsgrundlage – sonst endet die Kette still. */
    const recht = await pruefeEmpfaenger(r.empfaenger, { bestaetigt: Boolean(r.bestaetigt) })
    if (!recht.erlaubt) {
      await ergaenzeExtra(r.id, { nachfassId: "gestoppt", recht: recht.grund })
      continue
    }
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
      extra: { stufe, vorgaenger: r.id, ...(r.bestaetigt ? { basisBestaetigt: new Date().toISOString() } : {}), warum: `Keine Antwort seit ${stufe === 1 ? NACHFASS_TAGE[0] : NACHFASS_TAGE[1] - NACHFASS_TAGE[0]} Tagen.` },
    })
    if (id) {
      await ergaenzeExtra(r.id, { nachfassId: id })
      neu++
    }
  }
  return neu
}

/** Antwort eingegangen: ganze Kette gilt als beantwortet, kein weiteres Nachfassen. */
export async function markiereAntwort(id: string, opts: { faden?: boolean } = {}): Promise<void> {
  const q = await assistentDb()
  if (!q) return
  const verworfen = (await q(
    `${KETTE} UPDATE assistent_freigaben SET status = 'verworfen', erledigt_at = now()
     WHERE status = 'offen' AND extra->>'vorgaenger' IN (SELECT id FROM kette) RETURNING id`,
    [id],
  )) as { id: string }[]
  const jetzt = JSON.stringify({
    antwortAt: new Date().toISOString(),
    antwortQuelle: id,
    antwortVerworfen: verworfen.map((v) => v.id),
  })
  await q(`${KETTE} UPDATE assistent_freigaben SET extra = extra || $2::jsonb WHERE id IN (SELECT id FROM kette)`, [id, jetzt])
  const f = (await q(`SELECT empfaenger, betreff FROM assistent_freigaben WHERE id = $1`, [id])) as {
    empfaenger: string | null
    betreff: string | null
  }[]
  const nq = neonAbfrage()
  if (nq && f[0]?.empfaenger && opts.faden !== false) {
    await notiereAntwort(nq, f[0].empfaenger, f[0].betreff, id).catch((e) =>
      console.error("[kundenfaden] Antwort nicht protokolliert:", (e as Error).message),
    )
  }
  /* Ins Rückgrat melden: stoppt Motor-Abläufe dieser Person (auch die ihrer Anfrage). */
  const empfaenger = f[0]?.empfaenger?.trim().toLowerCase() ?? null
  if (empfaenger) {
    const kontakt = nq
      ? ((await nq(`SELECT id FROM contacts WHERE email_normalised = $1 LIMIT 1`, [empfaenger]).catch(() => [])) as { id: string }[])
      : []
    const { ereignis } = await import("@/lib/motor/ereignis")
    await ereignis("antwort_erhalten", {
      kontaktId: kontakt[0]?.id ?? null,
      subjekt: `mail:${empfaenger}`,
      email: empfaenger,
      daten: { freigabe: id },
      schluessel: `antwort:${id}`,
    })
  }
}

const KETTE = `WITH RECURSIVE kette AS (
     SELECT id, extra->>'vorgaenger' AS vor FROM assistent_freigaben WHERE id = $1
     UNION ALL
     SELECT f.id, f.extra->>'vorgaenger' FROM assistent_freigaben f JOIN kette k ON f.id = k.vor)`

/**
 * "Antwort erhalten" zurücknehmen: Kette wieder offen, verworfene Nachfass-Mails
 * kommen zurück, Kundenverlauf und Verkaufsstufe werden exakt zurückgesetzt.
 */
export async function nimmAntwortZurueckFuer(id: string): Promise<void> {
  const q = await assistentDb()
  if (!q) return
  const r = (await q(`SELECT extra FROM assistent_freigaben WHERE id = $1`, [id])) as { extra: FreigabeExtra | null }[]
  const quelle = r[0]?.extra?.antwortQuelle ?? id
  const ursprung = (await q(`SELECT extra FROM assistent_freigaben WHERE id = $1`, [quelle])) as { extra: FreigabeExtra | null }[]
  const zurueck = ursprung[0]?.extra?.antwortVerworfen ?? []
  await q(
    `UPDATE assistent_freigaben SET extra = extra - 'antwortAt' - 'antwortQuelle' - 'antwortVerworfen'
     WHERE extra->>'antwortQuelle' = $1 OR id = $1`,
    [quelle],
  )
  if (zurueck.length > 0) {
    await q(`UPDATE assistent_freigaben SET status = 'offen', erledigt_at = NULL WHERE id = ANY($1::text[]) AND status = 'verworfen'`, [zurueck])
  }
  const nq = neonAbfrage()
  if (nq) {
    await nimmAntwortZurueck(nq, quelle).catch((e) =>
      console.error("[kundenfaden] Antwort nicht zurückgenommen:", (e as Error).message),
    )
  }
}

/**
 * Jede Mail aus dem Mail Studio landet als gesendete Mail-Freigabe im selben
 * Protokoll wie die Assistenten-Mails – damit gelten Liste, Antwort-Knopf und
 * automatisches Nachfassen für alle Mails gleich.
 */
export async function protokolliereStudioMail(m: { an: string; betreff: string; inhalt: string; mailId?: string }): Promise<string | null> {
  const id = await legeFreigabeAn({
    art: "mail",
    titel: m.betreff,
    empfaenger: m.an,
    betreff: m.betreff,
    inhalt: m.inhalt,
    agent: "studio",
    extra: { gesendetAt: new Date().toISOString(), ...(m.mailId ? { mailId: m.mailId } : {}) },
  })
  if (id) {
    const q = await assistentDb()
    await q?.(`UPDATE assistent_freigaben SET status = 'freigegeben', erledigt_at = now() WHERE id = $1`, [id])
    await inDenFaden({ an: m.an, betreff: m.betreff, text: kundenText(m.inhalt), quelleId: id, agent: "studio" })
  }
  return id
}

/**
 * Kampagnen-Versand (Mail Studio): pro Empfänger eine gesendete Mail-Zeile im
 * selben Protokoll wie alle anderen Mails — damit steht sie in der Versand-Liste
 * und `findeUrsprung()` (lib/eingang.ts) kann eine Antwort auf `antwort+<id>@`
 * zuordnen. Bewusst KEIN Nachfass (eine Kampagne ist keine Erstansprache) und
 * KEINE Bewegung einer Verkaufschance (`inDenFaden` wird nicht aufgerufen).
 * Die Id wird VOR dem Versand vergeben (`neueFreigabeId`), weil sie in der Antwortadresse steckt.
 */
export async function protokolliereKampagnenVersand(
  zeilen: { id: string; zustellungId: string; an: string; betreff: string; inhalt: string; kampagneId: string; mailId?: string }[],
): Promise<void> {
  const q = await assistentDb()
  if (!q) return
  const gesendetAt = new Date().toISOString()
  for (const z of zeilen) {
    const id = await legeFreigabeAn({
      id: z.id,
      art: "mail",
      titel: `Kampagne: ${z.betreff}`,
      empfaenger: z.an,
      betreff: z.betreff,
      inhalt: z.inhalt,
      quelle: `kampagne:${z.zustellungId}`,
      agent: "kampagne",
      extra: { gesendetAt, kampagneId: z.kampagneId, zustellungId: z.zustellungId, ...(z.mailId ? { mailId: z.mailId } : {}) },
    }).catch((e) => {
      console.error("[kampagne] Versand nicht protokolliert:", (e as Error).message)
      return null
    })
    if (id) await q(`UPDATE assistent_freigaben SET status = 'freigegeben', erledigt_at = now() WHERE id = $1`, [id])
  }
}

export type VersandStatus =
  | { art: "beantwortet"; am: string }
  | { art: "wartet"; nachfassAm: string }
  | { art: "nachfass_offen"; nachfassId: string }
  | { art: "nachgefasst" }
  | { art: "beendet" }
  /** Kampagnen-Mail: kein Nachfassen vorgesehen — nur der Antwortstand zählt. */
  | { art: "kampagne" }

export type VersandZeile = {
  id: string
  an: string
  betreff: string
  kurz: string
  gesendetAt: string
  quelle: "studio" | "assistent" | "nachfassen" | "kampagne"
  stufe: number
  kampagneId: string | null
  status: VersandStatus
}

function kurzfassung(inhalt: string): string {
  const text = kundenText(inhalt)
    .replace(/^\s*(hallo|guten tag|sehr geehrte[^\n]*|liebe[^\n]*)[^\n]*\n/i, "")
    .replace(/\*\*|__|^>\s?|^-\s?\[[a-z]+\]\s?|^[-*]\s/gim, "")
    .replace(/\s+/g, " ")
    .trim()
  return text.length > 150 ? `${text.slice(0, 147).trimEnd()} …` : text
}

/**
 * Alle gesendeten Mails, neueste zuerst, mit dem Stand der Antwort-/Nachfass-Kette.
 * `kampagnen: "ohne"` lässt die Einzelzeilen des Kampagnen-Versands weg (die Zeitleiste
 * zeigt eine Kampagne als EINE Zeile, nicht als eine je Empfänger).
 */
export async function ladeVersandListe(limit = 100, opts: { kampagnen?: "mit" | "ohne" } = {}): Promise<VersandZeile[]> {
  const q = await assistentDb()
  if (!q) return []
  const rows = (await q(
    `SELECT f.id, f.empfaenger, f.betreff, f.titel, f.inhalt, f.agent, f.extra, n.status AS nachfass_status
     FROM assistent_freigaben f
     LEFT JOIN assistent_freigaben n ON n.id = f.extra->>'nachfassId'
     WHERE f.art = 'mail' AND f.extra ? 'gesendetAt'${opts.kampagnen === "ohne" ? " AND NOT f.extra ? 'kampagneId'" : ""}
     ORDER BY (f.extra->>'gesendetAt')::timestamptz DESC
     LIMIT $1`,
    [limit],
  )) as {
    id: string
    empfaenger: string | null
    betreff: string | null
    titel: string
    inhalt: string
    agent: string | null
    extra: FreigabeExtra | null
    nachfass_status: string | null
  }[]
  return rows.map((r) => {
    const e = r.extra ?? {}
    const stufe = e.stufe ?? 0
    const gesendetAt = e.gesendetAt as string
    let status: VersandStatus
    if (e.antwortAt) status = { art: "beantwortet", am: e.antwortAt }
    else if (e.nachfassId && r.nachfass_status === "offen") status = { art: "nachfass_offen", nachfassId: e.nachfassId }
    else if (e.nachfassId) status = { art: "nachgefasst" }
    else if (e.kampagneId) status = { art: "kampagne" }
    else if (stufe >= MAX_STUFE) status = { art: "beendet" }
    else {
      const tage = stufe === 0 ? NACHFASS_TAGE[0] : NACHFASS_TAGE[1] - NACHFASS_TAGE[0]
      status = { art: "wartet", nachfassAm: new Date(new Date(gesendetAt).getTime() + tage * 86_400_000).toISOString() }
    }
    return {
      id: r.id,
      an: r.empfaenger ?? "",
      betreff: r.betreff || r.titel,
      kurz: kurzfassung(r.inhalt),
      gesendetAt,
      quelle: e.vorgaenger ? "nachfassen" : r.agent === "kampagne" ? "kampagne" : r.agent === "studio" ? "studio" : "assistent",
      stufe,
      kampagneId: e.kampagneId ?? null,
      status,
    }
  })
}

/** Antworten je Kampagne (Zeilen mit `antwortAt`) — für die gemeinsame Zeitleiste. */
export async function ladeKampagnenAntworten(): Promise<Record<string, number>> {
  const q = await assistentDb()
  if (!q) return {}
  const rows = (await q(
    `SELECT extra->>'kampagneId' AS id, COUNT(*) FILTER (WHERE extra ? 'antwortAt')::int AS n
       FROM assistent_freigaben WHERE art = 'mail' AND extra ? 'kampagneId' GROUP BY 1`,
    [],
  )) as { id: string; n: number }[]
  return Object.fromEntries(rows.map((r) => [r.id, r.n]))
}

export type Ansprache = { gesendet: number; beantwortet: number; quote: number | null; nachfassOffen: number }

/** Erstansprachen der letzten 60 Tage (ohne Nachfass-Mails) und wie viele geantwortet haben. */
export async function ladeAnsprache(): Promise<Ansprache> {
  const leer = { gesendet: 0, beantwortet: 0, quote: null, nachfassOffen: 0 }
  const q = await assistentDb()
  if (!q) return leer
  const [r] = (await q(
    `SELECT
       COUNT(*) FILTER (WHERE extra ? 'gesendetAt' AND NOT extra ? 'vorgaenger' AND NOT extra ? 'kampagneId' AND (extra->>'gesendetAt')::timestamptz > now() - interval '60 days')::int AS gesendet,
       COUNT(*) FILTER (WHERE extra ? 'antwortAt' AND NOT extra ? 'vorgaenger' AND NOT extra ? 'kampagneId' AND (extra->>'gesendetAt')::timestamptz > now() - interval '60 days')::int AS beantwortet,
       COUNT(*) FILTER (WHERE status = 'offen' AND extra ? 'vorgaenger')::int AS "nachfassOffen"
     FROM assistent_freigaben WHERE art = 'mail'`,
    [],
  )) as { gesendet: number; beantwortet: number; nachfassOffen: number }[]
  if (!r) return leer
  return { ...r, quote: r.gesendet ? Math.round((r.beantwortet / r.gesendet) * 100) : null }
}
