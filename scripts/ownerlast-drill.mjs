#!/usr/bin/env node
/**
 * DER OWNER-LAST-PROBELAUF — GATE 27 ⬥
 *
 * Er prueft nicht, ob die Zahl faellt. Er prueft die acht Wege, auf denen
 * sie faellt, ohne dass etwas besser geworden ist:
 *
 *   O1  Ein Entscheidungstor wird entfernt.        (echter Angriff auf das Gate)
 *   O2  Zwei Messungen zu dicht beieinander.
 *   O3  Zwei Messungen weit genug auseinander.
 *   O4  Der Vertrieb war nicht lesbar.
 *   O5  Die Reihe war nicht lesbar / ist noch leer.
 *   O6  Dieselbe Reihe, zweimal ausgewertet.
 *   O7  Weniger Posten, weil Daten fehlen.
 *   O8  Weniger Posten bei stehenden Toren.
 *   O9 Die Reihe in einer echten Datenbank — dieselben SQL-Zeilen wie live.
 *   O10 Die Grenzen stehen neben der Zahl.
 *
 * O1 laeuft als ECHTER ANGRIFF: Das Gate wird in einer Kopie des Hauses
 * ausgeschaltet und muss den Build brechen. Ein Probelauf, der nur die
 * eigene Behauptung nachliest, prueft sich selbst.
 */
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import pg from "pg"
import { requireSafeTarget } from "./lib/env-guard.mjs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const O = await import("../lib/ownerlast.ts")

let fehler = 0
const p = (ok, n, d = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`)
}

/* Eine Messung bauen: nur die genannten Raenge, alles andere null. */
const m = (am, counts, vertriebGemessen = true) => ({
  am,
  counts: Object.fromEntries(
    Object.keys(O.ABNEHMBAR.concat(O.UNABNEHMBAR).reduce((o, r) => ({ ...o, [r]: 0 }), {})).map(
      (r) => [r, counts[r] ?? 0],
    ),
  ),
  vertriebGemessen,
})

/* ── O1 · Ein entferntes Tor bricht den Build ───────────────────────────── */
console.log("\nO1 · Ein Entscheidungstor wird entfernt")

/**
 * Das Haus in einer Kopie nachstellen und dort etwas kaputt machen.
 *
 * Kopiert wird, statt im Arbeitsbaum zu mutieren: Ein Probelauf, der die
 * echten Dateien anfasst, laesst sie beim ersten Abbruch kaputt zurueck —
 * und der naechste Lauf misst dann den Schaden des vorigen.
 */
const angriff = (aenderung) => {
  const heim = mkdtempSync(path.join(tmpdir(), "ownerlast-"))
  try {
    for (const teil of ["lib", "scripts"]) cpSync(path.join(ROOT, teil), path.join(heim, teil), { recursive: true })
    for (const datei of ["package.json", "tsconfig.json"])
      cpSync(path.join(ROOT, datei), path.join(heim, datei))
    symlinkSync(path.join(ROOT, "node_modules"), path.join(heim, "node_modules"))

    aenderung({
      lies: (rel) => readFileSync(path.join(heim, rel), "utf8"),
      schreib: (rel, inhalt) => writeFileSync(path.join(heim, rel), inhalt),
    })

    const lauf = spawnSync(
      process.execPath,
      ["--no-warnings", "--import", "./scripts/lib/alias-hook.mjs", "scripts/check-ownerlast.mjs"],
      { cwd: heim, encoding: "utf8" },
    )
    return { code: lauf.status, aus: `${lauf.stdout}${lauf.stderr}` }
  } finally {
    rmSync(heim, { recursive: true, force: true })
  }
}

/* Der unveraenderte Bau muss durchgehen — sonst prueft O1 nur seinen eigenen Aufbau. */
const heil = angriff(() => {})
p(heil.code === 0, "das unveraenderte Haus besteht die Pruefung", heil.code === 0 ? "" : heil.aus.slice(0, 300))

/*
 * Jeder Angriff muss aus dem RICHTIGEN Grund brechen.
 *
 * Ein kaputtes Modul bricht den Build auch — aber dann hat der Probelauf
 * bewiesen, dass Syntaxfehler auffallen, und nichts ueber Entscheidungstore
 * gesagt. Deshalb wird bei jedem Angriff geprueft, WAS gemeldet wurde.
 */
const bricht = (name, ergebnis, muster, detail = "") => {
  p(ergebnis.code === 1, name, detail || (ergebnis.code === 1 ? "" : ergebnis.aus.slice(0, 200)))
  const richtig = muster.test(ergebnis.aus) && !/laesst sich nicht laden/.test(ergebnis.aus)
  p(richtig, `  … und zwar als entferntes Tor, nicht als kaputte Datei`,
    richtig ? "" : ergebnis.aus.slice(0, 300))
}

/* a · Die Verbotsliste wird ausgehoehlt — der Name bleibt stehen. */
bricht(
  "eine ausgehoehlte Verbotsliste bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/ereignis.ts")
    schreib(
      "lib/ereignis.ts",
      t.replace("export const NIEMALS_AUTOMATISCH = [", "const NIEMALS_AUTOMATISCH_ALT = [") +
        "\nexport const NIEMALS_AUTOMATISCH = []\n",
    )
  }),
  /G26.*NIEMALS_AUTOMATISCH|NIEMALS_AUTOMATISCH.*leer/s,
  "ein Textfund haette den Namen gefunden und nichts gemerkt",
)

/* b · Eine Torfunktion wird durch einen Wert ersetzt. */
bricht(
  "eine Torfunktion, die keine Funktion mehr ist, bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/rechnung.ts")
    schreib(
      "lib/rechnung.ts",
      t.replace("export function stellbarkeit(", "function stellbarkeit_alt(") +
        "\nexport const stellbarkeit = true\n",
    )
  }),
  /G18.*stellbarkeit/s,
)

/* c · Ein Tor verschwindet ganz. */
bricht(
  "ein nicht mehr exportiertes Tor bricht den Build",
  angriff(({ lies, schreib }) => {
    const t = lies("lib/contact-access.ts")
    schreib("lib/contact-access.ts", t.replace("export function ansprachedeckung(", "function ansprachedeckung("))
  }),
  /G11.*ansprachedeckung/s,
)

/* d · Ein neuer Rang, den niemand einordnet. */
const unsortiert = angriff(({ lies, schreib }) => {
  const t = lies("lib/attention.ts")
  schreib("lib/attention.ts", t.replace('  "entscheidung",\n] as const', '  "entscheidung",\n  "neuer-rang",\n] as const'))
})
p(unsortiert.code === 1, "ein nicht eingeordneter Rang bricht den Build",
  "eine Last, die niemand zaehlt, ist gesunken")

/* e · Der Mindestabstand wird heruntergesetzt. */
const ungeduldig = angriff(({ lies, schreib }) => {
  const t = lies("lib/ownerlast.ts")
  schreib("lib/ownerlast.ts", t.replace("export const MIND_ABSTAND_TAGE = 28", "export const MIND_ABSTAND_TAGE = 7"))
})
p(ungeduldig.code === 1, "ein gesenkter Mindestabstand bricht den Build",
  "Ungeduld ist kein Messfehler, den man wegkonfiguriert")

/* f · Die Messreihe wird zum Betriebsteil erklaert. */
const pflicht = angriff(({ lies, schreib }) => {
  const t = lies("lib/neon-client.ts")
  schreib("lib/neon-client.ts", t.replace('  "research_evidence",\n] as const', '  "research_evidence",\n  "owner_load_samples",\n] as const'))
})
p(pflicht.code === 1, "das Messinstrument darf den Betrieb nicht anhalten")

/* ── O2 · Zu dicht ──────────────────────────────────────────────────────── */
console.log("\nO2 · Unter dem Mindestabstand sagt das Gate nichts")
const knapp = O.vergleich(m("2026-09-01", { ueberfaellig: 20 }), m("2026-09-27", { ueberfaellig: 2 }))
p(!knapp.aussagekraeftig, `26 Tage reichen nicht (${O.MIND_ABSTAND_TAGE} verlangt)`)
p(knapp.urteil === "nicht-aussagekraeftig", "und es gibt kein Urteil")
p(knapp.abnehmbarDelta === null, "auch keine Zahl, die jemand zitieren koennte",
  "eine genannte Zahl neben „nicht aussagekraeftig“ wird zitiert, der Satz nicht")
p(!knapp.erfolg, "und kein Erfolg")
p(knapp.abstandTage === 26, "der echte Abstand steht trotzdem da")

const rueckwaerts = O.vergleich(m("2026-09-30", { ueberfaellig: 1 }), m("2026-09-01", { ueberfaellig: 9 }))
p(!rueckwaerts.aussagekraeftig, "eine rueckwaerts laufende Reihe ergibt nichts")

/* ── O3 · Weit genug ────────────────────────────────────────────────────── */
console.log("\nO3 · Ab dem Mindestabstand ist ein Vergleich moeglich")
const genau = O.vergleich(m("2026-09-01", { ueberfaellig: 20 }), m("2026-09-29", { ueberfaellig: 12 }))
p(genau.abstandTage === 28, "genau 28 Tage")
p(genau.aussagekraeftig, "und der Vergleich wird gefuehrt")
p(genau.urteil === "gesunken" && genau.abnehmbarDelta === -8, "die abnehmbare Last ist um 8 gefallen")

/* ── O4 · Vertrieb nicht lesbar ─────────────────────────────────────────── */
console.log("\nO4 · Ein nicht gelesener Vertrieb ist keine leere Pipeline")
const blind = O.vergleich(
  m("2026-08-01", { ueberfaellig: 20, entscheidung: 3 }),
  m("2026-09-15", { ueberfaellig: 0, entscheidung: 0 }, false),
)
p(!blind.aussagekraeftig, "die Messung ohne Vertrieb taugt nicht als Vergleichspunkt")
p(/nicht gemessen/i.test(blind.grund), "und der Grund sagt genau das")
p(!blind.erfolg, "ein Datenbankausfall ist kein Automationserfolg")
p(O.last(m("2026-09-15", {}, false)).gesamt === 0 && !m("2026-09-15", {}, false).vertriebGemessen,
  "die Null steht da, aber sie traegt ihr Etikett",
  "`last()` rechnet; ob gerechnet werden durfte, sagt `vertriebGemessen`")

/* ── O5 · Teilmessung und fehlende Reihe ────────────────────────────────── */
console.log("\nO5 · Keine Reihe ist etwas anderes als eine leere Reihe")
const unlesbar = O.auswertung(null)
p(!unlesbar.aussagekraeftig, "eine nicht lesbare Reihe ergibt kein Urteil")
p(/nicht lesbar/i.test(unlesbar.grund), "und sagt, dass sie nicht lesbar war")
const leer = O.auswertung([])
p(!leer.aussagekraeftig, "eine leere Reihe auch nicht")
p(/keine zwei Messungen/i.test(leer.grund), "aber mit dem anderen Grund",
  "„noch nicht gemessen“ und „nicht lesbar“ duerfen nicht denselben Satz bekommen")
p(unlesbar.grund !== leer.grund, "die beiden Saetze sind wirklich verschieden")
const einzeln = O.auswertung([m("2026-09-01", { ueberfaellig: 5 })])
p(!einzeln.aussagekraeftig, "eine einzelne Messung ist ein Zustand, kein Verlauf")

/* ── O6 · Determinismus ─────────────────────────────────────────────────── */
console.log("\nO6 · Dieselbe Reihe ergibt dasselbe Ergebnis")
const reihe = [
  m("2026-07-01", { ueberfaellig: 30, entscheidung: 4 }),
  m("2026-08-01", { ueberfaellig: 22, entscheidung: 4 }),
  m("2026-09-01", { ueberfaellig: 14, entscheidung: 4 }),
]
const a1 = JSON.stringify(O.auswertung(reihe))
const a2 = JSON.stringify(O.auswertung([...reihe].reverse()))
p(a1 === a2, "auch in umgekehrter Reihenfolge")
p(a1 === JSON.stringify(O.auswertung([...reihe])), "und beim zweiten Mal")
p(O.messungId("2026-09-01") === O.messungId("2026-09-01"), "dieselbe Kennung fuer denselben Tag")
p(O.messungId("2026-09-01") !== O.messungId("2026-09-02"), "und eine andere fuer einen anderen")
p(O.paar(reihe).frueh.am === "2026-08-01",
  "verglichen wird mit der juengsten Messung, die weit genug zurueckliegt",
  "die aelteste zu nehmen liesse den Zeitraum mit jeder Messung wachsen")
p(O.paar(reihe).spaet.am === "2026-09-01", "und immer gegen die juengste")

/* Die juengste Messung ist unbrauchbar — die Wahl darf sie nicht ueberspringen. */
const mitAusfall = [...reihe, m("2026-09-20", { ueberfaellig: 0, entscheidung: 0 }, false)]
p(O.paar(mitAusfall).spaet.am === "2026-09-20", "ein Ausfall verschiebt das Fenster nicht")
p(!O.auswertung(mitAusfall).aussagekraeftig, "er verhindert die Aussage, statt sie umzuleiten")

/* ── O7 · Weniger Posten wegen Datenverlust ─────────────────────────────── */
console.log("\nO7 · Weniger Entscheidungen sind nicht automatisch weniger Arbeit")
const torFort = O.vergleich(
  m("2026-08-01", { ueberfaellig: 20, entscheidung: 5 }),
  m("2026-09-01", { ueberfaellig: 12, entscheidung: 0 }),
)
p(torFort.aussagekraeftig, "der Vergleich ist zulaessig")
p(torFort.urteil === "gesunken", "und die abnehmbare Last ist gefallen")
p(torFort.warnung !== null, "aber die unabnehmbare Last ist mitgefallen")
p(!torFort.erfolg, "und damit ist das KEIN Automationserfolg",
  "der billigste Weg, die Kurve zu senken, ist eine abgeschaffte Entscheidung")
p(/check-ownerlast/.test(torFort.warnung), "die Warnung sagt, womit man es prueft")

/* ── O8 · Echte Entlastung ──────────────────────────────────────────────── */
console.log("\nO8 · Echte Entlastung bleibt messbar")
const echt = O.vergleich(
  m("2026-08-01", { ueberfaellig: 20, "ohne-schritt": 6, entscheidung: 4 }),
  m("2026-09-01", { ueberfaellig: 9, "ohne-schritt": 2, entscheidung: 4 }),
)
p(echt.aussagekraeftig && echt.urteil === "gesunken", "die abnehmbare Last ist gefallen")
p(echt.unabnehmbarDelta === 0, "die Tore stehen unveraendert")
p(echt.warnung === null, "keine Warnung")
p(echt.erfolg, "DAS darf als Entlastung berichtet werden")

const gestiegen = O.vergleich(
  m("2026-08-01", { ueberfaellig: 9, entscheidung: 4 }),
  m("2026-09-01", { ueberfaellig: 20, entscheidung: 4 }),
)
p(gestiegen.urteil === "gestiegen" && !gestiegen.erfolg, "und eine gestiegene Last ist keiner")

/* ── O9 · Die Messreihe in einer echten Datenbank ──────────────────────── */
console.log("\nO9 · Die Reihe haelt, was die Spalten versprechen")

/*
 * Gegen eine Wegwerf-Datenbank, mit den SQL-Zeilen aus `lib/neon-client.ts` —
 * denselben, die in Produktion laufen. Ein Probelauf, der die Abfrage
 * nachbaut, prueft seinen Nachbau.
 */
const ZIEL = process.env.OWNERLAST_DRILL_URL || "postgres://localhost/drill_ownerlast"
requireSafeTarget(ZIEL, { zweck: "der Owner-Last-Probelauf" })

const N = await import("../lib/neon-client.ts")

/* Die Wegwerf-Datenbank anlegen, wenn es sie noch nicht gibt. */
const verbinde = async () => {
  const c = new pg.Client({ connectionString: ZIEL })
  await c.connect()
  return c
}
let client
try {
  client = await verbinde()
} catch (fehler) {
  if (!/does not exist/.test(String(fehler))) throw fehler
  const adresse = new URL(ZIEL)
  const name = adresse.pathname.slice(1)
  adresse.pathname = "/postgres"
  const admin = new pg.Client({ connectionString: adresse.href })
  await admin.connect()
  await admin.query(`CREATE DATABASE ${name}`)
  await admin.end()
  client = await verbinde()
}

const sql = { query: async (t, ps) => (await client.query(t, ps ?? [])).rows }

/* Vor der Migration: Die Reihe ist NICHT lesbar — und das ist kein leeres Ergebnis. */
await client.query("DROP TABLE IF EXISTS owner_load_samples")
let ohneTabelle = "kein Fehler"
try {
  await N.readOwnerLoadSamples(sql)
} catch {
  ohneTabelle = "Fehler"
}
p(ohneTabelle === "Fehler", "ohne Tabelle wirft der Zugriff, statt [] zu liefern",
  "haette er [] geliefert, waere eine fehlende Tabelle eine leere Arbeitsliste")

for (const stmt of N.SCHEMA) await client.query(stmt)

p((await N.readOwnerLoadSamples(sql)).length === 0, "nach der Migration ist die Reihe leer")

const zaehlungen = Object.fromEntries(O.ABNEHMBAR.concat(O.UNABNEHMBAR).map((r) => [r, 0]))
const T0 = { am: "2026-01-15", counts: { ...zaehlungen, ueberfaellig: 12, entscheidung: 3 }, vertriebGemessen: true, note: "Probelauf" }

p((await N.writeOwnerLoadSample(sql, T0)) === true, "die erste Messung wird angelegt")
p((await N.writeOwnerLoadSample(sql, T0)) === false, "dieselbe zweimal am selben Tag: nein",
  "zwei Wahrheiten ueber einen Tag, und die spaetere gewaenne")
p(
  (await N.writeOwnerLoadSample(sql, { ...T0, counts: { ...zaehlungen }, vertriebGemessen: false })) === false,
  "auch mit anderen Zahlen nicht — der Tag ist belegt",
  "sonst waere ein zweiter Lauf am Abend eine stille Korrektur des Vormittags",
)

const gelesen = await N.readOwnerLoadSamples(sql)
p(gelesen.length === 1, "genau eine Zeile")
p(gelesen[0].counts.ueberfaellig === 12 && gelesen[0].counts.entscheidung === 3, "die Zahlen kommen zurueck, wie sie hineingingen")
p(gelesen[0].vertriebGemessen === true, "und die Auskunft, ob der Vertrieb gelesen wurde")
p(gelesen[0].am === "2026-01-15", "der Tag ohne Zeitzonenverschiebung",
  "`date` als ISO-Zeichenkette gelesen, nicht ueber die Ortszeit des Servers")

/* Zweite Messung, weit genug entfernt — der Vergleich muss durch die echte Reihe gehen. */
await N.writeOwnerLoadSample(sql, {
  am: "2026-02-16", counts: { ...zaehlungen, ueberfaellig: 4, entscheidung: 3 }, vertriebGemessen: true, note: null,
})
const ausReihe = O.auswertung(await N.readOwnerLoadSamples(sql))
p(ausReihe.aussagekraeftig && ausReihe.urteil === "gesunken", "32 Tage spaeter ist die Reihe auswertbar")
p(ausReihe.erfolg, "und bei stehenden Toren ist es eine echte Entlastung")

const spalten = (await client.query(
  `SELECT column_name, is_nullable, column_default FROM information_schema.columns
    WHERE table_name = 'owner_load_samples'`,
)).rows
const sm = spalten.find((c) => c.column_name === "sales_measured")
p(sm && sm.is_nullable === "NO" && sm.column_default === null,
  "`sales_measured` ist NOT NULL und hat keinen Default",
  "ein Default waere derselbe Fehler mit besserem Gewissen")
p(!spalten.some((c) => /trend|entlastung|prozent|delta|score/i.test(c.column_name)),
  "keine Spalte speichert ein Urteil")

await client.query("DROP TABLE IF EXISTS owner_load_samples")
await client.end()

/* ── Was die Zahl nicht sagt ────────────────────────────────────────────── */
console.log("\nO10 · Die Grenzen stehen neben der Zahl")
p(O.SAGT_NICHTS_UEBER.length >= 4, `${O.SAGT_NICHTS_UEBER.length} Saetze zu dem, was sie nicht misst`)
p(O.ENTSCHEIDUNGSTORE.every((t) => /^G\d+$/.test(t.gate)), "jedes Tor nennt sein Gate")
p(O.ENTSCHEIDUNGSTORE.every((t) => t.art === "funktion" || t.art === "liste"),
  "und wie es geprueft wird")

console.log(
  fehler === 0
    ? "\nOwner-Last-Probelauf bestanden. Die Messung kann nicht durch Wegnehmen besser werden.\n"
    : `\nOwner-Last-Probelauf: ${fehler} Fehler.\n`,
)
process.exit(fehler === 0 ? 0 : 1)
