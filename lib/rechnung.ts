/*
 * ==========================================================================
 * RECHNUNG & ZAHLUNGSEINGANG — GATE 18
 * ==========================================================================
 *
 * Die Master-Architektur sagt zu diesem Gate einen Satz, der wie eine
 * Randnotiz aussieht und keiner ist:
 *
 *   „Eine Rechnung wird gebraucht, sobald der erste Abschluss steht —
 *    nicht ein Quartal spaeter."
 *
 * G17 hat das Angebot gebaut, G19 die Lieferung. Dazwischen fehlte das
 * Stueck, an dem Geld haengt. Genau dort, wo es fehlt, entstehen die zwei
 * Saetze, die ein Betrieb sich selbst erzaehlt:
 *
 *   „Die Rechnung ist raus."      — und deshalb sei sie bezahlt.
 *   „Da kam noch nichts."         — ohne dass jemand nachgesehen haette.
 *
 * ---------------------------------------------------------------------------
 * DIE VIER REGELN, DIE HIER AUSFUEHRBAR WERDEN
 *
 * 1 · EINE RECHNUNG IST KEINE ZAHLUNG.
 *     Es gibt keine Spalte `bezahlt`. Der Zahlungsstand faellt aus den
 *     erfassten Eingaengen — dieselbe Ueberlegung wie bei der Einordnung in
 *     G10 und der Freigabe in G13: Eine gespeicherte Ableitung ist ab der
 *     ersten Abweichung still falsch, und bei Geld faellt „still falsch"
 *     erst beim Steuerberater auf.
 *
 * 2 · GESTELLT IST NICHT ANGEKOMMEN.
 *     `gestelltAm` sagt, wann sie das Haus verlassen hat. Ueber den Empfang
 *     sagt es nichts. Ein Eingang braucht eine eigene Zeile mit eigenem
 *     Beleg.
 *
 * 3 · UNBEKANNT IST NICHT NULL.
 *     Keine erfasste Zahlung heisst `offen`, nicht „0 EUR eingegangen".
 *     Eine Teilzahlung heisst `teilweise` und wird nicht aufgerundet.
 *
 * 4 · EINE GESTELLTE RECHNUNG WIRD NICHT GEAENDERT.
 *     Korrektur heisst Storno und neue Rechnung. Wer die alte ueberschreibt,
 *     hat das Dokument geaendert, das der Kunde bereits hat.
 *
 * ---------------------------------------------------------------------------
 * DIE GRENZE, DIE DIESES GATE NICHT UEBERSCHREITET
 *
 * Der Kanon nennt sie selbst: „haengt am Umsatzsteuer-Status
 * (G04-Owner-Schuld)". `imprintDetails.taxStatusPending` steht seit G04 auf
 * `true` — weder `vatId` noch `smallBusiness` ist entschieden.
 *
 * Eine Rechnung MUSS sich festlegen: entweder weist sie Umsatzsteuer aus,
 * oder sie traegt den Hinweis nach § 19 UStG. Ein Drittes gibt es nicht.
 * Solange das Haus nicht weiss, welches von beiden gilt, kann es keine
 * Rechnung STELLEN — und dieses Modul laesst es auch nicht zu.
 *
 * Entwuerfe bleiben erlaubt. Die Sperre steht genau an der Stelle, an der
 * ein Dokument nach draussen ginge, und nirgends sonst. Das ist der
 * Unterschied zwischen einer Sperre und einer Blockade.
 *
 * KEINE RECHTSBERATUNG. Was unten als Pflichtangabe steht, ist die Liste,
 * die § 14 UStG nennt. Ob sie im Einzelfall vollstaendig ist, entscheidet
 * ein Steuerberater und nicht diese Datei.
 */
import { imprintDetails } from "@/lib/site-data"

/* ── Geld ───────────────────────────────────────────────────────────────── */

/*
 * CENT ALS GANZE ZAHL, NIE EINE KOMMAZAHL.
 *
 * `0.1 + 0.2` ist in JavaScript nicht `0.3`. Bei einer Anzeige faellt das
 * niemandem auf; bei einer Rechnung ueber 3.900 EUR mit drei Positionen
 * faellt es dem Kunden auf, und dann steht Aussage gegen Aussage.
 */
export type Cent = number

export function euro(cent: Cent): string {
  const negativ = cent < 0
  const s = Math.abs(Math.round(cent)).toString().padStart(3, "0")
  return `${negativ ? "−" : ""}${s.slice(0, -2)},${s.slice(-2)} €`
}

export type Position = {
  label: string
  /** Ganze Stueck, Stunden oder Pauschalen. Keine Kommazahl. */
  menge: number
  einzelpreisCent: Cent
}

export type Summe = { nettoCent: Cent; steuerCent: Cent; bruttoCent: Cent }

/* ── Der Steuerstatus — eine Quelle, dieselbe wie auf der Preiszeile ────── */

export type SteuerArt = "regelbesteuert" | "kleinunternehmer" | "offen"

export type Steuerlage = {
  art: SteuerArt
  /** Prozentpunkte. Bei Kleinunternehmer und bei offenem Status: 0. */
  satz: number
  /** Der Satz, der auf der Rechnung stehen muesste. `null`, solange offen. */
  hinweis: string | null
  entschieden: boolean
}

/**
 * Was das Haus ueber seinen eigenen Steuerstatus WEISS.
 *
 * Gelesen aus `imprintDetails` — derselben Quelle, aus der seit G04 die
 * Preiszeile ihre Formulierung waehlt. Zwei Quellen fuer denselben Status
 * waeren zwei Wahrheiten, und die falsche stuende auf der Rechnung.
 */
export function steuerlage(): Steuerlage {
  if (imprintDetails.smallBusiness === true)
    return {
      art: "kleinunternehmer",
      satz: 0,
      hinweis: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.",
      entschieden: true,
    }
  if (imprintDetails.vatId && !imprintDetails.taxStatusPending)
    return {
      art: "regelbesteuert",
      satz: 19,
      hinweis: "Alle Beträge zzgl. 19 % Umsatzsteuer.",
      entschieden: true,
    }
  return { art: "offen", satz: 0, hinweis: null, entschieden: false }
}

export function summe(positionen: readonly Position[], lage: Steuerlage): Summe {
  const nettoCent = positionen.reduce((s, p) => s + Math.round(p.menge * p.einzelpreisCent), 0)
  const steuerCent = Math.round((nettoCent * lage.satz) / 100)
  return { nettoCent, steuerCent, bruttoCent: nettoCent + steuerCent }
}

/* ── Pflichtangaben ─────────────────────────────────────────────────────── */

export type Pflichtangabe = { key: string; label: string; vorhanden: boolean; woher: string }

/**
 * Die Angaben, die § 14 UStG auf einer Rechnung verlangt — gegen das
 * geprueft, was das Haus tatsaechlich hinterlegt hat.
 *
 * Sie stehen hier, damit sie VOR dem Stellen auffallen und nicht danach.
 * Eine Rechnung ohne Steuernummer ist keine Rechnung mit einem Schoenheits-
 * fehler; sie berechtigt den Empfaenger nicht zum Vorsteuerabzug, und er
 * schickt sie zurueck.
 */
export function pflichtangaben(): Pflichtangabe[] {
  const lage = steuerlage()
  return [
    {
      key: "aussteller",
      label: "Vollständiger Name und Anschrift des Ausstellers",
      vorhanden: Boolean(imprintDetails.legalForm),
      woher: "imprintDetails.legalForm + Geschäftsanschrift",
    },
    {
      key: "steuernummer",
      label: "Steuernummer oder USt-IdNr.",
      vorhanden: Boolean(imprintDetails.vatId) || imprintDetails.smallBusiness === true,
      woher: "imprintDetails.vatId / smallBusiness",
    },
    {
      key: "steuerausweis",
      label: lage.art === "kleinunternehmer" ? "Hinweis nach § 19 UStG" : "Steuersatz und Steuerbetrag",
      vorhanden: lage.entschieden,
      woher: "imprintDetails.taxStatusPending",
    },
  ]
}

/* ── Die Rechnung ───────────────────────────────────────────────────────── */

export const RECHNUNGS_ZUSTAENDE = ["entwurf", "gestellt", "storniert"] as const
export type RechnungsZustand = (typeof RECHNUNGS_ZUSTAENDE)[number]

/**
 * Ein erfasster Zahlungseingang.
 *
 * `beleg` ist Pflicht und meint dasselbe wie die Fundstelle in G11 und G13:
 * WO steht, dass das Geld da ist. Ein Haken ohne Kontoauszugszeile ist eine
 * Erinnerung, und Erinnerungen gehoeren nicht in eine Buchhaltung.
 */
export type Zahlungseingang = {
  id: string
  betragCent: Cent
  /** Wertstellung — wann das Geld da war, nicht wann jemand es eingetragen hat. */
  wertstellung: string
  beleg: string
  notiz?: string | null
}

export type Rechnung = {
  id: string
  /** Fortlaufend, ohne Luecke. Vergeben beim Stellen, nie beim Entwurf. */
  nummer: string | null
  /** Aus welchem angenommenen Angebot. Der Umfang wird nicht abgetippt. */
  offerId: string
  opportunityId: string
  zustand: RechnungsZustand
  positionen: Position[]
  /**
   * Zahlungsziel in Tagen ab `gestelltAm`. Das Faelligkeitsdatum wird
   * GERECHNET — dieselbe Entscheidung wie beim Livetermin in G19. Ein
   * eingetragenes Datum daneben waere eine zweite Wahrheit.
   */
  zahlungszielTage: number
  gestelltAm: string | null
  /**
   * DIE STEUERLAGE ZUM ZEITPUNKT DES STELLENS, EINGEFROREN.
   *
   * Das Dokument ist raus. Setzt der Owner spaeter `smallBusiness`, aendert
   * das nichts an einer Rechnung, die der Kunde bereits im Ordner hat —
   * dieselbe Ueberlegung wie `offers.sent_snapshot` in G17. Eine Rechnung,
   * die sich rueckwirkend neu berechnet, ist kein Beleg.
   */
  steuerSnapshot: Steuerlage | null
  storniertAm: string | null
  /** Die Rechnung, die diese ersetzt. Storno ohne Nachfolger ist zulaessig. */
  ersetztDurch: string | null
  zahlungen: Zahlungseingang[]
}

/* ── Darf sie gestellt werden? ──────────────────────────────────────────── */

export type Stellbarkeit = { ok: boolean; fehlend: string[]; grund: string }

/**
 * Die Sperre, die dieses Gate traegt.
 *
 * Sie prueft NICHT, ob die Rechnung inhaltlich richtig ist — das kann kein
 * Programm. Sie prueft, ob das Haus ueberhaupt in der Lage ist, eine zu
 * stellen: Steuerstatus entschieden, Pflichtangaben vorhanden, Positionen da.
 *
 * Solange `taxStatusPending` steht, ist die Antwort nein. Das ist keine
 * technische Luecke, sondern die G04-Schuld an der Stelle, an der sie zum
 * ersten Mal wirklich weh tut — und deshalb steht sie hier und nicht in
 * einer Fussnote.
 */
export function stellbarkeit(r: Pick<Rechnung, "positionen" | "zustand">): Stellbarkeit {
  const fehlend: string[] = []
  for (const a of pflichtangaben()) if (!a.vorhanden) fehlend.push(a.label)
  if (r.positionen.length === 0) fehlend.push("mindestens eine Position")

  if (r.zustand === "storniert")
    return { ok: false, fehlend, grund: "Eine stornierte Rechnung wird nicht erneut gestellt." }
  if (r.zustand === "gestellt")
    return { ok: false, fehlend, grund: "Bereits gestellt. Korrektur heißt Storno und neue Rechnung." }
  if (fehlend.length === 0)
    return { ok: true, fehlend: [], grund: "Pflichtangaben vollständig, Steuerstatus entschieden." }

  const lage = steuerlage()
  return {
    ok: false,
    fehlend,
    grund: lage.entschieden
      ? `Es fehlt: ${fehlend.join(" · ")}.`
      : "Der Umsatzsteuer-Status ist nicht entschieden. Eine Rechnung muss sich festlegen — " +
        "entweder sie weist Umsatzsteuer aus oder sie trägt den Hinweis nach § 19 UStG. " +
        "Ein Drittes gibt es nicht. Entwürfe bleiben möglich.",
  }
}

/* ── Der Zahlungsstand — abgeleitet, nie gespeichert ────────────────────── */

export const ZAHLUNGSSTAENDE = ["offen", "teilweise", "bezahlt", "ueberzahlt"] as const
export type Zahlungsstand = (typeof ZAHLUNGSSTAENDE)[number]

export type Zahlungslage = {
  stand: Zahlungsstand
  bruttoCent: Cent
  eingegangenCent: Cent
  offenCent: Cent
  grund: string
}

/**
 * Was tatsaechlich angekommen ist.
 *
 * `ueberzahlt` ist ein eigener Zustand und nicht „bezahlt mit Rest". Wer
 * zu viel ueberweist, bekommt Geld zurueck — das ist ein Vorgang, keine
 * Rundung. Ein System, das Ueberzahlung als „bezahlt" fuehrt, verliert das
 * Geld eines Kunden im Rauschen.
 */
export function zahlungslage(r: Rechnung): Zahlungslage {
  const lage = r.steuerSnapshot ?? steuerlage()
  const { bruttoCent } = summe(r.positionen, lage)
  const eingegangenCent = r.zahlungen.reduce((s, z) => s + z.betragCent, 0)
  const offenCent = bruttoCent - eingegangenCent

  if (r.zustand !== "gestellt")
    return {
      stand: "offen",
      bruttoCent,
      eingegangenCent,
      offenCent,
      grund:
        r.zustand === "entwurf"
          ? "Entwurf — nichts gestellt, also nichts fällig."
          : "Storniert. Eine stornierte Rechnung wird nicht bezahlt.",
    }

  if (eingegangenCent === 0)
    return {
      stand: "offen",
      bruttoCent,
      eingegangenCent,
      offenCent,
      grund: `Kein Eingang erfasst. Das heißt nicht „nichts bezahlt“ — es heißt, dass niemand nachgesehen hat.`,
    }
  if (eingegangenCent > bruttoCent)
    return {
      stand: "ueberzahlt",
      bruttoCent,
      eingegangenCent,
      offenCent,
      grund: `${euro(-offenCent)} zu viel eingegangen. Das ist ein Vorgang, keine Rundung.`,
    }
  if (eingegangenCent === bruttoCent)
    return {
      stand: "bezahlt",
      bruttoCent,
      eingegangenCent,
      offenCent: 0,
      grund: `Vollständig eingegangen, belegt durch ${r.zahlungen.length} Eingang/Eingänge.`,
    }
  return {
    stand: "teilweise",
    bruttoCent,
    eingegangenCent,
    offenCent,
    grund: `${euro(eingegangenCent)} von ${euro(bruttoCent)} eingegangen. Offen: ${euro(offenCent)}.`,
  }
}

/* ── Faelligkeit ────────────────────────────────────────────────────────── */

export function faelligAm(r: Rechnung): string | null {
  if (!r.gestelltAm) return null
  const d = new Date(r.gestelltAm)
  d.setDate(d.getDate() + r.zahlungszielTage)
  return d.toISOString().slice(0, 10)
}

export type Faelligkeit = { ueberfaellig: boolean; tage: number | null; satz: string }

/**
 * Ueberfaellig wird ANGEZEIGT, nie verschickt.
 *
 * Es gibt hier bewusst keine Mahnstufe und keinen Automatismus. Eine Mahnung
 * ist eine Ansprache an einen Menschen, mit dem eine Geschaeftsbeziehung
 * laeuft — dieselbe Grenze wie in G11: Das System bereitet vor, der Mensch
 * entscheidet.
 */
export function faelligkeit(r: Rechnung, heute = new Date()): Faelligkeit {
  const ziel = faelligAm(r)
  const lage = zahlungslage(r)
  if (!ziel || r.zustand !== "gestellt")
    return { ueberfaellig: false, tage: null, satz: "Nicht gestellt — nichts fällig." }
  if (lage.stand === "bezahlt" || lage.stand === "ueberzahlt")
    return { ueberfaellig: false, tage: null, satz: "Eingegangen." }

  const tage = Math.floor((heute.getTime() - new Date(ziel).getTime()) / 86_400_000)
  if (tage <= 0)
    return { ueberfaellig: false, tage, satz: `Fällig am ${ziel}, noch ${Math.abs(tage)} Tag(e).` }
  return {
    ueberfaellig: true,
    tage,
    satz:
      `Seit ${tage} Tag(en) überfällig (fällig war ${ziel}). ` +
      `Ob und wie erinnert wird, entscheiden Sie — das System verschickt nichts.`,
  }
}

/* ── Storno ─────────────────────────────────────────────────────────────── */

export type Stornierbarkeit = { ok: boolean; grund: string }

/**
 * Warum eine gestellte Rechnung nicht bearbeitet werden darf.
 *
 * Der Kunde hat das Dokument. Wird es hier geaendert, gibt es zwei Fassungen
 * derselben Nummer — und die im Ordner des Kunden gewinnt jede Diskussion.
 * Deshalb: stornieren, neu stellen, beide behalten.
 */
export function stornierbar(r: Rechnung): Stornierbarkeit {
  if (r.zustand === "entwurf")
    return { ok: false, grund: "Ein Entwurf wird nicht storniert — er wird geändert oder verworfen." }
  if (r.zustand === "storniert") return { ok: false, grund: "Bereits storniert." }
  const lage = zahlungslage(r)
  if (lage.eingegangenCent > 0)
    return {
      ok: true,
      grund:
        `Achtung: ${euro(lage.eingegangenCent)} sind bereits eingegangen. ` +
        `Der Storno hebt die Forderung auf, nicht den Geldeingang — die Rückzahlung ist ein eigener Vorgang.`,
    }
  return { ok: true, grund: "Storno statt Änderung. Die alte Rechnung bleibt in der Akte." }
}

/* ── Der Zahlungsplan — das oeffentliche Versprechen, ausfuehrbar ───────── */

/*
 * GATE 20 — DIE LUECKE ZWISCHEN ZWEI GATES
 *
 * Auf der Paketzeile steht seit langem ein Satz:
 *
 *   „50 % bei Start, 50 % bei Ihrer Freigabe."
 *
 * G19 hat ihn in seinem eigenen Kopfkommentar benannt — „eine Zahlung, die
 * an der Abnahme haengt" — und konnte ihn nicht bauen: G18 gab es damals
 * nicht. G18 hat die Rechnung gebaut und wusste nichts von Projekten.
 *
 * Ergebnis: zwei Gates, beide fuer sich richtig, und dazwischen ein
 * Versprechen, das nirgends wirkt. Genau die Art Luecke, die ein einzelnes
 * Gate nicht findet, weil sie in keinem von beiden liegt.
 *
 * Der Plan steht hier und nicht in `lib/lieferung.ts`, weil er von Geld
 * handelt. Er LIEST den Projektzustand, er aendert ihn nicht — die Lieferung
 * bleibt die Wahrheit ueber den Fortschritt, die Rechnung die ueber das Geld.
 * Keines von beiden leitet das andere ab.
 *
 * NUR FUER DAS WEBSITE-PAKET. Der Satz steht genau einmal auf der Seite, an
 * genau einem Paket. Ihn auf Pruefung, Behebung, Systemprojekt oder Betrieb
 * auszudehnen hiesse, ein Versprechen zu erfinden, das nie jemand gegeben
 * hat — und der Kunde haette recht, wenn er widerspricht.
 */
export type Rate = {
  key: "start" | "freigabe"
  anteil: number
  /** Der Projektzustand, ab dem sie faellig wird. */
  ausloeser: "aufgesetzt" | "abgenommen"
  satz: string
}

export const ZAHLUNGSPLAN: readonly Rate[] = [
  { key: "start", anteil: 50, ausloeser: "aufgesetzt", satz: "50 % bei Start" },
  { key: "freigabe", anteil: 50, ausloeser: "abgenommen", satz: "50 % bei Ihrer Freigabe" },
]

export type FaelligeRate = Rate & { betragCent: Cent; faellig: boolean; warum: string }

/**
 * Welche Rate der Projektzustand faellig macht — und welche noch nicht.
 *
 * `null`, wenn das Angebot kein Website-Paket ist: Dann gibt es keinen
 * veroeffentlichten Plan, und ein erfundener waere schlechter als keiner.
 *
 * DIE RUNDUNG IST KEINE NEBENSACHE. Bei einem ungeraden Cent-Betrag ergeben
 * zwei mal 50 % nicht die Summe. Die letzte Rate traegt deshalb den Rest —
 * sonst fehlt am Ende ein Cent, und ein fehlender Cent ist eine offene
 * Forderung, die niemand versteht.
 */
export function raten(
  angebotsart: string,
  bruttoCent: Cent,
  projektZustand: "aufgesetzt" | "laeuft" | "abgenommen" | "uebergeben" | null,
): FaelligeRate[] | null {
  if (angebotsart !== "website") return null

  const erreicht = (ausloeser: Rate["ausloeser"]) => {
    if (projektZustand === null) return false
    if (ausloeser === "aufgesetzt") return true
    return projektZustand === "abgenommen" || projektZustand === "uebergeben"
  }

  let vergeben = 0
  return ZAHLUNGSPLAN.map((r, i) => {
    const letzte = i === ZAHLUNGSPLAN.length - 1
    const betragCent = letzte ? bruttoCent - vergeben : Math.round((bruttoCent * r.anteil) / 100)
    vergeben += betragCent
    const faellig = erreicht(r.ausloeser)
    return {
      ...r,
      betragCent,
      faellig,
      warum: faellig
        ? `Fällig — ${r.satz}.`
        : projektZustand === null
          ? "Noch kein Projekt. Ohne angenommenes Angebot ist nichts fällig."
          : `Noch nicht fällig: ${r.satz} verlangt die Abnahme, das Projekt steht auf „${projektZustand}“.`,
    }
  })
}

/**
 * Was auch dann nicht automatisch passiert, wenn alles steht.
 *
 * Dieselbe Liste wie in G11, aus demselben Grund: Sie steht auf der
 * Oberflaeche, damit niemand annimmt, das System habe schon gehandelt.
 */
export const NIEMALS_AUTOMATISCH = [
  "Keine Rechnung wird verschickt — das Stellen erzeugt das Dokument, nicht den Versand.",
  "Keine Mahnung geht raus. Überfällig wird angezeigt, nicht gemahnt.",
  "Kein Zahlungseingang wird vermutet — jeder braucht einen Beleg.",
  "Keine Rechnung wird bezahlt, weil sie alt ist.",
  "Keine Abnahme erzeugt eine Zahlung, und keine Zahlung erzeugt eine Abnahme.",
]
