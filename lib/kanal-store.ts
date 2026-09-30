import { neonAbfrage } from "@/lib/neon-abfrage"

/** `undefined` = Spalte fehlt oder Abfrage scheiterte; `null` = noch nicht eingeordnet. */
export async function ladeKanal(leadId: string): Promise<string | null | undefined> {
  const q = neonAbfrage()
  if (!q) return undefined
  try {
    const rows = await q(`SELECT channel FROM leads WHERE id = $1`, [leadId])
    const wert = rows[0]?.channel
    return typeof wert === "string" && wert !== "" ? wert : null
  } catch {
    return undefined
  }
}
