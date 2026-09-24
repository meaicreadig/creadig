#!/usr/bin/env node
/**
 * B-1 · DIE BRÜCKE VON DER ERLAUBNIS ZUR ÖFFENTLICHEN SEITE.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER BEWIESEN WIRD — UND WARUM GEGEN ECHTE ZEILEN
 *
 * Die Frage „darf das öffentlich stehen" lässt sich nicht am Typ prüfen. Sie
 * entsteht aus drei Dingen gleichzeitig: dem Inhalt eines Falls, der Form der
 * Erlaubnis und dem Zeitpunkt eines Widerrufs. Deshalb legt dieser Probelauf
 * echte Erlaubniszeilen in eine Wegwerf-Datenbank und fragt die Projektion.
 *
 *   T1 ohne Erlaubnis  → kein oeffentlicher Fall
 *   T2 Teilerlaubnis   → nur die gedeckten Felder
 *   T3 volle Erlaubnis → der Fall erscheint
 *   T4 Widerruf        → der Fall verschwindet
 *   T5 die Chronik des Widerrufs bleibt stehen
 *   T6 nichts Internes verlaesst das Haus
 *   T7 Datenbank weg   → LEER, nicht „alles" (fail closed)
 *   T8 kein passender Kunde → die Seite funktioniert trotzdem
 *
 * Aufruf: FREIGABE_DRILL_URL=postgres://localhost/drill_freigabe_bruecke \
 *   node --import ./scripts/lib/alias-hook.mjs scripts/freigabe-bruecke-drill.mjs
 */
import pg from "pg"

import { requireSafeTarget } from "./lib/env-guard.mjs"

const ZIEL = process.env.FREIGABE_DRILL_URL || "postgres://localhost/drill_freigabe_bruecke"
requireSafeTarget(ZIEL, "Freigabe-Bruecken-Probelauf")
process.env.LEAD_STORE = "pg-lokal"
process.env.DATABASE_URL = ZIEL

const { SCHEMA, BACKFILL } = await import("@/lib/neon-client")
const { createNeonVertrieb } = await import("@/lib/vertrieb-store-neon")
const { caseStudies } = await import("@/lib/site-data")

let fehler = 0
const p = (ok, name, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

const client = new pg.Client({ connectionString: ZIEL })
await client.connect()
const q = async (t, params) => (await client.query(t, params ?? [])).rows
for (const stmt of SCHEMA) await q(stmt)
for (const stmt of BACKFILL) await q(stmt)

const store = createNeonVertrieb(ZIEL, { kennung: "owner", herkunft: "HUMAN" })

/*
 * Der Probefall ist ein ECHTER Eintrag aus `lib/site-data.ts` — einer mit
 * Zahlen und Zitat, sonst prueft T2 nichts. Gibt es keinen, sagt der Lauf das
 * und prueft, was er pruefen kann.
 */
const fall = caseStudies.find((c) => c.metrics.length > 0 && c.voice) ?? caseStudies[0]
console.log(`\nProbefall: ${fall.client} (${fall.metrics.length} Zahl(en), Zitat: ${fall.voice ? "ja" : "nein"})`)

/* Die Organisation muss existieren — die Erlaubnis haengt an ihr. */
await q(
  `INSERT INTO organisations (id, name, lifecycle, created_at, updated_at)
   VALUES ('drill-b1-org', $1, 'kunde', now(), now()) ON CONFLICT (id) DO NOTHING`,
  [fall.client],
)

/* Die Projektion wird je Test frisch geladen: `unstable_cache` haelt sonst den ersten Stand. */
const { projektionOhneCache } = await import("@/lib/freigabe-projektion")
const projektion = () => projektionOhneCache()

console.log("\nT1 · Ohne Erlaubnis ist nichts oeffentlich")
{
  const { faelle, quelle } = await projektion()
  p(faelle.length === 0, "kein Fall", `${faelle.length} Fall/Faelle`)
  p(quelle === "admin", "und die Quelle ist die Erlaubnislage, nicht der Quelltext", quelle)
}

console.log("\nT2 · Teilerlaubnis zeigt nur, was gedeckt ist")
const erteilen = async (scopes, referenz) =>
  store.recordRelease({
    organisationId: "drill-b1-org",
    name: "Frau Probe",
    role: "Leitung",
    company: fall.client,
    form: "e-mail",
    grantedOn: "2026-09-01",
    scopes,
    reference: referenz,
  })

const teil = await erteilen(["name", "fallstudie"], "Postfach, Betreff Freigabe Text")
p(Boolean(teil?.id), "Erlaubnis fuer Name und Fallstudie erfasst")
{
  const { faelle } = await projektion()
  const f = faelle.find((x) => x.slug === fall.slug)
  p(Boolean(f), "der Fall erscheint")
  if (f) {
    p(f.metrics.length === 0, "aber ohne Zahlen — dafuer gibt es keine Erlaubnis", `${f.metrics.length}`)
    p(f.voice === null, "und ohne Zitat")
    p(f.image === null, "und ohne Bild — das Bild braucht die Logo-Erlaubnis", `Datei hat Bild: ${fall.image ? "ja" : "nein"}`)
  }
}

console.log("\nT3 · Volle Erlaubnis zeigt den ganzen Fall")
await erteilen(["zahl", "zitat", "logo"], "Postfach, Betreff Freigabe Zahlen und Zitat")
{
  const { faelle } = await projektion()
  const f = faelle.find((x) => x.slug === fall.slug)
  p(Boolean(f), "der Fall steht")
  if (f) {
    p(f.metrics.length === fall.metrics.length, "mit seinen Zahlen", `${f.metrics.length}/${fall.metrics.length}`)
    p((f.voice === null) === (fall.voice === null), "mit seinem Zitat")
    p(fall.image === null || f.image === fall.image, "und mit seinem Bild", `${f.image ?? "kein Bild in der Datei"}`)
  }
}

console.log("\nT4/T5 · Ein Widerruf wirkt — und bleibt in der Akte")
{
  const zeilen = await store.listReleases("drill-b1-org")
  for (const z of zeilen) await store.withdrawRelease(z.id, "Probe: zurueckgezogen")
  const { faelle } = await projektion()
  p(faelle.length === 0, "nach dem Widerruf ist nichts mehr oeffentlich", `${faelle.length}`)
  const nachher = await store.listReleases("drill-b1-org")
  p(nachher.length === zeilen.length, "die Zeilen stehen weiter in der Akte", `${nachher.length}`)
  p(nachher.every((z) => z.withdrawnAt !== null), "jede mit ihrem Widerrufsdatum")
  p(nachher.every((z) => Boolean(z.withdrawnReason)), "und mit Grund")
}

console.log("\nT6 · Nichts Internes verlaesst das Haus")
{
  await erteilen(["name", "fallstudie"], "Postfach, zweite Erlaubnis")
  const { faelle } = await projektion()
  const roh = JSON.stringify(faelle)
  p(!roh.includes("Frau Probe"), "kein Name der erteilenden Person")
  p(!roh.includes("Postfach"), "keine Fundstelle der Erlaubnis")
  p(!roh.includes("drill-b1-org"), "keine interne Kennung")
  p(!/withdrawn|reference|actor/i.test(roh), "keine Felder aus der Erlaubniszeile")
}

console.log("\nT7 · Faellt die Datenbank aus, wird nichts oeffentlich (fail closed)")
{
  process.env.LEAD_STORE = "aus"
  const { faelle, quelle, grund } = await projektionOhneCache()
  p(faelle.length === 0, "kein Fall", `${faelle.length}`)
  p(quelle === "keine", "und die Projektion sagt, dass sie nichts wusste", `${quelle} · ${grund}`)
  process.env.LEAD_STORE = "pg-lokal"
}

console.log("\nT8 · Eine Erlaubnis ohne passenden Fall aendert nichts")
{
  await q(
    `INSERT INTO organisations (id, name, lifecycle, created_at, updated_at)
     VALUES ('drill-b1-fremd', 'Firma Ohne Fallstudie GmbH', 'kunde', now(), now()) ON CONFLICT (id) DO NOTHING`,
  )
  await store.recordRelease({
    organisationId: "drill-b1-fremd",
    name: "Herr Fremd",
    role: "Leitung",
    company: "Firma Ohne Fallstudie GmbH",
    form: "e-mail",
    grantedOn: "2026-09-01",
    scopes: ["name", "fallstudie", "zahl", "zitat"],
    reference: "Postfach, fremde Firma",
  })
  const { faelle } = await projektion()
  p(!faelle.some((f) => /Ohne Fallstudie/.test(f.client)), "kein erfundener Fall")
  p(faelle.length >= 1, "und der echte bleibt unberuehrt", `${faelle.length}`)
}

await client.end()
console.log(
  fehler === 0
    ? "\nAlle Pruefungen bestanden — oeffentlich steht nur, was erlaubt ist.\n"
    : `\nABGEBROCHEN — ${fehler} Befund(e)\n`,
)
process.exit(fehler ? 1 : 0)
