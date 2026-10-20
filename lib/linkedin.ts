import { createDecipheriv, createHash } from "node:crypto"

import { neonAbfrage, tabelleFehlt } from "@/lib/neon-abfrage"
import { linkedinBereit, veroeffentliche } from "@/lib/assistent/linkedin"
import { ladeLinkedin, speichereLinkedin, trenneLinkedin } from "@/lib/assistent/store"

/**
 * LinkedIn — EINE Verbindung, EINE Post-Funktion.
 *
 * Früher gab es zwei getrennte Verbindungen: diese Datei (Tabelle
 * `linkedin_connection`, Werkstatt unter /admin/marketing) und
 * `lib/assistent/linkedin.ts` (Tabelle `assistent_linkedin`, Redaktions-Agent).
 * Der einzige Rückruf (`/api/linkedin/callback`) schrieb nur in die zweite —
 * die Werkstatt zeigte deshalb „nicht verbunden", obwohl der Agent posten konnte.
 *
 * Seitdem ist `assistent_linkedin` (Kanal `inhaber`) die einzige Quelle; diese
 * Datei ist die schmale Sicht der Werkstatt darauf. `linkedin_connection` wird
 * nicht mehr beschrieben und nicht gelöscht; eine dort noch gültige Verbindung
 * wird einmalig übernommen (`uebernehmeAlteVerbindung`).
 */

export type LinkedinStatus =
  | { verbunden: false; konfiguriert: boolean }
  | { verbunden: true; konfiguriert: true; name: string; laeuftAb: string | null }

/** Einmalig: eine noch gültige Verbindung aus der alten Tabelle in `assistent_linkedin` übernehmen. */
async function uebernehmeAlteVerbindung(): Promise<void> {
  const q = neonAbfrage()
  const geheim = process.env.ADMIN_SESSION_SECRET?.trim()
  if (!q || !geheim) return
  try {
    const [z] = await q(`SELECT person_urn, name, token_enc, expires_at FROM linkedin_connection WHERE id = 1`, [])
    if (!z || !z.expires_at) return
    const rest = Math.floor((new Date(String(z.expires_at)).getTime() - Date.now()) / 1000)
    if (rest <= 0) return
    const [iv, tag, daten] = String(z.token_enc).split(".").map((t) => Buffer.from(t, "base64url"))
    if (!iv || !tag || !daten) return
    const d = createDecipheriv("aes-256-gcm", createHash("sha256").update(`linkedin:${geheim}`).digest(), iv)
    d.setAuthTag(tag)
    const token = Buffer.concat([d.update(daten), d.final()]).toString("utf8")
    await speichereLinkedin({ kanal: "inhaber", accessToken: token, personUrn: String(z.person_urn), name: z.name ? String(z.name) : null, gueltigSek: rest })
  } catch (error) {
    if (!tabelleFehlt(error, "linkedin_connection")) console.error("[linkedin] Übernahme der alten Verbindung", error instanceof Error ? error.message : error)
  }
}

export async function linkedinStatus(): Promise<LinkedinStatus> {
  const konfiguriert = linkedinBereit("inhaber")
  if (!konfiguriert) return { verbunden: false, konfiguriert }
  let v = await ladeLinkedin("inhaber").catch(() => null)
  if (!v) {
    await uebernehmeAlteVerbindung()
    v = await ladeLinkedin("inhaber").catch(() => null)
  }
  if (!v) return { verbunden: false, konfiguriert }
  return { verbunden: true, konfiguriert: true, name: v.name ?? "LinkedIn", laeuftAb: v.ablauf }
}

export async function verbindungTrennen(): Promise<void> {
  await trenneLinkedin("inhaber")
  /* Auch den alten Token entfernen — sonst würde ihn die einmalige Übernahme beim nächsten Status wieder einsetzen. */
  const q = neonAbfrage()
  if (q) {
    await q(`DELETE FROM linkedin_connection WHERE id = 1`, []).catch((error) => {
      if (!tabelleFehlt(error, "linkedin_connection")) throw error
    })
  }
}

export type VeroeffentlichungsErgebnis = { ok: true; url: string | null } | { ok: false; grund: "nicht-verbunden" | "abgelehnt" }

/** Die Werkstatt postet als Person (Kanal `inhaber`) über dieselbe Funktion wie der Redaktions-Agent. */
export async function aufLinkedinVeroeffentlichen(text: string): Promise<VeroeffentlichungsErgebnis> {
  if (!(await ladeLinkedin("inhaber").catch(() => null))) return { ok: false, grund: "nicht-verbunden" }
  try {
    const urn = await veroeffentliche({ text, bildPfad: null, kanal: "inhaber" })
    return { ok: true, url: urn.startsWith("urn:li:") ? `https://www.linkedin.com/feed/update/${urn}/` : null }
  } catch (error) {
    const meldung = error instanceof Error ? error.message : ""
    console.error("LinkedIn-Veroeffentlichung abgelehnt", meldung.slice(0, 300))
    return { ok: false, grund: /\b401\b/.test(meldung) ? "nicht-verbunden" : "abgelehnt" }
  }
}
