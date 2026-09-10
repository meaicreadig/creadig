# Acceptance-Matrix · Website 2.0

Die zentrale Liste. Jeder Befund hat eine dauerhafte ID, einen Wahrheitsstand,
eine Priorität und **genau ein** besitzendes Gate.

**Quelle `AUDIT-n`** = Befund *n* aus dem unabhängigen Audit vom 10.09.2026.
**Quelle `G00`** = in Gate 00 zusätzlich gemessen.

Gemessen am 10.09.2026 gegen HEAD `4eb05c3`, gebaut und lokal ausgeliefert;
Produktion zusätzlich live geprüft. Produktion und Branch liefen zum Messzeit-
punkt **auf demselben Stand** — die Karriere-Neuordnung war bereits deployt.
Deshalb ist fast jeder Audit-Befund `CONFIRMED_CURRENT` und nicht
`FIXED_ON_BRANCH`.

## Zusammenfassung

| | Anzahl |
|---|---:|
| Befunde gesamt | 43 |
| P0 | 0 |
| P1 | 11 |
| P2 | 19 |
| P3 | 13 |
| CONFIRMED_CURRENT | 39 |
| NOT_REPRODUCED | 2 |
| EXTERNAL_BLOCKED | 1 |
| UNVERIFIED | 1 |
| OWNER_BLOCKED | 0 |

Alle Befunde sind einem Gate zugeordnet. Kein heimatloser Befund.

---

## P1 · Deutlicher Produkt-, Vertrauens- oder Verkaufsfehler

| ID | Quelle | Wahrheitsstand | Route/Bereich | Befund | Beleg aus Gate 00 | Gate |
|---|---|---|---|---|---|---|
| WEB-0001 | AUDIT-1 | CONFIRMED_CURRENT | `/arbeiten` | Keine freigegebene Kundenarbeit, obwohl „Arbeiten" genau das erwarten lässt | `/arbeiten` verlinkt **ausschließlich** die vier eigenen Produkte, 0 eigene Ziele, 191 Wörter | G02 |
| WEB-0002 | AUDIT-2 | CONFIRMED_CURRENT | `/produkte`, Detailseiten | Vier Produkte als Hauptbeweis, drei „im Aufbau", Details nennen Bausteine statt Wirkung | `/produkte/fibero` und `/produkte/meai`: **0 Bilder** im `main` | G02 |
| WEB-0003 | AUDIT-3 | CONFIRMED_CURRENT | `/`, `/leistungen` | Fünf Ebenen werden vor dem Nutzerproblem erklärt | Startseite: 31 Eyebrows, 9 H2 vor der ersten Kundenwirkung | G01 |
| WEB-0004 | AUDIT-4 | CONFIRMED_CURRENT | `/leistungen` | Operations und Intelligence sind Kategorien, kein kaufbarer Einstieg | Kein Preis, keine Projektgröße, kein Beispiel für beide Ebenen | G01 |
| WEB-0005 | AUDIT-5 | CONFIRMED_CURRENT | `/produkte` + `/arbeiten` | Beide Seiten zeigen dieselbe Sammlung | **Identische vier Ziel-Links** auf beiden Seiten; `/arbeiten` hat kein einziges eigenes Ziel | G01 |
| WEB-0006 | AUDIT-6 | CONFIRMED_CURRENT | `/betrieb`, `/leistungen` | „Fällt nachts etwas aus, ist das unser Problem" neben „kein 24/7", „Reaktionszeit in Stunden", „Wochenende" | Beide Aussagen auf **beiden** Seiten im selben Dokument nachgewiesen | G03 |
| WEB-0007 | AUDIT-7 | CONFIRMED_CURRENT | `/unternehmen` | Lieferfähigkeit: weder Personen, Rollen noch Kapazitätsmodell sichtbar | 858 Wörter, 36 Eyebrows, keine Rollenstruktur | G02 |
| WEB-0008 | AUDIT-8 | CONFIRMED_CURRENT | `/termin` | Vier Schritte für ein 20-Minuten-Erstgespräch | Fortschritt 25 % → 50 % über mehrere Schritte gemessen | G06 |
| WEB-0009 | AUDIT-9 | EXTERNAL_BLOCKED | `meai.run` (extern) | „2-Faktor & Bot-Schutz folgen" als Sicherheits-Gegensignal | `meai.run` antwortet mit 307, Text von hier **nicht verifizierbar**; liegt außerhalb von creadig.de | G02 |
| WEB-0010 | AUDIT-10 | CONFIRMED_CURRENT | `/en/*`, `/ar/*` 404 | Lokalisierte 404-Seiten zeigen türkischen Haupttext | **Ursache gefunden:** `app/(en)/en/not-found.tsx:13` und `app/(ar)/ar/not-found.tsx:13` lesen beide `dictionary.tr.errorPages.notFound`. Live reproduziert | G07 |
| WEB-0036 | G00 | CONFIRMED_CURRENT | `/leistungen/*` | 44 % wortgleiche Copy über vier Digital-Seiten | 8 von 18 tragenden Sätzen aus `/webdesign` stehen wortgleich auf ≥2 weiteren Seiten | G03 |

---

## P2 · Spürbare Qualitätsminderung

| ID | Quelle | Wahrheitsstand | Route/Bereich | Befund | Beleg aus Gate 00 | Gate |
|---|---|---|---|---|---|---|
| WEB-0011 | AUDIT-11 | CONFIRMED_CURRENT | `/` Hero | Emotional stark, konkret schwach — kein Ergebnissatz | 642 Wörter auf der Startseite, Kaufgegenstand spät | G01 |
| WEB-0012 | AUDIT-12 | CONFIRMED_CURRENT | `/leistungen/*` | Vier Digital-Seiten wiederholen Ausgangslage/Was wir bauen/Was danach anders ist | Dieselben drei Überschriften auf allen vier; Seiten messen 3.214–3.270 px, je 8 H2, 11 Eyebrows, 307–331 Wörter | G03 |
| WEB-0013 | AUDIT-13 | CONFIRMED_CURRENT | `/leistungen` | Länge | **9.854 px Desktop · 15.666 px mobil · 61 Eyebrows · 1.127 Wörter** — längste Seite der Website | G03 |
| WEB-0014 | AUDIT-14 | CONFIRMED_CURRENT | `/` | Länge, doppelte Produktdarstellung | **13.449 px mobil**, „Ausgewählte Arbeiten" und „Vier eigene Produkte" auf derselben Seite | G03 |
| WEB-0015 | AUDIT-15 | CONFIRMED_CURRENT | `/karriere` | Länge für einen Talent Pool ohne offene Stelle | **9.826 px mobil** nach der Neuordnung (vorher 14.271 px) | G03 |
| WEB-0016 | AUDIT-16 | CONFIRMED_CURRENT | Leistungs-/Produktdetails | Visuelle Monotonie, kaum UI oder Diagramme | **0 Bilder** auf allen sechs Leistungsdetail- und beiden Produktdetailseiten | G04 |
| WEB-0017 | AUDIT-17 | CONFIRMED_CURRENT | `/produkte/*` | „Oberflächen zeigen wir erst …" obwohl `/arbeiten` Oberflächen zeigt | `/arbeiten` 4 Bilder, `/produkte/fibero` 0 Bilder | G03 |
| WEB-0018 | AUDIT-18 | CONFIRMED_CURRENT | `/insights` | Ein Artikel trägt einen Hauptnavigationspunkt | 1 veröffentlichter Beitrag, 6 definierte Fächer, Seite 2.413 px | G01 |
| WEB-0019 | AUDIT-19 | CONFIRMED_CURRENT | `/` | Insight-Teaser führt zur Übersicht statt zum Artikel | Startseite: **4 Links auf `/insights`, 0 auf den Artikel** | G05 |
| WEB-0020 | AUDIT-20 | CONFIRMED_CURRENT | `/insights/eigene-seite-geprueft` | Sehr lang, fast ohne Bilder | 9.361 px mobil, 1.079 Wörter, 0 Bilder | G04 |
| WEB-0021 | AUDIT-21 | CONFIRMED_CURRENT | `/betriebscheck` | Ergebnis priorisiert Ebene, nicht konkrete Antworthebel | 330 Wörter, 1 H2 — Ergebnis ohne Antwortbezug | G06 |
| WEB-0022 | AUDIT-22 | CONFIRMED_CURRENT | `/produkte/*` | Sehr langer Einwilligungstext für eine Produktnachricht | Interesse-Formular auf allen Produktdetailseiten | G06 |
| WEB-0023 | AUDIT-23 | CONFIRMED_CURRENT | `/kontakt` | Osnabrücker Sitz plus Schweizer WhatsApp-Nummer unerklärt | `+41`-Nummer neben deutscher Anschrift, keine Einordnung | G03 |
| WEB-0024 | AUDIT-24 | CONFIRMED_CURRENT | `/` Preise | 2.400-€-Preis ankert creaDIG als Website-Anbieter | Startseite nennt 2.400 €, 3.900 € und 149 €/Monat | G01 |
| WEB-0025 | AUDIT-25 | CONFIRMED_CURRENT | `/leistungen/barrierefreiheit-website` | Länge | **10.890 px mobil · 24 Eyebrows · 1.026 Wörter · 14 H2** | G03 |
| WEB-0026 | AUDIT-26 | NOT_REPRODUCED | Global | Erste Ansicht nach Navigation kurz blass/leer | Gemessen lokal **und** gegen Produktion: Above-the-fold ab 100 ms voll deckend (2/2). Mit dieser Methode nicht reproduzierbar | G08 |
| WEB-0027 | AUDIT-27 | CONFIRMED_CURRENT | TR/AR | Lateinische Ebenenbegriffe, einzelne Mischwörter | Ebenennamen bleiben lateinisch in allen Sprachen | G07 |
| WEB-0037 | G00 | CONFIRMED_CURRENT | `/leistungen`, `/` | Extremwert visuelle Wiederholung | `/leistungen` **61 Eyebrows** auf einer Seite; `/unternehmen` 36; `/` 31 | G04 |
| WEB-0038 | G00 | CONFIRMED_CURRENT | Global mobil | Mobile Serialisierung: Faktor 1,4–1,9 gegenüber Desktop | Schlechteste: `/leistungen/barrierefreiheit-website` 1,9 · `/systeme` 1,8 · `/kontakt` 1,8 | G04 |

---

## P3 · Politur

| ID | Quelle | Wahrheitsstand | Route/Bereich | Befund | Beleg aus Gate 00 | Gate |
|---|---|---|---|---|---|---|
| WEB-0028 | AUDIT-28 | CONFIRMED_CURRENT | `/produkte/*` | „Alle Produkte" doppelt | **3** Links auf `/produkte` innerhalb `main` der Detailseite | G05 |
| WEB-0029 | AUDIT-29 | CONFIRMED_CURRENT | Global mobil | Viele Eyebrows/Metadaten bei 11 px | **42 Textknoten mit 11 px** allein auf der mobilen Startseite | G07 |
| WEB-0030 | AUDIT-30 | UNVERIFIED | `/termin` | Letzter Fortschritt zeigt 95 % | 25 % und 50 % bestätigt; letzter Schritt durch Automatik nicht erreicht (Weiter bleibt bis zur Auswahl deaktiviert) | G06 |
| WEB-0031 | AUDIT-31 | CONFIRMED_CURRENT | `/karriere` | „Dein Platz" wechselt zum sonstigen „Sie" | Kapitelname duzt, Fließtext siezt | G03 |
| WEB-0032 | AUDIT-32 | CONFIRMED_CURRENT | `/produkte/*` | Support- und Interessenformular auch bei nicht nutzbaren Produkten | Beide Blöcke auf allen vier Produktseiten, auch „im Aufbau" | G05 |
| WEB-0033 | AUDIT-33 | CONFIRMED_CURRENT | Footer | Sehr umfangreich, auf jeder langen Seite dominant | 28 Ziele, 968 px Desktop / 1.887 px mobil | G04 |
| WEB-0034 | AUDIT-34 | CONFIRMED_CURRENT | Mobiles Menü | Inhalt höher als ein Viewport | **1.071 px Inhalt bei 844 px Viewport**, 12 Ziele, scrollt | G04 |
| WEB-0035 | AUDIT-35 | CONFIRMED_CURRENT | `/unternehmen` | Viel Meta-Erklärung über nicht genannte Zahlen | 5 von 8 Abschnitten reiner Text | G03 |
| WEB-0039 | G00 | CONFIRMED_CURRENT | `/arbeiten` | Seite trägt 25 Eyebrows bei nur 191 Wörtern und 1 H2 | Höchstes Verhältnis Label zu Inhalt der ganzen Website | G04 |
| WEB-0042 | G00 | CONFIRMED_CURRENT | `/datenschutz` | Rechtstext ohne jede Gliederungsebene | 906 Wörter, **0 H2**, 18 Eyebrows, 5.432 px — die Struktur trägt keine Überschriften | G07 |
| WEB-0043 | G00 | CONFIRMED_CURRENT | Arabischer Baum | Arabisch trägt dieselbe Länge und Wiederholung wie Deutsch | `/ar/leistungen` **61 Eyebrows, 14.898 px mobil**; `dir=rtl` und `lang=ar` korrekt, kein Überlauf | G04 |
| WEB-0040 | G00 | NOT_REPRODUCED | Sitemap | Erst vermutet: `/arbeiten` fehlt in der Sitemap | Widerlegt — eigener Filterfehler. `/arbeiten` ist enthalten (24 Treffer). Bleibt als Beleg, dass nicht jede Vermutung ein Befund ist | G00 |
| WEB-0041 | G00 | CONFIRMED_CURRENT | `/produkte/*` | Drei Produktdetailseiten sind dieselbe Schablone mit getauschtem Text | `fibero`, `cassamea` und `meahv` sind **exakt 4.809 px** hoch, je 0 Bilder, 307–315 Wörter. Nachgemessen in Gate 00 | G05 |

---

## Verteilung auf die Gates

| Gate | Befunde | IDs |
|---|---:|---|
| G01 · Positionierung & IA | 6 | 0003, 0004, 0005, 0011, 0018, 0024 |
| G02 · Proof & Vertrauen | 4 | 0001, 0002, 0007, 0009 |
| G03 · Content-System | 11 | 0006, 0012, 0013, 0014, 0015, 0017, 0023, 0025, 0031, 0035, 0036 |
| G04 · Visuelles System | 8 | 0016, 0020, 0033, 0034, 0037, 0038, 0039, 0043 |
| G05 · Umsetzung | 4 | 0019, 0028, 0032, 0041 |
| G06 · Formulare & Werkzeuge | 4 | 0008, 0021, 0022, 0030 |
| G07 · A11y, Mobile, i18n | 4 | 0010, 0027, 0029, 0042 |
| G08 · Technik & Performance | 1 | 0026 |
| G09 · Schluss-Audit | 0 | — |
| G00 · abgeschlossen | 1 | 0040 |
