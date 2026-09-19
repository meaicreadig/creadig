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

/** Kumulierte Streckenlänge je Stützpunkt (Meter). */
export function cumulative(coords) {
  const out = [0]
  for (let i = 1; i < coords.length; i++) out[i] = out[i - 1] + haversine(coords[i - 1], coords[i])
  return out
}

/**
 * Projiziert p auf die Linie. Liefert {dist: Meter ab Start, off: Abstand zur Linie, point, index}.
 * Lokale äquirektanguläre Näherung je Segment — für Stadt-Routen mehr als genau genug.
 */
export function project(p, coords, cum) {
  let best = { dist: 0, off: Infinity, point: coords[0], index: 0 }
  const kx = Math.cos(rad(p[1])) * 111320, ky = 110540
  for (let i = 0; i < coords.length - 1; i++) {
    const a = coords[i], b = coords[i + 1]
    const ax = (a[0] - p[0]) * kx, ay = (a[1] - p[1]) * ky
    const bx = (b[0] - p[0]) * kx, by = (b[1] - p[1]) * ky
    const dx = bx - ax, dy = by - ay
    const len2 = dx * dx + dy * dy
    let t = len2 > 0 ? -(ax * dx + ay * dy) / len2 : 0
    t = Math.max(0, Math.min(1, t))
    const qx = ax + t * dx, qy = ay + t * dy
    const off = Math.hypot(qx, qy)
    if (off < best.off) {
      best = { off, index: i, dist: cum[i] + t * (cum[i + 1] - cum[i]), point: [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])] }
    }
  }
  return best
}

/** Punkt (und Segment-Richtung) bei Streckenmeter d. */
export function pointAlong(coords, cum, d) {
  const total = cum[cum.length - 1]
  if (d <= 0) return { point: coords[0], heading: bearing(coords[0], coords[1]) }
  if (d >= total) return { point: coords[coords.length - 1], heading: bearing(coords[coords.length - 2], coords[coords.length - 1]) }
  let i = 1
  while (i < cum.length && cum[i] < d) i++
  const a = coords[i - 1], b = coords[i]
  const t = (d - cum[i - 1]) / Math.max(1e-9, cum[i] - cum[i - 1])
  return { point: [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])], heading: bearing(a, b) }
}

/** Teilstrecke von 0 bis d Meter als Koordinatenliste. */
export function sliceAlong(coords, cum, d) {
  if (d <= 0) return [coords[0], coords[0]]
  const total = cum[cum.length - 1]
  if (d >= total) return coords.slice()
  const out = [coords[0]]
  let i = 1
  while (i < cum.length && cum[i] <= d) out.push(coords[i++])
  const { point } = pointAlong(coords, cum, d)
  out.push(point)
  return out
}

export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
