#!/usr/bin/env node
/**
 * G16 · HERKUNFT-GATE — die Erklaerung und das System sagen dasselbe.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE FRAGE, DIE ES STELLT
 *
 * Kann dieses System eine Datenkategorie speichern, die auf der Seite nicht
 * steht?
 *
 * Am 09.09.2026 lautete die Antwort JA, und niemand hatte es gemerkt:
 * `app/api/lead/route.ts` nahm `utmSource…utmContent` entgegen, mailte sie
 * als Block „Kampagne:" und schrieb sie in die Datenbank. Die
 * Datenschutzerklaerung nennt Name, Betrieb, E-Mail, Telefon und Nachricht.
 * Kampagnenherkunft steht dort nicht.
 *
 * Gesichert war das allein durch den Client: „die Seite sendet sie nicht."
 * Das ist ein Zustand, keine Regel. Ein Skript, ein zweites Formular oder
 * ein kuenftiger Client, den jemand „nur mal ausprobiert", haette eine
 * Kategorie angelegt, die auf der Seite nicht steht.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS ES PRUEFT
 *
 *   1 · Haengt die Tuer ueberhaupt an der Erklaerung? Die Route muss den
 *       Schluessel benutzen — sonst ist der Schluessel Dekoration.
 *   2 · Stimmen Erklaerung und Verhalten UEBEREIN? Beides ist erlaubt:
 *       Kategorie nicht genannt → Felder fallen. Kategorie genannt →
 *       Felder gehen durch. Verboten ist nur das Auseinanderfallen.
 *   3 · Traegt jede Verlustart eine Lehre? Eine Liste, aus der nichts folgt,
 *       ist wieder Freitext mit Kaesten.
 *
 * Was es NICHT tut: eine Datenschutzerklaerung formulieren oder beurteilen,
 * ob sie juristisch traegt. Das ist keine Frage an ein Skript.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { KAMPAGNEN_FELDER, datenschutzText, kampagneSpeicherbar } from "../lib/herkunft.ts"
import { VERLUST_LEHREN, lehrenVollstaendig, lehreZu } from "../lib/verlust.ts"
import { LOST_REASONS } from "../lib/sales-playbook.ts"
import { dictionary } from "../lib/dictionary.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []

/* ═══ 1 · Die Tuer haengt an der Erklaerung ══════════════════════════════ */

const route = readFileSync(path.join(ROOT, "app", "api", "lead", "route.ts"), "utf8")

/*
 * Gesucht ist die WIRKUNG, nicht das Wort: Die Route muss den Schluessel
 * aufrufen UND ihn auf die Felder anwenden. Ein Import allein ist keine
 * Sicherung — das war die Lehre aus dem Privatsphaere-Waechter des
 * Schwesterprojekts: „import ≠ Benutzung".
 */
const ruftSchluessel = /kampagneSpeicherbar\s*\(/.test(route)
const wendetAn = /durchDieTuer\s*\(/.test(route)

if (!ruftSchluessel || !wendetAn) {
  fehler.push(
    "Die Lead-Route entscheidet die Kampagnenfelder nicht an der Datenschutzerklaerung. " +
      `Gefunden: kampagneSpeicherbar ${ruftSchluessel ? "ja" : "NEIN"}, durchDieTuer ${wendetAn ? "ja" : "NEIN"}. ` +
      "Ohne beides nimmt die Route eine Datenkategorie entgegen, die auf der Seite nicht steht.",
  )
}

/*
 * Und die Felder muessen DURCH die Tuer gehen, nicht daran vorbei. Wer
 * `payload.utmSource` spaeter noch einmal direkt liest, hat den Schluessel
 * umgangen — die Stelle im Objekt-Literal der Tuer ist erlaubt, jede
 * weitere nicht.
 */
const ohneTuer = route.split(/durchDieTuer\s*\(/)[1] ?? ""
const nachDerTuer = ohneTuer.slice(ohneTuer.indexOf("herkunftErlaubt"))
for (const feld of KAMPAGNEN_FELDER) {
  if (new RegExp(`payload\\.${feld}\\b`).test(nachDerTuer)) {
    fehler.push(
      `Die Route liest \`payload.${feld}\` noch einmal NACH der Tuer. ` +
        "Damit gilt die Erklaerung fuer dieses Feld nicht.",
    )
  }
}

/* ═══ 2 · Erklaerung und Verhalten sagen dasselbe ════════════════════════ */

const erklaerung = datenschutzText(dictionary.de.legal)
const erlaubt = kampagneSpeicherbar(erklaerung)

/* ═══ 3 · Jede Verlustart traegt eine Lehre ══════════════════════════════ */

if (!lehrenVollstaendig()) {
  const fehlend = LOST_REASONS.filter((r) => !lehreZu(r))
  fehler.push(
    `Ohne Lehre im Verzeichnis: ${fehlend.join(", ")}. ` +
      "Eine Liste, aus der nichts folgt, ist Freitext mit Kaesten.",
  )
}

for (const lehre of VERLUST_LEHREN) {
  if (!LOST_REASONS.includes(lehre.grund)) {
    fehler.push(
      `Das Verzeichnis kennt „${lehre.grund}", die Auswahlliste nicht. ` +
        "Zwei Listen ueber denselben Sachverhalt werden in vier Wochen zwei Wahrheiten.",
    )
  }
  if (!lehre.lehrt || lehre.lehrt.trim().length < 20) {
    fehler.push(`„${lehre.grund}" sagt nicht, was daraus folgt.`)
  }
}

/*
 * Und der Grund muss im Formular GEBUNDEN sein. Eine `<datalist>` schlaegt
 * vor; genau daran ist die Liste aus Gate 3 gescheitert.
 */
const formular = readFileSync(
  path.join(ROOT, "app", "(admin)", "admin", "vertrieb", "pipeline", "[id]", "page.tsx"),
  "utf8",
)
if (/id="lostReason"[^>]*list=/.test(formular) || /<datalist id="verlustgruende"/.test(formular)) {
  fehler.push(
    "Der Verlustgrund haengt wieder an einer Vorschlagsliste. " +
      "Eine <datalist> bindet nichts — der Freitext kommt zurueck, und mit ihm die fuenfzig Formulierungen.",
  )
}

const aktion = readFileSync(path.join(ROOT, "app", "(admin)", "admin", "vertrieb", "actions.ts"), "utf8")
if (!/LOST_REASONS\s*as\s*readonly\s*string\[\]\)\.includes/.test(aktion)) {
  fehler.push(
    "Die Server-Aktion prueft den Verlustgrund nicht gegen das Verzeichnis. " +
      "Ein gebundenes Formular ist keine Sicherung — die Aktion ist die Tuer.",
  )
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

console.log(
  `\nHerkunft-Gate — ${KAMPAGNEN_FELDER.length} Kampagnenfeld(er), ` +
    `${VERLUST_LEHREN.length} Verlustgrund/-gruende mit Lehre`,
)
console.log(
  erlaubt
    ? "  Die Datenschutzerklaerung NENNT die Kampagnenherkunft — die Felder gehen durch."
    : "  Die Datenschutzerklaerung nennt die Kampagnenherkunft NICHT — die Felder fallen an der Tuer.",
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log("OK — was das System speichern kann, steht auf der Seite. Der Verlustgrund ist gebunden.")
if (!erlaubt) {
  console.log(
    "Attribution ist damit AUS, nicht kaputt: Ein Satz in der Erklaerung schaltet sie ein — ohne Code.",
  )
}
