#!/usr/bin/env node
/**
 * ADM-06 · AUTOMATIONS-GATE — die Grenze, nicht das Verhalten.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARBEITSTEILUNG
 *
 *   automation-drill.mjs   Verhalten gegen eine echte Datenbank.
 *   diese Datei            Die Grenze: Aendert eine Automation etwas? Steht
 *                          die Flaeche im Register? Ist die Musterschwelle
 *                          noch dieselbe wie in G16?
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE WICHTIGSTE PRUEFUNG STEHT IN §2
 *
 * Eine Automation darf keinen Geschaeftsdatensatz aendern. Diese Regel ist
 * die Begruendung dafuer, dass Umkehrbarkeit ohne Aufwand geht — faellt sie,
 * faellt der ganze Entwurf, und zwar leise: Der Probelauf bliebe gruen,
 * solange niemand den neuen Schreibpfad prueft.
 *
 * Aufruf: node --import ./scripts/lib/alias-hook.mjs scripts/check-automation.mjs
 */
import { readFileSync } from "node:fs"

import { AUTOMATION_ERGEBNISSE, AUTOMATION_MUSTER_AB, AUTOMATION_ZUSTAENDE } from "@/lib/automation"
import { AUSLOESER, HANDLUNGEN, NIEMALS_AUTOMATISCH, WIRKUNGEN } from "@/lib/ereignis"
import { MUSTER_AB } from "@/lib/verlust"
import { flaecheZu } from "@/lib/rollen"
import { de } from "@/lib/admin-i18n/de"
import { tr } from "@/lib/admin-i18n/tr"

let fehler = 0
const pruefe = (name, ok, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`)
  if (!ok) fehler++
}
const ohneKommentare = (q) =>
  q.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((z) => z.replace(/\/\/.*$/, "")).join("\n")
const lies = (p) => ohneKommentare(readFileSync(p, "utf8"))

console.log("\n1 · Die Flaeche ist angemeldet")
const flaeche = flaecheZu("/admin/automationen")
pruefe("`/admin/automationen` steht im Rollenregister", Boolean(flaeche))
pruefe("nur der Owner darf hinein", flaeche?.fuer.length === 1 && flaeche.fuer[0] === "owner")
pruefe("sie traegt keine Personendaten Dritter", flaeche?.klasse === "eigene-lage")
pruefe(
  "die Navigation fuehrt sie",
  /key:\s*"automationen",\s*href:\s*"\/admin\/automationen"/.test(lies("components/admin/admin-shell.tsx")),
)

console.log("\n2 · Eine Automation aendert keinen Geschaeftsdatensatz")
const laeufer = lies("lib/vertrieb-store-neon.ts")
const koerper = laeufer.slice(laeufer.indexOf("async function automationen("), laeufer.indexOf("async function note("))
pruefe("der Laeufer existiert", koerper.length > 200)
for (const tabelle of ["leads", "opportunities", "offers", "projects", "organisations", "contacts", "releases"]) {
  pruefe(
    `er schreibt nicht in \`${tabelle}\``,
    !new RegExp(`(UPDATE|INSERT INTO|DELETE FROM)\\s+${tabelle}\\b`, "i").test(koerper),
  )
}
pruefe(
  "er schreibt nur in sein Protokoll und (bei `notieren`) in die Chronik",
  /INSERT INTO automation_runs/.test(koerper) && /INSERT INTO activities/.test(koerper),
)
pruefe(
  "und reisst die Geschaeftshandlung nie mit",
  /\}\s*catch\s*\{/.test(koerper),
  "ein Fehler der Automation darf keinen Vertriebsvorgang abbrechen",
)
pruefe(
  "die Chronikzeile traegt Herkunft AUTOMATION",
  /'AUTOMATION'/.test(koerper),
)

console.log("\n3 · Die Grenze aus G26 ist unveraendert")
pruefe("zehn Handlungen geschehen nie automatisch", NIEMALS_AUTOMATISCH.length === 10, String(NIEMALS_AUTOMATISCH.length))
pruefe("vier erlaubte Handlungen", HANDLUNGEN.length === 4)
pruefe("vier Wirkungen", WIRKUNGEN.length === 4)
pruefe(
  "kein Ausloeser hat eine fuenfte Wirkung",
  AUSLOESER.every((a) => WIRKUNGEN.includes(a.wirkung)),
)
pruefe("jeder Ausloeser ist abschaltbar", AUSLOESER.every((a) => a.abschaltbar === true))
pruefe(
  "die Musterschwelle stimmt mit G16 ueberein",
  AUTOMATION_MUSTER_AB === MUSTER_AB,
  `automation ${AUTOMATION_MUSTER_AB} · verlust ${MUSTER_AB}`,
)

console.log("\n4 · Jeder Maschinenwert hat einen Text in DE und TR")
for (const [gruppe, schluessel] of [
  ["ausloeser", AUSLOESER.map((a) => a.key)],
  ["ergebnis", [...AUTOMATION_ERGEBNISSE]],
  ["zustand", [...AUTOMATION_ZUSTAENDE]],
  ["wirkung", [...WIRKUNGEN]],
]) {
  for (const k of schluessel) {
    for (const [name, w] of [["DE", de], ["TR", tr]]) {
      const wert = w.automationen?.[gruppe]?.[k]
      const da = typeof wert === "string" ? wert.trim().length > 0 : Boolean(wert?.name)
      pruefe(`${name} automationen.${gruppe}.${k}`, da)
    }
  }
}

console.log("\n5 · Jeder Ausloeser wird auch wirklich gerufen")
/*
 * Ein Ausloeser, an dessen Ereignis niemand den Laeufer ruft, ist Dekoration:
 * Er steht im Register, im Schalter und auf der Seite — und laeuft nie.
 */
for (const a of AUSLOESER) {
  pruefe(
    `der Laeufer wird bei \`${a.auf}\` gerufen`,
    new RegExp(`automationen\\(\\s*"${a.auf.replace(".", "\\.")}"`).test(laeufer),
  )
}

console.log(fehler ? `\n✗ ${fehler} Befund(e)\n` : "\n✓ Automations-Gate gruen\n")
process.exit(fehler ? 1 : 0)
