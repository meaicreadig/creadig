import { neonAbfrage } from "@/lib/neon-abfrage"

import { legeFreigabeAn } from "./store"

const LOESCHWUNSCH = /(l(ö|oe)sch|entfern|raus(nehmen)?\b|sil(in|me|eb|e\b)|test[\s-]?(unternehmen|firm|betrieb|kunde)|keine echten)/i

type Org = { id: string; name: string }

/**
 * Erkennt in einer Antwort an die Geschäftsleitung den Wunsch, Firmen zu löschen,
 * und legt dafür eine Freigabe an. Gelöscht wird erst nach ausdrücklicher Bestätigung.
 */
export async function erkenneLoeschwunsch(antwort: string, quelle: string): Promise<string | null> {
  if (!LOESCHWUNSCH.test(antwort)) return null
  const q = neonAbfrage()
  if (!q) return null
  const text = antwort.toLowerCase()
  const orgs = (await q(`SELECT id::text AS id, name FROM organisations`, [])) as Org[]
  const treffer = orgs.filter((o) => o.name && o.name.trim().length >= 5 && text.includes(o.name.trim().toLowerCase()))
  if (treffer.length === 0) return null

  const ids = treffer.map((o) => o.id)
  const [zahl] = (await q(
    `SELECT (SELECT count(*)::int FROM opportunities WHERE organisation_id::text = ANY($1::text[])) AS deals,
            (SELECT count(*)::int FROM contacts WHERE organisation_id::text = ANY($1::text[])) AS kontakte`,
    [ids],
  )) as { deals: number; kontakte: number }[]

  const namen = treffer.map((o) => o.name)
  return legeFreigabeAn({
    art: "loeschen",
    titel: `Löschen: ${namen.join(", ")}`.slice(0, 160),
    inhalt: [
      ...namen.map((n) => `• ${n}`),
      "",
      `Mit entfernt: ${zahl?.deals ?? 0} Verkaufschance(n), ${zahl?.kontakte ?? 0} Kontakt(e) samt Angeboten, Rechnungen und Recherchen dazu.`,
      "Das lässt sich nicht rückgängig machen.",
    ].join("\n"),
    agent: "rat",
    quelle: `loeschen:${quelle}:${[...ids].sort().join(",")}`,
    extra: { orgIds: ids, warum: "Aus deiner Antwort an die Geschäftsleitung" },
  })
}

/** Löscht die Firmen samt Verkaufschancen und Kontakten in einem Schritt. */
export async function loescheFirmen(ids: string[]): Promise<{ ok: true; namen: string[] } | { ok: false; grund: string }> {
  const q = neonAbfrage()
  if (!q) return { ok: false, grund: "Speicher nicht verfügbar" }
  if (ids.length === 0) return { ok: false, grund: "Keine Firmen angegeben" }
  try {
    const rows = (await q(
      `WITH chancen AS (DELETE FROM opportunities WHERE organisation_id::text = ANY($1::text[]) RETURNING id),
            kontakte AS (DELETE FROM contacts WHERE organisation_id::text = ANY($1::text[]) RETURNING id),
            firmen AS (DELETE FROM organisations WHERE id::text = ANY($1::text[]) RETURNING name)
       SELECT name, (SELECT count(*) FROM chancen) AS c, (SELECT count(*) FROM kontakte) AS k FROM firmen`,
      [ids],
    )) as { name: string }[]
    return { ok: true, namen: rows.map((r) => r.name) }
  } catch (e) {
    console.error("[loeschen]", e)
    const m = String((e as Error).message)
    return {
      ok: false,
      grund: m.includes("releases") ? "Für diese Firma gibt es eine Kundenfreigabe – bitte dort zuerst entfernen." : "Löschen fehlgeschlagen",
    }
  }
}
