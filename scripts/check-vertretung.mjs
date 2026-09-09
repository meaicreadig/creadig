#!/usr/bin/env node
/**
 * DAS VERTRETUNGS-GATE — GATE 33
 *
 * ---------------------------------------------------------------------------
 * WORUM ES GEHT
 *
 * Der Vertrag: „fuer EINEN Ablauf ersetzbar" — der einzige Beweis, dass das
 * Unternehmen ohne den Owner laeuft.
 *
 * Dieses Gate prueft nicht, ob der Owner ersetzbar IST. Das haengt an einer
 * Umgebungsvariablen und damit an einem Menschen. Es prueft, dass die
 * Antwort darauf nicht gefaelscht werden kann — und zwar in beide
 * Richtungen:
 *
 *   NACH UNTEN  Niemand erklaert einen Schritt zur Chefsache, den kein Gate
 *               an einen Menschen bindet. „Nur ich kann das" ist keine
 *               Regel, sondern eine Gewohnheit — und sie macht den Owner
 *               unersetzbar, ohne dass es jemandem auffaellt.
 *
 *   NACH OBEN   Niemand delegiert einen Schritt, den ein Gate einem
 *               Menschen vorbehalten hat. Das waere die billige Art,
 *               „ersetzbar" zu melden: eine Sicherung entfernen und die Zahl
 *               steigen sehen. Genau davor warnt G27.
 *
 * ---------------------------------------------------------------------------
 * WAS GEPRUEFT WIRD
 *
 *   1. Jede Owner-Bindung nennt ein Gate, das es gibt (G26/G27).
 *   2. Kein Entscheidungstor aus G27 fehlt in den Ablaeufen.
 *   3. Ein gebundener Schritt traegt keine Rolle — sonst ist er delegiert.
 *   4. Ein delegierbarer Schritt traegt mindestens eine — sonst niemanden.
 *   5. Jede genannte Rolle gibt es in G32.
 *   6. Die Lage wird aus der Umgebung gelesen, nicht behauptet.
 *   7. Arbeit verschwindet nie stumm: nicht besetzt heisst eskaliert.
 */
const R = await import("../lib/rollen.ts")
const O = await import("../lib/ownerlast.ts")
const T = await import("../lib/vertretung.ts")

const fehler = []

/* ── 1 · Keine erfundenen Owner-Tore ────────────────────────────────────── */
for (const a of T.ABLAEUFE) {
  for (const s of a.schritte) {
    if (s.ownerGebundenDurch === null) continue
    if (!T.istOwnerGate(s.ownerGebundenDurch))
      fehler.push(
        `${a.key}: „${s.was}" beruft sich auf ${s.ownerGebundenDurch} — dieses Gate bindet ` +
          `nichts an einen Menschen. Erlaubt sind ${T.OWNER_GATES.join(", ")}. Wer sich ein Tor ` +
          "ausdenken kann, macht den Owner unersetzbar, ohne dass es jemandem auffaellt.",
      )
  }
}

/* ── 2 · Kein Entscheidungstor fehlt ────────────────────────────────────── */
const gebunden = new Set(
  T.ABLAEUFE.flatMap((a) => a.schritte.map((s) => s.ownerGebundenDurch).filter(Boolean)),
)
for (const tor of O.ENTSCHEIDUNGSTORE) {
  /* G26 ist die Grenze der Automation, kein Schritt in einem Ablauf. */
  if (tor.gate === "G26") continue
  if (!gebunden.has(tor.gate))
    fehler.push(
      `${tor.gate} („${tor.was}") kommt in keinem Ablauf als Owner-Schritt vor. Entweder fehlt ` +
        "der Ablauf, oder eine Entscheidung ist stillschweigend delegiert worden.",
    )
}

/* ── 3+4+5 · Die Schritte selbst ────────────────────────────────────────── */
for (const a of T.ABLAEUFE) {
  if (a.schritte.length === 0) fehler.push(`${a.key} hat keine Schritte.`)
  for (const s of a.schritte) {
    if (s.ownerGebundenDurch !== null && s.rollen.length > 0)
      fehler.push(
        `${a.key}: „${s.was}" ist an ${s.ownerGebundenDurch} gebunden UND an ` +
          `${s.rollen.join(", ")} vergeben. Beides zugleich gibt es nicht — das ist eine ` +
          "delegierte Entscheidung mit einem beruhigenden Etikett.",
      )
    if (s.ownerGebundenDurch === null && s.rollen.length === 0)
      fehler.push(
        `${a.key}: „${s.was}" ist delegierbar, aber keiner Rolle zugeordnet. Dann traegt ihn ` +
          "niemand, und der Ablauf haengt still am Owner.",
      )
    for (const r of s.rollen) {
      if (!R.istRolle(r)) fehler.push(`${a.key}: „${r}" ist keine Rolle aus G32.`)
      if (r === "owner")
        fehler.push(
          `${a.key}: „${s.was}" nennt „owner" als tragende Rolle. Der Owner kann alles — ihn ` +
            "mitzuschreiben laesst jeden Schritt besetzt aussehen und loescht die Frage dieses Gates.",
        )
    }
    if (!s.weil?.trim()) fehler.push(`${a.key}: „${s.was}" nennt keinen Grund.`)
  }
}

/* ── 6 · Zugang ist keine Besetzung ─────────────────────────────────────── */

/*
 * Der Vertrag steht woertlich in `docs/roadmap/creadig-1-0-scale.md`:
 *
 *   „Der Owner ist ersetzbar fuer EINEN Ablauf | pruefbar an: erste Rolle
 *    BESETZT"
 *
 * Bis zum 09.09.2026 galt eine Rolle als besetzt, sobald ihre
 * Passwort-Variable gesetzt war. EINE Umgebungsvariable machte den Vertrag
 * damit „erfuellt". Die Frage, aus der der Satz stammt, lautet aber „Wer
 * antwortet, wenn du im Urlaub bist?" — und ein Passwort antwortet nicht.
 */
const ALLE_ZUGAENGE = Object.fromEntries(
  R.ROLLEN_KEYS.map((r) => [R.ROLLEN[r].variable, "gesetzt"]),
)
const MIT_MENSCH = [
  { rolle: "vertrieb", mensch: "Pruefperson", seit: "2026-09-09" },
  { rolle: "redaktion", mensch: "Pruefperson", seit: "2026-09-09" },
]

const leer = T.ersatzlage({}, [])
const nurZugang = T.ersatzlage(ALLE_ZUGAENGE, [])
const besetzt = T.ersatzlage(ALLE_ZUGAENGE, MIT_MENSCH)
const nurMensch = T.ersatzlage({}, MIT_MENSCH)

if (leer.ersetzbar.length !== 0)
  fehler.push(
    "Ohne Zugang und ohne Menschen meldet das Modul trotzdem einen ersetzbaren Ablauf. Dann " +
      "liest es nichts, sondern behauptet eine Einrichtung.",
  )
if (nurZugang.erfuellt || nurZugang.ersetzbar.length > 0)
  fehler.push(
    "Gesetzte Passwoerter allein machen den Vertrag erfuellt. Er verlangt eine BESETZTE Rolle — " +
      "einen Menschen. Ein Zugang ohne Menschen ist ein offenes Schloss vor einem leeren Raum.",
  )
if (nurZugang.nurZugang.length === 0)
  fehler.push(
    "Der Zustand „Zugang da, Mensch fehlt“ wird nicht eigens gefuehrt. Dann faellt er wieder " +
      "mit „nicht besetzt“ oder „ersetzbar“ zusammen — und einer der beiden ist eine Luege.",
  )
if (nurMensch.erfuellt)
  fehler.push(
    "Ein benannter Mensch ohne Zugang gilt als Besetzung. Wer sich nicht anmelden kann, traegt " +
      "die Rolle nicht.",
  )
if (!besetzt.erfuellt || besetzt.ersetzbar.length === 0)
  fehler.push(
    "Auch mit Mensch UND Zugang ist kein Ablauf ersetzbar. Dann ist der Vertrag nicht einmal " +
      "erreichbar, und das Gate misst nur sich selbst.",
  )
for (const b of T.BESETZUNGEN) {
  if (b.mensch !== null && !b.seit)
    fehler.push(`Die Besetzung „${b.rolle}“ nennt einen Menschen ohne Datum.`)
  if (!R.istRolle(b.rolle) || b.rolle === "owner")
    fehler.push(`„${b.rolle}“ ist keine delegierbare Rolle.`)
}
for (const key of besetzt.ersetzbar) {
  const ablauf = T.ABLAEUFE.find((a) => a.key === key)
  if (ablauf.schritte.some((s) => s.ownerGebundenDurch !== null))
    fehler.push(
      `${key} gilt als ersetzbar, enthaelt aber einen gebundenen Schritt. Die Owner-Bindung ` +
        "muss jede andere Antwort ueberstimmen.",
    )
}

/* ── 7 · Arbeit verschwindet nie stumm ──────────────────────────────────── */
for (const a of T.ABLAEUFE) {
  const e = T.ersetzbarkeit(a, {})
  if (e.lage === "nicht-besetzt" && !e.eskalation?.trim())
    fehler.push(
      `${a.key}: nicht besetzt, aber ohne Eskalation. Eine leere Rolle laesst die Arbeit nicht ` +
        "verschwinden — sie faellt an den Owner zurueck, und das gehoert hingeschrieben.",
    )
  if (!e.satz?.trim()) fehler.push(`${a.key}: die Lage hat keinen Satz.`)
}

if (T.SAGT_NICHTS_UEBER.length < 3)
  fehler.push("Es steht zu wenig dabei, was der Befund NICHT sagt. „Owner ersetzbar“ wird zitiert.")

/* ── Ausgabe ────────────────────────────────────────────────────────────── */
const lage = T.ersatzlage()
console.log(
  `\nVertretungs-Gate — ${T.ABLAEUFE.length} Ablaeufe (${lage.ersetzbar.length} ersetzbar, ` +
    `${lage.nurZugang.length} nur Zugang, ${lage.nichtBesetzt.length} nicht besetzt, ` +
    `${lage.ownerGebunden.length} owner-gebunden), ` +
    `${T.BESETZUNGEN.filter((b) => b.mensch !== null).length} von ${T.BESETZUNGEN.length} Rollen ` +
    `mit einem Menschen, ${R.vergebeneRollen().length} mit Zugang`,
)

if (fehler.length > 0) {
  console.error("\nVertretungs-Gate: die Antwort auf „ersetzbar?" + '" ist faelschbar.\n')
  for (const f of fehler) console.error(`  ${f}`)
  console.error(
    "\nErsetzbarkeit heisst, dass delegierbare Arbeit nicht an einer Person haengt — nicht,\n" +
      "dass eine Entscheidung weniger geworden ist.\n",
  )
  process.exit(1)
}

console.log(`OK — keine erfundene Chefsache, keine delegierte Entscheidung.\n${lage.satz}`)
if (lage.nichtBesetzt.length + lage.nurZugang.length > 0)
  console.log(
    `\nOwner-Punkt: ${lage.nichtBesetzt.length + lage.nurZugang.length} Ablauf/Ablaeufe waeren ` +
      "delegierbar, sobald ein MENSCH die Rolle traegt — Name in BESETZUNGEN und Zugang:\n" +
      T.ABLAEUFE.filter((a) => [...lage.nichtBesetzt, ...lage.nurZugang].includes(a.key))
        .map((a) => `  ${a.name}: ${T.ersetzbarkeit(a).satz}`)
        .join("\n"),
  )
console.log("")
