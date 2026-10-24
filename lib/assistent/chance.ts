import "server-only"

import { findeOderLegeFirma, findeOderLegeKontakt, protokolliereStufe } from "@/lib/kundenfaden"
import type { Abfrage } from "@/lib/neon-abfrage"

/**
 * Neue Chance aus dem Chat (24.10.2026).
 *
 * Emin erzählte dem Chief of Staff ein Standgespräch (Aymarkt Osnabrück) –
 * der antwortete „ich lege jetzt einen Lead an“ und tat nichts: Er hatte nur
 * `absprache_speichern`, und das kennt nur BESTEHENDE Chancen. Jetzt legt ein
 * Satz im Chat die ganze Kette an und übergibt sie:
 *
 *   Firma (+ Kontakt, wenn Mail bekannt) → Chance mit nächstem Schritt und
 *   Datum → Chronik → Gesprächsvorbehalt (kein Angebot vor dem Termin) →
 *   Auftrag an den Vertrieb (Termin nachhalten) → Ereignis für den Motor.
 *
 * Zuständig ist danach der Vertrieb – das sagt der Chat Emin auch so.
 */

export type NeueChance = {
  firma: string
  ort?: string
  website?: string
  ansprechpartner?: string
  telefon?: string
  email?: string
  bedarf: string
  wieKennengelernt: string
  bisherGetan?: string
  naechsterSchritt?: string
  datum?: string
}

const plusTage = (n: number) => new Date(Date.now() + n * 864e5).toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" })

export async function legeChanceAn(q: Abfrage, v: NeueChance) {
  const stempel = new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeZone: "Europe/Berlin" }).format(new Date())
  const notiz = [
    `${stempel} (Chat, Emin): ${v.wieKennengelernt}`,
    `Bedarf: ${v.bedarf}`,
    v.ansprechpartner ? `Ansprechpartner: ${v.ansprechpartner}${v.telefon ? `, Tel./WhatsApp ${v.telefon}` : ""}` : v.telefon ? `Tel./WhatsApp: ${v.telefon}` : null,
    v.bisherGetan ? `Bisher: ${v.bisherGetan}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  const org = await findeOderLegeFirma(q, { name: v.firma.trim(), website: v.website ?? null, city: v.ort ?? null, note: notiz })
  const kontaktId = v.email
    ? ((await findeOderLegeKontakt(q, { email: v.email, name: v.ansprechpartner ?? null, firma: v.firma, website: v.website ?? null }).catch(() => null))?.kontaktId ?? null)
    : null
  const naechster = v.naechsterSchritt?.trim() || "Termin für das Erstgespräch festmachen (Terminvorschlag ist raus)"
  const datum = v.datum ?? plusTage(3)

  /* Gibt es schon eine offene Chance bei dieser Firma, wird sie ergänzt statt verdoppelt. */
  const [alt] = (await q(
    `SELECT id, title FROM opportunities WHERE organisation_id = $1 AND status NOT IN ('won','lost') ORDER BY updated_at DESC LIMIT 1`,
    [org.id],
  )) as { id: string; title: string }[]
  let id = alt?.id
  if (id) {
    await q(
      `UPDATE opportunities SET next_action = $2, next_action_at = $3::date, last_contact_at = now(), updated_at = now(),
         contact_id = coalesce(contact_id, $4), note = concat_ws(E'\n\n', nullif(note,''), $5::text) WHERE id = $1`,
      [id, naechster, datum, kontaktId, notiz],
    )
  } else {
    id = `opp-${crypto.randomUUID().slice(0, 8)}`
    await q(
      `INSERT INTO opportunities (id, organisation_id, contact_id, title, status, source, next_action, next_action_at, last_contact_at, note, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'contacted', 'persoenlich', $5, $6::date, now(), $7, now(), now())`,
      [id, org.id, kontaktId, v.bedarf.slice(0, 160), naechster, datum, notiz],
    )
    await protokolliereStufe(q, org.id, id, null, "contacted", `Im Chat erfasst: ${v.wieKennengelernt}`.slice(0, 300), undefined, { actor: "emin", origin: "MANUAL" }).catch(() => null)
  }

  /* Erst Gespräch, dann Angebot: Kein Agent legt vor dem Termin Angebot, Rechnung oder Nachfassmail an. */
  const { stelleZurueck } = await import("@/lib/ausfuehrung/vorbehalt")
  await stelleZurueck(q, id, `Erst Gespräch mit ${v.ansprechpartner ?? v.firma}: ${naechster}`, plusTage(30)).catch(() => null)

  const { legeAuftragAn } = await import("@/lib/koordination/koordinator")
  const auftrag = await legeAuftragAn({
    von: "assistent",
    an: "vertrieb",
    titel: `Neue Chance: ${org.name} – ${naechster}`.slice(0, 160),
    inhalt: [
      notiz,
      "",
      `Nächster Schritt: ${naechster} (bis ${datum}).`,
      "Aufgabe Vertrieb: Termin nachhalten. Kommt bis zum Datum keine Antwort, Emin eine kurze WhatsApp-Erinnerung als Text vorschlagen (er schickt sie selbst). Ist der Termin fix: als Termin eintragen und ein Gesprächs-Briefing vorbereiten (Was ist der Betrieb, was könnte die App leisten, welche Fragen stellen). Kein Angebot vor dem Gespräch.",
    ].join("\n"),
    quelle: `chance:${id}`,
  }).catch(() => null)

  await q(`DELETE FROM admin_briefing WHERE tag = (now() AT TIME ZONE 'Europe/Berlin')::date`, []).catch(() => null)
  const { ereignis } = await import("@/lib/motor/ereignis")
  await ereignis("gespraech_notiert", {
    kontaktId,
    subjekt: `opportunity:${id}`,
    daten: { wer: "emin", firma: org.name, quelle: "chat" },
    schluessel: `gespraech_notiert:${id}:${stempel}`,
  }).catch(() => null)

  return {
    angelegt: true,
    firma: org.name,
    firmaNeu: org.neu,
    chance: alt ? `bestehende Chance ergänzt: ${alt.title}` : `neue Chance: ${v.bedarf.slice(0, 80)}`,
    naechsterSchritt: naechster,
    bis: datum,
    zustaendig: "Vertrieb",
    auftragAnVertrieb: Boolean(auftrag),
    vorbehalt: "Kein Angebot vor dem Gespräch",
  }
}
