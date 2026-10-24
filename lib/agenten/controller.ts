import "server-only"

import { assistentDb, legeFreigabeAn, quelleBekannt } from "@/lib/assistent/store"
import { ladeKarne, type AgentKarne, type Kette } from "@/lib/ergebnis/karne"
import { legeAuftragAn } from "@/lib/koordination/koordinator"

import { kw } from "./ki"

/**
 * ERGEBNIS-CONTROLLER — misst jeden KI-Mitarbeiter am Ergebnis, nicht an Läufen.
 *
 * 24.10.2026, Katman 3 (Owner): „Büyük şirkette karne sonuçla ölçer.“ Die
 * Kette je Agent und Abteilung steht in lib/ergebnis/karne.ts:
 * Kontakt → Antwort → Anfrage → Termin → Angebot → Gewonnen (€).
 *
 * Jede Woche:
 * 1. Wirkungsbericht an die Geschäftsführung (intern, kein Klick für Emin).
 * 2. „Schärfen“-Aufträge an die Abteilungen der Agenten, die Kontakte, aber
 *    keine Ergebnisse haben – und an die Chancen-Radare nach 90 Tagen.
 * 3. Wer sein Fenster (30 Tage, Radare 90) ohne jedes Ergebnis hinter sich
 *    hat, landet auf EINER Steuerungs-Karte bei Emin: pausieren bzw.
 *    zusammenlegen, angehakt per Klick. Der Controller selbst schaltet nie ab.
 *    Bisher wurde niemand abgeschaltet, nur neu gestartet.
 */

const zeile = (k: Kette) =>
  `${k.kontakte} Kontakte → ${k.antworten} Antworten · ${k.leads} Anfragen → ${k.termine} Termine → ${k.angebote} Angebote → ${k.gewonnen} gewonnen (${k.eur.toLocaleString("de-DE")} €)`

export async function controllerRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const karne = await ladeKarne(30)
  if (!karne) return { ergebnis: "Keine Datenbank", anzahl: 0 }
  const woche = kw()
  const { firma, abteilungen, agenten } = karne
  const gruppe = (u: AgentKarne["urteil"]) => agenten.filter((a) => a.urteil === u)
  const wirkt = gruppe("wirkt")
  const schaerfen = gruppe("schaerfen")
  const vorschlag = gruppe("vorschlag")
  const wartet = gruppe("wartet")
  const anlauf = gruppe("anlauf")
  const agentZeile = (a: AgentKarne) =>
    `- ${a.name}: ${a.klasse === "stab" ? `${a.paesse} Pässe` : zeile(a.kette)} — ${a.grund}${a.uebernimmt ? ` (übernimmt: ${a.uebernimmt})` : ""}`

  const bericht = [
    `FIRMA 30 TAGE: ${zeile(firma)} · bezahlt ${firma.bezahltEur.toLocaleString("de-DE")} €`,
    "",
    "ABTEILUNGEN (Beitrag):",
    ...(abteilungen.length ? abteilungen.map((a) => `- ${a.name}: ${zeile(a.kette)}`) : ["- noch keine Ergebnisse"]),
    "",
    `WIRKT (${wirkt.length}):`,
    ...(wirkt.length ? wirkt.map(agentZeile) : ["- niemand"]),
    `SCHÄRFEN (${schaerfen.length}):`,
    ...(schaerfen.length ? schaerfen.map(agentZeile) : ["- niemand"]),
    `WARTET AUF EMIN (${wartet.length}):`,
    ...(wartet.length ? wartet.map(agentZeile) : ["- niemand"]),
    `VORSCHLAG PAUSIEREN/ZUSAMMENLEGEN (${vorschlag.length}) – liegt als Steuerungs-Karte bei Emin:`,
    ...(vorschlag.length ? vorschlag.map(agentZeile) : ["- niemand"]),
    `IM ANLAUF (${anlauf.length}): ${anlauf.map((a) => a.name).join(", ") || "–"}`,
  ].join("\n")

  await legeAuftragAn({
    von: "controller",
    an: "geschaeftsfuehrung",
    titel: `Ergebnis-Karne KW ${woche}: ${firma.gewonnen} gewonnen, ${wirkt.length} wirken, ${vorschlag.length} ohne Ergebnis`,
    inhalt: `${bericht}\n\nBitte: Für jeden Agenten unter SCHÄRFEN einen konkreten Verbesserungsauftrag (Zielgruppe, Angebot, Text) an seine Abteilung. Pausieren entscheidet Emin über die Steuerungs-Karte.`,
    quelle: `controller:${woche}`,
  })

  /* Schärfen geht direkt an die zuständige Abteilung – intern, ohne Emin. */
  let auftraege = 0
  for (const a of schaerfen) {
    if (!a.abteilung) continue
    const id = await legeAuftragAn({
      von: "controller",
      an: a.abteilung,
      titel: `Schärfen: ${a.name} – ${a.grund.slice(0, 80)}`,
      inhalt: `Ergebnis-Karne (${a.fenster} Tage): ${zeile(a.kette)}.\n${a.grund}\n\nBitte bis nächste Woche: Zielgruppe, Angebot und Text so ändern, dass aus Kontakten Antworten und Termine werden. Keine Kaltmails, nichts nach außen ohne Emins Freigabe.`,
      quelle: `schaerfen:${a.agent}:${woche}`,
    }).catch(() => null)
    if (id) auftraege++
  }

  /* Eine Steuerungs-Karte pro Woche, nur wenn es etwas zu entscheiden gibt. */
  let karte = 0
  const quelle = `steuerung:${woche}`
  if (vorschlag.length && !(await quelleBekannt(quelle))) {
    const q = await assistentDb()
    /* Eine noch offene Karte der Vorwoche wird ersetzt, nicht gestapelt. */
    await q?.(`UPDATE assistent_freigaben SET status = 'verworfen' WHERE art = 'steuerung' AND status = 'offen'`, []).catch(() => null)
    const id = await legeFreigabeAn({
      art: "steuerung",
      titel: `${vorschlag.length} KI-Mitarbeiter ohne Ergebnis – pausieren?`,
      inhalt: `Diese Agenten haben ihr ganzes Prüffenster ohne ein einziges Ergebnis (Antwort, Anfrage, Termin, Angebot, Auftrag) hinter sich. Pausieren spart Rechenzeit und Lärm; es ist umkehrbar. Chancen-Radare (Golf, Kapital, International) stehen hier nie – sie werden nur geschärft.\n\nFirma 30 Tage: ${zeile(firma)}`,
      quelle,
      agent: "controller",
      extra: {
        warum: `Ergebnis-Karne KW ${woche}`,
        steuerung: vorschlag.map((a) => ({ agent: a.agent, name: a.name, grund: a.grund, uebernimmt: a.uebernimmt })),
      },
    })
    if (id) karte = 1
  }

  /* Kosten gegen Einnahmen: einmal pro Woche als Chat-Meldung von Paul (Finanzen). */
  let kostenText = ""
  const kq = await assistentDb()
  if (kq) {
    const { kostenBild, kostenZeile } = await import("@/lib/ergebnis/kosten")
    const k = await kostenBild(kq, 30).catch(() => null)
    if (k && !(await quelleBekannt(`kosten:${woche}`))) {
      kostenText = kostenZeile(k)
      const { speichereNachricht } = await import("@/lib/assistent/store")
      await speichereNachricht("assistant", `Wochenblick Kosten gegen Einnahmen (KW ${woche}):`, [
        { agent: "finanz", was: kostenText, stand: "erledigt" },
        ...(k.modelle.length ? [{ agent: "controller", was: `Größte KI-Posten: ${k.modelle.map((m) => `${m.model} ${m.eur.toLocaleString("de-DE")} €`).join(", ")}`, stand: "erledigt" as const }] : []),
      ]).catch(() => null)
      await legeAuftragAn({ von: "controller", an: "geschaeftsfuehrung", titel: `Kosten KW ${woche}`, inhalt: kostenText, quelle: `kosten:${woche}` }).catch(() => null)
    }
  }

  return {
    ergebnis: `${kostenText ? `${kostenText} · ` : ""}Firma 30 T.: ${firma.leads} Anfragen, ${firma.termine} Termine, ${firma.gewonnen} gewonnen (${firma.eur.toLocaleString("de-DE")} €) · ${wirkt.length} wirken, ${schaerfen.length} schärfen, ${vorschlag.length} Pausen-Vorschläge, ${anlauf.length} im Anlauf`,
    anzahl: 1 + auftraege + karte,
  }
}
