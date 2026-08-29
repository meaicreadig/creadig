# Echte Produkt-Aufnahmen (gated)

Hier liegen **ausschließlich Aufnahmen der echten Anwendung mit
ausschließlich synthetischen Daten** — keine Mockups, keine Renderings,
keine KI-erzeugten Dashboards, und **nichts aus dem Produktivsystem mit
Kundendaten**.

Die Umgebung darf Demo-Instanz, Staging oder lokale Kopie sein — entscheidend
sind **echte UI + Demodaten**, nicht der Host-Name der Instanz.

```
public/works/products/<slug>/<beliebiger-name>.png
```

Slugs: `meai` · `fibero` · `cassamea` · `meahv`

* Formate: `.png` `.jpg` `.jpeg` `.webp` `.avif`
* Reihenfolge auf der Seite = alphabetisch nach Dateiname
  (`01-uebersicht.png`, `02-aufgaben.png`, …)
* Kein Code-Eingriff nötig: `scripts/generate-product-media.mjs` liest das
  Verzeichnis zur Bauzeit (`prebuild`). Liegt nichts vor, versteckt sich die
  Interface-Sektion — statt einen Platzhalter zu zeigen, der ein Interface
  behauptet.

---

## Die Zusage, die diese Dateien einlösen müssen

Unter jeder Abbildung steht auf der Seite:

> **„Echte Oberfläche, Demodaten."** · TR: „Gerçek arayüz, örnek veriler."

Das sind zwei Aussagen, und beide müssen stimmen:

| Teil | Heißt |
|---|---|
| **Echte Oberfläche** | Die tatsächliche Anwendung. Kein Figma, kein Rendering, kein generiertes Dashboard. |
| **Demodaten** | Jeder Name, Betrag, jede Adresse im Bild ist erfunden. |

**Ein Produktionsbild macht diese Zeile zur Lüge** — und veröffentlicht
nebenbei Kundendaten an jeden Besucher. Verpixeln reicht nicht: Spaltenbreiten,
Summen und Reihenfolgen bleiben lesbar.

Der verbindliche Standard mit Musterbestand
(`Musterbetrieb Nord GmbH`, `@example.com`, reservierte Rufnummern) und der
Prüfliste vor jeder Aufnahme steht in **`docs/ops/demo-data-standard.md`**.

## Kategorie

Alles hier ist **Eigenes Produkt** (`docs/ops/proof-kinds.md`). Es belegt, was
creaDIG gebaut hat und betreibt — **nicht**, dass ein Kunde damit arbeitet.
Diese Bilder dürfen nie als Kundenprojekt oder Kundenergebnis gezeigt werden.
