#!/usr/bin/env node
/**
 * B-3 · DAS VEROEFFENTLICHUNGSREGISTER — GEGEN ECHTE ZEILEN.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE EINE FRAGE, DIE DIESES REGISTER BEANTWORTEN MUSS
 *
 * „Hat Veroeffentlichen ein Gespraech erzeugt?" — und zwar ohne dabei eine
 * zweite Beziehungsgeschichte anzulegen. Genau das wird hier geprueft:
 *
 *   V1 eintragen und wiederfinden (was, wo, wann, Adresse)
 *   V2 ohne Reaktion ist die Reaktion `keine` — nicht leer, nicht geraten
 *   V3 eine Reaktion mit Bezug schreibt EINE Chronikzeile am Datensatz
 *   V4 dieselbe Reaktion noch einmal legt keinen zweiten Menschen an
 *   V5 eine Reaktion OHNE Bezug schreibt KEINE Chronikzeile
 *   V6 der Titel des Bezugs wird gelesen, nicht kopiert
 *   V7 nach Kanal filtern
 *   V8 fehlende Tabelle = „nicht eingerichtet", kein Ausfall
 *
 * Aufruf: VEROEFFENTLICHUNG_DRILL_URL=postgres://localhost/drill_veroeffentlichung \
 *   node --import ./scripts/lib/alias-hook.mjs scripts/veroeffentlichung-drill.mjs
 */
import pg from "pg"

import { requireSafeTarget } from "./lib/env-guard.mjs"

const ZIEL = process.env.VEROEFFENTLICHUNG_DRILL_URL || "postgres://localhost/drill_veroeffentlichung"
requireSafeTarget(ZIEL, "Veroeffentlichungs-Probelauf")
process.env.LEAD_STORE = "pg-lokal"

const { SCHEMA, BACKFILL } = await import("@/lib/neon-client")
const { createNeonVertrieb } = await import("@/lib/vertrieb-store-neon")

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

/* Ein echter Mensch im System — die Reaktion soll an SEINER Akte landen. */
const { id: anfrageId } = await store.createEnquiry({
  idempotenz: "b3-1",
  quelle: "empfehlung",
  sprache: "de",
  name: "Cem Probe",
  email: null,
  telefon: "+49 441 121212",
  betrieb: "Probe Register GmbH",
  nachricht: "aus einem Beitrag",
  verantwortlich: "owner",
})
const anfrage = await store.getEnquiry(anfrageId)
const kontaktId = anfrage.contactId

console.log("\nV1 · Eintragen und wiederfinden")
const eintrag = await store.recordPublication({
  was: "Build Note: Warum wir Angebote nicht automatisieren",
  kanal: "linkedin",
  veroeffentlichtAm: "2026-09-20",
  url: "https://example.invalid/beitrag",
})
p(Boolean(eintrag?.id), "eingetragen")
let liste = await store.listPublications({ limit: 50 })
p(Array.isArray(liste) && liste.length === 1, "genau ein Eintrag", `${liste?.length}`)
p(liste[0].was.startsWith("Build Note"), "mit seinem Satz")
p(liste[0].kanal === "linkedin", "mit seinem Kanal")
p(liste[0].veroeffentlichtAm === "2026-09-20", "mit seinem Datum", liste[0].veroeffentlichtAm)
p(liste[0].url === "https://example.invalid/beitrag", "mit seiner Adresse")
p(liste[0].actor === "owner", "und mit dem, der ihn gemacht hat")

console.log("\nV2 · Ohne Reaktion ist die Reaktion `keine`")
p(liste[0].reaktion === "keine", "nicht leer, nicht geraten", liste[0].reaktion)
p(liste[0].bezug === null, "und kein Bezug")

console.log("\nV3 · Eine Reaktion mit Bezug schreibt EINE Chronikzeile")
p(await store.setPublicationReaktion(eintrag.id, "nachricht", "hat auf LinkedIn geschrieben", { art: "kontakt", id: kontaktId }), "Reaktion eingetragen")
{
  const chronik = await store.activities("contact", kontaktId)
  const zeilen = chronik.filter((a) => a.kind === "veroeffentlichung.reaktion")
  p(zeilen.length === 1, "genau eine Zeile in der Akte des Menschen", `${zeilen.length}`)
  p(zeilen[0]?.data?.reaktion === "nachricht", "mit der Art der Reaktion als Maschinenwert")
  p(zeilen[0]?.data?.veroeffentlichung === eintrag.id, "und mit dem Verweis auf die Veroeffentlichung")
  p(zeilen[0]?.actor === "owner", "mit Akteur")
}

console.log("\nV4 · Dieselbe Reaktion noch einmal legt keinen zweiten Menschen an")
{
  const kontakteVorher = (await q(`SELECT count(*)::int AS n FROM contacts`))[0].n
  await store.setPublicationReaktion(eintrag.id, "nachricht", "hat auf LinkedIn geschrieben", { art: "kontakt", id: kontaktId })
  const kontakteNachher = (await q(`SELECT count(*)::int AS n FROM contacts`))[0].n
  p(kontakteVorher === kontakteNachher, "kein zweiter Kontakt", `${kontakteVorher} → ${kontakteNachher}`)
  const zeilen = (await store.activities("contact", kontaktId)).filter((a) => a.kind === "veroeffentlichung.reaktion")
  p(zeilen.length === 2, "die Chronik zaehlt zwei Eintraege — zwei Male eingetragen ist zweimal geschehen", `${zeilen.length}`)
}

console.log("\nV5 · Eine Reaktion OHNE Bezug bleibt im Register")
{
  const zweiter = await store.recordPublication({
    was: "Kurzer Gedanke zum Betrieb",
    kanal: "website",
    veroeffentlichtAm: "2026-09-21",
    url: null,
  })
  const vorher = (await q(`SELECT count(*)::int AS n FROM activities`))[0].n
  await store.setPublicationReaktion(zweiter.id, "kommentar", "zwei Kommentare, niemand bekannt", null)
  const nachher = (await q(`SELECT count(*)::int AS n FROM activities`))[0].n
  p(vorher === nachher, "keine Chronikzeile ohne Menschen", `${vorher} → ${nachher}`)
  const l = await store.listPublications({ limit: 50 })
  const e = l.find((x) => x.id === zweiter.id)
  p(e?.reaktion === "kommentar", "die Reaktion steht trotzdem im Register")
  p(e?.bezug === null, "ohne Bezug")
}

console.log("\nV6 · Der Titel des Bezugs wird gelesen, nicht kopiert")
{
  await q(`UPDATE contacts SET name = 'Cem Probe (umbenannt)' WHERE id = $1`, [kontaktId])
  const l = await store.listPublications({ limit: 50 })
  const e = l.find((x) => x.id === eintrag.id)
  p(e?.bezug?.titel === "Cem Probe (umbenannt)", "der neue Name erscheint", String(e?.bezug?.titel))
  const spalten = (await q(
    `SELECT column_name FROM information_schema.columns WHERE table_name='publications'`,
  )).map((r) => r.column_name)
  p(!spalten.some((c) => /name|titel/.test(c)), "und das Register speichert keinen Namen", spalten.join(","))
}

console.log("\nV7 · Nach Kanal filtern")
{
  const nurLinkedin = await store.listPublications({ kanal: "linkedin", limit: 50 })
  p(nurLinkedin.length === 1 && nurLinkedin[0].kanal === "linkedin", "ein LinkedIn-Eintrag", `${nurLinkedin.length}`)
  const alle = await store.listPublications({ limit: 50 })
  p(alle.length === 2, "ohne Filter beide", `${alle.length}`)
}

console.log("\nV8 · Fehlt die Tabelle, faellt nichts aus")
{
  await q(`DROP TABLE publications`)
  const l = await store.listPublications({ limit: 50 })
  p(l === null, "die Liste sagt „nicht lesbar“ statt „leer“", String(l))
  const summary = await store.summary()
  p(typeof summary.newEnquiries === "number", "und der Vertrieb antwortet weiter")
}

console.log("\nV9 · §18 Freigabe-Schutz: entwurf → freigegeben → veroeffentlicht, nie direkt")
{
  const { kannVeroeffentlichen, kannFreigeben } = await import("@/lib/veroeffentlichung-zustand")
  /* V8 hat die Tabelle entfernt — neu aufsetzen, dann einen Eintrag auf dem
     alten Weg („schon hinaus") anlegen, bevor der neue Weg geprueft wird. */
  for (const stmt of SCHEMA) await q(stmt)
  const altEintrag = await store.recordPublication({ was: "Bestand", kanal: "website", veroeffentlichtAm: "2026-09-01", url: null })
  p(kannVeroeffentlichen({ zustand: "entwurf" }) === false, "rein: Entwurf ist nicht veroeffentlichbar")
  p(kannVeroeffentlichen({ zustand: "freigegeben" }) === true, "rein: Freigegebenes ist veroeffentlichbar")
  p(kannFreigeben({ zustand: "entwurf" }, "redaktion") === false, "rein: Redaktion gibt nicht frei")
  p(kannFreigeben({ zustand: "entwurf" }, "owner") === true, "rein: Owner gibt frei")

  const entwurf = await store.recordDraft({ was: "Einwand: Gehoert mir das dann?", kanal: "linkedin", quelle: "einwand", quelleId: null })
  p(Boolean(entwurf?.id), "Entwurf angelegt")
  p((await store.markPublished(entwurf.id, "2026-09-25", null)) === false, "Entwurf laesst sich NICHT direkt veroeffentlichen")

  const redaktion = createNeonVertrieb(ZIEL, { kennung: "redaktion", herkunft: "HUMAN" })
  p((await redaktion.approvePublication(entwurf.id)) === false, "Redaktion kann nicht freigeben (Store prueft selbst)")
  p((await store.approvePublication(entwurf.id)) === true, "Owner gibt frei")
  p((await store.approvePublication(entwurf.id)) === false, "zweite Freigabe ist wirkungslos")
  p((await store.markPublished(entwurf.id, "2026-09-25", "https://example.invalid/b")) === true, "Freigegebenes wird veroeffentlicht")

  const l = await store.listPublications({ limit: 50 })
  const zeile = l?.find((x) => x.id === entwurf.id)
  p(zeile?.zustand === "veroeffentlicht" && zeile?.veroeffentlichtAm === "2026-09-25", "Zustand und Datum stehen")
  p(zeile?.quelle?.art === "einwand" && zeile?.freigegebenVon === "owner", "Quelle und Freigebender stehen")
  const alt = l?.find((x) => x.id === altEintrag?.id)
  p(alt?.zustand === "veroeffentlicht", "Bestand (vor 021 eingetragen) bleibt veroeffentlicht")

  let abgewiesen = false
  try {
    await q(`INSERT INTO publications (id, was, kanal, zustand) VALUES ('ohne-datum','x','website','veroeffentlicht')`)
  } catch {
    abgewiesen = true
  }
  p(abgewiesen, "Datenbank weist „veroeffentlicht ohne Datum“ ab")
}

await client.end()
console.log(
  fehler === 0
    ? "\nAlle Pruefungen bestanden — das Register merkt sich, was hinausging, ohne ein zweites CRM zu werden.\n"
    : `\nABGEBROCHEN — ${fehler} Befund(e)\n`,
)
process.exit(fehler ? 1 : 0)
