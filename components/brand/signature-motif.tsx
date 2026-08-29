/**
 * SIGNATUR 02 — DIE FUENF EBENEN
 *
 * Fuenf Schienen uebereinander, jede laenger als die darunter. Unten
 * Identity, oben Intelligence. Jede beginnt links mit einem Goldstueck und
 * laeuft als Haarlinie aus.
 *
 * ---------------------------------------------------------------------------
 * WARUM NICHT MEHR ALS KNOTEN
 * Der erste Anlauf zeichnete dieselben fuenf Ebenen als Knoten auf einer
 * steigenden Kette. Die Herleitung stimmte, die Wirkung nicht: Ein frei
 * schwebendes Punktnetz ist der Hintergrund jedes KI-Startups — also genau
 * das „Standard", das hier vermieden werden soll. Es sah nach Molekuel aus,
 * nicht nach creaDIG. Ein Zeichen, dessen Bedeutung nur im Kommentar steht
 * und nirgends auf der Seite, ist kein Zeichen fuer Besucher.
 *
 * Diese Fassung erfindet darum keine Form, sondern benutzt die zwei, die auf
 * der Seite schon stehen:
 *
 *   Leistungspyramide (`/leistungen`)   fuenf Ebenen, nach oben breiter
 *   tragende Fuge (SIG-01)              Schiene mit Goldanfang links
 *
 * Damit ist die Aufloesung schon gelesen, bevor jemand das Zeichen deutet:
 * „Fuenf Ebenen. Ein System." steht als Satz im Hero, die fuenf Namen stehen
 * als Chips daneben, und auf `/leistungen` liegt dieselbe Treppe in gross.
 *
 * ---------------------------------------------------------------------------
 * WAS AUS DEN DATEN KOMMT
 * Die Zahl der Schienen ist `serviceLayers.length`. Fuenf, weil das Haus
 * fuenf Ebenen hat — kaeme eine dazu, zeichnete sich das Zeichen mit.
 *
 * Die Trabanten (ein Punkt je eigenem Produkt an seiner Ebene) sind bewusst
 * RAUS. Sie waren der Teil, der die Zeichnung zum Molekuel machte, und die
 * Aussage „welches Produkt liegt auf welcher Ebene" traegt die Seite besser
 * in Worten als der Hintergrund in Punkten.
 *
 * ---------------------------------------------------------------------------
 * DREI ZUSTAENDE
 *   quiet   Baender, Kopfzonen, Ersatzflaechen. Die Treppe, sonst nichts.
 *   field   Nur der Hero: Gold laeuft der Reihe nach durch die Ebenen, von
 *           unten nach oben, einmal in dreizehn Sekunden. Dieselbe Linie,
 *           die bei SIG-01 an der Naht entlanglaeuft, und dieselbe Aussage
 *           wie die Headline: die Reihenfolge, in der hier gebaut wird.
 *           Eine Bewegung, ein Satz.
 *   active  Leistungsseite Ebene n: deren Schiene ist ganz aus Gold.
 *
 * Reines CSS/SVG, kein Client-JS. Wer „Bewegung reduzieren" gesetzt hat,
 * sieht die Treppe in Ruhe — nicht eine leere Flaeche.
 */

import type { CSSProperties } from "react"
import { serviceLayers } from "@/lib/site-data"

type LayerKey = (typeof serviceLayers)[number]["key"]

type Role = "field" | "band" | "placeholder"

type SignatureMotifProps = {
  /** Wo das Zeichen steht — und damit, wie gross und wie laut es ist. */
  role?: Role
  /** Wenn gesetzt, ist die Schiene dieser Ebene ganz aus Gold. */
  active?: LayerKey
  /** Nur fuer Ausnahmen der Platzierung. Die Rolle bringt ihre eigene mit. */
  className?: string
}

/*
 * Das Zeichen hat eine Groesse, keine Flaeche: Haarlinien skalieren nicht mit
 * (`non-scaling-stroke`), Abstaende schon. Wer das SVG die Flaeche fuellen
 * laesst, bekommt je nach Sektion ein anderes Zeichen — und damit keins. Also
 * traegt die ROLLE Platz und Groesse, wie bei einem Logo.
 */
const ROLE: Record<Role, string> = {
  field:
    "motif-feature pointer-events-none absolute top-[46%] right-[5%] w-[36rem] max-w-[66%] -translate-y-1/2",
  /* top-24 statt top-12: Die feste Kopfleiste ist 4,5 rem hoch — darueber
     lag das Zeichen halb hinter der Navigation. */
  band: "motif-band pointer-events-none absolute top-24 right-6 w-[21rem] max-w-[42%] md:right-10",
  placeholder:
    "motif-placeholder pointer-events-none absolute inset-0 m-auto h-fit w-[19rem] max-w-[70%]",
}

const VB_W = 140
const VB_H = 72

/* Unten schmal, oben breit — dieselbe Verjuengung wie in der Pyramide, in der
   Ebene 05 die groesste Wirkung traegt. */
const X_START = 6
const LEN_BASE = 40
const LEN_STEP = 22
const Y_BOTTOM = 64
const Y_STEP = 14

/* Der Goldanfang. Bei SIG-01 sind es 2,25 rem an einer Sektionsnaht; hier
   dasselbe Verhaeltnis, nur in viewBox-Einheiten. */
const GOLD_HEAD = 14

const RAILS = serviceLayers.map((layer, i) => ({
  ...layer,
  y: Y_BOTTOM - i * Y_STEP,
  length: LEN_BASE + i * LEN_STEP,
}))

/* Ein Durchlauf, fuenf Ebenen: jede bekommt ihr Fuenftel. */
const CYCLE = 13

export function SignatureMotif({ role = "band", active, className }: SignatureMotifProps) {
  const alive = role === "field"

  return (
    <svg
      aria-hidden="true"
      className={className ? `${ROLE[role]} ${className}` : ROLE[role]}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
    >
      {alive && (
        <style>{`
          .cdsig-run {
            animation: cdsig-run ${CYCLE}s linear infinite;
            animation-delay: var(--t);
          }
          @keyframes cdsig-run {
            0%   { stroke-dashoffset: var(--l); }
            12%  { stroke-dashoffset: 0; }
            20%  { stroke-dashoffset: 0; }
            32%  { stroke-dashoffset: calc(var(--l) * -1); }
            100% { stroke-dashoffset: calc(var(--l) * -1); }
          }
          @media (prefers-reduced-motion: reduce) {
            .cdsig-run { display: none; }
          }
        `}</style>
      )}

      {/*
        Die Fluchtlinie, an der alle fuenf Ebenen haengen.

        Ohne sie sind fuenf waagerechte Linien abnehmender Laenge nichts
        Architektonisches, sondern ein Textblock — der Platzhalter, den jeder
        Ladebildschirm zeigt. Mit ihr ist es ein Bau: eine Kante, an der die
        Ebenen sitzen. Dieselbe senkrechte Haarlinie steht in der
        Haus-Architektur zwischen den Ebenen.
      */}
      <line
        x1={X_START}
        y1={RAILS[RAILS.length - 1].y}
        x2={X_START}
        y2={RAILS[0].y}
        stroke="var(--line-strong)"
        strokeOpacity="0.85"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />

      {RAILS.map((rail, i) => {
        const isActive = active === rail.key
        const end = X_START + rail.length

        return (
          <g key={rail.key}>
            {/* Die Schiene. Struktur, keine Farbe. */}
            <line
              x1={X_START}
              y1={rail.y}
              x2={end}
              y2={rail.y}
              stroke={isActive ? "var(--gold-text)" : "var(--line-strong)"}
              strokeOpacity={isActive ? 0.9 : 0.85}
              strokeWidth={isActive ? 2 : 1}
              vectorEffect="non-scaling-stroke"
            />

            {/* Der Goldanfang — dieselbe Marke wie an jeder Sektionsnaht. */}
            {!isActive && (
              <line
                x1={X_START}
                y1={rail.y}
                x2={X_START + GOLD_HEAD}
                y2={rail.y}
                stroke="var(--gold-text)"
                strokeOpacity="0.85"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/*
              Die eine Bewegung: Gold laeuft die Ebene ab und verlaesst sie
              wieder — Ebene 01 zuerst, Ebene 05 zuletzt. Das ist die
              Reihenfolge, in der dieses Haus baut.
            */}
            {alive && (
              <line
                x1={X_START}
                y1={rail.y}
                x2={end}
                y2={rail.y}
                stroke="var(--gold-text)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                className="cdsig-run"
                strokeDasharray={`${rail.length} ${rail.length}`}
                style={
                  {
                    "--l": rail.length,
                    "--t": `${(i * CYCLE) / RAILS.length}s`,
                  } as CSSProperties
                }
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}
