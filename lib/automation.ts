/**
 * ADM-06 · AUTOMATION — die Schicht, die G26 endlich ausführt
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER NEU IST — UND WAS AUSDRÜCKLICH NICHT
 *
 * `lib/ereignis.ts` (G26) beschreibt seit langem, was aus einem Ereignis
 * folgen darf: vier Wirkungen, drei Auslöser, eine geschlossene Liste
 * erlaubter Handlungen, zehn Dinge, die nie automatisch geschehen. Diese
 * Datei erfindet davon nichts neu. Sie beantwortet die eine Frage, die dort
 * offen blieb: **Was passiert konkret, wenn ein Auslöser läuft?**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE REGEL, DIE ALLES TRÄGT: EINE AUTOMATION ÄNDERT KEINEN GESCHÄFTSDATENSATZ
 *
 * Keine Zeile in `leads`, `opportunities`, `offers` oder `projects` entsteht
 * oder ändert sich, weil eine Automation lief. Ihre Wirkung IST ihr Eintrag
 * im Protokoll (`automation_runs`) — eine offene Erinnerung, eine
 * nachgerechnete Lage, eine Notiz mit Herkunft AUTOMATION.
 *
 * Das ist nicht Vorsicht, sondern dieselbe Trennung wie in G26:
 * „Wiederholung automatisieren, NICHT Verantwortung." Und es macht
 * **Umkehrbarkeit zur Eigenschaft der Bauart** statt zu einer Funktion, die
 * jemand schreiben und vergessen kann: Was nichts verändert hat, lässt sich
 * vollständig zurücknehmen.
 *
 * Wer hier je eine fünfte Wirkung braucht, die einen Datensatz anfasst,
 * braucht keinen Auslöser, sondern einen Menschen.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIE ENTSCHEIDUNG REIN IST
 *
 * `entscheide()` bekommt das Ereignis und seine Daten und gibt zurück, was
 * geschehen soll. Kein Speicher, keine Abfrage, keine Uhr. Dadurch prüft der
 * Probelauf dieselbe Funktion, die im Betrieb läuft — es gibt keine zweite
 * Fassung der Regel, die auseinanderlaufen könnte.
 */

import { AUSLOESER, darfLaufen, type Ereignis, type Wirkung } from "@/lib/ereignis"

/**
 * Ab wann aus Einzelfällen ein Muster wird (G16).
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE ZAHL HIER STEHT UND NICHT IMPORTIERT WIRD
 *
 * `MUSTER_AB` gehört zu `lib/verlust.ts`, und von dort sollte sie kommen.
 * Der Import erzeugt aber einen Kreis: verlust → sales-playbook → lead-store
 * → vertrieb-store-neon → automation → verlust. Gemessen 17.09.2026 hat
 * genau dieser Kreis den Build zerlegt („Cannot access 'u' before
 * initialization") — ein Fehler, der erst beim Sammeln der Seiten auffällt
 * und nichts mit dieser Regel zu tun hat.
 *
 * Eine zweite Zahl ist trotzdem eine zweite Wahrheit. Deshalb steht sie hier
 * NICHT allein: `check-automation.mjs` bricht ab, sobald sie von `MUSTER_AB`
 * abweicht. Die Kopie ist damit erlaubt, weil sie bewacht wird — nicht, weil
 * sie unauffällig ist.
 */
export const AUTOMATION_MUSTER_AB = 3

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · WAS EINE AUSFÜHRUNG HINTERLÄSST
 * ═══════════════════════════════════════════════════════════════════════════ */

export const AUTOMATION_ZUSTAENDE = [
  /** Die Wirkung steht und wartet auf einen Menschen. */
  "offen",
  /** Ein Mensch hat sie abgehakt. */
  "erledigt",
  /** Ein Mensch hat sie zurückgenommen. Der Eintrag bleibt. */
  "zurueckgenommen",
  /** Der Versuch ist gescheitert. */
  "fehlgeschlagen",
] as const
export type AutomationZustand = (typeof AUTOMATION_ZUSTAENDE)[number]

/**
 * Was eine Ausführung inhaltlich ergeben hat — Maschinenwert.
 *
 * Der Satz dazu steht im Wörterbuch (H21): Ein Protokoll, das deutsche Sätze
 * speichert, ist in der türkischen Oberfläche deutsch — und bleibt es auch
 * dann, wenn jemand den Text später verbessert.
 */
export const AUTOMATION_ERGEBNISSE = [
  "freigabe-fragen",
  "uebergabe-vollstaendig",
  "muster-erkannt",
  "kein-muster",
] as const
export type AutomationErgebnis = (typeof AUTOMATION_ERGEBNISSE)[number]

export type Ausfuehrung = {
  ausloeser: string
  wirkung: Wirkung
  ergebnis: AutomationErgebnis
  /** Werte für den Satz — Zahlen, Schlüssel. Nie übersetzt. */
  daten: Record<string, string | number>
  /**
   * Ob die Ausführung eine Chronikzeile schreibt.
   *
   * Nur `notieren` tut das — das ist ihre ganze Wirkung. Eine Erinnerung
   * gehört nicht in die Chronik des Kunden: Dort stünde dann, das Haus habe
   * etwas getan, obwohl es nur etwas auf eine Liste gesetzt hat.
   */
  chronik: boolean
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DIE ENTSCHEIDUNG — rein, ohne Speicher und ohne Uhr
 * ═══════════════════════════════════════════════════════════════════════════ */

export type EreignisDaten = Record<string, unknown> | null

/**
 * Was dieser eine Auslöser aus diesem Ereignis macht — oder `null`, wenn er
 * bei diesem Fall nichts zu tun hat.
 *
 * Der dritte Auslöser zeigt, warum das nicht bloss eine Zuordnung ist:
 * `opportunity.status` feuert bei JEDEM Stufenwechsel. Nur ein Verlust
 * rechnet nach. Ein Auslöser, der bei jedem Wechsel etwas hinschreibt,
 * erzeugt das Rauschen, das die Liste wertlos macht.
 */
function wirkungVon(ausloeser: string, ereignis: Ereignis, daten: EreignisDaten): Ausfuehrung | null {
  const a = AUSLOESER.find((x) => x.key === ausloeser)
  if (!a || a.auf !== ereignis) return null

  switch (ausloeser) {
    case "abnahme-erinnert-an-freigabe":
      /* Erinnern, nicht fragen — die Frage stellt ein Mensch (G13). */
      return {
        ausloeser,
        wirkung: a.wirkung,
        ergebnis: "freigabe-fragen",
        daten: {},
        chronik: false,
      }

    case "uebergabe-notiert-vollstaendigkeit": {
      const stuecke = Array.isArray((daten as { stuecke?: unknown })?.stuecke)
        ? ((daten as { stuecke: unknown[] }).stuecke as string[])
        : []
      return {
        ausloeser,
        wirkung: a.wirkung,
        ergebnis: "uebergabe-vollstaendig",
        daten: { anzahl: stuecke.length, stuecke: stuecke.join(",") },
        chronik: true,
      }
    }

    case "verlust-prueft-muster": {
      /* Nur ein Verlust rechnet nach — sonst wäre jede Stufenänderung eine Zeile. */
      const nach = (daten as { nach?: unknown })?.nach
      if (nach !== "lost") return null
      const anzahl = Number((daten as { gleicherGrund?: unknown })?.gleicherGrund ?? 0)
      const grund = String((daten as { grund?: unknown })?.grund ?? "")
      return {
        ausloeser,
        wirkung: a.wirkung,
        ergebnis: anzahl >= AUTOMATION_MUSTER_AB ? "muster-erkannt" : "kein-muster",
        daten: { anzahl, grund, ab: AUTOMATION_MUSTER_AB },
        chronik: false,
      }
    }

    default:
      return null
  }
}

export type Entscheidung = {
  ausfuehrung: Ausfuehrung
  schluessel: string
}

/**
 * Alles, was aus diesem Ereignis folgen soll.
 *
 * `darfLaufen()` aus G26 entscheidet über Zulässigkeit, Abschaltung,
 * Idempotenz und Versuche — diese Funktion fügt nur hinzu, WAS geschieht.
 * Beide Fragen getrennt zu halten ist Absicht: Die Grenze gehört G26, der
 * Inhalt gehört hierher.
 */
export function entscheide(input: {
  ereignis: string
  gegenstand: string
  daten?: EreignisDaten
  abgeschaltet?: readonly string[]
  protokoll?: readonly string[]
  versuche?: Record<string, number>
}): Entscheidung[] {
  const ergebnis: Entscheidung[] = []
  for (const a of AUSLOESER) {
    if (a.auf !== input.ereignis) continue
    const lauf = darfLaufen({
      ausloeser: a.key,
      ereignis: input.ereignis,
      gegenstand: input.gegenstand,
      abgeschaltet: input.abgeschaltet,
      protokoll: input.protokoll,
      versuche: input.versuche?.[a.key] ?? 0,
    })
    if (!lauf.erlaubt || !lauf.schluessel) continue
    const ausfuehrung = wirkungVon(a.key, input.ereignis as Ereignis, input.daten ?? null)
    if (!ausfuehrung) continue
    ergebnis.push({ ausfuehrung, schluessel: lauf.schluessel })
  }
  return ergebnis
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DIE ZEILE IM PROTOKOLL
 * ═══════════════════════════════════════════════════════════════════════════ */

export type AutomationLauf = {
  id: string
  ausloeser: string
  ereignis: string
  gegenstandArt: string
  gegenstand: string
  schluessel: string
  wirkung: string
  zustand: AutomationZustand
  ergebnis: string | null
  daten: Record<string, string | number> | null
  versuche: number
  fehler: string | null
  erledigtAt: string | null
  erledigtVon: string | null
  createdAt: string
}

/** Ob ein Auslöser läuft. Fehlt der Schalter, ist er an (G26: `abschaltbar`). */
export function istAktiv(schalter: readonly { ausloeser: string; aktiv: boolean }[], key: string): boolean {
  const s = schalter.find((x) => x.ausloeser === key)
  return s ? s.aktiv : true
}

/** Die abgeschalteten Auslöser als Liste — die Form, die `darfLaufen` erwartet. */
export function abgeschaltete(schalter: readonly { ausloeser: string; aktiv: boolean }[]): string[] {
  return schalter.filter((s) => !s.aktiv).map((s) => s.ausloeser)
}
