import Link from "next/link"
import { after } from "next/server"
import { ArrowRight, Zap } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { AktionKnopf, AktionMeldung } from "@/components/admin/aktion-knopf"
import { Surface } from "@/components/admin/primitives"
import { adminSprache } from "@/lib/admin-i18n/server"
import { letzteLaeufe } from "@/lib/assistent/store"
import { ABTEILUNGEN } from "@/lib/zentrale/abteilungen"
import { berechneLeistung, MINUTEN_JE_ERGEBNIS, type AbteilungsLeistung } from "@/lib/zentrale/leistung"
import { pulsFaellig, pulsRunde } from "@/lib/zentrale/puls"

import { pulsJetzt } from "./actions"

export const metadata = { title: "Leistung & Engpässe" }
export const dynamic = "force-dynamic"
export const maxDuration = 300

const T = {
  de: {
    titel: "Leistung & Engpässe",
    lead: "Wie deine KI-Firma arbeitet: Arbeitszeit je Abteilung, Stabilität, Zusammenspiel, Eigeninitiative – und wo es klemmt. Der Puls löst Engpässe mehrmals täglich selbst.",
    note: "Firmen-Note",
    stunden: "Arbeit pro Tag",
    stundenHinweis: "Menschen-Äquivalent",
    rechen: "Rechenzeit pro Tag",
    rechenLeer: "Messung beginnt jetzt",
    stabil: "Stabilität",
    besetzt: "Abteilungen besetzt",
    engpaesse: "Engpässe",
    keineEngpaesse: "Keine Engpässe – alle Abteilungen laufen.",
    abteilungen: "Abteilungen · letzte 14 Tage",
    std: "Std./Tag",
    takt: "Takt-Treue",
    zusammen: "Zusammenarbeit",
    proaktiv: "Eigeninitiative",
    proTag: "/Tag",
    wartet: "wartet auf dich",
    nichtBesetzt: "Noch nicht besetzt",
    zusammenspiel: "Zusammenspiel",
    keinFluss: "Noch keine Übergaben zwischen Abteilungen.",
    puls: "Puls jetzt",
    pulsLaeuft: "Puls läuft …",
    letzterPuls: "Letzter Puls",
    nie: "noch nie",
    methode: "So wird gerechnet",
    methodeText:
      "Rechenzeit = gemessene Laufzeit der Agenten. Menschen-Äquivalent = Ergebnisse × übliche Minuten, die ein Mensch dafür bräuchte. Stabilität = erfolgreiche Läufe. Takt-Treue = Läufe im Verhältnis zum Plan. Zusammenarbeit = erledigte Aufträge anderer Abteilungen. Note = gewichteter Mittelwert (35/35/15/15).",
    min: "Min.",
    zuletzt: "zuletzt",
    oeffnen: "Zur Entscheidung",
  },
  tr: {
    titel: "Performans ve Tıkanıklık",
    lead: "Yapay zekâ şirketin nasıl çalışıyor: departman başına çalışma süresi, istikrar, uyum, proaktiflik – ve nerede tıkanıyor. Nabız tıkanıklıkları günde birkaç kez kendisi çözer.",
    note: "Şirket notu",
    stunden: "Günlük çalışma",
    stundenHinweis: "insan eşdeğeri",
    rechen: "Günlük işlem süresi",
    rechenLeer: "Ölçüm şimdi başlıyor",
    stabil: "İstikrar",
    besetzt: "Dolu departman",
    engpaesse: "Tıkanıklıklar",
    keineEngpaesse: "Tıkanıklık yok – tüm departmanlar çalışıyor.",
    abteilungen: "Departmanlar · son 14 gün",
    std: "saat/gün",
    takt: "Takt sadakati",
    zusammen: "Uyum",
    proaktiv: "Proaktiflik",
    proTag: "/gün",
    wartet: "seni bekliyor",
    nichtBesetzt: "Henüz dolu değil",
    zusammenspiel: "Departmanlar arası akış",
    keinFluss: "Henüz departmanlar arası devir yok.",
    puls: "Nabzı şimdi at",
    pulsLaeuft: "Nabız çalışıyor …",
    letzterPuls: "Son nabız",
    nie: "henüz yok",
    methode: "Nasıl hesaplanır",
    methodeText:
      "İşlem süresi = ajanların ölçülen çalışma süresi. İnsan eşdeğeri = sonuç × bir insanın harcayacağı ortalama dakika. İstikrar = başarılı çalışmalar. Takt sadakati = plana göre çalışma oranı. Uyum = diğer departmanlardan gelen işlerin tamamlanma oranı. Not = ağırlıklı ortalama (35/35/15/15).",
    min: "dk",
    zuletzt: "son",
    oeffnen: "Karara git",
  },
} as const

const prozent = (x: number | null) => (x == null ? "–" : `${Math.round(x * 100)} %`)

function NoteBalken({ note }: { note: number | null }) {
  const farbe = note == null ? "bg-muted" : note >= 75 ? "bg-primary" : note >= 50 ? "bg-chart-4" : "bg-destructive"
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className={`h-full rounded-full ${farbe}`} style={{ width: `${note ?? 0}%` }} />
      </div>
      <span className="w-8 text-right font-mono text-sm tabular-nums text-foreground">{note ?? "–"}</span>
    </div>
  )
}

export default async function LeistungSeite() {
  const sprache = await adminSprache()
  const t = T[sprache]
  const intl = sprache === "tr" ? "tr-TR" : "de-DE"
  const [leistung, laeufe] = await Promise.all([berechneLeistung().catch(() => null), letzteLaeufe().catch(() => ({}))])
  const puls = (laeufe as Awaited<ReturnType<typeof letzteLaeufe>>)["puls"]

  after(async () => {
    if (await pulsFaellig().catch(() => false)) await pulsRunde().catch(() => undefined)
  })

  const zeit = (iso: string) =>
    new Date(iso).toLocaleString(intl, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" })
  const name = (id: string) => ABTEILUNGEN.find((a) => a.id === id)?.name[sprache] ?? id

  if (!leistung) {
    return (
      <AdminShell title={t.titel} lead={t.lead}>
        <Surface>
          <p className="text-sm text-muted-foreground">Keine Datenbank verbunden.</p>
        </Surface>
      </AdminShell>
    )
  }

  const s = leistung.summe
  const besetzt = leistung.abteilungen.filter((a) => a.besetzt).sort((a, b) => (b.note ?? -1) - (a.note ?? -1))
  const leer = leistung.abteilungen.filter((a) => !a.besetzt)

  const kennzahlen = [
    { label: t.note, wert: s.note == null ? "–" : String(s.note), zusatz: "/ 100" },
    { label: t.stunden, wert: s.aequivalentStundenTag.toLocaleString(intl, { maximumFractionDigits: 1 }), zusatz: `Std. · ${t.stundenHinweis}` },
    {
      label: t.rechen,
      wert: s.rechenMinutenTag == null ? "–" : s.rechenMinutenTag.toLocaleString(intl, { maximumFractionDigits: 1 }),
      zusatz: s.rechenMinutenTag == null ? t.rechenLeer : t.min,
    },
    { label: t.stabil, wert: prozent(s.stabilitaet), zusatz: `${s.laeufe} Läufe` },
    { label: t.besetzt, wert: `${s.besetzt}`, zusatz: `/ ${s.gesamt}` },
  ]

  return (
    <AdminShell title={t.titel} lead={t.lead}>
      <AktionMeldung />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {t.letzterPuls}: {puls ? `${zeit(puls.zeit)} · ${puls.ergebnis}` : t.nie}
          </p>
          <form action={pulsJetzt}>
            <AktionKnopf laeuft={t.pulsLaeuft} className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
              <Zap className="size-4" aria-hidden />
              {t.puls}
            </AktionKnopf>
          </form>
        </div>

        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {kennzahlen.map((k) => (
            <Surface key={k.label} className="flex flex-col gap-2">
              <dt className="text-xs text-muted-foreground">{k.label}</dt>
              <dd className="flex items-baseline gap-1.5">
                <span className="font-sans text-3xl font-semibold tabular-nums text-primary">{k.wert}</span>
                <span className="text-xs text-muted-foreground">{k.zusatz}</span>
              </dd>
            </Surface>
          ))}
        </dl>

        <Surface className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-sans text-lg font-semibold text-foreground">{t.engpaesse}</h2>
            <span className="rounded-full bg-muted px-3 py-1 font-mono text-xs text-foreground">{leistung.engpaesse.length}</span>
          </div>
          {leistung.engpaesse.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.keineEngpaesse}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {leistung.engpaesse.slice(0, 12).map((e) => (
                <li key={e.id} className="flex flex-col gap-2 rounded-2xl bg-muted/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${e.schwere === "stoerung" ? "bg-destructive" : "bg-chart-4"}`}
                      aria-label={e.schwere}
                    />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">{name(e.abteilung)}</span>
                      <span className="text-sm leading-relaxed text-foreground text-pretty">{e.text[sprache]}</span>
                    </div>
                  </div>
                  {e.art === "wartet_auf_dich" && (
                    <Link href="/admin/assistent" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                      {t.oeffnen}
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Surface>

        <section className="flex flex-col gap-4" aria-labelledby="abt-titel">
          <h2 id="abt-titel" className="font-sans text-lg font-semibold text-foreground">
            {t.abteilungen}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {besetzt.map((a) => (
              <AbteilungKarte key={a.id} a={a} t={t} sprache={sprache} zeit={zeit} />
            ))}
          </div>
          {leer.length > 0 && (
            <Surface className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">{t.nichtBesetzt}</h3>
              <div className="flex flex-wrap gap-2">
                {leer.map((a) => (
                  <span key={a.id} className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                    {a.name[sprache]}
                  </span>
                ))}
              </div>
            </Surface>
          )}
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Surface className="flex flex-col gap-4">
            <h2 className="font-sans text-lg font-semibold text-foreground">{t.zusammenspiel}</h2>
            {leistung.fluesse.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.keinFluss}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {leistung.fluesse.slice(0, 10).map((f) => (
                  <li key={`${f.von}-${f.an}`} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-foreground">
                      <span className="truncate">{name(f.von)}</span>
                      <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden />
                      <span className="truncate">{name(f.an)}</span>
                    </span>
                    <span className="font-mono tabular-nums text-muted-foreground">{f.anzahl}</span>
                  </li>
                ))}
              </ul>
            )}
          </Surface>
          <Surface className="flex flex-col gap-3">
            <h2 className="font-sans text-lg font-semibold text-foreground">{t.methode}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{t.methodeText}</p>
            <p className="font-mono text-xs leading-relaxed text-muted-foreground">
              {Object.entries(MINUTEN_JE_ERGEBNIS)
                .filter(([k]) => k !== "koordination")
                .map(([k, v]) => `${k} ${v}`)
                .join(" · ")}
            </p>
          </Surface>
        </div>
      </div>
    </AdminShell>
  )
}

function AbteilungKarte({
  a,
  t,
  sprache,
  zeit,
}: {
  a: AbteilungsLeistung
  t: (typeof T)[keyof typeof T]
  sprache: "de" | "tr"
  zeit: (iso: string) => string
}) {
  const werte = [
    { label: t.stabil, wert: prozent(a.stabilitaet) },
    { label: t.takt, wert: prozent(a.taktTreue) },
    { label: t.zusammen, wert: a.auftraegeErhalten ? `${a.auftraegeErledigt}/${a.auftraegeErhalten}` : "–" },
    { label: t.proaktiv, wert: `${a.proaktivTag.toLocaleString(sprache, { maximumFractionDigits: 1 })}${t.proTag}` },
  ]
  return (
    <Surface className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="font-sans text-base font-semibold text-foreground text-balance">{a.name[sprache]}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {a.agenten.join(" · ")}
            {a.letzteAktivitaet ? ` · ${t.zuletzt} ${zeit(a.letzteAktivitaet)}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="font-sans text-2xl font-semibold tabular-nums text-primary">
            {a.aequivalentStundenTag.toLocaleString(sprache, { maximumFractionDigits: 1 })}
          </span>
          <span className="text-xs text-muted-foreground">{t.std}</span>
        </div>
      </div>
      <NoteBalken note={a.note} />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        {werte.map((w) => (
          <div key={w.label} className="flex items-center justify-between gap-2 text-sm">
            <dt className="text-muted-foreground">{w.label}</dt>
            <dd className="font-mono tabular-nums text-foreground">{w.wert}</dd>
          </div>
        ))}
      </dl>
      {(a.engpaesse.length > 0 || a.wartetAufDich > 0) && (
        <p className="text-xs text-muted-foreground">
          {a.engpaesse.length > 0 && <span className="text-destructive">{a.engpaesse.length} {t.engpaesse}</span>}
          {a.engpaesse.length > 0 && a.wartetAufDich > 0 && " · "}
          {a.wartetAufDich > 0 && `${a.wartetAufDich} ${t.wartet}`}
        </p>
      )}
    </Surface>
  )
}
