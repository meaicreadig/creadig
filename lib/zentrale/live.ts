import "server-only"

import { assistentDb, letzteLaeufe } from "@/lib/assistent/store"
import { AGENTEN } from "@/lib/assistent/truppe"
import type { LiveDaten } from "@/lib/zentrale/aktivitaet"
import { letzteFaeden } from "@/lib/zentrale/faden-protokoll"

/** Echte Anwesenheit (letzte Agentenläufe + Kadenz) und echte Verbindungsereignisse. Fehlt eine Quelle: leer, nichts erfunden. */
export async function ladeLive(): Promise<LiveDaten> {
  const [laeufe, faeden] = await Promise.all([
    letzteLaeufe().catch(() => ({}) as Awaited<ReturnType<typeof letzteLaeufe>>),
    assistentDb()
      .then((q) => letzteFaeden(q))
      .catch(() => ({}) as Record<string, string>),
  ])
  return {
    laeufe: Object.fromEntries(Object.values(laeufe).map((l) => [l.agent, { zeit: l.zeit, fehler: Boolean(l.fehler) }])),
    takte: Object.fromEntries(AGENTEN.map((a) => [a.key, a.takt])),
    faeden,
  }
}
