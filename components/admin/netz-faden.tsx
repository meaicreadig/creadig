"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { fadenLive, vorText } from "@/lib/zentrale/aktivitaet"
import { GEHIRN, knoten, knotenFuerPfad, nachbarn, type Sprache } from "@/lib/zentrale/netz-karte"

/**
 * Auf jeder Admin-Seite: wo diese Fläche im Netz hängt. Woher ihre Daten
 * kommen, wohin sie liefern — und immer ein Weg zurück zur Zentrale.
 */
export function NetzFaden({ sprache, owner, letzte = {} }: { sprache: Sprache; owner: boolean; letzte?: Record<string, string> }) {
  const pfad = usePathname()
  const [jetzt, setJetzt] = useState<number | null>(null)
  useEffect(() => setJetzt(Date.now()), [])
  /** „zuletzt aktiv vor X“ nur, wo das Faden-Protokoll wirklich ein Ereignis kennt. */
  const stand = (von: string, nach: string) => {
    const zeit = letzte[`${von}>${nach}`]
    if (!zeit || jetzt === null) return ""
    return ` · ${tr ? "son aktif" : "zuletzt aktiv"} ${vorText(zeit, jetzt, sprache)}`
  }
  if (pfad === "/admin") return null
  const hier = knotenFuerPfad(pfad)
  const sichtbar = (id: Parameters<typeof knoten>[0]) => owner || !knoten(id).nurOwner
  const { rein, raus } = hier ? nachbarn(hier.id) : { rein: [], raus: [] }
  const zentrale = knoten(GEHIRN)
  const tr = sprache === "tr"

  return (
    <nav
      aria-label={tr ? "Ağdaki yeri" : "Platz im Netz"}
      className="bg-card text-muted-foreground mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 rounded-full px-2 py-1.5 text-xs shadow-sm"
    >
      <Link
        href={zentrale.href}
        className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium"
      >
        <span className="zentrale-signal size-1.5 rounded-full bg-current" aria-hidden="true" />
        {zentrale.label[sprache]}
      </Link>
      {rein.filter((f) => sichtbar(f.von)).length > 0 && (
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="px-1">{tr ? "besleyen" : "bekommt von"}</span>
          {rein
            .filter((f) => sichtbar(f.von))
            .map((f) => (
              <Link key={f.von} href={knoten(f.von).href} title={`${f.was[sprache]}${stand(f.von, f.nach)}`} className="bg-background hover:text-primary rounded-full px-2.5 py-1 transition-colors">
                {knoten(f.von).label[sprache]}
                {jetzt !== null && letzte[`${f.von}>${f.nach}`] && fadenLive(letzte[`${f.von}>${f.nach}`], jetzt) && <span aria-label={tr ? "az önce aktif" : "gerade aktiv"} className="zentrale-signal ml-1.5 inline-block size-1.5 rounded-full bg-primary align-middle" />}
              </Link>
            ))}
        </span>
      )}
      {raus.filter((f) => sichtbar(f.nach)).length > 0 && (
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="px-1">{tr ? "beslediği" : "liefert an"}</span>
          {raus
            .filter((f) => sichtbar(f.nach))
            .map((f) => (
              <Link key={f.nach} href={knoten(f.nach).href} title={`${f.was[sprache]}${stand(f.von, f.nach)}`} className="bg-background hover:text-primary rounded-full px-2.5 py-1 transition-colors">
                {knoten(f.nach).label[sprache]}
                {jetzt !== null && letzte[`${f.von}>${f.nach}`] && fadenLive(letzte[`${f.von}>${f.nach}`], jetzt) && <span aria-label={tr ? "az önce aktif" : "gerade aktiv"} className="zentrale-signal ml-1.5 inline-block size-1.5 rounded-full bg-primary align-middle" />}
              </Link>
            ))}
        </span>
      )}
      {!hier && <span className="px-1">{tr ? "Merkeze bağlı" : "Mit der Zentrale verbunden"}</span>}
    </nav>
  )
}
