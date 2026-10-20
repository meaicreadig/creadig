/**
 * DAS NETZ — die eine Karte des creaDIG Control Center (Schritt 4, 20.10.2026).
 *
 * Jede Admin-Fläche ist hier ein Knoten mit Ort in einer 3D-Welt (x/y Boden,
 * z Höhe) und echten Datenfäden. Die Seitenleiste wird aus dieser Liste gebaut
 * (AdminShell) — eine Seite ohne Knoten kann es im Menü nicht geben.
 *
 * Bewusst ohne Server-Import: Szene, Netz-Faden und Shell lesen dieselbe Karte.
 * Ein späterer echter 3D-Renderer (WebGL) nutzt dieselben Koordinaten.
 */

export type Sprache = "de" | "tr"
type Text = Record<Sprache, string>

export const NAV_SCHLUESSEL = [
  "uebersicht",
  "assistent",
  "verkaufen",
  "gespraech",
  "termine",
  "vertrieb",
  "kunden",
  "mailstudio",
  "marketing",
  "messen",
] as const
export type NavSchluessel = (typeof NAV_SCHLUESSEL)[number]
export type NavGruppe = "cockpit" | "vertrieb" | "kunden" | "marketing"

export type KnotenId = NavSchluessel | "finanz" | "system"

export type Knoten = {
  id: KnotenId
  href: string
  label: Text
  /** Was diese Fläche im Netz tut — ein Satz. */
  aufgabe: Text
  viertel: "kern" | "kunden" | "vertrieb" | "marketing" | "geld" | "technik"
  /** Bodenkoordinate in Welteinheiten, Gehirn = Ursprung. */
  pos: { x: number; y: number }
  nav?: { gruppe: NavGruppe }
  nurOwner?: boolean
}

export const KNOTEN: readonly Knoten[] = [
  {
    id: "uebersicht",
    href: "/admin",
    label: { de: "Zentrale", tr: "Merkez" },
    aufgabe: {
      de: "Das Gehirn. Liest jede Fläche, gewichtet und sagt, was heute zählt.",
      tr: "Beyin. Her alanı okur, tartar ve bugün neyin önemli olduğunu söyler.",
    },
    viertel: "kern",
    pos: { x: 0, y: 0 },
    nav: { gruppe: "cockpit" },
  },
  {
    id: "assistent",
    href: "/admin/assistent",
    label: { de: "Assistent & Truppe", tr: "Asistan ve ekip" },
    aufgabe: {
      de: "KI-Agenten arbeiten täglich und legen dir Entscheidungen zur Freigabe vor.",
      tr: "Yapay zekâ ajanları her gün çalışır ve kararları onayına sunar.",
    },
    viertel: "kern",
    pos: { x: 0, y: -3.4 },
    nav: { gruppe: "cockpit" },
  },
  {
    id: "verkaufen",
    href: "/admin/verkaufen",
    label: { de: "Heute verkaufen", tr: "Bugün sat" },
    aufgabe: {
      de: "Deals, Monatsziel und der nächste Zug je Stufe.",
      tr: "Anlaşmalar, aylık hedef ve her aşamada sıradaki hamle.",
    },
    viertel: "vertrieb",
    pos: { x: 3.7, y: -0.9 },
    nav: { gruppe: "cockpit" },
  },
  {
    id: "gespraech",
    href: "/admin/gespraech",
    label: { de: "Gesprächsraum", tr: "Görüşme odası" },
    aufgabe: {
      de: "Anrufen, mitschreiben — die KI macht daraus eine saubere Notiz am Kunden.",
      tr: "Ara, not al — yapay zekâ bunu müşteride temiz bir nota çevirir.",
    },
    viertel: "kunden",
    pos: { x: -3.7, y: -0.9 },
    nav: { gruppe: "cockpit" },
  },
  {
    id: "termine",
    href: "/admin/termine",
    label: { de: "Termine", tr: "Randevular" },
    aufgabe: {
      de: "Buchungslinks, Kalender, gebuchte Gespräche.",
      tr: "Rezervasyon linkleri, takvim, alınan görüşmeler.",
    },
    viertel: "kunden",
    pos: { x: -2.3, y: 3.5 },
    nav: { gruppe: "cockpit" },
  },
  {
    id: "vertrieb",
    href: "/admin/vertrieb",
    label: { de: "Vertrieb", tr: "Satış" },
    aufgabe: {
      de: "Anfragen und Chancen — die Pipeline, aus der verkauft wird.",
      tr: "Talepler ve fırsatlar — satışın beslendiği süreç.",
    },
    viertel: "vertrieb",
    pos: { x: 5.2, y: 2.3 },
    nav: { gruppe: "vertrieb" },
  },
  {
    id: "kunden",
    href: "/admin/kunden",
    label: { de: "Kunden & Kontakte", tr: "Müşteriler ve kişiler" },
    aufgabe: {
      de: "Der Kundenfaden: jede Mail, jedes Gespräch, jede Chance an einer Stelle.",
      tr: "Müşteri ipliği: her e-posta, her görüşme, her fırsat tek yerde.",
    },
    viertel: "kunden",
    pos: { x: -5.2, y: 2.3 },
    nav: { gruppe: "kunden" },
  },
  {
    id: "mailstudio",
    href: "/admin/marketing/mail",
    label: { de: "Mail Studio", tr: "Mail Studio" },
    aufgabe: {
      de: "Mails im Markendesign senden, Antworten verfolgen, automatisch nachfassen.",
      tr: "Marka tasarımıyla e-posta gönder, yanıtları izle, otomatik takip et.",
    },
    viertel: "marketing",
    pos: { x: 2.3, y: 3.5 },
    nav: { gruppe: "marketing" },
  },
  {
    id: "marketing",
    href: "/admin/marketing",
    label: { de: "Marketing", tr: "Pazarlama" },
    aufgabe: {
      de: "LinkedIn-Redaktion und Reichweite — was hinausgeht.",
      tr: "LinkedIn editörlüğü ve erişim — dışarı çıkan her şey.",
    },
    viertel: "marketing",
    pos: { x: 0, y: 6 },
    nav: { gruppe: "marketing" },
  },
  {
    id: "messen",
    href: "/admin/messen",
    label: { de: "Messen", tr: "Fuarlar" },
    aufgabe: {
      de: "Welche Messe als Nächstes kommt und ob ausstellen lohnt.",
      tr: "Sıradaki fuar ve katılmaya değip değmediği.",
    },
    viertel: "marketing",
    pos: { x: 4.4, y: 6.2 },
    nav: { gruppe: "marketing" },
  },
  {
    id: "finanz",
    href: "/finanz",
    label: { de: "creaDIG Finanz", tr: "creaDIG Finans" },
    aufgabe: {
      de: "Spielraum und Reichweite fließen als Rahmen in jede Entscheidung des Rats.",
      tr: "Hareket alanı ve dayanma süresi, kurulun her kararına çerçeve olur.",
    },
    viertel: "geld",
    pos: { x: -3.6, y: -4.6 },
    nurOwner: true,
  },
  {
    id: "system",
    href: "/admin/material",
    label: { de: "Betrieb", tr: "İşletim" },
    aufgabe: {
      de: "Läuft alles? Störungen, Agenten, Verbindungen — still im Hintergrund.",
      tr: "Her şey çalışıyor mu? Arızalar, ajanlar, bağlantılar — arka planda sessizce.",
    },
    viertel: "technik",
    pos: { x: 3.6, y: -4.6 },
  },
]

export type Faden = { von: KnotenId; nach: KnotenId; was: Text }

/** Echte Datenwege (lib/kundenfaden, motor, truppe, rahmen) — keine Dekoration. */
export const FAEDEN: readonly Faden[] = [
  { von: "gespraech", nach: "kunden", was: { de: "KI-Notiz am Kontakt", tr: "Kişiye yapay zekâ notu" } },
  { von: "gespraech", nach: "verkaufen", was: { de: "Nächster Schritt am Deal", tr: "Anlaşmada sonraki adım" } },
  { von: "gespraech", nach: "termine", was: { de: "Terminmail", tr: "Randevu e-postası" } },
  { von: "termine", nach: "verkaufen", was: { de: "Buchung hebt die Stufe", tr: "Rezervasyon aşamayı yükseltir" } },
  { von: "kunden", nach: "vertrieb", was: { de: "Firmen und Chancen", tr: "Firmalar ve fırsatlar" } },
  { von: "vertrieb", nach: "verkaufen", was: { de: "Pipeline", tr: "Satış süreci" } },
  { von: "mailstudio", nach: "kunden", was: { de: "Gesendete Mail im Kundenfaden", tr: "Gönderilen e-posta müşteri ipliğinde" } },
  { von: "mailstudio", nach: "verkaufen", was: { de: "Antwort hebt die Chance", tr: "Yanıt fırsatı yükseltir" } },
  { von: "assistent", nach: "mailstudio", was: { de: "Freigegebene Mails", tr: "Onaylı e-postalar" } },
  { von: "assistent", nach: "vertrieb", was: { de: "Jäger: neue Firmen", tr: "Avcı: yeni firmalar" } },
  { von: "marketing", nach: "assistent", was: { de: "LinkedIn-Redaktion", tr: "LinkedIn editörlüğü" } },
  { von: "messen", nach: "assistent", was: { de: "Messe-Agent", tr: "Fuar ajanı" } },
  { von: "finanz", nach: "assistent", was: { de: "Finanzrahmen für den Rat", tr: "Kurul için finans çerçevesi" } },
  { von: "system", nach: "assistent", was: { de: "Agentenläufe und Störungen", tr: "Ajan çalışmaları ve arızalar" } },
]

export const GEHIRN: KnotenId = "uebersicht"

export function knoten(id: KnotenId): Knoten {
  return KNOTEN.find((k) => k.id === id)!
}

/** Längster passender Pfad gewinnt; /admin selbst nur exakt. */
export function knotenFuerPfad(pfad: string): Knoten | null {
  let treffer: Knoten | null = null
  for (const k of KNOTEN) {
    const passt = k.href === "/admin" ? pfad === "/admin" : pfad === k.href || pfad.startsWith(`${k.href}/`)
    if (passt && (!treffer || k.href.length > treffer.href.length)) treffer = k
  }
  return treffer
}

export function nachbarn(id: KnotenId) {
  return {
    rein: FAEDEN.filter((f) => f.nach === id),
    raus: FAEDEN.filter((f) => f.von === id),
  }
}
