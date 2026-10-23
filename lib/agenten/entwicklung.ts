import "server-only"

import { generateText } from "ai"

import { legeFreigabeAn } from "@/lib/assistent/store"
import { ladeAusgabe } from "@/lib/bulletin/store"
import { firmenText } from "@/lib/firmenwahrheit"
import { legeAuftragAn } from "@/lib/koordination/koordinator"

import { berlinTag, json, MODELL, recherchiere, slug } from "./ki"

/**
 * ENTWICKLUNG — Tech-Radar und F&E, Hand in Hand mit Bulletin und Redaktion.
 *
 * 23.10.2026: Die Abteilung bestand nur aus dem F&E-Stundenzettel. Jetzt liest
 * sie jeden Morgen das Bulletin (dieselben Meldungen, nicht noch eine Suche)
 * und montags zusätzlich die Releases unseres Stacks. Für jede Meldung, die
 * uns technisch betrifft, entscheidet sie: einsetzen, beobachten, ignorieren.
 *
 * - einsetzen → fertiger Entwicklungsauftrag bei Emin (Code ändert nur er,
 *   deshalb mit einem Prompt, den er direkt an Claude Code geben kann)
 * - technisch unsicher → als F&E-Vorhaben markiert (Forschungszulage)
 * - lehrreich für Kunden → Themenauftrag an Marketing/Redaktion
 */

const STACK =
  "Next.js (App Router) auf Vercel, Vercel AI SDK mit AI Gateway (OpenAI, Perplexity, FLUX), Neon Postgres, Vercel Blob, Resend, LinkedIn-API; Produkte fibero, stammo (Wallet-Pässe), meAI, CASSAMEA."

type Bewertung = {
  titel: string
  entscheidung: "einsetzen" | "beobachten" | "ignorieren"
  warum: string
  massnahme?: string
  prompt?: string
  fe?: boolean
  unsicherheit?: string
  artikel?: string
}

export async function entwicklungsRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const tag = berlinTag()
  const ausgabe = await ladeAusgabe().catch(() => null)
  const meldungen = (ausgabe?.meldungen ?? [])
    .filter((m) => m.gewicht >= 2)
    .slice(0, 8)
    .map((m) => `- ${m.titel.de} (${m.quelle}, ${m.url}): ${m.kurz.de}`)
    .join("\n")
  const montag = new Date().getDay() === 1
  const releases = montag
    ? await recherchiere(`Neue Versionen, Sicherheitslücken und Abkündigungen der letzten 7 Tage für: ${STACK}`).catch(() => null)
    : null
  if (!meldungen && !releases) return { ergebnis: "Kein Bulletin und keine Releases – nichts zu bewerten", anzahl: 0 }

  const { text } = await generateText({
    model: MODELL,
    prompt: `Du leitest die Entwicklung bei creaDIG.
${firmenText("kurz")}
Unser Stack: ${STACK}

Bulletin heute:
${meldungen || "—"}
${releases ? `\nStack-Releases (Recherche):\n${releases}` : ""}

Bewerte höchstens 4 Punkte, die uns technisch wirklich betreffen (Rest weglassen):
- entscheidung: einsetzen (lohnt jetzt, Sicherheitslücken in unserem Stack immer), beobachten, ignorieren
- bei einsetzen: "massnahme" (1–2 Sätze) und "prompt": ein fertiger Auftrag an einen Coding-Agenten (Deutsch, 3–6 Sätze: Ziel, betroffene Stellen, wie prüfen)
- "fe": true, wenn es echte technische Unsicherheit hat (Forschung, nicht Routine), dann "unsicherheit" in 1 Satz
- "artikel": ein Thema für einen Praxis-Artikel/LinkedIn-Beitrag für Inhaber kleiner Betriebe, falls es sie betrifft, sonst leer
Antworte NUR mit JSON: [{"titel":"","entscheidung":"einsetzen","warum":"","massnahme":"","prompt":"","fe":false,"unsicherheit":"","artikel":""}]`,
  })
  const liste = (json<Bewertung[]>(text) ?? []).filter((b) => b?.titel && b.entscheidung)

  let auftraege = 0
  let themen = 0
  for (const b of liste.slice(0, 4)) {
    const s = slug(b.titel)
    if (b.entscheidung === "einsetzen" && b.prompt) {
      const id = await legeFreigabeAn({
        art: "aufgabe",
        titel: `Entwicklung · ${b.titel}`,
        inhalt: `${b.warum}\n\nMaßnahme: ${b.massnahme ?? "—"}${b.fe ? `\n\nF&E-Vorhaben (Forschungszulage): ${b.unsicherheit ?? "technische Unsicherheit"} – Stunden unter /admin/forschung erfassen.` : ""}\n\n— Auftrag für Claude Code —\n${b.prompt}`,
        quelle: `entwicklung:${s}`,
        agent: "entwicklung",
        extra: { warum: b.warum },
      })
      if (id) auftraege++
    }
    if (b.artikel) {
      const id = await legeAuftragAn({
        von: "entwicklung",
        an: "marketing",
        titel: `Thema aus der Entwicklung · ${b.artikel}`,
        inhalt: `Die Entwicklung schlägt ein Praxis-Thema vor (Anlass: ${b.titel}).\n${b.warum}\n\nBitte als Artikel oder LinkedIn-Beitrag einplanen (Redaktion) – sachlich, ohne erfundene Zahlen.`,
        quelle: `entwicklung-thema:${s}`,
      })
      if (id) themen++
    }
  }
  const beob = liste.filter((b) => b.entscheidung === "beobachten").length
  return {
    ergebnis: `${liste.length} Meldungen bewertet (${tag}): ${auftraege} Entwicklungsaufträge an Emin, ${themen} Themen an die Redaktion, ${beob} beobachtet`,
    anzahl: auftraege + themen,
  }
}
