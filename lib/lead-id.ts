import { randomBytes, randomUUID } from "crypto"

/**
 * Lead-Identität — zwei Rollen, nie vermischen (MP-B Regel B).
 *
 *   id        = immutable intern (UUID)
 *   reference = menschlich CD-YYMMDD-XXXX (Postfach, Absender, UI)
 *
 * XXXX ist CSPRNG-Hex, kein Tageszähler: Serverless kennt keine sichere
 * Sequenz ohne gemeinsamen Speicher — und Reference ist kein Primary Key.
 */

export type LeadIdentity = {
  id: string
  reference: string
}

export function createLeadIdentity(now = new Date()): LeadIdentity {
  const y = String(now.getUTCFullYear()).slice(2)
  const m = String(now.getUTCMonth() + 1).padStart(2, "0")
  const d = String(now.getUTCDate()).padStart(2, "0")
  const suffix = randomBytes(2).toString("hex")
  return {
    id: randomUUID(),
    reference: `CD-${y}${m}${d}-${suffix}`,
  }
}
