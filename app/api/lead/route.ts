import { NextResponse } from "next/server"
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

const CONFIRMATION: Record<
  Locale,
  Record<ConfirmationKind, { subject: string; body: (name: string) => string }>
> = {
  de: {
    kontakt: {
      subject: "Ihre Anfrage bei creaDIG",
      body: (name) =>
        [
          name ? `Guten Tag ${name},` : "Guten Tag,",
          "",
          "vielen Dank für Ihre Anfrage — sie ist bei uns angekommen.",
          "Wir melden uns am nächsten Werktag bei Ihnen.",
          "",
          "Diese Nachricht ist eine automatische Bestätigung; Sie müssen darauf nicht antworten.",
          "Wenn es eilt, erreichen Sie uns direkt unter info@creadig.de.",
          ...SIGNATURE_DE,
        ].join("\n"),
    },
    termin: {
      subject: "Terminwunsch erhalten — wir bestätigen Ihnen den Termin",
      body: (name) =>
        [
          name ? `Guten Tag ${name},` : "Guten Tag,",
          "",
          "vielen Dank für Ihren Terminwunsch — er ist bei uns angekommen.",
          "",
          "Der Termin ist damit noch nicht gebucht: Wir gleichen Ihre Wunschzeiten ab",
          "und bestätigen Ihnen verbindlich einen Termin. Wir melden uns am nächsten",
          "Werktag bei Ihnen.",
          "",
          "Diese Nachricht ist eine automatische Eingangsbestätigung; Sie müssen darauf",
          "nicht antworten. Wenn es eilt, erreichen Sie uns direkt unter info@creadig.de.",
          ...SIGNATURE_DE,
        ].join("\n"),
    },
  },
  tr: {
    kontakt: {
      subject: "creaDIG talebiniz",
      body: (name) =>
        [
          name ? `Merhaba ${name},` : "Merhaba,",
          "",
          "talebiniz için teşekkür ederiz — bize ulaştı.",
          "Bir sonraki iş günü size döneceğiz.",
          "",
          "Bu mesaj otomatik bir onaydır; yanıtlamanız gerekmez.",
          "Acele bir durum varsa doğrudan info@creadig.de adresinden bize ulaşabilirsiniz.",
          ...SIGNATURE_TR,
        ].join("\n"),
    },
    termin: {
      subject: "Randevu talebiniz alındı — randevuyu size onaylayacağız",
      body: (name) =>
        [
          name ? `Merhaba ${name},` : "Merhaba,",
          "",
          "randevu talebiniz için teşekkür ederiz — bize ulaştı.",
          "",
          "Randevu henüz kesinleşmedi: Belirttiğiniz zamanları değerlendirip size",
          "bağlayıcı bir randevu onayı göndereceğiz. Bir sonraki iş günü size döneceğiz.",
          "",
          "Bu mesaj otomatik bir alındı onayıdır; yanıtlamanız gerekmez.",
          "Acele bir durum varsa doğrudan info@creadig.de adresinden bize ulaşabilirsiniz.",
          ...SIGNATURE_TR,
        ].join("\n"),
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
    console.error("[lead] RESEND_API_KEY oder LEAD_FROM fehlt — Anfrage NICHT zugestellt")
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
    console.error("[lead] Zustellung an das eigene Postfach fehlgeschlagen:", error)
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
    console.error("[lead] Bestaetigung an den Absender fehlgeschlagen:", error)
  }

  return NextResponse.json({ ok: true })
}
