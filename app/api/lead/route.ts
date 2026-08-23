import { NextResponse } from "next/server"
import { SITE_URL } from "@/lib/routes"
import { raiseAlert } from "@/lib/alert"
import {
  bucketKey,
  callerAddress,
  issueFormToken,
  LIMITS_INFO,
  verifyFormToken,
  withinLimit,
} from "@/lib/lead-guard"

/**
 * DER LEAD-WEG — der Boden des Trichters.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESE ROUTE DIE WICHTIGSTE DATEI DES PROJEKTS IST
 * `find app -name "route.ts"` fand bis hier null Treffer. Das Kontaktformular
 * rief `window.open(whatsappHref)`, der Termin-Assistent zeigte „Anfrage
 * steht." per `setTimeout`. Es gab also keinen Ort, an dem eine Anfrage
 * landen konnte — und das, nicht die Typografie, ist der Grund für null
 * Anfragen in Jahren.
 *
 * ---------------------------------------------------------------------------
 * WAS SIE TUT
 * Nimmt eine Anfrage entgegen, schickt sie an `info@creadig.de` und dem
 * Absender eine Bestätigung. Zwei Mails, kein Speicher: Wir legen hier
 * bewusst keine Datenbank an — die Anfrage liegt im Postfach, und die
 * Speicherfrist dort (6 Monate nach dem letzten Kontakt, bei Vertrag die
 * handels- und steuerrechtlichen Fristen) steht in der Datenschutzerklärung.
 * Weniger Speicherorte heißt weniger, was jemand herausgeben, löschen oder
 * verlieren kann.
 *
 * ---------------------------------------------------------------------------
 * KEINE ZUGANGSDATEN IM REPO
 * Der Versand läuft über die HTTP-Schnittstelle von Resend — bewusst per
 * `fetch` statt über das SDK, damit das Projekt keine weitere Abhängigkeit
 * bekommt. Alles Geheime kommt aus der Umgebung:
 *
 *   RESEND_API_KEY   Pflicht. Ohne ihn antwortet die Route mit 503 und das
 *                    Formular zeigt die anderen Wege — sie meldet NIE einen
 *                    Erfolg, den es nicht gab.
 *   LEAD_FROM        Absenderadresse einer bei Resend verifizierten Domain,
 *                    z. B. "creaDIG <anfrage@creadig.de>".
 *   LEAD_TO          Empfänger. Standard: info@creadig.de
 *
 * ---------------------------------------------------------------------------
 * SPAM UND MISSBRAUCH (BF-2 / R-2)
 * Drei Hürden, keine davon ein Captcha:
 *
 *   1. Ein verstecktes Feld (`website`). Ist es gefüllt, antwortet die Route
 *      mit `ok`, verschickt aber nichts: Ein Bot, der eine Fehlermeldung
 *      bekommt, probiert es erneut.
 *   2. Ein signiertes Zeit-Token, das das Formular beim Aufbau über `GET`
 *      dieser Route holt. Fehlt es, ist es gefälscht, abgelaufen — oder war
 *      das Formular schneller ausgefüllt als ein Mensch tippen kann, geht
 *      nichts raus.
 *   3. Ein Fenster je Absender-Adresse im Arbeitsspeicher.
 *
 * Alles davon läuft VOR dem Versand. Die Bestätigungsmail an die eingegebene
 * Adresse ist der empfindlichste Teil: Sie geht an einen Fremden, in unserem
 * Namen. Ein ungebremster Endpunkt macht daraus Backscatter und beschädigt die
 * Zustellbarkeit genau der Domain, über die alle Angebote rausgehen.
 *
 * Grenzen ehrlich benannt: Das IP-Fenster gilt pro Serverless-Instanz und ist
 * nach einem Kaltstart leer (siehe `lib/lead-guard.ts`). Ein belastbares Limit
 * über alle Instanzen braucht einen geteilten Zähler — Owner-Punkt.
 */

/*
 * Die Route liest Kopfzeilen des Aufrufers und stellt Token aus; beides
 * verträgt kein Vorrendern und keinen Zwischenspeicher.
 */
export const dynamic = "force-dynamic"

/**
 * Das Token für ein frisch aufgebautes Formular. Bewusst ohne jede Angabe zum
 * Aufrufer: Es sagt nur, wann es ausgestellt wurde, und beweist mit seiner
 * Signatur, dass es von uns stammt.
 */
export async function GET(request: Request) {
  const now = Date.now()
  const key = await bucketKey("token", callerAddress(request))

  if (!withinLimit(key, LIMITS_INFO.MAX_TOKENS, now)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    )
  }

  const token = await issueFormToken(now)
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }

  return NextResponse.json({ ok: true, token }, { headers: { "Cache-Control": "no-store" } })
}

/** Nur diese Sprachen haben Bestätigungstexte. Alles andere fällt auf DE. */
type Locale = "de" | "tr"

type LeadPayload = {
  name?: unknown
  business?: unknown
  email?: unknown
  phone?: unknown
  message?: unknown
  privacyOk?: unknown
  locale?: unknown
  /** Honeypot — muss leer bleiben. */
  website?: unknown
  /** Woher die Anfrage kam: "kontakt" oder "termin". */
  source?: unknown
  /** Signiertes Zeit-Token aus `GET` dieser Route. */
  token?: unknown
}

const LIMITS = {
  name: 120,
  business: 160,
  email: 200,
  phone: 60,
  message: 4000,
  source: 40,
  /** BF-2: abgeschickte Anfragen je Adresse und Zeitfenster. */
  submitsPerWindow: LIMITS_INFO.MAX_SUBMITS,
} as const

function asText(value: unknown, max: number): string {
  if (typeof value !== "string") return ""
  return value.trim().slice(0, max)
}

/**
 * Absichtlich locker: Diese Prüfung soll Tippfehler abfangen, nicht
 * Adressen aussortieren. Wer eine gültige, aber ungewöhnliche Adresse hat,
 * darf nicht am Formular scheitern.
 */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

/** Verhindert, dass eingeschleuste Zeilenumbrüche eigene Kopfzeilen bauen. */
function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim()
}

/**
 * BF-1 — die Bestätigung sagt nicht mehr, was sie nicht weiß.
 *
 * Der Termin-Assistent sammelte Wunschzeiten ein, und diese Mail antwortete
 * darauf mit einem allgemeinen "Ihre Anfrage ist angekommen" — der Absender
 * durfte daraus lesen, was er wollte, und las meistens: gebucht. Jetzt gibt es
 * zwei Fassungen. Die Termin-Fassung sagt in ihrer Betreffzeile und im ersten
 * Absatz, dass die verbindliche Bestätigung noch aussteht und von uns kommt.
 */
type ConfirmationKind = "kontakt" | "termin"

/*
 * BF-8 — die Reaktionszusage, an einer Stelle.
 *
 * Hier stand "am naechsten Werktag", an anderer Stelle "innerhalb von 24
 * Stunden". Beides war zu eng: Ein Ein-Mann-Haus kann das an einem
 * Freitagabend, im Urlaub oder mitten in einer Auslieferung nicht halten —
 * und wer eine Frist liest, die verstreicht, haelt uns fuer unzuverlaessig,
 * bevor das erste Gespraech stattgefunden hat. Zwei Werktage sind haltbar
 * und werden fast immer unterboten.
 *
 * Dieselbe Frist steht auf der Seite in `dictionary.ts`
 * (`process.opsSteps.request`, `contact.sentBody`, `termin.done.reply`).
 * Wer sie hier aendert, aendert sie dort mit.
 */
const RESPONSE_TIME = {
  de: "innerhalb von zwei Werktagen",
  tr: "iki iş günü içinde",
  /*
   * Satzanfang getrennt gefuehrt statt per `toUpperCase()`: Im Tuerkischen
   * wird aus kleinem i ein grosses İ, JavaScript macht daraus nach
   * Standardregel ein I — ein anderer Buchstabe. Genau der Fehler, gegen den
   * `<html lang="tr">` im Layout gesetzt wurde.
   */
  trSentenceStart: "İki iş günü içinde",
} as const

const SIGNATURE_DE = [
  "",
  "Herzliche Grüße",
  "Muhammed Emin Akyol",
  "creaDIG · ICO InnovationsCentrum Osnabrück",
]

const SIGNATURE_TR = [
  "",
  "Selamlar",
  "Muhammed Emin Akyol",
  "creaDIG · ICO InnovationsCentrum Osnabrück",
]

/**
 * V-1 — die Bestätigungsmail arbeitet jetzt.
 *
 * ---------------------------------------------------------------------------
 * WAS SIE VORHER WAR
 * Vier Zeilen: „Ihre Anfrage ist angekommen, wir melden uns." Ein Beleg, sonst
 * nichts. Dabei ist das der einzige Moment, in dem ein Interessent uns
 * garantiert liest — er hat gerade selbst geschrieben und wartet. Diese
 * Aufmerksamkeit verfiel ungenutzt, und in der Zwischenzeit bis zum Rückruf
 * konnte er drei andere Angebote anfragen.
 *
 * ---------------------------------------------------------------------------
 * WAS SIE JETZT TUT — DREI DINGE, KEINE WERBUNG
 *   1. Sie sagt, WAS ALS NÄCHSTES PASSIERT. Wer den Ablauf kennt, wartet
 *      ruhiger und fragt nicht anderswo nach.
 *   2. Sie sagt, WAS WIR IM GESPRÄCH BRAUCHEN — Zugänge, Bestand, was heute
 *      hakt. Wer das vorher zusammensucht, verkürzt das Erstgespräch um die
 *      halbe Zeit; und wer es nicht tut, hat trotzdem schon einmal darüber
 *      nachgedacht.
 *   3. Sie zeigt EINEN Beleg statt einer Selbstbeschreibung: meAI, das
 *      stärkste eigene System — gebaut, betrieben und täglich benutzt.
 *
 * Kein Nachfass-Angebot, kein Rabatt, keine zweite Bitte. Die Mail schuldet
 * dem Empfänger etwas, nicht umgekehrt.
 */
const PROOF_URL = `${SITE_URL}/produkte/meai`
const PROOF_URL_TR = `${SITE_URL}/tr/produkte/meai`

const NEXT_STEPS_DE = [
  "WIE ES WEITERGEHT",
  `1. Wir lesen Ihre Anfrage und melden uns ${RESPONSE_TIME.de} bei Ihnen.`,
  "2. Zwanzig Minuten Erstgespräch — kostenlos, unverbindlich, per Telefon oder Video.",
  "3. Danach sagen wir ehrlich, ob wir helfen können, was wir bauen würden und was es kostet.",
]

const BRING_DE = [
  "WAS DAS GESPRÄCH KÜRZER MACHT",
  "Falls Sie es zur Hand haben:",
  "· Ihre bestehende Website und wer die Zugänge dazu hat",
  "· Ihr Google-Unternehmensprofil, falls es eines gibt",
  "· wo die Domain liegt und wer sie verwaltet",
  "· ein, zwei Sätze dazu, was im Alltag gerade hakt",
  "Fehlt etwas davon: kein Problem. Wir finden es gemeinsam.",
]

const PROOF_DE = [
  "WORAN SIE UNSERE ARBEIT SEHEN",
  "meAI ist unser eigenes System — von uns gebaut, von uns betrieben, täglich",
  "im eigenen Haus benutzt:",
  PROOF_URL,
]

const CLOSING_DE = [
  "Diese Nachricht ist eine automatische Bestätigung; Sie müssen darauf nicht antworten.",
  "Wenn es eilt, erreichen Sie uns direkt unter info@creadig.de.",
]

const NEXT_STEPS_TR = [
  "BUNDAN SONRA NE OLACAK",
  `1. Talebinizi okur ve ${RESPONSE_TIME.tr} size döneriz.`,
  "2. Yirmi dakikalık ilk görüşme — ücretsiz, bağlayıcı değil, telefonla ya da görüntülü.",
  "3. Ardından yardımcı olup olamayacağımızı, ne kuracağımızı ve maliyetini dürüstçe söyleriz.",
]

const BRING_TR = [
  "GÖRÜŞMEYİ KISALTAN ŞEYLER",
  "Elinizin altındaysa:",
  "· Mevcut web siteniz ve erişim bilgilerinin kimde olduğu",
  "· Varsa Google işletme profiliniz",
  "· Alan adının nerede olduğu ve kimin yönettiği",
  "· Günlük işleyişte şu an neyin aksadığına dair bir iki cümle",
  "Bunlardan biri eksikse sorun değil — birlikte buluruz.",
]

const PROOF_TR = [
  "İŞİMİZİ NEREDE GÖREBİLİRSİNİZ",
  "meAI bizim kendi sistemimiz — biz kurduk, biz işletiyoruz ve her gün",
  "kendi işimizde kullanıyoruz:",
  PROOF_URL_TR,
]

const CLOSING_TR = [
  "Bu mesaj otomatik bir onaydır; yanıtlamanız gerekmez.",
  "Acele bir durum varsa doğrudan info@creadig.de adresinden bize ulaşabilirsiniz.",
]

/** Absätze mit genau einer Leerzeile dazwischen — Plaintext, aber lesbar. */
function paragraphs(blocks: string[][]): string {
  return blocks
    .map((block) => block.join("\n"))
    .filter(Boolean)
    .join("\n\n")
}

const CONFIRMATION: Record<
  Locale,
  Record<ConfirmationKind, { subject: string; body: (name: string) => string }>
> = {
  de: {
    kontakt: {
      subject: "Ihre Anfrage bei creaDIG",
      body: (name) =>
        paragraphs([
          [name ? `Guten Tag ${name},` : "Guten Tag,"],
          ["vielen Dank für Ihre Anfrage — sie ist bei uns angekommen."],
          NEXT_STEPS_DE,
          BRING_DE,
          PROOF_DE,
          CLOSING_DE,
          SIGNATURE_DE.slice(1),
        ]),
    },
    termin: {
      subject: "Terminwunsch erhalten — wir bestätigen Ihnen den Termin",
      body: (name) =>
        paragraphs([
          [name ? `Guten Tag ${name},` : "Guten Tag,"],
          ["vielen Dank für Ihren Terminwunsch — er ist bei uns angekommen."],
          [
            "Der Termin ist damit noch nicht gebucht: Wir gleichen Ihre Wunschzeiten ab",
            "und bestätigen Ihnen verbindlich einen Termin.",
          ],
          NEXT_STEPS_DE,
          BRING_DE,
          PROOF_DE,
          CLOSING_DE,
          SIGNATURE_DE.slice(1),
        ]),
    },
  },
  tr: {
    kontakt: {
      subject: "creaDIG talebiniz",
      body: (name) =>
        paragraphs([
          [name ? `Merhaba ${name},` : "Merhaba,"],
          ["talebiniz için teşekkür ederiz — bize ulaştı."],
          NEXT_STEPS_TR,
          BRING_TR,
          PROOF_TR,
          CLOSING_TR,
          SIGNATURE_TR.slice(1),
        ]),
    },
    termin: {
      subject: "Randevu talebiniz alındı — randevuyu size onaylayacağız",
      body: (name) =>
        paragraphs([
          [name ? `Merhaba ${name},` : "Merhaba,"],
          ["randevu talebiniz için teşekkür ederiz — bize ulaştı."],
          [
            "Randevu henüz kesinleşmedi: Belirttiğiniz zamanları değerlendirip size",
            "bağlayıcı bir randevu onayı göndereceğiz.",
          ],
          NEXT_STEPS_TR,
          BRING_TR,
          PROOF_TR,
          CLOSING_TR,
          SIGNATURE_TR.slice(1),
        ]),
    },
  },
}

async function sendMail(
  apiKey: string,
  mail: { from: string; to: string; subject: string; text: string; replyTo?: string },
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: mail.from,
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(`Resend ${response.status}: ${detail.slice(0, 300)}`)
  }
}

export async function POST(request: Request) {
  let payload: LeadPayload
  try {
    payload = (await request.json()) as LeadPayload
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 })
  }

  // Honeypot: still schlucken, aber `ok` melden — sonst probiert der Bot es erneut.
  if (asText(payload.website, 200) !== "") {
    return NextResponse.json({ ok: true })
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.LEAD_FROM
  const to = process.env.LEAD_TO || "info@creadig.de"

  /*
    Nicht konfiguriert heißt: nicht zugestellt. Die Route sagt das offen und
    das Formular zeigt daraufhin die anderen Wege. Ein „Danke, wir melden
    uns" ohne Postfach dahinter ist genau der Fehler, den diese Datei
    beseitigen soll.

    Diese Prüfung steht VOR dem Token: Ohne Geheimnis lässt sich gar kein
    Token ausstellen, und dann wäre „ungültiges Token" eine irreführende
    Antwort auf ein Problem, das auf unserer Seite liegt.
  */
  if (!apiKey || !from) {
    /*
      T-2 — das ist kein Log-Eintrag, das ist ein Notfall: JEDE Anfrage geht
      in diesem Zustand verloren, und der Absender bekommt eine Fehlermeldung
      in unserem Namen.
    */
    await raiseAlert(
      "lead-not-configured",
      "RESEND_API_KEY oder LEAD_FROM fehlt — jede Anfrage geht verloren.",
    )
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 })
  }

  /*
    BF-2 — die zweite Hürde. `too_fast` und `expired` bekommen eigene Codes,
    damit das Formular sinnvoll reagieren kann: neu holen und noch einmal
    schicken statt eine Fehlermeldung zu zeigen, die niemand versteht.
  */
  const now = Date.now()
  const verdict = await verifyFormToken(payload.token, now)
  if (verdict !== "ok") {
    if (verdict === "too_fast") {
      console.warn("[lead] Absenden schneller als moeglich — nichts verschickt")
    }
    return NextResponse.json(
      { ok: false, error: verdict === "expired" ? "token_expired" : "token_invalid" },
      { status: verdict === "expired" ? 409 : 400 },
    )
  }

  /*
    BF-2 — die dritte Hürde. Sie zählt erst hier mit, nach dem Token: Ein
    Skript ohne gültiges Token soll das Fenster eines echten Besuchers hinter
    derselben Firmen-IP nicht auffüllen können.
  */
  if (!withinLimit(await bucketKey("lead", callerAddress(request)), LIMITS.submitsPerWindow, now)) {
    console.warn("[lead] Fenster ausgeschoepft — nichts verschickt")
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 })
  }

  const name = asText(payload.name, LIMITS.name)
  const business = asText(payload.business, LIMITS.business)
  const email = asText(payload.email, LIMITS.email)
  const phone = asText(payload.phone, LIMITS.phone)
  const message = asText(payload.message, LIMITS.message)
  const source = asText(payload.source, LIMITS.source) || "kontakt"
  const locale: Locale = payload.locale === "tr" ? "tr" : "de"

  /*
    Die Einwilligung wird hier NOCH EINMAL geprüft, obwohl das Formular sie
    schon verlangt. Eine Prüfung, die nur im Browser stattfindet, ist keine
    Prüfung — und ohne Einwilligung fehlt die Rechtsgrundlage nach
    Art. 6 Abs. 1 lit. a DSGVO für die Verarbeitung.
  */
  if (payload.privacyOk !== true) {
    return NextResponse.json({ ok: false, error: "privacy_required" }, { status: 400 })
  }

  const missing: string[] = []
  if (!name) missing.push("name")
  if (!message) missing.push("message")
  if (!email || !looksLikeEmail(email)) missing.push("email")
  if (!phone) missing.push("phone")
  if (missing.length > 0) {
    return NextResponse.json({ ok: false, error: "invalid", fields: missing }, { status: 400 })
  }

  const lines = [
    `Name:      ${name}`,
    business ? `Betrieb:   ${business}` : null,
    `E-Mail:    ${email}`,
    `Telefon:   ${phone}`,
    `Sprache:   ${locale.toUpperCase()}`,
    `Herkunft:  ${source}`,
    "",
    "Nachricht:",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n")

  try {
    await sendMail(apiKey, {
      from,
      to,
      subject:
        source === "termin"
          ? `Terminwunsch über creadig.de — ${headerSafe(name)}`
          : `Anfrage über creadig.de — ${headerSafe(name)}`,
      text: lines,
      // Direkt aus dem Postfach antworten können, ohne die Adresse zu suchen.
      replyTo: email,
    })
  } catch (error) {
    // T-2 — die Anfrage ist an dieser Stelle verloren. Nichts hier faengt sie
    // auf; wer davon nicht erfaehrt, erfaehrt gar nichts.
    await raiseAlert(
      "lead-send-failed",
      `Zustellung an das eigene Postfach fehlgeschlagen: ${String(error).slice(0, 300)}`,
    )
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 })
  }

  /*
    Die Bestätigung an den Absender darf den Vorgang NICHT scheitern lassen:
    Die Anfrage liegt an dieser Stelle bereits im Postfach. Schlägt nur die
    Bestätigung fehl, hat der Interessent trotzdem angefragt — ihm eine
    Fehlermeldung zu zeigen, würde ihn ein zweites Mal schicken.
  */
  const kind: ConfirmationKind = source === "termin" ? "termin" : "kontakt"

  try {
    await sendMail(apiKey, {
      from,
      to: email,
      subject: CONFIRMATION[locale][kind].subject,
      text: CONFIRMATION[locale][kind].body(name),
    })
  } catch (error) {
    /*
      Niedrigere Stufe, aber gemeldet: Die Anfrage liegt bereits im Postfach,
      es fehlt "nur" die Eingangsbestaetigung. Haeuft sich das, stimmt etwas
      mit der Absender-Domain nicht — und das faellt sonst erst auf, wenn die
      Zustellbarkeit insgesamt kippt.
    */
    await raiseAlert(
      "lead-confirmation-failed",
      `Eingangsbestaetigung an den Absender fehlgeschlagen: ${String(error).slice(0, 300)}`,
    )
  }

  return NextResponse.json({ ok: true })
}
