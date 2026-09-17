#!/usr/bin/env node
/**
 * ADM-04 · VERBINDUNGS-GATE — die Verdrahtung, nicht das Verhalten.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARBEITSTEILUNG
 *
 *   verbindung-drill.mjs   Verhalten: A15–A18, Zustände, Texte.
 *   diese Datei            Verdrahtung: Steht die Fläche im Rollenregister?
 *                          Prüft die Action selbst? Kann der Prüfstand in
 *                          den Betrieb rutschen? Schreibt die Prüfung?
 *
 * Ein Verhalten, das stimmt, aber an einer Seite hängt, die niemand betreten
 * darf oder die jeder auslösen kann, ist kein Gewinn.
 *
 * Aufruf: node --import ./scripts/lib/alias-hook.mjs scripts/check-verbindungen.mjs
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

import { flaecheZu } from "@/lib/rollen"
import { verbindungenInventar } from "@/lib/verbindungen"

let fehler = 0
const pruefe = (name, ok, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`)
  if (!ok) fehler++
}
const lies = (p) => readFileSync(p, "utf8")
/* Kommentare zählen nicht als Beleg — sonst genügte ein Satz über dem Code. */
const ohneKommentare = (q) =>
  q.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((z) => z.replace(/\/\/.*$/, "")).join("\n")

const SEITE = "app/(admin)/admin/verbindungen/page.tsx"
const ACTIONS = "app/(admin)/admin/verbindungen/actions.ts"
const MODELL = "lib/verbindungen.ts"
const PRUEFUNG = "lib/verbindungen-pruefung.ts"
const FIXTURE = "lib/verbindungen-fixture.ts"

console.log("\n1 · Die Flaeche ist angemeldet")
const flaeche = flaecheZu("/admin/verbindungen")
pruefe("`/admin/verbindungen` steht im Rollenregister", Boolean(flaeche))
pruefe(
  "nur der Owner darf hinein",
  flaeche?.fuer.length === 1 && flaeche.fuer[0] === "owner",
  flaeche ? flaeche.fuer.join(", ") : "—",
)
pruefe(
  "sie traegt keine Personendaten Dritter",
  flaeche?.klasse === "eigene-lage",
  String(flaeche?.klasse),
)
const shell = ohneKommentare(lies("components/admin/admin-shell.tsx"))
pruefe(
  "die Navigation fuehrt sie",
  /key:\s*"verbindungen",\s*href:\s*"\/admin\/verbindungen"/.test(shell),
)

console.log("\n2 · Die Seite misst nicht beim Rendern")
const seite = lies(SEITE)
pruefe("die Seite ist dynamisch", /export const dynamic = "force-dynamic"/.test(seite))
const seiteCode = ohneKommentare(seite)
pruefe(
  "sie ruft `verbindungPruefen` nicht selbst auf",
  !/\bverbindungPruefen\s*\(/.test(seiteCode),
  "eine Seite, die beim Aufruf fremde Systeme anruft, ist H1 in langsam",
)

console.log("\n3 · Die Handlung autorisiert selbst")
const actions = ohneKommentare(lies(ACTIONS))
pruefe("`pruefeZugang` wird gefragt", /pruefeZugang\s*\(/.test(actions))
pruefe("`darfBetreten` wird gefragt", /darfBetreten\s*\(\s*[\w.]+,\s*"\/admin\/verbindungen"\s*\)/.test(actions))
pruefe(
  "jede exportierte Action fordert zuerst die Rolle",
  (actions.match(/export async function \w+/g) ?? []).length ===
    (actions.match(/await requireOwner\(\)/g) ?? []).length,
)
pruefe(
  "ein unbekannter Wert aus dem Formular loest nichts aus",
  /istVerbindungsId\s*\(/.test(actions) && /PRUEFSTAND_AKTIONEN as readonly string\[\]\)\.includes/.test(actions),
)

console.log("\n4 · Der Pruefstand kann nicht in den Betrieb rutschen")
const modell = ohneKommentare(lies(MODELL))
pruefe(
  "Produktionsumgebung schaltet ihn hart aus",
  /VERCEL_ENV\s*===\s*"production"\s*\)\s*return false/.test(modell),
)
pruefe("er braucht einen ausdruecklichen Schalter", /VERBINDUNG_FIXTURE.*===\s*"an"/.test(modell))
pruefe(
  "auch die Handlung prueft den Schalter — nicht nur die Anzeige",
  /if \(!pruefstandAktiv\(\)\) return/.test(actions),
)
const fixtureNutzer = []
for (const wurzel of ["app", "components", "lib"]) {
  for (const f of readdirSync(wurzel, { recursive: true })) {
    const pfad = join(wurzel, String(f))
    if (!/\.tsx?$/.test(pfad)) continue
    if (pfad === FIXTURE) continue
    if (/verbindungen-fixture/.test(ohneKommentare(lies(pfad)))) fixtureNutzer.push(pfad)
  }
}
pruefe(
  "der Pruefstand wird nur im Verbindungsverzeichnis benutzt",
  fixtureNutzer.every((p) => p.startsWith("app/(admin)/admin/verbindungen")),
  fixtureNutzer.join(", ") || "niemand",
)

console.log("\n5 · Die Pruefung hat keine Nebenwirkung")
const pruefung = ohneKommentare(lies(PRUEFUNG))
for (const verboten of ["storeLead", "createEnquiry", "sendMail", "resend", "fetch("]) {
  pruefe(`kein \`${verboten}\` im Pruefpfad`, !pruefung.includes(verboten))
}
pruefe(
  "sie liest ausschliesslich",
  /store\.list\(\{ limit: 1 \}\)/.test(pruefung) && /store\.summary\(\)/.test(pruefung),
)
pruefe(
  "sie hat eine Zeitgrenze",
  /GRENZE_MS/.test(pruefung),
  "ohne Grenze haengt der Owner an einem offenen Socket (H12)",
)
pruefe(
  "sie behauptet beim Versand nur die Einrichtung",
  /"schluessel-gesetzt", "CONNECTED", "konfiguration"/.test(pruefung),
)

console.log("\n6 · Die eingefrorene Kritikalitaet (ADM-00 · OD-2)")
const kritisch = verbindungenInventar({})
  .filter((e) => e.kritikalitaet === "CRITICAL")
  .map((e) => e.id)
  .sort()
pruefe(
  "CRITICAL bleibt der Anfrage-Eingang",
  JSON.stringify(kritisch) === JSON.stringify(["manuelle-anfrage", "website-anfrage"]),
  kritisch.join(", ") || "keine",
)
pruefe(
  "kein Kanal behauptet eine Faehigkeit ohne Beleg",
  verbindungenInventar({}).every((e) => e.beleg && e.ebenen.faehigkeit),
)

console.log(fehler ? `\n✗ ${fehler} Befund(e)\n` : "\n✓ Verbindungs-Gate gruen\n")
process.exit(fehler ? 1 : 0)
