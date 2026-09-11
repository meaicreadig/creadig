# Beleg-Kanon

> **Authority:** Kanon · Proof Operations P1 · 11.09.2026
> Was hier steht, gilt für Betrieb, Vertrieb und Website gleichermaßen.

## 1 · Der Zyklus

```
REALER BETRIEB → MESSPUNKT → EVIDENZ → FREIGABE → ÖFFENTLICHER BELEG
```

Nicht: Marketingidee → Text → Behauptung → später hoffentlich Beleg.

## 2 · Sechs Zustände, die nie verwechselt werden

| Zustand | Bedeutung |
|---|---|
| **GEBAUT** | Das System existiert |
| **IM BETRIEB** | Es wird real benutzt |
| **GEMESSEN** | Eine echte Messung liegt vor |
| **FREIGEGEBEN** | Beleg und Erlaubnis erlauben Veröffentlichung |
| **ÖFFENTLICH** | Die Website zeigt es |
| **AM MARKT BELEGT** | Externe Nutzung oder Ergebnis stützt die Aussage |

fibero ist **GEBAUT** und **IM BETRIEB** und **ÖFFENTLICH** — und ausdrücklich
nicht **GEMESSEN** und nicht **AM MARKT BELEGT**.

**P2 · Market Proof:** Erst wenn reale Kundenarbeit + substanzielle Evidence +
erforderliche Freigabe + öffentlicher Release vorliegen. Eine fibero-Messung
oder eine Kapazitätszahl ist **kein** Market Proof — siehe
`market-proof-activation.md`.

## 3 · Fünf Belegarten

Drei kommen aus `lib/proof.ts` (`PROOF_KINDS`) und behalten ihre Namen; zwei
kommen aus dem Betrieb dazu.

| Art | Wer muss freigeben | Beweist nicht |
|---|---|---|
| Eigenes Produkt | Owner allein | dass ein Kunde damit arbeitet |
| Kundenprojekt | Kunde schriftlich + Owner | welche Wirkung es hatte |
| Kundenergebnis | Kunde schriftlich + belegbare Messquelle | — die höchste Stufe |
| **Nachprüfbare Methode** | Owner allein | dass sie bei einem Kunden gewirkt hat |
| **Lieferfähigkeit** | Owner, mit Fundstelle | dass sie je beansprucht wurde |

## 4 · Jeder Beleg beantwortet sieben Fragen

CLAIM · EVIDENZ · QUELLE · DATUM · VERANTWORTLICH · GRENZE · FREIGABE.

Fehlt eine, ist es kein Beleg. **„Fehlt eine Spalte, fehlt der Beleg. Nicht
schwächer formulieren — weglassen."** (`docs/ops/proof-kinds.md`)

## 5 · Freigabe ≠ Beweis

Zwei getrennte Bedingungen, die beide erfüllt sein müssen:

| | |
|---|---|
| **Evidenzlage** | Trägt der Inhalt, was er behauptet? |
| **Veröffentlichungsrecht** | Darf er gezeigt werden? |

Eine Kundenfreigabe beweist keine Wirkung. Eine Messung erlaubt keine
Namensnennung.

## 6 · Die Freigabe ist granular

`lib/proof.ts`, unverändert seit Gate 13 — fünf Umfänge, **nicht gestuft**:

`name` · `logo` · `fallstudie` · `zahl` · `zitat`

Und `FORM_SCOPES`: Welche **Form** welchen Umfang überhaupt tragen kann. Eine
öffentliche Google-Bewertung trägt ein Zitat und sonst nichts — sonst würde
die freundlichste Quelle die weitreichendste Erlaubnis erzeugen.

**Der Bedarf fällt aus dem Inhalt, nicht aus einer Angabe daneben.** Wer eine
Kennzahl hinzufügt, erhöht damit automatisch die Freigabehürde und merkt es
beim nächsten Build.

## 7 · Kunde ≠ Fall

Kein Kunde wird automatisch Fall-Kandidat. Aus neunzehn Organisationen im CRM
neunzehn Kandidaten zu machen wäre die Mengenlogik, die später jemanden dazu
bringt, einen davon ohne Freigabe zu veröffentlichen.

Ein Fall entsteht durch eine **menschliche Entscheidung**, ihn anzulegen.

## 8 · Ein Fall ohne Wirkung ist erlaubt

Ein **Lieferfall** („was wir gebaut haben") braucht keine Messung. Ein
**Ergebnisfall** („was sich geändert hat") braucht sie zwingend. Beides zu
trennen ist besser, als einen Lieferfall mit erfundenen Zahlen aufzuwerten.

## 9 · Der Owner darf „unbekannt" sein

`unbekannt` ist ein legitimer Zustand und die einzige Aussage, die ohne Beleg
wahr ist. Das System zeigt lieber „unbestätigt", als eine Website-Behauptung
zu erzeugen.

**Eine Konfiguration ist kein Vertrag.** Dass `DATABASE_URL` gesetzt ist,
beweist, dass eine Datenbank benutzt wird — und sonst nichts.

## 10 · Wo was liegt

| Frage | Modul |
|---|---|
| Wer hat wozu zugestimmt? | `lib/proof.ts` |
| Welche Kundenarbeit, welche Fallstudie? | `lib/site-data.ts` |
| Was ist über ein Produkt belegt? | `lib/produkt-beleg.ts` |
| Darf diese Aufnahme öffentlich werden? | `lib/asset-sicherheit.ts` |
| Was behauptet der fibero-Betriebsbeleg? | `lib/fibero-beleg.ts` |
| Was wird ab wann gemessen? | `lib/messreihe.ts` · `lib/fibero-messung.ts` |
| Was kann nur der Owner bestätigen? | `lib/owner-wahrheit.ts` |
| Wer kann welchen Schritt übernehmen? | `lib/vertretung.ts` |
| **Was wird als Nächstes beweisbar?** | `lib/beleg-betrieb.ts` |

`lib/beleg-betrieb.ts` **liest** diese Quellen. Es kopiert keine. Wer eine
kopiert, hat ab dem nächsten Dienstag zwei Wahrheiten.
