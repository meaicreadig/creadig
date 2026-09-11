/*
 * ===========================================================================
 * ASSET-SICHERHEIT — WARUM EIN BILD NICHT ÖFFENTLICH WIRD
 * ===========================================================================
 *
 * PROOF OPERATIONS · PHASE P1, 11.09.2026.
 *
 * ---------------------------------------------------------------------------
 * DAS PROBLEM, DAS DIESES MODUL SICHTBAR MACHT
 *
 * `lib/produkt-beleg.ts` fuehrt seit Gate 02 pro Produkt ein `situBild` und
 * einen `grundOhneBild`. Das hat die richtige Entscheidung getroffen — zwei
 * von vier Produkten zeigen kein Bild —, aber es beantwortet nur eine Frage:
 * Zeigen wir es?
 *
 * Die Fragen davor blieben unbeantwortet:
 *
 *   Existiert ueberhaupt eine Datei?
 *   Enthaelt sie echte Daten?
 *   Hat sie jemand angesehen — und wann?
 *   Was genau muesste passieren, damit sie oeffentlich werden darf?
 *
 * Ohne diese vier bleibt „CASSAMEA hat kein Bild" ein Zustand, ueber den
 * niemand etwas tun kann. Mit ihnen wird daraus eine Aufgabe mit einem
 * Adressaten.
 *
 * ---------------------------------------------------------------------------
 * DIE REGEL, DIE NICHT VERHANDELBAR IST
 *
 * `docs/ops/demo-data-standard.md`, unveraendert seit Gate 02:
 *
 *   „Verpixeln reicht nicht."
 *
 * Ein unkenntlich gemachter echter Kundenname bleibt ein echter Kundenname.
 * Was ihn ersetzt, muss ERFUNDEN sein und als erfunden erkennbar — der
 * Musterbestand im Standard nennt die Namen, die dafuer vorgesehen sind.
 *
 * Deshalb gibt es hier keinen Zustand „verpixelt". Es gibt `blockiert-daten`
 * und `sicher-demo`, und dazwischen liegt Arbeit, kein Filter.
 */
import { produktBelege, type ProduktBeleg } from "@/lib/produkt-beleg"

/* ── Die Zustände ───────────────────────────────────────────────────────── */

export type Assetlage =
  /** Niemand hat hingesehen. Der ehrlichste Anfangszustand. */
  | "ungeprueft"
  /**
   * Eine Aufnahme existiert und zeigt echte Daten. Sie wird nicht
   * veroeffentlicht — auch nicht verpixelt, auch nicht beschnitten.
   */
  | "blockiert-daten"
  /**
   * Die sichtbaren Daten sind erfunden und als erfunden erkennbar
   * (`docs/ops/demo-data-standard.md`). Zeigbar, sobald freigegeben.
   */
  | "sicher-demo"
  /** Geprueft und zur oeffentlichen Verwendung freigegeben. */
  | "freigegeben"

export const ASSETLAGE_LABEL: Record<Assetlage, string> = {
  ungeprueft: "Noch nicht geprüft",
  "blockiert-daten": "Enthält echte Daten — gesperrt",
  "sicher-demo": "Erfundene Daten, noch nicht freigegeben",
  freigegeben: "Freigegeben",
}

/** Nur dieser eine Zustand darf auf eine oeffentliche Seite. */
export function darfOeffentlich(lage: Assetlage): boolean {
  return lage === "freigegeben"
}

export type Asset = {
  /** Produkt-Slug oder anderes Subjekt. */
  subjekt: string
  /** Pfad unter `public/`, oder `null`, wenn es keine Datei gibt. */
  datei: string | null
  lage: Assetlage
  /** Enthaelt die Aufnahme echte Betriebs- oder Kundendaten? `null` = ungeprueft. */
  echteDaten: boolean | null
  /** Wer zuletzt hingesehen hat. */
  geprueftVon: string | null
  /** Wann, ISO. */
  geprueftAm: string | null
  /**
   * Was genau fehlt, damit daraus `freigegeben` werden kann. Ein Satz, den
   * der Owner ausfuehren kann — nicht „Asset fehlt".
   */
  fehlt: string | null
}

/* ── Der heutige Bestand ────────────────────────────────────────────────── */

/**
 * Abgeleitet aus `produktBelege`, nicht daneben gepflegt.
 *
 * Das ist Absicht: Zwei Listen ueber dieselben vier Bilder waeren die
 * naechste Stelle, an der eine Freigabe an einem Ort steht und am anderen
 * nicht — genau der Fehler, den Gate 13 fuer Kundenfreigaben behoben hat.
 *
 * Was `produktBelege` nicht weiss, steht hier: ob eine Datei existiert, ob
 * sie echte Daten zeigt, und was fehlt.
 */
const ZUSATZ: Record<string, Pick<Asset, "echteDaten" | "geprueftVon" | "geprueftAm" | "fehlt">> = {
  fibero: {
    echteDaten: false,
    geprueftVon: "Gate 02",
    geprueftAm: "2026-09-10",
    fehlt: null,
  },
  meai: {
    echteDaten: false,
    geprueftVon: "Gate 02",
    geprueftAm: "2026-09-10",
    fehlt: null,
  },
  /*
   * Die Dateien liegen unter `public/works/` und sind damit abrufbar — Gate
   * 02 hat sie aus dem RENDER genommen, nicht aus dem Verzeichnis. Das ist
   * der Owner-Punkt OA-1, und er steht hier als das, was er ist: ein offener
   * Punkt, keine Loesung.
   */
  cassamea: {
    echteDaten: true,
    geprueftVon: "Gate 02",
    geprueftAm: "2026-09-10",
    fehlt:
      "Eine Aufnahme aus einer Demo-Instanz mit dem Musterbestand aus docs/ops/demo-data-standard.md — oder die Bestätigung, dass die sichtbaren Namen in der vorhandenen Aufnahme erfunden sind.",
  },
  meahv: {
    echteDaten: true,
    geprueftVon: "Gate 02",
    geprueftAm: "2026-09-10",
    fehlt:
      "Eine Aufnahme aus einer Demo-Instanz mit dem Musterbestand aus docs/ops/demo-data-standard.md — oder die Bestätigung, dass die sichtbaren Namen in der vorhandenen Aufnahme erfunden sind.",
  },
}

function lageAus(beleg: ProduktBeleg, zusatz: (typeof ZUSATZ)[string] | undefined): Assetlage {
  if (!zusatz) return "ungeprueft"
  if (zusatz.echteDaten === null) return "ungeprueft"
  if (zusatz.echteDaten) return "blockiert-daten"
  /* Erfundene Daten UND von Gate 02 in den Render genommen = freigegeben. */
  return beleg.situBild ? "freigegeben" : "sicher-demo"
}

export const assets: Asset[] = produktBelege.map((b) => {
  const z = ZUSATZ[b.slug]
  return {
    subjekt: b.slug,
    datei: b.situBild,
    lage: lageAus(b, z),
    echteDaten: z?.echteDaten ?? null,
    geprueftVon: z?.geprueftVon ?? null,
    geprueftAm: z?.geprueftAm ?? null,
    fehlt: z?.fehlt ?? null,
  }
})

export function assetZu(subjekt: string): Asset | undefined {
  return assets.find((a) => a.subjekt === subjekt)
}

/** Was heute jemanden braucht, der etwas herstellt. */
export const gesperrteAssets = assets.filter((a) => !darfOeffentlich(a.lage))

/**
 * Die Sicherung fuer die oeffentliche Seite.
 *
 * Sie prueft NICHT, ob ein Bild schoen ist, sondern ob es ueberhaupt gezeigt
 * werden darf — und sie ist bewusst so gebaut, dass ein unbekanntes Subjekt
 * gesperrt ist statt erlaubt. Wer ein Produkt hinzufuegt und den Eintrag
 * vergisst, bekommt kein Bild, keinen stillen Durchlauf.
 */
export function bildFuerOeffentlich(subjekt: string): string | null {
  const a = assetZu(subjekt)
  if (!a) return null
  if (!darfOeffentlich(a.lage)) return null
  return a.datei
}
