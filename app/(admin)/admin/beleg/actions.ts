"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { darfBetreten } from "@/lib/rollen"
import { getVertriebStore } from "@/lib/lead-store"
import { RELEASE_FORMS, RELEASE_SCOPES, type ReleaseForm, type ReleaseScope } from "@/lib/proof"
import type { VertriebStore } from "@/lib/vertrieb"

/**
 * ADM-05 · A13/A14 — die Erlaubnis erfassen und zurueckziehen.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESE HANDLUNGEN UEBERHAUPT EXISTIEREN
 *
 * Die Zustimmung eines Kunden, seinen Namen oder sein Logo zu zeigen, stand
 * bis heute als Code in `lib/site-data.ts`. Erfassen hiess: committen.
 * Zurueckziehen hiess: committen und ausliefern. Ein Kunde, der anruft und
 * sagt „nehmen Sie das bitte raus", darf darauf nicht warten — und der Owner
 * soll dafuer keinen Entwickler brauchen.
 *
 * ---------------------------------------------------------------------------
 * WAS SIE AUSDRUECKLICH NICHT TUN
 *
 * Sie aendern nichts an creadig.de. Die oeffentliche Projektion liest
 * weiterhin ihre Eintraege aus dem Code (G18, gesperrt). Diese Handlungen
 * HALTEN die Erlaubnis fest; sie setzen sie nicht durch. Die Oberflaeche
 * sagt das an jeder Stelle, an der es zaehlt — eine Freigabeverwaltung, die
 * so tut, als wirke sie, waere schlimmer als gar keine.
 *
 * ---------------------------------------------------------------------------
 * AUTORISIERUNG AM HANDLUNGSPUNKT (H8)
 *
 * `/admin/beleg` ist Owner-only, und zwar nicht nur in der Navigation: Jede
 * Handlung hier fragt Sitzung, Widerruf und Rolle selbst.
 */

export type FreigabeFeld =
  | "organisation"
  | "name"
  | "rolle"
  | "firma"
  | "form"
  | "datum"
  | "umfaenge"
  | "fundstelle"

export type FreigabeZustand = {
  fehler: FreigabeFeld[]
  /** Was eingetippt war — nach einem Fehler bleibt es stehen. */
  werte: Record<string, string>
  umfaenge?: string[]
  erfasst?: "neu" | "schon-erfasst"
}

async function requireOwnerStore(): Promise<{ store: VertriebStore; rolle: string }> {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/beleg")) {
    throw new Error("Nicht berechtigt")
  }
  const store = getVertriebStore({ kennung: zugang.rolle, herkunft: "HUMAN" })
  if (!store) throw new Error("Vertriebs-Speicher nicht verfügbar")
  return { store, rolle: zugang.rolle }
}

const text = (v: FormDataEntryValue | null): string => (typeof v === "string" ? v.trim() : "")

/**
 * Eine erteilte Freigabe festhalten.
 *
 * Jedes Feld ist Pflicht, und das ist der Punkt: „Der Kunde hat zugestimmt"
 * ohne Person, Form, Datum und Fundstelle ist ein Haken, den sich jeder
 * selbst setzen kann. Ein Umfang muss gewaehlt sein — eine Zustimmung zu
 * nichts ist keine.
 */
export async function freigabeErfassen(
  _vorher: FreigabeZustand,
  form: FormData,
): Promise<FreigabeZustand> {
  const { store } = await requireOwnerStore()

  const werte = {
    organisation: text(form.get("organisation")),
    name: text(form.get("name")),
    rolle: text(form.get("rolle")),
    firma: text(form.get("firma")),
    form: text(form.get("form")),
    datum: text(form.get("datum")),
    fundstelle: text(form.get("fundstelle")),
  }
  const umfaenge = form
    .getAll("umfaenge")
    .map((v) => String(v))
    .filter((v): v is ReleaseScope => (RELEASE_SCOPES as readonly string[]).includes(v))

  const fehler: FreigabeFeld[] = []
  if (!werte.organisation) fehler.push("organisation")
  if (!werte.name) fehler.push("name")
  if (!werte.rolle) fehler.push("rolle")
  if (!werte.firma) fehler.push("firma")
  if (!(RELEASE_FORMS as readonly string[]).includes(werte.form)) fehler.push("form")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(werte.datum)) fehler.push("datum")
  if (umfaenge.length === 0) fehler.push("umfaenge")
  if (!werte.fundstelle) fehler.push("fundstelle")
  if (fehler.length > 0) return { fehler, werte, umfaenge }

  const ergebnis = await store.recordRelease({
    organisationId: werte.organisation,
    name: werte.name,
    role: werte.rolle,
    company: werte.firma,
    form: werte.form as ReleaseForm,
    grantedOn: werte.datum,
    scopes: umfaenge,
    reference: werte.fundstelle,
  })
  if (!ergebnis) return { fehler: ["organisation"], werte, umfaenge }

  revalidatePath("/admin/beleg")
  /* Leere Werte: Das Formular ist nach dem Erfassen leer, nicht vorbelegt. */
  return { fehler: [], werte: {}, erfasst: ergebnis.neu ? "neu" : "schon-erfasst" }
}

/**
 * Eine Freigabe zurueckziehen.
 *
 * Mit Grund und ohne Loeschen: Man muss spaeter erklaeren koennen, warum
 * damals etwas veroeffentlicht wurde. Ein zweiter Widerruf wirkt nicht
 * erneut — sonst stuende in der Akte, der Kunde habe zweimal widersprochen.
 */
export async function freigabeWiderrufen(id: string, form: FormData): Promise<void> {
  const { store } = await requireOwnerStore()
  const grund = text(form.get("grund"))
  if (!id || !grund) return
  await store.withdrawRelease(id, grund)
  revalidatePath("/admin/beleg")
}
