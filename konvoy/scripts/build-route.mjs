// Lokal: node scripts/build-route.mjs  → schreibt data/route.json (Route einfrieren)
import { writeFile } from 'node:fs/promises'
import { EVENT } from '../data/event.js'
import { buildRoute } from '../lib/route-builder.js'

const route = await buildRoute(EVENT)
await writeFile(new URL('../data/route.json', import.meta.url), JSON.stringify(route, null, 1))
console.log(`Route: ${(route.distance / 1000).toFixed(1)} km, ${Math.round(route.duration / 60)} min (Planer) — ${route.waypoints.length} Stationen`)
for (const w of route.waypoints) console.log(` · ${w.type.padEnd(5)} ${w.name} → ${w.label}`)
for (const w of route.warnings) console.log(` ! ${w}`)
