# Vegitat Finanzboard – Konzept und Anforderungen

Version 0.1 · Stand 11. September 2026 · Status: Entwurf zur Abnahme · **Es wird nichts programmiert, bis dieses Dokument abgenommen ist.**

Dieses Dokument ersetzt die zuvor erstellte Excel-Datei als Arbeitsgrundlage. Die Excel bleibt nur als Referenz
für Kategorien und Auswertungslogik im Ordner liegen.

---

## 1. Ziel in einem Satz

Der Inhaber tippt nichts mehr ein. Er lädt Quittungen, Rechnungen, Screenshots und PDFs von Kontoauszügen hoch,
auch viele auf einmal. Das System liest sie aus, ordnet sie zu (Filiale, Kategorie, privat oder Geschäft) und zeigt
auf einem Finanzboard, wohin das Geld geht, woher die Schulden kommen und was als Nächstes fällig ist.

Drei Versprechen:

1. **Upload statt Eingabe.** Foto, PDF, Screenshot, E-Mail-Weiterleitung. Kein Formular.
2. **Klarheit statt Bauchgefühl.** Jeden Monat dieselben Zahlen: pro Filiale, pro Kategorie, privat getrennt.
3. **Beweis statt Vermutung.** Die Schulden werden aus Kontoauszügen und Belegen rückwärts hergeleitet, Monat für Monat.

## 2. Ausgangslage

* Zwei Läden: Hauptgeschäft Langstrasse 192, Zürich und Filiale Bleicherstrasse 29, Luzern. Veganes Streetfood
  (Döner, Cigköfte, Wraps, Bowls), Verkauf im Laden, Takeaway, Lieferplattformen, Online-Bestellung, Catering.
* Zahlungswege: Bar, Karte, Twint, Plattform-Auszahlungen, Überweisungen. Viele kleine Beträge pro Tag.
* Der Inhaber macht alles selbst und ist am Limit. Wörtlich: „Ich habe Schulden, ich schaffe nichts mehr.“
  Er weiss nicht, woher die Schulden kommen.
* Belege liegen verstreut: Papier, Handyfotos, PDFs, E-Mails, Screenshots von Kontoauszügen.
* Privat und Geschäft sind vermutlich vermischt (zu klären, siehe Frage 1).
* Harte Rahmenbedingung: **Er wird nichts manuell erfassen.** Jede Lösung, die Tippen verlangt, scheitert.
  Der Bruder (creaDIG) übernimmt die Arbeit, das System soll sie automatisieren.

## 3. Drei Grundsatzentscheide

### 3.1 Privat und Geschäft trennen? Ja, unbedingt, aber ohne Mehrarbeit für den Inhaber.

* Ohne Trennung sieht niemand, ob das Geschäft Verlust macht oder ob private Entnahmen das Loch reissen.
  Beides braucht völlig andere Massnahmen.
* Für Treuhänder und Steuern sind Privatbezüge keine Betriebsausgaben. Bei einer Einzelfirma laufen sie über das
  Privatkonto des Inhabers, bei einer GmbH über das Kontokorrent des Gesellschafters. Vermischung erzeugt dort
  Nacharbeit und Risiko.
* Im System bekommt jede Bewegung eine **Sphäre**: Geschäft Zürich, Geschäft Luzern, Privat oder Unklar.
  Die Zuordnung übernehmen Regeln und die KI (Lieferant, Konto, Karte, Uhrzeit, Text). Nur Unklares landet in der
  Zu-prüfen-Liste.
* Parallel in der echten Welt: ein Geschäftskonto und eine Geschäftskarte nur fürs Geschäft, private Ausgaben nur
  vom Privatkonto, und ein fester monatlicher Privatbezug statt spontaner Entnahmen. Das allein beantwortet einen
  grossen Teil der Frage „Wo kommen die Schulden her?“.

### 3.2 Zwei Läden getrennt? Ja.

Jede Bewegung trägt eine Filiale. Nur so wird sichtbar, ob Luzern sich selbst trägt.

### 3.3 Buchhaltung ersetzen? Nein.

Der Treuhänder bleibt zuständig für Abschluss, MWST und Löhne. Das Finanzboard liefert ihm sauber zugeordnete Daten
und das Belegarchiv. Es ist ein Führungsinstrument, keine Buchhaltung nach OR.

## 4. Anforderungen

Priorität: **MUSS** (ohne das ist es nutzlos), **SOLL** (klarer Mehrwert, kann in V1.1), **KANN** (später).

### 4.1 Erfassung („Upload statt Eingabe“)

| Nr. | Anforderung | Prio |
|---|---|---|
| E1 | Upload von Fotos (JPG, PNG, HEIC), PDFs und Screenshots; mehrere auf einmal per Drag & Drop, Mehrfachauswahl am Handy oder ganzer Ordner | MUSS |
| E2 | Handy-Kamera direkt aus der Web-App (installierbar auf dem Homescreen), offline zwischenspeichern, später hochladen | MUSS |
| E3 | E-Mail-Weiterleitung: Rechnungen per Mail an eine Inbox-Adresse weiterleiten, sie landen automatisch im System | MUSS |
| E4 | Kontoauszüge als PDF oder Screenshot: jede Zeile wird eine Bewegung (Datum, Text, Betrag, Saldo). Export aus dem E-Banking (CSV, CAMT.053) wird bevorzugt, weil fehlerfrei; Screenshot ist der Fallback | MUSS |
| E5 | Kassen-Tagesabschluss (Z-Bericht) als Foto oder PDF; daraus Tagesumsatz pro Zahlungsart | SOLL |
| E6 | Abrechnungen der Lieferplattformen (Uber Eats, Just Eat, Smood) als PDF oder CSV; daraus Bruttoumsatz, Kommission, Auszahlung | SOLL |
| E7 | Abrechnungen von Kartenterminal und Twint | SOLL |
| E8 | Direkte Bankanbindung (z. B. über bLink von SIX oder Bank-Schnittstelle) | KANN |

### 4.2 Zuordnung und Prüfung

| Nr. | Anforderung | Prio |
|---|---|---|
| Z1 | Auslesen per OCR und KI: Datum, Betrag, MWST, Gegenpartei, Beleg-Nr., Zahlungsart, Konto; mit Vertrauenswert pro Feld | MUSS |
| Z2 | Automatische Zuordnung von Filiale (Lieferadresse, Konto, Karte, Lieferant, Standard), Kategorie (lernende Regeln: einmal bestätigt, gilt künftig) und Sphäre (Geschäft ZH, Geschäft LU, Privat, Unklar) | MUSS |
| Z3 | Abgleich Beleg mit Kontobewegung (Betrag, Datum, Gegenpartei), damit nichts doppelt zählt; Barbelege ohne Kontobewegung bleiben Barausgaben | MUSS |
| Z4 | Duplikate erkennen (derselbe Beleg zweimal fotografiert, derselbe Auszug zweimal hochgeladen) | MUSS |
| Z5 | Zu-prüfen-Liste: alles Unsichere an einem Ort, Bestätigen mit einem Tipp; Ziel unter 10 % der Belege nach der Lernphase | MUSS |
| Z6 | Nachträgliche Korrektur jederzeit, mit Änderungsprotokoll (wer, wann, was) | MUSS |
| Z7 | Belegarchiv: Original plus ausgelesene Daten, durchsuchbar, 10 Jahre aufbewahrt (Art. 958f OR) | MUSS |

### 4.3 Finanzboard

| Nr. | Anforderung | Prio |
|---|---|---|
| B1 | Startseite zeigt die Lage in zehn Sekunden: Kontostände aller Konten, Einnahmen, Ausgaben und Ergebnis für Monat und Jahr, Schulden gesamt, Liquidität der nächsten acht Wochen, Ampel | MUSS |
| B2 | Filialvergleich Zürich und Luzern: Umsatz, Wareneinsatz in %, Personal in %, Miete in %, Ergebnis | MUSS |
| B3 | Kategorien: grösste Ausgaben, Trend, Vergleich mit Vormonat und Vorjahr | MUSS |
| B4 | Privat getrennt: Privatbezüge als eigene Zahl pro Monat, private Ausgaben in eigener Ansicht, Betriebsergebnis bleibt sauber | MUSS |
| B5 | Bargeld: Bar-Einnahmen, Bar-Ausgaben und Bareinzahlungen gegenübergestellt, Kassendifferenz sichtbar | SOLL |
| B6 | Monatsabschluss-Checkliste: alle Auszüge da, alle Belege zugeordnet, Zu-prüfen-Liste leer | SOLL |
| B7 | Export für den Treuhänder (CSV, Excel, später bexio-Format) und Lesezugang für den Treuhänder | SOLL |

### 4.4 Schulden und Liquidität

| Nr. | Anforderung | Prio |
|---|---|---|
| S1 | Schuldenregister: Gläubiger, Betrag, Zins, Rate, Fälligkeit, Status, Dokumente; Verlauf pro Monat | MUSS |
| S2 | Schuldendienst (Zins plus Tilgung) als eigener Block im Monatsergebnis | MUSS |
| S3 | Liquiditätsvorschau 8 bis 12 Wochen: wiederkehrende Abgänge (Miete, Löhne, AHV, MWST, Raten, Leasing) und erwartete Einnahmen; zeigt den Tag, an dem das Konto unter null fällt | MUSS |
| S4 | Warnungen: Rechnung in 7 Tagen fällig, Konto unter Schwelle, Marge unter Ziel, Wareneinsatz über Ziel | SOLL |
| S5 | Rückblick als Wasserfall pro Monat (Methode in Abschnitt 6) | MUSS |

### 4.5 Rollen und Sicherheit

* Rollen: Inhaber (alles), creaDIG (Betrieb, Regeln, Kategorien, Auswertungen), Filialleitung (Upload und
  Tagesabschluss der eigenen Filiale), Treuhänder (Lesen und Export).
* Login mit zweitem Faktor, verschlüsselte Ablage, Server in der Schweiz oder EU, tägliches Backup, Datenschutz
  nach DSG. KI- und OCR-Dienste nur mit Auftragsverarbeitungsvertrag und ohne Nutzung der Daten zum Training.
* Sprache der Oberfläche: Deutsch; weitere Sprachen nach Bedarf (Frage 9).

### 4.6 Nicht-Ziele für Version 1

Keine doppelte Buchhaltung mit Bilanz, keine Lohnbuchhaltung, keine MWST-Abrechnung, keine Rechnungsstellung an
Kunden, keine Warenwirtschaft. Alles davon kann später angebunden werden.

## 5. So arbeitet das System

1. **Hochladen.** Handy, Drag & Drop, E-Mail-Weiterleitung, Export aus dem E-Banking.
2. **Lesen.** OCR und KI ziehen die Felder aus jedem Dokument, mit Vertrauenswert.
3. **Zuordnen.** Regeln setzen Filiale, Kategorie und Sphäre; jede Bestätigung wird zur Regel.
4. **Abgleichen.** Beleg trifft Kontobewegung; Duplikate fallen weg.
5. **Prüfen.** Kurze Liste, ein Tipp pro Eintrag, am Handy in der Pause.
6. **Sehen.** Board, Warnungen, Monatsabschluss, Export an den Treuhänder.

Aufwand des Inhabers: Fotos machen wie bisher, plus 5 bis 10 Minuten pro Woche für die Zu-prüfen-Liste.
Realistischer Automatisierungsgrad: 80 bis 90 % nach vier bis sechs Wochen Lernphase. Die fehleranfälligste Quelle
sind Screenshots von Kontoauszügen; die Regel ist deshalb PDF oder CSV aus dem E-Banking, der Screenshot ist die Ausnahme.

## 6. Wie wir zeigen, woher die Schulden kommen

Ziel ist nicht, Schuld zuzuweisen, sondern die Mechanik sichtbar zu machen: Welche Blöcke haben in den letzten
24 Monaten Geld verschluckt.

1. **Schuldeninventar heute.** Tabelle: Gläubiger, Betrag, Zins, Rate, seit wann, Mahnstufe, Status.
   Bank, Kreditkarten, Lieferanten, Vermieter, Ausgleichskasse (AHV), ESTV (MWST), Steueramt, Leasing,
   Betreibungen, private Darlehen aus Familie und Freundeskreis.
2. **Geldfluss der letzten 24 Monate.** Alle Konten und Karten, Twint, Terminal, Plattformen, Kasse. Privat und Geschäft.
3. **Zuordnung** jeder Bewegung nach Kategorie, Filiale und Sphäre.
4. **Wasserfall pro Monat.**
   Umsatz, minus Wareneinsatz, minus Personal, minus Miete und Fixkosten, minus Sonstiges = Betriebsergebnis.
   Minus Privatbezüge, minus Schuldendienst (Zins und Tilgung), minus Einmaliges (Geräte, Nachzahlungen)
   = Veränderung der Liquidität. Ist sie negativ, sind das die neuen Schulden dieses Monats.
5. **Ursachen benennen.** Typisch sind, einzeln oder kombiniert:
   * Der Betrieb ist unprofitabel: Wareneinsatz, Personal oder Miete zu hoch im Verhältnis zum Umsatz, oft nur in
     einer Filiale.
   * Privatbezüge sind höher als das, was das Geschäft hergibt.
   * Der Schuldendienst frisst das Ergebnis: teure Kleinkredite, Kreditkartenzinsen, Ratenpläne.
   * Nachzahlungen bei MWST, AHV oder Steuern, weil unterjährig nichts zurückgestellt wurde.
   * Umsatzrückgang oder Saison ohne Anpassung der Kosten.
   * Plattform-Kommissionen, die nie als Kosten wahrgenommen wurden.
6. **Massnahmenplan** und Gespräch mit dem Treuhänder. Bei Rückständen: Ratenvereinbarungen mit Ausgleichskasse,
   ESTV und Vermieter sind üblich; bei Betreibungen zusätzlich die kantonale Schuldenberatung. Vorrang haben Löhne
   und AHV, MWST und Miete, weil dort Verzug schnell teuer wird und der Inhaber für nicht abgelieferte
   Sozialversicherungsbeiträge persönlich haften kann.

Ergebnis: eine Seite pro Monat und eine Gesamtgrafik. Der Beweis ist nachvollziehbar, weil jede Zahl auf einen
Beleg oder eine Kontozeile zurückführt.

## 7. Datensammlung jetzt (Checkliste)

Vorgehen: ein gemeinsamer Cloud-Ordner „Vegitat Finanzen“ mit den Unterordnern unten. Fotos direkt vom Handy dorthin.
Nichts sortieren, nichts abtippen. Die Sichtung übernimmt creaDIG. Priorität A zuerst.

| Bereich | Was | Woher | Format | Zeitraum | Prio |
|---|---|---|---|---|---|
| Bank | Kontoauszüge aller Geschäftskonten | E-Banking | PDF und CSV/CAMT.053 | Jan 2024 bis heute | A |
| Bank | Kontoauszüge aller Privatkonten | E-Banking | PDF und CSV | 24 Monate | A |
| Bank | Kreditkartenabrechnungen, privat und geschäftlich | Kartenanbieter | PDF | 24 Monate | A |
| Zahlungen | Abrechnungen der Lieferplattformen | Partnerportale | PDF/CSV | 24 Monate | A |
| Zahlungen | Twint-Business-Abrechnungen | Twint-Portal | PDF/CSV | 24 Monate | B |
| Zahlungen | Kartenterminal-Abrechnungen | Anbieter-Portal | PDF/CSV | 24 Monate | B |
| Kasse | Tagesabschlüsse (Z-Berichte) beider Läden | Kassensystem | Foto/PDF/Export | 12 Monate | B |
| Schulden | Kreditverträge, Leasing, Ratenpläne, Mahnungen, Betreibungsauszug | Ordner, Mail, Betreibungsamt | PDF/Foto | aktuell | A |
| Schulden | Offene Lieferantenrechnungen | Mail, Papier | PDF/Foto | aktuell | A |
| Schulden | Rückstände bei Ausgleichskasse, ESTV, Steueramt, Vermieter | Schreiben | PDF/Foto | aktuell | A |
| Schulden | Private Darlehen (Familie, Freunde) | Liste des Inhabers | Liste | aktuell | A |
| Fixkosten | Mietverträge beider Läden, Nebenkosten | Ordner | PDF | aktuell | B |
| Fixkosten | Versicherungen, Strom, Internet, Kassen-Abo, Entsorgung | Rechnungen | PDF | aktuell | B |
| Personal | Lohnabrechnungen oder Lohnliste, AHV-Abrechnung, BVG-Vertrag | Treuhänder, Lohnprogramm | PDF | 12 Monate | B |
| Steuern | MWST-Abrechnungen der letzten 8 Quartale, Steuerrechnungen | Treuhänder, ESTV | PDF | 24 Monate | B |
| Belege | Quittungen und Rechnungen, unsortiert | überall | Foto/PDF | mindestens 12 Monate | B |
| Stammdaten | Rechtsform, UID, MWST-Nr. und -Methode, Konten- und Kartenliste, Mitarbeiterliste, Lieferantenliste, Treuhänder | Inhaber | Liste | aktuell | A |

## 8. Offene Fragen an den Inhaber

1. Rechtsform: Einzelfirma oder GmbH? Eine Firma für beide Läden oder zwei? Das entscheidet, wie Privatbezüge behandelt werden.
2. Welche Konten und Karten gibt es (Bank, Kreditkarte, Twint, Terminal)? Welche davon werden auch privat genutzt?
3. Welches Kassensystem läuft in Zürich und in Luzern? Gibt es Exporte?
4. Welche Lieferplattformen sind aktiv? Wer hat Zugang zu den Partnerportalen?
5. Treuhänder: Wer ist es, welches Tool nutzt er, was macht er heute, was kostet es?
6. MWST: Saldosteuersatz oder effektive Methode? Quartal oder Semester? Gibt es Rückstände?
7. Schulden: vollständige Liste inklusive privat, mit Mahnstufe und allfälligen Betreibungen.
8. Wer soll hochladen dürfen: nur der Inhaber oder auch die Filialleitungen?
9. Sprache der Oberfläche und Handy-Typ (iPhone oder Android)?
10. Datenschutz: Einverständnis, dass Kontoauszüge und Belege von einem KI-Dienst in der Schweiz oder EU ausgelesen werden?
11. Hosting: bestehendes Hosting-Paket, Vercel oder Schweizer Anbieter? Wer betreibt und pflegt das System?
12. Zeit und Budget: Wann muss die erste Auswertung stehen, was darf der Bau kosten?

## 9. Umsetzung

### 9.1 Optionen

| | A: Eigenes Finanzboard (Web-App) | B: Standard-Tool (bexio, Banana, Buchhaltungs-Service) | C: Hybrid (Empfehlung) |
|---|---|---|---|
| Upload vieler Screenshots und PDFs auf einmal mit KI-Auslesung | ja, Kern des Systems | Beleg-Scan ja, Bulk-Screenshots von Auszügen schwach | ja |
| Sphäre privat/geschäftlich, zwei Filialen, Schuldenregister, Liquidität | ja, massgeschneidert | teilweise (Kostenstellen), kein Schuldenboard | ja |
| Treuhänder-Kompatibilität, MWST, Lohn | über Export | ja, das ist ihre Stärke | Export ins Tool des Treuhänders |
| Zeit bis Version 1 | grob 6 bis 10 Wochen | sofort | Board wie A, Buchhaltung bleibt beim Treuhänder |
| Laufende Kosten | Hosting, KI-Auslesung (Rappen pro Beleg), Pflege | ab ca. CHF 35 bis 100 pro Monat (Preise prüfen) | wie A |

Empfehlung: **C.** Das Finanzboard ist das, was der Inhaber täglich anfasst: Upload-Inbox, Zu-prüfen-Liste, Board,
Schulden, Liquidität. Die eigentliche Buchhaltung bleibt beim Treuhänder und bekommt saubere Exporte. Version 1
bewusst klein halten.

Hinweis zum Hosting-Paket: Die heutige creaDIG-Webseite ist statisch. Das Finanzboard braucht eine
Server-Anwendung, eine Datenbank, verschlüsselten Dateispeicher, Login, einen KI-/OCR-Dienst und Backups. Ein
klassisches Webhosting-Paket reicht dafür meist nicht. Üblich sind Vercel mit Datenbank und Speicher in der EU oder
ein Schweizer Anbieter. Entscheid offen, siehe Frage 11.

### 9.2 Fahrplan

| Phase | Zeitraum | Inhalt | Ergebnis |
|---|---|---|---|
| 0 Festhalten | Woche 1 bis 2 | Konzept abnehmen, Fragen klären, Daten nach Checkliste sammeln | abgenommenes Konzept, gefüllter Ordner |
| 1 Erst-Analyse | Woche 2 bis 4 | Gesammelte Auszüge und Belege einmalig auswerten, mit KI-Auslesung, aber ohne Produkt zu bauen | Schuldeninventar, 24-Monats-Wasserfall, Filialvergleich, Privatanteil, Liquiditätsplan, Massnahmenliste |
| 2 Version 1 | Woche 4 bis 12 | Upload, Auslesen, Zuordnen, Zu-prüfen-Liste, Board, Schuldenregister, Export | laufender Betrieb |
| 3 Ausbau | danach | Bankanbindung, Kassen- und Plattform-Importe, Warnungen per Push, Treuhänder-Zugang, Liquiditätsprognose | Automatisierungsgrad über 90 % |

Der Beweis, woher die Schulden kommen, liegt nach Phase 1 vor, bevor eine Zeile Produktcode existiert. Gleichzeitig
entstehen dort die Kategorien und Regeln, die das System in Phase 2 braucht.

## 10. Sofortmassnahmen ab morgen (ohne System)

1. Alles fotografieren, nichts sortieren: ein Ordner am Handy, jede Quittung sofort.
2. Geschäft und Privat trennen: Geschäftskonto und Geschäftskarte nur fürs Geschäft, fester monatlicher Privatbezug.
3. Tagesabschluss pro Filiale fotografieren und das Bargeld täglich zählen.
4. Keine neuen Kleinkredite oder Kreditkarten zur Deckung, bevor die Analyse steht.
5. Reihenfolge bei knappem Geld: Löhne und AHV, MWST, Miete, dann Lieferanten. Mit Gläubigern reden, bevor die
   Mahnung kommt; Ratenpläne sind üblich.
6. Treuhänder informieren, dass eine Analyse läuft, und den Zugang zu den Unterlagen sichern.

## 11. Erfolgskriterien

* Aufwand des Inhabers unter 10 Minuten pro Woche.
* 90 % der Belege automatisch zugeordnet, nach der Lernphase.
* Monatsabschluss bis zum 5. des Folgemonats.
* Jede Schuld mit Betrag, Rate und Plan sichtbar.
* Liquidität acht Wochen im Voraus sichtbar, keine Überraschung bei MWST und AHV.
* Privatbezüge als eigene Zahl pro Monat.
* Pro Filiale klar: trägt sich oder trägt sich nicht.

## 12. Begriffe und Datenmodell

| Begriff | Bedeutung |
|---|---|
| Beleg | Dokument (Foto, PDF, Screenshot) plus die ausgelesenen Felder |
| Bewegung | eine Geldbewegung aus Kontoauszug, Kasse, Plattform oder Barbeleg |
| Konto | Bankkonto, Karte, Twint, Terminal, Plattform-Guthaben, Kasse |
| Sphäre | Geschäft Zürich, Geschäft Luzern, Privat, Unklar |
| Filiale | Zürich oder Luzern (erweiterbar) |
| Kategorie | Art der Einnahme oder Ausgabe (Listen unten) |
| Gegenpartei | Lieferant, Kunde, Gläubiger, Behörde |
| Schuld | Verbindlichkeit mit Gläubiger, Betrag, Zins, Rate, Fälligkeit, Status |
| Regel | gelernte Zuordnung: Gegenpartei oder Text führt zu Kategorie, Sphäre, Filiale |
| Prüfstatus | automatisch sicher, zu prüfen, bestätigt, korrigiert |

Kategorien (Startliste, aus dem bisherigen Modell übernommen):

* **Einnahmen:** Verkauf Laden Bar; Verkauf Laden Karte/Twint; Lieferdienste; Online-Bestellungen; Catering und
  Events; Gutscheine; Sonstige Einnahmen.
* **Ausgaben Geschäft:** Wareneinkauf Lebensmittel; Wareneinkauf Getränke; Verpackung; Löhne; Sozialversicherungen;
  Miete; Nebenkosten; Internet, Telefon, Software; Marketing; Lieferplattform-Gebühren; Karten- und Twint-Gebühren;
  Reinigung; Reparaturen; Geräte und Inventar; Versicherungen; Steuern und Abgaben; Buchhaltung und Beratung;
  Fahrzeug; Bankgebühren und Zinsen; Schuldendienst (Tilgung); Sonstige Ausgaben.
* **Privat:** Privatbezug (Geld vom Geschäft ins Private, die Schlüsselzahl); Wohnen; Lebenshaltung; Krankenkasse und
  private Versicherungen; private Kredite und Raten; Familie und Unterstützung; Bargeldbezug privat; Steuern privat;
  Sonstiges privat.

---

Quellen zur Firma: [vegitat.ch](https://vegitat.ch/), [search.ch](https://search.ch/tel/luzern/bleicherstrasse-29/vegitat),
[HappyCow](https://www.happycow.net/reviews/vegitat-luzern-223971), [Tsüri.ch](https://tsri.ch/a/vegitat-der-beste-vegane-doner-der-stadt).
Rechtliche und steuerliche Aussagen sind Orientierung, keine Beratung; massgeblich ist der Treuhänder.
