import { AppleKalender } from "@/components/admin/apple-kalender"
import { appleQuelle, appleTermine } from "@/lib/termine/apple"
import Link from "next/link"

import {
  sperreAnlegen,
  sperreEntfernen,
  terminAbsagen,
  terminmailSenden,
  verfuegbarkeitSpeichern,
} from "@/app/(admin)/admin/termine/actions"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminSelect, SectionHeader, Surface } from "@/components/admin/primitives"
import { TerminmailEntwurf } from "@/components/admin/terminmail-entwurf"
import { sign } from "@/lib/hmac"
import { mailEingerichtet, siteUrl, terminZeitText } from "@/lib/termine/mail"
import { holeNachfassEntwurf } from "@/lib/termine/nachfass"
import {
  GESPRAECHSARTEN,
  einladungsKontakt,
  holeEinstellungen,
  kommendeTermine,
  sperren,
  termineVerfuegbar,
} from "@/lib/termine/store"
import { STANDARD_EINSTELLUNGEN } from "@/lib/termine/verfuegbarkeit"

export const dynamic = "force-dynamic"
export const metadata = { title: "Termine" }

const FELD =
  "border-line bg-background focus:border-gold w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors"
const KNOPF = "bg-gold text-background hover:bg-gold/90 inline-flex min-h-10 items-center rounded-md px-4 text-sm font-medium"
const LEISE = "border-line hover:bg-muted inline-flex min-h-10 items-center rounded-md border px-4 text-sm"
const TAGE = [
  ["1", "Montag"],
  ["2", "Dienstag"],
  ["3", "Mittwoch"],
  ["4", "Donnerstag"],
  ["5", "Freitag"],
  ["6", "Samstag"],
  ["0", "Sonntag"],
] as const
const SPERR_ART: Record<string, string> = { unavailable: "Nicht verfügbar", tentative: "Vorläufig", soft_hold: "Vorgemerkt" }

function vorname(name: string) {
  return name.trim().split(/\s+/)[0] ?? name
}

function entwurf(name: string, notiz: string | null) {
  return [
    `Hallo ${vorname(name)},`,
    notiz ? `danke für unser Gespräch – ${notiz.replace(/\.$/, "")}.` : "danke für unser Gespräch.",
    "Wie besprochen schlage ich ein kurzes Treffen vor. Wählen Sie hier einfach einen passenden Termin:\n{link}",
    "Viele Grüße\nMuhammed Emin Akyol\ncreaDIG",
  ].join("\n\n")
}

export default async function Page({ searchParams }: { searchParams: Promise<{ meldung?: string; kontakt?: string; entwurf?: string }> }) {
  const sp = await searchParams
  if (!termineVerfuegbar()) {
    return (
      <AdminShell title="Termine">
        <p className="text-muted-foreground text-sm">Speicher nicht verfügbar.</p>
      </AdminShell>
    )
  }
  let gestoert = false
  function stoerung<T>(p: Promise<T>, fallback: T): Promise<T> {
    return p.catch((e) => {
      console.error("[termine]", e instanceof Error ? e.message : e)
      gestoert = true
      return fallback
    })
  }

  const [einstellungen, liste, gesperrt, kontakt, nachfass] = await Promise.all([
    stoerung(holeEinstellungen(), STANDARD_EINSTELLUNGEN),
    stoerung(kommendeTermine(), []),
    stoerung(sperren(), []),
    sp.kontakt ? stoerung(einladungsKontakt(sp.kontakt), null) : Promise.resolve(null),
    sp.entwurf ? holeNachfassEntwurf(sp.entwurf).catch(() => null) : Promise.resolve(null),
  ])
  const secret = process.env.ADMIN_SESSION_SECRET?.trim()
  const feedKey = secret ? await sign("termine-feed", secret) : null
  const feedUrl = feedKey ? `${siteUrl().replace(/^https?:/, "webcal:")}/api/termine/feed?key=${feedKey}` : null
  const tz = einstellungen.timezone
  const [appleUrl, appleListe] = await Promise.all([appleQuelle().catch(() => null), appleTermine(7)])
  const apple = { quelle: appleUrl, termine: appleListe }

  return (
    <AdminShell title="Termine" lead="Verfügbarkeit, Sperren und gebuchte Gespräche — alles an einem Ort.">
      <div className="flex flex-col gap-8">
        <AppleKalender feedUrl={feedUrl} quelle={apple.quelle} termine={apple.termine} />
        {gestoert && (
          <p role="status" className="border-destructive/40 bg-destructive/10 text-foreground rounded-md border px-4 py-3 text-sm">
            Teile dieser Seite waren beim Laden kurz nicht erreichbar — bitte neu laden. Nichts wurde dabei verändert.
          </p>
        )}
        {sp.meldung && (
          <p role="status" className="border-gold/40 bg-gold/10 text-foreground rounded-md border px-4 py-3 text-sm">
            {sp.meldung}
          </p>
        )}

        {kontakt && (
          <Surface>
            <SectionHeader title={`Terminmail an ${kontakt.name}`} count={kontakt.firma ?? undefined} />
            {kontakt.gesperrt ? (
              <p className="text-sm leading-relaxed mt-4">Dieser Kontakt ist gesperrt ({kontakt.gesperrt}). Keine Mail möglich.</p>
            ) : (
              <form action={terminmailSenden} className="mt-4 flex flex-col gap-4">
                <input type="hidden" name="kontakt" value={kontakt.id} />
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="flex flex-col gap-1.5 text-sm">
                    Gesprächsart
                    <AdminSelect name="art" defaultValue="kennenlernen">
                      {Object.entries(GESPRAECHSARTEN).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label} · {v.dauer} Min.
                        </option>
                      ))}
                    </AdminSelect>
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    Nur diese Woche (ab)
                    <input type="date" name="woche" className={FELD} />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    Link gültig (Tage)
                    <input type="number" name="gueltig" min={1} max={30} defaultValue={10} className={FELD} />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5 text-sm">
                  Thema (intern)
                  <input name="thema" maxLength={160} className={FELD} placeholder="z. B. Website-Relaunch" />
                </label>
                <TerminmailEntwurf
                  kontaktId={kontakt.id}
                  startBetreff={nachfass?.kontaktId === kontakt.id ? nachfass.betreff : "Unser nächster Termin"}
                  startText={nachfass?.kontaktId === kontakt.id ? nachfass.text : entwurf(kontakt.name, kontakt.letzteNotiz)}
                />
                <p className="text-muted-foreground text-xs">
                  Empfänger: {kontakt.email ?? "keine E-Mail hinterlegt"}
                  {!mailEingerichtet() && " · Mailversand ist nicht eingerichtet"}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button type="submit" name="test" value="1" className={LEISE}>
                    Erst an mich testen
                  </button>
                  <button type="submit" disabled={!kontakt.email} className={`${KNOPF} disabled:opacity-50`}>
                    An {vorname(kontakt.name)} senden
                  </button>
                </div>
              </form>
            )}
          </Surface>
        )}

        <section aria-labelledby="t-kommend" className="flex flex-col gap-4">
          <SectionHeader id="t-kommend" title="Kommende Termine" count={liste.length} />
          {liste.length === 0 ? (
            <p className="text-muted-foreground text-sm">Noch keine Buchungen. Eine Terminmail startest du im Gesprächsraum am Kontakt.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {liste.map((t) => (
                <li key={t.id} className="border-line flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{terminZeitText(t, tz)}</p>
                    <p className="text-muted-foreground text-sm">
                      {GESPRAECHSARTEN[t.meetingKind as keyof typeof GESPRAECHSARTEN]?.label ?? t.meetingKind} · {t.guestName} ·{" "}
                      <span className="font-mono text-xs">{t.reference}</span>
                    </p>
                    {t.contactId && (
                      <Link prefetch={false} href={`/admin/gespraech?kontakt=${encodeURIComponent(t.contactId)}`} className="text-gold-text text-sm underline-offset-4 hover:underline">
                        Zum Kontakt
                      </Link>
                    )}
                  </div>
                  <form action={terminAbsagen} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={t.id} />
                    <input name="grund" maxLength={300} placeholder="Grund (optional)" aria-label="Absagegrund" className={`${FELD} md:w-48`} />
                    <button className={LEISE}>Absagen</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section aria-labelledby="t-woche" className="flex flex-col gap-4">
            <SectionHeader id="t-woche" title="Verfügbarkeit" count={tz} />
            <form action={verfuegbarkeitSpeichern} className="flex flex-col gap-3">
              {TAGE.map(([k, name]) => (
                <label key={k} className="grid grid-cols-[7rem_1fr] items-center gap-3 text-sm">
                  {name}
                  <input
                    name={`w${k}`}
                    className={`${FELD} font-mono`}
                    placeholder="frei"
                    defaultValue={(einstellungen.week[k] ?? []).map(([a, b]) => `${a}-${b}`).join(", ")}
                  />
                </label>
              ))}
              <div className="grid grid-cols-3 gap-3">
                <label className="flex flex-col gap-1.5 text-sm">
                  Puffer (Min.)
                  <input type="number" name="puffer" min={0} max={120} defaultValue={einstellungen.bufferMin} className={FELD} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  Vorlauf (Std.)
                  <input type="number" name="vorlauf" min={0} max={336} defaultValue={einstellungen.minNoticeHours} className={FELD} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  Voraus (Tage)
                  <input type="number" name="horizont" min={1} max={90} defaultValue={einstellungen.horizonDays} className={FELD} />
                </label>
              </div>
              <div>
                <button className={KNOPF}>Speichern</button>
              </div>
            </form>
          </section>

          <section aria-labelledby="t-sperren" className="flex flex-col gap-4">
            <SectionHeader id="t-sperren" title="Sperren & Urlaub" count={gesperrt.length} />
            <form action={sperreAnlegen} className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-sm">
                Von (Tag)
                <input type="date" name="tag_von" required className={FELD} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                Bis (Tag)
                <input type="date" name="tag_bis" className={FELD} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                Ab Uhrzeit
                <input type="time" name="zeit_von" className={FELD} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                Bis Uhrzeit
                <input type="time" name="zeit_bis" className={FELD} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                Art
                <AdminSelect name="art">
                  {Object.entries(SPERR_ART).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </AdminSelect>
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                Notiz
                <input name="label" maxLength={120} className={FELD} placeholder="z. B. Urlaub" />
              </label>
              <div className="col-span-2">
                <button className={KNOPF}>Sperre eintragen</button>
              </div>
            </form>
            {gesperrt.length > 0 && (
              <ul className="flex flex-col gap-2">
                {gesperrt.map((s) => (
                  <li key={s.id} className="border-line flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                    <span>
                      <span className="text-gold-text font-medium">{SPERR_ART[s.kind]}</span> ·{" "}
                      {new Date(s.startsAt).toLocaleString("de-DE", { timeZone: tz, dateStyle: "medium", timeStyle: "short" })} –{" "}
                      {new Date(s.endsAt).toLocaleString("de-DE", { timeZone: tz, dateStyle: "medium", timeStyle: "short" })}
                      {s.label ? ` · ${s.label}` : ""}
                    </span>
                    <form action={sperreEntfernen}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline">Entfernen</button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

      </div>
    </AdminShell>
  )
}
