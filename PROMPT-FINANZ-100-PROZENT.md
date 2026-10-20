# creaDIG Finanz — Abschluss-Auftrag (ein ununterbrochener Durchlauf)

## Regel für diesen Durchlauf
Arbeite **ununterbrochen bis zum Ende**. Melde dich nicht mit „teilweise fertig" oder
„X fehlt noch" — entweder ein Punkt ist nach der unten stehenden Definition **fertig und
verifiziert**, oder du arbeitest weiter, bis er es ist. Die einzige zulässige Unterbrechung
steht explizit in Phase 1 (echte Steuerdaten) — alles andere wird bis zum Ende durchgezogen.

## Sicherheits-Setup (zuerst, vor jeder Änderung)
1. `git fetch origin`
2. Neuer lokaler Branch **ab `origin/feat/system-haus-site`** (nicht `main` — `main` ist veraltet):
   `git checkout -b finanz-abschluss origin/feat/system-haus-site`
3. **Nur lokal committen. Kein `git push`.** v0 arbeitet parallel auf `feat/system-haus-site` —
   dieser Branch darf damit nicht kollidieren. Commits klein und beschrieben, ein
   zusammenhängender Schritt pro Commit.
4. Am Ende: Zusammenfassung + `git diff --stat` gegen den Startpunkt. Kein Merge, kein Push —
   das entscheidet der Owner.

## Kontext (nicht neu bauen, nur lesen)
- creaDIG Finanz liegt unter `app/(finanz)/`, `lib/finanz/`, `components/finanz/`,
  Schema `scripts/migrations/029-finanz.sql` + inline Schemas in `lib/finanz/auftraege/store.ts`
  und `lib/finanz/belege.ts`.
- Marke/CI: aktuell **kobaltblau + Manrope** (NICHT die alte warm-gold-Entscheidung — die ist
  überholt). Finanz zieht die Schriften/Farben bereits aus `app/globals.css` — nicht anfassen,
  nur weiterverwenden.
- Ehrlichkeits-Regel gilt hier besonders hart: **keine erfundenen Kundendaten, keine
  erfundenen Beträge, keine erfundene Steuernummer/USt-IdNr., keine Fake-Rechnungen in
  echten Tabellen.** Testdaten für Verifikation sind nur in einem klar als Test markierten
  Pfad erlaubt (siehe Phase 5).
- Scope dieses Durchlaufs: **Finanz als Werkzeug für creaDIG selbst 100 % fertig machen.**
  Mandantenfähigkeit / separates Produkt auf eigener Domain ist NICHT Teil dieses Durchlaufs
  (siehe Phase 6 — dort nur Grundlage legen, nicht ausbauen).

---

## Phase 1 — Steuerstatus (die eine erlaubte Unterbrechung)
`FIRMA_STANDARD.steuernummer` und `.ustId` sind leer; `fehltFuerERechnung()` blockiert
deshalb jede echte E-Rechnung zu Recht.

- Stelle sicher, dass die Grundlagen-Seite (`app/(finanz)/finanz/grundlagen/page.tsx`,
  `components/finanz/einstellungen.tsx`) beide Fälle **vollständig korrekt** abbildet:
  Kleinunternehmer (§19, kein USt-Ausweis) UND normal umsatzsteuerpflichtig — inklusive
  korrekter Anzeige/Berechnung in `lib/finanz/auftraege/rechnen.ts` und `erechnung.ts`.
- Verifiziere BEIDE Modi mit **eindeutig als Test gekennzeichneten** Werten (z. B.
  Steuernummer „000/000/00000" in einem Testlauf, niemals in echte Produktionsdaten
  geschrieben).
- Erfinde NICHT die echte Steuernummer/USt-IdNr. des Owners. Wenn du an diesem einen
  Punkt echte Werte brauchst, um den Durchlauf fortzusetzen: halte kurz an, frage **nur
  diese eine Angabe** (§19 oder normal + ggf. die reale Nummer, falls der Owner sie geben
  will), und mache danach ununterbrochen weiter. Keine weitere Rückfrage danach.

## Phase 2 — Ein Fatura-System, nicht zwei
Heute existieren zwei parallele Rechnungs-Pfade: `lib/rechnung.ts` (Gate 18, genutzt von
`components/sections/packages.tsx`, `lib/cockpit.ts`, `lib/jurisdiktion.ts`, `lib/kreislauf.ts`,
`lib/verkauf.ts`) und `lib/finanz/auftraege/*` (eigene Nummernkreise `fin_nummernkreis`).
Zwei unabhängige Nummernkreise für dieselbe Firma sind ein GoBD-Risiko (Lückenlosigkeit).

- Analysiere beide Pfade genau: welche Rechnungen/Nummern sind in Produktion bereits über
  welchen Weg ausgestellt?
- Triff die Entscheidung — und begründe sie kurz im Commit —: **`lib/finanz/auftraege/*`
  wird die einzige Quelle für neue Rechnungen/Angebote.** `lib/rechnung.ts` bleibt nur für
  Altbestand lesbar (nichts löschen, keine Historie verfälschen), aber erzeugt keine neuen
  Rechnungsnummern mehr. Alle fünf Aufrufstellen entsprechend umstellen.
- Keine historischen Daten löschen oder umnummerieren.

## Phase 3 — Verifikation, die heute komplett fehlt
Es gibt keinen einzigen Drill/Check für Finanz, obwohl jeder andere Bereich der
Codebase einen hat (`scripts/*drill*.mjs`-Muster).

Baue nach demselben Muster ein Skript (`scripts/finanz-drill.mjs` o. ä.), das mindestens
prüft:
- Steuerberechnung in allen drei Sätzen (0/7/19 %) + §19 + Reverse-Charge + Drittland —
  korrekte Summen.
- Nummernkreis ist lückenlos und pro Präfix+Jahr monoton (kein doppeltes, kein
  übersprungenes).
- XRechnung-Export ist gegen die Pflichtfelder aus `fehltFuerERechnung()` konsistent und
  erzeugt gültiges XML (wohlgeformt, Pflichttags vorhanden).
- Kunden-Dokumentseite (`dokument/[token]`) durchläuft alle Statuswechsel korrekt:
  entwurf → versendet → geöffnet → angenommen/abgelehnt/änderung/ersetzt/abgelaufen,
  rechnung → bezahlt/storniert.
- Fibero-Abgleich ist idempotent (zweimal laufen lassen → gleiches Ergebnis, keine
  doppelten Buchungen).
- Das Skript muss **grün** laufen, bevor dieser Durchlauf als fertig gilt.

## Phase 4 — Betriebsbereitschaft
- `.env.example`: `FIBERO_SUPABASE_URL` und `FIBERO_SUPABASE_SERVICE_ROLE_KEY` ergänzen
  (mit Kommentar, was sie tun und dass sie optional sind, falls Fibero-Abgleich
  deaktiviert bleibt).
- Fibero-Abgleich klar als **optionales Modul** kennzeichnen (ein Schalter/Flag), nicht als
  Kernfunktion von Finanz — er bildet ausschließlich das eigene
  Glasfaser-Subunternehmer-Geschäft ab und ist fachlich speziell, nicht allgemein.
- Prüfe, ob Fehlerzustände (keine DB-Verbindung, Fibero nicht erreichbar, fehlende
  Grundlagen-Daten) überall sauber abgefangen sind und dem Nutzer verständlich angezeigt
  werden (kein Absturz, keine stille Lücke).

## Phase 5 — Sprache
`dokument/[token]` kennt nur DE/EN (`HINWEIS`-Objekt). Ergänze **TR** im selben Muster —
das ist die Kernzielgruppe von creaDIG. Prüfe denselben Satz an Statustexten auch für die
Mail-Vorlagen, die auf diese Seite verlinken (`lib/finanz/auftraege/mail.ts`), falls dort
ebenfalls nur DE/EN vorhanden ist.

## Phase 6 — Grundlage legen, NICHT ausbauen (Mandantenfähigkeit)
Baue in diesem Durchlauf **keine** Mandantenfähigkeit/separates Auth. Das ist absichtlich
außerhalb des Scopes. Tu nur dies, leichtgewichtig:
- Dokumentiere (ein kurzer Kommentarblock an zentraler Stelle, z. B. `lib/finanz/basis.ts`
  oder ein neues `lib/finanz/README.md`), welche Stellen heute hart auf „eine Firma"
  angenommen sind (`fin_einstellungen.id = 'haupt'`, `FIRMA = "firm-creadig"` in
  `fibero-abgleich.ts`, der feste KI-Systemprompt in `assistent.ts`, `GESCHAEFTSFELDER` in
  `belege.ts`), damit ein späterer Mandantenfähigkeits-Durchlauf nicht neu suchen muss.
- Keine Code-Änderung an diesen Stellen in diesem Durchlauf — nur die Landkarte.

## Definition von „fertig" (alles muss zutreffen)
- [ ] Build grün, keine neuen Lint-/Type-Fehler.
- [ ] `scripts/finanz-drill.mjs` (oder gleichwertig) läuft grün.
- [ ] Phase 1: beide Steuermodi nachweislich korrekt (Screenshot oder Log reicht als Beleg).
- [ ] Phase 2: genau EIN aktiver Rechnungs-/Nummernkreis-Pfad, Entscheidung dokumentiert,
      nichts aus der Historie verändert.
- [ ] Phase 3: Drill deckt alle fünf genannten Punkte ab.
- [ ] Phase 4: `.env.example` vollständig, Fibero-Abgleich klar als optional markiert,
      Fehlerzustände geprüft.
- [ ] Phase 5: TR auf der Kunden-Dokumentseite vorhanden und getestet.
- [ ] Phase 6: Landkarte geschrieben, keine funktionalen Änderungen daran geknüpft.
- [ ] Keine echten/erfundenen Kundendaten, keine Fake-Beträge, keine Fake-Steuernummer in
      Produktionspfaden.
- [ ] Abschlussbericht: was geändert wurde (Datei-Liste), `git diff --stat`, was Phase 1
      an echten Daten vom Owner noch braucht (falls er sie nicht direkt gegeben hat).

Wenn ein Punkt aus technischen Gründen wirklich nicht lösbar ist (nicht „noch nicht
geschafft", sondern „geht aus X Grund nicht"), dann sage das am Ende **explizit mit Grund**
— das ist der einzige Fall, in dem „nicht fertig" ein akzeptables Ergebnis ist. Alles
andere wird bis zum Ende durchgezogen.
