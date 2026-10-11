import Link from "next/link"
import { Plus, Search } from "lucide-react"

import { kontaktAnlegen } from "@/app/(admin)/admin/gespraech/actions"
import { AdminShell } from "@/components/admin/admin-shell"
import { Gespraechsraum } from "@/components/admin/gespraechsraum"
import { adminSprache } from "@/lib/admin-i18n/server"
import {
  gespraeche,
  gespraechVerfuegbar,
  holeKontakt,
  sucheKontakte,
  type GespraechEintrag,
} from "@/lib/gespraech"
import { gespraechText, type GespraechText } from "@/lib/gespraech-text"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return { title: gespraechText(await adminSprache()).titel }
}

const FELD =
  "border-line bg-background focus:border-gold w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors"

function initialen(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")
}

function Verlauf({ eintraege, t, mitName }: { eintraege: GespraechEintrag[]; t: GespraechText; mitName?: boolean }) {
  if (eintraege.length === 0) return <p className="text-muted-foreground text-sm leading-relaxed">{t.keinVerlauf}</p>
  return (
    <ol className="relative flex flex-col gap-5">
      <span aria-hidden="true" className="bg-line absolute top-2 bottom-2 left-[5px] w-px" />
      {eintraege.map((g) => (
        <li key={g.id} className="relative pl-6">
          <span aria-hidden="true" className="bg-gold ring-background absolute top-1.5 left-0 size-[11px] rounded-full ring-4" />
          <details className="group">
            <summary className="cursor-pointer list-none">
              <p className="text-muted-foreground font-mono text-[11px] tabular-nums">
                {new Date(g.createdAt).toLocaleString(t.locale, { dateStyle: "medium", timeStyle: "short" })}
                {g.dauerSek ? ` · ${Math.max(1, Math.round(g.dauerSek / 60))} ${t.min}` : ""}
              </p>
              {mitName && g.contactName && (
                <Link
                  href={`/admin/gespraech?kontakt=${g.contactId}`}
                  className="hover:text-gold-text mt-1 block text-sm font-medium"
                >
                  {g.contactName}
                </Link>
              )}
              <p className="mt-1 text-sm leading-relaxed text-pretty">{g.summary.replace(/^Gespräch · \d+ Min · /, "")}</p>
            </summary>
            {g.detail && (
              <p className="text-muted-foreground border-line mt-3 rounded-md border p-3 text-xs leading-relaxed whitespace-pre-line">
                {g.detail}
              </p>
            )}
          </details>
        </li>
      ))}
    </ol>
  )
}

export default async function GespraechSeite({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kontakt?: string }>
}) {
  const t = gespraechText(await adminSprache())
  const { q, kontakt: kontaktId } = await searchParams

  if (!gespraechVerfuegbar()) {
    return (
      <AdminShell title={t.titel}>
        <p className="text-muted-foreground">{t.nichtVerfuegbar}</p>
      </AdminShell>
    )
  }

  const [alle, kontakt, verlauf] = await Promise.all([
    sucheKontakte(q ?? null),
    kontaktId ? holeKontakt(kontaktId) : Promise.resolve(null),
    gespraeche(kontaktId ?? null, kontaktId ? 12 : 8),
  ])
  const heute = new Date().toISOString().slice(0, 10)
  const sucht = Boolean(q?.trim())
  const faelligeKontakte = sucht ? [] : alle.filter((k) => k.nextTouchAt && k.nextTouchAt <= heute)
  const kontakte = sucht
    ? alle
    : [
        ...faelligeKontakte,
        ...alle
          .filter((k) => k.lastInteractionAt && !faelligeKontakte.includes(k))
          .slice(0, Math.max(0, 5 - faelligeKontakte.length)),
        ...(kontakt && !alle.slice(0, 5).some((k) => k.id === kontakt.id) ? [kontakt] : []),
      ].filter((k, i, liste) => liste.findIndex((x) => x.id === k.id) === i)

  return (
    <AdminShell title={t.titel} lead={kontakt ? undefined : t.lead}>
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside aria-label={t.kontakte} className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
          <form role="search" className="relative">
            {kontaktId && <input type="hidden" name="kontakt" value={kontaktId} />}
            <label htmlFor="g-suche" className="sr-only">
              {t.suche}
            </label>
            <Search aria-hidden="true" className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input id="g-suche" name="q" defaultValue={q ?? ""} placeholder={t.suche} className={`${FELD} pl-9`} />
            <button type="submit" className="sr-only">
              {t.suchen}
            </button>
          </form>

          <p className="text-muted-foreground px-1 font-mono text-[11px] tracking-widest uppercase">
            {sucht
              ? `${t.treffer} · ${kontakte.length}`
              : faelligeKontakte.length > 0
                ? t.faelligListe
                : t.zuletztKontakte}
          </p>

          <ul className="flex max-h-[28rem] flex-col gap-0.5 overflow-y-auto">
            {kontakte.length === 0 && (
              <li className="text-muted-foreground px-1 py-2 text-sm leading-relaxed">
                {sucht ? t.keineKontakte : t.sucheHinweis}
              </li>
            )}
            {kontakte.map((k) => {
              const aktiv = k.id === kontaktId
              const faellig = k.nextTouchAt && k.nextTouchAt <= heute
              return (
                <li key={k.id}>
                  <Link
                    href={`/admin/gespraech?kontakt=${k.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                    aria-current={aktiv ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-md px-2 py-2 transition-colors ${
                      aktiv ? "bg-surface ring-line-strong ring-1" : "hover:bg-surface"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] ${
                        aktiv ? "bg-gold text-primary-foreground" : "bg-secondary text-foreground"
                      }`}
                    >
                      {initialen(k.name)}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center justify-between gap-2 text-sm font-medium">
                        <span className="truncate">{k.name}</span>
                        {faellig && (
                          <span className="bg-gold/15 text-gold-text shrink-0 rounded px-1.5 font-mono text-[10px] uppercase">
                            {t.heuteFaellig}
                          </span>
                        )}
                      </span>
                      <span className="text-muted-foreground truncate text-xs">
                        {[k.organisation, k.phone].filter(Boolean).join(" · ") || "—"}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <details className="group border-line rounded-lg border" open={kontakte.length === 0}>
            <summary className="hover:bg-surface flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium">
              <Plus aria-hidden="true" className="size-4 transition-transform group-open:rotate-45" />
              {t.neuerKontakt}
            </summary>
            <form action={kontaktAnlegen} className="flex flex-col gap-3 px-3 pb-3">
              <label className="text-muted-foreground flex flex-col gap-1 text-xs">
                {t.name}
                <input name="name" required maxLength={160} className={FELD} />
              </label>
              <label className="text-muted-foreground flex flex-col gap-1 text-xs">
                {t.firma}
                <input name="firma" maxLength={160} className={FELD} />
              </label>
              <label className="text-muted-foreground flex flex-col gap-1 text-xs">
                {t.telefon}
                <input name="phone" type="tel" maxLength={60} className={FELD} />
              </label>
              <label className="text-muted-foreground flex flex-col gap-1 text-xs">
                {t.email}
                <input name="email" type="email" maxLength={200} className={FELD} />
              </label>
              <button
                type="submit"
                className="bg-gold text-primary-foreground hover:bg-gold-deep rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                {t.anlegen}
              </button>
            </form>
          </details>
        </aside>

        <div className="min-w-0">
          {kontakt ? (
            <Gespraechsraum
              key={kontakt.id}
              kontakt={kontakt}
              t={t}
              verlauf={<Verlauf eintraege={verlauf} t={t} />}
            />
          ) : (
            <div className="border-line grid overflow-hidden rounded-xl border xl:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="flex min-h-96 flex-col justify-center gap-3 p-8 sm:p-12">
                <p className="eyebrow text-gold-text">{t.zentrale}</p>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-balance">{t.waehlen}</h2>
                <p className="text-muted-foreground max-w-lg leading-relaxed text-pretty">{t.waehlenText}</p>
              </div>
              <aside
                aria-label={t.zuletzt}
                className="border-line bg-background/60 flex flex-col border-t xl:border-t-0 xl:border-l"
              >
                <h2 className="border-line font-display border-b px-5 py-4 text-base font-semibold">{t.zuletzt}</h2>
                <div className="px-5 py-5">
                  <Verlauf eintraege={verlauf} t={t} mitName />
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
