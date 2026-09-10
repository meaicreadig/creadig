# Decision Log

Entscheidungen, die spätere Gates **nicht still umdrehen dürfen**. Wer eine
davon ändert, ändert sie hier mit Datum und Begründung.

Nur festgehalten, was heute wirklich gilt — keine erfundenen Owner-Entscheidungen.

| # | Entscheidung | Herkunft | Stand |
|---|---|---|---|
| D-01 | creaDIG ist **nicht** absichtlich auf Klein- oder Handwerksbetriebe begrenzt. Die Ambition schließt wachsende Betriebe, Mittelstand und größere Engagements ein, wo Fähigkeit und Beleg es tragen. | Owner, 10.09.2026 | gültig |
| D-02 | Marktambition, heutiger Beleg und heutige Kaufbereitschaft werden **getrennt** geführt. Ein Unternehmen darf zum Zielmarkt gehören, ohne dass die Website heute genug beweist. | Gate 00 | gültig |
| D-03 | Preisunsicherheit ist **offen**, nicht Erlaubnis zu senken oder zu erhöhen. In Gate 00 wurde kein Preis geändert. **Auch in Gate 01 nicht** — geändert wurde die Platzierung, nicht die Zahl (D-19). | Owner | offen für G02 |
| D-04 | Die fünf Ebenen bleiben internes Ordnungsmodell. **Ob und wie prominent** sie außen erscheinen, entscheidet G01. | Gate 00 | **entschieden in G01 → D-15** |
| D-05 | Kein erfundener Kundenbeleg. Keine Logos, Zahlen, Zitate oder Fälle ohne Freigabe. | durchgehend | gültig, unverhandelbar |
| D-06 | Keine erfundene Teamgröße. Rollen dürfen gezeigt werden, sobald sie real sind. | durchgehend | gültig |
| D-07 | Bewerber und Vertrieb bleiben getrennt. Kandidat ≠ Lead. Kein ATS. | Careers-Gate | gültig |
| D-08 | Talent Pool ist keine offene Stelle. Keine `JobPosting`-Auszeichnung ohne freigegebene Stelle. | Careers-Gate, per Gate gesichert | gültig |
| D-09 | Produktionsdeployment braucht ausdrückliche Owner-Freigabe im laufenden Zug. Historische Freigabe zählt nicht. | durchgehend | gültig |
| D-10 | Die sechs G18-Dateien sind fremder Arbeitszug und bleiben unberührt. | G18 | gültig, solange dirty |
| D-11 | **Interne Komplexität darf wachsen. Externe nur mit Nutzen für den Besucher.** Niemand muss creaDIGs Modell verstehen, bevor er sein Problem, das Ergebnis, den Beleg, den Preis und den nächsten Schritt versteht. | Gate 00, aus dem Karriere-Befund | Leitsatz für G01–G09 |
| D-12 | Der Betriebscheck bleibt ohne Lead-Gate. | Audit-Empfehlung, bestätigt | gültig |
| D-13 | Creme/Schwarz/Gold, die typografische Grundidee und die arabische RTL-Qualität werden nicht angetastet. | Audit „nicht ändern" | gültig |
| D-14 | Produkte und Arbeiten werden in Gate 00 **nicht** zusammengelegt. Die Entscheidung gehört G01; die Belege liegen vor (WEB-0005). | Gate 00 | **entschieden in G01 → D-16** |
| D-15 | **Das Problem steht vor dem Modell.** Startseite und `/leistungen` nennen die Ausgangslage des Betriebs, bevor die fünf Ebenen erklärt werden. Die Ebenen bleiben vollständig — sie stehen an Position 5 der Leserfragen, nicht an Position 1. Löst D-04 auf. | Gate 01, WEB-0003 / WEB-0011 | gültig |
| D-16 | **`/produkte` ist der kanonische Ort der eigenen Produkte. `/arbeiten` ist für freigegebene Kundenarbeit reserviert** und zeigt keine eigenen Produkte mehr. Die Startseite trägt genau **eine** Produktsektion. Löst D-14 auf. | Gate 01, WEB-0005 | gültig |
| D-17 | **Jede der fünf Ebenen trägt einen benannten Einstieg** — Art, Betrag (wo bestätigt), Route und Beleg (wo vorhanden). Eine Ebene ohne Einstieg ist eine Kategorie. Maschinell gesichert durch `scripts/check-einstiege.mjs`. | Gate 01, WEB-0004 | gültig, per Gate gesichert |
| D-18 | **Kein Betrag entsteht außerhalb von `lib/site-data.ts`.** Anzeigende Module lesen `packages` und `retainer`; wo dort nichts steht, sagt die Seite „Angebot nach Analyse" statt einer Zahl. | Gate 01, WEB-0024 | gültig, per Gate gesichert |
| D-19 | **Die Startseite ankert nicht auf einem einzelnen Preis.** Sie zeigt die *Arten* anzufangen; die vollständige Preisleiter bleibt ausschließlich auf `/leistungen#pakete`. Löst D-03 für die Startseite auf — ohne einen Preis zu ändern. | Gate 01, WEB-0024 | gültig |
| D-20 | **Ein Hauptmenüpunkt ist ein Versprechen auf Umfang.** Eine Rubrik, die ihn heute nicht einlöst, wird zurückgestuft — nicht gelöscht: Sie bleibt in der Fußzeile, in der Sitemap und indexiert. Rückkehr ins Menü ist eine Entscheidung, keine Ableitung (Ausnahme: die zählbare Insights-Schwelle). | Gate 01, WEB-0005 / WEB-0018 | gültig, per Gate gesichert |
