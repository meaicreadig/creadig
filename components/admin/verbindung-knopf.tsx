"use client"

import { useFormStatus } from "react-dom"

/**
 * ADM-04 — ein Knopf, der sagt, dass er arbeitet.
 *
 * ---------------------------------------------------------------------------
 * WARUM ER EIGENS EXISTIERT
 *
 * Eine Verbindungsprüfung ruft eine Gegenstelle an. Das dauert im guten Fall
 * Millisekunden und im schlechten bis zur Zeitgrenze — und genau dazwischen
 * liegt der Fall, den dieses Haus schon einmal gemessen hat (H12, Anmelde-
 * formular): Ohne Rückmeldung drückt der Mensch ein zweites Mal.
 *
 * `useFormStatus` liefert den Wartezustand des umgebenden Formulars. Jeder
 * Knopf steht deshalb in seinem EIGENEN Formular — stünden mehrere in einem,
 * würden beim Klick auf einen alle anderen mitgesperrt, und der Owner sähe
 * „wird geprüft …“ an einer Zeile, die niemand angefasst hat.
 *
 * Gesperrt wird während der Arbeit: Ein zweites Auslösen wäre bei einer
 * Prüfung nur Last, beim Prüfstand aber ein zweites Ereignis.
 */
export function VerbindungKnopf({
  label,
  laeuft,
  variante = "leise",
  gesperrt = false,
  begruendungId,
}: {
  label: string
  laeuft: string
  variante?: "leise" | "deutlich"
  /**
   * ADM-04 · H19 — der Admin nimmt gerade keine Änderung an.
   *
   * Gemessen 17.09.2026 mit toter Datenbank: Die Server Action kam nie an,
   * die Middleware antwortete 503 (Sitzungswiderruf nicht prüfbar, H2), und
   * im Browser stand nur „An unexpected response was received from the
   * server." Ein Knopf, der in diesem Zustand einladend aussieht, ist eine
   * Lüge über das System — er wird deshalb gesperrt und über
   * `aria-describedby` mit dem Satz verbunden, der sagt, warum.
   */
  gesperrt?: boolean
  begruendungId?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || gesperrt}
      aria-describedby={gesperrt ? begruendungId : undefined}
      aria-busy={pending || undefined}
      className={`${variante === "deutlich" ? "cta-outline" : "cta-quiet"} min-h-11 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? laeuft : label}
    </button>
  )
}
