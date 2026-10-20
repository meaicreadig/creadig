import { bescheidStornieren } from "@/app/(finanz)/finanz/bescheide/actions"
import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { BescheidFormular } from "@/components/finanz/bescheid-formular"
import { eur, tag } from "@/components/finanz/format"
import { BESCHEID_ARTEN, STEUERARTEN, ladeBescheide } from "@/lib/finanz/bescheide"
import { heuteBerlin } from "@/lib/finanz/rechnen"
import { finanzDb } from "@/lib/finanz/store"
import { finanzOwnerSeite } from "@/lib/finanz/zugang"

export const dynamic = "force-dynamic"
export const metadata = { title: "Bescheide" }

export default async function FinanzBescheide() {
  await finanzOwnerSeite()
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="bescheide" titel="Bescheide"><OhneSpeicher /></FinanzShell>
  const bescheide = await ladeBescheide(db)

  return (
    <FinanzShell
      aktiv="bescheide"
      titel="Bescheide"
      unterzeile="Was das Finanzamt festgesetzt hat. Vorauszahlungen und Nachzahlungen wirken direkt auf Fristen und Liquidität."
    >
      <BescheidFormular heute={heuteBerlin()} />
      <section aria-labelledby="liste" className="bg-card flex flex-col gap-2 rounded-[2rem] p-4">
        <h2 id="liste" className="px-3 pt-2 text-lg font-semibold">Abgelegt</h2>
        {bescheide.length === 0 && <p className="text-muted-foreground p-3 text-sm">Noch kein Bescheid abgelegt.</p>}
        <ul className="flex flex-col">
          {bescheide.map((b) => (
            <li key={b.id} className={`border-line flex flex-wrap items-center gap-3 border-b p-3 last:border-0 ${b.storniert ? "opacity-50" : ""}`}>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">
                  {STEUERARTEN[b.steuerart]} {b.jahr} · {BESCHEID_ARTEN[b.art]}
                  {b.storniert ? " (storniert)" : ""}
                </span>
                <span className="text-muted-foreground text-xs">
                  {tag(b.datum)}
                  {b.gueltigAb ? ` · gilt ab ${tag(b.gueltigAb)}` : ""}
                  {b.aktenzeichen ? ` · ${b.aktenzeichen}` : ""}
                  {b.ablageort ? ` · Original: ${b.ablageort}` : ""}
                </span>
              </div>
              {b.betragCent !== null && <span className="tabular-nums">{eur(b.betragCent)}</span>}
              {!b.storniert && (
                <form action={bescheidStornieren}>
                  <input type="hidden" name="id" value={b.id} />
                  <button type="submit" className="text-muted-foreground text-xs underline">Stornieren</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>
    </FinanzShell>
  )
}
