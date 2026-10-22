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
/*
 * ADM-04 — DIE LISTE DER SCHREIBPUNKTE, NICHT IHRE ZAHL.
 *
 * Bis hierher stand hier „genau eine `use server`-Datei". Das war die
 * richtige Absicht in der falschen Form: Sie verbot nicht das UNGEPRUEFTE
 * Modul, sondern das ZWEITE — und ein Programm, das eine zweite Flaeche mit
 * Handlungen baut, haette diesen Waechter gelockert statt erfuellt.
 *
 * Jetzt steht hier ein Register: Jede `use server`-Datei muss darin stehen
 * UND ihren Waechter in JEDER exportierten Funktion aufrufen. Eine neue
 * Datei faellt weiterhin auf; sie faellt nur nicht mehr auf, WEIL sie neu
 * ist, sondern weil niemand gesagt hat, wer sie bewacht.
 *
 * ADM-04b (22.10.2026) — Das Register stand bei 6 von 34 Dateien; das Gate
 * war rot und sagte damit nichts mehr. Jetzt steht jede Datei darin, in
 * einem von drei Registern (Admin-Flaeche, Finanz, oeffentlicher Token), und
 * der Waechter muss nicht nur vorkommen, sondern als ERSTES `await` stehen.
 */
const A = (...teile) => join("app", "(admin)", "admin", ...teile)
const F = (...teile) => join("app", "(finanz)", "finanz", ...teile)
const SCHREIBPUNKTE = new Map([
  [A("vertrieb", "actions.ts"), "requireStore"],
  [A("vertrieb", "kanal-actions.ts"), "berechtigt"],
  [A("verbindungen", "actions.ts"), "requireOwner"],
  [A("beleg", "actions.ts"), "requireOwnerStore"],
  [A("automationen", "actions.ts"), "requireOwnerStore"],
  [A("veroeffentlichungen", "actions.ts"), "requireOwnerStore"],
  [A("redaktion", "actions.ts"), "nurInhaber"],
  [A("bulletin", "actions.ts"), "nurInhaber"],
  [A("investoren", "actions.ts"), "nurInhaber"],
  [A("forschung", "actions.ts"), "nurInhaber"],
  [A("leistung", "actions.ts"), "nurInhaber"],
  [A("webseite", "actions.ts"), "nurInhaber"],
  [A("assistent", "actions.ts"), "pruefe"],
  [A("gespraech", "actions.ts"), "rolle"],
  [A("termine", "actions.ts"), "rolle"],
  [A("termine", "apple-actions.ts"), "berechtigt"],
  [A("termine", "ki-actions.ts"), "berechtigt"],
  [A("nachfass-actions.ts"), "rolle"],
  [A("kunden", "actions.ts"), "zugang"],
  [A("messen", "actions.ts"), "zugang"],
  [A("marketing", "actions.ts"), "zugang"],
  [A("marketing", "mail", "actions.ts"), "darf"],
  [A("verkaufen", "actions.ts"), "berechtigt"],
])

/*
 * Die Finanz-Anwendung (`/finanz`, finanz.creadig.de) hat keine eigene
 * Sitzung: Sie traegt dieselbe Admin-Sitzung, und `finanzZugang()` in der
 * Middleware laesst nur `owner` durch. Eine Server Action ist aber unter
 * JEDER Adresse aufrufbar, die Middleware also keine Sicherung — deshalb
 * prueft jede Finanz-Datei Sitzung, Widerruf und Inhaber selbst, bevor sie
 * den Speicher holt. Eigenes Register, weil die Regel eine andere ist:
 * nicht „darf diese Flaeche", sondern „ist der Inhaber".
 */
const FINANZPUNKTE = new Map([
  [F("actions.ts"), "zugang"],
  [F("abos", "actions.ts"), "zugang"],
  [F("auftraege", "actions.ts"), "zugang"],
  [F("belege", "actions.ts"), "zugang"],
  [F("bescheide", "actions.ts"), "zugang"],
  [F("investment", "actions.ts"), "zugang"],
  [F("pauschalen", "actions.ts"), "zugang"],
  [F("ziele", "actions.ts"), "zugang"],
])

/*
 * Oeffentliche Schreibpunkte: Hier gibt es keine Sitzung, die Berechtigung
 * IST der Link. Das Register sagt je Datei, welcher Aufruf den Token prueft,
 * und haelt fest, dass er in jeder Action vor der ersten Wirkung steht — und
 * dass die pruefende Funktion selbst den Token wirklich gegen den Speicher
 * haelt, statt ihn nur weiterzureichen.
 */
const TOKENPUNKTE = new Map([
  [
    join("app", "(de)", "termin", "buchen", "[token]", "actions.ts"),
    {
      pruefung: "bucheTermin(",
      wirkungen: ["sendeMail("],
      quelle: join("lib", "termine", "store.ts"),
      beweis: /export async function bucheTermin\([\s\S]{0,400}await pruefeBuchungslink\(e\.token\)\s*if \(!pruefung\.ok\) return/,
    },
  ],
  [
    join("app", "(finanz)", "dokument", "[token]", "actions.ts"),
    {
      pruefung: "ladeDokumentPerToken(",
      wirkungen: ["pruefeRateLimit(", "beantworteAngebot(", "sendeDokumentMail(", "meldeInhaber("],
      quelle: join("lib", "finanz", "auftraege", "store.ts"),
      beweis: /export async function ladeDokumentPerToken\([^)]*\)[^{]*\{\s*if \(!\/\^\[A-Za-z0-9_-\]\{24,64\}\$\/\.test\(token\)\) return null[\s\S]{0,200}WHERE token = \$1/,
    },
  ],
  [
    join("app", "mail", "abmelden", "[token]", "page.tsx"),
    {
      pruefung: "abmeldenPerToken(",
      wirkungen: ["revalidatePath("],
      quelle: join("lib", "mailing", "store.ts"),
      beweis: /export async function abmeldenPerToken\([^)]*\)[^{]*\{\s*if \(!\/\^\[\\w-\]\{10,60\}\$\/\.test\(token\)\) return false[\s\S]{0,200}WHERE token=\$1/,
    },
  ],
])

/* Den Rumpf einer Funktion ab ihrer oeffnenden Klammer lesen. */
function rumpf(quelle, ab) {
  let i = ab
  let tiefe = 1
  while (tiefe && i < quelle.length) {
    const c = quelle[i++]
    if (c === "{") tiefe++
    else if (c === "}") tiefe--
  }
  return quelle.slice(ab, i)
}

/*
 * Die Actions einer Datei: in einer `use server`-Datei jede exportierte
 * async-Funktion, sonst jede Funktion, die die Direktive selbst traegt.
 *
 * Der Rumpf beginnt an der Klammer am ZEILENENDE der Signatur — nicht an der
 * ersten: `Promise<{ ok: boolean }>` traegt selbst eine, und wer dort zu
 * zaehlen beginnt, prueft den Rueckgabetyp statt der Action. Und keine
 * Action darf dem Muster entgehen: Was nicht gelesen wird, kann auch nicht
 * durchfallen — deshalb muss die Zahl der Treffer die Zahl der Exporte sein.
 */
function aktionen(quelle) {
  const oben = /^\s*["']use server["']/.test(quelle)
  const muster = oben
    ? /\nexport async function (\w+)\([^)]*\)[^\n]*\{\n/g
    : /async function (\w+)\([^)]*\)[^\n{]*\{\s*["']use server["']/g
  const treffer = [...quelle.matchAll(muster)].map((m) => ({ name: m[1], text: rumpf(quelle, m.index + m[0].length) }))
  const erwartet = oben
    ? (quelle.match(/\nexport async function /g) ?? []).length
    : (quelle.match(/^\s+["']use server["']/gm) ?? []).length
  return treffer.length === erwartet ? treffer : [...treffer, { name: "(Signatur nicht gelesen)", text: "" }]
}

/*
 * Der Waechter muss nicht nur VORKOMMEN, er muss ZUERST kommen: Das erste
 * `await` einer Action ist sein Aufruf. Vorher darf nur gerechnet werden
 * (Formular lesen, Eingaben pruefen) — kein Speicher, kein Netz, keine Mail.
 */
function waechterZuerst(text, name) {
  const i = text.search(/\bawait\b/)
  return i >= 0 && new RegExp(`^await\\s+(?:\\(\\s*await\\s+)?${name}\\(`).test(text.slice(i))
}

function pruefeRegister(register, rolle, beweis) {
  for (const [datei, name] of register) {
    const quelle = readFileSync(datei, "utf8")
    pruefe(`${datei}: \`${name}\` prueft Sitzung + ${rolle}`, beweis(name).test(quelle))
    const alle = aktionen(quelle)
    const ohne = alle.filter((a) => !waechterZuerst(a.text, name)).map((a) => a.name)
    pruefe(
      `${datei}: jede exportierte Action (${alle.length}) ruft zuerst ${name}()`,
      ohne.length === 0 && alle.length > 0,
      ohne.join(", "),
    )
  }
}

pruefeRegister(
  SCHREIBPUNKTE,
  "Rolle",
  /* `rolle !== "owner"` ist strenger als jede Flaeche: Wer nur den Inhaber durchlaesst, braucht `darfBetreten` nicht. */
  (name) =>
    new RegExp(
      `async function ${name}\\([^)]*\\)[^{]*\\{[\\s\\S]{0,400}pruefeZugang\\([\\s\\S]{0,300}(?:darfBetreten\\(|rolle !== "owner")`,
    ),
)

pruefeRegister(
  FINANZPUNKTE,
  "Inhaber (Finanz)",
  (name) =>
    new RegExp(
      `async function ${name}\\(\\)[^{]*\\{\\s*const z = await pruefeZugang\\(\\(await cookies\\(\\)\\)\\.get\\(ADMIN_COOKIE\\)\\?\\.value, \\{ aendernd: true \\}\\)\\s*` +
        `if \\(z\\.verdict !== "ok" \\|\\| (?:!z\\.rolle \\|\\| )?z\\.rolle !== "owner"\\) throw new Error`,
    ),
)

for (const [datei, { pruefung, wirkungen, quelle: speicher, beweis }] of TOKENPUNKTE) {
  const quelle = readFileSync(datei, "utf8")
  pruefe(`${datei}: \`${pruefung.slice(0, -1)}\` haelt den Token gegen den Speicher`, beweis.test(readFileSync(speicher, "utf8")))
  const alle = aktionen(quelle)
  const ohne = alle
    .filter((a) => {
      const p = a.text.indexOf(pruefung)
      return p < 0 || wirkungen.some((w) => a.text.includes(w) && a.text.indexOf(w) < p)
    })
    .map((a) => a.name)
  pruefe(
    `${datei}: jede Action (${alle.length}) prueft den Token vor der ersten Wirkung`,
    ohne.length === 0 && alle.length > 0,
    ohne.join(", "),
  )
}

const REGISTER = [SCHREIBPUNKTE, FINANZPUNKTE, TOKENPUNKTE]
const bekannt = (f) => REGISTER.some((r) => r.has(f))
const registriert = REGISTER.reduce((n, r) => n + r.size, 0)
const serverDateien = ["app", "lib"]
  .flatMap((d) => readdirSync(d, { recursive: true }).map((f) => join(d, String(f))))
  .filter((f) => /\.(ts|tsx)$/.test(f) && /^\s*["']use server["']/m.test(readFileSync(f, "utf8")))
const unbekannt = serverDateien.filter((f) => !bekannt(f))
pruefe(
  `jede "use server"-Datei steht in einem Register (${serverDateien.length}/${registriert})`,
  unbekannt.length === 0 && serverDateien.length === registriert,
  unbekannt.length ? `unbekannt: ${unbekannt.join(", ")}` : "",
)

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
