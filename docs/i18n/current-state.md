# Sprachen · Current State

> **Authority:** Current State · Gate 3 · Stand 30.08.2026
> **Live-fähig:** DE · TR · EN · **AR (RTL)**

---

## Wo die Sprachen stehen

| Sprache | Wörterbuch | `Localized`-Daten | Routen | in `locales` | a11y | Status |
|---------|-----------|-------------------|--------|--------------|------|--------|
| **DE** | ✅ | ✅ | ✅ 21 | ✅ | 112/112 | **live** |
| **TR** | ✅ | ✅ | ✅ 20 | ✅ | 112/112 | **live** |
| **EN** | ✅ | ✅ | ✅ **21** | ✅ | **38/38** | **live-fähig** |
| **AR** | ✅ | ✅ | ✅ 21 | ✅ | **36/36** | **live-fähig · RTL** |
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

## Arabisch und RTL — was Gate 3 gebaut hat

| | Umfang |
|---|---|
| Wörterbuch `dictionary.ar` | 42 Bereiche, dieselbe Struktur wie DE |
| `Localized`-Daten | 250 Einträge in service-pages, site-data, insights, betriebscheck, branchen |
| Routen | `app/(ar)/ar/…` — 21 Seiten + Layout |
| **gesamt** | **~11 800 Wörter** |

### Was lateinisch bleibt

Eigennamen (creaDIG, meAI, fibero, CASSAMEA, meahv, Resend, Vercel, WCAG)
und **westliche Ziffern** (2017, 149 EUR). Ein transkribierter Produktname
ist im Arabischen weder in der Suche noch auf der Rechnung wiederzufinden;
und der Markt ist Europa — die Rechnung, die folgt, trägt dieselben Ziffern.

### RTL ist kein `text-align`

Drei Ebenen, alle drei nötig:

| Ebene | Was passiert |
|---|---|
| **Dokument** | `dir="rtl"` am `<html>`, aus `LOCALE_DIR` — die einzige Stelle |
| **Layout** | **101 physische Utilities** in 43 Dateien auf die logische Achse: `ml/mr → ms/me`, `pl/pr → ps/pe`, `left/right → start/end`, `border-l/r → border-s/e`, `text-left/right → text-start/end` |
| **CSS** | die vier `left:`-Regeln der Sektions-Schiene → `inset-inline-start` |

Danach: **0 physische Richtungs-Utilities** im Projekt. Kein zweites
Stylesheet, kein `arabic.css` — dieselben Klassen drehen sich mit `dir`.

Gemischte Richtung braucht **keine** Einzelauszeichnung: steht `dir` am
Dokument, erledigt der Bidi-Algorithmus des Browsers lateinische Namen und
E-Mail-Adressen innerhalb arabischer Sätze. Nachgemessen auf
`/ar/impressum`: `info@creadig.de` rendert 113 px breit und in der
richtigen Reihenfolge, nicht gespiegelt.

### Ein Defekt, den der Compiler NICHT gefunden hat

Beim Einführen von Arabisch meldete `tsc` **357 fehlende Übersetzungen** —
und eine nicht. `retainer.includes` trug `as Record<Locale, string[]> | null`.
Eine **Typzusicherung schaltet genau die Prüfung ab**, die dieses Feld
braucht; der Fehler fiel erst im Build auf, als `includes.ar` `undefined`
war und `.map()` darauf lief.

Behoben, und beide `as`-Zusicherungen in `site-data.ts` durch `satisfies`
ersetzt: `satisfies` prüft, ohne den Typ zu verbiegen.

**Das ist die Lehre dieser Stufe:** Der Paritäts-Zwang trägt nur, solange
niemand ihn per Cast umgeht.

### Das Vorschaubild auf Arabisch — offene Materialfrage

`ImageResponse` bringt nur eine generische Fallback-Schrift mit, und die hat
keine arabischen Glyphen. Der Build brach reproduzierbar ab
(`lookupType: 5 - substFormat: 3 is not yet supported` — die Formenbildung
arabischer Buchstaben).

Arabisch zeigt deshalb auf die **englische** Karte: lateinisch gesetzt,
markenrichtig, keine falsche Aussage. Eine arabische Karte mit Ersatzzeichen
wäre schlechter als eine fremdsprachige.

**OWNER:** eine arabische Schriftdatei (Lizenz und Gewicht sind eine
Entscheidung, kein Implementierungsdetail). Danach ist es eine Route.

### Geprüft

| Prüfung | Ergebnis |
|---|---|
| 17 AR-Routen + 404 | alle 200 / 404 korrekt |
| `lang="ar" dir="rtl"` | 36 von 36 Durchläufen |
| berechnete `direction` | `rtl`, 0 Abweichungen |
| **waagerechter Überlauf** | **0** bei 1440 und 390 px |
| axe (WCAG 2.1 AA) | **36 Durchläufe, 0 Verletzungen** |
| gemischte Richtung | E-Mail korrekt, nicht gespiegelt |
| hreflang | de · tr · en · ar · x-default=de, alle Ziele existieren |
| Sprachschalter | DE · TR · EN · AR, Endonyme |
| **LTR-Regression** | DE/TR **112/112** · EN **36/36 axe 0** · 22 Layout-Prüfungen, 0 Überlauf |

---

## Was RTL NICHT beweist

Die Prüfung ist maschinell und visuell-metrisch. Nicht geprüft:

- ein Durchlauf mit einem arabischen Muttersprachler
- ein arabischer Screenreader (NVDA/JAWS mit arabischer Stimme)
- die sprachliche Qualität durch einen zweiten Übersetzer

„0 Verletzungen und 0 Überlauf" heißt: die Mechanik stimmt. Ob der Text
**gut** ist, entscheidet ein Mensch — dieselbe Grenze, die für Türkisch und
Englisch gilt.
