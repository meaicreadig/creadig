# Vegitat – Finanzübersicht Zürich & Luzern (Analyse, Excel-Cockpit, Empfehlung)

> **Stand 11. September 2026, Richtungsentscheid:** Der Inhaber wird nichts manuell erfassen. Die Lösung wird ein
> webbasiertes Finanzboard mit Beleg-Upload (Fotos, PDFs, Screenshots von Kontoauszügen) und automatischer Zuordnung.
> Die Anforderungen, die Datensammlung und die Methode zur Schuldenanalyse stehen in
> [`KONZEPT_Finanzboard.md`](KONZEPT_Finanzboard.md). Es wird nichts programmiert, bis das Konzept abgenommen ist.
> Die Excel-Datei unten bleibt nur als Referenz für Kategorien und Auswertungslogik.

Kunde: Vegitat (veganer Döner / Cigköfte), zwei Filialen – Hauptgeschäft Langstrasse 192, Zürich und
Bleicherstrasse 29, Luzern. Alle Beträge in Schweizer Franken (CHF).

Inhalt dieses Ordners:

| Datei | Zweck |
|---|---|
| `Vegitat_Finanzuebersicht.xlsx` | Das fertige Excel-Cockpit (Journal, Dashboard, Monats-/Jahresübersicht, Mitarbeiter, Budget, Listen) |
| `build_finanzuebersicht.py` | Erzeugt die Datei komplett neu (openpyxl) – Struktur, Formeln, Dropdowns, Diagramme, Beispieldaten |
| `verify_finanzuebersicht.py` | Prüft eine durchgerechnete Kopie gegen eine unabhängige Python-Berechnung (741 Vergleichswerte) |
| `inject_cached_values.py` | Trägt die berechneten Werte in die Originaldatei ein, damit Vorschauen (Handy, Cloud, Mail) Zahlen zeigen |

---

## 1. Ausgangslage

* Vegitat verkauft veganes Streetfood (Döner, Wraps, Cigköfte, Bowls, Desserts) im Laden, als Takeaway,
  über Lieferplattformen und per Online-Bestellung; dazu Catering.
* Zwei Standorte, ein Inhaber, mehrere Mitarbeitende, viele kleine Zahlungen pro Tag (Bar, Karte, Twint,
  Plattform-Auszahlungen) und viele kleine Ausgaben (Lieferanten, Verpackung, Reparaturen).
* Problem: Einnahmen und Ausgaben sind nicht laufend im Griff. Es fehlt eine Übersicht pro Filiale,
  pro Monat und pro Jahr, die ohne Zusatzaufwand entsteht, sobald etwas eingetragen wird.

## 2. Analyse – wo in einem Takeaway mit zwei Filialen typischerweise die Übersicht verloren geht

1. **Bargeld und Karte/Twint werden nicht getrennt erfasst.** Kassendifferenzen und Bargeldabflüsse bleiben
   unsichtbar. Darum erfasst das Journal jede Einnahme mit Zahlungsart, und das Dashboard zeigt die
   Verteilung.
2. **Lieferplattformen (Uber Eats, Just Eat, Smood) zahlen netto aus.** Wird nur die Auszahlung gebucht,
   fehlen 25–35 % Kommission in der Kostenrechnung; der Umsatz wirkt zu klein, die Marge falsch.
   Lösung: Bruttobestellwert als Einnahme, Kommission als eigene Ausgabe-Kategorie.
3. **Personalkosten werden mit dem Bruttolohn verwechselt.** Arbeitgeberbeiträge (AHV/IV/EO, ALV, BVG,
   UVG, FAK: zusammen rund 14–18 %) und der 13. Monatslohn fehlen in der Planung. Das Blatt
   *Mitarbeiter* rechnet die echten Kosten pro Filiale.
4. **Beide Filialen landen in einem Topf.** Ob Luzern sich selbst trägt, ist dann nicht erkennbar.
   Jede Buchung trägt deshalb die Filiale; alle Auswertungen lassen sich pro Filiale filtern.
5. **Unregelmässige Kosten reissen Löcher.** MWST-Quartalszahlung, Versicherungsprämien, Reparaturen,
   Geräte. Der Budgetvergleich und die Monatsübersicht machen sie sichtbar, bevor sie fällig sind.
6. **Ohne feste Kategorien ist nichts vergleichbar**, und der Treuhänder muss nachsortieren (kostet
   Geld). Die Kategorien sind vorgegeben, per Dropdown wählbar und zentral änderbar.
7. **Belege werden zu spät erfasst.** Was im Karton liegt, ist erst beim Jahresabschluss eine Zahl.
   Die Datei ist so gebaut, dass tägliches Erfassen in unter fünf Minuten möglich ist.

Kennzahlen, die ein Takeaway monatlich sehen sollte (alle im Dashboard bzw. in der Monatsübersicht):

| Kennzahl | Faustregel Gastro/Takeaway |
|---|---|
| Wareneinsatz in % des Umsatzes | ca. 28–35 % |
| Personalkosten inkl. Sozialabgaben in % | ca. 30–35 % |
| Miete in % des Umsatzes | unter 10–12 % |
| Plattform-Kommissionen in % des Plattformumsatzes | 25–35 % (verhandelbar) |
| Ergebnis / Marge | positiv, Trend über Monate |
| Unvollständige Buchungen | 0 |

Die Faustregeln sind Branchen-Erfahrungswerte, keine Vegitat-Zahlen.

## 3. Was die Excel-Datei leistet

* **Ein einziges Eingabeblatt** (`Buchungen`): Datum, Filiale, Typ (Einnahme/Ausgabe), Kategorie,
  Beschreibung, Betrag, Zahlungsart, Beleg-Nr., Bemerkung. Dropdowns für Filiale, Typ, Kategorie
  (abhängig vom Typ) und Zahlungsart; Datums- und Betragsprüfung; unvollständige Zeilen werden orange.
* **Alles andere rechnet sich selbst**: Dashboard (Kennzahlen, Filialvergleich, sechs Diagramme),
  Monatsübersicht (Kategorien × 12 Monate, Filialfilter, Budgetvergleich), Jahresübersicht
  (6 Jahre nebeneinander sowie ein Jahr im Detail Zürich | Luzern | Gesamt | Budget).
* **Mitarbeiter** mit Lohnkosten inkl. Arbeitgeberbeiträgen pro Filiale; fliesst automatisch ins Budget.
* **Budget** pro Kategorie und Filiale (Monatswerte) mit Abweichungsanzeige in Rot.
* **Listen** für Filialen, Kategorien, Zahlungsarten – Änderungen wirken überall.
* **Eingebaute Qualitätsprüfung**: Zähler für unvollständige Buchungen und unbekannte Kategorien,
  Zeile „Nicht zugeordnet“ in allen Auswertungen.
* Kapazität 5'000 Buchungen, Beispieldaten für 2025 (Bemerkung „Beispiel“) zum Kennenlernen; vor dem
  Echtbetrieb per Filter löschen und das Jahr im Dashboard auf 2026 stellen.

Qualitätssicherung: Die Datei wurde mit LibreOffice komplett durchgerechnet (1'858 Formeln, 0 Fehler) und
741 Ergebniswerte wurden gegen eine unabhängige Python-Berechnung der Beispieldaten verglichen –
inklusive beider Formelzweige „Alle Filialen“ und „einzelne Filiale“.

## 4. Excel oder Webseite / Web-App?

| Kriterium | Excel-Datei | Web-App (z. B. von creaDIG gebaut) |
|---|---|---|
| Start | sofort | 3–6 Wochen Entwicklung |
| Kosten | keine | Entwicklung + Hosting/Wartung laufend |
| Eingabe am Handy in der Filiale | möglich (Excel/Google Sheets App), aber fummelig | sehr gut, eigene Eingabemaske |
| Mehrere Personen gleichzeitig | nur über OneDrive/Google Drive, Konfliktrisiko | ja, mit Login und Rollen pro Filiale |
| Belegfoto zur Buchung | nein | ja |
| Bank-/Kassenimport | manuell | automatisierbar |
| Auswertungen / Diagramme | gut, sofort verfügbar | gut, live und pro Nutzer |
| Fehleranfälligkeit | Formeln können versehentlich überschrieben werden | Logik geschützt |
| Treuhänder-Übergabe | Datei direkt weitergeben | Export nötig (CSV/Excel) |
| Datenhoheit / Backup | eine Datei, Versionsverlauf der Cloud | Server, Backups einrichten |

**Empfehlung: Stufenplan.**

1. **Jetzt: Excel.** Es löst das eigentliche Problem – fehlende Routine und fehlende Struktur – ohne
   Wartezeit und ohne Kosten. Die Datei in OneDrive oder Google Drive ablegen, dann können beide Filialen
   in dieselbe Datei schreiben, auch vom Handy. Drei Monate konsequent erfassen.
2. **Nach drei Monaten entscheiden.** Läuft die Erfassung und wird es zu eng (viele Mitarbeitende, die
   eingeben, Belegfotos gewünscht, Bankabgleich, Kassenanbindung), gibt es zwei Wege:
   * ein Schweizer Standard-Buchhaltungstool (z. B. bexio oder Banana; ab rund CHF 35–70 pro Monat,
     Preise prüfen) mit Bankimport, MWST und Lohn – sinnvoll, wenn der Treuhänder direkt darin arbeiten soll;
   * eine eigene Web-App: Handy-Eingabemaske, Belegfoto, Filial-Login, Live-Dashboard, Export für den
     Treuhänder. Die jetzige Excel-Struktur (Felder, Kategorien, Auswertungen) ist dafür bereits die
     fertige Spezifikation; nichts geht verloren.
3. **Warum nicht sofort die Web-App:** Ein Werkzeug ersetzt keine Gewohnheit. Eine App, die niemand
   täglich füttert, bleibt leer – und kostet trotzdem. Erst mit drei Monaten echter Daten weiss man,
   welche Auswertungen wirklich gebraucht werden.

## 5. Nächste Schritte für den Betrieb

1. Beispieldaten löschen, Kategorien in `Listen` prüfen, Mitarbeitende eintragen, Budget setzen.
2. Datei in die Cloud; Regel: Kassenabschluss täglich pro Filiale und Zahlungsart, Belege wöchentlich.
3. Monatsroutine: am 5. des Folgemonats das Dashboard anschauen – Marge, Wareneinsatz, Plattformkosten,
   Budgetabweichungen, und „Unvollständige Buchungen“ muss 0 sein.
4. Nach drei Monaten Review und Entscheid Stufe 2.

Wichtig: Die Datei ist ein Führungsinstrument, keine Buchhaltung nach OR. MWST-Abrechnung und
Jahresabschluss bleiben beim Treuhänder – er bekommt aber sauber kategorisierte Daten.

## 6. Technik (Neuaufbau der Datei)

```bash
pip install openpyxl
python3 build_finanzuebersicht.py                      # erzeugt Vegitat_Finanzuebersicht.xlsx (ohne Rechenwerte)
# Kopie mit LibreOffice durchrechnen (recalc.py aus dem xlsx-Skill oder soffice --convert-to xlsx)
python3 verify_finanzuebersicht.py durchgerechnet.xlsx  # 741 Prüfungen, erwartet 0 Abweichungen
python3 inject_cached_values.py Vegitat_Finanzuebersicht.xlsx durchgerechnet.xlsx final.xlsx
```

Quellen zur Firma (Stand September 2026): [vegitat.ch](https://vegitat.ch/),
[search.ch – Vegitat Luzern](https://search.ch/tel/luzern/bleicherstrasse-29/vegitat),
[HappyCow – Vegitat Luzern](https://www.happycow.net/reviews/vegitat-luzern-223971),
[Tsüri.ch – Der beste vegane Döner der Stadt](https://tsri.ch/a/vegitat-der-beste-vegane-doner-der-stadt),
[vegitat-cigkoefte.ch (Online-Bestellung)](https://www.vegitat-cigkoefte.ch/).
