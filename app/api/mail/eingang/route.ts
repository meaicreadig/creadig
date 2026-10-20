import { createHmac, timingSafeEqual } from "node:crypto"
import { after, NextResponse, type NextRequest } from "next/server"

import { verarbeiteEingang } from "@/lib/eingang"

export const runtime = "nodejs"

/** Prüft die Svix-Signatur von Resend (Rohtext, max. 5 Min. alt). */
function signaturGueltig(body: string, id: string | null, ts: string | null, sig: string | null, secret: string): boolean {
  if (!id || !ts || !sig) return false
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false
  const schluessel = Buffer.from(secret.replace(/^whsec_/, ""), "base64")
  const erwartet = createHmac("sha256", schluessel).update(`${id}.${ts}.${body}`).digest()
  return sig.split(" ").some((teil) => {
    const wert = Buffer.from(teil.split(",")[1] ?? "", "base64")
    return wert.length === erwartet.length && timingSafeEqual(wert, erwartet)
  })
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim()
  if (!secret) return NextResponse.json({ ok: false }, { status: 503 })
  const body = await request.text()
  const h = request.headers
  if (!signaturGueltig(body, h.get("svix-id"), h.get("svix-timestamp"), h.get("svix-signature"), secret)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const event = JSON.parse(body) as { type?: string; data?: { email_id?: string } }
  const emailId = event.data?.email_id
  if (event.type === "email.received" && emailId) {
    after(() => verarbeiteEingang(emailId).catch(() => undefined))
  }
  return NextResponse.json({ ok: true })
}
