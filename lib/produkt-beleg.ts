import { productWorks } from "@/lib/site-data"

/* ==========================================================================
 * GATE 02 · WAS EIN EIGENES PRODUKT HEUTE BELEGT — UND WOHER WIR DAS WISSEN
 * ==========================================================================
 *
 * ---------------------------------------------------------------------------
 * DIE ZWEI BEFUNDE, DIE DIESE DATEI AUSGELOEST HABEN
 *
 * WEB-0002 — „Vier Produkte als Hauptbeweis, drei „im Aufbau", Details nennen
 * Bausteine statt Wirkung." Gemessen in Gate 00 und am 10.09.2026 erneut:
 * `/produkte/fibero` und `/produkte/meai` zeigen **0 Bilder** im `main`.
 *
 * Der eigentliche Fund liegt daneben. Es fehlt nicht das Material — es liegt
 * an der falschen Stelle:
 *
 *   Startseite      zeigt `/works/fibero.jpg` und `/works/meai.jpg`
 *                   — echte Oberflaechen, mit dem Canon-Label darunter.
 *   Produktseite    sagt „Oberflaechen zeigen wir erst, wenn wir die echte
 *                   Anwendung mit Demodaten aufnehmen koennen."
 *
 * Die Seite eines Produkts bestreitet damit, was die Startseite von genau
 * diesem Produkt zeigt. Das ist kein Materialmangel, das ist ein Widerspruch.
 *
 * WEB-0009 — „2-Faktor & Bot-Schutz folgen" auf `meai.run` als
 * Sicherheits-Gegensignal. In Gate 00 stand der Befund auf `EXTERNAL_BLOCKED`,
 * weil `meai.run` mit 307 antwortete und der Text von hier nicht pruefbar war.
 * Am 10.09.2026 ist er pruefbar: Der Redirect fuehrt auf `/login`, und dort
 * steht oeffentlich, ohne Anmeldung lesbar:
 *
 *   „Geschlossenes System · Zugang nur nach Verifizierung"
 *   „2-Faktor & Bot-Schutz folgen"
 *
 * Auf `/produkte/meai` stand daneben ein Knopf „Live oeffnen".
 *
 * ---------------------------------------------------------------------------
 * WAS DIESE DATEI IST — UND WAS SIE AUSDRUECKLICH NICHT IST
 * Sie ist ein Register **verifizierter oeffentlicher Tatsachen** ueber die
 * eigenen Produkte, jede mit Quelle und Pruefdatum. Sie ist KEINE zweite
 * Produktwahrheit: Name, Sektor, `live`, `outcome`, `image` und der Reifegrad
 * stehen weiter in `lib/site-data.ts` und `lib/material-status.ts`. Beide sind
 * G18-gesperrt und werden hier nur GELESEN.
 *
 * Sie ist auch keine zweite Freigabe-Maschine. Kundenbelege haengen
 * unveraendert an `lib/proof.ts` (`releases`), gesichert durch
 * `npm run proof-drill`. Hier geht es ausschliesslich um EIGENE Produkte —
 * die Art Beleg, die laut `docs/ops/proof-kinds.md` an niemandem haengt
 * ausser am Owner.
 *
 * ---------------------------------------------------------------------------
 * DIE REGEL FUER JEDEN EINTRAG
 * Jede Angabe traegt `quelle` und `geprueft`. Wer sie liest, kann die Frage
 * „Woher wissen wir das?" beantworten, ohne jemanden zu fragen. Steht dort
 * nichts, erscheint oeffentlich nichts.
 * ========================================================================== */

/** Woher eine Angabe stammt. Kein Eintrag ohne eine dieser Quellen. */
export type BelegQuelle =
  /** Im Repository nachlesbar (Datei, Datensatz, Bild). */
  | "repository"
  /** Auf der oeffentlichen Produktadresse ohne Anmeldung lesbar. */
  | "oeffentliche-produktseite"

/**
 * Wie ein Fremder heute an das Produkt herankommt.
 *
 *   `geschlossen`  Es gibt eine oeffentliche Adresse, aber kein offenes
 *                  Produkt: Anmeldung, Konto nach Verifizierung.
 *   `intern`       Keine oeffentliche Adresse. Laeuft im eigenen Betrieb.
 *   `offen`        Ohne Konto benutzbar. Heute trifft das auf kein Produkt zu.
 *
 * Diese Angabe ersetzt keinen Reifegrad. Ein Produkt kann fertig und
 * geschlossen sein, und ein offenes kann unfertig sein. Sie beantwortet nur
 * die Frage, die ein Besucher stellt, bevor er auf einen Knopf drueckt:
 * Was passiert, wenn ich klicke?
 */
export type Zugangslage = "offen" | "geschlossen" | "intern"

export type ProduktBeleg = {
  slug: string
  /**
   * Eine bereits oeffentlich ausgelieferte Aufnahme der echten Oberflaeche
   * „in situ" — im Einsatz fotografiert, nicht als Vollbild aufgenommen.
   *
   * `null` heisst NICHT „gibt es nicht". Es heisst: Gate 02 hat diese
   * Aufnahme nicht freigegeben, und `grundOhneBild` sagt warum. Der
   * Unterschied ist der ganze Punkt — siehe unten bei CASSAMEA und meahv.
   */
  situBild: string | null
  /** Warum kein Bild erscheint. Pflicht, sobald `situBild` `null` ist. */
  grundOhneBild: string | null
  zugang: Zugangslage
  /** Adresse, an der die Zugangslage nachprüfbar ist. `null` bei `intern`. */
  zugangHref: string | null
  quelle: BelegQuelle
  /** ISO-Datum der letzten Pruefung. Eine Tatsache ohne Datum verfaellt leise. */
  geprueft: string
}

/*
 * ---------------------------------------------------------------------------
 * WARUM NUR ZWEI DER VIER BILDER ERSCHEINEN
 *
 * Alle vier Produkte tragen in `site-data` ein `image` mit
 * `imageProof: "product-photo"` — laut Feldbeschreibung „echte eigene
 * Oberflaeche in situ (Demodaten ok)", vom Owner am 29./30.08.2026 gesetzt.
 *
 * Gate 02 hat die vier Dateien angesehen, bevor es sie an einer neuen Stelle
 * veroeffentlicht. Zwei davon halten dem Standard aus
 * `docs/ops/demo-data-standard.md` nicht erkennbar stand:
 *
 *   CASSAMEA  `/works/cassamea.jpg` zeigt „Kasse 1 - Luzern" und als
 *             Benutzer- und Tischnamen Personennamen, die nicht aus dem
 *             Musterbestand stammen (dieser lautet: Anke Rehberg,
 *             Tomasz Wilk, Merve Aydın, Jan Osterloh, Fatih Şen).
 *
 *   meahv     `/works/meahv.jpg` zeigt in „Fristen & Aufgaben" zwei
 *             Personennamen, ebenfalls nicht aus dem Musterbestand, dazu
 *             Anschriften — und in der Kopfzeile eine **verpixelte**
 *             E-Mail-Adresse. Der Standard sagt dazu woertlich: „Verpixeln
 *             reicht nicht." Eine Retusche ist ein Hinweis darauf, dass im
 *             Bild etwas stand, das nicht hineingehoerte.
 *
 * Beide Bilder sind heute an keiner Stelle der Website eingebunden. Sie hier
 * erstmals zu zeigen, waere eine NEUE Veroeffentlichung — und die traegt die
 * Beweislast, nicht der Verzicht. `docs/ops/demo-data-standard.md` Punkt 9
 * verlangt ohnehin, dass jemand anderes das Bild noch einmal ansieht; genau
 * das ist hier passiert, und das Ergebnis ist ein Nein.
 *
 * Das ist keine Aussage darueber, dass die Daten echt SIND. Es ist die
 * Aussage, dass sie nicht als synthetisch erkennbar sind — und die Regel
 * dieses Repositorys lautet im Zweifel: nicht zeigen. Aufloesen kann das nur
 * der Owner (Owner-Punkt OA-2).
 *
 * fibero und meAI liegen anders: Beide Aufnahmen werden seit dem 29.08.2026
 * auf der Startseite ausgeliefert, tragen dort das Canon-Label und zeigen
 * Bestaende, die als erfunden erkennbar sind (fibero: Objektzahlen auf einer
 * Karte, keine Personennamen; meAI: „Martin Brunner · Malerbetrieb Brunner",
 * ein Musterbetrieb im Sinne des Standards). Sie an der Stelle zu zeigen, an
 * der das Produkt erklaert wird, ist keine neue Veroeffentlichung — es ist
 * dieselbe, am richtigen Ort.
 * ---------------------------------------------------------------------------
 */
export const produktBelege: ProduktBeleg[] = [
  {
    slug: "fibero",
    situBild: "/works/fibero.jpg",
    grundOhneBild: null,
    /*
     * fibero hat keine oeffentliche Adresse (`href` in `site-data` ist nicht
     * gesetzt). Es laeuft im Glasfaser-Alltag — das ist der Beleg, und
     * „intern" ist die ehrliche Zugangslage dazu, nicht ein Mangel.
     */
    zugang: "intern",
    zugangHref: null,
    quelle: "repository",
    geprueft: "2026-09-10",
  },
  {
    slug: "meai",
    situBild: "/works/meai.jpg",
    grundOhneBild: null,
    /*
     * WEB-0009. `https://meai.run` antwortet mit 307 auf `/login?next=%2F`.
     * Dort steht ohne Anmeldung lesbar „Geschlossenes System · Zugang nur
     * nach Verifizierung". Also: erreichbar, aber nicht offen.
     *
     * Was hier bewusst NICHT steht: irgendeine Aussage ueber Sicherheit.
     * Dass auf derselben Seite „2-Faktor & Bot-Schutz folgen" steht, ist eine
     * Angabe des Produkts ueber sich selbst. creaDIG behauptet dazu hier
     * weder das Gegenteil noch etwas Beruhigendes — es behauptet nichts.
     */
    zugang: "geschlossen",
    zugangHref: "https://meai.run",
    quelle: "oeffentliche-produktseite",
    geprueft: "2026-09-10",
  },
  {
    slug: "cassamea",
    situBild: null,
    grundOhneBild: "demodaten-nicht-belegt",
    zugang: "intern",
    zugangHref: null,
    quelle: "repository",
    geprueft: "2026-09-10",
  },
  {
    slug: "meahv",
    situBild: null,
    grundOhneBild: "demodaten-nicht-belegt",
    zugang: "intern",
    zugangHref: null,
    quelle: "repository",
    geprueft: "2026-09-10",
  },
]

export function belegZu(slug: string): ProduktBeleg | undefined {
  return produktBelege.find((b) => b.slug === slug)
}

/**
 * Jedes Produkt aus `site-data` hat genau einen Beleg-Eintrag — die Bedingung,
 * die `scripts/check-beleg.mjs` prueft. Ein Produkt ohne Eintrag wuerde still
 * auf den Zustand „kein Bild, keine Zugangsangabe" fallen, und still ist
 * genau das, was hier nicht passieren darf.
 */
export const alleProdukteHabenBeleg = productWorks.every((p) =>
  produktBelege.some((b) => b.slug === p.slug),
)

/** Produkte, deren vorhandenes Bild Gate 02 zurueckgehalten hat. */
export const zurueckgehalteneBilder = produktBelege
  .filter((b) => b.situBild === null && b.grundOhneBild !== null)
  .map((b) => b.slug)
