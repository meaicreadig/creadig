// ─────────────────────────────────────────────────────────────────────────────
// KONVOY · Event-Konfiguration
// Das ist die EINZIGE Datei, die für eine Hochzeit angepasst wird.
// Wird sowohl im Browser (app.js) als auch auf dem Server (api/route.js) geladen.
// ─────────────────────────────────────────────────────────────────────────────
export const EVENT = {
  // Schlüssel für die Live-Daten (Supabase-Tabelle). Pro Hochzeit eindeutig lassen.
  id: 'hochzeit-osnabrueck-2026',

  title: 'Hochzeitskonvoi',
  couple: 'Braut & Bräutigam',   // TODO: Namen des Paares
  date: '',                      // TODO: 'YYYY-MM-DD' — leer = Countdown aus, nur "Start 12:00 Uhr"
  startTime: '12:00',

  // PIN, den nur das Brautauto (Führungsfahrzeug) kennt.
  leadPin: '1234',

  // Konvois fahren langsamer als der Routenplaner rechnet (Kolonne, Hupen, Ampeln).
  speedFactor: 1.5,

  // Osnabrück — Suchraum fürs Geocoding (minLon, minLat, maxLon, maxLat) + Kartenzentrum.
  geo: { center: [8.05, 52.28], bbox: [7.93, 52.2, 8.17, 52.35] },

  // Die Route in Reihenfolge. type: start | via | stop | end
  //  - via  = Straße, durch die der Konvoi fährt (nur Wegpunkt, kein Halt)
  //  - stop = geplanter Halt mit Dauer in Minuten
  //  - queries = Suchbegriffe fürs Geocoding, der erste Treffer im Suchraum gewinnt
  //  - lat/lng = optional feste Koordinaten (z. B. exakte Kreuzung), dann kein Geocoding
  waypoints: [
    { type: 'start', name: 'Start', address: 'Belmer Straße 18, Osnabrück',
      queries: ['Belmer Straße 18, Osnabrück'] },
    { type: 'via', name: 'Schützenstraße', queries: ['Schützenstraße, Osnabrück'] },
    { type: 'via', name: 'Tannenburgstraße', queries: ['Tannenburgstraße, Osnabrück'] },
    { type: 'via', name: 'Heiligenweg', queries: ['Heiligenweg, Osnabrück'] },
    { type: 'via', name: 'Schellenbergstraße', queries: ['Schellenbergstraße, Osnabrück'] },
    { type: 'via', name: 'Natruper Straße', queries: ['Natruper Straße, Osnabrück'] },
    { type: 'stop', name: 'POCO · kurzer Halt', address: 'Hannoversche Straße, Osnabrück',
      dwell: 5, note: 'ca. 5 Minuten hupen und feiern, dann weiter',
      queries: ['POCO, Hannoversche Straße, Osnabrück', 'POCO Osnabrück', 'Hannoversche Straße, Osnabrück'] },
    { type: 'via', name: 'Meller Straße', queries: ['Meller Straße, Osnabrück'] },
    { type: 'end', name: 'Ziel · Parkplatz Landesamt für Soziales', address: 'Iburger Straße 30, 49082 Osnabrück',
      queries: ['Iburger Straße 30, Osnabrück', 'Landesamt für Soziales, Osnabrück'] },
  ],
}
