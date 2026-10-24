import "server-only"

import { generateText } from "ai"

import { json, MODELL } from "@/lib/agenten/ki"

import { ohneGedaechtnis } from "./kontext"
import { entscheidungenNachholen, legeAbgeleiteteAb, legeLektionAn, lernDb, type LektionArt } from "./store"

/**
 * Aus Entscheidungen Regeln machen (täglich, mit der Qualitätssicherung).
 *
 * Je Agent mit neuen Entscheidungen: freigegebene, verworfene (mit Grund) und
 * umgeschriebene (Entwurf → Endfassung) nebeneinander legen und das Muster
 * als höchstens sechs kurze Regeln festhalten. Die abgeleiteten Regeln des
 * Agenten werden dabei neu geschrieben; Emins eigene bleiben unberührt, von
 * ihm gestrichene kommen nicht zurück (lib/lernen/store.ts).
 */

const FENSTER_TAGE = 60
const MAX_REGELN = 6

type Zeile = {
  freigabe_id: string
  entscheidung: "freigegeben" | "verworfen" | "bearbeitet"
  grund: string | null
  grund_text: string | null
  titel: string
  entwurf: string
  endfassung: string | null
  empfaenger: string | null
}

const kurz = (s: string | null, n: number) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, n)

function fall(z: Zeile): string {
  const kopf = `[${z.freigabe_id}] ${z.entscheidung.toUpperCase()}: ${kurz(z.titel, 120)}${z.empfaenger ? ` → ${z.empfaenger}` : ""}`
  const grund = [z.grund, z.grund_text].filter(Boolean).join(" – ")
  if (z.entscheidung === "bearbeitet" && z.endfassung)
    return `${kopf}\n  Entwurf: ${kurz(z.entwurf, 500)}\n  Emins Fassung: ${kurz(z.endfassung, 500)}`
  return `${kopf}${grund ? `\n  Grund: ${grund}` : ""}\n  Text: ${kurz(z.entwurf, 280)}`
}

async function destilliereAgent(agent: string, zeilen: Zeile[]): Promise<number> {
  const ids = new Set(zeilen.map((z) => z.freigabe_id))
  const mitGrund = new Set(zeilen.filter((z) => z.grund_text || z.grund).map((z) => z.freigabe_id))
  const { text } = await ohneGedaechtnis(() =>
    generateText({
      model: MODELL,
      prompt: `Du bist das Firmengedächtnis von creaDIG. Unten stehen Emins letzte Entscheidungen über die Entwürfe des KI-Agenten „${agent}“ (freigegeben, verworfen, vor der Freigabe umgeschrieben).

Leite daraus höchstens ${MAX_REGELN} Regeln ab, die der Agent ab jetzt befolgen muss, damit Emin dieselbe Absage oder Korrektur nicht noch einmal machen muss.
- Nur Muster, die mindestens zwei Fälle belegen – oder ein Fall mit ausdrücklichem Grund.
- Konkret und prüfbar („Keine Kreishandwerkerschaften oder Verbände anschreiben – Emin verwirft sie“), nicht allgemein („bessere Mails schreiben“).
- Aus Umschreibungen: was Emin am Ton, an der Länge, an Anrede oder Inhalt ändert.
- Was er freigibt, zeigt, was richtig ist – auch das darf eine Regel sein.
- Grund „Recht & Compliance“ heißt: der Rechts-Check hat den Entwurf gestoppt (z. B. Werbemail ohne Einwilligung, UWG § 7). Daraus wird eine Regel, wie der Agent das vermeidet – nicht, dass er den Check umgeht.
- Keine Fakten, Zahlen oder Kunden erfinden. Deutsch, je Regel ein Satz.

Antworte NUR mit JSON: [{"regel": "...", "art": "verbot" | "gebot" | "stil", "belege": ["frg-…", "…"]}]. Keine Regel sicher ableitbar: [].

Fälle:
${zeilen.map(fall).join("\n\n")}`,
    }),
  )
  const roh = json<{ regel?: string; art?: string; belege?: string[] }[]>(text) ?? []
  const regeln = roh
    .map((r) => ({
      regel: kurz(r.regel ?? "", 300),
      art: (["verbot", "gebot", "stil"].includes(r.art ?? "") ? r.art : "gebot") as LektionArt,
      belege: (r.belege ?? []).filter((b) => ids.has(b)),
    }))
    .filter((r) => r.regel.length >= 12 && (r.belege.length >= 2 || r.belege.some((b) => mitGrund.has(b))))
    .slice(0, MAX_REGELN)
  /* Nur ersetzen, wenn wirklich etwas Neues da ist – ein leerer Lauf löscht keine guten Regeln. */
  if (!regeln.length) return 0
  await legeAbgeleiteteAb(agent)
  for (const r of regeln) {
    const korrektur = r.belege.some((b) => zeilen.find((z) => z.freigabe_id === b)?.entscheidung === "bearbeitet")
    await legeLektionAn({ geltung: agent, regel: r.regel, art: r.art, quelle: korrektur ? "korrektur" : "abgeleitet", belege: r.belege })
  }
  return regeln.length
}

export async function lernRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const q = await lernDb()
  if (!q) return { ergebnis: "Gedächtnis: keine Datenbank", anzahl: 0 }
  const nachgeholt = await entscheidungenNachholen().catch((e) => {
    console.error("[lernen] nachholen", e instanceof Error ? e.message : e)
    return 0
  })
  /* Nur Agenten mit neuen Entscheidungen seit dem letzten Destillat und genug Lernstoff. */
  const agenten = (await q(
    `SELECT e.agent FROM lern_entscheidungen e LEFT JOIN lern_destillat d ON d.agent = e.agent
      WHERE e.zeit > now() - make_interval(days => $1) AND e.agent IS NOT NULL
      GROUP BY e.agent, d.zuletzt
     HAVING max(e.zeit) > coalesce(d.zuletzt, 'epoch')
        AND (count(*) FILTER (WHERE e.entscheidung <> 'freigegeben') >= 2 OR count(*) FILTER (WHERE e.grund_text IS NOT NULL) >= 1)`,
    [FENSTER_TAGE],
  )) as { agent: string }[]
  let regeln = 0
  const fertig: string[] = []
  for (const { agent } of agenten.slice(0, 8)) {
    const zeilen = (await q(
      `SELECT freigabe_id, entscheidung, grund, grund_text, titel, entwurf, endfassung, empfaenger FROM lern_entscheidungen
        WHERE agent = $1 AND zeit > now() - make_interval(days => $2)
        ORDER BY (entscheidung <> 'freigegeben') DESC, zeit DESC LIMIT 30`,
      [agent, FENSTER_TAGE],
    )) as Zeile[]
    try {
      const n = await destilliereAgent(agent, zeilen)
      regeln += n
      if (n) fertig.push(`${agent} ${n}`)
      await q(`INSERT INTO lern_destillat (agent, zuletzt) VALUES ($1, now()) ON CONFLICT (agent) DO UPDATE SET zuletzt = now()`, [agent])
    } catch (e) {
      console.error("[lernen] destillieren", agent, e instanceof Error ? e.message : e)
    }
  }
  const teile = [nachgeholt ? `${nachgeholt} Entscheidung(en) nachgetragen` : null, fertig.length ? `Regeln: ${fertig.join(", ")}` : null].filter(Boolean)
  return { ergebnis: teile.length ? `Gedächtnis: ${teile.join(" · ")}` : "Gedächtnis: nichts Neues", anzahl: regeln }
}
