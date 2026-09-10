# Website 2.0 · Abschlussbericht

**Stand: OWNER-INDEPENDENT COMPLETE**
Ausgangspunkt HEAD `6164bef23139b49ec34dec09ad1bab4f10ffec20`, auf `origin`
verifiziert. Ein Durchlauf über G04-Rest, G05, G06, G07, G08 und G09.
Gemessen am 11.09.2026.

---

## 1 · Was dieser Lauf gefunden und behoben hat

### Der größte Einzelfund: `/en` und `/ar` sprachen Türkisch

`app/(en)/en/not-found.tsx` und `app/(ar)/ar/not-found.tsx` lasen beide
`dictionary.tr`. Der Kommentar über der Zeile sagte es sogar — „die türkische
404-Seite" — und stand trotzdem über der englischen Route. Gemessen an
`/en/produkte/gibtesnicht`: Titel **„Sayfa bulunamadı · creaDIG"**.

Kein Typprüfer konnte das finden: Beide Zweige des Wörterbuchs haben dieselbe
Form. **Jetzt:** vier Sprachen, vier Fehlermeldungen.

| Route | vorher | nachher |
|---|---|---|
| `/produkte/gibtesnicht` | Seite nicht gefunden | Seite nicht gefunden |
| `/tr/…` | Sayfa bulunamadı | Sayfa bulunamadı |
| `/en/…` | **Sayfa bulunamadı** | **Page not found** |
| `/ar/…` | **Sayfa bulunamadı** | **الصفحة غير موجودة** |

### Eine Warnung auf jeder einzelnen Seite

`upgrade-insecure-requests` stand in der **Report-Only**-Policy. Browser
ignorieren die Direktive dort per Spezifikation und schreiben das in die
Konsole — gemessen auf **allen 124 geprüften Routen**, vier Sprachen.

Zwei Schäden: Die Direktive wirkte nicht, und eine Konsole mit einer Warnung
auf jeder Seite ist eine Konsole, in der niemand mehr die echte Meldung sieht.
Sie steht jetzt in der durchgesetzten Policy — dort, wo sie greift.

### Der achte Weg — jetzt geschlossen

Gate 02 hatte gemeldet, dass die zurückgehaltenen Aufnahmen
`/works/cassamea.jpg` und `/works/meahv.jpg` weiterhin im **RSC-Payload**
ihrer Produktseiten ausgeliefert werden, und das als Owner-Punkt (OA-1)
geführt — die Quelle `lib/site-data.ts` ist G18-gesperrt.

Sie muss gar nicht angefasst werden: Die Seite liest `image` seit Gate 02
nicht mehr. Das Feld wird jetzt in `app/_routes/produkt-detail.tsx`
abgeschnitten, **bevor** es die Client-Grenze überquert.

Gemessen im gebauten HTML: **0 Treffer** für beide Pfade (vorher je 4 Seiten).

### Betriebscheck: das Ergebnis nennt jetzt die eigenen Sätze

Das Ergebnis sagte „3 Stellen haben Sie selbst als offen benannt" — und
verschwieg, **welche drei**. Wer fünfzehn Fragen beantwortet hatte, bekam eine
Zahl und einen Ebenennamen zurück, aber keinen einzigen seiner eigenen Sätze.

Jetzt stehen bis zu drei davon da, in der Reihenfolge des Hauses. Keine
Deutung, keine erfundene Analyse — die eigene Angabe, zurückgegeben.

Geprüft an drei Profilen: alles „Läuft" (100/100, keine Liste), gemischt
(60/100, drei Operations-Sätze), alles „Nicht" (0/100, die ersten drei aus
Identity).

### Termin: der Kommentar stimmte, der Code nicht

Über der Vorauswahl stand seit Langem: *„wer darauf klickt, hat die Frage
‚Worum geht es?' bereits beantwortet und soll sie nicht noch einmal gestellt
bekommen."* Ausgeführt wurde die halbe Zusage — `setType` füllte vor, der
Assistent blieb auf Schritt 1. Der Besucher sah seine eigene Wahl noch einmal
und musste sie bestätigen.

| Einstieg | vorher | nachher |
|---|---|---|
| `/termin` | Schritt 1 / 4 | Schritt 1 / 4 |
| `/termin?art=systemgespraech` | Schritt 1 / 4 | **Schritt 2 / 4** |
| `/termin?paket=website` | Schritt 1 / 4 | **Schritt 2 / 4** |

### Weitere behobene Befunde

| ID | Was war | Was gilt |
|---|---|---|
| **WEB-0028** | `/produkte` **3×** im `main` jeder Produktseite | 2× — Brotkrume und Abschluss; der dritte Rückweg stand direkt unter einem Knopf mit demselben Ziel |
| **WEB-0032** | Störungs-Meldeweg auf allen vier Produktseiten, auch bei „im Aufbau" ohne öffentliche Adresse | nur noch, wo es öffentlichen Zugang gibt (meAI). Ein Störungsweg für ein Produkt, das nach außen nicht läuft, behauptet einen Betrieb |
| **WEB-0041** | „Im Aufbau" stand zweimal untereinander (Badge + Zeile) | `outcome` entfällt, wo es dem Badge nichts hinzufügt |
| **`/unternehmen`** | Nach der Kürzung in Gate 03 blieben links ~450 px leer | Raster 5/7 statt 7/5 — die schmalere Spalte trägt die Aussage |

---

## 2 · Was gemessen wurde

| Route | 1440 | 390 | Wörter | Eyebrows | Bilder |
|---|---:|---:|---:|---:|---:|
| `/` | 8.951 | 11.971 | 663 | 28 | 2 |
| `/leistungen` | 10.422 | 15.978 | 1.212 | 69 | 0 |
| `/leistungen/webdesign` | 2.544 | 4.424 | 214 | 9 | 0 |
| `/produkte` | 3.338 | 4.945 | 213 | 10 | 4 |
| `/produkte/fibero` | 5.191 | 6.369 | 280 | 18 | 1 |
| `/produkte/meai` | 6.648 | 8.726 | 432 | 21 | 1 |
| `/produkte/cassamea` | 4.203 | 5.788 | 250 | 16 | 0 |
| `/arbeiten` | 1.951 | 2.743 | 82 | 2 | 0 |
| `/unternehmen` | 9.359 | 13.484 | 1.012 | 41 | 9 |
| `/betriebscheck` | 3.598 | 5.682 | 330 | 7 | 0 |
| `/termin` | 2.038 | 2.877 | 85 | 4 | 0 |

### Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run build` | grün, **34 von 34** Postbuild-Gates |
| `npx tsc --noEmit` · `npx eslint .` | ohne Befund |
| `npm run a11y` | **124 Durchläufe**, keine maschinell feststellbare Verletzung |
| Routen-Rundgang | **124 Routen** (4 Sprachen), alle mit erwartetem Status, genau 1 H2… H1, kein Überlauf |
| Interne Links | 625 Links, 33 Zielseiten, kein toter Link, kein fehlender Anker |
| Reflow | 640 / 360 / **320 px** über 11 Routen inkl. Arabisch: **kein Überlauf** |
| Tastatur | 30 Tabs, **0 ohne sichtbaren Fokus**, Skip-Link an erster Stelle |
| Touch-Ziele | Betriebscheck: 45 Labels, **alle ≥ 24 px** (die 16-px-Radios liegen darin) |
| Strukturierte Daten | 19 JSON-LD-Blöcke, **0** mit Bewertung, Mitarbeiterzahl oder JobPosting |
| Sitemap / robots | 200 / 200, **108 Einträge** |
| Geheimnisse / PII | 127 gebaute Seiten: 0 Token, 0 Secrets, 0 private URLs, **0 unsichere Bildpfade** |

---

## 3 · Was offen bleibt — und warum

Kein Punkt hier ist durch Code lösbar.

| Blocker | Warum es zählt | Was die Seite heute tut |
|---|---|---|
| **0 freigegebene Kundenarbeit** (WEB-0001) | Der härteste Blocker für Mittelstand und größer | `/arbeiten` sagt es in 82 Wörtern und verweist auf die eigenen Produkte |
| **Keine sichere CASSAMEA-/meahv-Aufnahme** (WEB-0016 tlw.) | Zwei von vier Produkten ohne zeigbare Oberfläche | Beide Seiten zeigen kein Bild; die vorhandenen Dateien bleiben zurückgehalten |
| **Keine Bilder für Leistungen und den Artikel** (WEB-0016, WEB-0020) | Sechs Leistungsseiten und der stärkste Artikel sind rein textlich | Kompositorisch gelöst (zweispaltiger Kopf, Sequenz über volle Breite), bildlich nicht |
| **Vertretung und Kapazität** (WEB-0007 tlw.) | Die zwei Fragen vor jedem größeren Auftrag | `/unternehmen` nennt die Lücke ausdrücklich |
| **`packages.tsx` = 27 % von `/leistungen`** (WEB-0013) | Die längste Seite der Website | **G18-gesperrt.** Nicht durch Spacing kaschiert |
| **`/datenschutz` ohne Gliederungsebene** (WEB-0042) | 906 Wörter, 0 H2 | Gerendert von `components/legal/legal-page.tsx` — **G18-gesperrt** |
| **Einwilligungstext** (WEB-0022) | Dichter DSGVO-Absatz am Produktformular | Rechtstext, nicht eigenmächtig zu kürzen |
| **`/karriere`** (WEB-0015, WEB-0031) | Länge und ein Du/Sie-Bruch | Careers ist eingefroren |
| **`/api/lead` lokal 503** | Formulare können lokal nicht senden | Kein falscher Erfolg: ohne Token wird abgelehnt. Produktionsschlüssel fehlt lokal |

---

## 4 · Die Invarianten

| | |
|---|---|
| Preisbeträge geändert | **NEIN** (2.400 / 3.900 / 1.500 / 149) |
| Öffentliche Kundenfälle | **0** |
| Erfundene Zitate / Logos / Zahlen | **0** |
| Unsichere CASSAMEA-/meahv-Bilder gerendert | **NEIN** — und nicht mehr im Payload |
| Inhalt wieder aufgebläht | **NEIN** |
| Careers geöffnet | **NEIN** |
| G18-Dateien | byte-identisch, ungestaged |
| Production Deploy / Promote / DB / echte Sendung | **NEIN** |
