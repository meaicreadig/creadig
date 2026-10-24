import "server-only"

import { assistentDb } from "@/lib/assistent/store"
import { legeAuftragAn } from "@/lib/koordination/koordinator"
import { abteilungVonAgent } from "@/lib/zentrale/abteilungen"

import { kw } from "./ki"

/**
 * ERGEBNIS-CONTROLLER — misst jeden KI-Mitarbeiter an Wirkung, nicht an Läufen.
 *
 * 24.10.2026 neu. Die Karne zählte bis hierher, ob ein Agent lief und wie viel
 * er erzeugte. 28 Agenten liefen, und trotzdem kamen in 30 Tagen 0 Anfragen und
 * 1 Kunde ins System. Jetzt zählt pro Agent (30 Tage):
 * - Außenwirkung: von Emin freigegebene Mails, Briefe, Beiträge
 * - Verwurf-Quote: wie viel Emin verworfen hat
 * - Pässe: Aufträge, die andere Abteilungen aus seiner Arbeit erledigt haben
 * Dazu der Trichter der Firma: neue Firmen → Chancen → gewonnen (€).
 *
 * Wächter (Recht, Sicherheit, Lage, Qualität, Puls) wirken durch Verhindern und
 * werden nicht nach Außenwirkung bewertet. Wer sonst 30 Tage ohne Wirkung läuft,
 * steht mit Vorschlag (vereinfachen, zusammenlegen, abschalten) im Wochenbericht
 * an die Geschäftsführung. Abschalten entscheidet Emin – der Controller nie.
 */

const WAECHTER = new Set(["recht", "sicherheit", "lage", "qualitaet", "puls", "koordination", "koordinator", "personal", "controller", "webseite", "forschung", "einkauf"])
const NAMEN: Record<string, string> = { koordination: "Koordination", puls: "Puls" }

type Zeile = { agent: string; laeufe: number; fehler: number; menge: number; aussen: number; verworfen: number; vorlagen: number; paesse: number }

export async function controllerRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const q = await assistentDb()
  if (!q) return { ergebnis: "Keine Datenbank", anzahl: 0 }

  const zeilen = (await q(
    `WITH l AS (
       SELECT agent, count(*)::int AS laeufe, count(fehler)::int AS fehler, coalesce(sum(anzahl), 0)::int AS menge
         FROM assistent_laeufe WHERE created_at > now() - interval '30 days' GROUP BY agent),
     f AS (
       SELECT agent,
              count(*) FILTER (WHERE status = 'freigegeben' AND art IN ('mail','brief','linkedin','termin','kapital'))::int AS aussen,
              count(*) FILTER (WHERE status = 'verworfen')::int AS verworfen,
              count(*) FILTER (WHERE art IN ('mail','brief','linkedin','termin','kapital'))::int AS vorlagen
         FROM assistent_freigaben WHERE created_at > now() - interval '30 days' AND agent IS NOT NULL GROUP BY agent)
     SELECT l.agent, l.laeufe, l.fehler, l.menge,
            coalesce(f.aussen, 0) AS aussen, coalesce(f.verworfen, 0) AS verworfen, coalesce(f.vorlagen, 0) AS vorlagen, 0 AS paesse
       FROM l LEFT JOIN f ON f.agent = l.agent`,
    [],
  )) as Zeile[]

  /* Pässe: erledigte Aufträge, die von der Abteilung des Agenten ausgingen. */
  const paesse = (await q(
    `SELECT von, count(*)::int AS n FROM firma_auftraege
      WHERE created_at > now() - interval '30 days' AND status IN ('erledigt','bei_emin') GROUP BY von`,
    [],
  ).catch(() => [])) as { von: string; n: number }[]
  const passVon = new Map(paesse.map((p) => [p.von, p.n]))
  for (const z of zeilen) {
    const abt = abteilungVonAgent(z.agent)?.id
    z.paesse = (passVon.get(z.agent) ?? 0) + (abt && abt !== z.agent ? (passVon.get(abt) ?? 0) : 0)
  }

  const [t] = (await q(
    `SELECT (SELECT count(*) FROM organisations WHERE created_at > now() - interval '30 days')::int AS firmen,
            (SELECT count(*) FROM opportunities WHERE created_at > now() - interval '30 days')::int AS chancen,
            (SELECT count(*) FROM opportunities WHERE status = 'won' AND updated_at > now() - interval '30 days')::int AS gewonnen,
            (SELECT coalesce(sum(estimated_value), 0) FROM opportunities WHERE status = 'won' AND updated_at > now() - interval '30 days')::int AS gewonnen_eur,
            (SELECT count(*) FROM organisations WHERE lifecycle = 'kunde')::int AS kunden`,
    [],
  )) as { firmen: number; chancen: number; gewonnen: number; gewonnen_eur: number; kunden: number }[]

  const name = (a: string) => NAMEN[a] ?? a
  const bewertet = zeilen.filter((z) => !WAECHTER.has(z.agent))
  const wirkt = bewertet.filter((z) => z.aussen > 0).sort((a, b) => b.aussen - a.aussen)
  const intern = bewertet.filter((z) => z.aussen === 0 && z.paesse > 0)
  const ohne = bewertet.filter((z) => z.aussen === 0 && z.paesse === 0 && z.laeufe >= 3)
  const hoheVerwurf = bewertet.filter((z) => z.vorlagen >= 4 && z.verworfen / z.vorlagen >= 0.5)

  const zeile = (z: Zeile) =>
    `- ${name(z.agent)}: ${z.laeufe} Läufe, ${z.aussen} freigegeben nach außen, ${z.verworfen} verworfen, ${z.paesse} Pässe${z.fehler ? `, ${z.fehler} Fehler` : ""}`
  const bericht = [
    `Trichter 30 Tage: ${t.firmen} neue Firmen → ${t.chancen} neue Chancen → ${t.gewonnen} gewonnen (${t.gewonnen_eur.toLocaleString("de-DE")} €). Bestandskunden im System: ${t.kunden}.`,
    "",
    `WIRKT NACH AUSSEN (${wirkt.length}):`,
    ...(wirkt.length ? wirkt.map(zeile) : ["- niemand"]),
    "",
    `LIEFERT NUR INTERN (${intern.length}):`,
    ...(intern.length ? intern.map(zeile) : ["- niemand"]),
    "",
    `OHNE WIRKUNG (${ohne.length}) – Vorschlag: Auftrag schärfen, mit anderem zusammenlegen oder abschalten:`,
    ...(ohne.length ? ohne.map(zeile) : ["- niemand"]),
    ...(hoheVerwurf.length ? ["", "EMIN VERWIRFT MEHR ALS DIE HÄLFTE – Vorlagen verbessern:", ...hoheVerwurf.map(zeile)] : []),
  ].join("\n")

  await legeAuftragAn({
    von: "controller",
    an: "geschaeftsfuehrung",
    titel: `Wirkungsbericht KW ${kw()}: ${wirkt.length} wirken, ${ohne.length} ohne Wirkung`,
    inhalt: `${bericht}\n\nBitte: Für jeden Agenten ohne Wirkung eine Entscheidung (Auftrag schärfen / zusammenlegen / Abschalten vorschlagen) und für hohe Verwurf-Quoten einen konkreten Verbesserungsauftrag an die Abteilung. Abschalten nur als Vorschlag an Emin.`,
    quelle: `controller:${kw()}`,
  })

  return {
    ergebnis: `${t.chancen} Chancen, ${t.gewonnen} gewonnen (${t.gewonnen_eur.toLocaleString("de-DE")} €) · ${wirkt.length} Agenten wirken nach außen, ${intern.length} nur intern, ${ohne.length} ohne Wirkung`,
    anzahl: 1,
  }
}
