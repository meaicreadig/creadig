import type { ReactNode } from "react"

import { AdminShell } from "@/components/admin/admin-shell"
import { UnavailableNote } from "@/components/admin/primitives"
import { VertriebNav } from "@/components/admin/vertrieb-nav"

/**
 * Die Hülle aller Vertriebsseiten.
 *
 * Sie hält zwei Dinge zusammen, die auf jeder der acht Seiten gleich sind:
 * die Register und die Antwort auf die Frage, was passiert, wenn es keine
 * Datenbank gibt. Beides an einer Stelle, weil beides sonst achtmal leicht
 * unterschiedlich wäre.
 */
export function VertriebShell({
  title,
  lead,
  meta,
  available,
  children,
}: {
  title: string
  lead?: string
  meta?: ReactNode
  /** Ob ein Vertriebs-Speicher erreichbar ist. Serverseitig gemessen. */
  available: boolean
  children: ReactNode
}) {
  return (
    <AdminShell title={title} lead={lead} meta={available ? meta : undefined} salesAvailable>
      <VertriebNav />
      <div className="mt-8">
        {available ? (
          children
        ) : (
          /*
           * Kein Speicher heisst hier NICHT "keine Vorgänge". Der Unterschied
           * ist der ganze Punkt: Eine leere Pipeline wäre eine Aussage über
           * das Geschäft; eine fehlende Datenbank ist eine über die Technik.
           */
          <UnavailableNote title="Vertrieb braucht die Datenbank">
            Anfragen, Kontakte und Verkaufschancen liegen in der
            Lead-Datenbank. Ist sie nicht eingerichtet oder gerade nicht
            erreichbar, kann diese Ansicht nichts zeigen — und zeigt deshalb
            nichts, statt Leere zu behaupten. Der Weg über das Formular ins
            Postfach läuft davon unberührt weiter.
          </UnavailableNote>
        )}
      </div>
    </AdminShell>
  )
}
