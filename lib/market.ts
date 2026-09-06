/*
 * ==========================================================================
 * ZIELBILD — WEN SUCHT creaDIG, UND WEN NICHT?
 * ==========================================================================
 *
 * WAS DIE EIGENEN KUNDEN SAGEN
 *
 * Neunzehn belegte Kunden. Ausgewertet am 06.09.2026:
 *
 *   Handwerksbetriebe darunter:      0
 *   Groesste Branchenhaeufung:       3x Freenet — aber das ist EINE
 *                                    Franchise-Beziehung in drei Laeden
 *   Zweitgroesste:                   2x Gastronomie
 *   Orte:                            5x Osnabrueck, 12 von 16 bekannten
 *                                    Orten im Band Osnabrueck–Bielefeld–
 *                                    Muensterland–Oldenburger Muensterland
 *
 * Daraus folgt etwas Unbequemes: Die Branche sagt nichts vorher. Keine
 * einzige Branche kommt dreimal unabhaengig vor. Was dreimal vorkommt, ist
 * NAEHE — und dahinter Beziehung.
 *
 * Die Handwerk-Ausrichtung des Hauses — die Branchenseite, das
 * „Website-Paket Handwerk", der Pilotpreis je Gewerk — hat damit NULL
 * historische Belege. Das macht sie nicht falsch. Es macht sie zu einer
 * Hypothese, und sie steht als solche im Register unten.
 *
 * ---------------------------------------------------------------------------
 * WAS STATTDESSEN ENTSCHEIDET
 *
 * Wenn die Branche nichts vorhersagt, muss etwas Beobachtbares an ihre
 * Stelle treten. Das gibt es bereits: die fuenf Umfangstreiber aus Gate 05.
 * Sie beschreiben keinen Wirtschaftszweig, sondern einen BETRIEBSZUSTAND —
 * und genau den baut creaDIG um.
 *
 * ---------------------------------------------------------------------------
 * VIER ACHSEN, DIE NIE ZU EINER ZAHL WERDEN
 *
 * Ein Betrieb kann passen und unerreichbar sein. Er kann erreichbar sein und
 * kein Geld haben. Er kann beides haben, und wir koennen ihn heute nicht
 * bedienen. Wer daraus eine Punktzahl macht, verliert genau die
 * Unterscheidung, die die Entscheidung traegt.
 *
 *   PASSUNG        Hat der Betrieb das Problem, das wir loesen?
 *   KAUFKRAFT      Traegt die Sache kaufmaennisch?
 *   ZUGANG         Kommen wir ehrlich an ihn heran?
 *   BEDIENBARKEIT  Koennen wir ihn HEUTE bedienen?
 *
 * Jede Achse wird einzeln beantwortet und einzeln begruendet.
 */

/* ── Beobachtbare Betriebszustaende ─────────────────────────────────────── */

export type SignalKey =
  | "mehrere-standorte"
  | "aussendienst"
  | "getrennte-systeme"
  | "mehrfacherfassung"
  | "koordination-ueber-chat"
  | "inhaber-als-schnittstelle"
  | "kein-statusbild"
  | "wiederkehrende-handarbeit"
  | "wissen-in-koepfen"

export type Signal = {
  label: string
  /** Woran man es von aussen sieht — G10 sammelt genau das. */
  evidence: string
  /** Welche Ebene der Problemkarte beruehrt ist. Keine Reihenfolge, keine Stufe. */
  ebene: "Identity" | "Digital" | "Operations" | "Automation" | "Intelligence"
}

export const SIGNALS: Record<SignalKey, Signal> = {
  "mehrere-standorte": {
    label: "Mehrere Standorte oder Teams",
    evidence: "Impressum, Standortseite, Google-Einträge, Stellenanzeigen mit verschiedenen Orten",
    ebene: "Operations",
  },
  aussendienst: {
    label: "Arbeit findet draußen statt",
    evidence: "Montage, Baustelle, Pflege vor Ort, Lieferung, Außendienst — sichtbar in Leistungsbeschreibung und Stellenanzeigen",
    ebene: "Operations",
  },
  "getrennte-systeme": {
    label: "Mehrere Programme, die nichts voneinander wissen",
    evidence: "Stellenanzeige nennt drei Werkzeuge nebeneinander; Kundenportal getrennt vom Shop; zwei Buchungswege",
    ebene: "Digital",
  },
  mehrfacherfassung: {
    label: "Dieselben Daten werden mehrfach eingetragen",
    evidence: "Formular verlangt Angaben, die der Betrieb schon hat; Anfrage per Mail UND Formular UND Telefon",
    ebene: "Operations",
  },
  "koordination-ueber-chat": {
    label: "Der Betrieb koordiniert über WhatsApp, Mail oder Zettel",
    evidence: "WhatsApp als Hauptkontakt; Stellenanzeige nennt „Organisationstalent“ statt eines Systems",
    ebene: "Operations",
  },
  "inhaber-als-schnittstelle": {
    label: "Der Inhaber ist die Verbindung zwischen allem",
    evidence: "Eine Person in allen Kontaktwegen; Impressum, Angebot und Rückruf laufen über denselben Namen",
    ebene: "Operations",
  },
  "kein-statusbild": {
    label: "Kunden sehen ihren Stand nicht",
    evidence: "Keine Auftragsverfolgung, keine Terminbestätigung, „wir melden uns“ ohne Weg",
    ebene: "Digital",
  },
  "wiederkehrende-handarbeit": {
    label: "Dieselbe Arbeit läuft immer wieder von Hand",
    evidence: "Angebote, Nachweise, Zeiten, Berichte — in Stellenanzeigen als „Erstellung von…“ beschrieben",
    ebene: "Automation",
  },
  "wissen-in-koepfen": {
    label: "Betriebswissen hängt an Personen",
    evidence: "„langjährige Mitarbeiter“ als Alleinstellungsmerkmal; keine Dokumentation nach außen sichtbar",
    ebene: "Intelligence",
  },
}

/* ── Ausschluesse ───────────────────────────────────────────────────────── */

export type Exclusion = {
  key: string
  label: string
  /** hart = nie; weich = melden, nicht aussortieren. */
  hard: boolean
  why: string
}

export const EXCLUSIONS: Exclusion[] = [
  {
    key: "reine-ware",
    label: "Es geht nur um ein Einzelstück ohne Betriebsbezug",
    hard: true,
    why: "Ein Logo, ein Flyer, eine Visitenkarte. creaDIG baut Systeme; eine reine Gestaltungsware ist ein anderes Geschäft und bindet dieselbe Zeit.",
  },
  {
    key: "kein-betriebsproblem",
    label: "Kein einziges beobachtbares Betriebssignal",
    hard: true,
    why: "Ohne Problem gibt es nichts zu bauen. Ein Betrieb ohne Reibung braucht uns nicht — das ist keine Kritik an ihm.",
  },
  {
    key: "unbedienbare-region",
    label: "Außerhalb dessen, was heute rechtlich und kaufmännisch bedienbar ist",
    hard: false,
    why: "Weich, nicht hart: Die Schweiz ist mit zwei Kunden belegt, aber die Rechnungs- und Rechtslage klärt erst G35. Melden, nicht wegwerfen.",
  },
  {
    key: "kein-veraenderungswille",
    label: "Der Betrieb will den Ablauf nicht ändern",
    hard: false,
    why: "Ein System, das niemand benutzen will, ist verbranntes Geld — für beide. Aber das erkennt man erst im Gespräch, nicht in einer Recherche.",
  },
  {
    key: "unter-wirtschaftlichkeit",
    label: "Unterhalb dessen, was ein Projekt tragen muss",
    hard: false,
    why: "Weich, weil die Schwelle noch nicht belegt ist — G23 rechnet sie aus. Bis dahin ist es ein Hinweis, keine Absage.",
  },
]

/* ── Die vier Achsen ────────────────────────────────────────────────────── */

export type Urteil = "passend" | "unklar" | "unpassend"

export type Evidence = {
  /** Beobachtete Signale — je Schluessel die Quelle. Ohne Quelle zaehlt es nicht. */
  signals: Partial<Record<SignalKey, string>>
  /** Zutreffende Ausschluesse. */
  exclusions: string[]
  /** Gibt es einen ehrlichen Weg hin? `null` = nicht recherchiert. */
  zugang: "empfehlung" | "netzwerk" | "eingehend" | "bestandskunde" | "keiner" | null
  /** Heute bedienbar? `null` = nicht geprueft. */
  bedienbar: boolean | null
  /** Kaufmaennisch tragfaehig? `null` = unbekannt, und das ist der Normalfall. */
  kaufkraft: boolean | null
}

export type Achse = { urteil: Urteil; gruende: string[] }
export type Einordnung = {
  passung: Achse
  zugang: Achse
  bedienbarkeit: Achse
  kaufkraft: Achse
  /** Was zuerst zu tun ist — nie eine Zahl, immer ein Satz. */
  naechstes: string
}

/**
 * Ordnet einen Betrieb ein.
 *
 * Deterministisch, erklaerbar, ohne Punktzahl. Jede Achse traegt ihre
 * Gruende im Klartext — wer widerspricht, widerspricht einem Satz und nicht
 * einer Zahl.
 *
 * ZWEI SIGNALE, NICHT EINES. Ein einzelnes Signal hat fast jeder Betrieb;
 * daraus „passend" zu machen hiesse, dass jeder passt — und ein Zielbild,
 * das niemanden ausschliesst, ist keins. Zwei unabhaengige Signale sind der
 * Punkt, an dem aus Reibung ein System wird.
 */
export function classify(e: Evidence): Einordnung {
  const belegt = (Object.keys(e.signals) as SignalKey[]).filter((k) => e.signals[k])
  const hart = EXCLUSIONS.filter((x) => x.hard && e.exclusions.includes(x.key))
  const weich = EXCLUSIONS.filter((x) => !x.hard && e.exclusions.includes(x.key))

  /* ── Passung ── */
  let passung: Achse
  if (hart.length) {
    passung = { urteil: "unpassend", gruende: hart.map((x) => `✗ ${x.label}`) }
  } else if (belegt.length >= 2) {
    passung = {
      urteil: "passend",
      gruende: belegt.map((k) => `✓ ${SIGNALS[k].label} — ${e.signals[k]}`),
    }
  } else if (belegt.length === 1) {
    passung = {
      urteil: "unklar",
      gruende: [
        `✓ ${SIGNALS[belegt[0]!].label} — ${e.signals[belegt[0]!]}`,
        "? ein einzelnes Signal trägt kein Systemprojekt — zweites suchen oder erfragen",
      ],
    }
  } else {
    passung = { urteil: "unklar", gruende: ["? kein Betriebssignal recherchiert"] }
  }
  for (const x of weich) passung.gruende.push(`! ${x.label} — ${x.why}`)

  /* ── Zugang: eine EIGENE Frage. Ein passender Betrieb ohne Weg bleibt passend. ── */
  const zugang: Achse =
    e.zugang === null
      ? { urteil: "unklar", gruende: ["? Zugangsweg nicht recherchiert"] }
      : e.zugang === "keiner"
        ? {
            urteil: "unpassend",
            gruende: [
              "✗ kein ehrlicher Weg hin — kein gemeinsamer Dritter, keine Empfehlung, kein Anlass",
              "! Kaltakquise ist ausgeschlossen (Grundregel des Hauses), nicht bloß unerwünscht",
            ],
          }
        : { urteil: "passend", gruende: [`✓ Zugang über ${e.zugang}`] }

  /* ── Bedienbarkeit: koennen WIR, nicht will ER. ── */
  const bedienbarkeit: Achse =
    e.bedienbar === null
      ? { urteil: "unklar", gruende: ["? nicht geprüft, ob heute bedienbar"] }
      : e.bedienbar
        ? { urteil: "passend", gruende: ["✓ heute bedienbar"] }
        : { urteil: "unklar", gruende: ["! heute nicht bedienbar — später prüfen, nicht verwerfen"] }

  /* ── Kaufkraft: unbekannt ist der Normalfall und bleibt es. ── */
  const kaufkraft: Achse =
    e.kaufkraft === null
      ? { urteil: "unklar", gruende: ["? kaufmännische Tragfähigkeit unbekannt — klärt sich im Gespräch"] }
      : e.kaufkraft
        ? { urteil: "passend", gruende: ["✓ belegt tragfähig"] }
        : { urteil: "unpassend", gruende: ["✗ belegt nicht tragfähig"] }

  /* ── Was zuerst zu tun ist ── */
  const naechstes =
    passung.urteil === "unpassend"
      ? "Nicht weiterverfolgen. Grund steht bei der Passung."
      : zugang.urteil === "unpassend"
        ? "Passend, aber kein Weg hin. Zurückstellen, bis sich ein gemeinsamer Dritter findet."
        : passung.urteil === "unklar"
          ? "Zweites Betriebssignal suchen — erst dann lohnt ein Gespräch."
          : zugang.urteil === "unklar"
            ? "Passung steht. Jetzt den Zugangsweg klären."
            : "Passung und Zugang stehen. Ansprache vorbereiten (G11)."

  return { passung, zugang, bedienbarkeit, kaufkraft, naechstes }
}

/* ========================================================================== *
 * HYPOTHESEN-REGISTER
 * ==========================================================================
 *
 * Der Zweck: Eine Annahme, die lange genug unwidersprochen dasteht, wird zur
 * Firmenwahrheit — ohne dass jemand sie je geprueft haette. Genau das ist mit
 * „Handwerk" passiert: Die Branchenseite, das Paket und der Pilotpreis je
 * Gewerk sind darauf gebaut, und unter neunzehn Kunden ist kein einziger
 * Handwerksbetrieb.
 *
 * Deshalb steht jede Annahme hier mit ihrem Gegenbeleg daneben.
 */

export type HypothesisStatus = "ungeprueft" | "schwach" | "gestuetzt" | "widerlegt"

export type Hypothesis = {
  key: string
  satz: string
  beleg: string
  gegenbeleg: string
  status: HypothesisStatus
  pruefen: string
}

export const HYPOTHESES: Hypothesis[] = [
  {
    key: "handwerk",
    satz: "Handwerksbetriebe mit 5–50 Mitarbeitern sind der Kernmarkt.",
    beleg:
      "Die Betriebszustände passen: Außendienst, Mehrfacherfassung, Koordination über Zettel. " +
      "Das Angebot ist darauf gebaut (Branchenseite, Website-Paket, Pilotpreis je Gewerk).",
    gegenbeleg:
      "NULL von 19 Kunden ist ein Handwerksbetrieb. Kein einziger Verkauf stützt die Annahme. " +
      "Die 5–50-Spanne stammt aus `docs/sales/offers.md` und ist ebenfalls unbelegt.",
    status: "ungeprueft",
    pruefen: "Der erste verkaufte Handwerksbetrieb entscheidet — bis dahin bleibt es eine Wette, keine Strategie.",
  },
  {
    key: "naehe",
    satz: "Nähe ist der stärkste Vorhersager — nicht die Branche.",
    beleg:
      "5x Osnabrück; 12 der 16 bekannten Orte liegen im Band Osnabrück–Bielefeld–Münsterland–" +
      "Oldenburger Münsterland. Keine Branche kommt dreimal unabhängig vor.",
    gegenbeleg:
      "Zwei Schweizer Kunden (Luzern, Basel) und einer in Bergkamen liegen außerhalb. " +
      "Nähe könnte auch bloß beschreiben, wo der Eigentümer Menschen kennt — dann ist es Zugang, nicht Markt.",
    status: "gestuetzt",
    pruefen: "Ob Nähe oder Beziehung wirkt, trennt sich erst an einem Kunden, den niemand vermittelt hat.",
  },
  {
    key: "branche",
    satz: "Die Branche sagt die Passung voraus.",
    beleg: "3x Telekommunikationshandel, 3x Gastronomie/Catering.",
    gegenbeleg:
      "Die drei Freenet-Läden sind EINE Franchise-Beziehung in drei Filialen, kein Branchenmuster. " +
      "Bleiben 2x Gastronomie über zwei Länder. Zwölf Branchen für 19 Kunden.",
    status: "widerlegt",
    pruefen: "Erledigt. Deshalb ordnet dieses Modell nach Betriebszustand ein, nicht nach Wirtschaftszweig.",
  },
  {
    key: "tr-de",
    satz: "Die türkisch-deutsche Diaspora ist ein Zielsegment.",
    beleg: "Zwei Bielefelder Kunden (Verein, Integrationsrat), zwei Ärzte als Prospects, vier Sprachen auf der Seite.",
    gegenbeleg:
      "Ein Verein und ein kommunales Gremium teilen keinen BETRIEBSZUSTAND — nur eine Sprache. " +
      "Sprache beschreibt, WIE man jemanden erreicht, nicht OB er das Problem hat.",
    status: "widerlegt",
    pruefen:
      "Als Segment erledigt. Bleibt als ZUGANGSVORTEIL — und dort ist er echt: " +
      "vier Sprachen und Vertrauen sind ein Weg hinein, den Mitbewerber nicht haben.",
  },
  {
    key: "mehrstandort",
    satz: "Betriebe mit mehreren Standorten passen besonders gut.",
    beleg: "Vegitat (4 Standorte) und Freenet (3 Läden) sind die zwei größten Belege im Bestand.",
    gegenbeleg: "Zwei von 19. Das ist eine Beobachtung, kein Muster.",
    status: "schwach",
    pruefen: "Drei unabhängige Mehrstandort-Kunden machen daraus ein Muster.",
  },
  {
    key: "schweiz",
    satz: "Die Schweiz ist ein echter Markt, kein Zufall.",
    beleg: "Vegitat (Luzern/Basel/Zürich), Kids Catering Basel, NV Swiss. CASSAMEA ist CH, meAI ist DE & CH.",
    gegenbeleg: "Rechnungs- und Rechtslage für CH ist ungeklärt (G35). Verkaufen könnten wir heute nicht sauber.",
    status: "gestuetzt",
    pruefen: "G35 entscheidet die Bedienbarkeit. Die Nachfrage ist belegt.",
  },
]
