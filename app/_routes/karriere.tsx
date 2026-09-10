import type { Metadata } from "next"
import { KarrierePageBody } from "@/components/pages/karriere-page-body"
import { KarriereSpurABody } from "@/components/pages/karriere-spur-a-body"
import { KarriereSpurBBody } from "@/components/pages/karriere-spur-b-body"
import { KarriereBewerbenPageBody } from "@/components/pages/karriere-bewerben-body"
import { dictionary, type Locale } from "@/lib/dictionary"
import { pageMetadata } from "@/lib/page-metadata"
import { breadcrumbList, jsonLdScript } from "@/lib/json-ld"
import { gibtOffeneStelle, rolleFuer } from "@/lib/karriere"
import { kopf } from "@/lib/karriere-inhalt"

/*
 * ===========================================================================
 * KARRIERE — DIE VIER ROUTEN
 * ===========================================================================
 *
 * Die deutschen Pfade sind kanonisch und gelten in allen vier Sprachbäumen
 * (`/tr/karriere`, `/en/karriere`, `/ar/karriere`) — genau wie bei
 * `/leistungen` und `/produkte`. `lib/routes.ts` übersetzt nur dort, wo ein
 * Mensch tatsächlich nach dem anderen Wort sucht; „karriere“ ist keiner
 * dieser Fälle, und ein zweiter Router wäre die teurere Lösung für ein
 * Problem, das es nicht gibt.
 *
 * ---------------------------------------------------------------------------
 * WARUM HIER KEIN `JobPosting` STEHT
 *
 * Die naheliegende SEO-Bewegung wäre, jede Spur als `JobPosting`
 * auszuzeichnen — Stellenanzeigen bekommen bei Google eine eigene Darstellung
 * und deutlich mehr Sichtbarkeit.
 *
 * Beide Spuren stehen auf `talent-pool`. Ein Talent Pool ist KEINE Stelle:
 * Es gibt kein Startdatum, kein Budget und keine Freigabe. Wer ihn trotzdem
 * als `JobPosting` meldet, sagt einer Maschine dasselbe, was er einem
 * Menschen nicht ins Gesicht sagen würde — und die Suchmaschine gibt es an
 * Menschen weiter, die sich dann bewerben.
 *
 * Die Auszeichnung entsteht deshalb aus `gibtOffeneStelle`, also aus der
 * Wahrheit in `lib/karriere.ts` und nicht aus einer Entscheidung an dieser
 * Stelle. Solange keine Stelle offen ist, ist die Seite eine `WebPage` —
 * was sie auch ist.
 */

const PFAD = "/karriere"

export function karriereMetadata(locale: Locale): Metadata {
  const copy = dictionary[locale].karriere
  return pageMetadata({
    locale,
    path: PFAD,
    title: copy.metaTitle,
    description: copy.metaDescription,
  })
}

function jsonLd(locale: Locale) {
  const t = dictionary[locale]
  return [
    breadcrumbList(locale, [{ name: t.nav.karriere, path: PFAD }]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: t.karriere.metaTitle,
      description: t.karriere.metaDescription,
      inLanguage: locale,
      /* Die Absichtserklärung als Text — nicht als Stellenanzeige. */
      about: kopf.wahrheit[locale],
    },
  ]
}

export function KarriereRoute({ locale }: { locale: Locale }) {
  /*
   * Eine Sicherung, die im Build zuschlägt und nicht erst im Betrieb: Wenn
   * jemand eine Rolle auf „offen“ setzt, ohne die Auszeichnung anzufassen,
   * fällt es hier auf.
   */
  if (gibtOffeneStelle && process.env.NODE_ENV !== "production") {
    console.warn(
      "[karriere] Eine Rolle steht auf „offen“. Vor dem Livegang gehoert dann eine " +
        "JobPosting-Auszeichnung dazu — mit allen Pflichtangaben, die sie verlangt.",
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd(locale)) }}
      />
      <KarrierePageBody />
    </>
  )
}

/* ── Spur A ──────────────────────────────────────────────────────────────── */

export function karriereSpurAMetadata(locale: Locale): Metadata {
  const rolle = rolleFuer("dach-business-development")
  return pageMetadata({
    locale,
    path: rolle.pfad,
    title: dictionary[locale].karriere.spurAMeta,
    description: rolle.unterschied[locale],
  })
}

export function KarriereSpurARoute({ locale }: { locale: Locale }) {
  const t = dictionary[locale]
  const rolle = rolleFuer("dach-business-development")
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            breadcrumbList(locale, [
              { name: t.nav.karriere, path: PFAD },
              { name: rolle.titel[locale], path: rolle.pfad },
            ]),
          ]),
        }}
      />
      <KarriereSpurABody />
    </>
  )
}

/* ── Spur B ──────────────────────────────────────────────────────────────── */

export function karriereSpurBMetadata(locale: Locale): Metadata {
  const rolle = rolleFuer("founding-talent")
  return pageMetadata({
    locale,
    path: rolle.pfad,
    title: dictionary[locale].karriere.spurBMeta,
    description: rolle.unterschied[locale],
  })
}

export function KarriereSpurBRoute({ locale }: { locale: Locale }) {
  const t = dictionary[locale]
  const rolle = rolleFuer("founding-talent")
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            breadcrumbList(locale, [
              { name: t.nav.karriere, path: PFAD },
              { name: rolle.titel[locale], path: rolle.pfad },
            ]),
          ]),
        }}
      />
      <KarriereSpurBBody />
    </>
  )
}

/* ── Bewerben ────────────────────────────────────────────────────────────── */

export function karriereBewerbenMetadata(locale: Locale): Metadata {
  return pageMetadata({
    locale,
    path: "/karriere/bewerben",
    title: dictionary[locale].karriere.bewerbenMeta,
    description: dictionary[locale].karriere.metaDescription,
    /* Ein Formular gehoert nicht in den Index. */
    noIndex: true,
  })
}

export function KarriereBewerbenRoute() {
  return <KarriereBewerbenPageBody />
}
