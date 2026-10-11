import Link from "next/link"

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
  "border-line bg-surface focus:border-gold w-full border px-3 py-2.5 text-sm outline-none transition-colors"

function Verlauf({ eintraege, t, mitName }: { eintraege: GespraechEintrag[]; t: GespraechText; mitName?: boolean }) {
  if (eintraege.length === 0) return <p className="text-muted-foreground text-sm leading-relaxed">{t.keinVerlauf}</p>
  return (
    <ol className="flex flex-col gap-3">
      {eintraege.map((g) => (
        <li key={g.id} className="border-line border-l-2 pl-4">
          <details className="group">
            <summary className="cursor-pointer list-none">
              <p className="text-muted-foreground font-mono text-xs">
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
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed whitespace-pre-line">{g.detail}</p>
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
      <AdminShell title={t.titel} lead={t.lead}>
        <p className="text-muted-foreground">{t.nichtVerfuegbar}</p>
      </AdminShell>
    )
  }

  const [kontakte, kontakt, verlauf] = await Promise.all([
    sucheKontakte(q ?? null),
    kontaktId ? holeKontakt(kontaktId) : Promise.resolve(null),
    gespraeche(kontaktId ?? null, kontaktId ? 12 : 8),
  ])
  const heute = new Date().toISOString().slice(0, 10)

  return (
    <AdminShell title={t.titel} lead={t.lead}>
      <div className="grid gap-8 lg:grid-cols-[17rem_1fr] 2xl:grid-cols-[17rem_1fr_19rem]">
        <aside aria-label={t.kontakte} className="flex flex-col gap-4">
          <form role="search" className="flex gap-2">
            {kontaktId && <input type="hidden" name="kontakt" value={kontaktId} />}
            <label htmlFor="g-suche" className="sr-only">
              {t.suche}
            </label>
            <input id="g-suche" name="q" defaultValue={q ?? ""} placeholder={t.suche} className={FELD} />
            <button type="submit" className="border-line-strong hover:border-gold border px-3 text-sm transition-colors">
              {t.suchen}
            </button>
          </form>

          <ul className="flex max-h-[26rem] flex-col overflow-y-auto">
            {kontakte.length === 0 && <li className="text-muted-foreground py-2 text-sm">{t.keineKontakte}</li>}
            {kontakte.map((k) => {
              const aktiv = k.id === kontaktId
              const faellig = k.nextTouchAt && k.nextTouchAt <= heute
              return (
                <li key={k.id}>
                  <Link
                    href={`/admin/gespraech?kontakt=${k.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                    aria-current={aktiv ? "page" : undefined}
                    className={`border-line flex flex-col gap-0.5 border-b px-3 py-2.5 transition-colors ${
                      aktiv ? "bg-surface border-l-gold border-l-2" : "hover:bg-surface"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-medium">
                      <span className="truncate">{k.name}</span>
                      {faellig && (
                        <span className="text-gold-text shrink-0 font-mono text-[11px] uppercase">{t.heuteFaellig}</span>
                      )}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {[k.organisation, k.phone].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <details className="border-line border p-4" open={kontakte.length === 0}>
            <summary className="cursor-pointer text-sm font-medium">{t.neuerKontakt}</summary>
            <form action={kontaktAnlegen} className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-xs">
                {t.name}
                <input name="name" required maxLength={160} className={FELD} />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                {t.firma}
                <input name="firma" maxLength={160} className={FELD} />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                {t.telefon}
                <input name="phone" type="tel" maxLength={60} className={FELD} />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                {t.email}
                <input name="email" type="email" maxLength={200} className={FELD} />
              </label>
              <button type="submit" className="bg-gold text-background hover:bg-gold-deep px-4 py-2.5 text-sm font-medium transition-colors">
                {t.anlegen}
              </button>
            </form>
          </details>
        </aside>

        <div className="min-w-0">
          {kontakt ? (
            <Gespraechsraum key={kontakt.id} kontakt={kontakt} t={t} />
          ) : (
            <div className="border-line flex min-h-80 flex-col justify-center gap-3 border border-dashed p-8">
              <h2 className="type-h3 text-balance">{t.waehlen}</h2>
              <p className="text-muted-foreground max-w-lg leading-relaxed text-pretty">{t.waehlenText}</p>
            </div>
          )}
        </div>

        <aside aria-label={kontakt ? t.verlauf : t.zuletzt} className="flex flex-col gap-4 lg:col-span-2 2xl:col-span-1">
          <h2 className="eyebrow text-gold-text">{kontakt ? t.verlauf : t.zuletzt}</h2>
          <Verlauf eintraege={verlauf} t={t} mitName={!kontakt} />
        </aside>
      </div>
    </AdminShell>
  )
}
