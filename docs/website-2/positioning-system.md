# Positionierungs-System · Gate 01

Was creaDIG nach außen ist, in einer Ordnung, die man prüfen kann. Kein
Manifest — jede Zeile hier hat eine Stelle im Code, an der sie steht, oder sie
steht nicht in diesem Dokument.

Gemessen am 10.09.2026 gegen den Gate-01-Zug auf `feat/system-haus-site`.

---

## 1 · Die Kategorie

> **System-Haus für digitale Betriebe.**

Steht in `dictionary.hero.eyebrow`, in allen vier Sprachen, im ersten
Blickfeld. Der Zusatz „für digitale Betriebe" ist nicht Schmuck: „System-Haus"
allein ist in Deutschland eine besetzte Kategorie (Server, Lizenzen,
Helpdesk), und genau die ist creaDIG nicht. Diese Abgrenzung steht wörtlich in
`home.statement.body`.

**Was die Kategorie nicht ist:** Agentur, Webdesigner, IT-Systemhaus,
Softwarehaus im Auftragsgeschäft. Die Website sagt zwei davon ausdrücklich ab.

---

## 2 · Die Reihenfolge der Argumente

Der Befund WEB-0003 lautete: *Fünf Ebenen werden vor dem Nutzerproblem
erklärt.* Beleg aus Gate 00: 31 Eyebrows und 9 H2 auf der Startseite, bevor
zum ersten Mal eine Kundenwirkung steht.

Gate 01 dreht die Reihenfolge um. Sie lautet ab jetzt und für alle folgenden
Gates:

| # | Frage des Lesers | Wo sie beantwortet wird |
|---|---|---|
| 1 | Was ist das für ein Haus? | Hero-Eyebrow |
| 2 | **Was ist mein Problem?** | Hero-Subline, `home.statement` |
| 3 | Was ist danach anders? | Hero-Subline, zweiter Satz |
| 4 | Können die das? | Bildband mit eigenen Produkten |
| 5 | Wie ist das geordnet? | Die fünf Ebenen |
| 6 | Was kostet das? | Einstieg: drei Arten anzufangen |
| 7 | Wer steht dahinter? | Firmen-Zeile |
| 8 | Was ist der nächste Schritt? | Abschluss |

Das Ebenenmodell steht an Position 5 — nicht gestrichen, sondern **verdient**.
Es erklärt eine Ordnung, nachdem der Leser weiß, warum ihn eine Ordnung
angeht.

---

## 3 · Der Ergebnissatz

WEB-0011: *Emotional stark, konkret schwach — kein Ergebnissatz.*

Die Hero-Subline nannte fünf Substantive („Marke, digitaler Auftritt, Betrieb,
Automatisierung und künstliche Intelligenz"). Alle richtig, keines ein
Ergebnis. Sie lautet jetzt:

> Wir bauen Betrieben das System, an dem ihre Arbeit hängt: Auftrag, Kunde,
> Beleg und Zahl an einem Ort. Danach gibt es eine Auskunft statt vier — und
> niemand sucht sie in drei Programmen zusammen.

**Herkunft:** wörtlich `services.layers.operations.problem` und `.result`. Der
Satz ist nicht neu erfunden; er stand bereits auf der Website, zwei
Bildschirmhöhen tiefer und hinter einer Klappe. Geändert hat sich die Stelle,
nicht die Aussage.

**Warum Operations und nicht alle fünf Ebenen:** Operations ist die Ebene, die
die Kategorie trägt. Ein Ergebnissatz, der fünf Ebenen gleichzeitig abdeckt,
ist wieder eine Aufzählung. Die Breite trägt die Reihe direkt darunter.

---

## 4 · Was die Positionierung nicht behauptet

Diese Liste ist Teil der Positionierung, nicht ihr Kleingedrucktes.

| Nicht behauptet | Warum |
|---|---|
| Kundenreferenzen | Keine schriftliche Freigabe (`genannteClientWorks` = 0) |
| Teamgröße, Kapazität | Nicht belegt (D-06) |
| Zertifizierungen | BAFA, iuk, AVPQ, AGD sind unbelegt |
| 24/7, SLA in Prozent, Reaktionszeit in Stunden | Ein Haus dieser Größe hält das an einem Sonntag nicht |
| Ein Preis für Intelligence | Kein bestätigter Betrag (OD-6) |
| Projektdauer je Leistung | `duration` ist Owner-gegatet und leer |

---

## 5 · Der Leitsatz, an dem sich das messen lässt

> **Interne Komplexität darf wachsen.
> Externe Komplexität darf nur wachsen, wenn der Nutzer etwas davon hat.**

(D-11, aus Gate 00.) Gate 01 hat ihn zweimal angewendet:

- Das Ebenenmodell bleibt intern vollständig und rückt außen an Position 5.
- Die Angebotsarchitektur (fünf Ebenen × Einstieg) ist innen eine Tabelle und
  außen **eine Zeile je Ebene** — siehe `offer-architecture.md`.
