import "server-only"

import { markiereLinks } from "@/lib/ergebnis/links"
import { getVertriebStore } from "@/lib/lead-store"
import { protokolliereFaden } from "@/lib/zentrale/faden-protokoll"

import { veroeffentlicheInstagram } from "./instagram"
import { veroeffentliche } from "./linkedin"
import { assistentDb, ergaenzeExtra, ladeFreigabe, ladeLinkedin, type Freigabe } from "./store"

const ORIGIN = "https://creadig.de"
const heute = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date())

/**
 * Ein Redaktionsbeitrag geht raus: LinkedIn (Firmenseite oder Profil) mit erstem Kommentar,
 * optional Instagram. Gemeinsam für sofortige Freigabe und den geplanten Morgen-Takt.
 */
export async function postBeitrag(p: {
  f: Freigabe
  text: string
  kanal: "firma" | "inhaber" | null
  instagram: boolean
  kennung: string
  origin?: string
}): Promise<{ erfolg: boolean; fehler: string | null }> {
  const fehler: string[] = []
  let erfolg = false
  const store = getVertriebStore({ kennung: p.kennung, herkunft: p.kennung === "redaktion" ? "SYSTEM" : "HUMAN" })

  if (p.instagram) {
    try {
      const r = await veroeffentlicheInstagram({ freigabeId: p.f.id, text: p.text, origin: p.origin ?? ORIGIN })
      await ergaenzeExtra(p.f.id, { instagramId: r.medienId, instagramUrl: r.link })
      erfolg = true
      await store
        ?.recordPublication({ was: `Instagram: ${p.text.split("\n")[0].slice(0, 180)}`, kanal: "andere", veroeffentlichtAm: heute(), url: r.link })
        .catch(() => null)
    } catch (e) {
      console.error("[instagram] post", e)
      fehler.push(`Instagram: ${e instanceof Error ? e.message.slice(0, 200) : "fehlgeschlagen"}`)
    }
  }

  if (p.kanal) {
    if (!(await ladeLinkedin(p.kanal))) {
      fehler.push(
        `${p.kanal === "firma" ? "Firmenseite" : "LinkedIn"} ist nicht verbunden — nichts wurde gepostet. Bitte verbinden und erneut freigeben.`,
      )
    } else {
      try {
        /* Katman 3: Anfragen aus dem Beitrag sind über utm dem Agenten zuordenbar. */
        const herkunft = { quelle: "linkedin", medium: "social", kampagne: p.f.agent ?? "redaktion", inhalt: p.f.id }
        const postUrn = await veroeffentliche({
          text: markiereLinks(p.text, herkunft),
          bildPfad: p.f.bildPfad,
          alt: p.f.extra.alt,
          kanal: p.kanal,
          kommentar: p.f.extra.kommentar ? markiereLinks(p.f.extra.kommentar, herkunft) : p.f.extra.kommentar,
        })
        erfolg = true
        await ergaenzeExtra(p.f.id, { postUrn })
        await store
          ?.recordPublication({
            was: p.text.split("\n")[0].slice(0, 200),
            kanal: "linkedin",
            veroeffentlichtAm: heute(),
            url: postUrn.startsWith("urn:li:") ? `https://www.linkedin.com/feed/update/${postUrn}/` : null,
          })
          .catch(() => null)
        await protokolliereFaden(await assistentDb().catch(() => null), "marketing", "assistent", p.f.titel)
      } catch (e) {
        console.error("[linkedin] post", e)
        fehler.push(`LinkedIn: ${e instanceof Error ? e.message.slice(0, 200) : "Veröffentlichung fehlgeschlagen"}`)
      }
    }
  }

  if (!p.kanal && !p.instagram) fehler.push("Kein Kanal gewählt — nichts wurde gepostet.")
  return { erfolg, fehler: fehler.length ? fehler.join(" · ") : null }
}

/** Freigegebene Beiträge, deren Sendezeit erreicht ist, gehen raus (Morgen-Takt + Puls + Seitenaufruf). */
export async function veroeffentlicheGeplante(): Promise<number> {
  const q = await assistentDb()
  if (!q) return 0
  const rows = (await q(
    `SELECT id FROM assistent_freigaben
      WHERE art = 'linkedin' AND status = 'freigegeben'
        AND jsonb_typeof(extra->'wartet') = 'object'
        AND coalesce((extra->>'geplant')::timestamptz, now()) <= now()
      ORDER BY extra->>'geplant' LIMIT 5`,
    [],
  ).catch(() => [])) as { id: string }[]

  let n = 0
  for (const { id } of rows) {
    const f = await ladeFreigabe(id)
    const w = f?.extra.wartet
    if (!f || !w) continue
    /* Sofort sperren, damit zwei gleichzeitige Takte nicht doppelt posten. */
    await ergaenzeExtra(id, { wartet: null })
    const r = await postBeitrag({ f, text: w.text, kanal: w.kanal, instagram: w.instagram, kennung: "redaktion" })
    if (r.erfolg) {
      n++
      await ergaenzeExtra(id, { fehler: r.fehler ?? undefined })
    } else {
      const versuche = (w.versuche ?? 0) + 1
      await ergaenzeExtra(id, { fehler: r.fehler ?? "fehlgeschlagen", wartet: versuche < 3 ? { ...w, versuche } : null })
    }
  }
  return n
}
