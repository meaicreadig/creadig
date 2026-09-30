import Link from "next/link"

import { type CockpitDaten, STUFEN } from "@/lib/cockpit"

type Sprache = "de" | "tr"

const TEXT = {
  de: {
    label: "Cockpit",
    anfragen: "Anfragen · 7 Tage",
    pipeline: "Offene Pipeline",
    chancen: (n: number) => `${n} Chancen`,
    rechnungen: "Gestellte Rechnungen",
    posts: "Veröffentlicht · 7 Tage",
    nichtGemessen: "nicht gemessen",
    vorwoche: (d: number) => (d === 0 ? "wie Vorwoche" : `${d > 0 ? "+" : ""}${d} zur Vorwoche`),
    wochen: "Anfragen je Woche",
    stufen: "Pipeline nach Stufe",
    quellen: "Herkunft · 90 Tage",
    keineDaten: "Noch keine Daten",
    stufe: {
      new: "Neu", contacted: "Kontakt", qualified: "Qualifiziert", discovery: "Gespräch", audit: "Check",
      proposal: "Angebot", negotiation: "Verhandlung", won: "Gewonnen", lost: "Verloren",
    } as Record<string, string>,
  },
  tr: {
    label: "Kokpit",
    anfragen: "Talepler · 7 gün",
    pipeline: "Açık pipeline",
    chancen: (n: number) => `${n} fırsat`,
    rechnungen: "Kesilen faturalar",
    posts: "Yayınlanan · 7 gün",
    nichtGemessen: "ölçülmedi",
    vorwoche: (d: number) => (d === 0 ? "geçen haftayla aynı" : `geçen haftaya göre ${d > 0 ? "+" : ""}${d}`),
    wochen: "Haftalık talepler",
    stufen: "Aşamaya göre pipeline",
    quellen: "Kaynak · 90 gün",
    keineDaten: "Henüz veri yok",
    stufe: {
      new: "Yeni", contacted: "Temas", qualified: "Nitelikli", discovery: "Görüşme", audit: "Check",
      proposal: "Teklif", negotiation: "Pazarlık", won: "Kazanıldı", lost: "Kaybedildi",
    } as Record<string, string>,
  },
}

export function CockpitBand({ daten, sprache, intl }: { daten: CockpitDaten; sprache: Sprache; intl: string }) {
  const t = TEXT[sprache] ?? TEXT.de
  const euro = new Intl.NumberFormat(intl, { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
  const delta = daten.anfragen7 !== null && daten.anfragenVor7 !== null ? daten.anfragen7 - daten.anfragenVor7 : null

  const kacheln = [
    {
      label: t.anfragen,
      wert: daten.anfragen7,
      unter: delta !== null ? t.vorwoche(delta) : null,
      ton: delta !== null && delta > 0 ? "text-gold-text" : "text-muted-foreground",
      href: "/admin/vertrieb/anfragen",
    },
    {
      label: t.pipeline,
      wert: daten.pipelineWert !== null ? euro.format(daten.pipelineWert) : null,
      unter: daten.pipelineOffen !== null ? t.chancen(daten.pipelineOffen) : null,
      ton: "text-muted-foreground",
      href: "/admin/vertrieb/pipeline",
    },
    {
      label: t.rechnungen,
      wert: daten.rechnungenGestellt,
      unter: null,
      ton: "text-muted-foreground",
      href: "/admin/kunden",
    },
    {
      label: t.posts,
      wert: daten.posts7,
      unter: null,
      ton: "text-muted-foreground",
      href: "/admin/veroeffentlichungen",
    },
  ]

  const maxWoche = Math.max(1, ...(daten.wochen ?? []).map((w) => w.anzahl))
  const stufenMap = new Map((daten.stufen ?? []).map((s) => [s.stufe, s.anzahl]))
  const stufenAktiv = STUFEN.filter((s) => (stufenMap.get(s) ?? 0) > 0)
  const stufenSumme = stufenAktiv.reduce((a, s) => a + (stufenMap.get(s) ?? 0), 0)
  const maxQuelle = Math.max(1, ...(daten.quellen ?? []).map((q) => q.anzahl))

  return (
    <section aria-label={t.label} className="mb-12">
      <ul className="border-line bg-line grid grid-cols-2 gap-px overflow-hidden rounded-lg border lg:grid-cols-4">
        {kacheln.map((k) => (
          <li key={k.label} className="bg-surface">
            <Link href={k.href} className="group hover:bg-background focus-visible:bg-background flex h-full flex-col gap-3 p-5 transition-colors">
              <span className="text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase">{k.label}</span>
              <span className="font-display text-3xl font-semibold tabular-nums tracking-tight md:text-4xl">
                {k.wert ?? <span className="text-muted-foreground">—</span>}
              </span>
              <span className={`text-xs ${k.wert === null ? "text-muted-foreground" : k.ton}`}>
                {k.wert === null ? t.nichtGemessen : k.unter ?? "\u00a0"}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel titel={t.wochen}>
          {daten.wochen && daten.wochen.some((w) => w.anzahl > 0) ? (
            <div className="flex h-28 items-end gap-2" role="img" aria-label={daten.wochen.map((w) => `${w.start}: ${w.anzahl}`).join(", ")}>
              {daten.wochen.map((w, i) => (
                <div key={w.start} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-muted-foreground text-[10px] tabular-nums">{w.anzahl || ""}</span>
                  <div
                    className={`w-full rounded-sm ${i === daten.wochen!.length - 1 ? "bg-gold" : "bg-foreground/20"}`}
                    style={{ height: `${Math.max(4, (w.anzahl / maxWoche) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Leer text={daten.wochen ? t.keineDaten : t.nichtGemessen} />
          )}
        </Panel>

        <Panel titel={t.stufen}>
          {stufenSumme > 0 ? (
            <>
              <div className="flex h-3 w-full overflow-hidden rounded-full" aria-hidden="true">
                {stufenAktiv.map((s) => (
                  <div
                    key={s}
                    className={s === "won" ? "bg-gold" : s === "lost" ? "bg-destructive/60" : "bg-foreground/25 border-surface border-r-2 last:border-r-0"}
                    style={{ width: `${((stufenMap.get(s) ?? 0) / stufenSumme) * 100}%` }}
                  />
                ))}
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                {stufenAktiv.map((s) => (
                  <li key={s} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{t.stufe[s] ?? s}</span>
                    <span className="tabular-nums">{stufenMap.get(s)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <Leer text={daten.stufen ? t.keineDaten : t.nichtGemessen} />
          )}
        </Panel>

        <Panel titel={t.quellen}>
          {daten.quellen && daten.quellen.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {daten.quellen.map((q) => (
                <li key={q.quelle} className="flex flex-col gap-1">
                  <span className="flex justify-between text-sm">
                    <span className="truncate">{q.quelle}</span>
                    <span className="tabular-nums">{q.anzahl}</span>
                  </span>
                  <span className="bg-foreground/10 block h-1.5 overflow-hidden rounded-full">
                    <span className="bg-gold block h-full rounded-full" style={{ width: `${(q.anzahl / maxQuelle) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Leer text={daten.quellen ? t.keineDaten : t.nichtGemessen} />
          )}
        </Panel>
      </div>
    </section>
  )
}

function Panel({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div className="border-line bg-surface flex flex-col gap-4 rounded-lg border p-5">
      <h2 className="text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase">{titel}</h2>
      {children}
    </div>
  )
}

function Leer({ text }: { text: string }) {
  return <p className="text-muted-foreground flex h-28 items-center text-sm">{text}</p>
}
