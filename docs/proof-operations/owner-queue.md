# Owner-Warteschlange

> **Proof Operations P1 · 11.09.2026** · sortiert nach kommerzieller Wirkung
> und Nähe — nicht nach Aufwand.

Abgeleitet aus `naechsteSchritte()` in `lib/beleg-betrieb.ts`. Dieselbe
Reihenfolge steht live unter **`/admin/beleg`**.

| # | Handlung | Gibt frei | Zeitabhängig? | Wirkung auf die Website |
|---|---|---|---|---|
| **1** | **Erste Messprobe für fibero erfassen** — `npm run messprobe -- --kennzahl fibero-ungeprueft --seite ausgang --wert … --faelle … --quelle system-zaehlung --von "Emin" --schreiben` | Startet die Uhr für den ersten echten Wirkungsbeleg des Hauses | **Ja** — danach 28 Tage bis zum Vergleich | Heute keine. Nach 28 Tagen die erste belegte Zahl, die der Aufwandsrechner stützen kann |
| **2** | **Eine Kundenfreigabe holen** — einen der drei Kandidaten wählen, schriftlich Name + Fallstudie freigeben lassen, Fundstelle in `releases[]` eintragen | Den ersten öffentlichen Kundenbeleg überhaupt | Nein | `/arbeiten` kehrt **ohne Code-Änderung** in Index und Sitemap zurück; der Mittelstands-Blocker fällt |
| **3** | **Kapazität nennen** — eine Zahl, die auch im vollen Monat hält, mit dem Zeitraum, aus dem sie stammt | `kapazitaet-projekte` | Nein | `/unternehmen` schließt eine Lücke, die dort heute ausdrücklich benannt ist |
| **4** | **Vertretung benennen** — eine reale Person oder Funktion mit Zugang, plus was sie fortführen kann und was nicht | `vertretung-ausfall` | Nein | Dieselbe Stelle; zweite der vier Antworten, die ein Mittelständler erwartet |
| **5** | **CASSAMEA: sichere Aufnahme** — aus einer Demo-Instanz mit dem Musterbestand aus `docs/ops/demo-data-standard.md`, oder die Bestätigung, dass die sichtbaren Namen erfunden sind | Asset-Lage `freigegeben` | Nein | `/produkte/cassamea` bekommt eine zeigbare Oberfläche |
| **6** | **meahv: sichere Aufnahme** — dasselbe | Asset-Lage `freigegeben` | Nein | `/produkte/meahv` ebenso |
| **7** | **Drei AVV bestätigen** — Vercel, Resend, Neon im jeweiligen Dashboard abschließen und ablegen, dann Fundstelle und Datum eintragen | `avv-vercel`, `avv-resend`, `avv-neon` | Nein | `/datenschutz` darf schreiben, dass die Verträge bestehen, statt nur die vorgesehene Grundlage zu nennen |
| **8** | **Betriebskapazität nennen** — wie viele Systeme gleichzeitig, und was es begrenzt | `kapazitaet-betrieb` | Nein | Eine Betriebsstufe über der laufenden Betreuung wäre verkaufbar (heute: `offer-canon.md` §6 verbietet es) |

## Warum die Messprobe vor der Kundenfreigabe steht

Sie ist zwei Schritte von öffentlich entfernt, die Freigabe nur einen. Sie
steht trotzdem oben, weil sie **eine Wartezeit startet**: Jeder Tag, an dem
sie nicht erhoben wird, verschiebt den ersten Wirkungsbeleg um einen Tag.
Die Freigabe lässt sich nächste Woche genauso holen wie heute — die 28 Tage
nicht.

## Was ausdrücklich **nicht** in dieser Liste steht

Keine UI-Aufgabe, keine Metadatenfrage, keine Seitenlänge, keine
CTA-Position. Für alles davon gilt seit Website-Phase 6:
**material FIXABLE_NOW = 0.** Was hier steht, kann Code nicht lösen.
