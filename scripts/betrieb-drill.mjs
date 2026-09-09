#!/usr/bin/env node
/**
 * DER BETRIEBS-PROBELAUF — GATE 21
 *
 * Prueft die Stellen, an denen eine Betriebszusage still unfair wird: ein
 * Kontingent, das Stoerungen mitzaehlt; eine Frist, die uebers Wochenende
 * falsch rechnet; und eine Grenze, die erst NACH der Arbeit sichtbar wird.
 */
const B = await import("../lib/betrieb.ts")
const S = await import("../lib/site-data.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

const a = (id, art, tag, extra = {}) => ({
  id,
  art,
  was: "Bitte den Text auf der Startseite anpassen",
  eingegangen: `2026-09-${tag}T09:00:00.000Z`,
  beantwortet: null,
  erledigt: null,
  ...extra,
})

console.log("\nB1 · Der naechste Werktag ist nicht der naechste Tag")
p(B.naechsterWerktag("2026-09-09T09:00:00Z") === "2026-09-10", "Mittwoch → Donnerstag")
p(B.naechsterWerktag("2026-09-11T09:00:00Z") === "2026-09-14", "Freitag → Montag",
  "das Wochenende zaehlt nicht")
p(B.naechsterWerktag("2026-09-12T09:00:00Z") === "2026-09-14", "Samstag → Montag")
p(B.naechsterWerktag("2026-09-13T09:00:00Z") === "2026-09-14", "Sonntag → Montag")
p(B.naechsterWerktag("2026-09-11T23:59:00Z") === "2026-09-14", "auch spaet am Freitag")
p(B.naechsterWerktag("unsinn") === null, "und ein Wort ist kein Zeitpunkt")

console.log("\nB2 · Beantwortet ist nicht erledigt")
const spaet = a("x", "stoerung", "09", { erledigt: "2026-09-30T10:00:00.000Z" })
p(B.rueckrufOffen(spaet, new Date("2026-09-20")), "ohne Rueckruf ist die Frist offen",
  "die Zusage ist der Rueckruf, nicht die Loesung")
const beantwortet = { ...spaet, beantwortet: "2026-09-10T08:00:00.000Z" }
p(!B.rueckrufOffen(beantwortet, new Date("2026-09-20")), "mit Rueckruf ist sie gehalten",
  "auch wenn die Loesung spaeter kommt")
const frisch = a("y", "inhaltsaenderung", "09")
p(!B.rueckrufOffen(frisch, new Date("2026-09-09")), "am selben Tag ist nichts ueberfaellig")
p(!B.rueckrufOffen(frisch, new Date("2026-09-10")), "am Fristtag auch nicht")
p(B.rueckrufOffen(frisch, new Date("2026-09-11")), "danach schon")

console.log("\nB3 · Eine Stoerung zaehlt nicht gegen das Kontingent")
p(!B.ANLIEGEN_ARTEN.stoerung.gegenKontingent, "Stoerung: nein",
  "sonst zahlt der Kunde fuer einen Fehler, den er nicht verursacht hat")
p(!B.ANLIEGEN_ARTEN.wartung.gegenKontingent, "Wartung: nein")
p(B.ANLIEGEN_ARTEN.inhaltsaenderung.gegenKontingent, "Inhaltsaenderung: ja")
const gemischt = [a("1", "stoerung", "01"), a("2", "wartung", "02"), a("3", "inhaltsaenderung", "03")]
const stand = B.kontingentstand(gemischt, "2026-09")
p(stand.verbraucht === 1, "drei Anliegen, ein verbrauchtes Kontingent", `${stand.verbraucht}`)
p(stand.frei === 1, "eines frei")
p(!stand.erschoepft, "und nicht erschoepft")

console.log("\nB4 · Das Kontingent ist monatlich, nicht ewig")
const zweiMonate = [a("1", "inhaltsaenderung", "01"), a("2", "inhaltsaenderung", "02")]
zweiMonate.push({ ...a("3", "inhaltsaenderung", "01"), eingegangen: "2026-10-01T09:00:00.000Z" })
p(B.kontingentstand(zweiMonate, "2026-09").verbraucht === 2, "September: zwei verbraucht")
p(B.kontingentstand(zweiMonate, "2026-10").verbraucht === 1, "Oktober faengt neu an")
p(B.kontingentstand(zweiMonate, "2026-09").erschoepft, "September ist erschoepft")
p(!B.kontingentstand(zweiMonate, "2026-10").erschoepft, "Oktober nicht")

console.log("\nB5 · Die Grenze ist VOR der Arbeit sichtbar")
const bestand = [a("1", "inhaltsaenderung", "01"), a("2", "inhaltsaenderung", "02")]
const dritte = a("3", "inhaltsaenderung", "03")
p(B.ausserhalb(dritte, [...bestand, dritte]), "die dritte liegt ausserhalb der 149 €")
p(!B.ausserhalb(a("2b", "inhaltsaenderung", "02"), [bestand[0], a("2b", "inhaltsaenderung", "02")]),
  "die zweite noch nicht")
p(!B.ausserhalb(a("4", "stoerung", "20"), [...bestand, a("4", "stoerung", "20")]),
  "eine Stoerung liegt nie ausserhalb")
p(/außerhalb der 149/.test(B.grenzsatz(B.kontingentstand(bestand, "2026-09"))),
  "und der Satz sagt es im Klartext")
p(/entscheidet ein Mensch/.test(B.grenzsatz(B.kontingentstand(bestand, "2026-09"))),
  "samt der Entscheidung, die ein Mensch trifft",
  "Kulanz oder Angebot — nicht automatisch")
p(/gedeckt/.test(B.grenzsatz(B.kontingentstand([bestand[0]], "2026-09"))),
  "und wenn es gedeckt ist, sagt er das auch")

console.log("\nB6 · Die Reihenfolge entscheidet, nicht die Kennung")
const spaeter = { ...a("z", "inhaltsaenderung", "28") }
const frueher = [a("1", "inhaltsaenderung", "01"), a("2", "inhaltsaenderung", "02"), spaeter]
p(B.ausserhalb(spaeter, frueher), "wer als dritter kam, ist der dritte")
p(!B.ausserhalb(frueher[0], frueher), "wer als erster kam, nicht")

console.log("\nB7 · Was einem Anliegen fehlt")
p(B.fehltAmAnliegen(a("1", "inhaltsaenderung", "01")).length === 0, "ein vollstaendiges hat keine Luecke")
p(B.fehltAmAnliegen({ ...a("1", "inhaltsaenderung", "01"), art: "sonstiges" }).length === 1,
  "eine unbekannte Art faellt auf")
p(B.fehltAmAnliegen({ ...a("1", "inhaltsaenderung", "01"), was: "" }).length === 1,
  "ein leeres Anliegen auch")
p(B.fehltAmAnliegen({ ...a("1", "inhaltsaenderung", "01"), eingegangen: "irgendwann" }).length === 1,
  "und ein Zeitpunkt, der keiner ist")
p(B.fehltAmAnliegen({ ...a("1", "inhaltsaenderung", "01"), erledigt: "2026-09-05T10:00:00Z" }).length === 1,
  "erledigt ohne Rueckruf ist ein Befund",
  "eine stille Erledigung haelt die Zusage nicht")

console.log("\nB8 · Der Umfang ist der oeffentliche")
const oeffentlich = S.retainer.includes?.de ?? []
p(B.UMFANG.length === oeffentlich.length, `${B.UMFANG.length} Zusagen, so viele wie auf der Seite`)
p(B.UMFANG.every((u) => oeffentlich.includes(u.zusage)), "und jede woertlich")
p(B.INHALT_JE_MONAT === 2, "das Kontingent ist zwei")
p(oeffentlich.some((z) => z.includes(String(B.INHALT_JE_MONAT))), "und die Zahl steht so im Satz")
p(B.UMFANG.filter((u) => u.art === "kontingent").length === 1, "genau ein Kontingent")
p(B.UMFANG.filter((u) => u.art === "frist").length === 1, "genau eine Frist")

console.log("\nB9 · Die Lage auf einen Blick")
const l = B.lage([...bestand, spaet], "2026-09", new Date("2026-09-20"))
/*
 * DIESE ZWEI ZAHLEN MUESSEN AUSEINANDERGEHEN — und der erste Entwurf dieses
 * Probelaufs erwartete faelschlich dieselbe.
 *
 * `spaet` ist ERLEDIGT, aber nie BEANTWORTET. Es zaehlt deshalb nicht mehr
 * als offen und trotzdem als ueberfaellig: Die Zusage lautet „Rueckruf am
 * naechsten Werktag", und eine stille Erledigung haelt sie nicht.
 *
 * Waeren beide Zahlen gleich, waere genau diese Unterscheidung verloren.
 */
p(l.offen === 2, "zwei offene Anliegen — das erledigte zaehlt nicht mehr", `${l.offen}`)
p(l.ueberfaellig.length === 3, "aber DREI ohne Rueckruf innerhalb der Frist",
  "erledigt ist nicht beantwortet")
p(l.ueberfaellig.some((x) => x.erledigt !== null), "darunter ein erledigtes",
  "still erledigt, nie zurueckgerufen — die Zusage ist trotzdem gebrochen")
p(l.kontingent.erschoepft, "und das Kontingent ist erschoepft")

console.log(`\n  ${fehler === 0 ? "Die Grenze steht vor der Arbeit, nicht auf der Rechnung." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
