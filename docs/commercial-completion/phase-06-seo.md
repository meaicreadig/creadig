# Phase 6 — SEO, Indexierung und Suchwahrheit

**Stand:** 11.09.2026

## Die Frage

Nicht *„sind Metadaten vorhanden?"* — sondern: **Erzählen Suchmaschine,
Vorschau und Index dieselbe Wahrheit wie die Seite darunter?**

## 1 · `/arbeiten` — die Indexentscheidung

**Lage:** 82 Wörter. Eine Überschrift, der Satz, dass keine Freigabe vorliegt,
ein Verweis auf die Produkte. Null freigegebene Kundenarbeiten.

| Option | Bewertung |
|---|---|
| `index, follow` | Eine fast leere Seite konkurriert um „creaDIG Arbeiten" und liefert dem Sucher nichts. Dünner Inhalt schadet nicht nur der Seite, sondern der Bewertung der Domain. **Verworfen** |
| Weiterleitung auf `/produkte` | Genau die Vermischung, die Gate 01 mit **D-16** aufgelöst hat: `/produkte` ist der Ort der eigenen Produkte, `/arbeiten` der für freigegebene Kundenarbeit. Eine Weiterleitung nähme die Trennung technisch zurück und verbrennte die Adresse für den Tag, an dem sie trägt. **Verworfen** |
| **`noindex, follow`** | Die Seite bleibt erreichbar, bleibt verlinkt, gibt ihre Verweiskraft weiter und steht nicht im Index. **Gewählt** |

**Entscheidend ist, dass es keine Momentaufnahme ist:**

```ts
noIndex: genannteClientWorks.length === 0
```

Dieselbe Bedingung trägt den sichtbaren Text, die Metadaten und die
strukturierten Daten. **Mit der ersten Freigabe kehrt die Seite ohne
Code-Änderung in Index und Sitemap zurück** — in allen vier Sprachen zugleich.
Denselben Mechanismus benutzt `/insights` seit seiner Einführung.

**Folgerichtig mitgezogen:**

| | |
|---|---|
| Sitemap | `/arbeiten` steht nur drin, wenn `genannteClientWorks.length > 0`. Eine Sitemap, die eine Seite anbietet, die sich selbst aus dem Index nimmt, gibt zwei gegensätzliche Anweisungen |
| Strukturierte Daten | keine `ItemList` ohne freigegebene Arbeit (Phase 1, hier als Regressionssperre) |
| Interne Verweise | genau **einer je Seite** (Fußzeile), **null** im `<main>` der Startseite. Die Route überlebt für die Zukunft, wird aber nicht als Vertrauenspfad ausgestellt. `follow` hält den Crawl-Pfad offen |

## 2 · Was geprüft und für richtig befunden wurde

| Prüfung | Ergebnis |
|---|---|
| `JobPosting` | **keines** — 0 offene Rollen; die Auszeichnung wäre ein Versprechen an eine Maschine, das ein Mensch auf der Seite nicht wiederfindet |
| Produkte im Aufbau | nutzen `SoftwareApplication`, **kein** `Product` mit `InStock`. Die 744 `InStock`-Vorkommen im Bau gehören zum Angebotskatalog des Hauses (Website-Paket, Prüfung, Betreuung) — Leistungen, die tatsächlich verkäuflich sind |
| Canonical | vorhanden auf allen geprüften Routen; lokalisierte Seiten zeigen **auf sich selbst**, nicht auf die deutsche Fassung |
| hreflang | `de`, `tr`, `en`, `ar` **und** `x-default` — vollständig, auch auf der neuen Route `/aufwandsrechner` |
| Leistungs-Beschreibungen | sechs Seiten, **sechs verschiedene** Beschreibungen |
| Alte Kundennamen | **null** Treffer im gesamten gebauten HTML (NV SWISS, maqam, Bir Damla, Glasfaser NordWest) |
| Namen aus dem fibero-Betrieb | **null** Treffer (Auftraggeber, Subunternehmer) |
| Startseiten-Beschreibung | wirbt nicht mehr mit Kunden (Phase 1), Länge im Rahmen |
| Metadaten-Kopf | keine Zusage-Sprache, keine unbelegte Wirkung, kein „garantiert" |

### Ein korrigierter Fehlalarm

Ein erster Scan meldete „**kein einziges hreflang im ausgelieferten HTML**".
Das war falsch: Next schreibt das Attribut als `hrefLang`, und mein Muster war
case-sensitiv. HTML-Attribute sind es nicht. Geprüft statt geglaubt — und
nichts „repariert", was nicht kaputt war.

## 3 · Alte Kundennamen im Suchindex

| Ort | Befund |
|---|---|
| Quellcode | null |
| Gebautes HTML (125 Seiten) | null |
| Gecrawlte Seite (131 Routen) | null |
| Suchmaschinen-Zwischenspeicher | **möglicherweise vorhanden** |

**Klasse: `EXTERNAL_SEARCH`.** Es gibt keine Code-Änderung, die das löst. Eine
Aktion in der Search Console war ausdrücklich untersagt und wurde nicht
ausgeführt. Was die Seite tun kann, tut sie: Titel, Beschreibung und
strukturierte Daten geben einem neuen Crawl genug aktuelle Wahrheit, um alte
Ausschnitte zu ersetzen. Kein versteckter Bereinigungstext, keine negative
Nennung alter Namen.

## 4 · Kein Text für Suchmaschinen

Phase 5 hat `/leistungen` gerade entlastet. Diese Phase hat **kein einziges
Wort** hinzugefügt, um ein Schlüsselwort unterzubringen.

## Nachgewiesen durch

`scripts/check-seo.mjs` (Gate im `postbuild`) — sieben Regeln: Indexstrategie
folgt der Freigabelage in beide Richtungen, keine `ItemList` ohne Arbeit, kein
Widerspruch zur Sitemap, kein `JobPosting` ohne offene Rolle, kein `InStock`
für Produkte im Aufbau, canonical und hreflang vollständig und
selbstreferenziell, unterscheidbare Leistungs-Beschreibungen, keine verbotenen
Namen oder Zusagen in den Metadaten.
