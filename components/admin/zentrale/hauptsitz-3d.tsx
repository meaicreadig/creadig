"use client"

import { useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Environment, Html, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei"
import * as THREE from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import type { Etage, Raum } from "@/lib/zentrale/hauptsitz"
import type { Zustand } from "@/lib/zentrale/netz"

/* Maße in Metern — echtes Bürogeschoss: 3,6 m Geschosshöhe, 7 m Raumbreite. */
const H = 3.6
const RAUM_B = 7
const BREITE = RAUM_B * 3
const TIEFE = 10
const PLATTE = 0.35
const ANHEBEN = 9

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

function Gehirn({ hoehe }: { hoehe: number }) {
  const puls = useRef<THREE.Mesh>(null)
  const kern = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (puls.current) puls.current.position.y = ((t * 3) % hoehe) + 0.2
    if (kern.current) kern.current.emissiveIntensity = 0.55 + Math.sin(t * 1.6) * 0.15
  })
  return (
    <group position={[0, 0, -TIEFE / 2 + 1.3]}>
      <mesh position={[0, hoehe / 2, 0]} castShadow>
        <boxGeometry args={[2.2, hoehe, 1.6]} />
        <meshStandardMaterial color={FARBE.betonDunkel} roughness={0.85} />
      </mesh>
      <mesh position={[0, hoehe / 2, 0.81]}>
        <planeGeometry args={[0.18, hoehe]} />
        <meshStandardMaterial ref={kern} color={FARBE.blau} emissive={FARBE.blau} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      <mesh ref={puls} position={[0, 1, 0.83]}>
        <planeGeometry args={[0.5, 0.9]} />
        <meshBasicMaterial color="#9fb6ff" transparent opacity={0.85} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Arbeitsplatz({ x, z, an }: { x: number; z: number; an: boolean }) {
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
      <mesh position={[0, 1.06, -0.234]}>
        <planeGeometry args={[0.66, 0.38]} />
        <meshStandardMaterial
          color={an ? "#dfe7ff" : "#1b1f26"}
          emissive={an ? FARBE.blau : "#000000"}
          emissiveIntensity={an ? 0.9 : 0}
          toneMapped={!an}
        />
      </mesh>
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
    </group>
  )
}

function RaumModell({
  raum,
  gewaehlt,
  zeigeLabel,
  onWahl,
}: {
  raum: Raum
  gewaehlt: boolean
  zeigeLabel: boolean
  onWahl: (id: string) => void
}) {
  const x = raumX(raum.spalte)
  const leer = raum.besetzung === "leer"
  const plaetze = Math.max(raum.agenten.length, leer ? 2 : 1)
  const status = useRef<THREE.MeshStandardMaterial>(null)
  const warnt = raum.zustand === "achtung" || raum.zustand === "stoerung"

  useFrame(({ clock }) => {
    if (status.current && warnt) status.current.emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 3) * 0.4
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
      <mesh position={[0, PLATTE / 2 + 0.005, 0.6]} receiveShadow>
        <boxGeometry args={[RAUM_B - 0.1, 0.01, TIEFE - 2.6]} />
        <meshStandardMaterial color={leer ? "#bdbab4" : FARBE.boden} roughness={0.95} />
      </mesh>

      <group position={[0, PLATTE, 0]}>
        {Array.from({ length: plaetze }).map((_, i) => {
          const reihe = Math.floor(i / 2)
          const seite = i % 2 === 0 ? -1.3 : 1.3
          return <Arbeitsplatz key={i} x={plaetze === 1 ? 0 : seite} z={-1.2 + reihe * 2.2} an={!leer && i < raum.agenten.length} />
        })}
        {!leer && (
          <mesh position={[RAUM_B / 2 - 0.9, 0.55, 2.6]} castShadow>
            <cylinderGeometry args={[0.22, 0.3, 1.1, 12]} />
            <meshStandardMaterial color="#4f6b4a" roughness={0.9} />
          </mesh>
        )}
      </group>

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
}: {
  etage: Etage
  raeume: Raum[]
  fokus: Fokus
  onRaum: (id: string) => void
  onEtage: (i: number) => void
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

  const pfosten = useMemo(() => {
    const xs: number[] = []
    for (let x = -BREITE / 2; x <= BREITE / 2 + 0.01; x += 1.5) xs.push(x)
    return xs
  }, [])

  return (
    <group ref={gruppe} position={[0, basisY, 0]}>
      <RoundedBox args={[BREITE + 0.6, PLATTE, TIEFE + 0.6]} radius={0.04} smoothness={2} position={[0, PLATTE / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={FARBE.beton} roughness={0.8} />
      </RoundedBox>

      <mesh position={[0, H / 2 + PLATTE / 2, -TIEFE / 2 + 0.1]} receiveShadow>
        <boxGeometry args={[BREITE, H - PLATTE, 0.2]} />
        <meshStandardMaterial color="#e4e6ea" roughness={0.9} />
      </mesh>

      {[-RAUM_B / 2, RAUM_B / 2].map((x) => (
        <mesh key={x} position={[x, H / 2 + PLATTE / 2, 0.6]}>
          <boxGeometry args={[0.04, H - PLATTE, TIEFE - 2.6]} />
          <meshStandardMaterial color="#cfe0ea" transparent opacity={0.28} roughness={0.05} metalness={0.2} />
        </mesh>
      ))}

      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * BREITE) / 2, H / 2 + PLATTE / 2, 0]}>
          <boxGeometry args={[0.05, H - PLATTE, TIEFE]} />
          <meshStandardMaterial color="#bcd3e0" transparent opacity={0.22} roughness={0.05} metalness={0.3} />
        </mesh>
      ))}

      <mesh position={[0, H / 2 + PLATTE / 2, TIEFE / 2]}>
        <boxGeometry args={[BREITE, H - PLATTE, 0.04]} />
        <meshStandardMaterial color="#bcd3e0" transparent opacity={imFokus ? 0.08 : 0.2} roughness={0.04} metalness={0.3} />
      </mesh>
      {pfosten.map((x) => (
        <mesh key={x} position={[x, H / 2 + PLATTE / 2, TIEFE / 2 + 0.03]} castShadow>
          <boxGeometry args={[0.06, H - PLATTE, 0.1]} />
          <meshStandardMaterial color={FARBE.alu} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}

      {raeume.map((r) => (
        <RaumModell
          key={r.id}
          raum={r}
          gewaehlt={fokus.raum === r.id}
          zeigeLabel={imFokus && fokus.raum === null}
          onWahl={onRaum}
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

function Dach({ y, angehoben }: { y: number; angehoben: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, y + (angehoben ? ANHEBEN : 0), 4, dt)
  })
  return (
    <group ref={ref} position={[0, y, 0]}>
      <mesh position={[0, PLATTE / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[BREITE + 0.6, PLATTE, TIEFE + 0.6]} />
        <meshStandardMaterial color={FARBE.beton} roughness={0.8} />
      </mesh>
      <mesh position={[0, PLATTE + 0.45, TIEFE / 2 + 0.25]}>
        <boxGeometry args={[BREITE + 0.6, 0.9, 0.1]} />
        <meshStandardMaterial color="#bcd3e0" transparent opacity={0.3} metalness={0.3} roughness={0.05} />
      </mesh>
      {[
        [-6, 1.6, -2],
        [-2.5, 1.2, -2.6],
        [5.5, 1.4, -1.5],
      ].map(([x, s, z]) => (
        <mesh key={x} position={[x, PLATTE + s / 2, z]} castShadow>
          <boxGeometry args={[s * 1.6, s, s]} />
          <meshStandardMaterial color="#c7cbd2" roughness={0.6} metalness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function Umgebung() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#e7e9ec" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 4]} receiveShadow>
        <planeGeometry args={[BREITE + 14, TIEFE + 18]} />
        <meshStandardMaterial color="#d6d8dc" roughness={0.9} />
      </mesh>
      {[-12, -6, 6, 12].map((x) => (
        <group key={x} position={[x, 0, TIEFE / 2 + 7]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 2.4, 8]} />
            <meshStandardMaterial color="#6b5a47" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3, 0]} castShadow>
            <sphereGeometry args={[1.3, 16, 12]} />
            <meshStandardMaterial color="#6f8a63" roughness={0.95} />
          </mesh>
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
}: {
  etagen: Etage[]
  raeume: Raum[]
  fokus: Fokus
  onRaum: (id: string) => void
  onEtage: (i: number) => void
  onLeer: () => void
}) {
  const hoehe = etagen.length * H
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [44, 30, 50], fov: 32, near: 0.5, far: 400 }}
      onPointerMissed={onLeer}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#eef1f5"]} />
      <fog attach="fog" args={["#eef1f5", 70, 160]} />
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
      <Gehirn hoehe={hoehe + 1.2} />
      {etagen.map((e) => (
        <Geschoss
          key={e.index}
          etage={e}
          raeume={raeume.filter((r) => r.etage === e.index)}
          fokus={fokus}
          onRaum={onRaum}
          onEtage={onEtage}
        />
      ))}
      <Dach y={hoehe} angehoben={fokus.etage !== null} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={60} blur={2.4} far={20} />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={8}
        maxDistance={95}
        maxPolarAngle={Math.PI / 2.15}
        enablePan
      />
      <Kamera fokus={fokus} raeume={raeume} />
    </Canvas>
  )
}
