#!/usr/bin/env node
/**
 * DAS KARRIERE-GATE
 *
 * ---------------------------------------------------------------------------
 * WORUM ES GEHT
 * Eine Karriereseite macht eine Aussage ueber den eigenen Betrieb, und die
 * teuerste Falschaussage dort ist die freundlichste: „Jetzt bewerben“ ueber
 * einer Stelle, die es nicht gibt. Wer darauf hereinfaellt, investiert Zeit
 * und wartet auf eine Antwort, die nie kommt.
 *
 * Deshalb pruefen die Regeln hier nicht das Aussehen, sondern die Wahrheit:
 *
 *   1. Kein `JobPosting` fuer Talent Pool oder geplante Rollen.
 *   2. Keine „Jetzt bewerben“-Aufforderung, solange keine Stelle offen ist.
 *   3. Keine Erfolgsmeldung, solange die Annahme nicht scharf ist.
 *   4. Bewerbungen tauchen nicht im Vertriebsbestand auf.
 *   5. Alle vier Sprachbaeume tragen alle vier Karriere-Seiten.
 *
 * Aufruf: `node scripts/check-karriere.mjs` (laeuft im `postbuild`).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const APP = path.join(ROOT, ".next", "server", "app")
const lies = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8")

const probleme = []
const karriere = lies("lib/karriere.ts")

/* ── 1 · Wie viele Rollen stehen auf „offen“? ───────────────────────────── */
const zustaende = [...karriere.matchAll(/^\s{4}zustand: "([a-z-]+)",$/gm)].map((m) => m[1])
const offene = zustaende.filter((z) => z === "offen").length
if (zustaende.length === 0) probleme.push("Keine Rolle in `lib/karriere.ts` gefunden — liest das Gate die richtige Datei?")

/* ── 2 · JobPosting nur bei echter offener Stelle ───────────────────────── */
const seiten = fs.existsSync(APP)
  ? fs
      .readdirSync(APP, { recursive: true })
      .filter((f) => typeof f === "string" && f.endsWith(".html") && f.includes("karriere"))
  : []

for (const datei of seiten) {
  const html = fs.readFileSync(path.join(APP, datei), "utf8")
  if (offene === 0 && /"@type"\s*:\s*"JobPosting"/.test(html)) {
    probleme.push(
      `${datei} liefert eine JobPosting-Auszeichnung, obwohl keine Rolle auf „offen“ steht. ` +
        "Ein Talent Pool ist keine Stelle — und einer Suchmaschine etwas zu melden, das man " +
        "einem Menschen nicht sagen wuerde, gibt sie an genau diese Menschen weiter.",
    )
  }
}

/* ── 3 · Keine Bewerben-Aufforderung ohne offene Stelle ─────────────────── */
/*
 * Gelesen wird der ZUSTANDSTEXT, nicht das Markup: Die Aufforderung entsteht
 * in `ZUSTANDS_TEXTE` und wird nirgends von Hand gesetzt. Faende sich der
 * offene Text im Talent-Pool-Eintrag, waere die Ableitung gebrochen.
 */
const talentPoolBlock = karriere.slice(
  karriere.indexOf('"talent-pool": {'),
  karriere.indexOf("geplant: {"),
)
if (/Jetzt bewerben|Apply now|Şimdi başvur/.test(talentPoolBlock)) {
  probleme.push(
    "Der Talent-Pool-Zustand traegt eine Bewerben-Aufforderung. Wer keine Stelle hat, " +
      "darf nicht zur Bewerbung auffordern.",
  )
}

/* ── 4 · Keine erfundene Bestaetigung ───────────────────────────────────── */
const annahmeAktiv = /export const bewerbungAnnahmeAktiv = true/.test(karriere)
const inhalt = lies("lib/karriere-inhalt.ts")
if (!annahmeAktiv) {
  const luegen = [
    "erfolgreich gespeichert",
    "Bewerbung eingegangen",
    "Vielen Dank für Ihre Bewerbung",
    "wurde übermittelt",
  ]
  for (const luege of luegen) {
    if (inhalt.includes(luege)) {
      probleme.push(
        `„${luege}“ steht im Karriere-Text, obwohl bewerbungAnnahmeAktiv false ist. ` +
          "Eine Bestaetigung ohne Empfaenger ist die teuerste Luege dieser Seite.",
      )
    }
  }
}

/* ── 5 · Bewerbungen gehoeren nicht in den Vertriebsbestand ─────────────── */
const bewerbungsCode = [
  "components/karriere/bewerbung.tsx",
  "lib/karriere.ts",
  "app/_routes/karriere.tsx",
]
/*
 * Kommentare werden vorher entfernt. Beim ersten Lauf schlug diese Regel an —
 * auf den Kommentar in `lib/karriere.ts`, der genau SIE begruendet. Ein Gate,
 * das die Erklaerung seiner eigenen Regel als Verstoss meldet, misst den Text
 * und nicht den Code; derselbe Fehler ist im Ownerlast-Gate schon einmal
 * aufgetreten.
 */
const ohneKommentare = (quelle) =>
  quelle.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ")

for (const datei of bewerbungsCode) {
  const quelle = ohneKommentare(lies(datei))
  for (const tabelle of ["leads", "opportunities", "organisations", "contacts"]) {
    if (new RegExp(`\\b${tabelle}\\b`).test(quelle)) {
      probleme.push(
        `${datei} nennt die Vertriebstabelle \`${tabelle}\`. Ein Mensch, der sich bewirbt, ` +
          "ist kein Lead — beide Wahrheiten verderben, wenn sie im selben Bestand liegen.",
      )
    }
  }
}

/* ── 6 · Vier Seiten in vier Sprachbaeumen ──────────────────────────────── */
const BAEUME = { de: "app/(de)", tr: "app/(tr)/tr", en: "app/(en)/en", ar: "app/(ar)/ar" }
const PFADE = ["karriere", "karriere/dach-business-development", "karriere/founding-talent", "karriere/bewerben"]
for (const [sprache, wurzel] of Object.entries(BAEUME)) {
  for (const pfad of PFADE) {
    const datei = path.join(ROOT, wurzel, pfad, "page.tsx")
    if (!fs.existsSync(datei)) {
      probleme.push(`${sprache}: /${pfad} fehlt. Keine Sprache bekommt eine halbe Karriereseite.`)
    }
  }
}

/* ── Ausgabe ────────────────────────────────────────────────────────────── */
console.log(
  `\nKarriere-Gate — ${zustaende.length} Rolle(n), davon ${offene} offen · ` +
    `Annahme ${annahmeAktiv ? "scharf" : "nicht scharf"} · ${seiten.length} gebaute Seiten geprueft`,
)

if (probleme.length > 0) {
  console.error("\nKarriere-Gate: die Seite sagt etwas anderes als die Daten.\n")
  for (const p of probleme) console.error(`  ${p}`)
  console.error(
    "\nBei einer Karriereseite faellt eine Falschaussage nicht beim Testen auf,\n" +
      "sondern bei einem Menschen, der seine Zeit investiert hat.\n",
  )
  process.exit(1)
}

console.log(
  offene === 0
    ? "OK — kein JobPosting, keine Bewerben-Aufforderung, keine erfundene Bestaetigung.\n"
    : "OK — offene Stelle(n) vorhanden, Auszeichnung und Aufforderung zulaessig.\n",
)
