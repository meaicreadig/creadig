#!/usr/bin/env node
/**
 * G36 · SCHEMASTAND-GATE — die Laufzeit und die Migrationen beschreiben
 * dieselbe Datenbank, oder der Bau faellt.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM ES DIESES GATE GIBT
 *
 * In diesem System steht die Form der Datenbank an ZWEI Stellen:
 *
 *   `lib/neon-client.ts` → `SCHEMA[]`   was die Laufzeit fuer wahr haelt
 *   `scripts/migrations/*.sql`          was in der Produktion tatsaechlich
 *                                       ausgefuehrt wurde
 *
 * Das ist kein Versehen, sondern Absicht: Seit dem Unfall vom 06.09.2026 —
 * Migration 007 erreichte ungefragt die Produktion — migriert die Laufzeit
 * NICHT mehr. `ready()` prueft nur noch. Genau daraus folgt aber eine neue,
 * leisere Gefahr: Wenn die Laufzeit nicht mehr migriert, kann sie die beiden
 * Staende auch nicht mehr angleichen. Sie laufen auseinander, und niemand
 * merkt es — bis eine Abfrage in der Produktion auf eine Spalte trifft, die
 * es dort nie gab.
 *
 * Der Unterschied zwischen den beiden Richtungen ist wichtig:
 *
 *   SCHEMA kennt etwas, das keine Migration anlegt
 *     → In der Produktion FEHLT die Form. Die Laufzeit erwartet sie
 *       trotzdem. Das ist der Fehler, der als „funktioniert lokal" beginnt.
 *
 *   Eine Migration legt etwas an, das SCHEMA nicht kennt
 *     → Die Form ist da, aber `verifySchema()` prueft sie nicht. Ein stiller
 *       blinder Fleck: Niemand merkt, wenn sie fehlt.
 *
 * Beides ist ein Befund, keine Geschmacksfrage.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS DAS GATE NICHT TUT
 *
 * Es verbindet sich mit KEINER Datenbank. Es liest zwei Dateien im
 * Repository und vergleicht sie. Was in der Produktion wirklich steht, weiss
 * dieses Gate nicht und behauptet es auch nicht — dafuer gibt es
 * `verifySchema()` gegen eine echte Verbindung. Hier geht es ausschliesslich
 * darum, dass die beiden QUELLEN im Repository dasselbe sagen.
 *
 * Es vergleicht nur DDL (CREATE TABLE, CREATE INDEX, ALTER TABLE). Backfills,
 * INSERTs und die READBACK-Dateien sind Daten- und Pruefskripte, keine Form.
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

import { SCHEMA } from "@/lib/neon-client"

/* ── Normalisieren ────────────────────────────────────────────────────────
   Zwei Anweisungen sind dieselbe Anweisung, wenn sie nach dem Entfernen von
   Kommentaren, Zeilenumbruechen, Mehrfach-Leerzeichen und dem abschliessenden
   Semikolon gleich lauten. Gross-/Kleinschreibung wird angeglichen, weil sie
   in SQL nichts bedeutet — ein `text` und ein `TEXT` sind dieselbe Spalte. */
const ohneKommentar = (sql) => sql.replace(/--[^\n]*/g, " ")

const normalisiere = (stmt) =>
  ohneKommentar(stmt)
    .replace(/\s+/g, " ")
    .replace(/\s*([(),])\s*/g, "$1")
    .replace(/;\s*$/, "")
    .trim()
    .toLowerCase()

const istDDL = (s) => /^(create table|create index|create unique index|alter table)\b/.test(s)

/* ── Die beiden Staende einlesen ──────────────────────────────────────── */
const ausLaufzeit = new Map()
for (const stmt of SCHEMA) {
  const n = normalisiere(stmt)
  if (!istDDL(n)) continue
  ausLaufzeit.set(n, (ausLaufzeit.get(n) ?? 0) + 1)
}

const MIGRATIONEN = join(process.cwd(), "scripts", "migrations")
const ausMigration = new Map()
const herkunft = new Map()

for (const datei of readdirSync(MIGRATIONEN).filter((f) => f.endsWith(".sql")).sort()) {
  const roh = readFileSync(join(MIGRATIONEN, datei), "utf8")
  for (const teil of ohneKommentar(roh).split(";")) {
    const n = normalisiere(teil)
    if (!n || !istDDL(n)) continue
    ausMigration.set(n, (ausMigration.get(n) ?? 0) + 1)
    if (!herkunft.has(n)) herkunft.set(n, datei)
  }
}

/* ── Vergleichen ──────────────────────────────────────────────────────────
   Der haeufigste Fall ist nicht „Tabelle fehlt ganz", sondern „eine Spalte
   ist dazugekommen". Dann steht DIESELBE Tabelle auf beiden Seiten, und zwei
   abgeschnittene Zeilen mit identischem Anfang helfen niemandem. Deshalb
   sucht das Gate zuerst die Paare und nennt den Unterschied als Spalte. */
const kurz = (s) => (s.length > 110 ? `${s.slice(0, 107)}…` : s)

/** `create table if not exists foo(a text,b text)` → `foo` */
const gegenstand = (n) => {
  const m = n.match(/^(?:create table if not exists|create unique index if not exists|create index if not exists|alter table)\s+([a-z0-9_]+)/)
  return m ? m[1] : null
}
const art = (n) => (n.startsWith("create table") ? "tabelle" : n.startsWith("alter table") ? "alter" : "index")

/** Spaltenliste aus einem CREATE TABLE, grob aber ausreichend: der Inhalt der
    aeussersten Klammer, an Kommas der obersten Ebene getrennt. */
const spalten = (n) => {
  const auf = n.indexOf("(")
  if (auf < 0) return []
  let tiefe = 0
  const teile = []
  let akku = ""
  for (const z of n.slice(auf)) {
    if (z === "(") { tiefe++; if (tiefe === 1) continue }
    if (z === ")") { tiefe--; if (tiefe === 0) break }
    if (z === "," && tiefe === 1) { teile.push(akku.trim()); akku = ""; continue }
    akku += z
  }
  if (akku.trim()) teile.push(akku.trim())
  return teile
}

const nurLaufzeit = [...ausLaufzeit.keys()].filter((n) => !ausMigration.has(n))
const nurMigration = [...ausMigration.keys()].filter((n) => !ausLaufzeit.has(n))

const probleme = []
const erledigt = new Set()

/* 1 · Paare: dieselbe Tabelle, andere Spalten. */
for (const l of nurLaufzeit) {
  const g = gegenstand(l)
  const partner = nurMigration.find((m) => gegenstand(m) === g && art(m) === art(l) && !erledigt.has(m))
  if (!g || !partner) continue
  erledigt.add(l)
  erledigt.add(partner)

  const sL = spalten(l)
  const sM = spalten(partner)
  const nurL = sL.filter((x) => !sM.includes(x))
  const nurM = sM.filter((x) => !sL.includes(x))

  const zeilen = [
    `\`${g}\` steht in beiden Quellen — aber nicht gleich.`,
    `      Migration: scripts/migrations/${herkunft.get(partner)}`,
  ]
  for (const x of nurL) zeilen.push(`      nur in der Laufzeit:  ${x}`)
  for (const x of nurM) zeilen.push(`      nur in der Migration: ${x}`)
  if (nurL.length === 0 && nurM.length === 0)
    zeilen.push(`      Die Spalten sind gleich; der Unterschied liegt ausserhalb der Klammer.`)
  zeilen.push(
    "      Eine Spalte, die nur die Laufzeit kennt, fehlt in der Produktion.",
    "      Eine Spalte, die nur die Migration kennt, wird nie geprueft.",
  )
  probleme.push(zeilen.join("\n"))
}

/* 2 · Was ganz fehlt. */
for (const n of nurLaufzeit.filter((x) => !erledigt.has(x)))
  probleme.push(
    `Die Laufzeit kennt eine Form, die KEINE Migration anlegt:\n      ${kurz(n)}\n` +
      "      In der Produktion fehlt sie damit. Eine Migration muss sie anlegen —\n" +
      "      oder sie gehoert nicht in `SCHEMA`.",
  )

for (const n of nurMigration.filter((x) => !erledigt.has(x)))
  probleme.push(
    `Eine Migration legt eine Form an, die die Laufzeit NICHT kennt:\n      ${kurz(n)}\n` +
      `      Quelle: scripts/migrations/${herkunft.get(n)}\n` +
      "      `verifySchema()` prueft sie deshalb nie. Faellt sie aus, merkt es niemand.",
  )

/* ── Ausgabe ──────────────────────────────────────────────────────────── */
const tabellen = [...ausLaufzeit.keys()].filter((n) => n.startsWith("create table")).length

console.log(
  `\nSchemastand-Gate — ${ausLaufzeit.size} DDL-Anweisungen in der Laufzeit, ` +
    `${ausMigration.size} in ${readdirSync(MIGRATIONEN).filter((f) => f.endsWith(".sql")).length} ` +
    `Migrationsdateien, ${tabellen} Tabellen`,
)

if (probleme.length > 0) {
  console.error(
    "\nSchemastand-Gate: die Laufzeit und die Produktion beschreiben nicht mehr dieselbe Datenbank.\n",
  )
  for (const p of probleme) console.error(`  ${p}\n`)
  console.error(
    "Seit dem 06.09.2026 migriert die Laufzeit nicht mehr — sie kann den Unterschied also\n" +
      "auch nicht mehr selbst ausgleichen. Er bleibt stehen, bis ihn jemand aufloest.\n",
  )
  process.exit(1)
}

console.log(
  "OK — jede Form der Laufzeit hat ihre Migration, und jede Migration ist geprueft.\n" +
    "Das heisst NICHT, dass die Produktion auf diesem Stand ist — das beantwortet nur\n" +
    "`verifySchema()` gegen eine echte Verbindung.\n",
)
