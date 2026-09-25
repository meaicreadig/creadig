# creaDIG · Final Implementation · Hauptbuch

> Ein Lauf, 25.09.2026, Branch `feat/system-haus-site`. Lokal gebaut und
> geprüft. **Nichts gepusht, nichts deployt, keine Produktions-Migration.**
> Produktion steht weiter auf `c395e91`.
>
> Rückgabe je Punkt: DONE · BLOCKED_OWNER · BLOCKED_CUSTOMER ·
> BLOCKED_EXTERNAL · LATER_BY_EVIDENCE.

## 0 · Prompt gegen Repo geprüft — was anders war

| Annahme im Prompt | Tatsächlich | Folge |
|---|---|---|
| Website-Paket „2.400 regulär 3.900" als Einstieg | `packages.website.amount` war **2.400**, `regularAmount` 3.900; die FAQ sagte schon „3.900 + Pilot 2.400" — zwei Preislogiken gleichzeitig | auf **eine** gestellt: Festpreis 3.900, Pilot als Kasten |
| BelegLeiter neu bauen | existiert als `components/sections/beleglage.tsx` (auf /arbeiten) | **wiederverwendet**, jetzt auch auf der Startseite |
| nur `fibero.jpg`/`meai.jpg` sind Szenen | **alle sieben** Bilder unter `public/works/` sind generierte Szenen (Menschen, Räume, Geräte, Markenjacke) — auch die Kundenbilder | alle aus Werken, Fällen, Produktbelegen genommen |
| Pilot gegen „ein Zitat nach 90 Tagen" | Kanon: Gegenleistung ist **Zeigen und Nennen, kein Lob**; ein gekauftes Zitat ist ein bezahltes Testimonial (UWG) | Gegenleistung = schriftliche Referenzfreigabe (Name, Ergebnis), **ohne** Zitatpflicht |
| Einstiegsseite der Leads prüfen | als Kategorie `landing-page` in `lib/herkunft.ts` entworfen, fällt an der Tür, solange die Datenschutzerklärung sie nicht nennt | nicht gebaut → Owner-Satz |
| Freigabe-Erinnerung nach 14 Tagen | Auslöser `abnahme-erinnert-an-freigabe` existiert (bei Abnahme, nicht erst nach 14 Tagen) | ALREADY_DONE |
| Migration 020 braucht O7 | 020 ist seit 24.09. in Produktion; O7 betrifft die **neue** 021 | 021 lokal, Produktion wartet |
| Prompt §20 ff. | im eingefügten Text abgeschnitten (endet in §20 „Zuerst messen") | W7 mit dem vorhandenen `vitals`, W8 lokal |

## 1 · Rückgabe je Punkt

### W1 · Commercial Truth
| Punkt | Stand | Beleg |
|---|---|---|
| R1 eine Preisquelle (`lib/offers.ts`), Wörterbuch nur Platzhalter | DONE | `check-commercial-truth` §8: kein Betrag als Literal in `dictionary.ts`/`service-pages.ts` |
| R2 149 € = Website-Betreuung, nie an „Operations" | DONE | `einstiege.ts` operations → nach Analyse; Gate prüft |
| R3 Festpreis ohne „ab", Pilot als eigener Kasten | DONE | „Festpreis ab" war live auf /leistungen — entfernt; Gate liest jetzt sichtbaren Text |
| R4 Systemprojekt = Angebot nach Analyse | DONE | Preistabelle, Startseite |
| R5 Systemanalyse als Angebot, unsichtbar bis Betrag | DONE (Code) · **BLOCKED_OWNER O3** | `offers` → `analyse`, `published: false` |
| R6 USt aus einer Konstante | DONE (`VAT_PERCENT`) · Ausweis **BLOCKED_OWNER O1** | |
| Gespeicherte Angebote ändern ihre Summe nicht | DONE | Katalogschlüssel bleiben; `paket-website` = Pilot, `-regulaer` = Festpreis |

### W2 · Vereinfachung
| Punkt | Stand |
|---|---|
| Startseite 12 → 7 Sektionen (Hero · Systembild · Haus kompakt · Angebote · Beleglage · Unternehmen · Schluss) | DONE — 864 → 709 Wörter |
| Hero-Untertitel = Schlusszeile | DONE |
| „keine Reihe abgeschlossener Systemprojekte" nur noch auf /arbeiten | DONE |
| „dieses Risiko tragen Sie" → Pilotsatz | DONE |
| Vertretungsregel → 1 Satz | DONE |
| „Diese Seite verkauft nichts davon." | DONE (gelöscht) |
| „unsichtbarer Geschäftsführer", „Doppel-DNA" | DONE (gelöscht) |
| meAI-Status | FAQ auf den Datenstand „im Aufbau" gebracht · **BLOCKED_OWNER O4** |
| /systeme H1 auf Deutsch | DONE |
| Beratungssprachen eine Konstante (`{sprachen}`) | DONE — DE/TR sagten zwei, EN/AR drei; jetzt überall drei · Owner prüft |
| /leistungen halbiert | DONE — sichtbar ≈ −55 %, HTML 2.266 → 1.399 (−38 %); „Drei Wege", Managed-Block, Prozess raus |
| TR muttersprachlich: `asıldığı`, `zanaat`, `kimlik`, `demodaten`, „…" | DONE · Sprachfreigabe **BLOCKED_OWNER** |

Geänderte TR-Schlüssel: `hero.subline`, `faq.items[0].q`, `packages.items.website.{name,who}`, `contact.interests[0]`, `portfolio.productPhotoNote`, `about.niches[0]`, zwölf Anführungszeichen-Zeilen, `branchen` (4), `service-pages` (6), `site-data` (1).

### W3 · Visual System
| Punkt | Stand |
|---|---|
| Betriebsfluss v2: Werkzeuge, Zähler, sr-only „Übergabe von Hand", Eigentumsmarke | DONE |
| Ein Zustandswechsel (CSS `clip-path`), SSR = verbunden, Reduced Motion = verbunden | DONE (`lib/use-seen-once.ts`) |
| `tools.length === stations.length` je Sprache | DONE (`check-parity`) |
| Haus `variant="kompakt"` | DONE |

### W4 · Beleg
| Punkt | Stand |
|---|---|
| Herkunftsregister `lib/media-provenance.ts` + `check-herkunft` | DONE |
| Generierte Szenen aus allen Belegflächen | DONE — SelectedWork erscheint wieder, sobald echte Screens am Werk stehen |
| `imageProof: "illustration"` (verboten an Werken) | DONE |
| BelegLeiter auf Startseite bei 0 Fällen | DONE (Beleglage) |
| Echte Produkt-Screens fibero/meAI | **BLOCKED_OWNER** (Material) |
| Gründerfoto | **BLOCKED_OWNER O6** — Slot bleibt leer |
| Admin-Demodaten-Screen als L2 | LATER_BY_EVIDENCE (braucht Demo-Instanz ohne echte Leads) |
| Freigaben NV SWISS / maqam / Bir Damla Hayır | **BLOCKED_CUSTOMER O8** |

### W5 · SEO
| Punkt | Stand |
|---|---|
| S1 `INDEXED_LOCALES` + hreflang/Sitemap/Wechsler/Auto-Sprache | DONE (Code) · AR bleibt aktiv bis **O5** (eine Zeile) |
| S2 Organisation einmal, `ProfessionalService`, kein Katalog/Rating global; Katalog nur auf Angebotsseiten | DONE — Rufnummer bis **O2** aus dem Markup |
| S3 Titel je Cluster, „System-Haus" raus aus dem Title | DONE |
| S4 /termin H1 im Server-HTML | DONE — Gate: genau ein H1 auf **jeder** öffentlichen Seite |
| S5 SeoLanding-Vertrag (intent, proofRefs, cta) + Build-Sperren | DONE, Liste bleibt leer |
| S6 Linktext-Regel („hier") | DONE; Regeln 1–2 (Kontextlinks je Artikel) LATER_BY_EVIDENCE |
| S7 Einstiegsseite am Lead | **BLOCKED_OWNER** (ein Satz in der Datenschutzerklärung schaltet die Kategorie frei) |

### W6 · Admin + Entwurfszustand
| Punkt | Stand |
|---|---|
| A1 „Anfragen" einmal | DONE |
| A2 „System" → „Einrichtung" | DONE |
| A3 keine Migrationsnummern im Text + Gate | DONE |
| A4 „Vom System erledigt · 7 Tage" mit getrennten Zuständen | DONE |
| A5 Entwurf → Freigabe (nur Owner) → Veröffentlicht, Zustandsfilter | DONE lokal — `veroeffentlichung-drill` V9 14/14, 020→021-Upgrade idempotent geprobt |
| Migration 021 in Produktion | **BLOCKED_OWNER O7** |
| LinkedIn-Zielbild | DONE als Dokument (`docs/admin-os/linkedin-target.md`) |

### W7 · Performance / A11y
| Punkt | Stand |
|---|---|
| `vitals` (Labor, lokaler Produktions-Build) | 14/14 unter Schwelle, LCP 36–84 ms, CLS 0.000 |
| `a11y` | 132 Durchläufe, keine maschinell feststellbare Verletzung |
| Reveal → CSS/IO | LATER_BY_EVIDENCE (Messung verlangt es nicht) |
| Feldmessung | **BLOCKED_OWNER** — Vercel Web Analytics ist nicht aktiviert |

### W8 · Abnahme
| Prüfung | Ergebnis |
|---|---|
| `npm run build` inkl. aller Postbuild-Gates | grün |
| `erlebnis-drill` | 36/36 (Block 5 auf die eine Preistabelle umgestellt) |
| `smoke` | 36/36 |
| `veroeffentlichung-drill` | grün inkl. V9 |
| Live-Abnahme | **BLOCKED_OWNER** — braucht Deploy-Freigabe |

## 2 · Owner-Fragen, gebündelt

1. **O1** Steuerstatus: Regelbesteuerung oder § 19? (steuert „zzgl. 19 % USt.")
2. **O2** Deutsche Rufnummer (danach steht sie im Impressum und im Markup).
3. **O3** Festpreis der Systemanalyse + Anrechnungsregel (danach erscheint das Angebot).
4. **O4** meAI: „im Betrieb" oder „im Aufbau"?
5. **O5** Arabisch zurückstellen? (Empfehlung ja — eine Zeile in `lib/routes.ts`)
6. **O6** Gründerfoto (Smartphone reicht).
7. **O7** Deploy dieses Stands + Migration 021 in Produktion.
8. **O8** Freigaben NV SWISS / maqam / Bir Damla Hayır anfragen.
9. Beratung auch auf Englisch zusagen? (heute überall so formuliert)
10. Ein Satz in der Datenschutzerklärung zur Einstiegsseite (S7) — ja/nein.
11. Echte Screens fibero/meAI (ohne Namen/Adressen) — ab dann ist „Eigene Produkte" wieder auf der Startseite.
