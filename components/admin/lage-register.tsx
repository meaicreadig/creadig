import { Pill, SectionHeader, Surface } from "@/components/admin/primitives"
import { adminTexte, type AdminSprache } from "@/lib/admin-i18n"
import { kontext, nichtErhoben, offen } from "@/lib/gedaechtnis"
import { WER_LABELS, reihenfolge } from "@/lib/navigator"

/**
 * Die Lage-Register — „Wie es steht“ und „Was daraus folgt“.
 *
 * ADM-01 (17.09.2026): vorher eine eigene Startfläche „Cockpit“ neben
 * „Heute“. Zwei Owner-Startseiten mit überlappender Frage sind eine zu viel;
 * die Übersicht beantwortet „was ist heute zu tun“, diese Register
 * beantworten „wie steht das Haus“ — und das gehört unter System.
 * Inhalt und Quellen (`gedaechtnis`, `navigator`) sind unverändert; die Seite
 * rechnet weiterhin nichts. Texte sind noch deutsch (offener Übersetzungsstand).
 */
export function LageRegister({ sprache = "de" }: { sprache?: AdminSprache }) {
  const t = adminTexte(sprache).lage
  const lagen = kontext()
  const stehen = lagen.filter((a) => a.steht === true)
  const nichtOk = offen()
  const unbekannt = nichtErhoben()
  const schritte = reihenfolge()

  return (
    <section id="lage" aria-labelledby="lage-titel" className="scroll-mt-8">
      <SectionHeader
        id="lage-titel"
        title={t.titel}
        count={t.count(stehen.length, nichtOk.length, unbekannt.length)}
      />
      <div>
        <h3 className="text-subhead mt-6 text-base">{t.wieEsSteht}</h3>
        <p className="type-small text-muted-foreground mt-2 max-w-2xl text-pretty">
          {t.wieEsStehtHinweis}
        </p>
        <ul className="mt-5 flex flex-col gap-3">
          {lagen.map((a) => (
            <li key={a.key}>
              <Surface padding="sm">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-subhead">{a.frage}</span>
                  <Pill severity={a.steht === false ? "attention" : "neutral"}>
                    {a.steht === true ? t.status.steht : a.steht === false ? t.status.offen : t.status.nichtErhoben}
                  </Pill>
                </div>
                <p className="type-small text-foreground/90 mt-2 text-pretty">{a.antwort}</p>
                <p className="type-small text-muted-foreground mt-2 text-pretty">
                  {a.belege.map((b) => `${b.woher} — ${b.was}`).join(" · ")}
                </p>
              </Surface>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <h3 className="text-subhead text-base">{t.wasDarausFolgt}</h3>
        <p className="type-small text-muted-foreground mt-2 max-w-2xl text-pretty">
          {t.wasDarausFolgtHinweis}
        </p>
        {schritte.length === 0 ? (
          <Surface padding="sm" className="mt-5">
            <p className="type-small text-foreground/90">{t.leer}</p>
          </Surface>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {schritte.map((v) => (
              <li key={v.key}>
                <Surface padding="sm">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <Pill severity={v.art === "messen" ? "neutral" : "attention"}>{v.art}</Pill>
                    <span className="type-small text-muted-foreground">{WER_LABELS[v.wer]}</span>
                  </div>
                  <p className="type-small text-foreground mt-2 text-pretty">{v.handlung}</p>
                  <p className="type-small text-muted-foreground mt-2 text-pretty">{v.weil}</p>
                </Surface>
              </li>
            ))}
          </ul>
        )}
      </div>

    </section>
  )
}
