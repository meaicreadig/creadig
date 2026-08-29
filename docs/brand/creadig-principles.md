# creaDIG · Prinzipien

> Sieben Sätze, an denen jede Entscheidung geprüft wird — im Code, im
> Angebot, im Gespräch. Sie sind keine Werbung. Sie sind die Bedingung, unter
> der wir arbeiten.
>
> Jedes Prinzip steht hier mit dem Beleg, an dem man es im Repo nachsehen
> kann. Ein Prinzip ohne Beleg wäre selbst ein Verstoß gegen 03.
>
> Stand: MP-A, 29.08.2026

---

## 01 · Erst verstehen, dann bauen

Bevor irgendjemand eine Zahl nennt, sehen wir uns den Betrieb an. Zwanzig
Minuten, kostenlos, und mit dem ausdrücklichen Recht zu sagen: Wir sind hier
falsch.

*Im Code:* `closing.lead` — „Wir sehen uns den Betrieb an und sagen ehrlich,
ob wir helfen können." Der Termin-Assistent fragt vier Schritte lang nach dem
Betrieb, nicht nach dem Budget.

## 02 · Erst zeigen, dann reden

Ein Beleg schlägt jedes Adjektiv. Wo wir etwas gebaut haben, zeigen wir es.
Wo wir nichts haben, sagen wir das — und füllen die Lücke nicht mit Bildern,
die eine Größe suggerieren, die es nicht gibt.

*Im Code:* Die Werkschau steht ganz oben auf der Startseite, vor jeder
Selbstbeschreibung.

## 03 · Nichts behaupten, was nicht belegt ist

Keine erfundenen Screenshots, keine fremden Logos ohne Freigabe, keine
Sterne ohne Bewertungen, keine Zertifikate ohne Urkunde, keine Zahlen ohne
Quelle. Fehlt der Beleg, fehlt die Aussage.

*Im Code:* Drei Gates laufen bei jedem Build mit — das Sterne-Gate
(`check-reviews.mjs`) verhindert `AggregateRating` ohne echte Bewertungen,
Fallstudien rendern nur bei `approved: true`, und ein Verarbeiter ohne
bestätigten Vertrag trägt sichtbar den Vermerk, dass er noch offen ist.

## 04 · Wir bauen als System, nicht als Einzelteil

Marke, Auftritt, Betrieb, Automatisierung und Intelligenz sind fünf Ebenen
eines Baus, nicht fünf Posten auf einer Rechnung. Wer nur eine bestellt,
bekommt sie — aber gebaut wird sie so, dass die anderen anschließen können.

*Im Code:* `serviceLayers` in `lib/site-data.ts` ist die eine Quelle für die
fünf Ebenen. Menü, Leistungsseiten, Produkte und Hero-Chips lesen alle
daraus.

## 05 · Nach dem Start fängt die Arbeit an

Ein Projekt endet nicht mit der Übergabe. Was wir bauen, betreiben wir —
dieselben Leute, die es gebaut haben. Wer nur liefern und gehen will, ist
eine Agentur; wir sind es nicht.

*Im Code:* `impact.title` — „Kein Konzept. Ein laufender Betrieb."
Managed Operations ist eine eigene Sektion, kein Zusatzpaket im Kleingedruckten.

## 06 · Zwei Sprachen, eine Qualität

Deutsch und Türkisch sind gleichwertige Fassungen, nicht Original und
Übersetzung. Die türkische Seite bekommt dieselbe Struktur, dieselbe Tiefe
und dieselbe Sorgfalt — auch wenn sie weniger Besucher hat.

*Im Code:* Das `SameShape`-Gate in `lib/dictionary.ts` macht es unmöglich,
einen Schlüssel nur auf Deutsch anzulegen. Das Paritäts-Gate im `postbuild`
vergleicht Abschnitte, Punkte und Länge je Leistungsseite.

## 07 · Wir verkaufen nichts, was wir nicht verantworten können

Kein Auftrag, den wir nicht betreiben können. Kein Versprechen, für das
jemand anderes geradestehen müsste. Kein Verkauf über Angst.

*Im Code:* Die Barrierefreiheits-Prüfung sagt ausdrücklich, dass ein grüner
Lauf **nicht** „barrierefrei" bedeutet, sondern nur „keine maschinell
feststellbare Verletzung" — und dass die Handprüfung bleibt. Ein Overlay
verkauft an dieser Stelle das Gegenteil.

---

## Die vier Geschäfts-Grundregeln des Owners

Sie stehen über den sieben Prinzipien, weil sie nicht die Arbeit betreffen,
sondern ob sie überhaupt stattfindet:

1. **Legal.** Nichts, was rechtlich fragwürdig ist — auch nicht, wenn es
   üblich wäre.
2. **Keine Fremdhaftung.** Wir haften für das, was wir bauen und betreiben.
   Nicht für das, was ein Kunde damit macht, und nicht für Dritte.
3. **Kein Angstverkauf.** Keine Frist-Panik, keine Abmahn-Drohung, kein
   „bevor es zu spät ist". Auch nicht bei Themen, bei denen es funktionieren
   würde.
4. **Keine Kaltakquise.** Kunden kommen über Arbeit, Netzwerk und Empfehlung.

---

## Engineering · Unknown ≠ invented default

Fehlende Daten bleiben **offen** (`null`, „folgt", Spec ohne Wert).  
Ein Agent oder ein Mensch **rät nicht** Product-Maturity, KPIs, Testimonials,
Preise oder Case-Zahlen. Unbekannt ist kein Default — Unbekannt ist Unbekannt.

Das gilt für Site, Company OS und Sales gleichermaßen.

---

## Türkçe · kısa

| # | İlke |
|---|---|
| 01 | Önce anlarız, sonra kurarız. |
| 02 | Önce gösteririz, sonra konuşuruz. |
| 03 | Belgelenmemiş hiçbir şeyi iddia etmeyiz. |
| 04 | Parça değil, sistem kurarız. |
| 05 | İş, teslimle bitmez — kurduğumuzu işletiriz. |
| 06 | İki dil, tek kalite. |
| 07 | Sorumluluğunu alamayacağımız hiçbir şeyi satmayız. |

---

**Prüffrage vor jeder Entscheidung:**

> Verbessert das Marke, Führung, Verständnis, technische Wahrnehmung,
> Vertrauen, Qualität oder Systemkonsistenz — oder ist es nur „cooler"?
