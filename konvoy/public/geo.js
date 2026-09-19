// Kleine Geo-Helfer (Meter, [lng, lat]) — kein turf nötig.
const R = 6371000
const rad = (d) => (d * Math.PI) / 180
const deg = (r) => (r * 180) / Math.PI

/** Entfernung in Metern zwischen zwei [lng, lat]. */
export function haversine(a, b) {
  const dLat = rad(b[1] - a[1]), dLng = rad(b[0] - a[0])
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
}

/** Kompass-Richtung 0–360 von a nach b. */
export function bearing(a, b) {
  const φ1 = rad(a[1]), φ2 = rad(b[1]), Δλ = rad(b[0] - a[0])
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return (deg(Math.atan2(y, x)) + 360) % 360
}

/** Kleinster Winkel zwischen zwei Richtungen (0–180). */
export const angleDiff = (a, b) => { const d = Math.abs(((a - b) % 360) + 360) % 360; return d > 180 ? 360 - d : d }

/** Kumulierte Streckenlänge je Stützpunkt (Meter). */
export function cumulative(coords) {
  const out = [0]
  for (let i = 1; i < coords.length; i++) out[i] = out[i - 1] + haversine(coords[i - 1], coords[i])
  return out
}

/** Index des Segments, in dem Streckenmeter d liegt (binäre Suche). */
function segAt(cum, d) {
  let lo = 0, hi = cum.length - 1
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= d) lo = mid; else hi = mid }
  return lo
}

/**
 * Projiziert p auf die Linie. Liefert {dist: Meter ab Start, off: Abstand zur Linie, point, index, heading}.
 * opts.from/opts.to: nur Segmente in diesem Streckenfenster (Straßen werden zweimal befahren).
 * opts.heading: Fahrtrichtung des Autos — Segmente in Gegenrichtung werden bestraft (Hin- vs. Rückweg).
 * Lokale äquirektanguläre Näherung je Segment — für Stadt-Routen mehr als genau genug.
 */
export function project(p, coords, cum, opts = {}) {
  const from = opts.from ?? -Infinity, to = opts.to ?? Infinity
  const hasHeading = typeof opts.heading === 'number' && !Number.isNaN(opts.heading)
  let best = { dist: 0, off: Infinity, score: Infinity, point: coords[0], index: 0, heading: 0 }
  const kx = Math.cos(rad(p[1])) * 111320, ky = 110540
  const i0 = from > 0 ? segAt(cum, from) : 0
  for (let i = i0; i < coords.length - 1; i++) {
    if (cum[i] > to) break
    const a = coords[i], b = coords[i + 1]
    const ax = (a[0] - p[0]) * kx, ay = (a[1] - p[1]) * ky
    const bx = (b[0] - p[0]) * kx, by = (b[1] - p[1]) * ky
    const dx = bx - ax, dy = by - ay
    const len2 = dx * dx + dy * dy
    let t = len2 > 0 ? -(ax * dx + ay * dy) / len2 : 0
    t = Math.max(0, Math.min(1, t))
    const off = Math.hypot(ax + t * dx, ay + t * dy)
    let score = off
    let h = null
    if (hasHeading) { h = (deg(Math.atan2(dx, dy)) + 360) % 360; if (angleDiff(h, opts.heading) > 100) score += 45 }
    if (score < best.score) {
      best = { off, score, index: i, dist: cum[i] + t * (cum[i + 1] - cum[i]), point: [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])], heading: h ?? bearing(a, b) }
    }
  }
  return best
}

/** Punkt (und Segment-Richtung) bei Streckenmeter d. */
export function pointAlong(coords, cum, d) {
  const n = coords.length
  const total = cum[n - 1]
  if (d <= 0) return { point: coords[0], heading: bearing(coords[0], coords[1]) }
  if (d >= total) return { point: coords[n - 1], heading: bearing(coords[n - 2], coords[n - 1]) }
  let i = segAt(cum, d)
  while (i < n - 2 && cum[i + 1] - cum[i] < 0.05) i++          // doppelte Stützpunkte überspringen
  const a = coords[i], b = coords[i + 1]
  const t = Math.min(1, Math.max(0, (d - cum[i]) / Math.max(1e-9, cum[i + 1] - cum[i])))
  return { point: [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])], heading: bearing(a, b) }
}

/** Teilstrecke von a bis b Meter als Koordinatenliste. */
export function sliceAlong(coords, cum, a, b) {
  if (b === undefined) { b = a; a = 0 }
  const total = cum[cum.length - 1]
  a = Math.max(0, Math.min(total, a)); b = Math.max(a, Math.min(total, b))
  const out = [pointAlong(coords, cum, a).point]
  for (let i = segAt(cum, a) + 1; i < coords.length && cum[i] < b; i++) out.push(coords[i])
  out.push(pointAlong(coords, cum, b).point)
  if (out.length < 2) out.push(out[0])
  return out
}

/** Punkt d Meter rechtwinklig rechts zur Fahrtrichtung versetzen (Rechtsverkehr). */
export function offsetRight(p, heading, d) {
  const θ = rad(heading + 90)
  return [p[0] + (d * Math.sin(θ)) / (111320 * Math.cos(rad(p[1]))), p[1] + (d * Math.cos(θ)) / 110540]
}

export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
