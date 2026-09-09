#!/usr/bin/env node
/**
 * G32 · ROLLEN-GATE — jede Flaeche ist eingetragen, und die Sperre wirkt.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE VIER FRAGEN
 *
 *   1 · Ist jede Admin-Seite im Register? Verbot ist die Voreinstellung —
 *       eine vergessene Seite ist deshalb GESPERRT, nicht offen. Das ist
 *       die sichere Richtung, aber es ist auch ein stiller Ausfall. Das
 *       Gate macht ihn laut.
 *
 *   2 · Fragt die Middleware das Register wirklich? Eine Rechte-Tabelle,
 *       die niemand aufruft, ist Dekoration — und genau so sah die Lage
 *       vor G32 aus: fuenfzehn Flaechen, eine Frage („angemeldet?").
 *
 *   3 · Traegt die Sitzung die Rolle UNTER der Signatur? Stuende sie
 *       daneben, koennte jeder das Feld auf `owner` setzen.
 *
 *   4 · Steht irgendwo ein Passwort im Quelltext? Nur NAMEN von
 *       Umgebungsvariablen gehoeren hierher, nie Werte.
 */
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { FLAECHEN, KLASSEN, ROLLEN, ROLLEN_KEYS, darfBetreten, flaecheZu, uebergabe, vergebeneRollen } from "../lib/rollen.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const fehler = []

/* ═══ 1 · Jede Seite ist eingetragen ═════════════════════════════════════ */

function seiten(dir, basis = "", treffer = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const voll = path.join(dir, e.name)
    if (e.isDirectory()) {
      /* Routengruppen wie `(admin)` erscheinen nicht im Pfad. */
      const teil = e.name.startsWith("(") && e.name.endsWith(")") ? "" : `/${e.name}`
      seiten(voll, basis + teil, treffer)
    } else if (e.name === "page.tsx") {
      treffer.push(basis === "" ? "/" : basis)
    }
  }
  return treffer
}

const gefunden = seiten(path.join(ROOT, "app", "(admin)")).map((p) => p.replace(/\[\w+\]/g, ":id"))

for (const pfad of gefunden) {
  if (!flaecheZu(pfad)) {
    fehler.push(
      `Die Seite ${pfad} steht in keinem Flaechen-Eintrag. Verbot ist die Voreinstellung — ` +
        "sie ist damit fuer JEDE Rolle gesperrt, und niemand merkt es ausser dem, der sie aufruft.",
    )
  }
}
for (const f of FLAECHEN) {
  if (!gefunden.includes(f.pfad)) {
    fehler.push(`Das Register fuehrt ${f.pfad}, diese Seite gibt es nicht (mehr).`)
  }
}

/* ═══ 2 · Die Middleware fragt das Register ══════════════════════════════ */

function ohneKommentare(q) {
  return q.replace(/\/\*[\s\S]*?\*\//g, " ").split("\n").map((z) => z.replace(/\/\/.*$/, "")).join("\n")
}
const mw = ohneKommentare(readFileSync(path.join(ROOT, "middleware.ts"), "utf8"))
if (!/darfBetreten\s*\(/.test(mw)) {
  fehler.push(
    "`middleware.ts` ruft `darfBetreten()` nicht. Damit gilt wieder nur die eine Frage — " +
      "und eine Rechte-Tabelle, die niemand aufruft, ist Dekoration.",
  )
}
if (!/matcher:\s*\[\s*["']\/admin\/:path\*["']/.test(mw)) {
  fehler.push("Der Middleware-Matcher deckt nicht mehr alle Admin-Pfade ab.")
}

/* ═══ 3 · Die Rolle liegt unter der Signatur ═════════════════════════════ */

const session = ohneKommentare(readFileSync(path.join(ROOT, "lib", "admin-session.ts"), "utf8"))

/*
 * BEIDE SEITEN EINZELN — der erste Anlauf hat hier versagt.
 *
 * Er suchte das Muster IRGENDWO in der Datei. Die Blindprobe hat nur
 * `issueSession()` kaputtgemacht (signiert nur noch den Ablauf) — und der
 * Waechter schwieg, weil `verifySession()` das Muster weiter enthielt.
 *
 * Genau diese Divergenz ist der gefaehrliche Fall: Ausstellen und Pruefen
 * muessen ueber DASSELBE signieren. Tun sie es nicht, ist im besten Fall
 * keine Sitzung mehr gueltig — im schlechteren wird eine akzeptiert, die
 * niemand so ausgestellt hat.
 */
function block(quelle, name) {
  const i = quelle.indexOf(`export async function ${name}`)
  if (i < 0) return ""
  const rest = quelle.slice(i)
  const ende = rest.indexOf("\nexport ", 1)
  return ende < 0 ? rest : rest.slice(0, ende)
}

const ausstellen = block(session, "issueSession")
const pruefen = block(session, "verifySession")

if (!ausstellen) fehler.push("`issueSession()` gibt es nicht mehr.")
if (!pruefen) fehler.push("`verifySession()` gibt es nicht mehr.")

/* Beide muessen die Rolle in die signierte Nutzlast nehmen. */
const signiertRolle = (q) => /sign\(\s*`\$\{rolle\}\.\$\{expiresAt\}`|sign\(\s*nutzlast/.test(q)
if (ausstellen && !signiertRolle(ausstellen)) {
  fehler.push(
    "`issueSession()` signiert die Rolle nicht mit. Stuende sie neben der Signatur, koennte " +
      "jeder das erste Feld auf `owner` setzen und behielte eine gueltige Sitzung.",
  )
}
if (pruefen && !signiertRolle(pruefen)) {
  fehler.push(
    "`verifySession()` prueft die Signatur nicht ueber der Rolle. Ausstellen und Pruefen " +
      "muessen ueber dasselbe signieren.",
  )
}
if (!/istRolle\s*\(/.test(pruefen)) {
  fehler.push("Die Sitzung prueft die Rolle nicht gegen das Register.")
}

/* ═══ 4 · Kein Geheimnis im Quelltext ════════════════════════════════════ */

const rollenQuelle = readFileSync(path.join(ROOT, "lib", "rollen.ts"), "utf8")
for (const rolle of ROLLEN_KEYS) {
  const v = ROLLEN[rolle].variable
  if (!/^[A-Z_][A-Z0-9_]*$/.test(v)) {
    fehler.push(`Die Rolle ${rolle} nennt keinen gueltigen Variablennamen.`)
  }
}
/* Ein Wert saehe anders aus als ein Name: Kleinbuchstaben, Sonderzeichen,
   Anfuehrungszeichen mit Inhalt hinter einem `=`. */
if (/(PASSWORD|SECRET|TOKEN)\s*[:=]\s*["'][^"']{6,}["']/.test(ohneKommentare(rollenQuelle))) {
  fehler.push("In `lib/rollen.ts` steht etwas, das wie ein gesetzter Geheimniswert aussieht.")
}

/* ═══ 5 · Die enge Klasse bekommt nur, wer sie braucht ═══════════════════ */

for (const f of FLAECHEN) {
  if (!KLASSEN[f.klasse]) fehler.push(`${f.pfad} traegt die unbekannte Klasse „${f.klasse}".`)
  if (f.fuer.length === 0) fehler.push(`${f.pfad} ist fuer keine Rolle erreichbar.`)
  for (const r of f.fuer) {
    if (!ROLLEN[r]) fehler.push(`${f.pfad} nennt die Rolle ${r}, die es nicht gibt.`)
  }
}
for (const rolle of ROLLEN_KEYS) {
  if (rolle === "owner") continue
  if (!ROLLEN[rolle].siehtNicht || ROLLEN[rolle].siehtNicht.length < 20) {
    fehler.push(
      `Die Rolle ${rolle} sagt nicht, was sie NICHT sieht. Eine Rolle, die nur auflistet, ` +
        "was sie darf, wird beim naechsten Wunsch erweitert.",
    )
  }
}

/* ═══ AUSGABE ════════════════════════════════════════════════════════════ */

const eng = FLAECHEN.filter((f) => KLASSEN[f.klasse].eng)
const vergeben = vergebeneRollen()

console.log(
  `\nRollen-Gate — ${ROLLEN_KEYS.length} Rollen, ${FLAECHEN.length} Flaechen ` +
    `(${eng.length} mit Personendaten Dritter), ${gefunden.length} Seiten gefunden`,
)
for (const rolle of ROLLEN_KEYS) {
  const darf = FLAECHEN.filter((f) => f.fuer.includes(rolle)).length
  console.log(`  ${ROLLEN[rolle].label.padEnd(10)} ${darf}/${FLAECHEN.length} Flaechen · ${ROLLEN[rolle].variable}`)
}

if (fehler.length > 0) {
  console.error(`\nABGEBROCHEN — ${fehler.length} Befund(e):\n`)
  for (const f of fehler) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}

console.log("OK — jede Seite ist eingetragen, die Middleware fragt das Register, die Rolle liegt unter der Signatur.")

/*
 * Der Unterschied zwischen GEBAUT und LEBT — dieses Haus haelt ihn ueberall.
 * Es wird nur gelesen, OB die Variable gesetzt ist, nie ihr Wert.
 */
const eingeschraenkt = vergeben.filter((r) => r !== "owner")
if (eingeschraenkt.length === 0) {
  console.log(
    "Ein zweiter Mensch ist MOEGLICH, aber nicht eingerichtet: keine eingeschraenkte Rolle vergeben.",
  )
  console.log(
    `  Owner-Punkt: einen Wert fuer ${ROLLEN_KEYS.filter((r) => r !== "owner").map((r) => ROLLEN[r].variable).join(" oder ")} setzen. ` +
      "Danach arbeitet dieser Mensch, ohne alles zu sehen — ohne Code-Aenderung.",
  )
  for (const punkt of uebergabe("vertrieb")) {
    console.log(`  Bei der Uebergabe: ${punkt.was} — ${punkt.wie}`)
  }
} else {
  console.log(`Vergebene eingeschraenkte Rollen: ${eingeschraenkt.join(", ")}.`)
}
