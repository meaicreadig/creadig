import { getVertriebStore } from "@/lib/lead-store"
import {
  RELEASE_SCOPES,
  benoetigtFuerFall,
  deckung,
  gedeckteScopes,
  type Release,
  type ReleaseForm,
  type ReleaseScope,
} from "@/lib/proof"
import { caseStudies, type CaseStudy } from "@/lib/site-data"
import { tuerkischVergleich } from "@/lib/tuerkisch"

/**
 * B-1 · DIE BRÜCKE: WAS DER KUNDE ERLAUBT HAT, ENTSCHEIDET, WAS ÖFFENTLICH STEHT.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE LÜCKE, DIE DIESE DATEI SCHLIESST
 *
 * Der Admin führt seit ADM-05 Erlaubnisse: wer sie erteilt hat, in welcher
 * Form, wofür genau, und ob sie zurückgezogen wurde. Die öffentliche Seite
 * hat davon bisher nichts gewusst. Sie las ihre Freigaben aus dem Quelltext
 * (`caseStudies[].releases`) — also aus einem Stand, den ein Deploy setzt und
 * ein Widerruf nicht erreicht.
 *
 * Damit war die Kette offen: Lieferung → Beleg → Erlaubnis → …und dann nichts.
 * Ein Kunde konnte seine Erlaubnis im Admin zurückziehen, und die Seite hätte
 * seinen Fall weiter gezeigt, bis jemand eine Datei ändert und neu ausliefert.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE RICHTUNG: INHALT AUS DEM REPOSITORY, ERLAUBNIS AUS DEM ADMIN
 *
 * Der TEXT eines Falls (Kapitel, Zahlen, Zitat) bleibt im Repository — er ist
 * redaktionelle Arbeit, keine Laufzeitdatei, und er gehört in die Review eines
 * Menschen. Was aus dem Admin kommt, ist ausschliesslich die Antwort auf:
 * „Darf das öffentlich stehen, und welcher Teil davon?"
 *
 * Damit besitzt jede Seite genau eine Wahrheit: Text hier, Erlaubnis dort.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * FAIL CLOSED — DIE WICHTIGSTE REGEL DIESER DATEI
 *
 * Ist die Datenbank nicht erreichbar, antwortet diese Datei mit „keine Fälle".
 * Nicht mit „alle", nicht mit „die aus dem Quelltext". Ein Ausfall darf
 * niemals dazu führen, dass etwas öffentlich wird, was ein Mensch nicht
 * erlaubt hat. Eine leere Werkschau ist ein Schönheitsfehler; ein
 * veröffentlichter Kundenname ohne Erlaubnis ist ein Rechtsbruch.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ERLAUBNIS IST NICHT GLEICH ERLAUBNIS
 *
 * Eine Freigabe für das Logo erlaubt keine Kennzahl, und eine für den Namen
 * kein Zitat. Diese Datei prüft deshalb FELDWEISE (`lib/proof.ts`): Was nicht
 * gedeckt ist, wird nicht maskiert oder angedeutet — es wird weggelassen.
 */

/** Ein Fall, wie ihn die Öffentlichkeit sehen darf — nie mehr als das. */
export type OeffentlicherFall = Omit<CaseStudy, "releases"> & {
  /** Welche Umfänge diese Veröffentlichung trägt — für Prüfung und Protokoll. */
  gedeckt: ReleaseScope[]
}

export type Projektion = {
  faelle: OeffentlicherFall[]
  /**
   * Woher die Erlaubnislage kam. `keine` heisst: nicht lesbar — und dann ist
   * die Liste leer, nicht „vollständig".
   */
  quelle: "admin" | "keine"
  grund: string | null
}

/** Namen vergleichbar machen: Groß/klein, türkische Buchstaben, Rechtsform, Zeichensetzung. */
function nenner(name: string): string {
  return tuerkischVergleich(name)
    .replace(/\b(gmbh|ug|ag|kg|ohg|gbr|e\.?k\.?|haftungsbeschraenkt|co|mbh)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

/** Die Zeile aus dem Admin in die Form, die `lib/proof.ts` kennt. */
function alsRelease(row: {
  by: { name: string; role: string; company: string }
  form: string
  grantedOn: string
  scopes: string[]
  reference: string
  withdrawnAt: string | null
}): Release {
  return {
    by: row.by,
    form: row.form as ReleaseForm,
    at: row.grantedOn,
    /* Unbekannte Umfänge fallen weg, statt „alles" zu bedeuten. */
    scopes: row.scopes.filter((s): s is ReleaseScope => (RELEASE_SCOPES as readonly string[]).includes(s)),
    reference: row.reference,
    withdrawnAt: row.withdrawnAt,
  }
}

/**
 * Die ungepufferte Fassung — fuer Probelaeufe.
 *
 * `unstable_cache` braucht den Anfragekontext von Next; ein Probelauf hat
 * keinen. Geprueft wird deshalb diese Funktion, und der Zwischenspeicher
 * bleibt das, was er ist: eine Hülle mit einer Marke.
 */
export async function projektionOhneCache(): Promise<Projektion> {
  const store = getVertriebStore()
  if (!store) return { faelle: [], quelle: "keine", grund: "kein Speicher eingerichtet" }

  let zeilen
  try {
    zeilen = await store.listReleases()
  } catch {
    return { faelle: [], quelle: "keine", grund: "Erlaubnisse nicht lesbar" }
  }
  /* `null` heisst „nicht lesbar" — nicht „keine Erlaubnis erteilt". Beides
     endet hier gleich, aber der Grund gehört ins Protokoll. */
  if (zeilen === null) return { faelle: [], quelle: "keine", grund: "Erlaubnisse nicht lesbar" }

  /* Erlaubnisse je Organisation, auf einen Nenner gebracht. */
  const jeFirma = new Map<string, Release[]>()
  for (const z of zeilen) {
    const schluessel = nenner(z.organisationName ?? "")
    if (!schluessel) continue
    const liste = jeFirma.get(schluessel) ?? []
    liste.push(alsRelease(z))
    jeFirma.set(schluessel, liste)
  }

  const faelle: OeffentlicherFall[] = []
  for (const fall of caseStudies) {
    const releases = jeFirma.get(nenner(fall.client)) ?? []
    if (releases.length === 0) continue

    /*
     * Der Bedarf fällt aus dem INHALT, nicht aus dem Wunsch: Wer eine Zahl
     * zeigt, braucht die Freigabe für Zahlen. Deshalb wird erst geprüft, was
     * der volle Fall verlangt — und wenn das nicht gedeckt ist, wird der Fall
     * auf das reduziert, was gedeckt IST. Nicht angedeutet, nicht maskiert:
     * weggelassen.
     */
    const gedeckt = gedeckteScopes(releases)
    const voll = deckung(releases, benoetigtFuerFall({ metriken: fall.metrics.length, hatZitat: fall.voice !== null }))
    const metrics = voll.fehlend.includes("zahl") ? [] : fall.metrics
    const voice = voll.fehlend.includes("zitat") ? null : fall.voice
    const rest = deckung(releases, benoetigtFuerFall({ metriken: metrics.length, hatZitat: voice !== null }))
    /* Ohne Namen und Fallstudie gibt es keinen Fall — der Rest wäre anonym und damit sinnlos. */
    if (!rest.gedeckt) continue

    const { releases: _codeseitig, ...inhalt } = fall
    faelle.push({
      ...inhalt,
      metrics,
      voice,
      /*
       * Das Bild braucht die Logo-Erlaubnis — und die steht NICHT im Bedarf
       * eines Falls. Gemessen am 24.09.2026: `voll.fehlend` enthaelt `logo`
       * nie, weil `benoetigtFuerFall()` es nie verlangt. Die Pruefung lief
       * damit ins Leere, und ein Bild des Kunden waere mit einer reinen
       * Textfreigabe oeffentlich geworden. Gefragt wird deshalb direkt, was
       * gedeckt IST.
       */
      image: gedeckt.has("logo") ? fall.image : null,
      gedeckt: benoetigtFuerFall({ metriken: metrics.length, hatZitat: voice !== null }),
    })
  }

  return { faelle, quelle: "admin", grund: null }
}

/**
 * Die Marke, an der die oeffentliche Seite haengt.
 *
 * Sie steht HIER und nicht bei der zwischengespeicherten Fassung, damit auch
 * die Admin-Aktionen sie benutzen koennen, ohne `next/cache` in einen
 * Probelauf zu ziehen (dort gibt es keinen Anfragekontext).
 */
export const FREIGABEN_TAG = "freigaben-oeffentlich"
