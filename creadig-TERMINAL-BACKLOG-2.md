# creaDIG — Terminal-Backlog 2 · Trust · Consent · Adresse · Struktur

## Kontext
Die System-Haus-Next-Site liegt auf Branch `feat/system-haus-site` (E0–E6 + Fixes). Diese Backlog ergänzt sie um **Vertrauen, Recht und Struktur** — strikt im **bestehenden creaDIG-Design** (Light + Gold-Akzent, echtes Logo aus `public/brand`, Poppins, Dreiecks-Signatur-Motiv, helle Bänder — kein Schwarz-dominant).

> **Referenz-Regel (kritisch):** `digitalhoch5.de` ist **NUR Struktur-/Vollständigkeits-Referenz** (welche Bausteine eine seriöse Osnabrücker Digital-Beratung hat) — **NICHT Stil.** Deren WordPress-Look NICHT übernehmen. creaDIG bleibt eigenständig, premium, Gold/Light.

## Gesperrte Entscheidungen (nicht kippen)
- Design: Light + Gold-Akzent, Poppins, echtes Logo, Dreiecks-Motiv. **Kein** fremder Stil, kein Schwarz-dominant.
- **Geschäftsadresse = ICO InnovationsCentrum Osnabrück, Albert-Einstein-Straße 1, 49076 Osnabrück.** NICHT die private Diepholz-/Weizenkamp-Adresse.
- Nur **echte** Nachweise. Keine erfundenen Zahlen/Testimonials/Badges.

## Epics

### E7 — Sektion „Zertifizierungen & Mitgliedschaften" (echt)
Neue Sektion (nach Portfolio, vor/nach Kontakt), im creaDIG-Design. Fünf **echte** Nachweise:

| Slug | Über-Label | Name | Zusatz |
|---|---|---|---|
| `go-digital` | „autorisiert für das Förderprogramm" | **go-digital** | BMWK-Förderprogramm |
| `bafa` | „zugelassener Unternehmensberater des" | **Bundesamt für Wirtschaft und Ausfuhrkontrolle** | Berater-ID: **#190949** |
| `iuk` | „Mitglied beim" | **iuk unternehmensnetzwerk osnabrück e.v.** | — |
| `avpq` | „eingetragen in das" | **Amtliche Verzeichnis Präqualifizierter Unternehmen (AVPQ)** | — |
| `agd` | „Mitglied bei der" | **Allianz deutscher Designer (AGD)** | — |

- Logo-Dateien: `public/badges/<slug>.svg|png`. **Owner liefert die offiziellen Badge-Logos.** Bis dahin: saubere getypte Badge-Kacheln (Über-Label klein grau + Name fett) — **KEINE kaputten `<img>`**, kein 404.
- Ruhig, hell, dezent (Graustufe → Gold/Farbe bei Hover, wie Logo-Wand). Kein bunter Klotz.
- **Förder-Angle betonen** (eigener kurzer Block/CTA): *„Viele Projekte realisieren wir über das **go-digital**-Förderprogramm (BMWK) — bis zu 50 % Förderung. Wir übernehmen Antrag & Abwicklung."* (Text als DE/TR-Key.)

### E8 — Cookie-Consent-Banner (DSGVO)
- Erstbesuch: Banner unten, **drei** Aktionen: **„Alle akzeptieren"** (Gold-Button) · **„Nur essenzielle akzeptieren"** (neutral) · **„Individuelle Datenschutz-Präferenzen"** (öffnet Detail-Auswahl).
- Text (DE/TR-Keys): Einwilligung nötig; Hinweis für unter 16-Jährige (Erziehungsberechtigte); Verweis auf **/datenschutz**; Widerruf/Anpassung jederzeit unter „Einstellungen".
- **USA-Transfer-Hinweis (Art. 49 (1) a DSGVO)** NUR, falls US-Dienste aktiv sind (US-Fonts/Analytics/Maps). **Prüfe den Code:** wenn Fonts self-hosted und keine US-Tools → Hinweis WEGLASSEN, Banner schlank halten (ehrlich, kein Blabla).
- Speicherung in `localStorage`; essenzielle immer aktiv; nicht-essenzielle Skripte erst NACH Einwilligung laden.
- Design: creaDIG (Light, Gold-Akzent-Button). Struktur/Wording orientiert am gezeigten D5-Banner — **Stil eigenständig.**

### E9 — Echte Adresse (ICO Osnabrück) überall
- **Impressum:** creaDIG — Muhammed Emin Akyol · ICO InnovationsCentrum Osnabrück · **Albert-Einstein-Straße 1 · 49076 Osnabrück** · `[Rechtsform + USt-IdNr/§19 + Verantwortlicher §18 MStV: Owner bestätigt]`.
- **Kontakt-Sektion + Footer:** Standort **Osnabrück** (statt Diepholz). **CH** bleibt als **Markt** erwähnt — aber Sitz = Osnabrück.
- `lib/site-data` / Layout-Metadata: `addressLocality: "Osnabrück"`, canonical/domain-ready unverändert.

### E10 — Struktur-Vollständigkeit (seriöse Beratung — Struktur, nicht Stil)
Prüfe die Seite gegen die Bausteine einer seriösen Digital-Beratung (Struktur-Referenz `digitalhoch5.de`, **NICHT** Stil):
Hero · Leistungen · Produkte/Portfolio · **Zertifizierungen (E7)** · **Förder-Hinweis go-digital** · Über uns · Pakete · Prozess · Kontakt/Termin · **Cookie-Consent (E8)** · Impressum/Datenschutz.
Fehlt/schwach ein Baustein → ergänzen/schärfen, **im eigenen creaDIG-Design.**

## Acceptance Criteria
- [ ] `npm run build` grün
- [ ] Zertifizierungs-Sektion mit **5 echten** Badges (korrekte Labels/IDs), kein kaputtes Bild, kein 404
- [ ] go-digital-Förder-Hinweis vorhanden (DE/TR)
- [ ] Cookie-Consent funktioniert: 3 Optionen, `localStorage`, Link zu /datenschutz, essenzielle immer aktiv
- [ ] Adresse **Osnabrück (ICO, Albert-Einstein-Str. 1)** in Impressum + Footer + Metadata; kein Diepholz mehr öffentlich
- [ ] Design bleibt creaDIG (Gold/Light, Logo, Poppins, helle Bänder) — **kein digitalhoch5-Look**
- [ ] DE/TR paritätisch für alle neuen Keys

## Nicht tun
- ❌ digitalhoch5-Stil/Farben/Layout kopieren (nur Struktur)
- ❌ Badges erfinden — nur die 5 echten; ohne Logo-Datei → saubere Text-Kachel, kein kaputtes Bild
- ❌ Schwarz-dominante Flächen, fremde Farben
- ❌ USA-Hinweis behaupten, wenn keine US-Dienste laufen
- ❌ Force-push auf main

## Commit-Konvention
Ein Commit pro Epic: `feat(E7): Zertifizierungen …` etc.

## Start
Lies zuerst diese Datei **und** `creadig-TERMINAL-MASTER.md` (Design-DNA) **und** `KIZILELMA-creaDIG.md` (Haltung). Spiegle den Plan in 5 Bullets, dann arbeite **E7 → E10**, committe pro Epic. Frag nicht nach, was schon dokumentiert ist. Am Ende: was gebaut, was TODO (fehlende Badge-Logos, Owner-Impressum-Felder).
