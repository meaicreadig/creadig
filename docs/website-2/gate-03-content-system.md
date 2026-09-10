# Gate 03 · Content-System, redaktionelle Hierarchie & Verdichtung

**Status: BUILT 🟢 · ACCEPTED 🟢 · OPERATIONAL 🟢 · CLOSED 🟡 (G04-Restschuld)**
Ausgangspunkt HEAD `8486ff49a1df5f683c93214458fceadd0d9b0895`, verifiziert auf
`origin/feat/system-haus-site` per `git ls-remote`. Gemessen am 10.09.2026.

Die Frage dieses Gates:

> Kann ein Mensch die Website vollständig verstehen, ohne dass creaDIG sich
> ständig selbst wiederholt?

---

## 1 · Die Hauptregel

> **EIN GEDANKE — EIN PRIMARY HOME.**
> Andere Seiten dürfen ihn kurz referenzieren. Sie dürfen ihn nicht noch
> einmal vollständig erklären.

Das Problem war nie zu wenig Inhalt. Es war **richtiger Inhalt an zu vielen
Stellen** — und jede Kopie nahm der Originalstelle Aufmerksamkeit weg.

Gemessen vor der Arbeit, über die gerenderten Seiten:

| | vorher |
|---|---:|
| Tragende Sätze auf ≥ 2 Routen | **68** |
| Ähnlichkeit `webdesign` ↔ `website-handwerk` | **30,0 %** |
| Ähnlichkeit `webdesign` ↔ `zweisprachig-de-tr` | **27,3 %** |
| Ähnlichkeit `website-handwerk` ↔ `zweisprachig-de-tr` | **25,2 %** |

Fünf tragende Sätze der Ebene *Digital* standen wortgleich auf **fünf** Routen.

---

## 2 · Primary Homes

Wo ein wiederkehrender Gedanke zu Hause ist — und welche Form andere Seiten
verwenden dürfen.

| Gedanke | Primary Home | Kurzform anderswo | Verboten |
|---|---|---|---|
| Die fünf Ebenen (Definition) | `/leistungen` — Pyramide mit Ausgangslage, Lösung, Ergebnis, Projekten | Name + der eine Satz + Verweis | Die drei Absätze noch einmal |
| Eine einzelne Ebene | `/leistungen#ebene-<key>` | Ein Satz, dann „Die Ebene im Ganzen" | Problem/Lösung/Ergebnis-Triple |
| Kategorie „System-Haus" | `/` (`HouseStatement`) | Ein Satz („Kein klassisches IT-Systemhaus…") | Die vollständige Erklärung |
| Managed Betrieb | `/betrieb` | 7 Namen + Betrag + Verweis | Die sieben Erklärungen |
| Monitoring / Reaktion / SLA | `/betrieb` | — | Eine Zusage, die eine andere Route nicht macht |
| Wer führt / Kernteam / Netzwerk | `/unternehmen#arbeitsmodell` | Ein Satz im Vorspann darunter | Dieselben drei Rollen zweimal |
| Übergabe, Umfang, Prüfung, Grenze | `/unternehmen#lieferung` | — | — |
| Eigene Produkte (Beschreibung) | `/produkte` und die Produktseite | Name + Branche | Der ganze `what`-Satz in jeder Weiterblätterung |
| Produkt-Beleg (Oberfläche) | Produktseite | — | Dieselbe Aufnahme auf Übersicht **und** Detail |
| Kein Kundenfall ohne Freigabe | `/arbeiten` | — | Auf jeder Seite erklären |
| Welche Zahlen wir nicht nennen | `/unternehmen` (`workModel.honesty`) | — | Fünf Fassungen auf einer Seite |
| Preisleiter | `/leistungen#pakete` | Ein Betrag als Einstiegsart | Eine zweite Preiswelt |

**Zwei bewusste Ausnahmen.** Der Abschluss-Aufruf und die
Einwilligungserklärung stehen absichtlich auf vielen Seiten. Sie in fünfzehn
Fassungen zu zerlegen wäre schlechter als sie zu wiederholen — eine Aktion mit
fünfzehn Beschriftungen ist genau der Fehler, den dieses Gate behebt. Beide
sind im Content-Gate als Ausnahme hinterlegt, nicht übersehen.

---

## 3 · Was tatsächlich geändert wurde

### 3.1 Leistungsdetailseiten — der größte Einzelfund

Jede Detailseite druckte die **vollständige Definition ihrer Ebene**:
Ausgangslage, Was wir bauen, Was danach anders ist, plus die Projektliste —
alles aus derselben Quelle wie die Pyramide auf `/leistungen`.

Der Kommentar im Code verteidigte das mit einem richtigen Argument: *„nicht neu
geschrieben, sondern dieselbe Quelle. Zwei Fassungen derselben Aussage wären in
vier Wochen zwei Aussagen."* Das stimmt für die **Datenhaltung**. Für den Leser
stimmt es nicht: Er liest denselben Text zum vierten Mal und hält nicht die
Ebene für wiederholt, sondern die Seite für leer.

**Jetzt:** ein Satz zur Ebene, ein Verweis auf ihre vollständige Fassung. Dazu
entfernt: `layer.who` (auf jeder Seite der Ebene identisch) und der doppelte
Eyebrow „Ebene im System · Digital", der bereits über der H1 steht.

### 3.2 Produktseiten

Die Weiterblätterung druckte den vollständigen `what`-Satz des Nachbarprodukts
— vier Produktseiten × zwei Nachbarn = acht Abdrucke von vier Sätzen, die
ohnehin auf `/produkte` und der Startseite stehen. **Jetzt:** Name + Branche.

Der Einordnungsblock druckte zusätzlich den Beschreibungssatz der Ebene. Drei
der vier Produkte sitzen auf *Operations* — der Satz stand damit auf sechs
Routen. **Jetzt:** entfernt; die linke Spalte beantwortet die Einordnung
vollständig.

### 3.3 `/unternehmen` — die G02-Schuld

Gate 02 musste die Seite erweitern (859 → 1.103 Wörter), um echte
Übergabefragen zu beantworten. Gate 03 zahlt zurück, **ohne eine Antwort zu
streichen**:

- **Fünf Aussagen über nicht genannte Zahlen** auf einer Seite → eine.
  Entfernt: `about.honesty` (Dublette), der Wegweiser in `about.body2`, die
  Verneinung im Vorspann von `workModel`.
- **Die Lieferliste hatte sechs Einträge, zwei davon beantworteten, was
  `WorkModel` direkt darüber ausführlich beantwortet** — „Wer führt" und „Wer
  sonst daran sitzt", beide sogar mit Anker zurück auf die Sektion zwei
  Bildschirmhöhen höher. Das war eine Schuld aus Gate 02. **Jetzt vier
  Einträge**, und der Vorspann verweist in einem Satz nach oben.

Die sechs Delivery-Antworten sind **inhaltlich vollständig erhalten**: zwei
stehen in ihrem Primary Home (`arbeitsmodell`), vier in `lieferung`.

### 3.4 `/kontakt` — WEB-0023

Der Sitz („ICO InnovationsCentrum Osnabrück … Deutschland") stand wenige Zeilen
über einer `+41`-Nummer. Die Antwort stand auf derselben Seite („Märkte:
Deutschland, Österreich & Schweiz"), nur ohne Verbindung zur Nummer. **Jetzt:**
„Schweizer Mobilnummer — creaDIG arbeitet in Deutschland, Österreich und der
Schweiz." Ohne Aussage über Gebühren: Was ein Anruf kostet, hängt am Tarif des
Lesers.

---

## 4 · Ergebnis, gemessen

| | vorher | nachher | Δ |
|---|---:|---:|---:|
| Tragende Sätze auf ≥ 2 Routen | 68 | **50** | −26 % |
| `webdesign` ↔ `website-handwerk` | 30,0 % | **10,7 %** | −64 % |
| `webdesign` ↔ `zweisprachig-de-tr` | 27,3 % | **7,1 %** | −74 % |
| `website-handwerk` ↔ `zweisprachig-de-tr` | 25,2 % | **6,5 %** | −74 % |

### Seiten

| Route | Wörter | H2 | Eyebrows | 1440 | 390 |
|---|---:|---:|---:|---:|---:|
| `/leistungen/webdesign` | 307→**214** | 8→**5** | 11→**9** | 3.214→**2.803** | — |
| `/leistungen/website-handwerk` | ~320→**237** | 8→**5** | 11→**9** | →**2.810** | — |
| `/leistungen/zweisprachig-de-tr` | ~320→**213** | 8→**5** | 11→**9** | →**2.754** | — |
| `/leistungen/barrierefreiheit-website` | 1.026→**932** | 14→**11** | 24→**22** | →5.399 | 10.890→**10.155** |
| `/unternehmen` | 1.103→**1.012** | — | 43→**41** | 9.611→**9.377** | 14.545→**13.819** |
| `/produkte/fibero` | 335→**324** | — | 20→**19** | 5.757 | 7.416→**7.300** |
| `/produkte/meai` | 461→**434** | — | 22→**21** | 6.697 | 9.331→**9.152** |
| `/` | 663 | 8 | 28 | 8.912 | 12.245 |

Die Startseite ist **unverändert**. Gate 02 hatte die doppelte
Produktdarstellung bereits entfernt (13.449 → 12.245 px); Gate 03 hat dort
keine Redundanz mehr gefunden, die sich ohne Substanzverlust entfernen ließe.

---

## 5 · `/leistungen` — der Befund, den Gate 03 **nicht** schließen konnte

WEB-0013 („Länge") bleibt bei 16.280 px mobil. Der Grund ist messbar:

| Block | 390 px | Anteil |
|---|---:|---:|
| **`pakete`** | **4.343** | **27 %** |
| Seitenkopf | ~2.993 | 18 % |
| `leistungen` (fünf Ebenen) | 2.708 | 17 % |
| `prozess` | 2.241 | 14 % |
| `managed-betrieb` | 2.131 | 13 % |
| `faq` | 1.269 | 8 % |
| `abschluss` | 595 | 4 % |

**Der größte Block liegt in `components/sections/packages.tsx` — einer der
sechs G18-gesperrten Dateien.** Gate 03 darf ihn nicht anfassen. Das ist die
Foreign-WIP-Kollision, die §4 vorsieht: dokumentieren, nicht überschreiben.

Von den übrigen Blöcken ist keiner Redundanz:

- Die fünf Ebenen sind der **Primary Home** — sie hier zu kürzen hieße, den
  Ort zu schwächen, auf den jetzt sechs Detailseiten verweisen.
- `managed-betrieb` ist bereits eine Kurzform (nur Namen, Erklärungen auf
  `/betrieb`).
- `prozess` trägt zwei Modelle (Haltung + Ablauf), beide nur hier.
- `faq` sind 71 Wörter.

**Ehrliche Einordnung:** Der Content-Anteil von WEB-0013 ist bearbeitet — was
sich wiederholte, ist weg. Die verbleibende Länge ist zu 27 % gesperrt und im
Rest Substanz oder Abstand. Das gehört G04 und dem G18-Zug, nicht G03.

---

## 6 · Was bewusst **nicht** geändert wurde

| | Warum |
|---|---|
| Der Abschluss-Aufruf auf 18 Routen | Eine Aktion mit 18 Beschriftungen wäre schlechter als eine Wiederholung |
| Einwilligungs- und Datenschutztexte | §47 — Legaltexte werden nicht eigenmächtig gekürzt |
| `HouseArchitecture` auf `/unternehmen` | Eine **Synthese** (Dach + Ebenen + Betrieb + Produkte in einer Ansicht), die es nirgends sonst gibt. Ihre Labels wiederholen sich, ihre Aussage nicht |
| `process.steps` auf `/leistungen` | Nur dort — Entfernen wäre Tiefenverlust, nicht Redundanzabbau |
| `/arbeiten` | 82 Wörter, ruhig und wahr. §41: wenn gut, nicht anfassen |
| `/insights` und der Artikel | §42 — dort ist Lesen das Produkt |
| Careers | §43 — eingefroren |
| Preisbeträge | §32 — maschinell geprüft, 0 Änderungen |

---

## 7 · Neu gesichert

`scripts/check-content-system.mjs`, im Postbuild. Prüft am **gebauten HTML**:

1. Kein tragender Satz (≥ 8 Wörter) auf ≥ 6 Routen — außer den zwei
   hinterlegten Ausnahmen.
2. Keine zwei Leistungsdetailseiten über 18 % Ähnlichkeit (5-Gramm-Jaccard).
3. Jeder öffentliche Betrag (2.400 / 3.900 / 1.500 / 149) kommt weiterhin vor.
4. Das Demodaten-Label steht auf `/produkte/fibero` und `/produkte/meai`;
   die von Gate 02 zurückgehaltenen Aufnahmen werden nirgends gezeigt.
5. `/betrieb` nennt die menschliche Reaktionszeit; „24/7" steht nirgends ohne
   Verneinung.

Das Gate hat sich beim Bauen zweimal bewährt: Es fand den sechsten Abdruck der
Ebene *Operations*, bevor er im Repository stand — und es meldete vier
Fehlalarme, die einen echten Fehler **im Gate selbst** offenlegten (der
Satzfilter ab acht Wörtern verwarf „Echte Oberfläche, Demodaten." und die
Preiszeilen). Seither prüft es Vorhandensein am Volltext und Wiederholung an
den Sätzen.
