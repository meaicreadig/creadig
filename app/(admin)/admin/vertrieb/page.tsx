import Link from "next/link"

import { Pill, SectionHeader, Surface } from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { SALES_LABELS_DE, getVertriebStore } from "@/lib/lead-store"
import type { OpportunityRow, VertriebSummary } from "@/lib/vertrieb"

/**
 * Vertrieb · Übersicht.
 *
 * ---------------------------------------------------------------------------
 * DIE FRAGE
 * „Was braucht heute meine Aufmerksamkeit?" — und zwar so, dass jede Zeile
 * anklickbar zu ihrem Vorgang führt. Eine Übersicht, aus der man nicht
 * herauskommt, ist ein Poster.
 *
 * ---------------------------------------------------------------------------
 * SIEBEN ZAHLEN, KEINE ACHTE
 * Jede ist eine Zählung über echte Zeilen, jede führt auf genau die Liste,
 * die sie zählt. „Kunden ohne offene Chance" ist die jüngste und steht hier
 * nur, weil daraus eine Handlung folgt: Liste öffnen, durchgehen,
 * entscheiden. Eine Zahl ohne Anschlusshandlung gehört in einen Bericht,
 * nicht auf eine Arbeitsfläche.
 *
 * Was hier NICHT steht:
 * Abschlussquoten, Pipeline-Wert, Prognosen, Trends. Für alle vier fehlt die
 * Grundlage — es gibt keine historischen Statuswechsel vor dieser Version,
 * keine gepflegten Werte und keine abgeschlossenen Vorgänge in nennenswerter
 * Zahl. Eine Quote aus drei Datensätzen ist keine Quote, sondern eine
 * Behauptung mit Prozentzeichen.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Vertrieb" }

export default async function VertriebUebersicht() {
  const store = getVertriebStore()
  if (!store) return <VertriebShell title="Vertrieb" available={false}>{null}</VertriebShell>

  let data: VertriebSummary
  try {
    data = await store.summary()
  } catch {
    return <VertriebShell title="Vertrieb" available={false}>{null}</VertriebShell>
  }

  const stand = new Date().toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  })

  return (
    <VertriebShell
      title="Vertrieb"
      lead="Was heute ansteht — gezählt, nicht geschätzt."
      meta={<span className="block">Stand {stand}</span>}
      available
    >
      {/* ── Die Zahlen ── */}
      <section aria-labelledby="zahlen-titel">
        <SectionHeader id="zahlen-titel" title="Stand" />
        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <Count label="Neue Anfragen" value={data.newEnquiries} href="/admin/vertrieb/anfragen?status=neu" accent={data.newEnquiries > 0} />
          <Count label="Heute fällig" value={data.dueToday} href="/admin/vertrieb/pipeline?bucket=faellig" accent={data.dueToday > 0} />
          <Count label="Überfällig" value={data.overdue} href="/admin/vertrieb/pipeline?bucket=ueberfaellig" critical={data.overdue > 0} />
          <Count label="Offene Verkaufschancen" value={data.openOpportunities} href="/admin/vertrieb/pipeline?bucket=offen" />
          <Count label="Ohne nächsten Schritt" value={data.withoutNextAction} href="/admin/vertrieb/pipeline?bucket=ohne-schritt" accent={data.withoutNextAction > 0} />
          {/* Beide Kacheln führen auf GENAU die Menge, die sie zählen.
              „Warm ohne Chance" zeigte vorher auf „ohne-chance" — eine viel
              grössere Liste als die Zahl daneben. Eine Kachel, deren Ziel
              nicht ihrer Zahl entspricht, ist schlimmer als keine. */}
          <Count label="Warm ohne Chance" value={data.warmWithoutOpportunity} href="/admin/vertrieb/beziehungen?bucket=warm-ohne-chance" />
          <Count label="Kunden ohne offene Chance" value={data.customersWithoutOpportunity} href="/admin/vertrieb/organisationen?bucket=kunde-ohne-chance" />
        </ul>
      </section>

      {/* ── Die Liste, die die Frage wirklich beantwortet ── */}
      <section aria-labelledby="aufmerksamkeit-titel" className="mt-12">
        <SectionHeader
          id="aufmerksamkeit-titel"
          title="Braucht Aufmerksamkeit"
          count={data.attention.length > 0 ? `${data.attention.length}` : undefined}
        />
        {data.attention.length === 0 ? (
          <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
            Kein offener Vorgang ist fällig oder ohne nächsten Schritt. Das ist
            eine Aussage über die Pipeline, nicht über die Datenlage.
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-2.5">
            {data.attention.map((o) => (
              <li key={o.id}>
                <AttentionRow opportunity={o} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Zuletzt abgeschlossen ── */}
      {data.recentlyClosed.length > 0 && (
        <section aria-labelledby="abgeschlossen-titel" className="mt-12">
          <SectionHeader id="abgeschlossen-titel" title="Zuletzt abgeschlossen" as="h3" />
          <ul className="mt-4 flex flex-col">
            {data.recentlyClosed.map((o) => (
              <li key={o.id} className="border-line flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b py-3">
                <Link href={`/admin/vertrieb/pipeline/${o.id}`} className="text-subhead min-w-0 flex-1 text-sm underline-offset-4 hover:underline">
                  {o.title}
                </Link>
                <Pill severity={o.status === "lost" ? "critical" : "neutral"}>
                  {SALES_LABELS_DE[o.status]}
                </Pill>
                <span className="text-meta text-muted-foreground shrink-0 tabular-nums">
                  {formatDate(o.updatedAt)}
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

function AttentionRow({ opportunity: o }: { opportunity: OpportunityRow }) {
  const overdue = o.nextActionAt !== null && o.nextActionAt < today()
  return (
    <Link href={`/admin/vertrieb/pipeline/${o.id}`} className="block">
      <Surface padding="sm" className="hover:border-line-strong transition-colors duration-[var(--dur-1)]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <span className="text-subhead min-w-0 text-sm">{o.title}</span>
          <Pill severity={overdue ? "critical" : "attention"}>{SALES_LABELS_DE[o.status]}</Pill>
        </div>
        <p className="type-small text-muted-foreground mt-2 text-pretty">
          {o.nextAction ? (
            <>
              {o.nextAction}
              {o.nextActionAt && (
                <span className={overdue ? "text-destructive" : ""}>
                  {" · "}
                  {overdue ? "überfällig seit " : "fällig "}
                  {formatDate(o.nextActionAt)}
                </span>
              )}
            </>
          ) : (
            <span className="text-gold-text">Kein nächster Schritt gesetzt</span>
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

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })
}
