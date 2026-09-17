#!/usr/bin/env node
/**
 * ADM-05 · BETRIEBSKETTEN-PROBELAUF — derselbe Store-Code wie in Produktion,
 * gegen eine WEGWERF-Postgres (`LEAD_STORE=pg-lokal`).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER AUF DEM SPIEL STEHT (H20)
 *
 * Die Kette Angebot → Ja → Projekt → Abnahme → Uebergabe besteht aus
 * ZUSTANDSWECHSELN, und jeder von ihnen ist eine Geschaeftshandlung: senden,
 * zusagen, abnehmen, uebergeben. Ein Zustandswechsel, der zweimal passiert,
 * ist nicht doppelt gespeichert — er ist doppelt GESCHEHEN, jedenfalls im
 * einzigen Protokoll, das dieses Haus darueber hat.
 *
 * Gemessen am 17.09.2026 taten fuenf dieser Wechsel genau das: Die Bedingung
 * stand im UPDATE, aber niemand las das Ergebnis. Der zweite Klick aenderte
 * nichts, meldete Erfolg und schrieb trotzdem eine zweite Chronikzeile.
 *
 *   B1  Angebot senden — zweimal, und zehnmal gleichzeitig
 *   B2  Zusage — zweimal, und zehnmal gleichzeitig; der Vorgang gewinnt einmal
 *   B3  Projekt aufsetzen — zweimal ist ein Projekt (bestand schon)
 *   B4  Materialeingang — zweimal ist ein Fristbeginn (bestand schon)
 *   B5  Aenderung — dieselbe zweimal zaehlt einmal; zehn verschiedene
 *       gleichzeitig gehen alle nicht verloren
 *   B6  Abnahme und Uebergabe — je einmal, und nur in der richtigen Reihenfolge
 *   B7  Die Reihenfolge selbst: uebergeben ohne Abnahme geht nicht
 *
 * Aufruf: BETRIEBSKETTE_DRILL_URL=postgres://localhost/drill_betriebskette npm run betriebskette-drill
 */
import pg from "pg"
import { randomUUID } from "node:crypto"

import { requireSafeTarget } from "./lib/env-guard.mjs"

const ZIEL = process.env.BETRIEBSKETTE_DRILL_URL || "postgres://localhost/drill_betriebskette"
requireSafeTarget(ZIEL, "Betriebsketten-Probelauf")
process.env.LEAD_STORE = "pg-lokal"

const { SCHEMA, BACKFILL } = await import("../lib/neon-client.ts")
const { createNeonVertrieb } = await import("../lib/vertrieb-store-neon.ts")

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
const zahl = async (sql, params) => Number((await q(sql, params))[0].n)

/** Wie oft diese Art Ereignis an diesem Vorgang steht. */
const chronik = (oppId, art) =>
  zahl(
    `SELECT count(*)::int n FROM activities WHERE subject_type='opportunity' AND subject_id=$1 AND kind=$2`,
    [oppId, art],
  )

/* ═══════════════════════════════════════════════════════════════════════════
 * EIN VOLLSTAENDIGES, SENDEFAEHIGES ANGEBOT
 *
 * Der Probelauf faelscht keine Reife: Er baut ein Angebot, das `fehltFuer`
 * WIRKLICH durchlaesst — alle Pflichtabschnitte, eine Katalogposition, die
 * Belege der Angebotsart. Sonst pruefte er die Ablehnung statt der Wirkung.
 * ═══════════════════════════════════════════════════════════════════════════ */

const ABSCHNITTE_VOLL = {
  ausgangslage: "Der Betrieb hat eine Seite von 2014 ohne Pflege.",
  verstanden: "Gesucht ist ein Weg, Anfragen anzunehmen, ohne taeglich Hand anzulegen.",
  umfang: "Sechs Seiten, ein Formular, ein Betriebsvertrag.",
  zeit: "Vier Wochen ab Materialeingang.",
  preis: "Das Website-Paket zum Katalogpreis.",
  betrieb: "Monatlicher Betrieb mit Aktualisierungen und Erreichbarkeit.",
  "nicht-versprochen": "Keine Zusage zu Platz eins bei Suchmaschinen.",
  "naechster-schritt": "Ihre Rueckmeldung bis Ende der Woche, dann Terminvorschlag.",
}

function referenz() {
  const d = new Date()
  const zwei = (n) => String(n).padStart(2, "0")
  return `CD-${String(d.getFullYear()).slice(2)}${zwei(d.getMonth() + 1)}${zwei(d.getDate())}-${zwei(
    Math.floor(Math.random() * 9000) + 1000,
  )}`
}

function inDreissigTagen() {
  return new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10)
}

const JA = {
  form: "e-mail",
  von: "Ansprechpartner",
  rolle: "Geschäftsführung",
  am: new Date().toISOString().slice(0, 10),
  fundstelle: "Postfach info@creadig.de",
}

/** Legt Organisation + Vorgang + sendefaehiges Angebot an, gibt die Kennungen zurueck. */
async function vorgangMitAngebot(titel) {
  const orgId = randomUUID()
  await q(
    `INSERT INTO organisations (id,name,lifecycle,created_at,updated_at)
     VALUES ($1,$2,'prospect',now(),now())`,
    [orgId, `${titel} Betrieb ${orgId.slice(0, 8)}`],
  )
  const oppId = randomUUID()
  await q(
    `INSERT INTO opportunities (id,title,organisation_id,readiness_evidence,created_at,updated_at)
     VALUES ($1,$2,$3,$4::text[],now(),now())`,
    /* Die Belege der Angebotsart „website“ — ohne sie ist das Angebot nicht reif. */
    [oppId, titel, orgId, ["betrieb", "umfang", "material"]],
  )
  const offerId = await store.saveOfferDraft({
    opportunityId: oppId,
    referenz: referenz(),
    kind: "website",
    sprache: "de",
    gueltigBis: inDreissigTagen(),
    abschnitte: ABSCHNITTE_VOLL,
    positionen: [{ art: "katalog", was: "Website-Paket", quelle: "paket-website" }],
  })
  return { orgId, oppId, offerId }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * B1 · ANGEBOT SENDEN
 * ═══════════════════════════════════════════════════════════════════════════ */
console.log("\nB1 · Ein Angebot geht einmal hinaus")
{
  const { oppId, offerId } = await vorgangMitAngebot("B1 Website")
  const erst = await store.sendOffer(offerId)
  p(erst.length === 0, "erstes Senden gelingt", erst.map((b) => b.satz).join(" | "))
  const zweit = await store.sendOffer(offerId)
  p(zweit.length > 0, "zweites Senden meldet ehrlich, dass nichts geschah")
  p(await chronik(oppId, "offer.sent") === 1, "genau EINE Chronikzeile „gesendet“", String(await chronik(oppId, "offer.sent")))
}
{
  const { oppId, offerId } = await vorgangMitAngebot("B1 Parallel")
  const antworten = await Promise.all(Array.from({ length: 10 }, () => store.sendOffer(offerId)))
  p(antworten.filter((a) => a.length === 0).length === 1, "zehn gleichzeitig: genau einer sendet")
  p(await chronik(oppId, "offer.sent") === 1, "und genau eine Chronikzeile entsteht", String(await chronik(oppId, "offer.sent")))
}

/* ═══════════════════════════════════════════════════════════════════════════
 * B2 · DIE ZUSAGE
 * ═══════════════════════════════════════════════════════════════════════════ */
console.log("\nB2 · Eine Zusage ist eine Zusage")
{
  const { oppId, offerId } = await vorgangMitAngebot("B2 Zusage")
  await store.sendOffer(offerId)
  const erst = await store.acceptOffer(offerId, JA)
  p(erst.length === 0, "erste Zusage gelingt", erst.map((b) => b.satz).join(" | "))
  const zweit = await store.acceptOffer(offerId, JA)
  p(zweit.length > 0, "zweite Zusage wird abgelehnt")
  p(await chronik(oppId, "offer.accepted") === 1, "genau EINE Chronikzeile „angenommen“")
  const status = (await q(`SELECT status FROM opportunities WHERE id=$1`, [oppId]))[0].status
  p(status === "won", "der Vorgang steht auf gewonnen", status)
}
{
  const { oppId, offerId } = await vorgangMitAngebot("B2 Parallel")
  await store.sendOffer(offerId)
  const antworten = await Promise.all(Array.from({ length: 10 }, () => store.acceptOffer(offerId, JA)))
  p(antworten.filter((a) => a.length === 0).length === 1, "zehn gleichzeitig: genau eine Zusage")
  p(await chronik(oppId, "offer.accepted") === 1, "und genau eine Chronikzeile", String(await chronik(oppId, "offer.accepted")))
}

/* ═══════════════════════════════════════════════════════════════════════════
 * B3–B4 · PROJEKT UND FRISTBEGINN
 * ═══════════════════════════════════════════════════════════════════════════ */
console.log("\nB3–B4 · Projekt und Fristbeginn")
const kette = await vorgangMitAngebot("B3 Lieferung")
await store.sendOffer(kette.offerId)
await store.acceptOffer(kette.offerId, JA)
const ersteProjekt = await store.startProject(kette.offerId)
p(ersteProjekt.maengel.length === 0 && ersteProjekt.id, "B3 Projekt entsteht aus dem Ja")
const zweitesProjekt = await store.startProject(kette.offerId)
p(zweitesProjekt.id === null && zweitesProjekt.maengel.length > 0, "B3 ein zweites Projekt zum selben Ja gibt es nicht")
p(await zahl(`SELECT count(*)::int n FROM projects WHERE offer_id=$1`, [kette.offerId]) === 1, "B3 genau ein Projekt in der Datenbank")
p(await chronik(kette.oppId, "project.started") === 1, "B3 genau eine Chronikzeile")

const projektId = ersteProjekt.id
const heute = new Date().toISOString().slice(0, 10)
p((await store.receiveMaterial(projektId, heute)).length === 0, "B4 Materialeingang gelingt")
p((await store.receiveMaterial(projektId, heute)).length > 0, "B4 zweiter Materialeingang wird abgelehnt")
p(await chronik(kette.oppId, "project.material") === 1, "B4 die Frist beginnt genau einmal")

/* ═══════════════════════════════════════════════════════════════════════════
 * B5 · AENDERUNGEN — Geld, das nicht verschwinden darf
 * ═══════════════════════════════════════════════════════════════════════════ */
console.log("\nB5 · Aenderungen gehen weder verloren noch doppelt ein")
const aenderung = (was) => ({ was, tage: 2, zugestimmt: { von: "Kunde", am: heute, fundstelle: "Postfach" } })
p((await store.addProjectChange(projektId, aenderung("Zusatzseite Team"))).length === 0, "eine Aenderung wird eingetragen")
p((await store.addProjectChange(projektId, aenderung("Zusatzseite Team"))).length > 0, "dieselbe Aenderung ein zweites Mal nicht")
{
  const [projekt] = await store.listProjects(kette.oppId)
  p(projekt.aenderungen.length === 1, "genau eine Aenderung steht am Projekt", String(projekt.aenderungen.length))
  p(await chronik(kette.oppId, "project.change") === 1, "genau eine Chronikzeile")
}
{
  /* Zehn VERSCHIEDENE gleichzeitig — hier ist der verlorene Schreibvorgang die Gefahr. */
  await Promise.all(
    Array.from({ length: 10 }, (_, i) => store.addProjectChange(projektId, aenderung(`Parallelaenderung ${i}`))),
  )
  const [projekt] = await store.listProjects(kette.oppId)
  p(projekt.aenderungen.length === 11, "zehn gleichzeitige Aenderungen gehen alle ein", String(projekt.aenderungen.length))
}

/* ═══════════════════════════════════════════════════════════════════════════
 * B6–B7 · ABNAHME UND UEBERGABE
 * ═══════════════════════════════════════════════════════════════════════════ */
console.log("\nB6–B7 · Abnahme und Uebergabe geschehen einmal")
const STUECKE = {
  code: { am: heute, wie: "Repository uebergeben, Zugang erteilt" },
  inhalte: { am: heute, wie: "Texte und Bilder im Konto des Kunden" },
  zugaenge: { am: heute, wie: "Zugangsdaten im Passwortspeicher des Kunden" },
  domain: { am: heute, wie: "Domain auf den Kunden umgeschrieben" },
}
p((await store.handOver(projektId, STUECKE)).length > 0, "B7 ohne Abnahme keine Uebergabe")
p((await store.acceptDelivery(projektId, JA)).length === 0, "B6 Abnahme gelingt")
p((await store.acceptDelivery(projektId, JA)).length > 0, "B6 zweite Abnahme wird abgelehnt")
p(await chronik(kette.oppId, "project.accepted") === 1, "B6 genau eine Chronikzeile „Abnahme“")
p((await store.handOver(projektId, STUECKE)).length === 0, "B7 Uebergabe nach Abnahme gelingt")
p((await store.handOver(projektId, STUECKE)).length > 0, "B7 zweite Uebergabe wird abgelehnt")
p(await chronik(kette.oppId, "project.handover") === 1, "B7 genau eine Chronikzeile „Uebergabe“")
{
  const [projekt] = await store.listProjects(kette.oppId)
  p(projekt.zustand === "uebergeben", "B7 das Projekt steht auf uebergeben", projekt.zustand)
  p(
    (await store.addProjectChange(projektId, aenderung("Nachtrag nach Uebergabe"))).length > 0,
    "B7 ein uebergebenes Projekt aendert sich nicht mehr",
  )
}

await client.end()
console.log(
  fehler === 0
    ? "\nAlle Pruefungen bestanden — jeder Zustandswechsel der Betriebskette geschieht genau einmal.\n"
    : `\nABGEBROCHEN — ${fehler} Befund(e)\n`,
)
process.exit(fehler ? 1 : 0)
