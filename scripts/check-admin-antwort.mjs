#!/usr/bin/env node
/**
 * ADM-02 · H4 · ADMIN-ANTWORT-GATE
 *
 * Gemessen am 16.09.2026 gegen `next start`: Admin-Antworten hatten kein
 * `X-Robots-Tag`, die Anmelde-Route kein `no-store`, und
 * `POST /api/admin/session` nahm eine Anmeldung mit fremdem `Origin` an (200).
 *
 * Die Messung ist der Beweis (`docs/admin-os/state.md` §H4). Dieses Gate
 * haelt fest, dass die Stellen, die ihn tragen, nicht still verschwinden.
 * Aufruf: `node --import ./scripts/lib/alias-hook.mjs scripts/check-admin-antwort.mjs`
 */
import { readFileSync } from "node:fs"

import { ADMIN_RESPONSE_HEADERS, sameOrigin } from "@/lib/admin-session"

let fehler = 0
const pruefe = (name, ok) => {
  console.log(`  ${ok ? "✓" : "✗"} ${name}`)
  if (!ok) fehler++
}

console.log("\n1 · Header-Definition")
pruefe("X-Robots-Tag noindex", /noindex/.test(ADMIN_RESPONSE_HEADERS["X-Robots-Tag"] ?? ""))
pruefe("Cache-Control no-store", /no-store/.test(ADMIN_RESPONSE_HEADERS["Cache-Control"] ?? ""))

console.log("\n2 · Ursprung")
const req = (headers, url = "https://creadig.de/api/admin/session") => new Request(url, { method: "POST", headers })
pruefe("eigener Ursprung erlaubt", sameOrigin(req({ origin: "https://creadig.de", host: "creadig.de" })))
pruefe("hinter Proxy (x-forwarded-host) erlaubt", sameOrigin(req({ origin: "https://www.creadig.de", "x-forwarded-host": "www.creadig.de" }, "http://intern:3000/api/admin/session")))
pruefe("fremder Ursprung abgelehnt", !sameOrigin(req({ origin: "https://evil.example", host: "creadig.de" })))
pruefe("fehlender Ursprung abgelehnt", !sameOrigin(req({ host: "creadig.de" })))
pruefe("kaputter Ursprung abgelehnt", !sameOrigin(req({ origin: "null", host: "creadig.de" })))
pruefe("Subdomain-Trick abgelehnt", !sameOrigin(req({ origin: "https://creadig.de.evil.example", host: "creadig.de" })))

console.log("\n3 · Verdrahtung")
const mw = readFileSync("middleware.ts", "utf8")
pruefe("Middleware umhuellt jede Admin-Antwort", /return withAdminHeaders\(await adminZugang\(request, pathname\)\)/.test(mw))
const route = readFileSync("app/api/admin/session/route.ts", "utf8")
pruefe("POST prueft Ursprung", /export async function POST[\s\S]{0,200}sameOrigin\(request\)/.test(route))
pruefe("DELETE prueft Ursprung", /export async function DELETE[\s\S]{0,120}sameOrigin\(request\)/.test(route))
pruefe("Route-Antworten tragen Admin-Header", (route.match(/withAdminHeaders\(/g) ?? []).length >= 4)

console.log(fehler ? `\n✗ ${fehler} Befund(e)\n` : "\n✓ Admin-Antwort-Gate gruen\n")
process.exit(fehler ? 1 : 0)
