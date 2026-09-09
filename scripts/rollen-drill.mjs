#!/usr/bin/env node
/**
 * DER ROLLEN-PROBELAUF — GATE 32
 *
 * Das hier ist ein SICHERHEITS-Probelauf, und er wird entsprechend gefahren:
 * Er prueft nicht, ob die erlaubten Wege funktionieren, sondern ob die
 * verbotenen wirklich verschlossen sind.
 *
 * Die Werte fuer Passwort und Signaturgeheimnis werden hier im Prozess
 * gesetzt und sind Probewerte. Es wird kein echtes Geheimnis gelesen,
 * ausgegeben oder gebraucht.
 */
process.env.ADMIN_SESSION_SECRET = "probe-signatur-geheimnis-nur-fuer-diesen-lauf"
process.env.ADMIN_PASSWORD = "probe-owner"
process.env.ADMIN_PASSWORD_VERTRIEB = "probe-vertrieb"
delete process.env.ADMIN_PASSWORD_REDAKTION

const R = await import("../lib/rollen.ts")
const S = await import("../lib/admin-session.ts")

let fehler = 0
const p = (ok, n, d = "") => { if (!ok) fehler++; console.log(`  ${ok ? "ok  " : "FEHL"} ${n}${d ? ` — ${d}` : ""}`) }

console.log("\nR1 · Verbot ist die Voreinstellung")
p(!R.darfBetreten("owner", "/admin/gibt-es-nicht"), "eine unbekannte Flaeche ist gesperrt — auch fuer den Owner")
p(!R.darfBetreten("owner", "/admin/vertrieb/pipeline/x/y"), "und ein zu tiefer Pfad ebenso")
p(!R.darfBetreten("owner", "/etc/passwd"), "etwas ausserhalb erst recht")
p(!R.darfBetreten("owner", ""), "ein leerer Pfad auch")
p(R.darfBetreten("owner", "/admin/vertrieb/pipeline"), "eine eingetragene Flaeche geht")

console.log("\nR2 · Eine unbekannte Rolle kommt nirgendwo hin")
for (const falsch of ["administrator", "OWNER", "", null, undefined, 0, {}, ["owner"]]) {
  p(!R.darfBetreten(falsch, "/admin"), `„${String(falsch)}" ist keine Rolle`)
}

console.log("\nR3 · Die Trennung, um die es dem Gate geht")
p(!R.darfBetreten("redaktion", "/admin/vertrieb/pipeline"), "Redaktion sieht die Pipeline NICHT")
p(!R.darfBetreten("redaktion", "/admin/kunden"), "und keine Kundenakte")
p(!R.darfBetreten("redaktion", "/admin/kunden/abc123"), "auch keine einzelne")
p(!R.darfBetreten("redaktion", "/admin/vertrieb/verlust"), "und keine Verlustgruende")
p(R.darfBetreten("redaktion", "/admin/material"), "den Materialstand schon")
p(!R.darfBetreten("vertrieb", "/admin/material"), "Vertrieb sieht den Materialstand NICHT")
p(R.darfBetreten("vertrieb", "/admin/kunden/abc123"), "die Kundenakte schon")

console.log("\nR4 · Jede Flaeche mit Personendaten ist eng vergeben")
const eng = R.FLAECHEN.filter((f) => R.KLASSEN[f.klasse].eng)
p(eng.length === 12, `${eng.length} Flaechen tragen Personendaten Dritter`)
p(eng.every((f) => !f.fuer.includes("redaktion")), "keine davon fuer die Redaktion")
p(eng.every((f) => f.fuer.includes("owner")), "alle fuer den Owner")

console.log("\nR5 · Die Sitzung traegt die Rolle — und sie ist mitsigniert")
const token = await S.issueSession("vertrieb")
p(typeof token === "string" && token.split(".").length === 3, "drei Felder: Rolle, Ablauf, Signatur")
const echt = await S.verifySession(token)
p(echt.verdict === "ok" && echt.rolle === "vertrieb", "die Rolle kommt zurueck")

console.log("\nR6 · Der Angriff, gegen den die Signatur ueber der Rolle liegt")
const [, ablauf, sig] = token.split(".")
const gefaelscht = `owner.${ablauf}.${sig}`
const versuch = await S.verifySession(gefaelscht)
p(versuch.verdict === "invalid", "Rolle auf `owner` umgeschrieben: ungueltig",
  "laege die Rolle neben der Signatur, waere das die Uebernahme")
p(versuch.rolle === null, "und es kommt keine Rolle zurueck")

console.log("\nR7 · Weitere Faelschungen")
const faelle = [
  ["vertrieb.<ablauf>.falsch", `vertrieb.${ablauf}.${"a".repeat(sig.length)}`],
  ["altes Format ohne Rolle", `${ablauf}.${sig}`],
  ["Rolle, die es nicht gibt", `admin.${ablauf}.${sig}`],
  ["vier Felder", `vertrieb.${ablauf}.${sig}.x`],
  ["leer", ""],
  ["nur Punkte", "..."],
  ["sehr lang", "x".repeat(500)],
]
for (const [name, wert] of faelle) {
  const v = await S.verifySession(wert)
  p(v.verdict !== "ok", `${name}: abgewiesen`, v.verdict)
}

console.log("\nR8 · Abgelaufen ist nicht gueltig")
const alt = await S.issueSession("owner", Date.now() - 9 * 60 * 60 * 1000)
const abgelaufen = await S.verifySession(alt)
p(abgelaufen.verdict === "expired", "eine alte Sitzung laeuft ab")
p(abgelaufen.rolle === null, "und gibt keine Rolle mehr her",
  "sonst haette ein abgelaufenes Cookie noch eine Identitaet")

console.log("\nR9 · Das Passwort entscheidet die Rolle, nicht der Client")
p(S.rolleFuerPasswort("probe-owner") === "owner", "das Owner-Passwort ergibt die Owner-Rolle")
p(S.rolleFuerPasswort("probe-vertrieb") === "vertrieb", "das Vertriebs-Passwort die Vertriebsrolle")
p(S.rolleFuerPasswort("probe-redaktion") === null, "eine nicht vergebene Rolle ergibt nichts")
p(S.rolleFuerPasswort("") === null, "leer ergibt nichts")
p(S.rolleFuerPasswort(null) === null, "und `null` auch nicht")
p(S.rolleFuerPasswort("probe-owner ") === null, "ein Leerzeichen zu viel ist ein falsches Passwort")

console.log("\nR10 · Muster fangen nicht zu viel")
p(R.passt("/admin/kunden/:id", "/admin/kunden/abc"), ":id deckt ein Segment")
p(!R.passt("/admin/kunden/:id", "/admin/kunden"), "aber nicht null Segmente")
p(!R.passt("/admin/kunden/:id", "/admin/kunden/a/b"), "und nicht zwei")
p(!R.passt("/admin/kunden/:id", "/admin/anderes/abc"), "ein fester Teil muss stimmen")
p(R.flaecheZu("/admin/vertrieb/verlust")?.pfad === "/admin/vertrieb/verlust",
  "ein genauer Treffer schlaegt ein Muster")

console.log("\nR11 · Die Uebergabe faellt aus der Rolle, nicht aus dem Gedaechtnis")
const u = R.uebergabe("vertrieb")
p(u.length >= 3, `${u.length} Punkte fuer den Vertrieb`)
p(u.some((x) => /Personendaten/.test(x.was)), "darunter die Personendaten Dritter")
p(u.some((x) => /neu setzen/.test(x.wie)), "und der Zugang wird neu gesetzt, nicht geloescht")
p(R.uebergabe("redaktion").every((x) => !/Personendaten Dritter/.test(x.was)),
  "die Redaktion gibt keine Personendaten ab", "sie hatte nie welche")

console.log("\nR12 · Gebaut ist nicht dasselbe wie eingerichtet")
const lage = R.zweiterMensch({ ADMIN_PASSWORD: "x" })
p(lage.moeglich, "das System kann einen zweiten Menschen")
p(!lage.eingeschraenkteVergeben, "eingerichtet ist er damit nicht")
const lage2 = R.zweiterMensch({ ADMIN_PASSWORD: "x", ADMIN_PASSWORD_VERTRIEB: "y" })
p(lage2.eingeschraenkteVergeben, "erst mit einer gesetzten Variable")
p(R.vergebeneRollen({ ADMIN_PASSWORD_VERTRIEB: "" }).length === 0, "eine leere Variable ist keine Vergabe")

console.log("\nR13 · Wer nicht darf, landet nicht auf der Anmeldung")
p(R.ausweichZiel("redaktion") === "/admin", "die Redaktion landet auf der Uebersicht")
p(R.ausweichZiel("vertrieb") === "/admin", "der Vertrieb auch",
  "eine Anmeldemaske fuer jemanden, der angemeldet ist, laedt zum Passwortraten ein")

console.log(`\n  ${fehler === 0 ? "Ein zweiter Mensch kann arbeiten, ohne alles zu sehen." : `${fehler} Pruefung(en) fehlgeschlagen.`}\n`)
process.exit(fehler === 0 ? 0 : 1)
