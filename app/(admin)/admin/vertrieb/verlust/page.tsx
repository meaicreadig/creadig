import Link from "next/link"

import { Abschneidehinweis, Pill, SectionHeader, Surface } from "@/components/admin/primitives"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { getVertriebStore } from "@/lib/lead-store"
import { MUSTER_AB, marktRueckmeldung, unterDruck } from "@/lib/verlust"

/**
 * Vertrieb · Verlust-Schleife (G16) — UI zweisprachig; Lehrsätze aus dem
 * Verzeichnis bleiben in der Sprache, in der sie im Register stehen.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.verlust.titel }
}

export default async function VerlustPage() {
  const { t } = await adminSprachKontext()
  const store = getVertriebStore()
  if (!store) {
    return <VertriebShell title={t.verlust.titel} available={false}>{null}</VertriebShell>
  }

  const GRENZE = 500
  const verloren = await store.listOpportunities({ status: "lost", limit: GRENZE }).catch(() => null)
  if (!verloren) {
    return <VertriebShell title={t.verlust.titel} available={false}>{null}</VertriebShell>
  }
  const { rows, total } = verloren
  const schleife = marktRueckmeldung(rows.map((r) => r.lostReason))
  const druck = unterDruck(schleife)
  const gezaehlt = schleife.rueckmeldungen.reduce((n, r) => n + r.anzahl, 0)

  return (
    <VertriebShell
      title={t.verlust.titel}
      lead={t.verlust.lead}
      available
      meta={
        <>
          {t.verlust.meta(total, gezaehlt, schleife.ohneVerzeichnis, schleife.ohneGrund)}
        </>
      }
    >
      {gezaehlt === 0 ? (
        <Surface padding="sm">
          <p className="type-small text-foreground/90 text-pretty">{t.verlust.keinVerzeichnisGrund}</p>
          <p className="type-small text-muted-foreground mt-2 text-pretty">
            {total === 0 ? t.verlust.nochNichtsVerloren : t.verlust.altbestandHinweis}
          </p>
        </Surface>
      ) : (
        <>
          <Abschneidehinweis gezeigt={rows.length} grenze={GRENZE} wie={t.verlust.abschneideWie} />

          <section aria-labelledby="gruende-titel">
            <SectionHeader id="gruende-titel" title={t.verlust.wasGesagt} />
            <ul className="mt-4 flex flex-col gap-3">
              {schleife.rueckmeldungen.map((r) => (
                <li key={r.lehre.grund}>
                  <Surface padding="sm">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-subhead">
                        {t.begriffe.verlustGrund[r.lehre.grund] ?? r.lehre.grund}
                      </span>
                      <span className="type-stat">{r.anzahl}×</span>
                      <Pill severity={r.muster ? "attention" : "neutral"}>
                        {r.muster ? t.verlust.muster : t.verlust.beobachtungAb(MUSTER_AB)}
                      </Pill>
                    </div>
                    <p className="type-small text-foreground/90 mt-2 text-pretty">{r.lehre.bedeutet}</p>
                    <p className="type-small text-muted-foreground mt-2 text-pretty">{r.lehre.lehrt}</p>
                  </Surface>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="druck-titel" className="mt-10">
            <SectionHeader id="druck-titel" title={t.verlust.zielbildTitel} />
            <p className="type-small text-muted-foreground mt-2 text-pretty">{t.verlust.nurMuster}</p>
            {druck.length === 0 ? (
              <Surface padding="sm" className="mt-4">
                <p className="type-small text-foreground/90 text-pretty">{t.verlust.keinDruck}</p>
                <p className="type-small text-muted-foreground mt-2 text-pretty">
                  {t.verlust.keinDruckDetail}
                </p>
              </Surface>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {druck.map((d) => (
                  <li key={d.hypothese.key}>
                    <Surface padding="sm">
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className="text-subhead">
                          {t.hypothese.satz[d.hypothese.key as keyof typeof t.hypothese.satz] ?? d.hypothese.satz}
                        </span>
                        <Pill>{t.hypothese.status[d.hypothese.status as keyof typeof t.hypothese.status] ?? d.hypothese.status}</Pill>
                      </div>
                      <p className="type-small text-muted-foreground mt-2 text-pretty">
                        {t.verlust.beruehrtVon(
                          d.wegen
                            .map(
                              (w) =>
                                `${t.begriffe.verlustGrund[w.grund] ?? w.grund} (${w.anzahl}×)`,
                            )
                            .join(" · "),
                        )}
                      </p>
                      <p className="type-small text-foreground/90 mt-2 text-pretty">
                        <span className="text-subhead">{t.verlust.entscheidet}</span>
                        {t.hypothese.pruefen[d.hypothese.key as keyof typeof t.hypothese.pruefen] ?? d.hypothese.pruefen}
                      </p>
                      <p className="type-small text-muted-foreground mt-2 text-pretty">
                        {t.verlust.registerHinweis}
                      </p>
                    </Surface>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <p className="type-small text-muted-foreground mt-10 text-pretty">
        {t.verlust.fuss}{" "}
        <Link href="/admin/vertrieb/pipeline" className="underline">
          {t.verlust.zurPipeline}
        </Link>
        .
      </p>
    </VertriebShell>
  )
}
