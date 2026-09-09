/**
 * G32 · ROLLEN, RECHTE & UEBERGABEN — ein zweiter Mensch, der nicht alles sieht.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DER GATE-VERTRAG
 *
 *     „Heute ein Mensch, ein Passwort. Ziel: ein zweiter Mensch kann
 *      arbeiten, OHNE ALLES ZU SEHEN."
 *
 * Gemessen am 09.09.2026 stimmte beides:
 *
 *   · Ein Passwort (`ADMIN_PASSWORD`), eine Sitzung.
 *   · Die Sitzung traegt KEINE Identitaet. `verifySession()` gibt
 *     „ok" zurueck — nicht WER.
 *   · Fuenfzehn Flaechen, und `middleware.ts` fragt nur: angemeldet oder
 *     nicht. Wer hereinkommt, sieht die Pipeline, die Recherche, die
 *     Verlustgruende und jede Kundenakte.
 *
 * Ein zweiter Mensch konnte deshalb nicht arbeiten, ohne alles zu sehen.
 * Nicht, weil es verboten war — weil es die Unterscheidung nicht gab.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS DIESE DATEI TUT — UND WAS SIE AUSDRUECKLICH NICHT TUT
 *
 * SIE LEGT KEIN KONTO AN und fasst kein Passwort an. Zugangsdaten entstehen
 * nicht in einem Repository; sie entstehen dort, wo sie hingehoeren, und
 * werden als Umgebungsvariable gesetzt. Hier steht nur der NAME der
 * Variablen, nie ein Wert.
 *
 * Was sie tut: Sie trennt die Flaechen nach dem, was sie TRAGEN, und sagt
 * je Rolle, welche davon sie betreten darf. Der zweite Mensch ist damit
 * moeglich, sobald der Owner ihm eine Zugangsvariable setzt — ohne dass
 * dafuer eine Zeile Code geaendert werden muss.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE REGEL, DIE ALLES TRAEGT: VERBOT ALS VOREINSTELLUNG
 *
 * `darfBetreten()` antwortet auf eine unbekannte Flaeche mit NEIN. Das ist
 * die einzige Voreinstellung, bei der Vergesslichkeit zur sicheren Seite
 * faellt: Wer eine neue Admin-Seite baut und sie nicht eintraegt, bekommt
 * eine gesperrte Seite — nicht eine offene.
 *
 * Die andere Richtung waere die gefaehrliche: Eine neue Seite, die
 * standardmaessig fuer alle offen ist, faellt niemandem auf, weil sie
 * funktioniert.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * UND DIE ZWEITE: DIE OBERFLAECHE IST NICHT DIE SICHERUNG
 *
 * Ein Menuepunkt, den man ausblendet, ist keine Sperre — die Adresse
 * funktioniert weiter. Durchgesetzt wird in `middleware.ts`, VOR der Seite.
 * `check-rollen.mjs` bricht ab, wenn die Middleware diese Datei nicht mehr
 * fragt.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · WAS EINE FLAECHE TRAEGT
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Die Datenklasse einer Flaeche — nicht ihr Thema.
 *
 * Der Unterschied entscheidet die Rechte: „Vertrieb" ist ein Thema,
 * „Personendaten Dritter" ist eine Klasse. Wer nach Themen schneidet,
 * gibt frueher oder spaeter jemandem eine Kundenakte, weil sie thematisch
 * zu seiner Arbeit passte.
 */
export const KLASSEN = {
  "fremde-personen": {
    label: "Personendaten Dritter",
    was: "Namen, Adressen, Nachrichten von Menschen ausserhalb des Hauses.",
    /* Die engste Klasse. Wer sie nicht braucht, bekommt sie nicht. */
    eng: true,
  },
  "eigene-lage": {
    label: "Eigene Lage",
    was: "Materialstand, Produkte, Zielbild — Aussagen ueber dieses Haus.",
    eng: false,
  },
  einstieg: {
    label: "Einstieg",
    was: "Anmeldung und Uebersicht. Traegt selbst nichts.",
    eng: false,
  },
} as const

export type Klasse = keyof typeof KLASSEN

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DIE ROLLEN
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Drei Rollen, und jede sagt auch, was sie NICHT sieht.
 *
 * Der zweite Teil ist der wichtigere — er ist der Grund, warum es die Rolle
 * gibt. Eine Rolle, die nur auflistet, was sie darf, wird beim naechsten
 * Wunsch erweitert; eine, die begruendet, was sie nicht darf, muss man
 * widerlegen.
 */
export const ROLLEN = {
  owner: {
    label: "Owner",
    sieht: "alles.",
    siehtNicht: "—",
    /**
     * Die Umgebungsvariable, deren Wert diese Rolle vergibt. NUR DER NAME.
     * Ein Wert stuende hier nie; er gehoert in die Umgebung.
     */
    variable: "ADMIN_PASSWORD",
  },
  vertrieb: {
    label: "Vertrieb",
    sieht: "Anfragen, Pipeline, Beziehungen, Recherche, Verluste, Kundenakten.",
    siehtNicht:
      "den Materialstand. Er ist die Innensicht des Hauses — offene Owner-Punkte, " +
      "Luecken, unbelegte Zusagen. Wer verkauft, braucht sie nicht, und sie liest sich " +
      "vor einem Gespraech falsch.",
    variable: "ADMIN_PASSWORD_VERTRIEB",
  },
  redaktion: {
    label: "Redaktion",
    sieht: "den Materialstand — was belegt ist und was fehlt.",
    siehtNicht:
      "Personendaten Dritter. Wer Texte schreibt und Belege pflegt, braucht keine " +
      "Kundenakte — und die engste Klasse bekommt nur, wer sie braucht.",
    variable: "ADMIN_PASSWORD_REDAKTION",
  },
} as const

export type Rolle = keyof typeof ROLLEN
export const ROLLEN_KEYS = Object.keys(ROLLEN) as Rolle[]

export function istRolle(v: unknown): v is Rolle {
  return typeof v === "string" && (ROLLEN_KEYS as string[]).includes(v)
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DIE FLAECHEN
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Flaeche = {
  /** Pfadmuster; `:id` steht fuer genau ein Segment. */
  pfad: string
  klasse: Klasse
  fuer: readonly Rolle[]
}

/**
 * Alle Admin-Flaechen. Wer eine neue baut und sie hier vergisst, bekommt
 * eine gesperrte Seite — `check-rollen.mjs` sagt ihm auch, welche.
 */
export const FLAECHEN: readonly Flaeche[] = [
  { pfad: "/admin/login", klasse: "einstieg", fuer: ["owner", "vertrieb", "redaktion"] },
  { pfad: "/admin", klasse: "einstieg", fuer: ["owner", "vertrieb", "redaktion"] },

  { pfad: "/admin/material", klasse: "eigene-lage", fuer: ["owner", "redaktion"] },
  /*
   * GATE 34 — das Cockpit traegt die Lage des ganzen Hauses, aber keine
   * Personendaten Dritter: Es zeigt Auskuenfte aus den Registern, keine
   * Kundenakte. Deshalb `eigene-lage` und nicht `fremde-personen`.
   */
  { pfad: "/admin/cockpit", klasse: "eigene-lage", fuer: ["owner"] },

  { pfad: "/admin/kunden", klasse: "fremde-personen", fuer: ["owner", "vertrieb"] },
  { pfad: "/admin/kunden/:id", klasse: "fremde-personen", fuer: ["owner", "vertrieb"] },

  { pfad: "/admin/vertrieb", klasse: "fremde-personen", fuer: ["owner", "vertrieb"] },
  { pfad: "/admin/vertrieb/anfragen", klasse: "fremde-personen", fuer: ["owner", "vertrieb"] },
  { pfad: "/admin/vertrieb/anfragen/:id", klasse: "fremde-personen", fuer: ["owner", "vertrieb"] },
  { pfad: "/admin/vertrieb/beziehungen", klasse: "fremde-personen", fuer: ["owner", "vertrieb"] },
  { pfad: "/admin/vertrieb/beziehungen/:id", klasse: "fremde-personen", fuer: ["owner", "vertrieb"] },
  { pfad: "/admin/vertrieb/pipeline", klasse: "fremde-personen", fuer: ["owner", "vertrieb"] },
  { pfad: "/admin/vertrieb/pipeline/:id", klasse: "fremde-personen", fuer: ["owner", "vertrieb"] },
  { pfad: "/admin/vertrieb/recherche", klasse: "fremde-personen", fuer: ["owner", "vertrieb"] },
  { pfad: "/admin/vertrieb/recherche/:id", klasse: "fremde-personen", fuer: ["owner", "vertrieb"] },
  { pfad: "/admin/vertrieb/verlust", klasse: "fremde-personen", fuer: ["owner", "vertrieb"] },
]

/** Passt ein Pfad auf ein Muster? `:id` deckt genau ein Segment. */
export function passt(muster: string, pfad: string): boolean {
  const a = muster.split("/").filter(Boolean)
  const b = pfad.split("/").filter(Boolean)
  if (a.length !== b.length) return false
  return a.every((teil, i) => (teil.startsWith(":") ? b[i].length > 0 : teil === b[i]))
}

export function flaecheZu(pfad: string): Flaeche | null {
  /* Ein genauer Treffer schlaegt ein Muster — sonst faengt `/admin/:id`
     eine Seite ab, die es namentlich gibt. */
  const genau = FLAECHEN.find((f) => f.pfad === pfad)
  if (genau) return genau
  return FLAECHEN.find((f) => passt(f.pfad, pfad)) ?? null
}

/**
 * DIE ENTSCHEIDUNG.
 *
 * Unbekannte Flaeche → NEIN. Unbekannte Rolle → NEIN. Beides ohne Ausnahme:
 * Ein „im Zweifel durchlassen" ist genau die Voreinstellung, die man nicht
 * bemerkt, weil alles funktioniert.
 */
export function darfBetreten(rolle: unknown, pfad: string): boolean {
  if (!istRolle(rolle)) return false
  const f = flaecheZu(pfad)
  if (!f) return false
  return f.fuer.includes(rolle)
}

/** Wohin jemand geschickt wird, der nicht darf — nie auf eine Fehlerseite. */
export function ausweichZiel(rolle: Rolle): string {
  return darfBetreten(rolle, "/admin") ? "/admin" : "/admin/login"
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · DIE UEBERGABE
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Was jemand abgibt, der eine Rolle verlaesst.
 *
 * Der Vertrag nennt „Uebergaben" ausdruecklich, und das ist kein
 * Nebenpunkt: Eine Rolle, die man bekommt, aber nie zurueckgibt, ist ein
 * Zugang, der sich ansammelt. Nach zwei Jahren hat jeder alles — nicht
 * durch eine Entscheidung, sondern durch Unterlassung.
 *
 * Die Liste ist bewusst kurz und vollstaendig ableitbar: Sie ergibt sich
 * aus der Rolle, nicht aus dem Gedaechtnis dessen, der geht.
 */
export type Uebergabepunkt = { was: string; wie: string }

export function uebergabe(rolle: Rolle): Uebergabepunkt[] {
  const punkte: Uebergabepunkt[] = [
    {
      was: `Zugang „${ROLLEN[rolle].label}"`,
      wie: `Wert von ${ROLLEN[rolle].variable} in der Umgebung neu setzen — nicht loeschen, neu setzen.`,
    },
    {
      was: "Offene Vorgaenge",
      wie: "Jeder offene Vorgang dieser Person geht an jemanden ueber, der die Rolle behaelt.",
    },
  ]
  if (FLAECHEN.some((f) => f.fuer.includes(rolle) && KLASSEN[f.klasse].eng)) {
    punkte.push({
      was: "Personendaten Dritter",
      wie:
        "Exporte, Ausdrucke und Notizen mit fremden Personendaten vernichten. " +
        "Der Zugang endet mit dem Passwortwechsel; Kopien nicht.",
    })
  }
  return punkte
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 5 · WAS DIE LAGE HEUTE IST
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Welche Rollen tatsaechlich vergeben sind.
 *
 * Gelesen wird nur, OB die Variable gesetzt ist — nie ihr Wert. Das ist der
 * ganze Unterschied zwischen einer Lagemeldung und einem Geheimnisleck.
 */
export function vergebeneRollen(env: Record<string, string | undefined> = process.env): Rolle[] {
  return ROLLEN_KEYS.filter((r) => {
    const v = env[ROLLEN[r].variable]
    return typeof v === "string" && v.length > 0
  })
}

/**
 * Der Satz, den G32 beantworten soll: Kann ein zweiter Mensch arbeiten,
 * ohne alles zu sehen?
 *
 * `moeglich` heisst: Das System kann es. `vergeben` heisst: Es ist auch
 * eingerichtet. Die beiden auseinanderzuhalten ist der Unterschied zwischen
 * GEBAUT und LEBT — und dieses Haus haelt ihn ueberall.
 */
export function zweiterMensch(env: Record<string, string | undefined> = process.env): {
  moeglich: boolean
  vergeben: Rolle[]
  eingeschraenkteVergeben: boolean
} {
  const vergeben = vergebeneRollen(env)
  return {
    moeglich: ROLLEN_KEYS.length > 1,
    vergeben,
    eingeschraenkteVergeben: vergeben.some((r) => r !== "owner"),
  }
}
