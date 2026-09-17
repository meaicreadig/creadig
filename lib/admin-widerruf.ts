import { neonAbfrage, tabelleFehlt as fehlt, type Abfrage } from "@/lib/neon-abfrage"

import { verifySession, type SessionErgebnis } from "@/lib/admin-session"

/**
 * ADM-02 · H2 — Sitzungen serverseitig widerrufen.
 *
 * ---------------------------------------------------------------------------
 * WAS FEHLTE
 * Die Sitzung ist ein signierter Wert ohne Speicher. Abmelden loeschte das
 * Cookie im eigenen Browser; eine Kopie (anderes Geraet, abgefangenes Cookie,
 * geteilter Rechner) blieb bis zum Ablauf nach acht Stunden gueltig. Das ist
 * kein Widerruf, sondern Vergessen.
 *
 * ---------------------------------------------------------------------------
 * WIE
 * Eine Tabelle der WIDERRUFENEN Sitzungen (`admin_session_revocations`,
 * Migration 015), keine Tabelle aller Sitzungen: Die Anmeldung bleibt ohne
 * Schreibzugriff moeglich, gespeichert wird nur, was nicht mehr gelten soll.
 *
 *   sid = <32 hex>  diese eine Sitzung (Abmelden)
 *   sid = '*'       alle Sitzungen, die VOR `revoked_at` ausgestellt wurden
 *                   („ueberall abmelden")
 *
 * Abgelaufene Eintraege werden beim naechsten Widerruf entfernt — eine
 * Sitzung, die ohnehin nicht mehr gilt, muss niemand mehr sperren.
 *
 * ---------------------------------------------------------------------------
 * WENN DIE DATENBANK NICHT ANTWORTET
 *   · nicht eingerichtet (kein `LEAD_STORE=neon`)  → Widerruf nicht
 *     verfuegbar; die Sitzung gilt wie bisher bis zum Ablauf. Das wird in
 *     der Systemdiagnose benannt, nicht verschwiegen (ADM-01 · System).
 *   · eingerichtet, Tabelle fehlt (015 offen)      → wie nicht eingerichtet:
 *     ohne Tabelle gibt es keinen Widerruf, der uebersehen werden koennte.
 *   · eingerichtet, aber gestoert                  → LESEN erlaubt,
 *     AENDERN abgelehnt (503). Ein Datenbankausfall soll den Owner nicht aus
 *     seiner eigenen Diagnose aussperren; eine moeglicherweise widerrufene
 *     Sitzung soll aber auch nichts veraendern koennen.
 */

export type { Abfrage }

export const WIDERRUF_ALLE = "*"

/** Die Abfragefunktion — oder `null`, wenn kein Speicher eingerichtet ist. */
export const widerrufSpeicher = neonAbfrage

export async function istWiderrufen(q: Abfrage, sid: string, issuedAt: number): Promise<boolean> {
  const rows = await q(
    `SELECT 1 FROM admin_session_revocations
      WHERE sid = $1::text
         OR (sid = $2::text AND revoked_at >= to_timestamp($3::double precision / 1000))
      LIMIT 1`,
    [sid, WIDERRUF_ALLE, issuedAt],
  )
  return rows.length > 0
}

export async function widerrufen(
  q: Abfrage,
  sid: string,
  expiresAt: number,
  grund: "abmelden" | "ueberall-abmelden",
): Promise<void> {
  await q(
    `INSERT INTO admin_session_revocations (sid, revoked_at, expires_at, reason)
     VALUES ($1::text, now(), to_timestamp($2::double precision / 1000), $3::text)
     ON CONFLICT (sid) DO NOTHING`,
    [sid, expiresAt, grund],
  )
  await q(
    `DELETE FROM admin_session_revocations WHERE sid <> $1::text AND expires_at < now()`,
    [WIDERRUF_ALLE],
  )
}

/**
 * Alle bis jetzt ausgestellten Sitzungen ungueltig — die eigene eingeschlossen.
 * `expires_at` des Stichtags liegt weit in der Zukunft: Die Zeile wird nie
 * aufgeraeumt, nur ueberschrieben.
 */
export async function alleWiderrufen(q: Abfrage): Promise<void> {
  await q(
    `INSERT INTO admin_session_revocations (sid, revoked_at, expires_at, reason)
     VALUES ($1::text, now(), 'infinity'::timestamptz, 'ueberall-abmelden')
     ON CONFLICT (sid) DO UPDATE SET revoked_at = now()`,
    [WIDERRUF_ALLE],
  )
}

export type ZugangsErgebnis = SessionErgebnis & {
  /** `true`, wenn der Widerruf nicht geprueft werden konnte (Speicher gestoert). */
  widerrufUngeprueft?: boolean
}

/**
 * Signatur, Ablauf UND Widerruf — die eine Pruefung fuer Middleware und
 * Server Actions.
 *
 * `aendernd`: Bei gestoertem Speicher wird eine aendernde Anfrage abgelehnt
 * (`unavailable`), eine lesende bekommt `ok` mit `widerrufUngeprueft`.
 */
export async function pruefeZugang(
  cookie: unknown,
  { aendernd, speicher = widerrufSpeicher(), now = Date.now() }: {
    aendernd: boolean
    speicher?: Abfrage | null
    now?: number
  },
): Promise<ZugangsErgebnis> {
  const ergebnis = await verifySession(cookie, now)
  if (ergebnis.verdict !== "ok" || !ergebnis.sid || ergebnis.issuedAt === undefined) return ergebnis
  if (!speicher) return ergebnis

  try {
    if (await istWiderrufen(speicher, ergebnis.sid, ergebnis.issuedAt)) {
      return { verdict: "revoked", rolle: null }
    }
    return ergebnis
  } catch (error) {
    /*
     * Tabelle fehlt (Migration 015 noch nicht angewandt): Dann KANN es keinen
     * Widerruf geben — nichts wird uebersehen. Ein Deploy vor der Migration
     * darf den Admin nicht lahmlegen; die Systemdiagnose nennt den Stand.
     */
    if (tabelleFehlt(error)) return { ...ergebnis, widerrufUngeprueft: true }
    if (aendernd) return { verdict: "unavailable", rolle: null }
    return { ...ergebnis, widerrufUngeprueft: true }
  }
}

export function tabelleFehlt(error: unknown): boolean {
  return fehlt(error, "admin_session_revocations")
}
