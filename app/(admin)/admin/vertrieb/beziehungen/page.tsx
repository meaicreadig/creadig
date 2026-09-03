import Link from "next/link"

import { AdminField, AdminInput, AdminSelect, Pill, SectionHeader } from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { getVertriebStore } from "@/lib/lead-store"
import { RELATIONSHIP_LABELS, RELATIONSHIP_LEVELS } from "@/lib/vertrieb"
import type { ContactQuery, ContactRow, RelationshipLevel } from "@/lib/vertrieb"

/**
 * Vertrieb · Beziehungen.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES DIESE SEITE ÜBERHAUPT GIBT
 * Nicht jede Beziehung ist ein Geschäft. Der Bekannte, bei dem gerade nichts
 * ansteht, gehört trotzdem gepflegt — und in einer reinen Pipeline-Ansicht
 * existiert er nicht, weil er keine offene Chance hat.
 *
 * Genau deshalb ist `relationship` eine eigene Achse. Wer sie mit dem
 * Pipeline-Status zusammenlegt, hat zwei Möglichkeiten: warme Kontakte als
 * Vorgänge führen (dann steht die Pipeline voll mit Nicht-Geschäften) oder
 * sie gar nicht führen (dann verliert man sie). Beides ist falsch.
 *
 * ---------------------------------------------------------------------------
 * DIE SORTIERUNG
 * Fällige Beziehungspflege zuerst, dann nach letzter Berührung. Wer am
 * längsten nichts gehört hat, steht oben — das ist die einzige Rangfolge,
 * die sich aus vorhandenen Daten begründen lässt.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Beziehungen" }

const BUCKETS = [
  { value: "", label: "alle" },
  { value: "mit-chance", label: "mit Verkaufschance" },
  { value: "ohne-chance", label: "ohne Verkaufschance" },
  { value: "pflege-faellig", label: "Kontaktpflege fällig" },
]

export default async function BeziehungenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; grad?: string; bucket?: string }>
}) {
  const store = getVertriebStore()
  if (!store) return <VertriebShell title="Beziehungen" available={false}>{null}</VertriebShell>

  const params = await searchParams
  const search = typeof params.q === "string" ? params.q.trim() : ""
  const relationship = (RELATIONSHIP_LEVELS as readonly string[]).includes(params.grad ?? "")
    ? (params.grad as RelationshipLevel)
    : undefined
  const bucket = BUCKETS.some((b) => b.value && b.value === params.bucket)
    ? (params.bucket as ContactQuery["bucket"])
    : undefined

  let page: { rows: ContactRow[]; total: number }
  try {
    page = await store.listContacts({ search: search || undefined, relationship, bucket, limit: 100 })
  } catch {
    return <VertriebShell title="Beziehungen" available={false}>{null}</VertriebShell>
  }

  return (
    <VertriebShell
      title="Beziehungen"
      lead="Menschen und Betriebe — unabhängig davon, ob gerade etwas läuft."
      meta={<span className="block">{page.total} gesamt</span>}
      available
    >
      <form method="get" className="flex flex-wrap items-end gap-4">
        <AdminField label="Suche" htmlFor="q" className="flex-1 basis-64">
          <AdminInput id="q" name="q" type="search" defaultValue={search} placeholder="Name, E-Mail, Betrieb" />
        </AdminField>
        <AdminField label="Beziehungsgrad" htmlFor="grad">
          <AdminSelect id="grad" name="grad" defaultValue={relationship ?? ""}>
            <option value="">alle</option>
            {RELATIONSHIP_LEVELS.map((r) => (
              <option key={r} value={r}>{RELATIONSHIP_LABELS[r]}</option>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label="Auswahl" htmlFor="bucket">
          <AdminSelect id="bucket" name="bucket" defaultValue={bucket ?? ""}>
            {BUCKETS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </AdminSelect>
        </AdminField>
        <button type="submit" className="cta-quiet px-4 py-2 text-sm">Anwenden</button>
      </form>

      <div className="mt-10">
        <SectionHeader title="Kontakte" count={`${page.rows.length} von ${page.total}`} />
        {page.rows.length === 0 ? (
          <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
            {search || relationship || bucket
              ? "Kein Kontakt passt zu dieser Auswahl."
              : "Noch kein Kontakt. Kontakte entstehen aus Anfragen — automatisch und ohne Dubletten."}
          </p>
        ) : (
          <ContactTable rows={page.rows} />
        )}
      </div>
    </VertriebShell>
  )
}

function ContactTable({ rows }: { rows: ContactRow[] }) {
  const heute = new Date().toISOString().slice(0, 10)
  return (
    <div className="border-line mt-6 overflow-x-auto rounded-md border">
      <table className="w-full min-w-[54rem] border-collapse text-start">
        <caption className="sr-only">
          Kontakte mit Name, Organisation, Beziehungsgrad, letzter Berührung, nächstem Schritt und Verkaufschance
        </caption>
        <thead>
          <tr className="border-line bg-muted/50 border-b">
            <Th>Name</Th><Th>Organisation</Th><Th>Beziehung</Th>
            <Th>Letzte Berührung</Th><Th>Nächster Schritt</Th><Th>Chance</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const due = c.nextTouchAt !== null && c.nextTouchAt <= heute
            return (
              <tr key={c.id} className="border-line hover:bg-muted/40 border-b last:border-b-0">
                <Td>
                  <Link href={`/admin/vertrieb/beziehungen/${c.id}`} className="text-gold-text text-sm underline underline-offset-4">
                    {c.name}
                  </Link>
                  <span className="text-muted-foreground block text-xs">{c.email}</span>
                </Td>
                <Td><span className="text-xs">{c.organisationName ?? "—"}</span></Td>
                <Td>
                  <Pill severity={c.relationship === "warm" || c.relationship === "eng" ? "attention" : "neutral"}>
                    {RELATIONSHIP_LABELS[c.relationship]}
                  </Pill>
                </Td>
                <Td>
                  <span className="text-xs tabular-nums">
                    {c.lastInteractionAt ? formatDate(c.lastInteractionAt) : "—"}
                  </span>
                </Td>
                <Td>
                  {c.nextTouch ? (
                    <>
                      <span className="text-xs">{c.nextTouch}</span>
                      {c.nextTouchAt && (
                        <span className={`block text-xs tabular-nums ${due ? "text-destructive" : "text-muted-foreground"}`}>
                          {formatDate(c.nextTouchAt)}{due && " · fällig"}
                        </span>
                      )}
                    </>
                  ) : <span className="text-muted-foreground text-xs">—</span>}
                </Td>
                <Td>
                  <span className="text-xs tabular-nums">
                    {c.openOpportunities > 0 ? `${c.openOpportunities} offen` : "—"}
                  </span>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th scope="col" className="text-meta text-muted-foreground px-4 py-2.5 font-normal">{children}</th>
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>
}
function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })
}
