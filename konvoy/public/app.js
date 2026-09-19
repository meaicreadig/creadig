// KONVOY · Hochzeitskonvoi — Live-Karte (mobil, Deutsch)
// Karte: MapLibre GL + CARTO Positron (wie FIBERO) · Live: Supabase-Tabelle per Polling · kein Build-Schritt.
import { EVENT } from './data/event.js'
import { haversine, bearing, cumulative, project, sliceAlong, pointAlong, lerp } from './geo.js'

const $ = (s) => document.querySelector(s)
const params = new URLSearchParams(location.search)
const DEMO = params.has('demo')
const BLANK = params.get('style') === 'blank'
const STYLE_URL = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
const BLANK_STYLE = { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#EDEFF2' } }] }

const COLORS = ['#E0524F', '#2457E6', '#1FA463', '#F08C1B', '#8B5CF6', '#0EA5B7', '#EC4899', '#1F2937']
const STALE_S = 120          // Auto ohne Update seit > 2 min → weg von der Karte
const LEAD_LOST_S = 75       // Brautauto ohne Update → "kein Signal"
const POLL_MS = 3000
const PUSH_LEAD_MS = 3000
const PUSH_MS = 5000
const HEARTBEAT_MS = 20000
const ANIM_MS = 2600
const ARRIVE_M = 80
const STOP_M = 70
const SNAP_MAX_M = 150

const S = {
  map: null, route: null, coords: null, cum: null, total: 0, times: [],
  cars: new Map(),           // id → { id, row, marker, label, el, labelEl, pos, from, to, t0, heading }
  self: loadJson('konvoy.self'),
  joined: false, watchId: null, pushTimer: null, pollTimer: null, lastFix: null, lastPush: 0, lastSent: null,
  supa: null, mode: 'fit', leadId: null, progressM: 0, phase: 'loading', phaseText: '', pollFails: 0,
  wakeLock: null, demo: null, lastCamera: 0, styleReady: false,
}

// ── Helfer ────────────────────────────────────────────────────────────────────
function loadJson(k) { try { return JSON.parse(localStorage.getItem(k) || 'null') } catch { return null } }
function saveJson(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const fmtKm = (m) => (m >= 950 ? `${(m / 1000).toFixed(1).replace('.', ',')} km` : `${Math.max(0, Math.round(m / 10) * 10)} m`)
const fmtTime = (d) => d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr'
const fmtMin = (s) => { const m = Math.round(s / 60); return m < 1 ? 'unter 1 Min.' : m < 60 ? `${m} Min.` : `${Math.floor(m / 60)} Std. ${m % 60} Min.` }
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'k' + Math.random().toString(36).slice(2) + Date.now().toString(36))

function startDate() {
  const [h, m] = (EVENT.startTime || '12:00').split(':').map(Number)
  const d = EVENT.date ? new Date(`${EVENT.date}T00:00:00`) : new Date()
  d.setHours(h, m, 0, 0)
  return d
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
  S.times = plannedTimes(route)
  S.supa = cfg
  renderStops()
  renderActions()
  initMap()
  if (DEMO) startDemo()
  else if (cfg) { startPolling(); if (S.self?.joined) startTracking() }
  else setPhase('nolive', 'Route steht · Live-Tracking wird noch eingerichtet')
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

// ── Kopf, Stationen, Aktionen ─────────────────────────────────────────────────
function renderHeader() {
  $('#eyebrow').textContent = EVENT.title || 'Hochzeitskonvoi'
  $('#couple').textContent = EVENT.couple || ''
  document.title = `${EVENT.title || 'Hochzeitskonvoi'}${EVENT.couple ? ' · ' + EVENT.couple : ''}`
  const d = startDate()
  const dateStr = EVENT.date ? d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' : ''
  $('#dateLabel').textContent = `${dateStr}Start ${EVENT.startTime || '12:00'} Uhr`
  updateJoinButton()
}

function plannedTimes(route) {
  let t = startDate()
  return route.waypoints.map((wp, i) => {
    if (i > 0) t = new Date(t.getTime() + (route.legs[i - 1]?.duration || 0) * (EVENT.speedFactor || 1) * 1000)
    const arrive = t
    if (wp.dwell) t = new Date(t.getTime() + wp.dwell * 60000)
    return { arrive, depart: t }
  })
}

function renderStops() {
  const ol = $('#stops')
  ol.innerHTML = ''
  let n = 0
  S.route.waypoints.forEach((wp, i) => {
    if (wp.type === 'via') return
    const li = document.createElement('li')
    li.className = wp.type
    li.dataset.index = i
    const badge = wp.type === 'start' ? 'S' : wp.type === 'end' ? 'Z' : String(++n)
    const t = S.times[i]
    const timeHtml = wp.type === 'start' ? `${fmtTime(t.depart)}<small>Abfahrt</small>`
      : wp.dwell ? `${fmtTime(t.arrive)}<small>ca. ${wp.dwell} Min. Halt</small>`
      : `${fmtTime(t.arrive)}<small>Ankunft ca.</small>`
    li.innerHTML = `<span class="dot">${badge}</span>
      <div><div class="name">${esc(wp.name)}</div><div class="sub">${esc(wp.address || wp.label || '')}${wp.note ? ' · ' + esc(wp.note) : ''}</div></div>
      <div class="time">${timeHtml}</div>`
    ol.appendChild(li)
  })
  const vias = S.route.waypoints.filter((w) => w.type === 'via').map((w) => w.name)
  const km = fmtKm(S.route.distance)
  const dur = fmtMin(S.route.duration * (EVENT.speedFactor || 1))
  $('#vias').textContent = `${km} · ca. ${dur} im Konvoi` + (vias.length ? ` · über ${vias.join(', ')}` : '')
}

function renderActions() {
  const wps = S.route.waypoints
  const ll = (w) => `${w.lat.toFixed(6)},${w.lng.toFixed(6)}`
  const start = wps[0], end = wps[wps.length - 1]
  const mids = wps.slice(1, -1).slice(0, 8).map(ll).join('|')
  $('#gmapsLink').href = `https://www.google.com/maps/dir/?api=1&origin=${ll(start)}&destination=${ll(end)}${mids ? '&waypoints=' + encodeURIComponent(mids) : ''}&travelmode=driving`
  const isApple = /iPhone|iPad|Macintosh/.test(navigator.userAgent) && !/Android/.test(navigator.userAgent)
  $('#navLink').href = isApple ? `https://maps.apple.com/?daddr=${ll(end)}&dirflg=d` : `https://www.google.com/maps/dir/?api=1&destination=${ll(end)}&travelmode=driving`
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
    fitRoute(false)
    if (S.phase === 'loading') setPhase('waiting', '')
  })
  map.on('dragstart', () => setMode('free'))
  const labelsByZoom = () => map.getContainer().classList.toggle('labels-off', map.getZoom() < 14.5)
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

const lineFC = (coords) => ({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }] })

function addRouteLayers(map) {
  const firstSymbol = (map.getStyle().layers || []).find((l) => l.type === 'symbol')?.id
  const layout = { 'line-cap': 'round', 'line-join': 'round' }
  map.addSource('route', { type: 'geojson', data: lineFC(S.coords) })
  map.addSource('done', { type: 'geojson', data: lineFC([S.coords[0], S.coords[0]]) })
  map.addLayer({ id: 'route-casing', type: 'line', source: 'route', layout, paint: { 'line-color': '#FFFFFF', 'line-width': 11, 'line-opacity': .95 } }, firstSymbol)
  map.addLayer({ id: 'route-rest', type: 'line', source: 'route', layout, paint: { 'line-color': '#AEB4BF', 'line-width': 6 } }, firstSymbol)
  map.addLayer({ id: 'route-done', type: 'line', source: 'done', layout, paint: { 'line-color': '#2457E6', 'line-width': 6 } }, firstSymbol)
  if (!BLANK) {
    map.addLayer({
      id: 'route-arrows', type: 'symbol', source: 'route',
      layout: { 'symbol-placement': 'line', 'symbol-spacing': 110, 'text-field': '›', 'text-size': 20, 'text-font': ['Noto Sans Bold', 'Open Sans Bold'],
        'text-keep-upright': false, 'text-allow-overlap': true, 'text-ignore-placement': true, 'text-rotation-alignment': 'map', 'text-pitch-alignment': 'map', 'text-offset': [0, -0.15] },
      paint: { 'text-color': '#FFFFFF', 'text-opacity': .95 },
    }, firstSymbol)
  }
}

function addStopMarkers(map) {
  let n = 0
  for (const wp of S.route.waypoints) {
    if (wp.type === 'via') continue
    const el = document.createElement('div')
    el.className = `pin pin-${wp.type}`
    el.innerHTML = `<span>${wp.type === 'start' ? 'Start' : wp.type === 'end' ? 'Ziel' : ++n}</span>`
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
  if (!S.map) return
  const peek = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--peek')) || 92
  S.map.fitBounds(routeBounds(), { padding: { top: 70, bottom: peek + 30, left: 30, right: 30 }, duration: animate ? 800 : 0, pitch: 0, bearing: 0 })
}

function setMode(mode) {
  S.mode = mode
  for (const [id, m] of [['#btnFit', 'fit'], ['#btnFollow', 'follow'], ['#btnDrive', 'drive']]) $(id).classList.toggle('active', mode === m)
  if (mode === 'fit') fitRoute(true)
  else if (mode === 'follow' || mode === 'drive') { S.lastCamera = 0; cameraFollow(true) }
}

function leadCar() {
  if (S.joined && S.self?.lead && S.lastFix) return { pos: [S.lastFix.lng, S.lastFix.lat], heading: S.lastFix.heading ?? 0, self: true }
  const c = S.leadId ? S.cars.get(S.leadId) : null
  return c ? { pos: c.pos, heading: c.heading, target: c.to } : null
}

function cameraFollow(force = false) {
  if (!S.map || !(S.mode === 'follow' || S.mode === 'drive')) return
  const lead = leadCar()
  if (!lead) return
  const now = performance.now()
  if (!force && now - S.lastCamera < 2500) return
  S.lastCamera = now
  const target = lead.target || lead.pos
  if (S.mode === 'follow') S.map.easeTo({ center: target, zoom: Math.max(S.map.getZoom(), 15), pitch: 0, bearing: 0, duration: force ? 700 : 2600, easing: (t) => t })
  else S.map.easeTo({ center: target, zoom: 16.5, pitch: 58, bearing: lead.heading || 0, duration: force ? 700 : 2600, easing: (t) => t, padding: { top: 180 } })
}

// ── Autos auf der Karte ───────────────────────────────────────────────────────
function carSvg(color, lead) {
  const body = lead ? '#FFFFFF' : color
  const ribbon = lead ? `<path d="M20 10 L8 40 M20 10 L32 40" stroke="#C99A3C" stroke-width="3" stroke-linecap="round" fill="none"/>
    <circle cx="20" cy="11" r="5.5" fill="#E4C378" stroke="#B8893A" stroke-width="1.5"/>
    <path d="M17.5 45 q2.5 -4 5 0 q-2.5 4 -5 0z" fill="#C99A3C"/>` : ''
  return `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="16" width="6" height="12" rx="2" fill="#1B1B1F"/><rect x="31" y="16" width="6" height="12" rx="2" fill="#1B1B1F"/>
    <rect x="3" y="52" width="6" height="12" rx="2" fill="#1B1B1F"/><rect x="31" y="52" width="6" height="12" rx="2" fill="#1B1B1F"/>
    <path d="M9 14 Q9 3 20 3 Q31 3 31 14 L32 64 Q32 77 20 77 Q8 77 8 64 Z" fill="${body}" stroke="rgba(0,0,0,.4)" stroke-width="1.5"/>
    <path d="M12 21 Q20 15 28 21 L29 33 L11 33 Z" fill="rgba(25,35,55,.62)"/>
    <path d="M11 51 L29 51 L28 61 Q20 66 12 61 Z" fill="rgba(25,35,55,.5)"/>
    <rect x="11" y="35" width="18" height="14" rx="2" fill="rgba(255,255,255,.18)"/>
    <rect x="10" y="5" width="5" height="3" rx="1" fill="#FFF3B0"/><rect x="25" y="5" width="5" height="3" rx="1" fill="#FFF3B0"/>
    <rect x="10" y="72" width="5" height="3" rx="1" fill="#E0524F"/><rect x="25" y="72" width="5" height="3" rx="1" fill="#E0524F"/>
    ${ribbon}
  </svg>`
}

function upsertCar(row, instant = false) {
  const pos = [row.lng, row.lat]
  let c = S.cars.get(row.id)
  if (!c) {
    const el = document.createElement('div')
    el.className = 'car' + (row.lead ? ' car-lead' : '')
    el.innerHTML = carSvg(row.color || COLORS[1], !!row.lead)
    const labelEl = document.createElement('div')
    labelEl.className = 'car-label' + (row.lead ? ' lead' : '') + (row.self ? ' self' : '')
    labelEl.textContent = row.lead ? `♥ ${row.name || 'Brautauto'}` : (row.name || 'Auto')
    const marker = new maplibregl.Marker({ element: el, rotationAlignment: 'map', pitchAlignment: 'map' }).setLngLat(pos).addTo(S.map)
    const label = new maplibregl.Marker({ element: labelEl, anchor: 'left', offset: [row.lead ? 22 : 17, 0] }).setLngLat(pos).addTo(S.map)
    c = { id: row.id, row, marker, label, el, labelEl, pos, from: pos, to: pos, t0: 0, heading: row.heading ?? 0, sig: '' }
    S.cars.set(row.id, c)
    marker.setRotation(c.heading)
  } else {
    const moved = haversine(c.to, pos) > 1.5
    if (moved) {
      c.from = instant ? pos : c.pos
      c.to = pos
      c.t0 = performance.now()
      const h = typeof row.heading === 'number' && !Number.isNaN(row.heading) ? row.heading : bearing(c.from, pos)
      if (haversine(c.from, pos) > 4 || typeof row.heading === 'number') c.heading = h
    }
    const sig = `${row.name}|${row.color}|${row.lead ? 1 : 0}|${row.self ? 1 : 0}`
    if (sig !== c.sig) {
      c.el.className = 'car' + (row.lead ? ' car-lead' : '')
      c.el.innerHTML = carSvg(row.color || COLORS[1], !!row.lead)
      c.labelEl.className = 'car-label' + (row.lead ? ' lead' : '') + (row.self ? ' self' : '')
      c.labelEl.textContent = row.lead ? `♥ ${row.name || 'Brautauto'}` : (row.name || 'Auto')
      c.label.setOffset([row.lead ? 22 : 17, 0])
      c.sig = sig
    }
    c.row = row
  }
  c.sig = c.sig || `${row.name}|${row.color}|${row.lead ? 1 : 0}|${row.self ? 1 : 0}`
  return c
}

function removeCar(id) {
  const c = S.cars.get(id)
  if (!c) return
  c.marker.remove(); c.label.remove()
  S.cars.delete(id)
}

/** Positionen (Server-Zeilen oder Demo) auf die Karte bringen. */
function applyPositions(rows) {
  const seen = new Set()
  let lead = null
  for (const r of rows) {
    if (typeof r.lat !== 'number' || typeof r.lng !== 'number') continue
    if ((r.age ?? 0) > STALE_S) continue
    if (S.joined && S.self && r.id === S.self.id) continue   // eigenes Auto kommt direkt vom GPS
    seen.add(r.id)
    upsertCar(r)
    if (r.lead && (!lead || (r.age ?? 0) < (lead.age ?? 0))) lead = r
  }
  for (const id of [...S.cars.keys()]) if (!seen.has(id) && !(S.joined && S.self && id === S.self.id)) removeCar(id)
  S.leadId = lead ? lead.id : null
  S.leadAge = lead ? (lead.age ?? 0) : null
  cameraFollow()
  renderCarList()
}

function renderCarList() {
  const ul = $('#cars')
  const rows = [...S.cars.values()].map((c) => c.row)
  if (S.joined && S.self && S.lastFix) rows.push({ ...S.self, self: true, age: Math.round((Date.now() - S.lastFix.ts) / 1000) })
  rows.sort((a, b) => (b.lead ? 1 : 0) - (a.lead ? 1 : 0) || String(a.name).localeCompare(String(b.name), 'de'))
  $('#carCount').textContent = `${rows.length} ${rows.length === 1 ? 'Auto' : 'Autos'}`
  if (!rows.length) { ul.innerHTML = '<li class="empty">Noch niemand unterwegs. Tippe oben auf „Ich fahre mit“.</li>'; return }
  ul.innerHTML = rows.map((r) => `<li>
    <span class="swatch" style="background:${r.lead ? '#fff' : esc(r.color || '#999')}"></span>
    <span class="nm">${esc(r.name || 'Auto')}${r.self ? ' <span class="age">(du)</span>' : ''}</span>
    ${r.lead ? '<span class="tag">Brautauto</span>' : ''}
    <span class="age">${(r.age ?? 0) < 8 ? 'jetzt' : `vor ${Math.round(r.age)} s`}</span>
  </li>`).join('')
}

// ── Animationsschleife: Autos gleiten, blaue Linie wächst ─────────────────────
let lastProgress = 0
function tick(now) {
  for (const c of S.cars.values()) {
    if (c.t0) {
      const t = Math.min(1, (now - c.t0) / ANIM_MS)
      c.pos = lerp(c.from, c.to, easeOut(t))
      c.marker.setLngLat(c.pos); c.label.setLngLat(c.pos); c.marker.setRotation(c.heading)
      if (t >= 1) c.t0 = 0
    }
  }
  if (now - lastProgress > 250) { lastProgress = now; updateProgress() }
  requestAnimationFrame(tick)
}

function updateProgress() {
  if (!S.styleReady || !S.coords) return
  const lead = leadCar()
  if (!lead) return
  const p = project(lead.pos, S.coords, S.cum)
  if (p.off > SNAP_MAX_M) return                   // abseits der Route → letzten Stand halten
  S.progressM = p.dist
  S.progressOff = p.off
  const src = S.map.getSource('done')
  if (src) src.setData(lineFC(sliceAlong(S.coords, S.cum, S.progressM)))
  const pct = Math.min(100, Math.max(0, (S.progressM / S.total) * 100))
  $('#progressBar').style.width = pct + '%'
  $('#progressLeft').textContent = `${Math.round(pct)} % · ${fmtKm(S.progressM)} gefahren`
  $('#progressRight').textContent = `noch ${fmtKm(S.total - S.progressM)}`
}

// ── Status-Zeile ──────────────────────────────────────────────────────────────
function setPhase(phase, text) {
  S.phase = phase
  const el = $('#status')
  el.dataset.phase = phase
  if (text != null) $('#statusText').textContent = text
}

function updateStatus() {
  if (!S.route || S.phase === 'error' || S.phase === 'nolive' || S.phase === 'loading') return
  const lead = leadCar()
  const now = Date.now()
  if (!lead) {
    const t0 = startDate()
    if (now < t0.getTime()) {
      const diff = (t0.getTime() - now) / 1000
      setPhase('waiting', diff > 36 * 3600 ? `Start ${t0.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })} um ${EVENT.startTime} Uhr` : `Konvoi startet ${EVENT.startTime} Uhr · in ${fmtMin(diff)}`)
    } else setPhase('waiting', DEMO ? 'Demo startet …' : 'Wartet auf das Brautauto …')
    markStops(-1)
    return
  }
  if (!lead.self && S.leadAge != null && S.leadAge > LEAD_LOST_S) { setPhase('lost', `Kein Signal vom Brautauto seit ${fmtMin(S.leadAge)}`); return }
  const wps = S.route.waypoints
  const end = wps[wps.length - 1]
  const distEnd = haversine(lead.pos, end.snapped || [end.lng, end.lat])
  if (distEnd < ARRIVE_M || S.progressM > S.total - ARRIVE_M) { setPhase('arrived', 'Angekommen am Ziel 🎉'); markStops(wps.length - 1); return }
  // Halt an einer Zwischenstation?
  let stopIdx = -1
  wps.forEach((w, i) => { if (w.type === 'stop' && haversine(lead.pos, w.snapped || [w.lng, w.lat]) < STOP_M) stopIdx = i })
  const passedIdx = currentStopIndex()
  markStops(passedIdx)
  if (stopIdx >= 0) { setPhase('stop', `Halt: ${wps[stopIdx].name.replace(/\s*·.*$/, '')} · ca. ${wps[stopIdx].dwell || 5} Min.`); return }
  if (S.progressM < 60) { setPhase('ready', 'Konvoi steht am Start'); return }
  const remaining = S.total - S.progressM
  const plannedSpeed = S.route.distance / (S.route.duration * (EVENT.speedFactor || 1))   // m/s
  let eta = remaining / Math.max(2, plannedSpeed)
  wps.forEach((w, i) => { if (w.dwell && i > passedIdx && cumAt(i) > S.progressM) eta += w.dwell * 60 })
  setPhase('driving', `Unterwegs · noch ${fmtKm(remaining)} · Ankunft ca. ${fmtTime(new Date(now + eta * 1000))}`)
}

/** Streckenmeter bis Wegpunkt i (aus den Legs). */
function cumAt(i) { let d = 0; for (let k = 0; k < i; k++) d += S.route.legs[k]?.distance || 0; return d }
function currentStopIndex() {
  let idx = -1
  S.route.waypoints.forEach((w, i) => { if (cumAt(i) <= S.progressM + 40) idx = i })
  return idx
}
function markStops(passedIdx) {
  for (const li of $('#stops').children) {
    const i = Number(li.dataset.index)
    li.classList.toggle('passed', passedIdx >= 0 && i < passedIdx)
    li.classList.toggle('current', passedIdx >= 0 && i === passedIdx)
  }
}

// ── Live: Supabase (REST, Polling) ────────────────────────────────────────────
function headers(extra = {}) {
  return { apikey: S.supa.anonKey, Authorization: `Bearer ${S.supa.anonKey}`, ...extra }
}

function startPolling() {
  const run = async () => {
    if (document.visibilityState === 'hidden') return
    try {
      const q = `${S.supa.url}/rest/v1/konvoy_live?event=eq.${encodeURIComponent(EVENT.id)}&age=lt.${STALE_S}&select=id,name,color,lead,lat,lng,heading,speed,accuracy,age&order=updated_at.desc&limit=200`
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
    lat: f.lat, lng: f.lng, heading: f.heading ?? null, speed: f.speed ?? null, accuracy: f.accuracy ?? null }
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
    upsertCar({ ...S.self, lat: c.latitude, lng: c.longitude, heading, self: true, age: 0 })
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
  updateJoinButton()
  renderCarList()
}

async function requestWakeLock() {
  if (!S.joined || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return
  try { S.wakeLock = await navigator.wakeLock.request('screen') } catch {}
}

function updateJoinButton() {
  const btn = $('#joinBtn')
  btn.classList.toggle('joined', S.joined)
  $('#joinLabel').textContent = S.joined ? (S.self?.lead ? `♥ ${S.self.name}` : `${S.self?.name} fährt mit`) : 'Ich fahre mit'
  btn.disabled = !DEMO && !S.supa && !S.joined
  btn.title = btn.disabled ? 'Live-Tracking wird noch eingerichtet' : ''
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
      $('#leaveHint').textContent = 'Solange die Seite offen bleibt, sehen alle dein Auto. „Fahrt beenden“ nimmt dich von der Karte.'
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
    if (DEMO) { S.joined = true; updateJoinButton(); setPhase(S.phase, null); return }
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
function startDemo() {
  const names = ['Fabian', 'Tim', 'Ayşe & Mehmet', 'Familie Yılmaz', 'Onkel Hasan', 'Elif']
  const DEMO_SECONDS = 75
  const speed = S.total / DEMO_SECONDS                     // m/s (Demo: ganze Route in 75 s)
  const stops = S.route.waypoints.map((w, i) => ({ at: cumAt(i), dwell: w.type === 'stop' ? 6 : 0 })).filter((s) => s.dwell)
  const t0 = performance.now() + 2500
  const distAt = (elapsed) => {
    let d = 0, t = elapsed
    for (const s of stops) {
      const tReach = s.at / speed
      if (t <= tReach) return t * speed
      t -= tReach + s.dwell
      if (t < 0) return s.at
      d = s.at
    }
    return Math.min(S.total, d + t * speed)
  }
  const rows = () => {
    const elapsed = Math.max(0, (performance.now() - t0) / 1000)
    const lead = distAt(elapsed)
    const out = []
    const mk = (id, name, color, isLead, d) => { const { point, heading } = pointAlong(S.coords, S.cum, d); return { id, name, color, lead: isLead, lat: point[1], lng: point[0], heading, age: 0 } }
    out.push(mk('lead', 'Brautauto', '#fff', true, lead))
    names.forEach((n, i) => out.push(mk('d' + i, n, COLORS[i % COLORS.length], false, Math.max(0, lead - 55 * (i + 1) - (i % 2) * 20))))
    if (S.joined && S.self) out.push({ ...mk(S.self.id, S.self.name, S.self.color, false, Math.max(0, lead - 400)), self: true })
    return out
  }
  const run = () => applyPositions(rows())
  run()
  S.demo = setInterval(run, 2000)
  setTimeout(() => setMode('follow'), 3000)
}
