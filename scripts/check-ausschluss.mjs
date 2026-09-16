#!/usr/bin/env node
/**
 * ADM-02 · H1 · AUSSCHLUSS- UND LESEPFAD-GATE
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS ES FESTHAELT
 *
 * Bis 16.09.2026 schrieb `neonClient().ready()` vor der ersten LESENDEN
 * Abfrage jedes Prozesses: Bestand einspielen (INSERT) und Abnahmedatensaetze
 * markieren (UPDATE auf vier Tabellen). Die Inbox zu oeffnen schrieb zusaetzlich
 * bei jedem Aufruf ~60 UPDATEs. Das verletzt den Admin-Vertrag
 * („READ MUST BE READ", `docs/admin-os/program.md`).
 *
 * Dieses Gate faellt, wenn
 *   1 · die Ausschlussregel anders entscheidet als ihre Faelle hier,
 *   2 · `ready()` wieder Daten schreibt,
 *   3 · ein Lesepfad wieder markiert,
 *   4 · der Schreibweg das Markieren verliert,
 *   5 · der explizite Wartungsweg (`db-migrate`) Bestand/Ausschluss verliert.
 *
 * Es verbindet sich mit keiner Datenbank. Die SQL-Fassung prueft `crm-drill`.
 *
 * Aufruf: `node --import ./scripts/lib/alias-hook.mjs scripts/check-ausschluss.mjs`
 */
import { readFileSync } from "node:fs"

import {
  AUSGESCHLOSSENE_MAIL_ENDUNG,
  AUSGESCHLOSSENE_NAMEN,
  AUSGESCHLOSSENE_REFERENZEN,
  exclusionReasonFor,
  isTestEnquiry,
} from "@/lib/vertrieb-bestand"
import { EXCLUSION_OTHER_CONTEXT, EXCLUSION_TESTDATA } from "@/lib/vertrieb"

let fehler = 0
const pruefe = (name, ok, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`)
  if (!ok) fehler++
}

console.log("\n1 · Regel")

const test = AUSGESCHLOSSENE_NAMEN.find((e) => e.reason === EXCLUSION_TESTDATA)
const kontext = AUSGESCHLOSSENE_NAMEN.find((e) => e.reason === EXCLUSION_OTHER_CONTEXT)

pruefe("exakter Name → Grund", exclusionReasonFor({ name: test.name }) === EXCLUSION_TESTDATA)
pruefe("Gross/Klein + Leerraum egal", exclusionReasonFor({ name: `  ${test.name.toUpperCase()} ` }) === EXCLUSION_TESTDATA)
pruefe("Betrieb zaehlt wie Name", exclusionReasonFor({ name: "Echter Mensch", business: test.name }) === EXCLUSION_TESTDATA)
pruefe("anderer Kontext behaelt seinen Grund", exclusionReasonFor({ name: kontext.name }) === EXCLUSION_OTHER_CONTEXT)
pruefe("Referenz → Testdaten", exclusionReasonFor({ name: "X", reference: AUSGESCHLOSSENE_REFERENZEN[0] }) === EXCLUSION_TESTDATA)
pruefe("reservierte Mail-Endung", exclusionReasonFor({ email: `a${AUSGESCHLOSSENE_MAIL_ENDUNG.toUpperCase()}` })?.startsWith("Abnahmedatensatz"))
pruefe("Prefix gate4", exclusionReasonFor({ business: "GATE4 irgendwas" }) === EXCLUSION_TESTDATA)
pruefe("Prefix v11 abnahme", exclusionReasonFor({ name: "V11 Abnahme XY" }) === EXCLUSION_TESTDATA)

/* Die Gegenrichtung ist die teure: ein echter Kunde, der aehnlich heisst. */
pruefe("KEIN unscharfer Treffer (Teilname)", exclusionReasonFor({ name: "Yilmaz Bau GmbH" }) === null)
pruefe("KEIN Treffer mitten im Namen", exclusionReasonFor({ name: "Bau gate4" }) === null)
pruefe("leere Mail ist kein Treffer", exclusionReasonFor({ name: "Echt", email: "" }) === null)
pruefe("echte Anfrage bleibt", exclusionReasonFor({ name: "Emine Kaya", business: "Kaya Dach", email: "e@kaya.de", reference: "CD-260916-aaaa" }) === null)

pruefe("isTestEnquiry: Organisationsname greift", isTestEnquiry({ name: "Echt", organisationName: test.name }))
pruefe("isTestEnquiry: gesetzter Grund greift", isTestEnquiry({ name: "Echt", excludedReason: "x" }))
pruefe("isTestEnquiry: echte Zeile bleibt", !isTestEnquiry({ name: "Echt", business: "Echt GmbH", email: "a@b.de" }))

console.log("\n2 · Lesepfad schreibt nicht")

const client = readFileSync("lib/neon-client.ts", "utf8")
const readyStart = client.indexOf("const ready = (): Promise<void> =>")
const readyEnd = client.indexOf("return promise", readyStart)
const readyCode = client
  .slice(readyStart, readyEnd)
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/[^\n]*/g, "")
pruefe("`ready()` gefunden", readyStart > 0 && readyEnd > readyStart)
pruefe("`ready()` ruft nur verifySchema", /verifySchema\(sql\)/.test(readyCode))
for (const verboten of ["seedBestand", "applyExclusions", "BACKFILL", "SCHEMA)", "INSERT", "UPDATE", "DELETE"]) {
  pruefe(`\`ready()\` enthaelt kein ${verboten}`, !readyCode.includes(verboten))
}

const store = readFileSync("lib/vertrieb-store-neon.ts", "utf8")
pruefe("kein `refreshExclusions` im Vertriebsspeicher", !store.includes("refreshExclusions("))
pruefe("kein `refreshExclusions` im Client", !client.includes("refreshExclusions"))

console.log("\n3 · Schreibweg markiert")

const leadStore = readFileSync("lib/lead-store-neon.ts", "utf8")
pruefe("Anfrage speichern ruft markLeadExclusions", /await markLeadExclusions\(sql, record\)/.test(leadStore))
pruefe(
  "Chance erbt Ausschluss von Anfrage, Organisation UND Kontakt",
  /SELECT l\.excluded_reason FROM leads l[\s\S]{0,200}SELECT org\.excluded_reason FROM organisations[\s\S]{0,200}SELECT c\.excluded_reason FROM contacts/.test(store),
)

console.log("\n4 · Wartung ist explizit")

const migrate = readFileSync("scripts/db-migrate.mjs", "utf8")
pruefe("db-migrate spielt Bestand ein", /await seedBestand\(sql\)/.test(migrate))
pruefe("db-migrate wendet Ausschluesse an", /await applyExclusions\(sql\)/.test(migrate))
pruefe("--check aendert nichts (Abbruch vor dem Anwenden)", migrate.indexOf("if (nurPruefen)") < migrate.indexOf("await seedBestand(sql)"))

console.log(fehler ? `\n✗ ${fehler} Befund(e)\n` : "\n✓ Ausschluss- und Lesepfad-Gate gruen\n")
process.exit(fehler ? 1 : 0)
