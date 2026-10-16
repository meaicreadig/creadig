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
  markiereGeoeffnet, rechnungAusAngebot, markiereBezahlt, storniere, anzeigeStatus, pruefeNummernkreis,
  erfasseZahlung, ladeZahlungen, bezahltCent } = await import("../lib/finanz/auftraege/store.ts")
const { berechne, steuerModus, leererKunde, leerePosition, heuteBerlin, addTage, formatEuro } = await import("../lib/finanz/auftraege/rechnen.ts")
const { fehltFuerERechnung, erzeugeXRechnung } = await import("../lib/finanz/auftraege/erechnung.ts")
const { dokumentMail } = await import("../lib/finanz/auftraege/mail.ts")
const { ABGLEICH_SCHEMA, gleicheFiberoAb } = await import("../lib/finanz/fibero-abgleich.ts")
const { BELEGE_SCHEMA, ordneZu, ladeBelege } = await import("../lib/finanz/belege.ts")
const { leseERechnungXml, leseERechnung, leseEingebettetesXml } = await import("../lib/finanz/e-eingang.ts")
const { paragraph19Status } = await import("../lib/finanz/paragraph19.ts")
const { berechneLage } = await import("../lib/finanz/lage.ts")
const { berechneEuer } = await import("../lib/finanz/euer.ts")
const { ladeFelder } = await import("../lib/finanz/felder.ts")
const { kompass } = await import("../lib/finanz/rechnen.ts")
const { eur: formatEuroKompakt } = await import("../components/finanz/format.ts")
const { erzeugeDatevCsv } = await import("../lib/finanz/datev.ts")
const { erzeugeEuerPdf } = await import("../lib/finanz/euer-pdf.ts")
const { erzeugeRechnungsPdf } = await import("../lib/finanz/auftraege/pdf.ts")
const { erzeugeSteuerberaterPaket } = await import("../lib/finanz/steuerberater-export.ts")
const { leseCamt053, leseBankCsv } = await import("../lib/finanz/bank-import.ts")
const { importiereBankUmsaetze, ladeOffeneBankUmsaetze, bestaetigeZuordnung, ignoriereUmsatz } = await import("../lib/finanz/bank-abgleich.ts")
const { erstelleMorgenBericht, sendeMorgenmailFallsFaellig } = await import("../lib/finanz/morgenmail.ts")
const { RATE_LIMIT_SCHEMA, pruefeRateLimit, callerAdresse } = await import("../lib/finanz/rate-limit.ts")
const JSZipMod = (await import("jszip")).default

for (const s of FINANZ_SCHEMA) await db(s)
for (const s of AUFTRAEGE_SCHEMA) await db(s)
for (const s of ABGLEICH_SCHEMA) await db(s)
for (const s of BELEGE_SCHEMA) await db(s)
for (const s of RATE_LIMIT_SCHEMA) await db(s)

/*
 * Ein Probelauf muss zweimal dasselbe sagen — dieselbe Ueberlegung wie in
 * rechnung-drill.mjs. Erst war das ein selektives Loeschen an Titel-/ID-
 * Praefix ("ABNAHME") — das reichte, solange jede Pruefung nur einzelne,
 * selbst angelegte Zeilen ansah. Seit § 19 (Phase 4) ueber ALLE Buchungen
 * eines Jahres summiert, reicht selektiv nicht mehr: eine echte, aus einem
 * Testdokument abgeleitete Buchung (z. B. `re-<docid>-19`, nicht
 * ABNAHME-praefigiert) blieb vom vorigen Lauf stehen und floss in die Summe
 * des naechsten mit ein. Eine Wegwerf-Datenbank, die wirklich wegwerfbar
 * sein soll, wird deshalb komplett geleert, nicht nach Muster gefiltert —
 * TRUNCATE loest ausserdem keine Zeilen-Trigger aus, die GoBD-Sperren aus
 * Phase 1 muessen dafuer nicht extra abgeschaltet werden.
 */
await db(
  `TRUNCATE fin_dokument_verlauf, fin_dokumente, fin_buchungen, fin_protokoll, fin_kunden,
            fin_nummernkreis, fin_abgleich, fin_belege, fin_fristen, fin_zahlungen, fin_bank_umsaetze, fin_rate_limits`,
)

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
const neueRechnung = async (kundeDaten, art = "rechnung", sprache = "de", positionen = [position()]) => {
  const id = await legeEntwurfAn(db, art, { titel: "ABNAHME Nr.", kunde: kundeDaten })
  await speichereEntwurf(db, id, {
    sprache, titel: "ABNAHME Nr.", kunde: kundeDaten, datum: heuteBerlin(), gueltigBis: art === "angebot" ? addTage(heuteBerlin(), 30) : null,
    zahlungszielTage: 14, leistungszeitraum: "Oktober 2026", einleitung: "", schluss: "", rabattProzent: 0, geschaeftsfeld: "it",
    positionen,
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

/* ══ J · § 19-Waechter (Phase 4) ══ */
console.log("\nJ · § 19-Waechter — Umsatzgrenzen ab 2025")

const buchungFixture = (id, datum, bruttoCent, extra = {}) => ({
  id, art: "einnahme", status: "gebucht", datum, bruttoCent, ustSatz: 0,
  kategorie: "Projekt", gegenpartei: null, notiz: null, wiederholung: "keine", storniert: false, ...extra,
})

p(paragraph19Status([], "2026-06-15").ampel === "ruhig", "J1 ohne Buchungen: ruhig, 0 Umsatz")

const j_achtung = [buchungFixture("j1", "2026-01-10", 85_000_00)]
p(paragraph19Status(j_achtung, "2026-06-15").ampel === "achtung", "J2 85.000 € von 100.000 € (85 %): Achtung", String(paragraph19Status(j_achtung, "2026-06-15").anteilLaufendesJahr))

const j_kritisch = [buchungFixture("j1", "2026-01-10", 96_000_00)]
p(paragraph19Status(j_kritisch, "2026-06-15").ampel === "kritisch", "J3 96.000 € (96 %): kritisch — ab 95 %")

const j_ueberschritten = [buchungFixture("j1", "2026-01-10", 90_000_00), buchungFixture("j2", "2026-03-20", 15_000_00)]
const j_statusUeberschritten = paragraph19Status(j_ueberschritten, "2026-06-15")
p(j_statusUeberschritten.ampel === "ueberschritten" && j_statusUeberschritten.ueberschrittenAm === "2026-03-20",
  "J4 90.000 € + 15.000 € am 20.03.: ueberschritten GENAU an dem Tag, an dem die Grenze faellt", j_statusUeberschritten.ueberschrittenAm)
p(j_statusUeberschritten.ueberschrittenBeiBuchungId === "j2", "und die ueberschreitende Buchung wird benannt")

const j_vorjahr = [buchungFixture("j0", "2025-05-01", 30_000_00)]
const j_statusVorjahr = paragraph19Status(j_vorjahr, "2026-06-15")
p(j_statusVorjahr.ampel === "ueberschritten" && j_statusVorjahr.vorjahrUeberschritten === true,
  "J5 Vorjahresumsatz 30.000 € über 25.000 €: ueberschritten, auch ohne eine einzige Buchung im laufenden Jahr")

const j_storniert = [buchungFixture("j1", "2026-01-10", 90_000_00), buchungFixture("j2", "2026-03-20", 15_000_00, { storniert: true })]
p(paragraph19Status(j_storniert, "2026-06-15").ampel === "achtung", "J6 eine stornierte Buchung zaehlt nicht mit")

const j_geplant = [buchungFixture("j1", "2026-01-10", 90_000_00), buchungFixture("j2", "2026-03-20", 15_000_00, { status: "geplant" })]
p(paragraph19Status(j_geplant, "2026-06-15").ampel === "achtung",
  "J7 eine nur GEPLANTE (noch nicht zugeflossene) Einnahme zaehlt nicht — § 19 misst Ist-Versteuerung, nicht gestellte Rechnungen")

const j_mitUst = [buchungFixture("j1", "2026-01-10", 119_00, { ustSatz: 19 })]
p(paragraph19Status(j_mitUst, "2026-06-15").laufendesJahrUmsatzCent === 100_00,
  "J8 eine Buchung MIT USt zaehlt netto (119,00 € brutto bei 19 % → 100,00 € Umsatz), nicht brutto")

/* Realer Durchlauf gegen die Datenbank: dieselbe Rechnung wie berechneLage() sie zieht. */
await setUstPflichtig(false)
await db(`INSERT INTO fin_buchungen (id, art, status, datum, brutto_cent, ust_satz, kategorie, quelle) VALUES ('ABNAHME-j19-1','einnahme','gebucht',$1,9600000,0,'Projekt','manuell')`, [`${heuteBerlin().slice(0, 4)}-01-15`])
const j_lage = await berechneLage(db)
p(j_lage.paragraph19 !== null && j_lage.paragraph19.ampel === "kritisch", "J9 berechneLage() zieht dieselbe Grenze — 96.000 € im laufenden Jahr meldet kritisch")
p(j_lage.hinweise.some((h) => h.text.includes("§ 19")), "J10 der Kompass zeigt einen Hinweis dazu (nicht nur die stille Zahl)")

await setUstPflichtig(true)
const j_lageUmgestellt = await berechneLage(db)
p(j_lageUmgestellt.paragraph19 === null, "J11 nach der Umstellung auf umsatzsteuerpflichtig zeigt der Kompass die § 19-Ampel nicht mehr — sie gilt nicht mehr")

/* ══ K · EÜR, DATEV-Export, Steuerberater-Paket (Phase 5) ══ */
console.log("\nK · EÜR und Steuerberater-Paket")

const k_jahr = heuteBerlin().slice(0, 4)
/*
 * Vorher/Nachher-Differenz statt absoluter Summen: andere Abschnitte dieses
 * Laufs (F2/F4/J) haben im selben Jahr bereits eigene echte Buchungen
 * gebucht. Die Probe prueft deshalb, was DIESE Fixtur veraendert, nicht den
 * globalen Stand.
 */
const k_vorher = await berechneEuer(db, k_jahr)
await db(`INSERT INTO fin_buchungen (id, art, status, datum, brutto_cent, ust_satz, kategorie, gegenpartei, quelle) VALUES
  ('ABNAHME-k-ein-1','einnahme','gebucht',$1,500000,0,'Projekt / Kunde','ABNAHME Kunde A','manuell'),
  ('ABNAHME-k-ein-2','einnahme','gebucht',$1,119000,19,'Beratung','ABNAHME Kunde B','manuell'),
  ('ABNAHME-k-aus-1','ausgabe','gebucht',$1,23800,19,'Software & Hosting','ABNAHME Anbieter','manuell'),
  ('ABNAHME-k-aus-2','ausgabe','gebucht',$1,100000,0,'Privatentnahme',NULL,'manuell'),
  ('ABNAHME-k-storniert','einnahme','gebucht',$1,999900,19,'Sonstiges','ABNAHME Storno','manuell')`,
  [`${k_jahr}-04-01`])
await db(`UPDATE fin_buchungen SET storniert_at = now() WHERE id = 'ABNAHME-k-storniert'`)

const k_euer = await berechneEuer(db, k_jahr)
const k_erwarteteEinnahmenDelta = 500000 + Math.round((119000 * 100) / 119)
const k_erwarteteAusgabenDelta = 20000 // 23800 brutto bei 19 % → 20000 netto — die EÜR rechnet netto, nicht brutto
p(k_euer.summeEinnahmenCent - k_vorher.summeEinnahmenCent === k_erwarteteEinnahmenDelta,
  "K1 EÜR-Einnahmen steigen genau um die beiden NICHT-stornierten Buchungen (netto, § 19 + 19 % gemischt) — die stornierte zählt nicht mit",
  String(k_euer.summeEinnahmenCent - k_vorher.summeEinnahmenCent))
p(k_euer.summeAusgabenCent - k_vorher.summeAusgabenCent === k_erwarteteAusgabenDelta,
  "K2 EÜR-Ausgaben steigen nur um die EINE abzugsfähige Buchung — die Privatentnahme zählt NICHT als Betriebsausgabe")
p(k_euer.ausgaben.every((a) => a.kategorie !== "Privatentnahme"), "K3 Privatentnahme taucht in der Ausgabenliste selbst gar nicht erst auf")
p(k_euer.privatentnahmeCent - k_vorher.privatentnahmeCent === 100000, "K4 Privatentnahme steht trotzdem nachrichtlich (bewegt das Konto, nicht den Gewinn)")
p(k_euer.gewinnCent === k_euer.summeEinnahmenCent - k_euer.summeAusgabenCent, "K5 Gewinn = Einnahmen minus Ausgaben, nachgerechnet")

const k_csv = erzeugeDatevCsv(
  [{ datum: `${k_jahr}-04-01`, bruttoCent: 119000, ustSatz: 19, art: "einnahme", kategorie: "Beratung", gegenpartei: "ABNAHME Kunde B", belegnummer: "RE-ABNAHME-0001" }],
  k_jahr,
)
const k_zeilen = k_csv.trim().split("\r\n")
p(k_zeilen[0].startsWith('"EXTF";700;21;'), "K6 DATEV-CSV: Kopfzeile beginnt mit dem gültigen EXTF-Kennzeichen", k_zeilen[0].slice(0, 30))
const k_spaltenAnzahl = k_zeilen[1].split(";").length
p(k_zeilen[2].split(";").length === k_spaltenAnzahl, "K7 die Datenzeile hat exakt so viele Felder wie die Spaltenkopfzeile")
p(k_zeilen[2].split(";")[0] === "1190,00", "K8 der Betrag steht mit Komma als Dezimaltrennzeichen (DATEV-Format)", k_zeilen[2].split(";")[0])
p(k_zeilen[2].includes("RE-ABNAHME-0001"), "K9 die Rechnungsnummer steht im Belegfeld 1")
p(k_zeilen[2].split(";")[8] === "3", "K10 BU-Schlüssel 3 (USt 19 % auf Erlöse) wird korrekt gesetzt")

const k_euerPdf = await erzeugeEuerPdf(k_euer, TESTFIRMA.name)
p(Buffer.from(k_euerPdf.slice(0, 5)).toString("latin1") === "%PDF-", "K11 die EÜR-PDF ist eine echte PDF-Datei")

const k_rechnungPdf = await erzeugeRechnungsPdf(fest2.dok, fest2.dok.absender)
p(Buffer.from(k_rechnungPdf.slice(0, 5)).toString("latin1") === "%PDF-" && k_rechnungPdf.length > 500,
  "K12 eine Ausgangsrechnung lässt sich als eigenständige PDF erzeugen (ohne Headless-Browser)")

const k_paket = await erzeugeSteuerberaterPaket(db, k_jahr)
const k_zip = await JSZipMod.loadAsync(k_paket)
p(k_zip.file(`euer/EUER_${k_jahr}.pdf`) !== null, "K13 Steuerberater-Paket enthält die EÜR-PDF")
p(k_zip.file(`datev/EXTF_Buchungsstapel_${k_jahr}.csv`) !== null, "K14 … den DATEV-Buchungsstapel")
p(k_zip.file("PRUEFSUMMEN.sha256") !== null, "K15 … eine Prüfsummenliste")
const k_pruefsummen = await k_zip.file("PRUEFSUMMEN.sha256").async("string")
p(/^[0-9a-f]{64}  /.test(k_pruefsummen.trim().split("\n")[0]), "K16 jede Zeile der Prüfsummenliste trägt einen echten SHA-256-Hash")
p(Object.keys(k_zip.files).some((n) => n.startsWith("rechnungen/") && n.endsWith(".xml")),
  "K17 mindestens eine Ausgangsrechnung liegt auch als XRechnung-XML im Paket")

/* ══ O · AfA / Anlagevermögen — mehrjährige Abschreibung ══ */
console.log("\nO · AfA / Anlagevermögen")

const o_jahr = Number(heuteBerlin().slice(0, 4))
// 3.570,00 € brutto bei 19 % → 3.000,00 € netto, auf 3 Jahre abgeschrieben → 1.000,00 €/Jahr. Kategorie "Hardware" kommt sonst nirgends im Drill vor — absolute Prüfung statt Vorher/Nachher-Delta reicht.
await db(
  `INSERT INTO fin_buchungen (id, art, status, datum, brutto_cent, ust_satz, kategorie, gegenpartei, quelle, afa_jahre)
   VALUES ('ABNAHME-o-afa-1','ausgabe','gebucht',$1,357000,19,'Hardware','ABNAHME Anlagegut-Lieferant','manuell',3)`,
  [`${o_jahr}-03-01`],
)

const o_jahr1 = await berechneEuer(db, String(o_jahr))
const o_jahr1Afa = o_jahr1.ausgaben.find((a) => a.kategorie === "Hardware")
p(o_jahr1Afa?.cent === 100000,
  "O1 Anschaffungsjahr: genau die erste AfA-Rate (1.000,00 €) fließt in die EÜR, nicht der volle Kaufpreis (3.000,00 €)", JSON.stringify(o_jahr1Afa))

const o_jahr2 = await berechneEuer(db, String(o_jahr + 1))
const o_jahr2Afa = o_jahr2.ausgaben.find((a) => a.kategorie === "Hardware")
p(o_jahr2Afa?.cent === 100000,
  "O2 Folgejahr (ohne neue Buchung!): die zweite AfA-Rate (1.000,00 €) erscheint trotzdem — die Abschreibung läuft über die Nutzungsdauer weiter", JSON.stringify(o_jahr2Afa))

const o_jahr4 = await berechneEuer(db, String(o_jahr + 3))
const o_jahr4Afa = o_jahr4.ausgaben.find((a) => a.kategorie === "Hardware")
p((o_jahr4Afa?.cent ?? 0) === 0, "O3 nach Ablauf der Nutzungsdauer (3 Jahre): keine weitere AfA-Rate mehr — vollständig abgeschrieben")

const o_feldJahr2 = await ladeFelder(db, String(o_jahr + 1))
p(o_feldJahr2.summe.ausCent >= 100000,
  "O4 dieselbe Abschreibung taucht konsistent auch in der Geschäftsfelder-Ansicht (ladeFelder()) auf — eine Formel, nicht zwei auseinanderlaufende")

/* ══ P · Kompass — Wachstumssignale aus echten Zahlen ══ */
console.log("\nP · Kompass-Wachstumssignale")

// 6 Monate stetig 1.000,00 € Ausgaben, keine Einnahmen — Schnitt und "diff > 0"-Hinweis bleiben neutral/aus.
const p_verlaufRuhig = Array.from({ length: 6 }, (_, i) => ({ schluessel: `2026-0${i + 1}`, einCent: 0, ausCent: 100000 }))
const p_basis = { topf: { ustOffenCent: 0, estRuecklageCent: 0, gewinnJahrCent: 0, gesamtCent: 0 }, wochen: [], fristen: [], buchungen: [], heute: "2026-06-15", eur: formatEuroKompakt }

const p_puffer = kompass({ ...p_basis, freiCent: 900000, verlauf: p_verlaufRuhig, reichweite: 9, felder: [] })
p(p_puffer.some((h) => h.schwere === "neutral" && h.text.includes("3.000,00") && h.text.includes("6-Monats-Ziel")),
  "P1 9 Monate Puffer bei 6 Monaten Ziel: der Überschuss (3.000,00 €) steht als konkrete Zahl im Hinweis, nicht nur ein Satz ohne Betrag", JSON.stringify(p_puffer))

const p_keinUeberschuss = kompass({ ...p_basis, freiCent: 600000, verlauf: p_verlaufRuhig, reichweite: 6, felder: [] })
p(!p_keinUeberschuss.some((h) => h.text.includes("liegen über dem 6-Monats-Ziel")),
  "P2 genau am 6-Monats-Ziel (kein Überschuss): kein falscher Überschuss-Betrag behauptet")

const p_felderKonzentriert = [
  { label: "IT", einCent: 500000, ausCent: 100000, anzahl: 5 },
  { label: "Glasfaser", einCent: 100000, ausCent: 50000, anzahl: 3 },
]
const p_margeKonzentriert = kompass({ ...p_basis, freiCent: 0, verlauf: [], reichweite: null, felder: p_felderKonzentriert })
p(p_margeKonzentriert.some((h) => h.text.startsWith("IT trägt dieses Jahr 89 %") && h.text.includes("4.000,00") && h.text.includes("4.500,00")),
  "P3 ein Geschäftsfeld, das 89 % der Marge trägt, wird mit Anteil und beiden Beträgen benannt — eine Beobachtung, keine Handlungsanweisung", JSON.stringify(p_margeKonzentriert))

const p_nurEinFeld = kompass({ ...p_basis, freiCent: 0, verlauf: [], reichweite: null, felder: [{ label: "IT", einCent: 500000, ausCent: 100000, anzahl: 5 }] })
p(!p_nurEinFeld.some((h) => h.text.includes("trägt dieses Jahr")), "P4 mit nur einem aktiven Geschäftsfeld gibt es nichts zu vergleichen — kein Hinweis")

const p_felderDefizit = [
  { label: "IT", einCent: 100000, ausCent: 300000, anzahl: 5 },
  { label: "Glasfaser", einCent: 50000, ausCent: 50000, anzahl: 3 },
]
const p_margeDefizit = kompass({ ...p_basis, freiCent: 0, verlauf: [], reichweite: null, felder: p_felderDefizit })
p(!p_margeDefizit.some((h) => h.text.includes("trägt dieses Jahr")), "P5 bei insgesamt negativer Marge (Verlust) wird kein Investitions-Hebel behauptet — zu früh für diese Frage")

/* ══ L · Teilzahlungen und Bank-Import (Phase 6) ══ */
console.log("\nL · Teilzahlungen und Bank-Import")

const l_re1 = await neueRechnung(kunde())
const l_fest1 = await schreibeFest(db, l_re1)
p(l_fest1.ok, "L1 Testrechnung wird festgeschrieben (brutto 1.190,00 €)", String(l_fest1.dok?.summen?.bruttoCent))
const l_brutto1 = l_fest1.dok.summen.bruttoCent

/* kontostand_am defaultet auf HEUTE (Neuanlage, noch kein echter Startwert) — kontostandHeute() zaehlt nur datum > kontostand_am, eine sinnvolle Kontostand-Probe braucht also einen Startpunkt in der Vergangenheit. */
await db(`UPDATE fin_einstellungen SET kontostand_am = $1 WHERE id = 'haupt'`, [addTage(heuteBerlin(), -365)])
const l_standVorTeilzahlung = (await berechneLage(db)).stand
const l_teil1 = await erfasseZahlung(db, l_re1, 50000, heuteBerlin(), "manuell", null)
p(l_teil1.ok && l_teil1.stand.status === "teilbezahlt" && l_teil1.stand.offenCent === l_brutto1 - 50000,
  "L2 eine Teilzahlung von 500,00 € setzt den Status auf `teilbezahlt`, der Rest stimmt", JSON.stringify(l_teil1))
p(anzeigeStatus(await ladeDokument(db, l_re1)) === "teilbezahlt", "L3 anzeigeStatus() zeigt `teilbezahlt`")
p((await bezahltCent(db, l_re1)) === 50000, "L4 bezahltCent() summiert die Zahlungen korrekt")
const l_zahlungenZwischen = await ladeZahlungen(db, l_re1)
p(l_zahlungenZwischen.length === 1 && l_zahlungenZwischen[0].cent === 50000 && l_zahlungenZwischen[0].quelle === "manuell",
  "L5 ladeZahlungen() liefert genau die eine erfasste Zahlung")

const l_buchungenVorRest = await db(`SELECT status, brutto_cent FROM fin_buchungen WHERE quelle='rechnung' AND quelle_ref=$1 AND storniert_at IS NULL ORDER BY status`, [l_re1])
p(l_buchungenVorRest.some((b) => b.status === "geplant" && Number(b.brutto_cent) === l_brutto1 - 50000),
  "L6 der noch offene Rest (690,00 €) steht weiter als `geplant` — nicht bei jeder Teilzahlung sofort alles gebucht", JSON.stringify(l_buchungenVorRest))
p(l_buchungenVorRest.some((b) => b.status === "gebucht" && Number(b.brutto_cent) === 50000),
  "L6b … UND die Teilzahlung selbst ist sofort `gebucht` — als eigene Zeile, an dem Tag, an dem sie wirklich einging")
const l_standNachTeilzahlung = (await berechneLage(db)).stand
p(l_standNachTeilzahlung - l_standVorTeilzahlung === 50000,
  "L6c der Kontostand (kontostandHeute(), Geldfluss) sieht die Teilzahlung SOFORT — nicht erst, wenn die Rechnung ganz bezahlt ist",
  String(l_standNachTeilzahlung - l_standVorTeilzahlung))

const l_rest = l_brutto1 - 50000
const l_teil2 = await erfasseZahlung(db, l_re1, l_rest, heuteBerlin(), "manuell", null)
p(l_teil2.ok && l_teil2.stand.status === "bezahlt" && l_teil2.stand.offenCent === 0 && !l_teil2.stand.ueberzahlt,
  "L7 die Restzahlung bringt den Rest auf 0 und setzt `bezahlt`")
p((await ladeDokument(db, l_re1)).status === "bezahlt", "L8 der Dokumentstatus steht nach dem Neuladen auf `bezahlt`")
const l_buchungenNachRest = await db(`SELECT status, brutto_cent FROM fin_buchungen WHERE quelle='rechnung' AND quelle_ref=$1 AND storniert_at IS NULL`, [l_re1])
p(l_buchungenNachRest.every((b) => b.status === "gebucht") && l_buchungenNachRest.reduce((s, b) => s + Number(b.brutto_cent), 0) === l_brutto1,
  "L9 … und bei Rest 0 ist GENAU der volle Rechnungsbetrag `gebucht` — als Summe zweier Zahlungen (500,00 € + 691,00 €), keine `geplant`-Zeile bleibt übrig", JSON.stringify(l_buchungenNachRest))
const l_standNachVollzahlung = (await berechneLage(db)).stand
p(l_standNachVollzahlung - l_standNachTeilzahlung === l_rest,
  "L9b der Kontostand steigt bei der Restzahlung nur noch um den Rest (691,00 €) — die 500,00 € wurden nicht doppelt gezählt")

const l_nachBezahlt = await erfasseZahlung(db, l_re1, 100, heuteBerlin(), "manuell", null)
p(!l_nachBezahlt.ok, "L10 eine bereits vollständig bezahlte Rechnung nimmt keine weitere Zahlung mehr an")

const l_re2 = await neueRechnung(kunde())
const l_fest2 = await schreibeFest(db, l_re2)
const l_ueberzahlung = await erfasseZahlung(db, l_re2, l_fest2.dok.summen.bruttoCent + 5000, heuteBerlin(), "manuell", null)
p(l_ueberzahlung.ok && l_ueberzahlung.stand.status === "bezahlt" && l_ueberzahlung.stand.ueberzahlt && l_ueberzahlung.stand.offenCent === -5000,
  "L11 eine Überzahlung gilt als bezahlt UND wird als Überzahlung gemeldet (Hinweis, kein Blocker)")
const l_ueberzahlungBuchung = await db(`SELECT ust_satz, brutto_cent FROM fin_buchungen WHERE quelle='rechnung' AND quelle_ref=$1 AND kategorie='Überzahlung'`, [l_re2])
p(l_ueberzahlungBuchung.length === 1 && Number(l_ueberzahlungBuchung[0].ust_satz) === 0 && Number(l_ueberzahlungBuchung[0].brutto_cent) === 5000,
  "L11b … und die 50,00 € darüber stehen als eigene 0 %-Einnahme im Hauptbuch — keiner Rechnungsposition mehr zuzuordnen, aber nicht verloren")

/* Zahlung quer über zwei USt-Saetze: fuellt der Reihe nach (USt aufsteigend), nicht proportional. */
const l_re_mix = await neueRechnung(kunde(), "rechnung", "de", [position({ preisCent: 40_000, ustSatz: 0 }), position({ preisCent: 60_000, ustSatz: 19 })])
await schreibeFest(db, l_re_mix)
const l_geplantMixVorher = await db(`SELECT ust_satz, brutto_cent FROM fin_buchungen WHERE quelle='rechnung' AND quelle_ref=$1 AND status='geplant' ORDER BY ust_satz`, [l_re_mix])
p(l_geplantMixVorher.length === 2 && Number(l_geplantMixVorher[0].ust_satz) === 0 && Number(l_geplantMixVorher[0].brutto_cent) === 40000 && Number(l_geplantMixVorher[1].ust_satz) === 19 && Number(l_geplantMixVorher[1].brutto_cent) === 71400,
  "L11c Fixtur: eine Rechnung mit zwei USt-Sätzen legt zwei getrennte geplante Buchungen an (0 % und 19 %)", JSON.stringify(l_geplantMixVorher))
// 50.000 Cent reichen die 0 %-Gruppe (40.000) komplett ab und gehen mit 10.000 Cent in die 19 %-Gruppe.
await erfasseZahlung(db, l_re_mix, 50000, heuteBerlin(), "manuell", null)
const l_mixNachher = await db(`SELECT status, ust_satz, brutto_cent FROM fin_buchungen WHERE quelle='rechnung' AND quelle_ref=$1 ORDER BY ust_satz, status`, [l_re_mix])
p(l_mixNachher.filter((b) => b.status === "gebucht").length === 2
    && l_mixNachher.some((b) => b.status === "gebucht" && Number(b.ust_satz) === 0 && Number(b.brutto_cent) === 40000)
    && l_mixNachher.some((b) => b.status === "gebucht" && Number(b.ust_satz) === 19 && Number(b.brutto_cent) === 10000),
  "L11d die Teilzahlung füllt zuerst die 0 %-Gruppe ganz auf (40.000 Cent gebucht) und bucht den Rest (10.000 Cent) in die 19 %-Gruppe", JSON.stringify(l_mixNachher))
p(l_mixNachher.some((b) => b.status === "geplant" && Number(b.ust_satz) === 19 && Number(b.brutto_cent) === 61400),
  "L11e … die 19 %-Gruppe bleibt mit dem Rest (61.400 Cent) weiter `geplant` — keine Gruppe verschwindet, bevor sie wirklich beglichen ist")
p(!l_mixNachher.some((b) => Number(b.ust_satz) === 0 && b.status === "geplant"), "L11f … die 0 %-Gruppe ist vollständig aufgebraucht und als `geplant`-Zeile verschwunden")

const l_re3 = await neueRechnung(kunde())
await schreibeFest(db, l_re3)
await markiereBezahlt(db, l_re3, heuteBerlin())
p((await ladeDokument(db, l_re3)).status === "bezahlt", "L12 markiereBezahlt() bleibt abwärtskompatibel: ein Klick zahlt den vollen Rest in einem Schritt")

p(await wirft(() => db(`UPDATE fin_zahlungen SET cent = 1 WHERE dokument_id = $1`, [l_re1])), "L13 fin_zahlungen ist GoBD-gesperrt: UPDATE wird vom Trigger verweigert")
p(await wirft(() => db(`DELETE FROM fin_zahlungen WHERE dokument_id = $1`, [l_re1])), "L14 … DELETE ebenso")

/* -- CSV-Import -- */
const l_csv = '"Buchungstag";"Verwendungszweck";"Betrag"\n"15.04.2026";"Vielen Dank";"1.234,56"\n'
const l_csvUmsaetze = leseBankCsv(l_csv)
p(l_csvUmsaetze.length === 1 && l_csvUmsaetze[0].datum === "2026-04-15" && l_csvUmsaetze[0].betragCent === 123456 && l_csvUmsaetze[0].verwendungszweck === "Vielen Dank",
  "L15 CSV-Import: deutsches Datum und Komma-Betrag werden korrekt erkannt", JSON.stringify(l_csvUmsaetze[0]))

const l_importiert1 = await importiereBankUmsaetze(db, l_csvUmsaetze, "csv")
const l_importiert2 = await importiereBankUmsaetze(db, l_csvUmsaetze, "csv")
p(l_importiert1 === 1 && l_importiert2 === 0, "L16 derselbe CSV-Import ein zweites Mal bringt keine Dubletten (Prüfsumme als Schlüssel)")

/* -- camt.053-Import -- */
const l_camt = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="EUR">${(l_brutto1 / 100).toFixed(2)}</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2026-04-20</Dt></BookgDt>
        <AcctSvcrRef>REF-ABNAHME-001</AcctSvcrRef>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>${l_fest1.dok.nummer} Vielen Dank</Ustrd></RmtInf>
            <RltdPties><Dbtr><Nm>ABNAHME Kunde</Nm></Dbtr></RltdPties>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`
const l_camtUmsaetze = leseCamt053(l_camt)
p(l_camtUmsaetze.length === 1 && l_camtUmsaetze[0].betragCent === l_brutto1 && l_camtUmsaetze[0].verwendungszweck.includes(l_fest1.dok.nummer) && l_camtUmsaetze[0].gegenpartei === "ABNAHME Kunde",
  "L17 camt.053-Import: Betrag, Verwendungszweck und Gegenpartei korrekt gelesen", JSON.stringify(l_camtUmsaetze[0]))

/* -- Auto-Abgleich -- */
const l_re4 = await neueRechnung(kunde({ name: "ABNAHME Sonderkunde Bankabgleich" }))
const l_fest4 = await schreibeFest(db, l_re4)
await importiereBankUmsaetze(db, [{ ref: "abgleich-per-nummer", datum: heuteBerlin(), betragCent: l_fest4.dok.summen.bruttoCent, verwendungszweck: `Überweisung ${l_fest4.dok.nummer} danke`, gegenpartei: "Irgendwer GmbH" }], "csv")
const l_offenNachNummer = await ladeOffeneBankUmsaetze(db)
const l_treffer1 = l_offenNachNummer.find((u) => u.id === "abgleich-per-nummer")
p(l_treffer1?.vorschlag?.dokumentId === l_re4 && l_treffer1.vorschlag.grund.includes("Rechnungsnummer"),
  "L18 Auto-Abgleich per Rechnungsnummer im Verwendungszweck funktioniert, auch wenn Gegenpartei abweicht")

const l_re5 = await neueRechnung(kunde({ name: "ABNAHME Sonderkunde Fuzzy" }), "rechnung", "de", [position({ preisCent: 250_000 })])
const l_fest5 = await schreibeFest(db, l_re5)
await importiereBankUmsaetze(db, [{ ref: "abgleich-per-betrag-kunde", datum: heuteBerlin(), betragCent: l_fest5.dok.summen.bruttoCent, verwendungszweck: "Zahlung Projekt Oktober", gegenpartei: "ABNAHME Sonderkunde Fuzzy" }], "csv")
const l_offenNachBetrag = await ladeOffeneBankUmsaetze(db)
const l_treffer2 = l_offenNachBetrag.find((u) => u.id === "abgleich-per-betrag-kunde")
p(l_treffer2?.vorschlag?.dokumentId === l_re5 && l_treffer2.vorschlag.grund.includes("Betrag und Kunde"),
  "L19 ohne Rechnungsnummer im Text: Betrag + Kundenname im Verwendungszweck/Gegenpartei genügt als Vorschlag")

await importiereBankUmsaetze(db, [{ ref: "abgleich-kein-treffer", datum: heuteBerlin(), betragCent: 777_77, verwendungszweck: "Diverses, ohne Bezug", gegenpartei: "Unbekannt" }], "csv")
const l_offenOhneTreffer = await ladeOffeneBankUmsaetze(db)
p(l_offenOhneTreffer.find((u) => u.id === "abgleich-kein-treffer")?.vorschlag === null, "L20 ohne Nummer, Betrag oder Kundenbezug bleibt der Vorschlag leer — landet im Eingangskorb")

const l_zuordnung = await bestaetigeZuordnung(db, "abgleich-per-nummer", l_re4)
p(l_zuordnung.ok && l_zuordnung.stand.status === "bezahlt", "L21 bestaetigeZuordnung() bucht die Zahlung auf die Rechnung — ein Klick, Rechnung ist jetzt bezahlt")
p((await ladeOffeneBankUmsaetze(db)).every((u) => u.id !== "abgleich-per-nummer"), "L22 … und der Umsatz verschwindet aus dem offenen Eingangskorb")
const l_zahlungAusBank = (await ladeZahlungen(db, l_re4)).find((z) => z.quelle === "bank")
p(l_zahlungAusBank?.ref === "abgleich-per-nummer", "L23 die Zahlung in fin_zahlungen trägt die Bankreferenz als ref — nachvollziehbar, woher sie kam")

const l_erneuteZuordnung = await bestaetigeZuordnung(db, "abgleich-per-nummer", l_re4)
p(!l_erneuteZuordnung.ok, "L24 ein bereits zugeordneter Umsatz lässt sich nicht noch einmal zuordnen")

await ignoriereUmsatz(db, "abgleich-kein-treffer")
p((await ladeOffeneBankUmsaetze(db)).every((u) => u.id !== "abgleich-kein-treffer"), "L25 ignoriereUmsatz() nimmt einen Umsatz aus dem Eingangskorb, ohne ihn zu loeschen")
const l_ignorierterStatus = await db(`SELECT status FROM fin_bank_umsaetze WHERE id = $1`, ["abgleich-kein-treffer"])
p(l_ignorierterStatus[0]?.status === "ignoriert", "… die Zeile bleibt erhalten, nur der Status aendert sich (append-only im Geiste, nichts verschwindet)")

/* ══ M · Besitzer-Morgenmail (Phase 7) ══ */
console.log("\nM · Besitzer-Morgenmail")

const m_korbVorher = (await erstelleMorgenBericht(db)).belegeImKorb
await db(
  `INSERT INTO fin_belege (id, quelle, extern_id, art, datum, haendler, brutto_cent, netto_cent, vorsteuer_cent, kategorie, datei_status)
   VALUES ('ABNAHME-m-beleg-korb','hand','ABNAHME-sha-m','beleg','2026-10-10','ABNAHME Haendler M',5000,4201,799,'Büro','kopiert')`,
)
const m_re1 = await neueRechnung(kunde())
await schreibeFest(db, m_re1)
await db(`UPDATE fin_dokumente SET faellig_am = $2 WHERE id = $1`, [m_re1, addTage(heuteBerlin(), -10)])

const m_bericht = await erstelleMorgenBericht(db)
p(m_bericht.belegeImKorb === m_korbVorher + 1, "M1 erstelleMorgenBericht() zaehlt den neu angelegten, nicht zugeordneten Beleg mit")
const m_mahnung = m_bericht.faelligeMahnungen.find((x) => x.id === m_re1)
p(m_mahnung?.stufe === 1 && m_mahnung.tageUeberfaellig === 10, "M2 eine seit 10 Tagen ueberfaellige, frische Rechnung erscheint als faellige Zahlungserinnerung (Stufe 1)")
p(m_bericht.bankUmsaetzeOffen === (await ladeOffeneBankUmsaetze(db)).length, "M3 bankUmsaetzeOffen im Bericht stimmt mit dem tatsaechlichen Eingangskorb ueberein")

await setUstPflichtig(false)
const m_berichtKlein = await erstelleMorgenBericht(db)
p(typeof m_berichtKlein.paragraph19Hinweis === "string" || m_berichtKlein.paragraph19Hinweis === null,
  "M4 paragraph19Hinweis ist entweder ein Text (Ampel nicht ruhig) oder null (ruhig) — nie etwas anderes")
await setUstPflichtig(true)
const m_berichtRegelbesteuert = await erstelleMorgenBericht(db)
p(m_berichtRegelbesteuert.paragraph19Hinweis === null, "M5 bei Umsatzsteuerpflicht zeigt der Bericht keinen § 19-Hinweis — er gilt nicht mehr")

const m_versand1 = await sendeMorgenmailFallsFaellig(db)
p(!m_versand1.versendet && /RESEND_API_KEY|MAIL_FROM|LEAD_TO/.test(m_versand1.grund ?? ""),
  "M6 ohne RESEND_API_KEY/MAIL_FROM/LEAD_TO wird nichts verschickt, aber klar benannt, woran es fehlt (optionales Modul, siehe .env.example)", m_versand1.grund)

await db(`INSERT INTO fin_protokoll (aktion, daten) VALUES ('morgenmail_gesendet', $1::jsonb)`, [JSON.stringify({ datum: heuteBerlin() })])
const m_versand2 = await sendeMorgenmailFallsFaellig(db)
p(!m_versand2.versendet && m_versand2.grund === "heute bereits verschickt",
  "M7 ist fuer heute schon ein Protokolleintrag vorhanden, verschickt ein zweiter Lauf (z. B. ein erneuter Cron) nichts mehr — hoechstens eine Mail pro Tag")

/* ══ N · Missbrauchsschutz /dokument/[token] (Phase 8) ══ */
console.log("\nN · Rate-Limit")

p(callerAdresse(new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" })) === "203.0.113.9", "N1 callerAdresse() nimmt die ERSTE Adresse aus x-forwarded-for (der Aufrufer, nicht ein zwischengeschalteter Proxy)")
p(callerAdresse(new Headers({ "x-real-ip": "203.0.113.9" })) === "203.0.113.9", "N2 … oder x-real-ip, wenn x-forwarded-for fehlt")
p(callerAdresse(new Headers()) === "unbekannt", "N3 … oder ein fester Platzhalter, wenn beides fehlt (lokal; im Betrieb reicht Vercel immer eine Adresse durch)")

const n_schluessel = "ABNAHME-dokument-token-1:203.0.113.9"
for (let i = 0; i < 10; i++) p(await pruefeRateLimit(db, n_schluessel, 10, 60), `N4.${i + 1} Versuch ${i + 1}/10 ist innerhalb des Limits erlaubt`)
p(!(await pruefeRateLimit(db, n_schluessel, 10, 60)), "N5 der 11. Versuch innerhalb derselben Stunde wird abgelehnt")
p(await pruefeRateLimit(db, "ABNAHME-dokument-token-2:203.0.113.9", 10, 60), "N6 ein ANDERER Token (anderer Schlüssel) hat sein eigenes, unabhängiges Kontingent")
p(await pruefeRateLimit(db, "ABNAHME-dokument-token-1:198.51.100.7", 10, 60), "N7 derselbe Token, aber eine ANDERE IP, hat ebenfalls sein eigenes Kontingent")

/* ══ Z · Ende-zu-Ende (Phase 9) — eine durchgehende Geschichte, auf den Cent ══ */
console.log("\nZ · Ende-zu-Ende")

const z_kunde = kunde({ name: "ABNAHME Ende-zu-Ende Kunde" })
const z_jahr = heuteBerlin().slice(0, 4)

/* Angebot → Annahme */
const z_angebotId = await neueRechnung(z_kunde, "angebot", "de", [position({ preisCent: 300_000 })])
const z_festAngebot = await schreibeFest(db, z_angebotId)
p(z_festAngebot.ok && z_festAngebot.dok.summen.bruttoCent === 357000, "Z1 Angebot über 3.000,00 € netto wird festgeschrieben — brutto 3.570,00 € bei 19 %", String(z_festAngebot.dok.summen.bruttoCent))
p(await beantworteAngebot(db, z_angebotId, { antwort: "angenommen", name: "ABNAHME Kunde", text: "Angenommen.", quelle: "kunde" }), "Z2 Angebot wird angenommen")

/* Rechnung MIT Anzahlung (30 %) */
const z_reId = await rechnungAusAngebot(db, z_angebotId, 30)
p(z_reId !== null, "Z3 aus dem angenommenen Angebot entsteht eine Anzahlungsrechnung (30 %)")
const z_festRe = await schreibeFest(db, z_reId)
p(z_festRe.ok && z_festRe.dok.summen.nettoCent === 90000 && z_festRe.dok.summen.bruttoCent === 107100,
  "Z4 die Anzahlungsrechnung lautet exakt auf 900,00 € netto / 1.071,00 € brutto (30 % von 3.000,00 €)", String(z_festRe.dok.summen))

const z_euerVorBezahlung = await berechneEuer(db, z_jahr)

/* Teilzahlung von Hand */
const z_teil = await erfasseZahlung(db, z_reId, 50000, heuteBerlin(), "manuell", null)
p(z_teil.ok && z_teil.stand.status === "teilbezahlt" && z_teil.stand.offenCent === 57100, "Z5 eine Teilzahlung von 500,00 € lässt genau 571,00 € offen")

/* Restzahlung über den Bank-Import, automatisch vorgeschlagen und bestätigt */
await importiereBankUmsaetze(db, [{ ref: "z-restzahlung", datum: heuteBerlin(), betragCent: 57100, verwendungszweck: `Überweisung ${z_festRe.dok.nummer}`, gegenpartei: "ABNAHME Ende-zu-Ende Kunde" }], "csv")
const z_vorschlag = (await ladeOffeneBankUmsaetze(db)).find((u) => u.id === "z-restzahlung")
p(z_vorschlag?.vorschlag?.dokumentId === z_reId, "Z6 der Bank-Import schlägt die Restzahlung automatisch der richtigen Rechnung vor (Rechnungsnummer im Verwendungszweck)")
const z_zuordnung = await bestaetigeZuordnung(db, "z-restzahlung", z_reId)
p(z_zuordnung.ok && z_zuordnung.stand.status === "bezahlt" && z_zuordnung.stand.offenCent === 0, "Z7 nach der Bestätigung ist die Anzahlungsrechnung vollständig bezahlt, Rest exakt 0")

const z_euerNachBezahlung = await berechneEuer(db, z_jahr)
p(z_euerNachBezahlung.summeEinnahmenCent - z_euerVorBezahlung.summeEinnahmenCent === 90000,
  "Z8 die EÜR verbucht die Anzahlung ERST jetzt, bei tatsächlichem Zahlungseingang (Ist-Versteuerung) — exakt 900,00 € netto, kein Cent mehr oder weniger",
  String(z_euerNachBezahlung.summeEinnahmenCent - z_euerVorBezahlung.summeEinnahmenCent))

/* Eine ZWEITE Rechnung, die storniert wird */
const z_re2Id = await neueRechnung(z_kunde, "rechnung", "de", [position({ preisCent: 50_000 })])
const z_festRe2 = await schreibeFest(db, z_re2Id)
const z_stornoId = await storniere(db, z_re2Id, "ABNAHME Kunde storniert")
p(z_stornoId !== null, "Z9 die zweite Rechnung wird storniert")
p((await ladeDokument(db, z_re2Id)).status === "storniert", "Z10 … und steht entsprechend auf `storniert`")
const z_stornoDok = await ladeDokument(db, z_stornoId)
p(z_stornoDok?.summen.bruttoCent === -z_festRe2.dok.summen.bruttoCent, "Z11 die Stornorechnung trägt denselben Betrag mit umgekehrtem Vorzeichen — nichts wird gelöscht, nur gegengebucht")

/* Beleg-Upload (ohne Blob — siehe Abschnitt H) */
await db(
  `INSERT INTO fin_belege (id, quelle, extern_id, art, datum, haendler, brutto_cent, netto_cent, vorsteuer_cent, kategorie, datei_status)
   VALUES ('ABNAHME-z-beleg','hand','ABNAHME-sha-z','beleg',$1,'ABNAHME Ende-zu-Ende Lieferant',11900,10000,1900,'Software & Hosting','kopiert')`,
  [heuteBerlin()],
)
p((await ordneZu(db, ["ABNAHME-z-beleg"], "it")) === 1, "Z12 der hochgeladene Beleg wird einem Geschäftsfeld zugeordnet und erzeugt eine Ausgaben-Buchung")

/* Eingehende E-Rechnung (dieselbe Eigenrechnung als CII-Fixtur, wie in Abschnitt I) */
const z_eingehend = erzeugeXRechnung(z_festRe.dok, z_festRe.dok.absender, true)
const z_eingehendGelesen = z_eingehend.ok ? await leseERechnung(Buffer.from(z_eingehend.xml, "utf8"), "application/xml") : null
p(z_eingehendGelesen?.daten.rechnungsnummer === z_festRe.dok.nummer && z_eingehendGelesen?.daten.bruttoCent === 107100,
  "Z13 eine eingehende E-Rechnung (CII) wird korrekt gelesen — Nummer und Betrag stimmen exakt mit der Ausgangsrechnung überein")

/* Steuerberater-Paket für das Jahr */
const z_paket = await erzeugeSteuerberaterPaket(db, z_jahr)
const z_zip = await JSZipMod.loadAsync(z_paket)
p(z_zip.file(`euer/EUER_${z_jahr}.pdf`) !== null && z_zip.file(`datev/EXTF_Buchungsstapel_${z_jahr}.csv`) !== null,
  "Z14 das Steuerberater-Paket für das Jahr enthält EÜR-PDF und DATEV-Buchungsstapel — inklusive der gesamten Ende-zu-Ende-Geschichte")
const z_zipHatAnzahlungsXml = Object.keys(z_zip.files).some((n) => n.startsWith("rechnungen/") && n.includes(z_festRe.dok.nummer))
p(z_zipHatAnzahlungsXml, "Z15 … und die Anzahlungsrechnung liegt darin auch als eigene XRechnung-XML — dieselbe Nummer, nicht nur eine Zahl in der EÜR")

console.log(`\n  ${fehler === 0 ? "Finanz rechnet, nummeriert und gleicht ab, wie es soll." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
await close()
process.exit(fehler === 0 ? 0 : 1)
