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

## 3b · Design-Delta (DVA) — was gemessen wurde, bevor gebaut wurde

| Anspruch | Befund | Stand |
|---|---|---|
| „Home ist zu textlastig" | **NICHT REPRODUZIERT** in dieser Form: 864 Wörter auf elf Abschnitten, 78 im Schnitt (`scripts/dichte.mjs`, 1440 px). | keine Umgestaltung um einen Phantom-Befund |
| Semantisches Linien-System (DV01–DV03) | **ALREADY_DONE**: `components/creative/system.tsx` (Knoten · Strecke · Schiene) in sieben Abschnitten, mit Vorher/Nachher, eigener Mobil-Geometrie und `prefers-reduced-motion` | nicht neu gebaut |
| Fünf Ebenen / Prozess visuell (DV06/DV07) | **ALREADY_DONE**: `capability-tiles`, `process`, `lagen` tragen dieselbe Schiene | nicht neu gebaut |
| Textreduktion, wo ein Bild trägt (DV05) | **NEW_DELTA**: „Woran es liegt" trug 130 Wörter **und** direkt darunter dieselbe Aussage als Zeichnung | **fertig** (`4b63d6b`): 130 → 67 Wörter, DE/TR/EN/AR |
| Generierte Medien (DV10–DV13) | **NICHT VERWENDET** | Die Seite trägt ihre Aussage ohne Video; ein Clip hätte hier nichts erklärt, was die Zeichnung nicht zeigt. |
| Performance nach der Kürzung | LCP 44–92 ms, CLS 0.000, 14/14 unter den Schwellen | keine Regression |

## 3c · Adversarialer Durchgang (24.09.2026)

| Frage | Antwort | Beleg |
|---|---|---|
| Kann unfreigegebener Beleg öffentlich werden? | nein — ohne Erlaubnis kein Fall, feldweise geprüft | `freigabe-bruecke-drill` T1–T3 |
| Wirkt ein Widerruf? | ja, sofort über die Marke; spätestens nach 5 Minuten | T4/T5 + `revalidateTag` in den Beleg-Aktionen |
| Was bei Datenbankausfall? | **leer**, nicht „alles" | T7 |
| Verlässt Internes das Haus? | nein — kein Name, keine Fundstelle, keine Kennung im öffentlichen Objekt | T6 |
| Wird ein Profillink als Integration dargestellt? | nein — LinkedIn steht auf `NOT_CONFIGURED` | `lib/verbindungen.ts` |
| Entsteht eine zweite Beziehungsgeschichte? | nein — Reaktion mit Bezug schreibt in die Akte des Menschen, ohne Bezug bleibt sie im Register | `veroeffentlichung-drill` V3–V5 |
| G18 / fremde Arbeit berührt? | nein — alle sechs Hashes unverändert | `shasum` vor und nach dieser Runde |

## 3d · Abschlusslauf 24.09.2026 (Owner-Entscheidungen ausgeführt)

| Punkt | Entscheidung | Ergebnis |
|---|---|---|
| **G18** | KEEP / RECONCILE | Sechs Dateien als **eine** Arbeit committet (`5c78336`). Steuerstatus ist jetzt überall dieselbe Bedingung: freigegeben **und** eindeutig. Widerspruch wird benannt, nicht aufgelöst. Beleg: rechnung-drill 49/49, check-rechnung, check-commercial-truth, check-ownerlast, db-drills 16/16, build. **G18-Sperre gefallen.** |
| **Migration 020** | APPLY | Frische Sicherung + Rückspielprobe **12/12** (Zeilenzahlen identisch) → 020 angewendet → Nachprüfung grün (Bestand 9/33/16 unverändert; Chancen 2→3 und Chronik 22→23 stammen aus der Live-Abnahme des Owners, nicht aus der Migration). Tabelle `publications` mit 3 CHECKs + Datumsindex. |
| **Register live** | — | Angemeldet auf Produktion: eintragen, Reaktion, Neuladen, DE/TR, mobil 390 — alles grün; **keine Chronikzeile ohne Bezug** (kein zweites CRM). Die Probezeile wurde danach wieder entfernt. |
| **Analytics** | ENABLE wenn kostenfrei | **Nicht ausführbar von hier**: `vercel project web-analytics` ist in dieser Umgebung gesperrt, und die Projekt-API kennt kein Feld dafür. Das Aktivieren selbst kostet nichts (Web Analytics ist im Plan enthalten, nur mit Datenpunkt-Grenze). Eine Zeile für den Owner. |

### Befund aus dem Abschlusslauf: die Probe stand in den echten Zahlen

Die Live-Abnahme des Cutover legt **eine** markierte Anfrage über den echten
öffentlichen Weg an. Die Anfrage wurde danach archiviert — die daraus
entstandene **Chance** nicht. Gemessen am 24.09.2026 zeigte die Übersicht
deshalb „1 offene Chance · 1 neue Anfrage", und beides war Probe.

Eine Probe in der Zahl ist schlimmer als keine Probe: Sie macht aus einer
leeren Pipeline eine gefüllte. Gelöscht wurde nichts — der Marker
`zz cutover-probe` steht jetzt in `TEST_PREFIXES`, also greift dieselbe
Ausschlussmechanik wie für alle Abnahmedatensätze: sichtbar mit Grund auf der
Detailseite, gefiltert in jeder Zählung. Nach dem Nachziehen:
**0 offene Chancen, 0 neue Anfragen** — die Zahlen des Eigentümers sind wieder
seine eigenen.

## 4 · Zustände, sauber getrennt

* **Technische Finalisierung:** `OWNER-INDEPENDENT TECHNICAL FINALIZATION COMPLETE`. G18 aufgelöst, 020 angewendet und live geprüft, Register live, Testdaten aus den Zahlen. **STOP-BUILD.**
* **Offen — und zwar nur noch als Owner-/Kundentatsache:** Steuerstatus (Steuerberater), deutsche Rufnummer, LinkedIn-Adressen für B‑2, Analytics-Schalter, erste Kundenfreigabe, Reaktionszusage „zwei Werktage".
* **Geschäftliche Aktivierung:** `NOT_YET_USED` — kein synthetischer Datensatz zählt dafür.
* **Geschäftliche Aktivierung:** `NOT_YET_USED` — kein synthetischer Datensatz zählt dafür. Das entscheidet der Owner mit echten Gesprächen, nicht dieses Repository.
