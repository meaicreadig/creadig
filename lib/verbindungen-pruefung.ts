/**
 * ADM-04 · DIE PRÜFUNG — abgeleitet ist nicht gemessen
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DER UNTERSCHIED, DEN DIESE DATEI TRÄGT
 *
 * `verbindungenInventar()` liest die Umgebung: „LEAD_STORE ist gesetzt“.
 * Das ist eine Aussage über die Einrichtung — nicht darüber, ob die
 * Datenbank antwortet. Zwischen beidem liegt genau der Fall, der wehtut:
 * Der Kanal steht auf „verbunden“, das Formular schickt seit Tagen ins
 * Leere, und niemand hat nachgesehen, weil die Karte grün war.
 *
 * Die Prüfung misst. Sie wird ausgelöst, nie beim Rendern ausgeführt —
 * ADM-02 · H1 hat dieses Haus einmal gekostet, dass ein Lesepfad schrieb;
 * ein Lesepfad, der bei jedem Seitenaufruf fremde Systeme anruft, ist
 * derselbe Fehler in langsam.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS EINE PRÜFUNG BEWEISEN DARF — UND WAS NICHT
 *
 * Sie darf nur behaupten, was sie getan hat.
 *
 *   Anfrage-Eingang   liest eine Zeile → beweist Erreichbarkeit
 *   Vertrieb          liest die Kennzahlen → beweist Erreichbarkeit
 *   E-Mail-Versand    prüft, OB ein Schlüssel da ist — und schickt NICHTS.
 *                     Ein Testversand wäre eine echte Mail an einen echten
 *                     Empfänger und kostet echtes Geld; „Schlüssel gesetzt“
 *                     ist die ehrliche Obergrenze dessen, was hier ohne
 *                     Owner-Entscheidung messbar ist.
 *
 * Deshalb trägt jedes Ergebnis seine `reichweite`: `gemessen` oder
 * `konfiguration`. Die Oberfläche schreibt das dazu, statt beides als Haken
 * zu zeigen.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DAS PROTOKOLL IM ARBEITSSPEICHER LIEGT
 *
 * Eine Prüfung ist eine Aussage über JETZT. Sie in Neon zu schreiben hieße,
 * einen zweiten Wahrheitsspeicher neben der Umgebung anzulegen (A9) — und
 * beim Lesen stünde dort ein Ergebnis von vorgestern, das aussieht wie ein
 * Zustand. Das Protokoll gilt für diese Instanz, die Oberfläche sagt das,
 * und ein Neustart löscht es. Wer eine Verlaufshistorie will, misst
 * regelmäßig — das ist ADM-06, nicht hier.
 */

import { getLeadStore, getVertriebStore } from "@/lib/lead-store"
import { verbindungEintrag, type VerbindungsId, type VerbindungsZustand } from "@/lib/verbindungen"

export const PRUEF_BEFUNDE = [
  /** Gemessen: Die Gegenstelle hat geantwortet. */
  "erreichbar",
  /** Gemessen: eingerichtet, antwortet nicht. */
  "nicht-erreichbar",
  /** Nichts eingerichtet — es gibt nichts zu erreichen. */
  "nicht-eingerichtet",
  /** Konfiguration vorhanden; mehr kann ohne Nebenwirkung nicht geprüft werden. */
  "schluessel-gesetzt",
  /** Diese Fähigkeit lässt sich nicht prüfen (reiner Link, kein Adapter). */
  "nicht-pruefbar",
] as const
export type PruefBefund = (typeof PRUEF_BEFUNDE)[number]

export type Pruefergebnis = {
  id: VerbindungsId
  befund: PruefBefund
  /** Was die Prüfung abdeckt — ehrliche Reichweite, kein Haken. */
  reichweite: "gemessen" | "konfiguration"
  /** Der Zustand, den die Messung belegt. */
  zustand: VerbindungsZustand
  /** Zeitpunkt in ms — die Anzeige formatiert nach Europe/Berlin. */
  at: number
  /** Dauer der Messung in ms; `null`, wo nichts gemessen wurde. */
  dauerMs: number | null
  /** Wer geprüft hat (Rolle). */
  akteur: string
}

/* ═══════════════════════════════════════════════════════════════════════════
 * DAS PROTOKOLL DIESER INSTANZ
 * ═══════════════════════════════════════════════════════════════════════════ */

const protokoll = new Map<VerbindungsId, Pruefergebnis>()

export function letztePruefung(id: VerbindungsId): Pruefergebnis | null {
  return protokoll.get(id) ?? null
}

export function pruefprotokoll(): Pruefergebnis[] {
  return [...protokoll.values()].sort((a, b) => b.at - a.at)
}

export function pruefprotokollZuruecksetzen(): void {
  protokoll.clear()
}

/* ═══════════════════════════════════════════════════════════════════════════
 * DIE MESSUNG
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Wie lange eine Gegenstelle antworten darf, bevor sie als nicht erreichbar
 * gilt.
 *
 * Ohne Grenze hängt die Prüfung am offenen Socket, und der Owner sieht
 * „wird geprüft …“, bis er die Seite neu lädt — dasselbe Muster wie H12 beim
 * Anmeldeformular. Acht Sekunden sind großzügig für eine Zählabfrage und
 * kurz genug, um als Antwort durchzugehen.
 */
const GRENZE_MS = 8_000

async function mitGrenze<T>(arbeit: Promise<T>): Promise<T | "zeitueberschreitung"> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      arbeit,
      new Promise<"zeitueberschreitung">((r) => {
        timer = setTimeout(() => r("zeitueberschreitung"), GRENZE_MS)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function ergebnis(
  id: VerbindungsId,
  befund: PruefBefund,
  zustand: VerbindungsZustand,
  reichweite: Pruefergebnis["reichweite"],
  dauerMs: number | null,
  akteur: string,
): Pruefergebnis {
  const e: Pruefergebnis = { id, befund, zustand, reichweite, at: Date.now(), dauerMs, akteur }
  protokoll.set(id, e)
  return e
}

/**
 * Prüft eine Fähigkeit — und schreibt dabei nichts in fremde Systeme.
 *
 * Ausdrücklich lesend: `list({ limit: 1 })` und `summary()` sind seit
 * ADM-02 · H1 nebenwirkungsfrei. Eine Prüfung, die eine Probe-Anfrage
 * anlegt, um den Weg zu beweisen, hinterlässt genau das — eine Probe-Anfrage
 * in echten Kundendaten.
 */
export async function verbindungPruefen(
  id: VerbindungsId,
  akteur = "owner",
): Promise<Pruefergebnis> {
  const start = Date.now()

  if (id === "website-anfrage") {
    const store = getLeadStore()
    if (!store) return ergebnis(id, "nicht-eingerichtet", "NOT_CONFIGURED", "gemessen", null, akteur)
    const antwort = await mitGrenze(
      store.list({ limit: 1 }).then(
        () => "ok" as const,
        () => "fehler" as const,
      ),
    )
    const dauer = Date.now() - start
    return antwort === "ok"
      ? ergebnis(id, "erreichbar", "CONNECTED", "gemessen", dauer, akteur)
      : ergebnis(id, "nicht-erreichbar", "ERROR", "gemessen", dauer, akteur)
  }

  if (id === "manuelle-anfrage") {
    const store = getVertriebStore()
    if (!store) return ergebnis(id, "nicht-eingerichtet", "NOT_CONFIGURED", "gemessen", null, akteur)
    const antwort = await mitGrenze(
      store.summary().then(
        () => "ok" as const,
        () => "fehler" as const,
      ),
    )
    const dauer = Date.now() - start
    return antwort === "ok"
      ? ergebnis(id, "erreichbar", "CONNECTED", "gemessen", dauer, akteur)
      : ergebnis(id, "nicht-erreichbar", "ERROR", "gemessen", dauer, akteur)
  }

  if (id === "email-ausgang") {
    /* Kein Versand. Siehe Kopf dieser Datei. */
    const gesetzt = Boolean(process.env.RESEND_API_KEY?.trim())
    return gesetzt
      ? ergebnis(id, "schluessel-gesetzt", "CONNECTED", "konfiguration", null, akteur)
      : ergebnis(id, "nicht-eingerichtet", "NOT_CONFIGURED", "konfiguration", null, akteur)
  }

  /*
   * Der Rest ist nicht prüfbar — ein Profillink, ein fehlender Adapter.
   * Der Zustand kommt dann NICHT aus dieser Funktion, sondern bleibt der des
   * Inventars: Eine Prüfung, die nichts gemessen hat, darf einen Zustand
   * weder verbessern noch verschlechtern.
   */
  const bekannt = verbindungEintrag(id)
  return ergebnis(id, "nicht-pruefbar", bekannt?.zustand ?? "NOT_CONFIGURED", "konfiguration", null, akteur)
}
