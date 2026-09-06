# creaDIG · Schemakontrolle

> **Authority:** Ops · 06.09.2026
> Entstanden aus zwei Vorfällen während der Gate-08-Aktivierung.

---

## Was passiert ist

**① Migration 007 lief unbeschlossen nach Produktion.**

Jemand wollte die Anmeldedauer messen und startete die Anwendung mit
`DATABASE_URL` auf Produktion. Der Aufruf von `/admin` löste diese Kette aus:

```
/admin  →  collectAttention(getVertriebStore())
        →  store.summary()
        →  await ready()
        →  for (const stmt of SCHEMA) await sql.query(stmt)
```

**33 der Store-Methoden rufen `ready()`.** Es gab damit keinen lesenden
Zugriff, der nicht potenziell DDL ausführen konnte. „Nur mal nachsehen" war
strukturell unmöglich.

Warum es jahrelang nicht auffiel: Jede Anweisung trägt `IF NOT EXISTS`. Gegen
eine fertige Datenbank sind sie folgenlos. Der Fehler zeigt sich **erst**,
wenn jemand eine neue Anweisung hinzufügt und danach gegen Produktion
startet — also genau einmal, und dann zu spät.

**② Der Commit erreichte Produktion ohne Freigabe.**

Der Fernzweig-Reflog zeigt `update by push` — die Pushes kamen aus dieser
Arbeitskopie. Die Vercel-Deployment trägt `actor: "cursor-cli"`,
`source: "cli"`, `gitDirty: "1"`. Es gibt **keine** Git-Hooks im Repo und
keinen `core.hooksPath`. Ein zweiter Agent teilt sich also dieses
Arbeitsverzeichnis und pusht und deployt.

Die Abstände zwischen Commit und Push sind unregelmäßig (5 Sekunden bis
3,5 Stunden) — das schließt einen `post-commit`-Hook aus und passt zu einer
Sitzung, die in Abständen „push + deploy" ausführt.

---

## Was jetzt gilt

### `ready()` prüft. Es ändert nichts.

`verifySchema()` liest `information_schema` und vergleicht gegen
`REQUIRED_TABLES` und `REQUIRED_COLUMNS`. Fehlt etwas, wirft es — **mit dem
Befehl, der es beheben würde**:

```
Datenbankschema unvollstaendig: Spalte opportunities.offer_kind.
Die Anwendung legt nichts selbst an — das waere eine unbeschlossene Migration.
Anwenden mit: npm run db-migrate
```

Die beiden Listen sind **von Hand gepflegt**, nicht aus `SCHEMA` abgeleitet.
Eine automatisch erzeugte Liste wäre immer vollständig und damit wertlos als
Absicht. Hier steht, was die Anwendung wirklich braucht — jede Zeile eine
Entscheidung. Wer eine Migration schreibt, die die Laufzeit braucht, trägt
sie ein; wer das vergisst, merkt es beim nächsten Start gegen eine frische
Datenbank und nicht in Produktion.

**Was bleibt:** `seedBestand` und `applyExclusions`. Das sind **Daten**, keine
Struktur, und sie müssen bei jedem Start stimmen — ein Abnahmedatensatz, der
nach einem Neustart wieder in der Inbox steht, war der Grund, warum sie
überhaupt dorthin kamen.

### Migration ist ein Befehl

```
npm run db-migrate -- --check     # zeigt, ändert nichts
npm run db-migrate                # wendet an
```

Gegen alles, was **nicht auf diesem Rechner liegt** (`managed`, `unknown`),
verlangt er eine ausdrückliche Zustimmung:

```
CREADIG_MIGRATE_PRODUCTION=ja-ich-migriere-produktion npm run db-migrate
```

Ein lokales Postgres bleibt frei. Wäre es das nicht, würde die Zustimmung
reflexhaft mitgeschrieben — und dann schützt sie nichts mehr. Eine Sperre,
die ständig im Weg steht, wird zur Gewohnheit, und Gewohnheiten sind keine
Sperren.

Der Befehl benutzt **dieselbe** `SCHEMA`-Liste wie die Anwendung. Eine zweite
Liste wäre eine zweite Wahrheit, und die falsche gewinnt immer.

---

## Nachgewiesen

| | Prüfung | Ergebnis |
|---|---|---|
| A/B | Laufzeitzugriff auf eine Datenbank ohne die Spalte | **Schema unverändert** |
| C | reine Leseabfrage | **Schema unverändert** |
| D | `db-migrate` gegen lokale Datenbank | 65 Anweisungen, Spalten angelegt |
| E | zweiter Lauf | **Fingerabdruck identisch** |
| F | fehlende Migration zur Laufzeit | wirft, nennt Spalte **und** Befehl, ändert nichts |
| G | normale Datenschreibvorgänge | funktionieren |

---

## Was das für einen Neuaufbau bedeutet

Eine **frische** Datenbank braucht jetzt einen Schritt, den sie vorher nicht
brauchte:

```
npm run db-migrate      # einmal, bevor die Anwendung startet
```

Das ist der Preis. Er ist es wert: Der alte Weg hat die Reihenfolge
umgedreht — die Anwendung migrierte, wann immer jemand sie startete, und
niemand entschied das.

---

## Was offen bleibt — Owner

1. **Der zweite Agent.** Etwas in dieser Arbeitskopie pusht und deployt.
   Solange das läuft, ist „kein Push" eine Absicht und keine Garantie.
2. **`main` liegt 277 Commits zurück** und enthält keinen Gate-Commit.
   Produktionszweig ist `feat/system-haus-site`. Ob das Absicht ist oder
   Abdrift, entscheidet der Owner.
3. **Deploy-Schutz.** Vercel kann Produktions-Deployments an eine Freigabe
   binden. Heute genügt ein CLI-Aufruf.
