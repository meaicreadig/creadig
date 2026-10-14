import "server-only"

import { createHash, randomUUID } from "node:crypto"
import { put } from "@vercel/blob"

import type { Abfrage } from "@/lib/neon-abfrage"
import { belegeSchema, istKennzahlen, type Kennzahlen } from "@/lib/finanz/belege"

/**
 * Kopierlauf fibero → creaDIG Finanz. fibero wird NUR gelesen (Supabase REST
 * mit Service-Schlüssel, ausschliesslich GET/list). Idempotent über
 * (quelle, extern_id); Dateien werden mit SHA-256 geprüft.
 */
const QUELLE = "fibero"
const FIRMA = "firm-creadig"
const BUCKET = "belege"
const DATEIEN_PRO_SCHRITT = 12

function zugang() {
  const url = process.env.FIBERO_SUPABASE_URL?.trim().replace(/\/$/, "")
  const key = process.env.FIBERO_SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return null
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}` } }
}

export const kopierlaufBereit = () => Boolean(zugang() && process.env.BLOB_READ_WRITE_TOKEN)

const cent = (v: unknown) => Math.round(Number(v ?? 0) * 100)
const ohnePrefix = (p: string) => p.replace(/^\/+/, "").replace(/^belege\//, "")

type Zeile = Record<string, unknown>

async function ladeExpenses(z: NonNullable<ReturnType<typeof zugang>>): Promise<Zeile[]> {
  const alle: Zeile[] = []
  for (let von = 0; ; von += 1000) {
    const res = await fetch(`${z.url}/rest/v1/expenses?select=*&firm_id=eq.${FIRMA}&order=id`, {
      headers: { ...z.headers, "Range-Unit": "items", Range: `${von}-${von + 999}` },
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`fibero-Belege nicht lesbar (${res.status})`)
    const seite = (await res.json()) as Zeile[]
    alle.push(...seite)
    if (seite.length < 1000) return alle
  }
}

type Objekt = { pfad: string; bytes: number; typ: string | null }

async function listeSpeicher(z: NonNullable<ReturnType<typeof zugang>>, prefix = ""): Promise<Objekt[]> {
  const aus: Objekt[] = []
  for (let offset = 0; ; offset += 1000) {
    const res = await fetch(`${z.url}/storage/v1/object/list/${BUCKET}`, {
      method: "POST",
      headers: { ...z.headers, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: "name", order: "asc" } }),
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`fibero-Speicher nicht lesbar (${res.status})`)
    const seite = (await res.json()) as { name: string; id: string | null; metadata?: { size?: number; mimetype?: string } | null }[]
    for (const o of seite) {
      const pfad = prefix ? `${prefix}/${o.name}` : o.name
      if (o.id === null) aus.push(...(await listeSpeicher(z, pfad)))
      else if (o.name !== ".emptyFolderPlaceholder") aus.push({ pfad, bytes: o.metadata?.size ?? 0, typ: o.metadata?.mimetype ?? null })
    }
    if (seite.length < 1000) return aus
  }
}

export type Schritt =
  | { phase: "dateien"; kopiert: number; gesamt: number; fehler: number }
  | { phase: "fertig"; soll: Kennzahlen; ist: Kennzahlen; stimmt: boolean }

/** Phase 1: Zeilen + Dateiliste übernehmen, Soll-Werte festhalten. */
export async function starteLauf(db: Abfrage): Promise<Schritt> {
  const z = zugang()
  if (!z) throw new Error("fibero-Zugang fehlt")
  await belegeSchema(db)

  const [zeilen, objekte] = await Promise.all([ladeExpenses(z), listeSpeicher(z)])
  const bekannt = new Set<string>()

  for (const r of zeilen) {
    const pfad = String(r.bild_pfad ?? "") ? ohnePrefix(String(r.bild_pfad)) : null
    if (pfad) bekannt.add(pfad)
    await db(
      `INSERT INTO fin_belege (id, quelle, extern_id, art, datum, haendler, belegnummer, brutto_cent, netto_cent, vorsteuer_cent,
                               kategorie, datev_konto, quelle_status, archiviert, datei_quelle_pfad, datei_status, quelle_sha256, rohdaten)
       VALUES ($1,$2,$3,'beleg',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT (quelle, extern_id) DO UPDATE SET
         datum=EXCLUDED.datum, haendler=EXCLUDED.haendler, belegnummer=EXCLUDED.belegnummer, brutto_cent=EXCLUDED.brutto_cent,
         netto_cent=EXCLUDED.netto_cent, vorsteuer_cent=EXCLUDED.vorsteuer_cent, kategorie=EXCLUDED.kategorie,
         datev_konto=EXCLUDED.datev_konto, quelle_status=EXCLUDED.quelle_status, archiviert=EXCLUDED.archiviert,
         quelle_sha256=EXCLUDED.quelle_sha256, rohdaten=EXCLUDED.rohdaten,
         datei_status = CASE WHEN fin_belege.datei_quelle_pfad IS DISTINCT FROM EXCLUDED.datei_quelle_pfad THEN EXCLUDED.datei_status ELSE fin_belege.datei_status END,
         datei_quelle_pfad=EXCLUDED.datei_quelle_pfad`,
      [
        `${QUELLE}:${r.id}`,
        QUELLE,
        String(r.id),
        r.beleg_datum ?? null,
        String(r.haendler ?? ""),
        r.belegnummer ?? null,
        cent(r.betrag_brutto),
        cent(r.betrag_netto),
        cent(r.mwst_betrag),
        String(r.kategorie ?? ""),
        String(r.datev_konto ?? ""),
        r.status ?? null,
        r.archived_at !== null && r.archived_at !== undefined,
        pfad,
        pfad ? "offen" : "keine",
        r.attachment_sha256 ?? null,
        JSON.stringify(r),
      ],
    )
  }

  const lose = objekte.filter((o) => !bekannt.has(o.pfad))
  for (const o of lose) {
    await db(
      `INSERT INTO fin_belege (id, quelle, extern_id, art, haendler, datei_quelle_pfad, datei_status, rohdaten)
       VALUES ($1,$2,$3,'lose_datei','',$4,'offen',$5) ON CONFLICT (quelle, extern_id) DO NOTHING`,
      [`${QUELLE}:datei:${o.pfad}`, QUELLE, `datei:${o.pfad}`, o.pfad, JSON.stringify(o)],
    )
  }

  const aktiv = zeilen.filter((r) => !r.archived_at)
  const imSpeicher = new Set(objekte.map((o) => o.pfad))
  const soll: Kennzahlen = {
    belege: zeilen.length,
    archiviert: zeilen.length - aktiv.length,
    mitDatei: zeilen.filter((r) => String(r.bild_pfad ?? "")).length,
    dateien: [...new Set([...bekannt].filter((p) => imSpeicher.has(p)))].length + lose.length,
    bytes: objekte.reduce((s, o) => s + o.bytes, 0),
    bruttoCent: aktiv.reduce((s, r) => s + cent(r.betrag_brutto), 0),
    vorsteuerCent: aktiv.reduce((s, r) => s + cent(r.mwst_betrag), 0),
  }
  await db(`INSERT INTO fin_kopierlaeufe (id, quelle, soll) VALUES ($1,$2,$3)`, [randomUUID(), QUELLE, JSON.stringify(soll)])
  return weiter(db)
}

/** Phase 2: nächste Dateien kopieren; wenn keine mehr offen → Abgleich. */
export async function weiter(db: Abfrage): Promise<Schritt> {
  const z = zugang()
  if (!z) throw new Error("fibero-Zugang fehlt")
  await belegeSchema(db)

  const offen = await db(
    `SELECT DISTINCT ON (datei_quelle_pfad) id, datei_quelle_pfad FROM fin_belege
      WHERE quelle = $1 AND datei_status = 'offen' ORDER BY datei_quelle_pfad, id LIMIT $2`,
    [QUELLE, DATEIEN_PRO_SCHRITT],
  )

  await Promise.all(
    offen.map(async (r) => {
      const quellPfad = String(r.datei_quelle_pfad)
      try {
        const res = await fetch(`${z.url}/storage/v1/object/${BUCKET}/${quellPfad.split("/").map(encodeURIComponent).join("/")}`, {
          headers: z.headers,
          cache: "no-store",
        })
        if (!res.ok) throw new Error(`Datei nicht lesbar (${res.status})`)
        const daten = Buffer.from(await res.arrayBuffer())
        const sha = createHash("sha256").update(daten).digest("hex")
        const typ = res.headers.get("content-type")
        const blob = await put(`finanz/belege/${QUELLE}/${quellPfad}`, daten, {
          access: "private",
          contentType: typ ?? undefined,
          addRandomSuffix: false,
          allowOverwrite: true,
        })
        await db(
          `UPDATE fin_belege SET datei_status='kopiert', datei_pfad=$1, datei_sha256=$2, datei_bytes=$3, datei_typ=$4,
                  datei_fehler=NULL, kopiert_at=now()
            WHERE quelle=$5 AND datei_quelle_pfad=$6`,
          [blob.pathname, sha, daten.length, typ, QUELLE, quellPfad],
        )
      } catch (e) {
        await db(`UPDATE fin_belege SET datei_status='fehler', datei_fehler=$1 WHERE quelle=$2 AND datei_quelle_pfad=$3`, [
          e instanceof Error ? e.message : "Fehler",
          QUELLE,
          quellPfad,
        ])
      }
    }),
  )

  const [stand] = await db(
    `SELECT count(DISTINCT datei_quelle_pfad) FILTER (WHERE datei_status='offen') AS offen,
            count(DISTINCT datei_quelle_pfad) FILTER (WHERE datei_status='kopiert') AS kopiert,
            count(DISTINCT datei_quelle_pfad) FILTER (WHERE datei_status='fehler') AS fehler
       FROM fin_belege WHERE quelle=$1`,
    [QUELLE],
  )
  const nOffen = Number(stand?.offen ?? 0)
  const kopiert = Number(stand?.kopiert ?? 0)
  const fehler = Number(stand?.fehler ?? 0)
  if (nOffen > 0) return { phase: "dateien", kopiert, gesamt: kopiert + fehler + nOffen, fehler }
  return abschliessen(db)
}

/** Fehlgeschlagene Dateien erneut versuchen. */
export async function fehlerErneut(db: Abfrage): Promise<Schritt> {
  await db(`UPDATE fin_belege SET datei_status='offen' WHERE quelle=$1 AND datei_status='fehler'`, [QUELLE])
  return weiter(db)
}

async function abschliessen(db: Abfrage): Promise<Schritt> {
  const [lauf] = await db(`SELECT id, soll FROM fin_kopierlaeufe WHERE quelle=$1 ORDER BY gestartet_at DESC LIMIT 1`, [QUELLE])
  const ist = await istKennzahlen(db, QUELLE)
  // Dateien zählen nach eindeutigem Quellpfad, weil fibero doppelte Anhänge kennt.
  const [d] = await db(
    `SELECT count(DISTINCT datei_quelle_pfad) AS c, coalesce(sum(b),0) AS b FROM (
       SELECT datei_quelle_pfad, max(datei_bytes) AS b FROM fin_belege WHERE quelle=$1 AND datei_status='kopiert' GROUP BY 1) x`,
    [QUELLE],
  )
  ist.dateien = Number(d?.c ?? 0)
  ist.bytes = Number(d?.b ?? 0)
  const soll = (lauf?.soll ?? ist) as Kennzahlen
  const stimmt =
    soll.belege === ist.belege &&
    soll.archiviert === ist.archiviert &&
    soll.mitDatei === ist.mitDatei &&
    soll.dateien === ist.dateien &&
    soll.bytes === ist.bytes &&
    soll.bruttoCent === ist.bruttoCent &&
    soll.vorsteuerCent === ist.vorsteuerCent
  if (lauf) {
    await db(`UPDATE fin_kopierlaeufe SET ist=$1, stimmt=$2, fertig_at=now() WHERE id=$3`, [JSON.stringify(ist), stimmt, lauf.id])
  }
  await db(`INSERT INTO fin_protokoll (aktion, daten) VALUES ('kopierlauf_fibero', $1)`, [JSON.stringify({ soll, ist, stimmt })])
  return { phase: "fertig", soll, ist, stimmt }
}
