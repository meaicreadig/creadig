import Link from "next/link"
import { Sparkles } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { MesseStatusWahl, RadarKnopf } from "@/components/admin/messe-status"
import { Pill, Surface } from "@/components/admin/primitives"
import {
  MESSEN,
  MESSE_KATEGORIEN,
  MESSE_REGIONEN,
  messeKey,
  naechsteTermine,
  terminLabel,
  type Empfehlung,
  type Messe,
  type MesseKategorie,
  type MesseRegion,
  type MesseTermin,
} from "@/lib/messen"
import { ladeStatus, ladeVorschlaege, type MesseStatus } from "@/lib/messen-radar"

export const metadata = { title: "Messen" }
export const dynamic = "force-dynamic"

const EMPFEHLUNG: Record<Empfehlung, { text: string; severity: "attention" | "neutral" | "critical" }> = {
  ausstellen: { text: "Ausstellen", severity: "critical" },
  besuchen: { text: "Besuchen", severity: "attention" },
  beobachten: { text: "Beobachten", severity: "neutral" },
}

type Zeile = MesseTermin & { neu?: boolean }

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

function MesseZeile({ m, status }: { m: Zeile; status: MesseStatus | null }) {
  const key = messeKey(m.name)
  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-muted/40 p-4 lg:flex-row lg:items-start lg:gap-6">
      <div className="flex shrink-0 flex-col lg:w-40">
        <span className="text-sm font-medium tabular-nums">{terminLabel(m)}</span>
        <span className="text-xs text-muted-foreground">
          {m.bestaetigt ? "Termin bestätigt" : m.rhythmus === 1 ? "jährlich" : `alle ${m.rhythmus} Jahre`}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <a href={m.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4">
            {m.name}
          </a>
          {m.neu && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <Sparkles className="size-3" aria-hidden /> neu vom Radar
            </span>
          )}
          <Pill severity={EMPFEHLUNG[m.empfehlung].severity}>{EMPFEHLUNG[m.empfehlung].text}</Pill>
        </div>
        <span className="text-sm text-muted-foreground">
          {m.ort} · {m.land} · {MESSE_KATEGORIEN[m.kategorie]}
        </span>
        <p className="text-sm leading-relaxed text-pretty">{m.nutzen}</p>
      </div>
      <div className="shrink-0">
        <MesseStatusWahl messeKey={key} status={status} name={m.name} />
      </div>
    </li>
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

  const [status, vorschlaege] = await Promise.all([ladeStatus(), ladeVorschlaege()])
  const bekannt = new Set(MESSEN.map((m) => messeKey(m.name)))
  const quelle: (Messe & { neu?: boolean })[] = [...MESSEN, ...vorschlaege.filter((v) => !bekannt.has(messeKey(v.name)))]
  const alle: Zeile[] = naechsteTermine(new Date(), quelle)
  const s = (m: Zeile) => status[messeKey(m.name)] ?? null

  const meine = alle.filter((m) => s(m) === "teilnehmen")
  const offen = alle.filter(
    (m) => s(m) !== "nein" && s(m) !== "teilnehmen" && (!kategorie || m.kategorie === kategorie) && (!region || m.region === region),
  )
  const abgelehnt = alle.filter((m) => s(m) === "nein")

  const link = (k: MesseKategorie | null, r: MesseRegion | null) => {
    const p = new URLSearchParams()
    if (k) p.set("kategorie", k)
    if (r) p.set("region", r)
    const q = p.toString()
    return q ? `/admin/messen?${q}` : "/admin/messen"
  }

  return (
    <AdminShell
      title="Messen"
      lead="Messe-Radar: jeden Montag neu recherchiert. Deine Auswahl steuert, was als Nächstes vorgeschlagen wird — „Ich nehme teil“ landet im Kalender."
    >
      <div className="flex flex-col gap-6">
        <Surface>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="font-sans text-lg font-semibold">Meine Messen</h2>
                <p className="text-sm text-muted-foreground">
                  Erscheinen automatisch im Termin-Kalender (Apple-Abo unter Termine).
                </p>
              </div>
              <RadarKnopf />
            </div>
            {meine.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Teilnahme gewählt.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {meine.map((m) => (
                  <MesseZeile key={m.name} m={m} status="teilnehmen" />
                ))}
              </ul>
            )}
          </div>
        </Surface>

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

            {offen.length === 0 ? (
              <p className="text-sm text-muted-foreground">Für diese Auswahl ist noch keine Messe erfasst.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {offen.map((m) => (
                  <MesseZeile key={m.name} m={m} status={s(m)} />
                ))}
              </ul>
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">
              „übliche Zeit“ = typische Messewoche des Veranstalters. Vor Buchung von Stand, Hotel oder Reise das Datum auf der
              Veranstalterseite bestätigen.
            </p>
          </div>
        </Surface>

        {abgelehnt.length > 0 && (
          <details className="rounded-3xl bg-card p-5">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
              Kein Interesse ({abgelehnt.length}) — das Radar schlägt Ähnliches seltener vor
            </summary>
            <ul className="mt-4 flex flex-col gap-3">
              {abgelehnt.map((m) => (
                <MesseZeile key={m.name} m={m} status="nein" />
              ))}
            </ul>
          </details>
        )}
      </div>
    </AdminShell>
  )
}
