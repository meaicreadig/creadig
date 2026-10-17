import Link from "next/link"
import { Download } from "lucide-react"

import { eur } from "@/components/finanz/format"
import type { EuerErgebnis } from "@/lib/finanz/euer"

/** Jahresabschluss (Phase 5): EÜR nach Zufluss-/Abflussprinzip + Steuerberater-Paket zum Herunterladen. */
export function FinanzEuer({ euer, jahre, jahrAktuell }: { euer: EuerErgebnis; jahre: string[]; jahrAktuell: string }) {
  return (
    <section aria-labelledby="euer-titel" className="bg-card flex flex-col gap-6 rounded-[2rem] p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="euer-titel" className="text-xl font-semibold tracking-tight">
            Jahresabschluss — Einnahmenüberschussrechnung
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
            Zufluss-/Abflussprinzip (§ 11 EStG) auf Basis gebuchter Zahlungen — keine Steuerberatung, zur Durchsicht mit dem Steuerberater.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <nav aria-label="Jahr wählen" className="bg-background flex gap-1 rounded-full p-1">
            {jahre.map((j) => (
              <Link
                key={j}
                href={`?jahr=${j}`}
                aria-current={j === jahrAktuell ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${j === jahrAktuell ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {j}
              </Link>
            ))}
          </nav>
          <a
            href={`/finanz/steuern/export?jahr=${jahrAktuell}`}
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
          >
            <Download className="size-4" aria-hidden />
            Steuerberater-Paket
          </a>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <EuerListe titel="Betriebseinnahmen" zeilen={euer.einnahmen} summeCent={euer.summeEinnahmenCent} />
        <EuerListe titel="Betriebsausgaben" zeilen={euer.ausgaben} summeCent={euer.summeAusgabenCent} />
      </div>

      <div className="bg-background flex items-center justify-between rounded-2xl px-5 py-4">
        <span className="font-semibold">Gewinn / Verlust {jahrAktuell}</span>
        <span className={`font-mono text-xl font-semibold tabular-nums ${euer.gewinnCent < 0 ? "text-destructive" : "text-primary"}`}>{eur(euer.gewinnCent)}</span>
      </div>
      {euer.privatentnahmeCent > 0 && (
        <p className="text-muted-foreground text-xs">
          nachrichtlich: Privatentnahmen {eur(euer.privatentnahmeCent)} — bewegen das Konto, nicht den Gewinn.
        </p>
      )}

      {euer.jeGeschaeftsfeld.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Ergebnis je Geschäftsfeld</h3>
          <ul className="divide-border flex flex-col divide-y">
            {euer.jeGeschaeftsfeld.map((f) => (
              <li key={f.key} className="flex items-center justify-between py-2 text-sm">
                <span>{f.label}</span>
                <span className="font-mono tabular-nums">{eur(f.einCent - f.ausCent)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function EuerListe({ titel, zeilen, summeCent }: { titel: string; zeilen: { kategorie: string; position: string; cent: number }[]; summeCent: number }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">{titel}</h3>
      {zeilen.length === 0 ? (
        <p className="text-muted-foreground text-sm">Keine gebuchten Posten in diesem Jahr.</p>
      ) : (
        <ul className="divide-border flex flex-col divide-y">
          {zeilen.map((z) => (
            <li key={z.kategorie} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="flex flex-col">
                <span>{z.kategorie}</span>
                <span className="text-muted-foreground text-xs">{z.position}</span>
              </span>
              <span className="font-mono tabular-nums">{eur(z.cent)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="border-border flex items-center justify-between border-t pt-2 text-sm font-semibold">
        <span>Summe</span>
        <span className="font-mono tabular-nums">{eur(summeCent)}</span>
      </div>
    </div>
  )
}
