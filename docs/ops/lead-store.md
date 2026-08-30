# Lead-Speicher · Entscheidung und Anschluss

> **Authority:** Spec · MP-G · Stand 30.08.2026
> **Owner-Entscheidung 29.08.2026:** Anfragen werden künftig gespeichert.
> **Was noch offen ist:** welcher Speicher — und der Satz in der
> Datenschutzerklärung, der mit ihm kommt.
> **Was gebaut und geprüft ist:** alles, was nicht vom Anbieter abhängt.

---

## Der Satz, der sich ändert

Heute steht in der Datenschutzerklärung:

> „Eine Datenbank führen wir nicht: Ihre Anfrage liegt ausschließlich in
> unserem E-Mail-Postfach."

Das war keine Nachlässigkeit, sondern eine Zusage. Sie wird eingelöst, bis sie
ersetzt ist — **der Speicher geht erst in Betrieb, wenn der neue Satz steht.**
Technisch ist das abgesichert: Ohne die Umgebungsvariable `LEAD_STORE`
verhält sich `/api/lead` exakt wie vorher (belegt, siehe unten).

### Entwurf für die Datenschutzerklärung — [VORSCHLAG, Owner prüft]

**DE**

> **Speicherung Ihrer Anfrage.** Ihre Angaben aus dem Formular speichern wir
> zusätzlich zur E-Mail in einer Datenbank, damit wir den Stand Ihrer Anfrage
> nachvollziehen können und sie nicht verloren geht. Gespeichert werden die
> Angaben, die Sie gemacht haben — Name, Betrieb, E-Mail, Telefon, Ihre
> Nachricht — sowie eine Vorgangsnummer und der Zeitpunkt. Rechtsgrundlage ist
> dieselbe Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO, die Sie vor dem
> Absenden erteilen. Wir löschen die Daten, wenn der Vorgang abgeschlossen ist
> und keine gesetzliche Aufbewahrungspflicht entgegensteht, spätestens jedoch
> nach 〈FRIST OWNER〉. Sie können jederzeit Auskunft und Löschung verlangen.

**TR** — wird nach Freigabe des deutschen Textes geschrieben, nicht davor.
Zwei Sprachen, eine Qualität (Prinzip 06).

**Rechtlich prüfen lassen.** Das ist ein Formulierungsvorschlag, keine
Rechtsberatung (Grundregel 1).

### Was der Owner zusätzlich festlegen muss

| Punkt | Warum |
|---|---|
| **Löschfrist** | Ohne Frist ist „wir speichern" eine unbefristete Speicherung. **24 Monate nach dem letzten Kontakt ist eine Ausgangsempfehlung, kein Naturgesetz** (Rev. 3 §28) — die Frist ist eine Owner-Entscheidung mit steuerlichen und geschäftlichen Folgen und gehört vor dem Canon dokumentiert. |
| **Auftragsverarbeiter** | Der Anbieter des Speichers verarbeitet personenbezogene Daten in unserem Auftrag → AVV nötig, Eintrag in der Verarbeiterliste. |
| **Auskunft und Löschung** | Wer eine Löschung verlangt, muss sie bekommen. Bei einer Datenbank heißt das: eine Zeile finden und entfernen. |

---

## Die Anbieterfrage

| Option | Auftragsverarbeiter | Aufwand | Bemerkung |
|---|---|---|---|
| **Neon Postgres** (Vercel Marketplace Native) | **Neon, LLC / Databricks** — nicht „Vercel Postgres“; bestehender Vercel-AVV deckt DB-Inhalt **nicht** automatisch | Gate ✅ 30.08.2026 → siehe `docs/ops/provider-neon.md` | Bevorzugter Kandidat · **noch keine Owner-Freigabe** · kein Adapter |
| **Schlüssel-Wert-Speicher (z. B. Upstash)** | **zu prüfen**, wie oben | ? | Schlüssel-Wert. Für Listen und Filter im Control Center schlechter geeignet |
| **Supabase / PlanetScale / …** | **neuer** Verarbeiter, neuer AVV | mittel | Mehr Funktionen, mehr Vertragsarbeit |
| **Datei im Repo** | keiner | — | **Geht nicht.** Serverless hat kein beschreibbares Dateisystem, das einen Neustart überlebt |

**Empfehlung (technisch): relationaler Speicher, kein Schlüssel-Wert-Speicher.**

### Provider Gate Neon (MP-G.3) — Kurzstand 30.08.2026

Vollständig: **`docs/ops/provider-neon.md`**.

| Urteil | Inhalt |
|--------|--------|
| Technisch | **JA** — LeadStore-Six-Methods, `@neondatabase/serverless`, Region Frankfurt |
| Rechtlich freigeben | **Noch NEIN** — DPA ablegen, Subprocessors abhaken, Privacy-Satz ersetzen, Retention klären |
| Implementierung | **Gesperrt** — kein Adapter, keine Tabelle, kein Env, kein `/admin/leads` |

Bevorzugte Region (Empfehlung): **`aws-eu-central-1` (Frankfurt)**.  
Bevorzugter Driver (Empfehlung): **`@neondatabase/serverless`** + rohes SQL im Adapter — kein Prisma/Drizzle für G.3 nötig.

> ### ⚠️ Korrektur 30.08.2026 — die Datenschutz-Begründung war zu bequem
>
> Hier stand: „Vercel steht schon in der Verarbeiterliste, der AVV besteht" —
> und daraus abgeleitet, ein „von Vercel bereitgestellter Postgres" sei
> vertraglich fast umsonst zu haben.
>
> **Das ist eine Annahme, keine Prüfung.** Master-Leiter Rev. 3 §27 verbietet
> sie ausdrücklich: keine Privacy-Annahme nur, weil etwas „über Vercel läuft".
>
> Der Grund ist konkret: Vercel liefert Datenbanken heute überwiegend über den
> **Marketplace** — die Datenbank läuft dann bei einem **anderen Unternehmen**,
> auch wenn sie im Vercel-Dashboard erscheint und über Vercel abgerechnet wird.
> Der bestehende AVV mit Vercel deckt Hosting und Auslieferung. Ob er einen
> Datenbank-Dienst eines Dritten mit abdeckt, **weiss dieses Dokument nicht.**
>
> Vor der Wahl je Kandidat schriftlich klären:
>
> | Frage | Warum |
> |---|---|
> | Wer ist **rechtlich** der Verarbeiter? | Der Rechnungssteller muss es nicht sein |
> | Gibt es einen AVV, und deckt er **diesen** Dienst? | Der bestehende Vercel-AVV gilt nicht automatisch |
> | Welche **Unterauftragnehmer**? | gehören in die Verarbeiterliste |
> | In welcher **Region** liegen die Daten? | EU-Region ist wählbar — und muss gewählt werden |
> | **Löschung** auf Anfrage — wie? | Auskunft und Löschung sind Pflichten, keine Funktionen |
> | Was passiert bei Kündigung? | Datenexport, Löschfrist |
>
> Erst wenn diese sechs Antworten vorliegen, ist ein Anbieter wählbar.
> Der Aufwand ist dabei **nicht** der Unterschied zwischen den Optionen —
> jede von ihnen braucht dieselben sechs Antworten.

Relational statt Schlüssel-Wert, weil das Control Center später filtern,
sortieren und zählen muss (`docs/control-center/current-state.md`), und weil
Kunden, Projekte und Rechnungen daran anschließen sollen, ohne dass ein
zweiter Speicher daneben entsteht.

**Kosten und Kontingent nennt dieses Dokument nicht** — sie ändern sich, und
eine Zahl von heute wäre in drei Monaten eine falsche Zahl.

---

## Was gebaut und geprüft ist

### Datenmodell

`LeadRecord` in `lib/lead-store.ts` — **die Felder aus
`docs/ops/crm-schema.md`**, kein zweites Modell:

`id` (UUID) · `reference` (`CD-YYMMDD-XXXX`) · `source` · `locale` · `name` ·
`email` · `phone` · `business` · `message` · `siteUrl` · `utmSource` …
`utmContent` · `salesStatus` (`"new"`) · `createdAt`

Nichts davon ist neu erhoben: Es sind genau die Angaben, die heute schon in
der Mail stehen.

### Der Aufrufort — und der Fehler, der dabei gefunden wurde

Die erste Fassung speicherte **im Erfolgsfall**, direkt vor der Antwort. Das
klang richtig („erst zugestellt, dann gespeichert") und war der teuerste
denkbare Fehler:

> Schlägt die **Zustellung** fehl, kehrt die Route mit 502 zurück — die
> Speicherzeile lief nie. Der Speicher hätte in jedem Fall geholfen **außer in
> dem einen, für den er da ist.**

Aufgefallen im Test mit einem absichtlich ungültigen Zustellschlüssel: kein
Protokolleintrag, wo einer stehen musste.

**Jetzt gilt:** Ein Lead, der die Prüfung besteht, wird festgehalten —
unabhängig davon, ob die Mail ankommt. Die Regel dahinter bleibt: `storeLead`
schluckt jeden eigenen Fehler und kann eine Anfrage nie zum Scheitern
bringen.

```
Prüfung (Honeypot · Token · Fenster · Pflichtfelder · Einwilligung)
        ↓
Identität erzeugen (id + reference)
        ↓
SPEICHERN            ← Fehler hier: intern gemeldet, Anfrage läuft weiter
        ↓
Mail ans Postfach    ← Fehler hier: 502, aber der Lead ist festgehalten
        ↓
Bestätigung an den Absender
```

### Prüfergebnisse

| Fall | Erwartet | Ergebnis |
|---|---|---|
| **Ohne `LEAD_STORE` (Betrieb)** | verhält sich exakt wie vor MP-G | ✅ 502/`send_failed` · nichts gespeichert · `privacy_required` · Honeypot `{ok:true}` |
| `LEAD_STORE=memory` **im Betrieb** | wird verweigert, Alarm, nichts gespeichert | ✅ identisch zum Fall darüber |
| `LEAD_STORE=postgres` (Adapter fehlt) | Alarm, nichts gespeichert, Anfrage unberührt | ✅ |
| `LEAD_STORE=memory` in Entwicklung, **Zustellung schlägt fehl** | trotzdem gespeichert | ✅ `[lead] gespeichert CD-260830-f3f1 (memory)` · Antwort weiterhin 502 |

Der `memory`-Adapter ist **nur für Entwicklung und Abnahme**. Im Betrieb wird
er abgelehnt: In einer Serverless-Umgebung überlebt er keinen Kaltstart und
gilt je Instanz — als produktive Ablage wäre er lautloser Datenverlust, und
lautlos ist schlimmer als gar nichts, weil man glaubt, man hätte die Daten.

---

## Was noch fehlt: ein Adapter

Sobald der Anbieter feststeht, ist es **eine Datei**:

```ts
const postgresStore: LeadStore = {
  name: "postgres",
  async save(record) { /* INSERT */ },
}
```

… und ein Zweig in `getLeadStore()`. Alles andere — Modell, Aufrufort,
Ausfallverhalten, Protokoll — ist gebaut und geprüft.

**Danach erst** kommen die Leseoperationen (Liste, Detail, Statuswechsel), und
damit `/admin/leads` — G.3 im Control Center.

### Reihenfolge

| # | Schritt | Wer |
|---|---|---|
| 0 | Die sechs Verarbeiter-Fragen je Kandidat beantworten (oben) | **Owner** |
| 1 | Anbieter wählen | **Owner** |
| 2 | AVV abschließen, Verarbeiterliste ergänzen | **Owner** |
| 3 | Datenschutzsatz + Löschfrist festlegen | **Owner** |
| 4 | Adapter + Tabelle | Agent |
| 5 | `LEAD_STORE` setzen — ab hier wird gespeichert | **Owner** |
| 6 | G.3 Sales im Control Center | Agent |

**Schritt 5 ist der Schalter.** Vorher passiert nichts, egal was im Code
steht.
