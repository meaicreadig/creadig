"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { finanzBasis } from "@/lib/finanz/basis"
import { finanzDb, protokolliere } from "@/lib/finanz/store"
import { istGeschaeftsfeld } from "@/lib/finanz/belege"
import { EINHEITEN, formatEuro, heuteBerlin, naechsteMahnstufe, tageZwischen, UST_SAETZE, type Entwurf, type Kunde, type Position } from "@/lib/finanz/auftraege/rechnen"
import {
  auftraegeSchema,
  beantworteAngebot,
  bezahltCent,
  erfasseZahlung,
  FIRMA_STANDARD,
  ladeDokument,
  legeEntwurfAn,
  markiereBezahlt,
  neueVersion,
  rechnungAusAngebot,
  schreibeFest,
  speichereEntwurf,
  speichereFirma,
  storniere,
  vermerkeNachfass,
  verwerfeEntwurf,
  type Firma,
} from "@/lib/finanz/auftraege/store"
import { sendeDokumentMail, type MailArt } from "@/lib/finanz/auftraege/mail"
import { erzeugeXRechnung } from "@/lib/finanz/auftraege/erechnung"
import { ladeFirma, type Dokument } from "@/lib/finanz/auftraege/store"
import { entwerfeMahnung } from "@/lib/finanz/assistent"

/** Rechnungen gehen immer mit XRechnung-XML raus, sobald alle Angaben dafür vorliegen. */
async function eRechnungAnhang(db: Awaited<ReturnType<typeof zugang>>, d: Dokument) {
  if (d.art !== "rechnung") return undefined
  const { firma, ustPflichtig } = await ladeFirma(db)
  const e = erzeugeXRechnung(d, firma, ustPflichtig)
  return e.ok ? { dateiname: e.dateiname, inhalt: e.xml } : undefined
}

async function zugang() {
  const z = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (z.verdict !== "ok" || z.rolle !== "owner") throw new Error("Nicht berechtigt")
  const db = await finanzDb()
  if (!db) throw new Error("Kein Speicher verbunden")
  await auftraegeSchema(db)
  return db
}

const neu = () => revalidatePath("/finanz", "layout")
const ISO = /^\d{4}-\d{2}-\d{2}$/
const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")
const zahl = (v: unknown, min: number, max: number, std: number) => {
  const n = Number(v)
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : std
}

export type Ergebnis = { ok: true; hinweis?: string } | { ok: false; fehler: string[] }

/* ------------------------------------------------------------------------ */

export async function neuerEntwurf(form: FormData): Promise<void> {
  const db = await zugang()
  const art = form.get("art") === "rechnung" ? "rechnung" : "angebot"
  const id = await legeEntwurfAn(db, art)
  redirect(`${await finanzBasis()}/vorgang/${id}`)
}

function saubererKunde(k: Partial<Kunde> | undefined): Kunde {
  return {
    name: s(k?.name, 120),
    firma: s(k?.firma, 160),
    strasse: s(k?.strasse, 160),
    plzOrt: s(k?.plzOrt, 120),
    land: /^[A-Z]{2}$/.test(String(k?.land ?? "")) ? String(k?.land) : "DE",
    email: s(k?.email, 200).toLowerCase(),
    ustId: s(k?.ustId, 30).replace(/\s/g, "").toUpperCase(),
  }
}

function sauberePosition(p: Partial<Position>, istRechnung: boolean): Position | null {
  const titel = s(p.titel, 200)
  if (!titel) return null
  const preis = Math.round(zahl(p.preisCent, -100_000_000_00, 100_000_000_00, 0))
  const satz = UST_SAETZE.includes(Number(p.ustSatz) as 19) ? Number(p.ustSatz) : 19
  return {
    titel,
    beschreibung: s(p.beschreibung, 2000),
    menge: Math.round(zahl(p.menge, 0, 1_000_000, 1) * 1000) / 1000,
    einheit: EINHEITEN.includes(p.einheit as "Stück") ? String(p.einheit) : "Pauschal",
    preisCent: preis,
    ustSatz: satz,
    optional: istRechnung ? false : Boolean(p.optional),
    gewaehlt: false,
  }
}

export async function entwurfSpeichern(id: string, roh: Entwurf): Promise<Ergebnis> {
  const db = await zugang()
  const d = await ladeDokument(db, id)
  if (!d || d.status !== "entwurf") return { ok: false, fehler: ["Nur Entwürfe können bearbeitet werden."] }
  const istRechnung = d.art === "rechnung"
  const positionen = (Array.isArray(roh.positionen) ? roh.positionen : []).slice(0, 80).map((p) => sauberePosition(p, istRechnung)).filter(Boolean) as Position[]
  const datum = ISO.test(String(roh.datum)) ? roh.datum : heuteBerlin()
  const e: Entwurf = {
    sprache: roh.sprache === "en" ? "en" : roh.sprache === "tr" ? "tr" : "de",
    titel: s(roh.titel, 160),
    kunde: saubererKunde(roh.kunde),
    datum,
    gueltigBis: !istRechnung && roh.gueltigBis && ISO.test(roh.gueltigBis) && roh.gueltigBis >= datum ? roh.gueltigBis : null,
    zahlungszielTage: Math.round(zahl(roh.zahlungszielTage, 0, 120, 14)),
    leistungszeitraum: s(roh.leistungszeitraum, 120),
    einleitung: s(roh.einleitung, 3000),
    schluss: s(roh.schluss, 3000),
    rabattProzent: Math.round(zahl(roh.rabattProzent, 0, 100, 0) * 100) / 100,
    geschaeftsfeld: istGeschaeftsfeld(String(roh.geschaeftsfeld)) ? roh.geschaeftsfeld : "digitalprodukte",
    positionen,
  }
  const ok = await speichereEntwurf(db, id, e)
  neu()
  return ok ? { ok: true, hinweis: "Gespeichert." } : { ok: false, fehler: ["Speichern fehlgeschlagen."] }
}

export async function entwurfSenden(id: string, roh: Entwurf): Promise<Ergebnis> {
  const gespeichert = await entwurfSpeichern(id, roh)
  if (!gespeichert.ok) return gespeichert
  const db = await zugang()
  const fest = await schreibeFest(db, id)
  if (!fest.ok) return fest
  const mail = await sendeDokumentMail(fest.dok, "versand", await eRechnungAnhang(db, fest.dok))
  await protokolliere(db, "dokument_versendet", { id, nummer: fest.dok.nummer, mail: mail.ok })
  neu()
  if (!mail.ok) return { ok: true, hinweis: `${fest.dok.nummer} ist festgeschrieben, aber die Mail ging nicht raus: ${mail.grund} Den Kundenlink kannst du manuell schicken.` }
  return { ok: true, hinweis: `${fest.dok.nummer} an ${fest.dok.kunde.email} gesendet.` }
}

export async function entwurfVerwerfen(form: FormData): Promise<void> {
  const db = await zugang()
  const id = s(form.get("id"), 64)
  const d = await ladeDokument(db, id)
  await verwerfeEntwurf(db, id)
  neu()
  redirect(`${await finanzBasis()}/${d?.art === "rechnung" ? "rechnungen" : "angebote"}`)
}

export async function versionAnlegen(form: FormData): Promise<void> {
  const db = await zugang()
  const id = await neueVersion(db, s(form.get("id"), 64))
  neu()
  if (id) redirect(`${await finanzBasis()}/vorgang/${id}`)
}

export async function inhaberAntwort(form: FormData): Promise<void> {
  const db = await zugang()
  const id = s(form.get("id"), 64)
  const antwort = form.get("antwort") === "abgelehnt" ? "abgelehnt" : "angenommen"
  const ok = await beantworteAngebot(db, id, { antwort, name: s(form.get("name"), 120) || "mündlich", text: s(form.get("text"), 1000), quelle: "inhaber", gewaehlt: [] })
  if (ok && antwort === "angenommen") {
    const d = await ladeDokument(db, id)
    if (d) await sendeDokumentMail(d, "bestaetigung")
  }
  neu()
}

export async function rechnungErstellen(form: FormData): Promise<void> {
  const db = await zugang()
  const pz = Number(form.get("anzahlung"))
  const id = await rechnungAusAngebot(db, s(form.get("id"), 64), Number.isFinite(pz) && pz > 0 && pz < 100 ? pz : null)
  neu()
  if (id) redirect(`${await finanzBasis()}/vorgang/${id}`)
}

export async function bezahltMarkieren(form: FormData): Promise<void> {
  const db = await zugang()
  const am = s(form.get("am"), 10)
  await markiereBezahlt(db, s(form.get("id"), 64), ISO.test(am) ? am : heuteBerlin())
  neu()
}

/** Teilzahlung von Hand erfassen (Phase 6) — derselbe Weg, den auch der Bank-Abgleich benutzt (erfasseZahlung()). */
export async function teilzahlungErfassen(_prev: Ergebnis | null, form: FormData): Promise<Ergebnis> {
  const db = await zugang()
  const am = s(form.get("am"), 10)
  const r = await erfasseZahlung(db, s(form.get("id"), 64), cent(form.get("betrag")), ISO.test(am) ? am : heuteBerlin(), "manuell", null)
  neu()
  if (!r.ok) return { ok: false, fehler: [r.fehler] }
  return {
    ok: true,
    hinweis: r.stand.ueberzahlt
      ? `Zahlung erfasst — ${formatEuro(-r.stand.offenCent)} zu viel eingegangen. Das ist ein Vorgang, keine Rundung.`
      : r.stand.status === "bezahlt"
        ? "Zahlung erfasst — die Rechnung ist jetzt vollständig bezahlt."
        : `Zahlung erfasst — noch ${formatEuro(r.stand.offenCent)} offen.`,
  }
}

export async function stornieren(form: FormData): Promise<void> {
  const db = await zugang()
  const sid = await storniere(db, s(form.get("id"), 64), s(form.get("grund"), 300))
  if (sid) {
    const st = await ladeDokument(db, sid)
    if (st) await sendeDokumentMail(st, "versand")
  }
  neu()
  if (sid) redirect(`${await finanzBasis()}/vorgang/${sid}`)
}

/** Nachfrage (Angebot) bzw. nächste Mahnstufe (Rechnung) — Regel bestimmt die Stufe, nicht die Oberfläche. */
export async function nachfassen(id: string): Promise<Ergebnis> {
  const db = await zugang()
  const d = await ladeDokument(db, id)
  if (!d || (d.status !== "versendet" && d.status !== "teilbezahlt")) return { ok: false, fehler: ["Nur offene Dokumente."] }
  let art: MailArt = "nachfrage"
  let stufe: number | null = null
  if (d.art === "rechnung") {
    const tage = d.faelligAm ? tageZwischen(d.faelligAm, heuteBerlin()) : -1
    const n = naechsteMahnstufe(tage, d.mahnstufe)
    if (!n) return { ok: false, fehler: ["Für diese Rechnung ist gerade keine Mahnstufe fällig."] }
    art = `mahnung_${n}` as MailArt
    stufe = n
  }
  const offenCent = d.status === "teilbezahlt" && d.summen ? d.summen.bruttoCent - (await bezahltCent(db, id)) : d.summen?.bruttoCent
  const mahnDokument = d.summen && offenCent !== undefined ? { ...d, summen: { ...d.summen, bruttoCent: offenCent } } : d
  const r = await sendeDokumentMail({ ...mahnDokument, mahnstufe: stufe ?? d.mahnstufe }, art)
  if (!r.ok) return { ok: false, fehler: [r.grund] }
  await vermerkeNachfass(db, id, stufe)
  neu()
  return { ok: true, hinweis: stufe ? ["", "Zahlungserinnerung", "1. Mahnung", "2. Mahnung"][stufe] + " gesendet." : "Nachfrage gesendet." }
}

export async function erneutSenden(id: string): Promise<Ergebnis> {
  const db = await zugang()
  const d = await ladeDokument(db, id)
  if (!d || d.status === "entwurf" || !d.token) return { ok: false, fehler: ["Noch nicht versendet."] }
  const r = await sendeDokumentMail(d, "versand", await eRechnungAnhang(db, d))
  if (!r.ok) return { ok: false, fehler: [r.grund] }
  return { ok: true, hinweis: "Erneut gesendet." }
}

/* ------------------------------------------------------------------------ */
/* Leistungskatalog & Firmendaten                                            */
/* ------------------------------------------------------------------------ */

function cent(v: FormDataEntryValue | null): number {
  const t = String(v ?? "").replace(/\s|€/g, "")
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t)
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}

export async function leistungSpeichern(form: FormData): Promise<void> {
  const db = await zugang()
  const id = s(form.get("id"), 64) || crypto.randomUUID()
  const titel = s(form.get("titel"), 200)
  if (!titel) return
  const satz = Number(form.get("ust_satz"))
  const feld = s(form.get("geschaeftsfeld"), 30)
  const einheit = s(form.get("einheit"), 20)
  await db(
    `INSERT INTO fin_leistungen (id, titel, beschreibung, einheit, preis_cent, ust_satz, geschaeftsfeld, aktiv)
     VALUES ($1,$2,$3,$4,$5,$6,$7,true)
     ON CONFLICT (id) DO UPDATE SET titel=EXCLUDED.titel, beschreibung=EXCLUDED.beschreibung, einheit=EXCLUDED.einheit,
       preis_cent=EXCLUDED.preis_cent, ust_satz=EXCLUDED.ust_satz, geschaeftsfeld=EXCLUDED.geschaeftsfeld`,
    [
      id,
      titel,
      s(form.get("beschreibung"), 2000),
      EINHEITEN.includes(einheit as "Stück") ? einheit : "Pauschal",
      cent(form.get("preis")),
      [0, 7, 19].includes(satz) ? satz : 19,
      istGeschaeftsfeld(feld) ? feld : "digitalprodukte",
    ],
  )
  neu()
}

/**
 * Phase A → Phase B (AI-UGC-Video, siehe fin_leistungen-Seed in
 * auftraege/store.ts) ist ein bewusster Ein-Klick-Schritt: wird eine
 * inaktive 'content'-Leistung aktiviert, wechselt das Geschäftsfeld in
 * derselben Anweisung auf 'digitalprodukte' — kein zweiter Schritt im
 * Bearbeiten-Formular nötig. Jede andere Umschaltung (Deaktivieren, oder
 * Aktivieren außerhalb von 'content') lässt das Geschäftsfeld unverändert.
 */
export async function leistungUmschalten(form: FormData): Promise<void> {
  const db = await zugang()
  await db(
    `UPDATE fin_leistungen SET aktiv = NOT aktiv,
       geschaeftsfeld = CASE WHEN NOT aktiv AND geschaeftsfeld = 'content' THEN 'digitalprodukte' ELSE geschaeftsfeld END
     WHERE id = $1`,
    [s(form.get("id"), 64)],
  )
  neu()
}

export async function firmaSpeichern(form: FormData): Promise<void> {
  const db = await zugang()
  const f = Object.fromEntries(
    (Object.keys(FIRMA_STANDARD) as (keyof Firma)[]).map((k) => [k, s(form.get(k), 200)]),
  ) as Firma
  f.iban = f.iban.replace(/\s/g, "").toUpperCase()
  f.ustId = f.ustId.replace(/\s/g, "").toUpperCase()
  await speichereFirma(db, f)
  await protokolliere(db, "firma_gespeichert", {})
  neu()
}

export type MahnEntwurfErgebnis = { entwurf: string } | { fehler: string } | null

/**
 * Persönlicher KI-Mahnungsentwurf für einen Einzelfall (nie automatisch
 * verschickt — siehe entwerfeMahnung()). Die reguläre Mahnstufen-Vorlage
 * (nachfassen()) bleibt der Standardweg; das hier ist ein Zweites für
 * schwierige Fälle, wo ein persönlicher Ton mehr bringt als die Vorlage.
 */
export async function mahnungEntwerfen(_prev: MahnEntwurfErgebnis, form: FormData): Promise<MahnEntwurfErgebnis> {
  const db = await zugang()
  const id = s(form.get("id"), 64)
  const notiz = s(form.get("notiz"), 500)
  const d = await ladeDokument(db, id)
  if (!d || d.art !== "rechnung" || !d.summen || !d.faelligAm) return { fehler: "Rechnung nicht gefunden." }

  const offenerRestCent = d.summen.bruttoCent - (await bezahltCent(db, id))
  const tageUeberfaellig = tageZwischen(d.faelligAm, heuteBerlin())
  const r = await entwerfeMahnung({
    nummer: d.nummer ?? "",
    kunde: d.kunde.firma || d.kunde.name,
    sprache: d.sprache,
    offenerRestCent,
    tageUeberfaellig,
    mahnstufe: d.mahnstufe,
    notiz: notiz || undefined,
  })
  await protokolliere(db, "mahnung_entwurf", { id, ok: "entwurf" in r })
  return r
}
