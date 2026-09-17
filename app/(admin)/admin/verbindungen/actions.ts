"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"
import {
  PRUEFSTAND_AKTIONEN,
  VERBINDUNGS_IDS,
  pruefstandAktiv,
  type PruefstandAktion,
  type VerbindungsId,
} from "@/lib/verbindungen"
import { verbindungPruefen } from "@/lib/verbindungen-pruefung"
import {
  fixtureAnbieterFehler,
  fixtureStand,
  fixtureVerbinden,
  fixtureWebhook,
  fixtureWiderrufen,
} from "@/lib/verbindungen-fixture"

/**
 * ADM-04 — die Handlungen des Verbindungsverzeichnisses.
 *
 * ---------------------------------------------------------------------------
 * AUTORISIERUNG AM HANDLUNGSPUNKT (A6 · H8)
 *
 * `middleware.ts` bewacht `/admin/:path*`, und trotzdem prüft jede Action
 * hier noch einmal Sitzung, Widerruf und Rolle. Der Grund ist derselbe wie im
 * Vertrieb: Dass eine Server Action nur über die Adresse ihrer Seite
 * erreichbar ist, ist eine Annahme über das Routing von Next — keine Regel
 * dieses Hauses.
 *
 * Nur `owner`. Die Rolle steht in `lib/rollen.ts`, nicht hier; diese Datei
 * fragt, sie entscheidet nicht.
 *
 * ---------------------------------------------------------------------------
 * WAS EINE PRÜFUNG AUSLÖST
 *
 * Eine Leseabfrage gegen die eigene Datenbank. Kein Versand, keine Anfrage
 * an einen fremden Anbieter, keine Probe-Anfrage in echten Kundendaten.
 * Warum, steht ausführlich in `lib/verbindungen-pruefung.ts`.
 */

async function requireOwner(): Promise<string> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/verbindungen")) {
    throw new Error("Nicht berechtigt")
  }
  return zugang.rolle
}

function istVerbindungsId(v: unknown): v is VerbindungsId {
  return typeof v === "string" && (VERBINDUNGS_IDS as readonly string[]).includes(v)
}

/**
 * Eine Fähigkeit prüfen.
 *
 * Ein unbekannter Wert aus dem Formular führt zu KEINER Prüfung statt zu
 * einer erfundenen: Alles, was aus einem Browser kommt, ist eine Behauptung.
 */
export async function verbindungPruefenAction(form: FormData): Promise<void> {
  const rolle = await requireOwner()
  const id = form.get("id")
  if (!istVerbindungsId(id)) return
  await verbindungPruefen(id, rolle)
  revalidatePath("/admin/verbindungen")
}

/* ═══════════════════════════════════════════════════════════════════════════
 * DER PRÜFSTAND (A15–A18)
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Die Schlüsselwahl ist der eigentliche Beweis.
 *
 * `ereignis` leitet den Schlüssel aus dem STAND ab (`evt-<verarbeitete+1>`),
 * nicht aus einem Zufall. Das hat eine Folge, die genau richtig ist: Zwei
 * Klicks in derselben Sekunde berechnen beide denselben Schlüssel und
 * erzeugen deshalb EINE Wirkung — der Doppelklick-Schutz aus A5, hier ohne
 * Zusatzmechanik, weil die Idempotenz im Ereignis selbst steckt.
 *
 * `ereignis-gleich` schickt ausdrücklich den zuletzt verwendeten Schlüssel
 * erneut: der doppelte Webhook aus A16, wie ihn ein Anbieter nach einem
 * Zustell-Timeout schickt.
 */
function schluesselFuer(aktion: "ereignis" | "ereignis-gleich"): string {
  const stand = fixtureStand()
  if (aktion === "ereignis-gleich") {
    const letzter = stand.ereignisse.find((e) => e.art === "webhook" && e.schluessel)?.schluessel
    if (letzter) return letzter
  }
  return `evt-${stand.webhooksVerarbeitet + 1}`
}

export async function pruefstandAction(form: FormData): Promise<void> {
  const rolle = await requireOwner()
  /*
   * Die Sichtbarkeitsregel ist auch die Ausführungsregel. Ein ausgeblendeter
   * Knopf ist keine Sperre — die Adresse der Action bliebe erreichbar, und
   * ein Prüfstand, der sich in einer Produktionsumgebung auslösen lässt,
   * wäre genau die Demo-Wirkung in echten Owner-Ansichten, die dieses Haus
   * ausschliesst.
   */
  if (!pruefstandAktiv()) return

  const aktion = form.get("aktion")
  if (typeof aktion !== "string" || !(PRUEFSTAND_AKTIONEN as readonly string[]).includes(aktion)) return

  switch (aktion as PruefstandAktion) {
    case "verbinden":
      fixtureVerbinden(rolle)
      break
    case "widerrufen":
      fixtureWiderrufen(rolle)
      break
    case "ereignis":
      fixtureWebhook(schluesselFuer("ereignis"), rolle)
      break
    case "ereignis-gleich":
      fixtureWebhook(schluesselFuer("ereignis-gleich"), rolle)
      break
    case "anbieterfehler":
      fixtureAnbieterFehler(rolle)
      break
  }
  revalidatePath("/admin/verbindungen")
}
