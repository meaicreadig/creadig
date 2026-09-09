/**
 * G22 · KUNDENERFOLG & AUSBAU — und die Empfehlungs-Schleife zurueck nach G11.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DER VERTRAG NENNT DREI DINGE, UND EINES DAVON GIBT ES NICHT
 *
 *     „Kundengesundheit, Verlaengerung, Ausbau — und die
 *      Empfehlungs-Schleife zurueck nach G11. Der einzige Zugangsweg, der
 *      mit ‚keine Kaltakquise' vollstaendig vereinbar ist."
 *
 * Zwei davon sind gebaut worden. Das dritte — die VERLAENGERUNG — hat sich
 * beim Hinsehen aufgeloest, und das ist der interessanteste Befund dieses
 * Gates.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ES GIBT KEINE VERLAENGERUNG. DAS IST EINE ZUSAGE, KEINE LUECKE.
 *
 * Das FAQ sagt oeffentlich:
 *
 *     „Die laufende Betreuung fuer 149 € netto im Monat ist MONATLICH
 *      KUENDBAR, OHNE MINDESTLAUFZEIT."
 *
 * Damit gibt es keinen Verlaengerungstermin, den man verwalten koennte.
 * Einen einzubauen waere schlimmer als nutzlos: Ein „Vertrag laeuft aus am
 * …" widerspraeche der Zusage, und ein Erinnerungslauf darauf waere eine
 * Frist, die das Haus selbst erfunden hat.
 *
 * Was es STATTDESSEN gibt, ist eine Entscheidung, die der Kunde JEDEN Monat
 * still trifft. Sie wird nicht angekuendigt. Wer auf ein Datum wartet,
 * erfaehrt vom Ende, wenn es da ist.
 *
 * Deshalb beantwortet dieses Modul nicht „wann laeuft es aus", sondern
 * „woran wuerde man es vorher merken". Das ist die Kundengesundheit.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * GESUNDHEIT IST KEINE ZAHL
 *
 * Kein Score, keine Ampel, kein Prozentwert — dieselbe Doktrin wie bei der
 * Angebotsreife (G07/G08) und beim Zielbild (G09): Vier Achsen, jede
 * einzeln beantwortet, jede mit ihrem Grund im Klartext.
 *
 * Eine Gesundheit als Zahl laedt dazu ein, die ZAHL zu verbessern. Eine
 * offene Frage laedt dazu ein, den Betrieb anzurufen.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE EMPFEHLUNG WIRD ERBETEN, NICHT ERZEUGT
 *
 * `CONTACT_SOURCES` in G11 kennt „empfehlung" seit jeher: „ein Mensch hat
 * den Namen genannt." Der Weg hinein existiert. Was fehlte, war der Weg
 * DORTHIN — und vor allem die Frage, WANN man fragen darf.
 *
 * Dieses Modul erzeugt keinen Kontakt. Es sagt, ob der Moment traegt, und
 * uebergibt dann an G11, wo die Regeln fuer fremde Personendaten stehen.
 * Ein System, das aus einer Empfehlung selbst einen Kontakt macht, haette
 * die Pruefung uebersprungen, fuer die es G11 gibt.
 */

import { MUSTER_AB } from "@/lib/verlust"
import { ANLIEGEN_ARTEN, INHALT_JE_MONAT, kontingentstand, rueckrufOffen, type Anliegen } from "@/lib/betrieb"

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · DIE VIER ACHSEN
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Urteil = "gut" | "unklar" | "achtung"

export type Achse = {
  key: string
  label: string
  urteil: Urteil
  /** Warum — im Klartext. Wer widerspricht, widerspricht einem Satz. */
  grund: string
}

export type Gesundheitslage = {
  achsen: Achse[]
  /** Die Achsen, die Aufmerksamkeit verlangen. Keine Summe, keine Note. */
  achtung: Achse[]
  unklar: Achse[]
}

export type Kundenbild = {
  /** Anliegen aus dem Betrieb (G21). */
  anliegen: readonly Anliegen[]
  /** Offene Betraege in Cent (G18). `null` = nicht erhoben. */
  offeneForderungCent: number | null
  /** Wie viele Tage die aelteste offene Forderung ueberfaellig ist. */
  forderungUeberfaelligTage: number | null
  /** Letzter Kontakt — ISO-Tag. `null` = nie. */
  letzterKontakt: string | null
  /** Ist die Uebergabe vollstaendig (G19)? */
  uebergeben: boolean
}

/** Ab wann ein Schweigen auffaellt. */
export const STILLE_TAGE = 90

function tageSeit(tag: string | null, heute: Date): number | null {
  if (!tag) return null
  const d = new Date(`${tag}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return null
  return Math.floor((heute.getTime() - d.getTime()) / 86_400_000)
}

/**
 * Die Lage eines Kunden — vier Achsen, kein Gesamturteil.
 *
 * Die Achsen sind bewusst nicht gleichwertig und werden deshalb auch nicht
 * verrechnet: Eine ueberfaellige Forderung ist etwas anderes als drei
 * Monate Stille, und beides zusammen ist nicht „doppelt schlecht", sondern
 * zwei verschiedene Gespraeche.
 */
export function gesundheit(
  bild: Kundenbild,
  monat: string,
  heute = new Date(),
): Gesundheitslage {
  const achsen: Achse[] = []

  /* ── Betrieb: haelt das Haus seine eigene Zusage? ─────────────────────── */
  const ueberfaellig = bild.anliegen.filter((a) => rueckrufOffen(a, heute))
  const offeneStoerungen = bild.anliegen.filter(
    (a) => a.art === "stoerung" && !a.erledigt,
  )
  achsen.push({
    key: "betrieb",
    label: "Betrieb",
    urteil: ueberfaellig.length > 0 ? "achtung" : offeneStoerungen.length > 0 ? "unklar" : "gut",
    grund:
      ueberfaellig.length > 0
        ? `${ueberfaellig.length} Anliegen ohne Rueckruf innerhalb der zugesagten Frist. ` +
          "Das ist die eigene Zusage, nicht die Laune des Kunden."
        : offeneStoerungen.length > 0
          ? `${offeneStoerungen.length} offene Stoerung(en) — beantwortet, aber nicht behoben.`
          : "Keine offene Stoerung, kein verpasster Rueckruf.",
  })

  /* ── Geld: ohne Erhebung kein Urteil ──────────────────────────────────── */
  if (bild.offeneForderungCent === null) {
    achsen.push({
      key: "geld",
      label: "Geld",
      urteil: "unklar",
      grund: "Keine Forderungslage erhoben. Unbekannt ist nicht dasselbe wie null.",
    })
  } else {
    const tage = bild.forderungUeberfaelligTage ?? 0
    achsen.push({
      key: "geld",
      label: "Geld",
      urteil: tage > 30 ? "achtung" : bild.offeneForderungCent > 0 ? "unklar" : "gut",
      grund:
        tage > 30
          ? `Aelteste Forderung ${tage} Tage ueberfaellig.`
          : bild.offeneForderungCent > 0
            ? "Offene Forderung, aber innerhalb der Zahlungsfrist — nichts zu tun."
            : "Keine offene Forderung, nichts ueberfaellig.",
    })
  }

  /* ── Beziehung: Stille ist ein Signal, kein Zustand ───────────────────── */
  const still = tageSeit(bild.letzterKontakt, heute)
  achsen.push({
    key: "beziehung",
    label: "Beziehung",
    urteil: still === null ? "unklar" : still > STILLE_TAGE ? "achtung" : "gut",
    grund:
      still === null
        ? "Kein Kontakt hinterlegt. Das heisst nicht: es gab keinen — sondern: er ist nicht erfasst."
        : still > STILLE_TAGE
          ? `Seit ${still} Tagen kein Kontakt. Wer monatlich kuendigen kann, kuendigt in der Stille.`
          : `Letzter Kontakt vor ${still} Tagen.`,
  })

  /* ── Nutzung: beide Enden sind ein Signal ─────────────────────────────── */
  const stand = kontingentstand(bild.anliegen, monat)
  const nutzt = bild.anliegen.some(
    (a) => ANLIEGEN_ARTEN[a.art]?.gegenKontingent && a.eingegangen.slice(0, 7) === monat,
  )
  achsen.push({
    key: "nutzung",
    label: "Nutzung",
    urteil: stand.verbraucht > INHALT_JE_MONAT ? "unklar" : nutzt ? "gut" : "unklar",
    grund:
      stand.verbraucht > INHALT_JE_MONAT
        ? `${stand.verbraucht} Inhaltsaenderungen in ${monat} — mehr als das Kontingent. ` +
          "Das ist kein Problem, sondern ein Hinweis: Entweder waechst der Betrieb, oder er hat das falsche Paket."
        : nutzt
          ? `${stand.verbraucht} von ${INHALT_JE_MONAT} genutzt.`
          : `Nichts abgerufen in ${monat}. Wer nichts abruft, fragt sich irgendwann, wofuer er zahlt.`,
  })

  return {
    achsen,
    achtung: achsen.filter((a) => a.urteil === "achtung"),
    unklar: achsen.filter((a) => a.urteil === "unklar"),
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · AUSBAU — aus Beobachtung, nicht aus Hoffnung
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Ausbauanlass = {
  key: string
  satz: string
  /** Worauf es hindeutet — nie ein fertiges Angebot. */
  richtung: string
}

/**
 * Anlaesse fuer ein Ausbau-Gespraech.
 *
 * Die Schwelle ist DIESELBE wie in G16 und G25 (`MUSTER_AB`) und wird
 * importiert: Ein Monat ueber Kontingent ist ein Zufall, drei sind ein
 * Muster. Wer beim ersten anfaengt, verkauft in eine Ausnahme hinein.
 *
 * Ein Anlass ist kein Angebot. Er sagt, worueber zu reden waere — den
 * Umfang schneidet danach ein Mensch (G17).
 */
export function ausbauanlaesse(
  anliegen: readonly Anliegen[],
  monate: readonly string[],
): Ausbauanlass[] {
  const anlaesse: Ausbauanlass[] = []

  const ueberKontingent = monate.filter(
    (m) => kontingentstand(anliegen, m).verbraucht > INHALT_JE_MONAT,
  )
  if (ueberKontingent.length >= MUSTER_AB) {
    anlaesse.push({
      key: "ueber-kontingent",
      satz:
        `In ${ueberKontingent.length} Monaten mehr als ${INHALT_JE_MONAT} Inhaltsaenderungen ` +
        `(${ueberKontingent.join(", ")}).`,
      richtung:
        "Der Betrieb braucht mehr als die Betreuung hergibt. Ein groesseres Paket oder ein " +
        "eigener Weg fuer Inhalte — nicht mehr Kulanz.",
    })
  }

  const stoerungen = anliegen.filter((a) => a.art === "stoerung")
  if (stoerungen.length >= MUSTER_AB) {
    anlaesse.push({
      key: "wiederkehrende-stoerung",
      satz: `${stoerungen.length} Stoerungen insgesamt.`,
      richtung:
        "Wiederkehrende Stoerungen sind selten Pech. Sie deuten auf etwas Gebautes, das nicht " +
        "traegt — das ist ein Systemgespraech, kein Support-Ticket.",
    })
  }

  return anlaesse
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DIE EMPFEHLUNGS-SCHLEIFE
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Empfehlungslage = {
  darfFragen: boolean
  /** Warum nicht — im Klartext, damit niemand es „trotzdem" tut. */
  gruende: string[]
  /** Der Satz fuer den Menschen, wenn der Moment traegt. */
  moment: string | null
}

/**
 * Darf man diesen Kunden um eine Empfehlung bitten?
 *
 * Drei Bedingungen, und alle drei sind Anstand, nicht Technik:
 *
 *   1 · Die Uebergabe steht (G19). Vorher ist nichts fertig, worueber man
 *       sprechen koennte.
 *   2 · Keine Achse auf „achtung". Wer einen verpassten Rueckruf offen hat,
 *       fragt nicht nach einem Namen.
 *   3 · Nichts ueberfaellig offen. Um eine Empfehlung zu bitten, waehrend
 *       eine Rechnung ueberfaellig ist, ist die Lehrbuchdefinition von
 *       Taktlosigkeit.
 *
 * Was diese Funktion NICHT tut: einen Kontakt anlegen. Sie sagt, ob der
 * Moment traegt. Der genannte Name geht danach durch G11 — dort stehen die
 * Regeln fuer Personendaten, die ein Dritter genannt hat.
 */
export function empfehlungslage(
  bild: Kundenbild,
  lage: Gesundheitslage,
): Empfehlungslage {
  const gruende: string[] = []

  if (!bild.uebergeben) {
    gruende.push(
      "Die Uebergabe steht noch nicht (G19). Vorher ist nichts fertig, worueber jemand sprechen koennte.",
    )
  }
  for (const a of lage.achtung) {
    gruende.push(`${a.label}: ${a.grund}`)
  }
  if ((bild.forderungUeberfaelligTage ?? 0) > 0) {
    gruende.push(
      "Eine Forderung ist ueberfaellig. Um eine Empfehlung zu bitten, waehrend eine Rechnung " +
        "offen ist, waere taktlos — und die Antwort waere ohnehin keine.",
    )
  }

  return {
    darfFragen: gruende.length === 0,
    gruende,
    moment: gruende.length === 0
      ? "Uebergabe steht, nichts offen, keine Achse auf Achtung. Das ist der Moment fuer die Frage — " +
        "und der genannte Name geht danach durch G11, nicht direkt in die Pipeline."
      : null,
  }
}

/**
 * Der einzige Zugangsweg, der mit „keine Kaltakquise" vereinbar ist —
 * und die Stelle, an der dieses Modul aufhoert.
 *
 * Die Quelle heisst in G11 `empfehlung` und existiert dort seit jeher. Diese
 * Konstante nennt sie nur, damit die Schleife im Code sichtbar endet und
 * nicht als Kommentar.
 */
export const EMPFEHLUNG_QUELLE = "empfehlung" as const

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · WAS ES BEWUSST NICHT GIBT
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Es gibt keine Funktion `verlaengerungstermin()`, und das ist Absicht.
 *
 * Diese Konstante steht hier, damit die Entscheidung im Code nachlesbar ist
 * und nicht nur im Kopf desjenigen, der sie getroffen hat — und damit das
 * Gate sie pruefen kann.
 */
export const KEINE_VERLAENGERUNG =
  "Die Betreuung ist monatlich kuendbar, ohne Mindestlaufzeit (oeffentliche Zusage im FAQ). " +
  "Es gibt deshalb keinen Verlaengerungstermin. Ein eingebauter waere ein Widerspruch zur " +
  "Zusage und eine Frist, die das Haus selbst erfunden hat."
