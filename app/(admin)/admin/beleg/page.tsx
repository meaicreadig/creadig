import { AdminShell } from "@/components/admin/admin-shell"
import {
  BELEGART_LABEL,
  STAND_LABEL,
  belegposten,
  naechsteSchritte,
  uebersicht,
  wirksamsterSchritt,
} from "@/lib/beleg-betrieb"
import { fiberoKennzahlen, HISTORISCHER_BEFUND, MESSUNG_START } from "@/lib/fibero-messung"
import { MIND_ABSTAND_TAGE, MIND_FAELLE, type Probe } from "@/lib/messreihe"
import { getVertriebStore } from "@/lib/lead-store"

/**
 * PROOF OPERATIONS · DAS BELEG-COCKPIT.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES NEBEN DEM MATERIALSTAND STEHT UND NICHT DARIN
 *
 * `/admin/material` beantwortet „was ist leer?" und liest dafuer
 * `lib/material-status.ts`. Diese Datei gehoert zu einem fremden, gesperrten
 * Arbeitsstand (G18) und darf in diesem Lauf nicht angefasst werden — also
 * waere jede Erweiterung dort entweder ein Bruch der Sperre oder ein zweites
 * Modell mit demselben Namen.
 *
 * Wichtiger ist aber: Es sind zwei verschiedene Fragen.
 *
 *   Materialstand   Was fehlt, damit die Website vollstaendig ist?
 *   Beleg-Betrieb   Was fehlt, damit der naechste BEWEIS oeffentlich wird?
 *
 * Die erste ist eine Inventur. Die zweite ist eine Reihenfolge.
 *
 * ---------------------------------------------------------------------------
 * DIE EINE ANTWORT OBEN
 *
 * Der Kopf dieser Seite traegt genau einen Posten: den wirksamsten naechsten
 * Schritt. Nicht die fuenf besten — wer fuenf bekommt, faengt mit keinem an.
 * Alles andere steht darunter, in der Reihenfolge, die `naechsteSchritte()`
 * begruendet.
 *
 * ---------------------------------------------------------------------------
 * OHNE DATENBANK IST DIE SEITE NICHT KAPUTT
 *
 * Die Messproben kommen aus Neon. Steht keine Verbindung, ist die Liste leer
 * — und der fibero-Posten sagt dann korrekt, dass kein Ausgangsstand erhoben
 * ist. Das ist dieselbe Aussage wie mit leerer Tabelle, und sie ist wahr.
 */
export const dynamic = "force-dynamic"

export const metadata = { title: "Beleg-Betrieb" }

async function ladeProben(): Promise<{ proben: Probe[]; gelesen: boolean }> {
  /*
   * `null` heisst „nicht lesbar", `[]` heisst „noch nichts erhoben" — die
   * Unterscheidung kommt aus dem Store (Gate 27) und wird hier durchgereicht.
   * Ohne sie saehe ein fehlender Tisch aus wie ein Haus, das nie gemessen hat.
   */
  const store = getVertriebStore()
  /* Ohne konfigurierte Datenbank ist die Reihe nicht leer — sie ist nicht lesbar. */
  if (!store) return { proben: [], gelesen: false }
  const zeilen = await store.measurementSamples()
  if (zeilen === null) return { proben: [], gelesen: false }
  return {
    proben: zeilen.map((z) => ({
      kennzahl: z.kennzahl,
      seite: z.seite === "danach" ? "danach" : "ausgang",
      am: z.am,
      wert: z.wert,
      faelle: z.faelle,
      quelle: z.quelle as Probe["quelle"],
      von: z.von,
      notiz: z.notiz,
    })),
    gelesen: true,
  }
}

export default async function BelegBetrieb() {
  const { proben, gelesen } = await ladeProben()
  const u = uebersicht(proben)
  const erster = wirksamsterSchritt(proben)
  const offen = naechsteSchritte(proben)
  const alle = belegposten(proben)
  const oeffentlich = alle.filter((p) => p.stand === "oeffentlich")

  return (
    <AdminShell
      title="Beleg-Betrieb"
      lead="Nicht was fehlt, sondern was als Nächstes beweisbar wird. Diese Ansicht erfindet nichts — sie liest die Freigaben, die Produktbelege, die Messreihe und die offenen Owner-Tatsachen und sortiert sie danach, wie nah sie an öffentlich sind."
      meta={
        <>
          <span className="block">
            {u.oeffentlich} öffentlich · {offen.length} offen
          </span>
          <span className="text-gold-text mt-1 block">
            {u.kundenfaelleOeffentlich} freigegebene Kundenfälle
          </span>
        </>
      }
    >
      {/* ── DIE EINE FRAGE ─────────────────────────────────────────────── */}
      <section aria-labelledby="naechster-titel">
        <h2 id="naechster-titel" className="eyebrow text-gold-text">
          Die wirksamste nächste Handlung
        </h2>

        {erster === null ? (
          <p className="type-body text-foreground/85 mt-5 max-w-2xl text-pretty">
            Nichts offen. Jeder Beleg, den dieses Haus führen kann, ist öffentlich.
          </p>
        ) : (
          <div className="border-gold/45 bg-background mt-5 border-s-2 p-6">
            <p className="text-meta text-muted-foreground">
              {BELEGART_LABEL[erster.art]} · liegt bei{" "}
              {erster.liegtBei === "kunde"
                ? "dem Kunden"
                : erster.liegtBei === "owner"
                  ? "dem Inhaber"
                  : "der Zeit"}
              {erster.startetUhr ? " · startet eine Wartezeit" : ""}
            </p>
            <h3 className="text-subhead mt-3 text-lg">{erster.subjekt}</h3>
            <p className="type-body text-foreground/85 mt-4 max-w-3xl text-pretty">{erster.fehlt}</p>
            <p className="type-small text-gold-text mt-4 max-w-3xl text-pretty">{erster.wirkung}</p>
          </div>
        )}
      </section>

      {/* ── ALLES OFFENE, IN REIHENFOLGE ───────────────────────────────── */}
      <section aria-labelledby="offen-titel" className="border-line mt-12 border-t pt-8">
        <div className="border-line flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b pb-2">
          <h2 id="offen-titel" className="text-subhead text-base">
            Was noch fehlt
          </h2>
          <span className="text-meta text-muted-foreground shrink-0">{offen.length} Posten</span>
        </div>

        <ul className="mt-3 flex flex-col gap-2.5">
          {offen.map((p, i) => (
            <li key={p.key} className="tile bg-background p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
                <h3 className="text-subhead text-sm">
                  <span className="text-muted-foreground font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>{" "}
                  {p.subjekt}
                </h3>
                <span className="text-meta text-muted-foreground shrink-0">
                  {STAND_LABEL[p.stand]}
                </span>
              </div>
              {p.fehlt && (
                <p className="type-small text-muted-foreground mt-2 text-pretty">{p.fehlt}</p>
              )}
              <p className="type-small text-gold-text mt-3 text-pretty">{p.wirkung}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── DIE MESSREIHE ──────────────────────────────────────────────── */}
      <section aria-labelledby="messung-titel" className="border-line mt-12 border-t pt-8">
        <div className="border-line flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b pb-2">
          <h2 id="messung-titel" className="text-subhead text-base">
            Messreihe fibero
          </h2>
          <span className="text-meta text-muted-foreground shrink-0">
            {u.probenErhoben} Proben {gelesen ? "" : "· Datenbank nicht gelesen"}
          </span>
        </div>

        {/*
          Der wichtigste Satz dieser Seite steht hier und nicht im Fliesstext:
          Es gibt keinen Vorher-Stand, und es wird auch keiner mehr entstehen.
          Wer diese Zeile ueberliest, erfindet in sechs Monaten eine.
        */}
        <p className="type-small text-muted-foreground mt-4 max-w-3xl text-pretty">
          <span className="text-foreground">Historischer Vorher-Stand: existiert nicht.</span>{" "}
          {HISTORISCHER_BEFUND}
        </p>
        <p className="type-small text-muted-foreground mt-3 max-w-3xl text-pretty">
          Erhoben wird ab {MESSUNG_START} der Ausgangsstand <em>mit</em> fibero. Ein Vergleich
          zählt erst ab {MIND_ABSTAND_TAGE} Tagen Abstand und {MIND_FAELLE} Fällen je Seite.
        </p>

        <ul className="mt-5 flex flex-col gap-2.5">
          {fiberoKennzahlen.map((k) => {
            const eigene = proben.filter((p) => p.kennzahl === k.key)
            const ausgang = eigene.filter((p) => p.seite === "ausgang").length
            const danach = eigene.filter((p) => p.seite === "danach").length
            return (
              <li key={k.key} className="tile bg-background p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
                  <h3 className="text-subhead text-sm">{k.key}</h3>
                  <span className="text-meta text-muted-foreground shrink-0 font-mono">
                    {ausgang} Ausgang · {danach} danach · {k.einheit}
                  </span>
                </div>
                <p className="type-small text-muted-foreground mt-2 text-pretty">{k.definition}</p>
                <p className="text-meta text-muted-foreground mt-2 text-pretty">
                  Quelle: {k.quelle} · Nicht mitgezählt: {k.ausgenommen}
                </p>
                {/*
                  DER BEFEHL STEHT DA, NICHT NUR DER WUNSCH.
                  Eine Ansicht, die sagt „hier fehlt eine Probe", und den Weg
                  dorthin verschweigt, ist eine Liste. Der Befehl ist
                  vollständig bis auf die drei Zahlen, die nur die Messung
                  selbst liefern kann — und er schreibt ohne `--schreiben`
                  nichts.
                */}
                <code
                  dir="ltr"
                  className="text-meta text-muted-foreground border-line mt-3 block overflow-x-auto border-s-2 py-2 ps-3 font-mono"
                >
                  npm run messprobe -- --kennzahl {k.key} --seite{" "}
                  {ausgang === 0 ? "ausgang" : "danach"} --wert ? --faelle ? --quelle {k.quelle}{" "}
                  --von ? --schreiben
                </code>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ── WAS STEHT ──────────────────────────────────────────────────── */}
      <section aria-labelledby="steht-titel" className="border-line mt-12 border-t pt-8">
        <h2 id="steht-titel" className="eyebrow text-muted-foreground">
          Steht
        </h2>
        <ul className="mt-4 flex flex-col gap-1.5">
          {oeffentlich.map((p) => (
            <li key={p.key} className="type-small text-muted-foreground text-pretty">
              <span className="text-foreground">{p.subjekt}</span> — {p.aussage}
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  )
}
