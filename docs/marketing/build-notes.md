# creaDIG · Insights = Build Notes

> **Authority:** Spec · MP-E · Stand 29.08.2026
> **Kurzform:** Insights sind **Bau-Notizen**, keine Blogartikel. Wir schreiben
> über etwas, das wir gebaut haben — nicht über ein Thema, das wir ranken wollen.

---

## Die Regel

**Ein Insight entsteht aus einer Entscheidung, die getroffen wurde.**
Nicht aus einem Keyword, nicht aus einem Redaktionsplan, nicht aus „wir sollten
mal wieder was posten".

Wenn niemand im Haus in den letzten Wochen etwas gebaut, verworfen oder
umgebaut hat, gibt es diesen Monat keinen Insight. Das ist kein Rückstand.
Ein leerer Monat ist ehrlicher als ein Text über „Die 7 Vorteile der
Digitalisierung im Handwerk".

**Prüffrage vor jedem Text:** Steht hier etwas, das nur jemand schreiben kann,
der es gebaut hat? Wenn nein — löschen.

---

## Was ein Insight NICHT ist

| Nicht | Warum |
|---|---|
| „Die 7 Vorteile von …" | Steht schon tausendmal im Netz, von Leuten ohne Werkstatt |
| „Was ist eigentlich ein CRM?" | Lexikon-Text. Wer das sucht, sucht keinen Anbieter |
| Trend-Kommentar zu einer KI-Ankündigung | Wir bauen Systeme, wir kommentieren keine Pressemitteilungen |
| Der Text zum Keyword | Dafür gibt es `lib/seo-landings.ts` — und die ist leer, weil kein Ort bestätigt ist |
| Kundengeschichte ohne Freigabe | Fallstudien laufen über `approved: true`, nicht über Insights |

---

## Struktur — fünf Teile, in dieser Reihenfolge

### 1 · Die Situation (2–4 Sätze)
Was lag vor, konkret. Kein Aufhänger, keine rhetorische Frage. Wer die
Situation nicht kennt, ist nicht gemeint.

### 2 · Was zuerst versucht wurde — und warum es nicht trug
**Der Teil, der einen Insight von Werbung unterscheidet.** Hier steht der
Umweg, der Irrtum, die Variante, die verworfen wurde. Wer nur das Ergebnis
zeigt, schreibt einen Prospekt.

### 3 · Die Entscheidung
Was stattdessen gemacht wurde und woran sie hing. Mit dem Kriterium, nicht nur
mit dem Ergebnis.

### 4 · Was es gekostet hat
Ehrlich: Aufwand, Grenzen, was danach schlechter war. Jede Entscheidung nimmt
etwas weg. Ein Text, in dem alles besser wurde, ist nicht zu Ende gedacht.

### 5 · Was daraus Regel wurde
Ein Satz, der auch außerhalb dieses Falls gilt — oder ausdrücklich keiner
(„gilt nur hier, weil …").

**Länge:** so lang, wie die Entscheidung es braucht. Meist 400–900 Wörter.
Ein Insight, der 2.000 Wörter braucht, enthält zwei.

---

## Beispiel-Gerüst (Struktur, kein fertiger Text)

> **Titel:** Warum unser Markenzeichen dreimal gebaut und dreimal gelöscht wurde
>
> **1 Situation** — Die Seite hatte ein Motiv aus dem alten Corporate Design:
> ein Dreiecksraster, auf vierzehn Flächen dasselbe, Dichte aus einem
> Zufallsgenerator.
>
> **2 Erster Versuch** — Fünf Knoten auf einer steigenden Kette,
> deterministisch aus `site-data`. Logisch korrekt, datengetrieben — und es sah
> aus wie das Molekül-Hintergrundbild jedes KI-Startups.
>
> **3 Zweiter Versuch** — Dieselben fünf Ebenen als Schienen an einer
> Fluchtlinie, in der Sprache der Leistungspyramide. Näher dran, trotzdem
> abgelehnt.
>
> **4 Kosten** — Zwei Entwicklungsrunden, zwei Commits, ein Rückbau. Die Seite
> hat heute kein Zeichen.
>
> **5 Regel** — Ein Zeichen, dessen Bedeutung nur im Quelltext-Kommentar steht
> und nirgends auf der Seite, ist kein Zeichen für Besucher. Die Auflösung muss
> als Wort auf der Seite stehen, bevor die Form gezeichnet wird.

Der Fall ist echt und im Repo belegt (`2581cf0`, `c061017`, `93d9062`,
`f417d5f`). Er ist hier als **Gerüst** notiert — ob er veröffentlicht wird,
entscheidet der Owner.

---

## Veröffentlichen

| Punkt | Regel |
|---|---|
| Datenmodell | `lib/insights.ts` — `published: false` bis der Owner es liest |
| Sprache | DE zuerst. TR ist eine Fassung, keine Übersetzung — und sie kommt, bevor der Text beworben wird |
| Kunden | Kein Kundenname ohne Freigabe. Auch nicht „ein Betrieb aus Osnabrück", wenn es nur einen gibt |
| Zahlen | Nur gemessene. „Bundle 46 KB kleiner" ja, „deutlich schneller" nein |
| Frequenz | Keine. Es gibt keinen Redaktionsplan, es gibt Bauarbeiten |

---

## Warum das langfristig mehr bringt als SEO-Texte

Ein Betrieb, der einen Dienstleister sucht, liest zwei Dinge: was der gebaut
hat, und wie der denkt. Das Erste ist `/arbeiten` und blockiert auf Material
(MP-C). Das Zweite sind diese Notizen — und die kosten nichts außer der
Ehrlichkeit, auch den Umweg aufzuschreiben.

Der Nebeneffekt ist Reichweite, nicht das Ziel. Wer es umdreht, schreibt
wieder „Die 7 Vorteile".
