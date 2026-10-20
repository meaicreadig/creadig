import { neonAbfrage } from "@/lib/neon-abfrage"
import { keinKundenGeld, ladeKundenGeld, type KundenGeld } from "@/lib/finanz/kunden-bezug"

const heuteIso = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date())

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
  /** Offener Rechnungsbetrag (brutto) — nur für den Inhaber, sonst null. */
  offenCent: number | null
  /** Davon überfällig (Fälligkeit vor heute) — Anzahl; null = nicht gemessen. */
  ueberfaellig: number | null
  /** Ø Tage bis zur Zahlung bezahlter Rechnungen. */
  zahlungsdauerTage: number | null
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

export function gesundheitAus(tage: number | null, offeneRechnungen: number | null, ueberfaellig: number | null = null): Gesundheit {
  /* Eine überfällige Rechnung kostet Geld — rot, auch wenn der Kontakt frisch ist. */
  if ((ueberfaellig ?? 0) > 0) return "rot"
  if (tage === null) return "unbekannt"
  if (tage >= ROT_AB_TAGEN) return "rot"
  if (tage >= GELB_AB_TAGEN || (offeneRechnungen ?? 0) > 0) return "gelb"
  return "gruen"
}

export type GefaehrdeterKunde = {
  id: string
  name: string
  gesundheit: "gelb" | "rot"
  tageOhneKontakt: number | null
  offeneRechnungen: number
}

export type KundenLage = {
  /** Kunden mit Risiko: lange ohne Kontakt (rot) oder offene Rechnung. */
  gefaehrdet: GefaehrdeterKunde[]
  /** Kunden ohne einen einzigen belegten Kontakt — ihre Gesundheit ist nicht messbar. */
  ohneBeleg: number
}

/**
 * Die Lage aller aktiven Kunden in EINER Abfrage, für „Heute".
 *
 * Gelb allein (21–44 Tage) kommt nicht auf die Liste — das ist Kontaktpflege,
 * kein Risiko. Auf die Liste kommt, was Geld oder den Kunden kostet: rot oder
 * eine offene Rechnung. `null` heisst „nicht gemessen", nie „alles gut".
 */
export async function ladeKundenLage(): Promise<KundenLage | null> {
  const q = neonAbfrage()
  if (!q) return null
  try {
    const rows = await q(
      `SELECT org.id, org.name,
              greatest(
                (SELECT max(a.created_at) FROM activities a
                  WHERE a.subject_type = 'organisation' AND a.subject_id = org.id),
                (SELECT max(o.last_contact_at) FROM opportunities o
                  WHERE o.organisation_id = org.id AND o.excluded_reason IS NULL)
              ) AS letzter
         FROM organisations org
        WHERE org.lifecycle = 'kunde' AND org.excluded_reason IS NULL`,
      [],
    )
    /* Offene Rechnungen kommen aus Finanz (fin_dokumente) — eine Quelle, siehe lib/finanz/kunden-bezug.ts. */
    const geld = await ladeKundenGeld(q, heuteIso(), rows.map((r) => String(r.id))).catch(() => new Map<string, KundenGeld>())
    const gefaehrdet: GefaehrdeterKunde[] = []
    let ohneBeleg = 0
    for (const r of rows) {
      const g = geld.get(String(r.id)) ?? keinKundenGeld(String(r.id))
      const offen = g.offeneRechnungen
      const tage = r.letzter ? Math.floor((Date.now() - new Date(String(r.letzter)).getTime()) / 86_400_000) : null
      if (tage === null && offen === 0) {
        ohneBeleg++
        continue
      }
      const stufe = gesundheitAus(tage, offen, g.ueberfaelligAnzahl)
      if (stufe === "rot" || offen > 0) {
        gefaehrdet.push({
          id: String(r.id),
          name: String(r.name),
          gesundheit: stufe === "rot" ? "rot" : "gelb",
          tageOhneKontakt: tage,
          offeneRechnungen: offen,
        })
      }
    }
    gefaehrdet.sort((a, b) => (a.gesundheit === b.gesundheit ? (b.tageOhneKontakt ?? 0) - (a.tageOhneKontakt ?? 0) : a.gesundheit === "rot" ? -1 : 1))
    return { gefaehrdet, ohneBeleg }
  } catch {
    return null
  }
}

export async function ladeKundenkartenKopf(organisationId: string, optionen: { geldSichtbar?: boolean } = {}): Promise<KundenkartenKopf> {
  const geldSichtbar = optionen.geldSichtbar ?? false
  const q = neonAbfrage()
  const leer: KundenkartenKopf = {
    eingenommenCent: null,
    offeneRechnungen: null,
    offenCent: null,
    ueberfaellig: null,
    zahlungsdauerTage: null,
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

  const [geld, potenzial, kontakt] = await Promise.all([
    ladeKundenGeld(q, heuteIso(), [organisationId])
      .then((m) => m.get(organisationId) ?? keinKundenGeld(organisationId))
      .catch(() => null),
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
    /* Beträge sieht nur der Inhaber (Finanz ist owner-only); die Anzahlen tragen die Gesundheit für alle. */
    eingenommenCent: geld && geldSichtbar ? geld.eingenommenCent : null,
    offeneRechnungen: geld ? geld.offeneRechnungen : null,
    offenCent: geld && geldSichtbar ? geld.offenCent : null,
    ueberfaellig: geld ? geld.ueberfaelligAnzahl : null,
    zahlungsdauerTage: geld && geldSichtbar ? geld.zahlungsdauerTage : null,
    offeneAngebote: geld ? geld.offeneAngebote : null,
    potenzialEuro: potenzial,
    letzterKontakt: kontakt,
    tageOhneKontakt: tage,
    gesundheit: gesundheitAus(tage, geld ? geld.offeneRechnungen : null, geld ? geld.ueberfaelligAnzahl : null),
  }
}
