# public/images

Fotos der Seite. Ein leeres Verzeichnis landet nicht in git — darum diese Datei.

## Erwartete Dateien

| Datei | Verwendung | Empfehlung |
|---|---|---|
| `ico-osnabrueck.jpg` | Standort-Sektion (Parallax) unter „Über uns" | Querformat, mind. 2400 × 1600 px, < 600 KB, Gebäude/Eingang bei Tageslicht |

Solange `ico-osnabrueck.jpg` fehlt, rendert `components/sections/location.tsx`
einen Platzhalter aus dem Signatur-Mesh — **kein 404, kein kaputtes Bild**.
Datei einfach hier ablegen: der nächste Build zeigt sie automatisch.
