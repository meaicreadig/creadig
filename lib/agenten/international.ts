import "server-only"

import { generateText } from "ai"

import { legeFreigabeAn } from "@/lib/assistent/store"
import { firmenText, MAERKTE } from "@/lib/firmenwahrheit"
import { legeAuftragAn } from "@/lib/koordination/koordinator"

import { berlinTag, json, kw, MODELL, recherchiere, slug } from "./ki"

/**
 * INTERNATIONAL BUSINESS — Märkte außerhalb Deutschlands, in der Reihenfolge
 * aus lib/firmenwahrheit.ts (Schweiz, übriges Europa, Diaspora europaweit).
 *
 * 23.10.2026 neu: Bis hierher gab es nur das Golf-Radar, und das sucht
 * Investoren, keine Märkte. Diese Abteilung sucht die Wege in einen Markt:
 * Programme (Switzerland Global Enterprise, AHK, Enterprise Europe Network),
 * Kammern und Verbände der türkischstämmigen Wirtschaft, Messen mit offener
 * Anmeldung, Pflichten (Recht, Steuern, Sprache) vor dem ersten Kunden.
 * Keine Kaltakquise: Vorschläge sind Bewerbungen, Anmeldungen, Partner, die
 * selbst um Mitglieder werben — alles als Vorlage bei Emin.
 */

const FOKUS = [
  { markt: "Schweiz", frage: "Markteintritt Schweiz für ein deutsches Digitalhaus (Websites, BFSG-ähnliche Barrierefreiheit, KI-Automatisierung, Gastro-Kasse CASSAMEA): Programme, Kammern, Messen mit offener Anmeldung, MWST-Registrierung und rechtliche Pflichten." },
  { markt: "Österreich", frage: "Markteintritt Österreich für ein deutsches Digitalhaus (Websites, Barrierefreiheit nach Barrierefreiheitsgesetz BaFG, KI-Automatisierung): Programme, Netzwerke, Messen mit offener Anmeldung, Pflichten." },
  { markt: "Diaspora Europa", frage: "Türkischstämmige Unternehmerverbände, Kammern und Netzwerke in Deutschland, Österreich, Schweiz, Niederlanden, Belgien und Frankreich, die Mitglieder aufnehmen oder Veranstaltungen mit offener Anmeldung haben (Digitalisierung, Handwerk, Gastronomie)." },
  { markt: "EU", frage: "EU-Programme und Netzwerke (Enterprise Europe Network, Digital Europe, EIC, Ausschreibungen) für kleine Digitalanbieter mit Fristen in den nächsten 90 Tagen." },
]

type Chance = { name: string; art: string; land: string; url: string; warum: string; naechsterSchritt: string; frist?: string; vertrieb?: boolean }

export async function internationalRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const woche = kw()
  const f = FOKUS[Number(woche.split("-")[1]) % FOKUS.length]
  const funde = await recherchiere(f.frage)
  if (!funde) return { ergebnis: `${f.markt}: keine belegten Funde`, anzahl: 0 }

  const { text } = await generateText({
    model: MODELL,
    prompt: `Du leitest International Business bei creaDIG.
${firmenText("kurz")}
Marktpriorität: ${MAERKTE.prioritaet.join(" → ")}. Nische: ${MAERKTE.nische}. ${MAERKTE.nicht}

Schwerpunkt dieser Woche: ${f.markt}
Recherche (${berlinTag()}):
${funde}

Wähle höchstens 3 Chancen, die creaDIG in den nächsten 90 Tagen in diesem Markt voranbringen. Nur Einträge mit URL aus der Recherche. Keine Kaltakquise. "vertrieb": true, wenn daraus Kundengespräche entstehen können (Messe, Verband, Partner).
Antworte NUR mit JSON: [{"name":"","art":"Programm|Kammer|Verband|Messe|Pflicht|Partner","land":"","url":"","warum":"1 Satz","naechsterSchritt":"1 konkreter Schritt für Emin","frist":"falls bekannt","vertrieb":false}]`,
  })
  const chancen = (json<Chance[]>(text) ?? []).filter((c) => c?.name && c.url?.startsWith("http"))

  let n = 0
  for (const c of chancen.slice(0, 3)) {
    const id = await legeFreigabeAn({
      art: "aufgabe",
      titel: `International · ${c.name} (${c.land})`,
      inhalt: `${c.art} · ${c.land}${c.frist ? ` · Frist: ${c.frist}` : ""}\n\n${c.warum}\n\nNächster Schritt: ${c.naechsterSchritt}\n\nQuelle: ${c.url}`,
      quelle: `international:${slug(c.name)}`,
      agent: "international",
      extra: { warum: c.warum },
    })
    if (!id) continue
    n++
    if (c.vertrieb)
      await legeAuftragAn({
        von: "international",
        an: "vertrieb",
        titel: `${c.land} · ${c.name} vorbereiten`,
        inhalt: `International hat eine Chance mit Kundenkontakt gefunden: ${c.name} (${c.url}).\n${c.warum}\n\nBitte vorbereiten: welches Angebot, welche Unterlagen, welche Sprache. Nichts versenden – Vorlage an Emin.`,
        quelle: `international-vertrieb:${slug(c.name)}`,
      })
  }
  return { ergebnis: `${f.markt}: ${n} Chancen mit nächstem Schritt`, anzahl: n }
}
