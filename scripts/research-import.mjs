#!/usr/bin/env node
/**
 * ==========================================================================
 * RECHERCHE-ÜBERNAHME — DER FEHLENDE WEG NACH INNEN
 * ==========================================================================
 *
 * WARUM ES DIESES SKRIPT GIBT
 *
 * Gate 10 hat das Recherchemodell gebaut, Gate 11 das Entscheidungstor, Gate
 * 12 beides an sechs echten Betrieben bewiesen. In der Produktion standen
 * trotzdem NULL Vorgaenge — und der Grund war keine Bequemlichkeit:
 *
 *   `research_evidence` kann die Anwendung anlegen (`addResearchEvidence`).
 *   `research_cases`    kann sie NICHT. Kein einziges INSERT in app/ oder lib/.
 *
 * Gebaut wurden der Aktenschrank und der Stift. Der Weg, eine neue Akte
 * anzulegen, fehlte. Deshalb war die Tabelle leer — nicht, weil niemand
 * recherchiert hat, sondern weil das Ergebnis nirgends hin konnte.
 *
 * Dieses Skript ist dieser Weg. Es ist bewusst KEINE neue Oberflaeche und
 * kein zweites Recherchemodell: Es schreibt in genau die Tabellen, die G10
 * angelegt hat, mit genau den Regeln, die G09/G10/G11 aufgestellt haben.
 *
 * ---------------------------------------------------------------------------
 * WAS ER NIEMALS TUT
 *
 *   · keine Verkaufschance anlegen — auch nicht bei voller Ansprachedeckung
 *   · keine Kontaktentscheidung setzen; `contact_decision` bleibt NULL, und
 *     das ist kein fehlender Wert, sondern der Kern von Gate 11
 *   · keine Werbeeinwilligung — das Feld gibt es im Schema nicht
 *   · keine Nachricht, kein Profilabruf, keine Ansprache
 *   · keine Mailadresse und keine Rufnummer zu einer recherchierten Person
 *   · keinen Beleg ohne Fundstelle
 *   · keine Dublette gegen den eigenen Bestand zusammenfuehren, wo der Beleg
 *     nicht eindeutig ist — bei „wahrscheinlich" entscheidet ein Mensch
 *
 * ---------------------------------------------------------------------------
 * AUFRUF
 *
 *   npm run research-import                    Trockenlauf. Zeigt nur an.
 *   npm run research-import -- --apply         schreibt.
 *   npm run research-import -- --fall osnadach volmer becher
 *
 * Gegen ein Produktionsziel verlangt er zusaetzlich eine ausdrueckliche
 * Zustimmung — dieselbe Bauart wie bei `db-migrate` und `deploy`:
 *
 *   CREADIG_RESEARCH_IMPORT_PRODUCTION=ja-ich-schreibe-recherche-in-produktion
 *
 * Der generische Notausgang `CREADIG_ALLOW_UNSAFE_DB` reicht hier
 * ABSICHTLICH nicht. Eine Sperre, die man mit demselben Satz aufhebt wie
 * jede andere, ist keine Sperre mehr — sie wird zur Gewohnheit.
 */
import pg from "pg"
import { randomUUID } from "node:crypto"
import { readFileSync } from "node:fs"
import { databaseKind } from "./lib/env-guard.mjs"
import { KOHORTE, ERHOBEN_AM } from "./lib/g12-kohorte.mjs"

const schreiben = process.argv.includes("--apply")

/* Welche Faelle? Ohne Angabe die drei, die zusammen die verschiedenen
   Systemzustaende zeigen — passend, unklar, und eine andere Zugangslage. */
const SCHLIESSUNG = ["osnadach", "volmer", "becher"]
const gewaehlt = (() => {
  const i = process.argv.indexOf("--fall")
  if (i === -1) return SCHLIESSUNG
  const rest = process.argv.slice(i + 1).filter((a) => !a.startsWith("--"))
  return rest.length ? rest : SCHLIESSUNG
})()

const faelle = KOHORTE.filter((k) => gewaehlt.includes(k.key))
if (faelle.length !== gewaehlt.length) {
  console.error(`Unbekannter Fall. Verfuegbar: ${KOHORTE.map((k) => k.key).join(", ")}`)
  process.exit(2)
}

const ZIEL =
  process.env.RESEARCH_IMPORT_URL ||
  process.env.DATABASE_URL ||
  (() => { try { return readFileSync("/tmp/creadig-prod-db.url", "utf8").trim() } catch { return "" } })()
if (!ZIEL) { console.error("Kein Ziel. RESEARCH_IMPORT_URL setzen."); process.exit(2) }

const db = databaseKind(ZIEL)
console.log(`\n  Ziel:   ${db.host}/${db.db}  (${db.kind})`)
console.log(`  Modus:  ${schreiben ? "SCHREIBEN" : "Trockenlauf — es wird nichts geaendert"}`)
console.log(`  Faelle: ${faelle.map((f) => f.key).join(", ")}\n`)

/*
 * Die Zustimmungssperre. Sie greift bei allem, was nicht erkennbar auf
 * diesem Rechner liegt — `managed` (Neon) und `unknown`. Im Zweifel greift
 * sie: Eine unbekannte Adresse kann Produktion sein.
 */
if (schreiben && !["disposable", "local"].includes(db.kind)) {
  if (process.env.CREADIG_RESEARCH_IMPORT_PRODUCTION !== "ja-ich-schreibe-recherche-in-produktion") {
    console.error(
      `  ABGEBROCHEN. Dieses Ziel liegt nicht auf diesem Rechner (${db.kind}: ${db.host}).\n` +
      `  Recherche dorthin zu schreiben ist eine Entscheidung, kein Nebeneffekt.\n\n` +
      `  Wenn Sie sie wollen:\n` +
      `    CREADIG_RESEARCH_IMPORT_PRODUCTION=ja-ich-schreibe-recherche-in-produktion \\\n` +
      `      npm run research-import -- --apply\n\n` +
      `  Vorher ansehen, ohne etwas zu aendern:\n` +
      `    npm run research-import\n`)
    process.exit(3)
  }
  console.log("  Zustimmung fuer ein Produktionsziel liegt vor.\n")
}

const c = new pg.Client({ connectionString: ZIEL })
await c.connect()
const q = async (t, ps = []) => (await c.query(t, ps)).rows
const z = async (t, ps = []) => Number((await q(t, ps))[0].n)

const R = await import("../lib/research.ts")

/* ── Der Stand vorher. Alles Weitere wird dagegen gemessen. ─────────────── */
const vorher = {
  faelle: await z("SELECT count(*) n FROM research_cases"),
  belege: await z("SELECT count(*) n FROM research_evidence"),
  chancen: await z("SELECT count(*) n FROM opportunities"),
  entscheidungen: await z("SELECT count(*) n FROM research_cases WHERE contact_decision IS NOT NULL"),
  organisationen: await z("SELECT count(*) n FROM organisations"),
  kontakte: await z("SELECT count(*) n FROM contacts"),
}
console.log(`  vorher: ${vorher.faelle} Vorgaenge · ${vorher.belege} Belege · ${vorher.chancen} Chancen · ` +
  `${vorher.entscheidungen} Entscheidungen · ${vorher.organisationen} Organisationen\n`)

const bestand = (await q("SELECT id,name,website FROM organisations WHERE excluded_reason IS NULL"))
  .map((o) => ({ id: o.id, name: o.name, website: o.website }))

let abbruch = false
const plan = []

for (const k of faelle) {
  const treffer = R.matchOrganisation({ name: k.name, website: k.website }, bestand)

  /*
   * „wahrscheinlich" ist kein Auftrag zum Zusammenfuehren.
   *
   * G10: Die Netzadresse fuehrt exakt zusammen, ein gefalteter Name ist ein
   * Hinweis. Ein Skript, das den Hinweis wie einen Beweis behandelt, haengt
   * fremde Recherche an einen echten Kunden. Also: anhalten und fragen.
   */
  if (treffer.kind === "wahrscheinlich") {
    console.log(`  ANHALTEN  ${k.name}`)
    console.log(`            ${treffer.warum}`)
    console.log(`            Ein Mensch muss bestaetigen, ob das derselbe Betrieb ist.\n`)
    abbruch = true
    continue
  }

  const vorhanden = treffer.kind === "exakt"
  const orgId = vorhanden ? treffer.organisationId : randomUUID()
  const schonVorgang = vorhanden
    ? await z("SELECT count(*) n FROM research_cases WHERE organisation_id=$1", [orgId])
    : 0

  plan.push({ k, orgId, vorhanden, schonVorgang })

  console.log(`  ${schonVorgang ? "UEBERSPRINGEN" : "NEU"}  ${k.name}`)
  console.log(`        Organisation   ${vorhanden ? "bestehende wiederverwenden" : "neu anlegen"}`)
  console.log(`        Warum entdeckt ${k.discoveryWhy.slice(0, 88)}`)
  console.log(`        Belege         ${k.evidence.length}, jeder mit Fundstelle`)
  console.log(`        Person         ${k.person ? `${k.person.role} · Fundstelle ${k.person.sourceKind}` : "keine — und das bleibt so"}`)
  console.log(`        Zugang         ${k.access ?? "nicht recherchiert"}`)
  console.log(`        Anlass         ${k.evidence.some((e) => e.kind === "anlass") ? "belegt" : "keiner"}`)
  console.log(`        Entscheidung   NULL — die trifft ein Mensch\n`)
}

if (abbruch) {
  console.error("  Mindestens ein Fall braucht eine menschliche Bestaetigung. Nichts geschrieben.\n")
  await c.end()
  process.exit(4)
}

if (!schreiben) {
  console.log("  Trockenlauf beendet. Es wurde NICHTS geaendert.")
  console.log("  Zum Schreiben mit --apply aufrufen.\n")
  await c.end()
  process.exit(0)
}

/* ── Schreiben ──────────────────────────────────────────────────────────── */

for (const { k, orgId, vorhanden, schonVorgang } of plan) {
  if (schonVorgang) continue

  if (!vorhanden) {
    await q(`INSERT INTO organisations (id,name,lifecycle,website,created_at,updated_at)
             VALUES ($1,$2,'unbekannt',$3,now(),now()) ON CONFLICT (lower(name)) DO NOTHING`,
      [orgId, k.name, k.website])
  }
  const echteOrgId = (await q("SELECT id FROM organisations WHERE lower(name)=lower($1)", [k.name]))[0].id

  const caseId = randomUUID()
  await q(`INSERT INTO research_cases
             (id,organisation_id,status,discovery_why,discovery_kind,discovery_url,
              access,serviceable,created_at,updated_at)
           VALUES ($1,$2,'in-recherche',$3,$4,$5,$6,$7,now(),now())
           ON CONFLICT (organisation_id) DO NOTHING`,
    [caseId, echteOrgId, k.discoveryWhy, k.discoveryKind, k.discoveryUrl, k.access, k.serviceable])
  const fallId = (await q("SELECT id FROM research_cases WHERE organisation_id=$1", [echteOrgId]))[0].id

  for (const b of k.evidence) {
    if (!b.sourceUrl) throw new Error(`Beleg ohne Fundstelle bei ${k.name} — abgebrochen`)
    await q(`INSERT INTO research_evidence
               (id,case_id,kind,ref,claim,source_url,source_kind,observed_at,created_at)
             VALUES (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,now())`,
      [fallId, b.kind, b.ref, R.sanitizeClaim(b.claim), b.sourceUrl, b.sourceKind, b.observedAt ?? ERHOBEN_AM])
  }

  /* Die Person: Rolle und Fundstelle. Keine Mailadresse, keine Nummer —
     fuer die Kette traegt der Name nichts bei, die Fundstelle alles. */
  if (k.person) {
    const pid = randomUUID()
    await q(`INSERT INTO contacts (id,organisation_id,name,role,relationship,source_url,source_kind,created_at,updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,now(),now())`,
      [pid, echteOrgId, k.person.name, k.person.role, k.person.relationship, k.person.sourceUrl, k.person.sourceKind])
    await q("UPDATE research_cases SET contact_id=$2 WHERE id=$1", [fallId, pid])
  }

  /* Der Zustand faellt aus den Belegen — er wird nicht behauptet. */
  const fall = await ladeFall(fallId)
  const stop = R.abbruch(fall)
  await q("UPDATE research_cases SET status=$2, next_action=$3, researched_at=now(), updated_at=now() WHERE id=$1",
    [fallId, stop.state, stop.warum])
  console.log(`  geschrieben  ${k.name} -> ${stop.state}`)
}

async function ladeFall(id) {
  const r = (await q(`SELECT rc.*, o.name AS organisation_name FROM research_cases rc
      JOIN organisations o ON o.id=rc.organisation_id WHERE rc.id=$1`, [id]))[0]
  const ev = await q("SELECT * FROM research_evidence WHERE case_id=$1", [id])
  return {
    id: r.id, organisationId: r.organisation_id, organisationName: r.organisation_name, status: r.status,
    discoveryWhy: r.discovery_why, discoveryKind: r.discovery_kind, discoveryUrl: r.discovery_url,
    access: r.access, serviceable: r.serviceable, nextAction: r.next_action,
    discoveredAt: r.discovered_at.toISOString(), researchedAt: r.researched_at?.toISOString() ?? null,
    contactId: r.contact_id, contactDecision: r.contact_decision,
    contactDecisionAt: r.contact_decision_at?.toISOString() ?? null, contactDecisionNote: r.contact_decision_note,
    evidence: ev.map((e) => ({ id: e.id, kind: e.kind, ref: e.ref, claim: e.claim, sourceUrl: e.source_url,
      sourceKind: e.source_kind, observedAt: e.observed_at.toISOString(), supersededBy: e.superseded_by })),
  }
}

/* ── Rueckmessung. Was sich NICHT geaendert hat, ist der eigentliche Beweis. ── */
const nachher = {
  faelle: await z("SELECT count(*) n FROM research_cases"),
  belege: await z("SELECT count(*) n FROM research_evidence"),
  chancen: await z("SELECT count(*) n FROM opportunities"),
  entscheidungen: await z("SELECT count(*) n FROM research_cases WHERE contact_decision IS NOT NULL"),
  organisationen: await z("SELECT count(*) n FROM organisations"),
  kontakte: await z("SELECT count(*) n FROM contacts"),
  ohneQuelle: await z("SELECT count(*) n FROM research_evidence WHERE source_url IS NULL OR source_url=''"),
  mitMail: await z("SELECT count(*) n FROM contacts WHERE source_kind IN ('impressum','presse','website') AND (email IS NOT NULL OR phone IS NOT NULL)"),
}

console.log("\n  Rueckmessung")
const zeile = (n, a, b, muss) => {
  const d = b - a
  const ok = muss === undefined ? true : d === muss
  console.log(`  ${ok ? "ok  " : "FEHL"} ${n.padEnd(26)} ${String(a).padStart(4)} -> ${String(b).padStart(4)}   Delta ${d >= 0 ? "+" : ""}${d}`)
  return ok
}
let gut = true
gut = zeile("Vorgaenge", vorher.faelle, nachher.faelle) && gut
gut = zeile("Belege", vorher.belege, nachher.belege) && gut
gut = zeile("Organisationen", vorher.organisationen, nachher.organisationen) && gut
gut = zeile("Kontakte", vorher.kontakte, nachher.kontakte) && gut
gut = zeile("Verkaufschancen", vorher.chancen, nachher.chancen, 0) && gut
gut = zeile("Kontaktentscheidungen", vorher.entscheidungen, nachher.entscheidungen, 0) && gut
console.log(`  ${nachher.ohneQuelle === 0 ? "ok  " : "FEHL"} Belege ohne Fundstelle     ${nachher.ohneQuelle}`)
console.log(`  ${nachher.mitMail === 0 ? "ok  " : "FEHL"} recherchierte Person mit Mail/Nummer  ${nachher.mitMail}`)
gut = gut && nachher.ohneQuelle === 0 && nachher.mitMail === 0

console.log(`\n  ${gut ? "Geschrieben. Kein Vertrieb, kein Consent, keine Entscheidung entstanden." : "ABWEICHUNG — pruefen."}\n`)
await c.end()
process.exit(gut ? 0 : 1)
