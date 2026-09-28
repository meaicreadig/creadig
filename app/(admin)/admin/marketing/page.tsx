import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { ladeMarketing } from "@/lib/marketing"

export const dynamic = "force-dynamic"

const TEXT = {
  de: {
    titel: "Marketing",
    meta: "LinkedIn, Website, Netzwerk — was hinausging und was zurückkam",
    posts: "Veröffentlicht · 30 Tage",
    reaktion: "Mit Reaktion · 30 Tage",
    quote: (p: number) => `${p} % Antwortquote`,
    anfragen: "Anfragen aus Beiträgen · 90 Tage",
    linkedin: "Leads über LinkedIn · 90 Tage",
    wochen: "Beiträge je Woche",
    kanaele: "Kanäle · 90 Tage",
    reaktionen: "Reaktionen · 90 Tage",
    letzte: "Zuletzt veröffentlicht",
    alle: "Alle Veröffentlichungen",
    neu: "Beitrag erfassen",
    nichtGemessen: "nicht gemessen",
    keineDaten: "Noch keine Daten",
    kanal: { linkedin: "LinkedIn", website: "Website", netzwerk: "Netzwerk", gespraech: "Gespräch", andere: "Andere" } as Record<string, string>,
    reakt: {
      keine: "—", kommentar: "Kommentar", nachricht: "Nachricht", anruf: "Anruf",
      empfehlung: "Empfehlung", anfrage: "Anfrage", andere: "Andere",
    } as Record<string, string>,
  },
  tr: {
    titel: "Pazarlama",
    meta: "LinkedIn, web sitesi, ağ — ne çıktı, ne geri döndü",
    posts: "Yayınlanan · 30 gün",
    reaktion: "Tepki alan · 30 gün",
    quote: (p: number) => `%${p} yanıt oranı`,
    anfragen: "Paylaşımlardan talep · 90 gün",
    linkedin: "LinkedIn'den gelen lead · 90 gün",
    wochen: "Haftalık paylaşım",
    kanaele: "Kanallar · 90 gün",
    reaktionen: "Tepkiler · 90 gün",
    letzte: "Son yayınlananlar",
    alle: "Tüm yayınlar",
    neu: "Paylaşım ekle",
    nichtGemessen: "ölçülmedi",
    keineDaten: "Henüz veri yok",
    kanal: { linkedin: "LinkedIn", website: "Web sitesi", netzwerk: "Ağ", gespraech: "Görüşme", andere: "Diğer" } as Record<string, string>,
    reakt: {
      keine: "—", kommentar: "Yorum", nachricht: "Mesaj", anruf: "Arama",
      empfehlung: "Tavsiye", anfrage: "Talep", andere: "Diğer",
    } as Record<string, string>,
  },
}

export default async function MarketingSeite() {
  const { sprache, intl } = await adminSprachKontext()
  const t = TEXT[sprache === "tr" ? "tr" : "de"]
  const d = await ladeMarketing()
  const datum = new Intl.DateTimeFormat(intl, { day: "2-digit", month: "short" })

  const quote = d.posts30 && d.mitReaktion30 !== null ? Math.round((d.mitReaktion30 / d.posts30) * 100) : null
  const kacheln = [
    { label: t.posts, wert: d.posts30, unter: null as string | null },
    { label: t.reaktion, wert: d.mitReaktion30, unter: quote !== null ? t.quote(quote) : null },
    { label: t.anfragen, wert: d.anfragenAusPosts90, unter: null },
    { label: t.linkedin, wert: d.linkedinLeads90, unter: null },
  ]
  const maxWoche = Math.max(1, ...(d.wochen ?? []).map((w) => w.anzahl))
  const maxKanal = Math.max(1, ...(d.kanaele ?? []).map((k) => k.anzahl))

  return (
    <AdminShell
      title={t.titel}
      meta={<span className="block">{t.meta}</span>}
    >
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/veroeffentlichungen#erfassen"
          className="bg-foreground text-background inline-flex h-10 items-center rounded-md px-4 text-sm font-medium transition-opacity hover:opacity-90"
        >
          {t.neu}
        </Link>
        <Link
          href="/admin/veroeffentlichungen"
          className="border-border inline-flex h-10 items-center rounded-md border px-4 text-sm transition-colors hover:border-gold"
        >
          {t.alle}
        </Link>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kacheln.map((k) => (
          <li key={k.label} className="border-border bg-surface flex flex-col gap-2 rounded-lg border p-4">
            <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-widest">{k.label}</span>
            <span className={`text-3xl font-medium tabular-nums ${k.wert === null ? "text-muted-foreground text-base" : ""}`}>
              {k.wert ?? t.nichtGemessen}
            </span>
            {k.unter ? <span className="text-gold-text text-xs">{k.unter}</span> : null}
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel titel={t.wochen}>
          {d.wochen && d.wochen.some((w) => w.anzahl > 0) ? (
            <div className="flex h-28 items-end gap-2" role="img" aria-label={d.wochen.map((w) => `${w.start}: ${w.anzahl}`).join(", ")}>
              {d.wochen.map((w, i) => (
                <div key={w.start} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-muted-foreground text-[10px] tabular-nums">{w.anzahl || ""}</span>
                  <div
                    className={`w-full rounded-sm ${i === d.wochen!.length - 1 ? "bg-gold" : "bg-foreground/20"}`}
                    style={{ height: `${Math.max(4, (w.anzahl / maxWoche) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Leer text={d.wochen ? t.keineDaten : t.nichtGemessen} />
          )}
        </Panel>

        <Panel titel={t.kanaele}>
          {d.kanaele && d.kanaele.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {d.kanaele.map((k) => (
                <li key={k.kanal} className="flex flex-col gap-1">
                  <span className="flex justify-between text-sm">
                    <span>{t.kanal[k.kanal] ?? k.kanal}</span>
                    <span className="tabular-nums">{k.anzahl}</span>
                  </span>
                  <span className="bg-foreground/10 block h-1.5 overflow-hidden rounded-full">
                    <span
                      className={`block h-full rounded-full ${k.kanal === "linkedin" ? "bg-gold" : "bg-foreground/40"}`}
                      style={{ width: `${(k.anzahl / maxKanal) * 100}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Leer text={d.kanaele ? t.keineDaten : t.nichtGemessen} />
          )}
        </Panel>

        <Panel titel={t.reaktionen}>
          {d.reaktionen && d.reaktionen.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {d.reaktionen.map((r) => (
                <li
                  key={r.reaktion}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${
                    r.reaktion === "anfrage" ? "border-gold text-gold-text" : "border-border"
                  }`}
                >
                  {t.reakt[r.reaktion] ?? r.reaktion}
                  <span className="tabular-nums">{r.anzahl}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Leer text={d.reaktionen ? t.keineDaten : t.nichtGemessen} />
          )}
        </Panel>
      </div>

      <section className="border-border bg-surface mt-4 rounded-lg border p-4" aria-labelledby="letzte">
        <h2 id="letzte" className="text-muted-foreground font-mono text-[11px] uppercase tracking-widest">
          {t.letzte}
        </h2>
        {d.letzte && d.letzte.length > 0 ? (
          <ul className="divide-border mt-3 flex flex-col divide-y">
            {d.letzte.map((p) => (
              <li key={`${p.datum}-${p.was}`} className="flex items-center gap-4 py-3 text-sm">
                <span className="text-muted-foreground w-14 shrink-0 tabular-nums">{datum.format(new Date(p.datum))}</span>
                <span className="text-muted-foreground w-20 shrink-0">{t.kanal[p.kanal] ?? p.kanal}</span>
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate hover:text-gold-text">
                    {p.was}
                  </a>
                ) : (
                  <span className="min-w-0 flex-1 truncate">{p.was}</span>
                )}
                <span className={p.reaktion === "anfrage" ? "text-gold-text shrink-0" : "text-muted-foreground shrink-0"}>
                  {t.reakt[p.reaktion] ?? p.reaktion}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Leer text={d.letzte ? t.keineDaten : t.nichtGemessen} />
        )}
      </section>
    </AdminShell>
  )
}

function Panel({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-4">
      <h2 className="text-muted-foreground font-mono text-[11px] uppercase tracking-widest">{titel}</h2>
      {children}
    </section>
  )
}

function Leer({ text }: { text: string }) {
  return <p className="text-muted-foreground py-6 text-center text-sm">{text}</p>
}
