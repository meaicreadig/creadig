import { SectionHeader } from "@/components/admin/primitives"
import type { AdminTexte } from "@/lib/admin-i18n"
import { GESCHAEFTS_ZEITZONE } from "@/lib/geschaeftszeit"
import type { Activity } from "@/lib/vertrieb"

/**
 * Die Chronik eines Datensatzes (ADM-03).
 *
 * ---------------------------------------------------------------------------
 * GERENDERT AUS DATEN, NICHT AUS EINEM GESPEICHERTEN SATZ
 * Seit Migration 017 trägt jede Zeile `kind`, `data` (z. B. `{ von, nach }`),
 * `actor` und `origin`. Die Oberfläche setzt daraus den Satz in IHRER Sprache
 * zusammen. Zeilen von davor haben nur den deutschen `summary` — der wird
 * gezeigt, wie er ist, und Akteur/Herkunft heißen „unbekannt“: Unbekannt ist
 * nicht „System“.
 *
 * Mensch, System, Automation und Integration sind sichtbar getrennt — die
 * Frage „hat das jemand getan oder ist es passiert?“ gehört zu jeder Zeile.
 *
 * SYNCHRON, TEXTE ALS PROPS: Eine eigene asynchrone Sprachabfrage (Cookies,
 * Header) tief im Baum ließ die Anzeige nach dem Speichern veralten —
 * gemessen per Halbierung 17.09.2026 (9/10 → 6/10 allein durch diese Datei).
 * Die Seite liest die Sprache einmal und reicht sie herunter.
 */
export function ActivityLog({ entries, t, intl }: { entries: Activity[]; t: AdminTexte; intl: string }) {
  return (
    <section aria-labelledby="chronik-titel">
      <SectionHeader id="chronik-titel" title={t.chronik.titel} as="h3" />
      {entries.length === 0 ? (
        <p className="type-small text-muted-foreground mt-4 text-pretty">{t.chronik.leer}</p>
      ) : (
        <ol className="mt-4 flex flex-col">
          {entries.map((entry) => {
            const { satz, zusatz } = beschreibe(entry, t)
            return (
              <li key={entry.id} className="border-line flex flex-wrap gap-x-4 gap-y-1 border-b py-3 last:border-b-0" data-art={entry.kind} data-herkunft={entry.origin ?? "unbekannt"}>
                <time dateTime={entry.createdAt} className="text-meta text-muted-foreground w-28 shrink-0 tabular-nums">
                  {zeitpunkt(entry.createdAt, intl)}
                </time>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{satz}</p>
                  {zusatz ? <p className="type-small text-muted-foreground mt-0.5 text-pretty">{zusatz}</p> : null}
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {t.chronik.durch(werIst(entry.actor, t), entry.origin ? (t.begriffe.herkunft[entry.origin] ?? entry.origin) : t.begriffe.unbekannt)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

function werIst(actor: string | null, t: AdminTexte): string {
  if (!actor) return t.begriffe.unbekannt
  return t.begriffe.rolle[actor] ?? t.begriffe.akteur[actor] ?? actor
}

function beschreibe(entry: Activity, t: AdminTexte): { satz: string; zusatz: string | null } {
  const d = entry.data
  const art = t.chronik.art[entry.kind]
  /* Vor 017 oder unbekannte Art: der gespeicherte Satz, unverändert. */
  if (!d || !art) return { satz: entry.summary, zusatz: entry.detail }
  const satz = art(entry.kind === "lead.received" && typeof d.quelle === "string" ? { quelle: t.begriffe.quelle[d.quelle] ?? d.quelle } : d)
  let zusatz: string | null = null
  if (typeof d.von === "string" && typeof d.nach === "string") {
    zusatz = t.chronik.vonNach(t.begriffe.stufe[d.von] ?? d.von, t.begriffe.stufe[d.nach] ?? d.nach)
    if (typeof d.grund === "string") zusatz += ` · ${t.begriffe.verlustGrund[d.grund] ?? d.grund}`
  } else if (entry.kind.endsWith(".responsible")) {
    zusatz = typeof d.nach === "string" ? (t.begriffe.rolle[d.nach] ?? d.nach) : t.begriffe.niemand
  } else if (entry.kind === "lead.archived" && typeof d.grund === "string") {
    zusatz = t.begriffe.archivGrund[d.grund] ?? d.grund
  } else if (entry.kind === "lead.nextAction") {
    zusatz = [d.schritt, d.am].filter((x) => typeof x === "string" && x).join(" · ") || null
  } else if (entry.kind === "lead.created" && typeof d.quelle === "string") {
    zusatz = t.begriffe.quelle[d.quelle] ?? d.quelle
  }
  return { satz, zusatz }
}

function zeitpunkt(iso: string, intl: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(intl, { timeZone: GESCHAEFTS_ZEITZONE, day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })
}
