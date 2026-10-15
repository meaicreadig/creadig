-- ===========================================================================
-- 030 · GoBD-FESTSCHREIBUNG — UNVERAENDERBAR IN DER DATENBANK, NICHT NUR IN
--        DER OBERFLAECHE
--
-- Diese Datei ist die LESBARE Fassung. Angewendet wird das Schema aus
-- lib/finanz/auftraege/store.ts (AUFTRAEGE_SCHEMA) — Tabellen und Trigger
-- legen sich selbst an, weil die Produktions-DATABASE_URL "sensitive" ist
-- und nicht von aussen migriert werden kann (dasselbe Muster wie in
-- scripts/migrations/012-rechnung.sql).
--
-- ---------------------------------------------------------------------------
-- WARUM EIN TRIGGER UND NICHT NUR APPLIKATIONSCODE
--
-- lib/finanz/auftraege/store.ts haelt die Oberflaeche ehrlich: schreibeFest()
-- setzt die Nummer einmal, jede weitere Aenderung an einer versendeten
-- Rechnung lief bisher ueber Storno + neue Rechnung. Das gilt nur, solange
-- niemand direkt an der Tabelle vorbeischreibt — ein Import, eine Konsole,
-- ein spaeteres Skript. GoBD verlangt Unveraenderbarkeit AB DER TABELLE, nicht
-- ab der Oberflaeche davor. Derselbe Grundsatz wie bei den drei CHECKs in
-- 012-rechnung.sql: „Alle drei zusaetzlich zu lib/rechnung.ts, nicht statt
-- seiner."
--
-- ---------------------------------------------------------------------------
-- fin_dokumente — EINE AUSNAHME, UND WARUM SIE DIE EINZIGE IST
--
-- Sobald `nummer` gesetzt ist, sind nummer/positionen/summen/kunde/datum/
-- pruefsumme/steuer_modus unveraenderbar. Status-Felder (status, bezahlt_am,
-- mahnstufe, geoeffnet_at, storniert_at, beantwortet_at, antwort_name,
-- antwort_text, nachgefasst_at) duerfen sich weiter aendern — das sind die
-- Felder, ueber die der ganze Lebenszyklus laeuft (siehe anzeigeStatus()).
--
-- Die GENAU EINE Ausnahme: Nimmt ein Kunde ein Angebot an, waehlt er dabei
-- optionale Positionen ab oder an (beantworteAngebot() in store.ts) — das
-- aendert positionen/summen EINMAL, in genau diesem Uebergang
-- (versendet → angenommen), bei einem Angebot. Kunde/Datum/Pruefsumme/
-- Steuermodus bleiben auch dabei unveraenderbar; nur das Ergebnis der Wahl
-- (welche optionalen Posten zaehlen) darf sich einschreiben. Jede andere
-- Aenderung an einem festgeschriebenen Dokument wirft eine Exception.
--
-- DELETE auf ein festgeschriebenes Dokument (nummer gesetzt) ist verboten —
-- stornieren statt loeschen, wie es die Oberflaeche ohnehin schon tut.
--
-- ---------------------------------------------------------------------------
-- fin_buchungen — GEBUCHT HEISST GEBUCHT, AUSSER FUER DEN FIBERO-SPIEGEL
--
-- Eine Buchung mit status='gebucht' darf nur noch storniert werden
-- (storniert_at setzen); jede andere Spalte ist fest. Das deckt beide
-- bestehenden Wege ab (Rechnung → geplant → gebucht in store.ts,
-- manuelle Buchung → bestaetigt in app/(finanz)/finanz/actions.ts) — keiner
-- von beiden aendert je eine andere Spalte, nachdem gebucht wurde.
--
-- AUSGENOMMEN: quelle='fibero'. Das ist kein Schlupfloch, sondern eine
-- andere Buchungsart mit einer ANDEREN Garantie: lib/finanz/fibero-abgleich.ts
-- spiegelt eine externe, eigenstaendig gepflegte Quelle (fibero selbst
-- fuehrt dort Buchhaltung) ueber eine stabile externe ID (fibero-inv-/-sub-/
-- -exp-<id>) idempotent nach. Korrigiert fibero einen Betrag (z. B. eine
-- Rechnung wird als bezahlt markiert), MUSS dieselbe Zeile hier aktualisiert
-- werden — sonst entstuenden zwei Wahrheiten ueber dieselbe Buchung, und das
-- ist genau der Fehler, den Festschreibung verhindern soll, nicht erzeugen.
-- Die Garantie bei fibero-Zeilen ist nicht „unveraenderbar", sondern
-- „genau eine Zeile je externer ID" (siehe scripts/finanz-drill.mjs, F5).
--
-- ---------------------------------------------------------------------------
-- fin_dokument_verlauf und fin_protokoll — NUR INSERT
--
-- Beides sind Verlaufstabellen: jede Zeile ist ein Ereignis, das so
-- stattgefunden hat. Eine Zeile aendern heisst Geschichte umschreiben; eine
-- Zeile loeschen heisst ein Ereignis ungeschehen machen. Beides verbietet
-- derselbe Trigger (fin_nur_insert()), auf beiden Tabellen.
--
-- Idempotent. Additiv (CREATE OR REPLACE FUNCTION, DROP TRIGGER IF EXISTS +
-- CREATE TRIGGER). Aendert keine bestehende Zeile.
-- ===========================================================================

CREATE OR REPLACE FUNCTION fin_dokumente_festschreibung() RETURNS trigger AS $BODY$
BEGIN
  IF OLD.nummer IS NULL THEN
    RETURN NEW;
  END IF;

  IF OLD.art = 'angebot' AND OLD.status = 'versendet' AND NEW.status = 'angenommen' THEN
    IF NEW.nummer IS DISTINCT FROM OLD.nummer
       OR NEW.kunde IS DISTINCT FROM OLD.kunde
       OR NEW.datum IS DISTINCT FROM OLD.datum
       OR NEW.pruefsumme IS DISTINCT FROM OLD.pruefsumme
       OR NEW.steuer_modus IS DISTINCT FROM OLD.steuer_modus
    THEN
      RAISE EXCEPTION 'fin_dokumente %: festgeschrieben (Nummer %) — bei Annahme duerfen nur Positionen/Summen abweichen', OLD.id, OLD.nummer;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.nummer IS DISTINCT FROM OLD.nummer
     OR NEW.positionen IS DISTINCT FROM OLD.positionen
     OR NEW.summen IS DISTINCT FROM OLD.summen
     OR NEW.kunde IS DISTINCT FROM OLD.kunde
     OR NEW.datum IS DISTINCT FROM OLD.datum
     OR NEW.pruefsumme IS DISTINCT FROM OLD.pruefsumme
     OR NEW.steuer_modus IS DISTINCT FROM OLD.steuer_modus
  THEN
    RAISE EXCEPTION 'fin_dokumente %: festgeschrieben (Nummer %) — nummer/positionen/summen/kunde/datum/pruefsumme/steuer_modus sind unveraenderbar', OLD.id, OLD.nummer;
  END IF;
  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fin_dokumente_festschreibung ON fin_dokumente;
CREATE TRIGGER trg_fin_dokumente_festschreibung BEFORE UPDATE ON fin_dokumente
  FOR EACH ROW EXECUTE FUNCTION fin_dokumente_festschreibung();

CREATE OR REPLACE FUNCTION fin_dokumente_kein_delete() RETURNS trigger AS $BODY$
BEGIN
  IF OLD.nummer IS NOT NULL THEN
    RAISE EXCEPTION 'fin_dokumente %: festgeschrieben (Nummer %) — loeschen verboten, stattdessen stornieren', OLD.id, OLD.nummer;
  END IF;
  RETURN OLD;
END;
$BODY$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fin_dokumente_kein_delete ON fin_dokumente;
CREATE TRIGGER trg_fin_dokumente_kein_delete BEFORE DELETE ON fin_dokumente
  FOR EACH ROW EXECUTE FUNCTION fin_dokumente_kein_delete();

CREATE OR REPLACE FUNCTION fin_buchungen_festschreibung() RETURNS trigger AS $BODY$
BEGIN
  IF OLD.status <> 'gebucht' OR OLD.quelle = 'fibero' THEN
    RETURN NEW;
  END IF;
  IF (to_jsonb(NEW) - 'storniert_at') IS DISTINCT FROM (to_jsonb(OLD) - 'storniert_at') THEN
    RAISE EXCEPTION 'fin_buchungen %: gebucht — nur storniert_at darf noch gesetzt werden', OLD.id;
  END IF;
  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fin_buchungen_festschreibung ON fin_buchungen;
CREATE TRIGGER trg_fin_buchungen_festschreibung BEFORE UPDATE ON fin_buchungen
  FOR EACH ROW EXECUTE FUNCTION fin_buchungen_festschreibung();

CREATE OR REPLACE FUNCTION fin_buchungen_kein_delete() RETURNS trigger AS $BODY$
BEGIN
  IF OLD.status = 'gebucht' AND OLD.quelle <> 'fibero' THEN
    RAISE EXCEPTION 'fin_buchungen %: gebucht — loeschen verboten, stattdessen stornieren (storniert_at)', OLD.id;
  END IF;
  RETURN OLD;
END;
$BODY$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fin_buchungen_kein_delete ON fin_buchungen;
CREATE TRIGGER trg_fin_buchungen_kein_delete BEFORE DELETE ON fin_buchungen
  FOR EACH ROW EXECUTE FUNCTION fin_buchungen_kein_delete();

CREATE OR REPLACE FUNCTION fin_nur_insert() RETURNS trigger AS $BODY$
BEGIN
  RAISE EXCEPTION '% ist ein Verlauf — nur INSERT, kein UPDATE und kein DELETE', TG_TABLE_NAME;
END;
$BODY$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fin_dokument_verlauf_nur_insert ON fin_dokument_verlauf;
CREATE TRIGGER trg_fin_dokument_verlauf_nur_insert BEFORE UPDATE OR DELETE ON fin_dokument_verlauf
  FOR EACH ROW EXECUTE FUNCTION fin_nur_insert();

DROP TRIGGER IF EXISTS trg_fin_protokoll_nur_insert ON fin_protokoll;
CREATE TRIGGER trg_fin_protokoll_nur_insert BEFORE UPDATE OR DELETE ON fin_protokoll
  FOR EACH ROW EXECUTE FUNCTION fin_nur_insert();
