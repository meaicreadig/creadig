import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { Pill, Surface } from "@/components/admin/primitives"
import {
  MESSE_KATEGORIEN,
  MESSE_REGIONEN,
  naechsteTermine,
  type Empfehlung,
  type MesseKategorie,
  type MesseRegion,
} from "@/lib/messen"

export const metadata = { title: "Messen" }

const EMPFEHLUNG: Record<Empfehlung, { text: string; severity: "attention" | "neutral" | "critical" }> = {
  ausstellen: { text: "Ausstellen", severity: "critical" },
  besuchen: { text: "Besuchen", severity: "attention" },
  beobachten: { text: "Beobachten", severity: "neutral" },
}

const MONATE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]

function FilterLink({ href, aktiv, children }: { href: string; aktiv: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={aktiv ? "page" : undefined}
      className={
        aktiv
          ? "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
          : "rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground"
      }
    >
      {children}
    </Link>
  )
}

export default async function MessenPage({
  searchParams,
}: {
  searchParams: Promise<{ kategorie?: string; region?: string }>
}) {
  const sp = await searchParams
  const kategorie = sp.kategorie && sp.kategorie in MESSE_KATEGORIEN ? (sp.kategorie as MesseKategorie) : null
  const region = sp.region && sp.region in MESSE_REGIONEN ? (sp.region as MesseRegion) : null
  const alle = naechsteTermine()
  const liste = alle.filter((m) => (!kategorie || m.kategorie === kategorie) && (!region || m.region === region))
  const naechste3 = alle.filter((m) => m.empfehlung !== "beobachten").slice(0, 3)

  const link = (k: MesseKategorie | null, r: MesseRegion | null) => {
    const p = new URLSearchParams()
    if (k) p.set("kategorie", k)
    if (r) p.set("region", r)
    const s = p.toString()
    return s ? `/admin/messen?${s}` : "/admin/messen"
  }

  return (
    <AdminShell
      title="Messen"
      lead="Alle relevanten Messen ab heute — Glasfaser, Digital, 3D-Druck, E-Commerce. DACH und Türkei zuerst."
    >
      <div className="flex flex-col gap-6">
        <section aria-labelledby="als-naechstes" className="flex flex-col gap-4">
          <h2 id="als-naechstes" className="font-sans text-lg font-semibold">Als Nächstes lohnt sich</h2>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {naechste3.map((m) => (
              <li key={m.name}>
                <Surface padding="sm" className="flex h-full flex-col gap-2">
                  <span className="text-sm text-muted-foreground">
                    {MONATE[m.monat - 1]} {m.jahr} · {m.ort}
                  </span>
                  <span className="font-sans text-lg font-semibold">{m.name}</span>
                  <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{m.nutzen}</p>
                  <span className="mt-auto text-sm font-medium text-primary">
                    {m.monateBis <= 0 ? "diesen Monat" : `in ${m.monateBis} ${m.monateBis === 1 ? "Monat" : "Monaten"}`}
                  </span>
                </Surface>
              </li>
            ))}
          </ul>
        </section>

        <Surface>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2" aria-label="Kategorie">
                <FilterLink href={link(null, region)} aktiv={!kategorie}>Alle Bereiche</FilterLink>
                {(Object.keys(MESSE_KATEGORIEN) as MesseKategorie[]).map((k) => (
                  <FilterLink key={k} href={link(k, region)} aktiv={kategorie === k}>{MESSE_KATEGORIEN[k]}</FilterLink>
                ))}
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Region">
                <FilterLink href={link(kategorie, null)} aktiv={!region}>Alle Regionen</FilterLink>
                {(Object.keys(MESSE_REGIONEN) as MesseRegion[]).map((r) => (
                  <FilterLink key={r} href={link(kategorie, r)} aktiv={region === r}>{MESSE_REGIONEN[r]}</FilterLink>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[60rem] border-collapse text-start text-sm">
                <caption className="sr-only">Messen ab heute, nach Termin sortiert</caption>
                <thead>
                  <tr className="text-xs text-muted-foreground">
                    <th scope="col" className="px-3 py-2 text-start font-medium">Termin</th>
                    <th scope="col" className="px-3 py-2 text-start font-medium">Messe</th>
                    <th scope="col" className="px-3 py-2 text-start font-medium">Ort</th>
                    <th scope="col" className="px-3 py-2 text-start font-medium">Bereich</th>
                    <th scope="col" className="px-3 py-2 text-start font-medium">Nutzen für creaDIG</th>
                    <th scope="col" className="px-3 py-2 text-start font-medium">Empfehlung</th>
                  </tr>
                </thead>
                <tbody>
                  {liste.map((m) => (
                    <tr key={m.name} className="align-top odd:bg-muted/50">
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums">
                        <span className="font-medium">{MONATE[m.monat - 1]} {m.jahr}</span>
                        <span className="block text-xs text-muted-foreground">
                          {m.rhythmus === 1 ? "jährlich" : `alle ${m.rhythmus} Jahre`}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4">
                          {m.name}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">{m.ort} · {m.land}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{MESSE_KATEGORIEN[m.kategorie]}</td>
                      <td className="px-3 py-3 leading-relaxed text-pretty">{m.nutzen}</td>
                      <td className="px-3 py-3">
                        <Pill severity={EMPFEHLUNG[m.empfehlung].severity}>{EMPFEHLUNG[m.empfehlung].text}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {liste.length === 0 && <p className="text-sm text-muted-foreground">Für diese Auswahl ist noch keine Messe erfasst.</p>}
            <p className="text-xs leading-relaxed text-muted-foreground">
              Termine = übliche Messewoche des Veranstalters. Vor Buchung von Stand, Hotel oder Reise das genaue Datum auf der
              Veranstalterseite bestätigen.
            </p>
          </div>
        </Surface>
      </div>
    </AdminShell>
  )
}
