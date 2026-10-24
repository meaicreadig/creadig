import "server-only"

import { briefBereit } from "@/lib/brief/letterxpress"

import { generateText } from "ai"

import { assistentDb, legeFreigabeAn, quelleBekannt } from "@/lib/assistent/store"
import { firmenText } from "@/lib/firmenwahrheit"
import { findeOderLegeFirma } from "@/lib/kundenfaden"

import { json, kw, MODELL, RECHERCHE_MODELL, slug } from "./ki"

/**
 * PARTNER & EMPFEHLUNGEN — der einzige Vertriebsweg, der ohne Kaltakquise skaliert.
 *
 * 24.10.2026 neu. Zwei Wege:
 * 1. Empfehlungen: Jeder Kunde mit gewonnenem Auftrag wird einmal im Jahr um
 *    eine Empfehlung gebeten (fertige Mail, Versand erst nach Emins Klick).
 * 2. Multiplikatoren: Jede Woche ein Segment (IGMG-Verbände = Emins warmes
 *    Netzwerk, 24.10.2026; Plan 23.08.2026: Agentur-
 *    Partnerschaften als White-Label für das BFSG-Audit, DE-TR-Community). Die
 *    Recherche holt die Impressums-Anschrift, der Brief liegt als Ein-Klick-
 *    Freigabe bei Emin (Post, B2B – keine Werbe-Mail ohne Einwilligung).
 *    Höchstens 2 Briefe je Woche: lieber wenige passende Partner.
 */

const SEGMENTE = [
  /* Emin 24.10.2026: sein warmes Netzwerk. KİB OS (IGMG Nord Ruhr) und CIMG Ostfrankreich sind der Beweis. */
  {
    id: "igmg",
    suche: "IGMG-Regionalverbände (Islamische Gemeinschaft Millî Görüş) und ihre Schwesterverbände in Deutschland, Frankreich (CIMG), den Niederlanden, Belgien, Österreich und der Schweiz mit eigener Website und Geschäftsstelle – außer IGMG Regionalverband Nord Ruhr und CIMG Ostfrankreich (Straßburg), die kennen wir schon",
    angebot: "KİB OS – das System, das der IGMG Regionalverband Nord Ruhr schon nutzt (Programme, Aufgaben, Aktivitäten, Karte aller Ortsgemeinden), plus Mitgliederverwaltung; persönlich vorgestellt von Muhammed Emin Akyol, der die Gemeinschaft kennt",
  },
  {
    id: "agentur",
    suche: "kleine Webagenturen und Designbüros in Deutschland (2–15 Mitarbeitende), die Websites für KMU bauen, aber auf ihrer Seite keine eigene Barrierefreiheits-Prüfung (BFSG/WCAG) anbieten",
    angebot: "White-Label-Barrierefreiheits-Prüfung nach BFSG/WCAG für ihre Kunden: wir prüfen, sie behalten die Kundenbeziehung",
  },
  {
    id: "steuer",
    suche: "Steuerberatungskanzleien in Deutschland mit Digital-Schwerpunkt (DATEV-Digitalisierung, Mandanten aus Handwerk und Gastronomie), die auf ihrer Website über die E-Rechnungspflicht informieren",
    angebot: "Empfehlungspartnerschaft: Wenn Mandanten Website, Online-Termine oder digitale Abläufe brauchen, übernehmen wir – zuverlässig und ohne Abwerben",
  },
  {
    id: "verband",
    suche: "deutsch-türkische und türkischstämmige Unternehmerverbände, Wirtschaftsvereine und Netzwerke in Deutschland, Österreich und der Schweiz mit Geschäftsstelle und Mitgliederangeboten",
    angebot: "Kooperation: Praxisvortrag oder Sprechstunde für Mitglieder zu Digitalisierung, Barrierefreiheit und KI im kleinen Betrieb, auf Deutsch und Türkisch",
  },
  {
    id: "systemhaus",
    suche: "kleine IT-Systemhäuser und IT-Dienstleister in Deutschland, die Netzwerk, Hardware und Support für KMU anbieten, aber keine Websites oder Web-Anwendungen bauen",
    angebot: "Partnerschaft: Sie betreuen die Technik, wir übernehmen Website, Barrierefreiheit und Automatisierung – mit Empfehlung in beide Richtungen",
  },
]

type Fund = { firma: string; strasse: string; plz: string; ort: string; land?: string; website: string; warum: string; betreff: string; brief: string }

const BRIEFE_JE_WOCHE = 2

/** Zufriedene Kunden einmal im Jahr um eine Empfehlung bitten – als fertige Mail zur Freigabe. */
async function empfehlungen(): Promise<number> {
  const q = await assistentDb()
  if (!q) return 0
  const jahr = new Date().getFullYear()
  const kunden = (await q(
    `SELECT DISTINCT ON (og.id) og.id, og.name, o.title, coalesce(c.email, og.email) AS email, c.name AS kontakt
       FROM organisations og
       JOIN opportunities o ON o.organisation_id = og.id AND o.status = 'won'
       LEFT JOIN contacts c ON c.organisation_id = og.id AND c.email IS NOT NULL
      WHERE og.lifecycle = 'kunde' AND og.excluded_reason IS NULL AND coalesce(c.email, og.email) IS NOT NULL
      ORDER BY og.id, o.updated_at DESC LIMIT 10`,
    [],
  )) as { id: string; name: string; title: string; email: string; kontakt: string | null }[]
  let n = 0
  for (const k of kunden) {
    if (n >= 2) break
    const quelle = `empfehlung:${k.id}:${jahr}`
    if (await quelleBekannt(quelle)) continue
    const { text } = await generateText({
      model: MODELL,
      prompt: `Schreibe für Muhammed Emin Akyol (creaDIG Solutions) eine kurze persönliche Mail an einen zufriedenen Kunden (${k.name}, Ansprechpartner: ${k.kontakt ?? "unbekannt – neutrale Anrede"}). Gemeinsames Projekt: ${k.title}.
Per Sie, 70–100 Wörter: Dank für die Zusammenarbeit, die Frage, ob er jemanden kennt, dem wir ähnlich helfen können. Kein Rabatt, keine Provision, nichts erfinden.
Antworte NUR mit JSON: {"betreff":"","text":"ab der Anrede, mit Gruß und Name"}`,
    })
    const v = json<{ betreff: string; text: string }>(text)
    if (!v?.text) continue
    const id = await legeFreigabeAn({
      art: "mail",
      titel: `Empfehlung erbitten: ${k.name}`,
      inhalt: v.text.trim(),
      betreff: v.betreff,
      empfaenger: k.email,
      quelle,
      agent: "partner",
      extra: { warum: `Gewonnener Auftrag „${k.title}“ – einmal im Jahr um Empfehlung bitten.`, orgId: k.id },
    })
    if (id) n++
  }
  return n
}

export async function partnerRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const woche = kw()
  const seg = SEGMENTE[Number(woche.split("-")[1]) % SEGMENTE.length]
  const q = await assistentDb()
  if (!q) return { ergebnis: "Keine Datenbank", anzahl: 0 }

  const bekannt = ((await q(`SELECT lower(name) AS n FROM organisations ORDER BY created_at DESC LIMIT 300`, []).catch(() => [])) as { n: string }[]).map((r) => r.n)

  const { text } = await generateText({
    model: RECHERCHE_MODELL,
    prompt: `${firmenText("kurz")}
Finde 4 echte, aktuell existierende Partner für creaDIG: ${seg.suche}.
Nur Firmen/Verbände mit eigener Website, die du in der Quelle gesehen hast. Keine Konzerne, nichts erfinden.
Pflicht: Postanschrift aus dem Impressum (Straße mit Hausnummer, PLZ, Ort, Land), genau wie dort – sonst weglassen.
${bekannt.length ? `Bereits bekannt, NICHT nennen: ${bekannt.slice(0, 60).join(", ")}.` : ""}
Für jeden einen kurzen BRIEF auf Deutsch (Post; 90–130 Wörter, per Sie, Absender Muhammed Emin Akyol, creaDIG Solutions): ein konkreter Bezug zu ihrer Arbeit, das Angebot „${seg.angebot}“, am Ende die Einladung zu einem kurzen Kennenlerngespräch (creadig.de/termin). Kein Werbeton, keine erfundenen Zahlen, keine Provisionshöhe.
Antworte NUR mit JSON-Array: [{"firma":"","strasse":"","plz":"","ort":"","land":"Deutschland","website":"https://...","warum":"1 Satz","betreff":"","brief":"Brieftext ab der Anrede, mit Gruß und Name"}]`,
  })
  const funde = (json<Fund[]>(text) ?? []).filter(
    (f) => f?.firma && f.website?.startsWith("http") && f.brief && f.strasse?.trim() && /^\d{4,5}$/.test(f.plz?.trim() ?? "") && f.ort?.trim(),
  )

  let briefe = 0
  for (const f of funde) {
    if (briefe >= BRIEFE_JE_WOCHE) break
    if (bekannt.includes(f.firma.trim().toLowerCase())) continue
    const firma = await findeOderLegeFirma(q, {
      name: f.firma.trim(),
      website: f.website,
      city: f.ort,
      note: `Partner-Kandidat (${seg.id}, KW ${woche}): ${f.warum}\nAnschrift laut Impressum: ${f.strasse}, ${f.plz} ${f.ort}`,
    })
    if (!firma.neu) continue
    let host = ""
    try {
      host = new URL(f.website).hostname.replace(/^www\./, "").toLowerCase()
    } catch {}
    /* Katman 6: Ohne Briefkanal keine Karte – der Brief wartet im Firmenprofil. */
    if (!briefBereit()) {
      await q(`UPDATE organisations SET note = concat_ws(E'\n\n', nullif(note,''), $2::text), updated_at = now() WHERE id = $1`, [
        firma.id,
        `Partner-Brief-Entwurf (wartet auf Briefkanal):\nBetreff: ${f.betreff}\n\n${f.brief.trim()}`.slice(0, 4000),
      ])
      briefe++
      continue
    }
    const id = await legeFreigabeAn({
      art: "brief",
      titel: `Partner-Brief an ${f.firma} (${f.ort})`,
      inhalt: f.brief.trim(),
      betreff: f.betreff,
      quelle: `brief:${host || slug(f.firma)}`,
      agent: "partner",
      extra: {
        warum: `${f.warum} · Segment: ${seg.angebot}`,
        anschrift: { firma: f.firma.trim(), strasse: f.strasse.trim(), plz: f.plz.trim(), ort: f.ort.trim(), land: f.land?.trim() || undefined },
        orgId: firma.id,
        produkt: "creadig",
      },
    })
    if (id) briefe++
  }

  const empf = await empfehlungen()
  return {
    ergebnis: `Segment ${seg.id}: ${briefe} Partner-Briefe ${briefBereit() ? "zur Freigabe" : "im Firmenprofil geparkt (Briefkanal fehlt)"} · ${empf} Empfehlungs-Mails zur Freigabe`,
    anzahl: briefe + empf,
  }
}
