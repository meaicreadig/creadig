import { existsSync } from "node:fs"
import path from "node:path"

import { LocationParallax } from "@/components/sections/location-parallax"

/**
 * Standort-Foto. Der Build prüft einmalig, ob die Datei wirklich im Repo liegt —
 * fehlt sie, wird gar kein Bild-Request gestellt (kein 404 in der Konsole) und
 * die Sektion zeigt den Mesh-Platzhalter.
 *
 * TODO: `public/images/ico-osnabrueck.jpg` ergänzen — danach greift das Foto
 * ohne Code-Änderung (siehe public/images/README.md).
 */
const PHOTO_FILE = "images/ico-osnabrueck.jpg"

export function Location() {
  const hasPhoto = existsSync(path.join(process.cwd(), "public", PHOTO_FILE))

  return <LocationParallax photoSrc={hasPhoto ? `/${PHOTO_FILE}` : null} />
}
