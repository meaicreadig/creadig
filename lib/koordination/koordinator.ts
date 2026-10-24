import "server-only"
import { generateText, stepCountIs } from "ai"
import { ABTEILUNGEN, abteilungVonAgent } from "@/lib/zentrale/abteilungen"
import { assistentDb, ergaenzeExtra, ladeFreigabe, legeFreigabeAn, letzteLaeufe, setzeFreigabe } from "@/lib/assistent/store"
import type { Abfrage } from "@/lib/neon-abfrage"
import { firmenText } from "@/lib/firmenwahrheit"
import { inhalteText } from "@/lib/inhalte"

import { akteWerkzeuge, FESTE_FAKTEN } from "./akte"

/**
 * Interne Koordination der KI-Firma.
 *
 * Jede neue interne Arbeit (Motor-Aufgabe, Notiz, Agenten-Ergebnis) wird automatisch
 * einer Abteilung zugeordnet und dort bearbeitet. Abteilungen geben Arbeit untereinander
 * weiter. Emin wird nur gefragt, wenn etwas nach außen geht, Geld kostet, gelöscht wird
 * oder eine echte Entscheidung braucht – dann mit fertig vorbereiteter Vorlage.
 */

const MODELL = "openai/gpt-5.4-mini"
const MAX_TIEFE = 3
const JE_LAUF = 6

export type AuftragStatus = "neu" | "erledigt" | "weitergegeben" | "bei_emin"
export type Auftrag = {
  id: string
  von: string
  an: string
  titel: string
  inhalt: string
  status: AuftragStatus
  ergebnis: string | null
  eltern: string | null
  tiefe: number
  freigabeId: string | null
  zeit: string
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS firma_auftraege (
    id text PRIMARY KEY,
    von text NOT NULL,
    an text NOT NULL,
    titel text NOT NULL,
    inhalt text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'neu' CHECK (status IN ('neu','erledigt','weitergegeben','bei_emin')),
    ergebnis text,
    quelle text,
    eltern text,
    tiefe int NOT NULL DEFAULT 0,
    freigabe_id text,
    versuche int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    erledigt_at timestamptz)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS firma_auftraege_quelle_idx ON firma_auftraege (quelle) WHERE quelle IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS firma_auftraege_neu_idx ON firma_auftraege (created_at) WHERE status = 'neu'`,
]

let bereit: Promise<void> | null = null
async function db() {
  const q = await assistentDb()
  if (!q) return null
  if (!bereit) {
    bereit = (async () => {
      for (const ddl of SCHEMA) await q(ddl, [])
    })().catch((e) => {
      bereit = null
      throw e
    })
  }
  await bereit
  return q
}

const neueId = () => `auf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
export const abteilungName = (id: string) =>
  id === "emin" ? "Emin" : id === "koordination" ? "Koordination" : (ABTEILUNGEN.find((a) => a.id === id)?.name.de ?? id)

type Zeile = {
  id: string
  von: string
  an: string
  titel: string
  inhalt: string
  status: AuftragStatus
  ergebnis: string | null
  eltern: string | null
  tiefe: number
  freigabe_id: string | null
  created_at: string | Date
}
const alsAuftrag = (z: Zeile): Auftrag => ({
  id: z.id,
  von: z.von,
  an: z.an,
  titel: z.titel,
  inhalt: z.inhalt,
  status: z.status,
  ergebnis: z.ergebnis,
  eltern: z.eltern,
  tiefe: z.tiefe,
  freigabeId: z.freigabe_id,
  zeit: new Date(z.created_at).toISOString(),
})

export async function legeAuftragAn(a: {
  von: string
  an: string
  titel: string
  inhalt: string
  quelle?: string | null
  eltern?: string | null
  tiefe?: number
  freigabeId?: string | null
}): Promise<string | null> {
  const q = await db()
  if (!q) return null
  const an = ABTEILUNGEN.some((x) => x.id === a.an) ? a.an : "geschaeftsfuehrung"
  const id = neueId()
  const rows = (await q(
    `INSERT INTO firma_auftraege (id, von, an, titel, inhalt, quelle, eltern, tiefe, freigabe_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (quelle) WHERE quelle IS NOT NULL DO NOTHING RETURNING id`,
    [id, a.von, an, a.titel.slice(0, 160), a.inhalt.slice(0, 4000), a.quelle ?? null, a.eltern ?? null, a.tiefe ?? 0, a.freigabeId ?? null],
  )) as { id: string }[]
  return rows[0]?.id ?? null
}

export async function ladeAuftraege(limit = 30): Promise<Auftrag[]> {
  const q = await db().catch(() => null)
  if (!q) return []
  const rows = (await q(
    `SELECT id, von, an, titel, inhalt, status, ergebnis, eltern, tiefe, freigabe_id, created_at
     FROM firma_auftraege ORDER BY created_at DESC LIMIT $1`,
    [limit],
  )) as Zeile[]
  return rows.map(alsAuftrag)
}

/** Aufträge, die aus einer bestimmten Quelle entstanden sind (z. B. "bulletin:2026-10-22:"). */
export async function ladeAuftraegeMitQuelle(praefix: string, limit = 12): Promise<Auftrag[]> {
  const q = await db().catch(() => null)
  if (!q) return []
  const rows = (await q(
    `SELECT id, von, an, titel, inhalt, status, ergebnis, eltern, tiefe, freigabe_id, created_at
     FROM firma_auftraege WHERE quelle LIKE $1 ORDER BY created_at ASC LIMIT $2`,
    [`${praefix.replace(/[%_]/g, "")}%`, limit],
  )) as Zeile[]
  return rows.map(alsAuftrag)
}

export async function auftragKennzahlen(): Promise<{ heute: number; erledigt: number; uebergaben: number; beiEmin: number; offen: number }> {
  const q = await db().catch(() => null)
  if (!q) return { heute: 0, erledigt: 0, uebergaben: 0, beiEmin: 0, offen: 0 }
  const rows = (await q(
    `SELECT
       count(*) FILTER (WHERE created_at > now() - interval '24 hours')::int AS heute,
       count(*) FILTER (WHERE status = 'erledigt' AND erledigt_at > now() - interval '7 days')::int AS erledigt,
       count(*) FILTER (WHERE status = 'weitergegeben' AND erledigt_at > now() - interval '7 days')::int AS uebergaben,
       count(*) FILTER (WHERE status = 'bei_emin' AND erledigt_at > now() - interval '7 days')::int AS bei_emin,
       count(*) FILTER (WHERE status = 'neu')::int AS offen
     FROM firma_auftraege`,
    [],
  )) as { heute: number; erledigt: number; uebergaben: number; bei_emin: number; offen: number }[]
  const r = rows[0]
  return { heute: r?.heute ?? 0, erledigt: r?.erledigt ?? 0, uebergaben: r?.uebergaben ?? 0, beiEmin: r?.bei_emin ?? 0, offen: r?.offen ?? 0 }
}

/** Offene interne Freigaben (Aufgaben/Notizen) ohne Auftrag → in die Firma einspeisen. */
async function sammleEin(): Promise<number> {
  const q = await db()
  if (!q) return 0
  const rows = (await q(
    `SELECT f.id, f.titel, f.inhalt, f.agent FROM assistent_freigaben f
     WHERE f.status = 'offen' AND f.art IN ('aufgabe','notiz')
       AND coalesce(f.extra->'koordination'->>'beiEmin', '') <> 'true'
       AND NOT EXISTS (SELECT 1 FROM firma_auftraege a WHERE a.quelle = 'frg:' || f.id)
     ORDER BY f.created_at ASC LIMIT 10`,
    [],
  )) as { id: string; titel: string; inhalt: string; agent: string | null }[]
  let n = 0
  for (const f of rows) {
    const abt = abteilungVonAgent(f.agent)
    const id = await legeAuftragAn({
      von: f.agent ?? "system",
      an: abt?.id ?? (await ordneZu(f.titel, f.inhalt)),
      titel: f.titel,
      inhalt: f.inhalt,
      quelle: `frg:${f.id}`,
      freigabeId: f.id,
    })
    if (id) n++
  }
  return n
}

function abteilungsListe(): string {
  return ABTEILUNGEN.map((a) => `- ${a.id}: ${a.name.de} – ${a.aufgabe.de}${a.agenten.length ? "" : " (ohne festen KI-Mitarbeiter, Koordination vertritt)"}`).join("\n")
}

async function ordneZu(titel: string, inhalt: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: MODELL,
      prompt: `Ordne diese interne Arbeit genau einer Abteilung zu. Antworte NUR mit der Abteilungs-ID.\n\nAbteilungen:\n${abteilungsListe()}\n\nArbeit: ${titel}\n${inhalt.slice(0, 800)}`,
    })
    const id = text.trim().split(/\s/)[0]?.replace(/[^a-z_-]/g, "")
    return ABTEILUNGEN.some((a) => a.id === id) ? id! : "geschaeftsfuehrung"
  } catch {
    return "geschaeftsfuehrung"
  }
}

type Entscheidung = {
  entscheidung: "erledigt" | "weitergeben" | "emin"
  ergebnis: string
  an?: string
  uebergabe?: string
  frage?: string
}

function parse(text: string): Entscheidung | null {
  const a = text.indexOf("{")
  const b = text.lastIndexOf("}")
  if (a < 0 || b <= a) return null
  try {
    const p = JSON.parse(text.slice(a, b + 1)) as Entscheidung
    if (!["erledigt", "weitergeben", "emin"].includes(p.entscheidung) || typeof p.ergebnis !== "string") return null
    return p
  } catch {
    return null
  }
}

async function verlauf(eltern: string | null): Promise<string> {
  if (!eltern) return ""
  const q = await db()
  if (!q) return ""
  const teile: string[] = []
  let id: string | null = eltern
  for (let i = 0; id && i < MAX_TIEFE; i++) {
    const rows = (await q(`SELECT id, an, titel, ergebnis, eltern FROM firma_auftraege WHERE id = $1`, [id])) as {
      an: string
      titel: string
      ergebnis: string | null
      eltern: string | null
    }[]
    const z = rows[0]
    if (!z) break
    teile.unshift(`${abteilungName(z.an)}: ${z.titel}\n${(z.ergebnis ?? "").slice(0, 900)}`)
    id = z.eltern
  }
  return teile.join("\n\n")
}

const REGELN = `GRENZEN (unverletzlich):
- Du arbeitest NUR intern: nachsehen, analysieren, planen, Texte und Vorlagen fertig ausarbeiten, priorisieren, an andere Abteilungen übergeben.
- Du sendest NIE etwas nach außen, gibst kein Geld aus, löschst nichts, gehst keine Verpflichtung ein.
- Alles, was nach außen geht (Mail, Brief, Anruf, Beitrag, Antrag, Anmeldung, Angebot an Kunden), Geld kostet, löscht oder einen Vertrag berührt → "emin" – mit FERTIGER Vorlage in "ergebnis", damit Emin nur noch ja/nein sagt.
- Alles andere entscheidet die Firma selbst. Emin will keine internen Rückfragen sehen (Entscheid 21.10.2026). Interne Fragen entscheidet die Geschäftsführung.
- Fragen wie „Soll ich … vorbereiten/erstellen/auswerten?" sind verboten: Die Antwort ist immer ja – liefere es direkt im "ergebnis".
- Frage nie nach Daten, die im System stehen: Sieh zuerst mit den Werkzeugen nach (Webseiten-Befunde, Belege, Pipeline, Bulletin, KI-Mitarbeiter, offene Karten, frühere Arbeit). Nenne im Ergebnis die konkreten Fakten (Befundtitel, Beträge, Daten), nicht „Befund 1".
- Doppelte oder überholte interne Karten schließt du selbst mit "interne_karte_schliessen".
- Eigene Produkte (fibero, stammo, meAI, cassamea, creaDIG) brauchen nie eine Freigabe. Was schon im Freigabe-System steht, legst du nicht neu an.
- Erfinde keine Zahlen, Namen oder Fakten. Was nach dem Nachsehen wirklich fehlt, benennst du in einem Satz und arbeitest mit dem Rest weiter.
- Gib nur weiter, wenn eine andere Abteilung wirklich etwas Eigenes beitragen muss (z. B. Vertrieb gewinnt → Projektmanagement liefert).`

/**
 * Arbeit, die einen Kunden, Geld oder die Außenwirkung berührt, entscheidet nie die KI allein:
 * Motor-Schritte (Kundenmails), Finanz- und Forderungsvorschläge (Angebot, Mahnung), Projekt-
 * Nachfassen – und alles, dessen Titel nach Versand, Angebot, Rechnung oder Kundenkontakt klingt.
 */
const AUSSEN_AGENTEN = new Set(["motor", "finanz", "forderungen", "projekte", "golf", "kapital", "investor"])
const AUSSEN_TITEL =
  /\b(mail|e-mail|senden|schicken|versenden|angebot|rechnung|mahnung|zahlungserinnerung|anruf|anrufen|termin|dankesmail|kunde|kundin|nachfass|antwort an|antrag|bewerbung|pitch)\w*/i

/** Rückfragen an Emin, die wirklich nur er beantworten kann: Außenwirkung, Geld, Verträge. */
const AUSSEN_FRAGE =
  /\b(mail|senden|schick|versend|brief|anruf|anrufen|telefon|angebot|rechnung|mahnung|kunde|kundin|antrag|bewerb|einreich|anmeld|registrier|teilnahme|teilnehm|unterschreib|vertrag|kündig|bestell|kauf|bezahl|zahlung|kosten|budget|veröffentlich|posten|linkedin|beitrag|pitch|investor)\w*/i
const NUR_VORBEREITEN = /^\s*(soll|darf|möchtest|willst)\s+(ich|wir|du)\b[^?]*(vorbereit|erstell|entwerf|ausarbeit|auswert|zusammenfass|formulier|anleg|gliedern|aufbereit|prüf)/i

export function gehtNachAussen(a: { von: string; titel: string; freigabeId?: string | null }): boolean {
  /* Reine Abteilungsaufträge (ohne Freigabe-Karte) bleiben intern – sonst landet jeder Wochenplan bei Emin. */
  return AUSSEN_AGENTEN.has(a.von) || (Boolean(a.freigabeId) && AUSSEN_TITEL.test(a.titel))
}

/** Emin eine fertige Vorlage in den Freigabe-Eingang legen – an die bestehende Freigabe oder als neue Karte. */
async function legeEminVor(q: Abfrage, a: Auftrag, vorlage: string): Promise<void> {
  const koordination = { abteilung: a.an, ergebnis: vorlage, auftragId: a.id, beiEmin: true }
  let freigabeId = a.freigabeId
  if (freigabeId) {
    await ergaenzeExtra(freigabeId, { koordination })
  } else {
    freigabeId = await legeFreigabeAn({
      art: "aufgabe",
      titel: a.titel,
      inhalt: vorlage,
      quelle: `auftrag:${a.id}`,
      agent: a.von,
      extra: { koordination },
    })
  }
  await q(`UPDATE firma_auftraege SET status = 'bei_emin', ergebnis = $2, freigabe_id = coalesce($3, freigabe_id), erledigt_at = now() WHERE id = $1`, [
    a.id,
    vorlage,
    freigabeId,
  ])
}

/**
 * Reparatur: Bis 22.10.2026 hat die Koordination Vorlagen für Emin und Kundenschritte als
 * "freigegeben" geschlossen, ohne dass Emin sie je sah. Diese Karten kommen einmalig zurück
 * in den Eingang (offen, sichtbar). Idempotent über extra.zurueckgeholt.
 */
async function holeVorlagenZurueck(q: Abfrage): Promise<number> {
  const rows = (await q(
    `SELECT f.id, f.titel, coalesce(f.agent, '') AS agent, f.extra->'koordination' AS k FROM assistent_freigaben f
      WHERE f.status = 'freigegeben' AND f.art IN ('aufgabe','notiz')
        AND f.extra ? 'koordination' AND NOT (f.extra ? 'zurueckgeholt')
        AND f.erledigt_at > now() - interval '30 days'`,
    [],
  )) as { id: string; titel: string; agent: string; k: { automatisch?: boolean } }[]
  let n = 0
  for (const r of rows) {
    const warVorlage = !r.k?.automatisch
    if (!warVorlage && !gehtNachAussen({ von: r.agent, titel: r.titel, freigabeId: r.id })) continue
    await q(
      `UPDATE assistent_freigaben SET status = 'offen', erledigt_at = NULL,
         extra = jsonb_set(extra || jsonb_build_object('zurueckgeholt', now()::text), '{koordination,beiEmin}', 'true'::jsonb)
       WHERE id = $1 AND status = 'freigegeben'`,
      [r.id],
    )
    n++
  }
  return n
}

function systemFuer(abtId: string): Promise<string> {
  const abt = ABTEILUNGEN.find((x) => x.id === abtId)
  return inhalteText().then(
    (inhalte) => `Du bist die Abteilung "${abt?.name.de ?? abtId}" der KI-Firma creaDIG Solutions.
${firmenText("voll")}
${inhalte}
${FESTE_FAKTEN()}
Aufgabe der Abteilung: ${abt?.aufgabe.de ?? "Unterstützung"}.
Du arbeitest wie ein erfahrenes Team in einer professionellen Firma: erst nachsehen, dann konkret, knapp, auf Deutsch, umsetzbar.

${REGELN}

Abteilungen für Übergaben:
${abteilungsListe()}

Antworte am Ende NUR mit JSON:
{"entscheidung":"erledigt"|"weitergeben"|"emin","ergebnis":"dein konkretes Arbeitsergebnis (max. 1500 Zeichen, Stichpunkte erlaubt)","an":"abteilungs-id (nur bei weitergeben)","uebergabe":"was die nächste Abteilung tun soll (nur bei weitergeben)","frage":"die eine Ja/Nein-Frage an Emin (nur bei emin)"}`,
  )
}

async function frageAbteilung(abtId: string, prompt: string): Promise<Entscheidung | null> {
  const { text } = await generateText({
    model: MODELL,
    system: await systemFuer(abtId),
    prompt,
    tools: akteWerkzeuge(abtId),
    stopWhen: stepCountIs(8),
    maxOutputTokens: 2500,
  })
  return parse(text)
}

async function bearbeite(a: Auftrag): Promise<void> {
  const q = await db()
  if (!q) return
  const davor = await verlauf(a.eltern)
  const auftrag = `${davor ? `Bisherige Arbeit in dieser Kette:\n${davor}\n\n` : ""}Neuer Auftrag von ${abteilungName(a.von)}:\n${a.titel}\n\n${a.inhalt}${a.tiefe >= MAX_TIEFE - 1 ? "\n\nHinweis: Kette ist lang – nicht weitergeben, abschließen oder an Emin." : ""}`
  let e = await frageAbteilung(a.an, auftrag)
  if (!e) {
    await q(`UPDATE firma_auftraege SET versuche = versuche + 1 WHERE id = $1`, [a.id])
    return
  }

  const aussen = gehtNachAussen(a)
  /* „Soll ich das vorbereiten?" ist keine Frage an den Chef – einmal nachfassen, dann liefern. */
  if (e.entscheidung === "emin" && !aussen && NUR_VORBEREITEN.test(e.frage ?? "")) {
    e =
      (await frageAbteilung(
        a.an,
        `${auftrag}\n\nDeine Rückfrage war: „${e.frage}“. Antwort der Geschäftsführung: Ja. Liefere es jetzt vollständig im "ergebnis" und schließe mit "erledigt" ab (oder "emin" nur, wenn danach etwas nach außen geht).`,
      )) ?? e
  }
  /* Interne Fragen gehen an die Geschäftsführung, nicht an Emin (Entscheid 21.10.2026). */
  const echteChefFrage = aussen || AUSSEN_FRAGE.test(`${e.frage ?? ""} ${a.titel}`)
  if (e.entscheidung === "emin" && !echteChefFrage) {
    if (a.an !== "geschaeftsfuehrung" && a.tiefe < MAX_TIEFE - 1) {
      e = { entscheidung: "weitergeben", an: "geschaeftsfuehrung", uebergabe: `Entscheide anstelle von Emin: ${e.frage ?? a.titel}`, ergebnis: e.ergebnis }
    } else {
      e = { ...e, entscheidung: "erledigt", ergebnis: `${e.ergebnis}${e.frage ? `\n\nOffen (intern entschieden: nach bestem Wissen weiter): ${e.frage}` : ""}` }
    }
  }
  const ergebnis = e.ergebnis.slice(0, 2000)

  if (e.entscheidung === "weitergeben" && e.an && e.an !== a.an && ABTEILUNGEN.some((x) => x.id === e.an) && a.tiefe < MAX_TIEFE - 1) {
    await legeAuftragAn({
      von: a.an,
      an: e.an,
      titel: e.uebergabe?.slice(0, 160) || a.titel,
      inhalt: `${e.uebergabe ?? ""}\n\nVorarbeit ${abteilungName(a.an)}:\n${ergebnis}`,
      eltern: a.id,
      tiefe: a.tiefe + 1,
      freigabeId: a.freigabeId,
    })
    await q(`UPDATE firma_auftraege SET status = 'weitergegeben', ergebnis = $2, erledigt_at = now() WHERE id = $1`, [a.id, ergebnis])
    return
  }

  /* Nach außen gerichtete Arbeit geht immer an Emin – auch wenn die KI sie für erledigt hält. */
  if (e.entscheidung === "emin" || aussen) {
    const vorlage = `${e.frage ? `Frage: ${e.frage}\n\n` : ""}Vorbereitet von ${abteilungName(a.an)}:\n${ergebnis}`
    await legeEminVor(q, a, vorlage)
    return
  }

  // Intern erledigt: zugehörige interne Freigabe schließen, Ergebnis bleibt nachlesbar.
  /* Nur interne Karten (Aufgabe/Notiz) schließt die Koordination – Mail, Brief, LinkedIn nie. */
  const intern = a.freigabeId ? ["aufgabe", "notiz"].includes((await ladeFreigabe(a.freigabeId))?.art ?? "") : false
  if (a.freigabeId && intern) {
    const f = await ladeFreigabe(a.freigabeId)
    await ergaenzeExtra(a.freigabeId, {
      ...(f && istCodeArbeit(f.agent ?? "", f.inhalt) ? { code: true } : {}),
      koordination: { abteilung: a.an, ergebnis, auftragId: a.id, automatisch: true },
    })
    await setzeFreigabe(a.freigabeId, "freigegeben")
  }
  await q(`UPDATE firma_auftraege SET status = 'erledigt', ergebnis = $2, erledigt_at = now() WHERE id = $1`, [a.id, ergebnis])
}

/** Karten, die nur eine Code-Änderung löst: Entwicklung/IT/Sicherheit oder ein Claude-Code-Auftrag. */
const CODE_AGENTEN = new Set(["entwicklung", "it", "sicherheit", "webseite"])
const istCodeArbeit = (agent: string, inhalt: string) => CODE_AGENTEN.has(agent) || /claude code|coding-agent|im code|code[- ]änderung/i.test(inhalt)

/**
 * Aufräumen (Entscheid Emin 21.10.2026: „Freigabesystem soll im Hintergrund laufen"):
 * Interne Karten, die bei Emin liegen, aber weder Kunde noch Geld noch Außenwirkung
 * berühren, schließt die Geschäftsführung nach 2 Tagen selbst. Code-Arbeit wandert ins
 * Code-Backlog (extra.code), statt als Entscheidung im Eingang zu stehen.
 * Mail, Brief, LinkedIn, Kapital, Löschen und alles Außen-Gerichtete bleiben unberührt.
 */
export async function raeumeEingangAuf(minTage = 2): Promise<{ geschlossen: number; code: number }> {
  const q = await db()
  if (!q) return { geschlossen: 0, code: 0 }
  const rows = (await q(
    `SELECT id, titel, inhalt, coalesce(agent, '') AS agent, extra->'koordination'->>'ergebnis' AS vorlage FROM assistent_freigaben
      WHERE status = 'offen' AND art IN ('aufgabe','notiz')
        AND coalesce(extra->'koordination'->>'beiEmin', '') = 'true'
        AND created_at < now() - make_interval(days => $1)
      ORDER BY created_at ASC LIMIT 40`,
    [minTage],
  )) as { id: string; titel: string; inhalt: string; agent: string; vorlage: string | null }[]
  let geschlossen = 0
  let code = 0
  for (const r of rows) {
    if (gehtNachAussen({ von: r.agent, titel: r.titel, freigabeId: r.id })) continue
    const frage = (r.vorlage ?? "").match(/^Frage: (.*)$/m)?.[1] ?? ""
    if (AUSSEN_FRAGE.test(`${r.titel} ${frage}`)) continue
    const istCode = istCodeArbeit(r.agent, r.inhalt)
    await ergaenzeExtra(r.id, {
      ...(istCode ? { code: true } : {}),
      koordination: {
        abteilung: "geschaeftsfuehrung",
        ergebnis: `${r.vorlage ? `${r.vorlage.slice(0, 1500)}\n\n` : ""}Geschäftsführung: intern entschieden – ${istCode ? "liegt im Code-Backlog" : "kein Kunde, kein Geld, keine Außenwirkung"}.`,
        auftragId: "aufraeumen",
        automatisch: true,
      },
    })
    await setzeFreigabe(r.id, "freigegeben")
    geschlossen++
    if (istCode) code++
  }
  return { geschlossen, code }
}

/** Arbeitet die interne Warteschlange ab. Läuft bei jedem Takt (Cron + Seitenaufruf). */
export async function arbeiteWarteschlangeAb(): Promise<{ eingesammelt: number; bearbeitet: number }> {
  const q = await db()
  if (!q) return { eingesammelt: 0, bearbeitet: 0 }
  const zurueck = await holeVorlagenZurueck(q)
  if (zurueck > 0) console.info(`[koordination] ${zurueck} Vorlagen wieder in den Eingang gelegt`)
  const eingesammelt = await sammleEin()
  // Kleine Sperre: dieselben Aufträge nicht parallel aus zwei Aufrufen bearbeiten.
  const rows = (await q(
    `UPDATE firma_auftraege SET versuche = versuche + 1
     WHERE id IN (SELECT id FROM firma_auftraege WHERE status = 'neu' AND versuche < 3 ORDER BY created_at ASC LIMIT $1 FOR UPDATE SKIP LOCKED)
     RETURNING id, von, an, titel, inhalt, status, ergebnis, eltern, tiefe, freigabe_id, created_at`,
    [JE_LAUF],
  )) as Zeile[]
  let bearbeitet = 0
  for (const z of rows) {
    try {
      await bearbeite(alsAuftrag(z))
      bearbeitet++
    } catch (e) {
      console.error("[koordination] auftrag", z.id, e instanceof Error ? e.message : e)
    }
  }
  return { eingesammelt, bearbeitet }
}

/**
 * Tägliche Runde des Chief of Staff: liest, was jede Abteilung heute geschafft hat,
 * und stößt bis zu 3 abteilungsübergreifende Aufträge an (Pässe zwischen Abteilungen).
 */
export async function koordinatorRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const laeufe = await letzteLaeufe()
  const tag = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" })
  const lage = Object.entries(laeufe)
    .filter(([k]) => k !== "koordinator")
    .map(([k, l]) => {
      const abt = abteilungVonAgent(k)
      return `- ${abt?.name.de ?? k} (${k}): ${l.ergebnis}${l.fehler ? ` [Fehler: ${l.fehler}]` : ""} · ${l.zeit.slice(0, 10)}`
    })
    .join("\n")
  const offeneKette = await ladeAuftraege(15)
  const zuletzt = offeneKette.map((a) => `- ${abteilungName(a.an)} [${a.status}]: ${a.titel}`).join("\n")
  const { berechneLeistung, engpassBericht } = await import("@/lib/zentrale/leistung")
  const leistung = await berechneLeistung().catch(() => null)
  const engpaesse = leistung ? engpassBericht(leistung) : "(unbekannt)"
  const schwach = leistung
    ? leistung.abteilungen
        .filter((x) => x.besetzt && x.note != null && x.note < 60)
        .map((x) => `- ${x.name.de}: Note ${x.note}`)
        .join("\n")
    : ""

  const { text } = await generateText({
    model: MODELL,
    system: `Du bist der Chief of Staff (CEO-Assistent) der KI-Firma creaDIG Solutions.
${firmenText("kurz")}
Du koordinierst ${ABTEILUNGEN.length} Abteilungen so, dass die Firma ohne Emin intern weiterarbeitet.
${REGELN}

Abteilungen:
${abteilungsListe()}

Antworte NUR mit JSON: {"auftraege":[{"an":"abteilungs-id","titel":"…","inhalt":"was genau, warum jetzt, welches Ergebnis erwartet wird"}],"lage":"1 Satz Gesamtlage"}
Höchstens 3 Aufträge, nur wenn sie echten Fortschritt bringen und nicht schon in der Liste stehen. Lieber 0 als Beschäftigungstherapie.
Engpässe haben Vorrang: Wenn eine Abteilung hängt oder schwach ist, ist dein erster Auftrag, das zu lösen (Arbeit umverteilen, vereinfachen, Vorarbeit liefern).`,
    prompt: `Heute ${tag}. Ergebnisse der KI-Mitarbeiter:\n${lage || "(noch keine)"}\n\nLetzte interne Aufträge:\n${zuletzt || "(keine)"}\n\nEngpässe:\n${engpaesse}${schwach ? `\n\nSchwache Abteilungen (14 Tage):\n${schwach}` : ""}`,
  })
  const a = text.indexOf("{")
  const b = text.lastIndexOf("}")
  let p: { auftraege?: { an: string; titel: string; inhalt: string }[]; lage?: string } = {}
  try {
    p = a >= 0 && b > a ? JSON.parse(text.slice(a, b + 1)) : {}
  } catch {
    p = {}
  }
  let n = 0
  for (const [i, x] of (p.auftraege ?? []).slice(0, 3).entries()) {
    if (!x?.titel || !x?.an) continue
    const id = await legeAuftragAn({ von: "koordination", an: x.an, titel: x.titel, inhalt: x.inhalt ?? "", quelle: `runde:${tag}:${i}` })
    if (id) n++
  }
  const w = await arbeiteWarteschlangeAb()
  return {
    ergebnis: `${p.lage ? `${p.lage} · ` : ""}${n} neue Aufträge verteilt, ${w.bearbeitet} intern bearbeitet`,
    anzahl: n + w.bearbeitet,
  }
}

