#!/usr/bin/env node
/**
 * ADM-04 · VERBINDUNGS-PROBELAUF — A15 bis A18 ohne echten Anbieter
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER BEWIESEN WIRD
 *
 *   V0   Das Inventar ist ehrlich: kein erfundener Zugang, kein grüner Haken
 *        über einem Kanal, der nur eine Adresse ist.
 *   V1   Der Zustand folgt der Umgebung — nicht einer gepflegten Liste.
 *   A15  Verbinden / Widerrufen → ehrlicher Zustand, keine Zombie-Erlaubnis.
 *   A16  Derselbe Webhook zweimal → genau eine Wirkung. Auch zehnmal parallel.
 *   A17  Anbieterfehler → DEGRADED, kein stiller Erfolg, Erlaubnis bleibt.
 *   A18  Fähigkeit ≠ Autorisierung ≠ Adresse, dreimal getrennt gefragt.
 *   V2   Jeder Maschinenwert, den das Inventar nennt, hat einen Text in DE
 *        UND TR. Ein fehlender Schlüssel wäre eine leere Zeile im Betrieb.
 *
 * Aufruf: node --import ./scripts/lib/alias-hook.mjs scripts/verbindung-drill.mjs
 */
import {
  VERBINDUNGS_GRUPPEN,
  VERBINDUNGS_IDS,
  VERBINDUNGS_ZUSTAENDE,
  eingangsLage,
  pruefstandAktiv,
  verbindungEintrag,
  verbindungenInventar,
  zustandSchwere,
} from "@/lib/verbindungen"
import {
  fixtureAnbieterFehler,
  fixtureCapabilitySchnitt,
  fixtureStand,
  fixtureVerbinden,
  fixtureWebhook,
  fixtureWiderrufen,
  fixtureZuruecksetzen,
} from "@/lib/verbindungen-fixture"
import { de } from "@/lib/admin-i18n/de"
import { tr } from "@/lib/admin-i18n/tr"

let fehler = 0
const p = (ok, name, detail = "") => {
  if (!ok) fehler++
  console.log(`  ${ok ? "ok  " : "FEHL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

/* Umgebungen als reine Objekte — der Drill fasst `process.env` nie an. */
const OHNE = {}
const MIT_DB = { LEAD_STORE: "neon", DATABASE_URL: "postgres://beispiel/x", RESEND_API_KEY: "k" }
const MIT_PRUEFSTAND = { ...MIT_DB, VERBINDUNG_FIXTURE: "an" }
const PRODUKTION = { ...MIT_PRUEFSTAND, VERCEL_ENV: "production" }

console.log("\nV0 · Das Inventar ist ehrlich")
const inv = verbindungenInventar(MIT_DB)
p(inv.length >= 8, `${inv.length} Kanäle inventarisiert`)
p(
  inv.every((e) => VERBINDUNGS_ZUSTAENDE.includes(e.zustand)),
  "nur bekannte Zustände",
)
p(
  inv.every((e) => VERBINDUNGS_GRUPPEN.includes(e.gruppe)),
  "jede Karte gehört zu einer Gruppe",
)
p(
  inv.every((e) => VERBINDUNGS_IDS.includes(e.id)),
  "jede Kennung ist angemeldet",
)
p(new Set(inv.map((e) => e.id)).size === inv.length, "keine Kennung doppelt")

/* Die eingefrorene Kritikalität (ADM-00 · OD-2) — nicht verhandelbar im Code. */
const kritisch = inv.filter((e) => e.kritikalitaet === "CRITICAL").map((e) => e.id).sort()
p(
  JSON.stringify(kritisch) === JSON.stringify(["manuelle-anfrage", "website-anfrage"]),
  "CRITICAL ist genau der Anfrage-Eingang",
  kritisch.join(", "),
)

/*
 * A18 als Struktureigenschaft: Eine Karte mit Adresse darf nie „verbunden“
 * heissen. Genau diese Verwechslung ist der Grund für das ganze Modell.
 */
p(
  inv.filter((e) => e.ebenen.profilLink).every((e) => e.zustand === "LINK_ONLY"),
  "eine Adresse allein heisst nie „verbunden“",
)
p(
  inv.filter((e) => e.zustand === "NOT_CONFIGURED").every((e) => e.ebenen.autorisierung === "keine" || e.beleg),
  "jedes „nicht eingerichtet“ nennt seinen Grund",
)
p(
  inv.every((e) => typeof e.beleg === "string" && e.beleg.length > 0),
  "jede Karte trägt einen Beleg",
)
p(
  inv.filter((e) => e.pruefbar).map((e) => e.id).join(",") ===
    "website-anfrage,manuelle-anfrage,email-ausgang",
  "prüfbar ist nur, was wirklich messbar ist",
)
p(zustandSchwere("ERROR") === "critical" && zustandSchwere("CONNECTED") === "neutral", "Schwere folgt dem Zustand")

console.log("\nV1 · Der Zustand folgt der Umgebung")
const ohne = verbindungenInventar(OHNE)
p(
  verbindungEintrag("website-anfrage", OHNE)?.zustand === "NOT_CONFIGURED",
  "ohne Speicher: Anfrageformular nicht eingerichtet",
)
p(
  verbindungEintrag("website-anfrage", MIT_DB)?.zustand === "CONNECTED",
  "mit Speicher: Anfrageformular eingerichtet",
)
p(
  verbindungEintrag("manuelle-anfrage", { LEAD_STORE: "neon" })?.zustand === "NOT_CONFIGURED",
  "LEAD_STORE ohne DATABASE_URL zählt nicht als eingerichtet",
)
p(
  verbindungEintrag("email-ausgang", OHNE)?.zustand === "NOT_CONFIGURED" &&
    verbindungEintrag("email-ausgang", MIT_DB)?.zustand === "CONNECTED",
  "Versand hängt am hinterlegten Zugang",
)
p(eingangsLage(ohne).gestoert.length === 2 && !eingangsLage(ohne).offen, "ohne Speicher: Eingang gestört")
p(eingangsLage(inv).offen, "mit Speicher: Eingang offen")
p(
  eingangsLage(inv).gestoert.length === 0,
  "ein nicht eingerichteter Optional-Kanal löst keine Eingangswarnung aus",
)

console.log("\nV1b · Der Prüfstand bleibt aus dem Betrieb heraus")
p(!pruefstandAktiv(OHNE), "ohne Schalter: aus")
p(pruefstandAktiv(MIT_PRUEFSTAND), "mit Schalter: an")
p(!pruefstandAktiv(PRODUKTION), "in Produktion: aus, auch mit Schalter")
p(!verbindungenInventar(OHNE).some((e) => e.gruppe === "pruefstand"), "ohne Schalter keine Testkarte")
p(
  verbindungenInventar(MIT_PRUEFSTAND).some((e) => e.id === "pruefanbieter"),
  "mit Schalter erscheint die Testkarte",
)
p(!verbindungenInventar(PRODUKTION).some((e) => e.gruppe === "pruefstand"), "in Produktion keine Testkarte")

console.log("\nA15 · Verbinden und Widerrufen")
fixtureZuruecksetzen()
p(fixtureStand().zustand === "NOT_CONFIGURED", "Start: nicht eingerichtet")
const c1 = fixtureVerbinden("owner")
p(c1.neu && fixtureStand().zustand === "CONNECTED" && fixtureStand().tokenGesetzt, "verbunden: Zustand + Erlaubnis")
const c2 = fixtureVerbinden("owner")
p(!c2.neu && c2.wirkung === "idempotent", "zweimal verbinden ist kein zweiter Kanal")
const r1 = fixtureWiderrufen("owner")
p(r1.neu && fixtureStand().zustand === "REVOKED" && !fixtureStand().tokenGesetzt, "widerrufen: Erlaubnis weg")
const r2 = fixtureWiderrufen("owner")
p(!r2.neu, "zweiter Widerruf wirkt nicht erneut")
p(
  fixtureStand().ereignisse[0]?.akteur === "owner",
  "jedes Ereignis trägt seinen Akteur",
)

console.log("\nA16 · Derselbe Webhook zweimal = eine Wirkung")
fixtureZuruecksetzen()
fixtureVerbinden("owner")
const w1 = fixtureWebhook("evt-1", "owner")
const w2 = fixtureWebhook("evt-1", "owner")
p(w1.ok && w1.neu, "erster Webhook wirkt")
p(w2.ok && !w2.neu && w2.wirkung === "idempotent", "zweiter gleicher Schlüssel: keine zweite Wirkung")
p(fixtureStand().wirkungen === 1, "genau eine Geschäftswirkung gezählt", String(fixtureStand().wirkungen))

/* Zehn gleichzeitig — derselbe Schlüssel, dieselbe Antwort. */
fixtureZuruecksetzen()
fixtureVerbinden("owner")
const parallel = await Promise.all(
  Array.from({ length: 10 }, () => Promise.resolve().then(() => fixtureWebhook("evt-parallel", "owner"))),
)
p(parallel.filter((a) => a.neu).length === 1, "10 gleichzeitig: genau einer wirkt")
p(fixtureStand().wirkungen === 1, "10 gleichzeitig: eine Wirkung gespeichert")

const verschieden = fixtureWebhook("evt-anders", "owner")
p(verschieden.neu && fixtureStand().wirkungen === 2, "ein anderer Schlüssel wirkt sehr wohl")

fixtureWiderrufen("owner")
const nachWiderruf = fixtureWebhook("evt-nach", "owner")
p(!nachWiderruf.ok && nachWiderruf.wirkung === "abgelehnt", "Webhook ohne Erlaubnis wird abgelehnt")
p(fixtureStand().zustand === "REVOKED", "ein abgelehnter Webhook ist kein Anbieterfehler")

console.log("\nA17 · Anbieterfehler ist kein stiller Erfolg")
fixtureZuruecksetzen()
fixtureVerbinden("owner")
const err = fixtureAnbieterFehler("owner", "timeout")
p(!err.ok && err.zustand === "DEGRADED", "Fehler → gestört, ok=false")
p(fixtureStand().tokenGesetzt, "die Erlaubnis bleibt — eine Störung ist kein Widerruf")
p(fixtureStand().letzteWirkung === "anbieterfehler", "die Störung steht im Protokoll")
p(fixtureStand().wirkungen === 0, "eine Störung erzeugt keine Geschäftswirkung")

console.log("\nA18 · Fähigkeit ≠ Autorisierung ≠ Adresse")
fixtureZuruecksetzen()
const s0 = fixtureCapabilitySchnitt()
p(!s0.faehigkeitAktiv && !s0.autorisierungVorhanden && s0.profilLink === null, "nichts aktiv, drei getrennte Antworten")
fixtureVerbinden("owner")
const s1 = fixtureCapabilitySchnitt()
p(s1.faehigkeitAktiv && s1.autorisierungVorhanden, "verbunden: Fähigkeit und Erlaubnis")
p(s1.profilLink === null, "eine Adresse entsteht dadurch nicht")
fixtureAnbieterFehler("owner")
const s2 = fixtureCapabilitySchnitt()
p(!s2.faehigkeitAktiv && s2.autorisierungVorhanden, "gestört: Erlaubnis ja, Fähigkeit nein")

console.log("\nV2 · Jeder Maschinenwert hat einen Text in DE und TR")
const alle = [...verbindungenInventar(MIT_PRUEFSTAND), ...verbindungenInventar(OHNE)]
const fehltIn = (woerterbuch, gruppe, schluessel) =>
  !Object.prototype.hasOwnProperty.call(woerterbuch.verbindungen[gruppe], schluessel)
const luecken = []
for (const e of alle) {
  for (const [gruppe, schluessel] of [
    ["kanal", e.kanal],
    ["zustand", e.zustand],
    ["beleg", e.beleg],
    ["faehigkeit", e.ebenen.faehigkeit],
    ["autorisierung", e.ebenen.autorisierung],
  ]) {
    if (fehltIn(de, gruppe, schluessel)) luecken.push(`DE ${gruppe}.${schluessel}`)
    if (fehltIn(tr, gruppe, schluessel)) luecken.push(`TR ${gruppe}.${schluessel}`)
  }
}
p(luecken.length === 0, "kein fehlender Text", luecken.join(", "))
for (const g of VERBINDUNGS_GRUPPEN) {
  p(Boolean(de.verbindungen.gruppe[g] && tr.verbindungen.gruppe[g]), `Gruppe ${g} benannt (DE/TR)`)
}
for (const z of VERBINDUNGS_ZUSTAENDE) {
  p(Boolean(de.verbindungen.zustand[z] && tr.verbindungen.zustand[z]), `Zustand ${z} benannt (DE/TR)`)
}

console.log(
  fehler === 0
    ? "\nAlle Pruefungen bestanden — Verbindungsmodell, Pruefstand und Texte halten.\n"
    : `\nABGEBROCHEN — ${fehler} Befund(e)\n`,
)
process.exit(fehler ? 1 : 0)
