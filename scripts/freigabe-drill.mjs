#!/usr/bin/env node
/**
 * ADM-05 · A13/A14 — FREIGABEN GEGEN EINE ECHTE DATENBANK
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE BEIDEN SZENARIEN
 *
 *   A13  Ein Beleg ohne Freigabe ist nicht oeffentlich.
 *   A14  Ein Widerruf wirkt sofort — und loescht die Geschichte nicht.
 *
 * Geprueft wird die Rechnung, die darueber entscheidet (`lib/proof.ts`), an
 * Zeilen, die wirklich in der Datenbank stehen. Nicht an einem Fixture: Der
 * Unterschied zwischen „keine Erlaubnis erteilt" und „Erlaubnisse nicht
 * lesbar" entsteht erst im Speicher, und genau er entscheidet, ob ein Beleg
 * still von der Seite faellt oder ohne Ja darauf steht.
 *
 *   F1  Erfassen — vollstaendig, mit Akteur und Chronik
 *   F2  Zweimal dasselbe erfassen ist EINE Erlaubnis
 *   F3  Ohne Freigabe deckt nichts (A13)
 *   F4  Die Form begrenzt den Umfang — eine oeffentliche Bewertung traegt
 *       ein Zitat, kein Logo
 *   F5  Widerruf wirkt sofort, die Zeile bleibt, der Grund steht dabei (A14)
 *   F6  Zweiter Widerruf wirkt nicht erneut — niemand hat zweimal widersprochen
 *   F7  Nach dem Widerruf deckt die Lage wieder nichts
 *   F8  Der Widerruf des Namens laesst auch die Fallstudie fallen — und eine
 *       neue Namensfreigabe traegt sie wieder
 *
 * Aufruf: FREIGABE_DRILL_URL=postgres://localhost/drill_freigabe npm run freigabe-drill
 */
import pg from "pg"
import { randomUUID } from "node:crypto"

import { requireSafeTarget } from "./lib/env-guard.mjs"

const ZIEL = process.env.FREIGABE_DRILL_URL || "postgres://localhost/drill_freigabe"
requireSafeTarget(ZIEL, "Freigabe-Probelauf")
process.env.LEAD_STORE = "pg-lokal"

const { SCHEMA, BACKFILL } = await import("../lib/neon-client.ts")
const { createNeonVertrieb } = await import("../lib/vertrieb-store-neon.ts")
const { deckung, gedeckteScopes, gueltig, benoetigtFuerLogo, benoetigtFuerFall } = await import("../lib/proof.ts")

let fehler = 0
const p = (ok, name, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

const client = new pg.Client({ connectionString: ZIEL })
await client.connect()
const q = async (t, params) => (await client.query(t, params ?? [])).rows
for (const stmt of SCHEMA) await q(stmt)
for (const stmt of BACKFILL) await q(stmt)

const store = createNeonVertrieb(ZIEL, { kennung: "owner", herkunft: "HUMAN" })

/** Aus einer erfassten Zeile wird die Freigabe, mit der `lib/proof.ts` rechnet. */
const alsRelease = (r) => ({
  by: r.by,
  form: r.form,
  at: r.grantedOn,
  scopes: r.scopes,
  reference: r.reference,
  withdrawnAt: r.withdrawnAt,
})

const orgId = randomUUID()
await q(
  `INSERT INTO organisations (id,name,lifecycle,created_at,updated_at)
   VALUES ($1,$2,'kunde',now(),now())`,
  [orgId, `Freigabe Betrieb ${orgId.slice(0, 8)}`],
)

const heute = new Date().toISOString().slice(0, 10)
const chronik = async (art) =>
  Number(
    (
      await q(
        `SELECT count(*)::int n FROM activities WHERE subject_type='organisation' AND subject_id=$1 AND kind=$2`,
        [orgId, art],
      )
    )[0].n,
  )

/* ═══ F1 · Erfassen ═══════════════════════════════════════════════════════ */
console.log("\nF1 · Eine Erlaubnis wird vollstaendig festgehalten")
const erste = await store.recordRelease({
  organisationId: orgId,
  name: "Frau Beispiel",
  role: "Geschäftsführung",
  company: "Beispiel GmbH",
  form: "e-mail",
  grantedOn: heute,
  scopes: ["name", "logo"],
  reference: "Postfach info@creadig.de, Betreff „Freigabe Logo“",
})
p(Boolean(erste?.id) && erste.neu === true, "erfasst")
p(await chronik("release.granted") === 1, "genau eine Chronikzeile")
{
  const liste = await store.listReleases(orgId)
  p(Array.isArray(liste) && liste.length === 1, "sie steht in der Liste")
  p(liste[0].actor === "owner", "mit dem Akteur, der sie erfasst hat", String(liste[0].actor))
  p(liste[0].by.name === "Frau Beispiel" && liste[0].reference.includes("Postfach"), "mit Person und Fundstelle")
  p(liste[0].withdrawnAt === null, "und sie ist gueltig")
}

/* ═══ F2 · Idempotenz ═════════════════════════════════════════════════════ */
console.log("\nF2 · Dieselbe Erlaubnis zweimal ist eine")
const nochmal = await store.recordRelease({
  organisationId: orgId,
  name: "Frau Beispiel",
  role: "Geschäftsführung",
  company: "Beispiel GmbH",
  form: "e-mail",
  grantedOn: heute,
  scopes: ["name", "logo"],
  reference: "Postfach info@creadig.de, Betreff „Freigabe Logo“",
})
p(nochmal?.neu === false && nochmal.id === erste.id, "zweiter Aufruf erzeugt keine zweite Zeile")
p(await chronik("release.granted") === 1, "und keine zweite Chronikzeile")
{
  const parallel = await Promise.all(
    Array.from({ length: 10 }, () =>
      store.recordRelease({
        organisationId: orgId,
        name: "Herr Parallel",
        role: "Leitung",
        company: "Beispiel GmbH",
        form: "vertrag",
        grantedOn: heute,
        scopes: ["fallstudie"],
        reference: "Vertragsordner 2026",
      }),
    ),
  )
  p(parallel.filter((r) => r?.neu).length === 1, "zehn gleichzeitig: genau eine neue Erlaubnis")
}

/* ═══ F3 · Ohne Freigabe deckt nichts (A13) ═══════════════════════════════ */
console.log("\nF3 · Ohne Erlaubnis ist nichts oeffentlich (A13)")
{
  const leer = deckung([], benoetigtFuerLogo(true))
  p(!leer.gedeckt, "Name und Logo sind ohne Erlaubnis nicht gedeckt")
  p(leer.fehlend.length === 2, "und es steht dabei, WAS fehlt", leer.fehlend.join(", "))
  p(gedeckteScopes([]).size === 0, "eine leere Lage deckt keinen einzigen Umfang")
}

/* ═══ F4 · Die Form begrenzt den Umfang ══════════════════════════════════ */
console.log("\nF4 · Die freundlichste Quelle erzeugt nicht die groesste Erlaubnis")
{
  const bewertung = {
    by: { name: "Kunde", role: "Inhaber", company: "Beispiel GmbH" },
    form: "oeffentlich-veroeffentlicht",
    at: heute,
    scopes: ["zitat", "logo"],
    reference: "https://example.invalid/bewertung",
  }
  const gedeckt = gedeckteScopes([bewertung])
  p(gedeckt.has("zitat"), "eine oeffentliche Bewertung traegt das Zitat")
  p(!gedeckt.has("logo"), "aber nicht das Logo — auch wenn es danebensteht")
}

/* ═══ F5–F7 · Widerruf (A14) ═════════════════════════════════════════════ */
console.log("\nF5–F7 · Der Widerruf wirkt sofort und loescht nichts (A14)")
{
  const vorher = (await store.listReleases(orgId)).find((r) => r.id === erste.id)
  p(deckung([alsRelease(vorher)], benoetigtFuerLogo(true)).gedeckt, "vorher: Name und Logo sind gedeckt")

  const ergebnis = await store.withdrawRelease(erste.id, "Kunde hat am Telefon widersprochen")
  p(ergebnis === "ok", "F5 Widerruf gelingt", String(ergebnis))
  p(await chronik("release.withdrawn") === 1, "F5 genau eine Chronikzeile")

  const nachher = (await store.listReleases(orgId)).find((r) => r.id === erste.id)
  p(Boolean(nachher), "F5 die Zeile bleibt stehen")
  p(Boolean(nachher.withdrawnAt), "F5 mit Zeitpunkt")
  p(nachher.withdrawnReason === "Kunde hat am Telefon widersprochen", "F5 und mit Grund")
  p(nachher.scopes.length === 2, "F5 der Umfang bleibt lesbar — man muss erklaeren koennen, was damals galt")
  p(!gueltig(alsRelease(nachher)), "F7 sie deckt nichts mehr")
  p(!deckung([alsRelease(nachher)], benoetigtFuerLogo(true)).gedeckt, "F7 Name und Logo sind wieder ungedeckt")

  const zweiter = await store.withdrawRelease(erste.id, "aus Versehen nochmal")
  p(zweiter === "schon-widerrufen", "F6 der zweite Widerruf wirkt nicht erneut", String(zweiter))
  p(await chronik("release.withdrawn") === 1, "F6 und schreibt keine zweite Zeile")
  const unveraendert = (await store.listReleases(orgId)).find((r) => r.id === erste.id)
  p(
    unveraendert.withdrawnReason === "Kunde hat am Telefon widersprochen",
    "F6 der erste Grund bleibt stehen",
  )
  p(await store.withdrawRelease("gibt-es-nicht", "x") === "fehlt", "F6 eine unbekannte Kennung meldet „fehlt“")
}

/* ═══ F8 · Der Widerruf zieht weiter, als er aussieht ════════════════════ */
console.log("\nF8 · Ein Widerruf reicht weiter als die eine Zeile")
{
  const alle = (await store.listReleases(orgId)).map(alsRelease)
  /*
   * Die zweite Erlaubnis deckt ausdruecklich „fallstudie" — und die
   * Fallstudie ist trotzdem nicht gedeckt: Sie VERLANGT auch den Namen, und
   * der hing an der widerrufenen ersten Zeile.
   *
   * Genau das ist der Grund, warum der Bedarf aus dem INHALT faellt und
   * nicht danebengeschrieben wird (`benoetigtFuerFall`). Wer ihn
   * danebenschriebe, koennte ihn kleinrechnen — und eine Fallstudie ueber
   * einen Kunden veroeffentlichen, der seinen Namen zurueckgezogen hat.
   */
  const fall = deckung(alle, benoetigtFuerFall({ metriken: 0, hatZitat: false }))
  p(!fall.gedeckt, "die Fallstudie faellt mit dem widerrufenen Namen")
  p(fall.fehlend.includes("name"), "und der Grund wird benannt", fall.fehlend.join(", "))
  p(!deckung(alle, benoetigtFuerLogo(true)).gedeckt, "das Logo bleibt ungedeckt")

  /* Ein neuer Name macht die Fallstudie wieder moeglich — ohne die alte Zeile anzufassen. */
  await store.recordRelease({
    organisationId: orgId,
    name: "Herr Parallel",
    role: "Leitung",
    company: "Beispiel GmbH",
    form: "vertrag",
    grantedOn: heute,
    scopes: ["name"],
    reference: "Vertragsordner 2026, Nachtrag Namensnennung",
  })
  const danach = (await store.listReleases(orgId)).map(alsRelease)
  p(
    deckung(danach, benoetigtFuerFall({ metriken: 0, hatZitat: false })).gedeckt,
    "eine neue Namensfreigabe traegt die Fallstudie wieder",
  )
  p(
    (await store.listReleases(orgId)).some((r) => r.withdrawnAt),
    "und die widerrufene Zeile steht weiterhin da",
  )
}

await client.end()
console.log(
  fehler === 0
    ? "\nAlle Pruefungen bestanden — Erlaubnis und Widerruf halten, und nichts wird geloescht.\n"
    : `\nABGEBROCHEN — ${fehler} Befund(e)\n`,
)
process.exit(fehler ? 1 : 0)
