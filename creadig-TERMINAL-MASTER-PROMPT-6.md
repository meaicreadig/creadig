# creaDIG — Terminal-Master-Prompt 6 · v0-Review umsetzen (Betriebsreife & Vertrauen)

> **Grundlage:** die code-verifizierte Lücken-Analyse von v0 (23.08.2026, vollständig im Chat).
> Die verbleibenden Risiken liegen im **Betrieb** und im **Vertrauen**, nicht mehr im Design.
> **Reihenfolge = v0-Stufen 1→4.** Ein Commit pro Teilschritt, `npm run build` grün + Function-Gate vor jedem Commit.
> Nach jeder Stufe: STOPP + Freigabe. **Nicht nach `main`, nicht live, kein Force-Push.**

## Black Lock (unverändert)
Ehrlichkeit zuerst (keine Fakes — auch keine erfundene Verfügbarkeit, keine Bewertung ohne echte Reviews) · eigene Produkte meAI/fibero/CASSAMEA/meahv · Glasfaser-Geschäft raus · echte Kunden NV SWISS/maqam · Preisleiter 2.400 → 3.900 netto + 149/Mon · Handwerk & KMU, DE-Schwerpunkt · go-digital in keiner Copy · keine Kalt-E-Mail · Sitz ICO Osnabrück, 2017 · DE/TR-Parität · ein beworbenes Angebot.

## Arbeitsweise
- Ein Teilschritt = ein Commit (`feat(BF-2): …`), vorher `npm run build` grün + Function-Gate.
- Jede Textänderung in **DE und TR**.
- Owner-abhängige Punkte NICHT erfinden → als „Owner liefert" im Bericht melden.
- Nach jeder Stufe: build grün, kurze Zusammenfassung, **STOPP**.

---

## STUFE 1 — vor dem Livegang (BLOCKER)

### 1.1 · BF-1 — Terminslots ehrlich machen
- **Bezug:** `components/termin/termin-wizard.tsx` (hartkodierte `SLOTS_INITIAL`/`SLOTS_ARCHITECTURE`, kein Kalenderabgleich).
- **Problem:** erfundene Verfügbarkeit = Ehrlichkeitsverstoß (Black Lock 1), dieselbe Klasse wie der entfernte Fake-Erfolg.
- **Tun:** Wizard erfasst **Wunschzeit(en)**, keine „Buchung". Texte DE+TR: Frage „Wann passt es Ihnen?" + Hinweis „Wir bestätigen verbindlich per Rückmeldung." Bestätigungsmail: „Terminwunsch erhalten — wir bestätigen …" statt „gebucht". Keine feste Slot-Zusage mehr. (Echter Kalender = späteres Projekt, NICHT jetzt.)
- **Acceptance:** Kein Screen und keine Mail suggeriert eine bestätigte Buchung. Owner gibt die Copy frei.

### 1.2 · BF-2 / R-2 — Rate-Limit & Missbrauchsschutz auf der Lead-Route
- **Bezug:** `app/api/lead/route.ts` (nur Honeypot).
- **Problem:** unbegrenzte Aufrufe → Resend-Kontingent/Kosten + Backscatter (Bestätigungsmail an Fremde in eurem Namen = Domain-Reputation + berührt Black Lock 7).
- **Tun:** stateless, ohne Captcha: (a) signiertes Zeit-Token beim Formular-Render; Absenden < ~2 s oder ungültiges/fehlendes Token → ablehnen. (b) einfaches IP-Limit, falls **ohne neue Infra** machbar; sonst als Owner-Punkt „Upstash o. ä." melden. Bestätigungsmail NUR nach bestandenem Schutz.
- **Acceptance:** gefüllter Honeypot ODER zu schnelles Absenden ODER ungültiges Token → keine Mail, kein Lead-Versand. Legitimes Absenden funktioniert unverändert.

### 1.3 · BF-3 — 404- und Fehlerseiten, zweisprachig
- **Bezug:** `app/` (keine `not-found.tsx`/`error.tsx`/`global-error.tsx`).
- **Tun:** alle drei im Seitendesign anlegen, DE/TR (auch für `/tr/`-Kontext), mit drei Wegen (Start, Leistungen, Kontakt) + WhatsApp/E-Mail als Ausweg (weil die Lead-Route bei fehlendem ENV 503 liefert).
- **Acceptance:** `/gibtsnicht` und `/tr/gibtsnicht` zeigen gestaltete, sprachrichtige Seiten mit Kontaktweg. Kein englischer Next-Standard mehr.

### 1.4 · R-1 — Speed Insights als Verarbeiter führen
- **Bezug:** `@vercel/speed-insights` + `va.vercel-scripts.com` in der CSP.
- **Tun:** sicherstellen, dass Speed Insights hinter demselben Consent liegt wie Analytics (sonst gaten); in Datenschutzerklärung (DE+TR) und `processors[]` aufnehmen.
- **Acceptance:** lädt nicht vor Consent; steht in Datenschutz + Verarbeiterliste.

**STOPP nach Stufe 1** — build grün, Copy-Freigabe BF-1 einholen, Screenshots (404, Termin-Wizard).

---

## STUFE 2 — direkt nach dem Flip (jetzt baubar)

### 2.1 · BF-8 — Zustellprüfung + haltbare Reaktionszeit
- **Tun:** (a) Reaktionszusage in der Bestätigungsmail auf einen **haltbaren** Wert (Owner-Entscheidung; Vorschlag „innerhalb von zwei Werktagen"), DE+TR. (b) Zustell-Selbsttest als Skript/Route, das die Lead-Route prüft und bei Ausfall alarmiert — Code liefern, Aktivierung (Vercel-Cron o. ä.) als Owner-Punkt.
- **Acceptance:** Mail nennt haltbare Zeit; Selbsttest-Code vorhanden + dokumentiert.

### 2.2 · T-1 — OG-Bilder auf Unterseiten (SEO-1)
- **Bezug:** `app/(de)/opengraph-image.tsx` nur auf Segment-Ebene; Unterseiten mit eigenem `metadata` überschreiben den Layout-OpenGraph.
- **Tun:** OG-Bild pro Route-Gruppe in einem gemeinsamen Metadata-Helfer setzen (nicht pro Seite wiederholen), DE+TR.
- **Acceptance:** `/leistungen`, eine Detailseite und `/tr/…` liefern ein `og:image`; echter Teilen-Test (WhatsApp) zeigt das Bild.

### 2.3 · BF-4 — Minimal-CI
- **Tun:** `.github/workflows/ci.yml`: `tsc --noEmit`, `lint`, `build`, Function-Größen-Gate; + Rauchtest (`/`, `/tr`, `/kontakt`, `/leistungen`, eine Detailseite → HTTP 200); + Test: Lead-Route mit gefülltem Honeypot ⇒ kein Versand.
- **Acceptance:** CI läuft bei Push grün; der Honeypot-Test schlägt fehl, wenn der Schutz entfernt würde.

### 2.4 · BF-6 — aggregateRating bei 0 Reviews
- **Bezug:** `lib/site-data.ts` (`aggregateRating`) + JSON-LD.
- **Tun:** verifizieren, dass `aggregateRating` bei 0 bewerteten Reviews **nicht** ins JSON-LD gelangt; die Bedingung festschreiben (Kommentar/Test), damit sie nicht versehentlich aufgehoben wird.
- **Acceptance:** JSON-LD ohne `aggregateRating`, solange keine echten Reviews vorliegen.

**STOPP nach Stufe 2.**

---

## STUFE 3 — macht die Seite wahr

### 3.1 · BF-9 — Obere Preisöffnung „auf Anfrage"
- **Tun:** die dritte Stufe endet in „größerer Umfang: auf Anfrage" (DE+TR). Black Lock 5 bleibt (ein beworbenes Angebot, keine zweite Preisleiter). Referenzen (NV SWISS/maqam) und Paketpreis **nicht im selben Sichtfeld** platzieren.
- **Acceptance:** „auf Anfrage" sichtbar; keine zweite Zahl.

### 3.2 · V-1 — Bestätigungsmail arbeiten lassen
- **Tun:** Bestätigungsmail (DE+TR) erweitern um „was als Nächstes passiert", „was wir im Gespräch brauchen (Zugänge, Bestand)" und einen Link auf das stärkste Produktbeispiel.
- **Acceptance:** Mail enthält nächste Schritte + Link.

### 3.3 · Owner liefert (Code wartet, nichts erfinden)
- **C-1** echter meAI-Screenshot → `public/works/products/meai/` (dann verdrahten).
- **C-2** NV SWISS + maqam: schriftliche Freigabe + je ein Satz (Aufgabe/Ergebnis).
- **S-1** zwei Fachartikel als Vertriebsmaterial → `/insights`.

**STOPP nach Stufe 3.**

---

## STUFE 4 — Feinschliff
- **D-1** automatisierter Screenshot-Satz für 7 Seiten (`/`, `/tr`, `/leistungen`, `/produkte`, `/arbeiten`, `/kontakt`, `/unternehmen`; hell/dunkel, mobil/desktop), bei jeder Änderung neu.
- **D-2** den aktuell ausgedünnten Zustand (ohne Reviews/Insights/Kundenlogos) explizit beurteilen — trägt die Startseite so?
- **BF-5** Owner-Sichtbarkeit für fehlendes Material: aus den Daten abgeleitete Status-/Fehlt-Liste (Markdown im Repo oder nur lokal erreichbare Statusseite).
- **BF-7** Nonce-basierte CSP (Theme-Boot-Skript bekommt Nonce; `unsafe-inline` für Skripte raus).
- **T-2** Fehler-Alarm auf Lead- und CSP-Route.
- **S-2** Menüsprache `/leistungen` ↔ `/produkte` schärfen (Produkte = Beweis, nicht Katalog).
- **V-2** Zusendung/Lead-Magnet — **erst nach S-1**.

**STOPP nach Stufe 4** — Endabnahme + `creadig-LIVE-CHECKLISTE.md` und `creadig-AUDIT-BACKLOG.md` um alle v0-Punkte (BF-1…BF-9, S/D/C/V/T/R) ergänzen und Erledigtes abhaken.

---

## Nicht tun
- Keine Fakes: keine erfundene Verfügbarkeit, keine `aggregateRating` ohne echte Reviews, keine erfundenen Referenzen/Zahlen.
- Kein echter Kalender jetzt (BF-1b später). Kein Captcha. Keine Mail-Zugangsdaten im Code (nur ENV).
- Black Lock nicht antasten. Nicht nach `main`, nicht live, kein Force-Push.
