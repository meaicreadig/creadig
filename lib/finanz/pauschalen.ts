import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * Steuer-Pauschalen sind eigene Buchungen mit quelle='pauschale': Sie mindern den Gewinn (EÜR),
 * bewegen aber kein Konto. Eine Buchung je Art und Monat (feste ID) → erneutes Speichern überschreibt,
 * 0 Tage storniert. Nichts wird gelöscht.
 */
export const KM_SATZ_CENT = 30
export const VERPFLEGUNG_TAG_CENT = 1400
export const HOMEOFFICE_TAG_CENT = 600
export const HOMEOFFICE_MAX_JAHR_CENT = 126000
export const HOMEOFFICE_AB = "2025-10-20"

export const KAT_FAHRT = "Fahrtkosten (km-Pauschale)"
export const KAT_VERPFLEGUNG = "Verpflegungspauschale"
export const KAT_HOMEOFFICE = "Homeoffice-Pauschale"

export type PauschalArt = "verpflegung" | "homeoffice"

const KATEGORIE: Record<PauschalArt, string> = { verpflegung: KAT_VERPFLEGUNG, homeoffice: KAT_HOMEOFFICE }
const SATZ: Record<PauschalArt, number> = { verpflegung: VERPFLEGUNG_TAG_CENT, homeoffice: HOMEOFFICE_TAG_CENT }

export type PauschalMonat = {
  monat: string
  fahrtCent: number
  fahrtKm: number | null
  verpflegungTage: number
  verpflegungCent: number
  homeofficeTage: number
  homeofficeCent: number
}

export type PauschalJahr = {
  jahr: string
  monate: PauschalMonat[]
  summe: { fahrtCent: number; verpflegungCent: number; homeofficeCent: number; gesamtCent: number }
  homeofficeRestCent: number
}

export type ArchivZeile = { jahr: number; kategorie: string; grund: string; anzahl: number; summeCent: number }
export type Sonderausgabe = { jahr: number; art: string; summeCent: number; anzahl: number }

const zahl = (v: unknown) => (v === null || v === undefined ? 0 : Number(v))

function tageImMonat(monat: string): number {
  const [j, m] = monat.split("-").map(Number)
  return new Date(Date.UTC(j, m, 0)).getUTCDate()
}

/** Höchstzahl Tage für einen Monat – Homeoffice erst ab 20.10.2025. */
export function maxTage(art: PauschalArt, monat: string): number {
  const alle = tageImMonat(monat)
  if (art !== "homeoffice") return alle
  const ab = HOMEOFFICE_AB.slice(0, 7)
  if (monat < ab) return 0
  if (monat === ab) return alle - Number(HOMEOFFICE_AB.slice(8)) + 1
  return alle
}

/** Buchungsdatum = Monatsende, im laufenden Monat heute (zählt sonst noch nicht). */
function buchungsDatum(monat: string, heute: string): string {
  const ende = `${monat}-${String(tageImMonat(monat)).padStart(2, "0")}`
  return ende > heute ? heute : ende
}

export async function ladePauschalen(db: Abfrage, jahr: string): Promise<PauschalJahr> {
  const rows = await db(
    `SELECT to_char(datum,'YYYY-MM') AS monat, kategorie, sum(brutto_cent) AS cent, sum(pauschal_menge) AS menge
       FROM fin_buchungen
      WHERE storniert_at IS NULL AND archiviert_at IS NULL AND status = 'gebucht'
        AND kategorie IN ($2, $3, $4) AND datum >= ($1 || '-01-01')::date AND datum < (($1::int + 1) || '-01-01')::date
      GROUP BY 1, 2`,
    [jahr, KAT_FAHRT, KAT_VERPFLEGUNG, KAT_HOMEOFFICE],
  )
  const monate: PauschalMonat[] = Array.from({ length: 12 }, (_, i) => ({
    monat: `${jahr}-${String(i + 1).padStart(2, "0")}`,
    fahrtCent: 0,
    fahrtKm: null,
    verpflegungTage: 0,
    verpflegungCent: 0,
    homeofficeTage: 0,
    homeofficeCent: 0,
  }))
  for (const r of rows) {
    const m = monate.find((x) => x.monat === r.monat)
    if (!m) continue
    const cent = zahl(r.cent)
    if (r.kategorie === KAT_FAHRT) {
      m.fahrtCent += cent
      m.fahrtKm = r.menge === null ? m.fahrtKm : (m.fahrtKm ?? 0) + zahl(r.menge)
    } else if (r.kategorie === KAT_VERPFLEGUNG) {
      m.verpflegungCent += cent
      m.verpflegungTage += zahl(r.menge)
    } else {
      m.homeofficeCent += cent
      m.homeofficeTage += zahl(r.menge)
    }
  }
  const summe = monate.reduce(
    (s, m) => ({
      fahrtCent: s.fahrtCent + m.fahrtCent,
      verpflegungCent: s.verpflegungCent + m.verpflegungCent,
      homeofficeCent: s.homeofficeCent + m.homeofficeCent,
      gesamtCent: s.gesamtCent + m.fahrtCent + m.verpflegungCent + m.homeofficeCent,
    }),
    { fahrtCent: 0, verpflegungCent: 0, homeofficeCent: 0, gesamtCent: 0 },
  )
  return { jahr, monate, summe, homeofficeRestCent: Math.max(0, HOMEOFFICE_MAX_JAHR_CENT - summe.homeofficeCent) }
}

export type SetzErgebnis = { ok: true; tage: number; gekappt: boolean } | { ok: false; fehler: string }

export async function setzePauschale(
  db: Abfrage,
  art: PauschalArt,
  monat: string,
  tageGewuenscht: number,
  heute: string,
): Promise<SetzErgebnis> {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monat)) return { ok: false, fehler: "Ungültiger Monat." }
  if (monat > heute.slice(0, 7)) return { ok: false, fehler: "Zukünftige Monate können nicht gebucht werden." }
  if (!Number.isInteger(tageGewuenscht) || tageGewuenscht < 0) return { ok: false, fehler: "Tage bitte als ganze Zahl." }
  const max = maxTage(art, monat)
  if (max === 0 && tageGewuenscht > 0) return { ok: false, fehler: "Homeoffice-Pauschale gilt erst ab 20.10.2025." }
  let tage = Math.min(tageGewuenscht, max)
  let gekappt = tage < tageGewuenscht

  if (art === "homeoffice" && tage > 0) {
    const jahr = monat.slice(0, 4)
    const [r] = await db(
      `SELECT coalesce(sum(brutto_cent),0) AS cent FROM fin_buchungen
        WHERE quelle = 'pauschale' AND kategorie = $1 AND storniert_at IS NULL AND id <> $2
          AND to_char(datum,'YYYY') = $3`,
      [KAT_HOMEOFFICE, `pausch-homeoffice-${monat}`, jahr],
    )
    const restTage = Math.floor(Math.max(0, HOMEOFFICE_MAX_JAHR_CENT - zahl(r?.cent)) / HOMEOFFICE_TAG_CENT)
    if (tage > restTage) {
      tage = restTage
      gekappt = true
    }
  }

  const id = `pausch-${art}-${monat}`
  if (tage === 0) {
    await db(`UPDATE fin_buchungen SET storniert_at = now() WHERE id = $1 AND storniert_at IS NULL`, [id])
    return { ok: true, tage: 0, gekappt }
  }
  const notiz = `${tage} Tage × ${(SATZ[art] / 100).toFixed(2).replace(".", ",")} €`
  await db(
    `INSERT INTO fin_buchungen (id, art, status, datum, brutto_cent, ust_satz, kategorie, notiz, quelle, pauschal_menge)
     VALUES ($1, 'ausgabe', 'gebucht', $2::date, $3, 0, $4, $5, 'pauschale', $6)
     ON CONFLICT (id) DO UPDATE SET datum = EXCLUDED.datum, brutto_cent = EXCLUDED.brutto_cent, notiz = EXCLUDED.notiz,
       pauschal_menge = EXCLUDED.pauschal_menge, storniert_at = NULL`,
    [id, buchungsDatum(monat, heute), tage * SATZ[art], KATEGORIE[art], notiz, tage],
  )
  return { ok: true, tage, gekappt }
}

/** Archivierte Belege (Tank/Essen): bleiben erhalten, zählen nicht im Gewinn – Summe für den Steuerberater. */
export async function ladeArchiv(db: Abfrage): Promise<ArchivZeile[]> {
  const rows = await db(
    `SELECT extract(year from datum)::int AS jahr, kategorie, coalesce(archiv_grund,'archiviert') AS grund,
            count(*) AS anzahl, sum(brutto_cent) AS cent
       FROM fin_buchungen WHERE archiviert_at IS NOT NULL AND storniert_at IS NULL
      GROUP BY 1, 2, 3 ORDER BY 1 DESC, 2`, [],
  )
  return rows.map((r: Record<string, unknown>) => ({
    jahr: zahl(r.jahr),
    kategorie: String(r.kategorie),
    grund: String(r.grund),
    anzahl: zahl(r.anzahl),
    summeCent: zahl(r.cent),
  }))
}

/** Sonderausgaben (Spenden usw.) – privat, außerhalb der EÜR, für die ESt-Erklärung. */
export async function ladeSonderausgaben(db: Abfrage): Promise<Sonderausgabe[]> {
  const rows = await db(
    `SELECT jahr, art, sum(betrag_cent) AS cent, count(*) AS anzahl FROM fin_sonderausgaben
      WHERE storniert_at IS NULL GROUP BY 1, 2 ORDER BY 1 DESC, 2`, [],
  )
  return rows.map((r: Record<string, unknown>) => ({ jahr: zahl(r.jahr), art: String(r.art), summeCent: zahl(r.cent), anzahl: zahl(r.anzahl) }))
}
