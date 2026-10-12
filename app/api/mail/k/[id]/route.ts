import { geklickt } from "@/lib/mailing/store"
import { siteUrl } from "@/lib/termine/mail"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ziel = await geklickt(id).catch(() => null)
  const sicher = ziel && /^https:\/\//.test(ziel) ? ziel : siteUrl()
  return Response.redirect(sicher, 302)
}
