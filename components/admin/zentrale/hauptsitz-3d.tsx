"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Environment, Html, Lightformer, OrbitControls, QuadraticBezierLine, useTexture } from "@react-three/drei"
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing"
import { ToneMappingMode } from "postprocessing"
import * as THREE from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import type { Etage, Raum } from "@/lib/zentrale/hauptsitz"
import type { Zustand } from "@/lib/zentrale/netz"
import { useJetzt } from "./use-jetzt"
import { agentFrisch, fadenLive, vorText, type LiveFaden } from "@/lib/zentrale/aktivitaet"
import type { Sprache } from "@/lib/zentrale/netz-karte"

/* Maße in Metern — echtes Bürogeschoss: 3,6 m Geschosshöhe, 7 m Raumbreite. */
const H = 3.6
const RAUM_B = 7
const BREITE = RAUM_B * 3
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
  glas: "#6fa6bd",
}

const KLEIDUNG = ["#2f3a4c", "#6b7686", "#e6e2da", "#44505f", "#8a6f5a"]
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

/* Organisches Außenskelett (Vorbild: Glass Cube, Bad Driburg) – weiße Rahmenfläche mit weich gerundeten Glasöffnungen. */
const RAHMEN_T = 0.32

function rundesLoch(pfad: THREE.Path, ecken: THREE.Vector2[], radien: number[]) {
  const n = ecken.length
  ecken.forEach((p, i) => {
    const vor = ecken[(i - 1 + n) % n]
    const nach = ecken[(i + 1) % n]
    const r = Math.min(radien[i], p.distanceTo(vor) * 0.45, p.distanceTo(nach) * 0.45)
    const a = p.clone().add(vor.clone().sub(p).setLength(r))
    const b = p.clone().add(nach.clone().sub(p).setLength(r))
    if (i === 0) pfad.moveTo(a.x, a.y)
    else pfad.lineTo(a.x, a.y)
    pfad.quadraticCurveTo(p.x, p.y, b.x, b.y)
  })
  pfad.closePath()
}

function organischerRahmen(breite: number, etagen: number, spalten: number, seed: number) {
  const r = zufall(seed)
  const hoehe = etagen * H + PLATTE + 0.25
  const form = new THREE.Shape()
  form.moveTo(-breite / 2, 0)
  form.lineTo(breite / 2, 0)
  form.lineTo(breite / 2, hoehe)
  form.lineTo(-breite / 2, hoehe)
  form.closePath()
  const innen = breite - 0.7
  const feld = innen / spalten
  // Knotenpunkte je Geschossgrenze leicht versetzt → schräge, fließende Stege statt starrem Raster.
  const knoten = Array.from({ length: etagen + 1 }, () =>
    Array.from({ length: spalten + 1 }, (_, i) => {
      const basis = -innen / 2 + i * feld
      return i === 0 || i === spalten ? basis : basis + (r() - 0.5) * feld * 0.5
    }),
  )
  const steg = 0.18
  for (let e = 0; e < etagen; e++) {
    const y0 = e * H + PLATTE + 0.1
    const y1 = (e + 1) * H - 0.05
    for (let i = 0; i < spalten; i++) {
      const ecken = [
        new THREE.Vector2(knoten[e][i] + steg, y0),
        new THREE.Vector2(knoten[e][i + 1] - steg, y0),
        new THREE.Vector2(knoten[e + 1][i + 1] - steg, y1),
        new THREE.Vector2(knoten[e + 1][i] + steg, y1),
      ]
      const loch = new THREE.Path()
      rundesLoch(loch, ecken, ecken.map(() => 0.35 + r() * 1.15))
      form.holes.push(loch)
    }
  }
  return new THREE.ExtrudeGeometry(form, {
    depth: RAHMEN_T,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 3,
    curveSegments: 12,
  })
}

function Rahmen({ etagen }: { etagen: number }) {
  const front = useMemo(() => organischerRahmen(BREITE + 1.2, etagen, 6, 101), [etagen])
  const seite = useMemo(() => organischerRahmen(TIEFE + 0.6, etagen, 3, 202), [etagen])
  const weiss = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#f6f7f8", roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.2 }),
    [],
  )
  return (
    <group>
      <mesh geometry={front} material={weiss} position={[0, 0, TIEFE / 2 + 0.3]} castShadow receiveShadow />
      <mesh geometry={seite} material={weiss} position={[BREITE / 2 + 0.3, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow />
      <mesh geometry={seite} material={weiss} position={[-BREITE / 2 - 0.3, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow receiveShadow />
    </group>
  )
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
function Hand({ finger, seite }: { finger: React.MutableRefObject<(THREE.Group | null)[]>; seite: number }) {
  return (
    <group>
      <mesh position={[0, -0.045, 0]} castShadow>
        <boxGeometry args={[0.075, 0.08, 0.026]} />
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

function Arm({ x, farbe, an, phase, seite }: { x: number; farbe: string; an: boolean; phase: number; seite: number }) {
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
        <mesh castShadow>
          <sphereGeometry args={[0.055, 10, 8]} />
          <meshStandardMaterial color={farbe} roughness={0.85} />
        </mesh>
        <mesh position={[0, -OBERARM / 2, 0]} castShadow>
          <capsuleGeometry args={[0.048, OBERARM - 0.06, 4, 10]} />
          <meshStandardMaterial color={farbe} roughness={0.85} />
        </mesh>
        <group ref={ellbogen} position={[0, -OBERARM, 0]} rotation={[1.25, 0, 0]}>
          <mesh position={[0, -UNTERARM / 2, 0]} castShadow>
            <capsuleGeometry args={[0.04, UNTERARM - 0.05, 4, 10]} />
            <meshStandardMaterial color={farbe} roughness={0.85} />
          </mesh>
          <mesh position={[0, -UNTERARM + 0.01, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.032, 0.03, 10]} />
            <meshStandardMaterial color={HAUT} roughness={0.7} />
          </mesh>
          <group position={[0, -UNTERARM, 0]}>
            <Hand finger={finger} seite={seite} />
          </group>
        </group>
      </group>
    </group>
  )
}

function Person({ farbe, haar, an }: { farbe: string; haar: string; an: boolean }) {
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
  return (
    <group position={[0, 0, 0.6]}>
      <group ref={koerper} position={[0, 0.6, 0]}>
        {/* Rumpf: Brustkorb breiter, Taille schmaler */}
        <mesh position={[0, 0.36, 0.04]} scale={[1, 1, 0.72]} castShadow>
          <capsuleGeometry args={[0.17, 0.3, 6, 16]} />
          <meshStandardMaterial color={farbe} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.06, 0.03]} scale={[1, 1, 0.75]} castShadow>
          <sphereGeometry args={[0.16, 14, 10]} />
          <meshStandardMaterial color={HOSE} roughness={0.9} />
        </mesh>
      </group>
      <mesh position={[0, 1.18, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.055, 0.1, 10]} />
        <meshStandardMaterial color={HAUT} roughness={0.7} />
      </mesh>
      <group ref={kopf} position={[0, 1.3, -0.02]}>
        <mesh position={[0, 0.08, 0]} scale={[0.92, 1.08, 1]} castShadow>
          <sphereGeometry args={[0.11, 20, 16]} />
          <meshStandardMaterial color={HAUT} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.06, -0.105]} rotation={[-0.3, 0, 0]}>
          <coneGeometry args={[0.016, 0.04, 8]} />
          <meshStandardMaterial color={HAUT} roughness={0.7} />
        </mesh>
        {[-0.1, 0.1].map((ox) => (
          <mesh key={ox} position={[ox, 0.07, 0]} scale={[0.4, 1, 0.7]}>
            <sphereGeometry args={[0.03, 8, 6]} />
            <meshStandardMaterial color={HAUT} roughness={0.7} />
          </mesh>
        ))}
        {/* Haare: Kappe über Oberkopf und Hinterkopf, Gesicht (−z) bleibt frei */}
        <mesh position={[0, 0.095, 0.02]} rotation={[0.45, 0, 0]} castShadow>
          <sphereGeometry args={[0.122, 20, 14, 0, Math.PI * 2, 0, 1.85]} />
          <meshStandardMaterial color={haar} roughness={0.9} />
        </mesh>
      </group>
      {[-0.09, 0.09].map((lx) => (
        <group key={lx} position={[lx, 0, 0]}>
          <mesh position={[0, 0.58, -0.18]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.072, 0.3, 4, 10]} />
            <meshStandardMaterial color={HOSE} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.32, -0.4]} castShadow>
            <capsuleGeometry args={[0.058, 0.36, 4, 10]} />
            <meshStandardMaterial color={HOSE} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.04, -0.46]} castShadow>
            <boxGeometry args={[0.1, 0.07, 0.22]} />
            <meshStandardMaterial color="#1c1f24" roughness={0.5} />
          </mesh>
        </group>
      ))}
      <Arm x={-0.2} farbe={farbe} an={an} phase={phase} seite={-1} />
      <Arm x={0.2} farbe={farbe} an={an} phase={phase + 0.8} seite={1} />
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

const raumX = (spalte: number) => (spalte - 1) * RAUM_B

function Kamera({ fokus, raeume }: { fokus: Fokus; raeume: Raum[] }) {
  const { camera } = useThree()
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null
  const fliegt = useRef(true)
  const ziel = useMemo(() => {
    const raum = raeume.find((r) => r.id === fokus.raum)
    if (raum) {
      const y = raum.etage * H + 1.4
      const x = raumX(raum.spalte)
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

function Gehirn({ hoehe, fokus }: { hoehe: number; fokus: Fokus }) {
  const puls = useRef<THREE.Mesh>(null)
  const kern = useRef<THREE.MeshStandardMaterial>(null)
  const oben = useRef<THREE.Group>(null)
  const schaft = useRef<THREE.Mesh>(null)
  const streifen = useRef<THREE.Mesh>(null)
  const lift = useRef(0)
  const angehoben = fokus.etage !== null
  const yTop = fokus.etage === null ? hoehe : Math.min((fokus.etage + 1) * H, hoehe)
  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    lift.current = THREE.MathUtils.damp(lift.current, angehoben ? ANHEBEN : 0, 4, dt)
    const l = lift.current
    if (oben.current) oben.current.position.y = l
    if (schaft.current) schaft.current.visible = l > 0.02
    const gesamt = hoehe + l
    if (streifen.current) {
      streifen.current.scale.y = gesamt
      streifen.current.position.y = gesamt / 2
    }
    if (puls.current) puls.current.position.y = ((t * 3) % gesamt) + 0.2
    if (kern.current) kern.current.emissiveIntensity = 0.55 + Math.sin(t * 1.6) * 0.15
  })
  return (
    <group position={[0, 0, -TIEFE / 2 + 1.3]}>
      <PbrBox args={[2.2, yTop, 1.6]} position={[0, yTop / 2, 0]} ordner="brushed-concrete" tint="#9ea4ad" castShadow receiveShadow />
      <group ref={oben}>
        <PbrBox args={[2.2, hoehe - yTop, 1.6]} position={[0, yTop + (hoehe - yTop) / 2, 0]} ordner="brushed-concrete" tint="#9ea4ad" castShadow receiveShadow />
        {/* Schaftstück: wandert mit dem oberen Segment und überbrückt die Lücke zum stehenden Teil */}
        <PbrBox ref={schaft} args={[2.204, ANHEBEN, 1.604]} position={[0, yTop - ANHEBEN / 2, 0]} ordner="brushed-concrete" tint="#9ea4ad" castShadow />
      </group>
      <mesh ref={streifen} position={[0, hoehe / 2, 0.81]}>
        <planeGeometry args={[0.18, 1]} />
        <meshStandardMaterial ref={kern} color={FARBE.blau} emissive={FARBE.blau} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      <mesh ref={puls} position={[0, 1, 0.83]}>
        <planeGeometry args={[0.5, 0.9]} />
        <meshBasicMaterial color="#9fb6ff" transparent opacity={0.85} toneMapped={false} />
      </mesh>
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
}: {
  x: number
  z: number
  an: boolean
  besetzt: boolean
  farbe: string
  haar: string
  titel?: string
  text?: string
}) {
  return (
    <group position={[x, 0, z]}>
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
      {besetzt && <Person farbe={farbe} haar={haar} an={an} />}
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
  const x = raumX(raum.spalte)
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
      <PbrBox args={[RAUM_B - 0.1, 0.01, TIEFE - 2.6]} position={[0, PLATTE / 2 + 0.005, 0.6]} ordner="smooth-concrete" tint={leer ? "#bdbab4" : FARBE.boden} receiveShadow />

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
              <Arbeitsplatz x={px} z={pz} an={an} besetzt={!!stand} farbe={KLEIDUNG[(raum.etage * 3 + raum.spalte + i) % KLEIDUNG.length]} haar={HAAR[(raum.etage * 2 + raum.spalte * 3 + i * 2 + 1) % HAAR.length]} titel={stand?.name ?? ""} text={stand?.ergebnis ?? ""} />
              {stand && !offen && (gewaehlt || an || stand.fehler) && (
                <Html position={[px, 1.5, pz]} center zIndexRange={[10, 0]}>
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
                <Html position={[px, 1.75, pz]} center distanceFactor={10} zIndexRange={[30, 0]}>
                  <span className="pointer-events-none flex max-w-56 flex-col gap-0.5 rounded-2xl bg-card/95 px-3 py-1.5 font-sans text-foreground shadow-sm backdrop-blur">
                    <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold">
                      <span
                        aria-hidden="true"
                        className={`size-1.5 rounded-full ${stand.fehler ? "bg-destructive" : an ? "animate-pulse bg-primary" : "bg-muted-foreground/50"}`}
                      />
                      {stand.name}
                    </span>
                    <span className="text-[10px] leading-snug text-muted-foreground">
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
                </Html>
              )}
            </group>
          )
        })}
        {!leer && (
          <group position={[RAUM_B / 2 - 0.9, 0, 2.6]}>
            <Pflanze />
          </group>
        )}
      </group>

      {innen && (
        <mesh position={[0, PLATTE + 0.02, 0.6]}>
          <boxGeometry args={[RAUM_B - 0.2, 0.02, TIEFE - 2.8]} />
          <meshStandardMaterial ref={innenLicht} color={FARBE.blau} emissive={FARBE.blau} emissiveIntensity={0.8} transparent opacity={0.18} toneMapped={false} />
        </mesh>
      )}

      <mesh position={[0, H - 0.08, 0.6]}>
        <boxGeometry args={[RAUM_B * 0.55, 0.04, 1.2]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fff6e6"
          emissiveIntensity={leer ? 0.05 : 1.1}
          toneMapped={false}
        />
      </mesh>

      {leer && (
        <mesh position={[0, H / 2 + PLATTE / 2, TIEFE / 2 - 0.12]}>
          <planeGeometry args={[RAUM_B - 0.2, H - PLATTE]} />
          <meshStandardMaterial color="#e9edf2" transparent opacity={0.72} roughness={1} />
        </mesh>
      )}

      <mesh position={[0, PLATTE + 0.03, TIEFE / 2 - 0.02]}>
        <boxGeometry args={[RAUM_B - 0.6, 0.05, 0.04]} />
        <meshStandardMaterial
          ref={status}
          color={ZUSTAND_FARBE[raum.zustand]}
          emissive={ZUSTAND_FARBE[raum.zustand]}
          emissiveIntensity={raum.zustand === "ruhig" ? 0.1 : 0.8}
          toneMapped={false}
        />
      </mesh>

      {gewaehlt && (
        <mesh position={[0, PLATTE + 0.02, 0.6]}>
          <boxGeometry args={[RAUM_B - 0.2, 0.02, TIEFE - 2.8]} />
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
  const SEITE_X = BREITE / 2

  return (
    <group ref={gruppe} position={[0, basisY, 0]}>
      <PbrBox args={[BREITE + 0.6, PLATTE, TIEFE + 0.6]} position={[0, PLATTE / 2, 0]} ordner="smooth-concrete" tint="#f2f3f5" castShadow receiveShadow />

      {/* Geschossdecke innen hell (gebürsteter Beton), Kante außen dunkel wie eine echte Fassadenblende */}
      <PbrBox args={[BREITE - 0.1, 0.06, TIEFE - 0.5]} position={[0, H - 0.03, -0.2]} ordner="brushed-concrete" tint="#f1f1ef" />

      {/* Rahmenlose Glashaut – das organische Außenskelett (Rahmen) liegt davor */}
      {[-1, 1].map((s) => (
        <mesh key={`seite${s}`} position={[s * SEITE_X, glasY, 0]}>
          <boxGeometry args={[0.03, glasH, TIEFE]} />
          <Glas opacity={0.3} />
        </mesh>
      ))}

      {/* Rückwand */}
      <PbrBox args={[BREITE, H - PLATTE, 0.2]} position={[0, H / 2 + PLATTE / 2, -TIEFE / 2 + 0.1]} ordner="brushed-concrete" tint="#f1f2f4" receiveShadow />

      {[-RAUM_B / 2, RAUM_B / 2].map((x) => (
        <mesh key={x} position={[x, H / 2 + PLATTE / 2, 0.6]}>
          <boxGeometry args={[0.04, H - PLATTE, TIEFE - 2.6]} />
          <meshStandardMaterial color="#cfe0ea" transparent opacity={0.28} roughness={0.05} metalness={0.2} />
        </mesh>
      ))}

      {/* Frontfassade */}
      <mesh position={[0, glasY, TIEFE / 2]}>
        <boxGeometry args={[BREITE, glasH, 0.03]} />
        <Glas opacity={imFokus ? 0.1 : 0.26} />
      </mesh>

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

      <Html position={[-BREITE / 2 - 1.2, H / 2, TIEFE / 2]} center distanceFactor={22} zIndexRange={[20, 0]}>
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
        const punkt = (r: Raum) => new THREE.Vector3(raumX(r.spalte), r.etage * H + H / 2 + PLATTE / 2, TIEFE / 2 + 0.3)
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
      <PbrBox args={[BREITE + 0.6, PLATTE + 0.25, TIEFE + 0.6]} position={[0, PLATTE / 2, 0]} ordner="smooth-concrete" tint="#f4f5f7" castShadow receiveShadow />
      <PbrBox args={[BREITE + 0.2, 0.02, TIEFE + 0.2]} position={[0, PLATTE + 0.26, 0]} ordner="brushed-concrete" tint="#e6e8eb" receiveShadow />
      {[
        [-6, 1.5, -2],
        [-2.2, 1.1, -2.6],
        [5.5, 1.3, -1.5],
      ].map(([x, s, z]) => (
        <group key={x} position={[x, PLATTE + 0.27, z]}>
          <mesh position={[0, s / 2, 0]} castShadow>
            <boxGeometry args={[s * 1.6, s, s]} />
            <meshStandardMaterial color="#b4b8be" roughness={0.45} metalness={0.55} />
          </mesh>
          <mesh position={[0, s + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[s * 0.32, 24]} />
            <meshStandardMaterial color="#2f343b" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Photovoltaik-Felder */}
      {[-8, -5.6, 1, 3.4].map((x) => (
        <mesh key={`pv${x}`} position={[x, PLATTE + 0.55, 2.4]} rotation={[-0.35, 0, 0]} castShadow>
          <boxGeometry args={[2.1, 0.05, 1.3]} />
          <meshStandardMaterial color="#1f2a3d" roughness={0.25} metalness={0.6} />
        </mesh>
      ))}
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
}: {
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
      camera={{ position: [44, 30, 50], fov: 32, near: 0.5, far: 400 }}
      onPointerMissed={() => {
        setPerson(null)
        onLeer()
      }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#dfe9f2"]} />
      <fog attach="fog" args={["#dfe9f2", 80, 180]} />
      <hemisphereLight args={["#ffffff", "#c9ccd2", 0.55]} />
      <directionalLight
        position={[24, 40, 28]}
        intensity={1.6}
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
      <Gehirn hoehe={hoehe + 1.2} fokus={fokus} />
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
      <Rahmen etagen={etagen.length} />
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

      {/* Tone Mapping läuft hier im Composer (ACES Filmic), nicht mehr über den Renderer */}
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <N8AO aoRadius={1.4} distanceFalloff={1.2} intensity={2.2} quality="medium" halfRes />
        <Bloom intensity={0.45} luminanceThreshold={0.75} luminanceSmoothing={0.25} mipmapBlur />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.35} darkness={0.3} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  )
}
