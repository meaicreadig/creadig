// ─────────────────────────────────────────────────────────────────────────────
// KONVOY · Event-Konfiguration
// Das ist die EINZIGE Datei, die für eine Hochzeit angepasst wird.
// Wird sowohl im Browser (app.js) als auch auf dem Server (api/route.js) geladen.
// ─────────────────────────────────────────────────────────────────────────────

// Suchraum Osten (Schinkel, Fledder, Schölerberg) — verhindert Treffer wie „Natruper Straße“ im Westen.
const EAST = [8.055, 52.25, 8.12, 52.295]

export const EVENT = {
  // Schlüssel für die Live-Daten (Supabase-Tabelle). Pro Hochzeit eindeutig lassen.
  id: 'hochzeit-osnabrueck-2026',

  title: 'Hochzeitskonvoi',
  couple: 'Hidayet & Emine Akyol',
  date: '',                      // TODO: 'YYYY-MM-DD' — leer = Countdown aus, nur "Start 12:00 Uhr"
  startTime: '12:00',

  // PIN, den nur das Brautauto (Führungsfahrzeug) kennt. TODO: echte PIN vom Owner
  leadPin: '1234',

  // Konvois fahren langsamer als der Routenplaner rechnet (Kolonne, Hupen, Ampeln).
  speedFactor: 1.5,

  // Osnabrück — Suchraum fürs Geocoding (minLon, minLat, maxLon, maxLat) + Kartenzentrum.
  geo: { center: [8.068, 52.268], bbox: [7.93, 52.2, 8.17, 52.35] },

  // Namen der beiden Phasen (Grenze = Wegpunkt vom Typ "pickup").
  phases: ['Zur Braut', 'Konvoi mit Brautpaar'],

  // Die Route in Reihenfolge. type: start | via | stop | pickup | end
  //  - via    = Straße, durch die der Konvoi fährt (nur Wegpunkt, kein Halt)
  //  - stop   = geplanter Halt mit Dauer in Minuten (dwell)
  //  - pickup = Braut abholen: beendet Phase 1, startet Phase 2 (Pflicht-Halt mit dwell)
  //  - queries = Suchbegriffe fürs Geocoding, der erste Treffer im Suchraum gewinnt
  //  - bbox    = optional eigener Suchraum [minLon, minLat, maxLon, maxLat]
  //  - lat/lng = optional feste Koordinaten (exakte Kreuzung / Straßenabschnitt), dann kein Geocoding.
  //              Gepinnt wird immer auf dem Abschnitt, der tatsächlich befahren wird — ein Punkt hinter
  //              der Abbiege-Kreuzung erzeugt sonst eine Wende-Schleife.
  waypoints: [
    // ── Phase 1 · Zur Braut (gelin alma) ─────────────────────────────────────
    { type: 'start', name: 'Start · Haus des Bräutigams', short: 'Start', address: 'Belmer Straße 18, Osnabrück',
      queries: ['Belmer Straße 18, Osnabrück'] },
    // auf der Schützenstraße nördlich der Einmündung (Photon trifft genau die Kreuzung → kleine Wende)
    { type: 'via', name: 'Schützenstraße', lat: 52.275910, lng: 8.075650, queries: ['Schützenstraße, Osnabrück'] },
    // Abschnitt zwischen Schützenstraße und Heiligenweg (Photon liefert sonst das Ostende → Wende)
    { type: 'via', name: 'Tannenburgstraße', lat: 52.278770, lng: 8.079862, queries: ['Tannenburgstraße, Osnabrück'] },
    { type: 'via', name: 'Heiligenweg', bbox: EAST, queries: ['Heiligenweg, Osnabrück'] },
    { type: 'via', name: 'Schellenbergstraße', bbox: EAST, queries: ['Schellenbergstraße, Osnabrück'] },
    // „Narupstraße“ kam per Diktat (auch „Nahrup“) — liegt in Fledder zwischen Schellenbergstraße und Hannoverscher Straße.
    { type: 'via', name: 'Narupstraße', bbox: EAST,
      queries: ['Narupstraße, Osnabrück', 'Nahrupstraße, Osnabrück', 'Narup Straße, Osnabrück', 'Nahrup Straße, Osnabrück'] },
    { type: 'stop', name: 'POCO · kurzer Halt', short: 'POCO', address: 'Hannoversche Straße 51, Osnabrück', bbox: EAST,
      dwell: 5, note: 'ca. 5 Minuten hupen und feiern, dann weiter',
      queries: ['POCO, Hannoversche Straße 51, Osnabrück', 'Hannoversche Straße 51, Osnabrück', 'POCO Osnabrück'] },
    { type: 'via', name: 'Meller Straße', bbox: EAST, queries: ['Meller Straße, Osnabrück'] },
    // Haus der Braut — gepinnt auf die Richtungsfahrbahn Süd der Iburger Straße vor Nr. 46
    { type: 'pickup', name: 'Haus der Braut', short: 'Braut', address: 'Iburger Straße 46, 49082 Osnabrück-Schölerberg',
      lat: 52.261627, lng: 8.055887, dwell: 20,
      note: 'Parken: Parkplatz Landesamt für Soziales, Iburger Straße 30',
      queries: ['Iburger Straße 46, Osnabrück'] },

    // ── Phase 2 · Konvoi mit Brautpaar ───────────────────────────────────────
    // östlicher Teil der Miquelstraße → weiter über Am Riedenbach zur Meller Straße (Mitte-Pin führt zum Umweg)
    { type: 'via', name: 'Miquelstraße', lat: 52.261100, lng: 8.060500, queries: ['Miquelstraße, Osnabrück'] },
    // Meller Straße Richtung Osten — Punkt östlich der Einmündung, sonst Wende am Westende
    { type: 'via', name: 'Meller Straße', lat: 52.258998, lng: 8.069436, queries: ['Meller Straße, Osnabrück'] },
    { type: 'via', name: 'Narupstraße', bbox: EAST,
      queries: ['Narupstraße, Osnabrück', 'Nahrupstraße, Osnabrück', 'Narup Straße, Osnabrück', 'Nahrup Straße, Osnabrück'] },
    { type: 'via', name: 'Schellenbergstraße', bbox: EAST, queries: ['Schellenbergstraße, Osnabrück'] },
    // Mindener Straße westlich der Kreuzung Heiligenweg/Schellenbergstraße (Richtung Buersche Straße)
    { type: 'via', name: 'Mindener Straße', lat: 52.273861, lng: 8.079470, queries: ['Mindener Straße, Osnabrück'] },
    { type: 'via', name: 'Buersche Straße', lat: 52.275579, lng: 8.066394, queries: ['Buersche Straße, Osnabrück'] },
    { type: 'via', name: 'Wittekindstraße', lat: 52.273574, lng: 8.050069, queries: ['Wittekindstraße, Osnabrück'] },
    { type: 'via', name: 'Neumarkt', lat: 52.272658, lng: 8.048452, queries: ['Neumarkt, Osnabrück'] },
    { type: 'end', name: 'Neuer Graben · Auflösung', short: 'Ziel', address: 'Neuer Graben, Osnabrück',
      lat: 52.272155, lng: 8.046336, note: 'Hier löst sich der Konvoi auf',
      queries: ['Neuer Graben, Osnabrück'] },
  ],
}
