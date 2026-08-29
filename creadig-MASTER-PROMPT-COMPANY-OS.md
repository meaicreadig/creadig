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
| **MP-C** | PROOF | Inventar ✅ · **MATERIAL-BLOCKED** | `docs/ops/proof-inventory.md` | Weiter nur als C.1→C.3 — nichts erfinden |
| **MP-C.1** | PRODUCT TRUTH | ✅ | Demo-Data-Standard · Proof-Arten · maturity schlägt Ableitung (alle null) · Orphans unberührt | Kein Fake-Screen |
| **MP-C.2** | FIBERO VISUAL | ✅ Pipeline · **MATERIAL-BLOCKED** | Caption/Canon angebunden · Drop-in getestet · keine Fake-PNGs | Wartet auf Owner-Screens (echte UI + synthetische Daten) |
| **MP-C.3** | CLIENT PROOF | nach Freigaben | NV SWISS / maqam / Logos / ggf. Handwerk-Kunde | Nur mit Owner-OK |
| **MP-D** | SALES ENGINE | ✅ | Betriebscheck + Sales-Specs | — |
| **MP-D.5** | CONVERSION ACCEPTANCE | ✅ 12/12 | WhatsApp-i18n-Fix | Live-Mail-SELFTEST Owner-Gate |
| **MP-E** | MARKETING | ✅ | Handwerk-LP · UTM Spec · Build Notes | Keine weitere Branche |
| **MP-E.5** | MARKETING ACCEPTANCE | ✅ 10/10 | LP↔Leistung Rückweg · Events · hreflang | — |
| **MP-F** | SCALE BLUEPRINT | nach C-Fortschritt | Spec only · Portal-Gate | Kein Build ohne Owner |

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

# MP-C · PROOF (Mikro-Stufen)
## Status: Inventar ✅ · MATERIAL-BLOCKED für Client-Proof

Inventar: `docs/ops/proof-inventory.md`. Orphans: DO NOT PUBLISH.

### Proof-Arten (Canon)
Eigenes Produkt · Kundenprojekt · Kundenergebnis — nicht vermischen.

---

# MP-C.1 · PRODUCT TRUTH
## Copy-Paste-Prompt

```
Du bist CTO für creaDIG. Stufe MP-C.1 — Product Truth.
Black Lock. Kein Fake-Screenshot. Kein Client-Case freischalten.
Kein Portal. Keine neue Branche. Unknown ≠ invented.

ZIEL: Wahrheitsschicht vor Visual Proof — Spec + nur Owner-bestätigte Werte.

1) docs/ops/demo-data-standard.md
   - echte UI erlaubt
   - Daten nur synthetisch / erkennbar Demo („Musterbetrieb Nord GmbH“)
   - optional sichtbares „Demodaten“-Label-Regel
   - echte Kundendaten in Screens = Verbot

2) docs/ops/proof-kinds.md (kurz)
   Eigenes Produkt | Kundenprojekt | Kundenergebnis — Freigabe-Matrix

3) Product maturity: NUR setzen wenn Owner in diesem Chat explizit
   live|pilot|private-beta|in-development je Produkt nennt.
   Sonst null lassen + Tabelle „wartet auf Owner“ in Bericht.

4) Orphan assets: bir-damla-hayir.png, rumis-maison.png
   - nicht verdrahten
   - wenn Owner „archivieren“ sagt: aus public/works entfernen/verschieben
   - sonst nur DO NOT PUBLISH belassen (Inventar)

5) Optional Code: maturity Badge rendern NUR wenn Wert gesetzt
   (kein „offen“-Badge der wie Status wirkt, außer Canon fordert es)

tsc + a11y wenn Code. Commit auf Befehl.
Bericht Türkisch: was Owner noch liefern muss für C.2 (fibero Screens).
```

---

# MP-C.2 · FIBERO VISUAL PROOF
## Copy-Paste-Prompt (kompletter Chat)

```
Du bist CTO/UX für creaDIG. Stufe MP-C.2 — fibero Visual Proof.
Voraussetzung: MP-C.1 Canon (demo-data-standard.md · proof-kinds.md).
Black Lock. Unknown ≠ invented.

GOLDENE REGEL (verbindlich):
- Produkt im Display = pixelgetreu echte fibero-Oberfläche (Demo-Instanz).
- Umgebung (Laptop/Büro/Licht) darf fotografisch/generiert sein.
- VERBOTEN: AI-generiertes Dashboard / erfundene UI als „Proof“.
- VERBOTEN: Produktionsdaten, echte Kundennamen/Beträge/Adressen.
- Label unter dem Bild: „Echte Oberfläche, Demodaten.“ / TR-Äquivalent.
- Kategorie: Eigenes Produkt — NIEMALS als Kundenprojekt/Kundenergebnis verkaufen.

Wenn Owner noch KEINE Screens geliefert hat:
→ nur Drop-in-Slots prüfen, Empty States ehrlich lassen, Bericht „wartet auf Material“.
→ KEINE Platzhalter-UI erfinden.

Wenn Owner 3–5 PNGs liefert (Auftragsliste · Auftrag-Detail/Doku · Abrechnung):
1) nach public/works/products/fibero/ ablegen
2) npm run build → PRODUCT_SCREENS regenerieren
3) Mockup-Note entfernen wo echte Screens stehen
4) Demodaten-Label in UI anbinden (Canon-Text aus dictionary wenn nötig)
5) maturity NUR setzen wenn Owner fibero=… sagt

Orphans / NV-SWISS: nicht verdrahten. NV-SWISS später: echter Site-Screenshot
in Device-Szene — keine erfundene NV-Oberfläche.

tsc + a11y. Commit auf Befehl. Bericht Türkisch.
```

---

# MP-C.3 · CLIENT PROOF (nur mit Freigaben)
## Kurzbefehl

```
MP-C.3 — Logos/Cases/Quotes nur mit Owner-Freigabe. approved:true nie raten.
Handwerk-Kundenfall oder warten. Orphans nicht verdrahten.
Echter Kunden-Screenshot in Device-Mockup OK; generierte Kunden-UI VERBOTEN.
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
| `MP-A`…`MP-E.5` | ✅ (E.5: LP↔Leistung) |
| `MP-C.1` | Product Truth (✅) |
| `MP-C.2` | Pipeline ✅ — Screens **Owner** (MATERIAL-BLOCKED) |
| `MP-C.3` | Client Proof / Case-Freigabe (**şimdi** paralel) |
| `MP-F` | Blueprint — sonra |
| `merdiven` | Özet |

**Kalan efsane basamak (çekirdek):** **2** — C.3 → F (+ C.2 drop-in when PNGs).  
**C.2 durumu:** kod READY, materyal yok — uydurma yok.  
**Owner-kapılar:** fibero PNGs · maturity · Case-Freigabe · Live-Mail · Datenschutz.
