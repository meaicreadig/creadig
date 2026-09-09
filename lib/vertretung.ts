/*
 * ==========================================================================
 * OWNER-ERSETZBARKEIT — GATE 33
 * ==========================================================================
 *
 * Der Vertrag ist ein Satz: „fuer EINEN Ablauf ersetzbar." Und dahinter
 * steht die Begruendung, warum das Gate ueberhaupt allein steht: Es ist der
 * einzige Beweis, dass das Unternehmen ohne den Owner laeuft.
 *
 * ---------------------------------------------------------------------------
 * WAS ERSETZBARKEIT NICHT IST
 *
 * Sie ist nicht die Abschaffung des Owners.
 *
 * Dieses Haus hat an mehreren Stellen absichtlich einen Menschen
 * hingestellt: die Ansprache (G11), die Freigabe (G13), das Stellen einer
 * Rechnung (G18), die Grenze der Automation (G26). Diese Schritte sollen
 * NICHT delegierbar werden. Ein Gate, das die Owner-Bindung aufloest, um
 * eine Kennzahl zu verbessern, hat genau das getan, wovor G27 warnt — nur
 * mit einem freundlicheren Wort dafuer.
 *
 * Ersetzbarkeit heisst deshalb: DELEGIERBARE Betriebsarbeit haengt nicht
 * unnoetig an einer einzelnen Person. Nicht mehr, und keinen Schritt weniger.
 *
 * ---------------------------------------------------------------------------
 * DIE ZWEI ARTEN, AUF DIE EIN ABLAUF NICHT ERSETZBAR IST
 *
 * Sie sehen gleich aus und sind das Gegenteil voneinander:
 *
 *   OWNER-GEBUNDEN          Ein Schritt darin gehoert einem Menschen. Das ist
 *                           richtig so und aendert sich nie. Kein Mangel.
 *
 *   NICHT BESETZT           Jeder Schritt waere delegierbar, aber die Rolle,
 *                           die ihn tragen soll, hat niemand. Das ist ein
 *                           Mangel — und zwar einer, den ein Mensch behebt,
 *                           nicht dieses Modul.
 *
 * Wer die beiden zusammenwirft, bekommt eine Zahl, die man auf zwei Wegen
 * verbessern kann: indem man jemanden einstellt — oder indem man eine
 * Sicherung entfernt. Nur der erste ist ein Fortschritt.
 *
 * ---------------------------------------------------------------------------
 * NICHTS WIRD ERFUNDEN
 *
 * Die Rollen kommen aus G32, ob sie besetzt sind aus der Umgebung
 * (`vergebeneRollen`), und die Owner-Bindungen aus G26/G27 — nicht aus einer
 * Meinung darueber, was wichtig ist. `check-vertretung.mjs` prueft beide
 * Richtungen: kein erfundenes Owner-Tor, und keines unterschlagen.
 */
import { NIEMALS_AUTOMATISCH } from "@/lib/ereignis"
import { ENTSCHEIDUNGSTORE } from "@/lib/ownerlast"
import { ROLLEN, vergebeneRollen, type Rolle } from "@/lib/rollen"

/* ── Die Gates, die einen Menschen verlangen ────────────────────────────── */

/**
 * Welche Gates ueberhaupt eine Owner-Bindung begruenden duerfen.
 *
 * Abgeleitet, nicht aufgezaehlt: Es sind die Entscheidungstore aus G27 und
 * die Verbote aus G26. Eine eigene Liste waere eine zweite Wahrheit — und
 * hier waere sie besonders teuer, weil man mit ihr jeden beliebigen Schritt
 * zur Chefsache erklaeren koennte. „Nur ich kann das" ist keine Regel,
 * sondern eine Gewohnheit.
 */
export const OWNER_GATES: readonly string[] = [
  ...new Set([...ENTSCHEIDUNGSTORE.map((t) => t.gate), ...NIEMALS_AUTOMATISCH.map((n) => n.gate)]),
]

export function istOwnerGate(gate: unknown): boolean {
  return typeof gate === "string" && OWNER_GATES.includes(gate)
}

/* ── Ablaeufe und Schritte ──────────────────────────────────────────────── */

export type Schritt = {
  was: string
  /**
   * Die Rollen, die diesen Schritt tragen koennen — ohne `owner`.
   *
   * Der Owner kann alles; ihn hier mitzuschreiben wuerde jeden Schritt
   * besetzt aussehen lassen und die Frage des Gates zum Verschwinden
   * bringen.
   */
  rollen: readonly Exclude<Rolle, "owner">[]
  /**
   * Das Gate, das diesen Schritt an einen Menschen bindet — oder `null`.
   *
   * `null` heisst delegierbar. Es heisst NICHT „unwichtig".
   */
  ownerGebundenDurch: string | null
  /** Warum. Bei Owner-Bindung der Satz aus dem Gate, sonst der Arbeitsinhalt. */
  weil: string
}

export type Ablauf = {
  key: string
  name: string
  schritte: readonly Schritt[]
}

/**
 * Die Ablaeufe, die dieses Haus heute wirklich hat.
 *
 * Bewusst wenige und alle aus geschlossenen Gates. Ein Verzeichnis, das
 * Ablaeufe auffuehrt, die niemand fuehrt, misst Papier.
 */
export const ABLAEUFE: readonly Ablauf[] = [
  {
    key: "anfrage-aufnehmen",
    name: "Eine eingegangene Anfrage aufnehmen und fuehren",
    schritte: [
      {
        was: "Anfrage sichten und den Bearbeitungsstand setzen",
        rollen: ["vertrieb"],
        ownerGebundenDurch: null,
        weil: "Eine eingegangene Anfrage ist kein Kontaktversuch — der Mensch hat sich gemeldet.",
      },
      {
        was: "Organisation und Kontakt zuordnen",
        rollen: ["vertrieb"],
        ownerGebundenDurch: null,
        weil: "Zuordnen ist Nachhalten, keine Zusage.",
      },
      {
        was: "Naechsten Schritt mit Termin setzen",
        rollen: ["vertrieb"],
        ownerGebundenDurch: null,
        weil: "Ein Vorgang ohne naechsten Schritt ist der haeufigste stille Verlust.",
      },
    ],
  },
  {
    key: "inhalt-pflegen",
    name: "Eine Luecke im Materialstand schliessen",
    schritte: [
      {
        was: "Offene Luecke im Materialstand aufnehmen",
        rollen: ["redaktion"],
        ownerGebundenDurch: null,
        weil: "Der Materialstand nennt die Luecke samt Fundstelle.",
      },
      {
        was: "Beitrag schreiben und die Angabe belegen",
        rollen: ["redaktion"],
        ownerGebundenDurch: null,
        weil: "Eine Angabe ohne Beleg gibt es nicht — aber wer sie belegt, muss nicht der Owner sein.",
      },
    ],
  },
  {
    key: "kontakt-ansprechen",
    name: "Einen recherchierten Kontakt ansprechen",
    schritte: [
      {
        was: "Recherche belegen und die Person zuordnen",
        rollen: ["vertrieb"],
        ownerGebundenDurch: null,
        weil: "Recherchieren und Belegen ist Zusammentragen.",
      },
      {
        was: "Entscheiden, ob angesprochen wird",
        rollen: [],
        ownerGebundenDurch: "G11",
        weil:
          "Keine Kaltakquise (Grundregel 4). Die Ansprache ist eine Aussage ueber einen " +
          "fremden Menschen, und `ansprachedeckung` verlangt dafuer eine Entscheidung.",
      },
    ],
  },
  {
    key: "beleg-freigeben",
    name: "Eine Kundenarbeit oeffentlich nennen duerfen",
    schritte: [
      {
        was: "Abnahme und Umfang dokumentieren",
        rollen: ["vertrieb"],
        ownerGebundenDurch: null,
        weil: "Dokumentieren ist Nachhalten.",
      },
      {
        was: "Die schriftliche Freigabe einholen und eintragen",
        rollen: [],
        ownerGebundenDurch: "G13",
        weil:
          "Eine Freigabe entsteht aus einem unterschriebenen Dokument, nicht aus einer " +
          "Abnahme. `deckung` prueft, ob sie den Umfang traegt.",
      },
    ],
  },
  {
    key: "rechnung-stellen",
    name: "Eine Rechnung stellen",
    schritte: [
      {
        was: "Positionen aus Angebot und Lieferung zusammenstellen",
        rollen: ["vertrieb"],
        ownerGebundenDurch: null,
        weil: "Zusammenstellen ist Rechnen, kein Fordern.",
      },
      {
        was: "Die Rechnung stellen",
        rollen: [],
        ownerGebundenDurch: "G18",
        weil:
          "Eine Rechnung ist eine Forderung. `stellbarkeit` verlangt eine Entscheidung und " +
          "einen geklaerten Umsatzsteuer-Status.",
      },
    ],
  },
]

/* ── Wer die Rolle wirklich traegt ──────────────────────────────────────── */

/**
 * DIE BESETZUNG — und warum sie NICHT aus der Umgebung kommt.
 *
 * ---------------------------------------------------------------------------
 * DER FEHLER, DER HIER STAND
 *
 * Bis zum 09.09.2026 galt eine Rolle als besetzt, sobald ihre
 * Passwort-Variable gesetzt war (`vergebeneRollen()` aus G32). Damit machte
 * EINE Umgebungsvariable den Vertrag „erfuellt" — und die Ausgabe meldete
 * „Fuer 1 von 5 Ablaeufen ist der Owner ersetzbar".
 *
 * Das ist falsch, und der Vertrag sagt es woertlich. `creadig-1-0-scale.md`
 * fuehrt Satz 10 so:
 *
 *     „Der Owner ist ersetzbar fuer EINEN Ablauf | pruefbar an: erste Rolle
 *      BESETZT"
 *
 * Und die Frage, aus der der Satz stammt, steht zwei Abschnitte darueber:
 * „Wer antwortet, wenn du im Urlaub bist?" — beantwortet mit „Vertretung
 * organisieren (Sub, Partner)". Das ist ein MENSCH, kein Zugang.
 *
 * ---------------------------------------------------------------------------
 * DREI STUFEN, NICHT ZWEI
 *
 *   moeglich   Die Rolle existiert in G32. Gilt immer.
 *   zugang     Ihre Passwort-Variable ist gesetzt. Das beweist, dass sich ein
 *              zweiter Mensch ANMELDEN koennte — mehr nicht. Genau diesen
 *              Unterschied haelt G32 selbst schon: „moeglich, aber nicht
 *              eingerichtet".
 *   besetzt    Ein benannter Mensch traegt die Rolle. Das ist ein
 *              Owner-Fakt und steht hier als Register — leer.
 *
 * Ein Zugang ohne Menschen ist ein offenes Schloss vor einem leeren Raum.
 * Wer ihn als Besetzung zaehlt, hat die Vertretungsfrage mit einem Passwort
 * beantwortet.
 */
export type Besetzung = {
  rolle: Exclude<Rolle, "owner">
  /** Der Mensch, der die Rolle traegt. `null` heisst: niemand. */
  mensch: string | null
  /** Seit wann. ISO-Tag, `null` solange niemand sie traegt. */
  seit: string | null
}

/**
 * DER BESTAND — leer, und das ist die wahre Angabe.
 *
 * Kein Name wird hier erfunden. Ein erfundener Mitarbeiter waere die
 * schlimmste Sorte Fake-Green: Er beantwortet die Urlaubsfrage mit einer
 * Person, die im Urlaubsfall nicht existiert.
 */
export const BESETZUNGEN: readonly Besetzung[] = [
  { rolle: "vertrieb", mensch: null, seit: null },
  { rolle: "redaktion", mensch: null, seit: null },
]

export type Rollenstand = "besetzt" | "nur-zugang" | "leer"

/**
 * Wie es um eine Rolle steht — beide Fragen, getrennt.
 *
 * `nur-zugang` ist der Zustand, den die alte Fassung mit `besetzt`
 * verwechselt hat. Er bekommt einen eigenen Namen, damit ihn niemand mehr
 * fuer das eine oder das andere haelt.
 */
export function rollenstand(
  rolle: Exclude<Rolle, "owner">,
  env: Record<string, string | undefined> = process.env,
  besetzungen: readonly Besetzung[] = BESETZUNGEN,
): Rollenstand {
  const zugang = vergebeneRollen(env).includes(rolle)
  const mensch = besetzungen.find((b) => b.rolle === rolle)?.mensch ?? null
  if (mensch && zugang) return "besetzt"
  if (zugang) return "nur-zugang"
  return "leer"
}

/* ── Die Lage je Ablauf ─────────────────────────────────────────────────── */

export type Lage = "ersetzbar" | "nur-zugang" | "nicht-besetzt" | "owner-gebunden"

export type Ersetzbarkeit = {
  lage: Lage
  satz: string
  /** Die Schritte, die einem Menschen vorbehalten sind — mit ihrem Gate. */
  ownerSchritte: readonly { was: string; gate: string }[]
  /** Rollen, die der Ablauf braucht und die kein Mensch traegt. */
  fehlendeRollen: readonly Rolle[]
  /** Rollen mit Zugang, aber ohne Menschen. Ein offenes Schloss vor einem leeren Raum. */
  nurZugang: readonly Rolle[]
  /**
   * Wohin die Arbeit faellt, solange sie niemand traegt.
   *
   * Immer gesetzt, wenn nicht ersetzbar. Eine nicht besetzte Rolle laesst
   * die Arbeit nicht verschwinden — sie faellt zurueck an den Owner, und
   * genau das soll dastehen statt stillzubleiben.
   */
  eskalation: string | null
}

export function ersetzbarkeit(
  ablauf: Ablauf,
  env: Record<string, string | undefined> = process.env,
  besetzungen: readonly Besetzung[] = BESETZUNGEN,
): Ersetzbarkeit {
  const ownerSchritte = ablauf.schritte
    .filter((s) => s.ownerGebundenDurch !== null)
    .map((s) => ({ was: s.was, gate: s.ownerGebundenDurch as string }))

  const gebraucht = [...new Set(ablauf.schritte.flatMap((s) => s.rollen))]
  const stand = new Map(gebraucht.map((r) => [r, rollenstand(r, env, besetzungen)]))
  const fehlendeRollen = gebraucht.filter((r) => stand.get(r) === "leer")
  const nurZugang = gebraucht.filter((r) => stand.get(r) === "nur-zugang")

  /*
   * DIE OWNER-BINDUNG WIRD ZUERST GEPRUEFT — und sie ueberstimmt alles.
   *
   * Waere die Reihenfolge umgekehrt, kaeme ein Ablauf mit besetzten Rollen
   * als „ersetzbar" heraus, obwohl ein Schritt darin einem Menschen gehoert.
   * Das waere die teuerste Falschmeldung, die dieses Modul machen kann.
   */
  if (ownerSchritte.length > 0) {
    return {
      lage: "owner-gebunden",
      satz:
        `Nicht ersetzbar, und das ist richtig: ${ownerSchritte.length} Schritt(e) gehoeren einem ` +
        `Menschen (${ownerSchritte.map((s) => s.gate).join(", ")}). Der Rest des Ablaufs ist ` +
        "delegierbar.",
      ownerSchritte,
      fehlendeRollen,
      nurZugang,
      eskalation: null,
    }
  }

  const eskalation =
    "Bis dahin macht es der Owner. Die Arbeit verschwindet nicht, weil die Rolle leer ist."

  if (fehlendeRollen.length > 0) {
    return {
      lage: "nicht-besetzt",
      satz:
        `Delegierbar, aber niemand traegt ihn: ${fehlendeRollen.map((r) => ROLLEN[r].label).join(", ")} ` +
        "ist nicht besetzt. Dazu gehoeren zwei Dinge, und das Passwort ist das kleinere: ein " +
        `Mensch in \`BESETZUNGEN\` und der Zugang (${fehlendeRollen
          .map((r) => ROLLEN[r].variable)
          .join(" bzw. ")}).`,
      ownerSchritte,
      fehlendeRollen,
      nurZugang,
      eskalation,
    }
  }

  /*
   * ZUGANG IST KEINE BESETZUNG.
   *
   * Dieser Zweig ist der ganze Grund, warum es drei Stufen gibt. Vorher fiel
   * er mit „ersetzbar" zusammen, und damit machte eine gesetzte
   * Umgebungsvariable den Vertrag „erfuellt". Die Vertretungsfrage lautet
   * aber „Wer antwortet, wenn du im Urlaub bist?" — und ein Passwort
   * antwortet nicht.
   */
  if (nurZugang.length > 0) {
    return {
      lage: "nur-zugang",
      satz:
        `Der Zugang steht, der Mensch fehlt: ${nurZugang.map((r) => ROLLEN[r].label).join(", ")} ` +
        "hat ein Passwort, aber niemanden. Ein offenes Schloss vor einem leeren Raum — im " +
        "Urlaubsfall antwortet trotzdem niemand.",
      ownerSchritte,
      fehlendeRollen,
      nurZugang,
      eskalation,
    }
  }

  return {
    lage: "ersetzbar",
    satz:
      `Ersetzbar: getragen von ${gebraucht
        .map((r) => `${ROLLEN[r].label} (${besetzungen.find((b) => b.rolle === r)?.mensch})`)
        .join(", ")}.`,
    ownerSchritte,
    fehlendeRollen,
    nurZugang,
    eskalation: null,
  }
}

/* ── Der Satz, den G33 beantworten soll ─────────────────────────────────── */

export type Ersatzlage = {
  /**
   * Der Vertrag, woertlich: „Der Owner ist ersetzbar fuer EINEN Ablauf —
   * pruefbar an: erste Rolle BESETZT" (`docs/roadmap/creadig-1-0-scale.md`).
   *
   * Besetzt heisst: ein benannter Mensch. Eine gesetzte Passwort-Variable
   * erfuellt diesen Satz nicht.
   */
  erfuellt: boolean
  ersetzbar: readonly string[]
  /** Zugang da, Mensch fehlt. Zaehlt NICHT als erfuellt. */
  nurZugang: readonly string[]
  nichtBesetzt: readonly string[]
  ownerGebunden: readonly string[]
  satz: string
}

export function ersatzlage(
  env: Record<string, string | undefined> = process.env,
  besetzungen: readonly Besetzung[] = BESETZUNGEN,
): Ersatzlage {
  const je = ABLAEUFE.map((a) => ({ a, e: ersetzbarkeit(a, env, besetzungen) }))
  const ersetzbar = je.filter((x) => x.e.lage === "ersetzbar").map((x) => x.a.key)
  const nurZugang = je.filter((x) => x.e.lage === "nur-zugang").map((x) => x.a.key)
  const nichtBesetzt = je.filter((x) => x.e.lage === "nicht-besetzt").map((x) => x.a.key)
  const ownerGebunden = je.filter((x) => x.e.lage === "owner-gebunden").map((x) => x.a.key)

  const erfuellt = ersetzbar.length >= 1
  const zugangssatz =
    nurZugang.length > 0
      ? ` ${nurZugang.length} haette(n) den Zugang, aber keinen Menschen — das zaehlt nicht.`
      : ""
  return {
    erfuellt,
    ersetzbar,
    nurZugang,
    nichtBesetzt,
    ownerGebunden,
    satz: erfuellt
      ? `Fuer ${ersetzbar.length} von ${ABLAEUFE.length} Ablaeufen ist der Owner ersetzbar. ` +
        "Das ist eine Aussage ueber die Besetzung, nicht ueber einen gelaufenen Fall." +
        zugangssatz
      : `Fuer keinen der ${ABLAEUFE.length} Ablaeufe ist der Owner heute ersetzbar. ` +
        `${nichtBesetzt.length + nurZugang.length} waere(n) es mit einem Menschen in der Rolle; ` +
        `${ownerGebunden.length} sollen es nie sein.` +
        zugangssatz,
  }
}

/**
 * Was dieser Befund NICHT sagt.
 *
 * Er steht neben jeder Ausgabe, weil „Owner ersetzbar" der Satz ist, den
 * jemand aus dem Zusammenhang zitiert.
 */
export const SAGT_NICHTS_UEBER = [
  "Nicht, dass es jemand getan hat. Eingerichtet und gelaufen sind zwei Dinge.",
  "Nicht, dass der Owner entbehrlich ist. Die gebundenen Schritte bleiben gebunden.",
  "Nicht ueber Qualitaet. Wer eine Rolle besetzt, kann sie schlecht ausfuellen.",
  "Nicht ueber Urlaubsfaehigkeit. Ein Ablauf ist kein Unternehmen.",
  "Nicht, dass ein Zugang jemanden vertritt. Ein Passwort antwortet niemandem.",
]
