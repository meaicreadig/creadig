import { renderOgImage } from "@/app/_routes/og-image"

/**
 * T-1 — das Vorschaubild des deutschen Baums unter einer STABILEN Adresse.
 *
 * ---------------------------------------------------------------------------
 * WARUM NICHT MEHR `opengraph-image.tsx`
 * Die Dateikonvention von Next erzeugt eine Adresse mit zwei Streuwerten
 * (`/opengraph-image-35z89a?ec56f5a4…`). Solange nur die Startseite ein Bild
 * brauchte, war das egal — sie bekam es automatisch. Sobald aber eine
 * Unterseite in ihren Kopfdaten ein eigenes `openGraph`-Objekt setzt, ersetzt
 * dieses das der Ebene darüber, und das Bild aus der Dateikonvention faellt
 * mit heraus. Gemessen: `/leistungen`, `/produkte`, `/arbeiten`, `/kontakt`,
 * `/unternehmen`, `/termin`, `/insights`, `/produkte/meai` und der ganze
 * `/tr/`-Baum lieferten KEIN `og:image`. Geteilt wurde also ein grauer Kasten
 * — ausgerechnet von einem Haus, das Marke verkauft.
 *
 * Ein gemeinsamer Kopfdaten-Helfer (`lib/page-metadata.ts`) kann das Bild fuer
 * jede Seite setzen — aber nur, wenn seine Adresse vorhersagbar ist. Genau das
 * ist diese Route.
 *
 * `force-static`: Das Bild haengt an nichts, was sich pro Aufruf aendert. Es
 * wird zur Bauzeit einmal gerendert und danach als Datei ausgeliefert, wie
 * vorher auch.
 */
export const dynamic = "force-static"

export function GET() {
  return renderOgImage("de")
}
