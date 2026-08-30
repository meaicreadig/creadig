# Sprachen · Current State

> **Authority:** Current State · Gate 3 · Stand 30.08.2026
> **Live:** DE · TR
> **Fertig, aber nicht veröffentlicht:** EN (Wörterbuch)
> **Nicht begonnen:** AR, RTL

---

## Wo die Sprachen stehen

| Sprache | Wörterbuch | `Localized`-Daten | Routen | in `locales` | öffentlich |
|---------|-----------|-------------------|--------|--------------|------------|
| **DE** | ✅ | ✅ | ✅ 21 | ✅ | **live** |
| **TR** | ✅ | ✅ | ✅ 20 | ✅ | **live** |
| **EN** | ✅ **neu** | ❌ | ❌ | ❌ | **nein — bewusst** |
| **AR** | ❌ | ❌ | ❌ | ❌ | nein |
| RU | — | — | — | — | Legacy-Archiv, keine Migration |

---

## Was Gate 3 an Sprache gebracht hat

### 1 · Die Architektur trägt jetzt beliebig viele Sprachen

`lib/routes.ts` leitete Präfixe, hreflang und Sprachtrennung bis dahin aus
einer festen Konstante `TR_PREFIX` ab — fünf Stellen, vier Funktionen. Eine
dritte Sprache hätte einen Logik-Umbau bedeutet.

Jetzt leiten `localePath`, `splitLocale`, `localeAlternates` und die Sitemap
aus `locales` ab. Eine Sprache hinzuzufügen ist ein Listeneintrag.

**Nachgemessen** gegen den committeten Stand, vier Adressen, hreflang-Block
Zeichen für Zeichen identisch — der Umbau hat DE/TR nicht angefasst.

### 2 · Das englische Wörterbuch ist vollständig

`lib/dictionary.ts` → `en`: **1 427 Zeilen, rund 8 900 Wörter**, alle 42
Bereiche.

Quelle war der **aktuelle deutsche System-Haus-Canon**, nicht die alte
Website. Die Legacy-Seite hatte Englisch, beschreibt dort aber eine
Digitalagentur mit anderen Paketen und Preisen; sie ist als
Terminologie-Referenz benutzt worden und an keiner Stelle als Positionierung.

**Es ist keine wörtliche Übersetzung.** Der deutsche Text lebt von kurzen,
harten Sätzen; eine Wort-für-Wort-Fassung liest sich im Englischen steif und
verliert genau die Ruhe, die die Marke ausmacht. Die englische Fassung ist
neu formuliert und behält Bedeutung, Hierarchie und Tonfall.

Beibehalten: `creaDIG`, `meAI`, `fibero`, `CASSAMEA`, `meahv`, Ortsnamen,
Paragraphenzeichen deutscher Gesetze, die realen Preise.

---

## Warum EN noch nicht in `locales` steht

Weil es sonst eine **halbe Sprache** wäre — und der Canon verbietet genau das.

Ein Wörterbuch allein macht keine Sprachfassung. Es fehlen:

| # | Was fehlt | Umfang |
|---|-----------|--------|
| 1 | `Localized`-Typ auf die Sprachliste erweitern | 1 Typ, `lib/site-data.ts:666` |
| 2 | `en`-Strings in `site-data` · `insights` · `betriebscheck` · `branchen` | **158 Einträge, ~1 700 Wörter** — darunter ein langer Fachbeitrag |
| 3 | Routenbaum `app/(en)/en/…` | 21 Dateien à 5 Zeilen + ein Layout mit `lang="en"` |
| 4 | `locales` auf `["de","tr","en"]` | 1 Zeile |
| 5 | `openGraphLocale.en` | 1 Zeile |
| 6 | a11y-Suite um die EN-Routen erweitern | `scripts/a11y.mjs` |

Punkt 2 ist die eigentliche Arbeit; der Rest ist mechanisch.

---

## Das Gate, das den Zustand ehrlich hält

```ts
type AssertEnParity = SameShape<Dictionary, (typeof dictionary)["en"]>
```

Dieselbe Typprüfung, die DE und TR seit jeher aneinanderbindet, gilt jetzt
auch für Englisch — **obwohl EN nicht veröffentlicht ist**. Das ist der Punkt:
Der Block kann nicht halbfertig liegen bleiben. Fehlt ein Schlüssel, schlägt
`tsc` fehl, und zwar sofort und nicht erst beim Livegang.

`npx tsc --noEmit` läuft sauber — die englische Fassung hat **exakte
Struktur-Parität** mit der deutschen.

---

## Ein Satz, der mitwandern muss

`legal.privacyPoints` enthält auf Englisch:

> „We do not keep a database: your enquiry sits solely in our email inbox."

Das ist die korrekte Übersetzung des heute **wahren** deutschen Satzes. Wird
die Lead-Persistenz scharfgeschaltet, wird er in **allen drei** Sprachen
gleichzeitig falsch. Der Ersatztext steht in
`docs/ops/privacy-persistence-gate.md`; die Reihenfolge (Text vor Schalter)
steht in `docs/ops/neon-decision-pack.md`.

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
