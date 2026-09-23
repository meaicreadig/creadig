import { NextResponse } from "next/server"

import { ADMIN_COOKIE, withAdminHeaders } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { auskunftDateiname, auskunftFuerKontakt } from "@/lib/auskunft"
import { getVertriebStore } from "@/lib/lead-store"

/**
 * ADM-07 · B11 — DIE AUSKUNFT ALS DATEI, NICHT ALS BILDSCHIRMSEITE.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM EINE ROUTE UND KEINE SEITE
 *
 * Eine Auskunft wird weitergegeben: an die Person, die gefragt hat, per Mail
 * oder Brief. Was dabei herauskommen muss, ist eine Datei mit einem Datum —
 * keine Seite, die man abfotografiert. Deshalb liefert diese Route JSON zum
 * Herunterladen: vollständig, maschinenlesbar, ohne Aufbereitung, die etwas
 * weglassen könnte.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DREI SPERREN, JEDE FÜR SICH
 *
 *   1 · Nur mit gültiger, nicht widerrufener Sitzung (`pruefeZugang`) — die
 *       Middleware ist nicht die einzige Sperre (H8).
 *   2 · Nur Owner. Eine Auskunft ist der vollständige Personenauszug; das
 *       ist mehr, als die tägliche Vertriebsarbeit je braucht.
 *   3 · Nur diese eine Person, benannt über ihre Kennung. Es gibt keinen
 *       Aufruf, der „alle" ausgibt — den bräuchte niemand, und er wäre die
 *       gefährlichste Adresse dieses Hauses.
 *
 * Jede Auskunft hinterlässt eine Zeile in der Akte — ohne ihren Inhalt.
 */
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]*)`))?.[1]
  const zugang = await pruefeZugang(cookie ? decodeURIComponent(cookie) : undefined, { aendernd: false })
  if (zugang.verdict !== "ok") {
    return withAdminHeaders(NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }))
  }
  if (zugang.rolle !== "owner") {
    return withAdminHeaders(NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 }))
  }

  const kontaktId = new URL(request.url).searchParams.get("kontakt")?.trim()
  if (!kontaktId) {
    return withAdminHeaders(NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 }))
  }

  const store = getVertriebStore({ kennung: zugang.rolle, herkunft: "HUMAN" })
  if (!store) {
    /* Kein Speicher heisst NICHT „keine Daten" — es heisst „nicht auskunftsfähig". */
    return withAdminHeaders(NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 }))
  }

  let auskunft
  try {
    auskunft = await auskunftFuerKontakt(store, kontaktId)
  } catch {
    return withAdminHeaders(NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 }))
  }
  if (!auskunft) {
    return withAdminHeaders(NextResponse.json({ ok: false, error: "not_found" }, { status: 404 }))
  }

  /*
   * Der Vermerk steht VOR der Auslieferung. Scheitert er, scheitert die
   * Auskunft: Eine erteilte Auskunft, von der die Akte nichts weiss, ist
   * genau die Lücke, die ein Auskunftsprotokoll schliessen soll.
   */
  await store.vermerkeAuskunft(kontaktId, auskunft.bereiche)

  const antwort = new NextResponse(JSON.stringify(auskunft, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${auskunftDateiname(kontaktId)}"`,
    },
  })
  return withAdminHeaders(antwort)
}
