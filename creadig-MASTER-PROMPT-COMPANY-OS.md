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
| **MP-C** | PROOF | **OPEN / MATERIAL-BLOCKED** | Inventar + Empty States nach E.5 — **kein** erfundener Proof | Größte Lücke: Handwerk-Case + Product Screens |
| **MP-D** | SALES ENGINE | ✅ | Betriebscheck + Sales-Specs | Nach MP-B; wartete nicht auf volles MP-C |
| **MP-D.5** | CONVERSION ACCEPTANCE | ✅ 12/12 PASS | `docs/ops/conversion-acceptance.md` · WhatsApp-i18n-Fix | Live-Mail-SELFTEST noch Owner-Gate |
| **MP-E** | MARKETING | ✅ | `/branchen/handwerk` DE+TR · UTM-Playbook · Build-Notes · **kein** UTM-Client · **kein** Ads | Keine 2.–n. Branchen-LP |
| **MP-E.5** | MARKETING ACCEPTANCE | **nächste** | Handwerk→Check + Events + Locale + hreflang — Code nur bei Defekt | Kein Feature |
| **MP-F** | SCALE | danach Spec | Blueprint only; Portal-Gate | Kein Build ohne Owner |

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
## Status: ✅ 12/12 PASS · 29.08.2026

Befund 1 (Ilke 06): WhatsApp-Vortext/ARIA folgten nicht der Locale → `whatsappLink(locale)`.  
Offen (Owner): Live-Mail mit gültigem Resend + `SELFTEST_SECRET`; sessionStorage-Persistenz nur nach Datenschutz; `tel:` nur wenn Nummer veröffentlicht.

---

# MP-E · MARKETING ENGINE (kontrolliert — kein Ads-Sturm)
## Copy-Paste-Prompt (kompletter Chat)

```
Du bist CTO/Growth-Architekt für creaDIG. Stufe MP-E — kontrolliert.
Voraussetzung: MP-D.5 PASS (docs/ops/conversion-acceptance.md).
MP-C bleibt OPEN / MATERIAL-BLOCKED — kein Fake-Proof, keine erfundenen Screens/Zahlen.
Black Lock. Kein Portal. Keine Managed-Tiers. Kein Ads-Budget-Setup.
Unknown ≠ invented default.

ZIEL: Die bestehende Conversion-Kette (Site → Betriebscheck → Lead) messbar und
vertikal ansprechbar machen — nicht „15 Landing Pages“.

═══ REIHENFOLGE ═══

0) Owner-Gates prüfen (kurz in Bericht, nicht naggen):
   - Live-Mail-SELFTEST erledigt? (docs/ops/conversion-acceptance.md)
   - Datenschutz-Satz für UTM/Client-Persistenz vorhanden? Wenn NEIN: UTM-Client
     NICHT bauen — nur Spec + Server-Fähigkeit bleibt.

1) docs/ops/utm-playbook.md
   first touch + last touch + landing page + referrer + lead source
   (siehe analytics-events Attribution-Abschnitt). Keine PII.

2) /branchen/handwerk (+ TR-Äquivalent falls Locale-Pfad klar)
   KEIN SEO-Spam („Vorteile der Digitalisierung“).
   creaDIG-Sprache:
   „Ihr Betrieb läuft. Aber wie viel davon noch per Hand?“
   Workflow-Bruch: ANFRAGE → ANGEBOT → TERMIN → AUFTRAG → DOKUMENTATION → RECHNUNG
   (Ist: Telefon/WhatsApp/Word/Papier — Soll: ein Betrieb).
   CTA primär → /betriebscheck · sekundär → /kontakt oder /termin.
   Keine Fake-Stats. Text nur Owner-Ton / Canon — sonst [VORSCHLAG].

3) Insights = Build Notes Spec (1 Beispiel-Struktur) — kein Blog-Spam.

4) Tracking: bestehende Events nutzen (cta_click, audit_*, lead_submitted).
   UTM-Client NUR wenn Owner Datenschutz freigibt.
   Optional: MagneticButton trackLocation auf Branchen-LP.

5) Tracking-Ready-Checkliste in utm-playbook — Ads erst danach.

tsc + eslint + build + a11y. Commit nur auf Owner-Befehl.

BERICHT Türkisch: Frontend vs Backend · was Spec · was Owner liefern muss.
```

---

# MP-E.5 · MARKETING ACCEPTANCE (Gate — kein Feature)
## Copy-Paste-Prompt

```
Du bist QA/CTO für creaDIG. Stufe MP-E.5 — Marketing Acceptance.
KEIN Feature. KEINE zweite Branche. KEIN Ads. KEIN Fake-Proof. KEIN UTM-Client.
Code NUR bei bewiesenem Defekt. Black Lock.

Dokumentiere docs/ops/marketing-acceptance.md (PASS/FAIL):

1. Desktop+Mobile DE: /branchen/handwerk → CTA → /betriebscheck → (optional) Ergebnis
2. Desktop+Mobile TR: /tr/branchen/handwerk → /tr/betriebscheck
3. CTA targets: primary Check, secondary Termin — Locale korrekt
4. Events: cta_click mit location handwerk-hero / handwerk-bridge (Consent an)
5. Sitemap enthält beide URLs; hreflang/canonical wenn im Projekt üblich
6. Dark/Light + a11y Spot-Check der LP
7. Keine Fake-Zahlen/Referenzen auf der LP
8. Link zu /leistungen/website-handwerk und zurück — keine Dublette der Absicht

Conversion-Definition in docs (nur spezifizieren, nicht erfinden):
- Primary: lead_submitted source=betriebscheck
- Diagnostic: audit_completed
- Later: Qualified / Proposal / Won (Sales pipeline — nicht messen bis CRM Store)

Danach OPTIONAL im selben Chat nur wenn Owner „MP-C Inventar“ sagt:
docs/ops/proof-inventory.md — Lückentabelle PRODUCT_SCREENS / Logos / Cases / Quotes.
Empty-State-Slots vorbereiten. NICHTS erfinden. Handwerk-Case = größte Lücke.

BERICHT Türkisch. Commit auf Befehl.
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
| `MP-E` / `Marketing` | Handwerk (✅) |
| `MP-E.5` / `Acceptance` | LP→Check doğrulama |
| `MP-C` / `Kanıt` | Proof inventar — **OPEN** |
| `MP-F` / `Ölçek planı` | Blueprint only |
| `merdiven` / `leiter` | Özet + sıradaki açık basamak |

**Sıra:** A → B → (C OPEN ∥ D) → **D.5** → E → F. C asset beklerken D durdu; E D.5’ten sonra.
