"use client";

import { LocaleLink as Link } from "@/components/ui/locale-link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { StatusDot } from "@/components/ui/status-dot";
import { ClosingCta } from "@/components/sections/closing-cta";
import { clientWorks, ownProducts, productWorks } from "@/lib/site-data";

/**
 * Übersicht der vier eigenen Produkte (PHASE A).
 *
 * Bewusst als breite Zeilen und nicht als Karten-Raster: Vier Produkte in
 * vier kleinen Kacheln lesen sich wie ein Feature-Vergleich. Als volle Zeilen
 * gelesen tragen sie das, was sie tatsächlich sind — vier eigene Welten, jede
 * mit einer eigenen Adresse.
 *
 * Alle Angaben stammen aus `site-data.productWorks`. Was dort `null` ist,
 * steht hier nicht.
 */
export function ProduktePageBody() {
  const { t, locale } = useLocale();
  const copy = t.produktePage;

  return (
    <main>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        crumbLabel={t.nav.produkte}
        lead={copy.lead}
      />

      <section aria-label={copy.eyebrow} className="section-seam">
        <div className="section-shell">
          <ul className="flex flex-col">
            {productWorks.map((product, i) => {
              const logo = ownProducts.find((p) => p.name === product.name);

              return (
                <Reveal
                  key={product.slug}
                  delay={0.05 * i}
                  as="li"
                  className="group"
                >
                  <Link
                    href={`/produkte/${product.slug}`}
                    className="border-line hover:bg-surface relative block border-t py-10 transition-colors duration-500 md:py-12"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-gold absolute top-0 left-0 h-px w-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                    />

                    <div className="grid gap-x-10 gap-y-6 md:grid-cols-12 md:items-baseline">
                      <div className="md:col-span-4">
                        {/*
                          Die echten Produktlogos (fibero, CASSAMEA) SIND
                          Wortmarken. Logo und Name nebeneinander lasen sich
                          darum als „Fibero fibero" — wie ein Tippfehler. Wo
                          ein Logo vorliegt, traegt es den Namen; der Text
                          bleibt fuer Screenreader und Suche im alt-Attribut.
                          Wo keins vorliegt, traegt das Monogramm plus Name.
                        */}
                        {logo?.logoPath ? (
                          <h2>
                            <img
                              src={logo.logoPath}
                              alt={product.name}
                              className="h-8 w-auto max-w-[9rem] opacity-80 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0 dark:brightness-0 dark:invert dark:group-hover:brightness-100 dark:group-hover:invert-0"
                            />
                          </h2>
                        ) : (
                          <div className="flex items-center gap-4">
                            <span
                              aria-hidden="true"
                              className="border-line-strong text-muted-foreground group-hover:border-gold group-hover:text-gold-text flex size-9 items-center justify-center border text-sm font-semibold tracking-tight transition-colors duration-500"
                            >
                              {product.mark}
                            </span>
                            <h2 className="type-h3">{product.name}</h2>
                          </div>
                        )}
                        <p className="eyebrow text-muted-foreground mt-5">
                          {product.sector[locale]}
                        </p>
                      </div>

                      <div className="md:col-span-5">
                        <p className="type-lead text-foreground/85 max-w-lg text-pretty">
                          {product.what[locale]}
                        </p>
                        {product.built && (
                          <p className="type-small text-muted-foreground mt-5 max-w-lg text-pretty">
                            <span className="text-gold-text">
                              {copy.builtLabel}:{" "}
                            </span>
                            {product.built[locale]}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-3 md:text-right">
                        <p className="eyebrow text-muted-foreground">
                          {copy.statusLabel}
                        </p>
                        <p className="type-small text-foreground/85 mt-2.5 flex items-baseline gap-2 text-pretty md:justify-end">
                          <StatusDot
                            live={product.live}
                            className="translate-y-[-0.15em]"
                          />
                          {product.outcome[locale]}
                        </p>
                        <p className="text-meta text-muted-foreground mt-3">
                          {product.region}
                        </p>
                        <span className="text-gold-text mt-6 inline-flex items-center gap-2 text-sm tracking-wide md:justify-end">
                          {copy.openLabel}
                          <ArrowRight
                            className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                            strokeWidth={1.5}
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
          <div className="border-line border-t" />
        </div>
      </section>

      {/*
        Das meAI-Band stand hier bis PHASE B. Es ist in die meAI-Welt gezogen
        (/produkte/meai): Ein Flaggschiff-Deep-Dive auf der Uebersichtsseite
        laesst die drei anderen Produkte wie Beiwerk aussehen — und derselbe
        Text auf zwei Seiten ist eine Dublette, keine Tiefe. In der Liste
        oben stehen alle vier gleichwertig; das Gewicht bekommt meAI auf
        seiner eigenen Seite.
      */}

      {/* Kundenwerk steht auf der Produktseite bewusst getrennt und klein:
          Es gehört nicht zu den eigenen Produkten und darf sie nicht verwässern.
          Ohne freigegebene Referenz faellt die Sektion ganz weg. */}
      {clientWorks.length > 0 && (
        <section
          aria-labelledby="kundenwerk-title"
          className="section-seam"
        >
          <div className="section-shell">
            <Reveal>
              <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-7">
                  <h2 id="kundenwerk-title" className="type-h3 text-balance">
                    {copy.clientWorkTitle}
                  </h2>
                  <p className="type-body text-muted-foreground mt-5 max-w-xl text-pretty">
                    {copy.clientWorkNote}
                  </p>
                </div>
                <div className="lg:col-span-5 lg:text-right">
                  <Link
                    href="/arbeiten"
                    className="text-gold-text hover:text-foreground inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-500"
                  >
                    {copy.clientWorkCta}
                    <ArrowUpRight className="size-4" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </Reveal>

            <ul className="border-line bg-line mt-12 grid gap-px border md:grid-cols-3">
              {clientWorks.map((work, i) => (
                <Reveal
                  key={work.slug}
                  delay={0.06 * i}
                  as="li"
                  className="flex"
                >
                  <Link
                    href={`/arbeiten/${work.slug}`}
                    className="group bg-background hover:bg-surface flex w-full flex-col gap-3 px-6 py-7 transition-colors duration-500"
                  >
                    <span className="text-subhead text-lg">{work.name}</span>
                    <span className="type-small text-muted-foreground text-pretty">
                      {work.what[locale]}
                    </span>
                    <span className="eyebrow text-muted-foreground group-hover:text-gold-text mt-auto pt-4 transition-colors duration-500">
                      {work.sector[locale]}
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ClosingCta />
    </main>
  );
}
