import Link from "next/link"

import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { eur, monatKurz } from "@/components/finanz/format"
import { finanzDb } from "@/lib/finanz/store"
import { finanzOwnerSeite } from "@/lib/finanz/zugang"
import { finanzBasis } from "@/lib/finanz/basis"
import {
  HOMEOFFICE_MAX_JAHR_CENT,
  ladeArchiv,
  ladePauschalen,
  ladeSonderausgaben,
  maxTage,
  type PauschalArt,
} from "@/lib/finanz/pauschalen"
import { pauschaleSpeichern } from "./actions"

export const dynamic = "force-dynamic"
export const metadata = { title: "Pauschalen" }

const ART_LABEL: Record<string, string> = { spende: "Spenden", kirchensteuer: "Kirchensteuer", vorsorge: "Vorsorge", sonstige: "Sonstige" }

export default async function FinanzPauschalen({ searchParams }: { searchParams: Promise<{ jahr?: string; hinweis?: string }> }) {
  await finanzOwnerSeite()
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="pauschalen" titel="Pauschalen"><OhneSpeicher /></FinanzShell>

  const heute = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date())
  const diesesJahr = heute.slice(0, 4)
  const jahre = [diesesJahr, String(Number(diesesJahr) - 1)]
  const sp = await searchParams
  const jahr = sp.jahr && jahre.includes(sp.jahr) ? sp.jahr : diesesJahr
  const [p, archiv, sonder, basis] = await Promise.all([ladePauschalen(db, jahr), ladeArchiv(db), ladeSonderausgaben(db), finanzBasis()])
  const monate = p.monate.filter((m) => m.monat <= heute.slice(0, 7))

  return (
    <FinanzShell
      aktiv="pauschalen"
      titel="Pauschalen"
      unterzeile="Pauschalen mindern den Gewinn in der EÜR, bewegen aber kein Geld auf dem Konto."
    >
      <nav aria-label="Jahr" className="flex gap-2">
        {jahre.map((j) => (
          <Link
            key={j}
            href={`${basis}/pauschalen?jahr=${j}`}
            aria-current={j === jahr ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium ${j === jahr ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
          >
            {j}
          </Link>
        ))}
      </nav>

      {sp.hinweis && (
        <p role="status" className="bg-card text-foreground rounded-2xl px-5 py-3 text-sm">
          {sp.hinweis}
        </p>
      )}

      <section aria-label="Summen" className="grid gap-5 md:grid-cols-4">
        <Karte titel="Gesamt (mindert Gewinn)" wert={eur(p.summe.gesamtCent)} betont />
        <Karte titel="Fahrten 0,30 €/km" wert={eur(p.summe.fahrtCent)} />
        <Karte titel="Verpflegung 14 €/Tag" wert={eur(p.summe.verpflegungCent)} fuss="nur Tage über 8 Stunden" />
        <Karte
          titel="Homeoffice 6 €/Tag"
          wert={eur(p.summe.homeofficeCent)}
          fuss={`noch frei ${eur(p.homeofficeRestCent)} von ${eur(HOMEOFFICE_MAX_JAHR_CENT)}`}
        />
      </section>

      <section aria-labelledby="monate-titel" className="bg-card flex flex-col gap-4 rounded-[2rem] p-7">
        <h2 id="monate-titel" className="font-semibold">Monate {jahr}</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm">
            <thead className="text-muted-foreground text-left">
              <tr>
                <th scope="col" className="py-2 font-medium">Monat</th>
                <th scope="col" className="py-2 font-medium">Fahrten</th>
                <th scope="col" className="py-2 font-medium">Verpflegung (Tage)</th>
                <th scope="col" className="py-2 font-medium">Homeoffice (Tage)</th>
              </tr>
            </thead>
            <tbody>
              {monate.map((m) => (
                <tr key={m.monat} className="border-border/60 border-t">
                  <td className="py-3 font-medium">{monatKurz(m.monat)}</td>
                  <td className="py-3 tabular-nums">
                    {m.fahrtCent ? eur(m.fahrtCent) : "–"}
                    {m.fahrtKm ? <span className="text-muted-foreground block text-xs">{Math.round(m.fahrtKm).toLocaleString("de-DE")} km</span> : null}
                  </td>
                  <td className="py-3">
                    <TageFeld art="verpflegung" monat={m.monat} tage={m.verpflegungTage} cent={m.verpflegungCent} />
                  </td>
                  <td className="py-3">
                    <TageFeld art="homeoffice" monat={m.monat} tage={m.homeofficeTage} cent={m.homeofficeCent} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Fahrten Januar–Juli kommen aus fibero, ab August als Pauschale nach derselben Methode. Homeoffice gilt ab 20.10.2025 und wird automatisch bei 1.260 € im Jahr begrenzt.
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section aria-labelledby="archiv-titel" className="bg-card flex flex-col gap-3 rounded-[2rem] p-7">
          <h2 id="archiv-titel" className="font-semibold">Archiv: Tank- und Essensbelege</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Durch die km- und Verpflegungspauschale abgegolten. Die Belege bleiben gespeichert, zählen aber nicht doppelt im Gewinn.
          </p>
          {archiv.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nichts archiviert.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {archiv.map((a) => (
                <li key={`${a.jahr}-${a.kategorie}-${a.grund}`} className="flex items-baseline justify-between gap-4">
                  <span>
                    {a.jahr} · {a.kategorie} <span className="text-muted-foreground">({a.anzahl})</span>
                  </span>
                  <span className="tabular-nums">{eur(a.summeCent)}</span>
                </li>
              ))}
              <li className="border-border/60 flex justify-between border-t pt-2 font-medium">
                <span>Summe für den Steuerberater</span>
                <span className="tabular-nums">{eur(archiv.reduce((s, a) => s + a.summeCent, 0))}</span>
              </li>
            </ul>
          )}
        </section>

        <section aria-labelledby="sonder-titel" className="bg-card flex flex-col gap-3 rounded-[2rem] p-7">
          <h2 id="sonder-titel" className="font-semibold">Sonderausgaben</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Privat, nicht Teil der EÜR. Sie mindern die Einkommensteuer in der Erklärung.
          </p>
          {sonder.length === 0 ? (
            <p className="text-muted-foreground text-sm">Keine eingetragen.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {sonder.map((s) => (
                <li key={`${s.jahr}-${s.art}`} className="flex items-baseline justify-between gap-4">
                  <span>{s.jahr} · {ART_LABEL[s.art] ?? s.art}</span>
                  <span className="text-primary font-semibold tabular-nums">{eur(s.summeCent)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </FinanzShell>
  )
}

function TageFeld({ art, monat, tage, cent }: { art: PauschalArt; monat: string; tage: number; cent: number }) {
  const max = maxTage(art, monat)
  if (max === 0) return <span className="text-muted-foreground">–</span>
  const label = `${art === "verpflegung" ? "Verpflegungstage" : "Homeoffice-Tage"} ${monatKurz(monat)}`
  return (
    <form action={pauschaleSpeichern} className="flex items-center gap-2">
      <input type="hidden" name="art" value={art} />
      <input type="hidden" name="monat" value={monat} />
      <label className="sr-only" htmlFor={`${art}-${monat}`}>{label}</label>
      <input
        id={`${art}-${monat}`}
        name="tage"
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        defaultValue={tage || ""}
        placeholder="0"
        className="bg-background w-16 rounded-full px-3 py-1.5 text-sm tabular-nums"
      />
      <button type="submit" className="bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-xs font-medium">
        Buchen
      </button>
      {cent > 0 && <span className="text-muted-foreground text-xs tabular-nums">{eur(cent)}</span>}
    </form>
  )
}

function Karte({ titel, wert, fuss, betont }: { titel: string; wert: string; fuss?: string; betont?: boolean }) {
  return (
    <div className="bg-card flex flex-col gap-2 rounded-[2rem] p-7">
      <span className="text-muted-foreground text-sm font-medium">{titel}</span>
      <span className={`text-2xl font-semibold tracking-tight tabular-nums ${betont ? "text-primary" : ""}`}>{wert}</span>
      {fuss && <span className="text-muted-foreground text-xs">{fuss}</span>}
    </div>
  )
}
