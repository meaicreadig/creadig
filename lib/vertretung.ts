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

/* ── Die Lage je Ablauf ─────────────────────────────────────────────────── */

export type Lage = "ersetzbar" | "nicht-besetzt" | "owner-gebunden"

export type Ersetzbarkeit = {
  lage: Lage
  satz: string
  /** Die Schritte, die einem Menschen vorbehalten sind — mit ihrem Gate. */
  ownerSchritte: readonly { was: string; gate: string }[]
  /** Rollen, die der Ablauf braucht und die niemand hat. */
  fehlendeRollen: readonly Rolle[]
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
): Ersetzbarkeit {
  const ownerSchritte = ablauf.schritte
    .filter((s) => s.ownerGebundenDurch !== null)
    .map((s) => ({ was: s.was, gate: s.ownerGebundenDurch as string }))

  const vergeben = vergebeneRollen(env)
  const gebraucht = [...new Set(ablauf.schritte.flatMap((s) => s.rollen))]
  const fehlendeRollen = gebraucht.filter((r) => !vergeben.includes(r))

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
      eskalation: null,
    }
  }

  if (fehlendeRollen.length > 0) {
    return {
      lage: "nicht-besetzt",
      satz:
        `Delegierbar, aber niemand traegt ihn: ${fehlendeRollen.map((r) => ROLLEN[r].label).join(", ")} ` +
        `ist nicht besetzt. Einrichten heisst ${fehlendeRollen
          .map((r) => ROLLEN[r].variable)
          .join(" bzw. ")} setzen — ohne Codeaenderung.`,
      ownerSchritte,
      fehlendeRollen,
      eskalation:
        "Bis dahin macht es der Owner. Die Arbeit verschwindet nicht, weil die Rolle leer ist.",
    }
  }

  return {
    lage: "ersetzbar",
    satz: `Ersetzbar: getragen von ${gebraucht.map((r) => ROLLEN[r].label).join(", ")}.`,
    ownerSchritte,
    fehlendeRollen,
    eskalation: null,
  }
}

/* ── Der Satz, den G33 beantworten soll ─────────────────────────────────── */

export type Ersatzlage = {
  /** Der Vertrag: fuer EINEN Ablauf ersetzbar. */
  erfuellt: boolean
  ersetzbar: readonly string[]
  nichtBesetzt: readonly string[]
  ownerGebunden: readonly string[]
  satz: string
}

export function ersatzlage(env: Record<string, string | undefined> = process.env): Ersatzlage {
  const je = ABLAEUFE.map((a) => ({ a, e: ersetzbarkeit(a, env) }))
  const ersetzbar = je.filter((x) => x.e.lage === "ersetzbar").map((x) => x.a.key)
  const nichtBesetzt = je.filter((x) => x.e.lage === "nicht-besetzt").map((x) => x.a.key)
  const ownerGebunden = je.filter((x) => x.e.lage === "owner-gebunden").map((x) => x.a.key)

  const erfuellt = ersetzbar.length >= 1
  return {
    erfuellt,
    ersetzbar,
    nichtBesetzt,
    ownerGebunden,
    satz: erfuellt
      ? `Fuer ${ersetzbar.length} von ${ABLAEUFE.length} Ablaeufen ist der Owner ersetzbar. ` +
        "Das ist eine Aussage ueber die Einrichtung, nicht ueber einen gelaufenen Fall."
      : `Fuer keinen der ${ABLAEUFE.length} Ablaeufe ist der Owner heute ersetzbar. ` +
        `${nichtBesetzt.length} waeren es, wenn die Rolle besetzt waere; ` +
        `${ownerGebunden.length} sollen es nie sein.`,
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
]
