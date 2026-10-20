# creaDIG — Vernetzungs-Durchlauf: alle Systeme kennen sich (ein ununterbrochener Durchlauf)

## Regel für diesen Durchlauf
Arbeite **ununterbrochen bis zum Ende, auch wenn es Stunden dauert**. Melde dich nicht mit
„teilweise fertig" oder „X fehlt noch" — entweder ein Punkt ist nach der Definition unten
**fertig und verifiziert**, oder du arbeitest weiter. Die einzige zulässige Pause ist dort
explizit markiert (Phase 10 nennt die Grenzen, die du nicht selbst entscheidest). Alles
andere wird bis zum Ende durchgezogen.

## Woher das hier kommt
Eine vorherige, read-only Analyse (6 parallele Teilprüfungen über die ganze Codebase, plus
zwei Live-Funde beim Testen eines Bank-CSV-Imports) hat ein wiederkehrendes Muster
gefunden: **einzelne Features sind oft gut gebaut, aber nicht mit dem Rest verbunden** —
zwei parallele Systeme für dieselbe Sache, eine Zahl wird berechnet und nie angezeigt, eine
fertige Funktion ohne Oberfläche. Dieser Durchlauf behebt das, Punkt für Punkt, mit exakten
Datei- und Funktionsnamen aus der echten Analyse — nicht neu suchen, verifizieren und bauen.

## Die goldene Regel, die durch ALLE Phasen zieht
**Nie ein zweites System für dieselbe Sache anlegen.** Wenn eine Verbindung fehlt, verbinde
zum BESTEHENDEN Ort, der die Daten schon hat (Tabelle, Store, Komponente) — lege keine neue
Tabelle/keinen neuen Store an, nur weil das schneller wäre. Jede Phase unten sagt explizit,
welches bestehende System die Quelle ist.

## Sicherheits-Setup (zuerst, vor jeder Änderung)
1. `git fetch origin`
2. Neuer lokaler Branch **ab `origin/feat/system-haus-site`** (der einzige Branch, der zählt):
   `git checkout -b netzwerk-verbindungen-100 origin/feat/system-haus-site`
3. **Nur lokal committen. Kein `git push`.** Ein Commit pro abgeschlossenem Unterpunkt,
   mit kurzer Begründung. Der Owner pusht selbst, nachdem er das Ergebnis gesehen hat.
4. Keine Geheimnisse ausgeben (ENV-Werte, Connection-Strings, Passwort-Hashes) — Namen und
   Zustände ja, Werte nie.
5. Keine echten/erfundenen Kundendaten, Beträge oder Steuernummern in Produktionspfaden.

---

## Phase 1 — Bank-Abgleich fertigstellen (die zwei frischesten Funde)

**1a. Giden banka hareketleri haben keine Oberfläche.**
`lib/finanz/bank-abgleich.ts` enthält bereits fertige, nie aufgerufene Funktionen:
`ladeAusgehendeBankUmsaetze()` (offene Abbuchungen, `betrag_cent < 0`) und
`bucheAusgehendenUmsatz()` (bucht eine Abbuchung als Ausgabe mit Kategorie/USt-Satz).
Grep bestätigt: beide werden außerhalb dieser Datei nirgends importiert — totes Backend.
Baue eine Karte neben `BankImportKarte` (`components/finanz/bank-import.tsx`, oder eine
neue Komponente `components/finanz/bank-ausgaben.tsx`) auf `/finanz/geldfluss`
(`app/(finanz)/finanz/geldfluss/page.tsx`): Liste der offenen Abbuchungen, pro Zeile
Kategorie + USt-Satz (0/7/19) + Geschäftsfeld wählen, Button → Server Action, die
`bucheAusgehendenUmsatz()` aufruft. Nutze **genau diese bestehende Funktion**, lege keine
zweite Buchungslogik an.

**1b. „Offene Einnahmen" wird berechnet und nirgends gezeigt.**
`lib/finanz/felder.ts:45-51` berechnet in `ladeFelder()` bereits `offen: { anzahl, bruttoCent }`
(unbezahlte Einnahmen, `fin_buchungen` wo `art='einnahme' AND bezahlt=false` — das deckt auch
unbezahlte fibero-Rechnungen ab, siehe `lib/finanz/fibero-abgleich.ts:184`). Verifiziert:
weder `app/(finanz)/finanz/page.tsx` noch `lib/finanz/lage.ts` noch `lib/finanz/euer.ts`
lesen dieses Feld. Zeige es sichtbar auf der Finanz-Startseite (`/finanz`) — z. B. als Kachel
„Noch nicht erhalten: N Posten, X €" neben den bestehenden Kennzahlen. Nutze die
**bestehende** `ladeFelder()`-Rückgabe, berechne nichts neu.

---

## Phase 2 — Satış ↔ Finanz-Brücke

**Befund:** Ein gewonnenes Angebot erzeugt heute NICHTS in Finanz. `lib/rechnung.ts:76-92`
bestätigt selbst: `invoices`/`payments` tragen null Zeilen, kein Code schreibt dort je eine
Nummer hinein. Das echte Fakturierungssystem (`lib/finanz/auftraege/store.ts`,
`fin_dokumente`) kennt `opportunities`/`organisations` nicht (0 Treffer bei Grep).

**2a.** In `lib/vertrieb-store-neon.ts`, an der Stelle, die `opportunities.status` auf
`won`/`acceptOffer` setzt (Zeile ~1542-1565): lege dort einen **Angebots-Entwurf** in
`fin_dokumente` an (über die bestehenden Funktionen in `lib/finanz/auftraege/store.ts`,
nicht per Hand per SQL) — Kunde/Firma/Kontaktdaten und Betrag aus der Opportunity
übernehmen, Status `entwurf` (kein automatischer Versand — das bleibt ein Klick des
Owners in Finanz). Wenn kein `fin_kunden`-Eintrag existiert, lege ihn mit Referenz an
(siehe 2b) statt einen anonymen Entwurf zu erzeugen.

**2b.** `fin_kunden` (`lib/finanz/auftraege/store.ts:45-49`) hat keinen Bezug zu
`organisations`/`contacts`. Ergänze ein Feld `organisation_id`/`contact_id` (nullable,
abwärtskompatibel — bestehende Zeilen bleiben gültig) und befülle es bei jeder neuen
Anlage aus 2a automatisch. Keine Rückwirkung auf historische `fin_kunden`-Zeilen nötig.

**2c.** Wenn `status` auf `won` wechselt, zeige auf `/admin/kunden` bzw. der Opportunity
selbst einen expliziten Vorschlag „Als Kunde markieren" (ruft die bestehende
`setOrganisationLifecycle`/Kunden-Lifecycle-Funktion auf, siehe
`app/(admin)/admin/kunden/[id]/page.tsx:191`) — bleibt ein Klick, wird nicht automatisch
gesetzt (der Code selbst sagt bewusst: das macht „auch dann ein Mensch").

---

## Phase 3 — Finanz-Wahrheit überall sichtbar machen

**3a.** `lib/cockpit.ts:74-91` berechnet `rechnungenOffenCent`/`rechnungenOffen` aus den
leeren `invoices`/`payments`-Tabellen (über `lib/rechnung.ts`) — das ist eine strukturell
tote Kennzahl, kein driftender Mock-Wert. Ändere diese Abfrage, damit sie aus
`fin_dokumente`/`fin_buchungen` liest (dieselbe Logik wie `lib/finanz/felder.ts`/
`lib/finanz/bank-abgleich.ts:ladeOffeneRechnungenFuerAbgleich` — wiederverwenden, nicht
neu erfinden).

**3b.** `lib/zentrale/netz.ts:251-258` — der Finanzen-Raum im 3D-Hauptsitz
(`components/admin/zentrale/hauptsitz-3d.tsx`) ist hart codiert
(`{ wert: "€", zustand: "aktiv", last: 0.45, ... }`), ändert sich nie. Verbinde ihn mit
echten Finanz-Kennzahlen (z. B. offene Einnahmen aus Phase 1b, offene Rechnungen aus 3a)
nach demselben Muster wie die anderen fünf bereits echten Knoten in derselben Datei
(`vertrieb`, `marketing`, `mailstudio`, `assistent`, `system`).

**3c.** `lib/admin/morgen-briefing.ts` hat null Erwähnungen von `finanz`/`fin_`/`invoice`
— der tägliche Morgenbericht ist komplett blind für Geld. Ergänze eine Zeile: offene
Einnahmen (Phase 1b), offene Rechnungen (3a), letzter Fibero-Abgleich-Lauf
(`lib/finanz/fibero-abgleich.ts:abgleichStand`).

**3d.** `lib/finanz/morgenmail.ts` erwähnt „pauschal" nirgends — ergänze eine monatliche
Erinnerung, Reisekosten/Verpflegung/Homeoffice-Pauschalen zu erfassen
(`app/(finanz)/finanz/pauschalen`), wenn der laufende Monat noch keinen Eintrag hat.

---

## Phase 4 — Vertriebstrichter vereinheitlichen

**Befund:** `moveOpportunity` (`lib/vertrieb-store-neon.ts:1142-1185`) schreibt
`activities.kind = 'opportunity.<status>'`. `lib/kundenfaden.ts:318-336`
(`ladeStufenSchritte`, die „Warum ist der Deal hier / Rückgängig"-Funktion auf
`/admin/verkaufen`) liest nur `kind = 'deal.stufe'` — eine Stufenänderung auf
`/admin/vertrieb/pipeline/:id` ist auf `/admin/verkaufen` unsichtbar und nicht
rückgängig machbar, und umgekehrt.

**4a.** Vereinheitliche das Aktivitäts-`kind`: entweder schreibt `moveOpportunity`
zusätzlich `deal.stufe` (minimal-invasiv, kompatibel mit beiden Lesepfaden), oder
`ladeStufenSchritte` liest beide `kind`-Werte. Wähle die Variante mit weniger
Schreibpfaden — vermutlich die erste.

**4b.** `lib/vertrieb-store-neon.ts` (2636 Zeilen) importiert `lib/kundenfaden.ts`
nirgends — es reimplementiert Status-/Activity-Schreibvorgänge unabhängig gegen dieselben
Tabellen. Wo es ohne großen Umbau möglich ist (insbesondere die Stellen, die bereits
Activities schreiben), route diese Schreibvorgänge über `kundenfaden.ts`-Funktionen statt
sie zu duplizieren. Wenn eine vollständige Zusammenführung in diesem Durchlauf zu riskant
wäre (zu viele Aufrufstellen), dokumentiere stattdessen explizit (Kommentarblock in beiden
Dateien), welche Stelle welche schreibt — aber behebe mindestens 4a, das ist der sichtbare
Bruch.

**4c.** Fuar-Radar (`lib/messen-radar.ts`, `/admin/messen`) hat keine Verbindung zu
`Anfragen`/`Opportunities`. Ergänze auf der Messen-Seite einen Button „Kontakt von dieser
Messe erfassen", der zur bestehenden Anfrage-Erfassung führt
(`app/(admin)/admin/vertrieb/anfragen/neu`), mit Messe-Name/Datum vorbefüllt. Keine neue
Tabelle — nutze die bestehende Anfragen-Erfassung.

---

## Phase 5 — Mail/LinkedIn als EIN System

**Befund:** Zwei komplett getrennte LinkedIn-Verbindungen (`lib/linkedin.ts` +
`linkedin_connection`-Tabelle, genutzt von `/admin/marketing`-Werkstatt, vs.
`lib/assistent/linkedin.ts` + `assistent_linkedin`-Tabelle, genutzt vom
Redaktions-Agenten). Verbinden an einer Stelle verbindet nicht die andere.

**5a.** Führe beide auf EINE Verbindung + EINE Post-Funktion zusammen. Entscheide dich für
eine Tabelle (empfohlen: die mit den vollständigeren Feldern/Token-Handling) und migriere
den anderen Aufrufer darauf um. Beide bisherigen Einstiegspunkte (`/admin/marketing`-
Werkstatt UND Redaktions-Agent) müssen danach dieselbe Verbindung sehen.

**5b.** Jeder echte LinkedIn-Post muss ins Veröffentlichungsregister
(`recordPublication`, aktuell nur von `app/(admin)/admin/marketing/actions.ts:84-100`
aufgerufen). Ergänze denselben Aufruf in `app/(admin)/admin/assistent/actions.ts:127-138`
(`freigabeEntscheiden`, Zweig `art === "linkedin"`), direkt nach einem erfolgreichen
`veroeffentliche()`.

**5c.** In derselben Stelle (5b, `actions.ts:127-138`): wenn `ladeLinkedin(kanal)` null
zurückgibt, wird die Freigabe aktuell trotzdem als `freigegeben` markiert, ohne Post und
ohne Fehlermeldung. Branch stattdessen in einen klaren Fehlerzustand (wie beim Mail- und
Löschen-Pfad in derselben Datei) — der Owner muss sehen, dass nichts gepostet wurde.

**5d.** Kampagnen-Mails (`app/(admin)/admin/marketing/mail/actions.ts:223-282`,
`versenden()`) laufen komplett an `assistent_freigaben` vorbei — kein Reply-Tracking,
kein `nachfassen()`. Gib jedem Kampagnen-Versand eine pro-Empfänger nachverfolgbare
Antwortadresse (z. B. `antwort+<versandId>@` statt der generischen `LEAD_TO`/
`MAIL_REPLY_TO`), und schreibe den Versand zusätzlich als Zeile mit in die Struktur, die
`ladeVersandListe()` (`lib/assistent/versand.ts:304`) bereits unified — damit
`findeUrsprung()` (`lib/eingang.ts:113`) eine Antwort darauf überhaupt zuordnen kann.

**5e.** Nachdem 5d steht: zeige auf `/admin/marketing/mail` eine EINE Zeitleiste
(Versand-Liste + Kampagnen-Liste zusammengeführt) statt zwei getrennter Listen.

---

## Phase 6 — Die zwei Automatisierungs-Motoren sollen sich kennen

**Befund:** `lib/automation.ts` (nie-externe-Wirkung, nur interne Erinnerungen) und
`lib/assistent/truppe.ts` (echte Aktionen nach Freigabe) laufen komplett unabhängig —
beide können für denselben Deal unabhängig voneinander einen Hinweis erzeugen.

**6a.** In `lib/assistent/agent.ts`, der `vertrieb()`-Agent (Zeilen ~72-98): statt
Warnungen komplett neu aus `ladeVerkaufslage()` abzuleiten, lies zusätzlich offene
`automation_runs` für denselben Deal und unterdrücke eine doppelte Meldung, wenn dort
bereits etwas Gleichwertiges offen steht. Keine der beiden Engines wird abgeschaltet —
nur die Doppelmeldung wird vermieden.

**6b.** `lib/betrieb-alarm.ts:22` (`TAEGLICHE_AGENTEN`) überwacht nur 3 von 7 Agenten auf
Stillstand. Erweitere die Liste um die drei wöchentlichen (`rat`, `jaeger`, `kapital`,
sowie `redaktion` falls noch nicht enthalten — prüfe den aktuellen Stand der Konstante im
Code, nicht blind ergänzen was schon da ist).

---

## Phase 7 — Öffentliche Seite: zwei konkrete Lecks schließen

**7a.** `app/(de)/termin/buchen/[token]/*` existiert NUR unter `(de)` — EN/TR/AR-Leads
bekommen nach der (korrekt lokalisierten) Anfrage eine komplett deutsche
Bestätigungsseite und -Mail (`lib/termine/store.ts`, `lib/termine/mail.ts` haben kein
`locale`-Feld). Ergänze ein `locale`-Feld entlang der bestehenden Termin-Kette (von der
Anfrage, wo die Sprache bereits bekannt ist, bis zur Bestätigungsmail) und lokalisiere
Seite + Mailtext nach demselben Dictionary-Muster wie `components/termin/termin-wizard.tsx`.

**7b.** `app/(de)/termin/buchen/[token]/page.tsx:31-32` nutzt `mailto:kontakt@creadig.de`
als Fallback — die einzige Stelle im Repo mit dieser Adresse, überall sonst
(`lib/site-data.ts`) ist es `info@creadig.de`. Korrigiere auf die kanonische Adresse,
außer du bestätigst (DNS/Postfach-Check, falls möglich, sonst Owner-Hinweis im
Abschlussbericht statt Annahme), dass `kontakt@creadig.de` tatsächlich aktiv überwacht
wird.

---

## Phase 8 — Kleine, echte Aufräumarbeiten

**8a.** `lib/zentrale/projektion.ts` — 0 Importeure (verifiziert per Grep). Löschen.

**8b.** `/admin/beleg` (`lib/beleg-betrieb.ts`) und `scripts/check-beleg.mjs` teilen den
Namen, beantworten aber unabhängige Fragen; die Admin-Seite zeigt nie, ob das CI-Gate
aktuell rot ist. **Nicht umbenennen** (Lesezeichen/Gewohnheit) — ergänze auf `/admin/beleg`
stattdessen eine kleine, ehrliche Anzeige des letzten `check-beleg.mjs`-Laufs (grün/rot,
mit den konkreten Verstößen falls rot). Wenn kein Lauf-Protokoll existierst, das lesbar
wäre, lege ein minimales (Datei oder Tabellenzeile) an, das der CI-Schritt selbst
schreibt — keine Parallelstruktur zum bestehenden Skript, nur sein Ergebnis sichtbar
machen.

**8c.** `/admin/verbindungen` (`lib/verbindungen-pruefung.ts:82`) speichert
Probe-Ergebnisse in einer modul-lokalen `Map` — auf Vercel serverless nicht über
Invocations hinweg garantiert. Verlege das Protokoll in eine kleine Neon-Tabelle
(`fin_abgleich`-Muster aus `lib/finanz/fibero-abgleich.ts` als Vorbild: Quelle, Zeitpunkt,
Ergebnis) statt In-Memory.

---

## Phase 9 — Verifikation (nicht überspringbar)

- `npm run build` (oder das Äquivalent dieses Repos) läuft durch, keine neuen
  Typ-/Lint-Fehler.
- `npm run finanz-drill` (falls noch vorhanden/aktuell) läuft grün.
- Für JEDE neu gebaute Verbindung einen konkreten Testdurchlauf, nicht nur Code-Lesen:
  z. B. eine Test-Opportunity (klar als Test markiert, nie echte Kundendaten) auf `won`
  setzen und verifizieren, dass wirklich ein `fin_dokumente`-Entwurf entsteht (Phase 2a);
  einen Test-Bank-CSV-Posten als Ausgabe buchen (Phase 1a); den Cockpit-Wert vor/nach
  3a vergleichen.
- `git diff --stat` gegen den Startpunkt in den Abschlussbericht.

## Phase 10 — Grenzen, die du NICHT selbst entscheidest
- Die Freigabe-Pflicht (ein Klick des Owners) bleibt für JEDE nach außen wirkende Aktion
  (Mail, LinkedIn, Löschen) exakt wie heute — in keiner Phase automatisierst du das Senden
  ohne Klick weg.
- Keine erfundenen Kunden, Beträge, Steuernummern oder Belege — Testdaten nur klar
  markiert, nie in echten Tabellen stehen lassen.
- `/admin/beleg` oder `scripts/check-beleg.mjs` werden nicht umbenannt oder ersetzt, nur
  verbunden (8b).
- Kein `git push`, kein Merge — das entscheidet der Owner nach Durchsicht.

## Definition von „fertig"
- [ ] Phasen 1–8: jede Teilaufgabe entweder umgesetzt+verifiziert, oder mit explizitem,
      technischem Grund als „aus X Grund nicht möglich" benannt (kein stilles Weglassen).
- [ ] Phase 9 vollständig durchlaufen, inklusive der konkreten Testdurchläufe.
- [ ] Phase 10 in keinem Punkt verletzt.
- [ ] Abschlussbericht: Datei-Liste pro Phase, `git diff --stat`, und eine kurze Liste
      aller Stellen, an denen du eine Annahme getroffen hast, die der Owner prüfen sollte
      (z. B. 7b: ob `kontakt@creadig.de` wirklich überwacht wird).
