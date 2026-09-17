/**
 * ADM-02 · A23 — der Geschäftstag liegt in Berlin, nicht in UTC.
 *
 * ---------------------------------------------------------------------------
 * WAS FALSCH WAR (17.09.2026)
 * „Heute" entstand an zwölf Stellen als `new Date().toISOString().slice(0, 10)`
 * und in SQL als `current_date` — beides UTC (Vercel und Neon laufen in UTC).
 * Zwischen Mitternacht und 01:00 (Winter) bzw. 02:00 (Sommer) Berliner Zeit
 * war „heute" damit GESTERN: Ein Schritt, der heute fällig ist, erschien noch
 * nicht als fällig; einer von gestern noch nicht als überfällig. Die
 * Datumsanzeige (`toLocaleDateString` ohne Zone) folgte der Serverzone.
 *
 * ---------------------------------------------------------------------------
 * DIE REGEL
 * Geschäftszeitzone ist `Europe/Berlin`. Die Sprache der Oberfläche ändert
 * sie nicht. Ein Zeitpunkt wird zum Geschäftstag über diese Zone; ein
 * reines Datum (`YYYY-MM-DD`) ist bereits ein Geschäftstag und wird nie
 * verschoben.
 */

export const GESCHAEFTS_ZEITZONE = "Europe/Berlin"

/** SQL-Ausdruck für den heutigen Geschäftstag — statt `current_date`. */
export const SQL_HEUTE = `(now() AT TIME ZONE '${GESCHAEFTS_ZEITZONE}')::date`

const TAG = new Intl.DateTimeFormat("en-CA", {
  timeZone: GESCHAEFTS_ZEITZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

const NUR_DATUM = /^\d{4}-\d{2}-\d{2}$/

/** Der Geschäftstag eines Zeitpunkts als `YYYY-MM-DD`. */
export function geschaeftsTag(zeitpunkt: Date | string | number = new Date()): string {
  if (typeof zeitpunkt === "string" && NUR_DATUM.test(zeitpunkt)) return zeitpunkt
  const d = zeitpunkt instanceof Date ? zeitpunkt : new Date(zeitpunkt)
  if (Number.isNaN(d.getTime())) return ""
  return TAG.format(d)
}

/** Wochentag eines Geschäftstags (`YYYY-MM-DD`), 0 = Sonntag. Zonenfrei. */
export function wochentag(tag: string): number {
  return new Date(`${tag}T12:00:00Z`).getUTCDay()
}

/** Geschäftstag + n Kalendertage. Zonenfrei. */
export function plusTage(tag: string, n: number): string {
  const d = new Date(`${tag}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export type Datumsstil = "kurz" | "lang"

/**
 * Anzeige eines Datums oder Zeitpunkts in der Geschäftszone.
 *
 * Ein reines Datum wird als Mittag UTC gelesen — so kann keine Zone es auf
 * den Vortag oder Folgetag schieben.
 */
export function datumAnzeige(wert: string | Date | null | undefined, sprache = "de-DE", stil: Datumsstil = "kurz"): string {
  if (wert === null || wert === undefined || wert === "") return ""
  const d =
    typeof wert === "string" && NUR_DATUM.test(wert)
      ? new Date(`${wert}T12:00:00Z`)
      : wert instanceof Date
        ? wert
        : new Date(wert)
  if (Number.isNaN(d.getTime())) return typeof wert === "string" ? wert : ""
  return d.toLocaleDateString(sprache, {
    timeZone: GESCHAEFTS_ZEITZONE,
    day: "2-digit",
    month: "2-digit",
    year: stil === "kurz" ? "2-digit" : "numeric",
  })
}
