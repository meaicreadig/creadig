import { AdminShell } from "@/components/admin/admin-shell"
import { SectionHeader } from "@/components/admin/primitives"

/**
 * Während die Anfragen geladen werden.
 *
 * ---------------------------------------------------------------------------
 * WARUM NUR HIER UND NICHT ÜBERALL
 * Heute und Materialstand lesen aus dem Repository — das ist im selben
 * Prozess und dauert nichts. Diese Ansicht fragt eine DATENBANK, und mit dem
 * Neon-Adapter ist das eine Netzverbindung. Ohne Ladezustand steht die
 * vorherige Seite still, und der Unterschied zwischen „lädt" und „hängt" ist
 * für den Benutzer nicht zu sehen.
 *
 * ---------------------------------------------------------------------------
 * KEINE PLATZHALTER-ZEILEN
 * Kein Skelett aus grauen Balken, das eine Tabelle andeutet: Die Zahl der
 * Zeilen ist unbekannt, und ein Skelett mit fünf Balken behauptet fünf
 * Anfragen. Ein Satz, der sagt was passiert, behauptet nichts.
 */
export default function LeadsLoading() {
  return (
    <AdminShell
      title="Vertrieb"
      lead="Anfragen aus den Formularen der Website. Was hier steht, ist eingegangen — nicht geschätzt."
    >
      <SectionHeader title="Anfragen" />
      <p className="type-body text-muted-foreground mt-5" aria-live="polite">
        Anfragen werden geladen …
      </p>
    </AdminShell>
  )
}
