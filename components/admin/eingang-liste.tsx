import { ART_TEXT, type Eingang } from "@/lib/eingang"

const TON: Record<Eingang["art"], string> = {
  interessiert: "bg-primary text-primary-foreground",
  spaeter: "bg-accent text-accent-foreground",
  nein: "bg-muted text-muted-foreground",
  falsche_person: "bg-secondary text-secondary-foreground",
  abwesend: "bg-muted text-muted-foreground",
  sonstiges: "bg-secondary text-secondary-foreground",
  unzugeordnet: "bg-muted text-muted-foreground",
}

const zeit = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })

export function EingangListe({ eintraege, aktiv }: { eintraege: Eingang[]; aktiv: boolean }) {
  return (
    <section id="eingang" aria-labelledby="eingang-titel" className="flex scroll-mt-6 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="eingang-titel" className="font-sans text-xl font-semibold text-foreground">
          Antworten von Kunden
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Das System liest jede Antwort, stoppt das Nachfassen, bewegt die Verkaufschance und legt dir einen Antwortentwurf zur Freigabe hin.
        </p>
      </div>

      {!aktiv ? (
        <p className="rounded-3xl bg-card px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          Der Eingang ist noch nicht eingeschaltet. Sobald die Empfangsadresse bei Resend steht, kommen Antworten hier automatisch an.
        </p>
      ) : eintraege.length === 0 ? (
        <p className="rounded-3xl bg-card px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          Noch keine Antworten. Neue Mails werden alle paar Minuten abgeholt.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {eintraege.map((e) => (
            <li key={e.id} className="flex flex-col gap-2 rounded-3xl bg-card px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${TON[e.art]}`}>{ART_TEXT[e.art]}</span>
                <span className="text-sm font-medium text-foreground">{e.von}</span>
                <span className="ml-auto font-mono text-xs text-muted-foreground">{zeit(e.zeit)}</span>
              </div>
              {e.zusammenfassung ? <p className="text-pretty text-sm leading-relaxed text-foreground">{e.zusammenfassung}</p> : null}
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer">Originaltext</summary>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed">{e.text || "(leer)"}</p>
              </details>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {e.entwurfId ? (
                  <a href={`#frg-${e.entwurfId}`} className="rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground">
                    Entwurf freigeben
                  </a>
                ) : null}
                {e.wiedervorlageAm ? <span>Wiedervorlage am {new Date(e.wiedervorlageAm).toLocaleDateString("de-DE")}</span> : null}
                {e.art === "unzugeordnet" ? <span>Keiner gesendeten Mail zuzuordnen</span> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
