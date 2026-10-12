import { geoeffnet } from "@/lib/mailing/store"

const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64")

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await geoeffnet(id).catch(() => undefined)
  return new Response(GIF, {
    headers: { "Content-Type": "image/gif", "Cache-Control": "no-store, max-age=0" },
  })
}
