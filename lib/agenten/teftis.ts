import "server-only"

import { generateText } from "ai"

import { AGENTEN } from "@/lib/assistent/truppe"
import { assistentDb, legeFreigabeAn, quelleBekannt, speichereNachricht } from "@/lib/assistent/store"
import { legeAuftragAn } from "@/lib/koordination/koordinator"
import type { Abfrage } from "@/lib/neon-abfrage"
import { ladeLetztePruefung } from "@/lib/webseite/pruefer"
import type { Uebernahme } from "@/lib/zentrale/personen"

import { berlinTag, json, MODELL } from "./ki"

/**
 * TEFTİŞ (Teoman) — unabhängige Revision der ganzen Firma, 24.10.2026.
 *
 * Emin: „Kendi sistemimizi teftiş eden var mı – sitemizi, asistandan bütün
 * birimlere kadar?“ Qualität benotet Entwürfe, Controller misst Ergebnisse,
 * Kaan sucht Ideen – aber niemand prüfte, ob die Firma als Ganzes hält, was
 * sie verspricht. Teoman prüft alle 3 Tage von außen nach innen:
 *
 *   Website     – Kernseiten erreichbar, letzte Website-Prüfung frisch und ohne Kritisches
 *   Agenten     – jeder läuft im Takt, ohne Fehler, nicht dauerhaft leer
 *   Zusagen     – was der Chat als „arbeitet daran“ zeigte, ist nach 3 Tagen erledigt
 *   Zusammenarbeit – Aufträge zwischen Abteilungen bleiben nicht liegen
 *   Emin        – Karten warten nicht über eine Woche
 *   Chancen     – jede offene Chance hat einen nächsten Schritt und Bewegung
 *   Daten       – Kunden haben Kontakte, Einstellungen sind gesetzt
 *
 * Jeder Befund geht als Auftrag an die zuständige Abteilung (intern). Im Chat
 * erscheint der Bericht mit Note, Trend und der „Hamle“ – einem mutigen,
 * legalen Vorschlag für die nächsten Tage, der die Firma nach vorn bringt.
 * Täglich dazwischen nur ein Schnellcheck: meldet sich nur bei Kritischem.
 */

type Schwere = "kritisch" | "wichtig" | "hinweis"
type Befund = { code: string; bereich: string; schwere: Schwere; titel: string; an: string; agent: string }
type Bericht = { punkte: number; befunde: Befund[] }
type Hamle = { titel: string; warum: string; schritte: string[]; agent: string; brauchtEmin: boolean }

const ABZUG: Record<Schwere, number> = { kritisch: 12, wichtig: 5, hinweis: 1 }
const ZYKLUS_TAGE = 3
const BASIS = (process.env.NEXT_PUBLIC_SITE_URL || "https://creadig.de").replace(/\/$/, "")
const KERNSEITEN = ["/", "/en", "/tr", "/ar", "/kontakt", "/insights", "/leistungen", "/branchen/handwerk", "/branchen/elektrohandwerk", "/datenschutz", "/impressum"]

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS teftis_berichte (
     id text PRIMARY KEY,
     created_at timestamptz NOT NULL DEFAULT now(),
     punkte int NOT NULL,
     befunde jsonb NOT NULL DEFAULT '[]'::jsonb,
     hamle text
   )`,
]

async function pruefeWebsite(): Promise<Befund[]> {
  const out: Befund[] = []
  const antworten = await Promise.all(
    KERNSEITEN.map(async (p) => {
      try {
        const r = await fetch(`${BASIS}${p}`, { redirect: "follow", cache: "no-store", signal: AbortSignal.timeout(15000) })
        return { p, status: r.status }
      } catch {
        return { p, status: 0 }
      }
    }),
  )
  for (const a of antworten.filter((x) => x.status !== 200))
    out.push({ code: `seite:${a.p}`, bereich: "Website", schwere: "kritisch", titel: `${a.p} antwortet mit ${a.status || "keiner Antwort"}`, an: "it", agent: "webseite" })
  const pruefung = await ladeLetztePruefung().catch(() => null)
  if (!pruefung || Date.now() - new Date(pruefung.erstelltAm).getTime() > 8 * 864e5)
    out.push({ code: "webseite-pruefung-alt", bereich: "Website", schwere: "wichtig", titel: "Website-Prüfung älter als 8 Tage", an: "it", agent: "webseite" })
  const kritisch = pruefung?.befunde.filter((b) => b.schwere === "kritisch") ?? []
  if (kritisch.length)
    out.push({ code: "webseite-kritisch", bereich: "Website", schwere: "wichtig", titel: `${kritisch.length} kritische Website-Befunde offen: ${kritisch.slice(0, 3).map((b) => b.titel).join("; ")}`, an: "it", agent: "webseite" })
  return out
}

async function pruefeAgenten(q: Abfrage): Promise<Befund[]> {
  const out: Befund[] = []
  const { pausierteAgenten } = await import("@/lib/ergebnis/steuerung")
  const pausiert = await pausierteAgenten().catch(() => new Set<string>())
  const laeufe = (await q(
    `SELECT agent, max(created_at) AS zuletzt,
            count(*) FILTER (WHERE fehler IS NOT NULL AND fehler <> '' AND created_at > now() - interval '3 days')::int AS fehler,
            count(*) FILTER (WHERE created_at > now() - interval '14 days')::int AS laeufe,
            count(*) FILTER (WHERE created_at > now() - interval '14 days' AND coalesce(anzahl, 0) = 0)::int AS leer
       FROM assistent_laeufe GROUP BY agent`,
    [],
  ).catch(() => [])) as { agent: string; zuletzt: string; fehler: number; laeufe: number; leer: number }[]
  const je = new Map(laeufe.map((l) => [l.agent, l]))
  for (const a of AGENTEN) {
    if (pausiert.has(a.key) || a.key === "teftis") continue
    const l = je.get(a.key)
    const grenze = a.takt === "taeglich" ? 1.6 * 864e5 : 8 * 864e5
    if (!l)
      out.push({ code: `lauf:${a.key}`, bereich: "Agenten", schwere: "wichtig", titel: `${a.name} ist noch nie gelaufen (Takt ${a.takt})`, an: "it", agent: a.key })
    else if (Date.now() - new Date(l.zuletzt).getTime() > grenze)
      out.push({ code: `lauf:${a.key}`, bereich: "Agenten", schwere: "kritisch", titel: `${a.name} ist seit ${Math.floor((Date.now() - new Date(l.zuletzt).getTime()) / 864e5)} Tagen nicht gelaufen (Takt ${a.takt})`, an: "it", agent: a.key })
    else if (l.fehler)
      out.push({ code: `fehler:${a.key}`, bereich: "Agenten", schwere: "wichtig", titel: `${a.name}: ${l.fehler} fehlgeschlagene Läufe in 3 Tagen`, an: "entwicklung", agent: a.key })
    else if (l.laeufe >= 5 && l.leer === l.laeufe)
      out.push({ code: `leer:${a.key}`, bereich: "Agenten", schwere: "hinweis", titel: `${a.name}: ${l.laeufe} Läufe in 14 Tagen, alle ohne Ergebnis`, an: "qualitaet", agent: a.key })
  }
  return out
}

async function pruefeZusagen(q: Abfrage): Promise<Befund[]> {
  /* Was der Chat als „arbeitet daran“ zeigte und seit 3 Tagen ohne Folgemeldung desselben Agenten blieb. */
  const rows = (await q(
    `SELECT u->>'agent' AS agent, u->>'was' AS was, n.created_at
       FROM assistent_nachrichten n, jsonb_array_elements(coalesce(n.uebernahmen, '[]'::jsonb)) u
      WHERE u->>'stand' = 'laeuft' AND n.created_at < now() - interval '3 days' AND n.created_at > now() - interval '30 days'
        AND NOT EXISTS (
          SELECT 1 FROM assistent_nachrichten m, jsonb_array_elements(coalesce(m.uebernahmen, '[]'::jsonb)) v
           WHERE m.created_at > n.created_at AND v->>'agent' = u->>'agent' AND v->>'stand' = 'erledigt')
      LIMIT 10`,
    [],
  ).catch(() => [])) as { agent: string; was: string }[]
  const { abteilungVonAgent } = await import("@/lib/zentrale/abteilungen")
  return rows.map((r) => ({
    code: `zusage:${r.agent}:${r.was.slice(0, 30)}`,
    bereich: "Zusagen",
    schwere: "wichtig" as const,
    titel: `Im Chat zugesagt, seit 3+ Tagen ohne Abschluss: ${r.was.slice(0, 140)}`,
    an: abteilungVonAgent(r.agent)?.id ?? "geschaeftsfuehrung",
    agent: r.agent,
  }))
}

async function pruefeBetrieb(q: Abfrage): Promise<Befund[]> {
  const out: Befund[] = []
  const [auftraege, karten, chancen, daten] = await Promise.all([
    q(
      `SELECT an, count(*)::int AS n FROM firma_auftraege
        WHERE status IN ('neu','weitergegeben') AND created_at < now() - interval '3 days' GROUP BY an ORDER BY n DESC`,
      [],
    ).catch(() => []) as Promise<{ an: string; n: number }[]>,
    q(
      `SELECT count(*)::int AS n FROM assistent_freigaben WHERE status = 'offen' AND created_at < now() - interval '7 days'
          AND (art NOT IN ('aufgabe','notiz') OR coalesce(extra->>'fuerEmin', '') = 'true')`,
      [],
    ).catch(() => [{ n: 0 }]) as Promise<{ n: number }[]>,
    q(
      `SELECT g.name, o.title,
              (o.next_action IS NULL OR o.next_action_at IS NULL) AS ohne_schritt,
              (o.next_action_at < now() - interval '2 days') AS ueberfaellig,
              (o.updated_at < now() - interval '14 days') AS still
         FROM opportunities o JOIN organisations g ON g.id = o.organisation_id
        WHERE o.status NOT IN ('won','lost')`,
      [],
    ).catch(() => []) as Promise<{ name: string; title: string; ohne_schritt: boolean; ueberfaellig: boolean; still: boolean }[]>,
    q(
      `SELECT (SELECT count(*)::int FROM organisations g WHERE g.lifecycle = 'kunde'
                 AND NOT EXISTS (SELECT 1 FROM contacts c WHERE c.organisation_id = g.id)) AS kunden_ohne_kontakt`,
      [],
    ).catch(() => [{ kunden_ohne_kontakt: 0 }]) as Promise<{ kunden_ohne_kontakt: number }[]>,
  ])
  for (const a of auftraege)
    out.push({ code: `auftrag:${a.an}`, bereich: "Zusammenarbeit", schwere: a.n >= 3 ? "wichtig" : "hinweis", titel: `${a.n} Auftrag/Aufträge bei „${a.an}“ seit über 3 Tagen unbearbeitet`, an: a.an, agent: "koordinator" })
  if (karten[0]?.n)
    out.push({ code: "karten-alt", bereich: "Emin", schwere: karten[0].n >= 5 ? "wichtig" : "hinweis", titel: `${karten[0].n} Karten warten seit über einer Woche auf Emin – Chief of Staff soll bündeln oder schließen`, an: "geschaeftsfuehrung", agent: "koordinator" })
  for (const c of chancen) {
    if (c.ohne_schritt) out.push({ code: `chance-schritt:${c.name}`, bereich: "Chancen", schwere: "wichtig", titel: `${c.name} – „${c.title}“ hat keinen nächsten Schritt mit Datum`, an: "vertrieb", agent: "vertrieb" })
    else if (c.ueberfaellig) out.push({ code: `chance-faellig:${c.name}`, bereich: "Chancen", schwere: "wichtig", titel: `${c.name}: nächster Schritt überfällig`, an: "vertrieb", agent: "vertrieb" })
    else if (c.still) out.push({ code: `chance-still:${c.name}`, bereich: "Chancen", schwere: "hinweis", titel: `${c.name}: seit 14 Tagen keine Bewegung`, an: "vertrieb", agent: "vertrieb" })
  }
  const ohne = daten[0]?.kunden_ohne_kontakt ?? 0
  if (ohne) out.push({ code: "kunden-ohne-kontakt", bereich: "Daten", schwere: "hinweis", titel: `${ohne} Kunden ohne Ansprechpartner – Kundenbetreuung kann sie nicht erreichen`, an: "vertrieb", agent: "kundenbetreuung" })
  for (const [env, wozu] of [
    ["GOOGLE_BEWERTUNG_URL", "Bewertungslink in den Bewertungs-Karten"],
    ["FIXKOSTEN_EUR_MONAT", "Fixkosten im Wochenblick Kosten gegen Einnahmen"],
  ] as const)
    if (!process.env[env]) out.push({ code: `env:${env}`, bereich: "Einstellungen", schwere: "hinweis", titel: `${env} fehlt (${wozu})`, an: "it", agent: "sicherheit" })
  return out
}

export async function pruefeAlles(q: Abfrage): Promise<Bericht> {
  const teile = await Promise.all([pruefeWebsite(), pruefeAgenten(q), pruefeZusagen(q), pruefeBetrieb(q)])
  const befunde = teile.flat()
  const punkte = Math.max(0, 100 - befunde.reduce((n, b) => n + ABZUG[b.schwere], 0))
  return { punkte, befunde }
}

const note = (p: number) => (p >= 90 ? "A" : p >= 75 ? "B" : p >= 60 ? "C" : p >= 40 ? "D" : "E")

export async function teftisRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const q = await assistentDb()
  if (!q) return { ergebnis: "Keine Datenbank", anzahl: 0 }
  for (const s of SCHEMA) await q(s, [])
  const tag = berlinTag()

  /* Jeden Tag zuerst: Geld-Karten wartender Chancen schließen (Gespräch/Antwort steht noch aus). */
  const { raeumeWartendeKarten } = await import("@/lib/ausfuehrung/vorbehalt")
  const { WARTE_AGENTEN } = await import("@/lib/assistent/store")
  const geraeumt = await raeumeWartendeKarten(q, WARTE_AGENTEN).catch(() => [])
  if (geraeumt.length)
    await speichereNachricht(
      "assistant",
      `Teoman (Teftiş): ${geraeumt.length} Karte${geraeumt.length > 1 ? "n" : ""} zurückgenommen – die Chance wartet noch auf dein Gespräch bzw. eine Antwort.`,
      geraeumt.map((k) => ({ agent: "teftis", was: `${k.titel} → ${k.grund}`, stand: "erledigt" as const })),
    ).catch(() => null)

  const [letzter] = (await q(`SELECT punkte, created_at FROM teftis_berichte ORDER BY created_at DESC LIMIT 1`, [])) as { punkte: number; created_at: string }[]
  const voll = !letzter || Date.now() - new Date(letzter.created_at).getTime() > (ZYKLUS_TAGE - 0.3) * 864e5

  /* Zwischen den Teftiş-Tagen: nur Schnellcheck, meldet sich ausschließlich bei Kritischem. */
  if (!voll) {
    if (await quelleBekannt(`teftis-schnell:${tag}`)) return { ergebnis: "Schnellcheck heute erledigt", anzahl: 0 }
    const kritisch = [...(await pruefeWebsite()), ...(await pruefeAgenten(q))].filter((b) => b.schwere === "kritisch")
    for (const b of kritisch) await legeAuftragAn({ von: "teftis", an: b.an, titel: `Teftiş (dringend): ${b.titel}`.slice(0, 160), inhalt: `${b.bereich}: ${b.titel}\n\nBitte heute beheben und im Chat melden.`, quelle: `teftis-schnell:${tag}:${b.code}` }).catch(() => null)
    if (kritisch.length)
      await speichereNachricht("assistant", `Teoman (Teftiş) – Schnellcheck: ${kritisch.length} kritische Befunde, sofort verteilt.`, kritisch.slice(0, 5).map((b) => ({ agent: b.agent, was: b.titel, stand: "laeuft" as const, bis: "heute" })))
    await legeAuftragAn({ von: "teftis", an: "geschaeftsfuehrung", titel: `Teftiş-Schnellcheck ${tag}: ${kritisch.length} kritisch`, inhalt: kritisch.map((b) => `- ${b.titel}`).join("\n") || "Alles im grünen Bereich.", quelle: `teftis-schnell:${tag}` }).catch(() => null)
    return { ergebnis: `Schnellcheck: ${kritisch.length} kritisch`, anzahl: kritisch.length }
  }

  const { punkte, befunde } = await pruefeAlles(q)
  const trend = letzter ? punkte - letzter.punkte : null
  const sortiert = [...befunde].sort((a, b) => ABZUG[b.schwere] - ABZUG[a.schwere])

  /* Jeder Befund an die zuständige Abteilung – intern, ohne Emin. */
  for (const b of sortiert)
    await legeAuftragAn({
      von: "teftis",
      an: b.an,
      titel: `Teftiş: ${b.titel}`.slice(0, 160),
      inhalt: `Bereich ${b.bereich} · ${b.schwere}\n${b.titel}\n\nBitte beheben, bis zur nächsten Teftiş in ${ZYKLUS_TAGE} Tagen. Teoman prüft dann erneut.`,
      quelle: `teftis:${tag}:${b.code}`,
    }).catch(() => null)

  /* Die Hamle: ein mutiger, legaler Schritt, der Schwung bringt – aus echten Daten, nichts erfunden. */
  const [chancen, kunden] = await Promise.all([
    q(`SELECT g.name, o.title, o.status FROM opportunities o JOIN organisations g ON g.id = o.organisation_id WHERE o.status NOT IN ('won','lost') ORDER BY o.updated_at DESC LIMIT 12`, []).catch(() => []) as Promise<{ name: string; title: string; status: string }[]>,
    q(`SELECT g.name FROM organisations g WHERE g.lifecycle = 'kunde' ORDER BY g.updated_at DESC NULLS LAST LIMIT 12`, []).catch(() => []) as Promise<{ name: string }[]>,
  ])
  let hamle = null as Hamle | null
  try {
    const { text } = await generateText({
      model: MODELL,
      prompt: `Du bist Teoman, der Teftiş (unabhängige Revision) von creaDIG (KI). Emin ist der einzige Mensch und pflegt die Kundenbeziehungen selbst. Er wünscht sich alle paar Tage eine „Hamle“: EINEN mutigen, konkreten Schritt für die nächsten 3–7 Tage, der die Firma spürbar nach vorn bringt und Schwung gibt.
Regeln: nur aus den echten Daten unten, nichts erfinden; legal; keine Kaltakquise, keine Werbe-Mails ohne Einwilligung; kein Angebot oder keine Rechnung vor einem Gespräch; kein Angstverkauf. Kein Feature-Stopp, keine Belehrung über Verkauf.
Zuständiger "agent" aus: vertrieb, partner, kundenbetreuung, redaktion, marketing, angebot, entwicklung, webseite, kapital, international, produkt, koordinator. brauchtEmin = true, wenn Emin persönlich etwas tun muss (Gespräch, Freigabe, Geld).

Teftiş heute: ${punkte}/100 (Note ${note(punkte)})${trend === null ? "" : `, Trend ${trend >= 0 ? "+" : ""}${trend}`}.
Wichtigste Befunde: ${sortiert.slice(0, 8).map((b) => b.titel).join(" | ") || "keine"}
Offene Chancen: ${chancen.map((c) => `${c.name} (${c.status}): ${c.title}`).join(" | ") || "keine"}
Kunden: ${kunden.map((k) => k.name).join(", ") || "keine"}

Antworte nur mit JSON: {"titel": string, "warum": string, "schritte": [string, string, string], "agent": string, "brauchtEmin": boolean}`,
    })
    const h = json<Hamle>(text)
    if (h?.titel) hamle = { ...h, schritte: Array.isArray(h.schritte) ? h.schritte : [] }
  } catch (e) {
    console.error("[teftis] hamle", e instanceof Error ? e.message : e)
  }

  const id = `tft-${Date.now().toString(36)}`
  await q(`INSERT INTO teftis_berichte (id, punkte, befunde, hamle) VALUES ($1, $2, $3::jsonb, $4)`, [id, punkte, JSON.stringify(befunde), hamle ? JSON.stringify(hamle) : null])

  if (hamle?.titel && hamle.brauchtEmin)
    await legeFreigabeAn({
      art: "aufgabe",
      titel: `Hamle: ${hamle.titel}`.slice(0, 160),
      inhalt: `${hamle.warum}\n\n${hamle.schritte.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
      quelle: `hamle:${tag}`,
      agent: "teftis",
      extra: { fuerEmin: true, warum: `Teftiş ${tag}` },
    }).catch(() => null)
  else if (hamle?.titel) {
    const { abteilungVonAgent } = await import("@/lib/zentrale/abteilungen")
    await legeAuftragAn({ von: "teftis", an: abteilungVonAgent(hamle.agent)?.id ?? "geschaeftsfuehrung", titel: `Hamle: ${hamle.titel}`.slice(0, 160), inhalt: `${hamle.warum}\n\n${hamle.schritte.map((s, i) => `${i + 1}. ${s}`).join("\n")}`, quelle: `hamle:${tag}` }).catch(() => null)
  }

  const bereiche = [...new Set(befunde.map((b) => b.bereich))]
  const kaesten: Uebernahme[] = [
    {
      agent: "teftis",
      was: `Note ${note(punkte)} · ${punkte}/100${trend === null ? "" : ` (${trend >= 0 ? "+" : ""}${trend} seit letzter Teftiş)`} · ${befunde.length} Befunde${bereiche.length ? ` in ${bereiche.join(", ")}` : ""} – alle an die Zuständigen verteilt`,
      stand: "erledigt",
    },
    ...sortiert.filter((b) => b.schwere !== "hinweis").slice(0, 4).map((b) => ({ agent: b.agent, was: b.titel, stand: "laeuft" as const, bis: `nächste Teftiş (${ZYKLUS_TAGE} Tage)` })),
    ...(hamle?.titel ? [{ agent: hamle.brauchtEmin ? "teftis" : hamle.agent, was: `Hamle: ${hamle.titel} – ${hamle.schritte[0] ?? ""}`, stand: (hamle.brauchtEmin ? "wartet" : "laeuft") as Uebernahme["stand"], bis: hamle.brauchtEmin ? "dein Schritt (Karte liegt bereit)" : "diese Woche" }] : []),
  ]
  await speichereNachricht("assistant", `Teoman (Teftiş) hat die ganze Firma geprüft – Website, alle KI-Mitarbeiter, Zusagen im Chat, Zusammenarbeit, Chancen und Daten.`, kaesten)
  await legeAuftragAn({
    von: "teftis",
    an: "geschaeftsfuehrung",
    titel: `Teftiş ${tag}: ${punkte}/100 (${note(punkte)})`,
    inhalt: sortiert.map((b) => `- [${b.schwere}] ${b.bereich}: ${b.titel}`).join("\n") || "Keine Befunde.",
    quelle: `teftis:${tag}`,
  }).catch(() => null)

  return { ergebnis: `Teftiş ${punkte}/100 (${note(punkte)}), ${befunde.length} Befunde verteilt${hamle?.titel ? `, Hamle: ${hamle.titel}` : ""}`, anzahl: befunde.length + (hamle ? 1 : 0) }
}
