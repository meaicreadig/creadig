#!/usr/bin/env node
/**
 * G34 · COCKPIT-GATE — die Synthese rechnet nicht selbst.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE EINE FRAGE
 *
 * Ein Cockpit, das selbst rechnet, wird die zwanzigste Quelle der Wahrheit —
 * und die mit der groessten Schriftart. Wer eine Zahl auf einer
 * Uebersichtsseite sieht, prueft sie nicht nach; er handelt danach.
 *
 * Deshalb darf diese Seite nur zeigen, was G28 und G29 fertig liefern:
 * Auskuenfte mit Fundstellen und Vorschlaege mit Belegen. Keine eigene
 * Rechnung, keine eigene Schwelle, keine eigene Liste.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * UND DIE ZWEITE
 *
 * Zeigt sie DREI Zustaende oder zwei? „Nicht erhoben" ist der, den
 * Uebersichtsseiten gewoehnlich verschlucken — und er ist der ehrlichste.
 * Aus ihm ein rotes Feld zu machen hiesse, eine offene Owner-Frage als
 * Systemfehler auszugeben.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { kontext, nichtErhoben, offen } from "../lib/gedaechtnis.ts"
import { reihenfolge } from "../lib/navigator.ts"
import { flaecheZu } from "../lib/rollen.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []

const datei = path.join(ROOT, "app", "(admin)", "admin", "cockpit", "page.tsx")
const roh = readFileSync(datei, "utf8")
function ohneKommentare(q) {
  return q.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((z) => z.replace(/\/\/.*$/, "")).join("\n")
}
const quelle = ohneKommentare(roh)

/* ═══ 1 · Sie rechnet nicht selbst ═══════════════════════════════════════ */

/*
 * Gesucht ist die WIRKUNG: eine eigene Rechnung ueber Daten. `filter` auf
 * den fertigen Auskuenften ist keine — es waehlt aus, was G28 schon
 * beurteilt hat. Eine Summe, ein Durchschnitt, eine Quote waere eine.
 */
for (const muster of [
  { re: /\breduce\s*\(/, was: "eine Summe" },
  { re: /\bMath\.(round|floor|ceil)\s*\(/, was: "eine Rundung" },
  { re: /\/\s*\w+\.length/, was: "eine Quote" },
  { re: /\*\s*100\b/, was: "einen Prozentwert" },
]) {
  if (muster.re.test(quelle)) {
    fehler.push(
      `Das Cockpit bildet ${muster.was}. Es darf nur zeigen, was G28 und G29 fertig liefern — ` +
        "sonst wird es die zwanzigste Quelle der Wahrheit, und die mit der groessten Schriftart.",
    )
  }
}

/* Und es darf nicht an den Registern vorbei direkt in die Daten greifen. */
for (const verboten of ["site-data", "vertrieb-store", "lead-store", "neon-client", "proof", "produkt", "wirtschaft"]) {
  if (new RegExp(`from\\s+["']@/lib/${verboten}`).test(roh)) {
    fehler.push(
      `Das Cockpit importiert \`lib/${verboten}\` direkt. Die Synthese liest G28 und G29, ` +
        "nicht die Register darunter — sonst entsteht ein zweiter Weg zur selben Zahl.",
    )
  }
}

/* ═══ 2 · Drei Zustaende, nicht zwei ═════════════════════════════════════ */

/*
 * OHNE KOMMENTARE — zum vierten Mal dieselbe Falle.
 *
 * Der erste Anlauf las den ROHEN Quelltext. Die Blindprobe ersetzte alle
 * drei Zustandsbeschriftungen in der Oberflaeche durch „offen" — und der
 * Waechter schwieg, weil in einem KOMMENTAR weiter oben noch „NICHT
 * ERHOBEN" stand.
 *
 * Prosa ueber eine Regel ist kein Beweis, dass die Regel wirkt. Gesucht
 * sind die drei Beschriftungen, die ein Mensch auf der Seite liest.
 */
if (!/nicht erhoben/i.test(quelle)) {
  fehler.push(
    "Das Cockpit kennt den Zustand nicht-erhoben nicht. Dann hat es zwei Zustaende statt drei — und eine " +
      "offene Owner-Frage sieht aus wie ein Systemfehler.",
  )
}
if (!/steht/i.test(quelle) || !/offen/i.test(quelle)) {
  fehler.push("Das Cockpit unterscheidet nicht zwischen steht und offen.")
}

/* ═══ 3 · Es zeigt die Belege ════════════════════════════════════════════ */

if (!/belege/i.test(quelle)) {
  fehler.push(
    "Das Cockpit zeigt die Fundstellen nicht. Eine Auskunft ohne sichtbaren Beleg ist auf einer " +
      "Uebersichtsseite genau die Behauptung, gegen die G28 gebaut wurde.",
  )
}

/* ═══ 4 · Es liegt hinter den Rechten ════════════════════════════════════ */

const flaeche = flaecheZu("/admin/cockpit")
if (!flaeche) {
  fehler.push("Die Cockpit-Seite steht in keinem Flaechen-Eintrag (G32) — sie waere fuer alle gesperrt.")
} else if (flaeche.klasse === "fremde-personen") {
  fehler.push(
    "Das Cockpit ist als Flaeche mit Personendaten Dritter eingetragen. Es zeigt Auskuenfte " +
      "aus Registern, keine Kundenakte — die engere Klasse waere hier falsch und wuerde Rechte verengen, die es nicht braucht.",
  )
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

const lagen = kontext()
const schritte = reihenfolge()

console.log(
  `\nCockpit-Gate — ${lagen.length} Auskuenfte (${lagen.filter((a) => a.steht === true).length} steht, ` +
    `${offen().length} offen, ${nichtErhoben().length} nicht erhoben), ${schritte.length} Schritte`,
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log("OK — das Cockpit rechnet nichts, zeigt drei Zustaende und nennt seine Fundstellen.")
