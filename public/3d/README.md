# Echte PBR-Materialien für die 3D-Zentrale

Quelle: [Poly Haven](https://polyhaven.com) — CC0 (gemeinfrei, keine Namensnennung nötig, kommerzielle Nutzung erlaubt).

Jeweils 1k-Auflösung, drei Dateien pro Material (so liest sie `@react-three/drei`s `useTexture` direkt ein):

- `diff.jpg` — Albedo/Diffuse (Farbe)
- `nor.jpg` — Normal Map, OpenGL-Konvention (`nor_gl`, passt zu Three.js/WebGL)
- `arm.jpg` — ORM gepackt: R = Ambient Occlusion, G = Roughness, B = Metalness (für `aoMap`/`roughnessMap`/`metalnessMap`, alle auf dieselbe Datei zeigend)

| Ordner | Poly-Haven-Asset | Gedacht für |
|---|---|---|
| `metal-plate/` | [metal_plate](https://polyhaven.com/a/metal_plate) | Fassaden-Pfosten/Riegel (Alu/Anthrazit-Rahmen) |
| `smooth-concrete/` | [smooth_concrete_floor](https://polyhaven.com/a/smooth_concrete_floor) | Geschossdecken/Böden |
| `brushed-concrete/` | [brushed_concrete](https://polyhaven.com/a/brushed_concrete) | Fassadenplatten (geschlossene Paneele, Dach) |

Alle drei sind gekachelt (tileable) — mit `repeat`/`wrapS`/`wrapT` auf `THREE.RepeatWrapping` je nach Bauteilgröße skalieren, sonst wirken sie gestreckt.
