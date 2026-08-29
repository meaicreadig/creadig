# creaDIG 1.0 — Company Operating System
## Master-Leiter · MP-A → MP-F · Stand 29.08.2026 · Rev. 2 (Peer-Review)

> **Zweck:** Die externe Unternehmens-Architektur-Analyse (KIZILELMA §12) in **sechs efsane Master-Prompts** verwandeln.  
> **Regel:** Eine Stufe = ein Chat = ein Ziel. Nach Abschluss: Commit + Kurzbericht. Nächste Stufe auf Owner-Befehl.  
> **Site-Code-Prompts** (`EFSANE`, `WEITERENTWICKLUNG`, `BETRIEB`) bleiben gültig — **dieser** Leiter ist die **Firmen-Maschine hinter der Site**.  
> **Hard locks:** Black Lock · kein Admin-Nagging · Motiv AUS · System-Haus (nie Digitalagentur) · ruhige Markensprache.  
> **Engineering:** `Unknown ≠ invented default.` Fehlende Daten bleiben offen — nie raten.

---

## Wie du die Leiter benutzt

```
Owner sagt „MP-A“ / „Brand locken“     → nur MP-A
Owner sagt „weiter“ / „MP-B“           → nächste freigegebene Stufe
Owner sagt „alles auf einmal“          → ablehnen; Leiter zeigen; MP-A/offen starten
```

**Erfolg einer Stufe:** messbares Artefakt + `tsc --noEmit` wenn Code + 5–8 Zeilen Bericht (Backend vs Frontend).

**Knowledge Map:** `docs/README.md` — welche Datei Canon / Spec / Working Note / Archive ist.

---

## Merdiven (Topologie — kein starrer Strich)

```
                    ┌──── MP-C PROOF ────┐
                    │  (kann OPEN bleiben) │
                    │                    │
MP-A BRAND ──► MP-B COMPANY OS ──► MP-D SALES
                    │                    │
                    │                    ▼
                    │               MP-E MARKETING
                    │                    │
                    └────────► MP-F SCALE
```

| Code | Stufe | Dauer | Haupt-Artefakt | Parallel-Regel |
|------|--------|-------|----------------|----------------|
| **MP-A** | LOCK THE BRAND | ✅ | Canon + Design-System + Principles | — |
| **MP-B** | COMPANY OS Kern | ✅ | Lead-Ref + UTM-fähig + cta_click/booking_step | — |
| **MP-C** | PROOF | **OPEN / MATERIAL-BLOCKED** | Screens/Cases/Empty-States | Darf OPEN bleiben; **kein unverifizierter Proof live**. MP-D execution permitted. |
| **MP-D** | SALES ENGINE | ✅ | Betriebscheck + Sales-Specs | Nach MP-B; wartete nicht auf volles MP-C |
| **MP-D.5** | CONVERSION ACCEPTANCE | **nächste Stufe** | Manuelle Kette prüfen — Code nur bei echtem Defekt | Kein Feature. Kein MP-E. |
| **MP-E** | MARKETING | nach D.5 | Branchen-LP + UTM-Client (nach Datenschutz) | Erst nach Acceptance |
| **MP-F** | SCALE | Plan first | Blueprint; Builds nur mit Owner-Freigabe | **Portal-Gate** |

**Parallel erlaubt (klein):** Site-Polish aus `EFSANE` während A/B — kein neues Produkt-Feature außerhalb der Stufe.

### Customer Portal Build Gate (MP-F)

`my.creadig` **nicht** bauen, solange:
- kein echter operativer Bedarf („Ticket/Rechnung/Status wo?“), **und**
- kein explizites Owner-OK.

Default MP-F = Spec. Build = Ausnahme.

---

# MP-A · LOCK THE BRAND
## Status: ✅ erledigt 29.08.2026 (Rev. 1)

Artefakte: `docs/brand/*` · `components/ui/disclosure.tsx` · Leistungen-Disclosure · ProductMaturity-Felder (null) · TR-Canon-Slogan.

---

# MP-B · BUILD THE COMPANY OS (Kern)
## Copy-Paste-Prompt (kompletter Chat) — Rev. 2

```
Du bist CTO für creaDIG. Omurga KIZILELMA §12.6 + creadig-MASTER-PROMPT-COMPANY-OS.md MP-B Rev. 2.
Kein Marketing, kein Portal-UI, kein Fake-Proof. Black Lock.
Unknown ≠ invented default.

ZIEL: Ein Lead landet nicht mehr „irgendwo in der Inbox“ — ohne paralleles Zweit-System.

═══ VIER HARTE REGELN (vor jedem Code) ═══

A) CURRENT-STATE MAP FIRST
   Bevor du CRM/Lead-Abstraktionen baust: bestehende Flüsse kartieren.
   Ausgabe: docs/ops/lead-current-state.md
   Kontakt / Booking / Produkt-Anfrage → useLeadSubmit → API → Mail/DB/? 
   TARGET-STATE erst danach. Keine zweite Persistence-Schicht neben der bestehenden.

B) INTERNAL ID ≠ LEAD REFERENCE
   Technisch: UUID / cuid / ulid als immutable Primary Key.
   Menschlich: CD-YYMMDD-#### als reference (operativ, Mails, Owner).
   Die CD-Nummer ist KEIN DB-Primary-Key. Sequence-Kollisionen nicht auf PK abwälzen.

C) DREI GETRENNTE STATE MACHINES (nicht eine Pipeline)
   SALES: New → Contacted → Qualified → Discovery → Audit → Proposal → Negotiation → Won | Lost
   DELIVERY: Onboarding → Planning → Build → Review → Go-Live → Completed
   CUSTOMER: Active → Managed → Expansion → Paused → Churned
   Lead-Status ≠ Project-Status ≠ Customer-Lifecycle.

D) ANALYTICS = GENERIC EVENT + PROPERTIES
   Nicht: product_view_fibero, case_view_nv_swiss (Event-Explosion).
   Sondern: product_view { product, locale, source_page }
            case_view { case, locale }
            cta_click { cta, location, page }
            booking_step { step, locale }
   Spec: docs/ops/analytics-events.md — Hooks nur wo Infra existiert, sonst Spec + Stub.

═══ AUFGABEN-REIHENFOLGE ═══

0) docs/ops/lead-current-state.md (Map CURRENT → TARGET) — PFLICHT zuerst.
1) docs/ops/crm-schema.md — Lead-Objekt + die drei State Machines + reference-Format.
2) Code nur: bestehende useLeadSubmit / app/api/lead erweitern
   - interne id + reference CD-YYMMDD-#### erzeugen/zurückgeben
   - Felder: source, landingPage, country, language, company, interest, employees?, score?, salesStatus, utm*
3) docs/ops/analytics-events.md nach Regel D.
4) docs/ops/sop-lead-handling.md (wer antwortet, interner SLA — keine Kundenversprechen erfinden).
5) tsc --noEmit. Kein Deploy. Commit nur auf Owner-Befehl.

BERICHT: Current-State · was live im Code · was nur Spec · nächster Hebel MP-C/D.
```

---

# MP-C · PROOF
## Copy-Paste-Prompt

```
Du bist CTO/UX für creaDIG. Stufe MP-C — PROOF DENSITY.
Black Lock: KEINE erfundenen Screenshots, Logos, Zahlen, Testimonials.
Wenn Asset fehlt: ehrlicher Empty State („folgt“) — nie Fake-Dashboard.
Unknown ≠ invented default. ProductMaturity bleibt null bis Owner bestätigt.

PARALLEL: Diese Stufe darf OPEN bleiben, während MP-D startet —
solange kein unverifizierter Proof veröffentlicht wird.

1) Inventar: PRODUCT_SCREENS, CLIENT_LOGOS, Cases, Quotes — Lückentabelle.
2) Code: Empty States + drop-in Pfade/Docs.
3) Case-Template: Ausgangslage → Problem → System → Architektur → Ergebnis → Betrieb → Zahlen
4) Product Maturity nur mit Owner-Werten setzen.
5) Image Bible verlinken; keine Stock-Bilder ohne Owner.

BERICHT: Owner-Blocker · technisch bereit · Backend vs Frontend.
```

---

# MP-D · SALES ENGINE
## Status: ✅ erledigt 29.08.2026

Artefakte: `/betriebscheck` DE+TR · `lib/betriebscheck.ts` · `docs/sales/*` · Lead `source: betriebscheck`.

---

# MP-D.5 · CONVERSION ACCEPTANCE (Gate — kein Feature)
## Copy-Paste-Prompt (kompletter Chat)

```
Du bist QA/CTO für creaDIG. Stufe MP-D.5 — Conversion Acceptance.
KEIN neues Feature. KEIN MP-E. KEIN Portal. KEIN Fake-Proof.
Black Lock. Code NUR wenn du einen echten Defekt beweist.

Lies creadig-MASTER-PROMPT-COMPANY-OS.md (Status: MP-C OPEN/MATERIAL-BLOCKED).

AUFGABE: Die Kette manuell prüfen und dokumentieren:
docs/ops/conversion-acceptance.md — Checkliste mit PASS/FAIL + Beleg.

Pflichtpfade:
1. Desktop DE → /betriebscheck → 15 Fragen → Ergebnis → Form → Lead
2. Mobile DE → dieselbe Kette
3. Desktop TR → dieselbe Kette
4. Mobile TR → dieselbe Kette
5. Hero/Closing Project→/termin → booking steps → lead
6. WhatsApp / Contact-Direktwege → richtige Ziele
7. Error states (leere Pflichtfelder, privacy, token)
8. Double-submit
9. Refresh/Back während Check — was passiert mit Antworten?
10. 100/100 → „kein Engpass“-Satz (nicht Identity→Digital)
11. 0/100 bzw. viele Nein → Engpass + „X Punkte selbst offen“
12. Mail: Referenz CD-…, source, locale korrekt (wenn Env erlaubt; sonst Spec-Hinweis)

Browser-Tools nutzen. Am Ende: nur FAIL-Fixes committen (Owner-Befehl).
Kein UTM-Client. Keine Managed-Tiers. Keine TR-Umschreibung außer klarer Bug.

BERICHT: PASS/FAIL-Tabelle · Fixes · was Owner noch prüfen muss (TR-Ton).
```

---

# MP-E · MARKETING ENGINE
## Copy-Paste-Prompt

```
Du bist CTO/Growth für creaDIG. Stufe MP-E — NUR nach MP-D.5 PASS
ODER Owner explizit „Marketing trotz Lücke“ sagt.
UTM-Client erst nach Owner-Datenschutz-Satz.
Attribution-Spec (first/last touch) in docs — Code nur mit Consent-Klarheit.

1) Branchen-LP Handwerk — KEIN klassisches SEO-Landing („Vorteile der Digitalisierung“).
   creaDIG-Sprache:
   „Ihr Betrieb läuft. Aber wie viel davon noch per Hand?“
   Workflow-Bruch zeigen: ANFRAGE → ANGEBOT → TERMIN → AUFTRAG → DOKUMENTATION → RECHNUNG
   (Ist: Telefon/WhatsApp/Word/Papier — Soll: ein Betrieb).
   CTA → Betriebscheck / Kontakt. Keine Fake-Stats.

2) Insights = Build Notes (docs + 1 Beispiel-Struktur) — kein SEO-Spam.

3) Marketing-CTAs → generic events + properties (MP-B Regel D).

4) docs/ops/utm-playbook.md

5) Tracking-Ready-Checkliste — kein Ads-Budget erzwingen.

BERICHT: Landing live? · Tracking ready? · Owner-Lieferliste Ads.
```

---

# MP-F · SCALE BLUEPRINT (+ selektiver Build)
## Copy-Paste-Prompt

```
Du bist CTO für creaDIG. Stufe MP-F — Scale. PLAN first.
Customer Portal Build Gate: siehe oben — ohne operativen Bedarf oder Owner-OK kein Build.

Erzeuge docs/roadmap/creadig-1-0-scale.md mit:

1) Customer Portal my.creadig — IA only
2) Trust Center + Status Page Spez
3) creaDIG Pulse + System Health Score
4) Managed Tiers detailliert
5) meAI Intelligence-Layer (Use Cases, keine Fantasie ohne Daten)
6) Hiring-Reihenfolge (Ops → Dev → Design → Sales → Support)
7) Revenue-Mix-Rahmen (Owner setzt Targets)
8) 12-Monats-Definition creaDIG 1.0 (KIZILELMA §12)

Dann: Owner nennt 1–2 Builds → nur die.

BERICHT: Blueprint · freigegebene Builds · zurückgestellt.
```

---

## Drei Systeme (nicht vermischen)

| System | Was | Wo |
|--------|-----|-----|
| **Website** | Was der Kunde sieht | `app/` · `components/` · `EFSANE` |
| **Company OS** | Wie die Firma läuft | dieser Leiter · `docs/ops/` · `docs/sales/` |
| **Knowledge OS** | Was Autorität hat | `docs/README.md` · Canon/Spec/Note/Archive |

---

## Quer-Referenzen

| Datei | Rolle |
|-------|--------|
| `docs/README.md` | Knowledge Map (Authority) |
| `KIZILELMA-creaDIG.md` §12 | Omurga der Drittanalyse |
| `creadig-MASTER-PROMPT-EFSANE.md` | Site-Evolution |
| `creadig-MASTER-PROMPT-WEITERENTWICKLUNG.md` | Autonomer Site-Zyklus |
| `creadig-MASTER-PROMPT-BETRIEB.md` | Betrieb/Deploy |
| `.cursor/rules/creadig-autonomous-dev.mdc` | Anti-Nagging |

---

## Owner-Kurzbefehl (Türkçe)

| Owner der | Agent yapar |
|-----------|-------------|
| `MP-A` / `Markayı kilitle` | Brand Lock (✅) |
| `MP-B` / `Company OS` | Lead-OS (✅) |
| `MP-C` / `Kanıt` | Proof — **OPEN / MATERIAL-BLOCKED** |
| `MP-D` / `Satış motoru` | Betriebscheck (✅) |
| `MP-D.5` / `Acceptance` | Conversion-Kette prüfen — kein Feature |
| `MP-E` / `Marketing` | Branchen + UTM-Client (nach Datenschutz) |
| `MP-F` / `Ölçek planı` | Blueprint; Portal gate |
| `merdiven` / `leiter` | Özet + sıradaki açık basamak |

**Sıra:** A → B → (C OPEN ∥ D) → **D.5** → E → F. C asset beklerken D durdu; E D.5’ten sonra.
