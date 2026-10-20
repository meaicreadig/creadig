/**
 * Hauptsitz = das 3D-Gebäude der KI-Firma. 5 Etagen (Bereiche) × 3 Räume (Abteilungen).
 * Reine Funktion ohne Server-Import: macht aus Organigramm + Live-Netz das,
 * was Szene und Seitenpanel zeigen. Etage 0 = Erdgeschoss (Fundament), 4 = Leitung.
 */
import { ABTEILUNGEN, BEREICHE, type BereichId, type Besetzung } from "@/lib/zentrale/abteilungen"
import { KNOTEN, type KnotenId, type Sprache } from "@/lib/zentrale/netz-karte"
import type { NetzLage, Zustand } from "@/lib/zentrale/netz"

export const ETAGEN_FOLGE: BereichId[] = ["verwaltung", "betrieb", "technik", "markt", "leitung"]

const AGENT_NAMEN: Record<string, Record<Sprache, string>> = {
  rat: { de: "Beirat", tr: "Yönetim kurulu" },
  lage: { de: "Lage", tr: "Durum" },
  vertrieb: { de: "Vertrieb", tr: "Satış" },
  jaeger: { de: "Kunden-Jäger", tr: "Müşteri avcısı" },
  messen: { de: "Messen", tr: "Fuarlar" },
  kapital: { de: "Kapital", tr: "Sermaye" },
  redaktion: { de: "Redaktion", tr: "Editörlük" },
  motor: { de: "Motor", tr: "Motor" },
}

const RANG: Record<Zustand, number> = { ruhig: 0, aktiv: 1, achtung: 2, stoerung: 3 }

export type Raum = {
  id: string
  etage: number
  spalte: number
  name: string
  aufgabe: string
  besetzung: Besetzung
  zustand: Zustand
  wert: string
  zeile: string
  punkte: string[]
  agenten: string[]
  wege: { label: string; href: string }[]
}

export type Etage = { index: number; bereich: BereichId; name: string; zustand: Zustand }

export function bauHauptsitz(netz: NetzLage, sprache: Sprache, istOwner: boolean): { etagen: Etage[]; raeume: Raum[] } {
  const erlaubt = new Set(KNOTEN.filter((k) => !k.nurOwner || istOwner).map((k) => k.id))
  const raeume: Raum[] = []

  ETAGEN_FOLGE.forEach((bereich, etage) => {
    ABTEILUNGEN.filter((a) => a.bereich === bereich).forEach((a, spalte) => {
      const knoten = a.knoten.filter((k) => erlaubt.has(k as KnotenId)) as KnotenId[]
      const signale = knoten.map((k) => netz[k]).filter(Boolean)
      const zustand = signale.reduce<Zustand>((s, x) => (RANG[x.zustand] > RANG[s] ? x.zustand : s), "ruhig")
      const haupt = signale[0]
      const wege = knoten.map((k) => {
        const n = KNOTEN.find((x) => x.id === k)!
        return { label: n.label[sprache], href: n.href }
      })
      raeume.push({
        id: a.id,
        etage,
        spalte,
        name: a.name[sprache],
        aufgabe: a.aufgabe[sprache],
        besetzung: a.besetzung,
        zustand: a.besetzung === "leer" ? "ruhig" : zustand,
        wert: haupt?.wert ?? "—",
        zeile:
          haupt?.zeile ??
          (a.besetzung === "leer"
            ? sprache === "tr" ? "Kadro yok. Bu departman henüz kurulmadı." : "Nicht besetzt. Diese Abteilung ist noch nicht aufgebaut."
            : sprache === "tr" ? "Henüz ölçülen bir alan yok." : "Noch keine gemessene Fläche."),
        punkte: signale.flatMap((s) => s.punkte).slice(0, 4),
        agenten: a.agenten.map((g) => AGENT_NAMEN[g]?.[sprache] ?? g),
        wege: [...wege, ...signale.flatMap((s) => s.wege)].filter((w, i, all) => all.findIndex((x) => x.href === w.href) === i).slice(0, 5),
      })
    })
  })

  const etagen: Etage[] = ETAGEN_FOLGE.map((bereich, index) => ({
    index,
    bereich,
    name: BEREICHE.find((b) => b.id === bereich)!.name[sprache],
    zustand: raeume
      .filter((r) => r.etage === index)
      .reduce<Zustand>((s, r) => (RANG[r.zustand] > RANG[s] ? r.zustand : s), "ruhig"),
  }))

  return { etagen, raeume }
}
