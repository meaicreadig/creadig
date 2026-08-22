import { NextResponse } from "next/server"

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
 * SPAM
 * Ein verstecktes Feld (`website`), sonst nichts. Kein Captcha — das ist
 * gesperrt, und es kostet an dieser Stelle mehr echte Anfragen als es
 * Bots abhält. Ist das Feld gefüllt, antwortet die Route mit `ok`, verschickt
 * aber nichts: Ein Bot, der eine Fehlermeldung bekommt, probiert es erneut.
 */

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
}

const LIMITS = {
  name: 120,
  business: 160,
  email: 200,
  phone: 60,
  message: 4000,
  source: 40,
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

const CONFIRMATION: Record<Locale, { subject: string; body: (name: string) => string }> = {
  de: {
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
        "",
        "Herzliche Grüße",
        "Muhammed Emin Akyol",
        "creaDIG · ICO InnovationsCentrum Osnabrück",
      ].join("\n"),
  },
  tr: {
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
        "",
        "Selamlar",
        "Muhammed Emin Akyol",
        "creaDIG · ICO InnovationsCentrum Osnabrück",
      ].join("\n"),
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

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.LEAD_FROM
  const to = process.env.LEAD_TO || "info@creadig.de"

  /*
    Nicht konfiguriert heißt: nicht zugestellt. Die Route sagt das offen und
    das Formular zeigt daraufhin die anderen Wege. Ein „Danke, wir melden
    uns" ohne Postfach dahinter ist genau der Fehler, den diese Datei
    beseitigen soll.
  */
  if (!apiKey || !from) {
    console.error("[lead] RESEND_API_KEY oder LEAD_FROM fehlt — Anfrage NICHT zugestellt")
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 })
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
      subject: `Anfrage über creadig.de — ${headerSafe(name)}`,
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
  try {
    await sendMail(apiKey, {
      from,
      to: email,
      subject: CONFIRMATION[locale].subject,
      text: CONFIRMATION[locale].body(name),
    })
  } catch (error) {
    console.error("[lead] Bestaetigung an den Absender fehlgeschlagen:", error)
  }

  return NextResponse.json({ ok: true })
}
