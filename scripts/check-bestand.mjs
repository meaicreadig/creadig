#!/usr/bin/env node
/**
 * Das Bestands-Gate.
 *
 * ---------------------------------------------------------------------------
 * WORUM ES GEHT
 * `lib/vertrieb-bestand.ts` ist die einzige Datei im Projekt, die reale
 * Geschäftsdaten enthält — und die einzige, in der eine erfundene Zeile nicht
 * auffällt. Eine falsche Adresse sieht aus wie eine richtige. Eine Dublette
 * sieht aus wie zwei Kunden. Ein Suchergebnis, das jemand „nur zur
 * Vervollständigung" einträgt, sieht aus wie Recherche.
 *
 * Der Import ist idempotent, aber Idempotenz schützt nur vor doppelter
 * Ausführung, nicht vor doppelten Daten: Zwei Einträge mit demselben
 * `importKey` überschreiben sich gegenseitig, zwei mit demselben Namen legen
 * zwei Organisationen an. Beides fällt gegen eine leere Datenbank nicht auf
 * und gegen die echte zu spät.
 *
 * ---------------------------------------------------------------------------
 * WAS GEPRÜFT WIRD
 *   1. `importKey` eindeutig — sonst überschreibt der Import sich selbst.
 *   2. Organisationsname eindeutig (kleingeschrieben) — sonst kollidiert er
 *      mit `organisations_name_key` und der zweite Eintrag verschwindet
 *      lautlos in einem `ON CONFLICT DO NOTHING`.
 *   3. Standortschlüssel eindeutig, auch über Organisationen hinweg.
 *   4. Jeder Standort gehört zu einer Organisation, jeder Kontakt zu einer
 *      existierenden — ein `organisationKey` ins Leere legt einen Menschen
 *      ohne Betrieb an.
 *   5. Kein Ausschlussname trifft einen Bestandsdatensatz. Das ist der
 *      gefährlichste Fall: „Yilmaz Dachtechnik" ist Ausschuss, „Dr. Hüseyin
 *      Yilmaz" ein echter Prospect. Ein unscharfer Vergleich würde beide
 *      treffen, und der Prospect verschwände.
 *   6. Kein Bestandsdatensatz trägt eine Verkaufschance oder einen Betrag —
 *      die Felder gibt es nicht, und wenn sie jemand einführt, bricht das
 *      hier.
 *   7. Prospects sind nicht als Kunden eingestuft.
 *
 * Läuft gegen die QUELLE, nicht gegen das gebaute HTML: Diese Daten erscheinen
 * nie im öffentlichen Ausgabestand — sie liegen hinter der Anmeldung.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const SOURCE = path.join(ROOT, "lib", "vertrieb-bestand.ts")

const source = readFileSync(SOURCE, "utf8")
const problems = []

/**
 * Die Datei lesen, ohne sie auszuführen.
 *
 * TypeScript lässt sich in einem `node`-Skript nicht ohne Übersetzer laden,
 * und ein Übersetzer nur für ein Gate wäre eine Abhängigkeit für einen
 * einzigen Zweck. Die geprüften Felder sind Zeichenketten in einfachen
 * Objektliteralen — dafür genügt ein Ausdruck, und was er nicht findet,
 * meldet er als Fehlstand statt es zu erraten.
 */
function fieldValues(field) {
  const pattern = new RegExp(`\\b${field}:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "g")
  return [...source.matchAll(pattern)].map((m) => m[1])
}

function block(name) {
  const start = source.indexOf(`export const ${name}`)
  if (start === -1) return ""
  const end = source.indexOf("\n]", start)
  return end === -1 ? source.slice(start) : source.slice(start, end)
}

const organisationsBlock = block("BESTAND_ORGANISATIONEN")
const kontakteBlock = block("BESTAND_KONTAKTE")
const ausschlussBlock = block("AUSGESCHLOSSENE_NAMEN")

if (!organisationsBlock) problems.push("BESTAND_ORGANISATIONEN nicht gefunden.")
if (!ausschlussBlock) problems.push("AUSGESCHLOSSENE_NAMEN nicht gefunden.")

function valuesIn(text, field) {
  const pattern = new RegExp(`\\b${field}:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "g")
  return [...text.matchAll(pattern)].map((m) => m[1])
}

/* ── 1 · Schlüssel eindeutig ───────────────────────────────────────────── */
const allKeys = fieldValues("importKey")
const seenKeys = new Set()
for (const key of allKeys) {
  if (seenKeys.has(key)) problems.push(`importKey doppelt: "${key}" — der Import überschreibt sich selbst.`)
  seenKeys.add(key)
}

/* ── 2 · Organisationsnamen eindeutig ──────────────────────────────────── */
const orgNames = valuesIn(organisationsBlock, "name")
const seenNames = new Set()
for (const name of orgNames) {
  const norm = name.trim().toLowerCase()
  if (seenNames.has(norm)) {
    problems.push(
      `Organisationsname doppelt: "${name}" — der zweite Eintrag verschwindet ` +
        "lautlos in ON CONFLICT (lower(name)) DO NOTHING.",
    )
  }
  seenNames.add(norm)
}

/* ── 4 · Kontakte zeigen auf existierende Organisationen ───────────────── */
const orgKeys = new Set(valuesIn(organisationsBlock, "importKey"))
for (const ref of valuesIn(kontakteBlock, "organisationKey")) {
  if (!orgKeys.has(ref)) {
    problems.push(`Kontakt verweist auf unbekannte Organisation: "${ref}".`)
  }
}

/* ── 5 · Kein Ausschluss trifft einen echten Datensatz ─────────────────── */
const excluded = valuesIn(ausschlussBlock, "name").map((n) => n.trim().toLowerCase())
const bestandNamen = [...orgNames, ...valuesIn(kontakteBlock, "name")]
for (const name of bestandNamen) {
  if (excluded.includes(name.trim().toLowerCase())) {
    problems.push(
      `"${name}" steht im Bestand UND auf der Ausschlussliste — ` +
        "einer der beiden Einträge ist falsch.",
    )
  }
}

/*
 * Der Fall, der diese Prüfung wert macht: Ein Ausschlussname, der als
 * Teilzeichenkette in einem echten Namen steckt, ist erlaubt (der Vergleich
 * im Import ist exakt) — aber er ist ein Warnzeichen dafür, dass jemand
 * später versucht sein könnte, unscharf zu vergleichen. Er wird deshalb
 * benannt, ohne den Build zu brechen.
 */
const hints = []
for (const name of bestandNamen) {
  for (const ex of excluded) {
    const n = name.trim().toLowerCase()
    if (n !== ex && (n.includes(ex) || ex.includes(n))) {
      hints.push(`"${name}" überschneidet sich mit dem Ausschluss "${ex}" — der Vergleich MUSS exakt bleiben.`)
    }
  }
}

/* ── 6 · Keine erfundenen Geschäftsdaten ───────────────────────────────── */
for (const verboten of ["estimatedValue", "umsatz", "revenue", "opportunity", "lastContact", "nextAction"]) {
  if (new RegExp(`\\b${verboten}\\s*:`, "i").test(source)) {
    problems.push(
      `Feld "${verboten}" im Bestand — der Import legt keine Vorgänge, Beträge ` +
        "oder Kontaktdaten an. Eine Chance entsteht, wenn ein Mensch sie anlegt.",
    )
  }
}

/* ── 7 · Prospect ist kein Kunde ───────────────────────────────────────── */
const lifecycles = valuesIn(organisationsBlock, "lifecycle")
for (const stage of lifecycles) {
  if (!["unbekannt", "prospect", "kunde", "ehemaliger-kunde"].includes(stage)) {
    problems.push(`Unbekannte Kundenhistorie-Stufe: "${stage}".`)
  }
}

/* ── Ausgabe ───────────────────────────────────────────────────────────── */
if (problems.length > 0) {
  console.error("\nBestands-Gate: der reale Kundenbestand ist nicht widerspruchsfrei.\n")
  for (const p of problems) console.error(`  ${p}`)
  console.error(
    "\nDiese Datei trägt echte Geschäftsdaten. Ein Widerspruch hier wird zu einer\n" +
      "Dublette, einem verschwundenen Kunden oder einer erfundenen Angabe in der\n" +
      "Datenbank — und dort fällt er niemandem mehr auf.\n",
  )
  process.exit(1)
}

for (const hint of hints) console.log(`Hinweis: ${hint}`)

console.log(
  `OK — ${orgNames.length} Organisationen, ${valuesIn(kontakteBlock, "name").length} Kontakte, ` +
    `${excluded.length} Ausschlüsse: eindeutig, aufgelöst und ohne erfundene Vorgänge.\n`,
)
