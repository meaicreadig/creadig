import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * Wo steht Emin gerade? (24.10.2026, Team-Fenster)
 *
 * Das Fenster schickt mit jeder Nachricht die Admin-Adresse mit. Steht dort eine
 * Firma, Chance, Person oder Anfrage, bekommt Aylin sie als Kontext – „erinnere
 * mich Montag hieran“ oder „mach ein Angebot“ braucht dann keinen Firmennamen.
 * Nur Admin-Pfade, nur lesen.
 */

const SEITEN: [RegExp, string][] = [
  [/^\/admin\/?$/, "Übersicht (Zentrale)"],
  [/^\/admin\/assistent/, "Assistent (Zur Entscheidung, KI-Team)"],
  [/^\/admin\/kunden\/?$/, "Kundenliste"],
  [/^\/admin\/vertrieb\/pipeline\/?$/, "Vertriebs-Pipeline (alle Chancen)"],
  [/^\/admin\/vertrieb/, "Vertrieb"],
  [/^\/admin\/marketing/, "Marketing / Mail-Studio"],
  [/^\/admin\/gespraech/, "Gesprächsraum"],
  [/^\/admin\/leistung/, "Leistung des KI-Teams"],
  [/^\/finanz/, "Finanzen"],
]

export async function seitenKontext(q: Abfrage | null, pfad: string | null | undefined): Promise<string | null> {
  if (!pfad || !/^\/(admin|finanz)(\/|$)/.test(pfad)) return null
  const p = pfad.split(/[?#]/)[0].slice(0, 200)
  const id = (re: RegExp) => decodeURIComponent(p.match(re)?.[1] ?? "") || null
  try {
    const org = id(/^\/admin\/kunden\/([^/]+)/)
    const opp = id(/^\/admin\/vertrieb\/pipeline\/([^/]+)/)
    const kontakt = id(/^\/admin\/vertrieb\/beziehungen\/([^/]+)/)
    if (q && org) {
      const [g] = (await q(`SELECT id, name, city FROM organisations WHERE id = $1`, [org])) as { id: string; name: string; city: string | null }[]
      const chancen = (await q(`SELECT title, status, next_action FROM opportunities WHERE organisation_id = $1 AND status NOT IN ('won','lost') LIMIT 3`, [org])) as { title: string; status: string; next_action: string | null }[]
      if (g)
        return `Firma „${g.name}“${g.city ? ` (${g.city})` : ""}, id ${g.id}.${chancen.length ? ` Offene Chancen: ${chancen.map((c) => `${c.title} [${c.status}] → ${c.next_action ?? "kein nächster Schritt"}`).join("; ")}.` : " Keine offene Chance."}`
    }
    if (q && opp) {
      const [o] = (await q(
        `SELECT o.id, o.title, o.status, o.next_action, o.next_action_at::date::text AS bis, g.name FROM opportunities o LEFT JOIN organisations g ON g.id = o.organisation_id WHERE o.id = $1`,
        [opp],
      )) as { id: string; title: string; status: string; next_action: string | null; bis: string | null; name: string | null }[]
      if (o) return `Chance „${o.title}“ von ${o.name ?? "?"} [${o.status}], id ${o.id}. Nächster Schritt: ${o.next_action ?? "keiner"}${o.bis ? ` (bis ${o.bis})` : ""}.`
    }
    if (q && kontakt) {
      const [c] = (await q(
        `SELECT c.name, c.role, g.name AS firma FROM contacts c LEFT JOIN organisations g ON g.id = c.organisation_id WHERE c.id = $1`,
        [kontakt],
      )) as { name: string; role: string | null; firma: string | null }[]
      if (c) return `Person ${c.name}${c.role ? ` (${c.role})` : ""}${c.firma ? ` bei ${c.firma}` : ""}.`
    }
    if (/^\/admin\/vertrieb\/anfragen\/[^/]+/.test(p)) return "Eine einzelne Anfrage im Vertrieb (Details auf der Seite)."
  } catch (e) {
    console.error("[seitenkontext]", e instanceof Error ? e.message : e)
  }
  return SEITEN.find(([re]) => re.test(p))?.[1] ?? null
}
