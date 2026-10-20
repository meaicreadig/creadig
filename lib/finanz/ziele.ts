import "server-only"

import { mitSchemaMarker } from "@/lib/finanz/schema-marker"
import { randomUUID } from "node:crypto"

import type { Abfrage } from "@/lib/neon-abfrage"
import { istGeschaeftsfeld, type Geschaeftsfeld } from "@/lib/finanz/beleg-felder"

/**
 * Ziel-Tracker für Säulen ohne (noch) echte Buchungen (Beratung, Content in
 * der Frühphase) — getrennt von, aber verbunden mit der echten Buchhaltung.
 * Der "aktuelle Stand" ist NIE eine eigene Zahl, sondern immer aus
 * fin_buchungen abgeleitet (eine Quelle der Wahrheit, siehe ladeZiele()).
 */
export const ZIEL_PLATZHALTER_TITEL = "Platzhalter – vom Owner zu ersetzen"
/** Geprüftes Namensmuster statt eigener Spalte — ein Platzhalter trägt immer exakt diesen Titel-Anfang. */
export const istPlatzhalterZiel = (titel: string): boolean => titel.startsWith("Platzhalter –")

export type ZielStatus = "aktiv" | "erreicht" | "verworfen"

export type Ziel = {
  id: string
  saeule: Geschaeftsfeld
  titel: string
  zielbetragCent: number
  frist: string
  status: ZielStatus
  notiz: string | null
  standCent: number
  createdAt: string
  erreichtAt: string | null
  istPlatzhalter: boolean
}

export const ZIELE_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS fin_ziele (
    id text PRIMARY KEY,
    saeule text NOT NULL CHECK (saeule IN ('digitalprodukte','beratung','content','glasfaser','privat','sonstiges')),
    titel text NOT NULL,
    zielbetrag_cent bigint NOT NULL CHECK (zielbetrag_cent >= 0),
    frist date NOT NULL,
    status text NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv','erreicht','verworfen')),
    notiz text,
    created_at timestamptz NOT NULL DEFAULT now(),
    erreicht_at timestamptz)`,
  `CREATE INDEX IF NOT EXISTS fin_ziele_saeule_idx ON fin_ziele (saeule, frist)`,
  /*
   * Je ein Platzhalter für die drei Säulen mit Umsatzziel (Digitalprodukte,
   * Beratung, Content) — Betrag 0, klar als Platzhalter benannt, damit die
   * Seite beim ersten Öffnen nicht leer ist, aber niemand eine erfundene
   * Zahl für eine echte hält. Fixe IDs: läuft genau einmal, nie doppelt.
   */
  `INSERT INTO fin_ziele (id, saeule, titel, zielbetrag_cent, frist, notiz) VALUES
     ('ziel-platzhalter-digitalprodukte', 'digitalprodukte', 'Platzhalter – vom Owner zu ersetzen', 0, (date_trunc('year', now()) + interval '1 year' - interval '1 day')::date, 'Vom Owner zu ersetzen.'),
     ('ziel-platzhalter-beratung', 'beratung', 'Platzhalter – vom Owner zu ersetzen', 0, (date_trunc('year', now()) + interval '1 year' - interval '1 day')::date, 'Vom Owner zu ersetzen.'),
     ('ziel-platzhalter-content', 'content', 'Platzhalter – vom Owner zu ersetzen', 0, (date_trunc('year', now()) + interval '1 year' - interval '1 day')::date, 'Vom Owner zu ersetzen.')
   ON CONFLICT (id) DO NOTHING`,
]

let bereit: Promise<void> | null = null
export async function zieleSchema(db: Abfrage): Promise<void> {
  if (!bereit) {
    bereit = (async () => {
      await mitSchemaMarker(db, "ziele", ZIELE_SCHEMA)
    })().catch((e) => {
      bereit = null
      throw e
    })
  }
  await bereit
}

const n = (v: unknown) => Number(v ?? 0)

function zuZiel(r: Record<string, unknown>): Ziel {
  const titel = String(r.titel)
  return {
    id: String(r.id),
    saeule: istGeschaeftsfeld(String(r.saeule)) ? (String(r.saeule) as Geschaeftsfeld) : "sonstiges",
    titel,
    zielbetragCent: n(r.zielbetrag_cent),
    frist: String(r.frist),
    status: r.status as ZielStatus,
    notiz: r.notiz ? String(r.notiz) : null,
    standCent: n(r.stand_cent),
    createdAt: String(r.created_at),
    erreichtAt: r.erreicht_at ? String(r.erreicht_at) : null,
    istPlatzhalter: istPlatzhalterZiel(titel),
  }
}

/*
 * Fortschritt eines Ziels = Summe der echten Einnahmen derselben Säule seit
 * Anlage des Ziels — nie eine zweite, eigene Zahl. Die zweite Bedingung
 * holt auch GoBD-eingefrorene Alt-Buchungen ('it'/'software'/'ecommerce')
 * für die Säule 'digitalprodukte' — ihr geschaeftsfeld kann nicht mehr per
 * UPDATE übersetzt werden, siehe geschaeftsfeldSchluessel() in
 * lib/finanz/beleg-felder.ts und den Kommentar in BELEGE_SCHEMA.
 */
const STAND_SQL = `COALESCE((
  SELECT sum(b.brutto_cent) FROM fin_buchungen b
   WHERE b.art = 'einnahme' AND b.status = 'gebucht' AND b.storniert_at IS NULL
     AND b.datum >= z.created_at::date
     AND (b.geschaeftsfeld = z.saeule OR (z.saeule = 'digitalprodukte' AND b.geschaeftsfeld IN ('it','software','ecommerce')))
), 0)`

/** Jahresziel-Vorschlag aus dem bisherigen Umsatz: Hochrechnung aufs Jahr, +25 %, aufgerundet auf volle 500 €. Rein. */
export function jahreszielVorschlagCent(bisherCent: number, tagImJahr: number): number {
  if (bisherCent <= 0) return 0
  const hochrechnung = Math.max(bisherCent, Math.round((bisherCent / Math.max(1, tagImJahr)) * 365))
  return Math.ceil((hochrechnung * 1.25) / 50_000) * 50_000
}

/**
 * Platzhalter-Ziele ersetzen sich selbst: sobald die Säule echte Einnahmen im
 * laufenden Jahr hat, wird aus „Platzhalter“ ein Jahresziel mit Vorschlag aus
 * der Hochrechnung (änderbar). Ohne Einnahmen bleibt der Platzhalter — er wird
 * dann nicht angezeigt (siehe ZieleListe), statt „vom Owner zu ersetzen“ zu rufen.
 */
async function ersetzePlatzhalter(db: Abfrage): Promise<void> {
  const heute = new Date().toISOString().slice(0, 10)
  const jahr = heute.slice(0, 4)
  const tagImJahr = Math.floor((Date.parse(`${heute}T00:00:00Z`) - Date.parse(`${jahr}-01-01T00:00:00Z`)) / 86_400_000) + 1
  const offen = await db(`SELECT id, saeule FROM fin_ziele WHERE status = 'aktiv' AND titel LIKE 'Platzhalter –%'`, [])
  for (const z of offen) {
    const [e] = await db(
      `SELECT coalesce(sum(brutto_cent),0) AS s FROM fin_buchungen
        WHERE art = 'einnahme' AND status = 'gebucht' AND storniert_at IS NULL AND datum >= $2::date
          AND (geschaeftsfeld = $1 OR ($1 = 'digitalprodukte' AND geschaeftsfeld IN ('it','software','ecommerce')))`,
      [z.saeule, `${jahr}-01-01`],
    )
    const vorschlag = jahreszielVorschlagCent(Number(e?.s ?? 0), tagImJahr)
    if (vorschlag <= 0) continue
    await db(
      `UPDATE fin_ziele SET titel = $2, zielbetrag_cent = $3, frist = $4::date, notiz = $5 WHERE id = $1 AND titel LIKE 'Platzhalter –%'`,
      [z.id, `Jahresziel ${jahr}`, vorschlag, `${jahr}-12-31`, "Automatisch aus deinem bisherigen Umsatz hochgerechnet (+25 %). Du kannst den Betrag jederzeit ändern."],
    )
  }
}

export async function ladeZiele(db: Abfrage): Promise<Ziel[]> {
  await zieleSchema(db)
  await ersetzePlatzhalter(db)
  /* Selbstheilend wie der Rest von Finanz: ein Ziel, dessen abgeleiteter Stand die Zielsumme erreicht hat, wird als erreicht festgehalten (Betrag 0 zählt nicht als "erreicht" — das wäre nur das Platzhalter-Artefakt). */
  await db(
    `UPDATE fin_ziele z SET status = 'erreicht', erreicht_at = now()
      WHERE z.status = 'aktiv' AND z.zielbetrag_cent > 0 AND ${STAND_SQL} >= z.zielbetrag_cent`,
    [],
  )
  const r = await db(
    `SELECT z.id, z.saeule, z.titel, z.zielbetrag_cent, to_char(z.frist,'YYYY-MM-DD') AS frist, z.status, z.notiz,
            to_char(z.created_at,'YYYY-MM-DD') AS created_at, to_char(z.erreicht_at,'YYYY-MM-DD') AS erreicht_at,
            ${STAND_SQL} AS stand_cent
       FROM fin_ziele z ORDER BY z.frist ASC, z.created_at ASC`,
    [],
  )
  return r.map(zuZiel)
}

export type ZielEingabe = {
  saeule: Geschaeftsfeld
  titel: string
  zielbetragCent: number
  frist: string
  notiz: string | null
}

export async function zielAnlegen(db: Abfrage, eingabe: ZielEingabe): Promise<string> {
  await zieleSchema(db)
  const id = randomUUID()
  await db(
    `INSERT INTO fin_ziele (id, saeule, titel, zielbetrag_cent, frist, notiz) VALUES ($1,$2,$3,$4,$5,$6)`,
    [id, eingabe.saeule, eingabe.titel, eingabe.zielbetragCent, eingabe.frist, eingabe.notiz],
  )
  return id
}

export async function zielAktualisieren(db: Abfrage, id: string, eingabe: ZielEingabe): Promise<void> {
  await zieleSchema(db)
  await db(
    `UPDATE fin_ziele SET saeule = $2, titel = $3, zielbetrag_cent = $4, frist = $5, notiz = $6 WHERE id = $1`,
    [id, eingabe.saeule, eingabe.titel, eingabe.zielbetragCent, eingabe.frist, eingabe.notiz],
  )
}

export async function zielVerwerfen(db: Abfrage, id: string): Promise<void> {
  await zieleSchema(db)
  await db(`UPDATE fin_ziele SET status = 'verworfen' WHERE id = $1 AND status = 'aktiv'`, [id])
}

/**
 * Für die § 19-Projektion (Phase 4, lib/finanz/paragraph19.ts): Summe aktiver,
 * NICHT als Platzhalter markierter Beratungs-Ziele mit Frist im laufenden Jahr.
 */
export async function offeneBeratungsZieleCent(db: Abfrage, heute: string): Promise<number> {
  await zieleSchema(db)
  const jahr = heute.slice(0, 4)
  const r = await db(
    `SELECT coalesce(sum(zielbetrag_cent), 0) AS s FROM fin_ziele
      WHERE saeule = 'beratung' AND status = 'aktiv' AND titel NOT LIKE 'Platzhalter –%' AND coalesce(notiz,'') NOT LIKE 'Automatisch aus%'
        AND frist >= $1::date AND frist < $2::date`,
    [`${jahr}-01-01`, `${Number(jahr) + 1}-01-01`],
  )
  return n(r[0]?.s)
}
