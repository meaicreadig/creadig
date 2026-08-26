#!/usr/bin/env node
/**
 * BF-4 — der Rauchtest.
 *
 * ---------------------------------------------------------------------------
 * WAS ER BEWEIST
 * `next build` sagt nur, dass sich die Seite bauen laesst. Ob sie danach auch
 * ANTWORTET, stand nie irgendwo: eine kaputte Route, eine 404 auf einer
 * Detailseite, ein Schutz, den jemand beim Aufraeumen entfernt hat — nichts
 * davon faellt beim Bauen auf. Dieser Test startet den gebauten Server und
 * fragt nach.
 *
 * Die wichtigste Pruefung ist die letzte: Ein Absenden mit gefuelltem
 * Honeypot MUSS mit `{ok:true}` und ohne Versand antworten. Die Pruefung ist
 * so gebaut, dass sie FEHLSCHLAEGT, wenn der Schutz entfernt wird — der
 * Server laeuft mit einem absichtlich ungueltigen Resend-Schluessel, ein
 * echter Versandversuch endet also in einer 502. Ein gruener Honeypot-Test
 * heisst damit: Es wurde nichts verschickt.
 *
 * Aufruf: `npm run build && npm run smoke`
 */
import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const PORT = Number(process.env.SMOKE_PORT ?? 4322)
const BASE = `http://127.0.0.1:${PORT}`

const results = []
function record(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`${ok ? "  ok  " : "  FEHL"}  ${name}${detail ? ` — ${detail}` : ""}`)
}

async function expectStatus(pathname, expected) {
  const response = await fetch(`${BASE}${pathname}`, { redirect: "manual" })
  record(
    `${pathname} → ${expected}`,
    response.status === expected,
    response.status === expected ? "" : `war ${response.status}`,
  )
  return response
}

async function postLead(body) {
  const response = await fetch(`${BASE}/api/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => null)
  return { status: response.status, data }
}

const LEAD = {
  name: "Rauchtest",
  business: "creaDIG",
  email: "rauchtest@example.com",
  phone: "+49 000 000",
  message: "Rauchtest",
  privacyOk: true,
  locale: "de",
  source: "kontakt",
}

async function run() {
  // Seiten, die es geben MUSS.
  for (const pathname of [
    "/",
    "/tr",
    "/kontakt",
    "/leistungen",
    "/leistungen/webdesign",
    "/leistungen/barrierefreiheit-website",
    "/produkte/meai",
    "/tr/kontakt",
    "/tr/leistungen/webdesign",
    "/tr/leistungen/barrierefreiheit-website",
    "/insights",
    "/insights/eigene-seite-geprueft",
    "/tr/insights/eigene-seite-geprueft",
    /* MP10-4 — die beiden Seiten dieser Runde, in beiden Sprachen. */
    "/betrieb",
    "/tr/betrieb",
    "/systeme",
    "/tr/systeme",
  ]) {
    await expectStatus(pathname, 200)
  }

  // Fehlerseiten (BF-3) — der Status ist das, woran Suchmaschinen sich halten.
  await expectStatus("/diese-adresse-gibt-es-nicht", 404)
  await expectStatus("/tr/bu-adres-yok", 404)

  // Vorschaubild (T-1).
  const og = await expectStatus("/og/de.png", 200)
  record(
    "/og/de.png ist ein PNG",
    og.headers.get("content-type")?.includes("image/png") === true,
    og.headers.get("content-type") ?? "kein Content-Type",
  )

  const page = await (await fetch(`${BASE}/leistungen`)).text()
  record("/leistungen traegt og:image", page.includes('property="og:image"'))

  // Der Selbsttest ist ohne Geheimnis abgeschaltet (BF-8).
  await expectStatus("/api/selftest", 503)

  // ── BF-2: die drei Huerden ────────────────────────────────────────────
  const noToken = await postLead(LEAD)
  record(
    "Absenden ohne Token wird abgelehnt",
    noToken.status === 400 && noToken.data?.ok !== true,
    `${noToken.status} ${JSON.stringify(noToken.data)}`,
  )

  const fresh = await (await fetch(`${BASE}/api/lead`)).json()
  const tooFast = await postLead({ ...LEAD, token: fresh.token })
  record(
    "Absenden schneller als ein Mensch wird abgelehnt",
    tooFast.status === 400 && tooFast.data?.ok !== true,
    `${tooFast.status} ${JSON.stringify(tooFast.data)}`,
  )

  /*
    Der Honeypot. Das Token ist gueltig und alt genug — der Vorgang wuerde
    ohne den Honeypot bis zum Versand laufen und dort an dem absichtlich
    ungueltigen Schluessel scheitern (502). `{ok:true}` bei 200 beweist also,
    dass frueher abgebrochen und NICHTS verschickt wurde.
  */
  const token = (await (await fetch(`${BASE}/api/lead`)).json()).token
  await new Promise((resolve) => setTimeout(resolve, 2_500))
  const honeypot = await postLead({ ...LEAD, token, website: "http://spam.example" })
  record(
    "gefuellter Honeypot: keine Mail, keine Fehlermeldung",
    honeypot.status === 200 && honeypot.data?.ok === true,
    `${honeypot.status} ${JSON.stringify(honeypot.data)}`,
  )

  /*
    BF-A8 — das zusaetzliche Pflichtfeld des Kurz-Checks.

    Geprueft wird die Ablehnung, nicht der Erfolgsfall: Ein vollstaendiger
    Kurz-Check liefe bis zum Versand durch und scheiterte dort am absichtlich
    ungueltigen Schluessel. Die Ablehnung beweist genau das, worauf es
    ankommt — ohne Adresse gibt es keinen Kurz-Check, und die Pruefung
    findet auf dem Server statt, nicht nur im Formular.
  */
  const quickToken = (await (await fetch(`${BASE}/api/lead`)).json()).token
  await new Promise((resolve) => setTimeout(resolve, 2_500))
  const ohneAdresse = await postLead({
    ...LEAD,
    token: quickToken,
    source: "kurzcheck",
    message: "",
  })
  record(
    "Kurz-Check ohne Website-Adresse wird abgelehnt",
    ohneAdresse.status === 400 && ohneAdresse.data?.fields?.includes("siteUrl") === true,
    `${ohneAdresse.status} ${JSON.stringify(ohneAdresse.data)}`,
  )

  const kaputteAdresse = await postLead({
    ...LEAD,
    token: quickToken,
    source: "kurzcheck",
    message: "",
    siteUrl: "kein punkt hier",
  })
  record(
    "Kurz-Check mit unbrauchbarer Adresse wird abgelehnt",
    kaputteAdresse.status === 400 && kaputteAdresse.data?.fields?.includes("siteUrl") === true,
    `${kaputteAdresse.status} ${JSON.stringify(kaputteAdresse.data)}`,
  )

  /*
    Gegenprobe: MIT Adresse laeuft derselbe Aufruf bis zum Versand durch und
    scheitert erst dort (502). Ohne diese Zeile bewiese der Test oben nur,
    dass die Route irgendetwas ablehnt.
  */
  const mitAdresse = await postLead({
    ...LEAD,
    token: quickToken,
    source: "kurzcheck",
    message: "",
    siteUrl: "beispielbetrieb.de",
  })
  record(
    "Kurz-Check mit Adresse kommt bis zum Versand",
    mitAdresse.status === 502,
    `${mitAdresse.status} ${JSON.stringify(mitAdresse.data)}`,
  )
}

async function waitForServer(timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/`, { redirect: "manual" })
      if (response.status < 500) return
    } catch {
      // noch nicht da
    }
    await new Promise((resolve) => setTimeout(resolve, 400))
  }
  throw new Error(`Server kam auf ${BASE} nicht hoch.`)
}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: ROOT,
  stdio: "ignore",
  env: {
    ...process.env,
    NODE_ENV: "production",
    // Absichtlich ungueltig: Ein echter Versandversuch MUSS scheitern, sonst
    // beweist der Honeypot-Test nichts.
    RESEND_API_KEY: "re_smoketest_invalid",
    LEAD_FROM: "creaDIG <rauchtest@example.invalid>",
    LEAD_TO: "rauchtest@example.invalid",
    LEAD_TOKEN_SECRET: "rauchtest-geheimnis",
    SELFTEST_SECRET: "",
  },
})

try {
  await waitForServer()
  console.log(`Rauchtest gegen ${BASE}\n`)
  await run()
} finally {
  server.kill("SIGTERM")
}

const failed = results.filter((entry) => !entry.ok)
console.log(`\n${results.length - failed.length}/${results.length} Pruefungen bestanden.`)
if (failed.length > 0) {
  console.error(`Fehlgeschlagen: ${failed.map((entry) => entry.name).join(", ")}`)
  process.exit(1)
}
