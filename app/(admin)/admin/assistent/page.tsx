import type { Metadata } from "next"
import Link from "next/link"
import { after } from "next/server"
import {
  ArrowUpRight,
  CalendarClock,
  CalendarRange,
  Check,
  ClipboardList,
  Coins,
  Handshake,
  Mail,
  Newspaper,
  PenLine,
  Play,
  Radar,
  StickyNote,
  X,
} from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { AssistentChat } from "@/components/admin/assistent-chat"
import { collectAttention } from "@/lib/attention"
import { fragenHeute, ladeFreigaben, ladeVerlauf, letzteLaeufe, TAGESLIMIT, type Freigabe, type FreigabeArt, type Lauf } from "@/lib/assistent/store"
import { AGENTEN, fuehreFaelligeAus, type AgentInfo, type AgentKey } from "@/lib/assistent/truppe"
import { getVertriebStore } from "@/lib/lead-store"

import { agentStarten, freigabeEntscheiden } from "./actions"

export const metadata: Metadata = { title: "Assistent" }
export const dynamic = "force-dynamic"
export const maxDuration = 300

const ART: Record<FreigabeArt, { label: string; Icon: typeof Mail }> = {
  mail: { label: "Mail", Icon: Mail },
  aufgabe: { label: "Aufgabe", Icon: ClipboardList },
  termin: { label: "Termin", Icon: CalendarClock },
  linkedin: { label: "LinkedIn", Icon: Newspaper },
  kapital: { label: "Kapital", Icon: Coins },
  notiz: { label: "Notiz", Icon: StickyNote },
}

const AGENT_ICON: Record<AgentKey, typeof Mail> = {
  lage: Radar,
  vertrieb: Handshake,
  messen: CalendarRange,
  kapital: Coins,
  redaktion: PenLine,
}

const agentName = (key: string | null) => AGENTEN.find((a) => a.key === key)?.name ?? "Assistent"

function seit(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return "gerade eben"
  if (min < 60) return `vor ${min} Min.`
  const h = Math.round(min / 60)
  if (h < 24) return `vor ${h} Std.`
  return `vor ${Math.round(h / 24)} Tagen`
}

function mailto(f: Freigabe): string {
  const p = new URLSearchParams()
  if (f.betreff) p.set("subject", f.betreff)
  p.set("body", f.inhalt)
  return `mailto:${encodeURIComponent(f.empfaenger ?? "")}?${p.toString().replace(/\+/g, "%20")}`
}

function AgentKarte({ a, lauf }: { a: AgentInfo; lauf?: Lauf }) {
  const Icon = AGENT_ICON[a.key]
  const heute = lauf && new Date(lauf.zeit).toDateString() === new Date().toDateString()
  return (
    <li className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="relative flex size-2">
            {heute && !lauf?.fehler ? <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" /> : null}
            <span className={`relative inline-flex size-2 rounded-full ${lauf?.fehler ? "bg-destructive" : heute ? "bg-primary" : "bg-muted-foreground/40"}`} />
          </span>
          {a.takt === "taeglich" ? "täglich" : "wöchentlich"}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-sans font-semibold text-foreground">{a.name}</h3>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{a.aufgabe}</p>
      </div>
      <div className="mt-auto flex flex-col gap-3 rounded-2xl bg-muted p-3">
        <p className="text-sm leading-snug text-foreground">{lauf ? lauf.ergebnis : "Startet beim nächsten Takt"}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{lauf ? seit(lauf.zeit) : "noch nie gelaufen"}</span>
          <form action={agentStarten}>
            <input type="hidden" name="agent" value={a.key} />
            <button className="flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-xs text-primary shadow-sm">
              <Play className="size-3" aria-hidden="true" />
              Jetzt
            </button>
          </form>
        </div>
      </div>
    </li>
  )
}

function FreigabeKarte({ f }: { f: Freigabe }) {
  const { label, Icon } = ART[f.art]
  const offen = f.status === "offen"
  return (
    <li className={offen ? "flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-sm" : "flex flex-col gap-2 rounded-3xl bg-card/60 p-5"}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
          <Icon className="size-3.5" aria-hidden="true" />
          {label}
        </span>
        <span>von {agentName(f.agent)} · {seit(f.zeit)}</span>
        {!offen ? <span>· {f.status === "freigegeben" ? "freigegeben" : "verworfen"}</span> : null}
      </div>
      <h3 className="text-balance font-medium leading-snug text-foreground">{f.titel}</h3>
      {offen ? (
        <>
          {f.empfaenger || f.betreff ? (
            <p className="text-sm text-muted-foreground">
              {f.empfaenger ? `An ${f.empfaenger}` : null}
              {f.empfaenger && f.betreff ? " · " : null}
              {f.betreff}
            </p>
          ) : null}
          <details>
            <summary className="cursor-pointer text-sm text-primary">Inhalt ansehen</summary>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{f.inhalt}</p>
          </details>
          <div className="flex flex-wrap gap-2">
            <form action={freigabeEntscheiden}>
              <input type="hidden" name="id" value={f.id} />
              <input type="hidden" name="status" value="freigegeben" />
              <button className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
                <Check className="size-4" aria-hidden="true" />
                Freigeben
              </button>
            </form>
            <form action={freigabeEntscheiden}>
              <input type="hidden" name="id" value={f.id} />
              <input type="hidden" name="status" value="verworfen" />
              <button className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
                <X className="size-4" aria-hidden="true" />
                Verwerfen
              </button>
            </form>
          </div>
        </>
      ) : f.status === "freigegeben" && f.art === "mail" ? (
        <a href={mailto(f)} className="flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
          <Mail className="size-4" aria-hidden="true" />
          Im Mailprogramm öffnen
        </a>
      ) : f.status === "freigegeben" ? (
        <details>
          <summary className="cursor-pointer text-sm text-primary">Text kopieren</summary>
          <p className="mt-2 select-all whitespace-pre-wrap text-sm leading-relaxed text-foreground">{f.inhalt}</p>
        </details>
      ) : null}
    </li>
  )
}

export default async function AssistentPage() {
  const [verlauf, freigaben, heute, laeufe, board] = await Promise.all([
    ladeVerlauf(40),
    ladeFreigaben(),
    fragenHeute(),
    letzteLaeufe(),
    collectAttention(getVertriebStore()).catch(() => null),
  ])
  after(() => fuehreFaelligeAus().catch(() => undefined))

  const offen = freigaben.filter((f) => f.status === "offen")
  const erledigt = freigaben.filter((f) => f.status !== "offen")
  const system = board?.items ?? []

  return (
    <AdminShell title="Assistent" meta={<span className="block">Deine Truppe arbeitet im Hintergrund – du entscheidest</span>}>
      <div className="flex flex-col gap-10">
        <section aria-labelledby="truppe-titel" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="truppe-titel" className="font-sans text-xl font-semibold text-foreground">
              Deine Truppe
            </h2>
            <p className="text-sm text-muted-foreground">Arbeitet jeden Morgen von selbst · KI nur, wo es sich lohnt</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {AGENTEN.map((a) => (
              <AgentKarte key={a.key} a={a} lauf={laeufe[a.key]} />
            ))}
          </ul>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
          <section aria-labelledby="eingang-titel" className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 id="eingang-titel" className="font-sans text-xl font-semibold text-foreground">
                Zur Entscheidung
              </h2>
              <span className="text-sm text-primary">{offen.length + system.length} offen</span>
            </div>

            {offen.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {offen.map((f) => (
                  <FreigabeKarte key={f.id} f={f} />
                ))}
              </ul>
            ) : (
              <p className="rounded-3xl bg-card p-5 text-sm leading-relaxed text-muted-foreground">
                Die Agenten haben gerade nichts vorbereitet. Ihr nächster Takt läuft automatisch.
              </p>
            )}

            {system.length > 0 ? (
              <div className="flex flex-col gap-3 pt-2">
                <h3 className="text-sm font-medium text-muted-foreground">Aus dem System · {system.length}</h3>
                <ul className="flex flex-col gap-2">
                  {system.slice(0, 12).map((i) => (
                    <li key={i.id}>
                      <Link
                        href={i.href}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-card px-5 py-4 transition-colors hover:bg-primary/5"
                      >
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate font-medium text-foreground">{i.title}</span>
                          {i.detail ? <span className="truncate text-sm text-muted-foreground">{i.detail}</span> : null}
                        </span>
                        <ArrowUpRight className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
                {system.length > 12 ? (
                  <Link href="/admin" className="text-sm text-primary">
                    Alle {system.length} in der Übersicht
                  </Link>
                ) : null}
              </div>
            ) : null}

            {erledigt.length > 0 ? (
              <details className="pt-2">
                <summary className="cursor-pointer text-sm text-muted-foreground">Erledigt (letzte 3 Tage) · {erledigt.length}</summary>
                <ul className="mt-3 flex flex-col gap-3">
                  {erledigt.map((f) => (
                    <FreigabeKarte key={f.id} f={f} />
                  ))}
                </ul>
              </details>
            ) : null}
          </section>

          <section aria-labelledby="chat-titel" className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            <h2 id="chat-titel" className="font-sans text-xl font-semibold text-foreground">
              Auftrag geben
            </h2>
            <AssistentChat start={verlauf} rest={TAGESLIMIT - heute} />
          </section>
        </div>
      </div>
    </AdminShell>
  )
}
