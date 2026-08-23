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

type Entry = { lastSent: number; suppressed: number }

const seen = new Map<string, Entry>()

/** `null` = jetzt melden (mit Zahl der unterdrückten), sonst stillhalten. */
function shouldSend(kind: string, now: number): number | null {
  const entry = seen.get(kind)
  if (!entry || now - entry.lastSent >= WINDOW_MS) {
    const suppressed = entry?.suppressed ?? 0
    seen.set(kind, { lastSent: now, suppressed: 0 })
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
  const suppressed = shouldSend(kind, Date.now())
  if (suppressed === null) return

  const text =
    suppressed > 0
      ? `creaDIG [${kind}] ${message} (${suppressed} weitere im letzten Fenster unterdrückt)`
      : `creaDIG [${kind}] ${message}`

  console.error(`[alarm] ${text}`)

  const hook = process.env.ALERT_WEBHOOK_URL
  if (!hook) return
  try {
    await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
  } catch (error) {
    // Der Alarmweg selbst darf den Vorgang nicht scheitern lassen.
    console.error("[alarm] Zustellung des Alarms fehlgeschlagen:", error)
  }
}
