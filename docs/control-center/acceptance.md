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
