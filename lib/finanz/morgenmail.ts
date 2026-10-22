import "server-only"

import type { Abfrage } from "@/lib/neon-abfrage"
import { heuteBerlin, naechsteMahnstufe, tageZwischen } from "@/lib/finanz/auftraege/rechnen"
import { ladeDokumente } from "@/lib/finanz/auftraege/store"
import { berechneLage } from "@/lib/finanz/lage"
import { ladeBelege } from "@/lib/finanz/belege"
import { ladeOffeneBankUmsaetze } from "@/lib/finanz/bank-abgleich"
import { protokolliere } from "@/lib/finanz/store"
import { ladeFinanzKurzlage, PAUSCHALEN_ERINNERUNG_AB_TAG } from "@/lib/finanz/kurzlage"
import { sendeMail, siteUrl } from "@/lib/termine/mail"
import { FIRMA, kampagnenHtml } from "@/lib/mailing/vorlage"
import { morgenBriefing, type BriefingSchritt } from "@/lib/admin/morgen-briefing"
import { zaehleOffen } from "@/lib/assistent/store"

/**
 * Besitzer-Morgenmail (Phase 7) — fasst zusammen, was heute Aufmerksamkeit
 * braucht. Verschickt NIE selbst eine Mahnung oder Buchung — jeder
 * Mahnungsversand bleibt ein Klick in /finanz/vorgang/[id] (nachfassen()),
 * jede Belegzuordnung und jeder Bank-Abgleich ebenso. Diese Mail ist ein
 * Hinweis, keine Handlung. Höchstens eine pro Tag (siehe sendeMorgenmailFallsFaellig()).
 */

export type MorgenBericht = {
  heute: string
  faelligeMahnungen: { id: string; nummer: string; kunde: string; stufe: number; tageUeberfaellig: number }[]
  fristen: { titel: string; faellig: string; tageBis: number }[]
  paragraph19Hinweis: string | null
  belegeImKorb: number
  bankUmsaetzeOffen: number
  /** Ab dem 25. des Monats, solange weder Verpflegungs- noch Homeoffice-Pauschale für den laufenden Monat erfasst ist. */
  pauschalenFehlen: boolean
  /** Kompass()-Hinweise mit schwere="neutral" — Wachstum/Kapital, keine Störung, aber auch nicht nur bei Problemen interessant. */
  wachstumsHinweise: string[]
}

export async function erstelleMorgenBericht(db: Abfrage): Promise<MorgenBericht> {
  const heute = heuteBerlin()
  const [lage, rechnungen, belege, bankUmsaetze, kurzlage] = await Promise.all([
    berechneLage(db),
    ladeDokumente(db, ["rechnung"]),
    ladeBelege(db, null),
    ladeOffeneBankUmsaetze(db),
    ladeFinanzKurzlage(db, heute),
  ])

  const faelligeMahnungen = rechnungen
    .filter((d) => (d.status === "versendet" || d.status === "teilbezahlt") && d.faelligAm)
    .map((d) => {
      const tage = tageZwischen(d.faelligAm as string, heute)
      const stufe = naechsteMahnstufe(tage, d.mahnstufe)
      return stufe ? { id: d.id, nummer: d.nummer ?? "", kunde: d.kunde.firma || d.kunde.name, stufe: Number(stufe), tageUeberfaellig: tage } : null
    })
    .filter((x): x is { id: string; nummer: string; kunde: string; stufe: number; tageUeberfaellig: number } => x !== null)

  const fristen = lage.fristen
    .filter((f) => !f.erledigt && tageZwischen(heute, f.faellig) <= 14)
    .map((f) => ({ titel: f.titel, faellig: f.faellig, tageBis: tageZwischen(heute, f.faellig) }))

  const paragraph19Hinweis = lage.hinweise.find((h) => h.text.includes("§ 19"))?.text ?? null
  const wachstumsHinweise = lage.hinweise.filter((h) => h.schwere === "neutral").map((h) => h.text)

  return { heute, faelligeMahnungen, fristen, paragraph19Hinweis, belegeImKorb: belege.korbAnzahl, bankUmsaetzeOffen: bankUmsaetze.length, pauschalenFehlen: Number(heute.slice(8, 10)) >= PAUSCHALEN_ERINNERUNG_AB_TAG && !kurzlage.pauschaleErfasst, wachstumsHinweise }
}

/** "Ruhig" meint: nichts Dringendes — Wachstumshinweise zählen bewusst nicht mit, die sind gerade an ruhigen Tagen am nützlichsten. */
function istDringend(b: MorgenBericht): boolean {
  return b.faelligeMahnungen.length > 0 || b.fristen.length > 0 || Boolean(b.paragraph19Hinweis) || b.belegeImKorb > 0 || b.bankUmsaetzeOffen > 0 || b.pauschalenFehlen
}

const STUFEN_TEXT = ["", "Zahlungserinnerung", "1. Mahnung", "2. Mahnung"]

const datumLang = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", weekday: "long", day: "numeric", month: "long" })
const datumKurz = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", day: "numeric", month: "long" })
const zeile = (s: string) => s.replace(/\s+/g, " ").trim()

type AssistentTeil = { lage: string | null; schritte: BriefingSchritt[]; impuls: string | null; offen: number; team: string[]; teamWoche: boolean }

/**
 * Karne des KI-Teams aus der Qualitätssicherung (lib/agenten/qualitaet.ts): täglich die letzten
 * 24 Stunden, montags die ganze Woche. Dynamisch geladen – truppe → finanz/agent → morgenmail wäre ein Kreis.
 */
async function ladeTeamKarne(woche: boolean): Promise<string[]> {
  const [{ ladeNoten }, { AGENTEN }] = await Promise.all([import("@/lib/agenten/qualitaet"), import("@/lib/assistent/truppe")])
  const name = (k: string) => AGENTEN.find((a) => a.key === k)?.name ?? k
  const noten = (await ladeNoten(woche ? 7 : 1)).filter((n) => n.entwuerfe + n.laeufe + n.fehler > 0)
  const zeilen = noten.slice(0, woche ? 12 : 6).map((n) => {
    const teile = [
      n.freigegeben + n.verworfen > 0 ? `${n.freigegeben}/${n.freigegeben + n.verworfen} freigegeben (${Math.round((n.quote ?? 0) * 100)} %)` : `${n.entwuerfe} Entwürfe`,
      n.bearbeitet ? `${n.bearbeitet} von dir geändert` : null,
      `${n.laeufe} Läufe`,
      n.fehler ? `**${n.fehler} Fehler**` : null,
    ].filter(Boolean)
    const icon = n.fehler || (n.quote !== null && n.quote < 0.4) ? "shield" : "zap"
    return `- [${icon}] ${name(n.agent)}: ${teile.join(" · ")}`
  })
  return [...(await trendZeilen().catch(() => [])), ...zeilen]
}

/** Verlauf 14 Tage als Textkurve (lib/trend.ts) — eine Mail zeigt keine Grafik, aber eine Richtung. */
async function trendZeilen(): Promise<string[]> {
  const { ladeTrend, sparkline } = await import("@/lib/trend")
  const tr = await ladeTrend(14)
  if (!tr.some((d) => d.laeufe > 0)) return []
  const heute = tr.at(-1)!
  const vor7 = tr.at(-8)
  const pz = (v: number | null) => (v === null ? "–" : `${Math.round(v * 100)} %`)
  const fehler = tr.reduce((s, d) => s + d.fehler, 0)
  const web = [...tr].reverse().find((d) => d.webNote !== null)?.webNote ?? null
  return [
    `- [layers] Läufe 14 Tage: ${sparkline(tr.map((d) => d.laeufe))} · gestern ${tr.at(-2)?.laeufe ?? 0} · ${fehler ? `**${fehler} Fehler**` : "keine Fehler"}`,
    `- [zap] Freigabequote 7 Tage: ${pz(heute.quote7)}${vor7 && vor7.quote7 !== null ? ` (Vorwoche ${pz(vor7.quote7)})` : ""} ${sparkline(tr.map((d) => d.quote7), [0, 1])}`,
    ...(web !== null ? [`- [sparkles] Website-Note: ${web}/100 ${sparkline(tr.map((d) => d.webNote), [0, 100])}`] : []),
  ]
}

async function ladeAssistentTeil(heute: string): Promise<AssistentTeil> {
  const teamWoche = new Date(`${heute}T12:00:00Z`).getUTCDay() === 1
  const [briefing, offen, team] = await Promise.all([
    morgenBriefing("de").catch(() => null),
    zaehleOffen().catch(() => ({ gesamt: 0, linkedin: 0 })),
    ladeTeamKarne(teamWoche).catch((e) => {
      console.error("[morgenmail] Team-Karne:", e instanceof Error ? e.message : e)
      return []
    }),
  ])
  return { lage: briefing?.lage ?? null, schritte: briefing?.schritte ?? [], impuls: briefing?.impuls ?? null, offen: offen.gesamt, team, teamWoche }
}

/** Morgenbriefing des Assistenten im creaDIG-Markendesign — Finanz ist nur ein Abschnitt davon. */
function berichtMail(b: MorgenBericht, a: AssistentTeil): { subject: string; text: string; html: string } {
  const basis = siteUrl()
  const bloecke: string[] = []
  const dringend = istDringend(b)

  bloecke.push(a.lage ? zeile(a.lage) : "Hier ist dein Überblick für heute — was wichtig ist, steht oben.")

  if (a.schritte.length) {
    bloecke.push("## Deine **3 Schritte** heute")
    bloecke.push(a.schritte.slice(0, 3).map((s, i) => `- [${["zap", "user", "calendar"][i]}] ${zeile(s.titel)}: ${zeile(s.warum)}`).join("\n"))
  }

  if (a.offen > 0) {
    bloecke.push(`> **${a.offen}** ${a.offen === 1 ? "Vorschlag wartet" : "Vorschläge warten"} auf deine Freigabe.`)
  }

  bloecke.push("## Finanzen")
  const finanz: string[] = []
  for (const m of b.faelligeMahnungen) {
    finanz.push(`- [shield] ${STUFEN_TEXT[m.stufe]} fällig: ${m.nummer} · ${zeile(m.kunde)} · ${m.tageUeberfaellig} Tage überfällig`)
  }
  for (const f of b.fristen) {
    const wann = f.tageBis >= 0 ? `fällig am ${datumKurz(f.faellig)}, in ${f.tageBis} Tagen` : `seit ${datumKurz(f.faellig)} fällig, **${-f.tageBis} Tage überfällig**`
    finanz.push(`- [clock] ${zeile(f.titel)}: ${wann}`)
  }
  if (b.paragraph19Hinweis) finanz.push(`- [shield] § 19 Kleinunternehmer: ${zeile(b.paragraph19Hinweis)}`)
  if (b.belegeImKorb > 0) finanz.push(`- [layers] Belege im Eingangskorb: ${b.belegeImKorb} ${b.belegeImKorb === 1 ? "Beleg wartet" : "Belege warten"} auf ein Geschäftsfeld`)
  if (b.bankUmsaetzeOffen > 0) finanz.push(`- [layers] Bank-Import: ${b.bankUmsaetzeOffen} ${b.bankUmsaetzeOffen === 1 ? "Umsatz wartet" : "Umsätze warten"} auf Zuordnung`)
  if (b.pauschalenFehlen) finanz.push(`- [clock] Pauschalen: Für ${datumKurz(b.heute).split(" ").slice(-1)[0]} sind noch keine Verpflegungs- oder Homeoffice-Tage erfasst — unter ${basis}/finanz/pauschalen eintragen.`)
  for (const w of b.wachstumsHinweise) finanz.push(`- [sparkles] Wachstum & Kapital: ${zeile(w)}`)
  bloecke.push(finanz.length ? finanz.join("\n") : "Bei den Finanzen ist heute nichts offen — keine Frist, keine Mahnung, kein offener Beleg.")

  if (a.team.length) {
    bloecke.push(a.teamWoche ? "## KI-Team · **Wochenkarne**" : "## KI-Team · letzte 24 Stunden")
    bloecke.push(a.team.join("\n"))
  }

  if (a.impuls) bloecke.push(`## Impuls\n\n${zeile(a.impuls)}`)

  bloecke.push("Ich habe nichts selbst verschickt oder gebucht. Jede Handlung bleibt ein Klick von dir.")

  const datum = datumLang(b.heute)
  const subject = a.offen > 0 || dringend ? `Dein Morgen · ${datumKurz(b.heute)} — ${a.schritte.length || "ein paar"} Schritte für heute` : `Dein Morgen · ${datumKurz(b.heute)} — alles ruhig`
  const body = bloecke.join("\n\n")
  const inhalt = {
    subject,
    preheader: a.schritte[0] ? zeile(a.schritte[0].titel) : "Dein Überblick für heute.",
    headline: `Guten Morgen, Emin. Hier ist **dein Tag.**`,
    body,
    ctaText: "Zum Assistenten",
    ctaUrl: `${basis}/admin/assistent`,
  }
  const html = kampagnenHtml(inhalt, {
    siteUrl: basis,
    kennung: `Morgenbriefing · ${datum}`,
    ctaHinweis: a.offen > 0 ? "Gib die wartenden Vorschläge frei — der Rest läuft von allein." : "Schau kurz rein und leg los.",
    zweitLink: { text: "Finanzen öffnen", url: `${basis}/finanz` },
    gruss: "Einen starken Tag",
    absender: "Dein Assistent",
    rolle: `${FIRMA} · Zentrale`,
  })
  const text = [
    `Guten Morgen, Emin. Hier ist dein Tag (${datum}).`,
    body.replace(/^## /gm, "").replace(/^- \[[a-z]+\]\s*/gm, "• ").replace(/^> /gm, "").replace(/\*\*/g, ""),
    `Zum Assistenten: ${basis}/admin/assistent\nFinanzen: ${basis}/finanz`,
    `Dein Assistent · ${FIRMA}`,
  ].join("\n\n")
  return { subject, text, html }
}

/** Höchstens eine Morgenmail pro Tag — ein zweiter Cron-Lauf oder ein manueller Trigger am selben Tag verschickt nichts erneut. */
export async function sendeMorgenmailFallsFaellig(db: Abfrage): Promise<{ versendet: boolean; grund?: string }> {
  const heute = heuteBerlin()
  const [schon] = await db(`SELECT 1 FROM fin_protokoll WHERE aktion = 'morgenmail_gesendet' AND daten->>'datum' = $1 LIMIT 1`, [heute])
  if (schon) return { versendet: false, grund: "heute bereits verschickt" }

  const to = process.env.LEAD_TO?.trim()
  if (!to) return { versendet: false, grund: "LEAD_TO fehlt — keine Empfängeradresse eingerichtet" }

  const [bericht, assistent] = await Promise.all([erstelleMorgenBericht(db), ladeAssistentTeil(heute)])
  const mail = berichtMail(bericht, assistent)
  const versand = await sendeMail({ to, subject: mail.subject, text: mail.text, html: mail.html, fromName: "creaDIG Assistent" })
  if (!versand.ok) return { versendet: false, grund: versand.grund === "nicht_eingerichtet" ? "RESEND_API_KEY/MAIL_FROM fehlt" : versand.detail }

  await protokolliere(db, "morgenmail_gesendet", { datum: heute, mahnungen: bericht.faelligeMahnungen.length, fristen: bericht.fristen.length, belegeImKorb: bericht.belegeImKorb, bankUmsaetzeOffen: bericht.bankUmsaetzeOffen, wachstumsHinweise: bericht.wachstumsHinweise.length })
  return { versendet: true }
}
