import "server-only"

import type { InsightCategoryKey } from "@/lib/insights"
import { SITE_URL } from "@/lib/routes"

import { seoChancen } from "@/lib/seo/search-console"

import { entwerfe } from "./agent"
import { bulletinRefBekannt, ladeArtikelListe } from "./store"

/**
 * Der Redaktionsplan für /insights — Grundlagenartikel, die verkaufen.
 *
 * Bis hierher entstanden Artikel nur aus dem Bulletin, also aus KI-Nachrichten.
 * Ein Handwerksbetrieb sucht aber nicht nach Modellpreisen, sondern nach
 * „Muss meine Website barrierefrei sein?". Diese Themen hängen an echten
 * Angeboten und Seiten; die Reihenfolge ist die Priorität.
 *
 * Fakten, die im Artikel stehen dürfen, stehen hier — der Autor erfindet keine.
 */
export type PlanThema = {
  code: string
  arbeitstitel: string
  kernfragen: string
  /** Gesicherte Fakten; alles andere lässt der Autor weg. */
  fakten: string
  kategorie: InsightCategoryKey
  /** Wonach ein Inhaber bei Google sucht — steht in Titel, Meta, erstem Absatz und einer Zwischenüberschrift. */
  keyword: string
  /** Die Seite, auf die der Artikel am Ende verweist. */
  ziel: string
}

export const REDAKTIONSPLAN: PlanThema[] = [
  {
    code: "bfsg-betroffen",
    keyword: "BFSG Website Pflicht",
    arbeitstitel: "BFSG: Muss meine Website barrierefrei sein?",
    kernfragen: "Wen das Barrierefreiheitsstärkungsgesetz trifft und wen nicht, was eine Website dafür leisten muss, was ein Inhaber jetzt prüfen sollte.",
    fakten: "Das BFSG gilt seit dem 28.06.2025. Es betrifft bestimmte Produkte und Dienstleistungen für Verbraucher, u. a. den elektronischen Geschäftsverkehr (Online-Shops, Buchung und Bestellung über die Website). Kleinstunternehmen (weniger als 10 Beschäftigte und höchstens 2 Mio. € Jahresumsatz oder Bilanzsumme), die Dienstleistungen erbringen, sind ausgenommen. Maßstab in der Praxis: WCAG 2.1 Stufe AA bzw. EN 301 549.",
    kategorie: "betrieb",
    ziel: "/leistungen/barrierefreiheit-website",
  },
  {
    code: "bfsg-pruefung",
    keyword: "Barrierefreiheit Website prüfen",
    arbeitstitel: "Was eine Barrierefreiheits-Prüfung wirklich prüft",
    kernfragen: "Was automatische Tests finden und was nicht, welche Mängel auf Betriebs-Websites am häufigsten sind (Kontrast, Tastatur, Formulare, Alternativtexte), wie ein Prüfbericht aussehen sollte.",
    fakten: "Automatische Werkzeuge finden nur einen Teil der Mängel; Tastaturbedienung, Fokusreihenfolge und verständliche Formulare brauchen eine Prüfung durch Menschen. Maßstab: WCAG 2.1 AA.",
    kategorie: "praxis",
    ziel: "/leistungen/barrierefreiheit-website",
  },
  {
    code: "handwerk-website",
    keyword: "Website Handwerksbetrieb",
    arbeitstitel: "Website für Handwerksbetriebe: Was sie leisten muss, damit Anfragen kommen",
    kernfragen: "Was Kunden auf der Seite eines Handwerkers in den ersten Sekunden suchen, welche Angaben fehlen meist, wie Anfragen einfacher werden, was Pflege kostet.",
    fakten: "Keine Marktzahlen verwenden. Impressum und Datenschutzerklärung sind Pflicht.",
    kategorie: "praxis",
    ziel: "/branchen/handwerk",
  },
  {
    code: "website-eigentum",
    keyword: "Website Rechte Domain Anbieterwechsel",
    arbeitstitel: "Wem gehört Ihre Website? Domain, Code und Zugänge",
    kernfragen: "Warum Betriebe bei einem Anbieterwechsel oft ohne Zugänge dastehen, was im Vertrag stehen sollte, welche Zugänge ein Inhaber selbst halten sollte.",
    fakten: "Keine Rechtsberatung; als praktische Checkliste formulieren.",
    kategorie: "betrieb",
    ziel: "/leistungen",
  },
  {
    code: "stempelkarte-wallet",
    keyword: "digitale Stempelkarte",
    arbeitstitel: "Digitale Stempelkarte im Wallet statt Papier",
    kernfragen: "Was eine Stempelkarte in Apple/Google Wallet für Gastrobetriebe ändert, was Gäste davon haben, was der Betrieb dafür braucht.",
    fakten: "stammo ist das eigene Produkt von creaDIG dafür, live unter stammo.app. Keine Nutzerzahlen oder Umsatzeffekte nennen.",
    kategorie: "products",
    ziel: "/produkte/stammo",
  },
  {
    code: "ki-agenten-betrieb",
    keyword: "KI-Agenten kleine Unternehmen",
    arbeitstitel: "KI-Agenten im kleinen Betrieb: Wo sie heute helfen — und wo nicht",
    kernfragen: "Welche wiederkehrenden Aufgaben sich heute sinnvoll an KI-Agenten geben lassen (Anfragen sortieren, Termine, Nachfassen), wo Menschen entscheiden müssen, was Datenschutz bedeutet.",
    fakten: "Keine Prozent- oder Zeitersparnis-Zahlen nennen.",
    kategorie: "ai",
    ziel: "/systeme",
  },
]

const ref = (t: PlanThema) => `plan:${t.code}`

/**
 * Schreibt den nächsten offenen Plan-Artikel als ENTWURF — aber nur, wenn
 * keiner schon auf Emins Freigabe wartet. Ein Stapel ungelesener Entwürfe
 * ist kein Redaktionsbetrieb.
 */
export async function schreibeNaechstenPlanArtikel(): Promise<{ slug: string | null; ergebnis: string }> {
  if ((await ladeArtikelListe("entwurf")).length) return { slug: null, ergebnis: "Ein Entwurf wartet schon auf Freigabe" }
  /* Was Google uns schon zeigt, aber knapp unter den ersten Plätzen: daran schreibt der Artikel mit. */
  const chancen = await seoChancen().catch(() => [])
  /* Auch verworfene Themen gelten als erledigt — was Emin ablehnt, kommt nicht wieder. */
  let thema: PlanThema | undefined
  for (const t of REDAKTIONSPLAN) if (!(await bulletinRefBekannt(ref(t)))) { thema = t; break }
  if (thema)
    return entwerfe({
      anlass: `Thema aus dem Redaktionsplan (kein Nachrichtenanlass):
Arbeitstitel: ${thema.arbeitstitel}
Kernfragen: ${thema.kernfragen}
Gesicherte Fakten (nur diese verwenden, nichts dazuerfinden): ${thema.fakten}
Am Ende ein Satz, der auf ${SITE_URL}${thema.ziel} verweist (sachlich, kein Werbeton).`,
      kategorie: thema.kategorie,
      quelleName: "creaDIG Redaktion",
      quelleUrl: `${SITE_URL}${thema.ziel}`,
      ref: ref(thema),
      keyword: thema.keyword,
      suchanfragen: chancen,
    })

  /* Plan abgearbeitet: Die nächste Suchanfrage, für die Google uns schon zeigt, bekommt ihren eigenen Artikel. */
  for (const anfrage of chancen) {
    const r = `gsc:${anfrage.toLowerCase().slice(0, 80)}`
    if (await bulletinRefBekannt(r)) continue
    return entwerfe({
      anlass: `Suchanfrage aus der Google Search Console: Menschen suchen „${anfrage}“ und bekommen creaDIG schon angezeigt, aber noch nicht weit oben.
Schreibe den Artikel, der diese Suche am besten beantwortet — für Inhaber kleiner Betriebe. Keine Zahlen, Fristen oder Rechtslagen, die du nicht sicher weißt.
Am Ende ein Satz, der auf ${SITE_URL}/leistungen verweist (sachlich, kein Werbeton).`,
      kategorie: "praxis",
      quelleName: "creaDIG Redaktion",
      quelleUrl: `${SITE_URL}/leistungen`,
      ref: r,
      keyword: anfrage,
      suchanfragen: chancen,
    })
  }
  return { slug: null, ergebnis: "Redaktionsplan abgearbeitet – neue Themen in lib/artikel/plan.ts" }
}
