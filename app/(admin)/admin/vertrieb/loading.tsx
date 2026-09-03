import { AdminShell } from "@/components/admin/admin-shell"
import { VertriebNav } from "@/components/admin/vertrieb-nav"

/**
 * Während der Vertriebsbereich lädt.
 *
 * Diese Seiten fragen eine Datenbank über das Netz. Ohne Ladezustand steht
 * die vorherige Seite still, und der Unterschied zwischen „lädt" und „hängt"
 * ist nicht zu sehen.
 *
 * Kein Skelett aus grauen Balken: Die Zahl der Zeilen ist unbekannt, und ein
 * Skelett mit fünf Balken behauptet fünf Vorgänge. Ein Satz behauptet nichts.
 */
export default function VertriebLoading() {
  return (
    <AdminShell title="Vertrieb" salesAvailable>
      <VertriebNav />
      <p className="type-body text-muted-foreground mt-8" aria-live="polite">
        Wird geladen …
      </p>
    </AdminShell>
  )
}
