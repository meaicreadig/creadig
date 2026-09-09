/**
 * G21 · BETRIEB & SUPPORT — die 149-€-Grenze in der Praxis.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE ZUSAGEN STEHEN SCHON — UND SIE SIND ERSTAUNLICH KONKRET
 *
 * Wie bei G19 erfindet dieses Gate keinen Prozess. `retainer.includes` nennt
 * fuenf Dinge, die fuer 149 € im Monat gelten, und zwei davon sind harte,
 * messbare Groessen:
 *
 *   „Bis zu 2 INHALTSAENDERUNGEN IM MONAT"   ein Kontingent
 *   „RUECKRUF AM NAECHSTEN WERKTAG"           eine Frist
 *
 * Die anderen drei laufen mit: Hosting und Sicherheitsupdates, das
 * Google-Profil, der Barrierefreiheits-Lauf.
 *
 * Gebaut war davon nichts. Es gab keinen Vorfall, keine Serviceanfrage,
 * kein Kontingent und keine Frist — die Zusagen standen auf der Seite und
 * wirkten nirgends.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE TRENNUNG, OHNE DIE DAS KONTINGENT UNGERECHT WIRD
 *
 * Eine STOERUNG ist keine Inhaltsaenderung. Wenn die Seite nicht erreichbar
 * ist, faellt das unter „Hosting und Sicherheitsupdates" — und das laeuft
 * mit, ohne Zaehler.
 *
 * Wuerde beides in denselben Topf fallen, haette ein Kunde nach zwei
 * Ausfaellen sein Monatskontingent aufgebraucht und muesste fuer die
 * Behebung eines Fehlers zahlen, den er nicht verursacht hat. Das waere
 * nicht nur unfair, es waere ein Bruch der Zusage.
 *
 * Deshalb drei Arten, nicht eine — jede mit ihrer eigenen Uhr.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * UND DIE GRENZE MUSS VORHER SICHTBAR SEIN
 *
 * Die dritte Inhaltsaenderung im Monat liegt AUSSERHALB der 149 €. Das ist
 * kein Problem — es ist der vereinbarte Umfang. Ein Problem wird es erst,
 * wenn es niemand sagt, bevor die Arbeit gemacht ist: Dann steht der Kunde
 * vor einer Rechnung, mit der er nicht gerechnet hat, und die 149 € haben
 * ihren Zweck verfehlt.
 *
 * `ausserhalb()` beantwortet die Frage VOR der Arbeit. Was danach damit
 * geschieht — Kulanz oder Angebot —, entscheidet ein Mensch.
 */

import { retainer } from "@/lib/site-data"

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · DER LEISTUNGSUMFANG
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Was fuer 149 € gilt — WOERTLICH aus `retainer.includes.de`.
 *
 * Die Reihenfolge ist die der oeffentlichen Liste. `check-betrieb.mjs` haelt
 * beide gegeneinander: Wer den Satz auf der Seite aendert, ohne diese Liste
 * mitzuaendern, verspricht etwas, das kein Vorgang kennt — oder umgekehrt.
 */
export const UMFANG = [
  { key: "hosting", zusage: "Hosting und Sicherheitsupdates", art: "laufend" },
  { key: "inhalt", zusage: "Bis zu 2 Inhaltsänderungen im Monat", art: "kontingent" },
  { key: "profil", zusage: "Google-Unternehmensprofil aktuell halten", art: "laufend" },
  {
    key: "barrierefreiheit",
    zusage: "Barrierefreiheits-Lauf bei jeder Änderung, einmal im Jahr von Hand",
    art: "laufend",
  },
  { key: "rueckruf", zusage: "Rückruf am nächsten Werktag", art: "frist" },
] as const

export type UmfangArt = (typeof UMFANG)[number]["art"]

/**
 * Das Kontingent, in Zahlen.
 *
 * Die Zwei steht im oeffentlichen Satz. Sie hier zu wiederholen ist eine
 * zweite Fassung — deshalb prueft das Gate, dass die Zahl im Satz auch
 * wirklich diese ist. Aus dem Satz zu PARSEN waere die schlechtere Loesung:
 * Eine Formulierungsaenderung wuerde dann stillschweigend das Kontingent
 * aendern.
 */
export const INHALT_JE_MONAT = 2

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DIE DREI ARTEN
 * ═══════════════════════════════════════════════════════════════════════════ */

export const ANLIEGEN_ARTEN = {
  stoerung: {
    label: "Störung",
    was: "Etwas funktioniert nicht mehr, das funktioniert hat.",
    /** Zaehlt NICHT gegen das Kontingent — sie faellt unter Hosting und Sicherheit. */
    gegenKontingent: false,
    deckt: "hosting",
  },
  inhaltsaenderung: {
    label: "Inhaltsänderung",
    was: "Ein Text, ein Bild, eine Angabe soll anders sein.",
    gegenKontingent: true,
    deckt: "inhalt",
  },
  wartung: {
    label: "Wartung",
    was: "Was von selbst faellig wird — Updates, der Barrierefreiheits-Lauf, das Profil.",
    gegenKontingent: false,
    deckt: "hosting",
  },
} as const

export type AnliegenArt = keyof typeof ANLIEGEN_ARTEN

export type Anliegen = {
  id: string
  art: AnliegenArt
  /** Was der Kunde gesagt hat, in seinen Worten. */
  was: string
  /** Wann es hereinkam — ISO-Zeitpunkt. */
  eingegangen: string
  /** Wann zurueckgerufen wurde. `null` = noch nicht. */
  beantwortet: string | null
  /** Wann es erledigt war. `null` = offen. */
  erledigt: string | null
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DIE FRIST — „am naechsten Werktag"
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Der naechste Werktag nach einem Zeitpunkt.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * WAS HIER BEWUSST NICHT MODELLIERT IST: FEIERTAGE.
 *
 * Sie sind in Deutschland LAENDERSACHE — Fronleichnam ist in Bayern frei und
 * in Niedersachsen nicht. Ein Kalender im Code waere fuer den Sitz richtig
 * und fuer den naechsten Kunden falsch, und ein falscher Feiertag ist eine
 * gebrochene Zusage mit gutem Gewissen.
 *
 * Gerechnet wird deshalb nur ueber das Wochenende. Faellt die Frist auf
 * einen Feiertag, ist sie zu frueh angesetzt — und das ist die richtige
 * Richtung: Der Fehler faellt zu Lasten des Hauses, nicht des Kunden.
 */
export function naechsterWerktag(zeitpunkt: string): string | null {
  const d = new Date(zeitpunkt)
  if (Number.isNaN(d.getTime())) return null
  do {
    d.setUTCDate(d.getUTCDate() + 1)
  } while (d.getUTCDay() === 0 || d.getUTCDay() === 6)
  return d.toISOString().slice(0, 10)
}

/** Bis wann zurueckgerufen sein muss. */
export function rueckrufFrist(a: Anliegen): string | null {
  return naechsterWerktag(a.eingegangen)
}

/**
 * Ist die Rueckruf-Frist verstrichen, ohne dass jemand geantwortet hat?
 *
 * Beantwortet heisst beantwortet — nicht erledigt. Die Zusage lautet
 * „Rueckruf am naechsten Werktag", nicht „Loesung am naechsten Werktag".
 * Wer beides vermischt, meldet eine gebrochene Zusage, wo eine gehalten
 * wurde.
 */
export function rueckrufOffen(a: Anliegen, heute = new Date()): boolean {
  if (a.beantwortet) return false
  const frist = rueckrufFrist(a)
  if (!frist) return false
  return heute.toISOString().slice(0, 10) > frist
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · DAS KONTINGENT
 * ═══════════════════════════════════════════════════════════════════════════ */

/** `2026-09` aus einem Zeitpunkt. */
export function monatVon(zeitpunkt: string): string {
  return zeitpunkt.slice(0, 7)
}

export type Kontingentstand = {
  monat: string
  verbraucht: number
  frei: number
  /** Die naechste Inhaltsaenderung liegt ausserhalb. */
  erschoepft: boolean
}

/**
 * Wie viel vom Monatskontingent verbraucht ist.
 *
 * Gezaehlt werden ausschliesslich Inhaltsaenderungen. Eine Stoerung zaehlt
 * nicht — sonst haette ein Kunde nach zwei Ausfaellen sein Kontingent
 * aufgebraucht und muesste fuer die Behebung eines Fehlers zahlen, den er
 * nicht verursacht hat.
 */
export function kontingentstand(
  anliegen: readonly Anliegen[],
  monat: string,
): Kontingentstand {
  const verbraucht = anliegen.filter(
    (a) => ANLIEGEN_ARTEN[a.art]?.gegenKontingent && monatVon(a.eingegangen) === monat,
  ).length
  const frei = Math.max(0, INHALT_JE_MONAT - verbraucht)
  return { monat, verbraucht, frei, erschoepft: frei === 0 }
}

/**
 * Liegt DIESES Anliegen ausserhalb der 149 €?
 *
 * Die Frage wird VOR der Arbeit gestellt. Danach waere sie eine Rechnung,
 * mit der niemand gerechnet hat — und dann haben die 149 € ihren Zweck
 * verfehlt.
 */
export function ausserhalb(anliegen: Anliegen, bestand: readonly Anliegen[]): boolean {
  if (!ANLIEGEN_ARTEN[anliegen.art]?.gegenKontingent) return false
  const monat = monatVon(anliegen.eingegangen)
  const vorher = bestand.filter(
    (a) =>
      a.id !== anliegen.id &&
      ANLIEGEN_ARTEN[a.art]?.gegenKontingent &&
      monatVon(a.eingegangen) === monat &&
      a.eingegangen <= anliegen.eingegangen,
  ).length
  return vorher >= INHALT_JE_MONAT
}

/** Der Satz, den ein Mensch dem Kunden sagt — vor der Arbeit. */
export function grenzsatz(stand: Kontingentstand): string {
  if (!stand.erschoepft) {
    return (
      `${stand.verbraucht} von ${INHALT_JE_MONAT} Inhaltsänderungen in ${stand.monat} verbraucht. ` +
      `Diese hier ist gedeckt.`
    )
  }
  return (
    `${stand.verbraucht} von ${INHALT_JE_MONAT} Inhaltsänderungen in ${stand.monat} verbraucht. ` +
    `Diese hier liegt außerhalb der 149 € — das ist der vereinbarte Umfang, kein Streitfall. ` +
    `Ob sie als Kulanz mitläuft oder ein eigenes Angebot bekommt, entscheidet ein Mensch, ` +
    `und zwar bevor gearbeitet wird.`
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 5 · WAS EINEM ANLIEGEN FEHLT
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Fehlt = { feld: string; satz: string }

export function fehltAmAnliegen(a: Anliegen): Fehlt[] {
  const f: Fehlt[] = []
  if (!ANLIEGEN_ARTEN[a.art]) {
    f.push({ feld: "Art", satz: `„${a.art}" ist keine bekannte Art. Ohne Art gilt keine Uhr und kein Kontingent.` })
  }
  if ((a.was?.trim().length ?? 0) < 5) {
    f.push({ feld: "Anliegen", satz: "Kein Anliegen im Klartext. In den Worten des Kunden, nicht in unseren." })
  }
  if (Number.isNaN(new Date(a.eingegangen).getTime())) {
    f.push({ feld: "Eingang", satz: "Kein Eingangszeitpunkt — ohne ihn laeuft keine Frist." })
  }
  if (a.erledigt && !a.beantwortet) {
    f.push({
      feld: "Rückruf",
      satz:
        "Erledigt, aber nie beantwortet. Die Zusage ist der Rueckruf am naechsten Werktag — " +
        "eine stille Erledigung haelt sie nicht.",
    })
  }
  return f
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 6 · DIE LAGE
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Gibt es den Betrieb ueberhaupt als Angebot? `null` = der Block erscheint nicht. */
export function betriebAngeboten(): boolean {
  return typeof retainer.amount === "number" && retainer.amount > 0
}

export type Betriebslage = {
  offen: number
  ueberfaellig: Anliegen[]
  kontingent: Kontingentstand
}

export function lage(anliegen: readonly Anliegen[], monat: string, heute = new Date()): Betriebslage {
  return {
    offen: anliegen.filter((a) => !a.erledigt).length,
    ueberfaellig: anliegen.filter((a) => rueckrufOffen(a, heute)),
    kontingent: kontingentstand(anliegen, monat),
  }
}
