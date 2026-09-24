#!/usr/bin/env node
/**
 * ADM-07 · CUTOVER · STAGE 5/6 — R1–R9 UND DIE LIVE-ABNAHME GEGEN PRODUKTION.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER ANDERS IST ALS IN JEDEM LOKALEN LAUF
 *
 * Lokal laeuft der Server auf dieser Maschine, die Datenbank ist eine
 * Wegwerf-Kopie, und der Sitzungsspeicher liegt im Arbeitsspeicher. Zwei
 * Punkte des Sicherheitsvertrags sind damit lokal NICHT beweisbar:
 *
 *   R4  Der serverseitige Widerruf — er braucht Neon.
 *   R5  Das Versuchsfenster ueber Instanzen hinweg — es braucht Neon.
 *
 * Genau deshalb gibt es diese Datei. Alles andere hier ist Wiederholung
 * gegen die echte Umgebung: dieselben Fragen, anderer Boden.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTDATEN IN PRODUKTION — DIE REGELN
 *
 *   · Es wird GENAU EINE Anfrage erzeugt, ueber den echten oeffentlichen
 *     Weg (das Formular), weil das die kritische Eingangsfaehigkeit ist.
 *   · Sie traegt `ZZ Cutover-Probe` im Namen und im Betrieb — erkennbar in
 *     jeder Liste, in jeder Suche, fuer jeden Menschen.
 *   · Am Ende wird sie archiviert, nicht geloescht. Loeschen waere eine
 *     Datenoperation, die dieser Lauf nicht vornehmen darf.
 *   · An echten Kundendatensaetzen wird NICHTS geaendert.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * R5 UND DIE EIGENE ADRESSE
 *
 * Das Versuchsfenster gilt je Adresse. Der Beweis kostet deshalb genau das,
 * was er beweist: Diese Internetverbindung kann sich danach bis zu zehn
 * Minuten nicht am Admin anmelden. Der Abschnitt laeuft deshalb ZULETZT, und
 * er sagt es vorher.
 *
 * Aufruf:
 *   node --env-file=.env.local scripts/cutover-live.mjs
 * Optionen:
 *   --basis https://creadig.de     (Standard)
 *   --ohne-browser                 nur HTTP-Pruefungen
 *   --ohne-r5                      Versuchsfenster nicht ausloesen
 */
const args = process.argv.slice(2)
const arg = (n, f = null) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : f }
const hat = (n) => args.includes(n)

const BASIS = (arg("--basis", "https://creadig.de") ?? "").replace(/\/$/, "")
const PASSWORT = process.env.ADMIN_PASSWORD
if (!PASSWORT || PASSWORT.startsWith("[")) {
  console.error("\nABGEBROCHEN — kein ADMIN_PASSWORD.\nAufruf: node --env-file=.env.local scripts/cutover-live.mjs\n")
  process.exit(2)
}

/*
 * Die Marke steht in `TEST_PREFIXES` (lib/vertrieb-bestand.ts) — sonst bleibt
 * die Probe nach dem Lauf als echte Zeile in den Zahlen des Eigentuemers
 * stehen. Gemessen am 24.09.2026: Genau das war passiert.
 */
const MARKE = "ZZ Cutover-Probe"
let fehler = 0
const p = (ok, name, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}
const notiz = (text) => console.log(`  ----  ${text}`)

const hole = (pfad, opts = {}) =>
  fetch(`${BASIS}${pfad}`, { redirect: "manual", ...opts, headers: { ...(opts.headers ?? {}) } })

async function anmelden() {
  const r = await hole("/api/admin/session", {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASIS },
    body: JSON.stringify({ password: PASSWORT }),
  })
  const wert = (r.headers.get("set-cookie") ?? "").match(/cd_admin=([^;]*)/)?.[1] ?? null
  return { status: r.status, cookie: wert ? `cd_admin=${wert}` : null }
}

console.log(`\n══ STAGE 5 · R1–R9 gegen ${BASIS} ══`)

/* ── R1 ────────────────────────────────────────────────────────────────── */
console.log("\nR1 · Die oeffentliche Seite steht")
const start = await hole("/")
p(start.status === 200, "GET / ", String(start.status))

/* ── R2 ────────────────────────────────────────────────────────────────── */
console.log("\nR2 · Die Anmeldeseite traegt ihre Koepfe (H28 live)")
const login = await hole("/admin/login")
const csp = login.headers.get("content-security-policy") ?? ""
p(login.status === 200, "GET /admin/login", String(login.status))
p(/no-store/.test(login.headers.get("cache-control") ?? ""), "Cache-Control no-store")
p(/noindex/.test(login.headers.get("x-robots-tag") ?? ""), "X-Robots-Tag noindex")
p(/default-src 'self'/.test(csp), "CSP ist die volle Policy, nicht der Bericht", csp.slice(0, 60))

/* ── R3 ────────────────────────────────────────────────────────────────── */
console.log("\nR3 · Anmelden und die Uebersicht sehen")
const sitzung = await anmelden()
p(sitzung.status === 200 && Boolean(sitzung.cookie), "Anmeldung", String(sitzung.status))
const cookie = sitzung.cookie
const uebersicht = await hole("/admin", { headers: { cookie } })
const uebersichtText = await uebersicht.text()
p(uebersicht.status === 200, "GET /admin", String(uebersicht.status))
p(!/nicht erreichbar|nicht eingerichtet/i.test(uebersichtText), "keine Stoerungsmeldung auf der Uebersicht")
p(/Kennzahlen|Heute/i.test(uebersichtText), "die Uebersicht zeigt ihre Abschnitte")

/* ── R6 · H27 live ─────────────────────────────────────────────────────── */
console.log("\nR6 · Eine erfundene Kennung ist „nicht gefunden“ (H27 live)")
for (const pfad of [
  "/admin/vertrieb/pipeline/00000000-0000-4000-8000-000000000000",
  "/admin/kunden/00000000-0000-4000-8000-000000000000",
  "/admin/vertrieb/anfragen/00000000-0000-4000-8000-000000000000",
]) {
  const r = await hole(pfad, { headers: { cookie } })
  p(r.status === 404, `${pfad.split("/").slice(0, 4).join("/")}/… → ${r.status}`, r.status >= 500 ? "Serverfehler!" : "")
}

/* ── R8 ────────────────────────────────────────────────────────────────── */
console.log("\nR8 · Die Owner-Bereiche antworten")
for (const pfad of ["/admin/automationen", "/admin/verbindungen", "/admin/beleg", "/admin/material"]) {
  const r = await hole(pfad, { headers: { cookie } })
  p(r.status === 200, `GET ${pfad}`, String(r.status))
}

/* ── R9 · der echte Eingang ────────────────────────────────────────────── */
console.log("\nR9 · Eine Anfrage ueber das oeffentliche Formular (markierte Probe)")
const tokenAntwort = await hole("/api/lead")
const token = (await tokenAntwort.json().catch(() => ({}))).token
p(Boolean(token), "Formular-Token erhalten")
await new Promise((r) => setTimeout(r, 2500))
const abgesendet = await hole("/api/lead", {
  method: "POST",
  headers: { "content-type": "application/json", origin: BASIS },
  body: JSON.stringify({
    token,
    name: `${MARKE} Şıvgın`,
    email: "cutover-probe@creadig.de",
    phone: "+49 441 000000",
    business: `${MARKE} Işık GmbH`,
    message: "Automatische Cutover-Probe. Kein Kundenanliegen.",
    source: "kontakt",
    locale: "de",
    privacyOk: true,
  }),
})
const abgesendetText = await abgesendet.text()
/*
 * ANGENOMMEN IST NICHT DASSELBE WIE VERSCHICKT.
 *
 * Die Route speichert die Anfrage und versucht danach die Benachrichtigung.
 * Scheitert der Versand, antwortet sie 502 `send_failed` — die Anfrage ist
 * trotzdem im System, und genau das ist die kritische Faehigkeit (A11/OD-2).
 * Der Versand ist die zweite Frage; sie wird hier getrennt beantwortet,
 * damit ein Mailproblem nicht als verlorene Anfrage durchgeht — und eine
 * gespeicherte Anfrage nicht als gruener Versand.
 */
const angenommen = abgesendet.status === 200
const nurVersandKaputt = abgesendet.status === 502 && abgesendetText.includes("send_failed")
p(angenommen || nurVersandKaputt, "Formular angenommen (Anfrage gespeichert)", `${abgesendet.status} ${abgesendetText.slice(0, 60)}`)
if (nurVersandKaputt) {
  notiz("BEFUND: die Anfrage steht im System, die Benachrichtigung ging NICHT raus — RESEND in Produktion pruefen")
} else {
  p(angenommen, "Benachrichtigung ausgeloest")
}

/* ── R7 · tuerkische Suche live (H30) ──────────────────────────────────── */
console.log("\nR7 · Die Probe ist auffindbar — auch tuerkisch geschrieben (H30 live)")
let probeId = null
for (const wort of ["sivgin", "ŞIVGIN", "isik", "IŞIK"]) {
  const r = await hole(`/admin/vertrieb/anfragen?q=${encodeURIComponent(wort)}`, { headers: { cookie } })
  const text = await r.text()
  const gefunden = text.includes("Şıvgın") || text.includes(MARKE)
  p(gefunden, `Suche „${wort}“ findet die Probe`)
  if (gefunden && !probeId) {
    probeId = text.match(/\/admin\/vertrieb\/anfragen\/([0-9a-f-]{36})/)?.[1] ?? null
  }
}
p(Boolean(probeId), "die Probe ist im System angekommen (der eigentliche Beweis von R9)", probeId ?? "")

/* ── B11 live ──────────────────────────────────────────────────────────── */
console.log("\nB11 · Auskunft je Person (live)")
let kontaktId = null
if (probeId) {
  const detail = await hole(`/admin/vertrieb/anfragen/${probeId}`, { headers: { cookie } })
  const html = await detail.text()
  kontaktId = html.match(/\/admin\/vertrieb\/beziehungen\/([0-9a-f-]{36})/)?.[1] ?? null
}
if (kontaktId) {
  const auskunft = await hole(`/api/admin/auskunft?kontakt=${kontaktId}`, { headers: { cookie } })
  p(auskunft.status === 200, "Owner bekommt die Auskunft", String(auskunft.status))
  const daten = await auskunft.json().catch(() => ({}))
  p(String(daten?.person?.name ?? "").includes("Şıvgın"), "sie enthaelt die richtige Person")
  p(Array.isArray(daten?.nichtEnthalten) && daten.nichtEnthalten.includes("aufbewahrung-unbekannt"), "sie nennt ihre Grenzen")
  const ohne = await hole(`/api/admin/auskunft?kontakt=${kontaktId}`)
  p(ohne.status === 401, "ohne Sitzung keine Auskunft", String(ohne.status))
} else {
  p(false, "B11: kein Kontakt zur Probe gefunden — nicht geprueft")
}

/* ── R4 · der Widerruf, der lokal nicht beweisbar war ──────────────────── */
console.log("\nR4 · Nach dem Abmelden gilt auch die Kopie nicht mehr (nur live beweisbar)")
const zweite = await anmelden()
p(Boolean(zweite.cookie), "zweite Sitzung angelegt")
const vor = await hole("/admin/vertrieb/anfragen", { headers: { cookie: zweite.cookie } })
p(vor.status === 200, "die Kopie kommt vorher durch", String(vor.status))
const abmeldung = await hole("/api/admin/session", { method: "DELETE", headers: { cookie: zweite.cookie, origin: BASIS } })
const abmeldungJson = await abmeldung.json().catch(() => ({}))
p(abmeldungJson.revoked === "server", "der Widerruf wird SERVERSEITIG vermerkt", JSON.stringify(abmeldungJson))
const nach = await hole("/admin/vertrieb/anfragen", { headers: { cookie: zweite.cookie } })
p(nach.status === 307 || nach.status === 302, "die Kopie fuehrt danach zur Anmeldung", String(nach.status))
p((nach.headers.get("location") ?? "").includes("/admin/login"), "und zwar auf die Anmeldeseite")

/* ── Browser: H14, A28, A25, DE/TR, mobil ──────────────────────────────── */
if (!hat("--ohne-browser")) {
  console.log("\n══ STAGE 6 · Live-Abnahme im Browser ══")
  const { chromium } = await import("playwright")
  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  const seite = await ctx.newPage()
  await seite.goto(`${BASIS}/admin/login`, { waitUntil: "networkidle" })
  await seite.fill("#password", PASSWORT)
  await seite.locator("#password").press("Enter")
  await seite.waitForURL((u) => !u.pathname.startsWith("/admin/login"), { timeout: 30_000 })
  p(true, "Anmeldung im Browser")

  if (probeId) {
    console.log("\nH14 · Nach dem Speichern steht der gespeicherte Stand da")
    let frisch = 0
    for (let i = 1; i <= 3; i++) {
      const wert = `Cutover-Probe Schritt ${i}`
      await seite.goto(`${BASIS}/admin/vertrieb/anfragen/${probeId}`, { waitUntil: "networkidle" })
      await seite.fill("#nextAction", wert)
      await seite.locator("#nextAction").locator("xpath=ancestor::form").getByRole("button").first().click()
      await seite.waitForTimeout(2500)
      if ((await seite.inputValue("#nextAction")) === wert) frisch++
    }
    p(frisch === 3, "dreimal gespeichert, dreimal der neue Stand", `${frisch}/3`)

    console.log("\nA28 · Ungespeichertes verschwindet nicht still")
    await seite.goto(`${BASIS}/admin/vertrieb/anfragen/${probeId}`, { waitUntil: "networkidle" })
    await seite.fill("#nextAction", "ungespeicherter Text")
    let gefragt = false
    seite.once("dialog", async (d) => { gefragt = true; await d.dismiss() })
    await seite.getByRole("link", { name: /Kunden/ }).first().click().catch(() => {})
    await seite.waitForTimeout(800)
    p(gefragt, "die Wache fragt beim Wechsel")
    p(seite.url().includes(probeId), "abgelehnt heisst: die Seite bleibt")
    p((await seite.inputValue("#nextAction")) === "ungespeicherter Text", "und der Text steht noch da")
  }

  console.log("\nA25 · Jede Kennzahl fuehrt zu ihren Zeilen")
  await seite.goto(`${BASIS}/admin`, { waitUntil: "networkidle" })
  for (const key of ["neueAnfragen", "ohneSchritt"]) {
    const feld = seite.locator(`[data-kennzahl="${key}"]`)
    if (await feld.count()) {
      const zahl = Number(await feld.innerText())
      const ziel = await feld.locator("xpath=ancestor::a").getAttribute("href")
      await seite.goto(`${BASIS}${ziel}`, { waitUntil: "networkidle" })
      const zeilen = await seite.locator("main table tbody tr").count()
      p(zahl === zeilen, `${key}: Kachel ${zahl} = ${zeilen} Zeilen`, ziel ?? "")
      await seite.goto(`${BASIS}/admin`, { waitUntil: "networkidle" })
    } else {
      notiz(`${key}: keine Kachel gefunden`)
    }
  }

  console.log("\nA01 · Tuerkisch")
  await ctx.addCookies([{ name: "cd_admin_sprache", value: "tr", url: BASIS }])
  await seite.goto(`${BASIS}/admin`, { waitUntil: "networkidle" })
  const tr = await seite.locator("main").innerText()
  p(/Genel bakış|Bugün|Talep/i.test(tr), "die Oberflaeche spricht Tuerkisch", tr.slice(0, 40).replace(/\s+/g, " "))
  await ctx.addCookies([{ name: "cd_admin_sprache", value: "de", url: BASIS }])

  console.log("\nA26 · Mobil 390")
  const mobil = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
  const m = await mobil.newPage()
  await m.goto(`${BASIS}/admin/login`, { waitUntil: "networkidle" })
  await m.fill("#password", PASSWORT)
  await m.locator("#password").press("Enter")
  await m.waitForURL((u) => !u.pathname.startsWith("/admin/login"), { timeout: 30_000 })
  for (const pfad of ["/admin", "/admin/vertrieb/anfragen"]) {
    await m.goto(`${BASIS}${pfad}`, { waitUntil: "networkidle" })
    const ueberlauf = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    p(ueberlauf <= 0, `${pfad}: kein waagerechter Ueberlauf`, String(ueberlauf))
  }
  await mobil.close()

  /* Aufraeumen: die Probe wird archiviert, nicht geloescht. */
  if (probeId) {
    console.log("\nAufraeumen · die Probe wird archiviert")
    await seite.goto(`${BASIS}/admin/vertrieb/anfragen/${probeId}`, { waitUntil: "networkidle" })
    const grund = seite.locator("#grund")
    if (await grund.count()) {
      await grund.selectOption("spam").catch(() => {})
      await seite.getByRole("button", { name: /Archivieren/i }).first().click().catch(() => {})
      await seite.waitForTimeout(2000)
      const zustand = await seite.locator("main").innerText()
      p(/Archiviert/i.test(zustand), "die Probe ist archiviert — nicht geloescht")
    } else {
      notiz("kein Archivfeld gefunden — die Probe bitte von Hand archivieren")
    }
  }

  await browser.close()
}

/* ── R5 · zuletzt, weil es diese Adresse sperrt ────────────────────────── */
if (!hat("--ohne-r5")) {
  console.log("\nR5 · Das Versuchsfenster (sperrt diese Adresse fuer bis zu 10 Minuten)")
  let letzte = 0
  for (let i = 0; i < 12; i++) {
    const r = await hole("/api/admin/session", {
      method: "POST",
      headers: { "content-type": "application/json", origin: BASIS },
      body: JSON.stringify({ password: `cutover-falsch-${i}` }),
    })
    letzte = r.status
    if (r.status === 429) break
  }
  p(letzte === 429, "nach wiederholten Fehlversuchen: 429", String(letzte))
  const mitRichtigem = await anmelden()
  p(mitRichtigem.status === 429, "auch das richtige Passwort kommt im Fenster nicht durch", String(mitRichtigem.status))

  const dbUrl = process.env.DATABASE_URL
  if (dbUrl && !dbUrl.startsWith("[")) {
    const pg = (await import("pg")).default
    const c = new pg.Client({ connectionString: dbUrl, ssl: /localhost|127\.0\.0\.1/.test(dbUrl) ? false : { rejectUnauthorized: false } })
    await c.connect()
    const n = (await c.query(`SELECT count(*)::int AS n FROM rate_limit_windows`)).rows[0].n
    await c.end()
    p(n > 0, "das Fenster steht in der Datenbank, nicht im Arbeitsspeicher", `${n} Zeile(n)`)
  } else {
    notiz("R5 · Datenbankbeleg uebersprungen (keine DATABASE_URL)")
  }
} else {
  notiz("R5 uebersprungen (--ohne-r5) — dann bleibt B08 live unbewiesen")
}

console.log(
  fehler === 0
    ? "\nLIVE GRUEN — R1–R9 und die Live-Abnahme halten gegen Produktion.\n"
    : `\n${fehler} Befund(e) live. Jeder owner-unabhaengige davon gehoert in diesen Lauf.\n`,
)
process.exit(fehler ? 1 : 0)
