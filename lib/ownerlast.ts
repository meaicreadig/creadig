/*
 * ==========================================================================
 * OWNER-LAST — GATE 27 ⬥
 * ==========================================================================
 *
 * Der Vertrag ist ein Satz: „Owner-Last gesunken — messbar, nicht behauptet.
 * Ohne dieses Gate: Automationstheater."
 *
 * Und G26 hat selbst dazugeschrieben, warum es offen bleiben musste: „Ob die
 * Owner-Last sinkt, zeigen Messwerte ueber Zeit — nicht diese Schicht."
 *
 * Dieses Modul baut deshalb keine Automation. Es baut die MESSUNG — und vor
 * allem die Regeln, wann sie NICHTS sagen darf.
 *
 * ---------------------------------------------------------------------------
 * DIE FALLE, DIE DIESES GATE STELLT
 *
 * „Owner-Last" klingt nach einer Zahl, die sinken soll. Genau das ist die
 * Falle. Der billigste Weg, sie sinken zu lassen, ist nicht Automation —
 * es ist, eine Entscheidung abzuschaffen.
 *
 * Dieses Haus hat an mehreren Stellen absichtlich einen Menschen
 * hingestellt: das Kontakttor (G11), die Freigabe (G13), Won/Lost (G17),
 * das Stellen einer Rechnung (G18), die Vollmachtsgrenze (G30). Wuerde man
 * eine davon entfernen, faellt die Zahl — und das Haus waere schlechter.
 *
 * Deshalb zerfaellt die Last hier in ZWEI Groessen, die nie zu einer werden:
 *
 *   ABNEHMBAR    Erinnern, Nachhalten, Zusammentragen, Vorbereiten.
 *                Das darf sinken. Dafuer gibt es G26.
 *
 *   UNABNEHMBAR  Entscheidungen, die dieses Haus einem Menschen
 *                vorbehalten hat. Das darf NICHT sinken — und wenn es
 *                sinkt, ist das ein Alarm und kein Erfolg.
 *
 * Eine Kennzahl, die man durch das Entfernen einer Sicherung verbessern
 * kann, misst das Gegenteil dessen, was sie soll.
 *
 * ---------------------------------------------------------------------------
 * NICHTS WIRD ERFUNDEN
 *
 * Die Zahlen kommen aus `collectAttention()` (`lib/attention.ts`) — derselben
 * Quelle, aus der „Heute" gespeist wird. Ein zweiter Zaehler waere eine
 * zweite Wahrheit ueber dieselbe Arbeit.
 */
import { ATTENTION_RANKS, type AttentionBoard, type AttentionRank } from "@/lib/attention"

/* ── Die zwei Klassen ───────────────────────────────────────────────────── */

/**
 * Last, die ein System abnehmen darf: sich erinnern, nachhalten,
 * zusammentragen, eine Frist im Blick behalten.
 */
export const ABNEHMBAR: readonly AttentionRank[] = [
  "betriebsblocker",
  "ueberfaellig",
  "heute-faellig",
  "neue-anfrage",
  "schritt-ohne-termin",
  "ohne-schritt",
  "beziehung-faellig",
]

/**
 * Last, die ein System NICHT abnehmen darf.
 *
 * Heute genau ein Rang: `entscheidung`. Er buendelt, was die Gate-Arbeit an
 * menschlichen Toren aufgestellt hat. Dass es nur einer ist, macht ihn nicht
 * klein — er ist der einzige, dessen Sinken eine schlechte Nachricht ist.
 */
export const UNABNEHMBAR: readonly AttentionRank[] = ["entscheidung"]

/* Vollstaendigkeit ist keine Meinung: Jeder Rang gehoert in genau eine Klasse. */
const ALLE = [...ABNEHMBAR, ...UNABNEHMBAR]
export const KLASSIFIKATION_VOLLSTAENDIG =
  ALLE.length === ATTENTION_RANKS.length && ATTENTION_RANKS.every((r) => ALLE.includes(r))

/* ── Die Messung ────────────────────────────────────────────────────────── */

export type Messung = {
  /** Tag der Messung, ISO. */
  am: string
  counts: Record<AttentionRank, number>
  /**
   * Ob der Vertriebsteil ueberhaupt gemessen werden konnte.
   *
   * `false` heisst NICHT „nichts los" — es heisst „nicht gemessen". Eine
   * Messung mit `false` ist als Vergleichspunkt wertlos, und dieses Modul
   * behandelt sie auch so. Ohne diese Unterscheidung waere ein
   * Datenbankausfall die beste Entlastung, die das Haus je hatte.
   */
  vertriebGemessen: boolean
}

export type Last = { abnehmbar: number; unabnehmbar: number; gesamt: number }

export function last(m: Messung): Last {
  const summe = (raenge: readonly AttentionRank[]) =>
    raenge.reduce((s, r) => s + (m.counts[r] ?? 0), 0)
  const abnehmbar = summe(ABNEHMBAR)
  const unabnehmbar = summe(UNABNEHMBAR)
  return { abnehmbar, unabnehmbar, gesamt: abnehmbar + unabnehmbar }
}

/* ── Wann ein Vergleich nichts sagen darf ───────────────────────────────── */

/**
 * Der Mindestabstand zwischen zwei Messungen.
 *
 * Vier Wochen, und die Zahl ist nicht beliebig: Der Betrieb dieses Hauses
 * laeuft in Wochen — Angebote, Fristen, Rueckmeldungen. Zwei Messungen im
 * Abstand von drei Tagen vergleichen einen Dienstag mit einem Freitag, und
 * der Unterschied heisst „Woche", nicht „Entlastung".
 *
 * Er ist bewusst laenger als jede Ungeduld. Wer frueher eine Aussage will,
 * bekommt hier keine.
 */
export const MIND_ABSTAND_TAGE = 28

export type Urteil = "gesunken" | "gestiegen" | "unveraendert" | "nicht-aussagekraeftig"

export type Vergleich = {
  urteil: Urteil
  aussagekraeftig: boolean
  grund: string
  abstandTage: number | null
  abnehmbarDelta: number | null
  unabnehmbarDelta: number | null
  /** Gesetzt, wenn die unabnehmbare Last gesunken ist. Das ist kein Erfolg. */
  warnung: string | null
  /**
   * Darf dieses Ergebnis als Automationserfolg BERICHTET werden?
   *
   * Es gibt dieses Feld, weil `warnung` allein nicht reicht. Eine Warnung
   * neben einer gefallenen Kurve wird gelesen wie ein Sternchen unter einem
   * Preis — der Satz, der ankommt, ist „Owner-Last gesunken". Deshalb steht
   * die Frage hier als ein Wert, den man nicht versehentlich uebersieht:
   * `false`, sobald ein Entscheidungstor mitgefallen sein koennte.
   *
   * `true` verlangt alle drei: aussagekraeftig, abnehmbare Last gefallen,
   * keine Warnung.
   */
  erfolg: boolean
}

const nicht = (grund: string, abstandTage: number | null = null): Vergleich => ({
  urteil: "nicht-aussagekraeftig",
  aussagekraeftig: false,
  grund,
  abstandTage,
  abnehmbarDelta: null,
  unabnehmbarDelta: null,
  warnung: null,
  erfolg: false,
})

/**
 * Zwei Messungen vergleichen — oder ehrlich sagen, dass es nicht geht.
 *
 * Die Reihenfolge der Ablehnungsgruende ist selbst eine Aussage: Zuerst wird
 * geprueft, ob ueberhaupt gemessen wurde, dann ob genug Zeit vergangen ist.
 * Umgekehrt wuerde eine nicht gemessene Woche nach vier Wochen wie ein
 * Ergebnis aussehen.
 */
export function vergleich(frueh: Messung | null, spaet: Messung | null): Vergleich {
  if (!frueh || !spaet)
    return nicht(
      "Es gibt noch keine zwei Messungen. Eine einzelne Zahl ist ein Zustand, kein Verlauf — " +
        "und ein Verlauf ist das Einzige, was dieses Gate beweisen kann.",
    )

  if (!frueh.vertriebGemessen || !spaet.vertriebGemessen)
    return nicht(
      "Mindestens eine der beiden Messungen konnte den Vertrieb nicht lesen. " +
        "„Nicht gemessen“ ist nicht „nichts los“ — sonst wäre ein Datenbankausfall die beste Entlastung, " +
        "die dieses Haus je hatte.",
    )

  const abstandTage = Math.floor(
    (new Date(spaet.am).getTime() - new Date(frueh.am).getTime()) / 86_400_000,
  )
  if (abstandTage < 0) return nicht("Die spätere Messung liegt vor der früheren.", abstandTage)
  if (abstandTage < MIND_ABSTAND_TAGE)
    return nicht(
      `Zwischen den Messungen liegen ${abstandTage} Tag(e); verlangt sind ${MIND_ABSTAND_TAGE}. ` +
        "Ein Unterschied über wenige Tage heißt „Woche“, nicht „Entlastung“.",
      abstandTage,
    )

  const a = last(frueh)
  const b = last(spaet)
  const abnehmbarDelta = b.abnehmbar - a.abnehmbar
  const unabnehmbarDelta = b.unabnehmbar - a.unabnehmbar

  /*
   * DIE WARNUNG STEHT VOR DEM URTEIL.
   *
   * Wenn die unabnehmbare Last gesunken ist, ist die erste Frage nicht „wie
   * schoen", sondern „was ist mit den Toren passiert". Es kann harmlos sein
   * — weniger Vorgaenge, weniger Entscheidungen. Es kann aber auch heissen,
   * dass jemand ein Tor entfernt hat, und dann ist die gefallene Zahl der
   * Schaden und nicht der Erfolg.
   */
  const warnung =
    unabnehmbarDelta < 0
      ? `Die unabnehmbare Last ist um ${Math.abs(unabnehmbarDelta)} gefallen. ` +
        "Das ist kein Erfolg, bis geklärt ist warum: Weniger Vorgänge — oder ein entferntes " +
        "Entscheidungstor? `npm run check-ownerlast` prüft, ob die Tore noch stehen."
      : null

  const urteil: Urteil =
    abnehmbarDelta < 0 ? "gesunken" : abnehmbarDelta > 0 ? "gestiegen" : "unveraendert"

  const richtung =
    urteil === "gesunken"
      ? `Die abnehmbare Last ist um ${Math.abs(abnehmbarDelta)} gefallen`
      : urteil === "gestiegen"
        ? `Die abnehmbare Last ist um ${abnehmbarDelta} gestiegen`
        : "Die abnehmbare Last ist unverändert"

  return {
    urteil,
    aussagekraeftig: true,
    grund: `${richtung} (${a.abnehmbar} → ${b.abnehmbar}) über ${abstandTage} Tage. ` +
      `Unabnehmbar: ${a.unabnehmbar} → ${b.unabnehmbar}.`,
    abstandTage,
    abnehmbarDelta,
    unabnehmbarDelta,
    warnung,
    erfolg: urteil === "gesunken" && warnung === null,
  }
}

/* ── Von der Oberflaeche zur Messung ────────────────────────────────────── */

/**
 * Der Tag einer Messung, ISO, in UTC.
 *
 * Nicht `toLocaleDateString`: Wer um 23:30 in Berlin misst, misst nach UTC den
 * Vortag — und zwei Messungen am selben lokalen Tag waeren dann zwei Tage. Der
 * Abstand zwischen Messungen ist die einzige Zahl, an der dieses Gate haengt;
 * sie darf nicht von der Tageszeit abhaengen.
 */
export function messtag(jetzt: Date = new Date()): string {
  return jetzt.toISOString().slice(0, 10)
}

/**
 * Die Kennung einer Messung — abgeleitet aus dem Tag, nicht gewuerfelt.
 *
 * Eine zufaellige Kennung waere hier ein Fehler mit Ansage: Zwei Laeufe am
 * selben Tag bekaemen zwei Kennungen, der Primaerschluessel saehe kein
 * Problem, und der Tagesindex muesste den Zusammenstoss abfangen. So faellt
 * die zweite Messung schon an der Kennung auf denselben Datensatz — dieselbe
 * Eingabe, dasselbe Ergebnis.
 */
export function messungId(am: string): string {
  return `ol-${am}`
}

/**
 * Eine Messung aus dem Aufmerksamkeitsbrett — der Quelle, aus der auch „Heute"
 * gespeist wird.
 *
 * Es wird NICHT nachgezaehlt. Ein zweiter Zaehler waere eine zweite Wahrheit
 * ueber dieselbe Arbeit, und die falsche gewinnt immer.
 */
export function messungAus(board: AttentionBoard, am: string = messtag()): Messung {
  return { am, counts: board.counts, vertriebGemessen: board.salesMeasured }
}

/* ── Die Reihe ──────────────────────────────────────────────────────────── */

/**
 * Eine Messreihe — oder `null`.
 *
 * `null` heisst „die Reihe war nicht lesbar" und ist etwas anderes als `[]`,
 * das „es gibt noch keine Messung" heisst. Der Unterschied ist der ganze
 * Gate-Vertrag: Ohne ihn waere ein Ausfall der Messreihe selbst die beste
 * Entlastung, die dieses Haus je hatte.
 */
export type Reihe = readonly Messung[] | null

/** Abstand in Tagen zwischen zwei ISO-Tagen. */
const tage = (von: string, bis: string) =>
  (new Date(bis).getTime() - new Date(von).getTime()) / 86_400_000

/**
 * Die zwei Messungen, die verglichen werden — deterministisch bestimmt.
 *
 * `spaet` ist immer die juengste Messung. Nicht die juengste BRAUCHBARE:
 * Duerfte die Wahl eine unbrauchbare Messung ueberspringen, verschoebe ein
 * Datenausfall stillschweigend das Vergleichsfenster, und die Kurve saehe
 * genau so aus, wie jemand sie sich wuenscht. Eine unbrauchbare juengste
 * Messung soll den Vergleich verhindern, nicht ihn umleiten.
 *
 * `frueh` ist die JUENGSTE Messung, die weit genug zurueckliegt — nicht die
 * aelteste. Die aelteste zu nehmen hiesse, den Vergleichszeitraum mit jeder
 * Messung wachsen zu lassen; dann verglichen zwei Laeufe im Abstand einer
 * Woche verschiedene Zeitraeume und der Unterschied haette einen Namen, der
 * nichts mit Entlastung zu tun hat.
 *
 * Liegt keine weit genug zurueck, wird die aelteste vorhandene zurueckgegeben
 * — dann sagt `vergleich()` mit dem echten Abstand, warum es noch nicht geht.
 * Das ist mehr wert als ein `null`, das nur „nein" sagt.
 */
export function paar(reihe: readonly Messung[]): { frueh: Messung | null; spaet: Messung | null } {
  const sortiert = [...reihe].sort((a, b) => a.am.localeCompare(b.am))
  const spaet = sortiert[sortiert.length - 1] ?? null
  if (!spaet || sortiert.length < 2) return { frueh: null, spaet }

  const vorher = sortiert.slice(0, -1)
  const weitGenug = vorher.filter(
    (m) => Math.floor(tage(m.am, spaet.am)) >= MIND_ABSTAND_TAGE,
  )
  const frueh = weitGenug.length > 0 ? weitGenug[weitGenug.length - 1] : vorher[0]
  return { frueh, spaet }
}

/**
 * Die Auswertung einer ganzen Reihe — der eine Aufruf, den eine Oberflaeche
 * braucht.
 *
 * Nimmt `null` fuer „nicht lesbar" ernst: Eine Reihe, die niemand lesen
 * konnte, ergibt kein Urteil. Sie ergibt auch kein beruhigendes „noch keine
 * Daten" — das waere dieselbe Luege in freundlich.
 */
export function auswertung(reihe: Reihe): Vergleich {
  if (reihe === null)
    return nicht(
      "Die Messreihe war nicht lesbar. Das ist kein Ergebnis und auch kein leerer Anfang — " +
        "es ist eine fehlende Messung, und eine fehlende Messung ist keine gesunkene Last.",
    )
  const { frueh, spaet } = paar(reihe)
  return vergleich(frueh, spaet)
}

/* ── Was die Zahl NICHT sagt ────────────────────────────────────────────── */

/**
 * Steht auf der Oberflaeche neben jeder Auswertung.
 *
 * Eine Kennzahl ohne diese Saetze wird binnen eines Quartals als Beweis
 * zitiert — und zwar fuer etwas, das sie nie gemessen hat.
 */
export const SAGT_NICHTS_UEBER = [
  "Nicht über Qualität. Weniger Posten können auch heißen, dass weniger passiert.",
  "Nicht über Umsatz. Eine leere Liste ist kein Geschäft.",
  "Nicht über Automation allein — ein ruhiger Monat sieht genauso aus.",
  "Nicht über die Entscheidungen selbst. Die sollen bleiben, wo sie sind.",
]

/**
 * Ein menschliches Tor: ein Export, den dieses Haus einem Menschen vorbehalten
 * hat.
 *
 * `art` ist nicht Dokumentation, sondern die Pruefbedingung. Ein Tor kann auf
 * zwei Arten verschwinden: Jemand loescht es — oder jemand laesst den Namen
 * stehen und hoehlt ihn aus (`export const NIEMALS_AUTOMATISCH = []`). Die
 * zweite Art ist die gefaehrlichere, weil sie jede Suche nach dem Namen
 * besteht. Deshalb steht hier, was hinter dem Namen stehen MUSS.
 */
export type Tor = {
  gate: string
  was: string
  /** Datei, in der das Tor steht — zugleich der Modulpfad fuer die Pruefung. */
  wo: string
  /** Name des Exports. */
  suche: string
  /** `funktion`: aufrufbar. `liste`: ein Feld, und es darf nicht leer sein. */
  art: "funktion" | "liste"
}

/**
 * Die menschlichen Tore, die dieses Haus aufgestellt hat.
 *
 * Sie stehen hier NAMENTLICH, weil `check-ownerlast.mjs` die Module LAEDT und
 * nachsieht, ob der Export noch da ist und noch etwas enthaelt. Verschwindet
 * eines, faellt die unabnehmbare Last — und der Build bricht, bevor jemand das
 * als Entlastung meldet.
 *
 * Geprueft wird der Export, nicht der Quelltext. Ein Textfund haette auch ein
 * Wort in einem Kommentar akzeptiert; ein geladenes Modul kann nicht so tun,
 * als haette es einen Export, den es nicht hat.
 */
export const ENTSCHEIDUNGSTORE = [
  {
    gate: "G11",
    was: "Kontakt vorbereiten",
    wo: "lib/contact-access.ts",
    suche: "ansprachedeckung",
    art: "funktion",
  },
  {
    gate: "G13",
    was: "Freigabe eines Kundenbelegs",
    wo: "lib/proof.ts",
    suche: "deckung",
    art: "funktion",
  },
  {
    gate: "G18",
    was: "Rechnung stellen",
    wo: "lib/rechnung.ts",
    suche: "stellbarkeit",
    art: "funktion",
  },
  {
    gate: "G26",
    was: "Ausloeser-Grenze",
    wo: "lib/ereignis.ts",
    suche: "NIEMALS_AUTOMATISCH",
    art: "liste",
  },
] as const satisfies readonly Tor[]
