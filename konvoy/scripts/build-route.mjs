// Build-Schritt (Vercel) oder lokal: node scripts/build-route.mjs
// Geocodiert die Stationen aus data/event.js und schreibt data/route.json (eingefrorene Route).
// Schlägt der Dienst fehl, bleibt eine vorhandene route.json erhalten und der Build läuft weiter —
// die Seite fällt dann zur Laufzeit auf /api/route zurück.
import { writeFile, stat } from 'node:fs/promises'
import { EVENT } from '../public/data/event.js'
import { buildRoute } from '../lib/route-builder.js'

const km = (m) => (m / 1000).toFixed(1) + ' km'
const min = (s) => Math.round(s / 60) + ' min'
const target = new URL('../public/data/route.json', import.meta.url)
try {
  const route = await buildRoute(EVENT)
  await writeFile(target, JSON.stringify(route))
  const f = EVENT.speedFactor || 1
  console.log(`Route: ${km(route.distance)}, ${min(route.duration)} Planer / ${min(route.duration * f)} Konvoi — ${route.waypoints.length} Stationen, ${route.geometry.coordinates.length} Stützpunkte`)
  for (const p of route.phases) console.log(`Phase „${p.name}“: ${km(p.distance)}, ${min(p.duration)} Planer / ${min(p.duration * f)} Konvoi (Meter ${p.startM}–${p.endM})`)
  for (const w of route.waypoints) console.log(` · P${w.phase} ${w.type.padEnd(6)} ${String(w.at).padStart(6)} m  ${w.name} → ${w.label} [${w.query}] (${w.lat.toFixed(5)}, ${w.lng.toFixed(5)})`)
  for (const w of route.warnings) console.log(` ! ${w}`)
  if (!route.loops.length) console.log(' ✓ keine Wende-Schleifen')
} catch (err) {
  console.error('Route konnte nicht erzeugt werden:', err?.message || err)
  const existing = await stat(target).catch(() => null)
  console.error(existing ? 'Vorhandene data/route.json bleibt bestehen.' : 'Keine route.json — die Seite nutzt /api/route zur Laufzeit.')
}
