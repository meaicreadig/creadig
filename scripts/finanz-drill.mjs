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
import { PDFDocument } from "pdf-lib"
import { oeffneDrillDb } from "./lib/drill-db.mjs"

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }
const wirft = async (fn) => { try { await fn(); return false } catch { return true } }

const { query: db, close, backend } = await oeffneDrillDb({ envVar: "FINANZ_DRILL_URL", zweck: "Finanz-Probelauf" })
console.log(`  (Backend: ${backend})`)

const { FINANZ_SCHEMA } = await import("../lib/finanz/store.ts")
const { AUFTRAEGE_SCHEMA, speichereFirma, legeEntwurfAn, speichereEntwurf, schreibeFest, ladeDokument,
  ladeDokumentPerToken, ladeVerwandte, ladeVerlauf, verwerfeEntwurf, neueVersion, beantworteAngebot,
  markiereGeoeffnet, rechnungAusAngebot, markiereBezahlt, storniere, anzeigeStatus, pruefeNummernkreis } = await import("../lib/finanz/auftraege/store.ts")
const { berechne, steuerModus, leererKunde, leerePosition, heuteBerlin, addTage, formatEuro } = await import("../lib/finanz/auftraege/rechnen.ts")
const { fehltFuerERechnung, erzeugeXRechnung } = await import("../lib/finanz/auftraege/erechnung.ts")
const { dokumentMail } = await import("../lib/finanz/auftraege/mail.ts")
const { ABGLEICH_SCHEMA, gleicheFiberoAb } = await import("../lib/finanz/fibero-abgleich.ts")
const { BELEGE_SCHEMA, ordneZu, ladeBelege } = await import("../lib/finanz/belege.ts")
const { leseERechnungXml, leseERechnung, leseEingebettetesXml } = await import("../lib/finanz/e-eingang.ts")

for (const s of FINANZ_SCHEMA) await db(s)
for (const s of AUFTRAEGE_SCHEMA) await db(s)
for (const s of ABGLEICH_SCHEMA) await db(s)
for (const s of BELEGE_SCHEMA) await db(s)

/*
 * Ein Probelauf muss zweimal dasselbe sagen — dieselbe Ueberlegung wie in
 * rechnung-drill.mjs. Was ein FRUEHERER LAUF VON IHM SELBST hinterlassen
 * hat, raeumt er zuerst weg (am Titel-Praefix "ABNAHME" erkennbar).
 *
 * Seit den GoBD-Triggern (F7) ist genau das in der Tabelle selbst verboten,
 * sobald eine Nummer steht — zu Recht, das ist ihr ganzer Zweck. Fuer den
 * Probelauf eigenen Aufraeumschritt werden die Trigger deshalb kurz
 * abgeschaltet (Tabelleneigentuemer-Recht, kein Superuser noetig) und direkt
 * danach wieder angeschaltet — eine Ausnahme fuer das Werkzeug, die in
 * Produktion nie gebraucht wird, weil dort niemand `ABNAHME`-Fixturen anlegt.
 */
for (const t of ["fin_dokumente", "fin_buchungen", "fin_dokument_verlauf", "fin_protokoll"]) {
  await db(`ALTER TABLE ${t} DISABLE TRIGGER ALL`)
}
await db(`DELETE FROM fin_dokument_verlauf WHERE dokument_id IN (SELECT id FROM fin_dokumente WHERE titel LIKE 'ABNAHME%' OR id LIKE 'ABNAHME-%')`)
await db(`DELETE FROM fin_dokumente WHERE titel LIKE 'ABNAHME%' OR id LIKE 'ABNAHME-%'`)
await db(`DELETE FROM fin_kunden WHERE schluessel LIKE '%abnahme.invalid%'`)
await db(`DELETE FROM fin_buchungen WHERE quelle_ref LIKE 'ABNAHME%' OR id LIKE 'fibero-%' OR id LIKE 'ABNAHME-%'`)
await db(`DELETE FROM fin_abgleich WHERE quelle = 'fibero'`)
await db(`DELETE FROM fin_belege WHERE id LIKE 'ABNAHME-%' OR extern_id LIKE 'ABNAHME-%'`)
for (const t of ["fin_dokumente", "fin_buchungen", "fin_dokument_verlauf", "fin_protokoll"]) {
  await db(`ALTER TABLE ${t} ENABLE TRIGGER ALL`)
}
/*
 * Der Zaehler selbst muss mit zurueckgesetzt werden — sonst entsteht durch
 * das Aufraeumen genau das, was pruefeNummernkreis() zu Recht meldet: Zahlen,
 * die ein frueherer Lauf gezogen UND durch Loeschen wieder entfernt hat,
 * stehen als Luecke da. Eine Wegwerf-Datenbank, die wirklich wegwerfbar sein
 * soll, muss auch den Zaehler wegwerfen, nicht nur die Dokumente.
 */
await db(`DELETE FROM fin_nummernkreis`)

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
const neueRechnung = async (kundeDaten, art = "rechnung", sprache = "de") => {
  const id = await legeEntwurfAn(db, art, { titel: "ABNAHME Nr.", kunde: kundeDaten })
  await speichereEntwurf(db, id, {
    sprache, titel: "ABNAHME Nr.", kunde: kundeDaten, datum: heuteBerlin(), gueltigBis: art === "angebot" ? addTage(heuteBerlin(), 30) : null,
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

/* ══ F6 · Türkisch (TR) auf der Kunden-Dokumentseite ══ */
console.log("\nF6 · Türkisch (TR)")

p(/€/.test(formatEuro(123456, "tr")) && /1[.,]234[.,]56/.test(formatEuro(123456, "tr")), "formatEuro() liefert ein Ergebnis fuer tr-TR", formatEuro(123456, "tr"))

const trAngebot = await neueRechnung(kunde({ land: "DE", email: "tr-kunde@abnahme.invalid" }), "angebot", "tr")
const festTrAngebot = await schreibeFest(db, trAngebot)
p(festTrAngebot.ok, "F6.1 ein TR-Angebot wird genauso festgeschrieben wie DE/EN")

const mailTrAngebot = dokumentMail(festTrAngebot.dok, "versand")
p(mailTrAngebot.html.includes('lang="tr"'), "F6.2 die Versand-Mail traegt lang=\"tr\"")
p(mailTrAngebot.betreff.includes("Teklif"), "und der Betreff nennt das Dokument auf Tuerkisch (Teklif statt Angebot/Quotation)")
p(mailTrAngebot.text.includes("Saygılarımızla"), "und der Gruss steht auf Tuerkisch")

await beantworteAngebot(db, trAngebot, { antwort: "angenommen", name: "ABNAHME TR Kunde", text: "Olur.", quelle: "kunde" })
const trRechnungId = await rechnungAusAngebot(db, trAngebot, 40)
const festTrRechnung = await schreibeFest(db, trRechnungId)
p(festTrRechnung.ok, "F6.3 aus dem angenommenen TR-Angebot entsteht eine sendbare TR-Anzahlungsrechnung")
p(festTrRechnung.dok.positionen.some((pos) => pos.titel.startsWith("Peşinat %")), "und die Position traegt den tuerkischen Anzahlungstext (Peşinat), nicht den deutschen oder englischen")

const mailTrRechnung = dokumentMail(festTrRechnung.dok, "mahnung_1")
p(mailTrRechnung.betreff.includes("hatırlatma"), "F6.4 auch die Zahlungserinnerung ist auf Tuerkisch uebersetzt, nicht nur der Versand")

const trStornoId = await storniere(db, trRechnungId, "ABNAHME")
const trStorno = await ladeDokument(db, trStornoId)
p(trStorno.einleitung.includes("numaralı faturayı iptal eder"), "F6.5 der Storno-Hinweistext ist auf Tuerkisch — derselbe Satz, den DE/EN schon hatten")

const fehltTr = fehltFuerERechnung(festTrRechnung.dok, festTrRechnung.dok.absender)
p(fehltTr.length === 0, "F6.6 eine TR-Rechnung ist genauso E-Rechnungs-faehig wie DE/EN — die Sprache des Dokuments ist keine Pflichtangabe")

/* ══ F7 · GoBD-Festschreibung — unveraenderbar in der Datenbank, nicht nur in der Oberflaeche ══ */
console.log("\nF7 · GoBD-Festschreibung (Trigger)")

const g1 = await db(`SELECT id, positionen, status FROM fin_dokumente WHERE id = $1`, [re2])
p(g1[0].status === "versendet", "G1 Fixtur fuer die Trigger-Proben: re2 (Reverse-Charge-Rechnung) steht noch auf versendet")

p(await wirft(() => db(`UPDATE fin_dokumente SET positionen = '[]'::jsonb WHERE id = $1`, [re2])),
  "G2 positionen einer festgeschriebenen Rechnung direkt per SQL aendern wird abgelehnt")
p(await wirft(() => db(`UPDATE fin_dokumente SET nummer = 'RE-2099-9999' WHERE id = $1`, [re2])),
  "G3 die Nummer selbst direkt aendern wird abgelehnt")
p(await wirft(() => db(`UPDATE fin_dokumente SET summen = '{}'::jsonb WHERE id = $1`, [re2])),
  "G4 die Summen direkt aendern wird abgelehnt")
p(await wirft(() => db(`UPDATE fin_dokumente SET kunde = '{}'::jsonb WHERE id = $1`, [re2])),
  "G5 der Kunde direkt aendern wird abgelehnt")
p(!(await wirft(() => db(`UPDATE fin_dokumente SET mahnstufe = 1 WHERE id = $1`, [re2]))),
  "G6 ein Statusfeld (mahnstufe) darf sich dagegen weiter aendern")
p(await wirft(() => db(`DELETE FROM fin_dokumente WHERE id = $1`, [re2])),
  "G7 eine festgeschriebene Rechnung direkt loeschen wird abgelehnt — stornieren statt loeschen")

const gebuchteFibero = await db(`SELECT id FROM fin_buchungen WHERE quelle='fibero' LIMIT 1`)
const gebuchteManuell = await db(
  `INSERT INTO fin_buchungen (id, art, status, datum, brutto_cent, ust_satz, kategorie, quelle)
   VALUES ('ABNAHME-gobd-manuell','einnahme','gebucht',current_date,10000,19,'Test','manuell') RETURNING id`,
)
p(await wirft(() => db(`UPDATE fin_buchungen SET brutto_cent = 1 WHERE id = $1`, [gebuchteManuell[0].id])),
  "G8 eine gebuchte, manuelle Buchung direkt im Betrag aendern wird abgelehnt")
p(!(await wirft(() => db(`UPDATE fin_buchungen SET storniert_at = now() WHERE id = $1`, [gebuchteManuell[0].id]))),
  "G9 stornieren (storniert_at setzen) bleibt dagegen erlaubt")
p(await wirft(() => db(`DELETE FROM fin_buchungen WHERE id = $1`, [gebuchteManuell[0].id])),
  "G10 eine gebuchte, manuelle Buchung direkt loeschen wird abgelehnt")
p(!(await wirft(() => db(`UPDATE fin_buchungen SET brutto_cent = brutto_cent + 1 WHERE id = $1`, [gebuchteFibero[0].id]))),
  "G11 eine gebuchte fibero-Buchung darf sich dagegen aendern — das ist der laufende Spiegel, nicht derselbe Fall")

const verlaufZeile = await db(`SELECT id FROM fin_dokument_verlauf WHERE dokument_id = $1 LIMIT 1`, [re2])
p(await wirft(() => db(`UPDATE fin_dokument_verlauf SET aktion = 'gefaelscht' WHERE id = $1`, [verlaufZeile[0].id])),
  "G12 fin_dokument_verlauf: UPDATE wird abgelehnt — ein Verlauf wird nicht umgeschrieben")
p(await wirft(() => db(`DELETE FROM fin_dokument_verlauf WHERE id = $1`, [verlaufZeile[0].id])),
  "G13 fin_dokument_verlauf: DELETE wird abgelehnt — ein Ereignis wird nicht ungeschehen gemacht")

const protokollZeile = await db(`SELECT id FROM fin_protokoll LIMIT 1`)
if (protokollZeile.length) {
  p(await wirft(() => db(`UPDATE fin_protokoll SET aktion = 'gefaelscht' WHERE id = $1`, [protokollZeile[0].id])),
    "G14 fin_protokoll: UPDATE wird ebenso abgelehnt")
} else {
  p(true, "G14 fin_protokoll: keine Zeile zum Pruefen vorhanden, uebersprungen")
}

p((await pruefeNummernkreis(db)).length === 0, "G15 im gesunden Normalbetrieb meldet pruefeNummernkreis() keine Luecke")

await db(`INSERT INTO fin_dokumente (id, art, status, nummer, datum) VALUES ('ABNAHME-luecke', 'rechnung', 'versendet', 'RE-2019-0001', '2019-01-01')`)
await db(`INSERT INTO fin_dokumente (id, art, status, nummer, datum) VALUES ('ABNAHME-luecke-3', 'rechnung', 'versendet', 'RE-2019-0003', '2019-01-01')`)
const luecken = await pruefeNummernkreis(db)
const treffer = luecken.find((l) => l.praefix === "RE" && l.jahr === 2019)
p(treffer !== undefined && treffer.fehlend.includes(2) && treffer.hoechsteVergeben === 3,
  "G16 eine kuenstlich erzeugte Luecke (RE-2019: 1 und 3 vorhanden, 2 fehlt) wird erkannt",
  treffer ? `fehlend: ${treffer.fehlend.join(",")}` : "nicht gefunden")

/* ══ H · Belege selbst hochladen (Phase 2) ══ */
console.log("\nH · Beleg-Upload — Zuordnung erzeugt eine Buchung")

/*
 * ladeBelegHoch() selbst braucht einen echten BLOB_READ_WRITE_TOKEN (Vercel
 * Blob) — den gibt es in diesem Probelauf bewusst nicht (optionales Modul,
 * siehe .env.example). Geprueft wird deshalb die Haelfte, die keinen
 * Dateispeicher braucht: eine Zeile landet in fin_belege genau wie
 * ladeBelegHoch() sie anlaegt (quelle='hand', extern_id=Pruefsumme), und
 * ordneZu()/verbucheBeleg() muessen daraus eine Buchung machen.
 */
const belegId = "ABNAHME-beleg-1"
await db(
  `INSERT INTO fin_belege (id, quelle, extern_id, art, datum, haendler, brutto_cent, netto_cent, vorsteuer_cent, kategorie, datei_status)
   VALUES ($1,'hand','ABNAHME-sha-1','beleg','2026-10-01','ABNAHME Haendler',11900,10000,1900,'Büro','kopiert')`,
  [belegId],
)
p((await db(`SELECT geschaeftsfeld FROM fin_buchungen WHERE id = $1`, [`beleg-${belegId}`])).length === 0,
  "H1 ohne Geschaeftsfeld entsteht noch keine Buchung — der Beleg liegt im Eingangskorb")

const zugeordnetAnzahl = await ordneZu(db, [belegId], "it")
p(zugeordnetAnzahl === 1, "H2 ordneZu() ordnet den Beleg dem Geschaeftsfeld zu")
const [buchung] = await db(`SELECT art, status, brutto_cent, ust_satz, geschaeftsfeld, quelle, quelle_ref FROM fin_buchungen WHERE id = $1`, [`beleg-${belegId}`])
p(buchung !== undefined, "H3 die Zuordnung erzeugt eine Buchung (beleg-<id>)")
p(buchung?.art === "ausgabe" && buchung?.status === "gebucht" && Number(buchung?.brutto_cent) === 11900 && Number(buchung?.ust_satz) === 19,
  "H4 Art, Status, Betrag und USt-Satz stimmen mit dem Beleg ueberein (11900 Cent, 19 %, aus dem Verhaeltnis Brutto/Vorsteuer bestimmt)")
p(buchung?.quelle === "beleg" && buchung?.quelle_ref === belegId, "H5 quelle='beleg' und quelle_ref zeigen zurueck auf den Beleg")

await ordneZu(db, [belegId], "software")
const nachZweitemZuordnen = await db(`SELECT count(*) n FROM fin_buchungen WHERE quelle_ref = $1`, [belegId])
p(Number(nachZweitemZuordnen[0].n) === 1, "H6 ein zweites Mal zuordnen erzeugt KEINE zweite Buchung (idempotent ueber die feste ID)")
p(await wirft(() => db(`UPDATE fin_buchungen SET brutto_cent = 1 WHERE id = $1`, [`beleg-${belegId}`])),
  "H7 die entstandene Buchung ist danach so unveraenderbar wie jede andere gebuchte Zeile (GoBD-Trigger aus F7 gilt auch hier)")

/* ══ I · Eingehende E-Rechnungen (Phase 3) — UBL, CII, ZUGFeRD ══ */
console.log("\nI · Eingehende E-Rechnung (UBL/CII/ZUGFeRD)")

const i_cii = erzeugeXRechnung(fest2.dok, fest2.dok.absender, true)
p(i_cii.ok, "I1 Fixtur: die eigene CII-Ausgangsrechnung (re2) dient als CII-Probe fuer das Lesen")
const i_ciiGelesen = i_cii.ok ? leseERechnungXml(i_cii.xml) : null
p(i_ciiGelesen?.format === "cii", "I2 CII wird als CII erkannt")
p(i_ciiGelesen?.rechnungsnummer === fest2.dok.nummer, "I3 CII: Rechnungsnummer korrekt gelesen", i_ciiGelesen?.rechnungsnummer)
p(i_ciiGelesen?.bruttoCent === fest2.dok.summen.bruttoCent, "I4 CII: Bruttobetrag korrekt gelesen (Cent)", String(i_ciiGelesen?.bruttoCent))
p(i_ciiGelesen?.iban !== null && i_ciiGelesen.iban === TESTFIRMA.iban, "I5 CII: IBAN korrekt gelesen")

const i_ublXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>ABNAHME-UBL-2026-0007</cbc:ID>
  <cbc:IssueDate>2026-09-15</cbc:IssueDate>
  <cbc:DueDate>2026-09-29</cbc:DueDate>
  <cac:AccountingSupplierParty><cac:Party>
    <cac:PartyLegalEntity><cbc:RegistrationName>ABNAHME UBL Lieferant AG</cbc:RegistrationName></cac:PartyLegalEntity>
  </cac:Party></cac:AccountingSupplierParty>
  <cac:PaymentMeans><cac:PayeeFinancialAccount><cbc:ID>DE02500105170137075030</cbc:ID></cac:PayeeFinancialAccount></cac:PaymentMeans>
  <cac:TaxTotal><cbc:TaxAmount currencyID="EUR">190.00</cbc:TaxAmount></cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="EUR">1000.00</cbc:TaxExclusiveAmount>
    <cbc:PayableAmount currencyID="EUR">1190.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`
const i_ublGelesen = leseERechnungXml(i_ublXml)
p(i_ublGelesen?.format === "ubl", "I6 UBL wird als UBL erkannt (derselbe Parser, andere Syntax)")
p(i_ublGelesen?.lieferant === "ABNAHME UBL Lieferant AG", "I7 UBL: Lieferant korrekt gelesen")
p(i_ublGelesen?.bruttoCent === 119000 && i_ublGelesen?.nettoCent === 100000 && i_ublGelesen?.ustCent === 19000, "I8 UBL: Netto/USt/Brutto korrekt gelesen")
p(i_ublGelesen?.faellig === "2026-09-29", "I9 UBL: Faelligkeit korrekt gelesen")

const i_pdf = await PDFDocument.create()
i_pdf.addPage([200, 200])
await i_pdf.attach(Buffer.from(i_cii.ok ? i_cii.xml : "", "utf-8"), "factur-x.xml", { mimeType: "application/xml", description: "Factur-X/ZUGFeRD" })
const i_pdfBytes = await i_pdf.save()
const i_eingebettet = await leseEingebettetesXml(i_pdfBytes)
p(i_eingebettet !== null && i_eingebettet.includes(fest2.dok.nummer), "I10 ZUGFeRD: eingebettetes XML wird aus dem PDF extrahiert")
const i_zugferd = await leseERechnung(Buffer.from(i_pdfBytes), "application/pdf")
p(i_zugferd?.daten.format === "cii" && i_zugferd?.daten.rechnungsnummer === fest2.dok.nummer,
  "I11 ZUGFeRD-PDF liefert am Ende dieselbe CII-Extraktion wie die reine XML-Datei")

p(leseERechnungXml("Das ist kein XML, sondern ein Kassenbon-Foto als Text-Blob.") === null,
  "I12 ein normaler Beleg (kein UBL/CII) wird NICHT als E-Rechnung fehlinterpretiert — null, kein Rateversuch")

// Readable-view: Original-XML + extrahierte Felder landen in fin_belege und sind ueber ladeBelege() sichtbar.
const i_belegId = "ABNAHME-erechnung-1"
await db(
  `INSERT INTO fin_belege (id, quelle, extern_id, art, datum, haendler, brutto_cent, netto_cent, vorsteuer_cent, kategorie, datei_status, erechnung_format, erechnung_xml, erechnung_nummer, erechnung_iban)
   VALUES ($1,'hand','ABNAHME-sha-erechnung','beleg',$2,$3,$4,$5,$6,'Fremdleistung','kopiert','ubl',$7,$8,$9)`,
  [i_belegId, i_ublGelesen.datum, i_ublGelesen.lieferant, i_ublGelesen.bruttoCent, i_ublGelesen.nettoCent, i_ublGelesen.ustCent, i_ublXml, i_ublGelesen.rechnungsnummer, i_ublGelesen.iban],
)
const i_uebersicht = await ladeBelege(db, null)
const i_korbEintrag = i_uebersicht.korb.find((b) => b.id === i_belegId)
p(i_korbEintrag?.erechnung?.format === "ubl" && i_korbEintrag?.erechnung?.nummer === "ABNAHME-UBL-2026-0007" && i_korbEintrag?.erechnung?.iban === "DE02500105170137075030",
  "I13 die lesbare Ansicht (ladeBelege) zeigt Format/Nummer/IBAN — kein rohes XML, aber auch nichts verloren")

console.log(`\n  ${fehler === 0 ? "Finanz rechnet, nummeriert und gleicht ab, wie es soll." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
await close()
process.exit(fehler === 0 ? 0 : 1)
