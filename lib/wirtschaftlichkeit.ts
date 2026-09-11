/*
 * ===========================================================================
 * WIRTSCHAFTLICHKEIT — DIE RECHNUNG, DIE DER KUNDE SELBST AUFSTELLT
 * ===========================================================================
 *
 * PHASE 3 · COMMERCIAL COMPLETION, 11.09.2026.
 *
 * -------------------------------------------------------------------------
 * WARUM DIESES MODUL EXISTIERT
 *
 * Die Website konnte bisher sagen, WO ein Betrieb doppelt arbeitet. Sie
 * konnte nicht sagen, WAS das kostet — und wer das nicht beziffern kann,
 * verkauft Systeme als Geschmacksfrage.
 *
 * Der naheliegende Ausweg waere eine Zahl gewesen: „Betriebe sparen im
 * Schnitt 30 %." Diese Zahl haette creaDIG nicht. Es gibt keine Reihe
 * abgeschlossener Systemprojekte, aus der sich ein Mittelwert ableiten
 * liesse, und ein erfundener Benchmark ist im ersten Gespraech entweder
 * peinlich oder bindend — dieselbe Regel, aus der `docs/sales/offer-canon.md`
 * §7 die Preisspanne verweigert.
 *
 * Deshalb rechnet dieses Modul NICHTS aus eigener Annahme. Jede Zahl, die
 * hineingeht, kommt vom Nutzer. Das Modul multipliziert sie und legt die
 * Formel offen. Es ist kein Versprechen, es ist ein Taschenrechner mit
 * sichtbarer Rechnung.
 *
 * -------------------------------------------------------------------------
 * DREI ENTSCHEIDUNGEN, DIE DAS MODELL EHRLICH HALTEN
 *
 * 1 · NUR ZEIT × HAEUFIGKEIT × INTERNER KOSTENSATZ.
 *     Keine Umsatzwirkung, keine Fehlerkosten, keine Opportunitaet. Nicht
 *     weil es die nicht gaebe, sondern weil sie ohne Messung geraten waeren
 *     — und ein Modell, das drei geratene Groessen multipliziert, liefert
 *     eine Zahl mit drei Stellen und null Aussage.
 *
 * 2 · MEHRAUFWAND WIRD NICHT AUF NULL GEKLEMMT.
 *     Wer einen hoeheren Restaufwand eingibt als heute, bekommt genau das zu
 *     sehen: ein Minus. Ein Rechner, der nur nach oben ausschlagen kann, ist
 *     eine Anzeige und kein Rechner.
 *
 * 3 · AMORTISATION NUR, WENN SIE EXISTIERT.
 *     Ohne positiven Monatseffekt gibt es keine Amortisationsdauer — nicht
 *     „unendlich", nicht „0", sondern `null`. Eine Division, die keinen Sinn
 *     ergibt, darf nicht als Zahl aus der Oberflaeche fallen.
 *
 * -------------------------------------------------------------------------
 * KEINE PERSISTENZ, KEINE UEBERTRAGUNG
 *
 * Dieses Modul ist eine reine Funktion. Es kennt keinen Speicher, keine
 * Schnittstelle und kein Ereignis. Was ein Besucher hier eintippt — wie oft
 * ein Vorgang vorkommt, was eine Stunde intern kostet — sind betriebliche
 * Angaben, und die haben in einer Datenbank, einer URL oder einer Messung
 * nichts zu suchen.
 */

/** Was der Nutzer eingibt. Alles in seinen Einheiten, nichts vorbelegt. */
export type AufwandEingabe = {
  /** Wie oft der Vorgang im Monat vorkommt. */
  vorgaengeProMonat: number | null
  /** Minuten, die der Vorgang heute kostet — pro Vorgang. */
  minutenHeute: number | null
  /** Minuten, die nach einer Veraenderung uebrig blieben — pro Vorgang. */
  minutenNachher: number | null
  /** Interner Vollkostensatz pro Stunde, in Euro. */
  stundensatz: number | null
  /** Optional: einmalige Projektinvestition in Euro. */
  investition: number | null
}

export type Richtung = "ersparnis" | "neutral" | "mehraufwand"

export type AufwandErgebnis = {
  /** Stunden pro Monat, die der Vorgang heute kostet. */
  stundenHeute: number
  /** Stunden pro Monat, die er nach der Veraenderung kostet. */
  stundenNachher: number
  /** Differenz in Stunden pro Monat. NEGATIV heisst Mehraufwand. */
  differenzStunden: number
  /** Differenz in Euro pro Monat. NEGATIV heisst Mehrkosten. */
  differenzEuro: number
  /** In welche Richtung die Rechnung ausschlaegt. */
  richtung: Richtung
  /**
   * Monate bis zur rechnerischen Amortisation.
   * `null`, wenn keine Investition angegeben ist oder der Monatseffekt nicht
   * positiv ist — dann gibt es keine Amortisation, auch keine unendliche.
   */
  amortisationMonate: number | null
  /**
   * Die Gegenprobe: Wie viele Stunden pro Monat muesste der Vorgang
   * einsparen, damit sich die angegebene Investition in zwoelf Monaten
   * rechnet? Beantwortet die kaufmaennisch nuetzlichere Frage — nicht „wie
   * viel spare ich", sondern „was muesste wahr sein, damit es aufgeht".
   * `null` ohne Investition oder ohne Stundensatz.
   */
  stundenFuerZwoelfMonate: number | null
}

/** Ohne diese vier Angaben wird nicht gerechnet — und nichts angezeigt. */
export function eingabeVollstaendig(e: AufwandEingabe): boolean {
  return (
    istZahl(e.vorgaengeProMonat) &&
    e.vorgaengeProMonat > 0 &&
    istZahl(e.minutenHeute) &&
    e.minutenHeute > 0 &&
    istZahl(e.minutenNachher) &&
    e.minutenNachher >= 0 &&
    istZahl(e.stundensatz) &&
    e.stundensatz > 0
  )
}

function istZahl(w: number | null): w is number {
  return typeof w === "number" && Number.isFinite(w) && w >= 0
}

/**
 * Die ganze Rechnung. Vier Multiplikationen und eine Division — mehr ist es
 * nicht, und mehr soll es nicht sein.
 *
 *   Stunden heute    = Vorgaenge × Minuten heute   ÷ 60
 *   Stunden nachher  = Vorgaenge × Minuten nachher ÷ 60
 *   Differenz        = Stunden heute − Stunden nachher
 *   Euro pro Monat   = Differenz × Stundensatz
 *   Amortisation     = Investition ÷ Euro pro Monat   (nur wenn > 0)
 *
 * Gibt `null` zurueck, solange die Eingabe unvollstaendig ist. Kein
 * Platzhalterergebnis, kein Beispielwert, keine Null, die wie ein Ergebnis
 * aussieht.
 */
export function berechneAufwand(e: AufwandEingabe): AufwandErgebnis | null {
  if (!eingabeVollstaendig(e)) return null

  const vorgaenge = e.vorgaengeProMonat as number
  const heute = e.minutenHeute as number
  const nachher = e.minutenNachher as number
  const satz = e.stundensatz as number

  const stundenHeute = (vorgaenge * heute) / 60
  const stundenNachher = (vorgaenge * nachher) / 60
  const differenzStunden = stundenHeute - stundenNachher
  const differenzEuro = differenzStunden * satz

  /*
   * Die Richtung wird an der Zeit festgemacht, nicht am Geld: Bei einem
   * Stundensatz, der auf null gerundet waere, bliebe die Zeitersparnis
   * trotzdem eine Ersparnis.
   */
  const richtung: Richtung =
    differenzStunden > 0 ? "ersparnis" : differenzStunden < 0 ? "mehraufwand" : "neutral"

  const investition = istZahl(e.investition) && e.investition > 0 ? e.investition : null

  /*
   * Amortisation nur bei tatsaechlich positivem Monatseffekt. Bei 0 oder
   * negativ waere das Ergebnis Infinity beziehungsweise eine negative
   * Monatszahl — beides waere eine Zahl, die etwas behauptet, das nicht
   * stimmt.
   */
  const amortisationMonate =
    investition !== null && differenzEuro > 0 ? investition / differenzEuro : null

  const stundenFuerZwoelfMonate = investition !== null ? investition / (12 * satz) : null

  return {
    stundenHeute,
    stundenNachher,
    differenzStunden,
    differenzEuro,
    richtung,
    amortisationMonate,
    stundenFuerZwoelfMonate,
  }
}

/*
 * ---------------------------------------------------------------------------
 * ZAHLEN AUS EINER EINGABE LESEN
 *
 * Ein deutscher Betrieb tippt „37,5", ein englischer „37.5", und beide meinen
 * dasselbe. Wer nur `parseFloat` nimmt, macht aus „37,5" eine 37 und
 * verrechnet sich um ein halbes Prozent — leise, ohne Fehlermeldung.
 *
 * Regel: Das LETZTE Trennzeichen ist das Dezimaltrennzeichen, alles davor ist
 * Tausendertrennung. Das behandelt „1.250,50", „1,250.50", „1250,5" und
 * „1250.5" richtig, ohne die Locale kennen zu muessen.
 */
export function zahlAusEingabe(text: string): number | null {
  const roh = text.trim()
  if (roh === "") return null

  /* Arabisch-indische Ziffern mitnehmen — die arabische Fassung tippt sie. */
  const latinisiert = roh
    .replace(/[٠-٩]/g, (z) => String(z.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (z) => String(z.charCodeAt(0) - 0x06f0))
    .replace(/[٫]/g, ",")
    .replace(/[٬  \s']/g, "")

  if (!/^[0-9.,]+$/.test(latinisiert)) return null

  const letztesKomma = latinisiert.lastIndexOf(",")
  const letzterPunkt = latinisiert.lastIndexOf(".")
  const trenner = Math.max(letztesKomma, letzterPunkt)

  let normalisiert: string
  if (trenner === -1) {
    normalisiert = latinisiert
  } else {
    const vor = latinisiert.slice(0, trenner).replace(/[.,]/g, "")
    const nach = latinisiert.slice(trenner + 1)
    /*
     * Drei Stellen nach dem letzten Trenner und kein zweiter Trenner davor:
     * „1.250" ist tausendzweihundertfuenfzig, nicht eins Komma zwei fuenf.
     */
    if (nach.length === 3 && !/[.,]/.test(latinisiert.slice(0, trenner))) {
      normalisiert = vor + nach
    } else {
      normalisiert = nach === "" ? vor : `${vor}.${nach}`
    }
  }

  const wert = Number(normalisiert)
  if (!Number.isFinite(wert) || wert < 0) return null
  return wert
}
