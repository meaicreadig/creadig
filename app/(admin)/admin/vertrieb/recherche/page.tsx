import Link from "next/link"

import { Abschneidehinweis, Pill, SectionHeader } from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { getVertriebStore } from "@/lib/lead-store"
import { RESEARCH_STATES, abbruch, alterInTagen, einordnung, mehrfachBelegt } from "@/lib/research"

/**
 * Vertrieb · Recherche — ADM-01 DE/TR.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.rechercheListe.titel }
}

const RANG: Record<string, number> = {
  "beleg-fehlt": 0,
  "in-recherche": 1,
  entdeckt: 2,
  eingeordnet: 3,
  "bereit-fuer-kontakt": 4,
  zurueckgestellt: 5,
  ausgeschlossen: 6,
}

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { t } = await adminSprachKontext()
  const { status } = await searchParams
  const store = getVertriebStore()
  const nichtVerfuegbar = (
    <VertriebShell title={t.rechercheListe.titel} lead={t.rechercheListe.lead} available={false}>
      {null}
    </VertriebShell>
  )
  if (!store) return nichtVerfuegbar

  const gefiltert = (RESEARCH_STATES as readonly string[]).includes(status ?? "")
    ? (status as (typeof RESEARCH_STATES)[number])
    : undefined
  const GRENZE = 200
  const faelle = await store.listResearch({ status: gefiltert, limit: GRENZE }).catch(() => null)
  if (faelle === null) return nichtVerfuegbar
  const sortiert = [...faelle].sort((a, b) => (RANG[a.status] ?? 9) - (RANG[b.status] ?? 9))

  return (
    <VertriebShell
      title={t.rechercheListe.titel}
      lead={t.rechercheListe.lead}
      available
    >
      <nav aria-label={t.rechercheListe.zustandNav} className="flex flex-wrap gap-2">
        <Link
          href="/admin/vertrieb/recherche"
          className={`type-small rounded-sm border px-3 py-1.5 ${
            gefiltert ? "border-line-strong text-muted-foreground" : "border-gold text-gold-text"
          }`}
        >
          {t.rechercheListe.alle}
        </Link>
        {RESEARCH_STATES.map((s) => (
          <Link
            key={s}
            href={`/admin/vertrieb/recherche?status=${s}`}
            className={`type-small rounded-sm border px-3 py-1.5 ${
              gefiltert === s ? "border-gold text-gold-text" : "border-line-strong text-muted-foreground"
            }`}
          >
            {t.begriffe.rechercheStatus[s] ?? s}
          </Link>
        ))}
      </nav>

      {sortiert.length === 0 ? (
        <section className="border-line mt-10 border-s-2 py-6 ps-6">
          <SectionHeader title={t.rechercheListe.leerTitel} />
          <p className="type-small text-muted-foreground mt-4 max-w-2xl text-pretty">
            {t.rechercheListe.leerText}
          </p>
          <p className="type-small text-muted-foreground mt-4">
            {t.rechercheListe.zielbildHinweis}{" "}
            <Link href="/admin/material#gruppe-entscheidungen" className="text-gold-text underline underline-offset-4">
              {t.rechercheListe.zielbildLink}
            </Link>
          </p>
        </section>
      ) : (
        <ul className="mt-10 flex flex-col">
          {sortiert.map((f) => {
            const e = einordnung(f)
            const stop = abbruch(f)
            const tage = alterInTagen(f)
            const mehrfach = mehrfachBelegt(f).length
            const belegt = f.evidence.filter((x) => !x.supersededBy && x.kind === "signal").length
            return (
              <li key={f.id} className="border-line border-b">
                <Link
                  href={`/admin/vertrieb/recherche/${f.id}`}
                  className="hover:bg-surface group flex flex-col gap-3 py-5 transition-colors duration-[var(--dur-1)] lg:flex-row lg:items-baseline lg:gap-6"
                >
                  <span className="lg:w-72 lg:shrink-0">
                    <span className="type-small text-foreground block">{f.organisationName}</span>
                    <span className="text-meta text-muted-foreground block">
                      {t.begriffe.rechercheStatus[f.status] ?? f.status}
                    </span>
                  </span>
                  <span className="lg:w-40 lg:shrink-0">
                    <Pill severity={e.passung.urteil === "passend" ? "attention" : "neutral"}>
                      {t.rechercheListe.passung[e.passung.urteil] ?? e.passung.urteil}
                    </Pill>
                  </span>
                  <span className="type-small text-muted-foreground min-w-0 flex-1 text-pretty">
                    {stop.warum}
                  </span>
                  <span className="text-meta text-muted-foreground lg:w-52 lg:shrink-0 lg:text-end">
                    {f.contactId ? t.rechercheListe.mitPerson : t.rechercheListe.ohnePerson}
                    {f.contactDecision ? ` · ${f.contactDecision}` : ""}
                    {" · "}
                    {t.rechercheListe.signal(belegt)}
                    {tage !== null && ` · ${t.rechercheListe.tage(tage)}`}
                    {mehrfach > 0 && ` · ${t.rechercheListe.mehrfach(mehrfach)}`}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <Abschneidehinweis
        gezeigt={sortiert.length}
        grenze={GRENZE}
        wie={t.rechercheListe.abschneideWie}
      />

      <p className="type-small text-muted-foreground border-line mt-10 max-w-2xl border-t pt-6 text-pretty">
        {t.rechercheListe.fuss}{" "}
        <span className="text-foreground">{t.rechercheListe.bereitFuerKontakt}</span>
      </p>
    </VertriebShell>
  )
}
