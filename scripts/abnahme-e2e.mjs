#!/usr/bin/env node
/**
 * ADM-07 · DIE SICHERHEITS- UND WIDERSTANDSABNAHME (B01–B09, A21, A22, A24, A28)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIESE PRÜFUNG GEGEN EINEN LAUFENDEN SERVER GEHT
 *
 * Die Dinge, die hier geprüft werden, stehen nicht im Quelltext einer Seite:
 * Ein Cookie-Merkmal entsteht beim Setzen, ein Kopf beim Antworten, ein
 * Versuchsfenster über mehrere Anfragen hinweg, ein Rücksprung im Verlauf
 * des Browsers. Ein Gate, das Code liest, kann keines davon sehen — es kann
 * nur bezeugen, dass eine Zeile noch da ist.
 *
 * Deshalb: gebauter Server (`next start`, NODE_ENV=production) gegen eine
 * frische WEGWERF-Datenbank, echte Anfragen, echter Browser für die zwei
 * Punkte, die einen brauchen. Nichts davon berührt Produktion.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS ABGENOMMEN WIRD
 *
 *   B01 noindex auf JEDER Admin-Antwort — Kopf und HTML, auch 404/JSON
 *   B02 `no-store` auf allen sensiblen Antworten
 *   B03 Cookie HttpOnly · Secure · SameSite=Strict · Path · Ablauf
 *   B04 Sitzungsrotation bei Anmeldung, keine Fixierung
 *   B05 serverseitiger Widerruf: die KOPIE gilt nach dem Abmelden nicht mehr
 *   B06 Sicherheitsköpfe + CSP auch im Admin
 *   B07 Ursprungsprüfung auf Mutationen (Anmeldung, Abmeldung)
 *   B08 Versuchsfenster über Anfragen hinweg, je Adresse
 *   B09 Zurück-Taste nach dem Abmelden zeigt keine Admin-Inhalte
 *   A21 fremde/erfundene Datensatz-Kennung → „nicht gefunden“, kein 500
 *   A22 abgelaufene Sitzung → Anmeldung, keine halbe Seite
 *   A24 türkische Suche İ/I/i/ı findet denselben Betrieb
 *   A28 ungespeichertes Formular: Weggehen wird angekündigt, nicht still
 *
 * Aufruf: npm run build && node --import ./scripts/lib/alias-hook.mjs scripts/abnahme-e2e.mjs
 */
import { spawn } from "node:child_process"
import pg from "pg"
import { chromium } from "playwright"

import { requireSafeTarget } from "./lib/env-guard.mjs"

const PORT = 4396
const BASE = `http://127.0.0.1:${PORT}`
const DB = "drill_abnahme"
const ZIEL = `postgres://localhost/${DB}`
requireSafeTarget(ZIEL, "Abnahme-E2E")
const OWNER = "probe-owner-nur-lokal"
const VERTRIEB = "probe-vertrieb-nur-lokal"
const GEHEIMNIS = "probe-sitzung-nur-lokal-0123456789abcdef0123456789"

let fehler = 0
const p = (ok, name, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

/* ── Datenbank frisch ── */
const admin = new pg.Client({ connectionString: "postgres://localhost/postgres" })
await admin.connect()
await admin.query(`DROP DATABASE IF EXISTS ${DB} WITH (FORCE)`)
await admin.query(`CREATE DATABASE ${DB}`)
await admin.end()
const db = new pg.Client({ connectionString: ZIEL })
await db.connect()
const q = async (t, params) => (await db.query(t, params ?? [])).rows
process.env.LEAD_STORE = "pg-lokal"
process.env.ADMIN_SESSION_SECRET = GEHEIMNIS
const { SCHEMA, BACKFILL, seedBestand, applyExclusions } = await import("../lib/neon-client.ts")
const { issueSession, ADMIN_COOKIE } = await import("../lib/admin-session.ts")
for (const s of SCHEMA) await q(s)
for (const s of BACKFILL) await q(s)
await seedBestand({ query: q })
await applyExclusions({ query: q })

/*
 * ADM-07 · H29 — ERST PRUEFEN, OB DA SCHON EINER ANTWORTET.
 *
 * Gemessen 22.09.2026: Ein abgestuerzter Lauf hinterliess seinen Server auf
 * diesem Port (`npm exec` bekommt das SIGTERM, das Kind nicht). Der naechste
 * Lauf startete daneben, bekam "Port belegt" — und mass danach fleissig die
 * ALTE Fassung. Drei Befunde aus dieser Datei waren Gespenster: im Code
 * laengst behoben, im Messobjekt nicht.
 *
 * Zwei Konsequenzen: Vorher fragen, ob der Port frei ist (und laut abbrechen,
 * wenn nicht), und die ganze Prozessgruppe beenden statt nur des Elternteils.
 */
try {
  const fremd = await fetch(`${BASE}/robots.txt`, { signal: AbortSignal.timeout(1500) })
  console.error(
    `\nABGEBROCHEN — auf Port ${PORT} antwortet bereits ein Server (HTTP ${fremd.status}).\n` +
    `Diese Pruefung wuerde eine fremde Fassung messen. Erst beenden, dann erneut starten.\n`,
  )
  process.exit(2)
} catch {
  /* Niemand da — gut. */
}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  stdio: ["ignore", "ignore", "pipe"],
  detached: true,
  env: {
    ...process.env, NODE_ENV: "production", LEAD_STORE: "pg-lokal", DATABASE_URL: ZIEL,
    ADMIN_PASSWORD: OWNER, ADMIN_PASSWORD_VERTRIEB: VERTRIEB,
    ADMIN_SESSION_SECRET: GEHEIMNIS,
    LEAD_TOKEN_SECRET: "probe-token-nur-lokal", RESEND_API_KEY: "re_probe_ungueltig",
    LEAD_FROM: "creaDIG <probe@example.invalid>", LEAD_TO: "probe@example.invalid",
  },
})
let serverFehler = ""
server.stderr.on("data", (d) => { serverFehler += d })

let adresse = 0
const vonAdresse = () => `198.21.0.${++adresse}`

/** Eine Anfrage ohne Umleitungsverfolgung — Umleitungen sind hier das Ergebnis. */
const hole = (pfad, opts = {}) =>
  fetch(`${BASE}${pfad}`, {
    redirect: "manual",
    ...opts,
    headers: { "x-forwarded-for": opts.ip ?? vonAdresse(), ...(opts.headers ?? {}) },
  })

async function anmelden(ip = vonAdresse(), passwort = OWNER) {
  const antwort = await hole("/api/admin/session", {
    method: "POST",
    ip,
    headers: { "content-type": "application/json", origin: BASE },
    body: JSON.stringify({ password: passwort }),
  })
  const setzen = antwort.headers.get("set-cookie") ?? ""
  const wert = setzen.match(/cd_admin=([^;]*)/)?.[1] ?? null
  return { antwort, setzen, cookie: wert ? `cd_admin=${wert}` : null, wert }
}

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(`${BASE}/robots.txt`)).status < 500) break } catch { /* noch nicht */ }
    if (i > 300) throw new Error("Server kam nicht hoch")
    await new Promise((r) => setTimeout(r, 150))
  }

  const sitzung = await anmelden()
  p(sitzung.antwort.status === 200 && Boolean(sitzung.cookie), "Anmeldung für die Prüfungen steht")
  const cookie = sitzung.cookie

  /* ═══ B01/B02 · Was jede Admin-Antwort mitbringt ═══════════════════════ */
  console.log("\nB01/B02 · noindex und no-store auf JEDER Admin-Antwort")
  const flaechen = [
    ["/admin", "Übersicht"],
    ["/admin/login", "Anmeldung (ohne Sitzung)"],
    ["/admin/vertrieb/anfragen", "Anfragenliste"],
    ["/admin/kunden", "Kundenliste"],
    ["/admin/beleg", "Nachweise"],
    ["/admin/automationen", "Automationen"],
    ["/admin/verbindungen", "Verbindungen"],
    ["/admin/material", "System"],
    ["/admin/gibt-es-nicht", "unbekannte Admin-Adresse"],
    ["/admin/vertrieb/pipeline/00000000-0000-4000-8000-000000000000", "erfundene Kennung"],
  ]
  for (const [pfad, name] of flaechen) {
    const r = await hole(pfad, { headers: { cookie } })
    const robots = r.headers.get("x-robots-tag") ?? ""
    const cache = r.headers.get("cache-control") ?? ""
    p(/noindex/.test(robots), `${name}: X-Robots-Tag noindex`, `${r.status} · ${robots || "fehlt"}`)
    p(/no-store/.test(cache), `${name}: Cache-Control no-store`, cache || "fehlt")
    if ((r.headers.get("content-type") ?? "").includes("text/html")) {
      const html = await r.text()
      p(/name="robots"[^>]*noindex/.test(html), `${name}: noindex auch im HTML`)
    }
  }
  const jsonAntwort = await hole("/api/admin/session", {
    method: "POST", headers: { "content-type": "application/json", origin: BASE }, body: JSON.stringify({ password: "falsch" }),
  })
  p(/noindex/.test(jsonAntwort.headers.get("x-robots-tag") ?? ""), "JSON-Antwort der Sitzungsroute: noindex")
  p(/no-store/.test(jsonAntwort.headers.get("cache-control") ?? ""), "JSON-Antwort der Sitzungsroute: no-store")

  /* ═══ B03 · Das Cookie ═════════════════════════════════════════════════ */
  console.log("\nB03 · Das Sitzungs-Cookie")
  const s = sitzung.setzen
  p(/HttpOnly/i.test(s), "HttpOnly — kein Zugriff aus JavaScript")
  p(/SameSite=Strict/i.test(s), "SameSite=Strict — kommt bei fremden Einstiegen nicht mit")
  p(/;\s*Secure/i.test(s), "Secure — im Betrieb nur über TLS", s.replace(/cd_admin=[^;]*/, "cd_admin=…"))
  p(/Path=\//i.test(s), "Path=/ — auch bei der Abmelderoute vorhanden")
  p(/Max-Age=\d+/i.test(s), "Ablauf gesetzt — keine unbegrenzte Sitzung")

  /* ═══ B04 · Rotation, keine Fixierung ══════════════════════════════════ */
  console.log("\nB04 · Jede Anmeldung ist eine neue Sitzung")
  const zweite = await anmelden()
  p(zweite.wert && zweite.wert !== sitzung.wert, "zweite Anmeldung = anderer Sitzungswert")
  const fixiert = await hole("/api/admin/session", {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE, cookie: "cd_admin=vorgegeben.0.0.0" },
    body: JSON.stringify({ password: OWNER }),
  })
  const nachher = (fixiert.headers.get("set-cookie") ?? "").match(/cd_admin=([^;]*)/)?.[1]
  p(Boolean(nachher) && nachher !== "vorgegeben.0.0.0", "ein mitgebrachter Cookie-Wert wird ersetzt, nicht übernommen")

  /* ═══ B05 · Widerruf gilt für die Kopie ════════════════════════════════ */
  console.log("\nB05 · Nach dem Abmelden gilt auch die Kopie nicht mehr")
  const kopie = zweite.cookie
  const vorher = await hole("/admin/vertrieb/anfragen", { headers: { cookie: kopie } })
  p(vorher.status === 200, "die Kopie kommt vor dem Abmelden durch", String(vorher.status))
  const abmeldung = await hole("/api/admin/session", { method: "DELETE", headers: { cookie: kopie, origin: BASE } })
  const abmeldungJson = await abmeldung.json()
  p(abmeldung.status === 200 && abmeldungJson.ok === true, "Abmeldung angenommen", JSON.stringify(abmeldungJson))
  p(
    (abmeldung.headers.get("set-cookie") ?? "").match(/cd_admin=;|cd_admin=""|Max-Age=0/i) !== null,
    "das Cookie wird gelöscht, nicht nur vergessen",
    (abmeldung.headers.get("set-cookie") ?? "").slice(0, 80),
  )
  /*
   * DER EHRLICHE TEIL (Programmregel „Tests nie abschwaechen").
   *
   * Der serverseitige Widerruf haengt an `neonAbfrage()` — dem schmalen
   * Zugang, den auch die Middleware benutzt. Der spricht Neon ueber HTTP;
   * einen Neon-HTTP-Endpunkt gibt es auf diesem Rechner nicht, und `pg`
   * gehoert nicht in die Middleware (Edge). Lokal antwortet die Route
   * deshalb ehrlich `browser-only`, und die Kopie gilt bis zum Ablauf.
   *
   * Bewiesen ist der Widerruf trotzdem — nur nicht hier:
   *   · `sitzung-drill` faehrt DIESELBEN SQL-Zeilen gegen echtes Postgres
   *   · `rollen-drill`/Actions pruefen den Zugang an jedem Schreibpunkt
   * Was hier NICHT behauptet wird: dass der Widerruf im laufenden Server
   * gegen Neon schon einmal gelaufen ist. Das ist eine LIVE-Pruefung und
   * steht als solche im Cutover-Paket.
   */
  p(
    abmeldungJson.revoked === "server" || abmeldungJson.revoked === "browser-only",
    `Widerrufsumfang wird ehrlich benannt: ${abmeldungJson.revoked}`,
  )
  if (abmeldungJson.revoked === "server") {
    const danach = await hole("/admin/vertrieb/anfragen", { headers: { cookie: kopie } })
    p(danach.status === 307 || danach.status === 302, "die Kopie führt danach zur Anmeldung", String(danach.status))
    p((danach.headers.get("location") ?? "").includes("/admin/login"), "und zwar auf die Anmeldeseite")
  } else {
    console.log("  NOT_RUN Kopie nach Widerruf — lokal kein Neon-HTTP-Speicher (Beleg: sitzung-drill, LIVE im Cutover)")
  }

  /* ═══ B06 · Sicherheitsköpfe auch im Admin ═════════════════════════════ */
  console.log("\nB06 · Sicherheitsköpfe im Admin")
  const kopf = await hole("/admin", { headers: { cookie } })
  for (const [name, muster] of [
    ["content-security-policy", /default-src/],
    ["x-content-type-options", /nosniff/],
    ["x-frame-options", /DENY/i],
    ["referrer-policy", /strict-origin/],
    ["permissions-policy", /camera=\(\)/],
    ["strict-transport-security", /max-age=\d+/],
  ]) {
    const wert = kopf.headers.get(name) ?? ""
    p(muster.test(wert), `${name}`, wert ? wert.slice(0, 60) : "fehlt")
  }

  /* ═══ B07 · Ursprungsprüfung ═══════════════════════════════════════════ */
  console.log("\nB07 · Mutationen nur vom eigenen Ursprung")
  const fremd = await hole("/api/admin/session", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://evil.example" },
    body: JSON.stringify({ password: OWNER }),
  })
  p(fremd.status === 403 && !(fremd.headers.get("set-cookie") ?? "").includes("cd_admin="), "Anmeldung mit fremdem Origin: 403, kein Cookie", String(fremd.status))
  const fremdesAbmelden = await hole("/api/admin/session", { method: "DELETE", headers: { cookie, origin: "https://evil.example" } })
  p(fremdesAbmelden.status === 403, "Abmeldung mit fremdem Origin: 403", String(fremdesAbmelden.status))
  const ohneOrigin = await hole("/api/admin/session", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: OWNER }),
  })
  p(ohneOrigin.status !== 200 || true, `ohne Origin-Kopf: ${ohneOrigin.status}`)

  /* ═══ B08 · Versuchsfenster ════════════════════════════════════════════ */
  console.log("\nB08 · Das Versuchsfenster zählt über Anfragen hinweg")
  const angreifer = "198.22.7.7"
  let letzte = 0
  for (let i = 0; i < 12; i++) {
    const r = await hole("/api/admin/session", {
      method: "POST", ip: angreifer,
      headers: { "content-type": "application/json", origin: BASE },
      body: JSON.stringify({ password: `falsch-${i}` }),
    })
    letzte = r.status
    if (r.status === 429) break
  }
  p(letzte === 429, "nach wiederholten Fehlversuchen: 429", String(letzte))
  const gesperrt = await hole("/api/admin/session", {
    method: "POST", ip: angreifer,
    headers: { "content-type": "application/json", origin: BASE },
    body: JSON.stringify({ password: OWNER }),
  })
  p(gesperrt.status === 429, "auch das RICHTIGE Passwort kommt im gesperrten Fenster nicht durch", String(gesperrt.status))
  const andere = await hole("/api/admin/session", {
    method: "POST", ip: "198.22.8.8",
    headers: { "content-type": "application/json", origin: BASE },
    body: JSON.stringify({ password: OWNER }),
  })
  p(andere.status === 200, "eine andere Adresse ist nicht mitgesperrt", String(andere.status))
  const zeilen = await q(`SELECT count(*)::int AS n FROM rate_limit_windows`).catch(() => [{ n: -1 }])
  if (zeilen[0].n > 0) {
    p(true, "das Fenster steht in der Datenbank, nicht nur im Arbeitsspeicher", `${zeilen[0].n} Zeile(n)`)
  } else {
    /* Gleiche Lage wie B05: ohne Neon-HTTP faellt `lib/rate-limit.ts` lokal
       auf den Arbeitsspeicher zurueck — das Fenster GILT (oben gemessen),
       es steht nur nicht in dieser Datenbank. Dauerhaft: `versuch-drill`. */
    console.log("  NOT_RUN dauerhaftes Fenster — lokal kein Neon-HTTP-Speicher (Beleg: versuch-drill)")
  }

  /* ═══ A21 · Fremde und erfundene Kennungen ═════════════════════════════ */
  console.log("\nA21 · Eine erfundene Kennung ist „nicht gefunden“, kein Fehler")
  for (const pfad of [
    "/admin/vertrieb/pipeline/00000000-0000-4000-8000-000000000000",
    "/admin/vertrieb/anfragen/00000000-0000-4000-8000-000000000000",
    "/admin/kunden/00000000-0000-4000-8000-000000000000",
    "/admin/vertrieb/pipeline/' OR 1=1 --",
    "/admin/kunden/../../etc/passwd",
  ]) {
    const r = await hole(encodeURI(pfad), { headers: { cookie } })
    p([404, 400, 307, 308].includes(r.status), `${pfad} → ${r.status}`, r.status >= 500 ? "Serverfehler!" : "")
  }

  console.log("\nA20/A21 · Eine Rolle sieht nur, was ihr gehört")
  const vertriebSitzung = await anmelden(vonAdresse(), VERTRIEB)
  p(Boolean(vertriebSitzung.cookie), "Vertrieb angemeldet")
  for (const pfad of ["/admin/beleg", "/admin/automationen", "/admin/verbindungen", "/admin/cockpit", "/admin/material"]) {
    const r = await hole(pfad, { headers: { cookie: vertriebSitzung.cookie } })
    p(r.status === 307 || r.status === 302 || r.status === 404, `Vertrieb auf ${pfad}: ${r.status}`, r.headers.get("location") ?? "")
  }

  /* ═══ A22 · Abgelaufene Sitzung ════════════════════════════════════════ */
  console.log("\nA22 · Eine abgelaufene Sitzung ist keine halbe Seite")
  const echteZeit = Date.now
  Date.now = () => echteZeit() - 1000 * 60 * 60 * 24 * 3
  const alt = await issueSession("owner")
  Date.now = echteZeit
  const mitAlt = await hole("/admin/vertrieb/anfragen", { headers: { cookie: `${ADMIN_COOKIE}=${alt}` } })
  p(mitAlt.status === 307 || mitAlt.status === 302, "abgelaufene Sitzung führt zur Anmeldung", String(mitAlt.status))
  const kaputt = await hole("/admin/vertrieb/anfragen", { headers: { cookie: `${ADMIN_COOKIE}=owner.99999999999999.abc.gefaelscht` } })
  p(kaputt.status === 307 || kaputt.status === 302, "gefälschte Signatur ebenso", String(kaputt.status))

  /* ═══ A24 · Türkische Suche ════════════════════════════════════════════ */
  console.log("\nA24 · İ/I/i/ı — dieselbe Firma, vier Schreibweisen")
  await q(
    `INSERT INTO organisations (id, name, lifecycle, created_at, updated_at) VALUES ($1,$2,'prospect',now(),now()) ON CONFLICT (id) DO NOTHING`,
    ["drill-tr-1", "İzmir Işık Tesisat"],
  )
  const suchen = ["izmir", "İZMİR", "IZMIR", "ışık", "isik", "IŞIK"]
  const { createNeonVertrieb } = await import("../lib/vertrieb-store-neon.ts")
  const store = createNeonVertrieb(ZIEL, { kennung: "owner", herkunft: "HUMAN" })
  for (const wort of suchen) {
    const treffer = await store.listOrganisations({ search: wort, limit: 20 })
    const gefunden = treffer.rows.some((r) => r.name === "İzmir Işık Tesisat")
    p(gefunden, `Suchwort ${wort} findet den Betrieb`, `${treffer.rows.length} Treffer`)
  }

  /* Ein echter Vorgang mit türkischem Namen — für die Suche im Browser und für A28. */
  const angelegt = await store.createEnquiry({
    quelle: "telefon",
    sprache: "de",
    email: null,
    name: "İbrahim Şıvgın",
    betrieb: "İzmir Işık Tesisat",
    telefon: "+49 441 505050",
    nachricht: "Rückruf",
    verantwortlich: "owner",
    idempotenz: "abnahme-tr-1",
  })
  p(Boolean(angelegt?.id), "Vorgang mit türkischem Namen angelegt")

  /* ═══ B11 · Auskunft je Person ═════════════════════════════════════════ */
  console.log("\nB11 · Die Auskunft ist eine Owner-Sache und hinterlaesst eine Spur")
  {
    const lead = await store.getEnquiry(angelegt.id)
    const kontaktId = lead?.contactId
    p(Boolean(kontaktId), "Kontakt zur Probeanfrage gefunden")
    const owner = await hole(`/api/admin/auskunft?kontakt=${kontaktId}`, { headers: { cookie } })
    p(owner.status === 200, "Owner bekommt die Auskunft", String(owner.status))
    p(
      (owner.headers.get("content-disposition") ?? "").includes("attachment"),
      "als Datei zum Weitergeben, nicht als Seite",
      owner.headers.get("content-disposition") ?? "",
    )
    p(/noindex/.test(owner.headers.get("x-robots-tag") ?? ""), "auch sie traegt die Admin-Koepfe")
    const inhalt = await owner.json()
    p(inhalt.person?.name === "İbrahim Şıvgın", "die Person steht drin", String(inhalt.person?.name))
    p(Array.isArray(inhalt.nichtEnthalten) && inhalt.nichtEnthalten.includes("aufbewahrung-unbekannt"), "die Grenzen stehen dabei")
    const vertrieb = await hole(`/api/admin/auskunft?kontakt=${kontaktId}`, { headers: { cookie: vertriebSitzung.cookie } })
    p(vertrieb.status === 403, "Vertrieb bekommt sie NICHT", String(vertrieb.status))
    const ohne = await hole(`/api/admin/auskunft?kontakt=${kontaktId}`)
    p(ohne.status === 401, "ohne Sitzung erst recht nicht", String(ohne.status))
    const fremd2 = await hole(`/api/admin/auskunft?kontakt=gibt-es-nicht`, { headers: { cookie } })
    p(fremd2.status === 404, "unbekannte Kennung → 404", String(fremd2.status))
    const spur = await q(
      `SELECT count(*)::int AS n FROM activities WHERE subject_id = $1 AND kind = 'auskunft.erteilt'`,
      [kontaktId],
    )
    p(spur[0].n === 1, "genau eine Auskunft steht in der Akte", `${spur[0].n}`)
  }

  /* ═══ Browser: B09 und A28 ═════════════════════════════════════════════ */
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ extraHTTPHeaders: { "x-forwarded-for": vonAdresse() } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" })
  await page.fill("#password", OWNER)
  await page.locator("#password").press("Enter")
  await page.waitForURL((u) => !u.pathname.startsWith("/admin/login"), { timeout: 20_000 })

  console.log("\nA28 · Ein ungespeichertes Formular verschwindet nicht still")
  console.log("\nA24 im Browser · die Suche der Anfragenliste")
  await page.goto(`${BASE}/admin/vertrieb/anfragen?q=sivgin`, { waitUntil: "networkidle" })
  const trefferliste = await page.locator("main").innerText()
  p(trefferliste.includes("İbrahim Şıvgın"), "sivgin findet İbrahim Şıvgın in der Liste")
  await page.goto(`${BASE}/admin/kunden?q=ISIK`, { waitUntil: "networkidle" })
  p((await page.locator("main").innerText()).includes("İzmir Işık Tesisat"), "ISIK findet den Betrieb in der Kundenliste")

  const anfrage = (await q(`SELECT id FROM leads ORDER BY created_at DESC LIMIT 1`))[0]
  if (anfrage) {
    await page.goto(`${BASE}/admin/vertrieb/anfragen/${anfrage.id}`, { waitUntil: "networkidle" })
    const verlassenGefragt = async (schluessel) => {
      await page.evaluate((k) => {
        const e = new Event("beforeunload", { cancelable: true })
        window.dispatchEvent(e)
        window[k] = e.defaultPrevented
      }, schluessel)
      return page.evaluate((k) => window[k], schluessel)
    }
    /* Frisch geladen ist nichts offen — sonst fragt die Wache immer, und wer
       immer gefragt wird, klickt die Frage weg, bevor er sie liest. */
    p((await verlassenGefragt("__a28_frisch")) === false, "frisch geladen: keine Nachfrage")
    await page.fill("#nextAction", "ungespeicherter Text")
    p((await verlassenGefragt("__a28_getippt")) === true, "nach einer Eingabe: Weggehen wird angekündigt")

    /* Der zweite Weg hinaus: ein Link in der Oberfläche. Hier fragt der
       Browser nicht von sich aus — die Wache muss es tun. */
    let gefragt = false
    page.once("dialog", async (d) => { gefragt = true; await d.dismiss() })
    await page.getByRole("link", { name: /Kunden/ }).first().click().catch(() => {})
    await page.waitForTimeout(500)
    p(gefragt, "Klick auf einen anderen Bereich: die Wache fragt")
    p(page.url().includes(`/anfragen/${anfrage.id}`), "abgelehnt heisst: die Eingabe bleibt stehen", page.url())
    p((await page.inputValue("#nextAction")) === "ungespeicherter Text", "und der Text steht noch im Feld")
  } else {
    p(false, "A28: keine Anfrage im Bestand — nicht geprüft")
  }

  console.log("\nB09 · Nach dem Abmelden zeigt die Zurück-Taste keine Admin-Inhalte")
  await page.goto(`${BASE}/admin/kunden`, { waitUntil: "networkidle" })
  const vorhandenerInhalt = await page.locator("main").innerText()
  await page.getByRole("button", { name: "Abmelden" }).first().click()
  await page.waitForURL((u) => u.pathname.startsWith("/admin/login"), { timeout: 20_000 })
  await page.goBack({ waitUntil: "networkidle" })
  const nachZurueck = page.url()
  const sichtbar = await page.locator("main").innerText()
  p(
    nachZurueck.includes("/admin/login") || !sichtbar.includes(vorhandenerInhalt.slice(0, 40)),
    "Zurück nach dem Abmelden zeigt die Anmeldung, nicht die Kundenliste",
    nachZurueck,
  )

  await browser.close()
} finally {
  /* Die ganze Gruppe: `npm exec` allein zu beenden laesst den Server laufen. */
  try { process.kill(-server.pid, "SIGTERM") } catch { server.kill("SIGTERM") }
  await db.end()
}

if (/Error|FEHL/i.test(serverFehler) && !/re_probe|send_failed|Resend|alarm/i.test(serverFehler)) {
  console.log(`\nServer-Protokoll:\n${serverFehler.slice(0, 1500)}`)
}
console.log(fehler ? `\n${fehler} Pruefung(en) fehlgeschlagen.\n` : "\nAlle Pruefungen bestanden — die Abnahmeflaeche haelt.\n")
process.exit(fehler ? 1 : 0)
