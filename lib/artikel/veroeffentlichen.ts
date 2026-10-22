import "server-only"

import { revalidatePath } from "next/cache"
import { after } from "next/server"

import { ladeArtikel, setzeZustand } from "@/lib/artikel/store"
import { legeFreigabeAn } from "@/lib/assistent/store"
import { getVertriebStore } from "@/lib/lead-store"
import { SITE_URL } from "@/lib/routes"

/**
 * Einen Artikel-Entwurf auf creadig.de veröffentlichen — EIN Weg für Bulletin
 * und Redaktion.
 *
 * Danach weiß das Netz Bescheid: Eintrag im Register (→ Ereignis
 * `inhalt_veroeffentlicht`, lib/inhalte.ts) und genau EIN LinkedIn-Beitrag
 * zur Freigabe — aus dem Text, den der Artikel mitbringt, sonst schreibt ihn
 * die Redaktion. Nie beides: zwei Karten für denselben Artikel wären Lärm.
 */
export async function veroeffentlicheArtikel(slug: string): Promise<{ ok: boolean; linkedin: boolean }> {
  const art = await ladeArtikel(slug)
  if (!art || art.zustand !== "entwurf") return { ok: false, linkedin: false }
  await setzeZustand(slug, "veroeffentlicht")
  for (const p of ["/insights", "/tr/insights", `/insights/${slug}`, `/tr/insights/${slug}`, "/sitemap.xml"]) revalidatePath(p)

  const url = `${SITE_URL}/insights/${slug}`
  await getVertriebStore({ kennung: "owner", herkunft: "HUMAN" })
    ?.recordPublication({
      was: `Artikel: ${art.titel.de}`,
      kanal: "website",
      veroeffentlichtAm: new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" }),
      url,
    })
    .catch(() => null)

  if (art.linkedin) {
    await legeFreigabeAn({
      art: "linkedin",
      titel: art.titel.de,
      inhalt: `${art.linkedin}\n\n${url}`,
      quelle: `artikel:${slug}`,
      agent: "redaktion",
      extra: { warum: `Neuer Artikel auf creadig.de: ${art.titel.de}` },
    }).catch(() => null)
  } else {
    after(async () => {
      const { fuehreAgentAus } = await import("@/lib/assistent/truppe")
      await fuehreAgentAus("redaktion").catch((e) => console.error("[artikel] redaktion", e instanceof Error ? e.message : e))
    })
  }
  revalidatePath("/admin/assistent")
  revalidatePath("/admin/redaktion")
  return { ok: true, linkedin: Boolean(art.linkedin) }
}
