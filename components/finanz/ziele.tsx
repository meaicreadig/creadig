import { eurRund } from "@/components/finanz/format"
import { AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/primitives"
import { GESCHAEFTSFELDER } from "@/lib/finanz/belege"
import type { Ziel } from "@/lib/finanz/ziele"
import { zielSpeichern, zielVerwerfenAction } from "@/app/(finanz)/finanz/ziele/actions"

const SAEULEN = GESCHAEFTSFELDER.filter((g) => g.key !== "privat")
const LABEL = Object.fromEntries(GESCHAEFTSFELDER.map((g) => [g.key, g.label]))

const STATUS_LABEL: Record<Ziel["status"], string> = { aktiv: "Aktiv", erreicht: "Erreicht", verworfen: "Verworfen" }
const STATUS_FARBE: Record<Ziel["status"], string> = {
  aktiv: "text-muted-foreground",
  erreicht: "text-primary",
  verworfen: "text-muted-foreground line-through",
}

function Fortschrittsbalken({ ziel }: { ziel: Ziel }) {
  const breite = ziel.zielbetragCent > 0 ? Math.min(100, Math.round((ziel.standCent / ziel.zielbetragCent) * 100)) : 0
  return (
    <div className="bg-background h-2 overflow-hidden rounded-full" role="img" aria-label={`${breite}% des Ziels erreicht`}>
      <div className={`h-full rounded-full ${ziel.status === "erreicht" ? "bg-primary" : "bg-primary/70"}`} style={{ width: `${breite}%` }} />
    </div>
  )
}

function ZielZeile({ ziel }: { ziel: Ziel }) {
  return (
    <li className="bg-background flex flex-col gap-3 rounded-2xl p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium">
          {ziel.titel}
          <span className="text-muted-foreground font-normal"> · {LABEL[ziel.saeule] ?? ziel.saeule}</span>
          {ziel.istPlatzhalter && <span className="text-muted-foreground font-normal"> · Platzhalter</span>}
        </span>
        <span className={`text-sm font-medium ${STATUS_FARBE[ziel.status]}`}>{STATUS_LABEL[ziel.status]}</span>
      </div>
      {!ziel.istPlatzhalter && <Fortschrittsbalken ziel={ziel} />}
      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>
          {ziel.istPlatzhalter
            ? "Noch kein echtes Ziel — vom Owner zu ersetzen."
            : `${eurRund(ziel.standCent)} von ${eurRund(ziel.zielbetragCent)}`}
        </span>
        <span>Frist {new Date(`${ziel.frist}T00:00:00Z`).toLocaleDateString("de-DE", { timeZone: "UTC" })}</span>
      </div>
      {ziel.notiz && <p className="text-muted-foreground text-sm leading-relaxed">{ziel.notiz}</p>}
      <details>
        <summary className="text-primary cursor-pointer text-sm font-medium">Bearbeiten</summary>
        <div className="mt-3 flex flex-col gap-3">
          <ZielForm ziel={ziel} />
          {ziel.status === "aktiv" && (
            <form action={zielVerwerfenAction}>
              <input type="hidden" name="id" value={ziel.id} />
              <button className="text-muted-foreground hover:text-destructive text-sm">Verwerfen</button>
            </form>
          )}
        </div>
      </details>
    </li>
  )
}

function ZielForm({ ziel }: { ziel?: Ziel }) {
  const p = ziel?.id ?? "neu"
  return (
    <form action={zielSpeichern} className="grid gap-3 sm:grid-cols-2 sm:items-end">
      {ziel && <input type="hidden" name="id" value={ziel.id} />}
      <div className="sm:col-span-2">
        <AdminField label="Titel" htmlFor={`${p}-t`}>
          <AdminInput id={`${p}-t`} name="titel" required defaultValue={ziel?.titel} placeholder="z. B. Erster Beratungskunde" />
        </AdminField>
      </div>
      <AdminField label="Säule" htmlFor={`${p}-s`}>
        <AdminSelect id={`${p}-s`} name="saeule" defaultValue={ziel?.saeule ?? "beratung"}>
          {SAEULEN.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </AdminSelect>
      </AdminField>
      <AdminField label="Zielbetrag (€)" htmlFor={`${p}-z`}>
        <AdminInput id={`${p}-z`} name="zielbetrag" inputMode="decimal" required defaultValue={ziel ? (ziel.zielbetragCent / 100).toFixed(2).replace(".", ",") : ""} />
      </AdminField>
      <AdminField label="Frist" htmlFor={`${p}-f`}>
        <AdminInput id={`${p}-f`} name="frist" type="date" required defaultValue={ziel?.frist} />
      </AdminField>
      <div className="sm:col-span-2">
        <AdminField label="Notiz (optional)" htmlFor={`${p}-n`}>
          <AdminTextarea id={`${p}-n`} name="notiz" rows={2} defaultValue={ziel?.notiz ?? ""} />
        </AdminField>
      </div>
      <button className="bg-primary text-primary-foreground w-fit rounded-full px-5 py-2.5 text-sm font-semibold sm:col-start-2 sm:justify-self-end">
        {ziel ? "Speichern" : "Ziel anlegen"}
      </button>
    </form>
  )
}

export function ZieleListe({ ziele }: { ziele: Ziel[] }) {
  const aktiv = ziele.filter((z) => z.status === "aktiv")
  const erledigt = ziele.filter((z) => z.status !== "aktiv")
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="z-neu" className="bg-card flex flex-col gap-4 rounded-[2rem] p-6">
        <h2 id="z-neu" className="text-lg font-semibold">Neues Ziel</h2>
        <ZielForm />
      </section>

      <section aria-labelledby="z-aktiv" className="flex flex-col gap-3">
        <h2 id="z-aktiv" className="sr-only">Aktive Ziele</h2>
        {aktiv.length === 0 ? (
          <p className="bg-card text-muted-foreground rounded-3xl p-6 text-sm">Keine aktiven Ziele.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {aktiv.map((z) => (
              <ZielZeile key={z.id} ziel={z} />
            ))}
          </ul>
        )}
      </section>

      {erledigt.length > 0 && (
        <section aria-labelledby="z-fertig" className="flex flex-col gap-3">
          <h2 id="z-fertig" className="text-muted-foreground text-sm font-medium">Erreicht & verworfen</h2>
          <ul className="flex flex-col gap-3">
            {erledigt.map((z) => (
              <ZielZeile key={z.id} ziel={z} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

/** Dashboard-Kachel (Phase 1) — aktive Ziele mit Fortschritt, sortiert nach Frist. */
export function ZieleKachel({ ziele, basis }: { ziele: Ziel[]; basis: string }) {
  const aktiv = ziele.filter((z) => z.status === "aktiv")
  return (
    <section aria-labelledby="ziele-kachel" className="bg-card flex flex-col gap-4 rounded-[2rem] p-7">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="ziele-kachel" className="text-lg font-semibold">Ziele</h2>
        <a href={`${basis}/ziele`} className="text-primary text-sm font-semibold">Alle Ziele</a>
      </div>
      {aktiv.length === 0 ? (
        <p className="text-muted-foreground text-sm">Keine aktiven Ziele.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {aktiv.slice(0, 4).map((z) => (
            <li key={z.id} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate font-medium">
                  {z.titel} <span className="text-muted-foreground font-normal">· {LABEL[z.saeule] ?? z.saeule}</span>
                </span>
                <span className="text-muted-foreground shrink-0">{z.istPlatzhalter ? "Platzhalter" : eurRund(z.standCent)}</span>
              </div>
              {!z.istPlatzhalter && <Fortschrittsbalken ziel={z} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
