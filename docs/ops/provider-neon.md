# Provider Gate · Neon Postgres (Vercel Marketplace)

> **Authority:** Working Note · MP-G.3 Provider Gate · Stand **30.08.2026**  
> **Status:** Kandidat geprüft — **noch keine Owner-Freigabe**, kein Adapter, keine Tabelle, kein Env, kein Datenschutz-Live-Text.  
> **Regel:** Keine Privacy-Annahme nur weil etwas „über Vercel“ erscheint.

---

## A · Provider Identity

| Frage | Antwort | Status |
|-------|---------|--------|
| Was ist der Dienst? | **Neon Postgres** (in Neon-Docs auch „Lakebase Postgres“ / serverless Postgres) | VERIFIED |
| Ist das „Vercel Postgres“? | **Nein.** Vercel Postgres ist laut Neon-Docs **deprecated**. Marketplace-Produkt heißt **Neon Postgres** (Native Integration). | VERIFIED |
| Wer betreibt die DB? | **Neon, LLC** (Affiliate von **Databricks, Inc.**) | VERIFIED |
| Vertragsrahmen (direkt Neon) | Databricks Master Cloud Services Agreement + Neon Platform Services Product Specific Schedule | VERIFIED |
| DPA | Neon Data Processing Agreement (`neon.com/pdf/DPA.pdf` / `neon.tech/dpa`) | VERIFIED |

**SOURCE**

- https://vercel.com/marketplace/neon — DATE CHECKED: 30.08.2026  
- https://neon.com/docs/guides/vercel-managed-integration — DATE CHECKED: 30.08.2026  
- https://neon.com/msa · https://neon.com/platform-terms — DATE CHECKED: 30.08.2026  
- https://neon.com/pdf/DPA.pdf — DATE CHECKED: 30.08.2026  

---

## B · Vercel Relationship

| Rolle | Was Vercel tut | Was Vercel **nicht** ist |
|-------|----------------|--------------------------|
| Marketplace / Native Integration | Provisioniert Neon-Projekt, injiziert `DATABASE_URL` u. a., optional Preview-Branches | Nicht der Postgres-Host der Lead-Zeilen |
| Abrechnung | **Commercial Agent** des Vendors — Gebühren über Vercel-Rechnung | Nicht der EULA-Partner für die DB-Nutzung |
| EULA | Nach Kauf gilt Vendor-EULA (Neon/Databricks) | Vercel ist **kein** Vertragspartner der DB-Nutzung |
| Datenfreigabe an Vendor | E-Mail, Vercel-ID, Netzwerk-/Aktivitätsdaten zur Transaktion | Vercel Privacy Policy gilt **nicht** für Vendor-App-Daten |

**SOURCE**

- https://vercel.com/legal/integrations-marketplace-service-terms (Last Updated June 1, 2026) — §§3, 5, 8 — DATE CHECKED: 30.08.2026  
- https://neon.com/docs/guides/vercel-overview — DATE CHECKED: 30.08.2026  

**Konsequenz für creaDIG:** Der bestehende **Vercel-AVV** deckt Hosting/Logs/Analytics. Er deckt **nicht automatisch** die Speicherung von Lead-PII in Neon. Für Lead-Daten braucht es den **Neon/Databricks-DPA** (+ Eintrag in `processors[]`).

**Zwei Integrationspfade (nicht vermischen):**

| Pfad | Billing | Typisch |
|------|---------|---------|
| **Vercel-Managed** (Native) | über Vercel | Neu, eine Rechnung |
| **Neon-Managed** (Connectable Account) | direkt Neon | bestehendes Neon-Konto |

Beide können Preview-Branches erzeugen. Cleanup-Timing unterscheidet sich (Vercel-Managed hängt an Deployment-Retention, oft Monate).

---

## C · Six Processor Answers

### 1 · Wer ist rechtlich Auftragsverarbeiter für gespeicherte Lead-Daten?

| | |
|--|--|
| **Antwort** | **creaDIG** = Verantwortlicher (Controller). **Neon / Databricks** = Auftragsverarbeiter (Processor) für in der DB gespeicherte Customer Data / Personal Data. Vercel bleibt Verarbeiter für Hosting/Auslieferung, **nicht** für den Neon-DB-Inhalt. |
| **SOURCE** | Neon Blog GDPR (Neon as subprocessor/processor on behalf of customer); DPA (Customer = Controller, Neon = Processor); Vercel Marketplace Terms §5/§8 |
| **DATE CHECKED** | 30.08.2026 |
| **STATUS** | **VERIFIED** für Rollenmodell. **UNCLEAR** bis Owner den DPA im Account bestätigt/abgelegt hat (`dpaConfirmed`). |

### 2 · Gibt es einen AVV / DPA, der genau diesen Postgres-Dienst abdeckt?

| | |
|--|--|
| **Antwort** | Ja, öffentlich: Neon DPA (PDF). Eingebettet in Terms/MSA; optional separat unterzeichenbar unter `neon.tech/dpa`. Product Specific Schedule verweist auf Databricks DPA-Mechanik + Neon-Subprocessor-Liste. |
| **SOURCE** | https://neon.com/pdf/DPA.pdf · https://neon.com/blog/gdpr-compliance-and-neon · https://neon.com/msa |
| **DATE CHECKED** | 30.08.2026 |
| **STATUS** | **VERIFIED** (Dokument existiert und benennt Platform Services). **Owner-Schritt offen:** DPA lesen, ggf. signieren, intern ablegen, `processors[].dpaConfirmed`. |

### 3 · Welche Subprozessoren?

| | |
|--|--|
| **Antwort** | Liste unter `https://neon.com/subprocessors` (Stand der öffentlichen Seite 30.08.2026: Redirect/Darstellung als **Databricks Subprocessors**, Last Updated **June 9, 2026**). Enthält u. a. **AWS, Google, Microsoft, Oracle** (Cloud), Support-Tools (Twilio, Atlassian, Salesforce, Slack, …), AI-Dienste (Anthropic, OpenAI) sowie Databricks Affiliates (u. a. Databricks GmbH DE). Neon Security-Seite nennt zusätzlich **Grafana** für Ops-Monitoring. |
| **SOURCE** | https://neon.com/subprocessors · https://neon.com/security · DPA Annex / Sub-Processors-Klausel |
| **DATE CHECKED** | 30.08.2026 |
| **STATUS** | **UNCLEAR / Owner prüfen:** Ob die **volle** Databricks-Liste 1:1 für den Neon-Postgres-Marketplace-Dienst gilt (inkl. AI-Subprozessoren) oder eine engere Neon-Platform-Liste. Vor Freigabe: Liste im Dashboard/Trust Center gegenlesen und nur relevante Einträge in die creaDIG-Verarbeiterliste. |

### 4 · In welcher Region können Daten gespeichert werden?

| | |
|--|--|
| **Antwort** | Region wird **bei Projekterstellung gewählt** und ist **danach nicht änderbar**. AWS u. a.: `aws-eu-central-1` (**Frankfurt, DE**), `aws-eu-west-2` (London, UK), plus US/APAC/SA. Azure-Regionen **deprecated** (keine neuen Projekte). |
| **SOURCE** | https://neon.com/docs/introduction/regions — DATE CHECKED: 30.08.2026 |
| **STATUS** | **VERIFIED** |

**Empfehlung für creaDIG (technisch, keine Rechtsberatung):**  
**`aws-eu-central-1` (Frankfurt)** — EU/EWR, geografisch nahe DE, Region fest wählbar bei Install.

### 5 · Wie funktioniert Löschung (einzelne Sätze / ganze DB)?

| Ebene | Mechanismus | Status |
|-------|-------------|--------|
| **Einzelner Lead** | Verantwortung des Controllers: SQL `DELETE` / App-Funktion (noch nicht gebaut). | VERIFIED als Postgres-Norm; App-Pfad fehlt absichtlich |
| **History / PITR** | Neon behält WAL im **History Window** (Free bis 6h, Launch bis 7 Tage, Scale bis 30 Tage). Gelöschte Zeilen können bis zum Ablauf des Fensters in der History rekonstruierbar sein. | VERIFIED (History-Window-Docs) |
| **Ganze DB / Projekt** | Vercel-Managed: Storage → Delete Database = **permanentes** Löschen des Neon-Projekts. | VERIFIED (Vercel-Managed Docs) |
| **Vertragsende laut DPA** | Delete or return Customer Data bei Termination/Expiration; Backups isoliert und nach Deletion Practices gelöscht; Export **vor** Deaktivierung ist Kundenpflicht. | VERIFIED (DPA) |

**SOURCE:** Neon History Window Docs · Vercel-Managed Integration „Delete the database“ · DPA § Deletion or Return · DATE CHECKED: 30.08.2026  

**STATUS:** Einzel-Löschung **operativ** klar (SQL). **Rechtliche Vollständigkeit** von „Right to erasure“ vs. WAL-History = **UNCLEAR / LEGAL REVIEW** (Fenster verkürzen oder History=0 nur nach Owner/Legal).

### 6 · Vertragsende: Export, Löschung, Fristen?

| | |
|--|--|
| **Export** | Kundenverantwortung vor Deletion (DPA/Agreement). Technisch: `pg_dump` / SQL Export — nicht von Vercel übernommen. |
| **Löschung** | Project delete (Vercel Storage) bzw. Account-Termination + DPA-Delete/Return; Backup-Ausnahme mit Isolation. |
| **Aufbewahrungsfristen beim Provider** | Keine creaDIG-Retention „24 Monate“ im Provider-Vertrag — das ist **Owner-Policy**. Provider behält History nur im konfigurierten Fenster + Backup-Practices. |
| **STATUS** | **VERIFIED** für Provider-Mechanik. **OWNER DECISION** für creaDIG-Retention. |

---

## D · DPA (Kurz)

- Dokument: Neon DPA PDF  
- Rollen: Customer Controller · Neon Processor  
- Transfers: Data Privacy Framework und/oder **EU SCCs 2021/914** (Module Two/Three), UK Addendum, Swiss Anpassungen — laut DPA-Text  
- SCC Data Importer im DPA-Text: **Neon, Inc.** (US) — parallel zu Neon LLC / Databricks-Struktur → **Owner: Vertragspartei im Marketplace-Checkout exakt notieren**  
- STATUS: Dokument **VERIFIED**; Signed/Confirmed im creaDIG-Betrieb **offen**

---

## E · Subprocessors (Arbeitsnotiz)

Öffentliche Databricks-Subprocessor-Tabelle (June 9, 2026) listet Cloud-US-Entities mit „Customer Selected“ Location für Designated Services — bei Frankfurt-Region: **Compute/Storage primär in gewählter Region**, Konzern/Support/AI-Prozesse können **außerhalb EU** liegen.

**Für die Verarbeiterliste später (Vorschlag, nicht live):**

1. Neon, LLC / Databricks (Postgres)  
2. Amazon Web Services, Inc. (Infrastruktur, Region Frankfurt wenn gewählt)  
3. Weitere nur nach Owner-Abgleich der aktuellen Liste  

---

## F · Data Region · EU / Germany Suitability

| Punkt | Befund | Status |
|-------|--------|--------|
| EU-Region verfügbar? | Ja — Frankfurt | VERIFIED |
| Sinnvoll für creaDIG? | Frankfurt (`aws-eu-central-1`) | Empfehlung (technisch) |
| Transfers außerhalb EU/EWR? | Möglich: US-Konzern Neon/Databricks, Support, ggf. AI-Subprozessoren, SCC/DPF | VERIFIED als Mechanismus; Umfang **UNCLEAR** bis Liste bestätigt |
| SCC / Transfer | Im DPA beschrieben | VERIFIED (Text) |
| CLOUD Act / US-Zugriff | Nicht in Neon-Marketing widerlegt; unabhängige Analysen warnen trotz EU-Region | **UNCLEAR / LEGAL REVIEW** — keine Rechtsberatung |

Keine Rechtsberatung. Nur: Frankfurt wählen + DPA + Subprocessor-Transparenz + Privacy-Text.

---

## G · Deletion / Termination (Ops-Sicht)

1. Betroffenenrecht → Owner löscht Zeile in DB (später Admin/SQL).  
2. History-Window bewusst klein halten, wenn Erasure streng sein soll.  
3. Kündigung → vorher Export → Delete Database in Vercel Storage.  
4. Keine Lösch-Automation in diesem Gate.

---

## H · Technical Fit (LeadStore — Spec only)

Bestehender Contract (`lib/lead-store.ts`):

| Methode | SQL-Abbildung (konzeptionell) |
|---------|-------------------------------|
| `save` | `INSERT … ON CONFLICT (id) DO UPDATE` |
| `findBySubmissionKey` | `SELECT … WHERE submission_key = $1` + **UNIQUE INDEX** |
| `getById` | `SELECT … WHERE id = $1` (PK) |
| `list` | `WHERE` Filter + `ORDER BY created_at DESC` + `LIMIT/OFFSET` + `COUNT(*)` |
| `updateSalesStatus` | `UPDATE … SET sales_status, lost_reason, updated_at` |
| `updateNextAction` | `UPDATE … SET next_action, next_action_at, updated_at` |

**Passt:** Ja — relational, filterbar, erweiterbar zu Customer/Project später ohne zweiten Speicher.

**Vercel Runtime:** Serverless/Node — Neon dokumentiert `@neondatabase/serverless` (HTTP one-shot / WebSocket für Sessions).  
**Env (wenn später installiert, jetzt nicht setzen):** `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED`, `PG*` — injiziert von Integration.  
**Preview vs Production:** Preview-Branches möglich; Cleanup bei Vercel-Managed oft verzögert — für PII relevant (Owner-Policy).  
**Migrations:** später klein (eine `leads`-Tabelle); kein ORM-Zwang.  
**Transactions:** für G.3 Six Methods nicht zwingend interaktiv; HTTP one-shot reicht für Einzelstatements.

**Repo heute:** kein Prisma/Drizzle/`pg` in `package.json`.

---

## I · Dependency Recommendation

| Option | Urteil |
|--------|--------|
| **`@neondatabase/serverless`** | **Empfohlen** für Vercel Serverless — offizieller Neon-Pfad, HTTP für save/get/list |
| **`pg` (node-postgres)** | Möglich über WebSocket-Compat oder TCP; unnötig komplexer für Edge/Serverless |
| **Prisma / Drizzle** | Für **nur** sechs Lead-Methoden **nicht nötig**. Später optional, wenn Schema wächst |
| **Rohes SQL + dünner Adapter** | **Beste Passung** zu `LeadStore` — eine Datei, kein Parallel-Modell |

---

## J · Privacy Text Impact (noch nicht live ändern)

### Was heute falsch würde

DE (`dictionary` · Kontaktformular-Absatz):

> „Eine Datenbank führen wir nicht: Ihre Anfrage liegt ausschließlich in unserem E-Mail-Postfach.“

Sobald Production Persistence aktiv ist, ist dieser Satz **sachlich falsch**.

### Weitere Spannungen

| Heute live | Owner-Richtung / Spec |
|------------|------------------------|
| Anfragen „bis zu **6 Monate** nach letztem Kontakt“ | Richtung **24 Monate** nach letztem relevanten Kontakt — **OWNER DECISION / LEGAL REVIEW**, kein Canon |
| `processors[]` nur `vercel` \| `resend` | Neon fehlt |

### Kategorien (wenn Speicher läuft)

Wie `LeadRecord` / Mail heute: Name, Betrieb, E-Mail, Telefon, Nachricht, source, locale, siteUrl, UTM, reference/id, salesStatus, nextAction, Zeitstempel — **keine** neuen Erhebungen.

| Feld | Zweck (Entwurf) |
|------|-----------------|
| Zweck | Anfrage bearbeiten, Status nachverfolgen, Doppel-Absendungen erkennen |
| Rechtsgrundlage | weiterhin Einwilligung Art. 6 Abs. 1 lit. a (wie Formular) — **LEGAL REVIEW** |
| Empfänger | creaDIG; AV Neon/Databricks (+ AWS Region); Mail weiter Resend |
| Speicherdauer | Owner (6 vs 24 Monate klären) |
| Rechte | Auskunft/Löschung = Zeile finden + löschen (+ History-Fenster beachten) |

**Bestehenden Datenschutztext nicht ungefragt live ändern.**

---

## K · Open Owner Decisions

1. **Finale Provider-Freigabe:** Neon ja/nein (dieses Dokument ist Gate, keine Freigabe).  
2. **Integrationspfad:** Vercel-Managed vs Neon-Managed.  
3. **Region:** Frankfurt bestätigen (einmalig, irreversibel am Projekt).  
4. **DPA:** lesen, ggf. signieren, ablegen → `dpaConfirmed`.  
5. **Subprocessor-Liste:** aktuelle Neon/Databricks-Liste abhaken; AI-Subprozessoren akzeptieren oder vermeiden.  
6. **Retention:** 6 Monate (heute live) vs 24 Monate (Richtung) — Legal.  
7. **History Window:** wie kurz für Erasure?  
8. **Privacy-Text DE+TR** freigeben **vor** `LEAD_STORE`.  
9. **Verarbeiterliste** um Neon erweitern.  
10. **CLOUD Act / US-Provider-Toleranz** — Legal, keine Agent-Entscheidung.

---

## L · Final Recommendation

| | |
|--|--|
| **Technisch geeignet?** | **JA** — passt zu LeadStore, Vercel, Preview, EU-Region Frankfurt |
| **Rechtlich freigeben?** | **Noch NEIN** — DPA/Subprocessors/Privacy/Retention Owner+Legal |
| **Gesamturteil Gate** | **JA als bevorzugter Kandidat** · Freigabe **bedingt** · Implementierung **gesperrt** bis Entscheidungen 1–9 |

**Nächster erlaubter Schritt (nach Owner „weiter“):** erst Owner-Freigaben, dann Adapter-Spec — **kein** Code in diesem Gate.

---

## Quellenindex (30.08.2026)

1. https://vercel.com/marketplace/neon  
2. https://neon.com/docs/guides/vercel-managed-integration  
3. https://neon.com/docs/guides/vercel-overview  
4. https://vercel.com/legal/integrations-marketplace-service-terms  
5. https://neon.com/pdf/DPA.pdf  
6. https://neon.com/blog/gdpr-compliance-and-neon  
7. https://neon.com/msa · https://neon.com/platform-terms  
8. https://neon.com/subprocessors  
9. https://neon.com/docs/introduction/regions  
10. https://neon.com/docs/introduction/history-window  
11. https://neon.com/docs/serverless/serverless-driver  
12. https://neon.com/security  
