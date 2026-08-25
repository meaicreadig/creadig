# creaDIG — Terminal-Master-Prompt 10 · V3: Inhalt, Platzierung, Tiefe & Abschluss

> **Grundlage:** KIZILELMA §11 (v0-V3-Diagnose) + offene Backlog-/v0-Punkte + die noch nicht gebauten MP9-Reste.
> **Ziel:** ALLES verbleibende CODEBARE abschließen — **außer der Design-Identität.**
> **Die Design-Identität „Der Schnitt" ist NICHT Teil dieses Prompts** — sie läuft als eigener,
> **reversibler Design-Durchlauf auf einem separaten Branch** (`design/schnitt`), Owner-Wunsch.
> Dieser Prompt bleibt auf `feat/system-haus-site`, ist additiv/umsortierend, niedriges Risiko.
> **Ersetzt `creadig-TERMINAL-MASTER-PROMPT-9-ABSCHLUSS.md`** (falls vorhanden, am Ende löschen).
> **Ausführung: alle Stufen in EINEM Durchgang, ohne Zwischen-STOPP.** Commit + `npm run build` grün
> + alle Gates (Function/Sterne/Parität/a11y/smoke) pro Teilschritt. Owner-abhängige Inhalte laufen
> als „wartet auf Owner" durch (nichts erfinden). Nur **finaler STOPP**. **Nicht nach `main`, nicht live, kein Force-Push.**

## Gesperrte Entscheidungen (Black Lock — gilt weiter)
Ehrlichkeit zuerst (keine erfundenen Zahlen, Referenzen, Reviews, Zertifikate; fehlt Material → Sektion/Feld rendert null) · Markt DACH, alle Unternehmen · Deutsch Hauptsprache, TR bleibt · drei Marken-Sätze · Verb-Welt · kein Angstverkauf, keine Rechtssicherheits-Zusage, kein Overlay · Marken-DNA bleibt · **Design-Identität nicht hier anfassen.**

## Grundprinzip dieser Runde (aus §11)
„Fertig" = **„alles, was mit heutigem Material möglich ist, ist gemacht."** Die **`/status`-Seite** ist das Maß dafür. Alles Owner-Material-Abhängige wird **strukturell gebaut + ehrlich gegatet + auf `/status` als „fehlt" geführt** — nicht erfunden.

---

## STUFE 1 — Leistungen-Tiefe (die vier Kauf-Fragen)
- **`lib/service-pages.ts`** um vier Felder erweitern (je Localized bzw. Liste), auf allen Leistungsseiten gerendert, leer = rendert nicht:
  - `duration` — „wie lange dauert das?"
  - `process` — die Schritte in Reihenfolge (aus „Verstehen → Bauen → Betreiben" ehrlich ableitbar; ergänzen um „Umsetzung").
  - `fromTo` — vorher → nachher im Betrieb des Kunden.
  - `clientEffort` — was der Kunde beitragen muss (Zeit, Zugänge, Material).
- **Ehrlichkeit:** `process` darf das Terminal aus dem Bestehenden entwerfen. `duration`/`fromTo`/`clientEffort` mit echten Werten NUR wo belegbar (eigene Produkte: fibero-Betrieb etc.) — sonst **Owner-gegatet** (Entwurf im Endbericht zur Freigabe, keine erfundenen Zahlen). DE+TR.
- **Acceptance:** Leistungsseiten beantworten „was ändert sich / wie lange / was muss ich tun", nicht nur „was ist enthalten". Leere Felder rendern nicht und stehen auf `/status`.

## STUFE 2 — Platzierung nach Käufer-Fragen (Top-10 aus §11)
1. **Preiszeile auf die Startseite** nach `CapabilityTiles` — EIN Satz mit Zahl + Verweis („Website-Paket ab 2.400 € netto, Festpreis → Pakete"), kein Paketblock.
2. **FAQ vor Pakete** auf `/leistungen`; die zwei Kernfragen (Preis, Ablauf) zusätzlich auf der Startseite spiegeln.
3. **Projektdauer neben jeden Preis** (nutzt `duration` aus Stufe 1; leer → gegatet).
4. **„Alle Arbeiten ansehen"-Verweis** am Ende von `SelectedWork`.
5. **`Location` nach `CompanyTeaser`** verschieben; **Sitz-Erwähnungen 6× → 2** (Hero-Eyebrow + Footer).
6. **`/kontakt` vs `/termin`:** Hierarchie festlegen — `/termin` = Haupt-Abschluss (Nav-CTA und Startseiten-CTA dorthin), `/kontakt` = nur direkte Wege (Mail, WhatsApp, Sitz), KEIN zweites volles Formular.
7. **Angebots-Aufzählung vereinheitlichen:** Hero-Subline, `CapabilityTiles`, Footer-Sprungmarken zeigen dieselben **fünf** Ebenen (Identity→…→Intelligence); „Fünf Ebenen. Ein System." gehört in den Hero. Kein „vier" vs „fünf", kein „KI" statt „Automation".
8. **FAQ-Punkt „Wem gehört das System? / Kündigung 149 €/Monat?"** (DE+TR) — Abhängigkeits-Sorge beim Dauerbetrieb; klare Antwort (System + Daten gehören dem Kunden, monatlich kündbar) wirkt stärker als jede Referenz.
9. **Logo-Wand:** solange nur unfreigegebene Fremdmarken → **entfernen** (mit Disclaimer schwächer als keine). Erst mit echten Freigaben zurück.
10. **`/status` dezent in die Fußzeile** verlinken (bestes Ehrlichkeits-Signal, heute unsichtbar).
- Zusätzlich: **`ClosingCta` ortsabhängig** (nach Preisen „Festpreis-Angebot anfragen", nach der Werkschau „Ähnliches Vorhaben? Sprechen wir."); **Impact-Band** um **„Jahre im Betrieb"** ergänzen (berechenbar aus 2017; die anderen Zahlen Owner-gegatet) oder Überschrift ehrlicher fassen, bis Zahlen stehen.

## STUFE 3 — Betriebsreife (offene technische Punkte)
- **BF-8 Zustellprüfung + Alarm:** `app/api/selftest` zu einem echten Selbsttest der Lead-Route ausbauen (Ausfall → Alarm-fähig); Aktivierung als Vercel-Cron = Owner. Reaktionszeit-Zusage in der Bestätigungsmail auf einen **haltbaren** Wert (Owner-Entscheidung).
- **BF-7 Nonce-CSP:** `unsafe-inline` für Skripte ablösen (Theme-Boot-Skript bekommt Nonce); CSP scharf, wo sicher.
- **Verifizieren:** `aggregateRating` gelangt bei 0 Reviews NICHT ins JSON-LD (sollte erledigt sein — bestätigen). „Größerer Umfang: auf Anfrage" ist sichtbar (BF-9) — prüfen/sicherstellen.

## STUFE 4 — Fehlende Seiten (deferred)
- **Technologie/Systeme-Seite:** „Integration first" — mit welchen Systemen wir arbeiten (API/CRM/ERP/Cloud/DB/Payment) + Betrieb (Monitoring/Logging/Backups/Security/Deployment). **Nur Wahres**, keine Logo-Wand fremder Tech.
- **Managed-Betrieb als eigene Seite:** die V2-Sektion zur vollen Seite ausbauen (Leistungsumfang + „warum Betrieb statt Übergabe").
- **Insights-Maschine:** Kategorie-Struktur (Systems/Automation/AI/Products/Betrieb/Praxis) + Artikel-Slots; Inhalt Owner-gegatet. Ein zweiter ehrlicher Insight aus dem eigenen Betrieb ist erlaubt (Owner-Freigabe im Endbericht).

## STUFE 5 — SEO-Landing-Architektur + Mobile/Performance
- **SEO-Landings** für die vom Owner genannten Ziele (**GATED:** Owner nennt Städte/Leistungen, z. B. „Webentwicklung Osnabrück", „Prozessautomatisierung", „KI für KMU") — je eine ehrliche Seite, mit echten Leistungen verbunden, `ProfessionalService`-Schema, kein Keyword-Müll. Fehlt die Owner-Liste → Struktur vorbereiten, Inhalt „wartet auf Owner".
- **Mobile-QA** an echten Breakpoints (Hero-Umbrüche, Grids, Kalender, Footer, Sprachumschalter, WhatsApp-CTA).
- **Performance:** Bilder AVIF/WebP + responsive + lazy, Font-Subsets, Hero-Priority, Core Web Vitals grün.

## STUFE 6 — `/status` als Fertig-Definition + Endabnahme
- **`/status` vervollständigen:** alle Owner-Lücken aus dieser Runde dort ableiten/auflisten (die eine Wahrheit „was fehlt jetzt nur noch vom Owner").
- Voller build + alle Gates + `npm run shots`.
- `creadig-LIVE-CHECKLISTE.md` + `creadig-AUDIT-BACKLOG.md` aktualisieren.
- `creadig-TERMINAL-MASTER-PROMPT-9-ABSCHLUSS.md` löschen (durch diesen ersetzt).
- **FINALER STOPP** mit Gesamtbericht + Owner-Liste.

## Owner liefert (Code wartet — nichts erfinden)
Reale Projektdauern / vorher→nachher / Kundenaufwand je Leistung · Jahreszahlen im Werk-Register · Impact-Zahlen (produktive Systeme, automatisierte Vorgänge; „Jahre im Betrieb" ist berechenbar) · Case-Inhalte NV SWISS + maqam · echte Produkt-Screens · echte Fotos · Impressum/Steuerstatus/DE-Telefon · Vercel-/Resend-AVV · ENV · Domain · **SEO-Ziele (Städte/Leistungen)** · Reaktionszeit-Zusage · **Entscheidungen:** TR-Nische besitzen ja/nein · 50k-Kunden-Strategie · Preisleiter oben „auf Anfrage".

## Nicht tun
- **Design-Identität „Der Schnitt" NICHT hier** — separater Branch.
- Keine Fakes / erfundene Zahlen / Referenzen / Zertifikate.
- Bestehende, funktionierende Teile nicht neu bauen (V2/BFSG/MP6-Stand respektieren).
- Nichts nach `main`, nicht live schalten, kein Force-Push.
