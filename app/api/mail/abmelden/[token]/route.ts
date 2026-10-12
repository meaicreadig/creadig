import { abmeldenPerToken } from "@/lib/mailing/store"

/** RFC 8058 Ein-Klick-Abmeldung (Gmail/Apple „Abmelden“-Knopf). */
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  await abmeldenPerToken(token).catch(() => false)
  return new Response(null, { status: 200 })
}
