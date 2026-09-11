#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Prüft eine (mit LibreOffice/Excel durchgerechnete) Kopie der Finanzübersicht:
vergleicht die Formelergebnisse mit einer unabhängigen Python-Berechnung
der Beispielbuchungen.

Aufruf:  python3 verify_finanzuebersicht.py <durchgerechnete.xlsx> [--test]
"""
import datetime as dt
import sys
from collections import defaultdict
from pathlib import Path

from openpyxl import load_workbook

sys.path.insert(0, str(Path(__file__).parent))
import build_finanzuebersicht as B  # noqa: E402

path = sys.argv[1]
test = "--test" in sys.argv
wb = load_workbook(path, data_only=True)
rows = B.example_rows()
Y = B.EXAMPLE_YEAR
fails = []
checks = 0


def close(a, b, tol=0.02):
    return abs((a or 0) - (b or 0)) <= tol


def expect(label, got, exp, tol=0.02):
    global checks
    checks += 1
    ok = close(got, exp, tol) if isinstance(exp, (int, float)) else got == exp
    if not ok:
        fails.append(f"{label}: erwartet {exp!r}, erhalten {got!r}")


def total(typ=None, fil="ALLE", kat=None, month=None, pay=None, year=Y, count=False):
    s, n = 0.0, 0
    for r in rows:
        if r["Datum"].year != year:
            continue
        if typ and r["Typ"] != typ:
            continue
        if fil != "ALLE" and r["Filiale"] != fil:
            continue
        if kat is not None and r["Kategorie"] != kat:
            continue
        if month and r["Datum"].month != month:
            continue
        if pay is not None and r["Zahlungsart"] != pay:
            continue
        s += r["Betrag"]
        n += 1
    return n if count else round(s, 2)


# ------------------------------------------------------------- Dashboard
d = wb["Dashboard"]
expect("Dashboard C15 Einnahmen", d["C15"].value, total("Einnahme"))
expect("Dashboard D15 Ausgaben", d["D15"].value, total("Ausgabe"))
expect("Dashboard E15 Ergebnis", d["E15"].value, total("Einnahme") - total("Ausgabe"))
expect("Dashboard F15 Marge", d["F15"].value, (total("Einnahme") - total("Ausgabe")) / total("Einnahme"), 1e-6)
expect("Dashboard H15 Buchungen", d["H15"].value, total(count=True))
for r, fil in ((12, "Zürich"), (13, "Luzern")):
    expect(f"Dashboard C{r}", d[f"C{r}"].value, total("Einnahme", fil))
    expect(f"Dashboard D{r}", d[f"D{r}"].value, total("Ausgabe", fil))
    expect(f"Dashboard H{r}", d[f"H{r}"].value, total(fil=fil, count=True))
expect("Dashboard C14 ohne Filiale", d["C14"].value, total("Einnahme", ""))
expect("Dashboard D14 ohne Filiale", d["D14"].value, total("Ausgabe", ""))
expect("Dashboard B7 Kachel", d["B7"].value, total("Einnahme"))
expect("Dashboard Q7 unvollständig", d["Q7"].value, sum(1 for r in rows if not r["Filiale"]))
expect("Dashboard R8 unbekannte Kategorie", d["R8"].value, sum(1 for r in rows if r["Kategorie"] not in B.EINNAHMEN + B.AUSGABEN))
expect("Dashboard I4 Buchungen gesamt", d["I4"].value, len(rows))
last = d["F4"].value
expect("Dashboard F4 letzte Buchung", last.date() if isinstance(last, dt.datetime) else last, max(r["Datum"] for r in rows))
best_m, best_v = None, None
for m in range(1, 13):
    r = 73 + m
    e, a = total("Einnahme", month=m), total("Ausgabe", month=m)
    expect(f"Dashboard C{r}", d[f"C{r}"].value, e)
    expect(f"Dashboard D{r}", d[f"D{r}"].value, a)
    expect(f"Dashboard E{r}", d[f"E{r}"].value, e - a)
    expect(f"Dashboard G{r}", d[f"G{r}"].value, total("Einnahme", "Zürich", month=m))
    expect(f"Dashboard H{r}", d[f"H{r}"].value, total("Einnahme", "Luzern", month=m))
    expect(f"Dashboard I{r}", d[f"I{r}"].value, total("Einnahme", "Zürich", month=m) - total("Ausgabe", "Zürich", month=m))
    expect(f"Dashboard J{r}", d[f"J{r}"].value, total("Einnahme", "Luzern", month=m) - total("Ausgabe", "Luzern", month=m))
    expect(f"Dashboard K{r}", d[f"K{r}"].value, total(month=m, count=True))
    if best_v is None or e - a > best_v:
        best_m, best_v = B.MONATE[m - 1], e - a
cum = 0.0
for m in range(1, 13):
    cum += total("Einnahme", month=m) - total("Ausgabe", month=m)
    expect(f"Dashboard F{73 + m} kumuliert", d[f"F{73 + m}"].value, cum)
expect("Dashboard N7 bester Monat", d["N7"].value, best_m)
expect("Dashboard O8 bester Monat Wert", d["O8"].value, best_v)
# Top 10
cats = sorted(((total("Ausgabe", kat=k), k) for k in B.AUSGABEN), key=lambda x: -x[0])
for i in range(10):
    r = 74 + i
    expect(f"Dashboard Top10 M{r}", d[f"M{r}"].value, cats[i][1])
    expect(f"Dashboard Top10 N{r}", d[f"N{r}"].value, cats[i][0])
for j, k in enumerate(B.AUSGABEN):
    expect(f"Dashboard Kategorie N{88 + j}", d[f"N{88 + j}"].value, total("Ausgabe", kat=k))
for p, z in enumerate(B.ZAHLUNGSARTEN):
    expect(f"Dashboard Zahlungsart C{91 + p}", d[f"C{91 + p}"].value, total("Einnahme", pay=z))
expect("Dashboard C101 ohne Zahlungsart", d["C101"].value, total("Einnahme") - sum(total("Einnahme", pay=z) for z in B.ZAHLUNGSARTEN))

# ------------------------------------------------------------- Monatsübersicht
mo = wb["Monatsübersicht"]
sel = mo["C5"].value
fil = "ALLE" if sel == "Alle" else sel
expect("Monat C5 Auswahl", sel, "Luzern" if test else "Alle")
for m in range(1, 13):
    col = chr(ord("C") + m - 1)
    for i, k in enumerate(B.EINNAHMEN):
        expect(f"Monat {col}{9 + i}", mo[f"{col}{9 + i}"].value, total("Einnahme", fil, k, m))
    for j, k in enumerate(B.AUSGABEN):
        expect(f"Monat {col}{23 + j}", mo[f"{col}{23 + j}"].value, total("Ausgabe", fil, k, m))
    expect(f"Monat {col}20 Total E", mo[f"{col}20"].value, total("Einnahme", fil, month=m))
    expect(f"Monat {col}49 Total A", mo[f"{col}49"].value, total("Ausgabe", fil, month=m))
    nz = total("Ausgabe", fil, month=m) - sum(total("Ausgabe", fil, k, m) for k in B.AUSGABEN)
    expect(f"Monat {col}48 nicht zugeordnet", mo[f"{col}48"].value, nz)
    expect(f"Monat {col}51 Ergebnis", mo[f"{col}51"].value, total("Einnahme", fil, month=m) - total("Ausgabe", fil, month=m))
    expect(f"Monat {col}54 Anzahl", mo[f"{col}54"].value, total(fil=fil, month=m, count=True))
expect("Monat O20 Jahr Einnahmen", mo["O20"].value, total("Einnahme", fil))
expect("Monat O49 Jahr Ausgaben", mo["O49"].value, total("Ausgabe", fil))
expect("Monat N52 kumuliert", mo["N52"].value, total("Einnahme", fil) - total("Ausgabe", fil))
expect("Monat F4 aktive Monate", mo["F4"].value, 12)
expect("Monat P20 Ø", mo["P20"].value, total("Einnahme", fil) / 12)
bud = wb["Budget"]
bcol = {"ALLE": "E", "Zürich": "C", "Luzern": "D"}[fil]
expect("Monat R23 Budget Wareneinkauf", mo["R23"].value, bud[f"{bcol}19"].value)
expect("Monat R20 Budget Total E", mo["R20"].value, bud[f"{bcol}16"].value)
expect("Monat S23 Abweichung", mo["S23"].value, mo["P23"].value - mo["R23"].value)

# ------------------------------------------------------------- Jahresübersicht
ja = wb["Jahresübersicht"]
sel = ja["C4"].value
fil = "ALLE" if sel == "Alle" else sel
expect("Jahr C4 Auswahl", sel, "Zürich" if test else "Alle")
expect("Jahr C7", ja["C7"].value, Y)
expect("Jahr H7", ja["H7"].value, Y + 5)
for i, k in enumerate(B.EINNAHMEN):
    expect(f"Jahr C{9 + i}", ja[f"C{9 + i}"].value, total("Einnahme", fil, k))
for j, k in enumerate(B.AUSGABEN):
    expect(f"Jahr C{23 + j}", ja[f"C{23 + j}"].value, total("Ausgabe", fil, k))
expect("Jahr C20", ja["C20"].value, total("Einnahme", fil))
expect("Jahr C49", ja["C49"].value, total("Ausgabe", fil))
expect("Jahr C51", ja["C51"].value, total("Einnahme", fil) - total("Ausgabe", fil))
expect("Jahr C54 Anzahl", ja["C54"].value, total(fil=fil, count=True))
expect("Jahr D20 (Folgejahr leer)", ja["D20"].value, 0)
expect("Jahr D52 Veränderung", ja["D52"].value, -1.0, 1e-9)
# Block 2 (Jahr im Detail)
for i, k in enumerate(B.EINNAHMEN):
    r = 64 + i
    expect(f"Jahr C{r} ZH", ja[f"C{r}"].value, total("Einnahme", "Zürich", k))
    expect(f"Jahr D{r} LU", ja[f"D{r}"].value, total("Einnahme", "Luzern", k))
    expect(f"Jahr E{r} Gesamt", ja[f"E{r}"].value, total("Einnahme", kat=k))
    expect(f"Jahr F{r} Budget", ja[f"F{r}"].value, (bud[f"E{6 + i}"].value or 0) * 12)
for j, k in enumerate(B.AUSGABEN):
    r = 79 + j
    expect(f"Jahr C{r} ZH", ja[f"C{r}"].value, total("Ausgabe", "Zürich", k))
    expect(f"Jahr D{r} LU", ja[f"D{r}"].value, total("Ausgabe", "Luzern", k))
    expect(f"Jahr E{r} Gesamt", ja[f"E{r}"].value, total("Ausgabe", kat=k))
    expect(f"Jahr F{r} Budget", ja[f"F{r}"].value, (bud[f"E{19 + j}"].value or 0) * 12)
expect("Jahr E75 Total E", ja["E75"].value, total("Einnahme"))
expect("Jahr E76 andere Filiale E", ja["E76"].value, total("Einnahme", ""))
expect("Jahr E105 Total A", ja["E105"].value, total("Ausgabe"))
expect("Jahr E106 andere Filiale A", ja["E106"].value, total("Ausgabe", ""))
expect("Jahr E104 nicht zugeordnet", ja["E104"].value, total("Ausgabe") - sum(total("Ausgabe", kat=k) for k in B.AUSGABEN))
expect("Jahr E108 Ergebnis", ja["E108"].value, total("Einnahme") - total("Ausgabe"))
expect("Jahr G108 Abweichung", ja["G108"].value, ja["E108"].value - ja["F108"].value)

# ------------------------------------------------------------- Mitarbeiter & Budget
ma = wb["Mitarbeiter"]
satz = sum(v for _, v in B.AG_SAETZE)
expect("MA C10 Satz", ma["C10"].value, satz, 1e-9)
for fil_, r in (("Zürich", 38), ("Luzern", 39)):
    emp = [e for e in B.MITARBEITER_BEISPIELE if e[1] == fil_]
    gross = sum(e[5] * (13 if e[6] == "Ja" else 12) / 12 for e in emp)
    expect(f"MA C{r} Anzahl", ma[f"C{r}"].value, len(emp))
    expect(f"MA D{r} Pensum", ma[f"D{r}"].value, sum(e[4] for e in emp), 1e-9)
    expect(f"MA E{r} Brutto", ma[f"E{r}"].value, gross)
    expect(f"MA F{r} AG", ma[f"F{r}"].value, gross * satz)
    expect(f"MA G{r} Kosten", ma[f"G{r}"].value, gross * (1 + satz))
    expect(f"MA H{r} Jahr", ma[f"H{r}"].value, gross * (1 + satz) * 12)
expect("MA G40 Gesamt", ma["G40"].value, ma["G38"].value + ma["G39"].value)
expect("Budget C22 = MA E38", bud["C22"].value, ma["E38"].value)
expect("Budget D23 = MA F39", bud["D23"].value, ma["F39"].value)
expect("Budget E16", bud["E16"].value, sum((bud[f"C{r}"].value or 0) + (bud[f"D{r}"].value or 0) for r in range(6, 16)))
expect("Budget E46", bud["E46"].value, bud["E16"].value - bud["E44"].value)
expect("Dashboard L8 Plan-Marge", d["L8"].value, bud["F47"].value, 1e-9)

# ------------------------------------------------------------- Listen
li = wb["Listen"]
expect("Listen F3", li["F3"].value, "Alle")
expect("Listen F4", li["F4"].value, "Zürich")
expect("Listen F6 leer", li["F6"].value in (None, ""), True)

print(f"{checks} Prüfungen, {len(fails)} Abweichungen")
for f in fails[:40]:
    print("  FEHLER:", f)
sys.exit(1 if fails else 0)
