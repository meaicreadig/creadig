# creaDIG · Marketing Acceptance

> **Authority:** Working Note (Prüfprotokoll) · MP-E.5 · Stand 29.08.2026
> **Prüfling:** `feat/system-haus-site`, Build nach `41609ed`
> **Werkzeug:** Playwright + echtes Chrome gegen den Produktions-Build,
> Desktop 1440×900 und Mobil 390×844, DE und TR, hell und dunkel.
> **Ergebnis:** **10 von 10 PASS** — nach einem Fix.

---

## Ergebnis

| # | Prüfpunkt | Ergebnis | Beleg |
|---|---|---|---|
| 1–3 | **Desktop DE** `/branchen/handwerk` → CTA → `/betriebscheck` | ✅ PASS | 2× Check-Ziel, 2× Termin-Ziel, 1× Leistungsseite · gelandet · 15 Fragen da |
| 1–3 | **Mobil DE** | ✅ PASS | identisch |
| 1–3 | **Desktop TR** → `/tr/betriebscheck` | ✅ PASS | alle Ziele mit `/tr`-Präfix, kein einziger deutscher Pfad |
| 1–3 | **Mobil TR** | ✅ PASS | identisch |
| 4 | `cta_click` mit `location` bei Einwilligung | ✅ PASS | `{"name":"cta_click","data":{"cta":"betriebscheck","location":"handwerk-hero","page":"/branchen/handwerk"}}` · `handwerk-bridge` ebenfalls belegt |
| 4b | **ohne** Einwilligung kein Ereignis | ✅ PASS | Warteschlange leer (`[]`) nach demselben Klick |
| 5 | Sitemap + canonical + hreflang | ✅ PASS | beide URLs in der Sitemap · canonical je Sprache korrekt · `de` / `tr` / `x-default` gesetzt |
| 6 | a11y hell/dunkel, Desktop/Mobil, DE+TR | ✅ PASS | 0 Verletzungen in allen drei Läufen |
| 7 | keine Fake-Zahlen, keine Referenzbehauptung | ✅ PASS | Prozentangabe: nein · Zeitversprechen: nein · Referenzwort: nein · **alle Zahlen im Fließtext: 01–06** (die Schrittnummern) |
| 8 | LP ↔ Leistungsseite verlinkt | ✅ PASS **nach Fix** | siehe Befund |

**Gates:** `tsc` ✅ · `eslint` ✅ · `build` ✅ (Function/Sterne/Parität) · `a11y` 112/112 ✅

---

## Befund — behoben · Der Weg lief nur in eine Richtung

**Was war:** `/branchen/handwerk` verlinkte `/leistungen/website-handwerk`.
Zurück ging nichts. Gemessen: `LP → Leistungsseite = true`,
`Leistungsseite → LP = false`.

**Warum das zählt:** Zwei Seiten zum Wort „Handwerk" ohne erkennbare
Beziehung sind für eine Suchmaschine zwei Kandidaten für dieselbe Anfrage —
und für einen Menschen eine Sackgasse. Wer über die Suche direkt auf
„Website für Handwerksbetriebe" landet und noch gar nicht weiß, **ob** er eine
Website braucht, hatte keinen Weg zur Diagnose. Genau dafür ist der Einstieg
gebaut.

**Fix:** Eine Tabelle in `lib/branchen.ts`:

```ts
export const BRANCH_ENTRY_FOR_SERVICE: Record<string, { path; lead; cta }>
```

Sie steht **dort** und nicht als Feld an `ServicePage`: Es ist Wissen der
Branche über die Leistung, nicht umgekehrt. Kommt eine zweite Branche, wächst
diese Tabelle; der Leistungs-Datensatz bleibt unangetastet. Ohne Eintrag
rendert nichts — geprüft an `/leistungen/corporate-design`: 0 Branchen-Links.

Die Zeile steht **oben unter dem Lead**, nicht unten bei den Knöpfen: Wer noch
nicht weiß, ob er die Leistung braucht, soll das lesen, bevor er die Leistung
liest.

**Nachgeprüft:**

| Sprache | Rückweg | Text |
|---|---|---|
| DE | 1× → `/branchen/handwerk` | „Der Einstieg für Handwerksbetriebe" |
| TR | 1× → `/tr/branchen/handwerk` | „Zanaat işletmeleri için giriş" |

Beide Wege geklickt, beide gelandet, a11y auf der Zielseite 0.

---

## Conversion-Definition (bestätigt)

| Stufe | Ereignis / Status | Rolle | Messbar heute |
|---|---|---|---|
| **Diagnostic** | `audit_completed { locale, score_bucket }` | Wie viele kommen durch den Check | ✅ ja |
| **Primary** | `lead_submitted` mit `source=betriebscheck` | **Der Marketing-Erfolg** | ✅ ja |
| Business (später) | Qualified → Proposal → Won | Umsatzpfad | ⬜ erst mit Pipeline-Speicher (MP-B Spec, kein Store) |

**Die Regel dazu:** Nur Klicks zählen ist kein Marketing. Nur
`audit_completed` ohne Lead ist kein Umsatzpfad. Beide Zahlen werden
nebeneinander gelesen — die Differenz zwischen ihnen ist die eigentliche
Arbeit am Formular.

**Was NICHT als Erfolg zählt:** Seitenaufrufe der Landing, Verweildauer,
Scrolltiefe. Wer die misst, bekommt jede Woche eine Zahl und nie eine
Entscheidung.

---

## Wie gemessen wurde — und was das nicht beweist

Die Ereignisprüfung liest die Warteschlange von Vercel Analytics
(`window.vaq`) im Browser, nachdem die Navigation unterbunden wurde. Das
beweist: **Das Ereignis entsteht mit den richtigen Eigenschaften, und nur mit
Einwilligung.**

Es beweist **nicht**, dass es im Vercel-Dashboard ankommt — dafür braucht es
die Live-Domain. Steht als Punkt 10 auf der Tracking-Ready-Checkliste in
`docs/ops/utm-playbook.md` und ist Owner-Sache.

---

## Was bewusst nicht geprüft wurde

- **UTM-Client** — existiert nicht, blockiert bis Datenschutzsatz
  (`utm-playbook.md`). Nichts zu prüfen.
- **Zweite Branche** — es gibt keine, und es soll heute keine geben.
- **Ads** — kein Konto, kein Budget, kein Setup.
- **Live-Mail** — dieselbe Umgebungsgrenze wie in
  `docs/ops/conversion-acceptance.md`.
