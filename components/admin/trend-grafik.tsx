import type { TrendTag } from "@/lib/trend"

/*
 * Verlauf des KI-Teams als drei kleine Grafiken — eine Achse je Grafik, nie
 * zwei Skalen in einer. Server-gerendert, ohne Bibliothek: Balken als Flex,
 * Linien als SVG mit nicht skalierender Strichstärke. Hover über <title> je
 * Tag; die Zahlen stehen zusätzlich als Tabelle darunter.
 *
 * Farben: Marken-Primär für Arbeit, `destructive` nur für Fehler (Status,
 * immer mit Beschriftung). Geprüft 22.10.2026 mit dataviz/validate_palette:
 * hell alles bestanden; dunkel CVD-Abstand und Kontrast bestanden.
 */

type Texte = {
  laeufe: string
  ok: string
  fehler: string
  quote: string
  quoteLeer: string
  web: string
  webLeer: string
  tabelle: string
  tag: string
  entwuerfe: string
  veroeffentlicht: string
}

export const TREND_TEXT: Record<"de" | "tr", Texte> = {
  de: {
    laeufe: "KI-Team · Läufe je Tag",
    ok: "erfolgreich",
    fehler: "Fehler",
    quote: "Freigabequote · 7-Tage-Fenster",
    quoteLeer: "Noch keine Entscheidung im Zeitraum.",
    web: "Website-Note · /100",
    webLeer: "Noch keine Prüfung im Zeitraum.",
    tabelle: "Zahlen als Tabelle",
    tag: "Tag",
    entwuerfe: "Entwürfe",
    veroeffentlicht: "Veröffentlicht",
  },
  tr: {
    laeufe: "Yapay zekâ ekibi · günlük çalışma",
    ok: "başarılı",
    fehler: "hata",
    quote: "Onay oranı · 7 günlük pencere",
    quoteLeer: "Bu dönemde henüz karar yok.",
    web: "Web sitesi notu · /100",
    webLeer: "Bu dönemde henüz denetim yok.",
    tabelle: "Rakamlar tablo olarak",
    tag: "Gün",
    entwuerfe: "Taslak",
    veroeffentlicht: "Yayımlanan",
  },
}

export function TrendGrafik({ trend, sprache, intl }: { trend: TrendTag[]; sprache: "de" | "tr"; intl: string }) {
  const t = TREND_TEXT[sprache]
  if (!trend.length) return null
  const tag = new Intl.DateTimeFormat(intl, { day: "2-digit", month: "2-digit", timeZone: "UTC" })
  const kurz = (d: string) => tag.format(new Date(`${d}T00:00:00Z`))
  const maxLauf = Math.max(1, ...trend.map((d) => d.laeufe))
  const prozent = (v: number | null) => (v === null ? "–" : `${Math.round(v * 100)} %`)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <figure className="flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-sm">
          <figcaption className="text-sm font-medium text-foreground">{t.laeufe}</figcaption>
          <div className="flex h-28 items-end gap-[2px]">
            {trend.map((d) => (
              <div key={d.tag} className="flex h-full flex-1 flex-col justify-end" title={`${kurz(d.tag)} · ${d.laeufe - d.fehler} ${t.ok} · ${d.fehler} ${t.fehler}`}>
                <div className="flex w-full flex-col gap-[2px]" style={{ height: `${(d.laeufe / maxLauf) * 100}%` }}>
                  {d.fehler > 0 && <div className="rounded-t-[4px] bg-destructive" style={{ flexGrow: d.fehler }} />}
                  {d.laeufe - d.fehler > 0 && (
                    <div className={`bg-primary ${d.fehler ? "" : "rounded-t-[4px]"}`} style={{ flexGrow: d.laeufe - d.fehler }} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <Achse von={kurz(trend[0].tag)} bis={kurz(trend.at(-1)!.tag)} />
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <Legende farbe="bg-primary" text={t.ok} />
            <Legende farbe="bg-destructive" text={t.fehler} />
          </div>
        </figure>

        <Linie titel={t.quote} leer={t.quoteLeer} werte={trend.map((d) => d.quote7)} tage={trend.map((d) => kurz(d.tag))} format={prozent} />
        <Linie
          titel={t.web}
          leer={t.webLeer}
          werte={trend.map((d) => (d.webNote === null ? null : d.webNote / 100))}
          tage={trend.map((d) => kurz(d.tag))}
          format={(v) => (v === null ? "–" : String(Math.round(v * 100)))}
        />
      </div>

      <details className="rounded-2xl bg-muted px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium text-primary">{t.tabelle}</summary>
        <div className="overflow-x-auto pt-3">
          <table className="w-full text-left text-xs tabular-nums">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-1 pr-3 font-medium">{t.tag}</th>
                <th className="py-1 pr-3 font-medium">{t.ok}</th>
                <th className="py-1 pr-3 font-medium">{t.fehler}</th>
                <th className="py-1 pr-3 font-medium">{t.entwuerfe}</th>
                <th className="py-1 pr-3 font-medium">{t.quote}</th>
                <th className="py-1 pr-3 font-medium">{t.web}</th>
                <th className="py-1 font-medium">{t.veroeffentlicht}</th>
              </tr>
            </thead>
            <tbody>
              {trend.map((d) => (
                <tr key={d.tag} className="border-t border-border">
                  <td className="py-1 pr-3">{kurz(d.tag)}</td>
                  <td className="py-1 pr-3">{d.laeufe - d.fehler}</td>
                  <td className="py-1 pr-3">{d.fehler}</td>
                  <td className="py-1 pr-3">{d.entwuerfe}</td>
                  <td className="py-1 pr-3">{prozent(d.quote7)}</td>
                  <td className="py-1 pr-3">{d.webNote ?? "–"}</td>
                  <td className="py-1">{d.veroeffentlicht}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}

/** Eine Reihe im Bereich 0..1 als Linie; Lücken bleiben Lücken. */
function Linie({ titel, leer, werte, tage, format }: { titel: string; leer: string; werte: (number | null)[]; tage: string[]; format: (v: number | null) => string }) {
  const n = werte.length
  const x = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100)
  const y = (v: number) => 100 - v * 100
  const letzter = [...werte].reverse().find((v) => v !== null) ?? null

  /* Zusammenhängende Abschnitte — eine Lücke (null) unterbricht die Linie. */
  const abschnitte: { i: number; v: number }[][] = []
  werte.forEach((v, i) => {
    if (v === null) return
    const vorher = abschnitte.at(-1)
    if (vorher && vorher.at(-1)!.i === i - 1) vorher.push({ i, v })
    else abschnitte.push([{ i, v }])
  })

  return (
    <figure className="flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-sm">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{titel}</span>
        <span className="font-sans text-lg font-semibold tabular-nums text-foreground">{format(letzter)}</span>
      </figcaption>
      {letzter === null ? (
        <p className="flex h-28 items-center text-sm text-muted-foreground">{leer}</p>
      ) : (
        <div className="relative h-28">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
            {[0, 50, 100].map((g) => (
              <line key={g} x1="0" x2="100" y1={g} y2={g} className="stroke-border" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            {abschnitte.map((a, k) =>
              a.length > 1 ? (
                <polyline
                  key={k}
                  points={a.map((p) => `${x(p.i)},${y(p.v)}`).join(" ")}
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null,
            )}
            {werte.map((v, i) => (
              <rect key={i} x={x(i) - 50 / Math.max(1, n - 1)} y="0" width={100 / Math.max(1, n - 1)} height="100" fill="transparent">
                <title>{`${tage[i]} · ${format(v)}`}</title>
              </rect>
            ))}
          </svg>
          {/* Punkte als HTML, damit sie bei gestrecktem SVG rund bleiben. */}
          {werte.map((v, i) =>
            v === null ? null : (
              <span
                key={i}
                aria-hidden
                className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-card"
                style={{ left: `${x(i)}%`, top: `${y(v)}%` }}
              />
            ),
          )}
        </div>
      )}
      <Achse von={tage[0]} bis={tage.at(-1)!} />
    </figure>
  )
}

function Achse({ von, bis }: { von: string; bis: string }) {
  return (
    <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
      <span>{von}</span>
      <span>{bis}</span>
    </div>
  )
}

function Legende({ farbe, text }: { farbe: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2.5 rounded-sm ${farbe}`} aria-hidden />
      {text}
    </span>
  )
}
