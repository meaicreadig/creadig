# creaDIG · Conversion Acceptance

> **Authority:** Working Note (Prüfprotokoll) · MP-D.5 · Stand 29.08.2026
> **Prüfling:** Branch `feat/system-haus-site`, Build nach `cf13c0c`
> **Werkzeug:** Playwright + echtes Chrome, `next start` (Produktions-Build),
> Desktop 1440×900 und Mobil 390×844, DE und TR.
> **Ergebnis:** **12 von 12 Pflichtpfaden PASS** — nach einem Fix.

---

## Wie geprüft wurde

Zwei Messarten, bewusst getrennt:

| Art | Wofür | Wie |
|---|---|---|
| **Mit Stub** | Was der Browser TUT: Kette, Zustände, Payload | `POST /api/lead` abgefangen, Nutzlast gelesen, Antwort `ok:true` untergeschoben |
| **Ohne Stub** | Was die Route ANTWORTET: Token, Pflichtfelder, Fehlercodes | echte Aufrufe gegen die laufende Route |

Warum getrennt: Ohne Stub kann die Erfolgsansicht nie erscheinen (kein
Postfach in der lokalen Umgebung); ohne echte Aufrufe wäre die Route
ungeprüft. Beides zusammen deckt die Kette ab.

**Umgebung:** `LEAD_TOKEN_SECRET` und ein **absichtlich ungültiger**
`RESEND_API_KEY` gesetzt. Folge: Die Validierung läuft vollständig durch, die
Zustellung scheitert am Dummy-Schlüssel. Es wurde **keine einzige Mail
versendet** — das war der Zweck des ungültigen Schlüssels.

---

## Pflichtpfade

| # | Pfad | Ergebnis | Beleg |
|---|---|---|---|
| 1 | **Desktop DE** → `/betriebscheck` → 15 → Ergebnis → Formular → Lead | ✅ PASS | 15 Radiogruppen · genau **1** POST · `source=betriebscheck` `locale=de` · Zusammenfassung 1519 Zeichen · Referenz sichtbar |
| 2 | **Mobil DE** (390 px) | ✅ PASS | identisch, 1519 Zeichen |
| 3 | **Desktop TR** → `/tr/betriebscheck` | ✅ PASS | `locale=tr` · Zusammenfassung 1344 Zeichen · Fortschritt „15 sorudan 15 tanesi yanıtlandı" |
| 4 | **Mobil TR** | ✅ PASS | identisch |
| 5 | Hero „Projekt starten" → `/termin` → Schritt 2 | ✅ PASS | Navigation korrekt, Terminart wählbar, Kalenderschritt erreicht |
| 6 | WhatsApp / Kontakt-Direktwege | ✅ PASS **nach Fix** | siehe Befund 1 |
| 7 | Fehlerzustände (leere Pflichtfelder, Datenschutz) | ✅ PASS | 0 POST bei leerem Formular, 4 Felder markiert · 0 POST ohne Datenschutz-Haken, Haken markiert |
| 8 | Doppel-Absenden | ✅ PASS | drei Klicks in Folge → **1** POST (Knopf während des Sendens gesperrt) |
| 9 | Refresh / Zurück während des Checks | ✅ PASS (mit Befund 2) | kein Absturz, kein halbes Ergebnis; Antworten sind weg, Ergebnis-Knopf wieder gesperrt |
| 10 | 100/100 → kein falscher Engpass | ✅ PASS | „Kein Engpass" + „Keine Ebene fällt ab"; der Satz „Solange X nicht trägt…" erscheint **nicht** |
| 11 | Viele „Nicht" → Engpass + offene Punkte | ✅ PASS | Operations dreimal „Nicht" → „Operations → Automation" + „3 Stellen haben Sie selbst als offen benannt" |
| 11b | 0/100 (alles „Nicht") | ✅ PASS | Score 0 · „15 Stellen … offen" · korrekt **kein** Engpass (alle Ebenen gleich schwach) |
| 12 | Mail: Referenz, `source`, `locale` | ✅ PASS (Zustellung: siehe unten) | Honeypot `{ok:true}` · Token jünger als 2 s → `token_invalid` · ohne Datenschutz → `privacy_required` · kaputtes Token → `token_invalid` · Pflichtfelder → `invalid [name, message, email, phone]` · vollständig → `502 send_failed` |

---

## Befund 1 — behoben · WhatsApp sprach auf der türkischen Seite Deutsch

**Was war:** `WHATSAPP_LINK` in `lib/dictionary.ts` war eine **Konstante** mit
fest eingebautem deutschem Vortext:

```
https://wa.me/41765045879?text=Guten%20Tag%20creaDIG%2C%20ich%20interessiere%20mich%20f%C3%BCr%20ein%20Projekt.
```

Benutzt an drei Stellen — schwebender Knopf, Kopfleiste (Desktop + Menü),
Leistungsseite — und damit auf **jeder** Seite, auch auf `/tr/…`. Ein
türkischer Besucher öffnete WhatsApp und fand einen deutschen Satz im
Eingabefeld. Dazu war die Vorlesehilfe des schwebenden Knopfes fest
`„Per WhatsApp schreiben — +41 …"`, ebenfalls auf allen türkischen Seiten.

**Warum es durchgerutscht ist:** Der Termin-Assistent baut seine
WhatsApp-Nachricht korrekt aus `t.termin.*`. Nur diese eine Konstante konnte
das nicht — sie steht außerhalb jeder Sprache, weil sie ein Modulwert ist und
kein Aufruf. Das `SameShape`-Gate greift hier nicht: Es prüft das Wörterbuch,
nicht Konstanten daneben.

**Fix:** Aus der Konstante wird eine Funktion.

```ts
export function whatsappLink(locale: Locale): string
```

Der Vortext liegt jetzt im Wörterbuch (`contact.whatsappIntro`, DE + TR), die
Vorlesehilfe ebenfalls (`contact.whatsappAction`). Drei Aufrufstellen
umgestellt. **Verstoß gegen Prinzip 06** („Zwei Sprachen, eine Qualität") —
darum Fix und nicht Notiz.

**Nachgeprüft:**

| | |
|---|---|
| DE | „Guten Tag creaDIG, ich interessiere mich für ein Projekt." |
| TR | „Merhaba creaDIG, bir proje hakkında bilgi almak istiyorum." |
| Vorlesehilfe TR | „WhatsApp'tan yazın — +41 76 504 58 79" |

---

## Befund 2 — offen (Owner-Entscheidung) · Antworten überleben kein Neuladen

**Was passiert:** Wer fünfzehn Fragen beantwortet und die Seite neu lädt oder
zurück navigiert, findet ein leeres Formular. Kein Absturz, kein halbes
Ergebnis — aber die Arbeit ist weg.

**Warum das kein Fix in dieser Stufe ist:** Antworten zu speichern ist ein
**Feature**, und MP-D.5 verbietet Features. Außerdem ist es nicht neutral:
Fünfzehn Antworten über den eigenen Betrieb in `localStorage` sind Daten auf
einem fremden Gerät, und das gehört in die Datenschutzerklärung, bevor es in
den Code gehört.

**Die ehrliche Zahl:** Zwei Minuten Arbeit gehen bei jedem versehentlichen
Neuladen verloren. Auf Mobil, wo ein Zurück-Wisch schnell passiert, ist das
der wahrscheinlichste Abbruchgrund der ganzen Kette.

**Vorschlag für MP-E oder später** (nicht gebaut): Antworten in
`sessionStorage`, Lebensdauer nur bis zum Schließen des Tabs, mit einem Satz
in der Datenschutzerklärung. Owner entscheidet.

---

## Befund 3 — kein Defekt, bewusst so · kein `tel:`-Link

Auf `/kontakt` gibt es keinen anklickbaren Telefon-Link. Das ist kein
Versehen: `lib/site-data.ts` kennt unter `contact` nur `whatsapp`, `email` und
die Adresse — es gibt keine veröffentlichte Telefonnummer außer der
WhatsApp-Nummer.

**Zur Kenntnis, nicht als Fehler:** Die Zielgruppe Handwerk telefoniert. Wenn
der Owner will, dass die WhatsApp-Nummer auch als `tel:` anklickbar ist, ist
das eine Owner-Entscheidung über Erreichbarkeit — kein QA-Befund.

---

## Was hier NICHT geprüft werden konnte

| Punkt | Warum | Was stattdessen belegt ist |
|---|---|---|
| **Tatsächliche Mail-Zustellung** | `sendMail()` ruft `https://api.resend.com/emails` fest auf; ohne echten Schlüssel geht keine Mail raus, und mit echtem Schlüssel würde diese Prüfung echte Mails verschicken | Die Route läuft **vollständig** bis zum Versandschritt: Token, Rate-Limit, Pflichtfelder, Datenschutz, Referenz-Erzeugung — und scheitert erst am Dummy-Schlüssel (`502 send_failed`) |
| **Betreff und Klartext der internen Mail** | dito | Im Code belegt: `Betriebscheck ${reference} — ${name}`, Zeilen `Referenz`, `ID`, `Sprache`, `Herkunft`, optional `Kampagne` |
| **Eingangsbestätigung an den Absender** | dito | Zweig `kind = "kontakt"` für `source=betriebscheck`, Texte DE/TR vorhanden |

**Vor dem Livegang zu prüfen (Owner, mit echten Env-Werten):** eine
Testanfrage über `/betriebscheck` absenden und im Postfach nachsehen, dass
Betreff, Referenz `CD-YYMMDD-XXXX`, `Herkunft: betriebscheck` und die
Sprachzeile stimmen. Dafür gibt es `/api/selftest` (braucht
`SELFTEST_SECRET`).

---

## Gates zum Zeitpunkt der Abnahme

```
npx tsc --noEmit      ✅
npx eslint .          ✅
npm run build         ✅  Function-Gate · Sterne-Gate · Paritäts-Gate
npm run a11y          ✅  112 Durchläufe, 0 Verletzungen
```

Zusätzlich für `/betriebscheck` separat gefahren: axe über DE und TR, hell und
dunkel, Desktop und Mobil, mit vollständig ausgefülltem Formular —
**0 Verletzungen**, 15 Radiogruppen korrekt ausgezeichnet.

---

## Bekannte Testinfrastruktur-Schwäche

`npm run a11y` und `npm run shots` verlieren gelegentlich ihren `next start`
mitten im Lauf (Exit 0, kein Signal, kein Log — `stdio: "ignore"` verschluckt
die Ausgabe). Reproduziert **auch ohne** aktuelle Änderungen. Das
Abnahme-Skript dieser Runde startet den Server bei Bedarf selbst neu; die
Projekt-Skripte tun das nicht.

→ Terminal-Backlog: Server-Logs nicht verschlucken, bei
`ERR_CONNECTION_REFUSED` einmal neu starten statt den Lauf zu verlieren.

---

## Status MP-C

**OPEN / MATERIAL-BLOCKED.** Diese Abnahme hat keinen Proof veröffentlicht und
keinen erfunden. `PRODUCT_SCREENS` und `CLIENT_LOGOS` bleiben leer,
`ProductMaturity` bleibt `null`.
