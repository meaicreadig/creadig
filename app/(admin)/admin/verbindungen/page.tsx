import Link from "next/link"
import { cookies } from "next/headers"

import { AdminShell } from "@/components/admin/admin-shell"
import { Pill, SectionHeader, Surface } from "@/components/admin/primitives"
import { VerbindungKnopf } from "@/components/admin/verbindung-knopf"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { GESCHAEFTS_ZEITZONE } from "@/lib/geschaeftszeit"
import {
  VERBINDUNGS_GRUPPEN,
  eingangsLage,
  pruefstandAktiv,
  verbindungenInventar,
  zustandSchwere,
  type Verbindungseintrag,
} from "@/lib/verbindungen"
import { fixtureStand } from "@/lib/verbindungen-fixture"
import { letztePruefung } from "@/lib/verbindungen-pruefung"
import { pruefstandAction, verbindungPruefenAction } from "./actions"

/**
 * ADM-04 · DAS VERBINDUNGSVERZEICHNIS.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE FRAGE OBEN
 *
 * Nicht „welche Integrationen haben wir“ — darauf folgt keine Handlung. Die
 * Frage lautet: KOMMT EINE ANFRAGE AN? Sie steht zuoberst, sie hat zwei
 * mögliche Antworten, und sie zählt nur die als kritisch eingefrorenen Wege
 * (`docs/admin-os/state.md` §ADM-00, OD-2). Ein nicht eingerichteter
 * LinkedIn-Kanal löst hier keine Warnung aus; täte er es, wäre die Warnung
 * nach dem dritten Mal Tapete.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DREI ZEILEN JE KARTE, NIE EINE
 *
 * Fähigkeit · Autorisierung · Adresse. Der Grund steht in
 * `lib/verbindungen.ts`: Ein Profillink in der Fußzeile ist kein Zugang, ein
 * Zugang ist noch keine Datenoperation. Wer das zu einem grünen Haken
 * zusammenzieht, schreibt „verbunden“ über einen Kanal, über den nichts
 * fließt.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ABGELEITET UND GEMESSEN STEHEN NICHT NEBENEINANDER
 *
 * Der Zustand kommt aus der Einrichtung dieser Instanz. Die Prüfung misst —
 * und nur was sie wirklich getan hat, darf sie behaupten; beim Versand heißt
 * das „Zugang hinterlegt“ und ausdrücklich nicht „funktioniert“, denn ein
 * Testversand wäre eine echte Mail an einen echten Empfänger.
 *
 * Nichts davon läuft beim Rendern. ADM-02 · H1 hat dieses Haus gelehrt, was
 * ein Lesepfad mit Nebenwirkung anrichtet; ein Lesepfad, der bei jedem
 * Aufruf fremde Systeme anruft, ist derselbe Fehler in langsam.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.verbindungen.titel }
}

export default async function Verbindungen() {
  const { t, intl } = await adminSprachKontext()
  const v = t.verbindungen

  /*
   * Der Zustand des Prüfstands kommt aus dem Arbeitsspeicher und wird in das
   * sonst reine Inventar hereingereicht — so bleibt `verbindungenInventar()`
   * in Skripten ohne laufenden Server prüfbar.
   */
  /*
   * ADM-04 · H19 — würde eine Änderung überhaupt angenommen?
   *
   * Dieselbe Frage, die `middleware.ts` vor jeder ändernden Anfrage stellt,
   * einmal lesend gestellt: Ist der Sitzungsspeicher nicht erreichbar, wird
   * jede Server Action mit 503 abgewiesen (H2, absichtlich zur sicheren
   * Seite). Gemessen 17.09.2026 mit toter Datenbank sah der Owner davon
   * nichts als eine englische Browsermeldung.
   *
   * Der Aufruf kostet eine zusätzliche Leseabfrage auf genau dieser Seite —
   * und er ist hier das Thema: Eine Fläche, die über Erreichbarkeit spricht,
   * darf über ihre eigene nicht schweigen. Sie schreibt nichts.
   */
  const schreibprobe = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  const schreibsperre = schreibprobe.verdict === "unavailable"

  const pruefstand = fixtureStand()
  const eintraege = verbindungenInventar(process.env, {
    zustand: pruefstand.zustand,
    autorisiert: pruefstand.tokenGesetzt,
  })
  const lage = eingangsLage(eintraege)
  const verbunden = eintraege.filter((e) => e.zustand === "CONNECTED").length
  const zeitformat = new Intl.DateTimeFormat(intl, {
    timeZone: GESCHAEFTS_ZEITZONE,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <AdminShell
      title={v.titel}
      lead={v.lead}
      meta={<span className="block tabular-nums">{v.meta(verbunden, eintraege.length)}</span>}
    >
      {/* ── NIMMT DER ADMIN GERADE ÜBERHAUPT ETWAS AN? ───────────────────── */}
      {schreibsperre && (
        <div role="status" className="border-destructive/40 mb-6 border-s-2 py-2 ps-4">
          <p className="text-subhead text-sm">{v.schreibsperreTitel}</p>
          <p id="schreibsperre-grund" className="type-small text-muted-foreground mt-1 max-w-3xl text-pretty">
            {v.schreibsperre}
          </p>
        </div>
      )}

      {/* ── KOMMT EINE ANFRAGE AN? ───────────────────────────────────────── */}
      <section aria-labelledby="eingang-titel">
        <Surface>
          <h2 id="eingang-titel" className="eyebrow text-muted-foreground">
            {v.eingangTitel}
          </h2>
          <p className={`type-small mt-2 text-pretty ${lage.offen ? "text-foreground" : "text-destructive"}`}>
            {lage.offen ? v.eingangOk : v.eingangGestoert(lage.gestoert.length)}
          </p>
          {lage.gestoert.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {lage.gestoert.map((e) => (
                <li key={e.id} className="type-small text-muted-foreground text-pretty">
                  <span className="text-foreground">{v.kanal[e.kanal as keyof typeof v.kanal]}</span>
                  {" — "}
                  {v.beleg[e.beleg as keyof typeof v.beleg]}
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </section>

      {/* ── DIE GRUPPEN ──────────────────────────────────────────────────── */}
      {VERBINDUNGS_GRUPPEN.filter((g) => g !== "pruefstand").map((gruppe) => {
        const inGruppe = eintraege.filter((e) => e.gruppe === gruppe)
        if (inGruppe.length === 0) return null
        return (
          <section key={gruppe} aria-labelledby={`gruppe-${gruppe}`} className="mt-12">
            <SectionHeader id={`gruppe-${gruppe}`} title={v.gruppe[gruppe]} count={inGruppe.length} />
            <p className="type-small text-muted-foreground mt-3 max-w-3xl text-pretty">
              {v.gruppeHinweis[gruppe]}
            </p>
            <ul className="mt-5 flex flex-col gap-4">
              {inGruppe.map((e) => (
                <li key={e.id} data-verbindung={e.id}>
                  <Karte eintrag={e} v={v} zeitformat={zeitformat} schreibsperre={schreibsperre} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      {/* ── DER PRÜFSTAND ────────────────────────────────────────────────── */}
      {pruefstandAktiv() && (
        <section aria-labelledby="gruppe-pruefstand" className="mt-12">
          <SectionHeader
            id="gruppe-pruefstand"
            title={v.gruppe.pruefstand}
            count={v.pruefstand.wirkungen(pruefstand.wirkungen)}
          />
          <p className="type-small text-muted-foreground mt-3 max-w-3xl text-pretty">
            {v.gruppeHinweis.pruefstand}
          </p>

          {eintraege
            .filter((e) => e.gruppe === "pruefstand")
            .map((e) => (
              <div key={e.id} data-verbindung={e.id} className="mt-5">
                <Karte eintrag={e} v={v} zeitformat={zeitformat} schreibsperre={schreibsperre} />
              </div>
            ))}

          <Surface className="mt-4">
            <p className="type-small text-muted-foreground text-pretty">{v.pruefstand.hinweis}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  ["verbinden", v.pruefstand.verbinden, "deutlich"],
                  ["ereignis", v.pruefstand.webhook, "leise"],
                  ["ereignis-gleich", v.pruefstand.webhookGleich, "leise"],
                  ["anbieterfehler", v.pruefstand.fehler, "leise"],
                  ["widerrufen", v.pruefstand.widerrufen, "leise"],
                ] as const
              ).map(([aktion, label, variante]) => (
                /* Je Knopf ein Formular — sonst sperrt ein Klick alle anderen mit. */
                <form key={aktion} action={pruefstandAction} data-pruefstand={aktion}>
                  <input type="hidden" name="aktion" value={aktion} />
                  <VerbindungKnopf
                    label={label}
                    laeuft={v.pruefenLaeuft}
                    variante={variante}
                    gesperrt={schreibsperre}
                    begruendungId="schreibsperre-grund"
                  />
                </form>
              ))}
            </div>

            <h3 className="text-subhead mt-8 text-sm">{v.pruefstand.ereignisseTitel}</h3>
            {pruefstand.ereignisse.length === 0 ? (
              <p className="type-small text-muted-foreground mt-2">{v.pruefstand.ereignisseLeer}</p>
            ) : (
              <ol data-ereignisse className="mt-3 flex flex-col gap-2">
                {pruefstand.ereignisse.map((ereignis) => (
                  <li key={ereignis.id} className="type-small text-muted-foreground text-pretty">
                    <span className="tabular-nums">{zeitformat.format(ereignis.at)}</span>
                    {" · "}
                    <span className="text-foreground">{v.pruefstand.art[ereignis.art]}</span>
                    {" · "}
                    {v.pruefstand.wirkung[ereignis.wirkung]}
                    {ereignis.schluessel ? ` · ${v.pruefstand.schluessel(ereignis.schluessel)}` : ""}
                    {` · ${ereignis.akteur}`}
                  </li>
                ))}
              </ol>
            )}
          </Surface>
        </section>
      )}

      <p className="type-small text-muted-foreground border-line mt-12 border-t pt-6 text-pretty">
        {v.protokollHinweis}
      </p>
    </AdminShell>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 * EINE KARTE
 * ═══════════════════════════════════════════════════════════════════════════ */

type Texte = Awaited<ReturnType<typeof adminSprachKontext>>["t"]["verbindungen"]

function Karte({
  eintrag,
  v,
  zeitformat,
  schreibsperre,
}: {
  eintrag: Verbindungseintrag
  v: Texte
  zeitformat: Intl.DateTimeFormat
  schreibsperre: boolean
}) {
  const gemessen = letztePruefung(eintrag.id)
  const titelId = `verbindung-${eintrag.id}`

  return (
    <Surface>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 id={titelId} className="text-subhead text-base">
          {v.kanal[eintrag.kanal as keyof typeof v.kanal]}
        </h3>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {eintrag.kritikalitaet === "CRITICAL" && (
            <Pill severity="attention">{v.kritikalitaet.CRITICAL}</Pill>
          )}
          <Pill severity={zustandSchwere(eintrag.zustand)}>{v.zustand[eintrag.zustand]}</Pill>
        </div>
      </div>

      {/* Die drei Ebenen, getrennt und in dieser Reihenfolge. */}
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <Ebene label={v.ebene.faehigkeit}>
          {v.faehigkeit[eintrag.ebenen.faehigkeit as keyof typeof v.faehigkeit]}
        </Ebene>
        <Ebene label={v.ebene.autorisierung}>
          {v.autorisierung[eintrag.ebenen.autorisierung as keyof typeof v.autorisierung]}
        </Ebene>
        <Ebene label={v.ebene.profil}>
          {eintrag.ebenen.profilLink ? (
            <a
              href={eintrag.ebenen.profilLink}
              dir="ltr"
              className="underline underline-offset-4"
              {...(eintrag.ebenen.profilLink.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {eintrag.ebenen.profilLink}
            </a>
          ) : null}
        </Ebene>
      </dl>

      <p className="type-small text-muted-foreground border-line mt-4 border-s-2 py-1 ps-4 text-pretty">
        {v.beleg[eintrag.beleg as keyof typeof v.beleg]}
      </p>

      {/* Gemessen — oder ehrlich: nicht gemessen. */}
      <p className="type-small text-muted-foreground mt-4" role="status">
        {gemessen ? (
          <>
            <span className="text-foreground">{v.befund[gemessen.befund]}</span>{" "}
            {v.geprueft(zeitformat.format(gemessen.at), gemessen.akteur)} · {v.reichweite[gemessen.reichweite]}
            {gemessen.dauerMs !== null ? ` · ${v.dauer(gemessen.dauerMs)}` : ""}
          </>
        ) : (
          v.nichtGeprueft
        )}
      </p>

      {(eintrag.pruefbar || eintrag.href) && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {eintrag.pruefbar && (
            <form action={verbindungPruefenAction}>
              <input type="hidden" name="id" value={eintrag.id} />
              <VerbindungKnopf
                label={v.pruefen}
                laeuft={v.pruefenLaeuft}
                gesperrt={schreibsperre}
                begruendungId="schreibsperre-grund"
              />
            </form>
          )}
          {eintrag.href && (
            <Link
              prefetch={false}
              href={eintrag.href}
              className="type-small text-gold-text underline underline-offset-4"
            >
              {v.oeffnen}
            </Link>
          )}
        </div>
      )}
    </Surface>
  )
}

/**
 * Eine Ebene. Leer heißt „gibt es nicht“ und wird als Gedankenstrich
 * gezeigt — nicht als leere Fläche, die wie ein Ladefehler aussieht.
 */
function Ebene({ label, children }: { label: string; children?: React.ReactNode }) {
  const leer = children === null || children === undefined || children === ""
  return (
    <div>
      <dt className="text-meta text-muted-foreground">{label}</dt>
      <dd className={`mt-1 text-sm text-pretty ${leer ? "text-muted-foreground" : "text-foreground"}`}>
        {leer ? "—" : children}
      </dd>
    </div>
  )
}
