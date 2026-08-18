# creaDIG — Terminal-Backlog 4 · Englisch (EN) + Märkte DE→CH→Europa

**Datum:** 2026-08-17 · **Branch:** `feat/system-haus-site` · Ergänzung zu Master-Prompt 1+2.

**Owner-Update — hebt eine frühere Sperre auf:** Sprachen sind ab jetzt **DE / TR / EN** (nicht mehr DE/TR-only — der alte Lock „kein EN" ist aufgehoben). Märkte sind **1. Deutschland → 2. Schweiz → 3. Europa** (nicht mehr nur „DE & CH"). Grund: Marktausweitung nach Europa; die TR-DE-Nische (türkische Diaspora) ist europaweit.

## E-I1 · Englisch (EN) als dritte Sprache
- `lib/dictionary.ts`: vollständiger **EN-Zweig** — echte, professionelle Übersetzung ALLER Keys. Parität **3×** (DE = TR = EN, aktuell 300 je), keine Auslassung, keine halb-übersetzten Objekte (der Compiler muss bei einer Lücke meckern — Typisierung `{de, tr, en}` erzwingen).
- Ton wie die DE-Fassung: premium, ehrlich, klar. **Marken/Fachbegriffe unverändert** lassen (creaDIG, meAI, fibero, CASSAMEA, meahv, go-digital, BAFA, ICO …).
- `components/locale-provider.tsx`: Locale-Typ `"de" | "tr" | "en"`; EN in Persistenz + Consent-Gating (wie bestehend). **Default bleibt `de`** (Hauptmarkt).
- Sprach-Umschalter (`site-nav.tsx` ToggleGroup): **DE / TR / EN** (drei Kürzel, kompakt — auch mobil sauber).
- **E-F2 erweitern:** `<html lang>` folgt der aktiven Locale (de/tr/en); `hreflang`-Alternates für alle drei; OG-`locale`-Alternates in der Metadata.
- **Rechtsseiten (Impressum/Datenschutz):** juristisch maßgeblich bleibt **Deutsch**. EN-Fassung entweder weglassen (Legal bleibt DE) ODER klar kennzeichnen: „Nicht rechtsverbindliche Übersetzung — maßgeblich ist die deutsche Fassung." Nichts juristisch Heikles frei ins Englische übersetzen.
- **Acceptance:** `build` + `tsc` grün; Parität **3×300**; Umschalter funktioniert in beiden Themes/mobil; bei EN keine sichtbaren deutschen Rest-Strings; `<html lang>` korrekt je Sprache.

## E-M2 · Positionierung DE → CH → Europa
- Regionstext (aktuell „Deutschland & Schweiz — auf Deutsch & Türkisch", `dictionary.ts` `regions`) → **3-Stufen-Priorität**: Deutschland (Haupt) · Schweiz · Europa. In allen 3 Sprachen konsistent; Sprachhinweis jetzt „auf Deutsch, Türkisch & Englisch".
- Alle „DE & CH" / „Deutschland & Schweiz"-Stellen (about, Footer-`markets`, Meta/Keywords) auf **DE → CH → Europa** heben. **Sitz bleibt Osnabrück (DE).**
- Nische-Framing: Handwerk / TR-DE-KMU **europaweit** (türkische Diaspora).
- **Acceptance:** kein „nur DE & CH" mehr; 3-stufige Marktansprache in DE/TR/EN.

## Nicht tun
- ❌ Maschinelles Kauderwelsch-Englisch — echte, saubere Übersetzung.
- ❌ Impressum/Datenschutz juristisch frei ins EN übersetzen ohne Kennzeichnung.
- ❌ Default von `de` weg ändern.
- ❌ Force-push · Produktion ohne „live".

## Start
Lies diese Datei. **E-I1 → E-M2**, ein Commit pro Epic, nach jedem `build` + kurze Verifikation. Nicht nach `main` pushen.
