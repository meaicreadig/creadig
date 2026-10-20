# creaDIG — 3D-Zentrale: echt statt dekorativ (ein ununterbrochener Durchlauf)

## Regel für diesen Durchlauf
Arbeite **ununterbrochen bis zum Ende**. Melde dich nicht mit „teilweise fertig" — entweder
ein Punkt ist **fertig und verifiziert** (soweit in dieser Umgebung überhaupt prüfbar, siehe
Phase 6), oder du arbeitest weiter. Wenn du für einen der FAEDEN-Einträge in Phase 2 keine
echte, im Code auffindbare Schreibstelle bestätigen kannst: **erfinde keine** — melde das
ehrlich im Abschlussbericht statt eine Verbindung vorzutäuschen, die es nicht gibt. Das ist
der einzige akzeptable Fall von „nicht umgesetzt".

## Parallel-Hinweis — wichtig
Du läufst in einem **zweiten, separaten Worktree** (`3d-zentrale-realismus`), während in
einem anderen Terminal zeitgleich ein zweiter, unabhängiger Durchlauf
(`netzwerk-verbindungen-100`) auf derselben Codebasis arbeitet — an Vertrieb, Finanz, Mail,
LinkedIn, Automatisierung. **Bleib strikt in deinem Bereich**: `lib/zentrale/*`,
`components/admin/zentrale/*`, plus die in Phase 2 einzeln benannten, winzigen additiven
Tap-Punkte (je eine neue Zeile, keine bestehende Logik umbauen). Fass `lib/vertrieb-store-neon.ts`,
`lib/finanz/*`, `lib/assistent/agent.ts`/`truppe.ts`, LinkedIn- oder Mail-Logik inhaltlich
**nicht an** — du liest von dort nur, du änderst dort nichts. So bleiben die beiden Zweige
später sauber zusammenführbar.

## Ziel dieses Durchlaufs — und was er bewusst NICHT ist
Die 3D-Zentrale (`components/admin/zentrale/hauptsitz-3d.tsx`) soll **wahrhaftig lebendig**
wirken: echte Mitarbeiter-Anwesenheit an echten Schreibtischen, ein Puls wenn ein Agent
wirklich gerade aktiv war, eine Verbindungslinie zwischen zwei Abteilungen nur in dem
Moment, in dem zwischen ihnen wirklich etwas passiert ist — nicht dauerhaft, nicht erfunden.

**Bewusst NICHT Teil dieses Durchlaufs**: fotorealistische Bäume/Gebäude/menschliche Figuren,
neue 3D-Asset-Bibliotheken oder -Dienste. Der heutige abstrakte/Low-Poly-Stil bleibt — er
wird nur wahrhaftiger, nicht hübscher. Das ist eine bewusste, schon getroffene Entscheidung,
keine deine.

## Sicherheits-Setup
1. Du befindest dich bereits im Worktree, Branch `3d-zentrale-realismus` ab
   `origin/feat/system-haus-site`. Prüfe das (`git status`, `git log -1`) statt es anzunehmen.
2. **Nur lokal committen. Kein `git push`.** Ein Commit pro abgeschlossenem Unterpunkt.
3. Keine Geheimnisse ausgeben. Keine erfundenen Zustände (siehe Regel oben).

---

## Kontext, den du nicht neu suchen musst (bereits verifiziert)

- `lib/zentrale/abteilungen.ts`: 15 `Abteilung`en, jede mit `agenten: string[]` (echte
  Agent-IDs aus der Truppe) und `besetzung: "aktiv"|"teilweise"|"leer"`. Das Zuordnungs-
  Fundament „welcher Agent gehört zu welcher Abteilung" existiert bereits vollständig —
  du baust darauf auf, nicht neu.
- Die 7 echten Agenten: `rat`, `jaeger`, `lage`, `vertrieb`, `messen`, `kapital`,
  `redaktion` (`lib/assistent/agent.ts`).
- `assistent_laeufe` (`lib/assistent/store.ts:36-43`): Spalten `id, agent, ergebnis,
  anzahl, fehler, created_at`. **Es gibt keine Start/Ende-Dauer, keinen „läuft gerade
  jetzt"-Status** — nur den Zeitpunkt des letzten abgeschlossenen Laufs
  (`letzteLaeufe()`, Zeile 287: `SELECT DISTINCT ON (agent) ... ORDER BY agent,
  created_at DESC`). Baue „aktiv" ausschließlich darauf — niemals eine „tippt gerade"-
  Animation ohne echte Entsprechung in den Daten.
- `lib/zentrale/netz.ts`: `Signal.last: number` (0..1) treibt bereits Gebäudehöhe/Takt pro
  Knoten — das bestehende Lebendigkeits-Signal, an das du andockst.
- `lib/zentrale/netz-karte.ts:194-209`: `FAEDEN` — 14 benannte, inhaltlich echte
  Verbindungen (z. B. „Gesendete Mail im Kundenfaden", „Buchung hebt die Stufe"). Diese
  Liste beschreibt WELCHE Verbindungen real sind, trägt aber noch **keinen Zeitstempel**,
  wann zuletzt wirklich etwas passiert ist — genau das baust du in Phase 2.
- `components/admin/netz-faden.tsx` liest `FAEDEN` heute nur als statische Breadcrumb-
  Navigation — wird in Phase 4 um echte Aktivität ergänzt, bleibt aber als Navigation
  funktionsfähig.

---

## Phase 1 — Mini-Schema für echte Verbindungsereignisse

Lege (gleiches minimales Muster wie `fin_abgleich` in `lib/finanz/fibero-abgleich.ts` oder
`betrieb_alarme`) eine neue, kleine Tabelle an, z. B. in einer neuen Datei
`lib/zentrale/faden-protokoll.ts`:

```sql
CREATE TABLE IF NOT EXISTS zentrale_faden_log (
  id bigserial PRIMARY KEY,
  von text NOT NULL,
  nach text NOT NULL,
  was text,
  erzeugt_at timestamptz NOT NULL DEFAULT now()
)
CREATE INDEX IF NOT EXISTS zentrale_faden_log_paar_idx ON zentrale_faden_log (von, nach, erzeugt_at DESC)
```

Baue eine einzige Hilfsfunktion `protokolliereFaden(db, von: KnotenId, nach: KnotenId, was?: string)`,
die einen Eintrag schreibt — fehlertolerant (ein Logging-Fehler darf niemals die eigentliche
Aktion zum Scheitern bringen, also in einem `try/catch` mit stillem Fallback, nach demselben
Muster wie `protokolliere()` in `lib/finanz/store.ts`).

---

## Phase 2 — Die 14 FAEDEN mit echten Ereignissen verbinden

Für jeden Eintrag in `FAEDEN` (`lib/zentrale/netz-karte.ts:194-209`): finde die reale
Code-Stelle, die genau dieses Ereignis auslöst, und ergänze dort **einen einzigen,
zusätzlichen Aufruf** von `protokolliereFaden(...)` — keine bestehende Logik ändern, nur
eine Zeile danach einfügen. Bereits identifiziert (verifiziere trotzdem selbst im Code,
bevor du antippst):

- `gespraech→verkaufen` („Nächster Schritt am Deal") und `gespraech→kunden` („KI-Notiz am
  Kontakt") → `lib/kundenfaden.ts`, `notiereGespraech()`.
- `termine→verkaufen` („Buchung hebt die Stufe") → `lib/kundenfaden.ts`, `notiereTermin()`.
- `mailstudio→kunden` („Gesendete Mail im Kundenfaden") → `lib/kundenfaden.ts`,
  `notiereGesendeteMail()`/`inDenFaden()`.
- `mailstudio→verkaufen` („Antwort hebt die Chance") → `lib/kundenfaden.ts`,
  `notiereAntwort()`.
- `assistent→mailstudio` („Freigegebene Mails") → `app/(admin)/admin/assistent/actions.ts`,
  `freigabeEntscheiden()`, Zweig `art === "mail"`, nach erfolgreichem `sendeFreigabeMail()`.
- `marketing→assistent` („LinkedIn-Redaktion") → derselbe `freigabeEntscheiden()`, Zweig
  `art === "linkedin"`, nach erfolgreichem `veroeffentliche()`.
- `assistent→vertrieb` („Jäger: neue Firmen") → `lib/assistent/kontaktsuche.ts` bzw. der
  `jaeger()`-Agent in `lib/assistent/agent.ts`, an der Stelle, die eine neue Firma/einen
  neuen Kontakt wirklich anlegt.
- `messen→assistent` („Messe-Agent") → `lib/assistent/agent.ts`, `messen()`-Agent, nach
  erfolgreichem Lauf.
- `finanz→assistent` („Finanzrahmen für den Rat") → `lib/assistent/agent.ts`, `kapital()`-
  oder `rat()`-Agent, an der Stelle, wo er tatsächlich Finanz-Daten liest (falls keine
  konkrete Lesestelle auffindbar ist: ehrlich als „nicht verifizierbar" im Bericht
  vermerken, nicht annehmen).
- `system→assistent` („Agentenläufe und Störungen") → `lib/assistent/store.ts`, an der
  Stelle, die in `assistent_laeufe` einfügt (Zeile ~273) — hier reicht ein Tap direkt nach
  dem Insert.
- `kunden→vertrieb`, `vertrieb→verkaufen` — prüfe, ob es hierfür bereits einen echten,
  singulären Schreibpunkt gibt oder ob das eher Dauerzustände (keine Einzelereignisse)
  beschreibt; wenn kein diskretes Ereignis existiert, lass diese zwei bewusst aus und
  vermerke warum.

Wo du eine Stelle NICHT mit Sicherheit verifizieren kannst: nicht raten — im
Abschlussbericht als offen benennen.

---

## Phase 3 — Echte Anwesenheit und echter Puls pro Agent

In `lib/zentrale/hauptsitz.ts` (`bauHauptsitz()`): erweitere die Daten, die pro Abteilung
an die 3D-Komponente gehen, um pro zugeordnetem Agenten (`Abteilung.agenten`) dessen realen
letzten Lauf (`letzteLaeufe()`, `lib/assistent/store.ts:287`). Definiere „aktiv" über die
**bestehende** Kadenz-Logik des jeweiligen Agenten (täglich/wöchentlich, siehe
`lib/assistent/truppe.ts` und `TAEGLICHE_AGENTEN` in `lib/betrieb-alarm.ts:22`) — ein
täglicher Agent ist „aktiv/frisch", wenn `created_at` jünger als etwa sein eigener Takt ist,
ein wöchentlicher entsprechend länger. Erfinde keinen neuen, beliebigen Schwellenwert ohne
Bezug zur echten Kadenz.

In `components/admin/zentrale/hauptsitz-3d.tsx`: rendere pro Abteilung so viele Schreibtisch-
Plätze wie `agenten.length` (mindestens 1 sichtbarer Platz, auch bei `besetzung: "leer"` —
dort bleibt er sichtbar leer, mit der **bestehenden** Formulierung „Nicht besetzt. Diese
Abteilung ist noch nicht aufgebaut." — nicht entfernen, nur ergänzen). Ein besetzter Platz
bekommt eine klare visuelle Markierung (z. B. sanftes Glühen/Puls) nur, wenn sein Agent nach
obiger Definition gerade „aktiv/frisch" ist; sonst eine ruhige, neutrale Darstellung. Jede
Beschriftung dazu muss ehrlich sein: „zuletzt aktiv vor X" — niemals „arbeitet gerade".

---

## Phase 4 — Verbindungslinien nur bei echter, frischer Aktivität

Erweitere die Datenbeschaffung (`lib/zentrale/netz.ts` oder eine neue kleine Funktion
daneben), um für jeden `FAEDEN`-Eintrag den jüngsten `zentrale_faden_log`-Zeitstempel für
genau dieses `(von, nach)`-Paar zu laden. Definiere ein kurzes, klar sichtbares
Live-Fenster (empfohlen: 15–30 Minuten — wähle einen Wert und begründe ihn kurz im Commit;
Emin kann ihn später ändern). In `hauptsitz-3d.tsx`: zeichne/animiere die Verbindungslinie
zwischen den beiden Abteilungs-Gebäuden **nur**, wenn der Zeitstempel innerhalb dieses
Fensters liegt — sonst keine Linie (nicht ausgegraut, nicht gestrichelt als Dauerzustand:
einfach nicht da, bis wieder etwas Echtes passiert). `components/admin/netz-faden.tsx`
(die Breadcrumb-Navigation) bleibt wie heute nutzbar, bekommt zusätzlich optional einen
„zuletzt aktiv vor X" Hinweis, wo einer existiert.

---

## Phase 5 — Etagen-Ansicht (Abteilungs-Detail) zeigt Personen, nicht nur Status

Im Abteilungs-Detail-Panel (das Panel, das beim Öffnen einer Abteilung erscheint, z. B.
„3. OG · Markt & Kunden · Kundenservice"): liste, falls `agenten.length > 0`, jeden
zugeordneten Agenten einzeln mit seinem eigenen „zuletzt aktiv"-Stand (aus Phase 3) statt
nur der aggregierten Abteilungs-Besetzung. Bei `agenten.length === 0` bleibt die
**bestehende** ehrliche Meldung „Noch niemand eingestellt." unverändert.

---

## Phase 6 — Verifikation (angepasst an diese Umgebung)

- `npm run build` (bzw. das Äquivalent dieses Repos) läuft durch, keine neuen Typfehler.
- Du hast in dieser Terminal-Umgebung vermutlich **keinen Browser**, um das 3D-Ergebnis
  visuell zu sehen. Verifiziere stattdessen auf Datenebene: ein kleines, temporäres
  Testskript (oder ein vorhandenes Test-Setup, falls dieses Repo eines hat), das
  `bauHauptsitz()` für einen bekannten Agenten mit einem frischen `assistent_laeufe`-
  Eintrag aufruft und bestätigt, dass die „aktiv"-Markierung korrekt durchgereicht wird —
  und ebenso für einen Agenten ohne Lauf (muss „nicht aktiv" ergeben, nicht abstürzen).
- Sag im Abschlussbericht **explizit und ehrlich**, dass die visuelle Prüfung noch aussteht
  und vom Owner (oder in einer Sitzung mit Browser-Zugriff) nachgeholt werden muss —
  behaupte nicht, es „sehe gut aus", wenn du es nicht gesehen hast.
- `git diff --stat` gegen den Startpunkt.

## Definition von „fertig"
- [ ] Phase 1: Tabelle + Hilfsfunktion, fehlertolerant.
- [ ] Phase 2: jeder der 14 FAEDEN-Einträge entweder angebunden, oder im Bericht explizit
      als „keine sichere Schreibstelle gefunden" benannt — keine erfundene Verbindung.
- [ ] Phase 3: echte Anwesenheit + echter Puls pro Agent, Kadenz-basiert, keine erfundene
      „läuft gerade"-Animation.
- [ ] Phase 4: Linien erscheinen/verschwinden nachweislich mit echten Log-Einträgen.
- [ ] Phase 5: Abteilungs-Detail zeigt einzelne Agenten mit eigenem Stand.
- [ ] Phase 6: Build grün, Datenebene verifiziert, visuelle Prüfung ehrlich als offen
      markiert.
- [ ] Kein `git push`. Keine Änderung außerhalb des genannten Bereichs.
