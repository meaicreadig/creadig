# Freigabe-Kanon

> **Authority:** Kanon · Proof Operations P1 · 11.09.2026

## 1 · Die Kette

```
KANDIDAT → BELEG → FREIGABE → BEREIT → ÖFFENTLICH
```

Kein Schritt wird übersprungen, und keiner passiert automatisch.

## 2 · Der Zustand wird abgeleitet, nie gespeichert

Wie die Freigabelage seit Gate 13: Ein gespeicherter Zustand ist ab der ersten
Regeländerung still falsch. `lib/beleg-betrieb.ts` rechnet ihn bei jedem
Aufruf aus `deckung()`, `assets` und `owner-wahrheit` neu.

| Zustand | Was fehlt |
|---|---|
| `kandidat` | ein Beleg |
| `freigabe-noetig` | die schriftliche Zustimmung |
| `messung-noetig` | eine Messung, die trägt |
| `material-noetig` | eine sichere Aufnahme |
| `owner-wahrheit-noetig` | eine Tatsache, die nur der Owner kennt |
| `oeffentlich` | nichts |

## 3 · Die Website ist Verbraucher, nicht Besitzer

Sie liest ausschließlich, was freigegeben ist:

| Fläche | Quelle | Bedingung |
|---|---|---|
| `/arbeiten` | `genannteClientWorks` | Namensfreigabe gedeckt |
| Fallstudien | `approvedCaseStudies` | Fall-Freigabe gedeckt, Bedarf aus dem Inhalt |
| Produktbilder | `bildFuerOeffentlich()` | Asset-Lage `freigegeben` |
| `/datenschutz` | `processors[].dpaConfirmed` | Owner-Bestätigung |

Was **nie** nach draußen geht: interne Notizen, Freigabe-Fundstellen,
Owner-Blocker, gesperrte Pfade, unveröffentlichte Messungen.
`scripts/check-beleg-betrieb.mjs` prüft das am gebauten HTML.

## 4 · Material: Verpixeln reicht nicht

`lib/asset-sicherheit.ts`, vier Zustände:

| | |
|---|---|
| `ungeprueft` | niemand hat hingesehen |
| `blockiert-daten` | echte Daten — auch verpixelt nicht zeigbar |
| `sicher-demo` | erfundene Daten, noch nicht freigegeben |
| `freigegeben` | einziger Zustand, der öffentlich wird |

**Ein unbekanntes Subjekt ist gesperrt, nicht erlaubt.** Wer ein Produkt
hinzufügt und den Eintrag vergisst, bekommt kein Bild — keinen stillen
Durchlauf.

## 5 · Der erste öffentliche Kundenfall

Was vorliegen muss, damit `/arbeiten` wieder in den Index zurückkehrt:

1. Ein Eintrag in `caseStudies` oder `clientWorks` — bewusst angelegt.
2. Eine `Release` mit Person, Rolle, Firma, **Form**, Datum, Umfängen und
   **Fundstelle**. Das Dokument selbst gehört nicht ins Repository.
3. Der Umfang muss decken, was der Inhalt verlangt — `benoetigtFuerFall()`
   leitet das aus Kennzahlen und Zitat ab.
4. Für eine Kennzahl zusätzlich eine tragende Messquelle
   (`messquelleTraegt()` verweigert „intern" und „Schätzung").

Dann kehrt `/arbeiten` **ohne Code-Änderung** in Index und Sitemap zurück
(Phase 6, D-58).

## 6 · Was ausdrücklich nicht passiert

Kein Kundenkontakt aus dem System. Keine Freigabe-Mail. Keine
Ein-Klick-Veröffentlichung. Kein Kunde wird automatisch Kandidat. Kein
historischer Kunde wird aktiviert.
