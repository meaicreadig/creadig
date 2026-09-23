#!/usr/bin/env node
/**
 * ADM-07 · B11 — DIE AUSKUNFT, GEGEN ECHTE ZEILEN GEPRUEFT.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE ZWEI FEHLER, DIE EINE AUSKUNFT MACHEN KANN
 *
 *   1 · Sie laesst etwas weg. Dann ist sie falsch — und zwar schriftlich,
 *       auf Anfrage, mit Systemstimme.
 *   2 · Sie nimmt etwas mit, das einem anderen Menschen gehoert. Dann ist
 *       die Antwort auf eine Auskunft selbst eine Datenweitergabe.
 *
 * Beides laesst sich nur an echten Zeilen pruefen, nicht am Typ. Dieser
 * Probelauf legt deshalb ZWEI Personen in derselben Firma an, gibt beiden
 * Anfragen, Vorgaenge und Chronik — und haelt die Auskunft der einen gegen
 * die Daten der anderen.
 *
 *   T1 Vollstaendig: jede Anfrage, jeder Vorgang, jede Chronikzeile dieser Person
 *   T2 Kein fremder Datensatz — auch nicht aus derselben Firma
 *   T3 Freigaben nur, wo diese Person sie erteilt hat
 *   T4 Grenzen werden benannt (`nichtEnthalten`), nicht verschwiegen
 *   T5 Die Akte vermerkt die Auskunft — ohne ihren Inhalt
 *   T6 Unbekannte Kennung → keine Auskunft, kein Fehler
 *
 * Aufruf: AUSKUNFT_DRILL_URL=postgres://localhost/drill_auskunft npm run auskunft-drill
 */
import pg from "pg"

import { requireSafeTarget } from "./lib/env-guard.mjs"

const ZIEL = process.env.AUSKUNFT_DRILL_URL || "postgres://localhost/drill_auskunft"
requireSafeTarget(ZIEL, "Auskunfts-Probelauf")
process.env.LEAD_STORE = "pg-lokal"

const { SCHEMA, BACKFILL } = await import("@/lib/neon-client")
const { createNeonVertrieb } = await import("@/lib/vertrieb-store-neon")
const { auskunftFuerKontakt, AUSKUNFT_GRENZEN } = await import("@/lib/auskunft")

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

/* ── Zwei Menschen, eine Firma ─────────────────────────────────────────── */
const anlegen = async (name, telefon, schluessel) => {
  const { id } = await store.createEnquiry({
    idempotenz: schluessel,
    quelle: "telefon",
    sprache: "de",
    name,
    email: null,
    telefon,
    betrieb: "Auskunft Probe GmbH",
    nachricht: `Nachricht von ${name}`,
    verantwortlich: "owner",
  })
  const lead = await store.getEnquiry(id)
  return { leadId: id, kontaktId: lead.contactId, organisationId: lead.organisationId }
}

const eins = await anlegen("Ada Probe", "+49 441 111111", "auskunft-1")
const zwei = await anlegen("Bodo Fremd", "+49 441 222222", "auskunft-2")
p(Boolean(eins.kontaktId) && Boolean(zwei.kontaktId), "zwei Kontakte angelegt")
p(eins.organisationId === zwei.organisationId, "beide in derselben Firma — der schwierige Fall")

/* Beide bekommen einen Vorgang und eine Chronikzeile. */
const chance = await store.createOpportunity({
  title: "Ada Probe · Vorgang",
  organisationId: eins.organisationId,
  contactId: eins.kontaktId,
  source: "telefon",
  fromLeadId: eins.leadId,
})
await store.setLeadNextAction(eins.leadId, "Rückruf für Ada", "2030-01-01")
await store.createOpportunity({
  title: "Bodo Fremd · Vorgang",
  organisationId: zwei.organisationId,
  contactId: zwei.kontaktId,
  source: "telefon",
  fromLeadId: zwei.leadId,
})
await store.setLeadNextAction(zwei.leadId, "Rückruf für Bodo", "2030-01-01")

/* Eine Freigabe je Person — dieselbe Firma, zwei Erteilende. */
const freigabe = async (name) =>
  store.recordRelease({
    organisationId: eins.organisationId,
    name,
    role: "Leitung",
    company: "Auskunft Probe GmbH",
    form: "e-mail",
    grantedOn: "2026-09-01",
    scopes: ["name"],
    reference: `Postfach, Betreff Freigabe ${name}`,
  })
const f1 = await freigabe("Ada Probe").catch((e) => ({ fehler: String(e) }))
const f2 = await freigabe("Bodo Fremd").catch((e) => ({ fehler: String(e) }))

const auskunft = await auskunftFuerKontakt(store, eins.kontaktId)

console.log("\nT1 · Vollstaendig")
p(auskunft !== null, "es gibt eine Auskunft")
p(auskunft.person?.name === "Ada Probe", "die Person steht drin", String(auskunft.person?.name))
p(auskunft.anfragen.length === 1 && auskunft.anfragen[0].id === eins.leadId, "ihre Anfrage steht drin", `${auskunft.anfragen.length}`)
p(auskunft.vorgaenge.length === 1 && auskunft.vorgaenge[0].id === chance.id, "ihr Vorgang steht drin", `${auskunft.vorgaenge.length}`)
p(auskunft.chronik.length > 0, "die Chronik steht drin", `${auskunft.chronik.length} Zeile(n)`)
p(auskunft.chronik.every((z) => typeof z.zuOrt === "string" && z.zuOrt.includes(":")), "jede Chronikzeile sagt, wozu sie gehoert")
p(auskunft.organisation?.id === eins.organisationId, "die Organisation steht drin")
p(
  auskunft.bereiche.anfragen === auskunft.anfragen.length && auskunft.bereiche.chronik === auskunft.chronik.length,
  "die Umfangsangabe stimmt mit dem Inhalt ueberein",
)

console.log("\nT2 · Nichts von der anderen Person")
const roh = JSON.stringify(auskunft)
p(!roh.includes("Bodo Fremd"), "kein fremder Name")
p(!roh.includes("+49 441 222222"), "keine fremde Telefonnummer")
p(!roh.includes(zwei.leadId), "keine fremde Anfrage-Kennung")
p(!roh.includes("Rückruf für Bodo"), "kein fremder naechster Schritt")
p(roh.includes("Ada Probe") && roh.includes("+49 441 111111"), "die eigenen Daten dagegen schon")

console.log("\nT3 · Freigaben nur die eigenen")
if (f1?.fehler || f2?.fehler) {
  p(false, "Freigaben konnten nicht angelegt werden", String(f1?.fehler ?? f2?.fehler))
} else {
  p(auskunft.freigaben.length === 1, "genau eine Freigabe", `${auskunft.freigaben.length}`)
  p(auskunft.freigaben[0]?.by?.name === "Ada Probe", "und zwar ihre eigene")
}

console.log("\nT4 · Die Grenzen stehen dabei")
p(auskunft.nichtEnthalten.length === AUSKUNFT_GRENZEN.length, "die Auskunft nennt, was sie nicht enthaelt")
p(auskunft.nichtEnthalten.includes("aufbewahrung-unbekannt"), "darunter die unbekannte Aufbewahrungsfrist (Owner-Tatsache)")
p(/^\d{4}-\d{2}-\d{2}T/.test(auskunft.erstelltAm), "sie ist datiert", auskunft.erstelltAm)

console.log("\nT5 · Die Akte weiss davon — ohne den Inhalt")
await store.vermerkeAuskunft(eins.kontaktId, auskunft.bereiche)
const vermerke = (await store.activities("contact", eins.kontaktId)).filter((a) => a.kind === "auskunft.erteilt")
p(vermerke.length === 1, "genau ein Vermerk", `${vermerke.length}`)
p(vermerke[0]?.actor === "owner", "mit Akteur", String(vermerke[0]?.actor))
const vermerkRoh = JSON.stringify(vermerke[0] ?? {})
p(!vermerkRoh.includes("Ada Probe") && !vermerkRoh.includes("+49 441 111111"), "aber ohne Personendaten im Vermerk")
p(Boolean(vermerke[0]?.data?.bereiche), "dafuer mit dem Umfang", JSON.stringify(vermerke[0]?.data?.bereiche ?? {}))

console.log("\nT6 · Eine unbekannte Kennung")
p((await auskunftFuerKontakt(store, "gibt-es-nicht")) === null, "keine Auskunft, kein Fehler")

await client.end()
console.log(
  fehler === 0
    ? "\nAlle Pruefungen bestanden — die Auskunft ist vollstaendig und traegt nichts Fremdes.\n"
    : `\nABGEBROCHEN — ${fehler} Befund(e)\n`,
)
process.exit(fehler ? 1 : 0)
