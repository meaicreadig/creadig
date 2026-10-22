import "server-only"

import { assistentDb } from "@/lib/assistent/store"
import { AGENTEN } from "@/lib/assistent/truppe"
import { ABTEILUNGEN, type Abteilung } from "@/lib/zentrale/abteilungen"

const agentName = (key: string) => AGENTEN.find((a) => a.key === key)?.name ?? key

/**
 * LEISTUNGSBILD DER KI-FIRMA — wie jede Abteilung arbeitet, wie stabil,
 * wie gut sie mit den anderen zusammenspielt und wo es klemmt.
 *
 * Gemessen wird nur, was in der Datenbank steht (Läufe, Aufträge, Freigaben).
 * Die „Arbeitsstunden“ sind ehrlich zweigeteilt: echte Rechenzeit (gemessen)
 * und Menschen-Äquivalent (Ergebnisse × übliche Minuten je Ergebnis, offen
 * ausgewiesen in MINUTEN_JE_ERGEBNIS).
 */

export const ZEITRAUM_TAGE = 14

/** Wie lange ein Mensch für ein Ergebnis dieses Agenten bräuchte (Schätzung). */
export const MINUTEN_JE_ERGEBNIS: Record<string, number> = {
  koordinator: 20,
  koordination: 20,
  recht: 10,
  marketing: 45,
  rat: 60,
  lage: 20,
  vertrieb: 15,
  jaeger: 25,
  motor: 10,
  messen: 20,
  kapital: 45,
  golf: 40,
  redaktion: 60,
  bulletin: 12,
  webseite: 8,
  finanz: 15,
  projekte: 20,
  puls: 10,
}

/** Agenten-Schlüssel, die keinen eigenen Eintrag in ABTEILUNGEN haben. */
const ZUSATZ: Record<string, string> = { koordination: "geschaeftsfuehrung", puls: "geschaeftsfuehrung" }

export type EngpassArt = "fehler" | "still" | "auftrag_haengt" | "wartet_auf_dich"
export type Engpass = {
  id: string
  abteilung: string
  art: EngpassArt
  schwere: "achtung" | "stoerung"
  text: { de: string; tr: string }
  agent?: string
  seitStunden: number
}

export type AbteilungsLeistung = {
  id: string
  name: { de: string; tr: string }
  besetzt: boolean
  agenten: string[]
  laeufe: number
  fehler: number
  ergebnisse: number
  /** Gemessene Rechenzeit je Tag in Minuten (null = noch keine Messung). */
  rechenMinutenTag: number | null
  /** Menschen-Äquivalent je Tag in Stunden. */
  aequivalentStundenTag: number
  /** 0..1 – Anteil erfolgreicher Läufe. */
  stabilitaet: number | null
  /** 0..1 – lief der Agent so oft wie sein Takt verlangt. */
  taktTreue: number | null
  auftraegeGegeben: number
  auftraegeErhalten: number
  auftraegeErledigt: number
  /** 0..1 – erledigte von erhaltenen Aufträgen. */
  zusammenarbeit: number | null
  /** Eigeninitiative je Tag: gegebene Aufträge + vorgeschlagene Freigaben. */
  proaktivTag: number
  wartetAufDich: number
  letzteAktivitaet: string | null
  /** 0..100 – Gesamtnote aus den verfügbaren Werten. */
  note: number | null
  engpaesse: Engpass[]
}

export type Fluss = { von: string; an: string; anzahl: number }

export type FirmenLeistung = {
  tage: number
  abteilungen: AbteilungsLeistung[]
  engpaesse: Engpass[]
  fluesse: Fluss[]
  summe: {
    aequivalentStundenTag: number
    rechenMinutenTag: number | null
    ergebnisse: number
    laeufe: number
    stabilitaet: number | null
    besetzt: number
    gesamt: number
    note: number | null
  }
  messungSeit: string | null
}

function abteilungVon(agent: string): Abteilung | null {
  const zusatz = ZUSATZ[agent]
  if (zusatz) return ABTEILUNGEN.find((a) => a.id === zusatz) ?? null
  return ABTEILUNGEN.find((a) => a.agenten.includes(agent)) ?? null
}

const stunden = (iso: string | Date) => (Date.now() - new Date(iso).getTime()) / 3600000
const iso = (d: string | Date) => new Date(d).toISOString()

export async function berechneLeistung(tage = ZEITRAUM_TAGE): Promise<FirmenLeistung | null> {
  const q = await assistentDb()
  if (!q) return null

  const [laeufe, auftraege, freigaben, letzte] = await Promise.all([
    q(
      `SELECT agent,
              count(*)::int AS laeufe,
              count(*) FILTER (WHERE fehler IS NOT NULL)::int AS fehler,
              coalesce(sum(anzahl), 0)::int AS ergebnisse,
              sum(dauer_ms)::bigint AS dauer,
              min(created_at) FILTER (WHERE dauer_ms IS NOT NULL) AS gemessen_seit,
              count(DISTINCT (created_at AT TIME ZONE 'Europe/Berlin')::date)::int AS tage,
              max(created_at) AS zuletzt
         FROM assistent_laeufe
        WHERE created_at > now() - ($1 || ' days')::interval
        GROUP BY agent`,
      [String(tage)],
    ) as Promise<
      {
        agent: string
        laeufe: number
        fehler: number
        ergebnisse: number
        dauer: string | null
        gemessen_seit: string | null
        tage: number
        zuletzt: string
      }[]
    >,
    q(
      `SELECT von, an, status, versuche, titel, id, created_at
         FROM firma_auftraege
        WHERE created_at > now() - ($1 || ' days')::interval`,
      [String(tage)],
    ).catch(() => []) as Promise<
      { von: string; an: string; status: string; versuche: number; titel: string; id: string; created_at: string }[]
    >,
    q(
      `SELECT agent, status, art, titel, id, created_at
         FROM assistent_freigaben
        WHERE created_at > now() - ($1 || ' days')::interval
           OR status = 'offen'`,
      [String(tage)],
    ) as Promise<{ agent: string | null; status: string; art: string; titel: string; id: string; created_at: string }[]>,
    q(
      `SELECT DISTINCT ON (agent) agent, fehler, ergebnis, created_at
         FROM assistent_laeufe ORDER BY agent, created_at DESC`,
      [],
    ) as Promise<{ agent: string; fehler: string | null; ergebnis: string; created_at: string }[]>,
  ])

  const takt = new Map(AGENTEN.map((a) => [a.key as string, a.takt]))
  const letzteJe = new Map(letzte.map((l) => [l.agent, l]))
  const koordinationsId = "geschaeftsfuehrung"
  const abtId = (x: string) => (x === "koordination" || x === "emin" ? koordinationsId : x)

  const ergebnis: AbteilungsLeistung[] = ABTEILUNGEN.map((abt) => {
    const eigene = laeufe.filter((l) => abteilungVon(l.agent)?.id === abt.id)
    const sum = (f: (l: (typeof eigene)[number]) => number) => eigene.reduce((s, l) => s + f(l), 0)
    const laeufeN = sum((l) => l.laeufe)
    const fehlerN = sum((l) => l.fehler)
    const ergebnisse = sum((l) => l.ergebnisse)
    const gemessen = eigene.filter((l) => l.dauer != null)
    const rechenMs = gemessen.reduce((s, l) => s + Number(l.dauer ?? 0), 0)
    const messTage = gemessen.length
      ? Math.max(1, Math.min(tage, Math.ceil(Math.max(...gemessen.map((l) => stunden(l.gemessen_seit ?? l.zuletzt))) / 24)))
      : 0
    const aequivalentMin = eigene.reduce((s, l) => s + l.ergebnisse * (MINUTEN_JE_ERGEBNIS[l.agent] ?? 15), 0)

    let soll = 0
    let ist = 0
    for (const key of abt.agenten) {
      const t = takt.get(key)
      if (!t) continue
      soll += t === "taeglich" ? tage : Math.max(1, Math.floor(tage / 7))
      ist += Math.min(t === "taeglich" ? tage : Math.max(1, Math.floor(tage / 7)), laeufe.find((l) => l.agent === key)?.tage ?? 0)
    }

    const erhalten = auftraege.filter((a) => abtId(a.an) === abt.id && abtId(a.von) !== abt.id)
    const gegeben = auftraege.filter((a) => abtId(a.von) === abt.id && abtId(a.an) !== abt.id)
    const erledigt = erhalten.filter((a) => a.status === "erledigt" || a.status === "weitergegeben")
    const eigeneFreigaben = freigaben.filter((f) => f.agent && abteilungVon(f.agent)?.id === abt.id)
    const vorgeschlagen = eigeneFreigaben.filter((f) => stunden(f.created_at) <= tage * 24).length
    const wartend = eigeneFreigaben.filter(
      (f) => f.status === "offen" && f.art !== "aufgabe" && f.art !== "notiz",
    )

    const engpaesse: Engpass[] = []
    for (const key of abt.agenten) {
      const l = letzteJe.get(key)
      const t = takt.get(key)
      if (!t) continue
      if (l?.fehler) {
        engpaesse.push({
          id: `fehler:${key}`,
          abteilung: abt.id,
          art: "fehler",
          schwere: "stoerung",
          agent: key,
          seitStunden: stunden(l.created_at),
          text: { de: `${key}: letzter Lauf gescheitert – ${l.fehler}`, tr: `${key}: son çalışma başarısız – ${l.fehler}` },
        })
      } else {
        const grenze = t === "taeglich" ? 36 : 8 * 24
        const still = l ? stunden(l.created_at) : Infinity
        if (still > grenze) {
          engpaesse.push({
            id: `still:${key}`,
            abteilung: abt.id,
            art: "still",
            schwere: "achtung",
            agent: key,
            seitStunden: Number.isFinite(still) ? still : tage * 24,
            text: l
              ? { de: `${agentName(key)} ist seit ${Math.round(still)} Std. still`, tr: `${agentName(key)} ${Math.round(still)} saattir çalışmadı` }
              : { de: `${agentName(key)} ist noch nie gelaufen`, tr: `${agentName(key)} henüz hiç çalışmadı` },
          })
        }
      }
    }
    for (const a of auftraege) {
      if (abtId(a.an) !== abt.id || a.status !== "neu") continue
      const alt = stunden(a.created_at)
      if (alt < 24 && a.versuche < 3) continue
      engpaesse.push({
        id: `auftrag:${a.id}`,
        abteilung: abt.id,
        art: "auftrag_haengt",
        schwere: a.versuche >= 3 ? "stoerung" : "achtung",
        seitStunden: alt,
        text: {
          de: `Auftrag hängt seit ${Math.round(alt)} Std.: ${a.titel}`,
          tr: `İş ${Math.round(alt)} saattir bekliyor: ${a.titel}`,
        },
      })
    }
    for (const f of wartend) {
      const alt = stunden(f.created_at)
      if (alt < 48) continue
      engpaesse.push({
        id: `freigabe:${f.id}`,
        abteilung: abt.id,
        art: "wartet_auf_dich",
        schwere: "achtung",
        seitStunden: alt,
        text: {
          de: `Wartet seit ${Math.round(alt / 24)} Tagen auf deine Entscheidung: ${f.titel}`,
          tr: `${Math.round(alt / 24)} gündür kararını bekliyor: ${f.titel}`,
        },
      })
    }

    const stabilitaet = laeufeN ? (laeufeN - fehlerN) / laeufeN : null
    const taktTreue = soll ? ist / soll : null
    const zusammenarbeit = erhalten.length ? erledigt.length / erhalten.length : null
    const proaktivTag = (gegeben.length + vorgeschlagen) / tage

    const teile: [number, number][] = []
    if (stabilitaet != null) teile.push([stabilitaet, 35])
    if (taktTreue != null) teile.push([taktTreue, 35])
    if (zusammenarbeit != null) teile.push([zusammenarbeit, 15])
    if (abt.agenten.length) teile.push([Math.min(1, proaktivTag), 15])
    const gewicht = teile.reduce((s, [, g]) => s + g, 0)
    const note = gewicht ? Math.round((teile.reduce((s, [w, g]) => s + w * g, 0) / gewicht) * 100) : null

    const zuletzt = eigene.map((l) => l.zuletzt).sort().at(-1) ?? null

    return {
      id: abt.id,
      name: abt.name,
      besetzt: abt.agenten.length > 0,
      agenten: abt.agenten,
      laeufe: laeufeN,
      fehler: fehlerN,
      ergebnisse,
      rechenMinutenTag: messTage ? rechenMs / 60000 / messTage : null,
      aequivalentStundenTag: aequivalentMin / 60 / tage,
      stabilitaet,
      taktTreue,
      auftraegeGegeben: gegeben.length,
      auftraegeErhalten: erhalten.length,
      auftraegeErledigt: erledigt.length,
      zusammenarbeit,
      proaktivTag,
      wartetAufDich: wartend.length,
      letzteAktivitaet: zuletzt ? iso(zuletzt) : null,
      note,
      engpaesse: engpaesse.sort((a, b) => (a.schwere === b.schwere ? b.seitStunden - a.seitStunden : a.schwere === "stoerung" ? -1 : 1)),
    }
  })

  const flussMap = new Map<string, number>()
  for (const a of auftraege) {
    const von = abtId(a.von)
    const an = abtId(a.an)
    if (von === an) continue
    flussMap.set(`${von}>${an}`, (flussMap.get(`${von}>${an}`) ?? 0) + 1)
  }
  const fluesse = [...flussMap.entries()]
    .map(([k, anzahl]) => {
      const [von, an] = k.split(">")
      return { von, an, anzahl }
    })
    .sort((a, b) => b.anzahl - a.anzahl)

  const besetzte = ergebnis.filter((a) => a.besetzt)
  const laeufeGes = besetzte.reduce((s, a) => s + a.laeufe, 0)
  const fehlerGes = besetzte.reduce((s, a) => s + a.fehler, 0)
  const rechen = besetzte.filter((a) => a.rechenMinutenTag != null)
  const noten = besetzte.filter((a) => a.note != null)
  const seit = laeufe.map((l) => l.gemessen_seit).filter((x): x is string => !!x).sort()[0] ?? null

  return {
    tage,
    abteilungen: ergebnis,
    engpaesse: ergebnis
      .flatMap((a) => a.engpaesse)
      .sort((a, b) => (a.schwere === b.schwere ? b.seitStunden - a.seitStunden : a.schwere === "stoerung" ? -1 : 1)),
    fluesse,
    summe: {
      aequivalentStundenTag: besetzte.reduce((s, a) => s + a.aequivalentStundenTag, 0),
      rechenMinutenTag: rechen.length ? rechen.reduce((s, a) => s + (a.rechenMinutenTag ?? 0), 0) : null,
      ergebnisse: besetzte.reduce((s, a) => s + a.ergebnisse, 0),
      laeufe: laeufeGes,
      stabilitaet: laeufeGes ? (laeufeGes - fehlerGes) / laeufeGes : null,
      besetzt: besetzte.length,
      gesamt: ergebnis.length,
      note: noten.length ? Math.round(noten.reduce((s, a) => s + (a.note ?? 0), 0) / noten.length) : null,
    },
    messungSeit: seit ? iso(seit) : null,
  }
}

/** Kurzfassung für den Chief of Staff – damit er Engpässe aktiv auflöst. */
export function engpassBericht(l: FirmenLeistung): string {
  if (!l.engpaesse.length) return "(keine Engpässe)"
  return l.engpaesse
    .slice(0, 10)
    .map((e) => `- [${e.schwere}] ${e.abteilung}: ${e.text.de}`)
    .join("\n")
}
