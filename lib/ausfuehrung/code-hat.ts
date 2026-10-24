import "server-only"

import { assistentDb, ergaenzeExtra, type FreigabeExtra } from "@/lib/assistent/store"

/**
 * KOD HATTI — vom Code-Backlog zum fertigen Pull Request (Katman 4, 24.10.2026).
 *
 * Vorher schrieb die Entwicklung nur Vorschläge; Emin musste jeden Auftrag
 * selbst in Claude Code kopieren. Jetzt:
 *
 *   Karte im Code-Backlog → dieser Takt startet den GitHub-Workflow
 *   `.github/workflows/ki-backlog.yml` (workflow_dispatch) → Claude Code
 *   ändert nur Dateien → der Workflow prüft (tsc, lint, build), legt den Zweig
 *   `ki/<karte>` an und öffnet den PR gegen feat/system-haus-site →
 *   Emin prüft die Vorschau und merged. Mehr nicht.
 *
 * Bremsen: höchstens EIN offener Bot-PR gleichzeitig, höchstens DREI Starts je
 * 7 Tage, je Karte genau ein Versuch (fehlgeschlagen = sichtbar, kein Neustart
 * von selbst). Ohne GITHUB_TOKEN passiert nichts – die Karte bleibt wie bisher
 * zum Kopieren stehen.
 */

const REPO = () => process.env.GITHUB_REPO?.trim() || "meaicreadig/creadig"
const BASIS = "feat/system-haus-site"
const WORKFLOW = "ki-backlog.yml"
const MAX_OFFEN = 1
const MAX_WOCHE = 3
/** Ohne PR nach so vielen Stunden gilt der Lauf als gescheitert (Workflow-Limit 45 Min). */
const LAUF_STUNDEN = 3

export type PrStand = NonNullable<FreigabeExtra["pr"]>

export const codeHatBereit = () => Boolean(process.env.GITHUB_TOKEN?.trim())

async function gh(pfad: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`https://api.github.com/repos/${REPO()}${pfad}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN?.trim()}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  })
}

/** Der eigentliche Auftrag: der Teil nach der Claude-Code-Marke, sonst die ganze Karte. */
function auftragAus(titel: string, inhalt: string): string {
  const teil = inhalt.split(/—\s*Auftrag für Claude Code\s*—/i)[1]?.trim()
  return `${titel}\n\n${teil || inhalt}`.slice(0, 6000)
}

const zweig = (karte: string) => `ki/${karte.replace(/[^a-zA-Z0-9-]/g, "-")}`

type Karte = { id: string; titel: string; inhalt: string; pr: PrStand | null }

async function ladeKarten(): Promise<Karte[]> {
  const q = await assistentDb()
  if (!q) return []
  return (await q(
    `SELECT id, titel, inhalt, extra->'pr' AS pr FROM assistent_freigaben
      WHERE art = 'aufgabe' AND coalesce(extra->>'code', '') = 'true'
        AND (created_at > now() - interval '14 days' OR extra->'pr'->>'status' IN ('laeuft','offen'))
      ORDER BY created_at ASC`,
    [],
  )) as Karte[]
}

/** Einen Auftrag an den Workflow geben. Prüft die Bremsen; `grund` sagt, warum nicht. */
export async function starteCodeAuftrag(karteId: string, vonHand = false): Promise<{ ok: boolean; grund?: string }> {
  if (!codeHatBereit()) return { ok: false, grund: "GITHUB_TOKEN fehlt in Vercel" }
  const karten = await ladeKarten()
  const k = karten.find((x) => x.id === karteId)
  if (!k) return { ok: false, grund: "Karte nicht im Code-Backlog" }
  if (k.pr && !(vonHand && k.pr.status === "fehlgeschlagen")) return { ok: false, grund: `schon ${k.pr.status}` }
  const laufend = karten.filter((x) => x.pr?.status === "laeuft" || x.pr?.status === "offen").length
  if (laufend >= MAX_OFFEN) return { ok: false, grund: "Ein Bot-PR ist noch offen – erst mergen oder schließen" }
  const woche = karten.filter((x) => x.pr?.gestartet && Date.now() - Date.parse(x.pr.gestartet) < 7 * 864e5).length
  if (woche >= MAX_WOCHE && !vonHand) return { ok: false, grund: `${MAX_WOCHE} Starts in 7 Tagen erreicht` }

  const r = await gh(`/actions/workflows/${WORKFLOW}/dispatches`, {
    method: "POST",
    body: JSON.stringify({ ref: BASIS, inputs: { karte: k.id, auftrag: auftragAus(k.titel, k.inhalt) } }),
  }).catch((e: unknown) => ({ ok: false, status: 0, text: async () => String(e) }) as Response)
  if (!r.ok) {
    const grund = `GitHub ${r.status}: ${(await r.text()).slice(0, 160)}`
    console.error("[code-hat] start", k.id, grund)
    return { ok: false, grund }
  }
  await ergaenzeExtra(k.id, { pr: { status: "laeuft", gestartet: new Date().toISOString(), zweig: zweig(k.id) } })
  return { ok: true }
}

/** PR-Stand nachziehen: Link eintragen, gemerged/geschlossen erkennen, hängende Läufe als gescheitert markieren. */
async function standNachziehen(karten: Karte[]): Promise<{ gemerged: number }> {
  const owner = REPO().split("/")[0]
  let gemerged = 0
  for (const k of karten.filter((x) => x.pr?.status === "laeuft" || x.pr?.status === "offen")) {
    const pr = k.pr!
    const r = await gh(`/pulls?state=all&head=${encodeURIComponent(`${owner}:${pr.zweig ?? zweig(k.id)}`)}`).catch(() => null)
    if (!r?.ok) continue
    const [p] = (await r.json()) as { html_url: string; number: number; state: string; merged_at: string | null }[]
    if (!p) {
      if (pr.status === "laeuft" && Date.now() - Date.parse(pr.gestartet) > LAUF_STUNDEN * 36e5) {
        await ergaenzeExtra(k.id, { pr: { ...pr, status: "fehlgeschlagen", grund: "Kein PR – Lauf unter GitHub → Actions → KI-Backlog ansehen" } })
      }
      continue
    }
    const status: PrStand["status"] = p.merged_at ? "gemerged" : p.state === "closed" ? "geschlossen" : "offen"
    if (status !== pr.status || pr.url !== p.html_url) {
      await ergaenzeExtra(k.id, { pr: { ...pr, status, url: p.html_url, nummer: p.number } })
      if (status === "gemerged") gemerged++
    }
  }
  return { gemerged }
}

/** Täglicher Takt (läuft mit der Entwicklung): Stand nachziehen, dann höchstens einen neuen Auftrag starten. */
export async function codeHatTakt(): Promise<string | null> {
  if (!codeHatBereit()) return null
  const karten = await ladeKarten()
  const { gemerged } = await standNachziehen(karten)
  const frisch = await ladeKarten()
  const naechste = frisch.find((x) => !x.pr)
  const start = naechste ? await starteCodeAuftrag(naechste.id) : null
  const teile = [gemerged ? `${gemerged} Bot-PR gemerged` : null, start?.ok ? `PR-Auftrag gestartet: ${naechste!.titel.slice(0, 60)}` : null].filter(Boolean)
  return teile.length ? teile.join(" · ") : null
}
