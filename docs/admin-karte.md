# Admin-Karte – Schritt 1: jede Sektion, jeder Button, wohin er geht

Stand 30.09.2026. Quelle: echte Seiten im Browser (localhost, eingeloggt). Kein Code geändert.

Ziel-Struktur (Kundenmaschine):
- **HEUTE** – was jetzt zu tun ist
- **KUNDEN** – Liste + Kundenkarte (Herz)
- **KALENDER** – Termine, Fristen, Beiträge
- **MOTOR** – Finden, Sichtbarkeit, Automationen
- **EINSTELLUNGEN** – Verbindungen, Website-Einrichtung, Belege/Erlaubnisse

## Übersicht `/admin`
| Sektion | Ziel |
|---|---|
| 4 Kennzahlen (Anfragen 7T, offene Pipeline, Rechnungen, Veröffentlicht 7T) | HEUTE › Zielleiste |
| Diagramme: Anfragen je Woche, Pipeline nach Stufe, Kanal 90T | HEUTE (nur 1 Diagramm) › Rest MOTOR › Auswertung |
| Heute zu tun (Neue Anfragen, Ohne nächsten Schritt) | HEUTE › Aufgabenliste |
| Systemzustand (Lead-Weg „Betrieb gestört“) | HEUTE › Warnband, sonst EINSTELLUNGEN |
| Vom System erledigt · 7 Tage | HEUTE › „Gestern/Woche“ |
| Ihre Entscheidungen (19 Freigaben) | HEUTE › max. 3, Rest EINSTELLUNGEN › Belege |

## Vertrieb `/admin/vertrieb`
| Sektion | Ziel |
|---|---|
| Stand + Braucht Aufmerksamkeit (7 Zähler: neu, heute fällig, überfällig, offene Chancen, ohne Schritt, warm ohne Chance, Kunden ohne Chance) | HEUTE › Aufgabenmotor (Regeln). Seite entfällt. |
| Untermenü Übersicht/Recherche/Pipeline/Beziehungen/Verlust | ersetzt durch Hauptmenü |

## Anfragen `/admin/vertrieb/anfragen` (+ Detail, + neu)
| Sektion | Ziel |
|---|---|
| Filter + Liste Eingänge | KUNDEN › Filter „Stufe: neu“ |
| „Anfrage erfassen“ | globaler Button „+ Hinzufügen“ |
| Detail (Kanal, Verlauf, Status) | Kundenkarte › Zeitstrahl |

## Pipeline `/admin/vertrieb/pipeline` (+ Chance-Detail)
| Sektion | Ziel |
|---|---|
| Filter + Liste Verkaufschancen (leer) | KUNDEN › Ansicht „Kanban nach Stufe“ |
| Chance-Detail: Verkaufsleitfaden, Angebotsreife, Angebots- und Übergabedokument | Kundenkarte › Reiter „Auftrag“ |

## Beziehungen `/admin/vertrieb/beziehungen` (+ Detail)
| Sektion | Ziel |
|---|---|
| Kontaktliste (8 Personen) | Kundenkarte › Reiter „Personen“ |
| Detail: Beziehung, **Nächster Beziehungsschritt**, Angaben, Gehört zu, Chancen, Anfragen, Chronik, Erreichbar, Auskunft (DSGVO-Download), Zeiten | Nächster Schritt → Kopf der Kundenkarte. DSGVO-Download bleibt pro Person. |

## Recherche `/admin/vertrieb/recherche` (+ Detail)
| Sektion | Ziel |
|---|---|
| Liste mit 8 Zuständen (Entdeckt … Bereit für Kontakt) | MOTOR › Finden › Trichter |
| Detail: Urteil, Belege, Kontakt & Zugang, Offen, Zustand (4 Speichern-Buttons) | bleibt, aber 1 Speichern. „Bereit für Kontakt“ → 1 Klick in KUNDEN |

## Verlust `/admin/vertrieb/verlust`
| Sektion | Ziel |
|---|---|
| Verlust-Schleife (Gründe, Muster) | Kundenkarte › Stufe „verloren“ + Wochenbericht |

## Kunden `/admin/kunden` (+ Detail)
| Sektion | Ziel |
|---|---|
| Liste Betriebe (19+) | KUNDEN – Hauptliste, plus Spalten Stufe, Gesundheit, nächster Schritt, Umsatz |
| Detail: Kundenhistorie, Stammdaten, Standorte, Chancen, Chronik, Erreichbar, Ansprechpartner, Anfragen, Herkunft (26 Felder, 3 Speichern) | wird **Kundenkarte**: Kopf (Stufe, nächster Schritt, Geld), Zeitstrahl, Reiter Personen/Aufträge/Daten. Stammdaten eingeklappt. |

## Beleg `/admin/beleg`
| Sektion | Ziel |
|---|---|
| „Die wirksamste nächste Handlung“ | HEUTE › Aufgabe |
| 11 nummerierte Belege (NV SWISS, maqam, fibero …) | Kundenkarte › „Referenz“ des jeweiligen Kunden |
| Messreihe fibero (6 Messungen) | Kundenkarte fibero › Ergebnisse |
| Erlaubnisse erfassen (16 Felder) | Kundenkarte › „Freigabe anfordern“ |

## Marketing `/admin/marketing` (15 Formulare, 46 Felder – überladen)
| Sektion | Ziel |
|---|---|
| Diese Woche | KALENDER › Woche |
| Beiträge je Woche, Kanäle 90T, Reaktionen 90T | MOTOR › Sichtbarkeit › Wirkung |
| Zuletzt veröffentlicht | MOTOR › Sichtbarkeit › Log (mit Veröffentlichungen zusammen) |
| Beitrags-Werkstatt (Thema, Notizen, 4 Fassungen, LinkedIn verbinden) | MOTOR › Sichtbarkeit › Werkstatt, aus KALENDER-Tag öffnbar |
| Sichtbarkeit (Suche & Karten, Verzeichnisse, Agentur-Plattformen, Vertrauen) | MOTOR › Sichtbarkeit › Profile (Checkliste) |

## Veröffentlichungen `/admin/veroeffentlichungen`
| Sektion | Ziel |
|---|---|
| Entwürfe, Eintragen, Was hinausging | mit Marketing zusammen (doppelt: „Beitrag erfassen“) |

## Einrichtung `/admin/material`
| Sektion | Ziel |
|---|---|
| Lage des Hauses, 13 Bereiche (Belege, Systeme, Aufnahmen, Referenzen, Rechtliches …) | EINSTELLUNGEN › Website-Einrichtung |

## Verbindungen `/admin/verbindungen`
| Sektion | Ziel |
|---|---|
| Eingänge (Formular, Hand, E-Mail), Ausgang E-Mail, Kanäle (Termin, WhatsApp, LinkedIn, Meta), „Verbindung prüfen“ | EINSTELLUNGEN › Verbindungen. Fehler → Warnband in HEUTE |

## Automationen `/admin/automationen`
| Sektion | Ziel |
|---|---|
| Wartet auf Sie | HEUTE |
| Was automatisch läuft (3 Regeln), Was gelaufen ist, Was nie automatisch geschieht | MOTOR › Automationen (wird Regel-Motor für neue Aufgaben) |

## Cockpit `/admin/cockpit`
Nur Weiterleitung → entfällt.

---

## Widersprüche & Fehler (vor dem Umbau beheben)
1. Übersicht zeigt „3 Chancen“, Vertrieb zeigt „0 offene Chancen“, Pipeline-Liste ist leer.
2. Übersicht: „Lead-Weg … Betrieb gestört“ – der Anfrageweg meldet eine Störung.
3. Sichtbarkeit: Tabelle fehlt in der Live-DB („tabelle yok“).
4. Der „nächste Schritt“ existiert bei Personen, aber nicht beim Kunden.
5. Detailseiten haben 3–4 getrennte Speichern-Buttons.
6. Gemischte Sprache (Build Note, Bing Places, deutsche Titel im Türkisch-Modus).

## Was komplett fehlt
- Geld je Kunde (gewonnen, offen, Angebot, Potenzial)
- Gesundheit je Kunde (grün/gelb/rot)
- Kalender
- Externe Lead-Suche (Google Maps / Northdata) mit Punkten
- Aufgabenmotor mit Regeln (Angebot 5 Tage still, 45 Tage kein Kontakt, Rechnung überfällig, Projekt fertig → Referenz)
- Wochenplan (Mo) und Wochenbericht (Fr)
