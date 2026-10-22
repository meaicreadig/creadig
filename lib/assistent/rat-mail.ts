import "server-only"

import { sendeMail, siteUrl } from "@/lib/termine/mail"
import { FIRMA, kampagnenHtml } from "@/lib/mailing/vorlage"
import { abteilungName } from "@/lib/koordination/koordinator"
import type { RatProtokoll } from "./store"

const zeile = (s: string) => s.replace(/\s+/g, " ").trim()

/** Nach jeder Sitzung der Geschäftsleitung (regulär oder außerordentlich) bekommt Emin das komplette Protokoll per Mail. */
export async function sendeRatMail(p: RatProtokoll, o: { kw: string; ausserordentlich: boolean; auftraege: number }): Promise<boolean> {
  const to = process.env.LEAD_TO?.trim()
  if (!to) return false
  const basis = siteUrl()
  const art = o.ausserordentlich ? "Außerordentliche Sitzung" : "Wochensitzung"

  const deine = p.beschluesse.filter((b) => b.wer === "emin")
  const truppe = p.beschluesse.filter((b) => b.wer !== "emin")
  const beschluss = (b: RatProtokoll["beschluesse"][number]) =>
    `- **${zeile(b.was)}** — ${zeile(b.warum)}${b.kostenEur ? ` (${b.kostenEur} €)` : " (kostenlos)"}${b.wer !== "emin" && b.abteilung ? ` · ${abteilungName(b.abteilung)}` : ""}`

  const bloecke = [
    zeile(p.lage),
    "## Beschlüsse für dich",
    deine.length ? deine.map(beschluss).join("\n") : "Heute nichts – die Truppe übernimmt.",
    "## Beschlüsse für die Truppe",
    truppe.length
      ? `${truppe.map(beschluss).join("\n")}\n\n${o.auftraege} ${o.auftraege === 1 ? "Auftrag ist" : "Aufträge sind"} schon an die Abteilungen verteilt und werden im Hintergrund bearbeitet.`
      : "Keine.",
    "## Was besprochen wurde",
    p.stimmen.map((s) => `- **${s.rolle}:** ${zeile(s.sagt)}`).join("\n"),
  ]
  if (p.verworfen.length) bloecke.push("## Bewusst verworfen", p.verworfen.map((v) => `- ${zeile(v)}`).join("\n"))
  bloecke.push("## Rückfrage an dich", `> ${zeile(p.frage)}`, "Antworte direkt auf der Assistenten-Seite – deine Antwort fließt in die nächste Sitzung ein.")

  const subject = `${art} KW ${o.kw} · ${p.beschluesse.length} Beschlüsse`
  const html = kampagnenHtml(
    {
      subject,
      preheader: zeile(p.lage).slice(0, 140),
      headline: `${art} der Geschäftsleitung · **KW ${o.kw}**`,
      body: bloecke.join("\n\n"),
      ctaText: "Rückfrage beantworten",
      ctaUrl: `${basis}/admin/assistent`,
    },
    {
      siteUrl: basis,
      kennung: `Geschäftsleitung · KW ${o.kw}`,
      ctaHinweis: "CEO, CFO, Vertrieb und Marketing haben getagt.",
      gruss: "Für die Geschäftsleitung",
      absender: "Dein Assistent",
      rolle: `${FIRMA} · Zentrale`,
    },
  )
  const text = [
    `${art} KW ${o.kw}`,
    zeile(p.lage),
    "",
    "Beschlüsse:",
    ...p.beschluesse.map((b) => `- ${b.wer === "emin" ? "[Du] " : "[Truppe] "}${zeile(b.was)} – ${zeile(b.warum)}`),
    "",
    ...p.stimmen.map((s) => `${s.rolle}: ${zeile(s.sagt)}`),
    "",
    `Rückfrage: ${zeile(p.frage)}`,
    `${basis}/admin/assistent`,
  ].join("\n")
  const r = await sendeMail({ to, subject, html, text, fromName: "creaDIG Geschäftsleitung" })
  return r.ok
}
