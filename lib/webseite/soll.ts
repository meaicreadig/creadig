import { firmenText } from "@/lib/firmenwahrheit"

/**
 * Das Soll der Webseite — woran der Website-Prüfer den echten Text misst.
 *
 * Technik (Titel, Links, Header) prüft er ohnehin. Was ihm fehlte, war die
 * Frage, ob die Seite noch sagt, was creaDIG heute IST: Angebote, Preise,
 * Belege, verbotene Behauptungen. Ändert sich das Geschäft, ändert sich diese
 * Datei — und der Prüfer meldet am nächsten Morgen jede Seite, die nachzieht.
 */

/** Kurzfassung für KI-Blicke (Design, Inhalt) — Quelle: lib/firmenwahrheit.ts. */
export const SOLL_KURZ = `${firmenText("voll")}
Marke: Kobaltblau #2F5BEA, Schrift Manrope. Ton: sachlich, hochwertig, keine Werbefloskeln, zeigen statt behaupten.`

export type SollRegel = {
  code: string
  titel: string
  detail: string
  /** Trifft, wenn das Muster im sichtbaren Text einer Seite vorkommt. */
  muster: RegExp
  schwere: "kritisch" | "wichtig"
  an: string
}

/** Was auf keiner öffentlichen Seite stehen darf. */
export const VERBOTEN: SollRegel[] = [
  { code: "zeichen", titel: "Kaputte Zeichen im Text", detail: "Ein Ersatzzeichen (U+FFFD) steht im sichtbaren Text — ein Buchstabe ist beim Speichern verloren gegangen.", muster: /\uFFFD/, schwere: "wichtig", an: "entwicklung" },
  { code: "platzhalter", titel: "Platzhalter öffentlich sichtbar", detail: "Ein Platzhalter oder „folgt“-Vermerk steht auf der Live-Seite.", muster: /(Platzhalter|Placeholder|Yer tutucu)\s*[—–-]|noch nicht freigegeben|not yet released|lorem ipsum|\bTODO\b/i, schwere: "kritisch", an: "recht" },
  { code: "inhaber-offen", titel: "Offene Inhaber-Bestätigung öffentlich sichtbar", detail: "Ein Vermerk wie „Bestätigung durch den Inhaber offen“ steht im Live-Text.", muster: /Bestätigung durch den Inhaber offen|Inhaber-Bestätigung offen/i, schwere: "kritisch", an: "recht" },
  { code: "zertifikat", titel: "Nicht belegte Zertifizierung genannt", detail: "BAFA, go-digital, iuk, AVPQ und AGD sind nicht nachgewiesen und dürfen weder als Status noch als Angebot auftauchen.", muster: /\b(BAFA|AVPQ|AGD)\b|go-digital|zertifizierte?r? (Partner|Berater)|autorisierte?s? Beratungsunternehmen/i, schwere: "kritisch", an: "recht" },
]

/** Aussagen, die sich auf der ganzen Seite nicht widersprechen dürfen. */
export const WIDERSPRUECHE: { code: string; titel: string; detail: string; a: RegExp; b: RegExp; an: string }[] = [
  {
    code: "ust",
    titel: "Umsatzsteuer widersprüchlich",
    detail: "Eine Seite nennt „zzgl. 19 % USt.“, eine andere die Kleinunternehmerregelung (§ 19 UStG). Nur eines kann stimmen.",
    a: /zzgl\.?\s*19\s*%/i,
    b: /§\s*19\s*UStG|Kleinunternehmer/i,
    an: "recht",
  },
]

/** Was es geben muss — Pfad antwortet mit 200 und enthält das Muster. */
export const PFLICHT: { code: string; titel: string; pfad: string; muster: RegExp; an: string }[] = [
  { code: "bfsg-angebot", titel: "BFSG-Angebot mit Preis", pfad: "/leistungen/barrierefreiheit-website", muster: /1\.500/, an: "marketing" },
  { code: "stammo", titel: "stammo bei den Produkten", pfad: "/produkte", muster: /stammo/i, an: "marketing" },
]
