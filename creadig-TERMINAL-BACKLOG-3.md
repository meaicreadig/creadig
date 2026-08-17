# creaDIG — Terminal-Backlog 3 · Icon-Feinschliff (WhatsApp + Theme-Halbmond)

## Kontext
System-Haus-Next-Site auf Branch `feat/system-haus-site` (E0–E11 gebaut). Diese Backlog ist reiner **Feinschliff**: zwei Icons sind dem Owner noch nicht sauber genug. Strikt im bestehenden creaDIG-Design (Light + Gold-Akzent, echtes Logo aus `public/brand`, Poppins, Dreiecks-Signatur-Motiv). **Kein Redesign** — nur die zwei Icons sauber lösen.

## Gesperrte Entscheidungen (nicht kippen)
- Design bleibt: Light + Gold-Akzent, echtes Logo, Poppins, Dreiecks-Motiv. Kein Schwarz-dominant.
- Sticky-WhatsApp = grüner FAB (`#25D366`), weißes Glyph. Nav-WhatsApp = monochrom (Gold bei Hover).
- Nichts auf `main`/Produktion, bis Owner **„live"** sagt.

## Status heute (Ausgangslage)
Commit `1d21e14` (Ausgangspunkt): `WhatsAppIcon` = kanonischer Simple-Icons-Pfad (ein gefüllter Path), Theme-Toggle = lucide `Moon`.
**Owner-Urteil: reicht noch nicht.**
- WhatsApp: die Zeichen (Hörer + Sprechblasen-Rand) **überschneiden** sich optisch → unsauber, v.a. weiß im grünen FAB und Gold in der Nav.
- Mond: wirkt **nicht wie ein Halbmond** (vorher `MoonStar` mit Stern/„+"; auch schlichtes `Moon` zu undeutlich).
→ Im Terminal sauber neu lösen (Details unten).

## Epics

### E12 — WhatsApp-Glyph: sauber, ohne Überschneidung, bei jeder Größe
**Problem:** Hörer und Sprechblasen-Rand überschneiden sich optisch.
**Ziel:** Eindeutig als WhatsApp lesbar — runde Sprechblase + Schweif unten-links + Hörer sauber **in** der Blase, **keine** sichtbaren Überschneidungen bei 16 / 20 / 24 px.
**Lösung (empfohlen):** Hörer als **ausgestanzte Negativ-Fläche** (`fill-rule="evenodd"` / `clip-rule`), NICHT als übergelegter zweiter Pfad:
- **Sticky-FAB:** Sprechblase gefüllt (weiß via `currentColor`), Hörer als **Loch** → der grüne FAB-Hintergrund scheint durch den Hörer. So ist eine Überschneidung physisch unmöglich.
- **Nav:** dasselbe Glyph monochrom (`currentColor`), Hörer ausgestanzt.
- Optional Varianten-Prop `variant="solid" | "line"`, falls die Nav lieber eine feine Outline statt Vollfläche will.
**Test-Gate (Pflicht, visuell):** 16 px, 20 px, 24 px — jeweils in Nav (Gold auf hell) UND im FAB (weiß auf `#25D366`): scharf, eindeutig, Hörer sitzt sauber in der Blase, Schweif klar erkennbar, nirgends überlappende Kanten.
**Dateien:** `components/ui/whatsapp-icon.tsx`; genutzt in `components/site-nav.tsx` (2×) + `components/sticky-whatsapp.tsx`.

### E13 — Theme-Icon: echter, eindeutiger Halbmond
**Problem:** War `MoonStar` (Mond + Stern/„+"); auch schlichtes lucide `Moon` ist zu undeutlich/dünn.
**Ziel:** Auf den ersten Blick als **Mondsichel** erkennbar — kein Stern, kein Vollkreis, kräftige Sichel.
**Lösung (empfohlen):** **gefüllte Sichel** als eigenes kleines SVG (zwei versetzte Kreise, der innere via `evenodd` ausgestanzt) → maximal eindeutig als Halbmond. Alternative: lucide `Moon` mit kräftigerem `strokeWidth` (≈ 2.4).
**Test-Gate:** In der Nav neben „DE / TR" sofort als Halbmond lesbar — in Hell- und Dunkel-Theme.
**Datei:** `components/site-nav.tsx` (Theme-Toggle-Button).

## Acceptance Criteria
- [ ] `npm run build` grün
- [ ] WhatsApp-Glyph: Hörer sauber in der Blase, **keine** Überschneidung, bei 16 / 20 / 24 px in Nav (Gold) UND FAB (weiß/grün)
- [ ] Theme-Icon: eindeutiger Halbmond (gefüllte Sichel oder kräftige lucide-Moon), kein Stern / kein Vollkreis
- [ ] Design unverändert creaDIG (Gold/Light, Logo, Poppins) — kein Redesign

## Nicht tun
- ❌ Zweiten Pfad ÜBER den ersten legen (erzeugt genau die Überschneidung) — stattdessen **ausstanzen** (`evenodd`)
- ❌ Stern / „+" am Mond
- ❌ Farbwechsel, andere Icon-Bibliotheken-Optik, Redesign
- ❌ Force-push / Produktion ohne „live"

## Start
Lies diese Datei + `creadig-TERMINAL-MASTER.md` (Design-DNA). Arbeite **E12 → E13**, ein Commit pro Epic (`fix(E12): …`, `fix(E13): …`). Verifiziere **visuell** bei 16 / 20 / 24 px in Nav + FAB (Screenshot). Am Ende kurz: was gelöst.

## Weitere offene Owner-Punkte (nicht Terminal-codebar — nur Erinnerung)
- **Impressum:** Rechtsform · USt-IdNr oder §19-Hinweis · Verantwortlicher §18 Abs. 2 MStV
- **ICO-Foto** (rechtefrei) → `public/images/ico-osnabrueck.jpg` für die Parallax-Standort-Sektion
- **Offizielle Badge-Logos** → `public/badges/<slug>.svg|png` (go-digital, bafa, iuk, avpq, agd)
