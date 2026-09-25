/*
 * ==========================================================================
 * DER FREIGABE-SCHUTZ DES REGISTERS (§18 · W6 · A5)
 * ==========================================================================
 *
 *   idee → entwurf → freigegeben → veroeffentlicht (→ Reaktion)
 *
 * Die eine Regel, die nie gebrochen wird: Nichts geht von `entwurf` direkt
 * nach `veroeffentlicht`. Ein Entwurf kann von einem Menschen oder spaeter
 * von meAI stammen — veroeffentlicht wird nur, was der Owner freigegeben
 * hat. Diese Datei ist rein (keine Datenbank), damit Drill und Store
 * dieselbe Regel pruefen.
 *
 * Der bestehende Weg „schon veroeffentlicht, jetzt eintragen" bleibt: Wer
 * einen Beitrag von Hand gepostet hat, traegt ihn direkt als
 * `veroeffentlicht` ein. Das ist keine Umgehung — der Mensch, der postet,
 * hat ihn freigegeben, indem er ihn gepostet hat.
 */
export const PUBLICATION_ZUSTAENDE = ["entwurf", "freigegeben", "veroeffentlicht"] as const
export type PublicationZustand = (typeof PUBLICATION_ZUSTAENDE)[number]

/** Woraus ein Entwurf entstand. Ein Entwurf ohne Quelle ist Meinung, kein Stoff. */
export const PUBLICATION_QUELLEN = ["lieferung", "einwand", "beleg", "build"] as const
export type PublicationQuelle = (typeof PUBLICATION_QUELLEN)[number]

export function istZustand(v: unknown): v is PublicationZustand {
  return typeof v === "string" && (PUBLICATION_ZUSTAENDE as readonly string[]).includes(v)
}

export function istQuelle(v: unknown): v is PublicationQuelle {
  return typeof v === "string" && (PUBLICATION_QUELLEN as readonly string[]).includes(v)
}

/** Darf dieser Eintrag als veroeffentlicht markiert werden? Nur nach Freigabe. */
export function kannVeroeffentlichen(p: { zustand: string }): boolean {
  return p.zustand === "freigegeben"
}

/** Darf diese Rolle freigeben? Nur der Owner — auch nicht die Redaktion, die schreibt. */
export function kannFreigeben(p: { zustand: string }, rolle: string | null | undefined): boolean {
  return p.zustand === "entwurf" && rolle === "owner"
}
