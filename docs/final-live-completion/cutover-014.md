# Cutover-Paket · Migration 014 (Messreihe)

> Verfassung §5 verlangt für jeden Status `WAITING_CUTOVER_AUTHORITY` das
> vollständige Paket im Klartext: **Commit · Änderungen · Migration ·
> Smoke-Plan · Rollback**. Hier steht es. Erstellt 13.09.2026.
>
> **Dieses Dokument ändert nichts und autorisiert nichts.** Es macht die
> Owner-Entscheidung zu einer Entscheidung statt zu einer Recherche.

## Worum es geht, in zwei Sätzen

fibero hat keinen erhobenen Vorher-Stand, und erfinden darf ihn niemand. Der
einzige Ausweg ist, **ab jetzt** zu messen — und dafür braucht es genau eine
Tabelle in der Produktion. Solange sie fehlt, kann die 28-Tage-Uhr nicht
starten, und jeder Tag Verzögerung verschiebt den ersten Wirkungsbeleg um
einen Tag.

## Commit

| | |
|---|---|
| Branch | `feat/system-haus-site` |
| Stand | `35e1fa3` — identisch mit Production (`dpl_6zdnqA3y…`) |
| Code bereits live? | **ja.** Der Code für die Messreihe läuft seit dem 12.09.2026 in Produktion |
| Was fehlt | **nur die Tabelle.** Kein Deploy nötig, kein Promote nötig |

Das ist der wichtigste Satz des Pakets: Hier wird **keine Anwendung
verändert**. Es wird eine Tabelle angelegt, die der laufende Code bereits
kennt und heute nicht vorfindet.

## Änderungen an der Datenbank

Eine Tabelle, ein Index. Nichts anderes.

```sql
CREATE TABLE IF NOT EXISTS measurement_samples (
  id text PRIMARY KEY,
  metric_key text NOT NULL,
  side text NOT NULL,
  measured_on date NOT NULL,
  value numeric NOT NULL,
  cases integer NOT NULL,
  source text NOT NULL,
  recorded_by text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS measurement_samples_key_idx
  ON measurement_samples (metric_key, side, measured_on);
```

| Eigenschaft | Stand |
|---|---|
| Additiv | **ja** — legt an, ändert nichts Bestehendes |
| Idempotent | **ja** — `IF NOT EXISTS`; zweimal laufen lassen ist folgenlos |
| Berührt bestehende Zeilen | **nein** — kein `UPDATE`, kein `DELETE`, kein `ALTER` an vorhandenen Tabellen |
| Datenverlust möglich | **nein** |
| Lesbare Fassung | `scripts/migrations/014-messreihe.sql` |
| Angewendete Fassung | `lib/neon-client.ts` → `SCHEMA[]` |
| Beide identisch? | **ja, maschinell geprüft** — `npm run postbuild`, Schemastand-Gate (G36) |

## Warum der Ausfall heute lautlos ist

`measurement_samples` steht **bewusst nicht** in `REQUIRED_TABLES`. Ohne die
Tabelle fällt kein Vorgang aus — es entsteht nur kein Verlauf. Das heißt
zweierlei: Die Migration ist ungefährlich, **und** ihr Fehlen meldet sich
nicht von selbst. Sie wird nur dann gemacht, wenn jemand sie macht.

## Der Weg

```bash
# 1 · Zeigen, was fehlt — ändert nichts
MIGRATE_URL="<Produktions-URL>" npm run db-migrate -- --check

# 2 · Anwenden — verlangt die ausdrückliche Zustimmung
CREADIG_MIGRATE_PRODUCTION=ja-ich-migriere-produktion \
MIGRATE_URL="<Produktions-URL>" npm run db-migrate
```

Schritt 1 ist gefahrlos und beantwortet zugleich eine offene Frage des
Hauptbuchs: **ob Migration 013 (`owner_load_samples`) bereits in Produktion
steht.** Aus dieser Umgebung ist das nicht feststellbar — `--check` sagt es
in einer Zeile.

## Smoke-Plan — vier Prüfungen, keine davon schreibt

| # | Prüfung | Erwartung |
|---|---|---|
| 1 | `npm run db-migrate -- --check` erneut | meldet **nichts Fehlendes** |
| 2 | `/admin/beleg` öffnen | Cockpit lädt, nennt die nächste Handlung |
| 3 | `/` und `/produkte/fibero` | HTTP 200, unverändert |
| 4 | `npm run messprobe` **ohne** `--schreiben` | validiert, schreibt nichts |

Erst danach schreibt eine echte Messprobe — mit `--schreiben`, und mit einer
Zahl, die aus dem Betrieb stammt und nicht aus einer Schätzung.

## Rollback

| Frage | Antwort |
|---|---|
| Nötig? | Praktisch nein — eine leere, additive Tabelle stört keinen Vorgang |
| Falls doch | `DROP TABLE measurement_samples;` — verliert **nur** die Messreihe, keine Geschäftsdaten |
| Anwendungs-Rollback | nicht anwendbar: es wird keine Anwendung ausgeliefert |
| Deployment-Rollback | falls je nötig: `dpl_6zdnqA3y…` und `dpl_8GDzRXmz…` tragen `isRollbackCandidate: true` |

## Was dieses Paket ausdrücklich nicht ist

Keine Zustimmung. Die Verfassung verlangt für jede Produktionsänderung eine
**frische** Owner-Zustimmung in der laufenden Runde — dieses Dokument ist
Vorbereitung, nicht Erlaubnis. Ohne sie bleibt F01 auf
`WAITING_CUTOVER_AUTHORITY`, und das ist der korrekte Zustand, kein Versäumnis.
