/**
 * Eine echte 3D-Kamera (orthografisch) statt eines festen Iso-Tricks:
 * yaw dreht um die Hochachse, elev neigt, zoom skaliert. Die Grundstellung ist
 * exakt isometrisch. Ein späterer WebGL-Renderer übernimmt dieselben Werte.
 */

export type Kamera = { yaw: number; elev: number; zoom: number }
export type P3 = { x: number; y: number; z: number }
export type P2 = { x: number; y: number; t: number }

export const ISO_KAMERA: Kamera = { yaw: Math.PI / 4, elev: Math.atan(1 / Math.SQRT2), zoom: 1 }
export const ELEV_MIN = 0.22
export const ELEV_MAX = 1.25

export function projiziere(p: P3, k: Kamera, massstab: number): P2 {
  const c = Math.cos(k.yaw)
  const s = Math.sin(k.yaw)
  const xr = p.x * c - p.y * s
  const yr = p.x * s + p.y * c
  const se = Math.sin(k.elev)
  const ce = Math.cos(k.elev)
  return { x: xr * massstab, y: (yr * se - p.z * ce) * massstab, t: yr * ce + p.z * se }
}

export const alsPunkte = (ps: P2[]) => ps.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")

export type Flaeche = { punkte: string; licht: number; oben: boolean }

/** Sichtbare Flächen eines Quaders, fern → nah. */
export function quader(cx: number, cy: number, halb: number, hoehe: number, k: Kamera, m: number): Flaeche[] {
  const c = Math.cos(k.yaw)
  const s = Math.sin(k.yaw)
  const ecke = (dx: number, dy: number, z: number) => projiziere({ x: cx + dx * halb, y: cy + dy * halb, z }, k, m)
  const seiten: { n: [number, number]; e: [number, number][] }[] = [
    { n: [1, 0], e: [[1, -1], [1, 1]] },
    { n: [-1, 0], e: [[-1, 1], [-1, -1]] },
    { n: [0, 1], e: [[1, 1], [-1, 1]] },
    { n: [0, -1], e: [[-1, -1], [1, -1]] },
  ]
  const sichtbar: Flaeche[] = []
  for (const seite of seiten) {
    const nyr = seite.n[0] * s + seite.n[1] * c
    if (nyr <= 0) continue
    const nxr = seite.n[0] * c - seite.n[1] * s
    const [a, b] = seite.e
    sichtbar.push({
      punkte: alsPunkte([ecke(a[0], a[1], 0), ecke(b[0], b[1], 0), ecke(b[0], b[1], hoehe), ecke(a[0], a[1], hoehe)]),
      licht: 0.5 + 0.5 * nxr,
      oben: false,
    })
  }
  sichtbar.push({
    punkte: alsPunkte([ecke(-1, -1, hoehe), ecke(1, -1, hoehe), ecke(1, 1, hoehe), ecke(-1, 1, hoehe)]),
    licht: 1,
    oben: true,
  })
  return sichtbar
}

export function bodenRing(cx: number, cy: number, r: number, k: Kamera, m: number, z = 0): string {
  const ps: P2[] = []
  for (let i = 0; i < 32; i++) {
    const w = (i / 32) * Math.PI * 2
    ps.push(projiziere({ x: cx + Math.cos(w) * r, y: cy + Math.sin(w) * r, z }, k, m))
  }
  return alsPunkte(ps)
}

/** Bogen zwischen zwei Bodenpunkten — hebt sich in die Luft, damit Fäden räumlich lesbar sind. */
export function bogen(a: { x: number; y: number }, b: { x: number; y: number }, k: Kamera, m: number, hub: number, z0 = 0.05): string {
  const teile = 18
  let d = ""
  for (let i = 0; i <= teile; i++) {
    const t = i / teile
    const p = projiziere({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: z0 + Math.sin(Math.PI * t) * hub }, k, m)
    d += `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)} `
  }
  return d.trim()
}
