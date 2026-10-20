#!/usr/bin/env node
/**
 * NETZWERK-PROBELAUF — prüft die Verbindungen, die der Netzwerk-Durchlauf
 * (docs: PROMPT-NETZWERK-100-VERBINDUNGEN.md) zwischen vorher getrennten
 * Systemen gelegt hat. Derselbe Anwendungscode wie in Produktion; nur die
 * Abfrage-Schicht zeigt auf eine Wegwerf-Postgres (scripts/lib/pg-abfrage.mjs).
 *
 *   N1  LinkedIn: EINE Verbindung für Werkstatt und Agent (assistent_linkedin)
 *   N2  Kampagnen-Versand: Zeile je Empfänger, Antwortadresse, kein Nachfassen
 *   N3  Eine Zeitleiste: Einzelmails und Kampagnen lassen sich getrennt laden
 *
 *   NETZWERK_DRILL_URL=postgres://localhost/drill_netzwerk npm run netzwerk-drill
 */
import { createCipheriv, createHash, randomBytes } from "node:crypto"
import pg from "pg"

process.env.NETZWERK_DRILL_URL ||= "postgres://localhost/drill_netzwerk"
process.env.LEAD_STORE = "neon"
process.env.ADMIN_SESSION_SECRET = "drill-geheimnis-nur-lokal"
process.env.LINKEDIN_CLIENT_ID = "drill-id"
process.env.LINKEDIN_CLIENT_SECRET = "drill-secret"
process.env.MAIL_EINGANG_DOMAIN = "eingang.example.test"

let fehler = 0
const p = (ok, name, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

const store = await import("../lib/assistent/store.ts")
const versand = await import("../lib/assistent/versand.ts")
const li = await import("../lib/linkedin.ts")

const roh = new pg.Client({ connectionString: process.env.NETZWERK_DRILL_URL })
await roh.connect()
const q = async (t, par) => (await roh.query(t, par ?? [])).rows
/* Wegwerf-Datenbank: jeder Lauf beginnt leer (requireSafeTarget in pg-abfrage.mjs erlaubt nur lokale/Wegwerf-Ziele). */
for (const t of ["assistent_linkedin", "assistent_freigaben", "linkedin_connection"]) await q(`DELETE FROM ${t}`).catch(() => undefined)

/* ═══ N1 · LinkedIn ═══ */
console.log("\nN1 · LinkedIn: eine Verbindung für Werkstatt und Agent")
{
  const vorher = await li.linkedinStatus()
  p(vorher.verbunden === false && vorher.konfiguriert === true, "N1 ohne Verbindung: nicht verbunden, aber konfiguriert")
  await store.speichereLinkedin({ kanal: "inhaber", accessToken: "tok", personUrn: "urn:li:person:abc", name: "Drill Inhaber", gueltigSek: 3600 })
  const nachher = await li.linkedinStatus()
  p(nachher.verbunden === true && nachher.name === "Drill Inhaber", "N1 die vom Agenten-Rückruf gespeicherte Verbindung sieht auch die Werkstatt", JSON.stringify(nachher))
  p((await store.ladeLinkedin("inhaber"))?.personUrn === "urn:li:person:abc", "N1 und der Agent liest dieselbe Zeile")
  await li.verbindungTrennen()
  p(!(await store.ladeLinkedin("inhaber")), "N1 Trennen in der Werkstatt trennt auch für den Agenten")

  /* Alte Verbindung (linkedin_connection) wird einmalig übernommen. */
  const key = createHash("sha256").update(`linkedin:${process.env.ADMIN_SESSION_SECRET}`).digest()
  const iv = randomBytes(12)
  const c = createCipheriv("aes-256-gcm", key, iv)
  const daten = Buffer.concat([c.update("alter-token", "utf8"), c.final()])
  const paket = [iv, c.getAuthTag(), daten].map((b) => b.toString("base64url")).join(".")
  await q(`CREATE TABLE IF NOT EXISTS linkedin_connection (id int PRIMARY KEY, person_urn text, name text, token_enc text, expires_at timestamptz, updated_at timestamptz)`)
  await q(`DELETE FROM linkedin_connection`)
  await q(`INSERT INTO linkedin_connection VALUES (1,'urn:li:person:alt','Alt Verbindung',$1, now() + interval '2 days', now())`, [paket])
  const uebernommen = await li.linkedinStatus()
  p(uebernommen.verbunden === true && uebernommen.name === "Alt Verbindung", "N1 eine noch gültige alte Verbindung wird übernommen", JSON.stringify(uebernommen))
  p((await store.ladeLinkedin("inhaber"))?.accessToken === "alter-token", "N1 der übernommene Token ist entschlüsselt und in assistent_linkedin")
  await li.verbindungTrennen()
  const nachTrennen = await li.linkedinStatus()
  p(nachTrennen.verbunden === false, "N1 getrennt bleibt getrennt (alte Verbindung wird nicht wiederbelebt)", JSON.stringify(nachTrennen))
}

/* ═══ N2 · Kampagnen-Versand ═══ */
console.log("\nN2 · Kampagnen-Versand ist zuordenbar, aber kein Nachfassen")
{
  const kampagneId = `kamp-${Date.now()}`
  const ids = [store.neueFreigabeId(), store.neueFreigabeId()]
  p(versand.eingangsAdresse(ids[0]) === `antwort+${ids[0]}@eingang.example.test`, "N2 jede Empfänger-Id ergibt eine eigene Antwortadresse")
  await versand.protokolliereKampagnenVersand([
    { id: ids[0], zustellungId: `z-${ids[0]}`, an: "a@example.test", betreff: "Drill-Kampagne", inhalt: "Text der Kampagne", kampagneId, mailId: "re_1" },
    { id: ids[1], zustellungId: `z-${ids[1]}`, an: "b@example.test", betreff: "Drill-Kampagne", inhalt: "Text der Kampagne", kampagneId },
  ])
  const zeilen = await q(`SELECT id, status, agent, empfaenger FROM assistent_freigaben WHERE extra->>'kampagneId' = $1 ORDER BY empfaenger`, [kampagneId])
  p(zeilen.length === 2 && zeilen.every((z) => z.status === "freigegeben" && z.agent === "kampagne"), "N2 je Empfänger eine gesendete Mail-Zeile", String(zeilen.length))
  p(zeilen.some((z) => z.id === ids[0]), "N2 die Zeilen-Id ist die Id aus der Antwortadresse (findeUrsprung kann sie finden)")

  /* Doppeltes Protokollieren (z. B. Wiederholung) legt keine zweite Zeile an. */
  await versand.protokolliereKampagnenVersand([{ id: store.neueFreigabeId(), zustellungId: `z-${ids[0]}`, an: "a@example.test", betreff: "Drill-Kampagne", inhalt: "x", kampagneId }])
  p((await q(`SELECT count(*)::int n FROM assistent_freigaben WHERE extra->>'kampagneId' = $1`, [kampagneId]))[0].n === 2, "N2 dieselbe Zustellung wird nicht doppelt protokolliert")

  /* Nachfassen: alte Kampagnen-Mail darf keinen Nachfass-Entwurf auslösen. */
  await q(`UPDATE assistent_freigaben SET extra = jsonb_set(extra, '{gesendetAt}', to_jsonb((now() - interval '30 days')::text)) WHERE extra->>'kampagneId' = $1`, [kampagneId])
  const ordentlich = store.neueFreigabeId()
  await store.legeFreigabeAn({ id: ordentlich, art: "mail", titel: "Erstansprache Drill", empfaenger: "c@example.test", betreff: "Hallo", inhalt: "Guten Tag,\n\nText", agent: "vertrieb", quelle: `drill:${ordentlich}`, extra: { gesendetAt: new Date(Date.now() - 30 * 86400_000).toISOString() } })
  await q(`UPDATE assistent_freigaben SET status='freigegeben' WHERE id=$1`, [ordentlich])
  await versand.nachfassen()
  const nachfass = await q(`SELECT extra->>'vorgaenger' v FROM assistent_freigaben WHERE extra ? 'vorgaenger'`)
  p(nachfass.some((r) => r.v === ordentlich), "N2 eine echte Erstansprache bekommt ihren Nachfass-Entwurf (Gegenprobe)")
  p(!nachfass.some((r) => ids.includes(r.v)), "N2 eine Kampagnen-Mail löst nie einen Nachfass aus")

  const ansprache = await versand.ladeAnsprache()
  const kampagnenInStatistik = await q(`SELECT count(*)::int n FROM assistent_freigaben WHERE extra ? 'kampagneId'`)
  p(kampagnenInStatistik[0].n === 2 && ansprache.gesendet >= 1, "N2 die Antwortquote der Erstansprachen zählt keine Kampagnen-Mails mit", `gesendet=${ansprache.gesendet}`)

  /* Antwort-Zuordnung */
  await versand.markiereAntwort(ids[0], { faden: false })
  const antworten = await versand.ladeKampagnenAntworten()
  p(antworten[kampagneId] === 1, "N2 eine Antwort wird der Kampagne zugerechnet", JSON.stringify(antworten[kampagneId]))

  /* N3 */
  console.log("\nN3 · Eine Zeitleiste")
  const mit = await versand.ladeVersandListe(100)
  const ohne = await versand.ladeVersandListe(100, { kampagnen: "ohne" })
  p(mit.some((z) => z.kampagneId === kampagneId && z.quelle === "kampagne"), "N3 die volle Liste kennt Kampagnen-Zeilen (quelle=kampagne)")
  p(!ohne.some((z) => z.kampagneId), "N3 die Zeitleiste lädt Einzelmails ohne die Zeilen je Empfänger")
  const unbeantwortet = mit.find((z) => z.id === ids[1])
  p(unbeantwortet?.status.art === "kampagne", "N3 eine unbeantwortete Kampagnen-Mail steht nicht als „Kette beendet“, sondern als Kampagne", unbeantwortet?.status.art)
}

/* ═══ N4 · Automation ↔ Truppe ═══ */
console.log("\nN4 · Zwei Motoren, eine Meldung")
{
  await q(`CREATE TABLE IF NOT EXISTS automation_runs (id text PRIMARY KEY, ausloeser text, ereignis text, gegenstand_art text, gegenstand text, schluessel text UNIQUE, wirkung text, zustand text DEFAULT 'offen')`)
  await q(`DELETE FROM automation_runs`)
  await q(`INSERT INTO automation_runs (id, ausloeser, ereignis, gegenstand_art, gegenstand, schluessel, wirkung, zustand) VALUES
    ('r1','abnahme-erinnert-an-freigabe','project.accepted','opportunity','deal-A','k1','erinnern','offen'),
    ('r2','abnahme-erinnert-an-freigabe','project.accepted','opportunity','deal-B','k2','erinnern','erledigt'),
    ('r3','verlust-prueft-muster','opportunity.status','opportunity','deal-C','k3','pruefen','offen')`)
  const erinnert = await store.offeneAutomationErinnerungen(["deal-A", "deal-B", "deal-C", "deal-D"])
  p(erinnert.has("deal-A"), "N4 offene Erinnerung am Deal: der Vertriebsagent meldet ihn nicht doppelt")
  p(!erinnert.has("deal-B"), "N4 eine erledigte Erinnerung unterdrückt nichts")
  p(!erinnert.has("deal-C"), "N4 nur Erinnerungen zählen als gleichwertig (eine Prüfung ist keine)")
  p(!erinnert.has("deal-D"), "N4 ein Deal ohne Automation-Eintrag bleibt Kandidat")
  await q(`DROP TABLE automation_runs`)
  p((await store.offeneAutomationErinnerungen(["deal-A"])).size === 0, "N4 fehlt die Tabelle, fällt die Truppe nicht aus (nichts offen)")
}

/* ═══ N5 · Betriebsalarm überwacht alle sieben Agenten ═══ */
console.log("\nN5 · Betriebsalarm")
{
  const alarm = await import("../lib/betrieb-alarm.ts")
  const truppe = await import("../lib/assistent/truppe.ts")
  const taeglich = truppe.AGENTEN.filter((a) => a.takt === "taeglich").map((a) => a.key).sort()
  const woechentlich = truppe.AGENTEN.filter((a) => a.takt === "woechentlich").map((a) => a.key).sort()
  p(JSON.stringify([...alarm.TAEGLICHE_AGENTEN].sort()) === JSON.stringify(taeglich), "N5 tägliche Liste = AGENTEN mit takt=taeglich", taeglich.join(","))
  p(JSON.stringify([...alarm.WOECHENTLICHE_AGENTEN].sort()) === JSON.stringify(woechentlich), "N5 wöchentliche Liste = AGENTEN mit takt=woechentlich", woechentlich.join(","))
  p(alarm.TAEGLICHE_AGENTEN.length + alarm.WOECHENTLICHE_AGENTEN.length === truppe.AGENTEN.length, "N5 jeder Agent der Truppe wird überwacht")
}

await roh.end()
console.log(fehler === 0 ? "\nAlle Pruefungen bestanden — die Systeme kennen sich.\n" : `\nABGEBROCHEN — ${fehler} Befund(e)\n`)
process.exit(fehler ? 1 : 0)
