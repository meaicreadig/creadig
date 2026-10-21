import { get } from "@vercel/blob"
import sharp from "sharp"

import { pruefeBildSignatur } from "@/lib/assistent/instagram"
import { ladeFreigabe } from "@/lib/assistent/store"

/* Öffentlich, aber nur mit Signatur: Instagram lädt das Bild selbst und akzeptiert nur JPEG. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = decodeURIComponent((await params).id).slice(0, 80)
  if (!pruefeBildSignatur(id, new URL(req.url).searchParams.get("t"))) return new Response("Nicht gefunden", { status: 404 })
  const f = await ladeFreigabe(id)
  if (!f?.bildPfad) return new Response("Nicht gefunden", { status: 404 })
  const blob = await get(f.bildPfad, { access: "private" })
  if (!blob?.stream) return new Response("Nicht gefunden", { status: 404 })
  const jpeg = await sharp(Buffer.from(await new Response(blob.stream).arrayBuffer()))
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 90 })
    .toBuffer()
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" },
  })
}
