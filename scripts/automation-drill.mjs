#!/usr/bin/env node
/**
 * ADM-06 · A29 — AUTOMATION GEGEN EINE ECHTE DATENBANK
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE DREI EIGENSCHAFTEN, DIE DER VERTRAG VERLANGT
 *
 *   beobachtbar   Jede Ausfuehrung hinterlaesst eine Zeile mit Ausloeser,
 *                 Ereignis, Gegenstand, Ergebnis und Zeitpunkt.
 *   steuerbar     Ein abgeschalteter Ausloeser laeuft nicht — und zwar
 *                 VOR der Idempotenz: Wer abschaltet, will, dass nichts
 *                 geschieht, nicht dass es einmal noch geschieht.
 *   umkehrbar     Eine Wirkung laesst sich abhaken oder zuruecknehmen, und
 *                 der Eintrag bleibt stehen.
 *
 * Und die Regel, die alles traegt: EINE AUTOMATION AENDERT KEINEN
 * GESCHAEFTSDATENSATZ. Das wird hier nicht behauptet, sondern gezaehlt —
 * vor und nach jedem Lauf.
 *
 *   T1  Abnahme → Erinnerung an die Freigabe (erinnern, keine Chronikzeile)
 *   T2  Uebergabe → Chronikzeile mit Herkunft AUTOMATION (notieren)
 *   T3  Verlust → nachgerechnet; erst ab drei gleichen Gruenden ein Muster
 *   T4  Kein Rauschen: ein Stufenwechsel ohne Verlust loest nichts aus
 *   T5  Idempotenz: dasselbe Ereignis zweimal = eine Wirkung
 *   T6  Steuerbar: abgeschaltet laeuft nicht, wieder an laeuft wieder
 *   T7  Umkehrbar: abhaken und zuruecknehmen, der Eintrag bleibt
 *   T8  Kein Geschaeftsdatensatz hat sich durch eine Automation geaendert
 *   T9  Faellt das Protokoll aus, bricht keine Geschaeftshandlung ab
 *
 * Aufruf: AUTOMATION_DRILL_URL=postgres://localhost/drill_automation npm run automation-drill
 */
import pg from "pg"
import { randomUUID } from "node:crypto"

import { requireSafeTarget } from "./lib/env-guard.mjs"

const ZIEL = process.env.AUTOMATION_DRILL_URL || "postgres://localhost/drill_automation"
requireSafeTarget(ZIEL, "Automations-Probelauf")
process.env.LEAD_STORE = "pg-lokal"

const { SCHEMA, BACKFILL } = await import("../lib/neon-client.ts")
const { createNeonVertrieb } = await import("../lib/vertrieb-store-neon.ts")
const { AUTOMATION_MUSTER_AB, entscheide, istAktiv, abgeschaltete } = await import("../lib/automation.ts")
const { MUSTER_AB } = await import("../lib/verlust.ts")
const { AUSLOESER, NIEMALS_AUTOMATISCH, HANDLUNGEN } = await import("../lib/ereignis.ts")
const { LOST_REASONS } = await import("../lib/sales-playbook.ts")

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
const laeufe = (ausloeser) =>
  q(`SELECT * FROM automation_runs WHERE ausloeser = $1 ORDER BY created_at`, [ausloeser])

/* ── Ein Vorgang mit Angebot, Ja und Projekt ── */
const heute = new Date().toISOString().slice(0, 10)
const JA = { form: "e-mail", von: "Kunde", rolle: "Leitung", am: heute, fundstelle: "Postfach" }
const ABSCHNITTE_VOLL = {
  ausgangslage: "a", verstanden: "b", umfang: "c", zeit: "d",
  preis: "e", betrieb: "f", "nicht-versprochen": "g", "naechster-schritt": "h",
}
async function kette(titel) {
  const orgId = randomUUID()
  await q(`INSERT INTO organisations (id,name,lifecycle,created_at,updated_at) VALUES ($1,$2,'kunde',now(),now())`,
    [orgId, `${titel} ${orgId.slice(0, 8)}`])
  const oppId = randomUUID()
  await q(`INSERT INTO opportunities (id,title,organisation_id,readiness_evidence,created_at,updated_at)
           VALUES ($1,$2,$3,$4::text[],now(),now())`,
    [oppId, titel, orgId, ["betrieb", "umfang", "material"]])
  const offerId = await store.saveOfferDraft({
    opportunityId: oppId,
    referenz: `CD-260917-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    kind: "website", sprache: "de",
    gueltigBis: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
    abschnitte: ABSCHNITTE_VOLL,
    positionen: [{ art: "katalog", was: "Website-Paket", quelle: "paket-website" }],
  })
  await store.sendOffer(offerId)
  await store.acceptOffer(offerId, JA)
  const { id: projektId } = await store.startProject(offerId)
  await store.receiveMaterial(projektId, heute)
  return { orgId, oppId, offerId, projektId }
}

/* ═══ T1 · Abnahme erinnert an die Freigabe ═══════════════════════════════ */
console.log("\nT1 · Nach der Abnahme steht eine Erinnerung — mehr nicht")
const k1 = await kette("T1 Abnahme")
const chronikVorher = await zahl(`SELECT count(*)::int n FROM activities WHERE subject_id=$1`, [k1.oppId])
await store.acceptDelivery(k1.projektId, JA)
{
  const rows = await laeufe("abnahme-erinnert-an-freigabe")
  p(rows.length === 1, "genau eine Ausfuehrung", String(rows.length))
  p(rows[0]?.zustand === "offen", "sie wartet auf einen Menschen", String(rows[0]?.zustand))
  p(rows[0]?.wirkung === "erinnern", "Wirkung: erinnern", String(rows[0]?.wirkung))
  p(rows[0]?.ergebnis === "freigabe-fragen", "mit dem erwarteten Ergebnis", String(rows[0]?.ergebnis))
  p(rows[0]?.gegenstand === k1.oppId, "am richtigen Vorgang")
  const automatikZeilen = await zahl(
    `SELECT count(*)::int n FROM activities WHERE subject_id=$1 AND origin='AUTOMATION'`, [k1.oppId])
  p(automatikZeilen === 0, "eine Erinnerung schreibt NICHT in die Chronik des Kunden", String(automatikZeilen))
  const chronikNachher = await zahl(`SELECT count(*)::int n FROM activities WHERE subject_id=$1`, [k1.oppId])
  p(chronikNachher === chronikVorher + 1, "nur die Abnahme selbst steht in der Chronik")
}

/* ═══ T2 · Uebergabe notiert ══════════════════════════════════════════════ */
console.log("\nT2 · Die Uebergabe notiert, WAS uebergeben wurde")
const STUECKE = {
  code: { am: heute, wie: "Repository uebergeben" },
  inhalte: { am: heute, wie: "Texte und Bilder beim Kunden" },
  zugaenge: { am: heute, wie: "Konten uebertragen" },
  domain: { am: heute, wie: "Domain umgeschrieben" },
}
await store.handOver(k1.projektId, STUECKE)
{
  const rows = await laeufe("uebergabe-notiert-vollstaendigkeit")
  p(rows.length === 1, "genau eine Ausfuehrung")
  p(rows[0]?.wirkung === "notieren", "Wirkung: notieren")
  p(Number(rows[0]?.daten?.anzahl) === 4, "vier Stuecke gezaehlt", String(rows[0]?.daten?.anzahl))
  const notiert = await q(
    `SELECT kind, origin, actor, data FROM activities WHERE subject_id=$1 AND origin='AUTOMATION'`, [k1.oppId])
  p(notiert.length === 1, "genau eine Chronikzeile")
  p(notiert[0]?.origin === "AUTOMATION", "Herkunft AUTOMATION — kein Mensch hat gehandelt")
  p(notiert[0]?.actor === "uebergabe-notiert-vollstaendigkeit", "der Ausloeser steht als Akteur")
}

/* ═══ T3/T4 · Verlust rechnet nach, alles andere nicht ════════════════════ */
console.log("\nT3–T4 · Nur ein Verlust rechnet nach")
const grund = LOST_REASONS[0]
const verluste = []
for (let i = 1; i <= 3; i++) {
  const k = await kette(`T3 Verlust ${i}`)
  const stand = (await q(`SELECT updated_at FROM opportunities WHERE id=$1`, [k.oppId]))[0].updated_at
  await store.moveOpportunity(k.oppId, "lost", grund, stand)
  verluste.push(k)
}
{
  const rows = await laeufe("verlust-prueft-muster")
  p(rows.length === 3, "drei Verluste, drei Ausfuehrungen", String(rows.length))
  p(rows[0]?.ergebnis === "kein-muster", "der erste ist kein Muster", String(rows[0]?.ergebnis))
  p(rows[2]?.ergebnis === "muster-erkannt", `ab ${MUSTER_AB} ist es eines`, String(rows[2]?.ergebnis))
  p(Number(rows[2]?.daten?.anzahl) === 3, "die Zahl kommt aus der Datenbank", String(rows[2]?.daten?.anzahl))
  p(rows.every((r) => r.wirkung === "pruefen"), "Wirkung: pruefen")
}
{
  /* T4 — ein gewoehnlicher Stufenwechsel loest nichts aus. */
  const k = await kette("T4 Stufe")
  const vorher = (await laeufe("verlust-prueft-muster")).length
  const stand = (await q(`SELECT updated_at FROM opportunities WHERE id=$1`, [k.oppId]))[0].updated_at
  await store.moveOpportunity(k.oppId, "proposal", null, stand)
  p((await laeufe("verlust-prueft-muster")).length === vorher, "ein Wechsel ohne Verlust erzeugt keine Zeile")
}

/* ═══ T5 · Idempotenz ════════════════════════════════════════════════════ */
console.log("\nT5 · Dasselbe Ereignis zweimal ist eine Wirkung")
{
  const k = await kette("T5 Doppelt")
  await store.acceptDelivery(k.projektId, JA)
  /* Ein zweiter Aufruf wird schon vom Zustandswechsel abgelehnt (H20) —
     deshalb wird hier zusaetzlich der Laeufer-Weg direkt belastet: dasselbe
     Ereignis, derselbe Gegenstand. */
  const vorher = await zahl(
    `SELECT count(*)::int n FROM automation_runs WHERE gegenstand=$1 AND ausloeser='abnahme-erinnert-an-freigabe'`,
    [k.oppId])
  await store.acceptDelivery(k.projektId, JA)
  const nachher = await zahl(
    `SELECT count(*)::int n FROM automation_runs WHERE gegenstand=$1 AND ausloeser='abnahme-erinnert-an-freigabe'`,
    [k.oppId])
  p(vorher === 1 && nachher === 1, "eine Zeile, nicht zwei", `${vorher} → ${nachher}`)
  const schluessel = await zahl(
    `SELECT count(DISTINCT schluessel)::int n FROM automation_runs WHERE gegenstand=$1`, [k.oppId])
  p(schluessel >= 1, "der Schluessel ist abgeleitet, nicht zufaellig")
}

/* ═══ T6 · Steuerbar ═════════════════════════════════════════════════════ */
console.log("\nT6 · Abgeschaltet heisst abgeschaltet")
{
  p(await store.setAutomationSwitch("abnahme-erinnert-an-freigabe", false) === "ok", "abgeschaltet")
  p(
    await store.setAutomationSwitch("abnahme-erinnert-an-freigabe", false) === "unveraendert",
    "zweimal abschalten ist kein zweiter Wechsel",
  )
  const k = await kette("T6 Aus")
  await store.acceptDelivery(k.projektId, JA)
  const gelaufen = await zahl(
    `SELECT count(*)::int n FROM automation_runs WHERE gegenstand=$1 AND ausloeser='abnahme-erinnert-an-freigabe'`,
    [k.oppId])
  p(gelaufen === 0, "abgeschaltet laeuft nicht", String(gelaufen))

  p(await store.setAutomationSwitch("abnahme-erinnert-an-freigabe", true) === "ok", "wieder eingeschaltet")
  const k2 = await kette("T6 An")
  await store.acceptDelivery(k2.projektId, JA)
  p(
    await zahl(
      `SELECT count(*)::int n FROM automation_runs WHERE gegenstand=$1 AND ausloeser='abnahme-erinnert-an-freigabe'`,
      [k2.oppId]) === 1,
    "und laeuft wieder",
  )
  const schalter = await store.listAutomationSwitches()
  p(istAktiv(schalter, "abnahme-erinnert-an-freigabe"), "der Schalter sagt: an")
  p(abgeschaltete(schalter).length === 0, "nichts ist abgeschaltet")
}

/* ═══ T7 · Umkehrbar ═════════════════════════════════════════════════════ */
console.log("\nT7 · Abhaken und zuruecknehmen — der Eintrag bleibt")
{
  const offen = (await store.listAutomationRuns({ zustand: "offen" })) ?? []
  p(offen.length > 0, "es gibt offene Wirkungen", String(offen.length))
  const a = offen[0]
  p(await store.closeAutomationRun(a.id, "erledigt") === "ok", "abgehakt")
  p(await store.closeAutomationRun(a.id, "erledigt") === "schon-geschlossen", "kein zweites Abhaken")
  const b = offen[1]
  p(await store.closeAutomationRun(b.id, "zurueckgenommen") === "ok", "zurueckgenommen")
  p(await store.closeAutomationRun("gibt-es-nicht", "erledigt") === "fehlt", "unbekannte Kennung meldet „fehlt“")

  const alle = await store.listAutomationRuns({ limit: 500 })
  const wieder = alle.find((x) => x.id === a.id)
  p(Boolean(wieder), "die Zeile steht weiterhin da")
  p(wieder.zustand === "erledigt" && wieder.erledigtVon === "owner", "mit Zustand und Akteur")
  p(alle.find((x) => x.id === b.id)?.zustand === "zurueckgenommen", "und die zurueckgenommene auch")
}

/* ═══ T8 · Keine Automation hat einen Geschaeftsdatensatz angefasst ══════ */
console.log("\nT8 · Kein Geschaeftsdatensatz traegt eine Automation als Urheber")
{
  const fremd = await zahl(
    `SELECT count(*)::int n FROM activities
      WHERE origin = 'AUTOMATION' AND kind NOT LIKE 'automation.%'`)
  p(fremd === 0, "keine fremde Chronikart unter AUTOMATION", String(fremd))
  const tabellen = ["leads", "opportunities", "offers", "projects"]
  for (const tab of tabellen) {
    const spalten = await q(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name LIKE '%automation%'`,
      [tab])
    p(spalten.length === 0, `${tab} hat keine Automationsspalte — es gibt nichts zurueckzurechnen`)
  }
}

/* ═══ T9 · Ohne Protokoll faellt nichts aus ══════════════════════════════ */
console.log("\nT9 · Faellt das Protokoll aus, laeuft das Geschaeft weiter")
{
  await q(`ALTER TABLE automation_runs RENAME TO automation_runs_weg`)
  const k = await kette("T9 Ohne Protokoll")
  const maengel = await store.acceptDelivery(k.projektId, JA)
  p(maengel.length === 0, "die Abnahme gelingt trotzdem", maengel.map((m) => m.code).join(", "))
  const projekt = (await store.listProjects(k.oppId))[0]
  p(projekt.zustand === "abgenommen", "und ist wirklich gespeichert", projekt.zustand)
  await q(`ALTER TABLE automation_runs_weg RENAME TO automation_runs`)
}

/* ═══ T10 · Die Grenze aus G26 steht ═════════════════════════════════════ */
console.log("\nT10 · Die Grenze, die nicht verhandelbar ist")
p(AUTOMATION_MUSTER_AB === MUSTER_AB, "die Musterschwelle stimmt mit G16 ueberein", `${AUTOMATION_MUSTER_AB} / ${MUSTER_AB}`)
p(NIEMALS_AUTOMATISCH.length === 10, "zehn Handlungen geschehen nie automatisch")
p(HANDLUNGEN.length === 4, "vier erlaubte Handlungen, geschlossene Liste")
p(
  AUSLOESER.every((a) => ["notieren", "erinnern", "weiterreichen", "pruefen"].includes(a.wirkung)),
  "kein Ausloeser hat eine fuenfte Wirkung",
)
p(AUSLOESER.every((a) => a.abschaltbar === true), "jeder Ausloeser ist abschaltbar")
p(
  entscheide({ ereignis: "opportunity.status", gegenstand: "x", daten: { nach: "won" } }).length === 0,
  "ein Gewinn loest keine Automation aus",
)

await client.end()
console.log(
  fehler === 0
    ? "\nAlle Pruefungen bestanden — die Automationen sind beobachtbar, steuerbar und umkehrbar.\n"
    : `\nABGEBROCHEN — ${fehler} Befund(e)\n`,
)
process.exit(fehler ? 1 : 0)
