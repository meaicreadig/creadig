import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { PostWerkstatt } from "@/components/admin/post-werkstatt"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { ladeMarketing } from "@/lib/marketing"

export const dynamic = "force-dynamic"

const TEXT = {
  de: {
    titel: "Marketing",
    werkstatt: {
      titel: "Beitrags-Werkstatt · ein Gedanke, vier Kanäle",
      anlass: "Anlass",
      anlaesse: { lieferung: "Lieferung", einwand: "Einwand", beleg: "Beleg", build: "Build Note" },
      plattformen: { person: "LinkedIn · Profil", firma: "LinkedIn · Firma", instagram: "Instagram", google: "Google Profil" },
      kopfzeile: { person: "Gründer · creaDIG", firma: "creaDIG", instagram: "@creadig", google: "creaDIG · Osnabrück" },
      stichpunkte: "Stichpunkte",
      platzhalter: "z. B. Tischlerei Meyer: Aufträge liefen über 4 Excel-Listen. Jetzt ein System, Angebot bis Rechnung an einem Ort.",
      erzeugen: "Vier Fassungen erzeugen",
      erzeugt: "Schreibt …",
      mehr: "… mehr",
      weniger: "weniger",
      kopieren: "Kopieren",
      kopiert: "Kopiert",
      oeffnen: "Plattform öffnen",
      speichern: "Als Entwurf speichern",
      gespeichert: "Gespeichert",
      nurKopieren: "Kopieren und dort einfügen",
      leer: "Stichpunkte links eingeben – die Fassungen erscheinen hier.",
    },
    woche: "Diese Woche",
    ziel: (n: number, z: number) => `LinkedIn ${n} / ${z}`,
    pipeline: (e: number, f: number) => `${e} Entwürfe · ${f} freigegeben`,
    tage: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
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
    werkstatt: {
      titel: "Paylaşım atölyesi · bir fikir, dört kanal",
      anlass: "Konu",
      anlaesse: { lieferung: "Teslimat", einwand: "İtiraz", beleg: "Kanıt", build: "Build Note" },
      plattformen: { person: "LinkedIn · Profil", firma: "LinkedIn · Şirket", instagram: "Instagram", google: "Google Profil" },
      kopfzeile: { person: "Kurucu · creaDIG", firma: "creaDIG", instagram: "@creadig", google: "creaDIG · Osnabrück" },
      stichpunkte: "Notlar",
      platzhalter: "örn. Marangoz Meyer: siparişler 4 Excel listesindeydi. Şimdi tek sistem, tekliften faturaya tek yerde.",
      erzeugen: "Dört versiyon oluştur",
      erzeugt: "Yazıyor …",
      mehr: "… devamı",
      weniger: "daha az",
      kopieren: "Kopyala",
      kopiert: "Kopyalandı",
      oeffnen: "Platformu aç",
      speichern: "Taslak olarak kaydet",
      gespeichert: "Kaydedildi",
      nurKopieren: "Kopyalayıp orada yapıştırın",
      leer: "Soldaki alana notları yazın – versiyonlar burada görünür. Metinler Almanca üretilir.",
    },
    woche: "Bu hafta",
    ziel: (n: number, z: number) => `LinkedIn ${n} / ${z}`,
    pipeline: (e: number, f: number) => `${e} taslak · ${f} onaylı`,
    tage: ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"],
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

      <WochenPlan d={d} t={t} />

      <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
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

      <PostWerkstatt t={t.werkstatt} />
    </AdminShell>
  )
}

const LINKEDIN_ZIEL = 3

function WochenPlan({ d, t }: { d: Awaited<ReturnType<typeof ladeMarketing>>; t: (typeof TEXT)["de"] | (typeof TEXT)["tr"] }) {
  if (!d.woche) return null
  const heute = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date())
  const linkedin = d.woche.reduce((n, tag) => n + tag.posts.filter((p) => p.kanal === "linkedin").length, 0)
  const erreicht = Math.min(linkedin, LINKEDIN_ZIEL)

  return (
    <section className="border-border bg-surface mt-6 flex flex-col gap-4 rounded-lg border p-4" aria-labelledby="woche">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="woche" className="text-muted-foreground font-mono text-[11px] uppercase tracking-widest">
          {t.woche}
        </h2>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="flex gap-1" aria-hidden="true">
              {Array.from({ length: LINKEDIN_ZIEL }, (_, i) => (
                <span key={i} className={`size-2.5 rounded-full ${i < erreicht ? "bg-gold" : "bg-foreground/15"}`} />
              ))}
            </span>
            <span className={`tabular-nums ${linkedin >= LINKEDIN_ZIEL ? "text-gold-text" : ""}`}>
              {t.ziel(linkedin, LINKEDIN_ZIEL)}
            </span>
          </span>
          {d.pipeline ? (
            <Link href="/admin/veroeffentlichungen" className="text-muted-foreground hover:text-foreground tabular-nums">
              {t.pipeline(d.pipeline.entwurf, d.pipeline.freigegeben)}
            </Link>
          ) : null}
        </div>
      </div>

      <ol className="grid grid-cols-7 gap-1.5">
        {d.woche.map((tag, i) => {
          const istHeute = tag.tag === heute
          return (
            <li
              key={tag.tag}
              className={`flex min-h-20 flex-col gap-1.5 rounded-md border p-2 ${
                istHeute ? "border-gold" : "border-border"
              }`}
            >
              <span className={`flex justify-between text-[11px] ${istHeute ? "text-gold-text" : "text-muted-foreground"}`}>
                <span>{t.tage[i]}</span>
                <span className="tabular-nums">{tag.tag.slice(8)}</span>
              </span>
              {tag.posts.map((p, j) => (
                <span
                  key={j}
                  title={p.was}
                  className={`block h-1.5 rounded-full ${p.kanal === "linkedin" ? "bg-gold" : "bg-foreground/40"}`}
                >
                  <span className="sr-only">{`${t.kanal[p.kanal] ?? p.kanal}: ${p.was}`}</span>
                </span>
              ))}
            </li>
          )
        })}
      </ol>
    </section>
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
