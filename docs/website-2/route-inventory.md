# Routen-Inventar

Stand 10.09.2026, HEAD `4eb05c3`, ergänzt um Gate 01. Deutsche Pfade sind
kanonisch und gelten in allen vier Sprachbäumen; `lib/routes.ts` übersetzt
genau einen Pfad (`/barrierefreiheit` → `/erisilebilirlik` im türkischen
Baum).

**Gate 01 hat keine Route angelegt, umbenannt, entfernt oder umgeleitet.** Die
Sitemap zählt unverändert 108 Einträge. Geändert wurde, was zwei Routen zeigen
und welche im Hauptmenü stehen — siehe `information-architecture.md` und
`route-transition-plan.md`.

## Hauptmenü nach Gate 01

| Rubrik | Hauptmenü | Fußzeile | Grund |
|---|:-:|:-:|---|
| `/leistungen` | ✓ | ✓ | — |
| `/produkte` | ✓ | ✓ | — |
| `/arbeiten` | **—** | ✓ | WEB-0005 · zeigte dieselbe Sammlung wie `/produkte` |
| `/unternehmen` | ✓ | ✓ | — |
| `/insights` | **—** | ✓ | WEB-0018 · 1 Beitrag < Schwelle 3 |

Zurückgestuft heißt erreichbar: beide bleiben in der Fußzeile, in der Sitemap
und indexiert. Die Regel steht in `lib/navigation.ts` und wird von
`scripts/check-einstiege.mjs` geprüft.

| Route | Typ | DE | TR | EN | AR | Index | Hauptfrage | Haupt-CTA |
|---|---|:-:|:-:|:-:|:-:|:-:|---|---|
| `/` | Startseite | ✓ | ✓ | ✓ | ✓ | ja | Was ist creaDIG? | Projekt starten |
| `/leistungen` | Übersicht | ✓ | ✓ | ✓ | ✓ | ja | Was kann ich kaufen? | Festpreis-Angebot |
| `/leistungen/[slug]` ×6 | Detail | ✓ | ✓ | ✓ | ✓ | ja | Löst das mein Problem? | Anfragen |
| `/produkte` | Übersicht | ✓ | ✓ | ✓ | ✓ | ja | Kann creaDIG bauen? | Produkt ansehen |
| `/produkte/[slug]` ×4 | Detail | ✓ | ✓ | ✓ | ✓ | ja | Was ist das Produkt? | Interesse |
| `/arbeiten` | Kundenwerk | ✓ | ✓ | ✓ | ✓ | ja | Was wurde **für andere** geliefert? | Zu den eigenen Produkten (heute leer, OD-2) |
| `/arbeiten/[slug]` | Detail | ✓ | ✓ | ✓ | ✓ | ja | — (keine öffentlichen Werke) | — |
| `/unternehmen` | Firma | ✓ | ✓ | ✓ | ✓ | ja | Wem vertraue ich? | Gespräch |
| `/systeme` | Methode | ✓ | ✓ | ✓ | ✓ | ja | Integriert creaDIG? | Gespräch |
| `/betrieb` | Leistung | ✓ | ✓ | ✓ | ✓ | ja | Was heißt Betrieb? | Betreuung anfragen |
| `/branchen/handwerk` | Branche | ✓ | ✓ | ✓ | ✓ | ja | Passt das zu meinem Gewerk? | Betriebscheck |
| `/betriebscheck` | Werkzeug | ✓ | ✓ | ✓ | ✓ | ja | Wo klemmt es? | Ergebnis / Gespräch |
| `/insights` | Redaktion | ✓ | ✓ | ✓ | ✓ | ja | Denkt creaDIG gründlich? | Lesen |
| `/insights/[slug]` ×1 | Artikel | ✓ | ✓ | ✓ | ✓ | ja | — | Leistung ansehen |
| `/termin` | Formular | ✓ | ✓ | ✓ | ✓ | ja | Wie ins Gespräch? | Termin |
| `/kontakt` | Kontakt | ✓ | ✓ | ✓ | ✓ | ja | Wie erreiche ich creaDIG? | drei Wege |
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

Seit Gate 01 erscheinen dort auch die **eigenen Produkte** nicht mehr: Sie
stehen vollständig auf `/produkte` (D-16). `/arbeiten` ist damit heute eine
dünne, wahre Seite — 79 Wörter, 1.940 px Desktop — und bleibt es, bis eine
Freigabe vorliegt.
