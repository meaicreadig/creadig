import Link from "next/link"

import { SectionHeader } from "@/components/admin/primitives"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { getVertriebStore } from "@/lib/lead-store"

/**
 * „VOM SYSTEM ERLEDIGT" — W6 · A4.
 *
 * Die Uebersicht sagte, was zu tun ist, aber nie, was ohne Zutun geschah.
 * Genau das ist der Beleg, dass die Automationen arbeiten: gezaehlt je
 * Ausloeser, letzte sieben Tage, aus `automation_runs`.
 *
 * Zustaende, und keiner wird als ein anderer ausgegeben:
 *   NOT_CONFIGURED  keine Datenbank          → eigener Satz
 *   UNAVAILABLE     Protokoll nicht lesbar   → eigener Satz, nie „0"
 *   EMPTY           gelesen, nichts gelaufen → eigener Satz
 *   Liste           je Ausloeser die Zahl
 * LOADING entfaellt: Die Seite rendert auf dem Server, sie hat keinen
 * Zwischenzustand, den jemand sieht.
 */
const TAGE = 7

export async function SystemErledigt() {
  const { t } = await adminSprachKontext()
  const u = t.uebersicht
  const namen = t.automationen.ausloeser as Record<string, { name: string } | undefined>
  const store = getVertriebStore()

  let inhalt: React.ReactNode
  if (!store) {
    inhalt = <p className="type-small text-muted-foreground mt-4">{u.erledigtNichtEingerichtet}</p>
  } else {
    const laeufe = await store.listAutomationRuns({ limit: 500 })
    if (laeufe === null) {
      inhalt = <p className="type-small text-muted-foreground mt-4">{u.erledigtNichtLesbar}</p>
    } else {
      const seit = Date.now() - TAGE * 24 * 60 * 60 * 1000
      const frisch = laeufe.filter((l) => Date.parse(l.createdAt) >= seit)
      if (frisch.length === 0) {
        inhalt = <p className="type-small text-muted-foreground mt-4">{u.erledigtLeer}</p>
      } else {
        const je = new Map<string, { gesamt: number; offen: number }>()
        for (const l of frisch) {
          const z = je.get(l.ausloeser) ?? { gesamt: 0, offen: 0 }
          z.gesamt += 1
          if (l.zustand === "offen") z.offen += 1
          je.set(l.ausloeser, z)
        }
        inhalt = (
          <ul className="mt-4 flex flex-col gap-2">
            {[...je.entries()]
              .sort((a, b) => b[1].gesamt - a[1].gesamt)
              .map(([ausloeser, z]) => (
                <li key={ausloeser} className="type-small flex items-baseline justify-between gap-4">
                  <span>{namen[ausloeser]?.name ?? ausloeser}</span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {z.gesamt}
                    {z.offen > 0 ? ` · ${u.erledigtOffen(z.offen)}` : ""}
                  </span>
                </li>
              ))}
          </ul>
        )
      }
    }
  }

  return (
    <section aria-labelledby="erledigt-titel">
      <SectionHeader id="erledigt-titel" title={u.erledigtTitel} />
      {inhalt}
      <Link href="/admin/automationen" className="text-gold-text mt-3 inline-block text-sm underline underline-offset-4">
        {u.erledigtAlle}
      </Link>
    </section>
  )
}
