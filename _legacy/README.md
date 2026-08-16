# _legacy — die alte Vanilla-Seite

Archiv des Standes vor dem Umbau zur Next-Seite. Vollständig, unverändert,
lauffähig durch Öffnen von `index.html` im Browser.

| Datei | Was daraus übernommen wurde |
|---|---|
| `index.html` | Paket-Texte („für wen", Leistungslisten, Ergebnis-Zeilen), ehrlicher Ton (Beispielszenarien statt erfundener Testimonials), Kontaktformular-Logik (`ct_*`) |
| `termin.html`, `termin.js`, `termin.css` | Der komplette 4-Schritt-Wizard — portiert nach `components/termin/termin-wizard.tsx` samt Verfügbarkeitsregeln (Di/Mi/Do), Zeitfenstern und WhatsApp-Nachricht |
| `app-lang.js` | Mehrsprachigkeit — ersetzt durch `lib/dictionary.ts` (DE + TR) |
| `creadig-*.js/css` | Animationen und Hero-Effekte — bewusst **nicht** übernommen |
| `assets/`, `design-system/` | Alte Bilder und Tokens — CI kommt jetzt aus `public/brand/` und `app/globals.css` |

**Bewusst nicht übernommen:** dominante Dunkelflächen, tote `#`-Links,
Fake-Urgency („nur 2 Plätze"), erfundene Testimonials, die Geist-Schrift.

Nichts hier wird gebaut oder deployt — der Ordner liegt außerhalb von `app/`
und `public/` und ist reines Archiv.
