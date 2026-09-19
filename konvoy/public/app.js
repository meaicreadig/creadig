// KONVOY · Hochzeitskonvoi — Live-Karte (mobil, Deutsch)
// Karte: MapLibre GL + CARTO Positron (wie FIBERO) · Live: Supabase-Tabelle per Polling · kein Build-Schritt.
import { EVENT } from './data/event.js'
import { haversine, bearing, cumulative, project, sliceAlong, pointAlong, offsetRight, lerp } from './geo.js'

const $ = (s) => document.querySelector(s)
const params = new URLSearchParams(location.search)
const DEMO = params.has('demo')
const BLANK = params.get('style') === 'blank'
const STYLE_URL = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
const BLANK_STYLE = { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#EDEFF2' } }] }

const COLORS = ['#E0524F', '#2457E6', '#1FA463', '#F08C1B', '#8B5CF6', '#0EA5B7', '#EC4899', '#1F2937']
const GOLD = '#C99A3C', SLATE = '#5B6472', BLUE = '#2457E6'
const STALE_S = 120          // Auto ohne Update seit > 2 min → weg von der Karte
const LEAD_LOST_S = 75       // Brautauto ohne Update → "kein Signal"
const POLL_MS = 3000
const PUSH_LEAD_MS = 3000
const PUSH_MS = 5000
const HEARTBEAT_MS = 20000
const ANIM_MS = 2600
const ARRIVE_M = 80          // so nah (Streckenmeter) am Ziel / an der Braut = angekommen
const STOP_M = 70            // so nah an einem Halt = "Halt"
const SNAP_M = 35            // ≤ 35 m neben der Route → aufs Band setzen
const OFF_M = 60             // > 60 m neben der Route → Rohposition, "abseits"
const PROGRESS_TTL = 6 * 3600 * 1000
// Doppelspur: Linien rechts in Fahrtrichtung versetzt (px, zoomabhängig) — Autos folgen derselben Kurve.
const LANE = [[12, 1.2], [15, 3], [17, 5]]
const LANE_EXPR = ['interpolate', ['linear'], ['zoom'], ...LANE.flat()]
const CAR_W = { lead: 22, car: 16 }

const S = {
  map: null, route: null, coords: null, cum: null, total: 0, times: [], stops: [], pickupM: null,
  cars: new Map(),           // id → Auto (siehe upsertCar)
  self: loadJson('konvoy.self'),
  joined: false, watchId: null, pushTimer: null, pollTimer: null, lastFix: null, lastPush: 0, lastSent: null,
  supa: null, mode: 'fit', leadId: null, leadAge: null, phase: 'loading', pollFails: 0,
  wakeLock: null, demo: null, lastCamera: 0, styleReady: false, selfD: null, navKey: '',
}
if (params.has('debug')) window.KONVOY = S       // nur für Tests (Kamera steuern, Zustand lesen)

// ── Helfer ────────────────────────────────────────────────────────────────────
function loadJson(k) { try { return JSON.parse(localStorage.getItem(k) || 'null') } catch { return null } }
function saveJson(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const fmtKm = (m) => (m >= 950 ? `${(m / 1000).toFixed(1).replace('.', ',')} km` : `${Math.max(0, Math.round(m / 10) * 10)} m`)
const fmtTime = (d) => d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr'
const fmtMin = (s) => { const m = Math.round(s / 60); return m < 1 ? 'unter 1 Min.' : m < 60 ? `${m} Min.` : `${Math.floor(m / 60)} Std. ${m % 60} Min.` }
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'k' + Math.random().toString(36).slice(2) + Date.now().toString(36))
const shortName = (w) => w.short || w.name.replace(/\s*·.*$/, '')
const progressKey = () => `konvoy.progress.${EVENT.id}`

function startDate() {
  const [h, m] = (EVENT.startTime || '12:00').split(':').map(Number)
  const d = EVENT.date ? new Date(`${EVENT.date}T00:00:00`) : new Date()
  d.setHours(h, m, 0, 0)
  return d
}

/** Spur-Versatz in Metern für den aktuellen Zoom (passt zur line-offset der Routen-Layer). */
function laneMeters(lat) {
  const z = S.map ? S.map.getZoom() : 15
  let px = LANE[0][1]
  for (let i = 1; i < LANE.length; i++) {
    const [z0, v0] = LANE[i - 1], [z1, v1] = LANE[i]
    if (z >= z1) px = v1
    else if (z > z0) { px = v0 + ((z - z0) / (z1 - z0)) * (v1 - v0); break }
  }
  return px * (40075016.686 * Math.cos((lat * Math.PI) / 180)) / (512 * 2 ** z)
}

// ── Start ─────────────────────────────────────────────────────────────────────
boot().catch((e) => { console.error(e); setPhase('error', 'Route konnte nicht geladen werden. Bitte später erneut öffnen.') })

async function boot() {
  renderHeader()
  bindUi()
  const [route, cfg] = await Promise.all([loadRoute(), loadConfig()])
  S.route = route
  S.coords = route.geometry.coordinates
  S.cum = cumulative(S.coords)
  S.total = S.cum[S.cum.length - 1]
  prepareStations(route)
  S.times = plannedTimes(route)
  S.supa = cfg
  updateJoinButton()
  renderStops()
  renderActions()
  initMap()
  if (DEMO) startDemo()
  else {
    if (cfg) startPolling()
    if (S.self?.joined) startTracking()
  }
  requestAnimationFrame(tick)
  setInterval(updateStatus, 1000)
}

async function loadRoute() {
  const urls = params.get('route') === 'live' ? ['/api/route'] : ['./data/route.json', '/api/route']
  for (const url of urls) {
    try {
      const r = await fetch(url, { cache: 'no-cache' })
      if (!r.ok) continue
      const j = await r.json()
      if (j?.geometry?.coordinates?.length > 1 && j.waypoints?.length > 1) return j
    } catch (e) { console.warn('Route', url, e) }
  }
  throw new Error('no route')
}

async function loadConfig() {
  if (DEMO) return null
  try {
    const r = await fetch('/api/config', { cache: 'no-store' })
    if (!r.ok) return null
    const j = await r.json()
    return j?.configured ? { url: j.url.replace(/\/$/, ''), anonKey: j.anonKey } : null
  } catch { return null }
}

/** Streckenmeter je Wegpunkt (aus dem Build: index → cum) + Phasengrenze. */
function prepareStations(route) {
  let last = 0
  route.waypoints.forEach((w) => {
    if (typeof w.index === 'number' && S.cum[w.index] != null) w.m = S.cum[w.index]
    else w.m = project(w.snapped || [w.lng, w.lat], S.coords, S.cum, { from: last - 50 }).dist   // ältere route.json
    last = w.m
  })
  const pickup = route.waypoints.find((w) => w.type === 'pickup')
  S.pickupM = pickup ? pickup.m : null
  S.stops = route.waypoints.filter((w) => w.type !== 'via')
}

// ── Kopf, Stationen, Aktionen ─────────────────────────────────────────────────
function renderHeader() {
  $('#eyebrow').textContent = EVENT.title || 'Hochzeitskonvoi'
  $('#couple').textContent = EVENT.couple || ''
  document.title = `${EVENT.title || 'Hochzeitskonvoi'}${EVENT.couple ? ' · ' + EVENT.couple : ''}`
  const d = startDate()
  const dateStr = EVENT.date ? d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' : ''
  const anchor = EVENT.waypoints.find((w) => typeof w.time === 'string')
  $('#dateLabel').textContent = `${dateStr}Treffen ${EVENT.startTime || '12:00'} Uhr` + (anchor ? ` · ${anchor.short || anchor.name} ${anchor.time} Uhr` : '')
  updateJoinButton()
}

/** Feste Uhrzeit eines Wegpunkts (aus route.json oder, falls dort fehlend, aus event.js per Name). */
function fixedTime(wp) {
  const t = wp.time || EVENT.waypoints.find((w) => w.name === wp.name && w.type === wp.type)?.time
  return typeof t === 'string' && /^\d{1,2}:\d{2}$/.test(t) ? t : null
}

/** Zeitplan: ab einem Anker (z. B. Braut 13:15) rückwärts zum Start und vorwärts zum Ziel; ohne Anker ab Startzeit. */
function plannedTimes(route) {
  const wps = route.waypoints
  const f = EVENT.speedFactor || 1
  const leg = (i) => (route.legs[i]?.duration || 0) * f * 1000
  const dwell = (i) => (wps[i].dwell || 0) * 60000
  const k = wps.findIndex((w) => fixedTime(w))
  const a = k >= 0 ? k : 0
  const arriveA = startDate()
  if (k >= 0) { const [h, m] = fixedTime(wps[k]).split(':').map(Number); arriveA.setHours(h, m, 0, 0) }
  const times = new Array(wps.length)
  times[a] = { arrive: arriveA, depart: new Date(arriveA.getTime() + dwell(a)) }
  for (let i = a + 1; i < wps.length; i++) { const arrive = new Date(times[i - 1].depart.getTime() + leg(i - 1)); times[i] = { arrive, depart: new Date(arrive.getTime() + dwell(i)) } }
  for (let i = a - 1; i >= 0; i--) { const depart = new Date(times[i + 1].arrive.getTime() - leg(i)); times[i] = { arrive: new Date(depart.getTime() - dwell(i)), depart } }
  return times
}

function stopBadge(wp, n) {
  return wp.type === 'start' ? 'S' : wp.type === 'end' ? 'Z' : wp.type === 'pickup' ? '♥' : String(n)
}

function renderStops() {
  const ol = $('#stops')
  ol.innerHTML = ''
  const phaseNames = (S.route.phases || []).map((p) => p.name)
  const head = (txt, cls) => { const li = document.createElement('li'); li.className = 'phase-head ' + cls; li.textContent = txt; ol.appendChild(li) }
  if (S.pickupM != null) head(`Phase 1 · ${phaseNames[0] || 'Zur Braut'}`, 'p1')
  let n = 0
  S.route.waypoints.forEach((wp, i) => {
    if (wp.type === 'via') return
    if (wp.type === 'stop') n++
    const li = document.createElement('li')
    li.className = 'stop-item ' + wp.type
    li.dataset.index = i
    const t = S.times[i]
    const timeHtml = wp.type === 'start' ? `${fmtTime(t.depart)}<small>Abfahrt ca. · Treffen ${EVENT.startTime || '12:00'}</small>`
      : wp.type === 'pickup' ? `${fmtTime(t.arrive)}<small>ca. ${wp.dwell || 20} Min. bei der Braut</small>`
      : wp.dwell ? `${fmtTime(t.arrive)}<small>ca. ${wp.dwell} Min. Halt</small>`
      : `${fmtTime(t.arrive)}<small>Ankunft ca.</small>`
    li.innerHTML = `<span class="dot">${stopBadge(wp, n)}</span>
      <div><div class="name">${esc(wp.name)}</div><div class="sub">${esc(wp.address || wp.label || '')}${wp.note ? ' · ' + esc(wp.note) : ''}</div></div>
      <div class="time">${timeHtml}</div>`
    ol.appendChild(li)
    if (wp.type === 'pickup') head(`Phase 2 · ${phaseNames[1] || 'Konvoi mit Brautpaar'}`, 'p2')
  })
  const f = EVENT.speedFactor || 1
  const viasOf = (phase) => S.route.waypoints.filter((w) => w.type === 'via' && (w.phase || 1) === phase).map((w) => w.name)
  const lines = [`${fmtKm(S.route.distance)} · ca. ${fmtMin(S.route.duration * f)} Fahrzeit im Konvoi (ohne Halte)`]
  if (S.pickupM != null) {
    const p = S.route.phases || []
    lines.push(`<b class="c-p1">Zur Braut</b> ${p[0] ? fmtKm(p[0].distance) + ' ' : ''}über ${esc(viasOf(1).join(', '))}`)
    lines.push(`<b class="c-p2">Mit Brautpaar</b> ${p[1] ? fmtKm(p[1].distance) + ' ' : ''}über ${esc(viasOf(2).join(', '))}`)
  } else {
    const v = viasOf(1)
    if (v.length) lines.push(`über ${esc(v.join(', '))}`)
  }
  $('#vias').innerHTML = lines.join('<br>')
}

const ll = (w) => `${w.lat.toFixed(6)},${w.lng.toFixed(6)}`
const isApple = () => /iPhone|iPad|Macintosh/.test(navigator.userAgent) && !/Android/.test(navigator.userAgent)
const navUrl = (w) => (isApple() ? `https://maps.apple.com/?daddr=${ll(w)}&dirflg=d` : `https://www.google.com/maps/dir/?api=1&destination=${ll(w)}&travelmode=driving`)

function renderActions() {
  const wps = S.route.waypoints
  const start = wps[0], end = wps[wps.length - 1]
  // Google Maps am Handy: höchstens 3 Zwischenziele. Erst Halte + Braut, Rest mit Wegpunkten der Rückfahrt auffüllen.
  const mids = wps.slice(1, -1).filter((w) => w.type === 'stop' || w.type === 'pickup').slice(0, 3)
  const fill = wps.filter((w) => w.type === 'via' && (w.phase || 1) === (S.pickupM != null ? 2 : 1))
  for (let k = 0; mids.length < 3 && k < fill.length; k++) {
    const slots = 3 - mids.length
    mids.push(fill[Math.floor(((k + 0.5) * fill.length) / slots)] || fill[k])
    if (mids.length >= 3) break
  }
  mids.sort((a, b) => a.m - b.m)
  const q = mids.map(ll).join('|')
  $('#gmapsLink').href = `https://www.google.com/maps/dir/?api=1&origin=${ll(start)}&destination=${ll(end)}${q ? '&waypoints=' + encodeURIComponent(q) : ''}&travelmode=driving`
  updateNav(0)
}

/** Navigations-Button zeigt immer den nächsten Halt (POCO → Braut → Ziel). */
function updateNav(d) {
  const next = S.stops.find((w) => w.type !== 'start' && w.m > d + ARRIVE_M) || S.stops[S.stops.length - 1]
  const key = next.m + ''
  if (key === S.navKey) return
  S.navKey = key
  $('#navLink').href = navUrl(next)
  $('#navLink').textContent = next.type === 'pickup' ? 'Navigieren zur Braut' : `Navigieren: ${shortName(next)}`
}

// ── Karte ─────────────────────────────────────────────────────────────────────
function initMap() {
  const map = new maplibregl.Map({
    container: 'map',
    style: BLANK ? BLANK_STYLE : STYLE_URL,
    center: EVENT.geo?.center || S.coords[0],
    zoom: 12,
    attributionControl: false,
    pitchWithRotate: false,
    dragRotate: false,
    touchPitch: false,
    fadeDuration: 0,
  })
  S.map = map
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')
  map.on('load', () => {
    germanLabels(map)
    addRouteLayers(map)
    addStopMarkers(map)
    S.styleReady = true
    syncGhost()
    fitRoute(false)
    if (S.phase === 'loading') setPhase('waiting', '')
    updateStatus()
  })
  map.on('dragstart', () => setMode('free'))
  const labelsByZoom = () => map.getContainer().classList.toggle('labels-off', map.getZoom() < 15)
  map.on('zoom', labelsByZoom); map.on('load', labelsByZoom)
  map.on('error', (e) => { if (e?.error) console.warn('Karte:', e.error.message || e.error) })
}

function germanLabels(map) {
  try {
    for (const layer of map.getStyle().layers || []) {
      if (layer.type === 'symbol' && layer.layout?.['text-field']) {
        map.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', 'name:de'], ['get', 'name_de'], ['get', 'name']])
      }
    }
  } catch {}
}

const line = (coords, props = {}) => ({ type: 'Feature', properties: props, geometry: { type: 'LineString', coordinates: coords } })
const fc = (...features) => ({ type: 'FeatureCollection', features })

function planData() {
  if (S.pickupM == null) return fc(line(S.coords, { phase: 1 }))
  return fc(line(sliceAlong(S.coords, S.cum, 0, S.pickupM), { phase: 1 }), line(sliceAlong(S.coords, S.cum, S.pickupM, S.total), { phase: 2 }))
}

function addRouteLayers(map) {
  // Über allen Straßen/Gebäuden, aber unter den Beschriftungen (CARTO hat schon früh ein waterway_label).
  const layers = map.getStyle().layers || []
  const lastShape = layers.findLastIndex((l) => l.type !== 'symbol')
  const firstSymbol = layers.slice(lastShape + 1).find((l) => l.type === 'symbol')?.id
  const layout = { 'line-cap': 'round', 'line-join': 'round' }
  map.addSource('plan', { type: 'geojson', data: planData() })
  map.addSource('done', { type: 'geojson', data: fc() })
  // Alle Linien rechts in Fahrtrichtung versetzt → Hin- und Rückweg liegen als zwei Spuren nebeneinander.
  map.addLayer({ id: 'route-casing', type: 'line', source: 'plan', layout, paint: { 'line-color': '#FFFFFF', 'line-width': 9, 'line-opacity': .95, 'line-offset': LANE_EXPR } }, firstSymbol)
  map.addLayer({ id: 'route-plan', type: 'line', source: 'plan', layout,
    paint: { 'line-color': ['match', ['get', 'phase'], 2, SLATE, GOLD], 'line-width': 5, 'line-offset': LANE_EXPR } }, firstSymbol)
  map.addLayer({ id: 'route-done', type: 'line', source: 'done', layout, paint: { 'line-color': BLUE, 'line-width': 5, 'line-offset': LANE_EXPR } }, firstSymbol)
  if (!BLANK) {
    map.addLayer({
      id: 'route-arrows', type: 'symbol', source: 'plan', minzoom: 13,
      layout: { 'symbol-placement': 'line', 'symbol-spacing': 90, 'text-field': '›', 'text-size': 15, 'text-font': ['Noto Sans Bold', 'Open Sans Bold'],
        'text-keep-upright': false, 'text-allow-overlap': true, 'text-ignore-placement': true, 'text-rotation-alignment': 'map', 'text-pitch-alignment': 'map',
        // Pfeile sitzen auf der versetzten Spur (text-offset in em, y = rechts der Fahrtrichtung)
        'text-offset': ['interpolate', ['linear'], ['zoom'], 13, ['literal', [0, -0.08]], 15, ['literal', [0, 0.02]], 17, ['literal', [0, 0.15]]] },
      paint: { 'text-color': '#FFFFFF', 'text-opacity': .95 },
    }, firstSymbol)
  }
}

function addStopMarkers(map) {
  let n = 0
  for (const wp of S.stops) {
    if (wp.type === 'stop') n++
    const el = document.createElement('div')
    el.className = `pin pin-${wp.type}`
    const txt = wp.type === 'start' ? 'Start' : wp.type === 'end' ? 'Ziel' : wp.type === 'pickup' ? '♥ Braut' : String(n)
    el.innerHTML = `<span>${txt}</span>`
    el.title = wp.name
    const pos = wp.snapped || [wp.lng, wp.lat]
    new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(pos).addTo(map)
  }
}

function routeBounds() {
  let minX = 180, minY = 90, maxX = -180, maxY = -90
  for (const [x, y] of S.coords) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y }
  return [[minX, minY], [maxX, maxY]]
}

function fitRoute(animate = true) {
  if (!S.map || !S.coords) return
  const peek = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--peek')) || 118
  S.map.fitBounds(routeBounds(), { padding: { top: 70, bottom: peek + 30, left: 30, right: 30 }, duration: animate ? 800 : 0, pitch: 0, bearing: 0 })
}

function setMode(mode) {
  S.mode = mode
  for (const [id, m] of [['#btnFit', 'fit'], ['#btnFollow', 'follow'], ['#btnDrive', 'drive']]) $(id).classList.toggle('active', mode === m)
  if (mode === 'fit') fitRoute(true)
  else if (mode === 'follow' || mode === 'drive') { S.lastCamera = 0; cameraFollow(true) }
}

/** Das Führungsfahrzeug: eigenes Handy (wenn Brautauto) oder das live gemeldete Brautauto. */
function leadCar() {
  if (S.joined && S.self?.lead) { const c = S.cars.get(S.self.id); return c && S.lastFix ? { car: c, self: true } : null }
  const c = S.leadId ? S.cars.get(S.leadId) : null
  return c ? { car: c } : null
}
/** Streckenmeter des Brautautos: Zielwert (für Status) bzw. animierter Wert (für Linie/Balken). */
const leadTargetD = () => { const l = leadCar(); return l && l.car.dTo != null ? l.car.dTo : null }
const leadShownD = () => { const l = leadCar(); return l && l.car.d != null ? l.car.d : null }

function cameraFollow(force = false) {
  if (!S.map || !(S.mode === 'follow' || S.mode === 'drive')) return
  const l = leadCar() || (S.joined && S.self ? { car: S.cars.get(S.self.id) } : null)
  if (!l?.car) return
  const now = performance.now()
  if (!force && now - S.lastCamera < 2500) return
  S.lastCamera = now
  const c = l.car
  const target = c.snapped && c.dTo != null ? pointAlong(S.coords, S.cum, c.dTo).point : c.target || c.pos
  if (S.mode === 'follow') S.map.easeTo({ center: target, zoom: Math.max(S.map.getZoom(), 15.5), pitch: 0, bearing: 0, duration: force ? 700 : 2600, easing: (t) => t })
  else S.map.easeTo({ center: target, zoom: 16.5, pitch: 58, bearing: c.heading || 0, duration: force ? 700 : 2600, easing: (t) => t, padding: { top: 180 } })
}

// ── Autos auf der Karte ───────────────────────────────────────────────────────
function carSvg(color, lead) {
  const body = lead ? '#FFFFFF' : color
  const ribbon = lead ? `<path d="M20 10 L8 40 M20 10 L32 40" stroke="#C99A3C" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <circle cx="20" cy="11" r="6" fill="#E4C378" stroke="#B8893A" stroke-width="1.5"/>
    <path d="M17.5 45 q2.5 -4 5 0 q-2.5 4 -5 0z" fill="#C99A3C"/>` : ''
  return `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="16" width="6" height="12" rx="2" fill="#1B1B1F"/><rect x="31" y="16" width="6" height="12" rx="2" fill="#1B1B1F"/>
    <rect x="3" y="52" width="6" height="12" rx="2" fill="#1B1B1F"/><rect x="31" y="52" width="6" height="12" rx="2" fill="#1B1B1F"/>
    <path d="M9 14 Q9 3 20 3 Q31 3 31 14 L32 64 Q32 77 20 77 Q8 77 8 64 Z" fill="${body}" stroke="rgba(0,0,0,.45)" stroke-width="2"/>
    <path d="M12 21 Q20 15 28 21 L29 33 L11 33 Z" fill="rgba(25,35,55,.62)"/>
    <path d="M11 51 L29 51 L28 61 Q20 66 12 61 Z" fill="rgba(25,35,55,.5)"/>
    <rect x="10" y="5" width="5" height="3" rx="1" fill="#FFF3B0"/><rect x="25" y="5" width="5" height="3" rx="1" fill="#FFF3B0"/>
    <rect x="10" y="72" width="5" height="3" rx="1" fill="#E0524F"/><rect x="25" y="72" width="5" height="3" rx="1" fill="#E0524F"/>
    ${ribbon}
  </svg>`
}

/** Brautauto heißt "Bräutigam" bis zur Braut, danach "Brautpaar". */
function leadLabel(d) {
  if (S.pickupM == null) return '♥ Brautauto'
  return d != null && d >= S.pickupM - ARRIVE_M ? '♥ Brautpaar' : '♥ Bräutigam'
}

function labelText(c) {
  const r = c.row
  if (r.ghost) return '♥ Bräutigam · Start'
  const base = r.lead ? leadLabel(c.dTo) : (r.name || 'Auto')
  return base + (c.snapped ? '' : ' · abseits')
}

/**
 * Position auf die Route legen (Map-Matching). Liefert {d, off} oder null.
 * Streckenfenster um den letzten Stand, weil Straßen zweimal befahren werden (hin und zurück).
 */
function matchToRoute(pos, heading, lastD, hint) {
  const opt = { heading }
  let p = null
  if (lastD != null) p = project(pos, S.coords, S.cum, { ...opt, from: lastD - 150, to: lastD + 1500 })
  else if (hint != null) p = project(pos, S.coords, S.cum, { ...opt, from: hint - 3000, to: hint + 300 })
  if (!p || p.off > OFF_M) {
    const g = project(pos, S.coords, S.cum, opt)
    if (!p || g.off <= SNAP_M) p = g
  }
  return p
}

function upsertCar(row) {
  const pos = [row.lng, row.lat]
  const hasHeading = typeof row.heading === 'number' && !Number.isNaN(row.heading)
  let c = S.cars.get(row.id)
  const isNew = !c
  if (isNew) {
    const el = document.createElement('div')
    const labelEl = document.createElement('div')
    const marker = new maplibregl.Marker({ element: el, rotationAlignment: 'map', pitchAlignment: 'map' }).setLngLat(pos).addTo(S.map)
    const label = new maplibregl.Marker({ element: labelEl, anchor: 'left', offset: [0, 0] }).setLngLat(pos).addTo(S.map)
    c = { id: row.id, row, marker, label, el, labelEl, sig: '', labelTxt: '',
      pos, from: pos, target: pos, t0: 0, d: null, dFrom: null, dTo: null, snapped: true, heading: hasHeading ? row.heading : 0 }
    S.cars.set(row.id, c)
  }

  // 1) Zielposition bestimmen: Streckenmeter auf der Route oder Rohposition.
  let dNew = null, off = Infinity
  if (row.ghost) { dNew = 0; off = 0 }
  else if (typeof row.progress === 'number' && row.progress >= 0) {
    dNew = Math.min(S.total, row.progress)                              // Brautauto meldet seinen Fortschritt selbst
    off = haversine(pos, pointAlong(S.coords, S.cum, dNew).point)
  } else {
    const heading = hasHeading ? row.heading : (c.target && haversine(c.target, pos) > 4 ? bearing(c.target, pos) : null)
    const hint = row.lead ? null : leadTargetD()
    const m = matchToRoute(pos, heading, c.dTo, hint)
    if (m) { dNew = m.dist; off = m.off }
  }
  // Hysterese: ≤ 35 m → auf der Route, > 60 m → abseits, dazwischen bleibt es wie es war.
  const snapped = off <= SNAP_M ? true : off > OFF_M ? false : (isNew ? true : c.snapped)

  // 2) Animation von der aktuellen zur neuen Position (entlang der Route, 2,6 s).
  const now = performance.now()
  if (snapped && dNew != null) {
    const jump = c.d == null || !c.snapped || Math.abs(dNew - c.d) > 3000
    c.dFrom = jump ? dNew : c.d
    c.dTo = dNew
    if (jump) c.d = dNew
  } else {
    // abseits: Rohposition, gerade gleiten; Streckenmeter bleibt beim letzten Stand (bzw. dem gemeldeten Fortschritt)
    c.from = isNew ? pos : c.pos
    if (hasHeading) c.heading = row.heading
    else if (haversine(c.from, pos) > 4) c.heading = bearing(c.from, pos)
    if (typeof row.progress === 'number' && dNew != null) { c.dTo = dNew; c.d = dNew }
  }
  c.snapped = snapped
  c.target = pos
  c.t0 = now
  c.row = row

  // 3) Aussehen (Größe, Farbe, Label) nur bei Änderung neu setzen.
  const sig = `${row.name}|${row.color}|${row.lead ? 1 : 0}|${row.self ? 1 : 0}|${row.ghost ? 1 : 0}|${snapped ? 1 : 0}`
  if (sig !== c.sig) {
    // classList statt className: MapLibre hängt eigene Klassen (maplibregl-marker …) an dieselben Elemente
    const cl = c.el.classList, ll = c.labelEl.classList
    cl.add('car'); cl.toggle('car-lead', !!row.lead); cl.toggle('car-ghost', !!row.ghost); cl.toggle('car-off', !snapped)
    ll.add('car-label'); ll.toggle('lead', !!row.lead); ll.toggle('self', !!row.self); ll.toggle('ghost', !!row.ghost); ll.toggle('off', !snapped)
    if (c.svgKey !== `${row.color}|${row.lead ? 1 : 0}`) { c.el.innerHTML = carSvg(row.color || COLORS[1], !!row.lead); c.svgKey = `${row.color}|${row.lead ? 1 : 0}` }
    c.label.setOffset([(row.lead ? CAR_W.lead : CAR_W.car) / 2 + 10, 0])
    c.sig = sig
  }
  const txt = labelText(c)
  if (txt !== c.labelTxt) { c.labelEl.textContent = txt; c.labelTxt = txt }
  if (isNew) placeCar(c, now)
  return c
}

function removeCar(id) {
  const c = S.cars.get(id)
  if (!c) return
  c.marker.remove(); c.label.remove()
  S.cars.delete(id)
}

/** Geist-Brautauto am Start, solange kein echtes Brautauto sendet. */
function syncGhost() {
  const hasLead = !!leadCar()
  const ghost = S.cars.get('__ghost')
  if (hasLead && ghost) removeCar('__ghost')
  else if (!hasLead && !ghost && S.map && S.coords) {
    const { point, heading } = pointAlong(S.coords, S.cum, 0)
    upsertCar({ id: '__ghost', ghost: true, lead: true, name: '', color: '#fff', lat: point[1], lng: point[0], heading, age: 0 })
  }
}

/** Positionen (Server-Zeilen oder Demo) auf die Karte bringen. */
function applyPositions(rows) {
  const seen = new Set()
  let lead = null
  const fresh = rows.filter((r) => typeof r.lat === 'number' && typeof r.lng === 'number' && (r.age ?? 0) <= STALE_S
    && !(S.joined && S.self && r.id === S.self.id))                     // eigenes Auto kommt direkt vom GPS
  for (const r of fresh) if (r.lead && (!lead || (r.age ?? 0) < (lead.age ?? 0))) lead = r
  // Brautauto zuerst: sein Fortschritt hilft, die anderen Autos auf der richtigen Spur einzuordnen.
  if (lead) { upsertCar(lead); seen.add(lead.id) }
  for (const r of fresh) { if (r === lead) continue; upsertCar({ ...r, lead: false }); seen.add(r.id) }
  for (const id of [...S.cars.keys()]) if (!seen.has(id) && id !== '__ghost' && !(S.joined && S.self && id === S.self.id)) removeCar(id)
  S.leadId = lead ? lead.id : null
  S.leadAge = lead ? (lead.age ?? 0) : null
  syncGhost()
  cameraFollow()
  renderCarList()
}

function renderCarList() {
  const ul = $('#cars')
  const rows = [...S.cars.values()].filter((c) => !c.row.ghost && !c.row.self).map((c) => ({ ...c.row, off: !c.snapped }))
  if (S.joined && S.self && S.lastFix) rows.push({ ...S.self, self: true, age: Math.round((Date.now() - S.lastFix.ts) / 1000), off: S.cars.get(S.self.id)?.snapped === false })
  rows.sort((a, b) => (b.lead ? 1 : 0) - (a.lead ? 1 : 0) || String(a.name).localeCompare(String(b.name), 'de'))
  $('#carCount').textContent = `${rows.length} ${rows.length === 1 ? 'Auto' : 'Autos'}`
  if (!rows.length) { ul.innerHTML = '<li class="empty">Noch niemand unterwegs. Tippe oben auf „Ich fahre mit“.</li>'; return }
  ul.innerHTML = rows.map((r) => `<li>
    <span class="swatch" style="background:${r.lead ? '#fff' : esc(r.color || '#999')}"></span>
    <span class="nm">${esc(r.name || 'Auto')}${r.self ? ' <span class="age">(du)</span>' : ''}${r.off ? ' <span class="age">· abseits</span>' : ''}</span>
    ${r.lead ? '<span class="tag">Brautauto</span>' : ''}
    <span class="age">${(r.age ?? 0) < 8 ? 'jetzt' : `vor ${Math.round(r.age)} s`}</span>
  </li>`).join('')
}

// ── Animationsschleife: Autos fahren entlang der Route, blaue Linie wächst ────
function placeCar(c, now) {
  const t = c.t0 ? Math.min(1, (now - c.t0) / ANIM_MS) : 1
  if (c.snapped && c.dTo != null) {
    c.d = c.dFrom + (c.dTo - c.dFrom) * t                        // gleichmäßig entlang der Straße, keine Abkürzung
    const p = pointAlong(S.coords, S.cum, c.d).point
    // Richtung über ±6 m geglättet, damit das Auto in Kurven nicht springt
    const h = bearing(pointAlong(S.coords, S.cum, c.d - 6).point, pointAlong(S.coords, S.cum, c.d + 6).point)
    c.heading = h
    c.pos = offsetRight(p, h, laneMeters(p[1]))                  // auf die eigene Spur (rechts)
  } else {
    c.pos = lerp(c.from, c.target, t)
  }
  c.marker.setLngLat(c.pos); c.label.setLngLat(c.pos); c.marker.setRotation(c.heading || 0)
  if (t >= 1) c.t0 = 0
}

let lastProgress = 0, lastZoom = 0
function tick(now) {
  const z = S.map ? S.map.getZoom() : 0
  const zoomChanged = Math.abs(z - lastZoom) > 0.01
  lastZoom = z
  for (const c of S.cars.values()) if (c.t0 || zoomChanged) placeCar(c, now)
  if (now - lastProgress > 250) { lastProgress = now; updateProgress() }
  requestAnimationFrame(tick)
}

function updateProgress() {
  if (!S.styleReady || !S.coords) return
  const d = leadShownD()
  const src = S.map.getSource('done')
  if (d == null || d < 1) { if (src && S.doneShown !== 0) { src.setData(fc()); S.doneShown = 0 } }
  else if (src && Math.abs((S.doneShown || 0) - d) > 0.5) { src.setData(fc(line(sliceAlong(S.coords, S.cum, 0, d)))); S.doneShown = d }
  const dd = d ?? 0
  const pct = Math.min(100, Math.max(0, (dd / S.total) * 100))
  $('#progressBar').style.width = pct + '%'
  $('#progressLeft').textContent = `${Math.round(pct)} % · ${fmtKm(dd)} gefahren`
  $('#progressRight').textContent = `noch ${fmtKm(S.total - dd)}`
}

// ── Status-Zeile ──────────────────────────────────────────────────────────────
function setPhase(phase, text) {
  S.phase = phase
  const el = $('#status')
  el.dataset.phase = phase
  if (text != null) $('#statusText').textContent = text
}

/** Geschätzte Restzeit (s) von d bis zum Streckenmeter m, inkl. Halte dazwischen. */
function etaSeconds(d, m) {
  const f = EVENT.speedFactor || 1
  const speed = S.route.distance / Math.max(1, S.route.duration * f)
  let s = Math.max(0, m - d) / Math.max(2, speed)
  for (const w of S.stops) if (w.dwell && w.type === 'stop' && w.m > d + STOP_M && w.m < m) s += w.dwell * 60
  return s
}

function updateStatus() {
  if (!S.route || S.phase === 'error' || S.phase === 'loading') return
  syncGhost()
  const lead = leadCar()
  const now = Date.now()
  if (!lead) {
    const t0 = startDate()
    const when = EVENT.date && now < t0.getTime() ? `Start in ${fmtMin((t0.getTime() - now) / 1000)}` : `Start ${EVENT.startTime || '12:00'} Uhr`
    setPhase('waiting', `Konvoi steht beim Bräutigam · ${when}`)
    markStops(-1)
    updateNav(S.selfD ?? 0)
    return
  }
  const d = lead.car.dTo ?? 0
  markStops(d)
  updateNav(d)
  if (!lead.self && S.leadAge != null && S.leadAge > LEAD_LOST_S) { setPhase('lost', `Kein Signal vom Brautauto seit ${fmtMin(S.leadAge)}`); return }
  if (d > S.total - ARRIVE_M) { setPhase('arrived', 'Ziel erreicht · der Konvoi löst sich auf 🎉'); return }
  if (S.pickupM != null && Math.abs(d - S.pickupM) < ARRIVE_M) { setPhase('pickup', 'Bei der Braut · Gelin alma 💐'); return }
  const stop = S.stops.find((w) => w.type === 'stop' && Math.abs(d - w.m) < STOP_M)
  if (stop) { setPhase('stop', `Halt: ${shortName(stop)} 🎉`); return }
  if (d < 60) { setPhase('ready', 'Konvoi steht beim Bräutigam'); return }
  if (S.pickupM != null && d < S.pickupM) {
    setPhase('driving', `Auf dem Weg zur Braut · noch ${fmtKm(S.pickupM - d)} · Ankunft ca. ${fmtTime(new Date(now + etaSeconds(d, S.pickupM) * 1000))}`)
    return
  }
  if (S.pickupM != null) { setPhase('driving', `Konvoi mit dem Brautpaar · noch ${fmtKm(S.total - d)}`); return }
  setPhase('driving', `Unterwegs · noch ${fmtKm(S.total - d)} · Ankunft ca. ${fmtTime(new Date(now + etaSeconds(d, S.total) * 1000))}`)
}

function markStops(d) {
  let current = -1
  for (const li of $('#stops').querySelectorAll('.stop-item')) {
    const w = S.route.waypoints[Number(li.dataset.index)]
    if (d >= 0 && w.m <= d + 40) current = Number(li.dataset.index)
  }
  for (const li of $('#stops').querySelectorAll('.stop-item')) {
    const i = Number(li.dataset.index)
    li.classList.toggle('passed', current >= 0 && i < current)
    li.classList.toggle('current', current >= 0 && i === current)
  }
}

// ── Live: Supabase (REST, Polling) ────────────────────────────────────────────
function headers(extra = {}) {
  // Legacy-Anon-Key ist ein JWT (eyJ…) und geht auch als Bearer; neue Publishable-Keys (sb_publishable_…) nur als apikey.
  const key = S.supa.anonKey
  const h = { apikey: key, ...extra }
  if (/^eyJ/.test(key)) h.Authorization = `Bearer ${key}`
  return h
}

function startPolling() {
  const run = async () => {
    if (document.visibilityState === 'hidden') return
    try {
      const q = `${S.supa.url}/rest/v1/konvoy_live?event=eq.${encodeURIComponent(EVENT.id)}&age=lt.${STALE_S}&select=id,name,color,lead,lat,lng,heading,speed,accuracy,progress,age&order=updated_at.desc&limit=200`
      const r = await fetch(q, { headers: headers() })
      if (!r.ok) throw new Error('HTTP ' + r.status)
      applyPositions(await r.json())
      S.pollFails = 0
    } catch (e) {
      if (++S.pollFails === 3) setPhase('lost', 'Verbindung zum Live-Server unterbrochen …')
      console.warn('poll', e)
    }
  }
  run()
  S.pollTimer = setInterval(run, POLL_MS)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { run(); requestWakeLock() } })
}

async function pushPosition(force = false) {
  if (!S.joined || !S.supa || !S.lastFix) return
  const f = S.lastFix
  const now = Date.now()
  const interval = S.self.lead ? PUSH_LEAD_MS : PUSH_MS
  const moved = !S.lastSent || haversine([S.lastSent.lng, S.lastSent.lat], [f.lng, f.lat]) > 3
  if (!force && now - S.lastPush < interval) return
  if (!force && !moved && now - S.lastPush < HEARTBEAT_MS) return
  S.lastPush = now
  const body = { id: S.self.id, event: EVENT.id, name: S.self.name, color: S.self.color, lead: !!S.self.lead,
    lat: f.lat, lng: f.lng, heading: f.heading ?? null, speed: f.speed ?? null, accuracy: f.accuracy ?? null,
    progress: S.self.lead && S.selfD != null ? Math.round(S.selfD * 10) / 10 : null }
  try {
    const r = await fetch(`${S.supa.url}/rest/v1/konvoy_positions?on_conflict=id`, {
      method: 'POST', headers: headers({ 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error('HTTP ' + r.status)
    S.lastSent = { lat: f.lat, lng: f.lng }
  } catch (e) { console.warn('push', e) }
}

async function deletePosition() {
  if (!S.supa || !S.self) return
  try { await fetch(`${S.supa.url}/rest/v1/konvoy_positions?id=eq.${encodeURIComponent(S.self.id)}`, { method: 'DELETE', headers: headers() }) } catch {}
}

// ── Mitfahren: GPS, Wake-Lock ─────────────────────────────────────────────────
/** Eigener Fortschritt auf der Route (Brautauto meldet ihn an alle, gesichert für Reloads). */
function trackSelfProgress(pos, heading) {
  if (!S.coords) return
  if (S.selfD == null && S.self?.lead) {
    const saved = loadJson(progressKey())
    if (saved && Date.now() - saved.ts < PROGRESS_TTL && typeof saved.d === 'number') S.selfD = saved.d
  }
  const m = matchToRoute(pos, heading, S.selfD, S.self?.lead ? null : leadTargetD())
  if (m && m.off <= OFF_M) S.selfD = m.dist
  if (S.self?.lead && S.selfD != null) saveJson(progressKey(), { d: S.selfD, ts: Date.now() })
}

function startTracking() {
  if (!('geolocation' in navigator)) { setPhase('error', 'Dieses Gerät hat keinen Standortzugriff.'); return }
  S.joined = true
  updateJoinButton()
  requestWakeLock()
  if (S.watchId != null) navigator.geolocation.clearWatch(S.watchId)
  let prev = null
  S.watchId = navigator.geolocation.watchPosition((p) => {
    const c = p.coords
    let heading = typeof c.heading === 'number' && !Number.isNaN(c.heading) ? c.heading : null
    if (heading == null && prev && haversine([prev.lng, prev.lat], [c.longitude, c.latitude]) > 5) heading = bearing([prev.lng, prev.lat], [c.longitude, c.latitude])
    if (heading == null && S.lastFix) heading = S.lastFix.heading
    prev = { lng: c.longitude, lat: c.latitude }
    S.lastFix = { lat: c.latitude, lng: c.longitude, heading, speed: c.speed, accuracy: c.accuracy, ts: Date.now() }
    trackSelfProgress([c.longitude, c.latitude], heading)
    if (S.map) {
      upsertCar({ ...S.self, lat: c.latitude, lng: c.longitude, heading, self: true, age: 0,
        progress: S.self.lead && S.selfD != null ? S.selfD : undefined })
      syncGhost()
    }
    if (S.self.lead) { S.leadAge = 0; cameraFollow() }
    pushPosition()
    renderCarList()
  }, (err) => {
    console.warn('GPS', err)
    if (err.code === 1) { stopTracking(false); setPhase('error', 'Standort-Freigabe nötig: In den Einstellungen des Browsers Standort erlauben.') }
  }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 })
  S.pushTimer = setInterval(() => pushPosition(), 1000)
}

function stopTracking(remove = true) {
  S.joined = false
  if (S.watchId != null) navigator.geolocation.clearWatch(S.watchId)
  S.watchId = null
  clearInterval(S.pushTimer)
  if (S.self) { removeCar(S.self.id); S.self.joined = false; saveJson('konvoy.self', S.self) }
  if (remove) deletePosition()
  if (S.wakeLock) { S.wakeLock.release().catch(() => {}); S.wakeLock = null }
  S.lastFix = null
  S.selfD = null
  syncGhost()
  updateJoinButton()
  renderCarList()
  if (S.phase === 'error') setPhase('waiting', '')
}

async function requestWakeLock() {
  if (!S.joined || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return
  try { S.wakeLock = await navigator.wakeLock.request('screen') } catch {}
}

function updateJoinButton() {
  const btn = $('#joinBtn')
  btn.classList.toggle('joined', S.joined)
  $('#joinLabel').textContent = S.joined ? (S.self?.lead ? `♥ ${S.self.name}` : `${S.self?.name} fährt mit`) : 'Ich fahre mit'
  btn.disabled = false                                          // immer offen — ohne Supabase nur lokal
  $('#joinNote').hidden = DEMO || !!S.supa
}

// ── UI-Verdrahtung ────────────────────────────────────────────────────────────
function bindUi() {
  $('#sheetToggle').addEventListener('click', () => $('#sheet').classList.toggle('open'))
  $('#btnFit').addEventListener('click', () => setMode('fit'))
  $('#btnFollow').addEventListener('click', () => setMode(S.mode === 'follow' ? 'fit' : 'follow'))
  $('#btnDrive').addEventListener('click', () => setMode(S.mode === 'drive' ? 'fit' : 'drive'))
  setMode('fit')

  const chips = $('#colorChips')
  chips.innerHTML = COLORS.map((c, i) => `<label style="background:${c}" title="Farbe"><input type="radio" name="color" value="${c}" ${i === 0 ? 'checked' : ''}></label>`).join('')
  $('#leadCheck').addEventListener('change', (e) => { $('#pinField').hidden = !e.target.checked })

  $('#joinBtn').addEventListener('click', () => {
    if (S.joined) {
      $('#leaveTitle').textContent = S.self?.lead ? 'Brautauto · Führung aktiv' : `${S.self?.name} fährt mit`
      $('#leaveHint').textContent = S.supa || DEMO
        ? 'Solange die Seite offen bleibt, sehen alle dein Auto. „Fahrt beenden“ nimmt dich von der Karte.'
        : 'Live-Teilen ist noch nicht eingeschaltet: Dein Auto siehst vorerst nur du selbst. „Fahrt beenden“ schaltet GPS aus.'
      $('#leaveDialog').showModal()
      return
    }
    if (S.self?.name) $('#nameInput').value = S.self.name
    if (S.self?.color) { const r = chips.querySelector(`input[value="${S.self.color}"]`); if (r) r.checked = true }
    $('#joinError').hidden = true
    $('#joinDialog').showModal()
  })
  $('#joinCancel').addEventListener('click', () => $('#joinDialog').close())
  $('#leaveCancel').addEventListener('click', () => $('#leaveDialog').close())
  $('#leaveConfirm').addEventListener('click', () => { $('#leaveDialog').close(); stopTracking(true) })

  $('#joinForm').addEventListener('submit', (e) => {
    e.preventDefault()
    const name = $('#nameInput').value.trim()
    const color = chips.querySelector('input:checked')?.value || COLORS[0]
    const lead = $('#leadCheck').checked
    const pin = $('#pinInput').value.trim()
    const err = $('#joinError')
    if (name.length < 2) { err.textContent = 'Bitte einen Namen eingeben.'; err.hidden = false; return }
    if (lead && pin !== String(EVENT.leadPin)) { err.textContent = 'PIN fürs Brautauto stimmt nicht.'; err.hidden = false; return }
    S.self = { id: S.self?.id || uuid(), name, color, lead, joined: true }
    saveJson('konvoy.self', S.self)
    $('#joinDialog').close()
    if (DEMO) { S.joined = true; updateJoinButton(); return }
    startTracking()
    if (!lead && S.mode === 'fit') setMode('follow')
    if (lead) setMode('drive')
  })

  $('#shareBtn').addEventListener('click', async () => {
    const url = location.origin + location.pathname
    const text = `${EVENT.title}${EVENT.couple ? ' · ' + EVENT.couple : ''} – Live-Karte: ${url}`
    if (navigator.share) { try { await navigator.share({ title: EVENT.title, text, url }) } catch {} }
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  })
}

// ── Demo: simulierter Konvoi (?demo=1) ────────────────────────────────────────
// Ganze Route in ca. 90 s, Halt bei POCO und bei der Braut, Autos hintereinander (25–40 m Abstand).
function startDemo() {
  const names = ['Fabian', 'Tim', 'Ayşe & Mehmet', 'Familie Yılmaz', 'Onkel Hasan', 'Elif']
  const gaps = names.map((_, i) => 25 + ((i * 7) % 16))                   // 25–40 m
  const LEAD_IN = 2.5, TOTAL_S = 90
  const halts = S.stops.filter((w) => w.type === 'stop' || w.type === 'pickup').map((w) => ({ at: w.m, dwell: w.type === 'pickup' ? 9 : 5 }))
  const speed = S.total / (TOTAL_S - LEAD_IN - halts.reduce((s, h) => s + h.dwell, 0))   // m/s
  const t0 = performance.now() + LEAD_IN * 1000
  const distAt = (elapsed) => {
    let d = 0, t = elapsed
    for (const h of halts) {
      const need = (h.at - d) / speed
      if (t <= need) return d + t * speed
      t -= need
      if (t <= h.dwell) return h.at
      t -= h.dwell
      d = h.at
    }
    return Math.min(S.total, d + t * speed)
  }
  // leichtes GPS-Rauschen (±6 m quer), damit das Map-Matching etwas zu tun hat
  const noise = (i, k) => Math.sin(k * 1.7 + i * 2.3) * 6
  let tickN = 0
  const rows = () => {
    tickN++
    const elapsed = (performance.now() - t0) / 1000
    const lead = elapsed < 0 ? 0 : distAt(elapsed)
    const mk = (id, name, color, isLead, d, i) => {
      const { point, heading } = pointAlong(S.coords, S.cum, d)
      const p = isLead ? point : offsetRight(point, heading, noise(i, tickN))
      return { id, name, color, lead: isLead, lat: p[1], lng: p[0], heading, age: 0, ...(isLead ? { progress: d } : {}) }
    }
    const out = [mk('lead', 'Brautauto', '#fff', true, lead, 0)]
    let back = 0
    names.forEach((n, i) => { back += gaps[i]; out.push(mk('d' + i, n, COLORS[i % COLORS.length], false, Math.max(0, lead - back), i + 1)) })
    if (S.joined && S.self) out.push({ ...mk(S.self.id, S.self.name, S.self.color, false, Math.max(0, lead - back - 60), 9), self: true })
    return out
  }
  const run = () => { if (S.map) applyPositions(rows()) }
  S.demoRun = run
  const begin = () => { run(); S.demo = setInterval(run, 2000); setTimeout(() => setMode('follow'), 3000) }
  if (S.styleReady) begin(); else S.map.once('load', begin)
}
