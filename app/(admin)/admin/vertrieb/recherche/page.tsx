import Link from "next/link"

import { Pill, SectionHeader, UnavailableNote } from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { getVertriebStore } from "@/lib/lead-store"
import { RESEARCH_STATES, STATE_MEANING, abbruch, alterInTagen, einordnung, widersprueche } from "@/lib/research"

/**
 * Vertrieb · Recherche.
 *
 * ---------------------------------------------------------------------------
 * SORTIERT NACH ARBEIT, NICHT NACH ALPHABET
 * Oben steht, woran heute etwas zu tun ist. Ein Betrieb, dem ein zweites
 * Signal fehlt, ist Arbeit; einer, der zurueckgestellt ist, ist es nicht.
 *
 * ---------------------------------------------------------------------------
 * KEINE PUNKTZAHL
 * Die Spalte „Passung" traegt ein Wort und einen Grund, keine Zahl. Wer
 * widerspricht, widerspricht einem Satz.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Recherche" }

/** Arbeit zuerst. Die Reihenfolge IST die Aussage. */
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
  const { status } = await searchParams
  const store = getVertriebStore()
  if (!store) {
    return (
      <VertriebShell title="Recherche" lead="Betriebe finden, belegen, einordnen." available={false}>
        <UnavailableNote title="Recherche nicht verfügbar">
          Der Vertriebs-Speicher ist nicht erreichbar.
        </UnavailableNote>
      </VertriebShell>
    )
  }

  const gefiltert = (RESEARCH_STATES as readonly string[]).includes(status ?? "")
    ? (status as (typeof RESEARCH_STATES)[number])
    : undefined
  const faelle = await store.listResearch({ status: gefiltert, limit: 200 })
  const sortiert = [...faelle].sort((a, b) => (RANG[a.status] ?? 9) - (RANG[b.status] ?? 9))

  return (
    <VertriebShell
      title="Recherche"
      lead="Betriebe finden, belegen, einordnen — bis klar ist, ob ein Gespräch lohnt."
      available
    >
      <nav aria-label="Zustand" className="flex flex-wrap gap-2">
        <Link
          href="/admin/vertrieb/recherche"
          className={`type-small rounded-sm border px-3 py-1.5 ${
            gefiltert ? "border-line-strong text-muted-foreground" : "border-gold text-gold-text"
          }`}
        >
          alle
        </Link>
        {RESEARCH_STATES.map((s) => (
          <Link
            key={s}
            href={`/admin/vertrieb/recherche?status=${s}`}
            className={`type-small rounded-sm border px-3 py-1.5 ${
              gefiltert === s ? "border-gold text-gold-text" : "border-line-strong text-muted-foreground"
            }`}
          >
            {s}
          </Link>
        ))}
      </nav>

      {sortiert.length === 0 ? (
        <section className="border-line mt-10 border-s-2 py-6 ps-6">
          <SectionHeader title="Noch kein Betrieb in der Recherche" />
          <p className="type-small text-muted-foreground mt-4 max-w-2xl text-pretty">
            Ein Betrieb kommt hier hinein, sobald ein Anlass ihn hineinbringt — eine
            Stellenanzeige, die drei Werkzeuge nebeneinander nennt; eine Ausschreibung; ein
            Hinweis aus dem Netzwerk. Die Recherche endet, wenn zwei Betriebssignale belegt
            sind oder ein Ausschluss feststeht. Nicht später.
          </p>
          <p className="type-small text-muted-foreground mt-4">
            Woran ein passender Betrieb zu erkennen ist, steht im Zielbild:{" "}
            <code className="text-gold-text">docs/sales/market-canon.md</code>
          </p>
        </section>
      ) : (
        <ul className="mt-10 flex flex-col">
          {sortiert.map((f) => {
            const e = einordnung(f)
            const stop = abbruch(f)
            const tage = alterInTagen(f)
            const konflikt = widersprueche(f).length
            const belegt = f.evidence.filter((x) => !x.supersededBy && x.kind === "signal").length
            return (
              <li key={f.id} className="border-line border-b">
                <Link
                  href={`/admin/vertrieb/recherche/${f.id}`}
                  className="hover:bg-surface group flex flex-col gap-3 py-5 transition-colors duration-[var(--dur-1)] lg:flex-row lg:items-baseline lg:gap-6"
                >
                  <span className="lg:w-72 lg:shrink-0">
                    <span className="type-small text-foreground block">{f.organisationName}</span>
                    <span className="text-meta text-muted-foreground block">{f.status}</span>
                  </span>
                  <span className="lg:w-40 lg:shrink-0">
                    <Pill severity={e.passung.urteil === "passend" ? "attention" : "neutral"}>
                      {e.passung.urteil}
                    </Pill>
                  </span>
                  <span className="type-small text-muted-foreground min-w-0 flex-1 text-pretty">
                    {stop.warum}
                  </span>
                  <span className="text-meta text-muted-foreground lg:w-52 lg:shrink-0 lg:text-end">
                    {/* GATE 11 — ob eine Person am Vorgang haengt, ist die
                        zweite Frage nach der Passung. Sie gehoert in die
                        Uebersicht, sonst sucht man sie in jedem Detail. */}
                    {f.contactId ? "Person" : "ohne Person"}
                    {f.contactDecision ? ` · ${f.contactDecision}` : ""}
                    {" · "}
                    {belegt} {belegt === 1 ? "Signal" : "Signale"}
                    {tage !== null && ` · ${tage} T`}
                    {konflikt > 0 && ` · ${konflikt} Widerspruch`}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <p className="type-small text-muted-foreground border-line mt-10 border-t pt-6 max-w-2xl text-pretty">
        Recherche ist kein Vertrieb. Hier entsteht keine Verkaufschance, kein Kontakt und
        keine Werbeeinwilligung — nur ein begründetes Urteil darüber, ob ein Gespräch lohnt.
        {" "}
        <span className="text-foreground">{STATE_MEANING["bereit-fuer-kontakt"]}</span>
      </p>
    </VertriebShell>
  )
}
