import Link from "next/link"
import { ArrowUpRight, Check, Loader2, PenLine, RefreshCw, X } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { AktionKnopf, AktionMeldung } from "@/components/admin/aktion-knopf"
import { AutoAktualisieren } from "@/components/admin/auto-aktualisieren"
import { Surface } from "@/components/admin/primitives"
import { adminSprache } from "@/lib/admin-i18n/server"
import { ladeArtikelListe, type Artikel } from "@/lib/artikel/store"
import { RESSORTS, istRessort, ladeArchiv, ladeAusgabe, ladeLauf, type Meldung } from "@/lib/bulletin/store"

import { artikelSchreiben, artikelVeroeffentlichen, artikelVerwerfen, bulletinNeu } from "./actions"

export const metadata = { title: "Bulletin" }
export const dynamic = "force-dynamic"
export const maxDuration = 300

const T = {
  de: {
    titel: "Bulletin",
    lead: "Was diese Woche in KI, Automatisierung, Medien, Chips und Robotik zählt – recherchiert mit Quelle und eingeordnet für creaDIG. Erscheint jeden Morgen von selbst.",
    lage: "Lage",
    alle: "Alle",
    schwerpunkte: "Schwerpunkte",
    weitere: "Weitere Meldungen",
    fuerUns: "Für creaDIG",
    artikel: "Artikelidee",
    anRedaktion: "Artikel schreiben",
    neu: "Neu recherchieren",
    laeuft: "Recherche läuft …",
    lauf: "Recherche läuft seit",
    laufHinweis: "Die Seite aktualisiert sich von selbst. Du kannst sie auch verlassen – die Arbeit läuft weiter.",
    artikelTitel: "Artikel für creadig.de",
    artikelLead: "Die Redaktion schreibt aus der stärksten Meldung jeden Morgen einen eigenen Fachartikel (DE + TR). Öffentlich wird er erst mit deiner Freigabe – danach liegt der LinkedIn-Beitrag zur Freigabe bereit.",
    entwurf: "Entwurf",
    live: "Live",
    vorschau: "Ganzen Text lesen",
    veroeffentlichen: "Veröffentlichen",
    verwerfen: "Verwerfen",
    ansehen: "Auf creadig.de ansehen",
    keineArtikel: "Noch kein Entwurf. Der erste entsteht mit der nächsten Ausgabe – oder klicke bei einer Meldung auf „Artikel schreiben“.",
    archiv: "Ausgaben",
    meldungen: "Meldungen",
    leer: "Die erste Ausgabe entsteht beim nächsten Morgen-Takt. Du kannst sie auch jetzt erstellen.",
    keine: "In diesem Ressort gibt es heute nichts.",
  },
  tr: {
    titel: "Bülten",
    lead: "Bu hafta yapay zekâ, otomasyon, medya, çip ve robotikte önemli olan – kaynağıyla araştırıldı, creaDIG için yorumlandı. Her sabah kendiliğinden çıkar.",
    lage: "Durum",
    alle: "Tümü",
    schwerpunkte: "Öne çıkanlar",
    weitere: "Diğer haberler",
    fuerUns: "creaDIG için",
    artikel: "Makale fikri",
    anRedaktion: "Makale yaz",
    neu: "Yeniden araştır",
    laeuft: "Araştırılıyor …",
    lauf: "Araştırma sürüyor, başlangıç",
    laufHinweis: "Sayfa kendini yeniler. Sayfadan çıkabilirsin – çalışma arka planda devam eder.",
    artikelTitel: "creadig.de için makaleler",
    artikelLead: "Editörlük her sabah en güçlü haberden kendi uzmanlık makalesini yazar (DE + TR). Senin onayın olmadan yayına çıkmaz – sonra LinkedIn paylaşımı onaya hazır bekler.",
    entwurf: "Taslak",
    live: "Yayında",
    vorschau: "Tüm metni oku",
    veroeffentlichen: "Yayınla",
    verwerfen: "At",
    ansehen: "creadig.de'de gör",
    keineArtikel: "Henüz taslak yok. İlki bir sonraki sayıyla çıkar – ya da bir haberde „Makale yaz“a tıkla.",
    archiv: "Sayılar",
    meldungen: "haber",
    leer: "İlk sayı bir sonraki sabah taktında çıkar. İstersen şimdi oluşturabilirsin.",
    keine: "Bu bölümde bugün haber yok.",
  },
}

const datumLang = (id: string, intl: string) =>
  new Date(`${id}T12:00:00`).toLocaleDateString(intl, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
const datumKurz = (id: string, intl: string) =>
  new Date(`${id}T12:00:00`).toLocaleDateString(intl, { day: "2-digit", month: "2-digit" })

export default async function BulletinSeite(props: { searchParams: Promise<{ ausgabe?: string; ressort?: string }> }) {
  const { ausgabe: ausgabeId, ressort } = await props.searchParams
  const sprache = await adminSprache()
  const t = T[sprache]
  const intl = sprache === "tr" ? "tr-TR" : "de-DE"
  const [ausgabe, archiv, lauf, artikel] = await Promise.all([
    ladeAusgabe(ausgabeId && /^\d{4}-\d{2}-\d{2}$/.test(ausgabeId) ? ausgabeId : null).catch(() => null),
    ladeArchiv().catch(() => []),
    ladeLauf().catch(() => null),
    ladeArtikelListe().catch(() => [] as Artikel[]),
  ])
  const uhr = (iso: string) => new Date(iso).toLocaleTimeString(intl, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" })
  const filter = istRessort(ressort) ? ressort : null
  const sichtbar = (ausgabe?.meldungen ?? []).filter((m) => !filter || m.ressort === filter)
  const schwer = sichtbar.filter((m) => m.gewicht === 3)
  const rest = sichtbar.filter((m) => m.gewicht !== 3)
  const vorhanden = new Set(ausgabe?.meldungen.map((m) => m.ressort))
  const link = (r: string | null) =>
    `/admin/bulletin?${ausgabe ? `ausgabe=${ausgabe.id}` : ""}${r ? `&ressort=${r}` : ""}`

  return (
    <AdminShell title={t.titel} lead={t.lead}>
      <AktionMeldung />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="flex min-w-0 flex-col gap-6">
          {lauf?.laeuft && (
            <Surface className="flex items-start gap-3">
              <AutoAktualisieren />
              <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-primary" aria-hidden />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  {t.lauf} {lauf.start ? uhr(lauf.start) : ""}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">{t.laufHinweis}</p>
              </div>
            </Surface>
          )}
          {!lauf?.laeuft && lauf?.ergebnis && !lauf.ok && (
            <Surface>
              <p className="text-sm text-destructive">{lauf.ergebnis}</p>
            </Surface>
          )}
          {ausgabe ? (
            <>
              <Surface className="flex flex-col gap-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-mono text-xs uppercase tracking-widest text-primary">
                    {t.lage} · {datumLang(ausgabe.id, intl)}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {ausgabe.meldungen.length} {t.meldungen}
                  </p>
                </div>
                <LageText text={ausgabe.lage[sprache]} />
              </Surface>

              <nav aria-label={t.alle} className="flex flex-wrap gap-2">
                <RessortLink href={link(null)} aktiv={!filter}>
                  {t.alle}
                </RessortLink>
                {RESSORTS.filter((r) => vorhanden.has(r.id)).map((r) => (
                  <RessortLink key={r.id} href={link(r.id)} aktiv={filter === r.id}>
                    {r[sprache]}
                  </RessortLink>
                ))}
              </nav>

              {sichtbar.length === 0 && <p className="text-sm text-muted-foreground">{t.keine}</p>}

              {schwer.length > 0 && (
                <section aria-labelledby="schwer" className="flex flex-col gap-3">
                  <h2 id="schwer" className="font-sans text-lg font-semibold text-foreground">
                    {t.schwerpunkte}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {schwer.map((m, i) => (
                      <MeldungKarte key={m.nr} m={m} t={t} sprache={sprache} ausgabe={ausgabe.id} gross={i === 0 && schwer.length % 2 === 1} />
                    ))}
                  </div>
                </section>
              )}

              {rest.length > 0 && (
                <section aria-labelledby="weitere" className="flex flex-col gap-3">
                  <h2 id="weitere" className="font-sans text-lg font-semibold text-foreground">
                    {t.weitere}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {rest.map((m) => (
                      <MeldungKarte key={m.nr} m={m} t={t} sprache={sprache} ausgabe={ausgabe.id} />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <Surface>
              <p className="text-sm leading-relaxed text-muted-foreground">{t.leer}</p>
            </Surface>
          )}

          <section id="artikel" aria-labelledby="artikel-titel" className="flex flex-col gap-3">
            <h2 id="artikel-titel" className="font-sans text-lg font-semibold text-foreground">
              {t.artikelTitel}
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{t.artikelLead}</p>
            {artikel.length === 0 ? (
              <Surface>
                <p className="text-sm leading-relaxed text-muted-foreground">{t.keineArtikel}</p>
              </Surface>
            ) : (
              artikel.map((a) => <ArtikelKarte key={a.slug} a={a} t={t} sprache={sprache} />)
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <form action={bulletinNeu}>
            <AktionKnopf
              laeuft={t.laeuft}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
            >
              <RefreshCw className="size-4" aria-hidden />
              {t.neu}
            </AktionKnopf>
          </form>
          {archiv.length > 0 && (
            <Surface padding="sm" className="flex flex-col gap-1">
              <p className="px-2 pb-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">{t.archiv}</p>
              {archiv.map((a) => {
                const aktiv = a.id === ausgabe?.id
                return (
                  <Link
                    key={a.id}
                    href={`/admin/bulletin?ausgabe=${a.id}`}
                    aria-current={aktiv ? "page" : undefined}
                    className={`flex items-center justify-between rounded-full px-3 py-2 text-sm ${aktiv ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
                  >
                    <span>{datumKurz(a.id, intl)}</span>
                    <span className={`font-mono text-xs ${aktiv ? "" : "text-muted-foreground"}`}>{a.anzahl}</span>
                  </Link>
                )
              })}
            </Surface>
          )}
        </aside>
      </div>
    </AdminShell>
  )
}

function RessortLink({ href, aktiv, children }: { href: string; aktiv: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={aktiv ? "page" : undefined}
      className={`rounded-full px-4 py-2 text-sm ${aktiv ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted"}`}
    >
      {children}
    </Link>
  )
}

function ArtikelKarte({ a, t, sprache }: { a: Artikel; t: (typeof T)["de"]; sprache: "de" | "tr" }) {
  const live = a.zustand === "veroeffentlicht"
  const pfad = `${sprache === "tr" ? "/tr" : ""}/insights/${a.slug}`
  return (
    <Surface className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${live ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
        >
          {live ? t.live : t.entwurf}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{a.topic[sprache]}</span>
        {a.quelleName && <span className="font-mono text-xs text-muted-foreground">· {a.quelleName}</span>}
      </div>
      <h3 className="text-balance font-sans text-lg font-semibold leading-snug text-foreground">{a.titel[sprache]}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{a.teaser[sprache]}</p>
      <details className="rounded-2xl bg-muted px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-primary">{t.vorschau}</summary>
        <div className="flex flex-col gap-3 pt-3">
          {a.body.map((b, i) =>
            b.kind === "list" ? (
              <ul key={i} className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-foreground">
                {b.items[sprache].map((x, k) => (
                  <li key={k}>{x}</li>
                ))}
              </ul>
            ) : b.kind === "heading" ? (
              <h4 key={i} className="pt-2 font-sans text-base font-semibold text-foreground">
                {b.text[sprache]}
              </h4>
            ) : (
              <p key={i} className={`text-sm leading-relaxed ${b.kind === "note" ? "text-muted-foreground" : "text-foreground"}`}>
                {b.text[sprache]}
              </p>
            ),
          )}
        </div>
      </details>
      <div className="flex flex-wrap items-center gap-2">
        {live ? (
          <a href={pfad} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            {t.ansehen}
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
        ) : (
          <>
            <form action={artikelVeroeffentlichen}>
              <input type="hidden" name="slug" value={a.slug} />
              <AktionKnopf className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                <Check className="size-4" aria-hidden />
                {t.veroeffentlichen}
              </AktionKnopf>
            </form>
            <form action={artikelVerwerfen}>
              <input type="hidden" name="slug" value={a.slug} />
              <AktionKnopf className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-foreground">
                <X className="size-4" aria-hidden />
                {t.verwerfen}
              </AktionKnopf>
            </form>
          </>
        )}
      </div>
    </Surface>
  )
}

function MeldungKarte({
  m,
  t,
  sprache,
  ausgabe,
  gross = false,
}: {
  m: Meldung
  t: (typeof T)["de"]
  sprache: "de" | "tr"
  ausgabe: string
  gross?: boolean
}) {
  const ressort = RESSORTS.find((r) => r.id === m.ressort)
  return (
    <Surface className={`flex flex-col gap-3 ${gross ? "md:col-span-2" : ""}`}>
      <p className="font-mono text-xs uppercase tracking-widest text-primary">{ressort?.[sprache]}</p>
      <h3 className={`text-balance font-sans font-semibold leading-snug text-foreground ${gross ? "text-2xl" : "text-lg"}`}>
        {m.titel[sprache]}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{m.kurz[sprache]}</p>
      <div className="rounded-2xl bg-muted px-4 py-3">
        <p className="text-xs font-medium text-primary">{t.fuerUns}</p>
        <p className="text-sm leading-relaxed text-foreground">{m.fuerUns[sprache]}</p>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
        <a
          href={m.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          {m.quelle}
          <ArrowUpRight className="size-4" aria-hidden />
        </a>
        {m.artikel && (
          <form action={artikelSchreiben} className="flex items-center gap-2">
            <input type="hidden" name="ausgabe" value={ausgabe} />
            <input type="hidden" name="nr" value={m.nr} />
            <AktionKnopf className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm text-foreground ring-1 ring-border hover:bg-muted">
              <PenLine className="size-4" aria-hidden />
              {t.anRedaktion}
            </AktionKnopf>
          </form>
        )}
      </div>
      {m.artikel && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t.artikel}: {m.artikel[sprache]}
        </p>
      )}
    </Surface>
  )
}

/** Lage in Lesestücke: Kernsatz vorn, Begründung ruhig, „Für creaDIG“ als eigener Hinweis. */
function LageText({ text }: { text: string }) {
  const saetze = text.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜÇĞİŞ„"])/).map((s) => s.trim()).filter(Boolean)
  const uns = saetze.findIndex((s) => /^(Für creaDIG|creaDIG için|Bizim için|Für uns)/i.test(s))
  const kern = saetze[0] ?? text
  const mitte = saetze.slice(1, uns > 0 ? uns : undefined)
  const fuerUns = uns > 0 ? saetze.slice(uns) : []
  return (
    <div className="flex flex-col gap-4">
      <p className="text-balance font-sans text-lg font-semibold leading-snug text-foreground md:text-xl">{kern}</p>
      {mitte.length > 0 && (
        <p className="max-w-3xl text-pretty text-[15px] leading-relaxed text-muted-foreground">{mitte.join(" ")}</p>
      )}
      {fuerUns.length > 0 && (
        <div className="flex flex-col gap-1 rounded-2xl bg-primary/5 px-5 py-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-primary">creaDIG</p>
          <p className="max-w-3xl text-pretty text-[15px] leading-relaxed text-foreground">{fuerUns.join(" ")}</p>
        </div>
      )}
    </div>
  )
}
