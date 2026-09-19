// Build-Schritt (Vercel) oder lokal: node scripts/build-route.mjs
// Geocodiert die Stationen aus data/event.js und schreibt data/route.json (eingefrorene Route).
// Schlägt der Dienst fehl, bleibt eine vorhandene route.json erhalten und der Build läuft weiter —
// die Seite fällt dann zur Laufzeit auf /api/route zurück.
import { writeFile, stat } from 'node:fs/promises'
import { EVENT } from '../data/event.js'
import { buildRoute } from '../lib/route-builder.js'

const target = new URL('../data/route.json', import.meta.url)
try {
  const route = await buildRoute(EVENT)
  await writeFile(target, JSON.stringify(route))
  console.log(`Route: ${(route.distance / 1000).toFixed(1)} km, ${Math.round(route.duration / 60)} min (Planer) — ${route.waypoints.length} Stationen`)
  for (const w of route.waypoints) console.log(` · ${w.type.padEnd(5)} ${w.name} → ${w.label}`)
  for (const w of route.warnings) console.log(` ! ${w}`)
} catch (err) {
  console.error('Route konnte nicht erzeugt werden:', err?.message || err)
  const existing = await stat(target).catch(() => null)
  console.error(existing ? 'Vorhandene data/route.json bleibt bestehen.' : 'Keine route.json — die Seite nutzt /api/route zur Laufzeit.')
}
