#!/usr/bin/env node
/**
 * DER KUNDENERFOLGS-PROBELAUF — GATE 22
 *
 * Prueft die Stellen, an denen Kundenerfolg still zur Behauptung wird: eine
 * Gesundheit, die zur Note verrechnet wird; ein Ausbau aus Hoffnung statt
 * Beobachtung; und eine Empfehlungsfrage im falschen Moment.
 */
const K = await import("../lib/kundenerfolg.ts")
const B = await import("../lib/betrieb.ts")
const L = await import("../lib/verlust.ts")
const C = await import("../lib/contact-access.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

const heute = new Date("2026-09-20T00:00:00Z")
const anliegen = (art, tag, extra = {}) => ({
  id: `${art}-${tag}`,
  art,
  was: "Bitte den Text anpassen",
  eingegangen: `2026-09-${tag}T09:00:00.000Z`,
  beantwortet: "2026-09-15T09:00:00.000Z",
  erledigt: "2026-09-16T09:00:00.000Z",
  ...extra,
})
const bild = (extra = {}) => ({
  anliegen: [],
  offeneForderungCent: 0,
  forderungUeberfaelligTage: 0,
  letzterKontakt: "2026-09-15",
  uebergeben: true,
  ...extra,
})

console.log("\nK1 · Gesundheit ist keine Zahl")
const gut = K.gesundheit(bild(), "2026-09", heute)
p(Array.isArray(gut.achsen) && gut.achsen.length === 4, "vier Achsen")
p(!("score" in gut) && !("note" in gut) && !("gesamt" in gut), "keine Gesamtnote",
  "eine Zahl laedt dazu ein, die Zahl zu verbessern")
p(gut.achsen.every((a) => a.grund.length > 15), "jede Achse mit Grund im Klartext")
p(Array.isArray(gut.achtung) && Array.isArray(gut.unklar), "und die Aufmerksamkeit ist eine Liste, kein Wert")

console.log("\nK2 · Die eigene Zusage zaehlt zuerst")
const verpasst = bild({ anliegen: [anliegen("stoerung", "01", { beantwortet: null, erledigt: null })] })
const lage = K.gesundheit(verpasst, "2026-09", heute)
const betrieb = lage.achsen.find((a) => a.key === "betrieb")
p(betrieb.urteil === "achtung", "ein verpasster Rueckruf ist Achtung")
p(/eigene Zusage/.test(betrieb.grund), "und der Grund sagt, dass es die eigene Zusage ist",
  "nicht die Laune des Kunden")

console.log("\nK3 · Unbekannt ist nicht null")
const ohneGeld = K.gesundheit(bild({ offeneForderungCent: null }), "2026-09", heute)
const geld = ohneGeld.achsen.find((a) => a.key === "geld")
p(geld.urteil === "unklar", "keine Forderungslage erhoben: unklar, nicht gut")
p(/Unbekannt ist nicht dasselbe wie null/.test(geld.grund), "und der Grund sagt genau das")
const ohneKontakt = K.gesundheit(bild({ letzterKontakt: null }), "2026-09", heute)
p(ohneKontakt.achsen.find((a) => a.key === "beziehung").urteil === "unklar",
  "kein erfasster Kontakt: unklar, nicht schlecht")

console.log("\nK4 · Stille ist ein Signal")
const still = K.gesundheit(bild({ letzterKontakt: "2026-05-01" }), "2026-09", heute)
const bez = still.achsen.find((a) => a.key === "beziehung")
p(bez.urteil === "achtung", `mehr als ${K.STILLE_TAGE} Tage Stille faellt auf`)
p(/kuendigt in der Stille/.test(bez.grund), "und der Grund nennt den Zusammenhang",
  "wer monatlich kuendigen kann, kuendigt ohne Ankuendigung")
p(K.gesundheit(bild({ letzterKontakt: "2026-09-01" }), "2026-09", heute)
  .achsen.find((a) => a.key === "beziehung").urteil === "gut", "frischer Kontakt ist gut")

console.log("\nK5 · Beide Enden der Nutzung sind ein Signal")
const nichts = K.gesundheit(bild(), "2026-09", heute).achsen.find((a) => a.key === "nutzung")
p(nichts.urteil === "unklar", "nichts abgerufen: unklar")
p(/wofuer er zahlt/.test(nichts.grund), "und der Grund sagt, warum das zaehlt")
const viel = K.gesundheit(
  bild({ anliegen: ["01", "02", "03"].map((t) => anliegen("inhaltsaenderung", t)) }),
  "2026-09", heute,
).achsen.find((a) => a.key === "nutzung")
p(viel.urteil === "unklar", "mehr als das Kontingent: auch unklar")
p(/falsche Paket/.test(viel.grund), "und der Grund nennt beide Lesarten",
  "entweder waechst der Betrieb, oder er hat das falsche Paket")

console.log("\nK6 · Ausbau kommt aus Beobachtung, nicht aus Hoffnung")
p(L.MUSTER_AB === 3, `die Schwelle kommt aus G16 und ist ${L.MUSTER_AB}`)
const dreiMonate = [
  ...["01", "02", "03"].map((t) => anliegen("inhaltsaenderung", t)),
  ...["01", "02", "03"].map((t) => ({ ...anliegen("inhaltsaenderung", t), id: `o-${t}`, eingegangen: `2026-10-${t}T09:00:00.000Z` })),
  ...["01", "02", "03"].map((t) => ({ ...anliegen("inhaltsaenderung", t), id: `n-${t}`, eingegangen: `2026-11-${t}T09:00:00.000Z` })),
]
const anlaesse = K.ausbauanlaesse(dreiMonate, ["2026-09", "2026-10", "2026-11"])
p(anlaesse.some((a) => a.key === "ueber-kontingent"), "drei Monate ueber Kontingent sind ein Anlass")
p(K.ausbauanlaesse(dreiMonate, ["2026-09"]).length === 0, "ein Monat ist keiner")
p(anlaesse.every((a) => a.richtung.length > 20), "jeder Anlass sagt die Richtung")
p(anlaesse.every((a) => !/Angebot ueber/.test(a.satz)), "aber keiner ist ein Angebot",
  "den Umfang schneidet danach ein Mensch")
const stoerungen = ["01", "02", "03"].map((t) => anliegen("stoerung", t))
p(K.ausbauanlaesse(stoerungen, ["2026-09"]).some((a) => a.key === "wiederkehrende-stoerung"),
  "drei Stoerungen sind ein Systemgespraech, kein Ticket")

console.log("\nK7 · Die Empfehlung wird im richtigen Moment erbeten")
const ok = K.empfehlungslage(bild(), K.gesundheit(bild(), "2026-09", heute))
p(ok.darfFragen, "uebergeben, nichts offen, keine Achtung: der Moment traegt")
p(ok.moment !== null && /G11/.test(ok.moment), "und der Satz verweist auf G11")

const nichtUebergeben = bild({ uebergeben: false })
const l1 = K.empfehlungslage(nichtUebergeben, K.gesundheit(nichtUebergeben, "2026-09", heute))
p(!l1.darfFragen, "ohne Uebergabe nicht")
p(l1.gruende.some((g) => /G19/.test(g)), "und der Grund nennt G19")

const schuldner = bild({ offeneForderungCent: 50000, forderungUeberfaelligTage: 45 })
const l2 = K.empfehlungslage(schuldner, K.gesundheit(schuldner, "2026-09", heute))
p(!l2.darfFragen, "mit ueberfaelliger Rechnung nicht")
p(l2.gruende.some((g) => /taktlos/.test(g)), "und der Grund sagt, warum",
  "die Antwort waere ohnehin keine")

const gestoert = bild({ anliegen: [anliegen("stoerung", "01", { beantwortet: null, erledigt: null })] })
const l3 = K.empfehlungslage(gestoert, K.gesundheit(gestoert, "2026-09", heute))
p(!l3.darfFragen, "mit verpasstem Rueckruf nicht")
p(l3.moment === null, "und es gibt keinen Satz dafuer")

console.log("\nK8 · Die Schleife endet in G11, nicht in der Pipeline")
p(C.CONTACT_SOURCES.includes(K.EMPFEHLUNG_QUELLE), "die Quelle gibt es in G11")
p(typeof K.empfehlungslage === "function", "dieses Modul sagt nur, ob der Moment traegt")
p(!("erzeugeKontakt" in K) && !("createContact" in K), "es erzeugt keinen Kontakt",
  "ein genannter Name ist das Personendatum eines Dritten")

console.log("\nK9 · Es gibt keine Verlaengerung — und das ist eine Zusage")
p(!("verlaengerungstermin" in K), "kein Termin im Modul")
p(/Mindestlaufzeit/.test(K.KEINE_VERLAENGERUNG), "die Begruendung nennt die oeffentliche Zusage")
p(/erfunden/.test(K.KEINE_VERLAENGERUNG), "und sagt, was ein eingebauter Termin waere")

console.log(`\n  ${fehler === 0 ? "Woran man es vorher merkt — nicht, wann es auslaeuft." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
