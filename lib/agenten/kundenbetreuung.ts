import "server-only"

import { generateText } from "ai"

import { assistentDb, legeFreigabeAn } from "@/lib/assistent/store"
import { firmenText } from "@/lib/firmenwahrheit"
import type { Abfrage } from "@/lib/neon-abfrage"

import { json, MODELL, RECHERCHE_MODELL } from "./ki"

/**
 * KUNDENBETREUUNG (Account Management) — die Bestandskunden.
 *
 * 24.10.2026 neu: Die billigste Umsatzquelle ist der Kunde, der schon gekauft
 * hat (Wartung, Barrierefreiheit, nächstes Projekt, Empfehlung). Bis hierher
 * schaute niemand auf sie; Telekom, Glasfaser NordWest, NV SWISS standen nicht
 * einmal als Kunde im System.
 *
 * Quelle: organisations.lifecycle ('kunde' / 'ehemaliger-kunde'). Für jeden
 * Kunden ohne offene Chance und ohne Berührung seit 90 Tagen (ehemalige: 180)
 * liegt eine fertige Check-in-Mail (oder, ohne Mail, ein Brief) mit Anlass und
 * höchstens einem Angebot aus dem Leistungskatalog bei Emin – Versand erst
 * nach seinem Klick. Höchstens 3 Kunden je Lauf, jeder
 * höchstens einmal je Quartal.
 *
 * Vorher: Stammdaten. Die 19 Kunden aus dem Import vom 03.09.2026 hatten weder
 * Website noch Mail noch Anschrift („Datenlücke"). Je Lauf recherchiert die
 * Kundenbetreuung bis zu 3 davon im Impressum (Website, Anschrift, öffentliche
 * Kontakt-Mail) – nur mit Quelle, nie geraten; Unklares bleibt offen.
 */

const JE_LAUF = 3

type Kunde = {
  id: string
  name: string
  website: string | null
  city: string | null
  orgmail: string | null
  strasse: string | null
  plz: string | null
  ort: string | null
  land: string | null
  lifecycle: "kunde" | "ehemaliger-kunde"
  note: string | null
  zuletzt: string | null
  tage: number | null
  kontakt: string | null
  email: string | null
}

type Stamm = { website?: string; strasse?: string; plz?: string; ort?: string; email?: string; quelle?: string; sicher?: boolean }

/** Website und Impressumsdaten eines Kunden mit Quelle nachtragen; ohne sichere Zuordnung nichts. */
async function ergaenzeStammdaten(q: Abfrage): Promise<number> {
  const offen = (await q(
    `SELECT id, name, city, left(coalesce(note, ''), 400) AS note FROM organisations
      WHERE lifecycle IN ('kunde','ehemaliger-kunde') AND excluded_reason IS NULL AND website IS NULL
        AND coalesce(note, '') NOT LIKE '%Stammdaten-Recherche ohne sicheren Treffer%'
      ORDER BY updated_at ASC LIMIT 3`,
    [],
  )) as { id: string; name: string; city: string | null; note: string }[]
  let n = 0
  for (const k of offen) {
    const { text } = await generateText({
      model: RECHERCHE_MODELL,
      prompt: `Finde die offizielle Website und das Impressum dieser Firma/Organisation: „${k.name}“${k.city ? `, ${k.city}` : ""}. Hinweise aus unserer Kundenakte: ${k.note || "—"}
Nur wenn du sicher bist, dass es genau diese Organisation ist (Name UND Ort passen). Aus dem Impressum: Straße mit Hausnummer, PLZ, Ort, öffentliche Kontakt-E-Mail. Nichts raten.
Antworte NUR mit JSON: {"sicher":true,"website":"https://...","strasse":"","plz":"","ort":"","email":"","quelle":"URL des Impressums"}`,
    }).catch(() => ({ text: "" }))
    const s = json<Stamm>(text)
    const web = s?.sicher && s.website?.startsWith("http") ? s.website : null
    if (!web) {
      await q(`UPDATE organisations SET note = concat_ws(E'\n', nullif(note,''), $2::text), updated_at = now() WHERE id = $1`, [
        k.id,
        `Stammdaten-Recherche ohne sicheren Treffer (${new Date().toISOString().slice(0, 10)}) – bitte Website/Ansprechpartner nachtragen.`,
      ])
      continue
    }
    const mail = s?.email && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(s.email.trim()) ? s.email.trim().toLowerCase() : null
    await q(
      `UPDATE organisations SET website = $2, street = coalesce(street, nullif($3, '')), postal_code = coalesce(postal_code, nullif($4, '')),
         city = coalesce(city, nullif($5, '')), email = coalesce(email, $6), updated_at = now(),
         note = concat_ws(E'\n', nullif(note,''), $7::text)
       WHERE id = $1 AND website IS NULL`,
      [k.id, web, s?.strasse?.trim() ?? "", s?.plz?.trim() ?? "", s?.ort?.trim() ?? "", mail, `Stammdaten aus dem Impressum ergänzt (${new Date().toISOString().slice(0, 10)}), Quelle: ${s?.quelle ?? web}`],
    )
    n++
  }
  return n
}

const quartal = (d = new Date()) => `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`

export async function kundenbetreuungsRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const q = await assistentDb()
  if (!q) return { ergebnis: "Keine Datenbank", anzahl: 0 }

  const stamm = await ergaenzeStammdaten(q).catch(() => 0)

  const kunden = (await q(
    `SELECT og.id, og.name, og.website, og.city, og.email AS orgmail, og.street AS strasse, og.postal_code AS plz, og.city AS ort, og.country AS land, og.lifecycle, og.note,
            greatest(max(a.created_at), max(o.updated_at))::text AS zuletzt,
            (now()::date - greatest(max(a.created_at), max(o.updated_at))::date) AS tage,
            (SELECT c.name FROM contacts c WHERE c.organisation_id = og.id ORDER BY c.created_at LIMIT 1) AS kontakt,
            (SELECT c.email FROM contacts c WHERE c.organisation_id = og.id AND c.email IS NOT NULL ORDER BY c.created_at LIMIT 1) AS email
       FROM organisations og
       LEFT JOIN opportunities o ON o.organisation_id = og.id
       LEFT JOIN activities a ON (a.subject_type = 'organisation' AND a.subject_id = og.id)
                              OR (a.subject_type = 'opportunity' AND a.subject_id = o.id)
      WHERE og.lifecycle IN ('kunde','ehemaliger-kunde') AND og.excluded_reason IS NULL
        AND NOT EXISTS (SELECT 1 FROM opportunities x WHERE x.organisation_id = og.id
                         AND x.status NOT IN ('won','lost','excluded'))
      GROUP BY og.id`,
    [],
  )) as Kunde[]

  /* Ohne Mail oder Anschrift kann niemand schreiben – zuerst Stammdaten. */
  const erreichbar = kunden.filter((k) => k.email || k.orgmail || (k.strasse && k.plz))
  if (!kunden.length)
    return {
      ergebnis: "Keine Bestandskunden im System – Liste im Chat einspielen („Bestandskunden anlegen“), dann betreue ich sie",
      anzahl: 0,
    }

  const katalog = (await q(
    `SELECT titel, einheit, preis_cent FROM fin_leistungen WHERE aktiv ORDER BY preis_cent DESC`,
    [],
  ).catch(() => [])) as { titel: string; einheit: string; preis_cent: string }[]
  const angebote = katalog.map((l) => `${l.titel} (${(Number(l.preis_cent) / 100).toLocaleString("de-DE")} € / ${l.einheit})`).join("; ")

  const faellig = erreichbar
    .filter((k) => (k.tage ?? 999) >= (k.lifecycle === "kunde" ? 90 : 180))
    .sort((a, b) => (b.tage ?? 999) - (a.tage ?? 999))

  let n = 0
  for (const k of faellig) {
    if (n >= JE_LAUF) break
    const anlass =
      k.lifecycle === "ehemaliger-kunde"
        ? "Ehemaliger Kunde – Reaktivierung: Was hat sich bei ihm verändert, wo können wir wieder helfen?"
        : k.website
          ? "Bestandskunde mit Website – Betreuung, Barrierefreiheit (BFSG gilt seit 28.06.2025 für viele B2C-Angebote) oder nächster Ausbau."
          : "Bestandskunde – persönlicher Check-in: Läuft alles, was steht als Nächstes an?"
    const an = k.email ?? k.orgmail
    const anschrift = k.strasse && k.plz && (k.ort ?? k.city) ? { firma: k.name, strasse: k.strasse, plz: k.plz, ort: (k.ort ?? k.city)!, land: k.land ?? undefined } : null
    if (!an && !anschrift) continue
    const { text } = await generateText({
      model: MODELL,
      prompt: `${firmenText("kurz")}
Schreibe für Muhammed Emin Akyol (creaDIG Solutions) eine kurze persönliche ${an ? "Mail" : "Brief"} an einen BESTEHENDEN Kunden, per Sie, 80–120 Wörter, ohne Werbeton.
Anlass: ${anlass}
Kunde: ${k.name}${k.city ? ` (${k.city})` : ""}${k.website ? ` · ${k.website}` : ""} · Ansprechpartner: ${k.kontakt ?? "unbekannt – neutrale Anrede"}
Was wir für ihn gemacht haben (Akte): ${k.note?.slice(0, 600) ?? "—"}
Höchstens ein Angebot, nur aus diesem Katalog mit genau diesem Preis oder ganz ohne Preis: ${angebote || "—"}
Am Ende: Einladung zu einem kurzen Gespräch (creadig.de/termin). Nichts erfinden (keine Projekte, Zahlen, Fristen, die oben nicht stehen).
Antworte NUR mit JSON: {"betreff":"","text":"ab der Anrede, mit Gruß und Name"}`,
    })
    const v = json<{ betreff: string; text: string }>(text)
    if (!v?.text) continue
    const id = await legeFreigabeAn({
      art: an ? "mail" : "brief",
      titel: `Kunden-Check-in: ${k.name}`,
      inhalt: v.text.trim(),
      betreff: v.betreff,
      empfaenger: an ?? null,
      quelle: `kunde:${k.id}:${quartal()}`,
      agent: "kundenbetreuung",
      extra: { warum: `${anlass} Letzte Berührung: ${k.zuletzt ? k.zuletzt.slice(0, 10) : "keine erfasst"}.`, orgId: k.id, ...(anschrift && !an ? { anschrift } : {}) },
    })
    if (id) n++
  }

  return {
    ergebnis: `${kunden.length} Bestandskunden ohne offene Chance (${erreichbar.length} erreichbar) · ${stamm} Stammdaten recherchiert · ${n} Check-ins zur Freigabe`,
    anzahl: n + stamm,
  }
}
