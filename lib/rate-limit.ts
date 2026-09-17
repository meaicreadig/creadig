import { bucketKeyIsPseudonymous, withinLimit, LIMITS_INFO } from "@/lib/lead-guard"
import { neonAbfrage, tabelleFehlt, type Abfrage } from "@/lib/neon-abfrage"

/**
 * ADM-02 · H3 — ein Versuchsfenster, das ueber Instanzen hinweg zaehlt.
 *
 * ---------------------------------------------------------------------------
 * WAS FEHLTE
 * `withinLimit()` zaehlt im Arbeitsspeicher EINER Instanz. Auf Vercel laufen
 * mehrere, und jede faengt nach einem Kaltstart bei null an: Zehn Versuche
 * je Instanz sind bei zehn Instanzen hundert. Gegen ein Skript, das auf die
 * Anmeldung raet, ist das eine Grenze auf dem Papier.
 *
 * ---------------------------------------------------------------------------
 * WIE
 * Feste Zehn-Minuten-Fenster in `rate_limit_windows` (Migration 016). Ein
 * `INSERT … ON CONFLICT DO UPDATE … RETURNING hits` zaehlt atomar hoch — zwei
 * gleichzeitige Versuche koennen nicht beide „der erste" sein.
 *
 * Gezaehlt wird JEDER Versuch, auch ein abgewiesener: Wer im gesperrten
 * Fenster weiterprobiert, verlaengert nichts, aber verkuerzt auch nichts.
 *
 * ---------------------------------------------------------------------------
 * DATENSCHUTZ
 * In die Datenbank geht nur ein SIGNIERTER Schluessel (`bucketKey()` mit
 * Geheimnis), zusaetzlich SHA-256-gehasht. Ohne Geheimnis waere der Schluessel
 * die rohe Adresse — dann bleibt es beim Arbeitsspeicher.
 * Fenster aelter als ein Tag werden beim ersten Treffer eines neuen Fensters
 * entfernt.
 *
 * ---------------------------------------------------------------------------
 * WENN DIE DATENBANK NICHT KANN
 * Kein Speicher, Tabelle fehlt oder Fehler → das bisherige Fenster im
 * Arbeitsspeicher. Eine gestoerte Datenbank darf den Owner nicht von seiner
 * eigenen Anmeldung aussperren; die schwaechere Grenze bleibt eine Grenze.
 */

export const RATE_WINDOW_MS = LIMITS_INFO.WINDOW_MS

export type LimitErgebnis = { erlaubt: boolean; quelle: "datenbank" | "arbeitsspeicher" }

async function hash(key: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key))
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("")
}

export async function durableWithinLimit(
  key: string,
  limit: number,
  { now = Date.now(), speicher = neonAbfrage() }: { now?: number; speicher?: Abfrage | null } = {},
): Promise<LimitErgebnis> {
  /* Ohne Geheimnis ist der Schluessel die rohe Adresse — die bleibt im Arbeitsspeicher. */
  if (!speicher || !bucketKeyIsPseudonymous()) {
    return { erlaubt: withinLimit(key, limit, now), quelle: "arbeitsspeicher" }
  }

  try {
    const fenster = Math.floor(now / RATE_WINDOW_MS) * RATE_WINDOW_MS
    const rows = await speicher(
      `INSERT INTO rate_limit_windows (bucket, window_start, hits)
       VALUES ($1::text, to_timestamp($2::double precision / 1000), 1)
       ON CONFLICT (bucket, window_start) DO UPDATE SET hits = rate_limit_windows.hits + 1
       RETURNING hits`,
      [await hash(key), fenster],
    )
    const hits = Number(rows[0]?.hits ?? 0)
    if (hits === 1) {
      await speicher(
        `DELETE FROM rate_limit_windows WHERE window_start < to_timestamp($1::double precision / 1000)`,
        [now - 24 * 60 * 60 * 1000],
      )
    }
    return { erlaubt: hits > 0 && hits <= limit, quelle: "datenbank" }
  } catch (error) {
    if (!tabelleFehlt(error, "rate_limit_windows")) {
      console.warn("[rate-limit] Datenbank nicht nutzbar, Arbeitsspeicher-Fenster:", error instanceof Error ? error.message : "unbekannt")
    }
    return { erlaubt: withinLimit(key, limit, now), quelle: "arbeitsspeicher" }
  }
}
