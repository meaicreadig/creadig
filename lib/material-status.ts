/**
 * MP-G · Der Materialstand — eine Quelle, zwei Ansichten.
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS HIER LIEGT UND NICHT MEHR IN DER SEITE
 * Diese Erhebung stand als private Funktion in `app/(de)/status/page.tsx`.
 * Das war richtig, solange es eine Ansicht gab. Mit dem Control Center gibt
 * es zwei — und die naheliegende Bewegung wäre gewesen, sie zu kopieren.
 *
 * Zwei Kopien eines Lückenmelders sind schlimmer als keiner: Sie sagen
 * irgendwann Verschiedenes, und man glaubt der, die man gerade offen hat.
 *
 * ---------------------------------------------------------------------------
 * WAS SIE TUT
 * Sie liest dieselben Module, aus denen die Website gebaut wird, und sagt,
 * was leer ist. Sie ändert nichts, sie erfindet nichts, sie erhebt nichts —
 * jedes Feld hier existiert bereits im Repository.
 *
 * Verhalten unverändert gegenüber der Fassung in der Statusseite: Umzug,
 * keine Neufassung.
 */
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
  packages,
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
import { emptyInsightCategories, publishedInsights } from "@/lib/insights"
import { publishedSeoLandings, seoLandings } from "@/lib/seo-landings"
import { publishedServicePages } from "@/lib/service-pages"
import { connectedSystems } from "@/lib/systems"

export type Item = {
  label: string
  ok: boolean
  detail: string
  /** Wer es liefern muss. Fast alles hier ist Owner-Sache. */
  owner: string
}

export function collect(): { open: Item[]; done: Item[] } {
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

  /* ── Angebundene Systeme (MP10-4) ──────────────────────────────────── */
  items.push({
    label: "Angebundene Systeme (MP10-4)",
    ok: connectedSystems.length > 0,
    detail:
      connectedSystems.length > 0
        ? `${connectedSystems.length} System(e) bestätigt`
        : "keine. Der Abschnitt „Angebunden“ auf /systeme rendert nicht.",
    owner:
      "Owner: Systeme, die wir wirklich angebunden haben — Name + ein Satz je Eintrag. " +
      "Es ist die einzige Angabe auf /systeme, die ein Kunde im Gespräch nachprüfen kann.",
  })

  items.push({
    label: "SEO-Landings (MP10-5)",
    ok: publishedSeoLandings.length > 0,
    detail:
      publishedSeoLandings.length > 0
        ? `${publishedSeoLandings.length} von ${seoLandings.length} veröffentlicht`
        : "keine. Struktur steht (lib/seo-landings.ts), es existiert keine einzige Adresse.",
    owner:
      "Owner: welche Städte und welche Leistungen beworben werden sollen — " +
      "je Landing ein eigener Text, kein ausgetauschter Stadtname.",
  })

  items.push({
    label: "Insight-Fächer (MP10-4)",
    ok: emptyInsightCategories.length === 0,
    detail:
      emptyInsightCategories.length === 0
        ? "alle sechs Fächer gefüllt"
        : `leer: ${emptyInsightCategories.join(", ")} — diese Fächer erscheinen nicht auf /insights.`,
    owner:
      "Owner: je Fach mindestens ein Beitrag aus dem eigenen Betrieb. " +
      "Leere Fächer werden NICHT als „Demnächst“ angezeigt.",
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

  /* ── Leistungs-Tiefe: die vier Kauf-Fragen (MP10-1) ─────────────────── */
  for (const page of publishedServicePages) {
    const fehlend = [
      page.duration ? null : "Projektdauer",
      page.fromTo ? null : "vorher→nachher",
      page.clientEffort ? null : "Kundenaufwand",
    ].filter(Boolean)
    items.push({
      label: `Kauf-Fragen /leistungen/${page.slug} (MP10-1)`,
      ok: fehlend.length === 0,
      detail:
        fehlend.length === 0
          ? "alle vier Fragen beantwortet"
          : `Ablauf steht (aus dem Bestand abgeleitet). Es fehlt: ${fehlend.join(", ")} — ` +
            "diese Abschnitte rendern nicht.",
      owner:
        "Owner: reale Projektdauer, ein belegtes vorher→nachher und der Kundenaufwand " +
        "(Zeit, Zugänge, Material). Nichts davon wird geschätzt.",
    })
  }

  items.push({
    label: "Projektdauer neben den Preisen (MP10-2.3)",
    ok: packages.every((pkg) => pkg.duration !== null),
    detail:
      packages
        .filter((pkg) => pkg.duration === null)
        .map((pkg) => pkg.key)
        .join(", ") ||
      "alle Angebote nennen eine Dauer",
    owner:
      "Owner: wie lange das Website-Paket von der Zusage bis zum Livegang braucht " +
      "und wie lange die Prüfung bis zum Bericht. Ein Festpreis ohne Zeitrahmen " +
      "lässt die Unsicherheit stehen, die er beseitigen soll.",
  })

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
    label: "Materialstand in der Fußzeile (MP10-2.10)",
    ok: process.env.NEXT_PUBLIC_STATUS_PUBLIC === "1",
    detail:
      process.env.NEXT_PUBLIC_STATUS_PUBLIC === "1"
        ? "NEXT_PUBLIC_STATUS_PUBLIC=1 — der Link steht im Betrieb in der Fußzeile. " +
          "Dann muss diese Seite dort auch ohne Schlüssel antworten, sonst zeigt er auf eine 404."
        : "Der Link erscheint nur in der Entwicklung. Diese Seite ist eine Innenansicht " +
          "(offene Verträge, fehlende Freigaben, unfertiges Impressum) — ob sie öffentlich " +
          "wird, ist keine Code-Frage.",
    owner:
      "Owner: entscheiden, ob der Materialstand öffentlich sichtbar sein soll. " +
      "Ja → NEXT_PUBLIC_STATUS_PUBLIC=1 setzen und die Schlüsselsperre unten aufheben.",
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
    label: "Domain gesetzt",
    ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    detail: process.env.NEXT_PUBLIC_SITE_URL
      ? `NEXT_PUBLIC_SITE_URL = ${process.env.NEXT_PUBLIC_SITE_URL}`
      : "nicht gesetzt. Der Code fällt auf https://creadig.de zurück — " +
        "daran hängen die kanonischen Adressen, die Sitemap und jedes OG-Bild. " +
        "Stimmt die Adresse nicht, zeigen alle drei ins Leere, ohne dass etwas bricht.",
    owner: "Owner: Domain in Vercel verbinden und den Wert setzen",
  })

  items.push({
    label: "Reaktionszusage bestätigt (BF-8)",
    ok: false,
    detail:
      "Gewählt ist „innerhalb von zwei Werktagen“ — an einer Stelle " +
      "gepflegt (app/api/lead/route.ts), von dort in Bestätigungsmail und Seite. " +
      "Vorher stand hier „nächster Werktag“ und dort „24 Stunden“; beides " +
      "ist für ein founder-led Haus an einem Freitagabend nicht haltbar. " +
      "Eine Frist, die verstreicht, kostet mehr als eine, die länger klingt.",
    owner: "Owner: bestätigen, dass zwei Werktage jederzeit haltbar sind — oder ändern",
  })

  /* ── Entscheidungen (§11, strategische Blind Spots) ──────────── */
  /*
   * Diese drei sind KEIN fehlendes Material — kein Foto, keine Zahl, keine
   * Freigabe. Sie sind Entscheidungen, und sie stehen trotzdem hier, weil
   * diese Seite die eine Wahrheit darüber sein soll, was noch aussteht. Eine
   * offene Entscheidung blockiert Arbeit genauso zuverlässig wie ein
   * fehlendes Bild — nur fällt sie niemandem auf, weil sie nirgends als
   * Lücke sichtbar wird.
   *
   * Was der Code ohne sie tut, steht jeweils dabei. Keine davon hält den
   * Livegang auf.
   */
  items.push({
    label: "Entscheidung: 50k-Kunde jetzt? (§11)",
    ok: false,
    detail:
      "Bei zwei Referenzen und founder-led ist ein Auftrag dieser Größe ein " +
      "Liefer- und Klumpenrisiko. Die Seite ist heute NICHT darauf optimiert: " +
      "Die Preisleiter endet bei „größerer Umfang: auf Anfrage“, ohne Zahl. " +
      "Das bleibt so, solange nichts anderes entschieden ist.",
    owner: "Owner: entscheiden, ob die Seite auf diesen Kunden zielen soll",
  })

  items.push({
    label: "Entscheidung: TR-Nische besitzen? (§11)",
    ok: false,
    detail:
      "Türkisch ist heute eine Übersetzung, keine Positionierung: dieselbe " +
      "Seite, andere Sprache. Für einen türkischsprachigen Betrieb im " +
      "DACH-Raum ist die erste Frage aber „verstehen die mich?“ — das wäre " +
      "ein Einstieg, kein FAQ-Punkt. Bewusst besitzen oder bewusst lassen; " +
      "unentschieden ist die einzige Antwort, die nichts bringt.",
    owner: "Owner: entscheiden — danach folgt Aufbau oder Rückbau, nicht beides",
  })

  items.push({
    label: "Preisleiter oben geöffnet (BF-9)",
    ok: true,
    detail:
      "„größerer Umfang: auf Anfrage“ steht sichtbar über der Leiter, " +
      "ohne Zahl — die gesperrten Stufen 2.400 / 2.400 / 3.900 bleiben unberührt.",
    owner: "—",
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
