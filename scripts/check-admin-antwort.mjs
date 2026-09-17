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
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

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

console.log("\n4 · Widerruf und Autorisierung am Schreibpunkt (H2/H8)")
pruefe("Middleware prueft ueber pruefeZugang (Signatur + Widerruf)", /await pruefeZugang\(request\.cookies\.get\(ADMIN_COOKIE\)\?\.value, \{ aendernd \}\)/.test(mw))
pruefe("Middleware kennt verdict `revoked`", /verdict === "revoked"/.test(mw))
pruefe("Abmelden widerruft serverseitig", /await widerrufen\(speicher, zugang\.sid/.test(route))
pruefe("Ueberall abmelden nur fuer Owner", /alle && zugang\.rolle !== "owner"/.test(route))
const actions = readFileSync("app/(admin)/admin/vertrieb/actions.ts", "utf8")
pruefe("Actions: requireStore prueft Sitzung + Rolle", /async function requireStore\(\)[\s\S]{0,300}pruefeZugang[\s\S]{0,200}darfBetreten/.test(actions))
const exportiert = [...actions.matchAll(/\nexport async function (\w+)\([^)]*\)[^{]*\{/g)]
let ohne = []
for (const m of exportiert) {
  let i = m.index + m[0].length, tiefe = 1
  while (tiefe && i < actions.length) { const c = actions[i++]; if (c === "{") tiefe++; else if (c === "}") tiefe-- }
  if (!actions.slice(m.index, i).includes("requireStore()")) ohne.push(m[1])
}
pruefe(`jede exportierte Action (${exportiert.length}) ruft requireStore`, ohne.length === 0 && exportiert.length > 0)
if (ohne.length) console.log(`     ohne: ${ohne.join(", ")}`)
const serverDateien = ["app", "lib"]
  .flatMap((d) => readdirSync(d, { recursive: true }).map((f) => join(d, String(f))))
  .filter((f) => /\.(ts|tsx)$/.test(f) && /^\s*["']use server["']/m.test(readFileSync(f, "utf8")))
pruefe(
  "jede \"use server\"-Datei ist bekannt und geprueft",
  serverDateien.length === 1 && serverDateien[0] === join("app", "(admin)", "admin", "vertrieb", "actions.ts"),
)
if (serverDateien.length !== 1) console.log(`     gefunden: ${serverDateien.join(", ")}`)

console.log("\n5 · Keine Lade-Grenze (loading.tsx) im Admin")
/*
 * Gemessen 17.09.2026 per Halbierung und A/B: `app/(admin)/admin/vertrieb/loading.tsx`
 * liess die Anzeige nach dem Speichern veralten — gespeichert war, gezeigt
 * wurde der alte Stand (je Seitenaufruf ein Speichern: 2–10 von 20 aktualisiert;
 * ohne die Datei 20 von 20). Der Fehler bestand seit dem Einbau der Datei auch
 * im produktiven Admin. Admin-Seiten rendern in 8–80 ms; eine Lade-Grenze
 * bringt dort nichts und kostet die Verlässlichkeit jeder Server Action.
 */
const ladeGrenzen = readdirSync("app/(admin)", { recursive: true }).map(String).filter((f) => /(^|\/)loading\.tsx$/.test(f))
pruefe("keine loading.tsx unter app/(admin)", ladeGrenzen.length === 0, ladeGrenzen.join(", "))

console.log(fehler ? `\n✗ ${fehler} Befund(e)\n` : "\n✓ Admin-Antwort-Gate gruen\n")
process.exit(fehler ? 1 : 0)
