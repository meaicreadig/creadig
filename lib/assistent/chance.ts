import "server-only"

import { findeOderLegeFirma, findeOderLegeKontakt, protokolliereStufe } from "@/lib/kundenfaden"
import type { Abfrage } from "@/lib/neon-abfrage"
import type { Uebernahme } from "@/lib/zentrale/personen"

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

  /* Selbst weiterarbeiten, ohne dass Emin etwas tun muss: Recherche + Gesprächsraum, Ergebnis kommt als Chat-Nachricht. */
  const nacharbeit = () => chanceNacharbeit(q, { oppId: id!, orgId: org.id, firma: org.name, v, naechster, datum }).catch((e) => console.error("[chance] nacharbeit", e instanceof Error ? e.message : e))
  try {
    const { after } = await import("next/server")
    after(nacharbeit)
  } catch {
    await nacharbeit()
  }

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

type Fund = { website?: string | null; strasse?: string | null; plz?: string | null; ort?: string | null; telefon?: string | null; branche?: string | null }

/**
 * Jonas (Recherche) und Selin (Gesprächsraum) arbeiten nach – im Hintergrund,
 * Ergebnis als Chat-Nachricht mit Übernahme-Kästen. Nur belegte Angaben (mit
 * Quelle); was die Recherche nicht findet, bleibt leer.
 */
export async function chanceNacharbeit(
  q: Abfrage,
  a: { oppId: string; orgId: string; firma: string; v: NeueChance; naechster: string; datum: string },
): Promise<void> {
  const ergebnisse: Uebernahme[] = []

  /* 1 · Recherche */
  const r = await recherchiereFirma(q, a.orgId, a.firma, a.v.ort, a.v.website)
  ergebnisse.push(r)

  /* 2 · Gesprächsraum: das Standgespräch als Gespräch am Kontakt */
  try {
    const { legeKontaktAn, speichereGespraech } = await import("@/lib/gespraech")
    const kontaktId = await legeKontaktAn({ name: a.v.ansprechpartner || a.firma, phone: a.v.telefon ?? null, email: a.v.email ?? null, firma: a.firma })
    if (kontaktId) {
      await q(`UPDATE opportunities SET contact_id = coalesce(contact_id, $2) WHERE id = $1`, [a.oppId, kontaktId]).catch(() => null)
      await speichereGespraech(
        {
          kontaktId,
          dauerSek: 600,
          abschnitte: { ausgangslage: a.v.wieKennengelernt, bedarf: a.v.bedarf, ...(a.v.bisherGetan ? { notiz: a.v.bisherGetan } : {}) },
          interessen: [],
          folge: a.naechster,
          folgeAm: a.datum,
          folgeUm: null,
          sprache: "de",
        },
        "chat",
      )
      ergebnisse.push({ agent: "gespraech", was: `Gespräch mit ${a.v.ansprechpartner || a.firma} im Gesprächsraum abgelegt`, stand: "erledigt" })
    }
  } catch (e) {
    console.error("[chance] gespraech", e instanceof Error ? e.message : e)
    ergebnisse.push({ agent: "gespraech", was: "Gespräch konnte nicht abgelegt werden – bitte einmal im Gesprächsraum nachtragen", stand: "wartet" })
  }

  const { speichereNachricht } = await import("./store")
  await speichereNachricht("assistant", `Nacharbeit zu **${a.firma}** ist fertig.`, ergebnisse)
  const { revalidatePath } = await import("next/cache")
  try {
    revalidatePath("/admin/assistent")
  } catch {}
}

const RECHERCHE_MARKE = "Recherche (KI,"

/**
 * Jonas recherchiert eine Firma: nur belegte Angaben (mit Quelle) gehen in die
 * Firma. Scheitert der Dienst, steht das ehrlich da („wartet“) – nie „nichts
 * gefunden“ – und der tägliche Nachlauf (recherchiereOffene) versucht es neu.
 */
export async function recherchiereFirma(q: Abfrage, orgId: string, firma: string, ort?: string | null, website?: string | null): Promise<Uebernahme> {
  const { mitAgent } = await import("@/lib/lernen/kontext")
  const { recherchiere, json, MODELL } = await import("@/lib/agenten/ki")
  const { generateText } = await import("ai")
  let fund: Fund | null = null
  let quellen = ""
  try {
    const roh = await mitAgent("vertrieb", () =>
      recherchiere(`Betrieb „${firma}“${ort ? ` in ${ort}` : ""}${website ? ` (${website})` : ""}: offizielle Website, Anschrift (Straße, PLZ, Ort), Telefon, was der Betrieb macht (Branche, Sortiment).`),
    )
    if (roh) {
      quellen = roh
      const { text } = await generateText({
        model: MODELL,
        prompt: `Ziehe aus diesen Rechercheergebnissen NUR belegte Angaben zu „${firma}“ heraus. Unsicheres = null.\n${roh}\n\nAntworte nur mit JSON: {"website": string|null, "strasse": string|null, "plz": string|null, "ort": string|null, "telefon": string|null, "branche": string|null}`,
      })
      fund = json<Fund>(text)
    }
  } catch (e) {
    console.error("[chance] recherche", e instanceof Error ? e.message : e)
    return { agent: "recherche", was: `Recherche zu ${firma} gerade nicht erreichbar – versucht es beim nächsten Tageslauf neu`, stand: "wartet", bis: "morgen" }
  }
  const stempel = `${RECHERCHE_MARKE} ${new Date().toLocaleDateString("de-DE")})`
  if (fund && Object.values(fund).some(Boolean)) {
    const anschrift = [fund.strasse, [fund.plz, fund.ort].filter(Boolean).join(" ")].filter(Boolean).join(", ")
    const zeilen = [
      fund.branche ? `Branche: ${fund.branche}` : null,
      anschrift ? `Anschrift: ${anschrift}` : null,
      fund.telefon ? `Telefon: ${fund.telefon}` : null,
      fund.website ? `Website: ${fund.website}` : null,
    ].filter(Boolean) as string[]
    const url = fund.website && !/^https?:\/\//i.test(fund.website) ? `https://${fund.website}` : fund.website ?? null
    await q(
      `UPDATE organisations SET website = coalesce(website, $2), city = coalesce(city, $3), updated_at = now(),
         note = concat_ws(E'\n\n', nullif(note,''), $4::text) WHERE id = $1`,
      [orgId, url, fund.ort ?? null, `${stempel}:\n${zeilen.join("\n")}\nQuellen:\n${quellen.slice(0, 1500)}`],
    ).catch(() => null)
    return { agent: "recherche", was: `${firma}: ${zeilen.join(" · ")}`, stand: "erledigt" }
  }
  await q(`UPDATE organisations SET note = concat_ws(E'\n\n', nullif(note,''), $2::text) WHERE id = $1`, [orgId, `${stempel}: nichts Belegtes gefunden.`]).catch(() => null)
  return { agent: "recherche", was: `Zu ${firma} nichts Belegtes im Netz – Website/Adresse bitte im Gespräch erfragen`, stand: "erledigt" }
}

/** Täglich (Ideenwerkstatt): neue persönliche Chancen, deren Firma noch nie recherchiert wurde. */
export async function recherchiereOffene(q: Abfrage): Promise<Uebernahme[]> {
  const offen = (await q(
    `SELECT DISTINCT g.id, g.name, g.city, g.website FROM opportunities o JOIN organisations g ON g.id = o.organisation_id
      WHERE o.source = 'persoenlich' AND o.created_at > now() - interval '30 days' AND o.status NOT IN ('won','lost')
        AND coalesce(g.note, '') NOT LIKE '%' || $1 || '%' LIMIT 5`,
    [RECHERCHE_MARKE],
  ).catch(() => [])) as { id: string; name: string; city: string | null; website: string | null }[]
  const liste: Uebernahme[] = []
  for (const o of offen) {
    const r = await recherchiereFirma(q, o.id, o.name, o.city, o.website)
    if (r.stand === "erledigt") liste.push(r)
  }
  return liste
}
