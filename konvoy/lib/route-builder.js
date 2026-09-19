// Geocoding (Photon) + Routing (OSRM) — dieselben freien Dienste wie in FIBERO.
// Läuft auf dem Server (api/route.js) oder lokal (scripts/build-route.mjs).
const PHOTON = 'https://photon.komoot.io/api/'
const OSRM = 'https://router.project-osrm.org/route/v1/driving/'
const UA = 'konvoy/1.0 (Hochzeitskonvoi; creadig.de)'

const inBbox = ([lng, lat], [minLng, minLat, maxLng, maxLat]) =>
  lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat

async function getJson(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${url}`)
  return r.json()
}

async function geocode(wp, geo) {
  const [lon, lat] = geo.center
  for (const q of wp.queries) {
    const url = `${PHOTON}?q=${encodeURIComponent(q)}&limit=5&lang=de&lat=${lat}&lon=${lon}&bbox=${geo.bbox.join(',')}`
    let j
    try { j = await getJson(url) } catch { continue }
    const hit = (j.features || []).find((f) => inBbox(f.geometry.coordinates, geo.bbox))
    if (!hit) continue
    const p = hit.properties || {}
    const label = [p.name, [p.street, p.housenumber].filter(Boolean).join(' '), p.postcode, p.city]
      .filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')
    return { lng: hit.geometry.coordinates[0], lat: hit.geometry.coordinates[1], label, query: q, osm: `${p.osm_type || ''}/${p.osm_id || ''}` }
  }
  return null
}

/** Baut die komplette Route für eine Event-Konfiguration. */
export async function buildRoute(EVENT) {
  const warnings = []
  const points = []
  for (const wp of EVENT.waypoints) {
    // Feste Koordinaten in event.js (lat/lng) überspringen das Geocoding — z. B. für exakte Kreuzungen.
    const g = typeof wp.lat === 'number' && typeof wp.lng === 'number'
      ? { lat: wp.lat, lng: wp.lng, label: wp.address || wp.name, query: 'fest', osm: '' }
      : await geocode(wp, EVENT.geo)
    if (!g) {
      const msg = `Nicht gefunden: ${wp.name} (${wp.queries.join(' | ')})`
      if (wp.type === 'via') { warnings.push(msg + ' — Wegpunkt übersprungen'); continue }
      throw new Error(msg)
    }
    points.push({ ...wp, ...g })
  }
  if (points.length < 2) throw new Error('Zu wenige Wegpunkte')

  const coords = points.map((p) => `${p.lng},${p.lat}`).join(';')
  const j = await getJson(`${OSRM}${coords}?overview=full&geometries=geojson&steps=false`)
  if (j.code !== 'Ok' || !j.routes?.[0]) throw new Error(`OSRM: ${j.code || 'keine Route'} ${j.message || ''}`)
  const route = j.routes[0]

  return {
    generatedAt: new Date().toISOString(),
    eventId: EVENT.id,
    waypoints: points.map((p, i) => ({
      type: p.type, name: p.name, address: p.address || null, dwell: p.dwell || 0, note: p.note || null,
      lat: p.lat, lng: p.lng, label: p.label, query: p.query, osm: p.osm,
      snapped: j.waypoints?.[i]?.location || [p.lng, p.lat],
    })),
    legs: route.legs.map((l) => ({ distance: l.distance, duration: l.duration })),
    distance: route.distance,
    duration: route.duration,
    geometry: route.geometry,
    warnings,
  }
}
