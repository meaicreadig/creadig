"use client"

import Image from "next/image"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { COMPANY_PHOTOS, COMPANY_PHOTO_SLOTS } from "@/lib/company-media.generated"

/**
 * Echte Fotos aus dem Haus (V2-5 · KIZILELMA §10.6).
 *
 * ---------------------------------------------------------------------------
 * DIE SEKTION IST HEUTE UNSICHTBAR — UND DAS IST DER PUNKT
 * „Menschen" ist die fuenfte der fehlenden Beweisarten und die einzige, die
 * sich nicht durch Struktur ersetzen laesst: Ein Haus ohne ein einziges Bild
 * vom eigenen Arbeitsplatz wirkt wie eine Adresse, an der niemand sitzt.
 *
 * Stock ist gesperrt, ein Platzhalter-Bild auch. Also entscheidet das
 * Dateisystem, genau wie bei den Produkt-Aufnahmen: Liegt unter
 * `public/images/unternehmen/<slot>.jpg` ein Foto, erscheint es. Liegt keins
 * da, gibt diese Komponente `null` zurueck und die Seite hat die Sektion
 * nicht. Es gibt keinen dritten Zustand.
 *
 * Vier Slots, in fester Reihenfolge: buero · ico · arbeitsplatz · whiteboard.
 * Der Owner legt ab, was er hat — auch eins allein rendert sauber, weil die
 * Spaltenzahl der Anzahl folgt.
 */
export function CompanyPhotos() {
  const { t } = useLocale()
  const copy = t.photos

  const photos = COMPANY_PHOTO_SLOTS.filter((slot) => COMPANY_PHOTOS[slot])
  if (photos.length === 0) return null

  return (
    <section id="fotos" aria-labelledby="fotos-title" className="section-seam">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="fotos-title" className="type-h2 mt-7 text-balance">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end lg:col-span-5">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">{copy.lead}</p>
          </Reveal>
        </div>

        {/* Spaltenzahl folgt der Anzahl — ein Foto allein soll nicht auf einem
            Viertel der Breite kleben, vier sollen sich nicht stapeln. */}
        <div
          className={`mt-20 grid gap-8 ${
            photos.length === 1
              ? "lg:grid-cols-1"
              : photos.length === 2
                ? "sm:grid-cols-2"
                : photos.length === 3
                  ? "sm:grid-cols-2 lg:grid-cols-3"
                  : "sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {photos.map((slot, i) => (
            <Reveal key={slot} delay={0.06 * i}>
              <figure>
                <div className="border-line bg-surface relative aspect-[4/3] w-full overflow-hidden border">
                  <Image
                    src={COMPANY_PHOTOS[slot] as string}
                    alt={copy.slots[slot].alt}
                    fill
                    sizes={
                      photos.length === 1
                        ? "(max-width: 1024px) 100vw, 90vw"
                        : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    }
                    className="object-cover"
                  />
                </div>
                <figcaption className="type-small text-muted-foreground mt-4 text-pretty">
                  {copy.slots[slot].caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
