import type { ReactNode } from "react"

import { AdminShell } from "@/components/admin/admin-shell"
import { SpeicherHinweis } from "@/components/admin/speicher-hinweis"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { VertriebNav } from "@/components/admin/vertrieb-nav"

/**
 * Die Hülle aller Vertriebsseiten.
 *
 * Sie hält zwei Dinge zusammen, die auf jeder der acht Seiten gleich sind:
 * die Register und die Antwort auf die Frage, was passiert, wenn es keine
 * Datenbank gibt. Beides an einer Stelle, weil beides sonst achtmal leicht
 * unterschiedlich wäre.
 */
export async function VertriebShell({
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
  const { t } = await adminSprachKontext()
  return (
    <AdminShell title={title} lead={lead} meta={available ? meta : undefined}>
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
          <SpeicherHinweis bereich={t.nav.vertrieb.label} inhalt={t.speicher.inhaltVertrieb} />
        )}
      </div>
    </AdminShell>
  )
}
