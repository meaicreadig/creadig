# Geschäfts-Hauptbuch · B00–B12

> **Maßgebliche Statusquelle für Geschäftsbewegung.** Stand: 13.09.2026
> Branch `feat/system-haus-site` @ `1bf10c2` · Origin identisch · kein Drift
>
> Das technische Hauptbuch (`docs/final-live-completion/state.md`, F00–F12)
> bleibt gültig für **Systemreife**. Dieses Buch misst etwas anderes:
> **ob das System Geschäft getragen hat.** Ein grünes F heißt hier nichts.

## Das Hauptbuch

| Programm | Geschäftsergebnis | BUILD | CUTOVER | LIVE | CLOSURE | Status | Nächstes echtes Ereignis |
|---|---|:--:|:--:|:--:|:--:|---|---|
| **B00** Wahrheit & Vertrauen | Käufer kann prüfen, wer creaDIG ist | 🟢 | 🟢 | 🔴 | 🔴 | `BLOCKED_G18` + `WAITING_OWNER` | Owner bestätigt Rechtsperson, Steuerstatus, deutsche Rufnummer |
| **B01** Marktkontakt-Rhythmus | Wiederholbare echte Gespräche | 🟢 | 🔴 | 🔴 | 🔴 | `WAITING_OWNER` | Erster Growth Block (90 Min) |
| **B02** Marktthese & Zielbild | Markt wird nach Antwort gewählt, nicht nach Annahme | 🟢 | 🟡 | 🔴 | 🔴 | `WAITING_REAL_WORLD` | Erste Gespräche liefern Belege je Hypothese |
| **B03** Vertrieb live | Vorhandener Vertrieb wird benutzt | 🟢 | 🟢 | 🔴 | 🔴 | `WAITING_REAL_WORLD` | Ein Zyklus mit derselben Kennung bis WON/LOST |
| **B04** Lieferung live | Echte Arbeit läuft im System | 🟢 | 🟡 | 🔴 | 🔴 | `WAITING_OWNER` | Vegitat **oder** maqam in den Lieferpfad aufnehmen |
| **B05** Finanzen & kommerzielle Wahrheit | Gewonnenes wird korrekt fakturiert | 🟡 | 🔴 | 🔴 | 🔴 | `BLOCKED_G18` + `WAITING_OWNER` | Steuerstatus entschieden |
| **B06** Beleg & Beweis | Beleg als Nebenprodukt der Lieferung | 🟢 | 🟢 | 🔴 | 🔴 | `WAITING_OWNER` | Kundenfreigabe **und** erste Messprobe |
| **B07** Distribution & Inhalt | creaDIG bleibt für Käufer sichtbar | 🟡 | 🔴 | 🔴 | 🔴 | `WAITING_OWNER` | Eine echte Veröffentlichung |
| **B08** Beziehungen | Netzwerk wird aktiv geführt | 🟢 | 🟡 | 🔴 | 🔴 | `WAITING_OWNER` | Erste dokumentierte Kontaktpflege |
| **B09** Produkt- & Angebotswahrheit | Produkte stützen den Verkauf | 🟢 | 🟡 | 🟡 | 🔴 | `WAITING_OWNER` | Reifeentscheidung + sichere Aufnahmen |
| **B10** Owner-Steuerung | Eine Fläche beantwortet „was heute?" | 🟡 | 🟡 | 🟡 | 🔴 | `LIVE_EVOLUTION` | Owner arbeitet eine echte Woche daraus |
| **B11** Kapazität & Vertretung | Käufer weiß, was sicher lieferbar ist | 🟢 | 🔴 | 🔴 | 🔴 | `WAITING_OWNER` | Zwei Sätze vom Owner |
| **B12** Automatisierung | Automatisiert wird Wiederholtes | 🔴 | 🔴 | 🔴 | 🔴 | `NOT_STARTED` | **korrekt** — es gibt noch keine Wiederholung |

**Kein Programm ist CLOSED.** B12 steht bewusst auf `NOT_STARTED`: Nach §B12
darf nichts automatisiert werden, was noch nie stattgefunden hat.

---

## Belege — nur Geprüftes (13.09.2026)

| Frage | Befund | Quelle |
|---|---|---|
| Was sieht ein Käufer im Impressum? | „Umsatzsteuer-Status noch nicht freigegeben" · „Deutsche Rufnummer folgt" — **beide als Platzhalter gekennzeichnet**; einzige Nummer ist eine Schweizer Mobilnummer | `creadig.de/impressum`, abgerufen 13.09.2026 |
| Anschrift korrekt? | **ja** — `49076 Osnabrück`, `Albert-Einstein-Straße 1` | `lib/site-data.ts:1873` |
| Rechtsform öffentlich | „Einzelunternehmen" | `lib/site-data.ts:1931` |
| Unbelegte Nachweise noch öffentlich? | **nein** — BAFA, iuk, AVPQ, AGD sind aus Daten, Seite und strukturierten Daten entfernt | `app/_routes/unternehmen.tsx:34`, `home.tsx:201` |
| Gründungsjahr konsistent? | **ja, 2017** an allen geprüften Stellen | `lib/dictionary.ts` |
| Kapazität/Vertretung öffentlich behauptet? | **nein** — die Seite benennt ausdrücklich, dass beides fehlt | `lib/dictionary.ts:1621` |
| Team-Aussage | „kleines Kernteam, Netzwerk im DACH-Raum" — als **Entwurf** geführt, Owner-Bestätigung offen | `lib/material-status.ts:646` |
| Verlinkte Social-Profile | **0** | `lib/site-data.ts:1243` |
| Veröffentlichte Inhalte | **1** Insight, **0** Entwürfe, 5 von 6 Rubriken leer | `lib/insights.ts` |
| Beziehungsbestand | 24 Organisationen, 16 mit Ort, 3 Kontakte | `lib/vertrieb-bestand.ts` |
| Kann der Owner Beziehungen führen? | **ja** — `/admin/vertrieb/beziehungen` zeigt Name, Organisation, Beziehungsgrad, letzte Berührung, nächsten Schritt, Chance; fällige Pflege zuerst | `app/(admin)/admin/vertrieb/beziehungen/page.tsx` |
| Kann das System liefern? | **ja** — Angebot → Annahme → Projekt → Abnahme → Übergabe, mit Oberfläche | `kette-drill` K13 |
| Wo bricht die Kette? | **nur bei der Rechnung** — Steuerstatus offen | `kette-drill` K13 |
| fibero-Messung | Uhr **nicht gestartet**; `measurement_samples` fehlt in Produktion | `lib/fibero-messung.ts`, `cutover-014.md` |
| Historischer Vorher-Stand fibero | **nicht vorhanden** — und wird nicht geschätzt | `HISTORISCHER_VORHERSTAND_VORHANDEN = false` |

---

## Was diese Runde ausdrücklich NICHT getan hat

Kein Code gebaut. Kein Gate ergänzt. Keine Admin-Fläche hinzugefügt.

Nach §20 (Development Entry Test) wäre die erste Frage: *Welches echte
Geschäftsereignis ist bereit?* Antwort heute: **keines, das an fehlender
Software scheitert.** Jedes offene Ereignis wartet auf einen Menschen —
Owner, Kunde, Steuerberater oder Zeit. Nach §21 und §87 ist eine Runde mit
null geänderten Dateien in dieser Lage das richtige Ergebnis, kein Versäumnis.

Der einzige technische Hebel, der mehrere Geschäftsprogramme gleichzeitig
freigibt, ist **kein neuer Code, sondern eine Entscheidung**: die G18-Sperre.
Sie hält `site-data.ts` (Impressum, Rechtsform, Rufnummer, Social-Profile)
und `rechnung.ts` (Fakturierung) — also B00 und B05 zusammen.
