import "server-only"

import { legeFreigabeAn, quelleBekannt } from "@/lib/assistent/store"
import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * BEWERTUNG NACH ABNAHME — 24.10.2026 (Automatik 2 von 4).
 *
 * Jeder Kunde wird nach der Abnahme gefragt – jeder, nicht nur die
 * zufriedenen (Review-Gating verstößt gegen Googles Regeln), und ohne
 * Gegenleistung (LG Hildesheim 11 O 12/21: Gutschein für Bewertung unzulässig).
 *
 * Bewusst KEINE automatische Mail: Eine Bewertungsbitte per E-Mail ist Werbung
 * und braucht eine Einwilligung, auch beim Bestandskunden (BGH VI ZR 225/17).
 * Darum entsteht eine Karte für Emin: im Übergabegespräch persönlich fragen,
 * und erst wenn der Kunde „ja“ sagt, den fertigen Text mit Link schicken.
 *
 * Der Link kommt aus GOOGLE_BEWERTUNG_URL (Google Business Profile → „Mehr
 * Rezensionen erhalten“). Fehlt er, sagt die Karte das.
 */

const WARTE_TAGE = 2

export async function bewertungsRunde(q: Abfrage): Promise<number> {
  const link = process.env.GOOGLE_BEWERTUNG_URL?.trim() || null
  const fertig = (await q(
    `SELECT p.id, p.state, og.name AS firma, c.name AS kontakt, c.phone AS telefon
       FROM projects p
       JOIN opportunities o ON o.id = p.opportunity_id
       JOIN organisations og ON og.id = o.organisation_id
       LEFT JOIN contacts c ON c.id = o.contact_id
      WHERE p.state IN ('abgenommen','uebergeben')
        AND p.updated_at < now() - make_interval(days => $1)
        AND p.updated_at > now() - interval '90 days'
      ORDER BY p.updated_at LIMIT 5`,
    [WARTE_TAGE],
  ).catch(() => [])) as { id: string; state: string; firma: string; kontakt: string | null; telefon: string | null }[]

  let n = 0
  for (const p of fertig) {
    const quelle = `bewertung:${p.id}`
    if (await quelleBekannt(quelle)) continue
    const anrede = p.kontakt ? `Hallo ${p.kontakt.split(" ")[0]}` : "Guten Tag"
    const text = [
      `${anrede},`,
      "",
      "danke für die gute Zusammenarbeit. Wenn Sie zwei Minuten haben: Eine ehrliche Bewertung – was gut war und was wir besser machen können – hilft anderen Betrieben bei der Entscheidung und uns beim Besserwerden.",
      link ?? "[Google-Bewertungslink fehlt – GOOGLE_BEWERTUNG_URL eintragen]",
      "",
      "Herzliche Grüße",
      "Muhammed Emin Akyol",
    ].join("\n")
    const id = await legeFreigabeAn({
      art: "aufgabe",
      titel: `Bewertung erbitten: ${p.firma}`.slice(0, 160),
      inhalt: [
        `Das Projekt ist ${p.state === "uebergeben" ? "übergeben" : "abgenommen"}. So geht es rechtssicher:`,
        "1. Im Gespräch oder Anruf fragen: „Dürfen wir Ihnen einen Link für eine kurze Bewertung schicken?“",
        `2. Nur wenn ja: diesen Text per WhatsApp oder Mail schicken${p.telefon ? ` (Tel. ${p.telefon})` : ""}.`,
        "3. Keine Gegenleistung anbieten, jeden Kunden fragen – nicht nur die zufriedenen.",
        "",
        "— Text —",
        text,
      ].join("\n"),
      quelle,
      agent: "kundenbetreuung",
      extra: { fuerEmin: true, warum: "Bewertungen sind für 72 % der Handwerksbetriebe ein Weg zu Aufträgen (Bitkom 2025) – für uns der stärkste Beleg." },
    }).catch(() => null)
    if (id) n++
  }
  return n
}
