import "server-only"

import { tool } from "ai"
import { z } from "zod"

import { assistentDb, ergaenzeExtra, ladeFreigabe, letzteLaeufe, setzeFreigabe } from "@/lib/assistent/store"
import { siteUrl } from "@/lib/termine/mail"

/**
 * Die Akte der Abteilungen: Werkzeuge, mit denen eine Abteilung selbst nachsieht,
 * statt Emin zu fragen.
 *
 * 24.10.2026: Bis hierher bekam jede Abteilung nur Titel und Text ihres Auftrags.
 * Ergebnisse lauteten deshalb „Mir fehlt der IT-Bericht", „Bitte Vertragsdaten
 * einfügen", „Welcher Anbieter ist combi?" — obwohl alles in der Datenbank steht.
 * Jetzt liest die Abteilung Webseiten-Befunde, Belege, Pipeline, Bulletin, Läufe
 * und offene Karten selbst. Schreiben darf sie nur eins: eine überholte interne
 * Karte (Aufgabe/Notiz) schließen. Mail, Brief, LinkedIn, Kapital, Löschen nie.
 */

const INTERN = new Set(["aufgabe", "notiz"])

export const FESTE_FAKTEN = () =>
  `Feste Links (nie als Platzhalter schreiben, nie bei Emin erfragen): Terminbuchung ${siteUrl()}/termin · Kontakt ${siteUrl()}/kontakt · Website ${siteUrl()}.`

export function akteWerkzeuge(abteilung: string) {
  return {
    webseiten_befunde: tool({
      description: "Letzte Prüfung von creadig.de: Gesamtnote, Noten je Bereich und alle Befunde mit Schwere, Detail und URL.",
      inputSchema: z.object({}),
      execute: async () => {
        const { ladeLetztePruefung } = await import("@/lib/webseite/pruefer")
        const p = await ladeLetztePruefung().catch(() => null)
        if (!p) return { fehler: "keine Prüfung gespeichert" }
        return {
          am: p.erstelltAm,
          gesamt: p.gesamt,
          noten: p.noten,
          befunde: p.befunde.map((b) => ({ schwere: b.schwere, bereich: b.bereich, titel: b.titel, detail: b.detail.slice(0, 400), url: b.url, erledigung: b.erledigung })),
        }
      },
    }),
    belege_haendler: tool({
      description: "Belege der Buchhaltung zu einem Händler/Anbieter (letzte 12 Monate): Datum, Betrag, Kategorie. Für Kosten, Verträge, Preisanstiege.",
      inputSchema: z.object({ haendler: z.string().min(2).max(80) }),
      execute: async ({ haendler }) => {
        const { finanzDb } = await import("@/lib/finanz/store")
        const db = await finanzDb().catch(() => null)
        if (!db) return { fehler: "keine Finanzdatenbank" }
        const rows = await db(
          `SELECT datum::text AS datum, haendler, round(brutto_cent / 100.0, 2)::float AS brutto_eur, kategorie, coalesce(geschaeftsfeld, '') AS feld
             FROM fin_belege WHERE NOT archiviert AND haendler ILIKE $1 AND datum >= CURRENT_DATE - 365
            ORDER BY datum DESC LIMIT 24`,
          [`%${haendler.replace(/[%_]/g, "")}%`],
        )
        return { treffer: rows.length, belege: rows }
      },
    }),
    pipeline: tool({
      description: "Offene Kundenchancen mit Stufe, Wert, nächstem Schritt, Fälligkeit und Warnungen.",
      inputSchema: z.object({}),
      execute: async () => {
        const { ladeVerkaufslage } = await import("@/lib/verkaufen")
        const l = await ladeVerkaufslage().catch(() => null)
        if (!l) return { fehler: "Pipeline nicht erreichbar" }
        return {
          deals: l.deals.slice(0, 15).map((d) => ({ titel: d.titel, firma: d.firma, stufe: d.stufe, wert: d.wert, naechsterSchritt: d.naechsterSchritt, faellig: d.faelligAm, warnungen: d.warnungen })),
        }
      },
    }),
    bulletin_heute: tool({
      description: "Heutige Bulletin-Meldungen (Markt, Technik, Recht) mit Quelle.",
      inputSchema: z.object({}),
      execute: async () => {
        const { ladeAusgabe, ladeLauf } = await import("@/lib/bulletin/store")
        const [a, lauf] = await Promise.all([ladeAusgabe().catch(() => null), ladeLauf().catch(() => null)])
        return { lauf, meldungen: (a?.meldungen ?? []).slice(0, 10).map((m) => ({ titel: m.titel.de, quelle: m.quelle, url: m.url, kurz: m.kurz.de })) }
      },
    }),
    ki_mitarbeiter: tool({
      description: "Letzter Lauf jedes KI-Mitarbeiters: Ergebnis, Anzahl, Fehler, Zeit.",
      inputSchema: z.object({}),
      execute: async () => Object.values(await letzteLaeufe()).map((l) => ({ agent: l.agent, ergebnis: l.ergebnis.slice(0, 200), anzahl: l.anzahl, fehler: l.fehler, zeit: l.zeit })),
    }),
    offene_karten: tool({
      description: "Offene Karten im Freigabe-System (alle Arten) mit ID, Art, Agent, Alter in Tagen und ob sie bei Emin liegen.",
      inputSchema: z.object({}),
      execute: async () => {
        const q = await assistentDb()
        if (!q) return { fehler: "keine Datenbank" }
        return q(
          `SELECT id, art, coalesce(agent,'') AS agent, left(titel, 120) AS titel,
                  (now()::date - created_at::date) AS tage,
                  coalesce(extra->'koordination'->>'beiEmin', '') = 'true' AS bei_emin
             FROM assistent_freigaben WHERE status = 'offen' ORDER BY created_at ASC LIMIT 60`,
          [],
        )
      },
    }),
    fruehere_arbeit: tool({
      description: "Frühere Ergebnisse der Abteilungen zu einem Stichwort (damit nichts doppelt gemacht wird).",
      inputSchema: z.object({ stichwort: z.string().min(2).max(80) }),
      execute: async ({ stichwort }) => {
        const q = await assistentDb()
        if (!q) return { fehler: "keine Datenbank" }
        const m = `%${stichwort.replace(/[%_]/g, "")}%`
        return q(
          `SELECT an, status, left(titel, 120) AS titel, left(coalesce(ergebnis, ''), 500) AS ergebnis, created_at::date::text AS am
             FROM firma_auftraege WHERE titel ILIKE $1 OR ergebnis ILIKE $1 ORDER BY created_at DESC LIMIT 6`,
          [m],
        )
      },
    }),
    interne_karte_schliessen: tool({
      description:
        "Schließt eine überholte, doppelte oder erledigte INTERNE Karte (Art aufgabe/notiz) mit Begründung. Mail, Brief, LinkedIn, Kapital und Löschen sind gesperrt – die gibt nur Emin frei.",
      inputSchema: z.object({ id: z.string().min(4).max(40), begruendung: z.string().min(5).max(400) }),
      execute: async ({ id, begruendung }) => {
        const f = await ladeFreigabe(id)
        if (!f) return { geschlossen: false, grund: "unbekannte ID" }
        if (f.status !== "offen") return { geschlossen: false, grund: "nicht mehr offen" }
        if (!INTERN.has(f.art)) return { geschlossen: false, grund: `Art ${f.art} gibt nur Emin frei` }
        const { gehtNachAussen } = await import("./koordinator")
        if (gehtNachAussen({ von: f.agent ?? "", titel: f.titel, freigabeId: f.id }))
          return { geschlossen: false, grund: "berührt Kunde, Geld oder Außenwirkung – entscheidet Emin" }
        await ergaenzeExtra(id, { koordination: { abteilung, ergebnis: begruendung, auftragId: "akte", automatisch: true } })
        await setzeFreigabe(id, "freigegeben")
        return { geschlossen: true }
      },
    }),
  }
}
