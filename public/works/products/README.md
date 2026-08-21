# Echte Produkt-Aufnahmen (gated)

Hier liegen **ausschließlich echte Screenshots aus dem laufenden System** —
keine Mockups, keine Renderings, keine Deko.

```
public/works/products/<slug>/<beliebiger-name>.png
```

Slugs: `meai` · `fibero` · `cassamea` · `meahv`

* Formate: `.png` `.jpg` `.jpeg` `.webp` `.avif`
* Reihenfolge auf der Seite = alphabetisch nach Dateiname
  (`01-uebersicht.png`, `02-aufgaben.png`, …)
* Kein Code-Eingriff nötig: `lib/product-media.ts` liest das Verzeichnis zur
  Bauzeit. Liegt nichts vor, versteckt sich die Interface-Sektion — statt
  einen Platzhalter zu zeigen, der ein Interface behauptet.

Vor dem Ablegen prüfen: keine echten Kundennamen, Beträge oder personen-
bezogenen Daten im Bild.
