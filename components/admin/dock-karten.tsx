"use client"

import { useState, useTransition } from "react"
import { ExternalLink, Loader2 } from "lucide-react"

import { dockEntscheiden, type DockKarte } from "@/app/(admin)/admin/assistent/actions"
import { personVon } from "@/lib/zentrale/personen"

/* Dieselben Gründe wie auf der Seite (components/admin/grund-wahl.tsx) – sie werden zu Regeln im Firmengedächtnis. */
const GRUENDE = ["Falscher Zeitpunkt", "Falsche Zielgruppe", "Ton passt nicht", "Inhalt falsch oder unbelegt", "Doppelt"] as const

const KNOPF: Record<string, string> = {
  mail: "Freigeben und senden",
  brief: "Per Post senden (Porto)",
  linkedin: "Freigeben",
  aufgabe: "Erledigt",
  notiz: "Erledigt",
}

/**
 * Zur Entscheidung – im Team-Fenster (24.10.2026). Derselbe Weg wie auf
 * /admin/assistent (Rechts-Check, Versand, Firmengedächtnis); was das Fenster
 * nicht sicher darstellen kann (Pausieren, Löschen, Kapital), öffnet die Seite.
 */
export function DockKarten({ karten, onWeg }: { karten: DockKarte[]; onWeg: (id: string) => void }) {
  if (!karten.length)
    return <p className="p-6 text-sm leading-relaxed text-muted-foreground">Nichts zur Entscheidung. Neue Vorschläge des Teams landen hier.</p>
  return (
    <ul className="flex flex-col gap-2 p-4" aria-label="Zur Entscheidung">
      {karten.map((k) => (
        <Karte key={k.id} k={k} onWeg={onWeg} />
      ))}
    </ul>
  )
}

function Karte({ k, onWeg }: { k: DockKarte; onWeg: (id: string) => void }) {
  const p = personVon(k.agent ?? "koordinator")
  const [auf, setAuf] = useState(false)
  const [basis, setBasis] = useState(false)
  const [absage, setAbsage] = useState(false)
  const [fehler, setFehler] = useState<string | null>(k.fehler)
  const [laeuft, start] = useTransition()

  function entscheide(status: "freigegeben" | "verworfen", grund?: string) {
    const form = new FormData()
    form.set("id", k.id)
    form.append("status", status)
    if (basis) form.set("basis", "1")
    if (grund) form.set("grund", grund)
    setFehler(null)
    start(async () => {
      const r = await dockEntscheiden(form).catch(() => ({ ok: false, fehler: "Verbindung unterbrochen – bitte erneut." }))
      if (r.ok) onWeg(k.id)
      else setFehler(r.fehler)
    })
  }

  return (
    <li className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 text-sm">
      <span className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {p.name.slice(0, 2)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2">
            <span className="font-semibold text-foreground">{p.name}</span>
            <span className="text-xs text-muted-foreground">{p.rolle.de} · KI</span>
          </span>
          <span className="mt-0.5 block font-medium text-foreground [overflow-wrap:anywhere]">{k.titel}</span>
          {k.warum ? <span className="mt-0.5 block text-xs text-muted-foreground [overflow-wrap:anywhere]">{k.warum}</span> : null}
          {k.art === "mail" ? (
            <span className="mt-1 block text-xs text-muted-foreground [overflow-wrap:anywhere]">
              An: {k.empfaenger && !k.empfaenger.endsWith(".invalid") ? k.empfaenger : "Empfänger fehlt"}
              {k.betreff ? ` · ${k.betreff}` : ""}
            </span>
          ) : null}
          {k.art === "brief" && k.anschrift ? <span className="mt-1 block text-xs text-muted-foreground [overflow-wrap:anywhere]">An: {k.anschrift}</span> : null}
        </span>
      </span>

      <button type="button" onClick={() => setAuf((a) => !a)} aria-expanded={auf} className="self-start text-xs font-medium text-primary hover:underline">
        {auf ? "Inhalt ausblenden" : "Inhalt ansehen"}
      </button>
      {auf ? (
        <div className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground [overflow-wrap:anywhere]">{k.inhalt}</div>
      ) : null}

      {k.art === "mail" ? (
        <label className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <input type="checkbox" checked={basis} onChange={(e) => setBasis(e.target.checked)} className="mt-0.5" />
          Ich habe mit dieser Person gesprochen oder sie hat zugestimmt (wird mit Datum gespeichert). Ohne Haken lässt Recht & Compliance nur Mails an Bestandskunden und Anfragende durch.
        </label>
      ) : null}

      {fehler ? (
        <p className="text-xs text-destructive" role="alert">
          {fehler}
        </p>
      ) : null}

      {absage ? (
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Warum?</span>
          {GRUENDE.map((g) => (
            <button key={g} type="button" disabled={laeuft} onClick={() => entscheide("verworfen", g)} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground disabled:opacity-40">
              {g}
            </button>
          ))}
          <button type="button" disabled={laeuft} onClick={() => entscheide("verworfen")} className="rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40">
            ohne Grund
          </button>
        </span>
      ) : (
        <span className="flex flex-wrap items-center gap-2">
          {k.nurSeite ? (
            <a href={`/admin/assistent#frg-${k.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
              Auf der Seite entscheiden <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          ) : (
            <button type="button" disabled={laeuft} onClick={() => entscheide("freigegeben")} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40">
              {laeuft ? <Loader2 className="size-3 animate-spin" aria-hidden="true" /> : null}
              {KNOPF[k.art] ?? "Freigeben"}
            </button>
          )}
          <button type="button" disabled={laeuft} onClick={() => setAbsage(true)} className="rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40">
            Verwerfen
          </button>
          <a href={`/admin/assistent#frg-${k.id}`} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
            Bearbeiten
          </a>
        </span>
      )}
    </li>
  )
}
