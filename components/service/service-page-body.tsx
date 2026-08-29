"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight, Check, ChevronRight, Minus } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { clientWorks, packages, productWorks } from "@/lib/site-data"
import { WHATSAPP_LINK } from "@/lib/dictionary"
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
  const allWorks = [...productWorks, ...clientWorks]
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

        <Reveal className="mt-12">
          <SectionEyebrow label={`${copy.layerLabel} · ${layer.name}`} />
          <h1 className="type-h1 mt-7 max-w-4xl text-balance">{page.h1[locale]}</h1>
          <p className="type-lead text-muted-foreground mt-8 max-w-2xl text-pretty">
            {page.lead[locale]}
          </p>
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
            <Reveal delay={0.05} className="border-line mt-14 border-t pt-8">
              <p className="eyebrow text-gold-text">
                {copy.layerLabel} · {layer.name}
              </p>
              <div className="mt-6 flex flex-col gap-8">
                {(
                  [
                    [t.services.problemLabel, layer.problem],
                    [t.services.solutionLabel, layer.solution],
                    [t.services.resultLabel, layer.result],
                  ] as const
                ).map(([label, body]) => (
                  <div key={label}>
                    <h2 className="text-subhead text-lg">{label}</h2>
                    <p className="type-body text-foreground/85 mt-3 text-pretty">{body}</p>
                  </div>
                ))}
              </div>
              <div className="border-line mt-8 border-t pt-6">
                <p className="eyebrow text-gold-text">{t.services.projectsLabel}</p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {layer.projects.map((project) => (
                    <li
                      key={project}
                      className="type-small text-muted-foreground flex items-center gap-2.5"
                    >
                      <span aria-hidden="true" className="bg-gold h-px w-3.5 shrink-0" />
                      {project}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

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
                <ol className="mt-6 grid gap-8 sm:grid-cols-2">
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
                <div className="mt-6 grid gap-8 sm:grid-cols-3">
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
                <Link
                  href="/arbeiten"
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
              <p className="type-small text-muted-foreground mt-6 text-pretty">{layer.who}</p>
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
                href={WHATSAPP_LINK}
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
