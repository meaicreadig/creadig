# creaDIG — vor dem Live-Flip nötig

*Stand 23.08.2026 · nach Master-Prompt 7 (Barrierefreiheit als Einstiegsleistung, Stufen 1–4) · Branch `feat/system-haus-site`*

Die Seite ist gebaut und geprüft. Was hier steht, kann **kein Entwickler erledigen** —
es sind Entscheidungen, Zugangsdaten und Inhalte des Inhabers. Abschnitt A blockiert
den Livegang; B ist am Flip-Tag zu tun; C macht die Seite wahr, hält sie aber nicht auf.

---

## A · HART — ohne das kein Livegang

### A1 Impressum vervollständigen (SEC-1)
Zwei Felder stehen als **markierte Platzhalter** auf der Seite. Sie sind sichtbar
gekennzeichnet, damit die Seite vollständig rendert, ohne etwas zu behaupten —
aber ein Impressum mit Platzhaltern ist abmahnfähig.

Datei `lib/site-data.ts` → `imprintDetails`:

| Feld | Was hinein muss |
|---|---|
| `vatId` **oder** `smallBusiness: true` | USt-IdNr. nach § 27 a UStG **oder** Kleinunternehmer nach § 19 UStG. Nie beides. |
| `taxStatusPending` | auf `false`, sobald eines von beiden steht |
| `phone` | deutsche Rufnummer, z. B. `"+49 541 …"` |
| `phonePending` | auf `false`, sobald die Nummer steht |

Rechtsform (`Einzelunternehmen`) und § 18 Abs. 2 MStV (`Muhammed Emin Akyol`)
liegen bereits vor. Sobald alle Pflichtfelder gefüllt sind, verschwindet der
Pending-Block von selbst.

**Kontrolle:** `/status?key=…` zeigt „Impressum vollständig" unter *Steht*.

### A2 Auftragsverarbeitungsverträge bestätigen (SEC-2)
Zwei Dienstleister verarbeiten Daten in unserem Auftrag, beide in den USA. Die
Datenschutzerklärung nennt sie mit Namen — und kennzeichnet sie derzeit sichtbar
als *„Bestätigung durch den Inhaber offen"*, weil niemand behaupten darf, ein
Vertrag bestehe, den er nicht abgelegt hat.

1. **Vercel Inc.** — DPA unter <https://vercel.com/legal/dpa> im Dashboard bestätigen und ablegen.
2. **Resend Inc.** — DPA unter <https://resend.com/legal/dpa> ebenso.
3. Danach in `lib/site-data.ts` → `processors[].dpaConfirmed` je Eintrag auf `true`.

Seit R-1 führt die Liste die Dienste einzeln auf — bei Vercel: Hosting & CDN,
Web Analytics, Speed Insights. Wer den Vertrag prüft, weiß damit, wofür.

### A3 Umgebungsvariablen bei Vercel setzen
**Ohne die ersten beiden kommt keine einzige Anfrage an.** Die Lead-Route
antwortet dann mit 503, und das Formular zeigt ehrlich die anderen Wege statt
einen Erfolg zu melden, den es nicht gab — aber der Lead ist trotzdem weg.

| Variable | Pflicht | Wert |
|---|---|---|
| `RESEND_API_KEY` | ja | API-Schlüssel aus dem Resend-Dashboard |
| `LEAD_FROM` | ja | Absender einer bei Resend **verifizierten** Domain, z. B. `creaDIG <anfrage@creadig.de>` |
| `LEAD_TO` | nein | `info@creadig.de` (Vorgabewert) |
| `NEXT_PUBLIC_SITE_URL` | ja | `https://creadig.de` — steuert Canonicals, hreflang, Sitemap **und die Adresse des Vorschaubildes** |
| `LEAD_TOKEN_SECRET` | empfohlen | langes Zufallswort (`openssl rand -base64 32`). Ohne den Wert wird der Resend-Schlüssel benutzt — dann macht jeder Schlüsseltausch offene Formulare ungültig. |
| `SELFTEST_SECRET` | empfohlen | langes Zufallswort. Schaltet `/api/selftest` **und** `/status` frei. Ohne den Wert sind beide im Betrieb abgeschaltet (503 / 404). |
| `ALERT_WEBHOOK_URL` | optional | URL, die `{"text": "…"}` entgegennimmt (Slack/Discord). Ohne sie bleiben Alarme `[alarm]`-Zeilen im Vercel-Log — die sieht nur, wer hinsieht. |
| `CSP_ENFORCE` | später | `1` stellt die vollständige CSP scharf. **Erst nach B2.** Wirkt nur nach einem neuen Build. |

### A4 Domain verbinden
1. `creadig.de` im Vercel-Projekt hinterlegen, DNS beim Registrar umstellen.
2. Bei **Resend** dieselbe Domain verifizieren (SPF und DKIM) — sonst landet die
   Bestätigungsmail an den Anfragenden im Spam oder wird abgelehnt.
3. Erst danach `NEXT_PUBLIC_SITE_URL` setzen und **neu deployen**.

### A5 Copy-Freigaben — erledigt (23.08.2026)
- Preisleiter **2.400 → 3.900 netto + 149/Monat** steht; die obere Öffnung
  „größerer Umfang: auf Anfrage" ist gebaut (BF-9). Kein zweiter Preis.
- Reaktionszusage **„innerhalb von zwei Werktagen" / „iki iş günü içinde"** —
  vom Inhaber freigegeben, überall gesetzt (BF-8).
- Termin-Assistent fragt Wunschzeiten und bucht nichts (BF-1) — Copy freigegeben.
- **Barrierefreiheit (Master-Prompt 7):** Prüfung **1.500 € Festpreis**, Behebung
  **2.000–4.000 € als Angebot nach der Prüfung**, Betreuung **149 €/Monat** —
  vom Inhaber am 23.08.2026 entschieden und gebaut (BF-A10). Keine zweite
  Preiswelt: Das beworbene Angebot bleibt das Website-Paket.

### A6 Neue Copy zur Freigabe (Master-Prompt 7)
Alles Folgende ist entworfen und gebaut, aber **vom Inhaber noch nicht gelesen**.
Es steht auf dem Branch, nicht live — nichts davon ist unumkehrbar.

| Was | Wo | Wozu der Blick |
|---|---|---|
| Leistungsseite Barrierefreiheit, DE + TR | `lib/service-pages.ts` → `barrierefreiheit-website` | H1, Einleitung, „Was wir tun — und was nicht", Preisleiter |
| Kurz-Check-Formular, DE + TR | `lib/dictionary.ts` → `quickCheck` | Zusage „drei konkrete Punkte", Grenze davor |
| Bestätigungsmail Kurz-Check, DE + TR | `app/api/lead/route.ts` → `CONFIRMATION[*].kurzcheck` | Der Text, den jeder Anfragende garantiert liest |
| Insight „Wir haben unsere eigene Seite geprüft" | `lib/insights.ts` | Der erste veröffentlichte Artikel überhaupt |
| Neue Zeile im Website-Paket | `lib/dictionary.ts` → `packages.items.website.includes` | „Barrierefreiheit nach WCAG 2.1 AA eingebaut statt nachgerüstet" |
| Neue Zeile im Betreuungsumfang | `lib/site-data.ts` → `retainer.includes` | „Barrierefreiheits-Lauf bei jeder Änderung, einmal im Jahr von Hand" — eine Zusage, die im Betrieb eingelöst werden muss |

---

## B · AM FLIP-TAG UND KURZ DANACH

### B1 Messung im Vercel-Projekt aktivieren
Web Analytics und Speed Insights sind verdrahtet und hängen an der Einwilligung —
sie müssen im Vercel-Dashboard zusätzlich für das Projekt eingeschaltet werden,
sonst kommen keine Daten an.

### B2 Content-Security-Policy scharf schalten (BF-7)
Heute zweistufig: vier Direktiven sind sofort scharf, die vollständige Policy
läuft als Bericht.

1. Nach ein paar Tagen echtem Verkehr die Vercel-Runtime-Logs nach `[csp]` filtern.
2. Bleiben sie leer: `CSP_ENFORCE=1` setzen und **neu deployen** (die Kopfzeilen
   entstehen beim Bauen).
3. Melden die Logs etwas, erst die Ursache klären — nicht die Policy aufweichen.
4. Ab dann alarmiert jeder Verstoß, der wirklich geblockt hat (T-2).

*Der Nonce-Weg ist bewusst nicht gegangen — Begründung mit Messung in
`next.config.ts`. Kurz: Er würde alle 53 statischen Seiten zu Funktionen machen.*

### B3 Zustell-Selbsttest scharf stellen (BF-8)
Der Code läuft, die **Aktivierung fehlt**. Ohne sie merkt ein stiller Ausfall
der Lead-Route niemand.

1. `SELFTEST_SECRET` setzen (siehe A3).
2. Einen Aufruf einrichten, der regelmäßig prüft — Vercel Cron, ein Uptime-Dienst
   oder ein Cron auf einem eigenen Rechner:
   `curl -fsS -H "x-selftest-key: $SELFTEST_SECRET" https://creadig.de/api/selftest`
3. Der Dienst muss auf **HTTP 503** anschlagen. Das ist der Alarm.
4. Einmal von Hand mit `?send=1` laufen lassen und prüfen, ob die Testmail ankommt —
   inklusive Blick in den Spam-Ordner.

### B4 Erster echter Teilen-Test (T-1)
`https://creadig.de/leistungen` und `https://creadig.de/tr/leistungen` in WhatsApp
an sich selbst schicken. Es muss das Vorschaubild erscheinen — deutsch bzw.
türkisch. Geht erst nach A4, weil die Bildadresse aus `NEXT_PUBLIC_SITE_URL` gebaut wird.

### B5 Google Search Console
1. Property für `creadig.de` anlegen.
2. `https://creadig.de/sitemap.xml` einreichen (beide Sprachen).
3. Nach ein bis zwei Wochen den hreflang-Bericht prüfen: Deutsch und Türkisch
   müssen wechselseitig aufeinander zeigen.

### B6 CI beobachten
`.github/workflows/ci.yml` läuft bei jedem Push: Typen, Regeln, Build
(Function-Gate, Sterne-Gate, **Paritäts-Gate DE/TR**), **25 Rauchtests** gegen
den gebauten Server und seit BF-A12 **96 axe-Durchläufe** über 24 Routen. Ein
roter Lauf ist kein Formfehler — er bedeutet, dass eine Seite nicht antwortet,
ein Schutz gefallen ist, eine Sprachfassung auseinanderläuft oder eine Barriere
zurückgekommen ist.

**Neu und wichtig:** Seit wir Barrierefreiheit verkaufen, ist ein axe-Verstoß auf
der eigenen Seite kein Schönheitsfehler, sondern ein Widerspruch zum Angebot.
Der Schritt darf nicht „vorübergehend" abgeschaltet werden.

### B7 Erster echter Kurz-Check (BF-A8)
Nach A3/A4 einmal über das Formular auf `/leistungen/barrierefreiheit-website`
eine Anfrage mit der eigenen Adresse schicken und prüfen:
1. Die Anfrage kommt an, Betreff enthält den Hostnamen der eingegebenen Seite.
2. Die Bestätigungsmail trägt die **Kurz-Check-Fassung** (nicht die allgemeine)
   und nennt die Grenze: drei Punkte, keine vollständige Prüfung, keine
   rechtliche Bewertung.
3. Die Antwort binnen zwei Werktagen ist ab dann eine Zusage, die gehalten
   werden muss — der Kurz-Check ist Handarbeit, nicht Automatik.

---

## C · MACHT DIE SEITE WAHR (kein Blocker)

Diese Liste steht **auch als Innenansicht im Betrieb**: `/status?key=$SELFTEST_SECRET`
leitet sie aus denselben Daten ab, aus denen die Seite gebaut wird — inklusive
dessen, was solange nicht rendert.

| Was | Wohin | Warum es zählt |
|---|---|---|
| Echte meAI-Oberflächen (C-1) | `public/works/products/meai/` | Ohne sie zeigt die Produktseite keine Screenshots. Kein Mockup als Beweis. |
| NV SWISS & maqam: schriftliche Freigabe + je ein Satz Aufgabe/Ergebnis (C-2) | `clientWorks[].approvalOnFile` / `.approvedSentence` | Die einzigen zwei Kundenwerke. Ohne Freigabe bleibt die Nennung dünn — und ohne den einen Satz sagt die Karte nicht, was wir dort gelöst haben. |
| 3–5 echte Google-Bewertungen | `reviews` in `lib/site-data.ts` | Ohne sie kein `aggregateRating` — und das Sterne-Gate im Build lässt keinen Ersatz zu. |
| Weitere Fachartikel (S-1) | `lib/insights.ts` | Der erste steht seit BF-A9 („Wir haben unsere eigene Seite geprüft", DE + TR) — `/insights` ist damit indexierbar. **V-2 (Lead-Magnet) ist nicht mehr blockiert**, braucht aber einen zweiten Artikel, damit die Liste keine Ein-Zeilen-Liste ist. |
| maqam: Umfang, Jahr, Region, Link | `clientWorks` | Steht heute ohne Link und ohne Bild in der Werkschau. |
| Jahreszahlen der Arbeiten | `work.year` | Im Register steht sonst nichts. Ein geschätztes Jahr wäre erfunden. |
| Weitere Kunden-Logos | `public/brand/clients/` | Sonst Monogramm statt Logo. |
| Türkische Projekttexte | `work.what`, `work.sector` | Auf `/tr/arbeiten/…` steht der Projektsatz heute deutsch unter türkischer Oberfläche. |
| Social-Profile | `socialProfiles` | Nur, wenn sie existieren, uns gehören und gepflegt werden. |

---

## Was zuletzt geprüft wurde (23.08.2026, nach Stufe 4)

**Automatisch, bei jedem Build und in der CI**
- `npm run build` aus leerem `.next`: grün.
- Function-Gate: größte Function 23,5 MB von 200 MB.
- Sterne-Gate: 43 Dokumente, **0** mit `AggregateRating`. Gegenprobe gefahren —
  mit einem eingesetzten Vorgabewert bricht der Build ab.
- `tsc --noEmit` fehlerfrei, `eslint` ohne Befund.
- `npm run smoke`: **17 von 17** Prüfungen. Darunter acht Seiten (inkl. Detailseiten
  und türkischem Baum) auf 200, beide Fehlerseiten auf 404, Vorschaubild auf
  `image/png`, abgeschalteter Selbsttest auf 503 und die drei Hürden der
  Lead-Route. Gegenprobe: Ohne den Honeypot fällt der Test (502 statt `ok`).

**Von Hand gegen `next start` gemessen**
- Lead-Route: ohne Token, mit gefälschtem Token und bei Absenden unter zwei
  Sekunden geht nichts raus; ab der sechsten Anfrage 429; legitimes Absenden
  läuft durch.
- `og:image` auf **17 Adressen** geprüft — alle tragen Bild, Alt-Text und
  Twitter-Karte, deutsche `/og/de.png`, türkische `/og/tr.png`.
- Speed Insights lädt **ohne Einwilligung nicht** (keine Zeile `speed-insights`,
  `va.vercel-scripts` oder `_vercel/insights` auf `/`, `/tr`, `/datenschutz`).
- `/status`: ohne Schlüssel 404, mit falschem 404, mit richtigem 200.
- Alarme (T-2): erster Fehlversand meldet an Log **und** Webhook, der zweite wird
  gedrosselt; ein geblockter CSP-Verstoß meldet, derselbe aus einer
  Browser-Erweiterung nicht.
- CSP mit `CSP_ENFORCE=1` gebaut und in Chrome über `/`, `/tr`, `/leistungen`,
  `/termin`, `/kontakt` gefahren: **null Verstöße**.

**Visuell — der Punkt, der beim letzten Mal offenblieb**
- `npm run shots` erzeugt **56 Aufnahmen**: 14 Seiten (die sieben aus D-1, dazu
  Termin-Assistent inkl. Schritt 2, Leistungs-Detailseite und 404 — jeweils in
  beiden Sprachen), je hell/dunkel und mobil/Desktop. Ordner `screenshots/`,
  nicht im Repo.
- Der Satz hat dabei zwei Fehler gefunden, die keine Textprüfung gefunden hätte:
  die doppelte Fußzeile auf der 404-Seite und — schwerwiegend — dass die Seite
  mit aktiviertem „Bewegung reduzieren" über weite Strecken **leer** war.
  Beides behoben, beides nachgemessen.

---

## Nachtrag: was nach Master-Prompt 7 geprüft wurde (23.08.2026)

**Automatisch**
- `npm run build` grün, Function-Gate 23,5 MB von 200 MB, Sterne-Gate 0 von 47.
- **Paritäts-Gate (neu, BF-A7):** sechs Leistungsseiten, DE gegen TR — gleiche
  Abschnitte, gleiche Aufzählungspunkte, Textmenge im Verhältnis 0,88–0,95.
  Gegenprobe: eine entfernte Zeile auf der türkischen Seite bricht den Build.
- `npm run smoke`: **25 von 25**. Neu darin: beide Sprachfassungen der
  Leistungsseite, `/insights` und der Artikel in beiden Sprachen, dazu drei
  Prüfungen am Kurz-Check (ohne Adresse abgelehnt, unbrauchbare Adresse
  abgelehnt, mit Adresse bis zum Versand durchgelaufen).
- `npm run a11y`: **96 Durchläufe** über 24 Routen, keine Verletzung. Zwei
  Gegenproben ausgelöst und zurückgenommen — Kontrast auf 2,39 : 1 (axe meldet),
  Feldbeschriftung entfernt (die eigene Regel meldet; **axe meldet das nicht**,
  weil der Platzhalter als Name gilt).
- `tsc --noEmit` und `eslint` ohne Befund.

**Von Hand**
- Gebautes HTML beider Sprachfassungen der neuen Seite gegen die Verbotsliste
  gefiltert: kein „rechtssicher", kein „garantiert", keine Bußgeldzahl, keine
  Abmahnung, keine Behörde, keine Frist als Druckmittel. Genau **ein** Etikett
  „Festpreis" am Preis.
- `npm run shots`: **84 Aufnahmen**, darunter die neue Leistungsseite und der
  Artikel in beiden Sprachen, je hell/dunkel und mobil/Desktop.

**Was weiterhin offen ist:** die Punkte in A und C. Alles Technische aus dem
v0-Review und aus Master-Prompt 7 ist abgearbeitet.
