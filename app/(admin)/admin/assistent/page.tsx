import type { Metadata } from "next"
import { CalendarClock, Check, ClipboardList, Coins, Mail, Newspaper as Linkedin, StickyNote, X } from "lucide-react"

import { AssistentChat } from "@/components/admin/assistent-chat"
import { fragenHeute, ladeFreigaben, ladeVerlauf, TAGESLIMIT, type Freigabe, type FreigabeArt } from "@/lib/assistent/store"

import { freigabeEntscheiden } from "./actions"

export const metadata: Metadata = { title: "Assistent" }
export const dynamic = "force-dynamic"

const ART: Record<FreigabeArt, { label: string; Icon: typeof Mail }> = {
  mail: { label: "Mail", Icon: Mail },
  aufgabe: { label: "Aufgabe", Icon: ClipboardList },
  termin: { label: "Termin", Icon: CalendarClock },
  linkedin: { label: "LinkedIn", Icon: Linkedin },
  kapital: { label: "Kapital", Icon: Coins },
  notiz: { label: "Notiz", Icon: StickyNote },
}

function mailto(f: Freigabe): string {
  const p = new URLSearchParams()
  if (f.betreff) p.set("subject", f.betreff)
  p.set("body", f.inhalt)
  return `mailto:${encodeURIComponent(f.empfaenger ?? "")}?${p.toString().replace(/\+/g, "%20")}`
}

function FreigabeKarte({ f }: { f: Freigabe }) {
  const { label, Icon } = ART[f.art]
  const offen = f.status === "offen"
  return (
    <li className={offen ? "flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-sm" : "flex flex-col gap-2 rounded-3xl bg-card/60 p-5"}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
          <Icon className="size-3.5" aria-hidden="true" />
          {label}
        </span>
        {!offen ? <span>{f.status === "freigegeben" ? "freigegeben" : "verworfen"}</span> : null}
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
          <details className="group">
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
  const [verlauf, freigaben, heute] = await Promise.all([ladeVerlauf(40), ladeFreigaben(), fragenHeute()])
  const offen = freigaben.filter((f) => f.status === "offen")

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-balance font-sans text-2xl font-semibold text-foreground md:text-3xl">Assistent</h1>
        <p className="text-pretty leading-relaxed text-muted-foreground">
          Sieht Abschlüsse, Tageslage und Messen. Bereitet Mails, LinkedIn-Artikel, Aufgaben und Kapitalchancen vor – du gibst frei.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <AssistentChat start={verlauf} rest={TAGESLIMIT - heute} />

        <aside className="flex flex-col gap-3" aria-labelledby="freigabe-titel">
          <div className="flex items-baseline justify-between px-1">
            <h2 id="freigabe-titel" className="font-medium text-foreground">
              Freigabe-Eingang
            </h2>
            <span className="text-sm text-primary">{offen.length} offen</span>
          </div>
          {freigaben.length === 0 ? (
            <p className="rounded-3xl bg-card p-5 text-sm leading-relaxed text-muted-foreground">
              Noch nichts zu entscheiden. Sobald der Assistent etwas vorbereitet, liegt es hier.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {freigaben.map((f) => (
                <FreigabeKarte key={f.id} f={f} />
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}
