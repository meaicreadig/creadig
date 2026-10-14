import "server-only"
import { headers } from "next/headers"

/** Auf finanz.creadig.de liegt alles an der Wurzel, sonst unter /finanz. */
export async function finanzBasis(): Promise<string> {
  const host = (await headers()).get("host") ?? ""
  return host.startsWith("finanz.") ? "" : "/finanz"
}
