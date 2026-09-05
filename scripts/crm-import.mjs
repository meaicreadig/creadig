#!/usr/bin/env node
/**
 * Import echter Kontakte — mit Trockenlauf als Voreinstellung.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE DATEN NICHT IM QUELLTEXT STEHEN
 * `lib/vertrieb-bestand.ts` traegt Organisationen und Rollen — keine
 * Rufnummern, keine Privatadressen, keine E-Mail-Adressen von Personen. Das
 * ist eine Sperre aus Gate 01 und sie bleibt: Ein Repository wird geklont,
 * gesichert, durchsucht und irgendwann geteilt. Eine Mobilnummer, die einmal
 * in der Historie steht, steht dort fuer immer.
 *
 * Deshalb liest dieses Skript aus einer Datei AUSSERHALB des Repos. Der
 * Eigentuemer legt sie an, der Import liest sie, niemand committet sie.
 *
 * ---------------------------------------------------------------------------
 * WAS ER NIEMALS TUT
 *   · keine Verkaufschance anlegen — auch nicht fuer einen bestaetigten Kunden
 *   · kein vorhandenes Feld ueberschreiben, das ein Mensch gefuellt hat
 *   · keine fehlende Angabe erfinden, ergaenzen oder nachschlagen
 *   · keine Beziehung ableiten („steht in der Datei" heisst nicht „Prospect")
 *   · nichts loeschen
 *   · nichts zusammenfuehren, wo der Beleg nicht eindeutig ist
 *
 * ---------------------------------------------------------------------------
 * AUFRUF
 *   node --import ./scripts/lib/alias-hook.mjs scripts/crm-import.mjs <datei>
 *   … zeigt nur an.  Mit --apply wird geschrieben.
 */
import pg from "pg"
import { readFileSync } from "node:fs"
import { requireSafeTarget } from "./lib/env-guard.mjs"
import { AUSGESCHLOSSENE_NAMEN, AUSGESCHLOSSENE_MAIL_ENDUNG } from "../lib/vertrieb-bestand.ts"

const datei = process.argv[2]
const schreiben = process.argv.includes("--apply")
if (!datei) {
  console.error("Aufruf: crm-import.mjs <datei.json> [--apply]")
  process.exit(2)
}

const ZIEL = process.env.CRM_IMPORT_URL || process.env.DATABASE_URL
if (!ZIEL) { console.error("Kein Ziel: CRM_IMPORT_URL setzen."); process.exit(2) }
requireSafeTarget(ZIEL, schreiben ? "CRM-Import (schreibend)" : "CRM-Import (Trockenlauf)")

const quelle = JSON.parse(readFileSync(datei, "utf8"))
const client = new pg.Client({ connectionString: ZIEL })
await client.connect()

const zaehler = { ANLEGEN: 0, ERGAENZEN: 0, UNVERAENDERT: 0, KONFLIKT: 0, AUSGESCHLOSSEN: 0 }
const zeilen = []
const merke = (art, was, detail) => { zaehler[art]++; zeilen.push({ art, was, detail }) }

/*
 * Rufnummern vergleichbar machen.
 *
 * „+49 171 0000000" und „0171 0000000" sind dieselbe Nummer. Ohne diese
 * Umrechnung meldet der Import sie als zwei Menschen — und beim naechsten
 * Anruf ruft jemand zweimal denselben an. Dasselbe fuer die Schweiz (+41),
 * weil ein Teil des Bestands dort sitzt.
 *
 * Bewusst KEINE Bibliothek und keine Weltformel: zwei Laender, eine Regel,
 * nachlesbar in drei Zeilen.
 */
const nummer = (roh) => {
  const z = String(roh ?? "").replace(/\D/g, "")
  if (!z) return ""
  if (z.startsWith("49")) return `0${z.slice(2)}`
  if (z.startsWith("41")) return `0${z.slice(2)}`
  return z
}

/*
 * Namen fuer den VERGLEICH falten — nie fuer die Anzeige.
 *
 * Deutsch schreibt denselben Namen auf zwei Arten: „Müller" und „Mueller".
 * Nur den Umlaut zu ersetzen genuegt nicht — dann wird aus dem einen
 * „muller" und aus dem anderen „mueller", und die beiden finden sich
 * wieder nicht. Also beide Wege auf dieselbe Form: erst ä/ö/ü/ß, dann
 * ae/oe/ue/ss.
 *
 * Das faltet gelegentlich zu viel („Feuer" wird zu „Fur"). Das ist
 * hingenommen und zwar bewusst: Diese Funktion fuehrt NICHTS zusammen, sie
 * MELDET nur. Ein Fehlalarm kostet einen Blick; eine uebersehene Dublette
 * kostet eine zweite Kundenakte, die niemand mehr zusammenbringt.
 */
const fold = (roh) =>
  String(roh ?? "").trim().toLowerCase()
    .replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "s")
    .replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u").replace(/ss/g, "s")

const ausgeschlossen = (name, mail) =>
  AUSGESCHLOSSENE_NAMEN.some((e) => e.name.toLowerCase() === String(name ?? "").trim().toLowerCase()) ||
  String(mail ?? "").toLowerCase().endsWith(AUSGESCHLOSSENE_MAIL_ENDUNG)

const gesehen = []

/* ── Organisationen ──────────────────────────────────────────────────────── */
for (const org of quelle.organisationen ?? []) {
  if (ausgeschlossen(org.name)) { merke("AUSGESCHLOSSEN", org.name, "steht auf der Ausschlussliste"); continue }
  const da = (await client.query(
    "SELECT id, name, city, street, phone FROM organisations WHERE import_key=$1 OR lower(name)=lower($2)",
    [org.importKey, org.name])).rows[0]

  if (!da) {
    /*
     * „Mueller GmbH" und „Müller GmbH" sind fuer eine Datenbank zwei Namen
     * und fuer einen Menschen meistens einer. Automatisch zusammenfuehren
     * waere falsch — es GIBT Betriebe, die sich nur im Umlaut unterscheiden.
     * Automatisch trennen ist aber genauso falsch, denn dann stehen morgen
     * zwei Kundenakten desselben Kunden nebeneinander.
     *
     * Also: melden und einen Menschen entscheiden lassen.
     */
    /* Dieselbe Faltung wie oben — hier in der Datenbank, damit der Vergleich
       auf beiden Seiten derselbe ist. */
    const nah = (await client.query("SELECT name, city FROM organisations")).rows
      .find((r) => fold(r.name) === fold(org.name))
    /* Auch innerhalb DERSELBEN Datei: „Mueller GmbH" und „Müller GmbH" stehen
       oft in einer Liste nebeneinander, und dann existiert noch keine von
       beiden in der Datenbank. */
    const nahInDatei = gesehen.find((n) => fold(n) === fold(org.name))
    gesehen.push(org.name)
    if (nah) merke("KONFLIKT", org.name, `fast gleich mit „${nah.name}“ (${nah.city ?? "ohne Ort"}) — von Hand entscheiden`)
    else if (nahInDatei) merke("KONFLIKT", org.name, `fast gleich mit „${nahInDatei}“ in derselben Datei — von Hand entscheiden`)
    else merke("ANLEGEN", org.name, org.city ?? "ohne Ort")
    continue
  }

  /* Ergaenzen heisst: nur LEERE Felder fuellen. Was dasteht, bleibt. */
  const luecken = ["city", "street", "phone"].filter((f) => !da[f] && org[f === "city" ? "city" : f])
  if (luecken.length) merke("ERGAENZEN", org.name, `leere Felder: ${luecken.join(", ")}`)
  else merke("UNVERAENDERT", org.name, "alle belegten Felder bleiben")
}

/* ── Kontakte ────────────────────────────────────────────────────────────── */
for (const person of quelle.kontakte ?? []) {
  if (ausgeschlossen(person.name, person.email)) {
    merke("AUSGESCHLOSSEN", person.name, "Ausschlussliste oder Testadresse"); continue
  }
  const mail = person.email ? person.email.trim().toLowerCase() : null

  /* Regel: nur die normalisierte E-Mail fuehrt zwei Datensaetze zusammen.
     Gleicher Nachname ist kein Beleg. Gleiche Rufnummer auch nicht — ein
     Buero teilt sich eine Nummer. Beides meldet KONFLIKT statt zu mischen. */
  const perMail = mail
    ? (await client.query("SELECT id, name FROM contacts WHERE lower(email_normalised)=$1", [mail])).rows[0]
    : null
  const perSchluessel = (await client.query("SELECT id, name FROM contacts WHERE import_key=$1", [person.importKey])).rows[0]

  if (perSchluessel) { merke("UNVERAENDERT", person.name, "bereits importiert"); continue }
  if (perMail) {
    if (perMail.name.trim().toLowerCase() === person.name.trim().toLowerCase())
      merke("ERGAENZEN", person.name, "gleiche Adresse, gleicher Name")
    else
      merke("KONFLIKT", person.name, `gleiche Adresse, anderer Name: „${perMail.name}“ — von Hand pruefen`)
    continue
  }
  if (person.phone) {
    const alle = (await client.query("SELECT name, phone FROM contacts WHERE phone IS NOT NULL")).rows
    const gleicheNummer = alle.filter((r) => nummer(r.phone) === nummer(person.phone))
    const selbe = gleicheNummer.find((r) => fold(r.name) === fold(person.name))
    if (selbe) { merke("UNVERAENDERT", person.name, "gleiche Nummer, gleicher Name — bereits vorhanden"); continue }
    if (gleicheNummer.length) {
      merke("KONFLIKT", person.name, `Nummer bereits bei „${gleicheNummer[0].name}“ — gemeinsames Buero? von Hand pruefen`)
      continue
    }
  }
  /*
   * Gleicher Name, ANDERE Adresse.
   *
   * Vorher legte der Import hier stillschweigend einen zweiten Menschen an.
   * Das ist die zweite Haelfte des Dublettenproblems: Nicht nur falsches
   * Zusammenfuehren schadet — falsches Trennen auch. Wer die Adresse
   * gewechselt hat, steht danach zweimal in der Akte, und die Historie
   * verteilt sich auf beide.
   *
   * Automatisch entscheiden laesst es sich nicht: Ein wiederkehrender Name
   * kann derselbe Mensch mit neuer Adresse sein — oder ein zweiter Mensch,
   * der zufaellig genauso heisst.
   * Also melden, nicht raten.
   */
  const gleicherName = (await client.query("SELECT name, email FROM contacts")).rows
    .filter((r) => fold(r.name) === fold(person.name))
  if (gleicherName.length) {
    merke("KONFLIKT", person.name,
      `Name existiert bereits (${gleicherName[0].email ?? "ohne Adresse"}) — derselbe Mensch mit neuer Adresse oder ein zweiter? von Hand pruefen`)
    continue
  }

  const fehlt = ["email", "phone", "organisationKey"].filter((f) => !person[f])
  merke("ANLEGEN", person.name, fehlt.length ? `ohne: ${fehlt.join(", ")}` : "vollstaendig")
}

/* ── Ausgabe ─────────────────────────────────────────────────────────────── */
console.log(`\n${schreiben ? "IMPORT" : "TROCKENLAUF"} · ${datei}\n`)
for (const z of zeilen) console.log(`  ${z.art.padEnd(15)} ${z.was.padEnd(38)} ${z.detail}`)
console.log("\n  " + Object.entries(zaehler).map(([k, v]) => `${k}=${v}`).join("  ") + "\n")
console.log(`  Verkaufschancen angelegt: 0 — dieses Skript legt keine an.\n`)

if (!schreiben) {
  console.log("  Nichts geschrieben. Mit --apply ausfuehren.\n")
  await client.end()
  process.exit(0)
}

if (zaehler.KONFLIKT > 0) {
  console.log("  ABGEBROCHEN: Konflikte offen. Erst von Hand entscheiden — es wurde nichts geschrieben.\n")
  await client.end()
  process.exit(1)
}

/* ── Schreiben ───────────────────────────────────────────────────────────── *
 * Erst hier, und nur, wenn der Trockenlauf oben keinen Konflikt gefunden hat.
 * Jedes Feld geht ueber `coalesce(vorhanden, neu)`: Was ein Mensch eingetragen
 * hat, gewinnt gegen die Datei — dieselbe Regel wie im Bestandsimport.
 * Verkaufschancen kommen hier nicht vor; das ist keine Auslassung, das ist
 * der Punkt.
 * ------------------------------------------------------------------------- */
const anzulegen = new Set(zeilen.filter((z) => z.art === "ANLEGEN" || z.art === "ERGAENZEN").map((z) => z.was))

for (const org of quelle.organisationen ?? []) {
  if (!anzulegen.has(org.name)) continue
  await client.query(
    `INSERT INTO organisations
       (id, name, lifecycle, website, phone, street, postal_code, city, country,
        industry, note, import_key, created_at, updated_at)
     VALUES (gen_random_uuid()::text, $1::text, $2::text, $3::text, $4::text, $5::text,
             $6::text, $7::text, $8::text, $9::text, $10::text, $11::text, now(), now())
     ON CONFLICT (lower(name)) DO UPDATE SET
       import_key  = coalesce(organisations.import_key, excluded.import_key),
       phone       = coalesce(organisations.phone, excluded.phone),
       street      = coalesce(organisations.street, excluded.street),
       postal_code = coalesce(organisations.postal_code, excluded.postal_code),
       city        = coalesce(organisations.city, excluded.city),
       country     = coalesce(organisations.country, excluded.country),
       note        = coalesce(organisations.note, excluded.note),
       updated_at  = now()`,
    [org.name, org.lifecycle ?? "unbekannt", org.website ?? null, org.phone ?? null,
     org.street ?? null, org.postalCode ?? null, org.city ?? null, org.country ?? null,
     org.industry ?? null, org.note ?? null, org.importKey])

  for (const ort of org.standorte ?? []) {
    await client.query(
      `INSERT INTO locations (id, organisation_id, label, street, postal_code, city, country,
                              import_key, created_at, updated_at)
       SELECT gen_random_uuid()::text, o.id, $1::text, $2::text, $3::text, $4::text, $5::text,
              $6::text, now(), now()
         FROM organisations o WHERE o.import_key = $7::text
       ON CONFLICT (import_key) DO NOTHING`,
      [ort.label, ort.street ?? null, ort.postalCode ?? null, ort.city ?? null,
       ort.country ?? null, ort.importKey, org.importKey])
  }
}

for (const person of quelle.kontakte ?? []) {
  if (!anzulegen.has(person.name)) continue
  const mail = person.email ? person.email.trim().toLowerCase() : null
  await client.query(
    `INSERT INTO contacts
       (id, organisation_id, name, email, email_normalised, phone, relationship, role,
        note, import_key, created_at, updated_at)
     SELECT gen_random_uuid()::text,
            (SELECT id FROM organisations WHERE import_key = $1::text),
            $2::text, $3::text, $4::text, $5::text, $6::text, $7::text, $8::text, $9::text,
            now(), now()
     ON CONFLICT (import_key) DO NOTHING`,
    [person.organisationKey ?? null, person.name, person.email ?? null, mail,
     person.phone ?? null, person.relationship ?? "unbekannt", person.role ?? null,
     person.note ?? null, person.importKey])
}

const chancen = Number((await client.query("SELECT count(*) n FROM opportunities")).rows[0].n)
console.log(`  Geschrieben. Verkaufschancen in der Datenbank: ${chancen}\n`)
await client.end()
