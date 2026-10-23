import "server-only"

import { createHash } from "node:crypto"

/**
 * Briefversand über LetterXpress (Druck, Kuvertierung, Deutsche Post).
 * API v3: https://www.letterxpress.de/storage/files/lxp-api_dokumentation.pdf
 *
 * Env: LETTERXPRESS_USER, LETTERXPRESS_API_KEY; LETTERXPRESS_MODE=test lässt
 * Aufträge nur im Kundenkonto ablegen (nicht drucken) — zum Ausprobieren.
 * Ohne Zugang meldet der Versand das ehrlich, statt still zu scheitern.
 *
 * NIE OHNE EMIN (Owner, 24.10.2026: „ohne meine Freigabe darf nichts
 * rausgehen"): Einziger Aufrufer ist der Freigabe-Knopf in
 * app/(admin)/admin/assistent/actions.ts. Kein Agent, Cron oder Puls ruft
 * diese Funktion; `freigabe` muss die Rolle tragen, die geklickt hat.
 */

const BASIS = "https://api.letterxpress.de/v3"

export const briefBereit = () => Boolean(process.env.LETTERXPRESS_USER && process.env.LETTERXPRESS_API_KEY)
export const briefTestmodus = () => process.env.LETTERXPRESS_MODE === "test"

const auth = () => ({
  username: process.env.LETTERXPRESS_USER!,
  apikey: process.env.LETTERXPRESS_API_KEY!,
  mode: briefTestmodus() ? "test" : "live",
})

export type BriefErgebnis = { ok: true; id: string; preisEur: number | null; test: boolean } | { ok: false; grund: string }

export async function sendeBrief(
  pdf: Uint8Array,
  o: { dateiname: string; ausland?: boolean; freigabe: { id: string; durch: string } },
): Promise<BriefErgebnis> {
  if (!o.freigabe?.id || !o.freigabe.durch) return { ok: false, grund: "Ohne Freigabe durch Emin geht kein Brief raus." }
  if (!briefBereit()) return { ok: false, grund: "Briefversand nicht eingerichtet (LETTERXPRESS_USER und LETTERXPRESS_API_KEY in Vercel fehlen)." }
  const base64 = Buffer.from(pdf).toString("base64")
  try {
    const res = await fetch(`${BASIS}/printjobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        auth: auth(),
        letter: {
          base64_file: base64,
          base64_file_checksum: createHash("md5").update(base64).digest("hex"),
          specification: { color: "1", mode: "simplex", shipping: o.ausland ? "international" : "national" },
          filename_original: o.dateiname.slice(0, 120),
        },
      }),
      signal: AbortSignal.timeout(30_000),
    })
    const j = (await res.json().catch(() => null)) as { status?: number; message?: string; data?: { id?: number; items?: { amount?: number; vat?: number }[] } } | null
    if (!res.ok || !j?.data?.id) return { ok: false, grund: `LetterXpress ${res.status}: ${j?.message ?? "ohne Antwort"}` }
    const preis = (j.data.items ?? []).reduce((s, i) => s + (i.amount ?? 0) + (i.vat ?? 0), 0)
    return { ok: true, id: String(j.data.id), preisEur: preis ? Math.round(preis * 100) / 100 : null, test: briefTestmodus() }
  } catch (e) {
    return { ok: false, grund: `LetterXpress nicht erreichbar: ${e instanceof Error ? e.message : e}` }
  }
}
