import { ArrowRight } from "lucide-react"

import { AktionKnopf } from "@/components/admin/aktion-knopf"
import { Klappe } from "@/components/admin/klappe"
import { Surface } from "@/components/admin/primitives"
import { URTEIL_TEXT, type AgentKarne, type Karne, type Kette, type Urteil } from "@/lib/ergebnis/karne"
import type { Pause } from "@/lib/ergebnis/steuerung"

/**
 * Sonuç karnesi (Katman 3): oben die Kette der Firma, darunter Abteilungen und
 * jeder Agent mit Urteil. Die alte Leistungs-Ansicht (Stunden, Stabilität)
 * bleibt darunter – sie sagt, ob das System läuft, nicht ob es etwas bringt.
 */

const T = {
  de: {
    titel: "Ergebnis-Karne",
    unter: (t: number) => `Letzte ${t} Tage · gemessen am Ergebnis, nicht an Läufen`,
    stufen: ["Kontakte", "Antworten", "Anfragen", "Termine", "Angebote", "Gewonnen"],
    bezahlt: "bezahlt",
    abteilungen: "Abteilungen",
    abtHinweis: "Beitrag: Berührten zwei Abteilungen dieselbe Firma, zählt das Ergebnis für beide.",
    agenten: "KI-Mitarbeiter nach Urteil",
    pausiert: "Pausiert",
    aktivieren: "Wieder aktivieren",
    seit: "seit",
    urteilAb: "Urteil ab",
    leer: "Noch keine Ergebnisse – sobald Antworten, Anfragen oder Termine kommen, stehen sie hier.",
  },
  tr: {
    titel: "Sonuç karnesi",
    unter: (t: number) => `Son ${t} gün · çalışmayla değil, sonuçla ölçülür`,
    stufen: ["Temas", "Cevap", "Talep", "Görüşme", "Teklif", "Kazanıldı"],
    bezahlt: "tahsil edildi",
    abteilungen: "Departmanlar",
    abtHinweis: "Katkı: Aynı firmaya iki departman dokunduysa sonuç ikisine de yazılır.",
    agenten: "Ajanlar – karara göre",
    pausiert: "Durdurulanlar",
    aktivieren: "Tekrar başlat",
    seit: "şu tarihten beri",
    urteilAb: "Karar tarihi",
    leer: "Henüz sonuç yok – cevap, talep veya görüşme geldiğinde burada görünür.",
  },
} as const

const REIHENFOLGE: Urteil[] = ["vorschlag", "schaerfen", "wartet", "kanal", "wirkt", "anlauf", "pausiert", "schutz"]
const FARBE: Record<Urteil, string> = {
  wirkt: "bg-emerald-500",
  anlauf: "bg-muted-foreground/40",
  wartet: "bg-amber-500",
  schaerfen: "bg-amber-500",
  vorschlag: "bg-red-500",
  pausiert: "bg-muted-foreground",
  schutz: "bg-primary/50",
  kanal: "bg-amber-500",
}

const werte = (k: Kette) => [k.kontakte, k.antworten, k.leads, k.termine, k.angebote, k.gewonnen]

export function ErgebnisKarne({
  karne,
  pausen,
  sprache,
  aktivieren,
}: {
  karne: Karne
  pausen: Pause[]
  sprache: "de" | "tr"
  aktivieren: (form: FormData) => Promise<void>
}) {
  const t = T[sprache]
  const intl = sprache === "tr" ? "tr-TR" : "de-DE"
  const eur = (n: number) => `${n.toLocaleString(intl)} €`
  const f = karne.firma
  const name = (key: string) => karne.agenten.find((a) => a.agent === key)?.name ?? key
  const datum = (iso: string) => new Date(iso).toLocaleDateString(intl, { day: "2-digit", month: "2-digit", timeZone: "Europe/Berlin" })
  const gruppen = REIHENFOLGE.map((u) => ({ u, liste: karne.agenten.filter((a) => a.urteil === u) })).filter((g) => g.liste.length)

  return (
    <section className="flex flex-col gap-4" aria-labelledby="ergebnis-karne">
      <div className="flex flex-col gap-1">
        <h2 id="ergebnis-karne" className="font-sans text-lg font-semibold text-foreground">
          {t.titel}
        </h2>
        <p className="text-sm text-muted-foreground">{t.unter(f.tage)}</p>
      </div>

      <Surface>
        <ol className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {werte(f).map((w, i) => (
            <li key={t.stufen[i]} className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {t.stufen[i]}
                {i < 5 ? <ArrowRight className="hidden size-3 sm:inline" aria-hidden /> : null}
              </span>
              <span className={`font-sans text-2xl font-semibold tabular-nums ${i === 5 ? "text-primary" : "text-foreground"}`}>{w}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{eur(f.eur)}</span> gewonnen · <span className="font-medium text-foreground">{eur(f.bezahltEur)}</span> {t.bezahlt}
        </p>
      </Surface>

      <Klappe titel={t.abteilungen} zahl={karne.abteilungen.length || undefined} unter={t.abtHinweis}>
        {karne.abteilungen.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.leer}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-normal" />
                  {t.stufen.map((s) => (
                    <th key={s} className="px-2 py-2 text-right font-normal">
                      {s}
                    </th>
                  ))}
                  <th className="py-2 pl-2 text-right font-normal">€</th>
                </tr>
              </thead>
              <tbody>
                {karne.abteilungen.map((a) => (
                  <tr key={a.id} className="border-t border-border/60">
                    <td className="py-2 pr-3 text-foreground">{a.name}</td>
                    {werte(a.kette).map((w, i) => (
                      <td key={i} className="px-2 py-2 text-right font-mono tabular-nums text-foreground">
                        {w}
                      </td>
                    ))}
                    <td className="py-2 pl-2 text-right font-mono tabular-nums text-foreground">{a.kette.eur.toLocaleString(intl)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Klappe>

      <Klappe
        titel={t.agenten}
        zahl={karne.agenten.filter((a) => a.urteil === "vorschlag" || a.urteil === "schaerfen").length || undefined}
        offen={karne.agenten.some((a) => a.urteil === "vorschlag")}
      >
        <div className="flex flex-col gap-4">
          {gruppen.map((g) => (
            <div key={g.u} className="flex flex-col gap-2">
              <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span className={`size-2.5 rounded-full ${FARBE[g.u]}`} aria-hidden />
                {URTEIL_TEXT[g.u][sprache]} · {g.liste.length}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {g.liste.map((a) => (
                  <AgentZeile key={a.agent} a={a} t={t} datum={datum} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Klappe>

      {pausen.length > 0 ? (
        <Klappe titel={t.pausiert} zahl={pausen.length}>
          <ul className="flex flex-col gap-2">
            {pausen.map((p) => (
              <li key={p.agent} className="flex flex-col gap-2 rounded-2xl bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-medium text-foreground">{name(p.agent)}</span>
                  <span className="text-sm text-muted-foreground">
                    {t.seit} {datum(p.seit)}
                    {p.grund ? ` · ${p.grund}` : ""}
                    {p.uebernimmt ? ` · → ${name(p.uebernimmt)}` : ""}
                  </span>
                </span>
                <form action={aktivieren}>
                  <input type="hidden" name="agent" value={p.agent} />
                  <AktionKnopf className="rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">{t.aktivieren}</AktionKnopf>
                </form>
              </li>
            ))}
          </ul>
        </Klappe>
      ) : null}
    </section>
  )
}

function AgentZeile({ a, t, datum }: { a: AgentKarne; t: (typeof T)[keyof typeof T]; datum: (iso: string) => string }) {
  const k = a.kette
  const zahlen =
    a.klasse === "stab"
      ? `${a.paesse} Pässe`
      : a.klasse === "schutz"
        ? null
        : `${k.kontakte} → ${k.antworten} · ${k.leads} → ${k.termine} → ${k.angebote} → ${k.gewonnen}${k.eur ? ` · ${k.eur.toLocaleString("de-DE")} €` : ""}`
  return (
    <li className="flex flex-col gap-0.5 rounded-2xl bg-background px-4 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <span className="flex min-w-0 flex-col">
        <span className="font-medium text-foreground">{a.name}</span>
        <span className="text-xs text-muted-foreground">
          {a.grund}
          {a.urteilAb ? ` · ${t.urteilAb} ${datum(a.urteilAb)}` : ""}
        </span>
      </span>
      {zahlen ? <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{zahlen}</span> : null}
    </li>
  )
}
