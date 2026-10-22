import "server-only"

import { raiseAlert } from "@/lib/alert"
import { assistentDb } from "@/lib/assistent/store"
import { legeAuftragAn } from "@/lib/koordination/koordinator"
import { tabelleFehlt } from "@/lib/neon-abfrage"

import { isoWoche, istVerdaechtig } from "./regeln"

export { istVerdaechtig } from "./regeln"

/**
 * Abteilung IT — Sicherheit.
 * Prüft täglich ohne KI, was sonst lautlos kaputtgeht:
 *   · Schlüssel, ohne die Crons, Selbsttest, Webhook oder Anmeldung offen oder
 *     wirkungslos sind (nur die NAMEN werden genannt, nie Werte),
 *   · Eingangsmails der letzten 7 Tage, die das Modell umsteuern wollen
 *     (Prompt-Injection) — der Eingang füttert die KI, er ist die größte Angriffsfläche.
 * Fehlversuche bei der Anmeldung werden nicht gespeichert, also nicht geprüft.
 * Befunde gehen als Auftrag an die IT, kritische zusätzlich als Alarm.
 */

const PFLICHT: { name: string[]; kritisch: boolean; wofuer: string }[] = [
  { name: ["CRON_SECRET"], kritisch: true, wofuer: "ohne ihn sind die Cron-Routen über einen gefälschten User-Agent aufrufbar" },
  { name: ["SELFTEST_SECRET"], kritisch: false, wofuer: "ohne ihn antwortet der tägliche Selbsttest mit 503" },
  { name: ["RESEND_WEBHOOK_SECRET"], kritisch: false, wofuer: "ohne ihn nimmt der Mail-Eingang keine Webhooks an" },
  { name: ["ADMIN_SESSION_SECRET"], kritisch: true, wofuer: "ohne ihn sind Admin-Sitzungen nicht sicher signiert" },
  { name: ["MAIL_FROM", "LEAD_FROM"], kritisch: false, wofuer: "ohne Absender gehen keine Mails hinaus" },
  { name: ["LEAD_TO"], kritisch: false, wofuer: "ohne Empfänger erreicht dich kein Alarm per Mail" },
]

export function fehlendeSchluessel(env: Record<string, string | undefined> = process.env): { name: string; kritisch: boolean; wofuer: string }[] {
  return PFLICHT.filter((p) => !p.name.some((n) => env[n]?.trim())).map((p) => ({ name: p.name.join(" oder "), kritisch: p.kritisch, wofuer: p.wofuer }))
}

export async function sicherheitsRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const befunde: string[] = []
  let kritisch = false

  for (const f of fehlendeSchluessel()) {
    befunde.push(`Schlüssel fehlt: ${f.name} – ${f.wofuer}`)
    if (f.kritisch) kritisch = true
  }

  let verdaechtig = 0
  const q = await assistentDb()
  if (q) {
    try {
      const mails = (await q(
        `SELECT id, von, betreff, text FROM mail_eingang WHERE created_at > now() - interval '7 days' ORDER BY created_at DESC LIMIT 200`,
        [],
      )) as { id: string; von: string; betreff: string | null; text: string }[]
      for (const m of mails) {
        const grund = istVerdaechtig(`${m.betreff ?? ""}\n${m.text}`)
        if (!grund) continue
        verdaechtig++
        kritisch = true
        befunde.push(`Verdächtige Eingangsmail von ${m.von || "unbekannt"} (${m.id}): ${grund}`)
      }
    } catch (e) {
      if (!tabelleFehlt(e, "mail_eingang")) throw e
    }
  }

  if (befunde.length) {
    await legeAuftragAn({
      von: "it",
      an: "it",
      titel: `Sicherheit: ${befunde.length} Befund(e)`,
      inhalt: `${befunde.map((b) => `- ${b}`).join("\n")}\n\nBitte beheben bzw. bewerten. Schlüsselwerte nie in Aufträge oder Mails schreiben – nur in Vercel setzen.`,
      quelle: `sicherheit:${isoWoche(new Date())}:${befunde.length}`,
    })
    if (kritisch) await raiseAlert("sicherheit", befunde.join(" | ").slice(0, 900))
  }

  return {
    ergebnis: befunde.length
      ? `${befunde.length} Befund(e)${verdaechtig ? ` · ${verdaechtig} verdächtige Mail(s)` : ""}${kritisch ? " · Alarm ausgelöst" : ""}`
      : "Keine Befunde – Schlüssel vollständig, Eingang unauffällig",
    anzahl: befunde.length,
  }
}
