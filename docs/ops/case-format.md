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

Kein Agent setzt `approved: true` ohne diese Punkte.
