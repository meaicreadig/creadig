import { anlageArchivieren, anlageBewerten } from "@/app/(finanz)/finanz/investment/actions"
import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { AnlageFormular } from "@/components/finanz/anlage-formular"
import { eur, eurRund, tag } from "@/components/finanz/format"
import { AdminInput } from "@/components/admin/primitives"
import { ladeFelder } from "@/lib/finanz/felder"
import { KLASSEN, VERALTET_NACH_TAGEN, PUFFER_MONATE, feldRendite, investierbar, ladeAnlagen, nachAnlage, vermoegensbild } from "@/lib/finanz/investment"
import { berechneLage } from "@/lib/finanz/lage"
import { finanzDb } from "@/lib/finanz/store"
import { finanzOwnerSeite } from "@/lib/finanz/zugang"

export const dynamic = "force-dynamic"
export const metadata = { title: "Investment" }

export default async function FinanzInvestment({ searchParams }: { searchParams: Promise<{ betrag?: string }> }) {
  await finanzOwnerSeite()
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="investment" titel="Investment"><OhneSpeicher /></FinanzShell>

  const lage = await berechneLage(db)
  const [anlagen, felder] = await Promise.all([ladeAnlagen(db), ladeFelder(db, lage.heute.slice(0, 4))])
  const inv = investierbar(lage.frei, lage.verlauf)
  const bild = vermoegensbild(anlagen, lage.frei, lage.heute)
  const rendite = feldRendite(felder.felder)

  const roh = (await searchParams).betrag?.replace(/\s|€/g, "") ?? ""
  const probe = roh ? Math.round(Number(roh.includes(",") ? roh.replace(/\./g, "").replace(",", ".") : roh) * 100) : null
  const folge = probe !== null && Number.isFinite(probe) && probe > 0 ? { betrag: probe, ...nachAnlage(inv, probe) } : null

  return (
    <FinanzShell
      aktiv="investment"
      titel="Investment"
      unterzeile="Erst Steuern, dann Reserve, dann Investition. Was übrig ist, steht oben — und wohin es bisher ging."
    >
      <section aria-labelledby="inv-jetzt" className="bg-card flex flex-col gap-6 rounded-[2rem] p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="inv-jetzt" className="text-muted-foreground text-sm font-medium">Investierbar jetzt</h2>
            <span className="text-primary text-5xl font-semibold tracking-tight tabular-nums">{eurRund(inv.investierbarCent)}</span>
          </div>
          <span className="text-muted-foreground max-w-md text-sm">
            {inv.reichweite === null
              ? "Noch keine Ausgaben-Historie — die Reserve lässt sich noch nicht berechnen."
              : `Das freie Geld reicht für ${inv.reichweite.toFixed(1)} Monate.`}
          </span>
        </div>
        <ol className="grid gap-3 md:grid-cols-4">
          <Schritt n="1" label="Kontostand" wert={eurRund(lage.stand)} />
          <Schritt n="2" label="− Steuertopf (USt + ESt)" wert={eurRund(lage.topf.gesamtCent)} />
          <Schritt n="3" label={`− Reserve (${PUFFER_MONATE} Monatsausgaben)`} wert={eurRund(inv.reserveCent)} />
          <Schritt n="4" label="= Investierbar" wert={eurRund(inv.investierbarCent)} stark />
        </ol>
        <form method="get" className="flex flex-wrap items-end gap-3" aria-label="Was wäre wenn">
          <label className="flex flex-col gap-1.5 text-sm">
            Was passiert, wenn ich … € anlege?
            <AdminInput name="betrag" inputMode="decimal" placeholder="z. B. 5.000" defaultValue={roh} className="w-44" />
          </label>
          <button type="submit" className="border-gold text-gold-text hover:bg-gold/10 rounded-full border px-4 py-2 text-sm">Durchrechnen</button>
        </form>
        {folge && (
          <p role="status" className={`text-sm leading-relaxed ${folge.unterReserve ? "text-destructive" : "text-foreground"}`}>
            Nach {eur(folge.betrag)} Anlage bleiben {folge.reichweite === null ? "—" : `${folge.reichweite.toFixed(1)} Monate`} Reichweite.
            {folge.unterReserve
              ? ` Das liegt unter deiner Reserve von ${PUFFER_MONATE} Monaten${folge.ueberInvestierbar ? ` und ${eur(folge.betrag - inv.investierbarCent)} über dem, was investierbar ist` : ""}.`
              : " Die Reserve bleibt unangetastet."}
          </p>
        )}
      </section>

      <section aria-labelledby="verm" className="bg-card flex flex-col gap-5 rounded-[2rem] p-7">
        <h2 id="verm" className="text-lg font-semibold">Vermögen außerhalb des Kontos</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Kennzahl label="Anlagen (Wert)" wert={eurRund(bild.anlagenWertCent)} />
          <Kennzahl
            label="Ergebnis gegenüber Einstand"
            wert={`${bild.ergebnisCent >= 0 ? "+" : "−"}${eurRund(Math.abs(bild.ergebnisCent))}`}
            fuss={bild.renditeProzent === null ? undefined : `${bild.renditeProzent >= 0 ? "+" : ""}${bild.renditeProzent.toFixed(1).replace(".", ",")} %`}
          />
          <Kennzahl label="Frei verfügbares Gesamtvermögen" wert={eurRund(bild.gesamtCent)} fuss="Konto nach Steuertopf + Anlagen" />
        </div>
        {bild.klassen.length > 0 && (
          <ul className="flex flex-col gap-3">
            {bild.klassen.map((k) => (
              <li key={k.klasse} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium">{k.label}</span>
                  <span className="text-muted-foreground tabular-nums">{Math.round(k.anteil * 100)} % · {eurRund(k.wertCent)}</span>
                </div>
                <div className="bg-background h-2 overflow-hidden rounded-full" role="img" aria-label={`${Math.round(k.anteil * 100)} % Anteil`}>
                  <div className="bg-primary h-full rounded-full" style={{ width: `${Math.round(k.anteil * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
        {bild.konzentriert && (
          <p className="text-amber-600 text-sm">{Math.round(bild.konzentriert.anteil * 100)} % der Anlagen liegen in einer Klasse ({bild.konzentriert.label}).</p>
        )}
        {bild.veraltet.length > 0 && (
          <p className="text-amber-600 text-sm">
            Älter als {VERALTET_NACH_TAGEN} Tage bewertet: {bild.veraltet.map((a) => a.name).join(", ")} — die Zahl kann abweichen.
          </p>
        )}

        <ul className="flex flex-col">
          {anlagen.length === 0 && <li className="text-muted-foreground text-sm">Noch keine Anlage eingetragen. Werte trägst du selbst mit Stichtag ein — es gibt keine Live-Kurse.</li>}
          {anlagen.map((a) => (
            <li key={a.id} className="border-line flex flex-wrap items-center gap-3 border-b py-3 last:border-0">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">{a.name}</span>
                <span className="text-muted-foreground text-xs">
                  {KLASSEN[a.klasse]} · seit {tag(a.seit)} · eingesetzt {eur(a.einstandCent)}
                  {a.stand ? ` · Stand ${tag(a.stand)}` : ""}
                </span>
              </div>
              <span className="tabular-nums">{a.wertCent === null ? "—" : eur(a.wertCent)}</span>
              <form action={anlageBewerten} className="flex items-center gap-2">
                <input type="hidden" name="id" value={a.id} />
                <label className="sr-only" htmlFor={`w-${a.id}`}>Neuer Wert</label>
                <AdminInput id={`w-${a.id}`} name="wert" inputMode="decimal" placeholder="Wert €" className="w-28" />
                <button type="submit" className="border-gold text-gold-text hover:bg-gold/10 rounded-full border px-3 py-2 text-sm">Bewerten</button>
              </form>
              <form action={anlageArchivieren}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="text-muted-foreground text-xs underline">Archivieren</button>
              </form>
            </li>
          ))}
        </ul>
        <details className="group">
          <summary className="text-muted-foreground cursor-pointer text-sm">Anlage hinzufügen</summary>
          <div className="mt-4"><AnlageFormular heute={lage.heute} /></div>
        </details>
      </section>

      <section aria-labelledby="eigen" className="bg-card flex flex-col gap-4 rounded-[2rem] p-7">
        <h2 id="eigen" className="text-lg font-semibold">Investition ins eigene Geschäft · {lage.heute.slice(0, 4)}</h2>
        <p className="text-muted-foreground text-sm">Was ein ausgegebener Euro je Geschäftsfeld bisher zurückgebracht hat (Einnahmen ÷ Ausgaben, netto). Eine Beobachtung aus den Zahlen, keine Empfehlung.</p>
        {rendite.length === 0 ? (
          <p className="text-muted-foreground text-sm">Noch keine zugeordneten Buchungen.</p>
        ) : (
          <ul className="flex flex-col">
            {rendite.map((f) => (
              <li key={f.key} className="border-line flex flex-wrap items-baseline justify-between gap-2 border-b py-2.5 last:border-0">
                <span className="font-medium">{f.label}</span>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {eurRund(f.ausCent)} aus · {eurRund(f.einCent)} ein ·{" "}
                  <strong className="text-foreground">{f.ruckfluss === null ? "kein Einsatz" : `${f.ruckfluss.toFixed(2).replace(".", ",")} € je 1 €`}</strong>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-muted-foreground text-xs leading-relaxed">
        Keine Anlageberatung. Werte sind deine Eingaben mit Stichtag; es gibt keine Live-Kurse. Die Reserve rechnet mit dem Durchschnitt der letzten vollen Monate.
      </p>
    </FinanzShell>
  )
}

function Schritt({ n, label, wert, stark }: { n: string; label: string; wert: string; stark?: boolean }) {
  return (
    <li className={`flex flex-col gap-1 rounded-2xl p-4 ${stark ? "bg-primary/10" : "bg-background"}`}>
      <span className="text-muted-foreground text-xs">{n} · {label}</span>
      <span className={`tabular-nums ${stark ? "text-xl font-semibold" : "text-lg font-medium"}`}>{wert}</span>
    </li>
  )
}

function Kennzahl({ label, wert, fuss }: { label: string; wert: string; fuss?: string }) {
  return (
    <div className="bg-background flex flex-col gap-1 rounded-2xl p-4">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{wert}</span>
      {fuss && <span className="text-muted-foreground text-xs">{fuss}</span>}
    </div>
  )
}
