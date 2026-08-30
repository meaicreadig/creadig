"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

/**
 * Der Weg des Hauses — drei Etappen (VIS-2 · KIZILELMA §7).
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESE SEKTION EXISTIERT
 * /unternehmen bestand aus vier Blöcken: „Über uns", Logo-Wand,
 * Zertifizierungen, Abschluss. Das beantwortet, WAS wir sind — aber nicht,
 * WOHER. Ein Haus, das sich als Ursprung seiner Produkte darstellt, muss
 * zeigen, dass es einen hat; sonst ist „System-Haus" eine Behauptung, die auf
 * derselben Seite steht wie ihre eigene Begründung.
 *
 * KIZILELMA §7: „Das Dach zuerst — groß, als Ursprung; die Produkte als sein
 * Werk." Deshalb steht diese Sektion direkt hinter dem Seitenkopf und vor
 * allem anderen.
 *
 * ---------------------------------------------------------------------------
 * ZWEI JAHRESZAHLEN, BEIDE BELEGT
 * 2017 ist vom Inhaber bestätigt, „heute" ist trivial. Die mittlere Etappe
 * trägt bewusst KEINE Jahreszahl — wann aus Aufträgen Produkte wurden, ist
 * nirgends belegt. `Work.year` steht aus demselben Grund überall auf `null`.
 * Eine geschätzte Jahreszahl wäre eine erfundene Angabe, und die Regel dagegen
 * ist gesperrt. Fehlt das Jahr, steht dort schlicht nichts.
 *
 * ---------------------------------------------------------------------------
 * FORM
 * Weder Kachelraster noch Editorial-Fläche: eine durchgehende Schiene, auf der
 * drei Marken sitzen. Waagerecht ab `md`, senkrecht darunter. Das ist die
 * einzige Sektion der Seite mit einer durchlaufenden Linie als Träger — sie
 * soll als Weg lesbar sein, nicht als drei Karten nebeneinander.
 */
export function CompanyChapters() {
  const { t } = useLocale()
  const copy = t.unternehmenPage.chapters

  return (
    <section aria-labelledby="weg-title" className="section-seam">
      <div className="section-shell">
        <Reveal>
          <SectionEyebrow label={copy.label} />
          <h2 id="weg-title" className="type-h2 mt-7 max-w-3xl text-balance">
            {copy.title}
          </h2>
        </Reveal>

        <ol className="relative mt-20 grid gap-14 md:grid-cols-3 md:gap-x-2.5">
          {/*
            Die Schiene. Waagerecht erst ab `md` — auf dem Telefon stehen die
            Etappen untereinander, und eine liegende Linie waere dort eine
            Linie quer durch nichts.
          */}
          <span
            aria-hidden="true"
            className="bg-line absolute inset-x-0 top-0 hidden h-px md:block"
          />

          {copy.items.map((item, i) => (
            <Reveal
              key={item.title}
              as="li"
              delay={0.08 * i}
              className="border-line relative border-t pt-8 md:border-t-0 md:pr-10 md:pt-10"
            >
              {/* Die Marke auf der Schiene — sitzt genau auf der Linie. */}
              <span
                aria-hidden="true"
                className="bg-gold absolute top-0 start-0 hidden h-0.5 w-10 md:block"
              />
              {/* Ohne belegtes Jahr steht hier nichts — keine Schaetzung. */}
              {item.year && (
                <p className="text-meta text-gold-text">{item.year}</p>
              )}
              <h3 className={`type-h4 ${item.year ? "mt-4" : "mt-0"}`}>{item.title}</h3>
              <p className="type-body text-muted-foreground mt-5 max-w-sm text-pretty">
                {item.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
