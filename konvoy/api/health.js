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
    const r = await fetch(`${url}/rest/v1/konvoy_live?select=id,age&limit=5`, { headers })
    const text = await r.text()
    let rows = null
    try { rows = JSON.parse(text) } catch {}
    res.status(200).json({ configured: true, ok: r.ok, status: r.status, rows: Array.isArray(rows) ? rows.length : null, error: r.ok ? null : text.slice(0, 300) })
  } catch (err) {
    res.status(200).json({ configured: true, ok: false, error: String(err?.message || err) })
  }
}
