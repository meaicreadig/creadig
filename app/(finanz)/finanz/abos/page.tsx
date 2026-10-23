import Link from "next/link"

import { aboUmschalten } from "@/app/(finanz)/finanz/abos/actions"
import { AboFormular } from "@/components/finanz/abo-formular"
import { eur, tag } from "@/components/finanz/format"
import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { Reveal } from "@/components/ui/reveal"
import { Zaehler } from "@/components/ui/zaehler"
import { kundenSchluessel } from "@/lib/finanz/abos-shared"
import { INTERVALL_LABEL, VORLAUF_TAGE, ladeAbos } from "@/lib/finanz/abos"
import { ladeKunden } from "@/lib/finanz/auftraege/store"
import { heuteBerlin } from "@/lib/finanz/rechnen"
import { finanzDb } from "@/lib/finanz/store"
import { finanzOwnerSeite } from "@/lib/finanz/zugang"

export const dynamic = "force-dynamic"
export const metadata = { title: "Wiederkehrende Rechnungen" }

export default async function FinanzAbos() {
  await finanzOwnerSeite()
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="abos" titel="Wiederkehrende Rechnungen"><OhneSpeicher /></FinanzShell>
  const [abos, kunden] = await Promise.all([ladeAbos(db), ladeKunden(db)])
  const heute = heuteBerlin()
  const jahresCent = abos.filter((a) => a.aktiv).reduce((s, a) => {
    const netto = a.positionen.reduce((x, p) => x + p.preisCent * p.menge, 0)
    return s + netto * (a.intervall === "monat" ? 12 : a.intervall === "quartal" ? 4 : 1)
  }, 0)

  return (
    <FinanzShell
      aktiv="abos"
      titel="Wiederkehrende Rechnungen"
      unterzeile={`${VORLAUF_TAGE} Tage vor dem Termin liegt ein Entwurf bereit. Versenden bleibt dein Klick.`}
    >
      <section className="bg-card flex flex-col gap-2 rounded-[2rem] p-7">
        <h2 className="text-muted-foreground text-sm font-medium">Planbarer Jahresumsatz (netto, aktive Abos)</h2>
        <Zaehler wert={jahresCent / 100} waehrung nachkomma={2} className="text-primary text-4xl font-semibold tabular-nums" />
      </section>

      <section className="bg-card flex flex-col gap-4 rounded-[2rem] p-7">
        <h2 className="text-lg font-semibold">Abos</h2>
        {abos.length === 0 ? (
          <p className="text-muted-foreground text-sm">Noch kein Abo. Lege eines an — der Rest läuft von allein bis zum Entwurf.</p>
        ) : (
          <ul className="flex flex-col">
            {/* Gestaffelt, ab der neunten Zeile ohne weitere Verzögerung – lange Listen sollen nicht nachlaufen. */}
            {abos.map((a, i) => (
              <Reveal as="li" key={a.id} delay={Math.min(i, 8) * 0.04} duration={0.35} y={16} className="border-line flex flex-wrap items-center gap-3 border-b py-3 last:border-0">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{a.titel} · {a.kunde.firma || a.kunde.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {INTERVALL_LABEL[a.intervall]} · {a.aktiv ? `nächster Termin ${tag(a.naechste)}` : "pausiert"}
                  </span>
                </div>
                <span className="tabular-nums">{eur(a.positionen.reduce((x, p) => x + p.preisCent * p.menge, 0))} netto</span>
                {a.letzterEntwurfId && <Link href={`/finanz/vorgang/${a.letzterEntwurfId}`} className="text-gold-text text-sm underline">letzter Entwurf</Link>}
                <form action={aboUmschalten}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="aktiv" value={a.aktiv ? "0" : "1"} />
                  <button type="submit" className="text-muted-foreground text-xs underline">{a.aktiv ? "Pausieren" : "Fortsetzen"}</button>
                </form>
              </Reveal>
            ))}
          </ul>
        )}
        <details>
          <summary className="text-muted-foreground cursor-pointer text-sm">Abo hinzufügen</summary>
          <div className="mt-4">
            <AboFormular kunden={kunden.map((k) => ({ schluessel: kundenSchluessel(k), label: k.firma || k.name }))} heute={heute} />
          </div>
        </details>
      </section>
    </FinanzShell>
  )
}
