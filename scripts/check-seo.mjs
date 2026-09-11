/*
 * ===========================================================================
 * SEO- UND INDEX-GATE
 * ===========================================================================
 *
 * PHASE 6 · COMMERCIAL COMPLETION, 11.09.2026.
 *
 * Es prueft nicht, ob Metadaten VORHANDEN sind — das tut jedes Werkzeug.
 * Es prueft, ob sie DASSELBE sagen wie die Seite darunter.
 *
 * Die teuerste Klasse Fehler in diesem Bereich ist leise: Eine Seite aendert
 * ihre Wahrheit, die Metadaten bleiben stehen, und eine Suchmaschine
 * verteilt monatelang eine Aussage, die im Haus laengst zurueckgenommen
 * wurde. Genau so stand bis Phase 1 eine `ItemList` mit vier Kundenwerken
 * auf einer Seite, die im Text sagte, dass es keine gibt.
 *
 * Gelesen wird das GEBAUTE HTML.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { genannteClientWorks, productWorks } from "@/lib/site-data"
import { publishedServicePages } from "@/lib/service-pages"
import { ROLLEN } from "@/lib/karriere"

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

const seiten = htmlDateien(APP_DIR).map((d) => ({
  kurz: path.relative(APP_DIR, d).replace(/\\/g, "/"),
  text: fs.readFileSync(d, "utf8"),
}))
if (seiten.length === 0) {
  console.log("SEO- und Index-Gate — kein gebautes HTML gefunden, uebersprungen.\n")
  process.exit(0)
}

const meta = (html, name) =>
  html.match(new RegExp(`<meta name="${name}" content="([^"]*)"`, "i"))?.[1] ?? null
const canonical = (html) => html.match(/rel="canonical" href="([^"]*)"/i)?.[1] ?? null
const hreflangs = (html) => [...html.matchAll(/hreflang="([^"]*)"/gi)].map((m) => m[1])
const jsonLd = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1])

const LOCALES = ["de", "tr", "en", "ar"]

/* ---------------------------------------------------------------------------
 * 1 · /arbeiten — DIE INDEXENTSCHEIDUNG FOLGT DER FREIGABELAGE
 *
 * Nicht „noindex, weil leer" als Momentaufnahme, sondern als Regel: Solange
 * keine Kundenarbeit freigegeben ist, nimmt sich die Seite aus dem Index —
 * und sobald eine vorliegt, steht sie ohne Code-Aenderung wieder drin.
 */
{
  const arbeiten = seiten.filter((s) => /(^|\/)arbeiten\.html$/.test(s.kurz))
  if (arbeiten.length === 0) probleme.push("Keine gebaute /arbeiten-Seite gefunden.")
  const ohneKundenwerk = genannteClientWorks.length === 0
  for (const s of arbeiten) {
    const robots = meta(s.text, "robots")
    const istNoindex = robots !== null && /noindex/i.test(robots)
    if (ohneKundenwerk && !istNoindex) {
      probleme.push(
        `${s.kurz}: steht im Index, obwohl keine Kundenarbeit freigegeben ist ` +
          `(robots: ${robots ?? "kein Tag"}). Duenner Inhalt im Index schadet der ganzen Domain.`,
      )
    }
    if (!ohneKundenwerk && istNoindex) {
      probleme.push(`${s.kurz}: bleibt auf noindex, obwohl Kundenarbeit freigegeben ist.`)
    }
    /* Kein Schema, das etwas auflistet, was nicht dasteht. */
    if (ohneKundenwerk && jsonLd(s.text).some((b) => /"@type":"ItemList"/.test(b))) {
      probleme.push(`${s.kurz}: ItemList in den strukturierten Daten ohne freigegebene Arbeit.`)
    }
    /* Noindex und Sitemap duerfen sich nicht widersprechen. */
    const sitemap = seiten.find((x) => x.kurz === "sitemap.xml" || x.kurz === "sitemap.xml.html")
    if (sitemap && ohneKundenwerk && /\/arbeiten<\/loc>/.test(sitemap.text)) {
      probleme.push("sitemap: bietet /arbeiten an, obwohl die Seite sich aus dem Index nimmt.")
    }
  }
}

/* ---------------------------------------------------------------------------
 * 2 · KEIN ERFUNDENER STELLENAUSSCHREIBUNGS-EINTRAG
 *
 * `JobPosting` verlangt eine offene Stelle. Solange keine Rolle offen ist,
 * waere die Auszeichnung ein Versprechen an eine Maschine, das ein Mensch
 * auf der Seite nicht wiederfindet.
 */
{
  const offeneRollen = ROLLEN.filter((r) => r.status === "offen").length
  for (const s of seiten) {
    if (/"@type":"JobPosting"/.test(s.text) && offeneRollen === 0) {
      probleme.push(`${s.kurz}: JobPosting ohne offene Rolle.`)
    }
  }
}

/* ---------------------------------------------------------------------------
 * 3 · PRODUKTE IM AUFBAU DUERFEN IM SCHEMA NICHT STAERKER WIRKEN
 */
{
  const imAufbau = productWorks.filter((p) => !/Tagesbetrieb/i.test(p.outcome?.de ?? ""))
  for (const p of imAufbau) {
    const seite = seiten.find((s) => s.kurz === `produkte/${p.slug}.html`)
    if (!seite) continue
    for (const block of jsonLd(seite.text)) {
      /* Der Angebotskatalog des Hauses steht auf jeder Seite und meint die
         Leistungen, nicht das Produkt. Geprueft wird der Produktblock. */
      if (!/SoftwareApplication|"@type":"Product"/.test(block)) continue
      if (/"availability":"https:\/\/schema\.org\/InStock"/.test(block)) {
        probleme.push(`produkte/${p.slug}: Schema meldet InStock, das Produkt ist im Aufbau.`)
      }
      if (/"releaseNotes"|"softwareVersion"/.test(block) === false && /"datePublished"/.test(block)) {
        hinweise.push(`produkte/${p.slug}: datePublished im Schema — Stand pruefen.`)
      }
    }
  }
}

/* ---------------------------------------------------------------------------
 * 4 · KANONISCH UND HREFLANG VOLLSTAENDIG
 *
 * Ein hreflang-Netz mit einem fehlenden Faden ist schlechter als keines:
 * Google verwirft die ganze Gruppe, wenn sie nicht wechselseitig ist.
 */
{
  const stichprobe = [
    "index.html",
    "leistungen.html",
    "aufwandsrechner.html",
    "produkte/fibero.html",
    "betriebscheck.html",
    "kontakt.html",
    "tr/aufwandsrechner.html",
    "en/aufwandsrechner.html",
    "ar/aufwandsrechner.html",
  ]
  for (const name of stichprobe) {
    const s = seiten.find((x) => x.kurz === name)
    if (!s) {
      probleme.push(`Erwartete Seite fehlt im Bau: ${name}`)
      continue
    }
    const c = canonical(s.text)
    if (!c) probleme.push(`${name}: kein canonical.`)
    const hl = hreflangs(s.text)
    for (const l of [...LOCALES, "x-default"]) {
      if (!hl.includes(l)) probleme.push(`${name}: hreflang „${l}" fehlt.`)
    }
    /* Eine lokalisierte Seite zeigt auf sich selbst, nicht auf die deutsche. */
    const praefix = name.startsWith("tr/") ? "/tr/" : name.startsWith("en/") ? "/en/" : name.startsWith("ar/") ? "/ar/" : null
    if (praefix && c && !c.includes(praefix)) {
      probleme.push(`${name}: canonical zeigt nicht auf die eigene Sprachfassung (${c}).`)
    }
  }
}

/* ---------------------------------------------------------------------------
 * 5 · LEISTUNGSSEITEN MUESSEN SICH UNTERSCHEIDEN
 *
 * Gate 03 hat die Texte unterscheidbar gemacht. Wenn die Beschreibungen im
 * Suchergebnis trotzdem gleich klingen, sieht ein Sucher davon nichts.
 */
{
  const beschreibungen = new Map()
  for (const seite of publishedServicePages) {
    const s = seiten.find((x) => x.kurz === `leistungen/${seite.slug}.html`)
    if (!s) continue
    const d = meta(s.text, "description")
    if (!d) {
      probleme.push(`leistungen/${seite.slug}: keine Beschreibung.`)
      continue
    }
    if (beschreibungen.has(d)) {
      probleme.push(
        `leistungen/${seite.slug}: dieselbe Beschreibung wie ${beschreibungen.get(d)}.`,
      )
    }
    beschreibungen.set(d, seite.slug)
  }
}

/* ---------------------------------------------------------------------------
 * 6 · KEINE ALTEN KUNDENNAMEN, KEINE ERFUNDENE WIRKUNG IN METADATEN
 */
{
  const VERBOTEN = [
    [/NV SWISS|nvswiss|maqam|Bir Damla|Glasfaser NordWest/i, "Kundenname ohne Freigabe"],
    [/Telekom|AlCaTech/i, "Name aus dem laufenden fibero-Betrieb"],
    [/spart \d|saves \d|\d+\s*%\s*(weniger|schneller|effizienter)/i, "unbelegte Wirkung"],
    [/garantiert|guaranteed ROI|garantili/i, "Zusage"],
  ]
  for (const s of seiten) {
    const kopf = s.text.slice(0, s.text.indexOf("</head>") + 7)
    for (const [muster, name] of VERBOTEN) {
      if (muster.test(kopf)) probleme.push(`${s.kurz}: ${name} in den Metadaten.`)
    }
  }
}

/* ---------------------------------------------------------------------------
 * 7 · DIE STARTSEITE BESCHREIBT DAS HEUTIGE HAUS
 */
{
  const start = seiten.find((x) => x.kurz === "index.html")
  if (start) {
    const d = meta(start.text, "description") ?? ""
    if (/echte Kunden|real clients/i.test(d)) {
      probleme.push("index: Meta-Beschreibung wirbt mit Kunden, von denen keiner freigegeben ist.")
    }
    if (d.length < 60 || d.length > 200) {
      hinweise.push(`index: Beschreibung ist ${d.length} Zeichen lang.`)
    }
  }
}

console.log(
  `\nSEO- und Index-Gate — ${seiten.length} gebaute Seiten · ` +
    `${genannteClientWorks.length} freigegebene Kundenarbeit(en) · ` +
    `${ROLLEN.filter((r) => r.status === "offen").length} offene Rolle(n) · ` +
    `${publishedServicePages.length} Leistungsseiten`,
)

if (probleme.length > 0) {
  console.error(
    `FEHL — ${probleme.length} Stelle(n):` +
      probleme.map((p) => `\n  ${p}`).join("") +
      "\n\nEine Suchmaschine verteilt, was hier steht — Monate laenger als die Seite.\n",
  )
  process.exit(1)
}

if (genannteClientWorks.length === 0) {
  hinweise.push(
    "Owner-Punkt: `/arbeiten` steht auf noindex, weil keine Kundenarbeit freigegeben ist. " +
      "Mit der ersten Freigabe kehrt die Seite ohne Code-Aenderung in Index und Sitemap zurueck.",
  )
}
for (const h of hinweise) console.log(h)
console.log("OK — Index, strukturierte Daten und Metadaten sagen dasselbe wie die Seiten.\n")
