# creaDIG · Endspurt-Analyse Marketing & Sales

**Stand:** 24.09.2026 · Branch `feat/system-haus-site` @ `27b8ec0` · Admin-OS **LIVE 99 % VERIFIED**
**Frage des Auftraggebers:** Wie weit sind wir? Was kann der Admin am Markt tatsächlich steuern? Und lassen sich LinkedIn und andere Plattformen anbinden?
**Art:** Diagnose und Entscheidungsvorlage. Keine Codeänderung, kein Commit, kein Deploy.

---

## 0 · Grundlage und Grenzen

| Geprüft | Wie |
|---|---|
| 34 Commits seit 13.09. | `git log` |
| Admin-OS-Ledger (72 KB) | `docs/admin-os/state.md`, `cutover.md`, `abnahme.md` |
| Verbindungsmodell | `lib/verbindungen.ts`, `-pruefung.ts`, `-fixture.ts`, `/admin/verbindungen` |
| Öffentliche Seite | Startseite, Impressum, `/arbeiten`, `/insights` erneut abgerufen (24.09.) |
| Plattform-Bedingungen | LinkedIn- und Meta-Entwicklerlage, Stand 2026 (Quellen am Ende) |
| Admin erreichbar | `/admin`, `/admin/login`, `/admin/verbindungen` → HTTP 200 |

**Nicht geprüft:** Anmeldung im Live-Admin (Passworteingabe ausgeschlossen) · Produktionsdatenbank direkt (Zugangsdaten maskiert) · Vercel Web Analytics (am 13.09. „not found", seither kein Beleg für Aktivierung → `[UNBEKANNT]`, 1-Minuten-Prüfung im Dashboard).

---

# 1 · URTEIL

**Das Werkzeug für den einen Engpass ist seit heute live. Der Engpass selbst ist unverändert.**

Am 13.09. war der Befund: *„Es gibt keinen wiederkehrenden, belegten Marktkontakt des Inhabers"* — und das passende Werkzeug fehlte, weil eine Chance nur aus einem Formular entstehen konnte. Genau das ist jetzt gebaut und ausgeliefert: **manuelle Anfrage** (`createEnquiry`), Chance ohne Anfrage, Chronik mit Akteur und Herkunft, Aufmerksamkeitsliste im Berliner Geschäftstag, Drilldown von jeder Zahl auf ihre Zeilen.

Gleichzeitig hat sich **außen in elf Tagen nichts bewegt**:

| Außenwert | 13.09. | 24.09. |
|---|---|---|
| Deutsche Rufnummer | keine | **keine** (`tel:`-Links: 0) |
| Impressum | zwei Platzhalter | **zwei Platzhalter** |
| `/arbeiten` | leer | **leer** (3 Fallstudien im Code, keine Freigabe gedeckt) |
| Insights | 1 Beitrag (23.08.) | **1 Beitrag** — jetzt 32 Tage alt |
| Verlinkte Profile (`socialProfiles`) | 0 | **0** · `sameAs` im JSON-LD: 0 |
| `hreflang` | 0 | **0** |
| Belegte echte Anfrage über die Seite | 0 | **0** |

**Endspurt-Lage in einem Satz:** Die Bau-Seite von Marketing und Sales ist zu Ende. Was jetzt noch fehlt, ist mit **vier Owner-Tatsachen, drei kleinen Brücken und einer Gewohnheit** abgeschlossen — nicht mit einem weiteren Programm.

---

# 2 · WAS SICH SEIT DEM 13.09. GEÄNDERT HAT

## 2.1 Innen: sehr viel, und das Richtige

| Neu | Bedeutung für Vertrieb |
|---|---|
| **Manuelle Anfrage** (`createEnquiry`, `/admin/vertrieb/anfragen/neu`) | Ein Anruf, eine WhatsApp, ein Gespräch auf der Baustelle wird zum Datensatz — **ohne dass jemand ein Formular erfindet.** Das war die Lücke Nr. 1 für Beziehungsverkauf |
| **Chronik mit Akteur und Herkunft** (`HUMAN/SYSTEM/AUTOMATION/INTEGRATION`) | Man sieht, ob ein Mensch oder die Maschine gehandelt hat |
| **Rollen** Owner / Vertrieb / Redaktion, Sitzungswiderruf, Versuchsfenster | Delegierbarkeit vorbereitet (F11 bleibt trotzdem offen: es gibt niemanden) |
| **`/admin/verbindungen`** | Landkarte aller Zugänge, sieben ehrliche Zustände, Fähigkeit ≠ Autorisierung ≠ Adresse |
| **`/admin/automationen`** | Regeln laufen — und ändern per Vertrag **keinen** Geschäftsdatensatz |
| **Freigaben in der Datenbank** (Migration 018) | Kundenerlaubnis erfassbar **und widerrufbar**, ohne Deploy |
| **meAI-Vorschlag „nächster Schritt" mit Belegen** | funktioniert auch ohne KI-Anbieter (Degraded Mode) |
| **Cutover ausgeführt**, Migrationen 015–019 in Produktion, `cutover-live` grün | Der Admin ist **benutzbar**, nicht nur gebaut |

`[OBJECTIVE]` Das ist die erste Runde seit Wochen, in der gebaute Arbeit **genau auf den benannten Engpass** gezielt hat.

## 2.2 Außen: nichts

`[OBJECTIVE]` Kein Marktkontakt, keine Veröffentlichung, keine Owner-Tatsache, keine Freigabe. Die fünf Owner-Punkte aus dem Hauptbuch vom 13.09. sind unverändert offen, die drei aus dem Admin-OS-Ledger ebenfalls — bis auf den Cutover, den der Owner ausgeführt hat.

**Das ist die Fortsetzung desselben Musters, nur auf höherem Niveau:** Die Arbeit, die vollständig beschreibbar ist, wird gemacht. Die Arbeit, die aus einem Anruf oder einer Entscheidung besteht, bleibt liegen.

---

# 3 · WAS DER ADMIN HEUTE AM MARKT STEUERN KANN

Die entscheidende Tabelle für die gestellte Frage. **„Steuern" heißt: im Admin auslösen, ohne Deploy.**

| Marketing-/Vertriebsarbeit | Im Admin steuerbar? | Beleg |
|---|---|---|
| Anfrage aufnehmen, zuordnen, bearbeiten | **JA** | `createEnquiry`, Anfragen-Liste + Detail |
| Kontakt, Organisation, Standort pflegen | **JA** | ADM-03 Kernschleife, live |
| Beziehungsgrad und nächsten Kontakt setzen | **JA** | `contacts.relationship`, `next_touch_at` |
| Verkaufschance anlegen, Stufe, nächster Schritt, Verlustgrund | **JA** | Pipeline, `LOST_REASONS` |
| Tagesliste „wer wartet auf mich" | **JA** | Übersicht (ersetzt Heute + Cockpit) |
| Recherchefall mit Beleg und Kontaktentscheidung | **JA** | `/admin/vertrieb/recherche` |
| Angebot entwerfen, senden, Annahme erfassen | **JA** (Rechnung danach gesperrt) | AngebotMappe |
| **Kundenfreigabe erfassen und widerrufen** | **JA — aber wirkungslos nach außen** | Migration 018, siehe §4.1 |
| Automation ein-/ausschalten, Lauf sehen | **JA** | `/admin/automationen` |
| Verbindungszustand sehen und prüfen | **JA** | `/admin/verbindungen` |
| **Einen Beitrag veröffentlichen** | **NEIN** | Insights sind TypeScript in `lib/insights.ts` → Commit + Deploy |
| **Einen Kundenfall öffentlich schalten** | **NEIN** | öffentliche Projektion liest `lib/site-data.ts` (G18) |
| **Eine Referenz/Logo auf der Seite zeigen** | **NEIN** | dieselbe Datei |
| **Preise, Texte, Claims ändern** | **NEIN** | Code |
| **Auf LinkedIn/Instagram posten** | **NEIN** | kein Adapter, kein OAuth |
| **Reichweite/Reaktionen messen** | **NEIN** | Web Analytics `[UNBEKANNT]`, Plattform-Statistiken nicht angebunden |
| **Kampagne oder Newsletter führen** | **NEIN — und bewusst nicht im Umfang** | ADM-00, „Nicht im Umfang: Kampagnen-/Content-Suite" |

## 3.1 Die ehrliche Zusammenfassung

> **Der Admin steuert heute den Vertrieb vollständig und das Marketing gar nicht.**

Das ist kein Versäumnis des Programms — es war eine bewusste, dokumentierte Abgrenzung (OD-2, eingefrorener Abnahmeumfang). Für die Frage „können wir den Markt mit dem Admin beisteuern" lautet die Antwort:

- **Nachfrage bearbeiten:** ja, sofort, vollständig.
- **Nachfrage erzeugen:** nein — dafür gibt es im Admin keinen einzigen Auslöser.

---

# 4 · DIE DREI BRÜCKEN, DIE ZUM ABSCHLUSS FEHLEN

Nicht drei Programme. Drei kleine, benennbare Verbindungen zwischen dem, was schon existiert.

## 4.1 Brücke 1 · Freigabe → öffentliche Seite (die wichtigste)

`[OBJECTIVE]` Die Migration sagt es selbst, wörtlich:

> *„Sie steuert die oeffentliche Seite noch NICHT. Die Projektion auf creadig.de liest weiterhin `lib/site-data.ts` (G18, gesperrt). Bis diese Bruecke gebaut ist, HAELT diese Tabelle eine Erlaubnis fest und setzt sie nicht durch."*

**Was das praktisch bedeutet:** Im Code liegen **drei fertige Fallstudien** — `nv-swiss`, `maqam`, `bir-damla-hayir`. Sie erscheinen nicht, weil `fallFreigabe()` die nötigen Erlaubnisse nicht gedeckt sieht. Selbst wenn der Owner morgen im Live-Admin die Erlaubnis von NV SWISS erfasst, bleibt `/arbeiten` leer — bis jemand `lib/site-data.ts` anfasst und deployt.

| | |
|---|---|
| **Wirkung** | Der einzige Hebel, mit dem der Admin je Marketing steuern wird. Ohne ihn bleibt jede Freigabe ein Eintrag ohne Folge |
| **Blocker** | G18 — sechs seit Wochen lokal geänderte, nicht committete Dateien (`legal-page.tsx`, `site-data.ts`, `rechnung.ts`, `material-status.ts`, `packages.tsx`, `rechnung-drill.mjs`) |
| **Aufwand** | ~1 Tag, **nachdem** G18 entsperrt ist |
| **Vorbedingung** | Owner gibt die sechs Dateien frei oder verwirft sie |

`[BUSINESS JUDGEMENT]` **G18 ist inzwischen der teuerste offene Punkt im Haus.** Er blockiert gleichzeitig: Impressum (Steuerstatus), Rechnungsstellung, Preisdarstellung, Materialstand und die Beleg-Brücke. Fünf Baustellen, ein Grund.

## 4.2 Brücke 2 · Profile verlinken (eine Stunde)

`[OBJECTIVE]` `socialProfiles: []` → Footer zeigt nichts, JSON-LD hat kein `sameAs`, und im Verbindungsverzeichnis steht LinkedIn auf `NOT_CONFIGURED`, obwohl es ein Profil **und** eine Unternehmensseite gibt.

| Wirkung | Aufwand |
|---|---|
| Google verknüpft Website ↔ LinkedIn-Identität (`sameAs`) — relevant, weil die Suche heute noch das alte Agentur-Bild zeigt | |
| Der Verbindungskarte-Zustand wird von `NOT_CONFIGURED` ehrlich zu `LINK_ONLY` — genau die Ebene, die das Modell dafür vorsieht | ~1 h |
| Ein Besucher kann prüfen, wer dahinter steht | |

**Voraussetzung, die nichts kostet:** Das LinkedIn-Profil muss vorher die heutige Positionierung tragen. Aktuell steht dort das Agenturbild von 2023.

## 4.3 Brücke 3 · Veröffentlichungsregister (ein Tag)

`[OBJECTIVE]` `lib/redaktion.ts` (G15) existiert, wird aber ausschließlich zum **Rendern** eines Artikels benutzt (`components/insight/article-parts.tsx`). Es gibt keine Admin-Fläche, auf der steht: *geschrieben · wo veröffentlicht · was kam zurück*.

`[BUSINESS JUDGEMENT]` Das ist die **einzige** Marketing-Fläche, die der Admin braucht — und sie braucht **keine API**:

| Feld | Woher |
|---|---|
| Was veröffentlicht | von Hand, ein Satz |
| Wo (LinkedIn, Website, Gespräch, Netzwerk) | Auswahl |
| Wann | Datum |
| Was kam zurück (Kommentar, Nachricht, Anruf) | von Hand |
| Verknüpfung zu Kontakt/Organisation | bestehende Chronik (`activities`) |

Damit wird Marketing **messbar ohne Plattform-Statistik** — und zwar an der Zahl, die für creaDIG zählt: *Wie viele Gespräche sind aus einer Veröffentlichung entstanden?* Nicht Impressionen.

---

# 5 · LINKEDIN UND ANDERE PLATTFORMEN — ANBINDBARKEIT

Der Auftrag fragt konkret: *lassen sie sich verknüpfbar machen?* Antwort in drei Teilen: **technisch**, **wirtschaftlich**, **Entscheidung**.

## 5.1 Das Fundament steht bereits

`[MATURITY GAP]` Das Anschlussmodell ist **fertig gebaut und geprüft** (ADM-04):

- Sieben Zustände, die `NOT_CONFIGURED` und `ERROR` bewusst unterscheiden
- Drei Ebenen je Kanal: **Fähigkeit · Autorisierung · Adresse** — ein Profillink zählt nie als Verbindung
- Zustand wird aus Code und Umgebung **abgeleitet**, nicht in einer zweiten Tabelle gepflegt
- Prüfung getrennt von Ableitung, nur auf Auslösung, 8-Sekunden-Grenze, Ergebnis trägt `gemessen` oder `konfiguration`
- Testanbieter-Fixture beweist das Modell (A15–A18), in Produktion hart gesperrt
- Gate `check-verbindungen` im `postbuild`, 58/58 Drill, 46 E2E-Prüfungen

**Das heißt:** Ein echter Anbieter ist kein Umbau mehr. Die Karte, die Zustände, das Gate und die Prüfung existieren. Was fehlt, ist der Adapter — und die Entscheidung, ob er sich lohnt.

## 5.2 LinkedIn — was 2026 tatsächlich geht

| Vorhaben | Zugang | Realität |
|---|---|---|
| **Auf das eigene Profil posten** | Produkt „Share on LinkedIn", Berechtigung `w_member_social` | **Selbstbedienung, keine Prüfung.** App im Developer-Portal anlegen, Produkt hinzufügen, OAuth mit dem eigenen Konto. Rund 100 Aufrufe/Tag. **Token 60 Tage**, Refresh-Token 365 Tage → ohne Refresh-Logik alle zwei Monate neu anmelden |
| **Auf die Unternehmensseite posten** | `w_organization_social`, Community Management API | **Partnerprüfung.** Nur juristische Personen (GmbH/UG/Verein), Verifizierung durch einen Super-Admin der Seite, Angaben zu Firma, Anschrift, Datenschutzerklärung; für die volle Stufe zusätzlich ein Screencast je Anwendungsfall |
| **Reichweite/Reaktionen der eigenen Beiträge lesen** | `r_member_postAnalytics` (Member Post Analytics) | **Nicht selbstbedient** — liegt im Community-Management-Programm. `w_member_social` allein genügt ausdrücklich nicht |
| Profile fremder Personen auslesen | — | ausgeschlossen |

`[OBJECTIVE]` **Posten ja, Messen nein.** Genau die Hälfte, die man für „Steuerung" bräuchte, ist die gesperrte.

**Zwei Nebenwirkungen, die creaDIG betreffen:**
1. Die Unternehmensseiten-Anbindung verlangt eine **juristische Person mit Anschrift und Datenschutzerklärung**. Das trifft auf denselben offenen Punkt wie Impressum und Rechnung: Auf der Website steht „Einzelunternehmen", im Register steht eine aktive **creaDIG solutions UG**. Solange das nicht entschieden ist, ist ein Partnerantrag nicht sauber stellbar.
2. Ein Antrag bindet Owner-Zeit (Formular, Verifizierung, Screencast) — genau die Ressource, die der Engpass ist.

## 5.3 Meta / Instagram

| Voraussetzung | Stand bei creaDIG |
|---|---|
| Instagram-Profikonto | **nicht vorhanden** (kein auffindbares Konto) |
| Verknüpfte Facebook-Seite + Business-Konto | zwei fremd wirkende Seiten auffindbar, Pflegezustand `[UNBEKANNT]` |
| Meta-App + App Review für `instagram_business_basic` **und** `instagram_business_content_publish` | nicht gestellt; je Berechtigung ein eigener Screencast, **2–4 Wochen je Einreichung** |

`[BUSINESS JUDGEMENT]` **Klares Nein für die nächsten 90 Tage.** Wochen Prüfaufwand für einen Kanal ohne Konto, ohne Publikum und ohne Käufer. Die Zielgruppe entscheidet dort nicht.

## 5.4 Die wirtschaftliche Rechnung

| | Eigenes Profil per API | Von Hand posten |
|---|---|---|
| Einmaliger Bau (OAuth, Token-Refresh, Adapter, Gate, Prüfung, DE/TR) | **2–4 Personentage** `[ANNAHME]` | 0 |
| Laufend | Token-Erneuerung, Anbieteränderungen | 0 |
| Zeitersparnis je Beitrag | ~2 Minuten | — |
| Aktuelle Frequenz | **1 Beitrag in 32 Tagen** | |
| Amortisation bei heutiger Frequenz | **rechnerisch nie** | |

`[OBJECTIVE]` Der Engpass beim Veröffentlichen ist **das Schreiben und das Entscheiden**, nicht das Hochladen.

## 5.5 Entscheidung

| Kanal | Jetzt | Wann neu bewerten |
|---|---|---|
| **LinkedIn Profil — Adresse verlinken** (`LINK_ONLY`) | **JA, sofort** (~1 h) | — |
| **LinkedIn Profil — API-Posting** | **NEIN** | Wenn 8+ Beiträge/Monat über 2+ Kanäle laufen und das Kopieren spürbar stört |
| **LinkedIn Unternehmensseite / Community Management** | **NEIN** | Nach Klärung der Rechtsperson **und** wenn die Seite regelmäßig bespielt wird |
| **LinkedIn Post-Statistik** | **NEIN** (nicht selbstbedient) | Messen stattdessen im Veröffentlichungsregister: Gespräche statt Impressionen |
| **Meta / Instagram** | **NEIN** | Frühestens wenn ein Kanal nachweislich Gespräche bringt |
| **WhatsApp / Kalender** | bleibt `LINK_ONLY` | — |
| **E-Mail-Eingang** | bleibt manuell erfasst | Wenn belegt ist, dass Anfragen real über `info@` laufen — dann den vorhandenen meAI-Adapter wiederverwenden, keinen zweiten Mailspeicher |

`[BUSINESS JUDGEMENT]` **Die Architekturentscheidung war richtig, die Bauentscheidung wäre falsch.** Das Verbindungsmodell jetzt zu haben ist wertvoll; es jetzt zu füllen wäre der teuerste Weg, zwei Minuten zu sparen.

---

# 6 · SALES — WAS JETZT MÖGLICH IST UND WAS FEHLT

## 6.1 Die Lücke von 13.09. ist geschlossen

Am 13.09. lautete der Befund: *„19 Altkunden liegen im System, ohne dass eine Aktivität belegt ist"* — und der Grund war teilweise Werkzeug: Ein Gespräch ließ sich nicht erfassen, ohne eine Anfrage zu erfinden.

**Das ist jetzt gelöst.** Der Ablauf, den es ab heute gibt:

| Schritt | Fläche | Zeitaufwand |
|---|---|---|
| 1 · Anruf führen | Telefon | 10–15 Min |
| 2 · Anfrage von Hand erfassen, Quelle `telefon`/`email`/`netzwerk` | `/admin/vertrieb/anfragen/neu` | 1 Min |
| 3 · Kontakt/Organisation verknüpfen, Beziehungsgrad setzen | Kundenakte | 1 Min |
| 4 · Nächsten Kontakt mit Datum setzen | `next_touch_at` | 15 Sek |
| 5 · Bei Bedarf Chance anlegen (ohne Anfrage möglich) | Pipeline | 1 Min |
| 6 · Morgen erscheint es in der Übersicht | automatisch | — |

`[OBJECTIVE]` **Der gesamte Beziehungsverkauf ist ab heute aus dem Admin führbar.** Das war die Antwort auf den einen Engpass — und sie steht seit dem Cutover in Produktion.

## 6.2 Was im Vertrieb noch fehlt

| Lücke | Art | Aufwand |
|---|---|---|
| **Rechnung gesperrt** — ein gewonnener Auftrag kann nicht fakturiert werden | Owner + Steuerberater (G18) | 1 Termin |
| **Timing und Entscheider** fehlen im Qualifizierungskanon | zwei Fragen ergänzen | 15 Min |
| **Kein Einwand-Register** | entsteht aus den ersten zehn Gesprächen | läuft nebenher |
| **Keine Nachfass-Kadenz** (Tag 3 / 7 / 14) | eine Regel, kein Code — `next_action_at` trägt sie bereits | 15 Min |
| **Kein Schutz vor unbezahlter Beratung** — 20 + 45 Minuten kostenlos plus Scoping | Owner-Regel: ab wann wird Analyse bezahlt | Entscheidung |
| **Pipeline-Stufen** mischen Aktivität und Kundenentscheidung (`contacted` vs. `qualified`) | erst nach realer Nutzung ändern | — |
| **Vegitat und maqam laufen außerhalb** | Owner-Entscheidung | 1 Entscheidung |

`[BUSINESS JUDGEMENT]` Keine dieser Lücken rechtfertigt einen weiteren Bau-Lauf. Fünf davon sind Sätze, zwei sind Entscheidungen.

---

# 7 · DIE ENDSPURT-LISTE

**Vier Owner-Tatsachen · drei Brücken · eine Gewohnheit.** Mehr ist es nicht.

## 7.1 Owner-Tatsachen — ohne Code, blockieren alles andere

| # | Tatsache | Schaltet frei | Zeit |
|---|---|---|---|
| **O-1** | **G18 entsperren** — die sechs lokal geänderten Dateien freigeben oder verwerfen | Impressum, Rechnung, Preise, Materialstand, **Beleg-Brücke** — fünf Baustellen auf einmal | 1 Sitzung |
| **O-2** | **Steuerstatus und Rechtsperson** klären (§ 19 UStG oder USt-IdNr.; Einzelunternehmen oder UG) | Impressum ohne Platzhalter, Rechnungsstellung, später Plattform-Partneranträge | 1 Termin Steuerberater |
| **O-3** | **Deutsche Rufnummer** einrichten und eintragen | erster Kontaktweg der Zielgruppe; beseitigt den zweiten Platzhalter | 30 Min |
| **O-4** | **NV SWISS um Freigabe bitten** (Entwurf liegt seit Wochen fertig) | erster öffentlicher Kundenbeleg — der härteste Blocker ab Mittelstand | 1 Mail |

## 7.2 Brücken — klein, endlich, danach ist Schluss

| # | Arbeit | Vorbedingung | Aufwand |
|---|---|---|---|
| **B-1** | **Beleg-Brücke**: öffentliche Projektion liest die Freigabe-Tabelle statt `site-data.ts` | O-1 | ~1 Tag |
| **B-2** | **`socialProfiles` füllen** (LinkedIn Person + Unternehmensseite) → Footer, `sameAs`, Verbindungskarte auf `LINK_ONLY` | LinkedIn-Profiltext aktualisiert | ~1 h |
| **B-3** | **Veröffentlichungsregister** im Admin: was · wo · wann · was kam zurück, verknüpft mit der Chronik | keine | ~1 Tag |

**Danach ist der Marketing-/Sales-Bau abgeschlossen.** Nicht „vorläufig" — abgeschlossen.

## 7.3 Die Gewohnheit — das Einzige, was danach noch zählt

| Rhythmus | Handlung | Wo erfasst |
|---|---|---|
| **Wöchentlich, 90 Minuten fest** | 5 Gespräche mit Altkunden oder warmen Kontakten | manuelle Anfrage + Chronik |
| **Alle zwei Wochen** | eine Build Note als LinkedIn-Text veröffentlichen (kein Deploy) | Veröffentlichungsregister |
| **Montags, 20 Minuten** | Übersicht durchgehen, fällige nächste Schritte abarbeiten | Übersicht |

`[BUSINESS JUDGEMENT]` **Wichtig zur Insights-Frage:** Ein Beitrag auf der Website kostet heute vier Sprachfassungen, ein Gate und einen Deploy. Das ist der Grund, warum seit 32 Tagen keiner erschienen ist. **Entkoppeln:** zuerst als LinkedIn-Text veröffentlichen — nur was dort trägt, wird später zum Website-Insight. Damit hängt die Frequenz nicht mehr am Deploy.

---

# 8 · SCHLUSSSTRICH — WAS NICHT MEHR GEBAUT WIRD

| Nicht bauen | Grund |
|---|---|
| LinkedIn-/Meta-Posting-Adapter | §5.4 — amortisiert sich bei der heutigen Frequenz nie |
| Community-Management-Partnerantrag | Rechtsperson offen, Owner-Zeit gebunden, kein bespielter Kanal |
| Instagram in jeder Form | kein Konto, kein Publikum, 2–4 Wochen Prüfung je Berechtigung |
| Kampagnen-/Newsletter-Suite | war nie im Umfang und ist es weiterhin nicht |
| Lead Scoring, Attribution, Viewport-Events | keine Datenbasis, keine aktive Messung |
| Weitere Sprachfassungen | vier Sprachen, null belegte Anfragen in irgendeiner |
| Weitere Dashboards oder Cockpits | Übersicht ersetzt bereits Heute + Cockpit |
| Pipeline-Stufen umbauen | erst nach realer Nutzung entscheiden |
| Dark Mode | POST-99, richtig eingeordnet |

---

# 9 · WORAN „FERTIG" ERKENNBAR IST

Prüfbar ohne Technikwissen:

| Prüfung | Grün wenn |
|---|---|
| `creadig.de/impressum` öffnen | Kein Wort „Platzhalter". Eine deutsche Nummer steht da und ist anklickbar |
| Eigene Nummer vom Fremdhandy anrufen | Es klingelt |
| `creadig.de/arbeiten` öffnen | Mindestens ein Kundenfall steht dort — **und** er verschwindet, wenn die Freigabe im Admin widerrufen wird |
| Fußzeile der Startseite | LinkedIn ist verlinkt |
| `/admin/verbindungen` | LinkedIn steht auf `LINK_ONLY`, nicht auf `NOT_CONFIGURED` |
| `/admin` nach einer Woche | Mindestens 5 Gespräche mit Datum, mindestens 3 fällige nächste Schritte |
| Veröffentlichungsregister nach vier Wochen | 2 Einträge, bei mindestens einem steht eine Reaktion |
| Erstes gewonnenes Projekt | Rechnung ist im System stellbar |

---

# 10 · REIHENFOLGE — 14 TAGE

| Tag | Wer | Was |
|---|---|---|
| **1** | Owner | **G18 entscheiden** (O-1). Eine Sitzung, sechs Dateien: freigeben oder verwerfen |
| 1 | Owner | Rufnummer bestellen (O-3) |
| 2 | Owner | Termin beim Steuerberater vereinbaren (O-2) |
| 2 | Owner | **NV-SWISS-Mail senden** (O-4) — der Text liegt seit Wochen fertig |
| 2–3 | Terminal | Nach O-1: Impressum ohne Platzhalter, Rufnummer eintragen, `socialProfiles` füllen (B-2) |
| 3 | Owner | LinkedIn-Profiltext auf die heutige Positionierung |
| **4–8** | Owner | **Erste Gesprächswoche: 5 Anrufe**, jedes im Admin erfasst |
| 5–6 | Terminal | Beleg-Brücke (B-1) |
| 7 | Owner | Erste Build Note auf LinkedIn |
| 8–10 | Terminal | Veröffentlichungsregister (B-3) |
| **11–14** | Owner | Zweite Gesprächswoche · erste Chance mit nächstem Schritt · Einwände notieren |

**Auffällig an dieser Liste:** Die Terminal-Arbeit umfasst noch **zwei bis drei Tage**. Alles andere gehört dem Owner — und das ist der Beweis, dass der Endspurt erreicht ist.

---

# 11 · DAS EINE, WAS DIESE RUNDE ENTSCHEIDET

> **G18 entsperren und in derselben Woche fünf Altkunden anrufen.**

G18 ist der einzige Knoten, der fünf Baustellen gleichzeitig hält — Impressum, Rechnung, Preise, Materialstand und die Beleg-Brücke. Und die fünf Anrufe sind die einzige Handlung, die dem System endlich die Daten gibt, für die es gebaut wurde.

Alles andere in diesem Bericht ist danach eine Frage von Stunden.

---

## Quellen

**Intern (Repo, 24.09.2026):** `docs/admin-os/state.md` (Ledger, 72 KB) · `docs/admin-os/cutover.md` · `docs/admin-os/abnahme.md` · `lib/verbindungen.ts` · `lib/verbindungen-pruefung.ts` · `lib/vertrieb.ts` (`createEnquiry`, `HERKUENFTE`) · `lib/redaktion.ts` · `lib/insights.ts` · `lib/site-data.ts` (`caseStudies`, `fallFreigabe`, `socialProfiles`) · `lib/proof.ts` · `scripts/migrations/018-freigaben.sql` · `git status`, `git log` · Live: `creadig.de` Startseite, Impressum, `/arbeiten`, `/insights`, `/admin*`

**Plattform-Bedingungen (Stand 2026)**
- [LinkedIn · Integration Requirements for Community Management (Microsoft Learn)](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/integration-requirements-community-management?view=li-lms-2026-06)
- [LinkedIn · Community Management Overview (Microsoft Learn)](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview?view=li-lms-2026-07)
- [LinkedIn · Member Post Statistics (Microsoft Learn)](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/members/post-statistics?view=li-lms-2026-06)
- [LinkedIn Community Management API · Produktkatalog](https://developer.linkedin.com/product-catalog/marketing/community-management-api)
- [LinkedIn Partner Program 2026 · Zugangsrealität (Phyllo)](https://www.getphyllo.com/post/linkedin-api-access-in-2026-partner-program-approval-timeline-alternatives)
- [Instagram Graph API · Entwicklerleitfaden 2026 (Elfsight)](https://elfsight.com/blog/instagram-graph-api-complete-developer-guide-for-2026/)
- [Instagram API Integration 2026 · Setup, OAuth, Limits (Phyllo)](https://www.getphyllo.com/post/instagram-api-integration-101-for-developers-of-the-creator-economy)

**Nicht verfügbar:** Live-Admin-Anmeldung (Passwort ausgeschlossen) · Produktionsdatenbank (maskiert) · Vercel Web Analytics (am 13.09. nicht aktiv; seither `[UNBEKANNT]`) · LinkedIn-/Instagram-Kennzahlen (Login-Wand)
