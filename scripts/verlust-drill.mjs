#!/usr/bin/env node
/**
 * DER HERKUNFT- UND VERLUST-PROBELAUF — GATE 16
 *
 * Prueft die zwei Faelle, in denen ein Attributions- und Lernsystem still
 * unwahr wird:
 *
 *   · Es speichert eine Datenkategorie, die auf der Seite nicht steht.
 *   · Es sammelt Gruende, aus denen nie jemand etwas lernt.
 *
 * Er braucht keine Datenbank. Beides sind Aussagen ueber Texte und Regeln.
 */
const H = await import("../lib/herkunft.ts")
const V = await import("../lib/verlust.ts")
const M = await import("../lib/market.ts")
const P = await import("../lib/sales-playbook.ts")
const D = await import("../lib/dictionary.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

console.log("\nH1 · Ohne Erklaerung faellt die Kategorie")
p(!H.kampagneSpeicherbar(null), "kein Text: nein")
p(!H.kampagneSpeicherbar(""), "leerer Text: nein")
p(!H.kampagneSpeicherbar("   "), "nur Leerzeichen: nein")
p(!H.kampagneSpeicherbar("Wir erheben Name, Betrieb, E-Mail, Telefon und Ihre Nachricht."),
  "die heutige Erklaerung: nein", "sie nennt die Kampagnenherkunft nicht")

console.log("\nH2 · Der Satz des Owners ist der Schluessel")
p(H.kampagneSpeicherbar("… sowie die Herkunft der Anfrage (Kampagne, verweisende Website) …"),
  "nennt er die Kampagne, geht die Tuer auf")
p(H.kampagneSpeicherbar("Wir speichern den Werbeträger, über den Sie zu uns gekommen sind."),
  "auch in anderer Formulierung")
p(!H.kampagneSpeicherbar("Wir setzen keine Werbe-Cookies und bilden keine Profile."),
  "ein Satz ohne das Wort oeffnet nichts")
/*
 * DIESE VIER SIND DER EIGENTLICHE FALL — und der erste Entwurf des
 * Probelaufs hat ihn NICHT geprueft: Er testete eine Verneinung, die das
 * gesuchte Wort gar nicht enthielt. Die Pruefung sah staerker aus, als sie
 * war, und der Schluessel haette eine Erklaerung, die das Gegenteil
 * verspricht, als Freigabe gelesen.
 */
p(!H.kampagneSpeicherbar("Wir speichern keine Kampagnendaten."),
  "eine VERNEINUNG oeffnet nichts", "sonst waere „keine Kampagnendaten“ eine Freigabe")
p(!H.kampagneSpeicherbar("Eine Auswertung der Kampagne findet nicht statt — wir erheben keine Kampagne."),
  "auch mehrfach verneint bleibt sie zu")
p(!H.kampagneSpeicherbar("Ohne Werbeträger-Erfassung."), "und „ohne“ zaehlt auch als Verneinung")
p(H.kampagneSpeicherbar("Wir setzen keine Werbe-Cookies. Gespeichert wird die Kampagne, über die Sie kamen."),
  "eine Verneinung im NACHBARSATZ schliesst die spaetere Nennung nicht aus",
  "sonst haette ein „kein Tracking“ weiter oben jede Erklaerung entwertet")

console.log("\nH3 · Die Tuer leert, sie lehnt nicht ab")
const felder = { source: "google", medium: "cpc", campaign: "handwerk", term: "", content: "" }
const zu = H.durchDieTuer(felder, false)
p(Object.values(zu.felder).every((v) => v === ""), "geschlossen: alle Felder leer")
p(zu.verworfen.length === 3, "und es sagt, was verworfen wurde", zu.verworfen.join(", "))
const auf = H.durchDieTuer(felder, true)
p(auf.felder.source === "google", "offen: die Felder gehen durch")
p(auf.verworfen.length === 0, "und nichts wird verworfen")

console.log("\nH4 · Die echte Erklaerung, gegen das echte Verhalten")
const text = H.datenschutzText(D.dictionary.de.legal)
p(text.length > 500, "die Erklaerung wird gelesen", `${text.length} Zeichen`)
p(/Name, Betrieb, E-Mail, Telefon/.test(text), "sie nennt die heutigen Kategorien")
p(!H.kampagneSpeicherbar(text), "und die Kampagnenherkunft ist NICHT darunter",
  "deshalb faellt sie heute an der Tuer")

console.log("\nV1 · Eine Liste, aus der nichts folgt, ist Freitext mit Kaesten")
p(V.lehrenVollstaendig(), "jeder Grund der Auswahlliste traegt eine Lehre")
p(V.VERLUST_LEHREN.length === P.LOST_REASONS.length, "genau so viele wie die Liste, keine zweite Wahrheit")
p(V.VERLUST_LEHREN.every((l) => P.LOST_REASONS.includes(l.grund)),
  "und jede Bezeichnung ist WOERTLICH die aus dem Playbook",
  "sonst waeren gespeicherte Zeilen ploetzlich unbekannt")

console.log("\nV2 · Freitext reist nicht zurueck")
p(V.fehltAmVerlust(null).length === 1, "kein Grund ist ein Befund")
p(V.fehltAmVerlust("").length === 1, "leerer Grund auch")
p(V.fehltAmVerlust("war denen zu teuer glaub ich").length === 1, "ein Satz ist kein Grund")
p(V.fehltAmVerlust("Kein Bedarf").length === 0, "ein Eintrag aus dem Verzeichnis schon")

console.log("\nV3 · Ein Fall ist ein Zufall")
const einmal = V.marktRueckmeldung(["Kein Bedarf"])
p(einmal.rueckmeldungen[0].anzahl === 1, "einmal gezaehlt")
p(!einmal.rueckmeldungen[0].muster, "aber kein Muster")
p(V.unterDruck(einmal).length === 0, "und damit steht keine Annahme unter Druck")

const zweimal = V.marktRueckmeldung(["Kein Bedarf", "Kein Bedarf"])
p(!zweimal.rueckmeldungen[0].muster, "zweimal ist eine Beobachtung")
p(V.unterDruck(zweimal).length === 0, "auch das dreht nichts")

const dreimal = V.marktRueckmeldung(["Kein Bedarf", "Kein Bedarf", "Kein Bedarf"])
p(dreimal.rueckmeldungen[0].muster, `ab ${V.MUSTER_AB} ist es ein Muster`)
p(V.unterDruck(dreimal).length > 0, "und dann steht etwas unter Druck")

console.log("\nV4 · Die Schleife endet im Hypothesen-Register aus G09")
const druck = V.unterDruck(dreimal)
p(druck.every((d) => M.HYPOTHESES.some((h) => h.key === d.hypothese.key)),
  "jede beruehrte Annahme steht wirklich im Register")
p(druck.some((d) => d.hypothese.key === "handwerk"),
  "dreimal „kein Bedarf“ beruehrt die Handwerk-Annahme")
p(druck.every((d) => d.hypothese.status !== "widerlegt"),
  "eine bereits widerlegte Annahme wird nicht noch einmal widerlegt")
p(druck.every((d) => d.hypothese.pruefen.length > 10),
  "und jede sagt, was sie entscheidet — der Mensch bekommt einen Satz, keine Zahl")

console.log("\nV5 · Gruende, die ueber den Markt nichts sagen, sagen nichts")
const stumm = V.marktRueckmeldung(["Zeitpunkt passt nicht", "Zeitpunkt passt nicht", "Zeitpunkt passt nicht"])
p(stumm.rueckmeldungen[0].muster, "auch das ist ein Muster")
p(V.unterDruck(stumm).length === 0, "aber es dreht kein Zielbild",
  "ein „nicht jetzt“ ist kein Nein")
const still = V.marktRueckmeldung(["Keine Rückmeldung", "Keine Rückmeldung", "Keine Rückmeldung"])
p(V.unterDruck(still).length === 0, "und Verstummen sagt mehr ueber unser Nachfassen als ueber den Markt")

console.log("\nV6 · Altbestand wird gezaehlt, nicht zugeordnet")
const gemischt = V.marktRueckmeldung(["Kein Bedarf", "war zu teuer", null, "Kein Bedarf", ""])
p(gemischt.ohneVerzeichnis === 1, "ein Freitext gilt als Altbestand")
p(gemischt.ohneGrund === 2, "zwei ohne Grund")
p(gemischt.rueckmeldungen.reduce((n, r) => n + r.anzahl, 0) === 2, "und nur zwei zaehlen mit")
p(!gemischt.rueckmeldungen.some((r) => r.lehre.grund === "war zu teuer"),
  "der Freitext bekommt KEINE Kategorie",
  "einen Grund nachtraeglich zu erfinden ist schlimmer, als keinen zu haben")

console.log("\nV7 · Der eine Grund, der zwei Lehren traegt, sagt es selbst")
const andere = V.lehreZu("Andere Lösung gewählt")
p(andere !== null, "„Andere Lösung gewählt“ steht im Verzeichnis")
p(/Wettbewerb/.test(andere.lehrt) && /Eigenbau/.test(andere.lehrt),
  "und nennt beide Lesarten, statt eine zu waehlen")

console.log("\nV8 · „Sonstiges“ lehrt ueber die Liste, nicht ueber den Markt")
const sonst = V.lehreZu("Sonstiges")
p(sonst.beruehrt.length === 0, "es beruehrt keine Annahme")
p(/Kategorie/.test(sonst.lehrt), "aber es sagt, was eine Haeufung bedeutet")

console.log(`\n  ${fehler === 0 ? "Was gespeichert wird, steht auf der Seite. Was verloren geht, wird gelernt." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
