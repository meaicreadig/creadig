// GET /api/config — öffentliche Supabase-Zugangsdaten (Anon-Key ist per Design öffentlich).
// Werte kommen aus den Vercel-Umgebungsvariablen SUPABASE_URL + SUPABASE_ANON_KEY.
export default function handler(req, res) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json({ configured: Boolean(url && anonKey), url, anonKey })
}
