# Sprachen · Current State

> **Authority:** Current State · Gate 3 · Stand 30.08.2026
> **Live-fähig:** DE · TR · **EN**
> **Nicht begonnen:** AR, RTL

---

## Wo die Sprachen stehen

| Sprache | Wörterbuch | `Localized`-Daten | Routen | in `locales` | a11y | Status |
|---------|-----------|-------------------|--------|--------------|------|--------|
| **DE** | ✅ | ✅ | ✅ 21 | ✅ | 112/112 | **live** |
| **TR** | ✅ | ✅ | ✅ 20 | ✅ | 112/112 | **live** |
| **EN** | ✅ | ✅ | ✅ **21** | ✅ | **38/38** | **live-fähig** |
| **AR** | ❌ | ❌ | ❌ | ❌ | — | nicht begonnen |
| RU | — | — | — | — | — | Legacy-Archiv |

---

## Englisch — was Gate 3 gebaut hat

| | Umfang |
|---|---|
| Wörterbuch `dictionary.en` | 1 427 Zeilen · ~8 900 Wörter · 42 Bereiche |
| `Localized`-Daten | **249 Einträge · ~2 900 Wörter** in service-pages, site-data, insights, betriebscheck, branchen |
| Routen | `app/(en)/en/…` — 21 Seiten + Layout mit `lang="en"` + eigene OG-Grafik |
| **gesamt** | **~11 800 Wörter** |

### Der Compiler hat die Arbeit geführt

`Localized` war `{ de: string; tr: string }` — die Zweisprachigkeit stand im
Typ. Jetzt ist es `Record<Locale, string>`. Der entscheidende Schritt war,
**zuerst** `Locale` um `"en"` zu erweitern: danach hat `tsc` **357 Stellen**
genannt, an denen eine Übersetzung fehlte. Keine davon konnte übersehen
werden, weil das Projekt nicht baut, solange eine offen ist.

Das ist der Grund, warum diese Sprache vollständig ist und nicht „fast".

### Was dabei aufgefallen ist

`alternateLocale` stand zweimal als `locale === "de" ? "tr" : "de"` im Code.
Bei zwei Sprachen ist „die andere" eindeutig; bei drei ist es eine falsche
Angabe. Jetzt werden alle gepflegten ausser der eigenen genannt.

Dasselbe Muster in der Sitemap (de/tr getippt), im Sprachschalter (zwei feste
Knöpfe) und in der OG-Grafik-Tabelle. Alle vier leiten jetzt aus `locales` ab.

### Slugs bleiben deutsch

`/en/leistungen`, nicht `/en/services`. Das ist die bestehende Repo-Regel
(gleiche Slugs in allen Sprachen, genau eine Ausnahme: `/tr/erisilebilirlik`).
Übersetzte Slugs wären hübscher und machen aus jedem Sprachwechsel eine
Übersetzungstabelle, die jemand pflegen muss — und aus jedem vergessenen
Eintrag einen 404. Eine Änderung daran ist eine eigene Owner-Entscheidung mit
SEO-Folgen, keine Nebenwirkung dieser Stufe.

### Geprüft

| Prüfung | Ergebnis |
|---|---|
| 18 EN-Routen + 404 | alle 200 / 404 korrekt |
| `<html lang="en">` | auf allen 19 Seiten |
| canonical je Seite | `https://creadig.de/en/…` |
| hreflang | de · tr · en · x-default=de, alle Ziele existieren |
| Sitemap | 81 `hreflang="en"`-Einträge |
| Sprachschalter | DE · TR · EN, Endonyme |
| axe (WCAG 2.1 AA) | **38 Durchläufe, 0 Verletzungen** |
| deutsche Textreste | keine gefunden |
| DE/TR-Regression | 112/112 unverändert |

---

## Arabisch

Nicht begonnen. Zwei getrennte Arbeiten, die nicht verwechselt werden dürfen:

1. **Inhalt** — nochmals rund 8 900 Wörter, neu verfasst aus dem DE-Canon.
2. **RTL** — `dir="rtl"`, logische CSS-Eigenschaften statt gespiegelter
   Stylesheets, Bidi-Isolation für E-Mail, Telefon, URLs und lateinische
   Produktnamen, dazu die Prüfung von Navigation, Formularen, Betriebscheck,
   Termin-Assistent, Fokus und Tastatur.

**Übersetzt ≠ RTL.** Eine arabische Fassung ohne bestandene RTL-Abnahme geht
nicht live.
