import "server-only"

import { generateText } from "ai"

import { assistentDb, legeFreigabeAn, quelleBekannt, speichereNachricht } from "@/lib/assistent/store"
import { ladeKarne } from "@/lib/ergebnis/karne"
import { legeAuftragAn } from "@/lib/koordination/koordinator"
import { ladeLetztePruefung } from "@/lib/webseite/pruefer"
import { abteilungVonAgent } from "@/lib/zentrale/abteilungen"
import type { Uebernahme } from "@/lib/zentrale/personen"

import { berlinTag, json, MODELL } from "./ki"

/**
 * IDEENWERKSTATT (Kaan) — 24.10.2026.
 *
 * Emin: „Fikir üretici bir çalışman da yok – tek tek ben söylemek zorunda
 * kalıyorum.“ Bisher kam jede Verbesserung erst, wenn Emin einen Fehler
 * meldete. Kaan liest täglich, was schiefläuft – Emins eigene Klagen im Chat,
 * die Ergebnis-Karne, offene Website-Befunde, liegengebliebene Chancen – und
 * macht daraus höchstens drei konkrete Verbesserungen. Jede bekommt sofort
 * einen Zuständigen:
 *
 *   intern  → Auftrag an die Abteilung (ohne Emin)
 *   braucht Emin (Geld, Außenwirkung, Richtung) → eine Karte bei Emin
 *
 * Im Chat erscheint eine Nachricht mit den Übernahme-Kästen – Emin sieht, wer
 * was macht, ohne fragen zu müssen.
 */

type Idee = { titel: string; warum: string; schritt: string; agent: string; brauchtEmin: boolean }

export async function ideenRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const tag = berlinTag()
  if (await quelleBekannt(`ideen:${tag}`)) return { ergebnis: "Heute schon Ideen geliefert", anzahl: 0 }
  const q = await assistentDb()
  if (!q) return { ergebnis: "Keine Datenbank", anzahl: 0 }

  /* Jonas holt nach, was gestern nicht recherchiert werden konnte – Ergebnis direkt im Chat. */
  const { recherchiereOffene } = await import("@/lib/assistent/chance")
  const nachgeholt = await recherchiereOffene(q).catch(() => [])
  if (nachgeholt.length) await speichereNachricht("assistant", "Recherche nachgeholt:", nachgeholt)

  const [klagen, karne, pruefung, liegen] = await Promise.all([
    q(
      `SELECT text FROM assistent_nachrichten WHERE rolle = 'user' AND created_at > now() - interval '7 days' ORDER BY created_at DESC LIMIT 25`,
      [],
    ).catch(() => []) as Promise<{ text: string }[]>,
    ladeKarne(30).catch(() => null),
    ladeLetztePruefung().catch(() => null),
    q(
      `SELECT o.title, g.name, o.next_action, o.next_action_at FROM opportunities o JOIN organisations g ON g.id = o.organisation_id
        WHERE o.status NOT IN ('won','lost') AND (o.next_action_at < now() OR o.next_action_at IS NULL) ORDER BY o.updated_at LIMIT 10`,
      [],
    ).catch(() => []) as Promise<{ title: string; name: string; next_action: string | null }[]>,
  ])

  const lage = [
    "EMINS NACHRICHTEN DER LETZTEN 7 TAGE (Klagen = wichtigste Quelle):",
    ...klagen.map((k) => `- ${k.text.slice(0, 400)}`),
    "",
    "ERGEBNIS-KARNE (Agenten ohne Wirkung):",
    ...(karne?.agenten.filter((a) => a.urteil !== "wirkt" && a.urteil !== "schutz").map((a) => `- ${a.agent} (${a.name}): ${a.urteil} – ${a.grund}`) ?? []),
    "",
    "OFFENE WEBSITE-BEFUNDE:",
    ...(pruefung?.befunde.filter((b) => b.schwere !== "hinweis").slice(0, 10).map((b) => `- [${b.schwere}] ${b.titel}`) ?? []),
    "",
    "CHANCEN OHNE NÄCHSTEN SCHRITT / ÜBERFÄLLIG:",
    ...liegen.map((l) => `- ${l.name}: ${l.title} → ${l.next_action ?? "kein nächster Schritt"}`),
  ].join("\n")

  const { text } = await generateText({
    model: MODELL,
    prompt: `Du bist Kaan, die Ideenwerkstatt von creaDIG (KI). Emin ist der einzige Mensch; er will nicht jeden Fehler selbst melden müssen.
Finde aus der Lage höchstens 3 Verbesserungen, die das System, die Admin-Oberfläche oder den Umsatz SPÜRBAR voranbringen. Bevorzugt das, worüber Emin sich beklagt hat und was noch nicht gelöst ist.
Regeln: konkret und umsetzbar (kein „sollte man prüfen“), nichts erfinden, keine Kaltakquise, kein Angebot vor einem Gespräch, nur legal.
Zuständiger "agent" aus: vertrieb, kundenservice, kundenbetreuung, angebot, finanz, projekte, webseite, entwicklung, recht, redaktion, marketing, partner, kapital, international, produkt, koordinator.
brauchtEmin = true nur bei Geld, Außenwirkung oder Richtungsentscheidung.

${lage}

Antworte nur mit JSON: [{"titel": string, "warum": string, "schritt": string, "agent": string, "brauchtEmin": boolean}]`,
  })
  const ideen = (json<Idee[]>(text) ?? []).filter((i) => i?.titel && i.schritt).slice(0, 3)
  if (!ideen.length) return { ergebnis: "Keine belastbare Idee heute", anzahl: 0 }

  const kaesten: Uebernahme[] = []
  for (const i of ideen) {
    const abt = abteilungVonAgent(i.agent)
    const inhalt = `${i.warum}\n\nNächster Schritt: ${i.schritt}`
    if (i.brauchtEmin) {
      await legeFreigabeAn({
        art: "aufgabe",
        titel: `Idee: ${i.titel}`.slice(0, 160),
        inhalt,
        quelle: `idee:${tag}:${i.titel.slice(0, 40)}`,
        agent: "ideen",
        extra: { fuerEmin: true, warum: i.warum },
      }).catch(() => null)
      kaesten.push({ agent: i.agent, was: `${i.titel} – braucht deine Entscheidung (Karte liegt bereit)`, stand: "wartet", bis: "deine Freigabe" })
    } else {
      await legeAuftragAn({ von: "ideen", an: abt?.id ?? "geschaeftsfuehrung", titel: `Idee: ${i.titel}`.slice(0, 160), inhalt, quelle: `idee:${tag}:${i.titel.slice(0, 40)}` }).catch(() => null)
      kaesten.push({ agent: i.agent, was: `${i.titel} – ${i.schritt}`, stand: "laeuft", bis: "diese Woche" })
    }
  }

  await speichereNachricht("assistant", `Kaan (Ideenwerkstatt) hat heute ${ideen.length} Verbesserung${ideen.length > 1 ? "en" : ""} gefunden und verteilt:`, [
    { agent: "ideen", was: ideen.map((i) => i.titel).join(" · "), stand: "erledigt" },
    ...kaesten,
  ])
  await legeAuftragAn({ von: "ideen", an: "geschaeftsfuehrung", titel: `Ideen ${tag}`, inhalt: ideen.map((i) => `- ${i.titel}: ${i.schritt}`).join("\n"), quelle: `ideen:${tag}` }).catch(() => null)
  return { ergebnis: `${ideen.length} Ideen verteilt`, anzahl: ideen.length }
}
