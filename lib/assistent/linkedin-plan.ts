/*
 * Redaktionsplan LinkedIn: 3 Beiträge auf der Firmenseite + 1 Gründer-Beitrag je Woche.
 * Jede Säule hat ein Marketing-/Vertriebsziel; der Link steht nie im Beitrag (LinkedIn drosselt Links),
 * sondern im ersten Kommentar – mit UTM, damit Anfragen der Säule zugeordnet werden können.
 */

export type SaeuleKey = "gruender" | "wissen" | "beweis" | "haltung"

export type Saeule = {
  key: SaeuleKey
  name: string
  kanal: "firma" | "inhaber"
  /** 1 = Montag … 5 = Freitag */
  tag: number
  ziel: string
  stimme: string
  anleitung: string
  /** Seite auf creadig.de, auf die der erste Kommentar führt */
  pfad: string
  kommentar: string
}

export const SAEULEN: Saeule[] = [
  {
    key: "gruender",
    name: "Gründer-Stimme",
    kanal: "inhaber",
    tag: 1,
    ziel: "Persönliche Marke und Netzwerk – Menschen folgen Menschen",
    stimme: "Ich-Form als Muhammed Emin Akyol, Gründer von creaDIG Solutions",
    anleitung:
      "Eine ehrliche Erfahrung aus der Woche als Einzelunternehmer, der mit KI-Agenten statt Team arbeitet: was passiert ist, was ich daraus gelernt habe, was andere Inhaber davon mitnehmen. Ein Fehler oder eine Überraschung wirkt stärker als ein Erfolg.",
    pfad: "/",
    kommentar: "Wer sehen will, wie das bei uns aufgebaut ist:",
  },
  {
    key: "wissen",
    name: "Praxiswissen",
    kanal: "firma",
    tag: 2,
    ziel: "Reichweite und Vertrauen – Beiträge, die man speichert und teilt",
    stimme: "Wir-Form als creaDIG Solutions",
    anleitung:
      "Ein konkretes, alltägliches Problem der Zielgruppe der Woche. Dann 3 bis 5 sofort umsetzbare Schritte als kurze Zeilen mit „→“ am Anfang. Kein Produkt nennen – nur Wissen verschenken.",
    pfad: "/",
    kommentar: "Mehr Abläufe, die wir für kleine Betriebe automatisieren:",
  },
  {
    key: "beweis",
    name: "Einblick & Beweis",
    kanal: "firma",
    tag: 4,
    ziel: "Anfragen – zeigen, dass es funktioniert, und zum Gespräch einladen",
    stimme: "Wir-Form als creaDIG Solutions",
    anleitung:
      "Zeige an einem passenden eigenen Produkt (nur aus dem Stoff), wie ein Ablauf vorher war und nachher ist – konkret, in Schritten des Alltags. Keine Kundennamen, keine erfundenen Zahlen. Letzter Satz: ruhige Einladung zu einem 20-Minuten-Gespräch.",
    pfad: "/termin",
    kommentar: "20 Minuten, unverbindlich – Termin direkt wählen:",
  },
  {
    key: "haltung",
    name: "Branche & Haltung",
    kanal: "firma",
    tag: 5,
    ziel: "Meinungsführerschaft – zeigen, dass wir die Entwicklung einordnen können",
    stimme: "Wir-Form als creaDIG Solutions",
    anleitung:
      "Nimm EINE aktuelle Meldung aus dem Bulletin (Quelle im Text nennen) und ordne sie klar ein: Was bedeutet das konkret für kleine Betriebe und Vereine in Deutschland? Eine klare eigene Haltung, kein Nacherzählen.",
    pfad: "/insights",
    kommentar: "Unsere Einordnungen zu KI und Automatisierung:",
  },
]

/** Zielgruppen rotieren wöchentlich, damit jede Zielgruppe einmal im Monat dran ist. */
const ZIELGRUPPEN = [
  "Glasfaser-Montage-, Tiefbau- und Spleißbetriebe (passendes Produkt: fibero)",
  "Cafés, Imbisse und Bäckereien mit Stammgästen (passendes Produkt: stammo)",
  "Vereine, Verbände, Gemeinden und Stiftungen (passend: creaDIG Web & System)",
  "kleine Dienstleister mit vielen Anfragen und Terminen (passend: creaDIG Control Center)",
]

export function zielgruppeDerWoche(wochennummer: number): string {
  return ZIELGRUPPEN[((wochennummer % ZIELGRUPPEN.length) + ZIELGRUPPEN.length) % ZIELGRUPPEN.length]
}

export const saeuleVon = (key: unknown) => SAEULEN.find((s) => s.key === key)

export function linkMitUtm(s: Saeule, woche: string): string {
  const p = new URLSearchParams({
    utm_source: "linkedin",
    utm_medium: s.kanal === "firma" ? "firmenseite" : "profil",
    utm_campaign: `${s.key}-${woche}`.toLowerCase(),
  })
  return `https://creadig.de${s.pfad}?${p}`
}

function berlinOffsetMin(d: Date): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Berlin", timeZoneName: "shortOffset" })
    .formatToParts(d)
    .find((p) => p.type === "timeZoneName")?.value
  const m = /GMT([+-]\d+)/.exec(name ?? "")
  return m ? Number(m[1]) * 60 : 60
}

/** Sendezeit 07:00 Berlin – der Morgen-Takt (06:30 UTC) liegt im Sommer wie im Winter danach. */
const SENDESTUNDE = 7

/** Geplanter Zeitpunkt der Säule in dieser Woche; null, wenn der Tag schon vorbei ist (dann sofort nach Freigabe). */
export function geplantFuer(s: Saeule, jetzt = new Date()): Date | null {
  const teile = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(jetzt)
  const wert = (t: string) => teile.find((p) => p.type === t)?.value ?? ""
  const wochentag = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(wert("weekday")) + 1
  const tagBerlin = Date.UTC(Number(wert("year")), Number(wert("month")) - 1, Number(wert("day")))
  const ziel = new Date(tagBerlin + (s.tag - wochentag) * 86400000)
  const guess = Date.UTC(ziel.getUTCFullYear(), ziel.getUTCMonth(), ziel.getUTCDate(), SENDESTUNDE, 0)
  const utc = new Date(guess - berlinOffsetMin(new Date(guess)) * 60000)
  return utc.getTime() > jetzt.getTime() + 30 * 60000 ? utc : null
}

export const WOCHENTAGE = ["", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

export function zeitpunktText(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}
