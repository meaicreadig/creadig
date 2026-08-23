# creaDIG — Audit-Backlog (aus dem Vollaudit, 2026-08-22)

**So arbeiten wir das ab:** von oben nach unten. Welle 1 zuerst, dann 2, dann 3. Erledigtes abhaken `[x]`. Ein Punkt = ein Commit. Nach jeder Welle: `npm run build` + Screenshots + Freigabe, dann `git push origin feat/system-haus-site`. Nichts auf `main`, bis „live".

Score = (Wirkung × Dringlichkeit) ÷ Personentage. Reihenfolge folgt Wirkung/Aufwand, nicht nur Score.

---

## WELLE 1 — sofort (≈1 Tag): Deploy grün + sichtbar lebendig
- [x] **TECH-1** Deploy-Function schluckt Repo-Root (Score 100 · 0,25 PT) → in `next.config.ts` top-level `outputFileTracingExcludes: {"*":[".git/**",".next/cache/**","_legacy/**","design-mockup/**",".cursor/**",".claude/**",".video-analysis/**","**/*.pdf","**/*.zip"]}`. **Ohne das ist NICHTS auslieferbar.**
- [x] **VIS-1** „Dunkle" Bänder sind nicht dunkel (Score 25 · 1 PT) → `.section-dark` im Hellmodus echten dunklen Tokensatz geben (`--background:#201e1b; --foreground:#fbfbf9`). Wirkt auf Impact/meAI/Closing/Footer = echter Rhythmus. **Kernfix gegen „still/boutique".**
- [x] **VIS-3** Typo zu groß/fett (Score 32 · 0,5 PT) → `type-h2` clamp(1.875rem,4vw,3.25rem)/weight 600; `type-display` max 7rem; `type-h1` max 3rem.
- [x] **VIS-4** Gold zu schwach, klebt am Label (Score 24 · 0,5 PT) → Eyebrow-Linie 2px + `gold-text`; Abstände öffnen; zwei Inline-Varianten auf eine Komponente.
- [x] **SEC-6** Clickjacking/HSTS (Score 40 · 0,1 PT) → `X-Frame-Options: DENY` + HSTS `includeSubDomains; preload`.
- [x] **TECH-3** Fremddateien aus Deploy-Root (Score 36 · 0,25 PT) → `Archiv_creadig.zip`, PDFs, `_legacy/`, `design-mockup/` aus dem Root ziehen (Repo-Hygiene).

## WELLE 2 — diese Woche
- [ ] **SEC-1** Impressum-Pflichtangaben (Score 100 · OWNER) → Rechtsform · USt-IdNr **oder** §19 · §18-MStV-Verantwortlicher. **Einziger echter Go-Live-Rechtsblocker.**
- [x] **TECH-2** fs-Root-Cause dauerhaft (Score 50 · 0,5 PT) → `product-media.ts` Screens per `prebuild`-Skript in statische Map schreiben statt `readdirSync(process.cwd()…)`.
- [x] **TECH-4** Deploy-Gate (Score 32 · 0,5 PT) → `postbuild`-Skript: Function-Trace >200 MB → Exit 1.
- [x] **TECH-5** KI-Attrappe (Score 24 · 0,25 PT) → bis zur echten API ausblenden (kein totes „KI"-Widget auf einer KI-Marke).
- [x] **VIS-5** Riesen-Stats ohne Zahlen (Score 18 · 0,5 PT) → „A–Z"/„DE·CH" nicht als Stat; Doppelung Impact/CompanyTeaser auflösen.
- [x] **UX-2** Kontaktformular ohne Erfolgs-Zustand (Score 18 · 0,5 PT) → `window.open`-Rückgabe prüfen + Inline-Bestätigung.
- [x] **GROW-3** Preise positionieren als Agentur (Score 9 · 1 PT) → Pakete als „Einstieg", Architecture auf „ab"-Logik, Retainer sichtbar machen.
- [x] **UX-1** Startseite verankert keinen Beleg (Score 8 · 2 PT) → 1 echten Fall/echte Zahl auf die Startseite; leere gated Slots raus, bis Inhalt da.

## WELLE 3 — dieser Monat
- [x] **GROW-2** Keine Messung/Lead-Backup (Score 12,5 · 2 PT) → cookiefreies Analytics + Klick-Event + `app/api/lead`-Backup. *(greift mit Traffic)*
- [x] **TECH-6** Bilder ohne next/image (Score 12 · 0,5 PT) → Work-/Case-PNGs auf next/image bzw. WebP/AVIF.
- [x] **TECH-7** Observability/CSP → Speed Insights hinter derselben Einwilligung + `app/api/csp-report` als Berichtsziel. Das Umschalten report-only → scharf steht auf der Live-Checkliste (P4-h).
- [x] **VIS-2** Eine visuelle Frequenz (Score 6,7 · 3 PT) → 3 Sektions-Archetypen + Rhythmus + mehr als eine Mikro-Interaktion. *(eigentliche „Lebendigkeit"-Wurzel, teuer)*
- [x] **FEAT-1** Produkte ohne Nachfragepfad (Score 5,3 · 3 PT) → pro Produkt Warteliste/Demo + E-Mail-Erfassung. *(greift mit Traffic)*
- [x] **GROW-1** TR-Inhalte SEO-unsichtbar → `/tr/`-Routing, zwei Wurzel-Layouts, hreflang auf jeder Seite, zweisprachige Sitemap (36 URLs), eigenes TR-Vorschaubild. 54 statische Seiten statt 32 (P4-i).
- [x] **GROW-4** Social-Profile: Regel und Zustand festgeschrieben, Liste bleibt leer, Footer-Block erscheint nicht. Newsletter bewusst NICHT gebaut — /insights hat keinen Eintrag, ein Anmeldefeld verspräche Post, die es nicht gibt. Erst der Insight, dann die Anmeldung (P4-j).
- [x] **FEAT-3** KI-Assistent: Attrappe entfernt (TECH-5/P1-f). Eine echte Anbindung ist damit eine freie Entscheidung, kein Reparaturzwang mehr.
- [x] **SEC-7** JSON-LD-Escaping → `lib/json-ld.ts`, zehn Blöcke umgestellt (P4-c).
- [x] **SEC-3** CSP zweistufig: vier Direktiven sofort scharf, die volle Policy als Bericht (P4-d).
- [x] **SEC-5** Datenschutzerklärung korrigiert (sie beschrieb den Stand vor GROW-2/P3-d) + Speicherfristen, DE+TR (P4-e).
- [x] **SEC-4** Art.-49-Hinweis im Banner und in der Formular-Einwilligung; CONSENT_VERSION hochgezählt (P4-f).
- [x] **SEC-2** Auftragsverarbeiter als eine Liste aus einer Quelle; `dpaConfirmed` ist ein Owner-Feld — bis zur Bestätigung steht "offen" auf der Seite (P4-g).

## NEU GEFUNDEN (23.08.2026, kein Go-Live-Blocker)
- [ ] **SEO-1** Vorschaubild fehlt auf allen Unterseiten (Score n/a · 0,5 PT). Nur `/` und `/tr` tragen `og:image`. Ursache: Unterseiten setzen ein eigenes `openGraph`-Objekt, und Next ersetzt das des Layouts vollständig, statt das Datei-Vorschaubild nachzutragen; dessen Adresse trägt einen Build-Hash und lässt sich nicht von Hand referenzieren. Vorbestehend, nicht durch GROW-1 entstanden. Weg: Bild zur Bauzeit nach `public/og/{de,tr}.png` rendern (wie `prebuild` in TECH-2) und fest referenzieren.

## OWNER LIEFERT (kein Code — macht die Seite „wahr")
- [ ] **SEC-1**: Rechtsform · USt-IdNr/§19 · §18 MStV
- [ ] **FEAT-2**: 2–3 Case-Freigaben · 3–5 Google-Reviews · 1 Insight
- [ ] **Produkt-Screens**: echte meAI-Oberflächen → `public/works/products/meai/`
- [x] **maqam** geklärt: echter Kunde (Owner 22.08.2026). Offen bleiben Screenshots, Region und Link.
- [ ] **Vercel-AVV UND Resend-AVV** im jeweiligen Dashboard bestätigen/ablegen, dann `processors[].dpaConfirmed: true` (lib/site-data.ts)
- [ ] **Türkische Projekttexte**: `work.what` und `work.sector` gibt es nur auf Deutsch — auf `/tr/arbeiten/…` steht der Projektsatz deutsch unter türkischer Oberfläche

---
*Quelle: Vollaudit (4 Lanes + Roter Agent), 2026-08-22. Fortschritt im Zustands-Block am Ende des Audits.*
