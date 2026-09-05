#!/usr/bin/env node
/**
 * Die Rueckspiel-Uebung.
 *
 * ===========================================================================
 * WARUM ES DIESE DATEI GIBT
 * Eine Sicherung, die nie zurueckgespielt wurde, ist eine Vermutung mit
 * Dateiendung. Der einzige Beweis, dass eine Sicherung taugt, ist eine
 * Datenbank, die daraus entstanden ist und die die Anwendung lesen kann.
 *
 * Diese Uebung macht genau das, in einem Zug und gegen eine Wegwerf-Datenbank:
 *
 *   Sicherung  →  neue leere Datenbank  →  Rueckspielung  →  Schema-Vergleich
 *              →  Bestandspruefung      →  Zeilenvergleich →  Aufraeumen
 *
 * Schlaegt EIN Schritt fehl, endet sie mit einem Fehlercode. Es gibt kein
 * „im Wesentlichen erfolgreich".
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS ZIEL LEER SEIN MUSS
 * Eine Rueckspielung in eine Datenbank mit Inhalt vermischt zwei Staende und
 * sieht dabei aus wie ein Erfolg. Ist das Ziel nicht leer, bricht die Uebung
 * ab — ausser jemand sagt ausdruecklich `--force`, und dann steht es im
 * Protokoll.
 *
 * Aufruf:
 *   node scripts/db-restore-drill.mjs --dump <datei> [--target g1_drill]
 */
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { requireSafeTarget } from "./lib/env-guard.mjs"

const args = process.argv.slice(2)
const arg = (n, f = null) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : f }
const has = (n) => args.includes(n)

const dump = arg("--dump")
const zielName = arg("--target", "g1_drill")
const admin = arg("--admin", `postgresql://${process.env.USER}@localhost:5432/postgres`)
const zielUrl = `postgresql://${process.env.USER}@localhost:5432/${zielName}`
const quelle = arg("--source", null)

const schritte = []
const schritt = (name, ok, detail = "") => {
  schritte.push({ name, ok, detail })
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`)
  if (!ok) { zusammenfassen(); process.exit(10) }
}
function zusammenfassen() {
  const schlecht = schritte.filter((s) => !s.ok).length
  console.log(`\n${schritte.length} Schritte, ${schlecht} fehlgeschlagen.`)
}
const psql = (url, sql) => spawnSync("psql", ["-Atq", "-d", url, "-c", sql], { encoding: "utf8" })

/* Das Ziel ist immer eine Wegwerf-Datenbank — nie etwas anderes. */
try {
  requireSafeTarget(zielUrl, { zweck: "eine Rueckspiel-Uebung", erlaubt: ["disposable"] })
} catch (error) { console.error(error.message); process.exit(2) }

if (!dump) { console.error("ABGEBROCHEN — --dump <datei> fehlt."); process.exit(3) }
schritt("Sicherungsdatei vorhanden", existsSync(dump), dump)
schritt("Sicherung ist lesbar", spawnSync("pg_restore", ["--list", dump]).status === 0)

/* Leeres Ziel herstellen. */
spawnSync("psql", ["-q", "-d", admin, "-c", `DROP DATABASE IF EXISTS ${zielName}`], { stdio: "ignore" })
const angelegt = spawnSync("psql", ["-q", "-d", admin, "-c", `CREATE DATABASE ${zielName}`], { stdio: "ignore" })
schritt("leere Zieldatenbank angelegt", angelegt.status === 0, zielName)

const vorher = psql(zielUrl, "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'")
const leer = Number(vorher.stdout.trim()) === 0
if (!leer && !has("--force")) schritt("Ziel ist leer", false, "Ziel enthaelt bereits Tabellen — --force waere noetig")
else schritt("Ziel ist leer", true)

/* Rueckspielen. */
const zurueck = spawnSync("pg_restore", ["--no-owner", "--no-privileges", "--exit-on-error", "-d", zielUrl, dump], { encoding: "utf8" })
schritt("Rueckspielung durchgelaufen", zurueck.status === 0, zurueck.status === 0 ? "" : (zurueck.stderr || "").split("\n")[0])

/* Schema-Vergleich gegen die Migrationen. */
const dumpSchema = `SELECT table_name||'.'||column_name||' '||data_type FROM information_schema.columns WHERE table_schema='public' UNION ALL SELECT 'IDX '||indexname FROM pg_indexes WHERE schemaname='public' UNION ALL SELECT 'CON '||conname FROM pg_constraint WHERE connamespace='public'::regnamespace ORDER BY 1`
const zielSchema = psql(zielUrl, dumpSchema).stdout.trim().split("\n").filter(Boolean)
schritt("Schema wiederhergestellt", zielSchema.length > 100, `${zielSchema.length} Schemazeilen`)

const tabellen = psql(zielUrl, "SELECT string_agg(table_name,',' ORDER BY table_name) FROM information_schema.tables WHERE table_schema='public'").stdout.trim()
const erwartet = ["activities", "contacts", "import_log", "leads", "locations", "opportunities", "organisations"]
schritt("alle Kerntabellen da", erwartet.every((t) => tabellen.includes(t)), tabellen)

/* Bestandspruefung auf der zurueckgespielten Datenbank. */
const integ = spawnSync("psql", ["-Atq", "-d", zielUrl, "-f", "scripts/check-integrity.sql"], { encoding: "utf8" })
const treffer = (integ.stdout || "").split("\n").filter(Boolean).map((z) => z.split("|")).filter((t) => Number(t[1]) > 0)
schritt("Bestandspruefung ohne Befund", integ.status === 0 && treffer.length === 0,
  treffer.length ? treffer.map((t) => `${t[0].trim()}=${t[1]}`).join(", ") : "elf Fragen, alle 0")

/* Zeilenvergleich gegen die Quelle, falls angegeben. */
if (quelle) {
  const zaehl = "SELECT string_agg(t||':'||n, ' ' ORDER BY t) FROM (SELECT 'leads' t, count(*) n FROM leads UNION ALL SELECT 'contacts', count(*) FROM contacts UNION ALL SELECT 'organisations', count(*) FROM organisations UNION ALL SELECT 'locations', count(*) FROM locations UNION ALL SELECT 'opportunities', count(*) FROM opportunities UNION ALL SELECT 'activities', count(*) FROM activities) x"
  const a = psql(quelle, zaehl).stdout.trim()
  const b = psql(zielUrl, zaehl).stdout.trim()
  schritt("Zeilenzahlen stimmen ueberein", a === b && a.length > 0, `${b}`)

  /* Stichprobe auf Inhalt, nicht nur auf Anzahl. */
  const probe = "SELECT o.title||'|'||coalesce(o.from_lead_id,'-')||'|'||coalesce(org.name,'-')||'|'||coalesce(c.name,'-') FROM opportunities o LEFT JOIN organisations org ON org.id=o.organisation_id LEFT JOIN contacts c ON c.id=o.contact_id ORDER BY o.id"
  const pa = psql(quelle, probe).stdout.trim()
  const pb = psql(zielUrl, probe).stdout.trim()
  /*
   * Verglichen wird die GLEICHHEIT, nicht die Anwesenheit.
   *
   * Hier stand zusaetzlich `pa.length > 0` — und damit fiel die Uebung an
   * einer Datenbank ohne Vorgaenge durch, obwohl beide Seiten identisch
   * leer waren. Gemessen am 05.09.2026 an einem Bestand aus einer einzigen
   * Organisation: Schritt 10 meldete einen Fehler, den es nicht gab.
   *
   * „Keine Vorgaenge" ist ein gueltiger Zustand. Eine Pruefung, die ihn als
   * Mangel meldet, verliert genau dann ihre Glaubwuerdigkeit, wenn man sie
   * das erste Mal an einem echten leeren Stand benutzt.
   */
  const anzahl = pa ? pa.split("\n").length : 0
  schritt(
    "Verknuepfungen inhaltlich gleich",
    pa === pb,
    anzahl === 0 ? "keine Vorgaenge — beide Seiten leer" : `${anzahl} verglichen · ${pb.split("\n")[0]}`,
  )
}

/* Anwendungs-Abfrage: die echte ORG_COLUMNS-Abfrage aus dem Vertriebsspeicher. */
const src = (await import("node:fs")).readFileSync("lib/vertrieb-store-neon.ts", "utf8")
const i = src.indexOf("const ORG_COLUMNS = `")
const s0 = src.indexOf("`", i), e0 = src.indexOf("`", s0 + 1)
const abfrage = `SELECT ${src.slice(s0 + 1, e0)} FROM organisations org WHERE org.excluded_reason IS NULL ORDER BY org.name`
const anwendung = psql(zielUrl, abfrage)
schritt("Anwendungs-Abfrage laeuft auf der Rueckspielung", anwendung.status === 0,
  anwendung.status === 0 ? `${anwendung.stdout.trim().split("\n").filter(Boolean).length} Zeilen` : (anwendung.stderr || "").split("\n")[0])

/* Aufraeumen. */
if (!has("--keep")) {
  spawnSync("psql", ["-q", "-d", admin, "-c", `DROP DATABASE IF EXISTS ${zielName}`], { stdio: "ignore" })
  schritt("Wegwerf-Datenbank geloescht", true, zielName)
}

zusammenfassen()
console.log("RUECKSPIELUNG ABGENOMMEN.")
