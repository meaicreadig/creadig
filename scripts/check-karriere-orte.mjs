#!/usr/bin/env node
/**
 * DAS STANDORT-GATE FUER KARRIERE
 *
 * ---------------------------------------------------------------------------
 * WORUM ES GEHT
 * Die erste Karriere-Fassung erzaehlte einen STANDORT: welche Stadt, welche
 * Haelfte des Betriebs, welches Gruendungsjahr. Der Owner hat das
 * zurueckgewiesen — er sucht Menschen, nicht ein Buero. Wo jemand spaeter
 * sitzt, ist eine Folge der Einstellung und nicht ihr Grund; solange keine
 * Stelle offen ist, ist es ausserdem eine Behauptung.
 *
 * Diese Entscheidung haelt kein Kommentar. Ein einziger Satz, der beim
 * naechsten Bearbeiten wieder „in unserem Team in X" schreibt, holt die
 * ganze Erzaehlung zurueck — deshalb prueft es hier eine Maschine.
 *
 * ---------------------------------------------------------------------------
 * WAS GEPRUEFT WIRD — UND WAS AUSDRUECKLICH NICHT
 * Geprueft wird NUR der Karriere-Bereich: seine Daten, sein Text, seine
 * Komponenten, seine Routen und der Karriere-Block im Woerterbuch.
 *
 * NICHT geprueft wird der Rest des Hauses. „Osnabrueck" steht voellig zu
 * Recht im Impressum, in den Kontaktdaten und in den strukturierten Daten —
 * dort ist es der Sitz der Firma und keine Erzaehlung ueber ein kuenftiges
 * Team. Ein Gate, das dort anschlaegt, waere ein falscher Alarm, und
 * falsche Alarme schaltet man irgendwann ab.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/** Nur diese Dateien gehoeren dem Karriere-Bereich. */
const KARRIERE_DATEIEN = [
  "lib/karriere.ts",
  "lib/karriere-inhalt.ts",
  "app/_routes/karriere.tsx",
  "components/karriere/beleg-kette.tsx",
  "components/karriere/bewerbung.tsx",
  "components/karriere/rollen-stand.tsx",
  "components/karriere/sprachtafel.tsx",
  "components/karriere/system-bild.tsx",
  "components/pages/karriere-page-body.tsx",
  "components/pages/karriere-spur-a-body.tsx",
  "components/pages/karriere-spur-b-body.tsx",
  "components/pages/karriere-bewerben-body.tsx",
]

/*
 * Die Begriffe, die den alten Standort-Faden zurueckholen wuerden — in allen
 * vier Sprachen, weil eine Uebersetzung dieselbe Erzaehlung ist.
 */
const VERBOTEN = [
  "Istanbul",
  "İstanbul",
  "Istanbuler",
  "إسطنبول",
  "Osnabrück",
  "Osnabrueck",
  "أوسنابروك",
  "Founding Team",
  "Founding Talent",
]

const probleme = []

for (const rel of KARRIERE_DATEIEN) {
  const datei = path.join(ROOT, rel)
  if (!fs.existsSync(datei)) {
    probleme.push(`${rel} fehlt — zeigt das Gate noch auf die richtigen Dateien?`)
    continue
  }
  const quelle = fs.readFileSync(datei, "utf8")
  quelle.split("\n").forEach((zeile, i) => {
    for (const wort of VERBOTEN) {
      if (zeile.includes(wort)) probleme.push(`${rel}:${i + 1} nennt „${wort}“ — ${zeile.trim().slice(0, 90)}`)
    }
  })
}

/* Der Karriere-Block im Woerterbuch, viermal — ohne den Rest der Datei. */
const woerterbuch = fs.readFileSync(path.join(ROOT, "lib", "dictionary.ts"), "utf8")
let ab = 0
let bloecke = 0
for (;;) {
  const start = woerterbuch.indexOf("    karriere: {", ab)
  if (start === -1) break
  const ende = woerterbuch.indexOf("\n    },", start)
  const block = woerterbuch.slice(start, ende)
  bloecke += 1
  for (const wort of VERBOTEN) {
    if (block.includes(wort)) probleme.push(`lib/dictionary.ts · karriere-Block ${bloecke} nennt „${wort}“.`)
  }
  ab = ende
}
if (bloecke !== 4) probleme.push(`Nur ${bloecke} Karriere-Bloecke im Woerterbuch gefunden — erwartet sind vier.`)

/* Und das Ergebnis: die gebauten Seiten. */
const APP = path.join(ROOT, ".next", "server", "app")
let seiten = 0
if (fs.existsSync(APP)) {
  for (const f of fs.readdirSync(APP, { recursive: true })) {
    if (typeof f !== "string" || !f.endsWith(".html") || !f.includes("karriere")) continue
    seiten += 1
    const html = fs.readFileSync(path.join(APP, f), "utf8")
    /*
     * Zwei Bereiche jeder Seite gehoeren nicht der Karriere und werden
     * ausgeklammert:
     *
     *   die FUSSZEILE — sie traegt auf jeder Seite des Hauses die
     *   Firmenanschrift, und der Sitz gehoert dorthin;
     *
     *   die STRUKTURIERTEN DATEN — `SiteShell` legt auf jede Seite dieselbe
     *   `Organization`-Auszeichnung mit derselben Anschrift.
     *
     * Beides sind Angaben ueber die Firma, keine Erzaehlung ueber ein
     * kuenftiges Team. Wer sie mitpruefte, bekaeme auf jeder Seite einen
     * Fehlalarm — und ein Gate, das immer schreit, wird abgeschaltet.
     */
    const ohneSkripte = html
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      /*
       * Und die globale `keywords`-Angabe. Sie kommt aus
       * `lib/page-metadata.ts`, steht wortgleich auf JEDER Seite des Hauses
       * und nennt dort den Firmensitz als Suchbegriff. Sie ist damit weder
       * Karriere-Text noch Karriere-Metadatum — sie zu aendern waere eine
       * SEO-Aenderung an der ganzen Website und gehoert nicht in diesen Lauf.
       */
      .replace(/<meta name="keywords"[^>]*>/g, " ")
    const bis = ohneSkripte.indexOf("<footer")
    const seiteninhalt = bis > 0 ? ohneSkripte.slice(0, bis) : ohneSkripte
    for (const wort of VERBOTEN) {
      if (seiteninhalt.includes(wort)) probleme.push(`${f} liefert „${wort}“ im Seiteninhalt aus.`)
    }
  }
}

console.log(
  `\nKarriere-Standort-Gate — ${KARRIERE_DATEIEN.length} Quelldateien, 4 Woerterbuch-Bloecke, ` +
    `${seiten} gebaute Seiten · ${VERBOTEN.length} Begriffe`,
)

if (probleme.length > 0) {
  console.error("\nKarriere-Standort-Gate: der alte Standort-Faden ist zurueck.\n")
  for (const p of probleme) console.error(`  ${p}`)
  console.error(
    "\nDie Karriereseite erzaehlt, WARUM creaDIG Menschen sucht — nicht, wo ein Team\n" +
      "sitzen wird. Der Sitz der Firma gehoert ins Impressum, nicht in die Karriere.\n",
  )
  process.exit(1)
}

console.log("OK — die Karriere erzaehlt keine Standortgeschichte.\n")
