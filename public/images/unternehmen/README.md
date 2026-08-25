# Fotos aus dem Haus

Hier hinein gehören **echte** Aufnahmen. Kein Stock, keine KI-Bilder, keine
Bürostudio-Aufnahmen — die Sektion „Aus dem Haus" auf `/unternehmen` rendert
lieber gar nicht, als etwas zu zeigen, das nicht der Ort ist.

## Erkannte Dateinamen

| Datei               | Was darauf sein soll                                  |
| ------------------- | ----------------------------------------------------- |
| `buero.jpg`         | Der Arbeitsraum im ICO, wie er aussieht                |
| `ico.jpg`           | Das ICO InnovationsCentrum, von außen oder innen       |
| `arbeitsplatz.jpg`  | Bildschirme mit echter Arbeit darauf                   |
| `whiteboard.jpg`    | Eine Skizze, die wirklich so entstanden ist            |

Erlaubte Endungen: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`.

## So wird es sichtbar

Datei ablegen, `npm run build` laufen lassen. Der `prebuild`-Hook ruft
`scripts/generate-company-media.mjs` auf, das Verzeichnis wird einmal
gelesen, und das Foto erscheint mit der Beschriftung aus `lib/dictionary.ts`
(`photos.slots.<slot>`), deutsch und türkisch. Kein Code-Eingriff.

Eine Datei mit einem anderen Namen wird ignoriert — der Build sagt beim
Durchlauf, welche das war.

Auch ein einzelnes Foto rendert sauber: Die Spaltenzahl folgt der Anzahl.

## Was NICHT hierhin gehört

* Personenfotos ohne Einwilligung der abgebildeten Person.
* Kundendaten auf Bildschirmen. Vor der Aufnahme abdecken oder ein
  Testsystem zeigen — ein lesbarer Kundenname auf einem Monitor ist eine
  Datenpanne mit Bildunterschrift.
* Das Standort-Foto der Parallax-Sektion. Das liegt weiterhin unter
  `public/images/ico-osnabrueck.jpg` (siehe `components/sections/location.tsx`).
