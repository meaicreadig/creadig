import "server-only"

import { generateText } from "ai"

import { ergaenzeExtra, ladeFreigabe, type KapitalStufe } from "./store"
import { firmenText } from "@/lib/firmenwahrheit"

export const STUFE_TEXT: Record<KapitalStufe, { titel: string; tun: string }> = {
  pruefen: { titel: "Bedingungen prüfen", tun: "Quelle öffnen, Zulässigkeit und Frist bestätigen." },
  schreiben: { titel: "Antrag schreiben", tun: "Skizze unten als Grundlage nehmen, Unterlagen sammeln." },
  eingereicht: { titel: "Eingereicht", tun: "Auf Rückmeldung warten – Eingangsbestätigung aufheben." },
  bewilligt: { titel: "Bewilligt", tun: "Geld einplanen – in der Finanz-App als geplante Einnahme erfassen." },
  abgelehnt: { titel: "Abgelehnt", tun: "Begründung notieren, nächste Chance kommt vom Kapital-Agenten." },
}

/** Nach der Freigabe: KI schreibt eine Antragsskizze, damit „Freigeben“ ein echtes Ergebnis hat. */
export async function schreibeAntragsskizze(id: string): Promise<void> {
  const f = await ladeFreigabe(id)
  if (!f || f.art !== "kapital" || f.extra.antrag?.skizze) return
  const { text } = await generateText({
    model: "openai/gpt-5.4-mini",
    prompt: `Du bereitest für creaDIG Solutions einen Förderantrag vor.
${firmenText("voll")}
Programm:
${f.titel}
${f.inhalt}

Schreibe auf Deutsch, ohne Markdown-Überschriften, kurz und konkret:
1) Passt es? 2 Sätze, inkl. was vor dem Antrag zu prüfen ist.
2) Projektidee für den Antrag in 3 Sätzen (Ziel, Maßnahme, Ergebnis).
3) Unterlagen-Checkliste (5–7 Punkte, je eine Zeile mit "- ").
4) Nächster Schritt heute in einem Satz.
Keine erfundenen Beträge oder Fristen – nur was oben steht.`,
  })
  const seit = f.extra.antrag?.seit ?? new Date().toISOString()
  await ergaenzeExtra(id, { antrag: { stufe: f.extra.antrag?.stufe ?? "pruefen", seit, skizze: text.trim().slice(0, 3000) } })
}
