import "server-only"

import { randomUUID } from "node:crypto"

import { legeFreigabeAn } from "@/lib/assistent/store"
import { sign } from "@/lib/hmac"
import { protokolliereStufe } from "@/lib/kundenfaden"
import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"

/**
 * TESLİMAT HATTI — vom angenommenen Angebot zur gelieferten Arbeit (Katman 4, 24.10.2026).
 *
 * Vorher sagte die Projektleitung jeden Tag „kein gewonnener Auftrag“: Ein
 * online angenommenes Angebot (Finanz, fin_dokumente) setzte weder die Chance
 * auf „gewonnen“ noch kannte es die Projekt-Tabelle (die hängt an `offers`).
 * Jetzt:
 *
 *   Kunde nimmt an → Chance „gewonnen“ (Wert = Netto) → Ereignis
 *   „auftrag_erteilt“ → Spiegel in `offers` (angenommen) → Projektleitung legt
 *   das Projekt an → LIEFERPLAN: Aufgaben je Phase und je Angebotsposition,
 *   Termine ab Materialeingang (28-Tage-Frist aus lib/lieferung.ts),
 *   Zuständig: Emin oder ein passender Subunternehmer → Sub-Auftrag als
 *   Mail-Freigabe (Emins Klick) → Kalender-Abo (ICS) mit allen Fristen.
 *
 * Abgelehnt → Chance „verloren“ mit Grund. Änderungswunsch → Karte bei Emin.
 */

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS projekt_aufgaben (
     id text PRIMARY KEY,
     projekt_id text NOT NULL,
     reihenfolge int NOT NULL DEFAULT 0,
     titel text NOT NULL,
     phase text NOT NULL,
     tage_ab_start int NOT NULL DEFAULT 0,
     faellig_am date,
     zustaendig text NOT NULL DEFAULT 'emin',
     sub_id text,
     status text NOT NULL DEFAULT 'offen' CHECK (status IN ('offen','erledigt')),
     erledigt_am timestamptz,
     created_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE UNIQUE INDEX IF NOT EXISTS projekt_aufgaben_reihe_uq ON projekt_aufgaben (projekt_id, reihenfolge)`,
  `CREATE TABLE IF NOT EXISTS subunternehmer (
     id text PRIMARY KEY,
     name text NOT NULL,
     email text,
     kompetenzen text[] NOT NULL DEFAULT '{}',
     tagessatz_cent int,
     notiz text,
     aktiv boolean NOT NULL DEFAULT true,
     created_at timestamptz NOT NULL DEFAULT now())`,
]

let bereit: Promise<boolean> | null = null
export async function lieferDb(): Promise<Abfrage | null> {
  const q = neonAbfrage()
  if (!q) return null
  bereit ??= (async () => {
    for (const s of SCHEMA) await q(s, [])
    return true
  })().catch(() => {
    bereit = null
    return false
  })
  return (await bereit) ? q : null
}

/* ------------------------------------------------------------------------ */
/* 1 · Antwort des Kunden auf ein Finanz-Angebot                             */
/* ------------------------------------------------------------------------ */

const ARTEN = ["website", "pruefung", "behebung", "systemprojekt", "betrieb"] as const
type Art = (typeof ARTEN)[number]

/** Nach `beantworteAngebot`: Chance, Projekt-Grundlage und Folgeschritte nachziehen. Wirft nie. */
export async function nachAngebotsAntwort(dokId: string): Promise<void> {
  try {
    const q = neonAbfrage()
    if (!q) return
    const [d] = (await q(
      `SELECT id, status, nummer, titel, sprache, positionen, summen, opportunity_id, antwort_name, antwort_text,
              to_char(datum,'YYYY-MM-DD') AS datum, to_char(gueltig_bis,'YYYY-MM-DD') AS gueltig_bis, versendet_at, beantwortet_at
         FROM fin_dokumente WHERE id = $1 AND art = 'angebot'`,
      [dokId],
    )) as {
      id: string
      status: string
      nummer: string | null
      titel: string
      sprache: string
      positionen: unknown[]
      summen: { nettoCent?: number } | null
      opportunity_id: string | null
      antwort_name: string | null
      antwort_text: string | null
      datum: string
      gueltig_bis: string | null
      versendet_at: string | null
      beantwortet_at: string | null
    }[]
    if (!d?.opportunity_id) return
    const [o] = (await q(`SELECT id, status, organisation_id, contact_id, offer_kind, estimated_value FROM opportunities WHERE id = $1`, [d.opportunity_id])) as {
      id: string
      status: string
      organisation_id: string | null
      contact_id: string | null
      offer_kind: string | null
      estimated_value: number | null
    }[]
    if (!o) return
    const wer = { actor: "kunde", origin: "AUTOMATIC" as const }

    if (d.status === "angenommen") {
      const netto = Math.round((d.summen?.nettoCent ?? 0) / 100)
      if (o.status !== "won") {
        await q(`UPDATE opportunities SET status = 'won', estimated_value = CASE WHEN $2 > 0 THEN $2 ELSE estimated_value END, last_contact_at = now(), updated_at = now() WHERE id = $1`, [
          o.id,
          netto,
        ])
        if (o.organisation_id) await protokolliereStufe(q, o.organisation_id, o.id, o.status, "won", `Angebot ${d.nummer ?? ""} online angenommen`, d.id, wer).catch(() => null)
      }
      /* Projekt-Tabelle hängt an `offers` (Altbestand) – das angenommene Finanz-Angebot wird dort gespiegelt. */
      const art: Art = (ARTEN as readonly string[]).includes(o.offer_kind ?? "") ? (o.offer_kind as Art) : "website"
      const gueltig = d.gueltig_bis ?? d.datum
      await q(
        `INSERT INTO offers (id, opportunity_id, reference, kind, locale, valid_until, sections, positions, state, acceptance, sent_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6::date, '{}'::jsonb, $7::jsonb, 'angenommen', $8::jsonb, $9, now(), now())
         ON CONFLICT (id) DO NOTHING`,
        [
          `offer-fin-${d.id}`,
          o.id,
          d.nummer ?? d.id,
          art,
          ["de", "tr", "en", "ar"].includes(d.sprache) ? d.sprache : "de",
          gueltig,
          JSON.stringify(d.positionen ?? []),
          JSON.stringify({
            von: d.antwort_name ?? "Kunde",
            rolle: "Kunde",
            form: "online",
            am: d.beantwortet_at ?? new Date().toISOString(),
            fundstelle: `Finanz-Angebot ${d.nummer ?? d.id}, online über den Kundenlink angenommen`,
          }),
          d.versendet_at,
        ],
      )
      const { ereignis } = await import("@/lib/motor/ereignis")
      await ereignis("auftrag_erteilt", {
        kontaktId: o.contact_id,
        subjekt: `opportunity:${o.id}`,
        daten: { von: o.status, wer: "kunde", angebot: d.nummer },
        schluessel: `auftrag_erteilt:${o.id}`,
      })
      return
    }

    if (d.status === "abgelehnt" && o.status !== "lost") {
      await q(`UPDATE opportunities SET status = 'lost', lost_reason = $2, updated_at = now() WHERE id = $1`, [
        o.id,
        `Angebot ${d.nummer ?? ""} abgelehnt${d.antwort_text ? `: ${d.antwort_text}` : ""}`.slice(0, 500),
      ])
      if (o.organisation_id) await protokolliereStufe(q, o.organisation_id, o.id, o.status, "lost", "Angebot online abgelehnt", d.id, wer).catch(() => null)
      return
    }

    if (d.status === "aenderung") {
      await legeFreigabeAn({
        art: "aufgabe",
        titel: `Änderungswunsch zum Angebot ${d.nummer ?? ""}: ${d.titel}`.slice(0, 160),
        inhalt: `Der Kunde (${d.antwort_name ?? "–"}) wünscht eine Änderung:\n\n„${d.antwort_text ?? ""}“\n\nNeue Version anlegen und anpassen: /finanz/vorgang/${d.id} → „Neue Version“. Danach liegt die Karte „Angebot senden“ wieder bereit.`,
        quelle: `angebot-aenderung:${d.id}`,
        agent: "angebot",
        extra: { koordination: { abteilung: "finanzen", ergebnis: "Änderungswunsch des Kunden", auftragId: "", beiEmin: true } },
      }).catch(() => null)
    }
  } catch (e) {
    console.error("[lieferung-hat] antwort", e instanceof Error ? e.message : e)
  }
}

/* ------------------------------------------------------------------------ */
/* 2 · Lieferplan                                                            */
/* ------------------------------------------------------------------------ */

type Schritt = { titel: string; phase: string; tage: number; kompetenz?: string }

/** Phasen je Angebotsart. Tage ab Materialeingang; die Website-Kette endet an der 28-Tage-Frist. */
const VORLAGEN: Record<Art, Schritt[]> = {
  website: [
    { titel: "Kickoff: Ziele, Seitenstruktur, Zugänge klären", phase: "Start", tage: 1 },
    { titel: "Konzept und Seitenstruktur", phase: "Konzept", tage: 4, kompetenz: "konzept" },
    { titel: "Design (Startseite + Musterseite) zur Freigabe", phase: "Design", tage: 9, kompetenz: "design" },
    { titel: "Inhalte einpflegen, Bilder optimieren", phase: "Umsetzung", tage: 18, kompetenz: "text" },
    { titel: "Barrierefreiheit (WCAG 2.1 AA) und Mobil prüfen", phase: "Qualität", tage: 22, kompetenz: "barrierefreiheit" },
    { titel: "Vorschau an den Kunden, Abnahme-Termin", phase: "Abnahme", tage: 25 },
    { titel: "Livegang, SEO-Grundlagen, Übergabe vorbereiten", phase: "Livegang", tage: 28 },
  ],
  pruefung: [
    { titel: "Prüfumfang festlegen (Seiten, Vorlagen)", phase: "Start", tage: 1 },
    { titel: "Prüfung nach WCAG 2.1 AA / BFSG", phase: "Prüfung", tage: 5, kompetenz: "barrierefreiheit" },
    { titel: "Prüfbericht mit Prioritäten", phase: "Bericht", tage: 7 },
    { titel: "Ergebnisbesprechung mit dem Kunden", phase: "Abnahme", tage: 10 },
  ],
  behebung: [
    { titel: "Befunde priorisieren", phase: "Start", tage: 1 },
    { titel: "Behebung umsetzen", phase: "Umsetzung", tage: 12, kompetenz: "entwicklung" },
    { titel: "Nachprüfung", phase: "Qualität", tage: 15, kompetenz: "barrierefreiheit" },
    { titel: "Abnahme und Erklärung zur Barrierefreiheit", phase: "Abnahme", tage: 18 },
  ],
  systemprojekt: [
    { titel: "Anforderungen und Datenmodell", phase: "Konzept", tage: 5, kompetenz: "konzept" },
    { titel: "Prototyp zur Freigabe", phase: "Design", tage: 14, kompetenz: "design" },
    { titel: "Umsetzung Kernfunktionen", phase: "Umsetzung", tage: 35, kompetenz: "entwicklung" },
    { titel: "Test mit echten Nutzern", phase: "Qualität", tage: 45 },
    { titel: "Schulung, Abnahme, Übergabe", phase: "Abnahme", tage: 50 },
  ],
  betrieb: [
    { titel: "Zugänge und Backups einrichten", phase: "Start", tage: 2 },
    { titel: "Erster Monatsbericht (Updates, Sicherheit, Erreichbarkeit)", phase: "Betrieb", tage: 30 },
  ],
}

const KOMPETENZ_WORTE: Record<string, RegExp> = {
  design: /design|gestalt|layout|logo/i,
  entwicklung: /entwickl|programm|umsetz|shop|schnittstelle|automat|app/i,
  text: /text|inhalt|content|übersetz|seo/i,
  barrierefreiheit: /barriere|bfsg|wcag/i,
  konzept: /konzept|struktur|beratung/i,
}

/** Lieferplan für ein neues Projekt anlegen. Idempotent (auch bei parallelen Läufen: eindeutig je Projekt und Reihenfolge). */
export async function legeLieferplanAn(projektId: string): Promise<number> {
  const q = await lieferDb()
  if (!q) return 0
  const schon = await q(`SELECT 1 FROM projekt_aufgaben WHERE projekt_id = $1 LIMIT 1`, [projektId])
  if (schon.length) return 0
  const [p] = (await q(
    `SELECT p.id, of.kind, of.positions FROM projects p JOIN offers of ON of.id = p.offer_id WHERE p.id = $1`,
    [projektId],
  )) as { id: string; kind: Art; positions: { titel?: string; was?: string; optional?: boolean; gewaehlt?: boolean }[] }[]
  if (!p) return 0
  const vorlage = [...(VORLAGEN[p.kind] ?? VORLAGEN.website)]
  /* Jede gewählte Angebotsposition, die nicht schon Phase ist, wird eine eigene Umsetzungsaufgabe. */
  const umsetzung = vorlage.find((s) => s.phase === "Umsetzung")?.tage ?? Math.max(...vorlage.map((s) => s.tage)) - 5
  for (const pos of p.positions ?? []) {
    const titel = String(pos.titel ?? pos.was ?? "").replace(/\s*\(Preis prüfen\)/, "").trim()
    if (!titel || (pos.optional && !pos.gewaehlt) || /betreuung|wartung|monat/i.test(titel)) continue
    vorlage.push({ titel: `Umsetzen: ${titel}`, phase: "Umsetzung", tage: umsetzung, kompetenz: Object.keys(KOMPETENZ_WORTE).find((k) => KOMPETENZ_WORTE[k].test(titel)) })
  }
  vorlage.sort((a, b) => a.tage - b.tage)
  const subs = await ladeSubs(q)
  let i = 0
  for (const s of vorlage) {
    const sub = s.kompetenz ? subs.find((x) => x.kompetenzen.includes(s.kompetenz!)) : undefined
    await q(
      `INSERT INTO projekt_aufgaben (id, projekt_id, reihenfolge, titel, phase, tage_ab_start, zustaendig, sub_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (projekt_id, reihenfolge) DO NOTHING`,
      [`pa-${randomUUID().slice(0, 10)}`, projektId, i++, s.titel.slice(0, 200), s.phase, s.tage, sub ? "sub" : "emin", sub?.id ?? null],
    )
  }
  return i
}

type Sub = { id: string; name: string; email: string | null; kompetenzen: string[] }
async function ladeSubs(q: Abfrage): Promise<Sub[]> {
  return (await q(`SELECT id, name, email, kompetenzen FROM subunternehmer WHERE aktiv ORDER BY created_at`, []).catch(() => [])) as Sub[]
}

/**
 * Sobald das Material da ist (Projekt „läuft“), bekommt jede Aufgabe ihr Datum,
 * und jeder Subunternehmer seinen Auftrag als Mail-Freigabe – eine Mail je Sub
 * und Projekt mit allen seinen Aufgaben und Fristen.
 */
export async function planAktualisieren(): Promise<{ datiert: number; subKarten: number }> {
  const q = await lieferDb()
  if (!q) return { datiert: 0, subKarten: 0 }
  const datiert = await q(
    `UPDATE projekt_aufgaben a SET faellig_am = p.material_received + a.tage_ab_start
       FROM projects p WHERE p.id = a.projekt_id AND p.material_received IS NOT NULL AND a.faellig_am IS NULL RETURNING a.id`,
    [],
  )
  const offen = (await q(
    `SELECT a.projekt_id, a.sub_id, s.name, s.email, o.title, string_agg('• ' || a.titel || ' – bis ' || to_char(a.faellig_am, 'DD.MM.YYYY'), E'\\n' ORDER BY a.reihenfolge) AS liste
       FROM projekt_aufgaben a
       JOIN subunternehmer s ON s.id = a.sub_id
       JOIN projects p ON p.id = a.projekt_id
       JOIN opportunities o ON o.id = p.opportunity_id
      WHERE a.status = 'offen' AND a.faellig_am IS NOT NULL
      GROUP BY a.projekt_id, a.sub_id, s.name, s.email, o.title`,
    [],
  )) as { projekt_id: string; sub_id: string; name: string; email: string | null; title: string; liste: string }[]
  let subKarten = 0
  for (const s of offen) {
    const id = await legeFreigabeAn({
      art: "mail",
      titel: `Sub-Auftrag an ${s.name}: ${s.title}`.slice(0, 160),
      empfaenger: s.email,
      betreff: `Auftrag: ${s.title}`.slice(0, 160),
      inhalt: `Hallo ${s.name},\n\nfür das Projekt „${s.title}“ möchte ich dich mit diesen Aufgaben beauftragen:\n\n${s.liste}\n\nUnterlagen und Zugänge schicke ich dir nach deiner Zusage. Abgerechnet wird nach den vereinbarten Konditionen.\n\nKurze Bestätigung genügt.\n\nViele Grüße\nMuhammed Emin Akyol\ncreaDIG Solutions`,
      quelle: `sub-auftrag:${s.projekt_id}:${s.sub_id}`,
      agent: "projekte",
      extra: { warum: "Lieferplan: Aufgaben passend zur Kompetenz des Subunternehmers. Vor dem Senden Konditionen prüfen." },
    }).catch(() => null)
    if (id) subKarten++
  }
  return { datiert: datiert.length, subKarten }
}

export type LieferAufgabe = { id: string; projekt: string; titel: string; phase: string; faellig: string | null; zustaendig: string; status: string }

/** Offene Aufgaben aller laufenden Projekte – für Assistent, Morgenmail und Wochenbericht. */
export async function ladeLieferAufgaben(projektId?: string): Promise<LieferAufgabe[]> {
  const q = await lieferDb()
  if (!q) return []
  return (await q(
    `SELECT a.id, coalesce(org.name, o.title) AS projekt, a.titel, a.phase, to_char(a.faellig_am,'YYYY-MM-DD') AS faellig,
            CASE WHEN a.zustaendig = 'sub' THEN coalesce(s.name, 'Sub') ELSE 'Emin' END AS zustaendig, a.status
       FROM projekt_aufgaben a
       JOIN projects p ON p.id = a.projekt_id
       JOIN opportunities o ON o.id = p.opportunity_id
       LEFT JOIN organisations org ON org.id = o.organisation_id
       LEFT JOIN subunternehmer s ON s.id = a.sub_id
      WHERE p.state IN ('aufgesetzt','laeuft') AND ($1::text IS NULL OR a.projekt_id = $1)
      ORDER BY a.status, a.faellig_am NULLS LAST, a.reihenfolge LIMIT 60`,
    [projektId ?? null],
  ).catch(() => [])) as LieferAufgabe[]
}

export async function setzeAufgabeErledigt(id: string, erledigt: boolean): Promise<void> {
  const q = await lieferDb()
  if (!q) return
  await q(`UPDATE projekt_aufgaben SET status = $2, erledigt_am = CASE WHEN $2 = 'erledigt' THEN now() END WHERE id = $1`, [id, erledigt ? "erledigt" : "offen"])
}

export async function legeSubAn(s: { name: string; email?: string | null; kompetenzen: string[]; tagessatzEur?: number | null; notiz?: string | null }): Promise<string | null> {
  const q = await lieferDb()
  if (!q) return null
  const id = `sub-${randomUUID().slice(0, 8)}`
  await q(`INSERT INTO subunternehmer (id, name, email, kompetenzen, tagessatz_cent, notiz) VALUES ($1,$2,$3,$4::text[],$5,$6)`, [
    id,
    s.name.slice(0, 120),
    s.email ?? null,
    s.kompetenzen.filter((k) => k in KOMPETENZ_WORTE),
    s.tagessatzEur ? Math.round(s.tagessatzEur * 100) : null,
    s.notiz?.slice(0, 600) ?? null,
  ])
  return id
}
export const KOMPETENZEN = Object.keys(KOMPETENZ_WORTE)

/* ------------------------------------------------------------------------ */
/* 3 · Kalender-Abo                                                          */
/* ------------------------------------------------------------------------ */

/** Signierter Schlüssel der Abo-Adresse (wie /api/termine/feed). Ohne Secret kein Abo. */
export async function kalenderSchluessel(): Promise<string | null> {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim()
  return secret ? sign("projekt-kalender", secret) : null
}

export async function kalenderIcs(): Promise<string> {
  const q = await lieferDb()
  const rows = q
    ? ((await q(
        `SELECT a.id, a.titel, a.phase, to_char(a.faellig_am,'YYYYMMDD') AS tag, to_char(a.faellig_am + 1,'YYYYMMDD') AS bis, a.status,
                coalesce(org.name, o.title) AS projekt, CASE WHEN a.zustaendig = 'sub' THEN coalesce(s.name,'Sub') ELSE 'Emin' END AS wer
           FROM projekt_aufgaben a JOIN projects p ON p.id = a.projekt_id JOIN opportunities o ON o.id = p.opportunity_id
           LEFT JOIN organisations org ON org.id = o.organisation_id LEFT JOIN subunternehmer s ON s.id = a.sub_id
          WHERE a.faellig_am IS NOT NULL AND a.faellig_am > now() - interval '60 days'`,
        [],
      ).catch(() => [])) as { id: string; titel: string; phase: string; tag: string; bis: string; status: string; projekt: string; wer: string }[])
    : []
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const events = rows.map((r) =>
    [
      "BEGIN:VEVENT",
      `UID:${r.id}@creadig.de`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${r.tag}`,
      `DTEND;VALUE=DATE:${r.bis}`,
      `SUMMARY:${esc(`${r.status === "erledigt" ? "✓ " : ""}${r.projekt}: ${r.titel}`)}`,
      `DESCRIPTION:${esc(`Phase: ${r.phase} · Zuständig: ${r.wer}`)}`,
      "END:VEVENT",
    ].join("\r\n"),
  )
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//creaDIG//Lieferplan//DE", "X-WR-CALNAME:creaDIG Projekte", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR", ""].join("\r\n")
}
