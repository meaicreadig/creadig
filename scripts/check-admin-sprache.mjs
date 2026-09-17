#!/usr/bin/env node
/**
 * ADM-01 · ADMIN-SPRACH-GATE — DE/TR-Paritaet und ehrlicher Uebersetzungsstand.
 *
 * 1 · Paritaet: jeder Schluessel in DE hat TR, gleiche Form, Funktionen gleiche
 *     Stelligkeit, kein leerer String. (Der Typ erzwingt die Form schon; hier
 *     faellt zusaetzlich ein leerer oder unveraendert kopierter Text auf.)
 * 2 · Stand: zaehlt je Admin-Datei sichtbaren deutschen Text im JSX, der NICHT
 *     aus dem Woerterbuch kommt. Dateien in MIGRIERT muessen bei 0 bleiben —
 *     ein Rueckfall laesst das Gate fallen. Alle anderen werden als offene
 *     Arbeit GEZAEHLT und ausgegeben, nicht versteckt.
 *
 * Aufruf: node --import ./scripts/lib/alias-hook.mjs scripts/check-admin-sprache.mjs
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

import { de } from "@/lib/admin-i18n/de"
import { tr } from "@/lib/admin-i18n/tr"

let fehler = 0
const pruefe = (name, ok, detail = "") => {
  if (!ok || process.argv.includes("--alle")) console.log(`  ${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`)
  if (!ok) fehler++
}

console.log("\n1 · Paritaet DE ↔ TR")
let schluessel = 0
const gleich = []
const lauf = (a, b, pfad) => {
  for (const k of Object.keys(a)) {
    const p = `${pfad}.${k}`
    if (!(k in b)) { pruefe(`${p} fehlt in TR`, false); continue }
    if (typeof a[k] === "object") { lauf(a[k], b[k], p); continue }
    schluessel++
    if (typeof a[k] !== typeof b[k]) pruefe(`${p} gleiche Art`, false)
    else if (typeof a[k] === "function") {
      pruefe(`${p} gleiche Stelligkeit`, a[k].length === b[k].length)
      const probe = Array.from({ length: a[k].length }, (_, i) => `X${i}`)
      pruefe(`${p} TR nicht leer`, String(b[k](...probe)).trim().length > 0)
    } else {
      pruefe(`${p} TR nicht leer`, b[k].trim().length > 0)
      if (a[k] === b[k] && a[k].length > 3 && !["DE", "TR"].includes(a[k])) gleich.push(p)
    }
  }
  for (const k of Object.keys(b)) if (!(k in a)) pruefe(`${pfad}.${k} nur in TR`, false)
}
lauf(de, tr, "t")
console.log(`  ${schluessel} Texte geprueft${gleich.length ? ` · identisch in DE und TR (pruefen): ${gleich.join(", ")}` : ""}`)

console.log("\n2 · Uebersetzungsstand der Admin-Oberflaeche")
const MIGRIERT = new Set([
  "components/admin/admin-shell.tsx",
  "components/admin/admin-nav.tsx",
  "components/admin/admin-logout.tsx",
  "components/admin/admin-login-form.tsx",
  "components/admin/sprach-umschalter.tsx",
  "components/admin/speicher-hinweis.tsx",
  "components/admin/vertrieb-shell.tsx",
  "components/admin/kunden-shell.tsx",
  "app/(admin)/admin/login/page.tsx",
  "app/(admin)/admin/not-found.tsx",
  "app/(admin)/admin/page.tsx",
  "app/(admin)/admin/cockpit/page.tsx",
  "app/(admin)/admin/vertrieb/anfragen/page.tsx",
  "app/(admin)/admin/vertrieb/anfragen/[id]/page.tsx",
  "app/(admin)/admin/vertrieb/anfragen/neu/page.tsx",
  "components/admin/anfrage-erfassen-formular.tsx",
  "components/admin/activity-log.tsx",
  "app/(admin)/admin/vertrieb/pipeline/[id]/page.tsx",
  "components/admin/angebot-mappe.tsx",
  "components/admin/lieferung-mappe.tsx",
  "app/(admin)/admin/vertrieb/pipeline/page.tsx",
  "app/(admin)/admin/vertrieb/verlust/page.tsx",
  "app/(admin)/admin/vertrieb/page.tsx",
  "app/(admin)/admin/kunden/page.tsx",
  "app/(admin)/admin/vertrieb/beziehungen/page.tsx",
  "app/(admin)/admin/vertrieb/recherche/page.tsx",
  "app/(admin)/admin/vertrieb/recherche/[id]/page.tsx",
  "app/(admin)/admin/kunden/[id]/page.tsx",
  "app/(admin)/admin/vertrieb/beziehungen/[id]/page.tsx",
  "app/(admin)/admin/beleg/page.tsx",
  "app/(admin)/error.tsx",
  "app/(admin)/admin/material/page.tsx",
  "components/admin/lage-register.tsx",
  "components/admin/primitives.tsx",
  "app/(admin)/admin/verbindungen/page.tsx",
  "components/admin/verbindung-knopf.tsx",
  "components/admin/freigabe-formular.tsx",
  "app/(admin)/admin/automationen/page.tsx",
])
const dateien = ["components/admin", "app/(admin)"]
  .flatMap((d) => readdirSync(d, { recursive: true }).map((f) => join(d, String(f))))
  .filter((f) => f.endsWith(".tsx"))
  .sort()

/* Sichtbarer Text: JSX-Textknoten und die Props, die Menschen lesen. */
const DEUTSCH = /[äöüÄÖÜß]|\b(und|oder|nicht|keine?|der|die|das|mit|für|noch|wird|ist|sind|Anfrage|Kunde|Vorgang|Speichern|Anlegen|Zurück)\b/
function sichtbareDeutscheTexte(quelle) {
  const code = quelle.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/[^\n]*/g, "$1").replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
  const treffer = []
  for (const m of code.matchAll(/>([^<>{}]*[A-Za-zÄÖÜäöüß][^<>{}]*)</g)) {
    const t = m[1].trim()
    if (t && DEUTSCH.test(t)) treffer.push(t)
  }
  for (const m of code.matchAll(/\b(?:title|lead|label|hint|placeholder|aria-label|alt)=\"([^\"]+)\"/g)) {
    if (DEUTSCH.test(m[1])) treffer.push(m[1])
  }
  return treffer
}

let offen = 0
let offeneDateien = 0
const zeilen = []
for (const f of dateien) {
  const n = sichtbareDeutscheTexte(readFileSync(f, "utf8")).length
  if (MIGRIERT.has(f)) pruefe(`${f} migriert und bleibt ohne festen deutschen Text`, n === 0, `${n}`)
  else if (n > 0) { offen += n; offeneDateien++; zeilen.push([n, f]) }
}
if (process.argv.includes("--offen")) for (const [n, f] of zeilen.sort((a, b) => b[0] - a[0])) console.log(`     ${String(n).padStart(4)}  ${f}`)
console.log(`  migriert: ${MIGRIERT.size} Dateien · offen: ${offeneDateien} Dateien, ${offen} Textstellen (Liste: --offen)`)

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · WAS DER SERVER SCHICKT (ADM-05 · H21)
 *
 * Abschnitt 2 zaehlt sichtbaren deutschen Text im JSX. Genau daran ist das
 * Gate am 17.09.2026 vorbeigelaufen: Die Befunde der Angebots- und
 * Lieferkette entstanden als deutsche SAETZE im Server und kamen ueber eine
 * Server Action in die Oberflaeche — auch in die tuerkische. Kein JSX, keine
 * Zeile, kein Befund.
 *
 * Jetzt sind es Maschinenwerte, und hier wird geprueft, dass jeder von ihnen
 * in BEIDEN Sprachen einen Satz hat. Ein neuer Code ohne Text faellt damit
 * beim Bauen auf und nicht beim Kunden.
 * ═══════════════════════════════════════════════════════════════════════════ */
console.log("\n3 · Maschinenwerte aus dem Server haben in beiden Sprachen einen Text")
const { BEFUND_CODES, ABSCHNITTE } = await import("@/lib/angebot")
const { MANGEL_CODES, UEBERGABE_STUECKE, PROJEKT_ZUSTAENDE } = await import("@/lib/lieferung")
const { OFFERS } = await import("@/lib/offer-readiness")
const { HYPOTHESES } = await import("@/lib/market")

const belege = [...new Set(Object.values(OFFERS).flatMap((o) => o.evidence.map((e) => e.key)))]
const pflichtabschnitte = ABSCHNITTE.filter((a) => a.pflicht).map((a) => a.key)

const gruppen = [
  ["code", [...BEFUND_CODES, ...MANGEL_CODES]],
  ["reife", belege],
  ["abschnittRegel", pflichtabschnitte],
  ["uebergabestueck", UEBERGABE_STUECKE.map((u) => u.key)],
  ["projektzustand", Object.keys(PROJEKT_ZUSTAENDE)],
]
for (const [gruppe, schluessel] of gruppen) {
  for (const k of schluessel) {
    for (const [name, w] of [["DE", de], ["TR", tr]]) {
      const wert = w.befunde?.[gruppe]?.[k]
      const da = typeof wert === "string" ? wert.trim().length > 0 : Boolean(wert?.label)
      pruefe(`${name} befunde.${gruppe}.${k}`, da)
    }
  }
}
for (const h of HYPOTHESES) {
  for (const [name, w] of [["DE", de], ["TR", tr]]) {
    pruefe(`${name} hypothese.satz.${h.key}`, Boolean(w.hypothese?.satz?.[h.key]))
    pruefe(`${name} hypothese.pruefen.${h.key}`, Boolean(w.hypothese?.pruefen?.[h.key]))
    pruefe(`${name} hypothese.status.${h.status}`, Boolean(w.hypothese?.status?.[h.status]))
  }
}
console.log(
  `  ${gruppen.reduce((n, [, k]) => n + k.length, 0)} Maschinenwerte + ${HYPOTHESES.length} Hypothesen geprueft`,
)

/*
 * Und die Gegenprobe: Die Domaenenmodule duerfen keine fertigen Saetze mehr
 * bauen. `satz:` in einem Befund waere der Rueckfall, den Abschnitt 2 nicht
 * sieht.
 */
for (const datei of ["lib/angebot.ts", "lib/lieferung.ts"]) {
  const quelle = readFileSync(datei, "utf8").replace(/\/\*[\s\S]*?\*\//g, " ")
  pruefe(`${datei} baut keine fertigen Befundsaetze mehr`, !/fehlt\.push\(\{[^}]*satz:/.test(quelle))
}

console.log(fehler ? `\n✗ ${fehler} Befund(e)\n` : "\n✓ Admin-Sprach-Gate gruen\n")
process.exit(fehler ? 1 : 0)
