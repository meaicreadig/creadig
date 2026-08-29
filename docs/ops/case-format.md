# Case-Format · MP-C.3

> **Authority:** Working Note · Owner-Fill-Guide  
> Kurz: **Projekt · Kategorie · Leistungen** (ohne Tech-Stack).  
> Tief (optional): Ausgangslage → Problem → Ziel → Rolle → System → Umsetzung → Ergebnis → Heute.

---

## Was der Code schon hat

| Feld | Wo | Regel |
|---|---|---|
| `caseStudies[].card` | `lib/site-data.ts` | Projekt · Kategorie · Leistungen |
| `caseStudies[].chapters` | acht Schlüssel | nur setzen, was Owner bestätigt |
| `caseStudies[].metrics` | Array | **nur** mit `source` — sonst weglassen |
| `approved` | boolean | `true` **nur** mit schriftlicher Freigabe **+** Freigabesatz |

Ohne `approved: true` rendert die Fallstudie **nirgends**.

---

## Kundenstand (29.08.2026)

| Projekt | Logo | Kundenbild | Leistungen (`card.services`) | Freigabe | `approved` |
|---|---|---|---|---|---|
| NV SWISS | ✅ | ✅ `/works/nv-swiss.jpg` | ✅ Marke, Website, Digitalisierung | ❌ | `false` |
| maqam | ✅ | ✅ `/works/maqam.jpg` | ❌ noch offen | ❌ | `false` |
| Bir Damla Hayır | ✅ | ✅ `/works/bir-damla-hayir.jpg` | ❌ noch offen | ❌ | `false` |

**Orphan:** `rumis-maison.png` — nicht verdrahten.

---

## Was der Owner liefern muss (pro Fall)

1. Schriftliche Freigabe der Nennung  
2. Ein Freigabesatz (Aufgabe / Ergebnis) → `clientWorks[].approvedSentence` + `approvalOnFile: true`  
3. Optional: `card.services` (Leistungen, **keine** Tech-Liste)  
4. Optional: einzelne Kapiteltexte / Kennzahl **mit Quelle**  
5. Dann erst: `caseStudies[].approved = true`

---

## Befund 29.08.2026 — was öffentlich steht und was aktenkundig ist

Drei Kundennamen und drei Logos stehen **live auf der Seite**
(`clientWorks`, `CLIENT_LOGOS`, Werkschau, Logowand). Gleichzeitig steht in
denselben Datensätzen `approvalOnFile: false`.

Das ist kein Widerspruch im Code — das Feld gatet heute nur `/status` und
`caseStudies`, nicht die Nennung. Es ist eine **Lücke im Nachweis**: Die
Freigaben mögen existieren, sie sind nur nirgends festgehalten. Und was
nirgends festgehalten ist, kann in einem Jahr niemand belegen.

Zwei Wege, beide vom Owner:

1. **Freigabe existiert** → Satz unten ausfüllen, `approvalOnFile: true`
   setzen. Damit ist die Nennung gedeckt und die Fallstudie freischaltbar.
2. **Freigabe existiert nicht** → einholen. Bis dahin bleibt es, wie es ist;
   dieses Dokument sagt dann wenigstens, was offen ist.

Ein Agent setzt `approvalOnFile` **nie** selbst. Auch nicht, wenn der Name
schon öffentlich steht — genau diese Logik („steht doch eh schon da") ist der
Weg, auf dem aus einer Unterlassung eine Behauptung wird.

---

## Vorlage — der Owner füllt das aus und schickt es zurück

Ein Block je Kunde. Alles, was leer bleibt, bleibt `null` im Code.

```
KUNDE:            NV SWISS | maqam | Bir Damla Hayır
NENNUNG FREI:     ja / nein        (schriftlich vom Kunden, Datum: ______)
FREIGABESATZ DE:  „…"              (ein Satz: Aufgabe → Ergebnis)
FREIGABESATZ TR:  „…"              (oder: „bitte übersetzen")
LEISTUNGEN:       …, …, …          (Kundensprache, KEIN Tech-Stack)
KENNZAHL:         …                (nur mit Quelle — sonst leer lassen)
ZITAT:            „…" — Name, Rolle (nur wenn wirklich gesagt)
```

**Zwei Beispiele, wie ein Freigabesatz klingt** (Muster, nicht über echte
Kunden — nichts davon steht im Code):

> „Wir haben Marke, Website und die digitalen Abläufe aufgebaut; heute läuft
> der Auftritt und wird von uns betreut."

> „Wir haben den Online-Auftritt neu gebaut und den Verkauf daran
> angeschlossen."

Was in so einem Satz **nicht** vorkommt: Prozentzahlen, „deutlich mehr",
Umsätze, Nutzerzahlen. Eine Zahl braucht eine Quelle und gehört dann in
`metrics[]`, nicht in den Freigabesatz.

Kein Agent setzt `approved: true` ohne diese Punkte.
