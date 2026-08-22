# creaDIG — TERMINAL MASTER-PROMPT 5 · Verkaufsfähig werden

**Datum:** 2026-08-22 · **Branch:** `feat/system-haus-site` · **Der Richtungswechsel.**

Master-Prompt 4 hat die Seite **gebaut**. Master-Prompt 5 macht sie **verkaufsfähig.**
Grundlage: `ANALYSE-creaDIG.md` (12 technische Lanes + 13 Vertriebs-Lanes + Kreuzprüfung,
93 Befunde) und `KIZILELMA-creaDIG.md` §9 (Satış-Omurga).

**Start:** Lies **DIESE** Datei + `ANALYSE-creaDIG.md` (§0 Urteil, §5 Priorisierung, §10 Locks)
+ `KIZILELMA-creaDIG.md` §9 + `creadig-TERMINAL-BACKLOG-5.md` (die Pakete V1–V6).
Spiegle den Plan in ~8 Bullets, dann arbeite **genau EIN Paket** ab.
Nach jedem Teilschritt `npm run build` + eigener Commit. **Nicht** nach `main` pushen — außer V3-c.

---

## 1. Die Kern-Diagnose (warum dieser Richtungswechsel)

Die Seite ist gut gebaut und hat in Jahren **null Anfragen** erzeugt. Nicht wegen des Designs.
Vier Befunde erklären es vollständig — alle im Code belegt:

1. **Die Seite ist nicht live.** `main` trägt die alte HTML-Seite; 70 Commits liegen unveröffentlicht auf diesem Branch. Das letzte Deployment steht auf **ERROR** (Funktion `produkte/[slug]` 254,69 MB > 250 MB). `creadig.de` ist im Vercel-Projekt gar nicht eingetragen.
2. **Kein Kanal stellt zu.** `find app -name "route.ts"` → null Treffer. Das Kontaktformular macht nur `window.open(whatsappHref)`; es hat **kein E-Mail- und kein Telefonfeld**. Der `/termin`-Assistent zeigt „Anfrage steht." per `setTimeout`, unabhängig davon, ob je etwas gesendet wurde.
3. **Keine deutsche Rufnummer.** Einziger Kontakt ist `+41 76 504 58 79`; `imprintDetails.phone` steht auf `null`, deshalb rendert der `tel:`-Link nie. schema.org meldet eine CH-Nummer bei `addressCountry: "DE"`.
4. **Die Preise widersprechen dem Angebot.** `€350` / `€500 MON` / `€1.500 MON` stehen im Code und gehen über `hasOfferCatalog` an Google. `retainer` ist komplett `null`.

Dazu der härteste Punkt, vom Owner selbst korrigiert: **es gibt null zeigbare Web-Kundenreferenzen.**
NÛR ist Emins eigenes Produkt, Bir Damla Hayır das Projekt seiner Frau. **Beide stehen im Code als
`clientWorks` = „Kundenwerk".** Das verletzt den Ehrlichkeits-Lock aus Master-Prompt 4 §2 —
dieser Prompt hebt den Lock nicht auf, er **setzt ihn durch.**

**Leitsatz für alles, was folgt:**
> Die Seite hat null Leads, weil sie nicht live ist und kein Formular hat —
> nicht weil die Typografie eine Stufe zu groß ist.

---

## 2. Was sich gegenüber MASTER-PROMPT 4 ÄNDERT

**Zwei frühere Sperren werden aufgehoben. Alles andere aus Master-Prompt 4 bleibt gültig.**

### Aufhebung 1 — „Preise NICHT prominent auf der Startseite"
Master-Prompt 4 §2 sperrte Preise auf der Startseite, weil sie creaDIG „zur produktisierten Agentur"
machen. **Diese Sperre gilt nicht mehr.**
**Grund:** Die zahlende Zielgruppe ist der Handwerksbetrieb, nicht der Software-Einkäufer.
Er entscheidet allein, in Minuten, und bricht ohne Preis ab. Der Befund `[A4-2]` belegt: Die Startseite
nennt weder „Handwerk" noch einen Preis; der 30-Sekunden-Test fällt durch.
**Neu:** Eine Preiszeile gehört unter die Hero-Chips. Keine Preistabelle — **eine Zeile.**

### Aufhebung 2 — „Produkte sind der stärkste Beweis" als Navigations-Priorität
Master-Prompt 4 stellte die Produkt-Welten in den Vordergrund. **Die Routen bleiben** — sie sind
Kompetenzbeweis für Software-Kunden. **Aber sie verlassen die Hauptnavigation.**
**Grund:** `[A4-5]` — drei von vier Produkten zeigen `outcome: "Im Aufbau"`, `story: null` bei allen
vier, `public/works/products/` enthält nur eine README. Für einen Dachdecker beweist eine
Kassensoftware nichts, und dreimal „Im Aufbau" liest sich als „der ist mit anderem beschäftigt".

### Unverändert gültig aus Master-Prompt 4
Visuelle DNA (Light + Gold-Akzent, Poppins, Signatur-Motiv dosiert, kein Serif, kein Schwarz-dominant) ·
die gated-Maschine (Reviews/Cases/Retainer/Social) · Consent · i18n · Legal ·
Sitz ICO Osnabrück · **Gründung 2017** · Märkte DE · CH · Europa · Sprachen DE · TR · EN (Default DE) ·
eigene Produkte sind **nur** meAI · fibero · CASSAMEA · meahv.

---

## 3. GESPERRTE ENTSCHEIDUNGEN (Black Lock — nicht kippen)

1. **Ehrlichkeit, härtester Lock.** Nur echte Daten, Screenshots, Zahlen. **Eigene Projekte werden nie als Kundenwerk ausgegeben.** Keine erfundenen Zitate, Reviews, Referenzen, Wettbewerbernamen oder Platzhalter, die nach Beweis aussehen. Fehlt Material → Sektion versteckt sich.
2. **go-digital bleibt aus jeder Copy**, bis der Owner den Status schriftlich klärt. `[UNBEKANNT]`
3. **Preisleiter:** `2.400 €` (Kunde 1+2, Referenzpreis, offen benannt) → `3.900 €` ab Kunde 3. Dazu `149 €/Monat` Betreuung. Alle Preise **netto, zzgl. 19 % USt.** Nicht überspringen, nicht unterbieten.
4. **Design-Feinschliff ist gesperrt, bis V3 abgeschlossen ist.** Die A3-Befunde sind real und gemessen — dunkle Bänder mit 1,09:1 statt 16:1, `type-h2` größer als `type-h1`, 13 Gold-Buttons in 6 Größen, 132 rohe Schriftgrößen neben der eigenen Skala. Sie kommen als **Design-Nachlauf** nach dem Livegang, nicht vorher.
5. **Ein Angebot wird beworben:** Website-Paket Handwerk. Corporate Design, Medien und Software bleiben im Portfolio, nicht in der Werbung.
6. **Ein Paket pro Terminal-Lauf.** Reihenfolge V1 → V2 → V3 → V4 → V5. V6 erst nach dem ersten Abschluss.
7. **Kein Force-Push. Kein Merge nach `main`, solange das Preview-Deployment auf ERROR steht.**
8. **Keine Mail-Zugangsdaten im Repo** — nur Umgebungsvariablen.
9. **Kein Captcha, keine Registrierung, kein Login.** Die Seite bleibt statisch bis auf die eine Anfrage-Route.
10. **`/produkte` wird nicht gelöscht.** Nur entschärft und aus der Hauptnavigation genommen.

---

## 4. Rolle & Arbeitsweise

Du bist der **Umsetzer**, nicht der Stratege. Die Strategie steht in `ANALYSE-creaDIG.md` und
`KIZILELMA-creaDIG.md` §9 — sie wird nicht neu verhandelt.

- **Jeder Teilschritt ein eigener Commit** (`V1-a`, `V1-b`, …), Präfix `fix:` / `feat:` / `docs:`.
- **Nach jedem Teilschritt `npm run build`.** Rot = anhalten, melden, nicht weiterbauen.
- `npm run dev` und `npm run build` teilen sich `.next`. Bei `Cannot find module for page: …` läuft noch ein Dev-Server → beenden, `rm -rf .next`, neu bauen.
- **Scope-Disziplin:** Wenn dir außerhalb des Pakets etwas auffällt — notieren, nicht anfassen. Am Ende in einem Abschnitt „Nebenbefunde" melden.
- **Owner-Material fehlt?** Nicht erfinden, nicht annähern. Feld auf `null` lassen, im Abschlussbericht als offen melden.
- **Zweisprachigkeit:** Jede Textänderung in `lib/dictionary.ts` betrifft **DE und TR** (und EN, wo vorhanden). Parität ist Pflicht.
- **Am Ende des Pakets:** kurze Zusammenfassung — was geändert, was nicht ging, welche Owner-Angaben fehlen, welche Verifikation grün war.

---

## 5. Owner liefert (blockiert einzelne Teilschritte, NICHT den Start)

| Was | Blockiert | Status |
|---|---|---|
| Rechtsform + **Kleinunternehmer oder Umsatzsteuer-ID** | V3-b Impressum → V3-c Livegang → alle Anzeigen | offen |
| **Deutsche Rufnummer** | V2-a, V3-b | offen |
| **Rumi's Maison** — echter zahlender Kunde? | V1-a (bleibt bis dahin mit Kommentar stehen) | offen |
| **go-digital** — aktiv, beantragt, oder gar nicht? | V4 Zertifikats-Copy | offen |
| **Verbands-Logos** BAFA / iuk / AVPQ / AGD | V4 Badge-Block | offen |
| Mail-Zugang (Resend-Key oder SMTP) | V2-b Serverversand | offen |

**V1 ist von keiner dieser Angaben abhängig und kann sofort starten.**

---

## 6. Reihenfolge

| Paket | Zweck | Kern |
|---|---|---|
| **V1 · Wahrheit** | Die Seite sagt nichts Falsches mehr | Eigene Projekte raus aus `clientWorks` · Preise auf die Leiter · `retainer` füllen · Attrappen-Chat löschen · „Im Aufbau" ersetzen · `/produkte` aus der Hauptnavigation · `/insights` löschen |
| **V2 · Erreichbarkeit** | Der Trichter bekommt einen Boden | Deutsche Rufnummer überall · `app/api/anfrage/route.ts` mit Mailversand · E-Mail- und Telefonfeld · falsche Erfolgsmeldung · Datenschutz-Baustein im Wizard · Fehlermeldung ins Sichtfeld |
| **V3 · Livegang** | Die Seite wird erreichbar | `outputFileTracingExcludes` · `_legacy` entversionieren · Impressum + § 36 VSBG + Speicherdauer · Merge nach `main` · Domain · Framework Preset · Deployment-Alarm |
| **V4 · Nische** | Die Seite spricht mit dem Handwerker | Hero auf Handwerk + Ort + **Preiszeile** · Bewerber-Winkel · `ProfessionalService`-JSON-LD · Osnabrück in Titeln · deutsche 404-/Fehlerseiten · Badge-Logos |
| **V5 · Landing + Messung** | Werbung wird messbar | `app/angebot/website-handwerk` · `@vercel/analytics` an `statistics` · Meta-Pixel + Ereignis „Anfrage" |
| **V6 · TR-Route** | **Erst nach dem ersten Abschluss** | `app/[locale]` · `alternates.languages` · TR in der Sitemap · `Work`-Typ auf `Localized` |
| **Design-Nachlauf** | **Erst nach V3** | A3-1 dunkle Bänder · A3-2 Typo-Stufen · A3-3 Buttons · A3-4 zweite Skala · A3-5 Eyebrows · A3-6 Übergänge · A3-7 Motiv-Kontrast · A3-8 Radien |

Die vollständigen Arbeitsanweisungen je Teilschritt stehen in `creadig-TERMINAL-BACKLOG-5.md`.

---

## 7. Nicht tun

- ❌ **Kein Design-Feinschliff vor V3.** Keine Farb-, Typo-, Abstands- oder Button-Änderung — auch wenn es dir ins Auge springt.
- ❌ **Keine erfundenen Referenzen, Zitate, Zahlen oder Logos** als Platzhalter. Lieber eine leere Sektion.
- ❌ **Nicht mehrere Pakete in einem Lauf.** Auch nicht „V1 ist ja klein, ich mach V2 gleich mit".
- ❌ **Kein Merge nach `main` bei rotem Preview-Deployment.** Kein Force-Push.
- ❌ **`/produkte` nicht löschen**, `_legacy/` nicht vom Rechner löschen (nur entversionieren).
- ❌ **Keine neue Abhängigkeit** außer den in V5 genannten (`@vercel/analytics`) und dem Mailversand in V2.
- ❌ **Keine Sprachlücke.** Kein Text nur auf Deutsch, wenn TR/EN existieren.
- ❌ **Keine erfundene Umsatzsteuer-ID.** Wenn Kleinunternehmer, dann der Kleinunternehmer-Hinweis.

---

## 8. Acceptance (vom Owner ohne Technikwissen prüfbar)

| Paket | Prüfschritt | Grün, wenn |
|---|---|---|
| V1 | `grep -rn "€350\|€500\|€1.500" lib/` | keine Treffer |
| V1 | Seite im Browser öffnen | kein schwebender Chat-Knopf; kein „Im Aufbau" sichtbar; `/produkte` nicht im Menü, aber per URL erreichbar |
| V2 | Von einem fremden Handy die Nummer anrufen | es klingelt |
| V2 | Testabsendung des Formulars von einem fremden Gerät | Mail liegt in `info@creadig.de`, Bestätigung kommt beim Absender an |
| V2 | Wizard bei abgeschaltetem Netz durchklicken | **kein** „Anfrage steht." |
| V3 | Preview-Deployment in Vercel | Status **READY**, nicht ERROR |
| V3 | `creadig.de` im Inkognito-Fenster | lädt die **neue** Seite; Impressum ohne Pending-Hinweis |
| V4 | Ein Fremder liest 30 Sekunden die Startseite | nennt Zielgruppe, Preis und nächsten Schritt |
| V4 | `/gibtsnicht` aufrufen | deutsche Fehlerseite mit Kontaktweg |
| V5 | Eigene Testanfrage über die Landing | erscheint binnen 30 Min im Ads-Manager |
| **alle** | `npm run build` | grün, 31/31 Seiten |

---

## 9. Verweise

| Datei | Rolle |
|---|---|
| `ANALYSE-creaDIG.md` | **Die Beweislage.** 93 Befunde, Priorisierung, Vertriebs-Assets, Locks |
| `KIZILELMA-creaDIG.md` §9 | **Die Satış-Omurga.** Angebot, Preisleiter, Positionierung, Kanäle |
| `creadig-TERMINAL-BACKLOG-5.md` | **Die Arbeit.** Pakete V1–V6, Teilschritt für Teilschritt |
| `creadig-TERMINAL-MASTER-PROMPT-4.md` | Architektur + Stil — **gültig, außer den zwei Aufhebungen in §2** |
| `creadig-TERMINAL-MASTER.md` | Design-DNA |
| `OMURGA.md` | Backbone, Master-Backlog |
