import Link from "next/link"
import { ArrowUpRight, PenLine, RefreshCw } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { AktionKnopf, AktionMeldung } from "@/components/admin/aktion-knopf"
import { Surface } from "@/components/admin/primitives"
import { adminSprache } from "@/lib/admin-i18n/server"
import { RESSORTS, istRessort, ladeArchiv, ladeAusgabe, type Meldung } from "@/lib/bulletin/store"

import { artikelAnRedaktion, bulletinNeu } from "./actions"

export const metadata = { title: "Bulletin" }
export const dynamic = "force-dynamic"
export const maxDuration = 120

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
    anRedaktion: "An Redaktion geben",
    neu: "Neu recherchieren",
    laeuft: "Recherche läuft …",
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
    anRedaktion: "Editörlüğe ver",
    neu: "Yeniden araştır",
    laeuft: "Araştırılıyor …",
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
  const [ausgabe, archiv] = await Promise.all([
    ladeAusgabe(ausgabeId && /^\d{4}-\d{2}-\d{2}$/.test(ausgabeId) ? ausgabeId : null).catch(() => null),
    ladeArchiv().catch(() => []),
  ])
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
                <p className="text-pretty font-sans text-xl font-semibold leading-relaxed text-foreground md:text-2xl">
                  {ausgabe.lage[sprache]}
                </p>
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
          <form action={artikelAnRedaktion} className="flex items-center gap-2">
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
