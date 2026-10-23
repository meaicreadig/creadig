import { get } from "@vercel/blob"

import { ladeArtikel } from "@/lib/artikel/store"

/**
 * Titelbilder der Redaktionsartikel. Der Blob-Speicher ist privat; öffentlich
 * wird ein Bild erst mit seinem Artikel — ein Entwurf zeigt nichts.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const a = await ladeArtikel(decodeURIComponent((await params).slug).slice(0, 120)).catch(() => null)
  if (!a?.bildPfad || a.zustand !== "veroeffentlicht") return new Response("Nicht gefunden", { status: 404 })
  const blob = await get(a.bildPfad, { access: "private" })
  if (blob?.statusCode !== 200) return new Response("Nicht gefunden", { status: 404 })
  return new Response(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
