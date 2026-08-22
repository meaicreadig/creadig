# creaDIG — KOMPLETT-Master-Prompt · die ganze Seite in EINEM Lauf

> **Auftrag:** Die Seite **komplett fertigstellen** — Wahrheit + Premium + Struktur +
> Funktion + Technik — in EINEM Durchlauf, Phase für Phase bis zum Ende.
> Die Seite geht dabei **noch nicht live**; erst wenn alles steht, schaltet der Owner sie live.
> Deshalb wird JETZT alles gebaut, auch Design/Struktur (die frühere „Design gesperrt bis live"-
> Regel ist vom Owner am 22.08.2026 bewusst aufgehoben: erst komplett, dann live).
> Ersetzt `creadig-TERMINAL-PAKET-A-TRUTH.md` (Inhalt ist als Phase 1 integriert).

## Grundregeln (Black Lock — gelten in JEDER Phase)
1. **„Komplett" heißt: keine leeren/kaputten Stellen und KEINE Fakes.** Echte Inhalte wo vorhanden; leere Sektionen sauber weglassen (nicht mit Erfundenem füllen); **klar markierte Platzhalter NUR bei Owner-Pflichtdaten (Impressum).** Keine erfundenen Reviews, Cases, Kennzahlen, Kundennamen.
2. **Eigene Produkte:** meAI · fibero · CASSAMEA · meahv. **fibero bleibt** (auch wenn Glasfaser-Domäne).
3. **Glasfaser-TÄTIGKEIT raus** von der öffentlichen Seite: creaDIG fiber, Deutsche Telekom, Glasfaser NordWest, 1&1, Drillisch. (Privater Motor, kein Schaufenster. Das Produkt fibero ist unberührt.)
4. **Echte Kunden (Owner-Freigabe 22.08.):** NV SWISS · Bir Damla Hayır · maqam. Weitere folgen. **NÛR = eigenes Produkt** (kein Kunde). **Rumi's Maison = unbestätigt → raus.**
5. **Zielgruppe:** Handwerk & KMU, **Schwerpunkt Deutschland**, offen für alle Unternehmen. Keine „türkisch-deutscher Mittelstand"-Copy. Site bleibt zweisprachig DE/TR.
6. **Sitz** ICO InnovationsCentrum Osnabrück · **Gründung 2017.**
7. **Preise (350/500/1500) NICHT in der Zahl ändern** — Owner-Entscheidung offen. Nur sauber/„agenturhaft" präsentieren (GROW-3).
8. **Premium-Leitplanken:** Light + Gold-DNA · kein Serif · kein Schwarz-dominant · Ruhe UND Lebendigkeit durch Rhythmus/Kontrast/Bewegung (nicht durch Effekt-Overload) · Wirkung „großes, souveränes Systemhaus".
9. Nach **jeder Phase**: `npm run build` grün + Function-Gate ok + Screenshots (hell/dunkel) + **STOPP** und auf Freigabe warten. **Nicht nach `main`. Nichts live schalten.** Backlog (`creadig-AUDIT-BACKLOG.md`) abhaken.

---

## Phase 0 — Frische Analyse & Plan
Auditiere die aktuelle Struktur/IA und die Premium-Lücken: Startseite + `/leistungen` `/produkte` `/arbeiten` `/unternehmen` + alle Sektionen in `components/sections`. Kurzbericht (max. 1 Seite):
- Was wirkt strukturell **nicht** wie ein großes Unternehmen/Systemhaus?
- Wo ist die **visuelle Frequenz eintönig** (alles gleich getaktet → „still/boutique")?
- Welche Sektionen sind leer/schwach/doppelt?
Daraus einen **konkreten Umsetzungsplan für Phase 2** ableiten. **STOPP** — Plan zeigen, Freigabe abwarten.

## Phase 1 — Wahrheit & Inhalt
**A1 · Glasfaser/Telekom raus** (`lib/site-data.ts`): `brands[]` leeren bzw. Telekom/Glasfaser NordWest/1&1/Drillisch + übrige `approved:false`-Fremdmarken entfernen · `furtherProjects` „creaDIG fiber" entfernen · `productWorlds.fibero.houseContext = null`. Site-weit `Glasfaser|Telekom|NordWest|Subunternehmer|creaDIG fiber` (in `components/**`, `app/**`, `lib/dictionary.ts`) entfernen/umschreiben, sodass die Glasfaser-Tätigkeit nicht mehr als Firmentätigkeit erscheint. **fibero-Produkt bleibt.**

**A2 · Echte Referenzen** (`lib/site-data.ts` `clientWorks` + Logo-Wand):
- **NV SWISS** (`nv-swiss`, CH, `href https://nvswiss.ch`, `live:true`): „Versicherungs- & Finanzmakler (Schweiz) — Marke, Website und Digitalisierung aus einer Hand." Logo `public/brand/clients/nvswiss.(svg|png)` sonst Monogramm „NV". Prominenteste Referenz.
- **Bir Damla Hayır** (`bir-damla-hayir`, DE, echter Kunde): Projekt **noch nicht live → kein href**, image `bir-damla-hayir.png`.
- **maqam** (`maqam`, neu): „Online-Business / E-Commerce." Logo `public/brand/clients/maqam.(svg|png)` sonst Monogramm „mq". href/Region/Screenshots offen → kein Link/Bild bis Owner liefert.
- **NÛR** und **Rumi's Maison** aus `clientWorks` entfernen; `featuredWorkSlugs = ["meai","fibero","nv-swiss"]`.
- Logo-Wand (`components/sections/logo-wall.tsx`) zeigt jetzt echte Kunden (Logo aus `public/brand/clients/`, sonst Monogramm; `approved:true`). Kein totes Logo.
- `KIZILELMA-creaDIG.md` §9.2 aktualisieren: echte Kunden NV SWISS / Bir Damla Hayır / maqam; „NULL Referenzen" ist überholt. Nur diese Fakten.

**A3 · Positionierung + Impressum + 2 Fixes:**
- Positionierung (dictionary DE+TR) auf Handwerk & KMU (DE-Schwerpunkt), offen für alle.
- **Impressum-Platzhalter** (`imprintDetails`): `legalForm:"Einzelunternehmen"` · `mstvResponsible:"Muhammed Emin Akyol"` · für `vatId`/`smallBusiness`/`phone` **klar markierte Platzhalter** setzen, z. B. `phone:"+49 … (Platzhalter – vor Live ersetzen)"`, Steuerstatus als Platzhalter-Hinweis — damit die Seite komplett rendert. **Hart:** echte Werte stehen auf der Live-Checkliste (Phase 5), ohne sie kein Livegang.
- **TECH-5:** KI-Attrappe ausblenden. **UX-2:** Kontaktformular-Erfolgszustand.

## Phase 2 — Premium-Struktur & visuelle Lebendigkeit
Umsetzung des Phase-0-Plans. **VIS-2:** drei unterschiedliche Sektions-Archetypen statt einer Frequenz · echter Rhythmus (Dichte/Ruhe im Wechsel) · mehr als eine Mikro-Interaktion. Struktur so schärfen, dass „großes Systemhaus" trägt (das Dach groß/als Ursprung, Produkte als sein Werk — KIZILELMA §7). Premium-Leitplanken (Regel 8) einhalten. Verbleibende VIS-Feinheiten mitnehmen.

## Phase 3 — Funktion & Vertrieb
- **Kontaktformular, das WIRKLICH zustellt:** Lead-Weg bauen (z. B. `app/api/lead` Route → E-Mail an `info@creadig.de`, DSGVO-konform mit Consent + Speicherfrist) statt nur `window.open`. Der Lead darf nicht verloren gehen.
- **UX-1:** Startseite verankert echten Beleg (NV SWISS) · leere gated Slots sauber weg.
- **FEAT-1:** pro Produkt ein Nachfragepfad (Warteliste/Demo + E-Mail-Erfassung).
- **GROW-3:** Preise agenturhaft präsentieren (Zahl unverändert). **GROW-2:** cookiefreies Analytics + Klick-Event.

## Phase 4 — Technik / Härtung / SEO
TECH-3 (Root entrümpeln) · TECH-6 (next/image) · TECH-7 (Observability/CSP) · SEC-2/3/4/5/7 (DSGVO/Härtung: AVV, CSP, Art.49-Consent, Speicherfristen, JSON-LD-Escaping) · **GROW-1** (`/tr/`-Routing + hreflang + TR-Sitemap) · GROW-4 (Social-Profile nur wenn echt).

## Phase 5 — Endabnahme & Live-Checkliste
Kompletter build + alle Gates + voller Screenshot-Satz (alle Seiten, hell/dunkel, mobil+desktop). Dann die Liste **„vor dem Live-Flip nötig (Owner)"** ausgeben:
- echte Impressum-Werte (Steuerstatus USt-IdNr/§19, DE-Telefon) — **Pflicht**
- echte Produkt-Screenshots (meAI …), echte Google-Reviews, weitere Kunden-Logos
- Preis-Entscheidung (350/500/1500 vs. 2.400/3.900 + 149/Mon)
- Domain `creadig.de` verbinden · Vercel-AVV bestätigen
**STOPP.**

## Cleanup
`creadig-TERMINAL-PAKET-A-TRUTH.md` löschen (in dieses Paket integriert).

## Nicht tun
Keine Fakes außer klar markierten Impressum-Platzhaltern · Preiszahlen nicht ändern · fibero nicht entfernen · nicht nach `main` · nicht live schalten.
