import { leadStoreConfigured } from "@/lib/lead-store"
import { UnavailableNote } from "@/components/admin/primitives"
import { adminSprachKontext } from "@/lib/admin-i18n/server"

/**
 * ADM-02 · A19 — WELCHER der beiden Datenbank-Zustände, nicht „einer von beiden“.
 *
 * Bis 17.09.2026 sagten Vertrieb und Kunden in beiden Fällen denselben Satz:
 * „Ist sie nicht eingerichtet oder gerade nicht erreichbar …“. Das sind zwei
 * verschiedene Lagen mit zwei verschiedenen Handlungen:
 *
 *   nicht eingerichtet  → eine Einrichtungsaufgabe (einmal, bewusst)
 *   nicht erreichbar    → eine Störung (erneut versuchen, später prüfen)
 *
 * Entschieden wird serverseitig: Ist ein Speicher eingerichtet und die Ansicht
 * trotzdem ohne Daten, war er nicht erreichbar. Keiner der beiden Zustände ist
 * eine Null — beide Texte sagen das.
 */
export type SpeicherGrund = "nicht-eingerichtet" | "nicht-erreichbar"

export function speicherGrund(): SpeicherGrund {
  return leadStoreConfigured() ? "nicht-erreichbar" : "nicht-eingerichtet"
}

export async function SpeicherHinweis({ bereich, inhalt }: { bereich: string; inhalt: string }) {
  const { t } = await adminSprachKontext()
  if (speicherGrund() === "nicht-eingerichtet") {
    return (
      <UnavailableNote title={t.speicher.nichtEingerichtetTitel(bereich)}>
        {t.speicher.nichtEingerichtetText(inhalt)}
      </UnavailableNote>
    )
  }
  return (
    <div>
      <UnavailableNote title={t.speicher.nichtErreichbarTitel(bereich)}>
        {t.speicher.nichtErreichbarText(inhalt)}
      </UnavailableNote>
      <a href="" className="text-gold-text mt-3 inline-block text-sm underline underline-offset-4">
        {t.speicher.erneutLaden}
      </a>
    </div>
  )
}
