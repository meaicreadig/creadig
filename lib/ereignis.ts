/**
 * G26 · EREIGNIS- & AUTOMATIONSSCHICHT
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE REGEL STEHT IM VERTRAG, UND SIE IST DIE GANZE DATEI
 *
 *     „Wiederholung automatisieren, NICHT VERANTWORTUNG."
 *
 * Alles hier dient dieser einen Trennung. Ein Auslöser darf abtippen,
 * erinnern, weiterreichen und aufschreiben. Er darf nicht entscheiden,
 * zusagen, ansprechen oder abschliessen — und zwar nicht, weil jemand
 * diszipliniert ist, sondern weil das Register es nicht zulaesst.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * KEIN ZWEITES VOKABULAR
 *
 * Die Ereignisse gibt es schon. `vertrieb-store-neon.ts` schreibt seit
 * Gate 08 in `activities` — `offer.sent`, `project.accepted`,
 * `opportunity.status` und siebzehn weitere. Diese Datei erfindet keine
 * neuen Namen; sie nimmt die vorhandenen und sagt, was aus ihnen folgen
 * DARF.
 *
 * Waere es anders herum, haette dieses Haus zwei Chroniken: eine, die
 * mitschreibt, und eine, die ausloest. Beim ersten Auseinanderlaufen
 * gewaenne die, in die niemand schaut.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM G27 OFFEN BLEIBT — UND WARUM DAS RICHTIG IST
 *
 * G27 („Owner-Last gesunken") ist der Beweis, dass diese Schicht etwas
 * gebracht hat, und er ist MESSBAR, nicht behauptbar. Diese Datei behauptet
 * ihn nicht. Sie baut die Schicht; ob die Last sinkt, zeigt sich an
 * Messwerten ueber Zeit — und bis dahin steht G27 offen.
 *
 * Ohne diese Trennung waere genau das entstanden, wovor G27 warnt:
 * Automationstheater.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · DIE EREIGNISSE, DIE ES GIBT
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Woertlich die `kind`-Werte, die der Speicher heute schreibt.
 *
 * `check-ereignis.mjs` haelt diese Liste gegen den Speicher: Ein Ereignis,
 * das nur hier steht, loest nie aus; eines, das nur dort steht, ist ein
 * blinder Fleck.
 */
export const EREIGNISSE = [
  "lead.converted",
  "lead.handling",
  "opportunity.created",
  "opportunity.status",
  "opportunity.note",
  "offer.sent",
  "offer.accepted",
  "project.started",
  "project.material",
  "project.change",
  "project.accepted",
  "project.handover",
  "contact.details",
  "contact.organisation",
  "contact.relationship",
  "organisation.details",
  "organisation.lifecycle",
  "organisation.location",
] as const

export type Ereignis = (typeof EREIGNISSE)[number]

export function istEreignis(v: unknown): v is Ereignis {
  return typeof v === "string" && (EREIGNISSE as readonly string[]).includes(v)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DIE GRENZE — was NIE automatisch geschieht
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Handlungen, die kein Ausloeser je ausfuehren darf, mit der Regel, die es
 * verbietet.
 *
 * Diese Liste ist die eigentliche Sicherung dieses Gates. Sie steht als
 * DATEN da und nicht als Vorsatz: `ausloeserErlaubt()` schlaegt in ihr
 * nach, und `check-ereignis.mjs` prueft, dass kein Ausloeser sie umgeht.
 *
 * Jeder Eintrag stammt aus einem geschlossenen Gate — keiner ist hier neu
 * erfunden. Das ist wichtig: Eine Verbotsliste, die sich jemand ausdenkt,
 * ist eine Meinung; eine, die vorhandene Regeln zusammentraegt, ist eine
 * Zusammenfassung.
 */
export const NIEMALS_AUTOMATISCH = [
  {
    was: "einen Menschen ansprechen",
    weil: "Keine Kaltakquise (Grundregel 4). Ein Kontakt geht durch G11, und dort entscheidet ein Mensch.",
    gate: "G11",
  },
  {
    was: "ein Angebot senden",
    weil: "Senden ist eine Zusage. G17 verlangt dafuer Angebotsreife und vollstaendige Abschnitte.",
    gate: "G17",
  },
  {
    was: "ein Angebot annehmen",
    weil: "Ein Ja ist eine Aussage ueber einen Menschen — Person, Form, Datum, Fundstelle.",
    gate: "G17",
  },
  {
    was: "eine Lieferung abnehmen",
    weil: "Eine Abnahme erteilt der Kunde, nicht das System.",
    gate: "G19",
  },
  {
    was: "eine Rechnung stellen",
    weil: "Eine Rechnung ist eine Forderung. Sie verlangt eine Entscheidung und einen Steuerstatus.",
    gate: "G18",
  },
  {
    was: "eine Forderung ausbuchen",
    weil: "Ein Verzicht auf Geld ist eine kaufmaennische Entscheidung.",
    gate: "G18",
  },
  {
    was: "um eine Empfehlung bitten",
    weil: "Der Moment traegt oder er traegt nicht — das beurteilt ein Mensch (G22).",
    gate: "G22",
  },
  {
    was: "eine Freigabe erzeugen",
    weil: "Aus einer Abnahme folgt keine Freigabe. Sie entsteht aus einem unterschriebenen Dokument.",
    gate: "G13",
  },
  {
    was: "einen Reifegrad setzen",
    weil: "Die Stufe kann man nicht ausrechnen — sie weiss genau eine Person.",
    gate: "G24",
  },
  {
    was: "einen Preis nennen",
    weil: "Jede Zahl kommt aus dem Katalog oder aus einer Owner-Freigabe mit Fundstelle.",
    gate: "G17",
  },
] as const

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DIE AUSLOESER
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Was ein Ausloeser tun darf.
 *
 * Vier Arten, und alle vier sind Wiederholung:
 *
 *   `notieren`     etwas in die Chronik schreiben
 *   `erinnern`     jemanden an etwas erinnern, das er selbst tun muss
 *   `weiterreichen` etwas sichtbar machen, wo es hingehoert
 *   `pruefen`      eine Regel anwenden und das Ergebnis hinschreiben
 *
 * Keine davon entscheidet. Wer eine fuenfte braucht, braucht keinen
 * Ausloeser, sondern einen Menschen.
 */
export const WIRKUNGEN = ["notieren", "erinnern", "weiterreichen", "pruefen"] as const
export type Wirkung = (typeof WIRKUNGEN)[number]

/**
 * WAS EIN AGENT KONKRET TUN DARF — die geschlossene Liste.
 *
 * ---------------------------------------------------------------------------
 * WARUM SIE NACHTRAEGLICH ENTSTANDEN IST
 *
 * Bis zum 09.09.2026 pruefte `ausloeserErlaubt()` — und ueber sie `handeln()`
 * in G30 — eine Handlung, indem sie den beschreibenden SATZ nach den
 * Verbotsphrasen durchsuchte. Gegen die drei kuratierten Ausloeser war das
 * genug: Ihre Texte stehen in dieser Datei und aendern sich nur, wenn jemand
 * sie hier aendert.
 *
 * Gegen einen Agenten war es das nicht. `handeln()` nimmt den Satz vom
 * AUFRUFER entgegen, und eine Umschreibung geht durch jede Phrasensuche:
 *
 *   „ein Angebot senden"                → verboten (G17)
 *   „Das Angebot per Mail rausschicken" → dieselbe Handlung, erlaubt
 *   „einen Menschen ansprechen"         → verboten (G11)
 *   „Den Interessenten anrufen"         → dieselbe Handlung, erlaubt
 *
 * Eine Grenze, die man durch Umformulieren verschiebt, ist keine. Der Fehler
 * war nicht die Liste, sondern die Richtung der Pruefung: Sie fragte, ob ein
 * frei gewaehlter Satz VERBOTEN ist, statt ob er ERLAUBT ist. Wer verbietet,
 * muss alles aufzaehlen, woran ein Mensch je denken koennte; wer erlaubt,
 * zaehlt auf, was das Haus vorgesehen hat.
 *
 * ---------------------------------------------------------------------------
 * WORAUS SIE STAMMT
 *
 * Nichts hier ist neu erfunden. Es sind die vier Wirkungen aus diesem Gate,
 * je einmal in eine Handlung ausformuliert. Eine Liste, die sich jemand
 * ausdenkt, ist eine Meinung; eine, die vorhandene Regeln zusammentraegt,
 * ist eine Zusammenfassung.
 *
 * `weiterreichen` sagt ausdruecklich INTERN. Nach aussen zeigt keine der
 * vier Wirkungen — der Weg zu einem Menschen laeuft ueber G11, und dort
 * entscheidet einer.
 */
export const HANDLUNGEN = [
  {
    key: "chronik-notieren",
    wirkung: "notieren",
    was: "In die Chronik schreiben, was geschehen ist",
  },
  {
    key: "frist-erinnern",
    wirkung: "erinnern",
    was: "An eine Frist oder einen faelligen Schritt erinnern, den ein Mensch selbst tut",
  },
  {
    key: "intern-weiterreichen",
    wirkung: "weiterreichen",
    was: "Einen Vorgang INTERN an eine Rolle weiterreichen, damit er dort sichtbar wird",
  },
  {
    key: "lage-pruefen",
    wirkung: "pruefen",
    was: "Eine Lage gegen ihre Regel nachrechnen und das Ergebnis hinschreiben",
  },
] as const satisfies readonly { key: string; wirkung: Wirkung; was: string }[]

export type HandlungKey = (typeof HANDLUNGEN)[number]["key"]

/** Die Handlung zu einem Schluessel — oder `null`, und `null` heisst nein. */
export function handlungFuer(key: unknown): (typeof HANDLUNGEN)[number] | null {
  return HANDLUNGEN.find((h) => h.key === key) ?? null
}

export type Ausloeser = {
  key: string
  auf: Ereignis
  wirkung: Wirkung
  was: string
  /**
   * Kann ein Mensch ihn abschalten? Immer `true` — das Feld steht hier,
   * damit die Frage beantwortet ist und nicht vergessen wird.
   */
  abschaltbar: true
  /**
   * Wie oft es hoechstens versucht wird. Ein Ausloeser, der ewig
   * wiederholt, ist kein Fehlerfall mehr, sondern ein Dauerzustand.
   */
  versucheMax: number
}

/**
 * DER BESTAND — heute drei, und alle drei notieren oder erinnern.
 *
 * Bewusst mager. Ein Ausloeser, der niemandem fehlt, ist ein Ausloeser, den
 * niemand pflegt; und die Schicht soll beweisen, dass die GRENZE haelt,
 * nicht dass sie viel kann.
 */
export const AUSLOESER: readonly Ausloeser[] = [
  {
    key: "abnahme-erinnert-an-freigabe",
    auf: "project.accepted",
    wirkung: "erinnern",
    was:
      "Nach der Abnahme daran erinnern, jetzt nach der schriftlichen Freigabe zu fragen (G13). " +
      "Erinnern, nicht fragen — die Frage stellt ein Mensch.",
    abschaltbar: true,
    versucheMax: 1,
  },
  {
    key: "uebergabe-notiert-vollstaendigkeit",
    auf: "project.handover",
    wirkung: "notieren",
    was: "In die Chronik schreiben, welche der vier Stuecke uebergeben wurden (G19).",
    abschaltbar: true,
    versucheMax: 3,
  },
  {
    key: "verlust-prueft-muster",
    auf: "opportunity.status",
    wirkung: "pruefen",
    was:
      "Bei einem Verlust nachrechnen, ob ein Grund zum Muster geworden ist (G16), und das " +
      "Ergebnis hinschreiben. Das Zielbild aendert weiterhin ein Mensch.",
    abschaltbar: true,
    versucheMax: 3,
  },
]

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · IDEMPOTENZ
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Der Schluessel, unter dem eine Wirkung hoechstens einmal geschieht.
 *
 * Er wird ABGELEITET — aus Ausloeser, Ereignis und dem Gegenstand. Ein
 * zufaelliger Schluessel waere keiner: Beim zweiten Lauf desselben
 * Ereignisses entstuende ein neuer, und die Wirkung traete zweimal ein.
 *
 * Genau das ist der Fehler, den man erst im Postfach des Kunden bemerkt.
 */
export function idempotenzSchluessel(ausloeser: string, ereignis: string, gegenstand: string): string {
  return `${ausloeser}:${ereignis}:${gegenstand}`
}

/** Ist diese Wirkung schon geschehen? Reine Rechnung ueber das Protokoll. */
export function schonGeschehen(protokoll: readonly string[], schluessel: string): boolean {
  return protokoll.includes(schluessel)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 5 · DIE ENTSCHEIDUNG
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Lauf = {
  erlaubt: boolean
  grund: string
  schluessel: string | null
}

/**
 * Darf dieser Ausloeser jetzt laufen?
 *
 * Fuenf Fragen, und jede kann allein Nein sagen:
 *
 *   1 Kennt das Register das Ereignis?
 *   2 Kennt es den Ausloeser?
 *   3 Ist er abgeschaltet?
 *   4 Ist die Wirkung schon geschehen (Idempotenz)?
 *   5 Sind die Versuche aufgebraucht?
 *
 * Die menschliche Uebersteuerung steht bewusst VOR der Idempotenz: Wer
 * abschaltet, will, dass nichts geschieht — nicht, dass es einmal noch
 * geschieht, weil es noch nicht dran war.
 */
export function darfLaufen(input: {
  ausloeser: string
  ereignis: string
  gegenstand: string
  abgeschaltet?: readonly string[]
  protokoll?: readonly string[]
  versuche?: number
}): Lauf {
  const a = AUSLOESER.find((x) => x.key === input.ausloeser)
  if (!a) return { erlaubt: false, grund: `Unbekannter Ausloeser „${input.ausloeser}".`, schluessel: null }
  if (!istEreignis(input.ereignis)) {
    return { erlaubt: false, grund: `Unbekanntes Ereignis „${input.ereignis}".`, schluessel: null }
  }
  if (a.auf !== input.ereignis) {
    return { erlaubt: false, grund: `Der Ausloeser haengt an „${a.auf}", nicht an „${input.ereignis}".`, schluessel: null }
  }
  if ((input.abgeschaltet ?? []).includes(a.key)) {
    return { erlaubt: false, grund: "Von einem Menschen abgeschaltet.", schluessel: null }
  }

  const schluessel = idempotenzSchluessel(a.key, input.ereignis, input.gegenstand)
  if (schonGeschehen(input.protokoll ?? [], schluessel)) {
    return { erlaubt: false, grund: "Schon geschehen — derselbe Schluessel steht im Protokoll.", schluessel }
  }
  if ((input.versuche ?? 0) >= a.versucheMax) {
    return {
      erlaubt: false,
      grund: `${input.versuche} Versuche, hoechstens ${a.versucheMax}. Ein Ausloeser, der ewig wiederholt, ist ein Dauerzustand.`,
      schluessel,
    }
  }
  return { erlaubt: true, grund: `${a.wirkung}: ${a.was}`, schluessel }
}

/**
 * Waere diese Handlung ueberhaupt automatisierbar?
 *
 * Die Frage wird gegen `NIEMALS_AUTOMATISCH` beantwortet — nicht gegen ein
 * Gefuehl. Sie steht hier, damit jeder kuenftige Ausloeser sie passieren
 * muss, bevor er geschrieben wird.
 */
/**
 * Beschreibt dieser Satz etwas, das nie automatisch geschehen darf?
 *
 * ACHTUNG — WOFUER DAS HIER TAUGT UND WOFUER NICHT.
 *
 * Es ist eine Phrasensuche. Gegen den KURATIERTEN Text der Ausloeser in
 * dieser Datei ist sie richtig: Sie faellt auf, wenn jemand hier einen
 * Ausloeser hinschreibt, der eine verbotene Handlung beschreibt.
 *
 * Gegen EINGABEN ist sie es nicht. Wer den Satz frei waehlt, waehlt auch die
 * Formulierung, und „Das Angebot per Mail rausschicken" enthaelt keine der
 * Phrasen. Deshalb entscheidet in G30 nicht diese Funktion, sondern
 * `HANDLUNGEN`: eine geschlossene Liste dessen, was erlaubt IST. Diese hier
 * bleibt als zweiter Guertel — sie faengt eine falsch beschriftete Spur.
 */
export function ausloeserErlaubt(handlung: string): { ja: boolean; weil: string; gate?: string } {
  const treffer = NIEMALS_AUTOMATISCH.find((n) =>
    handlung.toLowerCase().includes(n.was.toLowerCase()),
  )
  if (treffer) return { ja: false, weil: treffer.weil, gate: treffer.gate }
  return { ja: true, weil: "Wiederholung, keine Verantwortung." }
}
