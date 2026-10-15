# Finanz — Landkarte „eine Firma"

Dieser Durchlauf (PROMPT-FINANZ-100-PROZENT.md, Phase 6) baut **keine**
Mandantenfähigkeit. Er dokumentiert nur, wo Finanz heute hart auf „eine
Firma" (creaDIG selbst) festgelegt ist — damit ein späterer
Mandantenfähigkeits-Durchlauf nicht neu suchen muss, welche Annahmen er
auflösen müsste.

Kein Code an den unten genannten Stellen wurde für dieses Dokument
geändert — nur die Landkarte.

## 1 · `fin_einstellungen.id = 'haupt'`

Es gibt genau EINE Zeile Einstellungen (Kontostand, ESt-Quote,
USt-Pflicht/-Rhythmus, Firmendaten). Jede Lese-/Schreib-Stelle spricht sie
über die feste ID `'haupt'` an, nicht über eine Mandanten-Kennung:

- `lib/finanz/store.ts:84` (`ladeAlles`)
- `lib/finanz/auftraege/store.ts:156` (`ladeFirma`)
- `lib/finanz/auftraege/store.ts:163` (`speichereFirma`)
- `app/(finanz)/finanz/actions.ts:116` (USt-Frist als bezahlt vermerken)
- `app/(finanz)/finanz/actions.ts:149` (`einstellungenSpeichern`)

Mandantenfähigkeit hieße hier: `id` wird zur Mandanten-ID, jede dieser
Abfragen bekommt sie als Parameter statt als Literal, und die Session weiß,
welcher Mandant gerade eingeloggt ist.

## 2 · `FIRMA = "firm-creadig"` in `lib/finanz/fibero-abgleich.ts`

Der Fibero-Abgleich liest ausschließlich die Zeilen, die in fibero unter
der festen `firm_id` `firm-creadig` stehen (`lade()`, Konstante `FIRMA` am
Dateianfang). Für eine zweite Firma bräuchte es entweder eine zweite
`firm_id` oder eine Zuordnung Mandant → fibero-`firm_id`.

## 3 · Der feste KI-Systemprompt in `lib/finanz/assistent.ts`

`SYSTEM` (oben in der Datei) nennt creaDIG, die Rechtsform
„Einzelunternehmen von Muhammed Emin Akyol, Osnabrück, Deutschland" und
spricht den Inhaber direkt als „Muhammed" an — wörtlich im Prompt-Text, nicht
aus einer Variable gelesen. Für eine zweite Firma bräuchte der Prompt
dieselben Firmendaten, die `ladeFirma()` ohnehin schon lädt (siehe Punkt 1),
statt sie ein zweites Mal hart zu hinterlegen.

## 4 · `GESCHAEFTSFELDER` in `lib/finanz/belege.ts`

Die Liste der Geschäftsfelder (`glasfaser`, `it`, `software`, `ecommerce`,
`privat`, `sonstiges`) ist eine feste, für creaDIGs eigenes Geschäft
geschnittene Aufzählung — Grundlage für Belege, Buchungen und die
Auswertung nach Geschäftsfeldern (`components/finanz/geschaeftsfelder.tsx`).
Eine andere Firma hätte andere Felder; die Liste müsste je Mandant
konfigurierbar werden, nicht eine zweite feste Aufzählung danaben.

## Was NICHT hart „eine Firma" ist

Nicht jede feste ID in Finanz ist eine Mandanten-Annahme. `fin_dokumente`,
`fin_buchungen`, `fin_nummernkreis` usw. sind bereits so gebaut, dass eine
Mandanten-Spalte sauber ergänzt werden könnte (jede Zeile trägt schon ihre
eigenen fachlichen Schlüssel, keine impliziten Annahmen über „die eine
Firma" im Datenmodell selbst) — die Kopplung sitzt an den vier Stellen oben,
nicht im Kern der Tabellen.
