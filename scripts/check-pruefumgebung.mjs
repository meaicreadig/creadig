#!/usr/bin/env node
/**
 * ADM-03 · PRUEFUMGEBUNGS-GATE — kein Pruefskript darf versehentlich Produktion erreichen.
 *
 * Gemessen 17.09.2026: `.env.local` (aus `vercel env pull`) enthaelt eine
 * echte `DATABASE_URL`. `next start` laedt sie — und Next fuellt dabei auch
 * Variablen, die LEER gesetzt sind. `DATABASE_URL: ""` in einem Pruefskript
 * ist deshalb keine Sperre, sondern eine Einladung.
 *
 * Regel fuer jedes Skript, das `next start` startet:
 *   · `LEAD_STORE` ist gesetzt und NICHT leer und NICHT `neon` mit echter Adresse
 *   · `DATABASE_URL` ist NICHT leer (lokal, `.invalid` oder ein toter Port)
 */
import { readFileSync, readdirSync } from "node:fs"

let fehler = 0
const skripte = readdirSync("scripts").filter((f) => f.endsWith(".mjs")).map((f) => `scripts/${f}`)
for (const f of skripte) {
  const q = readFileSync(f, "utf8")
  if (!/\["next",\s*"start"/.test(q) || f.endsWith("check-pruefumgebung.mjs")) continue
  const leer = /(LEAD_STORE|DATABASE_URL):\s*""/.test(q)
  const neonEcht = /LEAD_STORE:\s*"neon"/.test(q) && !/DATABASE_URL:\s*"postgres(ql)?:\/\/[^"]*(127\.0\.0\.1:9|\.invalid|localhost)/.test(q)
  const setztBeide = /LEAD_STORE:/.test(q) && /DATABASE_URL:/.test(q)
  const ok = !leer && !neonEcht && setztBeide
  if (!ok) {
    fehler++
    console.log(`  ✗ ${f}${leer ? " — leere Variable (wird aus .env.local gefuellt)" : ""}${neonEcht ? " — neon ohne lokale/tote Adresse" : ""}${!setztBeide ? " — setzt LEAD_STORE/DATABASE_URL nicht selbst" : ""}`)
  }
}
console.log(fehler ? `\n✗ ${fehler} Pruefskript(e) koennten eine echte Datenbank erreichen\n` : "\n✓ Pruefumgebungs-Gate gruen\n")
process.exit(fehler ? 1 : 0)
