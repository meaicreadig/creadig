#!/usr/bin/env node
/**
 * G15 · REDAKTIONS-GATE — ein Beitrag steht auf Belegen oder er steht nicht.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS ES PRUEFT — UND WARUM GENAU DAS
 *
 * Nicht, ob ein Text gut ist. Das kann kein Skript, und eines, das es
 * behauptet, faerbt Meinung gruen.
 *
 * Sondern, ob er STEHT:
 *
 *   1 · Hat er Belege — ab dem Zustand „gegenlesen"?
 *   2 · Gibt es die Fundstellen wirklich? Ein Pfad, den niemand aufschlagen
 *       kann, ist keine Quelle. Bei `eigener-befund` und `eigene-messung`
 *       wird die Datei nachgeschlagen.
 *   3 · Nennt der Text Zahlen — traegt sie ein Beleg, dessen ART das darf?
 *       Ein eigenes Produkt belegt, DASS es laeuft, nicht wie gut.
 *   4 · Nennt der Text eine fremde Marke — ist sie nach Gate 13 gedeckt?
 *       Dieselbe Funktion, dieselbe Freigabe, keine zweite Wahrheit.
 *   5 · Fuehrt er irgendwohin — ab „veroeffentlicht"? Und gibt es das Ziel?
 *   6 · Sammelt irgendwo auf /insights ein Feld eine Adresse ein, oder laedt
 *       eine Seite eine Fremdschrift, die Reichweite kauft?
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM PUNKT 4 IM TEXT SUCHT UND NICHT IM DATENSATZ
 *
 * Gate 13 hat sieben Wege geschlossen, auf denen ein Kundenname ohne
 * Freigabe nach draussen kam, und fand danach selbst den achten: einen
 * Datenblock im RSC-Payload, an den niemand gedacht hatte.
 *
 * `/insights` ist der neunte, und er ist der offenste von allen: Ein Beitrag
 * ist FLIESSTEXT. Dort kann jeder Name stehen, ohne dass je eine Liste ihn
 * gesehen haette. Deshalb wird hier der Text durchsucht, nicht das Feld.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  BELEG_ARTEN,
  fundstelleTraegt,
  genannteMarken,
  istOeffentlich,
  kennzahlenIm,
  wirdGeprueft,
  zahlenGedeckt,
  zielIstImHaus,
} from "../lib/redaktion.ts"
import { insights } from "../lib/insights.ts"
import { clientWorks, genannteClientWorks, productWorks } from "../lib/site-data.ts"
import { servicePages } from "../lib/service-pages.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []

/** Der ganze Text eines Beitrags, in allen Sprachen. */
function volltext(eintrag) {
  const teile = []
  const sammle = (loc) => {
    if (!loc) return
    for (const wert of Object.values(loc)) {
      if (typeof wert === "string") teile.push(wert)
      else if (Array.isArray(wert)) teile.push(wert.join(" "))
    }
  }
  sammle(eintrag.topic)
  sammle(eintrag.title)
  sammle(eintrag.teaser)
  sammle(eintrag.metaTitle)
  for (const block of eintrag.body ?? []) {
    if (block.kind === "list") sammle(block.items)
    else sammle(block.text)
  }
  return teile.join("\n")
}

/* Adressen, auf die ein Beitrag zeigen darf: alles, was dieses Haus hat. */
const ZIELE = new Set([
  "/",
  "/leistungen",
  "/produkte",
  "/arbeiten",
  "/unternehmen",
  "/betrieb",
  "/systeme",
  "/insights",
  "/kontakt",
  "/termin",
  ...servicePages.filter((p) => p.published).map((p) => `/leistungen/${p.slug}`),
  ...productWorks.map((w) => `/produkte/${w.slug}`),
  ...genannteClientWorks.map((w) => `/arbeiten/${w.slug}`),
])

/* Fremde Marken: alle Kundenwerke — auch die ohne Freigabe. Gerade DIE. */
const FREMDE_MARKEN = clientWorks.map((w) => w.name)
const GEDECKTE_MARKEN = new Set(genannteClientWorks.map((w) => w.name))

for (const eintrag of insights) {
  const wo = `„${eintrag.title.de}"`
  const text = volltext(eintrag)

  /* ─── 4 · Fremde Marken — gilt in JEDEM Zustand ────────────────────────
     Auch ein Entwurf darf keinen ungedeckten Namen tragen: Entwuerfe werden
     veroeffentlicht, und zwar meistens von jemandem, der die Freigabefrage
     fuer erledigt haelt. */
  for (const marke of genannteMarken(text, FREMDE_MARKEN)) {
    if (!GEDECKTE_MARKEN.has(marke)) {
      fehler.push(
        `${wo} nennt „${marke}". Diese Marke ist nach Gate 13 nicht zur Nennung freigegeben — ` +
          `sie erscheint auf keiner anderen Flaeche des Hauses und darf auch hier nicht stehen.`,
      )
    }
  }

  if (!wirdGeprueft(eintrag.zustand)) continue

  /* ─── 1 · Belege ───────────────────────────────────────────────────── */
  if (!eintrag.belege || eintrag.belege.length === 0) {
    fehler.push(`${wo} steht auf „${eintrag.zustand}" und hat keinen einzigen Beleg.`)
    continue
  }

  /* ─── 2 · Fundstellen ──────────────────────────────────────────────── */
  for (const beleg of eintrag.belege) {
    if (!BELEG_ARTEN[beleg.art]) {
      fehler.push(`${wo}: Belegart „${beleg.art}" gibt es nicht.`)
      continue
    }
    if (!fundstelleTraegt(beleg)) {
      fehler.push(
        `${wo}: die Fundstelle „${beleg.fundstelle}" traegt nichts. ` +
          `Eine Quelle, die niemand aufschlagen kann, ist keine.`,
      )
      continue
    }
    if (BELEG_ARTEN[beleg.art].fundstelleIstDatei) {
      const datei = path.join(ROOT, beleg.fundstelle)
      if (!existsSync(datei) || !statSync(datei).isFile()) {
        fehler.push(
          `${wo}: ${BELEG_ARTEN[beleg.art].label} verweist auf ${beleg.fundstelle} — ` +
            `diese Datei gibt es nicht.`,
        )
      }
    }
    if (beleg.traegtZahlen && !BELEG_ARTEN[beleg.art].darfZahlenTragen) {
      fehler.push(
        `${wo}: ${BELEG_ARTEN[beleg.art].label} soll die Zahlen tragen, darf das aber nicht. ` +
          `${BELEG_ARTEN[beleg.art].zeigt}`,
      )
    }
  }

  /* ─── 3 · Zahlen ───────────────────────────────────────────────────── */
  const zahlen = kennzahlenIm(text)
  if (zahlen.length > 0 && !zahlenGedeckt(eintrag.belege)) {
    fehler.push(
      `${wo} nennt ${zahlen.length} Kennzahl(en) — ${zahlen.slice(0, 4).join(", ")}` +
        `${zahlen.length > 4 ? " …" : ""} — und kein Beleg traegt sie. ` +
        `Eine Zahl ohne Quelle ist eine Behauptung mit Ziffern.`,
    )
  }

  /* ─── 5 · Nachfrage ────────────────────────────────────────────────── */
  if (istOeffentlich(eintrag.zustand)) {
    if (!eintrag.nachfrage) {
      fehler.push(
        `${wo} ist veroeffentlicht und fuehrt nirgendwohin. ` +
          `Ein Beitrag ohne Ziel ist ein Tagebuch — dieselbe Arbeit, kein Trichter.`,
      )
    } else if (!zielIstImHaus(eintrag.nachfrage)) {
      fehler.push(`${wo} fuehrt aus dem Haus hinaus (${eintrag.nachfrage.fuehrtZu}).`)
    } else if (!ZIELE.has(eintrag.nachfrage.fuehrtZu)) {
      fehler.push(
        `${wo} fuehrt auf ${eintrag.nachfrage.fuehrtZu} — diese Adresse gibt es nicht.`,
      )
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 6 · DIE GRENZE — kein Adressfeld, keine gekaufte Reichweite
 *
 * Das Haus hat sich gegen ein Newsletter-Feld entschieden, mit einer
 * Begruendung, die in `lib/site-data.ts` steht: „Ein Newsletter-Feld
 * verspricht Post." Bis hierher war das ein Kommentar.
 *
 * Ein Kommentar, der eine Entscheidung traegt und von niemandem gelesen
 * wird, ist keine Sicherung — das ist woertlich die Lehre aus Gate 13.
 * Deshalb wird im GEBAUTEN HTML gesucht, nicht in der Quelle.
 * ═══════════════════════════════════════════════════════════════════════════ */

const BAU = path.join(ROOT, ".next", "server", "app")
const WERBESCHRIFTEN = [
  "googletagmanager.com",
  "google-analytics.com",
  "connect.facebook.net",
  "doubleclick.net",
  "ads.linkedin.com",
  "static.ads-twitter.com",
  "snap.licdn.com",
]

function seiten(dir, treffer = []) {
  if (!existsSync(dir)) return treffer
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) seiten(full, treffer)
    else if (e.name.endsWith(".html")) treffer.push(full)
  }
  return treffer
}

const gebaut = seiten(BAU)
const insightSeiten = gebaut.filter((f) => /insights/.test(f))
let geprueft = 0

for (const datei of gebaut) {
  const html = readFileSync(datei, "utf8")
  geprueft++
  const rel = path.relative(ROOT, datei)

  for (const schrift of WERBESCHRIFTEN) {
    if (html.includes(schrift)) {
      fehler.push(`${rel} laedt ${schrift}. Das Haus kauft keine Reichweite (G15-Grenze).`)
    }
  }

  /* Ein Feld, das eine Adresse fuer SPAETER einsammelt. Das Kontakt- und
     das Produkt-Interesse-Formular sind etwas anderes: Sie beantworten
     eine Anfrage, die der Besucher selbst gestellt hat. Gesucht ist der
     Verteiler — er verraet sich am Wort, nicht am Feldtyp. */
  if (/name=["'](newsletter|subscribe|mailing|abo)["']/i.test(html)) {
    fehler.push(
      `${rel} traegt ein Verteiler-Feld. „Ein Newsletter-Feld verspricht Post" — ` +
        `die Entscheidung dagegen steht in lib/site-data.ts.`,
    )
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * AUSGABE
 * ═══════════════════════════════════════════════════════════════════════════ */

const oeffentlich = insights.filter((e) => istOeffentlich(e.zustand))
const imWeg = insights.filter((e) => e.zustand === "gegenlesen")
const entwuerfe = insights.filter((e) => e.zustand === "entwurf")
const belegeGesamt = insights.reduce((n, e) => n + (e.belege?.length ?? 0), 0)

console.log(
  `\nRedaktions-Gate — ${insights.length} Beitrag/Beitraege ` +
    `(${oeffentlich.length} veroeffentlicht, ${imWeg.length} im Gegenlesen, ${entwuerfe.length} Entwurf), ` +
    `${belegeGesamt} Beleg(e), ${geprueft} gebaute Seite(n) auf die Grenze geprueft`,
)

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log(
  `OK — jede Kennzahl hat eine Quelle, jede Fundstelle laesst sich aufschlagen, ` +
    `keine ungedeckte fremde Marke.`,
)
console.log(
  `Kein Verteiler-Feld, keine gekaufte Reichweite — auch nicht auf den ${insightSeiten.length} Insights-Seiten.`,
)
if (oeffentlich.length < 3) {
  console.log(
    `Duenn bleibt duenn: ${oeffentlich.length} veroeffentlichte(r) Beitrag/Beitraege. ` +
      `Das ist der Owner-Punkt aus Gate 15 — Texte schreibt kein Gate.`,
  )
}
