import { raiseAlert } from "@/lib/alert"

/**
 * MP-G · Der Lead-Speicher — Schnittstelle, Auswahl, Ausfallverhalten.
 *
 * ---------------------------------------------------------------------------
 * WAS SICH HIER ÄNDERT UND WAS NICHT
 * Bis heute war das Postfach die einzige Ablage: `/api/lead` erzeugt `id` und
 * `reference`, verschickt eine Mail und wirft beides weg. Das war kein
 * Versäumnis, sondern eine veröffentlichte Zusage („Eine Datenbank führen wir
 * nicht"). Der Owner hat sie am 29.08.2026 aufgehoben — der Speicher kommt,
 * und der Satz in der Datenschutzerklärung kommt mit ihm
 * (Entwurf in `docs/ops/lead-store.md`).
 *
 * **Die Mail bleibt.** Sie ist seit Jahren der Weg, auf dem eine Anfrage
 * ankommt, und sie funktioniert ohne jede Infrastruktur. Der Speicher tritt
 * DANEBEN, nicht an ihre Stelle.
 *
 * ---------------------------------------------------------------------------
 * DIE REGEL, DIE ALLES ANDERE BESTIMMT
 *
 *     Ein Speicherfehler darf niemals eine Anfrage kosten.
 *
 * Deshalb wird erst zugestellt, dann gespeichert — und ein Fehler beim
 * Speichern meldet sich intern, ohne dass der Absender davon erfährt. Er hat
 * seine Anfrage abgeschickt, sie liegt im Postfach; ihm eine Fehlermeldung zu
 * zeigen, würde ihn ein zweites Mal schicken.
 *
 * Andersherum wäre es bequemer zu programmieren und falsch: Ein Ausfall der
 * Datenbank würde dann jede Anfrage verschlucken, die heute ankommt.
 *
 * ---------------------------------------------------------------------------
 * WARUM EINE SCHNITTSTELLE UND NICHT DIREKT EIN ANBIETER
 * Welcher Speicher es wird, ist eine Owner-Entscheidung mit Vertrag
 * (Auftragsverarbeiter) und Kosten — siehe `docs/ops/lead-store.md`. Was
 * NICHT von dieser Entscheidung abhängt, ist alles hier: das Datenmodell, der
 * Aufrufort, das Ausfallverhalten. Das ist gebaut und geprüft; der Anbieter
 * ist danach eine Datei mit vier Methoden.
 *
 * Ohne `LEAD_STORE` verhält sich die Route **exakt wie vorher**.
 */

/**
 * Das Lead-Objekt aus `docs/ops/crm-schema.md`. Kein zweites Modell — die
 * Felder heissen hier so wie dort.
 */
export type LeadRecord = {
  /** Intern, immutable. NICHT die CD-Nummer. */
  id: string
  /** Menschlich: `CD-YYMMDD-XXXX`. Kein Primärschlüssel. */
  reference: string
  source: string
  locale: "de" | "tr"
  name: string
  email: string
  phone: string
  business: string | null
  message: string | null
  siteUrl: string | null
  /** Nur, was der Client wirklich geschickt hat — nie geraten. */
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmTerm: string | null
  utmContent: string | null
  /** Startzustand der Sales-Maschine (`crm-schema.md`). */
  salesStatus: "new"
  /** Serverzeit, ISO. */
  createdAt: string
}

export type LeadStore = {
  readonly name: string
  save(record: LeadRecord): Promise<void>
}

/* ==========================================================================
 * ADAPTER
 * ========================================================================== */

/**
 * Nur für Entwicklung und Abnahme. In einer Serverless-Umgebung überlebt
 * dieser Speicher keinen Kaltstart und gilt je Instanz — als produktive
 * Ablage wäre er Datenverlust mit Extraschritt.
 *
 * Er existiert, damit der Schreibweg **prüfbar** ist, bevor ein Anbieter
 * feststeht. Ein ungetesteter Schreibweg, der beim ersten echten Lead zum
 * ersten Mal läuft, ist die schlechtere Alternative.
 */
const memoryRows: LeadRecord[] = []

const memoryStore: LeadStore = {
  name: "memory",
  async save(record) {
    memoryRows.push(record)
  },
}

/** Nur für Tests. In der Anwendung liest das niemand. */
export function memoryRecords(): readonly LeadRecord[] {
  return memoryRows
}

/* ==========================================================================
 * AUSWAHL
 * ========================================================================== */

let warned = false

/**
 * `null` heisst: kein Speicher konfiguriert — die Route verhält sich wie vor
 * MP-G. Das ist ein gültiger Zustand, kein Fehler.
 */
export function getLeadStore(): LeadStore | null {
  const kind = process.env.LEAD_STORE?.trim()
  if (!kind) return null

  if (kind === "memory") {
    /*
     * Im Betrieb wird der Arbeitsspeicher-Adapter NICHT benutzt. Er würde
     * jede Anfrage beim nächsten Kaltstart verlieren — und zwar lautlos,
     * was schlimmer ist als gar kein Speicher: Man glaubt, man hätte die
     * Daten.
     */
    if (process.env.NODE_ENV === "production") {
      if (!warned) {
        warned = true
        void raiseAlert(
          "lead-store-memory-in-production",
          "LEAD_STORE=memory im Betrieb — der Arbeitsspeicher-Adapter ist nur fuer Entwicklung. Es wird NICHTS gespeichert.",
        )
      }
      return null
    }
    return memoryStore
  }

  /*
   * Unbekannter Wert: nicht raten, nicht stillschweigend nichts tun. Der
   * Owner hat etwas konfiguriert und erwartet, dass es speichert.
   */
  if (!warned) {
    warned = true
    void raiseAlert(
      "lead-store-unknown",
      `LEAD_STORE="${kind}" ist kein bekannter Adapter — es wird nichts gespeichert.`,
    )
  }
  return null
}

/**
 * Speichert und schluckt jeden Fehler — nach der Zustellung, nie davor.
 * Gibt zurück, ob geschrieben wurde; die Route braucht das nur fürs Protokoll.
 */
export async function storeLead(record: LeadRecord): Promise<boolean> {
  const store = getLeadStore()
  if (!store) return false
  try {
    await store.save(record)
    /*
     * Eine Zeile im Protokoll, damit ein Schreibvorgang ueberhaupt sichtbar
     * ist. Nur Vorgangsnummer und Adapter — kein Name, keine Mail:
     * Serverprotokolle sind kein Ort fuer personenbezogene Daten.
     */
    console.info(`[lead] gespeichert ${record.reference} (${store.name})`)
    return true
  } catch (error) {
    await raiseAlert(
      "lead-store-failed",
      `Speichern von ${record.reference} fehlgeschlagen (${store.name}): ${String(error).slice(0, 300)}`,
    )
    return false
  }
}
