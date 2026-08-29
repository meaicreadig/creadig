# Control Center · Architektur (G.1)

> **Authority:** Spec · MP-G G.1 · Stand 29.08.2026
> **Umfang:** was heute steht. Was fehlt und warum, steht in `current-state.md`.

---

## Routen

| Route | Art | Zugang | Inhalt |
|---|---|---|---|
| `/admin` | dynamisch | Sitzung nötig | Materialstand — die einzige Ansicht mit echten Daten |
| `/admin/login` | dynamisch | offen (wenn eingerichtet) | Passwortfeld, sonst nichts |
| `POST /api/admin/session` | Route Handler | offen (wenn eingerichtet) | Anmelden — setzt das Cookie |
| `DELETE /api/admin/session` | Route Handler | offen | Abmelden — löscht das Cookie |

**Keine weiteren Routen.** Kein `/admin/leads`, kein `/admin/marketing`,
kein `/admin/customers`: MP-G §52 verbietet leere Zukunftsrouten, und G.0 hat
gezeigt, dass es für alle drei keine Datenquelle gibt.

### Warum `app/(admin)/`

Dieses Projekt hat **kein** `app/layout.tsx`. `(de)` und `(tr)` sind zwei
gleichrangige Wurzeln, damit jede ihr eigenes `<html lang>` setzen kann. Eine
dritte Wurzel braucht deshalb ebenfalls eine eigene Gruppe.

Inhaltlich ist das die richtige Trennung: Das Control Center ist keine
Sprachfassung der Website. Es lädt **keine** Markennavigation, **keinen**
Footer, **kein** Consent-Banner und **keine** Analytics — es misst nichts, es
wird benutzt.

---

## Zugang

### Warum keine Auth-Bibliothek

Ein Nutzer, keine Datenbank. Eine Auth-Bibliothek bringt Anbieter, Adapter und
Sitzungstabellen mit; die Sitzungstabelle bräuchte den Speicher, den es nicht
gibt. MP-G §69 verbietet genau diesen Überbau.

Stattdessen dasselbe Verfahren, das dieses Repo schon einmal richtig gelöst
hat (`lib/lead-guard.ts`): ein **signierter, ablaufender Wert**.

### Der Ablauf

```
Browser                       Server
   │
   │  POST /api/admin/session { password }
   ├──────────────────────────────►
   │                              Versuchsfenster (lead-guard, 10 / 10 min)
   │                              equal(password, ADMIN_PASSWORD)   zeitkonstant
   │                              session = "<ablauf>.<HMAC(ablauf)>"
   │  ◄──────────────────────────  Set-Cookie: cd_admin=…
   │                                 HttpOnly · SameSite=Strict · Secure · 8 h
   │
   │  GET /admin
   ├──────────────────────────────►  middleware.ts
   │                                 verifySession(cookie)
   │  ◄──────────────────────────  200 · oder 307 → /admin/login
```

### Die drei Antworten der Middleware

| Fall | Antwort | Warum |
|---|---|---|
| Env fehlt | **404** | Die Existenz wird nicht angekündigt. Kein Anmeldeformular, das verrät, dass hier etwas liegt. |
| Keine/ungültige Sitzung | 307 → `/admin/login` | — |
| Abgelaufen | 307 → `/admin/login?abgelaufen=1` | Der Mensch hat nichts falsch gemacht und soll das lesen |

### Cookie

| Attribut | Wert | Grund |
|---|---|---|
| `HttpOnly` | ja | Ein XSS auf der Marketing-Seite soll keine Admin-Sitzung mitnehmen |
| `SameSite` | `Strict` | Kein Versand bei fremder Verlinkung — damit erübrigen sich CSRF-Token |
| `Secure` | im Betrieb | lokal ohne TLS sonst nie gesetzt |
| `Path` | `/` | sonst erreicht das Cookie den Abmelde-Aufruf unter `/api/…` nicht |
| Laufzeit | 8 h | ein Arbeitstag |

### Reihenfolge bei der Prüfung

Erst die **Signatur**, dann die **Zeit**. Andersherum bekäme ein gefälschter
abgelaufener Wert dieselbe Antwort wie ein echter abgelaufener — und verriete
damit, dass die Fälschung erst an der Zeit scheiterte.

### Der Not-Aus

`ADMIN_SESSION_SECRET` ändern. Alle offenen Sitzungen sind sofort ungültig.

---

## Rollen

**Eine: der Owner.** Es gibt keine Rollentabelle, kein Rechtekonzept, keinen
zweiten Nutzer.

MP-G §29 sagt: Architektur vorbereiten, Komplexität erst bei realem Bedarf.
Vorbereitet ist sie dadurch, dass das Sitzungsformat `<wert>.<signatur>`
erweiterbar ist — ein Nutzername im signierten Teil, und der Rest bleibt.
Gebaut wird das mit der zweiten Person, nicht vorher.

---

## Geteilte Bausteine — was bewusst NICHT doppelt existiert

| Baustein | Datei | Wer nutzt es |
|---|---|---|
| HMAC-SHA-256, zeitkonstanter Vergleich | `lib/hmac.ts` | `lead-guard.ts` **und** `admin-session.ts` |
| Versuchsfenster je Adresse | `lib/lead-guard.ts` | `/api/lead` **und** `/api/admin/session` |
| Materialstand-Erhebung | `lib/material-status.ts` | `/status` **und** `/admin` |

**Alle drei waren vorher privat in genau einer Datei.** Sie wurden bei G.1
herausgezogen, nicht kopiert — bei Krypto ist die zweite Implementierung die
gefährlichere, und bei einem Lückenmelder sind zwei Kopien schlimmer als
keiner: Sie sagen irgendwann Verschiedenes, und man glaubt der, die man
gerade offen hat.

**Verhalten unverändert.** Der Umzug ist per Regressionstest belegt
(`acceptance.md`, Punkt 10).

---

## Gestaltung

Dieselben Token, dieselbe Kanten-Grammatik, dieselben Schriften wie die
Website — aber **engere Abstände und kleinere Typografie**. Die öffentliche
Seite muss überzeugen; diese hier muss man den ganzen Tag benutzen können.

Kein Theme-Umschalter: Die Systemeinstellung genügt, solange es einen Nutzer
gibt. Keine Charts: Es gibt nichts zu zeigen, das eine Entscheidung
verbessern würde (MP-G §44).

---

## Was G.1 NICHT gebaut hat

- kein Lead-Speicher (Owner-Entscheidung, siehe `current-state.md`)
- keine Today-Seite (keine Quelle)
- keine Sales-, Marketing-, Kunden-Ansicht (keine Quellen)
- kein Rollensystem
- keine Suche, kein Command-Menü (nichts zu durchsuchen)
- keine Benachrichtigungen
- keine Mutation — die Ansicht ist **read-only**
