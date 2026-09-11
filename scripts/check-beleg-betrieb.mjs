/*
 * ===========================================================================
 * BELEG-BETRIEB-GATE — DIE GRENZE ZWISCHEN INNEN UND ÖFFENTLICH
 * ===========================================================================
 *
 * PROOF OPERATIONS · PHASE P1, 11.09.2026.
 *
 * Der Beleg-Betrieb fuehrt absichtlich Dinge, die niemand sehen soll: welcher
 * Kunde noch nicht zugestimmt hat, welche Aufnahme echte Daten zeigt, was der
 * Owner noch bestaetigen muss, welche Messung erst begonnen hat.
 *
 * Das ist genau die Sorte Wissen, die in einem RSC-Payload landet, wenn
 * jemand ein Objekt an eine Client-Komponente reicht statt der zwei Felder,
 * die sie braucht — der „achte Weg" aus Gate 02, an dem schon einmal ein
 * zurueckgehaltenes Produktbild im ausgelieferten HTML stand, obwohl es
 * nirgends gerendert wurde.
 *
 * Dieses Gate liest deshalb das GEBAUTE HTML und sucht nach dem, was dort
 * nicht sein darf. Es prueft nicht, ob der Beleg-Betrieb schoen ist. Es
 * prueft, ob er dichthaelt.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { assets, darfOeffentlich } from "@/lib/asset-sicherheit"
import { alleWahrheiten, traegtAussage } from "@/lib/owner-wahrheit"
import { fiberoKennzahlen, HISTORISCHER_VORHERSTAND_VORHANDEN } from "@/lib/fibero-messung"
import { belegposten, naechsteSchritte, wirksamsterSchritt } from "@/lib/beleg-betrieb"
import { fiberoText } from "@/lib/fibero-beleg"
import { approvedCaseStudies, caseStudies, genannteClientWorks } from "@/lib/site-data"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const APP_DIR = path.join(ROOT, ".next", "server", "app")
const probleme = []
const hinweise = []

function htmlDateien(dir) {
  let e = []
  try {
    e = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const out = []
  for (const x of e) {
    const voll = path.join(dir, x.name)
    if (x.isDirectory()) out.push(...htmlDateien(voll))
    else if (x.name.endsWith(".html")) out.push(voll)
  }
  return out
}

/*
 * Das Control Center ist nicht oeffentlich — es liegt hinter `middleware.ts`.
 * Seine Seiten duerfen und muessen genau das enthalten, was oeffentlich nicht
 * sein darf. Sie werden deshalb ausgenommen; alles andere nicht.
 */
const alle = htmlDateien(APP_DIR).map((d) => ({
  kurz: path.relative(APP_DIR, d).replace(/\\/g, "/"),
  text: fs.readFileSync(d, "utf8"),
}))
const seiten = alle.filter((s) => !s.kurz.startsWith("admin/") && s.kurz !== "admin.html")

if (alle.length === 0) {
  console.log("Beleg-Betrieb-Gate — kein gebautes HTML gefunden, uebersprungen.\n")
  process.exit(0)
}

/* ---------------------------------------------------------------------------
 * 1 · KEIN GESPERRTES MATERIAL IM AUSGELIEFERTEN HTML
 *
 * Nicht nur „wird nicht gerendert" — nicht einmal der Pfad. Ein Pfad im
 * Payload ist eine Adresse, und eine Adresse ist abrufbar.
 */
for (const a of assets.filter((x) => !darfOeffentlich(x.lage))) {
  if (!a.datei) continue
  for (const s of seiten) {
    if (s.text.includes(a.datei) || s.text.includes(encodeURIComponent(a.datei))) {
      probleme.push(`${s.kurz}: Pfad einer gesperrten Aufnahme (${a.subjekt} · ${a.datei}).`)
    }
  }
}

/* ---------------------------------------------------------------------------
 * 2 · KEIN KUNDENNAME OHNE FREIGABE
 *
 * Die Namen stehen im Repository — sie mussten irgendwo stehen, damit
 * jemand spaeter eine Freigabe dazu eintragen kann. Genau deshalb ist der
 * Weg von dort in eine ausgelieferte Seite ein Handgriff.
 */
const ohneFreigabe = caseStudies
  .filter((c) => !approvedCaseStudies.some((a) => a.slug === c.slug))
  .map((c) => c.client)
for (const name of ohneFreigabe) {
  for (const s of seiten) {
    if (s.text.includes(name)) {
      probleme.push(`${s.kurz}: nennt „${name}" — kein freigegebener Kundenfall.`)
    }
  }
}

/* ---------------------------------------------------------------------------
 * 3 · KEINE INTERNEN BELEG-FELDER IM PAYLOAD
 *
 * Was fehlt, wer blockiert und wo eine Bestaetigung liegt, ist Innensicht.
 * Geprueft werden die tatsaechlichen Saetze aus dem Modell — nicht ein
 * Stichwort, das zufaellig auch in einem Fliesstext vorkommen koennte.
 */
const interneSaetze = [
  ...naechsteSchritte([]).map((p) => p.fehlt),
  ...alleWahrheiten.map((w) => w.aufloesungDurch),
  ...alleWahrheiten.map((w) => w.gibtFrei),
  ...assets.map((a) => a.fehlt),
  ...belegposten([]).map((p) => p.wirkung),
].filter((x) => typeof x === "string" && x.length > 40)

for (const satz of new Set(interneSaetze)) {
  for (const s of seiten) {
    if (s.text.includes(satz)) {
      probleme.push(`${s.kurz}: interner Beleg-Satz im ausgelieferten HTML — „${satz.slice(0, 60)}…"`)
    }
  }
}

/* ---------------------------------------------------------------------------
 * 4 · KEIN VORHER, DAS ES NIE GAB
 */
if (!HISTORISCHER_VORHERSTAND_VORHANDEN) {
  const VORHER = [
    /vor fibero/i,
    /before fibero/i,
    /fibero'?dan önce/i,
    /قبل fibero/i,
    /früher (waren|brauchte|dauerte)/i,
    /\d+\s*(Schritte|Minuten|Stunden)\s*(vorher|früher)/i,
  ]
  /*
   * Zwei Saetze des Belegs enthalten „vor fibero" mit Absicht — sie
   * VERNEINEN den Zustand: „Der Zustand vor fibero wurde nicht erhoben,
   * deshalb steht hier keine Ersparnis." Ein Gate, das sie verbietet,
   * bestraft genau die Ehrlichkeit, die es durchsetzen soll.
   *
   * Derselbe Fehler ist in Phase 3 schon einmal passiert, dort mit der
   * Kundensprache. Deshalb hier von vornherein: erst die eigenen
   * Verneinungen herausschneiden, dann pruefen, was uebrig bleibt.
   */
  const VERNEINUNGEN = ["de", "tr", "en", "ar"].flatMap((l) => [
    fiberoText.messenNote[l],
    fiberoText.wirkungOffen[l],
    fiberoText.reibungNote[l],
  ])
  for (const s of seiten) {
    const ohneVerneinung = VERNEINUNGEN.reduce((t, satz) => t.split(satz).join(" "), s.text)
    for (const m of VORHER) {
      if (m.test(ohneVerneinung)) {
        probleme.push(
          `${s.kurz}: behauptet einen Zustand vor fibero (${m.source}). Es gibt keine Aufzeichnung davon.`,
        )
      }
    }
  }
}

/* ---------------------------------------------------------------------------
 * 5 · KEINE KENNZAHL AUS DER MESSREIHE AUF EINER ÖFFENTLICHEN SEITE
 *
 * Solange keine Probe erhoben ist, hat keine dieser Kennzahlen einen Wert.
 * Erscheint ihr Schluessel trotzdem draussen, hat jemand eine Zahl
 * vorweggenommen.
 */
for (const k of fiberoKennzahlen) {
  for (const s of seiten) {
    if (s.text.includes(k.key)) {
      probleme.push(`${s.kurz}: nennt die Kennzahl „${k.key}", bevor sie erhoben ist.`)
    }
  }
}

/* ---------------------------------------------------------------------------
 * 6 · EINE BESTÄTIGUNG OHNE FUNDSTELLE GIBT ES NICHT
 */
for (const w of alleWahrheiten) {
  if (traegtAussage(w.stand) && (!w.fundstelle || !w.bestaetigtAm)) {
    probleme.push(`${w.key}: gilt als bestätigt, aber ohne Fundstelle oder Datum.`)
  }
}

/* ---------------------------------------------------------------------------
 * 7 · DIE ÖFFENTLICHE ZAHL MUSS DER FREIGABELAGE ENTSPRECHEN
 */
if (approvedCaseStudies.length !== 0 || genannteClientWorks.length !== 0) {
  hinweise.push(
    `Es gibt jetzt ${approvedCaseStudies.length} freigegebene Fallstudie(n) und ` +
      `${genannteClientWorks.length} genannte Kundenarbeit(en). ` +
      `/arbeiten kehrt damit ohne Code-Aenderung in Index und Sitemap zurueck.`,
  )
}

/* ---------------------------------------------------------------------------
 * 8 · DAS COCKPIT MUSS DIE EINE FRAGE BEANTWORTEN
 *
 * Kein Stiltest: Wenn `wirksamsterSchritt()` nichts zurueckgibt, obwohl
 * Posten offen sind, ist die Reihenfolge kaputt — und dann ist die Ansicht
 * wieder nur eine Liste.
 */
const offen = naechsteSchritte([])
const erster = wirksamsterSchritt([])
if (offen.length > 0 && !erster) {
  probleme.push("Es sind Posten offen, aber kein wirksamster Schritt wird benannt.")
}
if (erster && (!erster.fehlt || !erster.wirkung)) {
  probleme.push("Der wirksamste Schritt nennt nicht, was fehlt und was er freigibt.")
}

/* ---------------------------------------------------------------------------
 * BERICHT
 */
const gesperrt = assets.filter((a) => !darfOeffentlich(a.lage)).length
const offeneWahrheit = alleWahrheiten.filter((w) => !traegtAussage(w.stand)).length

console.log(
  `\nBeleg-Betrieb-Gate — ${seiten.length} oeffentliche Seiten · ` +
    `${approvedCaseStudies.length} freigegebene Kundenfaelle · ` +
    `${gesperrt} gesperrte Aufnahme(n) · ${offeneWahrheit} offene Owner-Tatsache(n) · ` +
    `${fiberoKennzahlen.length} Kennzahlen definiert`,
)

if (probleme.length > 0) {
  console.error(
    `FEHL — ${probleme.length} Stelle(n):` +
      probleme.map((p) => `\n  ${p}`).join("") +
      "\n\nWas nach draussen geht, kommt nicht zurueck.\n",
  )
  process.exit(1)
}

if (erster) {
  hinweise.push(`Wirksamster naechster Schritt: ${erster.subjekt} — liegt bei ${erster.liegtBei}.`)
}
for (const h of hinweise) console.log(h)
console.log("OK — kein gesperrtes Material, kein ungenannter Kunde, keine vorweggenommene Zahl.\n")
