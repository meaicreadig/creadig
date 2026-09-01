# Neon / Datenschutz · Entscheidungspaket

> **Authority:** Spec · Gate 3 · Stand 30.08.2026
> **Zweck:** Die Persistenz-Frage auf **eine** Owner-Entscheidung reduzieren.
> **Status:** nichts provisioniert, nichts aktiviert, `LEAD_STORE` leer.
> **Gate 4:** Datenschutztext ist im Code an den Speicherzustand gebunden (§23) — die Aktivierung zieht ihn automatisch mit.
>
> Belege und Quellen je Einzelfrage: `docs/ops/provider-neon.md`.
> Der Textbaustein und die Reihenfolge: `docs/ops/privacy-persistence-gate.md`.

---

## Kennzeichnung

| Marke | Bedeutung |
|-------|-----------|
| **VERIFIED** | aus Anbieterdokument belegt, Datum in `provider-neon.md` |
| **TECHNISCH** | meine Empfehlung als Architekt |
| **OWNER** | Geschäfts- oder Rechtsentscheidung |
| **LEGAL REVIEW** | gehört einem Anwalt vorgelegt |
| **UNKNOWN** | nicht belegt — und deshalb nicht behauptet |

Ich bin keine Rechtsberatung. Wo etwas unsicher ist, steht das da.

---

## Die fünfzehn Antworten

| # | Frage | Antwort | Status |
|---|---|---|---|
| 1 | Wer verarbeitet die Daten vertraglich? | creaDIG = Verantwortlicher. **Neon, LLC** (Databricks-Affiliate) = Auftragsverarbeiter für den DB-Inhalt. Vercel bleibt Verarbeiter für Hosting/Auslieferung — **nicht** für die Lead-Zeilen. | VERIFIED |
| 2 | Welcher AVV greift? | Neon DPA (`neon.com/pdf/DPA.pdf`), eingebettet in MSA/Product Schedule. **Der bestehende Vercel-AVV deckt das nicht.** | VERIFIED |
| 3 | Frankfurt verfügbar? | Ja: `aws-eu-central-1`. **Bei Projekterstellung zu wählen, danach nicht änderbar.** | VERIFIED |
| 4 | Unterauftragnehmer? | Öffentliche Databricks-Liste (Stand 09.06.2026): AWS, Google, Microsoft, Oracle, Support-Tools, KI-Dienste, Databricks-Affiliates. | VERIFIED (Liste) · **UNCLEAR**, ob die volle Liste 1:1 für diesen Dienst gilt |
| 5 | Drittlandtransfer? | Compute/Storage in der gewählten Region; Konzern-, Support- und KI-Prozesse können außerhalb der EU liegen. | **LEGAL REVIEW** |
| 6 | Garantien? | DPA + SCC-Mechanik über Databricks. | VERIFIED (Dokument) |
| 7 | Einzelnen Lead löschen? | `DELETE FROM leads WHERE id = …` — eine Zeile, ein Befehl. | VERIFIED |
| 8 | Was bleibt nach dem Löschen? | **WAL/History-Fenster**: Free 6 h · Launch 7 Tage · Scale 30 Tage. Bis zum Ablauf ist die Zeile über PITR rekonstruierbar. | VERIFIED · Vollständigkeit ggü. Art. 17 = **LEGAL REVIEW** |
| 9 | Kündigung? | Export ist Kundenpflicht **vor** Deaktivierung; danach Delete/Return laut DPA. | VERIFIED |
| 10 | Env-Variablen? | `DATABASE_URL` (von der Integration gesetzt) + `LEAD_STORE=neon`. Nur Server. | TECHNISCH |
| 11 | Welcher Satz wird falsch? | „Eine Datenbank führen wir nicht …" — in **allen vier** Sprachen (`dictionary.ts`) | VERIFIED |
| 12 | Ersatztext | **Im Code, in allen vier Sprachen** als `legal.privacyPoints[].bodyStored`. Die Seite waehlt ihn ueber `leadStoreConfigured()` — Text und Speicher koennen nicht auseinanderlaufen. | **UMGESETZT** |
| 13 | Aufbewahrung? | **Empfehlung unten** | TECHNISCH → OWNER |
| 14 | Durchsetzung? | **Empfehlung unten** | TECHNISCH → OWNER |
| 15 | Lead wird Kunde? | **Wichtig, siehe unten** | TECHNISCH → OWNER |

---

## 13 · Aufbewahrung — eine Empfehlung, keine Auswahlliste

Drei Arten von Daten, die nicht dieselbe Frist verdienen:

| | Art | Frist |
|---|---|---|
| **A** | Anfrage ohne Vertrag | **hier zu entscheiden** |
| **B** | Kunde / Vertragsverhältnis | richtet sich nach dem Vertrag — nicht Gegenstand dieser Stufe |
| **C** | Rechnungen, Belege | gesetzliche Aufbewahrung — liegt ohnehin nicht im Lead-Speicher |

**Empfehlung für A: 12 Monate nach dem letzten Kontakt.**

Warum nicht 24, wie in den früheren Notizen vorgeschlagen:

- **Geschäftlicher Nutzen.** Der häufigste Absagegrund im Mittelstand ist „dieses Jahr kein Budget". Der sinnvolle Moment für den zweiten Anlauf ist der **nächste Budgetzyklus** — also rund zwölf Monate. Wer nach 18 Monaten anruft, ruft bei einem Fremden an.
- **Datenminimierung.** Zwei Jahre lang Namen, Telefonnummern und Betriebsinterna von jemandem zu halten, der nie Kunde wurde, ist schwerer zu begründen als ein Jahr. Die Frist muss *notwendig* sein, nicht bequem.
- **Löschaufwand.** Eine einzige Frist ab letztem Kontakt ist ein Satz und eine Abfrage. Fristen je Status wären eine Richtlinien-Maschine, die niemand pflegt.

**12 Monate ist eine Empfehlung, keine Rechtsauskunft.** Kürzer geht immer.

---

## 13b · Was „letzter Kontakt" im Modell wirklich heisst

**Das Modell kennt den letzten Kontakt nicht.** Es kennt zwei Zeitstempel:

| Feld | Was es wirklich bedeutet |
|---|---|
| `created_at` | wann die Anfrage eingegangen ist — hart, unveränderlich |
| `updated_at` | wann jemand den Datensatz zuletzt **angefasst** hat |

`updated_at` ist ein **Näherungswert**, keine Messung. Es steigt, wenn der
Status wechselt oder ein nächster Schritt gesetzt wird — also meist nach
einem echten Kontakt, aber nicht zwingend. Und es steigt **nicht**, wenn
telefoniert wurde und niemand es eingetragen hat.

**Erfunden wird nichts.** Es gibt kein Feld `last_contact_at`, und es wird
auch keines eingeführt, das in Wahrheit dasselbe wäre wie `updated_at` — ein
Feld mit einem ehrlicheren Namen und demselben Inhalt ist eine Lüge mit
besserer Beschriftung.

**Deshalb rechnet die Frist auf `updated_at`.** Die Abweichung geht
konsequent in die sichere Richtung: Ein unbearbeiteter Lead hat
`updated_at = created_at`, die Uhr läuft ab Eingang. Ein bearbeiteter Lead
wird **später** gelöscht, nie früher. Das ist im Zweifel zu viel
Aufbewahrung statt zu wenig — die falsche Richtung für Datenminimierung,
aber die einzige, in der kein Datensatz verschwindet, den noch jemand
braucht.

Wenn die Kontakthistorie eines Tages wirklich geführt wird (G.6), rechnet die
Frist auf sie. Bis dahin steht die Einschränkung hier und nicht im Kleingedruckten.

## 14 · Wie die Frist durchgesetzt wird

**Zunächst von Hand, bewusst.** Keine Lösch-Automatik in dieser Stufe.

Gründe: Ein Job, der Personendaten löscht, ist der gefährlichste Job im
System — ein Fehler darin ist unumkehrbar und fällt erst auf, wenn die Daten
weg sind. Er gehört gebaut, wenn es genug Datensätze gibt, dass Handarbeit
nicht mehr geht, und dann mit Trockenlauf und Protokoll.

Bis dahin: vierteljährlich, dokumentiert, mit einer festen Abfrage —

```sql
-- Kandidaten ansehen, NICHT löschen
SELECT reference, business, sales_status, updated_at
FROM leads
WHERE updated_at < now() - interval '12 months'
  AND sales_status <> 'won'
ORDER BY updated_at;
```

Die Bedingung `sales_status <> 'won'` ist der Kern und darf nie fehlen.

---

## 15 · Wenn aus einer Anfrage ein Kunde wird

Der Moment ist im Modell schon vorhanden: `salesStatus = "won"`.

Ab diesem Punkt ist der Datensatz **Kategorie B**. Die Frist für Anfragen gilt
für ihn nicht mehr — sie würde sonst einen aktiven Kunden nach zwölf Monaten
aus dem eigenen System löschen.

Solange es keine Kundendomäne gibt (G.5), ist die operative Regel deshalb
schlicht: **`won` wird nicht gelöscht.** Wenn G.5 kommt, zieht die
Kundenwahrheit dorthin um, und der Lead-Datensatz wird zur Herkunftsnotiz.

Das ist der Grund, warum die Abfrage oben `won` ausschliesst — nicht
Vorsicht, sondern Modell.

---

## Was nach der Freigabe gebaut wird

1. Neon-Projekt in `aws-eu-central-1` (Frankfurt) — Region ist **einmalig**
2. `@neondatabase/serverless`, dünner SQL-Adapter, **kein ORM**
3. Eine Tabelle `leads`, die `LeadRecord` abbildet:
   - interne ID als Primärschlüssel, `reference` als **eigene** Spalte
   - `submission_key` **unique** — die Doppel-Erkennung im Schema, nicht nur im Code
   - Indizes auf `sales_status` und `created_at`, sonst keine
   - keine Kunden-, Projekt- oder Rechnungstabellen in dieser Migration
4. `LEAD_STORE=neon`; `memory` und `file` bleiben in Produktion abgelehnt
5. Datenschutztexte DE + TR ersetzen · Neon in die Empfängerliste
6. Abnahme: schreiben · lesen · Doppelversuch · Mailfehler · Statuswechsel ·
   nächster Schritt · Speicher nicht erreichbar ≠ null Leads

Schritt 5 **vor** dem Scharfschalten von Schritt 4.

---

## Was blockiert bleibt ohne Freigabe

- Produktions-Persistenz — Anfragen leben weiter nur im Postfach
- „Production Sales" bleibt BLOCKED, egal wie gut die Oberfläche ist
- Ein Mailausfall bleibt ein möglicher stiller Verlust
