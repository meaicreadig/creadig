# creaDIG · Angebote (Spec)

> **Authority:** Spec · MP-D · Stand 29.08.2026
> **Preisregel:** Eine Zahl steht hier nur, wenn sie **auf der Seite steht** —
> also vom Owner freigegeben ist. Alles andere: `[PREIS OWNER]`.
> **Unknown ≠ invented default.** Kein Platzhalterpreis, keine „ab ca."-Zahl.

---

## 1 · Bestätigt (steht live auf der Seite)

| Angebot | Preis | Quelle im Code |
|---|---|---|
| Website-Paket (Einstieg, Festpreis) | **€2.400** netto, regulär €3.900 | `packages[key="website"]` |
| Barrierefreiheits-Audit | **€1.500** netto | `packages[key="audit"]` |
| Betrieb / Retainer | **€149** netto / Monat | `retainer.price`, Gate `retainerPublished` |

Diese drei sind die einzigen Zahlen, die creaDIG heute öffentlich nennt. Wer
eine vierte braucht, holt sie beim Owner — nicht aus diesem Dokument.

---

## 2 · Angebotsstruktur (die vier Wege hinein)

### 2.1 Betriebsanalyse

**Was:** Wir sehen uns den Betrieb an und sagen, wo er Zeit verliert und was
ein System daran ändern würde. Ergebnis ist ein Dokument, kein Vertrag.

**Für wen:** Betriebe mit 5–50 Mitarbeitern, bei denen mehrere Werkzeuge
nebeneinander laufen und niemand den Gesamtstand sieht.

**Einstieg:** `/betriebscheck` — die Selbsteinschätzung ist der kostenlose
Vorlauf, die Analyse die bezahlte Fassung davon.

**Preis:** `[PREIS OWNER]` · **Dauer:** `[DAUER OWNER]`

**Abgrenzung:** Keine Analyse ohne Gespräch davor. Ein Bericht über einen
Betrieb, den man nicht gesehen hat, ist genau das, was Prinzip 03 verbietet.

### 2.2 Website Handwerk — Festpreis

**Was:** Auftritt zum festen Preis für den vereinbarten Umfang. Der Umfang
wird vor der Zahl bestimmt, nicht danach.

**Preis:** **€2.400** netto (regulär €3.900) — bestätigt, steht live.

**Was drin ist:** siehe `packages[key="website"].includes` in
`lib/dictionary.ts` — das ist die verbindliche Liste, nicht dieses Dokument.

**Abgrenzung:** Kein Stundenzettel, keine Nachforderung. Was nicht im Umfang
steht, ist ein neues Angebot — und wird als solches ausgewiesen.

### 2.3 Barrierefreiheit (BFSG)

**Was:** Prüfung nach WCAG 2.1 AA, Bericht, Behebung.

| Baustein | Preis |
|---|---|
| Prüfung / Audit | **€1.500** netto — bestätigt |
| Behebung | `[PREIS OWNER]` |
| Laufende Betreuung | `[PREIS OWNER]` |

**Verkaufsregel — härter als sonst:** Kein Angstverkauf. Keine Frist-Panik,
keine Abmahn-Drohung, kein „bevor es zu spät ist". Das ist Grundregel 3 des
Owners, und sie gilt hier besonders, weil sie hier besonders gut funktionieren
würde.

**Ehrlichkeitsklausel:** Ein grüner automatisierter Lauf heißt **nicht**
„barrierefrei". Wer das verspricht, verkauft dasselbe wie ein Overlay. Steht
so auch auf `/barrierefreiheit` — das Angebot darf dem nicht widersprechen.

### 2.4 Managed Betrieb — Stufen

Heute existiert **eine** bestätigte Stufe. Die Staffel darunter ist Struktur,
keine Preisliste.

| Stufe | Inhalt (Entwurf) | Preis |
|---|---|---|
| **Care** | Hosting, Sicherheitsupdates, bis zu 2 Inhaltsänderungen/Monat, Google-Profil aktuell — **bestätigt** | **€149** / Monat |
| **Operate** | Care + Betrieb der Betriebssoftware, Monitoring, definierte Reaktionszeit | `[PREIS OWNER]` |
| **Business** | Operate + Weiterentwicklung nach Plan, Auswertung, fester Ansprechpartner | `[PREIS OWNER]` |
| **Mission Critical** | Business + erweiterte Erreichbarkeit, Bereitschaft | `[PREIS OWNER]` |

**Bevor eine dieser Stufen verkauft wird**, muss beantwortet sein, was sie
operativ bedeutet — Reaktionszeit, Erreichbarkeit, Vertretung. Eine
Managed-Stufe ohne beantwortete Vertretungsfrage verstößt gegen Prinzip 07:
Wir verkaufen nichts, was wir nicht verantworten können. Der Owner ist heute
allein; das ist keine Schwäche, aber es ist eine Grenze, und sie gehört ins
Angebot statt ins Kleingedruckte.

---

## 3 · Was NICHT angeboten wird

- Stundensätze als Standardmodell (Festpreis für definierten Umfang)
- Kaltakquise-Angebote (Grundregel 4)
- Angebote für Systeme, die wir nicht betreiben können
- Rabatte gegen Referenz-Freigabe — eine Referenz wird gegeben, nicht gekauft

---

## 4 · Offen (Owner)

| Feld | Wo es hingehört |
|---|---|
| Preis Betriebsanalyse | `lib/site-data.ts` → `packages` |
| Preis Behebung Barrierefreiheit | `packages` |
| Managed-Stufen Operate / Business / Mission Critical | `lib/site-data.ts` |
| Reaktionszeiten je Stufe | erst intern (`docs/ops/sop-lead-handling.md`), dann öffentlich |
