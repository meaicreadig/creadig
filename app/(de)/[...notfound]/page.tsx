import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SeoLandingRoute, seoLandingMetadata } from "@/app/_routes/seo-landing"
import { findSeoLanding, publishedSeoLandings } from "@/lib/seo-landings"

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
 *
 * ---------------------------------------------------------------------------
 * MP10-5 — UND SIE LIEFERT DIE SEO-LANDINGS AUS.
 *
 * Landings wie „/webentwicklung-osnabrueck" gehören unter die Wurzel; dort
 * sucht man sie, und dort ist die Adresse kurz genug, um sie vorzulesen. Eine
 * eigene `[slug]`-Route waere der naheliegende Weg gewesen — und haette
 * genau diese Catch-all verdraengt: Ein `[slug]` ist spezifischer als ein
 * `[...notfound]`, also haette JEDE unbekannte einteilige Adresse dort
 * geendet statt auf der gebauten 404-Seite.
 *
 * Deshalb prueft diese Route zuerst die Landing-Liste und faellt nur durch,
 * wenn nichts passt. Solange die Liste leer ist (Owner-Punkt), aendert sich
 * nichts: `generateStaticParams` gibt nichts zurueck, und jeder Aufruf endet
 * wie vorher bei `notFound()`.
 */
export function generateStaticParams() {
  return publishedSeoLandings.map((landing) => ({ notfound: [landing.slug] }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ notfound?: string[] }>
}): Promise<Metadata> {
  const { notfound } = await params
  const landing = notfound?.length === 1 ? findSeoLanding(notfound[0]) : undefined
  /* Keine Landing = 404. Die Fehlerseite traegt ihre Kopfdaten selbst. */
  if (!landing) return {}
  return seoLandingMetadata("de", landing)
}

export default async function CatchAll({
  params,
}: {
  params: Promise<{ notfound?: string[] }>
}) {
  const { notfound } = await params
  const landing = notfound?.length === 1 ? findSeoLanding(notfound[0]) : undefined
  if (!landing) notFound()
  return <SeoLandingRoute locale="de" landing={landing} />
}
