import { NextResponse } from "next/server"
import { issueFormToken, verifyFormToken } from "@/lib/lead-guard"
import { raiseAlert } from "@/lib/alert"

/**
 * BF-8 — der Zustell-Selbsttest.
 *
 * ---------------------------------------------------------------------------
 * DAS PROBLEM, DAS ER LÖST
 * Der Lead-Weg ist der Boden des Trichters, und er kann still ausfallen: Der
 * Resend-Schlüssel wird gedreht oder läuft ab, die Absender-Domain verliert
 * ihre Verifizierung, jemand entfernt beim Aufräumen eine Umgebungsvariable.
 * Nichts davon wirft einen Fehler, den irgendwer sieht. Die Seite steht weiter
 * da, das Formular sieht aus wie immer — und für jede Anfrage kommt eine 503
 * oder 502, die nur der Interessent liest. Wir merken es daran, dass wochenlang
 * nichts kommt, und halten das für Marktlage.
 *
 * ---------------------------------------------------------------------------
 * WAS ER PRÜFT — UND WARUM ER DABEI KEINE MAIL VERSCHICKT
 * Vier Prüfungen, alle ohne Versand:
 *
 *   env      Sind RESEND_API_KEY und LEAD_FROM da, und ist LEAD_FROM eine
 *            Adresse, aus der sich eine Domain lesen lässt?
 *   token    Stellt `lib/lead-guard` ein Token aus, das es selbst wieder
 *            akzeptiert? (Prüft die Kette, an der jedes Absenden hängt.)
 *   guard    Lehnt es ein manipuliertes Token ab? Ein Schutz, der alles
 *            durchlässt, ist schlimmer als keiner, weil er beruhigt.
 *   resend   Kennt Resend den Schlüssel, und ist die Absender-Domain dort
 *            verifiziert? Genau das fällt beim Schlüsseltausch als Erstes um.
 *
 * Ein Versand bei jedem Lauf würde das Kontingent verbrauchen und das eigene
 * Postfach zumüllen. Wer den ganzen Weg bis zur zugestellten Mail sehen will,
 * hängt `?send=1` an — dann geht EINE als Selbsttest gekennzeichnete Mail an
 * LEAD_TO. Das ist der Griff für die Live-Checkliste, nicht für den Betrieb.
 *
 * ---------------------------------------------------------------------------
 * WIE ALARMIERT WIRD
 * Bei einem Fehlschlag antwortet die Route mit 503. Das ist die Sprache, die
 * jeder Cron-Dienst und jeder Uptime-Wächter versteht — ohne dass wir einen
 * zweiten Kanal bauen, der selbst ausfallen kann. Zusätzlich geht, falls
 * `ALERT_WEBHOOK_URL` gesetzt ist, eine kurze Meldung dorthin.
 *
 * AKTIVIERUNG IST EIN OWNER-PUNKT: Der Code läuft, aber jemand muss ihn
 * regelmäßig aufrufen (Vercel Cron, ein Uptime-Dienst, ein Cron auf einem
 * eigenen Rechner) und `SELFTEST_SECRET` setzen. Ohne das ist die Route
 * abgeschaltet und meldet 503 — auch das ist ehrlicher als eine offene Route,
 * die jeder aufrufen kann.
 */
export const dynamic = "force-dynamic"

type Check = { name: string; ok: boolean; detail: string }

/** Vergleich ohne Laufzeit-Unterschied. */
function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** "creaDIG <anfrage@creadig.de>" → "creadig.de" */
function senderDomain(from: string): string | null {
  const match = from.match(/<?([^\s<>@]+)@([^\s<>]+?)>?$/)
  return match ? match[2].toLowerCase() : null
}

async function checkResend(apiKey: string, domain: string | null): Promise<Check> {
  let response: Response
  try {
    response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
  } catch (error) {
    return { name: "resend", ok: false, detail: `nicht erreichbar: ${String(error)}` }
  }

  /* 400 kommt bei einem formal kaputten Schluessel, 401 bei einem gueltig
     geformten, den Resend nicht kennt — fuer uns dasselbe Ergebnis. */
  if (response.status === 400 || response.status === 401) {
    return {
      name: "resend",
      ok: false,
      detail: `Schlüssel abgelehnt (${response.status}) — RESEND_API_KEY prüfen`,
    }
  }
  /*
    403 heißt: Der Schlüssel ist gültig, darf aber die Domain-Liste nicht
    lesen (ein reiner Sende-Schlüssel). Das ist kein Ausfall — es heißt nur,
    dass diese eine Prüfung hier nicht möglich ist. Wir sagen das, statt
    Alarm zu schlagen.
  */
  if (response.status === 403) {
    return {
      name: "resend",
      ok: true,
      detail: "Schlüssel gültig, aber ohne Leserecht auf Domains — Verifizierung nicht prüfbar",
    }
  }
  if (!response.ok) {
    return { name: "resend", ok: false, detail: `unerwartete Antwort ${response.status}` }
  }

  const payload = (await response.json().catch(() => null)) as {
    data?: { name?: string; status?: string }[]
  } | null
  const entries = payload?.data ?? []
  const entry = domain ? entries.find((item) => item.name?.toLowerCase() === domain) : undefined

  if (!entry) {
    return {
      name: "resend",
      ok: false,
      detail: `Absender-Domain "${domain ?? "?"}" ist bei Resend nicht angelegt`,
    }
  }
  if (entry.status !== "verified") {
    return {
      name: "resend",
      ok: false,
      detail: `Absender-Domain "${domain}" steht auf "${entry.status}" statt "verified"`,
    }
  }
  return { name: "resend", ok: true, detail: `Domain "${domain}" verifiziert` }
}

async function sendTestMail(apiKey: string, from: string, to: string): Promise<Check> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "[Selbsttest] creaDIG — der Lead-Weg trägt",
        text: [
          "Diese Mail hat der Selbsttest von app/api/selftest verschickt.",
          "Sie beweist, dass der ganze Weg steht: Schlüssel, Absender-Domain, Zustellung.",
          "",
          "Kommt sie an, ist nichts zu tun.",
        ].join("\n"),
      }),
    })
    if (!response.ok) {
      const detail = await response.text().catch(() => "")
      return { name: "mail", ok: false, detail: `Resend ${response.status}: ${detail.slice(0, 200)}` }
    }
    return { name: "mail", ok: true, detail: `Testmail an ${to} übergeben` }
  } catch (error) {
    return { name: "mail", ok: false, detail: String(error) }
  }
}

/*
 * T-2 — der Selbsttest benutzt denselben Alarmweg wie die Lead- und die
 * CSP-Route. Vorher stand hier eine zweite, fast gleiche Fassung; zwei
 * Alarmwege heissen im Ernstfall, dass einer davon nicht gepflegt ist.
 */
async function alert(checks: Check[]) {
  const failed = checks.filter((check) => !check.ok)
  await raiseAlert(
    "selftest",
    `Lead-Weg gestoert — ${failed.map((check) => `${check.name}: ${check.detail}`).join(" | ")}`,
  )
}

export async function GET(request: Request) {
  const secret = process.env.SELFTEST_SECRET
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "selftest_disabled" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }

  const url = new URL(request.url)
  const provided = request.headers.get("x-selftest-key") ?? url.searchParams.get("key") ?? ""
  // Ohne Schluessel gibt es diese Route nicht — 404 statt 401, damit ein
  // Fremder nicht einmal erfaehrt, dass hier etwas zu erraten waere.
  if (!equal(provided, secret)) {
    return NextResponse.json({ ok: false }, { status: 404, headers: { "Cache-Control": "no-store" } })
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.LEAD_FROM
  const to = process.env.LEAD_TO || "info@creadig.de"
  const checks: Check[] = []

  checks.push({
    name: "env",
    ok: Boolean(apiKey && from),
    detail: apiKey && from ? "RESEND_API_KEY und LEAD_FROM gesetzt" : "RESEND_API_KEY oder LEAD_FROM fehlt",
  })

  /*
    Die Token-Kette gegen sich selbst: ausstellen, zurueckdatieren (sonst
    scheitert die Mindestdauer, und das waere ein falscher Alarm), pruefen.
  */
  const issued = await issueFormToken(Date.now() - 5_000)
  checks.push({
    name: "token",
    ok: issued !== null && (await verifyFormToken(issued, Date.now())) === "ok",
    detail: issued === null ? "kein Geheimnis vorhanden" : "ausgestellt und akzeptiert",
  })

  const tampered = issued ? `${issued.slice(0, -2)}xy` : "0.xy"
  checks.push({
    name: "guard",
    ok: (await verifyFormToken(tampered, Date.now())) !== "ok",
    detail: "manipuliertes Token wird abgelehnt",
  })

  if (apiKey) {
    checks.push(await checkResend(apiKey, from ? senderDomain(from) : null))
    if (url.searchParams.get("send") === "1" && from) {
      checks.push(await sendTestMail(apiKey, from, to))
    }
  }

  const ok = checks.every((check) => check.ok)
  if (!ok) await alert(checks)

  return NextResponse.json(
    { ok, checkedAt: new Date().toISOString(), checks },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  )
}
