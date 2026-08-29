import type { ReactNode } from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Disclosure — der aufklappbare Block, eine Quelle.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES DAS GIBT
 * Dasselbe Muster stand zweimal handgeschrieben im Markup (`faq.tsx`,
 * `entry-line.tsx`), beim zweiten Mal mit dem Kommentar „dieselbe Mechanik wie
 * in der FAQ". Zwei Kopien sind noch kein Problem; die dritte ist eine. Und
 * die dritte kommt jetzt: Die Leistungsseite legt ihre Tiefe pro Ebene
 * dahinter.
 *
 * ---------------------------------------------------------------------------
 * WARUM `<details>` UND KEIN REACT-AKKORDEON
 * Tastatur, Screenreader und die Seitensuche des Browsers funktionieren ohne
 * eine Zeile JavaScript — Strg+F findet auch zugeklappten Text. Das ist der
 * Grund, warum der Inhalt hier VERSTECKT und nicht WEGGELASSEN wird: Er steht
 * im Dokument, er wird gefunden, er wird indexiert. Wer ihn will, klappt auf.
 *
 * ---------------------------------------------------------------------------
 * ZWEI GROESSEN, SONST NICHTS
 *   md  eigenstaendige Frage-Antwort-Reihe (FAQ)
 *   sm  innerhalb einer Sektion, unter einem anderen Kopf (Einstiegs-Zeile,
 *       Leistungs-Ebene)
 *
 * `heading` entscheidet, ob der Titel eine echte Ueberschrift ist. Er ist es
 * bei Fragen — dort SOLL ein Screenreader sie in der Gliederung finden. Er ist
 * es NICHT, wenn der Block unter einer H3 sitzt, die ihn schon benennt: eine
 * zweite Ueberschriftsebene je Block zerlegt die Gliederung der Seite, ohne
 * dass jemand dadurch mehr faende.
 */
type DisclosureProps = {
  /** Was auf der geschlossenen Zeile steht. */
  label: ReactNode
  children: ReactNode
  size?: "md" | "sm"
  /** Titel als `<h3>` statt als Text — nur, wenn er wirklich eine Überschrift ist. */
  heading?: boolean
  className?: string
}

export function Disclosure({
  label,
  children,
  size = "md",
  heading = false,
  className,
}: DisclosureProps) {
  const title = (
    <span className={cn("text-subhead text-pretty", size === "md" && "text-lg md:text-xl")}>
      {label}
    </span>
  )

  return (
    <details className={cn("group border-line border-t", className)}>
      <summary
        className={cn(
          "marker:content-none flex cursor-pointer list-none items-start justify-between gap-6",
          size === "md" ? "py-7" : "py-5",
        )}
      >
        {heading ? <h3>{title}</h3> : title}
        {/*
          Das Plus dreht sich zum Kreuz. Es ist die einzige Bewegung dieses
          Bauteils und sagt, was passiert ist — offen oder zu.
        */}
        <Plus
          aria-hidden="true"
          className={cn(
            "text-muted-foreground group-open:text-gold-text mt-1 shrink-0 transition-transform duration-[var(--dur-2)] ease-brand group-open:rotate-45",
            size === "md" ? "size-5" : "size-4",
          )}
          strokeWidth={1.5}
        />
      </summary>
      <div className={size === "md" ? "pb-8" : "pb-6"}>{children}</div>
    </details>
  )
}
