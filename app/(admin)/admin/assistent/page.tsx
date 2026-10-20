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
  Crosshair,
  Handshake,

  Mail,
  Newspaper,
  PenLine,
  Play,
  Radar,
  StickyNote,
  Trash2,
  Users,
  X,
} from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { AssistentChat } from "@/components/admin/assistent-chat"
import { collectAttention } from "@/lib/attention"
import {
  fragenHeute,
  ladeBeitraege,
  ladeFreigabe,
  ladeFreigaben,
  ladeLinkedin,
  ladeRaete,
  ladeVerlauf,
  letzteLaeufe,
  TAGESLIMIT,
  type Freigabe,
  type FreigabeArt,
  type Lauf,
  type Rat,
} from "@/lib/assistent/store"
import { firmenRahmen, type Rahmen } from "@/lib/assistent/rahmen"
import { erkenneLoeschwunsch } from "@/lib/assistent/loeschen"
import { AGENTEN, fuehreFaelligeAus, type AgentInfo, type AgentKey } from "@/lib/assistent/truppe"
import { getVertriebStore } from "@/lib/lead-store"

import { agentStarten, antwortErhalten, freigabeEntscheiden, ratAntworten } from "./actions"
import { ergaenzeFehlendeAdressen, ladeAnsprache, type Ansprache } from "@/lib/assistent/versand"

const euro = (n: number) => `${Math.round(n).toLocaleString("de-DE")} €`

function Sitzung({ rat, rahmen }: { rat: Rat | undefined; rahmen: Rahmen }) {
  return (
    <section aria-labelledby="rat-titel" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="rat-titel" className="font-sans text-xl font-semibold text-foreground">
          Geschäftsleitung
        </h2>
        <p className="text-sm text-muted-foreground">
          Budget diese Woche: <span className="font-medium text-primary">{euro(rahmen.spielraumEur)}</span>
          {rahmen.reichweiteMonate !== null ? ` · Reichweite ${rahmen.reichweiteMonate.toFixed(1)} Monate` : ""}
        </p>
      </div>

      {!rat ? (
        <div className="flex flex-col gap-3 rounded-3xl bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-pretty leading-relaxed text-muted-foreground">
            Die erste Wochensitzung hat noch nicht getagt. CEO, CFO, Vertrieb und Marketing prüfen deine Lage gegen dein Budget und
            beschließen höchstens drei Schritte.
          </p>
          <form action={agentStarten}>
            <input type="hidden" name="agent" value="rat" />
            <button className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
              <Play className="size-4" aria-hidden="true" />
              Sitzung jetzt einberufen
            </button>
          </form>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <article className="flex flex-col gap-5 rounded-3xl bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Sitzung KW {rat.woche.split("-")[1]} · {seit(rat.zeit)}
              </span>
              <p className="text-pretty leading-relaxed text-foreground">{rat.protokoll.lage}</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {rat.protokoll.stimmen.map((s) => (
                <li key={s.rolle} className="flex flex-col gap-1 rounded-2xl bg-muted/60 p-4">
                  <span className="text-xs font-semibold text-primary">{s.rolle}</span>
                  <p className="text-sm leading-relaxed text-foreground">{s.sagt}</p>
                </li>
              ))}
            </ul>
            {rat.protokoll.verworfen.length ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Bewusst verworfen</span>
                <ul className="flex flex-col gap-1.5">
                  {rat.protokoll.verworfen.map((v) => (
                    <li key={v} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                      <X className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>

          <div className="flex flex-col gap-4">
            <article className="flex flex-col gap-3 rounded-3xl bg-card p-6 shadow-sm">
              <h3 className="font-sans text-base font-semibold text-foreground">Beschlüsse</h3>
              <ol className="flex flex-col gap-3">
                {rat.protokoll.beschluesse.map((b, i) => (
                  <li key={b.was} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-relaxed text-foreground">{b.was}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">{b.warum}</p>
                      <span className="text-xs text-muted-foreground">
                        {b.wer === "emin" ? "Du" : "Truppe bereitet vor"} · {b.kostenEur ? euro(b.kostenEur) : "kostenlos"}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </article>

            <article className="flex flex-col gap-3 rounded-3xl bg-primary/5 p-6">
              <h3 className="font-sans text-base font-semibold text-foreground">Rückfrage an dich</h3>
              <p className="text-pretty text-sm leading-relaxed text-foreground">{rat.protokoll.frage}</p>
              {rat.antwort ? (
                <p className="rounded-2xl bg-card p-4 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">Deine Antwort: </span>
                  {rat.antwort}
                </p>
              ) : (
                <form action={ratAntworten} className="flex flex-col gap-2">
                  <input type="hidden" name="id" value={rat.id} />
                  <label htmlFor="rat-antwort" className="sr-only">
                    Antwort an die Geschäftsleitung
                  </label>
                  <textarea
                    id="rat-antwort"
                    name="antwort"
                    rows={3}
                    required
                    maxLength={2000}
                    placeholder="Deine Antwort fließt in die nächste Sitzung ein …"
                    className="resize-none rounded-2xl bg-card p-4 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <button className="self-end rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                    Antworten
                  </button>
                </form>
              )}
            </article>
          </div>
        </div>
      )}
    </section>
  )
}

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
  loeschen: { label: "Löschen", Icon: Trash2 },
}

const AGENT_ICON: Record<AgentKey, typeof Mail> = {
  rat: Users,
  jaeger: Crosshair,
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

function ArtikelKarte({ f, linkedin }: { f: Freigabe; linkedin: LinkedinZiele }) {
  const offen = f.status === "offen"
  return (
    <li className="flex flex-col overflow-hidden rounded-3xl bg-card shadow-sm">
      {f.bildPfad ? (
        <img
          src={`/api/assistent/bild/${encodeURIComponent(f.id)}`}
          alt={f.extra.alt ?? ""}
          className="aspect-[3/2] w-full object-cover"
          loading="lazy"
        />
      ) : null}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
            <Newspaper className="size-3.5" aria-hidden="true" />
            LinkedIn-Beitrag
          </span>
          <span>von {agentName(f.agent)} · {seit(f.zeit)}</span>
          {!offen ? <span>· {f.status === "freigegeben" ? (f.extra.postUrn ? "veröffentlicht" : "freigegeben") : "verworfen"}</span> : null}
        </div>
        {f.extra.warum ? (
          <p className="rounded-2xl bg-secondary px-4 py-3 text-sm leading-relaxed text-secondary-foreground">
            <span className="font-medium text-foreground">Warum jetzt: </span>
            {f.extra.warum}
          </p>
        ) : null}
        {offen ? (
          <>
            <form action={freigabeEntscheiden} className="flex flex-col gap-3">
              <input type="hidden" name="id" value={f.id} />
              <input type="hidden" name="status" value="freigegeben" />
              <label className="sr-only" htmlFor={`titel-${f.id}`}>Titel</label>
              <input
                id={`titel-${f.id}`}
                name="titel"
                defaultValue={f.titel}
                className="rounded-2xl bg-muted px-4 py-2.5 font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <label className="sr-only" htmlFor={`text-${f.id}`}>Beitragstext</label>
              <textarea
                id={`text-${f.id}`}
                name="inhalt"
                defaultValue={f.inhalt}
                rows={10}
                className="resize-y rounded-2xl bg-muted px-4 py-3 text-sm leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              {f.extra.fehler ? <p className="text-sm text-destructive">LinkedIn: {f.extra.fehler}</p> : null}
              {linkedin.firma || linkedin.inhaber ? (
                <fieldset className="flex flex-wrap gap-2">
                  <legend className="sr-only">Wo posten?</legend>
                  {(
                    [
                      { kanal: "firma", label: "Firmenseite", name: linkedin.firma },
                      { kanal: "inhaber", label: "Mein Profil", name: linkedin.inhaber },
                    ] as const
                  )
                    .filter((z) => z.name)
                    .map((z, i) => (
                      <label
                        key={z.kanal}
                        className="flex cursor-pointer items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm text-foreground has-[:checked]:bg-primary has-[:checked]:text-primary-foreground"
                      >
                        <input type="radio" name="ziel" value={z.kanal} defaultChecked={i === 0} className="sr-only" />
                        {z.label}
                      </label>
                    ))}
                </fieldset>
              ) : null}
              <button className="flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
                <Check className="size-4" aria-hidden="true" />
                {linkedin.firma || linkedin.inhaber ? "Freigeben & auf LinkedIn posten" : "Freigeben"}
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
            {!linkedin.firma && !linkedin.inhaber ? (
              <p className="text-xs text-muted-foreground">
                LinkedIn noch nicht verbunden – nach dem Verbinden postet „Freigeben“ direkt mit Bild.
              </p>
            ) : null}
          </>
        ) : (
          <>
            <h3 className="text-balance font-medium leading-snug text-foreground">{f.titel}</h3>
            {f.status === "freigegeben" && !f.extra.postUrn ? (
              <details>
                <summary className="cursor-pointer text-sm text-primary">Text kopieren</summary>
                <p className="mt-2 select-all whitespace-pre-wrap text-sm leading-relaxed text-foreground">{f.inhalt}</p>
              </details>
            ) : null}
          </>
        )}
      </div>
    </li>
  )
}

type LinkedinZiele = { inhaber: string | null; firma: string | null }

function LinkedinStatus({ ziele, meldung }: { ziele: LinkedinZiele; meldung?: string }) {
  const text: Record<string, string> = {
    verbunden: "Profil verbunden.",
    "firma-verbunden": "Firmenseite verbunden.",
    abgebrochen: "Verbindung abgebrochen.",
    "firma-nicht-freigeschaltet":
      "Firmenseite: LinkedIn hat die „Community Management API“ für diese App noch nicht freigeschaltet. In developer.linkedin.com → deine Firmen-App → Reiter „Products“ muss dort „Added“ stehen (nicht „Requested/Pending“). Danach einfach erneut verbinden.",
    "inhaber-nicht-freigeschaltet":
      "Profil: In der Profil-App fehlen die Produkte „Sign In with LinkedIn using OpenID Connect“ und „Share on LinkedIn“.",
    "firma-redirect":
      "Firmenseite: In der Firmen-App unter „Auth“ fehlt die Redirect-URL https://creadig.de/api/linkedin/callback.",
    "inhaber-redirect":
      "Profil: In der Profil-App unter „Auth“ fehlt die Redirect-URL https://creadig.de/api/linkedin/callback.",
    fehler:
      "LinkedIn hat abgelehnt. Prüfe in der jeweiligen LinkedIn-App die Redirect-URL und ob das Produkt freigeschaltet ist (Firmenseite: „Community Management API“ muss genehmigt sein).",
  }
  const zeilen = [
    { kanal: "firma", label: "Firmenseite", name: ziele.firma },
    { kanal: "inhaber", label: "Profil", name: ziele.inhaber },
  ] as const
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-card p-4 shadow-sm">
      {zeilen.map((z) => (
        <div key={z.kanal} className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-foreground">
            <Newspaper className="size-4 text-primary" aria-hidden="true" />
            <span className="font-medium">{z.label}:</span>
            {z.name ? z.name : <span className="text-muted-foreground">nicht verbunden</span>}
          </p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth-Weiterleitung, darf nicht vorab geladen werden */}
          <a
            href={`/api/linkedin/verbinden?kanal=${z.kanal}`}
            className="rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground"
          >
            {z.name ? "Neu verbinden" : "Verbinden"}
          </a>
        </div>
      ))}
      {meldung && text[meldung] ? <p className="text-sm text-muted-foreground">{text[meldung]}</p> : null}
    </div>
  )
}

const feld = "w-full rounded-2xl bg-muted px-4 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"

function MailKarte({ f }: { f: Freigabe }) {
  const offen = f.status === "offen"
  const notiz = f.inhalt.split(/\n-{3,}\n/)[1]?.trim()
  const gesendet = f.extra.gesendetAt
  return (
    <li className={offen ? "flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-sm" : "flex flex-col gap-2 rounded-3xl bg-card/60 p-5"}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
          <Mail className="size-3.5" aria-hidden="true" />
          {f.extra.stufe ? `${f.extra.stufe}. Nachfassen` : "Mail"}
        </span>
        <span>von {agentName(f.agent)} · {seit(f.zeit)}</span>
        {f.status === "verworfen" ? <span>· verworfen</span> : null}
      </div>
      <h3 className="text-balance font-medium leading-snug text-foreground">{f.titel}</h3>
      {f.extra.warum && offen ? <p className="text-sm text-muted-foreground">{f.extra.warum}</p> : null}
      {offen ? (
        <form action={freigabeEntscheiden} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={f.id} />
          <input type="hidden" name="status" value="freigegeben" />
          <input type="hidden" name="titel" value={f.titel} />
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            An
            <input name="empfaenger" type="email" required defaultValue={f.empfaenger ?? ""} placeholder="name@firma.de" className={feld} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Betreff
            <input name="betreff" defaultValue={f.betreff ?? ""} className={feld} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Text
            <textarea
              name="inhalt"
              rows={8}
              defaultValue={f.inhalt.split(/\n-{3,}\n/)[0].trim()}
              className={`${feld} leading-relaxed`}
            />
          </label>
          {notiz ? <p className="whitespace-pre-wrap rounded-2xl bg-primary/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground">{notiz}</p> : null}
          {f.extra.fehler ? (
            <p role="alert" className="text-sm text-destructive">
              {f.extra.fehler}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
              <Check className="size-4" aria-hidden="true" />
              Freigeben und senden
            </button>
            <Link
              href={`/admin/marketing/mail/einzel?freigabe=${encodeURIComponent(f.id)}`}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary hover:bg-primary/15"
            >
              Im Mail-Studio gestalten
            </Link>
            <button
              formAction={freigabeEntscheiden}
              name="status"
              value="verworfen"
              formNoValidate
              className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground"
            >
              <X className="size-4" aria-hidden="true" />
              Verwerfen
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Antworten landen in deinem Postfach. Ohne Antwort schlägt der Vertrieb nach 5 und 9 Tagen ein Nachfassen vor.</p>
        </form>
      ) : gesendet ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            Gesendet an {f.empfaenger} · {seit(gesendet)}
          </span>
          {f.extra.antwortAt ? (
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary">
              <Check className="size-3.5" aria-hidden="true" />
              Antwort erhalten
            </span>
          ) : (
            <form action={antwortErhalten}>
              <input type="hidden" name="id" value={f.id} />
              <button className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">Antwort erhalten</button>
            </form>
          )}
        </div>
      ) : f.status === "freigegeben" ? (
        <a href={mailto(f)} className="flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
          <Mail className="size-4" aria-hidden="true" />
          Im Mailprogramm öffnen
        </a>
      ) : null}
    </li>
  )
}

function AnspracheLeiste({ a }: { a: Ansprache }) {
  const werte = [
    { label: "Erstmails gesendet (60 Tage)", wert: String(a.gesendet) },
    { label: "Antworten", wert: String(a.beantwortet) },
    { label: "Antwortquote", wert: a.quote === null ? "–" : `${a.quote} %` },
    { label: "Nachfassen offen", wert: String(a.nachfassOffen) },
  ]
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {werte.map((w) => (
        <div key={w.label} className="flex flex-col gap-1 rounded-3xl bg-card p-4 shadow-sm">
          <dt className="text-xs text-muted-foreground">{w.label}</dt>
          <dd className="font-display text-2xl font-semibold text-primary">{w.wert}</dd>
        </div>
      ))}
    </dl>
  )
}

function LoeschKarte({ f }: { f: Freigabe }) {
  const offen = f.status === "offen"
  return (
    <li className={offen ? "flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-sm" : "flex flex-col gap-2 rounded-3xl bg-card/60 p-5"}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-destructive">
          <Trash2 className="size-3.5" aria-hidden="true" />
          Löschen
        </span>
        <span>{f.extra.warum ?? `von ${agentName(f.agent)}`} · {seit(f.zeit)}</span>
        {!offen ? <span>· {f.status === "freigegeben" ? "gelöscht" : "behalten"}</span> : null}
      </div>
      <h3 className="text-balance font-medium leading-snug text-foreground">{f.titel}</h3>
      {offen ? (
        <>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{f.inhalt}</p>
          {f.extra.fehler ? <p className="text-sm text-destructive">{f.extra.fehler}</p> : null}
          <details className="group">
            <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-full bg-destructive/10 px-4 py-2 text-sm text-destructive group-open:hidden">
              <Trash2 className="size-4" aria-hidden="true" />
              Löschen …
            </summary>
            <div className="flex flex-col gap-3 rounded-2xl bg-destructive/10 p-4">
              <p className="text-sm font-medium text-foreground">Wirklich endgültig löschen?</p>
              <div className="flex flex-wrap gap-2">
                <form action={freigabeEntscheiden}>
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="status" value="freigegeben" />
                  <input type="hidden" name="bestaetigt" value="ja" />
                  <button className="flex items-center gap-1.5 rounded-full bg-destructive px-4 py-2 text-sm text-destructive-foreground">
                    <Check className="size-4" aria-hidden="true" />
                    Ja, endgültig löschen
                  </button>
                </form>
                <form action={freigabeEntscheiden}>
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="status" value="verworfen" />
                  <button className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
                    <X className="size-4" aria-hidden="true" />
                    Nein, behalten
                  </button>
                </form>
              </div>
            </div>
          </details>
        </>
      ) : null}
    </li>
  )
}

function FreigabeKarte({ f, linkedin }: { f: Freigabe; linkedin: LinkedinZiele }) {
  if (f.art === "linkedin") return <ArtikelKarte f={f} linkedin={linkedin} />
  if (f.art === "mail") return <MailKarte f={f} />
  if (f.art === "loeschen") return <LoeschKarte f={f} />
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
      ) : f.status === "freigegeben" ? (
        <details>
          <summary className="cursor-pointer text-sm text-primary">Text kopieren</summary>
          <p className="mt-2 select-all whitespace-pre-wrap text-sm leading-relaxed text-foreground">{f.inhalt}</p>
        </details>
      ) : null}
    </li>
  )
}

export default async function AssistentPage({ searchParams }: { searchParams: Promise<{ linkedin?: string }> }) {
  const { linkedin: liMeldung } = await searchParams
  const [liInhaber, liFirma] = await Promise.all([
    ladeLinkedin("inhaber").catch(() => null),
    ladeLinkedin("firma").catch(() => null),
  ])
  const liZiele: LinkedinZiele = {
    inhaber: liInhaber ? liInhaber.name ?? "dein Profil" : null,
    firma: liFirma ? liFirma.name ?? "Firmenseite" : null,
  }
  const [verlauf, freigabenAlle, heute, laeufe, board, raete, rahmen, beitraege, ansprache] = await Promise.all([
    ladeVerlauf(40),
    ladeFreigaben(),
    fragenHeute(),
    letzteLaeufe(),
    collectAttention(getVertriebStore()).catch(() => null),
    ladeRaete(1).catch(() => []),
    firmenRahmen(),
    ladeBeitraege(6).catch(() => []),
    ladeAnsprache().catch((): Ansprache => ({ gesendet: 0, beantwortet: 0, quote: null, nachfassOffen: 0 })),
  ])
  after(() => fuehreFaelligeAus().catch(() => undefined))
  after(() => ergaenzeFehlendeAdressen().catch(() => undefined))

  const ratMitAntwort = raete.find((r) => r.antwort)
  const neuerLoeschauftrag = ratMitAntwort?.antwort
    ? await erkenneLoeschwunsch(ratMitAntwort.antwort, ratMitAntwort.id).catch(() => null)
    : null
  if (neuerLoeschauftrag) {
    const f = await ladeFreigabe(neuerLoeschauftrag).catch(() => null)
    if (f) freigabenAlle.unshift(f)
  }

  const freigaben = freigabenAlle.filter((f) => f.art !== "linkedin")
  const offen = freigaben.filter((f) => f.status === "offen")
  const erledigt = freigaben.filter((f) => f.status !== "offen")
  const system = board?.items ?? []

  return (
    <AdminShell title="Assistent" meta={<span className="block">Deine Truppe arbeitet im Hintergrund – du entscheidest</span>}>
      <div className="flex flex-col gap-10">
        <Sitzung rat={raete[0]} rahmen={rahmen} />

        <section id="redaktion" aria-labelledby="redaktion-titel" className="flex scroll-mt-6 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 id="redaktion-titel" className="font-sans text-xl font-semibold text-foreground">
                LinkedIn · Redaktion
              </h2>
              <p className="text-sm text-muted-foreground">
                Thema aus der Geschäftsleitung, Text und Bild von der Redaktion – du gibst frei, dann wird gepostet.
              </p>
            </div>
            <form action={agentStarten}>
              <input type="hidden" name="agent" value="redaktion" />
              <button className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                <PenLine className="size-4" aria-hidden="true" />
                Neuen Beitrag erstellen
              </button>
            </form>
          </div>
          <LinkedinStatus ziele={liZiele} meldung={liMeldung} />
          {beitraege.length > 0 ? (
            <ul className="grid gap-4 lg:grid-cols-2">
              {beitraege.map((f) => (
                <FreigabeKarte key={f.id} f={f} linkedin={liZiele} />
              ))}
            </ul>
          ) : (
            <p className="rounded-3xl bg-card p-5 text-sm leading-relaxed text-muted-foreground">
              Noch kein Beitrag. „Neuen Beitrag erstellen“ startet die Redaktion sofort (Text + Bild, ca. 30–60 Sekunden).
            </p>
          )}
        </section>

        <section aria-labelledby="truppe-titel" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="truppe-titel" className="font-sans text-xl font-semibold text-foreground">
              Deine Truppe
            </h2>
            <p className="text-sm text-muted-foreground">Arbeitet jeden Morgen von selbst · KI nur, wo es sich lohnt</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <AnspracheLeiste a={ansprache} />

            {offen.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {offen.map((f) => (
                    <FreigabeKarte key={f.id} f={f} linkedin={liZiele} />
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
                  <FreigabeKarte key={f.id} f={f} linkedin={liZiele} />
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
