import "server-only"

import { generateText } from "ai"

import { abendVonGestern, type AbendRueckmeldung } from "@/lib/assistent/abend"
import { collectAttention, type AttentionItem } from "@/lib/attention"
import { ladeCockpit, type CockpitDaten } from "@/lib/cockpit"
import { GESCHAEFTS_ZEITZONE } from "@/lib/geschaeftszeit"
import { getVertriebStore } from "@/lib/lead-store"
import { ladeFinanzKurzlage, type FinanzKurzlage } from "@/lib/finanz/kurzlage"
import { neonAbfrage } from "@/lib/neon-abfrage"

export type BriefingSprache = "de" | "tr"

export type BriefingSchritt = { titel: string; warum: string; href: string | null }

export type Briefing = {
  lage: string
  schritte: BriefingSchritt[]
  impuls: string
  quelle: "ki" | "regel"
  erstellt: string
}

const MODELL = "openai/gpt-5.4-mini"

const SCHEMA = `CREATE TABLE IF NOT EXISTS admin_briefing (
  tag text NOT NULL,
  sprache text NOT NULL,
  daten jsonb NOT NULL,
  erstellt_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tag, sprache))`

let schemaBereit: Promise<void> | null = null

async function db() {
  const abfrage = neonAbfrage()
  if (!abfrage) return null
  if (!schemaBereit) {
    schemaBereit = abfrage(SCHEMA, []).then(
      () => undefined,
      (e) => {
        schemaBereit = null
        throw e
      },
    )
  }
  await schemaBereit
  return abfrage
}

function heute(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: GESCHAEFTS_ZEITZONE }).format(new Date())
}

const RANG_GEWICHT: Record<string, number> = {
  betriebsblocker: 0,
  ueberfaellig: 1,
  "neue-anfrage": 2,
  "heute-faellig": 3,
  "kunde-gefaehrdet": 4,
  "schritt-ohne-termin": 5,
  "ohne-schritt": 6,
  "beziehung-faellig": 7,
  entscheidung: 8,
}

function kandidaten(items: AttentionItem[]): AttentionItem[] {
  return [...items].sort((a, b) => (RANG_GEWICHT[a.rank] ?? 9) - (RANG_GEWICHT[b.rank] ?? 9)).slice(0, 25)
}

type DealAbsprache = { firma: string; titel: string; status: string; naechsterSchritt: string; am: string | null; notiz: string }
type AssistentLage = { freigabenOffen: number; aeltesteOffen: string | null; abend: AbendRueckmeldung | null; deals: DealAbsprache[] }

async function ladeAssistentLage(): Promise<AssistentLage> {
  const abfrage = neonAbfrage()
  const [rows, abend, deals] = await Promise.all([
    abfrage
      ? abfrage(`SELECT count(*) AS c, min(created_at)::date AS d FROM assistent_freigaben WHERE status = 'offen'`, []).catch(() => [])
      : Promise.resolve([]),
    abendVonGestern().catch(() => null),
    abfrage
      ? abfrage(
          `SELECT coalesce(g.name, '') AS firma, o.title, o.status, coalesce(o.next_action, '') AS next_action,
                  o.next_action_at::date AS am, coalesce(o.note, '') AS note
             FROM opportunities o LEFT JOIN organisations g ON g.id = o.organisation_id
            WHERE o.status NOT IN ('won','lost','excluded') ORDER BY o.next_action_at NULLS LAST LIMIT 12`,
          [],
        ).catch(() => [])
      : Promise.resolve([]),
  ])
  return {
    freigabenOffen: Number(rows[0]?.c ?? 0),
    aeltesteOffen: rows[0]?.d ? String(rows[0].d).slice(0, 10) : null,
    abend,
    deals: deals.map((d) => ({
      firma: String(d.firma),
      titel: String(d.title ?? ""),
      status: String(d.status ?? ""),
      naechsterSchritt: String(d.next_action),
      am: d.am ? String(d.am).slice(0, 10) : null,
      notiz: String(d.note).slice(0, 400),
    })),
  }
}

function lagebild(items: AttentionItem[], c: CockpitDaten, f: FinanzKurzlage | null, a: AssistentLage): string {
  const n = (v: number | null) => (v === null ? "nicht gemessen" : String(v))
  const eur = (cent: number | null) => (cent === null ? "nicht gemessen" : `${Math.round(cent / 100)} €`)
  return [
    `Heute: ${heute()}`,
    `Offene Freigaben im Assistenten (Mails/Aufgaben der KI-Truppe, warten auf Klick): ${a.freigabenOffen}${a.aeltesteOffen ? `, älteste seit ${a.aeltesteOffen}` : ""}`,
    a.abend
      ? `Rückmeldung gestern Abend: ${a.abend.bilanz} | Liegen geblieben: ${a.abend.offen.join("; ") || "nichts"} | Geplant für heute zuerst: ${a.abend.morgenZuerst}`
      : "Rückmeldung gestern Abend: keine",
    `Anfragen letzte 7 Tage: ${n(c.anfragen7)} (Woche davor: ${n(c.anfragenVor7)})`,
    `Offene Chancen in der Pipeline: ${n(c.pipelineOffen)}, Wert ${c.pipelineWert === null ? "nicht gemessen" : `${Math.round(c.pipelineWert)} €`}`,
    `Offene Rechnungen: ${n(c.rechnungenOffen)}, Summe ${eur(c.rechnungenOffenCent)}`,
    f
      ? `Noch nicht erhaltene Einnahmen: ${f.offeneEinnahmen.anzahl} Posten, ${eur(f.offeneEinnahmen.bruttoCent)} brutto`
      : "Noch nicht erhaltene Einnahmen: nicht gemessen",
    f ? `Letzter Fibero-Abgleich: ${f.abgleichAt ? f.abgleichAt.slice(0, 10) : "noch nie gelaufen"}` : "Letzter Fibero-Abgleich: nicht gemessen",
    `Veröffentlichte Beiträge letzte 7 Tage: ${n(c.posts7)}`,
    `Nächste Termine: ${c.termine?.length ? c.termine.slice(0, 5).map((t) => `${t.start} ${t.name}`).join("; ") : "keine"}`,
    `Verschickte Terminlinks ohne Buchung: ${c.linksOffen?.length ?? 0}`,
    "",
    "CHANCEN MIT EMINS ABSPRACHEN (verbindlich – Firma | Chance | Stufe | vereinbarter nächster Schritt | am | Notiz):",
    ...(a.deals.length
      ? a.deals.map((d) => `${d.firma || "-"} | ${d.titel} | ${d.status} | ${d.naechsterSchritt || "-"} | ${d.am ?? "-"} | ${d.notiz || "-"}`)
      : ["keine"]),
    "",
    "OFFENE PUNKTE (Index | Art | Titel | Detail | fällig):",
    ...items.map((i, idx) => `${idx} | ${i.rank} | ${i.title} | ${i.detail ?? "-"} | ${i.due ?? "-"}`),
  ]
    .join("\n")
    .slice(0, 9000)
}

const SYSTEM = (sprache: BriefingSprache) => `Du bist der persönliche Geschäftsassistent von Muhammed Emin Akyol, Inhaber von creaDIG Solutions (System-Haus für digitale Betriebe, Deutschland, Expansion in die Golfstaaten geplant).
Deine Aufgabe: jeden Morgen genau die drei Schritte nennen, die ihn heute am weitesten nach vorne bringen – Umsatz, Kunden, Sichtbarkeit.
Regeln:
- Grundlage ist NUR das LAGEBILD. Erfinde keine Namen, Zahlen oder Termine.
- Bei Chancen gilt EMINS ABSPRACHE: Nenne genau den vereinbarten nächsten Schritt (z. B. "Nummer besorgen und anrufen"), mit dem echten Firmennamen. Schreibe NIE "abschließen", "Entscheidung erzwingen" o. Ä., wenn das nicht in der Absprache steht. Liegt das Datum der Absprache in der Zukunft, ist die Chance pausiert – nicht erwähnen. Steht in der Notiz "Kein eigenes Produkt", nenne es nicht Produkt.
- Wenn ein Schritt sich auf einen OFFENEN PUNKT bezieht, gib dessen Index als "ref" an, sonst null.
- Du arbeitest in einer Linie mit dem Assistenten und seiner KI-Truppe: Was gestern Abend für heute geplant wurde, kommt zuerst (außer etwas Dringenderes). Offene Freigaben sind fertige Arbeit, die nur einen Klick braucht – erwähne sie, wenn welche warten.
- Reihenfolge: Geld und Fristen zuerst (überfällig, offene Rechnungen, neue Anfragen), dann Pipeline, dann Wachstum.
- Ist wenig offen, schlage aktive Wachstumsschritte vor (Kontakte anschreiben, Beitrag veröffentlichen, Angebot für die Golfregion vorbereiten).
- Sprache: ${sprache === "tr" ? "Türkisch" : "Deutsch"}, per du, klar, motivierend ohne Floskeln, keine Emojis.
- "titel" max 9 Wörter, imperativ. "warum" ein Satz, max 22 Wörter.
- "lage": ein Satz, wie es heute steht. "impuls": ein Satz, der ihn über das Tagesgeschäft hinaus voranbringt.
Antworte NUR mit JSON: {"lage":"…","schritte":[{"titel":"…","warum":"…","ref":0}],"impuls":"…"}`

const REGEL_TEXT = {
  de: {
    lage: (n: number) => (n ? `${n} Punkte warten auf dich – hier sind die wichtigsten.` : "Alles erledigt. Zeit, Neues anzustoßen."),
    warum: "Steht ganz oben in deiner Liste.",
    leer: [
      { titel: "Drei bestehende Kontakte anschreiben", warum: "Beziehungen sind der kürzeste Weg zum nächsten Auftrag.", href: "/admin/gespraech" },
      { titel: "Einen Beitrag veröffentlichen", warum: "Sichtbarkeit bringt Anfragen, auch wenn du nicht suchst.", href: "/admin/marketing" },
      { titel: "Pipeline durchsehen und nächste Schritte setzen", warum: "Jede Chance ohne nächsten Schritt kühlt ab.", href: "/admin/vertrieb/pipeline" },
    ],
    impuls: "Bereite heute einen Satz vor, mit dem du creaDIG in den Golfstaaten vorstellst.",
  },
  tr: {
    lage: (n: number) => (n ? `Seni bekleyen ${n} konu var – en önemlileri burada.` : "Her şey tamam. Yeni bir şey başlatma zamanı."),
    warum: "Listenin en üstünde duruyor.",
    leer: [
      { titel: "Üç mevcut kişiye yaz", warum: "İlişkiler bir sonraki işe giden en kısa yol.", href: "/admin/gespraech" },
      { titel: "Bir paylaşım yayınla", warum: "Görünürlük, sen aramasan da talep getirir.", href: "/admin/marketing" },
      { titel: "Pipeline'a bak ve sonraki adımları belirle", warum: "Sonraki adımı olmayan her fırsat soğur.", href: "/admin/vertrieb/pipeline" },
    ],
    impuls: "Bugün creaDIG'i Körfez ülkelerinde tanıtacağın tek bir cümle hazırla.",
  },
}

function regelBriefing(items: AttentionItem[], sprache: BriefingSprache): Briefing {
  const t = REGEL_TEXT[sprache]
  const top = items.slice(0, 3).map((i) => ({ titel: i.title, warum: i.detail ?? t.warum, href: i.href }))
  return {
    lage: t.lage(items.length),
    schritte: [...top, ...t.leer].slice(0, 3),
    impuls: t.impuls,
    quelle: "regel",
    erstellt: new Date().toISOString(),
  }
}

function text(v: unknown, max: number): string | null {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null
}

async function kiBriefing(items: AttentionItem[], c: CockpitDaten, f: FinanzKurzlage | null, a: AssistentLage, sprache: BriefingSprache): Promise<Briefing | null> {
  try {
    const { text: roh } = await generateText({
      model: MODELL,
      system: SYSTEM(sprache),
      prompt: `LAGEBILD:\n${lagebild(items, c, f, a)}`,
      maxOutputTokens: 2000,
    })
    const json = JSON.parse(roh.slice(roh.indexOf("{"), roh.lastIndexOf("}") + 1)) as Record<string, unknown>
    const schritte = (Array.isArray(json.schritte) ? json.schritte : [])
      .map((s: Record<string, unknown>) => {
        const titel = text(s?.titel, 90)
        if (!titel) return null
        const ref = typeof s.ref === "number" ? items[s.ref] : undefined
        return { titel, warum: text(s.warum, 200) ?? "", href: ref?.href ?? null }
      })
      .filter((s): s is BriefingSchritt => s !== null)
      .slice(0, 3)
    const lage = text(json.lage, 220)
    if (!lage || schritte.length === 0) return null
    return { lage, schritte, impuls: text(json.impuls, 220) ?? "", quelle: "ki", erstellt: new Date().toISOString() }
  } catch (e) {
    console.error("[briefing]", e instanceof Error ? e.message : e)
    return null
  }
}

async function erstelle(sprache: BriefingSprache): Promise<Briefing> {
  const [board, cockpit] = await Promise.all([collectAttention(getVertriebStore()), ladeCockpit()])
  const items = kandidaten(board.items)
  const fdb = neonAbfrage()
  const [finanz, assistent] = await Promise.all([
    fdb ? ladeFinanzKurzlage(fdb, heute()).catch(() => null) : Promise.resolve(null),
    ladeAssistentLage(),
  ])
  if (assistent.freigabenOffen > 0) {
    items.unshift({
      rank: "entscheidung",
      title: sprache === "tr" ? `${assistent.freigabenOffen} onay bekliyor` : `${assistent.freigabenOffen} Freigaben warten im Assistenten`,
      detail: sprache === "tr" ? "KI ekibinin hazırladığı mailler ve görevler" : "Mails und Aufgaben, die dein KI-Team vorbereitet hat",
      href: "/admin/assistent",
    } as AttentionItem)
  }
  return (await kiBriefing(items, cockpit, finanz, assistent, sprache)) ?? regelBriefing(items, sprache)
}

async function speichere(sprache: BriefingSprache, b: Briefing) {
  const abfrage = await db().catch(() => null)
  if (!abfrage || b.quelle !== "ki") return
  await abfrage(
    `INSERT INTO admin_briefing (tag, sprache, daten) VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (tag, sprache) DO UPDATE SET daten = EXCLUDED.daten, erstellt_at = now()`,
    [heute(), sprache, JSON.stringify(b)],
  ).catch(() => undefined)
}

/** Einmal pro Tag und Sprache wird die KI gefragt; danach kommt das Briefing aus der Datenbank. */
export async function morgenBriefing(sprache: BriefingSprache): Promise<Briefing> {
  const abfrage = await db().catch(() => null)
  if (abfrage) {
    const zeilen = await abfrage(`SELECT daten FROM admin_briefing WHERE tag = $1 AND sprache = $2`, [heute(), sprache]).catch(() => [])
    if (zeilen[0]?.daten) return zeilen[0].daten as Briefing
  }
  const b = await erstelle(sprache)
  await speichere(sprache, b)
  return b
}

export async function briefingNeu(sprache: BriefingSprache): Promise<Briefing> {
  const b = await erstelle(sprache)
  await speichere(sprache, b)
  return b
}
