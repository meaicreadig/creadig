import "server-only"

import type { collectAttention } from "@/lib/attention"
import type { CockpitDaten } from "@/lib/cockpit"
import { assistentDb, letzteLaeufe } from "@/lib/assistent/store"
import { ladeBetriebsmeldungen } from "@/lib/betrieb-alarm"
import { ladeAusgabe } from "@/lib/bulletin/store"
import { naechsteTermine } from "@/lib/messen"
import { ladeFinanzKurzlage } from "@/lib/finanz/kurzlage"
import { neonAbfrage } from "@/lib/neon-abfrage"
import { ladeVerkaufslage, MONATSZIEL_EUR } from "@/lib/verkaufen"
import type { KnotenId, Sprache } from "@/lib/zentrale/netz-karte"

/**
 * DAS GEHIRN — liest jede Fläche und macht daraus ein Signal je Knoten.
 * Kein Signal wird erfunden: fehlt eine Quelle, steht dort „—“ und ruhig.
 */

export type Zustand = "ruhig" | "aktiv" | "achtung" | "stoerung"

export type Signal = {
  /** Die eine Zahl, groß angezeigt. */
  wert: string
  zeile: string
  zustand: Zustand
  /** 0..1 — Höhe des Gebäudes und Takt der Datenteilchen. */
  last: number
  punkte: string[]
  wege: { label: string; href: string }[]
}

export type NetzLage = Record<KnotenId, Signal>

type Board = Awaited<ReturnType<typeof collectAttention>>

const lastAus = (n: number) => Math.min(1, Math.log10(1 + Math.max(0, n)) / 1.6)

function euro(n: number, sprache: Sprache) {
  return new Intl.NumberFormat(sprache === "tr" ? "tr-TR" : "de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n)
}

async function mailLage(): Promise<{ gesendet7: number; offen: number } | null> {
  const q = await assistentDb().catch(() => null)
  if (!q) return null
  try {
    const rows = (await q(
      `SELECT count(*) FILTER (WHERE status = 'freigegeben' AND erledigt_at > now() - interval '7 days')::int AS gesendet7,
              count(*) FILTER (WHERE status = 'offen')::int AS offen
       FROM assistent_freigaben WHERE art = 'mail'`,
      [],
    )) as { gesendet7: number; offen: number }[]
    return rows[0] ?? null
  } catch {
    return null
  }
}

const STILL_STUNDEN = 36
const heuteIso = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date())

export async function ladeNetz({
  sprache,
  board,
  cockpit,
  truppe,
  owner = false,
}: {
  sprache: Sprache
  board: Board | null
  cockpit: CockpitDaten | null
  truppe: { gesamt: number; linkedin: number } | null
  /** Nur der Inhaber sieht Finanz-Zahlen im Hauptsitz. */
  owner?: boolean
}): Promise<NetzLage> {
  const tr = sprache === "tr"
  const [lage, laeufe, meldungen, mail] = await Promise.all([
    ladeVerkaufslage().catch(() => null),
    letzteLaeufe().catch(() => ({}) as Awaited<ReturnType<typeof letzteLaeufe>>),
    ladeBetriebsmeldungen().catch(() => []),
    mailLage(),
  ])

  const k = board?.kennzahlen ?? null
  const items = board?.items ?? []
  const nichtGemessen = tr ? "ölçülmedi" : "nicht gemessen"
  const leer = (zeile: string): Signal => ({ wert: "—", zeile, zustand: "ruhig", last: 0.1, punkte: [nichtGemessen], wege: [] })

  /* ── Truppe ── */
  const jetzt = Date.now()
  const laufListe = Object.values(laeufe)
  const agentFehler = laufListe.filter((l) => l.fehler).length
  const agentFrisch = laufListe.filter((l) => jetzt - new Date(l.zeit).getTime() < 24 * 3600_000).length
  const agentStill = ["lage", "vertrieb", "messen"].filter((a) => {
    const l = laeufe[a]
    return !l || jetzt - new Date(l.zeit).getTime() > STILL_STUNDEN * 3600_000
  })
  const truppeOffen = truppe ? truppe.gesamt - truppe.linkedin : null

  const assistent: Signal =
    truppeOffen === null
      ? leer(tr ? "karar bekliyor" : "zur Entscheidung")
      : {
          wert: String(truppeOffen),
          zeile: tr ? "karar bekliyor" : "zur Entscheidung",
          zustand: agentFehler > 0 ? "stoerung" : truppeOffen > 0 ? "achtung" : agentFrisch > 0 ? "aktiv" : "ruhig",
          last: lastAus(truppeOffen + agentFrisch),
          punkte: [
            tr ? `${agentFrisch} ajan son 24 saatte çalıştı` : `${agentFrisch} Agenten liefen in 24 h`,
            ...(agentFehler ? [tr ? `${agentFehler} ajan hata verdi` : `${agentFehler} Agenten mit Fehler`] : []),
            ...(agentStill.length ? [tr ? `Sessiz: ${agentStill.join(", ")}` : `Still: ${agentStill.join(", ")}`] : []),
          ],
          wege: [{ label: tr ? "Onay kutusu" : "Zur Entscheidung", href: "/admin/assistent#eingang-titel" }],
        }

  /* ── Verkaufen ── */
  const ueberfaelligeDeals = lage?.deals.filter((d) => d.warnungen.includes("ueberfaellig")).length ?? 0
  const verkaufen: Signal =
    !lage?.verfuegbar
      ? leer(tr ? "ağırlıklı süreç" : "gewichtete Pipeline")
      : {
          wert: euro(lage.pipelineGewichtet, sprache),
          zeile: tr ? "ağırlıklı süreç" : "gewichtete Pipeline",
          zustand: ueberfaelligeDeals > 0 ? "achtung" : lage.deals.length > 0 ? "aktiv" : "ruhig",
          last: Math.min(1, 0.2 + lage.pipelineGewichtet / MONATSZIEL_EUR),
          punkte: [
            tr
              ? `Bu ay kazanılan ${euro(lage.gewonnenMonat, sprache)} / hedef ${euro(MONATSZIEL_EUR, sprache)}`
              : `Gewonnen im Monat ${euro(lage.gewonnenMonat, sprache)} von ${euro(MONATSZIEL_EUR, sprache)}`,
            tr ? `${lage.deals.length} açık anlaşma` : `${lage.deals.length} offene Deals`,
            ...(ueberfaelligeDeals ? [tr ? `${ueberfaelligeDeals} gecikmiş adım` : `${ueberfaelligeDeals} Schritte überfällig`] : []),
          ],
          wege: [],
        }

  /* ── Gesprächsraum ── */
  const faellig = lage?.faellig.length ?? null
  const gespraech: Signal =
    faellig === null
      ? leer(tr ? "kişi sırada" : "Kontakte fällig")
      : {
          wert: String(faellig),
          zeile: tr ? "kişi sırada" : "Kontakte fällig",
          zustand: faellig > 0 ? "achtung" : "aktiv",
          last: lastAus(faellig),
          punkte: (lage?.faellig ?? []).slice(0, 3).map((f) => `${f.name}${f.was ? ` · ${f.was}` : ""}`),
          wege: [],
        }

  /* ── Termine ── */
  const termineN = cockpit?.termine?.length ?? null
  const linksN = cockpit?.linksOffen?.length ?? 0
  const termine: Signal =
    termineN === null
      ? leer(tr ? "yaklaşan randevu" : "kommende Termine")
      : {
          wert: String(termineN),
          zeile: tr ? "yaklaşan randevu" : "kommende Termine",
          zustand: termineN > 0 ? "aktiv" : linksN > 0 ? "achtung" : "ruhig",
          last: lastAus(termineN + linksN),
          punkte: [
            ...(cockpit?.termine ?? []).slice(0, 2).map((t) => t.name),
            ...(linksN ? [tr ? `${linksN} rezervasyon linki açık` : `${linksN} Buchungslinks offen`] : []),
          ],
          wege: [],
        }

  /* ── Vertrieb ── */
  const vertrieb: Signal = !k
    ? leer(tr ? "yeni talep" : "neue Anfragen")
    : {
        wert: String(k.neueAnfragen),
        zeile: tr ? "yeni talep" : "neue Anfragen",
        zustand: k.ueberfaellig > 0 ? "achtung" : k.neueAnfragen > 0 || k.heuteFaellig > 0 ? "aktiv" : "ruhig",
        last: lastAus(k.neueAnfragen + k.heuteFaellig + k.ueberfaellig),
        punkte: [
          tr ? `${k.ueberfaellig} gecikmiş` : `${k.ueberfaellig} überfällig`,
          tr ? `${k.heuteFaellig} bugün` : `${k.heuteFaellig} heute fällig`,
          tr ? `${k.ohneSchritt} adımsız` : `${k.ohneSchritt} ohne nächsten Schritt`,
        ],
        wege: [
          { label: tr ? "Gecikmiş fırsatlar" : "Überfällige Chancen", href: "/admin/vertrieb/pipeline?bucket=ueberfaellig" },
          { label: tr ? "Yeni talepler" : "Neue Anfragen", href: "/admin/vertrieb/anfragen?status=neu" },
          { label: tr ? "Adımsız" : "Ohne Schritt", href: "/admin/vertrieb/pipeline?bucket=ohne-schritt" },
        ],
      }

  /* ── Kunden ── */
  const gefaehrdet = items.filter((i) => i.rank === "kunde-gefaehrdet" || i.rank === "beziehung-faellig").length
  const kunden: Signal = !board
    ? leer(tr ? "ilgi bekleyen müşteri" : "Kunden brauchen Zuwendung")
    : {
        wert: String(gefaehrdet),
        zeile: tr ? "ilgi bekleyen müşteri" : "Kunden brauchen Zuwendung",
        zustand: gefaehrdet > 0 ? "achtung" : "aktiv",
        last: lastAus(gefaehrdet + 2),
        punkte: board.kundenOhneBeleg
          ? [tr ? `${board.kundenOhneBeleg} müşteri kanıtsız` : `${board.kundenOhneBeleg} Kunden ohne Beleg`]
          : [tr ? "Müşteri ipliği güncel" : "Kundenfaden aktuell"],
        wege: [],
      }

  /* ── Mail Studio ── */
  const mailstudio: Signal = !mail
    ? leer(tr ? "7 günde gönderildi" : "gesendet in 7 Tagen")
    : {
        wert: String(mail.gesendet7),
        zeile: tr ? "7 günde gönderildi" : "gesendet in 7 Tagen",
        zustand: mail.offen > 0 ? "achtung" : mail.gesendet7 > 0 ? "aktiv" : "ruhig",
        last: lastAus(mail.gesendet7 + mail.offen),
        punkte: mail.offen ? [tr ? `${mail.offen} e-posta onay bekliyor` : `${mail.offen} Mails warten auf Freigabe`] : [],
        wege: [{ label: tr ? "Yeni e-posta" : "Neue Mail", href: "/admin/marketing/mail/einzel" }],
      }

  /* ── Marketing ── */
  const posts7 = cockpit?.posts7 ?? null
  const linkedinOffen = truppe?.linkedin ?? 0
  const marketing: Signal =
    posts7 === null
      ? leer(tr ? "7 günde yayın" : "Beiträge in 7 Tagen")
      : {
          wert: String(posts7),
          zeile: tr ? "7 günde yayın" : "Beiträge in 7 Tagen",
          zustand: linkedinOffen > 0 ? "achtung" : posts7 > 0 ? "aktiv" : "ruhig",
          last: lastAus(posts7 + linkedinOffen),
          punkte: linkedinOffen ? [tr ? `${linkedinOffen} LinkedIn yazısı bekliyor` : `${linkedinOffen} LinkedIn-Beiträge warten`] : [],
          wege: [{ label: tr ? "Editörlük" : "Zur Redaktion", href: "/admin/assistent#redaktion" }],
        }

  /* ── Messen ── */
  const naechste = naechsteTermine()[0]
  const messen: Signal = naechste
    ? {
        wert: naechste.monateBis <= 0 ? (tr ? "bu ay" : "jetzt") : `${naechste.monateBis} ${tr ? "ay" : "Mon."}`,
        zeile: naechste.name,
        zustand: naechste.monateBis <= 2 && naechste.empfehlung === "ausstellen" ? "achtung" : "aktiv",
        last: Math.max(0.15, 1 - naechste.monateBis / 12),
        punkte: naechsteTermine()
          .slice(1, 3)
          .map((m) => `${m.name} · ${m.monateBis} ${tr ? "ay" : "Mon."}`),
        wege: [],
      }
    : leer(tr ? "sıradaki fuar" : "nächste Messe")

  /* ── Bulletin ── */
  const ausgabe = await ladeAusgabe().catch(() => null)
  const bulletin: Signal = ausgabe
    ? {
        wert: String(ausgabe.meldungen.length),
        zeile: tr ? "güncel haber" : "aktuelle Meldungen",
        zustand: "aktiv",
        last: Math.min(1, ausgabe.meldungen.length / 14),
        punkte: ausgabe.meldungen.slice(0, 2).map((m) => m.titel[tr ? "tr" : "de"]),
        wege: [{ label: tr ? "Bülteni oku" : "Bulletin lesen", href: "/admin/bulletin" }],
      }
    : leer(tr ? "ilk sayı" : "erste Ausgabe")

  /* ── Betrieb ── */
  const system: Signal = {
    wert: String(meldungen.length),
    zeile: meldungen.length ? (tr ? "arıza, son 24 saat" : "Störungen in 24 h") : tr ? "her şey çalışıyor" : "alles läuft",
    zustand: meldungen.length ? "stoerung" : "ruhig",
    last: meldungen.length ? 0.8 : 0.2,
    punkte: meldungen.slice(0, 3).map((m) => m.titel),
    wege: [],
  }

  /*
   * Finanzen: Zahlen NUR für den Inhaber (Finanz ist eine eigene App, nur
   * Inhaber). Alle anderen sehen den Rahmen — dieselbe Zurückhaltung wie vorher.
   */
  const finanzDb = owner ? neonAbfrage() : null
  const finanzLage = finanzDb ? await ladeFinanzKurzlage(finanzDb, heuteIso()).catch(() => null) : null
  const finanz: Signal = finanzLage
    ? {
        wert: euro(finanzLage.offeneEinnahmen.bruttoCent / 100, sprache),
        zeile: tr ? "henüz tahsil edilmedi" : "noch nicht erhalten",
        /* Achtung, wenn Geld oder Frist drängt: überfällige Rechnung oder Finanzamt-Frist in ≤ 14 Tagen. */
        zustand:
          finanzLage.ueberfaellig > 0 || (finanzLage.naechsteFrist !== null && finanzLage.naechsteFrist.tage <= 14)
            ? "achtung"
            : finanzLage.offeneEinnahmen.anzahl > 0
              ? "aktiv"
              : "ruhig",
        last: lastAus(finanzLage.offeneEinnahmen.anzahl + finanzLage.offeneRechnungen.anzahl),
        punkte: [
          ...(finanzLage.ueberfaellig > 0 ? [tr ? `${finanzLage.ueberfaellig} fatura vadesi geçmiş` : `${finanzLage.ueberfaellig} Rechnung(en) überfällig`] : []),
          ...(finanzLage.naechsteFrist && finanzLage.naechsteFrist.tage <= 30
            ? [tr ? `Sonraki vade: ${finanzLage.naechsteFrist.titel} (${finanzLage.naechsteFrist.tage} gün)` : `Nächste Frist: ${finanzLage.naechsteFrist.titel} (${finanzLage.naechsteFrist.tage} Tage)`]
            : []),
          tr ? `${finanzLage.offeneEinnahmen.anzahl} açık gelir kalemi` : `${finanzLage.offeneEinnahmen.anzahl} offene Einnahmen`,
          tr
            ? `${finanzLage.offeneRechnungen.anzahl} açık fatura, ${euro(finanzLage.offeneRechnungen.offenCent / 100, sprache)}`
            : `${finanzLage.offeneRechnungen.anzahl} offene Rechnungen, ${euro(finanzLage.offeneRechnungen.offenCent / 100, sprache)}`,
          finanzLage.abgleichAt
            ? tr ? `Son Fibero karşılaştırması: ${finanzLage.abgleichAt.slice(0, 10)}` : `Letzter Fibero-Abgleich: ${finanzLage.abgleichAt.slice(0, 10)}`
            : tr ? "Fibero karşılaştırması henüz çalışmadı" : "Fibero-Abgleich noch nie gelaufen",
        ],
        wege: [],
      }
    : {
        wert: "€",
        zeile: tr ? "kurulun çerçevesi" : "Rahmen für den Rat",
        zustand: "aktiv",
        last: 0.45,
        punkte: [tr ? "Ayrı uygulama, sadece sahip" : "Eigene App, nur Inhaber"],
        wege: [],
      }

  /* ── Gehirn: alles, was im Blick ist ── */
  const operativ = items.filter((i) => i.rank !== "entscheidung" && i.rank !== "betriebsblocker").length
  const imBlick = operativ + (truppeOffen ?? 0) + linkedinOffen
  const stoerungen = [system, assistent].filter((s) => s.zustand === "stoerung").length
  const achtung = [assistent, verkaufen, gespraech, termine, vertrieb, kunden, mailstudio, marketing, messen, finanz].filter(
    (s) => s.zustand === "achtung",
  ).length
  const uebersicht: Signal = {
    wert: String(imBlick),
    zeile: tr ? "takipte nokta" : "Punkte im Blick",
    zustand: stoerungen ? "stoerung" : achtung ? "achtung" : "aktiv",
    last: 1,
    punkte: [
      tr ? `${achtung} alan dikkat istiyor` : `${achtung} Bereiche brauchen dich`,
      stoerungen ? (tr ? `${stoerungen} arıza` : `${stoerungen} Störungen`) : tr ? "İşletim sakin" : "Betrieb ruhig",
    ],
    wege: [{ label: tr ? "Bugün yapılacaklar" : "Heute zu tun", href: "#heute-titel" }],
  }

  return { uebersicht, assistent, bulletin, verkaufen, gespraech, termine, vertrieb, kunden, mailstudio, marketing, messen, finanz, system }
}
