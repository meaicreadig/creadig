// Geocoding (Photon) + Routing (OSRM) — dieselben freien Dienste wie in FIBERO.
// Läuft auf dem Server (api/route.js) oder lokal (scripts/build-route.mjs).
const PHOTON = 'https://photon.komoot.io/api/'
const OSRM = 'https://router.project-osrm.org/route/v1/driving/'
const UA = 'konvoy/1.0 (Hochzeitskonvoi; creadig.de)'
const R = 6371000

const inBbox = ([lng, lat], [minLng, minLat, maxLng, maxLat]) =>
  lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat

const rad = (d) => (d * Math.PI) / 180
function haversine(a, b) {
  const dLat = rad(b[1] - a[1]), dLng = rad(b[0] - a[0])
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
}

async function getJson(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${url}`)
  return r.json()
}

// Sucht die Queries der Reihe nach; nur Treffer im Suchraum (bbox des Wegpunkts, sonst der Stadt) zählen.
async function geocode(wp, geo) {
  const bbox = wp.bbox || geo.bbox
  const lon = (bbox[0] + bbox[2]) / 2, lat = (bbox[1] + bbox[3]) / 2
  for (const q of wp.queries || []) {
    const url = `${PHOTON}?q=${encodeURIComponent(q)}&limit=8&lang=de&lat=${lat}&lon=${lon}&bbox=${bbox.join(',')}`
    let j
    try { j = await getJson(url) } catch { continue }
    const hit = (j.features || []).find((f) => inBbox(f.geometry.coordinates, bbox))
    if (!hit) continue
    const p = hit.properties || {}
    const label = [p.name, [p.street, p.housenumber].filter(Boolean).join(' '), p.district, p.city]
      .filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')
    return { lng: hit.geometry.coordinates[0], lat: hit.geometry.coordinates[1], label, query: q, osm: `${p.osm_type || ''}/${p.osm_id || ''}` }
  }
  return null
}

// Wende-Schleifen finden: die Route kehrt nach kurzer Strecke an denselben Punkt zurück
// (typisch, wenn ein Wegpunkt in einer Sackgasse oder hinter der Abbiege-Kreuzung liegt).
function findLoops(coords, cum, points, legStart) {
  const loops = []
  for (let i = 0; i < coords.length; i++) {
    for (let j = i + 2; j < coords.length && cum[j] - cum[i] < 600; j++) {
      if (cum[j] - cum[i] < 40) continue
      if (haversine(coords[i], coords[j]) < 12) {
        const at = cum[i]
        let wp = 0
        for (let k = 0; k < legStart.length; k++) if (cum[legStart[k]] <= at + 5) wp = k
        const near = points.reduce((b, p, k) => { const d = haversine([p.lng, p.lat], coords[i]); return d < b.d ? { d, k } : b }, { d: Infinity, k: -1 })
        loops.push({ at: Math.round(at), length: Math.round(cum[j] - cum[i]), afterWaypoint: points[wp]?.name, nearWaypoint: points[near.k]?.name, point: coords[i] })
        i = j
        break
      }
    }
  }
  return loops
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
      const msg = `Nicht gefunden: ${wp.name} (${(wp.queries || []).join(' | ')})`
      if (wp.type === 'via') { warnings.push(msg + ' — Wegpunkt übersprungen'); continue }
      throw new Error(msg)
    }
    points.push({ ...wp, ...g })
  }
  if (points.length < 2) throw new Error('Zu wenige Wegpunkte')

  const coordStr = points.map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(';')
  const j = await getJson(`${OSRM}${coordStr}?overview=false&geometries=geojson&steps=true`)
  if (j.code !== 'Ok' || !j.routes?.[0]) throw new Error(`OSRM: ${j.code || 'keine Route'} ${j.message || ''}`)
  const route = j.routes[0]

  // Geometrie aus den Leg-Schritten zusammensetzen: so kennen wir den Stützpunkt, an dem jeder Leg beginnt.
  const coords = []
  const legStart = [0]
  for (const leg of route.legs) {
    for (const step of leg.steps) {
      for (const c of step.geometry.coordinates) {
        const last = coords[coords.length - 1]
        if (!last || last[0] !== c[0] || last[1] !== c[1]) coords.push(c)
      }
    }
    legStart.push(coords.length - 1)
  }
  const cum = [0]
  for (let i = 1; i < coords.length; i++) cum[i] = cum[i - 1] + haversine(coords[i - 1], coords[i])

  // Phasen: ein Wegpunkt vom Typ "pickup" beendet Phase 1 und startet Phase 2.
  const pickupIdx = points.findIndex((p) => p.type === 'pickup')
  const phaseNames = EVENT.phases || ['Zur Braut', 'Konvoi mit Brautpaar']
  const bounds = pickupIdx > 0 ? [[0, pickupIdx], [pickupIdx, points.length - 1]] : [[0, points.length - 1]]
  const phases = bounds.map(([a, b], k) => {
    const legs = route.legs.slice(a, b)
    return {
      name: phaseNames[k] || `Phase ${k + 1}`, from: a, to: b,
      startIndex: legStart[a], endIndex: legStart[b],
      startM: Math.round(cum[legStart[a]]), endM: Math.round(cum[legStart[b]]),
      distance: Math.round(legs.reduce((s, l) => s + l.distance, 0)),
      duration: Math.round(legs.reduce((s, l) => s + l.duration, 0)),
    }
  })

  const loops = findLoops(coords, cum, points, legStart)
  for (const l of loops) {
    warnings.push(`Wende-Schleife bei ${l.at} m (${l.length} m lang) nach „${l.afterWaypoint}“, nahe „${l.nearWaypoint}“ — Kreuzung mit lat/lng fest pinnen`)
  }

  return {
    generatedAt: new Date().toISOString(),
    eventId: EVENT.id,
    waypoints: points.map((p, i) => ({
      type: p.type, name: p.name, short: p.short || null, address: p.address || null, dwell: p.dwell || 0, note: p.note || null, time: p.time || null,
      phase: pickupIdx > 0 && i > pickupIdx ? 2 : 1,
      lat: p.lat, lng: p.lng, label: p.label, query: p.query, osm: p.osm,
      snapped: j.waypoints?.[i]?.location || [p.lng, p.lat],
      index: legStart[i], at: Math.round(cum[legStart[i]]),
    })),
    legs: route.legs.map((l) => ({ distance: l.distance, duration: l.duration })),
    phases,
    distance: route.distance,
    duration: route.duration,
    geometry: { type: 'LineString', coordinates: coords },
    loops,
    warnings,
  }
}
