# creaDIG · Messaging-Canon

> **Was das ist.** Die gesperrte Sprache der Marke — DE und TR. Wer einen
> Satz auf der Seite, in einem Angebot, in einer Anzeige oder in einer Mail
> schreibt, schreibt ihn nach diesen Regeln oder gar nicht.
>
> **Was das nicht ist.** Kein Textvorrat zum Zusammenklicken. Jeder Satz hier
> steht entweder schon im Code (mit Fundstelle) oder ist als **[VORSCHLAG]**
> markiert und wartet auf den Owner.
>
> Stand: MP-A, 29.08.2026 · Quelle der Wahrheit im Code: `lib/dictionary.ts`

---

## 1 · Positionierung (gesperrt)

**creaDIG ist ein System-Haus für digitale Betriebe.**

Nie: Digitalagentur. Nie: Webagentur. Nie: Kreativagentur. Nie: Studio.

Der Unterschied ist kein Wort, sondern ein Versprechen: Eine Agentur liefert
ein Ergebnis und geht. Ein System-Haus baut etwas, das danach läuft — und
bleibt dafür zuständig.

**Leitzeile:** Wir bauen das System hinter Ihrem Betrieb.

Diese Zeile steht auf der Seite bereits ausgeschrieben, als Abschluss-Satz:

| | |
|---|---|
| DE | „Sie führen den Betrieb. Wir bauen das System dahinter." |
| TR | „İşletmenizi siz yönetirsiniz. Arkasındaki sistemi biz kurarız." |

→ `lib/dictionary.ts` · `closing.title` (DE und TR)

**Befund MP-A:** Die TR-Fassung stand im Code als „İşletme**yi** siz
yönetirsiniz" — ohne Possessiv. Der Canon des Owners sagt „İşletme**nizi**".
Ein Wort, aber es ist der Unterschied zwischen *dem* Betrieb und *Ihrem*
Betrieb. Im Code korrigiert.

---

## 2 · Die DNA — sechs Sätze, die nicht verhandelt werden

Diese sechs tragen die Marke. Sie stehen so oder sinngemäß auf der Seite;
neue Texte werden gegen sie geprüft, nicht neben sie gestellt.

| # | DNA | Wo es heute steht |
|---|---|---|
| 1 | **Wir bauen, was andere nicht sehen.** | Hero-Headline, `hero.headlineLine1–3` |
| 2 | **Erst zeigen. Dann reden.** | Sektions-Überschrift Startseite |
| 3 | **Fünf Ebenen. Ein System.** | `hero.systemLine` · TR: „Beş katman. Tek sistem." |
| 4 | **Kein Konzept. Ein laufender Betrieb.** | `impact.title` |
| 5 | **Eigene Produkte** — meAI, fibero, CASSAMEA, meahv | `productWorks` in `lib/site-data.ts` |
| 6 | **Deutsch und Türkisch, gleiche Qualität** | `SameShape`-Gate in `lib/dictionary.ts` |

---

## 3 · Die Struktur jedes längeren Textes

**Problem → System → Betrieb → Ergebnis**

Nie: Leistung → Feature → Technologie → Preis.

Die Reihenfolge ist keine Stilfrage. Sie entscheidet, ob jemand sich
wiedererkennt, bevor er etwas kaufen soll. Auf der Leistungsseite liegt sie
bereits als Datenfeld vor:

```
copy.problem   „Ausgangslage"           → Başlangıç durumu
copy.solution  „Was wir bauen"          → Ne kuruyoruz
copy.result    „Was danach anders ist"  → Sonrasında ne değişir
```

→ `lib/dictionary.ts` · `services.problemLabel` / `solutionLabel` / `resultLabel`

Der Betrieb ist der Teil, den Agenturen weglassen. Er gehört in jeden Text,
der länger als drei Sätze ist.

---

## 4 · Die Zeile unter der Headline

**Heute im Code (Owner-Text, bleibt):**

> creaDIG baut Marke, digitalen Auftritt, Betrieb, Automatisierung und
> künstliche Intelligenz als ein System — für Unternehmen in Deutschland,
> Österreich und der Schweiz.

> creaDIG; Almanya, Avusturya ve İsviçre'deki işletmeler için markayı,
> dijital görünümü, işletmeyi, otomasyonu ve yapay zekâyı tek bir sistem
> olarak kurar.

→ `hero.subline` (DE/TR)

**[VORSCHLAG] Kurzfassung**, falls der Owner die Zeile straffen will —
gleiche Aussage, halbe Länge, verliert aber die drei Märkte:

> Websites, Betriebssoftware, Automationen und KI — als ein verbundenes System.
>
> Web siteleri, işletme yazılımı, otomasyon ve yapay zekâ — birbirine bağlı
> tek bir sistem olarak.

Nicht umgesetzt. Der Owner entscheidet, ob die Märkte aus der Subline dürfen
— sie stehen sonst nur noch in der Hero-Fußzeile.

---

## 5 · Verbotene Phrasen

Nicht, weil sie hässlich sind, sondern weil sie **nichts belegen** und jeder
Wettbewerber sie auch schreibt. Wer eine davon braucht, hat kein Argument.

**Marketing-Superlative**
revolutionieren · Gamechanger · Next Level · State of the Art · innovativ ·
einzigartig · maßgeschneidert · ganzheitlich · Rundum-sorglos · Lösungen aus
einer Hand · Ihr starker Partner an Ihrer Seite

**Technik als Schmuck**
AI-powered · KI-getrieben · cutting edge · disruptiv · skalierbar (ohne Zahl) ·
performant (ohne Messung) · zukunftssicher

**Türkçe**
devrim niteliğinde · çığır açan · bir adım önde · anahtar teslim çözümler ·
%100 memnuniyet · sektörün lideri · yapay zekâ destekli (belegloser Zusatz)

**Regel dahinter:** Ein Adjektiv, das man nicht messen oder zeigen kann, wird
gestrichen. Steht daneben ein Beleg (Zahl, Screenshot, Kundenname), darf der
Beleg stehen — dann braucht es das Adjektiv ohnehin nicht.

---

## 6 · Was DE und TR unterscheidet

**TR ist keine Übersetzung, TR ist eine Fassung.**

- Wort-für-Wort ist verboten. Beispiel aus dem Code: Die Hero-Headline heißt
  DE „Wir bauen, / was andere / nicht sehen." und TR „Başkalarının /
  görmediğini / inşa ediyoruz." — dieselbe Aussage, andere Satzstellung,
  gleiches Gewicht auf drei Zeilen.
- Gleiche **Struktur**, nicht gleiche Länge: Das `SameShape`-Gate in
  `lib/dictionary.ts` erzwingt dieselben Schlüssel in beiden Sprachen, nicht
  dieselbe Zeichenzahl. Das Paritäts-Gate im Build prüft die Länge nur auf
  grobe Ausreißer.
- Die türkische Fassung ist für die **türkische Diaspora in Europa**
  geschrieben, nicht für den Markt Türkei. Sie duzt nicht, sie verkauft nicht
  lauter, und sie erklärt deutsche Begriffe nicht weg (Betrieb, Handwerk,
  Festpreis).

---

## 7 · Ton

| Ja | Nein |
|---|---|
| Ruhig, konkret, sparsam | Enthusiastisch, ausrufezeichenlastig |
| Nennt Preise, wo es welche gibt | „Auf Anfrage" als Standard |
| Sagt, was fehlt („folgt") | Lücken mit Bildern füllen |
| Sie-Form, DE und TR | Du-Form |
| Ein Gedanke pro Satz | Schachtelsätze mit drei Kommas |

**Zwei Sätze, die alles zusammenfassen, was hier verboten ist:**
Nicht behaupten, was man nicht zeigt. Nicht versprechen, was man nicht
betreibt.

---

## 8 · Wo der Canon im Code lebt

| Was | Wo |
|---|---|
| Alle sichtbaren Texte DE/TR | `lib/dictionary.ts` (SameShape-Gate) |
| Produkt- und Ebenen-Daten | `lib/site-data.ts` |
| Leistungsseiten-Texte | `lib/service-pages.ts` |
| Paritäts-Prüfung DE↔TR | `scripts/check-parity.mjs` (läuft im `postbuild`) |

Ein Satz, der auf der Seite steht und nicht in einer dieser Dateien, ist ein
Fehler — kein Feature.
