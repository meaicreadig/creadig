import "server-only"

import { assistentDb } from "@/lib/assistent/store"
import { AGENTEN } from "@/lib/assistent/truppe"
import { ABTEILUNGEN, abteilungVonAgent } from "@/lib/zentrale/abteilungen"

import { briefBereit } from "@/lib/brief/letterxpress"

import { pausierteAgenten } from "./steuerung"

const BRIEF_AGENTEN = new Set(["jaeger", "partner"])

/**
 * SONUÇ KARNESİ — die Ergebnis-Karne (Katman 3, 24.10.2026).
 *
 * Die alte Karne fragte „lief er, wie viel hat er erzeugt“. Diese fragt, was
 * daraus wurde – entlang der Kette einer großen Firma:
 *
 *   Kontakt → Antwort → Anfrage (Lead) → Termin → Angebot → Gewonnen (€)
 *
 * ZUORDNUNG: Jede Berührung trägt ihren Agenten – eine freigegebene Mail oder
 * ein Brief (Empfänger bzw. orgId), eine Chance mit `source = <agent>`, eine
 * Anfrage mit utm-Herkunft (LinkedIn-Beiträge tragen seit heute utm, siehe
 * lib/ergebnis/links.ts). Was bei dieser Firma bzw. Person NACH der Berührung
 * passiert, zählt für den Agenten. Berührten zwei Agenten dieselbe Firma,
 * zählt das Ergebnis für beide (Beitrag) – die Firmenzeile oben zählt jedes
 * Ergebnis genau einmal.
 *
 * URTEIL nach Klasse:
 *   umsatz  30 Tage: Ergebnis ja → wirkt; sonst schärfen bzw. Vorschlag
 *           „pausieren/zusammenlegen“ an Emin.
 *   chance  Radare mit langem Zyklus (Golf, Kapital, International): 90 Tage,
 *           NIE Pausen-Vorschlag – nur schärfen (Owner 24.10.: keine Chance
 *           verpassen, feedback-chancen-nicht-drosseln).
 *   stab    interne Zulieferer: Ergebnis = Aufträge, die andere aus ihrer
 *           Arbeit erledigt haben (Pässe).
 *   schutz  Recht, Sicherheit, Lage, Qualität, Koordination …: wirken durch
 *           Verhindern, werden nicht nach Ergebnis beurteilt.
 * Wer jünger ist als sein Fenster, ist „im Anlauf“ – kein Urteil vor Ablauf.
 */

export type Klasse = "umsatz" | "chance" | "stab" | "schutz"
export type Urteil = "wirkt" | "anlauf" | "wartet" | "schaerfen" | "vorschlag" | "pausiert" | "schutz" | "kanal"

export type Kette = { kontakte: number; antworten: number; leads: number; termine: number; angebote: number; chancen: number; gewonnen: number; eur: number }
export type AgentKarne = {
  agent: string
  name: string
  abteilung: string | null
  klasse: Klasse
  fenster: number
  alterTage: number | null
  kette: Kette
  paesse: number
  offen: number
  urteil: Urteil
  grund: string
  uebernimmt: string | null
  urteilAb: string | null
}
export type AbteilungKarne = { id: string; name: string; kette: Kette }
export type FirmenKette = Kette & { bezahltEur: number; tage: number }
export type Karne = { firma: FirmenKette; abteilungen: AbteilungKarne[]; agenten: AgentKarne[]; stand: string }

const KLASSE: Record<string, Klasse> = {
  jaeger: "umsatz",
  vertrieb: "umsatz",
  partner: "umsatz",
  kundenbetreuung: "umsatz",
  kundenservice: "umsatz",
  angebot: "umsatz",
  redaktion: "umsatz",
  marketing: "umsatz",
  finanz: "umsatz",
  golf: "chance",
  kapital: "chance",
  international: "chance",
  rat: "stab",
  projekte: "stab",
  webseite: "stab",
  forschung: "stab",
  produkt: "stab",
  entwicklung: "stab",
  einkauf: "stab",
  ideen: "stab",
  teftis: "stab",
}
export const klasseVon = (agent: string): Klasse => KLASSE[agent] ?? "schutz"
const FENSTER: Record<Klasse, number> = { umsatz: 30, chance: 90, stab: 30, schutz: 30 }
/** Unter so vielen Kontakten ist „keine Antwort“ noch kein Urteil über den Agenten. */
const MIN_KONTAKTE = 8
const TAG = 86_400_000

const leer = (): Kette => ({ kontakte: 0, antworten: 0, leads: 0, termine: 0, angebote: 0, chancen: 0, gewonnen: 0, eur: 0 })
const ergebnisse = (k: Kette) => k.antworten + k.leads + k.termine + k.angebote + k.chancen + k.gewonnen

type Ereignis = { agent: string; typ: keyof Kette | "eur_only"; ref: string; eur: number; zeit: string | Date }

/**
 * Alle Ergebnis-Ereignisse der letzten 90 Tage mit ihrem Agenten.
 * Berührungen reichen 150 Tage zurück, damit ein Termin heute auch einer
 * Mail von vor drei Monaten gutgeschrieben wird.
 */
const EREIGNISSE = `
WITH b AS (
  SELECT f.agent, 'f:' || f.id AS ref,
         coalesce(f.extra->>'orgId', c.organisation_id) AS org,
         lower(nullif(trim(f.empfaenger), '')) AS email,
         coalesce((f.extra->>'gesendetAt')::timestamptz, f.created_at) AS t0,
         'kontakt' AS art,
         CASE WHEN f.extra ? 'antwortAt' AND coalesce(f.extra->>'antwortArt', '') <> 'nein' THEN (f.extra->>'antwortAt')::timestamptz END AS antwort_at
    FROM assistent_freigaben f
    LEFT JOIN LATERAL (SELECT organisation_id FROM contacts WHERE email_normalised = lower(trim(f.empfaenger)) LIMIT 1) c ON true
   WHERE f.status = 'freigegeben' AND f.art IN ('mail','brief') AND f.agent IS NOT NULL
     AND (f.extra ? 'gesendetAt' OR f.extra ? 'briefId')
     AND coalesce((f.extra->>'gesendetAt')::timestamptz, f.created_at) > now() - interval '150 days'
  UNION ALL
  SELECT o.source, 'o:' || o.id, o.organisation_id, NULL, o.created_at, 'chance', NULL
    FROM opportunities o
   WHERE o.source = ANY($1::text[]) AND o.created_at > now() - interval '150 days'
  UNION ALL
  SELECT CASE WHEN l.utm_campaign = ANY($1::text[]) THEN l.utm_campaign
              WHEN l.utm_source ILIKE '%linkedin%' THEN 'redaktion'
              WHEN nullif(l.utm_source, '') IS NOT NULL THEN 'marketing'
              ELSE 'website' END,
         'l:' || l.id,
         coalesce(l.organisation_id, (SELECT organisation_id FROM contacts WHERE id = l.contact_id)),
         lower(l.email), l.created_at, 'lead', NULL
    FROM leads l
   WHERE l.excluded_reason IS NULL AND l.duplicate_of IS NULL AND l.created_at > now() - interval '150 days'
)
SELECT agent, 'kontakte' AS typ, ref, 0 AS eur, t0 AS zeit FROM b WHERE art = 'kontakt' AND t0 > now() - interval '90 days'
UNION ALL SELECT agent, 'antworten', ref, 0, antwort_at FROM b WHERE antwort_at > now() - interval '90 days'
UNION ALL SELECT agent, 'leads', ref, 0, t0 FROM b WHERE art = 'lead' AND t0 > now() - interval '90 days'
UNION ALL
SELECT DISTINCT b.agent, 'chancen', 'o:' || o.id, 0, o.updated_at
  FROM b JOIN opportunities o ON 'o:' || o.id = b.ref
 WHERE o.status IN ('qualified','discovery','audit','proposal','negotiation','won') AND o.updated_at > now() - interval '90 days'
UNION ALL
SELECT DISTINCT b.agent, 'termine', 'a:' || a.id, 0, a.created_at
  FROM b JOIN appointments a ON (a.organisation_id = b.org OR lower(a.guest_email) = b.email)
 WHERE a.cancelled_at IS NULL AND a.created_at >= b.t0 AND a.created_at > now() - interval '90 days'
UNION ALL
SELECT DISTINCT b.agent, 'angebote', 'd:' || d.id, 0, d.versendet_at
  FROM b JOIN opportunities o ON o.organisation_id = b.org JOIN fin_dokumente d ON d.opportunity_id = o.id
 WHERE d.art = 'angebot' AND d.versendet_at >= b.t0 AND d.versendet_at > now() - interval '90 days'
UNION ALL
SELECT DISTINCT b.agent, 'gewonnen', 'o:' || o.id, coalesce(o.estimated_value, 0)::int, o.updated_at
  FROM b JOIN opportunities o ON o.organisation_id = b.org
 WHERE o.status = 'won' AND o.updated_at >= b.t0 AND o.updated_at > now() - interval '90 days'
UNION ALL
SELECT 'angebot', 'angebote', 'd:' || d.id, 0, d.versendet_at
  FROM fin_dokumente d
 WHERE d.art = 'angebot' AND d.versendet_at > now() - interval '90 days'
   AND EXISTS (SELECT 1 FROM fin_dokument_verlauf v WHERE v.dokument_id = d.id AND v.aktion = 'ki-positionen')
UNION ALL
SELECT 'finanz', 'eur_only', 'r:' || d.id, coalesce((d.summen->>'bruttoCent')::bigint, 0) / 100, d.bezahlt_am
  FROM fin_dokumente d
 WHERE d.art = 'rechnung' AND d.bezahlt_am > now() - interval '90 days' AND (d.mahnstufe > 0 OR d.nachgefasst_at IS NOT NULL)
UNION ALL
SELECT 'kapital', CASE WHEN f.extra->'antrag'->>'stufe' = 'bewilligt' THEN 'gewonnen' ELSE 'angebote' END, 'k:' || f.id, 0,
       coalesce((f.extra->'antrag'->>'seit')::timestamptz, f.created_at)
  FROM assistent_freigaben f
 WHERE f.art = 'kapital' AND f.extra->'antrag'->>'stufe' IN ('eingereicht','bewilligt')
   AND coalesce((f.extra->'antrag'->>'seit')::timestamptz, f.created_at) > now() - interval '90 days'`

const FIRMA = `
SELECT (SELECT count(*) FROM assistent_freigaben WHERE status = 'freigegeben' AND art IN ('mail','brief')
          AND coalesce((extra->>'gesendetAt')::timestamptz, created_at) > now() - make_interval(days => $1)
          AND (extra ? 'gesendetAt' OR extra ? 'briefId'))::int AS kontakte,
       (SELECT count(*) FROM assistent_freigaben WHERE extra ? 'antwortAt' AND coalesce(extra->>'antwortArt','') <> 'nein'
          AND (extra->>'antwortAt')::timestamptz > now() - make_interval(days => $1))::int AS antworten,
       (SELECT count(*) FROM leads WHERE excluded_reason IS NULL AND duplicate_of IS NULL AND created_at > now() - make_interval(days => $1))::int AS leads,
       (SELECT count(*) FROM appointments WHERE cancelled_at IS NULL AND created_at > now() - make_interval(days => $1))::int AS termine,
       (SELECT count(*) FROM fin_dokumente WHERE art = 'angebot' AND versendet_at > now() - make_interval(days => $1))::int AS angebote,
       (SELECT count(*) FROM opportunities WHERE created_at > now() - make_interval(days => $1))::int AS chancen,
       (SELECT count(*) FROM opportunities WHERE status = 'won' AND updated_at > now() - make_interval(days => $1))::int AS gewonnen,
       (SELECT coalesce(sum(estimated_value), 0) FROM opportunities WHERE status = 'won' AND updated_at > now() - make_interval(days => $1))::int AS eur,
       (SELECT coalesce(sum((summen->>'bruttoCent')::bigint), 0) / 100 FROM fin_dokumente WHERE art = 'rechnung' AND bezahlt_am > now() - make_interval(days => $1))::int AS bezahlt_eur`

function kette(evs: Ereignis[], seit: number): Kette {
  const k = leer()
  const gesehen = new Set<string>()
  for (const e of evs) {
    if (new Date(e.zeit).getTime() < seit) continue
    const schluessel = `${e.typ}:${e.ref}`
    if (gesehen.has(schluessel)) continue
    gesehen.add(schluessel)
    if (e.typ === "eur_only") k.eur += Number(e.eur) || 0
    else {
      k[e.typ] += 1
      if (e.typ === "gewonnen") k.eur += Number(e.eur) || 0
    }
  }
  return k
}

export async function ladeKarne(tage = 30): Promise<Karne | null> {
  const q = await assistentDb()
  if (!q) return null
  const keys = AGENTEN.map((a) => a.key as string)
  const [evs, firma, alter, paesse, offen, pausiert] = await Promise.all([
    q(EREIGNISSE, [keys]) as Promise<Ereignis[]>,
    q(FIRMA, [tage]) as Promise<(Kette & { bezahlt_eur: number })[]>,
    q(`SELECT agent, min(created_at) AS erst FROM assistent_laeufe GROUP BY agent`, []) as Promise<{ agent: string; erst: string }[]>,
    q(
      `SELECT von, created_at FROM firma_auftraege WHERE created_at > now() - interval '90 days' AND status IN ('erledigt','bei_emin')`,
      [],
    ).catch(() => []) as Promise<{ von: string; created_at: string }[]>,
    q(
      `SELECT agent, count(*)::int AS n FROM assistent_freigaben WHERE status = 'offen' AND art IN ('mail','brief','linkedin','termin','kapital') GROUP BY agent`,
      [],
    ) as Promise<{ agent: string; n: number }[]>,
    pausierteAgenten().catch(() => new Set<string>()),
  ])
  const jetzt = Date.now()
  const erstLauf = new Map(alter.map((r) => [r.agent, new Date(r.erst).getTime()]))
  const offenJe = new Map(offen.map((r) => [r.agent, r.n]))
  const proAgent = new Map<string, Ereignis[]>()
  for (const e of evs) proAgent.set(e.agent, [...(proAgent.get(e.agent) ?? []), e])

  const agenten: AgentKarne[] = AGENTEN.map((a) => {
    const klasse = klasseVon(a.key)
    const fenster = FENSTER[klasse]
    const k = kette(proAgent.get(a.key) ?? [], jetzt - fenster * TAG)
    const abt = abteilungVonAgent(a.key)
    const paesseN = paesse.filter((p) => (p.von === a.key || p.von === abt?.id) && new Date(p.created_at).getTime() > jetzt - fenster * TAG).length
    const erst = erstLauf.get(a.key) ?? null
    const alterTage = erst === null ? null : Math.floor((jetzt - erst) / TAG)
    const offenN = offenJe.get(a.key) ?? 0
    const basis = { agent: a.key, name: a.name, abteilung: abt?.id ?? null, klasse, fenster, alterTage, kette: k, paesse: paesseN, offen: offenN, uebernimmt: null as string | null }
    const ab = erst === null ? null : new Date(erst + fenster * TAG).toISOString()

    if (pausiert.has(a.key)) return { ...basis, urteil: "pausiert", grund: "Von Emin pausiert – läuft nicht.", urteilAb: null }
    /* Katman 6: Ohne Briefkanal kann ein Brief-Agent nicht wirken – kein Urteil über ihn, sondern über den fehlenden Kanal. */
    if (BRIEF_AGENTEN.has(a.key) && !briefBereit())
      return { ...basis, urteil: "kanal", grund: "Briefkanal (LetterXpress) nicht eingerichtet – Zielfirmen werden gesammelt, Briefe warten im Firmenprofil.", urteilAb: null }
    if (klasse === "schutz") return { ...basis, urteil: "schutz", grund: "Wirkt durch Verhindern – wird an Stabilität gemessen, nicht am Umsatz.", urteilAb: null }
    const erzielt = klasse === "stab" ? paesseN : ergebnisse(k) + (k.eur > 0 ? 1 : 0)
    if (erzielt > 0) return { ...basis, urteil: "wirkt", grund: klasse === "stab" ? `${paesseN} Aufträge aus seiner Arbeit erledigt.` : "Hat messbare Ergebnisse erzeugt.", urteilAb: null }
    if (alterTage === null || alterTage < fenster)
      return { ...basis, urteil: "anlauf", grund: alterTage === null ? "Noch nie gelaufen." : `Im Anlauf (${alterTage} von ${fenster} Tagen).`, urteilAb: ab }
    if (offenN > 0 && k.kontakte === 0)
      return { ...basis, urteil: "wartet", grund: `${offenN} fertige Vorlagen warten auf deine Entscheidung – ohne Freigabe kann er nicht wirken.`, urteilAb: null }
    if (klasse === "chance") return { ...basis, urteil: "schaerfen", grund: `${fenster} Tage ohne Ergebnis. Radar bleibt an (keine Chance verpassen) – Suchauftrag schärfen.`, urteilAb: null }
    if (klasse === "umsatz" && k.kontakte > 0 && k.kontakte < MIN_KONTAKTE)
      return { ...basis, urteil: "schaerfen", grund: `${k.kontakte} Kontakte, noch keine Reaktion – zu wenig für ein Urteil; Zielgruppe und Text schärfen.`, urteilAb: null }
    return {
      ...basis,
      urteil: "vorschlag",
      grund:
        klasse === "umsatz" && k.kontakte >= MIN_KONTAKTE
          ? `${k.kontakte} Kontakte in ${fenster} Tagen, kein einziges Ergebnis.`
          : klasse === "stab"
            ? `${fenster} Tage: niemand hat aus seiner Arbeit etwas gemacht.`
            : `${fenster} Tage ohne Kontakt und ohne Ergebnis.`,
      urteilAb: null,
    }
  })

  /* Wer übernimmt beim Zusammenlegen? Ein wirkender Agent derselben Abteilung. */
  for (const a of agenten) {
    if (a.urteil !== "vorschlag") continue
    a.uebernimmt = agenten.find((b) => b.agent !== a.agent && b.abteilung === a.abteilung && b.urteil === "wirkt")?.agent ?? null
  }

  const abteilungen: AbteilungKarne[] = ABTEILUNGEN.map((abt) => {
    const evsAbt = abt.agenten.flatMap((key) => proAgent.get(key) ?? [])
    return { id: abt.id, name: abt.name.de, kette: kette(evsAbt, jetzt - tage * TAG) }
  }).filter((a) => ergebnisse(a.kette) + a.kette.kontakte + a.kette.eur > 0)

  /* Anfragen ohne Agent (direkt über die Website) sind ein eigener Kanal. */
  const web = kette(proAgent.get("website") ?? [], jetzt - tage * TAG)
  if (ergebnisse(web) > 0) abteilungen.push({ id: "website", name: "Website (direkt)", kette: web })

  const f = firma[0]
  return {
    firma: { ...leer(), ...f, bezahltEur: f?.bezahlt_eur ?? 0, tage },
    abteilungen,
    agenten,
    stand: new Date().toISOString(),
  }
}

export const URTEIL_TEXT: Record<Urteil, { de: string; tr: string }> = {
  wirkt: { de: "wirkt", tr: "sonuç veriyor" },
  anlauf: { de: "im Anlauf", tr: "ısınma döneminde" },
  wartet: { de: "wartet auf dich", tr: "senin kararını bekliyor" },
  schaerfen: { de: "schärfen", tr: "keskinleştir" },
  vorschlag: { de: "pausieren/zusammenlegen?", tr: "durdur/birleştir?" },
  pausiert: { de: "pausiert", tr: "durduruldu" },
  kanal: { de: "Kanal fehlt", tr: "kanal eksik" },
  schutz: { de: "Schutzfunktion", tr: "koruma görevi" },
}
