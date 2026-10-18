import { eur, eurRund, monatKurz } from "@/components/finanz/format"
import type { Hinweis, Monat, Steuertopf } from "@/lib/finanz/rechnen"
import type { Paragraph19Projektion, Paragraph19Status } from "@/lib/finanz/paragraph19"
import { aufUstPflichtUmstellen } from "@/app/(finanz)/finanz/actions"

const SCHWERE = {
  critical: { text: "Jetzt", punkt: "bg-destructive" },
  attention: { text: "Bald", punkt: "bg-amber-500" },
  neutral: { text: "Gut", punkt: "bg-primary" },
} as const

const AMPEL = {
  ruhig: { balken: "bg-primary", text: "text-muted-foreground" },
  achtung: { balken: "bg-amber-500", text: "text-amber-600" },
  kritisch: { balken: "bg-destructive", text: "text-destructive" },
  ueberschritten: { balken: "bg-destructive", text: "text-destructive" },
} as const

function Paragraph19Ampel({ status, vorschau }: { status: Paragraph19Status; vorschau: Paragraph19Projektion | null }) {
  const t = AMPEL[status.ampel]
  const breite = Math.min(100, Math.round(status.anteilLaufendesJahr * 100))
  return (
    <div className="bg-background flex flex-col gap-2 rounded-2xl p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">§ 19-Umsatzgrenze (laufendes Jahr)</span>
        <span className={`text-sm font-semibold tabular-nums ${t.text}`}>{eur(status.laufendesJahrUmsatzCent)} / 100.000 €</span>
      </div>
      <div className="bg-muted h-2 overflow-hidden rounded-full" role="img" aria-label={`${breite}% der § 19-Umsatzgrenze erreicht`}>
        <div className={`h-full rounded-full ${t.balken}`} style={{ width: `${breite}%` }} />
      </div>
      <p className={`text-xs ${status.ampel === "ruhig" ? "text-muted-foreground" : t.text}`}>
        {status.ampel === "ueberschritten"
          ? status.vorjahrUeberschritten
            ? `Vorjahresumsatz (${eur(status.vorjahrUmsatzCent)}) über 25.000 € — § 19 gilt dieses Jahr eigentlich nicht mehr.`
            : `Grenze am ${status.ueberschrittenAm} überschritten — ab da keine Rechnung mehr ohne USt.`
          : `Noch ${eur(status.abstandLaufendesJahrCent)} Luft bis zur Grenze.`}
      </p>
      {/* Projektion (Phase 4) — ausschließlich eine Was-wäre-wenn-Zeile, niemals vermischt mit der echten Zahl oben und löst keine § 19-Aktion aus. */}
      {vorschau?.sichtbar && (
        <p className="text-muted-foreground text-xs italic">
          Falls deine Beratungs-Ziele eintreffen: ~{eur(vorschau.projektionCent)} — Grenze wäre dann in Reichweite.
        </p>
      )}
      {status.ampel !== "ruhig" && (
        <form action={aufUstPflichtUmstellen} className="flex flex-col gap-2 border-t pt-3">
          <label className="flex items-start gap-2 text-xs leading-relaxed">
            <input type="checkbox" name="bestaetigt" required className="accent-primary mt-0.5 size-3.5" />
            Ich stelle Finanz jetzt auf umsatzsteuerpflichtig um — neue Rechnungen weisen ab sofort USt aus. Bereits festgeschriebene Rechnungen bleiben unverändert.
          </label>
          <button type="submit" className="bg-primary text-primary-foreground w-fit rounded-full px-4 py-2 text-xs font-semibold">
            Auf umsatzsteuerpflichtig umstellen
          </button>
        </form>
      )}
    </div>
  )
}

export function FinanzKompass({
  stand,
  frei,
  topf,
  reichweite,
  hinweise,
  verlauf,
  paragraph19,
  paragraph19Vorschau,
}: {
  stand: number
  frei: number
  topf: Steuertopf
  reichweite: number | null
  hinweise: Hinweis[]
  verlauf: Monat[]
  paragraph19: Paragraph19Status | null
  paragraph19Vorschau?: Paragraph19Projektion | null
}) {
  const max = Math.max(1, ...verlauf.flatMap((m) => [m.einCent, m.ausCent]))

  return (
    <section aria-labelledby="kompass" className="grid gap-5 lg:grid-cols-5">
      <div className="bg-card relative flex flex-col gap-8 overflow-hidden rounded-[2rem] p-7 shadow-sm md:p-9 lg:col-span-3">
        <div className="relative flex flex-col gap-2">
          <h2 id="kompass" className="text-muted-foreground text-sm font-medium">
            Frei verfügbar
          </h2>
          <p className="text-primary font-sans text-5xl font-semibold tracking-tight tabular-nums md:text-7xl">{eurRund(frei)}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">Kontostand minus Steuertopf – dieses Geld gehört wirklich dir.</p>
        </div>

        <dl className="relative grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4">
          <Kennzahl titel="Kontostand" wert={eurRund(stand)} />
          <Kennzahl titel="USt offen" wert={eurRund(topf.ustOffenCent)} />
          <Kennzahl titel="ESt-Rücklage" wert={eurRund(topf.estRuecklageCent)} />
          <Kennzahl titel="Reichweite" wert={reichweite === null ? "–" : `${reichweite.toFixed(1)} Mon.`} />
        </dl>

        <div className="relative flex h-24 items-end gap-3" role="img" aria-label="Einnahmen und Ausgaben der letzten sechs Monate">
          {verlauf.map((m) => (
            <div key={m.schluessel} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-20 w-full items-end justify-center gap-1">
                <span className="bg-primary w-1/3 rounded-full" style={{ height: `${Math.max(4, (m.einCent / max) * 100)}%` }} title={`Ein ${eur(m.einCent)}`} />
                <span className="bg-primary/25 w-1/3 rounded-full" style={{ height: `${Math.max(4, (m.ausCent / max) * 100)}%` }} title={`Aus ${eur(m.ausCent)}`} />
              </div>
              <span className="text-muted-foreground text-xs">{monatKurz(m.schluessel)}</span>
            </div>
          ))}
        </div>

        {paragraph19 && <Paragraph19Ampel status={paragraph19} vorschau={paragraph19Vorschau ?? null} />}
      </div>

      <div className="bg-card flex flex-col gap-5 rounded-[2rem] p-7 lg:col-span-2">
        <h2 className="text-lg font-semibold">Was jetzt zählt</h2>
        {hinweise.length === 0 ? (
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Alles im grünen Bereich. Trag Einnahmen und Ausgaben ein, dann sagt dir der Kompass, was als Nächstes zählt.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {hinweise.map((h) => (
              <li key={h.text} className="flex gap-3">
                <span className={`mt-2 size-2 shrink-0 rounded-full ${SCHWERE[h.schwere].punkt}`} aria-hidden />
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs font-medium">{SCHWERE[h.schwere].text}</span>
                  <p className="leading-relaxed text-pretty">{h.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-muted-foreground mt-auto text-sm">
          Gewinn {new Date().getFullYear()} bisher: <span className="text-foreground font-semibold tabular-nums">{eur(topf.gewinnJahrCent)}</span> netto
        </p>
      </div>
    </section>
  )
}

function Kennzahl({ titel, wert }: { titel: string; wert: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground text-xs font-medium">{titel}</dt>
      <dd className="text-lg font-semibold tabular-nums">{wert}</dd>
    </div>
  )
}
