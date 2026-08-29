# creaDIG · Demodaten-Standard

> **Authority:** Canon · MP-C.1 · Stand 29.08.2026
> **Gilt für:** jeden Screenshot, jede Aufnahme, jedes Video einer
> creaDIG-Oberfläche — auf der Website, im Angebot, in einer Anzeige, in einer
> Präsentation.
> **Ein Satz:** Die **Oberfläche** ist echt, die **Daten** darin sind es nie.

**Umgebung:** „Demodaten“ ≠ zwingend eine eigene Demo-App-Architektur.
Erlaubt ist jede sichere Kopie/Staging/lokale Instanz derselben echten
Anwendung — solange **ausschließlich synthetische Daten** darin stehen.
Verboten bleibt: Produktiv-Kundendaten, auch verpixelt.

---

## Die Regel

| | |
|---|---|
| ✅ **Echte UI** | Die tatsächliche Anwendung. Keine Figma-Attrappe, kein gerendertes Wunschbild, kein „so könnte es aussehen". |
| ✅ **Synthetische Daten** | Erfundene Betriebe, Namen, Beträge, Adressen — als erfunden erkennbar. |
| 🚫 **Echte Kundendaten** | Verboten. Ohne Ausnahme, auch verpixelt, auch „nur der Vorname". |

**Warum die Oberfläche echt sein muss:** Ein gerendertes Wunschbild ist ein
Versprechen über etwas, das es noch nicht gibt. Das ist dieselbe Kategorie wie
eine erfundene Referenz.

**Warum die Daten es nicht sein dürfen:** Auf einem echten Screen stehen
Kundennamen, Auftragswerte, Adressen, manchmal Telefonnummern. Ein solcher
Screenshot ist kein Beleg — er ist eine Weitergabe personenbezogener Daten an
jeden Besucher der Website. Verpixeln hilft nicht zuverlässig: Spaltenbreiten,
Summen und Reihenfolgen bleiben lesbar, und ein zweiter Screenshot desselben
Systems macht die Rekonstruktion oft trivial.

---

## Der Musterbestand

Damit nicht jeder Screenshot andere Fantasienamen zeigt, gilt ein fester
Bestand. Er ist als Fantasie erkennbar, ohne albern zu sein.

### Betriebe

| Name | Rolle |
|---|---|
| **Musterbetrieb Nord GmbH** | der Hauptbetrieb in allen Ansichten |
| **Elektro Weidmann & Söhne** | zweiter Betrieb, wo zwei gebraucht werden |
| **Bauservice Lindhorst** | dritter Betrieb für Listen |
| **Tiefbau Ostheide GmbH** | vierter, für Auslastungsansichten |

### Personen

Vorname + Nachname aus getrennten, unauffälligen Listen; **nie** ein Name aus
dem eigenen Umfeld, nie der eines echten Kunden, nie ein prominenter Name.

`Anke Rehberg` · `Tomasz Wilk` · `Merve Aydın` · `Jan Osterloh` · `Fatih Şen`

### Kontakt

- E-Mail immer auf `@example.com`, `@example.org` oder `.invalid` —
  **reservierte Domains, die niemandem gehören** (RFC 2606). Nie
  `@musterbetrieb.de`: Diese Domain kann jemandem gehören.
- Telefonnummern aus dem Bereich `+49 30 23125` **1–9** — der von der
  Bundesnetzagentur für Dokumentation reservierte Block.
- Adressen: `Musterweg 12, 49076 Osnabrück`. Postleitzahl darf echt sein, die
  Straße nicht.

### Beträge und Daten

- Beträge **rund und unauffällig**: 1.200 €, 3.450 €, 890 €. Keine Zahl, die
  wie ein echter Auftragswert aussieht und zufällig einer ist.
- Datumsangaben **relativ zur Aufnahme**, nicht in der Zukunft, nicht am
  Tag der Aufnahme.
- Keine Summe, die zufällig einem bekannten Angebot entspricht.

---

## Das Demodaten-Label

**Regel:** Jede Abbildung einer creaDIG-Oberfläche trägt sichtbar die Angabe,
dass die Daten darin Demodaten sind.

**Wo:** In der Bildunterschrift oder als Beschriftung neben der Abbildung —
**nicht** als Wasserzeichen quer über den Screenshot. Ein Wasserzeichen macht
die Oberfläche unlesbar und entwertet damit genau den Teil, der echt ist.

**Formulierung (Canon):**

| | |
|---|---|
| DE | „Echte Oberfläche, Demodaten." |
| TR | „Gerçek arayüz, örnek veriler." |

Zwei Aussagen in drei Wörtern: Die UI ist echt — das ist der Beleg. Die Daten
sind es nicht — das ist die Ehrlichkeit. Wer nur „Demo" schreibt, lässt offen,
ob auch die Oberfläche eine Attrappe ist, und verschenkt den Beleg.

**Wo es NICHT hin muss:** In einen internen Screenshot in einem Angebot, das
an genau einen Empfänger geht und den Kontext im Text hat. Die Regel gilt für
alles Öffentliche.

---

## Vor jeder Aufnahme — Prüfliste

| # | Punkt |
|---|---|
| 1 | Läuft die Aufnahme in einer **Demo-Instanz** oder Demo-Mandant? Nie im Produktivsystem. |
| 2 | Ist der angemeldete Benutzer ein Demo-Konto? Kopfzeile, Avatar und Menü zeigen ihn. |
| 3 | Sind **Benachrichtigungen und Badges** leer oder synthetisch? Dort steckt oft ein echter Name. |
| 4 | Steht in **Tabs, Titelleiste und URL** nichts Echtes? Ein Screenshot zeigt sie mit. |
| 5 | Sind **Autovervollständigung, Verlauf und zuletzt geöffnet** leer? |
| 6 | Zeigt eine Suche oder ein Filter noch alte echte Treffer? |
| 7 | Sind **Exporte, Dateinamen und Anhänge** synthetisch benannt? |
| 8 | Ist das Label „Echte Oberfläche, Demodaten." gesetzt? |
| 9 | Hat jemand **anderes** das Bild noch einmal angesehen, bevor es hochgeladen wurde? |

Punkt 9 ist der einzige, der die anderen acht auffängt.

---

## Was das für die vier Produkte heißt

| Produkt | Aufnahme möglich, sobald … |
|---|---|
| **fibero** | eine Demo-Instanz mit dem Musterbestand steht — läuft heute im echten Glasfaser-Alltag, also **nie** aus dem Produktivsystem |
| **meAI** | dasselbe: Demo-Mandant, keine echten Anfragen im Verlauf |
| **CASSAMEA** | Kassenansicht mit synthetischen Bons und Artikeln |
| **meahv** | Objekte, Mieter und Belege durchweg aus dem Musterbestand |

**Der Aufwand dafür ist der eigentliche Punkt.** Eine Demo-Instanz mit
sauberem Bestand ist Arbeit — und sie ist derselbe Ort, an dem später jedes
Verkaufsgespräch, jede Anzeige und jede Produktseite bedient wird. Sie einmal
zu bauen ist billiger, als bei jedem Screenshot neu zu prüfen, was gerade
drauf steht.

---

## Grenzfälle

**„Nur ein Ausschnitt, da steht nichts drauf."** Doch: Der Ausschnitt zeigt
Spaltenanzahl, Zustände und Summen. Und der nächste Ausschnitt zeigt den Rest.

**„Der Kunde hat zugestimmt."** Dann ist es ein **Kundenprojekt-Beleg** mit
allem, was `docs/ops/proof-kinds.md` dazu verlangt — schriftliche Freigabe,
und die Zustimmung deckt genau dieses Bild, nicht das System. Der bequemere
Weg bleibt trotzdem die Demo-Instanz.

**„Es ist unser eigener Betrieb."** Dann stehen dort die Daten **unserer
Kunden**. Der eigene Betrieb ist kein Freibrief, sondern der häufigste
Stolperstein.

**„Das Bild ist von 2024, die Daten sind alt."** Alte personenbezogene Daten
sind personenbezogene Daten.

---

## Verhältnis zur Image Bible

`docs/brand/design-system.md` sagt, **was** gezeigt werden darf (echte
Produkt-Oberflächen ja, Stock-Laptops nein). Dieses Dokument sagt, **wie** die
Aufnahme entstehen muss, damit sie gezeigt werden darf. Beide gelten
zusammen; das strengere gewinnt.
