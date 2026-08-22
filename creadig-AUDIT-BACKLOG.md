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
- [ ] **TECH-3** Fremddateien aus Deploy-Root (Score 36 · 0,25 PT) → `Archiv_creadig.zip`, PDFs, `_legacy/`, `design-mockup/` aus dem Root ziehen (Repo-Hygiene).

## WELLE 2 — diese Woche
- [ ] **SEC-1** Impressum-Pflichtangaben (Score 100 · OWNER) → Rechtsform · USt-IdNr **oder** §19 · §18-MStV-Verantwortlicher. **Einziger echter Go-Live-Rechtsblocker.**
- [ ] **TECH-2** fs-Root-Cause dauerhaft (Score 50 · 0,5 PT) → `product-media.ts` Screens per `prebuild`-Skript in statische Map schreiben statt `readdirSync(process.cwd()…)`.
- [ ] **TECH-4** Deploy-Gate (Score 32 · 0,5 PT) → `postbuild`-Skript: Function-Trace >200 MB → Exit 1.
- [ ] **TECH-5** KI-Attrappe (Score 24 · 0,25 PT) → bis zur echten API ausblenden (kein totes „KI"-Widget auf einer KI-Marke).
- [ ] **VIS-5** Riesen-Stats ohne Zahlen (Score 18 · 0,5 PT) → „A–Z"/„DE·CH" nicht als Stat; Doppelung Impact/CompanyTeaser auflösen.
- [ ] **UX-2** Kontaktformular ohne Erfolgs-Zustand (Score 18 · 0,5 PT) → `window.open`-Rückgabe prüfen + Inline-Bestätigung.
- [ ] **GROW-3** Preise positionieren als Agentur (Score 9 · 1 PT) → Pakete als „Einstieg", Architecture auf „ab"-Logik, Retainer sichtbar machen.
- [ ] **UX-1** Startseite verankert keinen Beleg (Score 8 · 2 PT) → 1 echten Fall/echte Zahl auf die Startseite; leere gated Slots raus, bis Inhalt da.

## WELLE 3 — dieser Monat
- [ ] **GROW-2** Keine Messung/Lead-Backup (Score 12,5 · 2 PT) → cookiefreies Analytics + Klick-Event + `app/api/lead`-Backup. *(greift mit Traffic)*
- [ ] **TECH-6** Bilder ohne next/image (Score 12 · 0,5 PT) → Work-/Case-PNGs auf next/image bzw. WebP/AVIF.
- [ ] **TECH-7** Observability/CSP (Score 8 · 0,5 PT) → Vercel Analytics/Speed-Insights + CSP (report-only → enforce).
- [ ] **VIS-2** Eine visuelle Frequenz (Score 6,7 · 3 PT) → 3 Sektions-Archetypen + Rhythmus + mehr als eine Mikro-Interaktion. *(eigentliche „Lebendigkeit"-Wurzel, teuer)*
- [ ] **FEAT-1** Produkte ohne Nachfragepfad (Score 5,3 · 3 PT) → pro Produkt Warteliste/Demo + E-Mail-Erfassung. *(greift mit Traffic)*
- [ ] **GROW-1** TR-Inhalte SEO-unsichtbar (Score 4 · 5 PT) → `/tr/`-Routing + hreflang + TR-Sitemap. *(strategisch KRITISCH, wirkt erst nach Go-Live)*
- [ ] **GROW-4** Keine E-Mail/Retention (Score 3 · 2 PT) → Lead-Magnet/Newsletter (Double-Opt-in) + echte Social-Profile.
- [ ] **FEAT-3** KI-Assistent echt (Score 2 · 3 PT) → Claude-API-Anbindung oder auf WhatsApp-Widget reduzieren.
- [ ] **SEC-2/3/4/5/7** DSGVO/Härtung (klein) → Vercel-AVV bestätigen · CSP · Art.49-Consent-Suffix · Speicherfristen · JSON-LD-Escaping.

## OWNER LIEFERT (kein Code — macht die Seite „wahr")
- [ ] **SEC-1**: Rechtsform · USt-IdNr/§19 · §18 MStV
- [ ] **FEAT-2**: 2–3 Case-Freigaben · 3–5 Google-Reviews · 1 Insight
- [ ] **Produkt-Screens**: echte meAI-Oberflächen → `public/works/products/meai/`
- [ ] **maqam** klären: eigenes Produkt/Venture oder Kundensystem? + Screenshots
- [ ] **Vercel-AVV** im Dashboard bestätigen/ablegen

---
*Quelle: Vollaudit (4 Lanes + Roter Agent), 2026-08-22. Fortschritt im Zustands-Block am Ende des Audits.*
