# First Market Proof Activation

> **Authority:** Kanon · Proof Operations P2 · 11.09.2026  
> Baseline Production: `4fd521e` · kein Production-Schreiben in diesem Lauf.

## 1 · Drei Lanes — nie vermischen

| Lane | Was sie braucht | Was sie beweist | Market Proof? |
|---|---|---|---|
| **A · Customer Market Proof** | reale Kundenarbeit + Evidence + erforderliche Freigabe + Release | externe Kundenarbeit | **JA** |
| **B · Internal Measured Proof** | eigene Messreihe (z. B. fibero) | eigener Prozess messbar | **NEIN** |
| **C · Delivery Proof** | Kapazität / Vertretung mit Fundstelle | Lieferfähigkeit | **NEIN** |

fibero-Messung und Kapazität dürfen **niemals** als Market Proof bezeichnet werden.

## 2 · Erster Case Candidate

| | |
|---|---|
| **Auswahl** | `nv-swiss` (NV SWISS) |
| **Typ** | CUSTOMER WORK · **Lieferfall** (kein Ergebnisfall) |
| **Warum** | Substanziellste belegte Kundenarbeit: Marke + Website + Weg Anfrage→Termin; Live-URL; Kundenbild; Logo-Asset; Leistungen benannt |
| **Nicht gewählt** | `maqam` / `bir-damla-hayir` — schwächere Scope-Belege (`services`/`built` oft null) |

### Evidence Packet (intern)

| Feld | Stand |
|---|---|
| Starting Situation | **nicht belegt** (Kapitel `start`/`problem` leer) — keine Chaos-/Zeitverlust-Story |
| Scope | Versicherung & Finanzen · CH · Marke, Website, Digitalisierung |
| Delivered | Live-Auftritt `nvswiss.ch` · Kundenbild `/works/nv-swiss.jpg` (`customer-photo`) · Logo unter `public/brand/clients/` |
| Outcome Evidence | **keine** (keine Metriken, kein freigegebenes Statement) |
| Measurements | keine |
| Permission | `releases: []` |
| Boundary | Beweist: creaDIG hat Marke/Website/Weg gebaut und live gestellt. **Beweist nicht:** ROI, Conversion, 24/7-Betrieb, Scale |
| Claim ceiling | Delivery Case nach Freigabe — kein Outcome-/ROI-Claim |
| Next blocker | Owner bestätigt Candidate → Kundenfreigabe holen → `releases[]` (G18) |

### Top-3 (kurz)

| Candidate | Relevance | Evidence | System Depth | Permission | Verdict |
|---|---|---|---|---|---|
| nv-swiss | Mittelstand CH · Finanzen | Live + Bild + Leistungen | Weg Anfrage→Termin | 0 | **FIRST** |
| maqam | E-Commerce | Bild, Logo; Scope dünn | unklar | 0 | Reserve |
| bir-damla-hayir | Nonprofit | Bild, Logo; Brand+Website | gering | 0 | Reserve |

## 3 · Permission Scopes (granular)

| Scope | Needed for first public Delivery Case? | Status |
|---|---|---|
| name | **JA** (genannte Arbeit auf `/arbeiten`) | fehlt |
| logo | JA, wenn Logo gezeigt wird | fehlt |
| fallstudie / Beschreibung | **JA** (Mindest-Claim) | fehlt |
| screenshot / Kundenbild | **JA** (bestehendes Bild ist Kundenoberfläche) | fehlt |
| zahl / metric | NEIN (keine Zahl geplant) | — |
| zitat | NEIN | — |

Minimum sinnvolle Freigabe: **Name + Fallstudie + Screenshot** (Logo optional getrennt).

### Freigabe-Entwurf — **NICHT GESENDET**

> Betreff: Freigabe für eine kurze Projektbeschreibung auf creadig.de  
>  
> Wir möchten auf creadig.de unter Arbeiten folgenden **Lieferfall** zeigen:  
> · Name: NV SWISS  
> · Kurzbeschreibung: Marke, Website und der Weg von der Anfrage zum Termin  
> · Bild: bestehende Laptop-Aufnahme der Live-Oberfläche (kein internes Dokument)  
> · Logo: nur wenn Sie dem Logo-Umfang zustimmen (sonst ohne Logo)  
> · **Keine Kennzahl, kein Zitat, kein Umsatz-/ROI-Claim**  
>  
> Ort: creadig.de/arbeiten (und ggf. Fallkarte)  
> Widerruf: schriftlich jederzeit; danach entfernen wir die Nennung.

Owner muss Candidate und Scope **erst bestätigen**, bevor Kontakt.

## 4 · Release Distance

```
TODAY: Evidence Ready (Delivery) · Permission 0 · G18 Lock auf releases[]
  → OWNER: Candidate nv-swiss bestätigen + Permission-Scope freigeben
  → CUSTOMER: schriftliche Freigabe (Name + Fallstudie + Screenshot [+ Logo?])
  → SYSTEM: Release eintragen (deckt Bedarf aus Inhalt)
  → PUBLIC: G18-Entsperrung nötig, weil releases[] in lib/site-data.ts liegt
  → dann: /arbeiten Index ohne weitere Feature-Arbeit
```

| | |
|---|---|
| Pipeline | READY für Delivery Case |
| Public activation | **G18_BLOCKED** |
| Market Proof heute | **NO** |

## 5 · fibero — Internal Measured Proof (parallel)

| | |
|---|---|
| Framework | OPERATIONAL |
| Historischer Vorher | UNAVAILABLE |
| First real sample | **NO** |
| Best first metric | `fibero-ungeprueft` (% · system-zaehlung · klar · vergleichbar) |
| Clock started | **NO** |
| Earliest comparison | erst nach Sample + ≥28 Tage + vergleichbarer zweiter Punkt |

```bash
# Owner — erst nach Lesen der Definition, Wert NICHT schätzen:
npm run messprobe -- --kennzahl fibero-ungeprueft --seite ausgang \
  --wert <systemgezählt> --faelle <anzahl> --quelle system-zaehlung \
  --von "Emin" --schreiben
```

28 Tage allein ≠ Improvement Proof.

## 6 · Delivery Proof / AVV / Assets

| Item | State |
|---|---|
| kapazitaet-projekte | UNKNOWN |
| kapazitaet-betrieb | UNKNOWN |
| vertretung-ausfall | NOT ESTABLISHED / unbekannt |
| AVV Vercel / Resend / Neon | OWNER_CONFIRMATION_REQUIRED |
| CASSAMEA / meahv Assets | gesperrt bis sichere Aufnahme |
| fibero / meAI Assets | freigegeben (eigene Produkte) |

## 7 · Cockpit-Korrektur (P2)

Vor P2 stand `fibero-messung` als `kundenergebnis` und als wirksamster Schritt oben — semantisch falsch.

Nach P2: ohne öffentlichen Kundenbeleg führt der **Kundenfreigabe-Pfad**; fibero bleibt parallel, als `eigenes-produkt` / Internal Measured Proof.
