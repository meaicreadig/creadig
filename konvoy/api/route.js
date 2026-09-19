// GET /api/route — geocodiert die Stationen aus data/event.js und holt die Straßenroute (OSRM).
// Die App nutzt zuerst data/route.json (eingefrorener Stand); dieser Endpunkt ist Fallback + Werkzeug.
import { EVENT } from '../data/event.js'
import { buildRoute } from '../lib/route-builder.js'

export default async function handler(req, res) {
  try {
    const result = await buildRoute(EVENT)
    const fresh = req.query && 'fresh' in req.query
    res.setHeader('Cache-Control', fresh ? 'no-store' : 's-maxage=86400, stale-while-revalidate=604800')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.status(200).send(JSON.stringify(result))
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store')
    res.status(502).json({ error: String(err?.message || err) })
  }
}
