import type { ReactNode } from "react"

import { Surface } from "@/components/admin/primitives"
import { adminTexte, type AdminSprache } from "@/lib/admin-i18n"

/**
 * ADM-06 · H23 — die Bausteine, die das WÖRTERBUCH brauchen.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM SIE NICHT MEHR IN `primitives.tsx` STEHEN
 *
 * `primitives.tsx` liefert die Formularbausteine, und die benutzt auch das
 * Anmeldeformular. Über den Import von `adminTexte` lag damit das GESAMTE
 * Admin-Wörterbuch — beide Sprachen, jeder Abschnitt — im Browser-Paket der
 * Anmeldeseite.
 *
 * Gemessen am 17.09.2026: Das Erstpaket von `/admin/login` wuchs im Lauf
 * dieses Programms von 144 kB auf 156 kB, und jede neue Welle hätte es
 * weiter wachsen lassen. Zwei Dinge daran sind falsch:
 *
 *   1 · Wer die Anmeldeseite öffnet, ohne angemeldet zu sein, konnte jeden
 *       Text des Admin lesen — Bereichsnamen, Regeln, Befunde. Dieselbe Art
 *       Auskunft wie H11, nur ausführlicher.
 *   2 · Die Seite, die am schnellsten sein soll, bezahlte für Texte, die sie
 *       nie zeigt. Und bis sie hydratisiert war, fiel das Formular auf den
 *       Weg ohne JavaScript zurück.
 *
 * Die Trennung ist deshalb keine Aufräumarbeit: Sie hält das Wörterbuch aus
 * jedem Paket heraus, das es nicht anzeigt.
 */

/* ------------------------------------------------------------------------ */
/* Wert mit Beschriftung                                                     */
/* ------------------------------------------------------------------------ */

export function DataValue({
  label,
  children,
}: {
  label: string
  /** `null`/`undefined` heißt: unbekannt. Nicht null, nicht leer — unbekannt. */
  children?: ReactNode
}) {
  const empty = children === null || children === undefined || children === ""
  return (
    <div>
      <dt className="text-meta text-muted-foreground">{label}</dt>
      <dd className={`mt-1 text-sm ${empty ? "text-muted-foreground" : "text-foreground"}`}>
        {empty ? <Unknown /> : children}
      </dd>
    </div>
  )
}

/**
 * Der Gedankenstrich ist der wichtigste Baustein dieser Datei.
 *
 * „0" ist eine Messung. „—" ist das Eingeständnis, nicht gemessen zu haben.
 * Wo eine Quelle fehlt, muss die Oberfläche das sagen und darf nicht die
 * beruhigendere Zahl zeigen. `title` macht es auch für Vorleseprogramme und
 * für die Maus eindeutig.
 */
export function Unknown({ sprache = "de" }: { sprache?: AdminSprache }) {
  const t = adminTexte(sprache).primitives
  return (
    <span className="text-muted-foreground" title={t.keineAngabe}>
      —<span className="sr-only"> {t.keineAngabeKlein}</span>
    </span>
  )
}

/**
 * DER SPEICHERSTAND — vier Zustaende, eine Stelle.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES IHN GIBT
 * Die Mappen im Vertrieb meldeten bis zum 09.09.2026 nur den FEHLER. Die
 * Befund-Anzeige begann mit `if (antwort.ok || befunde.length === 0) return
 * null` — bei Erfolg also nichts, und waehrend des Speicherns auch nichts.
 *
 * Der Owner drueckt „Speichern" und sieht: nichts. Er weiss nicht, ob der
 * Klick angekommen ist, ob noch gerechnet wird, ob es geklappt hat. Also
 * drueckt er noch einmal. Das ist keine Kosmetik — bei „Angebot senden" ist
 * der zweite Klick eine zweite Zusage.
 *
 * `useActionState` liefert den Wartezustand als drittes Element mit. Er war
 * da, er wurde nur nie ausgelesen.
 *
 * ---------------------------------------------------------------------------
 * WARUM `role="status"` UND KEIN TOAST
 * Ein Toast erscheint woanders als der Knopf und verschwindet von selbst —
 * wer die Maus fuehrt, sieht ihn nicht immer, und wer vorliest, gar nicht.
 * Diese Meldung steht, wo gehandelt wurde, und `aria-live="polite"` bringt
 * sie ins Vorleseprogramm, ohne die Eingabe zu unterbrechen.
 */
export function Speicherstand({
  wartet,
  ok,
  punkte,
  erfolgssatz,
  sprache = "de",
}: {
  wartet: boolean
  /**
   * `null` heisst: noch nichts abgeschickt. Nicht dasselbe wie Erfolg —
   * sonst stuende „Gespeichert." schon beim Oeffnen der Seite.
   */
  ok: boolean | null
  /**
   * Die offenen Punkte, auf ein Vokabular gebracht.
   *
   * Die Mappen nennen sie verschieden — `befunde`/`abschnitt` beim Angebot,
   * `maengel`/`bereich` bei der Lieferung. Das Primitive kennt keines von
   * beiden: Wer es benutzt, uebersetzt einmal beim Aufruf, und diese
   * Anzeige bleibt von der Fachsprache der Mappe unabhaengig.
   */
  punkte: { wo: string; satz: string }[]
  erfolgssatz?: string
  sprache?: AdminSprache
}) {
  const texte = adminTexte(sprache)
  const t = texte.primitives
  const gescheitert = ok === false && punkte.length > 0
  const gelungen = ok === true
  if (!wartet && !gescheitert && !gelungen) return null

  return (
    <div role="status" aria-live="polite" className="mt-4">
      {wartet ? (
        <p className="type-small text-muted-foreground">{texte.formular.speichernLaeuft}</p>
      ) : gelungen ? (
        <p className="type-small text-gold-text">{erfolgssatz ?? t.gespeichert}</p>
      ) : (
        <Surface padding="sm">
          <p className="type-small text-subhead">
            {t.offenePunkte(punkte.length)}
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {punkte.map((b, i) => (
              <li key={i} className="type-small text-muted-foreground text-pretty">
                <span className="text-foreground">{b.wo}: </span>
                {b.satz}
              </li>
            ))}
          </ul>
        </Surface>
      )}
    </div>
  )
}

/**
 * Der Hinweis, dass eine Liste abgeschnitten sein koennte.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES IHN GIBT
 * Jede Liste im Vertrieb holt hoechstens eine feste Zahl Zeilen — 100, 200,
 * 500. Vier der sechs sagen dazu „N von Total"; wer dort 100 von 340 liest,
 * weiss, dass er nicht alles sieht, und kann suchen oder filtern.
 *
 * Zwei sagten es nicht. Recherche und Verlust zeigten schlicht, was kam. Eine
 * Liste, die bei genau ihrer Obergrenze endet, sieht aus wie eine
 * vollstaendige — und der Owner sucht Datensatz 137 dann in einer Liste, die
 * bei 100 aufgehoert hat, ohne es zu sagen.
 *
 * Der Hinweis behauptet nichts, was er nicht weiss: Er sagt „koennte", weil
 * eine Liste, die genau die Obergrenze trifft, auch genau so lang sein kann.
 * Das ist dieselbe Unterscheidung wie ueberall in diesem Haus — nicht
 * gemessen ist nicht null.
 */
export function Abschneidehinweis({
  gezeigt,
  grenze,
  wie,
  sprache = "de",
}: {
  gezeigt: number
  grenze: number
  /** Was der Owner tun kann, um den Rest zu sehen. */
  wie: string
  sprache?: AdminSprache
}) {
  const t = adminTexte(sprache).primitives
  if (gezeigt < grenze) return null
  return (
    <p className="type-small text-muted-foreground border-line mt-4 border-s-2 py-1 ps-4 text-pretty">
      {t.abschneidehinweis(grenze, wie)}
    </p>
  )
}

