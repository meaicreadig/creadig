/**
 * T-2 — der Alarm.
 *
 * ---------------------------------------------------------------------------
 * WAS OHNE IHN PASSIERT
 * Beide kritischen Routen schrieben ihre Fehler in `console.error`. Das landet
 * in den Vercel-Runtime-Logs — einem Ort, den jemand aktiv öffnen muss. Solange
 * niemand hinsieht, ist ein Ausfall der Lead-Route lautlos: Das Formular meldet
 * dem Absender einen Fehler, wir erfahren nichts, und wochenlange Stille sieht
 * aus wie schlechte Marktlage. Genau dieses Muster hat das Projekt schon einmal
 * Jahre gekostet.
 *
 * ---------------------------------------------------------------------------
 * ZWEI STUFEN, WEIL EINE ZU WENIG UND ZWEI GENUG SIND
 *   1. `console.error` mit einheitlichem Präfix `[alarm]` — damit sich im Log
 *      ein Filter setzen lässt, statt Zeilen zu suchen.
 *   2. Ein Webhook, falls `ALERT_WEBHOOK_URL` gesetzt ist (Slack, Discord,
 *      was auch immer JSON entgegennimmt). Owner-Punkt: ohne diese Variable
 *      bleibt es bei Stufe 1.
 *
 * ---------------------------------------------------------------------------
 * WARUM GEDROSSELT WIRD
 * Ein abgelaufener Resend-Schlüssel erzeugt bei jeder Anfrage denselben
 * Fehler. Ein Alarm, der hundertmal kommt, wird nach dem dritten Mal
 * weggewischt — und dann auch der, der wichtig gewesen wäre. Pro Art höchstens
 * eine Meldung je Fenster; was dazwischen anfiel, steht als Zahl in der
 * nächsten Meldung. Der Zähler liegt im Arbeitsspeicher der Instanz: Nach
 * einem Kaltstart kommt eine Meldung mehr. Das ist die richtige Richtung —
 * lieber eine zu viel als eine zu wenig.
 */

const WINDOW_MS = 15 * 60 * 1000
/** Verhindert unbegrenztes Wachstum, wenn `kind` von aussen kommt. */
const MAX_KINDS = 64

type Entry = { lastSent: number; suppressed: number }

const seen = new Map<string, Entry>()

function normaliseKind(kind: string): string {
  const safe = kind.replace(/[^a-z0-9_-]/gi, "").slice(0, 48)
  return safe || "unknown"
}

function pruneSeen(now: number) {
  if (seen.size <= MAX_KINDS) return

  for (const [key, entry] of seen) {
    if (now - entry.lastSent >= WINDOW_MS) seen.delete(key)
  }

  while (seen.size > MAX_KINDS) {
    let oldestKey: string | null = null
    let oldestTime = Infinity
    for (const [key, entry] of seen) {
      if (entry.lastSent < oldestTime) {
        oldestTime = entry.lastSent
        oldestKey = key
      }
    }
    if (!oldestKey) break
    seen.delete(oldestKey)
  }
}

/** `null` = jetzt melden (mit Zahl der unterdrückten), sonst stillhalten. */
function shouldSend(kind: string, now: number): number | null {
  const key = normaliseKind(kind)
  const entry = seen.get(key)
  if (!entry || now - entry.lastSent >= WINDOW_MS) {
    const suppressed = entry?.suppressed ?? 0
    seen.set(key, { lastSent: now, suppressed: 0 })
    pruneSeen(now)
    return suppressed
  }
  entry.suppressed++
  return null
}

/**
 * Meldet einen Fehler, der jemanden erreichen muss.
 *
 * `kind` ist der Drosselungs-Schlüssel — gleiche Art, gleicher Topf. Er gehört
 * grob gewählt ("lead-send-failed"), nicht fein ("lead-send-failed-<E-Mail>"),
 * sonst drosselt nichts.
 */
export async function raiseAlert(kind: string, message: string): Promise<void> {
  const safeKind = normaliseKind(kind)
  const suppressed = shouldSend(safeKind, Date.now())
  if (suppressed === null) return

  const text =
    suppressed > 0
      ? `creaDIG [${safeKind}] ${message} (${suppressed} weitere im letzten Fenster unterdrückt)`
      : `creaDIG [${safeKind}] ${message}`

  console.error(`[alarm] ${text}`)

  const hook = process.env.ALERT_WEBHOOK_URL
  if (!hook) return
  try {
    /*
     * GATE 01 — DER ALARM DARF DEN VORGANG NICHT AUFHALTEN.
     *
     * Hier stand ein `fetch` ohne Frist. Gemessen am 05.09.2026: `raiseAlert`
     * wird in `/api/lead` ABGEWARTET. Ein Alarm-Ziel, das nicht antwortet —
     * ein haengender Webhook, ein stiller Proxy — haette damit genau die
     * Anfrage blockiert, deren Ausfall er melden soll. Der Meldeweg waere zur
     * zweiten Stoerung geworden.
     *
     * Drei Sekunden: lang genug fuer jeden erreichbaren Empfaenger, kurz
     * genug, dass ein Mensch am Formular es nicht merkt.
     */
    const response = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(3_000),
    })

    /*
     * Und eine abgelehnte Zustellung wurde bisher verschluckt: `fetch` wirft
     * bei 404 oder 500 nicht. Ein Empfaenger, dessen Adresse abgelaufen ist,
     * sah damit genau so aus wie einer, der zuhoert — der schlechteste
     * denkbare Zustand fuer einen Meldeweg.
     */
    if (!response.ok) {
      console.error(`[alarm] Empfaenger hat abgelehnt: HTTP ${response.status}`)
    }
  } catch (error) {
    // Der Alarmweg selbst darf den Vorgang nicht scheitern lassen.
    const grund = error instanceof Error && error.name === "TimeoutError" ? "Zeitueberschreitung (3 s)" : String(error)
    console.error("[alarm] Zustellung des Alarms fehlgeschlagen:", grund)
  }
}
