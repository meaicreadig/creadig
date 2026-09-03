import type { ReactNode } from "react"

import { AdminShell } from "@/components/admin/admin-shell"
import { UnavailableNote } from "@/components/admin/primitives"

/**
 * Die Hülle der Kundensicht.
 *
 * ---------------------------------------------------------------------------
 * WARUM EIGENER BEREICH UND NICHT WEITER EIN REGISTER DES VERTRIEBS
 * „Mit wem haben wir gearbeitet?" ist eine andere Frage als „was ist gerade
 * in Arbeit?". Die erste beantwortet der Bestand, die zweite die Pipeline.
 * Solange das Kundenregister ein Register des Vertriebs war, musste man den
 * Vertrieb öffnen, um den Bestand zu sehen — und die Antwort auf die häufigste
 * Frage lag zwei Klicks tief hinter der auf eine seltenere.
 *
 * Die Datensätze bleiben dieselben. Es entsteht kein zweites Modell, keine
 * zweite Tabelle und keine Kopie: `organisations`, `locations`, `contacts`,
 * `opportunities` und `activities` sind unverändert die Quelle.
 *
 * ---------------------------------------------------------------------------
 * WARUM KEINE REGISTER-LEISTE
 * Der Bereich hat zwei Ansichten: die Liste und die Akte. Eine Leiste mit
 * einem Punkt ist keine Navigation, sondern eine Überschrift mit Rahmen.
 */
export function KundenShell({
  title,
  lead,
  meta,
  available,
  children,
}: {
  title: string
  lead?: string
  meta?: ReactNode
  /** Ob der Speicher erreichbar ist. Serverseitig gemessen. */
  available: boolean
  children: ReactNode
}) {
  return (
    <AdminShell title={title} lead={lead} meta={available ? meta : undefined} salesAvailable>
      {available ? (
        children
      ) : (
        /*
         * Kein Speicher heisst NICHT „keine Kunden". Der Bestand liegt in
         * derselben Datenbank wie der Vertrieb; ist sie nicht erreichbar,
         * zeigt diese Seite nichts, statt Leere zu behaupten.
         */
        <UnavailableNote title="Der Bestand braucht die Datenbank">
          Organisationen, Standorte und Ansprechpartner liegen in der
          Lead-Datenbank. Ist sie nicht eingerichtet oder gerade nicht
          erreichbar, kann diese Ansicht nichts zeigen. Das ist keine leere
          Kundenliste, sondern eine fehlende Messung.
        </UnavailableNote>
      )}
    </AdminShell>
  )
}
