/*
 * ===========================================================================
 * HANDELS-WAHRHEITS-GATE — PUBLIC CLAIM = CURRENT TRUTH
 * ===========================================================================
 *
 * PHASE 1 · COMMERCIAL COMPLETION, 11.09.2026.
 *
 * Dieses Gate prueft keine Technik. Es prueft, ob die ausgelieferte Seite
 * etwas behauptet, das heute nicht mehr stimmt — die Klasse Fehler, die kein
 * Typchecker und kein Linter findet, weil sie syntaktisch einwandfrei ist.
 *
 * Der Anlass war ein einziger Befund, und er ist lehrreich genug, um ihn
 * hier stehen zu lassen: Auf `/datenschutz` stand im Fliesstext „Mit Vercel
 * besteht ein Vertrag ueber die Auftragsverarbeitung nach Art. 28 DSGVO" —
 * und knapp tausend Pixel darunter, in derselben ausgelieferten Datei, stand
 * an drei Eintraegen „Bestaetigung durch den Inhaber offen" und der Satz
 * „Wir schreiben deshalb nicht, dass sie bestehen". Die Seite behauptete und
 * dementierte gleichzeitig. Beide Saetze waren bewusst geschrieben, beide
 * von verschiedenen Haenden zu verschiedenen Zeiten, und keiner wusste vom
 * anderen.
 *
 * Genau dagegen laeuft dieses Gate: Es liest das GEBAUTE HTML, nicht die
 * Quelle. Was im Quelltext schoen getrennt in vier Woerterbuecher faellt,
 * steht im Browser auf einer Seite untereinander — und dort muss es
 * zusammenpassen.
 *
 * Sieben Regeln. Jede haelt genau einen Befund aus dem Live-Reaudit fest,
 * damit er nicht zurueckkommt.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { processors } from "@/lib/site-data"
import { genannteClientWorks, productWorks } from "@/lib/site-data"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const APP_DIR = path.join(ROOT, ".next", "server", "app")
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

const htmls = htmlDateien(APP_DIR)
if (htmls.length === 0) {
  console.log("Handels-Wahrheits-Gate — kein gebautes HTML gefunden, uebersprungen.\n")
  process.exit(0)
}

const seiten = htmls.map((d) => ({
  datei: path.relative(ROOT, d),
  kurz: path.relative(APP_DIR, d),
  text: fs.readFileSync(d, "utf8"),
}))

/* ---------------------------------------------------------------------------
 * REGEL 1 — KEIN BEHAUPTETER VERTRAG, SOLANGE EIN MARKER OFFEN STEHT.
 *
 * Nicht die Frage, ob ein AVV besteht — das weiss dieses Gate nicht und darf
 * es nicht raten. Die Frage ist, ob die Seite ihn als bestehend BEHAUPTET,
 * waehrend sie an anderer Stelle sagt, dass die Bestaetigung aussteht.
 */
const offeneVerarbeiter = processors.filter((p) => !p.dpaConfirmed)
const BEHAUPTUNGEN = [
  /besteht ein Vertrag über die Auftragsverarbeitung/i,
  /Abgesichert ist sie über den Auftragsverarbeitungsvertrag/i,
  /die wir mit \w+ geschlossen haben/i,
  /clauses we have concluded with/i,
  /A data processing agreement under Art\. 28 GDPR is in place/i,
  /veri işleyen sözleşmesi mevcuttur/i,
  /ile imzaladığımız AB standart sözleşme/i,
]
if (offeneVerarbeiter.length > 0) {
  for (const s of seiten) {
    for (const muster of BEHAUPTUNGEN) {
      if (muster.test(s.text)) {
        probleme.push(
          `${s.kurz}: behauptet einen abgeschlossenen Auftragsverarbeitungsvertrag ` +
            `(${muster.source.slice(0, 40)}…), waehrend ${offeneVerarbeiter.length} ` +
            `Verarbeiter als unbestaetigt gekennzeichnet sind ` +
            `(${offeneVerarbeiter.map((p) => p.key).join(", ")}).`,
        )
      }
    }
  }
}

/* ---------------------------------------------------------------------------
 * REGEL 2 — KEIN INTERNER ARBEITSSTAND IM AUSGELIEFERTEN TEXT.
 *
 * „das holen wir vor dem Livegang nach" stand auf einer Seite, die seit
 * Wochen live ist. Solche Saetze sind doppelt teuer: Sie sind falsch, und
 * sie zeigen dem Leser eine Werkstatt, in die er nicht eingeladen war.
 */
const INTERN = [
  [/vor dem Livegang/i, "Livegang-Marker (DE)"],
  [/yayına almadan önce/i, "Livegang-Marker (TR)"],
  [/before launch/i, "Livegang-Marker (EN)"],
  [/قبل الإطلاق/, "Livegang-Marker (AR)"],
  [/\bTODO\b/, "TODO"],
  [/WEB-\d{4}/, "interne Befundnummer"],
  [/\bGATE ?\d{2}\b/i, "interne Gate-Nummer"],
]
for (const s of seiten) {
  for (const [muster, name] of INTERN) {
    if (muster.test(s.text)) probleme.push(`${s.kurz}: ${name} im ausgelieferten Text.`)
  }
}

/* ---------------------------------------------------------------------------
 * REGEL 3 — KEINE FESTE ZEITZONEN-ABKUERZUNG.
 *
 * „Alle Zeiten in MEZ" stand im Termin-Assistenten — im September, also
 * mitten in der Sommerzeit. Eine Abkuerzung ist ein halbes Jahr lang falsch.
 * Die Zone gehoert hin, nicht die Jahreszeit.
 */
for (const s of seiten) {
  const m = s.text.match(/\b(MEZ|MESZ|CET|CEST)\b/)
  if (m) probleme.push(`${s.kurz}: feste Zeitzonen-Abkuerzung „${m[1]}" — nenne die Zone, nicht die Jahreszeit.`)
}

/* ---------------------------------------------------------------------------
 * REGEL 4 — KEIN GLOBALER BETRIEBSANSPRUCH UEBER PRODUKTE IM AUFBAU.
 *
 * „Vier Produkte, die wir selbst betreiben" stand ueber vier Karten, von
 * denen drei „Im Aufbau" trugen. Die Karten waren ehrlich, die Ueberschrift
 * nicht — und gelesen wird die Ueberschrift.
 */
/* `outcome.de` traegt den Stand: „Im Tagesbetrieb" gegen „Im Aufbau". */
const imBetrieb = productWorks.filter((p) => /Tagesbetrieb/i.test(p.outcome?.de ?? "")).length
const GLOBAL = [
  /Vier Produkte, die wir selbst betreiben/i,
  /Four products we run ourselves/i,
  /Kendi işlettiğimiz dört ürün/i,
  /أربعة منتجات نشغّلها بأنفسنا/,
]
if (imBetrieb < productWorks.length) {
  for (const s of seiten) {
    for (const muster of GLOBAL) {
      if (muster.test(s.text)) {
        probleme.push(
          `${s.kurz}: behauptet alle ${productWorks.length} Produkte im eigenen Betrieb, ` +
            `tatsaechlich sind es ${imBetrieb}.`,
        )
      }
    }
  }
}

/* ---------------------------------------------------------------------------
 * REGEL 5 — STRUKTURIERTE DATEN DUERFEN NICHTS AUFLISTEN, WAS NICHT DASTEHT.
 *
 * `/arbeiten` sagte im Text „hier steht niemand" und lieferte im selben
 * Dokument eine ItemList mit vier Eintraegen aus, im Namen sogar mit dem
 * Wort „Kundenwerk". Suchmaschinen lesen beides — und glauben das Schema.
 */
if (genannteClientWorks.length === 0) {
  for (const s of seiten) {
    if (!/\/arbeiten|arbeiten\.html/.test(s.kurz) && !/"@type":"BreadcrumbList"/.test(s.text)) continue
    if (!/arbeiten/i.test(s.kurz)) continue
    if (/"@type":"ItemList"/.test(s.text)) {
      probleme.push(
        `${s.kurz}: ItemList in den strukturierten Daten, obwohl keine freigegebene ` +
          `Kundenarbeit vorliegt und die Seite nichts auflistet.`,
      )
    }
  }
}

/* ---------------------------------------------------------------------------
 * REGEL 6 — DER BARRIEREFREIHEITS-BEFUND MUSS DEN ECHTEN LAUF NENNEN.
 *
 * Die Seite nannte 68 Durchlaeufe ueber 17 Seiten. Der Lauf deckte zu dem
 * Zeitpunkt bereits 31 Routen und 124 Durchlaeufe ab. Eine Erklaerung zur
 * Barrierefreiheit, deren eigene Zahlen nicht stimmen, ist das einzige
 * Dokument auf der Seite, bei dem das doppelt zaehlt.
 */
const a11yQuelle = fs.readFileSync(path.join(ROOT, "scripts", "a11y.mjs"), "utf8")
const routenZahl = [...a11yQuelle.matchAll(/\{\s*name:\s*"[^"]+",\s*path:/g)].length
const laeufe = routenZahl * 4
for (const s of seiten) {
  if (!/barrierefreiheit|erisilebilirlik|accessibility/i.test(s.kurz)) continue
  const genannt = s.text.match(/(\d+)\s*(?:Durchläufe|tur|passes|تمريرة)/)
  if (genannt && Number(genannt[1]) !== laeufe) {
    probleme.push(
      `${s.kurz}: nennt ${genannt[1]} Durchlaeufe, der Lauf hat ${laeufe} ` +
        `(${routenZahl} Routen × 2 Fenster × 2 Erscheinungsbilder).`,
    )
  }
}

/* ---------------------------------------------------------------------------
 * REGEL 7 — KEINE KUNDENNAMEN OHNE FREIGABE, AUCH NICHT VERSEHENTLICH.
 *
 * Die Namen stehen in alten Arbeitsdokumenten im Repository. Von dort in
 * eine Seite zu rutschen ist ein Handgriff — und der Weg zurueck aus einem
 * Suchindex ist keiner.
 */
const ALTE_NAMEN = ["NV SWISS", "NV-SWISS", "nvswiss", "maqam", "Bir Damla", "birdamla", "Glasfaser NordWest"]
for (const s of seiten) {
  for (const name of ALTE_NAMEN) {
    if (s.text.toLowerCase().includes(name.toLowerCase())) {
      probleme.push(`${s.kurz}: nennt „${name}" — Kundenname ohne dokumentierte Freigabe.`)
    }
  }
}

/* ---------------------------------------------------------------------------
 * HINWEIS — was offen bleibt, ohne dass der Bau es loesen koennte.
 */
if (offeneVerarbeiter.length > 0) {
  hinweise.push(
    `Owner-Punkt: ${offeneVerarbeiter.length} Auftragsverarbeitungsvertrag/-vertraege sind ` +
      `nicht bestaetigt (${offeneVerarbeiter.map((p) => p.key).join(", ")}). Die Seite nennt ` +
      `deshalb nur die VORGESEHENE Grundlage und kennzeichnet den offenen Stand. Technische ` +
      `Nutzung eines Dienstes beweist keinen Vertrag — aufloesen kann das nur der Inhaber.`,
  )
}
if (genannteClientWorks.length === 0) {
  hinweise.push(
    "Owner-Punkt: null freigegebene Kundenarbeiten. `/arbeiten` sagt das ausdruecklich, " +
      "die Metadaten und die strukturierten Daten halten sich daran.",
  )
}

console.log(
  `\nHandels-Wahrheits-Gate — ${seiten.length} gebaute Seiten · 7 Regeln · ` +
    `${processors.length} Verarbeiter (${offeneVerarbeiter.length} offen) · ` +
    `${productWorks.length} Produkte (${imBetrieb} im Betrieb)`,
)

if (probleme.length > 0) {
  console.error(
    `FEHL — ${probleme.length} Stelle(n), an denen die Seite etwas anderes behauptet als gilt:` +
      probleme.map((p) => `\n  ${p}`).join("") +
      "\n\nEine Seite darf unfertig sein. Sie darf nicht unwahr sein.\n",
  )
  process.exit(1)
}

for (const h of hinweise) console.log(h)
console.log("OK — keine Behauptung ohne Deckung, kein interner Stand im Text.\n")
