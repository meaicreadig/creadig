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
| D-21 | **Ein Produktbeleg wird geprüft, bevor er an einer neuen Stelle erscheint** — auch wenn er vom Owner freigegeben und anderswo längst öffentlich ist. Eine neue Veröffentlichung trägt die Beweislast, nicht der Verzicht. Zwei der vier vorhandenen Produktfotos erscheinen deshalb nicht. | Gate 02, WEB-0002 | gültig, per Gate gesichert |
| D-22 | **Jede öffentliche Tatsache über ein eigenes Produkt trägt Quelle und Prüfdatum** (`lib/produkt-beleg.ts`). Eine Tatsache ohne Datum verfällt still — „live" ist im Januar wahr und im Juni eine Behauptung. | Gate 02, WEB-0009 | gültig, per Gate gesichert |
| D-23 | **Zugangslage ≠ Reifegrad.** Ob ein Fremder das Produkt ansehen kann, ist eine eigene Angabe und steht vor dem Klick — nicht danach auf einer Anmeldemaske. | Gate 02, WEB-0009 | gültig |
| D-24 | **Lieferverantwortung wird durch Verweise belegt, nicht durch Adjektive.** Jede Antwort auf „Was passiert, wenn wir Verantwortung abgeben?" zeigt auf eine bestehende Fundstelle; die Lücken (Mitarbeiterzahl, Kapazität, Vertretung) werden benannt statt umgangen. | Gate 02, WEB-0007 | gültig |
| D-25 | **Ein Gedanke hat ein Primary Home.** Andere Seiten referenzieren ihn kurz; sie erklären ihn nicht erneut. Gemeinsame Datenquelle ist kein Argument für gemeinsame Darstellung — dieselbe Quelle vier Mal gerendert ist für den Leser vier Mal derselbe Text. | Gate 03, WEB-0036 / WEB-0012 | gültig, per Gate gesichert |
| D-26 | **Zwei bewusste Ausnahmen von D-25:** der Abschluss-Aufruf und die Einwilligungserklärung. Eine Aktion mit fünfzehn Beschriftungen wäre schlechter als eine Wiederholung. Beide sind im Content-Gate hinterlegt, nicht übersehen. | Gate 03 | gültig |
| D-27 | **Länge, die aus Substanz oder aus gesperrtem Code stammt, ist kein Content-Befund.** Wo Kürzen Beleg oder Tiefe kosten würde, wird die Länge benannt und weitergereicht — nicht mit Kartenrastern versteckt. | Gate 03, WEB-0013 / WEB-0025 | gültig |
| D-28 | **Bewegung darf nie verbergen, dass Inhalt da ist.** Sektionen werden nicht eingeblendet, sie setzen sich: die Lage wird animiert, nicht die Deckkraft. Grund: `Reveal` hielt bis zu 80 % einer Seite unsichtbar, bis jemand scrollte — das erklärte gleichzeitig „wirkt unfertig" und „wirkt monoton". | Gate 04 | gültig |
| D-29 | **Eine dunkle Fläche muss verdient sein.** Sie markiert einen Moduswechsel, eine Zeichnung, eine Entscheidung oder den Abschluss — nie einen Wechsel um des Wechsels willen. Ein Zebrastreifen aus Creme und Dunkel ist kein Rhythmus. | Gate 04, WEB-0037 | gültig |
| D-30 | **Microcopy beginnt bei 12 px** (`eyebrow`, `text-meta`; Arabisch 13 px). Darin stehen Bildunterschriften, Zugangslagen und Belegzeilen — die wichtigste Beleg-Zeile der Website stand vorher in ihrer kleinsten Schrift. | Gate 04 | gültig |
