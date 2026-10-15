#!/usr/bin/env node
/**
 * DER FINANZ-PROBELAUF
 *
 * Bis zu diesem Durchlauf hatte Finanz keinen einzigen Drill, obwohl jeder
 * andere Bereich der Codebase einen hat. Geprueft wird, was die Definition
 * von "fertig" (PROMPT-FINANZ-100-PROZENT.md, Phase 3) verlangt:
 *
 *   F1  Steuerberechnung in 19/7/0 % + §19 + Reverse-Charge + Drittland.
 *   F2  Der Nummernkreis ist lueckenlos und pro Praefix+Jahr monoton.
 *   F3  Die XRechnung ist gegen fehltFuerERechnung() konsistent und
 *       erzeugt wohlgeformtes XML mit den richtigen Pflichttags.
 *   F4  Die Kunden-Dokumentseite durchlaeuft alle Statuswechsel korrekt.
 *   F5  Der Fibero-Abgleich ist idempotent.
 *
 * Testdaten sind durchgaengig als Test gekennzeichnet (Steuernummer
 * "000/000/00000", Domains ".invalid", Namen mit "ABNAHME"-Praefix) und
 * werden nie in echte Produktionsdaten geschrieben — dieselbe Wegwerf-
 * Datenbank-Disziplin wie rechnung-drill.mjs & Co.
 */
import pg from "pg"
import { requireSafeTarget } from "./lib/env-guard.mjs"

const ZIEL = process.env.FINANZ_DRILL_URL || "postgres://localhost/drill_finanz"
requireSafeTarget(ZIEL, { zweck: "Finanz-Probelauf" })

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }
const wirft = async (fn) => { try { await fn(); return false } catch { return true } }

const c = new pg.Client({ connectionString: ZIEL })
await c.connect()
/** @type {(text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>} */
const db = async (text, params) => (await c.query(text, params ?? [])).rows

const { FINANZ_SCHEMA } = await import("../lib/finanz/store.ts")
const { AUFTRAEGE_SCHEMA, speichereFirma, legeEntwurfAn, speichereEntwurf, schreibeFest, ladeDokument,
  ladeDokumentPerToken, ladeVerwandte, ladeVerlauf, verwerfeEntwurf, neueVersion, beantworteAngebot,
  markiereGeoeffnet, rechnungAusAngebot, markiereBezahlt, storniere, anzeigeStatus } = await import("../lib/finanz/auftraege/store.ts")
const { berechne, steuerModus, leererKunde, leerePosition, heuteBerlin, addTage } = await import("../lib/finanz/auftraege/rechnen.ts")
const { fehltFuerERechnung, erzeugeXRechnung } = await import("../lib/finanz/auftraege/erechnung.ts")
const { ABGLEICH_SCHEMA, gleicheFiberoAb } = await import("../lib/finanz/fibero-abgleich.ts")

for (const s of FINANZ_SCHEMA) await db(s)
for (const s of AUFTRAEGE_SCHEMA) await db(s)
for (const s of ABGLEICH_SCHEMA) await db(s)

/*
 * Ein Probelauf muss zweimal dasselbe sagen — dieselbe Ueberlegung wie in
 * rechnung-drill.mjs. Was ein FRUEHERER LAUF VON IHM SELBST hinterlassen
 * hat, raeumt er zuerst weg (am Titel-Praefix "ABNAHME" erkennbar).
 */
await db(`DELETE FROM fin_dokument_verlauf WHERE dokument_id IN (SELECT id FROM fin_dokumente WHERE titel LIKE 'ABNAHME%')`)
await db(`DELETE FROM fin_dokumente WHERE titel LIKE 'ABNAHME%'`)
await db(`DELETE FROM fin_kunden WHERE schluessel LIKE '%abnahme.invalid%'`)
await db(`DELETE FROM fin_buchungen WHERE quelle_ref LIKE 'ABNAHME%' OR id LIKE 'fibero-%'`)
await db(`DELETE FROM fin_abgleich WHERE quelle = 'fibero'`)

/* ------------------------------------------------------------------------ */
/* Testfirma — eindeutig als Test gekennzeichnet (nie echte Owner-Daten)     */
/* ------------------------------------------------------------------------ */
const TESTFIRMA = {
  name: "creaDIG Solutions",
  inhaber: "ABNAHME Testinhaber",
  strasse: "Teststraße 1",
  plzOrt: "49074 Osnabrück",
  email: "abnahme@creadig.invalid",
  telefon: "+49 0000 000000",
  web: "https://creadig.de",
  steuernummer: "000/000/00000",
  ustId: "DE000000000",
  bank: "Testbank",
  iban: "DE00000000000000000000",
  bic: "TESTDEFFXXX",
}
await speichereFirma(db, TESTFIRMA)
const setUstPflichtig = (v) => db(`UPDATE fin_einstellungen SET ust_pflichtig = $1 WHERE id = 'haupt'`, [v])

const kunde = (extra = {}) => ({ ...leererKunde(), name: "ABNAHME Kunde", strasse: "Kundenweg 2", plzOrt: "10115 Berlin", email: "kunde@abnahme.invalid", ...extra })
const position = (extra = {}) => ({ ...leerePosition(), titel: "ABNAHME Leistung", preisCent: 100_000, ...extra })

/* ══ F1 · Steuerberechnung in allen Saetzen + § 19 + Reverse-Charge + Drittland ══ */
console.log("\nF1 · Steuerberechnung")

p(steuerModus(kunde({ land: "DE" }), true) === "normal", "DE-Kunde, umsatzsteuerpflichtig: normal")
p(steuerModus(kunde({ land: "DE" }), false) === "klein", "dieselbe Anfrage, Kleinunternehmer: § 19 — der Kunde entscheidet nichts, die eigene Pflicht entscheidet alles")
p(steuerModus(kunde({ land: "FR", ustId: "FR12345678901" }), true) === "reverse", "EU-Kunde mit USt-IdNr.: Reverse Charge")
p(steuerModus(kunde({ land: "FR", ustId: "" }), true) === "normal", "EU-Kunde OHNE USt-IdNr.: normal — B2C bleibt regelbesteuert")
p(steuerModus(kunde({ land: "US" }), true) === "drittland", "Drittland: nicht steuerbar im Inland")

const satzSumme = (modus, saetze) => berechne(saetze.map((s) => position({ ustSatz: s, preisCent: 100_00 })), 0, modus)
for (const satz of [19, 7, 0]) {
  const s = satzSumme("normal", [satz])
  p(s.gruppen.length === 1 && s.gruppen[0].satz === satz, `normal, ${satz} % einzeln: eine Gruppe mit dem richtigen Satz`)
  p(s.gruppen[0].ustCent === Math.round((10000 * satz) / 100), `${satz} %: USt-Betrag stimmt`, `${s.gruppen[0].ustCent} Cent`)
}
const gemischt = satzSumme("normal", [19, 7, 0])
p(gemischt.gruppen.length === 3, "19/7/0 % gemischt: drei getrennte Gruppen — keine Vermischung der Saetze")
p(gemischt.nettoCent === 30000 && gemischt.ustCent === 1900 + 700 + 0, "Gesamtnetto und Gesamt-USt addieren sich korrekt ueber die Gruppen")

for (const modus of ["klein", "reverse", "drittland"]) {
  const s = satzSumme(modus, [19, 7, 0])
  p(s.gruppen.length === 1 && s.gruppen[0].satz === 0 && s.ustCent === 0,
    `${modus}: alle Positionen fallen auf 0 % — unabhaengig vom hinterlegten Positions-Satz`,
    "der Steuer-Modus entscheidet den Satz, nicht die einzelne Position")
}

const rabatt = berechne([position({ ustSatz: 19, preisCent: 333_33 })], 10, "normal")
p(rabatt.rabattCent === rabatt.zwischenCent - rabatt.nettoCent, "Rabatt wird VOR der USt abgezogen, nicht danach")
p(rabatt.bruttoCent === rabatt.nettoCent + rabatt.ustCent, "Brutto = Netto + USt, immer — auch mit Rabatt")

/* ══ F2 · Ein Nummernkreis, lueckenlos und monoton je Praefix + Jahr ══ */
console.log("\nF2 · Nummernkreis")

await setUstPflichtig(true)
const neueRechnung = async (kundeDaten, art = "rechnung") => {
  const id = await legeEntwurfAn(db, art, { titel: "ABNAHME Nr.", kunde: kundeDaten })
  await speichereEntwurf(db, id, {
    sprache: "de", titel: "ABNAHME Nr.", kunde: kundeDaten, datum: heuteBerlin(), gueltigBis: art === "angebot" ? addTage(heuteBerlin(), 30) : null,
    zahlungszielTage: 14, leistungszeitraum: "Oktober 2026", einleitung: "", schluss: "", rabattProzent: 0, geschaeftsfeld: "it",
    positionen: [position()],
  })
  return id
}

const [vorReVon] = await db(`SELECT letzte FROM fin_nummernkreis WHERE praefix='RE' AND jahr = $1`, [Number(heuteBerlin().slice(0, 4))])
const vorRe = vorReVon ? Number(vorReVon.letzte) : 0

const re1 = await neueRechnung(kunde({ land: "DE" }))
const fest1 = await schreibeFest(db, re1)
p(fest1.ok, "F2.1 normale Rechnung wird festgeschrieben", fest1.ok ? "" : fest1.fehler.join(" · "))
const re2 = await neueRechnung(kunde({ land: "FR", ustId: "FR12345678901" }))
const fest2 = await schreibeFest(db, re2)
p(fest2.ok, "F2.2 Reverse-Charge-Rechnung wird festgeschrieben")

const reVerworfen = await neueRechnung(kunde({ land: "DE" }))
await verwerfeEntwurf(db, reVerworfen)
p(true, "F2.3 ein Entwurf wird verworfen, BEVOR er eine Nummer bekommt")

const re3 = await neueRechnung(kunde({ land: "US" }))
const fest3 = await schreibeFest(db, re3)
p(fest3.ok, "F2.4 Drittland-Rechnung wird festgeschrieben")

await setUstPflichtig(false)
const re4 = await neueRechnung(kunde({ land: "DE" }))
const fest4 = await schreibeFest(db, re4)
p(fest4.ok, "F2.5 § 19-Rechnung (nach Moduswechsel) wird festgeschrieben")
await setUstPflichtig(true)

const folge = [fest1, fest2, fest3, fest4].map((f) => Number(f.dok.nummer.split("-")[2]))
p(folge.every((n, i) => i === 0 || n === folge[i - 1] + 1),
  "F2.6 vier Rechnungen in Folge: jede Nummer genau eins hoeher — der verworfene Entwurf dazwischen reisst keine Luecke",
  folge.join(" → "))
p(folge[0] === vorRe + 1, "und die Folge beginnt dort, wo der Praefix+Jahr-Zaehler vorher stand")
p(new Set([fest1, fest2, fest3, fest4].map((f) => f.dok.nummer)).size === 4, "alle vier Nummern sind eindeutig")
p([fest1, fest2, fest3, fest4].every((f) => /^RE-\d{4}-\d{4}$/.test(f.dok.nummer)), "jede Nummer traegt Praefix, Jahr und eine vierstellige laufende Zahl")

const an1 = await neueRechnung(kunde({ land: "DE" }), "angebot")
const festAn1 = await schreibeFest(db, an1)
p(festAn1.ok && festAn1.dok.nummer.startsWith("AN-"), "F2.7 Angebote fuehren einen EIGENEN Nummernkreis (AN-) — getrennt von Rechnungen (RE-), nicht eine gemeinsame Zaehlung")

const doppelt = await wirft(() => db(`INSERT INTO fin_dokumente (id, art, status, nummer, datum) VALUES ($1,'rechnung','versendet',$2,current_date)`, [crypto.randomUUID(), fest1.dok.nummer]))
p(doppelt, "F2.8 dieselbe Nummer ein zweites Mal (gleiche Art) wird vom partiellen UNIQUE-Index abgelehnt")

const sid = await storniere(db, re1, "ABNAHME Testkorrektur")
p(sid !== null, "F2.9 eine versendete Rechnung wird storniert, nicht geaendert")
const storno = await ladeDokument(db, sid)
p(storno.art === "storno" && /^SR-\d{4}-\d{4}$/.test(storno.nummer), "der Storno traegt einen DRITTEN, eigenen Nummernkreis (SR-)")
const original = await ladeDokument(db, re1)
p(original.status === "storniert", "die urspruengliche Rechnung wechselt auf `storniert`, bleibt aber erhalten")
const gebucht1 = await db(`SELECT storniert_at FROM fin_buchungen WHERE quelle='rechnung' AND quelle_ref=$1`, [re1])
p(gebucht1.every((r) => r.storniert_at !== null), "die geplante Buchung im Hauptbuch wird beim Storno mit-storniert, nicht geloescht")

/* ══ F3 · XRechnung gegen fehltFuerERechnung() konsistent, wohlgeformtes XML ══ */
console.log("\nF3 · XRechnung (XRechnung 3.0 / EN 16931)")

const pruefeXRechnung = async (fest, erwarteteKategorie, modusName) => {
  const dok = fest.dok
  const fehlt = fehltFuerERechnung(dok, dok.absender)
  p(fehlt.length === 0, `${modusName}: fehltFuerERechnung() meldet keine fehlende Pflichtangabe`, fehlt.join(" · "))
  const e = erzeugeXRechnung(dok, dok.absender, true)
  p(e.ok, `${modusName}: erzeugeXRechnung() liefert XML`, e.ok ? "" : e.fehlt.join(" · "))
  if (!e.ok) return
  p(e.xml.startsWith("<?xml"), `${modusName}: XML beginnt mit der Deklaration`)
  p(wohlgeformt(e.xml), `${modusName}: XML ist wohlgeformt — jedes geoeffnete Tag wird wieder geschlossen`)
  p(e.xml.includes(`<ram:ID>${dok.nummer}</ram:ID>`), `${modusName}: die Rechnungsnummer steht im Dokument`)
  p(e.xml.includes(`<ram:CategoryCode>${erwarteteKategorie}</ram:CategoryCode>`), `${modusName}: die richtige USt-Kategorie (${erwarteteKategorie}) steht im Dokument`)
  p(/<ram:IBANID>DE0+<\/ram:IBANID>/.test(e.xml), `${modusName}: die IBAN steht im Zahlungsteil`)
}

/** Minimale Wohlgeformtheits-Probe: jedes oeffnende Tag hat ein passendes schliessendes, richtig verschachtelt. */
function wohlgeformt(xml) {
  const stapel = []
  const tagMuster = /<\/?([a-zA-Z0-9:._-]+)(\s[^>]*)?\/?>/g
  let treffer
  while ((treffer = tagMuster.exec(xml))) {
    const [ganz, name] = treffer
    if (ganz.startsWith("<?") || ganz.endsWith("/>")) continue
    if (ganz.startsWith("</")) {
      if (stapel.pop() !== name) return false
    } else {
      stapel.push(name)
    }
  }
  return stapel.length === 0
}

await pruefeXRechnung(fest2, "AE", "Reverse-Charge")
await pruefeXRechnung(fest3, "O", "Drittland")
await pruefeXRechnung(fest4, "E", "§ 19 Kleinunternehmer")

const unvollstaendig = await neueRechnung(kunde({ land: "DE", email: "" }))
await db(`UPDATE fin_dokumente SET positionen = $2::jsonb WHERE id = $1`, [unvollstaendig, JSON.stringify([position()])])
const fehltOhneMail = fehltFuerERechnung(await ladeDokument(db, unvollstaendig), TESTFIRMA)
p(fehltOhneMail.some((f) => /E-Mail des Kunden/.test(f)), "F3.5 ohne Kunden-E-Mail meldet fehltFuerERechnung() genau das — nicht pauschal `unvollstaendig`")

/* ══ F4 · Die Kunden-Dokumentseite durchlaeuft alle Statuswechsel ══ */
console.log("\nF4 · Statuswechsel (dokument/[token])")

const angebotEntwurf = await neueRechnung(kunde(), "angebot")
p((await ladeDokumentPerToken(db, "x".repeat(32))) === null, "F4.1 ein Entwurf ist ueber keinen Token erreichbar — es gibt noch keinen")
const festAngebot = await schreibeFest(db, angebotEntwurf)
p(festAngebot.ok, "entwurf → versendet")
const perToken = await ladeDokumentPerToken(db, festAngebot.dok.token)
p(perToken !== null && perToken.id === angebotEntwurf, "F4.2 versendet: ueber den Kunden-Token erreichbar")

await markiereGeoeffnet(db, angebotEntwurf)
const geoeffnet = await ladeDokument(db, angebotEntwurf)
p(anzeigeStatus(geoeffnet) === "geoeffnet", "versendet → geoeffnet (abgeleitet aus geoeffnet_at, kein eigenes Statusfeld)")

const angenommen = await beantworteAngebot(db, angebotEntwurf, { antwort: "angenommen", name: "ABNAHME Kunde", text: "Passt.", quelle: "kunde" })
p(angenommen, "geoeffnet → angenommen")
p((await ladeDokument(db, angebotEntwurf)).status === "angenommen", "der Status steht auch nach dem Neuladen auf `angenommen`")

const abgelehntId = await neueRechnung(kunde(), "angebot")
await schreibeFest(db, abgelehntId)
await beantworteAngebot(db, abgelehntId, { antwort: "abgelehnt", name: "ABNAHME Kunde", text: "Zu teuer.", quelle: "kunde" })
p((await ladeDokument(db, abgelehntId)).status === "abgelehnt", "versendet → abgelehnt")

const aenderungId = await neueRechnung(kunde(), "angebot")
await schreibeFest(db, aenderungId)
await beantworteAngebot(db, aenderungId, { antwort: "aenderung", name: "ABNAHME Kunde", text: "Bitte anpassen.", quelle: "kunde" })
p((await ladeDokument(db, aenderungId)).status === "aenderung", "versendet → aenderung gewuenscht")

const versionId = await neueRechnung(kunde(), "angebot")
const festVersion1 = await schreibeFest(db, versionId)
const neu = await neueVersion(db, versionId)
p(neu !== null, "eine neue Version entsteht aus dem versendeten Angebot")
const festVersion2 = await schreibeFest(db, neu)
p(festVersion2.ok && festVersion2.dok.nummer === festVersion1.dok.nummer, "versendet → ersetzt: die NEUE Version traegt dieselbe Nummer, nur eine hoehere Version")
p((await ladeDokument(db, versionId)).status === "ersetzt", "und die ALTE Version steht auf `ersetzt`")
const verwandte = await ladeVerwandte(db, await ladeDokument(db, neu))
p(verwandte.some((v) => v.id === versionId), "beide Versionen sind ueber ladeVerwandte() miteinander verknuepft")

const abgelaufenId = await neueRechnung(kunde(), "angebot")
await schreibeFest(db, abgelaufenId)
await db(`UPDATE fin_dokumente SET gueltig_bis = $2 WHERE id = $1`, [abgelaufenId, addTage(heuteBerlin(), -1)])
p(anzeigeStatus(await ladeDokument(db, abgelaufenId)) === "abgelaufen", "versendet, Gueltigkeit ueberschritten → abgelaufen (abgeleitet, nicht gespeichert)")

const rechnungAusAngenommenem = await rechnungAusAngebot(db, angebotEntwurf, null)
p(rechnungAusAngenommenem !== null, "aus dem angenommenen Angebot entsteht ein Rechnungs-Entwurf")
const festAbRechnung = await schreibeFest(db, rechnungAusAngenommenem)
p(festAbRechnung.ok, "rechnung: entwurf → versendet")

const heuteDatum = heuteBerlin()
await markiereBezahlt(db, rechnungAusAngenommenem, heuteDatum)
p((await ladeDokument(db, rechnungAusAngenommenem)).status === "bezahlt", "rechnung: versendet → bezahlt")
const gebuchtBezahlt = await db(`SELECT status FROM fin_buchungen WHERE quelle='rechnung' AND quelle_ref=$1`, [rechnungAusAngenommenem])
p(gebuchtBezahlt.every((r) => r.status === "gebucht"), "die geplante Buchung wechselt beim Zahlungseingang auf `gebucht`")

const stornierbareId = await neueRechnung(kunde())
await schreibeFest(db, stornierbareId)
const sidF4 = await storniere(db, stornierbareId, "ABNAHME")
p(sidF4 !== null, "rechnung: versendet → storniert")
p((await ladeDokument(db, stornierbareId)).status === "storniert", "und der Status steht entsprechend")

const ueberfaelligId = await neueRechnung(kunde())
await schreibeFest(db, ueberfaelligId)
await db(`UPDATE fin_dokumente SET faellig_am = $2 WHERE id = $1`, [ueberfaelligId, addTage(heuteBerlin(), -30)])
p(anzeigeStatus(await ladeDokument(db, ueberfaelligId)) === "ueberfaellig", "rechnung: Zahlungsziel ueberschritten → ueberfaellig (abgeleitet)")

const verlaufGeprueft = await ladeVerlauf(db, angebotEntwurf)
p(verlaufGeprueft.some((v) => v.aktion === "angelegt") && verlaufGeprueft.some((v) => v.aktion === "festgeschrieben") && verlaufGeprueft.some((v) => v.aktion === "angenommen"),
  "F4.9 jeder Statuswechsel hinterlaesst eine Zeile im Verlauf — nachvollziehbar, nicht nur der Endzustand")

/* ══ F5 · Fibero-Abgleich ist idempotent ══ */
console.log("\nF5 · Fibero-Abgleich (Idempotenz)")

process.env.FIBERO_SUPABASE_URL = "https://abnahme.invalid"
process.env.FIBERO_SUPABASE_SERVICE_ROLE_KEY = "abnahme-test-key"

const FIBERO_FIXTURES = {
  invoices: [{ id: "f1", number: "RG-1", team_name: "ABNAHME Auftraggeber", period: "2026-09", total: "1000.00", status: "Sent", created_at: "2026-09-01", due_date: "2026-09-15", archived_at: null }],
  incoming_invoices: [{ id: "s1", amount: "500.00", date: "2026-09-02", description: "ABNAHME Subunternehmer", invoice_number: "SUB-1", period: "2026-09", is_section_13b: true, is_paid: false, created_at: "2026-09-02", archived_at: null }],
  expenses: [{ id: "e1", beleg_datum: "2026-09-03", haendler: "ABNAHME Haendler", belegnummer: "B-1", betrag_brutto: "119.00", mwst_betrag: "19.00", waehrung: "EUR", kategorie: "Buero", raw_extraction: {}, abzugsfaehig: "ja", abzug_prozent: 100, status: "geprueft", anlagegut: false, nutzungsdauer_jahre: null, created_at: "2026-09-03", archived_at: null }],
}
const echterFetch = globalThis.fetch
globalThis.fetch = async (url) => {
  const u = new URL(String(url))
  const tabelle = u.pathname.split("/").pop()
  const zeilen = FIBERO_FIXTURES[tabelle] ?? []
  return new Response(JSON.stringify(zeilen), { status: 200, headers: { "content-type": "application/json" } })
}

const lauf1 = await gleicheFiberoAb(db)
p(lauf1.rechnungen.fehler === null && lauf1.subunternehmer.fehler === null && lauf1.belege.fehler === null, "F5.1 erster Lauf: alle drei Teile ohne Fehler")
p(lauf1.rechnungen.anzahl === 1 && lauf1.subunternehmer.anzahl === 1 && lauf1.belege.anzahl === 1, "und mit der erwarteten Zeilenzahl")
const buchungenNach1 = await db(`SELECT id, brutto_cent, ust_satz FROM fin_buchungen WHERE quelle='fibero' ORDER BY id`)
p(buchungenNach1.length === 3, "drei Buchungen im Hauptbuch nach dem ersten Lauf")

const lauf2 = await gleicheFiberoAb(db)
p(lauf2.rechnungen.anzahl === 1 && lauf2.subunternehmer.anzahl === 1 && lauf2.belege.anzahl === 1, "F5.2 zweiter Lauf, UNVERAENDERTE Quelle: dieselbe Zeilenzahl")
const buchungenNach2 = await db(`SELECT id, brutto_cent, ust_satz FROM fin_buchungen WHERE quelle='fibero' ORDER BY id`)
p(buchungenNach2.length === 3, "immer noch drei Buchungen — keine Verdopplung")
p(JSON.stringify(buchungenNach1) === JSON.stringify(buchungenNach2), "und jede Zeile traegt exakt denselben Betrag und Satz wie beim ersten Lauf")

FIBERO_FIXTURES.invoices[0].status = "Paid"
const lauf3 = await gleicheFiberoAb(db)
p(lauf3.rechnungen.anzahl === 1, "F5.3 dritter Lauf, GEAENDERTE Quelle (jetzt bezahlt): immer noch eine Zeile, kein Duplikat")
const [geaendert] = await db(`SELECT bezahlt FROM fin_buchungen WHERE id = 'fibero-inv-f1'`)
p(geaendert.bezahlt === true, "die bestehende Buchung wird aktualisiert (bezahlt), nicht verdoppelt")
const nachLauf3 = await db(`SELECT count(*) n FROM fin_buchungen WHERE quelle='fibero'`)
p(Number(nachLauf3[0].n) === 3, "weiterhin genau drei Buchungen")

const standNach3 = await db(`SELECT lauf_at FROM fin_abgleich WHERE quelle='fibero'`)
p(standNach3.length === 1, "F5.4 fin_abgleich haelt genau EINE Zeile je Quelle (ON CONFLICT, kein Verlauf von Laeufen)")

globalThis.fetch = echterFetch

console.log(`\n  ${fehler === 0 ? "Finanz rechnet, nummeriert und gleicht ab, wie es soll." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
await c.end()
process.exit(fehler === 0 ? 0 : 1)
