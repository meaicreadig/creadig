import { NextResponse } from "next/server"

/**
 * TECH-7 — das Berichtsziel der Content-Security-Policy.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE ROUTE ZUR CSP GEHOERT
 * `next.config.ts` liefert die vollstaendige Policy seit SEC-3 als
 * `Content-Security-Policy-Report-Only` aus: Sie blockiert nichts, meldet aber
 * jeden Verstoss. Nur — gemeldet wurde bisher an niemanden. Ohne `report-uri`
 * landet ein Verstoss allein in der Konsole des Besuchers, und den sieht hier
 * keiner. Die Stufe „erst beobachten, dann verschaerfen" war damit eine
 * Absichtserklaerung ohne Beobachtung.
 *
 * Jetzt laeuft jeder Verstoss hier auf und steht in den Vercel-Runtime-Logs.
 * Erst wenn die eine Weile leer bleiben, darf die Policy in `next.config.ts`
 * von Report-Only auf scharf umgestellt werden — das ist der Punkt auf der
 * Live-Checkliste.
 *
 * ---------------------------------------------------------------------------
 * ZWEI FORMATE, WEIL DIE BROWSER SICH NICHT EINIG SIND
 *   application/csp-report    das alte `report-uri` (Safari, aeltere Chrome)
 *   application/reports+json  das neue `report-to` / Reporting API
 * Beide werden akzeptiert und auf dieselbe Zeile gebracht.
 *
 * ---------------------------------------------------------------------------
 * KEIN SPEICHER, KEINE PERSONENBEZOGENEN DATEN
 * Wir legen nichts ab und schreiben nur die technischen Felder ins Log:
 * verletzte Direktive, blockierte Ressource, betroffene Seite. Keine
 * IP-Adresse, kein User-Agent, kein Cookie — ein Sicherheitswerkzeug, das
 * selbst ein Datenschutzproblem waere, ist keins.
 */

/** Was uns interessiert — mehr wird bewusst nicht ausgelesen. */
type Violation = {
  documentUri?: string
  violatedDirective?: string
  blockedUri?: string
  disposition?: string
}

function normalise(entry: unknown): Violation | null {
  if (!entry || typeof entry !== "object") return null
  const record = entry as Record<string, unknown>

  // Reporting API liefert { type, body: {...} }, report-uri liefert
  // { "csp-report": {...} } — und manche Browser den Bericht blank.
  const body = (record.body ?? record["csp-report"] ?? record) as Record<string, unknown>
  if (!body || typeof body !== "object") return null

  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const value = body[key]
      if (typeof value === "string" && value.length > 0) return value.slice(0, 300)
    }
    return undefined
  }

  const violation: Violation = {
    documentUri: pick("documentURL", "document-uri"),
    violatedDirective: pick("effectiveDirective", "violated-directive", "effective-directive"),
    blockedUri: pick("blockedURL", "blocked-uri"),
    disposition: pick("disposition"),
  }

  return violation.violatedDirective || violation.blockedUri ? violation : null
}

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    // Ein kaputter Bericht ist kein Grund fuer eine Fehlermeldung an den
    // Browser — er wuerde es sonst erneut versuchen.
    return new NextResponse(null, { status: 204 })
  }

  const entries = Array.isArray(payload) ? payload : [payload]
  for (const entry of entries) {
    const violation = normalise(entry)
    if (!violation) continue
    console.warn(
      `[csp] ${violation.violatedDirective ?? "?"} blockierte ${violation.blockedUri ?? "?"} auf ${violation.documentUri ?? "?"}` +
        (violation.disposition ? ` (${violation.disposition})` : ""),
    )
  }

  // 204: Der Browser erwartet keine Antwort und soll nichts wiederholen.
  return new NextResponse(null, { status: 204 })
}
