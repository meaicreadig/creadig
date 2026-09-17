#!/usr/bin/env node
/**
 * ADM-03 · KERNSCHLEIFEN-PROBELAUF — derselbe Store-Code wie in Produktion,
 * gegen eine WEGWERF-Postgres (`LEAD_STORE=pg-lokal`, `lib/neon-client.ts`).
 *
 *   K1 A03  manuelle Anfrage — idempotent (zweimal, zehnmal gleichzeitig = eine)
 *   K2 A03  Anfrage OHNE Mail erscheint in der Inbox (vorher: NULL-Filter)
 *   K3 A07  Verantwortlicher + nächster Schritt an der Anfrage, mit Chronik
 *   K4 A06  Dublettenkandidaten; als Dublette archivieren — nichts verschmolzen
 *   K5 A08  zehnmal gleichzeitig „Chance anlegen“ = EINE Chance, EIN Chronikeintrag
 *   K6 A09  Stufenwechsel: Historie { von, nach }; veralteter Stand = Konflikt, nichts überschrieben
 *   K7 A10  Verlust mit Grund
 *   K8      Chronik trägt Akteur + Herkunft; alte Zeilen bleiben unbekannt
 *
 * Aufruf: KERNSCHLEIFE_DRILL_URL=postgres://localhost/drill_kernschleife npm run kernschleife-drill
 */
import pg from "pg"

import { requireSafeTarget } from "./lib/env-guard.mjs"

const ZIEL = process.env.KERNSCHLEIFE_DRILL_URL || "postgres://localhost/drill_kernschleife"
requireSafeTarget(ZIEL, "Kernschleifen-Probelauf")
process.env.LEAD_STORE = "pg-lokal"

const { SCHEMA, BACKFILL, seedBestand, applyExclusions } = await import("../lib/neon-client.ts")
const { createNeonVertrieb } = await import("../lib/vertrieb-store-neon.ts")

let fehler = 0
const p = (ok, name, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

const client = new pg.Client({ connectionString: ZIEL })
await client.connect()
const q = async (t, params) => (await client.query(t, params ?? [])).rows
const shim = { query: q }
for (const stmt of SCHEMA) await q(stmt)
for (const stmt of BACKFILL) await q(stmt)
await seedBestand(shim)
await applyExclusions(shim)

const owner = createNeonVertrieb(ZIEL, { kennung: "owner", herkunft: "HUMAN" })
const vertrieb = createNeonVertrieb(ZIEL, { kennung: "vertrieb", herkunft: "HUMAN" })
const eingabe = (x = {}) => ({
  idempotenz: crypto.randomUUID(), quelle: "telefon", sprache: "tr", name: "Emine Kaya",
  email: null, telefon: "+49 441 123456", betrieb: "Kaya Dach Probe", nachricht: "Rückruf wegen Website",
  verantwortlich: "owner", ...x,
})

console.log("\nK1 · Manuelle Anfrage, idempotent")
const e1 = eingabe()
const a = await owner.createEnquiry(e1)
const b = await owner.createEnquiry(e1)
p(a.neu && !b.neu && a.id === b.id, "zweites Absenden = dieselbe Anfrage")
const e2 = eingabe({ name: "Parallel Probe", betrieb: "Parallel Probe GmbH", telefon: "+49 441 999000" })
const parallel = await Promise.all(Array.from({ length: 10 }, () => createNeonVertrieb(ZIEL, { kennung: "owner", herkunft: "HUMAN" }).createEnquiry(e2)))
const ids = new Set(parallel.map((r) => r.id))
p(ids.size === 1 && parallel.filter((r) => r.neu).length === 1, "zehnmal gleichzeitig = eine Anfrage", `${ids.size} Kennung(en), ${parallel.filter((r) => r.neu).length} neu`)
p(Number((await q(`SELECT count(*) n FROM leads WHERE submission_key = $1`, [`manuell:${e2.idempotenz}`]))[0].n) === 1, "genau eine Zeile in der Datenbank")

console.log("\nK2 · Ohne Mail sichtbar")
const inbox = await owner.listEnquiries({ limit: 200 })
const gefunden = inbox.rows.find((r) => r.id === a.id)
p(Boolean(gefunden), "Anfrage ohne Mail steht in der Inbox")
p(gefunden?.email === null && gefunden?.phone === "+49 441 123456", "Mail leer, Telefon da")
p(gefunden?.responsible === "owner" && gefunden?.source === "telefon", "Verantwortlich und Quelle gespeichert")
p(Boolean(gefunden?.contactId) && Boolean(gefunden?.organisationId), "Kontakt und Organisation verknüpft")

console.log("\nK3 · Verantwortlich + nächster Schritt")
p(await vertrieb.setLeadResponsible(a.id, "vertrieb"), "Verantwortlich auf Vertrieb")
p(await vertrieb.setLeadNextAction(a.id, "Zurückrufen", "2026-09-18"), "nächster Schritt mit Datum")
const a2 = await owner.getEnquiry(a.id)
p(a2.responsible === "vertrieb" && a2.nextAction === "Zurückrufen" && a2.nextActionAt === "2026-09-18", "nach Neuladen persistent", `${a2.responsible} · ${a2.nextAction} · ${a2.nextActionAt}`)

const faellig = await owner.listEnquiries({ faellig: true, limit: 50 })
p(!faellig.rows.some((r) => r.id === a.id), "Schritt morgen: noch nicht fällig")
await vertrieb.setLeadNextAction(a.id, "Zurückrufen", "2020-01-01")
const faellig2 = await owner.listEnquiries({ faellig: true, limit: 50 })
p(faellig2.rows.some((r) => r.id === a.id), "Schritt in der Vergangenheit: fällig (Übersicht zeigt ihn)")
const sum = await owner.summary()
p(sum.enquiriesOverdue >= 1, "Zählung überfälliger Anfragen", String(sum.enquiriesOverdue))

console.log("\nK3b · Organisation ausdrücklich zuordnen (A04)")
const zielOrg = (await q(`SELECT id, name FROM organisations WHERE excluded_reason IS NULL AND import_key IS NOT NULL ORDER BY name LIMIT 1`))[0]
p(await owner.setLeadOrganisation(a.id, zielOrg.id), `zugeordnet: ${zielOrg.name}`)
p((await owner.getEnquiry(a.id)).organisationId === zielOrg.id, "nach Neuladen persistent")
p(!(await owner.setLeadOrganisation(a.id, "gibt-es-nicht")), "unbekannte Organisation abgelehnt")
p((await owner.getEnquiry(a.id)).organisationId === zielOrg.id, "und nichts verändert")

console.log("\nK4 · Dubletten")
const doppel = await owner.createEnquiry(eingabe({ name: "Emine Kaya", betrieb: "Kaya Dach Probe", nachricht: "zweiter Anruf" }))
const kandidaten = await owner.possibleDuplicates(doppel.id)
p(kandidaten.some((k) => k.art === "anfrage" && k.id === a.id), "erste Anfrage als Kandidat erkannt", kandidaten.map((k) => `${k.art}:${k.grund}`).join(", "))
p(kandidaten.find((k) => k.id === a.id)?.grund === "gleiches-telefon", "Grund: gleiches Telefon")
p(!(await owner.archiveLead(doppel.id, "dublette", null)), "Dublette ohne Bezug wird abgelehnt")
p(!(await owner.archiveLead(doppel.id, "dublette", doppel.id)), "Dublette von sich selbst wird abgelehnt")
p(await owner.archiveLead(doppel.id, "dublette", a.id), "als Dublette archiviert")
const d2 = await owner.getEnquiry(doppel.id)
p(d2.handlingStatus === "archiviert" && d2.archiveReason === "dublette" && d2.duplicateOf === a.id, "Grund und Bezug gespeichert")
p((await owner.getEnquiry(a.id)) !== null && Number((await q(`SELECT count(*) n FROM leads WHERE id IN ($1,$2)`, [a.id, doppel.id]))[0].n) === 2, "beide Anfragen existieren weiter (nichts verschmolzen)")

console.log("\nK5 · Chance anlegen, zehnmal gleichzeitig")
const quelle = await owner.getEnquiry(a.id)
const chancen = await Promise.all(Array.from({ length: 10 }, () =>
  createNeonVertrieb(ZIEL, { kennung: "owner", herkunft: "HUMAN" }).createOpportunity({
    title: "Kaya Dach — Website", organisationId: quelle.organisationId, contactId: quelle.contactId, source: quelle.source, fromLeadId: quelle.id,
  })))
p(new Set(chancen.map((c) => c.id)).size === 1, "eine Chance", `${new Set(chancen.map((c) => c.id)).size} Kennung(en)`)
p(Number((await q(`SELECT count(*) n FROM opportunities WHERE from_lead_id = $1`, [a.id]))[0].n) === 1, "eine Zeile")
p(Number((await q(`SELECT count(*) n FROM activities WHERE subject_id = $1 AND kind = 'opportunity.created'`, [chancen[0].id]))[0].n) === 1, "ein Chronikeintrag „angelegt“")

console.log("\nK6 · Stufenwechsel, Historie, Konflikt")
const chance = await owner.getOpportunity(chancen[0].id)
p((await owner.moveOpportunity(chance.id, "qualified", null, chance.updatedAt)) === "ok", "neu → qualifiziert")
p((await vertrieb.moveOpportunity(chance.id, "proposal", null, chance.updatedAt)) === "konflikt", "zweite Änderung mit veraltetem Stand = Konflikt")
const nachKonflikt = await owner.getOpportunity(chance.id)
p(nachKonflikt.status === "qualified", "nichts überschrieben", nachKonflikt.status)
p((await vertrieb.moveOpportunity(chance.id, "proposal", null, nachKonflikt.updatedAt)) === "ok", "mit aktuellem Stand: qualifiziert → Angebot")
p((await owner.moveOpportunity("gibt-es-nicht", "won", null, nachKonflikt.updatedAt)) === "fehlt", "unbekannte Kennung = fehlt")
const hist = (await owner.activities("opportunity", chance.id)).filter((x) => x.kind === "opportunity.status").map((x) => x.data)
p(hist.some((d) => d?.von === "new" && d?.nach === "qualified") && hist.some((d) => d?.von === "qualified" && d?.nach === "proposal"), "Historie mit von/nach", JSON.stringify(hist))

console.log("\nK7 · Verlust mit Grund")
const vorVerlust = await owner.getOpportunity(chance.id)
p((await owner.moveOpportunity(chance.id, "lost", "preis", vorVerlust.updatedAt)) === "ok", "verloren")
const verloren = await owner.getOpportunity(chance.id)
p(verloren.status === "lost" && verloren.lostReason === "preis", "Grund gespeichert")
const verlustEintrag = (await owner.activities("opportunity", chance.id)).find((x) => x.kind === "opportunity.lost")
p(verlustEintrag?.data?.grund === "preis" && verlustEintrag?.data?.von === "proposal", "Chronik: von Angebot, Grund preis")

console.log("\nK8 · Akteur und Herkunft")
const chronik = await owner.activities("lead", a.id)
p(chronik.find((x) => x.kind === "lead.responsible")?.actor === "vertrieb", "Verantwortlich-Wechsel: Akteur vertrieb")
p(chronik.every((x) => x.origin === "HUMAN"), "alle Einträge dieser Anfrage: HUMAN", chronik.map((x) => `${x.kind}:${x.origin}`).join(" "))
await q(`INSERT INTO activities (id, subject_type, subject_id, kind, summary, created_at) VALUES ('alt-1','lead',$1,'lead.handling','Altbestand', now() - interval '1 day')`, [a.id])
const alt = (await owner.activities("lead", a.id)).find((x) => x.id === "alt-1")
p(alt?.actor === null && alt?.origin === null, "Zeile vor 017: Akteur und Herkunft unbekannt, nicht erfunden")

await client.end()
console.log(fehler === 0 ? "\nAlle Pruefungen bestanden — die Kernschleife haelt.\n" : `\n${fehler} Pruefung(en) fehlgeschlagen.\n`)
process.exit(fehler === 0 ? 0 : 1)
