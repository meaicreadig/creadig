/*
 * ===========================================================================
 * WIRTSCHAFTLICHKEITS-PROBELAUF — DIE RECHNUNG WIRD NACHGERECHNET
 * ===========================================================================
 *
 * Ein Rechner, der oeffentlich eine Zahl zeigt, muss sie halten koennen.
 * Dieser Lauf rechnet jeden Fall von Hand nach und vergleicht — inklusive
 * der Faelle, in denen das richtige Ergebnis KEINE Zahl ist.
 *
 * Besonders geprueft werden die drei Stellen, an denen ein Rechner
 * gewoehnlich luegt:
 *   - Mehraufwand, der als Null erscheint statt als Minus
 *   - Amortisation, die aus einer Division durch null entsteht
 *   - Dezimaltrennzeichen, die still verschluckt werden
 */
import { berechneAufwand, eingabeVollstaendig, zahlAusEingabe } from "@/lib/wirtschaftlichkeit"

let fehler = 0
let geprueft = 0

function pruefe(name, ist, soll) {
  geprueft++
  const gleich =
    typeof soll === "number" && typeof ist === "number"
      ? Math.abs(ist - soll) < 1e-9
      : ist === soll
  if (!gleich) {
    fehler++
    console.error(`  FEHL  ${name}\n        erwartet ${JSON.stringify(soll)}, bekommen ${JSON.stringify(ist)}`)
  }
}

function eingabe(v, h, n, s, i = null) {
  return {
    vorgaengeProMonat: v,
    minutenHeute: h,
    minutenNachher: n,
    stundensatz: s,
    investition: i,
  }
}

/* --- FALL 1 · der Normalfall aus der Dokumentation --------------------------
 * 100 Vorgaenge, 10 Minuten heute, 5 Minuten nachher, 30 EUR/h.
 * 100 × 5 = 500 Minuten = 8,333… Stunden × 30 = genau 250 EUR.          */
{
  const r = berechneAufwand(eingabe(100, 10, 5, 30))
  pruefe("F1 Stunden heute", r.stundenHeute, 100 / 6)
  pruefe("F1 Stunden nachher", r.stundenNachher, 100 / 12)
  pruefe("F1 Differenz Stunden", r.differenzStunden, 500 / 60)
  pruefe("F1 Differenz Euro", r.differenzEuro, 250)
  pruefe("F1 Richtung", r.richtung, "ersparnis")
  pruefe("F1 Amortisation ohne Investition", r.amortisationMonate, null)
}

/* --- FALL 2 · keine Ersparnis: gleicher Aufwand vorher wie nachher --------- */
{
  const r = berechneAufwand(eingabe(100, 10, 10, 30))
  pruefe("F2 Differenz Stunden", r.differenzStunden, 0)
  pruefe("F2 Differenz Euro", r.differenzEuro, 0)
  pruefe("F2 Richtung", r.richtung, "neutral")
  pruefe("F2 Amortisation", r.amortisationMonate, null)
}

/* --- FALL 3 · Mehraufwand -------------------------------------------------
 * Der wichtigste Fall. Wer 15 Minuten Restaufwand eingibt, wo heute 10
 * stehen, muss ein MINUS sehen — nicht eine auf null geklemmte Ersparnis.  */
{
  const r = berechneAufwand(eingabe(100, 10, 15, 30))
  pruefe("F3 Differenz Stunden ist negativ", r.differenzStunden, -500 / 60)
  pruefe("F3 Differenz Euro ist negativ", r.differenzEuro, -250)
  pruefe("F3 Richtung", r.richtung, "mehraufwand")
  pruefe("F3 keine Amortisation bei Mehraufwand", r.amortisationMonate, null)
}

/* --- FALL 4 · Investition und Amortisation -------------------------------
 * 250 EUR Monatseffekt, 3.000 EUR Investition → genau 12 Monate.          */
{
  const r = berechneAufwand(eingabe(100, 10, 5, 30, 3000))
  pruefe("F4 Differenz Euro", r.differenzEuro, 250)
  pruefe("F4 Amortisation Monate", r.amortisationMonate, 12)
  /* Gegenprobe: 3.000 EUR in zwoelf Monaten bei 30 EUR/h = 8,333… h/Monat. */
  pruefe("F4 Stunden fuer zwoelf Monate", r.stundenFuerZwoelfMonate, 3000 / 360)
}

/* --- FALL 5 · null Vorgaenge ---------------------------------------------
 * Unvollstaendig, kein Ergebnis. Nicht „0 EUR gespart".                    */
{
  pruefe("F5 kein Ergebnis", berechneAufwand(eingabe(0, 10, 5, 30)), null)
  pruefe("F5 unvollstaendig", eingabeVollstaendig(eingabe(0, 10, 5, 30)), false)
}

/* --- FALL 6 · ungueltige und negative Eingaben ---------------------------- */
{
  pruefe("F6 negativ", berechneAufwand(eingabe(-5, 10, 5, 30)), null)
  pruefe("F6 NaN", berechneAufwand(eingabe(Number.NaN, 10, 5, 30)), null)
  pruefe("F6 Infinity", berechneAufwand(eingabe(Number.POSITIVE_INFINITY, 10, 5, 30)), null)
  pruefe("F6 null", berechneAufwand(eingabe(null, 10, 5, 30)), null)
  pruefe("F6 Stundensatz 0", berechneAufwand(eingabe(100, 10, 5, 0)), null)
  /* Restaufwand DARF null sein — ein Schritt kann ganz entfallen. */
  const r = berechneAufwand(eingabe(100, 10, 0, 30))
  pruefe("F6 Restaufwand null erlaubt", r.differenzEuro, 500)
}

/* --- FALL 7 · Dezimaltrennzeichen und Tausender --------------------------- */
{
  pruefe("F7 deutsch 37,5", zahlAusEingabe("37,5"), 37.5)
  pruefe("F7 englisch 37.5", zahlAusEingabe("37.5"), 37.5)
  pruefe("F7 deutsch mit Tausender 1.250,50", zahlAusEingabe("1.250,50"), 1250.5)
  pruefe("F7 englisch mit Tausender 1,250.50", zahlAusEingabe("1,250.50"), 1250.5)
  pruefe("F7 Tausender ohne Dezimal 1.250", zahlAusEingabe("1.250"), 1250)
  pruefe("F7 Tausender ohne Dezimal 1,250", zahlAusEingabe("1,250"), 1250)
  pruefe("F7 glatt", zahlAusEingabe("12"), 12)
  pruefe("F7 leer", zahlAusEingabe("   "), null)
  pruefe("F7 Buchstaben", zahlAusEingabe("viel"), null)
  pruefe("F7 Minus", zahlAusEingabe("-5"), null)
  pruefe("F7 arabische Ziffern", zahlAusEingabe("٣٧٫٥"), 37.5)
  pruefe("F7 Leerzeichen als Tausender", zahlAusEingabe("1 250"), 1250)
}

/* --- FALL 8 · grosse Werte, keine Ueberlaeufe ------------------------------ */
{
  const r = berechneAufwand(eingabe(100000, 600, 60, 120, 1000000))
  pruefe("F8 Stunden heute", r.stundenHeute, 1000000)
  pruefe("F8 Differenz Euro", r.differenzEuro, 900000 * 120)
  pruefe("F8 Amortisation unter einem Monat", r.amortisationMonate, 1000000 / (900000 * 120))
  pruefe("F8 endlich", Number.isFinite(r.amortisationMonate), true)
}

/* --- FALL 9 · sehr kleine Ersparnis ---------------------------------------
 * Eine Minute bei einem Vorgang im Monat ist eine Ersparnis, keine Null.   */
{
  const r = berechneAufwand(eingabe(1, 2, 1, 60))
  pruefe("F9 Richtung", r.richtung, "ersparnis")
  pruefe("F9 Euro", r.differenzEuro, 1)
}

/* --- FALL 10 · Investition ohne positiven Effekt --------------------------- */
{
  const r = berechneAufwand(eingabe(100, 10, 10, 30, 5000))
  pruefe("F10 keine Amortisation", r.amortisationMonate, null)
  /* Die Gegenprobe bleibt trotzdem beantwortbar — sie haengt nicht am Effekt. */
  pruefe("F10 Gegenprobe bleibt", r.stundenFuerZwoelfMonate, 5000 / 360)
}

console.log(`\nWirtschaftlichkeits-Probelauf — ${geprueft} Pruefungen`)
if (fehler > 0) {
  console.error(`FEHL — ${fehler} Abweichung(en). Eine Zahl auf der Seite muss halten, was sie sagt.\n`)
  process.exit(1)
}
console.log("OK — jede Zahl nachgerechnet, jeder Sonderfall ohne Zahl geprueft.\n")
