# creaDIG · Deep Business Growth & Control Audit

**Marketing · Sales · Admin/Owner Control**
**Stand:** 13.09.2026 · Production `35e1fa3` (laut Hauptbuch) · Branch `feat/system-haus-site` @ `28b427a`
**Art:** Diagnose. Keine Codeänderung, kein Commit, kein Deploy, kein Kundenkontakt, keine Anmeldung im Admin.

---

## 0 · Wie geprüft wurde — und wo die Grenzen lagen

Reihenfolge wie vorgegeben: öffentliche Fläche → Kanäle → Funnel → Werkzeuge → interne Systeme → Datenlage → erst dann Canon/Gates.

| Quelle | Umfang | Grenze |
|---|---|---|
| creadig.de live | alle **27 deutschen Sitemap-Seiten** + Impressum vollständig gecrawlt (13.09.) | — |
| Google / öffentliche Register | Markensuche, Personensuche, Kategorie-Suche „Website Handwerksbetriebe Osnabrück", Registerbefund | Suche ist US-basiert; Ranking lokal nicht messbar |
| LinkedIn / Instagram / Facebook | nur öffentlich auffindbare Profile und Beiträge | Login-Wand: Frequenz, Follower, Reaktionen **[UNBEKANNT]** |
| Vercel Web Analytics | Abfrage Besuche, Referrer, Pfade, Events | API: **„Web Analytics not found"** → keine Besucherdaten verfügbar |
| Datenbank (Neon) | geplant: nur Zählungen | `.env.local` enthält Vercel-maskierte Werte (`[SENSITIVE]`) — **nicht umgangen** |
| Produktionsdaten | aus Nachweis-Commits (G12, 09.09.) und dem Programm-Hauptbuch (`docs/final-live-completion/state.md`, 13.09.) | Stand der Zählungen: 09.09.; seither Veränderung **[UNBEKANNT]** |
| Admin / Control Center | vollständig **am Code** geprüft (17 Seiten) | keine Anmeldung — Passworteingabe ist ausgeschlossen |
| Canon / Docs / Gates | ~80 Dokumente, Sales-/Market-/Contact-Canon gelesen | zuletzt, wie verlangt |

**Kennzeichnung:** `[OBJECTIVE]` belegte Lücke · `[BUSINESS JUDGEMENT]` strategische Bewertung · `[MATURITY GAP]` gute Struktur, noch nicht benutzt · `[UNBEKANNT]` / `[ANNAHME]` wo Belege fehlen.
**Reifestufen:** BUILT → OPERATIONAL → USED → MEASURED → PROVEN.

---

# 1 · EXECUTIVE VERDICT

**creaDIG hat in drei Wochen das Betriebssystem eines Unternehmens gebaut, das noch keinen Verkaufsrhythmus hat.**

Das ist keine rhetorische Zuspitzung — das System sagt es über sich selbst. Das Programm-Hauptbuch vom 13.09. führt **kein einziges Programm als CLOSED**, und schreibt wörtlich:

> *„Owner-unabhängige BUILD-Arbeit, die ein echtes Geschäftsergebnis freischaltet, ist weitgehend erschöpft. Was fehlt, sind Ereignisse: ein echter Besucher, ein echter Lead, eine Kundenfreigabe, eine Owner-Tatsache."*

Die geschäftliche Lage in Zahlen — nur Belegtes:

| Größe | Wert | Quelle |
|---|---|---|
| Commits seit 22.08. | **283** in 22 Tagen (davon 69 Gate-Commits) | `git log` |
| Echte Anfragen über die Live-Seite | **0 belegt** | Hauptbuch F03: „kein echtes Ereignis belegt" |
| Verkaufschancen in Produktion | **2** (vor und nach G12 unverändert) | Commit `e922834`, 09.09. |
| Organisationen / Kontakte | **32 / 15** | ebenda |
| Historische Kunden im Bestand | **19** — für **18** davon kein einziger Betriebszustand erfasst | `market-canon.md` §6 |
| Freigegebene Kundenfälle | **0** — `/arbeiten` sagt öffentlich: „deshalb steht hier niemand" | Live-Seite |
| Veröffentlichte Inhalte | **1** Insight (23.08.) — seither 21 Tage keiner | `lib/insights.ts` |
| Verlinkte Social-Profile | **0** (`socialProfiles: []`) | `lib/site-data.ts:1243` |
| Messung auf der Plattform | **nicht aktiv** | Vercel Web Analytics API: not found |
| Durchgelaufener Fall Marketing→Rechnung | **0** (`durchlauf().belegt = null`) | Gate 36 |
| Offene Owner-Punkte | **35** im Materialstand + **5** in der Owner-Warteschlange | `lib/material-status.ts`, Hauptbuch |

**Wo creaDIG geschäftlich wirklich steht:**

1. **Das Produkt der letzten Wochen ist Infrastruktur, nicht Nachfrage.** Die Infrastruktur ist gut — in Teilen besser als bei Agenturen mit zehn Leuten. Aber keine einzige Komponente hat bisher einen Marktkontakt erzeugt.
2. **Der vorhandene Umsatzmotor liegt neben dem System.** Echte Kundenarbeit läuft (Vegitat, maqam, NV SWISS), aber außerhalb von CRM, Lieferkette und Beleg-Pfad.
3. **Die öffentliche Identität ist nicht konsistent genug für Vertrauen ab Mittelstand.** Impressum mit Platzhaltern, Schweizer Mobilnummer als einzige Nummer, „Einzelunternehmen" auf der Seite gegenüber einer aktiven UG im Register.
4. **Die Marktthese auf der Website widerspricht der eigenen Datenlage.** Die Seite führt mit Handwerk; der eigene Canon stellt fest: *0 von 19 Kunden sind Handwerk* — Kunden kamen über Nähe und Beziehung.

**Kurzurteil:** Das Hauptproblem ist nicht Marketing-Handwerk und nicht der Vertriebsprozess. Es ist, **dass die knappste Ressource — die Stunde des Inhabers — in den Bau des Systems fließt statt in Marktkontakt**, und dass die wenigen Owner-Handlungen, die Vertrauen und Verkauf freischalten würden, seit Wochen offen sind.

---

# 2 · WAS BEREITS STARK IST

Nur echte Stärken, jeweils mit Beleg.

## Marketing

| Stärke | Beleg | Reife |
|---|---|---|
| **Wahrheitsdisziplin als Markenkern** | `/arbeiten` zeigt lieber niemanden als einen unfreigegebenen Kunden; `/aufwandsrechner` nennt ausdrücklich keine Projektzahl, „weil es keine Reihe abgeschlossener Projekte gibt"; Sterne-Gate verhindert unbelegte Bewertungen | PROVEN (als Haltung) |
| **Die Handwerk-Seite rahmt das Problem hervorragend** | „Anfrage · Angebot · Termin · Auftrag · Dokumentation · Rechnung — sechs Schritte, meist sechs Werkzeuge"; „Abends am Küchentisch aus dem Gedächtnis rekonstruiert. Was fehlt, wird nicht abgerechnet." | BUILT |
| **Originaler Content-Ansatz** | Insight „Wir haben unsere eigene Seite geprüft. Acht Mängel." — mit Messfehler, der fast als Ergebnis durchgegangen wäre. Das schreibt keine Durchschnittsagentur | USED (einmal) |
| **fibero als ehrliche Fähigkeitsprobe** | Die Seite beschreibt den Vorgang technisch präzise und sagt: „Nicht belegt ist eine Zeitersparnis." | BUILT |
| **Transparente Einstiegspreise** | 2.400 € Pilot · 3.900 € · 149 €/Monat · BFSG 1.500 € — öffentlich, netto, mit Eigentumsaussage | USED (öffentlich) |

## Sales

| Stärke | Beleg | Reife |
|---|---|---|
| **Verkaufschance entsteht nur durch einen Menschen** | `sales-operating-engine.md` §1: Import, Anfrage, „warm", „kunde" erzeugen **keine** Chance | BUILT + getestet |
| **Beziehung ≠ Chance, und Ansprache braucht Deckung** | `contact-canon.md` §4: nur bestehender Weg oder öffentlich belegter Anlass — passt exakt zur Grundregel „keine Kaltakquise" | BUILT |
| **Qualifizierung über Betriebszustand statt Branche** | `market-canon.md` §2: neun beobachtbare Signale, „zwei Signale, nicht eines" | BUILT |
| **Discovery, Angebotsschema, Lieferkette** | zehn Discovery-Fragen; `proposal-outline.md` beginnt „in den Worten des Kunden"; Angebot→Annahme→Projekt→Abnahme→Übergabe im Code | BUILT, **nie benutzt** |
| **Ehrliche Selbstkritik im Canon** | Hypothesenregister: Handwerk „ungeprüft", Branche „widerlegt", TR-DE als Segment „widerlegt", Nähe „gestützt" | PROVEN (als Analyse) |

## Admin

| Stärke | Beleg | Reife |
|---|---|---|
| **„Heute" ist nach Geschäftsdringlichkeit gerankt, nicht nach Technik** | `lib/attention.ts`: Betrieb gestört → Überfällig → Heute fällig → Neue Anfrage → Schritt ohne Termin → Ohne Schritt → Kontaktpflege → Ihre Entscheidung; „Wäre alles rot, wäre nichts rot." | OPERATIONAL |
| **UNBEKANNT bleibt UNBEKANNT** | `estimated_value = NULL` heißt „nicht geschätzt"; Testdaten ausgeschlossen statt gelöscht | OPERATIONAL |
| **Der Lead-Weg ist robust** | `app/api/lead/route.ts`: Mail ist Hauptweg, Speicher Ergänzung, Alarm bei Speicherausfall; Betriebscheck-Score und Engpass reisen mit der Anfrage | OPERATIONAL, **0 echte Nutzung belegt** |
| **Das Hauptbuch trennt „gebaut" von „bewiesen"** | `state.md`: BUILD · CUTOVER · LIVE · CLOSURE je Programm | OPERATIONAL (als Dokument) |

---

# 3 · DIE 5 ROOT CAUSES

## RC1 · Die Owner-Stunde fließt in Systembau statt in Marktkontakt

| | |
|---|---|
| **EVIDENCE** | 283 Commits in 22 Tagen, bis zu 65 an einem Tag; 36 Gates; parallele Bau-Läufe („der parallele Lauf steht bei G14–G17", Commit `e922834`). Im selben Zeitraum: 1 Insight, 0 belegte Anfragen, Verkaufschancen 2 → 2. Das Hauptbuch selbst: *„Warten wird nur dann zum Versäumnis, wenn jemand die Wartezeit mit Bauen füllt, das niemand bestellt hat."* |
| **MARKETING EFFECT** | Keine Veröffentlichung, keine Distribution, kein Profil verlinkt |
| **SALES EFFECT** | 19 Altkunden und 15 Kontakte liegen im System, ohne dass eine Aktivität belegt ist |
| **ADMIN EFFECT** | Das Control Center hat nichts zu steuern — „Heute" kann nur zeigen, was jemand eingetragen hat |
| **BUSINESS CONSEQUENCE** | Jede Woche Bauarbeit verschiebt den ersten reproduzierbaren Verkauf um eine Woche — ohne dass es sich wie Stillstand anfühlt |

`[BUSINESS JUDGEMENT]` Gestützt durch `[OBJECTIVE]`-Zahlen. Das ist kein Vorwurf: Bauen ist für einen Medieninformatiker die vertraute, messbare, kontrollierbare Arbeit. Verkaufen ist das Gegenteil davon.

## RC2 · Owner-Tatsachen, die Vertrauen und Umsatz freischalten, bleiben offen

| | |
|---|---|
| **EVIDENCE** | Live-Impressum 13.09.: „Umsatzsteuer-Status noch nicht freigegeben. **Platzhalter**" · „+41 76 504 58 79 · Deutsche Rufnummer folgt. **Platzhalter**". Beides seit **22.08.** als Blocker benannt. Gate 36: die Station „Rechnung" trägt nicht — *Steuerstatus offen*. Hauptbuch-Owner-Warteschlange: 5 Punkte, darunter Kapazität und Vertretung, „zwei Sätze" |
| **MARKETING EFFECT** | Ein Besucher, der das Impressum öffnet, liest zweimal „Platzhalter" auf einer Live-Seite |
| **SALES EFFECT** | Ein gewonnener Auftrag **kann heute nicht korrekt fakturiert werden** |
| **ADMIN EFFECT** | Owner-Entscheidungen verteilen sich auf Materialstand, Beleg-Cockpit, Cockpit, Hauptbuch-Dokument |
| **BUSINESS CONSEQUENCE** | Das System wartet auf den Owner, und der Owner baut am System, das auf ihn wartet |

## RC3 · Die öffentliche Marktthese widerspricht der eigenen Datenlage

| | |
|---|---|
| **EVIDENCE** | Website: `/branchen/handwerk`, `/leistungen/website-handwerk` („6–20 Mitarbeiter in NRW und Niedersachsen"), „Pilotpreis für den ersten Betrieb in einem Gewerk". Eigener Canon (`market-canon.md` §1): **„Handwerksbetriebe unter 19 Kunden: 0"** — *„Die Handwerk-Ausrichtung hat null Belege."* Hypothese „Nähe sagt mehr vorher als Branche": **gestützt**. 12 der 16 bekannten Orte im Band Osnabrück–Bielefeld–Münsterland–Oldenburger Münsterland |
| **MARKETING EFFECT** | Die Seite spricht einen Käufer an, der nie gekauft hat, und kommuniziert „DACH" statt des Bands, in dem tatsächlich gekauft wurde |
| **SALES EFFECT** | Kein Prospecting-Fokus: Wen soll der Owner morgen anrufen — den unbekannten Dachdecker oder den bekannten Betrieb in Bünde? |
| **ADMIN EFFECT** | Hypothesenregister existiert im Dokument, steuert aber nichts im Admin |
| **BUSINESS CONSEQUENCE** | Marketingenergie geht in ein Segment, das der eigene Beleg nicht trägt |

`[OBJECTIVE]` Widerspruch zwischen Canon und öffentlicher Fläche.

## RC4 · Es gibt keinen einzigen zeigbaren Markt-Beweis — und die echten Fälle liegen außerhalb des Systems

| | |
|---|---|
| **EVIDENCE** | `/arbeiten`: „Heute liegt keine solche Freigabe vor, deshalb steht hier niemand." Hauptbuch F05: *„Die Vegitat-Arbeit läuft daneben"* (Branch, Excel, Python). NV SWISS: Kontaktfreigabe durch Owner fehlt. maqam: aktive Architekturarbeit am 11.09. in einem separaten Arbeitsverzeichnis |
| **MARKETING EFFECT** | Nur Eigenprodukte als Beleg — die beweisen Können, nicht Lieferung für Dritte |
| **SALES EFFECT** | Ab 10.000 € fragt jeder Käufer „Für wen haben Sie das schon gemacht?" — die Antwort ist heute öffentlich „für niemanden, den wir nennen dürfen" |
| **ADMIN EFFECT** | Lieferung, Beleg und Rechnung können für die realen Fälle nicht aus dem System geführt werden |
| **BUSINESS CONSEQUENCE** | Der Delivery→Proof→Sales-Kreislauf ist an genau der Stelle unterbrochen, wo echte Substanz existiert |

## RC5 · Null Distribution: Das System hat keinen Weg in den Markt

| | |
|---|---|
| **EVIDENCE** | Hauptbuch F07 Marketing: **`NOT_STARTED` — „kein System vorhanden"**. Die im Auftrag genannte „Marketing OS" existiert **nicht in diesem Repository** (Hauptbuch-Korrektur). Das Marketing-Admin mit Kampagnen/Newsletter, das lokal existiert, gehört zum **Kundenprojekt maqam**, nicht zu creaDIG. `socialProfiles: []`. Letzter öffentlich auffindbarer LinkedIn-Beitrag des Inhabers: **18.05.2023** (aus der Beitrags-ID datiert). Vercel Web Analytics: nicht aktiv. Google zeigt für creadig.de noch den Titel „**Digitalagentur** & Business Architecture" |
| **MARKETING EFFECT** | Außerhalb des bestehenden Netzwerks entdeckt niemand creaDIG |
| **SALES EFFECT** | Kein Inbound, also hängt alles an Beziehung — die wiederum nicht aktiv gepflegt wird (RC1) |
| **ADMIN EFFECT** | Selbst wenn Besucher kämen: niemand würde es sehen |
| **BUSINESS CONSEQUENCE** | Der beste Content-Ansatz im Haus (Build Notes) erreicht niemanden |

`[OBJECTIVE]` Wichtige Korrektur der Auftragsannahme: **creaDIG hat kein Marketing OS.** Es hat eine Website mit Content-Regeln.

---

# 4 · MARKETING · FULL AUDIT

## 4.1 Positionierung: „creaDIG ist …"

Nach einem Besuch der Startseite bleiben **mehrere Bilder gleichzeitig** stehen. Gezählte Selbstbeschreibungen auf der Live-Seite:

| Wo | Was creaDIG angeblich ist |
|---|---|
| Title / Kopfzeile | „System-Haus für digitale Betriebe" |
| H1 | „Wir bauen, was andere nicht sehen." |
| Subline | „Wir bauen Betrieben das System, an dem ihre Arbeit hängt: Auftrag, Kunde, Beleg und Zahl an einem Ort." |
| Meta-Description | „das Dach über eigenen Systemen — von Marke bis KI" |
| Unternehmen | „Kein klassisches IT-Systemhaus" · „aus der Agentur zum System-Haus gewachsen" · „Haus, das eigene Produkte erfindet" |
| Preiskarte | „Das Website-Paket kostet 3.900 €" |
| Google-Index | „Digitalagentur & Business Architecture \| DACH" |
| Register / LinkedIn | „creaDIG solutions UG", Geschäftsführer mit „digital innovation, brand growth & creative direction" |

`[BUSINESS JUDGEMENT]` Die Breite ist **teilweise integriert** — die fünf Ebenen sind ein echtes Ordnungsmodell. Aber sie ist **diffus am Erstkontakt**, aus drei konkreten Gründen:

1. **Die H1 sagt nichts, was ein Käufer über sich erkennt.** „Wir bauen, was andere nicht sehen" besteht den Gegenteil-Test nicht. Die starke Aussage steht eine Zeile tiefer.
2. **Die Kategorie verspricht Systeme, das kaufbare Produkt ist eine Website.** Der einzige Festpreis gilt für „Digital". Operations, Automation und Intelligence stehen auf „Angebot nach Analyse" (Hauptbuch-Blocker OD-6).
3. **Die Außenwelt hat das alte Bild gespeichert.** Google, LinkedIn und Facebook zeigen noch Agentur/UG-Bilder.

## 4.2 Kategorie „System-Haus für digitale Betriebe"

| Kriterium | Urteil | Begründung |
|---|---|---|
| **MEMORABLE** | mittel | „System-Haus" ist merkbar — aber in Deutschland von IT-Systemhäusern besetzt (Server, Lizenzen, Helpdesk). Die Seite braucht dafür einen eigenen Abgrenzungssatz |
| **CLEAR** | schwach | Die Erklärung braucht drei Absätze. Gate 02 hat „digitale Betriebe" schon einmal korrigiert, weil ein Dachdecker sich ausgeschlossen fühlte |
| **DIFFERENTIATED** | stark | Eigene Produkte + Betrieb + Integration aus einer Hand ist echt unterscheidbar |
| **USEFUL** | mittel | Hilft dem Käufer erst, wenn er sein eigenes Problem schon als „System fehlt" formuliert |
| **BUYABLE** | schwach | Man kann „ein System-Haus" nicht kaufen. Man kann eine Website für 3.900 € kaufen — und die ist kein System |

`[BUSINESS JUDGEMENT]` **Die Kategorie ist ein gutes Innenbild und ein schwaches Außenwort.** Käufer erkennen sich im **Symptom** wieder („sechs Schritte, sechs Werkzeuge", „Zettel im Fahrzeug"), nicht in der Kategorie. Die Handwerk-Seite beweist das: Sie ist der am besten verständliche Text der ganzen Seite — und sie nennt das Wort „System-Haus" im Hauptteil nicht.

## 4.3 Wen spricht creaDIG heute faktisch an?

Abgeleitet aus Live-Content, nicht aus ICP-Dokumenten:

| Gruppe | Faktische Ansprache | Einstieg vorhanden? |
|---|---|---|
| **Small Business** (Handwerk, Praxis, Gastro, Dienstleister) | stark: Handwerk-Seite, Betriebscheck, Aufwandsrechner, Festpreise, WhatsApp, TR | **ja** |
| **Mid-Market** | schwach: `/systeme`, `/betrieb`, Systemgespräch | teilweise — ohne Fall, ohne Kapazitätsaussage |
| **Large / International** | faktisch nicht: „DACH" im Header, EN/AR-Übersetzung | **nein** |

Genannt werden gleichzeitig: Handwerk 6–20 MA (NRW/NDS), Handwerk 5–50 (Canon), KMU ohne IT, Gastronomie DE+CH, Praxen, Dienstleister, „jede Branche und Größe", DACH, vier Sprachen.

`[OBJECTIVE]` **Drei unterschiedliche Größenangaben für die Kernzielgruppe** (6–20 auf der Seite, 5–50 im Canon, „jede Größe" auf `/unternehmen`).
`[BUSINESS JUDGEMENT]` Für Small Business gibt es genug Einstiege. Das Problem ist nicht zu wenig Zielgruppe, sondern **zu wenig Käufer, die überhaupt auf die Seite kommen** (RC5).

## 4.4 Message Hierarchy

Welche Botschaft dominiert, gezählt nach prominenter Platzierung (H1/H2/Hero/CTA) über die 27 Seiten:

| Botschaft | Präsenz | Wo sie führt |
|---|---|---|
| Fünf Ebenen / „von der Marke bis zur KI" | **sehr hoch** (Startseite, Leistungen, Unternehmen, Footer, jede Leistungsseite) | Selbstbeschreibung |
| System hinter dem Betrieb / Daten an einem Ort | hoch (Startseite, Handwerk, Systeme) | Käufernutzen |
| Eigene Produkte / „Erst bauen. Dann reden." | hoch (Startseite, Produkte ×5, Unternehmen) | Beweis |
| Betrieb statt Übergabe | mittel (`/betrieb`, Leistungsseiten) | Risikoabbau |
| Website | mittel (Preis, 4 Leistungsseiten) | Kaufgegenstand |
| Barrierefreiheit | mittel (eigene Leistung, Insight, Erklärung) | zweites Angebot |
| Zeit/Geld sparen | niedrig (nur Aufwandsrechner, bewusst ohne Zahl) | — |

`[BUSINESS JUDGEMENT]` Die **häufigste** Botschaft ist die Selbstbeschreibung (fünf Ebenen). Die **wirksamste** — das Symptom des Betriebs — steht nur auf zwei Seiten. Die Hierarchie ist firmen-first, nicht käufer-first.

---

# 5 · MARKETING · CHANNELS

## 5.1 Wie findet heute jemand creaDIG?

| Weg | Funktioniert heute? | Evidenz |
|---|---|---|
| **Empfehlung / Nähe / Beziehung** | **ja — historisch der einzige belegte Weg** | 19 Kunden, 12 von 16 Orten im Band Osnabrück–Bielefeld–Münsterland; Canon: Nähe „gestützt" |
| Direktkontakt Owner (TR-Netzwerk, CH-Beziehungen) | ja, historisch | 3 CH-Kunden; TR als Zugangsvorteil |
| Google Markensuche | teilweise | creadig.de wird gefunden — mit veraltetem Titel; Namenskollision mit „CREADIG" (creadig.com) und „CREA Werbeagentur Osnabrück" |
| Google Kategoriesuche | **nein** | „Website für Handwerksbetriebe Osnabrück": Treffer sind Handwerkskammer, Kreishandwerkerschaft, Portale und ein lokaler Mitbewerber mit eigener Osnabrück-Handwerk-Seite. creaDIG nicht |
| LinkedIn | **nein, derzeit nicht aktiv belegt** | Personenprofil + Unternehmensseite existieren; letzter auffindbarer Beitrag 18.05.2023; Aktivität seither `[UNBEKANNT]` |
| Instagram | **nein** | kein auffindbares creaDIG-Konto; bei Suche dominieren fremde „Crea…"-Konten |
| Facebook | unklar | zwei Seiten („Creadig", „Creadig solutions UG \| Lohne") — Pflegezustand `[UNBEKANNT]` |
| Produkte als Einstieg | **nein** | fibero „wird hier nicht verkauft"; meAI/CASSAMEA/meahv mit „Sagen wir Ihnen Bescheid?" |
| Artikel / Insights | **nein** | 1 Beitrag, keine Distribution |

## 5.2 LinkedIn

`[OBJECTIVE]` Es gibt **keine aktive LinkedIn-Strategie**, die sich öffentlich belegen lässt, und die Website verlinkt kein Profil.
`[BUSINESS JUDGEMENT]` Das Profil-Bild nach außen stammt aus der Agenturzeit („digital innovation, brand growth & creative direction", „creaDIG solutions UG") und widerspricht der heutigen Positionierung.

**Würde ein deutscher Mittelständler nach 5 Posts denken „den sollte ich im Kopf behalten"?** — Heute gibt es die 5 Posts nicht. **Das Material dafür gibt es aber:** Die Barrierefreiheits-Selbstprüfung, der fibero-Vorgang („Ein Abbruch vor Ort ist kein Storno"), der Satz „0 von 19 Kunden sind Handwerk" als ehrliche Marktbeobachtung, „Owner-Last messen statt behaupten". Das ist Content, den 100 andere Agenturen **nicht** haben.

## 5.3 Instagram

`[BUSINESS JUDGEMENT]` Für die heutige Situation **kein relevanter Kanal**. Kein Konto auffindbar, kein Material-Fluss dafür, und die Käufer (Inhaber 40+, Mittelstand) entscheiden hier nicht. Instagram würde Owner-Zeit binden, die im Beziehungskanal mehr bringt.

## 5.4 Kanalrollen — aus heutigem Stand

| Kanal | Soll-Rolle | Unterstützt die heutige Architektur das? |
|---|---|---|
| **Persönliche Beziehung** | Hauptkanal Akquise | **ja** — Kundenakte, Beziehungsgrad, `next_touch_at`, Chance ohne Anfrage (G08) |
| **LinkedIn (Person, nicht Firma)** | Erinnerung + Denkweise für bestehende und angrenzende Netzwerke | **nein** — kein Profil verlinkt, kein Publikationsweg, keine Rückmessung |
| **Website** | Beweisort für Gespräche, nicht Leadmaschine | **ja** |
| **Instagram** | keine | — |

`[OBJECTIVE]` Die Architektur ist komplett für **Inbound** gebaut (Formular, Betriebscheck, Rechner, UTM). Der tatsächliche Kundenweg ist **Beziehung**. Es gibt keine Fläche, die das Beziehungsgespräch vorbereitet, außer der Kundenakte.

---

# 6 · MARKETING · CONTENT

## 6.1 Klassifikation

| Inhalt | Typ | Käuferwert |
|---|---|---|
| Insight „Eigene Seite geprüft — acht Mängel" | BUILD IN PUBLIC · PROOF · POINT OF VIEW | **hoch** — ändert den Blick („Overlays reichen nicht"), zeigt Methode |
| `/branchen/handwerk` (sechs Schritte) | EDUCATION · PROBLEM | **hoch** — ein Inhaber erkennt seinen Abend am Küchentisch |
| `/produkte/fibero` | PROOF (Capability) | mittel — stark für Glasfaser/Field-Service, abstrakt für andere |
| `/systeme`, `/betrieb` | POINT OF VIEW · SALES | mittel — richtig für Mid-Market, zu lang für Small Business |
| Leistungsseiten (webdesign, corporate, ki…) | SALES | niedrig — alle mit identischem 4-Schritt-Gerüst „Verstehen · Aufbau · Umsetzung · Betrieb", 308–345 Wörter |
| `/unternehmen`, Karriere | COMPANY | niedrig für Käufer |

## 6.2 Redaktionelle Identität

`[BUSINESS JUDGEMENT]` **Ja, es gibt eine — und sie ist ungewöhnlich stark.** `docs/marketing/build-notes.md` definiert: Situation → was zuerst versucht wurde und nicht trug → Entscheidung → was es gekostet hat → was Regel wurde. Das ist genau das Format, das einen Geschäftsführer etwas lernen lässt und gleichzeitig Kompetenz zeigt.

`[MATURITY GAP]` Das Format ist BUILT, ein Beitrag USED, Distribution 0. Gate 15 misst selbst: *„EIN veröffentlichter Beitrag, fünf von sechs Fächern leer."*

## 6.3 Originalität

| Test | Ergebnis |
|---|---|
| Könnte das von 100 Agenturen kommen? | **Nein** für Build Notes, fibero-Vorgang, Handwerk-Schritte. **Ja** für die vier generischen Leistungsseiten |
| Echte creaDIG-Perspektiven, die heute benutzt werden | Selbstprüfung Barrierefreiheit, Wahrheit statt Behauptung, Integration first |
| Echte Perspektiven, die existieren, aber nicht benutzt werden | fibero-Abrechnungslogik, „Owner-Last messen", „19 Kunden, keiner weiß warum" als Marktbeobachtung, TR-DE als Zugang statt Segment |

## 6.4 Founder-Stimme

`[BUSINESS JUDGEMENT]` Die Seite ist founder-led im **Modell** („dieselbe Hand, die baut, geht danach ans Telefon"), aber **ohne Founder-Stimme im Markt**. Kein Foto im Kontext eines Gesprächs, kein persönlicher Text, kein Kanal. Das Risiko „alles hängt an Muhammed" ist real (F11), aber das **heutige** Problem ist das Gegenteil: Der Owner ist öffentlich unsichtbar, obwohl er der einzige Vertrauensträger ist.

## 6.5 Newsletter / Lead Magnets

`[BUSINESS JUDGEMENT]`
- **Newsletter:** kein System im Repo. **Nicht bauen.** Es gibt keine dauerhafte Erwartung, die man einem Abonnenten versprechen könnte, und keinen Veröffentlichungsrhythmus.
- **Klassische Lead Magnets (PDF, Webinar):** nicht nötig. **Betriebscheck und Aufwandsrechner sind die besseren Assets** — interaktiv, ehrlich, ohne Anmeldung.
- **Aber:** Beide stehen in direkter Konkurrenz zu einem **kostenlosen Digital-Check der Handwerkskammer Osnabrück-Emsland-Grafschaft Bentheim** — mit Beratung vor Ort und Ergebnisbericht, von der Institution, der Handwerker vertrauen. `[OBJECTIVE]` Das ist für die Handwerk-These ein erheblicher Befund: Der eigene Top-of-Funnel-Einstieg hat einen kostenlosen, glaubwürdigeren Wettbewerber — und gleichzeitig einen möglichen Partner.

---

# 7 · MARKETING · FUNNEL

| Stufe | Was es gibt | Stärke | Lücke |
|---|---|---|---|
| **Top** | Betriebscheck (15 Fragen, 2 Min), Aufwandsrechner, Handwerk-Seite, 1 Insight | Inhaltlich gut | **Keine Distribution** — niemand kommt dorthin |
| **Mid** | fibero, `/systeme`, `/betrieb`, Leistungsebenen, Unternehmen | Tief, ehrlich | Kein Fall eines Dritten; Mid-Market fehlt die Antwort „wer ersetzt Sie" |
| **Bottom** | Festpreise, Ablauf, Eigentum, Erstgespräch 20 Min, Systemgespräch 45 Min | Transparent | Kein Kundenfall · keine deutsche Nummer · Impressum mit Platzhaltern · Rechtsform-Widerspruch · Kapazität unbekannt |

## 7.1 Springt creaDIG zu schnell zum Termin?

`[BUSINESS JUDGEMENT]` **Nein, eher umgekehrt.** Fast jede Seite endet mit „Zwanzig Minuten, kostenlos und unverbindlich" — das ist ein weicher, angemessener Schritt. Das Problem ist nicht die Stufenhöhe, sondern dass zwischen „interessant" und „Gespräch" **kein Vertrauensanker eines Dritten** liegt.

## 7.2 Bottom-Funnel · was Risiko herausnimmt — und was fehlt

| Risiko des Käufers | Heute beantwortet? |
|---|---|
| Scope | ja — Festpreis, Systemgespräch schneidet Umfang |
| Preis | ja für Website, nein für drei Ebenen |
| Prozess | ja — verstehen, bauen, betreiben |
| Eigentum / Lock-in | **ja, stark** — „Code, Inhalte, Zugänge und Domain bleiben bei Ihnen" |
| **Proof** | **nein** — `/arbeiten` leer |
| **Kapazität** | **nein** — Hauptbuch F11 „unbekannt" |
| **Ausfall des Inhabers** | **widersprüchlich** — Seite: „Ein kleines Kernteam … Groß genug, dass ein Urlaub kein Projekt anhält." Hauptbuch F11: *Vertretung unbekannt*; Gate 36: *Rollen — keine Rolle besetzt* |
| **Wer ist Vertragspartner** | **widersprüchlich** — Impressum „Einzelunternehmen", öffentliches Register: aktive **creaDIG solutions UG (haftungsbeschränkt)**, Sitz Diepholz, HRB 211887 AG Walsrode, Stammkapital 200 € |
| Erreichbarkeit | **schwach** — nur +41-Mobilnummer, als „Platzhalter" gekennzeichnet |

`[OBJECTIVE]` Die Kernteam-Aussage auf `/unternehmen` ist mit dem eigenen Hauptbuch nicht gedeckt. Das ist genau die Art Behauptung, die die Wahrheitsdisziplin sonst verhindert.
`[OBJECTIVE]` Welche Rechtsperson Verträge schließt, ist **[UNBEKANNT]** — aber ein Käufer, der Creditreform öffnet, sieht eine andere Firma als im Impressum.

## 7.3 Marketing → Sales Handoff

| Kontext | Wird erhalten? |
|---|---|
| Formular-Herkunft (`kontakt`, `termin`, `kurzcheck`, `betriebscheck`) | **ja** |
| Betriebscheck-Ergebnis (Score, Engpass, offene Stellen) | **ja** — reist mit der Anfrage |
| Geprüfte Website-Adresse (Kurzcheck) | **ja** |
| UTM | technisch ja — **aber es gibt keine Kampagnen, die UTM setzen** |
| Einstiegsseite / Referrer / zuletzt gesehenes Produkt | **nein** |
| Beziehungskontext (wer hat empfohlen) | nur manuell |

`[MATURITY GAP]` Der Handoff ist für Inbound gut gebaut. Für den tatsächlichen Hauptweg (Empfehlung) gibt es keine strukturierte Erfassung „wer hat vermittelt".

## 7.4 Messung

| Sinnvolle Zahl | Heute messbar? |
|---|---|
| Qualifizierter Traffic / Besuche | **nein** — Vercel Web Analytics für das Projekt nicht gefunden |
| Betriebscheck gestartet / abgeschlossen | Events im Code (`audit_started`, `audit_completed`) — **nicht auswertbar** |
| CTA-Klicks, Buchungsschritte | Events im Code — **nicht auswertbar** |
| Kontaktabsicht → Anfrage | Anfragen ja (Postfach + DB) |
| Echte Gespräche | nur wenn als Aktivität eingetragen |
| Beziehungssignale | nur manuell |

`[OBJECTIVE]` Messung ist BUILT, nicht OPERATIONAL. Zusätzlich ist sie consent-gegatet (nur wer Statistik zustimmt).
`[ANNAHME]` Das Projekt läuft auf dem Vercel-Hobby-Tarif (Commit `7e060b5`: „Hobby erlaubt nur einen Lauf"). Benutzerdefinierte Events sind nach Vercels Tarifstruktur an Pro gebunden — dann würden `lead_submitted`, `cta_click` usw. auch nach Aktivierung nicht erfasst. Prüfen, bevor weitere Messung gebaut wird.

## 7.5 Cadence & Nachhaltigkeit

`[OBJECTIVE]` Es ist **keine** Veröffentlichungsfrequenz definiert, die gelebt wird. Das Build-Notes-Dokument verlangt für jeden Beitrag fünf belegte Teile und vier Sprachen (`190 Zeilen viersprachiges TypeScript`, Gate 15).
`[BUSINESS JUDGEMENT]` **Der Veröffentlichungsweg ist für einen Ein-Personen-Betrieb zu schwer.** Ein Beitrag, der viersprachig im Code gepflegt und durch ein Gate geprüft werden muss, wird nicht alle zwei Wochen erscheinen. LinkedIn braucht einen Text, keinen Deploy.

## 7.6 Marketing Root Question

| Rang | Ursache | Warum |
|---|---|---|
| **1** | **DISTRIBUTION PROBLEM** | Kein Kanal, keine Veröffentlichung, keine Messung — auch guter Content erreicht niemanden |
| **2** | **OWNER EXECUTION PROBLEM** | Material und Format existieren; es fehlt die Stunde, sie zu veröffentlichen |
| **3** | **PROOF PROBLEM** | Kein Dritter bestätigt irgendetwas öffentlich |
| **4** | **POSITIONING PROBLEM (am Erstkontakt)** | Innenmodell stark, Außenwort schwach, Handwerk-These unbelegt |
| 5 | CONSISTENCY PROBLEM | Außenbild (Google/LinkedIn/Register) passt nicht zum heutigen Selbstbild |
| — | CONTENT PROBLEM | **kein Hauptproblem** — die Qualität ist überdurchschnittlich |
| — | AUDIENCE PROBLEM | kein Hauptproblem — für Small Business sind Einstiege da |

---

# 8 · MARKETING · SCORECARD

| Dimension | Score | Begründung |
|---|:--:|---|
| Positioning | **5** | Starkes Innenmodell, schwache H1, Kategorie erklärungsbedürftig |
| Audience Fit | **4** | Handwerk-Fokus gegen eigene Daten; drei Größenangaben |
| Message Clarity | **5** | Subline und Handwerk-Seite klar; Selbstbeschreibung dominiert |
| Content Quality | **7** | Die wenigen echten Inhalte sind gut |
| Content Originality | **8** | Build Notes, fibero-Vorgang, Selbstprüfung — selten im Markt |
| Distribution | **1** | Kein aktiver Kanal belegt |
| Consistency | **2** | 1 Beitrag in 3 Wochen; letzter LinkedIn-Beitrag 2023 |
| Proof Integration | **3** | Eigenprodukte als Fähigkeit, kein Drittbeleg |
| Founder Leverage | **2** | Owner ist das Vertrauensasset und öffentlich unsichtbar |
| Channel Strategy | **1** | Keine definierte Kanalrolle, kein verlinktes Profil |
| Demand Creation | **1** | Nichts erzeugt heute Nachfrage außerhalb des Netzwerks |
| Mid-Funnel | **6** | Tief und ehrlich, aber ohne Drittbeleg |
| Bottom-Funnel | **4** | Preise/Eigentum stark; Nummer, Impressum, Rechtsform, Kapazität schwach |
| Measurement | **1** | Plattformseitig nicht aktiv |
| Operational Sustainability | **3** | Veröffentlichung zu aufwendig für Owner-Kapazität |
| **Durchschnitt** | **3,5** | Gute Substanz, keine Marktbewegung |

---

# 9 · SALES · CURRENT REALITY

Nur belegte Zahlen. Wo nichts belegt ist, steht es so da.

| Größe | Wert | Quelle / Grenze |
|---|---|---|
| Echte aktive Anfragen über die Website | **0 belegt** | Hauptbuch F03/F04; Inbox wurde mehrfach von Testleads bereinigt (Commits `7377ebd`, `6bad3d4`, `aeb5353`) |
| Organisationen | **32** | Produktion, 09.09. |
| davon historische Kunden | **19** („belegte Geschäftsbeziehung — ob heute aktiv, weiß niemand") | `lib/vertrieb-bestand.ts` |
| Kontakte | **15** | Produktion, 09.09. |
| Beziehungsgrad im Import | 3 Kontakte: 2× „unbekannt", 1× „warm" | Bestandsdatei |
| Verkaufschancen | **2** — unverändert über G12 | Commit `e922834` |
| Laufende Gespräche | **[UNBEKANNT]** — Hauptbuch F04: „Owner bestätigt, ob echte Vorgänge im System laufen · Nutzungswahrheit unbekannt" |
| Angebote im System | **[UNBEKANNT]**, Lieferkette „nie benutzt" laut Hauptbuch F05 | |
| Gewonnen / Verloren im System | **0 / 0 belegt** | Canon: „nach dem gesamten Probelauf 0 verlorene Vorgänge" |
| Recherchefälle | **3** (Osnadach, Volmer, BECHER), `contact_decision` bei allen **NULL** | G12 |
| Reale Kundenarbeit **außerhalb** des Systems | Vegitat (laufend), maqam (laufend), NV SWISS (Freigabe offen) | Hauptbuch, Arbeitsverzeichnisse |

`[OBJECTIVE]` **Das CRM ist SALES-BUILT, nicht SALES-USED.** Die realen Geschäftsvorgänge laufen im Kopf, im Postfach und in Nebensystemen.

## 9.1 Woher kamen historische Kunden?

`market-canon.md` §1, aus dem eigenen Bestand:

- **12 Branchen** bei 19 Kunden, keine kommt dreimal unabhängig vor
- **0** Handwerksbetriebe
- **5×** Osnabrück, **12 von 16** bekannten Orten im Band Osnabrück–Bielefeld–Münsterland–Oldenburger Münsterland
- **3** Schweiz
- Erfasste Betriebszustände: **0 von 19**

`[BUSINESS JUDGEMENT]` Historischer Akquisekanal: **Nähe + Beziehung (vermutlich inkl. TR-Netzwerk)**. Künftiger Wunschkanal laut Website: **Inbound aus einer Branche (Handwerk)**. Diese beiden sind **nicht derselbe Kanal** — und das ist die wichtigste Sales-Diagnose dieses Audits. creaDIG versucht, mit einem Motor zu wachsen, den es noch nie hatte, während der Motor, der funktioniert hat, im Bestand ruht.

---

# 10 · SALES · TARGETING / PROSPECTING

## 10.1 Weiß der Owner morgen, wen er suchen soll?

| Ebene | Konkret genug? |
|---|---|
| Dokument-ICP (Handwerk 6–20 / 5–50) | nein — widerlegt/ungeprüft |
| **Beobachtbare Signale** (`market-canon.md` §2) | **ja, sehr gut** — mehrere Standorte, Außendienst, WhatsApp als Hauptkontakt, Stellenanzeige nennt drei Werkzeuge, Inhaber ist die Verbindung |
| Geografie | ja im Canon (das Band), nein auf der Website (DACH) |
| Zugang | ja — Deckungsregel: nur bestehender Weg oder öffentlicher Anlass |

`[MATURITY GAP]` Das Targeting-Modell ist besser als bei den meisten KMU-Dienstleistern. **Es wurde auf drei Betriebe angewendet.**

## 10.2 Prospect Pool

| Kriterium | Befund |
|---|---|
| Anzahl | 32 Organisationen — für einen wiederholbaren Motor **zu klein**, für die ersten 90 Tage **ausreichend** |
| Qualität | unbekannt — 18/19 ohne Betriebszustand |
| Quelle | ausschließlich Owner-Gedächtnis (bewusst, keine Suchmaschine) |
| Beziehungsgrad | fast durchgehend „unbekannt" |
| Pain Signal | bei 3 Recherchefällen belegt, sonst nicht erfasst |
| Nächste Aktion | **[UNBEKANNT]** je Datensatz |

`[OBJECTIVE]` **Der wertvollste Teil des Pools sind die 19 Altkunden** — sie haben schon einmal gekauft, liegen im belegten Band und sind nach der eigenen Deckungsregel **ohne Anlass ansprechbar** („Bestandskunde"). Im System ist bei keinem ein Gespräch belegt.

## 10.3 Relationship / Warm / Referral / Inbound / Outbound

| Motor | Realistisch für creaDIG heute? | Begründung |
|---|---|---|
| **Warm Network / Bestandskunden** | **am realistischsten** | belegt, regelkonform, ohne Budget, passt zu Owner-Stärke |
| **Referral** | hoch, **als Folge von Warm** | nur wer gesprochen wird, empfiehlt |
| **Partnerschaft** | mittel | Handwerkskammer (eigener Digital-Check), iuk-Netzwerk im selben Gebäude, Steuerberater — **kein einziger Partnerkontakt belegt** |
| Inbound | niedrig kurzfristig | keine Distribution, keine Messung |
| Content-led | mittel langfristig | gutes Material, kein Kanal |
| Targeted Outbound | **nur anlassbasiert** | Grundregel „keine Kaltakquise" + Deckungsregel; Recherche-Modul existiert genau dafür |

## 10.4 Outbound

`[OBJECTIVE]` Eine Strategie „warum dieses Unternehmen, welcher Anlass, welche Person" **existiert als System** (`research_cases`, `research_evidence`, `ansprachedeckung()`), mit genau einer menschlichen Schreibstelle. **Genutzt: 3 Fälle, 0 Entscheidungen.**
`[BUSINESS JUDGEMENT]` Richtig so, dass es keine Massen-Ansprache gibt. Aber: Ein Recherche-Workflow mit sieben Zuständen für einen Betrieb, den man dann **nicht** anspricht, ist für die heutige Phase zu schwer. Der Hebel liegt in den 19, die man ohne Recherche anrufen darf.

## 10.5 Sales Message — Erstkontakt in 20–40 Sekunden

`[OBJECTIVE]` Es gibt **keinen dokumentierten Erstkontakt-Satz** für den Hauptweg (Bestandskunde / Beziehung). `sales-playbook.ts` hat `ENTRY_INTENT` für **eingehende** Anfragen, nicht für ausgehende Gespräche.
`[BUSINESS JUDGEMENT]` Die Website-Sprache ist für ein Gespräch **zu abstrakt** („System-Haus", „fünf Ebenen"). Die Handwerk-Seite enthält die gesprächstaugliche Sprache bereits: *„Wie viele Werkzeuge liegen bei Ihnen zwischen Anfrage und Rechnung?"*

---

# 11 · SALES · DISCOVERY / QUALIFICATION

## 11.1 20-Minuten-Erstgespräch

`[MATURITY GAP]` `discovery-questions.md` (Alltag · Bruch · Zahlen · Entscheidung) deckt Pain, Fit, Urgency und Decision Context ab. **Nie in einem belegten Gespräch benutzt.**
Fehlend für die 20 Minuten: eine **explizite Nächster-Schritt-Regel** („am Ende steht entweder ein Systemgespräch mit Termin, eine Wiedervorlage mit Datum oder ein freundliches Nein").

## 11.2 45-Minuten-Systemgespräch

| Frage | Beantwortet? |
|---|---|
| Wann? | ja — „Vorhaben mit mehreren Abläufen, Rollen oder vorhandenen Programmen" |
| Für wen? | ja |
| Ziel? | ja — „danach steht ein Umfang, aus dem ein Festpreis wird" |
| Qualifikation oder kostenlose Beratung? | **Risiko** |

`[BUSINESS JUDGEMENT]` 20 + 45 Minuten **kostenlos** plus Scoping plus Festpreisangebot ergibt für einen Ein-Personen-Betrieb leicht **3–5 Stunden unbezahlte Arbeit pro Chance** `[ANNAHME]`. Heute unkritisch (keine Volumenprobleme). Kritisch wird es ab 3 parallelen Systemgesprächen. Es gibt keine Regel, **wann** aus dem Systemgespräch ein **bezahltes** Analyse-Paket wird.

## 11.3 Qualifikationsstufen

| Stufe | Kriterium definiert? |
|---|---|
| NO FIT | ja (Ausschlüsse im Market-Canon) |
| NUR BEZIEHUNG | ja (Beziehung ≠ Chance) |
| PROSPECT | ja (Lifecycle) |
| QUALIFIED | teilweise — die fünf Treiber gelten **nur auf dem Systemweg** |
| OPPORTUNITY | ja — Mensch entscheidet |

`[BUSINESS JUDGEMENT]` Fehlende Fragen: **„Wer entscheidet außer Ihnen?"** und **„Bis wann muss es laufen, und warum dann?"** — Timing und Entscheidungsrolle fehlen im Canon, und das sind bei kleinen Betrieben die zwei häufigsten stillen Abbruchgründe.

## 11.4 Opportunity Creation & Quality

`[OBJECTIVE]` Schwelle: Mensch entscheidet, zwei Wege (aus Anfrage, aus Organisation). **Sinnvoll** — weder Fake-Pipeline noch fehlende Sichtbarkeit.
Mindestinhalt einer Chance heute: Titel, Organisation/Kontakt, Status, nächster Schritt. `estimated_value` bewusst `NULL`. Keine BANT-Bürokratie — **richtig so**.

---

# 12 · SALES · PIPELINE / FOLLOW-UP

## 12.1 Stufen

Schema: `new · contacted · qualified · discovery · audit · proposal · negotiation · won · lost`

`[BUSINESS JUDGEMENT]` **Gemischt.** `contacted` ist interne Aktivität; `qualified`, `proposal`, `won` sind Kundenzustände; `audit` ist ein Produkt (BFSG) und keine Kaufentscheidung. Für heutige Mengen (2 Chancen) unkritisch. Bevor mehr gebaut wird, lohnt eine Stufenfolge an Kundenentscheidungen: *Problem bestätigt → Umfang vereinbart → Angebot erhalten → Zusage/Absage*.

## 12.2 Follow-up

| Frage | Heute |
|---|---|
| Woher weiß der Owner, wen er heute nachfassen muss? | **„Heute"** zeigt Überfällig / Heute fällig / Schritt ohne Termin / Ohne Schritt / Kontaktpflege fällig |
| Regeln | „Ein laufender Vorgang ohne nächsten Schritt ist Schuld" |
| Kadenz | **nicht definiert** (kein Standard „Tag 3 / 7 / 14") |
| warm / cool / waiting / no response / later / lost | teilweise: `zurückgestellt`, Beziehungsgrad, `LOST_REASONS` inkl. „Keine Rückmeldung", „Zeitpunkt passt nicht" |

`[MATURITY GAP]` Das Follow-up-**Werkzeug** ist gut. Es gibt nichts nachzufassen, weil keine Gespräche eingetragen sind.

## 12.3 Lost Analysis

`[OBJECTIVE]` Kategorien existieren (7 + Freitext). **0 verlorene Vorgänge belegt.** Keine Lost-Analyse möglich — und nicht künstlich herbeiführen.

---

# 13 · SALES · PROPOSAL / CLOSE

## 13.1 Angebotsprozess

| Element (`proposal-outline.md`) | Vorhanden |
|---|---|
| Ausgangslage in den Worten des Kunden | ja |
| Was wir verstanden haben / was wir bauen / Architektur | ja |
| Zeit · Preis · Betrieb danach | ja |
| **Was wir nicht versprechen** | ja — stark |
| Nächster Schritt | ja |
| Im System: Entwurf → Versand → Annahme | ja (`AngebotMappe`) |

`[BUSINESS JUDGEMENT]` Das Angebotsschema passt zur System-Haus-Positionierung und ist **keine Agentur-Leistungsliste**. Das ist eine echte Stärke. `[MATURITY GAP]` Nie benutzt.

## 13.2 Pricing im Verkauf

| Frage | Befund |
|---|---|
| Custom Scope | „Angebot nach Analyse" — **ohne Orientierungsgröße** für Identity, Automation, Intelligence (OD-6) |
| Warum noch keine Zahl? | ehrlich begründet (keine Reihe abgeschlossener Projekte) |
| Schutz vor endloser Discovery | **nicht vorhanden** (siehe 11.2) |
| Value vs. Scope | Aufwandsrechner lässt den Kunden den Wert selbst rechnen — gut |

## 13.3 Einwände

`[OBJECTIVE]` Es gibt **kein Einwand-Dokument** im Repo, und die Website beantwortet die wahrscheinlichsten Einwände kaum:

| Einwand | Website | Gespräch vorbereitet |
|---|---|---|
| „zu teuer" | teils (Aufwandsrechner) | nein |
| „wir haben schon Software" | teils (`/systeme`: Integration first) | nein |
| „unser ITler macht das" | nein | nein |
| „wir brauchen nur eine Website" | ja (Festpreis) | — |
| „wir sind zu klein" | teils („keine Digitalfirma sein müssen") | nein |
| **„ihr seid zu klein" / „was, wenn du ausfällst?"** | **widersprüchlich** (Kernteam-Satz vs. F11) | nein |
| „warum nicht Standardsoftware?" | nein | nein |
| „wie sicher ist das?" | teils (`/systeme`, `/betrieb`) | nein |
| **„mit welcher Firma schließe ich den Vertrag?"** | **widersprüchlich** (Einzelunternehmen vs. UG) | nein |

## 13.4 Vertrauen für 10k / 20k / 50k

| Vertrauensart | 10k | 20k | 50k |
|---|---|---|---|
| MARKET PROOF (Fall eines Dritten) | fehlt | **fehlt — Blocker** | **fehlt — Blocker** |
| DELIVERY PROOF (Lieferung im Griff) | fibero als Eigenbeleg | fehlt | fehlt |
| OWNER TRUST | stark im Gespräch, unsichtbar davor | mittel | schwach |
| PROCESS TRUST | stark (Festpreis, Eigentum, „was wir nicht versprechen") | stark | mittel |
| TECHNICAL TRUST | stark (`/systeme`, Betrieb) | stark | mittel |
| FINANCIAL TRUST (Rechtsform, Stabilität, Rechnung) | schwach | **schwach** | **Blocker** — UG mit 200 € Stammkapital im Register, Rechtsform widersprüchlich, Rechnungsstellung gesperrt |

## 13.5 Proof im Verkauf

| Moment | Passender Beleg | Verfügbar |
|---|---|---|
| Erstgespräch | Handwerk-Schritte, Betriebscheck-Ergebnis des Kunden | ja |
| Systemgespräch | fibero-Vorgang als **Fähigkeit** | ja — nicht als Kundenergebnis verkaufen |
| Angebot | ein Lieferfall eines Dritten | **nein** (NV SWISS offen) |
| Nach Abschluss | Messprobe → Wirkung | Uhr nicht gestartet (Migration 014) |

## 13.6 Sales Collateral

`[BUSINESS JUDGEMENT]` **Kein Deck, kein Whitepaper bauen.** Was tatsächlich fehlt, ist schmal:
1. **Ein Case Sheet** — sobald eine Freigabe existiert (Format liegt in `docs/ops/case-format.md`).
2. **Ein Satz zur Rechtsperson, Kapazität und Vertretung** — kein Dokument, eine Owner-Tatsache.
Alles andere existiert als Seite oder Schema.

## 13.7 Velocity & Capacity

| Wartezeit | Ursache | Normal oder systembedingt |
|---|---|---|
| Owner-Freigaben (Nummer, Steuer, NV SWISS, Migration 014) | Owner | **systembedingt** — Wochen statt Minuten |
| Scoping nach Systemgespräch | Owner | normal |
| Proposal | Owner + Steuerstatus | **blockiert** |
| Prospect-Antwort | Kunde | normal |

`[BUSINESS JUDGEMENT]` Sales konkurriert mit: Glasfaser-Betrieb (fibero, eigenes Team + Subunternehmer), Lieferung Vegitat und maqam, Systembau creaDIG, Familie. **Der aktuelle Sales-Prozess ist für diese Kapazität zu breit** (Recherche mit sieben Zuständen, zwei kostenlose Gespräche, vier Sprachen), und gleichzeitig wird die schmalste, wirksamste Tätigkeit — den Bestand anrufen — nicht ausgeführt.

## 13.8 Sales Root Question

| Rang | Ursache |
|---|---|
| **1** | **OWNER EXECUTION PROBLEM** — Gespräche finden nicht belegt statt; Owner-Tatsachen offen |
| **2** | **MARKET PROOF PROBLEM** — kein Drittfall für jede Summe über Website-Größe |
| **3** | **TARGETING PROBLEM** — öffentliche Zielgruppe ≠ belegter Kaufweg |
| **4** | **TRUST PROBLEM (Identität)** — Rechtsform, Nummer, Kapazität, Vertretung |
| 5 | LEAD VOLUME PROBLEM — real, aber **Folge** von 1 und 3 |
| — | QUALIFICATION / FOLLOW-UP / PROPOSAL | **kein Engpass** — gut gebaut, ungenutzt |
| — | CLOSING PROBLEM | nicht beurteilbar — es gab nichts abzuschließen |

---

# 14 · SALES · SCORECARD

| Dimension | Score | Begründung |
|---|:--:|---|
| Prospect Pool | **3** | 32 Organisationen, fast ohne Betriebszustand |
| Targeting | **5** | Signalmodell exzellent, öffentliche Zielgruppe widerspricht Daten |
| Lead Quality | **1** | Keine echten Leads zu beurteilen |
| Relationship Strategy | **4** | Modell da, Nutzung nicht belegt |
| Qualification | **7** | Klarer Canon, Timing/Entscheider fehlen |
| Opportunity Discipline | **8** | Mensch entscheidet, Schritt-Schuld sichtbar |
| Pipeline Clarity | **5** | Stufen mischen Aktivität und Kundenentscheidung |
| Follow-up | **5** | Werkzeug gut, keine Kadenz, keine Nutzung |
| Discovery | **7** | Zehn Fragen, gute Haltung |
| Proposal | **6** | Starkes Schema, nie benutzt, Rechnung gesperrt |
| Pricing Communication | **6** | Transparent für Website, offen für Systeme |
| Objection Handling | **2** | Kein Dokument; zwei Einwände öffentlich widersprüchlich |
| Proof Usage | **3** | Nur Eigenbeleg |
| Closing Readiness | **2** | Rechnungsstellung blockiert, Rechtsperson unklar |
| Sales Capacity | **2** | Owner-Zeit gebunden |
| Repeatability | **1** | Kein wiederholter Ablauf belegt |
| **Durchschnitt** | **4,2** | Hervorragender Prozess ohne Durchlauf |

---

# 15 · ADMIN · OWNER MORNING TEST

*Owner öffnet morgens das Control Center. Was weiß er nach 60 Sekunden?* — geprüft am Code von `/admin` (`lib/attention.ts`), nicht per Anmeldung.

| Frage | Beantwortet „Heute" das? | Wo steht es sonst |
|---|---|---|
| Was braucht heute meine Aufmerksamkeit? | **ja**, für Vertrieb/Beziehung/Betriebsstörung | — |
| Wo ist Geld in Bewegung? | **nein** | Finanzen gesperrt (G18) |
| Wer wartet auf mich? | teilweise (neue Anfrage, überfällig) | Owner-Warteschlange steht im **Dokument** `state.md` |
| Welcher Lead braucht Follow-up? | **ja** | — |
| Welcher Kunde braucht Aktion? | teilweise (Kontaktpflege fällig) | Kundenakte |
| Welches Projekt ist gefährdet? | **nein** — Vegitat/maqam nicht im System | extern |
| Welche Veröffentlichung steht an? | **nein** — kein Marketing-System | — |
| Welche Evidence fehlt? | **nein** | `/admin/beleg` |
| Welche Owner-Facts blockieren? | teilweise („Ihre Entscheidung", aus Materialstand) | `/admin/material` (35 Owner-Texte), `/admin/cockpit`, `state.md` |
| Was kann das System selbst tun? | **nein** | F10 `NOT_STARTED` |

`[OBJECTIVE]` **Bestanden für Vertrieb, nicht bestanden für das Unternehmen.**
`[BUSINESS JUDGEMENT]` Der Morgentest scheitert heute weniger an der Oberfläche als an der Datenlage: Selbst eine perfekte „Heute"-Seite zeigt bei 2 Chancen und ohne eingetragene Gespräche fast nichts. **Der Owner würde weiterhin einen Chat brauchen, um herauszufinden, was wichtig ist** — und genau das passiert heute.

---

# 16 · ADMIN · TODAY / PRIORITIES

## 16.1 Informationsarchitektur

Top-Level: **Heute · Vertrieb · Kunden · System** (+ **Beleg**, **Cockpit** als weitere Einstiege).

| Frage | Befund |
|---|---|
| Liegt jede Funktion dort, wo der Owner sie erwartet? | Vertrieb und Kunden: ja. **Owner-Entscheidungen: nein** — unter „System → Material" versteckt |
| Was ist doppelt? | **Owner-Entscheidungen an fünf Orten:** Heute („Ihre Entscheidung") · `/admin/material` · `/admin/beleg` (Owner-Queue) · `/admin/cockpit` · `docs/final-live-completion/state.md` · zusätzlich `docs/proof-operations/owner-queue.md` |
| Was ist falsch gruppiert? | „Recherche" als eigener Vertriebsreiter für 3 Fälle; „Verlust" als eigener Reiter bei 0 Verlusten |
| Was sollte keine eigene Fläche sein? | Cockpit (rechnet laut eigener Regel nichts), Verlust (bis es Verluste gibt) |

## 16.2 Priority Quality

`[BUSINESS JUDGEMENT]` Die Rangfolge in `attention.ts` ist **geschäftlich richtig** — bis auf eine Stelle: **„Ihre Entscheidung" steht ganz unten** (grau, „wo niemand von außen wartet"). Das stimmt für die meisten Material-Punkte. Es stimmt **nicht** für Steuerstatus, Rufnummer und Kundenfreigabe NV SWISS — dort wartet sehr wohl jemand von außen: jeder Besucher, jeder künftige Rechnungsempfänger, der erste Fall. Diese drei stehen dadurch **in derselben Farbe wie „Fotos ablegen"**.

## 16.3 Actionability

| Fläche | WAS IST LOS · WARUM · WAS TUN · WAS DANACH |
|---|---|
| Heute | 4/4 für Vertrieb |
| Materialstand | 3/4 — viele Punkte haben keinen „Was danach" |
| Beleg-Cockpit | 4/4 — gute Reihenfolge-Logik |
| Cockpit | 2/4 — zeigt, rechnet nicht (bewusst) |
| Hauptbuch (Doku) | 4/4 — **aber nicht in der Oberfläche** |

## 16.4 Decision Fatigue

`[OBJECTIVE]` **35 Owner-Texte** im Materialstand, **5** in der Owner-Warteschlange, zusätzliche Owner-Queue im Beleg-Betrieb. Beispiele aus dem Materialstand, gleichrangig nebeneinander: *„Steuerstatus und Rufnummer freigeben"* · *„Fotos nach public/images/unternehmen/<slot>.jpg"* · *„entscheiden, ob ein Profil gepflegt wird"* · *„zwei Fachartikel als Vertriebsmaterial"*.
`[BUSINESS JUDGEMENT]` Ein Ein-Personen-Betrieb mit 40 offenen Entscheidungen trifft **keine**. Die Liste ist wahr — sie ist nur nicht nach dem sortiert, was Umsatz blockiert.

---

# 17 · ADMIN · SALES / CUSTOMER CONTROL

## 17.1 Entity Clarity

Anfrage · Kontakt · Organisation · Verkaufschance · Kunde · Beziehungsgrad · Recherchefall · Kontaktentscheidung.

`[BUSINESS JUDGEMENT]` Der Canon ist **korrekt und sauber getrennt** — für einen Datenbank-Architekten. Für einen Inhaber, der zwischen zwei Baustellen fünf Minuten hat, sind **acht Begriffe mit vier Achsen und sieben Zuständen** (Contact-Canon) mentale Last. Die UI erklärt jeden Zustand in einem Satz (gut), aber die Anzahl bleibt.

## 17.2 Customer 360

| Bestandteil | In der Kundenakte (`/admin/kunden/[id]`) |
|---|---|
| Stammdaten, Standorte, Kontakte | ja |
| Anfragen, Chancen, Chronik | ja |
| Angebote, Projekte | über die Chance (`/admin/vertrieb/pipeline/[id]`) |
| Rechnungen, Zahlungen | gebaut, **gesperrt** (G18) |
| Beleg / Freigabe | separat (`/admin/beleg`) |
| Beziehung, nächster Schritt | ja |

`[MATURITY GAP]` Der Zusammenhang ist auffindbar. Für die tatsächlichen Kunden (Vegitat, maqam) **leer**, weil sie nicht im System geführt werden.

## 17.3 Sales Admin

Anfrage verstehen → Kontakt → Organisation → Chance bewerten → Follow-up → Angebot → nächster Schritt: **3–4 Klicks, logisch verbunden**. `[OBJECTIVE]` Hier ist das Admin gut.

---

# 18 · ADMIN · MARKETING / PROOF / PRODUCT CONTROL

## 18.1 Marketing Admin

`[OBJECTIVE]` **Existiert nicht.** Hauptbuch F07: `NOT_STARTED`. Insights werden als TypeScript-Einträge gepflegt; es gibt keinen Status „geplant · freigegeben · veröffentlicht · Reaktion".
`[BUSINESS JUDGEMENT]` **Richtig, dass es nicht existiert.** Ein Marketing-Admin ohne Veröffentlichungsgewohnheit wäre die nächste leere Fläche (siehe Kill-List).

## 18.2 Proof Admin (`/admin/beleg`)

| Frage | Befund |
|---|---|
| Handlungsorientiert? | **ja** — „Was fehlt, damit der nächste BEWEIS öffentlich wird?" als Reihenfolge |
| Wichtigste Proof-Aktion heute erkennbar? | **ja** — NV SWISS freigeben / Migration 014 |
| Market / Internal Measured / Asset / AVV / Capacity / Representation getrennt? | **ja** (drei Lanes, nie vermischt) |
| Wird Proof Ops zum eigenen Universum? | **Risiko ja** — eigener Canon, Release-Canon, Measurement-Canon, 28-Tage-Regel, Owner-Queue, Cockpit-Korrektur — für **null** freigegebene Fälle |

## 18.3 Product Admin

`[OBJECTIVE]` Keine eigene Produktfläche. Reife/Nutzung/Blocker verteilt über `lib/produkt.ts`, `produkt-beleg.ts`, Hauptbuch F09, Materialstand.
`[BUSINESS JUDGEMENT]` Für den Verkauf heute **nicht relevant** — kein Produkt ist verkäuflich (Gate 25/36). Nicht bauen.

---

# 19 · ADMIN · FINANCE / BUSINESS VISIBILITY

| Owner-Frage | Heute beantwortbar? |
|---|---|
| Offene Angebote | technisch ja (`offers.state`) — faktisch **[UNBEKANNT]** |
| Gewonnener Wert | nein — 0 belegt |
| Offene / bezahlte Rechnungen | **nein — gesperrt (G18, Steuerstatus)** |
| Kosten, wiederkehrende Verpflichtungen | nein |
| Kapazität | nein — F11 unbekannt |
| Umsatz aus Vegitat / maqam / fibero | nein — außerhalb |

`[OBJECTIVE]` **Der Owner kann aus dem System keine einzige finanzielle Entscheidung treffen.** Das liegt nicht an fehlender Software (Angebot, Rechnung, Zahlung sind gebaut), sondern an einer offenen Steuerfrage und daran, dass reale Umsätze nicht im System liegen.

---

# 20 · ADMIN · SCORECARD

| Dimension | Score | Begründung |
|---|:--:|---|
| Truth | **8** | UNBEKANNT bleibt UNBEKANNT, Testdaten ausgeschlossen — **aber** öffentliche Kernteam-Aussage ungedeckt |
| Actionability | **6** | Heute handlungsorientiert, Material nur Inventur |
| Prioritization | **6** | Richtige Logik, umsatzkritische Owner-Entscheidungen zu weit unten |
| Owner Clarity | **4** | Entscheidungen an fünf Orten |
| Sales Control | **6** | Gut gebaut, wenig Daten |
| Customer Context | **6** | Akte vollständig, reale Kunden fehlen |
| Marketing Control | **0** | Existiert nicht |
| Proof Control | **6** | Klar getrennt, Gefahr eigenes Universum |
| Finance Visibility | **2** | Gesperrt |
| Product Visibility | **3** | Verteilt |
| Decision Support | **5** | Navigator schlägt vor, Owner-Last gemessen |
| Cross-System Integration | **4** | Lieferung und reale Kunden außerhalb |
| Delegation Readiness | **2** | Vertretung unbekannt, Wissen im Kopf und in 80 Dokumenten |
| Continuity | **3** | Owner-Abwesenheitstest nicht bestanden (§20.3) |
| Operational Simplicity | **3** | 17 Admin-Seiten, 36 Gates, ~80 Canon-Dokumente für 2 Chancen |
| **Durchschnitt** | **4,3** | Gute Instrumente ohne Flugbetrieb |

## 20.1 Owner Bottleneck

| Kategorie | Tätigkeiten |
|---|---|
| **MUSS OWNER BLEIBEN** | Beziehungsgespräche · Preis/Angebot/Architektur · Kundenfreigaben einholen · Steuer-/Rechtsform-Entscheidung · Zusagen gegenüber Kunden |
| **KANN SPÄTER DELEGIERT WERDEN** | Recherche von Anlässen · Nachfassen nach Vereinbarung · Materialbeschaffung (Fotos, Logos) · Terminkoordination |
| **SOLLTE DAS SYSTEM VORBEREITEN** | Wochenliste „wen anrufen" aus Bestand + Beziehungsgrad · Gesprächsnotiz-Vorlage mit Discovery-Fragen · Angebotsentwurf aus Gesprächsnotiz |
| **SOLLTE AUTOMATISIERT WERDEN** | Anfrage-Bestätigung (erledigt) · Selbsttest/Alarm (erledigt) · Erinnerung an fällige nächste Schritte (Mail/Push statt Seite öffnen) |

## 20.2 Automation Readiness

| Schritt | Einordnung |
|---|---|
| Kundenansprache, Preis, Zusage | **HIGH RISK / NEVER WITHOUT APPROVAL** |
| Löschlauf Personendaten | **HIGH RISK** (Decision-Pack sagt zu Recht: von Hand) |
| Kontaktentscheidung aus Recherche | **MANUAL BUT SHOULD STAY HUMAN** |
| Nachfass-Erinnerung an den Owner | **SAFE TO EXECUTE AUTOMATICALLY** |
| Gesprächsnotiz → Aktivität + nächster Schritt | **SAFE TO PREPARE AUTOMATICALLY** |
| Materialpunkte, Testlead-Bereinigung | **MANUAL AND REPETITIVE** — hat mehrere Commits gekostet |
| Messprobe fibero | **SAFE TO EXECUTE AUTOMATICALLY** nach Migration 014 |

## 20.3 Owner Absence Test

*Owner ist drei Tage nicht erreichbar. Versteht eine berechtigte Person den Stand?*

| Frage | Ergebnis |
|---|---|
| Welche Kunden offen? | **nein** — Vegitat, maqam außerhalb |
| Welche Chancen? | ja (2) |
| Deadlines, Projekte? | **nein** |
| Veröffentlichungen? | entfällt |
| Blocker? | ja — aber in einem 124-Zeilen-Dokument im Repo, nicht in der Oberfläche |
| Wer hätte Zugang? | **niemand** — ein Passwort (`ADMIN_PASSWORD`), Vertretung „unbekannt" |

`[OBJECTIVE]` **Nicht bestanden.** Und die öffentliche Seite sagt das Gegenteil (Kernteam-Satz).

## 20.4 Admin Root Question

| Rang | Ursache |
|---|---|
| **1** | **TOO MUCH BUILT / TOO LITTLE USED** |
| **2** | **LACK OF REAL DATA** (reale Kunden außerhalb, Gespräche nicht eingetragen) |
| **3** | **INFORMATION FRAGMENTATION** der Owner-Entscheidungen |
| **4** | **LACK OF FINANCIAL CONTROL** (gesperrt, nicht fehlend) |
| 5 | OWNER-ONLY KNOWLEDGE |
| — | WEAK PRIORITIZATION | nur punktuell (Entscheidungen zu weit unten) |
| — | STATUS WITHOUT ACTION | kein Hauptproblem — „Heute" ist handlungsorientiert |

---

# 21 · MARKETING → SALES → ADMIN HANDOFF

| Station | Zustand | Wo Kontext verloren geht |
|---|---|---|
| **Marketing Touch** | **BROKEN** — kein aktiver Kanal | Es gibt keinen Touch, der Kontext tragen könnte |
| **Website** | OPERATIONAL | Einstiegsseite/Referrer werden nicht gespeichert |
| **Interesse** (Betriebscheck/Rechner) | OPERATIONAL | Rechner-Zahlen bleiben bewusst im Browser; Betriebscheck reist nur mit, wenn ein Formular folgt |
| **Anfrage** | OPERATIONAL, **0 echte** | — gut gebaut |
| **Kontakt / Organisation** | OPERATIONAL | Verknüpfung manuell; Empfehlungsgeber nicht strukturiert |
| **Qualifikation** | BUILT | Treiber nur auf dem Systemweg; Timing/Entscheider fehlen |
| **Verkaufschance** | USED (2) | — |
| **Angebot** | BUILT, nie benutzt | — |
| **Outcome / Rechnung** | **BLOCKED** (Steuerstatus) | Ein Gewinn kann nicht fakturiert werden |
| **Lieferung** | BUILT, **reale Lieferung außerhalb** | Vegitat/maqam: Branch, Excel, Python |
| **Beleg** | BUILT, 0 Freigaben | NV SWISS wartet auf eine Owner-Mail |
| **Owner Control** | OPERATIONAL für Vertrieb | Owner-Entscheidungen fragmentiert, Hauptbuch nur als Dokument |

**Doppelte Eingaben:** Kundenwissen existiert im Owner-Kopf, im Postfach, in Nebensystemen der Lieferprojekte **und** theoretisch im CRM.
**Zu früh Chance:** nein — die Regel verhindert das zuverlässig.
**Nicht nachverfolgt:** Beziehungen. 19 Altkunden ohne belegten Kontakt, ohne `next_touch_at` im Import.

---

# 22 · FULL CUSTOMER ACQUISITION LOOP

| Station | EXIST | WORK | Status |
|---|:--:|:--:|---|
| Content / Relationship | teils | **nein** | Content: 1 Beitrag, keine Distribution · Beziehung: nicht aktiviert |
| → Besuch | ja | **UNKNOWN** | keine Messung |
| → Interesse | ja | **UNKNOWN** | Events nicht auswertbar |
| → Gespräch | ja (20/45 Min) | **UNKNOWN** | nicht im System belegt |
| → Qualifikation | ja | NOT USED | |
| → Angebot | ja | NOT USED | |
| → Win | ja | NOT USED | |
| → Rechnung | ja | **BROKEN** | G18 |
| → Delivery | ja | **NOT USED** | reale Lieferung außerhalb |
| → Proof | ja | NOT USED | 0 Freigaben |
| → neuer Content | ja (Build Notes) | NOT USED | |
| → Referral | nein | — | kein Mechanismus, keine Frage im Prozess |

`[OBJECTIVE]` Der Kreislauf ist **vollständig gebaut und an keiner einzigen Station belegt durchlaufen** (Gate 36: `durchlauf().belegt = null`).

## 22.1 Feedback Loops

| Loop | Existiert? |
|---|---|
| Sales → Marketing (Einwand wird Content) | **nein** — keine Gespräche, kein Einwand-Register |
| Marketing → Sales (Content zeigt Intent) | **nein** — keine Messung |
| Delivery → Marketing (neuer Beleg) | konzeptionell ja, **real nein** |
| Alles → Admin | teilweise über Hauptbuch-Dokument |

## 22.2 Proof Loop

Delivery → Evidence → Permission → Proof → Marketing → Sales.
`[OBJECTIVE]` **Konzeptionell vollständig**, mit Release-Guards, die falsche Behauptungen verhindern. **Substanz fehlt an zwei Stellen:** (1) reale Lieferungen liegen außerhalb des Systems, (2) die eine vorbereitete Freigabe ist nicht versendet.

## 22.3 Relationship Loop

`[BUSINESS JUDGEMENT]` Das CRM ist **nicht zu opportunity-zentriert** — Beziehungsgrad, `next_touch`, „Kontaktpflege fällig" auf „Heute", Chance ohne Anfrage (G08) sind da. Es wird nur nicht gefüttert.

## 22.4 Owner Execution Loop — der wichtigste Test

*Wenn der Owner jeden Tag 60–90 Minuten für Wachstum hätte: zeigt das System ihm, was er tun soll?*

`[OBJECTIVE]` **Heute nein.** „Heute" zeigt, was eingetragen ist; eingetragen ist fast nichts. Es gibt keine Fläche, die sagt: *„Diese Woche: fünf Altkunden. Hier sind sie. Hier ist der erste Satz."*
`[BUSINESS JUDGEMENT]` Und genau deshalb braucht der Owner jeden Morgen einen Chat, um herauszufinden, was wichtig ist — und der Chat schlägt dann meistens den nächsten Bau-Lauf vor, weil das die Aufgabe ist, die sich vollständig beschreiben lässt.

---

# 23 · SMALL BUSINESS BUYER

*Handwerk, Praxis, Gastro, Dienstleister · 3–20 Mitarbeiter · Inhaber entscheidet allein*

| | |
|---|---|
| **Wie entdeckt er creaDIG?** | Heute nur über Empfehlung/Bekanntschaft. Google-Kategoriesuche: nein. Handwerkskammer: bietet selbst den Digital-Check |
| **Welche Message zieht?** | Das Symptom: „sechs Schritte, sechs Werkzeuge", „Rechnung am Küchentisch", Festpreis, WhatsApp, Türkisch |
| **Was fehlt?** | Eine deutsche Telefonnummer · ein Betrieb wie seiner als Beispiel · der Name im Kopf, bevor er sucht |
| **Sales Route** | Beziehung → 20-Min-Gespräch → Festpreis-Website oder Betriebscheck → kleines Systemstück |
| **Was erzeugt Vertrauen?** | Persönliche Empfehlung, Nähe, „der geht ans Telefon", Festpreis, Eigentum |
| **Wo verliert creaDIG ihn?** | **Vor dem ersten Kontakt** — er kommt nicht an. Danach: Impressum-Platzhalter, +41 als einzige Nummer, „System-Haus" am Einstieg |

# 24 · MID-MARKET BUYER

*20–250 Mitarbeiter · mehrere Standorte · kaufmännische Leitung, IT-Ansprechpartner, Geschäftsführung*

| | |
|---|---|
| **Wie entdeckt er creaDIG?** | Praktisch nicht. LinkedIn inaktiv, keine Fachbeiträge verteilt, keine Partner |
| **Welche Message zieht?** | Integration first · Betrieb statt Übergabe · Eigentum an Code und Daten · fibero-Vorgang |
| **Was fehlt?** | **Ein Drittfall** · Kapazitätsaussage · Vertretung · eindeutige Rechtsperson · AVV-Nachweise (Hauptbuch-Blocker) |
| **Sales Route** | Empfehlung/Partner → Systemgespräch → bezahlte Analyse → Projekt |
| **Was erzeugt Vertrauen?** | Referenz mit Ansprechpartner, belegte Lieferung, Governance, Stabilität des Anbieters |
| **Wo verliert creaDIG ihn?** | **Bei der Lieferantenprüfung:** Creditreform zeigt eine UG mit 200 € Stammkapital, das Impressum ein Einzelunternehmen, `/arbeiten` ist leer, der Kernteam-Satz ist ungedeckt |

# 25 · LARGE / INTERNATIONAL BUYER

| | |
|---|---|
| **Wie entdeckt er creaDIG?** | Nicht |
| **Welche Message zieht?** | Keine spezifische — EN/AR-Übersetzungen ersetzen keine Enterprise-Ansprache |
| **Was fehlt?** | Organisation, Referenzen, Kapazität, Versicherung, Zertifizierungen, Einkaufstauglichkeit |
| **Sales Route** | Heute keine realistische |
| **Wo verliert creaDIG ihn?** | Am Einkauf |

`[BUSINESS JUDGEMENT]` **Nicht ansprechen.** Die viersprachige Seite und „DACH" signalisieren eine Reichweite, die im Einkaufsprozess sofort zusammenbricht und Vertrauen kostet.

## 25.1 Three Buyer Scorecard

| Kriterium | Small Business | Mid-Market | Large |
|---|:--:|:--:|:--:|
| Discovery likelihood | 2 | 1 | 0 |
| Message relevance | 7 | 6 | 2 |
| Trust | 5 | 3 | 1 |
| Proof | 3 | 2 | 1 |
| Sales-fit | 7 | 5 | 1 |
| Offer clarity | 7 | 4 | 2 |
| Risk confidence | 5 | 2 | 1 |
| Likelihood to talk | **6** (wenn er ankommt) | 3 | 1 |
| Likelihood to buy | 4 | 2 | 0 |

---

# 26 · WHAT THE SYSTEM CAN DO VS WHAT THE BUSINESS ACTUALLY DOES

**Die zentrale Tabelle dieses Audits.**

| Das System kann … | Das Unternehmen tut … | Lücke |
|---|---|---|
| Anfragen zuverlässig empfangen, bestätigen, speichern, alarmieren | **0 echte Anfragen belegt** | Distribution |
| Betriebscheck mit Score an den Vertrieb übergeben | Betriebscheck-Nutzung **nicht messbar** | Messung, Distribution |
| Kampagnen-UTM erfassen | **keine Kampagne** | — |
| Beziehungen mit Grad, letzter Interaktion, nächstem Kontakt führen | 19 Altkunden **ohne belegten Kontakt** | Owner-Zeit |
| Chancen ohne Anfrage anlegen (G08) | **2 Chancen**, unverändert | Gespräche |
| Recherchefälle mit Belegpflicht und Kontaktentscheidung | **3 Fälle, 0 Entscheidungen** | Entscheidung |
| Discovery-Leitfaden, Angebotsschema, Angebotsversand, Annahme | **0 Angebote belegt** | Gespräche |
| Projekt → Material → Änderung → Abnahme → Übergabe | **reale Lieferungen außerhalb** (Vegitat, maqam) | Owner-Entscheidung |
| Rechnung mit Steuer-Snapshot, Zahlung mit Beleg | **gesperrt** | Steuerberater |
| Freigabe-Gates für Kundenfälle | **0 Freigaben**, Entwurf NV SWISS **nicht gesendet** | eine Mail |
| Messreihe mit 28-Tage-Vergleich | **Uhr nicht gestartet** (Migration 014) | eine Freigabe |
| Build Notes mit Belegprüfung | **1 Beitrag**, 21 Tage keiner | Schreiben, Veröffentlichen |
| Prioritätenliste „Heute" | zeigt fast nichts | Daten |
| Owner-Last messen | wird gemessen — während sie durch Bau steigt | — |
| Vier Sprachen, RTL | 0 belegte Anfragen in irgendeiner Sprache | — |
| Karriere-/Talent-Seiten | Vertretung „unbekannt", keine Rolle besetzt | — |

`[OBJECTIVE]` **Fast jede Zeile scheitert nicht an Software, sondern an einem menschlichen Ereignis: einem Gespräch, einer Mail, einer Entscheidung, einem Termin beim Steuerberater.**

---

# 27 · WHAT SHOULD NOT BE SOLVED WITH CODE

| Problem | Warum Software es nicht löst |
|---|---|
| 19 Altkunden wieder ins Gespräch bringen | Beziehung entsteht durch Anruf, nicht durch Datensatz |
| Kundenfreigabe NV SWISS | Ein Kunde muss Ja sagen |
| Steuerstatus & Rechtsform klären | Steuerberater + Owner-Entscheidung |
| Deutsche Rufnummer | 15 Minuten bei einem Telefonanbieter |
| Kapazität und Vertretung benennen | Owner-Tatsache, „zwei Sätze" |
| Handwerk vs. Nähe-Band als Hauptthese | Markttest, keine Architektur |
| Einwände verstehen | Nur aus echten Gesprächen |
| Content-Substanz | Aus eigenem Erleben schreiben |
| Partner (Handwerkskammer, iuk, Steuerberater) | Persönliche Termine |
| LinkedIn-Präsenz | Veröffentlichen, kommentieren, antworten |
| Vegitat ins System holen | Entscheidung, nicht Feature — die Kette existiert |
| Gesprächsqualität | Übung |

---

# 28 · CURRENT BUSINESS BOTTLENECK

## Primary / Secondary / Tertiary

| Rang | Diagnose | Begründung |
|---|---|---|
| **Primary** | **D · Owner-Execution-Problem** | Die Owner-Stunde fließt in Bau statt in Marktkontakt; die freischaltenden Owner-Handlungen sind seit Wochen offen (RC1, RC2) |
| **Secondary** | **C · Proof-Problem** (inkl. Identitätsvertrauen) | Kein Drittfall, widersprüchliche Rechtsperson, Platzhalter, ungedeckte Kernteam-Aussage (RC4) |
| **Tertiary** | **A · Marketing-Distributionsproblem** | Kein Kanal, keine Messung — Folge von D (RC5) |
| nicht primär | B · Salesproblem | Prozess gut gebaut; es fehlen Durchläufe, nicht Regeln |
| nicht primär | E · Admin-Control-Problem | Fragmentierung real, aber nicht die Ursache fehlender Kunden |

Keine Prozentgewichtung — sie wäre nicht begründbar.

## Der eine Engpass

> **Es gibt keinen wiederkehrenden, belegten Marktkontakt des Inhabers.**

Nicht fehlende Leads, nicht fehlende Positionierung, nicht fehlender Proof — diese drei sind **Folgen**. Wer jede Woche mit fünf Menschen aus dem eigenen Bestand spricht, bekommt daraus Probleme in Kundenworten (Content), Einwände (Sales), Empfehlungen (Distribution), eine Freigabe (Proof) und Daten für „Heute" (Admin). Wer das nicht tut, kann die anderen vier nicht lösen — auch nicht mit dem besten System.

---

# 29 · 30 / 60 / 90 DAY REALITY

*Keine Umsatz- oder Leadzahlen ohne Basis. Nur Ereignisse, die zeigen, dass der Motor anläuft.*

## Was als Evidence zählt — und was nicht

| Zählt | Zählt nicht |
|---|---|
| Datiertes Gespräch mit einem echten Betrieb, als Aktivität im System | Commits, Gates, neue Seiten |
| Ein Problem, das der Betrieb **in eigenen Worten** bestätigt hat | Eine Vermutung aus Recherche |
| Eine Chance mit datiertem nächsten Schritt | Ein Kontakt ohne Schritt |
| Ein versendetes Angebot | Ein Angebotsentwurf |
| Eine Empfehlung / Warm Intro | Follower |
| Eine schriftliche Kundenfreigabe | Ein vorbereiteter Freigabetext |
| Eine Veröffentlichung mit einer echten Reaktion | Impressionen |

## 30 Tage — „der Motor dreht"

- Rechtsperson, Steuerstatus und deutsche Rufnummer sind geklärt; das Impressum hat **keinen Platzhalter** mehr
- **≥ 10 datierte Gespräche** mit Altkunden oder warmen Kontakten im System
- **≥ 3** Betriebe haben ein Problem in eigenen Worten bestätigt
- **≥ 1** Chance aus einer Beziehung mit datiertem nächsten Schritt
- NV SWISS hat geantwortet — Ja oder Nein, beides ist Evidence
- **2** Build Notes auf dem persönlichen LinkedIn-Profil veröffentlicht

## 60 Tage — „es wiederholt sich"

- **≥ 2** versendete Angebote über die vorhandene Angebotsmappe
- **≥ 1** Empfehlung oder Warm Intro aus einem der Gespräche
- Erste Einwände aufgeschrieben — mindestens einer wird zu einem Beitrag
- Vegitat entweder im System oder bewusst als externe Ausnahme geführt
- fibero-Messuhr läuft
- Das Hypothesenregister hat **eine** Zeile von „ungeprüft" auf „gestützt" oder „widerlegt" bewegt

## 90 Tage — „ein Fall ist durchgelaufen"

- **1** gewonnener Auftrag im System, **mit gestellter Rechnung**
- **1** freigegebener Kundenfall öffentlich
- `durchlauf().belegt` ist nicht mehr `null`
- Klarheit, ob Gespräche eher aus dem Nähe-Band oder aus Handwerk entstanden sind
- Ein Nachweis, welcher Einstieg (Beziehung, Betriebscheck, LinkedIn) das erste Gespräch ausgelöst hat

---

# 30 · TOP 10 THINGS TO PRESERVE

1. **Wahrheitsdisziplin** — UNBEKANNT bleibt UNBEKANNT, keine Sterne ohne Deckung, keine Kundennamen ohne Freigabe
2. **„Eine Verkaufschance entsteht nur durch einen Menschen"**
3. **Beziehung ≠ Chance, Ansprache braucht Deckung** — schützt die Grundregel „keine Kaltakquise"
4. **Der robuste Lead-Weg** (Mail zuerst, Speicher dazu, Alarm bei Ausfall)
5. **Betriebscheck und Aufwandsrechner** — als Gesprächswerkzeug, nicht als Leadmagnet
6. **Die Handwerk-Sechs-Schritte-Seite** — sie funktioniert für jeden Außendienstbetrieb, nicht nur Handwerk
7. **Transparente Einstiegspreise und das Eigentumsversprechen**
8. **Das Build-Notes-Format** — mit leichterem Veröffentlichungsweg
9. **Das Hypothesenregister im Market-Canon** — es ist ehrlicher als die Website
10. **Das Programm-Hauptbuch** mit BUILD/CUTOVER/LIVE/CLOSURE — und seiner Regel, dass Warten kein Versagen ist

---

# 31 · KILL LIST

*Dinge, die creaDIG nicht weiter tun sollte — jeweils aus einem Befund abgeleitet.*

1. **Weitere Gates und Infrastruktur, bevor ein echter Fall durchgelaufen ist.** Beleg: Hauptbuch „BUILD-Arbeit weitgehend erschöpft", Gate 36 „GEBAUT ist nicht GELAUFEN".
2. **Parallele Bau-Läufe ohne ein Marktereignis als Ziel.** Beleg: 283 Commits, 0 belegte Anfragen, 2→2 Chancen.
3. **Platzhalter auf Live-Rechtsseiten.** Beleg: Impressum 13.09. zweimal „Platzhalter".
4. **Öffentliche Aussagen, die das eigene Hauptbuch nicht deckt.** Beleg: „Ein kleines Kernteam … ein Urlaub hält kein Projekt an" vs. F11/Gate 36.
5. **Handwerk als alleinige öffentliche Hauptthese** — bis ein Handwerksbetrieb gekauft hat. Beleg: 0/19.
6. **Weitere Sprachen und Übersetzungsarbeit.** Beleg: vier Sprachen, 0 belegte Anfragen in irgendeiner.
7. **Messung spezifizieren, die auf der Plattform nicht läuft.** Beleg: Web Analytics not found; `product_view`-Spec.
8. **Neue Owner-Entscheidungslisten anlegen**, statt die bestehenden zusammenzuführen. Beleg: fünf Orte, 40 Punkte.
9. **Recruiting-Flächen ausbauen** vor wiederholbarem Kundenfluss. Beleg: zwei Karriere-Rollen, Talent Pool, „Team wächst" — bei ungeklärter Vertretung.
10. **Marketing OS / Newsletter / Kampagnenmodul bauen.** Beleg: F07 `NOT_STARTED` ist richtig; es fehlt Veröffentlichung, nicht Software.

---

# 32 · LEVERAGE MATRIX

## HIGH BUSINESS IMPACT / LOW COMPLEXITY

- Deutsche Rufnummer eintragen
- Steuerstatus + Rechtsperson mit dem Steuerberater klären → Impressum ohne Platzhalter → Rechnung entsperrt
- Freigabe-Mail an NV SWISS senden (Entwurf existiert)
- Kernteam-Satz auf den tatsächlichen Stand bringen
- Vercel Web Analytics im Dashboard aktivieren (und Tarif-Grenze für Events prüfen)
- LinkedIn-Personenprofil auf die heutige Positionierung umschreiben und auf der Website verlinken

## HIGH BUSINESS IMPACT / HIGH COMPLEXITY

- Ersten freigegebenen Kundenfall veröffentlichen (Kunde, Material, Formulierung)
- Vegitat in die vorhandene Lieferkette holen
- Erstes BFSG-Audit verkaufen und liefern (Haftung, Vertrag, Kapazität)

## REAL-WORLD ACTION REQUIRED

- **10 Gespräche mit Altkunden / warmen Kontakten**, jedes als Aktivität eingetragen
- Termin bei der Handwerkskammer Osnabrück (Digital-Check-Programm) — als möglicher Partner statt Konkurrent
- iuk-Netzwerk im selben Gebäude
- Alle zwei Wochen eine Build Note als LinkedIn-Text

## OWNER DECISION REQUIRED

- Nähe-Band oder Handwerk als Hauptthese für die nächsten 60 Tage
- Kapazität (eine Zahl mit Zeitraum) und Vertretung (eine reale Person/Funktion)
- Vegitat: im System oder externe Ausnahme
- Migration 014 freigeben
- Welche Rechtsperson Verträge schließt

## SYSTEM ALREADY GOOD — JUST USE IT

- **Kundenakte + Beziehungsgrad + `next_touch_at`** für die 19 Altkunden
- **„Chance für Organisation anlegen" (G08)** nach jedem Gespräch mit Bedarf
- **„Heute"** als tägliche Nachfassliste
- **Discovery-Fragen** als Gesprächsleitfaden
- **Angebotsschema + AngebotMappe** für das erste Angebot
- **Betriebscheck** als Vorbereitung, die man vor einem Termin schickt
- **Aufwandsrechner** gemeinsam im Gespräch ausfüllen
- **Beleg-Cockpit** für die NV-SWISS-Freigabe
- **LOST_REASONS** beim ersten Nein

## NOT WORTH BUILDING

- Marketing OS, Kampagnen- oder Newsletter-Modul
- Lead Scoring
- Automatisierung (F10) vor einem echten Arbeitszyklus
- Weitere Cockpits oder Dashboards
- Viewport-Events (`product_view`, `case_view`, `pricing_view`)
- Weitere Sprachfassungen
- Produkt-Admin

---

# 33 · FINAL DEVELOPMENT PRIORITIES

*Maximal fünf. Keine davon ist primär Software.*

| # | Priorität | Art |
|---|---|---|
| **1** | **Wöchentlicher Beziehungsblock** — feste 90 Minuten, Bestand zuerst, jedes Gespräch im System | Owner-Routine |
| **2** | **Identität und Erreichbarkeit wahr machen** — Rechtsperson, Steuerstatus, Rufnummer, Kernteam-Satz | Owner + Steuerberater |
| **3** | **Ersten Beleg eines Dritten freischalten** — NV SWISS anfragen, Vegitat entscheiden | Owner + Kunde |
| **4** | **Eine Markthypothese für 60 Tage festlegen** — und die öffentliche Fläche daran ausrichten, nicht umgekehrt | Owner-Entscheidung |
| **5** | **Minimaler Veröffentlichungsweg** — Build Note als LinkedIn-Text, ohne Deploy, alle zwei Wochen | Owner-Routine |

---

# 34 · THE ONE THING

> **Wenn creaDIG in den nächsten 30 Tagen nur eine Sache ernsthaft löst:**
> **Der Inhaber führt jede Woche belegte Gespräche mit Menschen aus dem eigenen Bestand.**

**Warum genau das und nicht Market Proof:** Ein freigegebener Fall ohne Gespräche verkauft nichts, und die Freigabe selbst ist eine einzige Mail. **Warum nicht Distribution:** Ohne Gespräche gibt es nichts Neues zu erzählen, und LinkedIn ohne Beziehung ist Lärm. **Warum nicht Positionierung:** Die richtige Außensprache findet man in den Worten der Kunden, nicht in einer weiteren Kategorie-Formulierung (Gate 01–03). **Warum es die anderen löst:** Aus Gesprächen entstehen Probleme in Kundenworten, Einwände, Empfehlungen, eine Freigabe-Chance und die ersten echten Zeilen in „Heute".

**Und es passt zu allem, was creaDIG schon entschieden hat:** keine Kaltakquise, Beziehung vor Chance, Nähe als gestützte Hypothese, Mensch entscheidet.

---

# 35 · FIRST REAL ACTION

> **Diese Woche die fünf Altkunden aus dem Bestand anrufen, die dem Inhaber persönlich am nächsten sind — mit einer einzigen Frage: „Was hat sich bei Ihnen im Betrieb verändert, seit wir damals zusammengearbeitet haben?" — und jedes Gespräch noch am selben Tag als Aktivität mit nächstem Schritt in der Kundenakte eintragen.**

Kein Angebot. Keine Präsentation. Kein neuer Lauf.
Fünf Anrufe erzeugen mehr geschäftliche Evidence als der nächste Development-Run — und sie füllen zum ersten Mal das System mit dem, wofür es gebaut wurde.

---

## Quellen

**Öffentlich**
- [creadig.de](https://creadig.de/) — 27 deutsche Seiten + Impressum, gecrawlt am 13.09.2026
- [creaDIG solutions UG — Creditreform-Firmeneintrag](https://firmeneintrag.creditreform.de/49356/2051172884/CREADIG_SOLUTIONS_UG_HAFTUNGSBESCHRAENKT)
- [creaDIG solutions UG — openregister](https://openregister.de/company/DE-HRB-P2716-211887) (Direktabruf 403; Angaben aus Suchergebnis)
- [creaDIG solutions UG — companyhouse](https://www.companyhouse.de/creaDIG-solutions-UG-Diepholz)
- [creaDIG solutions UG — D&B](https://www.dnb.com/business-directory/company-profiles.creadig_solutions_ug_(haftungsbeschr%C3%A4nkt).5078365d051b4596fb28593f16fa1028.html)
- [LinkedIn Unternehmensseite](https://de.linkedin.com/company/creadig) · [LinkedIn Profil Inhaber](https://de.linkedin.com/in/muhammed-emin-akyol-967b8b1aa) · [letzter auffindbarer Beitrag](https://www.linkedin.com/posts/muhammed-emin-akyol-967b8b1aa_creadig-design-digitalexzellenz-activity-7064833303127711744-VN0Z)
- [Facebook „Creadig solutions UG | Lohne"](https://www.facebook.com/creadigsolutions/) · [Facebook „Creadig"](https://www.facebook.com/creadig.28/)
- [CREADIG (creadig.com) — Namenskollision](http://creadig.com/)
- [Handwerkskammer Osnabrück-Emsland-Grafschaft Bentheim — Digital-Check](https://www.hwk-osnabrueck.de/digital-check/) · [Handwerk goes digital](https://www.hwk-osnabrueck.de/handwerk-goes-digital/)
- [Melo Designer — Google Business & SEO für Handwerksbetriebe in Osnabrück](https://melodesigner.de/service/google-business-seo/osnabrueck/handwerk)

**Intern (Repo, Stand 13.09.2026)**
`docs/final-live-completion/state.md` · `docs/sales/market-canon.md` · `docs/sales/sales-operating-engine.md` · `docs/sales/contact-canon.md` · `docs/sales/qualification-canon.md` · `docs/sales/discovery-questions.md` · `docs/sales/proposal-outline.md` · `docs/marketing/build-notes.md` · `docs/ops/analytics-events.md` · `docs/proof-operations/*` · `lib/attention.ts` · `lib/material-status.ts` · `lib/vertrieb-bestand.ts` · `lib/sales-playbook.ts` · `lib/redaktion.ts` · `lib/site-data.ts` · `app/api/lead/route.ts` · `app/(admin)/**` · `scripts/migrations/*.sql` · Commits `e922834` (G12), `1ac6985` (G36), `7e060b5`

**Nicht verfügbar:** Vercel Web Analytics (nicht aktiv) · Datenbank-Direktabfrage (Zugangsdaten maskiert, nicht umgangen) · LinkedIn-/Instagram-Kennzahlen (Login-Wand)
