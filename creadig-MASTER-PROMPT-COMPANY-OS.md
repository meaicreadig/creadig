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
| **MP-C.3** | CLIENT PROOF | 🔴 MATERIAL-BLOCKED · Gerüst ✅ | 3 Clients mit Logo + `customer-photo`; alle `approved:false`, `approvalOnFile:false`. Freigabe-Vorlage steht in `docs/ops/case-format.md` | `approved:true` nur Owner — nie geraten |
| **MP-D** | SALES ENGINE | ✅ | Betriebscheck + Sales-Specs | — |
| **MP-D.5** | CONVERSION ACCEPTANCE | ✅ 12/12 | WhatsApp-i18n-Fix | Live-Mail-SELFTEST Owner-Gate |
| **MP-E** | MARKETING | ✅ | Handwerk-LP · UTM Spec · Build Notes | Keine weitere Branche |
| **MP-E.5** | MARKETING ACCEPTANCE | ✅ 10/10 | LP↔Leistung Rückweg · Events · hreflang | — |
| **MP-F** | SCALE BLUEPRINT | ✅ Blueprint geschrieben · 0 Build-Kandidaten | `docs/roadmap/creadig-1-0-scale.md` — Portal-IA, Trust Center, Pulse/Health, Tiers, meAI, Hiring, Revenue-Rahmen, 1.0-Definition (2/10 grün) | Kein Build ohne Owner · Portal-Gate zu |

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
## Status: ✅ Pipeline READY · MATERIAL-BLOCKED (29.08.2026)

Canon-Konflikt („laufendes System“ vs Demodaten) behoben · Caption angebunden · Drop-in-Probe OK · keine Fake-PNGs.

**Owner liefert:** 3–5 PNGs → `public/works/products/fibero/` → `npm run build`.  
Optional: `fibero` maturity. Danach Device-Fotos nur um **dieselben** echten Pixel.

Goldene Regel: echte UI + synthetische Daten. Staging/lokal OK — Produktiv-Kundendaten nie.

---

# MP-C.3 · CLIENT PROOF
## Status: 🟡 Gerüst 29.08.2026 · Freigaben Owner

Erledigt: Logos+Bilder NV/maqam/BDH · `imageProof` · CaseCard · Inventar · case-format.md.  
Offen: `approved:true` nur mit Freigabe+Satz · Leistungen maqam/BDH · rumis orphan.

## Copy-Paste-Prompt

```
Du bist CTO/UX für creaDIG. Stufe MP-C.3 — Client Proof.
Black Lock. Keine erfundenen KPI. Keine AI-Kunden-UI.
Orphan rumis-maison: nicht verdrahten.
Bir Damla Hayır: Owner 29.08. freigegeben (Logo+Bild) — mit NV/maqam führen.

IST: Logo+Bild für NV SWISS, maqam, Bir Damla Hayır liegen.
Case Studies: approved noch false. CaseCard-Gerüst steht.

1) Case-Format: Projekt · Kategorie · Leistungen (ohne Tech-Stack-Liste).
   Optional tiefer: Ausgangslage → Problem → System → Ergebnis → Betrieb.
   Zahlen nur mit Owner-Quelle.

2) NV SWISS: /works/nv-swiss.jpg (echte Site) — kein Lifestyle-Mockup.
   approved:true NUR mit expliziter Owner-Freigabe + Freigabesatz.

3) maqam + Bir Damla Hayır analog.

4) Portfolio: echte Kundenbilder nicht als „Mockup“ etikettieren.

5) proof-inventory.md aktualisieren.

tsc + a11y. Commit auf Befehl. Bericht Türkisch.
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

**Kalan efsane basamak (çekirdek):** **2** — C.3 Freigabe → F Blueprint (+ C.2 drop-in when PNGs).  
**C.2 durumu:** kod READY, materyal yok — uydurma yok.  
**Owner-kapılar:** Case-Freigabe+Satz · fibero UI-PNGs · maturity · Live-Mail · Datenschutz.

---

# MP-C.3 → MP-F · KAPANIŞ + SCALE (tek Chat)
## Copy-Paste-Prompt — kalan çekirdek merdiven

```
Du bist CTO/UX/Architekt für creaDIG (Einzelunternehmer-Owner).
Omurga: KIZILELMA §12 · Leiter: creadig-MASTER-PROMPT-COMPANY-OS.md.
Knowledge Map: docs/README.md.

ZIEL DIESES CHATS: Die letzten zwei Kernstufen — MP-C.3 schließen (soweit
Owner-Material reicht) und MP-F als Blueprint liefern. Kein Fake-Proof.
Black Lock. Unknown ≠ invented. Kein Impressum-/AVV-Nagging.
Kein Portal-Build ohne Owner-OK. Commit nur auf Befehl. Bericht Türkisch
(Backend/Frontend getrennt). UI-Copy DE (TR-Parität wo Dictionary).

════════════════════════════════════════
IST (29.08.2026 — nicht zurückbauen)
════════════════════════════════════════
✅ MP-A … MP-E.5 (außer Proof-Material & Owner-Gates)
✅ C.1 Demo-Data-Standard / Proof-Arten / maturity-Felder (alle null)
✅ C.2 Pipeline READY — PRODUCT_SCREENS leer; Caption/Demodaten-Label angebunden
✅ C.3 Gerüst: CaseCard · imageProof · case-format.md · inventar
✅ Kunden: NV SWISS · maqam · Bir Damla Hayır — Logo + Kundenbild
✅ Produkte Kartenfotos: meAI · fibero · CASSAMEA = product-photo JPG
   (alte Mockup-PNGs entfernt). meahv: `/works/meahv.jpg` Owner 30.08.
⬜ caseStudies[].approved = false (alle)
⬜ approvalOnFile / approvedSentence fehlen
⬜ maqam + Bir Damla Hayır: card.services / built oft null
⬜ rumis-maison.png = ORPHAN — NICHT verdrahten
⬜ C.2 fibero Interface-PNGs unter public/works/products/fibero/ fehlen
⬜ Live-Mail SELFTEST · UTM-Client-Datenschutzsatz = Owner-Gates (nicht naggen)

Canon Proof-Bild:
  Echte Anwendung + synthetische Daten + null Kunden-PII.
  Staging / local demo / Demo-Tenant egal — nie Produktivdaten.
  Caption Pflicht: „Echte Oberfläche, Demodaten." (DE) / TR-Äquivalent.
  Kein „aus dem laufenden System"/Produktionsversprechen.

════════════════════════════════════════
TEIL A — MP-C.3 CLIENT PROOF (zuerst)
════════════════════════════════════════
Lies zuerst:
  docs/ops/case-format.md
  docs/ops/proof-inventory.md
  docs/ops/proof-kinds.md
  lib/site-data.ts (clientWorks, caseStudies)

A0) Status-Snapshot in 5 Zeilen (was fehlt für approved:true).

A1) Case-Format strikt:
  Kurz: Projekt · Kategorie · Leistungen (KEINE Tech-Stack-Liste).
  Optional tief: start→problem→goal→role→system→delivery→result→today.
  metrics[] NUR mit source. KPI erfinden = VERBOTEN.
  AI-erfundene Kunden-UI = VERBOTEN.

A2) Freigabe-Regel (HARTE TÜR):
  approved:true NUR wenn Owner in DIESEM Chat (oder klar zitiert) liefert:
    (1) schriftliche Freigabe der Nennung UND
    (2) Freigabesatz (Aufgabe/Ergebnis)
  Dann setzen:
    clientWorks[].approvalOnFile = true
    clientWorks[].approvedSentence = { de, tr }
    caseStudies[].approved = true
    card.services / built nur mit Owner-Text (sonst null lassen)
  Ohne (1)+(2): Gerüst verbessern, aber approved bleibt false.
  Kein „fast freigegeben".

A3) NV SWISS · maqam · Bir Damla Hayır parallel führen.
  Bilder: imageProof customer-photo — nie als Mockup etikettieren.
  Produktfotos meAI/fibero/CASSAMEA: product-photo — Demodaten-Note.

A4) Orphan rumis-maison: nicht verdrahten, nicht löschen ohne Owner-Befehl.

A5) proof-inventory.md + docs/ops/case-format.md aktualisieren.
  /status-Lücken ehrlich lassen.

A6) Parallel-Hinweis (kein Blocker): Wenn Owner fibero-PNGs liefert →
  Drop-in public/works/products/fibero/ + npm run build — kein neuer Code.
  maturity nur setzen wenn Owner den Wert nennt.

════════════════════════════════════════
TEIL B — MP-F SCALE BLUEPRINT (nach A, auch wenn A material-blocked)
════════════════════════════════════════
Voraussetzung: PLAN FIRST. Customer Portal Build Gate gilt:

  my.creadig NICHT bauen solange:
  - kein echter operativer Bedarf („Ticket/Rechnung/Status wo?“), UND
  - kein explizites Owner-OK.
  Default = Spec. Build = Ausnahme.

B1) Erzeuge/aktualisiere docs/roadmap/creadig-1-0-scale.md mit:

  1) Customer Portal my.creadig — IA only (Sitemap, Rollen, Leerzustände)
  2) Trust Center + Status Page Spez
  3) creaDIG Pulse + System Health Score (Definition, keine Fake-Zahlen)
  4) Managed Tiers detailliert (was enthalten / nicht — Preise nur wenn Owner)
  5) meAI Intelligence-Layer (Use Cases nur wo Datenpfad realistisch)
  6) Hiring-Reihenfolge (Ops → Dev → Design → Sales → Support)
  7) Revenue-Mix-Rahmen (Owner setzt Targets — Platzhalter ok, keine erfundenen €)
  8) 12-Monats-Definition creaDIG 1.0 (KIZILELMA §12)

B2) Knowledge Map (docs/README.md): MP-F Status + Link zum Blueprint.
B3) COMPANY-OS Leiter-Tabelle: C.3/F Statuszeilen ehrlich setzen.
B4) Owner nennt 1–2 Builds → NUR die spezifizieren als „Build-Kandidat".
   Alles andere bleibt Spec. Kein Portal-UI-Code ohne OK.

════════════════════════════════════════
REIHENFOLGE IM CHAT
════════════════════════════════════════
1) Teil A Snapshot + was Owner noch senden muss (Freigabe+Satz / Leistungen)
2) Wenn Owner-Material kommt → verdrahten; sonst A material-blocked belassen
3) Teil B Blueprint vollständig schreiben
4) Kurzbericht Türkisch:
   - C.3: was live / was gesperrt
   - F: Blueprint-Pfad · Build-Kandidaten · zurückgestellt
   - Backend vs Frontend
5) tsc (+ a11y wenn UI). Commit/Push NUR auf Befehl.

════════════════════════════════════════
NICHT TUN
════════════════════════════════════════
- approved:true raten
- KPI / Reviews / AggregateRating erfinden
- rumis verdrahten
- Produktivdaten-Screens
- Portal/my.creadig implementieren
- Impressum/USt/AVV anfragen
- screenshots 2/ oder .tmp-review/ committen ohne Owner-Klarheit
```

