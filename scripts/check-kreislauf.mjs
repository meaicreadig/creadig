#!/usr/bin/env node
/**
 * DAS KREISLAUF-GATE — GATE 36
 *
 * ---------------------------------------------------------------------------
 * WORUM ES GEHT
 *
 * Der Vertrag: „echtes Marktsignal bis echte Owner-Entscheidung, an echten
 * Faellen."
 *
 * Der naheliegendste Fehler waere, dieses Gate durch Zaehlen zu beantworten:
 * fuenfunddreissig gebaute Gates, also laeuft der Kreislauf. Eine Kette ist
 * aber nicht so stark wie die Summe ihrer Glieder, sondern so stark wie ihr
 * schwaechstes — und fuenfunddreissig Gates mit einer offenen
 * Umsatzsteuerfrage ergeben einen Kreislauf, der an der Rechnung
 * stehenbleibt.
 *
 * Deshalb prueft dieses Gate zwei Dinge, und beide sind Verbote:
 *
 *   1. G36 rechnet nicht und behauptet nicht. Es FRAGT die Gates.
 *   2. G36 leitet aus tragenden Stationen keinen gelaufenen Fall ab.
 *
 * Das zweite ist das wichtigere. Aus „alle Stationen tragen" folgt „der
 * Kreislauf KANN laufen" — nie „er IST gelaufen". Wer den Schritt macht, hat
 * genau die Aussage erfunden, gegen die der Vertrag mit „an echten Faellen"
 * geschrieben ist.
 *
 * ---------------------------------------------------------------------------
 * WAS GEPRUEFT WIRD
 *
 *   1. Kein eigenes Rechnen, kein direkter Griff in ein Register.
 *   2. Jede Station nennt ein Gate, das in der Architektur steht.
 *   3. Jede Sperre nennt einen Menschen, der die Angabe hat.
 *   4. Die Lage ist deterministisch — zweimal gefragt, zweimal dasselbe.
 *   5. `durchgaengig` folgt aus den Sperren, nicht aus einer Zahl.
 *   6. `durchlauf().belegt` ist und bleibt `null`.
 *   7. Der Kreislauf beginnt am Markt und endet beim Owner.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const lies = (rel) => readFileSync(path.join(ROOT, rel), "utf8")

const K = await import("../lib/kreislauf.ts")

const fehler = []
const roh = lies("lib/kreislauf.ts")
/* Kommentare erklaeren die Regel und duerfen die Woerter nennen, die sie verbietet. */
const quelle = roh.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")

/* ── 1 · Es rechnet nicht und greift nicht durch ────────────────────────── */
for (const muster of [
  { re: /\breduce\s*\(/, was: "eine Summe" },
  { re: /\bMath\.(round|floor|ceil)\s*\(/, was: "eine Rundung" },
  { re: /\/\s*\w+\.length/, was: "eine Quote" },
  { re: /\*\s*100\b/, was: "einen Prozentwert" },
]) {
  if (muster.re.test(quelle))
    fehler.push(
      `G36 bildet ${muster.was}. Es darf nur fragen, was die Gates fertig beantworten — sonst ` +
        "wird es eine weitere Quelle der Wahrheit, und zwar die mit dem groessten Anspruch.",
    )
}
for (const verboten of ["vertrieb-store-neon", "lead-store-neon", "neon-client", "lead-store"]) {
  if (new RegExp(`from\\s+["']@/lib/${verboten}`).test(quelle))
    fehler.push(
      `G36 importiert \`lib/${verboten}\` direkt. Eine Station wird von ihrem Gate beantwortet, ` +
        "nicht vom Kreislauf selbst — sonst gaebe es hier eine zweite Meinung darueber, ob die " +
        "Steuerfrage geklaert ist, und die waere falsch, sobald G18 sich aendert.",
    )
}

/* ── 2 · Jede Station nennt ein Gate, das es gibt ───────────────────────── */
const architektur = lies("docs/roadmap/master-architecture.md")
for (const s of K.STATIONEN) {
  if (!/^G\d{2}$/.test(s.gate)) {
    fehler.push(`Die Station „${s.key}" nennt „${s.gate}" — das ist keine Gate-Nummer.`)
    continue
  }
  if (!new RegExp(`\\*\\*${s.gate}[ ✓⬥·]`).test(architektur))
    fehler.push(
      `Die Station „${s.key}" beruft sich auf ${s.gate}, das in der Architektur nicht als Gate ` +
        "steht. Ein Kreislauf aus erfundenen Stationen misst Papier.",
    )
  if (!s.name?.trim() || typeof s.lage !== "function")
    fehler.push(`Die Station „${s.key}" ist unvollstaendig.`)
}

/* ── 3+4 · Sperren nennen einen Menschen, und die Lage ist stabil ───────── */
for (const s of K.STATIONEN) {
  const a = s.lage()
  const b = s.lage()
  if (JSON.stringify(a) !== JSON.stringify(b))
    fehler.push(
      `Die Station „${s.key}" antwortet zweimal verschieden. Ein Kreislauf, der beim zweiten ` +
        "Hinsehen anders aussieht, ist keine Lage, sondern ein Wuerfel.",
    )
  if (!["traegt", "gesperrt", "nicht-erhoben"].includes(a.zustand))
    fehler.push(`Die Station „${s.key}" meldet den unbekannten Zustand „${a.zustand}".`)
  if (a.zustand === "gesperrt" && !a.wer?.trim())
    fehler.push(
      `Die Station „${s.key}" ist gesperrt, nennt aber niemanden. Eine Sperre ohne Adressaten ` +
        "wird als Systemfehler gelesen — und dann sucht jemand im Code, was ein Mensch beibringen muss.",
    )
  if (a.zustand === "traegt" && a.wer !== null)
    fehler.push(`Die Station „${s.key}" traegt und nennt trotzdem jemanden.`)
  if (!a.satz?.trim()) fehler.push(`Die Station „${s.key}" hat keinen Satz.`)
}

/* ── 5 · Durchgaengig folgt aus den Sperren ─────────────────────────────── */
const k = K.kreislauf()
if (k.durchgaengig !== (k.gesperrt.length === 0))
  fehler.push(
    "`durchgaengig` stimmt nicht mit den Sperren ueberein. Der Kreislauf wird nicht gezaehlt, " +
      "sondern gefragt — eine Kette ist so stark wie ihr schwaechstes Glied.",
  )
if (k.gesperrt.length > 0 && k.ersteSperre === null)
  fehler.push("Es gibt Sperren, aber keine erste. Dann sagt das Gate nicht, wo die Kette bricht.")
if (k.gesperrt.length === 0 && k.ersteSperre !== null)
  fehler.push("Keine Sperre, aber eine erste Sperre.")
if (k.stationen.length !== K.STATIONEN.length)
  fehler.push("Der Kreislauf laesst Stationen aus.")

/* ── 6 · Kein erfundener Durchlauf ──────────────────────────────────────── */
const d = K.durchlauf()
if (d.belegt !== null)
  fehler.push(
    "`durchlauf().belegt` ist nicht `null`. Aus tragenden Stationen folgt kein gelaufener Fall — " +
      "GEBAUT ist nicht GELAUFEN, und genau dagegen ist „an echten Faellen" +
      '" geschrieben.',
  )
if (!d.warum?.trim() || !d.woNachzusehen?.trim())
  fehler.push("`durchlauf()` sagt nicht, warum es die Frage nicht beantworten kann.")
if (/\bbelegt\s*:\s*(true|false)\b/.test(quelle))
  fehler.push("Irgendwo wird `belegt` auf einen Wahrheitswert gesetzt. Es gibt nur `null`.")
if (K.SAGT_NICHTS_UEBER.length < 3)
  fehler.push("Es steht zu wenig dabei, was der Kreislauf NICHT sagt.")

/* ── 7 · Anfang und Ende ────────────────────────────────────────────────── */
if (K.STATIONEN[0]?.key !== "markt")
  fehler.push("Der Kreislauf beginnt nicht am Marktsignal — der Vertrag tut es.")
if (K.STATIONEN[K.STATIONEN.length - 1]?.key !== "owner-kontrolle")
  fehler.push("Der Kreislauf endet nicht bei der Owner-Entscheidung — der Vertrag tut es.")

/* ── Ausgabe ────────────────────────────────────────────────────────────── */
const traegt = k.stationen.filter((s) => s.ergebnis.zustand === "traegt").length
console.log(
  `\nKreislauf-Gate — ${k.stationen.length} Stationen (${traegt} tragen, ${k.gesperrt.length} gesperrt), ` +
    `Durchlauf an echten Faellen: nicht erhoben`,
)

if (fehler.length > 0) {
  console.error("\nKreislauf-Gate: aus gebauten Teilen wird ein gelaufener Fall gemacht.\n")
  for (const f of fehler) console.error(`  ${f}`)
  console.error(
    "\nEine Kette ist so stark wie ihr schwaechstes Glied, und ein tragender Kreislauf ist\n" +
      "kein durchlaufener. GEBAUT ist nicht GELAUFEN.\n",
  )
  process.exit(1)
}

console.log(`OK — jede Station wird von ihrem Gate beantwortet, keine Aussage ist abgeleitet.\n`)
console.log(k.satz)
if (k.gesperrt.length > 0) {
  console.log("\nWo die Kette heute bricht — und wer es loesen kann:")
  for (const s of k.stationen.filter((x) => x.ergebnis.zustand === "gesperrt"))
    console.log(`  ${s.gate} ${s.name} → ${s.ergebnis.wer}\n     ${s.ergebnis.satz}`)
}
console.log(`\n${d.warum}\n  Nachzusehen: ${d.woNachzusehen}\n`)
