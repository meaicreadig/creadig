"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight, Check, ChevronRight, Minus } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { genannteClientWorks, packages, productWorks } from "@/lib/site-data"
import { whatsappLink } from "@/lib/dictionary"
import { BRANCH_ENTRY_FOR_SERVICE } from "@/lib/branchen"
import type { ServicePage } from "@/lib/service-pages"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { QuickCheck } from "@/components/service/quick-check"

/**
 * Körper einer Leistungsseite.
 *
 * Zweisprachig, deshalb Client-Komponente — Titel, Description und die
 * strukturierten Daten liefert die Server-Seite darüber.
 *
 * Alles hier zeigt bereits belegte Inhalte: die Ebenen-Beschreibung aus dem
 * Wörterbuch, die drei Prozessschritte, die Paketinhalte
 * und echte Arbeiten. Die Seite bündelt sie für einen Suchbegriff, sie
 * erfindet nichts dazu.
 */
export function ServicePageBody({ page }: { page: ServicePage }) {
  const { t, locale } = useLocale()
  const layer = t.services.layers[page.layer]
  const copy = t.servicePage
  const branchEntry = BRANCH_ENTRY_FOR_SERVICE[page.slug]
  const allWorks = [...productWorks, ...genannteClientWorks]
  const works = page.workSlugs
    .map((slug) => allWorks.find((w) => w.slug === slug))
    .filter((w): w is (typeof allWorks)[number] => Boolean(w))

  return (
    <main className="relative">
      <div className="section-gutter relative pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Brotkrumen: der Weg zurück ins System, nicht nur ein Zurück-Pfeil. */}
        <nav aria-label="Brotkrumen">
          <ol className="text-muted-foreground flex flex-wrap items-center gap-2 text-meta">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors duration-[var(--dur-1)]">
                {copy.breadcrumbHome}
              </Link>
            </li>
            <ChevronRight aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
            <li>
              <Link
                href="/leistungen"
                className="hover:text-foreground transition-colors duration-[var(--dur-1)]"
              >
                {copy.breadcrumbServices}
              </Link>
            </li>
            <ChevronRight aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
            <li aria-current="page" className="text-foreground">
              {page.h1[locale]}
            </li>
          </ol>
        </nav>

        {/*
          GATE 04 · WEB-0016 — DER KOPF STAND AUF EINER HALBEN SEITE.

          Eyebrow, H1 und Einleitung untereinander, jeweils mit `max-w`. Bei
          1440 Pixeln blieben die rechten rund 45 Prozent leer — auf allen
          sechs Leistungsdetailseiten dieselbe Leere an derselben Stelle.

          Genau diese Grammatik hat `components/ui/page-header.tsx` fuer den
          Rest der Website schon abgeloest; im eigenen Kommentar dort steht,
          warum: Sie macht aus „aufgeraeumt" „unfertig". Nur benutzen diese
          sechs Seiten `PageHeader` nicht — sie bauen ihren Kopf selbst, und
          die Korrektur ist an ihnen vorbeigegangen.

          Jetzt dieselbe Zweispaltigkeit wie ueberall sonst: Titel links,
          Einleitung rechts auf derselben Grundlinie. Kein neues Muster, das
          vorhandene.
        */}
        <div className="mt-12 grid gap-x-10 gap-y-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={`${copy.layerLabel} · ${layer.name}`} />
            <h1 className="type-h1 mt-7 text-balance">{page.h1[locale]}</h1>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-2xl text-pretty">
              {page.lead[locale]}
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-8">

          {/*
            MP-E.5 — der Rueckweg zum Branchen-Einstieg. Er steht hier oben und
            nicht unten bei den Knoepfen: Wer noch nicht weiss, ob er diese
            Leistung braucht, soll das lesen, bevor er die Leistung liest.
            Ohne Eintrag in der Tabelle rendert nichts.
          */}
          {branchEntry && (
            <p className="type-small text-muted-foreground mt-8 flex flex-wrap items-center gap-x-3 gap-y-1">
              {branchEntry.lead[locale]}
              <Link
                href={branchEntry.path}
                className="text-gold-text hover:text-foreground inline-flex items-center gap-2 underline underline-offset-4 transition-colors duration-[var(--dur-2)]"
              >
                {branchEntry.cta[locale]}
                <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
              </Link>
            </p>
          )}
        </Reveal>

        <div className="mt-20 grid gap-x-12 gap-y-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal className="border-line border-t pt-8">
              <p className="eyebrow text-gold-text">{copy.includesLabel}</p>
              <ul className="mt-6 flex flex-col gap-4">
                {page.includes[locale].map((item) => (
                  <li key={item} className="flex gap-3.5">
                    <Check className="text-gold mt-1 size-4 shrink-0" strokeWidth={1.5} />
                    <span className="type-body text-foreground/85 text-pretty">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/*
              BF-A6 — „Was wir tun, und was nicht."

              Zwei Spalten, gleich gross, gleich ausfuehrlich. Die rechte ist
              die wichtigere: Sie steht zwischen einem zufriedenen Kunden und
              einem, der glaubt, er habe Rechtssicherheit gekauft. Kein Satz
              hier verspricht ein rechtliches Ergebnis, und keiner droht mit
              einem.
            */}
            {page.boundary && (
              <Reveal delay={0.06} className="border-line mt-14 border-t pt-8">
                <p className="eyebrow text-gold-text">{copy.boundaryLabel}</p>
                <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                  <div>
                    <h2 className="text-subhead text-lg">{copy.boundaryWeLabel}</h2>
                    <ul className="mt-5 flex flex-col gap-4">
                      {page.boundary.we[locale].map((item) => (
                        <li key={item} className="flex gap-3.5">
                          <Check className="text-gold mt-1 size-4 shrink-0" strokeWidth={1.5} />
                          <span className="type-small text-foreground/85 text-pretty">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-subhead text-lg">{copy.boundaryNotWeLabel}</h2>
                    <ul className="mt-5 flex flex-col gap-4">
                      {page.boundary.notWe[locale].map((item) => (
                        <li key={item} className="flex gap-3.5">
                          {/* Kein Warn-Rot: Das hier ist keine Fehlermeldung,
                              sondern eine Zusage darueber, was nicht dazugehoert. */}
                          <Minus
                            aria-hidden="true"
                            className="text-muted-foreground mt-1 size-4 shrink-0"
                            strokeWidth={1.5}
                          />
                          <span className="type-small text-muted-foreground text-pretty">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="type-small text-muted-foreground border-line mt-8 border-t pt-6 text-pretty">
                  {page.boundary.note[locale]}
                </p>
              </Reveal>
            )}

            {/*
              BF-A9 — der Beleg statt des Versprechens.

              Er steht direkt unter der Grenze der eigenen Leistung, und das
              ist die richtige Reihenfolge: erst sagen, was wir nicht tun,
              dann zeigen, dass wir das, was wir tun, an uns selbst gemacht
              haben. Umgekehrt liest es sich wie Werbung mit Nachsatz.
            */}
            {page.ownProof && (
              <Reveal delay={0.1} className="border-line mt-14 border-t pt-8">
                <p className="eyebrow text-gold-text">{copy.ownProofLabel}</p>
                <p className="type-body text-foreground/85 mt-6 text-pretty">
                  {page.ownProof.body[locale]}
                </p>
                <div className="mt-7 flex flex-col gap-4">
                  {page.ownProof.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-gold-text hover:text-foreground inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
                    >
                      {link.label[locale]}
                      <ArrowUpRight className="size-4" strokeWidth={1.5} />
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}

            {/*
              V2-2 — die Ebene in der Tiefe, nicht nur als Etikett.

              Ueber der H1 steht „Ebene im System · Digital". Das ordnet ein,
              erklaert aber nichts: Wer hier ankommt, sucht „Webdesign" und
              will wissen, ob sein Problem hier gemeint ist. Genau dieselben
              drei Abschnitte wie auf /leistungen — nicht neu geschrieben,
              sondern dieselbe Quelle. Zwei Fassungen derselben Aussage waeren
              in vier Wochen zwei Aussagen.
            */}
            {/*
              GATE 03 · WEB-0036 / WEB-0012 — HIER STAND DIE GANZE EBENE.

              -----------------------------------------------------------------
              WAS HIER STAND UND WARUM ES SCHADETE
              Drei Absaetze — Ausgangslage, Was wir bauen, Was danach anders ist
              — plus die Liste der typischen Projekte. Alle vier aus
              `t.services.layers[page.layer]`, also aus derselben Quelle wie die
              Pyramide auf `/leistungen`.

              Der alte Kommentar an dieser Stelle verteidigte das mit einem
              richtigen Argument: „nicht neu geschrieben, sondern dieselbe
              Quelle. Zwei Fassungen derselben Aussage waeren in vier Wochen
              zwei Aussagen." Das stimmt fuer die DATENHALTUNG. Fuer den Leser
              stimmt es nicht.

              Gemessen am 10.09.2026 ueber die gerenderten Seiten: Fuenf
              tragende Saetze der Ebene Digital standen wortgleich auf
              `/leistungen` UND auf `/webdesign`, `/website-handwerk`,
              `/zweisprachig-de-tr` und `/barrierefreiheit-website`. Die drei
              Digital-Detailseiten glichen einander zu 25–30 Prozent
              (5-Gramm-Jaccard). Wer zwei davon nacheinander liest, liest
              denselben Text zweimal — und haelt beim zweiten Mal nicht die
              Ebene fuer wiederholt, sondern die Seite fuer leer.

              -----------------------------------------------------------------
              WAS JETZT DASTEHT
              Die Ebene wird EINGEORDNET, nicht erklaert: Name, der eine Satz,
              der sie beschreibt, und der Weg zur vollstaendigen Fassung. Ihr
              Primary Home ist `/leistungen#ebene-<key>` — dort steht sie
              einmal, mit Ausgangslage, Loesung, Ergebnis und Projekten.

              Was diese Seite dadurch NICHT verliert: ihren eigenen Inhalt.
              `includes`, `forWhom`, `process`, `boundary`, `ownProof` und die
              Preisleiter sind seitenspezifisch und bleiben unveraendert. Was
              sie verliert, ist genau der Teil, der auf jeder Schwesterseite
              identisch war.
            */}
            {/*
              SELBSTPRUEFUNG G03 — DER EYEBROW STAND HIER EIN ZWEITES MAL.

              Der erste Entwurf gab diesem Block die Zeile „Ebene im System ·
              Digital". Genau die steht bereits ueber der H1, gut zwei
              Bildschirmhoehen hoeher. Zwei identische Beschriftungen auf
              derselben Seite ordnen nicht ein, sie lassen den Leser suchen,
              was er uebersehen hat.

              Geblieben ist, was der Block wirklich beitraegt: der eine Satz
              zur Ebene und der Weg zur vollstaendigen Fassung.
            */}
            <Reveal delay={0.05} className="border-line mt-14 border-t pt-8">
              <p className="type-body text-foreground/85 max-w-xl text-pretty">
                {layer.what}
              </p>
              <Link
                href={`/leistungen#ebene-${page.layer}`}
                className="text-gold-text hover:text-foreground mt-5 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
              >
                {copy.layerCta}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </Link>
            </Reveal>


            {/*
              MP10-1 — „was aendert sich bei mir?"

              Owner-gegatet und heute auf allen sechs Seiten leer. Das ist
              kein Versehen: Ein Vorher→Nachher ist ein Ergebnisversprechen,
              und ein Ergebnisversprechen ohne einen Betrieb, an dem es
              gemessen wurde, ist eine Erfindung. Der Abschnitt erscheint mit
              dem ersten bestaetigten Fall — bis dahin steht die Luecke auf
              `/status`.
            */}
            {page.fromTo && (
              <Reveal delay={0.09} className="border-line mt-14 border-t pt-8">
                <p className="eyebrow text-gold-text">{copy.fromToLabel}</p>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  <div className="tile bg-surface px-6 py-6">
                    <p className="eyebrow text-muted-foreground">{copy.fromToBefore}</p>
                    <p className="type-body text-muted-foreground mt-4 text-pretty">
                      {page.fromTo.before[locale]}
                    </p>
                  </div>
                  <div className="tile bg-surface px-6 py-6">
                    <p className="eyebrow text-gold-text">{copy.fromToAfter}</p>
                    <p className="type-body text-foreground/85 mt-4 text-pretty">
                      {page.fromTo.after[locale]}
                    </p>
                  </div>
                </div>
              </Reveal>
            )}

            {works.length > 0 && (
              <Reveal delay={0.12} className="border-line mt-14 border-t pt-8">
                <p className="eyebrow text-gold-text">{copy.worksLabel}</p>
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {works.map((work) => (
                    <li
                      key={work.slug}
                      className="tile bg-surface flex flex-col gap-2 px-6 py-6"
                    >
                      <span className="text-subhead text-lg">{work.name}</span>
                      <span className="type-small text-muted-foreground text-pretty">
                        {work.what[locale]}
                      </span>
                    </li>
                  ))}
                </ul>
                {/*
                  GATE 01 · WEB-0005 — der Verweis fuehrte nach `/arbeiten`.
                  Die Liste darueber kommt aus `productWorks` (heute loest
                  kein Kundenwerk auf, weil keine Freigabe vorliegt), und
                  `/arbeiten` zeigt seit Gate 01 keine eigenen Produkte mehr.
                  Der Weiterweg gehoert dorthin, wo die Liste vollstaendig
                  steht.
                */}
                <Link
                  href="/produkte"
                  className="text-gold-text hover:text-foreground mt-6 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
                >
                  {copy.worksCta}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </Link>
              </Reveal>
            )}
          </div>

          {/* Rechte Spalte: Für wen, Pakete */}
          <div className="lg:col-span-5">
            <Reveal className="border-line border-t pt-8">
              <p className="eyebrow text-gold-text">{copy.forWhomLabel}</p>
              <ul className="mt-6 flex flex-col gap-4">
                {page.forWhom[locale].map((item) => (
                  <li key={item} className="flex gap-3.5">
                    <span aria-hidden="true" className="bg-gold mt-2.5 h-px w-5 shrink-0" />
                    <span className="type-body text-foreground/85 text-pretty">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/*
              MP10-1 — „wie lange dauert das?"

              Die zweite der vier Kauf-Fragen, und die einzige, auf die man
              ohne Zahl gar nicht antworten kann. Genau deshalb steht hier
              heute nichts: Eine geschaetzte Projektdauer ist eine Zusage,
              die im ersten Projekt gebrochen wird. Owner-gegatet, Luecke auf
              `/status`.
            */}
            {page.duration && (
              <Reveal delay={0.05} className="border-line mt-14 border-t pt-8">
                <p className="eyebrow text-gold-text">{copy.durationLabel}</p>
                <p className="type-body text-foreground/85 mt-6 text-pretty">
                  {page.duration[locale]}
                </p>
              </Reveal>
            )}

            {/*
              MP10-1 — „was muss ich beitragen?"

              Die Frage, die niemand stellt und jeder mitrechnet: Zeit,
              Zugaenge, Material. Sie ehrlich zu beantworten kostet vielleicht
              eine Anfrage und spart mit Sicherheit ein Projekt, das an
              fehlenden Zulieferungen haengen bleibt. Owner-gegatet, weil nur
              er weiss, was ein Betrieb tatsaechlich liefern musste.
            */}
            {page.clientEffort && (
              <Reveal delay={0.06} className="border-line mt-14 border-t pt-8">
                <p className="eyebrow text-gold-text">{copy.clientEffortLabel}</p>
                <ul className="mt-6 flex flex-col gap-4">
                  {page.clientEffort[locale].map((item) => (
                    <li key={item} className="flex gap-3.5">
                      <span aria-hidden="true" className="bg-gold mt-2.5 h-px w-5 shrink-0" />
                      <span className="type-body text-foreground/85 text-pretty">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {/*
              BF-9 — HIER STAND DER PREIS, UND DAS WAR DIE FALSCHE STELLE.

              Diese Spalte liegt auf demselben Bildschirm wie „Arbeiten dazu"
              in der Spalte daneben. Rechts €2.400, links NV SWISS und maqam —
              gemessen keine 300 Pixel auseinander. Wer beides zugleich sieht,
              liest die Zahl als den Preis dieser Arbeiten. Das entwertet die
              Referenzen und verankert uns auf einer Zahl, die fuer den Fall
              gar nicht gilt.

              Der Preis steht jetzt an genau EINER Stelle: im Angebot auf
              `/leistungen`. Diese Seite nennt das Paket beim Namen und
              verlinkt dorthin — und `/leistungen` traegt keine Referenzen.
              Damit koennen Referenz und Preis gar nicht mehr zusammentreffen,
              nicht nur zufaellig gerade nicht.
            */}
            <Reveal delay={0.08} className="border-line mt-14 border-t pt-8">
              <p className="eyebrow text-gold-text">{copy.packagesLabel}</p>
              <ul className="mt-6 flex flex-col">
                {packages
                  .filter((pkg) => page.packageKeys.includes(pkg.key))
                  .map((pkg) => (
                    <li key={pkg.key} className="border-line border-t py-5">
                      <span className="text-subhead text-lg">
                        {t.packages.items[pkg.key].name}
                      </span>
                    </li>
                  ))}
              </ul>
              {/*
                BF-A11 — der Satz, der die zweite Preiswelt verhindert.

                Barrierefreiheit ist Einstieg, nicht Konkurrenzprodukt: im
                Paket eingebaut, wenn neu gebaut wird — eigene Leistung, wenn
                die Seite schon steht. Ohne diesen Satz stehen beide Angebote
                nebeneinander und der Leser muss raten, welches fuer ihn gilt.
              */}
              {page.packageNote && (
                <p className="type-small text-muted-foreground mt-5 text-pretty">
                  {page.packageNote[locale]}
                </p>
              )}
              <Link
                href="/leistungen#pakete"
                className="text-gold-text hover:text-foreground mt-6 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
              >
                {copy.packagesCta}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </Link>
            </Reveal>

          </div>
        </div>

        {/*
          GATE 04 · WEB-0016 / WEB-0038 — DER ABLAUF VERLAESST DIE SPALTE.

          -----------------------------------------------------------------
          WAS DIE MESSUNG GEZEIGT HAT
          Die Seite ist EIN zwoelfspaltiges Raster: links (7) Umfang, Grenze,
          Beleg, Ebene und Ablauf, rechts (5) Fuer wen und Pakete. Die linke
          Spalte ist rund 400 Pixel laenger als die rechte — gemessen am
          11.09.2026 auf `/leistungen/webdesign`, 1440 Pixel breit.

          Sichtbar ist davon ein Loch: Ab der Mitte der Seite steht rechts
          nichts mehr, waehrend links der Ablauf weiterlaeuft. Kein Inhalt
          fehlt, und trotzdem sieht die Seite unfertig aus.

          -----------------------------------------------------------------
          WARUM AUSGERECHNET DER ABLAUF
          Weil er als Einziger kein Faktenblock ist, sondern eine FOLGE. Vier
          Schritte in einer 7-Spalten-Kolumne bedeuten zweimal zwei
          untereinander — die Reihenfolge, die der Inhalt behauptet, ist im
          Bild nicht zu sehen. Ueber die volle Breite stehen sie
          nebeneinander, und die Folge wird zur Form.

          Damit bekommt die Seite zwei Bewegungen statt einer:
          Fakten nebeneinander, danach die Sequenz quer darunter. Das ist der
          Unterschied zwischen einem Raster und einer Komposition — und er
          kostet kein einziges zusaetzliches Wort (Gate 03 bleibt unberuehrt).
        */}
          {/*
            MP10-1 — der Ablauf DIESER Leistung, nicht der des Hauses.

            Hier standen die drei Schritte „Verstehen · Bauen · Betreiben"
            aus dem Woerterbuch — auf allen sechs Seiten dieselben. Sie
            beschreiben eine Haltung, und die stimmt; nur beantworten sie
            nicht die Frage, mit der jemand auf einer Leistungsseite steht:
            „Wenn ich hier zusage, was passiert dann konkret?"

            `page.process` sagt genau das, in vier Schritten, je Leistung
            verschieden. Kein Schritt behauptet etwas Neues — jeder ist eine
            Umformulierung dessen, was unter „Was dazugehoert" ohnehin
            schon steht. Fehlt die Liste, bleiben die drei Haus-Schritte:
            lieber die allgemeine Antwort als gar keine.
          */}
          <Reveal delay={0.08} className="border-line mt-14 border-t pt-8">
            <p className="eyebrow text-gold-text">{copy.processLabel}</p>
            {page.process ? (
              <ol className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {page.process.map((step, i) => (
                  <li key={step.key}>
                    <span className="eyebrow text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-subhead mt-3 text-lg">{step.title[locale]}</h2>
                    <p className="type-small text-muted-foreground mt-3 text-pretty">
                      {step.body[locale]}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-3">
                {(["understand", "build", "operate"] as const).map((key, i) => (
                  <div key={key}>
                    <span className="eyebrow text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-subhead mt-3 text-lg">{t.process.steps[key].name}</h2>
                    <p className="type-small text-muted-foreground mt-3 text-pretty">
                      {t.process.steps[key].what}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Reveal>

        {/*
          BF-A10 — die Preisleiter.

          Volle Breite und nach den beiden Spalten, aus demselben Grund, aus
          dem der Paketpreis aus der rechten Spalte verschwunden ist (BF-9):
          Ein Preis, der neben „Arbeiten dazu" oder neben der Grenze der
          Leistung steht, wird auf den Nachbarn bezogen. Hier steht er allein
          und meint genau das, was danebensteht.

          Genau EIN Festpreis: die Pruefung. Die Behebung traegt ein anderes
          Etikett, und das ist keine Formulierung, sondern die Sache selbst —
          fuer ungesehenen Code kann niemand einen Festpreis nennen, ohne
          entweder zu raten oder Luft einzupreisen.
        */}
        {page.priceLadder && (
          <Reveal delay={0.06}>
            <div className="border-line mt-24 border-t pt-10">
              <p className="eyebrow text-gold-text">{copy.priceLadderLabel}</p>
              <div className="mt-8 grid gap-2.5 md:grid-cols-3">
                {page.priceLadder.steps.map((step) => (
                  <div key={step.key} className="tile bg-surface flex flex-col gap-4 px-7 py-8">
                    <h2 className="text-subhead text-lg">{step.title[locale]}</h2>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="type-stat">{step.price[locale]}</span>
                      <span className="eyebrow text-muted-foreground">
                        {step.kind === "fixed"
                          ? copy.priceFixed
                          : step.kind === "offer"
                            ? copy.priceOffer
                            : copy.priceMonthly}
                      </span>
                    </div>
                    {/* MP10-2.3 — Dauer neben dem Preis, Owner-gegatet. */}
                    {step.duration && (
                      <p className="type-small text-muted-foreground">
                        <span className="eyebrow text-gold-text">{copy.durationLabel}: </span>
                        {step.duration[locale]}
                      </p>
                    )}
                    <p className="type-small text-muted-foreground text-pretty">
                      {step.body[locale]}
                    </p>
                  </div>
                ))}
              </div>
              <p className="type-small text-muted-foreground mt-7 text-pretty">
                {page.priceLadder.note[locale]}
              </p>
            </div>
          </Reveal>
        )}

        {/*
          BF-A8 — der Beweis am Objekt des Kunden.

          Er steht NACH der Leistungsbeschreibung und VOR dem allgemeinen
          Abschluss: Wer bis hierher gelesen hat, will nicht noch ein
          Erstgespraech ueber Grundsaetzliches, sondern wissen, wie seine
          eigene Seite dasteht. Der allgemeine CTA bleibt darunter fuer alle
          anderen.
        */}
        {page.quickCheck && (
          <div className="mt-24">
            <QuickCheck />
          </div>
        )}

        {/* Abschluss-CTA — dieselbe Zusage wie überall: kostenlos, unverbindlich. */}
        <Reveal delay={0.1}>
          <div className="border-line mt-24 flex flex-col gap-8 border-t pt-12 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="type-h3 max-w-2xl text-balance">{copy.ctaTitle}</h2>
              <p className="type-body text-muted-foreground mt-5 max-w-xl text-pretty">
                {copy.ctaBody}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/termin"
                className="cta-outline inline-flex items-center gap-2.5 px-7 py-3.5 text-sm tracking-wide"
              >
                <span className="flex items-center gap-2.5">
                  {copy.ctaPrimary}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </span>
              </Link>
              <a
                href={whatsappLink(locale)}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-quiet inline-flex items-center gap-2.5 px-7 py-3.5 text-sm tracking-wide"
              >
                <WhatsAppIcon className="size-4" />
                {copy.ctaSecondary}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  )
}
