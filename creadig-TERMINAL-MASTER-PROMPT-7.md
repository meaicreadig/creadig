# creaDIG — Terminal-Master-Prompt 7 · Barrierefreiheit als eigene Leistung

> **Grundlage:** Geschäftsentscheidung vom 23.08.2026 (`creadig-90-tage-plan.md`).
> Barrierefreiheit wird **die neue Einstiegsleistung** von creaDIG — der Türöffner,
> hinter dem Relaunch und Betreuung stehen. Handelsvertretung (§ 84 HGB) ist ein
> **separates Vorhaben und gehört NICHT auf diese Website.**
> **Reihenfolge 1→4 ist bindend.** **Stufe 1 ist erledigt** (Commits ab `a699fa6`, freigegeben).
> **Ausführung Stufe 2–4: in EINEM Durchgang, ohne Zwischen-STOPP** (Owner-Wunsch). Ein Commit pro
> Teilschritt, `npm run build` grün + Function-Gate + Sterne-Gate vor jedem Commit. Owner-abhängige
> Punkte laufen als „wartet auf Owner" durch, ohne anzuhalten; Copy selbst entwerfen (DE+TR) und
> im Endbericht zur Freigabe zeigen. Erst **ganz am Ende ein STOPP** mit Gesamtbericht.
> **Nicht nach `main`, nicht live, kein Force-Push.**

## Black Lock (Ergänzungen zu Prompt 6)
Unverändert gültig · **zusätzlich:**
- **Kein Angstverkauf.** Bußgeldhöhen, Behörden-Drohungen und Abmahnungs-Hinweise erscheinen in **keiner** Copy. Argumentiert wird über den entgangenen Kunden, nie über die Strafe.
- **Keine Rechtsberatung, keine Rechtssicherheits-Zusage.** Nirgends „rechtssicher", „garantiert konform", „abmahnsicher". Formulierung immer: *Prüfung und Umsetzung nach WCAG 2.1 AA*.
- **Kein Overlay.** Weder eingesetzt noch empfohlen — die Abgrenzung ist Teil des Angebots.
- **Die eigene Seite muss zuerst bestehen.** creaDIG verkauft Barrierefreiheit erst, wenn creadig.de sie nachweislich selbst erfüllt.

## Owner-Entscheidung vor Stufe 2 — ENTSCHIEDEN (23.08.2026)
Preise vom Owner **bestätigt** (alles netto zzgl. 19 % USt):

| Position | Preis |
|---|---|
| **Prüfung** | **1.500 € Festpreis** |
| **Behebung** | **2.000–4.000 €, erst NACH der Prüfung angeboten** (kein Festpreis für ungesehenen Code) |
| **Betreuung** | **149 €/Monat** |

Preis-Copy darf geschrieben werden (Stufe 4). **BF-A9 (Eigen-Audit) wird als ERSTER Insight-Artikel veröffentlicht.**

## Arbeitsweise
- Ein Teilschritt = ein Commit (`feat(BF-A1): …`), vorher `npm run build` grün + Function-Gate.
- Jede Textänderung in **DE und TR**.
- Owner-abhängige Punkte NICHT erfinden → als „Owner liefert" im Bericht melden.
- Stufe 2→4 **ohne Zwischen-STOPP**; nur am Ende: build grün, Gesamtbericht, **STOPP**.

---

## STUFE 1 — Die eigene Seite zuerst ✅ ERLEDIGT (Commits ab `a699fa6`, freigegeben)

Wer Barrierefreiheit verkauft und sie selbst nicht liefert, verliert das Gespräch im ersten Satz. Diese Stufe ist kein Marketing, sie ist die Voraussetzung.

### 1.1 · BF-A1 — 12-Punkte-Raster als prüfbares Dokument anlegen
- **Tun:** `docs/barrierefreiheit-pruefraster.md` anlegen: 12 Prüfpunkte in fester Reihenfolge, Schwerpunkt auf den vier häufigsten Mängelklassen — Kontrastwerte, Alternativtexte, Formularbeschriftungen (`label`↔`input`), Tastaturbedienbarkeit/Fokus. Je Punkt: WCAG-Kriterium, Prüfmethode, Bestanden-Kriterium.
- **Acceptance:** Das Raster ist so konkret, dass zwei Personen unabhängig zum selben Ergebnis kommen.

### 1.2 · BF-A2 — creadig.de gegen das eigene Raster prüfen
- **Bezug:** alle Routen `(de)` und `(tr)`, insbesondere `components/termin/*`, `app/(de)/kontakt`, `components/ui/*`.
- **Tun:** Automatisierte Prüfung (axe o. ä.) **plus** manuelle Tastatur- und Screenreader-Durchläufe für: Startseite, Leistungen, eine Detailseite, Kontakt, Termin-Wizard. Befund vollständig in `docs/barrierefreiheit-befund-eigen.md` — auch die unangenehmen Punkte.
- **Acceptance:** Befund liegt vor, jeder Fund mit Route, Element und WCAG-Kriterium.

### 1.3 · BF-A3 — Gefundene Mängel beheben
- **Tun:** Behebung im Code, nicht per Overlay, nicht per Plugin. Fokus-Sichtbarkeit, Kontraste, `label`-Verknüpfungen, Alternativtexte, Tastaturpfad durch den Termin-Wizard, Fehlermeldungen für Screenreader (`aria-live`), `lang`-Attribut je Sprachraum, Skip-Link.
- **Acceptance:** Der Wizard und das Kontaktformular sind **vollständig ohne Maus** bedienbar. Erneuter Lauf gegen das Raster: keine offenen Punkte der vier Mängelklassen.

### 1.4 · BF-A4 — Eigene Erklärung veröffentlichen
- **Tun:** Seite `barrierefreiheit` (DE) / `tr/erisilebilirlik` (TR) im Seitendesign: Stand der Umsetzung, geprüfte Bereiche, bekannte Einschränkungen, Feedback-Weg (E-Mail + Formular). Ehrlich formuliert — **freiwillig**, nicht als Pflichterfüllung behauptet, solange die Schwelle nicht geprüft ist.
- **Acceptance:** Seite erreichbar, im Footer verlinkt, DE/TR-Parität, keine Behauptung ohne Beleg im Befund.

**STOPP nach Stufe 1** — build grün, Befund vorher/nachher im Bericht, Screenshots des Tastaturpfads.

---

## STUFE 2 — Die Leistungsseite

### 2.1 · BF-A5 — Eintrag in `lib/service-pages.ts`
- **Bezug:** `lib/service-pages.ts` (Datenmodell `ServicePage`), Routing über `app/(de)/leistungen/[slug]` und `app/(tr)/tr/leistungen/[slug]`.
- **Tun:** Neuer Eintrag, `layer: "digital"`, `published: true`.
  - `slug`: `barrierefreiheit-website`
  - `chip`: DE „Barrierefreiheit" · TR „Erişilebilirlik"
  - `h1`/`lead`/`metaTitle`/`metaDescription`: Suchvokabel ist „Barrierefreiheit Website" und „BFSG Onlineshop" — die H1 darf länger und menschlicher sein als der `metaTitle`.
  - `includes`: was tatsächlich geliefert wird — manuelle Prüfung nach dem 12-Punkte-Raster, Screenreader- und Tastaturdurchlauf, Befundbericht mit Belegen, Behebung im Code, Erklärung und Feedback-Mechanismus als technische Vorlage, erneute Prüfung nach der Behebung.
  - `forWhom`: Betriebe mit Onlineshop oder Buchungsstrecke, Handwerk/KMU/Gastronomie — Schwerpunkt Deutschland.
- **Acceptance:** Seite unter `/leistungen/barrierefreiheit-website` und `/tr/leistungen/…` erreichbar, in Sitemap, eigener Canonical, Chip auf der Startseite sichtbar.

### 2.2 · BF-A6 — Copy-Regeln durchsetzen
- **Verboten auf der Seite:** jede Bußgeldzahl, „Abmahnung", „Behörde prüft", „rechtssicher", „garantiert", „100 % konform", jede Frist-Drohung.
- **Erlaubt und gewollt:** die sachliche Feststellung, dass das BFSG seit 28.06.2025 gilt · die Wirkung auf den Nutzer („Ihr Kunde bricht den Kauf ab, weil das Feld nicht vorgelesen wird") · die Abgrenzung zum Overlay · die klare Grenze der eigenen Leistung.
- **Tun:** Abschnitt „Was wir tun — und was nicht": wir prüfen und beheben technisch; die rechtliche Bewertung und die Freigabe der Erklärung liegen beim Anwalt des Kunden.
- **Acceptance:** Kein Satz auf der Seite verspricht ein rechtliches Ergebnis. `grep -ri "rechtssicher\|Bußgeld\|Abmahn" app components lib` liefert für diese Seite nichts.

### 2.3 · BF-A7 — DE/TR-Parität
- **Tun:** Türkische Fassung ist eine eigenständige Übersetzung, keine Wortersetzung. Fachbegriffe (WCAG, BFSG, Screenreader) bleiben stehen und werden einmal erklärt.
- **Acceptance:** Beide Seiten gleich lang, gleich vollständig, gleiche Abschnitte.

Kein Zwischen-STOPP — build grün; beide Sprachfassungen als Screenshot in den Endbericht.

---

## STUFE 3 — Der Beweis (das eigentliche Verkaufsinstrument)

Das Angebot wirkt nicht über Behauptung, sondern über einen konkreten Befund am Objekt des Kunden. Das muss die Seite können.

### 3.1 · BF-A8 — „Kurz-Check anfragen" statt Scanner
- **Bezug:** `app/api/lead/route.ts`, `lib/lead-guard.ts`, `lib/use-lead.ts`.
- **Tun:** Auf der Leistungsseite ein Formular mit **einem** zusätzlichen Pflichtfeld: Website-Adresse. Der Lead-Weg bleibt unverändert (Honeypot, Token, Rate-Limit aus Prompt 6). Bestätigungstext: *„Wir sehen uns Ihre Seite an und melden uns mit drei konkreten Punkten — kostenlos und unverbindlich."*
- **Ausdrücklich NICHT:** kein automatischer Scanner auf der Website. Ein Automat erzeugt Ergebnisse, für die niemand geradesteht, und widerspricht der Abgrenzung zum Overlay.
- **Acceptance:** Feld validiert eine URL, Lead enthält die Adresse, Schutzmechanismen greifen unverändert, DE/TR.

### 3.2 · BF-A9 — Ein Beleg statt eines Versprechens
- **Tun:** Sobald der eigene Befund aus Stufe 1 vorliegt, einen kurzen Insight-Beitrag veröffentlichen: *„Wir haben unsere eigene Seite geprüft — das haben wir gefunden."* Echte Funde, echte Behebung, keine Selbstbeweihräucherung. Bezug: `lib/insights.ts`.
- **Acceptance:** Beitrag nennt mindestens drei eigene Mängel und deren Behebung. Keine Kundenreferenz ohne schriftliche Freigabe.

Kein Zwischen-STOPP — build grün; Testlead mit URL-Feld für den Endbericht nachweisen.

---

## STUFE 4 — Preis, Paket, Anschluss

### 4.1 · BF-A10 — Preisleiter nach Owner-Entscheidung einbauen
- **Tun:** Erst nach der Entscheidung oben. Prüfung als Festpreis ausweisen, Behebung ausdrücklich als „Angebot nach der Prüfung" — kein Festpreis für ungesehenen Code. Betreuung als laufende Position.
- **Acceptance:** Die Seite nennt genau einen Festpreis (Prüfung) und macht die zweite Stufe als Angebot kenntlich.

### 4.2 · BF-A11 — Anschluss an das bestehende Paket
- **Bezug:** `packageKeys` in `lib/service-pages.ts`, Paketdarstellung in `lib/dictionary.ts`.
- **Tun:** Barrierefreiheit als benannter Bestandteil des Website-Pakets führen — wer neu baut, bekommt es eingebaut; wer eine bestehende Seite hat, bekommt Prüfung und Behebung. Keine zweite Preiswelt aufmachen.
- **Acceptance:** Ein beworbenes Angebot bleibt ein beworbenes Angebot (Black Lock). Barrierefreiheit ist Einstieg, nicht Konkurrenzprodukt.

### 4.3 · BF-A12 — Selbsttest erweitern
- **Bezug:** `app/api/selftest/route.ts`, CI aus Prompt 6.
- **Tun:** Automatisierten Barrierefreiheits-Check (axe) als CI-Schritt über die Hauptrouten. Bricht der Build bei einem neuen Verstoß der vier Mängelklassen, ist das gewollt.
- **Acceptance:** CI schlägt fehl, wenn ein `label` entfernt oder ein Kontrast unterschritten wird.

**FINALER STOPP nach Stufe 4** — Gesamtbericht: was gebaut, was offen, welche Owner-Punkte; dazu `creadig-LIVE-CHECKLISTE.md` und `creadig-AUDIT-BACKLOG.md` aktualisiert.

---

## Ausdrücklich nicht Teil dieses Prompts
- Handelsvertretung / § 84 HGB — separates Vorhaben, nicht auf dieser Website.
- Overlay-Tools, Accessibility-Widgets, Zertifikats-Siegel Dritter.
- Automatischer öffentlicher Scanner.
- Jede Aussage über Bußgelder, Fristen als Druckmittel oder Rechtsfolgen.
- Kalt-E-Mail-Funnels, Newsletter-Zwang, Exit-Intent-Popups.
