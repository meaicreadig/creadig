import type { Activity, VertriebStore } from "@/lib/vertrieb"

/**
 * ADM-07 · B11 — DIE AUSKUNFT ÜBER EINE PERSON.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM SIE EIN EIGENES STÜCK CODE IST UND KEIN SEITENAUSDRUCK
 *
 * Fragt ein Mensch „welche Daten haben Sie über mich", ist die Antwort nicht
 * die Kontaktseite. Seine Spuren liegen in fünf Tabellen: die Anfragen, die
 * er geschickt hat; die Vorgänge, die daraus wurden; die Chronik, die
 * festhält, wer wann was an ihnen geändert hat; die Organisation, unter der
 * er geführt wird; die Freigaben, die er erteilt oder widerrufen hat.
 *
 * Wer das von Hand zusammenträgt, vergisst beim dritten Mal eine Tabelle —
 * und eine unvollständige Auskunft ist eine falsche Auskunft, schriftlich
 * erteilt. Deshalb steht die Sammlung an EINER Stelle: Kommt eine Tabelle
 * mit Personenbezug dazu, gehört sie hier hinein, und der Probelauf
 * (`auskunft-drill`) merkt, wenn sie fehlt.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DREI REGELN, DIE DIESE DATEI TRÄGT
 *
 *   1 · NUR DIESE PERSON. Jede Zeile hängt an ihrer Kennung oder an einem
 *       Vorgang, der an ihrer Kennung hängt. Ein Kollege in derselben Firma
 *       ist eine andere Person und steht nicht drin — auch nicht „zur
 *       Einordnung".
 *   2 · KEINE ERFUNDENE VOLLSTÄNDIGKEIT. Was das Haus nicht weiss, steht als
 *       `null` da, nicht als leerer Text. Und was bewusst NICHT enthalten
 *       ist, steht benannt in `nichtEnthalten` — eine Auskunft, die ihre
 *       eigenen Grenzen verschweigt, behauptet mehr, als sie kann.
 *   3 · MASCHINENWERTE BLEIBEN MASCHINENWERTE. Übersetzt wird beim Lesen
 *       (H21), nicht beim Erzeugen. Eine Auskunft ist ein Datensatz, kein
 *       Brief; der Brief entsteht daraus.
 */

export type AuskunftBereich =
  | "person"
  | "organisation"
  | "anfragen"
  | "vorgaenge"
  | "chronik"
  | "freigaben"

/**
 * Was NICHT in der Auskunft steht — als Schlüssel, nicht als Satz.
 *
 * `aufbewahrung-unbekannt` ist der wichtigste: Ob und wie lange eine Anfrage
 * aufbewahrt werden MUSS, ist eine Rechts- und Owner-Tatsache
 * (`docs/ops/neon-decision-pack.md`). Solange sie nicht feststeht, kann diese
 * Datei keine Löschfrist nennen — und tut es auch nicht.
 */
export const AUSKUNFT_GRENZEN = [
  "aufbewahrung-unbekannt",
  "daten-dritter-ausgelassen",
  "zugangsdaten-nie-gespeichert",
] as const

export type Auskunft = {
  /** Wann die Auskunft erzeugt wurde — ISO, damit sie datierbar bleibt. */
  erstelltAm: string
  kontaktId: string
  bereiche: Record<AuskunftBereich, number>
  person: Record<string, unknown> | null
  organisation: Record<string, unknown> | null
  anfragen: Record<string, unknown>[]
  vorgaenge: Record<string, unknown>[]
  chronik: (Activity & { zuOrt: string })[]
  freigaben: Record<string, unknown>[]
  nichtEnthalten: readonly string[]
}

/**
 * Alles, was dieses Haus über eine Person führt — oder `null`, wenn es die
 * Person nicht kennt.
 *
 * Die Chronik wird aus drei Quellen zusammengezogen (Kontakt, jede Anfrage,
 * jeder Vorgang) und bekommt in `zuOrt` die Herkunft mit: Ohne sie stünden
 * zwanzig Zeilen ohne Zusammenhang da, und der Mensch, der die Auskunft
 * liest, könnte nicht prüfen, worauf sie sich beziehen.
 */
export async function auskunftFuerKontakt(
  store: VertriebStore,
  kontaktId: string,
): Promise<Auskunft | null> {
  const kontakt = await store.getContact(kontaktId)
  if (!kontakt) return null

  const [anfrageRefs, vorgaenge, kontaktChronik] = await Promise.all([
    store.leadsForContact(kontaktId),
    store.opportunitiesForContact(kontaktId),
    store.activities("contact", kontaktId),
  ])

  const anfragen = (
    await Promise.all(anfrageRefs.map((a) => store.getEnquiry(a.id)))
  ).filter((a): a is NonNullable<typeof a> => a !== null)

  const organisation = kontakt.organisationId ? await store.getOrganisation(kontakt.organisationId) : null

  /*
   * Freigaben hängen an der Organisation, nicht an der Person. In die
   * Auskunft gehören nur die, die DIESE Person erteilt hat — erkennbar am
   * Namen, mit dem sie erteilt wurden. Die Freigabe einer Kollegin ist deren
   * Datensatz, auch wenn sie dieselbe Firma betrifft.
   */
  const alleFreigaben = kontakt.organisationId ? await store.listReleases(kontakt.organisationId).catch(() => null) : null
  const freigaben = (alleFreigaben ?? []).filter(
    (f) => f.by.name.trim().toLowerCase() === kontakt.name.trim().toLowerCase(),
  )

  const chronik: (Activity & { zuOrt: string })[] = kontaktChronik.map((c) => ({ ...c, zuOrt: `kontakt:${kontaktId}` }))
  for (const a of anfragen) {
    for (const z of await store.activities("lead", a.id)) chronik.push({ ...z, zuOrt: `anfrage:${a.reference}` })
  }
  for (const v of vorgaenge) {
    for (const z of await store.activities("opportunity", v.id)) chronik.push({ ...z, zuOrt: `vorgang:${v.id}` })
  }
  chronik.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  return {
    erstelltAm: new Date().toISOString(),
    kontaktId,
    bereiche: {
      person: 1,
      organisation: organisation ? 1 : 0,
      anfragen: anfragen.length,
      vorgaenge: vorgaenge.length,
      chronik: chronik.length,
      freigaben: freigaben.length,
    },
    person: kontakt as unknown as Record<string, unknown>,
    organisation: (organisation as unknown as Record<string, unknown>) ?? null,
    anfragen: anfragen as unknown as Record<string, unknown>[],
    vorgaenge: vorgaenge as unknown as Record<string, unknown>[],
    chronik,
    freigaben: freigaben as unknown as Record<string, unknown>[],
    nichtEnthalten: AUSKUNFT_GRENZEN,
  }
}

/** Der Dateiname — datiert, ohne Namen der Person (er stünde sonst im Dateisystem jedes Empfängers). */
export function auskunftDateiname(kontaktId: string, jetzt = new Date()): string {
  return `auskunft-${kontaktId}-${jetzt.toISOString().slice(0, 10)}.json`
}
