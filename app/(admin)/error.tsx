"use client"

import { AdminShell } from "@/components/admin/admin-shell"
import { UnavailableNote } from "@/components/admin/primitives"

/**
 * Wenn im Control Center etwas wirft.
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS HIER STEHT
 * Ohne diese Datei zeigt Next seine eigene Fehlerseite: eine weisse Fläche
 * mit einem generischen Satz. Auf der öffentlichen Seite wäre das nur
 * hässlich; hier ist es der Moment, in dem man am dringendsten wissen will,
 * WAS kaputt ist — ein Speicher, der nicht antwortet, sieht sonst aus wie
 * eine Anwendung, die nicht funktioniert.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER NICHT STEHT
 * Die Fehlermeldung selbst. `error.message` kann eine Verbindungszeichenfolge
 * enthalten — bei einem Datenbankfehler ist genau das der wahrscheinliche
 * Inhalt. Gezeigt wird die `digest`, mit der sich der Eintrag im Server-Log
 * wiederfinden lässt; der Text bleibt dort, wo er hingehört.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <AdminShell title="Etwas ist schiefgegangen">
      <UnavailableNote title="Diese Ansicht konnte nicht geladen werden">
        Der Fehler liegt auf unserer Seite. Häufigste Ursache im Control
        Center: eine Datenquelle antwortet nicht. Das heisst <strong>nicht</strong>,
        dass Daten fehlen — nur, dass sie gerade nicht erreichbar sind.
      </UnavailableNote>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" onClick={reset} className="cta-quiet px-4 py-2 text-sm">
          Erneut versuchen
        </button>
        {error.digest && (
          <span className="text-meta text-muted-foreground">
            Kennung fürs Protokoll: <code className="font-mono">{error.digest}</code>
          </span>
        )}
      </div>
    </AdminShell>
  )
}
