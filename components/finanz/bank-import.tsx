"use client"

import { useActionState } from "react"

import { bankImportieren, bankUmsatzIgnorieren, bankUmsatzZuordnen, type BankImportErgebnis } from "@/app/(finanz)/finanz/actions"
import { AdminInput, AdminSelect } from "@/components/admin/primitives"
import { eur, tag } from "@/components/finanz/format"
import { Karte } from "@/components/finanz/karte"
import { MehrListe } from "@/components/finanz/mehr-liste"
import type { OffeneRechnungFuerAbgleich, OffenerBankUmsatz } from "@/lib/finanz/bank-abgleich"

/**
 * Bank-Import (Phase 6) — zuerst ohne PSD2: CSV oder camt.053 hochladen.
 * Jede Zeile ist ein Vorschlag, keine Buchung — bestätigt wird mit einem
 * Klick, nicht zugeordnete Umsätze bleiben sichtbar im Eingangskorb. Passt
 * der Vorschlag nicht oder fehlt er, lässt sich dieselbe Zuordnung manuell
 * auf jede offene Rechnung lenken (bankUmsatzZuordnen() kennt keinen
 * Unterschied zwischen Vorschlag und Handauswahl).
 */
export function BankImportKarte({ offeneUmsaetze, offeneRechnungen }: { offeneUmsaetze: OffenerBankUmsatz[]; offeneRechnungen: OffeneRechnungFuerAbgleich[] }) {
  const [ergebnis, importieren, laeuft] = useActionState<BankImportErgebnis | null, FormData>(bankImportieren, null)

  return (
    <Karte
      titel="Bank: Zahlungseingänge"
      untertitel="Exakte Treffer mit Rechnungsnummer werden automatisch zugeordnet — hier steht nur, was Entscheidung braucht."
      zahl={String(offeneUmsaetze.length)}
      fuss="offen"
      warnung={offeneUmsaetze.length > 0}
      offen={offeneUmsaetze.length > 0}
    >
      <p className="text-muted-foreground text-sm">Kontoauszug als CSV oder camt.053 hochladen (ohne PSD2, von Hand exportiert).</p>
      <form action={importieren} className="flex flex-wrap items-end gap-2">
        <AdminInput type="file" name="datei" accept=".csv,.xml,text/csv,text/xml,application/xml" required className="max-w-xs" aria-label="Bankauszug-Datei" />
        <button disabled={laeuft} className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60">
          {laeuft ? "Lese …" : "Importieren"}
        </button>
      </form>
      {ergebnis && !ergebnis.ok && <p className="text-destructive text-xs">{ergebnis.fehler}</p>}
      {ergebnis?.ok && <p className="text-primary text-xs font-medium">{ergebnis.anzahl} neue Umsätze importiert.</p>}

      {offeneUmsaetze.length === 0 ? (
        <p className="text-muted-foreground text-sm">Kein offener Umsatz im Eingangskorb.</p>
      ) : (
        <MehrListe start={6} kinder={offeneUmsaetze.map((u) => (
            <li key={u.id} className="border-line mb-2 flex flex-col gap-2 rounded-2xl border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground">
                  {tag(u.datum)} · <span className="text-foreground font-semibold tabular-nums">{eur(u.bruttoCent)}</span>
                  {u.gegenpartei ? ` · ${u.gegenpartei}` : ""}
                </span>
                <form action={bankUmsatzIgnorieren}>
                  <input type="hidden" name="umsatzId" value={u.id} />
                  <button className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2">Ignorieren</button>
                </form>
              </div>
              {u.verwendungszweck && <p className="text-muted-foreground truncate text-xs">{u.verwendungszweck}</p>}
              {u.vorschlag ? (
                <form action={bankUmsatzZuordnen} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/40 p-2">
                  <input type="hidden" name="umsatzId" value={u.id} />
                  <input type="hidden" name="dokumentId" value={u.vorschlag.dokumentId} />
                  <span className="text-xs">
                    Vorschlag: Rechnung <strong>{u.vorschlag.nummer}</strong> · {u.vorschlag.kunde} · offen {eur(u.vorschlag.offenCent)}
                    <br />
                    <span className="text-muted-foreground">{u.vorschlag.grund}</span>
                  </span>
                  <button className="bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-xs font-semibold">Bestätigen</button>
                </form>
              ) : (
                <p className="text-muted-foreground text-xs italic">Kein passender Vorschlag.</p>
              )}
              {offeneRechnungen.length > 0 && (
                <details className="text-xs">
                  <summary className="text-muted-foreground cursor-pointer">{u.vorschlag ? "… oder einer anderen Rechnung zuordnen" : "Manuell einer Rechnung zuordnen"}</summary>
                  <form action={bankUmsatzZuordnen} className="mt-2 flex flex-wrap items-center gap-2">
                    <input type="hidden" name="umsatzId" value={u.id} />
                    <AdminSelect name="dokumentId" className="max-w-xs" aria-label="Rechnung auswählen" defaultValue="">
                      <option value="" disabled>
                        Rechnung wählen …
                      </option>
                      {offeneRechnungen.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nummer} · {r.kunde} · offen {eur(r.offenCent)}
                        </option>
                      ))}
                    </AdminSelect>
                    <button className="bg-secondary text-secondary-foreground rounded-full px-3 py-1.5 text-xs font-medium">Zuordnen</button>
                  </form>
                </details>
              )}
            </li>
          ))} />
      )}
    </Karte>
  )
}
