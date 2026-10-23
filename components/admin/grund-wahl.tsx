import { AdminSelect } from "@/components/admin/primitives"

/**
 * Warum verworfen? Ohne Grund lernt die Qualitätssicherung nur „schlecht“,
 * nicht „was“ — gemessen 22.10.2026: 15 Absagen in 14 Tagen, keine mit Grund.
 * Freiwillig: Verwerfen geht weiterhin mit einem Klick.
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
    <AdminSelect
      name="grund"
      defaultValue=""
      aria-label="Grund fürs Verwerfen (freiwillig)"
      className="h-9 rounded-full border-border bg-card px-3 pe-7 text-sm text-muted-foreground"
    >
      <option value="">Grund (freiwillig)</option>
      {ABSAGE_GRUENDE.map((g) => (
        <option key={g} value={g}>
          {g}
        </option>
      ))}
    </AdminSelect>
  )
}
