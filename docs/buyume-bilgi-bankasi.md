# Wachstums-Wissensbank (Büyüme Bilgi Bankası)

Stand 10.10.2026. Sammelstelle für Wachstumswissen (Videos, Wettbewerber, Ideen). Jede Idee wird **einem von drei Kästen** zugeordnet, bevor irgendetwas gebaut wird. Umsetzung nur über den Plan (`v0_plans/practical-path.md`, Etappe 2b).

## Die drei Kästen
1. **Eigenes Wachstum von creaDIG** – Anfragen, Sichtbarkeit, Marke (creaDIG, Treuly, meaqam).
2. **Verkaufbare Dienstleistung für Kunden** – neues Abo-Produkt.
3. **Admin-Infrastruktur** – „Lehrlinge“ (Agenten), die Kasten 1 und 2 ohne Handarbeit betreiben.

Regel: Eine Idee ohne Kasten, Ort im Admin und Messgröße wird nicht umgesetzt.

---

## Kasten 1 — Eigenes Wachstum

### 1a. Sektor-, Standort- und Wettbewerbsanalyse
- Ort: Admin › Vertrieb › **Recherche** (existiert). Wettbewerberkarte erhält Abschnitt „Anzeigen“.
- Bekannte Wettbewerber: edisweb.de (türkische Vereine/Moscheen/Gastro), stia.systems, glaeser-it.com (Produkt „Treuli“ – Namenskollision mit Treuly, Marke prüfen/anmelden).
- **Meta-Werbebibliothek – Grenze:** zeigt in der EU Reichweite und Laufzeit, aber **keine** Klicks/Nachrichten/Verkäufe. „Beste Anzeige“ nur über Ersatzsignale:
  - läuft länger als 60 Tage,
  - viele Varianten derselben Anzeige,
  - dasselbe Motiv wird wiederholt eingesetzt.

### 1b. GEO – Sichtbarkeit in KI-Antworten
- Ort: Admin › Marketing › **Sichtbarkeit** (neu).
- Start ohne Kaufwerkzeug: eigener Fragensatz (~30 Fragen, z. B. „Treuekarte für Restaurants Nürnberg“, „Vereinssoftware Deutschland“), monatlich automatisch an GPT, Gemini, Claude, Perplexity (AI Gateway).
- Pro Lauf speichern: Wurden wir genannt? Wer wurde genannt? Warum der Wettbewerber (Quelle)? Ton der Antwort?
- Kaufwerkzeuge (Profound, Semrush AI Visibility, Ahrefs Brand Radar, Peec AI, Otterly) erst, wenn die eigene Messung Wirkung zeigt.
- Was Sichtbarkeit bringt:
  1. Originale Inhalte im Frage-Antwort-Format,
  2. sauber strukturierte Seiten (FAQ, Schema, llms.txt),
  3. Erwähnungen auf vertrauenswürdigen Seiten (IHK, Verzeichnisse, Partner, Presse, LinkedIn),
  4. echte Fallstudien.
  Punkte 3 und 4 sind die wichtigsten – Beziehungsarbeit, kein Code.
- Behauptung „Google-Update verdreifacht GEO“ = Video-Aussage, nicht belegt. Wir messen selbst.

### 1c. Messung: nicht nur Klicks
- Ort: Plan Etappe 2 „Quellen-Tracking“.
- Messgrößen: Markensuchen, Herkunft jeder Anfrage (inkl. chatgpt.com, perplexity.ai, gemini als eigene Quelle), Anfrage → Angebot → Auftrag.
- Erwartung: KI-Verkehr ist kleiner, aber kaufnäher.

---

## Kasten 2 — Dienstleistung „Meta-Anzeigen + Live-Bericht“
- Zugriff auf das Werbekonto des Kunden per Business-Manager-Partnerzugang.
- Täglicher Abruf: Nachrichten, Kosten, Anfragen.
- **Kernnutzen:** Das System meldet Einbrüche, bevor der Kunde fragt. Kundenkarte-Gesundheit wird gelb, „Heute“ zeigt z. B. „Firma Y: Nachrichten seit 3 Tagen −40 %“.
- Wöchentlicher Bericht automatisch (E-Mail oder WhatsApp, Tagesgrafik).
- Gehört zu den Ebenen Marke & Medien, Automation, KI. Monatliches Abo.
- **Hürde:** Lesezugriff auf fremde Werbekonten braucht ggf. Meta-Unternehmensverifizierung und App-Freigabe. Zuerst mit eigenen Konten (meaqam, Treuly) testen.

---

## Kasten 3 — Lehrlinge (Agenten)
**Grundregel:** Lehrling recherchiert, bereitet vor, schreibt ins Admin. **Er sendet nie selbst an Kunden** – Freigabe durch den Inhaber (gleiche Regel wie Admin › Automationen). Werkzeug (Hermes, eve o. a.) ist zweitrangig; entscheidend ist die klare Aufgabe.

| # | Lehrling | Liest | Schreibt nach | Voraussetzung |
|---|---|---|---|---|
| 1 | Recherche | Web, Meta-Werbebibliothek | Recherche | – |
| 2 | Bericht | Meta-Werbekonto | Kundenkarte, „Heute“, Wochenbericht | Meta-Zugang |
| 3 | Sichtbarkeit | KI-Antworten (Fragensatz) | Marketing › Sichtbarkeit | Fragensatz |
| 4 | Inhalt | Projekte, Build Notes | Marketing › Entwürfe | existiert teilweise |
| 5 | Nachfassen | Anfragen, Chancen | „Heute“ (z. B. „48 h – melden“) | echte Daten |

---

## Warum es „noch kein System“ ist
Die Infrastruktur steht, aber **es fließen keine echten Daten**: Chancen sind Testdatensätze, keine externe Verbindung (Meta, Analytics) liefert. Lehrlinge brauchen Daten. Reihenfolge:
1. Kundenkarte + „Heute“ (begonnen).
2. Quellen-Tracking + erste externe Datenquelle (Meta, eigenes Konto).
3. Lehrlinge, einer nach dem anderen – nie alle gleichzeitig.

## Etappe 2b im Gesamtplan (nach Etappe 2, vor Etappe 3)
Startet erst, wenn Etappe 2 (Quellen-Tracking) echte Daten liefert. Je Schritt: eigener Branch → Vorschau → Owner-OK.
1. **2b.1 Recherche-Lehrling** – Sektor/Standort/Wettbewerber + Werbebibliothek → Recherche.
2. **2b.2 GEO-Messung** – Fragensatz, monatlicher Lauf → Marketing › Sichtbarkeit.
3. **2b.3 Meta-Bericht** – zuerst eigene Konten (meaqam, Treuly), Einbruch-Warnung, Wochenbericht; danach Kunden-Abo (Meta-Verifizierung vorher klären).
4. **2b.4 Nachfass-Lehrling** – Erinnerungen nach „Heute“.
DB nur additiv (Tabellen für GEO-Läufe, Werbekennzahlen), zuerst auf Neon-Branch.

## Eingang neuer Wissensstücke
Neues Video/Wettbewerber/Idee → hier unter dem passenden Kasten eintragen (Quelle, Datum, Aussage, belegt ja/nein) → erst bei Planfreigabe umsetzen.
