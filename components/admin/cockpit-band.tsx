import Link from "next/link"

import { type CockpitDaten, STUFEN } from "@/lib/cockpit"
import { kanalName } from "@/lib/kanal"

type Sprache = "de" | "tr"

const TEXT = {
  de: {
    label: "Cockpit",
    anfragen: "Anfragen · 7 Tage",
    pipeline: "Offene Pipeline",
    chancen: (n: number) => `${n} Chancen`,
    rechnungen: "Offene Rechnungen",
    rechnungenAnzahl: (n: number) => (n === 1 ? "1 Rechnung offen" : `${n} Rechnungen offen`),
    posts: "Veröffentlicht · 7 Tage",
    nichtGemessen: "nicht gemessen",
    vorwoche: (d: number) => (d === 0 ? "wie Vorwoche" : `${d > 0 ? "+" : ""}${d} zur Vorwoche`),
    wochen: "Anfragen je Woche",
    stufen: "Pipeline nach Stufe",
    quellen: "Kanal · 90 Tage",
    offen: "Nicht eingeordnet",
    gewonnen: (n: number) => `${n} gewonnen`,
    keineDaten: "Noch keine Daten",
    termine: "Termine · 7 Tage",
    keineTermine: "Keine Termine gebucht",
    linksOffen: "Terminlink ohne Antwort",
    keineLinks: "Alle Links beantwortet",
    seit: (tage: number) => `vor ${tage} Tagen gesendet`,
    nachfassen: "Nachfassen",
    gast: "Gast",
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
    rechnungen: "Açık faturalar",
    rechnungenAnzahl: (n: number) => `${n} fatura açık`,
    posts: "Yayınlanan · 7 gün",
    nichtGemessen: "ölçülmedi",
    vorwoche: (d: number) => (d === 0 ? "geçen haftayla aynı" : `geçen haftaya göre ${d > 0 ? "+" : ""}${d}`),
    wochen: "Haftalık talepler",
    stufen: "Aşamaya göre pipeline",
    quellen: "Kanal · 90 gün",
    offen: "Seçilmedi",
    gewonnen: (n: number) => `${n} kazanıldı`,
    keineDaten: "Henüz veri yok",
    termine: "Randevular · 7 gün",
    keineTermine: "Alınmış randevu yok",
    linksOffen: "Yanıtsız randevu linki",
    keineLinks: "Tüm linkler yanıtlandı",
    seit: (tage: number) => `${tage} gün önce gönderildi`,
    nachfassen: "Takip et",
    gast: "Misafir",
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
      wert: daten.rechnungenOffenCent !== null ? euro.format(daten.rechnungenOffenCent / 100) : null,
      unter: daten.rechnungenOffen !== null ? t.rechnungenAnzahl(daten.rechnungenOffen) : null,
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
  const terminZeit = new Intl.DateTimeFormat(intl, {
    weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin",
  })
  const jetzt = Date.now()

  return (
    <section aria-label={t.label} className="mb-12">
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Panel titel={t.termine}>
          {daten.termine && daten.termine.length > 0 ? (
            <ul className="flex flex-col">
              {daten.termine.map((x) => (
                <li key={x.start} className="border-line border-b last:border-b-0">
                  <Link
                    href={x.kontaktId ? `/admin/gespraech?kontakt=${encodeURIComponent(x.kontaktId)}` : "/admin/termine"}
                    className="hover:text-gold-text flex items-baseline justify-between gap-3 py-2.5 text-sm transition-colors"
                  >
                    <span className="truncate">{x.name || t.gast}</span>
                    <span className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums">{terminZeit.format(new Date(x.start))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">{daten.termine ? t.keineTermine : t.nichtGemessen}</p>
          )}
        </Panel>

        <Panel titel={t.linksOffen}>
          {daten.linksOffen && daten.linksOffen.length > 0 ? (
            <ul className="flex flex-col">
              {daten.linksOffen.map((x) => (
                <li key={x.token} className="border-line flex items-center justify-between gap-3 border-b py-2.5 last:border-b-0">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm">{x.name || t.gast}</span>
                    <span className="text-muted-foreground text-xs">
                      {t.seit(Math.max(1, Math.floor((jetzt - new Date(x.seit).getTime()) / 86_400_000)))}
                    </span>
                  </span>
                  <Link
                    href={x.kontaktId ? `/admin/termine?kontakt=${encodeURIComponent(x.kontaktId)}` : "/admin/termine"}
                    className="border-gold/40 text-gold-text hover:bg-gold/10 shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    {t.nachfassen}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">{daten.linksOffen ? t.keineLinks : t.nichtGemessen}</p>
          )}
        </Panel>
      </div>
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
                  <span className="flex justify-between gap-2 text-sm">
                    <span className={`truncate ${q.quelle === "offen" ? "text-muted-foreground" : ""}`}>
                      {q.quelle === "offen" ? t.offen : kanalName(q.quelle, sprache)}
                    </span>
                    <span className="flex gap-2 tabular-nums">
                      {q.gewonnen > 0 ? <span className="text-gold-text">{t.gewonnen(q.gewonnen)}</span> : null}
                      <span>{q.anzahl}</span>
                    </span>
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
