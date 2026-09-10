# Routen-Inventar

Stand 10.09.2026, HEAD `4eb05c3`. Deutsche Pfade sind kanonisch und gelten in
allen vier Sprachbäumen; `lib/routes.ts` übersetzt genau einen Pfad
(`/barrierefreiheit` → `/erisilebilirlik` im türkischen Baum).

| Route | Typ | DE | TR | EN | AR | Index | Hauptfrage | Haupt-CTA |
|---|---|:-:|:-:|:-:|:-:|:-:|---|---|
| `/` | Startseite | ✓ | ✓ | ✓ | ✓ | ja | Was ist creaDIG? | Projekt starten |
| `/leistungen` | Übersicht | ✓ | ✓ | ✓ | ✓ | ja | Was kann ich kaufen? | Festpreis-Angebot |
| `/leistungen/[slug]` ×6 | Detail | ✓ | ✓ | ✓ | ✓ | ja | Löst das mein Problem? | Anfragen |
| `/produkte` | Übersicht | ✓ | ✓ | ✓ | ✓ | ja | Kann creaDIG bauen? | Produkt ansehen |
| `/produkte/[slug]` ×4 | Detail | ✓ | ✓ | ✓ | ✓ | ja | Was ist das Produkt? | Interesse |
| `/arbeiten` | Werkschau | ✓ | ✓ | ✓ | ✓ | ja | Was wurde geliefert? | Arbeiten ansehen |
| `/arbeiten/[slug]` | Detail | ✓ | ✓ | ✓ | ✓ | ja | — (keine öffentlichen Werke) | — |
| `/unternehmen` | Firma | ✓ | ✓ | ✓ | ✓ | ja | Wem vertraue ich? | Gespräch |
| `/systeme` | Methode | ✓ | ✓ | ✓ | ✓ | ja | Integriert creaDIG? | Gespräch |
| `/betrieb` | Leistung | ✓ | ✓ | ✓ | ✓ | ja | Was heißt Betrieb? | Betreuung anfragen |
| `/branchen/handwerk` | Branche | ✓ | ✓ | ✓ | ✓ | ja | Passt das zu meinem Gewerk? | Betriebscheck |
| `/betriebscheck` | Werkzeug | ✓ | ✓ | ✓ | ✓ | ja | Wo klemmt es? | Ergebnis / Gespräch |
| `/insights` | Redaktion | ✓ | ✓ | ✓ | ✓ | ja | Denkt creaDIG gründlich? | Lesen |
| `/insights/[slug]` ×1 | Artikel | ✓ | ✓ | ✓ | ✓ | ja | — | Leistung ansehen |
| `/termin` | Formular | ✓ | ✓ | ✓ | ✓ | ja | Wie ins Gespräch? | Termin |
| `/kontakt` | Kontakt | ✓ | ✓ | ✓ | ✓ | ja | Wie erreiche ich creaDIG? | vier Wege |
| `/karriere` | Karriere | ✓ | ✓ | ✓ | ✓ | ja | Finde ich hier einen Platz? | Vorstellen |
| `/karriere/dach-business-development` | Rolle | ✓ | ✓ | ✓ | ✓ | ja | Ist das meine Stärke? | Vorstellen |
| `/karriere/founding-talent` | Rolle | ✓ | ✓ | ✓ | ✓ | ja | Passt mein Handwerk? | Vorstellen |
| `/karriere/bewerben` | Formular | ✓ | ✓ | ✓ | ✓ | **nein** | Wie stelle ich mich vor? | Übergabe |
| `/impressum` | Recht | ✓ | ✓ | ✓ | ✓ | ja | — | — |
| `/datenschutz` | Recht | ✓ | ✓ | ✓ | ✓ | ja | — | — |
| `/barrierefreiheit` | Recht/Beleg | ✓ | `/erisilebilirlik` | ✓ | ✓ | ja | — | — |
| `/status` | intern | ✓ | — | — | — | **nein** | — | — |
| `[...notfound]` | Fehler | ✓ | ✓ | ✓ | ✓ | nein | — | zurück |

## Parität

- **Vollständig** in allen vier Sprachen: alle öffentlichen Routen.
- **Nur DE:** `/status` — Innenansicht, bewusst.
- **Pfad übersetzt:** nur `/barrierefreiheit` → `/erisilebilirlik` (TR).
- **Sitemap:** 108 Einträge = 27 Routen × 4 Sprachen.
- **Bekannter Fehler:** `/en` und `/ar` Fehlerseiten liefern türkischen Text
  (WEB-0010) — Ursache in `app/(en)/en/not-found.tsx:13` und
  `app/(ar)/ar/not-found.tsx:13`.

## Nicht öffentlich verlinkt

`nv-swiss` und `maqam` liegen als Werke im Datenbestand, erscheinen aber nicht
auf `/arbeiten`. Relevant für OD-2.
