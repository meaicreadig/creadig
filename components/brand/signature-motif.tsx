/**
 * creaDIG Signatur-Motiv — Dreiecks-/Pfeil-Mesh.
 *
 * Nachgebaut aus dem echten Corporate-Design (`corporate_creadig.ai`):
 * isometrisches Dreiecksraster mit vertikalen Basen, dessen gefüllte Dreiecke
 * nach unten hin dichter werden. Original war Blau — hier in der Gold-Palette.
 *
 * Bewusst deterministisch (seeded LCG statt Math.random), damit Server- und
 * Client-Render identisch sind und keine Hydration-Warnung entsteht.
 */

type SignatureMotifProps = {
  /** Kantenlänge einer Dreiecksseite in viewBox-Einheiten. */
  cell?: number
  /** Grunddichte der gefüllten Dreiecke (0–1) am dichtesten Rand. */
  density?: number
  /** Richtung, in die das Motiv dichter wird. */
  direction?: "down" | "up" | "center"
  className?: string
}

const VB_W = 1600
const VB_H = 900

/** Kleiner deterministischer PRNG (Lehmer / Park–Miller). */
function makeRandom(seed: number) {
  let state = seed % 2147483647
  if (state <= 0) state += 2147483646
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

export function SignatureMotif({
  cell = 74,
  density = 0.3,
  direction = "down",
  className,
}: SignatureMotifProps) {
  const s = cell
  const w = (s * Math.sqrt(3)) / 2 // Spaltenbreite eines Dreiecks mit vertikaler Basis
  const cols = Math.ceil(VB_W / w) + 2
  const rows = Math.ceil(VB_H / s) + 2

  const random = makeRandom(20180929)
  const filled: { d: string; fill: string; opacity: number }[] = []

  for (let c = 0; c < cols; c++) {
    const o = (c % 2) * (s / 2)
    for (let r = -1; r < rows; r++) {
      const x0 = c * w
      const x1 = (c + 1) * w
      const y = r * s + o

      // Rechts- und Links-Dreieck derselben Zelle.
      const shapes = [
        `M ${x0} ${y} L ${x0} ${y + s} L ${x1} ${y + s / 2} Z`,
        `M ${x0} ${y} L ${x1} ${y - s / 2} L ${x1} ${y + s / 2} Z`,
      ]

      for (const d of shapes) {
        const yn = Math.min(Math.max((y + s / 2) / VB_H, 0), 1)
        const gradient =
          direction === "down" ? yn : direction === "up" ? 1 - yn : 1 - Math.abs(yn - 0.5) * 2
        // Quadratische Kurve: oben fast leer, unten dicht — wie im Original.
        const chance = density * gradient * gradient
        if (random() > chance) continue

        // Drei Tonwerte wie im CI: Gold, helles Gold, neutrales Grau.
        const roll = random()
        if (roll < 0.5) {
          filled.push({ d, fill: "var(--mesh-fill)", opacity: 0.08 + random() * 0.08 })
        } else if (roll < 0.78) {
          filled.push({ d, fill: "var(--mesh-fill)", opacity: 0.04 + random() * 0.04 })
        } else {
          filled.push({ d, fill: "var(--line-strong)", opacity: 0.07 + random() * 0.06 })
        }
      }
    }
  }

  // Die drei Linienfamilien des Rasters: vertikal, +30°, −30°.
  const verticals = Array.from({ length: cols + 1 }, (_, c) => c * w)
  const diagonals: { x1: number; y1: number; x2: number; y2: number }[] = []
  const span = VB_W
  const rise = span / Math.sqrt(3)
  // Startpunkte so wählen, dass beide Diagonalfamilien die volle Fläche decken.
  const kMin = Math.floor(-rise / (s / 2)) - 2
  const kMax = Math.ceil((VB_H + rise) / (s / 2)) + 2
  for (let k = kMin; k <= kMax; k++) {
    const yStart = k * (s / 2)
    diagonals.push({ x1: 0, y1: yStart, x2: span, y2: yStart + rise })
    diagonals.push({ x1: 0, y1: yStart, x2: span, y2: yStart - rise })
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <g stroke="var(--mesh)" strokeWidth="1" vectorEffect="non-scaling-stroke">
        {verticals.map((x, i) => (
          <line key={`v${i}`} x1={x} y1={-s} x2={x} y2={VB_H + s} />
        ))}
        {diagonals.map((l, i) => (
          <line key={`d${i}`} {...l} />
        ))}
      </g>
      <g>
        {filled.map((f, i) => (
          <path key={`f${i}`} d={f.d} fill={f.fill} fillOpacity={f.opacity} />
        ))}
      </g>
    </svg>
  )
}
