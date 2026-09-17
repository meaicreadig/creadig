/**
 * ADM-04 · DER PRÜFSTAND — ein Testanbieter im Arbeitsspeicher
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM ES IHN GIBT
 *
 * Die Abnahmeszenarien A15–A18 verlangen Verhalten, das kein echter Kanal
 * dieses Hauses heute zeigen kann: verbinden, widerrufen, denselben Webhook
 * zweimal bekommen, einen Anbieterfehler sehen. Ohne LinkedIn-Freigabe gäbe
 * es zwei Auswege — warten (dann ist das Verbindungsmodell nie geprüft) oder
 * behaupten (dann ist es geprüft und trotzdem falsch).
 *
 * Der eingefrorene Abnahmeumfang wählt den dritten: ein ausdrücklich
 * markierter Testanbieter. Er beweist das MODELL, nicht den Anbieter — und
 * er sagt das auf jeder Fläche, auf der er erscheint.
 *
 *   A15  Verbinden / Widerrufen        → ehrlicher Zustand, keine Zombie-Erlaubnis
 *   A16  Doppelter Webhook             → genau eine Wirkung (Idempotenz)
 *   A17  Anbieterfehler                → DEGRADED, kein stiller Erfolg
 *   A18  Fähigkeit ≠ Token ≠ Profil    → drei getrennte Antworten
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS ER NICHT IST
 *
 * Kein OAuth, keine echte API, keine Zeile in Neon. Der Zustand lebt im
 * Arbeitsspeicher DIESER Instanz und ist nach einem Neustart weg — das ist
 * kein Mangel, sondern die Zusage: Ein Prüfstand, der etwas hinterlässt,
 * wäre irgendwann eine Demo-Zeile in echten Owner-Daten.
 *
 * `pruefstandAktiv()` (in `lib/verbindungen.ts`) entscheidet, ob er überhaupt
 * sichtbar ist: ausdrückliches `VERBINDUNG_FIXTURE=an` UND keine
 * Produktionsumgebung.
 */

import type { VerbindungsZustand } from "@/lib/verbindungen"

export const FIXTURE_ARTEN = ["connect", "revoke", "webhook", "provider_error"] as const
export type FixtureArt = (typeof FIXTURE_ARTEN)[number]

export type FixtureEreignis = {
  id: string
  art: FixtureArt
  /** Der Idempotenzschlüssel des Ereignisses — `null`, wo keiner gilt. */
  schluessel: string | null
  at: number
  /** Maschinenwert; die Anzeige übersetzt ihn (DE/TR). */
  wirkung: FixtureWirkung
  /** Wer ausgelöst hat — Rolle, wie in der Chronik des Vertriebs (ADM-03). */
  akteur: string
}

export const FIXTURE_WIRKUNGEN = [
  "verbunden",
  "widerrufen",
  "angewendet",
  "idempotent",
  "abgelehnt",
  "anbieterfehler",
] as const
export type FixtureWirkung = (typeof FIXTURE_WIRKUNGEN)[number]

type FixtureStand = {
  zustand: VerbindungsZustand
  token: string | null
  /** Verarbeitete Webhook-Schlüssel — Doppelte erzeugen keine zweite Wirkung. */
  verarbeitet: Set<string>
  ereignisse: FixtureEreignis[]
  /** Fachliche Wirkung: wie oft der Kanal wirklich etwas ausgelöst hat. */
  wirkungen: number
}

const leer = (): FixtureStand => ({
  zustand: "NOT_CONFIGURED",
  token: null,
  verarbeitet: new Set(),
  ereignisse: [],
  wirkungen: 0,
})

let stand: FixtureStand = leer()

/** Die jüngsten Ereignisse zuerst; älter als 50 interessiert niemanden. */
const HISTORIE_MAX = 50

function notiere(
  art: FixtureArt,
  schluessel: string | null,
  wirkung: FixtureWirkung,
  akteur: string,
): FixtureEreignis {
  const e: FixtureEreignis = {
    id: `fx-${stand.ereignisse.length + 1}`,
    art,
    schluessel,
    at: Date.now(),
    wirkung,
    akteur,
  }
  stand.ereignisse.unshift(e)
  if (stand.ereignisse.length > HISTORIE_MAX) stand.ereignisse.length = HISTORIE_MAX
  return e
}

export function fixtureZuruecksetzen(): void {
  stand = leer()
}

export type FixtureStandAnsicht = {
  zustand: VerbindungsZustand
  verbunden: boolean
  tokenGesetzt: boolean
  /** Verschiedene Webhook-Schlüssel, die eine Wirkung ausgelöst haben. */
  webhooksVerarbeitet: number
  /** Ausgelöste Geschäftswirkungen — muss gleich `webhooksVerarbeitet` sein. */
  wirkungen: number
  letzteWirkung: FixtureWirkung | null
  ereignisse: FixtureEreignis[]
}

export function fixtureStand(): FixtureStandAnsicht {
  return {
    zustand: stand.zustand,
    verbunden: stand.zustand === "CONNECTED",
    tokenGesetzt: stand.token !== null,
    webhooksVerarbeitet: stand.verarbeitet.size,
    wirkungen: stand.wirkungen,
    letzteWirkung: stand.ereignisse[0]?.wirkung ?? null,
    ereignisse: [...stand.ereignisse],
  }
}

export type FixtureAntwort = {
  ok: boolean
  /** Ob DIESER Aufruf eine neue Wirkung hatte. Wiederholung: `false`. */
  neu: boolean
  zustand: VerbindungsZustand
  wirkung: FixtureWirkung
}

/**
 * A15 — Verbinden.
 *
 * Idempotent: Zweimal verbinden ist kein zweiter Kanal. Der zweite Aufruf
 * meldet `neu: false` und lässt den bestehenden Token stehen; ein neu
 * ausgestellter Token würde eine laufende Autorisierung ersetzen, ohne dass
 * jemand darum gebeten hat.
 */
export function fixtureVerbinden(akteur = "system", token = "pruefstand-token"): FixtureAntwort {
  if (stand.zustand === "CONNECTED" && stand.token) {
    notiere("connect", null, "idempotent", akteur)
    return { ok: true, neu: false, zustand: stand.zustand, wirkung: "idempotent" }
  }
  stand.token = token
  stand.zustand = "CONNECTED"
  notiere("connect", null, "verbunden", akteur)
  return { ok: true, neu: true, zustand: stand.zustand, wirkung: "verbunden" }
}

/**
 * A15/A16 — Widerrufen.
 *
 * Der Token verschwindet, UND die Liste verarbeiteter Schlüssel wird
 * geleert: Eine widerrufene Verbindung soll nach einem neuen Verbinden nicht
 * stillschweigend an die alte Ereignisgeschichte anknüpfen. Was danach
 * kommt, ist eine neue Erlaubnis.
 */
export function fixtureWiderrufen(akteur = "system"): FixtureAntwort {
  if (stand.zustand !== "CONNECTED" && !stand.token) {
    notiere("revoke", null, "idempotent", akteur)
    return { ok: true, neu: false, zustand: stand.zustand, wirkung: "idempotent" }
  }
  stand.token = null
  stand.zustand = "REVOKED"
  stand.verarbeitet.clear()
  notiere("revoke", null, "widerrufen", akteur)
  return { ok: true, neu: true, zustand: stand.zustand, wirkung: "widerrufen" }
}

/**
 * A16 — Webhook. Derselbe Schlüssel zweimal → eine Wirkung.
 *
 * Und A15 in der anderen Richtung: Ohne gültige Erlaubnis wird nichts
 * angewendet. Der Zustand bleibt `REVOKED`, wenn er widerrufen war — ein
 * abgelehnter Webhook ist kein Anbieterfehler, sondern die Sperre, die
 * funktioniert hat.
 */
export function fixtureWebhook(schluessel: string, akteur = "system"): FixtureAntwort {
  if (stand.zustand !== "CONNECTED" || !stand.token) {
    if (stand.zustand !== "REVOKED") stand.zustand = "ERROR"
    notiere("webhook", schluessel, "abgelehnt", akteur)
    return { ok: false, neu: false, zustand: stand.zustand, wirkung: "abgelehnt" }
  }
  if (stand.verarbeitet.has(schluessel)) {
    notiere("webhook", schluessel, "idempotent", akteur)
    return { ok: true, neu: false, zustand: stand.zustand, wirkung: "idempotent" }
  }
  stand.verarbeitet.add(schluessel)
  stand.wirkungen++
  notiere("webhook", schluessel, "angewendet", akteur)
  return { ok: true, neu: true, zustand: stand.zustand, wirkung: "angewendet" }
}

/**
 * A17 — Der Anbieter meldet eine Störung.
 *
 * `DEGRADED` und nicht `ERROR`: Die Erlaubnis gilt weiter, die Gegenstelle
 * antwortet nur gerade nicht. Der Token bleibt deshalb stehen — ihn hier
 * wegzuwerfen hieße, den Owner nach jeder Anbieterstörung neu autorisieren
 * zu lassen.
 */
export function fixtureAnbieterFehler(
  akteur = "system",
  meldung = "provider_unavailable",
): FixtureAntwort & { meldung: string } {
  stand.zustand = "DEGRADED"
  notiere("provider_error", null, "anbieterfehler", akteur)
  return { ok: false, neu: true, zustand: stand.zustand, wirkung: "anbieterfehler", meldung }
}

/**
 * A18 — Der Capability-Schnitt, dreimal getrennt gefragt.
 *
 * `profilLink` ist hier hart `null`, und das ist der Punkt: Der Prüfstand
 * KÖNNTE eine Adresse führen, und sie würde trotzdem nichts über seine
 * Fähigkeit aussagen.
 */
export function fixtureCapabilitySchnitt(): {
  faehigkeitAktiv: boolean
  autorisierungVorhanden: boolean
  profilLink: string | null
} {
  return {
    faehigkeitAktiv: stand.zustand === "CONNECTED",
    autorisierungVorhanden: stand.token !== null,
    profilLink: null,
  }
}
