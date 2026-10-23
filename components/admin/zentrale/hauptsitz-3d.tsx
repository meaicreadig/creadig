"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Environment, Html, Lightformer, OrbitControls, QuadraticBezierLine, useTexture } from "@react-three/drei"
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing"
import { ToneMappingMode } from "postprocessing"
import * as THREE from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import type { Erscheinung, Etage, Raum } from "@/lib/zentrale/hauptsitz"
import type { Zustand } from "@/lib/zentrale/netz"
import { useJetzt } from "./use-jetzt"
import { agentFrisch, fadenLive, vorText, type LiveFaden } from "@/lib/zentrale/aktivitaet"
import type { Sprache } from "@/lib/zentrale/netz-karte"

/* Maße in Metern — echtes Bürogeschoss: 3,6 m Geschosshöhe, 7 m Raumbreite. */
const H = 3.6
const RAUM_B = 7
/** Platz für bis zu 4 Abteilungen je Geschoss; weniger Räume teilen sich die Breite. */
const BREITE = RAUM_B * 4
const TIEFE = 10
const PLATTE = 0.35
/** Kein Auseinanderfahren der Geschosse beim Fokus – das Gebäude bleibt geschlossen. */
const ANHEBEN = 0

const FARBE = {
  beton: "#d9dce1",
  betonDunkel: "#b9bec6",
  alu: "#8d939c",
  boden: "#c9c4bb",
  holz: "#b89a78",
  tisch: "#eceef1",
  dunkel: "#2a2f37",
  blau: "#2f5bea",
  achtung: "#d9a13b",
  stoerung: "#d9483b",
  anthrazit: "#3b4048",
  glas: "#8fb3c4",
  platte: "#3a4049",
  licht: "#ffc98a",
}

const KLEIDUNG = ["#2f3a4c", "#6b7686", "#e6e2da", "#44505f", "#8a6f5a"]
const KLEIDUNG_FRAU = ["#5d6f80", "#8a6b78", "#d9d2c6", "#55654f", "#7a5a48"]
const KOPFTUCH = ["#7d5a66", "#3d4e63", "#c2ae95", "#5f7468", "#9a4a54"]
const HAAR = ["#2a1d15", "#15110e", "#5b3a22", "#b98d4f", "#7a4a2a"]

/* PBR-Materialien (Poly Haven, CC0) – Ordner unter /public/3d, Konvention siehe public/3d/README.md. */
type PbrOrdner = "metal-plate" | "smooth-concrete" | "brushed-concrete"
/** Eine Texturkachel entspricht ca. 2,5 m am Bauteil. */
const KACHEL = 2.5

function usePbr(ordner: PbrOrdner, tint = "#ffffff") {
  const [diff, nor, arm] = useTexture([`/3d/${ordner}/diff.jpg`, `/3d/${ordner}/nor.jpg`, `/3d/${ordner}/arm.jpg`])
  return useMemo(() => {
    ;[diff, nor, arm].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.anisotropy = 8
    })
    diff.colorSpace = THREE.SRGBColorSpace
    return new THREE.MeshStandardMaterial({
      color: tint,
      map: diff,
      normalMap: nor,
      aoMap: arm,
      roughnessMap: arm,
      metalnessMap: arm,
      metalness: 1,
      roughness: 1,
    })
  }, [diff, nor, arm, tint])
}

/** Box-Geometrie, deren UVs in Metern skaliert sind – so bleibt die Kachelung auf jeder Fläche im selben Maßstab. */
const boxCache = new Map<string, THREE.BoxGeometry>()
function weltBox(b: number, h: number, t: number) {
  const key = `${b}|${h}|${t}`
  const vorhanden = boxCache.get(key)
  if (vorhanden) return vorhanden
  const g = new THREE.BoxGeometry(b, h, t)
  const uv = g.attributes.uv as THREE.BufferAttribute
  // Flächenfolge in BoxGeometry: +x, -x, +y, -y, +z, -z (je 4 Vertices)
  const maße: [number, number][] = [[t, h], [t, h], [b, t], [b, t], [b, h], [b, h]]
  maße.forEach(([u, v], f) => {
    for (let i = f * 4; i < f * 4 + 4; i++) uv.setXY(i, (uv.getX(i) * u) / KACHEL, (uv.getY(i) * v) / KACHEL)
  })
  boxCache.set(key, g)
  return g
}

type PbrBoxProps = Omit<React.ComponentProps<"mesh">, "args" | "geometry" | "material"> & {
  args: [number, number, number]
  ordner: PbrOrdner
  tint?: string
  roughness?: number
  metalness?: number
}

function PbrBox({ args, ordner, tint, roughness, metalness, ...mesh }: PbrBoxProps) {
  const mat = usePbr(ordner, tint)
  const material = useMemo(() => {
    if (roughness === undefined && metalness === undefined) return mat
    const m = mat.clone()
    if (roughness !== undefined) m.roughness = roughness
    if (metalness !== undefined) m.metalness = metalness
    return m
  }, [mat, roughness, metalness])
  return <mesh {...mesh} geometry={weltBox(...args)} material={material} />
}

/** Kleiner deterministischer Zufall (kein Math.random im Render). */
function zufall(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/*
 * Fassade nach echtem Vorbild: abgerundete, auskragende Geschossplatten (Anthrazit) mit warmer Holzunterseite
 * und einer feinen Lichtfuge, dahinter eine durchgehende Glashaut mit schlanken Pfosten – rundum.
 */
const RUND = 2.6
const UEBERSTAND = 1.1
const GLAS_B = BREITE + 0.2
const GLAS_T = TIEFE + 0.2
/** Halbe Länge des geraden Fassadenstücks vorne – davor beginnt die Rundung. */
const GERADE = GLAS_B / 2 - RUND

function zeichne<P extends THREE.Path>(p: P, b: number, t: number, r: number): P {
  const x = b / 2
  const y = t / 2
  p.moveTo(-x + r, -y)
  p.lineTo(x - r, -y)
  p.absarc(x - r, -y + r, r, -Math.PI / 2, 0, false)
  p.lineTo(x, y - r)
  p.absarc(x - r, y - r, r, 0, Math.PI / 2, false)
  p.lineTo(-x + r, y)
  p.absarc(-x + r, y - r, r, Math.PI / 2, Math.PI, false)
  p.lineTo(-x, -y + r)
  p.absarc(-x + r, -y + r, r, Math.PI, Math.PI * 1.5, false)
  return p
}

function ring(b: number, t: number, r: number, dicke: number) {
  const s = zeichne(new THREE.Shape(), b, t, r)
  s.holes.push(zeichne(new THREE.Path(), b - 2 * dicke, t - 2 * dicke, r - dicke))
  return s
}

function baueFormen() {
  const pb = GLAS_B + 2 * UEBERSTAND
  const pt = GLAS_T + 2 * UEBERSTAND
  const pr = RUND + UEBERSTAND
  const kante = { bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 40 }
  const umfang = 2 * (GLAS_B + GLAS_T) - 8 * RUND + 2 * Math.PI * RUND
  const pfosten = zeichne(new THREE.Shape(), GLAS_B + 0.02, GLAS_T + 0.02, RUND + 0.01)
    .getSpacedPoints(Math.round(umfang / 1.75))
    .slice(0, -1)
    .map((p) => [p.x, p.y] as [number, number])
  return {
    platte: new THREE.ExtrudeGeometry(zeichne(new THREE.Shape(), pb, pt, pr), { depth: PLATTE, ...kante }),
    dach: new THREE.ExtrudeGeometry(zeichne(new THREE.Shape(), pb, pt, pr), { depth: PLATTE + 0.25, ...kante }),
    boden: new THREE.ShapeGeometry(zeichne(new THREE.Shape(), GLAS_B - 0.05, GLAS_T - 0.05, RUND - 0.02), 40),
    dachflaeche: new THREE.ShapeGeometry(zeichne(new THREE.Shape(), pb - 0.3, pt - 0.3, pr - 0.15), 40),
    decke: new THREE.ShapeGeometry(zeichne(new THREE.Shape(), pb - 0.1, pt - 0.1, pr - 0.05), 40),
    lichtfuge: new THREE.ShapeGeometry(ring(pb - 0.3, pt - 0.3, pr - 0.15, 0.06), 40),
    glas: new THREE.ExtrudeGeometry(ring(GLAS_B, GLAS_T, RUND, 0.035), { depth: H - PLATTE, bevelEnabled: false, curveSegments: 40 }),
    gelaender: new THREE.ExtrudeGeometry(ring(pb - 0.5, pt - 0.5, pr - 0.25, 0.03), { depth: 1.05, bevelEnabled: false, curveSegments: 40 }),
    pfosten,
  }
}

let formenCache: ReturnType<typeof baueFormen> | null = null
const formen = () => (formenCache ??= baueFormen())

/** Liegende Formen: Extrusion zeigt nach oben, Grundriss liegt in x/z. */
const LIEGEND: [number, number, number] = [-Math.PI / 2, 0, 0]
/** Nach unten zeigende Fläche (Deckenuntersicht). */
const UNTERSICHT: [number, number, number] = [Math.PI / 2, 0, 0]

function Pfosten({ y, hoehe }: { y: number; hoehe: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const punkte = formen().pfosten
  useLayoutEffect(() => {
    if (!ref.current) return
    const m = new THREE.Matrix4()
    punkte.forEach(([x, z], i) => ref.current!.setMatrixAt(i, m.makeTranslation(x, y, -z)))
    ref.current.instanceMatrix.needsUpdate = true
  }, [punkte, y])
  return (
    <instancedMesh ref={ref} args={[undefined as never, undefined as never, punkte.length]} castShadow>
      <boxGeometry args={[0.035, hoehe, 0.035]} />
      <meshStandardMaterial color="#6b727c" metalness={0.7} roughness={0.3} />
    </instancedMesh>
  )
}

/** Teil einer Raumbreite, der auf dem geraden Fassadenstück liegt (für Statusleiste/Milchglas vorne). */
function geradeAnteil(x: number, b: number) {
  const lo = Math.max(x - b / 2 + 0.3, -GERADE)
  const hi = Math.min(x + b / 2 - 0.3, GERADE)
  return { dx: (lo + hi) / 2 - x, b: Math.max(hi - lo, 0.4) }
}

/** Weiße, fließende Wege im Rasen – als flaches Band entlang einer Kurve. */
const PFADE: [number, number][][] = [
  [[-4, TIEFE / 2 + 1], [-6, 12], [-12, 17], [-22, 19], [-42, 17]],
  [[4, TIEFE / 2 + 1], [7, 11], [6, 18], [10, 27], [18, 42]],
  [[BREITE / 2 + 1, 2], [16, 4], [22, 10], [31, 12], [50, 9]],
  [[-BREITE / 2 - 1, -2], [-16, -5], [-24, -4], [-34, -10], [-52, -12]],
  [[-12, 17], [-4, 23], [1, 31], [-1, 46]],
  [[16, 4], [20, -6], [30, -14], [46, -18]],
]

function bandGeometrie(punkte: [number, number][], breite: number) {
  const kurve = new THREE.CatmullRomCurve3(punkte.map(([x, z]) => new THREE.Vector3(x, 0, z)))
  const n = 90
  const pos: number[] = []
  const nor: number[] = []
  const idx: number[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const p = kurve.getPoint(t)
    const tan = kurve.getTangent(t)
    const quer = new THREE.Vector3(-tan.z, 0, tan.x).normalize()
    const w = (breite * (0.75 + 0.5 * Math.sin(t * Math.PI))) / 2
    pos.push(p.x + quer.x * w, 0, p.z + quer.z * w, p.x - quer.x * w, 0, p.z - quer.z * w)
    nor.push(0, 1, 0, 0, 1, 0)
    if (i < n) {
      const a = i * 2
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3))
  g.setIndex(idx)
  return g
}

function Wege() {
  const baender = useMemo(() => PFADE.map((p, i) => bandGeometrie(p, i > 3 ? 1.6 : 2.4)), [])
  return (
    <>
      {baender.map((g, i) => (
        <mesh key={i} geometry={g} position={[0, 0.012, 0]} receiveShadow>
          <meshStandardMaterial color="#f2f3f1" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

const BAUM_X = [-14, -8, 8, 14, -19, 19]
const BAUM_TOENE = ["#566f4a", "#647f55", "#4c6a44"]
const BAEUME = BAUM_X.map((_, b) => {
  const r = zufall(b * 7919 + 13)
  return Array.from({ length: 7 }).map((__, k) => {
    const winkel = r() * Math.PI * 2
    const abstand = k === 0 ? 0 : 0.35 + r() * 0.75
    const farbe = new THREE.Color(BAUM_TOENE[Math.floor(r() * BAUM_TOENE.length)]).offsetHSL((r() - 0.5) * 0.03, (r() - 0.5) * 0.08, (r() - 0.5) * 0.07)
    return {
      pos: [Math.cos(winkel) * abstand, 3.1 + r() * 1.3 + (k === 0 ? 0.3 : 0), Math.sin(winkel) * abstand] as [number, number, number],
      r: k === 0 ? 1.15 + r() * 0.2 : 0.6 + r() * 0.5,
      farbe: `#${farbe.getHexString()}`,
    }
  })
})

function Glas({ opacity = 0.32 }: { opacity?: number }) {
  return (
    <meshPhysicalMaterial
      color={FARBE.glas}
      transparent
      opacity={opacity}
      roughness={0.04}
      metalness={0.15}
      clearcoat={1}
      clearcoatRoughness={0.05}
      envMapIntensity={1.4}
      depthWrite={false}
    />
  )
}

const HAUT = "#c9a184"
const HOSE = "#2c313a"
const OBERARM = 0.26
const UNTERARM = 0.25

/**
 * Hand mit Handfläche, vier Fingern und Daumen. Lokal zeigt −y in Unterarmrichtung,
 * +z nach unten zur Tastatur – negative rotation.x krümmt einen Finger auf die Taste.
 */
function Hand({ finger, seite, haut }: { finger: React.MutableRefObject<(THREE.Group | null)[]>; seite: number; haut: string }) {
  const HAUT = haut
  return (
    <group>
      <mesh position={[0, -0.045, 0]} scale={[1, 1, 0.38]} castShadow>
        <sphereGeometry args={[0.042, 14, 10]} />
        <meshStandardMaterial color={HAUT} roughness={0.7} />
      </mesh>
      {[-0.027, -0.009, 0.009, 0.027].map((fx, j) => (
        <group
          key={fx}
          ref={(g) => {
            finger.current[j] = g
          }}
          position={[fx, -0.085, 0]}
        >
          <mesh position={[0, -0.026, 0]} castShadow>
            <capsuleGeometry args={[0.0085, j === 0 || j === 3 ? 0.032 : 0.04, 3, 6]} />
            <meshStandardMaterial color={HAUT} roughness={0.7} />
          </mesh>
        </group>
      ))}
      {/* Daumen liegt innen, leicht abgespreizt */}
      <mesh position={[-seite * 0.045, -0.05, 0.006]} rotation={[0, 0, -seite * 0.7]} castShadow>
        <capsuleGeometry args={[0.01, 0.035, 3, 6]} />
        <meshStandardMaterial color={HAUT} roughness={0.7} />
      </mesh>
    </group>
  )
}

function Arm({ x, farbe, an, phase, seite, haut, schmal }: { x: number; farbe: string; an: boolean; phase: number; seite: number; haut: string; schmal: number }) {
  const HAUT = haut
  const schulter = useRef<THREE.Group>(null)
  const ellbogen = useRef<THREE.Group>(null)
  const finger = useRef<(THREE.Group | null)[]>([])
  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    // Arbeitet der Agent gerade (echter frischer Lauf), tippen die Finger einzeln – sonst ruhen sie auf den Tasten.
    if (schulter.current) {
      const soll = 0.5 + (an ? Math.sin(t * 1.7 + phase + seite) * 0.035 : Math.sin(t * 0.6 + phase) * 0.01)
      schulter.current.rotation.x = THREE.MathUtils.damp(schulter.current.rotation.x, soll, 6, dt)
    }
    if (ellbogen.current) {
      const soll = 1.25 + (an ? Math.sin(t * 3.1 + phase * 2 + seite) * 0.05 : 0)
      ellbogen.current.rotation.x = THREE.MathUtils.damp(ellbogen.current.rotation.x, soll, 8, dt)
    }
    finger.current.forEach((g, j) => {
      if (!g) return
      const anschlag = an ? Math.max(0, Math.sin(t * 13 + phase + j * 1.9 + seite * 2.3)) ** 3 * 0.55 : 0
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -0.45 - anschlag, 22, dt)
    })
  })
  return (
    // Gierung nach innen, damit beide Hände über der Tastatur zusammenfinden
    <group position={[x, 0.97, 0.02]} rotation={[0, seite * 0.27, 0]}>
      <group ref={schulter} rotation={[0.5, 0, 0]}>
        <mesh castShadow scale={schmal}>
          <sphereGeometry args={[0.058, 16, 12]} />
          <meshStandardMaterial color={farbe} roughness={0.88} />
        </mesh>
        {/* Oberarm verjüngt sich zum Ellbogen – kein Rohr mehr */}
        <mesh position={[0, -OBERARM / 2, 0]} castShadow>
          <cylinderGeometry args={[0.042 * schmal, 0.052 * schmal, OBERARM, 16]} />
          <meshStandardMaterial color={farbe} roughness={0.88} />
        </mesh>
        <group ref={ellbogen} position={[0, -OBERARM, 0]} rotation={[1.25, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.042 * schmal, 14, 10]} />
            <meshStandardMaterial color={farbe} roughness={0.88} />
          </mesh>
          <mesh position={[0, -UNTERARM / 2, 0]} castShadow>
            <cylinderGeometry args={[0.03 * schmal, 0.041 * schmal, UNTERARM, 16]} />
            <meshStandardMaterial color={farbe} roughness={0.88} />
          </mesh>
          <mesh position={[0, -UNTERARM + 0.01, 0]} castShadow>
            <cylinderGeometry args={[0.024, 0.027, 0.04, 12]} />
            <meshStandardMaterial color={HAUT} roughness={0.7} />
          </mesh>
          <group position={[0, -UNTERARM, 0]}>
            <Hand finger={finger} seite={seite} haut={haut} />
          </group>
        </group>
      </group>
    </group>
  )
}

const HAUTTOENE = ["#ecc9ad", "#dcb08e", "#c69472", "#a8775a", "#86593f"]

function rumpfProfil(punkte: [number, number][]) {
  return new THREE.LatheGeometry(
    punkte.map(([r, y]) => new THREE.Vector2(r, y)),
    32,
  )
}
const RUMPF_MANN = rumpfProfil([
  [0.001, 0],
  [0.14, 0.02],
  [0.15, 0.14],
  [0.155, 0.28],
  [0.18, 0.44],
  [0.2, 0.52],
  [0.17, 0.57],
  [0.07, 0.6],
  [0.001, 0.6],
])
const RUMPF_FRAU = rumpfProfil([
  [0.001, 0],
  [0.155, 0.02],
  [0.135, 0.18],
  [0.125, 0.26],
  [0.15, 0.4],
  [0.165, 0.5],
  [0.15, 0.56],
  [0.06, 0.59],
  [0.001, 0.59],
])

function Person({ farbe, haar, an, aussehen }: { farbe: string; haar: string; an: boolean; aussehen: Erscheinung }) {
  const koerper = useRef<THREE.Group>(null)
  const kopf = useRef<THREE.Group>(null)
  const phase = useMemo(() => (farbe.charCodeAt(1) + farbe.charCodeAt(3)) % 7, [farbe])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Grundleben (immer): Atmen und leichtes Umsehen – kein erfundenes „Arbeiten“, das bleibt an `an` gebunden.
    if (koerper.current) koerper.current.scale.y = 1 + Math.sin(t * 1.5 + phase) * 0.012
    if (kopf.current) {
      // Beim Arbeiten Blick auf den Bildschirm, leichtes Lesen von Zeile zu Zeile
      kopf.current.rotation.y = an ? Math.sin(t * 0.9 + phase) * 0.06 : Math.sin(t * 0.45 + phase * 1.7) * 0.28
      kopf.current.rotation.x = an ? 0.06 + Math.sin(t * 0.35 + phase) * 0.03 : Math.sin(t * 0.8 + phase) * 0.04
    }
  })
  const { frau, kopftuch } = aussehen
  const HAUT = HAUTTOENE[aussehen.haut % HAUTTOENE.length]
  const rumpf = frau ? RUMPF_FRAU : RUMPF_MANN
  const schmal = frau ? 0.86 : 1
  const schulterX = frau ? 0.175 : 0.2
  return (
    <group position={[0, 0, 0.6]}>
      <group ref={koerper} position={[0, 0.6, 0]}>
        {/* Rumpf als gedrehtes Profil: Hüfte → Taille → Brust → Schulter, vorn-hinten flacher */}
        <mesh geometry={rumpf} position={[0, 0.02, 0.04]} scale={[1, 1, 0.68]} castShadow>
          <meshStandardMaterial color={farbe} roughness={0.88} />
        </mesh>
        <mesh position={[0, 0.06, 0.03]} scale={[1, 0.7, 0.85]} castShadow>
          <sphereGeometry args={[frau ? 0.165 : 0.155, 24, 16]} />
          <meshStandardMaterial color={frau && kopftuch ? farbe : HOSE} roughness={0.9} />
        </mesh>
      </group>
      {!kopftuch && (
        <mesh position={[0, 1.17, 0.005]} castShadow>
          <cylinderGeometry args={[0.04 * schmal, 0.05 * schmal, 0.11, 16]} />
          <meshStandardMaterial color={HAUT} roughness={0.65} />
        </mesh>
      )}
      <group ref={kopf} position={[0, 1.29, -0.01]}>
        {/* Schädel + Kieferpartie, kleiner Kopf statt Spielfigur-Kugel */}
        <mesh position={[0, 0.09, 0]} scale={[0.86, 1.06, 0.98]} castShadow>
          <sphereGeometry args={[0.1, 32, 24]} />
          <meshStandardMaterial color={HAUT} roughness={0.62} />
        </mesh>
        <mesh position={[0, 0.02, -0.03]} scale={[0.78, 0.72, 0.86]} castShadow>
          <sphereGeometry args={[0.085, 24, 16]} />
          <meshStandardMaterial color={HAUT} roughness={0.62} />
        </mesh>
        <mesh position={[0, 0.07, -0.098]} rotation={[-0.25, 0, 0]} scale={[0.7, 1, 0.9]}>
          <sphereGeometry args={[0.018, 12, 8]} />
          <meshStandardMaterial color={HAUT} roughness={0.6} />
        </mesh>
        {[-0.032, 0.032].map((ox) => (
          <group key={ox}>
            <mesh position={[ox, 0.105, -0.084]}>
              <sphereGeometry args={[0.009, 10, 8]} />
              <meshStandardMaterial color="#1e1915" roughness={0.3} />
            </mesh>
            <mesh position={[ox, 0.128, -0.086]} rotation={[0, 0, ox > 0 ? -0.12 : 0.12]}>
              <boxGeometry args={[0.03, 0.006, 0.006]} />
              <meshStandardMaterial color={kopftuch ? "#2a1d15" : haar} roughness={0.9} />
            </mesh>
          </group>
        ))}
        {kopftuch ? (
          <>
            {/* Kopftuch: umschließt Kopf und Hals, Gesicht bleibt offen */}
            <mesh position={[0, 0.085, 0.008]} scale={[0.95, 1.1, 1]} castShadow>
              <sphereGeometry args={[0.118, 32, 24, Math.PI * 1.5 + 0.78, Math.PI * 2 - 1.56]} />
              <meshStandardMaterial color={haar} roughness={0.92} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.16, -0.035]} rotation={[0.35, 0, 0]} scale={[0.95, 0.55, 1]}>
              <sphereGeometry args={[0.105, 24, 12, 0, Math.PI * 2, 0, 1.1]} />
              <meshStandardMaterial color={haar} roughness={0.92} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, -0.09, 0.01]} castShadow>
              <cylinderGeometry args={[0.1, 0.2, 0.2, 28, 1, true]} />
              <meshStandardMaterial color={haar} roughness={0.92} side={THREE.DoubleSide} />
            </mesh>
          </>
        ) : (
          <>
            <mesh position={[0, 0.115, 0.018]} rotation={[0.5, 0, 0]} castShadow>
              <sphereGeometry args={[0.106, 28, 18, 0, Math.PI * 2, 0, 1.75]} />
              <meshStandardMaterial color={haar} roughness={0.85} />
            </mesh>
            {[-0.084, 0.084].map((ox) => (
              <mesh key={ox} position={[ox, 0.085, 0.005]} scale={[0.35, 0.9, 0.6]}>
                <sphereGeometry args={[0.026, 10, 8]} />
                <meshStandardMaterial color={HAUT} roughness={0.65} />
              </mesh>
            ))}
            {frau && (
              /* Langes Haar fällt über den Rücken */
              <mesh position={[0, -0.02, 0.07]} scale={[1, 1, 0.55]} castShadow>
                <capsuleGeometry args={[0.085, 0.2, 8, 20]} />
                <meshStandardMaterial color={haar} roughness={0.85} />
              </mesh>
            )}
          </>
        )}
      </group>
      {[-0.085, 0.085].map((lx) => (
        <group key={lx} position={[lx, 0, 0]}>
          <mesh position={[0, 0.58, -0.18]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.058, 0.074, 0.4, 16]} />
            <meshStandardMaterial color={frau && kopftuch ? farbe : HOSE} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.58, -0.38]} castShadow>
            <sphereGeometry args={[0.058, 14, 10]} />
            <meshStandardMaterial color={frau && kopftuch ? farbe : HOSE} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.32, -0.4]} castShadow>
            <cylinderGeometry args={[0.055, 0.042, 0.5, 16]} />
            <meshStandardMaterial color={frau && kopftuch ? farbe : HOSE} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.04, -0.45]} scale={[1, 0.6, 1]} castShadow>
            <capsuleGeometry args={[0.045, 0.14, 6, 12]} />
            <meshStandardMaterial color="#1c1f24" roughness={0.45} />
          </mesh>
        </group>
      ))}
      <Arm x={-schulterX} farbe={farbe} an={an} phase={phase} seite={-1} haut={HAUT} schmal={schmal} />
      <Arm x={schulterX} farbe={farbe} an={an} phase={phase + 0.8} seite={1} haut={HAUT} schmal={schmal} />
    </group>
  )
}

/** Zeilenumbruch für den Bildschirm-Canvas. */
function umbrechen(ctx: CanvasRenderingContext2D, text: string, breite: number): string[] {
  const zeilen: string[] = []
  let zeile = ""
  for (const wort of text.split(/\s+/)) {
    const probe = zeile ? `${zeile} ${wort}` : wort
    if (ctx.measureText(probe).width > breite && zeile) {
      zeilen.push(zeile)
      zeile = wort
    } else zeile = probe
  }
  if (zeile) zeilen.push(zeile)
  return zeilen
}

/**
 * Echter Bildschirm: zeigt Agent und sein letztes echtes Ergebnis.
 * Läuft der Agent gerade, wird der Text live getippt (mit Cursor), die Uhr oben ist die echte Uhrzeit.
 */
function Bildschirm({ an, titel, text }: { an: boolean; titel: string; text: string }) {
  const { canvas, tex } = useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 512
    c.height = 296
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    return { canvas: c, tex: t }
  }, [])
  useEffect(() => () => tex.dispose(), [tex])
  const zuletzt = useRef("")
  const inhalt = text.trim() || "Bereit · wartet auf den nächsten Lauf"

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const n = an ? Math.min(inhalt.length, Math.floor((t * 22) % (inhalt.length + 70))) : inhalt.length
    const cursor = an && Math.floor(t * 2) % 2 === 0
    const uhr = new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" })
    const schluessel = `${n}|${cursor}|${uhr}|${an}|${titel}`
    if (schluessel === zuletzt.current) return
    zuletzt.current = schluessel
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#f5f7fa"
    ctx.fillRect(0, 0, 512, 296)
    ctx.fillStyle = an ? "#2f5bea" : "#5b6270"
    ctx.fillRect(0, 0, 512, 52)
    ctx.fillStyle = "#ffffff"
    ctx.font = "600 24px Manrope, system-ui, sans-serif"
    ctx.fillText(titel, 22, 34)
    ctx.font = "500 20px system-ui, sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(uhr, 490, 34)
    ctx.textAlign = "left"
    ctx.fillStyle = an ? "#7ee2a8" : "#b8bec9"
    ctx.beginPath()
    ctx.arc(490 - ctx.measureText(uhr).width - 18, 27, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#1f2633"
    ctx.font = "400 22px system-ui, sans-serif"
    const zeilen = umbrechen(ctx, inhalt.slice(0, n), 468).slice(0, 8)
    zeilen.forEach((z, i) => ctx.fillText(z, 22, 92 + i * 28))
    if (cursor) {
      const letzte = zeilen[zeilen.length - 1] ?? ""
      ctx.fillStyle = "#2f5bea"
      ctx.fillRect(22 + ctx.measureText(letzte).width + 4, 72 + Math.max(0, zeilen.length - 1) * 28, 3, 24)
    }
    tex.needsUpdate = true
  })

  return (
    <mesh position={[0, 1.06, -0.234]}>
      <planeGeometry args={[0.66, 0.38]} />
      <meshBasicMaterial map={tex} toneMapped={false} color={an ? "#ffffff" : "#9aa0aa"} />
    </mesh>
  )
}

function Tastatur() {
  return (
    <group position={[0, 0.765, 0.2]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.018, 0.15]} />
        <meshStandardMaterial color="#d9dce2" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Tastenreihen */}
      {[-0.045, -0.015, 0.015, 0.045].map((tz) => (
        <mesh key={tz} position={[0, 0.011, tz]}>
          <boxGeometry args={[0.42, 0.006, 0.022]} />
          <meshStandardMaterial color="#f3f4f7" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0.36, 0, 0.02]} castShadow>
        <boxGeometry args={[0.06, 0.02, 0.1]} />
        <meshStandardMaterial color="#d9dce2" roughness={0.45} metalness={0.2} />
      </mesh>
    </group>
  )
}

function Pflanze() {
  return (
    <group>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.19, 0.44, 20]} />
        <meshStandardMaterial color="#e9e7e2" roughness={0.6} />
      </mesh>
      {[
        [0, 0.78, 0, 0.32],
        [0.14, 1.05, 0.05, 0.24],
        [-0.12, 0.98, -0.06, 0.26],
        [0.03, 1.28, -0.02, 0.18],
      ].map(([px, py, pz, r], i) => (
        <mesh key={i} position={[px, py, pz]} castShadow>
          <sphereGeometry args={[r, 14, 10]} />
          <meshStandardMaterial color={i % 2 ? "#4c6b44" : "#5c7d51"} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

const ZUSTAND_FARBE: Record<Zustand, string> = {
  ruhig: "#9aa3b2",
  aktiv: FARBE.blau,
  achtung: FARBE.achtung,
  stoerung: FARBE.stoerung,
}

export type Fokus = { etage: number | null; raum: string | null }

const raumB = (r: Raum) => BREITE / Math.max(r.spalten, 1)
const raumX = (r: Raum) => (r.spalte - (Math.max(r.spalten, 1) - 1) / 2) * raumB(r)

function Kamera({ fokus, raeume }: { fokus: Fokus; raeume: Raum[] }) {
  const { camera } = useThree()
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null
  const fliegt = useRef(true)
  const ziel = useMemo(() => {
    const raum = raeume.find((r) => r.id === fokus.raum)
    if (raum) {
      const y = raum.etage * H + 1.4
      const x = raumX(raum)
      return { pos: new THREE.Vector3(x + 4.5, y + 3.2, 12.5), blick: new THREE.Vector3(x, y, -0.5) }
    }
    if (fokus.etage !== null) {
      const y = fokus.etage * H + 1.4
      return { pos: new THREE.Vector3(9, y + 8, 24), blick: new THREE.Vector3(0, y, 0) }
    }
    return { pos: new THREE.Vector3(30, 22, 36), blick: new THREE.Vector3(0, 8, 0) }
  }, [fokus, raeume])

  useEffect(() => {
    fliegt.current = true
    if (!controls) return
    const stopp = () => (fliegt.current = false)
    controls.addEventListener("start", stopp)
    return () => controls.removeEventListener("start", stopp)
  }, [ziel, controls])

  useFrame((_, dt) => {
    if (!fliegt.current || !controls) return
    const k = 1 - Math.pow(0.02, dt)
    camera.position.lerp(ziel.pos, k)
    controls.target.lerp(ziel.blick, k)
    controls.update()
    if (camera.position.distanceTo(ziel.pos) < 0.05) fliegt.current = false
  })
  return null
}

export type Richtung = "hoch" | "runter" | "links" | "rechts" | "rein" | "raus"
export type Steuer = (r: Richtung) => void

/**
 * Verschieben und Zoomen per Knopf oder Pfeiltaste — Rechtsklick-Ziehen kennt
 * kaum jemand. Verschoben wird in der Bildebene der Kamera (Kamera und Blickziel
 * gemeinsam), gezoomt entlang der Blickachse innerhalb der Abstandsgrenzen.
 */
function Steuerung({ steuer }: { steuer?: MutableRefObject<Steuer | null> }) {
  const { camera } = useThree()
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null
  useEffect(() => {
    if (!steuer || !controls) return
    steuer.current = (r) => {
      controls.dispatchEvent({ type: "start" } as never)
      const abstand = camera.position.distanceTo(controls.target)
      if (r === "rein" || r === "raus") {
        const neu = THREE.MathUtils.clamp(abstand * (r === "rein" ? 0.8 : 1.25), MIN_ABSTAND, MAX_ABSTAND)
        const achse = camera.position.clone().sub(controls.target).setLength(neu)
        camera.position.copy(controls.target).add(achse)
      } else {
        const schritt = abstand * 0.12
        const v = new THREE.Vector3()
        if (r === "links" || r === "rechts") v.setFromMatrixColumn(camera.matrix, 0).multiplyScalar(r === "rechts" ? schritt : -schritt)
        else v.set(0, r === "hoch" ? schritt : -schritt, 0)
        camera.position.add(v)
        controls.target.add(v)
      }
      controls.update()
    }
    return () => {
      steuer.current = null
    }
  }, [steuer, controls, camera])
  return null
}

/**
 * Die Säule ist immer durchgehend: unteres Segment bleibt stehen, oberes Segment fährt mit den angehobenen
 * Geschossen (gleiches damp wie Geschoss/Dach), ein Schaftstück füllt die entstehende Lücke.
 */
const MIN_ABSTAND = 8
const MAX_ABSTAND = 95

/**
 * Touch-Gesten (eigene Umsetzung, OrbitControls macht nur noch 1 Finger = drehen):
 * - 2 Finger: zuerst wird erkannt, ob gespreizt (Zoom) oder gemeinsam geschoben (Verschieben) wird; die Art bleibt bis zum Loslassen.
 * - Zoom folgt dem Finger 1:1 (Abstandsverhältnis), kein Vorauseilen.
 * - 3 Finger: immer verschieben (hoch/runter/links/rechts).
 */
function TouchGesten() {
  const { camera, gl } = useThree()
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null
  useEffect(() => {
    const el = gl.domElement
    type Zustand = { n: number; dist: number; x: number; y: number; modus: "zoom" | "pan" | null; sx: number; sy: number; sdist: number }
    let z: Zustand | null = null
    const lese = (e: TouchEvent) => {
      const t = Array.from(e.touches)
      const x = t.reduce((s, p) => s + p.clientX, 0) / t.length
      const y = t.reduce((s, p) => s + p.clientY, 0) / t.length
      const dist = t.length >= 2 ? Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY) : 0
      return { x, y, dist }
    }
    const beginne = (e: TouchEvent) => {
      if (e.touches.length !== 2 && e.touches.length !== 3) {
        z = null
        return
      }
      const m = lese(e)
      z = { n: e.touches.length, ...m, sx: m.x, sy: m.y, sdist: m.dist, modus: e.touches.length === 3 ? "pan" : null }
      controls?.dispatchEvent({ type: "start" } as never)
    }
    const move = (e: TouchEvent) => {
      if (!z || e.touches.length !== z.n || !controls) return
      e.preventDefault()
      const m = lese(e)
      if (!z.modus) {
        const spreizen = Math.abs(m.dist - z.sdist)
        const schieben = Math.hypot(m.x - z.sx, m.y - z.sy)
        if (spreizen > 12 && spreizen > schieben) z.modus = "zoom"
        else if (schieben > 12) z.modus = "pan"
        else return
      }
      if (z.modus === "zoom" && m.dist > 0 && z.dist > 0) {
        const versatz = camera.position.clone().sub(controls.target)
        const neu = THREE.MathUtils.clamp(versatz.length() * (z.dist / m.dist), MIN_ABSTAND, MAX_ABSTAND)
        camera.position.copy(controls.target).add(versatz.setLength(neu))
      } else if (z.modus === "pan") {
        const cam = camera as THREE.PerspectiveCamera
        const k = (camera.position.distanceTo(controls.target) * 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))) / el.clientHeight
        const rechts = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0)
        const hoch = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1)
        const d = rechts.multiplyScalar(-(m.x - z.x) * k).add(hoch.multiplyScalar((m.y - z.y) * k))
        camera.position.add(d)
        controls.target.add(d)
      }
      z.x = m.x
      z.y = m.y
      z.dist = m.dist
      controls.update()
    }
    const start = beginne
    const ende = (e: TouchEvent) => beginne(e)
    el.addEventListener("touchstart", start, { passive: true })
    el.addEventListener("touchmove", move, { passive: false })
    el.addEventListener("touchend", ende)
    el.addEventListener("touchcancel", ende)
    return () => {
      el.removeEventListener("touchstart", start)
      el.removeEventListener("touchmove", move)
      el.removeEventListener("touchend", ende)
      el.removeEventListener("touchcancel", ende)
    }
  }, [camera, gl, controls])
  return null
}

/**
 * Erschließungskern hinten mit gläsernem Aufzug: Betonschacht bis exakt zur Dachplatte,
 * davor ein Glasschacht, in dem die beleuchtete Kabine Geschoss für Geschoss hält.
 */
function Gehirn({ hoehe }: { hoehe: number }) {
  const kabine = useRef<THREE.Group>(null)
  const geschosse = Math.max(1, Math.round(hoehe / H))
  useFrame(({ clock }) => {
    if (!kabine.current) return
    // 6 s je Abschnitt: 3,5 s Halt mit offener Tür, 2,5 s weich fahren – rauf und wieder runter.
    const t = clock.getElapsedTime() / 6
    const strecke = Math.max(1, geschosse - 1) * 2
    const abschnitt = Math.floor(t) % strecke
    const anteil = THREE.MathUtils.smoothstep((t % 1 - 0.58) / 0.42, 0, 1)
    const von = abschnitt < strecke / 2 ? abschnitt : strecke - abschnitt
    const nach = abschnitt < strecke / 2 ? von + 1 : von - 1
    const stock = geschosse === 1 ? 0 : THREE.MathUtils.lerp(von, nach, anteil)
    kabine.current.position.y = stock * H + PLATTE + 0.02
  })
  const SCHACHT_B = 1.7
  const SCHACHT_T = 1.1
  return (
    <group position={[0, 0, -TIEFE / 2 + 1.1]}>
      <PbrBox args={[2.6, hoehe, 1.2]} position={[0, hoehe / 2, 0]} ordner="brushed-concrete" tint="#b9bcc0" castShadow receiveShadow />
      <group position={[0, 0, 0.6 + SCHACHT_T / 2]}>
        <mesh position={[0, hoehe / 2, 0]}>
          <boxGeometry args={[SCHACHT_B, hoehe, SCHACHT_T]} />
          <meshStandardMaterial color="#cfe0ea" transparent opacity={0.16} roughness={0.05} metalness={0.3} depthWrite={false} />
        </mesh>
        {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[(sx * SCHACHT_B) / 2, hoehe / 2, (sz * SCHACHT_T) / 2]}>
            <boxGeometry args={[0.05, hoehe, 0.05]} />
            <meshStandardMaterial color={FARBE.platte} metalness={0.6} roughness={0.35} />
          </mesh>
        )))}
        <group ref={kabine} position={[0, PLATTE, 0]}>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[SCHACHT_B - 0.14, 0.06, SCHACHT_T - 0.14]} />
            <meshStandardMaterial color={FARBE.platte} metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 2.3, 0]}>
            <boxGeometry args={[SCHACHT_B - 0.14, 0.06, SCHACHT_T - 0.14]} />
            <meshStandardMaterial color="#fff3df" emissive="#ffe2b8" emissiveIntensity={0.7} toneMapped={false} />
          </mesh>
          <mesh position={[0, 1.15, -SCHACHT_T / 2 + 0.1]}>
            <planeGeometry args={[SCHACHT_B - 0.18, 2.25]} />
            <meshStandardMaterial color="#d8cbb6" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.0, -SCHACHT_T / 2 + 0.12]}>
            <planeGeometry args={[SCHACHT_B - 0.3, 0.04]} />
            <meshStandardMaterial color={FARBE.alu} metalness={0.8} roughness={0.25} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function Arbeitsplatz({
  x,
  z,
  an,
  besetzt,
  farbe,
  haar,
  titel = "",
  text = "",
  aussehen,
}: {
  x: number
  z: number
  an: boolean
  besetzt: boolean
  farbe: string
  haar: string
  titel?: string
  text?: string
  aussehen?: Erscheinung
}) {
  return (
    <group position={[x, 0, z]}>
      {besetzt && <Schreibtischlicht an={an} />}
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.04, 0.8]} />
        <meshStandardMaterial color={FARBE.tisch} roughness={0.4} />
      </mesh>
      {[-0.74, 0.74].map((lx) => (
        <mesh key={lx} position={[lx, 0.37, 0]}>
          <boxGeometry args={[0.04, 0.74, 0.7]} />
          <meshStandardMaterial color={FARBE.alu} metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 1.06, -0.25]} castShadow>
        <boxGeometry args={[0.7, 0.42, 0.03]} />
        <meshStandardMaterial color={FARBE.dunkel} roughness={0.3} />
      </mesh>
      {besetzt ? (
        <Bildschirm an={an} titel={titel} text={text} />
      ) : (
        <mesh position={[0, 1.06, -0.234]}>
          <planeGeometry args={[0.66, 0.38]} />
          <meshStandardMaterial color="#1b1f26" roughness={0.3} />
        </mesh>
      )}
      {besetzt && <Tastatur />}
      <mesh position={[0, 0.84, -0.25]}>
        <boxGeometry args={[0.05, 0.2, 0.05]} />
        <meshStandardMaterial color={FARBE.alu} metalness={0.6} roughness={0.35} />
      </mesh>
      <group position={[0, 0, 0.62]}>
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[0.5, 0.08, 0.48]} />
          <meshStandardMaterial color={FARBE.dunkel} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.8, 0.22]} castShadow>
          <boxGeometry args={[0.48, 0.58, 0.06]} />
          <meshStandardMaterial color={FARBE.dunkel} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.44, 8]} />
          <meshStandardMaterial color={FARBE.alu} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      {besetzt && aussehen && <Person farbe={farbe} haar={haar} an={an} aussehen={aussehen} />}
    </group>
  )
}

let lichtkegel: THREE.Texture | null = null
/** Weicher, warmer Lichtfleck – gemalt statt echter Lichtquelle, damit 30 Plätze nichts kosten. */
function lichtkegelTextur() {
  if (lichtkegel || typeof document === "undefined") return lichtkegel
  const c = document.createElement("canvas")
  c.width = c.height = 128
  const ctx = c.getContext("2d")!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, "rgba(255,226,180,1)")
  g.addColorStop(0.45, "rgba(255,214,160,0.45)")
  g.addColorStop(1, "rgba(255,210,150,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  lichtkegel = new THREE.CanvasTexture(c)
  lichtkegel.colorSpace = THREE.SRGBColorSpace
  return lichtkegel
}

function Schreibtischlicht({ an }: { an: boolean }) {
  const textur = useMemo(() => lichtkegelTextur(), [])
  return (
    <group position={[0.62, 0.76, -0.18]}>
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.02, 20]} />
        <meshStandardMaterial color={FARBE.dunkel} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.008, 0.008, 0.4, 8]} />
        <meshStandardMaterial color={FARBE.dunkel} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[-0.12, 0.4, 0.02]} rotation={[0, 0, 1.4]}>
        <cylinderGeometry args={[0.008, 0.008, 0.26, 8]} />
        <meshStandardMaterial color={FARBE.dunkel} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[-0.26, 0.37, 0.02]}>
        <cylinderGeometry args={[0.025, 0.05, 0.07, 20, 1, true]} />
        <meshStandardMaterial color={FARBE.dunkel} roughness={0.4} metalness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.26, 0.34, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.045, 20]} />
        <meshBasicMaterial color="#ffe6bf" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {textur && (
        <mesh position={[-0.42, 0.006, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.3, 1.1]} />
          <meshBasicMaterial map={textur} transparent opacity={an ? 0.55 : 0.35} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

function RaumModell({
  raum,
  gewaehlt,
  zeigeLabel,
  onWahl,
  jetzt,
  innen,
  sprache,
  personIndex,
  onPerson,
}: {
  raum: Raum
  personIndex: number | null
  onPerson: (key: string) => void
  gewaehlt: boolean
  zeigeLabel: boolean
  onWahl: (id: string) => void
  jetzt: number | null
  /** Echtes Ereignis innerhalb dieses Raums (Verbindung zwischen zwei Flächen derselben Abteilung) im Live-Fenster. */
  innen: boolean
  sprache: Sprache
}) {
  const x = raumX(raum)
  const B = raumB(raum)
  const vorne = geradeAnteil(x, B)
  const leer = raum.besetzung === "leer"
  const plaetze = Math.max(raum.agenten.length, 1)
  const innenLicht = useRef<THREE.MeshStandardMaterial>(null)
  const status = useRef<THREE.MeshStandardMaterial>(null)
  const warnt = raum.zustand === "achtung" || raum.zustand === "stoerung"

  useFrame(({ clock }) => {
    if (status.current && warnt) status.current.emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 3) * 0.4
    if (innenLicht.current && innen) innenLicht.current.emissiveIntensity = 0.7 + Math.sin(clock.getElapsedTime() * 2.4) * 0.3
  })

  return (
    <group
      position={[x, 0, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onWahl(raum.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = "pointer"
      }}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <group position={[0, PLATTE, 0]}>
        {Array.from({ length: plaetze }).map((_, i) => {
          const reihe = Math.floor(i / 2)
          const seite = i % 2 === 0 ? -1.3 : 1.3
          const stand = raum.agentenStand[i]
          const an = jetzt !== null && !!stand && agentFrisch(stand, jetzt)
          const px = plaetze === 1 ? 0 : seite
          const pz = -1.2 + reihe * 2.2
          const offen = personIndex === i
          return (
            <group
              key={i}
              onClick={(e) => {
                if (!stand) return
                e.stopPropagation()
                onPerson(`${raum.id}:${i}`)
              }}
            >
              <Arbeitsplatz
                x={px}
                z={pz}
                an={an}
                besetzt={!!stand}
                farbe={(stand?.aussehen.frau ? KLEIDUNG_FRAU : KLEIDUNG)[(raum.etage * 3 + raum.spalte + i) % KLEIDUNG.length]}
                haar={
                  stand?.aussehen.kopftuch
                    ? KOPFTUCH[(raum.etage * 2 + raum.spalte + i) % KOPFTUCH.length]
                    : HAAR[(raum.etage * 2 + raum.spalte * 3 + i * 2 + 1) % HAAR.length]
                }
                titel={stand ? `${stand.vorname} · ${stand.rolle}` : ""}
                text={stand?.ergebnis ?? ""}
                aussehen={stand?.aussehen}
              />
              {stand && !offen && (gewaehlt || an || stand.fehler) && (
                <Html position={[px, 1.68, pz + 0.6]} center zIndexRange={[10, 0]}>
                  <button
                    type="button"
                    aria-label={stand.name}
                    onClick={() => onPerson(`${raum.id}:${i}`)}
                    className="flex size-6 items-center justify-center rounded-full"
                  >
                    <span
                      aria-hidden="true"
                      className={`size-2.5 rounded-full ring-2 ring-card ${stand.fehler ? "bg-destructive" : an ? "animate-pulse bg-primary" : "bg-muted-foreground/60"}`}
                    />
                  </button>
                </Html>
              )}
              {stand && offen && (
                /* Namensschild seitlich neben der Person (rechts vom Stuhl), nie vor dem Gesicht */
                <Html position={[px + (px > 0 ? -0.55 : 0.55), 1.15, pz + 0.6]} distanceFactor={9} zIndexRange={[30, 0]}>
                  <span
                    className={`pointer-events-none flex w-44 -translate-y-1/2 items-start gap-2 rounded-2xl bg-card/95 p-2.5 font-sans text-foreground shadow-md backdrop-blur ${px > 0 ? "-translate-x-full" : ""}`}
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary"
                    >
                      {stand.vorname.charAt(0)}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold leading-tight">
                      {stand.vorname}
                      <span
                        aria-hidden="true"
                        className={`size-1.5 rounded-full ${stand.fehler ? "bg-destructive" : an ? "animate-pulse bg-primary" : "bg-muted-foreground/50"}`}
                      />
                    </span>
                    <span className="text-[10px] font-medium leading-tight text-primary">{stand.rolle}</span>
                    <span className="line-clamp-3 text-[10px] leading-snug text-muted-foreground">
                      {stand.fehler
                        ? sprache === "tr" ? "son çalışma hata verdi" : "letzter Lauf mit Fehler"
                        : stand.ergebnis
                          ? stand.ergebnis
                          : stand.zeit && jetzt !== null
                            ? `${sprache === "tr" ? "son aktif" : "zuletzt aktiv"} ${vorText(stand.zeit, jetzt, sprache)}`
                            : sprache === "tr" ? "henüz çalışma yok" : "noch kein Lauf erfasst"}
                      {stand.ergebnis && stand.zeit && jetzt !== null && !stand.fehler ? ` · ${vorText(stand.zeit, jetzt, sprache)}` : ""}
                    </span>
                    </span>
                  </span>
                </Html>
              )}
            </group>
          )
        })}
        {!leer && (
          <group position={[Math.min(B / 2 - 0.9, 2.6), 0, 2.2]}>
            <Pflanze />
          </group>
        )}
      </group>

      {innen && (
        <mesh position={[0, PLATTE + 0.05, 0.5]}>
          <boxGeometry args={[B - 1.2, 0.02, TIEFE - 3]} />
          <meshStandardMaterial ref={innenLicht} color={FARBE.blau} emissive={FARBE.blau} emissiveIntensity={0.8} transparent opacity={0.18} toneMapped={false} />
        </mesh>
      )}

      <mesh position={[0, H - 0.08, 0.6]}>
        <boxGeometry args={[B * 0.55, 0.04, 1.2]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffe8c8"
          emissiveIntensity={leer ? 0.05 : 0.45}
          toneMapped={false}
        />
      </mesh>

      {leer && (
        <mesh position={[vorne.dx, H / 2 + PLATTE / 2, TIEFE / 2 - 0.08]}>
          <planeGeometry args={[vorne.b, H - PLATTE]} />
          <meshStandardMaterial color="#e9edf2" transparent opacity={0.72} roughness={1} />
        </mesh>
      )}

      <mesh position={[vorne.dx, PLATTE + 0.06, TIEFE / 2 - 0.05]}>
        <boxGeometry args={[vorne.b, 0.05, 0.04]} />
        <meshStandardMaterial
          ref={status}
          color={ZUSTAND_FARBE[raum.zustand]}
          emissive={ZUSTAND_FARBE[raum.zustand]}
          emissiveIntensity={raum.zustand === "ruhig" ? 0.1 : 0.8}
          toneMapped={false}
        />
      </mesh>

      {gewaehlt && (
        <mesh position={[0, PLATTE + 0.05, 0.5]}>
          <boxGeometry args={[B - 1.2, 0.02, TIEFE - 3]} />
          <meshBasicMaterial color={FARBE.blau} transparent opacity={0.12} />
        </mesh>
      )}

      <Html position={[0, H + 0.2, TIEFE / 2]} center distanceFactor={18} zIndexRange={[20, 0]}>
          <button
            type="button"
            tabIndex={zeigeLabel ? 0 : -1}
            onClick={() => onWahl(raum.id)}
            className={`${zeigeLabel ? "flex" : "hidden"} items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 font-sans text-xs shadow-sm backdrop-blur ${
              gewaehlt ? "bg-primary text-primary-foreground" : "bg-card/90 text-foreground"
            }`}
          >
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ background: leer ? "#c3c8d0" : ZUSTAND_FARBE[raum.zustand] }}
            />
            {raum.name}
            {!leer && raum.wert !== "—" && <span className="font-mono opacity-70">{raum.wert}</span>}
          </button>
        </Html>
    </group>
  )
}

function Geschoss({
  etage,
  raeume,
  fokus,
  onRaum,
  onEtage,
  jetzt,
  innenRaeume,
  sprache,
  person,
  onPerson,
}: {
  person: string | null
  onPerson: (key: string) => void
  etage: Etage
  raeume: Raum[]
  fokus: Fokus
  onRaum: (id: string) => void
  onEtage: (i: number) => void
  jetzt: number | null
  innenRaeume: Set<string>
  sprache: Sprache
}) {
  const gruppe = useRef<THREE.Group>(null)
  const basisY = etage.index * H
  const angehoben = fokus.etage !== null && etage.index > fokus.etage
  const imFokus = fokus.etage === etage.index

  useFrame((_, dt) => {
    if (!gruppe.current) return
    const soll = basisY + (angehoben ? ANHEBEN : 0)
    gruppe.current.position.y = THREE.MathUtils.damp(gruppe.current.position.y, soll, 4, dt)
  })

  const glasH = H - PLATTE
  const glasY = H / 2 + PLATTE / 2
  const f = formen()
  const n = Math.max(raeume.length, 1)
  const trenner = Array.from({ length: n - 1 }, (_, k) => -BREITE / 2 + ((k + 1) * BREITE) / n)

  return (
    <group ref={gruppe} position={[0, basisY, 0]}>
      {/* Auskragende, abgerundete Geschossplatte */}
      <mesh geometry={f.platte} rotation={LIEGEND} castShadow receiveShadow>
        <meshStandardMaterial color={FARBE.platte} metalness={0.5} roughness={0.38} />
      </mesh>
      <mesh geometry={f.boden} rotation={LIEGEND} position={[0, PLATTE + 0.025, 0]} receiveShadow>
        <meshStandardMaterial color={FARBE.boden} roughness={0.72} />
      </mesh>

      {/* Holzuntersicht der nächsten Platte + feine warme Lichtfuge an der Kante */}
      <mesh geometry={f.decke} rotation={UNTERSICHT} position={[0, H - 0.025, 0]}>
        <meshStandardMaterial color={FARBE.holz} roughness={0.6} />
      </mesh>
      <mesh geometry={f.lichtfuge} rotation={UNTERSICHT} position={[0, H - 0.03, 0]}>
        <meshStandardMaterial color={FARBE.licht} emissive={FARBE.licht} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      {/* Gedämpftes Grundlicht – das eigentliche Licht kommt von den Arbeitsplatzleuchten */}
      <pointLight position={[0, H - 0.6, 0]} color={FARBE.licht} intensity={6} distance={BREITE * 0.8} decay={1.6} />

      {/* Durchgehende Glashaut rundum, schlanke Pfosten */}
      <mesh geometry={f.glas} rotation={LIEGEND} position={[0, PLATTE + 0.02, 0]}>
        <Glas opacity={imFokus ? 0.08 : 0.2} />
      </mesh>
      <Pfosten y={glasY} hoehe={glasH} />

      {/* Kernwand hinten – endet vor den Rundungen, damit nichts durchs Glas sticht */}
      <PbrBox args={[BREITE - 2 * RUND - 0.4, H - PLATTE, 0.2]} position={[0, H / 2 + PLATTE / 2, -TIEFE / 2 + 0.2]} ordner="brushed-concrete" tint="#eceae6" receiveShadow />

      {trenner.map((x) => (
        <mesh key={x} position={[x, H / 2 + PLATTE / 2, 0.4]}>
          <boxGeometry args={[0.04, H - PLATTE, TIEFE - 3]} />
          <meshStandardMaterial color="#cfe0ea" transparent opacity={0.22} roughness={0.05} metalness={0.2} depthWrite={false} />
        </mesh>
      ))}

      {raeume.map((r) => (
        <RaumModell
          key={r.id}
          raum={r}
          gewaehlt={fokus.raum === r.id}
          zeigeLabel={imFokus && fokus.raum === null}
          onWahl={onRaum}
          jetzt={jetzt}
          innen={innenRaeume.has(r.id)}
          sprache={sprache}
          personIndex={person?.startsWith(`${r.id}:`) ? Number(person.slice(r.id.length + 1)) : null}
          onPerson={onPerson}
        />
      ))}

      <Html position={[-BREITE / 2 - UEBERSTAND - 1.6, H / 2, TIEFE / 2]} center distanceFactor={22} zIndexRange={[20, 0]}>
          <button
            type="button"
            tabIndex={fokus.etage === null ? 0 : -1}
            onClick={() => onEtage(etage.index)}
            className={`${fokus.etage === null ? "flex" : "hidden"} items-center gap-2 whitespace-nowrap rounded-full bg-card/90 px-3 py-1.5 font-sans text-xs text-foreground shadow-sm backdrop-blur`}
          >
            <span className="font-mono text-muted-foreground">{etage.index === 0 ? "EG" : `${etage.index}.OG`}</span>
            {etage.name}
            <span aria-hidden className="size-2 rounded-full" style={{ background: ZUSTAND_FARBE[etage.zustand] }} />
          </button>
        </Html>
    </group>
  )
}

/** Eine Linie zwischen zwei Abteilungs-Gebäuden – nur gerendert, solange das echte Ereignis im Live-Fenster liegt. */
function Verbindung({ von, nach }: { von: THREE.Vector3; nach: THREE.Vector3 }) {
  const linie = useRef<{ material: { dashOffset: number } } | null>(null)
  const mitte = useMemo(() => {
    const m = von.clone().add(nach).multiplyScalar(0.5)
    m.z += 2.5 + von.distanceTo(nach) * 0.15
    return m
  }, [von, nach])
  useFrame((_, dt) => {
    if (linie.current) linie.current.material.dashOffset -= dt * 1.2
  })
  return (
    <QuadraticBezierLine
      ref={linie as never}
      start={von}
      end={nach}
      mid={mitte}
      color={FARBE.blau}
      lineWidth={3}
      dashed
      dashScale={4}
      dashSize={1}
      gapSize={0.6}
      transparent
      opacity={0.9}
    />
  )
}

function Verbindungen({ faeden, raeume, fokus, jetzt }: { faeden: LiveFaden[]; raeume: Raum[]; fokus: Fokus; jetzt: number | null }) {
  if (jetzt === null) return null
  const sichtbar = faeden.filter((f) => f.raumVon !== f.raumNach && fadenLive(f.zeit, jetzt))
  return (
    <>
      {sichtbar.map((f) => {
        const a = raeume.find((r) => r.id === f.raumVon)
        const b = raeume.find((r) => r.id === f.raumNach)
        if (!a || !b) return null
        // Angehobene Geschosse (über dem Fokus) bewegen sich – dort wäre die Linie falsch verankert.
        if (fokus.etage !== null && (a.etage > fokus.etage || b.etage > fokus.etage)) return null
        const punkt = (r: Raum) => new THREE.Vector3(raumX(r), r.etage * H + H / 2 + PLATTE / 2, TIEFE / 2 + 0.3)
        return <Verbindung key={`${f.von}>${f.nach}`} von={punkt(a)} nach={punkt(b)} />
      })}
    </>
  )
}

function Dach({ y, angehoben }: { y: number; angehoben: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, y + (angehoben ? ANHEBEN : 0), 4, dt)
  })
  return (
    <group ref={ref} position={[0, y, 0]}>
      <mesh geometry={formen().dach} rotation={LIEGEND} castShadow receiveShadow>
        <meshStandardMaterial color={FARBE.platte} metalness={0.5} roughness={0.38} />
      </mesh>
      {/* Glatte, leere Dachfläche – nichts steht oben drauf */}
      <mesh geometry={formen().dachflaeche} rotation={LIEGEND} position={[0, PLATTE + 0.005, 0]} receiveShadow>
        <meshStandardMaterial color="#3a3f47" roughness={0.6} metalness={0.3} />
      </mesh>
    </group>
  )
}

function Umgebung() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#6f9a4f" roughness={1} />
      </mesh>
      {/* Heller Sockelplatz direkt ums Gebäude */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
        <planeGeometry args={[BREITE + 4, TIEFE + 4]} />
        <meshStandardMaterial color="#f2f3f1" roughness={0.85} />
      </mesh>
      <Wege />
      {BAUM_X.map((x, i) => (
        <group key={x} position={[x, 0, TIEFE / 2 + (i > 3 ? 2 : 8)]} scale={i > 3 ? 1.25 : 1} rotation={[0, i * 1.3, 0]}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.16, 2.8, 10]} />
            <meshStandardMaterial color="#5a4a3a" roughness={0.95} />
          </mesh>
          {BAEUME[i].map((k, j) => (
            <mesh key={j} position={k.pos} scale={[1, 0.88, 1]} castShadow>
              <sphereGeometry args={[k.r, 18, 14]} />
              <meshStandardMaterial color={k.farbe} roughness={0.95} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}

export default function Hauptsitz3D({
  etagen,
  raeume,
  fokus,
  onRaum,
  onEtage,
  onLeer,
  faeden,
  sprache,
  steuer,
}: {
  steuer?: MutableRefObject<Steuer | null>
  etagen: Etage[]
  raeume: Raum[]
  fokus: Fokus
  onRaum: (id: string) => void
  onEtage: (i: number) => void
  onLeer: () => void
  faeden: LiveFaden[]
  sprache: Sprache
}) {
  const hoehe = etagen.length * H
  const jetzt = useJetzt()
  const innenRaeume = useMemo(
    () => new Set(jetzt === null ? [] : faeden.filter((f) => f.raumVon === f.raumNach && fadenLive(f.zeit, jetzt)).map((f) => f.raumVon)),
    [faeden, jetzt],
  )
  const [person, setPerson] = useState<string | null>(null)
  const sichtbarePerson = person && fokus.raum && person.startsWith(`${fokus.raum}:`) ? person : null
  const waehlePerson = (key: string) => {
    const raumId = key.slice(0, key.lastIndexOf(":"))
    setPerson((p) => (p === key ? null : key))
    if (fokus.raum !== raumId) onRaum(raumId)
  }
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [50, 28, 58], fov: 32, near: 0.5, far: 400 }}
      onPointerMissed={() => {
        setPerson(null)
        onLeer()
      }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#d3dce6"]} />
      <fog attach="fog" args={["#d3dce6", 90, 200]} />
      <hemisphereLight args={["#eef3f8", "#b9bcc2", 0.5]} />
      <directionalLight
        position={[24, 40, 28]}
        color="#fff4e6"
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0004}
      />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2} position={[0, 10, -12]} scale={[30, 8, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-14, 4, 6]} rotation-y={Math.PI / 2} scale={[20, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[14, 4, 6]} rotation-y={-Math.PI / 2} scale={[20, 6, 1]} />
        <Lightformer form="ring" intensity={1.5} position={[0, 18, 0]} rotation-x={Math.PI / 2} scale={12} />
      </Environment>

      <Umgebung />
      <Gehirn hoehe={hoehe} />
      {etagen.map((e) => (
        <Geschoss
          key={e.index}
          etage={e}
          raeume={raeume.filter((r) => r.etage === e.index)}
          fokus={fokus}
          onRaum={onRaum}
          onEtage={onEtage}
          jetzt={jetzt}
          innenRaeume={innenRaeume}
          sprache={sprache}
          person={sichtbarePerson}
          onPerson={waehlePerson}
        />
      ))}
      <Verbindungen faeden={faeden} raeume={raeume} fokus={fokus} jetzt={jetzt} />
      <Dach y={hoehe} angehoben={fokus.etage !== null} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={60} blur={2.4} far={20} />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={MIN_ABSTAND}
        maxDistance={MAX_ABSTAND}
        maxPolarAngle={Math.PI / 2.15}
        zoomSpeed={0.6}
        enablePan
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: null } as never}
      />
      <Kamera fokus={fokus} raeume={raeume} />
      <TouchGesten />
      <Steuerung steuer={steuer} />

      {/* Tone Mapping läuft hier im Composer (ACES Filmic), nicht mehr über den Renderer */}
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <N8AO aoRadius={1.4} distanceFalloff={1.2} intensity={2.2} quality="medium" halfRes />
        <Bloom intensity={0.2} luminanceThreshold={0.9} luminanceSmoothing={0.2} mipmapBlur />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.35} darkness={0.3} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  )
}
