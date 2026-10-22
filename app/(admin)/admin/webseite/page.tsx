import { after } from "next/server"
import { ExternalLink, ScanSearch } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { AktionKnopf, AktionMeldung } from "@/components/admin/aktion-knopf"
import { Surface } from "@/components/admin/primitives"
import { adminSprache } from "@/lib/admin-i18n/server"
import { BEREICHE, ladeLetztePruefung, ladeVerlauf, type Befund, type Bereich, type Erledigung } from "@/lib/webseite/pruefer"

import { webseiteJetztPruefen } from "./actions"

export const metadata = { title: "Website-Prüfer" }
export const dynamic = "force-dynamic"

const BEREICH_TEXT: Record<Bereich, { de: string; tr: string }> = {
  inhalt: { de: "Inhalt", tr: "İçerik" },
  technik: { de: "Technik", tr: "Teknik" },
  sicherheit: { de: "Sicherheit", tr: "Güvenlik" },
  international: { de: "International", tr: "Uluslararası" },
  leistung: { de: "Tempo", tr: "Hız" },
  design: { de: "Design", tr: "Tasarım" },
}

const ERLEDIGUNG_TEXT: Record<Erledigung, { de: string; tr: string }> = {
  behoben: { de: "Selbst behoben", tr: "Kendisi düzeltti" },
  abteilung: { de: "An Abteilung übergeben", tr: "Departmana verildi" },
  emin: { de: "Braucht dich", tr: "Sana kaldı" },
}

const SCHWERE_RANG = { kritisch: 0, wichtig: 1, hinweis: 2 } as const

function notenFarbe(n: number) {
  if (n >= 85) return "text-primary"
  if (n >= 65) return "text-foreground"
  return "text-destructive"
}

export default async function WebseitePruefung() {
  const sprache = await adminSprache()
  const tr = sprache === "tr"
  const [p, verlauf] = await Promise.all([ladeLetztePruefung(), ladeVerlauf(14)])

  const alt = !p || Date.now() - new Date(p.erstelltAm).getTime() > 30 * 3600 * 1000
  if (alt) {
    after(async () => {
      const { fuehreAgentAus } = await import("@/lib/assistent/truppe")
      await fuehreAgentAus("webseite").catch(() => {})
    })
  }

  const befunde = [...(p?.befunde ?? [])].sort((a, b) => SCHWERE_RANG[a.schwere] - SCHWERE_RANG[b.schwere])
  const gruppen: Record<Erledigung, Befund[]> = { emin: [], abteilung: [], behoben: [] }
  for (const b of befunde) gruppen[b.erledigung].push(b)

  const intl = tr ? "tr-TR" : "de-DE"

  return (
    <AdminShell
      title={tr ? "Web sitesi denetçisi" : "Website-Prüfer"}
      lead={
        tr
          ? "creadig.de her gün 4 dilde denetlenir: içerik, teknik, güvenlik, uluslararası olgunluk, hız ve tasarım. Yapabileceğini kendisi düzeltir, kalanı ilgili departmana veya sana iletir."
          : "creadig.de wird täglich in 4 Sprachen geprüft: Inhalt, Technik, Sicherheit, internationale Reife, Tempo und Design. Was er darf, behebt er selbst – den Rest gibt er an die zuständige Abteilung oder an dich."
      }
    >
      <AktionMeldung />

      <Surface className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              {tr ? "Genel not" : "Gesamtnote"}
            </p>
            <p className={`font-display text-6xl font-semibold tabular-nums ${p ? notenFarbe(p.gesamt) : "text-muted-foreground"}`}>
              {p ? p.gesamt : "–"}
              <span className="text-2xl text-muted-foreground">/100</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {p
                ? `${tr ? "Son denetim" : "Letzte Prüfung"}: ${new Date(p.erstelltAm).toLocaleString(intl, { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" })} · ${p.seiten} ${tr ? "sayfa" : "Seiten"}`
                : tr
                  ? "İlk denetim arka planda başladı."
                  : "Erste Prüfung läuft im Hintergrund."}
            </p>
          </div>
          <form action={webseiteJetztPruefen}>
            <AktionKnopf
              laeuft={tr ? "Başlatılıyor …" : "Wird gestartet …"}
              fertig={tr ? "Başladı" : "Gestartet"}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              <ScanSearch className="size-4" aria-hidden />
              {tr ? "Derin denetim başlat" : "Tiefenprüfung starten"}
            </AktionKnopf>
          </form>
        </div>

        {p && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {BEREICHE.map((b) => (
              <li key={b} className="flex flex-col gap-1 rounded-2xl bg-muted/60 p-4">
                <span className="text-xs text-muted-foreground">{BEREICH_TEXT[b][sprache]}</span>
                <span className={`font-display text-2xl font-semibold tabular-nums ${notenFarbe(p.noten[b])}`}>{p.noten[b]}</span>
              </li>
            ))}
          </ul>
        )}

        {verlauf.length > 1 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">{tr ? "Son denetimler" : "Verlauf"}</p>
            <div className="flex h-16 items-end gap-1.5" role="img" aria-label={verlauf.map((v) => v.gesamt).join(", ")}>
              {verlauf.map((v) => (
                <div key={v.id} className="flex-1 rounded-t-md bg-primary/70" style={{ height: `${Math.max(6, v.gesamt)}%` }} />
              ))}
            </div>
          </div>
        )}
      </Surface>

      {p?.psi && (
        <Surface className="flex flex-col gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Google PageSpeed · Mobil</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              [tr ? "Performans" : "Leistung", p.psi.leistung],
              [tr ? "Erişilebilirlik" : "Barrierefreiheit", p.psi.barriere],
              [tr ? "İyi uygulama" : "Best Practice", p.psi.praxis],
              ["SEO", p.psi.seo],
              ["LCP", p.psi.lcp],
              ["CLS", p.psi.cls],
            ].map(([label, wert]) => (
              <li key={String(label)} className="flex flex-col gap-1 rounded-2xl bg-muted/60 p-4">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className={`font-display text-xl font-semibold tabular-nums ${typeof wert === "number" ? notenFarbe(wert) : "text-foreground"}`}>
                  {wert}
                </span>
              </li>
            ))}
          </ul>
        </Surface>
      )}

      {p?.anweisung && (
        <Surface className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            {tr ? "Yönetime rapor" : "Rückmeldung an die Geschäftsleitung"}
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{p.anweisung}</p>
        </Surface>
      )}

      {(["emin", "abteilung", "behoben"] as const).map((art) =>
        gruppen[art].length ? (
          <Surface key={art} className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-display text-lg font-semibold">{ERLEDIGUNG_TEXT[art][sprache]}</h2>
              <span className="text-sm tabular-nums text-muted-foreground">{gruppen[art].length}</span>
            </div>
            <ul className="flex flex-col gap-3">
              {gruppen[art].map((b) => (
                <li key={b.code + (b.url ?? "")} className="flex flex-col gap-1 rounded-2xl bg-muted/60 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        b.schwere === "kritisch"
                          ? "bg-destructive/15 text-destructive"
                          : b.schwere === "wichtig"
                            ? "bg-primary/15 text-primary"
                            : "bg-background text-muted-foreground"
                      }`}
                    >
                      {b.schwere === "kritisch" ? (tr ? "Kritik" : "Kritisch") : b.schwere === "wichtig" ? (tr ? "Önemli" : "Wichtig") : tr ? "Not" : "Hinweis"}
                    </span>
                    <span className="text-xs text-muted-foreground">{BEREICH_TEXT[b.bereich][sprache]}</span>
                    {b.an && <span className="text-xs text-muted-foreground">→ {b.an}</span>}
                  </div>
                  <p className="text-sm font-medium text-foreground text-pretty">{b.titel}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{b.detail}</p>
                  {b.url && (
                    <a href={b.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary">
                      {b.url.replace(/^https?:\/\//, "")}
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Surface>
        ) : null,
      )}
    </AdminShell>
  )
}
