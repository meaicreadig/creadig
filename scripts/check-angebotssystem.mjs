/*
 * ===========================================================================
 * ANGEBOTS- UND BELEG-GATE
 * ===========================================================================
 *
 * PHASE 2 + 3 · COMMERCIAL COMPLETION, 11.09.2026.
 *
 * Drei Dinge, die eine Website leise kaputtmachen koennen, sobald jemand
 * „verkaufsfaehiger" sagt:
 *
 *   1 · Ein Preis entsteht irgendwo neu. Nicht boeswillig — jemand tippt
 *       „ab 15.000 EUR" in eine Ueberschrift, weil die Luecke sonst so leer
 *       wirkt. Danach steht eine Zahl auf der Seite, die niemand halten muss.
 *
 *   2 · Ein eigener Betriebsbeleg rutscht in Kundensprache. Aus „unser
 *       System" wird „ein Projekt", aus „ein Projekt" eine „Referenz" — und
 *       am Ende steht ein Kundenfall da, den es nicht gibt.
 *
 *   3 · Ein Rechner bekommt Beispielwerte. Beim Aufruf zeigt er eine Zahl,
 *       die niemand eingegeben hat, und jeder liest sie als Benchmark.
 *
 * Dieses Gate haelt alle drei fest. Es liest das GEBAUTE HTML, weil das die
 * einzige Fassung ist, die ein Besucher zu sehen bekommt.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { angebote, gefuehrteBetraege, angebotText, kaufwege } from "@/lib/kaufwege"
import { fiberoAussagen, fiberoHatMessung, fiberoMesspunkte, fiberoText } from "@/lib/fibero-beleg"
import { rechnerText } from "@/lib/rechner-text"
import { packages, retainer } from "@/lib/site-data"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const APP_DIR = path.join(ROOT, ".next", "server", "app")
const LOCALES = ["de", "tr", "en", "ar"]
const probleme = []
const hinweise = []

function htmlDateien(dir) {
  let eintraege = []
  try {
    eintraege = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const gefunden = []
  for (const e of eintraege) {
    const voll = path.join(dir, e.name)
    if (e.isDirectory()) gefunden.push(...htmlDateien(voll))
    else if (e.name.endsWith(".html")) gefunden.push(voll)
  }
  return gefunden
}

/*
 * Next escapt im ausgelieferten HTML mindestens Apostroph, Anfuehrungszeichen
 * und kaufmaennisches Und. Ein Gate, das `includes("fibero'nun")` prueft,
 * findet `fibero&#x27;nun` nicht und meldet einen Mangel, den es nicht gibt —
 * genau das ist beim ersten Lauf passiert. Deshalb wird vor jedem Vergleich
 * zurueckuebersetzt.
 */
function entschaerft(html) {
  return html
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/")
}

const seiten = htmlDateien(APP_DIR).map((d) => ({
  kurz: path.relative(APP_DIR, d),
  text: entschaerft(fs.readFileSync(d, "utf8")),
}))
if (seiten.length === 0) {
  console.log("Angebots- und Beleg-Gate — kein gebautes HTML gefunden, uebersprungen.\n")
  process.exit(0)
}

/* ===========================================================================
 * TEIL 1 · DAS ANGEBOTSSYSTEM
 * ========================================================================= */

/* --- 1.1 Jeder gefuehrte Betrag steht in site-data ----------------------- */
const erlaubteBetraege = new Set(
  [...packages.flatMap((p) => [p.amount, p.regularAmount]), retainer.amount].filter(
    (b) => typeof b === "number",
  ),
)
for (const betrag of gefuehrteBetraege) {
  if (!erlaubteBetraege.has(betrag)) {
    probleme.push(
      `lib/kaufwege.ts fuehrt ${betrag} €, aber weder \`packages\` noch \`retainer\` ` +
        `kennen diese Zahl. Kein Betrag entsteht ausserhalb von site-data (D-18).`,
    )
  }
}

/* --- 1.2 Betragsart und Betrag muessen zueinander passen ----------------- */
for (const a of angebote) {
  const brauchtZahl = a.betragArt === "festpreis" || a.betragArt === "monatlich"
  if (brauchtZahl && a.betrag === null) {
    probleme.push(`Angebot „${a.key}" ist als ${a.betragArt} gefuehrt, traegt aber keinen Betrag.`)
  }
  if (a.betragArt === "nach-zuschnitt" && a.betrag !== null) {
    probleme.push(
      `Angebot „${a.key}" sagt „nach Zuschnitt" und traegt trotzdem ${a.betrag} € — ` +
        `eines von beidem ist gelogen.`,
    )
  }
  if (!kaufwege.includes(a.kaufweg)) {
    probleme.push(`Angebot „${a.key}" haengt an einem Kaufweg, den es nicht gibt.`)
  }
  if (!a.kanon || a.kanon.trim() === "") {
    probleme.push(`Angebot „${a.key}" hat keine Fundstelle im Kanon.`)
  }
}

/* --- 1.3 Vier Sprachen, und die Grenze ist Pflicht ----------------------- */
for (const a of angebote) {
  const text = angebotText[a.key]
  if (!text) {
    probleme.push(`Angebot „${a.key}" hat keinen Text.`)
    continue
  }
  for (const feld of ["name", "ergebnis", "grenze", "cta"]) {
    for (const l of LOCALES) {
      const wert = text[feld]?.[l]
      if (!wert || wert.trim() === "") {
        probleme.push(`Angebot „${a.key}": ${feld} fehlt auf ${l}.`)
      }
    }
  }
}

/* --- 1.4 Keine erfundene Mindestprojektsumme ----------------------------- *
 * `offer-canon.md` §7 leitet eine Untergrenze ab UND entscheidet, sie nicht
 * oeffentlich auszustellen. Wer sie trotzdem hinschreibt, kippt eine
 * Kanon-Entscheidung per Ueberschrift.                                      */
const MINDEST = [
  /Systemprojekte?\s+ab\s+\d/i,
  /\bab\s+\d{1,3}[.,]?\d{3}\s*€/i,
  /from\s+€\s?\d{1,3}[.,]?\d{3}/i,
  /Mindest(projekt|auftrag|summe)/i,
  /minimum\s+(project|order)/i,
]
for (const s of seiten) {
  for (const muster of MINDEST) {
    if (muster.test(s.text)) {
      probleme.push(`${s.kurz}: sieht nach einer Mindestprojektsumme aus (${muster.source}).`)
    }
  }
}

/* --- 1.5 Preis-Invariante ------------------------------------------------ *
 * Die oeffentlich sichtbaren Betraege sind eine geschlossene Menge. Waechst
 * sie, ist eine Zahl dazugekommen; schrumpft sie, ist eine verschwunden.
 * Beides ist eine Owner-Entscheidung und keine Nebenwirkung eines Laufs.    */
const ERWARTET = [149, 1500, 2400, 3900]
const gefunden = [...erlaubteBetraege].sort((a, b) => a - b)
if (JSON.stringify(gefunden) !== JSON.stringify(ERWARTET)) {
  probleme.push(
    `Die Menge der oeffentlichen Betraege hat sich geaendert: erwartet ` +
      `[${ERWARTET.join(", ")}], gefunden [${gefunden.join(", ")}]. Preise aendert der Owner.`,
  )
}

/* ===========================================================================
 * TEIL 2 · DER fibero-BETRIEBSBELEG
 * ========================================================================= */

const fiberoSeiten = seiten.filter((s) => /produkte[/\\]fibero/.test(s.kurz))
if (fiberoSeiten.length === 0) {
  probleme.push("Keine gebaute fibero-Produktseite gefunden — der Betriebsbeleg hat kein Zuhause.")
}

/* --- 2.1 Kein Kundenfall ------------------------------------------------- */
const KUNDENSPRACHE = [
  /Kundenprojekt/i,
  /Kundenfall/i,
  /Erfolgsgeschichte/i,
  /customer (case|project|success)/i,
  /success story/i,
  /müşteri projesi/i,
  /başarı hikâyesi/i,
  /قصة نجاح/,
]
/*
 * Drei Saetze des Belegs enthalten die verbotenen Woerter mit Absicht — sie
 * VERNEINEN sie: die Eyebrow („kein Kundenfall"), der Vorspann („ist kein
 * Kundenprojekt") und der Grenzsatz. Ein Gate, das sie verbietet, bestraft
 * genau die Ehrlichkeit, die es durchsetzen soll. Sie werden deshalb vor der
 * Pruefung herausgeschnitten; was danach noch uebrig bleibt, ist eine echte
 * Kundenbehauptung.
 */
const VERNEINUNGEN = LOCALES.flatMap((l) => [
  fiberoText.eyebrow[l],
  fiberoText.lead[l],
  fiberoText.grenzen["kein-kundenfall"][l],
])
for (const s of fiberoSeiten) {
  const ohneVerneinung = VERNEINUNGEN.reduce((t, satz) => t.split(satz).join(" "), s.text)
  for (const muster of KUNDENSPRACHE) {
    if (muster.test(ohneVerneinung)) {
      probleme.push(`${s.kurz}: Kundensprache im eigenen Betriebsbeleg (${muster.source}).`)
    }
  }
}

/* --- 2.2 Keine unbelegte Ersparnis --------------------------------------- */
if (!fiberoHatMessung) {
  const ERSPARNIS = [
    /\d+\s*%\s*(weniger|schneller|effizienter|less|faster|daha)/i,
    /spart\s+\d/i,
    /saves?\s+\d/i,
    /\d+\s*(Stunden|Minuten|hours|minutes|saat|dakika)\s*(gespart|eingespart|saved)/i,
    /tasarruf\s+\d/i,
  ]
  for (const s of fiberoSeiten) {
    for (const muster of ERSPARNIS) {
      if (muster.test(s.text)) {
        probleme.push(
          `${s.kurz}: nennt eine Ersparnis (${muster.source}), obwohl keine Aussage im ` +
            `Belegregister als gemessen gefuehrt ist.`,
        )
      }
    }
  }
}

/* --- 2.3 Die Pflichtteile des Belegs sind da ----------------------------- */
const PFLICHT = [
  ["Messpunkte", fiberoText.messenLabel],
  ["Grenzen", fiberoText.grenzenLabel],
  ["Wirkung", fiberoText.wirkungLabel],
  ["Kennzeichnung als eigener Betrieb", fiberoText.eyebrow],
]
for (const s of fiberoSeiten) {
  const locale = /^(tr|en|ar)[/\\]/.test(s.kurz) ? s.kurz.slice(0, 2) : "de"
  for (const [name, feld] of PFLICHT) {
    if (!s.text.includes(feld[locale])) {
      probleme.push(`${s.kurz}: Pflichtteil „${name}" fehlt im Betriebsbeleg (${locale}).`)
    }
  }
}

/* --- 2.4 Jede Aussage hat eine Fundstelle -------------------------------- */
for (const a of fiberoAussagen) {
  if (!a.fundstelle || a.fundstelle.trim() === "") {
    probleme.push(`fibero-Aussage „${a.key}" hat keine Fundstelle.`)
  }
}
for (const m of fiberoMesspunkte) {
  for (const l of LOCALES) {
    if (!fiberoText.messpunkte[m.key]?.[l]) {
      probleme.push(`fibero-Messpunkt „${m.key}" fehlt auf ${l}.`)
    }
  }
}

/* --- 2.5 Keine Namen aus dem laufenden Betrieb --------------------------- *
 * Der Auftraggeber und die Subunternehmer des Glasfaser-Arms stehen im
 * fibero-Repository. Keiner von ihnen hat einer Nennung zugestimmt.         */
const BETRIEBSNAMEN = ["Telekom", "AlCaTech", "Glasfaser NordWest", "v0-nexora"]
for (const s of seiten) {
  for (const name of BETRIEBSNAMEN) {
    if (s.text.includes(name)) {
      probleme.push(`${s.kurz}: nennt „${name}" — Name aus dem laufenden Betrieb, ohne Freigabe.`)
    }
  }
}

/* ===========================================================================
 * TEIL 3 · DER RECHNER
 * ========================================================================= */

const rechnerSeiten = seiten.filter((s) => /aufwandsrechner/.test(s.kurz))
if (rechnerSeiten.length === 0) {
  probleme.push("Keine gebaute Rechner-Seite gefunden.")
}

for (const s of rechnerSeiten) {
  const locale = /^(tr|en|ar)[/\\]/.test(s.kurz) ? s.kurz.slice(0, 2) : "de"

  /* --- 3.1 Kein vorbelegtes Ergebnis ------------------------------------ *
   * Der Leersatz steht nur da, solange KEIN Ergebnis gerendert ist. Fehlt
   * er im ausgelieferten HTML, hat der Rechner beim Aufruf gerechnet — mit
   * Werten, die niemand eingegeben hat.                                    */
  if (!s.text.includes(rechnerText.leer[locale])) {
    probleme.push(
      `${s.kurz}: der Leerzustand fehlt im ausgelieferten HTML — der Rechner zeigt beim ` +
        `Aufruf ein Ergebnis, das niemand eingegeben hat.`,
    )
  }

  /* --- 3.2 Kein `value` in den Eingabefeldern --------------------------- */
  const vorbelegt = s.text.match(/<input[^>]*\svalue="[^"]+"/g)
  if (vorbelegt) {
    probleme.push(`${s.kurz}: ${vorbelegt.length} vorbelegte(s) Eingabefeld(er) im Rechner.`)
  }

  /* --- 3.3 Keine Zusage-Sprache ----------------------------------------- */
  const ZUSAGE = [
    /\bgarant/i,
    /\bwir sparen Ihnen\b/i,
    /\byou will save\b/i,
    /\bsize kazandırırız\b/i,
    /\bKI (hat|hätte) berechnet\b/i,
    /\bAI (has )?calculated\b/i,
  ]
  for (const muster of ZUSAGE) {
    if (muster.test(s.text)) {
      probleme.push(`${s.kurz}: Zusage- oder KI-Sprache im Rechner (${muster.source}).`)
    }
  }

  /* --- 3.4 Die Formel steht offen --------------------------------------- */
  if (!s.text.includes(rechnerText.formelLabel[locale])) {
    probleme.push(`${s.kurz}: die Formel steht nicht offen.`)
  }
  /* --- 3.5 Die Grenze der Rechnung steht dabei -------------------------- */
  if (!s.text.includes(rechnerText.grenzeLabel[locale])) {
    probleme.push(`${s.kurz}: die Grenze der Modellrechnung fehlt.`)
  }
}

/* ===========================================================================
 * BERICHT
 * ========================================================================= */

if (!fiberoHatMessung) {
  hinweise.push(
    "Owner-Punkt: fuer fibero existiert keine Vorher-Messung. Der Beleg zeigt deshalb " +
      "Struktur und Messpunkte, aber keine Ersparnis. Aufloesen laesst sich das nur durch " +
      "eine Erhebung im laufenden Betrieb — nicht durch eine Formulierung.",
  )
}

console.log(
  `\nAngebots- und Beleg-Gate — ${angebote.length} Angebote in ${kaufwege.length} Kaufwegen · ` +
    `${gefuehrteBetraege.length} gefuehrte Betraege · ${fiberoAussagen.length} fibero-Aussagen ` +
    `(${fiberoAussagen.filter((a) => a.gemessen).length} gemessen) · ` +
    `${rechnerSeiten.length} Rechner-Seiten`,
)

if (probleme.length > 0) {
  console.error(
    `FEHL — ${probleme.length} Stelle(n):` +
      probleme.map((p) => `\n  ${p}`).join("") +
      "\n\nEin Angebot darf teuer sein. Es darf nicht erfunden sein.\n",
  )
  process.exit(1)
}

for (const h of hinweise) console.log(h)
console.log("OK — kein erfundener Preis, kein geliehener Kundenfall, kein vorbelegtes Ergebnis.\n")
