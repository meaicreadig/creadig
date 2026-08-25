import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  aggregateRating,
  approvedReviews,
  caseChapterKeys,
  caseStudies,
  clientWorks,
  impactFigures,
  filledChapters,
  imprintComplete,
  imprintDetails,
  processors,
  productStatus,
  productWorks,
  productWorlds,
  retainerPublished,
  socialProfiles,
} from "@/lib/site-data"
import { CLIENT_LOGOS } from "@/lib/client-logos.generated"
import { COMPANY_PHOTOS, COMPANY_PHOTO_SLOTS } from "@/lib/company-media.generated"
import { productScreens } from "@/lib/product-media"
import { publishedInsights } from "@/lib/insights"

/**
 * BF-5 — was fehlt, an einer Stelle sichtbar.
 *
 * ---------------------------------------------------------------------------
 * DAS PROBLEM
 * Die ganze Seite ist darauf gebaut, dass fehlendes Material NICHT gezeigt
 * wird: kein Screenshot, kein Bild; keine Bewertung, kein Sterne-Block; kein
 * Artikel, keine Liste. Das ist richtig — und es hat einen Preis: Die Lücken
 * sind unsichtbar. Wer die Seite ansieht, sieht nicht, was fehlt, sondern
 * eine Seite, die schlanker aussieht als sie sein könnte. Zwei Fotos, zwei
 * Sätze und eine Freigabe, die seit Monaten ausstehen, fallen genau niemandem
 * auf.
 *
 * Diese Seite dreht das um. Sie ERFINDET nichts und ändert nichts — sie liest
 * dieselben Daten, aus denen die Seite gebaut wird, und sagt, was leer ist.
 *
 * ---------------------------------------------------------------------------
 * WARUM SIE NICHT ÖFFENTLICH IST
 * Sie ist eine Innenansicht: offene Verträge, fehlende Freigaben, ein
 * unfertiges Impressum. In der Entwicklung ist sie einfach da. Im Betrieb
 * antwortet sie mit 404, solange nicht `?key=` den Wert aus
 * `SELFTEST_SECRET` trägt — derselbe Schlüssel wie beim Zustell-Selbsttest,
 * damit es nicht zwei Geheimnisse gibt, die beide jemand verlieren kann.
 */
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Materialstand",
  robots: { index: false, follow: false },
}

type Item = {
  label: string
  ok: boolean
  detail: string
  /** Wer es liefern muss. Fast alles hier ist Owner-Sache. */
  owner: string
}

function collect(): { open: Item[]; done: Item[] } {
  const items: Item[] = []

  /* ── Belege ─────────────────────────────────────────────────────────── */
  items.push({
    label: "Bewertungen (E-K2)",
    ok: approvedReviews.length > 0,
    detail:
      approvedReviews.length > 0
        ? `${approvedReviews.length} freigegeben, Durchschnitt ${aggregateRating?.value ?? "—"}`
        : "keine. Der Bewertungsblock und aggregateRating bleiben aus.",
    owner: "Owner: zufriedene Altkunden um eine Google-Bewertung bitten",
  })

  items.push({
    label: "Echte Zahlen fürs Fundament-Band (§10.2)",
    ok: impactFigures.every((figure) => figure.value !== null),
    detail:
      impactFigures
        .filter((figure) => figure.value === null)
        .map((figure) => figure.key)
        .join(", ") || "alle Kennziffern belegt",
    owner:
      "Owner: produktive Systeme, automatisierte Vorgänge, Jahre im Betrieb — " +
      "belegbar, nicht geschätzt. Bis dahin rendern die Kacheln nicht.",
  })

  items.push({
    label: "Fachartikel / Insights (S-1)",
    ok: publishedInsights.length > 0,
    detail:
      publishedInsights.length > 0
        ? `${publishedInsights.length} veröffentlicht`
        : "keiner. /insights steht auf noindex und fehlt in der Sitemap.",
    owner: "Owner: zwei Fachartikel als Vertriebsmaterial",
  })

  items.push({
    label: "Kundenlogos",
    ok: Object.keys(CLIENT_LOGOS).length > 0,
    detail:
      Object.keys(CLIENT_LOGOS).length > 0
        ? `${Object.keys(CLIENT_LOGOS).length} Logo(s) unter public/brand/clients/`
        : "keine. Die Logowand rendert nicht.",
    owner: "Owner: Logos mit Nutzungserlaubnis ablegen",
  })

  /* ── Produkt-Aufnahmen (C-1) ────────────────────────────────────────── */
  for (const product of productWorks) {
    const screens = productScreens(product.slug)
    items.push({
      label: `Aufnahmen ${product.name} (C-1)`,
      ok: screens.length > 0,
      detail:
        screens.length > 0
          ? `${screens.length} Aufnahme(n)`
          : `keine unter public/works/products/${product.slug}/ — die Interface-Sektion rendert nicht.`,
      owner: "Owner: echte Screenshots aus dem laufenden System",
    })
  }

  /* ── Produkt-Tiefe (V2-4b · §10.5) ──────────────────────────────────── */
  for (const product of productWorks) {
    const world = productWorlds[product.slug]
    const fehlend = [
      world?.problem ? null : "Problem",
      world?.thesis ? null : "These",
      world?.functions.length ? null : "Funktionen",
      world?.architecture ? null : "System/Architektur",
      world?.operations ? null : "Betrieb",
      world?.learnings.length ? null : "Learnings",
      world?.story ? null : "Warum gebaut",
    ].filter(Boolean)
    items.push({
      label: `Produkt-Tiefe ${product.name} (§10.5)`,
      ok: fehlend.length === 0,
      detail:
        fehlend.length === 0
          ? "vollständig"
          : `fehlt: ${fehlend.join(", ")} — diese Abschnitte rendern nicht. ` +
            `Status-Badge steht (abgeleitet: ${productStatus(product)}).`,
      owner: "Owner: Problem, These, Funktionen, Architektur, Betrieb, Learnings",
    })
  }

  /* ── Referenzen (C-2) ───────────────────────────────────────────────── */
  for (const work of clientWorks) {
    items.push({
      label: `Freigabe ${work.name} (C-2)`,
      ok: work.approvalOnFile === true && Boolean(work.approvedSentence),
      detail:
        work.approvalOnFile === true
          ? work.approvedSentence
            ? "Freigabe und Satz liegen vor"
            : "Freigabe liegt vor, der Satz zu Aufgabe/Ergebnis fehlt"
          : "keine schriftliche Freigabe hinterlegt",
      owner: "Owner: schriftliche Freigabe + ein Satz Aufgabe/Ergebnis",
    })
    items.push({
      label: `Umfang & Jahr ${work.name}`,
      ok: Boolean(work.built) && Boolean(work.year),
      detail: [
        work.built ? null : "Umfang fehlt",
        work.year ? null : "Jahr fehlt",
        work.region ? null : "Region fehlt",
      ]
        .filter(Boolean)
        .join(", ") || "vollständig",
      owner: "Owner: Angaben bestätigen — nichts wird geschätzt",
    })
  }

  /* ── Fallbeschreibungen (V2-4) ──────────────────────────────────────── */
  for (const study of caseStudies) {
    const filled = filledChapters(study)
    const fehlend = caseChapterKeys.filter((key) => !study.chapters[key])
    items.push({
      label: `Fall ${study.client} (§10.4)`,
      ok: study.approved && filled.length === caseChapterKeys.length,
      detail: study.approved
        ? fehlend.length === 0
          ? "alle acht Kapitel stehen"
          : `freigegeben, aber ohne: ${fehlend.join(", ")}`
        : `nicht freigegeben — ${filled.length} von ${caseChapterKeys.length} Kapiteln, ` +
          `${study.metrics.length} Kennzahl(en), Stimme ${study.voice ? "liegt vor" : "fehlt"}. ` +
          "Der Fall erscheint nirgends.",
      owner:
        "Owner: Ausgangslage, Problem, Ziel, unsere Rolle, System, Umsetzung, Ergebnis, Heute — " +
        "dazu Kennzahlen mit Quelle und ein freigegebenes Zitat",
    })
  }

  /* ── Rechtliches ────────────────────────────────────────────────────── */
  items.push({
    label: "Impressum vollständig",
    ok: imprintComplete,
    detail: [
      imprintDetails.legalForm ? null : "Rechtsform fehlt",
      imprintDetails.vatId || imprintDetails.smallBusiness ? null : "Umsatzsteuer-Status fehlt",
      imprintDetails.mstvResponsible ? null : "Verantwortlicher nach MStV fehlt",
      imprintDetails.phone ? null : "deutsche Rufnummer fehlt",
    ]
      .filter(Boolean)
      .join(", ") || "vollständig",
    owner: "Owner: Steuerstatus und Rufnummer freigeben",
  })

  for (const processor of processors) {
    items.push({
      label: `Auftragsverarbeitung ${processor.company}`,
      ok: processor.dpaConfirmed,
      detail: processor.dpaConfirmed
        ? "im Dashboard bestätigt und abgelegt"
        : "noch nicht bestätigt — der offene Hinweis steht auf der Datenschutzseite",
      owner: "Owner: Vertrag im Dashboard bestätigen und ablegen",
    })
  }

  /* ── Betrieb ────────────────────────────────────────────────────────── */
  items.push({
    label: "Zustell-Selbsttest aktiviert (BF-8)",
    ok: Boolean(process.env.SELFTEST_SECRET),
    detail: process.env.SELFTEST_SECRET
      ? "SELFTEST_SECRET gesetzt — /api/selftest antwortet"
      : "SELFTEST_SECRET fehlt; die Route ist abgeschaltet und niemand merkt einen Ausfall",
    owner: "Owner: Geheimnis setzen und einen Cron darauf zeigen lassen",
  })

  items.push({
    label: "Lead-Weg konfiguriert",
    ok: Boolean(process.env.RESEND_API_KEY && process.env.LEAD_FROM),
    detail:
      process.env.RESEND_API_KEY && process.env.LEAD_FROM
        ? "RESEND_API_KEY und LEAD_FROM gesetzt"
        : "ohne diese Werte antwortet /api/lead mit 503 — keine Anfrage kommt an",
    owner: "Owner: Werte in Vercel hinterlegen",
  })

  items.push({
    label: "Echte Fotos aus dem Haus (§10.6)",
    ok: COMPANY_PHOTO_SLOTS.every((slot) => COMPANY_PHOTOS[slot]),
    detail:
      COMPANY_PHOTO_SLOTS.filter((slot) => !COMPANY_PHOTOS[slot]).join(", ") ||
      "alle vier Slots belegt",
    owner:
      "Owner: Fotos nach public/images/unternehmen/<slot>.jpg — " +
      "buero, ico, arbeitsplatz, whiteboard. Kein Stock. Ohne Foto keine Sektion.",
  })

  items.push({
    label: "Arbeitsmodell — Wortlaut bestätigt (§10.6)",
    ok: false,
    detail:
      "Der Abschnitt \u201eSo arbeiten wir\u201c steht und behauptet nichts Neues " +
      "(founder-led, kleines Kernteam, Netzwerk im DACH-Raum \u2014 alles stand " +
      "vorher schon in \u201eÜber uns\u201c). Der genaue Wortlaut ist Entwurf.",
    owner: "Owner: Wortlaut durchlesen und bestätigen oder ändern",
  })

  items.push({
    label: "Social-Profile (E-K7)",
    ok: socialProfiles.length > 0,
    detail:
      socialProfiles.length > 0
        ? `${socialProfiles.length} verlinkt`
        : "keine. Der Footer-Block und sameAs entfallen — bewusst, solange keins gepflegt wird.",
    owner: "Owner: entscheiden, ob ein Profil gepflegt wird",
  })

  items.push({
    label: "Laufende Betreuung veröffentlicht",
    ok: retainerPublished,
    detail: retainerPublished ? "Preis und Umfang stehen" : "Block rendert nicht",
    owner: "—",
  })

  items.push({
    label: "Zertifizierungen & Mitgliedschaften (§9.9)",
    ok: false,
    detail:
      "keine. BAFA, iuk, AVPQ und AGD sind aus Daten, Seite und strukturierten " +
      "Daten entfernt — keiner der vier Einträge war belegt. Die Seite behauptet " +
      "keinen Nachweis mehr, den ein Dritter nicht bestätigen kann.",
    owner: "Owner: entscheiden, welche real erworben wird — dann mit Nachweis zurück",
  })

  return { open: items.filter((item) => !item.ok), done: items.filter((item) => item.ok) }
}

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const key = typeof params.key === "string" ? params.key : ""
  const secret = process.env.SELFTEST_SECRET

  /*
    In der Entwicklung immer erreichbar, im Betrieb nur mit dem Schluessel.
    Ohne gesetztes Geheimnis gibt es die Seite im Betrieb gar nicht — lieber
    keine Statusseite als eine offene Innenansicht.
  */
  if (process.env.NODE_ENV === "production" && (!secret || key !== secret)) {
    notFound()
  }

  const { open, done } = collect()

  return (
    <main className="section-gutter pt-32 pb-24 md:pt-40">
      <p className="eyebrow text-gold-text">Interne Ansicht · nicht öffentlich</p>
      <h1 className="type-h1 mt-6 text-balance">Materialstand</h1>
      <p className="type-lead text-muted-foreground mt-6 max-w-2xl text-pretty">
        Abgeleitet aus denselben Daten, aus denen die Seite gebaut wird. Diese Seite ändert
        nichts und erfindet nichts — sie sagt, was leer ist.
      </p>

      <section className="mt-16">
        <h2 className="type-h3">
          Offen <span className="text-muted-foreground">({open.length})</span>
        </h2>
        {open.length === 0 ? (
          <p className="type-body text-muted-foreground mt-6">Nichts offen.</p>
        ) : (
          <ul className="mt-8 flex flex-col">
            {open.map((item) => (
              <li key={item.label} className="border-line border-t py-5">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-subhead text-lg">{item.label}</span>
                  <span className="border-gold/50 text-gold-text eyebrow border px-2 py-0.5">
                    offen
                  </span>
                </div>
                <p className="type-small text-muted-foreground mt-2 text-pretty">{item.detail}</p>
                {item.owner !== "—" && (
                  <p className="text-meta text-muted-foreground mt-2">{item.owner}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-20">
        <h2 className="type-h3">
          Steht <span className="text-muted-foreground">({done.length})</span>
        </h2>
        <ul className="mt-8 flex flex-col">
          {done.map((item) => (
            <li key={item.label} className="border-line border-t py-4">
              <span className="text-subhead">{item.label}</span>
              <span className="type-small text-muted-foreground ml-3">{item.detail}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
