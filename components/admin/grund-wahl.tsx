import { AdminSelect } from "@/components/admin/primitives"

/**
 * Warum verworfen? Ohne Grund lernt die Qualitätssicherung nur „schlecht“,
 * nicht „was“ — gemessen 22.10.2026: 15 Absagen in 14 Tagen, keine mit Grund.
 * Freiwillig: Verwerfen geht weiterhin mit einem Klick.
 *
 * Katman 5: Das Freitextfeld ist der stärkste Hebel – ein Satz hier wird
 * sofort Regel im Firmengedächtnis (lib/lernen) und geht in jeden weiteren
 * Entwurf dieses Agenten.
 */
export const ABSAGE_GRUENDE = [
  "Falsche Zielgruppe",
  "Inhalt falsch oder unbelegt",
  "Ton passt nicht",
  "Falscher Zeitpunkt",
  "Doppelt",
  "Testdaten",
  "Sonstiges",
] as const

export function GrundWahl() {
  return (
    <>
    <AdminSelect
      name="grund"
      defaultValue=""
      aria-label="Grund fürs Verwerfen (freiwillig)"
      className="rounded-full border-border bg-card px-3 py-1.5 pe-7 text-sm text-muted-foreground"
    >
      <option value="">Grund (freiwillig)</option>
      {ABSAGE_GRUENDE.map((g) => (
        <option key={g} value={g}>
          {g}
        </option>
      ))}
    </AdminSelect>
    <input
      type="text"
      name="grund_text"
      maxLength={600}
      placeholder="Warum genau? Wird Regel für den Agenten"
      aria-label="Warum genau – wird als Regel für den Agenten gemerkt (freiwillig)"
      className="min-w-0 flex-1 basis-56 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
    />
    </>
  )
}
