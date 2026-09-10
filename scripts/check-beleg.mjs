#!/usr/bin/env node
/**
 * DAS BELEG-GATE (G02)
 *
 * ---------------------------------------------------------------------------
 * WORUM ES GEHT
 * Gate 02 hat zwei Dinge entschieden, die beide leise verfallen koennen:
 *
 *   1. Ein eigenes Produkt zeigt nur die Aufnahme, die Gate 02 geprueft hat.
 *      Zwei der vier vorhandenen Bilder erscheinen NICHT, weil sie dem
 *      Demodaten-Standard nicht erkennbar standhalten. Wer sie spaeter
 *      einbindet, holt genau das zurueck, wogegen dieses Repository seine
 *      haerteste Regel hat.
 *
 *   2. Jede oeffentliche Tatsache ueber ein Produkt traegt eine Quelle und
 *      ein Pruefdatum. Eine Tatsache ohne Datum verfaellt still — „live" ist
 *      im Januar wahr und im Juni eine Behauptung.
 *
 * Dazu kommt die Regel, die aelter ist als Gate 02 und die hier nur
 * nachgeprueft wird: Kein Kundenbeleg ohne hinterlegte Freigabe. Die
 * eigentliche Maschine dafuer ist `lib/proof.ts` mit `npm run proof-drill`;
 * dieses Gate stellt nur sicher, dass Gate 02 sie nicht umgangen hat.
 *
 * ---------------------------------------------------------------------------
 * WAS AUSDRUECKLICH NICHT GEPRUEFT WIRD
 * Ob ein Bild schoen ist, ob ein Text ueberzeugt, ob ein Produkt reif ist.
 * Geprueft wird nur, was nachweisbar ist: Vollstaendigkeit, Herkunft,
 * Konsistenz — und dass kein zurueckgehaltenes Bild doch irgendwo auftaucht.
 *
 * Aufruf: `node --import ./scripts/lib/alias-hook.mjs scripts/check-beleg.mjs`
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { productWorks, clientWorks, reviews } from "@/lib/site-data"
import {
  produktBelege,
  belegZu,
  zurueckgehalteneBilder,
  alleProdukteHabenBeleg,
} from "@/lib/produkt-beleg"
import { genannteClientWorks } from "@/lib/site-data"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const probleme = []

const ZUGANGSLAGEN = ["offen", "geschlossen", "intern"]
const QUELLEN = ["repository", "oeffentliche-produktseite"]

/* ── 1 · Jedes Produkt hat genau einen Beleg-Eintrag ────────────────────── */
for (const p of productWorks) {
  const treffer = produktBelege.filter((b) => b.slug === p.slug)
  if (treffer.length === 0) {
    probleme.push(
      `Produkt „${p.slug}" hat keinen Beleg-Eintrag. Es faellt damit still auf ` +
        `„kein Bild, keine Zugangsangabe" — und still ist genau das, was hier ` +
        `nicht passieren darf.`,
    )
  } else if (treffer.length > 1) {
    probleme.push(`Produkt „${p.slug}" hat ${treffer.length} Beleg-Eintraege. Erlaubt ist einer.`)
  }
}
for (const b of produktBelege) {
  if (!productWorks.some((p) => p.slug === b.slug)) {
    probleme.push(`Beleg-Eintrag „${b.slug}" gehoert zu keinem Produkt in site-data.`)
  }
}
if (!alleProdukteHabenBeleg) {
  probleme.push("`alleProdukteHabenBeleg` ist false — siehe die Meldungen darueber.")
}

/* ── 2 · Quelle und Pruefdatum sind Pflicht ─────────────────────────────── */
for (const b of produktBelege) {
  if (!QUELLEN.includes(b.quelle)) {
    probleme.push(`„${b.slug}": unbekannte Quelle „${b.quelle}".`)
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.geprueft)) {
    probleme.push(
      `„${b.slug}": „${b.geprueft}" ist kein ISO-Datum. Eine Tatsache ohne Datum verfaellt leise.`,
    )
  }
  if (!ZUGANGSLAGEN.includes(b.zugang)) {
    probleme.push(`„${b.slug}": unbekannte Zugangslage „${b.zugang}".`)
  }
}

/* ── 3 · Zugangslage und Adresse muessen zueinander passen ──────────────── */
for (const b of produktBelege) {
  const produkt = productWorks.find((p) => p.slug === b.slug)
  if (b.zugang === "intern" && b.zugangHref) {
    probleme.push(`„${b.slug}" ist als intern ausgewiesen, nennt aber eine oeffentliche Adresse.`)
  }
  if (b.zugang !== "intern" && !b.zugangHref) {
    probleme.push(`„${b.slug}" ist nicht intern, nennt aber keine Adresse zum Nachpruefen.`)
  }
  /*
   * Der eigentliche Widerspruch, den WEB-0009 ausgeloest hat: ein Produkt mit
   * oeffentlicher Adresse in `site-data`, das hier als „intern" gefuehrt wird
   * (oder umgekehrt). Dann sagen zwei Stellen verschiedenes ueber denselben
   * Klick.
   */
  if (produkt?.href && b.zugang === "intern") {
    probleme.push(
      `„${b.slug}": site-data nennt eine oeffentliche Adresse (${produkt.href}), der Beleg ` +
        `sagt „intern". Eine der beiden Angaben stimmt nicht.`,
    )
  }
}

/* ── 4 · Ein zurueckgehaltenes Bild darf nirgends AUSGELIEFERT werden ───── */
/*
 * Geprueft wird das GEBAUTE HTML, nicht der Quelltext.
 *
 * Der erste Entwurf durchsuchte `components`, `app` und `lib` nach dem
 * Bildpfad — und meldete sofort `lib/site-data.ts`. Zu Recht gefunden, falsch
 * bewertet: Dort steht die Datei als Kartenbild des Produkts, das ist eine
 * DEKLARATION und keine Veroeffentlichung. Ausserdem ist die Datei
 * G18-gesperrt; ein Gate, das eine Aenderung verlangt, die niemand vornehmen
 * darf, ist ein Gate, das man abschaltet.
 *
 * Entscheidend ist, was beim Besucher ankommt. Dieselbe Logik benutzt das
 * Freigabe-Gate (`check-freigaben.mjs`): Damit ist egal, ueber welchen Weg
 * ein Pfad ins Dokument kommt — Markup, RSC-Payload oder ein Datensatz, den
 * eine Komponente durchreicht.
 */
const APP_DIR = path.join(ROOT, ".next", "server", "app")
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
const htmls = htmlDateien(APP_DIR)
const nurImPayload = []
if (htmls.length === 0) {
  console.log(
    "  Hinweis: kein gebautes HTML gefunden — Regel 4 uebersprungen. " +
      "Dieses Gate gehoert hinter `next build`.",
  )
} else {
  for (const slug of zurueckgehalteneBilder) {
    const produkt = productWorks.find((p) => p.slug === slug)
    if (!produkt?.image) continue
    const kodiert = encodeURIComponent(produkt.image)
    let gerendert = 0
    let ausgeliefert = 0
    for (const d of htmls) {
      const text = fs.readFileSync(d, "utf8")
      /*
       * ZWEI VERSCHIEDENE BEFUNDE, DIE NICHT DASSELBE BEDEUTEN.
       *
       * GERENDERT heisst: Das Bild steht als `<img>` oder ueber
       * `/_next/image?url=…` in der Seite. Ein Besucher SIEHT es. Das ist der
       * Zustand, den Gate 02 verboten hat, und deshalb ein Fehler.
       *
       * AUSGELIEFERT heisst: Der Pfad steht im RSC-Payload, weil
       * `ProduktPageBody` eine Client-Komponente ist und das ganze
       * `Work`-Objekt als Prop bekommt — samt `image`. Sichtbar ist nichts.
       * Genau diese Sorte achter Weg ist in `docs/ops/proof-kinds.md`
       * beschrieben, dort fuer `workSlugs`.
       *
       * Der zweite Fall ist KEIN Fehler dieses Gates: Er bestand vor Gate 02,
       * und die Datei liegt ohnehin oeffentlich unter `public/`. Ihn zu
       * schliessen hiesse, entweder `lib/site-data.ts` zu aendern (G18-gesperrt)
       * oder die Datei zu loeschen (Owner-Material). Beides steht Gate 02
       * nicht zu. Also wird er gemeldet, nicht verschwiegen — als Owner-Punkt.
       */
      if (text.includes(kodiert) || new RegExp(`<img[^>]*${produkt.image}`).test(text)) gerendert++
      else if (text.includes(produkt.image)) ausgeliefert++
    }
    if (gerendert > 0) {
      probleme.push(
        `„${produkt.image}" ist von Gate 02 zurueckgehalten (Grund: ` +
          `${belegZu(slug)?.grundOhneBild}), wird aber in ${gerendert} gebauten Seite(n) ` +
          `als Bild GEZEIGT.`,
      )
    }
    if (ausgeliefert > 0) nurImPayload.push({ slug, image: produkt.image, seiten: ausgeliefert })
  }
}

/* ── 5 · Ein Grund ist Pflicht, sobald kein Bild erscheint ──────────────── */
for (const b of produktBelege) {
  if (b.situBild === null && !b.grundOhneBild) {
    probleme.push(
      `„${b.slug}" zeigt kein Bild und nennt keinen Grund. „Kein Bild" ohne Grund ist ` +
        `nicht von „vergessen" zu unterscheiden.`,
    )
  }
  if (b.situBild !== null && b.grundOhneBild) {
    probleme.push(`„${b.slug}" nennt einen Grund gegen ein Bild und zeigt trotzdem eines.`)
  }
}

/* ── 6 · Ein gezeigtes Bild muss existieren und zum Produkt gehoeren ────── */
for (const b of produktBelege) {
  if (!b.situBild) continue
  const datei = path.join(ROOT, "public", b.situBild.replace(/^\//, ""))
  if (!fs.existsSync(datei)) {
    probleme.push(`„${b.slug}": Bilddatei ${b.situBild} liegt nicht im Repository.`)
  }
  const produkt = productWorks.find((p) => p.slug === b.slug)
  if (produkt && produkt.image !== b.situBild) {
    probleme.push(
      `„${b.slug}": der Beleg zeigt ${b.situBild}, site-data fuehrt aber ${produkt.image}. ` +
        `Zwei Bilder fuer ein Produkt sind zwei Wahrheiten.`,
    )
  }
  if (produkt && produkt.imageProof !== "product-photo") {
    probleme.push(
      `„${b.slug}": das gezeigte Bild ist als „${produkt.imageProof}" ausgewiesen. Als Beleg ` +
        `fuer ein eigenes Produkt taugt nur „product-photo" — echte eigene Oberflaeche.`,
    )
  }
}

/* ── 7 · Kein Kundenbeleg ohne Freigabe (Nachpruefung zu lib/proof.ts) ──── */
if (genannteClientWorks.length > 0) {
  probleme.push(
    `${genannteClientWorks.length} Kundenarbeit(en) waeren oeffentlich sichtbar. Das ist nicht ` +
      `falsch — aber Gate 02 hat es nicht veranlasst. Pruefen: liegt fuer jede eine ` +
      `hinterlegte Freigabe vor (npm run proof-drill)?`,
  )
}
if (reviews.length > 0) {
  probleme.push(
    `${reviews.length} Bewertung(en) im Bestand. Gate 02 hat keine angelegt — pruefen, woher ` +
      `sie kommen und ob eine Quelle hinterlegt ist.`,
  )
}

/* ── Ausgabe ────────────────────────────────────────────────────────────── */
const mitBild = produktBelege.filter((b) => b.situBild).length
console.log(
  `\nBeleg-Gate — ${produktBelege.length} Produkte · ${mitBild} mit geprueftem Bild · ` +
    `${zurueckgehalteneBilder.length} zurueckgehalten · ` +
    `${genannteClientWorks.length} von ${clientWorks.length} Kundenarbeiten freigegeben · ` +
    `${reviews.length} Bewertungen`,
)

if (probleme.length > 0) {
  console.error("\nBeleg-Gate: ein Beleg deckt nicht, was er zeigt.\n")
  for (const p of probleme) console.error(`  ${p}`)
  console.error(
    "\nEin Bild, das mehr behauptet als es deckt, ist teurer als gar keins.\n" +
      "Genau davor soll dieses Gate schuetzen.\n",
  )
  process.exit(1)
}

if (nurImPayload.length > 0) {
  console.log(
    `Owner-Punkt (OA-1): ${nurImPayload.length} zurueckgehaltene Aufnahme(n) stehen weiterhin im\n` +
      `RSC-Payload ihrer Produktseite und liegen oeffentlich unter public/ — sichtbar ist\n` +
      `nichts, abrufbar schon:` +
      nurImPayload.map((e) => `\n  ${e.image} (${e.seiten} Seiten)`).join(""),
  )
}

if (zurueckgehalteneBilder.length > 0) {
  console.log(
    `Owner-Punkt (OA-2): ${zurueckgehalteneBilder.length} vorhandene Aufnahme(n) ` +
      `zurueckgehalten — ${zurueckgehalteneBilder.join(", ")}. Grund: die Daten darin sind ` +
      `nicht als erfunden erkennbar (docs/ops/demo-data-standard.md). Aufloesen kann das nur ` +
      `der Owner.`,
  )
}

console.log("OK — jedes Produkt mit Quelle und Datum, kein zurueckgehaltenes Bild im Umlauf.\n")
