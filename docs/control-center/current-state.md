# creaDIG Control Center · G.0 — Current State

> **Authority:** Working Note (Bestandsaufnahme) · MP-G · Stand 29.08.2026
> **Regel dieses Dokuments:** Was nicht existiert, steht als **MISSING** da.
> Kein Pfeil wird gezeichnet, weil er logisch wäre.
> **Gelesen wurde der Code**, nicht die Absicht — jede Zeile hat eine Fundstelle.

---

## ⚠️ Der wichtigste Befund zuerst

**Es gibt keinen internen Admin-Bereich.**

MP-G §0 sagt: „Du entwickelst den bestehenden internen Admin-Bereich von
creaDIG weiter." Diese Voraussetzung trifft nicht zu.

Geprüft und **nicht vorhanden**:

| Gesucht | Ergebnis |
|---|---|
| `/admin`-Routen | keine — `app/(de)/` und `app/(tr)/tr/` enthalten ausschließlich öffentliche Seiten |
| Auth-Bibliothek | keine (`next-auth`, `@auth/*`, Clerk, Supabase: nicht in `package.json`) |
| `middleware.ts` | existiert nicht |
| Datenbank / ORM | keine (Prisma, Drizzle, `@vercel/postgres`, KV, Redis: nicht installiert) |
| Rollen / Rechte | kein Konzept, kein Code |
| Admin-Komponenten | keine |

**Die vollständige Abhängigkeitsliste** (`package.json`):
`@tailwindcss/postcss` · `@vercel/analytics` · `@vercel/speed-insights` ·
`class-variance-authority` · `clsx` · `framer-motion` · `lucide-react` ·
`next` · `postcss` · `radix-ui` · `react` · `react-dom` · `tailwind-merge` ·
`tailwindcss` · `tw-animate-css`

Keine dieser Abhängigkeiten kann Daten speichern oder jemanden anmelden.

**Was das für MP-G bedeutet:** G.1–G.5 sind kein Ausbau, sondern ein Neubau —
und zwar ein Neubau, dem heute die Datengrundlage fehlt. Details unter
„V1-Empfehlung".

---

## A–R · Inventar

| | Bereich | Status | Fundstelle / Befund |
|---|---|---|---|
| **A** | Admin-Routen | **MISSING** | keine |
| **B** | Admin-Komponenten | **MISSING** | keine |
| **C** | Auth | **MISSING** | keine Bibliothek, kein Middleware, keine Session |
| **D** | Rollen / Rechte | **MISSING** | kein Konzept im Code |
| **E** | Persistence | **MISSING** | **siehe unten — der harte Kern** |
| **F** | Lead-Daten | **MISSING SOURCE** | `app/api/lead/route.ts` erzeugt `id` + `reference`, verschickt eine Mail und **verwirft beides**. Kein Speicher. |
| **G** | Betriebscheck-Daten | **MISSING SOURCE** | `evaluateCheck()` rechnet im Browser; Ergebnis geht als **Klartext im `message`-Feld** mit der Mail raus. Score, Ebenen und Antworten existieren danach nur im Postfach. |
| **H** | Booking-Daten | **MISSING SOURCE** | `termin-wizard.tsx` → derselbe Lead-Weg. Kein Kalender, kein Termin-Objekt. |
| **I** | Analytics | **LIVE DATA (nur schreibend)** | `lib/track.ts` → `@vercel/analytics`. **Keine Lese-API** in der Anwendung; die Zahlen liegen im Vercel-Dashboard. |
| **J** | Consent | **LIVE DATA** | `lib/consent.ts`, `components/consent/*`. Version 5, Kategorie `statistics`. Wird vor jedem Event erneut geprüft. |
| **K** | Customer-Daten | **MISSING** | `clientWorks` in `lib/site-data.ts` ist **Marketing-Inhalt**, kein Kundenstamm: drei Einträge, öffentlich, ohne Vertrag, Kontakt oder Vertragsstand. |
| **L** | Project-Daten | **MISSING** | existiert nirgends |
| **M** | Finance-Daten | **MISSING** | existiert nirgends. Preise in `site-data.ts` sind Listenpreise, keine Umsätze. |
| **N** | Monitoring-Daten | **MISSING** | kein Uptime-Check, kein Alarm ausser `raiseAlert()` (Mail bei Zustellfehler) |
| **O** | APIs | **3 Stück** | `POST/GET /api/lead` · `GET /api/selftest` · `POST /api/csp-report` |
| **P** | Automationen | **2 Stück** | Eingangsbestätigung an den Absender · `raiseAlert()`-Mail bei Fehlern. Beide in `route.ts`, kein Scheduler. |
| **Q** | Empty States | **LIVE, vorbildlich** | Fallstudien/Bewertungen/Screens/Landings rendern **gar nicht**, wenn leer. Der Standard ist gesetzt und darf im Control Center nicht unterschritten werden. |
| **R** | Technische Schulden | siehe unten | drei benannte Punkte |

### E · Persistence — der harte Kern

Es gibt **keinen** Datenspeicher. Die einzige Laufzeit-Zustandshaltung sind
zwei `Map`s im Prozessspeicher:

| Was | Wo | Lebensdauer |
|---|---|---|
| Rate-Limit-Fenster | `lib/lead-guard.ts:147` `const buckets = new Map()` | bis zum nächsten Kaltstart, **pro Instanz** |
| Alarm-Entprellung | `lib/alert.ts:38` `const seen = new Map()` | dito |

Beides ist für seinen Zweck richtig gebaut und ausdrücklich so dokumentiert.
Beides ist **keine** Grundlage für ein Control Center.

Die Datenschutzerklärung sagt denselben Satz nach aussen:

> „Eine Datenbank führen wir nicht: Ihre Anfrage liegt ausschließlich in
> unserem E-Mail-Postfach."

**Das ist keine Lücke, das ist eine veröffentlichte Zusage.** Wer einen
Lead-Speicher einführt, ändert eine Aussage in der Datenschutzerklärung —
Owner-Gate, nicht Technik-Entscheidung.

---

## Current Data Flow — was wirklich fließt

```
WEBSITE
   │
   ├── Kontaktformular ─────┐
   ├── Termin-Assistent ────┤
   ├── Betriebscheck ───────┤   message = Klartext-Zusammenfassung
   ├── Produkt-Interesse ───┤
   └── Kurz-Check ──────────┘
                            │
                            ▼
                   POST /api/lead
                   ├─ Honeypot
                   ├─ Zeit-Token (HMAC)
                   ├─ Rate-Limit (In-Memory)
                   ├─ Pflichtfelder
                   ├─ Einwilligung
                   └─ createLeadIdentity()  →  id (UUID) + reference (CD-…)
                            │
                            ▼
                   Resend  →  info@creadig.de        ← EINZIGE ABLAGE
                            │
                            └─→  Bestätigung an den Absender
                            
                   ✗ PERSISTENCE            MISSING
                   ✗ CONTROL CENTER          MISSING


   CTA-Klicks ──┐
   booking_step ┤
   audit_*      ┤ nur mit Einwilligung
   lead_submitted┘
                │
                ▼
        Vercel Web Analytics   (schreibend)
                │
                ▼
        Vercel Dashboard          ← Daten liegen HIER, ausserhalb der App
                │
                ✗ LESE-API in der Anwendung   MISSING
```

**Zwei Pfeile fehlen, und beide sind der Grund, warum G.2–G.4 heute keine
echten Zahlen zeigen könnten:** kein Speicher hinter der Lead-Route, kein
Lesezugriff auf die Analytics.

---

## Was es an internem Werkzeug schon gibt

**`/status` — der Materialstand.** Die einzige existierende Innenansicht.

| | |
|---|---|
| Route | `app/(de)/status/page.tsx`, 522 Zeilen, `force-dynamic`, `noindex` |
| Zugang | in Entwicklung offen; **in Produktion 404**, ausser `?key=` trägt `SELFTEST_SECRET` |
| Datenquelle | dieselben Module, aus denen die Website gebaut wird — `site-data`, `insights`, `service-pages`, die `*.generated.ts` |
| Aussage | was **fehlt**: Freigaben, Bilder, Zahlen, Verträge, Env-Variablen |
| TR-Fassung | keine (bewusst — Innenansicht) |

**Das ist bereits ein Control-Center-Baustein**, und zwar der ehrlichste: Er
liest Wahrheit, erfindet nichts und erklärt bei jedem Punkt, wer liefern muss.
Was ihm fehlt, ist alles Operative — er kennt keinen Lead, keinen Kunden,
keinen Vorgang.

**Die Zugangslösung (`?key=` + `SELFTEST_SECRET`) trägt eine Seite ohne
Mutationen. Für ein Control Center mit Statusänderungen trägt sie nicht:**
Der Schlüssel steht in der Adresszeile, im Browserverlauf und in jedem
Referrer. Für G.1 braucht es echte Authentifizierung — das ist ein
eigenständiger Bau, kein Nebeneffekt.

---

## Modul-Bereitschaft

| Modul | Status | Warum |
|---|---|---|
| **Today / Pulse** | **MISSING SOURCE** | Alle vorgesehenen Karten (neue Leads, Leads ohne Aktion, offene Angebote) brauchen einen Lead-Speicher. Ohne ihn bleibt eine leere Seite. |
| **Sales / Leads** | **MISSING SOURCE** | Es gibt keine Lead-Liste. Es gibt Mails. |
| **Marketing** | **MISSING SOURCE** | Ereignisse werden gesendet, aber die App kann sie nicht lesen. Ohne Vercel-API-Zugang oder eigenen Ereignisspeicher: nichts anzuzeigen. |
| **Customers** | **MISSING** | Kein Kundenmodell. `clientWorks` ist Marketing. |
| **Products** | **SPEC ONLY** | `maturity` existiert als Feld, alle `null`. Keine Telemetrie. |
| **Projects / Delivery** | **MISSING** | — |
| **Finance** | **MISSING** | — |
| **Operations / Health** | **MISSING** | kein Monitoring |
| **Support** | **MISSING** | kein Ticketsystem |
| **Documents** | **MISSING** | kein Ablageort |
| **Intelligence / meAI** | **MISSING SOURCE** | siehe `docs/roadmap/creadig-1-0-scale.md` §5 — 3 von 5 Use Cases ohne Datenpfad |
| **Materialstand** | **LIVE DATA** | `/status`, funktioniert heute |
| **Auth / RBAC** | **OWNER DECISION** | Bau nötig, Umfang hängt an der Frage, ob je jemand ausser dem Owner hineinsieht |
| **Geography** | **OWNER + PRIVACY GATE** | keine Quelle. Neu einzubauen hiesse neue personenbezogene Erhebung. |
| **UTM / Attribution** | **OWNER GATE** | Server nimmt `utm*` entgegen, Client sendet nichts. Blockiert bis Datenschutzsatz — `docs/ops/utm-playbook.md`. |

---

## Konflikte

**1 · Der Prompt setzt einen Admin-Bereich voraus, der nicht existiert.**
G.1 ist ein Neubau inklusive Authentifizierung.

**2 · Ein Control Center ohne Speicher ist eine leere Hülle.**
MP-G §2 verbietet Fake-Daten, §42 verbietet Demo-Karten in produktiven
Ansichten, §53 verbietet Karten ohne Quelle. Zusammen heisst das: Today,
Sales und Marketing wären heute drei Seiten mit „Noch keine Daten." Das ist
regelkonform — und nutzlos.

**3 · Der Speicher ist kein reines Technikthema.**
Die Datenschutzerklärung sagt öffentlich, dass keine Datenbank geführt wird.
Ein Lead-Speicher ändert diese Aussage und ist damit ein Owner-Gate
(MP-G §70: „neue personenbezogene Datenerhebung").

**4 · Marketing-Daten liegen ausserhalb der Anwendung.**
Vercel Web Analytics ist schreibend eingebunden. Ein Funnel im Control Center
braucht entweder API-Zugang zu Vercel oder einen **eigenen**
Ereignisspeicher — und Letzteres wäre das „parallele Analytics-System", das
MP-G §2.4 verbietet, wenn es doppelt geführt wird.

**5 · Der Zugang zu `/status` skaliert nicht auf ein Control Center.**
Schlüssel in der URL ist für eine lesende Innenansicht vertretbar, für
Statusänderungen nicht.

---

## Technische Schulden (dokumentiert, nicht behoben)

| Fund | Bewertung |
|---|---|
| **Rate-Limit im Prozessspeicher** | In einer Serverless-Umgebung hat jede Instanz ihr eigenes Fenster; das Limit ist damit weicher als es aussieht. Ausdrücklich so gebaut und kommentiert. Kein Defekt — aber der erste Punkt, der mit einem Speicher besser würde. |
| **`statusBadge.beta` ist unerreichbar** | `productStatus()` liefert nur `live`, `aufbau`, `intern`. Der vierte Wert steht im Wörterbuch und kann nicht entstehen. Seit MP-C.1 füllt `maturityBadge` diese Rolle. Aufräumen wäre eine Verhaltensänderung — hier nur notiert. |
| **`npm run a11y` / `shots` verlieren ihren Server** | ~1 von 3 Läufen, Exit 0, kein Log (`stdio: "ignore"`). Reproduziert auch ohne aktuelle Änderungen. Bekannt, im Backlog. |

**Sicherheits-, Datenintegritäts- oder Privacy-Defekte: keine gefunden.**
Der Lead-Weg ist mehrfach abgesichert (Honeypot, signiertes Zeit-Token mit
Mindestalter, Rate-Limit, doppelte Einwilligungsprüfung), `/status` ist in
Produktion ohne Schlüssel nicht erreichbar, Ereignisse feuern nur mit
Einwilligung — alles in MP-D.5 und MP-E.5 belegt getestet.
**Deshalb wurde in G.0 keine Zeile Code geändert.**

---

## V1-Empfehlung

**Nicht G.1 zuerst.** Eine Oberfläche über nichts ist keine Oberfläche.

Die Reihenfolge, die MP-G §0 selbst vorgibt — *erst Wahrheit, dann
Oberfläche* — führt hier zu:

| Schritt | Was | Owner-Gate | Ohne das … |
|---|---|---|---|
| **1** | **Entscheidung: Lead-Speicher ja/nein** | ✅ ja — ändert die Datenschutzerklärung | … bleibt jedes Sales-Modul leer |
| **2** | Speicher + Schreibpfad in `/api/lead` (zusätzlich zur Mail, nicht statt ihr) | folgt aus 1 | … kein Lead hat eine Historie |
| **3** | Authentifizierung (echte Session, nicht `?key=`) | Umfang: Owner | … kein Modul mit Mutationen |
| **4** | G.1 Shell + G.3 Sales (Liste, Detail, Betriebscheck-Ergebnis) | — | — |
| **5** | G.2 Today — leitet aus 4 ab, was Aufmerksamkeit braucht | — | — |
| **6** | G.4 Marketing | Vercel-API oder eigener Ereignisspeicher | … kein Funnel |
| **7** | G.5 Customers | eigenes Modell, nicht `clientWorks` | — |

**Schritt 1 ist keine Programmieraufgabe.** Es ist die Frage: *Sollen Anfragen
künftig gespeichert werden — und darf in der Datenschutzerklärung stehen, dass
wir das tun?*

### Was ohne neue Datenerhebung heute gebaut werden könnte

Genau ein Ding, und es ist bescheiden:

**Der Materialstand (`/status`) als erste Control-Center-Seite** — dieselbe
Wahrheit, in der Shell, mit richtiger Authentifizierung statt Schlüssel in der
URL. Er liest ausschließlich Repository-Daten, erhebt nichts, speichert nichts
und ist schon heute nützlich.

Das wäre eine **ehrliche G.1**: eine Shell mit genau einem Modul, das echte
Daten hat — statt fünf Modulen, die „Noch keine Daten." sagen.

### Was ein Owner-/Privacy-Gate braucht

| Thema | Gate |
|---|---|
| Lead-Speicher | Datenschutzerklärung + Owner |
| UTM-Client | Datenschutzsatz (steht als Entwurf in `utm-playbook.md`) |
| Geography | neue personenbezogene Erhebung — Owner + rechtliche Prüfung |
| Marketing-Funnel aus Vercel | API-Zugang, Vertragslage prüfen |
| Weitere Rollen (Steuerberater, Ops) | Owner — heute gibt es einen Nutzer |
| Monitoring | Dienst auswählen = Auftragsverarbeiter = AVV |

---

## Was G.0 NICHT getan hat

- keine Route angelegt
- keine Komponente gebaut
- kein Datenmodell entworfen
- keine Abhängigkeit installiert
- keine Zeile Produktionscode geändert
- keine Zahl behauptet, die nicht im Code steht

**STOP.** G.1 erst auf Owner-„weiter" — und sinnvollerweise erst nach der
Entscheidung aus Schritt 1.
