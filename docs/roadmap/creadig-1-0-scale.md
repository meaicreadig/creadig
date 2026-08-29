# creaDIG 1.0 — Scale Blueprint

> **Authority:** Spec · MP-F · Stand 29.08.2026
> **PLAN FIRST.** Dieses Dokument beschreibt, **was gebaut werden könnte** —
> nicht, was gebaut wird. Jeder Bau braucht eine einzelne Owner-Freigabe.
> **Black Lock:** keine erfundenen Zahlen, keine Umsatzziele, die niemand
> gesetzt hat, keine Feature-Fantasie ohne Datenpfad.
> **Quelle:** KIZILELMA §12 · `creadig-MASTER-PROMPT-COMPANY-OS.md`

---

## Der Satz, an dem sich alles hier misst

> **Die Vitrine ist der Firma voraus.** (KIZILELMA §12.0)

Die Website steht bei ~8,3 von 10. Lead-System 6,5, Verkaufssystem 6,8,
operative Infrastruktur „unvollständig". Skalieren heißt hier **nicht**: mehr
bauen. Es heißt: die Maschine hinter der Vitrine auf dasselbe Niveau bringen.

**Die Reihenfolge dieses Dokuments ist keine Prioritätenliste.** Die
Prioritäten stehen ganz unten unter „Was zuerst".

---

## 1 · Customer Portal `my.creadig` — nur IA

> ### 🚦 BUILD GATE
> **Nicht bauen, solange beides fehlt:**
> 1. ein echter operativer Bedarf — ein Kunde fragt „wo ist mein Ticket /
>    meine Rechnung / mein Status?", **und**
> 2. ein ausdrückliches Owner-OK.
>
> **Default = Spec. Build = Ausnahme.**
>
> **Warum das Gate hart ist:** Ein Portal ist kein Feature, es ist eine
> Verpflichtung. Ab dem Tag, an dem es online steht, muss es gepflegt,
> überwacht, gesichert und mit aktuellen Daten gefüllt werden — von einer
> Person. Ein leeres oder veraltetes Portal ist schlimmer als keins: Es macht
> aus „wir betreiben Ihr System" eine sichtbar unbetreute Fläche.
>
> **Die billigere Antwort auf denselben Bedarf** heißt heute: eine Mail mit
> Vorgangsnummer, ein Statuslink, eine PDF-Rechnung. Das Portal lohnt sich
> ab der Zahl von Kunden, bei der diese Mails zum Vollzeitjob werden — und
> diese Zahl kennt nur der Owner.

### Rollen

| Rolle | Sieht | Kann |
|---|---|---|
| **Kunde (Ansprechpartner)** | eigene Projekte, Systeme, Tickets, Rechnungen | Ticket öffnen, Datei laden, Rechnung herunterladen |
| **Kunde (weitere Person)** | dasselbe, ohne Rechnungen | Ticket öffnen |
| **creaDIG** | alles | alles |

Mehr Rollen nicht. Ein Rechtekonzept mit sieben Stufen für eine Firma mit
einem Mitarbeiter ist Beschäftigung, keine Architektur.

### Sitemap

```
my.creadig.de
├── Übersicht          Systeme + offene Punkte + nächster Termin
├── Projekte
│   └── <projekt>      Stand, Abschnitte, Dateien, Ansprechpartner
├── Systeme            was läuft, seit wann, Version, letzte Wartung
├── Tickets
│   ├── offen
│   └── erledigt
├── Rechnungen         Liste + PDF (nur Ansprechpartner)
├── Dokumente          Verträge, Übergaben, Zugänge (verschlüsselt)
└── Konto              Kontaktdaten, Benachrichtigungen
```

### Leerzustände — die eigentliche Arbeit

Ein Portal ist am Anfang **fast immer leer**. Jeder Bereich braucht darum
einen Zustand, der ohne Inhalt trägt:

| Bereich | Leerzustand |
|---|---|
| Projekte | „Ihr Projekt startet am 〈Datum〉. Bis dahin steht hier die Vorbereitung." |
| Systeme | „Noch kein System übergeben." — **kein** grüner Haken ins Leere |
| Tickets | „Keine offenen Punkte." + Knopf „Punkt melden" |
| Rechnungen | „Noch keine Rechnung gestellt." |
| Dokumente | „Hier liegen später Vertrag und Übergabe." |

**Verboten:** Beispiel-Tickets, Demo-Projekte, Platzhalter-Diagramme im
Kundenkonto. Ein Kunde, der Fantasie-Daten in seinem eigenen Portal findet,
weiß danach nie mehr, welche Zahl echt ist.

### Technisch (Skizze, nicht Entscheidung)

Getrennte Anwendung unter eigener Subdomain, **nicht** in die Marketing-Site
gebaut: andere Auth, andere Cache-Regeln, anderes Risikoprofil. Die
Marketing-Site bleibt statisch — das ist heute ihre halbe Performance.

---

## 2 · Trust Center + Status Page

### Trust Center (`/vertrauen`)

Eine Seite, die die Fragen beantwortet, die vor einem Vertrag kommen — und
die heute über fünf Seiten verstreut sind.

| Abschnitt | Inhalt | Bestand heute |
|---|---|---|
| Wer wir sind | Rechtsform, Sitz, Verantwortlicher | ✅ Impressum |
| Datenschutz | Was verarbeitet wird, von wem, wie lange | ✅ `/datenschutz` |
| Auftragsverarbeitung | Liste der Verarbeiter + Vertragsstand | ✅ mit sichtbarem „offen"-Vermerk |
| Barrierefreiheit | Erklärung + Prüfstand | ✅ `/barrierefreiheit` |
| Betrieb & Erreichbarkeit | Reaktionszeiten je Stufe | ⬜ erst nach Managed Tiers |
| Sicherheit | Zugänge, Backups, Wiederherstellung | ⬜ **nur was wirklich läuft** |
| Untervergabe | Wer außer creaDIG arbeitet mit | ⬜ Owner |

**Regel:** Das Trust Center ist die Seite, auf der eine Übertreibung am
teuersten ist. Jede Zeile hier ist eine Zusage, die im Streitfall gilt. Lieber
drei ehrliche Abschnitte als sieben mit „branchenüblichen Standards".

### Status Page

`/status` existiert bereits — heute als **interner Lückenmelder**
(`NEXT_PUBLIC_STATUS_PUBLIC`). Zwei verschiedene Dinge, die nicht vermischt
werden dürfen:

| | Interner Lückenmelder (heute) | Öffentliche Statusseite (später) |
|---|---|---|
| Zeigt | was im Repo fehlt | ob die Systeme laufen |
| Für | Owner | Kunden |
| Datenquelle | Code | Monitoring |

Eine öffentliche Statusseite **ohne echtes Monitoring** ist eine Seite, die
„alles grün" behauptet, weil niemand hinsieht. Sie kommt nach dem Monitoring,
nicht davor.

---

## 3 · creaDIG Pulse + System Health Score

### Pulse — der Monatsbericht

Ein Blatt je Kunde und Monat. Kein Dashboard, das niemand öffnet — eine PDF
oder Mail, die ankommt.

| Block | Inhalt | Woher |
|---|---|---|
| Was lief | Uptime, Updates, Backups | Monitoring |
| Was wir gemacht haben | erledigte Punkte im Klartext | Tickets |
| Was auffällt | ein Satz, wenn etwas auffällt | Mensch |
| Was als Nächstes ansteht | ein bis drei Punkte | Plan |

**Der dritte Block ist der Grund für das ganze Ding.** Uptime kann jeder
Anbieter drucken. „Uns ist aufgefallen, dass X seit drei Wochen niemand mehr
nutzt" kann nur jemand, der hinsieht.

### System Health Score — Definition, keine Zahl

**Der Score wird erst definiert, dann gemessen, dann gezeigt.** In dieser
Reihenfolge. Eine Zahl ohne Definition ist eine Meinung mit Nachkommastelle.

Vorgeschlagene Bestandteile, alle **messbar oder gar nicht**:

| Teil | Messgröße | Messbar heute |
|---|---|---|
| Erreichbarkeit | Uptime im Monat | ⬜ kein Monitoring |
| Aktualität | Alter des ältesten offenen Sicherheitsupdates | ⬜ |
| Geschwindigkeit | Core Web Vitals aus echten Aufrufen | 🟡 Speed Insights vorhanden |
| Barrierefreiheit | maschinelle Verletzungen | ✅ `npm run a11y` |
| Offene Punkte | Tickets älter als 14 Tage | ⬜ kein Ticketsystem |

**Ohne Monitoring und Ticketsystem sind drei von fünf Teilen nicht messbar.**
Der Score ist damit ein Ergebnis von MP-B/F-Infrastruktur, kein eigenes
Projekt. Bis dahin: nicht anzeigen.

---

## 4 · Managed Tiers

Heute existiert **eine bestätigte Stufe**: Betrieb / Retainer, **€149** netto
im Monat (`retainer` in `lib/site-data.ts`, live auf der Seite).

Die Staffel darunter ist Struktur, **keine Preisliste**.

| | **Care** (heute) | **Operate** | **Business** | **Mission Critical** |
|---|---|---|---|---|
| Hosting & Auslieferung | ✅ | ✅ | ✅ | ✅ |
| Sicherheitsupdates | ✅ | ✅ | ✅ | ✅ |
| Inhaltsänderungen | bis 2 / Monat | bis 6 / Monat | nach Plan | nach Plan |
| Google-Profil aktuell | ✅ | ✅ | ✅ | ✅ |
| Betrieb der Betriebssoftware | — | ✅ | ✅ | ✅ |
| Monitoring + Alarmierung | — | ✅ | ✅ | ✅ |
| Zugesagte Reaktionszeit | — | ⬜ Owner | ⬜ Owner | ⬜ Owner |
| Monatsbericht (Pulse) | — | — | ✅ | ✅ |
| Weiterentwicklung nach Plan | — | — | ✅ | ✅ |
| Erweiterte Erreichbarkeit | — | — | — | ⬜ Owner |
| **Preis** | **€149** | `[PREIS OWNER]` | `[PREIS OWNER]` | `[PREIS OWNER]` |

### Die Frage, die vor jeder neuen Stufe steht

**„Wer antwortet, wenn du im Urlaub bist?"**

Eine zugesagte Reaktionszeit ist eine Zusage über Verfügbarkeit von Menschen.
Bei einer Person ist jede Zusage über vier Stunden hinaus eine Zusage, die im
Krankheitsfall bricht. Prinzip 07 sagt: Wir verkaufen nichts, was wir nicht
verantworten können.

**Zwei ehrliche Wege:**
1. **Reaktionszeit nur zu Geschäftszeiten**, ausdrücklich so benannt.
2. **Vertretung organisieren** (Sub, Partner) — dann ist es Grundregel 2
   (keine Fremdhaftung), die geprüft werden muss.

Bis eine der beiden steht, wird **Operate** nicht verkauft.

---

## 5 · meAI als Intelligence-Layer

meAI liegt auf Ebene 05. Der Reiz ist groß, hier Feature-Listen zu schreiben.
Die Regel dagegen: **ein Use Case kommt nur ins Dokument, wenn der Datenpfad
existiert oder benennbar ist.**

| Use Case | Datenpfad | Realistisch |
|---|---|---|
| Anfragen einordnen und vorbereiten | Lead-Mails → Postfach → strukturiert | 🟢 Daten existieren (`/api/lead`) |
| Angebot aus Gesprächsnotiz vorbereiten | Discovery-Notizen → Angebotsschema | 🟡 Notizen heute unstrukturiert |
| Betriebszahlen zusammenfassen (Pulse) | Monitoring + Tickets | 🔴 beides fehlt |
| Dokumente einordnen und wiederfinden | Kundendokumente | 🔴 kein Ablageort |
| Auslastung vorhersagen | historische Aufträge | 🔴 keine Datenbasis |

**Drei von fünf sind heute Fantasie**, und genau die klingen am besten. Der
erste ist der einzige, für den die Daten schon fließen — und er ist zufällig
auch der, der dem Owner am meisten Zeit spart.

**Datenschutz-Vorbehalt:** Sobald Kundeninhalte durch ein Modell laufen,
braucht das eine Rechtsgrundlage, einen Auftragsverarbeitungsvertrag mit dem
Anbieter und einen Eintrag in der Datenschutzerklärung. Kein Use Case wird
gebaut, bevor das steht.

---

## 6 · Hiring-Reihenfolge

**Ops → Dev → Design → Sales → Support**

| # | Rolle | Der Engpass, den sie löst | Wann |
|---|---|---|---|
| 1 | **Ops / Projektsteuerung** | Der Owner baut UND koordiniert UND verkauft. Das Erste, was fällt, ist die Koordination — und sie ist das, was Kunden spüren. | wenn 3+ Projekte gleichzeitig laufen |
| 2 | **Dev** | Umsetzungskapazität. Erst nach Ops: Ein zweiter Entwickler ohne Koordination verdoppelt die Koordinationslast. | wenn Aufträge an Kapazität scheitern |
| 3 | **Design** | Heute macht der Owner Design. Es ist die Stärke der Marke — deshalb wird sie zuletzt abgegeben, nicht zuerst. | wenn Design zum Nadelöhr wird |
| 4 | **Sales** | Erst wenn Angebot, Preise und Ablauf so stehen, dass jemand anderes sie verkaufen kann. Vorher verkauft ein Vertriebler Versprechen, die niemand kennt. | nach MP-D vollständig |
| 5 | **Support** | Erst mit Managed-Volumen. Vorher ist Support = der Owner, und das ist richtig so. | ab ~15 Managed-Kunden |

**Die häufigste Reihenfolge in der Praxis ist Sales zuerst** — weil es nach
Wachstum klingt. Sie erzeugt einen Auftragsbestand, den niemand abarbeiten
kann, und Kunden, die nichts von dem bekommen, was ihnen versprochen wurde.

Grundregel 4 gilt weiter: keine Kaltakquise. Ein Sales-Mensch, der das nicht
akzeptiert, passt nicht.

---

## 7 · Revenue-Mix — Rahmen ohne Zahlen

**Der Owner setzt die Ziele.** Hier steht die Struktur, in die sie eingetragen
werden — und die Eigenschaft jeder Säule, die die Entscheidung trägt.

| Säule | Was | Eigenschaft | Anteil-Ziel |
|---|---|---|---|
| **Audit / Analyse** | Betriebsanalyse, A11y-Prüfung | Einstieg, klein, planbar · qualifiziert für alles Weitere | `[OWNER]` |
| **Projekt** | Website, System, Umbau | größter Einzelbetrag · endet · muss immer neu gewonnen werden | `[OWNER]` |
| **Managed** | Betrieb, Care/Operate/… | klein je Kunde · **wiederkehrend** · trägt die Kapazitätsplanung | `[OWNER]` |
| **Produkt / SaaS** | meAI, fibero, CASSAMEA, meahv | höchste Skalierung · höchster Vorlauf · eigenes Risiko | `[OWNER]` |
| **Expansion** | Ausbau bei Bestandskunden | billigster Umsatz überhaupt · setzt Zufriedenheit voraus | `[OWNER]` |

**Die eine Aussage, die dieses Dokument dazu machen darf:** Heute besteht der
Umsatz überwiegend aus **Projekt**. Projekt ist die Säule mit dem größten
Einzelbetrag und der schlechtesten Vorhersagbarkeit — sie endet immer. Jede
Verschiebung Richtung **Managed** und **Expansion** kauft Planbarkeit.

Was hier bewusst **nicht** steht: eine Zielsumme, ein Monatsumsatz, eine
Kundenzahl. Der Owner hat keine genannt, und eine erfundene Zahl in einem
Strategiedokument wandert erfahrungsgemäß irgendwann in eine Präsentation.

---

## 8 · creaDIG 1.0 — die 12-Monats-Definition

Aus KIZILELMA §12: *Die Vitrine ist der Firma voraus.* creaDIG 1.0 ist
erreicht, wenn das nicht mehr stimmt.

**Nicht** „mehr Umsatz" und **nicht** „schöner". Zehn prüfbare Sätze:

| # | Satz | Prüfbar an | Heute |
|---|---|---|---|
| 1 | Jeder Lead hat eine Nummer und einen Zustand — keiner liegt in der Inbox | Lead-Referenz + Pipeline-Speicher | 🟡 Referenz ✅, Speicher ⬜ |
| 2 | Ein Interessent kann sich ohne Gespräch selbst einordnen | Betriebscheck | ✅ live |
| 3 | Es gibt mindestens **drei** freigegebene Kundenbelege | `caseStudies[].approved` | 🔴 0 von 3 |
| 4 | Mindestens **ein** eigenes Produkt ist als echte Oberfläche zu sehen | `PRODUCT_SCREENS` | 🔴 leer |
| 5 | Es gibt eine Handwerks-Referenz | — | 🔴 fehlt |
| 6 | Angebot, Preis und Ablauf stehen so, dass ein Dritter sie erklären kann | `docs/sales/*` | 🟡 Struktur ✅, Preise teils `[OWNER]` |
| 7 | Der Betrieb läuft überwacht, nicht auf Zuruf | Monitoring | 🔴 fehlt |
| 8 | Wiederkehrender Umsatz trägt die Grundlast | Managed-Anteil | ⬜ Owner |
| 9 | Zwei Sprachen, eine Qualität — ohne Rückstand auf einer Seite | `SameShape` + Paritäts-Gate | ✅ |
| 10 | Der Owner ist ersetzbar für **einen** Ablauf | erste Rolle besetzt | 🔴 |

**Ehrlicher Stand: 2 von 10 grün, 3 gelb.** Das ist kein schlechtes Ergebnis
für einen Monat Arbeit an der Maschine — aber es ist der Abstand, den „1.0"
bedeutet.

**Die zwei Sätze mit dem größten Hebel sind 3 und 4**, und beide hängen an
Owner-Material, nicht an Code. Sätze 1, 7 und 10 sind Infrastruktur und
Menschen — die kommen danach.

---

## Was zuerst — die Reihenfolge

| Rang | Was | Warum | Blockiert durch |
|---|---|---|---|
| 1 | **Freigabesätze für die drei Kunden** | schaltet Satz 3 frei, kostet ein Telefonat | Owner |
| 2 | **fibero-Screens aus einer Demo-Instanz** | schaltet Satz 4 frei, kein Code nötig | Owner |
| 3 | **Live-Mail-Selftest + Datenschutzsatz UTM** | schließt zwei offene Gates aus MP-B/E | Owner |
| 4 | **Monitoring** (einfachste Stufe: Uptime + Alarm) | Voraussetzung für Health Score, Pulse, Statusseite, Operate | — |
| 5 | **Pipeline-Speicher** | Satz 1; heute ist die Pipeline ein Postfach | — |
| 6 | Managed **Operate** definieren | erst nach der Vertretungsfrage | Owner-Entscheidung |
| 7 | Trust Center | wenn Reaktionszeiten stehen | 6 |
| 8 | Portal `my.creadig` | **nur** nach Build Gate | Bedarf + Owner-OK |

**Die ersten drei kosten keinen Code.** Sie sind der Grund, warum dieses
Dokument mit ihnen anfängt und nicht mit dem Portal.

---

## Build-Kandidaten

Der Owner nennt **eine oder zwei** Positionen aus diesem Dokument. Nur die
werden spezifiziert und gebaut. Alles andere bleibt Spec.

| Kandidat | Status |
|---|---|
| — | **noch keiner benannt** |

Bis dahin: **kein Portal-UI, kein Ticketsystem, kein Health-Score-Widget.**
