import { neonAbfrage } from "@/lib/neon-abfrage"

/**
 * Der Kopf der Kundenkarte: Geld, Gesundheit, letzter Kontakt.
 *
 * Nur Lese-Abfragen auf bestehende Tabellen. Jede Zahl ist einzeln gemessen —
 * scheitert eine Abfrage, steht dort `null` („nicht gemessen"), nie eine Null.
 * Testdatensätze (`excluded_reason`) zählen nicht mit.
 */
export type Gesundheit = "gruen" | "gelb" | "rot" | "unbekannt"

export type KundenkartenKopf = {
  /** Summe eingegangener Zahlungen, in Cent. */
  eingenommenCent: number | null
  /** Gestellte Rechnungen ohne Zahlungseingang. */
  offeneRechnungen: number | null
  /** Gesendete Angebote, noch ohne Antwort. */
  offeneAngebote: number | null
  /** Geschätzter Wert offener Chancen, in Euro. */
  potenzialEuro: number | null
  /** Letzter belegter Kontakt (Chronik oder Chance), ISO. */
  letzterKontakt: string | null
  tageOhneKontakt: number | null
  gesundheit: Gesundheit
}

const GELB_AB_TAGEN = 21
const ROT_AB_TAGEN = 45

export function gesundheitAus(tage: number | null, offeneRechnungen: number | null): Gesundheit {
  if (tage === null) return "unbekannt"
  if (tage >= ROT_AB_TAGEN) return "rot"
  if (tage >= GELB_AB_TAGEN || (offeneRechnungen ?? 0) > 0) return "gelb"
  return "gruen"
}

export async function ladeKundenkartenKopf(organisationId: string): Promise<KundenkartenKopf> {
  const q = neonAbfrage()
  const leer: KundenkartenKopf = {
    eingenommenCent: null,
    offeneRechnungen: null,
    offeneAngebote: null,
    potenzialEuro: null,
    letzterKontakt: null,
    tageOhneKontakt: null,
    gesundheit: "unbekannt",
  }
  if (!q) return leer

  const eins = async <T,>(text: string, lesen: (rows: Record<string, unknown>[]) => T): Promise<T | null> => {
    try {
      return lesen(await q(text, [organisationId]))
    } catch {
      return null
    }
  }
  const zahl = (v: unknown) => Number(v ?? 0)
  const chancen = `SELECT id FROM opportunities WHERE organisation_id = $1 AND excluded_reason IS NULL`

  const [eingenommen, rechnungen, angebote, potenzial, kontakt] = await Promise.all([
    eins(
      `SELECT coalesce(sum(p.amount_cent), 0) AS n
         FROM payments p JOIN invoices i ON i.id = p.invoice_id
        WHERE i.opportunity_id IN (${chancen})`,
      (r) => zahl(r[0]?.n),
    ),
    eins(
      `SELECT count(*) AS n FROM invoices i
        WHERE i.state = 'gestellt' AND i.opportunity_id IN (${chancen})
          AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)`,
      (r) => zahl(r[0]?.n),
    ),
    eins(
      `SELECT count(*) AS n FROM offers WHERE state = 'gesendet' AND opportunity_id IN (${chancen})`,
      (r) => zahl(r[0]?.n),
    ),
    eins(
      `SELECT coalesce(sum(estimated_value), 0) AS n FROM opportunities
        WHERE organisation_id = $1 AND excluded_reason IS NULL AND status NOT IN ('won','lost')`,
      (r) => zahl(r[0]?.n),
    ),
    eins(
      `SELECT greatest(
                (SELECT max(created_at) FROM activities WHERE subject_type = 'organisation' AND subject_id = $1),
                (SELECT max(last_contact_at) FROM opportunities WHERE organisation_id = $1 AND excluded_reason IS NULL)
              ) AS t`,
      (r) => (r[0]?.t ? new Date(String(r[0].t)).toISOString() : null),
    ),
  ])

  const tage = kontakt ? Math.floor((Date.now() - new Date(kontakt).getTime()) / 86_400_000) : null

  return {
    eingenommenCent: eingenommen,
    offeneRechnungen: rechnungen,
    offeneAngebote: angebote,
    potenzialEuro: potenzial,
    letzterKontakt: kontakt,
    tageOhneKontakt: tage,
    gesundheit: gesundheitAus(tage, rechnungen),
  }
}
