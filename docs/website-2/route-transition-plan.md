# Routen-Übergangsplan · Gate 01

Was mit den Routen passiert ist, was mit ihnen passieren soll, und wodurch
jeder Übergang ausgelöst wird. Kein Punkt hier ist eine Absicht — jeder nennt
die Bedingung, unter der er eintritt, und wer sie herstellen kann.

Stand 10.09.2026.

---

## 1 · Was in Gate 01 tatsächlich passiert ist

**Keine Route wurde angelegt, umbenannt, entfernt oder umgeleitet.** Die
Sitemap zählt unverändert 108 öffentliche Einträge (27 Routen × 4 Sprachen).

Geändert wurde ausschließlich, was eine Route **zeigt** und wo sie
**beworben** wird:

| Route | Was sich geändert hat | Befund |
|---|---|---|
| `/` | Problem vor Modell; eine Produktsektion statt zwei; Preis-Anker aufgelöst | WEB-0003, WEB-0005, WEB-0011, WEB-0024 |
| `/leistungen` | Einleitung führt mit dem Problem; jede Ebene trägt einen Einstieg | WEB-0003, WEB-0004 |
| `/arbeiten` | Zeigt keine eigenen Produkte mehr; aus dem Hauptmenü | WEB-0005 |
| `/insights` | Aus dem Hauptmenü bis zur Schwelle; Teaser verlinkt den Beitrag | WEB-0018 |
| `/produkte` | Unverändert — wird zum einzigen Ort der eigenen Produkte | WEB-0005 |
| `/betrieb` | Unverändert — wird zum Einstieg der Ebene Operations | WEB-0004 |

---

## 2 · Übergänge, die auf eine Bedingung warten

| # | Übergang | Auslöser | Wer | Was dann zu tun ist |
|---|---|---|---|---|
| T-1 | `/arbeiten` zeigt wieder Inhalte | Erste schriftliche Kundenfreigabe (`genannteClientWorks` ≥ 1) | Owner (**OD-2**) | `<Portfolio />` rendert automatisch wieder; Lead wechselt auf `arbeitenPage.lead` |
| T-2 | `/arbeiten` zurück ins Hauptmenü | Owner-Entscheidung **nach** T-1 | Owner (**OD-2**) | `navAusnahmen["/arbeiten"].zurueck` auf die Bedingung setzen |
| T-3 | `/insights` zurück ins Hauptmenü | 3. veröffentlichter Beitrag | Redaktion | Passiert **von selbst** — die Schwelle rechnet, das Gate prüft beide Richtungen |
| T-4 | Intelligence bekommt einen Betrag | Owner bestätigt Preis und Umfang (**OD-6**) | Owner | `art` auf `festpreis`/`monatlich`, Betrag nach `site-data` |
| T-5 | Identity und Automation bekommen einen Beleg | Freigegebene Arbeit oder eigenes zeigbares Objekt | Gate 02 (WEB-0001) | `belegHref` + `belegArt` setzen |
| T-6 | `/leistungen` wird kürzer | Gate 03 | G03 | +562 px mobil aus Gate 01 sind Teil des Auftrags (WEB-0013) |

**T-2 ist bewusst nicht automatisch.** `navAusnahmen["/arbeiten"].zurueck`
gibt `false` zurück und nicht `genannteClientWorks.length > 0`. Ob eine Rubrik
ins Hauptmenü zurückkehrt, ist eine Entscheidung — keine Ableitung aus einem
Datenstand. Eine Rubrik, die sich selbst ins Menü schaltet, sobald irgendwo
ein Datensatz kippt, ist die Sorte Automatik, die später niemand erklärt
bekommt.

**T-3 ist bewusst automatisch.** Dort ist die Bedingung eindeutig zählbar und
die Rubrik ist unstrittig — sie hat heute nur zu wenig Inhalt.

---

## 3 · Was ausdrücklich nicht geplant ist

| Nicht geplant | Warum |
|---|---|
| Weiterleitung `/arbeiten` → `/produkte` | Tötet die Route für Kundenwerk und trifft `/arbeiten/[slug]` mit |
| `/arbeiten` aus der Sitemap nehmen | Indexierung gehört zu G07, nicht zu G01 |
| Zusammenlegung `/betrieb` in `/leistungen` | `/betrieb` ist jetzt ein Einstiegsziel; eine Ankerstelle wäre ein Rückschritt |
| Neue Route je Ebene | Zwei Ebenen ohne Leistungsseite bekommen einen Einstieg, keine leere Seite |

---

## 4 · Was ein späteres Gate prüfen muss, bevor es hier etwas ändert

1. `scripts/check-einstiege.mjs` muss weiterhin grün sein.
2. Jede aus dem Hauptmenü genommene Rubrik muss in der Fußzeile bleiben.
3. Kein Betrag darf außerhalb von `lib/site-data.ts` entstehen.
4. Wer `navAusnahmen` ändert, ändert `information-architecture.md` mit.
