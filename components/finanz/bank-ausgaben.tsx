import { bankAusgabeBuchen, bankUmsatzIgnorieren } from "@/app/(finanz)/finanz/actions"
import { AdminSelect } from "@/components/admin/primitives"
import { eur, tag } from "@/components/finanz/format"
import { Karte } from "@/components/finanz/karte"
import { MehrListe } from "@/components/finanz/mehr-liste"
import type { AusgehenderBankUmsatz } from "@/lib/finanz/bank-abgleich"
import { GESCHAEFTSFELDER } from "@/lib/finanz/beleg-felder"
import { KATEGORIEN } from "@/lib/finanz/rechnen"

/**
 * Abbuchungen aus dem Bank-Import, die zu keiner Rechnung gehören: hier
 * werden sie mit einem Klick als Ausgabe gebucht (bucheAusgehendenUmsatz —
 * dieselbe Buchungslogik wie überall, idempotent über die Umsatz-ID).
 */
export function BankAusgabenKarte({ abbuchungen }: { abbuchungen: AusgehenderBankUmsatz[] }) {
  return (
    <Karte
      titel="Bank: Abbuchungen"
      untertitel="Bekannte Gegenparteien werden nach Verlauf automatisch gebucht — hier stehen nur neue."
      zahl={String(abbuchungen.length)}
      fuss="offen"
      warnung={abbuchungen.length > 0}
      offen={abbuchungen.length > 0}
    >
      {abbuchungen.length === 0 ? (
        <p className="text-muted-foreground text-sm">Keine offene Abbuchung.</p>
      ) : (
        <MehrListe start={6} kinder={abbuchungen.map((u) => (
            <li key={u.id} className="border-line mb-2 flex flex-col gap-2 rounded-2xl border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground">
                  {tag(u.datum)} · <span className="text-foreground font-semibold tabular-nums">−{eur(u.betragCent)}</span>
                  {u.gegenpartei ? ` · ${u.gegenpartei}` : ""}
                </span>
                <form action={bankUmsatzIgnorieren}>
                  <input type="hidden" name="umsatzId" value={u.id} />
                  <button className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2">Ignorieren</button>
                </form>
              </div>
              {u.verwendungszweck && <p className="text-muted-foreground truncate text-xs">{u.verwendungszweck}</p>}
              <form action={bankAusgabeBuchen} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="umsatzId" value={u.id} />
                <AdminSelect name="kategorie" aria-label="Kategorie" defaultValue="Sonstiges" className="max-w-[12rem]">
                  {KATEGORIEN.ausgabe.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </AdminSelect>
                <AdminSelect name="ust" aria-label="USt-Satz" defaultValue="19" className="max-w-[6rem]">
                  <option value="19">19 %</option>
                  <option value="7">7 %</option>
                  <option value="0">0 %</option>
                </AdminSelect>
                <AdminSelect name="geschaeftsfeld" aria-label="Geschäftsfeld" defaultValue="" className="max-w-[14rem]">
                  <option value="">Feld offen</option>
                  {GESCHAEFTSFELDER.map((g) => (
                    <option key={g.key} value={g.key}>
                      {g.label}
                    </option>
                  ))}
                </AdminSelect>
                <button className="bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-xs font-semibold">Als Ausgabe buchen</button>
              </form>
            </li>
          ))} />
      )}
    </Karte>
  )
}
