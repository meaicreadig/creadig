/**
 * SIGNATUR 02 — DIE FUENF KNOTEN
 *
 * ---------------------------------------------------------------------------
 * WAS HIER VORHER STAND, UND WARUM ES GEHEN MUSSTE
 * An dieser Stelle lag ein isometrisches Dreiecksraster: sauber gebaut,
 * deterministisch, aus dem alten Corporate-Design abgeleitet — und ohne
 * Aussage. Es war auf vierzehn Flaechen dasselbe Muster, dessen Dichte ein
 * PRNG mit dem Startwert 20180929 bestimmte. Ein Zeichen, das ueberall
 * dasselbe sagt und dieses Etwas aus einer Zufallszahl bezieht, ist kein
 * Zeichen, sondern eine Tapete.
 *
 * Der Owner hat das Muster am 26.08. global abgeschaltet. Damit war die
 * Seite ruhig — und ehrlich leer. Das war kein Rueckschritt: Erst ohne
 * Tapete sieht man, was fehlt.
 *
 * ---------------------------------------------------------------------------
 * DIE REGEL: EIN BAU, DREI ZUSTAENDE, NULL ERFINDUNG
 * Das Zeichen sind die fuenf Ebenen des Hauses — Identity, Digital,
 * Operations, Automation, Intelligence — als fuenf Knoten auf einer
 * steigenden Kette. Nichts daran ist frei gewaehlt:
 *
 *   Die Knoten        sind `serviceLayers` aus `site-data`. Fuenf, weil das
 *                     Haus fuenf Ebenen hat — nicht, weil fuenf gut aussieht.
 *   Die Kette         ist das Modell selbst: Jede Ebene steht auf der
 *                     darunter. Darum steigt sie, und darum schliesst sie
 *                     sich nicht zum Kreis.
 *   Die Trabanten     sind die eigenen Produkte, jedes an SEINER Ebene
 *                     (`productWorlds[slug].layer`). Heute haengen drei an
 *                     Operations und eines an Intelligence — die drei
 *                     unteren Knoten stehen leer.
 *   Gefuellt / offen  `live` aus `site-data`: gefuellt heisst laeuft, offen
 *                     heisst im Aufbau. Dieselbe Unterscheidung wie beim
 *                     `StatusDot`, nur ohne Worte.
 *
 * Das Zeichen behauptet damit nichts, was die Seite nicht auch schreibt. Es
 * ist eine Zeichnung des Datenbestands. Kommt ein Produkt dazu oder wechselt
 * eine Ebene, aendert sich das Markenzeichen mit — ohne dass jemand diese
 * Datei anfasst. Und solange an den unteren Knoten nichts haengt, sieht man
 * auch das. Das ist der Punkt, nicht der Schoenheitsfehler.
 *
 * ---------------------------------------------------------------------------
 * WARUM LINIE UND PUNKT UND KEINE FLAECHE
 * Der Befund aus `creadig-DESIGN-IDENTITAET.md` war: Auf dem dunklen Grund
 * verschwand das Motiv, weil es aus Flaechen bestand. Eine Haarlinie und ein
 * Punkt haben dieses Problem nicht — sie holen ihre Helligkeit aus
 * `--line-strong` und `--gold` und tragen in beiden Fassungen.
 *
 * ---------------------------------------------------------------------------
 * DREI ZUSTAENDE
 *   quiet   Baender, Kopfzonen, Ersatzflaechen. Der Bau, sonst nichts.
 *   field   Nur der Hero: die Knoten atmen, EIN Signal laeuft die Kette von
 *           01 nach 05. Das ist die eine Bewegung dieser Sektion, und sie
 *           erklaert etwas — die Richtung, in der dieses Haus baut.
 *   active  Leistungsseite Ebene n: derselbe Bau, Knoten n leuchtet.
 *
 * Die Bewegung ist reines CSS/SMIL — kein Client-JS, kein Hydrations-Risiko.
 * Wer „Bewegung reduzieren" gesetzt hat, sieht denselben Bau in Ruhe.
 */

import type { CSSProperties } from "react"
import { productWorks, productWorlds, serviceLayers } from "@/lib/site-data"

type LayerKey = (typeof serviceLayers)[number]["key"]

type SignatureMotifProps = {
  /**
   * Wo das Zeichen steht — und damit, wie gross und wie laut es ist.
   * Siehe `ROLE` unten.
   */
  role?: Role
  /** Wenn gesetzt, leuchtet genau dieser Knoten — die Ebene dieser Seite. */
  active?: LayerKey
  /** Nur fuer Ausnahmen der Platzierung. Die Rolle bringt ihre eigene mit. */
  className?: string
}

type Role = "field" | "band" | "placeholder"

/*
 * DAS ZEICHEN HAT EINE GROESSE, KEINE FLAECHE.
 *
 * Der erste Anlauf liess das SVG die Flaeche fuellen (`inset-0 h-full
 * w-full`). Das war die Denkweise der alten Tapete und hier falsch: Ein
 * Zeichen aus Punkten und Haarlinien skaliert nicht mit. Die Linien blieben
 * per `non-scaling-stroke` bei 1 px, die Knoten wuchsen mit der Flaeche —
 * im Kennzahlen-Band standen fingerdicke Punkte an haarduennen Faeden, und
 * die Kette lief quer durch die Ueberschrift.
 *
 * Ein Signet hat darum hier dieselbe Eigenschaft wie ein Logo: eine feste
 * Groesse und einen festen Platz. Was sich je Rolle aendert, ist beides —
 * nicht die Zeichnung.
 *
 *   field        Der Hero. Rechts neben der Typografie, gross genug, um
 *                die Flaeche mitzutragen. Der einzige Ort mit Bewegung.
 *   band         Baender und Kopfzonen. Oben rechts, klein, leise: Es
 *                begleitet die Schrift und tritt nie vor sie.
 *   placeholder  Wo ein Bild fehlt. Mittig — es soll auffallen, dass hier
 *                etwas hingehoert, das noch nicht da ist.
 */
const ROLE: Record<Role, string> = {
  field:
    "motif-feature pointer-events-none absolute top-[42%] right-[4%] w-[40rem] max-w-[72%] -translate-y-1/2",
  band: "motif-band pointer-events-none absolute top-10 right-6 w-[26rem] max-w-[46%] md:right-10",
  placeholder:
    "motif-placeholder pointer-events-none absolute inset-0 m-auto h-fit w-[24rem] max-w-[76%]",
}

/* 16:9 auf allen vierzehn Flaechen, damit der Bau ueberall derselbe ist —
   und `meet` statt `slice`, damit er nirgends verzerrt oder angeschnitten
   wird. Ein Zeichen, das je nach Flaeche anders aussieht, ist keins. */
const VB_W = 160
const VB_H = 90

/*
 * Der Aufstieg. Die Kette steigt nicht gleichmaessig, sondern erst flach und
 * dann steil (Exponent 1,6): Identity und Digital liegen dicht beieinander,
 * zwischen Automation und Intelligence liegt der groesste Sprung. Das ist
 * keine Kurvenkosmetik, sondern die Aussage der Leistungspyramide, in der
 * Ebene 05 die groesste Wirkung traegt.
 */
const X_START = 22
const X_END = 138
const Y_BASE = 76
const Y_TOP = 14
const RISE = 1.6

/* Trabantenkranz: unterhalb des Knotens, damit die Kette frei bleibt. */
const SAT_RADIUS = 8.5
const SAT_FROM = 28
const SAT_TO = 118

const NODES = serviceLayers.map((layer, i) => {
  const t = i / (serviceLayers.length - 1)
  const x = X_START + (X_END - X_START) * t
  const y = Y_BASE - (Y_BASE - Y_TOP) * Math.pow(t, RISE)

  const products = productWorks.filter(
    (product) => productWorlds[product.slug]?.layer === layer.key,
  )

  const satellites = products.map((product, k) => {
    const share = products.length === 1 ? 0.5 : k / (products.length - 1)
    const rad = ((SAT_FROM + (SAT_TO - SAT_FROM) * share) * Math.PI) / 180
    return {
      slug: product.slug,
      live: product.live,
      x: x + Math.cos(rad) * SAT_RADIUS,
      y: y + Math.sin(rad) * SAT_RADIUS,
    }
  })

  return { ...layer, x, y, satellites }
})

/* Der Weg des Signals: einmal die ganze Kette hinauf. */
const CHAIN_PATH = NODES.map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`).join(" ")

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
          .cdsig-node {
            transform-box: fill-box;
            transform-origin: center;
            animation: cdsig-breathe var(--d) ease-in-out infinite;
            animation-delay: var(--t);
          }
          @keyframes cdsig-breathe {
            0%, 100% { opacity: .55; transform: scale(1); }
            50%      { opacity: 1;   transform: scale(1.45); }
          }
          @media (prefers-reduced-motion: reduce) {
            .cdsig-node { animation: none; opacity: .85; }
            .cdsig-signal { display: none; }
          }
        `}</style>
      )}

      {/* Die Kette — das Modell. Gold, weil Gold hier Verbindung heisst. */}
      <path
        d={CHAIN_PATH}
        stroke="var(--gold-text)"
        strokeOpacity="0.5"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Die Verbindung zu den eigenen Produkten. */}
      <g stroke="var(--gold-text)" strokeOpacity="0.32" strokeWidth="1" vectorEffect="non-scaling-stroke">
        {NODES.flatMap((node) =>
          node.satellites.map((sat) => (
            <line key={`v-${sat.slug}`} x1={node.x} y1={node.y} x2={sat.x} y2={sat.y} />
          )),
        )}
      </g>

      {/* Die Produkte. Gefuellt = laeuft, offen = im Aufbau. */}
      {NODES.flatMap((node) =>
        node.satellites.map((sat) =>
          sat.live ? (
            <circle
              key={`p-${sat.slug}`}
              cx={sat.x}
              cy={sat.y}
              r="0.7"
              fill="var(--gold-text)"
              fillOpacity="0.8"
            />
          ) : (
            <circle
              key={`p-${sat.slug}`}
              cx={sat.x}
              cy={sat.y}
              r="0.7"
              stroke="var(--gold-text)"
              strokeOpacity="0.8"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ),
        ),
      )}

      {/* Die fuenf Ebenen. */}
      <g fill="var(--gold-text)">
        {NODES.map((node, i) => {
          const isActive = active === node.key
          return (
            <g key={node.key}>
              {isActive && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="3.6"
                  fill="none"
                  stroke="var(--gold-text)"
                  strokeOpacity="0.6"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={isActive ? 1.8 : 1}
                fillOpacity={isActive ? 1 : 0.8}
                className={alive ? "cdsig-node" : undefined}
                style={
                  alive
                    ? ({ "--d": `${9 + (i % 3) * 1.5}s`, "--t": `${i * 0.8}s` } as CSSProperties)
                    : undefined
                }
              />
            </g>
          )
        })}
      </g>

      {/*
        Das eine Signal. Es laeuft von Identity nach Intelligence, weil das
        die Richtung ist, in der dieses Haus baut — nicht, weil Bewegung
        huebsch ist. Genau eines, nach der Regel „eine Bewegung je Sektion".
      */}
      {alive && (
        <circle r="0.95" fill="var(--gold-text)" opacity="0" className="cdsig-signal">
          <animateMotion dur="13s" repeatCount="indefinite" path={CHAIN_PATH} rotate="0" />
          <animate
            attributeName="opacity"
            dur="13s"
            repeatCount="indefinite"
            values="0; 0.85; 0.85; 0"
            keyTimes="0; 0.12; 0.88; 1"
          />
        </circle>
      )}
    </svg>
  )
}
