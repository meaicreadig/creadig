"use client"

import { forwardRef } from "react"
import NextLink from "next/link"
import { useLocale } from "@/components/locale-provider"
import { localePath } from "@/lib/routes"

/**
 * GROW-1 — ein Link, der weiß, in welcher Sprache er steht.
 *
 * ---------------------------------------------------------------------------
 * WARUM NICHT VON HAND
 * Seit die türkische Fassung eigene Adressen hat, muss jeder interne Link auf
 * `/tr/kontakt` zeigen, sobald der Besucher auf `/tr/...` steht. Das sind rund
 * sechzig Stellen in sechsundzwanzig Dateien. Sechzig Stellen von Hand zu
 * präfixen heißt: Eine wird vergessen, und genau die wirft den Besucher
 * mitten im Weg zurück ins Deutsche — bemerkt wird das erst von ihm.
 *
 * Deshalb liegt die Regel an EINER Stelle. Die Komponenten importieren diesen
 * Link unter dem Namen `Link`; ihr Aufruf bleibt `href="/kontakt"`, also der
 * deutsche Pfad, und das Präfix entsteht hier.
 *
 * ---------------------------------------------------------------------------
 * WAS UNANGETASTET BLEIBT
 * `localePath` fasst nur Pfade an, die mit `/` beginnen. `mailto:`, `tel:`,
 * `https://` und reine Anker (`#pakete`) gehen unverändert durch — ein
 * `/tr` vor einer WhatsApp-URL wäre ein toter Link.
 *
 * `href` als Objekt (`{ pathname, query }`) reicht die Komponente ebenfalls
 * unverändert weiter. Die Form kommt hier nicht vor; sollte sie einmal
 * auftauchen, ist ein unpräfixierter Link besser als ein falsch
 * zusammengesetzter.
 */
type LocaleLinkProps = React.ComponentPropsWithoutRef<typeof NextLink>

export const LocaleLink = forwardRef<HTMLAnchorElement, LocaleLinkProps>(
  function LocaleLink({ href, ...rest }, ref) {
    const { locale } = useLocale()
    const localised = typeof href === "string" ? localePath(href, locale) : href
    return <NextLink ref={ref} href={localised} {...rest} />
  },
)
