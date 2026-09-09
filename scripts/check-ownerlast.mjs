#!/usr/bin/env node
/**
 * DAS OWNER-LAST-GATE — GATE 27 ⬥
 *
 * ---------------------------------------------------------------------------
 * WORUM ES GEHT
 *
 * Der Gate-Vertrag warnt vor „Automationstheater". Das ist kein
 * Stilproblem — es ist ein konkreter, billiger Weg, eine Kennzahl zu
 * verbessern:
 *
 *   Owner-Last ist die Zahl der Posten, die einen Menschen verlangen.
 *   Der schnellste Weg, sie zu senken, ist NICHT Automation.
 *   Es ist, eine Entscheidung abzuschaffen.
 *
 * Dieses Haus hat an mehreren Stellen absichtlich einen Menschen
 * hingestellt. Verschwindet eines dieser Tore, faellt die Zahl — und der
 * naechste Bericht meldet eine Entlastung, die in Wirklichkeit eine
 * entfernte Sicherung ist.
 *
 * Deshalb prueft dieses Gate nicht die Kennzahl. Es prueft, dass die Tore
 * noch stehen, an denen sie haengt.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES DIE MODULE LAEDT UND NICHT DEN QUELLTEXT DURCHSUCHT
 *
 * Ein Textfund haette das Wort auch in einem Kommentar akzeptiert — und
 * genau so verschwindet ein Tor in der Praxis: Der Name bleibt in einer
 * Notiz stehen, die Funktion ist fort. Ein geladenes Modul kann nicht so
 * tun, als haette es einen Export, den es nicht hat.
 *
 * Und es prueft nicht nur, DASS der Export da ist, sondern ob noch etwas
 * dahintersteht. `export const NIEMALS_AUTOMATISCH = []` besteht jede Suche
 * nach dem Namen und ist trotzdem ein entferntes Tor.
 *
 * ---------------------------------------------------------------------------
 * WAS GEPRUEFT WIRD
 *
 *   1. Jeder Aufmerksamkeitsrang gehoert genau EINER Klasse an — abnehmbar
 *      oder nicht. Ein neuer Rang, den niemand einordnet, faellt sonst
 *      stillschweigend aus der Messung.
 *   2. Die unabnehmbare Klasse ist nicht leer.
 *   3. Jedes benannte Entscheidungstor existiert noch — als Export, mit Inhalt.
 *   4. Die Messreihe steht in beiden Schema-Fassungen.
 *   5. Es gibt keine gespeicherte Trend-Spalte.
 *   6. Die Messreihe ist kein Betriebsteil — sie steht nicht in REQUIRED_TABLES.
 *   7. Der Mindestabstand ist nicht heruntergesetzt worden.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const lies = (rel) => readFileSync(path.join(ROOT, rel), "utf8")

const O = await import("../lib/ownerlast.ts")
const { ATTENTION_RANKS } = await import("../lib/attention.ts")

const probleme = []

/* ── 1 · Jeder Rang ist eingeordnet ─────────────────────────────────────── */
const eingeordnet = [...O.ABNEHMBAR, ...O.UNABNEHMBAR]
for (const rang of ATTENTION_RANKS)
  if (!eingeordnet.includes(rang))
    probleme.push(
      `Der Aufmerksamkeitsrang „${rang}" gehoert weder zu ABNEHMBAR noch zu UNABNEHMBAR. ` +
        "Er faellt damit lautlos aus der Messung — und eine Last, die niemand zaehlt, ist gesunken.",
    )
for (const rang of eingeordnet)
  if (!ATTENTION_RANKS.includes(rang))
    probleme.push(`„${rang}" ist eingeordnet, existiert in lib/attention.ts aber nicht mehr.`)
if (!O.KLASSIFIKATION_VOLLSTAENDIG && probleme.length === 0)
  probleme.push("Die Klassifikation meldet sich selbst als unvollstaendig.")

/* ── 2 · Die unabnehmbare Klasse ist nicht leer ─────────────────────────── */
if (O.UNABNEHMBAR.length === 0)
  probleme.push(
    "UNABNEHMBAR ist leer. Damit ist die unabnehmbare Last dauerhaft null, sie kann nie fallen, " +
      "und die Warnung vor einem entfernten Entscheidungstor kann nie ausloesen. Eine Sicherung, " +
      "die nicht ausloesen kann, ist keine.",
  )

/* ── 3 · Die Entscheidungstore stehen noch ──────────────────────────────── */
for (const tor of O.ENTSCHEIDUNGSTORE) {
  let modul
  try {
    modul = await import(`../${tor.wo}`)
  } catch (fehler) {
    probleme.push(
      `${tor.gate}: ${tor.wo} laesst sich nicht laden — das Tor „${tor.was}" ist nicht mehr ` +
        `erreichbar (${String(fehler).split("\n")[0]}).`,
    )
    continue
  }

  const wert = modul[tor.suche]
  if (wert === undefined) {
    probleme.push(
      `${tor.gate}: ${tor.wo} exportiert „${tor.suche}" nicht mehr. Das Tor „${tor.was}" ist ` +
        "entfernt oder umbenannt. Faellt die Owner-Last dadurch, ist das keine Entlastung, " +
        "sondern eine entfernte Entscheidung.",
    )
    continue
  }

  if (tor.art === "funktion" && typeof wert !== "function")
    probleme.push(
      `${tor.gate}: „${tor.suche}" ist kein aufrufbares Tor mehr (${typeof wert}). Der Name ` +
        `steht noch da, die Entscheidung „${tor.was}" nicht.`,
    )

  if (tor.art === "liste" && (!Array.isArray(wert) || wert.length === 0))
    probleme.push(
      `${tor.gate}: „${tor.suche}" ist leer oder keine Liste. Eine leere Verbotsliste verbietet ` +
        `nichts — das Tor „${tor.was}" steht nur noch dem Namen nach.`,
    )
}

/* ── 4 · Beide Schema-Fassungen ─────────────────────────────────────────── */

/**
 * Der Rumpf der Tabellendefinition — nur die Spalten, ohne Prosa.
 *
 * Die erste Fassung dieser Pruefung durchsuchte die ganze Datei und meldete
 * einen Default, wo im Kommentar stand „HAT KEINEN DEFAULT". Ein Pruefer, der
 * die Begruendung fuer die Regel als Verstoss gegen die Regel liest, ist
 * schlimmer als keiner: Er zwingt dazu, die Begruendung zu loeschen.
 */
const tabellenrumpf = (text) => {
  const start = text.indexOf("CREATE TABLE IF NOT EXISTS owner_load_samples")
  if (start === -1) return null
  const auf = text.indexOf("(", start)
  if (auf === -1) return null
  let tiefe = 0
  for (let i = auf; i < text.length; i++) {
    if (text[i] === "(") tiefe++
    else if (text[i] === ")" && --tiefe === 0) return text.slice(auf + 1, i)
  }
  return null
}

const schema = lies("lib/neon-client.ts")
const migration = lies("scripts/migrations/013-ownerlast.sql")
for (const [name, text] of [
  ["lib/neon-client.ts", schema],
  ["013-ownerlast.sql", migration],
]) {
  const rumpf = tabellenrumpf(text)
  if (rumpf === null) {
    probleme.push(`Die Messreihe fehlt in ${name} — oder ihre Definition ist nicht lesbar.`)
    continue
  }

  /* Die Spaltenzeile, nicht die Datei. Ein Kommentar ist kein Schema. */
  const zeile = rumpf.split("\n").find((z) => /^\s*sales_measured\b/.test(z)) ?? ""
  if (!/^\s*sales_measured\s+boolean\s+NOT NULL/i.test(zeile))
    probleme.push(
      `${name}: \`sales_measured\` ist nicht \`boolean NOT NULL\`. Ohne dieses Feld waere ein ` +
        "Datenbankausfall die beste Entlastung, die dieses Haus je hatte.",
    )
  if (/DEFAULT/i.test(zeile))
    probleme.push(
      `${name}: \`sales_measured\` hat einen Default. Dann erklaert sich eine Messung nicht mehr ` +
        "ausdruecklich dazu, ob sie den Vertrieb lesen konnte — derselbe Fehler mit besserem Gewissen.",
    )

  if (!/owner_load_samples_day_idx/.test(text))
    probleme.push(`${name}: der Tages-Eindeutigkeitsindex fehlt — zwei Wahrheiten ueber einen Tag.`)

  /* ── 5 · Kein gespeichertes Urteil ─────────────────────────────────────
   *
   * Geprueft wird der Rumpf, nicht die Datei: Die Begruendung, warum es
   * keine Trendspalte gibt, nennt das Wort „trend" — und muesste sonst
   * geloescht werden, damit die Pruefung besteht.
   */
  if (/\b(trend|entlastung|prozent|delta|score)\b/i.test(rumpf))
    probleme.push(
      `${name}: Die Messreihe traegt eine Spalte, die ein Urteil speichert. Das Urteil faellt aus ` +
        "zwei Messungen und den Regeln in lib/ownerlast.ts — gespeichert waere es genau das " +
        "Automationstheater, vor dem der Gate-Vertrag warnt.",
    )
}

/* ── 6 · Die Messreihe haelt das Haus nicht an ──────────────────────────── */
const pflichtBlock = schema.slice(schema.indexOf("const REQUIRED_TABLES"), schema.indexOf("const REQUIRED_COLUMNS"))
if (pflichtBlock.includes("owner_load_samples"))
  probleme.push(
    "owner_load_samples steht in REQUIRED_TABLES. Damit haelt ein fehlendes MESSINSTRUMENT den " +
      "Betrieb an — und schlimmer: Der Druck, es schnell anzulegen, faellt auf denselben Lauf, " +
      "der gerade misst. Ein Messinstrument darf fehlen; es darf nur nicht als Null durchgehen.",
  )

/* ── 7 · Der Mindestabstand ist nicht verhandelbar ──────────────────────── */
if (O.MIND_ABSTAND_TAGE < 28)
  probleme.push(
    `Der Mindestabstand steht auf ${O.MIND_ABSTAND_TAGE} Tagen. Er war 28. Wer ihn senkt, ` +
      "bekommt frueher eine Aussage — aber es ist dieselbe Aussage, die vorher „nicht " +
      "aussagekraeftig" +
      "\" hiess. Ungeduld ist kein Messfehler, den man wegkonfiguriert.",
  )

/* ── Ausgabe ────────────────────────────────────────────────────────────── */
console.log(
  `\nOwner-Last-Gate — ${ATTENTION_RANKS.length} Raenge (${O.ABNEHMBAR.length} abnehmbar, ` +
    `${O.UNABNEHMBAR.length} nicht), ${O.ENTSCHEIDUNGSTORE.length} Entscheidungstore, Mindestabstand ` +
    `${O.MIND_ABSTAND_TAGE} Tage`,
)

if (probleme.length > 0) {
  console.error("\nOwner-Last-Gate: die Kennzahl liesse sich verbessern, ohne dass etwas besser wird.\n")
  for (const p of probleme) console.error(`  ${p}`)
  console.error(
    "\nEine Zahl, die man durch das Entfernen einer Sicherung senken kann, misst das Gegenteil\n" +
      "dessen, was sie soll. Genau davor warnt der Gate-Vertrag mit dem Wort Automationstheater.\n",
  )
  process.exit(1)
}

console.log(
  `OK — jeder Rang ist eingeordnet, alle ${O.ENTSCHEIDUNGSTORE.length} Entscheidungstore stehen ` +
    `(${O.ENTSCHEIDUNGSTORE.map((t) => t.gate).join(", ")}), kein Urteil ist gespeichert.\n`,
)
