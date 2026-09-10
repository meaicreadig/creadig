"use client"

import { LocaleLink as Link } from "@/components/ui/locale-link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { ZUSTANDS_TEXTE, type RolleDefinition } from "@/lib/karriere"
import { marken } from "@/lib/karriere-inhalt"

/*
 * ===========================================================================
 * DER STAND EINER ROLLE — EIN BAUSTEIN, EINE WAHRHEIT
 * ===========================================================================
 *
 * Er steht auf der Uebersicht und auf beiden Spur-Seiten. Genau deshalb gibt
 * es ihn: Der Zustand einer Rolle ist eine Aussage ueber creaDIG, und eine
 * Aussage, die an drei Stellen von Hand wiederholt wird, ist beim naechsten
 * Bearbeiten an zwei Stellen falsch.
 *
 * Die Handlungsaufforderung wird NICHT uebergeben. Sie kommt aus dem Zustand
 * (`ZUSTANDS_TEXTE`), damit „Jetzt bewerben“ ueber einem Talent Pool gar
 * nicht erst entstehen kann.
 *
 * Kein Ampelrot und kein Ampelgruen. Ein Talent Pool ist kein Fehler und
 * keine Warnung — er ist ein anderer Zustand als „offen“, und der
 * Unterschied wird ueber das Wort getragen, nicht ueber die Farbe.
 */
export function RollenStand({
  rolle,
  variante = "voll",
}: {
  rolle: RolleDefinition
  /** `kompakt` fuer die Uebersicht, `voll` fuer die Spur-Seite. */
  variante?: "kompakt" | "voll"
}) {
  const { locale } = useLocale()
  const text = ZUSTANDS_TEXTE[rolle.zustand]
  const offen = rolle.zustand === "offen"

  return (
    <div className="border-line surface-raised border p-6 md:p-7">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {/*
          Der Punkt ist gefuellt, sobald eine Stelle wirklich offen ist, und
          sonst nur ein Ring. Das ist derselbe Unterschied wie beim Produkt-
          Stand auf /produkte: gefuellt heisst „laeuft“, offen heisst „noch
          nicht“.
        */}
        <span
          aria-hidden="true"
          className={`size-2 shrink-0 rounded-full ${
            offen ? "bg-gold" : "border-gold-text border"
          }`}
        />
        <span className="eyebrow text-gold-text">{text.label[locale]}</span>
      </div>

      <p className="type-small text-muted-foreground mt-4 text-pretty">
        {text.bedeutet[locale]}
      </p>

      {variante === "voll" && (
        <dl className="border-line mt-6 flex flex-col gap-4 border-t pt-6">
          <div>
            <dt className="text-meta text-muted-foreground">{marken.ort[locale]}</dt>
            <dd className="type-small mt-1 text-pretty">{rolle.ort[locale]}</dd>
          </div>
          <div>
            <dt className="text-meta text-muted-foreground">{marken.arbeitsmodell[locale]}</dt>
            <dd className="type-small mt-1 text-pretty">{rolle.arbeitsmodell[locale]}</dd>
          </div>
        </dl>
      )}

      <Link
        href={`/karriere/bewerben?spur=${rolle.spur}`}
        className="text-gold-text hover:text-foreground group mt-6 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
      >
        {text.cta[locale]}
        <ArrowUpRight
          className="size-4 transition-transform duration-[var(--dur-2)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none rtl:-scale-x-100"
          strokeWidth={1.5}
        />
      </Link>
    </div>
  )
}
