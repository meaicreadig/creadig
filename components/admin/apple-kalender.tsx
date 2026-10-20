import { CalendarCheck2, CalendarSync } from "lucide-react"

import { AdminInput, Surface } from "@/components/admin/primitives"
import { appleKalenderSpeichern } from "@/app/(admin)/admin/termine/apple-actions"
import type { AppleTermin } from "@/lib/termine/apple"

export function AppleKalender({
  feedUrl,
  quelle,
  termine,
}: {
  feedUrl: string | null
  quelle: string | null
  termine: AppleTermin[]
}) {
  const fmt = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
  const tag = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", weekday: "short", day: "2-digit", month: "2-digit" })
  const woche = termine.filter((t) => t.start < Date.now() + 7 * 86_400_000).slice(0, 8)

  return (
    <Surface>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-sans text-lg font-semibold">Apple Kalender</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            In beide Richtungen: Buchungen erscheinen in Apple, und deine Apple-Termine sperren automatisch die Buchungszeiten.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl bg-muted p-5">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="size-5 text-primary" aria-hidden />
              <span className="text-sm font-medium">creaDIG → Apple</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Einmal auf iPhone oder Mac antippen. Neue Buchungen erscheinen danach von selbst.
            </p>
            {feedUrl ? (
              <a href={feedUrl} className="self-start rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                In Apple Kalender abonnieren
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">Feed nicht verfügbar.</p>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-muted p-5">
            <div className="flex items-center gap-2">
              <CalendarSync className="size-5 text-primary" aria-hidden />
              <span className="text-sm font-medium">Apple → creaDIG</span>
              {quelle && <span className="ms-auto text-xs font-medium text-primary">verbunden</span>}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              In Apple Kalender: Kalender teilen → „Öffentlicher Kalender“ an → Link kopieren und hier einfügen.
            </p>
            <form action={appleKalenderSpeichern} className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="ics_url" className="sr-only">iCloud-Kalenderlink</label>
              <AdminInput id="ics_url" name="ics_url" type="url" inputMode="url" defaultValue={quelle ?? ""} placeholder="webcal://p…-caldav.icloud.com/published/…" />
              <button type="submit" className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                {quelle ? "Aktualisieren" : "Verbinden"}
              </button>
            </form>
          </div>
        </div>

        {quelle && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Aus Apple · nächste 7 Tage (gesperrt für Buchungen)</span>
            {woche.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Termine — alle Buchungszeiten frei.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {woche.map((t) => (
                  <li key={`${t.start}-${t.titel}`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm odd:bg-muted">
                    <span className="truncate">{t.titel}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {t.ganztags ? `${tag.format(t.start)} · ganztags` : fmt.format(t.start)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Surface>
  )
}
