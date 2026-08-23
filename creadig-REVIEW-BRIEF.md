# creaDIG — Review-Brief für v0 · NUR ANALYSE, kein Bauen

> **Stand:** 23.08.2026 · Branch `feat/system-haus-site` · dieses Paket = alle unsere Analysen + dieser Brief.
> Der **Code** kommt separat als ZIP (unser lokaler Stand).

---

## 0 · Dein Auftrag in EINEM Satz
Prüfe unseren überarbeiteten Stand (Code-ZIP) **und** unsere Analysen (dieses Paket) und sag uns **strukturiert, was uns zu 100 % noch fehlt** — inklusive der **blinden Flecken**, die wir selbst übersehen haben.
**Du baust nichts. Du schreibst keinen Code. Du lieferst kein Redesign. Nur eine Analyse.**

---

## 1 · Kontext & Weg
- **creaDIG** = ein **System-Haus** (Osnabrück, gegr. 2017), das eigene Produkte erfindet/baut (meAI, fibero, CASSAMEA, meahv) **und** Kunden bedient (Marke · Web · Digitalisierung · KI). Zielgruppe: **Handwerk & KMU, Schwerpunkt Deutschland**, offen für alle Unternehmen. Zweisprachig DE/TR.
- **Der Weg:** Die erste Fassung der Seite kam von **dir (v0)**. Wir haben sie danach in **Terminal Claude Code** sehr stark überarbeitet (ganzer KOMPLETT-Lauf, Phasen 1–5, ~100 Commits). **Es bleiben trotzdem Lücken.**
- **Warum du:** Wir wollen einen frischen, kritischen Blick von außen — was fehlt, was ist schwach, was haben **wir** in unseren eigenen Analysen übersehen.

---

## 2 · Aktueller Stand — was schon steht (damit du nicht Erledigtes vorschlägst)
- **Wahrheit/Content:** Glasfaser-Tätigkeit (creaDIG fiber, Telekom, Glasfaser NordWest, 1&1, Drillisch) von der öffentlichen Seite entfernt (fibero-Produkt bleibt). Echte Kundenreferenzen ergänzt: **NV SWISS** (nvswiss.ch) + **maqam**. Eigene/unbestätigte Projekte NICHT als Kundenwerk (NÛR = eigenes Produkt, Rumi's = unbestätigt, Bir Damla Hayır = offen). „Im Aufbau"-Zustände entschärft. go-digital-Copy komplett entfernt (Status rechtlich offen). KI-Attrappen-Chat entfernt.
- **Vertrieb:** Preisleiter **2.400 → 3.900 € netto + 149 €/Mon** (netto zzgl. 19 % USt). Kontaktformular mit echter Zustellung (`app/api/lead`, Resend/SMTP über ENV, Honeypot, Bestätigungsmail), kein Fake-Erfolg mehr. Produkt-Nachfragepfad. Cookiefreies Analytics + Ereignis „Anfrage" (hinter Consent).
- **Premium/Struktur:** drei Sektions-Archetypen (Editorial · Raster · Band) statt einer Frequenz, echter Rhythmus, dunkle Bänder, `/unternehmen` als echte Firmenseite (Etappen 2017→heute), NV-SWISS-Referenzband, mehrere Mikro-Interaktionen.
- **Technik/SEO/Security:** Deploy-Fehler behoben (Function 23,5/200 MB) + Größen-Gate. **`/tr/` echte Route** (`<html lang="tr">`, hreflang, zweisprachige Sitemap, 54 statische Seiten). next/image + AVIF. CSP (teils enforce, teils report-only + `api/csp-report`), JSON-LD zentralisiert & escaped, Art.-49-Consent-Hinweis, Speicherfristen in der Datenschutzerklärung.
- **Zustand:** `npm run build` grün, tsc + lint sauber, alle Routen liefern 200. **Nichts ist live** (bleibt auf `feat/system-haus-site`, nicht auf `main`).

---

## 3 · BLACK LOCK — gesperrte Entscheidungen (NICHT in Frage stellen)
1. **Ehrlichkeit ist die härteste Regel.** Keine erfundenen Zahlen, Zitate, Reviews, Logos, Kundennamen. Eigene/fremde Projekte werden NIE falsch als Kundenwerk etikettiert. Fehlt echtes Material → Sektion rendert `null` (kein Platzhalter), Ausnahme: klar markierte Impressum-Platzhalter bis zum Livegang.
2. **Eigene Produkte:** meAI · fibero · CASSAMEA · meahv. **fibero bleibt** (auch wenn Glasfaser-Domäne).
3. **Glasfaser-Geschäft** bleibt von der öffentlichen Seite fern (privater Motor).
4. **Echte Kunden:** NV SWISS, maqam (weitere folgen). NÛR = eigenes Produkt. Rumi's/Bir Damla Hayır = nicht ohne ausdrückliche Owner-Bestätigung.
5. **Preisleiter 2.400 → 3.900 + 149/Mon** wird nicht übersprungen/unterboten. **Ein** Angebot wird beworben; Rest bleibt Portfolio.
6. **Positionierung:** Handwerk & KMU, DE-Schwerpunkt, alle Unternehmen. Keine „türkisch-deutscher Mittelstand"-Copy.
7. **go-digital** in keiner Copy, bis der Status schriftlich geklärt ist. **Keine Kalt-E-Mail** (Telefon/Post).
8. **Sitz** ICO Osnabrück · **Gründung 2017** · zweisprachig **DE/TR**.
9. **Nichts nach `main`/Produktion, bis der Owner „live" sagt. Kein Force-Push.**

---

## 4 · Unsere Analysen in diesem Paket — Index
**Kanonisch (aktueller Stand):**
- `ANALYSE-creaDIG.md` — die Gesamtanalyse (technisches 12-Lane-Audit + Marketing/Sales-13-Lane-Audit + Klärungen). Jeder Befund: Ort · Beweis · Wirkung · Fix · Aufwand · Score.
- `KIZILELMA-creaDIG.md` — Haltung/Strategie + **§9 Satış-Omurga** (der ehrliche Vertriebsstand, Angebot, Preisleiter, Kanäle, Black Lock).
- `creadig-AUDIT-BACKLOG.md` — 27 priorisierte Befunde (Wellen 1–3), Fortschritt abgehakt.
- `creadig-TERMINAL-BACKLOG-5.md` — die Arbeitspakete **V1–V6** (Wahrheit → Erreichbarkeit → Livegang → Nische → Landing → TR).
- `creadig-TERMINAL-MASTER-PROMPT-5-KOMPLETT.md` — der ausgeführte KOMPLETT-Fahrplan (Phasen 0–5).
- `creadig-LIVE-CHECKLISTE.md` — was **vor dem Live-Flip** noch fehlt (A hart · B Flip-Tag · C macht die Seite wahr).
- `OMURGA.md` — der inhaltliche Backbone.

**Historisch (Kontext, teils überholt):**
- `creadig-v0-prompt.md` — der **ursprüngliche v0-Auftrag** (dein Startpunkt).
- `creadig-TERMINAL-MASTER-PROMPT.md` … `-5.md`, `creadig-TERMINAL-BACKLOG-2/3/4.md`, `creadig-TERMINAL-MASTER.md` — frühere Umsetzungspakete.

---

## 5 · Bekannte offene Lücken (unser eigener Stand — bitte ergänzen, nicht nur bestätigen)
- **Recht/Livegang (hart):** Impressum-Steuerstatus (USt-IdNr ODER § 19) + deutsche Rufnummer stehen als markierte Platzhalter · DPAs (Vercel, Resend) noch nicht bestätigt · ENV (`RESEND_API_KEY`, `LEAD_FROM`, `NEXT_PUBLIC_SITE_URL`) · Domain `creadig.de` verbinden.
- **Content/Wahrheit:** echte Produkt-Screenshots (meAI …) fehlen · echte Google-Reviews (0) · weitere Kundenlogos/Screenshots (NV SWISS, maqam nur Monogramm) · Preis-Entscheidung für größere Kunden (NV-SWISS/maqam-Kaliber vs. 2.400-Handwerk-Paket).
- **SEO:** `SEO-1` — außer `/` und `/tr` hat keine Seite ein `og:image` (Unterseiten überschreiben den Layout-OpenGraph; Bildpfad trägt Build-Hash).
- **Design/QA:** kompletter visueller Screenshot-Satz (hell/dunkel, mobil+desktop) steht noch aus · Design-Feinschliff-Befunde aus dem Audit (Kontraste, Button-Anzahl) teils offen.
- **Wachstum:** Newsletter/Lead-Magnet bewusst zurückgestellt (erst wenn Inhalte da sind) · Social-Profile leer.

---

## 6 · Was wir von dir wollen (Deliverable-Format)
Eine **strukturierte Lücken-Analyse** in diesen Kategorien:
1. Struktur / Informationsarchitektur
2. Premium / Design / visuelle Wirkung
3. Content / Wahrheit / Vertrauen
4. Vertrieb / Conversion / Angebot
5. Technik / Performance / SEO
6. Recht / DSGVO / Livegang-Reife

Pro Befund: **Bezug** (Seite/Bereich/Datei, soweit erkennbar) · **Was fehlt/schwach ist** · **Wirkung** · **konkreter Vorschlag als BESCHREIBUNG** (kein Code) · **Priorität** (Blocker / hoch / mittel / niedrig).
Zusätzlich verlangt:
- **Blinde Flecken:** Was fehlt in unseren eigenen Analysen (Abschnitt 4/5)? Was übersehen wir strukturell?
- **Weg zu 100 %:** eine priorisierte Reihenfolge — was zuerst, was zuletzt, um „premium + verkaufsfähig + ehrlich + technisch sauber + live-reif" zu erreichen.

---

## 7 · NICHT tun
- ❌ Nicht bauen, nicht generieren, keinen Code, kein Redesign-Output — **nur Analyse/Text.**
- ❌ Keine Fakes vorschlagen (keine erfundenen Referenzen, Zahlen, Reviews).
- ❌ Den Black Lock (Abschnitt 3) nicht in Frage stellen.
- ❌ go-digital nicht empfehlen (rechtlich offen).
- ❌ Nichts als „erledigt" vorschlagen, was in Abschnitt 2 bereits steht.
