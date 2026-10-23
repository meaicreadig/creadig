"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useRef, useState } from "react"
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Minus, Plus, X } from "lucide-react"
import { agentFrisch, fadenLive, vorText, type LiveFaden } from "@/lib/zentrale/aktivitaet"
import type { Etage, Raum } from "@/lib/zentrale/hauptsitz"
import type { Sprache } from "@/lib/zentrale/netz-karte"
import type { Fokus, Richtung, Steuer } from "./hauptsitz-3d"
import { useJetzt } from "./use-jetzt"

const Szene = dynamic(() => import("./hauptsitz-3d"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-muted" />,
})

const PUNKT: Record<Raum["zustand"], string> = {
  ruhig: "bg-muted-foreground/40",
  aktiv: "bg-primary",
  achtung: "bg-amber-500",
  stoerung: "bg-red-500",
}

const T = {
  de: {
    titel: "Hauptsitz",
    unter: "5 Etagen, 15 Abteilungen. Ziehen zum Drehen, Scrollen zum Zoomen, Pfeiltasten oder Knöpfe unten rechts zum Verschieben, Klick auf Etage oder Raum.",
    gebaeude: "Ganzes Gebäude",
    team: "KI-Mitarbeiter",
    keinTeam: "Noch niemand eingestellt.",
    zuletzt: "zuletzt aktiv",
    keinLauf: "noch kein Lauf erfasst",
    fehlerLauf: "letzter Lauf mit Fehler",
    gerade: "Gerade passiert",
    leer: "Nicht besetzt",
    teil: "Teilweise besetzt",
    aktiv: "Besetzt",
    oeffnen: "Öffnen",
    etage: (i: number) => (i === 0 ? "EG" : `${i}. OG`),
  },
  tr: {
    titel: "Genel Merkez",
    unter: "5 kat, 15 departman. Döndürmek için sürükle, yakınlaştırmak için kaydır, kaydırmak için ok tuşları veya sağ alttaki düğmeler, kata veya odaya tıkla.",
    gebaeude: "Tüm bina",
    team: "Yapay zekâ çalışanları",
    keinTeam: "Henüz kimse işe alınmadı.",
    zuletzt: "son aktif",
    keinLauf: "henüz çalışma kaydı yok",
    fehlerLauf: "son çalışma hatalı",
    gerade: "Az önce olanlar",
    leer: "Kadro yok",
    teil: "Kısmen dolu",
    aktiv: "Dolu",
    oeffnen: "Aç",
    etage: (i: number) => (i === 0 ? "Zemin" : `${i}. kat`),
  },
}

export function Hauptsitz({ etagen, raeume, faeden, sprache }: { etagen: Etage[]; raeume: Raum[]; faeden: LiveFaden[]; sprache: Sprache }) {
  const [fokus, setFokus] = useState<Fokus>({ etage: null, raum: null })
  const steuer = useRef<Steuer | null>(null)
  const bewege = (r: Richtung) => steuer.current?.(r)
  const TASTE: Record<string, Richtung> = { ArrowUp: "hoch", ArrowDown: "runter", ArrowLeft: "links", ArrowRight: "rechts", "+": "rein", "-": "raus" }
  const t = T[sprache]
  const jetzt = useJetzt()
  const raum = raeume.find((r) => r.id === fokus.raum) ?? null
  const gerade = raum && jetzt !== null ? faeden.filter((f) => (f.raumVon === raum.id || f.raumNach === raum.id) && fadenLive(f.zeit, jetzt)) : []
  const besetzung = raum ? { leer: t.leer, teilweise: t.teil, aktiv: t.aktiv }[raum.besetzung] : ""

  const waehleRaum = (id: string) => {
    const r = raeume.find((x) => x.id === id)
    if (r) setFokus({ etage: r.etage, raum: id })
  }

  return (
    <section aria-labelledby="hauptsitz-titel" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="hauptsitz-titel" className="font-sans text-2xl font-semibold tracking-tight text-foreground">
            {t.titel}
          </h2>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{t.unter}</p>
        </div>
        <nav aria-label={t.titel} className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFokus({ etage: null, raum: null })}
            className={`rounded-full px-3 py-1.5 text-xs ${fokus.etage === null ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}
          >
            {t.gebaeude}
          </button>
          {[...etagen].reverse().map((e) => (
            <button
              key={e.index}
              type="button"
              aria-pressed={fokus.etage === e.index}
              onClick={() => setFokus({ etage: e.index, raum: null })}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${
                fokus.etage === e.index ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
              }`}
            >
              <span aria-hidden className={`size-1.5 rounded-full ${PUNKT[e.zustand]}`} />
              <span className="font-mono opacity-70">{t.etage(e.index)}</span>
              {e.name}
            </button>
          ))}
        </nav>
      </div>

      <div
        tabIndex={0}
        aria-label={t.titel}
        onKeyDown={(e) => {
          const r = TASTE[e.key]
          if (!r) return
          e.preventDefault()
          bewege(r)
        }}
        className="relative h-[72vh] min-h-[520px] overflow-hidden rounded-3xl bg-card outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="absolute bottom-4 right-4 z-10 grid grid-cols-3 gap-1 rounded-2xl bg-card/90 p-1.5 shadow-sm backdrop-blur">
          {(
            [
              ["rein", Plus, "Zoom +"],
              ["hoch", ArrowUp, "↑"],
              ["raus", Minus, "Zoom −"],
              ["links", ArrowLeft, "←"],
              ["runter", ArrowDown, "↓"],
              ["rechts", ArrowRight, "→"],
            ] as const
          ).map(([r, Icon, label]) => (
            <button
              key={r}
              type="button"
              aria-label={label}
              onClick={() => bewege(r)}
              className="flex size-8 items-center justify-center rounded-full text-foreground/75 transition-colors hover:bg-background hover:text-foreground"
            >
              <Icon aria-hidden className="size-4" />
            </button>
          ))}
        </div>
        <Szene
          steuer={steuer}
          etagen={etagen}
          raeume={raeume}
          fokus={fokus}
          faeden={faeden}
          sprache={sprache}
          onRaum={waehleRaum}
          onEtage={(i) => setFokus({ etage: i, raum: null })}
          onLeer={() => setFokus((f) => (f.raum ? { etage: f.etage, raum: null } : f))}
        />

        {fokus.etage !== null && !raum && (
          <button
            type="button"
            onClick={() => setFokus({ etage: null, raum: null })}
            className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs text-foreground shadow-sm backdrop-blur"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            {t.gebaeude}
          </button>
        )}

        <aside
          aria-live="polite"
          className={`absolute inset-y-4 right-4 flex w-[min(360px,calc(100%-2rem))] flex-col gap-5 overflow-y-auto rounded-3xl bg-card/95 p-6 shadow-lg backdrop-blur transition-all duration-500 ${
            raum ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-8 opacity-0"
          }`}
        >
          {raum && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs text-muted-foreground">
                    {t.etage(raum.etage)} · {etagen[raum.etage].name}
                  </span>
                  <h3 className="text-balance font-sans text-xl font-semibold text-foreground">{raum.name}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{raum.aufgabe}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFokus({ etage: raum.etage, raum: null })}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Schließen"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-4">
                <span aria-hidden className={`size-2.5 rounded-full ${PUNKT[raum.zustand]}`} />
                <div className="flex min-w-0 flex-col">
                  <span className="font-mono text-2xl font-semibold text-primary">{raum.wert}</span>
                  <span className="text-sm leading-relaxed text-foreground">{raum.zeile}</span>
                </div>
              </div>

              {raum.punkte.length > 0 && (
                <ul className="flex flex-col gap-2 text-sm leading-relaxed text-foreground">
                  {raum.punkte.map((p) => (
                    <li key={p} className="rounded-2xl bg-muted/40 px-3 py-2">
                      {p}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{t.team}</span>
                  <span className="text-xs text-muted-foreground">{besetzung}</span>
                </div>
                {raum.agentenStand.length ? (
                  <ul className="flex flex-col gap-1.5">
                    {raum.agentenStand.map((a) => {
                      const frisch = jetzt !== null && agentFrisch(a, jetzt)
                      const stand = !a.zeit
                        ? t.keinLauf
                        : jetzt === null
                          ? ""
                          : `${a.fehler ? `${t.fehlerLauf} · ` : `${t.zuletzt} `}${vorText(a.zeit, jetzt, sprache)}`
                      return (
                        <li key={a.id} className="flex items-center justify-between gap-3 rounded-2xl bg-primary/10 px-3 py-2 text-xs">
                          <span className="flex items-center gap-2 text-primary">
                            <span aria-hidden className={`size-1.5 rounded-full ${frisch ? "bg-primary" : a.fehler ? "bg-amber-500" : "bg-muted-foreground/40"}`} />
                            <span className="font-medium">{a.vorname}</span>
                            <span className="text-primary/70">{a.rolle}</span>
                          </span>
                          <span className="text-muted-foreground">{stand}</span>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{t.keinTeam}</p>
                )}
              </div>

              {jetzt !== null && gerade.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">{t.gerade}</span>
                  {gerade.map((f) => (
                    <p key={`${f.von}>${f.nach}`} className="rounded-2xl bg-muted/40 px-3 py-2 text-xs text-foreground">
                      {f.was} · {vorText(f.zeit, jetzt, sprache)}
                    </p>
                  ))}
                </div>
              )}

              {raum.wege.length > 0 && (
                <div className="mt-auto flex flex-col gap-1.5">
                  {raum.wege.map((w) => (
                    <Link
                      key={w.href}
                      href={w.href}
                      className="flex items-center justify-between rounded-full bg-muted/60 px-4 py-2 text-sm text-foreground hover:bg-primary hover:text-primary-foreground"
                    >
                      {w.label}
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </section>
  )
}
