/**
 * Die Rechenlehre der Finanzabteilung — rein, ohne Datenbank, ohne Uhr.
 * Alles, was hier steht, bekommt `heute` hereingereicht und ist damit prüfbar.
 * Beträge sind immer ganze Cent, Daten immer `YYYY-MM-DD`.
 */

export type Art = "einnahme" | "ausgabe"
export type Status = "gebucht" | "geplant"
export type Wiederholung = "keine" | "monatlich" | "quartal" | "jaehrlich"

export type Buchung = {
  id: string
  art: Art
  status: Status
  datum: string
  bruttoCent: number
  ustSatz: number
  kategorie: string
  gegenpartei: string | null
  notiz: string | null
  wiederholung: Wiederholung
  storniert: boolean
  /** Abzugsfähiger Anteil in % (z. B. Bewirtung 70). Fehlt = 100. */
  abzugProzent?: number | null
  /** Anlagegut: Nutzungsdauer in Jahren, Aufwand linear verteilt (AfA). */
  afaJahre?: number | null
  /** Steuer-Pauschale: zählt im Gewinn, bewegt aber kein Geld. */
  ohneGeldfluss?: boolean
  /** Archivierter Beleg (z. B. Tank bei km-Pauschale): bewegt das Konto, zählt nicht im Gewinn. */
  archiviert?: boolean
}

export type Einstellungen = {
  kontostandCent: number
  kontostandAm: string
  estQuote: number
  ustPflichtig: boolean
  ustRhythmus: "monatlich" | "quartal"
  ustBezahltBis: string
  /** Letzter aus einem Bank-Import gelesener Saldo — ein Vorschlag, nie automatisch übernommen (siehe FinanzEinstellungen). */
  bankSaldoCent: number | null
  bankSaldoAm: string | null
}

export type FristArt = "ust" | "est" | "sonstig"

export type Frist = {
  id: string
  titel: string
  art: FristArt
  faellig: string
  periodeEnde: string | null
  betragCent: number | null
  erledigt: boolean
}

export const KATEGORIEN: Record<Art, readonly string[]> = {
  einnahme: ["Projekt / Kunde", "Produkt-Abo", "Fibero-Rechnung", "Beratung", "Sonstiges"],
  ausgabe: [
    "Software & Hosting",
    "Hardware",
    "Marketing",
    "Büro & Miete",
    "Fahrzeug & Reise",
    "Fremdleistung",
    "Versicherung",
    "Bank & Gebühren",
    "Weiterbildung",
    "Privatentnahme",
    "Sonstiges",
  ],
}

/** Privatentnahmen bewegen das Konto, aber nicht den Gewinn. */
export const KEIN_BETRIEBSAUFWAND = new Set(["Privatentnahme"])

/**
 * Zuflüsse, die KEIN Umsatz im Sinne von § 19 UStG sind (Geldbewegung ohne
 * Leistung). Zählen nicht zur Kleinunternehmergrenze. Großschreibung egal.
 */
export const KEIN_UMSATZ = ["Privateinlage", "Darlehen", "Kredit", "Erstattung", "Rückerstattung", "Umbuchung"] as const
export const istKeinUmsatz = (kategorie: string) => KEIN_UMSATZ.some((k) => k.toLowerCase() === kategorie.trim().toLowerCase())

/* ------------------------------------------------------------------------ */
/* Datum                                                                     */
/* ------------------------------------------------------------------------ */

export function heuteBerlin(jetzt = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(jetzt)
}

function zuDatum(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`)
}

function zuIso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function plusTage(iso: string, n: number): string {
  const d = zuDatum(iso)
  d.setUTCDate(d.getUTCDate() + n)
  return zuIso(d)
}

export function plusMonate(iso: string, n: number): string {
  const d = zuDatum(iso)
  const tag = d.getUTCDate()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() + n)
  const letzter = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  d.setUTCDate(Math.min(tag, letzter))
  return zuIso(d)
}

export function tageZwischen(von: string, bis: string): number {
  return Math.round((zuDatum(bis).getTime() - zuDatum(von).getTime()) / 86_400_000)
}

/* ------------------------------------------------------------------------ */
/* Beträge                                                                   */
/* ------------------------------------------------------------------------ */

export function nettoCent(b: Pick<Buchung, "bruttoCent" | "ustSatz">, ustPflichtig: boolean): number {
  if (!ustPflichtig || b.ustSatz <= 0) return b.bruttoCent
  return Math.round((b.bruttoCent * 100) / (100 + b.ustSatz))
}

export function ustCent(b: Pick<Buchung, "bruttoCent" | "ustSatz">, ustPflichtig: boolean): number {
  return b.bruttoCent - nettoCent(b, ustPflichtig)
}

/**
 * Gewinnwirksamer Netto-Betrag einer Buchung im Jahr `jahr`. Vorsteuer bleibt
 * davon unberührt (voll im Monat des Belegs). Anlagegüter werden linear über
 * die Nutzungsdauer verteilt, teilweise abzugsfähige Kosten anteilig gezählt.
 */
export function aufwandImJahr(
  b: Pick<Buchung, "bruttoCent" | "ustSatz" | "datum" | "abzugProzent" | "afaJahre">,
  jahr: string,
  ustPflichtig: boolean,
): number {
  const netto = nettoCent(b, ustPflichtig)
  const start = Number(b.datum.slice(0, 4))
  const j = Number(jahr)
  if (b.afaJahre && b.afaJahre > 0) {
    const proJahr = netto / b.afaJahre
    const schon = (j - start) * proJahr
    return j < start ? 0 : Math.round(Math.max(0, Math.min(proJahr, netto - schon)))
  }
  if (j !== start) return 0
  return Math.round((netto * (b.abzugProzent ?? 100)) / 100)
}

function vorzeichen(b: Pick<Buchung, "art">): 1 | -1 {
  return b.art === "einnahme" ? 1 : -1
}

const wirksam = (b: Buchung) => !b.storniert
/** Echte Geldbewegung — ohne Pauschalen. */
const geldfluss = (b: Buchung) => wirksam(b) && !b.ohneGeldfluss

/* ------------------------------------------------------------------------ */
/* Kontostand                                                                */
/* ------------------------------------------------------------------------ */

export function kontostandHeute(e: Einstellungen, buchungen: Buchung[], heute: string): number {
  return buchungen
    .filter((b) => geldfluss(b) && b.status === "gebucht" && b.datum > e.kontostandAm && b.datum <= heute)
    .reduce((s, b) => s + vorzeichen(b) * b.bruttoCent, e.kontostandCent)
}

/* ------------------------------------------------------------------------ */
/* Steuertopf                                                                */
/* ------------------------------------------------------------------------ */

export type Steuertopf = {
  ustOffenCent: number
  estRuecklageCent: number
  gewinnJahrCent: number
  gesamtCent: number
}

export function steuertopf(
  e: Einstellungen,
  buchungen: Buchung[],
  fristen: Frist[],
  heute: string,
): Steuertopf {
  const gebucht = buchungen.filter((b) => wirksam(b) && !b.archiviert && b.status === "gebucht" && b.datum <= heute)

  const ustOffenCent = e.ustPflichtig
    ? Math.max(
        0,
        gebucht
          .filter((b) => b.datum > e.ustBezahltBis)
          .reduce((s, b) => s + vorzeichen(b) * ustCent(b, true), 0),
      )
    : 0

  const jahr = heute.slice(0, 4)
  const gewinnJahrCent = gebucht
    .filter((b) => b.datum.slice(0, 4) <= jahr && !KEIN_BETRIEBSAUFWAND.has(b.kategorie))
    .reduce((s, b) => s + vorzeichen(b) * aufwandImJahr(b, jahr, e.ustPflichtig), 0)

  const estGezahlt = fristen
    .filter((f) => f.art === "est" && f.erledigt && f.faellig.startsWith(jahr))
    .reduce((s, f) => s + (f.betragCent ?? 0), 0)

  const estRuecklageCent = Math.max(0, Math.round((gewinnJahrCent * e.estQuote) / 100) - estGezahlt)

  return { ustOffenCent, estRuecklageCent, gewinnJahrCent, gesamtCent: ustOffenCent + estRuecklageCent }
}

/* ------------------------------------------------------------------------ */
/* Liquidität — 13 Wochen voraus                                             */
/* ------------------------------------------------------------------------ */

const SCHRITT: Record<Exclude<Wiederholung, "keine">, number> = { monatlich: 1, quartal: 3, jaehrlich: 12 }

export type Bewegung = {
  datum: string
  cent: number
  titel: string
  quelle: "buchung" | "wiederholung" | "frist" | "ueberfaellig" | "pipeline"
  /** Rechnerische Annahme statt gebuchter/geplanter Tatsache — die Oberfläche kennzeichnet sie. */
  geschaetzt?: boolean
}

/**
 * Drei Blickwinkel auf dieselben Daten. Jeder baut auf dem vorigen auf:
 *   vorsichtig   gebuchte/geplante Bewegungen + Steuerzahlungen (geschätzt, wo kein Betrag steht)
 *   erwartet     + überfällige Forderungen, die mit Verzug doch noch eingehen
 *   optimistisch + gewichtete Verkaufschancen aus der Pipeline
 */
export type Szenario = "vorsichtig" | "erwartet" | "optimistisch"
export const SZENARIEN: readonly Szenario[] = ["vorsichtig", "erwartet", "optimistisch"]

/** Überfällige Forderung: Eingang nach so vielen Tagen ab heute angenommen. */
export const UEBERFAELLIG_ANNAHME_TAGE = 21
/** Ohne eigenen Termin: Abschluss einer Chance in so vielen Tagen angenommen. */
export const PIPELINE_STANDARD_TAGE = 45
/** Gewicht je Pipeline-Stufe. Bewusst niedrig — eine Chance ist kein Geld. */
export const PIPELINE_GEWICHT: Record<string, number> = { audit: 0.15, discovery: 0.1, proposal: 0.3, negotiation: 0.5 }

export type PipelineChance = { id: string; titel: string; wertCent: number; status: string; erwartetAm: string | null }

/**
 * Betrag für Fristen ohne Betrag (USt-Voranmeldung, ESt-Vorauszahlung), damit
 * der Steuerabfluss im Liquiditätsband steht und nicht nur als Linie daneben.
 *   USt  der gesamte offene USt-Saldo auf die früheste offene USt-Frist
 *        (alles bis zur nächsten Zahlung Aufgelaufene wird dort fällig)
 *   ESt  die Rücklage gleichmäßig auf die noch offenen Vorauszahlungen des Jahres
 * Fristen mit eigenem Betrag bleiben unberührt.
 */
export function geschaetzteFristBetraege(fristen: Frist[], topf: Steuertopf, heute: string): Map<string, number> {
  const ergebnis = new Map<string, number>()
  const offen = fristen.filter((f) => !f.erledigt && f.betragCent === null)
  const ust = offen.filter((f) => f.art === "ust").sort((a, b) => a.faellig.localeCompare(b.faellig))
  if (ust[0] && topf.ustOffenCent > 0) ergebnis.set(ust[0].id, topf.ustOffenCent)
  const jahr = heute.slice(0, 4)
  const est = offen.filter((f) => f.art === "est" && f.faellig.startsWith(jahr)).sort((a, b) => a.faellig.localeCompare(b.faellig))
  if (est.length && topf.estRuecklageCent > 0) {
    const je = Math.floor(topf.estRuecklageCent / est.length)
    est.forEach((f, i) => ergebnis.set(f.id, i === est.length - 1 ? topf.estRuecklageCent - je * (est.length - 1) : je))
  }
  return ergebnis
}

export type BewegungsOptionen = {
  /** Mit Steuertopf werden Fristen ohne Betrag geschätzt (siehe geschaetzteFristBetraege). */
  topf?: Steuertopf
  szenario?: Szenario
  pipeline?: PipelineChance[]
}

export function kuenftigeBewegungen(
  buchungen: Buchung[],
  fristen: Frist[],
  heute: string,
  horizont: string,
  optionen: BewegungsOptionen = {},
): Bewegung[] {
  const szenario = optionen.szenario ?? "vorsichtig"
  const liste: Bewegung[] = []
  for (const b of buchungen.filter(geldfluss)) {
    const titel = b.gegenpartei ?? b.kategorie
    if (b.datum > heute && b.datum <= horizont) {
      liste.push({ datum: b.datum, cent: vorzeichen(b) * b.bruttoCent, titel, quelle: "buchung" })
    }
    /* Überfällige, noch nicht eingegangene Forderung: im vorsichtigen Blick draußen, sonst mit Verzug erwartet. */
    if (szenario !== "vorsichtig" && b.status === "geplant" && b.art === "einnahme" && b.datum <= heute && b.wiederholung === "keine") {
      const wann = plusTage(heute, UEBERFAELLIG_ANNAHME_TAGE)
      if (wann <= horizont) liste.push({ datum: wann, cent: b.bruttoCent, titel: `${titel} (überfällig)`, quelle: "ueberfaellig", geschaetzt: true })
    }
    if (b.wiederholung !== "keine") {
      const schritt = SCHRITT[b.wiederholung]
      let n = 1
      let d = plusMonate(b.datum, schritt)
      while (d <= horizont && n < 60) {
        if (d > heute) liste.push({ datum: d, cent: vorzeichen(b) * b.bruttoCent, titel, quelle: "wiederholung" })
        n += 1
        d = plusMonate(b.datum, schritt * n)
      }
    }
  }
  const schaetzung = optionen.topf ? geschaetzteFristBetraege(fristen, optionen.topf, heute) : new Map<string, number>()
  for (const f of fristen) {
    if (f.erledigt || f.faellig > horizont) continue
    const betrag = f.betragCent ?? schaetzung.get(f.id) ?? null
    if (betrag === null) continue
    liste.push({ datum: f.faellig < heute ? heute : f.faellig, cent: -betrag, titel: f.titel, quelle: "frist", geschaetzt: f.betragCent === null })
  }
  if (szenario === "optimistisch") {
    for (const c of optionen.pipeline ?? []) {
      const gewicht = PIPELINE_GEWICHT[c.status]
      if (!gewicht || c.wertCent <= 0) continue
      const wann = c.erwartetAm && c.erwartetAm > heute ? c.erwartetAm : plusTage(heute, PIPELINE_STANDARD_TAGE)
      if (wann > horizont) continue
      liste.push({ datum: wann, cent: Math.round(c.wertCent * gewicht), titel: `${c.titel} (${Math.round(gewicht * 100)} %)`, quelle: "pipeline", geschaetzt: true })
    }
  }
  return liste.sort((a, b) => a.datum.localeCompare(b.datum))
}

export type Woche = { bis: string; standCent: number; einCent: number; ausCent: number }

export function liquiditaet(start: number, bewegungen: Bewegung[], heute: string, wochen = 13): Woche[] {
  const ergebnis: Woche[] = []
  let stand = start
  let von = heute
  for (let i = 1; i <= wochen; i++) {
    const bis = plusTage(heute, i * 7)
    let ein = 0
    let aus = 0
    for (const m of bewegungen) {
      if (m.datum > von && m.datum <= bis) {
        if (m.cent >= 0) ein += m.cent
        else aus += -m.cent
      }
    }
    stand += ein - aus
    ergebnis.push({ bis, standCent: stand, einCent: ein, ausCent: aus })
    von = bis
  }
  return ergebnis
}

/* ------------------------------------------------------------------------ */
/* Fristen — kommen von selbst, werden lauter, wenn sie liegen bleiben       */
/* ------------------------------------------------------------------------ */

export type Stufe = "ruhig" | "bald" | "ueberfaellig" | "eskalation"

export function stufe(f: Frist, heute: string): { stufe: Stufe; tage: number } {
  const tage = tageZwischen(heute, f.faellig)
  if (tage > 14) return { stufe: "ruhig", tage }
  if (tage >= 0) return { stufe: "bald", tage }
  if (tage > -30) return { stufe: "ueberfaellig", tage }
  return { stufe: "eskalation", tage }
}

function monatsEnde(jahr: number, monat0: number): string {
  return zuIso(new Date(Date.UTC(jahr, monat0 + 1, 0)))
}

function zehnter(jahr: number, monat0: number): string {
  return zuIso(new Date(Date.UTC(jahr, monat0, 10)))
}

const MONATE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]

/**
 * Die Pflichtfristen, die das System selbst anlegt: Umsatzsteuer-Voranmeldung
 * (10. nach Periodenende) und Einkommensteuer-Vorauszahlung (10.3./6./9./12.).
 * Die Kennung ist fest — mehrfaches Anlegen erzeugt keine Doppel.
 */
export function sollFristen(e: Einstellungen, heute: string): Frist[] {
  const d = zuDatum(heute)
  const jahr = d.getUTCFullYear()
  const monat = d.getUTCMonth()
  const liste: Frist[] = []

  if (e.ustPflichtig) {
    const perioden: { j: number; m: number; titel: string; ende: string }[] = []
    if (e.ustRhythmus === "monatlich") {
      for (const off of [-1, 0]) {
        const dt = new Date(Date.UTC(jahr, monat + off, 1))
        const j = dt.getUTCFullYear()
        const m = dt.getUTCMonth()
        perioden.push({ j, m, titel: `USt-Voranmeldung ${MONATE[m]} ${j}`, ende: monatsEnde(j, m) })
      }
    } else {
      const q = Math.floor(monat / 3)
      for (const off of [-1, 0]) {
        const dt = new Date(Date.UTC(jahr, (q + off) * 3, 1))
        const j = dt.getUTCFullYear()
        const qq = Math.floor(dt.getUTCMonth() / 3)
        perioden.push({ j, m: qq * 3 + 2, titel: `USt-Voranmeldung Q${qq + 1} ${j}`, ende: monatsEnde(j, qq * 3 + 2) })
      }
    }
    for (const p of perioden) {
      const f = new Date(Date.UTC(p.j, p.m + 1, 1))
      liste.push({
        id: `ust-${p.ende}`,
        titel: p.titel,
        art: "ust",
        faellig: zehnter(f.getUTCFullYear(), f.getUTCMonth()),
        periodeEnde: p.ende,
        betragCent: null,
        erledigt: false,
      })
    }
  }

  for (const j of [jahr, jahr + 1]) {
    for (const m of [2, 5, 8, 11]) {
      const faellig = zehnter(j, m)
      const tage = tageZwischen(heute, faellig)
      if (tage < -45 || tage > 120) continue
      liste.push({
        id: `est-${faellig}`,
        titel: `ESt-Vorauszahlung ${MONATE[m]} ${j}`,
        art: "est",
        faellig,
        periodeEnde: null,
        betragCent: null,
        erledigt: false,
      })
    }
  }
  return liste
}

/* ------------------------------------------------------------------------ */
/* Kompass — was dich voranbringt, steht vorne                               */
/* ------------------------------------------------------------------------ */

export type Hinweis = { schwere: "neutral" | "attention" | "critical"; text: string }

export type Monat = { schluessel: string; einCent: number; ausCent: number }

export function monate(buchungen: Buchung[], heute: string, anzahl = 6): Monat[] {
  const liste: Monat[] = []
  for (let i = anzahl - 1; i >= 0; i--) {
    const schluessel = plusMonate(`${heute.slice(0, 7)}-01`, -i).slice(0, 7)
    let ein = 0
    let aus = 0
    for (const b of buchungen) {
      if (!geldfluss(b) || b.status !== "gebucht" || !b.datum.startsWith(schluessel)) continue
      if (b.art === "einnahme") ein += b.bruttoCent
      else aus += b.bruttoCent
    }
    liste.push({ schluessel, einCent: ein, ausCent: aus })
  }
  return liste
}

export function reichweiteMonate(freiCent: number, verlauf: Monat[]): number | null {
  const voll = verlauf.slice(0, -1).filter((m) => m.ausCent > 0)
  if (!voll.length) return null
  const schnitt = voll.reduce((s, m) => s + m.ausCent, 0) / voll.length
  return schnitt > 0 ? Math.max(0, freiCent / schnitt) : null
}

/** Nur die Form, die kompass() braucht — kein Import aus lib/finanz/felder.ts, damit diese Datei "rein, ohne Datenbank" bleibt (siehe Kopfkommentar). lib/finanz/felder.ts' FeldZeile passt strukturell hinein. */
export type GeschaeftsfeldMarge = { label: string; einCent: number; ausCent: number; anzahl: number }

export function kompass(input: {
  freiCent: number
  topf: Steuertopf
  wochen: Woche[]
  fristen: Frist[]
  buchungen: Buchung[]
  verlauf: Monat[]
  reichweite: number | null
  heute: string
  eur: (c: number) => string
  felder?: GeschaeftsfeldMarge[]
}): Hinweis[] {
  const { freiCent, topf, wochen, fristen, buchungen, verlauf, reichweite, heute, eur, felder } = input
  const h: Hinweis[] = []

  for (const f of fristen.filter((x) => !x.erledigt)) {
    const s = stufe(f, heute)
    if (s.stufe === "eskalation")
      h.push({
        schwere: "critical",
        text: `${f.titel} ist seit ${-s.tage} Tagen offen. Heute erledigen – oder beim Finanzamt Fristverlängerung beantragen.`,
      })
    else if (s.stufe === "ueberfaellig")
      h.push({ schwere: "critical", text: `${f.titel} ist seit ${-s.tage} Tagen überfällig.` })
  }

  const tief = wochen.reduce((min, w) => (w.standCent < min.standCent ? w : min), wochen[0])
  if (tief && tief.standCent < 0)
    h.push({ schwere: "critical", text: `Konto läuft bis ${datumKurz(tief.bis)} ins Minus (${eur(tief.standCent)}). Einnahmen vorziehen oder Ausgaben schieben.` })
  else if (tief && tief.standCent - topf.gesamtCent < 0)
    h.push({ schwere: "attention", text: `Bis ${datumKurz(tief.bis)} reicht das Geld nicht für den Steuertopf (${eur(topf.gesamtCent)}). Rücklage jetzt beiseitelegen.` })

  if (freiCent < 0)
    h.push({ schwere: "critical", text: `Der Steuertopf ist größer als dein Kontostand – ${eur(-freiCent)} fehlen für Finanzamt-Rücklagen.` })

  const offenGeplant = buchungen.filter((b) => !b.storniert && b.status === "geplant" && b.art === "einnahme" && b.datum < heute)
  if (offenGeplant.length)
    h.push({
      schwere: "attention",
      text: `${offenGeplant.length} erwartete Einnahme${offenGeplant.length > 1 ? "n sind" : " ist"} überfällig (${eur(offenGeplant.reduce((s, b) => s + b.bruttoCent, 0))}). Nachhaken.`,
    })

  if (reichweite !== null && reichweite < 3)
    h.push({ schwere: "attention", text: `Freies Geld reicht für ${reichweite.toFixed(1)} Monate. Ziel sind 3–6 Monate Puffer.` })
  else if (reichweite !== null && reichweite >= 6) {
    const vollMonate = verlauf.slice(0, -1).filter((m) => m.ausCent > 0)
    const schnittAusgabe = vollMonate.length ? vollMonate.reduce((s, m) => s + m.ausCent, 0) / vollMonate.length : 0
    const ueberPuffer = schnittAusgabe > 0 ? Math.round(freiCent - schnittAusgabe * 6) : 0
    h.push({
      schwere: "neutral",
      text:
        ueberPuffer > 0
          ? `Puffer für ${reichweite.toFixed(1)} Monate — ${eur(ueberPuffer)} liegen über dem 6-Monats-Ziel. Das ist Kapital, das arbeiten könnte: Investition, Rücklage oder Anlage.`
          : `Puffer für ${reichweite.toFixed(1)} Monate. Überschuss über 6 Monate kann arbeiten: Rücklage, Investition, Vermögen.`,
    })
  }

  const jetzt = verlauf.at(-1)
  const vorher = verlauf.slice(0, -1).filter((m) => m.einCent || m.ausCent)
  if (jetzt && vorher.length) {
    const schnitt = vorher.reduce((s, m) => s + m.einCent - m.ausCent, 0) / vorher.length
    const diff = jetzt.einCent - jetzt.ausCent - schnitt
    if (diff > 0) h.push({ schwere: "neutral", text: `Dieser Monat liegt ${eur(diff)} über deinem Schnitt. Weiter so.` })
  }

  /* Wo trägt zusätzliche Investition den größten Hebel? Nur eine Beobachtung aus den Zahlen — keine Empfehlung, welches Feld "richtig" ist. */
  const aktiveFelder = (felder ?? []).filter((f) => f.anzahl > 0)
  if (aktiveFelder.length >= 2) {
    const gesamtMarge = aktiveFelder.reduce((s, f) => s + f.einCent - f.ausCent, 0)
    if (gesamtMarge > 0) {
      const bestes = aktiveFelder.reduce((max, f) => (f.einCent - f.ausCent > max.einCent - max.ausCent ? f : max))
      const marge = bestes.einCent - bestes.ausCent
      const anteil = marge / gesamtMarge
      if (anteil >= 0.5)
        h.push({
          schwere: "neutral",
          text: `${bestes.label} trägt dieses Jahr ${Math.round(anteil * 100)} % deines Gewinns (${eur(marge)} von ${eur(gesamtMarge)}). Dort hat zusätzliche Investition rechnerisch den größten Hebel.`,
        })
    }
  }

  return h.slice(0, 6)
}

export function datumKurz(iso: string): string {
  const [j, m, t] = iso.split("-")
  return `${t}.${m}.${j.slice(2)}`
}
