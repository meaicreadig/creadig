"use client"

import { useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Environment, Html, Lightformer, OrbitControls, QuadraticBezierLine, RoundedBox } from "@react-three/drei"
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
  anthrazit: "#3b4048",
  glas: "#8fa7b8",
}

const KLEIDUNG = ["#2f3a4c", "#6b7686", "#e6e2da", "#44505f", "#8a6f5a"]

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

function Person({ farbe }: { farbe: string }) {
  return (
    <group position={[0, 0, 0.6]}>
      <mesh position={[0, 0.92, 0.04]} castShadow>
        <capsuleGeometry args={[0.17, 0.36, 4, 12]} />
        <meshStandardMaterial color={farbe} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.38, -0.02]} castShadow>
        <sphereGeometry args={[0.11, 16, 12]} />
        <meshStandardMaterial color="#c9a184" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.56, -0.2]} castShadow>
        <boxGeometry args={[0.34, 0.13, 0.46]} />
        <meshStandardMaterial color="#2c313a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.27, -0.42]}>
        <boxGeometry args={[0.3, 0.5, 0.11]} />
        <meshStandardMaterial color="#2c313a" roughness={0.9} />
      </mesh>
      {[-0.2, 0.2].map((ax) => (
        <mesh key={ax} position={[ax, 0.88, -0.16]} rotation={[1.1, 0, 0]}>
          <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
          <meshStandardMaterial color={farbe} roughness={0.85} />
        </mesh>
      ))}
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

function Arbeitsplatz({ x, z, an, besetzt, farbe }: { x: number; z: number; an: boolean; besetzt: boolean; farbe: string }) {
  const schirm = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    // Puls nur bei echtem, frischem Lauf – sonst bleibt der Schirm ruhig.
    if (schirm.current && an) schirm.current.emissiveIntensity = 0.9 + Math.sin(clock.getElapsedTime() * 2.4) * 0.35
  })
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
          ref={schirm}
          color={an ? "#dfe7ff" : besetzt ? "#4a5160" : "#1b1f26"}
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
      {besetzt && <Person farbe={farbe} />}
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
}: {
  raum: Raum
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
      <mesh position={[0, PLATTE / 2 + 0.005, 0.6]} receiveShadow>
        <boxGeometry args={[RAUM_B - 0.1, 0.01, TIEFE - 2.6]} />
        <meshStandardMaterial color={leer ? "#bdbab4" : FARBE.boden} roughness={0.95} />
      </mesh>

      <group position={[0, PLATTE, 0]}>
        {Array.from({ length: plaetze }).map((_, i) => {
          const reihe = Math.floor(i / 2)
          const seite = i % 2 === 0 ? -1.3 : 1.3
          const stand = raum.agentenStand[i]
          const an = jetzt !== null && !!stand && agentFrisch(stand, jetzt)
          return (
            <group key={i}>
              <Arbeitsplatz x={plaetze === 1 ? 0 : seite} z={-1.2 + reihe * 2.2} an={an} besetzt={!!stand} farbe={KLEIDUNG[(raum.etage * 3 + raum.spalte + i) % KLEIDUNG.length]} />
              {gewaehlt && stand && (
                <Html position={[plaetze === 1 ? 0 : seite, 1.7, -1.2 + reihe * 2.2]} center distanceFactor={10} zIndexRange={[10, 0]}>
                  <span className="pointer-events-none whitespace-nowrap rounded-full bg-card/90 px-2.5 py-1 font-sans text-[11px] text-foreground shadow-sm backdrop-blur">
                    {stand.name} · {stand.zeit && jetzt !== null ? `${sprache === "tr" ? "son aktif" : "zuletzt aktiv"} ${vorText(stand.zeit, jetzt, sprache)}` : sprache === "tr" ? "henüz çalışma yok" : "noch kein Lauf erfasst"}
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
}: {
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

  const pfosten = useMemo(() => {
    const xs: number[] = []
    for (let x = -BREITE / 2; x <= BREITE / 2 + 0.01; x += 1.5) xs.push(x)
    return xs
  }, [])
  const seitenPfosten = useMemo(() => {
    const zs: number[] = []
    for (let z = -TIEFE / 2 + 1.25; z < TIEFE / 2; z += 1.25) zs.push(z)
    return zs
  }, [])
  const glasH = H - PLATTE
  const glasY = H / 2 + PLATTE / 2

  return (
    <group ref={gruppe} position={[0, basisY, 0]}>
      <RoundedBox args={[BREITE + 0.6, PLATTE, TIEFE + 0.6]} radius={0.03} smoothness={2} position={[0, PLATTE / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={FARBE.anthrazit} roughness={0.55} metalness={0.35} />
      </RoundedBox>

      {/* Geschossdecke innen sichtbar hell, Kante außen anthrazit wie eine echte Fassadenblende */}
      <mesh position={[0, H - 0.03, -0.2]}>
        <boxGeometry args={[BREITE - 0.1, 0.06, TIEFE - 0.5]} />
        <meshStandardMaterial color="#f1f1ef" roughness={0.95} />
      </mesh>

      {[-1, 1].map((s) =>
        seitenPfosten.map((z) => (
          <mesh key={`${s}${z}`} position={[(s * (BREITE + 0.08)) / 2, glasY, z]} castShadow>
            <boxGeometry args={[0.1, glasH, 0.05]} />
            <meshStandardMaterial color={FARBE.anthrazit} metalness={0.5} roughness={0.4} />
          </mesh>
        )),
      )}
      {[-1, 1].map((s) => (
        <mesh key={`riegel${s}`} position={[(s * (BREITE + 0.08)) / 2, PLATTE + 0.95, 0]}>
          <boxGeometry args={[0.1, 0.05, TIEFE]} />
          <meshStandardMaterial color={FARBE.anthrazit} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, PLATTE + 0.95, TIEFE / 2 + 0.04]}>
        <boxGeometry args={[BREITE, 0.05, 0.08]} />
        <meshStandardMaterial color={FARBE.anthrazit} metalness={0.5} roughness={0.4} />
      </mesh>

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
        <mesh key={s} position={[(s * BREITE) / 2, glasY, 0]}>
          <boxGeometry args={[0.03, glasH, TIEFE]} />
          <Glas opacity={0.3} />
        </mesh>
      ))}

      <mesh position={[0, glasY, TIEFE / 2]}>
        <boxGeometry args={[BREITE, glasH, 0.03]} />
        <Glas opacity={imFokus ? 0.1 : 0.26} />
      </mesh>
      {pfosten.map((x) => (
        <mesh key={x} position={[x, glasY, TIEFE / 2 + 0.05]} castShadow>
          <boxGeometry args={[0.05, glasH, 0.14]} />
          <meshStandardMaterial color={FARBE.anthrazit} metalness={0.5} roughness={0.4} />
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
      <mesh position={[0, PLATTE / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[BREITE + 0.6, PLATTE + 0.25, TIEFE + 0.6]} />
        <meshStandardMaterial color={FARBE.anthrazit} roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh position={[0, PLATTE + 0.26, 0]} receiveShadow>
        <boxGeometry args={[BREITE + 0.2, 0.02, TIEFE + 0.2]} />
        <meshStandardMaterial color="#9a9ea5" roughness={1} />
      </mesh>
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
        <meshStandardMaterial color="#a9b49c" roughness={1} />
      </mesh>
      {/* Vorplatz mit Plattenbelag */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 3]} receiveShadow>
        <planeGeometry args={[BREITE + 12, TIEFE + 12]} />
        <meshStandardMaterial color="#d7d5cf" roughness={0.9} />
      </mesh>
      {/* Straße */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, TIEFE / 2 + 13]} receiveShadow>
        <planeGeometry args={[220, 7]} />
        <meshStandardMaterial color="#555a61" roughness={0.95} />
      </mesh>
      {Array.from({ length: 24 }).map((_, i) => (
        <mesh key={`m${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-69 + i * 6, 0.01, TIEFE / 2 + 13]}>
          <planeGeometry args={[2.4, 0.14]} />
          <meshStandardMaterial color="#e8e8e4" roughness={0.8} />
        </mesh>
      ))}
      {/* Eingang mit Vordach */}
      <group position={[0, 0, TIEFE / 2]}>
        <mesh position={[0, 3.05, 1.2]} castShadow>
          <boxGeometry args={[6.4, 0.16, 2.6]} />
          <meshStandardMaterial color={FARBE.anthrazit} roughness={0.5} metalness={0.4} />
        </mesh>
        {[-2.9, 2.9].map((x) => (
          <mesh key={x} position={[x, 1.5, 2.3]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 3, 12]} />
            <meshStandardMaterial color={FARBE.anthrazit} metalness={0.6} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 2.95, 1.2]}>
          <boxGeometry args={[5.6, 0.02, 2]} />
          <meshStandardMaterial color="#fff6e6" emissive="#fff1d6" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      </group>
      {[-14, -8, 8, 14, -19, 19].map((x, i) => (
        <group key={x} position={[x, 0, TIEFE / 2 + (i > 3 ? 2 : 8)]} scale={i > 3 ? 1.25 : 1}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.16, 2.8, 10]} />
            <meshStandardMaterial color="#5a4a3a" roughness={0.95} />
          </mesh>
          {[
            [0, 3.4, 0, 1.25],
            [0.7, 3, 0.3, 0.9],
            [-0.6, 3.1, -0.3, 0.95],
            [0.1, 4.2, -0.2, 0.85],
          ].map(([px, py, pz, r], k) => (
            <mesh key={k} position={[px, py, pz]} castShadow>
              <sphereGeometry args={[r, 18, 14]} />
              <meshStandardMaterial color={k % 2 ? "#566f4a" : "#647f55"} roughness={0.95} />
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
          jetzt={jetzt}
          innenRaeume={innenRaeume}
          sprache={sprache}
        />
      ))}
      <Verbindungen faeden={faeden} raeume={raeume} fokus={fokus} jetzt={jetzt} />
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
