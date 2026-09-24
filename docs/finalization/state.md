# creaDIG · Finalisierung · Hauptbuch

> **Ein** Hauptbuch für den Abschluss von Marketing/Sales (MSA) und Design (DVA).
> Stand **24.09.2026**. Die Admin-Programmakte bleibt `docs/admin-os/state.md` —
> sie wird hier **nicht** wiederholt und **nicht** wieder geöffnet.
>
> Regel dieser Datei: Jede Zeile nennt Befund, Beleg, ob sie ohne den Owner
> lösbar war, den Stand — und, wo es einen gibt, den Blocker.

## 0 · Ausgangslage, nachgeprüft (nicht aus Berichten übernommen)

| Punkt | Wert | Wie geprüft |
|---|---|---|
| Produktion | `c395e91` · `dpl_DJT1rZhB1BWaJ97UKtWaMnJuPFav` READY · `creadig.de` + `www` | Vercel-API am 24.09.2026 |
| Migrationen | **015–019 angewendet** (alle fünf Tabellen vorhanden) | `cutover-preflight` gegen Produktion, nur lesend |
| Bestand Produktion | 9 Anfragen · 33 Organisationen · 16 Kontakte · 2 Chancen · 22 Chronikzeilen | dieselbe Messung |
| Admin | `LIVE 99 % VERIFIED` (Owner-Abnahme offen) | `docs/admin-os/state.md` |
| G18 | sechs Dateien unkommittiert, **eine** zusammenhängende Arbeit | Diff gelesen, Build + `rechnung-drill` grün damit |
| Öffentliche Seite | 8 Routen live 200 | `curl` gegen `creadig.de` |

---

## 1 · Was diese Runde gebaut hat

| # | Befund | Beleg | Owner-unabhängig? | Stand |
|---|---|---|---|---|
| **B-1** | Der Admin führte Erlaubnisse, die öffentliche Seite las sie nicht. Ein Widerruf wirkte nie. | `freigabe-bruecke-drill` T1–T8 | ja | **fertig** (`8ae4682`) |
| **B-1/H31** | Im eigenen Probelauf gefunden: Das Kundenbild erschien **ohne Logo-Erlaubnis** — `benoetigtFuerFall()` verlangt `logo` nie, die Prüfung lief ins Leere. | derselbe Drill, T2 | ja | **behoben** |
| **B-3** | Es gab keine Antwort auf „was ging hinaus, und hat jemand geantwortet?" | `veroeffentlichung-drill` V1–V8 | ja | **fertig** (`1e138e9`), Produktion braucht Migration 020 |
| **MS18** | Entscheidungsrolle und Zeitpunkt standen nur als Prosa im Playbook. | Code, DE/TR-Gate | ja | **fertig** — zwei Fragen an der Stufe, **kein** neues Feld |
| **MS22** | „Echte Fotos" stand unter „Ihre Entscheidungen", **„Impressum vollständig — Steuerstatus und Rufnummer freigeben" nicht**: Es liegt in der Gruppe `recht` und fiel in die Sammelzahl. | gemessen über `collectAttention()` | ja | **fertig** — Gewicht nach Wirkung, `check-ownerlast` hält die Liste wach |
| **Sicherheit** | `.env.production.cutover` lag **unignoriert** im Baum (`.env*.local` trifft ihn nicht). | `git check-ignore` | ja | **fertig** — `.env.production.*` und `.env.*.cutover` ergänzt |
| **MS04** | G18 war eine Sperre ohne Entscheidungsgrundlage. | — | ja (die Vorlage) | **fertig**: `docs/finalization/g18-entscheidung.md` |

## 2 · Was geprüft und **nicht** gebaut wurde

| Punkt | Ergebnis | Warum kein Bau |
|---|---|---|
| **MS21 · Analytics** | **BEFUND: Vercel Web Analytics ist für dieses Projekt nicht aktiviert** — die API antwortet „Web Analytics not found". Der Code liefert `@vercel/analytics` + Speed Insights aus, aber erst nach Einwilligung (`components/consent/gated-analytics.tsx`). Das Haus misst also **nichts**, und niemand hätte es bemerkt. | Aktivieren ist ein Schalter im Vercel-Dashboard und kann Plankosten berühren → Owner. Keine zweite Analyseplattform (MSA-15). |
| **MS03 · LinkedIn/Meta-API** | NO-BUILD | Bei der heutigen Taktung kostet ein Adapter mehr Pflege, als er spart (MSA-06). |
| Marketing-OS, Kampagnen, Newsletter, Lead-Scoring, Attribution | NO-BUILD | MSA-17: kein Geschäftsereignis, keine neue Software. |
| Neue Sales-Automationen | NO-BUILD | `next_action_at`, `next_touch_at`, „Heute" tragen die Nachfassregel bereits (MSA-07). |
| Admin-Redesign | NO-BUILD | Admin ist LIVE; nur gezielte Befunde (MSA-16). |

## 3 · Offen — und woran es liegt

| # | Punkt | Blocker | Was es freischaltet |
|---|---|---|---|
| **B-2** | Profillinks (LinkedIn persönlich + Unternehmensseite) als `LINK_ONLY`, inkl. `sameAs` | **G18** (`lib/site-data.ts` trägt `socialProfiles`) **+ Owner** (welche URLs gelten) | öffentliche Identität, Vertrauensfläche |
| **020** | Register in Produktion nutzbar | Owner-Freigabe für Migration 020 | B-3 live |
| **Analytics** | Messung überhaupt | Owner-Schalter in Vercel | jede Aussage über Reichweite |
| **Corporate Truth** | Vertragspartner, Steuerstatus, deutsche Rufnummer, Kapazitätszusage | Owner (teils Steuerberater) | Impressum, Rechnung, Preiswahrheit, Kapazitätsaussage |
| **Erster Kundenbeleg** | NV SWISS / maqam / Bir Damla Hayır | Kunde (Owner muss fragen) | B-1 zeigt dann echte Fälle |

## 4 · Zustände, sauber getrennt

* **Technische Finalisierung:** `IN_PROGRESS` — B-1, B-3, MS18, MS22 fertig; B-2 wartet auf G18 + Owner; Design-Delta (DVA) läuft.
* **Geschäftliche Aktivierung:** `NOT_YET_USED` — kein synthetischer Datensatz zählt dafür. Das entscheidet der Owner mit echten Gesprächen, nicht dieses Repository.
