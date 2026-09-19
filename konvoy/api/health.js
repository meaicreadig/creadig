// GET /api/health — prüft serverseitig, ob Supabase erreichbar ist und die Sicht konvoy_live antwortet.
// Antwort: { configured, ok, status, rows, error }. Für den Hochzeitstag: einmal aufrufen, „ok: true“ reicht.
export default async function handler(req, res) {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
  res.setHeader('Cache-Control', 'no-store')
  if (!url || !key) return res.status(200).json({ configured: false, ok: false, error: 'SUPABASE_URL / SUPABASE_ANON_KEY fehlen' })
  const headers = { apikey: key, Accept: 'application/json' }
  if (/^eyJ/.test(key)) headers.Authorization = `Bearer ${key}`
  try {
    // ?write=1 → Schreibweg prüfen: Testzeile anlegen, zurücklesen, löschen (zeigt fehlende RLS-Policies sofort)
    if (req.query && 'write' in req.query) {
      const row = { id: 'health-check', event: 'health-check', name: 'health', color: '#000000', lead: false, lat: 52.27, lng: 8.05, progress: 0 }
      const w = await fetch(`${url}/rest/v1/konvoy_positions?on_conflict=id`, {
        method: 'POST', headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(row),
      })
      const wText = w.ok ? null : (await w.text()).slice(0, 300)
      const rb = await fetch(`${url}/rest/v1/konvoy_live?id=eq.health-check&select=id,age,progress`, { headers })
      let back = []
      try { back = await rb.json() } catch {}
      const d = await fetch(`${url}/rest/v1/konvoy_positions?id=eq.health-check`, { method: 'DELETE', headers })
      const ok = w.ok && Array.isArray(back) && back.length === 1 && d.ok
      return res.status(200).json({ configured: true, ok, write: w.status, readBack: Array.isArray(back) ? back.length : null, delete: d.status, error: wText })
    }
    const r = await fetch(`${url}/rest/v1/konvoy_live?select=id,age&limit=5`, { headers })
    const text = await r.text()
    let rows = null
    try { rows = JSON.parse(text) } catch {}
    res.status(200).json({ configured: true, ok: r.ok, status: r.status, rows: Array.isArray(rows) ? rows.length : null, error: r.ok ? null : text.slice(0, 300) })
  } catch (err) {
    res.status(200).json({ configured: true, ok: false, error: String(err?.message || err) })
  }
}
