import { headers } from "next/headers"

import { AdminShell } from "@/components/admin/admin-shell"
import { AktionKnopf, AktionMeldung } from "@/components/admin/aktion-knopf"
import { Pill, Surface } from "@/components/admin/primitives"
import { istGueltig, ladeInvestorLinks } from "@/lib/investor/store"

import { investorLinkAnlegen, investorLinkWiderrufen } from "./actions"

export const metadata = { title: "Investoren" }
export const dynamic = "force-dynamic"

const datum = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric" }) : "—"

const feld = "w-full rounded-2xl bg-muted px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"

export default async function InvestorenSeite(props: { searchParams: Promise<{ neu?: string }> }) {
  const { neu } = await props.searchParams
  const h = await headers()
  const basis = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host") ?? "creadig.de"}`
  const links = await ladeInvestorLinks().catch(() => [])
  const offen = links.filter(istGueltig)
  const geoeffnet = offen.filter((l) => l.aufrufe > 0).length

  return (
    <AdminShell
      title="Investoren"
      lead="Jeder Investor bekommt einen eigenen, vertraulichen Link (EN, AR oder DE) mit Live-Zahlen aus Finanz und Vertrieb. Öffnet er ihn das erste Mal, landet automatisch eine Nachfass-Aufgabe in deinem Eingang."
    >
      <AktionMeldung />
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Surface>
            <p className="text-sm text-muted-foreground">Aktive Links</p>
            <p className="font-sans text-3xl font-semibold text-primary">{offen.length}</p>
          </Surface>
          <Surface>
            <p className="text-sm text-muted-foreground">Davon geöffnet</p>
            <p className="font-sans text-3xl font-semibold text-primary">{geoeffnet}</p>
          </Surface>
          <Surface>
            <p className="text-sm text-muted-foreground">Golf-Radar</p>
            <p className="text-sm leading-relaxed text-foreground">Sucht wöchentlich 3 Chancen in VAE, Saudi-Arabien und Katar, mit fertiger Nachricht auf Englisch und Arabisch.</p>
            <a href="/admin/assistent#kapital" className="text-sm font-medium text-primary">Zu den Chancen</a>
          </Surface>
        </div>

        {neu && (
          <Surface className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Neuer Link. Kopieren und persönlich mitschicken:</p>
            <input readOnly value={`${basis}/investor/${neu}`} className={`${feld} font-mono`} aria-label="Neuer Investor-Link" />
          </Surface>
        )}

        <Surface className="flex flex-col gap-4">
          <h2 className="font-sans text-lg font-semibold text-foreground">Neuen Investor einladen</h2>
          <form action={investorLinkAnlegen} className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              Name
              <input name="name" required maxLength={120} placeholder="z. B. Ahmed Al Mansouri" className={feld} />
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              Firma / Fonds
              <input name="firma" maxLength={120} placeholder="z. B. Hub71" className={feld} />
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              Sprache
              <select name="sprache" defaultValue="en" className={feld}>
                <option value="en">Englisch</option>
                <option value="ar">Arabisch</option>
                <option value="de">Deutsch</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              Gültig für
              <select name="tage" defaultValue="30" className={feld}>
                <option value="14">14 Tage</option>
                <option value="30">30 Tage</option>
                <option value="90">90 Tage</option>
                <option value="180">180 Tage</option>
              </select>
            </label>
            <label className="flex items-center gap-3 text-sm text-foreground md:col-span-2">
              <input type="checkbox" name="zahlen" value="ja" defaultChecked className="size-4 accent-primary" />
              Umsatz, Wachstum und Pipeline zeigen (sonst nur Agenten und Abteilungen)
            </label>
            <div className="md:col-span-2">
              <AktionKnopf>Link erstellen</AktionKnopf>
            </div>
          </form>
        </Surface>

        <Surface className="flex flex-col gap-4">
          <h2 className="font-sans text-lg font-semibold text-foreground">Alle Einladungen</h2>
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Einladung. Der Golf-Radar liefert dir die ersten Adressen.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {links.map((l) => {
                const aktiv = istGueltig(l)
                return (
                  <li key={l.token} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted p-4">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-medium text-foreground">
                        {l.name}
                        {l.firma ? ` · ${l.firma}` : ""}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {l.sprache.toUpperCase()} · erstellt {datum(l.erstelltAm)} · gültig bis {datum(l.gueltigBis)} · {l.aufrufe}× geöffnet
                        {l.zuletztAm ? `, zuletzt ${datum(l.zuletztAm)}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill severity={!aktiv ? "neutral" : l.aufrufe > 0 ? "attention" : "neutral"}>
                        {!aktiv ? "beendet" : l.aufrufe > 0 ? "geöffnet" : "versendet"}
                      </Pill>
                      {aktiv && (
                        <>
                          <a href={`${basis}/investor/${l.token}`} target="_blank" rel="noreferrer" className="rounded-full bg-card px-4 py-2 text-sm text-primary">
                            Ansehen
                          </a>
                          <form action={investorLinkWiderrufen}>
                            <input type="hidden" name="token" value={l.token} />
                            <AktionKnopf className="rounded-full bg-card px-4 py-2 text-sm text-muted-foreground">Zurückziehen</AktionKnopf>
                          </form>
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Surface>
      </div>
    </AdminShell>
  )
}
