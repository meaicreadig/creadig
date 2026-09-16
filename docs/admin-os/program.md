# Admin / Owner OS 1.0 · Programmvertrag

> **Authority:** Canon (Programm) · Stand 16.09.2026 · Branch `feat/system-haus-site`
> **Ledger:** `docs/admin-os/state.md` — einzige Statusquelle dieses Programms.
> **Wiedereinstieg:** `CONTINUE ADMIN FINAL PROGRAM` → Ledger lesen · Git prüfen ·
> Blocker prüfen · erste offene owner-unabhängige Arbeit fortsetzen · Grünes nicht neu prüfen.
>
> Dieser Vertrag = Owner-Master-Prompt „ADMIN / OWNER OS 1.0 · FINAL BUILD PROGRAM · 99 %"
> (verdichtet, nicht abgeschwächt) **plus Addendum A1–A10** (16.09.2026).
> Bei Widerspruch gilt: Addendum > Master-Prompt > ältere Control-Center-Dokumente.

---

## 0 · Nordstern

Information → Entscheidung → Handlung → Ergebnis → Messung → nächste Entscheidung.
**Status ist keine Arbeit.** Jede Statuszeile, zu der eine Handlung möglich ist, führt zu ihr.
Optimiert wird auf *weniger Gedanken zwischen „etwas braucht Aufmerksamkeit" und „die richtige Handlung ist erledigt"* — nicht auf mehr Seiten.

## 1 · Harte Regeln (aus dem Master-Prompt)

- **Kein Rewrite** ohne Beleg struktureller Untauglichkeit. Reuse · Extraktion · Migration.
- **CRM-Semantik getrennt:** Anfrage ≠ Kontakt ≠ Organisation ≠ Verkaufschance ≠ Beziehungsgrad ≠ Prospect ≠ Kunde. Keine automatische Chance aus Beziehung.
- **Geschäftssprache zuerst**, Technik in aufklappbarer Systemdiagnose. Kein Gate-/Migrations-/Adapter-Jargon in normaler Owner-UI.
- **Zustände je Datenfläche:** LOADING · READY_WITH_DATA · READY_EMPTY · FILTERED_EMPTY · NOT_CONFIGURED · FORBIDDEN · UNAVAILABLE · STALE · SAVING · SAVED · UNSAVED · FAILED. Nie „0" für „nicht erreichbar".
- **Demo-Daten** nur in markierten Fixtures, nie in echten Owner-Ansichten.
- **DE/TR vollständig** (Labels, Fehler, Leerzustände, Dialoge, aria, Systemmeldungen). Maschinenwerte werden nie übersetzt gespeichert. Admin-Sprache ≠ Kundenkommunikationssprache.
- **Europe/Berlin** als Geschäftszeitzone; Intl-Formatierung; Mitternacht + Sommerzeit getestet.
- **Türkische Suche** İ/I/i/ı getestet.
- **A11y:** Kontrast ≥4,5:1 / ≥3:1, Tastatur, Fokus, Dialoge, Tabellensemantik, Reduced Motion, Chart-Alternative.
- **Mobil** ist eigene Bedienung, kein gestauchtes Desktop.
- **Autorisierung serverseitig** für Lesen, Schreiben, Aktionen, Exporte, Uploads, Integrationen, Einstellungen.
- **READ MUST BE READ.** Kein Seed, Backfill, Ausschluss-Update, keine Wartung im Lesepfad.
- **Produktion:** keine Mutation, Migration, Promote, echte Nachricht/Veröffentlichung, kein neuer Bezahldienst, keine Live-Kontoverbindung ohne **aktuelle** Owner-Zustimmung.
- **Keine Geheimnisse** in Ausgabe, Logs, Docs, Commits, Screenshots. Kein Login-Bypass über `ADMIN_SESSION_SECRET`.
- **G18-Sperre:** `components/legal/legal-page.tsx` · `components/sections/packages.tsx` · `lib/material-status.ts` · `lib/rechnung.ts` · `lib/site-data.ts` · `scripts/rechnung-drill.mjs` — Hashes vor/nach jeder Welle. Bedarf → bestehender Lesepfad oder `BLOCKED_G18`.
- **Worktree:** nur explizites Staging. Nie `add .`/`-A`, `clean`, `reset --hard`, Force-Push, breites Restore/Stash.
- **Screenshots** mit Admin-Daten: nur lokal, nie committen.
- **Tests** nie abschwächen; nicht ausführbar = `NOT_RUN` mit Grund.
- **Owner ist kein Prompt-Router.** Handoff: max. 3 echte Owner-Handlungen.
- **FIXABLE_NOW:** Was im Scope, owner-unabhängig und technisch lösbar ist, wird gelöst — nicht „später".

## 2 · Wellen

| Welle | Ziel | Schließt, wenn |
|---|---|---|
| **ADM-00** Wahrheit/Scope/Architektur | 99 % einfrieren, bevor Features wachsen | eine verifizierte Architektur + eingefrorener kritischer Abnahmeumfang |
| **ADM-01** Arbeitsfläche/Design/i18n | Report-UI → Arbeits-UI; Heute/Cockpit vereinen; Material nach System | Designsprache real, interaktiv, DE/TR, zugänglich, wiederverwendbar |
| **ADM-02** Laufzeit/Auth/Performance/Datengesundheit | schnell, endlich, beobachtbar, nebenwirkungsfrei | Budgets gemessen (oder harte Grenze belegt) + Lesepfad schreibt nicht |
| **ADM-03** Kern-Geschäftsschleife | Anfrage → Org/Kontakt → Chance → nächster Schritt → Pipeline → Gewinn/Verlust → Akte | echter E2E-Fluss mit Reload + Re-Login-Persistenz |
| **ADM-04** Verbindungen/Kanäle | ein Verbindungsmodell, Fähigkeit ≠ OAuth ≠ Profillink | ausgewählte Fähigkeit mit echtem Konto bewiesen (siehe A2) |
| **ADM-05** Betrieb/Kommerz/Beleg | Gewinn → Lieferung → Beleg → Erlaubnis → Freigabe | gewonnene Chance hat wahren nächsten Betriebszustand; Beleg sicher freigebbar |
| **ADM-06** Automation/Analytics/meAI | proaktiv nützlich, belegbasiert | echte evidenzbasierte Next-Action-Intelligenz; Automationen beobachtbar, steuerbar, umkehrbar (siehe A8) |
| **ADM-07** Sicherheit/Resilienz/Schluss | beweisen, dass es Betrieb ist | kritische Abnahmeszenarien A01–A32 + B01–B12 grün |

Ledger je Welle: BUILD · CUTOVER · LIVE EVOLUTION · CLOSURE · Beleg · Blocker · nächste konkrete Handlung.
Statusvokabular: `NOT_STARTED · IN_PROGRESS · BUILT · VERIFIED · WAITING_OWNER · WAITING_EXTERNAL · BLOCKED_G18 · CLOSED`.

## 3 · Kritische Abnahmeszenarien (Master-Prompt)

A01 Login/Sprache · A02 Login-Performance · A03 neue Anfrage · A04 Kunde zuordnen · A05 Kunde/Person anlegen · A06 Dublettenschutz · A07 nächster Schritt · A08 Chance anlegen (Doppelklick = eine) · A09 Pipeline-Wechsel + Rollback · A10 Verlust · A11 Gewinn · A12 Kundenakte · A13 Beleg ohne Freigabe = nicht öffentlich · A14 Widerruf · A15 Verbindung · A16 Verbindungs-Widerruf · A17 doppelter Webhook · A18 Anbieterfehler · A19 DB-Ausfall ≠ „0 Kunden" · A20 Rollen · A21 Datensatz-ID · A22 Sitzungsablauf · A23 Berliner Geschäftstag · A24 türkische Suche · A25 Chart-Drilldown · A26 Mobil · A27 Tastatur · A28 ungespeichertes Formular · A29 Automation · A30 meAI-Evidenz · A31 Backup/Recovery · A32 öffentliche Seite.

Plus der 47-Punkte-Schlussvertrag des Master-Prompts; Punkt 25 und 47 werden durch A2/A3 präzisiert.

---

# ADDENDUM A1–A10 (16.09.2026) · hat Vorrang

## A1 · Eingefrorene Ausgangslage

| Tatsache | Wert | Beleg |
|---|---|---|
| Production-Spitze Website | **`814a02f`** | Vercel `dpl_9LLmNHNvcsowYCWDSvqWGfQYbWCW`, target production, READY, action promote (15.09.2026) — am 16.09.2026 nachgeprüft |
| Website Master Run B | owner-unabhängig **CLOSED ~92 %** | `docs/website-experience/state.md` |
| G18 | **gesperrt** | Hashes in `state.md` |

**Die Website ist NICHT BUILD-Scope dieses Programms.** Keine Neugestaltung, kein Re-Audit. Geprüft wird nur **Regression durch geteilten Code** (A32): betroffene Routen rendern, Lead-Formular/Token, a11y-Suite, Build, Gates.

## A2 · Kritische Integration ≠ optionale Integration

In ADM-00 wird jede Integrationsfähigkeit als **CRITICAL** oder **OPTIONAL** eingefroren.

- CRITICAL-Fähigkeit funktioniert wegen fehlender Anbieterfreigabe nicht → Programm = **`WAITING_EXTERNAL`**, **nicht** „~99 % COMPLETE".
- Nur OPTIONAL-Fähigkeiten dürfen als externer Rest im letzten 1 % stehen.
- Eine Fähigkeit wird nicht nachträglich von CRITICAL auf OPTIONAL herabgestuft, um schließen zu können — nur durch Owner-Entscheidung, im Ledger datiert.

## A3 · Zwei Abschlusszustände

| Zustand | Bedeutung | Wer erklärt |
|---|---|---|
| **OWNER-INDEPENDENT BUILD COMPLETE** | Alles, was ohne Produktionsautorität, Owner-Tatsache, Kundenerlaubnis oder Anbieterfreigabe machbar ist, ist gebaut **und** lokal/Preview verifiziert. Rest ist einzeln benannt. | Agent |
| **LIVE 99 % ACCEPTED** | Cutover in Produktion mit Owner-Zustimmung erfolgt, echter Owner-Arbeitstag durchlaufen (Schlussvertrag 46), kritische Integrationen live. | **nur Owner** |

Der Agent stoppt bei Zustand 1. Er meldet weder falsche 99 % noch geht er eigenmächtig in Produktion.

## A4 · Legacy-Routen

Jede Zusammenlegung/Verschiebung von Admin-Routen bekommt eine Zeile in der **Routen-Karte** (`state.md` §Routen): alte Route → Schicksal (`REDIRECT` · `ALIAS` · `DEPRECATED bis <Datum>` · `REMOVED`) → Ziel → Grund.
Zwei Ansichten mit derselben Aufgabe leben nicht still weiter. Gilt für Heute/Cockpit, Material, alle `/admin/vertrieb/*`-Unterpfade. Muster: bestehende `redirects()` in `next.config.ts` (`/admin/leads` → `/admin/vertrieb/anfragen`). Gemerkte `[id]`-Adressen führen nie auf 404.

## A5 · Nebenläufigkeit und Idempotenz für jeden Schreibpfad

Jede kritische Create/Update/Convert-Aktion (Anfrage anlegen, zuordnen, Org/Kontakt anlegen, Chance anlegen, Stufe ändern, gewinnen/verlieren, Angebot, Beleg-Erlaubnis/-Widerruf, Verbindung, Automation) wird geprüft auf:
Doppel-Submit · veraltetes Schreiben (Versions-/`updated_at`-Prüfung) · Race · Transaktionsgrenze · Rollback bei Teilfehler · Idempotenzschlüssel wo eine Wiederholung eine zweite Geschäftswirkung hätte.
Ergebnis je Aktion als Zeile in `state.md` §Schreibpfade.

## A6 · Web-Sicherheitsfläche des Admin (eigene Abnahme)

B01 `noindex` auf allen Admin-Antworten (HTML **und** Header) · B02 `Cache-Control: no-store` auf allen sensiblen Antworten · B03 Cookie `HttpOnly`/`Secure`/`SameSite` · B04 Sitzungsrotation bei Login, keine Fixation · B05 serverseitiger Widerruf (Logout/Kopie der alten Sitzung ungültig) · B06 Security-Header + CSP im Admin · B07 Origin/CSRF auf Mutationen · B08 dauerhaftes Rate-Limit (nicht nur In-Memory) · B09 sensibler Cache beim Logout geleert (bfcache/Back-Button).

## A7 · Datenlebenszyklus als Domänenverhalten

Von Anfang an im Modell, nicht nachträglich: **Archivieren vs. endgültig löschen** (Standard = archivieren) · Berichtigung · Export je Person (Auskunft) · Löschung je Person mit Kaskadenregel · Konflikt gesetzliche Aufbewahrung vs. Löschwunsch (Sperren statt Löschen, begründet) · **Audit jeder Löschung** ohne den gelöschten Inhalt.
Fristen sind Owner-/Rechtsfakten → bestehendes `docs/ops/neon-decision-pack.md`; bis dahin „unbekannt", nicht erfunden.
Abnahme: B10 Archiv/Löschen · B11 Export/Berichtigung.

## A8 · meAI-Qualitätsvertrag

„KI hat eine Ausgabe geliefert" schließt ADM-06 nicht. Pflicht:
Modell- und Prompt-Versionierung je Ausgabe · Eval-Set aus Fixtures (nicht echte Kundendaten) · Halluzinations-Regressionstest (fehlende Evidenz → „unbekannt") · Latenz- und Kostenmessung je Aufruf · PII-Grenze (was verlässt das System, an wen) · Degraded Mode ohne KI (Rangliste bleibt regelbasiert nutzbar) · **Cross-Record-Leakage-Test** (Ausgabe zu Datensatz X enthält nichts aus Y).
Anbieter-/Kostenentscheidung = Owner (Kostendisziplin). Abnahme: B12.

## A9 · Bestehende Integrationen nicht neu bauen

Vor jedem Adapter: Inventar. Existiert bereits ein funktionierender meAI-, Mail-, Kalender- oder anderer Adapter (auch in `meai`, `meai-os`), wird er **wiederverwendet/geteilt**. **Kein zweiter Gmail-/Kalender-Wahrheitsspeicher** für den Admin.
LinkedIn und Instagram werden als bestehende offizielle creaDIG-Marketingkanäle im Inventar geführt — mit ihrer **tatsächlich** vorhandenen Fähigkeit (Profillink / Autorisierung / Datenoperation getrennt). Keine erfundenen Scopes, keine angenommene Freigabe.

## A10 · Dark Mode

**Entschieden 16.09.2026 (OD-1): POST-99 COMFORT.**
Design-Tokens werden in ADM-01 themefähig gebaut (keine hart codierten Farben in Admin-Komponenten), ein zweites Theme wird **nicht** gebaut und zählt **nicht** zu 99 %.

## A11 · Kritikalität nach Fähigkeit (OD-2, 16.09.2026)

Eingefroren in `state.md` §ADM-00. CRITICAL INBOUND = Website-Formular · manuelle Anfrage · bestehender E-Mail-Anfrageweg nur mit Beleg realer Nutzung **und** wiederverwendbarem Adapter. Alle weiteren Anbieter NON-CRITICAL, außer belegte harte Abhängigkeit. Ein nicht-kritischer Anbieter darf `BLOCKED_EXTERNAL` bleiben, ohne 99 % zu verhindern.
