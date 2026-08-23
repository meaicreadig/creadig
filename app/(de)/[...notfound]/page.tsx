import { notFound } from "next/navigation"

/**
 * BF-3 — jede unbekannte deutsche Adresse landet hier und wird von hier aus
 * an `app/(de)/not-found.tsx` weitergereicht.
 *
 * Warum eine Catch-all-Route und nicht `app/not-found.tsx`: Dieses Projekt hat
 * ZWEI Wurzel-Layouts (`(de)` und `(tr)`) und deshalb kein `app/layout.tsx`.
 * Eine globale 404-Seite liefe damit ohne jedes Layout — ohne Navigation, ohne
 * Fußzeile, und vor allem ohne zu wissen, in welcher Sprache der Besucher
 * unterwegs war. Über die Catch-all-Route entscheidet dagegen der Pfad, in
 * welchem Sprachbaum die Seite gerendert wird, und das schon im Server-HTML.
 *
 * Statische Routen gewinnen immer gegen diese hier; sie fängt nur, was sonst
 * niemand beansprucht.
 */
export default function CatchAll() {
  notFound()
}
