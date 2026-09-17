"use client"

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
  /*
   * ADM-01 — die Hülle ist eine Server-Komponente (Sprache, Rolle); eine
   * Fehlergrenze läuft im Browser. Deshalb eine schlichte eigene Fläche mit
   * der Sprache aus `<html lang>`.
   */
  const tr = typeof document !== "undefined" && document.documentElement.lang === "tr"
  return (
    <main className="bg-background text-foreground min-h-dvh px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
      <h1 className="type-h3 mb-6">{tr ? "Bir şeyler ters gitti" : "Etwas ist schiefgegangen"}</h1>
      <UnavailableNote title={tr ? "Bu görünüm yüklenemedi" : "Diese Ansicht konnte nicht geladen werden"}>
        {tr ? (
          <>Hata bizim tarafımızda. En sık neden: bir veri kaynağı yanıt vermiyor. Bu, verilerin <strong>eksik</strong> olduğu anlamına gelmez — yalnızca şu an ulaşılamıyorlar.</>
        ) : (
          <>Der Fehler liegt auf unserer Seite. Häufigste Ursache: eine Datenquelle antwortet nicht. Das heißt <strong>nicht</strong>, dass Daten fehlen — nur, dass sie gerade nicht erreichbar sind.</>
        )}
      </UnavailableNote>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" onClick={reset} className="cta-quiet px-4 py-2 text-sm">
          {tr ? "Tekrar dene" : "Erneut versuchen"}
        </button>
        {error.digest && (
          <span className="text-meta text-muted-foreground">
            {tr ? "Kayıt kimliği:" : "Kennung fürs Protokoll:"} <code className="font-mono">{error.digest}</code>
          </span>
        )}
      </div>
      </div>
    </main>
  )
}
