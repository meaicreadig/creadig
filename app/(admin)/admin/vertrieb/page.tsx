import Link from "next/link"

import { Pill, SectionHeader, Surface } from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import type { AdminTexte } from "@/lib/admin-i18n"
import { getVertriebStore } from "@/lib/lead-store"
import type { OpportunityRow, VertriebSummary } from "@/lib/vertrieb"
import { GESCHAEFTS_ZEITZONE, datumAnzeige, geschaeftsTag } from "@/lib/geschaeftszeit"

/**
 * Vertrieb · Übersicht — ADM-01 DE/TR.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.vertriebHub.titel }
}

export default async function VertriebUebersicht() {
  const { t, intl } = await adminSprachKontext()
  const store = getVertriebStore()
  if (!store) return <VertriebShell title={t.vertriebHub.titel} available={false}>{null}</VertriebShell>

  let data: VertriebSummary
  try {
    data = await store.summary()
  } catch {
    return <VertriebShell title={t.vertriebHub.titel} available={false}>{null}</VertriebShell>
  }

  const stand = new Date().toLocaleString(intl, {
    timeZone: GESCHAEFTS_ZEITZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <VertriebShell
      title={t.vertriebHub.titel}
      lead={t.vertriebHub.lead}
      meta={<span className="block">{t.vertriebHub.stand(stand)}</span>}
      available
    >
      <section aria-labelledby="zahlen-titel">
        <SectionHeader id="zahlen-titel" title={t.vertriebHub.zahlenTitel} />
        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <Count label={t.vertriebHub.neueAnfragen} value={data.newEnquiries} href="/admin/vertrieb/anfragen?status=neu" accent={data.newEnquiries > 0} />
          <Count label={t.vertriebHub.heuteFaellig} value={data.dueToday} href="/admin/vertrieb/pipeline?bucket=faellig" accent={data.dueToday > 0} />
          <Count label={t.vertriebHub.ueberfaellig} value={data.overdue} href="/admin/vertrieb/pipeline?bucket=ueberfaellig" critical={data.overdue > 0} />
          <Count label={t.vertriebHub.offeneChancen} value={data.openOpportunities} href="/admin/vertrieb/pipeline?bucket=offen" />
          <Count label={t.vertriebHub.ohneSchritt} value={data.withoutNextAction} href="/admin/vertrieb/pipeline?bucket=ohne-schritt" accent={data.withoutNextAction > 0} />
          <Count label={t.vertriebHub.warmOhneChance} value={data.warmWithoutOpportunity} href="/admin/vertrieb/beziehungen?bucket=warm-ohne-chance" />
          <Count label={t.vertriebHub.kundenOhneChance} value={data.customersWithoutOpportunity} href="/admin/kunden?bucket=kunde-ohne-chance" />
        </ul>
      </section>

      <section aria-labelledby="aufmerksamkeit-titel" className="mt-12">
        <SectionHeader
          id="aufmerksamkeit-titel"
          title={t.vertriebHub.aufmerksamkeit}
          count={data.attention.length > 0 ? `${data.attention.length}` : undefined}
        />
        {data.attention.length === 0 ? (
          <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
            {t.vertriebHub.aufmerksamkeitLeer}
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-2.5">
            {data.attention.map((o) => (
              <li key={o.id}>
                <AttentionRow opportunity={o} t={t} intl={intl} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.recentlyClosed.length > 0 && (
        <section aria-labelledby="abgeschlossen-titel" className="mt-12">
          <SectionHeader id="abgeschlossen-titel" title={t.vertriebHub.zuletztAbgeschlossen} as="h3" />
          <ul className="mt-4 flex flex-col">
            {data.recentlyClosed.map((o) => (
              <li key={o.id} className="border-line flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b py-3">
                <Link href={`/admin/vertrieb/pipeline/${o.id}`} className="text-subhead min-w-0 flex-1 text-sm underline-offset-4 hover:underline">
                  {o.title}
                </Link>
                <Pill severity={o.status === "lost" ? "critical" : "neutral"}>
                  {t.begriffe.stufe[o.status] ?? o.status}
                </Pill>
                <span className="text-meta text-muted-foreground shrink-0 tabular-nums">
                  {datumAnzeige(o.updatedAt, intl)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </VertriebShell>
  )
}

function Count({
  label, value, href, accent = false, critical = false,
}: {
  label: string; value: number; href: string; accent?: boolean; critical?: boolean
}) {
  return (
    <li>
      <Link href={href} className="block">
        <Surface padding="sm" className="hover:border-line-strong transition-colors duration-[var(--dur-1)]">
          <span className="text-meta text-muted-foreground block">{label}</span>
          <span
            className={`type-stat mt-1 block tabular-nums ${
              critical && value > 0 ? "text-destructive" : accent && value > 0 ? "text-gold-text" : ""
            }`}
          >
            {value}
          </span>
        </Surface>
      </Link>
    </li>
  )
}

function AttentionRow({
  opportunity: o,
  t,
  intl,
}: {
  opportunity: OpportunityRow
  t: AdminTexte
  intl: string
}) {
  const overdue = o.nextActionAt !== null && o.nextActionAt < geschaeftsTag()
  return (
    <Link href={`/admin/vertrieb/pipeline/${o.id}`} className="block">
      <Surface padding="sm" className="hover:border-line-strong transition-colors duration-[var(--dur-1)]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <span className="text-subhead min-w-0 text-sm">{o.title}</span>
          <Pill severity={overdue ? "critical" : "attention"}>{t.begriffe.stufe[o.status] ?? o.status}</Pill>
        </div>
        <p className="type-small text-muted-foreground mt-2 text-pretty">
          {o.nextAction ? (
            <>
              {o.nextAction}
              {o.nextActionAt && (
                <span className={overdue ? "text-destructive" : ""}>
                  {" · "}
                  {overdue ? t.vertriebHub.ueberfaelligSeit : t.vertriebHub.faellig}
                  {datumAnzeige(o.nextActionAt, intl)}
                </span>
              )}
            </>
          ) : (
            <span className="text-gold-text">{t.vertriebHub.keinSchritt}</span>
          )}
        </p>
        {(o.organisationName || o.contactName) && (
          <p className="text-meta text-muted-foreground mt-1">
            {[o.organisationName, o.contactName].filter(Boolean).join(" · ")}
          </p>
        )}
      </Surface>
    </Link>
  )
}
