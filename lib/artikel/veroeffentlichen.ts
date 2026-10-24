import "server-only"

import { revalidatePath } from "next/cache"
import { after } from "next/server"

import { ergaenzeBild } from "@/lib/artikel/agent"
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
  const roh = await ladeArtikel(slug)
  if (!roh || roh.zustand !== "entwurf") return { ok: false, linkedin: false }
  /* Kein Artikel ohne Titelbild nach draußen — und der LinkedIn-Beitrag nimmt dasselbe mit. */
  if (!roh.bildPfad) await ergaenzeBild(roh).catch((e) => console.error("[artikel] bild", e instanceof Error ? e.message : e))
  const art = (await ladeArtikel(slug)) ?? roh
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

  if (art.bulletinRef?.startsWith("li:")) {
    /* Aus einem LinkedIn-Beitrag entstanden – der Beitrag ist schon draußen, kein zweiter. */
  } else if (art.linkedin) {
    await legeFreigabeAn({
      art: "linkedin",
      titel: art.titel.de,
      inhalt: `${art.linkedin}\n\n${url}`,
      quelle: `artikel:${slug}`,
      agent: "redaktion",
      bildPfad: art.bildPfad,
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
