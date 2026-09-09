#!/usr/bin/env node
/**
 * DIE BASISMESSUNG — GATE 27 ⬥
 *
 * ---------------------------------------------------------------------------
 * WAS DIESER BEFEHL TUT
 *
 * Er misst die Owner-Last EINMAL und schreibt sie auf. Mehr nicht.
 *
 * Er beweist damit ausdruecklich NICHT, dass Automation die Owner-Last
 * gesenkt hat. Eine einzelne Messung ist ein Zustand, kein Verlauf. Was sie
 * beweist, ist, dass gemessen wird — und ab wann.
 *
 * ---------------------------------------------------------------------------
 * WARUM ER AUFGERUFEN WIRD UND NICHT LAEUFT
 *
 * Er koennte taeglich automatisch laufen. Genau das waere hier falsch:
 * Eine Messreihe, die sich selbst fuellt, waehrend niemand hinsieht, wird
 * zitiert, ohne dass jemand ihre Luecken kennt. Wer misst, soll wissen, dass
 * er misst — und an welchem Tag.
 *
 * ---------------------------------------------------------------------------
 * WARUM ER NICHTS UEBERSCHREIBT
 *
 * Ein Tag traegt genau eine Messung. Zwei waeren zwei Wahrheiten ueber
 * denselben Tag, und die spaetere gewaenne — obwohl der Vormittag genauso
 * wahr war.
 *
 *   --trocken    misst und zeigt, schreibt nicht.
 */
import { collectAttention } from "../lib/attention.ts"
import { auswertung, messtag, messungAus, SAGT_NICHTS_UEBER } from "../lib/ownerlast.ts"
import { createNeonVertrieb } from "../lib/vertrieb-store-neon.ts"
import { databaseKind } from "./lib/env-guard.mjs"

const trocken = process.argv.includes("--trocken")

const ZIEL = process.env.OWNERLAST_URL || process.env.DATABASE_URL || ""
if (!ZIEL) {
  console.error(
    "\nKein Ziel. OWNERLAST_URL oder DATABASE_URL setzen.\n\n" +
      "Die Messung wird NICHT ohne Datenbank gemacht: Sie waere dann eine Messung der\n" +
      "leeren Menge, und die sieht aus wie ein sehr entlasteter Betrieb.\n",
  )
  process.exit(2)
}

const db = databaseKind(ZIEL)
console.log(`\n  Ziel:   ${db.host}/${db.db}`)
console.log(`  Art:    ${db.kind}`)
console.log(`  Modus:  ${trocken ? "nur messen" : "messen und festhalten"}`)
console.log(`  Tag:    ${messtag()}\n`)

/*
 * Eine unbrauchbare Verbindungszeichenfolge soll hier enden, nicht in einem
 * Stapelabzug aus dem Treiber. Der Unterschied ist nicht Kosmetik: Ein
 * Abbruch mitten in der Messung sieht aus wie ein Betriebsproblem, waehrend
 * in Wirklichkeit eine Umgebungsvariable fehlt.
 */
let store
try {
  store = createNeonVertrieb(ZIEL)
} catch (fehler) {
  console.error(
    `\nDas Ziel ist keine brauchbare Verbindungszeichenfolge (${String(fehler.message).split(":")[0]}).\n\n` +
      "Gemessen wird nichts. Eine Messung gegen ein Ziel, das es nicht gibt, waere eine Messung\n" +
      "der leeren Menge — und die sieht aus wie ein sehr entlasteter Betrieb.\n",
  )
  process.exit(2)
}

const board = await collectAttention(store)
const messung = messungAus(board)

for (const [rang, n] of Object.entries(messung.counts)) if (n > 0) console.log(`  ${String(n).padStart(4)}  ${rang}`)
console.log(`\n  Vertrieb gelesen: ${messung.vertriebGemessen ? "ja" : "NEIN"}`)

/*
 * Eine unvollstaendige Messung wird NICHT festgehalten.
 *
 * Nicht, weil sie eine Luege waere — sie traegt ihr Etikett, und `vergleich()`
 * weist sie ab. Sondern weil der Tag nur EINEN Platz hat: Ein Ausfall um
 * neun Uhr wuerde sonst die brauchbare Messung um drei Uhr blockieren, und
 * am Ende steht im Verlauf ein Loch, das ein Ausfall gerissen hat, waehrend
 * der Betrieb messbar gewesen waere.
 */
if (!messung.vertriebGemessen) {
  console.error(
    "\nDer Vertriebsteil konnte nicht gelesen werden. Es wird nichts festgehalten.\n\n" +
      "„Nicht gemessen“ ist nicht „nichts los“ — und der Tag hat nur einen Platz. Waere diese\n" +
      "Messung jetzt eingetragen, koennte der heutige Tag nicht mehr richtig gemessen werden.\n" +
      "Erst die Verbindung klaeren, dann erneut messen.\n",
  )
  process.exit(2)
}

if (trocken) {
  console.log("\n  (trocken — nichts geschrieben)\n")
  process.exit(0)
}

const ergebnis = await store.recordOwnerLoadSample({ ...messung, note: null })

if (ergebnis === "nicht-moeglich") {
  console.error(
    "\nDie Messreihe ist nicht erreichbar. Es wird nichts erfunden.\n\n" +
      "Wahrscheinlich fehlt die Tabelle `owner_load_samples`. Sie steht ABSICHTLICH nicht in\n" +
      "REQUIRED_TABLES — ein Messinstrument darf den Betrieb nicht anhalten. Anlegen mit:\n\n" +
      "    npm run db-migrate\n",
  )
  process.exit(2)
}

console.log(
  ergebnis === "neu"
    ? `\n  Festgehalten als Messung vom ${messung.am}.`
    : `\n  Der ${messung.am} hat bereits eine Messung. Es wurde nichts ueberschrieben.`,
)

/* ── Was die Reihe jetzt hergibt ────────────────────────────────────────── */
const reihe = await store.ownerLoadSamples()
const urteil = auswertung(reihe)

console.log(`\n  Messungen in der Reihe: ${reihe === null ? "nicht lesbar" : reihe.length}`)
console.log(`  Aussage: ${urteil.aussagekraeftig ? urteil.urteil : "noch keine"}`)
console.log(`  ${urteil.grund}`)
if (urteil.warnung) console.log(`\n  WARNUNG: ${urteil.warnung}`)
if (urteil.aussagekraeftig && !urteil.erfolg && urteil.urteil === "gesunken")
  console.log("\n  Das darf NICHT als Automationserfolg berichtet werden.")

console.log("\n  Was diese Zahl nicht sagt:")
for (const satz of SAGT_NICHTS_UEBER) console.log(`    · ${satz}`)
console.log("")
