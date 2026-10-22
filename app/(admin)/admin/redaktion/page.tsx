import Link from "next/link"
import { ArrowUpRight, Check, PenLine, Send, X } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { AktionKnopf, AktionMeldung } from "@/components/admin/aktion-knopf"
import { AutoAktualisieren } from "@/components/admin/auto-aktualisieren"
import { Pill, SectionHeader, Surface } from "@/components/admin/primitives"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { ladeRedaktion, type PlanStand } from "@/lib/redaktion-lage"

import { linkedinAnstossen, planArtikelSchreiben, redaktionArtikelVeroeffentlichen, redaktionArtikelVerwerfen } from "./actions"

export const metadata = { title: "Redaktion" }
export const dynamic = "force-dynamic"
/* Plan-Artikel und LinkedIn-Redaktion laufen per after() in dieser Anfrage weiter. */
export const maxDuration = 300

const T = {
  de: {
    titel: "Redaktion",
    lead: "Website und LinkedIn an einer Stelle: was auf dich wartet, was geplant ist, was draußen ist — und was das Netz damit tut.",
    wartet: "Wartet auf dich",
    dieseWoche: "Diese Woche veröffentlicht",
    plan: "Redaktionsplan",
    planStand: (n: number, g: number) => `${n} von ${g} erledigt`,
    letzterImpuls: "Letzte Meldung ans Netz",
    nie: "noch keine",
    wochen: "Veröffentlicht je Woche · 8 Wochen",
    website: "Website",
    linkedin: "LinkedIn",
    andere: "Andere",
    leer: "Nichts wartet. Die Redaktion schreibt von selbst weiter — oder du stößt sie unten an.",
    webEntwurf: "Website-Artikel",
    linkedinEntwurf: "LinkedIn-Beitrag",
    register: "Im Register",
    vorschau: "Artikel lesen",
    veroeffentlichen: "Veröffentlichen",
    verwerfen: "Verwerfen",
    freigeben: "Im Assistenten freigeben",
    warum: "Warum",
    registerOeffnen: "Im Register bearbeiten",
    zustand: { offen: "offen", entwurf: "Entwurf wartet", veroeffentlicht: "live", verworfen: "verworfen" } as Record<PlanStand["zustand"], string>,
    naechsterArtikel: "Nächsten Artikel schreiben",
    entwurfWartet: "Erst den wartenden Entwurf entscheiden — dann schreibt die Redaktion den nächsten.",
    planFertig: "Plan abgearbeitet — neue Themen kommen in lib/artikel/plan.ts.",
    draussen: "Zuletzt veröffentlicht · 30 Tage",
    nichtsDraussen: "In den letzten 30 Tagen ist nichts hinausgegangen.",
    netz: "Das Netz",
    netzLead: "Wer an der Redaktion arbeitet und wann zuletzt. Jede Veröffentlichung geht als Ereignis an alle Agenten.",
    agenten: {
      bulletin: "Bulletin-Recherche",
      webseite: "Website-Prüfer",
      redaktion: "LinkedIn-Redaktion",
      marketing: "Marketing",
    } as Record<string, string>,
    nieGelaufen: "noch nie gelaufen",
    linkedinJetzt: "LinkedIn-Beitrag jetzt schreiben lassen",
    ereignisse: "Ans Netz gemeldet",
    keineEreignisse: "Noch keine Veröffentlichung gemeldet — die erste erscheint hier.",
    kanal: { linkedin: "LinkedIn", website: "Website", netzwerk: "Netzwerk", gespraech: "Gespräch", andere: "Andere" } as Record<string, string>,
  },
  tr: {
    titel: "Redaksiyon",
    lead: "Web sitesi ve LinkedIn tek yerde: seni bekleyenler, planlananlar, yayında olanlar — ve ağın bunlarla ne yaptığı.",
    wartet: "Seni bekliyor",
    dieseWoche: "Bu hafta yayımlanan",
    plan: "Yayın planı",
    planStand: (n: number, g: number) => `${g} konudan ${n} tamam`,
    letzterImpuls: "Ağa son bildirim",
    nie: "henüz yok",
    wochen: "Haftalık yayın · 8 hafta",
    website: "Web sitesi",
    linkedin: "LinkedIn",
    andere: "Diğer",
    leer: "Bekleyen bir şey yok. Redaksiyon kendiliğinden yazmaya devam eder — ya da aşağıdan tetiklersin.",
    webEntwurf: "Web makalesi",
    linkedinEntwurf: "LinkedIn paylaşımı",
    register: "Kayıtta",
    vorschau: "Makaleyi oku",
    veroeffentlichen: "Yayımla",
    verwerfen: "Reddet",
    freigeben: "Asistanda onayla",
    warum: "Neden",
    registerOeffnen: "Kayıtta düzenle",
    zustand: { offen: "açık", entwurf: "taslak bekliyor", veroeffentlicht: "yayında", verworfen: "reddedildi" } as Record<PlanStand["zustand"], string>,
    naechsterArtikel: "Sıradaki makaleyi yazdır",
    entwurfWartet: "Önce bekleyen taslağa karar ver — sonra redaksiyon sıradakini yazar.",
    planFertig: "Plan tamamlandı — yeni konular lib/artikel/plan.ts dosyasına.",
    draussen: "Son yayımlananlar · 30 gün",
    nichtsDraussen: "Son 30 günde dışarı bir şey çıkmadı.",
    netz: "Ağ",
    netzLead: "Redaksiyonda kim çalışıyor, en son ne zaman. Her yayın tüm ajanlara olay olarak gider.",
    agenten: {
      bulletin: "Bülten araştırması",
      webseite: "Site denetçisi",
      redaktion: "LinkedIn redaksiyonu",
      marketing: "Pazarlama",
    } as Record<string, string>,
    nieGelaufen: "hiç çalışmadı",
    linkedinJetzt: "LinkedIn paylaşımını şimdi yazdır",
    ereignisse: "Ağa bildirilenler",
    keineEreignisse: "Henüz bildirilen yayın yok — ilki burada görünecek.",
    kanal: { linkedin: "LinkedIn", website: "Web sitesi", netzwerk: "Ağ", gespraech: "Görüşme", andere: "Diğer" } as Record<string, string>,
  },
}

const KNOPF_HAUPT = "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
const KNOPF_NEBEN = "inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm text-foreground ring-1 ring-border hover:bg-muted"

export default async function RedaktionSeite(props: { searchParams: Promise<{ meldung?: string }> }) {
  const { meldung } = await props.searchParams
  const { sprache: s, intl } = await adminSprachKontext()
  const sprache = s === "tr" ? "tr" : "de"
  const t = T[sprache]
  const d = await ladeRedaktion()

  const tag = new Intl.DateTimeFormat(intl, { day: "2-digit", month: "short" })
  const zeit = new Intl.DateTimeFormat(intl, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" })

  const wartend = d.webEntwuerfe.length + d.linkedinOffen.length + d.registerOffen.length
  const dieseWoche = d.wochen.at(-1)
  const erledigt = d.plan.filter((p) => p.zustand === "veroeffentlicht" || p.zustand === "verworfen").length
  const planFertig = d.plan.every((p) => p.zustand !== "offen")
  const maxWoche = Math.max(1, ...d.wochen.map((w) => w.website + w.linkedin + w.andere))
  const laeuftGerade = Boolean(meldung && /schreibt/.test(meldung))

  const kacheln = [
    { label: t.wartet, wert: String(wartend), betont: wartend > 0 },
    { label: t.dieseWoche, wert: String(dieseWoche ? dieseWoche.website + dieseWoche.linkedin + dieseWoche.andere : 0), betont: false },
    { label: t.plan, wert: t.planStand(erledigt, d.plan.length), betont: false },
    { label: t.letzterImpuls, wert: d.netz[0] ? zeit.format(new Date(d.netz[0].zeit)) : t.nie, betont: false },
  ]

  return (
    <AdminShell title={t.titel} lead={t.lead}>
      <AktionMeldung />
      {laeuftGerade && <AutoAktualisieren sekunden={15} />}
      {meldung && (
        <p role="status" className="rounded-2xl bg-muted px-4 py-3 text-sm text-foreground">
          {meldung}
        </p>
      )}

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kacheln.map((k) => (
          <li key={k.label} className="flex flex-col gap-2 rounded-3xl bg-card p-5 shadow-sm">
            <span className="text-xs text-muted-foreground">{k.label}</span>
            <span className={`font-sans font-semibold tabular-nums ${k.wert.length > 6 ? "text-lg" : "text-3xl"} ${k.betont ? "text-primary" : "text-foreground"}`}>
              {k.wert}
            </span>
          </li>
        ))}
      </ul>

      <Surface className="flex flex-col gap-4">
        <SectionHeader title={t.wochen} />
        <div
          className="flex h-32 items-end gap-2"
          role="img"
          aria-label={d.wochen.map((w) => `${tag.format(new Date(w.start))}: ${t.website} ${w.website}, ${t.linkedin} ${w.linkedin}, ${t.andere} ${w.andere}`).join("; ")}
        >
          {d.wochen.map((w) => (
            <div key={w.start} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div className="flex w-full max-w-10 flex-col-reverse overflow-hidden rounded-md" style={{ height: `${((w.website + w.linkedin + w.andere) / maxWoche) * 100}%` }}>
                <div className="bg-primary" style={{ flexGrow: w.website }} />
                <div className="bg-primary/45" style={{ flexGrow: w.linkedin }} />
                <div className="bg-muted-foreground/30" style={{ flexGrow: w.andere }} />
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">{tag.format(new Date(w.start))}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <Legende farbe="bg-primary" text={t.website} />
          <Legende farbe="bg-primary/45" text={t.linkedin} />
          <Legende farbe="bg-muted-foreground/30" text={t.andere} />
        </div>
      </Surface>

      <section aria-labelledby="wartet" className="flex flex-col gap-3">
        <SectionHeader id="wartet" title={t.wartet} count={wartend || undefined} />
        {wartend === 0 && <p className="text-sm text-muted-foreground">{t.leer}</p>}

        {d.webEntwuerfe.map((a) => (
          <Surface key={a.slug} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Pill severity="attention">{t.webEntwurf}</Pill>
              <span className="font-mono text-xs text-muted-foreground">{a.topic[sprache]}</span>
              {a.quelleName && <span className="font-mono text-xs text-muted-foreground">· {a.quelleName}</span>}
            </div>
            <h3 className="text-balance font-sans text-lg font-semibold leading-snug">{a.titel[sprache]}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{a.teaser[sprache]}</p>
            <details className="rounded-2xl bg-muted px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium text-primary">{t.vorschau}</summary>
              <div className="flex flex-col gap-3 pt-3">
                {a.body.map((b, i) =>
                  b.kind === "list" ? (
                    <ul key={i} className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed">
                      {b.items[sprache].map((x, k) => (
                        <li key={k}>{x}</li>
                      ))}
                    </ul>
                  ) : b.kind === "heading" ? (
                    <h4 key={i} className="pt-2 font-sans text-base font-semibold">
                      {b.text[sprache]}
                    </h4>
                  ) : (
                    <p key={i} className={`text-sm leading-relaxed ${b.kind === "note" ? "text-muted-foreground" : ""}`}>
                      {b.text[sprache]}
                    </p>
                  ),
                )}
              </div>
            </details>
            <div className="flex flex-wrap gap-2">
              <form action={redaktionArtikelVeroeffentlichen}>
                <input type="hidden" name="slug" value={a.slug} />
                <AktionKnopf className={KNOPF_HAUPT}>
                  <Check className="size-4" aria-hidden />
                  {t.veroeffentlichen}
                </AktionKnopf>
              </form>
              <form action={redaktionArtikelVerwerfen}>
                <input type="hidden" name="slug" value={a.slug} />
                <AktionKnopf className={KNOPF_NEBEN}>
                  <X className="size-4" aria-hidden />
                  {t.verwerfen}
                </AktionKnopf>
              </form>
            </div>
          </Surface>
        ))}

        {d.linkedinOffen.map((f) => (
          <Surface key={f.id} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Pill severity="attention">{t.linkedinEntwurf}</Pill>
              <span className="font-mono text-xs text-muted-foreground">{zeit.format(new Date(f.zeit))}</span>
            </div>
            <h3 className="text-balance font-sans text-lg font-semibold leading-snug">{f.titel}</h3>
            <p className="line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            {f.warum && (
              <p className="text-xs text-muted-foreground">
                {t.warum}: {f.warum}
              </p>
            )}
            <Link href={`/admin/assistent#frg-${f.id}`} className={`${KNOPF_HAUPT} self-start`}>
              {t.freigeben}
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </Surface>
        ))}

        {d.registerOffen.length > 0 && (
          <Surface padding="sm" className="flex flex-col gap-2">
            <Pill>{t.register}</Pill>
            <ul className="flex flex-col gap-1 text-sm">
              {d.registerOffen.map((r) => (
                <li key={r.id} className="flex flex-wrap gap-2">
                  <span className="text-muted-foreground">{t.kanal[r.kanal] ?? r.kanal} ·</span>
                  {r.was}
                </li>
              ))}
            </ul>
            <Link href="/admin/veroeffentlichungen" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              {t.registerOeffnen}
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </Surface>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Surface className="flex flex-col gap-4">
          <SectionHeader title={t.plan} count={t.planStand(erledigt, d.plan.length)} />
          <ol className="flex flex-col gap-2">
            {d.plan.map((p, i) => (
              <li key={p.code} className="flex items-start justify-between gap-3 text-sm">
                <span className="flex gap-3">
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {p.zustand === "veroeffentlicht" && p.slug ? (
                    <a href={`/insights/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {p.arbeitstitel}
                    </a>
                  ) : (
                    <span className={p.zustand === "verworfen" ? "text-muted-foreground line-through" : ""}>{p.arbeitstitel}</span>
                  )}
                </span>
                <Pill severity={p.zustand === "entwurf" ? "attention" : "neutral"}>{t.zustand[p.zustand]}</Pill>
              </li>
            ))}
          </ol>
          {planFertig ? (
            <p className="text-xs text-muted-foreground">{t.planFertig}</p>
          ) : d.webEntwuerfe.length > 0 ? (
            <p className="text-xs text-muted-foreground">{t.entwurfWartet}</p>
          ) : (
            <form action={planArtikelSchreiben}>
              <AktionKnopf className={KNOPF_NEBEN}>
                <PenLine className="size-4" aria-hidden />
                {t.naechsterArtikel}
              </AktionKnopf>
            </form>
          )}
        </Surface>

        <Surface className="flex flex-col gap-4">
          <SectionHeader title={t.draussen} count={d.inhalte.length || undefined} />
          {d.inhalte.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.nichtsDraussen}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {d.inhalte.map((i) => (
                <li key={i.id} className="flex gap-3">
                  <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">{tag.format(new Date(i.am))}</span>
                  <span className="w-20 shrink-0 text-xs text-muted-foreground">{t.kanal[i.kanal] ?? i.kanal}</span>
                  {i.url ? (
                    <a href={i.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {i.was}
                    </a>
                  ) : (
                    <span>{i.was}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </div>

      <Surface className="flex flex-col gap-4">
        <SectionHeader title={t.netz} />
        <p className="text-sm text-muted-foreground">{t.netzLead}</p>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {d.laeufe.map(({ agent, lauf }) => (
            <li key={agent} className="flex flex-col gap-1 rounded-2xl bg-muted px-4 py-3">
              <span className="text-sm font-medium">{t.agenten[agent] ?? agent}</span>
              <span className="font-mono text-xs text-muted-foreground">{lauf ? zeit.format(new Date(lauf.zeit)) : t.nieGelaufen}</span>
              {lauf && (
                <span className={`line-clamp-2 text-xs ${lauf.fehler ? "text-destructive" : "text-muted-foreground"}`}>{lauf.fehler ?? lauf.ergebnis}</span>
              )}
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">{t.ereignisse}</h3>
          {d.netz.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.keineEreignisse}</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {d.netz.map((e, i) => (
                <li key={`${e.zeit}-${i}`} className="flex gap-3">
                  <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">{zeit.format(new Date(e.zeit))}</span>
                  <span className="w-20 shrink-0 text-xs text-muted-foreground">{t.kanal[e.kanal] ?? e.kanal}</span>
                  <span>{e.was}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form action={linkedinAnstossen}>
          <AktionKnopf className={KNOPF_NEBEN}>
            <Send className="size-4" aria-hidden />
            {t.linkedinJetzt}
          </AktionKnopf>
        </form>
      </Surface>
    </AdminShell>
  )
}

function Legende({ farbe, text }: { farbe: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2.5 rounded-sm ${farbe}`} aria-hidden />
      {text}
    </span>
  )
}
