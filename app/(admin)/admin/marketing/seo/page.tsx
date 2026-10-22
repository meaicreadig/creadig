import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { Pill, Surface } from "@/components/admin/primitives"
import { ladeSeoBericht, type SeoSumme, type SeoZeile } from "@/lib/seo/search-console"

export const metadata = { title: "SEO & Google" }
export const dynamic = "force-dynamic"

const zahl = new Intl.NumberFormat("de-DE")
const EINE_STELLE = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 })
const GANZ = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 })
const prozent = (v: number) => `${EINE_STELLE.format(v * 100)} %`
const platz = (v: number) => EINE_STELLE.format(v)

function Veraenderung({ jetzt, vorher, besserWennKleiner = false }: { jetzt: number; vorher: number; besserWennKleiner?: boolean }) {
  if (!vorher) return <span className="text-xs text-muted-foreground">kein Vergleich</span>
  const diff = (jetzt - vorher) / vorher
  const gut = besserWennKleiner ? diff < 0 : diff > 0
  const Icon = diff >= 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${gut ? "text-primary" : "text-destructive"}`}>
      <Icon className="size-3.5" aria-hidden="true" />
      {GANZ.format(Math.abs(diff * 100))} % zu den 28 Tagen davor
    </span>
  )
}

function Kennzahlen({ jetzt, vorher }: { jetzt: SeoSumme; vorher: SeoSumme }) {
  const kacheln = [
    { label: "Klicks aus Google", wert: zahl.format(jetzt.klicks), a: jetzt.klicks, b: vorher.klicks, klein: false },
    { label: "Gesehen in Google", wert: zahl.format(jetzt.impressionen), a: jetzt.impressionen, b: vorher.impressionen, klein: false },
    { label: "Klickrate", wert: prozent(jetzt.ctr), a: jetzt.ctr, b: vorher.ctr, klein: false },
    { label: "Ø Platz", wert: jetzt.position ? platz(jetzt.position) : "–", a: jetzt.position, b: vorher.position, klein: true },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kacheln.map((k) => (
        <Surface key={k.label}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{k.label}</span>
            <span className="font-sans text-3xl font-semibold tabular-nums text-primary">{k.wert}</span>
            <Veraenderung jetzt={k.a} vorher={k.b} besserWennKleiner={k.klein} />
          </div>
        </Surface>
      ))}
    </div>
  )
}

function Verlauf({ tage }: { tage: { datum: string; klicks: number; impressionen: number }[] }) {
  const max = Math.max(1, ...tage.map((t) => t.klicks))
  const summe = tage.reduce((s, t) => s + t.klicks, 0)
  return (
    <Surface>
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-sans text-lg font-semibold">Klicks pro Tag · 90 Tage</h2>
          <span className="text-sm tabular-nums text-muted-foreground">{zahl.format(summe)} gesamt</span>
        </div>
        {tage.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Daten – Google braucht nach dem Verbinden einige Tage.</p>
        ) : (
          <div className="flex h-36 items-end gap-px" role="img" aria-label={`Klicks pro Tag, insgesamt ${summe}`}>
            {tage.map((t) => (
              <div
                key={t.datum}
                title={`${t.datum}: ${t.klicks} Klicks, ${t.impressionen} mal gesehen`}
                className="min-h-px flex-1 rounded-t-sm bg-primary/80 hover:bg-primary"
                style={{ height: `${(t.klicks / max) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </Surface>
  )
}

function Tabelle({ titel, zeilen, kurz }: { titel: string; zeilen: SeoZeile[]; kurz?: (s: string) => string }) {
  return (
    <Surface>
      <div className="flex flex-col gap-3">
        <h2 className="font-sans text-lg font-semibold">{titel}</h2>
        {zeilen.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Daten.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="pb-2 font-normal">Was</th>
                <th className="pb-2 text-right font-normal">Klicks</th>
                <th className="pb-2 text-right font-normal">Gesehen</th>
                <th className="pb-2 text-right font-normal">Platz</th>
              </tr>
            </thead>
            <tbody>
              {zeilen.map((z) => (
                <tr key={z.keys[0]} className="align-top">
                  <td className="max-w-0 truncate py-1.5 pr-3" title={z.keys[0]}>
                    {kurz ? kurz(z.keys[0]) : z.keys[0]}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">{zahl.format(z.clicks)}</td>
                  <td className="py-1.5 text-right tabular-nums text-muted-foreground">{zahl.format(z.impressions)}</td>
                  <td className="py-1.5 text-right tabular-nums text-muted-foreground">{platz(z.position)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Surface>
  )
}

function Einrichtung({ meldung, dienstkonto }: { meldung?: string; dienstkonto?: string }) {
  const schritte = [
    <>
      Öffne <span className="font-medium">search.google.com/search-console</span> und füge eine Property vom Typ <span className="font-medium">Domain</span> hinzu: <span className="font-medium">creadig.de</span>.
    </>,
    <>
      Google zeigt dir einen TXT-Eintrag. Trag ihn bei Cloudflare unter DNS → Eintrag hinzufügen (Typ TXT, Name @) ein und klick in Google auf „Bestätigen“.
    </>,
    <>
      Unter Sitemaps einreichen: <span className="font-medium">https://creadig.de/sitemap.xml</span> (die Datei gibt es schon).
    </>,
    <>
      Öffne <span className="font-medium">console.cloud.google.com</span>, leg ein Projekt an (z. B. „creadig-seo“), such „Google Search Console API“ und klick „Aktivieren“.
    </>,
    <>
      IAM &amp; Verwaltung → Dienstkonten → Dienstkonto erstellen (Name „seo-leser“, keine Rolle nötig). Danach im Dienstkonto: Schlüssel → Schlüssel hinzufügen → JSON. Es lädt eine Datei herunter.
    </>,
    <>
      Zurück in der Search Console: Einstellungen → Nutzer und Berechtigungen → Nutzer hinzufügen. Trag die E-Mail des Dienstkontos ein ({dienstkonto ? <span className="font-medium">{dienstkonto}</span> : "endet auf …iam.gserviceaccount.com"}), Berechtigung „Eingeschränkt“.
    </>,
    <>
      In v0 unter Einstellungen → Vars: <span className="font-medium">GOOGLE_SERVICE_ACCOUNT_JSON</span> anlegen und den kompletten Inhalt der JSON-Datei einfügen. Fertig – diese Seite füllt sich dann selbst.
    </>,
  ]
  return (
    <Surface>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-sans text-lg font-semibold">Google verbinden</h2>
          <Pill severity={meldung ? "critical" : "attention"}>{meldung ? "Fehler" : "nicht verbunden"}</Pill>
        </div>
        {meldung && <p className="rounded-2xl bg-muted/60 p-3 text-sm text-pretty">{meldung}</p>}
        <ol className="flex flex-col gap-3">
          {schritte.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-pretty">{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </Surface>
  )
}

export default async function SeoSeite() {
  const b = await ladeSeoBericht()

  if (b.status !== "ok") {
    return (
      <AdminShell title="SEO & Google" meta={<span className="block">Wie oft Google uns zeigt – und wie oft geklickt wird.</span>}>
        <Einrichtung meldung={b.status === "fehler" ? b.meldung : undefined} dienstkonto={b.status === "fehler" ? b.dienstkonto : undefined} />
      </AdminShell>
    )
  }

  const pfad = (url: string) => {
    try {
      return new URL(url).pathname || "/"
    } catch {
      return url
    }
  }
  const geraet: Record<string, string> = { MOBILE: "Handy", DESKTOP: "Computer", TABLET: "Tablet" }

  return (
    <AdminShell
      title="SEO & Google"
      meta={<span className="block">{`${b.site.replace("sc-domain:", "")} · letzte 28 Tage bis ${b.bis} (Google meldet mit 2 Tagen Verzug)`}</span>}
    >
      <div className="flex flex-col gap-6">
        <Kennzahlen jetzt={b.jetzt} vorher={b.vorher} />
        <Verlauf tage={b.tage} />

        <Surface>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="font-sans text-lg font-semibold">Chancen: fast oben</h2>
              <p className="text-sm text-muted-foreground text-pretty">
                Google zeigt uns hier schon, aber auf Platz 4–20. Eine eigene Seite oder ein Artikel genau zu diesem Suchwort bringt am schnellsten neue Klicks.
              </p>
            </div>
            {b.chancen.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine – es braucht erst mehr Sichtbarkeit.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {b.chancen.map((z) => (
                  <li key={z.keys[0]} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-muted/40 px-4 py-2.5 text-sm">
                    <span className="font-medium">{z.keys[0]}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {zahl.format(z.impressions)}× gesehen · Platz {platz(z.position)} · {zahl.format(z.clicks)} Klicks
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Surface>

        <div className="grid gap-6 lg:grid-cols-2">
          <Tabelle titel="Wonach Menschen suchen" zeilen={b.suchanfragen} />
          <Tabelle titel="Welche Seiten gefunden werden" zeilen={b.seiten} kurz={pfad} />
          <Tabelle titel="Gerät" zeilen={b.geraete} kurz={(s) => geraet[s] ?? s} />
          <Tabelle titel="Land" zeilen={b.laender} kurz={(s) => s.toUpperCase()} />
        </div>
      </div>
    </AdminShell>
  )
}
