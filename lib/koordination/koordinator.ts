import "server-only"
import { generateText } from "ai"
import { ABTEILUNGEN, abteilungVonAgent } from "@/lib/zentrale/abteilungen"
import { assistentDb, ergaenzeExtra, legeFreigabeAn, letzteLaeufe, setzeFreigabe } from "@/lib/assistent/store"

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
const abteilungName = (id: string) =>
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
- Du arbeitest NUR intern: analysieren, planen, Checklisten, Texte entwerfen, priorisieren, an andere Abteilungen übergeben.
- Du sendest NIE etwas nach außen, gibst kein Geld aus, löschst nichts, gehst keine Verpflichtung ein.
- Alles, was nach außen geht (Mail, Anruf, Beitrag, Antrag, Angebot an Kunden), Geld kostet, löscht oder eine echte Chef-Entscheidung braucht → "emin" – mit FERTIGER Vorlage in "ergebnis", damit Emin nur noch ja/nein sagen muss.
- Freigaben, Nachweise und Kundenfreigaben sind Verwaltung: erledige sie selbst ("erledigt"). Eigene Produkte (fibero, stammo, meAI, cassamea, creaDIG) brauchen nie eine Freigabe. Was schon im Freigabe-System steht, legst du nicht neu an.
- "emin" nur, wenn wirklich nur er handeln kann. Reine Kenntnisnahme, Routine oder Verwaltung ist "erledigt".
- Erfinde keine Zahlen, Namen oder Fakten. Was fehlt, benennst du als offene Frage.
- Gib nur weiter, wenn eine andere Abteilung wirklich etwas Eigenes beitragen muss (z. B. Vertrieb gewinnt → Projektmanagement liefert; Golf-Chance → Geschäftsführung bereitet Pitch vor).`

async function bearbeite(a: Auftrag): Promise<void> {
  const q = await db()
  if (!q) return
  const abt = ABTEILUNGEN.find((x) => x.id === a.an)
  const davor = await verlauf(a.eltern)
  const { text } = await generateText({
    model: MODELL,
    system: `Du bist die Abteilung "${abt?.name.de ?? a.an}" der KI-Firma creaDIG Solutions (Einzelunternehmen von Muhammed Emin Akyol; Produkte fibero, stammo, creaDIG Web & System; Märkte DE/EU, Türkei, Golfstaaten). Aufgabe der Abteilung: ${abt?.aufgabe.de ?? "Unterstützung"}.
Du arbeitest wie ein erfahrenes Team in einer professionellen Firma: konkret, knapp, auf Deutsch, umsetzbar.

${REGELN}

Abteilungen für Übergaben:
${abteilungsListe()}

Antworte NUR mit JSON:
{"entscheidung":"erledigt"|"weitergeben"|"emin","ergebnis":"dein konkretes Arbeitsergebnis (max. 1200 Zeichen, Stichpunkte erlaubt)","an":"abteilungs-id (nur bei weitergeben)","uebergabe":"was die nächste Abteilung tun soll (nur bei weitergeben)","frage":"die eine Frage an Emin (nur bei emin)"}`,
    prompt: `${davor ? `Bisherige Arbeit in dieser Kette:\n${davor}\n\n` : ""}Neuer Auftrag von ${abteilungName(a.von)}:\n${a.titel}\n\n${a.inhalt}${a.tiefe >= MAX_TIEFE - 1 ? "\n\nHinweis: Kette ist lang – nicht weitergeben, abschließen oder an Emin." : ""}`,
  })
  const e = parse(text)
  if (!e) {
    await q(`UPDATE firma_auftraege SET versuche = versuche + 1 WHERE id = $1`, [a.id])
    return
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

  if (e.entscheidung === "emin") {
    const vorlage = `${e.frage ? `Frage: ${e.frage}\n\n` : ""}Vorbereitet von ${abteilungName(a.an)}:\n${ergebnis}`
    // Die Frage lebt nur noch als Auftrag "Wartet auf dich" in der Zusammenarbeit – nie als Aufgabe im Eingang.
    if (a.freigabeId) {
      await ergaenzeExtra(a.freigabeId, { koordination: { abteilung: a.an, ergebnis: vorlage, auftragId: a.id } })
      await setzeFreigabe(a.freigabeId, "freigegeben")
    }
    await q(`UPDATE firma_auftraege SET status = 'bei_emin', ergebnis = $2, erledigt_at = now() WHERE id = $1`, [a.id, vorlage])
    return
  }

  // Intern erledigt: zugehörige interne Freigabe schließen, Ergebnis bleibt nachlesbar.
  if (a.freigabeId) {
    await ergaenzeExtra(a.freigabeId, { koordination: { abteilung: a.an, ergebnis, auftragId: a.id, automatisch: true } })
    await setzeFreigabe(a.freigabeId, "freigegeben")
  }
  await q(`UPDATE firma_auftraege SET status = 'erledigt', ergebnis = $2, erledigt_at = now() WHERE id = $1`, [a.id, ergebnis])
}

/** Arbeitet die interne Warteschlange ab. Läuft bei jedem Takt (Cron + Seitenaufruf). */
export async function arbeiteWarteschlangeAb(): Promise<{ eingesammelt: number; bearbeitet: number }> {
  const q = await db()
  if (!q) return { eingesammelt: 0, bearbeitet: 0 }
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

  const { text } = await generateText({
    model: MODELL,
    system: `Du bist der Chief of Staff (CEO-Assistent) der KI-Firma creaDIG Solutions. Du koordinierst 15 Abteilungen so, dass die Firma ohne Emin intern weiterarbeitet.
${REGELN}

Abteilungen:
${abteilungsListe()}

Antworte NUR mit JSON: {"auftraege":[{"an":"abteilungs-id","titel":"…","inhalt":"was genau, warum jetzt, welches Ergebnis erwartet wird"}],"lage":"1 Satz Gesamtlage"}
Höchstens 3 Aufträge, nur wenn sie echten Fortschritt bringen und nicht schon in der Liste stehen. Lieber 0 als Beschäftigungstherapie.`,
    prompt: `Heute ${tag}. Ergebnisse der KI-Mitarbeiter:\n${lage || "(noch keine)"}\n\nLetzte interne Aufträge:\n${zuletzt || "(keine)"}`,
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

export { abteilungName }
