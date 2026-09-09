-- ===========================================================================
-- 013 · GATE 27 — DIE MESSREIHE ZUR OWNER-LAST
--
-- Diese Datei ist die LESBARE Fassung. Angewendet wird das Schema aus
-- `lib/neon-client.ts` (`npm run db-migrate`); hier steht, warum es so
-- aussieht.
--
-- ---------------------------------------------------------------------------
-- DAS EINZIGE GATE, DAS SPEICHERN MUSS
--
-- Ueberall sonst gilt in diesem Haus: nicht speichern, was sich ableiten
-- laesst. Die Einordnung in G10, die Freigabelage in G13, der Livetermin in
-- G19, der Zahlungsstand in G18 — alle abgeleitet, weil eine gespeicherte
-- Ableitung ab der ersten Regelaenderung still falsch ist.
--
-- Hier ist es umgekehrt. Ein VERLAUF laesst sich nicht ableiten. Der Wert
-- von vorletztem Monat ist fort, sobald ihn niemand aufgeschrieben hat — und
-- mit ihm die einzige Aussage, die dieses Gate ueberhaupt machen kann.
--
-- ---------------------------------------------------------------------------
-- `measured_on` IST EINDEUTIG
--
-- Zwei Messungen an einem Tag waeren zwei Wahrheiten ueber denselben Tag,
-- und die spaetere gewaenne — obwohl der Vormittag genauso wahr war. Wer
-- oefter messen will, misst an mehr Tagen, nicht mehrmals am selben.
--
-- ---------------------------------------------------------------------------
-- `sales_measured` IST NOT NULL UND HAT KEINEN DEFAULT
--
-- Ob der Vertriebsteil ueberhaupt gelesen werden konnte, ist Teil der
-- Messung und nicht ihre Randnotiz.
--
-- Ohne dieses Feld waere ein Datenbankausfall die beste Entlastung, die
-- dieses Haus je hatte: null Posten, alles ruhig, die Kurve faellt. Ein
-- Default waere derselbe Fehler mit besserem Gewissen — deshalb muss jede
-- Messung sich ausdruecklich dazu erklaeren.
--
-- ---------------------------------------------------------------------------
-- `counts` ALS jsonb
--
-- Die Raenge kommen aus `lib/attention.ts` und duerfen dort wachsen. Eine
-- Spalte je Rang haette bei jedem neuen Rang eine Migration verlangt — und
-- alte Messungen um eine Spalte aermer gemacht, die es damals nicht gab.
-- Eine Messung soll sagen, was sie gemessen hat, nicht was heute zaehlbar
-- waere.
--
-- ---------------------------------------------------------------------------
-- WAS HIER BEWUSST NICHT STEHT
--
-- Keine Spalte `entlastung`, kein `trend`, kein `prozent`. Das Urteil faellt
-- aus zwei Messungen und den Regeln in `lib/ownerlast.ts` — und es faellt
-- ausdruecklich NICHT, solange weniger als 28 Tage dazwischenliegen oder
-- eine der beiden den Vertrieb nicht lesen konnte.
--
-- Eine gespeicherte Trendzahl waere genau das Automationstheater, vor dem
-- der Gate-Vertrag warnt.
--
-- Idempotent. Additiv. Aendert keine bestehende Zeile.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS owner_load_samples (
  id text PRIMARY KEY,
  measured_on date NOT NULL,
  counts jsonb NOT NULL,
  sales_measured boolean NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS owner_load_samples_day_idx ON owner_load_samples (measured_on);
