# Control Center · Acceptance G.1

> **Authority:** Acceptance (Prüfprotokoll) · MP-G G.1 · Stand 29.08.2026
> **Werkzeug:** Produktions-Build (`next start`), echte HTTP-Aufrufe für die
> Zugangsprüfung, Playwright + echtes Chrome für die Oberfläche.
> **Ergebnis:** **11 von 11 PASS.**

---

## Zugang und Sicherheit

| # | Prüfpunkt | Ergebnis | Beleg |
|---|---|---|---|
| 1 | **Ohne Env existiert das Control Center nicht** | ✅ | `/admin` = 404 · `/admin/login` = 404 · `POST /api/admin/session` = 404 · **öffentliche Startseite unberührt (200)** |
| 2 | Ohne Sitzung → Anmeldung | ✅ | 307 → `/admin/login` |
| 3 | Falsches Passwort | ✅ | 401, **kein** `Set-Cookie` |
| 4 | Richtiges Passwort setzt eine sichere Sitzung | ✅ | 200 · `HttpOnly` · `SameSite=Strict` · `Secure` · `Path=/` · `Max-Age=28800` (8 h) |
| 5 | Mit Sitzung lädt die Seite echte Daten | ✅ | 200 · „Materialstand" · beide Abschnitte · `noindex` im HTML |
| 6 | Manipuliertes Cookie wird abgewiesen | ✅ | ein Zeichen der Signatur getauscht → 307 → `/admin/login` |
| 7 | Abgelaufene, **korrekt signierte** Sitzung | ✅ | Cookie mit gültiger Signatur auf einen Zeitpunkt in der Vergangenheit → 307 → `/admin/login?abgelaufen=1` |
| 8 | Abmelden löscht das Cookie | ✅ | `cd_admin=; Path=/; Max-Age=0` — und danach führt `/admin` wieder zur Anmeldung |
| 9 | Versuchsfenster greift | ✅ | 14 falsche Versuche → **6 mit 429 abgewiesen** |

**Zu Punkt 7:** Das abgelaufene Cookie wurde mit demselben Geheimnis
**korrekt signiert** erzeugt. Damit ist belegt, dass die Ablaufprüfung
tatsächlich greift und nicht nur die Signaturprüfung „zufällig" fehlschlägt.

---

## Regression

| # | Prüfpunkt | Ergebnis | Beleg |
|---|---|---|---|
| 10 | Formular-Token nach dem HMAC-Umzug | ✅ | `GET /api/lead` liefert ein Token · vollständige Anfrage läuft durch die ganze Validierung und endet bei `502 send_failed` (Dummy-Schlüssel, absichtlich) |
| — | Öffentliche a11y-Suite | ✅ | `npm run a11y` — **112 Durchläufe, 0 Verletzungen** |

Punkt 10 ist der wichtigste Test dieser Runde: `lib/hmac.ts` wurde aus
`lead-guard.ts` herausgezogen. Wäre dabei etwas verrutscht, hätte **jedes**
Formular der Website aufgehört zu funktionieren.

---

## Oberfläche

| # | Prüfpunkt | Ergebnis | Beleg |
|---|---|---|---|
| 11 | Umleitung, Anmeldung **nur mit Tastatur**, a11y | ✅ | Desktop 1440 hell **und** Mobil 390 dunkel: Umleitung greift, Anmeldung ohne Maus (Feld hat `autoFocus`, Enter sendet), H1 „Materialstand", beide Abschnitte, **47 Einträge aus echten Daten** · axe Anmeldung 0 · axe Control Center 0 |
| — | Abmelden über die Oberfläche | ✅ | Knopf → `/admin/login`, danach führt `/admin` wieder zur Anmeldung |

**Geprüft in beiden Erscheinungsbildern und beiden Fenstergrößen** — die
Navigation liegt auf Mobil oben, auf Desktop links, der Abmelden-Knopf
erscheint jeweils genau einmal.

---

## Nachtrag G.1.1 — Gruppierung

Die erste Fassung zeigte **43 gleichrangige Zeilen**. Das beantwortet die
Frage nicht, für die die Ansicht gebaut ist („Was braucht heute
Aufmerksamkeit?") — es beantwortet nur „es ist viel".

Die Ordnung war schon da: `collect()` erhebt in zehn kommentargetrennten
Abschnitten. Sie wurde zu Daten gemacht (`ITEM_GROUPS`, `Item.group`) —
**erfunden ist daran nichts**, Reihenfolge und Zuschnitte sind dieselben.

| Prüfpunkt | Ergebnis |
|---|---|
| Gruppen erscheinen | ✅ 10 · Belege 2 · Systeme 3 · Produkt-Aufnahmen 4 · Produkt-Tiefe 4 · Referenzen 6 · Leistungs-Tiefe 7 · Fälle 3 · Rechtliches 3 · Betrieb 5 · Entscheidungen 6 |
| **Kein Punkt geht verloren** | ✅ Summe der Gruppen = **43** = Zähler in der Kopfzeile |
| Leere Gruppe erscheint nicht | ✅ (keine Überschrift über nichts) |
| a11y nach der Änderung | ✅ Desktop hell + Mobil dunkel, je 0 Verletzungen |

### Zwei Anweisungstexte korrigiert

An zwei Stellen stand noch **„Screenshots aus dem laufenden System"** — genau
die Anweisung, die der Canon seit MP-C.1 verbietet (auf einem Produktivbild
stehen Kundennamen und Beträge). Beide Stellen sind das, was der Owner liest,
wenn er nachsieht, was er liefern soll:

| Datei | Jetzt |
|---|---|
| `lib/material-status.ts` | „echte Oberfläche mit Demodaten — Demo-Instanz, Staging oder lokale Kopie, nie Produktivdaten" |
| `lib/product-media.ts` | dieselbe Formulierung im Owner-Abschnitt |

Damit sagen Website, Control Center, README und Canon dasselbe.

---

## Gates

```
npx tsc --noEmit   ✅
npx eslint .       ✅
npm run build      ✅  Function-Gate · Sterne-Gate · Paritäts-Gate
npm run a11y       ✅  112 / 112
```

Neue Routen im Build: `ƒ /admin` (575 B) · `ƒ /admin/login` (1,11 kB) ·
`ƒ /api/admin/session` · `ƒ Middleware` (34,3 kB).

---

## Was NICHT geprüft wurde — und warum

| Punkt | Grund |
|---|---|
| Verhalten hinter TLS (`Secure`-Cookie) | lokal kein HTTPS. Das Attribut wird gesetzt (`NODE_ENV === "production"`), die Wirkung ist erst auf der Domain zu sehen. |
| Verteiltes Versuchsfenster | Das Fenster liegt im Arbeitsspeicher und gilt je Instanz — so gebaut, so dokumentiert (`current-state.md`). Gegen ein Skript von einer Adresse hilft es sofort. |
| Zwei gleichzeitige Sitzungen | Es gibt einen Nutzer. |
| Rollen | Es gibt eine. |

**Keine PASS-Aussage ohne Test.** Jede Zeile oben stammt aus einem Lauf, nicht
aus dem Quelltext.


---

# Delivery Run · 30.08.2026

> **Werkzeug:** echte HTTP-Aufrufe gegen einen laufenden Server, Playwright +
> echtes Chrome für Formulare, axe für die Barrierefreiheit.
> **Speicher:** `LEAD_STORE=file` — ein Entwicklungs-Adapter, aber ein
> **echter** Lese-, Schreib- und Mutationspfad. Kein Datensatz von Hand
> eingesetzt: jeder Lead ist durch `/api/lead` gegangen.

## Zugang (A.6, zuvor offen)

| Prüfpunkt | Ergebnis | Beleg |
|---|---|---|
| `/admin` auf dem Preview | ✅ | **307 → `/admin/login`** statt leerem 404 |
| Anmeldeseite | ✅ | 200, 11 365 B, H1 „Control Center", Passwortfeld |

Damit ist der Befund vom Vormittag aufgelöst: die Env war im Preview-Scope
unwirksam, nicht falsch. Nach dem Redeploy greift die Middleware wie gebaut.

## Schreibweg und Doppel-Erkennung

| # | Prüfpunkt | Ergebnis | Beleg |
|---|---|---|---|
| 1 | Lead wird **vor** der Mail gespeichert | ✅ | Mail scheitert (502 `send_failed`, absichtlich ungültiger Schlüssel), Lead liegt trotzdem im Speicher |
| 2 | **Gleiches** Absende-Token → **ein** Datensatz | ✅ | `[lead] created CD-260830-efcc` danach `[lead] updated CD-260830-efcc` |
| 3 | **Neues** Token → neuer Datensatz | ✅ | `[lead] created CD-260830-3aa0` |
| 4 | Datei enthält **2** Sätze, nicht 3 | ✅ | zwei Absendungen + ein Wiederholversuch |
| 5 | `memory` verweigert in Produktion | ✅ | `next start`: Alarm `lead-store-memory-in-production`, **nichts** gespeichert |

Punkt 5 ist der wichtigste: die Sperre ist nicht behauptet, sie ist ausgelöst
worden.

## Lesepfad

| # | Prüfpunkt | Ergebnis |
|---|---|---|
| 6 | Liste zeigt beide Anfragen mit Nummer, Betrieb, Herkunft, Status | ✅ |
| 7 | Suche `?q=Yilmaz` — ein Treffer, der andere nicht | ✅ |
| 8 | Filter `?status=won` — „Keine Anfrage passt zu dieser Suche" | ✅ |
| 9 | Detail zeigt Betriebscheck als **Text** mit der Einordnung „Reifegrad-Diagnose" | ✅ |
| 10 | Unbekannte ID → **404** (nicht leere Seite) | ✅ |
| 11 | Ohne Sitzung → `/admin/login` | ✅ |
| 12 | Vertrieb erscheint nur in der Navigation, wenn ein Speicher da ist | ✅ |

## Mutationen (Playwright, echtes Chrome) — **11 / 11**

| # | Prüfpunkt | Ergebnis | Beleg |
|---|---|---|---|
| 13 | Anmeldung **nur mit Tastatur** | ✅ | tippen, Enter |
| 14 | Status ändern → Datei | ✅ | `qualified` |
| 15 | Status nach **Neuladen** identisch | ✅ | Feldwert `qualified` |
| 16 | Nächster Schritt + Datum → Datei | ✅ | „Rueckruf mit Terminvorschlag" / 2026-09-04 |
| 17 | Schritt nach **Neuladen** identisch | ✅ | |
| 18 | Liste zeigt Schritt und neuen Status | ✅ | |
| 19 | `lost` mit Grund | ✅ | „Budget verschoben" |
| 20 | Grund **fällt weg** bei Statuswechsel | ✅ | `contacted` → `lostReason: null` |
| 21 | Leeres Feld löscht Schritt **und** Datum | ✅ | beide `null` |

Punkte 20 und 21 sind die Invarianten, die man sonst erst nach Monaten
bemerkt: ein Verlustgrund an einer gewonnenen Anfrage, ein überfälliges
Datum ohne Aufgabe.

## Barrierefreiheit

| Fläche | desktop/hell | mobil/dunkel |
|---|---|---|
| Anmeldung · Heute · Materialstand · Vertrieb · Anfrage | 0 Verletzungen | 0 Verletzungen |

**10 Durchläufe, 0 Verletzungen** (axe, WCAG 2.1 AA).
Öffentliche Suite unverändert: **112 / 112**.

## Gates

```
npx tsc --noEmit   ✅
npx eslint .       ✅
npm run build      ✅  Function-Gate · Sterne-Gate · Paritaets-Gate
npm run a11y       ✅  112 / 112
```

## Sprach-Refactor ohne Verhaltensänderung

`lib/routes.ts` leitet jetzt aus `locales` ab statt aus fest verdrahtetem
`TR_PREFIX`. Geprüft gegen den **committeten** Preview-Stand, vier Adressen,
Zeichen für Zeichen identisch:

| Adresse | Ergebnis |
|---|---|
| `/` · `/leistungen` · `/tr/leistungen` · `/tr/erisilebilirlik` | hreflang-Block **identisch** |
| `/tr/barrierefreiheit` | 404 (Slug-Ausnahme unverändert) |

## Was NICHT geprüft wurde

| Punkt | Grund |
|---|---|
| Produktions-Persistenz | Es gibt keinen Produktions-Adapter. Der Datei-Adapter beweist Lesepfad, Mutationen und Fehlerzustände — **nicht** Neon. |
| Verhalten unter Last / gleichzeitige Zugriffe | Der Datei-Adapter kennt kein Sperrverfahren. Für einen Nutzer irrelevant, für Produktion verboten — deshalb dort abgelehnt. |
| EN / AR | Existieren nicht. |
